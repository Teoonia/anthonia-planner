// In-memory stand-in for firebase.js, used only by the smoke test.
import seed from "../src/seed.json";
export const configured = true;
const store = JSON.parse(JSON.stringify(seed));
const subs = [];
const emit = () => subs.forEach(f => f());
export function watchUser(cb) { setTimeout(() => cb({ uid: "test", email: "test@example.com" }), 50); return () => {}; }
export const signIn = async () => {}; export const signUp = async () => {}; export const resetPassword = async () => {}; export const logOut = async () => {};
export function makeDb() {
  const col = (n) => (store[n] ||= {});
  const docApi = (n, id) => ({
    set: async (d) => { col(n)[id] = d; emit(); }, update: async (d) => { Object.assign(col(n)[id], d); emit(); },
    delete: async () => { delete col(n)[id]; emit(); },
    onSnapshot: (cb) => { const f = () => cb({ id, exists: !!col(n)[id], data: () => col(n)[id], metadata: { fromCache: false } }); subs.push(f); setTimeout(f, 10); return () => {}; }
  });
  return {
    collection: (n) => ({
      add: async (d) => { const id = "x" + Math.random().toString(36).slice(2); col(n)[id] = d; emit(); return { id }; },
      doc: (id) => docApi(n, id),
      onSnapshot: (cb) => { const f = () => cb({ docs: Object.entries(col(n)).map(([id, d]) => ({ id, data: () => d })), metadata: { fromCache: false } }); subs.push(f); setTimeout(f, 10); return () => {}; }
    }),
    doc: (p) => { const [n, id] = p.split("/"); return docApi(n, id); },
    importSeed: async () => {}
  };
}
export const app = null;
