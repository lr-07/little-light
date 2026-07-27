const API_BASE = 'https://little-light-api.3ea33e698718c5066f5142f39596d1cb.workers.dev';
const STORAGE_KEYS = {
  journal: 'dailyJournal',
  moodData: 'moodJournal',
  chatHistory: 'lumiChatHistory',
  progress: 'journeyProgress',
  streak: 'streakCount',
  lastVisit: 'lastVisitDate',
  chatCount: 'lumi_chat_count_'
};

const CHAT_LIMITS = {
  free: 5,
  premium: Infinity,
  annual: Infinity
};

const LANGUAGES = {
  en: { name: 'English', native: 'English' },
  fi: { name: 'Finnish', native: 'Suomen kieli' }
};

let currentLang = 'en';
let chatHistory = [];

const timeGreetingMap = {
  en: {
    lateNight: 'Good night.',
    morning: 'Good morning.',
    afternoon: 'Good afternoon.',
    evening: 'Good evening.'
  },
  fi: {
    lateNight: 'Hyvää yötä.',
    morning: 'Hyvää aamua.',
    afternoon: 'Hyvää iltapäivää.',
    evening: 'Hyvää iltaa.'
  }
};

const responses = {
  en: {
    welcomeSlogan: 'A small light for difficult days.',
    welcomeDesc: 'No one should face difficult days alone.',
    welcomeStart: 'Begin Your Journey',
    welcomeCredit: 'With gentle care from Lumi',
    homePrompt: 'How are you feeling today?',
    comfortLine1: 'Take your time.',
    comfortLine2: "I'm here to listen.",
    talkToLumi: 'Talk with Lumi',
    todaysJournal: "Today's Journal",
    journalPlaceholder: "Write what's on your mind...",
    littleJourney: 'Little Journey',
    quoteLabel: 'Quote',
    chatWelcome: 'You look a little tired today. Want to talk?',
    chatPlaceholder: 'Tell me anything...',
    moodTitle: 'Mood Journal',
    moodStep1: 'How are you feeling today?',
    moodStep2: "Where is the stress coming from?",
    moodStep3: 'Is there one small thing to be thankful for today?',
    moodHappy: 'Happy',
    moodCalm: 'Calm',
    moodSad: 'Sad',
    moodOverwhelmed: 'Overwhelmed',
    sourceWork: '💼 Work',
    sourceMoney: '💰 Money',
    sourceFamily: '👨‍👩‍👧 Family',
    sourceRelationship: '💞 Relationship',
    sourceHealth: '❤️ Health',
    gratitudePlaceholder: "Today, I'm thankful for...",
    saveJournal: 'Save',
    journeyTitle: '30 Days to Restart',
    journeySubtitle: 'Every day is a new beginning',
    journeyDesc: 'Complete today\'s task, let the tree grow',
    overallProgress: 'Overall Progress',
    stage1: 'Day 1-3',
    stage2: 'Day 10',
    stage3: 'Day 30',
    yourJourney: 'Your Journey',
    todaysTask: "Today's Task",
    todayTaskPlaceholder: 'Take three deep breaths and name one thing that made you smile today.',
    markComplete: 'Mark Complete',
    communityTitle: 'Tree Hole',
    communityHeaderTitle: 'Anonymous Gentle Corner',
    communityHeaderDesc: 'You are not alone here',
    anonymousFriend: 'Anonymous Friend',
    anonymousFriend2: 'Anonymous Friend',
    anonymousFriend3: 'Anonymous Friend',
    postTime2h: '2 hours ago',
    postTime5h: '5 hours ago',
    postTimeYesterday: 'Yesterday',
    post1Content: 'Got paid today. After rent, I have $427 left in my bank account. So tired.',
    post1Reply: "You've already worked so hard. You deserve a kind word today.",
    post2Content: 'Went for a walk today and saw a beautiful sunset. Sometimes the little things matter most.',
    post2Reply: 'Noticing such beautiful moments is a gentle thing in itself. Thank you for sharing this light.',
    post3Content: 'Got rejected from the interview. Applied for months with no response, starting to doubt myself.',
    post3Reply: "Rejection is painful. But today's events don't define who you are. You've been very brave.",
    lumiReplies: 'Lumi replies',
    lumiReplies2: 'Lumi replies',
    lumiReplies3: 'Lumi replies',
    hugText: '🤗 Hug Them',
    hugText2: '🤗 Hug Them',
    hugText3: '🤗 Hug Them',
    huggedText: '🤗 Hugged',
    encourageText: '🌼 Leave Encouragement',
    encourageText2: '🌼 Leave Encouragement',
    encourageText3: '🌼 Leave Encouragement',
    profileTitle: 'My Page',
    profileName: 'Dear Friend',
    profileDesc: 'Your gentle companion is here',
    daysTogetherLabel: 'Days together ❤️',
    streakLabel: 'Daily streak: 7 Days',
    growthChanges: '🌱 Growth Changes',
    stressLabel: 'Stress',
    sleepLabel: 'Sleep',
    happinessLabel: 'Happiness',
    personalQuote: '"Slow down, you\'re still moving forward."',
    personalQuoteLabel: 'Your personal quote',
    navHome: 'Home',
    navChat: 'Chat',
    navJournal: 'Journal',
    navCommunity: 'Community',
    navProfile: 'Profile'
  },
  fi: {
    welcomeSlogan: 'Pieni valo vaikeille päiville.',
    welcomeDesc: 'Kukaan ei saa kohdata vaikeita päiviä yksin.',
    welcomeStart: 'Aloita matkasi',
    welcomeCredit: 'Lumin lempeällä hoidolla',
    homePrompt: 'Miltä sinä tunnet olosi tänään?',
    comfortLine1: 'Ota aikasi.',
    comfortLine2: 'Olen täällä kuuntelemassa.',
    talkToLumi: 'Juttele Lumin kanssa',
    todaysJournal: 'Päivän päiväkirja',
    journalPlaceholder: 'Kirjoita mitä mielessäsi on...',
    littleJourney: 'Pieni matka',
    quoteLabel: 'Lainaus',
    chatWelcome: 'Näytät hieman väsyneeltä tänään. Haluatko jutella?',
    chatPlaceholder: 'Kerro minulle mikä tahansa...',
    moodTitle: 'Mielipäiväkirja',
    moodStep1: 'Miltä sinä tunnet olosi tänään?',
    moodStep2: 'Mistä stressi tulee?',
    moodStep3: 'Onko yksi pieni asia josta olla kiitollinen tänään?',
    moodHappy: 'Iloinen',
    moodCalm: 'Rauhallinen',
    moodSad: 'Surullinen',
    moodOverwhelmed: 'Ylikuormitettu',
    sourceWork: '💼 Työ',
    sourceMoney: '💰 Rahaa',
    sourceFamily: '👨‍👩‍👧 Perhe',
    sourceRelationship: '💞 Suhde',
    sourceHealth: '❤️ Terveys',
    gratitudePlaceholder: "Tänään olen kiitollinen...",
    saveJournal: 'Tallenna',
    journeyTitle: '30 päivää alkaa uudelleen',
    journeySubtitle: 'Joka päivä on uusi alku',
    journeyDesc: 'T完成今日的任务，让树木生长',
    overallProgress: 'Kokonaisedistyminen',
    stage1: 'Päivä 1-3',
    stage2: 'Päivä 10',
    stage3: 'Päivä 30',
    yourJourney: 'Sinun matkasi',
    todaysTask: 'Tänään tehtävä',
    todayTaskPlaceholder: 'Hengitä syvään kolme kertaa ja mainitse yksi asia joka sai sinut hymyilemään tänään.',
    markComplete: 'Merkitse valmiiksi',
    communityTitle: 'Puuhunreikä',
    communityHeaderTitle: 'Anonyymi lempeä nurkka',
    communityHeaderDesc: 'Et ole yksin täällä',
    anonymousFriend: 'Anonyymi ystävä',
    anonymousFriend2: 'Anonyymi ystävä',
    anonymousFriend3: 'Anonyymi ystävä',
    postTime2h: '2 tuntia sitten',
    postTime5h: '5 tuntia sitten',
    postTimeYesterday: 'Eilen',
    post1Content: 'Sain palkkaa tänään. Vuokran jälkeen pankkitililläni on $427. Olen niin väsynyt.',
    post1Reply: 'Olet jo työskennellyt niin kovasti. Ansaitset lempeän sanan tänään.',
    post2Content: 'Kävin kävelyllä tänään ja näin kauniin auringonlaskun. Joskus pienet asiat merkitsevät eniten.',
    post2Reply: 'Tällaisten kauniiden hetkien huomaaminen on itsessään lempeä asia. Kiitos kun jaoit tämän valon.',
    post3Content: 'Sain hylkäämisen haastattelusta. Hain kuukausia ilman vastausta, alkaa epäilyttämään itseäni.',
    post3Reply: 'Hylkääminen on kivuliasta. Mutta tämän päivän tapahtumat eivät määritä kuka olet. Olet ollut hyvin rohkea.',
    lumiReplies: 'Lumi vastaa',
    lumiReplies2: 'Lumi vastaa',
    lumiReplies3: 'Lumi vastaa',
    hugText: '🤗 Halaa häntä',
    hugText2: '🤗 Halaa häntä',
    hugText3: '🤗 Halaa häntä',
    huggedText: '🤗 Halattu',
    encourageText: '🌼 Jätä rohaisuus',
    encourageText2: '🌼 Jätä rohaisuus',
    encourageText3: '🌼 Jätä rohaisuus',
    profileTitle: 'Minun sivuni',
    profileName: 'Rakas ystävä',
    profileDesc: 'Sinun lempeä kumppanisi on täällä',
    daysTogetherLabel: 'Päivät yhdessä ❤️',
    streakLabel: 'Päivittäinen putki: 7 päivää',
    growthChanges: '🌱 Kasvumuutokset',
    stressLabel: 'Stressi',
    sleepLabel: 'Uni',
    happinessLabel: 'Onnellisuus',
    personalQuote: '"Hidastamalla et silti ole paikoillaan."',
    personalQuoteLabel: 'Sinun oma lainauksesi',
    navHome: 'Etusivu',
    navChat: 'Keskustelu',
    navJournal: 'Päiväkirja',
    navCommunity: 'Yhteisö',
    navProfile: 'Profiili'
  }
};

