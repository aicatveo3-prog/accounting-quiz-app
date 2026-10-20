/* 구글 로그인 + 서버(Firestore) 저장 어댑터
 *
 * 앱 본체(app.js)는 Firebase 를 직접 모르고 아래 window.GigulCloud 만 써요.
 * 나중에 Supabase 등으로 바꿔도 이 파일만 고치면 돼요.
 *
 *   GigulCloud.configured            Firebase 연결 정보가 있는지
 *   GigulCloud.canSignIn()           지금 주소에서 로그인할 수 있는지 (file:// 은 안 돼요)
 *   GigulCloud.onAuth(cb)            cb(user | null, error?)  user = {uid, name, email, photo}
 *   GigulCloud.signIn() / signOut()
 *   GigulCloud.read(uid)             → {rev, data} | null
 *   GigulCloud.update(uid, fn)       트랜잭션: fn(현재문서|null) → 새 data. → {rev, data}
 *
 * 서버에는 users/{uid} 문서 하나만 만들어요: { rev, data(JSON 문자열), updatedAt }
 */
(function () {
  'use strict';
  var cfg = window.FIREBASE_CONFIG;
  var C = window.GigulCloud = {
    configured: !!(cfg && cfg.apiKey && cfg.projectId),
    canSignIn: function () { return C.configured && /^https?:$/.test(location.protocol); }
  };
  if (!C.configured) return;

  var VER = '10.12.2';
  var BASE = 'https://www.gstatic.com/firebasejs/' + VER + '/';
  var firebaseReady = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve;
      s.onerror = function () { reject(Object.assign(new Error('sdk-load'), { code: 'sdk-load' })); };
      document.head.appendChild(s);
    });
  }
  /* 로그인할 수 없는 주소(file://)에서는 SDK 를 아예 불러오지 않는다 */
  function ready() {
    if (!firebaseReady) {
      firebaseReady = loadScript(BASE + 'firebase-app-compat.js')
        .then(function () { return Promise.all([loadScript(BASE + 'firebase-auth-compat.js'), loadScript(BASE + 'firebase-firestore-compat.js')]); })
        .then(function () { if (!firebase.apps.length) firebase.initializeApp(cfg); return firebase; });
    }
    return firebaseReady;
  }

  function toUser(u) {
    return u ? { uid: u.uid, name: u.displayName || '', email: u.email || '', photo: u.photoURL || '' } : null;
  }
  function parseDoc(d) {
    var data = null;
    try { data = JSON.parse(d.data); } catch (e) { data = null; }
    return { rev: typeof d.rev === 'number' ? d.rev : 0, data: data && typeof data === 'object' ? data : null };
  }

  C.onAuth = function (cb) {
    if (!C.canSignIn()) { cb(null); return; }
    ready().then(function (fb) {
      fb.auth().onAuthStateChanged(function (u) { cb(toUser(u)); }, function (err) { cb(null, err); });
    }).catch(function (err) { cb(null, err); });
  };
  C.signIn = function () {
    if (!C.canSignIn()) return Promise.reject(Object.assign(new Error('file-protocol'), { code: 'file-protocol' }));
    return ready().then(function (fb) {
      var p = new fb.auth.GoogleAuthProvider();
      p.setCustomParameters({ prompt: 'select_account' });
      return fb.auth().signInWithPopup(p);
    });
  };
  C.signOut = function () { return ready().then(function (fb) { return fb.auth().signOut(); }); };

  function ref(fb, uid) { return fb.firestore().collection('users').doc(uid); }

  C.read = function (uid) {
    return ready().then(function (fb) { return ref(fb, uid).get(); }).then(function (snap) {
      return snap.exists ? parseDoc(snap.data()) : null;
    });
  };
  C.update = function (uid, fn) {
    return ready().then(function (fb) {
      var r = ref(fb, uid);
      return fb.firestore().runTransaction(function (tx) {
        return tx.get(r).then(function (snap) {
          var cur = snap.exists ? parseDoc(snap.data()) : null;
          var next = fn(cur);
          var rev = (cur ? cur.rev : 0) + 1;
          tx.set(r, { rev: rev, data: JSON.stringify(next), updatedAt: fb.firestore.FieldValue.serverTimestamp() });
          return { rev: rev, data: next };
        });
      });
    });
  };
})();
