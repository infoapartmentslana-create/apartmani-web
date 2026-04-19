import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyCBdX97UM6bmCAZ_GTJjD-iB0rnaOqWWL4",
  authDomain: "apartman-kalendar.firebaseapp.com",
  projectId: "apartman-kalendar",
  storageBucket: "apartman-kalendar.firebasestorage.app",
  messagingSenderId: "10704673176",
  appId: "1:10704673176:web:5e72bb60594045a402f3ed"
});

const db = getFirestore(app);

window._aptCache = { a1: {}, a2: {}, a3: {} };

let _resolveReady;
window._aptDBReady = new Promise(r => { _resolveReady = r; });

const _loaded = new Set();
['a1', 'a2', 'a3'].forEach(id => {
  onSnapshot(
    doc(db, 'calendars', id),
    snap => {
      window._aptCache[id] = snap.exists() ? (snap.data().days || {}) : {};
      _loaded.add(id);
      if (_loaded.size === 3) _resolveReady();
    },
    () => {
      _loaded.add(id);
      if (_loaded.size === 3) _resolveReady();
    }
  );
});

window.aptDB = {
  async save(id, data) {
    window._aptCache[id] = data;
    await setDoc(doc(db, 'calendars', id), { days: data });
  },
  async isInit(flag) {
    try {
      const snap = await getDoc(doc(db, 'calendars', '_meta'));
      return snap.exists() && snap.data()[flag] === true;
    } catch { return false; }
  },
  async setInit(flag) {
    try {
      const snap = await getDoc(doc(db, 'calendars', '_meta'));
      const prev = snap.exists() ? snap.data() : {};
      await setDoc(doc(db, 'calendars', '_meta'), { ...prev, [flag]: true });
    } catch (e) { console.warn('aptDB.setInit', e); }
  }
};
