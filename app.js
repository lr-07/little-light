const API_BASE = 'https://little-light-api.3ea33e698718c5066f5142f39596d1cb.workers.dev';

const screens = ['splash', 'home', 'chat', 'mood-journal', 'journey', 'community', 'profile'];
let currentLang = 'en';
let chatHistory = [];
let selectedMood = null;
const selectedSources = new Set();

const translations = {
  fi: {
    welcomeSlogan: 'Pieni valo vaikeille päiville.',
    welcomeDesc: 'Kukaan ei saa kohdata vaikeita päiviä yksin.',
    homeTitle: 'Hyvää iltaa.',
    homeSubtitle: 'Miten sinä tunnet olosi tänään?',
    chatSubtitle: 'Ota aikaa.<br>Olen täällä kuuntelemassa.',
    journalTitle: 'Päivän päiväkirja',
    journalDesc: 'Mitä tänään tapahtui?',
    journeyLabel: 'Pieni matka',
    moodTitle: 'Tunnelmien päiväkirja',
    moodStep1: 'Miten sinä tunnet olosi?',
    moodStep2: 'Mitä painaa?',
    moodStep3: 'Pieni kiitollisuus',
    journeyTitle: 'Pieni matka',
    journeySubtitle: '30 päivää uudelleen aloittamista',
    communityTitle: 'Puuaukko',
    profileTitle: 'Profiilini',
    chatWelcome: 'Hei, olen Lumi. Miten sinä tunnet olosi tänään?'
  },
  en: {
    welcomeSlogan: 'A small light for difficult days.',
    welcomeDesc: 'No one should face difficult days alone.',
    homeTitle: '',
    homeSubtitle: 'How are you feeling today?',
    chatSubtitle: "Take your time.<br>I'm here to listen.",
    journalTitle: "Today's Journal",
    journalDesc: 'What happened today?',
    journeyLabel: 'Little Journey',
    moodTitle: 'Mood Journal',
    moodStep1: 'How are you feeling?',
    moodStep2: "What's weighing on you?",
    moodStep3: 'A little gratitude',
    journeyTitle: 'Little Journey',
    journeySubtitle: '30 Days of Restart',
    communityTitle: 'Tree Hole',
    profileTitle: 'My Profile',
    chatWelcome: "Hi, I'm Lumi. How are you feeling today?"
  }
};

const lumiResponsePatterns = [
  { empathy: 'That sounds really hard.', ack: 'Thank you for telling me.', question: 'Do you want to share more?' },
  { empathy: 'I can hear how much this weighs on you.', ack: 'It takes courage to talk about this.', question: 'How long have you been feeling this way?' },
  { empathy: "I'm so sorry you're going through this.", ack: "Whatever you're feeling is valid.", question: 'Is there anything I can do to help?' },
  { empathy: 'That must have hurt.', ack: "You're not alone in this.", question: 'What was the hardest part for you?' },
  { empathy: "It sounds like you've been carrying a lot.", ack: 'I admire your strength for keeping going.', question: 'Would you like to talk about it more?' },
  { empathy: 'I can imagine how exhausting that is.', ack: 'Thank you for trusting me with this.', question: 'What do you need right now?' },
  { empathy: "That doesn't sound fair.", ack: 'Your feelings matter.', question: 'How have you been coping?' },
  { empathy: "I'm here with you in this.", ack: "You don't have to carry this alone.", question: 'What would help you feel better today?' }
];

function getLumiFallback() {
  const pattern = lumiResponsePatterns[Math.floor(Math.random() * lumiResponsePatterns.length)];
  return `${pattern.empathy} ${pattern.ack} ${pattern.question}`;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (currentLang === 'fi') {
    if (hour < 6) return 'Hyvää yötä.';
    if (hour < 12) return 'Hyvää aamua.';
    if (hour < 18) return 'Hyvää iltapäivää.';
    return 'Hyvää iltaa.';
  }
  if (hour < 6) return 'Good night.';
  if (hour < 12) return 'Good morning.';
  if (hour < 18) return 'Good afternoon.';
  return 'Good evening.';
}

function navigateTo(screenId) {
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
  updateNavActive(screenId);
}

function updateNavActive(screenId) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const navMap = { 'home': 0, 'chat': 1, 'mood-journal': 2, 'community': 3, 'profile': 4 };
  if (navMap[screenId] !== undefined) {
    const items = document.querySelectorAll('.nav-item');
    if (items[navMap[screenId]]) items[navMap[screenId]].classList.add('active');
  }
}

