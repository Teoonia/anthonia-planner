/* Pods games. Each game keeps its whole state in one document, games/<id>.
   Every game has: name, short, desc, icon, start(me) → state, view(state, me) → html,
   act: {name: (state, button) => …}, optional post(state, me) after render. */
const G = {};
const NAMESX = () => NAMES;
function saveGame(id, st, fresh) { st.updatedAt = Date.now(); st.fresh = !!fresh; if (st.over && st.winner && !st.scored && !fresh) { st.scored = true; recordWin(id, st.winner); } return setDoc('games/' + id, st); }
function shuffleArr(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const gbtn = (g, a, label, cls = '', extra = '') => `<button class="btn ${cls}" data-act="g" data-g="${g}" data-a="${a}" ${extra}>${label}</button>`;
function logLine(st, msg) { st.log = [msg, ...(st.log || [])].slice(0, 6); st.msg = msg; }
function gameStatus(id, st) {
  if (st.over) { const w = st.winner; return `<div class="gstat">${w && w !== 'tie' ? av(w, 34) + `<b>${NAMES[w]} won!</b>` : '<b>It\'s a tie!</b>'}</div>`; }
  if (!st.turn) return st.msg ? `<div class="gstat small muted">${esc(st.msg)}</div>` : '';
  const mine = st.turn === S.role;
  return `<div class="gstat">${av(st.turn, 34)}<span class="chip ${st.turn === 'anthonia' ? 'her' : 'him'}">${mine ? 'Your turn' : NAMES[st.turn] + "'s turn"}</span>${st.msg ? `<span class="small muted grow">${esc(st.msg)}</span>` : ''}</div>`;
}
function gamesChanged(prev, cur) {
  for (const [id, g] of Object.entries(cur)) {
    const p = prev[id]; if (!G[id] || !g) continue;
    if (p && !p.over && g.over && g.winner) setTimeout(() => showWin(id, g), 250);
    else if (p && p.turn !== g.turn && g.turn === S.role && !g.over) toast(`Your turn in ${G[id].name}!`);
    if (g.cancelReq && g.cancelReq.by !== S.role && !(p && p.cancelReq)) toast(`${NAMES[g.cancelReq.by]} wants to start a new ${G[id].name} game`);
  }
}
function showWin(id, st) {
  if (document.querySelector('.win')) return;
  const w = st.winner && st.winner !== 'tie' ? st.winner : null, me = S.role;
  const sc = G[id].score ? G[id].score(st) : null;
  const el = document.createElement('div'); el.className = 'win';
  el.innerHTML = `<div class="winCard"><div class="rays"></div>
   ${w ? `<div class="crown">${CROWN}</div><div class="winAv">${av(w, 130)}</div><h1>${NAMES[w]} wins!</h1><p class="muted" style="margin:0">${w === me ? 'You did it! Victory dance time.' : 'Well played. Rematch?'}</p>`
      : `<div class="row" style="justify-content:center;gap:4px"><div class="winAv">${av('anthonia', 96)}</div><span class="bridge">${HEART}</span><div class="winAv">${av('ifeayomi', 96)}</div></div><h1>It's a tie!</h1><p class="muted" style="margin:0">Perfect match, like the two of you.</p>`}
   ${sc ? `<div class="score"><span style="color:var(--her)">${sc[0]}</span><span class="muted" style="font-size:1rem">${G[id].name}</span><span style="color:var(--him)">${sc[1]}</span></div>` : `<div class="score" style="font-size:1.3rem">${G[id].name}</div>`}
   <div class="row" style="justify-content:center"><button class="btn primary" data-act="winAgain" data-g="${id}">Play again</button><button class="btn" data-act="winClose">Close</button></div></div>`;
  document.body.appendChild(el); confetti(); setTimeout(confetti, 900); setTimeout(confetti, 1800); floatHearts();
}
const ICON = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

/* =================================== COUPLE QUIZ =================================== */
const QBANK = [
  ["My favourite food is…", ["Jollof rice", "Pounded yam & egusi", "Pizza", "Pasta"]],
  ["My perfect weekend is…", ["Sleeping in", "Out with friends", "Church and family", "A trip somewhere new"]],
  ["When I'm upset I want…", ["Space", "A long call", "Food", "A hug, even a virtual one"]],
  ["My dream holiday is…", ["Beach in Zanzibar", "Paris", "Dubai shopping", "Mountains and nature"]],
  ["I'd rather watch…", ["A romantic film", "An action film", "A comedy", "A documentary"]],
  ["My love language is mostly…", ["Words", "Quality time", "Gifts", "Acts of service"]],
  ["My favourite drink is…", ["Malt", "Zobo", "Coffee", "Fresh juice"]],
  ["In the morning I'm…", ["Up early and ready", "Snoozing three times", "Grumpy until food", "On my phone first"]],
  ["I'm most likely to spend money on…", ["Clothes and shoes", "Food", "Gadgets", "Business"]],
  ["My biggest fear is…", ["Heights", "Failure", "Insects", "Being alone"]],
  ["The colour I love most is…", ["Pink", "Blue", "Black", "Green"]],
  ["My favourite season is…", ["Rainy season", "Harmattan", "Summer", "Christmas time"]],
  ["If I won ₦10 million I'd…", ["Invest it", "Travel", "Buy land", "Spoil my family"]],
  ["My ideal date night is…", ["Dinner out", "Cooking together", "Movie at home", "Dancing"]],
  ["The thing I'm best at is…", ["Organising", "Making people laugh", "Cooking", "Solving problems"]],
  ["I'd describe myself as…", ["Introvert", "Extrovert", "A bit of both", "Depends on the day"]],
  ["My comfort food is…", ["Indomie", "Ice cream", "Suya", "Bread and tea"]],
  ["The pet I'd choose is…", ["Dog", "Cat", "Fish", "No pets, thanks"]],
  ["When we argue I usually…", ["Talk it out right away", "Go quiet first", "Joke to lighten it", "Need to sleep on it"]],
  ["My favourite way to relax is…", ["Music", "Sleep", "Scrolling social media", "Prayer or quiet time"]],
  ["The gift I'd love most is…", ["Jewellery or a watch", "A handwritten letter", "A surprise trip", "Something I can use for work"]],
  ["My go-to party song genre is…", ["Afrobeats", "Amapiano", "Gospel", "R&B"]],
  ["I'm happiest when…", ["I finish a big task", "I'm with family", "I'm with you", "I'm travelling"]],
  ["My dream car is…", ["A Range Rover", "A Tesla", "A Benz", "Anything that works"]],
  ["The chore I hate most is…", ["Washing plates", "Laundry", "Cleaning the bathroom", "Ironing"]],
  ["On a free evening I'd rather…", ["Watch a series", "Read", "Go out", "Call you for hours"]],
  ["My style is mostly…", ["Native attire", "Smart office", "Casual and comfy", "Sporty"]],
  ["Where I'd love us to live is…", ["Lagos", "Ibadan", "Abroad", "Anywhere together"]],
  ["The first thing I notice in people is…", ["Smile", "Eyes", "How they talk", "How they dress"]],
  ["My sleep style is…", ["Night owl", "Early bird", "Napper", "I can sleep anywhere"]],
,
  ["My favourite snack is…", ["Chin chin", "Plantain chips", "Popcorn", "Chocolate"]],
  ["When I travel I always pack…", ["Too many clothes", "Snacks", "Chargers", "Only the basics"]],
  ["My favourite Nigerian dish to cook is…", ["Fried rice", "Efo riro", "Ofada stew", "Moi moi"]],
  ["My worst habit is…", ["Procrastinating", "Phone addiction", "Overthinking", "Being late"]],
  ["The superpower I'd pick is…", ["Teleporting to you", "Reading minds", "Flying", "Stopping time"]],
  ["My favourite time of day is…", ["Early morning", "Afternoon", "Evening", "Midnight"]],
  ["The app I use most is…", ["WhatsApp", "TikTok", "Instagram", "YouTube"]],
  ["I'd rather live in…", ["A big city", "A quiet town", "By the sea", "On a farm"]],
  ["When I'm stressed I…", ["Eat", "Sleep", "Clean", "Call someone"]],
  ["My dream job, if money didn't matter…", ["Travel creator", "Business owner", "Teacher", "Chef"]],
  ["What makes me laugh the most…", ["Silly memes", "Skits", "Your jokes", "Funny animal videos"]],
  ["My favourite thing about Christmas is…", ["Food", "Family", "Church", "Gifts"]],
  ["The way I like to say sorry is…", ["Words", "A gift", "Doing something nice", "A long hug"]],
  ["My favourite weather is…", ["Sunny and hot", "Cool breeze", "Rainy", "Snow"]],
  ["I'm secretly scared of…", ["Lizards", "The dark", "Dogs", "Flying"]],
  ["My ideal number of children is…", ["One or two", "Three", "Four or more", "Still deciding"]],
  ["My favourite kind of movie night is…", ["Nollywood", "Hollywood action", "K-drama", "Cartoons"]],
  ["If I had a free day tomorrow I'd…", ["Sleep all day", "Go shopping", "Start a new project", "Spend it on calls with you"]],
  ["The sport I enjoy watching is…", ["Football", "Basketball", "Athletics", "None"]],
  ["My favourite fruit is…", ["Mango", "Pineapple", "Watermelon", "Banana"]],
  ["The first thing I do when I wake up is…", ["Check my phone", "Pray", "Brush my teeth", "Go back to sleep"]],
  ["I'd describe my cooking as…", ["Chef level", "Good enough", "Learning", "Please don't ask"]],
  ["My favourite way to receive love is…", ["Surprise gifts", "Sweet messages", "Phone calls", "Planned dates"]],
  ["The thing I'd never share is…", ["My food", "My phone", "My clothes", "My bed"]],
  ["My favourite memory of us is…", ["Our first date", "Our first trip", "A random fun day", "Every day together"]],
  ["When I get money, I first…", ["Save it", "Spend it", "Pay bills", "Invest it"]],
  ["The country I want to visit most is…", ["Ghana", "USA", "Japan", "Brazil"]],
  ["I'm most likely to cry at…", ["Sad movies", "Weddings", "Arguments", "Never, I'm strong"]],
  ["My favourite type of music to relax to is…", ["Soft R&B", "Worship songs", "Highlife", "Lo-fi"]],
  ["My perfect birthday is…", ["Big party", "Quiet dinner", "A trip", "Surprises from you"]],
];
G.quiz = {
  name: 'Couple quiz', short: 'How well do you know me?', icon: ICON('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>'),
  desc: 'One of you answers 5 questions about yourself. The other guesses your answers. 4 rounds, swapping each time. Most correct guesses wins.',
  start(me) { let seen = (S.games.quiz && S.games.quiz.seen) || []; if (QBANK.length - seen.length < 20) seen = []; const qs = G.quiz.pick(seen); return { kind: 'quiz', round: 1, rounds: 4, asker: me, phase: 'answer', turn: me, qs, seen: [...seen, ...qs], answers: [], guesses: [], scores: { anthonia: 0, ifeayomi: 0 }, msg: `${NAMES[me]} answers first` }; },
  pick: (seen) => shuffleArr([...QBANK.keys()].filter((i) => !seen.includes(i))).slice(0, 5),
  score: (st) => [st.scores.anthonia, st.scores.ifeayomi],
  view(st, me) {
    const guesser = other(st.asker), opts = (qi, a) => QBANK[st.qs[qi]][1].map((o, k) => gbtn('quiz', a, esc(o), 'opt', `data-x="${k}"`)).join('');
    const head = `<div class="row between small"><span class="muted">Round ${st.round} of ${st.rounds} · ${NAMES[st.asker]} is the subject</span><span><b style="color:var(--her)">${st.scores.anthonia}</b> – <b style="color:var(--him)">${st.scores.ifeayomi}</b></span></div>`;
    if (st.phase === 'answer') {
      if (me !== st.asker) return head + `<div class="locked">${av(st.asker, 28)} ${NAMES[st.asker]} is answering questions about themselves…</div>`;
      const i = st.answers.length; return head + `<div class="qcard"><span class="eyebrow">About you · ${i + 1}/5</span><h2>${esc(QBANK[st.qs[i]][0])}</h2><div class="opts2">${opts(i, 'ans')}</div></div>`;
    }
    if (st.phase === 'guess') {
      if (me !== guesser) return head + `<div class="locked">${av(guesser, 28)} ${NAMES[guesser]} is guessing your answers…</div>`;
      const i = st.guesses.length; return head + `<div class="qcard"><span class="eyebrow">Guess ${NAMES[st.asker]}'s answer · ${i + 1}/5</span><h2>${esc(QBANK[st.qs[i]][0].replace(/^My /, NAMES[st.asker] + "'s ").replace(/^I'm /, NAMES[st.asker] + " is ").replace(/^I'd /, NAMES[st.asker] + " would ").replace(/^I /, NAMES[st.asker] + ' ').replace(/^When I/, 'When ' + NAMES[st.asker]).replace(/^If I/, 'If ' + NAMES[st.asker]).replace(/^On a free evening I'd/, 'On a free evening ' + NAMES[st.asker] + ' would').replace(/^Where I'd/, 'Where ' + NAMES[st.asker] + ' would'))}</h2><div class="opts2">${opts(i, 'guess')}</div></div>`;
    }
    const rows = st.qs.map((q, i) => { const ok = st.answers[i] === st.guesses[i]; return `<div class="item"><span class="grow small"><b>${esc(QBANK[q][0])}</b><br>${NAMES[st.asker]}: ${esc(QBANK[q][1][st.answers[i]])}${ok ? '' : `<br><span class="muted">Guess: ${esc(QBANK[q][1][st.guesses[i]])}</span>`}</span><span class="chip ${ok ? 'him' : 'warn'}">${ok ? 'Right' : 'Miss'}</span></div>`; }).join('');
    const right = st.answers.filter((a, i) => a === st.guesses[i]).length;
    return head + `<h2>${NAMES[guesser]} got ${right} of 5</h2>${rows}${st.over ? '' : gbtn('quiz', 'next', st.round >= st.rounds ? 'See who won' : 'Next round', 'primary')}`;
  },
  act: {
    ans(st, t) { if (st.phase !== 'answer' || st.asker !== S.role) return; st.answers.push(+t.dataset.x); if (st.answers.length === 5) { st.phase = 'guess'; st.turn = other(st.asker); st.msg = `${NAMES[st.turn]}, guess the answers`; } saveGame('quiz', st); },
    guess(st, t) { const gsr = other(st.asker); if (st.phase !== 'guess' || gsr !== S.role) return; st.guesses.push(+t.dataset.x);
      if (st.guesses.length === 5) { const right = st.answers.filter((a, i) => a === st.guesses[i]).length; st.scores[gsr] += right; st.phase = 'reveal'; st.turn = null; st.msg = `${NAMES[gsr]} got ${right} right`; if (right >= 4) confetti(); }
      saveGame('quiz', st); },
    next(st) { if (st.phase !== 'reveal') return;
      if (st.round >= st.rounds) { st.over = true; const a = st.scores.anthonia, i = st.scores.ifeayomi; st.winner = a === i ? 'tie' : a > i ? 'anthonia' : 'ifeayomi'; st.turn = null; return saveGame('quiz', st); }
      st.round++; st.asker = other(st.asker); st.turn = st.asker; st.phase = 'answer'; st.answers = []; st.guesses = []; st.seen = st.seen || []; if (QBANK.length - st.seen.length < 5) st.seen = []; st.qs = G.quiz.pick(st.seen); st.seen.push(...st.qs); st.msg = `${NAMES[st.asker]} answers this round`; saveGame('quiz', st); },
  },
};

