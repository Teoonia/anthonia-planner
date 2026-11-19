/* Weekly Board planning engine (pure: no DOM, no Firebase), so it can be tested in Node.
   state = { classes:[{id,title,day,start,end,room,kind,from}], routine:[...], days:{key:{...}}, settings:{...} } */

export const NONWORK = ["meal", "rest", "read", "fun", "self"];
export const isWork = (a) => !NONWORK.includes(a);
export const DEFAULT_SET = {
  wake: "06:00", sleep: "23:00", workStart: "09:00",
  short: 10, long: 20, after: 90,
  commute: 45, walkwait: 25, early: 15, afterclass: 20
};

export const toMin = (s) => { if (!s && s !== 0) return null; const [h, m] = String(s).split(":").map(Number); return Number.isFinite(h) ? h * 60 + (m || 0) : null; };
export const toHM = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
export const dkey = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
export const wd = (d) => (d.getDay() + 6) % 7;
export function mondayOf(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - wd(x)); return x; }
export function isoWeek(mon) { const t = new Date(mon); t.setDate(t.getDate() + 3); const y = t.getFullYear(); const w = 1 + Math.round(((t - mondayOf(new Date(y, 0, 4))) / 864e5) / 7); return y + "-W" + String(w).padStart(2, "0"); }
export function dayDate(off, base = new Date()) { const d = new Date(base); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + off); return d; }

