
/* ---------- constants ---------- */
const NAMES={anthonia:'Anthonia',ifeayomi:'Ifeayomi'};
const other=r=>r==='anthonia'?'ifeayomi':'anthonia';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const HEART_PATH='M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.3 2.6.7-1.5 2.2-2.6 4.3-2.6 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z';
const HEART=`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${HEART_PATH}"/></svg>`;
const QUESTIONS=["What made you smile today?","What's one thing you miss about being in the same room as me?","If we could teleport for one hour tonight, where would we go?","What's a small thing I do that makes you feel loved?","What's something you're worried about this week?","Describe your perfect lazy Sunday with me.","What's one goal you want us to hit before the year ends?","What song reminds you of us right now?","What food do you want us to eat together on our next visit?","What's one thing you're proud of yourself for lately?","What did you dream about recently?","What's a habit of mine you secretly love?","Where do you see us in five years?","What's one thing I could do this week to make you happier?","What was your first impression of me?","What's a memory of us you replay often?","If we opened a business together, what would it be?","What's something new you learned this week?","What's one thing you want to tell me but haven't yet?","Which of our plans are you most excited about?","What's your love language today: words, time, gifts, help or touch?","What's a place back home you want us to visit together?","What's a place in Italy you want us to explore together?","What stressed you today, and how can I help?","What would our dream home look like?","What's a silly thing that made you laugh recently?","What do you appreciate most about how we handle the distance?","What's one thing we should start doing as a couple?","What's one thing we should stop doing as a couple?","Finish this: I knew I loved you when…"];
const OPEN_WHEN=["Open now 💌","Happy Men's Day, my king 👑","Open when you miss me","Open when you're sad","Open when you need a laugh","Open when you can't sleep","Open when you're stressed","Open when we've had a fight","Open on your birthday"];
const SIZES_WIDE=[[24,6,4],[60,10,6],[120,12,10],[260,20,13]];
const SIZES=new Proxy(SIZES_WIDE,{get(t,k){const tall=window.innerHeight>window.innerWidth;const v=t[k];if(Array.isArray(v)&&tall)return [v[0],v[2],v[1]];if(k==='map'||k==='find')return (...a)=>t.map(x=>tall?[x[0],x[2],x[1]]:x)[k](...a);return v;}});
const TABS=[["home","Us",'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],["chat","Chat",'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>'],["play","Play",'<rect x="3" y="7" width="18" height="11" rx="5"/><path d="M8 11v3M6.5 12.5h3M15.5 11.5h.01M17.5 13.5h.01"/>'],["plan","Plan",'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'],["truth","Truth",'<path d="M4 5h16v11H9l-5 4z"/><path d="M9 10.5h6"/>'],["us","Gallery",'<rect x="3" y="4.5" width="18" height="15" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5.5-5.5L7 19"/>']];

/* ---------- avatars ---------- */
const SKINS=['#4a2c1d','#6e4029','#91583a','#bf8459','#e8b892'];
const HAIRC=['#1b1210','#3d2516','#7a4524','#b8322f','#e9b949'];
const HAIRS=['Long','Puff','Braids & bun','Short','Low cut'];
const EXTRAS=['None','Glasses','Bow','Earrings','Cap','Sunglasses','Crown','Flower','Moustache','Clown nose'];
const MOODS=['Smile','Big grin','Wink','Shocked','Kiss','Cheeky'];
const DEFAULT_AV={anthonia:{skin:1,hair:2,hc:0,extra:3},ifeayomi:{skin:1,hair:4,hc:0,extra:0}};
function avatarSVG(role,cfg){
  cfg=Object.assign({},DEFAULT_AV[role],cfg||{});
  const sk=SKINS[cfg.skin]||SKINS[1],hc=HAIRC[cfg.hc]||HAIRC[0],main=role==='anthonia'?'#ff4f7e':'#22b3a3',bg=role==='anthonia'?'#ffe4ec':'#d9f6f1';
  const back=[`<path d="M24 46c0-20 12-30 26-30s26 10 26 30v30H24z" fill="${hc}"/>`,`<circle cx="50" cy="30" r="25" fill="${hc}"/>`,`<circle cx="50" cy="14" r="11" fill="${hc}"/><path d="M27 44c-3 14-4 24-2 32M73 44c3 14 4 24 2 32" stroke="${hc}" stroke-width="6" stroke-linecap="round" fill="none"/>`,'',''][cfg.hair]||'';
  const front=[`<path d="M25 44c0-16 11-25 25-25s25 9 25 25c-8-8-18-11-27-11-9 0-16 4-23 11z" fill="${hc}"/>`,`<path d="M26 42c2-14 12-20 24-20s22 6 24 20c-7-6-15-9-24-9s-17 3-24 9z" fill="${hc}"/>`,`<path d="M26 42c1-14 11-21 24-21s23 7 24 21c-6-7-15-10-24-10s-18 3-24 10z" fill="${hc}"/>`,`<path d="M26 40c2-13 12-19 24-19s22 6 24 19c-3-3-8-7-12-7-4 4-12 5-20 4-6 0-11 1-16 3z" fill="${hc}"/>`,`<path d="M27 38c3-10 12-16 23-16s20 6 23 16c-6-4-14-6-23-6s-17 2-23 6z" fill="${hc}" opacity=".85"/>`][cfg.hair]||'';
  const mood=cfg.mood||0,E='<ellipse cx="41" cy="47" rx="2.6" ry="3.4" fill="#2a1712"/>',E2='<ellipse cx="59" cy="47" rx="2.6" ry="3.4" fill="#2a1712"/>',SH='<circle cx="42" cy="46" r=".9" fill="#fff"/><circle cx="60" cy="46" r=".9" fill="#fff"/>';
  const eyes=mood===2?E+'<path d="M55 47q4-3 8 0" stroke="#2a1712" stroke-width="2.4" fill="none" stroke-linecap="round"/>':mood===3?'<circle cx="41" cy="47" r="4" fill="#fff" stroke="#2a1712" stroke-width="1.5"/><circle cx="59" cy="47" r="4" fill="#fff" stroke="#2a1712" stroke-width="1.5"/><circle cx="41" cy="47" r="2" fill="#2a1712"/><circle cx="59" cy="47" r="2" fill="#2a1712"/>':mood===1?'<path d="M37 48q4-5 8 0M55 48q4-5 8 0" stroke="#2a1712" stroke-width="2.4" fill="none" stroke-linecap="round"/>':E+E2+SH;
  const mouth=[`<path d="M43 57c3 4 11 4 14 0" stroke="#2a1712" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,`<path d="M41 56h18c0 7-5 10-9 10s-9-3-9-10z" fill="#7a1f2b"/><path d="M43 56h14v2.5H43z" fill="#fff"/>`,`<path d="M43 57c3 4 11 4 14 0" stroke="#2a1712" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,`<ellipse cx="50" cy="59" rx="3.5" ry="4.5" fill="#7a1f2b"/>`,`<path d="M47 58q3-3 6 0q-3 3-6 0z" fill="#d6336c"/><path d="M68 40c0 0-3-2-4-4-.6-1.5.4-3 2-3 1 0 1.8.6 2 1.2.2-.6 1-1.2 2-1.2 1.6 0 2.6 1.5 2 3-1 2-4 4-4 4z" fill="#ff4f7e"/>`,`<path d="M43 57c3 4 11 4 14 0" stroke="#2a1712" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M48 59q2 5 5 0z" fill="#ff7d9a"/>`][mood]||'';
  const extra=[``,`<g fill="none" stroke="#3a1f2b" stroke-width="2.4"><circle cx="41" cy="46" r="7"/><circle cx="59" cy="46" r="7"/><path d="M48 46h4"/></g>`,`<g fill="${main}"><path d="M60 22l10-7v14z"/><path d="M60 22l-10-7v14z"/><circle cx="60" cy="22" r="3.5"/></g>`,`<circle cx="25.5" cy="54" r="3" fill="#ffb21f"/><circle cx="74.5" cy="54" r="3" fill="#ffb21f"/>`,`<path d="M24 38c2-14 13-20 26-20s24 6 26 20z" fill="${main}"/><path d="M50 38h30c0 3-3 5-6 5H50z" fill="${main}"/>`,`<g fill="#1b1210"><rect x="31" y="41" width="16" height="10" rx="4"/><rect x="53" y="41" width="16" height="10" rx="4"/><rect x="46" y="43" width="8" height="2.5"/></g>`,`<path d="M32 26l6-12 6 9 6-12 6 12 6-9 6 12z" fill="#ffc531" stroke="#e59a00" stroke-width="1.5"/>`,`<g transform="translate(30 24)"><circle r="5" cx="0" cy="-5" fill="#ff8fab"/><circle r="5" cx="5" cy="0" fill="#ff8fab"/><circle r="5" cx="0" cy="5" fill="#ff8fab"/><circle r="5" cx="-5" cy="0" fill="#ff8fab"/><circle r="3.5" fill="#ffd23f"/></g>`,`<path d="M38 56c4-4 8-3 12 0 4-3 8-4 12 0-4 2-8 1-12-1-4 2-8 3-12 1z" fill="#2a1712"/>`,`<circle cx="50" cy="53" r="4.5" fill="#ef4444"/>`][cfg.extra]||'';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${bg}"/>${back}
  <path d="M18 100c2-18 15-26 32-26s30 8 32 26z" fill="${main}"/><rect x="43" y="62" width="14" height="14" rx="5" fill="${sk}"/>
  <ellipse cx="50" cy="47" rx="24" ry="26" fill="${sk}"/><circle cx="26" cy="50" r="4" fill="${sk}"/><circle cx="74" cy="50" r="4" fill="${sk}"/>${front}
  ${eyes}
  <circle cx="35" cy="56" r="4" fill="#ff7d9a" opacity=".45"/><circle cx="65" cy="56" r="4" fill="#ff7d9a" opacity=".45"/>
  ${mouth}${extra}</svg>`;
}
const av=(role,size=36)=>`<span class="av" style="width:${size}px;height:${size}px">${avatarSVG(role,(S.avatars||{})[role])}</span>`;

/* ---------- HD photos for the jigsaw (CC0, shipped with the app) ---------- */
const PHOTOS=[['pug','animals','Cosy pug'],['splash','animals','Splashing dogs'],['kitty','animals','Sleepy kitty'],['lion','animals','Lion'],['turtle','animals','Sea turtle'],['tiger','animals','Tiger'],['parrot','animals','Macaw'],['horses','animals','Horses'],['bear','animals','Bear'],['seal','animals','Seal'],
['pier','nature','Lake pier'],['fjord','nature','Fjord'],['waterfall','nature','Waterfall'],['blossom','nature','Cherry blossom'],['balloon','nature','Balloon lake'],['leaves','nature','Autumn leaves'],['peak','nature','Sunset peak'],['beach','nature','Beach from above'],
['lakehouse','places','Lake house'],['castle','places','Fairytale castle'],['paris','places','Paris at night'],['brooklyn','places','Brooklyn street'],['havana','places','Yellow car'],
['pineapple','sweet','Pineapples'],['flowers','sweet','Flower bouquet'],['berries','sweet','Blueberries']];
const CATS=[['animals','Animals'],['nature','Nature'],['places','Places'],['sweet','Sweet things'],['ours','Our photos']];
const photoURL=k=>'photos/'+k+'.jpg',thumbURL=k=>'photos/t/'+k+'.jpg';
const photoTitle=k=>(PHOTOS.find(p=>p[0]===k)||[,,'Puzzle'])[2];

/* ---------- jigsaw engine: real piece shapes on canvas ---------- */
const imgCache={};
function getImg(src){if(!imgCache[src])imgCache[src]=loadImg(src).catch(e=>{delete imgCache[src];throw e;});return imgCache[src];}
const jigSrc=j=>j.photo?photoURL(j.photo):j.img;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let edgeCache={k:null};
function edgesFor(j){const k=j.at+':'+j.cols+':'+j.seed;if(edgeCache.k===k)return edgeCache;const r=mulberry32(j.seed||7);const V=[],H=[];
  for(let y=0;y<j.rows;y++){V.push([]);for(let x=0;x<j.cols-1;x++)V[y].push(r()<.5?1:-1);}
  for(let y=0;y<j.rows-1;y++){H.push([]);for(let x=0;x<j.cols;x++)H[y].push(r()<.5?1:-1);}
  edgeCache={k,V,H};return edgeCache;}
function sides(j,i){const x=i%j.cols,y=Math.floor(i/j.cols),E=edgesFor(j);
  return [y===0?0:-E.H[y-1][x], x===j.cols-1?0:E.V[y][x], y===j.rows-1?0:E.H[y][x], x===0?0:-E.V[y][x-1]];}
function edgeTo(ctx,x0,y0,x1,y1,d){if(!d){ctx.lineTo(x1,y1);return;}const L=Math.hypot(x1-x0,y1-y0),ux=(x1-x0)/L,uy=(y1-y0)/L,nx=uy*d,ny=-ux*d;
  const P=(t,h)=>[x0+ux*t*L+nx*h*L,y0+uy*t*L+ny*h*L];
  ctx.lineTo(...P(.36,0));ctx.bezierCurveTo(...P(.44,0),...P(.28,.24),...P(.5,.24));ctx.bezierCurveTo(...P(.72,.24),...P(.56,0),...P(.64,0));ctx.lineTo(x1,y1);}
function pieceOutline(ctx,s,sd){const p=[[0,0],[s,0],[s,s],[0,s]];ctx.beginPath();ctx.moveTo(0,0);for(let k=0;k<4;k++){const a=p[k],b=p[(k+1)%4];edgeTo(ctx,a[0],a[1],b[0],b[1],sd[k]);}ctx.closePath();}
function cropRect(img,cols,rows){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,ar=cols/rows;let sw=iw,sh=iw/ar;if(sh>ih){sh=ih;sw=ih*ar;}return [(iw-sw)/2,(ih-sh)/2,sw,sh];}
const scaledCache=new Map();
function scaled(img,j,px){const k=j.at+'|'+px+'|'+(j.photo||'u');if(scaledCache.has(k))return scaledCache.get(k);
  const c=document.createElement('canvas');c.width=Math.round(j.cols*px);c.height=Math.round(j.rows*px);const cr=cropRect(img,j.cols,j.rows*(j.ta||1));
  c.getContext('2d').drawImage(img,cr[0],cr[1],cr[2],cr[3],0,0,c.width,c.height);if(scaledCache.size>4)scaledCache.clear();scaledCache.set(k,c);return c;}
function drawPiece(ctx,sc,j,i,s,ox,oy,stroke){const x=i%j.cols,y=Math.floor(i/j.cols);ctx.save();ctx.translate(ox,oy);ctx.scale(1,j.ta||1);pieceOutline(ctx,s,sides(j,i));
  ctx.save();ctx.clip();ctx.drawImage(sc,-x*s,-y*s,j.cols*s,j.rows*s);ctx.restore();ctx.lineWidth=Math.max(.8,s*.035);ctx.strokeStyle=stroke||'rgba(255,255,255,.8)';ctx.stroke();ctx.restore();}
const DPR=()=>Math.min(2,window.devicePixelRatio||1);
let boardGeom=null;
let trayScroll=0;document.addEventListener('scroll',e=>{if(e.target&&e.target.id==='tray')trayScroll=e.target.scrollLeft;},true);
async function drawJig(){
  const j=S.jig;if(!j||j.done)return;let img;try{img=await getImg(jigSrc(j));}catch(e){return;}
  if(S.jig!==j&&(!S.jig||S.jig.at!==j.at))return;
  const cv=document.getElementById('board'),wrap=document.getElementById('boardwrap');if(!cv||!wrap)return;
  const dpr=DPR(),avail=wrap.clientWidth-6;let s=Math.floor(avail/(j.cols+.4));if(S.zoom)s=Math.max(s,54);s=Math.max(s,12);
  const ta=j.ta||1,pad=Math.round(s*.25),W=j.cols*s+pad*2,H=Math.round(j.rows*s*ta)+pad*2;
  cv.style.width=W+'px';cv.style.height=H+'px';cv.width=W*dpr;cv.height=H*dpr;const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);
  ctx.fillStyle='#f7eef2';ctx.beginPath();ctx.roundRect?ctx.roundRect(pad,pad,j.cols*s,j.rows*s*ta,8):ctx.rect(pad,pad,j.cols*s,j.rows*s*ta);ctx.fill();
  const placed=new Set(j.placed||[]),total=j.cols*j.rows;
  ctx.strokeStyle='rgba(255,79,126,.2)';ctx.lineWidth=1;
  for(let i=0;i<total;i++){if(placed.has(i))continue;ctx.save();ctx.translate(pad+(i%j.cols)*s,pad+Math.floor(i/j.cols)*s*ta);ctx.scale(1,ta);pieceOutline(ctx,s,sides(j,i));ctx.stroke();ctx.restore();}
  const sc=scaled(img,j,s*dpr);
  for(const i of placed)drawPiece(ctx,sc,j,i,s,pad+(i%j.cols)*s,pad+Math.floor(i/j.cols)*s*ta,'rgba(255,255,255,.35)');
  boardGeom={s,pad,ta};
  // tray pieces
  const trEl=document.getElementById('tray');if(trEl)trEl.scrollLeft=trayScroll;
  const T=60,ts=T/1.5,tpad=ts*.25,tsc=scaled(img,j,ts*dpr);
  document.querySelectorAll('canvas.piece').forEach(c=>{const i=Number(c.dataset.i);c.style.width=T+'px';c.style.height=T+'px';c.width=T*dpr;c.height=T*dpr;const x=c.getContext('2d');x.scale(dpr,dpr);
    x.shadowColor='rgba(58,31,43,.25)';x.shadowBlur=4;x.shadowOffsetY=1.5;drawPiece(x,tsc,j,i,ts,tpad,tpad);});
}
function sparkle(cx,cy,good){const el=document.createElement('div');el.className='spark '+(good?'good':'bad');el.style.left=cx+'px';el.style.top=cy+'px';el.innerHTML=good?HEART:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>';document.body.appendChild(el);setTimeout(()=>el.remove(),900);}
async function boardTap(e){
  const j=S.jig,me=S.role,cv=e.target;if(!j||j.done||!boardGeom)return;
  if(j.turn!==me)return toast(`It's ${NAMES[j.turn]}'s turn`);
  if(S.sel===null)return toast('Pick a piece from the tray first');
  const r=cv.getBoundingClientRect(),{s,pad}=boardGeom,ta=boardGeom.ta||1;const cx=Math.floor((e.clientX-r.left-pad)/s),cy=Math.floor((e.clientY-r.top-pad)/(s*ta));
  if(cx<0||cy<0||cx>=j.cols||cy>=j.rows)return;const i=cy*j.cols+cx;
  if((j.placed||[]).includes(i))return toast('That spot is already filled');
  if(i!==S.sel){sparkle(e.clientX,e.clientY,false);cv.classList.add('shake');setTimeout(()=>cv.classList.remove('shake'),400);S.sel=null;const nxt=other(me);
    setTimeout(async()=>{await mergeDoc('games/jigsaw',{turn:nxt,run:0});toast(`Missed! Over to ${NAMES[nxt]}`);},450);return;}
  sparkle(e.clientX,e.clientY,true);
  const placed=[...(j.placed||[]),i],counts={...(j.counts||{})};counts[me]=(counts[me]||0)+1;const run=(j.run||0)+1;
  let best=j.best||null;if(!best||run>best.n)best={by:me,n:run};const done=placed.length===j.cols*j.rows;S.sel=null;
  await mergeDoc('games/jigsaw',{placed,counts,run,best,done});
  if(!done&&(run===5||run===10||run===20))toast(`${run} in a row!`);
  if(done){const src=jigSrc(j);let thumb=j.photo?thumbURL(j.photo):null;if(!thumb){try{thumb=cropTo(await getImg(src),300,300,.72);}catch(e){}}
    const w=winnerOf(counts);recordWin('jigsaw',w||'tie');await saveToGallery({thumb,photo:j.photo||null,img:j.photo?null:j.img,caption:`Our ${j.cols*j.rows}-piece ${j.photo?photoTitle(j.photo).toLowerCase():'puzzle'} · ${w?NAMES[w]+' won':'a tie'}`,kind:'puzzle'});}
}
const winnerOf=c=>{const a=(c&&c.anthonia)||0,i=(c&&c.ifeayomi)||0;return a===i?null:(a>i?'anthonia':'ifeayomi');};
const CROWN='<svg viewBox="0 0 64 44" aria-hidden="true"><path d="M4 14l14 12L32 4l14 22 14-12-6 28H10z" fill="#ffc531" stroke="#e59a00" stroke-width="2.5" stroke-linejoin="round"/><circle cx="4" cy="14" r="4" fill="#ff4f7e"/><circle cx="32" cy="4" r="4" fill="#22b3a3"/><circle cx="60" cy="14" r="4" fill="#ff4f7e"/><rect x="10" y="36" width="44" height="6" rx="2" fill="#e59a00"/></svg>';
function showWinner(j){
  const c=j.counts||{},w=winnerOf(c),me=S.role;const el=document.createElement('div');el.className='win';
  el.innerHTML=`<div class="winCard"><div class="rays"></div>
   ${w?`<div class="crown">${CROWN}</div><div class="winAv">${av(w,130)}</div><h1>${NAMES[w]} wins!</h1><p class="muted" style="margin:0">${w===me?'You did it! Victory dance time.':'Well played. Rematch?'}</p>`
      :`<div class="row" style="justify-content:center;gap:4px"><div class="winAv">${av('anthonia',96)}</div><span class="bridge">${HEART}</span><div class="winAv">${av('ifeayomi',96)}</div></div><h1>It's a tie!</h1><p class="muted" style="margin:0">Perfect match, like the two of you.</p>`}
   <div class="score"><span style="color:var(--her)">${c.anthonia||0}</span><span class="muted" style="font-size:1rem">pieces</span><span style="color:var(--him)">${c.ifeayomi||0}</span></div>
   <img src="${jigSrc(j)}" alt="The finished puzzle" class="winPic">
   <div class="row" style="justify-content:center"><button class="btn primary" data-act="winAgain">Play again</button><button class="btn" data-act="winGallery">See it in the gallery</button></div>
   <button class="btn ghost sm" data-act="winClose">Close</button></div>`;
  document.body.appendChild(el);confetti();setTimeout(confetti,900);setTimeout(confetti,1800);floatHearts();
}

/* ---------- state ---------- */
const S={tab:['home','chat','play','plan','truth','us'].includes(location.hash.slice(1))?location.hash.slice(1):'home',
  mode:'loading',role:null,couple:null,daily:[],songs:{},tap:null,jig:null,month:null,year:null,dates:[],truths:[],
  memories:[],wish:null,letters:[],mood:[],avatars:{},games:{},voice:[],game:null,zoom:false,edgesOnly:false,pickCat:'animals',pickSize:60,galFilter:'all',lb:null,sel:null,truthDraft:null,truthBusy:false,gotCouple:false,note:'',lastPlaced:null};
let uid=null,lastTapAt=null;

/* ---------- dates ---------- */
const fmtDay=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'});
const todayKey=()=>fmtDay.format(new Date());
const monthKey=()=>todayKey().slice(0,7);
const addDays=(k,n)=>new Date(Date.parse(k+'T12:00:00Z')+n*864e5).toISOString().slice(0,10);
const daysBetween=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/864e5);
const prettyDay=k=>new Date(k+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'});
const monthName=k=>new Date(k+'-15T12:00:00Z').toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'});
const hostFor=k=>(Number(k.slice(5,7))-1)%2===0?'anthonia':'ifeayomi';
function lastSunday(y,m){const d=new Date(Date.UTC(y,m+1,0));return d.getUTCDate()-d.getUTCDay();}
function romeDST(k){const [y,m,d]=k.split('-').map(Number);const s=lastSunday(y,2),e=lastSunday(y,9);
  if(m-1>2&&m-1<9)return true;if(m-1===2)return d>=s;if(m-1===9)return d<e;return false;}
function ibadanTime(k,t){if(!t)return '';if(!romeDST(k))return t;let [h,mi]=t.split(':').map(Number);h=(h+23)%24;return String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0');}
function ago(ts){if(!ts)return '';const s=Math.max(0,(Date.now()-ts)/1000);if(s<60)return 'just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<86400)return Math.floor(s/3600)+' h ago';return Math.floor(s/86400)+' d ago';}
const clockFmt=tz=>new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit'});
const romeClock=clockFmt('Europe/Rome'),lagosClock=clockFmt('Africa/Lagos');
const hourIn=tz=>Number(new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',hour12:false}).format(new Date()));
const uidGen=()=>Math.random().toString(36).slice(2,10);

/* ---------- store: Firebase (live) or in-memory (?demo) ---------- */
const mem=new Map(),memSubs=[];let POD=null;const unsubs=[];
const LIVE=()=>S.mode==='live'&&window.FB&&POD;
const fp=p=>POD+'/'+p;
function deepMerge(a,b){const o={...(a||{})};for(const k in b){const v=b[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k]))o[k]=deepMerge(o[k],v);else o[k]=v;}return o;}
function memCol(p){const out=[];const pre=p+'/';for(const [k,v] of mem){if(k.startsWith(pre)&&!k.slice(pre.length).includes('/'))out.push({id:k.slice(pre.length),...v});}return out;}
function memNotify(){memSubs.forEach(s=>s.cb(s.col?memCol(s.path):(mem.get(s.path)||null)));}
function watchDoc(path,cb){if(!LIVE()){memSubs.push({path,col:false,cb});cb(mem.get(path)||null);return;}unsubs.push(FB.watchDoc(fp(path),cb,handleErr));}
function watchCol(path,cb,opt){if(!LIVE()){memSubs.push({path,col:true,cb});let l=memCol(path);if(opt&&opt.order)l.sort((a,b)=>opt.dir==='desc'?(b[opt.order]||0)-(a[opt.order]||0):(a[opt.order]||0)-(b[opt.order]||0));cb(l);return;}
  unsubs.push(FB.watchCol(fp(path),cb,handleErr,opt));}
const queues={};
function enqueue(path,fn){const p=(queues[path]||Promise.resolve()).then(fn,fn);queues[path]=p.catch(()=>{});return p;}
function memSort(){/* demo-only: keep newest first where needed */}
async function mergeDoc(path,data){if(hasNested(data,false)){console.error('Firestore cannot store nested arrays',path);toast('Bug: this data cannot be saved');throw new Error('nested');}if(!LIVE()){mem.set(path,deepMerge(mem.get(path),data));memNotify();return;}return enqueue(path,()=>FB.merge(fp(path),data)).catch(saveFail);}
function hasNested(v,inArr){if(Array.isArray(v))return inArr||v.some(x=>hasNested(x,true));if(v&&typeof v==='object')return Object.values(v).some(x=>hasNested(x,false));return false;}
async function setDoc(path,data){if(hasNested(data,false)){console.error('Firestore cannot store nested arrays',path);toast('Bug: this data cannot be saved');throw new Error('nested');}if(!LIVE()){mem.set(path,JSON.parse(JSON.stringify(data)));memNotify();return;}return enqueue(path,()=>FB.set(fp(path),data)).catch(saveFail);}
async function addDoc(col,data){const id=Date.now().toString(36)+uidGen();await setDoc(col+'/'+id,data);return id;}
async function getDoc(path){if(!LIVE())return mem.get(path)||null;try{return await FB.get(fp(path));}catch(e){return null;}}
async function delDoc(path){if(!LIVE()){mem.delete(path);memNotify();return;}return enqueue(path,()=>FB.del(fp(path))).catch(saveFail);}
function saveFail(e){const c=e&&e.code||'';if(/permission/.test(c))toast("Pods isn't allowed to save. Check the Firestore rules (see Settings).");
  else if(/resource-exhausted|quota/.test(c))toast('Pods storage limit reached for today. Try again tomorrow.');
  else toast("Couldn't save. Check your connection and try again.");throw e;}
function handleErr(e){const c=e&&e.code||'';if(/permission/.test(c)){S.note="Pods can't read your data. Paste the new Firestore rules (Settings shows how).";render();}}

/* ---------- boot: sign in, find our pod ---------- */
async function boot(){
  makeBgHearts();render();setInterval(tickClocks,20000);
  if(new URLSearchParams(location.search).has('demo')){S.mode='demo';try{S.role=localStorage.getItem('pods-role');}catch(e){}subscribe();render();return;}
  if(!window.FB)await new Promise(r=>{window.addEventListener('fb-ready',r,{once:true});setTimeout(r,15000);});
  if(!window.FB){S.mode='offline';render();return;}
  FB.onAuth(async user=>{
    unsubs.splice(0).forEach(u=>{try{u();}catch(e){}});
    if(!user){uid=null;POD=null;S.mode='auth';render();return;}
    uid=user.uid;S.email=user.email;
    let link=null;try{link=await FB.get('users/'+uid+'/pods/link');}catch(e){}
    if(!link||!link.podId){S.mode='setup';render();return;}
    POD='pods/'+link.podId;S.podId=link.podId;S.role=link.role;S.mode='live';
    subscribe();render();
    setTimeout(()=>{if(!S.gotCouple){S.note="Pods can't reach its data yet. It will appear as soon as you're back online.";render();}},12000);
  });
}
function authView(){const up=S.authMode==='up';return `<div class="card center" style="margin-top:16px">${av('anthonia',64)}<h1 style="font-size:1.8rem;color:var(--her)">Welcome to Pods</h1>
  <p class="muted" style="margin:0">${up?'Create your own login. Each of you has one.':'Sign in with your email and password. Anthonia: use your Weekly Board login.'}</p>
  <form id="authForm" style="display:flex;flex-direction:column;gap:10px;width:100%">
   <input type="text" id="aEmail" inputmode="email" autocomplete="email" placeholder="Email">
   <input type="text" id="aPass" autocomplete="${up?'new-password':'current-password'}" placeholder="Password${up?' (at least 6 characters)':''}" style="-webkit-text-security:disc">
   <button class="btn primary" type="submit">${up?'Create my login':'Sign in'}</button></form>
  <button class="btn ghost sm" data-act="authToggle">${up?'I already have a login':'New here? Create a login'}</button>
  ${up?'':'<button class="btn ghost sm" data-act="authReset">Forgot password</button>'}</div>`;}
function setupView(){return `<div class="card center" style="margin-top:16px"><h1 style="font-size:1.6rem;color:var(--her)">Let's link the two of you</h1>
  <p class="muted" style="margin:0">One of you creates your Pod. The other joins with its code.</p>
  <span class="eyebrow">Who are you?</span>
  <div class="pick"><button class="a ${S.setupRole==='anthonia'?'sel':''}" data-act="setupRole" data-r="anthonia">${av('anthonia',64)}Anthonia</button><button class="i ${S.setupRole==='ifeayomi'?'sel':''}" data-act="setupRole" data-r="ifeayomi">${av('ifeayomi',64)}Ifeayomi</button></div>
  <button class="btn primary block" data-act="podCreate" ${S.setupRole?'':'disabled'}>Create our Pod</button>
  <div class="row" style="width:100%;flex-wrap:nowrap"><input type="text" id="joinCode" placeholder="Got a code? e.g. K7Q2XM" style="text-transform:uppercase"><button class="btn teal" data-act="podJoin" ${S.setupRole?'':'disabled'}>Join</button></div>
  <button class="btn ghost sm" data-act="signOut">Sign out (${esc(S.email||'')})</button></div>`;}

function resubscribe(){if(S.mode!=='live'||!POD)return;unsubs.splice(0).forEach(u=>{try{u();}catch(e){}});subscribe();}
let hiddenAt=0;document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=Date.now();return;}if(Date.now()-hiddenAt>4000)resubscribe();});
window.addEventListener('online',()=>resubscribe());
function onJig(d){const prev=S.jig;S.jig=d;if(d&&prev&&!prev.done&&d.done&&!d.cancelled)setTimeout(()=>showWinner(d),300);if(d&&d.cancelReq&&d.cancelReq.by!==S.role&&!(prev&&prev.cancelReq))toast(`${NAMES[d.cancelReq.by]} wants to start a new puzzle`);if(d&&prev&&prev.turn!==d.turn&&d.turn===S.role&&!d.done)toast('Your turn in the jigsaw!');refresh();}
function onMessages(l){const prev=S.msgs;S.msgs=l;checkNews(prev,l);markDelivered(l);if(prev&&S.role){const known=new Set(prev.map(m=>m.id));const fresh=l.filter(m=>!known.has(m.id)&&m.by!==S.role&&m.kind!=='news');if(fresh.length&&S.tab!=='chat'){const m=fresh[fresh.length-1];toast(`${NAMES[m.by]}: ${m.kind==='voice'?'sent a voice note':m.kind==='photo'?'sent a photo':m.kind==='checkin'?'checked in for the evening':m.kind==='letter'?'sent you a sealed letter 💌':m.kind==='plan'?planSnippet(m).replace(NAMES[m.by]+' ','').slice(0,50):(m.text||'').slice(0,40)}`);floatHearts();}}refresh();}
/* safety net: if the live connection stalls, ask the server every few seconds */
let polling=false;
async function pollLive(){if(polling||S.mode!=='live'||!POD||!window.FB||document.hidden||!FB.newerThan)return;polling=true;
  try{const newest=Math.max(0,...(S.msgs||[]).map(m=>m.at||0));const nw=await FB.newerThan(POD+'/messages','at',newest,30);
    if(nw.length){const ids=new Set((S.msgs||[]).map(m=>m.id));const add=nw.filter(m=>!ids.has(m.id));if(add.length)onMessages([...add.reverse(),...(S.msgs||[])]);}
    if(S.tab==='play'&&S.game){const id=S.game,d=await FB.getServer(POD+'/games/'+id);
      if(d){if(id==='jigsaw'){if(!S.jig||(d.placed||[]).length!==(S.jig.placed||[]).length||d.turn!==S.jig.turn||d.at!==S.jig.at||!!d.done!==!!S.jig.done)onJig(d);}
        else{const cur=S.games[id];if(!cur||(d.updatedAt||0)>(cur.updatedAt||0)){const prev={...S.games};S.games={...S.games,[id]:{id,...d}};gamesChanged(prev,S.games);refresh();}}}}
    if(S.tab==='chat'){const cr=await FB.getServer(POD+'/pods/presence');if(cr){S.presence=cr;}}
  }catch(e){}finally{polling=false;}}
setInterval(()=>{if(S.tab==='chat'||S.tab==='play')pollLive();},6000);
setInterval(()=>{if(S.tab!=='chat'&&S.tab!=='play')pollLive();},20000);
function subscribe(){
  watchDoc('pods/couple',d=>{const pn=S.role&&S.couple&&S.couple.nick?S.couple.nick[other(S.role)]:undefined;S.couple=d;{const nn=S.role&&d&&d.nick?d.nick[other(S.role)]:undefined;if(S.gotCouple&&S.role&&nn&&nn!==pn){setTimeout(()=>{floatHearts();toast(`${NAMES[other(S.role)]} now calls you "${nn}"`);},400);}}S.gotCouple=true;applyNick();if(S.note.startsWith("Pods can't"))S.note='';refresh();maybeAskNick();});
  watchCol('messages',onMessages,{order:'at',dir:'desc',limit:120});
  watchDoc('pods/chatread',d=>{S.chatRead=d||{};refresh();});
  watchDoc('pods/presence',d=>{S.presence=d||{};const el=document.getElementById('presText');if(S.tab==='chat'&&el){const pr=partnerPresence();el.textContent=pr.typing?'typing…':pr.text;el.className='small '+(pr.on?'onl':'muted');const cl=document.getElementById('chatList');if(cl){const old=cl.querySelector('.peek');const you=other(S.role);const html=pr.on&&pr.where==='chat'?`<div class="peek">${av(you,42)}${pr.typing?'<span class="typing"><i></i><i></i><i></i></span>':''}</div>`:'';if(old)old.remove();if(html){cl.insertAdjacentHTML('beforeend',html);cl.scrollTop=cl.scrollHeight;}}const pa=document.querySelector('.pav');if(pa)pa.classList.toggle('on',pr.on);}else if(S.tab==='home')refresh();});
  watchDoc('pods/scores',d=>{S.scores=d||{};refresh();});
  watchCol('checkins',l=>{S.checkins=l;refresh();},{order:'at',dir:'desc',limit:20});
  watchDoc('pods/avatars',d=>{const p=(S.avatars||{})[S.role];S.avatars=d||{};const n=S.avatars[S.role];S.gotAv=true;refresh();});
  watchCol('daily',l=>{S.daily=l;refresh();});
  watchDoc('pods/songs',d=>{S.songs=d||{};refresh();});
  watchDoc('pods/tap',d=>{S.tap=d;if(d&&lastTapAt!==null&&d.at!==lastTapAt&&S.role&&d.from===other(S.role))floatHearts();lastTapAt=d?d.at:0;refresh();});
  watchCol('games',l=>{const prev=S.games||{};S.games=Object.fromEntries(l.filter(x=>x.id!=='jigsaw').map(x=>[x.id,x]));gamesChanged(prev,S.games);refresh();});
  watchCol('voice',l=>{S.voice=l;refresh();},{order:'at',dir:'desc',limit:30});
  watchDoc('games/jigsaw',onJig);
  watchDoc('months/'+monthKey(),d=>{S.month=d;refresh();});
  watchDoc('years/'+todayKey().slice(0,4),d=>{S.year=d;refresh();});
  watchCol('dates',l=>{S.dates=l;refresh();});
  watchCol('truths',l=>{S.truths=l;refresh();});
  watchCol('memories',l=>{S.memories=l;refresh();},{order:'at',dir:'desc',limit:150});
  watchDoc('pods/wishlist',d=>{S.wish=d;refresh();});
  watchCol('letters',l=>{S.letters=l;S.lettersReady=true;refresh();});
  watchCol('mood',l=>{S.mood=l;refresh();});
}

/* ---------- render plumbing ---------- */
let pending=false,lastTab=null;
function refresh(){pushWidget();pushBadge();if(S.tab==='chat'&&document.getElementById('chatList')&&document.activeElement&&document.activeElement.id==='chatIn'){const tmp=document.createElement('div');tmp.innerHTML=chatView();const nl=tmp.querySelector('#chatList');document.getElementById('chatList').innerHTML=nl?nl.innerHTML:'';chatAfterRender();return;}if(S.tab==='play'&&S.game==='movie'&&document.querySelector('#ytWrap iframe')&&document.getElementById('sheet').classList.contains('hidden')){G.movie.update(S.games.movie,S.role);return;}const a=document.activeElement;if(a&&document.getElementById('view').contains(a)&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)){pending=true;return;}render(true);}
document.addEventListener('focusout',()=>setTimeout(()=>{if(pending){const a=document.activeElement;if(!(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))){pending=false;render(true);}}},0));
function render(quiet){
  const v=document.getElementById('view');
  document.getElementById('tabs').innerHTML=TABS.map(([k,l,p])=>`<button data-act="tab" data-k="${k}" class="${S.tab===k?'on':''}" aria-current="${S.tab===k?'page':'false'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round">${p}</svg>${l}${k==='chat'&&S.role&&unreadCount()?`<span class="badge">${unreadCount()}</span>`:''}</button>`).join('');
  document.getElementById('who').innerHTML=S.role?`<button class="who" data-act="avatarSheet">${av(S.role,32)}${NAMES[S.role]}</button>`:'';
  if(S.mode==='loading'){v.innerHTML=`<div class="loading">${HEART}<p class="muted">Opening Pods…</p></div>`;return;}
  if(S.mode==='offline'){v.innerHTML=`<div class="card center" style="margin-top:20px"><h2>Pods needs the internet to start</h2><p class="muted">Connect and reload the page.</p></div>`;return;}
  if(S.mode==='auth'){v.innerHTML=authView();return;}
  if(S.mode==='setup'){v.innerHTML=setupView();return;}
  if(!S.role){v.innerHTML=pickView();return;}
  const banners=(S.mode==='demo'?`<div class="banner">Demo mode: nothing is saved. <button class="btn sm ghost" data-act="switch">See ${NAMES[other(S.role)]}'s side</button></div>`:'')+(S.note?`<div class="banner">${esc(S.note)}</div>`:'');
  v.innerHTML=banners+({home:homeView,chat:chatView,play:playView,plan:planView,truth:truthView,us:usView}[S.tab])();
  // keep entrance animation only when switching tabs
  if(quiet&&lastTab===S.tab)v.querySelectorAll(':scope>*').forEach(el=>el.style.animation='none');
  lastTab=S.tab;tickClocks();chatAfterRender();pushWidget();pushPresence();pushBadge();if(S.role){maybeAskNick();maybeCheckin();maybeAskBadge();maybeTodoRemind();maybeEnvelope();}
  if(S.tab==='play'){if(S.game==='jigsaw')drawJig();else if(S.game&&G[S.game]&&G[S.game].post&&!(G[S.game].legacy&&G[S.game].legacy(S.games[S.game])))G[S.game].post(S.games[S.game],S.role);}
}
function pickView(){return `<div class="card center" style="margin-top:20px"><h1 style="font-size:2rem;color:var(--her)">Welcome to Pods</h1><p class="muted" style="margin:0">Our little place for two. Who's this?</p>
  <div class="pick"><button class="a" data-act="pick" data-r="anthonia">${av('anthonia',72)}Anthonia<span class="small muted">in Ancona</span></button><button class="i" data-act="pick" data-r="ifeayomi">${av('ifeayomi',72)}Ifeayomi<span class="small muted">in Ibadan</span></button></div></div>`;}
setInterval(()=>{try{maybeCheckin();}catch(e){}},60000);
function tickClocks(){const a=document.getElementById('clkA'),i=document.getElementById('clkI');const now=new Date();if(a)a.textContent=romeClock.format(now);if(i)i.textContent=lagosClock.format(now);}
function makeBgHearts(){const el=document.getElementById('bgHearts');let h='';for(let i=0;i<12;i++){const s=14+Math.random()*26;h+=`<span style="left:${Math.random()*96}%;width:${s}px;height:${s}px;animation-duration:${18+Math.random()*22}s;animation-delay:-${Math.random()*30}s">${HEART}</span>`;}el.innerHTML=h;}

/* ---------- HOME ---------- */
function streak(){const both=new Set(S.daily.filter(d=>d.anthonia&&d.ifeayomi).map(d=>d.id));let k=todayKey();if(!both.has(k))k=addDays(k,-1);let n=0;while(both.has(k)){n++;k=addDays(k,-1);}return n;}
function greeting(){const h=hourIn(S.role==='anthonia'?'Europe/Rome':'Africa/Lagos');return h<5?'Still up':h<12?'Good morning':h<17?'Good afternoon':h<21?'Good evening':'Good night';}
function homeView(){
  const me=S.role,you=other(me),t=todayKey();
  const nv=S.couple&&S.couple.nextVisit;const dleft=nv?daysBetween(t,nv):null;
  const q=QUESTIONS[Math.floor(Date.parse(t+'T12:00:00Z')/864e5)%QUESTIONS.length];
  const day=S.daily.find(d=>d.id===t)||{};const mine=day[me],theirs=day[you];
  const bub=(r,a)=>`<div class="bubble ${r}">${av(r,34)}<div class="b"><div class="who2">${r===me?'You':NAMES[r]}</div>${a.voice?voicePlayer(a.voice,a.secs,'d'+r+t):esc(a.text)}</div></div>`;
  let daily;
  if(mine)daily=bub(me,mine)+(theirs?bub(you,theirs):`<div class="locked">${av(you,26)} Waiting for ${NAMES[you]} to answer…</div>`);
  else daily=(theirs?`<div class="locked">${av(you,26)} ${NAMES[you]} has answered! Answer to unlock it.</div>`:'')+`<textarea id="dailyIn" placeholder="Your answer…"></textarea><div class="row"><button class="btn primary" data-act="answer">Answer</button>${rec?`<button class="btn" data-act="recStop">Stop recording</button>`:`<button class="btn" data-act="recStart" data-k="daily">Answer with a voice note</button>`}</div>`;
  const tapC=(S.tap&&S.tap.day===t&&S.tap.counts)||{};
  const tapLine=S.tap&&S.tap.from===you?`${NAMES[you]} thought of you ${ago(S.tap.at)}`:(S.tap&&S.tap.from===me?`You sent love ${ago(S.tap.at)}`:'Send a little love across the miles');
  const songRow=r=>{const s=S.songs[r];return `<div class="item">${av(r,34)}<div class="grow"><div class="small muted">${r===me?'Your':NAMES[r]+"'s"} song of the moment</div>${s?(s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener" style="color:var(--ink);font-weight:700">${esc(s.title||s.url)}</a>`:`<b>${esc(s.title)}</b>`):'<span class="muted">Nothing pinned yet</span>'}</div>${r===me?`<button class="btn sm" data-act="songSheet">${s?'Change':'Pin'}</button>`:''}</div>`;};
  return `
  <div class="greet">${av(me,54)}<div><h1>${greeting()}, ${NAMES[me]} <span class="wave">${HEART.replace('<svg','<svg width="22" height="22" style="color:var(--her);vertical-align:-3px"')}</span></h1><div class="small ${partnerPresence().on?'onl':'muted'}">${partnerPresence().on?esc(NAMES[you])+' · '+esc(partnerPresence().text):NAMES[you]+' is '+(hourIn(me==='anthonia'?'Africa/Lagos':'Europe/Rome')<6?'probably asleep':'awake in '+(me==='anthonia'?'Ibadan':'Ancona'))}</div></div></div>
  <section class="card hero center">
    <div class="couple">${av('anthonia',64)}<span class="bridge">${HEART}</span>${av('ifeayomi',64)}</div>
    ${nv?(dleft>0?`<div class="big">${dleft}</div><div class="muted" style="font-weight:700">${dleft===1?'day':'days'} until we're together · ${prettyDay(nv)}</div>`:`<div class="big" style="font-size:2.6rem">${dleft===0?'Today!':'Together'}</div><div class="small muted">Set the date of your next visit.</div>`):`<div class="muted" style="font-weight:700">When will you see each other next?</div>`}
    <button class="btn sm ghost" data-act="visitSheet">${nv?'Change date':'Set our next visit'}</button>
    <div class="clocks" style="width:100%">
      <div class="clock"><div class="small muted"><span class="dot anthonia"></span> Ancona</div><div class="t" id="clkA">--:--</div></div>
      <div class="clock him"><div class="small muted"><span class="dot ifeayomi"></span> Ibadan</div><div class="t" id="clkI">--:--</div></div>
    </div>
  </section>
  <div><button class="tapbtn" data-act="tap">${HEART} Thinking of you</button>
  <div class="row between small muted" style="margin-top:8px;padding:0 6px"><span>${esc(tapLine)}</span><span>Love sent today: <b style="color:var(--her)">${tapC.anthonia||0}</b> · <b style="color:var(--him)">${tapC.ifeayomi||0}</b></span></div></div>
  <section class="card">
    <div class="row between"><span class="eyebrow">Today's question</span><span class="chip gold">${streak()} day streak</span></div>
    <h2>${esc(q)}</h2>${daily}
  </section>
  ${checkinCard()}
  ${waitingCard()}
  ${voiceCard()}
  ${homeGallery()}
  <section class="card"><span class="eyebrow">Songs of the moment</span>${songRow(me)}${songRow(you)}</section>`;
}
function voiceCard(){const l=[...(S.voice||[])].sort((a,b)=>b.at-a.at);return `<section class="card"><div class="row between"><span class="eyebrow">Voice notes</span>${rec&&S.recFor==='note'?`<button class="btn sm primary" data-act="recStop">Stop and send</button>`:`<button class="btn sm primary" data-act="recStart" data-k="note">Record one</button>`}</div>
  ${rec&&S.recFor==='note'?`<div class="locked" style="color:var(--her)"><span class="dot anthonia" style="animation:beat 1s infinite"></span> Recording… up to 60 seconds</div>`:''}
  ${l.length?`<div class="vlist">${l.map(v=>`<div class="bubble ${v.by}">${av(v.by,30)}<div class="b"><div class="who2">${v.by===S.role?'You':esc(NAMES[v.by])} · ${ago(v.at)}</div>${voicePlayer(v.src,v.secs,'n'+v.id)}</div></div>`).join('')}</div>${l.length>3?'<p class="small muted center" style="margin:0">Scroll for older notes</p>':''}`:'<p class="small muted" style="margin:0">Say good morning in your own voice.</p>'}</section>`;}
function waitingCard(){
  const me=S.role,w=[];const t=todayKey();const day=S.daily.find(d=>d.id===t)||{};
  if(!day[me])w.push(['home',"Answer today's question"]);
  if(S.jig&&!S.jig.done&&S.jig.turn===me)w.push(['play','Your turn in the jigsaw']);
  for(const [id,g] of Object.entries(S.games||{}))if(G[id]&&g&&!g.over&&g.turn===me&&!(G[id].legacy&&G[id].legacy(g)))w.push(['play','Your turn in '+G[id].name]);
  const tr=S.truths.filter(x=>x.to===me&&x.status==='sent').length;if(tr)w.push(['truth',`${tr} new message${tr>1?'s':''} in Truth Corner`]);
  const lt=S.letters.filter(x=>x.to===me&&!x.opened).length;if(lt)w.push(['us',`${lt} sealed letter${lt>1?'s':''} for you`]);
  const mk=monthKey();if(!(S.month&&S.month.done)&&hostFor(mk)===me)w.push(['plan',Number(t.slice(8))<=7?"You host this month's planning date":"This month's planning date is overdue"]);
  const tl=todoRemindLine();if(tl)w.push(['plan',tl]);
  if(!w.length)return '';
  return `<section class="card waiting"><span class="eyebrow">Waiting for you</span>${w.map(([k,l])=>`<button class="w" data-act="tab" data-k="${k}"><span class="dot ${me}"></span><span>${esc(l)}</span><span class="go">›</span></button>`).join('')}</section>`;
}

/* ---------- PLAY ---------- */
function jigCard(){
  const j=S.jig,me=S.role;let jig;
  if(!j||j.done){
    const res=j&&j.done&&!j.cancelled?`<div class="row" style="justify-content:center">${av('anthonia',44)}<b style="font-family:var(--display);font-size:1.5rem">${(j.counts||{}).anthonia||0} – ${(j.counts||{}).ifeayomi||0}</b>${av('ifeayomi',44)}</div><p class="muted center" style="margin:0">${winnerOf(j.counts)?NAMES[winnerOf(j.counts)]+' won the last puzzle.':'The last puzzle was a tie.'} It's saved in the gallery.</p>`
      :`<p class="muted" style="margin:0">Pick a piece and place it. Right spot? Keep going. Wrong spot? Your turn passes. Most pieces placed wins.</p>`;
    jig=`${res}<button class="btn primary" data-act="jigSheet">Start a new puzzle</button>`;
  }else{
    const total=j.cols*j.rows,placed=new Set(j.placed||[]),mine=j.turn===me,c=j.counts||{};
    let tray=(j.tray||[]).filter(i=>!placed.has(i));
    if(S.edgesOnly){const e=tray.filter(i=>sides(j,i).includes(0));if(e.length)tray=e;}
    const shown=tray.slice(0,40);
    jig=`${scoreLine('jigsaw')}${cancelBar('jigsaw',{cancelReq:j.cancelReq})}${mine&&!placed.size?`<div class="givebar">You start this puzzle. <button class="btn sm" data-act="gGive" data-g="jigsaw">Let ${NAMES[other(me)]} go first</button></div>`:''}<div class="row between"><div class="row">${av(j.turn,38)}<span class="chip ${j.turn==='anthonia'?'her':'him'}">${mine?'Your turn':NAMES[j.turn]+"'s turn"}</span>${mine&&j.run?`<span class="chip gold">${j.run} in a row</span>`:''}</div><span class="small muted"><b>${placed.size}</b> / ${total}</span></div>
    <div class="progress"><i style="width:${placed.size/total*100}%"></i></div>
    <div class="row" style="gap:6px"><button class="btn sm" data-act="peek">Peek at the picture</button><button class="btn sm ${S.zoom?'on':''}" data-act="zoom">${S.zoom?'Fit board':'Zoom in'}</button>${mine?`<button class="btn sm ${S.edgesOnly?'on':''}" data-act="edges">${S.edgesOnly?'All pieces':'Edges first'}</button>`:''}</div>
    <div class="boardwrap" id="boardwrap"><canvas id="board" aria-label="Puzzle board"></canvas></div>
    ${mine?`<p class="small muted" style="margin:0">Tap a piece below, then tap where it goes on the board.</p>
      <div class="traywrap"><div class="tray" id="tray">${shown.map(i=>`<canvas class="piece ${S.sel===i?'sel':''}" data-act="selPiece" data-i="${i}" aria-label="Puzzle piece"></canvas>`).join('')}</div>
      <button class="shuf" data-act="shuffle" aria-label="Shuffle pieces" title="Shuffle pieces"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg></button></div>
      <p class="small muted center" style="margin:0">${tray.length} piece${tray.length===1?'':'s'} left${tray.length>shown.length?` · ${shown.length} in the tray, scroll it sideways`:''}</p>`
    :`<div class="locked">${av(j.turn,28)} ${NAMES[j.turn]} is playing. Your turn comes when they miss.</div>`}
    <div class="row" style="justify-content:space-around"><div class="row">${av('anthonia',32)}<b>${c.anthonia||0}</b></div><span class="small muted">pieces placed</span><div class="row"><b>${c.ifeayomi||0}</b>${av('ifeayomi',32)}</div></div>
    ${j.best?`<p class="small muted center" style="margin:0">Best run: ${NAMES[j.best.by]}, ${j.best.n} in a row</p>`:''}
    <button class="btn sm ghost" style="align-self:center" data-act="jigNew">Start a different puzzle</button>`;
  }
  return `<section class="card"><div class="row between"><div class="row"><button class="btn sm" data-act="gameBack">‹ Games</button><h2>Jigsaw</h2></div>${j&&!j.done?`<span class="chip gold">${j.cols*j.rows} pieces</span>`:''}</div>${j&&!j.done&&j.photo?`<div class="small muted">${esc(photoTitle(j.photo))}</div>`:''}${jig}</section>`;
}
function cancelBar(id,st){const r=st.cancelReq;if(!r||st.over)return '';const you=other(S.role);
  return r.by===S.role?`<div class="givebar">Waiting for ${NAMES[you]} to agree to a new game. <button class="btn sm" data-act="gDecline" data-g="${id}">Never mind</button></div>`
    :`<div class="givebar ask">${av(r.by,26)} ${NAMES[r.by]} wants to end this game and start a new one. <button class="btn sm primary" data-act="gAgree" data-g="${id}">Agree</button><button class="btn sm" data-act="gDecline" data-g="${id}">Keep playing</button></div>`;}
