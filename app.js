const screens = ['splash', 'home', 'chat', 'mood-journal', 'journey', 'community', 'profile'];
let currentLang = 'en';

const translations = {
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
    profileTitle: 'Profiilini'
  }
};

const lumiResponsePatterns = [
  { empathy: 'That sounds really hard.', ack: 'Thank you for telling me.', question: 'Do you want to share more?' },
  { empathy: 'I can hear how much this weighs on you.', ack: 'It takes courage to talk about this.', question: 'How long have you been feeling this way?' },
  { empathy: 'I\'m so sorry you\'re going through this.', ack: 'Whatever you\'re feeling is valid.', question: 'Is there anything I can do to help?' },
  { empathy: 'That must have hurt.', ack: 'You\'re not alone in this.', question: 'What was the hardest part for you?' },
  { empathy: 'It sounds like you\'ve been carrying a lot.', ack: 'I admire your strength for keeping going.', question: 'Would you like to talk about it more?' },
  { empathy: 'I can imagine how exhausting that is.', ack: 'Thank you for trusting me with this.', question: 'What do you need right now?' },
  { empathy: 'That doesn\'t sound fair.', ack: 'Your feelings matter.', question: 'How have you been coping?' },
  { empathy: 'I\'m here with you in this.', ack: 'You don\'t have to carry this alone.', question: 'What would help you feel better today?' }
];

function getLumiResponse() {
  const pattern = lumiResponsePatterns[Math.floor(Math.random() * lumiResponsePatterns.length)];
  return `${pattern.empathy} ${pattern.ack} ${pattern.question}`;
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
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));
  const navMap = {
    'home': 0,
    'chat': 1,
    'mood-journal': 2,
    'community': 3,
    'profile': 4
  };
  if (navMap[screenId] !== undefined) {
    navItems[navMap[screenId]].classList.add('active');
  }
}

function selectMood(btn) {
  const moodBtns = btn.parentElement.querySelectorAll('button');
  moodBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  const moodColors = {
    '😊': '#F0F5F8',
    '🙂': '#FAF8F4',
    '😔': '#F2F4F0',
    '😭': '#F4F0F2'
  };
  const emoji = btn.textContent;
  document.body.style.background = moodColors[emoji] || '#FAF8F4';
}

function saveJournal(textarea) {
  localStorage.setItem('dailyJournal', textarea.value);
}

function handleKeyPress(e) {
  if (e.key === 'Enter') sendMessage();
}

function sendMessage() {
  const input = document.getElementById('msg');
  const messages = document.getElementById('messages');
  const value = input.value.trim();
  if (!value) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.textContent = value;
  messages.appendChild(userMsg);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  const typing = document.createElement('div');
  typing.className = 'message ai typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  fetch('https://little-light-api.3ea33e698718c5066f5142f39596d1cb.workers.dev/api/chat', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-API-Key': 'sk-2a0246f90ee2465a84b2954897915b89',
    },
    body: JSON.stringify({ messages: [{ role: 'user', content: value }] }),
  })
  .then(res => res.json())
  .then(data => {
    messages.removeChild(typing);
    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai';
    const response = data.reply || getLumiResponse();
    aiMsg.textContent = response;
    messages.appendChild(aiMsg);
    typeWriter(aiMsg, response);
    messages.scrollTop = messages.scrollHeight;
  })
  .catch(() => {
    messages.removeChild(typing);
    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai';
    const response = getLumiResponse();
    aiMsg.textContent = response;
    messages.appendChild(aiMsg);
    typeWriter(aiMsg, response);
    messages.scrollTop = messages.scrollHeight;
  });
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

let selectedMood = null;
const selectedSources = new Set();

function selectMoodOption(btn, mood) {
  const moodBtns = btn.parentElement.querySelectorAll('button');
  moodBtns.forEach(b => b.classList.remove('active'));
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
  localStorage.setItem('moodJournal', JSON.stringify(data));
  
  const btn = document.querySelector('#mood-journal .btn');
  btn.textContent = 'Saved ✨';
  btn.style.background = '#A8CFA8';
  
  setTimeout(() => {
    navigateTo('home');
    btn.textContent = currentLang === 'en' ? 'Save Journal' : 'Tallenna päiväkirja';
    btn.style.background = '';
  }, 1000);
}

function completeTask() {
  const btn = document.querySelector('#journey .btn');
  btn.textContent = 'Completed 🌿';
  btn.style.background = '#A8CFA8';
  
  createParticles();
  
  setTimeout(() => {
    const treeStage = document.querySelector('#journey .tree-stage');
    if (treeStage) {
      treeStage.classList.remove('growing');
      void treeStage.offsetWidth;
      treeStage.classList.add('growing');
    }
  }, 500);
  
  setTimeout(() => {
    navigateTo('home');
    btn.textContent = 'Mark Complete';
    btn.style.background = '';
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
    document.body.removeChild(container);
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
    'Keep going, you\'re doing great 🌟',
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
  btn.textContent = currentLang === 'en' ? 'EN' : 'FI';
  
  if (currentLang === 'fi') {
    document.getElementById('homeTitle').textContent = translations.fi.homeTitle;
    document.getElementById('homeSubtitle').textContent = translations.fi.homeSubtitle;
    document.getElementById('chatSubtitle').innerHTML = translations.fi.chatSubtitle;
    document.getElementById('journalTitle').textContent = translations.fi.journalTitle;
    document.getElementById('journalDesc').textContent = translations.fi.journalDesc;
    document.getElementById('journeyLabel').textContent = translations.fi.journeyLabel;
    document.getElementById('moodTitle').textContent = translations.fi.moodTitle;
    document.getElementById('moodStep1').textContent = translations.fi.moodStep1;
    document.getElementById('moodStep2').textContent = translations.fi.moodStep2;
    document.getElementById('moodStep3').textContent = translations.fi.moodStep3;
    document.getElementById('journeyTitle').textContent = translations.fi.journeyTitle;
    document.getElementById('journeySubtitle').textContent = translations.fi.journeySubtitle;
    document.getElementById('communityTitle').textContent = translations.fi.communityTitle;
    document.getElementById('profileTitle').textContent = translations.fi.profileTitle;
  } else {
    document.getElementById('homeTitle').textContent = 'Good Evening.';
    document.getElementById('homeSubtitle').textContent = 'How are you feeling today?';
    document.getElementById('chatSubtitle').innerHTML = 'Take your time.<br>I\'m here to listen.';
    document.getElementById('journalTitle').textContent = 'Today\'s Journal';
    document.getElementById('journalDesc').textContent = 'What happened today?';
    document.getElementById('journeyLabel').textContent = 'Little Journey';
    document.getElementById('moodTitle').textContent = 'Mood Journal';
    document.getElementById('moodStep1').textContent = 'How are you feeling?';
    document.getElementById('moodStep2').textContent = 'What\'s weighing on you?';
    document.getElementById('moodStep3').textContent = 'A little gratitude';
    document.getElementById('journeyTitle').textContent = 'Little Journey';
    document.getElementById('journeySubtitle').textContent = '30 Days of Restart';
    document.getElementById('communityTitle').textContent = 'Tree Hole';
    document.getElementById('profileTitle').textContent = 'My Profile';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    navigateTo('home');
  }, 3500);

  const savedJournal = localStorage.getItem('dailyJournal');
  if (savedJournal) {
    const textarea = document.querySelector('#home .journal-card textarea');
    if (textarea) textarea.value = savedJournal;
  }
});