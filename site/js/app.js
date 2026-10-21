(function () {
  'use strict';

  /* ───────── 기본 설정 ───────── */
  var EXAMS = window.EXAMS || [];
  /* 기능 스위치: false 인 기능은 화면에서만 숨기고 코드와 데이터는 그대로 둔다. 다시 쓰려면 true 로 바꾼다. */
  var FEATURES = {
    explanations: true, // 해설 문장
    planner: false,      // 플래너 홈 (D-day, 주간 목표, 오늘 할 일)
    memos: false,        // 내 메모 모아보기 (풀이 화면의 메모는 그대로 사용 가능)
    settings: false      // 설정 (시험일, 화면 모드, 백업/초기화)
  };
  var $app = document.getElementById('app');
  var KEY = 'gigul-note.v1';
  var CIRC = ['①', '②', '③', '④'];
  var storageOk = true;
  /* 로그인 상태: state = off | syncing | ok | offline | error */
  var acct = { user: null, state: 'off', busy: false };
  var Cloud = window.GigulCloud, Merge = window.GigulMerge;

  var IC = {
    menu: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    left: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    star: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    starOn: '<svg class="icon" viewBox="0 0 24 24" fill="#e6a100" stroke="#e6a100" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    clock: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pen: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    calc: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>',
    sun: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    target: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/></svg>',
    books: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4v16M10 4v16M15 5l4 .8-3 14.2-4-.8z"/></svg>',
    bookmark: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 4h10v16l-5-3-5 3z"/></svg>',
    notebook: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M12 8h4M12 12h4"/></svg>',
    chart: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
    gear: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
    play: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 5l12 7-12 7z"/></svg>',
    repeat: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l3 3-3 3M4 11V9a3 3 0 013-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 01-3 3H4"/></svg>',
    flame: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></svg>',
    chev: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
  };

  /* ───────── 저장소 ───────── */
  /* mt·gone·epoch·settingsAt 은 기기 간 동기화용 표시(js/merge.js), uid 는 이 기기 기록이 누구 것인지 */
  function blankDb() {
    return { attempts: {}, memos: {}, bookmarks: {}, theme: null, activity: {}, settings: {}, lastExport: null, memoOpen: true,
      mt: {}, gone: {}, epoch: 0, settingsAt: 0, uid: null };
  }
  function loadDb() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          var d = blankDb();
          Object.keys(d).forEach(function (k) { if (parsed[k] !== undefined) d[k] = parsed[k]; });
          return d;
        }
      }
    } catch (e) { /* 저장소를 못 읽으면 빈 상태로 시작 */ }
    return blankDb();
  }
  var db = loadDb();
  try { localStorage.setItem(KEY + '.probe', '1'); localStorage.removeItem(KEY + '.probe'); } catch (e) { storageOk = false; }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { storageOk = false; }
    if (acct.user) scheduleSync();
  }
  var saveTimer = null;

  /* 메모·북마크·풀이 기록을 바꿀 때는 이 함수들로 — 기기 간 동기화에 필요한 수정 시각을 함께 남긴다 */
  function setMemo(key, text) {
    if (text && text.trim()) db.memos[key] = text; else delete db.memos[key];
    db.mt['m:' + key] = Date.now();
  }
  function setBookmark(key, on) {
    if (on) db.bookmarks[key] = true; else delete db.bookmarks[key];
    db.mt['b:' + key] = Date.now();
  }
  function dropAttempt(id) { delete db.attempts[id]; db.gone[id] = Date.now(); }
  function touchSettings(v) { db.settings = v; db.settingsAt = Date.now(); }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 350); }

  /* ───────── 유틸 ───────── */
  /* 간단한 마크다운 → HTML 변환 (해설용) */
  function renderMd(s) {
    if (!s) return '';
    var lines = String(s).split('\n');
    var out = [], inTable = false, inList = false;
    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      /* 빈 줄 */
      if (!L.trim()) {
        if (inTable) { out.push('</table>'); inTable = false; }
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('');
        continue;
      }
      /* 표: | col | col | */
      if (/^\|/.test(L.trim())) {
        var cells = L.trim().replace(/^\||\|$/g, '').split('|').map(function(c){ return c.trim(); });
        /* 구분선 |---|---| → 무시 */
        if (/^[\s|:-]+$/.test(L.trim().replace(/\|/g,''))) continue;
        if (!inTable) { out.push('<table class="exp-table">'); inTable = true; }
        var tag = (!inTable || out[out.length - 1] === '<table class="exp-table">') ? 'th' : 'td';
        /* 첫 행 = 헤더, 나머지 = body */
        var rowIdx = 0;
        for (var k = out.length - 1; k >= 0; k--) {
          if (out[k] === '<table class="exp-table">') break;
          if (/<tr>/.test(out[k])) rowIdx++;
        }
        tag = rowIdx === 0 ? 'th' : 'td';
        out.push('<tr>' + cells.map(function(c){ return '<' + tag + '>' + inlineMd(c) + '</' + tag + '>'; }).join('') + '</tr>');
        continue;
      }
      if (inTable) { out.push('</table>'); inTable = false; }
      /* 리스트: · 또는 - 시작 */
      if (/^[·\-•]\s/.test(L.trim())) {
        if (!inList) { out.push('<ul class="exp-list">'); inList = true; }
        out.push('<li>' + inlineMd(L.trim().replace(/^[·\-•]\s*/, '')) + '</li>');
        continue;
      }
      if (inList) { out.push('</ul>'); inList = false; }
      /* 제목: ### 또는 ## */
      if (/^###\s/.test(L.trim())) { out.push('<h4 class="exp-h">' + inlineMd(L.trim().replace(/^###\s*/, '')) + '</h4>'); continue; }
      if (/^##\s/.test(L.trim())) { out.push('<h3 class="exp-h">' + inlineMd(L.trim().replace(/^##\s*/, '')) + '</h3>'); continue; }
      /* 인용: > */
      if (/^>\s?/.test(L.trim())) { out.push('<blockquote class="exp-quote">' + inlineMd(L.trim().replace(/^>\s?/, '')) + '</blockquote>'); continue; }
      /* 일반 텍스트 */
      out.push('<p class="exp-p">' + inlineMd(L.trim()) + '</p>');
    }
    if (inTable) out.push('</table>');
    if (inList) out.push('</ul>');
    return out.join('\n');
  }
  /* 인라인 마크다운: **볼드**, 숫자 강조, ₩기호 */
  function inlineMd(s) {
    s = esc(s);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/`(.+?)`/g, '<code class="exp-code">$1</code>');
    return s;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function fmtDate(ts) {
    var d = new Date(ts);
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  function getExam(id) { return EXAMS.filter(function (e) { return e.id === id; })[0]; }
  function qOf(exam, no) { return exam.questions.filter(function (q) { return q.no === no; })[0]; }
  function memoKey(examId, no) { return examId + ':' + no; }
  function modeLabel(a) { return a.mode === 'exam' ? '실전' : (a.daily ? '오늘의 한 문제' : (a.retry ? '오답 복습' : '연습')); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseYmd(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
  }
  function todayMidnight() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  function uid() { return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  EXAMS.forEach(function (ex) {
    ex.questions.forEach(function (q) {
      if (!q.choices || q.choices.length !== 4 || !(q.answer >= 1 && q.answer <= 4)) {
        console.warn('문제 데이터 확인 필요:', ex.id, q.no);
      }
    });
  });

  /* ───────── 테마 ───────── */
  function currentTheme() {
    return db.theme || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function applyTheme() { document.documentElement.setAttribute('data-theme', currentTheme()); }
  function toggleTheme() { db.theme = currentTheme() === 'dark' ? 'light' : 'dark'; applyTheme(); save(); route(); }
  applyTheme();

  /* ───────── 채점 ───────── */
  function grade(a, exam) {
    var items = a.order.map(function (no) {
      var q = qOf(exam, no), sel = a.answers[no];
      var status = sel == null ? 'skip' : (sel === q.answer ? 'ok' : 'bad');
      return { no: no, q: q, sel: sel, status: status };
    });
    var ok = items.filter(function (i) { return i.status === 'ok'; }).length;
    var bad = items.filter(function (i) { return i.status === 'bad'; }).length;
    var skip = items.length - ok - bad;
    return { items: items, ok: ok, bad: bad, skip: skip, total: items.length, score: Math.round(ok / items.length * 100) };
  }
  function submittedAttempts(examId) {
    return Object.keys(db.attempts).map(function (k) { return db.attempts[k]; })
      .filter(function (a) { return a.examId === examId && a.submitted; })
      .sort(function (x, y) { return x.finishedAt - y.finishedAt; });
  }
  /* 오답 복습 일정: 틀리면 다음 날, 맞히면 3일 뒤 → 7일 뒤, 세 번 맞히면 "익힌 문제".
     제출된 풀이를 시간순으로 다시 계산하므로 따로 저장하지 않는다. */
  var REVIEW_DAYS = [1, 3, 7];
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function dayDiff(a, b) { return Math.round((a - b) / 86400000); }
  function reviewStates(exam) {
    var st = {};
    submittedAttempts(exam.id).forEach(function (a) {
      var f = new Date(a.finishedAt), base = new Date(f.getFullYear(), f.getMonth(), f.getDate());
      grade(a, exam).items.forEach(function (i) {
        var s = st[i.no];
        if (i.status === 'bad') {
          if (!s) s = st[i.no] = { stage: 0, wrong: 0 };
          s.stage = 0; s.wrong++; s.mastered = false; s.due = addDays(base, REVIEW_DAYS[0]); s.last = base;
        } else if (i.status === 'ok' && s && !s.mastered) {
          s.stage++; s.last = base;
          if (s.stage >= REVIEW_DAYS.length) { s.mastered = true; s.due = null; }
          else s.due = addDays(base, REVIEW_DAYS[s.stage]);
        }
      });
    });
    return st;
  }
  function wrongNos(exam) {
    var st = reviewStates(exam);
    return Object.keys(st).filter(function (n) { return !st[n].mastered; }).map(Number).sort(function (x, y) { return x - y; });
  }
  function dueNos(exam) {
    var st = reviewStates(exam), t = todayMidnight();
    return Object.keys(st).filter(function (n) { return !st[n].mastered && st[n].due <= t; }).map(Number).sort(function (x, y) { return x - y; });
  }
  function latestAttemptWith(exam, no) {
    var list = submittedAttempts(exam.id).filter(function (a) { return a.order.indexOf(no) >= 0; });
    return list.length ? list[list.length - 1] : null;
  }
  function openAttempt(examId) {
    var list = Object.keys(db.attempts).map(function (k) { return db.attempts[k]; })
      .filter(function (a) { return a.examId === examId && !a.submitted; });
    list.sort(function (x, y) { return (y.updatedAt || 0) - (x.updatedAt || 0); });
    return list[0] || null;
  }

  /* ───────── 플래너 집계 (설정 · 학습 활동) ───────── */
  function getSettings() {
    var s = db.settings || {};
    var g = parseInt(s.weeklyGoal, 10);
    return { examName: s.examName || '', examDate: s.examDate || '', weeklyGoal: g >= 1 && g <= 100 ? g : 7 };
  }
  function ddayInfo() {
    var s = getSettings(), d = parseYmd(s.examDate);
    if (!d) return null;
    var diff = Math.round((d - todayMidnight()) / 86400000);
    return { diff: diff, date: d, name: s.examName };
  }
  function recordActivity() {
    var k = ymd(new Date());
    db.activity[k] = (db.activity[k] || 0) + 1;
  }
  function weekStats() {
    var t = todayMidnight(), off = (t.getDay() + 6) % 7;
    var days = [], total = 0;
    for (var i = 0; i < 7; i++) {
      var d = new Date(t.getFullYear(), t.getMonth(), t.getDate() - off + i);
      var n = db.activity[ymd(d)] || 0;
      total += n;
      days.push({ label: DOW[d.getDay()], n: n, today: i === off, future: i > off });
    }
    return { days: days, total: total, goal: getSettings().weeklyGoal };
  }
  function streakDays() {
    var t = todayMidnight(), count = 0;
    var d = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    if (!db.activity[ymd(d)]) d.setDate(d.getDate() - 1);
    while (db.activity[ymd(d)]) { count++; d.setDate(d.getDate() - 1); }
    return count;
  }
  function answeredNos(exam) {
    var set = {};
    Object.keys(db.attempts).forEach(function (k) {
      var a = db.attempts[k];
      if (a.examId === exam.id) Object.keys(a.answers).forEach(function (no) { set[no] = true; });
    });
    return set;
  }
  function nextNewQuestion(exam) {
    var done = answeredNos(exam);
    return exam.questions.filter(function (q) { return !done[q.no]; })[0] || null;
  }

  /* ───────── 모달 · 토스트 ───────── */
  function closeModal() { var m = document.getElementById('modal-root'); if (m) m.remove(); }
  /* opts: title, body(문장) 또는 html(폼), ok, cancel, onOk(root) — onOk가 false를 돌려주면 닫지 않는다 */
  function modal(opts) {
    closeModal();
    var root = document.createElement('div');
    root.id = 'modal-root';
    root.className = 'modal-back';
    root.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><h3 id="mt">' + esc(opts.title) + '</h3>' +
      (opts.html ? opts.html : '<p class="muted" style="margin:0 0 16px">' + esc(opts.body) + '</p>') + '<div class="actions">' +
      '<button class="btn" data-m="cancel">' + esc(opts.cancel || '취소') + '</button>' +
      '<button class="btn primary" data-m="ok">' + esc(opts.ok || '확인') + '</button></div></div>';
    root.addEventListener('click', function (e) {
      var m = e.target.getAttribute && e.target.getAttribute('data-m');
      if (m === 'ok') {
        if (opts.onOk && opts.onOk(root) === false) return;
        closeModal();
      } else if (m === 'cancel' || e.target === root) closeModal();
    });
    document.body.appendChild(root);
    var first = root.querySelector('input') || root.querySelector('[data-m="ok"]'); first && first.focus();
  }
  /* 풀던 기록이 있으면 지울지 먼저 묻는다 */
  function guardOpen(examId, fn) {
    var open = openAttempt(examId);
    if (!open) { fn(); return; }
    modal({ title: '풀던 기록을 지울까요?', body: '새로 시작하면 풀던 기록이 사라져요. 이어 풀려면 "이어 풀기"를 눌러주세요.', ok: '새로 시작', cancel: '취소', onOk: function () { dropAttempt(open.id); fn(); } });
  }
  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.style.display = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.style.display = 'none'; }, 2200);
  }

  /* ───────── 라우터 ───────── */
  var view = null;
  var timerId = null;

  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  function route() {
    stopTimer();
    if (view && view.a) { save(); }
    view = null;
    closeModal();
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var r = parts[0];
    if (r === 'solve') return renderSolveRoute(parts[1], 'solve');
    if (r === 'review') return renderSolveRoute(parts[1], 'review', parseInt(parts[2], 10));
    if (r === 'result') return renderResult(parts[1]);
    if (r === 'exams') return renderExams();
    if (r === 'wrong') return renderWrong();
    if (r === 'stats') return renderStats();
    if (r === 'memos' || r === 'settings') {
      if (FEATURES[r]) return r === 'memos' ? renderMemos() : renderSettings();
      location.replace('#/'); return;
    }
    if (FEATURES.planner) return renderPlanner();
    renderExams();
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', function () { save(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });

  /* ───────── 계정 · 서버 동기화 ─────────
     구글로 로그인하면 풀이 기록·메모·북마크가 서버(Firestore)에도 저장돼요. 로그인은 선택이고,
     로그인 전에 쌓은 기록은 첫 로그인 때 계정으로 합쳐져요. 합치는 규칙은 js/merge.js 에 있어요. */
  IC.google = '<svg class="icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9a5 5 0 01-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1a6.4 6.4 0 01-6-4.4H2.4v2.8A11 11 0 0012 23z"/><path fill="#FBBC05" d="M6 14.2a6.6 6.6 0 010-4.2V7.2H2.4a11 11 0 000 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 002.4 7.2L6 10a6.4 6.4 0 016-4.6z"/></svg>';
  IC.user = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>';

  var SYNC_STATUS = { syncing: '저장 중…', ok: '서버에 저장됨', offline: '오프라인 · 연결되면 저장돼요', error: '저장하지 못했어요 · 다시 시도해요' };
  var syncing = null, pushTimer = null, lastSyncStr = '', lastPullAt = 0, justSignedIn = false;

  function showAcct() {
    return !!(Cloud && (Cloud.configured || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)));
  }
  function avatarHtml(u) {
    if (/^https:\/\//.test(u.photo || '')) return '<img class="avatar" src="' + esc(u.photo) + '" alt="" referrerpolicy="no-referrer">';
    return '<span class="avatar" aria-hidden="true">' + esc(Array.from(u.name || u.email || '?')[0].toUpperCase()) + '</span>';
  }
  function acctHtml(kind) {
    if (!showAcct()) return '';
    var u = acct.user, dis = acct.busy ? ' disabled' : '';
    if (kind === 'side') {
      if (!u) return '<button class="nav-item" data-act="login"' + dis + '>' + IC.google + 'Google로 로그인</button>';
      return '<button class="acct-card" data-act="acct" aria-label="계정 메뉴">' + avatarHtml(u) + '<span class="acct-txt"><b>' + esc(u.name || u.email) + '</b>' +
        '<span class="acct-st ' + acct.state + '">' + SYNC_STATUS[acct.state] + '</span></span></button>';
    }
    if (!u) return '<button class="icon-btn" data-act="login"' + dis + ' aria-label="Google로 로그인">' + IC.user + '</button>';
    return '<button class="icon-btn" data-act="acct" aria-label="계정 메뉴 · ' + SYNC_STATUS[acct.state] + '">' + avatarHtml(u) + '</button>';
  }
  function storageText() {
    if (acct.user) return '학습 기록과 메모는 내 구글 계정으로 서버에 저장돼요.';
    return '학습 기록과 메모는 이 브라우저에만 저장돼요.' + (showAcct() ? ' 로그인하면 서버에 저장돼서 다른 기기에서도 이어 풀 수 있어요.' : '');
  }
  function storageNote() { return '<p class="muted small" style="margin-top:18px" data-storage-note>' + storageText() + '</p>'; }
  function renderAcct() {
    var s = document.querySelector('[data-acct="side"]'), m = document.querySelector('[data-acct="m"]'), n = document.querySelector('[data-storage-note]');
    if (s) s.innerHTML = acctHtml('side');
    if (m) m.innerHTML = acctHtml('m');
    if (n) n.textContent = storageText();
    var st = document.getElementById('acct-st'); if (st) st.textContent = SYNC_STATUS[acct.state] || '';
  }
  function setAcct(state) { acct.state = state; renderAcct(); }

  function setupModal() {
    modal({ title: '서버 연결 설정이 필요해요', body: 'Google 로그인과 서버 저장을 쓰려면 Firebase 연결 정보가 필요해요. 프로젝트 폴더의 "서버연동_설정방법.md" 순서대로 설정한 뒤 site/js/firebase-config.js 에 붙여 넣어 주세요.', ok: '확인', cancel: '닫기' });
  }
  function loginErrorText(err) {
    var c = err && err.code;
    if (c === 'auth/popup-blocked') return '팝업이 막혔어요. 이 사이트의 팝업을 허용한 뒤 다시 눌러 주세요.';
    if (c === 'auth/unauthorized-domain') return '이 주소가 Firebase에 등록되지 않았어요. Firebase 콘솔 → Authentication → 설정 → 승인된 도메인에 이 주소를 추가해 주세요.';
    if (c === 'auth/operation-not-allowed') return 'Firebase에서 Google 로그인이 켜져 있지 않아요. Authentication → 로그인 방법에서 Google을 사용 설정해 주세요.';
    if (c === 'auth/network-request-failed') return '네트워크 연결을 확인해 주세요.';
    if (c === 'sdk-load') return '로그인 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.';
    return '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.' + (c ? ' (' + c + ')' : '');
  }
  function doLogin() {
    if (acct.busy) return;
    if (!Cloud || !Cloud.configured) { setupModal(); return; }
    if (!Cloud.canSignIn()) {
      modal({ title: '이 주소에서는 로그인할 수 없어요', body: '파일을 더블클릭해서 연 상태(file://)에서는 구글 로그인이 동작하지 않아요. http://localhost 로 열거나 배포한 주소로 접속해 주세요.', ok: '확인', cancel: '닫기' });
      return;
    }
    acct.busy = true; justSignedIn = true; renderAcct();
    Cloud.signIn().catch(function (err) {
      justSignedIn = false;
      var c = err && err.code;
      if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return;
      modal({ title: '로그인하지 못했어요', body: loginErrorText(err), ok: '확인', cancel: '닫기' });
    }).then(function () { acct.busy = false; renderAcct(); });
  }
  function acctModal() {
    var u = acct.user; if (!u) return;
    modal({
      title: '내 계정',
      html: '<div class="acct-modal">' + avatarHtml(u) + '<div><b>' + esc(u.name || '') + '</b><div class="muted small">' + esc(u.email) + '</div></div></div>' +
        '<p class="muted small" style="margin:0 0 16px">상태: <span id="acct-st">' + SYNC_STATUS[acct.state] + '</span><br>풀이 기록·메모·북마크가 이 계정에 저장돼요.</p>',
      ok: '로그아웃', cancel: '닫기',
      onOk: function () { logoutModal(); return false; }
    });
  }
  function logoutModal() {
    modal({
      title: '로그아웃할까요?', body: '로그아웃하면 이 기기에 있는 학습 기록이 지워져요. 서버에는 그대로 남아 있어서 다시 로그인하면 돌아와요.',
      ok: '로그아웃', cancel: '취소', onOk: function () { doLogout(); }
    });
  }
  function doLogout() {
    toast('서버에 저장하는 중…');
    syncNow(true).then(function (ok) {
      if (!ok) { toast('서버에 저장하지 못해서 로그아웃하지 않았어요. 연결을 확인해 주세요'); return; }
      clearTimeout(pushTimer); pushTimer = null;
      return Cloud.signOut().then(function () {
        var keep = { theme: db.theme, memoOpen: db.memoOpen };
        db = blankDb(); db.theme = keep.theme; db.memoOpen = keep.memoOpen;
        acct.user = null; lastSyncStr = '';
        save(); setAcct('off'); toast('로그아웃했어요'); route();
      });
    });
  }

  function scheduleSync() {
    if (pushTimer || !acct.user) return;
    pushTimer = setTimeout(function () { pushTimer = null; syncNow(); }, 4000);
  }
  /* 서버에서 앱이 모르는 항목(예: 이 화면에 아직 없는 시험의 기록)이 지워지지 않도록 그대로 되돌려 넣는다 */
  function withForeign(clean, raw, rc) {
    var out = Object.assign({}, clean);
    if (!raw || Number(raw.epoch || 0) !== clean.epoch) return out;
    ['attempts', 'memos', 'bookmarks', 'mt', 'gone'].forEach(function (f) {
      if (!raw[f] || typeof raw[f] !== 'object') return;
      var add = null;
      Object.keys(raw[f]).forEach(function (k) {
        if (!(k in rc[f]) && !(k in clean[f])) { add = add || Object.assign({}, clean[f]); add[k] = raw[f][k]; }
      });
      if (add) out[f] = add;
    });
    return out;
  }
  function refreshView() {
    if (document.getElementById('modal-root')) return;
    if (view && view.a && db.attempts[view.a.id] === view.a) return;
    route();
  }
  /* 서버와 합친다: 서버 내용을 받아 내 기록과 합치고, 합친 결과를 서버에 저장한다. 성공하면 true */
  function syncNow(force) {
    if (!acct.user || !Cloud || !Merge) return Promise.resolve(false);
    if (syncing) return syncing.then(function () { return syncNow(force); });
    var before = JSON.stringify(Merge.pack(db));
    if (!force && before === lastSyncStr) return Promise.resolve(true);
    var uidNow = acct.user.uid, clean = null;
    setAcct('syncing');
    var p = Cloud.update(uidNow, function (cur) {
      var raw = cur && cur.data && typeof cur.data === 'object' ? cur.data : null;
      var rc = raw ? sanitizeImport(raw, true) : null;
      var remote = rc ? Merge.pack(rc) : Merge.empty();
      clean = Merge.merge(Merge.pack(db), remote, { keepLocal: view && view.a ? view.a.id : null });
      return withForeign(clean, raw, remote);
    }).then(function () {
      syncing = null;
      if (!acct.user || acct.user.uid !== uidNow) return false;
      if (JSON.stringify(Merge.pack(db)) === before) {
        var changed = JSON.stringify(Merge.pack(clean)) !== before;
        Merge.SYNCED.forEach(function (k) { db[k] = clean[k]; });
        lastSyncStr = JSON.stringify(Merge.pack(db));
        lastPullAt = Date.now();
        save();
        setAcct('ok');
        if (changed) refreshView();
      } else {
        /* 보내는 사이에 내용이 바뀌었으니 다음에 한 번 더 보낸다 */
        lastSyncStr = before;
        scheduleSync();
      }
      return true;
    }, function (err) {
      syncing = null;
      console.warn('서버 동기화 실패', err);
      setAcct(navigator.onLine === false ? 'offline' : 'error');
      if (!pushTimer && acct.user) pushTimer = setTimeout(function () { pushTimer = null; syncNow(true); }, 30000);
      return false;
    });
    syncing = p;
    return p;
  }
  function onAuthChanged(user, err) {
    if (err) console.warn('로그인 상태 확인 실패', err);
    if (!user) { acct.user = null; setAcct('off'); return; }
    if (acct.user && acct.user.uid === user.uid) return;
    acct.user = user;
    var swapped = false;
    if (db.uid && db.uid !== user.uid) {
      /* 이 기기의 기록은 다른 계정 것이니 섞지 않는다 */
      var keep = { theme: db.theme, memoOpen: db.memoOpen };
      db = blankDb(); db.theme = keep.theme; db.memoOpen = keep.memoOpen; swapped = true;
    }
    db.uid = user.uid; lastSyncStr = '';
    save(); setAcct('syncing');
    if (swapped) route();
    var first = justSignedIn; justSignedIn = false;
    syncNow(true).then(function (ok) {
      if (first) toast(ok ? '로그인했어요 · 기록이 서버에 저장돼요' : '로그인했지만 서버에 연결하지 못했어요');
    });
  }
  document.addEventListener('visibilitychange', function () {
    if (!acct.user) return;
    if (document.hidden) { clearTimeout(pushTimer); pushTimer = null; syncNow(); }
    else if (Date.now() - lastPullAt > 60000) syncNow(true);
  });
  window.addEventListener('online', function () { if (acct.user) syncNow(true); });

  /* ───────── 공통 셸 ───────── */
  function navLink(key, active, href, icon, label) {
    return '<a class="nav-item' + (key === active ? ' active' : '') + '" href="' + href + '"' + (key === active ? ' aria-current="page"' : '') + '>' + icon + label + '</a>';
  }
  /* [키, 주소, 아이콘, 이름, 켜는 기능] — 기능 스위치가 꺼져 있으면 메뉴에서 빠진다 */
  var NAV = [
    ['planner', '#/', 'target', '플래너', 'planner'],
    ['exams', '#/exams', 'books', '기출 문제'],
    ['wrong', '#/wrong', 'bookmark', '오답노트'],
    ['memos', '#/memos', 'notebook', '내 메모', 'memos'],
    ['stats', '#/stats', 'chart', '통계'],
    ['settings', '#/settings', 'gear', '설정', 'settings']
  ];
  function navItems() {
    return NAV.filter(function (n) { return !n[4] || FEATURES[n[4]]; }).map(function (n) {
      /* 플래너가 꺼져 있으면 기출 문제가 홈(#/)이 된다 */
      return [n[0], n[0] === 'exams' && !FEATURES.planner ? '#/' : n[1], n[2], n[3]];
    });
  }
  function shell(inner, active) {
    var dark = currentTheme() === 'dark';
    var themeBtn = function (cls, withLabel) {
      return '<button class="' + cls + '" data-act="theme" aria-label="' + (dark ? '라이트 모드로 전환' : '다크 모드로 전환') + '">' + (dark ? IC.sun : IC.moon) + (withLabel ? '<span>' + (dark ? '라이트 모드' : '다크 모드') + '</span>' : '') + '</button>';
    };
    var items = navItems();
    var side = items.map(function (n) { return navLink(n[0], active, n[1], IC[n[2]], n[3]); }).join('');
    var tabs = items.filter(function (n) { return n[0] !== 'settings'; }).map(function (n) {
      return '<a class="tab' + (n[0] === active ? ' active' : '') + '" href="' + n[1] + '"' + (n[0] === active ? ' aria-current="page"' : '') + '>' + IC[n[2]] + '<span>' + n[3].replace(' 문제', '') + '</span></a>';
    }).join('');
    return '<div class="shell"><nav class="sidebar" aria-label="주 메뉴">' +
      '<a class="brand" href="#/"><span class="logo">회</span>회계 기출 노트</a>' + side +
      '<div class="spacer"></div><div class="acct-slot" data-acct="side">' + acctHtml('side') + '</div>' + themeBtn('nav-item', true) + '</nav>' +
      '<header class="mtop"><a class="brand" href="#/"><span class="logo">회</span>회계 기출 노트</a><span class="grow"></span>' +
      (FEATURES.settings ? '<a class="icon-btn' + (active === 'settings' ? ' active' : '') + '" href="#/settings" aria-label="설정">' + IC.gear + '</a>' : '') + '<span class="acct-m" data-acct="m">' + acctHtml('m') + '</span>' + themeBtn('icon-btn', false) + '</header>' +
      '<main class="main">' + inner + '</main>' +
      '<nav class="tabbar" aria-label="하단 메뉴">' + tabs + '</nav></div>';
  }

  /* ───────── 플래너(홈) ───────── */
  function renderPlanner() {
    var s = getSettings(), dd = ddayInfo(), wk = weekStats(), streak = streakDays();
    var html = '<h1 class="page-title">플래너</h1><p class="page-sub">' + (wk.days.some(function (d) { return d.today && d.n > 0; }) ? '오늘 학습을 시작했어요. 이 흐름을 이어가요.' : '오늘도 한 문제부터 시작해요.') + '</p>';
    if (!storageOk) {
      html += '<div class="card" style="margin-bottom:14px;background:var(--warn-bg);border-color:transparent;color:var(--warn)">이 브라우저에서는 학습 기록을 저장할 수 없어요. 페이지를 닫으면 기록이 사라져요.</div>';
    }

    /* D-day + 주간 목표 */
    var ddHtml;
    if (dd) {
      var label = dd.diff > 0 ? 'D-' + dd.diff : (dd.diff === 0 ? 'D-DAY' : 'D+' + (-dd.diff));
      ddHtml = '<div class="sm-label">' + (dd.diff >= 0 ? '다음 시험까지' : '시험일이 지났어요') + '</div>' +
        '<div class="dday-num num' + (dd.diff === 0 ? ' today' : '') + '" aria-label="' + (dd.diff >= 0 ? '시험까지 ' + dd.diff + '일 남음' : '시험 후 ' + (-dd.diff) + '일 지남') + '">' + label + '</div>' +
        '<div class="small muted">' + (dd.name ? esc(dd.name) + ' · ' : '') + dd.date.getFullYear() + '.' + pad2(dd.date.getMonth() + 1) + '.' + pad2(dd.date.getDate()) + ' (' + DOW[dd.date.getDay()] + ')</div>' +
        '<button class="btn sm" data-act="settings" style="margin-top:10px">시험일·목표 수정</button>';
    } else {
      ddHtml = '<div class="sm-label">다음 시험까지</div><div class="dday-num muted">D-?</div>' +
        '<div class="small muted">시험일을 정하면 남은 날짜가 표시돼요.</div>' +
        '<button class="btn primary sm" data-act="settings" style="margin-top:10px">시험일 설정</button>';
    }
    var pct = Math.min(100, Math.round(wk.total / wk.goal * 100));
    var reached = wk.total >= wk.goal;
    var weekHtml = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">' +
      '<div class="sm-label" style="margin:0">이번 주 목표</div><div style="display:flex;gap:6px">' +
      (reached ? '<span class="pill ok">목표 달성</span>' : '') +
      (streak ? '<span class="pill accent">' + IC.flame + '연속 ' + streak + '일</span>' : '') + '</div></div>' +
      '<div class="week-num num"><b>' + wk.total + '</b><span class="muted"> / ' + wk.goal + '문제</span></div>' +
      '<div class="bar" role="img" aria-label="이번 주 목표 ' + pct + '% 달성"><i style="width:' + pct + '%"></i></div>' +
      '<div class="days" role="list">' + wk.days.map(function (d) {
        return '<div class="day' + (d.today ? ' today' : '') + (d.n ? ' done' : '') + (d.future ? ' future' : '') + '" role="listitem" aria-label="' + d.label + '요일 ' + (d.n ? d.n + '문제 풀었어요' : d.future ? '아직 오지 않았어요' : '풀지 않았어요') + '">' +
          '<span class="dot">' + (d.n ? IC.check : '') + '</span><span class="dl">' + d.label + '</span></div>';
      }).join('') + '</div>';
    html += '<div class="plan-top"><section class="card dday" aria-label="D-day">' + ddHtml + '</section><section class="card" aria-label="주간 목표">' + weekHtml + '</section></div>';

    /* 오늘 할 일 */
    var tasks = '';
    EXAMS.forEach(function (ex) {
      var open = openAttempt(ex.id);
      if (open) {
        var og = Object.keys(open.answers).length;
        tasks += '<div class="task"><span class="ico">' + IC.play + '</span><div class="grow"><b>이어 풀기</b><div class="muted small">' + esc(ex.name) + ' · ' + modeLabel(open) + ' · ' + og + '/' + open.order.length + '문항</div></div>' +
          '<button class="btn primary sm" data-act="resume" data-id="' + open.id + '">계속</button></div>';
      }
      var due = dueNos(ex);
      if (due.length) {
        tasks += '<div class="task"><span class="ico">' + IC.repeat + '</span><div class="grow"><b>오늘 복습할 문제 ' + due.length + '개</b><div class="muted small">' + esc(ex.name) + ' · ' + due.join(', ') + '번 · <a href="#/wrong">오답노트 보기</a></div></div>' +
          '<button class="btn sm" data-act="start" data-exam="' + ex.id + '" data-mode="due">복습 시작</button></div>';
      }
    });
    var todayDone = wk.days.some(function (d) { return d.today && d.n > 0; });
    var nextQ = null, nextEx = null;
    EXAMS.forEach(function (ex) { if (!nextQ) { var q = nextNewQuestion(ex); if (q) { nextQ = q; nextEx = ex; } } });
    if (nextQ && !todayDone) {
      tasks += '<div class="task"><span class="ico">' + IC.pen + '</span><div class="grow"><b>오늘의 한 문제</b><div class="muted small">' + esc(nextEx.name) + ' · ' + nextQ.no + '번 · ' + esc(nextQ.area) + ' · ' + esc(nextQ.topic) + '</div></div>' +
        '<button class="btn sm" data-act="start-daily" data-exam="' + nextEx.id + '" data-no="' + nextQ.no + '">풀기</button></div>';
    }
    if (todayDone) {
      var tn = wk.days.filter(function (d) { return d.today; })[0].n;
      tasks += '<div class="task done"><span class="ico ok">' + IC.check + '</span><div class="grow"><b>오늘 학습 완료</b><div class="muted small">오늘 ' + tn + '문제를 풀었어요.</div></div></div>';
    }
    if (!tasks) tasks = '<div class="empty" style="padding:18px 8px">오늘 할 일을 모두 마쳤어요. <a href="#/exams">기출 문제</a>에서 더 풀어볼 수 있어요.</div>';
    html += '<section class="card" style="margin-top:12px" aria-label="오늘 할 일"><div class="sm-label">오늘 할 일</div><div class="tasks">' + tasks + '</div></section>';

    /* 영역별 진도 */
    var areas = {}, order = [];
    EXAMS.forEach(function (ex) {
      var done = answeredNos(ex);
      ex.questions.forEach(function (q) {
        if (!areas[q.area]) { areas[q.area] = { solved: 0, total: 0 }; order.push(q.area); }
        areas[q.area].total++;
        if (done[q.no]) areas[q.area].solved++;
      });
    });
    html += '<section class="card" style="margin-top:12px" aria-label="영역별 진도"><div class="sm-label">영역별 진도</div>' + order.map(function (ar) {
      var o = areas[ar], p = o.total ? Math.round(o.solved / o.total * 100) : 0;
      return '<div class="rate"><span>' + esc(ar) + '</span><div class="bar" role="img" aria-label="' + esc(ar) + ' 진도 ' + p + '%"><i style="width:' + p + '%"></i></div><span class="val">' + o.solved + '/' + o.total + '</span></div>';
    }).join('') + '</section>';

    /* 최근 기록 */
    var recent = [];
    EXAMS.forEach(function (ex) { submittedAttempts(ex.id).forEach(function (a) { recent.push({ a: a, ex: ex }); }); });
    recent.sort(function (x, y) { return y.a.finishedAt - x.a.finishedAt; });
    html += '<section class="card" style="margin-top:12px" aria-label="최근 기록"><div class="sm-label">최근 기록</div>' + (recent.length ? recent.slice(0, 5).map(function (r) {
      var g = grade(r.a, r.ex);
      return '<div class="history-row"><div><b class="num">' + g.score + '점</b> <span class="muted small">· ' + g.ok + '/' + g.total + ' 정답 · ' + esc(r.ex.name) + ' · ' + modeLabel(r.a) + ' · ' + fmtDate(r.a.finishedAt) + '</span></div>' +
        '<button class="btn sm" data-act="open-result" data-id="' + r.a.id + '">결과 보기</button></div>';
    }).join('') : '<div class="muted small" style="padding:6px 0">아직 제출한 기록이 없어요. 문제를 풀고 제출하면 여기에 쌓여요.</div>') + '</section>';

    html += storageNote();
    $app.innerHTML = shell(html, 'planner');
    document.title = '플래너 · 회계 기출 노트';
  }

  /* 시험일 · 주간 목표 설정 */
  function settingsModal() {
    var html = '<div class="form">' + settingsFields('f-', getSettings()) + '<div class="err" id="f-err" role="alert" hidden></div></div>';
    modal({
      title: '시험일과 주간 목표', html: html, ok: '저장', cancel: '취소',
      onOk: function (root) {
        var r = readSettingsForm(root, 'f-');
        if (r.error) {
          var err = root.querySelector('#f-err'); err.textContent = r.error; err.hidden = false; root.querySelector(r.id).focus();
          return false;
        }
        touchSettings(r.value);
        save();
        toast('저장했어요');
        route();
      }
    });
    var inputs = document.querySelectorAll('#modal-root input');
    Array.prototype.forEach.call(inputs, function (i) { i.addEventListener('input', function () { var e = document.getElementById('f-err'); if (e) e.hidden = true; }); });
  }

  /* ───────── 기출 목록 ───────── */
  function renderExams() {
    var html = '<h1 class="page-title">기출 문제</h1><p class="page-sub">한 번에 한 문제씩 풀고, 풀이 메모를 남겨보세요.</p>';
    if (!storageOk) {
      html += '<div class="card" style="margin-bottom:14px;background:var(--warn-bg);border-color:transparent;color:var(--warn)">이 브라우저에서는 학습 기록을 저장할 수 없어요. 페이지를 닫으면 기록이 사라져요.</div>';
    }
    if (!EXAMS.length) html += '<div class="empty">등록된 기출이 없어요.</div>';
    var totalQ = 0, solvedQ = 0, resumeA = null, resumeEx = null;
    EXAMS.forEach(function (ex) {
      totalQ += ex.questions.length;
      solvedQ += Object.keys(answeredNos(ex)).length;
      var op = openAttempt(ex.id);
      if (op && (!resumeA || (op.updatedAt || 0) > (resumeA.updatedAt || 0))) { resumeA = op; resumeEx = ex; }
    });
    var allPct = totalQ ? Math.round(solvedQ / totalQ * 100) : 0;
    if (EXAMS.length) {
      html += '<section class="card xsum" aria-label="학습 요약">' +
        (resumeA ? '<div class="grow"><div class="sm-label">이어 풀기</div><b>' + esc(resumeEx.name) + '</b><div class="muted small">' + modeLabel(resumeA) + ' · ' + Object.keys(resumeA.answers).length + '/' + resumeA.order.length + '문항 풀이 · ' + fmtDate(resumeA.updatedAt || resumeA.startedAt) + '</div></div>' : '') +
        '<div class="xtot' + (resumeA ? '' : ' grow') + '"><div class="sm-label">전체 진행</div><div class="xprog"><b class="num">' + solvedQ + ' / ' + totalQ + '</b>' +
        '<span class="bar" role="img" aria-label="전체 진행 ' + allPct + '%"><i style="width:' + allPct + '%"></i></span></div></div>' +
        (resumeA ? '<button class="btn primary" data-act="resume" data-id="' + resumeA.id + '">이어 풀기</button>' : '') + '</section>';
    }
    html += '<div class="card xlist">';
    EXAMS.forEach(function (ex) {
      var wrong = wrongNos(ex);
      var open = openAttempt(ex.id);
      var done = submittedAttempts(ex.id);
      var full = done.filter(function (a) { return a.order.length === ex.questions.length; });
      var best = full.length ? Math.max.apply(null, full.map(function (a) { return grade(a, ex).score; })) : null;
      var solved = Object.keys(answeredNos(ex)).length;
      var pct = ex.questions.length ? Math.round(solved / ex.questions.length * 100) : 0;
      var ym = /^(\d{4})\s*(.*)$/.exec(ex.name);
      html += '<details class="xrow"><summary>' +
        '<span class="xyr num">' + (ym ? ym[1] : '') + '</span>' +
        '<span class="xname"><b>' + esc(ym ? ym[2] : ex.name) + '</b><span class="meta"><span class="muted small">' + ex.questions.length + '문항 · ' + ex.minutes + '분 · ' + (ex.questions.length * ex.pointsPerQuestion) + '점</span>' +
        (best != null ? '<span class="pill ok">최고 ' + best + '점</span>' : '') +
        (wrong.length ? '<span class="pill bad">오답 ' + wrong.length + '</span>' : '') +
        (open ? '<span class="pill accent">풀던 기록</span>' : '') + '</span></span>' +
        '<span class="xprog"><span class="bar" role="img" aria-label="진행 ' + pct + '%"><i style="width:' + pct + '%"></i></span><span class="n num">' + solved + '/' + ex.questions.length + '</span></span>' +
        '<span class="btn sm xgo">풀기' + IC.chev + '</span></summary><div class="xbody">';
      if (open) {
        var og = Object.keys(open.answers).length;
        html += '<div class="card resume"><div><b>풀던 기록이 있어요</b><div class="muted small">' + modeLabel(open) + ' · ' + og + '/' + open.order.length + '문항 풀이 · ' + fmtDate(open.updatedAt || open.startedAt) + '</div></div>' +
          '<div style="display:flex;gap:8px"><button class="btn primary" data-act="resume" data-id="' + open.id + '">이어 풀기</button><button class="btn" data-act="discard" data-id="' + open.id + '">버리기</button></div></div>';
      }
      html += '<div class="mode-grid">' +
        '<button class="mode" data-act="start" data-exam="' + ex.id + '" data-mode="practice">' + IC.pen + '<b>연습</b><span class="muted small">시간 제한 없음 · 풀고 바로 정답 확인</span></button>' +
        '<button class="mode" data-act="start" data-exam="' + ex.id + '" data-mode="exam">' + IC.clock + '<b>실전</b><span class="muted small">' + ex.minutes + '분 타이머 · 제출 후 채점</span></button>' +
        '<button class="mode" data-act="start" data-exam="' + ex.id + '" data-mode="wrong"' + (wrong.length ? '' : ' disabled') + '>' + IC.check + '<b>오답만</b><span class="muted small">' + (wrong.length ? '오답노트의 ' + wrong.length + '문제만 다시 풀기' : '틀린 문제가 생기면 열려요') + '</span></button>' +
        '</div>';
      if (done.length) {
        html += '<div><div class="section-label" style="margin-top:0">최근 기록</div>';
        done.slice(-5).reverse().forEach(function (a) {
          var g = grade(a, ex);
          html += '<div class="history-row"><div><b class="num">' + g.score + '점</b> <span class="muted small">· ' + g.ok + '/' + g.total + ' 정답 · ' + modeLabel(a) + ' · ' + fmtDate(a.finishedAt) + '</span></div>' +
            '<button class="btn sm" data-act="open-result" data-id="' + a.id + '">결과 보기</button></div>';
        });
        html += '</div>';
      }
      html += '</div></details>';
    });
    html += '</div>';
    html += storageNote();
    $app.innerHTML = shell(html, 'exams');
    document.title = '기출 문제 · 회계 기출 노트';
  }

  function startAttempt(examId, mode) {
    var ex = getExam(examId);
    if (!ex) return;
    var order, retry = false;
    if (mode === 'wrong') { order = wrongNos(ex); retry = true; mode = 'practice'; }
    else if (mode === 'due') { order = dueNos(ex); retry = true; mode = 'practice'; }
    else order = ex.questions.map(function (q) { return q.no; });
    if (!order.length) { toast('풀 문제가 없어요'); return; }
    var a = {
      id: uid(), examId: examId, mode: mode, retry: retry, order: order, answers: {}, checked: {}, times: {},
      idx: 0, elapsed: 0, limitSec: mode === 'exam' ? ex.minutes * 60 : null,
      startedAt: Date.now(), updatedAt: Date.now(), submitted: false
    };
    db.attempts[a.id] = a; save();
    go('#/solve/' + a.id);
  }
  function startSingle(examId, no) {
    var ex = getExam(examId);
    if (!ex || !qOf(ex, no)) return;
    var a = {
      id: uid(), examId: examId, mode: 'practice', retry: true, order: [no], answers: {}, checked: {}, times: {},
      idx: 0, elapsed: 0, limitSec: null, startedAt: Date.now(), updatedAt: Date.now(), submitted: false
    };
    db.attempts[a.id] = a; save();
    go('#/solve/' + a.id);
  }
  function startDaily(examId, no) {
    var ex = getExam(examId);
    if (!ex || !qOf(ex, no)) return;
    var a = {
      id: uid(), examId: examId, mode: 'practice', retry: false, daily: true, order: [no], answers: {}, checked: {}, times: {},
      idx: 0, elapsed: 0, limitSec: null, startedAt: Date.now(), updatedAt: Date.now(), submitted: false
    };
    db.attempts[a.id] = a; save();
    go('#/solve/' + a.id);
  }

  /* ───────── 오답노트 ───────── */
  var ui = { wrongFilter: 'all', memoQuery: '' };
  function dueLabel(s) {
    var diff = dayDiff(s.due, todayMidnight());
    if (diff < 0) return { text: (-diff) + '일 지남', cls: 'bad' };
    if (diff === 0) return { text: '오늘', cls: 'warn' };
    if (diff === 1) return { text: '내일', cls: '' };
    return { text: diff + '일 뒤', cls: '' };
  }
  function stepDots(stage) {
    var h = '';
    for (var i = 0; i < REVIEW_DAYS.length; i++) h += '<i class="' + (i < stage ? 'on' : '') + '"></i>';
    return '<span class="steps" role="img" aria-label="복습 ' + stage + '/' + REVIEW_DAYS.length + '단계">' + h + '</span>';
  }
  function renderWrong() {
    var today = todayMidnight(), rows = [], c = { due: 0, open: 0, mastered: 0, bm: 0 }, dueByExam = [];
    EXAMS.forEach(function (ex) {
      var st = reviewStates(ex), dn = 0;
      ex.questions.forEach(function (q) {
        var s = st[q.no], bm = !!db.bookmarks[memoKey(ex.id, q.no)];
        if (!s && !bm) return;
        var status = !s ? 'bookmark' : (s.mastered ? 'mastered' : (s.due <= today ? 'due' : 'wait'));
        rows.push({ ex: ex, q: q, s: s, bm: bm, status: status });
        if (bm) c.bm++;
        if (s && s.mastered) c.mastered++;
        if (s && !s.mastered) { c.open++; if (s.due <= today) { c.due++; dn++; } }
      });
      if (dn) dueByExam.push({ ex: ex, n: dn });
    });
    var f = ui.wrongFilter;
    var shown = rows.filter(function (r) {
      if (f === 'due') return r.status === 'due';
      if (f === 'bm') return r.bm;
      if (f === 'mastered') return r.status === 'mastered';
      return r.status !== 'mastered';
    });
    var rank = { due: 0, wait: 1, bookmark: 2, mastered: 3 };
    shown.sort(function (x, y) {
      if (rank[x.status] !== rank[y.status]) return rank[x.status] - rank[y.status];
      if (x.s && y.s && x.s.due && y.s.due && x.s.due - y.s.due) return x.s.due - y.s.due;
      return x.q.no - y.q.no;
    });
    var html = '<h1 class="page-title">오답노트</h1><p class="page-sub">틀린 문제는 다음 날, 3일 뒤, 7일 뒤에 다시 풀도록 알려드려요. 세 번 맞히면 익힌 문제로 옮겨져요.</p>' +
      '<div class="stats">' +
      '<div class="card stat"><div class="k">오늘 복습</div><div class="v' + (c.due ? ' accent' : '') + '">' + c.due + '</div></div>' +
      '<div class="card stat"><div class="k">복습 중</div><div class="v">' + c.open + '</div></div>' +
      '<div class="card stat"><div class="k">익힌 문제</div><div class="v">' + c.mastered + '</div></div>' +
      '<div class="card stat"><div class="k">북마크</div><div class="v">' + c.bm + '</div></div></div>';
    if (dueByExam.length || c.open) {
      html += '<div class="actions" style="margin:14px 0 4px">' + dueByExam.map(function (d) {
        return '<button class="btn primary" data-act="start" data-exam="' + d.ex.id + '" data-mode="due">오늘 복습 시작 · ' + d.n + '문제</button>';
      }).join('') + EXAMS.filter(function (ex) { return wrongNos(ex).length; }).map(function (ex) {
        return '<button class="btn" data-act="start" data-exam="' + ex.id + '" data-mode="wrong">전체 오답 풀기 · ' + wrongNos(ex).length + '문제</button>';
      }).join('') + '</div>';
    }
    var tabs = [['all', '전체'], ['due', '오늘 복습'], ['bm', '북마크'], ['mastered', '익힌 문제']];
    html += '<div class="filters" role="tablist" aria-label="오답노트 보기">' + tabs.map(function (t) {
      return '<button class="fchip' + (f === t[0] ? ' on' : '') + '" role="tab" aria-selected="' + (f === t[0]) + '" data-act="wrong-filter" data-f="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div>';
    if (!shown.length) {
      var msg = { all: '복습 중인 문제가 없어요. 문제를 풀고 제출하면 틀린 문제가 여기에 모여요.', due: '오늘 복습할 문제가 없어요.', bm: '북마크한 문제가 없어요. 풀이 화면에서 별 버튼이나 B 키로 북마크할 수 있어요.', mastered: '아직 익힌 문제가 없어요.' }[f];
      html += '<div class="card empty">' + msg + '</div>';
    } else {
      html += '<div class="card list">' + shown.map(function (r) {
        var q = r.q, s = r.s, meta, pillStatus = '';
        if (s && !s.mastered) {
          var dl = dueLabel(s);
          meta = '오답 ' + s.wrong + '회 · 다음 복습 <span class="pill ' + dl.cls + '">' + dl.text + '</span> ' + stepDots(s.stage);
        } else if (s) {
          meta = '오답 ' + s.wrong + '회 · 세 번 맞혀서 익혔어요 ' + stepDots(REVIEW_DAYS.length);
        } else meta = '북마크한 문제';
        var latest = latestAttemptWith(r.ex, q.no);
        return '<div class="wrow"><div class="grow"><div class="wtitle"><b class="num">' + q.no + '번</b><span class="pill accent">' + esc(q.area) + '</span><span class="pill">' + esc(q.topic) + '</span><span class="pill">' + esc(q.type) + '</span></div>' +
          '<div class="muted small wmeta">' + meta + (EXAMS.length > 1 ? ' · ' + esc(r.ex.name) : '') + '</div></div>' +
          '<div class="wacts"><button class="btn sm" data-act="start-single" data-exam="' + r.ex.id + '" data-no="' + q.no + '">다시 풀기</button>' +
          (latest ? '<button class="btn sm" data-act="review" data-id="' + latest.id + '" data-no="' + q.no + '">정답 확인</button>' : '') +
          '<button class="btn ghost sm" data-act="bm-toggle" data-exam="' + r.ex.id + '" data-no="' + q.no + '" aria-pressed="' + r.bm + '" aria-label="' + q.no + '번 북마크">' + (r.bm ? IC.starOn : IC.star) + '</button></div></div>';
      }).join('') + '</div>';
    }
    $app.innerHTML = shell(html, 'wrong');
    document.title = '오답노트 · 회계 기출 노트';
  }

  /* ───────── 내 메모 ───────── */
  function memoEntries() {
    var out = [];
    Object.keys(db.memos).forEach(function (k) {
      var i = k.lastIndexOf(':'), ex = getExam(k.slice(0, i)), no = parseInt(k.slice(i + 1), 10), q = ex && qOf(ex, no);
      if (q) out.push({ key: k, ex: ex, q: q, text: String(db.memos[k]) });
    });
    out.sort(function (x, y) { return EXAMS.indexOf(x.ex) - EXAMS.indexOf(y.ex) || x.q.no - y.q.no; });
    return out;
  }
  function memoListHtml(query) {
    var all = memoEntries(), qy = (query || '').trim().toLowerCase();
    var list = !qy ? all : all.filter(function (m) {
      return (m.text + ' ' + m.q.no + '번 ' + m.q.topic + ' ' + m.q.area + ' ' + m.q.type).toLowerCase().indexOf(qy) >= 0;
    });
    if (!all.length) return '<div class="card empty">아직 남긴 메모가 없어요. 풀이 화면 오른쪽 메모에 계산 과정을 적어보세요.</div>';
    if (!list.length) return '<div class="card empty">"' + esc(query) + '"에 맞는 메모가 없어요.</div>';
    return '<div class="muted small" style="margin:0 0 8px">' + list.length + '개 메모</div>' + list.map(function (m) {
      var latest = latestAttemptWith(m.ex, m.q.no);
      return '<div class="card memo-card"><div class="wtitle"><b class="num">' + m.q.no + '번</b><span class="pill accent">' + esc(m.q.area) + '</span><span class="pill">' + esc(m.q.topic) + '</span>' +
        (db.bookmarks[memoKey(m.ex.id, m.q.no)] ? '<span class="pill warn">북마크</span>' : '') + (EXAMS.length > 1 ? '<span class="muted small">' + esc(m.ex.name) + '</span>' : '') + '</div>' +
        '<pre class="memo-text">' + esc(m.text) + '</pre>' +
        '<div class="wacts" style="justify-content:flex-start"><button class="btn sm" data-act="start-single" data-exam="' + m.ex.id + '" data-no="' + m.q.no + '">이 문제 풀기</button>' +
        (latest ? '<button class="btn sm" data-act="review" data-id="' + latest.id + '" data-no="' + m.q.no + '">해설 보기</button>' : '') +
        '<button class="btn ghost sm" data-act="memo-delete" data-key="' + esc(m.key) + '">삭제</button></div></div>';
    }).join('');
  }
  function renderMemos() {
    var html = '<h1 class="page-title">내 메모</h1><p class="page-sub">풀이 화면에서 남긴 메모를 모아 봐요.</p>' +
      '<div class="searchbar"><input id="memo-q" type="search" placeholder="메모 내용, 번호, 단원으로 검색" aria-label="메모 검색" value="' + esc(ui.memoQuery) + '" autocomplete="off"></div>' +
      '<div id="memo-list" aria-live="polite">' + memoListHtml(ui.memoQuery) + '</div>';
    $app.innerHTML = shell(html, 'memos');
    document.title = '내 메모 · 회계 기출 노트';
  }

  /* ───────── 통계 ───────── */
  function fmtDuration(sec) {
    sec = Math.round(sec);
    if (sec < 60) return sec + '초';
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    return h ? h + '시간 ' + m + '분' : m + '분';
  }
  function rateRow(label, ok, total, wide) {
    var pct = total ? Math.round(ok / total * 100) : 0;
    return '<div class="rate' + (wide ? ' wide' : '') + '"><span>' + esc(label) + '</span><div class="bar" role="img" aria-label="' + esc(label) + ' 정답률 ' + pct + '%"><i style="width:' + pct + '%"></i></div><span class="val">' + ok + '/' + total + ' · ' + pct + '%</span></div>';
  }
  function vbars(list, fmt) {
    var max = Math.max.apply(null, list.map(function (x) { return x.v; }).concat([1]));
    return '<div class="vbars" role="list">' + list.map(function (x) {
      return '<div class="vb" role="listitem" aria-label="' + esc(x.l) + ' ' + x.v + (fmt || '') + '"><span class="v">' + x.v + '</span><i style="height:' + Math.max(2, Math.round(x.v / max * 100)) + 'px"></i><span class="l">' + esc(x.l) + '</span></div>';
    }).join('') + '</div>';
  }
  function renderStats() {
    var items = [], runs = [], totalSec = 0, solved = {};
    EXAMS.forEach(function (ex) {
      Object.keys(db.attempts).forEach(function (k) {
        var a = db.attempts[k];
        if (a.examId !== ex.id) return;
        if (a.mode === 'exam') totalSec += a.elapsed || 0;   // 연습 모드의 시간은 어디에도 표시하지 않는다
        Object.keys(a.answers).forEach(function (no) { solved[ex.id + ':' + no] = true; });
      });
      submittedAttempts(ex.id).forEach(function (a) {
        runs.push({ a: a, ex: ex });
        grade(a, ex).items.forEach(function (i) { if (i.status !== 'skip') items.push({ ex: ex, q: i.q, no: i.no, ok: i.status === 'ok', t: a.mode === 'exam' ? (a.times[i.no] || 0) : 0 }); });
      });
    });
    var okAll = items.filter(function (i) { return i.ok; }).length;
    var html = '<h1 class="page-title">통계</h1><p class="page-sub">제출한 풀이를 기준으로 계산해요.</p>';
    html += '<div class="stats">' +
      '<div class="card stat"><div class="k">푼 문항</div><div class="v">' + Object.keys(solved).length + '</div></div>' +
      '<div class="card stat"><div class="k">제출한 풀이</div><div class="v">' + runs.length + '회</div></div>' +
      '<div class="card stat"><div class="k">전체 정답률</div><div class="v">' + (items.length ? Math.round(okAll / items.length * 100) + '%' : '-') + '</div></div>' +
      '<div class="card stat"><div class="k">실전 풀이 시간</div><div class="v" style="font-size:20px">' + (totalSec ? fmtDuration(totalSec) : '-') + '</div></div></div>';
    if (!items.length) {
      html += '<div class="card empty" style="margin-top:12px">아직 제출한 풀이가 없어요. 문제를 풀고 제출하면 영역·단원별 정답률과 풀이 시간을 볼 수 있어요.<div style="margin-top:12px"><a class="btn primary" href="#/exams">기출 풀러 가기</a></div></div>';
    } else {
      var byKey = function (fn) {
        var m = {}, ord = [];
        items.forEach(function (i) { var k = fn(i); if (!m[k]) { m[k] = { ok: 0, n: 0 }; ord.push(k); } m[k].n++; if (i.ok) m[k].ok++; });
        return ord.map(function (k) { return { k: k, ok: m[k].ok, n: m[k].n }; });
      };
      html += '<div class="two"><div class="card"><div class="sm-label">영역별 정답률</div>' + byKey(function (i) { return i.q.area; }).map(function (r) { return rateRow(r.k, r.ok, r.n); }).join('') +
        '<div class="sm-label" style="margin-top:14px">유형별 정답률</div>' + byKey(function (i) { return i.q.type; }).map(function (r) { return rateRow(r.k, r.ok, r.n); }).join('') + '</div>';
      var weak = byKey(function (i) { return i.q.topic; }).sort(function (x, y) { return (x.ok / x.n) - (y.ok / y.n) || y.n - x.n; }).slice(0, 6);
      html += '<div class="card"><div class="sm-label">약한 단원</div><div class="muted small" style="margin-bottom:6px">정답률이 낮은 순서예요.</div>' + weak.map(function (r) { return rateRow(r.k, r.ok, r.n, true); }).join('') + '</div></div>';

      var full = runs.filter(function (r) { return r.a.order.length === r.ex.questions.length; }).sort(function (x, y) { return x.a.finishedAt - y.a.finishedAt; }).slice(-10);
      html += '<div class="two"><div class="card"><div class="sm-label">점수 추이</div>' + (full.length
        ? vbars(full.map(function (r) { var d = new Date(r.a.finishedAt); return { v: grade(r.a, r.ex).score, l: (d.getMonth() + 1) + '/' + d.getDate() }; }), '점')
        : '<div class="muted small">20문항 전체를 제출하면 점수 추이가 보여요.</div>') + '</div>';
      var tm = {};
      items.forEach(function (i) { if (i.t > 0) { var k = i.ex.id + ':' + i.no; (tm[k] = tm[k] || { q: i.q, sum: 0, n: 0 }); tm[k].sum += i.t; tm[k].n++; } });
      var slow = Object.keys(tm).map(function (k) { return { q: tm[k].q, avg: Math.round(tm[k].sum / tm[k].n) }; }).sort(function (x, y) { return y.avg - x.avg; }).slice(0, 5);
      var smax = slow.length ? slow[0].avg : 1;
      html += '<div class="card"><div class="sm-label">오래 걸린 문제</div>' + (slow.length ? slow.map(function (r) {
        return '<div class="rate wide"><span>' + r.q.no + '번 ' + esc(r.q.topic) + '</span><div class="bar" role="img" aria-label="' + r.q.no + '번 평균 ' + fmtTime(r.avg) + '"><i style="width:' + Math.round(r.avg / smax * 100) + '%"></i></div><span class="val">' + fmtTime(r.avg) + '</span></div>';
      }).join('') : '<div class="muted small">실전 모드로 풀면 오래 걸린 문제를 볼 수 있어요.</div>') + '</div></div>';
    }
    var t = todayMidnight(), off = (t.getDay() + 6) % 7, weeks = [];
    for (var w = 7; w >= 0; w--) {
      var start = addDays(t, -off - 7 * w), sum = 0;
      for (var d = 0; d < 7; d++) sum += db.activity[ymd(addDays(start, d))] || 0;
      weeks.push({ v: sum, l: (start.getMonth() + 1) + '/' + start.getDate() });
    }
    html += '<div class="card" style="margin-top:12px"><div class="sm-label">주간 학습량 <span class="muted small" style="font-weight:400">(최근 8주, 푼 문제 수 · 주 시작일 기준)</span></div>' + vbars(weeks, '문제') + '</div>';
    $app.innerHTML = shell(html, 'stats');
    document.title = '통계 · 회계 기출 노트';
  }

  /* ───────── 설정 · 백업 ───────── */
  function readSettingsForm(scope, p) {
    var name = scope.querySelector('#' + p + 'name').value.trim();
    var date = scope.querySelector('#' + p + 'date').value.trim();
    var goalRaw = scope.querySelector('#' + p + 'goal').value.trim();
    var goal = /^\d+$/.test(goalRaw) ? parseInt(goalRaw, 10) : NaN;
    if (date && !parseYmd(date)) return { error: '시험일을 날짜 형식으로 입력해 주세요.', id: '#' + p + 'date' };
    if (!(goal >= 1 && goal <= 100)) return { error: '주간 목표는 1에서 100 사이의 숫자로 입력해 주세요.', id: '#' + p + 'goal' };
    return { value: { examName: name, examDate: date, weeklyGoal: goal } };
  }
  function settingsFields(p, s) {
    return '<label for="' + p + 'name">시험 이름 <span class="muted small">(선택)</span></label>' +
      '<input id="' + p + 'name" type="text" maxlength="40" value="' + esc(s.examName) + '" placeholder="2027 지방직 9급">' +
      '<label for="' + p + 'date">시험일</label><input id="' + p + 'date" type="date" value="' + esc(s.examDate) + '">' +
      '<label for="' + p + 'goal">주간 목표 문제 수</label><input id="' + p + 'goal" type="number" min="1" max="100" step="1" value="' + s.weeklyGoal + '">';
  }
  function renderSettings() {
    var s = getSettings(), th = db.theme || 'system';
    var nAtt = Object.keys(db.attempts).length, nMemo = Object.keys(db.memos).length, nBm = Object.keys(db.bookmarks).length;
    var html = '<h1 class="page-title">설정</h1><p class="page-sub">시험 정보, 화면, 내 학습 데이터를 관리해요.</p>' +
      '<section class="card set-sec"><h2>시험 정보</h2><div class="form">' + settingsFields('s-', s) + '<div class="err" id="s-err" role="alert" hidden></div></div>' +
      '<button class="btn primary" data-act="save-settings">저장</button></section>' +
      '<section class="card set-sec"><h2>화면 모드</h2><div class="radios" role="radiogroup" aria-label="화면 모드">' +
      [['system', '시스템 설정 따르기'], ['light', '라이트'], ['dark', '다크']].map(function (o) {
        return '<label class="radio"><input type="radio" name="theme" value="' + o[0] + '"' + (th === o[0] ? ' checked' : '') + '><span>' + o[1] + '</span></label>';
      }).join('') + '</div></section>' +
      '<section class="card set-sec"><h2>내 데이터</h2><p class="muted" style="margin:0 0 6px">풀이 기록 ' + nAtt + '건 · 메모 ' + nMemo + '개 · 북마크 ' + nBm + '개</p>' +
      '<p class="muted small" style="margin:0 0 12px">기록은 이 브라우저에만 저장돼요. 브라우저 데이터를 지우거나 다른 기기에서 쓰려면 백업 파일을 만들어 두세요.' +
      (db.lastExport ? ' 마지막 백업: ' + fmtDate(db.lastExport) : ' 아직 백업한 적이 없어요.') + '</p>' +
      '<div class="actions" style="margin-top:0"><button class="btn primary" data-act="export">백업 파일 만들기</button>' +
      '<button class="btn" data-act="import-pick">백업 파일 가져오기</button>' +
      '<button class="btn danger" data-act="reset">학습 기록 초기화</button></div>' +
      '<input type="file" id="f-import" accept="application/json,.json" hidden>' +
      '<div class="muted small" id="data-msg" role="status" aria-live="polite" style="margin-top:10px"></div>' +
      '<p class="muted small" style="margin:12px 0 0">초기화하면 풀이 기록, 메모, 북마크, 학습 활동이 지워져요. 시험 정보와 화면 모드는 그대로 남아요.</p></section>';
    $app.innerHTML = shell(html, 'settings');
    document.title = '설정 · 회계 기출 노트';
  }
  function exportData() {
    var data = Object.assign({}, db); delete data.uid; /* 계정 정보는 백업 파일에 넣지 않는다 */
    var payload = { app: 'gigul-note', version: 1, exportedAt: new Date().toISOString(), data: data };
    var blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = '회계기출노트-백업-' + ymd(new Date()).replace(/-/g, '') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    db.lastExport = Date.now(); save();
    toast('백업 파일을 만들었어요');
    var m = document.getElementById('data-msg'); if (m) m.textContent = '백업 파일을 내려받았어요. 이 파일은 안전한 곳에 보관하세요.';
  }
  function posInt(v, max) { var n = Number(v); return Number.isInteger(n) && n >= 0 && n <= max ? n : null; }
  /* 가져온 파일은 믿지 않고, 알고 있는 형태만 골라서 새 데이터로 만든다 */
  function sanitizeImport(raw, allowEmpty) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    var src = raw.data && typeof raw.data === 'object' ? raw.data : raw;
    var out = blankDb(), idRe = /^[A-Za-z0-9_-]{1,40}$/, now = Date.now();
    var stamp = function (v) { return typeof v === 'number' && isFinite(v) && v > 0 ? v : now; };
    var found = false;
    if (src.attempts && typeof src.attempts === 'object') {
      found = true;
      Object.keys(src.attempts).forEach(function (k) {
        var a = src.attempts[k];
        if (!a || typeof a !== 'object' || !idRe.test(k) || a.id !== k) return;
        var ex = getExam(a.examId);
        if (!ex || !Array.isArray(a.order) || !a.order.length || a.order.length > 100) return;
        var order = a.order.map(Number);
        if (!order.every(function (n) { return Number.isInteger(n) && qOf(ex, n); })) return;
        var answers = {}, checked = {}, times = {};
        Object.keys(a.answers || {}).forEach(function (no) { if (order.indexOf(+no) >= 0 && [1, 2, 3, 4].indexOf(a.answers[no]) >= 0) answers[no] = a.answers[no]; });
        Object.keys(a.checked || {}).forEach(function (no) { if (order.indexOf(+no) >= 0 && a.checked[no] === true) checked[no] = true; });
        Object.keys(a.times || {}).forEach(function (no) { var t = posInt(a.times[no], 86400); if (order.indexOf(+no) >= 0 && t !== null) times[no] = t; });
        var mode = a.mode === 'exam' ? 'exam' : 'practice';
        var na = {
          id: k, examId: ex.id, mode: mode, retry: !!a.retry, daily: !!a.daily, order: order, answers: answers, checked: checked, times: times,
          idx: Math.min(posInt(a.idx, 1000) || 0, order.length - 1), elapsed: posInt(a.elapsed, 86400) || 0,
          limitSec: mode === 'exam' ? (posInt(a.limitSec, 86400) || ex.minutes * 60) : null,
          startedAt: stamp(a.startedAt), updatedAt: stamp(a.updatedAt), submitted: !!a.submitted
        };
        if (na.submitted) na.finishedAt = stamp(a.finishedAt);
        out.attempts[k] = na;
      });
    }
    var keyOk = function (k) { var i = k.lastIndexOf(':'); var ex = getExam(k.slice(0, i)); return !!(ex && qOf(ex, parseInt(k.slice(i + 1), 10))); };
    if (src.memos && typeof src.memos === 'object') {
      found = true;
      Object.keys(src.memos).forEach(function (k) { var v = src.memos[k]; if (keyOk(k) && typeof v === 'string' && v.trim() && v.length <= 20000) out.memos[k] = v; });
    }
    if (src.bookmarks && typeof src.bookmarks === 'object') {
      found = true;
      Object.keys(src.bookmarks).forEach(function (k) { if (keyOk(k) && src.bookmarks[k]) out.bookmarks[k] = true; });
    }
    if (src.activity && typeof src.activity === 'object') {
      Object.keys(src.activity).forEach(function (k) { var n = posInt(src.activity[k], 100000); if (parseYmd(k) && n) out.activity[k] = n; });
    }
    if (src.settings && typeof src.settings === 'object') {
      var st = src.settings, g = parseInt(st.weeklyGoal, 10);
      out.settings = { examName: typeof st.examName === 'string' ? st.examName.slice(0, 40) : '', examDate: parseYmd(st.examDate) ? st.examDate : '', weeklyGoal: g >= 1 && g <= 100 ? g : 7 };
    }
    /* 동기화 표시: 수정 시각(mt), 버린 기록(gone), 초기화 시각(epoch), 설정 수정 시각 */
    var tsOk = function (v) { return typeof v === 'number' && isFinite(v) && v > 0 && v < 4102444800000; };
    if (src.mt && typeof src.mt === 'object') {
      Object.keys(src.mt).forEach(function (k) {
        if (/^[mb]:/.test(k) && keyOk(k.slice(2)) && tsOk(src.mt[k])) out.mt[k] = src.mt[k];
      });
    }
    if (src.gone && typeof src.gone === 'object') {
      Object.keys(src.gone).forEach(function (k) { if (idRe.test(k) && tsOk(src.gone[k])) out.gone[k] = src.gone[k]; });
    }
    out.epoch = tsOk(src.epoch) ? src.epoch : 0;
    out.settingsAt = tsOk(src.settingsAt) ? src.settingsAt : 0;
    out.theme = src.theme === 'light' || src.theme === 'dark' ? src.theme : null;
    out.lastExport = typeof src.lastExport === 'number' ? src.lastExport : null;
    var usable = Object.keys(out.attempts).length + Object.keys(out.memos).length + Object.keys(out.bookmarks).length;
    return allowEmpty || (found && usable) ? out : null;
  }
  function importFile(file) {
    var msg = document.getElementById('data-msg');
    var say = function (t) { if (msg) msg.textContent = t; toast(t); };
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { say('파일이 너무 커요. 5MB 이하의 백업 파일을 선택해 주세요.'); return; }
    var reader = new FileReader();
    reader.onerror = function () { say('파일을 읽지 못했어요. 다시 시도해 주세요.'); };
    reader.onload = function () {
      var parsed;
      try { parsed = JSON.parse(String(reader.result)); } catch (e) { say('백업 파일 형식이 올바르지 않아요. 이 앱에서 만든 .json 파일을 선택해 주세요.'); return; }
      var next = sanitizeImport(parsed);
      if (!next) { say('가져올 수 있는 학습 기록이 없어요. 이 앱에서 만든 백업 파일인지 확인해 주세요.'); return; }
      var nA = Object.keys(next.attempts).length, nM = Object.keys(next.memos).length, nB = Object.keys(next.bookmarks).length;
      modal({
        title: '백업을 가져올까요?', body: '풀이 기록 ' + nA + '건, 메모 ' + nM + '개, 북마크 ' + nB + '개를 가져와요. 지금 저장된 기록은 모두 이 백업으로 바뀌어요.',
        ok: '가져오기', cancel: '취소',
        onOk: function () {
          /* 가져온 내용이 서버의 기존 기록도 대신하도록 epoch 를 새로 찍는다 */
          next.uid = db.uid; next.epoch = Date.now();
          db = next; applyTheme(); save(); toast('백업을 가져왔어요'); route();
        }
      });
    };
    reader.readAsText(file);
  }
  function resetModal() {
    modal({
      title: '학습 기록을 초기화할까요?',
      html: '<div class="form"><p class="muted" style="margin:0 0 6px">풀이 기록, 메모, 북마크, 학습 활동이 모두 지워지고 되돌릴 수 없어요. 먼저 백업 파일을 만들어 두는 걸 권해요.</p>' +
        '<label for="f-confirm">계속하려면 "초기화"라고 입력하세요</label><input id="f-confirm" type="text" autocomplete="off">' +
        '<div class="err" id="f-err" role="alert" hidden></div></div>',
      ok: '초기화', cancel: '취소',
      onOk: function (root) {
        if (root.querySelector('#f-confirm').value.trim() !== '초기화') {
          var e = root.querySelector('#f-err'); e.textContent = '"초기화"를 정확히 입력해 주세요.'; e.hidden = false; return false;
        }
        var keep = { settings: db.settings, settingsAt: db.settingsAt, theme: db.theme, uid: db.uid };
        db = blankDb(); db.settings = keep.settings; db.settingsAt = keep.settingsAt; db.theme = keep.theme; db.uid = keep.uid;
        db.epoch = Date.now(); /* 다른 기기·서버에도 초기화가 전달되도록 */
        save(); toast('학습 기록을 초기화했어요'); route();
      }
    });
  }

  /* ───────── 풀이 · 해설(복습) 화면 ───────── */
  function renderSolveRoute(id, mode, no) {
    var a = db.attempts[id];
    if (!a) { toast('기록을 찾을 수 없어요'); location.hash = '#/'; return; }
    var exam = getExam(a.examId);
    if (!exam) { location.hash = '#/'; return; }
    if (mode === 'solve' && a.submitted) { location.replace('#/result/' + id); return; }
    if (mode === 'review' && !a.submitted) { location.replace('#/solve/' + id); return; }
    var idx = mode === 'review' ? Math.max(0, a.order.indexOf(no)) : Math.min(a.idx || 0, a.order.length - 1);
    view = { a: a, exam: exam, mode: mode, idx: idx, calc: newCalc(), calcOpen: false };

    /* PC에서는 메모를 열어 둔 상태(마지막 선택 기억)로 시작하고, 모바일에서는 닫힌 서랍으로 시작한다 */
    var memoOn = isDesktop() && db.memoOpen !== false;
    $app.innerHTML =
      '<div class="solve' + (memoOn ? ' memo-open' : '') + '" id="solve">' +
      '<header class="topbar">' +
      '<button class="btn ghost sm" data-act="exit" aria-label="나가기">' + IC.left + '<span class="label">' + (mode === 'review' ? '결과' : '나가기') + '</span></button>' +
      '<div class="title" id="t-title"></div>' +
      '<div class="grow">' + (mode === 'solve' ? '<div class="bar progress" aria-hidden="true"><i id="t-prog"></i></div>' : '') + '</div>' +
      /* 시간은 실전(제한 시간이 있는) 풀이에서만 보여준다. 연습은 시간을 표시하지 않는다 */
      (mode === 'solve' && a.limitSec ? '<span class="timer" id="t-timer" role="timer">' + IC.clock + '<span id="t-time"></span></span>' : '') +
      '<button class="btn ghost sm" data-act="bookmark" id="t-bm" aria-label="북마크"></button>' +
      '<button class="btn sm memo-toggle' + (memoOn ? ' on' : '') + '" id="memo-btn" data-act="memo-toggle" aria-pressed="' + memoOn + '">' + IC.pen + '<span id="memo-lbl">' + (memoOn ? '메모 닫기' : '메모') + '</span></button>' +
      (mode === 'solve' && a.mode === 'practice' ? '<button class="btn ghost sm" data-act="restart" title="이 연습의 답을 모두 지우고 처음부터 다시 풀어요">' + IC.repeat + '<span class="label">처음부터</span></button>' : '') +
      (mode === 'solve' ? '<button class="btn primary sm" data-act="submit">제출</button>' : '') +
      '</header>' +
      '<div class="navstrip"><div class="navin"><input type="range" class="slider" id="slider" min="1" max="' + a.order.length + '" step="1" value="' + (idx + 1) + '" aria-label="문제 이동. 손잡이를 끌거나 좌우 방향키로 이동해요">' +
      '<span class="navlbl num" id="n-pos" aria-live="polite"></span></div></div>' +
      '<div class="workspace" id="workspace"><main class="pane qpane" id="qpane" aria-live="polite"></main><section class="pane epane" id="epane" aria-label="해설"></section><aside class="pane mpane" id="mpane" aria-label="풀이 메모"></aside></div>' +
      '</div>';
    renderAll();
    if (mode === 'solve') startTimer();
  }

  function renderAll() {
    renderTop(); renderQuestion(); renderMemo(); renderPalette();
  }

  /* 메모 패널 열기/닫기. PC에서는 선택을 기억해서 다음 문제로 넘어가도 유지한다 */
  function isDesktop() { return window.matchMedia ? window.matchMedia('(min-width: 861px)').matches : true; }
  function setMemoOpen(open) {
    var sv = document.getElementById('solve');
    if (!sv) return;
    sv.classList.toggle('memo-open', open);
    var btn = document.getElementById('memo-btn'), lbl = document.getElementById('memo-lbl');
    if (btn) { btn.classList.toggle('on', open); btn.setAttribute('aria-pressed', String(open)); }
    if (lbl) lbl.textContent = open ? '메모 닫기' : '메모';
    if (isDesktop()) { db.memoOpen = open; saveSoon(); }
  }

  function curQ() { return qOf(view.exam, view.a.order[view.idx]); }
  function isLocked(q) {
    return view.mode === 'review' || (view.a.mode === 'practice' && view.a.checked[q.no]);
  }

  function renderTop() {
    var a = view.a, q = curQ();
    document.getElementById('t-title').textContent = view.exam.name + ' · ' + (view.idx + 1) + ' / ' + a.order.length +
      (view.mode === 'review' ? (FEATURES.explanations ? ' · 해설' : ' · 정답 확인') : (a.daily ? ' · 오늘의 한 문제' : (a.retry ? ' · 오답 복습' : '')));
    document.title = q.no + '번 · ' + view.exam.name;
    var bm = !!db.bookmarks[memoKey(view.exam.id, q.no)];
    var bmBtn = document.getElementById('t-bm');
    bmBtn.innerHTML = bm ? IC.starOn : IC.star;
    bmBtn.setAttribute('aria-pressed', bm ? 'true' : 'false');
    if (view.mode === 'solve') {
      var done = Object.keys(a.answers).length;
      document.getElementById('t-prog').style.width = (done / a.order.length * 100) + '%';
      updateTimerText();
    }
  }
  function updateTimerText() {
    var a = view.a, el = document.getElementById('t-time'), box = document.getElementById('t-timer');
    if (!el) return;
    if (a.limitSec) {
      var rem = a.limitSec - a.elapsed;
      el.textContent = fmtTime(rem);
      box.classList.toggle('low', rem <= 60);
      box.setAttribute('aria-label', '남은 시간 ' + fmtTime(rem));
    } else {
      el.textContent = fmtTime(a.elapsed);
      box.setAttribute('aria-label', '경과 시간 ' + fmtTime(a.elapsed));
    }
  }

  /* 보기(exhibit) */
  function exhibitHtml(ex) {
    if (!ex) return '';
    if (ex.kind === 'kv') {
      return '<div class="exhibit box"><div class="kv">' + ex.items.map(function (it) {
        return '<div><span>' + esc(it[0]) + '</span><span class="v">' + esc(it[1]) + '</span></div>';
      }).join('') + '</div></div>';
    }
    if (ex.kind === 'bullets') {
      return '<div class="exhibit box"><ul class="bullets">' + ex.lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>';
    }
    if (ex.kind === 'table') {
      var h = '<div class="exhibit" style="overflow-x:auto"><table class="ledger"><thead><tr>' + ex.headers.map(function (t) { return '<th scope="col">' + esc(t) + '</th>'; }).join('') + '</tr></thead><tbody>';
      ex.rows.forEach(function (r) {
        h += '<tr' + (r[0] === '합계' ? ' class="total"' : '') + '>' + r.map(function (c) {
          return c == null ? '<td class="blank" aria-label="빈칸">빈칸</td>' : '<td>' + esc(c) + '</td>';
        }).join('') + '</tr>';
      });
      return h + '</tbody></table></div>';
    }
    return '';
  }
  function choiceBody(c, q) {
    if (typeof c === 'string') return esc(c);
    if (Array.isArray(c)) {
      return '<span class="cols" style="--n:' + c.length + '">' + c.map(function (v, j) {
        return '<span class="col"><small>' + esc((q.choiceHeaders || [])[j] || '') + '</small>' + esc(v) + '</span>';
      }).join('') + '</span>';
    }
    if (c && c.journal) {
      var rows = '';
      c.journal.dr.forEach(function (r, i) { rows += '<span class="row dr"><span class="side">' + (i === 0 ? '(차)' : '') + '</span><span>' + esc(r[0]) + '</span><span class="amt">' + esc(r[1]) + '</span></span>'; });
      c.journal.cr.forEach(function (r, i) { rows += '<span class="row cr"><span class="side">' + (i === 0 ? '(대)' : '') + '</span><span>' + esc(r[0]) + '</span><span class="amt">' + esc(r[1]) + '</span></span>'; });
      return '<span class="jr">' + rows + '</span>';
    }
    return '';
  }

  function renderQuestion(keepScroll) {
    var pane = document.getElementById('qpane'), scroller = document.getElementById('workspace');
    var prevScroll = scroller ? scroller.scrollTop : 0;
    var a = view.a, q = curQ(), sel = a.answers[q.no], locked = isLocked(q);
    var total = a.order.length;
    var html = '<div class="qhead"><span class="pill accent">' + esc(q.area) + '</span><span class="pill">' + esc(q.topic) + '</span><span class="pill">' + esc(q.type) + '</span>';
    if (view.mode === 'review') {
      html += sel == null ? '<span class="pill warn">풀지 않았어요</span>' : (sel === q.answer ? '<span class="pill ok">정답</span>' : '<span class="pill bad">오답</span>');
    }
    html += '<span class="qprog muted small num">' + (view.mode === 'review' ? '정답 ' + grade(a, view.exam).ok : '푼 문제 ' + Object.keys(a.answers).length) + ' / ' + total + '</span></div>';
    html += '<div class="stem"><span class="qn">' + q.no + '.</span>' + esc(q.stem) + '</div>';
    html += exhibitHtml(q.exhibit);
    if (q.stemAfter) html += '<div class="stem stem-after">' + esc(q.stemAfter) + '</div>';
    html += '<div class="choices" role="radiogroup" aria-label="선택지">';
    q.choices.forEach(function (c, i) {
      var n = i + 1, cls = 'choice', tag = '';
      if (locked) {
        if (n === q.answer) { cls += ' correct'; tag = sel === n ? '정답 · 내 답' : '정답'; }
        else if (n === sel) { cls += ' wrong'; tag = '내 답'; }
      } else if (n === sel) cls += ' selected';
      html += '<button class="' + cls + '" role="radio" aria-checked="' + (n === sel) + '" data-act="pick" data-n="' + n + '"' + (locked ? ' disabled' : '') + '>' +
        '<span class="cn">' + n + '</span><span>' + choiceBody(c, q) +
        (tag ? '<span class="tag" style="color:' + (n === q.answer ? 'var(--ok)' : 'var(--bad)') + '">' + tag + '</span>' : '') + '</span></button>';
    });
    html += '</div>';
    if (view.mode === 'solve' && a.mode === 'practice' && !locked) {
      html += '<div style="margin-top:12px"><button class="btn primary" data-act="check"' + (sel == null ? ' disabled' : '') + '>정답 확인</button>' +
        (sel == null ? '<span class="muted small" style="margin-left:10px">답을 고르면 확인할 수 있어요</span>' : '') + '</div>';
    }
    if (locked) {
      var right = sel === q.answer;
      html += '<div class="explain ' + (sel == null ? '' : (right ? 'ok' : 'bad')) + '"><b>' +
        (sel == null ? '정답은 ' + CIRC[q.answer - 1] + '번이에요' : (right ? '정답이에요' : '아쉬워요. 정답은 ' + CIRC[q.answer - 1] + '번이에요')) + '</b></div>';
      /* 상세 해설: PC → epane (가운데 패널), 모바일 → qpane 인라인 */
      var expContent = '';
      if (FEATURES.explanations) {
        expContent = (q.explanation && q.explanationStatus === 'draft' ? '<div style="margin-bottom:8px"><span class="pill warn" title="AI가 작성한 초안이에요. 검수 전이라 틀린 내용이 있을 수 있어요.">AI 초안 · 검수 전</span></div>' : '') +
          '<div class="exp-text">' + (q.explanation ? renderMd(q.explanation) : '<span class="muted">이 문제의 해설은 아직 준비 중이에요. 풀이 메모에 내 풀이를 남겨두세요.</span>') + '</div>';
      }
      if (expContent) {
        /* 모바일 인라인 폴백 (PC에서는 CSS로 숨김) */
        html += '<div class="exp-inline">' + expContent + '</div>';
        /* PC 전용 epane */
        var epane = document.getElementById('epane');
        if (epane) epane.innerHTML = '<div class="epane-inner">' + expContent + '</div>';
      }
      var sv = document.getElementById('solve');
      if (sv) sv.classList.toggle('exp-open', !!expContent);
      if (view.mode === 'solve' && a.mode === 'practice') {
        html += '<div style="margin-top:10px"><button class="btn" data-act="retry-q">' + IC.repeat + '이 문제 다시 풀기</button></div>';
      } else if (view.mode === 'review') {
        html += '<div style="margin-top:10px"><button class="btn" data-act="start-single" data-exam="' + view.exam.id + '" data-no="' + q.no + '">' + IC.repeat + '이 문제 다시 풀기</button></div>';
      }
    } else {
      /* 아직 안 풀었으면 해설 패널 비우기 */
      var epane2 = document.getElementById('epane');
      if (epane2) epane2.innerHTML = '';
      var sv2 = document.getElementById('solve');
      if (sv2) sv2.classList.remove('exp-open');
    }
    /* 이전 · 다음: 문제 바로 아래. 이전은 왼쪽, 다음은 오른쪽 끝 */
    var first = view.idx === 0, last = view.idx === total - 1;
    html += '<div class="qnav"><button class="btn" data-act="prev"' + (first ? ' disabled' : '') + '>' + IC.left + '이전</button><span class="grow"></span>' +
      (view.mode === 'solve' && last
        ? '<button class="btn primary" data-act="next">제출하기</button>'
        : '<button class="btn" data-act="next"' + (last ? ' disabled' : '') + '>다음' + IC.right + '</button>') + '</div>';
    pane.innerHTML = html;
    if (scroller) scroller.scrollTop = keepScroll ? prevScroll : 0;
  }

  /* 메모 · 계산기 */
  var TEMPLATES = {
    t: '[계정명]\n  차변        │  대변\n  ────────────┼────────────\n              │\n',
    month: '금액 × n/12 = \n',
    journal: '(차) 계정            금액\n   (대) 계정         금액\n',
    timeline: '|----------|----------|----------|\n시작       중간       기말\n'
  };
  function renderMemo() {
    var q = curQ(), key = memoKey(view.exam.id, q.no);
    var html = '<h3>' + IC.pen + '풀이 메모 <span class="muted small">' + q.no + '번</span><button class="btn ghost sm memo-close" data-act="memo-toggle" style="margin-left:auto">닫기</button></h3>' +
      '<div class="templates">' +
      '<button class="btn sm" data-act="tpl" data-t="t">T계정</button>' +
      '<button class="btn sm" data-act="tpl" data-t="month">월할 ×/12</button>' +
      '<button class="btn sm" data-act="tpl" data-t="journal">분개</button>' +
      '<button class="btn sm" data-act="tpl" data-t="timeline">타임라인</button>' +
      '<button class="btn sm" data-act="calc-toggle" aria-expanded="' + view.calcOpen + '">' + IC.calc + '계산기</button></div>';
    if (view.calcOpen) html += calcHtml();
    html += '<textarea class="memo" id="memo" placeholder="계산 과정이나 개념을 적어보세요" spellcheck="false" aria-label="' + q.no + '번 풀이 메모">' + esc(db.memos[key] || '') + '</textarea>' +
      '<div class="mfoot"><span>자동 저장돼요</span><span>1~4 선택 · ←/→ 이동 · M 메모 · B 북마크</span></div>';
    document.getElementById('mpane').innerHTML = html;
  }
  function insertAtCaret(text) {
    var ta = document.getElementById('memo');
    if (!ta) return;
    var s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
    var prefix = (s > 0 && v.charAt(s - 1) !== '\n') ? '\n' : '';
    ta.value = v.slice(0, s) + prefix + text + v.slice(e);
    var pos = s + prefix.length + text.length;
    ta.selectionStart = ta.selectionEnd = pos;
    ta.focus();
    onMemoInput(ta);
  }
  function onMemoInput(ta) {
    var q = curQ(), key = memoKey(view.exam.id, q.no);
    setMemo(key, ta.value);
    saveSoon();
  }

  function newCalc() { return { cur: '0', acc: null, op: null, fresh: true }; }
  var CALC_KEYS = ['C', '⌫', '÷', '×', '7', '8', '9', '−', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.', '00', '붙이기'];
  function calcFmt(s) {
    if (s === '오류') return s;
    var neg = s.charAt(0) === '-', body = neg ? s.slice(1) : s;
    var parts = body.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + parts.join('.');
  }
  function calcHtml() {
    return '<div class="calc" aria-label="계산기"><div class="disp" id="calc-disp">' + esc(calcFmt(view.calc.cur)) + '</div><div class="keys">' +
      CALC_KEYS.map(function (k) {
        var op = '÷×−+='.indexOf(k) >= 0 || k === '붙이기';
        return '<button' + (op ? ' class="op"' : '') + ' data-act="calc" data-k="' + k + '">' + k + '</button>';
      }).join('') + '</div></div>';
  }
  function calcApply(c) {
    var x = parseFloat(c.acc), y = parseFloat(c.cur), r;
    if (c.op === '+') r = x + y; else if (c.op === '−') r = x - y; else if (c.op === '×') r = x * y;
    else if (c.op === '÷') r = y === 0 ? NaN : x / y; else r = y;
    if (!isFinite(r)) return '오류';
    return String(+r.toFixed(8));
  }
  function calcKey(k) {
    var c = view.calc;
    if (c.cur === '오류' && k !== 'C') { return; }
    if (/^[0-9]$/.test(k) || k === '00') {
      if (c.fresh) { c.cur = k === '00' ? '0' : k; c.fresh = false; }
      else if (c.cur.replace(/[-.]/g, '').length < 14) c.cur = (c.cur === '0' ? '' : c.cur) + (c.cur === '0' && k === '00' ? '0' : k);
    } else if (k === '.') {
      if (c.fresh) { c.cur = '0.'; c.fresh = false; } else if (c.cur.indexOf('.') < 0) c.cur += '.';
    } else if (k === 'C') { view.calc = newCalc(); }
    else if (k === '⌫') {
      if (!c.fresh) { c.cur = c.cur.length > 1 ? c.cur.slice(0, -1) : '0'; if (c.cur === '-') c.cur = '0'; }
    } else if (k === '=') {
      if (c.op) { c.cur = calcApply(c); c.acc = null; c.op = null; c.fresh = true; }
    } else if (k === '붙이기') {
      if (c.cur !== '오류') insertAtCaret(calcFmt(c.cur));
      return;
    } else { /* 연산자 */
      if (c.op && !c.fresh) { c.cur = calcApply(c); }
      c.acc = c.cur; c.op = k; c.fresh = true;
    }
    var d = document.getElementById('calc-disp');
    if (d) d.textContent = calcFmt(view.calc.cur);
  }

  /* 위쪽 슬라이더와 아래쪽 진행 문구를 현재 상태에 맞춘다. 슬라이더 요소는 새로 만들지 않고 값만 바꾼다(끄는 중에 끊기지 않게) */
  function renderPalette() {
    var a = view.a, total = a.order.length;
    var s = document.getElementById('slider');
    if (s) {
      if (s.value !== String(view.idx + 1)) s.value = view.idx + 1;
      s.style.setProperty('--pct', (total > 1 ? view.idx / (total - 1) * 100 : 0) + '%');
      s.setAttribute('aria-valuetext', (view.idx + 1) + '번째 문제, 전체 ' + total + '문제 중');
    }
    document.getElementById('n-pos').textContent = (view.idx + 1) + ' / ' + total;
  }

  /* 동작 */
  function gotoIdx(i) {
    if (i < 0 || i >= view.a.order.length) return;
    view.idx = i;
    if (view.mode === 'solve') { view.a.idx = i; view.a.updatedAt = Date.now(); saveSoon(); }
    renderAll();
    /* 모바일 서랍은 문제를 넘기면 닫고, PC에서는 열어 둔 메모를 그대로 유지한다 */
    if (!isDesktop()) { var solve = document.getElementById('solve'); if (solve) { solve.classList.remove('memo-open'); setMemoOpen(false); } }
    if (view.mode === 'review') history.replaceState(null, '', '#/review/' + view.a.id + '/' + view.a.order[i]);
  }
  function pick(n) {
    var q = curQ();
    if (isLocked(q) || view.mode !== 'solve') return;
    /* 같은 문제를 다시 풀어도 학습 활동은 한 번만 센다 */
    if (view.a.answers[q.no] == null && !(view.a.counted && view.a.counted[q.no])) {
      recordActivity();
      (view.a.counted = view.a.counted || {})[q.no] = true;
    }
    view.a.answers[q.no] = n;
    view.a.updatedAt = Date.now();
    saveSoon();
    renderQuestion(true); renderPalette(); renderTop();
  }
  function checkAnswer() {
    var q = curQ();
    if (view.a.answers[q.no] == null) return;
    view.a.checked[q.no] = true;
    view.a.updatedAt = Date.now();
    saveSoon();
    renderQuestion(true);
    var pane = document.getElementById('qpane');
    var ex = pane.querySelector('.explain'); if (ex && ex.scrollIntoView) ex.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function toggleBookmark() {
    var q = curQ(), key = memoKey(view.exam.id, q.no);
    if (db.bookmarks[key]) { setBookmark(key, false); toast('북마크를 해제했어요'); }
    else { setBookmark(key, true); toast('북마크했어요'); }
    saveSoon(); renderTop(); renderPalette();
  }
  function submitAttempt(auto) {
    var a = view.a;
    a.submitted = true; a.finishedAt = Date.now(); a.updatedAt = a.finishedAt;
    save();
    if (auto) toast('시간이 끝나 제출했어요');
    stopTimer();
    location.hash = '#/result/' + a.id;
  }
  function askSubmit() {
    var a = view.a, left = a.order.length - Object.keys(a.answers).length;
    modal({
      title: '제출할까요?',
      body: left ? '아직 ' + left + '문제를 풀지 않았어요. 풀지 않은 문제는 "안 푼 문제"로 표시되고 점수에는 반영되지 않아요.' : '모든 문제에 답했어요. 제출하면 채점돼요.',
      ok: '제출하기', cancel: '계속 풀기', onOk: function () { submitAttempt(false); }
    });
  }
  function startTimer() {
    stopTimer();
    var last = Date.now();
    timerId = setInterval(function () {
      if (!view || view.mode !== 'solve') return;
      var now = Date.now(), dt = Math.floor((now - last) / 1000);
      if (dt < 1) return;
      last += dt * 1000;
      dt = Math.min(dt, 120);
      var a = view.a, q = curQ();
      a.elapsed += dt;
      a.times[q.no] = (a.times[q.no] || 0) + dt;
      updateTimerText();
      if (a.elapsed % 10 < dt) { a.updatedAt = now; save(); }
      if (a.limitSec && a.elapsed >= a.limitSec) submitAttempt(true);
    }, 1000);
  }

  /* ───────── 결과 화면 ───────── */
  function renderResult(id) {
    var a = db.attempts[id];
    if (!a) { location.hash = '#/'; return; }
    if (!a.submitted) { location.replace('#/solve/' + id); return; }
    var exam = getExam(a.examId);
    var g = grade(a, exam);
    function rate(filterFn, label) {
      var set = g.items.filter(filterFn);
      if (!set.length) return '';
      var ok = set.filter(function (i) { return i.status === 'ok'; }).length;
      var pct = Math.round(ok / set.length * 100);
      return '<div class="rate"><span>' + esc(label) + '</span><div class="bar" role="img" aria-label="' + esc(label) + ' 정답률 ' + pct + '%"><i style="width:' + pct + '%"></i></div><span class="val">' + ok + '/' + set.length + ' · ' + pct + '%</span></div>';
    }
    var areas = [], types = [];
    g.items.forEach(function (i) { if (areas.indexOf(i.q.area) < 0) areas.push(i.q.area); if (types.indexOf(i.q.type) < 0) types.push(i.q.type); });
    var html = '<h1 class="page-title">결과</h1><p class="page-sub">' + esc(exam.name) + ' · ' + modeLabel(a) + ' · ' + fmtDate(a.finishedAt) + '</p>' +
      '<div class="stats">' +
      '<div class="card stat"><div class="k">점수</div><div class="v">' + g.score + '점</div></div>' +
      '<div class="card stat"><div class="k">정답</div><div class="v">' + g.ok + ' <span class="muted" style="font-size:16px">/ ' + g.total + '</span></div></div>' +
      (a.mode === 'exam' ? '<div class="card stat"><div class="k">소요 시간</div><div class="v">' + fmtTime(a.elapsed) + '</div></div>' : '') +
      (g.skip ? '<div class="card stat"><div class="k">안 푼 문제</div><div class="v">' + g.skip + '</div></div>' : '') +
      '</div>' +
      '<div class="two"><div class="card"><div class="section-label" style="margin-top:0">영역별 정답률</div>' +
      areas.map(function (ar) { return rate(function (i) { return i.q.area === ar; }, ar); }).join('') +
      '<div class="section-label">유형별 정답률</div>' +
      types.map(function (t) { return rate(function (i) { return i.q.type === t; }, t); }).join('') + '</div>' +
      '<div class="card"><div class="section-label" style="margin-top:0">문항별 결과</div><div class="chips">' +
      g.items.map(function (i) {
        var bm = db.bookmarks[memoKey(exam.id, i.no)];
        return '<button class="pn ' + (i.status === 'ok' ? 'ok' : i.status === 'bad' ? 'bad' : '') + '" data-act="review" data-id="' + a.id + '" data-no="' + i.no + '" aria-label="' + i.no + '번 ' + (i.status === 'ok' ? '정답' : i.status === 'bad' ? '오답' : '안 푼 문제') + ' 정답 확인">' + i.no + (bm ? '<span class="dot"></span>' : '') + '</button>';
      }).join('') + '</div>' +
      '<div class="legend"><span><i style="background:var(--ok-bg);border-color:var(--ok-line)"></i>정답</span><span><i style="background:var(--bad-bg);border-color:var(--bad-line)"></i>오답</span><span><i></i>안 푼 문제</span></div>' +
      '<div class="muted small" style="margin-top:10px">번호를 누르면 정답과 내 풀이를 볼 수 있어요.</div></div></div>' +
      '<div class="actions">' +
      (g.bad ? '<button class="btn primary" data-act="retry-wrong" data-id="' + a.id + '">틀린 ' + g.bad + '문제 다시 풀기</button>' : '') +
      '<button class="btn' + (g.bad ? '' : ' primary') + '" data-act="review" data-id="' + a.id + '" data-no="' + (g.items[0].no) + '">전체 정답 확인</button>' +
      '<button class="btn" data-act="again" data-id="' + a.id + '">처음부터 다시 풀기</button>' +
      '<a class="btn" href="#/exams">기출 목록으로</a>' + (FEATURES.planner ? '<a class="btn" href="#/">플래너로</a>' : '') + '</div>';
    $app.innerHTML = shell(html, 'exams');
    document.title = '결과 · ' + exam.name;
  }

  /* ───────── 이벤트 ───────── */
  $app.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]');
    if (!t || t.disabled) return;
    var act = t.getAttribute('data-act');
    switch (act) {
      case 'theme': toggleTheme(); break;
      case 'login': doLogin(); break;
      case 'acct': acctModal(); break;
      case 'start': {
        var exId = t.getAttribute('data-exam'), mode = t.getAttribute('data-mode');
        guardOpen(exId, function () { startAttempt(exId, mode); });
        break;
      }
      case 'start-daily': {
        var dEx = t.getAttribute('data-exam'), dNo = parseInt(t.getAttribute('data-no'), 10);
        guardOpen(dEx, function () { startDaily(dEx, dNo); });
        break;
      }
      case 'settings': settingsModal(); break;
      case 'wrong-filter': ui.wrongFilter = t.getAttribute('data-f'); renderWrong(); break;
      case 'start-single': {
        var sEx = t.getAttribute('data-exam'), sNo = parseInt(t.getAttribute('data-no'), 10);
        guardOpen(sEx, function () { startSingle(sEx, sNo); });
        break;
      }
      case 'bm-toggle': {
        var bk = memoKey(t.getAttribute('data-exam'), t.getAttribute('data-no'));
        setBookmark(bk, !db.bookmarks[bk]);
        save(); route();
        break;
      }
      case 'memo-delete': {
        var mk = t.getAttribute('data-key');
        modal({ title: '메모를 삭제할까요?', body: '삭제한 메모는 되돌릴 수 없어요.', ok: '삭제', cancel: '취소', onOk: function () { setMemo(mk, ''); save(); route(); } });
        break;
      }
      case 'save-settings': {
        var r = readSettingsForm($app, 's-'), er = document.getElementById('s-err');
        if (r.error) { er.textContent = r.error; er.hidden = false; $app.querySelector(r.id).focus(); break; }
        touchSettings(r.value); save(); toast('저장했어요');
        er.hidden = true;
        break;
      }
      case 'export': exportData(); break;
      case 'import-pick': { var fi = document.getElementById('f-import'); if (fi) fi.click(); break; }
      case 'reset': resetModal(); break;
      case 'resume': go('#/solve/' + t.getAttribute('data-id')); break;
      case 'discard': {
        var did = t.getAttribute('data-id');
        modal({ title: '풀던 기록을 버릴까요?', body: '이 기록은 되돌릴 수 없어요. 메모는 남아요.', ok: '버리기', cancel: '취소', onOk: function () { dropAttempt(did); save(); route(); } });
        break;
      }
      case 'open-result': go('#/result/' + t.getAttribute('data-id')); break;
      case 'review': go('#/review/' + t.getAttribute('data-id') + '/' + t.getAttribute('data-no')); break;
      case 'retry-wrong': {
        var src = db.attempts[t.getAttribute('data-id')], sex = getExam(src.examId);
        var nos = grade(src, sex).items.filter(function (i) { return i.status === 'bad'; }).map(function (i) { return i.no; });
        guardOpen(src.examId, function () {
          var a = { id: uid(), examId: src.examId, mode: 'practice', retry: true, order: nos, answers: {}, checked: {}, times: {}, idx: 0, elapsed: 0, limitSec: null, startedAt: Date.now(), updatedAt: Date.now(), submitted: false };
          db.attempts[a.id] = a; save(); go('#/solve/' + a.id);
        });
        break;
      }
      case 'again': {
        var s2 = db.attempts[t.getAttribute('data-id')];
        guardOpen(s2.examId, function () {
          var a = { id: uid(), examId: s2.examId, mode: s2.mode, retry: !!s2.retry, daily: !!s2.daily, order: s2.order.slice(), answers: {}, checked: {}, times: {}, idx: 0, elapsed: 0, limitSec: s2.limitSec || null, startedAt: Date.now(), updatedAt: Date.now(), submitted: false };
          db.attempts[a.id] = a; save(); go('#/solve/' + a.id);
        });
        break;
      }
      case 'exit':
        if (view && view.mode === 'review') go('#/result/' + view.a.id);
        else { save(); go('#/'); }
        break;
      case 'pick': pick(parseInt(t.getAttribute('data-n'), 10)); break;
      case 'check': checkAnswer(); break;
      case 'retry-q': {
        var rq = curQ();
        delete view.a.answers[rq.no]; delete view.a.checked[rq.no];
        view.a.updatedAt = Date.now(); saveSoon();
        renderAll();
        break;
      }
      case 'restart':
        modal({
          title: '처음부터 다시 풀까요?', body: '이 연습에서 고른 답과 정답 확인 기록이 모두 지워지고 1번부터 다시 시작해요. 풀이 메모는 남아요.',
          ok: '처음부터 다시', cancel: '계속 풀기',
          onOk: function () {
            var ra = view.a;
            ra.answers = {}; ra.checked = {}; ra.times = {}; ra.elapsed = 0; ra.idx = 0; ra.updatedAt = Date.now();
            view.idx = 0; save(); renderAll(); toast('처음부터 다시 시작해요');
          }
        });
        break;
      case 'bookmark': toggleBookmark(); break;
      case 'submit': askSubmit(); break;
      case 'prev': gotoIdx(view.idx - 1); break;
      case 'next':
        if (view.mode === 'solve' && view.idx === view.a.order.length - 1) askSubmit(); else gotoIdx(view.idx + 1);
        break;
      case 'goto': { var gi = parseInt(t.getAttribute('data-i'), 10); if (gi !== view.idx) gotoIdx(gi); break; }
      case 'tpl': insertAtCaret(TEMPLATES[t.getAttribute('data-t')]); break;
      case 'calc-toggle': view.calcOpen = !view.calcOpen; renderMemo(); break;
      case 'calc': calcKey(t.getAttribute('data-k')); break;
      case 'memo-toggle': { var sv = document.getElementById('solve'); setMemoOpen(!sv.classList.contains('memo-open')); break; }
    }
  });
  $app.addEventListener('input', function (e) {
    if (!e.target) return;
    if (e.target.id === 'memo') onMemoInput(e.target);
    else if (e.target.id === 'slider') {
      /* 슬라이더 손잡이를 끄는 동안 지나가는 문제로 바로 이동 */
      if (view) { var si = parseInt(e.target.value, 10) - 1; if (si !== view.idx) gotoIdx(si); }
    } else if (e.target.id === 'memo-q') {
      ui.memoQuery = e.target.value;
      document.getElementById('memo-list').innerHTML = memoListHtml(ui.memoQuery);
    } else if (e.target.id && e.target.id.indexOf('s-') === 0) {
      var er = document.getElementById('s-err'); if (er) er.hidden = true;
    }
  });
  $app.addEventListener('change', function (e) {
    var t = e.target;
    if (!t) return;
    if (t.name === 'theme') {
      db.theme = t.value === 'system' ? null : t.value;
      applyTheme(); save(); toast('저장했어요'); route();
    } else if (t.id === 'f-import') {
      importFile(t.files && t.files[0]);
      t.value = '';
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); if (!isDesktop()) setMemoOpen(false); return; }
    if (!view || document.getElementById('modal-root')) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'input') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key >= '1' && e.key <= '4') { pick(parseInt(e.key, 10)); }
    else if (e.key === 'ArrowLeft') gotoIdx(view.idx - 1);
    else if (e.key === 'ArrowRight') gotoIdx(view.idx + 1);
    else if (e.key === 'Enter' && view.mode === 'solve' && view.a.mode === 'practice' && tag !== 'button') checkAnswer();
    else if (e.key === 'm' || e.key === 'M' || e.key === 'ㅡ') { e.preventDefault(); setMemoOpen(true); var ta = document.getElementById('memo'); if (ta) ta.focus(); }
    else if (e.key === 'b' || e.key === 'B' || e.key === 'ㅠ') toggleBookmark();
  });

  route();
  if (Cloud && Cloud.configured) Cloud.onAuth(onAuthChanged);
})();
