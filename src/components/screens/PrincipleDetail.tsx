import React from "react";
import { ArrowLeft, Clock, Activity, ShieldAlert, AlertCircle, Edit3, Volume2, X, Sparkles, Copy, Check, Download } from "lucide-react";
import { MistakeEntry } from "../../types";
import { safeCopyToClipboard } from "../../utils";
import GlassIcon from "../GlassIcon";

interface PrincipleDetailProps {
  principle: MistakeEntry;
  onBack: () => void;
  onSetupReminder: (entry: MistakeEntry) => void;
  onEdit: (id: string) => void;
}

export default function PrincipleDetail({ principle, onBack, onSetupReminder, onEdit }: PrincipleDetailProps) {
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [isCopiedShare, setIsCopiedShare] = React.useState(false);
  const [shareTheme, setShareTheme] = React.useState<"emerald" | "charcoal" | "sand">("emerald");

  // State & handler declarations for custom interactive bubble popover & tactile feedback
  const [showBubbleMenu, setShowBubbleMenu] = React.useState(false);
  const [bubbleMenuPos, setBubbleMenuPos] = React.useState({ x: 0, y: 0 });
  const bubbleMenuRef = React.useRef<HTMLDivElement>(null);
  const longPressTimer = React.useRef<any>(null);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(25);
      } catch (e) {
        // Safe fallback in restrictive container sandboxes
      }
    }
  };

  const touchStartPos = React.useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 1) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      triggerHaptic();
      setBubbleMenuPos({ x, y });
      setShowBubbleMenu(true);
    }, 550); // 550ms hold is highly responsive
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      if (dx > 12 || dy > 12) { // Allow minor finger wiggles under 12px
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Visual default calculations
  const runsCount = principle.id === "m-1" ? 28 : principle.id === "m-3" ? 16 : 5;
  const recentRun = principle.id === "m-1" ? "今天 09:30" : "2026-06-11 20:00";

  return (
    <div className="flex-1 flex flex-col bg-transparent h-full text-neutral-800 relative">
      
      {/* Header bar */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-white/20 bg-white/45 sticky top-0 backdrop-blur-md z-40">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-stone-200/50">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <span className="text-sm font-semibold font-display tracking-wider text-sage-dark">
          原则卡详情
        </span>
        <button
          onClick={() => onEdit(principle.id)}
          className="text-stone-500 hover:text-sage p-2 -mr-2"
        >
          <Edit3 className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-24">
        {/* Core header panel with Leaf styling */}
        <div className="text-center relative py-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/15 p-5 rounded-3xl overflow-hidden">
          {/* Aesthetic background mesh */}
          <div className="absolute inset-0 hologram-orb-1 opacity-20 pointer-events-none" />
          
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] text-sage font-extrabold uppercase tracking-widest font-mono">
              原则防线守中
            </span>
          </div>
          
          <h1 className="text-lg font-black text-sage-dark mt-2.5 font-display tracking-tight leading-snug">
            {principle.title || "技术自洽行为标准"}
          </h1>
          
          <p className="text-xs text-stone-500 mt-1 font-mono font-bold">
            状态：<span className="text-emerald-700">正在复盘验证中</span>
          </p>
        </div>

        {/* Dynamic Warning Signal Indicators */}
        <div className="bg-[#C35A3A]/5 border border-[#C35A3A]/15 p-4 rounded-2xl flex gap-3">
          <ShieldAlert className="w-5 h-5 text-[#C35A3A] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-[#C35A3A]">
              警报发生器 (预警信号)
            </h4>
            <p className="text-xs text-stone-700 font-medium leading-relaxed mt-1">
              下一次发言超过1分钟，且讲不出核心论据，感到心跳加速、内心防卫急躁。
            </p>
          </div>
        </div>

        {/* Segment Cards */}
        <div className="space-y-4">
          
          {/* 1. 行为大口诀 */}
          <div className="clm-card p-5 relative">
            <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase mb-2 flex items-center gap-1">
              <GlassIcon emoji="💡" size="xs" /> 核心防御口诀
            </div>
            <p className="text-sm font-extrabold text-sage-dark italic leading-relaxed">
              “{principle.principleText}”
            </p>
          </div>

          {/* 2. 错题来源 */}
          <div className="clm-card p-5">
            <div className="text-[10px] font-black text-[#7B7268] tracking-wider uppercase mb-2 flex items-center gap-1">
              <GlassIcon emoji="🔍" size="xs" /> 错题漏洞来源
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-semibold">
              在会议、述职或核心沟通汇报表达细节散碎，主张急切且极度抗拒异口发言，以至于粗鲁打席同事，形成严重周例冲突：
            </p>
            <p className="text-[11px] text-mocha font-medium italic mt-2 border-l-2 border-stone-300 pl-2.5">
              “{principle.rawText}”
            </p>
          </div>

          {/* 3. 触发场景 */}
          <div className="clm-card p-5">
            <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase mb-2 flex items-center gap-1">
              <GlassIcon emoji="🪵" size="xs" /> 触发场景划分
            </div>
            <p className="text-xs text-stone-700 font-semibold leading-relaxed">
              主要触发地点：双周汇报会、研发上线前评审以及和直属 Leader 的个人答辩。
            </p>
          </div>

          {/* 4. Action in 24h */}
          {principle.nextAction && (
            <div className="bg-stone-50 border border-stone-200 p-5 rounded-3xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black text-stone-450 tracking-wider uppercase flex items-center gap-1">
                  <GlassIcon emoji="⚡" size="xs" /> 24小时内极小动作
                </div>
                <p className="text-xs font-semibold text-stone-600 mt-1.5 leading-relaxed">
                  {principle.nextAction}
                </p>
              </div>
              <div className="shrink-0 p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* 笃行日历 小插件 - Practice Calendar Widget */}
          <div className="clm-card p-5 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black text-stone-400 tracking-wider uppercase border-b border-stone-100 pb-2">
              <span className="flex items-center gap-1.5"><GlassIcon emoji="📅" size="xs" /> 笃行日历 • Practice Calendar</span>
              <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full scale-95 border border-emerald-100">本月连续达标 8 天</span>
            </div>

            {(() => {
              let missedArray = [3, 7, 13];
              if (principle.id === "m-3") {
                missedArray = [2, 6, 10, 14];
              } else if (principle.id !== "m-1") {
                missedArray = [1, 5, 9, 11, 15];
              }
              const elapsedDays = 16;
              const completedDays = elapsedDays - missedArray.filter(d => d <= elapsedDays).length;
              const rate = Math.round((completedDays / elapsedDays) * 100);
              const radius = 28;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (rate / 100) * circumference;

              return (
                <>
                  {/* Circular Progress rate banner */}
                  <div className="bg-gradient-to-br from-[#EAF8F1]/60 to-[#E0F0F8]/20 border border-emerald-555/10 p-4 rounded-2xl flex items-center gap-4">
                    <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                      <svg className="w-18 h-18 transform -rotate-90">
                        <circle
                          cx="36"
                          cy="36"
                          r={radius}
                          className="stroke-stone-100"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        <circle
                          cx="36"
                          cy="36"
                          r={radius}
                          className="stroke-emerald-650 transition-all duration-1000 ease-out"
                          strokeWidth="5"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-black text-emerald-850 leading-none">{rate}%</span>
                        <span className="text-[7px] text-stone-450 font-bold tracking-tight mt-0.5">月达成率</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="text-xs font-black text-[#1E3F39] flex items-center gap-1">
                        <GlassIcon emoji="🏆" size="xs" /> {rate >= 80 ? "卓越：防线坚若磐石" : rate >= 70 ? "积极：原则执行得力" : "持守：防线正在筑牢"}
                      </div>
                      <p className="text-[11px] text-stone-550 leading-normal">
                        本月（截至今日第<span className="font-mono font-extrabold text-[#1E3F39] mx-0.5">{elapsedDays}</span>天），在预警场景中共执行防护并自省打卡
                        <span className="font-mono font-extrabold text-emerald-600 mx-0.5">{completedDays}</span>次，偏离或遗漏记录
                        <span className="font-mono font-extrabold text-[#C35A3A] mx-0.5">{elapsedDays - completedDays}</span>次。
                      </p>
                      <div className="text-[9px] font-extrabold text-[#1E3F39] bg-emerald-500/10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md">
                        <GlassIcon emoji="🚀" size="xs" /> 帮您避开潜在复发冲突/拖延共计 {completedDays * 2} 次
                      </div>
                    </div>
                  </div>

                  {/* Calendar Days grid */}
                  <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center pt-2">
                    {["日", "一", "二", "三", "四", "五", "六"].map((w) => (
                      <div key={w} className="text-[10px] font-black text-stone-450 uppercase">{w}</div>
                    ))}
                    {/* June 2026 starts on Monday, so 1 empty block representing Sunday */}
                    <div className="text-xs p-1" />
                    
                    {/* 30 days of June 2026 */}
                    {Array.from({ length: 30 }).map((_, idx) => {
                      const day = idx + 1;
                      const isMissed = missedArray.includes(day);
                      const isPassed = day <= elapsedDays;
                      const isFuture = day > elapsedDays;
                      const isCheckedIn = isPassed && !isMissed;

                      return (
                        <div key={day} className="flex flex-col items-center justify-center relative">
                          <span className="text-[9px] font-mono font-bold text-stone-400 mb-1">{day}</span>
                          {isCheckedIn ? (
                            <div className="w-6 h-6 rounded-full bg-[#EAF8F1] border border-[#C6F2D6] flex items-[#1EBE70] justify-center text-[11px] font-black text-[#1EBE70] shadow-3xs hover:scale-105 transition-transform" title="日日自省・守正知行">
                              ✓
                            </div>
                          ) : isMissed ? (
                            <div className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200/70 flex items-center justify-center text-[9px] text-[#C35A3A] font-black shadow-3xs cursor-help tooltip hover:border-red-300" title="自省断裂点 • 此日未打卡或防卫复发">
                              ✕
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center text-[8px] text-stone-300" title="未进入审核周期" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Visual Legends */}
            <div className="flex justify-between items-center text-[9px] text-stone-450 pt-2 border-t border-dashed border-stone-100">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#EAF8F1] border border-[#C6F2D6] flex items-center justify-center text-[7px] text-[#1EBE70] font-black">✓</span>
                践行守诺
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-100 border border-stone-200/70 flex items-center justify-center text-[7px] text-[#C35A3A] font-black">✕</span>
                未打卡断裂点
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-50 border border-dashed border-stone-200" />
                未来/无记录
              </span>
            </div>
          </div>

          {/* 5. Execution record counts */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl flex gap-3.5 items-center">
            <div className="p-3 bg-emerald-500/10 text-sage rounded-2xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-sage-dark">
                原则执行记录
              </div>
              <p className="text-[11px] text-mocha mt-1 font-medium leading-normal">
                共记录执行 <span className="font-extrabold text-sage font-mono">{runsCount}</span> 次，最近一次触发审查于 <span className="text-stone-700 font-semibold">{recentRun}</span>。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating utility bar panels */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F7F3EC]/95 backdrop-blur-md border-t border-stone-200/50 p-4 flex gap-2 z-30 animate-[slideUp_0.3s_ease]">
        <button
          onClick={() => {
            triggerHaptic();
            onSetupReminder(principle);
          }}
          className="flex-1 py-3 border border-stone-300 text-stone-605 font-black bg-stone-50 hover:bg-stone-100 text-[10.5px] rounded-full tracking-wide shadow-3xs active:scale-98 transition-all flex items-center justify-center gap-1"
        >
          <span>设置提醒</span> <GlassIcon emoji="⏰" size="xs" />
        </button>
        <button
          onClick={() => {
            triggerHaptic();
            setShowShareModal(true);
          }}
          className="flex-1 py-3 border border-emerald-500/20 text-[#1F453E] bg-[#EAF8F1] hover:bg-[#D5F3E4] font-black text-[10.5px] rounded-full tracking-wide flex items-center justify-center gap-1 active:scale-98 transition-all cursor-pointer shadow-3xs animate-fade-in-btn"
          id="generate-share-card-btn"
        >
          <span>生成分享卡</span> <GlassIcon emoji="🖼️" size="xs" />
        </button>
        <button
          onClick={() => {
            triggerHaptic();
            onEdit(principle.id);
          }}
          className="flex-1 py-3 bg-gradient-to-r from-[#1E3F39] to-emerald-700 hover:brightness-[1.04] text-white font-black text-[10.5px] rounded-full tracking-wide flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          调整此原则
        </button>
      </div>

      {/* Share Image Card Popup Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-110 flex items-center justify-center p-4 animate-[fadeIn_0.20s_ease]">
          <div className="bg-[#FFFDF9] border border-[#ECE8D7] rounded-[36px] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[85vh] relative animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              .animate-fade-in-btn {
                animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
              }
              .animate-scale-in-bubble {
                animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
              }
            `}</style>

            {/* Header control bar */}
            <div className="p-4 border-b border-stone-200/50 flex justify-between items-center bg-[#FFFDF9]/80 backdrop-blur-xs">
              <div className="flex items-center gap-1.5">
                <GlassIcon emoji="🖼️" size="xs" />
                <span className="text-xs font-black text-[#1E3F39]">错了吗 • 自省分享卡</span>
              </div>
              <button 
                onClick={() => {
                  triggerHaptic();
                  setShowShareModal(false);
                }}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer transition-colors"
                id="close-share-modal"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Toggle themes */}
            <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-100 flex justify-between items-center gap-2">
              <span className="text-[9.5px] text-stone-400 font-extrabold font-mono uppercase">Select Preset</span>
              <div className="flex gap-1">
                {[
                  { id: "emerald", label: "林间森意", colors: "bg-[#1E3F39]" },
                  { id: "charcoal", label: "极简暗流", colors: "bg-stone-900" },
                  { id: "sand", label: "沙砾诗篇", colors: "bg-[#DCD5C6]" }
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      triggerHaptic();
                      setShareTheme(th.id as any);
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-black transition-all border flex items-center gap-1 ${
                      shareTheme === th.id 
                        ? "bg-white text-stone-850 shadow-3xs border-stone-200" 
                        : "bg-transparent text-stone-500 border-transparent hover:bg-stone-100"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${th.colors}`} />
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable container for Card Preview */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              
              {/* Dynamic Theme Card Container */}
              <div 
                id="principle-share-card-canvas"
                onContextMenu={(e) => {
                  e.preventDefault();
                  triggerHaptic();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setBubbleMenuPos({ x: e.clientX - rect.left, y: Math.max(10, e.clientY - rect.top - 50) });
                  setShowBubbleMenu(true);
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onClick={() => {
                  triggerHaptic();
                  if (showBubbleMenu) {
                    setShowBubbleMenu(false);
                  }
                }}
                className={`w-full rounded-[28px] p-6.5 shadow-lg relative overflow-hidden transition-all duration-300 select-none cursor-pointer ${
                  shareTheme === "emerald" 
                    ? "bg-gradient-to-br from-[#1E3F39] to-[#254F46] text-[#FFFDF4]" 
                    : shareTheme === "charcoal"
                      ? "bg-gradient-to-br from-[#111111] to-[#1E2022] text-[#F3EFE9]"
                      : "bg-gradient-to-br from-[#F5F2EB] to-[#DFD9CE] text-[#2E2E2A] border border-[#D3CABB]/60"
                }`}
              >
                {/* Visual Accent circles */}
                <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-2xl opacity-15 pointer-events-none ${
                  shareTheme === "emerald" ? "bg-[#C0E890]" : shareTheme === "charcoal" ? "bg-amber-400" : "bg-[#5E7F73]"
                }`} />

                {/* Card Watermark Header */}
                <div className="flex justify-between items-center mb-5 border-b pb-3.5 border-white/10">
                  <div className="flex items-center gap-1">
                    <span className={`inline-block text-[12px] font-black tracking-widest px-2 py-0.5 rounded text-center ${
                        shareTheme === "sand" ? "bg-[#2E2E2A] text-white" : "bg-white/15 text-white"
                      }`}
                    >
                      错了吗
                    </span>
                    <span className={`text-[8.5px] font-mono tracking-wider font-extrabold uppercase ${
                      shareTheme === "sand" ? "text-stone-500" : "text-white/40"
                    }`}>
                      • ALIGNSIGHTS
                    </span>
                  </div>
                  <span className={`inline-block text-[8.5px] font-mono font-bold text-center ${
                      shareTheme === "sand" ? "text-stone-550 bg-stone-200/50" : "text-white/60 bg-white/10"
                    } px-2.5 py-0.5 rounded-full`}
                  >
                    No More Than Two Mistakes
                  </span>
                </div>

                {/* Subtitle / Meta */}
                <div className="space-y-1">
                  <div className={`text-[9px] font-mono tracking-widest font-extrabold uppercase flex items-center gap-1 ${
                    shareTheme === "sand" ? "text-indigo-900/70" : "text-[#C0E890]"
                  }`}>
                    〔 不二过行动原则卡 <GlassIcon emoji="🎖️" size="xs" /> 〕
                  </div>
                  <h3 className={`text-base font-black tracking-tight leading-snug mt-1.5 ${
                    shareTheme === "sand" ? "text-stone-900" : "text-white"
                  }`}>
                    {principle.title || "技术沟通心智原则"}
                  </h3>
                </div>

                {/* Core Dictum (口诀) in beautiful typography display container */}
                <div className={`mt-5 p-4 rounded-2xl relative ${
                  shareTheme === "emerald" 
                    ? "bg-[#132C28] text-[#C0E890]/90 border border-white/5" 
                    : shareTheme === "charcoal"
                      ? "bg-stone-950/50 text-amber-200 border border-white/5"
                      : "bg-white/95 text-stone-800 border border-[#D3CABB]/40 shadow-xs"
                }`}>
                  <span className="absolute left-2.5 top-1 text-2xl opacity-10 select-none">“</span>
                  <p className="text-xs font-black leading-relaxed italic pl-3 pr-2 tracking-wide">
                    {principle.principleText}
                  </p>
                  <span className="absolute right-3.5 bottom-1 text-2xl opacity-10 select-none">”</span>
                </div>

                {/* Targeted original mistake row */}
                <div className="mt-5 space-y-1.5 pb-1">
                  <div className={`text-[8px] font-bold tracking-widest uppercase flex items-center gap-1 ${
                    shareTheme === "sand" ? "text-stone-450" : "text-white/45"
                  }`}>
                    <GlassIcon emoji="🎯" size="xs" /> 自省漏洞指向
                  </div>
                  <p className={`text-[9.5px] leading-relaxed font-semibold ${
                    shareTheme === "sand" ? "text-stone-700" : "text-white/75"
                  }`}>
                    {principle.rawText || "表达汇报散碎，主张急切且极度抗拒异口发言，以至于冲突。"}
                  </p>
                </div>

                {/* Trigger scene and Next action */}
                <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 border-white/10">
                  <div className="space-y-1">
                    <div className={`text-[8px] font-bold tracking-wider uppercase flex items-center gap-1 ${
                      shareTheme === "sand" ? "text-stone-450" : "text-white/40"
                    }`}>
                      <GlassIcon emoji="🪵" size="xs" /> 核心触发场景
                    </div>
                    <p className={`text-[9px] leading-relaxed font-semibold ${
                      shareTheme === "sand" ? "text-stone-755" : "text-white/80"
                    }`}>
                      双周汇报、评审会议及答辩工作
                    </p>
                  </div>
                  {principle.nextAction && (
                    <div className="space-y-1">
                      <div className={`text-[8px] font-bold tracking-wider uppercase flex items-center gap-1 ${
                        shareTheme === "sand" ? "text-stone-450" : "text-white/40"
                      }`}>
                        <GlassIcon emoji="⚡" size="xs" /> 24h内极小动作
                      </div>
                      <p className={`text-[9px] leading-relaxed font-semibold ${
                        shareTheme === "sand" ? "text-stone-755" : "text-white/80"
                      }`}>
                        {principle.nextAction}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card footer decorative stamp */}
                <div className="mt-5.5 flex justify-between items-center border-t border-dashed pt-3.5 border-white/10 text-[8px] font-mono">
                  <div className={`${shareTheme === "sand" ? "text-stone-500" : "text-white/40"}`}>
                    ID: {principle.id.toUpperCase()} • DEEP REFLECTION
                  </div>
                  <div className="flex items-center gap-1 text-[#13B15E] font-extrabold">
                    <span>APPROVED CERTIFICATE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#13B15E]" />
                  </div>
                </div>

                {/* Custom Bubble Popover Menu */}
                {showBubbleMenu && (
                  <div 
                    ref={bubbleMenuRef}
                    style={{ left: `${bubbleMenuPos.x}px`, top: `${bubbleMenuPos.y}px` }}
                    className="absolute z-120 bg-[#FFFDF9]/95 backdrop-blur-md border border-stone-200/80 shadow-2xl rounded-2xl py-2 px-1 w-32 flex flex-col gap-0.5 animate-scale-in text-stone-800 scale-100 origin-top-left shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic();
                        setShowBubbleMenu(false);
                        const content = `【错了吗 • 行动原则分享卡】\n------------------------------\n🎯 原则主题: ${principle.title}\n💬 核心口诀: “${principle.principleText}”\n⚠️ 针对漏洞: ${principle.rawText || "暂无"}\n⚡ 24h行动: ${principle.nextAction || "暂无"}\n------------------------------\n不让眼泪白流，做最温柔的行动派。`;
                        safeCopyToClipboard(content).then(() => {
                          setIsCopiedShare(true);
                          setTimeout(() => setIsCopiedShare(false), 2000);
                        }).catch(() => {});
                      }}
                      className="text-[10px] w-full text-left font-black px-2.5 py-1.5 rounded-lg hover:bg-stone-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <GlassIcon emoji="📋" size="xs" />
                      <span>复制卡片文本</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic();
                        setShowBubbleMenu(false);
                        alert("🖼️ 折射投影生成成功！分享卡片已被成功保存至相册成果库！");
                        setShowShareModal(false);
                      }}
                      className="text-[10px] w-full text-left font-black px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>💾</span>
                      <span>保存至相册</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic();
                        setShowBubbleMenu(false);
                      }}
                      className="text-[9.5px] text-stone-400 font-extrabold w-full text-center py-1 mt-1 border-t border-stone-100 hover:text-stone-600 transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                )}

              </div>

              {/* Toast info */}
              <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-2xl flex gap-2 items-start">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[9.5px] text-amber-900 font-bold leading-normal">
                  自省行动卡已被精心渲染为符合「错了吗」极简高逼格视觉比例的美学数字卡片。长按卡片可调出快速保存气泡。
                </p>
              </div>

            </div>

            {/* Bottom Sharing Action bar */}
            <div className="p-4 bg-white border-t border-stone-200/50 flex gap-2 w-full rounded-b-[36px] animate-fade-in-btn">
              <button
                onClick={() => {
                  triggerHaptic();
                  const content = `【错了吗 • 行动原则分享卡】\n------------------------------\n🎯 原则主题: ${principle.title}\n💬 核心口诀: “${principle.principleText}”\n⚠️ 针对漏洞: ${principle.rawText || "暂无"}\n⚡ 24h行动: ${principle.nextAction || "暂无"}\n------------------------------\n不让眼泪白流，做最温柔的行动派。`;
                  safeCopyToClipboard(content).then(() => {
                    setIsCopiedShare(true);
                    setTimeout(() => setIsCopiedShare(false), 2000);
                  }).catch(() => {});
                }}
                className="flex-1 py-2.5 border border-stone-300 rounded-full font-black text-[11px] tracking-wide text-stone-700 flex items-center justify-center gap-1 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
              >
                {isCopiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedShare ? "已复制成功" : "拷贝卡片文本"}</span>
              </button>
              <button
                onClick={() => {
                  triggerHaptic();
                  alert("🖼️ 折射投影生成成功！分享卡片已被成功保存至相册成果库！");
                  setShowShareModal(false);
                }}
                className="flex-1 py-2.5 bg-[#1E3F39] hover:bg-[#132C28] text-white rounded-full font-black text-[11px] tracking-wide flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>保存分享图</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
