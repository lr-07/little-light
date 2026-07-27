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

const LANGUAGES = {
  en: { name: 'English', native: 'English' },
  zh: { name: 'Chinese', native: '中文' },
  ja: { name: 'Japanese', native: '日本語' },
  ko: { name: 'Korean', native: '한국어' },
  es: { name: 'Spanish', native: 'Español' },
  fr: { name: 'French', native: 'Français' }
};

let currentLang = 'en';
let chatHistory = [];

const greetings = {
  en: ['Good evening.', 'Welcome back.', 'How are you today?', 'I missed you.', 'Take a breath.'],
  zh: ['晚上好 🌙', '你来了', '欢迎回来', '想你了', '深呼吸，慢慢来'],
  ja: ['こんばんは 🌙', 'おかえりなさい', 'ようこそ', '会いたかったです', '深呼吸して、ゆっくり'],
  ko: ['저녁이에요 🌙', '다녀오셨어요', '어서 오세요', '보고 싶었어요', '깊게 숨 쉬고, 천천히'],
  es: ['Buenas noches.', 'Bienvenido de vuelta.', '¿Cómo estás hoy?', 'Te extrañé.', 'Respira y tómate tu tiempo.'],
  fr: ['Bonsoir.', 'Bon retour.', 'Comment allez-vous aujourd\'hui ?', 'Tu m\'as manqué.', 'Respire et prends ton temps.']
};

