import { GoogleGenAI, Type } from "@google/genai";
import { Fortune } from "../constants";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

const MOCK_ANALYSIS = {
  code: "MPLR",
  title: "續命九尾型",
  creature: "九尾狐",
  main_title: "肉香鎮魂，麵線續命",
  poem: ["牛肉補其力，", "熱湯定其心，", "疲人勿再戰，", "早睡勝萬金。"],
  should_do: "宜：補水、慢食、伸懶腰",
  should_not_do: "忌：空腹咖啡、加班、滑手機到深夜",
  analysis: "你不是只想吃重口味，而是在替疲累的身體找一個可以被接住的方式。"
} as const;

const getMockFortune = (recordData?: any): Fortune => {
  const mood = recordData?.mood || "平靜";
  const food = recordData?.foodEmoji || "這一餐";
  const context = recordData?.context || "日常";
  const bodyFeeling = recordData?.bodyFeeling || "尚可";
  const isHeavyMood = ["焦慮", "煩躁", "空虛", "後悔"].includes(mood);
  const isRepairMood = ["被安撫", "滿足", "平靜", "有精神"].includes(mood);

  return {
    id: `mock-${Date.now()}`,
    title: isHeavyMood ? `夜火未熄，${food}暫鎮心潮` : isRepairMood ? `${food}入腹，微光歸位` : MOCK_ANALYSIS.main_title,
    verse: [
      `${food}為舟，載你過潮`,
      `${context}之下，胃先應劫`,
      `${mood}未必是錯，只是太晚`,
      `${bodyFeeling}有聲，明日宜和`
    ],
    advice: [
      isHeavyMood ? "宜：先補溫水，再慢慢吃完" : "宜：維持節奏，七分飽即可",
      isHeavyMood ? "忌：邊焦慮邊續杯咖啡" : "忌：吃完立刻久坐不動",
      `解讀：你吃的不是單一食物，而是當下想被接住的感受。關鍵詞：${food}・${mood}・${context}`
    ],
    fortuneType: isHeavyMood ? "warning" : isRepairMood ? "blessing" : "normal"
  };
};

const getAIClient = (): GoogleGenAI | null => {
  if (!geminiApiKey) return null;
  return new GoogleGenAI({ apiKey: geminiApiKey });
};

const LETTER_NAME_MAP = {
  M: "魂",
  P: "魄",
  N: "野",
  H: "煞",
  L: "靈",
  R: "曆",
  V: "幻"
} as const;

const toMBEIName = (code: string) => {
  const [d1, d2, d3, d4] = code.split("");
  return `${LETTER_NAME_MAP[d1 as keyof typeof LETTER_NAME_MAP] ?? "魂"}・${LETTER_NAME_MAP[d2 as keyof typeof LETTER_NAME_MAP] ?? "煉"}・${LETTER_NAME_MAP[d3 as keyof typeof LETTER_NAME_MAP] ?? "靈"}・${LETTER_NAME_MAP[d4 as keyof typeof LETTER_NAME_MAP] ?? "曆"}`;
};

