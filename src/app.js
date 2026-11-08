import "./style.css";
import seed from "./seed.json";
import { TIMETABLE } from "./timetable.js";
import { configured, watchUser, signIn, signUp, resetPassword, logOut, makeDb } from "./firebase.js";
import { askPartner, systemPrompt, friendlyError } from "./partner.js";
import { isNative, syncSchedule, alertStatus, askNotifications, openPhoneSetting, testAlert, setBubble } from "./native.js";


const AREAS=[
  {id:"gigs",name:"Online gigs",why:"Websites for small businesses: portfolio, profiles, proposals, clients."},
  {id:"staff",name:"AGN new staff",why:"Onboarding, working terms signed, each person working on their own."},
  {id:"targets",name:"Targets & reports",why:"Monthly targets out by the 3rd; weekly reports checked."},
  {id:"cmax",name:"CMAX UI/UX",why:"Design updates promised every Wednesday and Friday."},
  {id:"website",name:"AGN website",why:"Round it up: one to two days a week."},
  {id:"school",name:"Master's (UNIVPM)",why:"Lectures, readings, assignments, exams."},
  {id:"life",name:"Settling in Italy",why:"Paperwork, housing, banking, routines."}
];
const EXTRA_AREAS=[{id:"meal",name:"Meal"},{id:"rest",name:"Rest"},{id:"read",name:"Reading"},{id:"fun",name:"Fun"}];
const AREA_NAME=Object.fromEntries([...AREAS,...EXTRA_AREAS].map(a=>[a.id,a.name]));
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DEFAULT_SET={wake:"06:00",sleep:"23:00",short:10,long:20,after:90,commute:45,walkwait:25,early:15,afterclass:20};

let db=null, loaded=false;
let tasks=[], reviews={}, classes=[], routine=[], days={}, settings={...DEFAULT_SET};
let dayOffset=0, weekOffset=0;
const $=s=>document.querySelector(s);

/* ---------- time helpers ---------- */
const toMin=s=>{if(!s)return null;const[h,m]=s.split(":").map(Number);return h*60+m};
const toHM=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
const dkey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const nowMin=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
function dayDate(off){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+off);return d}
const wd=d=>(d.getDay()+6)%7;
function mondayOf(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-wd(x));return x}
function isoWeek(mon){const t=new Date(mon);t.setDate(t.getDate()+3);const y=t.getFullYear();const w=1+Math.round(((t-mondayOf(new Date(y,0,4)))/864e5)/7);return y+"-W"+String(w).padStart(2,"0")}
const fmt=d=>d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
function note(m){$("#note").textContent=m||"";$("#note").hidden=!m}
function needDb(){if(!db){note("You're signed out. Sign in to save changes.");return false}return true}
async function safe(p,what){try{await p}catch(e){note("Couldn't "+what+": "+(e.message||e.code))}}