function selectMood(btn) {
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const moodColors = {
    '😊': '#F0F5F8',
    '🙂': '#FAF8F4',
    '😔': '#F2F4F0',
    '😭': '#F4F0F2'
  };
  document.body.style.background = moodColors[btn.textContent] || '#FAF8F4';
}

function saveJournal(textarea) {
  try { localStorage.setItem('dailyJournal', textarea.value); } catch (e) {}
}

function handleKeyPress(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  const input = document.getElementById('msg');
  const messages = document.getElementById('messages');
  const value = input.value.trim();
  if (!value) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.textContent = value;
  messages.appendChild(userMsg);
  chatHistory.push({ role: 'user', content: value });
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  const typing = document.createElement('div');
  typing.className = 'message ai typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory.slice(-10) }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) throw new Error('Network error');
    const data = await response.json();

    messages.removeChild(typing);

    if (data.error) throw new Error(data.error);

    const reply = data.reply || getLumiFallback();
    chatHistory.push({ role: 'assistant', content: reply });

    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai';
    messages.appendChild(aiMsg);
    typeWriter(aiMsg, reply);
    messages.scrollTop = messages.scrollHeight;

  } catch (error) {
    messages.removeChild(typing);
    const reply = getLumiFallback();
    chatHistory.push({ role: 'assistant', content: reply });

    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai';
    messages.appendChild(aiMsg);
    typeWriter(aiMsg, reply);
    messages.scrollTop = messages.scrollHeight;
  }
}

function typeWriter(element, text) {
  element.textContent = '';
  let i = 0;
  const speed = 50;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

function selectMoodOption(btn, mood) {
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMood = mood;
}

function toggleSource(btn, source) {
  btn.classList.toggle('active');
  if (btn.classList.contains('active')) {
    selectedSources.add(source);
  } else {
    selectedSources.delete(source);
  }
}

function saveMoodJournal() {
  const gratitude = document.getElementById('gratitude').value;
  const data = {
    mood: selectedMood,
    sources: Array.from(selectedSources),
    gratitude: gratitude,
    date: new Date().toISOString()
  };
  try { localStorage.setItem('moodJournal', JSON.stringify(data)); } catch (e) {}

  const btn = document.querySelector('#mood-journal .btn');
  const originalText = btn.textContent;
  btn.textContent = 'Saved ✨';
  btn.style.background = '#A8CFA8';
  btn.disabled = true;

  setTimeout(() => {
    navigateTo('home');
    btn.textContent = originalText;
    btn.style.background = '';
    btn.disabled = false;
  }, 1000);
}

function completeTask() {
  const btn = document.querySelector('#journey .btn');
  btn.textContent = 'Completed 🌿';
  btn.style.background = '#A8CFA8';
  btn.disabled = true;

  createParticles();

  const tree = document.getElementById('journeyTree');
  if (tree) {
    tree.classList.remove('growing');
    void tree.offsetWidth;
    tree.classList.add('growing');
  }

  setTimeout(() => {
    const dayNum = parseInt(document.getElementById('journeyDayNum').textContent);
    const nextDay = Math.min(dayNum + 1, 30);
    document.getElementById('journeyDayNum').textContent = nextDay;
    const pct = Math.round((nextDay / 30) * 100);
    document.getElementById('journeyBarFill').style.width = pct + '%';
    document.getElementById('journeyPercent').textContent = pct;

    if (nextDay >= 10 && nextDay < 30) tree.textContent = '🌿';
    else if (nextDay >= 30) tree.textContent = '🌳';
    else tree.textContent = '🌱';

    const cards = document.querySelectorAll('#dayCards .day-card');
    if (cards[dayNum - 1]) {
      cards[dayNum - 1].classList.remove('current');
      cards[dayNum - 1].classList.add('completed');
    }
    if (cards[nextDay - 1]) {
      cards[nextDay - 1].classList.remove('locked');
      cards[nextDay - 1].classList.add('current');
    }
  }, 500);

  setTimeout(() => {
    navigateTo('home');
    btn.textContent = 'Mark Complete';
    btn.style.background = '';
    btn.disabled = false;
  }, 2000);
}

function createParticles() {
  const container = document.createElement('div');
  container.className = 'particle-container';
  document.body.appendChild(container);

  const particles = ['🍃', '🌿', '🌸', '✨', '🌼'];
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 2 + 's';
    particle.style.fontSize = (16 + Math.random() * 16) + 'px';
    container.appendChild(particle);
  }

  setTimeout(() => {
    if (container.parentNode) document.body.removeChild(container);
  }, 4000);
}

function toggleHug(btn) {
  btn.classList.toggle('active');
  if (btn.classList.contains('active')) {
    btn.innerHTML = '🤗 Hugged';
  } else {
    btn.innerHTML = '🤗 Hug';
  }
}

