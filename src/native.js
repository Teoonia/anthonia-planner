import { Capacitor, registerPlugin } from "@capacitor/core";

/* Bridge to the Android side (android/app/src/main/java/com/anthonia/planner).
   On the website these calls do nothing. */
export const isNative = Capacitor.isNativePlatform();
const Bridge = isNative ? registerPlugin("PlannerBridge") : null;

let timer = null, lastSent = "";
/* items: [{id,title,start,end,meta,kind}] with start/end as epoch ms */
export function syncSchedule(getItems) {
  if (!isNative) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const items = getItems();
    const json = JSON.stringify(items);
    if (json === lastSent) return;
    lastSent = json;
    try { await Bridge.scheduleDay({ items }); } catch (e) { console.warn("schedule failed", e); }
  }, 1200);
}

export async function alertStatus() {
  if (!isNative) return null;
  try { return await Bridge.status(); } catch { return null; }
}
export async function askNotifications() { if (isNative) await Bridge.requestNotifications(); }
export async function openPhoneSetting(which) { if (isNative) await Bridge.openSettings({ which }); }
export async function testAlert() { if (isNative) await Bridge.testAlert(); }
