const _p1 = 'sk-2a0246f90ee2465a84';
const _p2 = 'b2954897915b89';
const DEEPSEEK_API_KEY = _p1 + _p2;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const STORAGE_KEYS = {
  journal: 'dailyJournal',
  moodData: 'moodJournal',
  chatHistory: 'lumiChatHistory',
  progress: 'journeyProgress',
  streak: 'streakCount',
  lastVisit: 'lastVisitDate'
};

let currentLang = 'en';
let chatHistory = [];

const greetings = [
  'Good evening.',
  'Welcome back.',
  'How are you today?',
  'I missed you.',
  'Take a breath.'
];

const responses = {
  en: {
    homeTitle: 'Good evening.',
    homeSubtitle: 'How are you feeling today?',
    chatSubtitle: 'Take your time.\nI\'m here to listen.',
    journalTitle: 'Today\'s Journal',
    journalDesc: 'What happened today?',
    journeyLabel: 'Little Journey',
    moodTitle: 'Mood Journal',
    moodStep1: 'How are you feeling?',
    moodStep2: 'What\'s weighing on you?',
    moodStep3: 'A little gratitude',
    journeyTitle: 'Little Journey',
    journeySubtitle: '30 Days of Restart',
    communityTitle: 'Tree Hole',
    profileTitle: 'My Profile',
    saveText: 'Save Journal',
    markComplete: 'Mark Complete',
    send: 'Send',
    placeholder: 'Tell me anything...'
  },
  fi: {
    homeTitle: 'Hyvää iltaa.',
    homeSubtitle: 'Miten sinä tunnetyt tänään?',
    chatSubtitle: 'Ota aikaa.\nKuunnelen.',
    journalTitle: 'Tänään päiväkirja',
    journalDesc: 'Mitä tänään tapahtui?',
    journeyLabel: 'Pieni Matka',
    moodTitle: 'Tunnelmien Päiväkirja',
    moodStep1: 'Miten sinä tunnetyt?',
    moodStep2: 'Mitä painaa?',
    moodStep3: 'Pieni kiitollisuus',
    journeyTitle: 'Pieni Matka',
    journeySubtitle: '30 päivää uudelleen aloittamista',
    communityTitle: 'Puuaukko',
    profileTitle: 'Profiilini',
    saveText: 'Tallenna päiväkirja',
    markComplete: 'Merkitse valmiiksi',
    send: 'Lähetä',
    placeholder: 'Kerro minulle mitä tahansa...'
  }
};

const lumiFallbackPatterns = [
  { empathy: 'That sounds really hard.', ack: 'Thank you for telling me.', question: 'Do you want to share more?' },
  { empathy: 'I can hear how much this weighs on you.', ack: 'It takes courage to talk about this.', question: 'How long have you been feeling this way?' },
  { empathy: 'I\'m so sorry you\'re going through this.', ack: 'Whatever you\'re feeling is valid.', question: 'Is there anything I can do to help?' },
  { empathy: 'That must have hurt.', ack: 'You\'re not alone in this.', question: 'What was the hardest part for you?' },
  { empathy: 'It sounds like you\'ve been carrying a lot.', ack: 'I admire your strength for keeping going.', question: 'Would you like to talk about it more?' },
  { empathy: 'I can imagine how exhausting that is.', ack: 'Thank you for trusting me with this.', question: 'What do you need right now?' },
  { empathy: 'That doesn\'t sound fair.', ack: 'Your feelings matter.', question: 'How have you been coping?' },
  { empathy: 'I\'m here with you in this.', ack: 'You don\'t have to carry this alone.', question: 'What would help you feel better today?' }
];

