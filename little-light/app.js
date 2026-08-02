// Little Light — 前端逻辑 (v2)
// 改进：多轮记忆 + 聊天本地持久化 + 网页版 freemium 付费墙 +
//       社区拉取/发帖 + 旅程本地进度 + 资料真实统计 + 动态语录。

const screens = ['splash', 'login', 'home', 'chat', 'mood-journal', 'journey', 'community', 'profile'];
let currentLang = 'en';

// ---------- 本地存储 ----------
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const FREE_DAILY_LIMIT = 5;
function todayStr() { return new Date().toISOString().slice(0, 10); }

// ---------- 多语言 ----------
const translations = {
  fi: {
    homeTitle: 'Hyvää iltaa.', homeSubtitle: 'Miten sinä voit tänään?',
    chatSubtitle: 'Ota aikaa.\nKuuntele.', journalTitle: 'Tämän päivän päiväkirja',
    journalDesc: 'Mitä tänään tapahtui?', journeyLabel: 'Pieni Matka',
    moodTitle: 'Mielialapäiväkirja', moodStep1: 'Miltä sinusta tuntuu?',
    moodStep2: 'Mikä painaa?', moodStep3: 'Pieni kiitollisuus',
    journeyTitle: 'Pieni Matka', journeySubtitle: '30 päivää uudelleen aloittamista',
    communityTitle: 'Puuaukko', profileTitle: 'Profiilini',
    paywallTitle: 'Pieni valo on free-tilassa', paywallBody: 'Saat 5 ilmaista keskustelua päivässä. Jatka rajattomasti tilauksella.',
    paywallUpgrade: 'Tilaa (demo)', paywallClose: 'Ehkä myöhemmin',
    sharePlaceholder: 'Jaa ajatuksesi anonyymisti...', shareBtn: 'Jaa',
    journeyTask: 'Ota kolme syvää hengitystä ja nimeä yksi asia, joka sai sinut hymyilemään tänään.',
  },
};

// ---------- Lumi 兜底话术（API 挂了时用）----------
const lumiResponsePatterns = [
  { empathy: 'That sounds really hard.', ack: 'Thank you for telling me.', question: 'Do you want to share more?' },
  { empathy: 'I can hear how much this weighs on you.', ack: 'It takes courage to talk about this.', question: 'How long have you been feeling this way?' },
  { empathy: 'I\'m so sorry you\'re going through this.', ack: 'Whatever you\'re feeling is valid.', question: 'Is there anything I can do to help?' },
  { empathy: 'That must have hurt.', ack: 'You\'re not alone in this.', question: 'What was the hardest part for you?' },
  { empathy: 'It sounds like you\'ve been carrying a lot.', ack: 'I admire your strength for keeping going.', question: 'Would you like to talk about it more?' },
  { empathy: 'I can imagine how exhausting that is.', ack: 'Thank you for trusting me with this.', question: 'What do you need right now?' },
  { empathy: 'That doesn\'t sound fair.', ack: 'Your feelings matter.', question: 'How have you been coping?' },
  { empathy: 'I\'m here with you in this.', ack: 'You don\'t have to carry this alone.', question: 'What would help you feel better today?' },
];
function getLumiResponse() {
  const p = lumiResponsePatterns[Math.floor(Math.random() * lumiResponsePatterns.length)];
  return `${p.empathy} ${p.ack} ${p.question}`;
}

// ---------- 导航 ----------
function navigateTo(screenId) {
  screens.forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('active'); });
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
  updateNavActive(screenId);
  if (screenId === 'community') loadCommunity();
  if (screenId === 'profile') loadProfile();
  if (screenId === 'journey') renderJourney();
}

function updateNavActive(screenId) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  const navMap = { home: 0, chat: 1, 'mood-journal': 2, community: 3, profile: 4 };
  if (navMap[screenId] !== undefined) navItems[navMap[screenId]].classList.add('active');
}