/* ---------- the planner ---------- */
function planDay(date){
  const key=dkey(date), w=wd(date), dd=days[key]||{};
  const wake=toMin(settings.wake)||450, sleep=toMin(settings.sleep)||1350;
  const sb=+settings.short||0, lb=+settings.long||0, after=+settings.after||120;
  const fixed=[
    ...classes.filter(c=>+c.day===w&&(!c.from||key>=c.from)&&toMin(c.start)!=null&&toMin(c.end)>toMin(c.start)).map(c=>({id:"c-"+c.id,kind:c.kind==="meeting"?"meeting":"class",title:c.title,room:c.room,s:toMin(c.start),e:toMin(c.end)})),
    ...(dd.events||[]).map(e=>({id:e.id,kind:"event",title:e.title,s:toMin(e.start),e:toMin(e.start)+(+e.mins||30)}))
  ].sort((a,b)=>a.s-b.s);
  // train rides around the school day
  // the real trip: walk + wait for the bus, the ride, getting to class early; and the same going home
  const ride=+settings.commute||0, cls=fixed.filter(f=>f.kind==="class");
  const walkWait=settings.walkwait??25, early=settings.early??15, afterCls=settings.afterclass??20;
  if(ride&&cls.length){
    const first=Math.min(...cls.map(c=>c.s)), last=Math.max(...cls.map(c=>c.e));
    let t=first-early-ride-walkWait;
    if(walkWait)fixed.push({id:"go-walk",kind:"ride",title:"Leave home: walk to the stop and wait for the bus",meta:"Head out the door now",s:t,e:t+walkWait});
    t+=walkWait;
    fixed.push({id:"ride-to",kind:"ride",title:"Ride to school",meta:"Read 15 min, then quick tasks: send the team a good-morning message, check new gig posts, skim today's lecture notes",s:t,e:t+ride});
    t+=ride;
    if(early)fixed.push({id:"go-arrive",kind:"ride",title:"Walk to class and settle in",meta:"Find the room, get a seat, coffee if there's time",s:t,e:first});
    let h=last;
    if(afterCls)fixed.push({id:"home-after",kind:"ride",title:"After class: chat with friends, walk to the stop",s:h,e:h+afterCls});
    h+=afterCls;
    if(walkWait)fixed.push({id:"home-wait",kind:"ride",title:"Wait for the bus",s:h,e:h+walkWait});
    h+=walkWait;
    fixed.push({id:"ride-home",kind:"ride",title:"Ride home",meta:"Quick tasks: AGN messages, tick off today's board, pick tomorrow's top 3",s:h,e:h+ride});
    fixed.sort((a,b)=>a.s-b.s);
  }
  const done=new Set(dd.done||[]), skip=new Set(dd.skip||[]);
  let queue=routine.filter(r=>(r.days||[]).includes(w)).sort((a,b)=>(a.order||0)-(b.order||0)).map(r=>({id:r.id,title:r.title,area:r.area,mins:+r.mins||30,nb:toMin(r.notBefore),na:toMin(r.notAfter)}));
  const extra=(dd.extra||[]).map(x=>({...x,mins:+x.mins||30,carried:true}));
  queue.splice(Math.min(1,queue.length),0,...extra);
  if(dd.order&&dd.order.length){const pos=Object.fromEntries(dd.order.map((id,i)=>[id,i]));queue.sort((a,b)=>(pos[a.id]??999)-(pos[b.id]??999))}
  queue=queue.filter(q=>!skip.has(q.id));
  const from=dd.from!=null?Math.max(wake,dd.from):wake;
  const placed=[], over=[], doneItems=[];
  const isWork=a=>!["meal","rest","read","fun"].includes(a);
  // busy intervals: classes keep a short buffer after them for walking/settling
  const busy=fixed.map(f=>({s:f.s,e:f.e+(f.kind==="class"?sb:0)}));
  const free=(s,e)=>!busy.some(b=>s<b.e&&e>b.s);
  function earliest(start,m,endBy){
    const limit=Math.min(sleep,endBy??sleep);
    let t=start,guard=0;
    while(t+m<=limit&&guard++<500){
      const hit=busy.filter(b=>t<b.e&&t+m>b.s);
      if(!hit.length)return t;
      t=Math.max(...hit.map(b=>b.e));
    }
    return null;
  }
  // priority order = routine order; each block takes the earliest free slot at or after its "not before" time
  for(const q of queue){
    if(dd.from!=null&&done.has(q.id)){doneItems.push(q);continue}
    const t=earliest(Math.max(from,q.nb??0),q.mins,q.na);
    if(t==null){over.push(q);continue}
    placed.push({...q,kind:q.area==="meal"?"meal":"flex",s:t,e:t+q.mins,done:done.has(q.id)});
    busy.push({s:t,e:t+q.mins});
    if(isWork(q.area)){
      const br=q.mins>=after?lb:sb;
      if(br&&t+q.mins+br<=sleep&&free(t+q.mins,t+q.mins+br)){
        placed.push({kind:"break",title:br===lb&&lb>sb?"Longer break: stretch, water, step outside":"Short break",s:t+q.mins,e:t+q.mins+br});
        busy.push({s:t+q.mins,e:t+q.mins+br});
      }
    }
  }
  // classes also count toward streaks only visually; merge fixed + placed
  const all=[...fixed.filter(f=>f.e>wake&&f.s<sleep),...placed].sort((a,b)=>a.s-b.s||(a.kind==="class"?-1:1));
  // free gaps
  const out=[];let t=from;
  for(const b of all){if(b.s-t>=20)out.push({kind:"free",title:"Free time",s:t,e:b.s});out.push(b);t=Math.max(t,b.e)}
  if(sleep-t>=20)out.push({kind:"free",title:"Free time",s:t,e:sleep});
  return {blocks:out,over,doneItems,queue,key,dd};
}

