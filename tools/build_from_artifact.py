"""One-off: turn the Claude artifact planner into the app's index.html + src/app.js."""
import re

markup = open('/tmp/markup.html').read()
script = open('/tmp/script.js').read()

def rep(src, a, b, count=1):
    assert src.count(a) == count, (a[:80], src.count(a))
    return src.replace(a, b)

# ---------------- markup ----------------
markup = rep(markup, '<div class="wrap">', '''<section id="authScreen" class="auth" hidden>
  <form id="authForm" class="auth-card">
    <h1>Weekly Board</h1>
    <p class="sub">Sign in to your planner.</p>
    <label for="a-email">Email<input id="a-email" type="email" autocomplete="email" required></label>
    <label for="a-pw">Password<input id="a-pw" type="password" autocomplete="current-password" minlength="6" required></label>
    <div class="row">
      <button class="primary" id="a-in" type="submit">Sign in</button>
      <button id="a-up" type="button">Create account</button>
      <button id="a-reset" type="button" class="ghost">Forgot password</button>
    </div>
    <p class="empty" id="a-msg" role="status"></p>
  </form>
</section>
<section id="setupScreen" class="auth" hidden>
  <div class="auth-card">
    <h1>Almost there</h1>
    <p class="sub">This app isn't connected to Firebase yet. Paste your firebaseConfig into <code>src/firebase-config.js</code> and rebuild.</p>
  </div>
</section>
<div class="wrap" id="appWrap" hidden>''')

markup = rep(markup, '''    <div class="cols">''', '''    <div class="panel" id="seedPanel" hidden>
      <h2>Welcome to your own app</h2>
      <p class="empty" style="margin:0">Bring over everything we set up in Claude: your classes, routine, rides, meetings and this week's tasks.</p>
      <div class="row"><button class="primary" id="seedBtn">Load my plan</button><span class="empty" id="seedMsg"></span></div>
    </div>
    <div class="cols">''')

markup = rep(markup, '''      <div class="panel">
        <h2>Day rules</h2>''', '''      <div class="panel" id="phonePanel" hidden>
        <h2>Phone alerts</h2>
        <p class="empty" style="margin:0">Turn each of these on once. Samsung phones also need the app set to "Unrestricted" battery use, or alerts can arrive late.</p>
        <ul class="mini" id="phoneList"></ul>
        <div class="row"><button class="primary" id="testAlertBtn">Send a test alert</button></div>
      </div>
      <div class="panel">
        <h2>Account</h2>
        <div class="row"><span class="empty" id="whoami"></span><button id="signOutBtn">Sign out</button></div>
      </div>
      <div class="panel">
        <h2>Day rules</h2>''')

# ---------------- script ----------------
script = rep(script, 'note("Sign in to claude.ai to save changes. Nothing on this screen is kept until then.")',
             'note("You\'re signed out. Sign in to save changes.")')

# native: phone handles the full-screen alerts, so the in-page version only runs on the website
script = rep(script, 'function checkAlert(){\n  if(!loaded)return;', 'function checkAlert(){\n  if(!loaded||isNative)return;')

# after every render of today, hand today's + tomorrow's blocks to the phone
script = rep(script, '  renderStreak();\n', '  renderStreak();\n  syncSchedule(phoneItems);\n')

