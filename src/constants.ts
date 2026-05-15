import { MBEIType, MBEI_Code } from './types';

export const MBEI_TYPES: Record<MBEI_Code, MBEIType> = {
  // --- M-魂系 (Mind) ---
  MNHR: {
    code: 'MNHR',
    name: '玄武 (The Guardian)',
    creature: '玄武',
    description: '心理修復 × 原型食物 × 沉重 × 規律',
    insight: '沉穩之神。規律攝取厚重的原野肉食，體質堅實，氣場厚重。',
    emoji: '🐢'
  },
  MNHV: {
    code: 'MNHV',
    name: '麒麟 (The Sacred Beast)',
    creature: '麒麟',
    description: '心理修復 × 原型食物 × 沉重 × 飄忽',
    insight: '仁寵之獸。隨性攝取豐盛的原型珍饈，雖然負擔較重，但帶有療癒之光。',
    emoji: '🦒'
  },
  MNLR: {
    code: 'MNLR',
    name: '白澤 (The Wise Seer)',
    creature: '白澤',
    description: '心理修復 × 原型食物 × 輕盈 × 規律',
    insight: '辟邪之獸。準時攝取清淡的原野精華，神魂清澈，最懂平衡之道。',
    emoji: '🦄'
  },
  MNLV: {
    code: 'MNLV',
    name: '九尾 (The Spirit Fox)',
    creature: '九尾',
    description: '心理修復 × 原型食物 × 輕盈 × 飄忽',
    insight: '幻化之靈。隨性攝取自然花果，身輕如雲，性格飄忽難測。',
    emoji: '🦊'
  },
  MPHR: {
    code: 'MPHR',
    name: '金烏 (The Sun-Bird)',
    creature: '金烏',
    description: '心理修復 × 加工食品 × 沉重 × 規律',
    insight: '司日之靈。規律攝取濃縮火精（加工甜食），雖循天時，但體內積聚過量陽煞。',
    emoji: '🦅'
  },
  MPHV: {
    code: 'MPHV',
    name: '饕餮 (The Devourer)',
    creature: '饕餮',
    description: '心理修復 × 加工食品 × 沉重 × 飄忽',
    insight: '貪食之獸。在心神不寧時攝取大量人工煉化物，濁氣（煞）極重，出沒無常。',
    emoji: '👺'
  },
  MPLR: {
    code: 'MPLR',
    name: '織女 (The Weaver)',
    creature: '織女',
    description: '心理修復 × 加工食品 × 輕盈 × 規律',
    insight: '巧手之神。規律攝取精緻但輕盈的人造膳食，維持神力的細膩穩定。',
    emoji: '🧵'
  },
  MPLV: {
    code: 'MPLV',
    name: '夢貘 (The Dream Eater)',
    creature: '夢貘',
    description: '心理修復 × 加工食品 × 輕盈 × 飄忽',
    insight: '食夢之獸。不定期攝取人工輕量代餐，游離於虛實與情緒之間間。',
    emoji: '🐘'
  },

  // --- P-魄系 (Body/Physiological) ---
  PNHR: {
    code: 'PNHR',
    name: '當康 (The Harvest Boar)',
    creature: '當康',
    description: '生理功能 × 原型食物 × 沉重 × 規律',
    insight: '瑞獸。規律攝取紮實的原型糧食，身體強健且負擔感重，象徵豐饒。',
    emoji: '🐗'
  },
  PNHV: {
    code: 'PNHV',
    name: '朱厭 (The War Omen)',
    creature: '朱厭',
    description: '生理功能 × 原型食物 × 沉重 × 飄忽',
    insight: '猿身紅腳。隨性攝取大量原型蛋白質，力量強大但體內火煞過旺。',
    emoji: '🐒'
  },
  PNLR: {
    code: 'PNLR',
    name: '夔 (The Thunder Beast)',
    creature: '夔',
    description: '生理功能 × 原型食物 × 輕盈 × 規律',
    insight: '獨足之牛。堅守原野清淡之食，順應天時，氣息強大但性格孤冷。',
    emoji: '🐃'
  },
  PNLV: {
    code: 'PNLV',
    name: '夫諸 (The Water Deer)',
    creature: '夫諸',
    description: '生理功能 × 原型食物 × 輕盈 × 飄忽',
    insight: '四角之鹿。隨性攝取山泉草木，體質極度清透，性情隨遇而安。',
    emoji: '🦌'
  },
  PPHR: {
    code: 'PPHR',
    name: '混沌 (The Primal Chaos)',
    creature: '混沌',
    description: '生理功能 × 加工食品 × 沉重 × 規律',
    insight: '無竅之獸。規律攝取沉重澱粉，雖然進食有時，但肉身混濁，難以代謝。',
    emoji: '🌀'
  },
  PPHV: {
    code: 'PPHV',
    name: '魃 (The Drought Bringer)',
    creature: '魃',
    description: '生理功能 × 加工食品 × 沉重 × 飄忽',
    insight: '旱之妖。攝取過多人工焦灼物（乾糧），體內水分枯竭，濁氣淤塞，節奏紊亂。',
    emoji: '🏜️'
  },
  PPLR: {
    code: 'PPLR',
    name: '精衛 (The Persistent Bird)',
    creature: '精衛',
    description: '生理功能 × 加工食品 × 輕盈 × 規律',
    insight: '銜石之鳥。為了達成生存目標，規律攝取極低負擔的煉化補給，堅毅且枯燥。',
    emoji: '🐦'
  },
  PPLV: {
    code: 'PPLV',
    name: '影 (The Shadow Runner)',
    creature: '影',
    description: '生理功能 × 加工食品 × 輕盈 × 飄忽',
    insight: '隨風之魅。隨性攝取加工輕食，生存優先，沒有定性，存在感薄弱。',
    emoji: '👤'
  }
};

