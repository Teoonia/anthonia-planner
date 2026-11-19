import "./style.css";
import seed from "./seed.json";
import { TIMETABLE } from "./timetable.js";
import { configured, watchUser, signIn, signUp, resetPassword, logOut, makeDb } from "./firebase.js";
import { askPartner, systemPrompt, friendlyError, AREA_IDS } from "./partner.js";
import { isNative, syncSchedule, alertStatus, askNotifications, openPhoneSetting, testAlert, setBubble } from "./native.js";
import { planDay as enginePlan, DEFAULT_SET, isWork, toMin, toHM, dkey, wd, mondayOf, isoWeek, dayDate } from "./planner.js";
import { parseJot } from "./jot.js";

/* ============ constants ============ */
const AREAS = [
  { id: "gigs", name: "Online gigs", why: "Portfolio, proposals, applications, clients." },
  { id: "staff", name: "AGN staff", why: "Onboarding, working terms, check-in calls, people working on their own." },
  { id: "targets", name: "Targets & reports", why: "Monthly targets out by the 3rd; weekly reports checked Monday." },
  { id: "cmax", name: "CMAX UI/UX", why: "Design updates every Wednesday and Friday." },
  { id: "website", name: "AGN website", why: "One to two days a week to round it up." },
  { id: "school", name: "Master's (UNIVPM)", why: "Lectures, readings, assignments, exams." },
  { id: "life", name: "Life in Italy", why: "Errands, paperwork, Italian, home." }
];
const EXTRA_AREAS = [{ id: "self", name: "Self-care" }, { id: "meal", name: "Meal" }, { id: "rest", name: "Rest" }, { id: "read", name: "Reading" }, { id: "fun", name: "Fun" }];
const AREA_NAME = Object.fromEntries([...AREAS, ...EXTRA_AREAS].map((a) => [a.id, a.name]));
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CLASSES = Object.entries(TIMETABLE.classes).map(([id, c]) => ({ id, ...c }));
const MAX_CHANGES = 2;
const PX = 1.15; // pixels per minute in the day calendar
const START = new Date(2026, 10, 3);
const MILESTONES = [
  { d: 1, name: "First win", reward: "Try a pastry you've never had at a local bar" },
  { d: 3, name: "Warm-up", reward: "A gelato in a flavour you've never tried" },
  { d: 5, name: "Rhythm", reward: "Cook one new Italian dish at home" },
  { d: 7, name: "One full week", reward: "Pizza al taglio or street food somewhere new" },
  { d: 10, name: "Steady", reward: "Walk a part of the city you haven't seen" },
  { d: 14, name: "Two strong weeks", reward: "Cheap regional train to a nearby seaside town" },
  { d: 21, name: "Three weeks", reward: "Coffee and a new book or magazine at a café" },
  { d: 30, name: "Month of wins", reward: "A museum or gallery visit, or a small treat for your room" },
  { d: 45, name: "Unstoppable", reward: "Day trip to a hill town by regional train" },
  { d: 60, name: "Two months", reward: "Pick a bigger treat yourself. You've earned it" }
];
const HORIZONS = [
  { id: "now", name: "Now" }, { id: "year", name: "This year" }, { id: "later", name: "Someday" }, { id: "paused", name: "Paused" }
];
/* her life projects, written down once; she can edit them, and Mini Mi adds notes */
const DEFAULT_PROJECTS = [
  { name: "Master's in EHDRM (UNIVPM)", horizon: "now", areas: ["school"], why: "The reason I'm in Italy. Environmental Hazard and Disaster Risk Management.", aim: "Every class attended, lectures reviewed the same week, assignments in early." },
  { name: "AGN runs without me", horizon: "now", areas: ["staff"], why: "I'm in Italy now. HR systems (AGN Register, 7-day onboarding) and staff who work on their own.", aim: "Daily check-ins done, new staff onboarded with terms signed, onboarding journey moving." },
  { name: "Monthly targets and weekly reports", horizon: "now", areas: ["targets"], why: "Keeps every team pointed the same way.", aim: "Targets out by the 3rd of every month; last week's reports checked every Monday." },
  { name: "AGN company website", horizon: "now", areas: ["website"], why: "The company needs a proper home online.", aim: "1 to 2 days a week until it's live." },
  { name: "CMAX UI/UX", horizon: "now", areas: ["cmax"], why: "Volunteer design work on a fractional land platform, and a strong portfolio piece.", aim: "Design updates sent every Wednesday and Friday." },
  { name: "Income: online gigs and part-time work", horizon: "now", areas: ["gigs"], why: "Earn while studying. New portfolio is live; retail CV out through Adecco.", aim: "A few applications or proposals every week, portfolio kept fresh." },
  { name: "Learn Italian (Parla!)", horizon: "year", areas: ["life"], why: "To live here with confidence. Slowly, from the basics.", aim: "A little practice most days." },
  { name: "Settle into life in Italy", horizon: "now", areas: ["life"], why: "A calm home base makes everything else easier.", aim: "Errands and paperwork don't pile up." },
  { name: "Pods, our couple app", horizon: "year", areas: [], why: "Keeping us close while we're long distance.", aim: "Planning date every month." },
  { name: "Pig farm (with Ifeayomi)", horizon: "year", areas: [], why: "Started with one sow and her piglets; plan to buy more pigs and rent a pen.", aim: "" },
  { name: "CAPM, then PMP", horizon: "paused", areas: [], why: "Parked until next year so the rest can settle first.", aim: "" },
  { name: "My own lasting business", horizon: "later", areas: [], why: "Operations management, a business that lasts generations, a large print press in Oyo Town, and public speaking to share my story.", aim: "" }
];
const DEFAULT_ABOUT = `Anthonia (Olawoore Anthonia B.), Nigerian, now living in Italy for a master's in Environmental Hazard and Disaster Risk Management at Università Politecnica delle Marche (UNIVPM).
Works remotely for African Group Nigeria (AGN) in Oyo Town and Ibadan: holds the HR desk. AGN office hours are 9:00-17:00, Monday to Friday. Her assistant Ms Mercy meets her every Sunday 17:30 and runs the monthly staff meeting.
UI/UX designer: volunteers on CMAX (land investment platform) with design updates every Wednesday and Friday. Looking for online gigs and part-time work. Builds with AI tools rather than coding by hand.
Commutes by bus from Falconara Marittima (walk + wait 25 min, ride 45 min). Day runs 6:00-23:00. Trying to become a morning person: mornings are for body care, breakfast and calm, no work before 9:00.
Likes cheap rewards and trying new affordable things in Italy, movie nights, and a lively, fun style. Wants discipline: only 2 changes to her plan a day.`;

/* ============ state ============ */
let db = null, loaded = false;
let tasks = [], reviews = {}, routine = [], days = {}, settings = { ...DEFAULT_SET }, chatDays = {}, projects = [];
let selOff = 0, weekOffset = 0, lastView = "today", scrolledToNow = false;
const fresh = new Set();
const $ = (s) => document.querySelector(s);
const state = () => ({ classes: CLASSES, routine, days, settings });
const plan = (date) => enginePlan(state(), date);
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const todayKey = () => dkey(dayDate(0));
const dateOfKey = (k) => new Date(k + "T00:00");
const offOfKey = (k) => Math.round((dateOfKey(k) - dayDate(0)) / 864e5);
const shortDay = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const relDay = (k) => { const o = offOfKey(k); return o === 0 ? "Today" : o === 1 ? "Tomorrow" : o === -1 ? "Yesterday" : shortDay(dateOfKey(k)); };
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

