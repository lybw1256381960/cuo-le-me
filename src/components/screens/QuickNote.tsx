import React, { useState, useRef } from "react";
import GlassIcon from "../GlassIcon";
import { 
  ChevronLeft, 
  ChevronRight,
  X,
  Inbox, 
  PenTool, 
  Camera, 
  Image as ImageIcon, 
  Mic, 
  FileText, 
  Target, 
  AlertTriangle, 
  RefreshCw, 
  Heart, 
  Cloud, 
  MoreHorizontal, 
  Activity, 
  BatteryLow, 
  Sparkles,
  Zap,
  CheckCircle2,
  Flame,
  Brain,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MistakeCategory, MistakeEntry } from "../../types";
import { getPainColorHSL } from "../../utils";
import { API_BASE_URL } from "../../config/api";

interface QuickNoteProps {
  initialDraft?: MistakeEntry | null;
  defaultMethod?: string;
  onSaveQuick: (draft: Partial<MistakeEntry>, startReview: boolean, skipToReflection: boolean, draftIdToReplace?: string) => void;
  onClose: () => void;
  onOpenDrafts?: () => void;
}

export default function QuickNote({ initialDraft, defaultMethod, onSaveQuick, onClose, onOpenDrafts }: QuickNoteProps) {
  const [recordMethod, setRecordMethod] = useState<string>(defaultMethod || "文本记录");
  const [content, setContent] = useState<string>(initialDraft ? initialDraft.rawText : "");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; url: string; type: string; file: File }[]>(initialDraft?.attachments || []);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialDraft && initialDraft.emotions ? initialDraft.emotions : ["目标偏离"]);
  const [painValue, setPainValue] = useState<number>(initialDraft ? initialDraft.painLevel : 4);
  const [bodyExperiences, setBodyExperiences] = useState<string[]>(initialDraft && initialDraft.bodySignals ? initialDraft.bodySignals : ["心悸", "紧绷"]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>("");
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [emotionAnalysis, setEmotionAnalysis] = useState<any>(null);
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState<boolean>(false);

  const recordMethods = [
    { name: "文本记录", description: "输入想法和感受", icon: PenTool, activeColor: "text-emerald-600 bg-emerald-50 border-emerald-300" },
    { name: "拍照", description: "拍照上传", icon: Camera, activeColor: "text-blue-600 bg-blue-50 border-blue-300" },
    { name: "相册", description: "从相册选择", icon: ImageIcon, activeColor: "text-violet-600 bg-violet-50 border-violet-300" },
    { name: "语音", description: "声学快速录入", icon: Mic, activeColor: "text-amber-600 bg-amber-50 border-amber-300" },
    { name: "文件", description: "上传相关文件", icon: FileText, activeColor: "text-rose-600 bg-rose-50 border-rose-300" },
  ];

  const categories = [
    { name: "目标偏离", icon: Target },
    { name: "行动失误", icon: AlertTriangle },
    { name: "习惯问题", icon: RefreshCw },
    { name: "情绪影响", icon: Heart },
    { name: "外部因素", icon: Cloud },
    { name: "其他", icon: MoreHorizontal },
  ];

  const bodyFeelings = [
    { name: "头痛", icon: Brain },
    { name: "紧绷", icon: Scale },
    { name: "疲惫", icon: BatteryLow },
    { name: "心悸", icon: Activity },
    { name: "胃部不适", icon: Flame },
    { name: "其他", icon: MoreHorizontal },
  ];

  const emojisList = [
    { value: 1, label: "😇", color: "from-emerald-400 to-teal-500" },
    { value: 2, label: "😊", color: "from-emerald-300 to-teal-400" },
    { value: 3, label: "🙂", color: "from-amber-300 to-yellow-500" },
    { value: 4, label: "😐", color: "from-orange-400 to-amber-500" },
    { value: 5, label: "😟", color: "from-rose-300 to-orange-400" },
    { value: 6, label: "😡", color: "from-rose-400 to-red-500" },
    { value: 7, label: "😫", color: "from-red-500 to-rose-600" },
  ];

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((x) => x !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleBodyExperienceToggle = (exp: string) => {
    if (bodyExperiences.includes(exp)) {
      setBodyExperiences(bodyExperiences.filter((x) => x !== exp));
    } else {
      setBodyExperiences([...bodyExperiences, exp]);
    }
  };

  const triggerEmotionAnalysis = async (textToAnalyze: string) => {
    if (!textToAnalyze || !textToAnalyze.trim()) return;
    setIsAnalyzingEmotion(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze-emotion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAnalyze }),
      });
      const data = await res.json();
      setEmotionAnalysis(data);
      
      if (data.intensity) {
        setPainValue(data.intensity);
      }
      if (data.emotionalKeywords && data.emotionalKeywords.length > 0) {
        const matchedSignals: string[] = [];
        data.emotionalKeywords.forEach((kw: string) => {
          if (["头痛", "紧绷", "疲惫", "心悸", "胃", "不适"].some(f => kw.includes(f))) {
            const presetName = feelPresetMap(kw);
            if (presetName && !matchedSignals.includes(presetName)) {
              matchedSignals.push(presetName);
            }
          }
        });
        if (matchedSignals.length > 0) {
          setBodyExperiences(prev => {
            const merged = [...prev];
            matchedSignals.forEach(s => {
              if (!merged.includes(s)) merged.push(s);
            });
            return merged;
          });
        }
      }
    } catch (err) {
      console.error("Emotion analysis failed:", err);
    } finally {
      setIsAnalyzingEmotion(false);
    }
  };

  const feelPresetMap = (kw: string): string => {
    if (kw.includes("头痛") || kw.includes("脑")) return "头痛";
    if (kw.includes("紧绷") || kw.includes("肩膀") || kw.includes("肌肉")) return "紧绷";
    if (kw.includes("疲") || kw.includes("累")) return "疲惫";
    if (kw.includes("心悸") || kw.includes("心跳") || kw.includes("出汗")) return "心悸";
    if (kw.includes("胃")) return "胃部不适";
    return "";
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
          const newFiles = Array.from(event.target.files).map((file: File) => ({
              name: file.name,
              url: URL.createObjectURL(file), // Create object URL for preview
              type: file.type,
              file: file // Store the actual file object
          }));
          setAttachedFiles(prev => [...prev, ...newFiles]);
          // Clear the input value to allow selecting the same file again
          event.target.value = '';
      }
  };

  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  React.useEffect(() => {
    if (initialDraft && (initialDraft as any).isVoiceDraft && initialDraft.rawText) {
      triggerEmotionAnalysis(initialDraft.rawText);
    }
  }, [initialDraft]);

  // Real Speech Recognition Web API integration
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("您的设备暂时无法调用原生态麦克风语音录入。");
      // Fallback demonstration
      setIsRecording(true);
      setTimeout(() => {
        const fallbackTxt = "刚才给客户汇报方案的时候，我的有些论据准备不够充分，面对客户的连续质问，我瞬间感觉手心出汗、心跳加速，整个人非常紧绷，回答时语气也显得着急起来...";
        setContent(fallbackTxt);
        setIsRecording(false);
        triggerEmotionAnalysis(fallbackTxt);
      }, 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError("");
      };

      recognition.onerror = (e: any) => {
        setSpeechError(`识别录音失败: ${e.error || "网络微扰"}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setContent(transcript);
          triggerEmotionAnalysis(transcript);
        }
      };

      recognition.start();
    } catch (err: any) {
      setSpeechError(`初始化音频发生错误: ${err.message}`);
      setIsRecording(false);
    }
  };

  // Trigger Gemini API to recommend a start text
  const handleAISuggestion = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-start-writing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: "what", rawInput: content }),
      });
      const data = await res.json();
      if (data.text) {
        setContent(data.text + (content ? `\n${content}` : ""));
      }
    } catch (err) {
      console.error(err);
      setContent("当时我正在进行方案汇报，结果因为一点细节没有对齐..." + content);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePublish = (startReview: boolean, skipToReflection: boolean = false, isSavingAsDraft: boolean = false) => {
    let cat = MistakeCategory.OTHER;
    if (selectedTypes.includes("行动失误")) cat = MistakeCategory.HABIT;
    if (selectedTypes.includes("情绪影响")) cat = MistakeCategory.EMOTION;
    if (selectedTypes.includes("目标偏离")) cat = MistakeCategory.COMMUNICATION;

    // Merge analyzed emotional category and keywords if available
    const finalEmotions = [...selectedTypes];
    if (emotionAnalysis?.emotionCategory && !finalEmotions.includes(emotionAnalysis.emotionCategory)) {
      finalEmotions.push(emotionAnalysis.emotionCategory);
    }

    const finalBodySignals = [...bodyExperiences];
    if (emotionAnalysis?.emotionalKeywords) {
      emotionAnalysis.emotionalKeywords.forEach((kw: string) => {
        if (["心跳", "出汗", "紧绷", "心悸", "头痛", "胃", "累"].some(f => kw.includes(f))) {
          const mapped = feelPresetMap(kw);
          if (mapped && !finalBodySignals.includes(mapped)) {
            finalBodySignals.push(mapped);
          }
        }
      });
    }

    const draft: Partial<MistakeEntry> = {
      rawText: content || "快捷录入事实",
      category: cat,
      painLevel: emotionAnalysis?.intensity || painValue,
      bodySignals: finalBodySignals,
      emotions: finalEmotions,
      eventSummary: content,
      facts: [content],
      status: "待反思",
      isDraft: isSavingAsDraft,
      attachments: attachedFiles // Add attached files
    };
    onSaveQuick(draft, startReview, skipToReflection, initialDraft?.id);
  };

  const handleBackClick = () => {
    if (!content.trim() || (initialDraft && content.trim() === initialDraft.rawText.trim())) {
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full text-stone-800 relative select-none overflow-hidden">
      
      {/* SVG gooey liquid filter definition */}
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          <filter id="gooey-interactive-blend">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
          </filter>
        </defs>
      </svg>

      {/* 2. Stunning Dynamic Healing Liquid Yellow-Blue-Green Flowing Blobs background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft layout background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E0F2FE]/55 via-[#ECFDF5]/50 to-[#FCFDF2]/80" />

        {/* Gooey morphing cells */}
        <div className="absolute inset-0 filter blur-[14px]" style={{ filter: "url(#gooey-interactive-blend)" }}>
          {/* Cyan Blob */}
          <motion.div
            className="absolute rounded-full bg-sky-200/40 w-72 h-72"
            style={{ left: "-10%", top: "5%" }}
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 45, 0],
              scale: [1, 1.12, 0.95, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Green Salad Blob */}
          <motion.div
            className="absolute rounded-full bg-emerald-200/35 w-64 h-64"
            style={{ right: "5%", top: "15%" }}
            animate={{
              x: [0, -45, 30, 0],
              y: [0, 50, -25, 0],
              scale: [1, 0.88, 1.15, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Bright yellow sun halo replicating the middle right glowing circle */}
          <motion.div
            className="absolute rounded-full bg-amber-300/40 w-40 h-40 shadow-[0_0_60px_rgba(251,191,36,0.3)]"
            style={{ right: "18%", top: "11%" }}
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.75, 0.9, 0.75],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Floating light cyan bubble */}
          <motion.div
            className="absolute rounded-full bg-cyan-100/50 w-32 h-32"
            style={{ left: "40%", top: "50%" }}
            animate={{
              y: [0, -60, 0],
              x: [0, 15, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Replicating the hand-drawn leaf design elements from the right margin */}
        <svg className="absolute right-0 top-18 w-24 h-48 text-[#A7F3D0]/50 stroke-current stroke-1.5 fill-none select-none opacity-80" viewBox="0 0 100 200">
          <path d="M100,20 Q60,40 70,80 Q90,90 100,50 Q80,110 100,120 Q60,140 85,170" />
          <path d="M100,45 Q75,55 85,75 Q95,80 100,65" />
          <path d="M100,115 Q75,123 83,141 Q93,147 100,132" />
        </svg>
      </div>

      {/* 3. Pure custom top sticky Navigation Bar matching 1:1 format */}
      <div className="relative z-10 px-4 pt-3 pb-3 flex items-center justify-between">
        <button 
          onClick={handleBackClick} 
          className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xs cursor-pointer active:scale-95 transition-all text-stone-700 hover:bg-white"
        >
          <ChevronLeft className="w-5 h-5 text-stone-600 stroke-[2.5]" />
        </button>
        <h2 
          className="text-[17px] font-bold text-stone-950"
          style={{
            paddingTop: "0px",
            paddingLeft: "0px",
            paddingRight: "0px",
            marginTop: "0px",
            marginRight: "-34px"
          }}
        >
          快记
        </h2>
        <button 
          onClick={onOpenDrafts}
          className="px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/50 text-stone-700 font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-white active:scale-95 cursor-pointer"
        >
          <Inbox className="w-3.5 h-3.5 text-stone-500" />
          <span>草稿箱</span>
        </button>
      </div>

      {/* Title Subheader details */}
      <div className="relative z-10 px-6 pt-1 pb-4">
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          记录此刻的感受
        </h1>
        <p className="text-[11.5px] text-stone-500 font-medium mt-1">
          觉察当下，释放压力，遇见更好的自己
        </p>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28 space-y-4 relative z-10">
        
        {/* ================= SECTION 1: 选择记录方式 ================= */}
        <div className="p-4.5 bg-white/65 backdrop-blur-lg border border-white/45 rounded-[32px] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#5E7F73] text-white font-black text-[11px] flex items-center justify-center">
              1
            </span>
            <h3 className="text-[13.5px] font-black text-[#1E3F39]">
              选择记录方式
            </h3>
          </div>

          {/* Horizontally distributed option block */}
          <div className="grid grid-cols-5 gap-1.5">
            {recordMethods.map((med, idx) => {
              const Icon = med.icon;
              const isSelected = recordMethod === med.name;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setRecordMethod(med.name);
                    if (med.name === "语音") {
                      startSpeechRecognition();
                    } else if (med.name === "拍照") {
                      cameraInputRef.current?.click();
                    } else if (med.name === "相册") {
                      albumInputRef.current?.click();
                    } else if (med.name === "文件") {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#F3FAF7] border-[#81C79F] text-[#1E3F39] shadow-xs scale-102" 
                      : "bg-white/40 border-stone-200/50 text-stone-500 hover:bg-white/70"
                  }`}
                >
                  <div className={`p-1.5 rounded-full mb-1.5 ${isSelected ? "bg-white text-[#2c6e49]" : "text-stone-400"}`}>
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{med.name}</span>
                  {med.name === "文本记录" && (
                    <span className="text-[6.5px] font-normal scale-85 text-stone-400 mt-0.5 leading-none whitespace-nowrap">输入想法</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Voice recording specific status waves block */}
          {recordMethod === "语音" && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2.5 text-center animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-amber-900">
                <span className={`w-1.5 h-1.5 rounded-full bg-rose-500 ${isRecording ? "animate-ping" : ""}`} />
                {isRecording ? "正在捕捉您的语音微语，轻点底部重新触发..." : "麦克风通道已经成功预热"}
              </div>
              
              {isRecording && (
                <div className="flex justify-center items-center gap-1 h-5 select-none">
                  {[1, 2, 3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 3].map((v, i) => (
                    <span 
                      key={i} 
                      className="w-1 bg-[#1E3F39] rounded-full" 
                      style={{ 
                        height: `${v * 4}px`, 
                        animation: "pulse 0.9s infinite",
                        animationDelay: `${i * 0.08}s` 
                      }} 
                    />
                  ))}
                </div>
              )}

              {speechError && (
                <span className="text-[9.5px] text-amber-700/80 font-bold block">{speechError}</span>
              )}

              <button 
                onClick={startSpeechRecognition}
                className="text-[10px] px-3.5 py-1.5 rounded-full bg-white border border-amber-200/70 text-amber-800 shadow-xs active:scale-95 transition-transform"
              >
                {isRecording ? "点击中断" : "开始录音"}
              </button>
            </div>
          )}

          {/* Pure Crystalline Container Textarea */}
          <div className="relative bg-[#FAFAF9]/80 rounded-2xl border border-stone-200/50 p-4 transition-all focus-within:bg-white focus-within:shadow-md">
            <textarea
              className="w-full text-xs placeholder-stone-400/80 text-stone-800 bg-transparent border-none outline-none resize-none leading-relaxed h-32 no-scrollbar font-medium"
              placeholder={`此刻发生了什么？你的感受是怎样的？\n\n例如：\n今天工作中出现了失误，感到很焦虑...\n和朋友发生了争执，心里很难过...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
            />
            <div className="absolute bottom-2.5 right-3 text-[9px] font-mono text-stone-400 font-semibold select-none">
              {content.length}/1000
            </div>
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

          {/* Gemini Emotion Analysis High-End Panel */}
          {(isAnalyzingEmotion || emotionAnalysis) && (
            <div className="p-4 bg-gradient-to-br from-teal-500/10 via-[#C0E890]/10 to-amber-500/10 rounded-2xl border border-[#C0E890]/30 space-y-3.5 text-left relative overflow-hidden animate-fade-in shadow-2xs">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-[12px] font-black text-[#1E3F39] tracking-tight">Gemini 情绪感知镜面</span>
                </div>
                {isAnalyzingEmotion && (
                  <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-100/60 border border-emerald-200/40 px-2.5 py-0.5 rounded-full animate-pulse">
                    深度体察中...
                  </span>
                )}
              </div>

              {isAnalyzingEmotion ? (
                <div className="space-y-2 py-2">
                  <div className="h-3.5 bg-stone-200/50 rounded-full w-2/3 animate-pulse" />
                  <div className="h-3 bg-stone-200/40 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-stone-200/40 rounded-full w-5/6 animate-pulse" />
                </div>
              ) : (
                <div className="space-y-3 relative z-10">
                  {/* High-End Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {emotionAnalysis.emotionCategory && (
                      <span className="text-[10px] bg-rose-500/10 text-rose-800 border border-rose-500/15 font-black px-2.5 py-0.5 rounded-full">
                        🎭 {emotionAnalysis.emotionCategory}
                      </span>
                    )}
                    {emotionAnalysis.cognitiveTag && (
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-800 border border-indigo-500/15 font-black px-2.5 py-0.5 rounded-full">
                        🧩 {emotionAnalysis.cognitiveTag}
                      </span>
                    )}
                    {emotionAnalysis.intensity && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-800 border border-amber-500/15 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <GlassIcon emoji="⚡" size="xs" />
                        <span>痛感: {emotionAnalysis.intensity}级</span>
                      </span>
                    )}
                  </div>

                  {/* Identified keywords */}
                  {emotionAnalysis.emotionalKeywords && emotionAnalysis.emotionalKeywords.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-stone-400">自动标注情绪/身体关键词:</div>
                      <div className="flex flex-wrap gap-1">
                        {emotionAnalysis.emotionalKeywords.map((kw: string, i: number) => (
                          <span key={i} className="text-[9.5px] bg-[#EEFDF5] hover:bg-[#EEFDF5]/80 border border-emerald-100/50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md transition-colors">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Report Markdown Text with glass background */}
                  {emotionAnalysis.highEndEvaluation && (
                    <div className="text-[11.5px] text-[#2D3E35] font-semibold leading-relaxed bg-white/70 backdrop-blur-md border border-white/90 p-3 rounded-xl whitespace-pre-line shadow-3xs">
                      {emotionAnalysis.highEndEvaluation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section Leaf note bar */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#5E7F73]/5 border border-[#5E7F73]/10 text-[10.5px] text-[#426156] font-bold">
            <div className="flex items-center gap-1">
              <GlassIcon emoji="🌱" size="xs" />
              <span>写下你的真实想法，哪怕只是几个字，也有意义</span>
            </div>
            
            <button
              onClick={handleAISuggestion}
              disabled={aiLoading}
              className="px-2.5 py-1 rounded-full bg-white text-[#426156] hover:bg-[#F3FAF7] hover:scale-102 border border-stone-200 text-[10px] flex items-center gap-0.5 shadow-2xs font-extrabold cursor-pointer active:scale-95 transition-all"
            >
              <span>✦ AI 帮我开头</span>
            </button>
          </div>
        </div>

        {/* ================= SECTION 2: 这件事更像是哪种类型？ ================= */}
        <div className="p-4.5 bg-white/65 backdrop-blur-lg border border-white/45 rounded-[32px] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#5E7F73] text-white font-black text-[11px] flex items-center justify-center">
              2
            </span>
            <h3 className="text-[13.5px] font-black text-[#1E3F39]">
              这件事更像是哪种类型？
            </h3>
            <span className="text-[10px] text-stone-400 font-bold ml-1">
              (可多选)
            </span>
          </div>

          {/* Grid display layout */}
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const isSelected = selectedTypes.includes(cat.name);
              return (
                <button
                  key={idx}
                  onClick={() => handleTypeToggle(cat.name)}
                  className={`py-3.5 px-1 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#F3FAF7] border-[#81C79F] text-[#1E3F39] text-xs font-black shadow-2xs" 
                      : "bg-white/50 border-stone-200/50 text-stone-500 hover:bg-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-2 ${isSelected ? "text-[#2c6e49] stroke-[2.5]" : "text-stone-400"}`} />
                  <span className="text-[11px] tracking-tight whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 rounded-2xl bg-[#5E7F73]/5 border border-[#5E7F73]/10 text-[10.5px] text-[#426156] font-bold flex items-center gap-1.5">
            <GlassIcon emoji="🌱" size="xs" />
            <span>不知道选哪个？先随意选一个吧~</span>
          </div>
        </div>

        {/* ================= SECTION 3: 这件事带给你的痛感有多强？ ================= */}
        <div className="p-4.5 bg-white/65 backdrop-blur-lg border border-white/45 rounded-[32px] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#5E7F73] text-white font-black text-[11px] flex items-center justify-center">
              3
            </span>
            <h3 className="text-[13.5px] font-black text-[#1E3F39]">
              这件事带给你的痛感有多强？
            </h3>
          </div>

          {/* Interactive Sliding scale track with pure floating faces */}
          <div className="relative pt-2 pb-4 px-3">
            <div className="flex justify-between items-center px-1 mb-2 text-[10.5px] text-stone-400 font-extrabold select-none">
              <span>几乎没有 (1)</span>
              <span>非常痛苦 (7)</span>
            </div>

            <div className="relative py-6 flex items-center select-none">
              {/* Background horizontal grey connection track */}
              <div className="absolute inset-x-3.5 h-1.5 bg-stone-200/50 rounded-full z-0 overflow-hidden w-[96%]">
                {/* Active filled track of the slider bar, using HSL smooth gradient interpolation updated live */}
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((painValue - 1) / 6) * 100}%`,
                    background: `linear-gradient(to right, ${getPainColorHSL(1).bg}, ${getPainColorHSL(painValue).bg})`
                  }}
                />
              </div>

              {/* Range input container overlay for seamless touch drag response */}
              <input 
                type="range"
                min="1"
                max="7"
                step="1"
                value={painValue}
                onChange={(e) => setPainValue(Number(e.target.value))}
                className="absolute inset-0 w-full h-12 opacity-0 cursor-pointer z-35 touch-none"
              />

              {/* The points on the track */}
              <div className="absolute inset-x-0 flex justify-between items-center z-10 w-full pointer-events-none">
                {emojisList.map((emoji) => {
                  const isSelected = painValue === emoji.value;
                  const colorInfo = getPainColorHSL(emoji.value);
                  const activeColorInfo = getPainColorHSL(painValue);

                  return (
                    <div
                      key={emoji.value}
                      className="flex flex-col items-center justify-center select-none w-10 relative cursor-pointer"
                      onClick={() => setPainValue(emoji.value)}
                    >
                      {/* Floating Emoji Face with beautiful dynamic state */}
                      <motion.div
                        animate={{
                          y: isSelected ? -12 : 0,
                          scale: isSelected ? 1.35 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                        className="relative z-10 flex flex-col items-center"
                      >
                        {/* Aura glow circle behind the selected emoji */}
                        {isSelected && (
                          <motion.div
                            layoutId="activePainGlow"
                            className="absolute -inset-2.5 rounded-full blur-md opacity-75 -z-10 transition-colors duration-300 animate-pulse"
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
                      </motion.div>

                      {/* Numeric Label */}
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

          <div className="p-2.5 rounded-2xl bg-amber-400/8 border border-amber-400/15 text-[10.5px] text-amber-800 font-bold flex items-center gap-1.5">
            <GlassIcon emoji="☀️" size="xs" />
            <span>诚实面对痛感，才能真正找到改变的动力</span>
          </div>
        </div>

        {/* ================= SECTION 4: 此刻你的身体有什么感受？ ================= */}
        <div className="p-4.5 bg-white/65 backdrop-blur-lg border border-white/45 rounded-[32px] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#5E7F73] text-white font-black text-[11px] flex items-center justify-center">
              4
            </span>
            <h3 className="text-[13.5px] font-black text-[#1E3F39]">
              此刻你的身体有什么感受？
            </h3>
            <span className="text-[10px] text-stone-400 font-bold ml-1">
              (可多选)
            </span>
          </div>

          {/* Grid feelings selection */}
          <div className="grid grid-cols-3 gap-2">
            {bodyFeelings.map((feel, idx) => {
              const isSelected = bodyExperiences.includes(feel.name);
              return (
                <button
                  key={idx}
                  onClick={() => handleBodyExperienceToggle(feel.name)}
                  className={`py-3 px-1 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-[11px] font-extrabold cursor-pointer relative overflow-hidden ${
                    isSelected 
                      ? "bg-[#F3FAF7] border-[#81C79F] text-[#1E3F39] text-xs font-black shadow-sm scale-102" 
                      : "bg-white/40 border-stone-200/40 text-stone-600 hover:bg-white hover:scale-102"
                  }`}
                >
                  <GlassIcon emoji={feel.name} size="md" className="w-9 h-9 mb-0.5 shrink-0" />
                  <span>{feel.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 rounded-2xl bg-[#5E7F73]/5 border border-[#5E7F73]/10 text-[10.5px] text-[#426156] font-bold flex items-center gap-1.5">
            <GlassIcon emoji="🌱" size="xs" />
            <span>关注身体信号，它会告诉你很多</span>
          </div>
        </div>
      </div>

      {/* 4. Elegant custom floating panel with draft link and double actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-white/70 backdrop-blur-xl border-t border-white/40 z-30 flex items-center justify-between gap-2.5">
        
        {/* Left side Draft Link */}
        <button
          onClick={() => handlePublish(false, false, true)}
          className="flex items-center gap-1 text-stone-500 hover:text-stone-700 font-black text-xs px-2.5 cursor-pointer active:scale-95 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>保存草稿</span>
        </button>

        {/* Action button pills on the right */}
        <div className="flex gap-2 flex-1 justify-end max-w-[270px]">
          {/* 快记转剖析: Light teal glass background capsule button */}
          <button
            onClick={() => handlePublish(true, false)}
            className="flex-1 py-3 px-1 rounded-full text-[12px] font-black text-[#1E3F39] bg-gradient-to-r from-sky-200/55 via-teal-100/55 to-[#E9F8DF]/65 border border-teal-200 hover:scale-102 active:scale-95 transition-all duration-300 flex items-center justify-center tracking-tight shadow-xs cursor-pointer text-center"
          >
            快记转剖析
          </button>
          
          {/* 开始反思: Bright peach orange solid gradient capsule button */}
          <button
            onClick={() => handlePublish(true, true)}
            className="flex-1 py-3 px-1 rounded-full text-[12px] font-black text-white bg-gradient-to-r from-[#FCD34D] via-[#F59E0B] to-[#F97316] hover:brightness-105 hover:scale-102 active:scale-95 transition-all duration-300 flex items-center justify-center tracking-tight shadow-md cursor-pointer text-center"
          >
            开始反思
          </button>
        </div>

      </div>

      {/* Exit confirmation modal sheet Overlay */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 bg-[#1E3F39]/60 backdrop-blur-xs z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[28px] p-6 max-w-xs w-full border border-stone-200 shadow-xl space-y-4.5"
            >
              <div className="text-center space-y-2 flex flex-col items-center">
                <GlassIcon emoji="📝" size="md" />
                <h3 className="text-sm font-black text-stone-900">保存草稿提醒</h3>
                <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                  你输入的思考痕迹尚未发布。是否将其保存在草稿箱，以便随时回来恢复书写？
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    handlePublish(false, false, true);
                    setShowExitConfirm(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-[#1E3F39] hover:bg-[#1E3F39]/90 text-white font-black text-xs shadow-xs cursor-pointer text-center"
                >
                  💾 保存草稿并退出
                </button>
                <button 
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs cursor-pointer text-center"
                >
                  🗑️ 放弃并丢弃内容
                </button>
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-2 rounded-full text-stone-400 font-bold text-xs hover:text-stone-600 cursor-pointer text-center"
                >
                  继续编辑
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



    </div>
  );
}
