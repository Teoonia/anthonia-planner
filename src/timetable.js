/* Anthonia's class timetable (UNIVPM, EHDRM). Bump `version` whenever it changes:
   the app replaces the classes in Firestore once, on the next open, on every device. */
export const TIMETABLE = {
  version: "2026-11-09",
  label: "week of 9 November",
  classes: {
    "bio-mon":  { title: "Biological and Ecological Risk", day: 0, start: "08:30", end: "11:30", room: "B12" },
    "es-mon":   { title: "Environmental Sustainability", day: 0, start: "11:30", end: "13:30", room: "B12" },
    "chem-mon": { title: "Chemical and Industrial Risk", day: 0, start: "14:30", end: "17:30", room: "Aula Azzurra (Scienze 3)" },
    "ren-tue":  { title: "Renewables and Innovative Energy Systems", day: 1, start: "08:30", end: "10:30", room: "B12" },
    "bio-tue":  { title: "Biological and Ecological Risk", day: 1, start: "10:30", end: "13:30", room: "B12" },
    "es-tue":   { title: "Environmental Sustainability", day: 1, start: "14:30", end: "16:30", room: "S6 (Scienze 1)" },
    "geo-thu":  { title: "Geological Hazard in a Changing Climate", day: 3, start: "10:30", end: "12:30", room: "B12" },
    "chem-thu": { title: "Chemical and Industrial Risk", day: 3, start: "14:30", end: "17:30", room: "B12" },
    "ren-fri":  { title: "Renewables and Innovative Energy Systems", day: 4, start: "08:30", end: "10:30", room: "B12" },
    "geo-fri":  { title: "Geological Hazard in a Changing Climate", day: 4, start: "10:30", end: "12:30", room: "B12" },
    "eq-fri":   { title: "Earthquake Risk Mitigation", day: 4, start: "12:30", end: "14:30", room: "B12" }
  }
};