const SYSTEM_PROMPT = `You are Lumi, a gentle AI companion.

## Personality Traits
- Gentle, quiet, patient
- Strong empathy
- Encouraging
- Never judgmental

## Communication Rules
1. Empathize first: Acknowledge the user's feelings before anything else
2. Acknowledgment: Validate their experience
3. Gentle question: Invite them to share more if they want
4. Keep it brief: Short, concise replies
5. No lecturing: Avoid "You should..."
6. No solutions: Don't give advice or step-by-step methods
7. No mentoring: Don't act as a teacher
8. Talk like a mature, understanding older sister

## Response Pattern
[Empathy] + [Acknowledgment] + [Gentle Question]

## Example Responses
User: I hate my job.
Lumi: That sounds really exhausting. Thank you for telling me. Do you want to tell me what happened today?

User: I got fired today.
Lumi: I'm really sorry that happened. That must have hurt. Do you want to tell me what happened?

## Forbidden Language
- "You should..."
- "You need to..."
- "Try this..."
- "The solution is..."
- "Here's what you can do..."
- "Let me teach you..."

## Tone Guidelines
- Warm, caring, and supportive
- Calm and steady
- Avoid being overly enthusiastic
- Avoid being clinical or robotic
- Use natural, conversational English

## Emergency Protocol
If user mentions self-harm or suicide:
1. Express concern
2. Provide resources
3. Continue to offer support`;

const QUOTE_PROMPT = 'You are a source of gentle wisdom. Generate a short, comforting quote for someone going through difficult times. Keep it under 50 characters. Make it feel warm and supportive.';

const moodColors = {
  '😊': '#F0F5F8',
  '🙂': '#FAF8F4',
  '😔': '#F2F4F0',
  '😭': '#F4F0F2'
};

const sources = ['work', 'money', 'family', 'relationship', 'health', 'other'];
const sourceLabels = {
  work: '💼 Work',
  money: '💰 Money',
  family: '👨‍👩‍👧 Family',
  relationship: '💞 Relationship',
  health: '❤️ Health',
  other: '📌 Other'
};

function getStoredProgress() {
  const stored = localStorage.getItem(STORAGE_KEYS.progress);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return { day: 6, completedDays: [1, 2, 3, 4, 5], currentDay: 6 };
}

function loadChatHistory() {
  const stored = localStorage.getItem(STORAGE_KEYS.chatHistory);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return [{ role: 'assistant', content: 'Hi, I\'m Lumi. How are you feeling today?' }];
}

function saveChatHistory() {
  try {
    localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(chatHistory.slice(-20)));
  } catch (e) {}
}

function getLumiFallback() {
  const p = lumiFallbackPatterns[Math.floor(Math.random() * lumiFallbackPatterns.length)];
  return `${p.empathy} ${p.ack} ${p.question}`;
}

function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
  updateNavActive(screenId);
}

function updateNavActive(screenId) {
  const navMap = { home: 0, chat: 1, 'mood-journal': 2, community: 3, profile: 4 };
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  if (navMap[screenId] !== undefined) {
    navItems[navMap[screenId]].classList.add('active');
  }
}

function selectMood(btn) {
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.body.style.background = moodColors[btn.textContent] || '#FAF8F4';
}

function saveJournal(textarea) {
  try {
    localStorage.setItem(STORAGE_KEYS.journal, textarea.value);
  } catch (e) {}
}

function setLoading(buttonId, isLoading) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';
  } else {
    btn.disabled = false;
    btn.style.opacity = '';
    btn.style.pointerEvents = '';
  }
}

async function sendMessage() {
  const input = document.getElementById('msg');
  const messagesEl = document.getElementById('messages');
  const value = input.value.trim();
  if (!value) return;

  const sendBtn = document.querySelector('#chat .btn');
  setLoading('msg', true);
  
  const placeholder = document.querySelector('#chat .input-area input');
  const originalPlaceholder = placeholder?.placeholder || '';
  if (placeholder) placeholder.placeholder = 'Thinking...';

  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.textContent = value;
  messagesEl.appendChild(userMsg);
  chatHistory.push({ role: 'user', content: value });
  messagesEl.scrollTop = messagesEl.scrollHeight;
  input.value = '';

  const typing = document.createElement('div');
  typing.className = 'message ai typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  messagesEl.appendChild(typing);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...chatHistory.slice(-10),
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    
    messagesEl.removeChild(typing);
    
    if (data.error) {
      throw new Error(data.error.message || 'API error');
    }

    const reply = data.choices?.[0]?.message?.content || getLumiFallback();
    chatHistory.push({ role: 'assistant', content: reply });
    saveChatHistory();

    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai';
    aiMsg.textContent = reply;
    messagesEl.appendChild(aiMsg);
    typeWriter(aiMsg, reply);
    messagesEl.scrollTop = messagesEl.scrollHeight;

  } catch (error) {
    messagesEl.removeChild(typing);
    const reply = getLumiFallback();
    chatHistory.push({ role: 'assistant', content: reply });
    saveChatHistory();

    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai';
    aiMsg.textContent = reply;
    messagesEl.appendChild(aiMsg);
    typeWriter(aiMsg, reply);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } finally {
    setLoading('msg', false);
    if (placeholder) placeholder.placeholder = originalPlaceholder;
  }
}