function showEncourage(btn) {
  const encourages = [
    'You are stronger than you know 💪',
    "Keep going, you're doing great 🌟",
    'You matter, and you are not alone 🤍',
    'Every small step counts 🌱',
    'I believe in you 💖'
  ];
  const randomEncourage = encourages[Math.floor(Math.random() * encourages.length)];
  if (!btn.classList.contains('active')) {
    btn.innerHTML = `💝 ${randomEncourage}`;
    btn.classList.add('active');
    setTimeout(() => {
      btn.innerHTML = '💝 Encourage';
      btn.classList.remove('active');
    }, 3000);
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fi' : 'en';
  const btn = document.getElementById('langBtn');
  btn.textContent = currentLang === 'en' ? 'FI' : 'EN';

  try { localStorage.setItem('lumi_lang', currentLang); } catch (e) {}
  applyTranslations();
}

function applyTranslations() {
  const t = translations[currentLang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });

  if (currentLang === 'fi') {
    document.getElementById('homeTitle').textContent = t.homeTitle;
    document.getElementById('homeSubtitle').textContent = t.homeSubtitle;
    document.getElementById('chatSubtitle').innerHTML = t.chatSubtitle;
    document.getElementById('journalTitle').textContent = t.journalTitle;
    document.getElementById('journalDesc').textContent = t.journalDesc;
    document.getElementById('journeyLabel').textContent = t.journeyLabel;
    document.getElementById('moodTitle').textContent = t.moodTitle;
    document.getElementById('moodStep1').textContent = t.moodStep1;
    document.getElementById('moodStep2').textContent = t.moodStep2;
    document.getElementById('moodStep3').textContent = t.moodStep3;
    document.getElementById('journeyTitle').textContent = t.journeyTitle;
    document.getElementById('journeySubtitle').textContent = t.journeySubtitle;
    document.getElementById('communityTitle').textContent = t.communityTitle;
    document.getElementById('profileTitle').textContent = t.profileTitle;

    const chatWelcome = document.getElementById('chatWelcome');
    if (chatWelcome && !chatWelcome.classList.contains('typing')) {
      chatWelcome.textContent = t.chatWelcome;
    }
  } else {
    document.getElementById('homeTitle').textContent = getTimeGreeting();
    document.getElementById('homeSubtitle').textContent = 'How are you feeling today?';
    document.getElementById('chatSubtitle').innerHTML = "Take your time.<br>I'm here to listen.";
    document.getElementById('journalTitle').textContent = "Today's Journal";
    document.getElementById('journalDesc').textContent = 'What happened today?';
    document.getElementById('journeyLabel').textContent = 'Little Journey';
    document.getElementById('moodTitle').textContent = 'Mood Journal';
    document.getElementById('moodStep1').textContent = 'How are you feeling?';
    document.getElementById('moodStep2').textContent = "What's weighing on you?";
    document.getElementById('moodStep3').textContent = 'A little gratitude';
    document.getElementById('journeyTitle').textContent = 'Little Journey';
    document.getElementById('journeySubtitle').textContent = '30 Days of Restart';
    document.getElementById('communityTitle').textContent = 'Tree Hole';
    document.getElementById('profileTitle').textContent = 'My Profile';

    const chatWelcome = document.getElementById('chatWelcome');
    if (chatWelcome && !chatWelcome.classList.contains('typing')) {
      chatWelcome.textContent = "Hi, I'm Lumi. How are you feeling today?";
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('lumi_lang');
  if (savedLang === 'fi' || savedLang === 'en') {
    currentLang = savedLang;
  }
  const langBtn = document.getElementById('langBtn');
  if (langBtn) langBtn.textContent = currentLang === 'en' ? 'FI' : 'EN';

  document.getElementById('homeTitle').textContent = getTimeGreeting();
  applyTranslations();

  const savedJournal = localStorage.getItem('dailyJournal');
  if (savedJournal) {
    const textarea = document.getElementById('journalTextarea');
    if (textarea) textarea.value = savedJournal;
  }

  const savedGratitude = localStorage.getItem('lumi_gratitude');
  if (savedGratitude) {
    const gratitudeEl = document.getElementById('gratitude');
    if (gratitudeEl) gratitudeEl.value = savedGratitude;
  }

  if (gratitudeEl) {
    gratitudeEl.addEventListener('input', (e) => {
      try { localStorage.setItem('lumi_gratitude', e.target.value); } catch (e) {}
    });
  }

  setTimeout(() => {
    navigateTo('home');
  }, 3500);
});