function h(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function button(label, fn, cls = "btn soft small", aria) { const b = h("button", cls, label); b.type = "button"; if (aria) b.setAttribute("aria-label", aria); b.onclick = fn; return b; }
function note(m) { $("#note").textContent = m || ""; $("#note").hidden = !m; }
function needDb() { if (!db) { note("You're signed out. Sign in to save changes."); return false; } return true; }
async function safe(p, what) { try { return await p; } catch (e) { note("Couldn't " + what + ": " + (e.message || e.code)); } }
let toastTimer = null;
function toast(msg, action, fn) {
  const t = $("#toast"); t.innerHTML = ""; t.append(h("span", "", msg));
  if (action) t.append(button(action, () => { t.hidden = true; fn(); }, ""));
  t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), action ? 6000 : 3000);
}
function confetti(x, y) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#7B4FD8", "#E08A3C", "#2E9E5B", "#D9467A", "#3B7FD9", "#C98A1B"];
  for (let i = 0; i < 18; i++) {
    const c = h("i", "confetti"); const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 70;
    c.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]};--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r - 30}px;--r:${Math.random() * 540}deg`;
    document.body.append(c); setTimeout(() => c.remove(), 1000);
  }
}

/* ============ day writes and the 2-changes rule ============ */
async function writeDay(key, patch) {
  if (!needDb()) return;
  const body = { ...(days[key] || {}), ...patch, date: key, updatedAt: Date.now() };
  days[key] = body; renderToday();
  await safe(db.collection("days").doc(key).set(body), "save the change");
}
const changesUsed = (k) => (days[k] || {}).changes || 0;
const changesLeft = (k) => Math.max(0, MAX_CHANGES - changesUsed(k));
function useChange(k) {
  if (changesLeft(k) > 0) return true;
  toast("Both changes used for this day. The plan stays. You've got this.");
  return false;
}
function toggleDone(key, id, ev) {
  const d = new Set((days[key] || {}).done || []); const was = d.has(id);
  was ? d.delete(id) : d.add(id);
  writeDay(key, { done: [...d] });
  if (!was && ev) confetti(ev.clientX, ev.clientY);
}
function skipIt(key, id, free) {
  if (!free && !useChange(key)) return false;
  const s = new Set((days[key] || {}).skip || []); s.add(id);
  writeDay(key, { skip: [...s], changes: changesUsed(key) + (free ? 0 : 1) });
  return true;
}
function moveBlock(key, ids, id, dir) {
  const i = ids.indexOf(id), j = i + dir; if (i < 0 || j < 0 || j >= ids.length) return;
  if (!useChange(key)) return;
  const o = [...ids]; [o[i], o[j]] = [o[j], o[i]];
  writeDay(key, { order: o, changes: changesUsed(key) + 1 });
}
async function toTomorrow(key, q, free) {
  if (!needDb()) return;
  if (!free && !useChange(key)) return;
  const d = dateOfKey(key); d.setDate(d.getDate() + 1); const tk = dkey(d);
  const t = days[tk] || {};
  const tb = { ...t, extra: [...(t.extra || []), { id: uid("x"), title: q.title, area: q.area, mins: q.mins, notBefore: q.nb != null ? toHM(q.nb) : "" }], date: tk, updatedAt: Date.now() };
  days[tk] = tb;
  await safe(db.collection("days").doc(tk).set(tb), "move it to tomorrow");
  if ((days[key]?.extra || []).some((x) => x.id === q.id)) writeDay(key, { extra: days[key].extra.filter((x) => x.id !== q.id), changes: changesUsed(key) + (free ? 0 : 1) });
  else skipIt(key, q.id, true) && !free && writeDay(key, { changes: changesUsed(key) + 1 });
}
/* remove a jotted item or an event; free when undoing Mini Mi's own addition */
function removeItem(key, id, free) {
  if (!free && !useChange(key)) return false;
  const dd = days[key] || {};
  writeDay(key, { events: (dd.events || []).filter((e) => e.id !== id), extra: (dd.extra || []).filter((e) => e.id !== id), changes: changesUsed(key) + (free ? 0 : 1) });
  return true;
}
function toggleCancelled(key, cid) {
  const c = new Set((days[key] || {}).cancelled || []); c.has(cid) ? c.delete(cid) : c.add(cid);
  writeDay(key, { cancelled: [...c] });
}

/* ============ adding things (Mini Mi is the jotter) ============ */
const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !isNaN(dateOfKey(s)) && offOfKey(s) >= -1 && offOfKey(s) <= 90;
const validHM = (s) => /^\d{1,2}:\d{2}$/.test(s || "") && toMin(s) < 24 * 60;
async function addItems(list) {
  if (!needDb() || !list.length) return [];
  const byDate = {}, out = [];
  for (const a of list) {
    const date = validDate(a.date) ? a.date : todayKey();
    const item = {
      id: uid(a.start && validHM(a.start) ? "e" : "x"),
      title: String(a.title || "Something new").slice(0, 80),
      area: AREA_IDS.includes(a.area) ? a.area : "life",
      mins: Math.min(240, Math.max(10, Math.round(+a.mins || 45))),
      by: a.by || "minimi", addedAt: Date.now()
    };
    if (validHM(a.start)) item.start = toHM(toMin(a.start)); else if (validHM(a.notBefore)) item.notBefore = toHM(toMin(a.notBefore));
    (byDate[date] ||= []).push(item);
  }
  for (const [date, items] of Object.entries(byDate)) {
    const cur = days[date] || {};
    const body = { ...cur, date, updatedAt: Date.now(),
      events: [...(cur.events || []), ...items.filter((i) => i.start)],
      extra: [...(cur.extra || []), ...items.filter((i) => !i.start)] };
    days[date] = body;
    await safe(db.collection("days").doc(date).set(body), "add it to your calendar");
    const p = plan(dateOfKey(date));
    for (const it of items) {
      fresh.add(it.id);
      const b = p.blocks.find((x) => x.id === it.id);
      out.push({ id: it.id, date, title: it.title, s: b ? b.s : null, e: b ? b.e : null, squeezed: !!b?.squeezed });
    }
  }
  setTimeout(() => { list.length && fresh.clear(); }, 6000);
  renderToday();
  return out;
}
/* everything added through chat or the jot bar, wherever it is on the calendar */
function findAdded(id) {
  for (const [date, d] of Object.entries(days)) {
    const it = [...(d.events || []), ...(d.extra || [])].find((x) => x.id === id);
    if (it) return { date, item: it };
  }
  return null;
}
/* Mini Mi taking her own additions back is free (fixing her mistakes);
   anything you added yourself counts toward the day's 2 changes */
async function applyRemovals(ids) {
  const out = [];
  for (const id of ids || []) {
    const f = findAdded(id); if (!f) continue;
    const free = f.item.by === "minimi";
    if (!free && changesLeft(f.date) <= 0) { out.push({ id, title: f.item.title, date: f.date, blocked: true }); continue; }
    removeItem(f.date, id, free);
    out.push({ id, title: f.item.title, date: f.date });
  }
  return out;
}
function addedItemsContext() {
  const from = dkey(dayDate(-1)), to = dkey(dayDate(30)), rows = [];
  Object.keys(days).sort().filter((k) => k >= from && k <= to).forEach((k) => {
    const d = days[k];
    [...(d.events || []), ...(d.extra || [])].forEach((x) => {
      const b = plan(dateOfKey(k)).blocks.find((y) => y.id === x.id);
      rows.push(`  id=${x.id} | ${DAYS[wd(dateOfKey(k))]} ${k} | ${b ? toHM(b.s) + "-" + toHM(b.e) : x.start || "didn't fit"} | ${x.title} | added by ${x.by === "minimi" ? "you" : "her"}`);
    });
  });
  return rows.join("\n") || "  (nothing added yet)";
}
function datesContext() {
  const out = [];
  for (let off = -1; off < 15; off++) {
    const d = dayDate(off);
    out.push(`  ${d.toLocaleDateString("en-GB", { weekday: "long" })} ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })} = ${dkey(d)}${off === 0 ? " (TODAY)" : off === 1 ? " (tomorrow)" : off === -1 ? " (yesterday)" : ""}`);
  }
  return out.join("\n");
}
const addedLabel = (a) => {
  const live = days[a.date] && plan(dateOfKey(a.date)).blocks.find((b) => b.id === a.id);
  const s = live ? live.s : a.s, e = live ? live.e : a.e;
  return relDay(a.date) + (s != null ? " · " + toHM(s) + "–" + toHM(e) : " · didn't fit, see the tray");
};

/* ============ life projects ============ */
const horizonOf = (p) => (p.status === "paused" ? "paused" : p.horizon || "now");
function doneInWeek(areas, mon) {
  if (!areas || !areas.length) return 0;
  let n = 0; const today = dayDate(0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon); d.setDate(d.getDate() + i); if (d > today) break;
    const p = plan(d);
    n += p.blocks.filter((b) => b.done && areas.includes(b.area)).length + p.doneItems.filter((q) => areas.includes(q.area)).length;
    // classes you went to count for school
    if (areas.includes("school")) n += p.blocks.filter((b) => b.kind === "class" && (d < today || b.e <= nowMin())).length;
  }
  const wk = isoWeek(mon);
  n += tasks.filter((t) => t.week === wk && t.status === "done" && areas.includes(t.area)).length;
  return n;
}
function projectPulse(p) {
  const mon = mondayOf(new Date()), last = new Date(mon); last.setDate(last.getDate() - 7);
  const thisWk = doneInWeek(p.areas, mon), lastWk = doneInWeek(p.areas, last);
  const hz = horizonOf(p);
  let state = "", label = "";
  const lastNote = (p.notes || []).slice(-1)[0];
  if (hz === "paused") { state = ""; label = "Paused" + (p.why ? " · " + p.why : ""); }
  else if (!p.areas?.length) { label = lastNote ? "Last: " + lastNote.t : (p.aim || p.why || "Talk it through with Mini Mi"); }
  else if (thisWk > 0) { state = "on"; label = thisWk + " done this week" + (p.aim ? " · aim: " + p.aim : ""); }
  else if (hz === "now" && lastWk === 0 && wd(new Date()) >= 2) { state = "drift"; label = "Nothing done for over a week"; }
  else { state = hz === "now" ? "quiet" : ""; label = "Nothing yet this week" + (lastWk ? " (" + lastWk + " last week)" : ""); }
  return { thisWk, lastWk, state, label, hz };
}
function projectsContext() {
  return projects.map((p) => {
    const q = projectPulse(p);
    const notes = (p.notes || []).slice(-4).map((n) => `${n.d}: ${n.t}`).join(" | ");
    return `- ${p.name} [${HORIZONS.find((x) => x.id === q.hz)?.name || q.hz}]` +
      (p.why ? `\n  Why: ${p.why}` : "") + (p.aim ? `\n  On track looks like: ${p.aim}` : "") +
      (p.areas?.length ? `\n  Done this week: ${q.thisWk}; last week: ${q.lastWk} (calendar areas: ${p.areas.join(", ")})` : "\n  Not tracked on the calendar yet") +
      (notes ? `\n  Notes: ${notes}` : "");
  }).join("\n");
}
function findProject(name) {
  const n = String(name || "").toLowerCase().trim(); if (!n) return null;
  return projects.find((p) => p.name.toLowerCase() === n) || projects.find((p) => p.name.toLowerCase().includes(n) || n.includes(p.name.toLowerCase()));
}
async function applyProjectNotes(list) {
  const out = [];
  for (const pn of list || []) {
    if (!pn?.note) continue;
    const entry = { d: todayKey(), t: String(pn.note).slice(0, 200), by: "minimi" };
    const p = findProject(pn.project);
    if (p) {
      p.notes = [...(p.notes || []), entry].slice(-40);
      await safe(db.collection("projects").doc(p.id).update({ notes: p.notes }), "note that down");
      out.push({ project: p.name, note: entry.t });
    } else if (pn.isNew && pn.project) {
      const body = { name: String(pn.project).slice(0, 60), horizon: "year", areas: [], why: "", aim: "", notes: [entry], order: Date.now(), createdBy: "minimi" };
      await safe(db.collection("projects").add(body), "start the new project");
      out.push({ project: body.name, note: entry.t, isNew: true });
    }
  }
  return out;
}

/* ============ today ============ */
function greet() {
  const n = nowMin(); const part = n < 720 ? "Good morning" : n < 1080 ? "Good afternoon" : "Good evening";
  $("#hGreet").textContent = part + ", Anthonia";
  $("#hDate").textContent = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
function renderWeekStrip() {
  const sel = dayDate(selOff), mon = mondayOf(sel), ws = $("#weekstrip"); ws.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon); d.setDate(d.getDate() + i); const off = Math.round((d - dayDate(0)) / 864e5);
    const b = h("button", "daypill" + (off === 0 ? " today" : "")); b.type = "button"; b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", off === selOff ? "true" : "false");
    b.append(h("span", "dn", DAYS[i]), h("span", "dd", String(d.getDate())));
    const dots = h("span", "dots"); const k = dkey(d);
    const n = Math.min(3, CLASSES.filter((c) => +c.day === i && !(days[k]?.cancelled || []).includes(c.id)).length + (days[k]?.events || []).length);
    for (let j = 0; j < n; j++) dots.append(h("i"));
    b.append(dots);
    b.onclick = () => { selOff = off; renderToday(); };
    ws.append(b);
  }
}
function blockClass(b) {
  const c = ["blk", "k-" + b.kind];
  if (b.area) c.push("a-" + b.area);
  if (b.done) c.push("done");
  if (fresh.has(b.id)) c.push("fresh");
  return c.join(" ");
}
function layoutColumns(list) {
  // side-by-side columns for blocks that overlap (e.g. something that came up during a class)
  let cluster = [], end = -1;
  const flush = () => { const cols = []; cluster.forEach((b) => { let i = cols.findIndex((e) => e <= b.s); if (i < 0) { i = cols.length; cols.push(0); } cols[i] = b.e; b.col = i; }); cluster.forEach((b) => (b.ncol = cols.length)); cluster = []; };
  list.forEach((b) => { if (b.s >= end && cluster.length) flush(); cluster.push(b); end = Math.max(end, b.e); });
  if (cluster.length) flush();
}
function renderToday() {
  if (!$("#cal")) return;
  greet();
  renderWeekStrip();
  const date = dayDate(selOff), isToday = selOff === 0, key = dkey(date);
  $("#dayTitle").textContent = isToday ? "Today" : selOff === 1 ? "Tomorrow" : date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
  const cl = changesLeft(key);
  $("#chgLeft").textContent = cl ? cl + (cl === 1 ? " change" : " changes") + " left" : "No changes left";
  $("#chgLeft").className = "chip " + (cl ? "soft" : "out");
  const p = plan(date), { wake, sleep } = p;
  const workStart = toMin(settings.workStart) ?? 540;

  /* now card */
  const nc = $("#nowCard"); nc.innerHTML = "";
  if (isToday && loaded) {
    const n = nowMin(), real = p.blocks.filter((b) => b.kind !== "break");
    const cur = real.find((b) => b.s <= n && b.e > n), next = real.find((b) => b.s > n && !b.done);
    if (cur || next) {
      nc.hidden = false;
      if (cur) {
        nc.append(h("span", "eyebrow", "Now · until " + toHM(cur.e)), h("div", "t", cur.title));
        const bar = h("div", "bar"), i = h("i"); i.style.width = Math.round(((n - cur.s) / (cur.e - cur.s)) * 100) + "%"; bar.append(i); nc.append(bar);
      } else nc.append(h("span", "eyebrow", "Free until " + toHM(next.s)), h("div", "t", n < workStart ? "Gentle morning. Take your time." : "Breathing room"));
      if (next) nc.append(h("div", "next", "Next at " + toHM(next.s) + ": " + next.title));
    } else nc.hidden = true;
  } else nc.hidden = true;

  /* cancelled classes (tap to bring back) */
  $("#cancelRow")?.remove();
  const canc = (p.dd.cancelled || []).map((id) => CLASSES.find((c) => c.id === id)).filter(Boolean);
  if (canc.length) {
    const row = h("div", "row"); row.id = "cancelRow"; row.style.marginTop = "12px";
    row.append(h("span", "muted small", "Cancelled today:"));
    canc.forEach((c) => row.append(button(c.title + " · undo", () => toggleCancelled(key, c.id), "btn ghost small")));
    $("#cal").before(row);
  }

  /* calendar */
  const cal = $("#cal"); cal.innerHTML = "";
  if (!loaded) { cal.style.height = "120px"; cal.append(h("p", "muted", "Loading your plan…")); $("#overTray").hidden = true; return; }
  cal.style.height = (sleep - wake) * PX + 20 + "px";
  for (let m = Math.ceil(wake / 60) * 60; m <= sleep; m += 60) {
    const line = h("div", "hour"); line.style.top = (m - wake) * PX + "px"; line.append(h("span", "", toHM(m))); cal.append(line);
  }
  if (workStart > wake) {
    const g = h("div", "gentle"); g.style.top = "0px"; g.style.height = (workStart - wake) * PX + "px"; g.append(h("span", "", "Gentle morning")); cal.append(g);
  }
  const slots = h("div", "slots"); slots.title = "Tap a free spot to add something";
  slots.onclick = (e) => {
    const r = cal.getBoundingClientRect(); const m = Math.round(((e.clientY - r.top) / PX + wake) / 15) * 15;
    const day = isToday ? "" : selOff === 1 ? "tomorrow " : DAYS[wd(date)] + " ";
    const inp = $("#jotIn"); inp.value = day + "at " + toHM(Math.min(sleep - 15, Math.max(wake, m))) + " "; inp.focus();
  };
  cal.append(slots);
  const flexIds = p.queue.map((q) => q.id);
  const vis = p.blocks.filter((b) => b.kind !== "break").map((b) => ({ ...b }));
  layoutColumns(vis);
  vis.forEach((b, i) => {
    const el = h("div", blockClass(b)); el.setAttribute("role", "button"); el.tabIndex = 0;
    el.style.setProperty("--i", i);
    const top = (b.s - wake) * PX, ht = Math.max(20, (b.e - b.s) * PX - 3);
    el.style.top = top + "px"; el.style.height = ht + "px";
    if (b.ncol > 1) { el.style.left = `calc(58px + (100% - 58px) * ${b.col / b.ncol})`; el.style.right = "auto"; el.style.width = `calc((100% - 58px) / ${b.ncol} - 4px)`; }
    if (ht < 44) el.classList.add("compact"); if (ht < 26) el.classList.add("tiny");
    if (isToday && b.s <= nowMin() && b.e > nowMin()) el.classList.add("now");
    const canTick = b.kind === "flex" || b.kind === "meal" || b.kind === "event";
    if (canTick) {
      const t = h("span", "tick"); t.setAttribute("role", "checkbox"); t.setAttribute("aria-checked", b.done ? "true" : "false"); t.setAttribute("aria-label", "Done: " + b.title);
      t.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>';
      t.onclick = (e) => { e.stopPropagation(); toggleDone(key, b.id, e); };
      el.append(t);
    }
    const bt = h("div", "bt"), ttl = h("div", "ttl");
    const badge = b.kind === "class" ? "Class" : b.kind === "meeting" ? "Meeting" : b.jotted || b.kind === "event" ? (b.by === "minimi" || b.kind === "event" ? "Added" : "") : "";
    if (badge) ttl.append(h("span", "badge", badge));
    ttl.append(document.createTextNode(b.title)); bt.append(ttl);
    bt.append(h("div", "sub", toHM(b.s) + "–" + toHM(b.e) + (b.room ? " · " + b.room : b.squeezed ? " · squeezed in" : b.meta ? " · " + b.meta : "")));
    el.append(bt);
    el.onclick = () => openBlock(key, b, flexIds);
    el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openBlock(key, b, flexIds); } };
    cal.append(el);
  });
  if (isToday) {
    const n = nowMin();
    if (n >= wake && n <= sleep) { const nl = h("div", "nowline"); nl.style.top = (n - wake) * PX + "px"; cal.append(nl); }
    if (!scrolledToNow && lastView === "today") {
      scrolledToNow = true;
      requestAnimationFrame(() => { const y = cal.getBoundingClientRect().top + scrollY + (Math.max(wake, n) - wake) * PX - 220; if (y > 200) scrollTo({ top: y, behavior: "smooth" }); });
    }
  }

  /* didn't fit */
  const ol = $("#overList"); ol.innerHTML = "";
  $("#overTray").hidden = !p.over.length;
  p.over.forEach((q) => {
    const li = h("li"); li.append(h("span", "", q.title + " · " + q.mins + " min"), button("Tomorrow", () => toTomorrow(key, q, true)));
    ol.append(li);
  });
  renderStreak();
  syncSchedule(phoneItems);
}

/* block sheet */
function openBlock(key, b, flexIds) {
  const body = $("#blockBody"); body.innerHTML = "";
  const head = h("div", "bs-head");
  const label = b.kind === "class" ? "Class" : b.kind === "ride" ? "On the way" : b.kind === "meeting" ? "Meeting" : b.kind === "event" ? "Came up" : AREA_NAME[b.area] || "";
  head.append(h("span", "eyebrow", label), h("h2", "", b.title), h("span", "when", relDay(key) + " · " + toHM(b.s) + "–" + toHM(b.e) + (b.room ? " · " + b.room : "")));
  if (b.meta) head.append(h("p", "muted small", b.meta));
  if (b.squeezed) head.append(h("p", "muted small", "Squeezed into a shorter gap so it still happens today."));
  body.append(head);
  const acts = h("div", "bs-actions");
  const close = () => closeSheets();
  const isFlex = b.kind === "flex" || b.kind === "meal";
  const isJot = (days[key]?.extra || []).some((x) => x.id === b.id);
  const locked = changesLeft(key) <= 0;
  if (isFlex || b.kind === "event") acts.append(button(b.done ? "Not done yet" : "✓ Done", (e) => { toggleDone(key, b.id, e); close(); }, "btn primary"));
  if (isFlex) {
    const ord = flexIds;
    [["Earlier", () => moveBlock(key, ord, b.id, -1)], ["Later", () => moveBlock(key, ord, b.id, 1)],
     ["Skip today", () => skipIt(key, b.id)], ["Move to tomorrow", () => toTomorrow(key, { ...b, nb: null })]]
      .forEach(([l, f]) => { const x = button(l, () => { f(); close(); }, "btn soft"); x.disabled = locked || b.done; acts.append(x); });
  }
  const minimiAdded = findAdded(b.id)?.item.by === "minimi";
  if (isJot || b.kind === "event") { const x = button(minimiAdded ? "Remove (free, Mini Mi added it)" : "Remove", () => { removeItem(key, b.id, findAdded(b.id)?.item.by === "minimi"); close(); }, "btn soft"); x.disabled = locked && !minimiAdded; acts.append(x); }
  if (b.kind === "class") {
    acts.append(button("Cancelled today", () => { toggleCancelled(key, b.cid); close(); toast("Marked cancelled. The day re-plans around it."); }, "btn soft"));
    acts.append(button("Prep with Mini Mi", () => { close(); openChat(); sendToPartner(`Help me prepare for ${b.title} on ${relDay(key)} at ${toHM(b.s)}. What should I review or bring? Add a prep session before it.`); }, "btn primary"));
  }
  if (acts.children.length) body.append(acts);
  if (isFlex || isJot || b.kind === "event") body.append(h("p", "bs-left", locked ? "No changes left for this day. Ticking done is always fine." : changesLeft(key) + " of 2 changes left for this day. Adding is always free."));
  openSheet("#blockSheet");
}

/* ============ streak + rewards ============ */
function dayScore(date) {
  if (date < START) return null;
  const p = plan(date);
  const work = p.blocks.filter((b) => b.kind === "flex" && isWork(b.area)), pre = p.doneItems.filter((q) => isWork(q.area));
  const total = work.length + pre.length; if (!total) return null;
  return (work.filter((b) => b.done).length + pre.length) / total;
}
let streak = 0, todayPct = null;
function renderStreak() {
  const ts = dayScore(dayDate(0)); let n = 0;
  if (ts != null && ts >= 0.8) n++;
  for (let i = 1; i < 120; i++) { const d = dayDate(-i); if (d < START) break; const s = dayScore(d); if (s == null) continue; if (s >= 0.8) n++; else break; }
  streak = n; todayPct = ts == null ? null : Math.round(ts * 100);
  $("#streakNum").textContent = n; $("#streakBtn").classList.toggle("hot", n >= 3);
}
function openRewards() {
  const b = $("#rewardBody"); b.innerHTML = "";
  const big = h("div", "big-streak"); big.append(h("b", "", String(streak)), h("span", "muted", streak === 1 ? "day in a row" : "days in a row"));
  b.append(h("span", "eyebrow", "Win streak"), big);
  const bar = h("div", "todaybar"), i = h("i"); i.style.width = (todayPct || 0) + "%"; bar.append(i);
  b.append(h("p", "muted small", todayPct == null ? "No work blocks today." : todayPct >= 80 ? "Today is a win: " + todayPct + "% done." : todayPct + "% of today's work done. 80% wins the day."), bar);
  const list = h("div"); list.style.marginTop = "14px";
  MILESTONES.forEach((m) => {
    const row = h("div", "mile" + (streak >= m.d ? " hit" : "")); const t = h("div");
    t.append(h("div", "", m.name), h("div", "muted small", m.reward));
    row.append(h("span", "n", String(m.d)), t); list.append(row);
  });
  b.append(list); openSheet("#rewardSheet");
}

/* ============ week board + projects ============ */
function rituals(mon) {
  const wk = isoWeek(mon), out = [
    { key: "reports", area: "targets", title: "Check last week's reports", tag: "Mon" },
    { key: "cmax-wed", area: "cmax", title: "Send CMAX design update", tag: "Wed" },
    { key: "cmax-fri", area: "cmax", title: "Send CMAX design update", tag: "Fri" }];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon); d.setDate(d.getDate() + i);
    if (d.getDate() <= 3) { out.unshift({ key: "targets-" + d.getFullYear() + "-" + (d.getMonth() + 1), area: "targets", title: "Send " + d.toLocaleDateString("en-GB", { month: "long" }) + " targets to all teams", tag: "by the 3rd" }); break; }
  }
  return out.map((r) => ({ ...r, id: "ritual-" + wk + "-" + r.key, week: wk, ritual: true }));
}
function renderProjects() {
  const box = $("#projects"); if (!box) return; box.innerHTML = "";
  if (!projects.length) { box.append(h("p", "muted small", loaded ? "Nothing written down yet. Add your first project." : "Loading…")); return; }
  let i = 0;
  HORIZONS.forEach((hz) => {
    const list = projects.filter((p) => horizonOf(p) === hz.id).sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!list.length) return;
    box.append(h("div", "projgroup", hz.name));
    list.forEach((p) => {
      const q = projectPulse(p);
      const row = h("button", "proj " + q.state); row.type = "button"; row.style.setProperty("--i", i++);
      const t = h("div", "pt"); t.append(h("div", "pn", p.name), h("div", "ps", q.label));
      row.append(h("span", "dot"), t);
      if (q.state === "drift") row.append(h("span", "hz", "Needs you"));
      row.onclick = () => openProject(p);
      box.append(row);
    });
  });
}
function openProject(p) {
  const isNew = !p; p = p || { name: "", horizon: "now", areas: [], why: "", aim: "", notes: [] };
  const b = $("#projectBody"); b.innerHTML = "";
  b.append(h("span", "eyebrow", isNew ? "New life project" : "Life project"));
  const name = Object.assign(h("input"), { value: p.name, placeholder: "e.g. Get a part-time job in Ancona" });
  const hz = h("select"); HORIZONS.forEach((x) => { const o = h("option", "", x.name); o.value = x.id; o.selected = horizonOf(p) === x.id; hz.append(o); });
  const why = Object.assign(h("textarea"), { rows: 2, value: p.why || "", placeholder: "Why it matters to you" });
  const aim = Object.assign(h("textarea"), { rows: 2, value: p.aim || "", placeholder: "What being on track looks like each week" });
  const lab = (t, el) => { const l = h("label", "field", t); l.append(el); return l; };
  const chips = h("div", "areachips"); const sel = new Set(p.areas || []);
  AREAS.forEach((a) => { const c = button(a.name, () => { sel.has(a.id) ? sel.delete(a.id) : sel.add(a.id); c.setAttribute("aria-pressed", sel.has(a.id)); }, ""); c.setAttribute("aria-pressed", sel.has(a.id)); chips.append(c); });
  const wrap = h("div"); wrap.style.cssText = "display:flex;flex-direction:column;gap:12px;margin-top:10px";
  const areasField = h("div", "field", "Counts as progress when I finish blocks in"); areasField.append(chips);
  wrap.append(lab("Name", name), lab("When", hz), lab("Why", why), lab("On track looks like", aim), areasField);
  if (!isNew) {
    const nf = h("div", "field", "Notes (Mini Mi adds these when you tell her things)");
    const ul = h("ul", "plain pnotes");
    (p.notes || []).slice().reverse().forEach((n) => { const li = h("li"); li.append(h("time", "", n.d.slice(5)), h("span", "", n.t)); ul.append(li); });
    if (!(p.notes || []).length) ul.append(h("li", "muted small", "No notes yet."));
    const add = Object.assign(h("input"), { placeholder: "Add a note, e.g. 'Sent 3 proposals'" });
    nf.append(ul, add); wrap.append(nf);
    p._newNote = add;
  }
  b.append(wrap);
  const row = h("div", "row"); row.style.marginTop = "16px";
  const msg = h("span", "muted small");
  row.append(button(isNew ? "Add project" : "Save", async () => {
    if (!needDb()) return;
    const body = { name: name.value.trim() || "Untitled", horizon: hz.value === "paused" ? (p.horizon && p.horizon !== "paused" ? p.horizon : "year") : hz.value, status: hz.value === "paused" ? "paused" : "active", why: why.value.trim(), aim: aim.value.trim(), areas: [...sel] };
    const nn = p._newNote?.value.trim();
    if (nn) body.notes = [...(p.notes || []), { d: todayKey(), t: nn, by: "me" }];
    msg.textContent = "Saving…";
    if (isNew) await safe(db.collection("projects").add({ ...body, notes: [], order: Date.now() }), "add it");
    else await safe(db.collection("projects").doc(p.id).update(body), "save it");
    closeSheets(); toast(isNew ? "Project added. Mini Mi knows about it now." : "Saved");
  }, "btn primary"));
  if (!isNew) {
    row.append(button("Talk with Mini Mi", () => { closeSheets(); openChat(); sendToPartner(`Let's talk about my project "${p.name}". How am I doing on it, and what's the next step?`); }, "btn soft"));
    const del = button("Delete", () => {
      if (del.dataset.sure) { safe(db.collection("projects").doc(p.id).delete(), "delete it"); closeSheets(); return; }
      del.dataset.sure = "1"; del.textContent = "Tap again to delete";
    }, "btn ghost");
    row.append(del);
  }
  row.append(msg); b.append(row);
  openSheet("#projectSheet");
}
function renderBoard() {
  renderProjects();
  const mon = mondayOf(new Date()); mon.setDate(mon.getDate() + weekOffset * 7);
  const sun = new Date(mon); sun.setDate(sun.getDate() + 6); const wk = isoWeek(mon);
  const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  $("#wLabel").textContent = (weekOffset === 0 ? "This week · " : "") + fmt(mon) + " – " + fmt(sun);
  const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const all = [...rituals(mon).map((r) => ({ ...r, status: byId[r.id]?.status || "todo" })), ...tasks.filter((t) => t.week === wk && !t.ritual)];
  const box = $("#areas"); box.innerHTML = "";
  AREAS.forEach((a, ai) => {
    const it = all.filter((t) => t.area === a.id).sort((x, y) => (x.ritual ? 0 : 1) - (y.ritual ? 0 : 1) || (x.createdAt || 0) - (y.createdAt || 0));
    const dn = it.filter((t) => t.status === "done").length;
    const card = h("article", "card area"); card.style.animation = `rise .4s ${ai * 40}ms both`;
    const head = h("div", "head"); head.append(h("h3", "", a.name), h("span", "muted small", it.length ? dn + " of " + it.length : ""));
    const prog = h("div", "prog"), pi = h("i"); pi.style.width = (it.length ? Math.round((dn / it.length) * 100) : 0) + "%"; prog.append(pi);
    card.append(head, h("p", "muted small", a.why), prog);
    const ul = h("div");
    it.forEach((t) => {
      const row = h("div", "task" + (t.status === "done" ? " done" : ""));
      const cb = h("input"); cb.type = "checkbox"; cb.id = "cb-" + t.id; cb.checked = t.status === "done";
      cb.onchange = (e) => { toggleTask(t, cb.checked); if (cb.checked) { const r = cb.getBoundingClientRect(); confetti(r.left + 10, r.top + 10); } };
      const l = h("label", "", t.title); l.htmlFor = cb.id;
      if (t.tag) l.append(" ", h("span", "chip soft", t.tag));
      row.append(cb, l);
      if (!t.ritual) row.append(button("×", () => needDb() && safe(db.collection("tasks").doc(t.id).delete(), "remove it"), "x", "Remove " + t.title));
      ul.append(row);
    });
    card.append(ul);
    const f = h("form", "addtask"); const inp = Object.assign(h("input"), { placeholder: "Add a goal for this week" }); inp.setAttribute("aria-label", "Add a goal to " + a.name);
    f.append(inp, Object.assign(h("button", "btn soft small", "Add"), { type: "submit" }));
    f.onsubmit = (e) => { e.preventDefault(); const v = inp.value.trim(); if (v && needDb()) { safe(db.collection("tasks").add({ area: a.id, title: v, week: wk, status: "todo", createdAt: Date.now() }), "add it"); inp.value = ""; } };
    card.append(f); box.append(card);
  });
  const rv = reviews[wk] || {};
  ["wins", "stuck", "next"].forEach((k) => { const el = $("#rv-" + k), sig = wk + (rv.updatedAt || ""); if (document.activeElement !== el && el.dataset.sig !== sig) { el.value = rv[k] || ""; el.dataset.sig = sig; } });
}
function toggleTask(t, checked) {
  if (!needDb()) return renderBoard();
  const b = { area: t.area, title: t.title, week: t.week, status: checked ? "done" : "todo", doneAt: checked ? Date.now() : null, createdAt: t.createdAt || Date.now() };
  if (t.ritual) b.ritual = true;
  safe(db.collection("tasks").doc(t.id).set(b), "save that");
}
$("#saveReview").onclick = async () => {
  if (!needDb()) return; const mon = mondayOf(new Date()); mon.setDate(mon.getDate() + weekOffset * 7); const wk = isoWeek(mon);
  $("#revStatus").textContent = "Saving…";
  try { await db.collection("reviews").doc(wk).set({ week: wk, wins: $("#rv-wins").value, stuck: $("#rv-stuck").value, next: $("#rv-next").value, updatedAt: Date.now() }); $("#revStatus").textContent = "Saved"; }
  catch (e) { $("#revStatus").textContent = "Couldn't save: " + (e.message || e.code); }
};
$("#wPrev").onclick = () => { weekOffset--; renderBoard(); };
$("#wNext").onclick = () => { weekOffset++; renderBoard(); };
$("#addProject").onclick = () => openProject(null);
$("#askTrack").onclick = () => { openChat(); sendToPartner(QUICK.track); };

/* ============ me: classes, routine, rules ============ */
function renderMe() {
  const cl = $("#classList"); cl.innerHTML = "";
  DAYS.forEach((d, i) => {
    const list = CLASSES.filter((c) => +c.day === i).sort((a, b) => a.start.localeCompare(b.start)); if (!list.length) return;
    const row = h("div", "classday"); row.append(h("b", "", d));
    const col = h("div"); list.forEach((c) => col.append(h("div", "", `${c.start}–${c.end}  ${c.title}${c.room ? " · " + c.room : ""}`))); row.append(col); cl.append(row);
  });
  const rl = $("#routineList");
  if (!rl.contains(document.activeElement)) {
    rl.innerHTML = "";
    const sorted = [...routine].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!sorted.length) rl.append(h("p", "muted small", "No routine blocks yet."));
    sorted.forEach((r, i) => {
      const card = h("div", "rcard");
      const t = Object.assign(h("input", "full"), { value: r.title || "" }); t.setAttribute("aria-label", "Block name");
      const a = h("select"); [...AREAS, ...EXTRA_AREAS].forEach((x) => { const o = h("option", "", x.name); o.value = x.id; o.selected = x.id === r.area; a.append(o); });
      const m = Object.assign(h("input"), { type: "number", value: r.mins || 30, min: 5, max: 300 }); m.setAttribute("aria-label", "Minutes");
      const nb = Object.assign(h("input"), { type: "time", value: r.notBefore || "" }), na = Object.assign(h("input"), { type: "time", value: r.notAfter || "" });
      const mini = h("div", "mini"); const lab = (txt, el) => { const l = h("label", "", txt); l.append(el); return l; };
      mini.append(lab("Minutes", m), lab("After", nb), lab("End by", na));
      const dc = h("div", "dchips"); const sel = new Set(r.days || []);
      const save = () => { const body = { title: t.value, area: a.value, mins: +m.value || 30, notBefore: nb.value, notAfter: na.value, days: [...sel].sort(), order: r.order || 0 }; Object.assign(r, body); saveLater("routine", r.id, body); };
      DAYS.forEach((d, k) => { const c = button(d[0] + (d[1] === "u" || d[1] === "h" ? d[1] : ""), () => { sel.has(k) ? sel.delete(k) : sel.add(k); c.setAttribute("aria-pressed", sel.has(k)); save(); }, ""); c.setAttribute("aria-pressed", sel.has(k)); c.setAttribute("aria-label", d); dc.append(c); });
      dc.append(h("span", "sp"), button("↑", () => swapOrder(sorted, i, -1), "icon-btn", "Move up"), button("↓", () => swapOrder(sorted, i, 1), "icon-btn", "Move down"),
        button("✕", () => needDb() && safe(db.collection("routine").doc(r.id).delete(), "delete it"), "icon-btn", "Delete " + r.title));
      [t, a, m, nb, na].forEach((x) => x.addEventListener("input", save));
      card.append(t, a, mini, dc); rl.append(card);
    });
  }
  ["wake", "sleep", "workStart", "short", "long", "after", "commute", "walkwait", "early", "afterclass"].forEach((k) => { const el = $("#s-" + k); if (el && document.activeElement !== el) el.value = settings[k] ?? DEFAULT_SET[k]; });
  const name = partnerName();
  ["p-name", "p-banter", "p-about"].forEach((id) => { const el = $("#" + id); if (document.activeElement === el) return; el.value = id === "p-name" ? name : id === "p-banter" ? settings.partnerBanter || "cheeky" : settings.partnerAbout || DEFAULT_ABOUT; });
}
const saveTimers = {};
function saveLater(col, id, body) { if (!needDb()) return; clearTimeout(saveTimers[col + id]); saveTimers[col + id] = setTimeout(() => safe(db.collection(col).doc(id).set(body), "save"), 600); }
async function swapOrder(sorted, i, dir) {
  const j = i + dir; if (j < 0 || j >= sorted.length || !needDb()) return; const a = sorted[i], b = sorted[j]; const oa = a.order || i, ob = b.order || j;
  await safe(db.collection("routine").doc(a.id).update({ order: ob === oa ? oa + dir : ob }), "reorder"); await safe(db.collection("routine").doc(b.id).update({ order: oa }), "reorder");
}
$("#addRoutine").onclick = () => needDb() && safe(db.collection("routine").add({ title: "New block", area: "school", mins: 60, notBefore: "", days: [0, 1, 2, 3, 4], order: Math.max(0, ...routine.map((r) => r.order || 0)) + 10 }), "add a block");
$("#saveSettings").onclick = async () => {
  if (!needDb()) return; const v = (k) => $("#s-" + k).value;
  const b = { wake: v("wake") || DEFAULT_SET.wake, sleep: v("sleep") || DEFAULT_SET.sleep, workStart: v("workStart") || DEFAULT_SET.workStart, short: +v("short"), long: +v("long"), after: +v("after") || 90, commute: +v("commute") || 0, walkwait: +v("walkwait") || 0, early: +v("early") || 0, afterclass: +v("afterclass") || 0 };
  $("#setStatus").textContent = "Saving…";
  try { await db.collection("settings").doc("main").set({ ...settings, ...b }); $("#setStatus").textContent = "Saved"; } catch (e) { $("#setStatus").textContent = "Couldn't save: " + (e.message || e.code); }
};
$("#pSave").onclick = async () => {
  if (!needDb()) return;
  const body = { ...settings, partnerName: $("#p-name").value.trim() || "Mini Mi", partnerBanter: $("#p-banter").value, partnerAbout: $("#p-about").value.trim() || DEFAULT_ABOUT };
  $("#pMsg").textContent = "Saving…"; try { await db.collection("settings").doc("main").set(body); $("#pMsg").textContent = "Saved"; } catch (e) { $("#pMsg").textContent = "Couldn't save: " + (e.message || e.code); }
};
$("#pClear").onclick = async () => { if (!needDb()) return; const tk = todayKey(); await safe(db.collection("chat").doc(tk).delete(), "clear the chat"); delete chatDays[tk]; renderChat(); };

/* ============ sheets + routing ============ */
function openSheet(sel) { closeSheets(true); $("#scrim").hidden = false; $(sel).hidden = false; }
function closeSheets(keepHash) {
  ["#chatSheet", "#blockSheet", "#rewardSheet", "#projectSheet"].forEach((s) => ($(s).hidden = true)); $("#scrim").hidden = true;
  if (!keepHash && location.hash === "#chat") history.replaceState(null, "", "#" + lastView), markTabs(lastView);
}
function openChat() { if (location.hash !== "#chat") history.pushState(null, "", "#chat"); route(); }
$("#scrim").onclick = () => closeSheets();
$("#chatClose").onclick = () => closeSheets();
$("#streakBtn").onclick = openRewards;
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { if (!$("#takeover").hidden) $("#toClose").click(); else closeSheets(); } });
function markTabs(v) { document.querySelectorAll(".tabbar a").forEach((a) => (a.dataset.v === v ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"))); }
function route() {
  const hv = location.hash.slice(1);
  if (hv === "chat") { markTabs("chat"); openSheet("#chatSheet"); renderChat(true); setTimeout(() => $("#chatIn").focus(), 350); return; }
  const v = ["today", "week", "me"].includes(hv) ? hv : "today";
  closeSheets(true);
  if (v !== lastView) { const sec = $("#v-" + v); sec.classList.remove("enter"); void sec.offsetWidth; sec.classList.add("enter"); if (v === "today") scrolledToNow = false; scrollTo(0, 0); }
  lastView = v;
  document.querySelectorAll(".view").forEach((s) => (s.hidden = s.id !== "v-" + v));
  markTabs(v); $("#dock").hidden = v === "me";
  renderAll();
}
function renderAll() { renderToday(); renderBoard(); renderMe(); renderChat(); }
window.addEventListener("hashchange", route);
setInterval(() => { if (!$("#v-today").hidden) renderToday(); checkAlert(); }, 30000);

/* ============ alerts (website): full-screen nudge, then a corner pill ============ */
let lastAlert = null; try { lastAlert = localStorage.getItem("lastAlert"); } catch (e) {}
function nowAndNext() {
  const p = plan(dayDate(0)), n = nowMin(), real = p.blocks.filter((b) => b.kind !== "break");
  return { cur: real.find((b) => b.s <= n && b.e > n) || null, next: real.filter((b) => b.s > n && !b.done).slice(0, 3) };
}
function showTakeover(cur, next) {
  const b = cur || next[0]; if (!b) return;
  $("#toWhen").textContent = cur ? "Starting now" : "Coming up"; $("#toTitle").textContent = b.title;
  $("#toTime").textContent = toHM(b.s) + " – " + toHM(b.e) + (b.meta ? " · " + b.meta : "");
  const ol = $("#toNext"); ol.innerHTML = ""; (cur ? next : next.slice(1)).forEach((x) => ol.append(h("li", "", toHM(x.s) + "  " + x.title)));
  $("#takeover").hidden = false; $("#pill").hidden = true; $("#toClose").focus();
}
function updatePill(cur, next) {
  if (!$("#takeover").hidden) return; const parts = [];
  if (cur) parts.push("Now: " + cur.title); if (next[0]) parts.push("Next " + toHM(next[0].s) + ": " + next[0].title);
  $("#pillTxt").textContent = parts.join(" · "); $("#pill").hidden = !parts.length || !db;
}
function checkAlert() {
  if (!loaded || isNative) return;
  const { cur, next } = nowAndNext();
  const k = cur ? todayKey() + "|" + cur.s + "|" + cur.title : null;
  if (k && k !== lastAlert && cur.kind !== "break") {
    lastAlert = k; try { localStorage.setItem("lastAlert", k); } catch (e) {}
    systemNotify(cur, next);
    if (document.visibilityState === "visible") showTakeover(cur, next);
  }
  updatePill(cur, next);
}
const canNotify = () => !isNative && "Notification" in window;
async function systemNotify(cur, next) {
  if (!canNotify() || Notification.permission !== "granted") return;
  const body = toHM(cur.s) + " – " + toHM(cur.e) + (cur.meta ? "\n" + cur.meta : "") + (next.length ? "\nNext: " + next.map((x) => toHM(x.s) + " " + x.title).join(" · ") : "");
  const opts = { body, tag: "weekly-board-block", renotify: true, requireInteraction: true, icon: import.meta.env.BASE_URL + "icon-192.png", badge: import.meta.env.BASE_URL + "icon-192.png" };
  try { const reg = await navigator.serviceWorker?.getRegistration(); if (reg) { await reg.showNotification(cur.title, opts); return; } } catch (e) {}
  try { new Notification(cur.title, opts); } catch (e) {}
}
function renderLaptop() {
  if (!canNotify()) return; $("#laptopPanel").hidden = false; const p = Notification.permission;
  $("#laptopState").textContent = p === "granted" ? "✓ Notifications are on" : p === "denied" ? "Blocked. Allow them in the browser's site settings." : "Notifications are off";
  $("#laptopOn").hidden = p !== "default"; $("#laptopTest").hidden = p !== "granted";
}
$("#laptopOn").onclick = async () => { try { await Notification.requestPermission(); } catch (e) {} renderLaptop(); };
$("#laptopTest").onclick = () => { const n = nowMin(); systemNotify({ title: "This is how your alerts will look", s: n, e: n + 30, meta: "" }, []); };
renderLaptop();
$("#toClose").onclick = () => { $("#takeover").hidden = true; const { cur, next } = nowAndNext(); updatePill(cur, next); };
$("#pill").onclick = () => { const { cur, next } = nowAndNext(); showTakeover(cur, next); };
document.addEventListener("visibilitychange", checkAlert);

/* blocks for today and tomorrow as timestamps, for the phone's alarms, widget and floating ball */
function phoneItems() {
  const out = [];
  for (const off of [0, 1]) {
    const base = dayDate(off).getTime();
    plan(dayDate(off)).blocks.filter((b) => b.kind !== "break" && !b.done).forEach((b) => {
      const s = new Date(base); s.setHours(0, b.s, 0, 0); const e = new Date(base); e.setHours(0, b.e, 0, 0);
      out.push({ id: (b.id || b.kind + "-" + b.s) + "@" + off, title: b.title, start: s.getTime(), end: e.getTime(), meta: b.meta || (b.room ? "Room " + b.room : ""), kind: b.kind });
    });
  }
  return out.sort((a, b) => a.start - b.start);
}

/* ============ data ============ */
/* change just these fields, so two updates at once don't undo each other */
async function setSetting(patch) {
  try { await db.doc("settings/main").update(patch); }
  catch (e) { await db.collection("settings").doc("main").set({ ...settings, ...patch }); }
}
let unsubs = [];
function startData(store) {
  stopData(); db = store; loaded = false; renderAll();
  const timer = setTimeout(() => note("Your plan can't be reached yet. Check your connection."), 12000);
  const ok = (s) => { if (!s.metadata?.fromCache) { clearTimeout(timer); if ($("#note").textContent.startsWith("Your plan can't")) note(""); } };
  const err = (e) => { clearTimeout(timer); loaded = true; note("Couldn't load part of your plan (" + e.code + ")."); renderAll(); };
  const docs = (s) => s.docs.map((d) => ({ id: d.id, ...d.data() }));
  let gotRoutine = false, gotSettings = false, gotDays = false, serverProjects = false, applying = false, seedingProjects = false;
  /* one-time routine changes (timetable.js patches): run as soon as the data is here */
  const maybePatch = async () => {
    if (applying || !gotRoutine || !gotSettings || !gotDays || !routine.length) return;
    const prev = settings.timetableVersion || "";
    if (prev >= TIMETABLE.version) return;
    applying = true;
    try {
      for (const p of (TIMETABLE.patches || []).filter((p) => p.version > prev)) {
        for (const [id, patch] of Object.entries(p.routine || {})) {
          const r = routine.find((x) => x.id === id);
          if (r) { const { id: _, ...rest } = r; Object.assign(r, patch); await db.collection("routine").doc(id).set({ ...rest, ...patch }); }
          else if (patch.title && patch.area && patch.mins && patch.days) { const body = { notBefore: "", notAfter: "", order: 500, ...patch }; routine.push({ id, ...body }); await db.collection("routine").doc(id).set(body); }
        }
        for (const [k, patch] of Object.entries(p.days || {})) await db.collection("days").doc(k).set({ ...(days[k] || {}), date: k, ...patch });
      }
      settings.timetableVersion = TIMETABLE.version;
      await setSetting({ timetableVersion: TIMETABLE.version });
      toast("Your plan is updated for the " + TIMETABLE.label + ".");
    } catch (e) { applying = false; note("Couldn't update your plan: " + (e.message || e.code)); }
  };
  const maybeSeedProjects = async () => {
    if (seedingProjects || !serverProjects || !gotSettings || projects.length || settings.projectsSeeded) return;
    seedingProjects = true;
    try {
      for (const [i, p] of DEFAULT_PROJECTS.entries()) await db.collection("projects").doc("p" + (i + 1)).set({ ...p, status: p.horizon === "paused" ? "paused" : "active", notes: [], order: (i + 1) * 10 });
      settings.projectsSeeded = true;
      await setSetting({ projectsSeeded: true });
    } catch (e) { seedingProjects = false; }
  };
  unsubs = [
    db.collection("tasks").onSnapshot((s) => { tasks = docs(s); loaded = true; ok(s); renderBoard(); }, err),
    db.collection("reviews").onSnapshot((s) => { reviews = Object.fromEntries(s.docs.map((d) => [d.id, d.data()])); renderBoard(); }, err),
    db.collection("routine").onSnapshot((s) => {
      routine = docs(s); loaded = true; ok(s);
      if (routine.length || !s.metadata?.fromCache) gotRoutine = true;
      $("#seedPanel").hidden = !(gotRoutine && !routine.length && !s.metadata?.fromCache);
      maybePatch(); renderToday(); renderMe(); checkAlert();
    }, err),
    db.collection("days").onSnapshot((s) => { days = Object.fromEntries(s.docs.map((d) => [d.id, d.data()])); gotDays = true; maybePatch(); renderToday(); renderBoard(); }, err),
    db.doc("settings/main").onSnapshot((s) => {
      settings = { ...DEFAULT_SET, ...(s.exists ? s.data() : {}) };
      if (s.exists || !s.metadata?.fromCache) gotSettings = true;
      maybePatch(); maybeSeedProjects(); renderToday(); renderMe(); renderChat();
    }, err),
    db.collection("chat").onSnapshot((s) => { if (chatBusy) return; chatDays = Object.fromEntries(s.docs.map((d) => [d.id, d.data()])); renderChat(); }, err),
    db.collection("projects").onSnapshot((s) => { projects = docs(s); if (!s.metadata?.fromCache) serverProjects = true; maybeSeedProjects(); renderProjects(); }, err)
  ];
}
function stopData() { unsubs.forEach((u) => { try { u(); } catch (e) {} }); unsubs = []; db = null; chatDays = {}; tasks = []; reviews = {}; routine = []; days = {}; projects = []; settings = { ...DEFAULT_SET }; }

/* ============ sign-in ============ */
const authMsg = (m) => { $("#a-msg").textContent = m || ""; };
const nice = (e) => ({ "auth/invalid-credential": "That email and password don't match.", "auth/email-already-in-use": "That email already has an account. Sign in instead.", "auth/weak-password": "Use at least 6 characters.", "auth/invalid-email": "That email doesn't look right.", "auth/network-request-failed": "No connection. Try again when you're online." })[e.code] || e.message;
$("#authForm").addEventListener("submit", async (e) => { e.preventDefault(); authMsg("Signing in…"); try { await signIn($("#a-email").value.trim(), $("#a-pw").value); } catch (err) { authMsg(nice(err)); } });
$("#a-up").onclick = async () => { if (!$("#authForm").reportValidity()) return; authMsg("Creating your account…"); try { await signUp($("#a-email").value.trim(), $("#a-pw").value); } catch (err) { authMsg(nice(err)); } };
$("#a-reset").onclick = async () => { const em = $("#a-email").value.trim(); if (!em) { authMsg("Type your email first."); return; } try { await resetPassword(em); authMsg("Check your inbox for a reset link."); } catch (err) { authMsg(nice(err)); } };
$("#signOutBtn").onclick = () => logOut();
$("#seedBtn").onclick = async () => {
  if (!db) return; $("#seedBtn").disabled = true; $("#seedMsg").textContent = "Loading…";
  try { const { classes, ...rest } = seed; await db.importSeed(rest); $("#seedMsg").textContent = "Done"; $("#seedPanel").hidden = true; }
  catch (e) { $("#seedBtn").disabled = false; $("#seedMsg").textContent = "Couldn't load it: " + (e.message || e.code); }
};

/* ============ phone (Android app) ============ */
async function renderPhone() {
  if (!isNative) return; $("#phonePanel").hidden = false;
  const st = (await alertStatus()) || {};
  const rows = [
    ["notifications", "Notifications", () => askNotifications().then(renderPhone)],
    ["exact", "Alerts on the exact minute", () => openPhoneSetting("exact")],
    ["fullScreen", "Full-screen alerts when the phone is locked", () => openPhoneSetting("fullScreen")],
    ["overlay", "Full-screen alerts while you're using the phone", () => openPhoneSetting("overlay")],
    ["battery", "Unrestricted battery (Samsung)", () => openPhoneSetting("battery")],
    ["bubble", "Floating ball (now and next over any app)", () => setBubble(true).then(() => setTimeout(renderPhone, 800))]
  ];
  const ul = $("#phoneList"); ul.innerHTML = "";
  rows.forEach(([k, label, fn]) => {
    const li = h("li", "row between"); const on = st[k];
    li.append(h("span", on ? "" : "muted", (on ? "✓ " : "○ ") + label));
    if (!on) li.append(button("Turn on", fn));
    else if (k === "bubble") li.append(button("Turn off", () => setBubble(false).then(() => setTimeout(renderPhone, 500)), "btn ghost small"));
    ul.append(li);
  });
}
$("#testAlertBtn").onclick = () => testAlert();
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { renderPhone(); renderToday(); } });

/* ============ Mini Mi: the jotter and life partner ============ */
let chatBusy = false;
const partnerName = () => (settings.partnerName || "Mini Mi").trim() || "Mini Mi";
function allMessages() { return Object.keys(chatDays).sort().flatMap((k) => (chatDays[k].messages || []).map((m, i) => ({ ...m, day: k, idx: i }))); }
function freeSlots(date, fromMin) {
  const p = plan(date), out = []; let t = Math.max(p.wake, fromMin ?? p.wake);
  const busy = p.blocks.filter((b) => b.kind !== "break").sort((a, b) => a.s - b.s);
  for (const b of busy) { if (b.s - t >= 20) out.push(toHM(t) + "-" + toHM(b.s)); t = Math.max(t, b.e); }
  if (p.sleep - t >= 20) out.push(toHM(t) + "-" + toHM(p.sleep));
  return out;
}
function planContext() {
  const L = [], n = nowMin(), tk = todayKey();
  const fmtBlocks = (off) => plan(dayDate(off)).blocks.filter((b) => b.kind !== "break").map((b) => `  ${toHM(b.s)}-${toHM(b.e)} ${b.title}${b.done ? " [done]" : ""}${b.kind === "class" ? " [class" + (b.room ? ", " + b.room : "") + "]" : ""}${b.jotted || b.kind === "event" ? " [added]" : ""}${b.squeezed ? " [squeezed]" : ""}`).join("\n");
  L.push(`Now: ${dayDate(0).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}, ${toHM(n)}.`);
  L.push(`DATES (use these exact dates):\n${datesContext()}`);
  L.push(`Today's plan (${tk}):\n${fmtBlocks(0)}`);
  const pt = plan(dayDate(0));
  if (pt.over.length) L.push(`Didn't fit today: ${pt.over.map((q) => q.title).join("; ")}`);
  L.push(`Changes used today: ${changesUsed(tk)} of 2. Skipped today: ${(days[tk]?.skip || []).length}. Cancelled classes today: ${(days[tk]?.cancelled || []).length}.`);
  L.push(`Tomorrow's plan (${dkey(dayDate(1))}):\n${fmtBlocks(1)}`);
  const free = [], cls = [];
  for (let off = 0; off < 8; off++) {
    const d = dayDate(off), k = dkey(d), label = d.toLocaleDateString("en-GB", { weekday: "short" }) + " " + k;
    const f = freeSlots(d, off === 0 ? Math.ceil(n / 5) * 5 : null); free.push(`  ${label}: ${f.join(", ") || "full"}`);
    plan(d).blocks.filter((b) => b.kind === "class" || b.kind === "meeting" || b.kind === "event").forEach((b) => cls.push(`  ${label} ${toHM(b.s)} ${b.title}${b.kind === "class" ? " (class" + (b.room ? ", " + b.room : "") + ")" : b.kind === "event" ? " (added)" : ""}`));
  }
  L.push(`FREE SLOTS (gaps of 20+ min; work only after ${settings.workStart || "09:00"}):\n${free.join("\n")}`);
  L.push(`Classes, meetings and added items in the next 8 days:\n${cls.join("\n")}`);
  L.push(`ADDED ITEMS (added in chat or the jot bar; you can remove these by id):\n${addedItemsContext()}`);
  L.push(`Win streak: ${streak} days. Today: ${todayPct == null ? "no work blocks" : todayPct + "% of work done"}.`);
  const mon = mondayOf(new Date()), wk = isoWeek(mon);
  L.push(`This week's board goals:\n` + AREAS.map((a) => { const it = tasks.filter((t) => t.week === wk && t.area === a.id); return it.length ? `  ${a.name}: ` + it.map((t) => `${t.title} (${t.status === "done" ? "done" : "to do"})`).join("; ") : null; }).filter(Boolean).join("\n"));
  const lastRev = Object.keys(reviews).sort().pop();
  if (lastRev) { const r = reviews[lastRev]; L.push(`Last Sunday review (${lastRev}): completed: ${r.wins || "-"}; stuck: ${r.stuck || "-"}; top 3: ${r.next || "-"}`); }
  return L.join("\n\n");
}
const QUICK = {
  next: "What should I do next, right now?",
  prep: "Look at my classes and seminars in the next few days. What should I prepare, review or bring for each? Add prep sessions in good free slots (not on the morning of).",
  tomorrow: "Look at tomorrow with me. Anything to follow up on or prepare? Add what's needed.",
  track: "Be honest with me: looking at my life projects and what I actually did this week and last week, am I on track or going off the rails? Name the project that needs me most and give me one fix.",
  roast: "Roast me about how I've used my time today. Then tell me the one thing I should do next."
};
async function saveChat(tk, msgs) { chatDays[tk] = { ...(chatDays[tk] || {}), date: tk, messages: msgs }; await safe(db.collection("chat").doc(tk).set({ date: tk, messages: msgs }), "save the chat"); }
async function sendToPartner(text) {
  text = (text || "").trim(); if (!text || chatBusy || !db) return;
  chatBusy = true; const tk = todayKey();
  const prev = allMessages().filter((m) => !m.error).slice(-12).map((m) => ({ role: m.role === "me" ? "user" : "model", text: m.role === "me" ? m.text : JSON.stringify({ reply: m.text, actions: (m.added || []).map((a) => ({ id: a.id, title: a.title, date: a.date })), removeIds: (m.removed || []).map((r) => r.id), projectNotes: m.noted || [] }) }));
  const msgs = [...((chatDays[tk] || {}).messages || []), { role: "me", text, ts: Date.now() }];
  chatDays[tk] = { ...(chatDays[tk] || {}), messages: msgs }; renderChat(true);
  safe(db.collection("chat").doc(tk).set({ date: tk, messages: msgs }), "save your message");
  try {
    const system = systemPrompt({ name: partnerName(), banter: settings.partnerBanter || "cheeky", about: settings.partnerAbout || DEFAULT_ABOUT, context: planContext(), projects: projectsContext(), today: dayDate(0).toDateString() });
    const out = await askPartner({ system, history: prev, message: text });
    const removed = await applyRemovals(out.removeIds);
    const added = await addItems(out.actions.filter((a) => a && a.title));
    const noted = await applyProjectNotes(out.projectNotes);
    const sugs = out.suggestions.filter((s) => s && s.title).map((s) => ({ ...s, state: "new" }));
    await saveChat(tk, [...msgs, { role: "her", text: out.reply, added, removed, noted, suggestions: sugs, ts: Date.now() }]);
    if (added.length && $("#chatSheet").hidden) toast(added.length === 1 ? "Added: " + added[0].title : added.length + " things added to your calendar");
  } catch (e) {
    let reply = friendlyError(e), added = [];
    // she's unreachable, but a note to self still lands on the calendar
    if (!/\?\s*$/.test(text) && text.length < 160 && !Object.values(QUICK).includes(text)) {
      const j = parseJot(text);
      added = await addItems([{ title: j.title, date: dkey(dayDate(j.dayOffset)), start: j.start != null ? toHM(j.start) : "", notBefore: j.notBefore != null ? toHM(j.notBefore) : "", mins: j.mins, area: j.area, by: "me" }]);
      if (added.length) reply += "\nI still jotted it down for you.";
    }
    await saveChat(tk, [...msgs, { role: "her", text: reply, error: true, added, ts: Date.now() }]);
  } finally { chatBusy = false; renderChat(true); }
}
async function undoAdded(day, idx, ai) {
  const doc = chatDays[day]; if (!doc) return;
  const messages = doc.messages.map((m) => ({ ...m })); const m = messages[idx]; const a = m.added[ai];
  removeItem(a.date, a.id, true);
  m.added = m.added.map((x, i) => (i === ai ? { ...x, undone: true } : x));
  await saveChat(day, messages); renderChat();
}
async function acceptSuggestion(day, idx, si, accept) {
  const doc = chatDays[day]; if (!doc || !db) return;
  const messages = doc.messages.map((m) => ({ ...m, suggestions: m.suggestions ? m.suggestions.map((x) => ({ ...x })) : m.suggestions }));
  const s = messages[idx].suggestions[si]; if (!s || s.state !== "new") return;
  s.state = accept ? "added" : "no";
  if (accept) {
    const d = dayDate(s.when === "tomorrow" ? 1 : s.when === "next week" ? 7 - wd(new Date()) : 0);
    await safe(db.collection("tasks").add({ area: AREAS.some((a) => a.id === s.area) ? s.area : "life", title: s.title, week: isoWeek(mondayOf(d)), status: "todo", createdAt: Date.now(), from: "minimi" }), "add it");
  }
  await saveChat(day, messages); renderChat();
}
function renderChat(scroll) {
  const box = $("#chat"); if (!box) return;
  const name = partnerName();
  $("#pName").textContent = name; $("#navChat").textContent = name;
  document.querySelectorAll(".mm-avatar").forEach((a) => (a.textContent = name[0].toUpperCase()));
  $("#jotIn").placeholder = `Tell ${name}… “office called, update client portfolio today”`;
  if ($("#chatSheet").hidden && !scroll) return;
  const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
  box.innerHTML = "";
  const msgs = allMessages().slice(-40);
  if (!msgs.length) box.append(h("div", "msg her", `Hey Anthonia! I'm ${name}, your jotter. Tell me anything that comes up ("office called, update the client portfolio today") and I'll find the best free slot and put it on your calendar. I also know your life projects, so I'll tell you if you're drifting.`));
  msgs.forEach((m) => {
    box.append(h("div", "msg " + (m.role === "me" ? "me" : "her"), m.text));
    if (m.added?.length || m.noted?.length || m.removed?.length) {
      const w = h("div", "added");
      (m.added || []).forEach((a, ai) => {
        const r = h("div", "a"); r.append(h("span", "", a.undone ? "↺" : "✓"));
        const gone = a.undone || (loaded && !findAdded(a.id));
        const t = h("div"); const b = h("b", "", a.title); if (gone) b.style.textDecoration = "line-through"; t.append(b, h("div", "when", gone ? "Removed" : addedLabel(a)));
        r.append(t);
        if (!a.undone && days[a.date] && [...(days[a.date].events || []), ...(days[a.date].extra || [])].some((x) => x.id === a.id))
          r.append(button("Undo", () => undoAdded(m.day, m.idx, ai), "btn ghost small", "Undo adding " + a.title));
        w.append(r);
      });
      (m.removed || []).forEach((r) => { const row = h("div", "a x"); const t = h("div"); const b = h("b", "", r.title); t.append(b, h("div", "when", r.blocked ? "Couldn't remove: no changes left that day" : "Removed · " + relDay(r.date))); row.append(h("span", "", r.blocked ? "!" : "✕"), t); w.append(row); });
      (m.noted || []).forEach((n) => { const r = h("div", "a p"); const t = h("div"); t.append(h("b", "", n.isNew ? "New project: " + n.project : n.project), h("div", "when", "Noted · " + n.note)); r.append(h("span", "", "★"), t); w.append(r); });
      box.append(w);
    }
    (m.suggestions || []).forEach((s, si) => {
      const c = h("div", "sug"); c.append(h("span", "chip", (AREA_NAME[s.area] || s.area) + " · " + s.when), h("b", "", s.title));
      if (s.why) c.append(h("span", "muted small", s.why));
      if (s.state === "new") { const r = h("div", "row"); r.append(button("Add to my week", () => acceptSuggestion(m.day, m.idx, si, true), "btn primary small"), button("No thanks", () => acceptSuggestion(m.day, m.idx, si, false), "btn ghost small")); c.append(r); }
      else c.append(h("span", "muted small", s.state === "added" ? "✓ On your week board" : "Skipped"));
      box.append(c);
    });
  });
  if (chatBusy) { const t = h("div", "msg her typing"); t.setAttribute("aria-label", name + " is typing"); t.append(h("i"), h("i"), h("i")); box.append(t); }
  if (scroll || atBottom) box.scrollTop = box.scrollHeight;
  $("#chatSend").disabled = chatBusy; $("#jotSend").disabled = chatBusy;
  document.querySelectorAll("#quick button").forEach((b) => (b.disabled = chatBusy));
}
$("#jotForm").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#jotIn").value.trim(); if (!v) { openChat(); return; } $("#jotIn").value = ""; $("#jotIn").blur(); openChat(); sendToPartner(v); });
$("#chatForm").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#chatIn").value; $("#chatIn").value = ""; sendToPartner(v); });
document.querySelectorAll("#quick button").forEach((b) => (b.onclick = () => sendToPartner(QUICK[b.dataset.q])));

/* ============ start ============ */
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(() => {}));
if (!configured) $("#setupScreen").hidden = false;
else watchUser((user) => {
  $("#authScreen").hidden = !!user; $("#app").hidden = !user;
  if (user) { $("#whoami").textContent = "Signed in as " + (user.email || "you"); startData(makeDb(user.uid)); renderPhone(); route(); }
  else { stopData(); authMsg(""); $("#pill").hidden = true; }
});
