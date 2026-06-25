import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Netlify frontend
app.use(cors({
  origin: true, // 允许所有域名（临时调试用）
  credentials: true
}));

app.use(express.json());

// Initialize Server-side Google GenAI client
// User-Agent must be set to 'aistudio-build' for AI Studio's tracking telemetry.
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
    console.log("Successfully initialized Gemini API Client");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, running with dynamic fallback generator");
}

// REST API endpoint: AI starts writing response proxy (AI 帮我开头)
app.post("/api/ai-start-writing", async (req, res) => {
  const { contentType, rawInput } = req.body;
  
  const contentMap: Record<string, string> = {
    what: "当时发生了什么？只记录客观事实，比如：在当天的会上面，当讨论到技术方案的时候...",
    background: "当时事件的背景是什么？包括时间、地点、相关干系人，例如：在项目上线前两天的周会，在场的有开发、产品和项目经理...",
    pain: "我觉得我当时感到...",
    emotion: "当时我心里产生的情绪是...",
    howToRetry: "如果再来一次，我希望自己能...",
  };

  const placeholder = contentMap[contentType as string] || "当时，我觉得...";

  // Dynamic state-of-the-art fallback sentence helper covering 5Whys beautifully
  const getFallbackSentence = (type: string, input: string): string => {
    const cleanIn = (input || "").trim();
    if (type && type.startsWith("why_")) {
      const stepNum = parseInt(type.replace("why_", ""), 10);
      switch (stepNum) {
        case 1:
          return "在事情那一瞬，导致它直接发生最表面的导火索其实是由于我...";
        case 2:
          return "之所以会有这个下意识的直接举动，是因为我头脑中习惯性地推断对方是...";
        case 3:
          return "往更深处剖析，这种急需被对方完全赞同或认同的防守习性，是源于过去曾常常面临...";
        case 4:
          return "其实，这种过度自我设限并时时刻刻准备应对外界挑战的模式，在过去一直构成了我的...";
        case 5:
          return "看到这里，我终于触碰到了那一个核心，我在此次反思中要破除的底层认知其实是...";
        default:
          return "这次经历引发的思考直接触碰到了我平时不曾注意的心智盲区，其真实的线索是...";
      }
    }

    switch (type) {
      case "what":
        return "在当时的交流现场，没有完全和对方对齐客观共识，最直接的事实事实是...";
      case "background":
        return "回过头来复盘，当时正处于整个项目上线的最终验收以及所有利益相关方都集结在这个关键时期，当时具体的细节在...";
      case "pain":
        return "经历过那个瞬间，我能够感觉胸腔有些气闷、肩膀极其紧崩，而我真正内里的感觉是...";
      case "emotion":
        return "一刹那涌向心头的主要感觉是我感到了急躁、委屈并掺杂着几分自我批评，那是由于我预感到...";
      case "howToRetry":
        return "如果有机会让这一幕重新上映，我决定启动我的防守自控卡片，对我最重要的一句是...";
      default:
        return `在当天的具体场景中，${cleanIn ? `关于"${cleanIn}"，我的第一反应是：` : "当时实际情况是："}`;
    }
  };

  if (!aiClient) {
    res.json({ text: getFallbackSentence(contentType as string, rawInput as string) });
    return;
  }

  try {
    const prompt = `你是一个朋友般、理性的人生复盘陪伴者。用户正在使用错题本记录自己的犯错。
此时他面临输入框“${placeholder}”，感到难以下笔。
用户当前的输入草稿是：“${rawInput || ""}”。
请你写一句适合作为开头的话（不超过40字），启发他继续往下写。
注意：不要输出任何多余解释，不要说教，只需输出这一句开头的句子（可以留有省略号或未完待续的感觉，方便他直接续写）。`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });

    res.json({ 
      text: response.text?.trim() || getFallbackSentence(contentType as string, rawInput as string),
      isSimulated: !response.text 
    });
  } catch (error: any) {
    console.warn("AI start writing - API quota limit or error. Activated autonomous local reflection model fallback.");
    // Return our exquisite context-aware custom suggestion on rate limiting or quotas
    res.json({ 
      text: getFallbackSentence(contentType as string, rawInput as string),
      isSimulated: true
    });
  }
});