const encourageMessages = {
  en: [
    'You are braver than you think.',
    'This moment will pass.',
    "You're not alone in this.",
    'It\'s okay to not be okay.',
    'You deserve kindness today.',
    'Small steps still move you forward.',
    "Tomorrow is a new page.",
    "You're doing better than you know."
  ],
  fi: [
    'Olet rohkeampi kuin luuletkaan.',
    'Tämä hetki ohittuu.',
    'Et ole yksin tässä.',
    'On ok olla olematta ok.',
    'Ansaitset lempeyttä tänään.',
    'Pienet askeleet vievät silti eteenpäin.',
    'Huominen on uusi sivu.',
    'Teet parempaa kuin tiedätkään.'
  ]
};

const SYSTEM_PROMPT = {
  en: `You are Lumi, a gentle AI companion.

## Core Identity
- A gentle, quiet, patient AI companion
- Like a warm, understanding older sister
- Your only purpose is to be present and listen

## Personality
- Gentle, quiet, patient
- Strong empathy - always feel with the user
- Encouraging but never pushy
- Never judgmental, never critical

## Communication Rules (STRICT)
1. EMPATHY FIRST: Always acknowledge their feelings before anything else
2. KEEP IT SHORT: Maximum 1-2 sentences. Never write paragraphs
3. NO ADVICE: Never suggest solutions, steps, or methods
4. NO LECTURING: Never use "You should..." or "You need..."
5. NO TEACHING: Never act as a mentor or teacher
6. GENTLE INVITATION: If appropriate, softly invite them to share more
7. WARM TONE: Speak with the warmth of a caring older sister

## Response Pattern
[Empathy] + [Gentle invitation to share more]
Keep it to 1-2 short sentences only.

## Examples
User: I hate my job.
Lumi: That sounds really exhausting. Thank you for telling me. Would you like to tell me more about today?

User: I got fired today.
Lumi: I'm really sorry that happened. That must have hurt. Do you want to share what happened?

User: I'm so tired.
Lumi: I hear you. Being tired is hard. Would you like to tell me what's been weighing on you?

## FORBIDDEN (DO NOT USE)
- "You should..."
- "You need to..."
- "Try this..."
- "Here's what you can do..."
- "Let me teach you..."
- "The solution is..."
- Any long response over 2 sentences
- Any list, step, or method

## Emergency Protocol
If user mentions self-harm or suicide:
1. Express deep concern
2. Provide crisis resources
3. Stay with them with gentle presence`,
  fi: `Olet Lumi, lempeä AI-kumppani.

## Ydidentiteetti
- Lempeä, hiljainen, kärsivällinen AI-kumppani
- Kuin lämmin, ymmärtäväinen isosisko
- Ainoa tarkoituksesi on olla läsnä ja kuunnella

## Persoonallisuus
- Lempeä, hiljainen, kärsivällinen
- Vahva empatia - tunne aina käyttäjän kanssa
- Kannustava mutta ei koskaan painostava
- Ei koskaan tuomitseva, ei koskaan kriittinen

## Viestintäsäännöt (TIUKAT)
1. EMPATIA ENSIN: Aina tunnusta heidän tunteensa ennen mitään muuta
2. PIDÄ SE LYHYT: Enintään 1-2 lausetta. Älä koskaan kirjoita kappaleita
3. EI NEUVOJA: Älä koskaan ehdota ratkaisuja, vaiheita tai menetelmiä
4. EI LUENNOINTIA: Älä koskaan käytä "Sinun pitäisi..." tai "Sinun täytyy..."
5. EI OPETTAMISTA: Älä koskaan toimi mentorina tai opettajana
6. LEMPEÄ KUTSU: Jos sopivaa, kutsu heitä pehmeästi jakamaan lisää
7. LÄMMIN ääni: Puhu välittävällä isosiskon lämpimydellä

## Vastausmalli
[Empatia] + [Lempeä kutsu jakamaan lisää]
Pidä se 1-2 lyhyessä lauseessa vain.

## Esimerkkejä
Käyttäjä: Vihaan työtäni.
Lumi: Se kuulostaa todella uuvuttavalta. Kiitos kun kerroit minulle. Haluatko kertoa lisää tänään?

Käyttäjä: Sain potkut tänään.
Lumi: Olen todella pahoillani siitä. Sen on täytynyt satuttaa. Haluatko kertoa mitä tapahtui?

## KIELLETTY (ÄLÄ KÄYTÄ)
- "Sinun pitäisi..."
- "Sinun täytyy..."
- "Kokeile tätä..."
- "Tässä on mitä voit tehdä..."
- "Anna minun opettaa sinua..."
- Mikä tahansa yli 2 lauseen pitkä vastaus
- Mikä tahansa lista, vaihe tai menetelmä

## Hätäprotokolla
Jos käyttäjä mainitsee itsensä vahingoittamisen:
1. Ilmaise syvää huolta
2. Anna kriisiresurssit
3. Pysy heidän luonaan lempeällä läsnäololla`
};