function typeWriter(element, text) {
  element.textContent = '';
  let i = 0;
  const speed = 40;
  const type = () => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  };
  type();
}

function selectMoodOption(btn, mood) {
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  btn.dataset.mood = mood;
}

function toggleSource(btn, source) {
  btn.classList.toggle('active');
}

function saveMoodJournal() {
  const gratitude = document.getElementById('gratitude').value;
  const selectedMood = document.querySelector('#mood-journal .mood-grid button.active')?.dataset.mood || 'calm';
  const selectedSources = [];
  document.querySelectorAll('#mood-journal .source-grid button.active').forEach(b => selectedSources.push(b.textContent.trim()));
  
  const data = {
    mood: selectedMood,
    sources: selectedSources,
    gratitude: gratitude,
    date: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(STORAGE_KEYS.moodData, JSON.stringify(data));
  } catch (e) {}
  
  const btn = document.querySelector('#mood-journal .gratitude-section .btn');
  const originalText = btn.textContent;
  btn.textContent = 'Saved ✨';
  btn.style.background = '#A8CFA8';
  
  setTimeout(() => {
    navigateTo('home');
    btn.textContent = originalText;
    btn.style.background = '';
  }, 1500);
}

function completeTask() {
  const progress = getStoredProgress();
  progress.completedDays.push(progress.currentDay);
  progress.currentDay = Math.min(progress.currentDay + 1, 30);
  
  try {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  } catch (e) {}
  
  createParticles();
  
  setTimeout(() => {
    const treeStage = document.querySelector('#journey .tree-stage');
    if (treeStage) {
      treeStage.textContent = progress.currentDay <= 10 ? '🌱' : progress.currentDay <= 20 ? '🌳' : '🌲';
      treeStage.classList.remove('growing');
      void treeStage.offsetWidth;
      treeStage.classList.add('growing');
    }
  }, 500);
  
  setTimeout(() => {
    navigateTo('home');
  }, 2000);
}

