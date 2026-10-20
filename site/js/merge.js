/* 기기 간 동기화용 병합 규칙 (순수 함수 — 화면·저장소와 무관해서 단독으로 테스트할 수 있어요)
 *
 * 동기화되는 것: 풀이 기록, 메모, 북마크, 학습 활동, 설정
 * 동기화되지 않는 것: 화면 모드(theme), 메모 패널 열림 상태(memoOpen) — 기기마다 다르게 쓰는 값이라서
 *
 * 규칙
 *  - epoch(초기화·백업 가져오기 시각)가 더 큰 쪽이 통째로 이겨요. 초기화한 기록이 다른 기기에서 되살아나지 않게 하려는 거예요.
 *  - epoch가 같으면 합쳐요.
 *    · 풀이 기록: 제출된 쪽 > 더 최근에 수정한 쪽. 버린 기록은 gone(삭제 시각)에 남겨서 되살아나지 않게 해요
 *    · 메모·북마크: 항목마다 mt(수정 시각)가 더 큰 쪽. 지운 것도 mt에 시각이 남아요
 *    · 학습 활동: 날짜별로 큰 값
 *    · 설정: settingsAt이 더 큰 쪽
 */
(function (root) {
  'use strict';

  var SYNCED = ['attempts', 'memos', 'bookmarks', 'activity', 'settings', 'settingsAt', 'mt', 'gone', 'epoch'];

  function num(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  function empty() {
    return { attempts: {}, memos: {}, bookmarks: {}, activity: {}, settings: {}, settingsAt: 0, mt: {}, gone: {}, epoch: 0 };
  }

  /* db 에서 동기화 대상만 뽑는다 (복사하지 않고 같은 객체를 가리킨다) */
  function pack(db) {
    var o = empty();
    SYNCED.forEach(function (k) { if (db && db[k] !== undefined && db[k] !== null) o[k] = db[k]; });
    return o;
  }

  function maxMap(a, b) {
    var out = {};
    [a, b].forEach(function (m) {
      Object.keys(m || {}).forEach(function (k) { var v = num(m[k]); if (!has(out, k) || v > out[k]) out[k] = v; });
    });
    return out;
  }

  function pickAttempt(l, r) {
    if (!!l.submitted !== !!r.submitted) return l.submitted ? l : r;
    return num(r.updatedAt) > num(l.updatedAt) ? r : l;
  }

  /* 메모·북마크처럼 키마다 시각이 붙은 맵을 합친다 */
  function mergeStamped(prefix, lm, rm, lmt, rmt) {
    var out = {};
    var keys = {};
    Object.keys(lm).forEach(function (k) { keys[k] = 1; });
    Object.keys(rm).forEach(function (k) { keys[k] = 1; });
    Object.keys(keys).forEach(function (k) {
      var inL = has(lm, k), inR = has(rm, k);
      var lt = num(lmt[prefix + k]), rt = num(rmt[prefix + k]);
      if (inL && inR) out[k] = lt >= rt ? lm[k] : rm[k];
      else if (inL) { if (lt >= rt) out[k] = lm[k]; }  // 상대가 더 늦게 지웠으면 지운 걸로
      else if (rt >= lt) out[k] = rm[k];
    });
    return out;
  }

  /* opts.keepLocal: 지금 풀고 있는 기록 id — 다른 기기 내용으로 바뀌지 않게 이쪽을 우선한다 */
  function merge(local, remote, opts) {
    var l = Object.assign(empty(), local), r = Object.assign(empty(), remote);
    opts = opts || {};
    var le = num(l.epoch), re = num(r.epoch);
    if (re > le) return r;
    if (le > re) return l;

    var out = empty();
    out.epoch = le;
    out.gone = maxMap(l.gone, r.gone);
    out.mt = maxMap(l.mt, r.mt);

    var ids = {};
    Object.keys(l.attempts).forEach(function (k) { ids[k] = 1; });
    Object.keys(r.attempts).forEach(function (k) { ids[k] = 1; });
    Object.keys(ids).forEach(function (id) {
      var a = l.attempts[id], b = r.attempts[id], pick;
      if (a && b) pick = opts.keepLocal === id ? a : pickAttempt(a, b);
      else pick = a || b;
      var g = out.gone[id];
      if (g && g >= num(pick.updatedAt)) return;
      out.attempts[id] = pick;
    });

    out.memos = mergeStamped('m:', l.memos, r.memos, l.mt, r.mt);
    out.bookmarks = mergeStamped('b:', l.bookmarks, r.bookmarks, l.mt, r.mt);
    out.activity = maxMap(l.activity, r.activity);
    if (num(r.settingsAt) > num(l.settingsAt)) { out.settings = r.settings; out.settingsAt = r.settingsAt; }
    else { out.settings = l.settings; out.settingsAt = num(l.settingsAt); }
    return out;
  }

  var api = { SYNCED: SYNCED, empty: empty, pack: pack, merge: merge };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GigulMerge = api;
})(typeof window !== 'undefined' ? window : this);
