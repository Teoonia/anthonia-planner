"""Adds the Mini Mi partner tab to index.html, app.js and style.css."""
root = '/home/claude/anthonia-planner/'

def patch(path, pairs):
    s = open(root + path).read()
    for a, b in pairs:
        assert s.count(a) == 1, (path, a[:70], s.count(a))
        s = s.replace(a, b)
    open(root + path, 'w').write(s)

patch('index.html', [
    ('      <a href="#plan-setup" data-v="plan-setup">Setup</a>',
     '      <a href="#partner" data-v="partner">Mini Mi</a>\n      <a href="#plan-setup" data-v="plan-setup">Setup</a>'),
    ('  <section id="v-plan-setup" class="view" hidden>', '''  <section id="v-partner" class="view" hidden>
    <div class="partner">
      <div class="panel chatbox">
        <div class="chat-head">
          <div class="avatar" aria-hidden="true">M</div>
          <div><h2 id="pName">Mini Mi</h2><span class="empty" id="pSub">Your accountability partner</span></div>
        </div>
        <div class="chat" id="chat" aria-live="polite"></div>
        <div class="quick" id="quick">
          <button data-q="tomorrow">Plan my tomorrow</button>
          <button data-q="week">Plan next week</button>
          <button data-q="check">How am I doing?</button>
          <button data-q="roast">Roast me</button>
        </div>
        <form id="chatForm" class="chat-form">
          <textarea id="chatIn" rows="1" placeholder="Gist with Mini Mi, or tell her what happened today" aria-label="Message Mini Mi"></textarea>
          <button class="primary" id="chatSend">Send</button>
        </form>
      </div>
      <details class="panel psettings">
        <summary><h2>Mini Mi's settings</h2></summary>
        <label for="p-name">Her name<input id="p-name" type="text"></label>
        <label for="p-banter">How she talks to you
          <select id="p-banter">
            <option value="gentle">Gentle: kind, light teasing</option>
            <option value="cheeky">Cheeky: teases like a close friend</option>
            <option value="savage">Savage: roasts you, then pushes you</option>
          </select>
        </label>
        <label for="p-about">What she knows about you<textarea id="p-about" rows="9"></textarea></label>
        <div class="row"><button class="primary" id="pSave">Save</button><button id="pClear" class="ghost">Clear today's chat</button><span class="empty" id="pMsg"></span></div>
      </details>
    </div>
  </section>

  <section id="v-plan-setup" class="view" hidden>'''),
])

patch('src/style.css', [
    ('/* ---------- app shell', '''/* ---------- Mini Mi ---------- */
.partner{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,340px);gap:18px;align-items:start}
@media (max-width:820px){.partner{grid-template-columns:1fr}}
.chatbox{gap:14px}
.chat-head{display:flex;gap:12px;align-items:center}
.avatar{width:44px;height:44px;border-radius:50%;background:var(--hero);color:#fff;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:20px;flex:none}
.chat{display:flex;flex-direction:column;gap:10px;max-height:min(60vh,560px);overflow-y:auto;padding:4px}
.msg{max-width:85%;padding:10px 14px;border-radius:16px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
.msg.me{align-self:flex-end;background:var(--accent);color:var(--bg);border-bottom-right-radius:4px}
.msg.her{align-self:flex-start;background:var(--accent-soft);color:var(--ink);border-bottom-left-radius:4px}
.msg.typing{opacity:.7;font-style:italic}
.sugs{align-self:flex-start;display:flex;flex-direction:column;gap:8px;width:min(100%,460px)}
.sug{border:1px solid var(--line);border-left:4px solid var(--gold);background:var(--surface);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:6px}
.sug .why{font-size:13px;color:var(--muted)}
.sug.added{border-left-color:var(--teal);opacity:.75}
.sug.no{opacity:.45}
.quick{display:flex;gap:6px;flex-wrap:wrap}
.quick button{font-size:13px;padding:6px 12px;border-radius:20px}
.chat-form{display:flex;gap:8px;align-items:flex-end}
.chat-form textarea{flex:1;resize:none;min-height:42px;max-height:140px}
.psettings{gap:12px}
.psettings summary{cursor:pointer;list-style:none}
.psettings summary::-webkit-details-marker{display:none}
.psettings label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:600}
.psettings textarea{font-weight:400;resize:vertical}

/* ---------- app shell'''),
])

