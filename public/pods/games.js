/* Pods games. Each game keeps its whole state in one document, games/<id>.
   Every game has: name, short, desc, icon, start(me) → state, view(state, me) → html,
   act: {name: (state, button) => …}, optional post(state, me) after render. */
const G = {};
const NAMESX = () => NAMES;
function saveGame(id, st) { st.updatedAt = Date.now(); return setDoc('games/' + id, st); }
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
];
G.quiz = {
  name: 'Couple quiz', short: 'How well do you know me?', icon: ICON('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>'),
  desc: 'One of you answers 5 questions about yourself. The other guesses your answers. 4 rounds, swapping each time. Most correct guesses wins.',
  start(me) { return { kind: 'quiz', round: 1, rounds: 4, asker: me, phase: 'answer', turn: me, qs: shuffleArr([...QBANK.keys()]).slice(0, 5), answers: [], guesses: [], scores: { anthonia: 0, ifeayomi: 0 }, msg: `${NAMES[me]} answers first` }; },
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
      st.round++; st.asker = other(st.asker); st.turn = st.asker; st.phase = 'answer'; st.answers = []; st.guesses = []; st.qs = shuffleArr([...QBANK.keys()]).slice(0, 5); st.msg = `${NAMES[st.asker]} answers this round`; saveGame('quiz', st); },
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
function wtState() { return S.wt || (S.wt = { pend: [], sel: null, swap: [] }); }
G.words = {
  name: 'Word Tiles', short: 'Our own word board', icon: ICON('<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="M6 9l1-4 1 4M16 5h2.5a1.5 1.5 0 0 1 0 3H16zm0 3h2.5a1.5 1.5 0 0 1 0 3H16z"/>'),
  desc: 'Build crossword-style words on a 15×15 board. Coloured squares double or triple letters and words. Using all 7 tiles earns 50 extra points.',
  start(me) { const bag = []; for (const [l, [n]] of Object.entries(LETTERS)) for (let k = 0; k < n; k++) bag.push(l); shuffleArr(bag);
    const st = { kind: 'words', board: Array(225).fill(''), bag, racks: { anthonia: bag.splice(0, 7), ifeayomi: bag.splice(0, 7) }, scores: { anthonia: 0, ifeayomi: 0 }, turn: me, passes: 0, last: [] };
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
    return `<div class="row between"><div class="row">${av('anthonia', 28)}<b>${st.scores.anthonia}</b></div><span class="small muted">${st.bag.length} tiles in bag</span><div class="row"><b>${st.scores.ifeayomi}</b>${av('ifeayomi', 28)}</div></div>
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
    sel(st, t) { const w = wtState(), k = +t.dataset.x; if (w.swapping) { w.swap = w.swap.includes(k) ? w.swap.filter((x) => x !== k) : [...w.swap, k]; } else w.sel = w.sel === k ? null : k; render(true); },
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
      st.turn = other(me); st.passes = (st.passes || 0) + 1; st.last = []; logLine(st, `${NAMES[me]} swapped ${out.length} tiles`); w.swapping = false; w.swap = []; G.words.checkEnd(st); saveGame('words', st); },
    pass(st) { const me = S.role; if (st.turn !== me) return; st.turn = other(me); st.passes = (st.passes || 0) + 1; st.last = []; logLine(st, `${NAMES[me]} passed`); G.words.checkEnd(st); saveGame('words', st); },
    async play(st) { const me = S.role, w = wtState(); if (st.turn !== me) return; await loadWords(); const r = wordMove(st.board, w.pend);
      if (r.err) return toast(r.err); const bad = r.words.filter((x) => !WORDS.has(x)); if (bad.length) return toast(`${bad.join(', ')} isn't in the dictionary`);
      st.board = r.board; const usedIdx = new Set(w.pend.map((p) => p.ri)); st.racks[me] = st.racks[me].filter((_, k) => !usedIdx.has(k)); st.racks[me].push(...st.bag.splice(0, 7 - st.racks[me].length));
      st.scores[me] += r.score; st.last = w.pend.map((p) => p.i); st.passes = 0; st.turn = other(me); logLine(st, `${NAMES[me]} played ${r.words.join(', ')} for ${r.score}`);
      if (w.pend.length === 7) toast('BINGO! +50'); w.pend = [];
      if (!st.bag.length && !st.racks[me].length) { const left = st.racks[other(me)].reduce((a, ch) => a + tileVal(ch), 0); st.scores[me] += left; st.scores[other(me)] -= left; G.words.end(st); }
      saveGame('words', st); },
  },
  checkEnd(st) { if ((st.passes || 0) >= 4) { for (const r of ['anthonia', 'ifeayomi']) st.scores[r] -= st.racks[r].reduce((a, ch) => a + tileVal(ch), 0); G.words.end(st); } },
  end(st) { st.over = true; st.turn = null; const a = st.scores.anthonia, i = st.scores.ifeayomi; st.winner = a === i ? 'tie' : a > i ? 'anthonia' : 'ifeayomi'; },
};