export function planDay(state, date) {
  const { classes = [], routine = [], days = {} } = state;
  const settings = { ...DEFAULT_SET, ...(state.settings || {}) };
  const key = dkey(date), w = wd(date), dd = days[key] || {};
  const wake = toMin(settings.wake) ?? 360, sleep = toMin(settings.sleep) ?? 1380;
  const workStart = toMin(settings.workStart) ?? 540;
  const sb = +settings.short || 0, lb = +settings.long || 0, after = +settings.after || 90;

  /* ---- fixed things: classes, weekly meetings, things that came up ---- */
  const cancelled = new Set(dd.cancelled || []);
  const fixed = [
    ...classes.filter((c) => +c.day === w && (!c.from || key >= c.from) && !cancelled.has(c.id) &&
      toMin(c.start) != null && toMin(c.end) > toMin(c.start))
      .map((c) => ({ id: "c-" + c.id, cid: c.id, kind: c.kind === "meeting" ? "meeting" : "class", title: c.title, room: c.room, s: toMin(c.start), e: toMin(c.end) })),
    ...(dd.events || []).filter((e) => toMin(e.start) != null)
      .map((e) => ({ id: e.id, kind: "event", title: e.title, area: e.area, s: toMin(e.start), e: toMin(e.start) + (+e.mins || 30), done: (dd.done || []).includes(e.id) }))
  ].sort((a, b) => a.s - b.s);

  /* ---- the trip to and from school ---- */
  const ride = +settings.commute || 0, cls = fixed.filter((f) => f.kind === "class");
  const walkWait = settings.walkwait ?? 25, early = settings.early ?? 15, afterCls = settings.afterclass ?? 20;
  if (ride && cls.length) {
    const first = Math.min(...cls.map((c) => c.s)), last = Math.max(...cls.map((c) => c.e));
    let t = first - early - ride - walkWait;
    if (walkWait) fixed.push({ id: "go-walk", kind: "ride", title: "Walk to the stop", meta: "Head out the door now", s: t, e: t + walkWait });
    t += walkWait;
    fixed.push({ id: "ride-to", kind: "ride", title: "Ride to school", meta: "Read, music, enjoy the view. No tasks this early.", s: t, e: t + ride });
    t += ride;
    if (early) fixed.push({ id: "go-arrive", kind: "ride", title: "Settle in", meta: "Find the room, get a seat", s: t, e: first });
    let h = last;
    if (afterCls) fixed.push({ id: "home-after", kind: "ride", title: "Chat with friends, walk to the stop", s: h, e: h + afterCls });
    h += afterCls;
    if (walkWait) fixed.push({ id: "home-wait", kind: "ride", title: "Wait for the bus", s: h, e: h + walkWait });
    h += walkWait;
    fixed.push({ id: "ride-home", kind: "ride", title: "Ride home", meta: "Quick tasks: AGN messages, tick off today, pick tomorrow's top 3", s: h, e: h + ride });
    fixed.sort((a, b) => a.s - b.s);
  }

  /* ---- flexible blocks: routine + jotted extras, in priority order ---- */
  const done = new Set(dd.done || []), skip = new Set(dd.skip || []);
  let queue = routine.filter((r) => (r.days || []).includes(w)).sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((r) => ({ id: r.id, title: r.title, area: r.area, mins: +r.mins || 30, nb: toMin(r.notBefore), na: toMin(r.notAfter) }));
  const extra = (dd.extra || []).map((x) => ({ ...x, mins: +x.mins || 45, nb: toMin(x.notBefore), na: toMin(x.notAfter), jotted: true }));
  // jotted things come before routine work (you asked for them), but after
  // meals and self-care, which keep their own windows
  const anchored = (q) => q.area === "meal" || q.area === "self";
  queue = [...queue.filter(anchored), ...extra, ...queue.filter((q) => !anchored(q))];
  if (dd.order && dd.order.length) { const pos = Object.fromEntries(dd.order.map((id, i) => [id, i])); queue.sort((a, b) => (pos[a.id] ?? 999) - (pos[b.id] ?? 999)); }
  queue = queue.filter((q) => !skip.has(q.id));

  const from = dd.from != null ? Math.max(wake, dd.from) : wake;
  const placed = [], over = [], doneItems = [];
  const busy = fixed.map((f) => ({ s: f.s, e: f.e + (f.kind === "class" ? sb : 0) }));
  const free = (s, e) => !busy.some((b) => s < b.e && e > b.s);
  const limitOf = (na) => Math.min(sleep, na ?? sleep);
  function earliest(start, m, endBy) {
    const limit = limitOf(endBy); let t = start, guard = 0;
    while (t + m <= limit && guard++ < 500) {
      const hit = busy.filter((b) => t < b.e && t + m > b.s);
      if (!hit.length) return t;
      t = Math.max(...hit.map((b) => b.e));
    }
    return null;
  }
  // squeeze: the earliest gap of at least `min` minutes; use as much of it as the block wants
  function squeeze(start, want, min, endBy) {
    const t = earliest(start, min, endBy);
    if (t == null) return null;
    const nextBusy = Math.min(limitOf(endBy), ...busy.filter((b) => b.s >= t + min).map((b) => b.s));
    return { t, len: Math.min(want, nextBusy - t) };
  }

  for (const q of queue) {
    if (dd.from != null && done.has(q.id)) { doneItems.push(q); continue; }
    const start = Math.max(from, q.nb ?? 0, isWork(q.area) ? workStart : 0);
    let t = earliest(start, q.mins, q.na), len = q.mins, squeezed = false;
    if (t == null) {
      const min = q.area === "meal" ? Math.max(25, Math.round(q.mins * 0.6)) : Math.max(20, Math.round(q.mins * 0.5 / 5) * 5);
      const sq = q.mins > min ? squeeze(start, q.mins, min, q.na) : null;
      if (sq) { t = sq.t; len = Math.floor(sq.len / 5) * 5 || sq.len; squeezed = len < q.mins; }
    }
    if (t == null) { over.push(q); continue; }
    placed.push({ ...q, kind: q.area === "meal" ? "meal" : "flex", s: t, e: t + len, done: done.has(q.id), squeezed });
    busy.push({ s: t, e: t + len });
    if (isWork(q.area)) {
      const br = len >= after ? lb : sb;
      if (br && t + len + br <= sleep && free(t + len, t + len + br)) {
        placed.push({ kind: "break", title: br === lb && lb > sb ? "Longer break" : "Short break", s: t + len, e: t + len + br });
        busy.push({ s: t + len, e: t + len + br });
      }
    }
  }
  const blocks = [...fixed.filter((f) => f.e > wake && f.s < sleep), ...placed].sort((a, b) => a.s - b.s || (a.kind === "class" ? -1 : 1));
  return { blocks, over, doneItems, queue, key, dd, wake, sleep };
}