function playView(){
  if(S.game==='jigsaw')return jigCard();
  if(S.game&&G[S.game]){const g=G[S.game],st=S.games[S.game];
    return `<section class="card"><div class="row between"><div class="row"><button class="btn sm" data-act="gameBack">‹ Games</button><h2>${g.name}</h2></div><button class="btn sm ghost" data-act="gNew" data-g="${S.game}">${st?'New game':'Start'}</button></div>
    ${st&&st.fresh&&st.turn===S.role&&!st.over?`<div class="givebar">${st.winnerStart?'You won last time, so you start.':'You start.'} <button class="btn sm" data-act="gGive" data-g="${S.game}">Let ${NAMES[other(S.role)]} go first</button></div>`:''}
    ${scoreLine(S.game)}
    ${st&&g.legacy&&g.legacy(st)?`<div class="givebar ask">This ${g.name} game was started before the update, so it can't continue. <button class="btn sm primary" data-act="gFresh" data-g="${S.game}">Start the new ${g.name}</button></div>`:''}
    ${st?cancelBar(S.game,st):''}
    ${st&&g.legacy&&g.legacy(st)?'':st?(g.statusBelow?g.view(st,S.role)+gameStatus(S.game,st):gameStatus(S.game,st)+g.view(st,S.role)):`<p class="muted" style="margin:0">${g.desc}</p><button class="btn primary" data-act="gNew" data-g="${S.game}">Start a game</button>`}</section>`;}
  const tile=(id,name,desc,icon,st,isTurnGame)=>{let chip='<span class="chip">Start</span>';
    if(st&&G[id]&&G[id].legacy&&G[id].legacy(st))chip='<span class="chip gold">Updated: start new</span>';else if(st&&st.over)chip='<span class="chip gold">Finished</span>';else if(st&&st.turn===S.role)chip='<span class="chip her">Your turn</span>';else if(st&&st.turn)chip=`<span class="chip him">${NAMES[st.turn]}'s turn</span>`;else if(st)chip='<span class="chip him">Open</span>';
    return `<button class="gtile" data-act="game" data-g="${id}"><span class="gico">${icon}</span><b>${name}</b><span class="small muted">${desc}</span>${chip}</button>`;};
  const j=S.jig;const jst=j?{turn:j.done?null:j.turn,over:j.done}:null;
  return `<div class="greet" style="padding-top:2px"><h1>Game Area</h1></div>
  ${scoreboard()}
  <div class="glist">${tile('jigsaw','Jigsaw','Real pieces, HD photos','<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 3a2 2 0 0 1 4 0v1h4a2 2 0 0 1 2 2v4h-1a2 2 0 0 0 0 4h1v4a2 2 0 0 1-2 2h-4v-1a2 2 0 0 0-4 0v1H6a2 2 0 0 1-2-2v-4h1a2 2 0 0 0 0-4H4V6a2 2 0 0 1 2-2h4z"/></svg>',jst)}
  ${Object.entries(G).map(([id,g])=>tile(id,g.name,g.short,g.icon,S.games[id])).join('')}</div>`;
}
/* ---------- PLAN ---------- */
function planView(){
  const me=S.role,mk=monthKey(),host=hostFor(mk),m=S.month||{},t=todayKey(),day=Number(t.slice(8));
  const status=m.done?`<span class="chip him">Done ${m.doneAt?prettyDay(m.doneAt):''}</span>`:(day<=7?`<span class="chip gold">Due by the 7th</span>`:`<span class="chip warn">Overdue</span>`);
  const todos=m.todos||[],goals=(S.year&&S.year.goals)||[];
  const dates=[...S.dates].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const up=dates.filter(d=>d.status!=='done'),past=dates.filter(d=>d.status==='done').reverse().slice(0,5);
  const dateItem=d=>`<div class="item" style="align-items:flex-start">${av(d.host,34)}<div class="grow">
    <b>${prettyDay(d.date)}</b> <span class="small muted">· ${esc(d.time)} Ancona · ${esc(ibadanTime(d.date,d.time))} Ibadan</span>
    <div class="small">Anthonia: ${esc(d.herPlace||'—')}<br>Ifeayomi: ${esc(d.hisPlace||'—')}</div>
    <div class="small muted">${NAMES[d.host]} hosts and pays both bills${d.note?' · '+esc(d.note):''}</div>
    ${d.status!=='done'&&!d.invited&&!(S.msgs||[]).some(m=>m.kind==='plan'&&m.what==='date'&&m.dateId===d.id)?`<button class="btn sm primary" style="margin-top:6px" data-act="dateInvite" data-id="${d.id}">Send invite 💌</button>`:''}</div>
    ${d.status!=='done'?`<button class="btn sm" data-act="dateDone" data-id="${d.id}">Done</button>`:''}</div>`;
  const pins=S.mood.filter(p=>p.month===mk).sort((a,b)=>a.at-b.at);
  return `
  <section class="card" id="pNotes">
    <div class="row between"><span class="eyebrow">${monthName(mk)} planning date</span>${status}</div>
    <div class="row">${av(host,48)}<h2>${host===me?'You host this month':NAMES[host]+' hosts this month'}</h2></div>
    <ol class="small" style="margin:0;padding-left:18px;color:var(--muted)"><li>How last month went: wins and what to improve</li><li>Plan next month: goals, visits, money, to-dos</li><li>Update the year plan</li><li>Book this month's date night</li></ol>
    <label class="f" for="mNotes">Planning notes<textarea id="mNotes" placeholder="What we decided…">${esc(m.notes||'')}</textarea></label>
    <div class="row"><button class="btn sm" data-act="saveNotes">Save notes</button>${m.done?'':`<button class="btn sm primary" data-act="planDone">Mark planning date done</button>`}</div>
  </section>
  <section class="card" id="pTodos"><span class="eyebrow">This month's to-dos</span>${todoRemindLine()&&todos.some(x=>!x.done&&x.owner===me)?`<div class="todorem">⏰ ${esc(todoRemindLine())}</div>`:''}
    <ul class="list">${todos.map(x=>`<li class="item ${x.done?'done':''}"><button class="check ${x.done?'on':''}" data-act="todo" data-id="${x.id}" aria-label="Done"></button>${av(x.owner,26)}<span class="grow">${esc(x.t)}</span><button class="x" data-act="todoDel" data-id="${x.id}" aria-label="Delete">×</button></li>`).join('')||'<li class="small muted">Nothing planned yet.</li>'}</ul>
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="todoIn" placeholder="Add a to-do"><select id="todoOwner" style="width:auto"><option value="${me}">Me</option><option value="${other(me)}">${NAMES[other(me)]}</option></select><button class="btn sm" data-act="todoAdd">Add</button></div>
  </section>
  <section class="card" id="pDates">
    <div class="row between"><h2>Date nights</h2><button class="btn sm primary" data-act="dateSheet">Plan one</button></div>
    <p class="small muted" style="margin:0">Same time, two cities. You both go out, stay on a call, and the host pays both bills.</p>
    ${up.length?up.map(dateItem).join(''):'<p class="small muted" style="margin:0">No date night booked yet.</p>'}
    ${past.length?`<span class="eyebrow">Recent</span>${past.map(dateItem).join('')}`:''}
  </section>
  <section class="card" id="pGoals"><span class="eyebrow">${t.slice(0,4)} goals</span>
    <ul class="list">${goals.map(x=>`<li class="item ${x.done?'done':''}"><button class="check ${x.done?'on':''}" data-act="goal" data-id="${x.id}" aria-label="Done"></button><span class="grow">${esc(x.t)}</span><button class="x" data-act="goalDel" data-id="${x.id}" aria-label="Delete">×</button></li>`).join('')||'<li class="small muted">Add the big things you want this year.</li>'}</ul>
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="goalIn" placeholder="e.g. Visit twice, grow the farm to 10 pigs"><button class="btn sm" data-act="goalAdd">Add</button></div>
  </section>
  <section class="card" id="pMood"><span class="eyebrow">${monthName(mk)} mood board</span>
    <div class="mood">${pins.map(p=>`<div class="pin">${p.img?`<img src="${p.img}" alt="">`:esc(p.text)}</div>`).join('')||'<p class="small muted" style="margin:0">Pin words or photos for how this month should feel.</p>'}</div>
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="moodIn" placeholder="A word, a quote, a feeling"><button class="btn sm" data-act="moodAdd">Pin</button></div>
    <label class="btn sm" style="align-self:flex-start" for="moodImg">Pin a photo</label><input type="file" id="moodImg" accept="image/*" hidden>
  </section>`;
}