function renderToday(){
  const date=dayDate(dayOffset), isToday=dayOffset===0;
  $("#dLabel").textContent=(isToday?"Today · ":"")+date.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"short"});
  $("#dToday").hidden=isToday;$("#btnRestart").hidden=!isToday;
  const {blocks,over,doneItems,queue,key,dd}=planDay(date);
  const tl=$("#timeline");tl.innerHTML="";
  if(!loaded){tl.innerHTML='<p class="empty">Loading your plan…</p>'}
  else if(!blocks.some(b=>b.kind!=="free")){tl.innerHTML='<div class="panel"><h2>No plan for this day yet</h2><p class="empty" style="margin:0">Add your classes and routine in <a href="#plan-setup">Setup</a> and the day fills itself in.</p></div>'}
  const now=nowMin();let nowDrawn=!isToday;
  const flexIds=queue.map(q=>q.id);
  blocks.forEach(b=>{
    if(!nowDrawn&&b.s>now){const n=document.createElement("div");n.className="nowline";n.textContent="now "+toHM(now);tl.append(n);nowDrawn=true}
    const el=document.createElement("div");
    el.className="blk "+b.kind+(b.done?" isdone":"")+(isToday&&b.s<=now&&b.e>now&&b.kind!=="free"?" now":"");
    const tm=document.createElement("div");tm.className="tm";tm.textContent=toHM(b.s)+"\n";tm.style.whiteSpace="pre-line";tm.textContent=toHM(b.s)+"–\n"+toHM(b.e);
    const ti=document.createElement("div");ti.className="ti";
    if(b.kind==="class"){const c=document.createElement("span");c.className="chip gold";c.textContent="Class";ti.append(c)}
    else if(b.kind==="event"){const c=document.createElement("span");c.className="chip gold";c.textContent="Came up";ti.append(c)}
    else if(b.kind==="meeting"){const c=document.createElement("span");c.className="chip gold";c.textContent="Meeting";ti.append(c)}
    else if(b.kind==="ride"){const c=document.createElement("span");c.className="chip";c.textContent="On the way";ti.append(c)}
    else if(b.kind==="flex"||b.kind==="meal"){const c=document.createElement("span");c.className="chip";c.textContent=AREA_NAME[b.area]||b.area;ti.append(c)}
    ti.append(document.createTextNode(b.title));
    if(b.room||b.carried||b.meta){const m=document.createElement("span");m.className="meta";m.textContent=b.meta||(b.room?("Room "+b.room):"Carried over from yesterday");ti.append(m)}
    const ctl=document.createElement("div");ctl.className="ctl";
    if(b.kind==="flex"||b.kind==="meal"){
      ctl.append(btn(b.done?"Undo":"✓ Done",()=>toggleDone(key,b.id),b.done?"Mark not done":"Mark done"));
      const i=flexIds.indexOf(b.id);
      const locked=changesLeft(key)<=0||b.done;
      [btn("↑",()=>move(key,flexIds,i,-1),"Move earlier"),btn("↓",()=>move(key,flexIds,i,1),"Move later"),btn("Skip",()=>skipIt(key,b.id),"Skip for today"),btn("Tomorrow",()=>toTomorrow(key,b),"Move to tomorrow")].forEach(x=>{x.disabled=locked;ctl.append(x)});
    }
    if(b.kind==="event")ctl.append(btn("Remove",()=>removeEvent(key,b.id),"Remove this event"));
    el.append(tm,ti,ctl);tl.append(el);
  });
  const ov=$("#overflow");ov.innerHTML="";
  if(!over.length)ov.innerHTML='<li class="empty">Everything fits.</li>';
  over.forEach(q=>{const li=document.createElement("li");const s=document.createElement("span");s.textContent=q.title+" · "+q.mins+" min";li.append(s,btn("Tomorrow",()=>toTomorrow(key,q,true),"Move to tomorrow"));ov.append(li)});
  const dl=$("#doneList");dl.innerHTML="";
  const doneNames=[...doneItems,...blocks.filter(b=>b.done)];
  if(!doneNames.length)dl.innerHTML='<li class="empty">Tick blocks as you finish them.</li>';
  doneNames.forEach(q=>{const li=document.createElement("li");const s=document.createElement("span");s.textContent="✓ "+q.title;li.append(s,btn("Undo",()=>toggleDone(key,q.id),"Mark not done"));dl.append(li)});
  // skipped
  renderStreak();
  syncSchedule(phoneItems);
  const cl=changesLeft(key);$("#chgLeft").textContent=cl?cl+(cl===1?" change":" changes")+" left today":"No changes left today";$("#chgLeft").className="chgleft"+(cl?"":" out");
  if((dd.skip||[]).length){const li=document.createElement("li");li.className="empty";li.append(document.createTextNode((dd.skip||[]).length+" skipped today "),btn("Bring back",()=>writeDay(key,{skip:[]}),"Restore skipped blocks"));dl.append(li)}
}
const START=new Date(2026,10,3);
const MILESTONES=[
  {d:1,name:"First win",reward:"Try a pastry you've never had at a local bar"},
  {d:3,name:"Warm-up",reward:"A gelato in a flavour you've never tried"},
  {d:5,name:"Rhythm",reward:"Cook one new Italian dish at home"},
  {d:7,name:"One full week",reward:"Pizza al taglio or street food somewhere new"},
  {d:10,name:"Steady",reward:"Walk a part of the city you haven't seen"},
  {d:14,name:"Two strong weeks",reward:"Cheap regional train to a nearby seaside town"},
  {d:21,name:"Three weeks",reward:"Coffee and a new book or magazine at a café"},
  {d:30,name:"Month of wins",reward:"A museum or gallery visit, or a small treat for your room"},
  {d:45,name:"Unstoppable",reward:"Day trip to a hill town by regional train"},
  {d:60,name:"Two months",reward:"Pick a bigger treat yourself — you've earned it"}
];
function dayScore(date){
  if(date<START)return null;
  const p=planDay(date),isW=a=>!["meal","rest","read","fun"].includes(a);
  const work=p.blocks.filter(b=>b.kind==="flex"&&isW(b.area)),pre=p.doneItems.filter(q=>isW(q.area));
  const total=work.length+pre.length;if(!total)return null;
  return (work.filter(b=>b.done).length+pre.length)/total;
}
function renderStreak(){
  const today=dayDate(0),ts=dayScore(today);let n=0;
  if(ts!=null&&ts>=.8)n++;
  for(let i=1;i<120;i++){const d=dayDate(-i);if(d<START)break;const s=dayScore(d);if(s==null)continue;if(s>=.8)n++;else break}
  $("#streakNum").textContent=n;$("#streakTxt").textContent=n===1?"day in a row":"days in a row";
  const pct=ts==null?0:Math.round(ts*100);$("#todayBar").style.width=pct+"%";
  $("#todayScore").textContent=ts==null?"No work blocks planned today.":(pct>=80?"Today is a win. "+pct+"% done.":pct+"% of today's work done. 80% wins the day.");
  const ul=$("#milestones");ul.innerHTML="";
  MILESTONES.forEach(m=>{const li=document.createElement("li");const s=document.createElement("span");const hit=n>=m.d;
    s.innerHTML=`<span class="chip${hit?"":" gold"}">${hit?"Unlocked":m.d+(m.d===1?" day":" days")}</span>`;s.append(document.createTextNode(m.name+": "+m.reward));if(hit)s.style.color="var(--accent)";li.append(s);ul.append(li)});
}
function btn(label,fn,aria){const b=document.createElement("button");b.className="ghost";b.textContent=label;if(aria)b.setAttribute("aria-label",aria);b.onclick=fn;return b}