# replace the Claude data hookup with a Firestore one started after login
start = script.index('(async()=>{\n  db=await (window.claude?.use?.("db")||null);')
script = script[:start] + '''let unsubs=[];
function startData(store){
  stopData();
  db=store;loaded=false;renderAll();
  const timer=setTimeout(()=>note("Your plan can't be reached yet. Check your connection."),10000);
  const ok=s=>{if(!s.metadata.fromCache){clearTimeout(timer);if($("#note").textContent.startsWith("Your plan can't"))note("")}};
  const err=e=>{clearTimeout(timer);loaded=true;note("Couldn't load part of your plan ("+e.code+").");renderAll()};
  const docs=s=>s.docs.map(d=>({id:d.id,...d.data()}));
  let gotClasses=false,gotRoutine=false;
  const maybeSeed=()=>{if(gotClasses&&gotRoutine)$("#seedPanel").hidden=!(classes.length===0&&routine.length===0)};
  unsubs=[
    db.collection("tasks").onSnapshot(s=>{tasks=docs(s);loaded=true;ok(s);renderBoard()},err),
    db.collection("reviews").onSnapshot(s=>{reviews=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));renderBoard()},err),
    db.collection("classes").onSnapshot(s=>{classes=docs(s);loaded=true;ok(s);if(!s.metadata.fromCache)gotClasses=true;maybeSeed();renderToday();renderSetup()},err),
    db.collection("routine").onSnapshot(s=>{routine=docs(s);loaded=true;if(!s.metadata.fromCache)gotRoutine=true;maybeSeed();renderToday();renderSetup();checkAlert()},err),
    db.collection("days").onSnapshot(s=>{days=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));renderToday()},err),
    db.doc("settings/main").onSnapshot(s=>{settings={...DEFAULT_SET,...(s.exists?s.data():{})};renderToday();renderSetup()},err)
  ];
}
function stopData(){unsubs.forEach(u=>{try{u()}catch(e){}});unsubs=[];db=null;tasks=[];reviews={};classes=[];routine=[];days={};settings={...DEFAULT_SET};}

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
'''

header = '''import "./style.css";
import seed from "./seed.json";
import { configured, watchUser, signIn, signUp, resetPassword, logOut, makeDb } from "./firebase.js";
import { isNative, syncSchedule, alertStatus, askNotifications, openPhoneSetting, testAlert } from "./native.js";

'''

footer = '''
/* ---------- sign-in ---------- */
const authMsg=m=>{$("#a-msg").textContent=m||""};
const nice=e=>({"auth/invalid-credential":"That email and password don't match.","auth/email-already-in-use":"That email already has an account. Sign in instead.","auth/weak-password":"Use at least 6 characters.","auth/invalid-email":"That email doesn't look right.","auth/network-request-failed":"No connection. Try again when you're online."})[e.code]||e.message;
$("#authForm").addEventListener("submit",async e=>{e.preventDefault();authMsg("Signing in…");try{await signIn($("#a-email").value.trim(),$("#a-pw").value)}catch(err){authMsg(nice(err))}});
$("#a-up").onclick=async()=>{if(!$("#authForm").reportValidity())return;authMsg("Creating your account…");try{await signUp($("#a-email").value.trim(),$("#a-pw").value)}catch(err){authMsg(nice(err))}};
$("#a-reset").onclick=async()=>{const em=$("#a-email").value.trim();if(!em){authMsg("Type your email first.");return}try{await resetPassword(em);authMsg("Check your inbox for a reset link.")}catch(err){authMsg(nice(err))}};
$("#signOutBtn").onclick=()=>logOut();
$("#seedBtn").onclick=async()=>{if(!db)return;$("#seedBtn").disabled=true;$("#seedMsg").textContent="Loading…";
  try{await db.importSeed(seed);$("#seedMsg").textContent="Done";$("#seedPanel").hidden=true}catch(e){$("#seedBtn").disabled=false;$("#seedMsg").textContent="Couldn't load it: "+(e.message||e.code)}};

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
    ["battery","Unrestricted battery (Samsung)",()=>openPhoneSetting("battery")]
  ];
  const ul=$("#phoneList");ul.innerHTML="";
  rows.forEach(([k,label,fn])=>{const li=document.createElement("li");const s=document.createElement("span");
    const on=k==="battery"?st.battery:st[k];s.textContent=(on?"✓ ":"○ ")+label;if(on)s.style.color="var(--accent)";
    li.append(s);if(!on)li.append(btn("Turn on",fn,"Turn on "+label));ul.append(li)});
}
$("#testAlertBtn").onclick=()=>testAlert();
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")renderPhone()});
'''

script = rep(script, '\nroute();\n', '\n')
open('src/app.js', 'w').write(header + script + footer + '\nroute();\n')

page = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#6D3FC0">
<title>Weekly Board</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="manifest" href="/manifest.webmanifest">
</head>
<body>
''' + markup + '''
<script type="module" src="/src/app.js"></script>
</body>
</html>
'''
open('index.html', 'w').write(page)
print("ok")