/* =================================== CARDS: shared =================================== */
const SHAPE_SVG = {
  c: '<circle cx="20" cy="20" r="13"/>', t: '<path d="M20 6L34 32H6z"/>', x: '<path d="M15 6h10v9h9v10h-9v9H15v-9H6V15h9z"/>',
  s: '<rect x="7" y="7" width="26" height="26"/>', r: '<path d="M20 4l4.7 10 10.8 1.2-8 7.3 2.2 10.7L20 27.8l-9.7 5.4 2.2-10.7-8-7.3 10.8-1.2z"/>',
};
const SHAPE_NAME = { c: 'Circle', t: 'Triangle', x: 'Cross', s: 'Square', r: 'Star', w: 'Whot' };
function whotCard(c, opts = {}) {
  const [sh, n] = c.split('-'); const cls = `pc whot ${opts.cls || ''}`;
  const inner = sh === 'w' ? `<div class="wtxt">WHOT</div><div class="wn">20</div>` : `<svg viewBox="0 0 40 40" class="big">${SHAPE_SVG[sh]}</svg>`;
  return `<${opts.btn ? 'button' : 'div'} class="${cls}" ${opts.btn || ''}><span class="cn tl">${n}</span>${inner}<span class="cn br">${n}</span></${opts.btn ? 'button' : 'div'}>`;
}
const SUITS = { S: '♠', H: '♥', D: '♦', C: '♣' };
function playCard(c, opts = {}) {
  const r = c.slice(0, -1), su = c.slice(-1), red = su === 'H' || su === 'D';
  return `<${opts.btn ? 'button' : 'div'} class="pc std ${red ? 'red' : ''} ${opts.cls || ''}" ${opts.btn || ''}><span class="cn tl">${r}<br>${SUITS[su]}</span><span class="pip">${SUITS[su]}</span><span class="cn br">${r}<br>${SUITS[su]}</span></${opts.btn ? 'button' : 'div'}>`;
}
const cardBack = (n) => `<div class="backs">${Array.from({ length: Math.min(n, 12) }, () => '<div class="pc back"></div>').join('')}${n > 12 ? `<span class="small muted">+${n - 12}</span>` : ''}</div>`;
function drawFrom(st, n, who) { for (let k = 0; k < n; k++) { if (!st.draw.length) { const top = st.pile.pop(); st.draw = shuffleArr(st.pile); st.pile = [top]; } if (!st.draw.length) break; st.hands[who].push(st.draw.pop()); } }

/* =================================== WHOT! =================================== */
function whotDeck() { const d = [], add = (sh, ns) => ns.forEach((n) => d.push(sh + '-' + n));
  add('c', [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14]); add('t', [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14]);
  add('x', [1, 2, 3, 5, 7, 10, 11, 13, 14]); add('s', [1, 2, 3, 5, 7, 10, 11, 13, 14]); add('r', [1, 2, 3, 4, 5, 7, 8]);
  for (let k = 0; k < 5; k++) d.push('w-20'); return shuffleArr(d); }
const WHOT_SPECIAL = { 1: 'Hold on', 2: 'Pick two', 5: 'Pick three', 8: 'Suspension', 14: 'General market', 20: 'Whot' };
function whotValid(st, c) { const [sh, n] = c.split('-'); if (sh === 'w') return true; if (st.need) return sh === st.need; const [tsh, tn] = st.pile[st.pile.length - 1].split('-'); return sh === tsh || n === tn; }
G.whot = {
  name: 'Whot!', short: 'The Naija card classic', icon: ICON('<rect x="4" y="3" width="13" height="18" rx="2"/><path d="M8 3.5l12 3-3.5 14"/><circle cx="10.5" cy="12" r="2.5"/>'),
  desc: 'Match the shape or number on top. 1 Hold on, 2 Pick two, 5 Pick three, 8 Suspension and 14 General market let you play again. Whot 20 lets you ask for a shape. First to empty their hand wins.',
  start(me) { const d = whotDeck(); const st = { kind: 'whot', draw: d, pile: [], hands: { anthonia: [], ifeayomi: [] }, turn: me, need: null };
    for (let k = 0; k < 6; k++) { st.hands.anthonia.push(d.pop()); st.hands.ifeayomi.push(d.pop()); }
    let i = d.findIndex((c) => !WHOT_SPECIAL[c.split('-')[1]]); st.pile.push(d.splice(i, 1)[0]); st.msg = `${NAMES[me]} starts`; return st; },
  score: (st) => [st.hands.anthonia.length, st.hands.ifeayomi.length].map((n) => n + ' left'),
  view(st, me) {
    const you = other(me), mine = st.turn === me && !st.over, top = st.pile[st.pile.length - 1];
    return `<div class="row between">${av(you, 30)}<span class="small muted">${NAMES[you]} has ${st.hands[you].length} card${st.hands[you].length === 1 ? '' : 's'}${st.hands[you].length === 1 ? ' — last card!' : ''}</span></div>${cardBack(st.hands[you].length)}
    <div class="table">${whotCard(top, { cls: 'top' })}<div class="deckpile"><div class="pc back"></div><span class="small muted">${st.draw.length} in market</span></div></div>
    ${st.need ? `<div class="need">Asked for: <svg viewBox="0 0 40 40">${SHAPE_SVG[st.need]}</svg> ${SHAPE_NAME[st.need]}</div>` : ''}
    <span class="eyebrow">Your hand</span>
    <div class="hand">${st.hands[me].map((c, k) => whotCard(c, { btn: mine ? `data-act="g" data-g="whot" data-a="play" data-x="${k}"` : 'disabled', cls: mine && whotValid(st, c) ? 'ok' : mine ? 'no' : '' })).join('')}</div>
    ${mine ? `<div class="row">${gbtn('whot', 'market', 'Go to market')}<span class="small muted">Tap a glowing card to play it.</span></div>` : ''}`;
  },
  act: {
    play(st, t) { const me = S.role; if (st.turn !== me || st.over) return; const k = +t.dataset.x, c = st.hands[me][k]; if (!c || !whotValid(st, c)) return toast("That card doesn't match");
      const n = c.split('-')[1];
      if (n === '20') { return openSheet(`${sheetHead('Ask for a shape')}<div class="shapes">${['c', 't', 'x', 's', 'r'].map((sh) => `<button data-act="g" data-g="whot" data-a="need" data-x="${k}" data-s="${sh}"><svg viewBox="0 0 40 40">${SHAPE_SVG[sh]}</svg>${SHAPE_NAME[sh]}</button>`).join('')}</div>`); }
      G.whot.finish(st, k, null); },
    need(st, t) { closeSheet(); G.whot.finish(st, +t.dataset.x, t.dataset.s); },
    market(st) { const me = S.role; if (st.turn !== me || st.over) return; drawFrom(st, 1, me); st.turn = other(me); logLine(st, `${NAMES[me]} went to market`); saveGame('whot', st); },
  },
  finish(st, k, need) { const me = S.role, you = other(me), c = st.hands[me].splice(k, 1)[0], n = c.split('-')[1]; st.pile.push(c); st.need = null;
    let again = true, msg = '';
    if (n === '1') msg = 'Hold on! Play again';
    else if (n === '2') { drawFrom(st, 2, you); msg = `Pick two! ${NAMES[you]} picks 2`; }
    else if (n === '5') { drawFrom(st, 3, you); msg = `Pick three! ${NAMES[you]} picks 3`; }
    else if (n === '8') msg = `Suspension! ${NAMES[you]} misses a turn`;
    else if (n === '14') { drawFrom(st, 1, you); msg = `General market! ${NAMES[you]} picks 1`; }
    else if (n === '20') { st.need = need; again = false; msg = `Whot! ${NAMES[me]} asks for ${SHAPE_NAME[need]}`; }
    else { again = false; msg = `${NAMES[me]} played ${n}`; }
    if (!st.hands[me].length) { st.over = true; st.winner = me; st.turn = null; msg = `${NAMES[me]} checked up!`; }
    else { if (!again) st.turn = you; if (st.hands[me].length === 1) msg += ' · Last card!'; }
    logLine(st, msg); if (!st.over && again) toast(msg); saveGame('whot', st); },
};

