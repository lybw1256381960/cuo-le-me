import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  } catch (err: any) {
    console.error("Analyze Emotion API Error:", err);
    return res.status(500).json({ error: 'Failed to analyze emotion' });
  }
}