export async function generateAIFortune(recordData: any): Promise<Fortune> {
  const ai = getAIClient();
  if (!ai) {
    return getMockFortune(recordData);
  }

  const { mealType, foodType, mood, bodyFeeling, context, mbeiCode, foodEmoji } = recordData;

  const prompt = `
你是「食緒解籤」AI。請根據使用者輸入的食物與情境做動態分析，不可套固定案例。
輸入：食物/情境=${foodEmoji}，餐別=${mealType}，餐後心情=${mood}，身體感受=${bodyFeeling}，當下情境=${context}。

請輸出 JSON，需同時包含：
1) 比例分析（每維度兩端總和=100）：
 - dim1: M vs P
 - dim2: N vs P
 - dim3: H vs L
 - dim4: R vs V
2) mbei_code（各維度較大值字母組成）
3) fortune（國風但現代、溫柔且有一點黑色幽默）：
 - title
 - verse（四句）
 - suitable（三條）
 - avoid（三條）
 - interpretation
 - mental_repair_value
 - physical_burden_value
 - balance_type
 - aftercare（三條）
 - one_liner

請確保不同輸入會得到不同結果。只輸出 JSON。
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            input: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                dim1: { type: Type.OBJECT, properties: { M: { type: Type.NUMBER }, P: { type: Type.NUMBER } }, required: ["M", "P"] },
                dim2: { type: Type.OBJECT, properties: { N: { type: Type.NUMBER }, P: { type: Type.NUMBER } }, required: ["N", "P"] },
                dim3: { type: Type.OBJECT, properties: { H: { type: Type.NUMBER }, L: { type: Type.NUMBER } }, required: ["H", "L"] },
                dim4: { type: Type.OBJECT, properties: { R: { type: Type.NUMBER }, V: { type: Type.NUMBER } }, required: ["R", "V"] }
              },
              required: ["dim1", "dim2", "dim3", "dim4"]
            },
            mbei_code: { type: Type.STRING },
            mbei_code: { type: Type.STRING },
            fortune: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                verse: { type: Type.ARRAY, items: { type: Type.STRING } },
                suitable: { type: Type.ARRAY, items: { type: Type.STRING } },
                avoid: { type: Type.ARRAY, items: { type: Type.STRING } },
                interpretation: { type: Type.STRING },
                mental_repair_value: { type: Type.NUMBER },
                physical_burden_value: { type: Type.NUMBER },
                balance_type: { type: Type.STRING },
                aftercare: { type: Type.ARRAY, items: { type: Type.STRING } },
                one_liner: { type: Type.STRING }
              },
              required: ["title", "verse", "suitable", "avoid", "interpretation", "mental_repair_value", "physical_burden_value", "balance_type", "aftercare", "one_liner"]
            }
          },
          required: ["input", "scores", "mbei_code", "fortune"]
        }
      }
    });

    const data = JSON.parse(response.text);
    const computedCode = data?.mbei_code || "MPLR";
    const computedName = toMBEIName(computedCode);
    const scores = data?.scores;
    const h = Number(scores?.dim3?.H ?? data?.fortune?.physical_burden_value ?? 50);
    const m = Number(scores?.dim1?.M ?? data?.fortune?.mental_repair_value ?? 50);
    const v = Number(scores?.dim4?.V ?? 50);
    const suitable = Array.isArray(data?.fortune?.suitable) ? data.fortune.suitable.slice(0, 3) : [];
    const avoid = Array.isArray(data?.fortune?.avoid) ? data.fortune.avoid.slice(0, 3) : [];
    const aftercare = Array.isArray(data?.fortune?.aftercare) ? data.fortune.aftercare.slice(0, 3) : [];
    const advice = [
      ...suitable.map((item: string) => `宜：${item}`),
      ...avoid.map((item: string) => `忌：${item}`),
      ...aftercare.map((item: string) => `善後：${item}`),
      data?.fortune?.one_liner ? `收尾：${data.fortune.one_liner}` : "",
      `解讀：${data?.fortune?.interpretation || "這餐在安撫你，也在提醒你。"}｜${computedCode} ${computedName}`
    ].filter(Boolean).slice(0, 10);

    const verse = Array.isArray(data?.fortune?.verse) && data.fortune.verse.length
      ? data.fortune.verse.slice(0, 4)
      : [
          `此餐判作 ${computedCode}`,
          `心身各半自有由`,
          `今夜留白三分醒`,
          `明朝再與胃言和`
        ];

    return {
      id: `ai-${Date.now()}`,
      title: data?.fortune?.title || `${foodEmoji || "這一餐"} · ${computedName}`,
      verse,
      advice,
      fortuneType: h >= 70 ? "warning" : m >= 70 ? "blessing" : (v >= 65 ? "warning" : "normal")
    };
  } catch (error) {
    console.error("Gemini Fortune Error:", error);
    return getMockFortune(recordData);
  }
}
