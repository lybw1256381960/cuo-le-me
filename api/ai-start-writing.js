// AI 写作辅助 API（JavaScript 版本）
const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
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
    return res.status(500).json({ error: 'Failed to generate text' });
  }
};