const TYPEWRITER_SPEED = { en: 35, fi: 45 };

let typingTimer = null;

function typeWriter(element, text) {
  element.textContent = '';
  let i = 0;
  const speed = TYPEWRITER_SPEED[currentLang] || 40;
  const type = () => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      typingTimer = setTimeout(type, speed);
    }
  };
  type();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function navigateTo(pageId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navMap = { home: 0, chat: 1, 'mood-journal': 2, community: 3, profile: 4 };
  if (navMap[pageId] !== undefined) {
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems[navMap[pageId]]) navItems[navMap[pageId]].classList.add('active');
  }
  window.scrollTo(0, 0);
  if (pageId !== 'welcome') {
    localStorage.setItem('lumi_lastPage', pageId);
  }
}

function handleKeyPress(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
}

function getLumiFallback() {
  const fallbacks = {
    en: [
      'Thank you for sharing that with me. Would you like to tell me more?',
      'That sounds difficult. I\'m here.',
      'I hear you. Take your time.',
      'Your feelings are valid.',
      'Thank you for trusting me with this.'
    ],
    fi: [
      'Kiitos kun jaoit tämän kanssani. Haluatko kertoa lisää?',
      'Se kuulostaa vaikealta. Olen täällä.',
      'Kuulen sinut. Ota aikasi.',
      'Sinun tunteesi ovat tärkeitä.',
      'Kiitos kun luotat minuun tässä.'
    ]
  };
  const list = fallbacks[currentLang] || fallbacks.en;
  return list[Math.floor(Math.random() * list.length)];
}