/* ---------- TRUTH ---------- */
function truthView(){
  const me=S.role,you=other(me);
  const inbox=S.truths.filter(x=>x.to===me).sort((a,b)=>b.at-a.at),sent=S.truths.filter(x=>x.from===me).sort((a,b)=>b.at-a.at);
  const weekCount=sent.filter(x=>x.kind!=='appr'&&Date.now()-x.at<7*864e5).length;
  const card=(x,mine)=>{const advice=(x.advice||[]).filter(Boolean);let foot='';
    if(!mine&&x.kind!=='appr')foot=x.status==='sent'?`<div class="row"><button class="btn sm teal" data-act="respond" data-id="${x.id}" data-s="Noted">Noted</button><button class="btn sm" data-act="respond" data-id="${x.id}" data-s="Let's talk">Let's talk</button><button class="btn sm" data-act="respond" data-id="${x.id}" data-s="I'm working on it">I'm working on it</button></div>`:`<span class="chip him">You said: ${esc(x.status)}</span>`;
    if(mine&&x.kind!=='appr'){foot=x.status==='sent'?`<span class="chip">Not answered yet</span>`:`<span class="chip him">${NAMES[you]}: ${esc(x.status)}</span>`;
      if(x.status!=='sent'&&!x.followup&&Date.now()-x.at>14*864e5)foot+=`<div class="row small"><span class="muted">Has this got better?</span><button class="btn sm" data-act="follow" data-id="${x.id}" data-v="Better">Yes</button><button class="btn sm" data-act="follow" data-id="${x.id}" data-v="Not yet">Not yet</button></div>`;
      if(x.followup)foot+=` <span class="chip gold">${esc(x.followup)}</span>`;}
    return `<div class="truth ${x.kind==='appr'?'appr':''}"><div class="row between"><div class="row">${av(x.from,28)}<span class="eyebrow">${x.kind==='appr'?'Appreciation':'Truth'} · ${mine?'to '+NAMES[you]:'from '+NAMES[x.from]}</span></div><span class="small muted">${ago(x.at)}</span></div>
      <div>${esc(x.filtered)}</div>${advice.length&&!mine?`<div class="small"><b>What would help</b><ul>${advice.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>`:''}${foot}</div>`;};
  const d=S.truthDraft;
  const composer=d?`<div class="banner">Only you ever see your raw words. This is what ${NAMES[you]} will get. Edit anything before sending.</div>
    <label class="f" for="tFiltered">Message<textarea id="tFiltered" style="min-height:120px">${esc(d.filtered)}</textarea></label>
    <label class="f" for="tAdvice">What would help (one per line)<textarea id="tAdvice">${esc((d.advice||[]).join('\n'))}</textarea></label>
    <div class="row"><button class="btn primary" data-act="truthSend">Send to ${NAMES[you]}</button><button class="btn" data-act="truthRetry">Try again</button><button class="btn ghost" data-act="truthCancel">Cancel</button></div>`
    :`<label class="f" for="tRaw">Say it raw. Nobody sees this version but you.<textarea id="tRaw" style="min-height:120px" placeholder="What's really on your heart?"></textarea></label>
    <div class="row"><button class="btn primary" data-act="truthFilter" ${weekCount>=3||S.truthBusy?'disabled':''}>${S.truthBusy?'Softening…':'Make it kind'}</button><button class="btn" data-act="apprSend">Send as appreciation</button></div>
    <p class="small muted" style="margin:0">${weekCount}/3 truths this week. Appreciations are unlimited.</p>`;
  return `<section class="card"><div class="row">${av(me,44)}<div><h2>Truth Corner</h2><div class="small muted">Say it straight. Pods keeps the point, takes out the heat, and adds what would help.</div></div></div>${composer}</section>
  <section class="card"><span class="eyebrow">For you</span>${inbox.length?inbox.map(x=>card(x,false)).join(''):'<p class="small muted" style="margin:0">Nothing yet.</p>'}</section>
  ${sent.length?`<section class="card"><span class="eyebrow">You sent</span>${sent.slice(0,10).map(x=>card(x,true)).join('')}</section>`:''}`;
}

/* ---------- GALLERY ---------- */
function galleryList(){const f=S.galFilter||'all';return S.memories.filter(m=>f==='all'||(f==='puzzle'?m.kind==='puzzle':m.by===f&&m.kind!=='puzzle'));}
const memThumb=m=>m.thumb||m.img||(m.photo?thumbURL(m.photo):'');
function usView(){
  const me=S.role,you=other(me),items=(S.wish&&S.wish.items)||[],list=galleryList(),f=S.galFilter||'all';
  const forMe=S.letters.filter(l=>l.to===me).sort((a,b)=>b.at-a.at),fromMe=S.letters.filter(l=>l.from===me);
  const fb=(k,l)=>`<button class="${f===k?'on':''}" data-act="galFilter" data-k="${k}">${l}</button>`;
  return `
  <section class="card"><div class="row between"><div><h2>Our gallery</h2><div class="small muted">${S.memories.length} photo${S.memories.length===1?'':'s'} · every picture you upload lands here</div></div><label class="btn primary" for="memImg">Add photos</label><input type="file" id="memImg" accept="image/*" multiple hidden></div>
    <div class="seg">${fb('all','All')}${fb('anthonia','Anthonia')}${fb('ifeayomi','Ifeayomi')}${fb('puzzle','Puzzles')}</div>
    ${list.length?`<div class="gal">${list.map(m=>`<button class="ph" data-act="lightbox" data-id="${m.id}" aria-label="${esc(m.caption||'Open photo')}"><img src="${memThumb(m)}" alt="" loading="lazy"><span class="dot ${m.by}"></span>${m.kind==='puzzle'?'<span class="tag">Puzzle</span>':''}</button>`).join('')}</div>`
      :`<div class="empty">${HEART}<p class="muted" style="margin:0">No photos here yet. Add your favourite pictures of the two of you.</p></div>`}
  </section>
  <section class="card"><span class="eyebrow">Shared wishlist</span>
    <ul class="list">${items.map(x=>`<li class="item ${x.done?'done':''}"><button class="check ${x.done?'on':''}" data-act="wish" data-id="${x.id}" aria-label="Done"></button>${av(x.by,26)}<span class="grow">${esc(x.t)}</span><button class="x" data-act="wishDel" data-id="${x.id}" aria-label="Delete">×</button></li>`).join('')||"<li class=\"small muted\">Things to do together, gifts you'd love.</li>"}</ul>
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="wishIn" placeholder="e.g. Dinner by the sea in Ancona"><button class="btn sm" data-act="wishAdd">Add</button></div>
  </section>
  <section class="card"><div class="row between"><h2>Open-when letters</h2><button class="btn sm" data-act="letterSheet">Write one</button></div>
    ${forMe.length?forMe.map(l=>`<div class="item">${av(l.from,34)}<span class="grow"><b>${esc(l.when)}</b><br><span class="small muted">from ${NAMES[l.from]}</span></span><button class="btn sm ${l.opened?'':'primary'}" data-act="openLetter" data-id="${l.id}">${l.opened?'Read again':'Open'}</button></div>`).join(''):'<p class="small muted" style="margin:0">No letters for you yet.</p>'}
    ${fromMe.length?`<p class="small muted" style="margin:0">You've written ${fromMe.length} for ${NAMES[you]} · ${fromMe.filter(l=>l.opened).length} opened</p>`:''}
  </section>`;
}
function homeGallery(){const l=S.memories.slice(0,6);return `<section class="card"><div class="row between"><span class="eyebrow">Our gallery</span><button class="btn sm ghost" data-act="tab" data-k="us">Open gallery ›</button></div>
  ${l.length?`<div class="strip">${l.map(m=>`<button class="ph" data-act="lightbox" data-id="${m.id}" aria-label="Open photo"><img src="${memThumb(m)}" alt="" loading="lazy"></button>`).join('')}</div>`:`<label class="locked" for="memImg2" style="cursor:pointer">${HEART.replace('<svg','<svg width="20" height="20" style="color:var(--her)"')} Add your first photo together</label><input type="file" id="memImg2" accept="image/*" multiple hidden>`}</section>`;}
/* lightbox */
async function openLightbox(id){
  const list=galleryList().length&&galleryList().some(m=>m.id===id)?galleryList():S.memories;const idx=list.findIndex(m=>m.id===id);if(idx<0)return;const m=list[idx];
  S.lb={id,list:list.map(x=>x.id)};
  let el=document.getElementById('lb');if(!el){el=document.createElement('div');el.id='lb';el.className='lb';document.body.appendChild(el);}
  el.innerHTML=`<div class="lbTop"><div class="row">${av(m.by,32)}<div><b>${NAMES[m.by]||''}</b><div class="small" style="opacity:.75">${m.at?new Date(m.at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):''}</div></div></div><button class="x" data-act="lbClose" aria-label="Close" style="color:#fff">×</button></div>
   <div class="lbImg"><img id="lbImg" src="${memThumb(m)}" alt="${esc(m.caption||'')}"></div>
   <div class="lbCap">${m.caption?esc(m.caption):'<span style="opacity:.6">No caption</span>'}</div>
   <div class="row" style="justify-content:center;gap:8px"><button class="btn sm" data-act="lbNav" data-d="-1" aria-label="Previous">‹</button><button class="btn sm primary" data-act="lbPuzzle">Make a puzzle</button><button class="btn sm" data-act="lbCaption">Caption</button>${m.by===S.role?`<button class="btn sm" data-act="lbDel">Delete</button>`:''}<button class="btn sm" data-act="lbNav" data-d="1" aria-label="Next">›</button></div>`;
  el.classList.add('on');
  const full=await fullImage(m);const im=document.getElementById('lbImg');if(full&&im&&S.lb&&S.lb.id===id)im.src=full;
}
async function fullImage(m){if(m.photo)return photoURL(m.photo);if(m.img)return m.img;const d=await getDoc('photos/'+m.id);return d&&d.img?d.img:memThumb(m);}
let swX=null,swY=null,swEl=null;
document.addEventListener('touchstart',e=>{const m=e.target.closest('#chatList .msg');if(!m)return;swEl=m;swX=e.touches[0].clientX;swY=e.touches[0].clientY;},{passive:true});
document.addEventListener('touchmove',e=>{if(!swEl)return;const dx=e.touches[0].clientX-swX,dy=Math.abs(e.touches[0].clientY-swY);if(dy>30){swEl.style.transform='';swEl=null;return;}if(dx>0)swEl.style.transform=`translateX(${Math.min(dx,80)}px)`;},{passive:true});
document.addEventListener('touchend',e=>{if(!swEl)return;const dx=e.changedTouches[0].clientX-swX,el=swEl;swEl=null;el.style.transform='';if(dx>60){const m=(S.msgs||[]).find(x=>x.id===el.dataset.id);if(m){S.replyTo={id:m.id,by:m.by,text:snippet(m)};render(true);const i=document.getElementById('chatIn');if(i)i.focus();}}});
let lbX=null;
document.addEventListener('touchstart',e=>{if(e.target.closest('#lb .lbImg'))lbX=e.touches[0].clientX;},{passive:true});
document.addEventListener('touchend',e=>{if(lbX===null)return;const dx=e.changedTouches[0].clientX-lbX;lbX=null;if(Math.abs(dx)>50)lbNav(dx<0?1:-1);});
function lbNav(d){if(!S.lb)return;const i=S.lb.list.indexOf(S.lb.id);const n=S.lb.list[(i+d+S.lb.list.length)%S.lb.list.length];if(n)openLightbox(n);}
function closeLb(){const el=document.getElementById('lb');if(el)el.classList.remove('on');S.lb=null;}
/* saving pictures */
async function compressPhoto(im){let max=1600,q=.84,out='';for(let k=0;k<8;k++){out=fitMax(im,max,q);if(out.length<235000)return out;if(q>.6)q-=.1;else{max=Math.round(max*.8);q=.78;}}return out;}
async function saveToGallery({thumb,img,photo,caption,kind}){const id=Date.now().toString(36)+uidGen();
  if(img)await setDoc('photos/'+id,{img});await setDoc('memories/'+id,{thumb:thumb||'',photo:photo||null,caption:caption||'',by:S.role,kind:kind||'photo',at:Date.now()});return id;}
async function uploadFiles(files,caption,kind){let n=0;for(const file of files){try{const url=URL.createObjectURL(file);const im=await loadImg(url);URL.revokeObjectURL(url);
    await saveToGallery({thumb:cropTo(im,320,320,.74),img:await compressPhoto(im),caption,kind});n++;}catch(e){}}
  if(n){floatHearts();toast(n===1?'Saved to the gallery':`${n} photos saved to the gallery`);}else toast("That photo couldn't be opened. Try another one.");return n;}

/* ---------- AI (Truth Corner): each phone keeps its own key, like Parla ---------- */
const AIK='pods_ai';
function aiCfg(){try{return JSON.parse(localStorage.getItem(AIK)||'{}');}catch(e){return {};}}
function tfetch(url,o,ms){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms||40000);return fetch(url,Object.assign({},o,{signal:c.signal})).finally(()=>clearTimeout(t));}
async function aiJSON(prompt){const cfg=aiCfg();if(!cfg.key)throw{code:'no_key'};let text='';
  if(/^sk-ant/.test(cfg.key)){const r=await tfetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':cfg.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-5-5',max_tokens:900,messages:[{role:'user',content:prompt}]})});
    const j=await r.json().catch(()=>({}));if(!r.ok)throw{code:r.status===401?'bad_key':'api'};text=(j.content||[]).map(c=>c.text||'').join('');}
  else{let last=null;for(const m of [cfg.model,'gemini-flash-latest','gemini-2.5-flash','gemini-2.0-flash'].filter(Boolean)){
      const r=await tfetch('https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent?key='+encodeURIComponent(cfg.key),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:.7}})});
      const j=await r.json().catch(()=>({}));if(r.ok){if(cfg.model!==m){cfg.model=m;localStorage.setItem(AIK,JSON.stringify(cfg));}text=((j.candidates||[])[0]?.content?.parts||[]).map(p=>p.text||'').join('');last=null;break;}
      last={code:(r.status===400||r.status===403)?'bad_key':r.status===429?'busy':'api'};if(r.status!==404)break;}
    if(last)throw last;}
  const m=text.match(/\{[\s\S]*\}/);return JSON.parse(m?m[0]:text);}
function settingsSheet(){const cfg=aiCfg();openSheet(`${sheetHead('Settings')}
  <span class="eyebrow">Our Pod</span>
  <div class="item"><div class="grow">Invite code<br><b style="font-family:var(--display);font-size:1.4rem;letter-spacing:.12em">${esc(S.podId||'—')}</b></div><button class="btn sm" data-act="copyCode">Copy</button></div>
  <p class="small muted" style="margin:0">The other person signs in at this same link, picks their name and types this code.</p>
  <span class="eyebrow">Truth Corner AI</span>
  <label class="f" for="aiKey">Paste a free Gemini key (aistudio.google.com/apikey) or a Claude key. It stays on this phone only.<input type="text" id="aiKey" value="${esc(cfg.key||'')}" placeholder="AIza… or sk-ant-…" autocomplete="off"></label>
  <div class="row"><button class="btn primary sm" data-act="aiSave">Save key</button>${cfg.key?'<button class="btn sm" data-act="aiClear">Remove key</button>':''}</div>
  <span class="eyebrow">Names</span>
  <div class="item"><div class="grow">You call ${BASE_NAMES[other(S.role)]}<br><b>${esc(NAMES[other(S.role)])}</b></div><button class="btn sm" data-act="nickOpen">Change</button></div>
  <div class="item">${av(other(S.role),32)}<div class="grow">${esc(NAMES[other(S.role)])} calls you<br><b>${esc(theirNick()||BASE_NAMES[S.role])}</b>${theirNick()?"":' <span class="small muted">(hasn\'t picked a name yet)</span>'}</div></div>
  ${!widgetPlugin()&&"Notification" in window&&navigator.setAppBadge?`<span class="eyebrow">App icon</span><div class="item"><span class="grow small">Show a number on the Pods icon when messages or game turns are waiting</span>${Notification.permission==="granted"?'<span class="chip him">On</span>':'<button class="btn sm primary" data-act="badgeOn">Turn on</button>'}</div>`:""}
  <span class="eyebrow">Account</span>
  <div class="item"><span class="grow small">${esc(S.email||'')}</span><button class="btn sm" data-act="signOut">Sign out</button></div>`);}
/* ---------- voice notes (MediaRecorder → small audio saved with the note) ---------- */
let rec=null;
async function startRec(onDone){
  if(!navigator.mediaDevices||!window.MediaRecorder)return toast("This phone's browser can't record here.");
  let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true});}catch(e){return toast('Allow the microphone to record a voice note.');}
  const type=['audio/mp4;codecs=mp4a.40.2','audio/mp4','audio/aac','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||'';
  const mr=new MediaRecorder(stream,type?{mimeType:type,audioBitsPerSecond:32000}:{});const chunks=[];const t0=Date.now();
  mr.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  mr.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:mr.mimeType||'audio/webm'});const secs=Math.round((Date.now()-t0)/1000);rec=null;render(true);if(Date.now()-t0<800||!blob.size)return toast('Hold on a little longer to record.');
    if(blob.size>700000)return toast('That voice note is too long. Keep it under a minute.');const fr=new FileReader();fr.onload=()=>onDone(fr.result,secs);fr.readAsDataURL(blob);};
  mr.start();rec={mr,t0,timer:setTimeout(()=>{if(mr.state==='recording')mr.stop();},60000)};render(true);}
function stopRec(){if(rec&&rec.mr.state==='recording'){clearTimeout(rec.timer);rec.mr.stop();}}

/* ---------- nicknames: each of you picks what you call the other ---------- */
const BASE_NAMES={...NAMES};
function theirNick(){const n=S.couple&&S.couple.nick&&S.couple.nick[other(S.role)];return n&&String(n).trim()?String(n).trim():'';}
function applyNick(){if(!S.role)return;const you=other(S.role),n=S.couple&&S.couple.nick&&S.couple.nick[S.role];NAMES[you]=(n&&String(n).trim())||BASE_NAMES[you];NAMES[S.role]=theirNick()||BASE_NAMES[S.role];}
function nickSheet(first){const you=other(S.role),cur=(S.couple&&S.couple.nick&&S.couple.nick[S.role])||'';
  openSheet(`${sheetHead(first?'One quick thing':'What you call '+BASE_NAMES[you])}<div class="row" style="justify-content:center">${av(you,84)}</div>
  <label class="f" for="nickIn">What do you call ${BASE_NAMES[you]}? This is the name you'll see all over Pods.<input type="text" id="nickIn" maxlength="24" value="${esc(cur)}" placeholder="e.g. ${you==='anthonia'?'My Queen, Toni, Baby':'Yinka, Ife, My King'}"></label>
  <button class="btn primary" data-act="nickSave">Save</button>${first?`<button class="btn ghost" data-act="nickSkip">Keep "${BASE_NAMES[you]}"</button>`:''}`);}
function maybeAskNick(){if(S.nickAsked||!S.role||!S.gotCouple||!['live','demo'].includes(S.mode))return;if(S.couple&&S.couple.nick&&S.couple.nick[S.role]!==undefined)return;
  if(!document.getElementById('sheet').classList.contains('hidden'))return;S.nickAsked=true;setTimeout(()=>nickSheet(true),500);}

/* ---------- 9pm check-in ---------- */
const MOODS_DAY=[['Amazing','#22b3a3'],['Happy','#7bd389'],['Okay','#ffd166'],['Tired','#9aa5b1'],['Missing you','#ff7fb0'],['Sad','#6c8cff'],['Stressed','#ff8a3d']];
const localDay=()=>new Date().toLocaleDateString('en-CA');
function maybeCheckin(){let asked='';try{asked=localStorage.getItem('pods_ciAsked')||'';}catch(e){}if(!S.role||!['live','demo'].includes(S.mode)||S.checkinShown===localDay()||asked===localDay())return;if(new Date().getHours()<21)return;
  if((S.checkins||[]).some(c=>c.role===S.role&&c.date===localDay()))return;if(!document.getElementById('sheet').classList.contains('hidden'))return;
  S.checkinShown=localDay();try{localStorage.setItem('pods_ciAsked',localDay());}catch(e){}checkinSheet();}
function checkinSheet(){S.ciMood=S.ciMood||null;openSheet(`${sheetHead('Good evening, '+NAMES[S.role])}<div class="row" style="justify-content:center">${av(S.role,70)}</div>
  <label class="f" for="ciDay">How was your day?<textarea id="ciDay" placeholder="Tell ${NAMES[other(S.role)]} about it…"></textarea></label>
  <span class="eyebrow">How do you feel right now?</span><div class="moods">${MOODS_DAY.map(([m,c])=>`<button class="mood ${S.ciMood===m?'on':''}" style="--mc:${c}" data-act="ciMood" data-m="${m}">${m}</button>`).join('')}</div>
  <button class="btn primary" data-act="ciSend">Send to ${NAMES[other(S.role)]}</button><button class="btn ghost" data-act="close">Later</button>`);}
function checkinCard(){const d=localDay(),c=(S.checkins||[]).filter(x=>x.date===d);if(!c.length&&new Date().getHours()<21)return '';
  const row=r=>{const x=c.find(y=>y.role===r);return x?`<div class="bubble ${r}">${av(r,34)}<div class="b"><div class="who2">${r===S.role?'You':NAMES[r]} · <span class="moodtag" style="--mc:${(MOODS_DAY.find(m=>m[0]===x.mood)||[,'#ccc'])[1]}">${esc(x.mood||'')}</span></div>${esc(x.day||'')}</div></div>`:`<div class="locked">${av(r,26)} ${r===S.role?`<span>You haven't checked in yet.</span> <button class="btn sm primary" data-act="ciOpen">Check in</button>`:`Waiting for ${NAMES[r]}'s check-in…`}</div>`;};
  return `<section class="card"><span class="eyebrow">Tonight's check-in</span>${row(S.role)}${row(other(S.role))}</section>`;}

/* ---------- chat ---------- */
function unreadCount(){const me=S.role,last=(S.chatRead||{})[me]||0;return (S.msgs||[]).filter(m=>m.by!==me&&m.at>last).length;}
function chatView(){const me=S.role,you=other(me),list=[...(S.msgs||[])].sort((a,b)=>a.at-b.at);let lastDay='';const pr=partnerPresence();
  const myLast=[...list].reverse().find(m=>m.by===me&&m.kind!=='news');
  const items=list.map(m=>{const day=new Date(m.at).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});const sep=day!==lastDay?`<div class="daysep">${day}</div>`:'';lastDay=day;
    const t=new Date(m.at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(m.kind==='news')return `${sep}<div class="newspill">${esc(newsText(m))}</div>`;
    if(m.kind==='letter'){const L=S.letters.find(x=>x.id===m.letterId),op=L&&L.opened;return `${sep}<div class="msg plan ${m.by===me?'me':'them'}" id="m-${m.id}" data-id="${m.id}"><button class="envmini" data-act="openLetter" data-id="${m.letterId}" ${m.by===me?'disabled':''}><span class="em">💌</span><span class="grow"><b>${m.by===me?'You sent a sealed letter':esc(NAMES[m.by])+' sent you a sealed letter'}</b><br><span class="small">${esc(m.when||'')}</span><br><span class="small">${m.by===me?(op?'Opened 💖':'Not opened yet'):(op?'Tap to read again':'Tap to open')}</span></span></button><span class="mt">${t}</span></div>`;}
    if(m.kind==='plan')return `${sep}<div class="msg plan ${m.by===me?'me':'them'}" id="m-${m.id}" data-id="${m.id}">${planCard(m,me)}<span class="mt">${t}</span></div>`;
    let body=m.kind==='voice'?voicePlayer(m.src,m.secs,'c'+m.id):m.kind==='photo'?`<img src="${m.img}" alt="Photo" class="chatimg">`:m.kind==='checkin'?`<div class="small"><b>Evening check-in</b> · <span class="moodtag" style="--mc:${(MOODS_DAY.find(x=>x[0]===m.mood)||[,'#ccc'])[1]}">${esc(m.mood||'')}</span></div>${esc(m.text||'')}`:esc(m.text);
    const q=m.reply?`<button class="quote" data-act="chatJump" data-id="${m.reply.id}"><b>${m.reply.by===me?'You':esc(NAMES[m.reply.by])}</b><span>${esc(m.reply.text||'')}</span></button>`:'';
    return `${sep}<div class="msg ${m.by===me?'me':'them'}" id="m-${m.id}" data-id="${m.id}">${q}<div class="mb" data-act="chatMenu" data-id="${m.id}" role="button" tabindex="0">${body}${m.heart?`<span class="mheart">${HEART}</span>`:''}</div><span class="mt">${t}${m===myLast?' · '+msgStatus(m):''}</span></div>`;}).join('');
  const peek=pr.on&&pr.where==='chat'?`<div class="peek">${av(you,42)}${pr.typing?'<span class="typing"><i></i><i></i><i></i></span>':''}</div>`:'';
  const rp=S.replyTo?`<div class="replybar"><div><b>Replying to ${S.replyTo.by===me?'yourself':esc(NAMES[S.replyTo.by])}</b><span>${esc(S.replyTo.text)}</span></div><button class="x" data-act="replyCancel" aria-label="Cancel reply">×</button></div>`:'';
  return `<section class="card chatcard"><div class="row"><span class="pav ${pr.on?'on':''}">${av(you,42)}</span><div><h2>${esc(NAMES[you])}</h2><div class="small ${pr.on?'onl':'muted'}" id="presText">${pr.typing?'typing…':esc(pr.text||'Tap a message to reply or send a heart')}</div></div></div>
    <div class="chatlist" id="chatList">${items||`<div class="empty">${HEART}<p class="muted" style="margin:0">Say hi to ${esc(NAMES[you])}!</p></div>`}${peek}</div>
    ${rec&&S.recFor==='chat'?`<div class="locked" style="color:var(--her)"><span class="dot anthonia" style="animation:beat 1s infinite"></span> Recording… <button class="btn sm primary" data-act="recStop">Stop and send</button></div>`:''}
    ${rp}<div class="chatbar"><label class="cbtn" for="chatImg" aria-label="Send a photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M21 16l-5-5-8 8"/></svg></label><input type="file" id="chatImg" accept="image/*" hidden>
      <button class="cbtn" data-act="recStart" data-k="chat" aria-label="Record a voice note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>
      <input type="text" id="chatIn" placeholder="Message ${esc(NAMES[you])}" autocomplete="off" enterkeyhint="send"><button class="btn primary sm" data-act="chatSend">Send</button></div></section>`;}
function chatAfterRender(){if(S.tab!=='chat')return;const l=document.getElementById('chatList');if(l)l.scrollTop=l.scrollHeight;const me=S.role,newest=Math.max(0,...(S.msgs||[]).filter(m=>m.by!==me).map(m=>m.at));
  if(newest>((S.chatRead||{})[me]||0)&&S.markingRead!==newest){S.markingRead=newest;mergeDoc('pods/chatread',{[me]:newest});}}
/* Plan updates show up in chat as cards with a button to jump to them */
async function planPost(what,data){try{await sendMsg({kind:'plan',what,...data});}catch(e){}}
function planWho(m,me){return m.by===me?'You':NAMES[m.by];}
function planSnippet(m,me){me=me||S.role;const w=planWho(m,me),mk=m.month?monthName(m.month):'this month',o=m.owner===me?'you':m.owner===m.by?(m.by===me?'yourself':'themself'):NAMES[m.owner];
  return ({date:m.by===me?`You asked ${NAMES[other(me)]} out on a date`:`${NAMES[m.by]} is asking you out on a date…`,
    todo:`${w} added a to-do for ${o}: ${m.text||''}`,todoDone:`${w} ticked off: ${m.text||''}`,notes:`${w} updated the ${mk} planning notes`,
    planDone:`${w} marked the ${mk} planning date done`,goal:`${w} added a goal: ${m.text||''}`,mood:`${w} pinned to the ${mk} mood board${m.text?': '+m.text:''}`,
    dateDone:`${w} marked your date night done${m.text?': '+m.text:''}`})[m.what]||`${w} updated the plan`;}
const PLAN_ICON={todo:'📝',todoDone:'✅',notes:'🗒️',planDone:'🎉',goal:'🎯',mood:'🌸',dateDone:'💞'};
const PLAN_SEC={todo:'pTodos',todoDone:'pTodos',notes:'pNotes',planDone:'pNotes',goal:'pGoals',mood:'pMood',dateDone:'pDates',date:'pDates'};
function planCard(m,me){
  if(m.what==='date'){const mine=m.by===me,d=m.d||{};
    return `<div class="datecard"><div class="dhearts">${HEART}${HEART}${HEART}</div><div class="dkick">${mine?'You asked':'Psst…'}</div>
      <div class="dhead">${mine?`${esc(NAMES[other(me)])} out on a date`:`${esc(NAMES[m.by])} is asking you out on a date…`}</div>
      <div class="dwhen">${esc(prettyDay(d.date||''))} · ${esc(d.time||'')} Ancona · ${esc(ibadanTime(d.date,d.time))} Ibadan</div>
      ${d.herPlace||d.hisPlace?`<div class="small">${esc(NAMES.anthonia)}: ${esc(d.herPlace||'to be decided')}<br>${esc(NAMES.ifeayomi)}: ${esc(d.hisPlace||'to be decided')}</div>`:''}
      <div class="small">${d.host===me?'You host and pay both bills':esc(NAMES[d.host])+' hosts and pays both bills'}</div>
      <div class="row" style="justify-content:center;margin-top:6px">${!mine&&!m.yes?`<button class="btn sm primary" data-act="dateYes" data-id="${m.id}">Say yes 💖</button>`:''}${m.yes?`<span class="chip him">${mine?NAMES[other(me)]+' said yes!':'You said yes'} 💖</span>`:''}<button class="btn sm" data-act="planGo" data-k="pDates">See the date</button></div></div>`;}
  return `<div class="plancard"><span class="pi">${PLAN_ICON[m.what]||'📅'}</span><div class="grow">${esc(planSnippet(m,me))}</div><button class="btn sm" data-act="planGo" data-k="${PLAN_SEC[m.what]||'pNotes'}">View</button></div>`;}
/* Surprise letters Claude placed for one of you; created in the pod the first time that person opens Pods */
const SURPRISES=[{id:'mensday2026',from:'anthonia',to:'ifeayomi',when:"A little something for you 💌",
  toName:"Ifeayotemi",body:"Ifeayotemi, my love,\n\nHappy belated International Men's Day! I'm sorry I missed it yesterday. That one is on me. Please forgive me, my love 🥺 I'm making it up to you.\n\nYou work so hard, you take care of me from miles away, and you never stop pushing for us. I'm so proud of the man you are.\n\nOne day isn't enough to celebrate you, so consider this your Men's Day extension. Tomorrow's jollof is on me 🍛",
  cheque:{amount:'₦3,500',words:'Three thousand five hundred naira only',memo:"The best jollof rice in Ibadan, tomorrow 🍛"}}];
async function seedSurprises(){if(!S.lettersReady||S.seeded)return;S.seeded=true;
  for(const x of SURPRISES){if(x.to!==S.role&&x.from!==S.role)continue;const ex=(S.letters||[]).find(l=>l.id===x.id);if(ex){if(!ex.opened&&(ex.body!==x.body||ex.toName!==x.toName||ex.when!==x.when)){try{await mergeDoc('letters/'+x.id,{body:x.body,toName:x.toName||null,when:x.when});await mergeDoc('messages/'+x.id,{when:x.when});}catch(e){}}continue;}const at=Date.now();
    try{await setDoc('letters/'+x.id,{from:x.from,to:x.to,toName:x.toName||null,when:x.when,body:x.body,cheque:x.cheque,pop:true,opened:false,at});await setDoc('messages/'+x.id,{by:x.from,at,kind:'letter',letterId:x.id,when:x.when});}catch(e){}}}
function chequeHtml(c,l){return c?`<div class="cheque"><div class="chtop"><b>Bank of Love</b><span>${esc(new Date(l.at||Date.now()).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}))}</span></div>
  <div class="chrow"><span>Pay</span><b>${esc(l.toName||NAMES[l.to])}</b></div><div class="chrow"><span>The sum of</span><i>${esc(c.words)}</i></div>
  <div class="chamt">${esc(c.amount)}</div><div class="chrow"><span>For</span><i>${esc(c.memo)}</i></div><div class="chsign">${esc(NAMES[l.from])}</div></div>`:'';}
/* Envelope surprise: a sealed letter he opens by breaking the seal */
function showEnvelope(l){closeSheet();const old=document.getElementById('envOv');if(old)old.remove();S.envShown=l.id;
  const ov=document.createElement('div');ov.id='envOv';ov.className='envov';
  ov.innerHTML=`<button class="x envx" aria-label="Close">×</button><div class="envtitle">${esc(l.when)}</div>
    <div class="envelope"><div class="eback"></div><div class="paper"><div class="pfrom">From ${esc(NAMES[l.from])} ${HEART}</div><div class="pbody">${esc(l.body)}</div>${chequeHtml(l.cheque,l)}<div class="psign">Love, ${esc(NAMES[l.from])}</div></div>
      <div class="efront"><span>For ${esc(l.toName||NAMES[l.to])}</span></div><div class="eflap"></div><button class="seal" aria-label="Break the seal">${HEART}</button></div>
    <div class="envhint">Tap the heart seal to open</div>`;
  document.body.appendChild(ov);document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';requestAnimationFrame(()=>ov.classList.add('in'));
  const close=()=>{ov.classList.remove('in');document.documentElement.style.overflow='';document.body.style.overflow='';setTimeout(()=>ov.remove(),400);};
  ov.querySelector('.envx').onclick=close;
  ov.querySelector('.seal').onclick=async()=>{if(ov.classList.contains('open'))return;ov.classList.add('open');try{navigator.vibrate&&navigator.vibrate([30,60,30]);}catch(e){}
    setTimeout(()=>{floatHearts();confetti();},700);setTimeout(()=>{const b=document.createElement('div');b.className='bigpaper';b.innerHTML=ov.querySelector('.paper').innerHTML;ov.appendChild(b);ov.classList.add('read');},1500);
    if(!l.opened&&l.to===S.role){try{await mergeDoc('letters/'+l.id,{opened:true,openedAt:Date.now()});}catch(e){}}};}
function maybeEnvelope(){if(!S.role||!['live','demo'].includes(S.mode))return;seedSurprises();if(document.getElementById('envOv')||!document.getElementById('sheet').classList.contains('hidden'))return;
  const l=(S.letters||[]).filter(x=>x.to===S.role&&!x.opened&&x.pop).sort((a,b)=>a.at-b.at)[0];if(!l||S.envShown===l.id)return;setTimeout(()=>{if(!document.getElementById('envOv'))showEnvelope(l);},600);}
/* Month-end to-do reminder for the person who owns them */
function myOpenTodos(){const m=S.month||{};return (m.todos||[]).filter(x=>!x.done&&x.owner===S.role);}
function daysLeftInMonth(){const t=todayKey(),y=+t.slice(0,4),mo=+t.slice(5,7),d=+t.slice(8);return new Date(y,mo,0).getDate()-d;}
function todoRemindLine(){const n=myOpenTodos().length,left=daysLeftInMonth();if(!n||left>7)return '';
  const mn=monthName(monthKey()).split(' ')[0];return left===0?`Last day of ${mn}! ${n} to-do${n>1?'s':''} still open`:`${n} to-do${n>1?'s':''} to finish before ${mn} ends · ${left} day${left>1?'s':''} left`;}
function maybeTodoRemind(){if(!S.role||!['live','demo'].includes(S.mode)||!S.month)return;const line=todoRemindLine();if(!line)return;
  let seen='';try{seen=localStorage.getItem('pods_todoRem')||'';}catch(e){}if(seen===localDay()||S.todoRemShown===localDay())return;
  if(!document.getElementById('sheet').classList.contains('hidden'))return;S.todoRemShown=localDay();try{localStorage.setItem('pods_todoRem',localDay());}catch(e){}
  const l=myOpenTodos();openSheet(`${sheetHead('⏰ Don\'t forget')}<p style="margin:0"><b>${esc(line)}.</b></p>
    <ul class="list">${l.map(x=>`<li class="item">${av(x.owner,26)}<span class="grow">${esc(x.t)}</span></li>`).join('')}</ul>
    <button class="btn primary" data-act="planGo" data-k="pTodos">Open my to-dos</button>`);}
async function sendMsg(data){const r=S.replyTo;if(r&&data.kind!=='news'&&data.kind!=='plan'){data.reply={id:r.id,by:r.by,text:r.text};S.replyTo=null;}await addDoc('messages',{by:S.role,at:Date.now(),...data});}


/* ---------- Android home-screen widget (only inside the Pods app) ---------- */
let widgetT=null,widgetLast='';
function widgetPlugin(){const C=window.Capacitor;if(!C||!(C.isNativePlatform&&C.isNativePlatform()))return null;try{return (C.Plugins&&C.Plugins.PodsWidget)||(C.registerPlugin&&C.registerPlugin('PodsWidget'))||null;}catch(e){return null;}}
function pushWidget(){if(!S.role||S.mode!=='live'||!widgetPlugin())return;clearTimeout(widgetT);widgetT=setTimeout(async()=>{const P=widgetPlugin();if(!P)return;const me=S.role,you=other(me);
  const ci=(S.checkins||[]).filter(c=>c.role===you).sort((a,b)=>b.at-a.at)[0];const fresh=ci&&Date.now()-ci.at<36*3600e3;
  const lm=(S.msgs||[]).filter(m=>m.by===you&&m.kind!=='news').sort((a,b)=>b.at-a.at)[0];
  const lastMsg=lm?(lm.kind==='voice'?'Sent you a voice note':lm.kind==='photo'?'Sent you a photo':lm.kind==='checkin'?('Day: '+(lm.text||lm.mood||'')):lm.kind==='letter'?'Sent you a sealed letter 💌':lm.kind==='plan'?planSnippet(lm):'"'+(lm.text||'')+'"')+' · '+ago(lm.at):'';
  const turns=[];if(S.jig&&!S.jig.done&&S.jig.turn===me)turns.push('Jigsaw');for(const [id,g] of Object.entries(S.games||{}))if(G[id]&&g&&!g.over&&g.turn===me&&!(G[id].legacy&&G[id].legacy(g)))turns.push(G[id].name);
  const data={name:NAMES[you],mood:fresh?(ci.mood||''):'',nextVisit:(S.couple&&S.couple.nextVisit)||'',lastMsg,turns:turns.join(', ')};
  const key=JSON.stringify(data)+JSON.stringify((S.avatars||{})[you]||{});if(key===widgetLast)return;widgetLast=key;
  try{const im=await loadImg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(avatarSVG(you,(S.avatars||{})[you]).replace('<svg ','<svg width="192" height="192" ')));const c=document.createElement('canvas');c.width=c.height=192;const x=c.getContext('2d');x.beginPath();x.arc(96,96,96,0,7);x.clip();x.drawImage(im,0,0,192,192);data.avatar=c.toDataURL('image/png');}catch(e){}
  try{await P.update(data);}catch(e){}},1500);}