/* =================================== PROPERTY GAME =================================== */
const PSP = [
  { n: 'Start', t: 'start' }, { n: 'Oyo Town', t: 'p', g: 'brown', p: 60 }, { n: 'Love Note', t: 'card' }, { n: 'Ogbomoso', t: 'p', g: 'brown', p: 80 },
  { n: 'Flight Tax', t: 'tax', p: 100 }, { n: 'Bus 522', t: 'tr', p: 150 }, { n: 'Missed Call', t: 'jail' }, { n: 'Bodija', t: 'p', g: 'sky', p: 100 },
  { n: 'Pig Farm', t: 'ut', p: 150 }, { n: 'Ring Road', t: 'p', g: 'sky', p: 110 }, { n: 'Dugbe', t: 'p', g: 'sky', p: 120 }, { n: 'Train to Rome', t: 'tr', p: 150 },
  { n: 'Free Hug', t: 'free' }, { n: 'Falconara', t: 'p', g: 'pink', p: 140 }, { n: 'Love Note', t: 'card' }, { n: 'Ancona Port', t: 'p', g: 'pink', p: 160 },
  { n: 'Passetto', t: 'p', g: 'pink', p: 180 }, { n: 'Data Bill', t: 'tax', p: 75 }, { n: 'Go to Missed Call', t: 'gojail' }, { n: 'Lekki', t: 'p', g: 'orange', p: 220 },
  { n: 'Love Note', t: 'card' }, { n: 'Victoria Island', t: 'p', g: 'orange', p: 240 }, { n: 'Rome', t: 'p', g: 'gold', p: 300 }, { n: 'Venice', t: 'p', g: 'gold', p: 350 },
];
const PCOL = { brown: '#a0612f', sky: '#6cc6ff', pink: '#ff7fb0', orange: '#ff9f43', gold: '#f5b700' };
const LOVE = [
  ['Your partner sent you flowers. Collect ₦100.', 100], ['You forgot to call back. Pay ₦50.', -50], ['Surprise data top-up from your love. Collect ₦60.', 60],
  ['Long-distance call bill. Pay ₦40.', -40], ['You won the daily question streak. Collect ₦80.', 80], ['Advance to Start.', 'start'],
  ['Surprise visit! Move to Ancona Port.', 15], ['Go to Missed Call. Do not pass Start.', 'jail'], ['Date night was on you. Pay ₦70.', -70],
  ['Your pigs had piglets! Collect ₦120.', 120], ['Birthday gift from your partner: they pay you ₦50.', 'gift'], ['You bought matching jerseys. Pay ₦30.', -30],
];
const ringPos = (i) => (i <= 6 ? [6, 6 - i] : i <= 12 ? [12 - i, 0] : i <= 18 ? [0, i - 12] : [i - 18, 6]);
const groupOf = (g) => PSP.map((s, i) => (s.g === g ? i : -1)).filter((i) => i >= 0);
function propRent(st, i, dice) { const s = PSP[i], o = st.own[i]; if (!o) return 0;
  if (s.t === 'tr') { const n = [5, 11].filter((k) => st.own[k] && st.own[k].by === o.by).length; return 25 * n * n; }
  if (s.t === 'ut') return 6 * dice;
  const base = Math.round(s.p / 10), full = groupOf(s.g).every((k) => st.own[k] && st.own[k].by === o.by), h = o.houses || 0;
  return h ? base * [1, 5, 15, 35][h] : full ? base * 2 : base; }