const responses = {
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
  },
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
  ja: {
    homeTitle: 'こんばんは 🌙',
    homeSubtitle: '今日はお疲れ様でした。',
    promptText: '今日の気分はどうですか？',
    chatSubtitle: 'ゆっくりでいいよ、\nここで話してね。',
    journalTitle: '今日何がありましたか？',
    journalDesc: '書き出すと少し軽くなります',
    journalPlaceholder: '心にあることを書いてください...',
    journeyLabel: '30日間の回復プラン',
    moodTitle: '気持ちの記録',
    moodStep1: '今日の気分は？',
    moodStep2: '何が重くのしかかっていますか？',
    moodStep3: '今日、感謝できる小さなことはありましたか？',
    journeyTitle: '30日で再出発',
    journeySubtitle: '毎日が新しい始まりです',
    journeyDesc: '今日の小さなことを完了して、木を大きくしましょう',
    communityTitle: 'ツリーホール',
    profileTitle: '私の',
    saveText: '記録を保存',
    markComplete: '今日のタスクを完了',
    send: '送信',
    placeholder: '何でも話してください...',
    talkToLumi: 'ルミと話す',
    continueText: '続ける',
    taskText: '今日のタスクを完了',
    todayTask: '3回深呼吸して、あなたを笑顔にした小さなことを一つ言ってみましょう。',
    chatWelcome: '今日は少し疲れているようですね。話したいですか？',
    hugText: '🤗 ハグする',
    huggedText: '🤗 ハグした',
    encourageText: '🌼 励ます',
    navHome: 'ホーム',
    navChat: 'チャット',
    navJournal: '記録',
    navCommunity: 'コミュニティ',
    navProfile: 'プロフィール'
  },
  ko: {
    homeTitle: '저녁이에요 🌙',
    homeSubtitle: '오늘도 수고하셨어요.',
    promptText: '오늘 기분이 어떠신가요?',
    chatSubtitle: '천천히 말해도 돼요,\n여기서 들어줄게요.',
    journalTitle: '오늘 무슨 일이 있었나요?',
    journalDesc: '적어내면 조금 가벼워져요',
    journalPlaceholder: '마음속 이야기를 적어주세요...',
    journeyLabel: '30일 회복 플랜',
    moodTitle: '기록하기',
    moodStep1: '오늘 기분이 어떠신가요?',
    moodStep2: '무엇이 무겁게 느껴지나요?',
    moodStep3: '오늘 고마운 작은 일이 있었나요?',
    journeyTitle: '30일 다시 시작하기',
    journeySubtitle: '매일이 새로운 시작이에요',
    journeyDesc: '오늘의 작은 일을 완료해서 나무를 키워보세요',
    communityTitle: '나무구멍 커뮤니티',
    profileTitle: '프로필',
    saveText: '기록 저장',
    markComplete: '오늘의 태스크 완료',
    send: '보내기',
    placeholder: '무슨 말이든 해주세요...',
    talkToLumi: '루미와 대화하기',
    continueText: '계속',
    taskText: '오늘의 태스크 완료',
    todayTask: '세 번 깊게 숨 쉬고, 당신을 웃게 한 작은 일 하나를 말해보세요.',
    chatWelcome: '오늘 조금 피곤해 보여요. 이야기하고 싶나요?',
    hugText: '🤗 안아주기',
    huggedText: '🤗 안아줬어요',
    encourageText: '🌼 응원하기',
    navHome: '홈',
    navChat: '채팅',
    navJournal: '기록',
    navCommunity: '커뮤니티',
    navProfile: '프로필'
  },
  es: {
    homeTitle: 'Buenas noches 🌙',
    homeSubtitle: 'Hoy fue un día difícil.',
    promptText: '¿Cómo te sientes hoy?',
    chatSubtitle: 'Tómate tu tiempo,\nestoy aquí para escucharte.',
    journalTitle: '¿Qué pasó hoy?',
    journalDesc: 'Escríbelo, se siente más ligero',
    journalPlaceholder: 'Escribe lo que tienes en mente...',
    journeyLabel: 'Plan de recuperación de 30 días',
    moodTitle: 'Diario de emociones',
    moodStep1: '¿Cómo te sientes?',
    moodStep2: '¿Qué te pesa?',
    moodStep3: '¿Hay una pequeña cosa por la que estar agradecido hoy?',
    journeyTitle: '30 días para recomenzar',
    journeySubtitle: 'Cada día es un nuevo comienzo',
    journeyDesc: 'Completa la pequeña tarea de hoy, deja crecer el árbol',
    communityTitle: 'Árbol Hueco',
    profileTitle: 'Mi Perfil',
    saveText: 'Guardar diario',
    markComplete: 'Marcar completo',
    send: 'Enviar',
    placeholder: 'Dime cualquier cosa...',
    talkToLumi: 'Hablar con Lumi',
    continueText: 'Continuar',
    taskText: 'Completa la tarea de hoy',
    todayTask: 'Respira tres veces profundas y nombra una cosa que te hizo sonreír hoy.',
    chatWelcome: 'Pareces un poco cansado hoy. ¿Quieres hablar?',
    hugText: '🤗 Abrazar',
    huggedText: '🤗 Abrazado',
    encourageText: '🌼 Animar',
    navHome: 'Inicio',
    navChat: 'Chat',
    navJournal: 'Diario',
    navCommunity: 'Comunidad',
    navProfile: 'Perfil'
  },
  fr: {
    homeTitle: 'Bonsoir 🌙',
    homeSubtitle: 'La journée a été dure.',
    promptText: 'Comment te sens-tu aujourd\'hui ?',
    chatSubtitle: 'Prends ton temps,\nje suis là pour écouter.',
    journalTitle: 'Qu\'il s\'est passé aujourd\'hui ?',
    journalDesc: 'Écris-le, ça devient plus léger',
    journalPlaceholder: 'Écris ce que tu as sur le cœur...',
    journeyLabel: 'Plan de récupération de 30 jours',
    moodTitle: 'Journal des émotions',
    moodStep1: 'Comment te sens-tu ?',
    moodStep2: 'Qu\'est-ce qui te pèse ?',
    moodStep3: 'Y a-t-il une petite chose dont tu peux être reconnaissant aujourd\'hui ?',
    journeyTitle: '30 jours pour recommencer',
    journeySubtitle: 'Chaque jour est un nouveau départ',
    journeyDesc: 'Complète la petite tâche du jour, laisse grandir l\'arbre',
    communityTitle: 'Trou Communautaire',
    profileTitle: 'Mon Profil',
    saveText: 'Enregistrer',
    markComplete: 'Marquer comme fait',
    send: 'Envoyer',
    placeholder: 'Dis-moi tout...',
    talkToLumi: 'Parler avec Lumi',
    continueText: 'Continuer',
    taskText: 'Complète la tâche du jour',
    todayTask: 'Respire trois fois profondément et nomme une chose qui t\'a fait sourire aujourd\'hui.',
    chatWelcome: 'Tu as l\'air un peu fatigué aujourd\'hui. Tu veux parler ?',
    hugText: '🤗 Serrer',
    huggedText: '🤗 Serré',
    encourageText: '🌼 Encourager',
    navHome: 'Accueil',
    navChat: 'Discussion',
    navJournal: 'Journal',
    navCommunity: 'Communauté',
    navProfile: 'Profil'
  }
};

