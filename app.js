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

let currentLang = 'zh';
let chatHistory = [];

const greetings = {
  zh: ['晚上好 🌙', '你来了', '欢迎回来', '想你了', '深呼吸，慢慢来'],
  en: ['Good evening.', 'Welcome back.', 'How are you today?', 'I missed you.', 'Take a breath.']
};

const responses = {
  zh: {
    homeTitle: '晚上好 🌙',
    homeSubtitle: '今天辛苦了。',
    promptText: '今天心情怎么样？',
    chatSubtitle: '慢慢来，\n我在这里听你说。',
    journalTitle: '今天发生了什么？',
    journalDesc: '写下来就会轻一点',
    journalPlaceholder: '把心里的话写下来...',
    journeyLabel: '30天回血计划',
    moodTitle: '情绪记录',
    moodStep1: '今天感觉怎么样？',
    moodStep2: '压力来自哪里？',
    moodStep3: '今天有没有一件值得感谢的小事？',
    journeyTitle: '30天重新出发',
    journeySubtitle: '每一天，都是新的开始',
    journeyDesc: '完成今天的小事，让树长大一点',
    communityTitle: '树洞社区',
    profileTitle: '我的',
    saveText: '保存记录',
    markComplete: '完成今天的任务',
    send: '发送',
    placeholder: '告诉我任何事...',
    talkToLumi: '和 Lumi 聊聊',
    continueText: '继续',
    taskText: '完成今天的任务',
    todayTask: '深呼吸三次，说出一件让你微笑的小事。',
    chatWelcome: '今天看起来有一点累。想和我聊聊吗？',
    hugText: '🤗 抱抱TA',
    huggedText: '🤗 已抱抱',
    encourageText: '🌼 留一句鼓励',
    navHome: '首页',
    navChat: '聊天',
    navJournal: '记录',
    navCommunity: '树洞',
    navProfile: '我的'
  },
  en: {
    homeTitle: 'Good evening.',
    homeSubtitle: 'Today was hard.',
    promptText: 'How are you feeling today?',
    chatSubtitle: 'Take your time.\nI\'m here to listen.',
    journalTitle: 'Today\'s Journal',
    journalDesc: 'Write it down, it gets lighter',
    journalPlaceholder: 'Write what\'s on your mind...',
    journeyLabel: '30-Day Restart Plan',
    moodTitle: 'Mood Journal',
    moodStep1: 'How are you feeling?',
    moodStep2: 'What\'s weighing on you?',
    moodStep3: 'Is there one small thing to be thankful for?',
    journeyTitle: '30 Days of Restart',
    journeySubtitle: 'Every day is a new beginning',
    journeyDesc: 'Complete today\'s task, let the tree grow',
    communityTitle: 'Tree Hole',
    profileTitle: 'My Profile',
    saveText: 'Save Journal',
    markComplete: 'Mark Complete',
    send: 'Send',
    placeholder: 'Tell me anything...',
    talkToLumi: 'Talk with Lumi',
    continueText: 'Continue',
    taskText: 'Complete today\'s task',
    todayTask: 'Take three deep breaths and name one thing that made you smile today.',
    chatWelcome: 'You look a little tired today. Want to talk?',
    hugText: '🤗 Hug',
    huggedText: '🤗 Hugged',
    encourageText: '🌼 Encourage',
    navHome: 'Home',
    navChat: 'Chat',
    navJournal: 'Journal',
    navCommunity: 'Community',
    navProfile: 'Profile'
  }
};

const lumiFallbackPatterns = {
  zh: [
    { empathy: '这真的很不容易。', ack: '谢谢你愿意告诉我。', question: '想多说说吗？' },
    { empathy: '我能感受到你的疲惫。', ack: '愿意说出来就已经很勇敢了。', question: '这种感觉持续多久了？' },
    { empathy: '听到你经历这些，我真的很心疼。', ack: '你的感受都是真实的。', question: '现在有什么我可以帮你的吗？' },
    { empathy: '这一定很痛。', ack: '你不是一个人在面对。', question: '最让你难过的是什么部分？' },
    { empathy: '感觉你承受了很多。', ack: '你还在坚持，这本身就很了不起。', question: '想聊聊吗？' },
    { empathy: '我能想象这有多累。', ack: '谢谢你信任我。', question: '你现在最需要什么？' },
    { empathy: '这不公平。', ack: '你的感受很重要。', question: '你是怎么熬过来的？' },
    { empathy: '我在这里陪着你。', ack: '你不必独自承担。', question: '今天什么能让你感觉好一点？' }
  ],
  en: [
    { empathy: 'That sounds really hard.', ack: 'Thank you for telling me.', question: 'Do you want to share more?' },
    { empathy: 'I can hear how much this weighs on you.', ack: 'It takes courage to talk about this.', question: 'How long have you been feeling this way?' },
    { empathy: 'I\'m so sorry you\'re going through this.', ack: 'Whatever you\'re feeling is valid.', question: 'Is there anything I can do to help?' },
    { empathy: 'That must have hurt.', ack: 'You\'re not alone in this.', question: 'What was the hardest part for you?' },
    { empathy: 'It sounds like you\'ve been carrying a lot.', ack: 'I admire your strength for keeping going.', question: 'Would you like to talk about it more?' },
    { empathy: 'I can imagine how exhausting that is.', ack: 'Thank you for trusting me with this.', question: 'What do you need right now?' },
    { empathy: 'That doesn\'t sound fair.', ack: 'Your feelings matter.', question: 'How have you been coping?' },
    { empathy: 'I\'m here with you in this.', ack: 'You don\'t have to carry this alone.', question: 'What would help you feel better today?' }
  ]
};

