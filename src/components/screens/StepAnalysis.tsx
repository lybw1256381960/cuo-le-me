import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, Plus, Brain, Sparkles, Smile, MessageCircle, Mic, Image, FileText, 
  Camera, Check, Clock, RotateCcw, Pen, Heart, User, Leaf, TrendingUp,
  Activity, Map, Compass, Award, ShieldAlert, AlertCircle, ChevronRight, Zap, Target, BookOpen, ShieldCheck, HeartPulse, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlassIcon from "../GlassIcon";
import { MistakeCategory, MistakeEntry } from "../../types";
import { getPainColorHSL } from "../../utils";
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, Legend
} from "recharts";

interface StepAnalysisProps {
  currentMistake: MistakeEntry | null;
  initialStep?: number;
  onSave: (entry: MistakeEntry) => void;
  onClose: () => void;
}

export default function StepAnalysis({ currentMistake, initialStep, onSave, onClose }: StepAnalysisProps) {
  // Click wave ripples effect state
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const addRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.5;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const newRipple = { id: Date.now() + Math.random(), x, y, size };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 850);
  };

  const renderButtonRipples = () => {
    return ripples.map((rip) => (
      <span
        key={rip.id}
        className="absolute bg-white/40 rounded-full animate-ripple pointer-events-none"
        style={{
          left: rip.x,
          top: rip.y,
          width: rip.size,
          height: rip.size,
        }}
      />
    ));
  };

  // Wizard steps: 1 to 6 are the PRD screenshots. 
  // Step 7 is 5Why Reflection. Step 8 is Improvement (改善对策). Step 9 is Create Principle Card (新建原则卡). Step 10 is Save Success.
  const [step, setStep] = useState<number>(initialStep || 1);
  const [showGrowthAtlasDetail, setShowGrowthAtlasDetail] = useState<boolean>(false);
  const [category, setCategory] = useState<MistakeCategory>(currentMistake?.category || MistakeCategory.COMMUNICATION);
  
  // Form inputs
  const [rawText, setRawText] = useState(currentMistake?.rawText || "");
  const [background, setBackground] = useState(currentMistake?.background || "");
  const [painLevel, setPainLevel] = useState<number>(currentMistake?.painLevel || 4);
  const [painText, setPainText] = useState("");
  const [bodySignals, setBodySignals] = useState<string[]>(currentMistake?.bodySignals || []);
  const [bodyText, setBodyText] = useState("");
  const [emotions, setEmotions] = useState<string[]>(currentMistake?.emotions || []);
  const [emotionText, setEmotionText] = useState("");
  const [retryText, setRetryText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; url: string; type: string; file: File }[]>(currentMistake?.attachments || []);

  // Loading/AI result states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // 5Why answers (allows user editing layer by layer as in Screenshot 3)
  const [whyAnswers, setWhyAnswers] = useState<string[]>(["", "", "", "", ""]);
  const [whyStep, setWhyStep] = useState<number>(1);

  // AI opening helpers loading state
  const [aiOpeningLoading, setAiOpeningLoading] = useState<string | null>(null);
  const [isRefiningPrinciple, setIsRefiningPrinciple] = useState<boolean>(false);

  // New Principle Card custom inputs for absolute 1:1 matching of Screenshot 2
  const [triggerSceneInput, setTriggerSceneInput] = useState("技术方案汇报受到质疑，大声切入讨论并感到心跳加快时");
  const [warningSignalInput, setWarningSignalInput] = useState("心跳加快、语速变快、忍不住想要进行反击和口头强突辩解");
  const [nextActionInput, setNextActionInput] = useState("在接下来的24h内，在工作台或显示器右侧贴上『先倾听，记要点，再结论』的便利贴提示");
  const [reminderTimeInput, setReminderTimeInput] = useState("20:00");
  const [reminderDateInput, setReminderDateInput] = useState("2026-06-12 (周五)");

  // Speech Recognition states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [listeningStep, setListeningStep] = useState<number | null>(null);

  // New Principle Card Tags State
  const [principleTags, setPrincipleTags] = useState<string[]>([]);
  const hasInitializedTagsRef = useRef(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (hasInitializedTagsRef.current) return;
    if (currentMistake?.tags && currentMistake.tags.length > 0) {
      setPrincipleTags(currentMistake.tags);
      hasInitializedTagsRef.current = true;
    } else if (analysisResult?.tags && analysisResult.tags.length > 0) {
      setPrincipleTags(analysisResult.tags);
      hasInitializedTagsRef.current = true;
    } else if (analysisResult !== null) {
      setPrincipleTags(["决策推演", "情绪锚定", "职场生存", "自我价值"]);
      hasInitializedTagsRef.current = true;
    }
  }, [currentMistake, analysisResult]);

  const startSpeechRecognition = (index: number) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("抱歉，您的浏览器或当前环境暂不支持 Web Speech API 语音识别。建议使用 Chrome 浏览器。");
      return;
    }

    if (isListening) {
      setIsListening(false);
      setListeningStep(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setListeningStep(index);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setListeningStep(null);
        if (event.error === "not-allowed") {
          alert("麦克风访问未获授权 🎙️\n\n1. 请检查并确保浏览器地址栏或系统设置中已允许该页面的麦克风权限。\n2. 如果您在预览窗格中使用，由于浏览器安全策略限制，请点击页面右上角在新标签页中打开应用，再进行语音自省录入。");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setListeningStep(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const arr = [...whyAnswers];
          const currentText = arr[index] || "";
          arr[index] = currentText ? (currentText + " " + transcript) : transcript;
          setWhyAnswers(arr);
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setListeningStep(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files).map((file: File) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        file: file
      }));
      setAttachedFiles(prev => [...prev, ...newFiles]);
      event.target.value = ''; // Clear the input value
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  // Constants
  const emojisList = [
    { value: 1, label: "😇", labelText: "几乎无感" },
    { value: 2, label: "😊", labelText: "微麻" },
    { value: 3, label: "🙂", labelText: "隐痛" },
    { value: 4, label: "😐", labelText: "痛" },
    { value: 5, label: "😟", labelText: "很痛" },
    { value: 6, label: "😡", labelText: "剧痛" },
    { value: 7, label: "😫", labelText: "极度痛苦" }
  ];

  const bodyChips = ["头痛", "肩颈紧张", "胸口闷", "心悸", "胃部不适", "呼吸急促", "手心出汗", "头晕", "睡眠不好", "其他"];
  
  const emotionGrid = [
    { name: "焦虑" },
    { name: "愤怒" },
    { name: "沮丧" },
    { name: "内疚" },
    { name: "失望" },
    { name: "无助" },
    { name: "平静" },
    { name: "害怕" },
    { name: "开心" },
    { name: "尴尬" },
    { name: "释然" },
    { name: "其他" }
  ];



  const uploadMethods = [
    { icon: Camera, label: "拍照", desc: "记录现场", bgClass: "bg-[#EAF8F1]", colorClass: "text-[#10B981]", method: "camera" },
    { icon: Image, label: "相册", desc: "选择图片", bgClass: "bg-[#EFF6FF]", colorClass: "text-[#3B82F6]", method: "album" },
    { icon: FileText, label: "文件", desc: "添加文件", bgClass: "bg-[#FFF7ED]", colorClass: "text-[#F97316]", method: "file" },
    { icon: Mic, label: "语音", desc: "语音转文字", bgClass: "bg-[#FAF5FF]", colorClass: "text-[#A855F7]", method: "voice" },
  ];

  // Helper for gorgeous emotion pastels
  const getEmotionColorInfo = (name: string, isSel: boolean) => {
    const list: Record<string, { bg: string, text: string, border: string, activeBg: string, activeBorder: string }> = {
      "焦虑": { bg: "bg-[#FFF1F2]", text: "text-[#E11D48]", border: "border-[#FFE4E6]", activeBg: "bg-[#FFE4E6]", activeBorder: "border-[#FB7185]" },
      "愤怒": { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", border: "border-[#FFEDD5]", activeBg: "bg-[#FFEDD5]", activeBorder: "border-[#F97316]" },
      "沮丧": { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", border: "border-[#DBEAFE]", activeBg: "bg-[#DBEAFE]", activeBorder: "border-[#60A5FA]" },
      "内疚": { bg: "bg-[#FEFCE8]", text: "text-[#CA8A04]", border: "border-[#FEF9C3]", activeBg: "bg-[#FEF9C3]", activeBorder: "border-[#FACC15]" },
      "失望": { bg: "bg-[#F8FAFC]", text: "text-[#475569]", border: "border-[#F1F5F9]", activeBg: "bg-[#F1F5F9]", activeBorder: "border-[#94A3B8]" },
      "无助": { bg: "bg-[#FAF5FF]", text: "text-[#9333EA]", border: "border-[#F3E8FF]", activeBg: "bg-[#F3E8FF]", activeBorder: "border-[#C084FC]" },
      "平静": { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", border: "border-[#DCFCE7]", activeBg: "bg-[#DCFCE7]", activeBorder: "border-[#4ADE80]" },
      "害怕": { bg: "bg-[#F5F3FF]", text: "text-[#7D3CE9]", border: "border-[#EDE9FE]", activeBg: "bg-[#EDE9FE]", activeBorder: "border-[#A78BFA]" },
      "开心": { bg: "bg-[#FFFDF0]", text: "text-[#CA9504]", border: "border-[#FFF9C4]", activeBg: "bg-[#FFF9C2]", activeBorder: "border-[#FAD02C]" },
      "尴尬": { bg: "bg-[#FDF2F8]", text: "text-[#DB2777]", border: "border-[#FCE7F3]", activeBg: "bg-[#FCE7F3]", activeBorder: "border-[#F472B6]" },
      "释然": { bg: "bg-[#F0FDFA]", text: "text-[#0D9488]", border: "border-[#CCFBF1]", activeBg: "bg-[#CCFBF1]", activeBorder: "border-[#2DD4BF]" },
      "其他": { bg: "bg-[#F8F9FA]", text: "text-[#6B7280]", border: "border-[#E5E7EB]", activeBg: "bg-[#E5E7EB]", activeBorder: "border-[#9CA3AF]" },
    };
    const def = list[name] || list["其他"];
    return isSel 
      ? `${def.activeBg} ${def.text} ${def.activeBorder} scale-102 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-2 font-black`
      : `${def.bg} ${def.text} ${def.border} opacity-85 hover:opacity-100 border`;
  };

  // Helper for dynamic step orbs
  const getStepIconAndStyles = (s: number) => {
    switch (s) {
      case 1:
        return {
          icon: Pen,
          color: "text-[#10B981]",
          bg: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(254, 250, 224, 0.6) 40%, rgba(187, 247, 208, 0.5) 75%, rgba(191, 219, 254, 0.3) 100%)",
          blurGlow: "rgba(16, 185, 129, 0.12)"
        };
      case 2:
        return {
          icon: Sparkles,
          color: "text-[#63D197]",
          bg: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(254, 250, 224, 0.65) 45%, rgba(167, 243, 208, 0.5) 75%, rgba(191, 219, 254, 0.25) 100%)",
          blurGlow: "rgba(99, 209, 151, 0.14)"
        };
      case 3:
        return {
          icon: Heart,
          color: "text-[#22C55E]",
          bg: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(254, 250, 224, 0.6) 40%, rgba(187, 247, 208, 0.5) 75%, rgba(191, 219, 254, 0.3) 100%)",
          blurGlow: "rgba(34, 197, 94, 0.12)"
        };
      case 4:
        return {
          icon: User,
          color: "text-[#10B981]",
          bg: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(254, 250, 224, 0.6) 40%, rgba(187, 247, 208, 0.5) 75%, rgba(191, 219, 254, 0.3) 100%)",
          blurGlow: "rgba(16, 185, 129, 0.12)"
        };
      case 5:
        return {
          icon: Smile,
          color: "text-[#1EBE70]",
          bg: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(254, 250, 224, 0.65) 45%, rgba(167, 243, 208, 0.5) 75%, rgba(255, 237, 213, 0.3) 100%)",
          blurGlow: "rgba(99, 209, 151, 0.11)"
        };
      case 6:
      default:
        return {
          icon: Leaf,
          color: "text-[#10B981]",
          bg: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(254, 250, 224, 0.6) 40%, rgba(187, 247, 208, 0.55) 75%, rgba(191, 219, 254, 0.35) 100%)",
          blurGlow: "rgba(16, 185, 129, 0.12)"
        };
    }
  };

  const renderOrb = (s: number) => {
    const info = getStepIconAndStyles(s);
    const IconComponent = info.icon;
    return (
      <div className="relative w-28 h-28 mx-auto mt-4 mb-2 flex items-center justify-center select-none active:scale-105 transition-all duration-300">
        {/* Underlying shadow trail */}
        <div className="absolute -bottom-1 w-16 h-3 bg-stone-950/5 rounded-full blur-[4px]" />
        
        {/* Ethereal background aura halo */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse-gently transition-colors duration-500" 
          style={{ backgroundColor: info.blurGlow }}
        />
        
        {/* 3D Sphere Container */}
        <div 
          className="w-24 h-24 rounded-full relative flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.04),inset_0_-4px_12px_rgba(255,255,255,0.9),inset_0_4px_12px_rgba(255,255,255,0.4)] border border-white/60 overflow-hidden"
          style={{ background: info.bg }}
        >
          {/* Soft dynamic inner highlights */}
          <div className="absolute top-1.5 left-3 w-8 h-4 rounded-full bg-white/45 blur-[1.5px] rotate-[-25deg]" />
          <div className="absolute top-1 left-1.5 w-4 h-4 rounded-full bg-white/50 blur-[0.5px]" />
          <div className="absolute bottom-1.5 right-3 w-5 h-5 rounded-full bg-white/20 blur-[1px]" />
          
          {/* Core Icon */}
          <div className="relative z-10 p-4 rounded-full bg-white/35 backdrop-blur-[2px] shadow-[inset_0_1px_3px_rgba(255,255,255,0.5),0_4px_10px_rgba(0,0,0,0.02)]">
            <IconComponent className={`w-8 h-8 ${info.color} stroke-[2.2]`} />
          </div>
        </div>
      </div>
    );
  };

  // Constants

  // AI "Start writing" helper logic via server route
  const handleStartWriting = async (type: string, currentVal: string, setVal: (v: string) => void) => {
    setAiOpeningLoading(type);
    try {
      const response = await fetch("/api/ai-start-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: type, rawInput: currentVal }),
      });
      const data = await response.json();
      if (data.text) {
        setVal(data.text + (currentVal ? `\n${currentVal}` : ""));
      }
    } catch (err) {
      console.error(err);
      setVal("当时实际情况是..." + currentVal);
    } finally {
      setAiOpeningLoading(null);
    }
  };

  const [selectedTriggerIdx, setSelectedTriggerIdx] = useState<number>(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(5);

  const renderGrowthAtlasDetail = () => {
    const radarData = [
      { subject: '情绪调节', A: 85, B: 50, fullMark: 100 },
      { subject: '5Why原因析因', A: 90, B: 40, fullMark: 100 },
      { subject: '自我接纳', A: 80, B: 60, fullMark: 100 },
      { subject: '反思沉淀度', A: 95, B: 30, fullMark: 100 },
      { subject: '原则内化', A: 85, B: 25, fullMark: 100 },
      { subject: '痛点复原率', A: 88, B: 55, fullMark: 100 },
    ];

    const defenseData = [
      { name: '否认承认', pct: 85, fill: '#10B981' },
      { name: '责任投射', pct: 60, fill: '#34D399' },
      { name: '合理化辩解', pct: 90, fill: '#059669' },
      { name: '情绪自谴', pct: 45, fill: '#F59E0B' },
      { name: '良性重构', pct: 95, fill: '#10B981' },
    ];

    const lineData = [
      { 
        day: '第1天', 
        clarity: 40, 
        defenseCount: 8, 
        principleCount: 0,
        milestone: '首次标记心智抗拒',
        tags: ["肢体心动过速", "下意识否定"],
        principle: '『不二过认知基石建立』：允许不快情绪穿透，客观真实记录身体发紧与对抗本能。'
      },
      { 
        day: '第5天', 
        clarity: 55, 
        defenseCount: 6, 
        principleCount: 2,
        milestone: '突破防御性自我美化',
        tags: ["归因环境推卸", "高墙防卫"],
        principle: '『5Why 自省主线』：彻底隔离环境干扰，真实写明“是我这里产生了脆弱的防御”。'
      },
      { 
        day: '第10天', 
        clarity: 68, 
        defenseCount: 4, 
        principleCount: 5,
        milestone: '设计级别系统安全隔断',
        tags: ["辩解执念", "沟通习惯磨损"],
        principle: '『红线双重复核准则』：从工程/看板设计上进行拦截隔离，而不纯依靠意志力死抗。'
      },
      { 
        day: '第15天', 
        clarity: 76, 
        defenseCount: 3, 
        principleCount: 8,
        milestone: '良性重构与倾听代偿',
        tags: ["反差反应急躁", "情绪急剧升温"],
        principle: '『倾听阻断代偿』：被斥责时不秒回，用深呼吸3秒代偿，笔头写下受批评里的含金点。'
      },
      { 
        day: '第20天', 
        clarity: 82, 
        defenseCount: 2, 
        principleCount: 11,
        milestone: '如实照见、情绪零负载',
        tags: ["自责内耗", "否定负向叙事"],
        principle: '『视挫败为脑电信号』：将失败视为客观系统的良性调试码，停止“我很无能”等标签连带。'
      },
      { 
        day: '第25天', 
        clarity: 88, 
        defenseCount: 1, 
        principleCount: 14,
        milestone: '高阶觉照与自省合一',
        tags: ["隐性认知微粒漏检", "接纳迭代乐感"],
        principle: '『系统完全承受者』：撤除抗拒防御机制！不惧暴露短板，视现实流每一次暴击为成长给养。'
      }
    ];

    const conversionData = [
      {
        trigger: "遭他人当众异议/驳斥",
        oldReaction: "心率暴增、高音量辩解或急于辩护，认为对方在故意否定自己。",
        wisePrinciple: "『倾听代偿原则』：先腹式呼吸3秒。本子上记录对方讲的3个要点，等对方讲完，用‘我听懂你说的点是...，这给我启发’正面迎接，再探讨细节。",
        emotionalTag: "防卫机制：分裂 / 否认",
        wiseTag: "心智升级：真诚倾听 & 自我抽离",
        bg: "from-amber-500/5 to-orange-500/0",
        border: "border-amber-500/20",
        pillsBg: "bg-amber-100/80 text-amber-950 hover:bg-amber-100"
      },
      {
        trigger: "由于个人疏密导致出错/被批评",
        oldReaction: "本能反应是指出环境因素、同事协作延迟、电脑卡顿以求消灭负罪感。",
        wisePrinciple: "『5Why 认领原则』：不找任何外部因素。首条原则写下‘我是系统的完全承受者，如何从设计上提前10天验证’。",
        emotionalTag: "防卫机制: 合理化 / 逃跑",
        wiseTag: "心智升级：系统防错 & 极致担当",
        bg: "from-emerald-500/5 to-teal-500/0",
        border: "border-emerald-500/20",
        pillsBg: "bg-emerald-100/80 text-emerald-950 hover:bg-emerald-100"
      },
      {
        trigger: "当任务搁浅或内心受挫",
        oldReaction: "长时间自沉在情绪内耗中，指责自己无能，失去后续跟进能量。",
        wisePrinciple: "『不思善恶，如实照见』：视痛苦为一种客观发生的生物电信号。痛感上升时，立刻不带判别地归总为一条新的行动条，3分钟内启动第一步。",
        emotionalTag: "防卫机制: 压抑 / 情绪自谴",
        wiseTag: "心智升级：良性复原力 & 微粒量化",
        bg: "from-indigo-500/5 to-purple-500/0",
        border: "border-indigo-500/20",
        pillsBg: "bg-indigo-100 text-indigo-950"
      }
    ];

    const activeConv = conversionData[selectedTriggerIdx];

    const activeDay = (selectedDayIdx !== null && selectedDayIdx >= 0 && selectedDayIdx < lineData.length) ? lineData[selectedDayIdx] : null;

    return (
      <div className="w-full flex-1 flex flex-col animate-[fade-in_0.4s_cubic-bezier(0.16,1,0.3,1)] font-sans space-y-6">
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-5 select-none bg-white/40 p-1.5 rounded-full border border-stone-200/40 backdrop-blur-sm sticky top-0 z-40">
          <button
            onClick={() => {
              setShowGrowthAtlasDetail(false);
            }}
            className="flex items-center gap-1.5 text-[11px] font-black text-[#1E3F39] hover:bg-stone-100 active:scale-95 transition-all px-3.5 py-1.5 rounded-full cursor-pointer bg-white shadow-xs border border-stone-200/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回反思复盘</span>
          </button>
          
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-[#5B6B67] font-black">第25天成长观测机</span>
          </div>
        </div>

        {/* Overview Header Section */}
        <motion.div 
          layout 
          transition={{ type: "spring", stiffness: 200, damping: 25 }} 
          className="bg-gradient-to-br from-[#1E3F39] to-[#0A1614] text-[#EAF8F1] rounded-[28px] p-6 relative overflow-hidden shadow-lg border border-stone-800 mb-6 flex flex-col gap-4.5"
        >
          <div className="absolute top-[-30px] right-[-20px] w-48 h-48 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
          
          {/* Title and Intro Area */}
          <div className="space-y-2 text-left relative z-10 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest bg-emerald-500 text-stone-900 px-2 py-0.5 rounded-md shrink-0">
                A.I. 认知多维建模
              </span>
              <span className="text-[9.5px] font-extrabold tracking-wide text-amber-300 shrink-0">
                心智成熟比物理年龄更美妙
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white font-display">自我迭代成长图谱</h2>
            <p className="text-[11.5px] text-stone-300/90 font-bold leading-relaxed w-full">
              你的防卫本能发生频度下降了 <span className="text-emerald-300 font-extrabold">32%</span>，反思析因穿透度提升了 <span className="text-emerald-300 font-extrabold">45%</span>。认知心智开始由“本能拒认”迈向“接纳迭代”新境界。
            </p>
          </div>

          {/* Clean separation divider */}
          <div className="h-px w-full bg-white/10 relative z-10" />

          {/* Mental Maturity Badge - Stacking vertically below the main info rather than squeezed side-by-side */}
          <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-left shadow-inner backdrop-blur-xs flex items-center justify-between gap-4 relative z-10 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-300 border border-amber-500/20 shrink-0">
                <GlassIcon emoji="💎" size="xs" />
              </div>
              <div>
                <div className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">心智成熟度评分 (ClM Score)</div>
                <div className="text-3xl font-black text-amber-300 mt-0.5 font-display flex items-baseline gap-1">
                  88<span className="text-xs text-stone-300 font-bold">pt</span>
                </div>
              </div>

              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="p-4.5 bg-white/65 backdrop-blur-lg border border-white/45 rounded-[32px] shadow-sm space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-black text-[11px] flex items-center justify-center">
                      附件
                    </span>
                    <h3 className="text-[13.5px] font-black text-[#1E3F39]">
                      已附加文件 ({attachedFiles.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {attachedFiles.map((file, index) => (
                      <div key={file.name + index} className="relative group overflow-hidden rounded-lg border border-stone-200 shadow-sm">
                        {file.type.startsWith('image/') ? (
                          <img src={file.url} alt={file.name} className="w-full h-24 object-cover" />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-stone-100 text-stone-500 text-xs font-semibold p-2 text-center break-all">
                            <FileText className="w-6 h-6 mr-1" />
                            {file.name}
                          </div>
                        )}
                        <button
                          onClick={() => handleRemoveFile(file.name)}
                          className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-500 text-stone-950 px-3 py-1 rounded-full shrink-0 shadow-sm">
              阶段 A+ • 高阶觉照
            </span>
          </div>
        </motion.div>

        {/* Bento Grid visualizations */}
        <div className="grid grid-cols-1 gap-5 mb-6">
          {/* Box 1: Radar Chart */}
          <motion.div 
            layout 
            transition={{ type: "spring", stiffness: 180, damping: 24 }} 
            className="bg-white/95 border border-stone-200/50 rounded-[28px] p-5 shadow-sm text-left flex flex-col h-[320px]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-100 animate-pulse shrink-0">
                  <Compass className="w-3.8 h-3.8 shrink-0" />
                </div>
                <div>
                  <h3 className="text-[13px] font-black text-[#1E3F39]">心智六维拓扑平衡</h3>
                  <p className="text-[9.5px] text-stone-400 font-bold">对比你的基线期与当前心智模型</p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 8 }} />
                  <Radar name="今日我" dataKey="A" stroke="#059669" fill="#10B981" fillOpacity={0.25} />
                  <Radar name="基线期" dataKey="B" stroke="#9CA3AF" fill="#D1D5DB" fillOpacity={0.15} />
                  <Tooltip wrapperStyle={{ fontSize: '10px', fontFamily: 'sans-serif' }} />
                  <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 700 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Box 2: Defense Mechanism Melt Rate BarChart */}
          <motion.div 
            layout 
            transition={{ type: "spring", stiffness: 180, damping: 24 }} 
            className="bg-white/95 border border-stone-200/50 rounded-[28px] p-5 shadow-sm text-left flex flex-col h-[320px]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 border border-amber-100 shrink-0">
                  <ShieldAlert className="w-3.8 h-3.8 shrink-0" />
                </div>
                <div>
                  <h3 className="text-[13px] font-black text-[#1E3F39]">防御机制瓦解指数</h3>
                  <p className="text-[9.5px] text-stone-400 font-bold">5Why促使底层自卫变白、借口开脱消退率</p>
                </div>
              </div>
              <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-200/40 font-black px-1.5 py-0.5 rounded-md shrink-0">
                平均消退 75%
              </span>
            </div>

            <div className="flex-1 min-h-0 w-full relative pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defenseData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 8 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#4B5563', fontSize: 9, fontWeight: 700 }} width={90} />
                  <Tooltip wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="pct" radius={[0, 8, 8, 0]} name="消退百分比(%)">
                    {defenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] text-[#8E8575] font-semibold mt-1 italic text-center">
              * 指数值越高，代表在遭遇挫败时自我美化、推卸指责的下意识抗拒愈加融化。
            </p>
          </motion.div>
        </div>

        {/* Section 3: Interactive Trigger Transformer Panel */}
        <motion.div 
          layout 
          transition={{ type: "spring", stiffness: 180, damping: 24 }} 
          className="bg-white/90 border border-stone-200/50 rounded-[28px] p-5.5 shadow-sm text-left mb-6"
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-150 shrink-0">
              <Zap className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />
            </div>
            <div>
              <h3 className="text-[13.5px] font-black text-[#1E3F39]">心智实做：本能到原则重写实验</h3>
              <p className="text-[10px] text-stone-400 font-bold">点击不同警钟触发器，看破防御性思维，体验当下升维</p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {conversionData.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTriggerIdx(idx)}
                className={`text-[10px] lg:text-[11px] font-extrabold px-3 py-2.5 rounded-xl border transition-all text-center leading-normal cursor-pointer flex items-center justify-center gap-1 ${
                  selectedTriggerIdx === idx
                    ? "bg-[#1E3F39] text-white border-[#1E3F39] shadow-inner font-black"
                    : "bg-stone-50 hover:bg-stone-100 text-[#5B6B67] border-stone-200/50"
                }`}
              >
                <GlassIcon emoji="⚡" size="xs" />
                <span>{item.trigger}</span>
              </button>
            ))}
          </div>

          {/* Interactive Flow visualizer card */}
          <motion.div 
            layout 
            transition={{ type: "spring", stiffness: 160, damping: 22 }} 
            className={`rounded-2xl border p-4.5 bg-gradient-to-br ${activeConv.bg} ${activeConv.border} transition-all duration-300`}
          >
            <div className="grid grid-cols-1 gap-4">
              {/* Box A: Default defense reaction */}
              <motion.div layout className="bg-white/85 rounded-xl p-4 border border-stone-200/20 flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="text-[10px] text-red-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    昔日本能防御 (旧我反应)
                  </div>
                  <span className={`text-[9px] font-extrabold ${activeConv.pillsBg} px-1.5 py-0.5 rounded shrink-0`}>
                    {activeConv.emotionalTag}
                  </span>
                </div>
                <p className="text-[11.5px] text-stone-600 font-semibold leading-relaxed">
                  {activeConv.oldReaction}
                </p>
              </motion.div>

              {/* Box B: Wise action principle */}
              <motion.div layout className="bg-white/95 rounded-xl p-4 border border-emerald-500/20 shadow-xs flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    自省重塑原则 (不二法则)
                  </div>
                  <span className="text-[9.5px] font-bold text-emerald-950 bg-emerald-150 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    {activeConv.wiseTag}
                  </span>
                </div>
                <p className="text-[12px] text-stone-900 font-black leading-relaxed">
                  {activeConv.wisePrinciple}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 4: Growth curve and timeline */}
        <div className="grid grid-cols-1 gap-5 text-left mb-4">
          <motion.div 
            layout 
            transition={{ type: "spring", stiffness: 180, damping: 24 }} 
            className="bg-white/95 border border-stone-200/50 rounded-[28px] p-5 shadow-sm flex flex-col min-h-[295px]"
          >
            <div className="flex flex-wrap justify-between items-start gap-2 mb-1.5">
              <div>
                <h3 className="text-[13px] font-black text-[#1E3F39]">心智进化演变曲线 (Evolution Horizon)</h3>
                <p className="text-[9.5px] text-stone-400 font-bold">自省清晰度提升与每日残余自卫防御数对照</p>
              </div>
              <span className="text-[9px] text-[#059669] font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/30 flex items-center gap-1">
                <GlassIcon emoji="💡" size="xs" /> 触碰/点击曲线关键转折点可悬浮探照病因与原则
              </span>
            </div>
            
            <div className="flex-1 min-h-[160px] w-full relative pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={lineData} 
                  margin={{ top: 12, right: 12, left: -25, bottom: 5 }}
                  onClick={(state) => {
                    if (state && state.activeTooltipIndex !== undefined) {
                      setSelectedDayIdx(state.activeTooltipIndex);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="colorClarity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 8 }} />
                  <Tooltip wrapperStyle={{ fontSize: '10px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="clarity" 
                    name="心智清澈分" 
                    stroke="#10B981" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorClarity)"
                    dot={{ r: 5, strokeWidth: 1.5, stroke: '#10B981', fill: '#FFFFFF', cursor: 'pointer' }}
                    activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2.5, fill: '#1E3F39', cursor: 'pointer' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="defenseCount" 
                    name="自卫防御值" 
                    stroke="#EF4444" 
                    strokeWidth={1.5} 
                    fillOpacity={0}
                    dot={{ r: 4, strokeWidth: 1, stroke: '#EF4444', fill: '#FFFFFF', cursor: 'pointer' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="principleCount" 
                    name="沉淀原则数" 
                    stroke="#3B82F6" 
                    strokeWidth={1.5} 
                    fillOpacity={0}
                    dot={{ r: 4, strokeWidth: 1, stroke: '#3B82F6', fill: '#FFFFFF', cursor: 'pointer' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 700, marginTop: '5px' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Click interactive custom floating overlay sheet panel inside the card */}
            <AnimatePresence mode="wait">
              {activeDay && (
                <motion.div
                  key={activeDay.day}
                  initial={{ opacity: 0, height: 0, y: 15 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -15 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="mt-4 p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 backdrop-blur-xs text-left overflow-hidden flex flex-col gap-2.5 relative"
                >
                  <div className="absolute top-2 right-2 flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedDayIdx(null); }}
                      className="text-stone-400 hover:text-stone-700 text-xs font-black p-1 hover:bg-stone-100 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[9.5px] font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">
                        {activeDay.day} 转折点
                      </span>
                    </div>
                    <span className="text-[11.5px] font-black text-[#1E3F39] mr-5 flex items-center gap-1">
                      <GlassIcon emoji="📈" size="xs" /> {activeDay.milestone}
                    </span>
                  </div>

                  {/* Mistakes tags / Pathology */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] text-[#8E8575] font-black uppercase tracking-wider select-none shrink-0 mt-0.5 mr-1">
                      病灶标签:
                    </span>
                    {activeDay.tags && Array.isArray(activeDay.tags) && activeDay.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className={`text-[9.5px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200/40 shrink-0 flex items-center gap-0.5 ${
                          tIdx === 1 ? "inline-flex w-[67.7px] ml-[90px] pl-[6px] mt-[7px]" : ""
                        }`}
                      >
                        <GlassIcon emoji="⚠️" size="xs" /> {tag}
                      </span>
                    ))}
                  </div>

                  {/* Core Principle Formulated */}
                  <div className="bg-white/95 p-3 rounded-xl border border-emerald-500/15 shadow-xs">
                    <div className="text-[9.5px] text-emerald-800 font-extrabold uppercase tracking-wide mb-1 flex items-center gap-1 leading-none">
                      <GlassIcon emoji="💡" size="xs" />
                      <span>核心重塑原则</span>
                    </div>
                    <p className="text-[11px] text-[#1E3F39] font-black leading-relaxed">
                      {activeDay.principle}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>


          <div className="bg-gradient-to-br from-[#FFFDFB] to-[#FAF8F5] border border-stone-200/50 rounded-[28px] p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-[13px] font-black text-[#1E3F39]">心智破局进化记录</h3>
              </div>

              {/* Stacked timeline checkpoints */}
              <div className="space-y-2.5">
                {lineData.map((item, idx) => {
                  const isSelected = selectedDayIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDayIdx(idx)}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                        isSelected 
                          ? "bg-emerald-500/10 border-emerald-500/30 shadow-xs" 
                          : "bg-transparent border-transparent hover:bg-stone-100/60"
                      }`}
                    >
                      <div className="flex flex-col items-center mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center shrink-0 border-2 ${
                          isSelected ? "bg-emerald-500 border-emerald-500 animate-pulse" : "bg-white border-stone-450"
                        }`} />
                        {idx !== lineData.length - 1 && (
                          <div className={`w-0.5 h-11 mt-1 ${isSelected ? "bg-emerald-500/30" : "bg-stone-300"}`} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10.5px] font-black uppercase tracking-wider ${
                            isSelected ? "text-emerald-800" : "text-[#8E8575]"
                          }`}>
                            {item.day === '第1天' ? 'Day 1' : 
                             item.day === '第5天' ? 'Day 5' : 
                             item.day === '第10天' ? 'Day 10' : 
                             item.day === '第15天' ? 'Day 15' : 
                             item.day === '第20天' ? 'Day 20' : 'Day 25'}
                          </span>
                          <span className="text-[9px] text-stone-400 font-bold">{item.milestone}</span>
                        </div>
                        <p className={`text-[10.5px] mt-0.5 leading-relaxed ${
                          isSelected ? "text-stone-900 font-black" : "text-stone-600 font-bold"
                        }`}>
                          {item.day === '第1天' ? '启动不二过手记，首次真实标记肢体心跳、心率加速与痛感等级。' :
                           item.day === '第5天' ? '突破“防御借口高墙”，承认错误并撰写首个 5Why 原因链结构图。' :
                           item.day === '第10天' ? '在逻辑与流程设计中实现隔断拦截，重要代码引入双核看板。' :
                           item.day === '第15天' ? '在怒气升腾那一刻，成功践行『倾听阻断代偿』深呼吸，理智提取核心建议点。' :
                           item.day === '第20天' ? '如实照见挫败信号。视痛苦为调试脉冲，剥离情绪里的自谴和负罪叙事。' :
                           '已归总沉淀 14 条原则卡。内化合一，卸防空杯，把暴击换作主动迭代的最佳给养！'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setShowGrowthAtlasDetail(false);
              }}
              className="mt-4 w-full py-2.5 bg-[#1E3F39] text-white text-[11px] font-black rounded-xl hover:bg-emerald-950 active:scale-98 transition-all shadow-xs cursor-pointer"
            >
              已完全理解，继续反思自省
            </button>
          </div>
        </div>
      </div>
    );
  };

  // call Gemini reflect full details
  const triggerAIReflect = async () => {
    setIsAnalyzing(true);
    setStep(7); // Jump to 5Why Analysis Panel
    try {
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          background,
          category,
          painLevel,
          bodySignals,
          emotions,
          emotionText,
          painText,
        }),
      });
      const data = await response.json();
      setAnalysisResult(data);
      // Pre-fill user edit state with AI values for the 5Why questionnaire
      setWhyAnswers([
        data.direct_cause || "我急于回应，提高了说话音量。",
        data.near_cause || "我认为小李的方案细节过多，浪费时间。",
        data.middle_cause || "双周方案缺少汇报限制时间标准。",
        data.distant_cause || "自我推崇高效、利落的沟通风格。",
        data.root_cause || "缺乏对沟通对象的耐心敬意和价值安全感。"
      ]);
      if (data.next_action) {
        setNextActionInput(data.next_action);
      }
      if (data.tags && data.tags.length > 0) {
        setTriggerSceneInput(`下次遇到 ${data.tags.join("、")} 等类似高频触发场景并感到防卫性急躁时`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  React.useEffect(() => {
    if (initialStep === 7) {
      triggerAIReflect();
    }
  }, [initialStep]);

  const handleAIRefine = async () => {
    setIsRefiningPrinciple(true);
    try {
      const resp = await fetch("/api/ai-refine-principle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: rawText,
          whyAnswers: whyAnswers,
        }),
      });
      const data = await resp.json();
      if (data) {
        setAnalysisResult({
          ...analysisResult,
          title: data.title || analysisResult?.title || "不二过行动原则",
          principle_text: data.principle_text || analysisResult?.principle_text || "",
        });
      }
    } catch (err) {
      console.error("AI principle refinement failed:", err);
    } finally {
      setIsRefiningPrinciple(false);
    }
  };

  const saveToMistakes = (isPrinciple: boolean) => {
    if (!analysisResult) return;
    const finalEntry: MistakeEntry = {
      id: currentMistake?.id || "m-" + Date.now(),
      rawText: rawText || "一次日常沟通事件的客观记录",
      background,
      category,
      painLevel,
      bodySignals,
      emotions,
      painText,
      emotionText,
      createdAt: currentMistake?.createdAt || new Date().toISOString().substring(0, 16).replace("T", " "),
      status: isPrinciple ? "已生成原则" : "待反思",
      title: analysisResult.title || "技术周会沟通冲突",
      eventSummary: analysisResult.event_summary,
      facts: analysisResult.facts,
      directCause: whyAnswers[0] || analysisResult.direct_cause,
      nearCause: whyAnswers[1] || analysisResult.near_cause,
      middleCause: whyAnswers[2] || analysisResult.middle_cause,
      distantCause: whyAnswers[3] || analysisResult.distant_cause,
      rootCause: whyAnswers[4] || analysisResult.root_cause,
      improvementStrategy: analysisResult.improvement_strategy,
      principleText: analysisResult.principle_text,
      nextAction: nextActionInput,
      triggerScene: triggerSceneInput,
      warningSignal: warningSignalInput,
      hasReminder: isPrinciple || !!currentMistake?.hasReminder,
      tags: principleTags,
      recurrenceLog: currentMistake?.recurrenceLog || [],
      attachments: attachedFiles, // Add attached files
      reminderScene: currentMistake?.reminderScene,
      reminderFrequency: currentMistake?.reminderFrequency,
      reminderTime: currentMistake?.reminderTime,
      enablePush: currentMistake?.enablePush,
      pushTime: currentMistake?.pushTime,
    };
    onSave(finalEntry);
    setStep(10); // 保存成功 screen
  };

  const handleBodySignalsToggle = (signal: string) => {
    if (bodySignals.includes(signal)) {
      setBodySignals(bodySignals.filter((x) => x !== signal));
    } else {
      setBodySignals([...bodySignals, signal]);
    }
  };

  const handleEmotionToggle = (emo: string) => {
    if (emotions.includes(emo)) {
      setEmotions(emotions.filter((x) => x !== emo));
    } else {
      setEmotions([...emotions, emo]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative text-neutral-800">
      {/* Dynamic Background Mesh dependent on stage */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none -z-10 mix-blend-multiply opacity-50 transition-all duration-700">
        {step >= 1 && step <= 4 && <div className="w-full h-full hologram-orb-1 animate-pulse-gently"></div>}
        {step === 5 && <div className="w-full h-full hologram-orb-pain"></div>}
        {step >= 6 && <div className="w-full h-full hologram-orb-success"></div>}
      </div>

      {/* Header Bar */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between bg-transparent sticky top-0 z-45">
        <button 
          onClick={() => {
            if (step === 6.5) {
              setStep(6);
            } else if (step === 7) {
              if (!isAnalyzing) {
                if (whyStep > 1) {
                  setWhyStep(whyStep - 1);
                } else {
                  setStep(6.5);
                }
              }
            } else if (step === 8) {
              setStep(7);
              setWhyStep(5);
            } else if (step === 9) {
              setStep(8);
            } else if (step > 1 && step <= 6) {
              setStep(step - 1);
            } else {
              onClose();
            }
          }} 
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-stone-150 shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:bg-stone-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-stone-700 stroke-[2.5]" />
        </button>
        {step === 6.5 ? (
          <div className="flex-1" />
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] font-bold text-stone-900 leading-none">
                {step <= 6 ? "剖析" : step === 7 ? "5Why 深度反思" : step === 8 ? "改善对策" : step === 10 ? "保存成功" : "新建原则卡"}
              </span>
              {step <= 6 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#EAF8F1] text-[#1EBE70] border border-[#D5F3E4] scale-90">
                  {step}/6
                </span>
              )}
            </div>
            {step <= 6 && (
              <div className="flex items-center gap-1.5 mt-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-305 ${
                      i <= step 
                        ? "w-4 bg-[#63D197]" // active green
                        : "w-4 bg-stone-200/80" // inactive grey
                    }`} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {step === 8 ? (
          <div className="w-10 h-10 flex items-center justify-center text-stone-605 font-bold select-none text-xl mr-2">
            ···
          </div>
        ) : step === 9 ? (
          <button
            onClick={() => alert("预览卡片: " + (analysisResult?.title || "重要事项先沟通，再推进"))}
            className="text-xs font-extrabold text-[#1EBE70] bg-[#EAF8F1] hover:bg-[#D5F3E4] rounded-full px-4 py-2 border border-[#C6F2D6]/50 shadow-3xs hover:brightness-[1.01] active:scale-95 transition-all cursor-pointer mr-1"
          >
            预览
          </button>
        ) : (
          <button className="flex items-center gap-1 text-[13px] font-medium bg-white rounded-full px-3 py-1.5 text-stone-700 shadow-[0_2px_6px_rgba(0,0,0,0.03)] border border-stone-200 hover:bg-stone-50 active:scale-95 transition-all">
            <Clock className="w-4 h-4 text-stone-500" />
            <span>{step === 6.5 ? "历史记录" : "草稿箱"}</span>
          </button>
        )}
      </div>

      {/* Primary Scrollable Content Area */}
      <div className={`flex-1 overflow-y-auto px-6 py-4 flex flex-col ${step === 6.5 && showGrowthAtlasDetail ? "justify-start" : "justify-between"}`}>
        
        {/* ================= STEP 1: WHAT HAPPENED? ================= */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              {renderOrb(1)}

              <div className="text-center mt-5">
                <h2 className="text-xl font-bold font-display text-stone-950 tracking-tight">当时发生了什么？</h2>
                <p className="text-xs text-stone-450 mt-1.5">尽量客观地描述你看到、听到、做了什么。</p>
              </div>

              <div className="mt-6 relative p-5 suspended-frosted-capsule hover:scale-100">
                <div className="breathing-liquid-spot" />
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="点击输入你的描述，如：会议汇报时，听到细节太繁琐心急打断，导致小李窘迫，会场冷场..."
                  maxLength={1000}
                  className="w-full h-36 border-none outline-none resize-none text-sm placeholder-stone-400 text-stone-800 bg-transparent"
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/40">
                  <button
                    onClick={(e) => { addRipple(e); handleStartWriting("what", rawText, setRawText); }}
                    disabled={aiOpeningLoading === "what"}
                    className="text-xs flex items-center gap-1 font-bold bg-white/60 text-[#13B15E] px-3 py-1.5 rounded-full border border-white/60 hover:bg-white/85 relative overflow-hidden"
                  >
                    {renderButtonRipples()}
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {aiOpeningLoading === "what" ? "思考中..." : "AI 帮我开头"}
                  </button>
                  <span className="text-[10px] text-stone-400 font-mono">{rawText.length}/1000</span>
                </div>
              </div>

              {/* Attachments panel */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                {uploadMethods.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={(e) => {
                      addRipple(e);
                      if (item.method === "camera") {
                        cameraInputRef.current?.click();
                      } else if (item.method === "album") {
                        albumInputRef.current?.click();
                      } else if (item.method === "file") {
                        fileInputRef.current?.click();
                      } else if (item.method === "voice") {
                        // Voice input might be handled differently here or not applicable
                      }
                    }}
                    className="bg-white/40 backdrop-blur-md rounded-2xl py-3 border border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center hover:bg-white/60 active:scale-95 transition-all w-full relative overflow-hidden"
                  >
                    {renderButtonRipples()}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 ${item.bgClass}`}>
                      <item.icon className={`w-4 h-4 ${item.colorClass}`} />
                    </div>
                    <span className="text-[12px] font-bold text-stone-850">{item.label}</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <span className="text-xs text-[#13B15E] font-bold flex items-center gap-1 mb-4 select-none">
                <GlassIcon emoji="☘️" size="xs" /> 针对客观事实，不评判、不分析
              </span>
              <button
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(2), 150);
                }}
                disabled={!rawText.trim()}
                className="w-full py-4 rounded-full vone-yellowgreen-btn text-base font-black tracking-wider flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none relative overflow-hidden"
              >
                {renderButtonRipples()}
                下一步
              </button>
              <button 
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(2), 150);
                }} 
                className="mt-3 text-xs text-stone-400 hover:underline py-1 relative overflow-hidden px-4"
              >
                {renderButtonRipples()}
                跳过此问
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CONTEXT BACKGROUND ================= */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              {renderOrb(2)}

              <div className="text-center mt-5">
                <h2 className="text-xl font-bold font-display text-stone-950 tracking-tight">那件事的背景是什么？</h2>
                <p className="text-xs text-stone-450 mt-1.5">时间、地点、当时在场的人或相关情况。</p>
              </div>

              <div className="mt-6 relative p-5 suspended-frosted-capsule hover:scale-100">
                <div className="breathing-liquid-spot" />
                <textarea
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="如：双周技术汇报会，当时有我的直属leader、服务端开发小李以及产品小张在场..."
                  maxLength={500}
                  className="w-full h-32 border-none outline-none resize-none text-sm placeholder-stone-400 text-stone-800 bg-transparent"
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/40">
                  <button
                    onClick={(e) => { addRipple(e); handleStartWriting("background", background, setBackground); }}
                    disabled={aiOpeningLoading === "background"}
                    className="text-xs flex items-center gap-1 font-bold bg-white/60 text-[#13B15E] px-3 py-1.5 rounded-full border border-white/60 hover:bg-white/85 relative overflow-hidden"
                  >
                    {renderButtonRipples()}
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {aiOpeningLoading === "background" ? "思考中..." : "AI 帮我开头"}
                  </button>
                  <span className="text-[10px] text-stone-400 font-mono">{background.length}/500</span>
                </div>
              </div>

              {/* Attachments panel */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                {uploadMethods.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={(e) => addRipple(e)}
                    className="bg-white/40 backdrop-blur-md rounded-2xl py-3 border border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center hover:bg-white/60 active:scale-95 transition-all w-full relative overflow-hidden"
                  >
                    {renderButtonRipples()}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 ${item.bgClass}`}>
                      <item.icon className={`w-4 h-4 ${item.colorClass}`} />
                    </div>
                    <span className="text-[12px] font-bold text-stone-850">{item.label}</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(3), 150);
                }}
                className="w-full py-4 rounded-full vone-yellowgreen-btn text-base font-black tracking-wider flex items-center justify-center gap-1 relative overflow-hidden"
              >
                {renderButtonRipples()}
                下一步
              </button>
              <button 
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(3), 150);
                }} 
                className="mt-3 text-xs text-stone-400 hover:underline py-1 relative overflow-hidden px-4"
              >
                {renderButtonRipples()}
                跳过此问
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PAIN INTENSITY ================= */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              {renderOrb(3)}

              <div className="text-center mt-5">
                <h2 className="text-xl font-bold font-display text-stone-950 tracking-tight">这件事带给你的痛感有多强？</h2>
                <p className="text-xs text-stone-450 mt-1.5 animate-pulse-gently">诚实面对感受，才能真正找到改变的动力。</p>
              </div>

              {/* Slider for Pain Intensity */}
              <div className="mt-8 p-6 suspended-frosted-capsule hover:scale-100 relative overflow-hidden">
                <div className="breathing-liquid-spot" />
                <div className="flex justify-between text-xs text-stone-450 select-none font-bold mb-6">
                  <span>几乎没有痛感 (1)</span>
                  <span>非常痛苦 (7)</span>
                </div>

                <div className="relative py-6 flex items-center select-none">
                  {/* Background horizontal grey connection track */}
                  <div className="absolute inset-x-3.5 h-1.5 bg-stone-200/50 rounded-full z-0 overflow-hidden w-[96%]">
                    {/* Active filled track of the slider bar, using HSL smooth gradient interpolation updated live */}
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((painLevel - 1) / 6) * 100}%`,
                        background: `linear-gradient(to right, ${getPainColorHSL(1).bg}, ${getPainColorHSL(painLevel).bg})`
                      }}
                    />
                  </div>

                  {/* Range input container overlay for seamless touch drag response */}
                  <input 
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={painLevel}
                    onChange={(e) => setPainLevel(Number(e.target.value))}
                    className="absolute inset-0 w-full h-12 opacity-0 cursor-pointer z-35 touch-none"
                  />

                  {/* The points on the track */}
                  <div className="absolute inset-x-0 flex justify-between items-center z-10 w-full pointer-events-none">
                    {emojisList.map((emoji) => {
                      const isSelected = painLevel === emoji.value;
                      const colorInfo = getPainColorHSL(emoji.value);
                      const activeColorInfo = getPainColorHSL(painLevel);

                      return (
                        <div
                          key={emoji.value}
                          className="flex flex-col items-center justify-center select-none w-10 relative cursor-pointer"
                          onClick={() => setPainLevel(emoji.value)}
                        >
                          {/* Floating Emoji Face with beautiful dynamic state */}
                          <div
                            className="relative transition-all duration-300"
                            style={{
                              transform: isSelected ? "translateY(-12px) scale(1.35)" : "none"
                            }}
                          >
                            {isSelected && (
                              <div
                                className="absolute -inset-2.5 rounded-full blur-md opacity-75 -z-10 transition-colors duration-300 animate-pulse-gently"
                                style={{ 
                                  backgroundColor: activeColorInfo.glow,
                                  boxShadow: activeColorInfo.diffuseGlow
                                }}
                              />
                            )}

                            {/* Pure floating emoji face without solid background or box border */}
                            <div className="w-10 h-10 flex items-center justify-center transition-all duration-300 active:scale-110">
                              <GlassIcon emoji={emoji.label} size={isSelected ? "sm" : "xs"} className="transition-transform duration-300" />
                            </div>
                          </div>

                          {/* Text index below */}
                          <span 
                            className={`text-[10px] font-mono mt-3 leading-none transition-all duration-250 ${
                              isSelected 
                                ? "text-stone-900 font-extrabold scale-110" 
                                : "text-stone-400 font-bold"
                            }`}
                          >
                            {emoji.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 relative p-5 suspended-frosted-capsule hover:scale-100">
                <div className="breathing-liquid-spot" />
                <textarea
                  value={painText}
                  onChange={(e) => setPainText(e.target.value)}
                  placeholder="你可以补充描述当时的内心痛感或挣扎起因..."
                  maxLength={300}
                  className="w-full h-24 border-none outline-none resize-none text-sm placeholder-stone-400 text-stone-800 bg-transparent"
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/40">
                  <button
                    onClick={(e) => { addRipple(e); handleStartWriting("pain", painText, setPainText); }}
                    disabled={aiOpeningLoading === "pain"}
                    className="text-xs flex items-center gap-1 font-bold bg-white/60 text-[#13B15E] px-3 py-1.5 rounded-full border border-white/60 hover:bg-white/85 relative overflow-hidden"
                  >
                    {renderButtonRipples()}
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {aiOpeningLoading === "pain" ? "思考中..." : "AI 帮我开头"}
                  </button>
                  <span className="text-[10px] text-stone-400 font-mono">{painText.length}/300</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(4), 150);
                }}
                className="w-full py-4 rounded-full vone-yellowgreen-btn text-base font-black tracking-wider flex items-center justify-center gap-1 relative overflow-hidden"
              >
                {renderButtonRipples()}
                下一步
              </button>
              <button 
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(4), 150);
                }} 
                className="mt-3 text-xs text-stone-400 hover:underline py-1 relative overflow-hidden px-4"
              >
                {renderButtonRipples()}
                跳过此问
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: BODY STATE ================= */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              {renderOrb(4)}

              <div className="text-center mt-5">
                <h2 className="text-xl font-bold font-display text-stone-950 tracking-tight">当时你的身体有什么感觉？</h2>
                <p className="text-xs text-stone-450 mt-1.5">关注身体信号，它会告诉你很多。</p>
              </div>

              {/* Body Signals Grid wrapped inside suspended-frosted-capsule */}
              <div className="mt-6 suspended-frosted-capsule p-6 relative overflow-hidden">
                <div className="breathing-liquid-spot" />
                <div className="grid grid-cols-3 gap-2.5">
                  {bodyChips.map((chip, idx) => {
                    const isSelected = bodySignals.includes(chip);
                    return (
                      <button
                        key={idx}
                        onClick={(e) => {
                          addRipple(e);
                          handleBodySignalsToggle(chip);
                        }}
                        className={`py-3 px-1 rounded-2xl text-[12px] font-bold text-center border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden ${
                          isSelected 
                            ? "bg-emerald-55 border-emerald-300/40 text-[#13B15E] font-black shadow-[0_4px_12px_rgba(19,177,94,0.06)] scale-[1.02]" 
                            : "bg-white/40 border-white/50 text-stone-700 hover:bg-white/70 hover:scale-[1.02]"
                        }`}
                      >
                        {renderButtonRipples()}
                        {/* Custom premium glass-morphic symptom icon */}
                        <div className="flex flex-col items-center gap-1">
                          <GlassIcon emoji={chip} size="md" className="w-10 h-10 mb-0.5 shrink-0" />
                          <span>{chip}</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Supplementary description button spanning full row */}
                  <button 
                    onClick={(e) => {
                      addRipple(e);
                      const text = prompt("补充描述您的身体感受：", bodyText);
                      if (text !== null) setBodyText(text);
                    }}
                    className="col-span-3 py-3 mt-2 rounded-full bg-white/50 border border-white/60 text-stone-600 hover:bg-white/80 flex items-center justify-center gap-1.5 text-xs font-bold shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.99] transition-all relative overflow-hidden"
                  >
                    {renderButtonRipples()}
                    <Plus className="w-3.5 h-3.5 text-stone-400 stroke-[2.5]" />
                    <span>{bodyText ? `已补：${bodyText}` : "补充描述身体感受"}</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center select-none text-[11px] text-[#13B15E] font-extrabold flex justify-center items-center gap-1 bg-[#E6F9EE]/90 py-2.5 rounded-xl border border-[#C6F2D6]/40 shadow-xs">
                <GlassIcon emoji="☘️" size="xs" /> 你的身体反应是真实的，值得被看见。
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(5), 150);
                }}
                className="w-full py-4 rounded-full vone-yellowgreen-btn text-base font-black tracking-wider flex items-center justify-center gap-1 relative overflow-hidden"
              >
                {renderButtonRipples()}
                下一步
              </button>
              <button 
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(5), 150);
                }} 
                className="mt-3 text-xs text-stone-400 hover:underline py-1 relative overflow-hidden px-4"
              >
                {renderButtonRipples()}
                跳过此问
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: EMOTION SELECTION ================= */}
        {step === 5 && (
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              {renderOrb(5)}

              <div className="text-center mt-5">
                <h2 className="text-xl font-bold font-display text-stone-950 tracking-tight">当时你的主要情绪是？</h2>
                <p className="text-xs text-stone-450 mt-1.5">选择最贴近的情绪，帮助你更好地理解自己。</p>
              </div>

              {/* Emotion Chips Grid wrapped in suspended-frosted-capsule */}
              <div className="mt-6 suspended-frosted-capsule p-6 relative overflow-hidden">
                <div className="breathing-liquid-spot" />
                <div className="grid grid-cols-3 gap-2 px-0.5">
                  {emotionGrid.map((item, idx) => {
                    const isSelected = emotions.includes(item.name);
                    return (
                      <button
                        key={idx}
                        onClick={(e) => { addRipple(e); handleEmotionToggle(item.name); }}
                        className={`py-3 px-1 rounded-2xl text-[12px] font-bold text-center transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center gap-1.5 ${getEmotionColorInfo(item.name, isSelected)}`}
                      >
                        {renderButtonRipples()}
                        <GlassIcon emoji={item.name} size="md" className="w-10 h-10 mb-0.5 shrink-0" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 relative p-5 suspended-frosted-capsule hover:scale-100">
                <div className="breathing-liquid-spot" />
                <textarea
                  value={emotionText}
                  onChange={(e) => setEmotionText(e.target.value)}
                  placeholder="你可以补充描述当时各种微妙的情绪层级细节..."
                  maxLength={300}
                  className="w-full h-20 border-none outline-none resize-none text-sm placeholder-stone-400 text-stone-800 bg-transparent"
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/40">
                  <span className="text-[10px] text-stone-400 font-mono ml-auto">{emotionText.length}/300</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(6), 150);
                }}
                className="w-full py-4 rounded-full vone-yellowgreen-btn text-base font-black tracking-wider flex items-center justify-center gap-1 relative overflow-hidden"
              >
                {renderButtonRipples()}
                下一步
              </button>
              <button 
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(6), 150);
                }} 
                className="mt-3 text-xs text-stone-400 hover:underline py-1 relative overflow-hidden px-4"
              >
                {renderButtonRipples()}
                跳过此问
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: WHAT WOULD YOU DO AGAIN ================= */}
        {step === 6 && (
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              {renderOrb(6)}

              <div className="text-center mt-5">
                <h2 className="text-xl font-bold font-display text-stone-950 tracking-tight">如果再来一次，你会怎么做？</h2>
                <p className="text-xs text-stone-450 mt-1.5">想一想，如果可以重新选择，你希望自己如何应对？</p>
              </div>

              <div className="mt-6 relative p-5 suspended-frosted-capsule hover:scale-100 border-[#C6F2D6]/30 overflow-hidden">
                <div className="breathing-liquid-spot" />
                <textarea
                  value={retryText}
                  onChange={(e) => setRetryText(e.target.value)}
                  placeholder="写下你的想法，如：先深呼吸3秒保持沉静倾聽，拿出纸和笔，把小李汇报中的无方向结论记录下来。在中间他停顿时候委婉提出请他提炼主要目标..."
                  maxLength={500}
                  className="w-full h-36 border-none outline-none resize-none text-sm placeholder-stone-400 text-stone-800 bg-transparent"
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/40">
                  <button
                    onClick={(e) => { addRipple(e); handleStartWriting("howToRetry", retryText, setRetryText); }}
                    disabled={aiOpeningLoading === "howToRetry"}
                    className="text-xs flex items-center gap-1 font-bold bg-white/60 text-[#13B15E] px-3 py-1.5 rounded-full border border-white/60 hover:bg-white/85 relative overflow-hidden"
                  >
                    {renderButtonRipples()}
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {aiOpeningLoading === "howToRetry" ? "思考中..." : "AI 帮我开头"}
                  </button>
                  <span className="text-[10px] text-stone-400 font-mono">{retryText.length}/500</span>
                </div>
              </div>

              <div className="mt-6 text-center select-none text-[11px] text-[#13B15E] font-extrabold flex justify-center items-center gap-1 bg-[#E6F9EE]/90 py-2.5 rounded-xl border border-[#C6F2D6]/40 shadow-xs">
                ⭐ 没有对错，真诚地表达你希望成为的自己。
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(6.5), 150);
                }}
                className="w-full py-4 rounded-full vone-orangeyellow-btn text-base font-black tracking-wider flex items-center justify-center gap-1 relative overflow-hidden"
              >
                {renderButtonRipples()}
                完成，查看我的反思
              </button>
              <button 
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => setStep(6.5), 150);
                }} 
                className="mt-3 text-xs text-stone-400 hover:underline py-1 relative overflow-hidden px-4"
              >
                {renderButtonRipples()}
                跳过此问
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6.5: REFLECTION MENU / COMPASS DASHBOARD ================= */}
        {step === 6.5 && !showGrowthAtlasDetail && (
          <div className="flex-1 flex flex-col justify-between h-full animate-fade-in font-sans">
            <div>
              <div className="text-center mt-3 mb-8">
                <h2 className="text-2xl font-black text-[#1E3F39] tracking-tight font-display">反思复盘</h2>
                <p className="text-xs text-[#8E8575] font-semibold mt-1.5">从事件中学习，让成长看得见</p>
              </div>

              <div className="flex flex-col gap-5">
                {/* 1. 我的反思 */}
                <div className="bg-white/90 border border-stone-150/60 rounded-[24px] p-5.5 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-transform relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-black text-[#1E3F39]">我的反思</h3>
                      <p className="text-[10.5px] text-stone-400 font-bold mt-0.5">回顾过往事件，看看你的成长轨迹</p>
                    </div>
                  </div>
                  
                  <div className="mt-3.5 flex items-center justify-between bg-[#F8FAF9] border border-stone-100 p-3 rounded-[18px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-[#1EBE70] border border-[#EAF8F1]">
                        <Leaf className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-stone-800">今天也值得被看见</h4>
                        <p className="text-[10px] text-[#8E8575] font-bold mt-0.5">记录、反思、成长，每一步都算数</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        addRipple(e);
                        setTimeout(triggerAIReflect, 150);
                      }}
                      className="text-[11.5px] font-black text-[#1EBE70] hover:underline flex items-center gap-0.5 px-3 py-1.5 rounded-full hover:bg-[#EAF8F1] active:translate-x-0.5 transition-all shrink-0 cursor-pointer"
                    >
                      {renderButtonRipples()}
                      开始反思 &gt;
                    </button>
                  </div>
                </div>

                {/* 2. AI 洞察 */}
                <div className="bg-white/90 border border-stone-150/60 rounded-[24px] p-5.5 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-transform relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-black text-[#1E3F39]">AI 洞察</h3>
                      <p className="text-[10.5px] text-stone-400 font-bold mt-0.5">从不同维度解析事件，发现新的视角</p>
                    </div>
                  </div>
                  
                  <div className="mt-3.5 flex items-center justify-between bg-[#FDFCFF] border border-stone-100 p-3 rounded-[18px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-stone-800">让 AI 帮你看见更多可能</h4>
                        <p className="text-[10px] text-[#8E8575] font-bold mt-0.5">多维度分析，提供启发与建议</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        addRipple(e);
                        // Go directly to Step 8 AI result analysis 
                        setTimeout(() => {
                          setStep(8);
                        }, 150);
                      }}
                      className="text-[11.5px] font-black text-indigo-600 hover:underline flex items-center gap-0.5 px-3 py-1.5 rounded-full hover:bg-indigo-50 active:translate-x-0.5 transition-all shrink-0 cursor-pointer"
                    >
                      {renderButtonRipples()}
                      获取洞察 &gt;
                    </button>
                  </div>
                </div>

                {/* 3. 成长图谱 */}
                <div className="bg-white/90 border border-stone-150/60 rounded-[24px] p-5.5 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-transform relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-black text-[#1E3F39]">成长图谱</h3>
                      <p className="text-[10.5px] text-stone-400 font-bold mt-0.5">你的情绪、行为与成长趋势可视化</p>
                    </div>
                  </div>
                  
                  <div className="mt-3.5 flex items-center justify-between bg-[#FFFDFB] border border-stone-100 p-3 rounded-[18px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-stone-800">探索你的成长轨迹</h4>
                        <p className="text-[10px] text-[#8E8575] font-bold mt-0.5">趋势分析，见证改变的力量</p>
                      </div>
                    </div>
                    
                     <button
                      onClick={(e) => {
                        addRipple(e);
                        setTimeout(() => {
                          setShowGrowthAtlasDetail(true);
                        }, 150);
                      }}
                      className="text-[11.5px] font-black text-amber-600 hover:underline flex items-center gap-0.5 px-3 py-1.5 rounded-full hover:bg-amber-50 active:translate-x-0.5 transition-all shrink-0 cursor-pointer"
                    >
                      {renderButtonRipples()}
                      查看图谱 &gt;
                    </button>
                  </div>
                </div>

                {/* 4. 行动计划 */}
                <div className="bg-white/90 border border-stone-150/60 rounded-[24px] p-5.5 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-transform relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-black text-[#1E3F39]">行动计划</h3>
                      <p className="text-[10.5px] text-stone-400 font-bold mt-0.5">把反思转化为行动，让改变发生</p>
                    </div>
                  </div>
                  
                  <div className="mt-3.5 flex items-center justify-between bg-[#F9FAFE] border border-stone-100 p-3 rounded-[18px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                        <Check className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-stone-800">制定你的下一步行动</h4>
                        <p className="text-[10px] text-[#8E8575] font-bold mt-0.5">小目标，大改变，从现在开始</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        addRipple(e);
                        // Go to Step 9 (Principle card generation)
                        setStep(9);
                      }}
                      className="text-[11.5px] font-black text-blue-600 hover:underline flex items-center gap-0.5 px-3 py-1.5 rounded-full hover:bg-blue-50 active:translate-x-0.5 transition-all shrink-0 cursor-pointer"
                    >
                      {renderButtonRipples()}
                      创建计划 &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center select-none text-[10.5px] text-[#5B6B67] font-semibold flex items-center justify-center gap-1">
              <GlassIcon emoji="🌱" size="xs" /> 点击选项卡启动专属复盘流程
            </div>
          </div>
        )}

        {/* ================= EXTRA VIEW: HIGH-INTEGRITY DETAILED GROWTH ATLAS SUB-SCREEN ================= */}
        {step === 6.5 && showGrowthAtlasDetail && (
          renderGrowthAtlasDetail()
        )}

        {/* ================= STEP 7: 5WHY ANALYZING & REFLECTING ================= */}
        {step === 7 && (
          <div className="w-full flex flex-col space-y-6">
            {isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-emerald-400 animate-spin"></div>
                  <div className="absolute inset-2 bg-emerald-500/10 rounded-full flex items-center justify-center text-sage">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-sage-dark animate-pulse font-display">A.I. 正在结构化反思原因链</h3>
                <p className="text-xs mt-3 text-stone-400 text-center max-w-xs leading-relaxed">
                  剥离事实与人设评价... 正在进行多维度心理防卫识别以及5Why五层原因深度渗透...
                </p>
                <div className="mt-8 w-44 bg-stone-200/50 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full animate-[loading_2s_ease-in-out_infinite] w-2/3"></div>
                </div>
              </div>
            ) : (
              <div className="w-full relative flex flex-col space-y-4">
                {/* 5Why Gentle Water Ripple Background transition on whyStep */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl">
                  <div key={whyStep} className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-64 h-64 rounded-full absolute animate-water-ripple blur-2xl" 
                      style={{ 
                        animationDelay: "0s",
                        background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(20,184,166,0.06) 55%, transparent 100%)"
                      }} 
                    />
                    <div 
                      className="w-64 h-64 rounded-full absolute animate-water-ripple blur-2xl" 
                      style={{ 
                        animationDelay: "0.8s",
                        background: "radial-gradient(circle, rgba(56,189,248,0.14) 0%, rgba(16,185,129,0.04) 50%, transparent 100%)"
                      }} 
                    />
                    <div 
                      className="w-64 h-64 rounded-full absolute animate-water-ripple blur-2xl" 
                      style={{ 
                        animationDelay: "1.6s",
                        background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, rgba(192,232,144,0.05) 50%, transparent 100%)"
                      }} 
                    />
                  </div>
                </div>
                
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes waterRipple {
                    0% {
                      transform: scale(0.45);
                      opacity: 0;
                    }
                    20% {
                      opacity: 0.85;
                    }
                    100% {
                      transform: scale(2.8);
                      opacity: 0;
                    }
                  }
                  .animate-water-ripple {
                    animation: waterRipple 3.5s cubic-bezier(0.1, 0.8, 0.2, 1) both;
                  }
                ` }} />

                <div className="relative z-10 w-full flex flex-col space-y-4">
                  <div>
                    <div className="text-center mt-1 relative z-10 w-full">
                      {/* Segmented Progress Bar */}
                      <div className="px-6 pt-4 pb-2 relative z-20 select-none">
                      <div className="grid grid-cols-5 gap-1.5 md:gap-2.5">
                        {[
                          { stepNo: 1, label: "直接原因" },
                          { stepNo: 2, label: "近因" },
                          { stepNo: 3, label: "中间原因" },
                          { stepNo: 4, label: "远因" },
                          { stepNo: 5, label: "根本原因" },
                        ].map((phase) => {
                          const isCompleted = phase.stepNo < whyStep;
                          const isCurrent = phase.stepNo === whyStep;
                          
                          return (
                            <div key={phase.stepNo} className="space-y-1">
                              {/* Slide transition bar indicator */}
                              <div className="w-full h-1.5 rounded-full bg-stone-200/50 overflow-hidden relative border border-stone-200/20 shadow-3xs">
                                <motion.div 
                                  initial={false}
                                  animate={{
                                    width: isCompleted ? "100%" : isCurrent ? "100%" : "0%"
                                  }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                  className={`h-full rounded-full ${
                                    isCompleted 
                                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500" 
                                      : isCurrent 
                                        ? "bg-gradient-to-r from-[#C0E890] to-emerald-500 animate-pulse" 
                                        : "bg-transparent"
                                  }`}
                                />
                              </div>
                              {/* Label text */}
                              <div className="text-center">
                                <span 
                                  className={`text-[9px] md:text-[10px] whitespace-nowrap font-extrabold tracking-tight block transition-all duration-300 ${
                                    isCurrent 
                                      ? "text-emerald-700 font-extrabold scale-102 drop-shadow-3xs" 
                                      : isCompleted 
                                        ? "text-sage-dark font-bold opacity-80" 
                                        : "text-stone-400 font-medium opacity-50"
                                  }`}
                                >
                                  {phase.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-center mt-2 relative z-10 px-5">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={whyStep}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                        >
                          <p className="text-[10px] text-emerald-600/90 font-black tracking-widest uppercase font-mono flex items-center justify-center gap-1">
                            5Why 深度反思 <GlassIcon emoji="🍀" size="xs" /> · Step {whyStep} of 5
                          </p>
                          <h2 className="text-xl font-black font-display text-sage-dark tracking-tight mt-1.5">
                            {whyStep === 1 && "为什么这件事会发生?"}
                            {whyStep === 2 && "为什么会由当前直接原因引起?"}
                            {whyStep === 3 && "当时存在怎样的过往连结机制?"}
                            {whyStep === 4 && "是什么长效触发了这样的思维偏误?"}
                            {whyStep === 5 && "其自省终点对应的根本心智漏洞是什么?"}
                          </h2>
                          <p className="text-[10.5px] text-mocha font-bold mt-1.5">
                            {whyStep === 1 && "还原事实最直白的一线导火索"}
                            {whyStep === 2 && "顺藤摸瓜，揭示导致表面起因的近层促动因素"}
                            {whyStep === 3 && "寻找维系该漏洞运转的高频支撑机制与行为脉络"}
                            {whyStep === 4 && "探察防卫心理、高频环境诱因而生的隐性习惯"}
                            {whyStep === 5 && "最终触及顽固心智漏洞，寻找彻底颠覆重写的落脚点"}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* The AI analytics trigger chip with Sparkle */}
                    <div className="flex justify-center mt-3">
                      <button
                        onClick={async (e) => {
                          addRipple(e);
                          const arr = [...whyAnswers];
                          arr[whyStep - 1] = "思考中...";
                          setWhyAnswers(arr);
                          try {
                            const resp = await fetch("/api/ai-start-writing", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ 
                                contentType: `why_${whyStep}`, 
                                rawInput: rawText,
                                background: background,
                                currentWhys: whyAnswers.slice(0, whyStep - 1)
                              }),
                            });
                            const data = await resp.json();
                            if (data.text) {
                              arr[whyStep - 1] = data.text;
                            } else {
                              arr[whyStep - 1] = `根据前文推演，导致此现象的主要原因为自我沟通防御习惯。`;
                            }
                          } catch(err) {
                            arr[whyStep - 1] = "自我感知本层因果关系细节。";
                          }
                          setWhyAnswers(arr);
                        }}
                        className="px-3.5 py-1 bg-[#EAF8F1] hover:bg-[#D5F3E4] text-[#1EBE70] border border-[#C6F2D6] rounded-full text-xs font-bold flex items-center gap-1 shadow-xs transform active:scale-95 transition-all relative overflow-hidden cursor-pointer"
                      >
                        {renderButtonRipples()}
                        <Sparkles className="w-3.5 h-3.5 text-[#1EBE70]" />
                        <span>✦ AI 帮我分析</span>
                      </button>
                    </div>
                  </div>

                  {/* 5Why interactive rows inside lists */}
                  <div className="mt-6 flex flex-col gap-3.5 relative">
                    {/* Visual dotted connection track line on the left behind the circles */}
                    <div className="absolute left-[22px] top-6 bottom-6 w-0.5 border-l border-dashed border-emerald-200/50 z-0" />

                    {[
                      { num: 1, title: "为什么会发生这件事？", label: "直接原因", desc: "问题发生的表面直观导火索" },
                      { num: 2, title: "为什么会是这样的原因？", label: "近因", desc: "拉近距离，分析引起该直接原因的触发项" },
                      { num: 3, title: "为什么会是这样的原因？", label: "中间原因", desc: "承上启下，透视行为链路或惯性机制" },
                      { num: 4, title: "为什么会是这样的原因？", label: "远因", desc: "深挖潜在思维偏误、高频触发情境或态度倾向" },
                      { num: 5, title: "为什么根本原因是这个？", label: "根本原因", desc: "触及心智模式顽疾，寻找阻断机制的最终落脚点" },
                    ].map((row) => {
                      const isActive = row.num === whyStep;
                      const isUnlocked = row.num <= whyStep;
                      return (
                        <div
                          key={row.num}
                          onClick={() => {
                            if (isUnlocked) setWhyStep(row.num);
                          }}
                          className={`rounded-2xl p-4 transition-all border flex items-start gap-3 relative overflow-hidden ${
                            isActive 
                              ? "bg-white/95 border-[#A7F3D0] shadow-md scale-100 z-10" 
                              : isUnlocked 
                                ? "bg-white/40 border-white/20 opacity-85 cursor-pointer hover:bg-white/50 z-10" 
                                : "bg-white/10 border-white/10 opacity-40 select-none pointer-events-none z-10"
                          }`}
                        >
                          {/* BREATHING SPOT INSIDE WHYS FOR LIFE FEELING */}
                          {isUnlocked && <div className="breathing-liquid-spot scale-75 opacity-25" />}
                          
                          {/* Circle indicator badge */}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 relative z-10 ${
                            isActive 
                              ? "bg-emerald-500 text-white shadow-sm font-black" 
                              : isUnlocked 
                                ? "bg-[#EFF6FF] text-[#3B82F6]" 
                                : "bg-stone-100 text-stone-400"
                          }`}>
                            {row.num}
                          </div>

                          <div className="flex-1 relative z-10">
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <h4 className="text-sm font-extrabold text-stone-850 leading-snug">{row.title}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full select-none ${
                                isActive 
                                  ? "bg-emerald-500 text-white shadow-3xs" 
                                  : isUnlocked 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : "bg-stone-200/50 text-stone-400"
                              }`}>
                                {row.label}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-[#556663] font-bold mt-1 leading-relaxed mb-2">{row.desc}</p>

                            {isActive ? (
                              <div className="mt-3.5 relative bg-white/95 rounded-[20px] p-3 border border-emerald-300 shadow-xs transition-all focus-within:ring-2 focus-within:ring-emerald-300 font-sans">
                                <textarea
                                  rows={4}
                                  value={whyAnswers[row.num - 1]}
                                  onChange={(e) => {
                                    const arr = [...whyAnswers];
                                    arr[row.num - 1] = e.target.value;
                                    setWhyAnswers(arr);
                                  }}
                                  placeholder="输入本层自省原委，或点击右下角麦克风说出您的客观反思..."
                                  className="w-full text-sm font-semibold bg-transparent p-1 pb-8 outline-none resize-none text-stone-850 placeholder-stone-400/70 leading-relaxed"
                                  maxLength={200}
                                />
                                <div className="absolute right-3.5 bottom-2.5 flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startSpeechRecognition(row.num - 1);
                                    }}
                                    className={`p-2 rounded-full transition-all flex items-center justify-center ${
                                      isListening && listeningStep === (row.num - 1)
                                        ? "bg-red-500 text-white animate-pulse shadow-md"
                                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-110"
                                    }`}
                                    title="点击进行语音转写录入"
                                  >
                                    <Mic className="w-4 h-4 animate-bounce" />
                                  </button>
                                  <span className="text-[10px] text-stone-400 font-mono font-bold select-none">
                                    {(whyAnswers[row.num - 1] || "").length}/200
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-stone-500 mt-1.5 font-sans leading-relaxed whitespace-pre-wrap break-all pr-4">
                                {isUnlocked ? (whyAnswers[row.num - 1] || "已解锁，点击输入内容...") : "完成上一步后解锁"}
                              </p>
                            )}
                          </div>

                          {/* Lock icon */}
                          {!isUnlocked && (
                            <div className="shrink-0 pl-1 self-center relative z-10 opacity-70">
                              <svg 
                                className="w-3.5 h-3.5 text-stone-400" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Aesthetic tips */}
                  <div className="mt-4 bg-white/50 border border-white/50 rounded-2xl p-4 flex gap-3 shadow-xs">
                    <Sparkles className="w-5 h-5 text-[#13B15E] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-sage-dark">小贴士</p>
                      <p className="text-[10px] text-mocha mt-1 leading-relaxed">
                        试着深入思考，不要停留在表面原因，直到找到你能真正改变的根本原因。AI为你分析的结果可以给你启发，你可以点击五层任意修改！
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={(e) => {
                      addRipple(e);
                      setTimeout(() => {
                        if (whyStep > 1) {
                          setWhyStep(whyStep - 1);
                        } else {
                          setStep(6);
                        }
                      }, 150);
                    }}
                    className="py-4 px-6 rounded-full border border-white/50 text-stone-500 font-bold text-sm bg-white/65 hover:bg-white/80 active:scale-95 transition-all relative overflow-hidden shadow-xs"
                  >
                    {renderButtonRipples()}
                    {whyStep > 1 ? "上一步" : "跳过此问"}
                  </button>
                  <button
                    onClick={(e) => {
                      addRipple(e);
                      setTimeout(() => {
                        if (whyStep < 5) {
                          setWhyStep(whyStep + 1);
                        } else {
                          setStep(8);
                        }
                      }, 150);
                    }}
                    className="flex-1 py-4 rounded-full vone-yellowgreen-btn text-base font-black tracking-wider flex items-center justify-center gap-1.5 relative overflow-hidden"
                  >
                    {renderButtonRipples()}
                    {whyStep === 5 ? "完成反思，去往改善对策" : "下一步"}
                  </button>
                </div>
              </div>
</div>
            )}
          </div>
        )}

        {/* ================= STEP 8: IMPROVEMENT (改善对策) ================= */}
        {step === 8 && (
          <div className="flex-1 flex flex-col justify-between h-full animate-fade-in pt-2">
            <div>
              {/* Grid 2-columns (Root Cause, Improvement Measures) */}
              <div className="mt-2 grid grid-cols-2 gap-3.5">
                
                {/* COLUMN LEFT: 根本原因 */}
                <div className="bg-gradient-to-b from-[#FFFDF0] to-[#FFF6E3] border border-[#FFF0D4]/70 rounded-[24px] p-4.5 shadow-xs relative overflow-hidden flex flex-col justify-between h-[190px]">
                  {/* Glowing 3D Glass Orb in bottom right */}
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-tr from-sky-300/30 via-emerald-300/20 to-yellow-400/40 blur-[2px] opacity-75 pointer-events-none mix-blend-multiply flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 border border-white/50 shadow-inner" style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 80%)" }} />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#854D24] mb-2 tracking-wide flex items-center gap-1">
                      根本原因
                    </h3>
                    <textarea
                      value={whyAnswers[4] || analysisResult?.root_cause || "我对自我价值的安全感不足"}
                      onChange={(e) => {
                        const arr = [...whyAnswers];
                        arr[4] = e.target.value;
                        setWhyAnswers(arr);
                        setAnalysisResult({ ...analysisResult, root_cause: e.target.value });
                      }}
                      className="text-[11.5px] font-bold text-[#8E7051] bg-transparent outline-none border-none resize-none leading-relaxed w-full h-[120px] focus:ring-0 font-sans p-0 whitespace-pre-wrap placeholder-amber-900/40"
                      placeholder="点此编辑根本原因..."
                    />
                  </div>
                </div>

                {/* COLUMN RIGHT: 改善对策 */}
                <div className="bg-gradient-to-b from-[#F2F9FF] to-[#E5F3FF] border border-[#D5E6F5]/70 rounded-[24px] p-4.5 shadow-xs relative overflow-hidden flex flex-col justify-between h-[190px]">
                  {/* Exquisite leaf vector ornament stroke in bottom right */}
                  <div className="absolute -right-1.5 bottom-1 pointer-events-none text-emerald-800/10">
                    <svg className="w-14 h-18" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 110C35 90 60 50 70 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M70 15C55 25 45 42 50 55C62 50 68 32 70 15Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M42 75C28 80 20 92 25 102C35 98 40 85 42 75Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M57 48C45 52 38 62 42 72C52 68 56 58 57 48Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#1F4E46] mb-2 tracking-wide flex items-center gap-1">
                      改善对策
                    </h3>
                    <textarea
                      value={analysisResult?.improvement_strategy || "建立稳定的自我价值体系，减少对他人评价的依赖被质疑时先确认问题类型，再回应方案~"}
                      onChange={(e) => setAnalysisResult({ ...analysisResult, improvement_strategy: e.target.value })}
                      className="text-[11px] font-bold text-stone-750 bg-transparent outline-none border-none resize-none leading-relaxed w-full h-[120px] focus:ring-0 font-sans p-0 whitespace-pre-wrap placeholder-teal-900/40"
                      placeholder="针对性可执行策略设计..."
                    />
                  </div>
                </div>

              </div>

              {/* MIDDLE ROW: 24小时内的小动作 */}
              <div className="mt-4 bg-gradient-to-b from-[#EBF6FB] to-[#DCEDF7] border border-[#C6DCED]/60 rounded-[24px] p-5.5 shadow-xs relative overflow-hidden flex flex-col justify-between h-[125px]">
                {/* Super sleek italic time watermark 23:33 in bottom-right */}
                <div className="absolute right-5 bottom-0.5 text-[#305C72]/15 font-serif italic font-medium text-4xl select-none tracking-tight leading-none">
                  23:33
                </div>

                <div>
                  <h3 className="text-[13px] font-black text-[#1F4E46] flex items-center gap-1 tracking-wide">
                    24小时内<span className="text-[#5B7B70] font-bold text-xs ml-0.5">的小动作</span>
                  </h3>
                  <textarea
                    value={analysisResult?.next_action || "复盘这次会议：我做对了什么？我学到了什么？下次我可以怎么做？"}
                    onChange={(e) => setAnalysisResult({ ...analysisResult, next_action: e.target.value })}
                    className="text-[11.5px] font-bold text-stone-600 bg-transparent outline-none border-none resize-none leading-relaxed w-full h-[70px] focus:ring-0 font-sans p-0 mt-2 whitespace-pre-wrap placeholder-blue-900/40"
                    placeholder="物理微动作物理自救仪式步骤..."
                  />
                </div>
              </div>

              {/* BOTTOM ROW: 预警信号 with biometrics SVG wavy animation container */}
              <div className="mt-4 space-y-2">
                <div className="px-1 flex justify-between items-baseline">
                  <h3 className="text-[14px] font-black text-[#213555] tracking-tight">
                    预警<span className="text-xs text-[#707E94] font-bold ml-0.5">信号</span>
                  </h3>
                  <p className="text-[10px] text-stone-400 font-extrabold select-none uppercase tracking-widest font-mono">
                    Bio-Wave
                  </p>
                </div>
                
                {/* 预警信号 Input value */}
                <input
                  type="text"
                  value={warningSignalInput}
                  onChange={(e) => setWarningSignalInput(e.target.value)}
                  className="w-full text-xs font-bold text-stone-600 bg-transparent border-none outline-none focus:ring-0 p-0 mb-1"
                  placeholder="身体预警特征（如：心跳加快、肢体僵硬、忍不住打断）..."
                />

                {/* Exquisite custom horizontal glass container showing bio-rhythm wavy path */}
                <div className="bg-gradient-to-b from-white/90 to-[#EBF5FB]/80 rounded-[24px] p-4 border border-white/60 shadow-inner overflow-hidden flex items-center h-[52px]">
                  <svg className="w-full h-10 text-[#0284C7] opacity-85" viewBox="0 0 320 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0 20 C30 25, 45 15, 60 20 C75 25, 90 22, 105 18 C120 14, 135 26, 150 20 C165 14, 180 14, 195 24 C210 34, 215 5, 230 10 C245 15, 255 28, 270 20 C285 12, 290 18, 300 15 C310 12, 315 22, 320 18"
                      stroke="url(#gradient-step-8-wave)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0 20 C30 25, 45 15, 60 20 C75 25, 90 22, 105 18 C120 14, 135 26, 150 20 C165 14, 180 14, 195 24 C210 34, 215 5, 230 10 C245 15, 255 28, 270 20 C285 12, 290 18, 300 15 C310 12, 315 22, 320 18 L320 40 L0 40 Z"
                      fill="url(#gradient-step-8-fill)"
                      opacity="0.12"
                    />
                    <defs>
                      <linearGradient id="gradient-step-8-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="40%" stopColor="#22C55E" />
                        <stop offset="85%" stopColor="#0EA5E9" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                      <linearGradient id="gradient-step-8-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

            </div>

            {/* Next step capsule gradient button */}
            <div className="mt-8">
              <button
                onClick={(e) => {
                  addRipple(e);
                  // Auto sync Step 9 values if matching Screenshot 2
                  if (!analysisResult?.title) {
                    setAnalysisResult((prev: any) => ({
                      ...prev,
                      title: "重要事项先沟通，再推进"
                    }));
                  }
                  setTimeout(() => setStep(9), 150);
                }}
                className="w-full py-4.5 rounded-full bg-gradient-to-r from-[#B4EAA3] via-[#7DD3FC] to-[#3B82F6] hover:brightness-[1.03] text-white font-extrabold text-[15px] tracking-widest shadow-md active:scale-98 transition-all relative overflow-hidden flex items-center justify-center gap-2"
              >
                {renderButtonRipples()}
                下一步：生成原则卡
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 9: NEW PRINCIPLE CARD (新建原则卡) ================= */}
        {step === 9 && (
          <div className="flex-1 flex flex-col justify-between h-full animate-fade-in pt-2">
            <div>
              {/* Elements collection of cards matching Screenshot 2 */}
              <div className="mt-1 flex flex-col gap-3.5">
                
                {/* AI summarized Principle Keywords & Scene Tags */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                    <span className="text-[11px] font-black text-emerald-800 bg-[#EAF8F1] border border-[#C6F2D6]/40 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      ✦ AI标签 / 场景关键词
                    </span>
                    <span className="text-[9.5px] scale-90 text-stone-400 font-bold leading-none select-none">
                      (点击快捷删增，可有多个小标签)
                    </span>
                  </div>

                  {/* Active tags visual list with delete icons */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-stone-100/55 rounded-2xl border border-stone-200/40">
                    {principleTags.length === 0 ? (
                      <span className="text-[10.5px] text-stone-400 font-medium px-2 py-0.5">暂无标签，点击下方推荐添加</span>
                    ) : (
                      principleTags.map((tag) => (
                        <span 
                          key={tag}
                          onClick={() => {
                            setPrincipleTags(principleTags.filter(t => t !== tag));
                          }}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#EEFDF5] to-[#E6F4EA] hover:bg-rose-50 text-[#1EBE70] hover:text-rose-500 px-3 py-1.5 rounded-full text-[11px] font-black border border-[#C6F2D6]/50 shadow-3xs cursor-pointer select-none transition-all active:scale-95"
                          title="点击删除"
                        >
                          <span>#{tag}</span>
                          <span className="text-[9px] font-normal leading-none bg-stone-200/20 w-3.5 h-3.5 rounded-full flex items-center justify-center">×</span>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Recommended optional tags horizontal shelf */}
                  <div className="space-y-1 pl-1">
                    <span className="text-[10px] font-extrabold text-[#8E8575] tracking-tight">AI 推荐词词簇场景：</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["情绪锚定", "高效沟通", "决策推演", "自我价值", "冷静克制", "防微杜渐", "认知突围", "行重于言", "理智在线"].map((rec) => {
                        const isSelected = principleTags.includes(rec);
                        return (
                          <button
                            type="button"
                            key={rec}
                            onClick={() => {
                              if (isSelected) {
                                setPrincipleTags(principleTags.filter(t => t !== rec));
                              } else {
                                setPrincipleTags([...principleTags, rec]);
                              }
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 border ${
                              isSelected 
                                ? "bg-[#C0E890] text-[#1E3F39] border-transparent shadow-2xs" 
                                : "bg-white hover:bg-stone-50 text-stone-600 border-stone-200/50"
                            }`}
                          >
                            + {rec}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-[#EBF6FB] to-[#D5EBF8] border border-white rounded-[24px] px-5 py-3 shadow-xs relative overflow-hidden font-display">
                    <input
                      type="text"
                      value={analysisResult?.title || "重要事项先沟通，再推进"}
                      onChange={(e) => setAnalysisResult({ ...analysisResult, title: e.target.value })}
                      className="text-base font-extrabold text-[#213555] bg-transparent outline-none border-none w-full p-0 focus:ring-0 placeholder-stone-400"
                      placeholder="点此编辑原则卡标题..."
                    />
                  </div>
                </div>

                {/* 触发场景 Card */}
                <div className="bg-[#F6FAF8] border border-white rounded-[24px] p-4.5 shadow-xs relative overflow-hidden min-h-[105px] flex flex-col justify-between">
                  {/* Subtle leafy branch in bottom-right matching green card */}
                  <div className="absolute -right-1 bottom-1 pointer-events-none text-[#2E7E65]/10">
                    <svg className="w-12 h-16" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 110C35 90 60 50 70 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M70 15C55 25 45 42 50 55C62 50 68 32 70 15Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M42 75C28 80 20 92 25 102C35 98 40 85 42 75Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M57 48C45 52 38 62 42 72C52 68 56 58 57 48Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-black text-[#2E4F4F]">
                      触发<span className="text-stone-400 font-bold text-xs ml-0.5">场景</span>
                    </h3>
                    <textarea
                      value={triggerSceneInput}
                      onChange={(e) => setTriggerSceneInput(e.target.value)}
                      className="text-xs font-bold text-stone-600 bg-transparent outline-none border-none resize-none leading-relaxed w-full h-[52px] focus:ring-0 p-0 mt-1 whitespace-pre-wrap placeholder-emerald-900/40"
                      placeholder="面临哪些高阶触发沟通冲突与自我反击场景时..."
                    />
                  </div>
                </div>

                {/* Grid columns */}
                <div className="grid grid-cols-2 gap-3.5">
                  
                  {/* LEFT Column: 预警信号 with wave curve */}
                  <div className="bg-gradient-to-b from-[#F2F9FF] to-[#E5F3FF] border border-[#D5E6F5]/70 rounded-[24px] p-4.5 shadow-xs relative overflow-hidden flex flex-col justify-between h-[155px]">
                    <div>
                      <h3 className="text-[13px] font-black text-[#1F4E46] mb-1">
                        预警<span className="text-stone-400 font-bold text-xs ml-0.5">信号</span>
                      </h3>
                      <textarea
                        value={warningSignalInput}
                        onChange={(e) => setWarningSignalInput(e.target.value)}
                        className="text-[10.5px] font-extrabold text-stone-600 bg-transparent outline-none border-none resize-none leading-normal w-full h-[70px] focus:ring-0 p-0 whitespace-pre-wrap placeholder-blue-900/40"
                        placeholder="身体警示预兆特征..."
                      />
                    </div>

                    {/* Small wave stroke at the bottom */}
                    <div className="w-full h-8 opacity-70 pointer-events-none -mb-1">
                      <svg className="w-full h-full text-[#38BDF8]" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 15 C15 20, 25 5, 40 15 C55 25, 65 5, 80 15 C90 22, 95 12, 100 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* RIGHT Column: 极其具体的小动作 (下一次动作) */}
                  <div className="bg-gradient-to-b from-[#FFFDF0] to-[#FFF6E3] border border-[#FFF0D4]/70 rounded-[24px] p-4.5 shadow-xs relative overflow-hidden flex flex-col justify-between h-[155px]">
                    <div>
                      <h3 className="text-[13px] font-black text-[#854D24] mb-1">
                        下一次动作
                      </h3>
                      <textarea
                        value={nextActionInput}
                        onChange={(e) => setNextActionInput(e.target.value)}
                        className="text-[10.5px] font-extrabold text-[#8E7051] bg-transparent outline-none border-none resize-none leading-normal w-full h-[90px] focus:ring-0 p-0 whitespace-pre-wrap placeholder-amber-900/40"
                        placeholder="行动金字塔：制定极其简单容易落地的微行动物理小动作..."
                      />
                    </div>
                  </div>

                </div>

                {/* 复盘日期/提醒时间 Row Card */}
                <div className="bg-gradient-to-b from-[#EBF6FB] to-[#DCEDF7] border border-[#C6DCED]/60 rounded-[24px] p-4.5 shadow-xs relative overflow-hidden flex justify-between items-center h-[76px]">
                  <div className="space-y-1">
                    <h3 className="text-[11.5px] font-black text-[#2F6B58] uppercase tracking-wide">
                      复盘日期/提醒时间
                    </h3>
                    <input
                      type="text"
                      value={reminderDateInput}
                      onChange={(e) => setReminderDateInput(e.target.value)}
                      className="text-xs font-bold text-[#525E75] bg-transparent outline-none border-none p-0 focus:ring-0 w-36"
                      placeholder="设置拟定复盘天..."
                    />
                  </div>

                  {/* Right Serif Italic exact 20:00 typography watermark indicator */}
                  <div className="relative">
                    <input
                      type="text"
                      value={reminderTimeInput}
                      onChange={(e) => setReminderTimeInput(e.target.value)}
                      className="w-24 text-right text-3xl font-serif italic font-medium text-cyan-900/60 bg-transparent outline-none border-none p-0 focus:ring-0 tracking-tight select-all cursor-pointer"
                      placeholder="20:00"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Saving Row buttons to match Screenshot 2 */}
            <div className="mt-8 flex justify-between gap-3.5 pb-2 select-none">
              <button
                onClick={(e) => {
                  addRipple(e);
                  // Saving to muscles/mistakes list first
                  setTimeout(() => saveToMistakes(true), 150);
                }}
                className="flex-1 py-4 rounded-full bg-gradient-to-r from-[#B1EDB1] to-[#3ABDF2] hover:brightness-[1.03] text-white font-extrabold text-[13.5px] tracking-wider shadow-md active:scale-95 transition-all relative overflow-hidden cursor-pointer"
              >
                {renderButtonRipples()}
                保存到原则库
              </button>
              <button
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(() => saveToMistakes(false), 150);
                }}
                className="flex-1 py-4 rounded-full bg-gradient-to-r from-[#FDE047] to-[#FB923C] hover:brightness-[1.03] text-white font-extrabold text-[13.5px] tracking-wider shadow-md active:scale-95 transition-all relative overflow-hidden cursor-pointer"
              >
                {renderButtonRipples()}
                保存到错题本
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 10: SAVE SUCCESS (保存成功) ================= */}
        {step === 10 && (
          <div className="flex-1 flex flex-col justify-between h-full">
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              {/* Massive check halo matching Screenshot 6 */}
              <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full hologram-orb-success animate-pulse-gently"></div>
                <div className="w-24 h-24 rounded-full bg-white/80 border border-white/50 flex items-center justify-center shadow-lg relative z-10 scale-105 animate-[bounce_1s_ease_1]">
                  <Check className="w-12 h-12 text-emerald-600 stroke-[3]" />
                </div>
              </div>

              <h2 className="text-2xl font-black font-display text-[#113d2f] tracking-tight">太棒了！</h2>
              <p className="text-sm text-mocha mt-1">已保存到你的成长资产中，不让每一次痛苦虚流。</p>

              {/* Status checklist */}
              <div className="mt-8 w-full flex flex-col gap-3">
                <div className="bg-white/50 border border-white/50 p-4 rounded-2xl flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-sage-dark">已保存的错题端本</h3>
                    <p className="text-[10px] text-mocha mt-0.5">你可以随时查看这条记录和5Why因果深层分析链</p>
                  </div>
                </div>

                <div className="bg-white/50 border border-white/50 p-4 rounded-2xl flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-sage-dark">已生成新成长原则卡</h3>
                    <p className="text-[10px] text-mocha mt-0.5">下次遇到类似会议、对话表达场景时，会提供事前警醒</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 pb-2">
              <button
                onClick={(e) => {
                  addRipple(e);
                  setTimeout(onClose, 150);
                }}
                className="w-full py-4 rounded-full vone-orangeyellow-btn text-white font-extrabold tracking-wider relative overflow-hidden"
              >
                {renderButtonRipples()}
                返回仪表盘
              </button>
            </div>
          </div>
        )}
        
      </div>

      {/* Hidden file inputs for attachments */}
      <input
        type="file"
        accept="image/*"
        capture="camera"
        ref={cameraInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <input
        type="file"
        accept="image/*"
        ref={albumInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        multiple // Allow multiple file selection for general files
      />
    </div>
  );
}