/* ---------- announcements: new look / new name ---------- */
const newsText=m=>{const me=S.role,by=m.by,toYou=by!==me;return m.what==='avatar'?(toYou?`${NAMES[by]} gave you a new look!`:`You gave ${NAMES[other(me)]} a new look`):(toYou?`${NAMES[by]} now calls you "${m.name}"`:`You now call ${NAMES[other(me)]} "${m.name}"`);};
function showNews(list){if(!list.length)return;const me=S.role;try{localStorage.setItem('pods_newsSeen',String(Math.max(...list.map(m=>m.at))));}catch(e){}
  openSheet(`${sheetHead(list.length>1?'While you were away':'Guess what!')}${list.map(m=>`<div class="newsitem">${m.what==='avatar'?`<div class="newsav">${av(me,96)}</div>`:`<div class="newsname">${esc(m.name||'')}</div>`}<p style="margin:0;font-weight:800">${esc(newsText(m))}</p></div>`).join('')}<button class="btn primary" data-act="close">Aww, okay!</button>`);floatHearts();}
function checkNews(prev,list){if(!S.role)return;const me=S.role;let seen=0;try{seen=Number(localStorage.getItem('pods_newsSeen')||0);}catch(e){}
  const known=prev?new Set(prev.map(m=>m.id)):null;const fresh=list.filter(m=>m.kind==='news'&&m.by!==me&&m.at>seen&&(!known||!known.has(m.id))).sort((a,b)=>a.at-b.at);
  if(fresh.length)setTimeout(()=>showNews(fresh),prev?200:900);}