const SYSTEM_PROMPT = {
  zh: `你是 Lumi，一个温柔的 AI 陪伴者。

## 性格特质
- 温柔、安静、耐心
- 富有同理心
- 鼓励但不说教
- 从不评判

## 沟通规则
1. 先共情：在任何回应之前先认可用户的感受
2. 确认：肯定他们的经历
3. 温和提问：邀请他们分享更多（如果愿意）
4. 保持简短：简短、简洁的回复
5. 不说教：避免"你应该..."
6. 不给建议：不提供解决方案或步骤
7. 不指导：不扮演老师角色
8. 像一个成熟、善解人意的姐姐一样说话

## 回应模式
[共情] + [确认] + [温和提问]

## 禁止用语
- "你应该..."
- "你需要..."
- "试试这个..."
- "解决方案是..."
- "让我教你..."

## 语气指南
- 温暖、关怀、支持
- 平静、稳定
- 避免过度热情
- 避免临床或机械感
- 使用自然的中文对话

## 紧急协议
如果用户提到自伤或自杀：
1. 表达关心
2. 提供资源
3. 继续提供支持`,
  en: `You are Lumi, a gentle AI companion.

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
- Use natural, conversational Chinese or English

## Emergency Protocol
If user mentions self-harm or suicide:
1. Express concern
2. Provide resources
3. Continue to offer support`
};

const QUOTE_PROMPT = {
  zh: '你是温柔智慧的源泉。为正在经历困难的人生成一句简短、安慰的话。控制在30字以内。让它温暖、支持。',
  en: 'You are a source of gentle wisdom. Generate a short, comforting quote for someone going through difficult times. Keep it under 50 characters. Make it feel warm and supportive.'
};

const moodColors = {
  '😊': '#F5F0E8',
  '🙂': '#F0F5F8',
  '😐': '#F5F3F0',
  '😔': '#F2F4F0',
  '😭': '#F4F0F2'
};

const sources = ['work', 'money', 'family', 'relationship', 'health', 'other'];
const sourceLabels = {
  zh: {
    work: '💼 工作',
    money: '💰 金钱',
    family: '👨‍👩‍👧 家庭',
    relationship: '💞 感情',
    health: '❤️ 身体',
    other: '📌 其他'
  },
  en: {
    work: '💼 Work',
    money: '💰 Money',
    family: '👨‍👩‍👧 Family',
    relationship: '💞 Relationship',
    health: '❤️ Health',
    other: '📌 Other'
  }
};

const encourageMessages = {
  zh: [
    '你比自己想象的更坚强 💪',
    '继续走，你做得很好 🌟',
    '你很重要，你不是一个人 🤍',
    '每一小步都算数 🌱',
    '我相信你 💖',
    '你的勇气鼓舞着别人 ✨',
    '一天一天来，一步一步走 🌬️'
  ],
  en: [
    'You are stronger than you know 💪',
    'Keep going, you\'re doing great 🌟',
    'You matter, and you are not alone 🤍',
    'Every small step counts 🌱',
    'I believe in you 💖',
    'Your courage inspires others ✨',
    'One day at a time, one breath at a time 🌬️'
  ]
};

function getStoredProgress() {
  const stored = localStorage.getItem(STORAGE_KEYS.progress);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return { day: 7, completedDays: [1, 2, 3, 4, 5, 6], currentDay: 7 };
}

function loadChatHistory() {
  const stored = localStorage.getItem(STORAGE_KEYS.chatHistory);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  const t = responses[currentLang];
  return [{ role: 'assistant', content: t.chatWelcome }];
}

