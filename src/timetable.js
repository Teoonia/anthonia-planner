/* `from` = first date a class runs (cancelled before then).
   Anthonia's class timetable (UNIVPM, EHDRM). Bump `version` whenever it changes:
   the app replaces the classes in Firestore once, on the next open, on every device. */
export const TIMETABLE = {
  version: "2026-11-09d",
  label: "week of 9 November",
  classes: {
    "bio-mon":  { title: "Biological and Ecological Risk", day: 0, start: "08:30", end: "11:30", room: "B12" },
    "es-mon":   { title: "Environmental Sustainability", day: 0, start: "11:30", end: "13:30", room: "B12" },
    "chem-mon": { title: "Chemical and Industrial Risk", day: 0, start: "14:30", end: "17:30", room: "Aula Azzurra (Scienze 3)" },
    "clim-wed": { title: "Climate Change and Natural Hazard", day: 2, start: "14:30", end: "16:30", room: "A5", from: "2026-11-16" },
    "ren-tue":  { title: "Renewables and Innovative Energy Systems", day: 1, start: "08:30", end: "10:30", room: "B12" },
    "bio-tue":  { title: "Biological and Ecological Risk", day: 1, start: "10:30", end: "13:30", room: "B12" },
    "es-tue":   { title: "Environmental Sustainability", day: 1, start: "14:30", end: "16:30", room: "S6 (Scienze 1)" },
    "clim-thu": { title: "Climate Change and Natural Hazard", day: 3, start: "08:30", end: "10:30", room: "B12", from: "2026-11-16" },
    "geo-thu":  { title: "Geological Hazard in a Changing Climate", day: 3, start: "10:30", end: "12:30", room: "B12" },
    "chem-thu": { title: "Chemical and Industrial Risk", day: 3, start: "14:30", end: "17:30", room: "B12" },
    "ren-fri":  { title: "Renewables and Innovative Energy Systems", day: 4, start: "08:30", end: "10:30", room: "B12" },
    "geo-fri":  { title: "Geological Hazard in a Changing Climate", day: 4, start: "10:30", end: "12:30", room: "B12" },
    "mercy-sun": { title: "Weekly meeting with Ms Mercy (assistant)", day: 6, start: "17:30", end: "18:30", room: "", kind: "meeting" },
    "eq-fri":   { title: "Earthquake Risk Mitigation", day: 4, start: "12:30", end: "14:30", room: "B12" }
  },
  // changes to existing routine blocks (merged into each block)
  routine: {
    "v2-cx":  { order: 65 },                              // CMAX first thing Wednesday, after class Friday
    "v2-r60": { days: [1, 3], order: 66, notBefore: "17:00", title: "Study: review today's lectures" }, // Tue + Thu evenings
    "v2-r20": { days: [0, 1, 2, 4] },                     // no evening gig slot on long Thursdays
    "v2-r61": { days: [5], notBefore: "10:30" },          // deep study moves to Saturday
    "v2-r80": { days: [] },                               // Wednesday walk = the walk to the bus now
    "v2-r50": { days: [0] },                              // Wednesday already has the AGN calls
    "v2-rdw": { notBefore: "08:30" },                     // weekend reading right after the slow start
    "v2-r30":  { notAfter: "17:00" },                     // lunch-break check-in call
    "v2-r30w": { notAfter: "17:00" },                     // Wednesday check-in calls
    "v2-r35":  { notAfter: "17:00" },                     // Wednesday team calls
    "v2-r30b": { notAfter: "17:00" },                     // Friday check-in calls
    "v2-r40b": { notBefore: "12:00" },                    // Wednesday lunch before the bus
    "v2-r100": { title: "Evening AGN check (messages only, no calls)" },
    "v2-u20":  { notBefore: "11:00" },                    // call home, Sunday morning
    "v2-mv2":  { notBefore: "14:00" },                    // Sunday movie before the meeting
    "v2-u30":  { notBefore: "16:45", title: "Weekly review, then brief Ms Mercy" }
  },
  // Ms Mercy now runs the monthly staff meeting and reports back on Sundays,
  // so those meetings come off Anthonia's plan
  days: {
    "2026-12-02": { events: [] },
    "2027-01-06": { events: [] },
    "2027-02-03": { events: [] }
  }
};
