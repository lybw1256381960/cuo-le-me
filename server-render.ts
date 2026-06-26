// 纯 API 服务器（用于 Render 部署）
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { registerAppStateRoutes } from "./server/appStateStore";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 10000;

// 启用 CORS（允许所有域名）
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: "2mb" }));
registerAppStateRoutes(app);

// 初始化 Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: any = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("✅ Successfully initialized Gemini API Client");
  } catch (err) {
    console.error("❌ Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("⚠️ No valid GEMINI_API_KEY found, running with fallback data");
}

// 健康检查端点
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Cuo Le Me API is running!" });
});

// AI 写作辅助 API
app.post("/api/ai-start-writing", async (req, res) => {
  if (!aiClient) {
    return res.status(500).json({ error: "Gemini API not initialized" });
  }

  try {
    const { mistake, emotion, awareness, principle } = req.body;

    const prompt = `你是一位资深的心智成长教练。基于以下信息，帮助用户开始写作自省日记：

错题描述：${mistake || "无"}
情绪状态：${emotion || "无"}
觉察洞察：${awareness || "无"}
改进原则：${principle || "无"}

请生成一段引导性的开头文字（100-150字），帮助用户深入反思。`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.8,
      }
    });

    const text = response.text?.trim() || "";
    return res.json({ text });
  } catch (err) {
    console.error("AI Start Writing API Error:", err);
    return res.status(500).json({ error: "Failed to generate text" });
  }
});

// 情绪分析 API
app.post("/api/analyze-emotion", async (req, res) => {
  if (!aiClient) {
    return res.status(500).json({ error: "Gemini API not initialized" });
  }

  try {
    const { text } = req.body;

    const prompt = `分析以下文本的情绪状态，给出情绪标签和强度（0-10）：

${text || "无内容"}

请返回 JSON 格式：
{
  "emotion": "情绪标签（如：愤怒、焦虑、平静、沮丧等）",
  "intensity": 7,
  "analysis": "简短分析（50字以内）"
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.5,
      }
    });

    let text_response = response.text?.trim() || "";
    text_response = text_response.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    
    const parsed = JSON.parse(text_response);
    return res.json(parsed);
  } catch (err) {
    console.error("Analyze Emotion API Error:", err);
    return res.status(500).json({ error: "Failed to analyze emotion" });
  }
});

// 反思分析 API
app.post("/api/reflect", async (req, res) => {
  if (!aiClient) {
    return res.status(500).json({ error: "Gemini API not initialized" });
  }

  try {
    const { content } = req.body;

    const prompt = `你是一位专业的心智成长教练。请分析以下自省日记，给出深度的反思反馈和改进建议（200-300字）：

${content || "无内容"}

请从以下几个角度分析：
1. 觉察深度：用户对自己错误的认识有多深？
2. 情绪模式：是否存在重复的情绪反应模式？
3. 改进方向：给出具体可行的改进建议。`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 400,
        temperature: 0.7,
      }
    });

    const text = response.text?.trim() || "";
    return res.json({ reflection: text });
  } catch (err) {
    console.error("Reflect API Error:", err);
    return res.status(500).json({ error: "Failed to generate reflection" });
  }
});

// 周报生成 API
app.post("/api/generate-weekly-report", async (req, res) => {
  // Fallback 数据
  const getFallbackWeeklyReport = (selectedCycle: string) => {
    const cycleName = selectedCycle || "本周";
    return {
      trendAnalysis: `针对 [${cycleName}] 的数据分析：由于你积极践行了"慢决策"与"情绪钝化"的主动阻断姿势，在这个周周期内，沟通及防卫应激性冲突的触发现局明显回落约 40%，自省复盘的主动覆盖率攀登至 88% 的历历史最高点，表明你正有意识地将错误转化为心智资产，效率呈优。`,
      keywords: ["情绪退浪", "慢两拍决策", "无评判事实", "动作级止损", "内视安全感"],
      advice: "1. 每次在进入高频博弈或工作宣讲会前，先默读一遍原则，并用舌头顶住上颚，用这一物理微动作提前切断防御应激。\n2. 在物理视角最显眼的地方贴上黄色小圆点，作为先记3个要点的强提醒，构建条件反射。"
    };
  };

  if (!aiClient) {
    console.log("⚠️ No Gemini API, using fallback data");
    const { cycle } = req.body;
    return res.json({ ...getFallbackWeeklyReport(cycle), isSimulated: true });
  }

  try {
    const { cycle } = req.body;

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
    text = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    
    const parsed = JSON.parse(text);
    return res.json({ ...parsed, isSimulated: false });
  } catch (err) {
    console.error("Gemini Weekly Report API Error:", err);
    const { cycle } = req.body;
    return res.json({ ...getFallbackWeeklyReport(cycle), isSimulated: true });
  }
});

// 启动服务器
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 API endpoints available at /api/*`);
});
