import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from "firebase/ai";
import { app } from "./firebase.js";

/* Mini Mi: chat partner powered by Gemini through Firebase AI Logic (free tier).
   Turn it on once in Firebase console → Build → AI Logic → Get started → Gemini Developer API. */

// Fast "lite" models first (no thinking step, quick replies); bigger ones only as backup
const MODELS = ["gemini-flash-lite-latest", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];
export const AREA_IDS = ["gigs", "staff", "targets", "cmax", "website", "school", "life", "self", "meal", "rest", "read", "fun"];

const replySchema = Schema.object({
  properties: {
    reply: Schema.string({ description: "What Mini Mi says back, in her voice. Short paragraphs. If you added things, say where they landed and why that slot." }),
    actions: Schema.array({
      description: "Things to put on her calendar RIGHT NOW. Every item here is added immediately. Empty if nothing should be added.",
      items: Schema.object({
        properties: {
          title: Schema.string({ description: "Short, starts with a verb, under 60 characters" }),
          date: Schema.string({ description: "YYYY-MM-DD" }),
          start: Schema.string({ description: "HH:MM (24h) only when the exact time matters (a call, a meeting, a time she gave). Otherwise empty string." }),
          notBefore: Schema.string({ description: "HH:MM earliest sensible start when start is empty, or empty string" }),
          mins: Schema.integer({ description: "Duration in minutes, 10-240" }),
          area: Schema.enumString({ enum: AREA_IDS })
        },
        optionalProperties: ["start", "notBefore"]
      })
    }),
    removeIds: Schema.array({
      description: "ids from ADDED ITEMS to take off her calendar: a mistake you made (wrong date, time or title), something she corrected, cancelled or wants moved. When fixing or moving, also put the corrected item in actions. Empty otherwise.",
      items: Schema.string()
    }),
    projectNotes: Schema.array({
      description: "Things she just told you about her life projects worth remembering for later: progress, a decision, a setback, a new plan or idea. Empty unless she shared something like that.",
      items: Schema.object({
        properties: {
          project: Schema.string({ description: "The project's name exactly as listed under LIFE PROJECTS, or a short new name if this is a new plan" }),
          note: Schema.string({ description: "One short line in third person, e.g. 'Sent 3 Upwork proposals' or 'Decided to pause Pods until January'" }),
          isNew: Schema.boolean({ description: "true only if this is a brand-new project or plan not in the list" })
        }
      })
    }),
    suggestions: Schema.array({
      description: "0 to 4 bigger goals for her week board that she can accept or decline. Usually empty.",
      items: Schema.object({
        properties: {
          title: Schema.string({ description: "Short task, starts with a verb, under 70 characters" }),
          area: Schema.enumString({ enum: AREA_IDS }),
          when: Schema.enumString({ enum: ["today", "tomorrow", "this week", "next week"] }),
          why: Schema.string({ description: "One short reason, in Mini Mi's voice" })
        }
      })
    })
  },
  optionalProperties: ["actions", "removeIds", "projectNotes", "suggestions"]
});

let ai = null;
const aiInstance = () => (ai ||= getAI(app, { backend: new GoogleAIBackend() }));

export function systemPrompt({ name, banter, about, context, projects, today }) {
  const tone = {
    gentle: "Warm and encouraging. Light teasing only, always kind.",
    cheeky: "Playful and cheeky. Tease her like a close friend: call out excuses, laugh at her procrastination, hype her wins. Light Nigerian pidgin now and then is welcome.",
    savage: "Brutally honest best friend. Roast her procrastination and excuses with sharp, funny jabs and Nigerian pidgin flavour, then push her to act. Never cruel."
  }[banter] || "";
  return `You are ${name}, Anthonia's accountability partner inside her Weekly Board planner. You talk like her close friend who knows her life well: you gist, joke, tease, celebrate wins, and keep her on track.

Tone: ${tone}
Rules for teasing: roast her habits and excuses only. Never mock her body, looks, family, faith, background or intelligence. If she sounds genuinely stressed, sad or overwhelmed, drop the jokes, be kind and practical, and suggest rest or talking to someone she trusts.
You are an AI friend in an app, not a real person; don't pretend otherwise if she asks.

You are also her jotter. She tells you things in passing ("office called, I need to update the client portfolio", "remind me to pay rent", "seminar on Friday") and YOU put them on her calendar:
- Anything she needs to do, remember, prepare or attend goes into "actions". Items in actions are added the moment you reply, so never say "I'll add it" or "added" unless it is in actions, and never leave out something you said you added.
- Pick the best slot from her FREE SLOTS below (they already respect classes, the bus, meals and breaks). Respect: nothing that's work before 9:00 (her mornings are gentle on purpose); AGN calls only 9:00-17:00 Mon-Fri; CMAX updates due Wed and Fri; don't steal her meals, wind-down or rest.
- If the time matters (a call, a meeting, a time she said), set "start". Otherwise leave start empty and set "notBefore" so the planner fits it into free time and can squeeze it if the day gets busy.
- If something truly won't fit today, put it on the next day with room and tell her.
- When she mentions a class, seminar or exam, help her prepare: suggest what to review or bring and add prep sessions before it (not on the morning of, unless she asks).
- If she's vague ("later", "sometime this week"), choose for her and say why in one line. Ask only if you really can't tell what she means.
- Dates: always take the date from the DATES list below; never work it out yourself. Double-check the weekday matches.
- Corrections: if you got a date, time or detail wrong, or she corrects or cancels something, put the wrong item's id (from ADDED ITEMS) in "removeIds" and the right one in "actions", in the same reply. Never leave the wrong one on her calendar. Removing your own additions is free.
- Moving something she or you added = remove it by id + add it again at the new time.
- Her routine blocks and classes are not yours to remove. She can skip or move at most 2 planned blocks a day herself.
- Use "suggestions" only for bigger goals for the week board, and rarely.
- Keep replies short: 1-4 sentences unless she asks for more. No markdown headings, no bullet walls.

You also know her LIFE PROJECTS (below): what she's building towards, why, and what "on track" looks like for each, with what she actually did this week and last week.
- Chat about them like a friend who remembers: ask how they're going, connect today's tasks to the bigger goal, get excited about progress.
- Tell her plainly when she's going off the rails: a "now" project with nothing done for a week or more, the same block skipped again and again, a deadline slipping (targets by the 3rd, CMAX Wed/Fri), or a new shiny idea eating time from her priorities. Say it once, clearly and kindly, name the project, then offer one concrete fix and add it to "actions" if she agrees or if it's obviously needed.
- Don't nag about paused or someday projects unless she brings them up, but do notice if she keeps talking about one and never plans time for it.
- When she shares progress, a decision or a new plan for any project, log it in "projectNotes" so you remember next time.

Today is ${today}.

About Anthonia:
${about}

LIFE PROJECTS:
${projects || "(none written down yet)"}

Her plan right now:
${context}`;
}