async function writeDay(key,patch){
  if(!needDb())return;
  const cur=days[key]||{};const body={...cur,...patch,date:key,updatedAt:Date.now()};
  days[key]=body;renderToday();
  await safe(db.collection("days").doc(key).set(body),"save the change");
}
function toggleDone(key,id){const d=new Set((days[key]||{}).done||[]);d.has(id)?d.delete(id):d.add(id);writeDay(key,{done:[...d]})}
const MAX_CHANGES=2;
const changesUsed=key=>(days[key]||{}).changes||0;
const changesLeft=key=>Math.max(0,MAX_CHANGES-changesUsed(key));
function useChange(key){if(changesLeft(key)<=0){note("You've used both of today's changes. The plan stays as it is. You've got this.");return false}return true}
function skipIt(key,id,free){if(!free&&!useChange(key))return;const s=new Set((days[key]||{}).skip||[]);s.add(id);writeDay(key,{skip:[...s],changes:changesUsed(key)+(free?0:1)})}
function move(key,ids,i,dir){const j=i+dir;if(j<0||j>=ids.length)return;if(!useChange(key))return;const o=[...ids];[o[i],o[j]]=[o[j],o[i]];writeDay(key,{order:o,changes:changesUsed(key)+1})}
async function toTomorrow(key,q,free){
  if(!needDb())return;
  if(!free&&!useChange(key))return;
  const d=new Date(key+"T00:00");d.setDate(d.getDate()+1);const tk=dkey(d);
  const t=days[tk]||{};const extra=[...(t.extra||[]),{id:"x"+Date.now().toString(36),title:q.title,area:q.area,mins:q.mins}];
  const tb={...t,extra,date:tk,updatedAt:Date.now()};days[tk]=tb;
  await safe(db.collection("days").doc(tk).set(tb),"move it to tomorrow");
  skipIt(key,q.id,free);
}
function removeEvent(key,id){writeDay(key,{events:((days[key]||{}).events||[]).filter(e=>e.id!==id)})}
$("#btnRestart").onclick=()=>{const k=dkey(dayDate(0));const n=nowMin();writeDay(k,{from:Math.ceil(n/5)*5})};
$("#btnCame").onclick=()=>{const n=nowMin();$("#c-start").value=toHM(dayOffset===0?Math.ceil(n/5)*5:600);$("#c-title").value="";$("#dlgCame").showModal()};
$("#dlgCame").addEventListener("close",()=>{
  if($("#dlgCame").returnValue!=="ok")return;
  const key=dkey(dayDate(dayOffset));const ev={id:"e"+Date.now().toString(36),title:$("#c-title").value.trim()||"Something came up",start:$("#c-start").value,mins:+$("#c-mins").value||60};
  writeDay(key,{events:[...((days[key]||{}).events||[]),ev]});
});
$("#dPrev").onclick=()=>{dayOffset--;renderToday()};
$("#dNext").onclick=()=>{dayOffset++;renderToday()};
$("#dToday").onclick=()=>{dayOffset=0;renderToday()};

