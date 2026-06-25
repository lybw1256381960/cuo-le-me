// 反思分析 API（JavaScript 版本）
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
    return res.status(500).json({ error: 'Failed to generate reflection' });
  }
};