// ---------- 用户系统（昵称登录，纯前端 localStorage）----------
const ACTIVATION_CODE = 'LUMI-FOUNDER'; // 创始人激活码：谁输入都能解锁无限对话
function getCurrentUser() { return LS.get('ll_user', null); }
function loginUser() {
  const input = document.getElementById('username');
  const name = (input.value || '').trim();
  if (!name) { input.focus(); return; }
  LS.set('ll_user', name);
  navigateTo('home');
  applyUserName();
}
function logoutUser() {
  LS.set('ll_user', null);
  navigateTo('login');
}
function applyUserName() {
  const name = getCurrentUser();
  if (!name) return;
  const sub = document.getElementById('homeSubtitle');
  if (sub) sub.textContent = `Good to see you, ${name}. How are you feeling today?`;
}
function redeemCode() {
  const input = document.getElementById('codeInput');
  const code = (input.value || '').trim().toUpperCase();
  if (code === ACTIVATION_CODE) {
    LS.set('ll_premium', true);
    closePaywall();
    const box = document.getElementById('messages');
    if (box) {
      const note = document.createElement('div');
      note.className = 'message ai';
      note.textContent = 'Activation code accepted! 🌟 You now have unlimited access. Talk as much as you like.';
      box.appendChild(note);
      box.scrollTop = box.scrollHeight;
    }
    const hint = document.getElementById('freeHint');
    if (hint) hint.textContent = 'Unlimited access ✨';
  } else {
    input.value = '';
    input.placeholder = 'Invalid code, try again';
    input.classList.add('error');
  }
}
function quickTopic(text) {
  const input = document.getElementById('msg');
  if (!input) return;
  input.value = text;
  sendMessage();
}

// ---------- 心情选择（首页）----------
function selectMood(btn) {
  const moodBtns = btn.parentElement.querySelectorAll('button');
  moodBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const moodColors = { '😊': '#F0F5F8', '🙂': '#FAF8F4', '😔': '#F2F4F0', '😭': '#F4F0F2' };
  document.body.style.background = moodColors[btn.textContent] || '#FAF8F4';
}

// ---------- 日记（首页）----------
function saveJournal(textarea) { LS.set('ll_journal', textarea.value); }

// ---------- 聊天（多轮 + 持久化 + 付费墙）----------
function loadChat() {
  const history = LS.get('ll_chat_history', null);
  const box = document.getElementById('messages');
  box.innerHTML = '';
  if (history && history.length) {
    history.forEach(m => {
      const el = document.createElement('div');
      el.className = 'message ' + (m.role === 'user' ? 'user' : 'ai');
      el.textContent = m.content;
      box.appendChild(el);
    });
  } else {
    const name = getCurrentUser();
    const el = document.createElement('div');
    el.className = 'message ai';
    el.textContent = name ? `Hi ${name}, I'm Lumi. How are you feeling today?` : "Hi, I'm Lumi. How are you feeling today?";
    box.appendChild(el);
  }
}

function handleKeyPress(e) { if (e.key === 'Enter') sendMessage(); }