function worth(st, r) { let w = st.cash[r]; for (const [i, o] of Object.entries(st.own)) if (o.by === r) w += PSP[i].p + (o.houses || 0) * Math.round(PSP[i].p / 2); return w; }
G.property = {
  name: 'Pods Property', short: 'Buy Ancona, Ibadan and Oyo', icon: ICON('<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/>'),
  desc: 'Roll, move and buy places from Oyo to Venice. Charge rent when your partner lands on yours. Own a whole colour to double rent and build houses. Love Notes bring surprises. Run your partner out of money, or end the game and the richest wins.',
  start(me) { return { kind: 'property', pos: { anthonia: 0, ifeayomi: 0 }, cash: { anthonia: 1500, ifeayomi: 1500 }, own: {}, turn: me, phase: 'roll', dice: [1, 1], dbl: 0, jail: { anthonia: 0, ifeayomi: 0 }, msg: `${NAMES[me]} rolls first` }; },
  score: (st) => ['₦' + worth(st, 'anthonia'), '₦' + worth(st, 'ifeayomi')],
  view(st, me) {
    const mine = st.turn === me && !st.over, cells = [];
    for (let i = 0; i < 24; i++) { const s = PSP[i], [r, c] = ringPos(i), o = st.own[i];
      const tok = ['anthonia', 'ifeayomi'].filter((x) => st.pos[x] === i).map((x) => av(x, 18)).join('');
      cells.push(`<button class="pcell ${s.t}" style="grid-row:${r + 1};grid-column:${c + 1}" data-act="g" data-g="property" data-a="info" data-x="${i}">${s.g ? `<i style="background:${PCOL[s.g]}"></i>` : ''}<span>${s.n}</span>${s.p && s.t !== 'tax' ? `<em>₦${s.p}</em>` : s.t === 'tax' ? `<em>-₦${s.p}</em>` : ''}${o ? `<u class="${o.by}">${'⌂'.repeat(o.houses || 0)}</u>` : ''}<div class="toks">${tok}</div></button>`); }
    const here = PSP[st.pos[me]], d = st.dice;
    const buildable = Object.entries(st.own).filter(([i, o]) => o.by === me && PSP[i].g && (o.houses || 0) < 3 && groupOf(PSP[i].g).every((k) => st.own[k] && st.own[k].by === me));
    const center = `<div class="pcenter"><div class="dice"><span>${d[0]}</span><span>${d[1]}</span></div>
      <div class="row" style="justify-content:center;gap:12px"><span class="row">${av('anthonia', 22)}<b>₦${st.cash.anthonia}</b></span><span class="row">${av('ifeayomi', 22)}<b>₦${st.cash.ifeayomi}</b></span></div>
      ${st.card ? `<div class="lovecard">${esc(st.card)}</div>` : ''}
      ${mine ? (st.phase === 'roll' ? gbtn('property', 'roll', st.jail[me] ? 'Roll for doubles' : 'Roll dice', 'primary')
        : st.phase === 'buy' ? `<div class="row" style="justify-content:center">${gbtn('property', 'buy', `Buy ${here.n} ₦${here.p}`, 'primary sm')}${gbtn('property', 'skip', 'No thanks', 'sm')}</div>`
        : gbtn('property', 'end', 'End turn', 'teal')) : ''}
      ${mine && st.jail[me] && st.phase === 'roll' && st.cash[me] >= 50 ? gbtn('property', 'bail', 'Pay ₦50 to leave', 'sm') : ''}</div>`;
    return `<div class="pboard">${cells.join('')}${center}</div>
    ${mine && buildable.length ? `<span class="eyebrow">Build a house</span><div class="row">${buildable.map(([i]) => gbtn('property', 'build', `${PSP[i].n} ₦${Math.round(PSP[i].p / 2)}`, 'sm', `data-x="${i}"`)).join('')}</div>` : ''}
    <div class="row between small"><span class="muted">${(st.log || []).slice(0, 2).map(esc).join('<br>')}</span>${!st.over ? gbtn('property', 'finish', 'End game & count', 'sm ghost') : ''}</div>`;
  },
  act: {
    info(st, t) { const i = +t.dataset.x, s = PSP[i], o = st.own[i]; openSheet(`${sheetHead(s.n)}${s.g ? `<div class="chip" style="background:${PCOL[s.g]};color:#fff">${s.g} group</div>` : ''}
      <p class="muted" style="margin:0">${s.t === 'p' ? `Price ₦${s.p}. Rent ₦${Math.round(s.p / 10)}, doubled with the whole colour. Houses cost ₦${Math.round(s.p / 2)} and raise rent ×5, ×15, ×35.` : s.t === 'tr' ? 'Transport: rent ₦25 with one, ₦100 with both.' : s.t === 'ut' ? 'Pig Farm: rent is 6× the dice.' : s.t === 'card' ? 'Pick a Love Note card.' : s.t === 'tax' ? `Pay ₦${s.p}.` : s.t === 'jail' ? 'Stuck on a missed call: roll doubles or pay ₦50 to leave. Leave free after 3 tries.' : s.t === 'gojail' ? 'Go straight to Missed Call.' : s.t === 'start' ? 'Collect ₦200 each time you pass.' : 'Nothing happens. Enjoy the hug.'}</p>
      ${o ? `<div class="row">${av(o.by, 28)}<b>Owned by ${NAMES[o.by]}</b>${o.houses ? ` · ${o.houses} house${o.houses > 1 ? 's' : ''}` : ''}</div>` : ''}`); },
    roll(st) { const me = S.role; if (st.turn !== me || st.phase !== 'roll') return; const d = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)], dbl = d[0] === d[1]; st.dice = d; st.card = null;
      if (st.jail[me]) { if (dbl) { st.jail[me] = 0; logLine(st, `${NAMES[me]} rolled doubles and left Missed Call`); }
        else if (st.jail[me] >= 3) { st.jail[me] = 0; st.cash[me] -= 50; logLine(st, `${NAMES[me]} paid ₦50 after 3 tries`); }
        else { st.jail[me]++; st.phase = 'end'; logLine(st, `${NAMES[me]} is still on a missed call`); return saveGame('property', st); }
        G.property.move(st, d[0] + d[1], false); return saveGame('property', st); }
      if (dbl) { st.dbl = (st.dbl || 0) + 1; if (st.dbl >= 3) { st.pos[me] = 6; st.jail[me] = 1; st.dbl = 0; st.phase = 'end'; logLine(st, 'Three doubles! Straight to Missed Call'); return saveGame('property', st); } } else st.dbl = 0;
      G.property.move(st, d[0] + d[1], dbl); saveGame('property', st); },
    bail(st) { const me = S.role; if (st.turn !== me || !st.jail[me]) return; st.cash[me] -= 50; st.jail[me] = 0; logLine(st, `${NAMES[me]} paid ₦50 to leave`); saveGame('property', st); },
    buy(st) { const me = S.role, i = st.pos[me], s = PSP[i]; if (st.turn !== me || st.phase !== 'buy' || st.own[i] || st.cash[me] < s.p) return; st.cash[me] -= s.p; st.own[i] = { by: me, houses: 0 };
      logLine(st, `${NAMES[me]} bought ${s.n}`); st.phase = st.again ? 'roll' : 'end'; floatHearts(); saveGame('property', st); },
    skip(st) { if (st.turn !== S.role) return; st.phase = st.again ? 'roll' : 'end'; saveGame('property', st); },
    build(st, t) { const me = S.role, i = +t.dataset.x, o = st.own[i], cost = Math.round(PSP[i].p / 2); if (st.turn !== me || !o || o.by !== me || (o.houses || 0) >= 3) return; if (st.cash[me] < cost) return toast('Not enough cash');
      st.cash[me] -= cost; o.houses = (o.houses || 0) + 1; logLine(st, `${NAMES[me]} built a house on ${PSP[i].n}`); saveGame('property', st); },
    end(st) { const me = S.role; if (st.turn !== me) return; st.turn = other(me); st.phase = 'roll'; st.again = false; st.dbl = 0; st.card = null; st.msg = `${NAMES[st.turn]}'s turn to roll`; saveGame('property', st); },
    finish(st, t) { if (t.dataset.sure !== '1') { t.dataset.sure = '1'; t.textContent = 'Tap again to end and count'; return; } const a = worth(st, 'anthonia'), i = worth(st, 'ifeayomi');
      st.over = true; st.turn = null; st.winner = a === i ? 'tie' : a > i ? 'anthonia' : 'ifeayomi'; logLine(st, `Final worth: Anthonia ₦${a}, Ifeayomi ₦${i}`); saveGame('property', st); },
  },
  move(st, steps, dbl) { const me = S.role, from = st.pos[me], to = (from + steps) % 24; if (from + steps >= 24) { st.cash[me] += 200; logLine(st, `${NAMES[me]} passed Start: +₦200`); }
    st.pos[me] = to; st.again = dbl; G.property.land(st, steps); },
  land(st, dice) { const me = S.role, you = other(me), i = st.pos[me], s = PSP[i]; st.phase = st.again ? 'roll' : 'end';
    if (s.t === 'p' || s.t === 'tr' || s.t === 'ut') { const o = st.own[i];
      if (!o) { if (st.cash[me] >= s.p) st.phase = 'buy'; logLine(st, `${NAMES[me]} landed on ${s.n}`); }
      else if (o.by === you) { const rent = propRent(st, i, dice); st.cash[me] -= rent; st.cash[you] += rent; logLine(st, `${NAMES[me]} paid ${NAMES[you]} ₦${rent} rent for ${s.n}`); }
      else logLine(st, `${NAMES[me]} is home at ${s.n}`); }
    else if (s.t === 'tax') { st.cash[me] -= s.p; logLine(st, `${s.n}: ${NAMES[me]} paid ₦${s.p}`); }
    else if (s.t === 'gojail') { st.pos[me] = 6; st.jail[me] = 1; st.again = false; st.phase = 'end'; logLine(st, `${NAMES[me]} went to Missed Call`); }
    else if (s.t === 'card') { const [txt, eff] = LOVE[Math.floor(Math.random() * LOVE.length)]; st.card = txt;
      if (typeof eff === 'number' && Math.abs(eff) > 24) st.cash[me] += eff;
      else if (eff === 'start') { st.pos[me] = 0; st.cash[me] += 200; }
      else if (eff === 'jail') { st.pos[me] = 6; st.jail[me] = 1; st.again = false; st.phase = 'end'; }
      else if (eff === 'gift') { st.cash[me] += 50; st.cash[you] -= 50; }
      else if (typeof eff === 'number') { if (eff < st.pos[me]) st.cash[me] += 200; st.pos[me] = eff; G.property.land(st, dice); }
      logLine(st, `Love Note: ${txt}`); }
    else logLine(st, `${NAMES[me]} landed on ${s.n}`);
    for (const r of [me, you]) if (st.cash[r] < 0) { st.over = true; st.turn = null; st.winner = other(r); logLine(st, `${NAMES[r]} ran out of money!`); } },
};