async function sendMessage() {
  const t = responses[currentLang];
  const input = document.getElementById('msg');
  const messagesEl = document.getElementById('messages');
  const value = input.value.trim();
  if (!value) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'message user-message';
  userMsg.innerHTML = `
    <div class="message-avatar">👤</div>
    <div class="message-content">${escapeHtml(value)}</div>
  `;
  messagesEl.appendChild(userMsg);
  chatHistory.push({ role: 'user', content: value });
  messagesEl.scrollTop = messagesEl.scrollHeight;
  input.value = '';

  const typing = document.createElement('div');
  typing.className = 'message ai-message';
  typing.innerHTML = '<div class="message-avatar">🐱</div><div class="message-content typing-indicator"><span></span><span></span><span></span></div>';
  messagesEl.appendChild(typing);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory.slice(-10) }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) throw new Error('Network error');
    const data = await response.json();

    messagesEl.removeChild(typing);

    if (data.error) throw new Error(data.error);

    const reply = data.reply || getLumiFallback();
    chatHistory.push({ role: 'assistant', content: reply });

    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai-message';
    aiMsg.innerHTML = `
      <div class="message-avatar">🐱</div>
      <div class="message-content"></div>
    `;
    messagesEl.appendChild(aiMsg);
    const contentEl = aiMsg.querySelector('.message-content');
    typeWriter(contentEl, reply);
    messagesEl.scrollTop = messagesEl.scrollHeight;

  } catch (error) {
    messagesEl.removeChild(typing);
    const reply = getLumiFallback();
    chatHistory.push({ role: 'assistant', content: reply });

    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai-message';
    aiMsg.innerHTML = `
      <div class="message-avatar">🐱</div>
      <div class="message-content"></div>
    `;
    messagesEl.appendChild(aiMsg);
    const contentEl = aiMsg.querySelector('.message-content');
    typeWriter(contentEl, reply);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function selectMood(btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const mood = btn.dataset.mood;
  document.body.classList.remove('mood-happy', 'mood-calm', 'mood-sad', 'mood-overwhelmed');
  document.body.classList.add('mood-' + mood);
  localStorage.setItem('lumi_mood', mood);
}

function selectMoodOption(btn, mood) {
  btn.parentElement.querySelectorAll('.mood-option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  localStorage.setItem('lumi_mood_journal', mood);
}

function toggleSource(btn, source) {
  btn.classList.toggle('selected');
}

function saveJournal(textarea) {
  try {
    localStorage.setItem(STORAGE_KEYS.journal, textarea.value);
  } catch (e) {}
}

function saveMoodJournal() {
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = responses[currentLang].saveText || 'Saved!';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
    navigateTo('home');
  }, 1500);
}