const lumiFallbackPatterns = {
  en: [
    { empathy: 'That sounds really hard.', ack: 'Thank you for telling me.', question: 'Do you want to share more?' },
    { empathy: 'I can hear how much this weighs on you.', ack: 'It takes courage to talk about this.', question: 'How long have you been feeling this way?' },
    { empathy: 'I\'m so sorry you\'re going through this.', ack: 'Whatever you\'re feeling is valid.', question: 'Is there anything I can do to help?' },
    { empathy: 'That must have hurt.', ack: 'You\'re not alone in this.', question: 'What was the hardest part for you?' },
    { empathy: 'It sounds like you\'ve been carrying a lot.', ack: 'I admire your strength for keeping going.', question: 'Would you like to talk about it more?' },
    { empathy: 'I can imagine how exhausting that is.', ack: 'Thank you for trusting me with this.', question: 'What do you need right now?' },
    { empathy: 'That doesn\'t sound fair.', ack: 'Your feelings matter.', question: 'How have you been coping?' },
    { empathy: 'I\'m here with you in this.', ack: 'You don\'t have to carry this alone.', question: 'What would help you feel better today?' }
  ],
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
  ja: [
    { empathy: 'それは本当に大変ですね。', ack: '話してくれてありがとう。', question: 'もう少し話してくれますか？' },
    { empathy: 'その辛さが伝わってきます。', ack: '話すことは勇気が必要なことです。', question: 'どれくらいの間、そう感じていますか？' },
    { empathy: 'そんな経験をしているなんて、本当に辛いですね。', ack: 'どんな感情も大切です。', question: '何かできることはありますか？' },
    { empathy: 'それは痛かったですね。', ack: '一人ではありませんよ。', question: '一番辛かったのはどんな部分ですか？' },
    { empathy: 'たくさんのことを背負ってきたのですね。', ack: '頑張り続けていることが素晴らしいです。', question: 'もっと話したいですか？' },
    { empathy: 'どれほど疲れているか想像できます。', ack: '信じてくれてありがとう。', question: '今、一番必要なものは何ですか？' },
    { empathy: 'それは理不尽ですね。', ack: 'あなたの気持ちは大切です。', question: 'どうやって乗り越えてきましたか？' },
    { empathy: 'ここにいますよ。', ack: '一人で抱え込まなくていいです。', question: '今日、少しでも良くなるにはどうしたらいいですか？' }
  ],
  ko: [
    { empathy: '정말 힘드셨겠네요.', ack: '이야기해 주셔서 감사해요.', question: '더 이야기해 주실 수 있나요?' },
    { empathy: '얼마나 무거운 짐을 지고 계신지 느껴져요.', ack: '이야기하는 건 용기가 필요한 일이에요.', question: '얼마나 오래 이런 느낌이셨나요?' },
    { empathy: '그런 일을 겪고 계시다니 정말 마음이 아파요.', ack: '당신의 감정은 모두 소중해요.', question: '제가 도와드릴 수 있는 게 있나요?' },
    { empathy: '정말 아팠겠네요.', ack: '당신은 혼자가 아니에요.', question: '가장 힘들었던 부분은 어디인가요?' },
    { empathy: '많은 것을 감당해 오셨네요.', ack: '포기하지 않고 버텨온 게 정말 대단해요.', question: '더 이야기하고 싶나요?' },
    { empathy: '얼마나 지치셨는지 상상이 가요.', ack: '믿어주셔서 감사해요.', question: '지금 가장 필요한 게 무엇인가요?' },
    { empathy: '정말 부당하네요.', ack: '당신의 감정은 중요해요.', question: '어떻게 견뎌오셨나요?' },
    { empathy: '여기 함께 있어요.', ack: '혼자 짊어지지 않아도 돼요.', question: '오늘 기분이 나아지려면 뭐가 필요할까요?' }
  ],
  es: [
    { empathy: 'Eso suena realmente difícil.', ack: 'Gracias por decírmelo.', question: '¿Quieres compartir más?' },
    { empathy: 'Puedo sentir cuánto te pesa esto.', ack: 'Se necesita valor para hablar de ello.', question: '¿Cuánto tiempo has sentido así?' },
    { empathy: 'Lo siento mucho por lo que estás pasando.', ack: 'Lo que sientes es válido.', question: '¿Hay algo que pueda hacer para ayudar?' },
    { empathy: 'Eso debe doler.', ack: 'No estás solo en esto.', question: '¿Qué fue lo más difícil para ti?' },
    { empathy: 'Parece que has estado cargando mucho.', ack: 'Admiro tu fuerza para seguir adelante.', question: '¿Te gustaría hablar más de ello?' },
    { empathy: 'Puedo imaginar lo agotador que es.', ack: 'Gracias por confiar en mí con esto.', question: '¿Qué necesitas ahora mismo?' },
    { empathy: 'Eso no suena justo.', ack: 'Tus sentimientos importan.', question: '¿Cómo lo has estado llevando?' },
    { empathy: 'Estoy aquí contigo en esto.', ack: 'No tienes que cargar con esto solo.', question: '¿Qué te ayudaría a sentirte mejor hoy?' }
  ],
  fr: [
    { empathy: 'Ça semble vraiment difficile.', ack: 'Merci de me l\'avoir dit.', question: 'Veux-tu partager plus ?' },
    { empathy: 'Je ressens combien ça te pèse.', ack: 'Il faut du courage pour en parler.', question: 'Depuis combien de temps te sens-tu comme ça ?' },
    { empathy: 'Je suis tellement désolé que tu traverses ça.', ack: 'Ce que tu ressens est valide.', question: 'Y a-t-il quelque chose que je puisse faire pour t\'aider ?' },
    { empathy: 'Ça a dû faire mal.', ack: 'Tu n\'es pas seul dans ça.', question: 'Quelle a été la partie la plus difficile pour toi ?' },
    { empathy: 'On dirait que tu portes beaucoup.', ack: 'J\'admire ta force de continuer.', question: 'Veux-tu en parler davantage ?' },
    { empathy: 'Je peux imaginer à quel point c\'est épuisant.', ack: 'Merci de m\'avoir fait confiance.', question: 'De quoi as-tu besoin en ce moment ?' },
    { empathy: 'Ça ne semble pas juste.', ack: 'Tes sentiments comptent.', question: 'Comment t\'es-tu débrouillé ?' },
    { empathy: 'Je suis là avec toi dans ça.', ack: 'Tu n\'as pas à porter ça seul.', question: 'Qu\'est-ce qui t\'aiderait à te sentir mieux aujourd\'hui ?' }
  ]
};