/* ---------- week board ---------- */
function rituals(mon){
  const wk=isoWeek(mon),out=[{key:"reports",area:"targets",title:"Check last week's reports",tag:"Monday"},
    {key:"cmax-wed",area:"cmax",title:"Send CMAX design update",tag:"Wednesday"},
    {key:"cmax-fri",area:"cmax",title:"Send CMAX design update",tag:"Friday"}];
  for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(d.getDate()+i);
    if(d.getDate()<=3){out.unshift({key:"targets-"+d.getFullYear()+"-"+(d.getMonth()+1),area:"targets",title:"Send "+d.toLocaleDateString("en-GB",{month:"long"})+" targets to all teams",tag:"Due by 3 "+d.toLocaleDateString("en-GB",{month:"short"})});break}}
  return out.map(r=>({...r,id:"ritual-"+wk+"-"+r.key,week:wk,ritual:true}));
}
function renderBoard(){
  const mon=mondayOf(new Date());mon.setDate(mon.getDate()+weekOffset*7);const sun=new Date(mon);sun.setDate(sun.getDate()+6);
  const wk=isoWeek(mon);
  $("#wLabel").textContent=wk.replace("-W"," · week ")+" · "+fmt(mon)+" – "+fmt(sun);$("#wToday").hidden=weekOffset===0;
  const byId=Object.fromEntries(tasks.map(t=>[t.id,t]));
  const all=[...rituals(mon).map(r=>({...r,status:byId[r.id]?.status||"todo"})),...tasks.filter(t=>t.week===wk&&!t.ritual)];
  $("#strip").innerHTML="";
  AREAS.forEach(a=>{const it=all.filter(t=>t.area===a.id),dn=it.filter(t=>t.status==="done").length;
    const el=document.createElement("div");el.className="stat";el.innerHTML=`<span class="name"></span><span class="num">${dn}/${it.length}</span><div class="bar"><i style="width:${it.length?Math.round(dn/it.length*100):0}%"></i></div>`;
    el.querySelector(".name").textContent=a.name;$("#strip").append(el)});
  const lanes=$("#lanes");lanes.innerHTML="";
  AREAS.forEach(a=>{
    const it=all.filter(t=>t.area===a.id).sort((x,y)=>(x.ritual?0:1)-(y.ritual?0:1)||(x.createdAt||0)-(y.createdAt||0));
    const dn=it.filter(t=>t.status==="done").length;
    const lane=document.createElement("article");lane.className="panel lane";
    lane.innerHTML=`<h2><span></span><span class="count">${dn} of ${it.length} done</span></h2><p class="why"></p><ul class="tasks"></ul><form class="add"><input id="add-${a.id}" placeholder="Add a task for this week" aria-label="Add a task to ${a.name}"><button>Add</button></form>`;
    lane.querySelector("h2 span").textContent=a.name;lane.querySelector(".why").textContent=a.why;
    const ul=lane.querySelector("ul");
    if(!it.length){const e=document.createElement("li");e.className="empty";e.textContent=loaded?"Nothing planned yet. Add the first task below.":"Loading…";ul.append(e)}
    it.forEach(t=>{const li=document.createElement("li");li.className=t.status==="done"?"is-done":"";
      const cb=document.createElement("input");cb.type="checkbox";cb.id="cb-"+t.id;cb.checked=t.status==="done";cb.onchange=()=>toggleTask(t,cb.checked);
      const lab=document.createElement("label");lab.className="t";lab.htmlFor=cb.id;lab.textContent=t.title;
      if(t.tag){const s=document.createElement("span");s.className="chip gold";s.style.marginLeft="6px";s.textContent=t.tag;lab.append(s)}
      else if(t.due){const s=document.createElement("span");s.className="chip";s.style.marginLeft="6px";s.textContent=new Date(t.due+"T00:00").toLocaleDateString("en-GB",{weekday:"short"});lab.append(s)}
      li.append(cb,lab);if(!t.ritual)li.append(btn("×",()=>needDb()&&safe(db.collection("tasks").doc(t.id).delete(),"remove it"),"Remove "+t.title));ul.append(li)});
    lane.querySelector("form").onsubmit=e=>{e.preventDefault();const inp=lane.querySelector("input"),v=inp.value.trim();if(v&&needDb()){safe(db.collection("tasks").add({area:a.id,title:v,week:wk,status:"todo",createdAt:Date.now()}),"add the task");inp.value=""}};
    lanes.append(lane)});
  const p=document.createElement("article");p.className="panel lane parked";p.innerHTML='<h2><span>CAPM</span><span class="count">parked</span></h2><p class="why">Parked until next year, so the rest can settle first.</p>';lanes.append(p);
  const rv=reviews[wk]||{};
  ["wins","stuck","next"].forEach(k=>{const el=$("#rv-"+k),sig=wk+(rv.updatedAt||"");if(document.activeElement!==el&&el.dataset.sig!==sig){el.value=rv[k]||"";el.dataset.sig=sig}});
}
function toggleTask(t,checked){if(!needDb())return renderBoard();const b={area:t.area,title:t.title,week:t.week,status:checked?"done":"todo",doneAt:checked?Date.now():null,createdAt:t.createdAt||Date.now()};if(t.ritual)b.ritual=true;safe(db.collection("tasks").doc(t.id).set(b),"save that")}
$("#saveReview").onclick=async()=>{if(!needDb())return;const mon=mondayOf(new Date());mon.setDate(mon.getDate()+weekOffset*7);const wk=isoWeek(mon);
  $("#revStatus").textContent="Saving…";try{await db.collection("reviews").doc(wk).set({week:wk,wins:$("#rv-wins").value,stuck:$("#rv-stuck").value,next:$("#rv-next").value,updatedAt:Date.now()});$("#revStatus").textContent="Saved"}catch(e){$("#revStatus").textContent="Couldn't save: "+(e.message||e.code)}};
$("#wPrev").onclick=()=>{weekOffset--;renderBoard()};$("#wNext").onclick=()=>{weekOffset++;renderBoard()};$("#wToday").onclick=()=>{weekOffset=0;renderBoard()};