/* ---------- voice notes: reliable play on both phones ---------- */
const VOICE={},VOICE_LEN={};let vAudio=null,vKey=null;
function voicePlayer(src,secs,key){key=key||('v'+Math.abs([...String(src).slice(-40)].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7)));VOICE[key]=src;const playing=vKey===key&&(!!vSrc||(vAudio&&!vAudio.paused));const len=VOICE_LEN[key]||secs;
  return `<div class="vplay"><button class="vbtn" data-act="vPlay" data-k="${key}" aria-label="${playing?'Pause':'Play'} voice note">${playing?'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'}</button><span class="vbar"><i id="vb-${key}" style="width:${vKey===key&&vSrc&&vDur?Math.min(100,(vOff+(vCtx.currentTime-vT0))/vDur*100):vKey===key&&vAudio&&vAudio.duration?vAudio.currentTime/vAudio.duration*100:S.vPaused===key&&vDur?vOff/vDur*100:0}%"></i></span><span class="vt" data-vt="${key}">${len?len+'s':''}</span></div>`;}
let vCtx=null,vSrc=null,vT0=0,vOff=0,vDur=0,vRaf=0;const vBuf={};
function vStop(keepOffset){if(vSrc){try{vSrc.onended=null;vSrc.stop();}catch(e){}vSrc=null;}if(vAudio){vAudio.pause();vAudio=null;}cancelAnimationFrame(vRaf);if(!keepOffset){vKey=null;vOff=0;}}
function vTick(key){const b=document.getElementById('vb-'+key);if(vSrc&&vDur){const t=vOff+(vCtx.currentTime-vT0);if(b)b.style.width=Math.min(100,t/vDur*100)+'%';vRaf=requestAnimationFrame(()=>vTick(key));}}
async function vPlay(key){const src=VOICE[key];if(!src)return;
  if(vKey===key&&vSrc){vOff+=vCtx.currentTime-vT0;vStop(true);S.vPaused=key;render(true);return;}
  if(vKey===key&&vAudio){if(vAudio.paused)vAudio.play().catch(()=>{});else vAudio.pause();render(true);return;}
  if(vKey!==key){vStop();vOff=0;}
  try{vCtx=vCtx||new (window.AudioContext||window.webkitAudioContext)();if(vCtx.state==='suspended')await vCtx.resume();
    let buf=vBuf[key];if(!buf){const ab=await (await fetch(src)).arrayBuffer();buf=await new Promise((res,rej)=>vCtx.decodeAudioData(ab,res,rej));vBuf[key]=buf;}
    const sN=vCtx.createBufferSource();sN.buffer=buf;sN.connect(vCtx.destination);vDur=buf.duration;if(vOff>=vDur)vOff=0;
    sN.onended=()=>{if(vSrc===sN){vStop();S.vPaused=null;render(true);}};sN.start(0,vOff);vSrc=sN;vKey=key;vT0=vCtx.currentTime;S.vPaused=null;
    const tl=document.querySelector(`[data-vt="${key}"]`);VOICE_LEN[key]=Math.round(vDur);render(true);vTick(key);
  }catch(e){ // fall back to the browser's own player
    try{const blob=src.startsWith('data:')?await (await fetch(src)).blob():null;const url=blob?URL.createObjectURL(blob):src;const a=new Audio();a.preload='auto';a.src=url;vAudio=a;vKey=key;
      a.ontimeupdate=()=>{const b=document.getElementById('vb-'+key);if(b&&a.duration&&isFinite(a.duration))b.style.width=(a.currentTime/a.duration*100)+'%';};
      a.onended=()=>{vKey=null;vAudio=null;render(true);};a.onerror=()=>{vKey=null;vAudio=null;render(true);toast("This voice note can't play on this phone. Ask for it to be recorded again.");};
      await a.play();render(true);}catch(e2){vKey=null;vAudio=null;toast("Couldn't play that voice note. Tap again.");render(true);}}}