/* =================================== CRAZY EIGHTS =================================== */
function stdDeck() { const d = []; for (const su of 'SHDC') for (const r of ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']) d.push(r + su); return shuffleArr(d); }
function eightValid(st, c) { const r = c.slice(0, -1), su = c.slice(-1); if (r === '8') return true; if (st.need) return su === st.need; const t = st.pile[st.pile.length - 1]; return su === t.slice(-1) || r === t.slice(0, -1); }
G.eights = {
  name: 'Crazy Eights', short: 'Quick matching cards', icon: ICON('<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="9.5" r="2.5"/><circle cx="12" cy="14.5" r="3"/>'),
  desc: 'Match the suit or number on top. 8s are wild: play one and choose the suit. Can\'t play? Draw a card. First to empty their hand wins.',
  start(me) { const d = stdDeck(); const st = { kind: 'eights', draw: d, pile: [], hands: { anthonia: [], ifeayomi: [] }, turn: me, need: null, drew: false };
    for (let k = 0; k < 7; k++) { st.hands.anthonia.push(d.pop()); st.hands.ifeayomi.push(d.pop()); }
    const i = d.findIndex((c) => c[0] !== '8'); st.pile.push(d.splice(i, 1)[0]); st.msg = `${NAMES[me]} starts`; return st; },
  score: (st) => [st.hands.anthonia.length, st.hands.ifeayomi.length].map((n) => n + ' left'),
  view(st, me) { const you = other(me), mine = st.turn === me && !st.over;
    return `<div class="row between">${av(you, 30)}<span class="small muted">${NAMES[you]} has ${st.hands[you].length} cards</span></div>${cardBack(st.hands[you].length)}
    <div class="table">${playCard(st.pile[st.pile.length - 1], { cls: 'top' })}<div class="deckpile"><div class="pc back"></div><span class="small muted">${st.draw.length} left</span></div></div>
    ${st.need ? `<div class="need">Suit called: <b style="font-size:1.3rem;color:${'HD'.includes(st.need) ? '#e11d48' : 'var(--ink)'}">${SUITS[st.need]}</b></div>` : ''}
    <span class="eyebrow">Your hand</span>
    <div class="hand">${st.hands[me].map((c, k) => playCard(c, { btn: mine ? `data-act="g" data-g="eights" data-a="play" data-x="${k}"` : 'disabled', cls: mine && eightValid(st, c) ? 'ok' : mine ? 'no' : '' })).join('')}</div>
    ${mine ? `<div class="row">${st.drew ? gbtn('eights', 'pass', 'Pass') : gbtn('eights', 'draw', 'Draw a card')}</div>` : ''}`; },
  act: {
    play(st, t) { const me = S.role; if (st.turn !== me || st.over) return; const k = +t.dataset.x, c = st.hands[me][k]; if (!c || !eightValid(st, c)) return toast("That card doesn't match");
      if (c.startsWith('8')) return openSheet(`${sheetHead('Choose the suit')}<div class="shapes">${'SHDC'.split('').map((su) => `<button data-act="g" data-g="eights" data-a="suit" data-x="${k}" data-s="${su}"><b style="font-size:2rem;color:${'HD'.includes(su) ? '#e11d48' : 'var(--ink)'}">${SUITS[su]}</b></button>`).join('')}</div>`);
      G.eights.finish(st, k, null); },
    suit(st, t) { closeSheet(); G.eights.finish(st, +t.dataset.x, t.dataset.s); },
    draw(st) { const me = S.role; if (st.turn !== me || st.over || st.drew) return; drawFrom(st, 1, me); const c = st.hands[me][st.hands[me].length - 1];
      if (c && eightValid(st, c)) { st.drew = true; logLine(st, `${NAMES[me]} drew a card`); } else { st.turn = other(me); st.drew = false; logLine(st, `${NAMES[me]} drew and passed`); } saveGame('eights', st); },
    pass(st) { const me = S.role; if (st.turn !== me) return; st.turn = other(me); st.drew = false; logLine(st, `${NAMES[me]} passed`); saveGame('eights', st); },
  },
  finish(st, k, need) { const me = S.role, c = st.hands[me].splice(k, 1)[0]; st.pile.push(c); st.need = need; st.drew = false;
    if (!st.hands[me].length) { st.over = true; st.winner = me; st.turn = null; logLine(st, `${NAMES[me]} went out!`); }
    else { st.turn = other(me); logLine(st, need ? `${NAMES[me]} played an 8 and called ${SUITS[need]}` : `${NAMES[me]} played ${c.slice(0, -1)}${SUITS[c.slice(-1)]}`); }
    saveGame('eights', st); },
};

/* =================================== WORD TILES =================================== */
const LETTERS = { A: [9, 1], B: [2, 3], C: [2, 3], D: [4, 2], E: [12, 1], F: [2, 4], G: [3, 2], H: [2, 4], I: [9, 1], J: [1, 8], K: [1, 5], L: [4, 1], M: [2, 3], N: [6, 1], O: [8, 1], P: [2, 3], Q: [1, 10], R: [6, 1], S: [4, 1], T: [6, 1], U: [4, 1], V: [2, 4], W: [2, 4], X: [1, 8], Y: [2, 4], Z: [1, 10], '?': [2, 0] };
const PREM = (() => { const m = {}, set = (t, l) => l.forEach(([r, c]) => { m[r * 15 + c] = t; });
  set('TW', [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]]);
  set('DW', [[1, 1], [2, 2], [3, 3], [4, 4], [10, 10], [11, 11], [12, 12], [13, 13], [1, 13], [2, 12], [3, 11], [4, 10], [10, 4], [11, 3], [12, 2], [13, 1], [7, 7]]);
  set('TL', [[1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]]);
  set('DL', [[0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]]);
  return m; })();
let WORDS = null, wordsLoading = null;
function loadWords() { if (WORDS) return Promise.resolve(WORDS); if (!wordsLoading) wordsLoading = fetch('words.txt').then((r) => r.text()).then((t) => { WORDS = new Set(t.split('\n')); render(true); return WORDS; }).catch(() => { wordsLoading = null; }); return wordsLoading; }
const tileVal = (ch) => (ch && ch === ch.toLowerCase() ? 0 : (LETTERS[ch] || [0, 0])[1]);
function wordMove(board, pend) {
  if (!pend.length) return { err: 'Place some tiles first' };
  const B = board.slice(); for (const p of pend) { if (B[p.i]) return { err: 'That square is taken' }; B[p.i] = p.ch; }
  const rows = pend.map((p) => Math.floor(p.i / 15)), cols = pend.map((p) => p.i % 15);
  const sameRow = rows.every((r) => r === rows[0]), sameCol = cols.every((c) => c === cols[0]);
  if (!sameRow && !sameCol) return { err: 'Tiles must be in one line' };
  const empty = board.every((x) => !x), newSet = new Set(pend.map((p) => p.i));
  const at = (r, c) => (r < 0 || c < 0 || r > 14 || c > 14 ? '' : B[r * 15 + c]);
  const wordAt = (r, c, dr, dc) => { while (at(r - dr, c - dc)) { r -= dr; c -= dc; } const cells = []; while (at(r, c)) { cells.push(r * 15 + c); r += dr; c += dc; } return cells; };
  let dir = sameRow && pend.length > 1 ? [0, 1] : sameCol && pend.length > 1 ? [1, 0] : null;
  if (!dir) { const r = rows[0], c = cols[0]; dir = at(r, c - 1) || at(r, c + 1) ? [0, 1] : [1, 0]; }
  const main = wordAt(rows[0], cols[0], dir[0], dir[1]);
  for (const p of pend) if (!main.includes(p.i)) return { err: 'Leave no gaps between your tiles' };
  const words = []; if (main.length > 1) words.push(main);
  for (const p of pend) { const w = wordAt(Math.floor(p.i / 15), p.i % 15, dir[1], dir[0]); if (w.length > 1) words.push(w); }
  if (empty) { if (!newSet.has(112)) return { err: 'The first word must cover the centre star' }; if (main.length < 2) return { err: 'Words need at least 2 letters' }; }
  else if (!words.some((w) => w.some((i) => !newSet.has(i)))) return { err: 'Your word must join tiles already on the board' };
  if (!words.length) return { err: 'Words need at least 2 letters' };
  let total = 0; const list = [];
  for (const w of words) { let sum = 0, mult = 1; const txt = w.map((i) => B[i].toUpperCase()).join('');
    for (const i of w) { let v = tileVal(B[i]); if (newSet.has(i)) { const pm = PREM[i]; if (pm === 'DL') v *= 2; if (pm === 'TL') v *= 3; if (pm === 'DW') mult *= 2; if (pm === 'TW') mult *= 3; } sum += v; }
    total += sum * mult; list.push(txt); }
  if (pend.length === 7) total += 50;
  return { words: list, score: total, board: B };
}
const wLimit = (st) => (st && st.limit !== undefined && st.limit !== null ? st.limit : 60);
function wtState() { return S.wt || (S.wt = { pend: [], sel: null, swap: [] }); }
G.words = {
  name: 'Word Tiles', short: 'Our own word board', icon: ICON('<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="M6 9l1-4 1 4M16 5h2.5a1.5 1.5 0 0 1 0 3H16zm0 3h2.5a1.5 1.5 0 0 1 0 3H16z"/>'),
  desc: 'Build crossword-style words on a 15×15 board. Coloured squares double or triple letters and words. Using all 7 tiles earns 50 extra points.',
  start(me) { const bag = []; for (const [l, [n]] of Object.entries(LETTERS)) for (let k = 0; k < n; k++) bag.push(l); shuffleArr(bag);
    const st = { kind: 'words', board: Array(225).fill(''), bag, racks: { anthonia: bag.splice(0, 7), ifeayomi: bag.splice(0, 7) }, scores: { anthonia: 0, ifeayomi: 0 }, turn: me, passes: 0, last: [], limit: 60, turnStart: null };
    st.msg = `${NAMES[me]} goes first`; S.wt = null; return st; },
  score: (st) => [st.scores.anthonia, st.scores.ifeayomi],
  view(st, me) {
    loadWords(); const w = wtState(), mine = st.turn === me && !st.over;
    if (w.game !== st.updatedAt) { w.game = st.updatedAt; w.pend = []; w.sel = null; w.swap = []; }
    const used = new Set(w.pend.map((p) => p.ri)), pmap = Object.fromEntries(w.pend.map((p) => [p.i, p]));
    const cells = st.board.map((ch, i) => { const p = pmap[i], pm = PREM[i]; const last = (st.last || []).includes(i);
      if (ch) return `<div class="wc t${last ? ' last' : ''}">${ch.toUpperCase()}<sub>${tileVal(ch) || ''}</sub></div>`;
      if (p) return `<button class="wc t pend" data-act="g" data-g="words" data-a="unplace" data-x="${i}">${p.ch.toUpperCase()}<sub>${tileVal(p.ch) || ''}</sub></button>`;
      return `<button class="wc ${pm || ''}${i === 112 ? ' star' : ''}" data-act="g" data-g="words" data-a="place" data-x="${i}" ${mine ? '' : 'disabled'}>${i === 112 ? '★' : pm || ''}</button>`; }).join('');
    const prev = mine && w.pend.length && WORDS ? wordMove(st.board, w.pend) : null;
    const prevTxt = prev ? (prev.err ? `<span class="small muted">${prev.err}</span>` : `<span class="small">${prev.words.map((x) => `<b style="color:${WORDS.has(x) ? 'var(--him)' : '#e11d48'}">${x}</b>`).join(', ')} · ${prev.score} pts</span>`) : '';
    const lim = wLimit(st), opts = [0, 60, 120, 180, 300];
    const timer = st.over ? '' : st.fresh && mine ? `<div class="row small"><span class="muted">Turn timer:</span>${opts.map((v) => gbtn('words', 'limit', v ? v / 60 + ' min' : 'Off', 'sm' + (lim === v ? ' on' : ''), `data-x="${v}"`)).join('')}</div>`
      : lim ? `<div class="wtimer ${mine ? 'mine' : ''}" id="wtimer"><span class="wt-bar"><i id="wtbar"></i></span><b id="wttxt">${mine ? (st.turnStart ? '' : G.words.fmt(lim)) : NAMES[st.turn] + "'s clock"}</b></div>` : '';
    return `${timer}<div class="row between"><div class="row">${av('anthonia', 28)}<b>${st.scores.anthonia}</b></div><span class="small muted">${st.bag.length} tiles in bag</span><div class="row"><b>${st.scores.ifeayomi}</b>${av('ifeayomi', 28)}</div></div>
    ${WORDS ? '' : '<div class="locked">Loading the dictionary…</div>'}
    <div class="boardwrap2 ${S.wzoom ? 'zoom' : ''}"><div class="wboard">${cells}</div></div>
    <div class="row">${gbtn('words', 'zoom', S.wzoom ? 'Fit board' : 'Zoom in', 'sm')}${prevTxt}</div>
    <span class="eyebrow">Your tiles</span>
    <div class="rack">${st.racks[me].map((ch, k) => used.has(k) ? '<span class="rt ghost"></span>' : `<button class="rt ${w.sel === k ? 'sel' : ''} ${w.swap.includes(k) ? 'swap' : ''}" data-act="g" data-g="words" data-a="sel" data-x="${k}" ${mine ? '' : 'disabled'}>${ch === '?' ? '' : ch}<sub>${ch === '?' ? '' : LETTERS[ch][1]}</sub></button>`).join('')}</div>
    ${mine ? `<div class="row">${gbtn('words', 'play', 'Play word', 'primary', w.pend.length ? '' : 'disabled')}${gbtn('words', 'recall', 'Recall', 'sm')}${gbtn('words', 'shuffle', 'Shuffle', 'sm')}${gbtn('words', 'swapMode', w.swapping ? 'Cancel swap' : 'Swap tiles', 'sm')}${gbtn('words', 'pass', 'Pass', 'sm')}</div>
      ${w.swapping ? `<div class="row small"><span class="muted">Tap tiles to swap, then</span>${gbtn('words', 'doSwap', `Swap ${w.swap.length}`, 'sm teal', w.swap.length && st.bag.length >= 7 ? '' : 'disabled')}</div>` : ''}` : ''}
    ${(st.log || []).length ? `<div class="small muted">${st.log.slice(0, 3).map(esc).join('<br>')}</div>` : ''}`;
  },
  act: {
    zoom() { S.wzoom = !S.wzoom; render(true); },
    limit(st, t) { if (!st.fresh || st.turn !== S.role) return; st.limit = +t.dataset.x; saveGame('words', st, true); },
    sel(st, t) { if (st.fresh && wLimit(st) && !st.turnStart && st.turn === S.role) { st.turnStart = Date.now(); saveGame('words', st); }
      const w = wtState(), k = +t.dataset.x; if (w.swapping) { w.swap = w.swap.includes(k) ? w.swap.filter((x) => x !== k) : [...w.swap, k]; } else w.sel = w.sel === k ? null : k; render(true); },
    place(st, t) { const w = wtState(), me = S.role; if (st.turn !== me) return; if (w.sel === null) return toast('Tap one of your tiles first'); const i = +t.dataset.x, ch = st.racks[me][w.sel];
      if (ch === '?') { const ri = w.sel; return openSheet(`${sheetHead('Blank tile: pick a letter')}<div class="letters">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => `<button data-act="g" data-g="words" data-a="blank" data-x="${i}" data-r="${ri}" data-l="${l}">${l}</button>`).join('')}</div>`); }
      w.pend.push({ i, ch, ri: w.sel }); w.sel = null; render(true); },
    blank(st, t) { closeSheet(); const w = wtState(); w.pend.push({ i: +t.dataset.x, ch: t.dataset.l.toLowerCase(), ri: +t.dataset.r }); w.sel = null; render(true); },
    unplace(st, t) { const w = wtState(); w.pend = w.pend.filter((p) => p.i !== +t.dataset.x); render(true); },
    recall() { const w = wtState(); w.pend = []; w.sel = null; render(true); },
    shuffle(st) { const me = S.role; wtState().pend = []; shuffleArr(st.racks[me]); saveGame('words', st); },
    swapMode() { const w = wtState(); w.swapping = !w.swapping; w.swap = []; w.pend = []; render(true); },
    doSwap(st) { const w = wtState(), me = S.role; if (st.turn !== me || st.bag.length < 7 || !w.swap.length) return; const out = w.swap.map((k) => st.racks[me][k]);
      st.racks[me] = st.racks[me].filter((_, k) => !w.swap.includes(k)); st.bag.push(...out); shuffleArr(st.bag); st.racks[me].push(...st.bag.splice(0, out.length));
      st.turn = other(me); st.turnStart = null; st.passes = (st.passes || 0) + 1; st.last = []; logLine(st, `${NAMES[me]} swapped ${out.length} tiles`); w.swapping = false; w.swap = []; G.words.checkEnd(st); saveGame('words', st); },
    pass(st) { const me = S.role; if (st.turn !== me) return; st.turn = other(me); st.turnStart = null; st.passes = (st.passes || 0) + 1; st.last = []; logLine(st, `${NAMES[me]} passed`); G.words.checkEnd(st); saveGame('words', st); },
    async play(st) { const me = S.role, w = wtState(); if (st.turn !== me) return; await loadWords(); const r = wordMove(st.board, w.pend);
      if (r.err) return toast(r.err); const bad = r.words.filter((x) => !WORDS.has(x)); if (bad.length) return toast(`${bad.join(', ')} isn't in the dictionary`);
      st.board = r.board; const usedIdx = new Set(w.pend.map((p) => p.ri)); st.racks[me] = st.racks[me].filter((_, k) => !usedIdx.has(k)); st.racks[me].push(...st.bag.splice(0, 7 - st.racks[me].length));
      st.scores[me] += r.score; st.last = w.pend.map((p) => p.i); st.passes = 0; st.turn = other(me); st.turnStart = null; logLine(st, `${NAMES[me]} played ${r.words.join(', ')} for ${r.score}`);
      if (w.pend.length === 7) toast('BINGO! +50'); w.pend = [];
      if (!st.bag.length && !st.racks[me].length) { const left = st.racks[other(me)].reduce((a, ch) => a + tileVal(ch), 0); st.scores[me] += left; st.scores[other(me)] -= left; G.words.end(st); }
      saveGame('words', st); },
  },
  fmt: (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, '0')}`,
  post(st, me) { if (!st || st.over || !wLimit(st)) return;
    if (st.turn === me && !st.turnStart && !st.fresh) { const k = (st.updatedAt || 0) + ':' + st.turn; if (G.words.startKey === k) return; G.words.startKey = k; setTimeout(() => mergeDoc('games/words', { turnStart: Date.now() }), 0); return; }
    if (st.turn === me && !st.turnStart && st.fresh) return;
    if (!G.words.iv) G.words.iv = setInterval(G.words.tick, 500); G.words.tick(); },
  tick() { const st = S.games.words, el = document.getElementById('wttxt'), bar = document.getElementById('wtbar');
    if (!st || st.over || !wLimit(st) || !st.turnStart || !el) { if (!document.getElementById('wtimer')) { clearInterval(G.words.iv); G.words.iv = null; } return; }
    const left = wLimit(st) - (Date.now() - st.turnStart) / 1000, mine = st.turn === S.role;
    el.textContent = mine ? `${G.words.fmt(left)} left` : `${NAMES[st.turn]}: ${G.words.fmt(left)}`; if (bar) bar.style.width = Math.max(0, left / wLimit(st) * 100) + '%';
    document.getElementById('wtimer').classList.toggle('low', left < 30);
    if (left <= 0 && (mine || left < -15) && !G.words.firing) { G.words.firing = true; const s2 = JSON.parse(JSON.stringify(st)); const who = s2.turn;
      wtState().pend = []; s2.turn = other(who); s2.turnStart = null; s2.passes = (s2.passes || 0) + 1; s2.last = []; logLine(s2, `${NAMES[who]} ran out of time`);
      G.words.checkEnd(s2); toast(mine ? "Time's up! Your turn passed" : `${NAMES[who]} ran out of time`); saveGame('words', s2).finally(() => { G.words.firing = false; }); } },
  checkEnd(st) { if ((st.passes || 0) >= 4) { for (const r of ['anthonia', 'ifeayomi']) st.scores[r] -= st.racks[r].reduce((a, ch) => a + tileVal(ch), 0); G.words.end(st); } },
  end(st) { st.over = true; st.turn = null; const a = st.scores.anthonia, i = st.scores.ifeayomi; st.winner = a === i ? 'tie' : a > i ? 'anthonia' : 'ifeayomi'; },
};

/* =================================== PROPERTY GAME =================================== */
const PSP = [
  { n: 'Start', t: 'start' }, { n: 'Oyo Town', t: 'p', g: 'brown', p: 60 }, { n: 'Love Note', t: 'card' }, { n: 'Ogbomoso', t: 'p', g: 'brown', p: 80 },
  { n: 'Flight Tax', t: 'tax', p: 100 }, { n: 'Bus 522', t: 'tr', p: 150 }, { n: 'Bodija', t: 'p', g: 'sky', p: 100 }, { n: 'Lucky Jar', t: 'jar' },
  { n: 'Missed Call', t: 'jail' }, { n: 'Ring Road', t: 'p', g: 'sky', p: 110 }, { n: 'Dugbe', t: 'p', g: 'sky', p: 120 }, { n: 'Pig Farm', t: 'ut', p: 150 },
  { n: 'Iwo Road', t: 'p', g: 'purple', p: 140 }, { n: 'Date Night', t: 'date' }, { n: 'Mokola', t: 'p', g: 'purple', p: 150 }, { n: 'Train to Rome', t: 'tr', p: 150 },
  { n: 'Free Hug', t: 'free' }, { n: 'Falconara', t: 'p', g: 'pink', p: 160 }, { n: 'Love Note', t: 'card' }, { n: 'Ancona Port', t: 'p', g: 'pink', p: 180 },
  { n: 'Passetto', t: 'p', g: 'pink', p: 200 }, { n: 'Lucky Jar', t: 'jar' }, { n: 'Senigallia', t: 'p', g: 'red', p: 220 }, { n: 'Loreto', t: 'p', g: 'red', p: 240 },
  { n: 'Go to Missed Call', t: 'gojail' }, { n: 'Lekki', t: 'p', g: 'orange', p: 260 }, { n: 'Victoria Island', t: 'p', g: 'orange', p: 280 }, { n: 'Data Bill', t: 'tax', p: 75 },
  { n: 'Flight to Italy', t: 'tr', p: 200 }, { n: 'Rome', t: 'p', g: 'gold', p: 320 }, { n: 'Love Note', t: 'card' }, { n: 'Venice', t: 'p', g: 'gold', p: 380 },
];
const PSHY = { Falconara: 'Falco&shy;nara', Senigallia: 'Seni&shy;gallia', Passetto: 'Pas&shy;setto', Mokola: 'Mo&shy;kola', Ogbomoso: 'Ogbo&shy;moso', Bodija: 'Bo&shy;dija', Loreto: 'Lo&shy;reto', Victoria: 'Victoria' };
const PN = PSP.length, TRANS = [5, 15, 28];
const PCOL = { brown: '#a0612f', sky: '#6cc6ff', purple: '#9b6cff', pink: '#ff7fb0', red: '#ef4444', orange: '#ff9f43', gold: '#f5b700' };
const LOVE = [
  ['Your partner sent you flowers. Collect ₦100.', 100], ['You forgot to call back. Pay ₦50.', -50], ['Surprise data top-up from your love. Collect ₦60.', 60],
  ['Long-distance call bill. Pay ₦40.', -40], ['You won the daily question streak. Collect ₦80.', 80], ['Advance to Start.', 'start'],
  ['Surprise visit! Move to Ancona Port.', 'm19'], ['Go to Missed Call. Do not pass Start.', 'jail'], ['Date night was on you. Pay ₦70.', -70],
  ['Your pigs had piglets! Collect ₦120.', 120], ['Birthday gift from your partner: they pay you ₦50.', 'gift'], ['You bought matching jerseys. Pay ₦30.', -30],
  ['TrendX had a great week. Collect ₦150.', 150], ['Romantic trip! Move to Venice.', 'm31'], ['Get-out-of-Missed-Call card: keep it for later.', 'free'],
];
const JAR = [
  ['Found ₦100 in your old jeans!', 100], ['Bought suya for everyone. Pay ₦40.', -40], ['Your partner owes you a kiss and ₦50.', 'gift'],
  ['Swap places with your partner!', 'swap'], ['Lucky breeze: move forward 3.', 'fwd3'], ['Collect ₦20 for every place you own.', 'perprop'],
  ['Pay ₦25 for every house you own. Repairs!', 'repairs'], ['Jackpot! Collect ₦200.', 200], ['Oops, you dropped your phone. Pay ₦80.', -80],
];
const ringPos = (i) => (i <= 8 ? [8, 8 - i] : i <= 16 ? [16 - i, 0] : i <= 24 ? [0, i - 16] : [i - 24, 8]);
const groupOf = (g) => PSP.map((s, i) => (s.g === g ? i : -1)).filter((i) => i >= 0);
const HOUSE_MULT = [1, 5, 15, 35, 60];
function propRent(st, i, dice) { const s = PSP[i], o = st.own[i]; if (!o) return 0;
  if (s.t === 'tr') { const n = TRANS.filter((k) => st.own[k] && st.own[k].by === o.by).length; return 25 * 2 ** (n - 1); }
  if (s.t === 'ut') return 6 * dice;
  const base = Math.round(s.p / 10), full = groupOf(s.g).every((k) => st.own[k] && st.own[k].by === o.by), h = o.houses || 0;
  return h ? base * HOUSE_MULT[h] : full ? base * 2 : base; }
function worth(st, r) { let w = st.cash[r]; for (const [i, o] of Object.entries(st.own)) if (o.by === r) w += PSP[i].p + (o.houses || 0) * Math.round(PSP[i].p / 2); return w; }
const DOTS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const dieFace = (n, cls = '') => `<span class="dface ${cls}">${Array.from({ length: 9 }, (_, k) => `<i class="${(DOTS[n] || []).includes(k) ? 'on' : ''}"></i>`).join('')}</span>`;
function spinDice(sel, faces, ms = 700) { return new Promise((res) => { const els = [...document.querySelectorAll(sel)]; els.forEach((e) => e.classList.add('rolling'));
  const iv = setInterval(() => els.forEach((e) => { const n = 1 + Math.floor(Math.random() * 6); e.querySelectorAll('i').forEach((d, k) => d.classList.toggle('on', DOTS[n].includes(k))); }), 80);
  setTimeout(() => { clearInterval(iv); els.forEach((e, k) => { e.classList.remove('rolling'); if (faces[k]) e.querySelectorAll('i').forEach((d, j) => d.classList.toggle('on', DOTS[faces[k]].includes(j))); }); res(); }, ms); }); }
let propAnim = null, propSeen = null;
G.property = {
  legacy: (st) => !st || !st.laps || Object.values(st.pos || {}).some((p) => p >= PN),
  name: 'Pods Property', short: 'Buy Oyo, Ibadan, Ancona & Venice', icon: ICON('<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/>'),
  desc: 'Tap your avatar to roll, watch your piece hop round 32 places from Oyo Town to Venice, buy them and charge rent. Own a whole colour to double rent and build up to 4 houses. Love Notes, Lucky Jars and Date Nights bring surprises. Run your partner out of money, or end the game and the richest wins.',
  start(first) { return { kind: 'property', pos: { anthonia: 0, ifeayomi: 0 }, cash: { anthonia: 2000, ifeayomi: 2000 }, own: {}, turn: first, phase: 'roll', dice: [3, 4], dbl: 0, jail: { anthonia: 0, ifeayomi: 0 }, free: {}, laps: { anthonia: 0, ifeayomi: 0 }, mv: null, msg: `${NAMES[first]} rolls first` }; },
  score: (st) => ['₦' + worth(st, 'anthonia'), '₦' + worth(st, 'ifeayomi')],
  view(st, me) {
    const mine = st.turn === me && !st.over, cells = [], shown = { ...st.pos, ...(propAnim ? { [propAnim.who]: propAnim.at } : {}) };
    for (let i = 0; i < PN; i++) { const s = PSP[i], [r, c] = ringPos(i), o = st.own[i];
      const tok = ['anthonia', 'ifeayomi'].filter((x) => shown[x] === i).map((x) => `<span class="ptok ${propAnim && propAnim.who === x ? 'hop' : ''}">${av(x, 20)}</span>`).join('');
      cells.push(`<button class="pcell ${s.t}${st.mv && st.mv.to === i && !propAnim ? ' landed' : ''}" style="grid-row:${r + 1};grid-column:${c + 1}" data-act="g" data-g="property" data-a="info" data-x="${i}">${s.g ? `<i style="background:${PCOL[s.g]}"></i>` : ''}<span class="${s.n.length > 12 ? 'xlong' : s.n.length > 7 ? 'long' : ''}">${PSHY[s.n] || s.n}</span>${s.p && s.t !== 'tax' ? `<em>₦${s.p}</em>` : s.t === 'tax' ? `<em>-₦${s.p}</em>` : ''}${o ? `<u class="${o.by}">${o.houses ? '<b>' + '⌂'.repeat(o.houses) + '</b>' : ''}</u>` : ''}<div class="toks">${tok}</div></button>`); }
    const here = PSP[st.pos[me]], d = st.dice;
    const buildable = Object.entries(st.own).filter(([i, o]) => o.by === me && PSP[i].g && (o.houses || 0) < 4 && groupOf(PSP[i].g).every((k) => st.own[k] && st.own[k].by === me));
    const wallet = (r) => { const n = Object.values(st.own).filter((o) => o.by === r).length; const canRoll = r === me && mine && st.phase === 'roll';
      return `<button class="wallet ${r} ${st.turn === r && !st.over ? 'active' : ''} ${canRoll ? 'canroll' : ''}" ${canRoll ? 'data-act="g" data-g="property" data-a="roll"' : 'disabled'}>${av(r, 44)}<span><b>${NAMES[r]}</b><span class="cash">₦${st.cash[r].toLocaleString()}</span><span class="small muted">${n} place${n === 1 ? '' : 's'}${st.jail[r] ? ' · on a missed call' : ''}${st.free && st.free[r] ? ' · free card' : ''}</span></span>${canRoll ? '<em class="tap">Tap to roll</em>' : ''}</button>`; };
    const center = `<div class="pcenter"><div class="pdice">${dieFace(d[0], 'pd')}${dieFace(d[1], 'pd')}</div>
      ${st.card ? `<div class="lovecard">${esc(st.card)}</div>` : `<div class="small muted center">${esc(st.msg || '')}</div>`}
      ${mine && !propAnim ? (st.phase === 'buy' ? `<div class="row" style="justify-content:center">${gbtn('property', 'buy', `Buy ${here.n} ₦${here.p}`, 'primary sm')}${gbtn('property', 'skip', 'No thanks', 'sm')}</div>`
        : st.phase === 'end' ? gbtn('property', 'end', 'End turn', 'teal sm') : st.phase === 'roll' ? '<span class="small" style="color:var(--her);font-weight:800">Tap your avatar to roll</span>' : '') : ''}
      ${mine && st.jail[me] && st.phase === 'roll' ? (st.free && st.free[me] ? gbtn('property', 'useFree', 'Use free card', 'sm') : st.cash[me] >= 50 ? gbtn('property', 'bail', 'Pay ₦50 to leave', 'sm') : '') : ''}</div>`;
    return `<div class="wallets">${wallet('anthonia')}${wallet('ifeayomi')}</div>
    <div class="pboardwrap ${S.pzoom ? 'zoom' : ''}"><div class="pboard">${cells.join('')}${center}</div></div>
    <div class="row">${gbtn('property', 'zoom', S.pzoom ? 'Fit board' : 'Zoom in', 'sm')}${!st.over ? gbtn('property', 'finish', 'End game & count', 'sm ghost') : ''}</div>
    ${mine && buildable.length ? `<span class="eyebrow">Build a house (up to 4)</span><div class="row">${buildable.map(([i]) => gbtn('property', 'build', `${PSP[i].n} ₦${Math.round(PSP[i].p / 2)}`, 'sm', `data-x="${i}"`)).join('')}</div>` : ''}
    <div class="small muted">${(st.log || []).slice(0, 3).map(esc).join('<br>')}</div>`;
  },
  post(st) { if (!st || !st.mv || propAnim) return; if (propSeen === null) { propSeen = st.mv.id; return; } if (st.mv.id === propSeen) return; propSeen = st.mv.id;
    const mv = st.mv; spinDice('.pdice .dface', mv.dice, 650).then(() => { if (!mv.steps) { render(true); return; } propAnim = { who: mv.who, at: mv.from }; let k = 0;
      const hop = () => { k++; propAnim.at = (mv.from + k) % PN; render(true); if (k < mv.steps) setTimeout(hop, 170); else setTimeout(() => { propAnim = null; render(true); }, 260); }; setTimeout(hop, 120); }); },
  act: {
    zoom() { S.pzoom = !S.pzoom; render(true); },
    info(st, t) { const i = +t.dataset.x; openSheet('<div class="row" style="justify-content:flex-end;margin-bottom:-6px"><button class="x" data-act="close" aria-label="Close">×</button></div>' + G.property.deed(st, i)); },
    async roll(st) { const me = S.role; if (st.turn !== me || st.phase !== 'roll' || propAnim) return; const d = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)], dbl = d[0] === d[1];
      st.dice = d; st.card = null; const from = st.pos[me]; let steps = 0;
      if (st.jail[me]) { if (dbl) { st.jail[me] = 0; logLine(st, `${NAMES[me]} rolled doubles and left Missed Call`); }
        else if (st.jail[me] >= 3) { st.jail[me] = 0; st.cash[me] -= 50; logLine(st, `${NAMES[me]} paid ₦50 after 3 tries`); }
        else { st.jail[me]++; st.phase = 'end'; logLine(st, `${NAMES[me]} is still on a missed call`); st.mv = { id: Date.now(), who: me, from, steps: 0, dice: d }; return saveGame('property', st); }
        steps = d[0] + d[1]; G.property.move(st, steps, false); }
      else { if (dbl) { st.dbl = (st.dbl || 0) + 1; if (st.dbl >= 3) { st.pos[me] = 8; st.jail[me] = 1; st.dbl = 0; st.phase = 'end'; logLine(st, 'Three doubles! Straight to Missed Call'); st.mv = { id: Date.now(), who: me, from, steps: 0, dice: d }; return saveGame('property', st); } } else st.dbl = 0;
        steps = d[0] + d[1]; G.property.move(st, steps, dbl); }
      st.mv = { id: Date.now(), who: me, from, steps, dice: d, to: (from + steps) % PN }; saveGame('property', st); },
    bail(st) { const me = S.role; if (st.turn !== me || !st.jail[me]) return; st.cash[me] -= 50; st.jail[me] = 0; logLine(st, `${NAMES[me]} paid ₦50 to leave`); saveGame('property', st); },
    useFree(st) { const me = S.role; if (st.turn !== me || !st.jail[me] || !st.free[me]) return; st.free[me] = 0; st.jail[me] = 0; logLine(st, `${NAMES[me]} used a free card`); saveGame('property', st); },
    buy(st) { const me = S.role, i = st.pos[me], s = PSP[i]; if (st.turn !== me || st.phase !== 'buy' || st.own[i] || st.cash[me] < s.p) return; st.cash[me] -= s.p; st.own[i] = { by: me, houses: 0 };
      logLine(st, `${NAMES[me]} bought ${s.n}`); st.phase = st.again ? 'roll' : 'end'; floatHearts(); saveGame('property', st); },
    skip(st) { if (st.turn !== S.role) return; st.phase = st.again ? 'roll' : 'end'; saveGame('property', st); },
    build(st, t) { const me = S.role, i = +t.dataset.x, o = st.own[i], cost = Math.round(PSP[i].p / 2); if (st.turn !== me || !o || o.by !== me || (o.houses || 0) >= 4) return; if (st.cash[me] < cost) return toast('Not enough cash');
      st.cash[me] -= cost; o.houses = (o.houses || 0) + 1; logLine(st, `${NAMES[me]} built a house on ${PSP[i].n}`); saveGame('property', st); },
    end(st) { const me = S.role; if (st.turn !== me) return; st.turn = other(me); st.phase = 'roll'; st.again = false; st.dbl = 0; st.card = null; st.msg = `${NAMES[st.turn]}'s turn to roll`; saveGame('property', st); },
    finish(st, t) { if (t.dataset.sure !== '1') { t.dataset.sure = '1'; t.textContent = 'Tap again to end and count'; return; } const a = worth(st, 'anthonia'), i = worth(st, 'ifeayomi');
      st.over = true; st.turn = null; st.winner = a === i ? 'tie' : a > i ? 'anthonia' : 'ifeayomi'; logLine(st, `Final worth: Anthonia ₦${a}, Ifeayomi ₦${i}`); saveGame('property', st); },
  },
  deed(st, i) { const s = PSP[i], o = st.own[i], here = ['anthonia', 'ifeayomi'].filter((r) => st.pos[r] === i);
    const owner = o ? `<div class="deedown">${av(o.by, 30)}<span>Owned by <b>${NAMES[o.by]}</b>${o.houses ? ` · ${o.houses} house${o.houses > 1 ? 's' : ''}` : ''}</span></div>` : s.p && s.t !== 'tax' ? '<div class="deedown"><span>Nobody owns this yet</span></div>' : '';
    const standing = here.length ? `<p class="small muted center" style="margin:0">${here.map((r) => NAMES[r]).join(' and ')} ${here.length > 1 ? 'are' : 'is'} here now</p>` : '';
    if (s.t === 'p') { const base = Math.round(s.p / 10), hc = Math.round(s.p / 2), grp = groupOf(s.g), full = o && grp.every((k) => st.own[k] && st.own[k].by === o.by), h = o ? o.houses || 0 : -1;
      const row = (label, v, on) => `<div class="drow ${on ? 'on' : ''}"><span>${label}</span><b>₦${v}</b></div>`;
      return `<div class="deed"><div class="deedtop" style="background:${PCOL[s.g]}"><small>TITLE DEED</small><h2>${s.n}</h2></div>
        <div class="deedbody">${row('Rent', base, o && !full && h === 0)}${row('Rent with the whole colour set', base * 2, o && full && h === 0)}${[1, 2, 3, 4].map((n) => row(`With ${n} house${n > 1 ? 's' : ''}`, base * HOUSE_MULT[n], h === n)).join('')}
        <div class="dline"></div>${row('Price', s.p)}${row('Each house costs', hc)}
        <p class="small muted" style="margin:4px 0 0">Colour set: ${grp.map((k) => `<span class="dset ${st.own[k] ? st.own[k].by : ''}">${PSP[k].n}</span>`).join(' ')}</p>${o ? `<p class="small" style="margin:4px 0 0">Rent right now: <b>₦${propRent(st, i, 7)}</b></p>` : ''}</div></div>${owner}${standing}`; }
    if (s.t === 'tr') { const n = o ? TRANS.filter((k) => st.own[k] && st.own[k].by === o.by).length : 0;
      return `<div class="deed"><div class="deedtop" style="background:#3a1f2b"><small>TRANSPORT</small><h2>${s.n}</h2></div><div class="deedbody">${[1, 2, 3].map((k) => `<div class="drow ${n === k ? 'on' : ''}"><span>Owner has ${k} transport${k > 1 ? 's' : ''}</span><b>₦${25 * 2 ** (k - 1)}</b></div>`).join('')}<div class="dline"></div><div class="drow"><span>Price</span><b>₦${s.p}</b></div><p class="small muted" style="margin:4px 0 0">${TRANS.map((k) => `<span class="dset ${st.own[k] ? st.own[k].by : ''}">${PSP[k].n}</span>`).join(' ')}</p></div></div>${owner}${standing}`; }
    if (s.t === 'ut') return `<div class="deed"><div class="deedtop" style="background:#ff8fab"><small>FARM</small><h2>${s.n}</h2></div><div class="deedbody"><div class="drow"><span>Rent</span><b>6 × the dice</b></div><div class="dline"></div><div class="drow"><span>Price</span><b>₦${s.p}</b></div></div></div>${owner}${standing}`;
    const info = { card: ['LOVE NOTE', '#ff4f7e', 'Pick a Love Note card: gifts, bills, surprise trips or a free card.'], jar: ['LUCKY JAR', '#ffb21f', 'Open the jar for a surprise: jackpots, swaps, repairs and more.'], date: ['DATE NIGHT', '#d6336c', 'You treat your partner: pay them ₦50.'], tax: ['PAY UP', '#6b7280', `Pay ₦${s.p}.`], jail: ['MISSED CALL', '#3a1f2b', 'Stuck here? Roll doubles, use a free card or pay ₦50. You leave free after 3 tries.'], gojail: ['GO TO MISSED CALL', '#3a1f2b', 'Go straight to Missed Call. Do not pass Start.'], start: ['START', '#22b3a3', 'Collect ₦200 every time you pass.'], free: ['FREE HUG', '#22b3a3', 'Nothing happens. Enjoy the hug.'] }[s.t];
    return `<div class="deed"><div class="deedtop" style="background:${info[1]}"><small>${info[0]}</small><h2>${s.n}</h2></div><div class="deedbody"><p style="margin:0">${info[2]}</p></div></div>${standing}`; },
  move(st, steps, dbl) { st.laps = st.laps || {}; st.free = st.free || {}; const me = S.role, from = st.pos[me], to = (from + steps) % PN; if (from + steps >= PN) { st.cash[me] += 200; st.laps[me] = (st.laps[me] || 0) + 1; logLine(st, `${NAMES[me]} passed Start: +₦200`); }
    st.pos[me] = to; st.again = dbl; G.property.land(st, steps); },
  land(st, dice) { const me = S.role, you = other(me), i = st.pos[me], s = PSP[i]; st.phase = st.again ? 'roll' : 'end';
    const toJail = () => { st.pos[me] = 8; st.jail[me] = 1; st.again = false; st.phase = 'end'; };
    if (s.t === 'p' || s.t === 'tr' || s.t === 'ut') { const o = st.own[i];
      if (!o) { if (st.cash[me] >= s.p) st.phase = 'buy'; logLine(st, `${NAMES[me]} landed on ${s.n}`); }
      else if (o.by === you) { const rent = propRent(st, i, dice); st.cash[me] -= rent; st.cash[you] += rent; logLine(st, `${NAMES[me]} paid ${NAMES[you]} ₦${rent} rent for ${s.n}`); }
      else logLine(st, `${NAMES[me]} is home at ${s.n}`); }
    else if (s.t === 'tax') { st.cash[me] -= s.p; logLine(st, `${s.n}: ${NAMES[me]} paid ₦${s.p}`); }
    else if (s.t === 'date') { st.cash[me] -= 50; st.cash[you] += 50; st.card = `Date Night! ${NAMES[me]} treats ${NAMES[you]}: ₦50.`; logLine(st, st.card); }
    else if (s.t === 'gojail') { toJail(); logLine(st, `${NAMES[me]} went to Missed Call`); }
    else if (s.t === 'card' || s.t === 'jar') { const deck = s.t === 'card' ? LOVE : JAR; const [txt, eff] = deck[Math.floor(Math.random() * deck.length)]; st.card = (s.t === 'card' ? 'Love Note: ' : 'Lucky Jar: ') + txt;
      if (typeof eff === 'number') st.cash[me] += eff;
      else if (eff === 'start') { st.pos[me] = 0; st.cash[me] += 200; }
      else if (eff === 'jail') toJail();
      else if (eff === 'gift') { st.cash[me] += 50; st.cash[you] -= 50; }
      else if (eff === 'free') { st.free = st.free || {}; st.free[me] = 1; }
      else if (eff === 'swap') { const t = st.pos[me]; st.pos[me] = st.pos[you]; st.pos[you] = t; }
      else if (eff === 'fwd3') { st.pos[me] = (st.pos[me] + 3) % PN; logLine(st, st.card); return G.property.land(st, dice); }
      else if (eff === 'perprop') st.cash[me] += 20 * Object.values(st.own).filter((o) => o.by === me).length;
      else if (eff === 'repairs') st.cash[me] -= 25 * Object.values(st.own).filter((o) => o.by === me).reduce((a, o) => a + (o.houses || 0), 0);
      else if (typeof eff === 'string' && eff[0] === 'm') { const to = +eff.slice(1); if (to < st.pos[me]) st.cash[me] += 200; st.pos[me] = to; logLine(st, st.card); return G.property.land(st, dice); }
      logLine(st, st.card); }
    else logLine(st, `${NAMES[me]} landed on ${s.n}`);
    for (const r of [me, you]) if (st.cash[r] < 0) { st.over = true; st.turn = null; st.winner = other(r); logLine(st, `${NAMES[r]} ran out of money!`); } },
};