/* ---------- setup ---------- */
function areaSelect(val,id){const s=document.createElement("select");s.id=id;[...AREAS,...EXTRA_AREAS].forEach(a=>{const o=document.createElement("option");o.value=a.id;o.textContent=a.name;if(a.id===val)o.selected=true;s.append(o)});return s}
function inp(type,val,id,cls){const i=document.createElement("input");i.type=type;i.value=val??"";i.id=id;if(cls)i.className=cls;return i}
function td(...kids){const t=document.createElement("td");kids.forEach(k=>t.append(k));return t}
let saveTimers={};
function saveLater(col,id,body){if(!needDb())return;clearTimeout(saveTimers[col+id]);saveTimers[col+id]=setTimeout(()=>safe(db.collection(col).doc(id).set(body),"save"),600)}
function renderSetup(){
  const cr=$("#classRows");if(!cr.contains(document.activeElement)){cr.innerHTML="";
    if(!classes.length)cr.innerHTML='<tr><td colspan="6" class="empty">No classes yet. Add each course from your timetable.</td></tr>';
    [...classes].sort((a,b)=>(+a.day-+b.day)||String(a.start).localeCompare(b.start)).forEach(c=>{
      const tr=document.createElement("tr");
      const t=inp("text",c.title,"ct-"+c.id),r=inp("text",c.room,"cr-"+c.id),s=inp("time",c.start,"cs-"+c.id),e=inp("time",c.end,"ce-"+c.id);
      const d=document.createElement("select");d.id="cd-"+c.id;DAYS.forEach((n,i)=>{const o=document.createElement("option");o.value=i;o.textContent=n;if(+c.day===i)o.selected=true;d.append(o)});
      const save=()=>{const b={title:t.value,day:+d.value,start:s.value,end:e.value,room:r.value};Object.assign(c,b);saveLater("classes",c.id,b)};
      [t,r,s,e,d].forEach(x=>x.addEventListener("input",save));
      tr.append(td(t),td(d),td(s),td(e),td(r),td(btn("Delete",()=>needDb()&&safe(db.collection("classes").doc(c.id).delete(),"delete it"),"Delete class")));cr.append(tr)})}
  const rr=$("#routineRows");if(!rr.contains(document.activeElement)){rr.innerHTML="";
    const sorted=[...routine].sort((a,b)=>(a.order||0)-(b.order||0));
    if(!sorted.length)rr.innerHTML='<tr><td colspan="7" class="empty">No routine blocks yet.</td></tr>';
    sorted.forEach((r,i)=>{
      const tr=document.createElement("tr");
      const t=inp("text",r.title,"rt-"+r.id),a=areaSelect(r.area,"ra-"+r.id),m=inp("number",r.mins,"rm-"+r.id,"n"),nb=inp("time",r.notBefore,"rn-"+r.id),na=inp("time",r.notAfter,"rx-"+r.id);
      const dw=document.createElement("div");dw.className="days";
      const boxes=DAYS.map((n,k)=>{const l=document.createElement("label");const c=document.createElement("input");c.type="checkbox";c.id="rd-"+r.id+"-"+k;c.checked=(r.days||[]).includes(k);l.append(c,document.createTextNode(n[0]));dw.append(l);return c});
      const save=()=>{const b={title:t.value,area:a.value,mins:+m.value||30,notBefore:nb.value,notAfter:na.value,days:boxes.map((c,k)=>c.checked?k:-1).filter(k=>k>=0),order:r.order||0};Object.assign(r,b);saveLater("routine",r.id,b)};
      [t,a,m,nb,na,...boxes].forEach(x=>x.addEventListener("input",save));
      const up=btn("↑",()=>swapOrder(sorted,i,-1),"Move up"),dn=btn("↓",()=>swapOrder(sorted,i,1),"Move down");
      tr.append(td(up,dn),td(t),td(a),td(m),td(nb),td(na),td(dw),td(btn("Delete",()=>needDb()&&safe(db.collection("routine").doc(r.id).delete(),"delete it"),"Delete block")));rr.append(tr)})}
  ["wake","sleep","short","long","after","commute","walkwait","early","afterclass"].forEach(k=>{const el=$("#s-"+k);if(document.activeElement!==el)el.value=settings[k]??DEFAULT_SET[k]});
}
async function swapOrder(sorted,i,dir){const j=i+dir;if(j<0||j>=sorted.length||!needDb())return;const a=sorted[i],b=sorted[j];const oa=a.order||i,ob=b.order||j;
  await safe(db.collection("routine").doc(a.id).update({order:ob===oa?oa+dir:ob}),"reorder");await safe(db.collection("routine").doc(b.id).update({order:oa}),"reorder")}
$("#addClass").onclick=()=>needDb()&&safe(db.collection("classes").add({title:"New course",day:0,start:"09:00",end:"11:00",room:""}),"add a class");
$("#addRoutine").onclick=()=>needDb()&&safe(db.collection("routine").add({title:"New block",area:"school",mins:60,notBefore:"",days:[0,1,2,3,4],order:(Math.max(0,...routine.map(r=>r.order||0))+10)}),"add a block");
$("#saveSettings").onclick=async()=>{if(!needDb())return;const b={wake:$("#s-wake").value||DEFAULT_SET.wake,sleep:$("#s-sleep").value||DEFAULT_SET.sleep,short:+$("#s-short").value,long:+$("#s-long").value,after:+$("#s-after").value||120,commute:+$("#s-commute").value||0,walkwait:+$("#s-walkwait").value||0,early:+$("#s-early").value||0,afterclass:+$("#s-afterclass").value||0};
  $("#setStatus").textContent="Saving…";try{await db.collection("settings").doc("main").set({...settings,...b});$("#setStatus").textContent="Saved"}catch(e){$("#setStatus").textContent="Couldn't save: "+(e.message||e.code)}};