/** history: [{role:"user"|"model", text}] (oldest first). Returns {reply, suggestions}. */
/* Gemini needs turns to alternate user → model → user, starting with user.
   Failed answers leave gaps, so merge neighbours with the same role. */
function cleanHistory(history) {
  const out = [];
  for (const m of history) {
    const text = String(m.text || "").trim();
    if (!text) continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.parts[0].text += "\n" + text;
    else out.push({ role: m.role, parts: [{ text }] });
  }
  while (out.length && out[0].role !== "user") out.shift();
  if (out.length && out[out.length - 1].role === "user") out.pop(); // the new message is sent separately
  return out;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const busy = (e) => /\b(500|502|503|504|429)\b|high demand|overloaded|unavailable|RESOURCE_EXHAUSTED/i.test(String(e?.message));
const missing = (e) => /not.?found|404|is not supported/i.test(String(e?.message));

/** history: [{role:"user"|"model", text}] (oldest first). Returns {reply, suggestions}. */
export async function askPartner({ system, history, message }) {
  const hist = cleanHistory(history);
  let lastErr = null;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const gm = getGenerativeModel(aiInstance(), {
          model,
          systemInstruction: system,
          generationConfig: { responseMimeType: "application/json", responseSchema: replySchema, temperature: 0.9, maxOutputTokens: 1100 }
        }, { timeout: 25000 });
        const r = await gm.startChat({ history: hist }).sendMessage(message);
        const out = JSON.parse(r.response.text());
        return { reply: String(out.reply || ""), removeIds: Array.isArray(out.removeIds) ? out.removeIds.slice(0, 8).map(String) : [], actions: Array.isArray(out.actions) ? out.actions.slice(0, 8) : [], projectNotes: Array.isArray(out.projectNotes) ? out.projectNotes.slice(0, 5) : [], suggestions: Array.isArray(out.suggestions) ? out.suggestions.slice(0, 4) : [] };
      } catch (e) {
        console.warn("Mini Mi error", model, e);
        lastErr = e;
        if (missing(e)) break;                          // try the next model
        if (busy(e) || /timeout|abort/i.test(String(e?.message))) { if (attempt === 0 && busy(e)) { await wait(800); continue; } break; } // retry once, then next model
        throw e;                                        // anything else: show it
      }
    }
  }
  throw lastErr || new Error("Mini Mi couldn't answer");
}

export function friendlyError(e) {
  const m = String(e?.message || e);
  if (/api.?not.?enabled|has not been used|disabled|PERMISSION_DENIED|403/i.test(m))
    return "Mini Mi isn't switched on yet. In Firebase, open Build → AI Logic → Get started → choose the free Gemini Developer API, then try again.";
  if (/quota|429|RESOURCE_EXHAUSTED/i.test(m)) return "Mini Mi is out of free answers for the moment. Try again in a minute.";
  if (/high demand|overloaded|unavailable|\b50[0-4]\b/i.test(m)) return "Google's servers are busy right now, so Mini Mi can't think straight. Try again in a minute.";
  if (/network|Failed to fetch|offline/i.test(m)) return "No connection right now. Try again when you're online.";
  if (/App Check|401/i.test(m))
    return "Mini Mi is blocked by Firebase's security check (error 401). Full message: " + m.replace(/^.*?\[401[^\]]*\]\s*/, "");
  return "Mini Mi couldn't answer: " + m;
}
