// Pods ↔ Firebase (same project as Weekly Board: anthonia-planner).
// Loaded as a module; hands app.js a small API on window.FB.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, collection, onSnapshot, setDoc, getDoc, updateDoc, deleteDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAsBRd-lx3C9jdgb3AhHoQe-ACU63jqg68",
  authDomain: "anthonia-planner.firebaseapp.com",
  projectId: "anthonia-planner",
  storageBucket: "anthonia-planner.firebasestorage.app",
  messagingSenderId: "961384305280",
  appId: "1:961384305280:web:c4f9e74daf4ee3f8258c65"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});
let db;
try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); }
catch (e) { db = initializeFirestore(app, {}); }

const d = (p) => doc(db, p);
window.FB = {
  onAuth: (cb) => onAuthStateChanged(auth, cb),
  signIn: (e, p) => signInWithEmailAndPassword(auth, e, p),
  signUp: (e, p) => createUserWithEmailAndPassword(auth, e, p),
  reset: (e) => sendPasswordResetEmail(auth, e),
  signOut: () => signOut(auth),
  watchDoc: (p, cb, err) => onSnapshot(d(p), (s) => cb(s.exists() ? s.data() : null), err),
  watchCol: (p, cb, err, opt) => {
    let q = collection(db, p);
    const parts = [];
    if (opt && opt.order) parts.push(orderBy(opt.order, opt.dir || "asc"));
    if (opt && opt.limit) parts.push(limit(opt.limit));
    if (parts.length) q = query(q, ...parts);
    return onSnapshot(q, (s) => cb(s.docs.map((x) => ({ id: x.id, ...x.data() }))), err);
  },
  get: async (p) => { const s = await getDoc(d(p)); return s.exists() ? s.data() : null; },
  set: (p, data) => setDoc(d(p), data),
  merge: (p, data) => setDoc(d(p), data, { merge: true }),
  update: (p, data) => updateDoc(d(p), data),
  del: (p) => deleteDoc(d(p)),
};
window.dispatchEvent(new Event("fb-ready"));