/* ---------- routing + data ---------- */
function route(){const v=["today","board","partner","plan-setup"].includes(location.hash.slice(1))?location.hash.slice(1):"today";
  document.querySelectorAll(".view").forEach(s=>s.hidden=s.id!=="v-"+v);
  document.querySelectorAll("nav.tabs a").forEach(a=>a.toggleAttribute("aria-current",a.dataset.v===v)||a.removeAttribute("aria-current"));
  document.querySelectorAll("nav.tabs a").forEach(a=>{if(a.dataset.v===v)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  renderAll()}
function renderAll(){renderToday();renderBoard();renderSetup();renderPartner()}
window.addEventListener("hashchange",route);
setInterval(()=>{if(dayOffset===0&&!$("#v-today").hidden)renderToday();checkAlert()},30000);
/* full-screen nudge when a new block starts; shrinks to a corner pill */
let lastAlert=null;try{lastAlert=localStorage.getItem("lastAlert")}catch(e){}
function nowAndNext(){
  const p=planDay(dayDate(0)),n=nowMin(),real=p.blocks.filter(b=>b.kind!=="free"&&b.kind!=="break");
  const cur=real.find(b=>b.s<=n&&b.e>n)||null;
  const next=real.filter(b=>b.s>n&&!b.done).slice(0,3);
  return {cur,next};
}
function showTakeover(cur,next){
  const b=cur||next[0];if(!b)return;
  $("#toWhen").textContent=cur?"Starting now":"Coming up";
  $("#toTitle").textContent=b.title;$("#toTime").textContent=toHM(b.s)+" – "+toHM(b.e)+(b.meta?" · "+b.meta:"");
  const ol=$("#toNext");ol.innerHTML="";(cur?next:next.slice(1)).forEach(x=>{const li=document.createElement("li");li.textContent=toHM(x.s)+"  "+x.title;ol.append(li)});
  $("#takeover").hidden=false;$("#pill").hidden=true;$("#toClose").focus();
}
function updatePill(cur,next){
  if(!$("#takeover").hidden)return;
  const parts=[];if(cur)parts.push("Now: "+cur.title);if(next[0])parts.push("Next "+toHM(next[0].s)+": "+next[0].title);
  $("#pillTxt").textContent=parts.join(" · ");$("#pill").hidden=!parts.length;
}
function checkAlert(){
  if(!loaded||isNative)return;
  const {cur,next}=nowAndNext();
  const k=cur?dkey(dayDate(0))+"|"+cur.s+"|"+cur.title:null;
  if(k&&k!==lastAlert){
    lastAlert=k;try{localStorage.setItem("lastAlert",k)}catch(e){}
    systemNotify(cur,next);
    if(document.visibilityState==="visible")showTakeover(cur,next);
  }
  updatePill(cur,next);
}
/* laptop notifications (Windows/Mac corner pop-ups) while the app is running */
const canNotify=()=>!isNative&&"Notification" in window;
async function systemNotify(cur,next){
  if(!canNotify()||Notification.permission!=="granted")return;
  const body=toHM(cur.s)+" – "+toHM(cur.e)+(cur.meta?"\n"+cur.meta:"")+(next.length?"\nNext: "+next.map(x=>toHM(x.s)+" "+x.title).join(" · "):"");
  const opts={body,tag:"weekly-board-block",renotify:true,requireInteraction:true,icon:"/icon-192.png",badge:"/icon-192.png"};
  try{const reg=await navigator.serviceWorker?.getRegistration();if(reg){await reg.showNotification(cur.title,opts);return}}catch(e){}
  try{new Notification(cur.title,opts)}catch(e){}
}
function renderLaptop(){
  if(!canNotify())return;
  $("#laptopPanel").hidden=false;
  const p=Notification.permission;
  $("#laptopState").textContent=p==="granted"?"✓ Notifications are on":p==="denied"?"Notifications are blocked. Allow them in the browser's site settings (the icon left of the address).":"○ Notifications are off";
  $("#laptopOn").hidden=p!=="default";$("#laptopTest").hidden=p!=="granted";
}
$("#laptopOn").onclick=async()=>{try{await Notification.requestPermission()}catch(e){}renderLaptop()};
$("#laptopTest").onclick=()=>{const n=nowMin();systemNotify({title:"This is how your alerts will look",s:n,e:n+30,meta:""},[])};
renderLaptop();
$("#toClose").onclick=()=>{$("#takeover").hidden=true;const {cur,next}=nowAndNext();updatePill(cur,next)};
$("#pill").onclick=()=>{const {cur,next}=nowAndNext();showTakeover(cur,next)};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#takeover").hidden)$("#toClose").click()});
document.addEventListener("visibilitychange",checkAlert);
let unsubs=[];
function startData(store){
  stopData();
  db=store;loaded=false;renderAll();
  const timer=setTimeout(()=>note("Your plan can't be reached yet. Check your connection."),10000);
  const ok=s=>{if(!s.metadata.fromCache){clearTimeout(timer);if($("#note").textContent.startsWith("Your plan can't"))note("")}};
  const err=e=>{clearTimeout(timer);loaded=true;note("Couldn't load part of your plan ("+e.code+").");renderAll()};
  const docs=s=>s.docs.map(d=>({id:d.id,...d.data()}));
  let gotClasses=false,gotRoutine=false,gotSettings=false,gotDays=false,applying=false;
  const maybeSeed=()=>{if(gotClasses&&gotRoutine)$("#seedPanel").hidden=!(classes.length===0&&routine.length===0);maybeTimetable()};
  /* swap in a newer class timetable once (see timetable.js) */
  const maybeTimetable=async()=>{
    if(applying||!gotClasses||!gotRoutine||!gotSettings||!gotDays||!routine.length)return;
    if((settings.timetableVersion||"")>=TIMETABLE.version)return;
    applying=true;
    try{
      for(const c of classes)if(!TIMETABLE.classes[c.id])await db.collection("classes").doc(c.id).delete();
      for(const [id,c] of Object.entries(TIMETABLE.classes))await db.collection("classes").doc(id).set(c);
      for(const [id,patch] of Object.entries(TIMETABLE.routine||{})){const r=routine.find(x=>x.id===id);if(r){const{id:_,...rest}=r;await db.collection("routine").doc(id).set({...rest,...patch})}}
      for(const [k,patch] of Object.entries(TIMETABLE.days||{}))await db.collection("days").doc(k).set({...(days[k]||{}),date:k,...patch});
      await db.collection("settings").doc("main").set({...settings,timetableVersion:TIMETABLE.version});
      note("Your timetable is updated: classes for the "+TIMETABLE.label+", calls kept to 9:00-17:00, and Sunday's meeting with Ms Mercy (she now runs the monthly staff meeting).");
    }catch(e){applying=false;note("Couldn't update your timetable: "+(e.message||e.code))}
  };
  unsubs=[
    db.collection("tasks").onSnapshot(s=>{tasks=docs(s);loaded=true;ok(s);renderBoard()},err),
    db.collection("reviews").onSnapshot(s=>{reviews=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));renderBoard()},err),
    db.collection("classes").onSnapshot(s=>{classes=docs(s);loaded=true;ok(s);if(!s.metadata.fromCache)gotClasses=true;maybeSeed();renderToday();renderSetup()},err),
    db.collection("routine").onSnapshot(s=>{routine=docs(s);loaded=true;if(!s.metadata.fromCache)gotRoutine=true;maybeSeed();renderToday();renderSetup();checkAlert()},err),
    db.collection("days").onSnapshot(s=>{days=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));if(!s.metadata.fromCache)gotDays=true;maybeTimetable();renderToday()},err),
    db.doc("settings/main").onSnapshot(s=>{settings={...DEFAULT_SET,...(s.exists?s.data():{})};if(!s.metadata.fromCache)gotSettings=true;maybeTimetable();renderToday();renderSetup();renderPartner()},err),
    db.collection("chat").onSnapshot(s=>{chatDays=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));renderPartner()},err)
  ];
}
function stopData(){unsubs.forEach(u=>{try{u()}catch(e){}});unsubs=[];db=null;chatDays={};tasks=[];reviews={};classes=[];routine=[];days={};settings={...DEFAULT_SET};}

