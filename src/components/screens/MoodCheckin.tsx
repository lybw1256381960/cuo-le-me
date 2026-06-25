import React, { useState } from "react";
import { ChevronLeft, Check, Sparkles, Smile, MessageSquare, AlertCircle } from "lucide-react";
import GlassIcon from "../GlassIcon";

interface MoodCheckinProps {
  onClose: () => void;
  onSaveMood: (mood: string, score: number, comment: string) => void;
}

export default function MoodCheckin({ onClose, onSaveMood }: MoodCheckinProps) {
  const [sliderValue, setSliderValue] = useState(50); // 0 to 100
  const [remarks, setRemarks] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Get mood textual tags, background color, and responsive smiley emoji based on slider value
  const getMoodLevel = (val: number) => {
    if (val < 20) {
      return { 
        name: "Depressed / 委屈沮丧", 
        emoji: "😟", 
        color: "from-blue-200/50 to-stone-100/40",
        tagColor: "bg-blue-100 text-blue-800 border-blue-200",
        advice: "深灰情绪也是正常的潮汐状态。给自己一个深呼吸。"
      };
    }
    if (val < 40) {
      return { 
        name: "Nervous / 心焦防卫", 
        emoji: "😰", 
        color: "from-[#FFF9B1]/40 to-orange-100/20",
        tagColor: "bg-amber-100 text-amber-800 border-amber-200",
        advice: "感到心跳加速或急躁时，适合进行1分钟憋气预演。"
      };
    }
    if (val < 65) {
      return { 
        name: "Calm / 心若平静", 
        emoji: "😊", 
        color: "from-[#FFF9B1]/55 via-[#FFFDF2]/90 to-[#E0F0F8]/50",
        tagColor: "bg-green-100 text-[#1E3F39] border-green-200",
        advice: "海洋潮汐平衡温和。这是整理行为原则的黄金时段。"
      };
    }
    if (val < 85) {
      return { 
        name: "Healing / 能量治愈", 
        emoji: "😇", 
        color: "from-[#C0E890]/40 to-[#E0F0F8]/60",
        tagColor: "bg-[#C0E890]/35 text-[#1E3F39] border-[#C0E890]",
        advice: "温和欣喜。感谢今天对自己防守细节的理智洞察。"
      };
    }
    return { 
      name: "Bright / 豁然开朗", 
      emoji: "🤩", 
      color: "from-[#C0E890]/50 to-[#FFF9B1]/80",
      tagColor: "bg-[#FFF9B1]/60 text-amber-900 border-[#FFF9B1]",
      advice: "极佳的身心饱满度！去把这种坦荡温润带给身边的伙伴。"
    };
  };

  const activeMood = getMoodLevel(sliderValue);

  const handleSave = () => {
    onSaveMood(activeMood.name, sliderValue, remarks || "今日日常心绪平衡打卡");
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="absolute inset-0 bg-transparent z-50 flex flex-col h-full overflow-hidden">
      
      {/* 1. Header Navigation */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-white/20 bg-white/45 backdrop-blur-md">
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-stone-100 text-[#1E3F39] active:scale-90"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-black text-[#1E3F39] tracking-wider font-display">今日情绪感知 · Mood Today</span>
        <div className="w-8 h-8 rounded-full bg-[#FFF9B1]/50 flex items-center justify-center">
          <GlassIcon emoji="🌸" size="xs" className="w-4 h-4" />
        </div>
      </header>

      {/* 2. Interactive Main Area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 no-scrollbar">
        
        {/* State Banner */}
        <div className="text-center">
          <span className="text-[10px] font-extrabold text-[#5E7F73] uppercase tracking-wider font-mono">Daily Emotion Rhythm</span>
          <h2 className="text-xl font-black text-[#1E3F39] mt-1 font-display">今日心情潮汐</h2>
        </div>

        {/* Big Glassmorphic Face Dial */}
        <div 
          className={`bg-gradient-to-tr ${activeMood.color} border border-white p-8 rounded-[40px] shadow-sm flex flex-col items-center justify-center relative transition-all duration-300 min-h-60 overflow-hidden`}
        >
          {/* Glowing orbs */}
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-[#E0F0F8]/45 blur-2xl" />
          <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-[#C0E890]/45 blur-2xl" />

          {/* Dynamic expressions */}
          <div className="w-24 h-24 animate-pulse-gently relative z-10">
            <GlassIcon emoji={activeMood.emoji} size="2xl" className="w-full h-full" />
          </div>

          <span className={`text-[11px] font-black tracking-wide border px-3 py-1 rounded-full mt-6 relative z-10 shadow-xs ${activeMood.tagColor}`}>
            {activeMood.name}
          </span>

          <p className="text-[10px] text-stone-600 font-semibold text-center mt-4 max-w-xs leading-relaxed relative z-10 px-2">
            {activeMood.advice}
          </p>
        </div>

        {/* Smiley Slider knobs */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/40 shadow-xs space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black text-[#5B6B67] font-mono">
            <span>低沉潮落</span>
            <span>平静平衡</span>
            <span>欣喜高涨</span>
          </div>

          <div className="relative pt-2 pb-1">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-2.5 rounded-full appearance-none bg-stone-100 outline-none cursor-pointer accent-[#5E7F73]"
              style={{
                background: "linear-gradient(to right, #E0F0F8, #FFF9B1, #C0E890)"
              }}
            />
          </div>

          <p className="text-[11px] text-center font-bold text-stone-500">
            滑动调节值：<span className="font-mono text-xs text-stone-900 font-black">{sliderValue}%</span>
          </p>
        </div>

        {/* Input journal note */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/40 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1E3F39]">
            <MessageSquare className="w-4 h-4 text-[#5E7F73]" />
            此刻碎碎念 (可选)
          </div>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-200/50 rounded-2xl p-3 focus:outline-none focus:border-[#C0E890]"
            placeholder="写一句今日感言（如：完成了棘手挑战，身心平和）..."
          />
        </div>

        {/* Warm prompt */}
        <div className="flex gap-2 bg-stone-50 border border-stone-200/40 rounded-3xl p-4">
          <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-stone-500 font-semibold leading-relaxed">
            情绪的自检可以帮你在 5Why 犯错复盘中自动拟合感性坐标。让我们像欣赏潮涨潮落一样，如实接纳此刻的阴晴。
          </p>
        </div>

      </div>

      {/* 3. Footer Action buttons */}
      <footer className="p-5 bg-white border-t border-stone-100 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-stone-50 hover:bg-stone-150 border border-stone-200 text-stone-600 rounded-full font-bold text-xs"
        >
          取消
        </button>

        {isSaved ? (
          <button
            disabled
            className="flex-3 py-3 bg-emerald-500 text-white rounded-full font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 animate-bounce" />
            打卡成功保存中...
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex-3 py-3 bg-[#5E7F73] hover:bg-[#1E3F39] text-white rounded-full font-bold text-xs shadow-md active:scale-95"
          >
            保存打卡记录
          </button>
        )}
      </footer>

    </div>
  );
}
