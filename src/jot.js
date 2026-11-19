/* Understands quick notes like:
   "update client portfolio at 4pm", "call office tomorrow 10:30 for 20 min",
   "gym friday 7pm 1h", "buy groceries later", "read notes after 18:00"
   Returns { title, dayOffset, start (min|null), mins, notBefore (min|null), area } */

const DAYNAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const SHORT = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const AREA_WORDS = [
  ["cmax", /\bcmax\b/i],
  ["website", /\b(agn )?website\b/i],
  ["staff", /\b(staff|office|agn|call|meeting|hr|onboard)/i],
  ["targets", /\b(target|report)s?\b/i],
  ["gigs", /\b(gig|upwork|client|portfolio|proposal|freelance|apply|application)/i],
  ["school", /\b(class|lecture|study|assignment|exam|notes|reading list|professor|univpm)\b/i],
  ["meal", /\b(lunch|dinner|breakfast|eat|cook)\b/i],
  ["fun", /\b(movie|film|party|hang ?out|friends|date)\b/i],
  ["life", /\b(buy|shop|groceries|bank|permesso|doctor|laundry|clean|errand|pay)\b/i]
];

function parseTime(h, m, ap) {
  h = +h; m = +(m || 0);
  if (ap) { ap = ap.toLowerCase(); if (ap.startsWith("p") && h < 12) h += 12; if (ap.startsWith("a") && h === 12) h = 0; }
  else if (h >= 1 && h <= 6) h += 12; // "at 4" means 4pm
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function parseJot(text, now = new Date()) {
  let s = " " + String(text || "").trim() + " ";
  const out = { dayOffset: 0, start: null, mins: null, notBefore: null, notAfter: null, area: null };
  const cut = (re) => { s = s.replace(re, " "); };

  // day
  let m;
  if ((m = s.match(/\b(day after tomorrow)\b/i))) { out.dayOffset = 2; cut(m[0]); }
  else if ((m = s.match(/\b(tomorrow|tmrw|tmr)\b/i))) { out.dayOffset = 1; cut(m[0]); }
  else if ((m = s.match(/\b(later today|today|tonight|this (morning|afternoon|evening))\b/i))) {
    if (/tonight|evening/i.test(m[0])) out.notBefore = 18 * 60;
    if (/afternoon/i.test(m[0])) out.notBefore = 13 * 60;
    cut(m[0]);
  } else if ((m = s.match(new RegExp("\\b(next )?(on )?(" + DAYNAMES.join("|") + "|" + SHORT.join("|") + ")\\b", "i")))) {
    const name = m[3].toLowerCase();
    let idx = DAYNAMES.indexOf(name); if (idx < 0) idx = SHORT.indexOf(name);
    const today = (now.getDay() + 6) % 7;
    let off = (idx - today + 7) % 7; if (off === 0) off = 7; if (m[1]) off += off < 7 ? 7 : 0;
    out.dayOffset = off; cut(m[0]);
  }
  if ((m = s.match(/\blater\b/i))) { cut(m[0]); }

  // duration: "for 30 min", "1h", "2 hours", "1.5h", "90min"
  if ((m = s.match(/\b(for )?(\d+(?:[.,]\d+)?)\s*(h|hr|hrs|hour|hours)\b/i))) { out.mins = Math.round(parseFloat(m[2].replace(",", ".")) * 60); cut(m[0]); }
  else if ((m = s.match(/\b(for )?(\d+)\s*(m|min|mins|minute|minutes)\b/i))) { out.mins = +m[2]; cut(m[0]); }

  // time: "after 6pm" → not before; "at 4pm", "16:00", "4:30pm", "by 10"
  if ((m = s.match(/\b(after|from)\s+(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\b/i))) {
    const t = parseTime(m[2], m[3], m[4]); if (t != null) { out.notBefore = t; cut(m[0]); }
  } else if ((m = s.match(/\b(by|before)\s+(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/i))) {
    const t = parseTime(m[2], m[3], m[4]); if (t != null) { out.notAfter = t; cut(m[0]); }
  } else if ((m = s.match(/\b(at|@)?\s*(\d{1,2})[:.](\d{2})\s*(am|pm)?\b/i)) || (m = s.match(/\b(at|@)?\s*(\d{1,2})()\s*(am|pm)\b/i)) || (m = s.match(/\b(at|@)\s*(\d{1,2})()()\b/i))) {
    const t = parseTime(m[2], m[3], m[4]); if (t != null) { out.start = t; cut(m[0]); }
  } else if ((m = s.match(/\b(noon|midday)\b/i))) { out.start = 12 * 60; cut(m[0]); }

  for (const [area, re] of AREA_WORDS) if (re.test(text)) { out.area = area; break; }
  let title = s.replace(/\s+/g, " ").replace(/^\s*(remind me to|i need to|i have to|please|pls|add|to)\s+/i, "").replace(/\s+(on|at|by|for|and)\s*$/i, "").trim();
  title = title.charAt(0).toUpperCase() + title.slice(1);
  out.title = title || "Something new";
  if (out.mins == null) out.mins = out.area === "meal" ? 45 : out.start != null ? 30 : 45;
  if (!out.area) out.area = "life";
  return out;
}