/* =================================== LUDO (4 houses, 2 dice) =================================== */
const LPATH = [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0]];
const LH = [ // the four houses: top-left, top-right, bottom-right, bottom-left
  { start: 0, col: '#ff4f7e', name: 'Rose', home: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]], yard: [[1, 1], [1, 4], [4, 1], [4, 4]], box: [0, 0] },
  { start: 13, col: '#22b3a3', name: 'Teal', home: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]], yard: [[1, 10], [1, 13], [4, 10], [4, 13]], box: [0, 9] },
  { start: 26, col: '#f5a300', name: 'Gold', home: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]], yard: [[10, 10], [10, 13], [13, 10], [13, 13]], box: [9, 9] },
  { start: 39, col: '#5b8cff', name: 'Blue', home: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]], yard: [[10, 1], [10, 4], [13, 1], [13, 4]], box: [9, 0] },
];
const LSAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const lAbs = (h, step) => (LH[h].start + step) % 52;
function lCell(h, step, k) { if (step < 0) return LH[h].yard[k]; if (step <= 50) return LPATH[lAbs(h, step)]; if (step <= 55) return LH[h].home[step - 51]; return [7, 7]; }
const lMine = (st, r) => [0, 1, 2, 3].filter((h) => st.owner[h] === r);
const lCan = (st, h, k, d) => { const s = st.tok[h][k]; return s < 0 ? d === 6 : s + d <= 56 && s !== 56; };
function lAnyMove(st, r) { for (let di = 0; di < 2; di++) { if (st.used[di]) continue; for (const h of lMine(st, r)) for (let k = 0; k < 4; k++) if (lCan(st, h, k, st.dice[di])) return true; } return false; }
let ludoSeen = null, ludoSpin = false;
G.ludo = {
  legacy: (st) => !st || st.v !== 2 || !st.tok || !Array.isArray(st.owner),
  name: 'Ludo', short: '4 houses, 2 dice', icon: ICON('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/><circle cx="16" cy="16" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>'),
  desc: 'Naija Ludo with two dice. Each of you plays two houses on opposite corners. A 6 brings a seed out. Use each die on any of your seeds. Land on your partner\'s seed to send it home (stars are safe). Rolling a 6 or capturing gives you another roll. Get all 8 seeds home to win.',
  start(first) { return { kind: 'ludo', phase: 'pick', owner: [null, null, null, null], tok: { 0: [-1, -1, -1, -1], 1: [-1, -1, -1, -1], 2: [-1, -1, -1, -1], 3: [-1, -1, -1, -1] }, v: 2, turn: first, dice: [6, 6], used: [true, true], rolled: false, sel: 0, msg: `${NAMES[first]} picks colours first` }; },
  score: (st) => ['anthonia', 'ifeayomi'].map((r) => lMine(st, r).reduce((a, h) => a + st.tok[h].filter((s) => s === 56).length, 0) + '/8 home'),
  view(st, me) {
    const mine = st.turn === me && !st.over;
    if (st.phase === 'pick') {
      if (!mine) return `<div class="locked">${av(st.turn, 28)} ${NAMES[st.turn]} is picking colours…</div>`;
      const pair = (a, b) => `<button class="lpair" data-act="g" data-g="ludo" data-a="pick" data-x="${a}"><span style="background:${LH[a].col}"></span><span style="background:${LH[b].col}"></span><b>${LH[a].name} & ${LH[b].name}</b></button>`;
      return `<span class="eyebrow">Pick your two houses (opposite corners)</span><div class="row">${pair(0, 2)}${pair(1, 3)}</div><p class="small muted" style="margin:0">${NAMES[other(me)]} gets the other two.</p>`; }
    const sel = st.used[st.sel] ? (st.used[0] ? 1 : 0) : st.sel, die = st.dice[sel];
    const grid = []; const pathIdx = {}; LPATH.forEach(([r, c], i) => { pathIdx[r * 15 + c] = i; });
    const homeOf = {}; LH.forEach((h, hi) => h.home.forEach(([r, c]) => { homeOf[r * 15 + c] = hi; }));
    const startOf = {}; LH.forEach((h, hi) => { const [r, c] = LPATH[h.start]; startOf[r * 15 + c] = hi; });
    for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) { const key = r * 15 + c; let style = '', cls = 'lc', txt = '';
      const box = LH.findIndex((h) => r >= h.box[0] && r < h.box[0] + 6 && c >= h.box[1] && c < h.box[1] + 6);
      if (box >= 0) { cls += ' yard'; style = `background:${LH[box].col}22`; if (LH[box].yard.some(([y, x]) => y === r && x === c)) { cls += ' spot'; style = `background:#fff;box-shadow:inset 0 0 0 2px ${LH[box].col}55`; } }
      else if (r === 7 && c === 7) cls += ' center';
      else if (r >= 6 && r <= 8 && c >= 6 && c <= 8) cls += ' mid';
      else if (homeOf[key] !== undefined) style = `background:${LH[homeOf[key]].col}`;
      else if (startOf[key] !== undefined) style = `background:${LH[startOf[key]].col}`;
      else if (pathIdx[key] !== undefined && LSAFE.has(pathIdx[key])) txt = '★';
      grid.push(`<div class="${cls}" style="grid-row:${r + 1};grid-column:${c + 1};${style}">${txt}</div>`); }
    const toks = [], stack = {};
    for (let h = 0; h < 4; h++) st.tok[h].forEach((s, k) => { const [y, x] = lCell(h, s, k); const key = y * 15 + x; const n = (stack[key] = (stack[key] || 0) + 1) - 1;
      const own = st.owner[h], can = mine && st.rolled && own === me && !st.used[sel] && lCan(st, h, k, die);
      toks.push(`<button class="ltok ${can ? 'can' : ''}" style="grid-row:${y + 1};grid-column:${x + 1};background:${LH[h].col};border-color:${own === 'anthonia' ? 'var(--her)' : own === 'ifeayomi' ? 'var(--him)' : '#fff'};transform:translate(${n * 4}px,${-n * 4}px)" ${can ? `data-act="g" data-g="ludo" data-a="move" data-h="${h}" data-x="${k}"` : 'disabled'} aria-label="${LH[h].name} seed">${s === 56 ? '✓' : ''}</button>`); });
    const dieBtn = (i) => `<button class="ldie ${st.rolled && !st.used[i] && i === sel ? 'sel' : ''} ${st.rolled && st.used[i] ? 'used' : ''}" ${mine && st.rolled && !st.used[i] ? `data-act="g" data-g="ludo" data-a="selDie" data-x="${i}"` : 'disabled'}>${dieFace(st.dice[i], 'ld')}</button>`;
    const home = (r) => lMine(st, r).reduce((a, h) => a + st.tok[h].filter((s) => s === 56).length, 0);
    return `<div class="row" style="justify-content:space-around">${['anthonia', 'ifeayomi'].map((r) => `<span class="row">${av(r, 28)}${lMine(st, r).map((h) => `<span class="lsw" style="background:${LH[h].col}"></span>`).join('')}<b>${home(r)}/8</b></span>`).join('')}</div>
      <div class="lboard">${grid.join('')}${toks.join('')}</div>
      <div class="row" style="justify-content:center;gap:10px"><div class="ldice">${dieBtn(0)}${dieBtn(1)}</div>${mine && !st.rolled ? gbtn('ludo', 'roll', 'Roll dice', 'primary') : ''}</div>
      ${mine && st.rolled ? `<p class="small muted center" style="margin:0">Using the <b>${die}</b>. Tap a glowing seed of any of your colours${!st.used[0] && !st.used[1] ? ', or tap the other die first' : ''}.</p>` : ''}`;
  },
  post(st) { if (!st || !st.rollId) return; if (ludoSeen === null) { ludoSeen = st.rollId; return; } if (st.rollId === ludoSeen) return; ludoSeen = st.rollId; if (st.rollBy !== S.role) spinDice('.ldice .dface', st.dice, 650); },
  act: {
    pick(st, t) { const me = S.role; if (st.turn !== me || st.phase !== 'pick') return; const a = +t.dataset.x, b = (a + 2) % 4; st.owner = [0, 1, 2, 3].map((h) => (h === a || h === b ? me : other(me))); st.phase = 'play'; logLine(st, `${NAMES[me]} took ${LH[a].name} & ${LH[b].name}`); saveGame('ludo', st); },
    selDie(st, t) { if (st.turn !== S.role) return; st.sel = +t.dataset.x; S.games.ludo.sel = st.sel; render(true); },
    async roll(st) { const me = S.role; if (st.turn !== me || st.rolled || st.over || ludoSpin) return; ludoSpin = true;
      const d = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]; await spinDice('.ldice .dface', d, 650); ludoSpin = false;
      st.dice = d; st.used = [false, false]; st.rolled = true; st.sel = 0; st.rollId = Date.now(); st.rollBy = me; ludoSeen = st.rollId;
      if (!lAnyMove(st, me)) { st.rolled = false; st.used = [true, true]; if (d[0] === 6 && d[1] === 6) logLine(st, `${NAMES[me]} rolled double 6 but can't move. Roll again`); else { st.turn = other(me); logLine(st, `${NAMES[me]} rolled ${d[0]} and ${d[1]}: no move`); } }
      else { if (!lMine(st, me).some((h) => [0, 1, 2, 3].some((k) => lCan(st, h, k, d[0])))) st.sel = 1; st.msg = `${NAMES[me]} rolled ${d[0]} and ${d[1]}`; }
      saveGame('ludo', st); },
    move(st, t) { const me = S.role; if (st.turn !== me || !st.rolled) return; const h = +t.dataset.h, k = +t.dataset.x; let sel = st.used[st.sel] ? (st.used[0] ? 1 : 0) : st.sel; const d = st.dice[sel];
      if (st.owner[h] !== me || !lCan(st, h, k, d)) return; const s = st.tok[h][k], ns = s < 0 ? 0 : s + d; st.tok[h][k] = ns; st.used[sel] = true; let cap = false;
      if (ns <= 50) { const a = lAbs(h, ns); if (!LSAFE.has(a)) for (let oh = 0; oh < 4; oh++) { if (st.owner[oh] === me) continue; st.tok[oh].forEach((o, j) => { if (o >= 0 && o <= 50 && lAbs(oh, o) === a) { st.tok[oh][j] = -1; cap = true; } }); } }
      st.bonus = st.bonus || cap; let msg = s < 0 ? `${NAMES[me]} brought a ${LH[h].name} seed out` : ns === 56 ? `${NAMES[me]} got a ${LH[h].name} seed home!` : `${NAMES[me]} moved ${LH[h].name} ${d}`; if (cap) { msg += ` and sent ${NAMES[other(me)]}'s seed home!`; toast('Captured!'); }
      if (lMine(st, me).every((hh) => st.tok[hh].every((x) => x === 56))) { st.over = true; st.winner = me; st.turn = null; }
      else { st.sel = st.used[0] ? 1 : 0; if (st.used[0] && st.used[1] || !lAnyMove(st, me)) { const again = st.dice.includes(6) || st.bonus; st.rolled = false; st.used = [true, true]; st.bonus = false; if (!again) st.turn = other(me); else msg += '. Roll again!'; } }
      logLine(st, msg); saveGame('ludo', st); },
  },
};