patch('src/app.js', [
    ('import { isNative,', 'import { askPartner, systemPrompt, friendlyError } from "./partner.js";\nimport { isNative,'),
    ('function route(){const v=["today","board","plan-setup"]', 'function route(){const v=["today","board","partner","plan-setup"]'),
    ('function renderAll(){renderToday();renderBoard();renderSetup()}', 'function renderAll(){renderToday();renderBoard();renderSetup();renderPartner()}'),
    ('      if(t.tag){const s=document.createElement("span");s.className="chip gold";s.style.marginLeft="6px";s.textContent=t.tag;lab.append(s)}',
     '      if(t.tag){const s=document.createElement("span");s.className="chip gold";s.style.marginLeft="6px";s.textContent=t.tag;lab.append(s)}\n      else if(t.due){const s=document.createElement("span");s.className="chip";s.style.marginLeft="6px";s.textContent=new Date(t.due+"T00:00").toLocaleDateString("en-GB",{weekday:"short"});lab.append(s)}'),
    ('    db.doc("settings/main").onSnapshot(s=>{settings={...DEFAULT_SET,...(s.exists?s.data():{})};renderToday();renderSetup()},err)\n  ];',
     '    db.doc("settings/main").onSnapshot(s=>{settings={...DEFAULT_SET,...(s.exists?s.data():{})};renderToday();renderSetup();renderPartner()},err),\n    db.collection("chat").onSnapshot(s=>{chatDays=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));renderPartner()},err)\n  ];'),
    ("db=null;tasks=[];reviews={};", "db=null;chatDays={};tasks=[];reviews={};"),
])