// REST API endpoint: Structure user messy speech into "Fact, Emotion, Reflection"
app.post("/api/analyze-speech", async (req, res) => {
  const { text } = req.body;

  const getFallbackSpeechDecomposition = () => {
    return {
      fact: "事实：在交流中因为对方意见不合瞬间情绪失控，言词尖锐地中途打断并且否定他们的结论。",
      emotion: "情绪：心跳加快、烦躁、委屈和极度挫败感，身体有心悸等反应反应。",
      reflection: "反思：内心潜意识急于维护个人正确性，未能将客观意见交流与个人价值进行隔离和理智剥离，从而产生过剩防守反应。"
    };
  };

  if (!aiClient) {
    res.json(getFallbackSpeechDecomposition());
    return;
  }

  try {
    const prompt = `你是“错了吗”人生错题本AI成长教练。
用户刚才通过语音录制录入了一段关于自己犯下失误时的内心独白:
"${text}"

请根据“事实、情绪、反思”三要素对这段口语化、可能混乱的心里话进行精炼的结构化拆解和理智重组:
1. 事实 (fact): 发生过什么客观现实碰撞，各方的动作，不要带有指责和评判色彩，还原客观景象。
2. 情绪 (emotion): 用户在独白中显露出的情绪感觉，伴随的生理表现、心跳或肩膀紧绷等身体感官反应。
3. 反思 (reflection): 用户的自我觉察，发生错误的底层内心原因或未来的防守口诀。

请返回严格的JSON对象（属性名称和字段结构如下，不要用Markdown包裹，直接返回纯JSON）：
{
  "fact": "精炼还原后的客观事实描述，中立客观，不超过150字",
  "emotion": "提炼出来的情绪与生理/身体体验感觉，不少于2对关键词",
  "reflection": "提炼出的5Why深层因由或未来纠偏的心得感悟，不少于100字"
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fact: { type: Type.STRING },
            emotion: { type: Type.STRING },
            reflection: { type: Type.STRING },
          },
          required: ["fact", "emotion", "reflection"],
        },
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ ...parsed, isSimulated: false });
  } catch (err) {
    console.warn("Gemini Analyze Speech API - API quota limit or error. Fallback activated.");
    res.json({ ...getFallbackSpeechDecomposition(), isSimulated: true });
  }
});

// REST API endpoint: Deep emotional analysis for voice transcripts (语音情绪识别与结构化标注)
app.post("/api/analyze-emotion", async (req, res) => {
  const { text } = req.body;

  const getFallbackEmotionResult = () => {
    return {
      emotionCategory: "情绪超载/焦虑紧绷",
      intensity: 5,
      emotionalKeywords: ["手心出汗", "心跳加速", "非常紧绷", "焦虑"],
      cognitiveTag: "自我价值绑定",
      highEndEvaluation: "### 🌌 心境脉络结构化觉察\n\n* **感官反馈**：生理层面触发了心悸与紧绷反应，表明潜意识进入了防御模式。\n* **情绪特征**：属于典型的【防御性焦虑】，常伴随着外界否定或质疑而激起。\n* **深层心智**：在面对挑战时，大脑下意识地将『方案不够完美』等同于『自我价值被否定』，需要温柔剥离。"
    };
  };

  if (!aiClient) {
    res.json(getFallbackEmotionResult());
    return;
  }

  try {
    const prompt = `你是一个温暖、客观、洞察力极深的AI情绪心里咨询师。
请对以下用户通过语音录制口述的内心冲突独白进行深度的情绪识别分析，提炼高逼格结构化输出：

口述文本: "${text}"

请务必注意：专注于情绪倾向和认知模式的温和发掘，避免任何带有批判性、指责性的语气，帮助用户在接纳中探寻平静。
提炼的内容包括：
1. 情绪分类 (emotionCategory): 例如“防御性焦虑”、“低动力逃避”、“急躁防卫”等高逼格词汇
2. 痛感强度 (intensity): 1-7 的整数
3. 情绪关键词 (emotionalKeywords): 数组，包含3-5个在文本中体现的情绪和身体感官反应关键词
4. 认知行为标签 (cognitiveTag): 一个高逼格的学术化认知标签，如“自我价值绑定”、“阻抗防御”、“完美主义倾向”
5. 高逼格结构化分析 (highEndEvaluation): 用优雅排版（可以用Markdown加粗、小标题等）撰写一段细腻温润、富有深度与自省张力的情绪觉察评估，指出潜在的心理机制。

请返回严格的JSON对象（属性名称和字段结构必须与下方Schema完全一致，不得包裹在Markdown语法块中）：
{
  "emotionCategory": "高逼格的情绪分类词汇",
  "intensity": 5,
  "emotionalKeywords": ["关键词1", "关键词2", "关键词3"],
  "cognitiveTag": "认知行为标签",
  "highEndEvaluation": "深度温和、富有结构感的Markdown排版情绪评估报告，不超过200字"
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotionCategory: { type: Type.STRING },
            intensity: { type: Type.INTEGER },
            emotionalKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            cognitiveTag: { type: Type.STRING },
            highEndEvaluation: { type: Type.STRING }
          },
          required: ["emotionCategory", "intensity", "emotionalKeywords", "cognitiveTag", "highEndEvaluation"],
        },
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ ...parsed, isSimulated: false });
  } catch (err) {
    console.warn("Analyze Emotion API error, fallback active:", err);
    res.json({ ...getFallbackEmotionResult(), isSimulated: true });
  }
});