/* =================================== POOL (8-ball) =================================== */
const PW = 1000, PH = 500, BR = 13, POCKETS = [[0, 0], [PW / 2, -6], [PW, 0], [0, PH], [PW / 2, PH + 6], [PW, PH]];
const BCOL = ['#fff', '#f7c600', '#1f5fd6', '#d62828', '#6a2c91', '#f77f00', '#1a7f37', '#7b1e1e', '#111'];
const ballCol = (n) => BCOL[n <= 8 ? n : n - 8];
function rack() { const b = [{ n: 0, x: 250, y: PH / 2 }]; const order = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]; let k = 0;
  // apex at x=720; rows 1..5; 8 in the middle of row 3
  const rows = [[1], [9, 2], [10, 8, 3], [11, 4, 12, 5], [13, 6, 14, 7, 15]];
  rows.forEach((row, ri) => row.forEach((n, j) => { b.push({ n, x: 720 + ri * (BR * 2 * 0.87 + 0.5), y: PH / 2 + (j - ri / 2) * (BR * 2 + 0.5) }); k++; }));
  return b; }
function simulate(balls, angle, power, onFrame) {
  const B = balls.map((b) => ({ ...b, vx: 0, vy: 0 })); const cue = B.find((b) => b.n === 0); const sp = 5 + power * 40;
  cue.vx = Math.cos(angle) * sp; cue.vy = Math.sin(angle) * sp; const potted = []; let firstHit = null; const frames = [];
  for (let step = 0; step < 4000; step++) {
    let moving = false;
    for (const b of B) { if (b.out) continue; b.x += b.vx / 2; b.y += b.vy / 2; }
    for (let i = 0; i < B.length; i++) { const a = B[i]; if (a.out) continue;
      for (let j = i + 1; j < B.length; j++) { const b = B[j]; if (b.out) continue; const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
        if (d2 < 4 * BR * BR && d2 > 0) { const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = 2 * BR - d; a.x -= nx * ov / 2; a.y -= ny * ov / 2; b.x += nx * ov / 2; b.y += ny * ov / 2;
          const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny; if (rel > 0) { a.vx -= rel * nx * .96; a.vy -= rel * ny * .96; b.vx += rel * nx * .96; b.vy += rel * ny * .96; }
          if (firstHit === null && (a.n === 0 || b.n === 0)) firstHit = a.n === 0 ? b.n : a.n; } } }
    for (const b of B) { if (b.out) continue;
      for (const [px, py] of POCKETS) { if ((b.x - px) ** 2 + (b.y - py) ** 2 < (py < 0 || py > PH ? 22 : 26) ** 2) { b.out = true; b.vx = b.vy = 0; potted.push(b.n); break; } }
      if (b.out) continue;
      const nearPocket = POCKETS.some(([px, py]) => (b.x - px) ** 2 + (b.y - py) ** 2 < 40 * 40);
      if (!nearPocket) { if (b.x < BR) { b.x = BR; b.vx = Math.abs(b.vx) * .8; } if (b.x > PW - BR) { b.x = PW - BR; b.vx = -Math.abs(b.vx) * .8; } if (b.y < BR) { b.y = BR; b.vy = Math.abs(b.vy) * .8; } if (b.y > PH - BR) { b.y = PH - BR; b.vy = -Math.abs(b.vy) * .8; } }
      const s = Math.hypot(b.vx, b.vy); if (s > 0) { const ns = Math.max(0, s - .028); b.vx *= ns / s; b.vy *= ns / s; if (ns > 0.02) moving = true; else b.vx = b.vy = 0; } }
    if (onFrame && step % 3 === 0) frames.push(B.filter((b) => !b.out).map((b) => ({ n: b.n, x: b.x, y: b.y })));
    if (!moving) break; }
  return { balls: B.filter((b) => !b.out).map((b) => ({ n: b.n, x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10 })), potted, firstHit, frames }; }
