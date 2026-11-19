// Stand-in for Mini Mi in the smoke test: answers like the real one would.
export { systemPrompt, friendlyError, AREA_IDS } from "../src/partner.js";
const pad = (n) => String(n).padStart(2, "0");
const today = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
export async function askPartner({ system, message }) {
  window.__lastSystem = system;
  await new Promise((r) => setTimeout(r, 400));
  if (/portfolio/i.test(message)) return {
    reply: "On it. Client portfolio goes in after your class, when you're fresh.",
    actions: [{ title: "Update client portfolio", date: today(), notBefore: "14:00", mins: 60, area: "staff" }],
    projectNotes: [{ project: "Income: online gigs and part-time work", note: "Applied to 2 shop jobs via Adecco", isNew: false }],
    suggestions: []
  };
  if (/wrong day/i.test(message)) {
    const ids = [...system.matchAll(/id=(\S+) \| \w+ (\S+) \| [^|]+\| Update client portfolio/g)];
    const tm = new Date(); tm.setDate(tm.getDate() + 1);
    return { reply: "My bad! Moved it to tomorrow.", removeIds: ids.map((m) => m[1]),
      actions: [{ title: "Update client portfolio", date: tm.getFullYear() + "-" + pad(tm.getMonth() + 1) + "-" + pad(tm.getDate()), notBefore: "09:00", mins: 60, area: "staff" }], projectNotes: [], suggestions: [] };
  }
  if (/track/i.test(message)) return { reply: "Honestly? Website is quiet. One block Saturday.", actions: [], projectNotes: [], suggestions: [] };
  throw new Error("Failed to fetch");
}
