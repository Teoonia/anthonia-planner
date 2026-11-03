import { initializeApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendPasswordResetEmail, signOut
} from "firebase/auth";
import {
  initializeFirestore, persistentLocalCache, collection, doc, onSnapshot,
  addDoc, setDoc, updateDoc, deleteDoc, writeBatch
} from "firebase/firestore";
import { firebaseConfig } from "./firebase-config.js";

export const configured = !String(firebaseConfig.apiKey || "").includes("PASTE");

export let app = null;
let auth = null, fs = null;
if (configured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // offline cache: the plan keeps working on the train without signal
  fs = initializeFirestore(app, { localCache: persistentLocalCache() });
}

export function watchUser(cb) {
  if (!auth) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, cb);
}
export const signIn = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const signUp = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const logOut = () => signOut(auth);

/* Small adapter so the planner code talks to Firestore the same way it
   talked to the Claude artifact store. Everything lives under users/{uid}. */
export function makeDb(uid) {
  const base = `users/${uid}`;
  const wrapDoc = (s) => ({ id: s.id, exists: s.exists(), data: () => s.data(), metadata: s.metadata });
  const docRef = (path) => {
    const r = doc(fs, `${base}/${path}`);
    return {
      set: (d) => setDoc(r, d),
      update: (d) => updateDoc(r, d),
      delete: () => deleteDoc(r),
      onSnapshot: (cb, err) => onSnapshot(r, (s) => cb(wrapDoc(s)), err)
    };
  };
  return {
    collection: (name) => ({
      add: (d) => addDoc(collection(fs, `${base}/${name}`), d),
      doc: (id) => docRef(`${name}/${id}`),
      onSnapshot: (cb, err) => onSnapshot(collection(fs, `${base}/${name}`), cb, err)
    }),
    doc: (path) => docRef(path),
    /* one-time import of the plan built in Claude */
    async importSeed(seed) {
      const ops = [];
      for (const [col, docs] of Object.entries(seed))
        for (const [id, data] of Object.entries(docs)) ops.push([col, id, data]);
      for (let i = 0; i < ops.length; i += 400) {
        const b = writeBatch(fs);
        ops.slice(i, i + 400).forEach(([col, id, data]) => b.set(doc(fs, `${base}/${col}/${id}`), data));
        await b.commit();
      }
    }
  };
}