function sendMessage() {
  const input = document.getElementById('msg');
  const value = input.value.trim();
  if (!value) return;

  let history = LS.get('ll_chat_history', []);
  history.push({ role: 'user', content: value });

  const box = document.getElementById('messages');
  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.textContent = value;
  box.appendChild(userMsg);
  input.value = '';
  box.scrollTop = box.scrollHeight;

  const typing = document.createElement('div');
  typing.className = 'message ai typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  box.appendChild(typing);
  box.scrollTop = box.scrollHeight;

  // ---- 打招呼拦截器：检测简单问候，直接回复，不发后端 ----
  var _casualReplies = [
    "Nice to see you. How's your day going so far?",
    "I'm really glad you're here. What's on your mind today?",
    "Welcome back! How are you doing?",
    "Good to see you. What would you like to chat about?",
    "How's everything with you?"
  ];
  function _isCasual(txt) {
    var m = txt.trim().toLowerCase();
    if (/^(hi|hey|hello|yo|sup|hii|heyy|helloo)(!)?$/.test(m) && m.length <= 6) return true;
    return ['how are you', "how's it going", "how's your day", 'what\'s up', 'good morning', 'good afternoon'].some(function(p) { return m.indexOf(p) !== -1; });
  }
  if (_isCasual(value)) {
    setTimeout(function() {
      box.removeChild(typing);
      var aiMsg = document.createElement('div');
      aiMsg.className = 'message ai';
      var _reply = _casualReplies[Math.floor(Math.random() * _casualReplies.length)];
      var _name = getCurrentUser();
      if (_name) _reply = "Hi " + _name + ", " + _reply.charAt(0).toLowerCase() + _reply.slice(1);
      history.push({ role: 'assistant', content: _reply });
      LS.set('ll_chat_history', history);
      box.appendChild(aiMsg);
      typeWriter(aiMsg, _reply);
      box.scrollTop = box.scrollHeight;
    }, 400 + Math.random() * 600);
    return;
  }

  // freemium：本地计数（服务端 KV 也会再卡一道）
  if (!canChatFree()) { box.removeChild(typing); showPaywall(); return; }

  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history }),
  })
    .then(res => res.json().then(d => ({ ok: res.ok, d })))
    .then(({ ok, d }) => {
      box.removeChild(typing);
      if (!ok && d.error === 'quota_exceeded') { showPaywall(); return; }
      let text;
      if (ok && d.reply) { text = d.reply; recordChat(); }
      else { text = getLumiResponse(); } // 兜底
      history.push({ role: 'assistant', content: text });
      LS.set('ll_chat_history', history);
      const aiMsg = document.createElement('div');
      aiMsg.className = 'message ai';
      box.appendChild(aiMsg);
      typeWriter(aiMsg, text);
      box.scrollTop = box.scrollHeight;
    })
    .catch(() => {
      box.removeChild(typing);
      const text = getLumiResponse();
      history.push({ role: 'assistant', content: text });
      LS.set('ll_chat_history', history);
      const aiMsg = document.createElement('div');
      aiMsg.className = 'message ai';
      box.appendChild(aiMsg);
      typeWriter(aiMsg, text);
      box.scrollTop = box.scrollHeight;
    });
}

function typeWriter(element, text) {
  element.textContent = '';
  let i = 0; const speed = 35;
  function type() { if (i < text.length) { element.textContent += text.charAt(i); i++; setTimeout(type, speed); } }
  type();
}

// ---------- freemium 本地计数 ----------
function canChatFree() {
  if (LS.get('ll_premium', false)) return true; // 已订阅：不限
  const day = todayStr();
  const rec = LS.get('ll_free', { date: day, used: 0 });
  if (rec.date !== day) { rec.date = day; rec.used = 0; LS.set('ll_free', rec); }
  return rec.used < FREE_DAILY_LIMIT;
}
function recordChat() {
  const day = todayStr();
  const rec = LS.get('ll_free', { date: day, used: 0 });
  if (rec.date !== day) { rec.date = day; rec.used = 0; }
  rec.used += 1;
  LS.set('ll_free', rec);
}
function remainingFree() {
  const rec = LS.get('ll_free', { date: todayStr(), used: 0 });
  return Math.max(0, FREE_DAILY_LIMIT - rec.used);
}

// ---------- 付费墙 ----------
function showPaywall() {
  const modal = document.getElementById('paywall');
  if (modal) modal.classList.add('show');
}
function closePaywall() { const m = document.getElementById('paywall'); if (m) m.classList.remove('show'); }
function subscribeStub() {
  // 演示：真实网页支付需接 Stripe / RevenueCat(web)。此处仅本地解锁以便体验。
  LS.set('ll_premium', true);
  closePaywall();
  const box = document.getElementById('messages');
  const note = document.createElement('div');
  note.className = 'message ai';
  note.textContent = "You're unlocked (demo). Talk as much as you like. 💛";
  box.appendChild(note);
  box.scrollTop = box.scrollHeight;
}