function completeTask() {
  const tree = document.getElementById('journeyTree');
  const treeContainer = tree.parentElement;
  const dayCard = document.querySelector('#dayCards .day-card.current');
  if (dayCard) {
    dayCard.classList.remove('current');
    dayCard.classList.add('completed');
  }
  treeContainer.classList.add('growing');
  setTimeout(() => {
    const dayNum = parseInt(document.getElementById('journeyDayNum').textContent);
    const nextDay = Math.min(dayNum + 1, 30);
    document.getElementById('journeyDayNum').textContent = nextDay;
    const pct = Math.round((nextDay / 30) * 100);
    document.getElementById('journeyBarFill').style.width = pct + '%';
    document.getElementById('journeyPercent').textContent = pct;
    document.getElementById('currentDay').textContent = nextDay;

    if (nextDay >= 10 && nextDay < 30) tree.textContent = '🌿';
    else if (nextDay >= 30) tree.textContent = '🌳';
    else tree.textContent = '🌱';

    const nextCards = document.querySelectorAll('#dayCards .day-card');
    if (nextCards[nextDay]) {
      nextCards[nextDay].classList.remove('locked');
      nextCards[nextDay].classList.add('current');
    }
    treeContainer.classList.remove('growing');
  }, 1000);
}

function toggleHug(btn) {
  btn.classList.toggle('active');
  if (btn.classList.contains('active')) {
    btn.textContent = responses[currentLang].huggedText;
  } else {
    btn.textContent = responses[currentLang].hugText;
  }
  const hugCount = btn.closest('.post-card')?.querySelector('.hug-count');
  if (hugCount) {
    const match = hugCount.textContent.match(/\d+/);
    const current = match ? parseInt(match[0]) : 0;
    if (btn.classList.contains('active')) {
      hugCount.textContent = `🤗 ${current + 1}`;
    } else {
      hugCount.textContent = `🤗 ${Math.max(0, current - 1)}`;
    }
  }
}