/* ---------- presence: in the chat, playing a game, or away ---------- */
let presWhere='',presT=0,typingT=null,isTyping=false;
function whereNow(){if(document.hidden)return 'away';if(S.tab==='chat')return 'chat';if(S.tab==='play')return S.game?'game:'+S.game:'play';return S.tab;}
function pushPresence(force){if(!S.role||!['live','demo'].includes(S.mode))return;const w=whereNow(),now=Date.now();if(!force&&w===presWhere&&now-presT<30000)return;presWhere=w;presT=now;
  mergeDoc('pods/presence',{[S.role]:{at:now,where:w,typing:isTyping&&w==='chat'}}).catch(()=>{});}
setInterval(()=>{if(!document.hidden)pushPresence(true);},30000);
document.addEventListener('visibilitychange',()=>pushPresence(true));
function setTyping(on){if(isTyping===on)return;isTyping=on;pushPresence(true);}
function partnerPresence(){const p=(S.presence||{})[other(S.role)];if(!p)return {on:false,text:''};const fresh=Date.now()-p.at<75000&&p.where!=='away';
  const gname=p.where&&p.where.startsWith('game:')?(p.where.slice(5)==='jigsaw'?'the jigsaw':(G[p.where.slice(5)]||{}).name):null;
  return {on:fresh,where:p.where,typing:fresh&&p.typing,text:fresh?(p.where==='chat'?'In the chat with you':gname?'Playing '+gname:p.where==='play'?'In the Game Area':'On Pods now'):'Active '+ago(p.at)};}

/* ---------- delivered / seen, replies ---------- */
function markDelivered(list){if(!S.role)return;const me=S.role,newest=Math.max(0,...list.filter(m=>m.by!==me).map(m=>m.at));const cur=((S.chatRead||{}).deliv||{})[me]||0;
  if(newest>cur&&S.delivering!==newest){S.delivering=newest;mergeDoc('pods/chatread',{deliv:{[me]:newest}}).catch(()=>{});}}
function msgStatus(m){const you=other(S.role),r=S.chatRead||{};if((r[you]||0)>=m.at)return '<span class="tick seen">✓✓ Seen</span>';if(((r.deliv||{})[you]||0)>=m.at)return '<span class="tick">✓✓ Delivered</span>';return '<span class="tick">✓ Sent</span>';}
const snippet=m=>m.kind==='letter'?'Sealed letter':m.kind==='plan'?planSnippet(m):m.kind==='voice'?'Voice note':m.kind==='photo'?'Photo':m.kind==='checkin'?'Evening check-in':String(m.text||'').slice(0,80);

/* ---------- app icon dot/number ---------- */
let badgeLast=-1;
function waitingCount(){const me=S.role;let n=unreadCount();if(S.jig&&!S.jig.done&&S.jig.turn===me)n++;for(const [id,g] of Object.entries(S.games||{}))if(G[id]&&g&&!g.over&&g.turn===me&&!(G[id].legacy&&G[id].legacy(g)))n++;return n;}
function pushBadge(){if(!S.role||S.mode!=='live')return;const n=waitingCount();if(n===badgeLast)return;badgeLast=n;
  try{if(navigator.setAppBadge){n?navigator.setAppBadge(n).catch(()=>{}):navigator.clearAppBadge().catch(()=>{});}}catch(e){}
  const P=widgetPlugin();if(P&&P.setBadge){P.setBadge({count:n}).catch(()=>{});}}

/* ---------- scoreboards ---------- */
const GAME_NAMES=()=>Object.assign({jigsaw:'Jigsaw'},Object.fromEntries(Object.entries(G).filter(([id])=>id!=='movie').map(([id,g])=>[id,g.name])));
function recordWin(id,winner){const cur=(S.scores||{})[id]||{anthonia:0,ifeayomi:0,ties:0};const k=winner==='tie'||!winner?'ties':winner;mergeDoc('pods/scores',{[id]:{...cur,[k]:(cur[k]||0)+1,last:Date.now()}}).catch(()=>{});}
function scoreLine(id){const s=(S.scores||{})[id];if(!s)return '';return `<div class="scoreline">${av('anthonia',22)}<b>${s.anthonia||0}</b><span class="small muted">all-time wins${s.ties?` · ${s.ties} tie${s.ties>1?'s':''}`:''}</span><b>${s.ifeayomi||0}</b>${av('ifeayomi',22)}</div>`;}
function scoreboard(){const sc=S.scores||{},names=GAME_NAMES();let a=0,i=0;for(const s of Object.values(sc)){a+=s.anthonia||0;i+=s.ifeayomi||0;}
  const lead=a===i?null:a>i?'anthonia':'ifeayomi';const rows=Object.entries(names).filter(([id])=>sc[id]).map(([id,n])=>{const s=sc[id],t=(s.anthonia||0)+(s.ifeayomi||0)||1;
    return `<div class="sbrow"><span class="sbname">${n}</span><b style="color:var(--her)">${s.anthonia||0}</b><span class="sbbar"><i style="width:${(s.anthonia||0)/t*100}%"></i></span><b style="color:var(--him)">${s.ifeayomi||0}</b></div>`;}).join('');
  return `<section class="card sbcard"><span class="eyebrow">Scoreboard</span><div class="sbtop"><div class="sbp">${lead==='anthonia'?`<span class="sbcrown">${CROWN}</span>`:''}${av('anthonia',58)}<b>${a}</b><span class="small muted">${esc(NAMES.anthonia)}</span></div><span class="sbvs">vs</span><div class="sbp">${lead==='ifeayomi'?`<span class="sbcrown">${CROWN}</span>`:''}${av('ifeayomi',58)}<b>${i}</b><span class="small muted">${esc(NAMES.ifeayomi)}</span></div></div>
  ${rows||'<p class="small muted center" style="margin:0">Finish a game to start the scoreboard.</p>'}</section>`;}


/* ---------- iPhone: ask once to allow Pods notifications (needs a tap on iOS) ---------- */
function canAskBadge(){return !widgetPlugin()&&'Notification' in window&&!!navigator.setAppBadge&&Notification.permission==='default';}
function maybeAskBadge(){if(!S.role||S.mode!=='live'||S.badgeAsked||!canAskBadge())return;let n=0;try{n=Number(localStorage.getItem('pods_badgeAsk')||0);}catch(e){}
  if(n>=2||!document.getElementById('sheet').classList.contains('hidden'))return;S.badgeAsked=true;try{localStorage.setItem('pods_badgeAsk',String(n+1));}catch(e){}
  setTimeout(()=>{if(!document.getElementById('sheet').classList.contains('hidden'))return;openSheet(`${sheetHead('Turn on Pods notifications?')}<div class="row" style="justify-content:center">${av(other(S.role),84)}</div>
    <p class="center" style="margin:0">See a number on your Pods icon when ${esc(NAMES[other(S.role)])} messages you or it's your turn in a game.</p>
    <button class="btn primary" data-act="badgeOn">Allow notifications</button><button class="btn ghost" data-act="close">Not now</button>`);},1500);}