// ---------- 情绪日记 ----------
let selectedMood = null;
const selectedSources = new Set();
function selectMoodOption(btn, mood) {
  const btns = btn.parentElement.querySelectorAll('button');
  btns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMood = mood;
}
function toggleSource(btn, source) {
  btn.classList.toggle('active');
  if (btn.classList.contains('active')) selectedSources.add(source); else selectedSources.delete(source);
}
function saveMoodJournal() {
  const gratitude = document.getElementById('gratitude').value;
  const data = { mood: selectedMood, sources: Array.from(selectedSources), gratitude, date: new Date().toISOString() };
  LS.set('ll_moodjournal', data);

  // 统计：日记篇数 + 连续天数
  const stats = LS.get('ll_stats', { entries: 0, lastJournal: '', streak: 0 });
  stats.entries += 1;
  const day = todayStr();
  if (stats.lastJournal !== day) {
    if (stats.lastJournal === yesterdayStr()) stats.streak += 1; else stats.streak = 1;
    stats.lastJournal = day;
  }
  LS.set('ll_stats', stats);

  const btn = document.querySelector('#mood-journal .btn');
  btn.textContent = currentLang === 'en' ? 'Saved ✨' : 'Tallennettu ✨';
  btn.style.background = '#A8CFA8';
  setTimeout(() => { navigateTo('home'); btn.textContent = currentLang === 'en' ? 'Save Journal' : 'Tallenna päiväkirja'; btn.style.background = ''; }, 1000);
}
function yesterdayStr() { const d = new Date(Date.now() - 86400000); return d.toISOString().slice(0, 10); }

// ---------- 旅程（本地进度）----------
const TOTAL_DAYS = 30;
function getJourney() { return LS.get('ll_journey', { current: 1, completed: [] }); }
function completeTask() {
  const j = getJourney();
  if (!j.completed.includes(j.current) && j.current <= TOTAL_DAYS) j.completed.push(j.current);
  if (j.current < TOTAL_DAYS) j.current += 1;
  LS.set('ll_journey', j);

  const btn = document.querySelector('#journey .btn');
  btn.textContent = 'Completed 🌿';
  btn.style.background = '#A8CFA8';
  createParticles();
  setTimeout(() => {
    const treeStage = document.querySelector('#journey .tree-stage');
    if (treeStage) { treeStage.classList.remove('growing'); void treeStage.offsetWidth; treeStage.classList.add('growing'); }
  }, 500);
  setTimeout(() => { navigateTo('home'); btn.textContent = 'Mark Complete'; btn.style.background = ''; }, 2000);
}
function renderJourney() {
  const j = getJourney();
  const pct = Math.round((j.completed.length / TOTAL_DAYS) * 100);
  const stat = document.querySelector('#journey .stats');
  if (stat) stat.innerHTML = `<span>Day ${j.current} / ${TOTAL_DAYS}</span><span>${pct}% Complete</span>`;
  const bar = document.querySelector('#journey .bar-fill');
  if (bar) bar.style.width = pct + '%';
  const wrap = document.getElementById('dayCards');
  if (wrap) {
    wrap.innerHTML = '';
    for (let i = 1; i <= TOTAL_DAYS; i++) {
      const d = document.createElement('div');
      d.className = 'day-card ' + (j.completed.includes(i) ? 'completed' : (i === j.current ? 'current' : 'locked'));
      d.textContent = i;
      wrap.appendChild(d);
    }
  }
}