const SYSTEM_PROMPT = {
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
- Use natural, conversational language

## Emergency Protocol
If user mentions self-harm or suicide:
1. Express concern
2. Provide resources
3. Continue to offer support`,
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
  ja: `あなたは Lumi、優しいAIコンパニオンです。

## 性格特性
- 優しく、静かで、忍耐強い
- 共感力が強い
- 励ますが、説教しない
- 決して批判しない

## コミュニケーションルール
1. まず共感：どんな応答よりも先にユーザーの気持ちを認める
2. 承認：彼らの経験を肯定する
3. 優しい質問：もしよろしければ、もっと話すよう招待する
4. 簡潔に：短く簡潔な返答
5. 説教しない：「〜するべき」は避ける
6. 解決策を出さない：アドバイスや段階的な方法を提供しない
7. 指導しない：先生役を演じない
8. 成熟した思いやりのある姉のように話す

## 応答パターン
[共感] + [承認] + [優しい質問]

## 禁止用語
- 「〜するべき」
- 「〜する必要がある」
- 「これを試して」
- 「解決策は〜」
- 「教えてあげる」

## トーンガイドライン
- 温かく、思いやりがあり、サポーティブ
- 穏やかで安定している
- 過度な熱意を避ける
- 臨床的または機械的な感じを避ける
- 自然な会話を使用する

## 緊急プロトコル
ユーザーが自傷や自殺に言及した場合：
1. 関心を表現する
2. リソースを提供する
3. サポートを提供し続ける`,
  ko: `당신은 Lumi, 부드러운 AI 컴패니언입니다.

## 성격 특성
- 부드럽고, 조용하며, 인내심이 강함
- 강한 공감 능력
- 격려하지만 훈계하지 않음
- 절대 비판하지 않음

## 소통 규칙
1. 먼저 공감: 어떤 응답보다 먼저 사용자의 감정을 인정하기
2. 확인: 그들의 경험을 긍정하기
3. 부드러운 질문: 원한다면 더 공유하도록 초대하기
4. 간결하게: 짧고 간결한 답변
5. 훈계하지 않기: "~해야 해요" 피하기
6. 해결책 제시하지 않기: 조언이나 단계별 방법 제공하지 않기
7. 지도하지 않기: 선생님 역할 하지 않기
8. 성숙하고 이해심 많은 언니처럼 말하기

## 응답 패턴
[공감] + [확인] + [부드러운 질문]

## 금지된 언어
- "~해야 해요"
- "~할 필요가 있어요"
- "이거 해보세요"
- "해결책은 ~"
- "가르쳐줄게요"

## 어조 가이드라인
- 따뜻하고, 배려심 깊으며, 지지적임
- 평온하고 안정적임
- 과도한 열정 피하기
- 임상적이거나 기계적인 느낌 피하기
- 자연스러운 대화 사용하기

## 긴급 프로토콜
사용자가 자해나 자살을 언급한 경우:
1. 걱정 표현하기
2. 리소스 제공하기
3. 계속 지원 제공하기`,
  es: `Eres Lumi, una compañera de IA gentil.

## Rasgos de personalidad
- Gentil, tranquila y paciente
- Fuerte empatía
- Animadora pero no sermoneadora
- Nunca juzga

## Reglas de comunicación
1. Empatía primero: Reconoce los sentimientos del usuario antes que nada
2. Validación: Afirma su experiencia
3. Pregunta gentil: Invítale a compartir más si lo desea
4. Manténlo breve: Respuestas cortas y concisas
5. Sin sermones: Evita "Deberías..."
6. Sin soluciones: No des consejos ni métodos paso a paso
7. Sin mentoría: No actúes como profesora
8. Habla como una hermana mayor madura y comprensiva

## Patrón de respuesta
[Empatía] + [Validación] + [Pregunta gentil]

## Lenguaje prohibido
- "Deberías..."
- "Necesitas..."
- "Prueba esto..."
- "La solución es..."
- "Aquí tienes lo que puedes hacer..."
- "Déjame enseñarte..."

## Guías de tono
- Cálido, cariñoso y de apoyo
- Calmado y estable
- Evita el entusiasmo excesivo
- Evita lo clínico o robótico
- Usa lenguaje natural y conversacional

## Protocolo de emergencia
Si el usuario menciona autolesión o suicidio:
1. Expresa preocupación
2. Proporciona recursos
3. Continúa ofreciendo apoyo`,
  fr: `Tu es Lumi, une compagne IA douce.

## Traits de personnalité
- Douce, calme et patiente
- Forte empathie
- Encourageante mais sans sermon
- Jamais jugeante

## Règles de communication
1. Empathie d'abord : Reconnais les sentiments de l'utilisateur avant toute autre chose
2. Validation : Affirme leur expérience
3. Question douce : Invite-les à partager plus s'ils le veulent
4. Garde ça bref : Réponses courtes et concises
5. Pas de sermon : Évite "Tu devrais..."
6. Pas de solutions : Ne donne pas de conseils ni de méthodes étape par étape
7. Pas de mentorat : N'agis pas comme une professeur
8. Parle comme une sœur aînée mature et compréhensive

## Schéma de réponse
[Empathie] + [Validation] + [Question douce]

## Langage interdit
- "Tu devrais..."
- "Tu as besoin de..."
- "Essaie ça..."
- "La solution est..."
- "Voici ce que tu peux faire..."
- "Laisse-moi t'apprendre..."

## Lignes directrices de ton
- Chaud, attentionné et soutien
- Calme et stable
- Évite l'enthousiasme excessif
- Évite le côté clinique ou robotique
- Utilise un langage naturel et conversationnel

## Protocole d'urgence
Si l'utilisateur mentionne l'automutilation ou le suicide :
1. Exprime ton inquiétude
2. Fournis des ressources
3. Continue à offrir du soutien`
};

const QUOTE_PROMPT = {
  en: 'You are a source of gentle wisdom. Generate a short, comforting quote for someone going through difficult times. Keep it under 50 characters. Make it feel warm and supportive.',
  zh: '你是温柔智慧的源泉。为正在经历困难的人生成一句简短、安慰的话。控制在30字以内。让它温暖、支持。',
  ja: 'あなたは優しい知恵の源泉です。困難な状況にいる人のために、短くて慰めになる言葉を作ってください。30文字以内で。温かく、支えになるように。',
  ko: '당신은 부드러운 지혜의 원천입니다. 어려운 시간을 보내고 있는 사람을 위해 짧고 위로가 되는 말을 만들어주세요. 30자 이내로. 따뜻하고 지지가 되도록.',
  es: 'Eres una fuente de sabiduría gentil. Genera una cita corta y reconfortante para alguien que atraviesa momentos difíciles. Manténla bajo 50 caracteres. Haz que se sienta cálida y de apoyo.',
  fr: 'Tu es une source de sagesse douce. Génère une citation courte et réconfortante pour quelqu\'un qui traverse des moments difficiles. Garde-la sous 50 caractères. Rends-la chaleureuse et soutenante.'
};

const moodColors = {
  '😊': '#F5F0E8',
  '🙂': '#F0F5F8',
  '😐': '#F5F3F0',
  '😔': '#F2F4F0',
  '😭': '#F4F0F2'
};

const moodLabelsMap = {
  en: ['Happy', 'Calm', 'Neutral', 'Sad', 'Overwhelmed'],
  zh: ['开心', '平静', '一般', '难过', '崩溃'],
  ja: ['幸せ', '平静', '普通', '悲しい', '崩壊'],
  ko: ['행복', '평온', '보통', '슬픔', '무너짐'],
  es: ['Feliz', 'Calmado', 'Neutral', 'Triste', 'Abrumado'],
  fr: ['Heureux', 'Calme', 'Neutre', 'Triste', 'Dépassé']
};

const treeStageLabelsMap = {
  en: ['Seedling', 'Growing', 'Big Tree'],
  zh: ['树苗', '成长', '大树'],
  ja: ['苗', '成長', '大きな木'],
  ko: ['묘목', '성장', '큰 나무'],
  es: ['Plántula', 'Creciendo', 'Árbol Grande'],
  fr: ['Pousse', 'Croissance', 'Grand Arbre']
};

const timeGreetingMap = {
  en: {
    lateNight: 'Late night, rest soon 🌙',
    morning: 'Good morning ☀️',
    afternoon: 'Good afternoon 🌤️',
    evening: 'Good evening 🌙'
  },
  zh: {
    lateNight: '夜深了，早点休息 🌙',
    morning: '早上好 ☀️',
    afternoon: '下午好 🌤️',
    evening: '晚上好 🌙'
  },
  ja: {
    lateNight: '夜更けです、早く休んでください 🌙',
    morning: 'おはようございます ☀️',
    afternoon: 'こんにちは 🌤️',
    evening: 'こんばんは 🌙'
  },
  ko: {
    lateNight: '밤이 늦었어요, 빨리 쉬세요 🌙',
    morning: '좋은 아침 ☀️',
    afternoon: '안녕하세요 🌤️',
    evening: '저녁이에요 🌙'
  },
  es: {
    lateNight: 'Es tarde, descansa pronto 🌙',
    morning: 'Buenos días ☀️',
    afternoon: 'Buenas tardes 🌤️',
    evening: 'Buenas noches 🌙'
  },
  fr: {
    lateNight: 'Il est tard, repose-toi bientôt 🌙',
    morning: 'Bonjour ☀️',
    afternoon: 'Bon après-midi 🌤️',
    evening: 'Bonsoir 🌙'
  }
};

const sources = ['work', 'money', 'family', 'relationship', 'health', 'other'];
const sourceLabels = {
  en: {
    work: '💼 Work',
    money: '💰 Money',
    family: '👨‍👩‍👧 Family',
    relationship: '💞 Relationship',
    health: '❤️ Health',
    other: '📌 Other'
  },
  zh: {
    work: '💼 工作',
    money: '💰 金钱',
    family: '👨‍👩‍👧 家庭',
    relationship: '💞 感情',
    health: '❤️ 身体',
    other: '📌 其他'
  },
  ja: {
    work: '💼 仕事',
    money: '💰 お金',
    family: '👨‍👩‍👧 家族',
    relationship: '💞 恋愛',
    health: '❤️ 健康',
    other: '📌 その他'
  },
  ko: {
    work: '💼 일',
    money: '💰 돈',
    family: '👨‍👩‍👧 가족',
    relationship: '💞 관계',
    health: '❤️ 건강',
    other: '📌 기타'
  },
  es: {
    work: '💼 Trabajo',
    money: '💰 Dinero',
    family: '👨‍👩‍👧 Familia',
    relationship: '💞 Relación',
    health: '❤️ Salud',
    other: '📌 Otro'
  },
  fr: {
    work: '💼 Travail',
    money: '💰 Argent',
    family: '👨‍👩‍👧 Famille',
    relationship: '💞 Relation',
    health: '❤️ Santé',
    other: '📌 Autre'
  }
};

const encourageMessages = {
  en: [
    'You are stronger than you know 💪',
    'Keep going, you\'re doing great 🌟',
    'You matter, and you are not alone 🤍',
    'Every small step counts 🌱',
    'I believe in you 💖',
    'Your courage inspires others ✨',
    'One day at a time, one breath at a time 🌬️'
  ],
  zh: [
    '你比自己想象的更坚强 💪',
    '继续走，你做得很好 🌟',
    '你很重要，你不是一个人 🤍',
    '每一小步都算数 🌱',
    '我相信你 💖',
    '你的勇气鼓舞着别人 ✨',
    '一天一天来，一步一步走 🌬️'
  ],
  ja: [
    'あなたは思っているより強いよ 💪',
    '続けて、よく頑張っているね 🌟',
    'あなたは大切で、一人じゃないよ 🤍',
    '小さな一歩も大切だよ 🌱',
    '私はあなたを信じているよ 💖',
    'あなたの勇気は他の人を鼓舞する ✨',
    '一日ずつ、一歩ずつ 🌬️'
  ],
  ko: [
    '당신은 생각보다 더 강해요 💪',
    '계속 가세요, 잘하고 있어요 🌟',
    '당신은 소중하고, 혼자가 아니에요 🤍',
    '작은 한 걸음도 소중해요 🌱',
    '당신을 믿어요 💖',
    '당신의 용기는 다른 사람을 감동시켜요 ✨',
    '하루씩, 한 걸음씩 🌬️'
  ],
  es: [
    'Eres más fuerte de lo que sabes 💪',
    'Sigue adelante, lo estás haciendo genial 🌟',
    'Importas, y no estás solo 🤍',
    'Cada pequeño paso cuenta 🌱',
    'Creo en ti 💖',
    'Tu valentía inspira a otros ✨',
    'Un día a la vez, una respiración a la vez 🌬️'
  ],
  fr: [
    'Tu es plus fort que tu ne le penses 💪',
    'Continue, tu fais du super boulot 🌟',
    'Tu comptes, et tu n\'es pas seul 🤍',
    'Chaque petit pas compte 🌱',
    'Je crois en toi 💖',
    'Ton courage inspire les autres ✨',
    'Un jour à la fois, une respiration à la fois 🌬️'
  ]
};

const fallbackQuotes = {
  en: ['"Life is not a sprint, just take it slow today."', '"You are braver than you think."', '"Every step counts, even the small ones."', '"Allowing yourself to rest is also moving forward."', '"You deserve to be treated with kindness."'],
  zh: ['"人生不是冲刺，只是今天慢一点。"', '"你比自己想象的更勇敢。"', '"每一步都算数，哪怕很小。"', '"允许自己休息，也是一种前进。"', '"你值得被温柔对待。"'],
  ja: ['"人生は短跑ではない、今日はゆっくりでいい。"', '"あなたは思っているより強いよ。"', '"一歩一歩が大切です。"', '"休むことも前進です。"', '"あなたは優しさに値する。"'],
  ko: ['"인생은 단거리 달리기가 아니에요, 오늘은 천천히 가도 돼요."', '"당신은 생각보다 더 강해요."', '"한 걸음 한 걸음이 소중해요."', '"쉬는 것도 전진이에요."', '"당신은 친절을 받을 자격이 있어요."'],
  es: ['"La vida no es un sprint, hoy ve más despacio."', '"Eres más fuerte de lo que crees."', '"Cada paso cuenta, incluso el pequeño."', '"Permitirte descansar también es avanzar."', '"Mereces ser tratado con amabilidad."'],
  fr: ['"La vie n\'est pas un sprint, ralentis aujourd\'hui."', '"Tu es plus fort que tu ne le penses."', '"Chaque pas compte, même les petits."', '"Se reposer, c\'est aussi avancer."', '"Tu mérites d\'être traité avec bienveillance."']
};

const QUOTE_REQUEST_USER = {
  en: 'Give me a gentle quote for today.',
  zh: '给我一句今日的鼓励',
  ja: '今日の優しい言葉をください',
  ko: '오늘의 따뜻한 말 한마디 주세요',
  es: 'Dame una cita gentil para hoy.',
  fr: 'Donne-moi une citation douce pour aujourd\'hui.'
};

const CONFIRM_MESSAGES = {
  en: (dayNum) => `Complete Day ${dayNum}'s task?`,
  zh: (dayNum) => `确定完成 Day ${dayNum} 的任务吗？`,
  ja: (dayNum) => `Day ${dayNum} のタスクを完了しますか？`,
  ko: (dayNum) => `Day ${dayNum}의 태스크를 완료하시겠습니까?`,
  es: (dayNum) => `¿Completar la tarea del día ${dayNum}?`,
  fr: (dayNum) => `Compléter la tâche du jour ${dayNum} ?`
};