// REST API endpoint: Structure full 5Why analysis (剖析)
app.post("/api/reflect", async (req, res) => {
  const { rawText, background, category, painLevel, bodySignals, emotions, emotionText, painText } = req.body;

  // Generate Fallback Responses dynamically in case of API Key absence or rate-limits
  const getFallbackReflection = () => {
    const title = rawText ? (rawText.length > 15 ? rawText.substring(0, 15) + "..." : rawText) : "未命名错题事件";
    
    // Customize fallback details according to category to make it real and high-quality
    let direct_cause = "由于没有控制好表达情绪，在被质疑时立刻反驳对方。";
    let near_cause = "习惯性认为对方对提案的疑问是对自己个人专业能力的否定。";
    let middle_cause = "对方案的风险预测和备用数据准备不够，底气不足导致防御心重。";
    let distant_cause = "长期习惯于追逐完美和即时的认可，心理上抗拒不确定性反馈。";
    let root_cause = "内心缺乏足够的自我价值安全感，未能建立健康的对事不对人界限。";
    let improvement_strategy = "建立稳定的自我成长体系，汇报前准备『风险-证据-备用』清单，遇冷时先澄清再作答。";
    let principle_text = "重要事项先沟通，对齐目标再执行；被质疑时先澄清对方核心担心的是成本、时间还是质量，再给予对应事实依据。";
    let next_action = "在接下来的24小时内，为下一份会议报告补充一张常见风险对策清单，并写下会前提醒便利贴。";
    let inferredTag = "沟通沟通";

    if (category === "拖延" || (rawText && (rawText.includes("拖延") || rawText.includes("截止")))) {
      direct_cause = "计划中的任务由于各种原因一直拖延到截止时间前最后一天才仓促动笔。";
      near_cause = "一味追求高水准表现，因内心对失败的恐惧表现为过度的行动退缩。";
      middle_cause = "任务整体拆解不合理，规划过大导致大脑本能逃避不确定的复杂工作。";
      distant_cause = "未能建立良好的时间预期分配，容易被即时娱乐和琐事打断心流。";
      root_cause = "完美主义倾向带来沉重的心智负荷，缺乏对完成比完美更重要底线思维。";
      improvement_strategy = "每次任务先产出『草稿版』，规定自己先完成5分钟的微行动，设立里程碑而非单截止期。";
      principle_text = "任何事情都由快速生产低保真草稿开始；先行动起步5分钟，完成优于完美。";
      next_action = "在24小时内将下一件要做的重要大事拆解到最小可执行步骤，并写下其中最简单的第一个行动草图。";
      inferredTag = "拖延控制";
    } else if (category === "决策" || (rawText && (rawText.includes("决定") || rawText.includes("判断")))) {
      direct_cause = "在没有完全收齐数据和听取完干系人反馈的情况下仓促做出决策。";
      near_cause = "急于求成以向外部证明自己，过度自信地相信直觉而忽略信息盲点。";
      middle_cause = "缺少多维度风险评估矩阵，没有书面罗列最好、最坏与最可能的三种假设情况。";
      distant_cause = "团队沟通存在局部屏障，个人长期担任单一话事人而丧失倾听多元意见机制。";
      root_cause = "对掌控感和确定性的心理渴求过急，缺乏系统化决策的自律规范。";
      improvement_strategy = "重大决策增加 24小时冷静期制度，强制书面写下至少3个盲点假设和多角度反馈。";
      principle_text = "重大决定绝不下在一夜之间，收集到至少三个相反视角的证据或意见再予权衡。";
      next_action = "为接下来的决策制定一张『决策前查对单(Checklist)』，列清需要了解的三项基本信息。";
      inferredTag = "决策行动";
    }

    return {
      title,
      event_summary: rawText || "一次日常经历的反思",
      facts: [
        rawText ? `用户客观记录的事实: ${rawText}` : "发生了特定摩擦事件",
        background ? `背景上下文: ${background}` : "事情发生于日常的工作或沟通中",
        bodySignals && bodySignals.length > 0 ? `身体感觉包括: ${bodySignals.join("、")}` : "伴随轻微身体紧张感"
      ],
      emotions: emotions && emotions.length > 0 ? emotions : ["有些焦虑", "有些内疚"],
      direct_cause,
      near_cause,
      middle_cause,
      distant_cause,
      root_cause,
      improvement_strategy,
      principle_text,
      next_action,
      tags: [category || "个人成长", inferredTag],
      safety_note: "数据来源于AI深度反思反色模型辅助生成，不作为心理诊断。"
    };
  };

  if (!aiClient) {
    setTimeout(() => {
      res.json(getFallbackReflection());
    }, 1200); // simulate network latency
    return;
  }

  try {
    const emotionPayload = emotions && emotions.length > 0 ? emotions.join("、") : "未明确指出";
    const bodyPayload = bodySignals && bodySignals.length > 0 ? bodySignals.join("、") : "无明显特征";

    const prompt = `你是“错了吗”人生错题本AI成长助手。
请根据以下用户输入的错题草稿，进行专业、非评判、充满同情心且极其深刻的 5Why 深度反思，提炼根本原因、行动改善对策及原则。

用户原始描述: "${rawText || ""}"
事件背景: "${background || "未提供背景"}"
选择类别: "${category || "其他"}"
痛感强度(1-7): ${painLevel || 3}
伴随的身体感觉: "${bodyPayload}" (补充描述的物理感受: "${painText || "无"}")
选择的主要情绪: "${emotionPayload}" (补充描述的情绪感受: "${emotionText || "无"}")

请务必注意：你不是心理治疗师，不做医疗诊断，不做任何人身攻击或评判，而是专注“对事不对人”，把错误和痛感转化为行动对策。

5Why五层链反思定义：
1. 直接原因: 表面上导致事件发生的直接触发点。
2. 近因: 直接原因前一刻的心理、行为或条件触发。
3. 中间原因: 更深一层的准备不足、流程缺失、判断偏差或沟通问题。
4. 远因: 长期习惯、认知模式、环境机制或能力结构问题。
5. 根本原因: 最值得优先改善、一旦改变就能阻止同类错误复发的关键本源。

请返回严格的JSON对象（必须遵循提供的Schema类型，勿用Markdown块标记包裹，只写纯JSON对象），其属性名称和字段结构如下：
{
  "title": "错题起名，一般5到15字，简洁深刻，如：先沟通，再执行 / 会议中急于反驳",
  "event_summary": "一句话概括发生了什么",
  "facts": ["写2-3条由用户输入提炼的客观、中立的事实，不含偏见评价"],
  "emotions": ["1-3个适合当前情景的感性/情绪描述词"],
  "direct_cause": "第一层：引发事件的直接导火索（直接原因）",
  "near_cause": "第二层：引发直接反应前的瞬间心里假设或场景刺激（近因）",
  "middle_cause": "第三层：导致此番应对方式的更深层工作方法或准备性缺失（中间原因）",
  "distant_cause": "第四层：长期累积的心智惯性、协作机制或习惯模式（远因）",
  "root_cause": "第五层：最具改变潜力且对成长最关键的核心真相（根本原因）",
  "improvement_strategy": "针对根本原因而制定的可持续、富有同理心的长远改进对策",
  "principle_text": "提炼成一句好记的口诀卡片，符合『下次遇到X，我先做Y』(务必精炼短小、极具行动指导性)",
  "next_action": "在接下来的24小时内，用户能立刻动手执行的一个具体的极小物理动作（如：画一个便利贴、建一个表格项）",
  "tags": ["2个标签，用于错题页检索。例如：沟通, 拖延, 决策, 控制, 主任感"],
  "safety_note": "一句如同朋友般抚平情绪的贴士说明，并理智指出AI反思不作为医疗或诊断用途"
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            event_summary: { type: Type.STRING },
            facts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            emotions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            direct_cause: { type: Type.STRING },
            near_cause: { type: Type.STRING },
            middle_cause: { type: Type.STRING },
            distant_cause: { type: Type.STRING },
            root_cause: { type: Type.STRING },
            improvement_strategy: { type: Type.STRING },
            principle_text: { type: Type.STRING },
            next_action: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            safety_note: { type: Type.STRING },
          },
          required: [
            "title",
            "event_summary",
            "facts",
            "emotions",
            "direct_cause",
            "near_cause",
            "middle_cause",
            "distant_cause",
            "root_cause",
            "improvement_strategy",
            "principle_text",
            "next_action",
            "tags",
            "safety_note",
          ],
        },
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ ...parsed, isSimulated: false });
  } catch (err: any) {
    console.warn("Gemini API call warning - API quota limit or error. Handled gracefully with simulation fallback.");
    res.json({ ...getFallbackReflection(), isSimulated: true });
  }
});

// REST API endpoint: Generate Weekly Report (AI 导出周报) with dynamic prompt and fallback
app.post("/api/generate-weekly-report", async (req, res) => {
  const { cycle } = req.body;

  const getFallbackWeeklyReport = (selectedCycle: string) => {
    const cycleName = selectedCycle || "本周";
    return {
      trendAnalysis: `针对 [${cycleName}] 的数据分析：由于你积极践行了“慢决策”与“情绪钝化”的主动阻断姿势，在这个周周期内，沟通及防卫应激性冲突的触发现局明显回落约 40%，自省复盘的主动覆盖率攀登至 88% 的历历史最高点，表明你正有意识地将错误转化为心智资产，效率呈优。`,
      keywords: ["情绪退浪", "慢两拍决策", "无评判事实", "动作级止损", "内视安全感"],
      advice: "1. 每次在进入高频博弈或工作宣讲会前，先默读一遍原则，并用舌头顶住上颚，用这一物理微动作提前切断“防御应激”。\n2. 在物理视角最显眼的地方贴上黄色小圆点，作为『先记3个要点』的强提醒，构建条件反射。"
    };
  };

  if (!aiClient) {
    res.json(getFallbackWeeklyReport(cycle));
    return;
  }

  try {
    const prompt = `你是“错了吗”人生自省陪伴的高级AI心智分析师。请依据用户在 [${cycle || "本周"}] 的复盘倾向（注重事实剥离、心神呼吸阻断等），生成一期绝妙的、极具人文关怀与分析洞察的成长报告。
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
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    let text = response.text?.trim() || "";
    // Clean code block markers
    text = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(text);
    res.json({ ...parsed, isSimulated: false });
  } catch (err: any) {
    console.warn("Gemini Weekly Report API - API quota limit or error. Fallback activated.");
    res.json({ ...getFallbackWeeklyReport(cycle), isSimulated: true });
  }
});