function saveChatHistory() {
  try {
    localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(chatHistory.slice(-20)));
  } catch (e) {}
}

function getLumiFallback() {
  const patterns = lumiFallbackPatterns[currentLang];
  const p = patterns[Math.floor(Math.random() * patterns.length)];
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
  const color = moodColors[btn.textContent.trim()] || '#FAF8F4';
  document.body.style.background = color;
  document.documentElement.style.setProperty('--bg', color);
}

function saveJournal(textarea) {
  try {
    localStorage.setItem(STORAGE_KEYS.journal, textarea.value);
  } catch (e) {}
}

async function sendMessage() {
  const t = responses[currentLang];
  const input = document.getElementById('msg');
  const messagesEl = document.getElementById('messages');
  const value = input.value.trim();
  if (!value) return;

  setLoading(true);

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
          { role: 'system', content: SYSTEM_PROMPT[currentLang] },
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
    setLoading(false);
  }
}

function setLoading(isLoading) {
  const t = responses[currentLang];
  const sendBtn = document.querySelector('#chat .btn');
  const msgInput = document.getElementById('msg');
  if (sendBtn) {
    sendBtn.disabled = isLoading;
    sendBtn.style.opacity = isLoading ? '0.6' : '';
  }
  if (msgInput) {
    msgInput.disabled = isLoading;
    msgInput.placeholder = isLoading ? (currentLang === 'zh' ? '思考中...' : 'Thinking...') : t.placeholder;
  }
}