export const MOOD_OPTIONS = [
  { label: '開心', emoji: '😊' },
  { label: '平靜', emoji: '😐' },
  { label: '焦慮', emoji: '😰' },
  { label: '疲累', emoji: '😫' },
  { label: '煩躁', emoji: '💢' },
  { label: '低落', emoji: '😔' }
];

export const POST_MOOD_OPTIONS = [
  { label: '被安撫', emoji: '💆' },
  { label: '有精神', emoji: '⚡' },
  { label: '後悔', emoji: '💧' },
  { label: '昏沉', emoji: '💤' },
  { label: '平靜', emoji: '🌿' },
  { label: '空虛', emoji: '🕳️' }
];

export const BODY_FEELING_OPTIONS = [
  { label: '清爽', emoji: '🍃' },
  { label: '飽足', emoji: '🥣' },
  { label: '胃脹', emoji: '🎈' },
  { label: '心悸', emoji: '💓' },
  { label: '想睡', emoji: '🛌' },
  { label: '口渴', emoji: '🥤' }
];

export const CONTEXT_OPTIONS = [
  { label: '趕工', emoji: '💻' },
  { label: '通勤', emoji: '🚌' },
  { label: '報告週', emoji: '📝' },
  { label: '失眠後', emoji: '🌙' },
  { label: '聚餐', emoji: '👥' },
  { label: '獨處', emoji: '🏠' }
];

export interface Fortune {
  id: string;
  title: string;
  verse: string[];
  advice: string[];
  fortuneType: 'warning' | 'normal' | 'blessing';
}

export const LEADERBOARD_DATA = [
  { rank: 1, name: '玄武大師', points: 4520, emoji: '🐢' },
  { rank: 2, name: '九尾仙人', points: 3880, emoji: '🦊' },
  { rank: 3, name: '鳳皇傳人', points: 3150, emoji: '🦅' },
  { rank: 4, name: '白澤行者', points: 2890, emoji: '🦄' },
  { rank: 5, name: '麒麟之友', points: 2460, emoji: '🦒' },
  { rank: 6, name: '今日食修者', points: 1280, emoji: '🦊', isUser: true },
];

export const FORTUNES: Fortune[] = [
  {
    id: 'f1',
    title: '業障初現，警示之兆',
    verse: [
      '精製加工堆積體脂',
      '動物油脂纏繞血管',
      '纖維雖在難以抵擋',
      '轉運需從明日做起'
    ],
    advice: [
      '宜 飯後步行20分鐘',
      '晚餐選清蒸食物',
      '補充膳食纖維'
    ],
    fortuneType: 'warning'
  },
  {
    id: 'f2',
    title: '法脈圓通，修行之時',
    verse: [
      '清淡蔬食滋養神魂',
      '五穀雜糧穩固根基',
      '不假外求身心自如',
      '福報已在腸胃之間'
    ],
    advice: [
      '宜 持續今日餐單',
      '多飲溫潤山泉',
      '靜坐片刻安神'
    ],
    fortuneType: 'blessing'
  },
  {
    id: 'f3',
    title: '情執深重，心緒之結',
    verse: [
      '以食止痛愁上加愁',
      '甜膩入口百苦不解',
      '胃納雖滿心神仍缺',
      '暫歇外物尋回本心'
    ],
    advice: [
      '宜 遠離電子訊號',
      '忌 深夜情緒進食',
      '補充優質蛋白'
    ],
    fortuneType: 'warning'
  },
  {
    id: 'f4',
    title: '天時有序，節律之美',
    verse: [
      '準時進食陰陽平衡',
      '不躁不急脾胃悠歸',
      '日常點滴皆是修行',
      '長此以往百病不侵'
    ],
    advice: [
      '宜 睡覺前四小時禁食',
      '忌 暴飲暴食',
      '早起飲一杯暖水'
    ],
    fortuneType: 'blessing'
  },
  {
    id: 'f5',
    title: '燥火上升，急功近利',
    verse: [
      '重口油膩灼燒內府',
      '雖得瞬息感官之愉',
      '難換久長生理之安',
      '此乃透支身體之兆'
    ],
    advice: [
      '宜 搭配涼性蔬果',
      '忌 辛辣刺激',
      '飲用微溫淡茶'
    ],
    fortuneType: 'warning'
  },
  {
    id: 'f6',
    title: '氣形合一，神清氣爽',
    verse: [
      '輕盈入口通達經絡',
      '不偏不倚適可而止',
      '今日所食皆為良藥',
      '行住坐臥自在無礙'
    ],
    advice: [
      '宜 維持目前頻率',
      '宜 分享快樂食緒',
      '深呼吸納入真氣'
    ],
    fortuneType: 'blessing'
  },
  {
    id: 'f7',
    title: '陰霾未散，空洞之困',
    verse: [
      '求不得中執著外象',
      '味同嚼蠟神魂缺位',
      '此餐非食乃是抗爭',
      '接受脆弱方得圓滿'
    ],
    advice: [
      '宜 尋找摯友傾訴',
      '忌 獨自進食宵夜',
      '聽清香古琴之音'
    ],
    fortuneType: 'warning'
  },
  {
    id: 'f8',
    title: '繁瑣過境，簡約之道',
    verse: [
      '雜亂無度損耗元神',
      '速成之物缺法自然',
      '向內觀照簡化日常',
      '自有一番天地氣量'
    ],
    advice: [
      '宜 簡化料理流程',
      '宜 慢速細嚼三十下',
      '忌 狼吞虎嚥'
    ],
    fortuneType: 'normal'
  }
];