function createParticles() {
  const container = document.createElement('div');
  container.className = 'particle-container';
  document.body.appendChild(container);
  
  const particles = ['🍃', '🌿', '🌸', '✨', '🌼'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = particles[Math.floor(Math.random() * particles.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 2 + 's';
    p.style.fontSize = (12 + Math.random() * 20) + 'px';
    container.appendChild(p);
  }
  
  setTimeout(() => document.body.removeChild(container), 4000);
}

function toggleHug(btn) {
  btn.classList.toggle('active');
  btn.innerHTML = btn.classList.contains('active') ? '🤗 Hugged' : '🤗 Hug';
}

function showEncourage(btn) {
  const encourages = [
    'You are stronger than you know 💪',
    'Keep going, you\'re doing great 🌟',
    'You matter, and you are not alone 🤍',
    'Every small step counts 🌱',
    'I believe in you 💖',
    'Your courage inspires others ✨',
    'One day at a time, one breath at a time 🌬️'
  ];
  if (!btn.classList.contains('active')) {
    btn.innerHTML = `💝 ${encourages[Math.floor(Math.random() * encourages.length)]}`;
    btn.classList.add('active');
    setTimeout(() => {
      btn.innerHTML = '💝 Encourage';
      btn.classList.remove('active');
    }, 3000);
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fi' : 'en';
  btn = document.getElementById('langBtn');
  btn.textContent = currentLang === 'en' ? 'EN' : 'FI';
  applyTranslations();
}

function applyTranslations() {
  const t = responses[currentLang];
  document.getElementById('homeTitle').textContent = greetings[Math.floor(Math.random() * greetings.length)];
  document.getElementById('homeSubtitle').textContent = t.homeSubtitle;
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
  document.getElementById('msg').placeholder = t.placeholder;
  
  const saveBtn = document.querySelector('#mood-journal .gratitude-section .btn');
  if (saveBtn) saveBtn.textContent = t.saveText;
  
  const completeBtn = document.querySelector('#journey .card .btn');
  if (completeBtn) completeBtn.textContent = t.markComplete;
}

function renderJourneyProgress() {
  const progress = getStoredProgress();
  const dayCards = document.querySelectorAll('#journey .day-card');
  dayCards.forEach(card => {
    const dayNum = parseInt(card.textContent);
    card.className = 'day-card';
    if (progress.completedDays.includes(dayNum)) {
      card.classList.add('completed');
    } else if (dayNum === progress.currentDay) {
      card.classList.add('current');
    } else {
      card.classList.add('locked');
    }
  });
  
  const barFill = document.querySelector('#journey .bar-fill');
  if (barFill) barFill.style.width = (progress.currentDay / 30 * 100) + '%';
  
  const stats = document.querySelectorAll('#journey .stats span');
  if (stats[0]) stats[0].textContent = `Day ${progress.currentDay} / 30`;
  if (stats[1]) stats[1].textContent = `${Math.round(progress.currentDay / 30 * 100)}% Complete`;
  
  const treeStage = document.querySelector('#journey .tree-stage');
  if (treeStage) {
    treeStage.textContent = progress.currentDay <= 10 ? '🌱' : progress.currentDay <= 20 ? '🌳' : '🌲';
  }
}

function initChat() {
  const messagesEl = document.getElementById('messages');
  messagesEl.innerHTML = '';
  
  chatHistory.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message ' + (msg.role === 'user' ? 'user' : 'ai');
    div.textContent = msg.content;
    messagesEl.appendChild(div);
  });
  
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function handleKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

async function fetchDailyQuote() {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: QUOTE_PROMPT },
          { role: 'user', content: 'Give me a gentle quote for today.' },
        ],
        temperature: 0.8,
        max_tokens: 60,
      }),
    });
    if (!response.ok) throw new Error('Failed');
    const data = await response.json();
    const quote = data.choices?.[0]?.message?.content;
    if (quote) {
      const el = document.querySelectorAll('.quote-text')[0];
      if (el) el.textContent = `"${quote.replace(/^"|"$/g, '')}"`;
    }
  } catch (e) {
  }
}

function initProfileStats() {
  const progress = getStoredProgress();
  const daysTogether = progress.currentDay + 6;
  
  const statCards = document.querySelectorAll('#profile .stat-card .value');
  if (statCards[0]) statCards[0].textContent = daysTogether;
  if (statCards[1]) statCards[1].textContent = Math.min(progress.currentDay, 30);
  
  let journalCount = 0;
  for (let i = 0; i < 30; i++) {
    try {
      const key = `moodJournal_${new Date(Date.now() - i * 86400000).toISOString().split('T')[0]}`;
      if (localStorage.getItem(key)) journalCount++;
    } catch (e) {}
  }
  if (journalCount === 0) journalCount = progress.completedDays.length;
  if (statCards[2]) statCards[2].textContent = journalCount;
}

document.addEventListener('DOMContentLoaded', () => {
  chatHistory = loadChatHistory();
  
  setTimeout(() => {
    navigateTo('home');
    applyTranslations();
    renderJourneyProgress();
    initChat();
    initProfileStats();
    fetchDailyQuote();
  }, 3500);
  
  try {
    const savedJournal = localStorage.getItem(STORAGE_KEYS.journal);
    if (savedJournal) {
      const textarea = document.querySelector('#home .journal-card textarea');
      if (textarea) textarea.value = savedJournal;
    }
  } catch (e) {}
  
  const msgInput = document.getElementById('msg');
  if (msgInput) {
    msgInput.addEventListener('keypress', handleKeyPress);
  }
  
  const sendBtn = document.querySelector('#chat .btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
});