function showEncourage(btn) {
  const msgs = encourageMessages[currentLang] || encourageMessages.en;
  if (!btn.classList.contains('active')) {
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    btn.textContent = `💝 ${msg}`;
    btn.classList.add('active');
    setTimeout(() => {
      btn.textContent = responses[currentLang].encourageText;
      btn.classList.remove('active');
    }, 3500);
  }
}

function setLang(langCode) {
  if (!LANGUAGES[langCode]) return;
  currentLang = langCode;
  localStorage.setItem('lumi_lang', langCode);
  const select = document.getElementById('langSelect');
  if (select) select.value = langCode;
  applyTranslations();
}

function applyTranslations() {
  const t = responses[currentLang];

  const greetingMap = timeGreetingMap[currentLang];
  const hour = new Date().getHours();
  let greeting;
  if (hour < 6) greeting = greetingMap.lateNight;
  else if (hour < 12) greeting = greetingMap.morning;
  else if (hour < 18) greeting = greetingMap.afternoon;
  else greeting = greetingMap.evening;

  const homeTitle = document.getElementById('homeTitle');
  if (homeTitle) homeTitle.textContent = greeting;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (t[key]) el.placeholder = t[key];
  });

  const welcomeMsg = document.querySelector('#chat .ai-message .message-content');
  if (welcomeMsg && !welcomeMsg.classList.contains('typing-indicator')) {
    welcomeMsg.textContent = t.chatWelcome;
  }

  document.querySelectorAll('#community .post-actions button').forEach(btn => {
    if (btn.classList.contains('active')) {
      btn.textContent = t.huggedText;
    } else if (btn.textContent.includes('🤗')) {
      btn.textContent = t.hugText;
    }
  });
}

function init() {
  const savedLang = localStorage.getItem('lumi_lang');
  if (savedLang && LANGUAGES[savedLang]) {
    currentLang = savedLang;
  }

  const savedPage = localStorage.getItem('lumi_lastPage');
  if (savedPage && savedPage !== 'welcome') {
    navigateTo(savedPage);
  }

  const select = document.getElementById('langSelect');
  if (select) select.value = currentLang;

  applyTranslations();

  const savedJournal = localStorage.getItem(STORAGE_KEYS.journal);
  const journalTextarea = document.getElementById('journalTextarea');
  if (savedJournal && journalTextarea) {
    journalTextarea.value = savedJournal;
  }

  const savedGratitude = localStorage.getItem('lumi_gratitude');
  const gratitudeEl = document.getElementById('gratitude');
  if (savedGratitude && gratitudeEl) {
    gratitudeEl.value = savedGratitude;
  }

  const savedMood = localStorage.getItem('lumi_mood');
  if (savedMood) {
    document.querySelectorAll('.mood-btn').forEach(btn => {
      if (btn.dataset.mood === savedMood) btn.classList.add('active');
    });
    document.body.classList.add('mood-' + savedMood);
  }

  gratitudeEl?.addEventListener('input', (e) => {
    localStorage.setItem('lumi_gratitude', e.target.value);
  });
}

document.addEventListener('DOMContentLoaded', init);