function poolGeom(cv) { const par = cv.parentElement, cs = getComputedStyle(par), full = par.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), vert = full < 640, maxH = Math.max(320, window.innerHeight * .74); let sc = vert ? full / (PH + 60) : full / (PW + 60); sc = Math.min(sc, maxH / (vert ? PW + 60 : PH + 60)); const w = (vert ? PH + 60 : PW + 60) * sc; return { w, vert, sc, h: (vert ? PW + 60 : PH + 60) * sc }; }
function poolToTable(cv, e) { const r = cv.getBoundingClientRect(), g = poolGeom(cv); const u = (e.clientX - r.left) / g.sc - 30, v = (e.clientY - r.top) / g.sc - 30; return g.vert ? { x: PW - v, y: u } : { x: u, y: v }; }
function drawTable(cv, balls, aim) {
  const g = poolGeom(cv), dpr = Math.min(2, devicePixelRatio || 1); cv.style.height = g.h + 'px'; cv.style.width = g.w + 'px'; cv.width = g.w * dpr; cv.height = g.h * dpr;
  const x = cv.getContext('2d'); x.scale(dpr * g.sc, dpr * g.sc); const TW = g.vert ? PH + 60 : PW + 60, TH = g.vert ? PW + 60 : PH + 60;
  x.fillStyle = '#7a4a2a'; x.beginPath(); x.roundRect ? x.roundRect(0, 0, TW, TH, 26) : x.rect(0, 0, TW, TH); x.fill();
  x.translate(30, 30); if (g.vert) { x.translate(0, PW); x.rotate(-Math.PI / 2); }
  const gr = x.createRadialGradient(PW / 2, PH / 2, 50, PW / 2, PH / 2, PW / 1.6); gr.addColorStop(0, '#2fa36b'); gr.addColorStop(1, '#17714a'); x.fillStyle = gr; x.fillRect(0, 0, PW, PH);
  x.strokeStyle = 'rgba(255,255,255,.15)'; x.lineWidth = 2; x.beginPath(); x.moveTo(250, 0); x.lineTo(250, PH); x.stroke();
  x.fillStyle = '#111'; for (const [px, py] of POCKETS) { x.beginPath(); x.arc(px, Math.min(PH, Math.max(0, py)), 24, 0, 7); x.fill(); }
  const c = balls.find((b) => b.n === 0);
  if (aim && c) { const dx = Math.cos(aim.a), dy = Math.sin(aim.a);
    x.setLineDash([12, 12]); x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 3; x.beginPath(); x.moveTo(c.x, c.y); x.lineTo(c.x + dx * 520, c.y + dy * 520); x.stroke(); x.setLineDash([]);
    const back = 22 + aim.p * 150; x.lineCap = 'round'; x.strokeStyle = '#3b2412'; x.lineWidth = 12; x.beginPath(); x.moveTo(c.x - dx * (back + 340), c.y - dy * (back + 340)); x.lineTo(c.x - dx * (back + 60), c.y - dy * (back + 60)); x.stroke();
    x.strokeStyle = '#e8c48a'; x.lineWidth = 9; x.beginPath(); x.moveTo(c.x - dx * (back + 60), c.y - dy * (back + 60)); x.lineTo(c.x - dx * back, c.y - dy * back); x.stroke(); x.strokeStyle = '#6cc6ff'; x.lineWidth = 9; x.beginPath(); x.moveTo(c.x - dx * (back + 4), c.y - dy * (back + 4)); x.lineTo(c.x - dx * back, c.y - dy * back); x.stroke(); }
  for (const b of balls) { x.save(); x.beginPath(); x.arc(b.x, b.y, BR, 0, 7); x.clip(); x.fillStyle = b.n > 8 ? '#fff' : ballCol(b.n); x.fillRect(b.x - BR, b.y - BR, BR * 2, BR * 2);
    if (b.n > 8) { x.fillStyle = ballCol(b.n); x.fillRect(b.x - BR, b.y - BR * .55, BR * 2, BR * 1.1); }
    if (b.n) { x.fillStyle = '#fff'; x.beginPath(); x.arc(b.x, b.y, BR * .5, 0, 7); x.fill(); x.translate(b.x, b.y); if (g.vert) x.rotate(Math.PI / 2); x.fillStyle = '#111'; x.font = `bold ${BR * .66}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(b.n, 0, .5); x.setTransform(1, 0, 0, 1, 0, 0); }
    x.restore(); x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(b.x - BR * .35, b.y - BR * .4, BR * .25, 0, 7); x.fill(); }
  if (aim && aim.drag) { x.setTransform(dpr, 0, 0, dpr, 0, 0); const bw = g.w * .5, bx = (g.w - bw) / 2, by = 8; x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(bx, by, bw, 10); x.fillStyle = aim.p > .75 ? '#ff4f7e' : '#ffd166'; x.fillRect(bx, by, bw * aim.p, 10); }
}
const groupBalls = (g) => (g === 'solids' ? [1, 2, 3, 4, 5, 6, 7] : [9, 10, 11, 12, 13, 14, 15]);
let poolAim = { a: 0, p: .6 }, poolAnim = null, poolSeen = null;
G.pool = {
  name: 'Pool', short: '8-ball, shot by shot', statusBelow: true, icon: ICON('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 9v6"/>'),
  desc: '8-ball pool. Hold and pull the cue back from the white ball, aim, and let go to shoot: the further you pull, the harder the shot. Pot a ball to claim solids or stripes, clear your group, then sink the black 8 to win. Potting the white or missing every ball is a foul.',
  start(first) { return { kind: 'pool', balls: rack(), groups: { anthonia: null, ifeayomi: null }, turn: first, shot: 0, msg: `${NAMES[first]} breaks` }; },
  view(st, me) { const mine = st.turn === me && !st.over;
    const left = (r) => (st.groups[r] ? groupBalls(st.groups[r]).filter((n) => st.balls.some((b) => b.n === n)).length : null);
    return `<canvas id="pool" class="pool"></canvas>
      ${mine ? `<p class="small muted center" style="margin:0">Touch the table and pull back away from the white ball to aim. Let go to shoot.</p>` : ''}
      <div class="row between small"><span class="row">${av('anthonia', 26)}${st.groups.anthonia ? `<b>${st.groups.anthonia}</b> · ${left('anthonia')} left` : 'open'}</span><span class="row">${st.groups.ifeayomi ? `<b>${st.groups.ifeayomi}</b> · ${left('ifeayomi')} left` : 'open'}${av('ifeayomi', 26)}</span></div>`; },
  post(st, me) { const cv = document.getElementById('pool'); if (!cv || !st) return;
    if (S.poolOpened !== S.game + S.tab) { S.poolOpened = S.game + S.tab; setTimeout(() => { const c = document.getElementById('pool'); if (c) c.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); }
    if (st.shot && poolSeen !== null && st.shot !== poolSeen && st.last && st.last.by !== me && st.last.before && !poolAnim) G.pool.replay(st);
    poolSeen = st.shot; const myTurn = () => st.turn === me && !st.over && !poolAnim;
    if (!poolAnim) drawTable(cv, st.balls, myTurn() ? poolAim : null);
    const upd = (e) => { const p = poolToTable(cv, e), c = st.balls.find((b) => b.n === 0); if (!c) return; const dx = c.x - p.x, dy = c.y - p.y, d = Math.hypot(dx, dy);
      if (d > 4) poolAim.a = Math.atan2(dy, dx); poolAim.p = Math.max(0, Math.min(1, (d - 30) / 420)); poolAim.drag = true; drawTable(cv, st.balls, poolAim); };
    cv.onpointerdown = (e) => { if (!myTurn()) return; cv.setPointerCapture(e.pointerId); upd(e); };
    cv.onpointermove = (e) => { if (!myTurn() || !poolAim.drag) return; upd(e); };
    cv.onpointerup = cv.onpointercancel = (e) => { if (!poolAim.drag) return; poolAim.drag = false; if (e.type === 'pointerup' && poolAim.p > .04 && myTurn()) G.pool.act.shoot(JSON.parse(JSON.stringify(S.games.pool))); else drawTable(cv, st.balls, myTurn() ? poolAim : null); }; },

  replay(st) { if (!document.getElementById('pool')) return; const r = simulate(st.last.before, st.last.a, st.last.p, true); let k = 0;
    poolAnim = setInterval(() => { const cv = document.getElementById('pool'); if (!cv) { clearInterval(poolAnim); poolAnim = null; return; } if (k >= r.frames.length) { clearInterval(poolAnim); poolAnim = null; const cur = S.games.pool || st; drawTable(cv, cur.balls, cur.turn === S.role && !cur.over ? poolAim : null); return; } drawTable(cv, r.frames[k], null); k++; }, 16); },
  act: {
    shoot(st) { const me = S.role, you = other(me); if (st.turn !== me || st.over || poolAnim) return;       const before = st.balls.map((b) => ({ ...b })); const r = simulate(before, poolAim.a, poolAim.p, true); const cv = document.getElementById('pool'); let k = 0;
      const finish = () => {
        const pot = r.potted, cueIn = pot.includes(0), eight = pot.includes(8); let mg = st.groups[me];
        let foul = cueIn || r.firstHit === null; if (mg && r.firstHit !== null && r.firstHit !== 8 && !groupBalls(mg).includes(r.firstHit)) foul = true;
        const mineLeftBefore = mg ? groupBalls(mg).filter((n) => before.some((b) => b.n === n)).length : 7;
        if (mg && mineLeftBefore > 0 && r.firstHit === 8) foul = true;
        let balls = r.balls; if (cueIn) { let y = PH / 2; while (balls.some((b) => Math.hypot(b.x - 250, b.y - y) < BR * 2.2)) y += BR * 2.3; balls = [{ n: 0, x: 250, y }, ...balls]; }
        st.balls = balls; st.shot = (st.shot || 0) + 1; st.last = { by: me, a: poolAim.a, p: poolAim.p, before }; let msg = '';
        if (eight) { const won = !foul && mg && mineLeftBefore === 0; st.over = true; st.turn = null; st.winner = won ? me : you; msg = won ? `${NAMES[me]} sank the 8!` : `${NAMES[me]} potted the 8 too early!`; }
        else { const own = pot.filter((n) => n && n !== 8);
          if (!mg && own.length && !foul) { mg = own[0] < 8 ? 'solids' : 'stripes'; st.groups[me] = mg; st.groups[you] = mg === 'solids' ? 'stripes' : 'solids'; msg = `${NAMES[me]} takes ${mg}`; }
          const scored = mg ? own.filter((n) => groupBalls(mg).includes(n)).length : own.length;
          if (foul) { st.turn = you; msg = cueIn ? 'Foul: the white went in' : r.firstHit === null ? 'Foul: no ball hit' : 'Foul: wrong ball first'; }
          else if (scored) { msg = msg || `${NAMES[me]} potted ${scored}! Shoot again`; }
          else { st.turn = you; msg = msg || `${NAMES[me]} missed`; } }
        logLine(st, msg); poolSeen = st.shot; saveGame('pool', st); };
      poolAnim = setInterval(() => { if (k >= r.frames.length || !cv) { clearInterval(poolAnim); poolAnim = null; finish(); return; } { const c2 = document.getElementById('pool'); if (c2) drawTable(c2, r.frames[k], null); } k++; }, 16); },
  },
};

/* =================================== MOVIE NIGHT =================================== */
let ytReady = null, ytPlayer = null, ytVid = null, ytApplying = 0, ytLastApplied = 0;
function loadYT() { if (ytReady) return ytReady; ytReady = new Promise((res) => { window.onYouTubeIframeAPIReady = res; const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s); }); return ytReady; }
const ytId = (u) => { const m = String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/); return m ? m[1] : /^[\w-]{11}$/.test(u) ? u : null; };
G.movie = {
  name: 'Movie night', short: 'Watch YouTube in sync', icon: ICON('<rect x="3" y="5" width="18" height="13" rx="2"/><path d="M10 9.5v4l3.5-2z" fill="currentColor"/><path d="M8 21h8"/>'),
  desc: 'Paste a YouTube link. When either of you plays, pauses or jumps, the other phone follows. Chat while you watch. For Netflix, use Teleparty on a laptop.',
  start(me) { return { kind: 'movie', videoId: null, playing: false, pos: 0, at: Date.now(), by: me, chat: [] }; },
  view(st, me) { return `<div class="row" style="flex-wrap:nowrap"><input type="text" id="ytUrl" placeholder="Paste a YouTube link"><button class="btn primary sm" data-act="g" data-g="movie" data-a="load">Load</button></div>
    <div class="yt" id="ytWrap"><div id="ytp"></div>${st.videoId ? '' : '<div class="ytEmpty">Paste a link to start watching together</div>'}
      <div class="ytOverlay" id="ytOverlay">${G.movie.overlayHtml(st)}</div><button class="ytExit" data-act="g" data-g="movie" data-a="exitFull">Exit full screen</button></div>
    <div class="row">${st.videoId ? gbtn('movie', 'full', 'Full screen', 'primary sm') : ''}${gbtn('movie', 'sync', 'Sync to partner', 'sm')}<span class="small muted" id="ytStatus">${G.movie.status(st)}</span></div>
    <div class="chat" id="ytChatList">${G.movie.chatHtml(st)}</div>
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="ytChat" placeholder="Say something sweet"><button class="btn sm" data-act="g" data-g="movie" data-a="say">Send</button></div>
    <a class="small" href="https://www.teleparty.com/" target="_blank" rel="noopener" style="color:var(--her)">Watching Netflix? Open Teleparty</a>`; },
  status: (st) => (st && st.videoId ? `${NAMES[st.by]} last ${st.playing ? 'pressed play' : 'paused'}` : ''),
  overlayHtml: (st) => ((st && st.chat) || []).slice(-3).map((m) => `<div class="ovl ${m.by}"><b>${esc(NAMES[m.by])}:</b> ${esc(m.t)}</div>`).join(''),
  chatHtml: (st) => ((st && st.chat) || []).slice(-30).map((m) => `<div class="bubble ${m.by}">${av(m.by, 24)}<div class="b">${esc(m.t)}</div></div>`).join(''),
  update(st, me) { if (!st || !st.videoId || !document.querySelector('#ytWrap iframe')) { render(true); return; }
    const c = document.getElementById('ytChatList'); if (c) { c.innerHTML = G.movie.chatHtml(st); c.scrollTop = c.scrollHeight; }
    const s = document.getElementById('ytStatus'); if (s) s.textContent = G.movie.status(st); const o = document.getElementById('ytOverlay'); if (o) o.innerHTML = G.movie.overlayHtml(st); G.movie.post(st, me); },
  async post(st, me) {
    const host = document.getElementById('ytp'); if (!host || !st || !st.videoId) return;
    await loadYT(); if (!document.getElementById('ytp')) return;
    const apply = () => { if (!ytPlayer || !ytPlayer.seekTo) return; if (st.at <= ytLastApplied && ytVid === st.videoId) return; ytLastApplied = st.at; ytApplying = Date.now();
      const target = st.pos + (st.playing ? Math.max(0, (Date.now() - st.at) / 1000) : 0);
      if (Math.abs((ytPlayer.getCurrentTime() || 0) - target) > 1.5) ytPlayer.seekTo(target, true);
      if (st.playing) ytPlayer.playVideo(); else ytPlayer.pauseVideo(); };
    if (!ytPlayer || !document.getElementById('ytp') || ytPlayer.getIframe && !document.body.contains(ytPlayer.getIframe())) {
      ytVid = st.videoId; ytLastApplied = 0;
      ytPlayer = new YT.Player('ytp', { videoId: st.videoId, playerVars: { playsinline: 1, rel: 0 }, events: {
        onReady: () => apply(),
        onStateChange: (e) => { if (Date.now() - ytApplying < 1200) return; const cur = S.games.movie; if (!cur) return; if (e.data === 1 || e.data === 2) { const ns = { ...cur, playing: e.data === 1, pos: ytPlayer.getCurrentTime(), at: Date.now(), by: S.role }; ytLastApplied = ns.at; saveGame('movie', ns); } } } });
      return; }
    if (ytVid !== st.videoId) { ytVid = st.videoId; ytLastApplied = st.at; ytApplying = Date.now(); ytPlayer.loadVideoById(st.videoId, st.pos || 0); return; }
    if (st.by !== me) apply();
  },
  act: {
    load(st) { const id = ytId(val('ytUrl').trim()); if (!id) return toast("That doesn't look like a YouTube link"); st = st || G.movie.start(S.role); Object.assign(st, { videoId: id, playing: false, pos: 0, at: Date.now(), by: S.role }); saveGame('movie', st); },
    full() { const w = document.getElementById('ytWrap'); if (!w) return; w.classList.add('fs'); document.body.classList.add('fsmode');
      const fix = () => { const portrait = window.innerHeight > window.innerWidth; w.classList.toggle('rot', portrait); }; fix(); G.movie.fix = fix; window.addEventListener('resize', fix);
      const de = document.documentElement; const p = de.requestFullscreen ? de.requestFullscreen({ navigationUI: 'hide' }) : null;
      if (p && p.then) p.then(() => { if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape').then(fix, fix); }).catch(() => {}); },
    exitFull() { const w = document.getElementById('ytWrap'); if (w) w.classList.remove('fs', 'rot'); document.body.classList.remove('fsmode'); if (G.movie.fix) window.removeEventListener('resize', G.movie.fix);
      try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {} if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); },
    sync(st) { if (!st) return; ytLastApplied = 0; G.movie.post(st, '__force'); },
    say(st) { const t = val('ytChat').trim(); if (!t) return; st = st || G.movie.start(S.role); st.chat = [...(st.chat || []), { by: S.role, t, at: Date.now() }].slice(-40); clearIn('ytChat'); saveGame('movie', st); },
  },
};
