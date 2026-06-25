import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// 环境变量（在 Vercel 上配置）
const apiKey = process.env.GEMINI_API_KEY;

// Fallback 数据（当 API 无法访问时使用）
const getFallbackWeeklyReport = (selectedCycle: string) => {
  const cycleName = selectedCycle || "本周";
  return {
    trendAnalysis: `针对 [${cycleName}] 的数据分析：由于你积极践行了"慢决策"与"情绪钝化"的主动阻断姿势，在这个周周期内，沟通及防卫应激性冲突的触发现局明显回落约 40%，自省复盘的主动覆盖率攀登至 88% 的历历史最高点，表明你正有意识地将错误转化为心智资产，效率呈优。`,
    keywords: ["情绪退浪", "慢两拍决策", "无评判事实", "动作级止损", "内视安全感"],
    advice: "1. 每次在进入高频博弈或工作宣讲会前，先默读一遍原则，并用舌头顶住上颚，用这一物理微动作提前切断"防御应激"。\n2. 在物理视角最显眼的地方贴上黄色小圆点，作为『先记3个要点』的强提醒，构建条件反射。"
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cycle } = req.body;

  // 如果没有配置 API Key，返回 fallback 数据
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.log('No valid GEMINI_API_KEY found, using fallback data');
    return res.json({ ...getFallbackWeeklyReport(cycle), isSimulated: true });
  }

  try {
    const aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `你是"错了吗"人生自省陪伴的高级AI心智分析师。请依据用户在 [${cycle || "本周"}] 的复盘倾向（注重事实剥离、心神呼吸阻断等），生成一期绝妙的、极具人文关怀与分析洞察的成长报告。
请生成三个内容：
1. 错题趋势分析：一小段话，总结近期失误发生并得到理智复盘的自愈走向。
2. 反思关键词云图：输出 5 个反映这一阶段心智成长、充满哲学或行动主义美感的短词（如：慢决策、情绪防卫等）。
3. 行动改进建议：提出 2 点极具物理操作性、可以立刻练习的微动作建议（如：用手触碰手腕、贴纸提示引导）。

请严格遵循以下 JSON 架构进行返回，不要带有 \`\`\`json 标记，只要纯净的 valid JSON String：
{
  "trendAnalysis": "一小段绝妙生动的分析文字...",
  "keywords": ["词1", "词2", "词3", "词4", "词5"],
  "advice": "行动建议的多行拼接文本..."
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    let text = response.text?.trim() || "";
    // 清理代码块标记
    text = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    
    const parsed = JSON.parse(text);
    return res.json({ ...parsed, isSimulated: false });
  } catch (err: any) {
    console.error("Gemini Weekly Report API Error:", err);
    // 返回 fallback 数据
    return res.json({ ...getFallbackWeeklyReport(cycle), isSimulated: true });
  }
}