/* ---------- sheets, toast, effects ---------- */
function openSheet(html){document.getElementById('panel').innerHTML=html;document.getElementById('sheet').classList.remove('hidden');}
function closeSheet(){document.getElementById('sheet').classList.add('hidden');if(pending){pending=false;render(true);}}
document.getElementById('sheet').addEventListener('click',e=>{if(e.target.id==='sheet')closeSheet();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSheet();closeLb();const w=document.querySelector('.win');if(w)w.remove();}if(S.lb&&e.key==='ArrowRight')lbNav(1);if(S.lb&&e.key==='ArrowLeft')lbNav(-1);});
const sheetHead=t=>`<div class="row between"><h2>${t}</h2><button class="x" data-act="close" aria-label="Close">×</button></div>`;
let tt;function toast(m){const el=document.getElementById('toast');el.textContent=m;el.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('on'),2600);}
function floatHearts(){for(let k=0;k<9;k++){const h=document.createElement('div');h.className='float';h.innerHTML=HEART;h.style.left=(10+Math.random()*80)+'vw';h.style.bottom='100px';h.style.animationDelay=(k*0.12)+'s';h.style.color=k%3?'var(--her)':'var(--gold)';document.body.appendChild(h);setTimeout(()=>h.remove(),3200);}}
function confetti(){const cols=['#ff4f7e','#ffb21f','#22b3a3','#6cc6ff','#b388ff'];for(let i=0;i<70;i++){const c=document.createElement('div');c.className='confetti';c.style.left=Math.random()*95+'vw';c.style.background=cols[i%5];c.style.animationDuration=(1.8+Math.random()*1.6)+'s';c.style.animationDelay=(Math.random()*.4)+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),4200);}}

/* ---------- images ---------- */
function loadImg(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src;});}
function cropTo(im,w,h,q=.8){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;const s=Math.max(w/iw,h/ih);const dw=iw*s,dh=ih*s;x.drawImage(im,(w-dw)/2,(h-dh)/2,dw,dh);return c.toDataURL('image/jpeg',q);}
function fitMax(im,max,q=.72){const s=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q);}
function shuffled(n){const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const curSize=()=>{const v=Number((document.getElementById('jigSize')||{}).value||S.pickSize||60);S.pickSize=v;return SIZES.find(s=>s[0]==v)||SIZES[1];};

/* ---------- avatar editor ---------- */
function avatarSheet(who){who=who||S.avWho||S.role;S.avWho=who;const cfg=Object.assign({},DEFAULT_AV[who],(S.avatars||{})[who]);S.avDraft=cfg;drawAvatarSheet();}
function drawAvatarSheet(){const me=S.role,who=S.avWho||me,c=S.avDraft;const prev=Object.assign({},S.avatars);S.avatars={...S.avatars,[who]:c};
  const opt=(key,vals,fn)=>`<div class="opts ${fn?'':'wide'}">${vals.map((v,i)=>`<button class="${(c[key]||0)===i?'on':''}" data-act="avSet" data-k="${key}" data-v="${i}" aria-label="${esc(typeof v==='string'?v:key+' '+(i+1))}" ${fn?`style="background:${v}"`:''}>${fn?'':esc(v)}</button>`).join('')}</div>`;
  const by=prev[who]&&prev[who].by&&prev[who].by!==who?`<p class="small muted center" style="margin:0">Last styled by ${NAMES[prev[who].by]}</p>`:'';
  openSheet(`${sheetHead('Avatars')}<div class="seg"><button class="${who===me?'on':''}" data-act="avWho" data-r="${me}">Mine</button><button class="${who!==me?'on':''}" data-act="avWho" data-r="${other(me)}">Style ${NAMES[other(me)]}'s</button></div>
  <div class="row" style="justify-content:center">${av(who,110)}</div>${by}
  ${who!==me?`<p class="small center" style="margin:0;color:var(--her);font-weight:700">Have fun! ${NAMES[other(me)]} will see whatever you pick.</p>`:''}
  <span class="eyebrow">Mood</span>${opt('mood',MOODS)}<span class="eyebrow">Skin</span>${opt('skin',SKINS,true)}<span class="eyebrow">Hair</span>${opt('hair',HAIRS)}<span class="eyebrow">Hair colour</span>${opt('hc',HAIRC,true)}<span class="eyebrow">Extra</span>${opt('extra',EXTRAS)}
  <button class="btn primary" data-act="avSave">${who===me?'Save my avatar':'Save '+NAMES[who]+"'s new look"}</button><button class="btn" data-act="settings">Settings, invite code &amp; AI key</button>${S.mode==='demo'?`<button class="btn ghost" data-act="switch">Switch to ${NAMES[other(me)]}</button>`:''}`);
  S.avatars=prev;}

/* ---------- actions ---------- */
const clearIn=id=>{const e=document.getElementById(id);if(e)e.value='';};
const val=id=>(document.getElementById(id)||{}).value||'';
const A={
  tab:t=>{S.tab=t.dataset.k;location.hash=S.tab;closeSheet();render();window.scrollTo(0,0);},
  close:closeSheet,
  pick:async t=>{const r=t.dataset.r;S.role=r;applyNick();try{localStorage.setItem('pods-role',r);}catch(e){}render();floatHearts();},
  switch:()=>{if(S.mode==='live'&&uid)return;closeSheet();S.role=other(S.role);applyNick();S.sel=null;S.truthDraft=null;render();},
  avatarSheet:()=>{S.avWho=S.role;avatarSheet(S.role);},
  avSet:t=>{S.avDraft[t.dataset.k]=Number(t.dataset.v);drawAvatarSheet();},
  avWho:t=>avatarSheet(t.dataset.r),
  avSave:async()=>{const c={...S.avDraft,by:S.role,at:Date.now()},who=S.avWho||S.role;closeSheet();S.avWho=null;await mergeDoc('pods/avatars',{[who]:c});if(who!==S.role)sendMsg({kind:'news',what:'avatar'});floatHearts();toast(who===S.role?'Looking good!':`${NAMES[who]} has a new look!`);},
  visitSheet:()=>openSheet(`${sheetHead('Next visit')}<label class="f" for="visitIn">When will you see each other?<input type="date" id="visitIn" value="${esc((S.couple&&S.couple.nextVisit)||'')}"></label><button class="btn primary" data-act="visitSave">Save</button>`),
  visitSave:async()=>{const v=val('visitIn');if(!v)return toast('Pick a date first');closeSheet();await mergeDoc('pods/couple',{nextVisit:v});confetti();toast('Countdown set!');},
  tap:async t=>{floatHearts();const day=todayKey();const prev=(S.tap&&S.tap.day===day&&S.tap.counts)||{};const counts={anthonia:prev.anthonia||0,ifeayomi:prev.ifeayomi||0};counts[S.role]++;
    await setDoc('pods/tap',{from:S.role,at:Date.now(),day,counts});toast(`Love sent to ${NAMES[other(S.role)]}`);},
  answer:async()=>{const v=val('dailyIn').trim();if(!v)return toast('Write your answer first');const day=S.daily.find(d=>d.id===todayKey())||{};
    await mergeDoc('daily/'+todayKey(),{[S.role]:{text:v,at:Date.now()}});if(day[other(S.role)]){confetti();toast('Unlocked!');}else floatHearts();},
  songSheet:()=>{const s=S.songs[S.role]||{};openSheet(`${sheetHead('Song of the moment')}<label class="f" for="songT">Song and artist<input type="text" id="songT" value="${esc(s.title||'')}" placeholder="Song name and artist"></label><label class="f" for="songU">Spotify or YouTube link (optional)<input type="url" id="songU" value="${esc(s.url||'')}" placeholder="https://"></label><button class="btn primary" data-act="songSave">Pin it</button>`);},
  songSave:async()=>{const title=val('songT').trim(),url=val('songU').trim();if(!title&&!url)return toast('Add a song name or link');if(url&&!/^https?:\/\//i.test(url))return toast('Links start with https://');closeSheet();await mergeDoc('pods/songs',{[S.role]:{title,url,at:Date.now()}});},
  /* names, check-in, chat */
  nickOpen:()=>nickSheet(false),
  nickSave:async()=>{const v=val('nickIn').trim().slice(0,24);closeSheet();const oldN=(S.couple&&S.couple.nick&&S.couple.nick[S.role])||'';await mergeDoc('pods/couple',{nick:{[S.role]:v}});if(v&&v!==oldN)sendMsg({kind:'news',what:'name',name:v});toast(v?`Okay! You'll see "${v}" everywhere`:'Saved');floatHearts();},
  nickSkip:async()=>{closeSheet();await mergeDoc('pods/couple',{nick:{[S.role]:''}});},
  ciOpen:()=>checkinSheet(),
  ciMood:t=>{S.ciMood=t.dataset.m;document.querySelectorAll('.mood').forEach(b=>b.classList.toggle('on',b.dataset.m===S.ciMood));},
  ciSend:async()=>{const day=val('ciDay').trim(),mood=S.ciMood;if(!day&&!mood)return toast('Tell us a little about your day');closeSheet();const d=localDay();
    await setDoc('checkins/'+d+'_'+S.role,{role:S.role,date:d,mood:mood||'',day,at:Date.now()});await sendMsg({kind:'checkin',mood:mood||'',text:day});S.ciMood=null;floatHearts();toast(`Sent to ${NAMES[other(S.role)]}`);},
  chatSend:async()=>{const v=val('chatIn').trim();if(!v)return;clearIn('chatIn');setTyping(false);await sendMsg({kind:'text',text:v});const i=document.getElementById('chatIn');if(i)i.focus();},
  vPlay:t=>vPlay(t.dataset.k),
  chatMenu:t=>{const m=(S.msgs||[]).find(x=>x.id===t.dataset.id);if(!m)return;openSheet(`${sheetHead('Message')}<div class="small muted" style="margin-top:-6px">${esc(snippet(m))}</div><div class="opts2">
    <button class="btn opt" data-act="chatReply" data-id="${m.id}">Reply</button><button class="btn opt" data-act="chatHeart" data-id="${m.id}">${m.heart?'Remove heart':'Send a heart'}</button>${m.kind==='text'?`<button class="btn opt" data-act="chatCopy" data-id="${m.id}">Copy text</button>`:''}${m.kind==='photo'?`<button class="btn opt" data-act="chatImgOpen" data-id="${m.id}">Open photo</button>`:''}</div>`);},
  chatReply:t=>{const m=(S.msgs||[]).find(x=>x.id===t.dataset.id);closeSheet();if(!m)return;S.replyTo={id:m.id,by:m.by,text:snippet(m)};render(true);const i=document.getElementById('chatIn');if(i)i.focus();},
  replyCancel:()=>{S.replyTo=null;render(true);},
  chatCopy:async t=>{const m=(S.msgs||[]).find(x=>x.id===t.dataset.id);closeSheet();try{await navigator.clipboard.writeText(m.text||'');toast('Copied');}catch(e){toast("Couldn't copy");}},
  chatJump:t=>{const el=document.getElementById('m-'+t.dataset.id);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1400);}else toast('That message is too old to show');},
  chatHeart:async t=>{closeSheet();const m=(S.msgs||[]).find(x=>x.id===t.dataset.id);if(!m)return;await mergeDoc('messages/'+m.id,{heart:m.heart?null:S.role});if(!m.heart)floatHearts();},
  chatImgOpen:t=>{const m=(S.msgs||[]).find(x=>x.id===t.dataset.id);if(m)openSheet(`${sheetHead('Photo')}<img src="${m.img}" alt="Photo" style="width:100%;border-radius:16px">`);},
  /* account & pod */
  authToggle:()=>{S.authMode=S.authMode==='up'?'in':'up';render();},
  authReset:async()=>{const e=val('aEmail').trim();if(!e)return toast('Type your email first');try{await FB.reset(e);toast('Password reset email sent');}catch(err){toast("Couldn't send the reset email. Check the address.");}},
  setupRole:t=>{S.setupRole=t.dataset.r;render();},
  podCreate:async()=>{const r=S.setupRole;if(!r)return;const code=Array.from({length:6},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
    try{await FB.set('pods/'+code,{members:{[uid]:r},createdBy:uid,createdAt:Date.now()});await FB.set('users/'+uid+'/pods/link',{podId:code,role:r});}
    catch(e){return toast(/permission/.test(e&&e.code||'')?'Firestore rules need updating first (see the README).':"Couldn't create the Pod. Try again.");}
    POD='pods/'+code;S.podId=code;S.role=r;S.mode='live';subscribe();render();floatHearts();setTimeout(settingsSheet,600);},
  podJoin:async()=>{const r=S.setupRole,code=val('joinCode').trim().toUpperCase();if(!r||code.length<6)return toast('Pick your name and type the 6-letter code');
    try{await FB.update('pods/'+code,{['members.'+uid]:r});await FB.set('users/'+uid+'/pods/link',{podId:code,role:r});}
    catch(e){return toast("That code didn't work. Check it, or ask for a new one.");}
    POD='pods/'+code;S.podId=code;S.role=r;S.mode='live';subscribe();render();confetti();toast("You're linked! Welcome to Pods");},
  signOut:async()=>{closeSheet();if(window.FB)await FB.signOut();},
  settings:()=>settingsSheet(),
  badgeOn:async()=>{try{const r=await Notification.requestPermission();closeSheet();badgeLast=-1;pushBadge();toast(r==='granted'?'App icon number is on':'Allow notifications for Pods in Settings to see the number');}catch(e){toast("This phone doesn't support it");}},
  copyCode:async()=>{try{await navigator.clipboard.writeText(S.podId||'');toast('Code copied');}catch(e){toast('Code: '+(S.podId||''));}},
  aiSave:()=>{const k=val('aiKey').trim();if(!k)return toast('Paste a key first');localStorage.setItem(AIK,JSON.stringify({key:k}));closeSheet();toast('AI key saved on this phone');},
  aiClear:()=>{localStorage.removeItem(AIK);closeSheet();toast('AI key removed');},
  /* voice notes */
  recStart:t=>{const kind=t.dataset.k;S.recFor=kind;startRec(async(src,secs)=>{
    if(kind==='chat'){await sendMsg({kind:'voice',src,secs});return;}
    if(kind==='daily'){const day=S.daily.find(d=>d.id===todayKey())||{};await mergeDoc('daily/'+todayKey(),{[S.role]:{text:'(voice note)',voice:src,secs,at:Date.now()}});if(day[other(S.role)])confetti();else floatHearts();}
    else{await addDoc('voice',{by:S.role,src,secs,at:Date.now()});floatHearts();toast('Voice note sent');}});},
  recStop:()=>stopRec(),
  /* games */
  game:t=>{S.game=t.dataset.g;render();window.scrollTo(0,0);},
  gameBack:()=>{S.game=null;render();window.scrollTo(0,0);},
  g:t=>{const id=t.dataset.g,g=G[id];if(!g)return;const fn=g.act[t.dataset.a];if(fn)return fn(S.games[id]?JSON.parse(JSON.stringify(S.games[id])):null,t);},
  gNew:t=>{const id=t.dataset.g,st=S.games[id];if(st&&!st.over&&!st.fresh&&!(G[id].legacy&&G[id].legacy(st))){if(st.cancelReq)return toast(st.cancelReq.by===S.role?`Waiting for ${NAMES[other(S.role)]} to agree`:'Answer the request above first');
      mergeDoc('games/'+id,{cancelReq:{by:S.role,at:Date.now()}});toast(`Asked ${NAMES[other(S.role)]} to agree to a new game`);return;}newGame(id);},
  gFresh:t=>{const id=t.dataset.g;newGame(id);},
  gAgree:t=>{const id=t.dataset.g;if(id==='jigsaw'){mergeDoc('games/jigsaw',{done:true,cancelled:true,cancelReq:null});toast('Puzzle ended. Pick a new one!');return;}const st=S.games[id];newGame(id,st&&st.cancelReq?st.cancelReq.by:null);},
  gDecline:t=>{const id=t.dataset.g;mergeDoc('games/'+id,{cancelReq:null});},
  gGive:t=>{const id=t.dataset.g;if(id==='jigsaw'){const j=S.jig;if(!j||j.turn!==S.role||(j.placed||[]).length)return;mergeDoc('games/jigsaw',{turn:other(S.role)});toast(`${NAMES[other(S.role)]} goes first`);return;}
    const st=JSON.parse(JSON.stringify(S.games[id]||{}));if(!st.fresh||st.turn!==S.role)return;st.turn=other(S.role);if(st.asker)st.asker=st.turn;st.msg=`${NAMES[st.turn]} goes first`;saveGame(id,st,true);toast(st.msg);},
  /* jigsaw */
  jigSheet:()=>drawPicker(),
  jigNew:()=>{const j=S.jig;if(j&&!j.done&&(j.placed||[]).length){if(j.cancelReq)return toast(j.cancelReq.by===S.role?`Waiting for ${NAMES[other(S.role)]} to agree`:'Answer the request above first');mergeDoc('games/jigsaw',{cancelReq:{by:S.role,at:Date.now()}});toast(`Asked ${NAMES[other(S.role)]} to agree to a new puzzle`);return;}drawPicker();},
  pickCat:t=>{S.pickCat=t.dataset.k;S.pickSize=Number(val('jigSize'))||S.pickSize;drawPicker();},
  jigPhoto:async t=>{const [n,c,r]=curSize();closeSheet();toast('Getting the pieces ready…');await startJig({photo:t.dataset.k},c,r);},
  jigMem:async t=>{const m=S.memories.find(x=>x.id===t.dataset.id);if(!m)return;const [n,c,r]=curSize();closeSheet();toast('Getting the pieces ready…');
    if(m.photo)return startJig({photo:m.photo},c,r);const src=await fullImage(m);let img=src;if(src&&src.length>235000){img=await compressPhoto(await loadImg(src));}await startJig({img},c,r);},
  selPiece:t=>{S.sel=Number(t.dataset.i);document.querySelectorAll('canvas.piece.sel').forEach(p=>p.classList.remove('sel'));t.classList.add('sel');},
  shuffle:async()=>{const j=S.jig;if(!j)return;const placed=new Set(j.placed||[]);await mergeDoc('games/jigsaw',{tray:shuffled(j.cols*j.rows).filter(i=>!placed.has(i))});},
  zoom:()=>{S.zoom=!S.zoom;render(true);},
  edges:()=>{S.edgesOnly=!S.edgesOnly;render(true);},
  peek:()=>{const j=S.jig;if(!j)return;openSheet(`${sheetHead('The picture')}<img src="${jigSrc(j)}" alt="The full puzzle picture" style="width:100%;border-radius:18px">`);},
  winClose:t=>{const w=t.closest('.win');if(w)w.remove();},
  winAgain:t=>{const w=t.closest('.win');if(w)w.remove();if(t.dataset.g){S.tab='play';S.game=t.dataset.g;render();newGame(t.dataset.g);return;}S.tab='play';S.game='jigsaw';location.hash='play';render();drawPicker();},
  winGallery:t=>{const w=t.closest('.win');if(w)w.remove();S.tab='us';S.galFilter='puzzle';location.hash='us';render();window.scrollTo(0,0);},
  /* gallery */
  galFilter:t=>{S.galFilter=t.dataset.k;render(true);},
  lightbox:t=>openLightbox(t.dataset.id),
  lbClose:()=>closeLb(),
  lbNav:t=>lbNav(Number(t.dataset.d)),
  lbPuzzle:()=>{const id=S.lb&&S.lb.id;closeLb();S.tab='play';S.game='jigsaw';location.hash='play';render();S.pickCat='ours';drawPicker(id);},
  lbCaption:()=>{const m=S.memories.find(x=>S.lb&&x.id===S.lb.id);if(!m)return;const id=m.id;closeLb();openSheet(`${sheetHead('Caption')}<input type="text" id="capIn" value="${esc(m.caption||'')}" placeholder="Say something about this moment"><button class="btn primary" data-act="capSave" data-id="${id}">Save</button>`);},
  capSave:async t=>{const v=val('capIn').trim();closeSheet();await mergeDoc('memories/'+t.dataset.id,{caption:v});toast('Caption saved');},
  lbDel:async t=>{if(t.dataset.sure!=='1'){t.dataset.sure='1';t.textContent='Tap again to delete';return;}const id=S.lb&&S.lb.id;closeLb();if(!id)return;await delDoc('memories/'+id);await delDoc('photos/'+id);toast('Photo deleted');},

  /* plan */
  saveNotes:async()=>{const v=val('mNotes'),old=(S.month&&S.month.notes)||'';await mergeDoc('months/'+monthKey(),{notes:v});toast('Notes saved');if(v.trim()!==old.trim())planPost('notes',{month:monthKey()});},
  planDone:async()=>{await mergeDoc('months/'+monthKey(),{notes:val('mNotes'),done:true,doneAt:todayKey(),doneBy:S.role});confetti();toast('Planning date done. See you next month!');planPost('planDone',{month:monthKey()});},
  todoAdd:async()=>{const v=val('todoIn').trim();if(!v)return;clearIn('todoIn');const owner=val('todoOwner')||S.role,todos=[...((S.month&&S.month.todos)||[]),{id:uidGen(),t:v,owner,done:false}];await mergeDoc('months/'+monthKey(),{todos});planPost('todo',{text:v,owner,month:monthKey()});},
  todo:async t=>{let fin=null;const todos=((S.month&&S.month.todos)||[]).map(x=>{if(x.id!==t.dataset.id)return x;if(!x.done)fin=x;return {...x,done:!x.done};});await mergeDoc('months/'+monthKey(),{todos});if(fin)planPost('todoDone',{text:fin.t,owner:fin.owner,month:monthKey()});},
  todoDel:async t=>{const todos=((S.month&&S.month.todos)||[]).filter(x=>x.id!==t.dataset.id);await mergeDoc('months/'+monthKey(),{todos});},
  goalAdd:async()=>{const v=val('goalIn').trim();if(!v)return;clearIn('goalIn');const goals=[...((S.year&&S.year.goals)||[]),{id:uidGen(),t:v,done:false}];await mergeDoc('years/'+todayKey().slice(0,4),{goals});planPost('goal',{text:v});},
  goal:async t=>{let won=false;const goals=((S.year&&S.year.goals)||[]).map(x=>{if(x.id===t.dataset.id){won=!x.done;return {...x,done:!x.done};}return x;});await mergeDoc('years/'+todayKey().slice(0,4),{goals});if(won)confetti();},
  goalDel:async t=>{const goals=((S.year&&S.year.goals)||[]).filter(x=>x.id!==t.dataset.id);await mergeDoc('years/'+todayKey().slice(0,4),{goals});},
  moodAdd:async()=>{const v=val('moodIn').trim();if(!v)return;clearIn('moodIn');await addDoc('mood',{month:monthKey(),text:v,by:S.role,at:Date.now()});planPost('mood',{text:v,month:monthKey()});},
  dateSheet:()=>{const d=addDays(todayKey(),7);openSheet(`${sheetHead('Plan a date night')}
    <div class="row" style="flex-wrap:nowrap"><label class="f" for="dDate" style="flex:1">Date<input type="date" id="dDate" value="${d}"></label><label class="f" for="dTime" style="flex:1">Time in Ancona<input type="time" id="dTime" value="19:30"></label></div>
    <span class="small muted" id="dIb"></span>
    <label class="f" for="dHer">Where Anthonia goes<input type="text" id="dHer" placeholder="Restaurant, café, walk…"></label>
    <label class="f" for="dHis">Where Ifeayomi goes<input type="text" id="dHis" placeholder="Restaurant, café, walk…"></label>
    <label class="f" for="dHost">Host (pays both bills)<select id="dHost"><option value="anthonia">Anthonia</option><option value="ifeayomi">Ifeayomi</option></select></label>
    <span class="small muted">The host defaults to whoever hosts that month's planning date.</span>
    <button class="btn primary" data-act="dateSave">Book it</button>`);syncDateSheet();},
  dateSave:async()=>{const date=val('dDate'),time=val('dTime');if(!date||!time)return toast('Pick a date and time');const data={date,time,herPlace:val('dHer').trim(),hisPlace:val('dHis').trim(),host:val('dHost'),status:'planned',by:S.role,at:Date.now()};closeSheet();const did=await addDoc('dates',{...data,invited:true});floatHearts();toast('Date night booked!');planPost('date',{dateId:did,d:{date,time,herPlace:data.herPlace,hisPlace:data.hisPlace,host:data.host}});},
  dateInvite:async t=>{const d=S.dates.find(x=>x.id===t.dataset.id);if(!d)return;await mergeDoc('dates/'+d.id,{invited:true});await planPost('date',{dateId:d.id,d:{date:d.date,time:d.time,herPlace:d.herPlace||'',hisPlace:d.hisPlace||'',host:d.host}});floatHearts();toast(`Invite sent to ${NAMES[other(S.role)]} 💌`);},
  planGo:t=>{const k=t.dataset.k;closeSheet();S.tab='plan';location.hash='plan';render();setTimeout(()=>{const el=document.getElementById(k);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600);}},120);},
  dateYes:async t=>{const m=(S.msgs||[]).find(x=>x.id===t.dataset.id);if(!m||m.yes)return;await mergeDoc('messages/'+m.id,{yes:true});if(m.dateId)await mergeDoc('dates/'+m.dateId,{yes:true});confetti();floatHearts();await sendMsg({text:"Yes! It's a date 💖"});},
  dateDone:t=>openSheet(`${sheetHead('How was it?')}<label class="f" for="dNote">One line to remember it by<input type="text" id="dNote" placeholder="Best night of the month…"></label><button class="btn primary" data-act="dateDoneSave" data-id="${t.dataset.id}">Save</button>`),
  dateDoneSave:async t=>{const note=val('dNote').trim();closeSheet();await mergeDoc('dates/'+t.dataset.id,{status:'done',note});confetti();planPost('dateDone',{text:note});},
  /* truth */
  truthFilter:async()=>{const raw=val('tRaw').trim();if(!raw)return toast('Write what you want to say first');
    const from=NAMES[S.role],to=NAMES[other(S.role)];
    if(!aiCfg().key){S.truthDraft={filtered:raw,advice:[]};render();toast('Add an AI key in Settings to soften messages. For now, edit your words yourself.');return;}
    S.truthBusy=true;S.rawKeep=raw;render();
    const prompt=`You help a long-distance couple, ${from} and ${to}, talk honestly and kindly.\n${from} wrote this raw, unfiltered message to ${to}. Rewrite it so it keeps the real issue and its full meaning, but removes insults, sarcasm, blame-words and heat. Write in first person from ${from} to ${to}, warm and direct, 2 to 5 sentences. Never hide, soften away or minimise the actual problem.\nThen give ${to} 1 to 3 short, concrete suggestions for what they can do so this doesn't happen again, or to make ${from} happier.\nReturn only JSON: {"filtered": string, "advice": [string]}\n\nRaw message:\n"""${raw}"""`;
    try{let out=await aiJSON(prompt);
      S.truthDraft={filtered:String(out.filtered||raw),advice:Array.isArray(out.advice)?out.advice.map(String):[]};}
    catch(e){toast(e&&e.code==='bad_key'?'Your AI key was refused. Check it in Settings.':"Couldn't soften it right now. Edit it yourself below.");S.truthDraft={filtered:raw,advice:[]};}
    S.truthBusy=false;render();},
  truthRetry:async()=>{const raw=S.rawKeep;S.truthDraft=null;render();if(raw){document.getElementById('tRaw').value=raw;A.truthFilter();}},
  truthCancel:()=>{S.truthDraft=null;S.rawKeep=null;render();},
  truthSend:async()=>{const filtered=val('tFiltered').trim();if(!filtered)return toast('The message is empty');const advice=val('tAdvice').split('\n').map(s=>s.trim()).filter(Boolean);
    S.truthDraft=null;S.rawKeep=null;render();await addDoc('truths',{kind:'truth',from:S.role,to:other(S.role),filtered,advice,status:'sent',at:Date.now()});toast(`Sent to ${NAMES[other(S.role)]}`);},
  apprSend:async()=>{const v=val('tRaw').trim();if(!v)return toast('Write what you appreciate first');await addDoc('truths',{kind:'appr',from:S.role,to:other(S.role),filtered:v,advice:[],status:'seen',at:Date.now()});floatHearts();toast('Appreciation sent');},
  respond:async t=>{await mergeDoc('truths/'+t.dataset.id,{status:t.dataset.s,respondedAt:Date.now()});floatHearts();},
  follow:async t=>{await mergeDoc('truths/'+t.dataset.id,{followup:t.dataset.v});if(t.dataset.v==='Better')confetti();},
  /* keep */
  wishAdd:async()=>{const v=val('wishIn').trim();if(!v)return;clearIn('wishIn');const items=[...((S.wish&&S.wish.items)||[]),{id:uidGen(),t:v,by:S.role,done:false}];await mergeDoc('pods/wishlist',{items});},
  wish:async t=>{let won=false;const items=((S.wish&&S.wish.items)||[]).map(x=>{if(x.id===t.dataset.id){won=!x.done;return {...x,done:!x.done};}return x;});await mergeDoc('pods/wishlist',{items});if(won)floatHearts();},
  wishDel:async t=>{const items=((S.wish&&S.wish.items)||[]).filter(x=>x.id!==t.dataset.id);await mergeDoc('pods/wishlist',{items});},
  letterSheet:()=>openSheet(`${sheetHead('Write a letter')}<label class="f" for="lWhen">Title on the envelope<select id="lWhen">${OPEN_WHEN.map(w=>`<option>${w}</option>`).join('')}</select></label><label class="f" for="lOwn">Or write your own title<input type="text" id="lOwn" maxlength="60" placeholder="e.g. To my favourite man"></label>
    <label class="row small" style="gap:8px;flex-wrap:nowrap"><input type="checkbox" id="lPop" checked style="width:auto"> Pop it up as a surprise the moment ${esc(NAMES[other(S.role)])} opens Pods</label><label class="f" for="lBody">Your letter to ${NAMES[other(S.role)]}<textarea id="lBody" style="min-height:180px"></textarea></label><button class="btn primary" data-act="letterSave">Seal and send</button>`),
  letterSave:async()=>{const body=val('lBody').trim();if(!body)return toast('Write the letter first');const when=val('lOwn').trim()||val('lWhen'),pop=!!(document.getElementById('lPop')||{}).checked;closeSheet();
    const id=await addDoc('letters',{from:S.role,to:other(S.role),when,body,pop,opened:false,at:Date.now()});floatHearts();toast('Letter sealed with love');await sendMsg({kind:'letter',letterId:id,when});},
  openLetter:async t=>{const l=S.letters.find(x=>x.id===t.dataset.id);if(!l)return;if(l.to===S.role&&!l.opened)return showEnvelope(l);openSheet(`${sheetHead(esc(l.when))}<div class="row">${av(l.from,40)}<span class="small muted">From ${NAMES[l.from]}</span></div><div style="white-space:pre-wrap;font-size:1.08rem;background:var(--blush);border-radius:18px;padding:16px">${esc(l.body)}</div>${chequeHtml(l.cheque,l)}`);if(!l.opened){floatHearts();await mergeDoc('letters/'+l.id,{opened:true});}},
};
async function startJig(src,c,r){closeSheet();const pj=S.jig,pw=pj&&pj.done?winnerOfJig(pj):null,first=pw||S.role;const FR={60:.8,120:.8,260:13/20}[c*r],ta=(r>c&&FR)?Math.round((c/r)/FR*1000)/1000:1;const doc={ta,photo:src.photo||null,img:src.img||null,cols:c,rows:r,seed:Math.floor(Math.random()*1e9),placed:[],tray:shuffled(c*r),turn:first,run:0,best:null,counts:{anthonia:0,ifeayomi:0},done:false,by:S.role,at:Date.now()};S.sel=null;S.edgesOnly=false;await setDoc('games/jigsaw',doc);S.tab='play';S.game='jigsaw';render();toast(first===S.role?'Puzzle ready. You go first!':`Puzzle ready. ${NAMES[first]} goes first!`);}
function winnerOfJig(j){const c=j.counts||{},a=c.anthonia||0,i=c.ifeayomi||0;return a===i?null:a>i?'anthonia':'ifeayomi';}
function newGame(id,starter){const prev=S.games[id],w=prev&&prev.over&&prev.winner&&prev.winner!=='tie'?prev.winner:null,first=starter||w||S.role;const st=G[id].start(first);st.winnerStart=!!w;saveGame(id,st,true);
  toast(w?`${NAMES[w]} won last time, so ${w===S.role?'you start':NAMES[w]+' starts'}`:'New game started');}