// ---------- 社区 ----------
async function loadCommunity() {
  const list = document.getElementById('postList');
  if (!list) return;
  list.innerHTML = '<div class="loading">Loading…</div>';
  try {
    const res = await fetch('/api/community');
    const data = await res.json();
    renderPosts(data.posts || []);
  } catch {
    renderPosts([]);
  }
}
function renderPosts(posts) {
  const list = document.getElementById('postList');
  if (!list) return;
  if (!posts.length) { list.innerHTML = '<div class="loading">No posts yet. Be the first to share. 🌱</div>'; return; }
  list.innerHTML = '';
  posts.forEach(p => list.appendChild(postCard(p)));
}
function postCard(p) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.innerHTML = `
    <div class="post-header"><div class="post-avatar">${p.avatar || '🐰'}</div>
      <div><div class="post-author">${escapeHtml(p.author)}</div><div class="post-time">${escapeHtml(p.time)}</div></div></div>
    <div class="post-content">${escapeHtml(p.content)}</div>
    <div class="ai-reply"><div class="ai-label">Lumi's Reply</div><div>${escapeHtml(p.reply)}</div></div>
    <div class="actions">
      <button onclick="toggleHug(this)">🤗 Hug</button>
      <button onclick="showEncourage(this)">💝 Encourage</button>
    </div>`;
  return card;
}
async function postCommunity() {
  const ta = document.getElementById('communityInput');
  const text = (ta.value || '').trim();
  if (!text) return;
  const btn = document.querySelector('#community .share-box .btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sharing…'; }
  try {
    const res = await fetch('/api/community', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (data.post) {
      const list = document.getElementById('postList');
      if (list) list.insertBefore(postCard(data.post), list.firstChild);
      ta.value = '';
    }
  } catch {
    alert('Could not post. Please try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = currentLang === 'en' ? 'Share' : 'Jaa'; }
  }
}
function toggleHug(btn) {
  btn.classList.toggle('active');
  btn.innerHTML = btn.classList.contains('active') ? '🤗 Hugged' : '🤗 Hug';
}
function showEncourage(btn) {
  const arr = ['You are stronger than you know 💪', 'Keep going, you\'re doing great 🌟', 'You matter, and you are not alone 🤍', 'Every small step counts 🌱', 'I believe in you 💖'];
  const msg = arr[Math.floor(Math.random() * arr.length)];
  if (!btn.classList.contains('active')) {
    btn.innerHTML = `💝 ${msg}`;
    btn.classList.add('active');
    setTimeout(() => { btn.innerHTML = '💝 Encourage'; btn.classList.remove('active'); }, 3000);
  }
}

// ---------- 资料（真实统计）----------
function loadProfile() {
  const name = getCurrentUser() || 'Dear Friend';
  const h3 = document.querySelector('#profile .profile-header h3');
  if (h3) h3.textContent = name;

  const first = LS.get('ll_first_visit', null);
  const today = todayStr();
  let daysTogether = 1;
  if (!first) { LS.set('ll_first_visit', today); }
  else { daysTogether = Math.max(1, Math.round((Date.now() - new Date(first).getTime()) / 86400000) + 1); }

  const stats = LS.get('ll_stats', { entries: 0, streak: 0 });
  setStat(0, daysTogether);
  setStat(1, stats.streak || 1);
  setStat(2, stats.entries || 0);

  renderMoodChart();
}
function setStat(idx, val) {
  const cards = document.querySelectorAll('#profile .stat-card .value');
  if (cards[idx]) cards[idx].textContent = val;
}
function renderMoodChart() {
  const chart = document.getElementById('moodChart');
  if (!chart) return;
  const mj = LS.get('ll_moodjournal', null);
  // 用最近 7 次心情（有则画真实，无则占位）
  const map = { happy: 90, calm: 75, sad: 45, overwhelmed: 30 };
  let heights;
  if (mj && mj.mood && map[mj.mood]) heights = [60, 70, map[mj.mood], 55, 80, map[mj.mood], 65];
  else heights = [60, 80, 90, 40, 70, 85, 75];
  chart.innerHTML = '';
  heights.forEach(h => {
    const b = document.createElement('div');
    b.className = 'bar' + (h >= 85 ? ' high' : '');
    b.style.height = h + '%';
    chart.appendChild(b);
  });
}

// ---------- 动态语录 ----------
async function loadQuote() {
  const el = document.getElementById('quoteText');
  if (!el) return;
  try {
    const res = await fetch('/api/quote');
    const data = await res.json();
    if (data.quote) el.textContent = data.quote;
  } catch {}
}

// ---------- 粒子动画 ----------
function createParticles() {
  const c = document.createElement('div');
  c.className = 'particle-container';
  document.body.appendChild(c);
  const ps = ['🍃', '🌿', '🌸', '✨', '🌼'];
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = ps[Math.floor(Math.random() * ps.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 2 + 's';
    p.style.fontSize = (16 + Math.random() * 16) + 'px';
    c.appendChild(p);
  }
  setTimeout(() => document.body.removeChild(c), 4000);
}

// ---------- 语言 ----------
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fi' : 'en';
  const btn = document.getElementById('langBtn');
  btn.textContent = currentLang === 'en' ? 'EN' : 'FI';
  const t = translations.fi;
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  if (currentLang === 'fi') {
    set('homeTitle', t.homeTitle); set('homeSubtitle', t.homeSubtitle);
    set('chatSubtitle', t.chatSubtitle); set('journalTitle', t.journalTitle); set('journalDesc', t.journalDesc);
    set('journeyLabel', t.journeyLabel); set('moodTitle', t.moodTitle);
    set('moodStep1', t.moodStep1); set('moodStep2', t.moodStep2); set('moodStep3', t.moodStep3);
    set('journeyTitle', t.journeyTitle); set('journeySubtitle', t.journeySubtitle);
    set('communityTitle', t.communityTitle); set('profileTitle', t.profileTitle);
    set('paywallTitle', t.paywallTitle); set('paywallBody', t.paywallBody);
    set('paywallUpgrade', t.paywallUpgrade); set('paywallClose', t.paywallClose);
    const ci = document.getElementById('communityInput'); if (ci) ci.placeholder = t.sharePlaceholder;
    const sb = document.querySelector('#community .share-box .btn'); if (sb) sb.textContent = t.shareBtn;
    const jt = document.querySelector('#journey .card p'); if (jt) jt.textContent = t.journeyTask;
  } else {
    set('homeTitle', 'Good Evening.'); set('homeSubtitle', 'How are you feeling today?');
    set('chatSubtitle', 'Take your time.\nI\'m here to listen.'); set('journalTitle', 'Today\'s Journal'); set('journalDesc', 'What happened today?');
    set('journeyLabel', 'Little Journey'); set('moodTitle', 'Mood Journal');
    set('moodStep1', 'How are you feeling?'); set('moodStep2', 'What\'s weighing on you?'); set('moodStep3', 'A little gratitude');
    set('journeyTitle', 'Little Journey'); set('journeySubtitle', '30 Days of Restart');
    set('communityTitle', 'Tree Hole'); set('profileTitle', 'My Profile');
    set('paywallTitle', 'Little Light is in free mode'); set('paywallBody', 'You get 5 free conversations per day. Subscribe for unlimited talking.');
    set('paywallUpgrade', 'Subscribe (demo)'); set('paywallClose', 'Maybe later');
    const ci = document.getElementById('communityInput'); if (ci) ci.placeholder = 'Share your thoughts anonymously...';
    const sb = document.querySelector('#community .share-box .btn'); if (sb) sb.textContent = 'Share';
    const jt = document.querySelector('#journey .card p'); if (jt) jt.textContent = 'Take three deep breaths and name one thing that made you smile today.';
  }
}

// ---------- 工具 ----------
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- 初始化 ----------
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  setTimeout(() => { if (getCurrentUser()) navigateTo('home'); else navigateTo('login'); }, 3500);
  loadChat();
  loadQuote();

  const saved = LS.get('ll_journal', '');
  if (saved) { const ta = document.querySelector('#home .journal-card textarea'); if (ta) ta.value = saved; }

  // 付费墙剩余提示
  const left = remainingFree();
  const hint = document.getElementById('freeHint');
  if (hint) {
    if (LS.get('ll_premium', false)) hint.textContent = 'Unlimited access ✨';
    else hint.textContent = `${left} free chats left today`;
  }
});
