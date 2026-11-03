import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from "firebase/ai";
import { app } from "./firebase.js";

/* Mini Mi: chat partner powered by Gemini through Firebase AI Logic (free tier).
   Turn it on once in Firebase console → Build → AI Logic → Get started → Gemini Developer API. */

const MODELS = ["gemini-flash-latest", "gemini-2.5-flash"];
export const AREA_IDS = ["gigs", "staff", "targets", "cmax", "website", "school", "life"];

const replySchema = Schema.object({
  properties: {
    reply: Schema.string({ description: "What Mini Mi says back, in her voice. Short paragraphs." }),
    suggestions: Schema.array({
      description: "0 to 4 concrete tasks to add to the board. Empty when chatting casually.",
      items: Schema.object({
        properties: {
          title: Schema.string({ description: "Short task, starts with a verb, under 70 characters" }),
          area: Schema.enumString({ enum: AREA_IDS }),
          when: Schema.enumString({ enum: ["today", "tomorrow", "this week", "next week"] }),
          why: Schema.string({ description: "One short reason, in Mini Mi's voice" })
        }
      })
    })
  }
});

let ai = null;
const aiInstance = () => (ai ||= getAI(app, { backend: new GoogleAIBackend() }));

export function systemPrompt({ name, banter, about, context, today }) {
  const tone = {
    gentle: "Warm and encouraging. Light teasing only, always kind.",
    cheeky: "Playful and cheeky. Tease her like a close friend: call out excuses, laugh at her procrastination, hype her wins. Light Nigerian pidgin now and then is welcome.",
    savage: "Brutally honest best friend. Roast her procrastination and excuses with sharp, funny jabs and Nigerian pidgin flavour, then push her to act. Never cruel."
  }[banter] || "";
  return `You are ${name}, Anthonia's accountability partner inside her Weekly Board planner. You talk like her close friend who knows her life well: you gist, joke, tease, celebrate wins, and keep her on track.

Tone: ${tone}
Rules for teasing: roast her habits and excuses only. Never mock her body, looks, family, faith, background or intelligence. If she sounds genuinely stressed, sad or overwhelmed, drop the jokes, be kind and practical, and suggest rest or talking to someone she trusts.
You are an AI friend in an app, not a real person; don't pretend otherwise if she asks.

How to help:
- Base everything on her real plan below: today's blocks, what's done, this week's board, her streak and her review.
- When she asks what to do next (or uses a quick button), suggest 1-4 specific, doable tasks tied to her areas. Each must fit her actual schedule (classes, commute, AGN office hours 9:00-17:00 Mon-Fri Lagos time, CMAX updates due Wed and Fri, AGN website 1-2 days a week, monthly targets out by the 3rd, weekly reports checked Monday).
- Don't suggest something already on the board. Prefer small next steps over vague goals.
- When chatting casually, reply naturally and leave suggestions empty.
- Keep replies short: 2-5 sentences unless she asks for more. No markdown headings.

Today is ${today}.

About Anthonia:
${about}

Her plan right now:
${context}`;
}

/** history: [{role:"user"|"model", text}] (oldest first). Returns {reply, suggestions}. */
export async function askPartner({ system, history, message }) {
  const hist = history.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
  let lastErr = null;
  for (const model of MODELS) {
    try {
      const gm = getGenerativeModel(aiInstance(), {
        model,
        systemInstruction: system,
        generationConfig: { responseMimeType: "application/json", responseSchema: replySchema, temperature: 0.9 }
      });
      const r = await gm.startChat({ history: hist }).sendMessage(message);
      const out = JSON.parse(r.response.text());
      return { reply: String(out.reply || ""), suggestions: Array.isArray(out.suggestions) ? out.suggestions.slice(0, 4) : [] };
    } catch (e) {
      lastErr = e;
      if (/not.?found|404|is not supported/i.test(String(e?.message))) continue;
      break;
    }
  }
  throw lastErr || new Error("Mini Mi couldn't answer");
}

export function friendlyError(e) {
  const m = String(e?.message || e);
  if (/api.?not.?enabled|has not been used|disabled|PERMISSION_DENIED|403/i.test(m))
    return "Mini Mi isn't switched on yet. In Firebase, open Build → AI Logic → Get started → choose the free Gemini Developer API, then try again.";
  if (/quota|429|RESOURCE_EXHAUSTED/i.test(m)) return "Mini Mi is out of free answers for the moment. Try again in a minute.";
  if (/network|Failed to fetch|offline/i.test(m)) return "No connection right now. Try again when you're online.";
  return "Mini Mi couldn't answer: " + m.slice(0, 160);
}