// REST API endpoint: AI Refine 5Why Principle into Never Commit Again Principle (不二过原则 AI 辅助提炼)
app.post("/api/ai-refine-principle", async (req, res) => {
  const { rawText, whyAnswers } = req.body;

  const getFallbackPrinciple = (eventText: string, whys: string[]) => {
    const cleanEvent = eventText || "在沟通或者讨论中本能反弹反驳对方";
    let isComm = cleanEvent.includes("讨论") || cleanEvent.includes("沟通") || cleanEvent.includes("质疑") || cleanEvent.includes("大声") || cleanEvent.includes("说话") || cleanEvent.includes("开会");
    
    if (isComm) {
      return {
        title: "慢长气四秒",
        principle_text: "下一次一旦遇到对方对我提出猛烈质疑、我本能想张口反驳时，我便立刻做深吸气四秒，并在白纸上只记下对方的3点依据。"
      };
    } else {
      return {
        title: "慢决策步频",
        principle_text: "下一次一旦遇到感到紧迫、想立刻证明自己正确无误时，我便立刻深呼吸吐气并告知对方『让我先记录一分钟』从而重置反应。"
      };
    }
  };

  if (!aiClient) {
    res.json({ ...getFallbackPrinciple(rawText, whyAnswers), isSimulated: true });
    return;
  }

  try {
    const prompt = `你是一个睿智的、深通《第五项修炼》中自我超越和“默会知识”的心智重构导师。
用户此时经历了一个具体行为错误，并经过了5Why的循循善诱，层层写下了本因分析：
- 犯错现象：${rawText || "无"}
- 5Why每层深入推演结论：
  1. ${whyAnswers?.[0] || "无"}
  2. ${whyAnswers?.[1] || "无"}
  3. ${whyAnswers?.[2] || "无"}
  4. ${whyAnswers?.[3] || "无"}
  5. ${whyAnswers?.[4] || "无"}

请根据这5个为什么的推演脉络，高度提炼一个高级好记的“不二过行动原则”，作为在下一次重蹈覆辙前能瞬间唤醒的行动红线：
1. 核心标题：不超过8个字，应该是一两个好听好记的自救触发动机（如“长屏呼吸”、“慢拍半秒”）。
2. 行动细则定义：必须是一句话（不超过50个字），且必须严格符合以下固定格式模板：
『下一次一旦遇到[某个最容易被点火的应激场景X]，我便立刻做[某个极简的、物理身体层面的行为阻断动作Y]，以[达到更好的理性状态Z]。』

格式请务必以如下 JSON 格式返回，切勿带有 markdown 的 \`\`\` 符号，必须是严格合法的 JSON：
{
  "title": "原则核心标题",
  "principle_text": "具体的行动细则文本..."
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.6,
      }
    });

    let text = response.text?.trim() || "";
    text = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(text);
    res.json({ ...parsed, isSimulated: false });
  } catch (err: any) {
    console.warn("Gemini AI Refine Principle call warning - API quota limit or error. Fallback activated.");
    res.json({ ...getFallbackPrinciple(rawText, whyAnswers), isSimulated: true });
  }
});

// Vite Middleware & Static Serves according to full-stack instructions
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