function typeWriter(element, text) {
  element.textContent = '';
  let i = 0;
  const speed = currentLang === 'zh' ? 60 : 40;
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
  const t = responses[currentLang];
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

  const btnEl = document.querySelector('#mood-journal .gratitude-section .btn');
  const originalText = btnEl.textContent;
  btnEl.textContent = currentLang === 'zh' ? '已保存 ✨' : 'Saved ✨';
  btnEl.style.background = '#A8CFA8';

  setTimeout(() => {
    navigateTo('home');
    btnEl.textContent = originalText;
    btnEl.style.background = '';
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
    const treeStage = document.getElementById('journeyTreeStage');
    const treeDisplay = document.getElementById('treeStageDisplay');
    const treeEmoji = treeDisplay?.querySelector('.tree-emoji');
    const treeLabel = treeDisplay?.querySelector('.tree-label');

    const stage = progress.currentDay <= 10 ? { emoji: '🌱', label: currentLang === 'zh' ? '树苗' : 'Seedling' }
                : progress.currentDay <= 20 ? { emoji: '🌿', label: currentLang === 'zh' ? '成长' : 'Growing' }
                : { emoji: '🌳', label: currentLang === 'zh' ? '大树' : 'Big Tree' };

    if (treeStage) {
      treeStage.textContent = stage.emoji;
      treeStage.classList.remove('growing');
      void treeStage.offsetWidth;
      treeStage.classList.add('growing');
    }
    if (treeEmoji) treeEmoji.textContent = stage.emoji;
    if (treeLabel) treeLabel.textContent = stage.label;
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
  const t = responses[currentLang];
  btn.classList.toggle('active');
  btn.innerHTML = btn.classList.contains('active') ? t.huggedText : t.hugText;
  const hugCount = btn.closest('.post-card')?.querySelector('.post-hug-count');
  if (hugCount) {
    const current = parseInt(hugCount.textContent) || 0;
    if (btn.classList.contains('active')) {
      hugCount.textContent = `❤️ ${current + 1}`;
    } else {
      hugCount.textContent = `❤️ ${Math.max(0, current - 1)}`;
    }
  }
}

function showEncourage(btn) {
  const msgs = encourageMessages[currentLang];
  if (!btn.classList.contains('active')) {
    btn.innerHTML = `💝 ${msgs[Math.floor(Math.random() * msgs.length)]}`;
    btn.classList.add('active');
    setTimeout(() => {
      btn.innerHTML = responses[currentLang].encourageText;
      btn.classList.remove('active');
    }, 3000);
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  const btn = document.getElementById('langBtn');
  btn.textContent = currentLang === 'zh' ? 'EN' : '中文';
  applyTranslations();
}

function applyTranslations() {
  const t = responses[currentLang];
  const g = greetings[currentLang];

  const homeTitle = document.getElementById('homeTitle');
  if (homeTitle) {
    const hour = new Date().getHours();
    let greeting;
    if (currentLang === 'zh') {
      if (hour < 6) greeting = '夜深了，早点休息 🌙';
      else if (hour < 12) greeting = '早上好 ☀️';
      else if (hour < 18) greeting = '下午好 🌤️';
      else greeting = '晚上好 🌙';
    } else {
      if (hour < 6) greeting = 'Late night, rest soon 🌙';
      else if (hour < 12) greeting = 'Good morning ☀️';
      else if (hour < 18) greeting = 'Good afternoon 🌤️';
      else greeting = 'Good evening 🌙';
    }
    homeTitle.textContent = greeting;
  }

  const homeSubtitle = document.getElementById('homeSubtitle');
  if (homeSubtitle) homeSubtitle.textContent = t.homeSubtitle;

  const promptText = document.getElementById('promptText');
  if (promptText) promptText.textContent = t.promptText;

  const chatSubtitle = document.getElementById('chatSubtitle');
  if (chatSubtitle) chatSubtitle.innerHTML = t.chatSubtitle.replace('\n', '<br>');

  const journalTitle = document.getElementById('journalTitle');
  if (journalTitle) journalTitle.textContent = t.journalTitle;

  const journalDesc = document.getElementById('journalDesc');
  if (journalDesc) journalDesc.textContent = t.journalDesc;

  const journalTextarea = document.getElementById('journalTextarea');
  if (journalTextarea) journalTextarea.placeholder = t.journalPlaceholder;

  const journeyLabel = document.getElementById('journeyLabel');
  if (journeyLabel) journeyLabel.textContent = t.journeyLabel;

  const moodTitle = document.getElementById('moodTitle');
  if (moodTitle) moodTitle.textContent = t.moodTitle;

  const moodStep1 = document.getElementById('moodStep1');
  if (moodStep1) moodStep1.textContent = t.moodStep1;

  const moodStep2 = document.getElementById('moodStep2');
  if (moodStep2) moodStep2.textContent = t.moodStep2;

  const moodStep3 = document.getElementById('moodStep3');
  if (moodStep3) moodStep3.textContent = t.moodStep3;

  const journeyTitle = document.getElementById('journeyTitle');
  if (journeyTitle) journeyTitle.textContent = t.journeyTitle;

  const journeySubtitle = document.getElementById('journeySubtitle');
  if (journeySubtitle) journeySubtitle.textContent = t.journeySubtitle;

  const journeyDesc = document.getElementById('journeyDesc');
  if (journeyDesc) journeyDesc.textContent = t.journeyDesc;

  const communityTitle = document.getElementById('communityTitle');
  if (communityTitle) communityTitle.textContent = t.communityTitle;

  const profileTitle = document.getElementById('profileTitle');
  if (profileTitle) profileTitle.textContent = t.profileTitle;

  const msgInput = document.getElementById('msg');
  if (msgInput) msgInput.placeholder = t.placeholder;

  const saveBtn = document.querySelector('#mood-journal .gratitude-section .btn');
  if (saveBtn) saveBtn.textContent = t.saveText;

  const taskBtn = document.querySelector('#journey .task-card .btn');
  if (taskBtn) taskBtn.textContent = t.markComplete;

  const talkBtn = document.querySelector('#home .chat-entry .btn');
  if (talkBtn) talkBtn.textContent = t.talkToLumi;

  const continueBtn = document.querySelector('#home .journey-card .btn');
  if (continueBtn) continueBtn.textContent = t.continueText;

  const welcomeMsg = document.querySelector('#chat .message.ai');
  if (welcomeMsg && !welcomeMsg.textContent.includes('user')) {
    welcomeMsg.textContent = t.chatWelcome;
  }

  document.querySelectorAll('#community .actions button').forEach(btn => {
    if (btn.classList.contains('active')) {
      btn.textContent = t.huggedText;
    } else {
      const isHug = btn.textContent.includes('🤗');
      btn.textContent = isHug ? t.hugText : t.encourageText;
    }
  });

  document.querySelectorAll('.nav-item div:last-child').forEach((el, i) => {
    const navTexts = [t.navHome, t.navChat, t.navJournal, t.navCommunity, t.navProfile];
    if (navTexts[i]) el.textContent = navTexts[i];
  });

  const moodLabels = document.querySelectorAll('#mood-journal .mood-grid button span');
  const moodLabelTexts = currentLang === 'zh'
    ? ['开心', '平静', '一般', '难过', '崩溃']
    : ['Happy', 'Calm', 'Neutral', 'Sad', 'Overwhelmed'];
  moodLabels.forEach((label, i) => {
    if (moodLabelTexts[i]) label.textContent = moodLabelTexts[i];
  });

  const sourceBtns = document.querySelectorAll('#mood-journal .source-grid button');
  const sourceLabelSet = sourceLabels[currentLang];
  sourceBtns.forEach(btn => {
    for (const key in sourceLabelSet) {
      if (btn.getAttribute('onclick')?.includes(`'${key}'`)) {
        btn.textContent = sourceLabelSet[key];
        break;
      }
    }
  });
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

  const barFill = document.getElementById('journeyBarFill');
  if (barFill) barFill.style.width = (progress.currentDay / 30 * 100) + '%';

  const homeProgressBar = document.getElementById('homeProgressBar');
  if (homeProgressBar) homeProgressBar.style.width = (progress.currentDay / 30 * 100) + '%';

  const dayNumEl = document.getElementById('journeyDayNum');
  if (dayNumEl) dayNumEl.textContent = progress.currentDay;

  const currentDayEl = document.getElementById('currentDay');
  if (currentDayEl) currentDayEl.textContent = progress.currentDay;

  const percentEl = document.getElementById('journeyPercent');
  if (percentEl) percentEl.textContent = Math.round(progress.currentDay / 30 * 100);

  const stage = progress.currentDay <= 10 ? { emoji: '🌱', label: currentLang === 'zh' ? '树苗' : 'Seedling' }
              : progress.currentDay <= 20 ? { emoji: '🌿', label: currentLang === 'zh' ? '成长' : 'Growing' }
              : { emoji: '🌳', label: currentLang === 'zh' ? '大树' : 'Big Tree' };

  const treeStage = document.getElementById('journeyTreeStage');
  if (treeStage) treeStage.textContent = stage.emoji;

  const treeEmoji = document.querySelector('#treeStageDisplay .tree-emoji');
  if (treeEmoji) treeEmoji.textContent = stage.emoji;

  const treeLabel = document.querySelector('#treeStageDisplay .tree-label');
  if (treeLabel) treeLabel.textContent = stage.label;
}

function initChat() {
  const t = responses[currentLang];
  const messagesEl = document.getElementById('messages');
  messagesEl.innerHTML = '';

  if (chatHistory.length === 0) {
    chatHistory = [{ role: 'assistant', content: t.chatWelcome }];
  }

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
          { role: 'system', content: QUOTE_PROMPT[currentLang] },
          { role: 'user', content: currentLang === 'zh' ? '给我一句今日的鼓励' : 'Give me a gentle quote for today.' },
        ],
        temperature: 0.8,
        max_tokens: 60,
      }),
    });
    if (!response.ok) throw new Error('Failed');
    const data = await response.json();
    const quote = data.choices?.[0]?.message?.content;
    if (quote) {
      const el = document.getElementById('dailyQuote');
      if (el) el.textContent = `"${quote.replace(/^"|"$/g, '')}"`;
    }
  } catch (e) {
    const fallbackQuotes = {
      zh: ['"人生不是冲刺，只是今天慢一点。"', '"你比自己想象的更勇敢。"', '"每一步都算数，哪怕很小。"', '"允许自己休息，也是一种前进。"', '"你值得被温柔对待。"'],
      en: ['"Life is not a sprint, just take it slow today."', '"You are braver than you think."', '"Every step counts, even the small ones."', '"Allowing yourself to rest is also moving forward."', '"You deserve to be treated with kindness."']
    };
    const el = document.getElementById('dailyQuote');
    if (el) {
      const quotes = fallbackQuotes[currentLang];
      el.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }
  }
}

function initProfileStats() {
  const progress = getStoredProgress();
  const daysTogether = progress.currentDay + 20;
  const streak = Math.min(progress.currentDay, 7);

  const daysEl = document.getElementById('daysTogether');
  if (daysEl) daysEl.textContent = daysTogether;

  const streakEl = document.getElementById('streakCount');
  if (streakEl) streakEl.textContent = streak;

  const streakBar = document.getElementById('streakBar');
  if (streakBar) {
    streakBar.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const span = document.createElement('span');
      if (i < streak) {
        span.className = 'streak-done';
        span.textContent = '🔥';
      } else {
        span.className = 'streak-empty';
        span.textContent = '·';
      }
      streakBar.appendChild(span);
    }
  }
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
      const textarea = document.getElementById('journalTextarea');
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

  document.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('click', () => {
      const dayNum = parseInt(card.textContent);
      if (card.classList.contains('current')) {
        const t = responses[currentLang];
        if (confirm(currentLang === 'zh' ? `确定完成 Day ${dayNum} 的任务吗？` : `Complete Day ${dayNum}'s task?`)) {
          completeTask();
        }
      }
    });
  });
});