/* =================================== LUDO =================================== */
const LPATH = [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0]];
const LSTART = { anthonia: 0, ifeayomi: 26 }, LSAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const LHOME = { anthonia: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]], ifeayomi: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]] };
const LYARD = { anthonia: [[1, 1], [1, 4], [4, 1], [4, 4]], ifeayomi: [[10, 10], [10, 13], [13, 10], [13, 13]] };
const lAbs = (r, step) => (LSTART[r] + step) % 52;
function lCell(r, step, k) { if (step < 0) return LYARD[r][k]; if (step <= 50) return LPATH[lAbs(r, step)]; if (step <= 55) return LHOME[r][step - 51]; return [7, 7]; }
function lMovable(st, r) { const d = st.dice; return st.tok[r].map((s, k) => (s < 0 ? (d === 6 ? k : -1) : s + d <= 56 ? k : -1)).filter((k) => k >= 0); }
G.ludo = {
  name: 'Ludo', short: 'Race your seeds home', icon: ICON('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/><circle cx="16" cy="16" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>'),
  desc: 'Roll a 6 to bring a seed out. Move round the board and up your home lane. Land on your partner\'s seed to send it back (stars are safe). A 6 or a capture gives you another roll. Get all 4 home to win.',
  start(me) { return { kind: 'ludo', tok: { anthonia: [-1, -1, -1, -1], ifeayomi: [-1, -1, -1, -1] }, turn: me, dice: 0, rolled: false, msg: `${NAMES[me]} rolls first` }; },
  score: (st) => [st.tok.anthonia.filter((s) => s === 56).length + ' home', st.tok.ifeayomi.filter((s) => s === 56).length + ' home'],
  view(st, me) {
    const mine = st.turn === me && !st.over, mov = mine && st.rolled ? new Set(lMovable(st, me)) : new Set();
    const grid = [];
    const pathIdx = {}; LPATH.forEach(([r, c], i) => { pathIdx[r * 15 + c] = i; });
    for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) { let cls = 'lc';
      if (r < 6 && c < 6) cls += ' yard a'; else if (r > 8 && c > 8) cls += ' yard i'; else if (r < 6 && c > 8) cls += ' yard x1'; else if (r > 8 && c < 6) cls += ' yard x2';
      else if (r >= 6 && r <= 8 && c >= 6 && c <= 8) cls += r === 7 && c === 7 ? ' center' : ' mid';
      else if (r === 7 && c >= 1 && c <= 5) cls += ' homeA'; else if (r === 7 && c >= 9 && c <= 13) cls += ' homeI';
      else if (pathIdx[r * 15 + c] !== undefined) { const i = pathIdx[r * 15 + c]; cls += ' path' + (LSAFE.has(i) ? ' safe' : '') + (i === 0 ? ' startA' : i === 26 ? ' startI' : ''); }
      grid.push(`<div class="${cls}" style="grid-row:${r + 1};grid-column:${c + 1}">${cls.includes('safe') && !cls.includes('start') ? '★' : ''}</div>`); }
    const toks = []; const stack = {};
    for (const r of ['anthonia', 'ifeayomi']) st.tok[r].forEach((s, k) => { const [y, x] = lCell(r, s, k); const key = y * 15 + x; const n = (stack[key] = (stack[key] || 0) + 1) - 1;
      const can = r === me && mov.has(k); toks.push(`<button class="ltok ${r} ${can ? 'can' : ''}" style="grid-row:${y + 1};grid-column:${x + 1};transform:translate(${n * 4}px,${-n * 4}px)" ${can ? `data-act="g" data-g="ludo" data-a="move" data-x="${k}"` : 'disabled'} aria-label="Seed">${s === 56 ? '✓' : ''}</button>`); });
    return `<div class="lboard">${grid.join('')}${toks.join('')}</div>
      <div class="row" style="justify-content:center;gap:14px"><div class="die ${st.rolled || !mine ? '' : 'pulse'}">${st.dice || '–'}</div>${mine && !st.rolled ? gbtn('ludo', 'roll', 'Roll', 'primary') : mine ? '<span class="small muted">Tap a glowing seed to move it</span>' : ''}</div>
      <div class="row" style="justify-content:space-around"><span class="row">${av('anthonia', 26)}${st.tok.anthonia.filter((s) => s === 56).length}/4 home</span><span class="row">${st.tok.ifeayomi.filter((s) => s === 56).length}/4 home${av('ifeayomi', 26)}</span></div>`;
  },
  act: {
    roll(st) { const me = S.role; if (st.turn !== me || st.rolled || st.over) return; st.dice = 1 + Math.floor(Math.random() * 6); const mv = lMovable(st, me);
      if (!mv.length) { logLine(st, `${NAMES[me]} rolled ${st.dice}: no move`); st.turn = other(me); st.rolled = false; }
      else { st.rolled = true; st.msg = `${NAMES[me]} rolled ${st.dice}`; if (mv.length === 1 && st.tok[me].filter((s) => s >= 0 && s < 56).length <= 1 && st.tok[me][mv[0]] >= 0) { return G.ludo.doMove(st, mv[0]); } }
      saveGame('ludo', st); },
    move(st, t) { const me = S.role; if (st.turn !== me || !st.rolled) return; const k = +t.dataset.x; if (!lMovable(st, me).includes(k)) return; G.ludo.doMove(st, k); },
  },
  doMove(st, k) { const me = S.role, you = other(me), s = st.tok[me][k]; const ns = s < 0 ? 0 : s + st.dice; st.tok[me][k] = ns; let cap = false;
    if (ns <= 50) { const a = lAbs(me, ns); if (!LSAFE.has(a)) st.tok[you].forEach((o, j) => { if (o >= 0 && o <= 50 && lAbs(you, o) === a) { st.tok[you][j] = -1; cap = true; } }); }
    let msg = s < 0 ? `${NAMES[me]} brought a seed out` : ns === 56 ? `${NAMES[me]} got a seed home!` : `${NAMES[me]} moved ${st.dice}`; if (cap) msg += ` and sent ${NAMES[you]}'s seed back!`;
    if (st.tok[me].every((x) => x === 56)) { st.over = true; st.winner = me; st.turn = null; }
    else if (!(st.dice === 6 || cap || ns === 56)) st.turn = you;
    st.rolled = false; logLine(st, msg); if (cap && !st.over) toast('Captured!'); saveGame('ludo', st); },
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
    if (onFrame && step % 2 === 0) frames.push(B.filter((b) => !b.out).map((b) => ({ n: b.n, x: b.x, y: b.y })));
    if (!moving) break; }
  return { balls: B.filter((b) => !b.out).map((b) => ({ n: b.n, x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10 })), potted, firstHit, frames }; }