/* blocks for today and tomorrow, as real timestamps, for the phone's alarms and widget */
function phoneItems(){
  const out=[];
  for(const off of [0,1]){
    const base=dayDate(off).getTime();
    planDay(dayDate(off)).blocks.filter(b=>b.kind!=="free"&&b.kind!=="break"&&!b.done).forEach(b=>{
      const s=new Date(base);s.setHours(0,b.s,0,0);const e=new Date(base);e.setHours(0,b.e,0,0);
      out.push({id:(b.id||b.kind+"-"+b.s)+"@"+off,title:b.title,start:s.getTime(),end:e.getTime(),meta:b.meta||(b.room?"Room "+b.room:""),kind:b.kind});
    });
  }
  return out.sort((a,b)=>a.start-b.start);
}

/* ---------- sign-in ---------- */
const authMsg=m=>{$("#a-msg").textContent=m||""};
const nice=e=>({"auth/invalid-credential":"That email and password don't match.","auth/email-already-in-use":"That email already has an account. Sign in instead.","auth/weak-password":"Use at least 6 characters.","auth/invalid-email":"That email doesn't look right.","auth/network-request-failed":"No connection. Try again when you're online."})[e.code]||e.message;
$("#authForm").addEventListener("submit",async e=>{e.preventDefault();authMsg("Signing in…");try{await signIn($("#a-email").value.trim(),$("#a-pw").value)}catch(err){authMsg(nice(err))}});
$("#a-up").onclick=async()=>{if(!$("#authForm").reportValidity())return;authMsg("Creating your account…");try{await signUp($("#a-email").value.trim(),$("#a-pw").value)}catch(err){authMsg(nice(err))}};
$("#a-reset").onclick=async()=>{const em=$("#a-email").value.trim();if(!em){authMsg("Type your email first.");return}try{await resetPassword(em);authMsg("Check your inbox for a reset link.")}catch(err){authMsg(nice(err))}};
$("#signOutBtn").onclick=()=>logOut();
$("#seedBtn").onclick=async()=>{if(!db)return;$("#seedBtn").disabled=true;$("#seedMsg").textContent="Loading…";
  try{await db.importSeed(seed);$("#seedMsg").textContent="Done";$("#seedPanel").hidden=true}catch(e){$("#seedBtn").disabled=false;$("#seedMsg").textContent="Couldn't load it: "+(e.message||e.code)}};

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}))}
if(!configured){$("#setupScreen").hidden=false}
else watchUser(user=>{
  $("#authScreen").hidden=!!user;$("#appWrap").hidden=!user;
  if(user){$("#whoami").textContent="Signed in as "+(user.email||"you");startData(makeDb(user.uid));renderPhone()}
  else{stopData();authMsg("")}
});

/* ---------- phone alert permissions (Android app only) ---------- */
async function renderPhone(){
  if(!isNative)return;
  $("#phonePanel").hidden=false;
  const st=await alertStatus()||{};
  const rows=[
    ["notifications","Notifications",()=>askNotifications().then(renderPhone)],
    ["exact","Alerts on the exact minute",()=>openPhoneSetting("exact")],
    ["fullScreen","Full-screen alerts when the phone is locked",()=>openPhoneSetting("fullScreen")],
    ["overlay","Full-screen alerts while you're using the phone",()=>openPhoneSetting("overlay")],
    ["battery","Unrestricted battery (Samsung)",()=>openPhoneSetting("battery")],
    ["bubble","Floating ball on screen (shows now and next over any app)",()=>setBubble(true).then(()=>setTimeout(renderPhone,800))]
  ];
  const ul=$("#phoneList");ul.innerHTML="";
  rows.forEach(([k,label,fn])=>{const li=document.createElement("li");const s=document.createElement("span");
    const on=k==="battery"?st.battery:st[k];s.textContent=(on?"✓ ":"○ ")+label;if(on)s.style.color="var(--accent)";
    li.append(s);if(!on)li.append(btn("Turn on",fn,"Turn on "+label));
    else if(k==="bubble")li.append(btn("Turn off",()=>setBubble(false).then(()=>setTimeout(renderPhone,500)),"Turn off the floating ball"));
    ul.append(li)});
}
$("#testAlertBtn").onclick=()=>testAlert();
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")renderPhone()});

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
  const prev=allMessages().filter(m=>!m.error).slice(-10).map(m=>({role:m.role==="me"?"user":"model",text:m.role==="me"?m.text:JSON.stringify({reply:m.text,suggestions:[]})}));
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

route();