# partner logic appended before the final route() call
s = open(root + 'src/app.js').read()
logic = r'''
/* ---------- Mini Mi ---------- */
let chatDays={}, chatBusy=false;
const DEFAULT_ABOUT=`Anthonia (Olawoore Anthonia B.), Nigerian, now living in Italy for a master's in Environmental Hazard and Disaster Risk Management at Università Politecnica delle Marche (UNIVPM).
Works remotely for African Group Nigeria (AGN) in Oyo Town and Ibadan: holds the HR desk and Head of Tech. AGN office hours are 9:00-17:00, Monday to Friday. Settling new staff, making sure their working terms are signed and they can work on their own. Sends monthly targets by the 3rd and checks weekly reports every Monday. Building the AGN company website (1-2 days a week).
Freelance UI/UX designer: promised CMAX (a land investment platform) design updates every Wednesday and Friday. Looking for and applying to online gigs, especially building websites for small businesses. Builds with AI tools rather than coding by hand.
CAPM certification is parked until next year.
Commutes about 45 minutes by bus from Falconara Marittima; reads 15 minutes of motivational books on the ride. Day runs 6:00-23:00 with an hour to get ready each morning.
Likes cheap rewards and trying new affordable things in Italy, movie nights, and a lively, fun style. Wants discipline: only 2 changes to her plan a day.
Long-term: operations management, building a lasting business of her own, and public speaking.`;
const partnerName=()=>(settings.partnerName||"Mini Mi").trim()||"Mini Mi";
const todayKey=()=>dkey(dayDate(0));
function allMessages(){
  return Object.keys(chatDays).sort().flatMap(k=>(chatDays[k].messages||[]).map((m,i)=>({...m,day:k,idx:i})));
}
function planContext(){
  const lines=[];
  const fmtBlocks=off=>planDay(dayDate(off)).blocks.filter(b=>b.kind!=="free"&&b.kind!=="break").map(b=>`  ${toHM(b.s)}-${toHM(b.e)} ${b.title}${b.done?" [done]":""}${b.kind==="class"?" [class]":""}`).join("\n");
  const tk=todayKey(), dd=days[tk]||{};
  lines.push(`Now: ${dayDate(0).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}, ${toHM(nowMin())}.`);
  lines.push(`Today's plan:\n${fmtBlocks(0)}`);
  lines.push(`Changes used today: ${changesUsed(tk)} of 2. Skipped today: ${(dd.skip||[]).length}.`);
  lines.push(`Tomorrow's plan:\n${fmtBlocks(1)}`);
  lines.push(`Win streak: ${$("#streakNum").textContent} days. ${$("#todayScore").textContent}`);
  const mon=mondayOf(new Date()), wk=isoWeek(mon);
  const byArea=AREAS.map(a=>{const it=tasks.filter(t=>t.week===wk&&t.area===a.id);return it.length?`  ${a.name}: `+it.map(t=>`${t.title} (${t.status==="done"?"done":"to do"})`).join("; "):`  ${a.name}: nothing yet`}).join("\n");
  lines.push(`This week's board (${wk}):\n${byArea}`);
  const nx=new Date(mon);nx.setDate(nx.getDate()+7);const nwk=isoWeek(nx);
  const nxt=tasks.filter(t=>t.week===nwk);if(nxt.length)lines.push(`Already on next week's board: ${nxt.map(t=>t.title).join("; ")}`);
  const lastRev=Object.keys(reviews).sort().pop();if(lastRev){const r=reviews[lastRev];lines.push(`Last Sunday review (${lastRev}): completed: ${r.wins||"-"}; stuck: ${r.stuck||"-"}; next week's top 3: ${r.next||"-"}`)}
  return lines.join("\n\n");
}
const QUICK={
  tomorrow:"Look at my day and tomorrow's plan. What should I follow up on tomorrow? Suggest tasks I can add.",
  week:"Plan my next week with me. What should I focus on and follow up across work, school, CMAX, gigs and life? Suggest tasks.",
  check:"Be honest: how am I doing today and this week?",
  roast:"Roast me about how I've used my time today. Then tell me the one thing I should do next."
};
async function sendToPartner(text){
  text=(text||"").trim();if(!text||chatBusy||!db)return;
  chatBusy=true;const tk=todayKey();
  const prev=allMessages().slice(-16).map(m=>({role:m.role==="me"?"user":"model",text:m.role==="me"?m.text:JSON.stringify({reply:m.text,suggestions:[]})}));
  const msgs=[...((chatDays[tk]||{}).messages||[]),{role:"me",text,ts:Date.now()}];
  chatDays[tk]={...(chatDays[tk]||{}),messages:msgs};renderPartner(true);
  await safe(db.collection("chat").doc(tk).set({date:tk,messages:msgs}),"save your message");
  try{
    const system=systemPrompt({name:partnerName(),banter:settings.partnerBanter||"cheeky",about:settings.partnerAbout||DEFAULT_ABOUT,context:planContext(),today:dayDate(0).toDateString()});
    const out=await askPartner({system,history:prev,message:text});
    const sugs=out.suggestions.filter(s=>s&&s.title).map(s=>({...s,state:"new"}));
    const all=[...msgs,{role:"her",text:out.reply,suggestions:sugs,ts:Date.now()}];
    chatDays[tk]={...chatDays[tk],messages:all};
    await safe(db.collection("chat").doc(tk).set({date:tk,messages:all}),"save her reply");
  }catch(e){
    const all=[...msgs,{role:"her",text:friendlyError(e),error:true,ts:Date.now()}];
    chatDays[tk]={...chatDays[tk],messages:all};renderPartner();
  }finally{chatBusy=false;renderPartner(true)}
}
function dueFor(when){
  const d=dayDate(0);
  if(when==="tomorrow")d.setDate(d.getDate()+1);
  if(when==="next week"){d.setDate(d.getDate()+(7-wd(d)));}
  return d;
}
async function acceptSuggestion(day,idx,si,accept){
  const doc=chatDays[day];if(!doc||!db)return;
  const messages=doc.messages.map(m=>({...m,suggestions:m.suggestions?m.suggestions.map(x=>({...x})):m.suggestions}));
  const s=messages[idx].suggestions[si];if(!s||s.state!=="new")return;
  s.state=accept?"added":"no";
  if(accept){
    const d=dueFor(s.when),task={area:AREAS.some(a=>a.id===s.area)?s.area:"life",title:s.title,week:isoWeek(mondayOf(d)),status:"todo",createdAt:Date.now(),from:"minimi"};
    if(s.when==="today"||s.when==="tomorrow")task.due=dkey(d);
    await safe(db.collection("tasks").add(task),"add the task");
  }
  chatDays[day]={...doc,messages};renderPartner();
  await safe(db.collection("chat").doc(day).set({...doc,messages}),"save that");
}
function renderPartner(scroll){
  if(!$("#chat"))return;
  const name=partnerName();
  $("#pName").textContent=name;document.querySelector('nav.tabs a[data-v="partner"]').textContent=name;
  $(".avatar").textContent=name[0].toUpperCase();
  $("#chatIn").placeholder=`Gist with ${name}, or tell her what happened today`;
  ["p-name","p-banter","p-about"].forEach(id=>{const el=$("#"+id);if(document.activeElement===el)return;
    el.value=id==="p-name"?name:id==="p-banter"?(settings.partnerBanter||"cheeky"):(settings.partnerAbout||DEFAULT_ABOUT)});
  const box=$("#chat"),atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<40;
  box.innerHTML="";
  const msgs=allMessages().slice(-40);
  if(!msgs.length){const m=document.createElement("div");m.className="msg her";m.textContent=`Hey Anthonia! I'm ${name}. I can see your whole plan, so no hiding. Tell me how today went, or tap "Plan my tomorrow" and I'll line things up for you.`;box.append(m)}
  msgs.forEach(m=>{
    const el=document.createElement("div");el.className="msg "+(m.role==="me"?"me":"her");el.textContent=m.text;box.append(el);
    if(m.suggestions&&m.suggestions.length){
      const wrap=document.createElement("div");wrap.className="sugs";
      m.suggestions.forEach((s,si)=>{
        const c=document.createElement("div");c.className="sug"+(s.state==="added"?" added":s.state==="no"?" no":"");
        const t=document.createElement("div");t.innerHTML=`<span class="chip">${(AREA_NAME[s.area]||s.area)}</span><span class="chip gold">${s.when}</span>`;
        const ti=document.createElement("strong");ti.textContent=s.title;t.append(document.createElement("br"),ti);
        const w=document.createElement("div");w.className="why";w.textContent=s.why||"";
        c.append(t,w);
        if(s.state==="new"){const r=document.createElement("div");r.className="row";
          const add=document.createElement("button");add.className="primary";add.textContent="Add to my board";add.onclick=()=>acceptSuggestion(m.day,m.idx,si,true);
          const no=btn("No thanks",()=>acceptSuggestion(m.day,m.idx,si,false),"Skip this suggestion");
          r.append(add,no);c.append(r)}
        else{const st=document.createElement("span");st.className="empty";st.textContent=s.state==="added"?"✓ Added to your board":"Skipped";c.append(st)}
        wrap.append(c)});
      box.append(wrap);
    }
  });
  if(chatBusy){const tdiv=document.createElement("div");tdiv.className="msg her typing";tdiv.textContent=`${name} is typing…`;box.append(tdiv)}
  if(scroll||atBottom)box.scrollTop=box.scrollHeight;
  $("#chatSend").disabled=chatBusy;document.querySelectorAll("#quick button").forEach(b=>b.disabled=chatBusy);
}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();const v=$("#chatIn").value;$("#chatIn").value="";sendToPartner(v)});
$("#chatIn").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("#chatForm").requestSubmit()}});
$("#chatIn").addEventListener("input",e=>{e.target.style.height="auto";e.target.style.height=Math.min(140,e.target.scrollHeight)+"px"});
document.querySelectorAll("#quick button").forEach(b=>b.onclick=()=>sendToPartner(QUICK[b.dataset.q]));
$("#pSave").onclick=async()=>{if(!needDb())return;
  const body={...settings,partnerName:$("#p-name").value.trim()||"Mini Mi",partnerBanter:$("#p-banter").value,partnerAbout:$("#p-about").value.trim()||DEFAULT_ABOUT};
  $("#pMsg").textContent="Saving…";try{await db.collection("settings").doc("main").set(body);$("#pMsg").textContent="Saved"}catch(e){$("#pMsg").textContent="Couldn't save: "+(e.message||e.code)}};
$("#pClear").onclick=async()=>{if(!needDb())return;const tk=todayKey();await safe(db.collection("chat").doc(tk).delete(),"clear the chat");delete chatDays[tk];renderPartner()};
'''
i = s.rindex('\nroute();\n')
s = s[:i] + logic + s[i:]
open(root + 'src/app.js', 'w').write(s)
print("ok")