function drawPicker(memId){const cat=S.pickCat||'animals',size=S.pickSize||60;const ours=S.memories.filter(m=>m.kind!=='puzzle');
  openSheet(`${sheetHead('New jigsaw')}<label class="f" for="jigSize">How many pieces?<select id="jigSize">${SIZES.map(([n,c,r])=>`<option value="${n}" ${n===size?'selected':''}>${n} pieces (${c} × ${r})</option>`).join('')}</select></label>
  <div class="cats">${CATS.map(([k,l])=>`<button class="${cat===k?'on':''}" data-act="pickCat" data-k="${k}">${l}</button>`).join('')}</div>
  ${cat==='ours'?`<label class="btn" for="jigImg">Upload a new photo</label><input type="file" id="jigImg" accept="image/*" hidden>${ours.length?`<div class="scenes">${ours.map(m=>`<button data-act="jigMem" data-id="${m.id}" class="${memId===m.id?'hl':''}"><img src="${memThumb(m)}" alt=""><span>${esc(m.caption||NAMES[m.by]||'')}</span></button>`).join('')}</div>`:'<p class="small muted">Photos you add to the gallery show up here.</p>'}`
   :`<div class="scenes">${PHOTOS.filter(p=>p[1]===cat).map(([k,,t])=>`<button data-act="jigPhoto" data-k="${k}"><img src="${thumbURL(k)}" alt="" loading="lazy"><span>${t}</span></button>`).join('')}</div>`}`);}
function syncDateSheet(){const d=val('dDate'),t=val('dTime');const el=document.getElementById('dIb');if(el&&d&&t)el.textContent=`That's ${ibadanTime(d,t)} in Ibadan.`;const h=document.getElementById('dHost');if(h&&d&&!h.dataset.touched)h.value=hostFor(d.slice(0,7));}
document.addEventListener('click',e=>{if(e.target.id==='board'){boardTap(e);return;}const t=e.target.closest('[data-act]');if(!t||t.disabled)return;const f=A[t.dataset.act];if(f){e.preventDefault();Promise.resolve(f(t)).catch(()=>{});}});
document.addEventListener('submit',async e=>{if(e.target.id!=='authForm')return;e.preventDefault();const em=val('aEmail').trim(),pw=val('aPass');if(!em||!pw)return toast('Type your email and password');
  try{if(S.authMode==='up')await FB.signUp(em,pw);else await FB.signIn(em,pw);}catch(err){const c=err&&err.code||'';toast(/weak/.test(c)?'Use at least 6 characters':/in-use/.test(c)?'That email already has a login. Sign in instead.':/invalid|wrong|not-found/.test(c)?'Email or password is wrong':"Couldn't sign in. Check your connection.");}});
document.addEventListener('input',e=>{if(e.target.id==='chatIn'){setTyping(!!e.target.value);clearTimeout(typingT);typingT=setTimeout(()=>setTyping(false),3500);}if(e.target.id==='dDate'||e.target.id==='dTime')syncDateSheet();});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){const m={todoIn:'todoAdd',goalIn:'goalAdd',wishIn:'wishAdd',moodIn:'moodAdd',chatIn:'chatSend'}[e.target.id];if(m){e.preventDefault();A[m]();}}});
document.addEventListener('change',async e=>{const el=e.target;if(el.id==='dHost')el.dataset.touched='1';
  if(!el.files||!el.files[0])return;
  if(el.id==='chatImg'){const f=el.files[0];el.value='';try{const url=URL.createObjectURL(f);const im=await loadImg(url);URL.revokeObjectURL(url);await sendMsg({kind:'photo',img:await compressPhoto(im)});await saveToGallery({thumb:cropTo(im,320,320,.74),img:await compressPhoto(im),caption:'From our chat',kind:'photo'});}catch(err){toast("That photo couldn't be sent. Try another one.");}return;}
  if(el.id==='memImg'||el.id==='memImg2'){const files=[...el.files];el.value='';await uploadFiles(files,'','photo');return;}
  const file=el.files[0];el.value='';
  try{const url=URL.createObjectURL(file);const im=await loadImg(url);URL.revokeObjectURL(url);
    if(el.id==='moodImg'){await addDoc('mood',{month:monthKey(),img:fitMax(im,480,.7),by:S.role,at:Date.now()});await saveToGallery({thumb:cropTo(im,320,320,.74),img:await compressPhoto(im),caption:'From our '+monthName(monthKey())+' mood board',kind:'mood'});toast('Pinned and saved to the gallery');}
    else if(el.id==='jigImg'){const [n,c,r]=curSize();closeSheet();toast('Saving to the gallery and cutting the pieces…');const img=await compressPhoto(im);await saveToGallery({thumb:cropTo(im,320,320,.74),img,caption:'',kind:'photo'});await startJig({img},c,r);}
  }catch(err){toast("That photo couldn't be opened. Try another one.");}});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(['home','chat','play','plan','truth','us'].includes(h)&&h!==S.tab){S.tab=h;render();}});
window.addEventListener('resize',()=>{if(S.tab==='play'&&S.game==='jigsaw')drawJig();});
window.addEventListener('DOMContentLoaded',boot);