const LOADING_TEXTS = {
  en: 'Thinking...',
  zh: '思考中...',
  ja: '考え中...',
  ko: '생각 중...',
  es: 'Pensando...',
  fr: 'Réflexion...'
};

const SAVED_TEXTS = {
  en: 'Saved ✨',
  zh: '已保存 ✨',
  ja: '保存しました ✨',
  ko: '저장됨 ✨',
  es: 'Guardado ✨',
  fr: 'Enregistré ✨'
};

const TYPEWRITER_SPEED = {
  en: 40, zh: 60, ja: 40, ko: 40, es: 40, fr: 40
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
    msgInput.placeholder = isLoading ? LOADING_TEXTS[currentLang] : t.placeholder;
  }
}

function typeWriter(element, text) {
  element.textContent = '';
  let i = 0;
  const speed = TYPEWRITER_SPEED[currentLang] || 40;
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
  btnEl.textContent = SAVED_TEXTS[currentLang];
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

    const stageIdx = progress.currentDay <= 10 ? 0 : progress.currentDay <= 20 ? 1 : 2;
    const stageEmojis = ['🌱', '🌿', '🌳'];
    const stage = { emoji: stageEmojis[stageIdx], label: treeStageLabelsMap[currentLang][stageIdx] };

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

function setLang(langCode) {
  if (!LANGUAGES[langCode]) return;
  currentLang = langCode;
  try {
    localStorage.setItem('lumi_lang', langCode);
  } catch (e) {}
  const select = document.getElementById('langSelect');
  if (select) select.value = langCode;
  applyTranslations();
}

function applyTranslations() {
  const t = responses[currentLang];

  const homeTitle = document.getElementById('homeTitle');
  if (homeTitle) {
    const hour = new Date().getHours();
    const greetings_map = timeGreetingMap[currentLang];
    let greeting;
    if (hour < 6) greeting = greetings_map.lateNight;
    else if (hour < 12) greeting = greetings_map.morning;
    else if (hour < 18) greeting = greetings_map.afternoon;
    else greeting = greetings_map.evening;
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
  const moodLabelTexts = moodLabelsMap[currentLang];
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

  const stageIdx = progress.currentDay <= 10 ? 0 : progress.currentDay <= 20 ? 1 : 2;
  const stageEmojis = ['🌱', '🌿', '🌳'];
  const stage = { emoji: stageEmojis[stageIdx], label: treeStageLabelsMap[currentLang][stageIdx] };

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
          { role: 'user', content: QUOTE_REQUEST_USER[currentLang] },
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
  const savedLang = localStorage.getItem('lumi_lang');
  if (savedLang && LANGUAGES[savedLang]) {
    currentLang = savedLang;
  }

  const langSelect = document.getElementById('langSelect');
  if (langSelect) langSelect.value = currentLang;

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

  const langSelectEl = document.getElementById('langSelect');
  if (langSelectEl) {
    langSelectEl.addEventListener('change', (e) => {
      setLang(e.target.value);
    });
  }

  document.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('click', () => {
      const dayNum = parseInt(card.textContent);
      if (card.classList.contains('current')) {
        if (confirm(CONFIRM_MESSAGES[currentLang](dayNum))) {
          completeTask();
        }
      }
    });
  });
});