function drawTable(cv, balls, aim) {
  const w = cv.clientWidth, dpr = Math.min(2, devicePixelRatio || 1), sc = w / (PW + 60), h = (PH + 60) * sc; cv.style.height = h + 'px'; cv.width = w * dpr; cv.height = h * dpr;
  const x = cv.getContext('2d'); x.scale(dpr * sc, dpr * sc); x.fillStyle = '#7a4a2a'; x.beginPath(); x.roundRect ? x.roundRect(0, 0, PW + 60, PH + 60, 26) : x.rect(0, 0, PW + 60, PH + 60); x.fill();
  x.translate(30, 30); const g = x.createRadialGradient(PW / 2, PH / 2, 50, PW / 2, PH / 2, PW / 1.6); g.addColorStop(0, '#2fa36b'); g.addColorStop(1, '#17714a'); x.fillStyle = g; x.fillRect(0, 0, PW, PH);
  x.strokeStyle = 'rgba(255,255,255,.15)'; x.beginPath(); x.moveTo(250, 0); x.lineTo(250, PH); x.stroke();
  x.fillStyle = '#111'; for (const [px, py] of POCKETS) { x.beginPath(); x.arc(px, Math.min(PH, Math.max(0, py)), 24, 0, 7); x.fill(); }
  if (aim) { const c = balls.find((b) => b.n === 0); if (c) { x.setLineDash([10, 10]); x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 3; x.beginPath(); x.moveTo(c.x, c.y); x.lineTo(c.x + Math.cos(aim.a) * 420, c.y + Math.sin(aim.a) * 420); x.stroke(); x.setLineDash([]);
    x.strokeStyle = '#e8c48a'; x.lineWidth = 9; x.lineCap = 'round'; const back = 30 + aim.p * 90; x.beginPath(); x.moveTo(c.x - Math.cos(aim.a) * back, c.y - Math.sin(aim.a) * back); x.lineTo(c.x - Math.cos(aim.a) * (back + 300), c.y - Math.sin(aim.a) * (back + 300)); x.stroke(); } }
  for (const b of balls) { x.save(); x.beginPath(); x.arc(b.x, b.y, BR, 0, 7); x.clip(); x.fillStyle = b.n > 8 ? '#fff' : ballCol(b.n); x.fillRect(b.x - BR, b.y - BR, BR * 2, BR * 2);
    if (b.n > 8) { x.fillStyle = ballCol(b.n); x.fillRect(b.x - BR, b.y - BR * .55, BR * 2, BR * 1.1); }
    if (b.n) { x.fillStyle = '#fff'; x.beginPath(); x.arc(b.x, b.y, BR * .48, 0, 7); x.fill(); x.fillStyle = '#111'; x.font = `bold ${BR * .62}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(b.n, b.x, b.y + .5); }
    x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(b.x - BR * .35, b.y - BR * .4, BR * .25, 0, 7); x.fill(); x.restore(); }
}
const groupBalls = (g) => (g === 'solids' ? [1, 2, 3, 4, 5, 6, 7] : [9, 10, 11, 12, 13, 14, 15]);
let poolAim = { a: 0, p: .6 }, poolAnim = null, poolSeen = null;
G.pool = {
  name: 'Pool', short: '8-ball, shot by shot', icon: ICON('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 9v6"/>'),
  desc: '8-ball pool. Pot a ball to claim solids or stripes, clear your group, then sink the black 8 to win. Potting the white or missing every ball is a foul. Pot the 8 too early and you lose.',
  start(me) { return { kind: 'pool', balls: rack(), groups: { anthonia: null, ifeayomi: null }, turn: me, shot: 0, msg: `${NAMES[me]} breaks` }; },
  view(st, me) { const mine = st.turn === me && !st.over, g = st.groups[me];
    const left = (r) => (st.groups[r] ? groupBalls(st.groups[r]).filter((n) => st.balls.some((b) => b.n === n)).length : null);
    return `<div class="row between small"><span class="row">${av('anthonia', 24)}${st.groups.anthonia ? `${st.groups.anthonia} · ${left('anthonia')} left` : 'open'}</span><span class="row">${st.groups.ifeayomi ? `${st.groups.ifeayomi} · ${left('ifeayomi')} left` : 'open'}${av('ifeayomi', 24)}</span></div>
      <canvas id="pool" class="pool"></canvas>
      ${mine ? `<p class="small muted" style="margin:0">Drag on the table to aim, set the power, then shoot.${g ? ` You're on <b>${g}</b>.` : ''}</p>
        <div class="row" style="flex-wrap:nowrap"><span class="small muted">Power</span><input type="range" id="poolPow" min="5" max="100" value="${Math.round(poolAim.p * 100)}" style="flex:1"><button class="btn primary" data-act="g" data-g="pool" data-a="shoot">Shoot</button></div>` : ''}`; },
  post(st, me) { const cv = document.getElementById('pool'); if (!cv || !st) return;
    if (st.shot && poolSeen !== null && st.shot !== poolSeen && st.last && st.last.by !== me && st.last.before && !poolAnim) { G.pool.replay(st); }
    poolSeen = st.shot;
    if (!poolAnim) drawTable(cv, st.balls, st.turn === me && !st.over ? poolAim : null);
    const pw = document.getElementById('poolPow'); if (pw) pw.oninput = () => { poolAim.p = pw.value / 100; drawTable(cv, st.balls, poolAim); };
    const aimAt = (e) => { if (st.turn !== me || st.over || poolAnim) return; const r = cv.getBoundingClientRect(), sc = r.width / (PW + 60); const px = (e.clientX - r.left) / sc - 30, py = (e.clientY - r.top) / sc - 30; const c = st.balls.find((b) => b.n === 0); if (!c) return; poolAim.a = Math.atan2(py - c.y, px - c.x); drawTable(cv, st.balls, poolAim); };
    cv.onpointerdown = (e) => { cv.setPointerCapture(e.pointerId); aimAt(e); }; cv.onpointermove = (e) => { if (e.buttons || e.pointerType === 'touch') aimAt(e); }; },
  replay(st) { if (!document.getElementById('pool')) return; const r = simulate(st.last.before, st.last.a, st.last.p, true); let k = 0;
    poolAnim = setInterval(() => { const cv = document.getElementById('pool'); if (!cv) { clearInterval(poolAnim); poolAnim = null; return; } if (k >= r.frames.length) { clearInterval(poolAnim); poolAnim = null; const cur = S.games.pool || st; drawTable(cv, cur.balls, cur.turn === S.role && !cur.over ? poolAim : null); return; } drawTable(cv, r.frames[k], null); k++; }, 16); },
  act: {
    shoot(st) { const me = S.role, you = other(me); if (st.turn !== me || st.over || poolAnim) return; const pw = document.getElementById('poolPow'); poolAim.p = (pw ? pw.value : 60) / 100;
      const before = st.balls.map((b) => ({ ...b })); const r = simulate(before, poolAim.a, poolAim.p, true); const cv = document.getElementById('pool'); let k = 0;
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
      poolAnim = setInterval(() => { if (k >= r.frames.length || !cv) { clearInterval(poolAnim); poolAnim = null; finish(); return; } drawTable(cv, r.frames[k], null); k++; }, 16); },
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
    <div class="yt" id="ytWrap"><div id="ytp"></div>${st.videoId ? '' : '<div class="ytEmpty">Paste a link to start watching together</div>'}</div>
    <div class="row">${gbtn('movie', 'sync', 'Sync to partner', 'sm')}<span class="small muted" id="ytStatus">${G.movie.status(st)}</span></div>
    <div class="chat" id="ytChatList">${G.movie.chatHtml(st)}</div>
    <div class="row" style="flex-wrap:nowrap"><input type="text" id="ytChat" placeholder="Say something sweet"><button class="btn sm" data-act="g" data-g="movie" data-a="say">Send</button></div>
    <a class="small" href="https://www.teleparty.com/" target="_blank" rel="noopener" style="color:var(--her)">Watching Netflix? Open Teleparty</a>`; },
  status: (st) => (st && st.videoId ? `${NAMES[st.by]} last ${st.playing ? 'pressed play' : 'paused'}` : ''),
  chatHtml: (st) => ((st && st.chat) || []).slice(-30).map((m) => `<div class="bubble ${m.by}">${av(m.by, 24)}<div class="b">${esc(m.t)}</div></div>`).join(''),
  update(st, me) { if (!st || !st.videoId || !document.querySelector('#ytWrap iframe')) { render(true); return; }
    const c = document.getElementById('ytChatList'); if (c) { c.innerHTML = G.movie.chatHtml(st); c.scrollTop = c.scrollHeight; }
    const s = document.getElementById('ytStatus'); if (s) s.textContent = G.movie.status(st); G.movie.post(st, me); },
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
    sync(st) { if (!st) return; ytLastApplied = 0; G.movie.post(st, '__force'); },
    say(st) { const t = val('ytChat').trim(); if (!t) return; st = st || G.movie.start(S.role); st.chat = [...(st.chat || []), { by: S.role, t, at: Date.now() }].slice(-40); clearIn('ytChat'); saveGame('movie', st); },
  },
};
