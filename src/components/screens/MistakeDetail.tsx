import React, { useState } from "react";
import { ArrowLeft, Brain, Sparkles, Star, AlertTriangle, AlertCircle, Edit, Calendar, CheckCircle2, RotateCcw } from "lucide-react";
import { MistakeEntry } from "../../types";
import GlassIcon from "../GlassIcon";

interface MistakeDetailProps {
  mistake: MistakeEntry;
  onBack: () => void;
  onModify: (id: string) => void;
  onMarkRecurrence: (id: string) => void;
}

export default function MistakeDetail({ mistake, onBack, onModify, onMarkRecurrence }: MistakeDetailProps) {
  const isReviewed = mistake.status !== "待反思";

  // Visual calculations
  const safePainLevel = typeof mistake.painLevel === "number" && !isNaN(mistake.painLevel) ? mistake.painLevel : 0;
  const stars = Array(Math.min(Math.max(0, safePainLevel), 5)).fill(0);

  return (
    <div className="flex-1 flex flex-col bg-transparent h-full text-neutral-800 relative">
      
      {/* Header bar */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-white/20 bg-white/45 sticky top-0 backdrop-blur-md z-40">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-stone-200/50">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <span className="text-sm font-semibold font-display tracking-wider text-sage-dark">
          错题详情
        </span>
        <button
          onClick={() => onModify(mistake.id)}
          className="text-stone-500 hover:text-sage p-2 -mr-2"
        >
          <Edit className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 pb-28">
        
        {/* Title Block & Priority ratings */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-stone-100 border border-stone-200/60 font-bold px-2 py-0.5 rounded-md text-stone-600">
              {mistake.category}
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
              mistake.status === "待反思" 
                ? "bg-amber-55 text-amber-700 border-amber-200/60" 
                : mistake.status === "复发过" 
                  ? "bg-red-50 text-red-600 border-red-100" 
                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}>
              {mistake.status}
            </span>
          </div>

          <h1 className="text-xl font-extrabold text-[#2F3E3A] font-display mt-3 leading-snug">
            {mistake.title || mistake.rawText.substring(0, 18) + "..."}
          </h1>

          <div className="flex items-center justify-between text-[11px] text-[#7B7268] mt-3 font-semibold p-2 bg-white/50 border border-stone-200/60 rounded-xl">
            <div className="flex items-center gap-1 text-coral font-bold">
              <span>痛感评级:</span>
              <span className="flex items-center gap-0.5">
                {stars.map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-coral" />
                ))}
              </span>
            </div>
            <span className="font-mono text-stone-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {mistake.createdAt}
            </span>
          </div>
        </div>

        {/* Custom Tags Section */}
        {mistake.tags && mistake.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl select-none animate-[fadeIn_0.2s_ease-out]">
            {mistake.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-white border border-emerald-200/80 text-emerald-850 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-0.5 shadow-3xs shrink-0"
              >
                <span className="text-emerald-500/70 font-semibold font-mono">#</span>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Card 1: Original Record (原始记录) */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 relative overflow-hidden">
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2.5 flex items-center gap-1.5">
            <GlassIcon emoji="📝" size="xs" /> 原始事件记录
          </h3>
          <p className="text-xs text-[#20302D] font-medium leading-relaxed mt-3 whitespace-pre-wrap">
            {mistake.rawText}
          </p>
          {mistake.background && (
            <div className="mt-4 p-3 bg-stone-50 border border-stone-100 rounded-2xl text-[11px] text-[#7C7268] leading-relaxed">
              <span className="font-bold text-[#2F3E3A]">客观背景: </span>
              {mistake.background}
            </div>
          )}
          
          {/* Physical status chips */}
          <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3.5 border-t border-stone-100">
            {mistake.bodySignals.map((sig, idx) => (
              <span key={idx} className="bg-emerald-50/50 text-sage border border-emerald-100 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                <GlassIcon emoji="🫁" size="xs" /> {sig}
              </span>
            ))}
            {mistake.emotions.map((emo, idx) => (
              <span key={idx} className="bg-stone-100 text-stone-500 border border-stone-200 text-[10px] px-2.5 py-1 rounded-full font-bold">
                🧩 {emo}
              </span>
            ))}
          </div>
        </div>

        {/* Card 2: 5Why reasons chain (if analyzed) */}
        {isReviewed ? (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-black text-sage uppercase tracking-widest border-b border-stone-100 pb-2.5 flex items-center gap-1.5">
              <GlassIcon emoji="🧠" size="xs" /> 5Why 逻辑因果因
            </h3>
            
            {/* Visual tree lists from 1 to 5 */}
            <div className="relative pl-3.5 space-y-4 pt-1.5">
              {/* Vertical link line */}
              <div className="absolute top-4 left-[9px] bottom-6 w-[2px] bg-dashed bg-gradient-to-b from-sage/60 via-amber-300/60 to-coral/60" />
              
              {[
                { label: "1. 直接原因", value: mistake.directCause },
                { label: "2. 近因", value: mistake.nearCause },
                { label: "3. 中间原因", value: mistake.middleCause },
                { label: "4. 远因", value: mistake.distantCause },
                { label: "5. 根本原因", value: mistake.rootCause, isRoot: true },
              ].map((row, idx) => (
                <div key={idx} className="relative flex gap-3.5 items-start">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 relative z-10 ${
                    row.isRoot 
                      ? "bg-coral text-white shadow-xs" 
                      : "bg-sage/20 text-sage"
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-[11px] font-black text-[#5E7F73]">{row.label}</h4>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      row.isRoot 
                        ? "text-coral font-bold bg-coral/5 border border-coral/10 p-2.5 rounded-xl" 
                        : "text-[#20302D] font-medium"
                    }`}>
                      {row.value || "未录入详细关联内容"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {mistake.improvementStrategy && (
              <div className="mt-5 p-4 bg-gradient-to-br from-emerald-50/55 to-green-50/30 border border-emerald-100 rounded-2xl">
                <div className="text-xs font-bold text-sage mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 长期改善对策
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-semibold">
                  {mistake.improvementStrategy}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-5 text-center">
            <AlertCircle className="w-9 h-9 text-coral/80 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-coral">尚未进行深度反思</h3>
            <p className="text-[11px] text-mocha mt-1.5 max-w-xs mx-auto leading-relaxed">
              这条错题还没有开始进行 5Why 五层因果拆解，尚无法提炼和生成核心动作原则。
            </p>
            <button
              onClick={() => onModify(mistake.id)}
              className="mt-4 px-5 py-2.5 rounded-full bg-sage hover:bg-sage-dark text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
            >
              一键开启 5Why 复盘
            </button>
          </div>
        )}

        {/* Card 3: Principle Card (原则卡) details */}
        {isReviewed && mistake.principleText && (
          <div className="bg-gradient-to-b from-white to-stone-50/50 rounded-3xl border border-stone-200/80 p-5 shadow-sm space-y-3 relative overflow-hidden">
            <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b border-stone-100 pb-2.5 flex items-center gap-1.5">
              <GlassIcon emoji="💡" size="xs" /> 自备行动原则卡
            </h3>
            <div className="mt-2 text-sm font-extrabold text-[#2F3E3A] italic leading-relaxed">
              “{mistake.principleText}”
            </div>
            {mistake.nextAction && (
              <div className="mt-3 pt-3 border-t border-dashed border-stone-200 text-[11px] text-mocha flex items-center gap-1.5 font-semibold">
                <span className="bg-[#E8A86A]/20 border border-[#E8A86A]/30 px-2 py-0.5 rounded text-coral">
                  24h小动作
                </span>
                <span>{mistake.nextAction}</span>
              </div>
            )}
          </div>
        )}

        {/* Recurrence log history */}
        {isReviewed && mistake.recurrenceLog && mistake.recurrenceLog.length > 0 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest border-b border-stone-100 pb-2 flex items-center gap-1.5">
              <GlassIcon emoji="🚨" size="xs" /> 历史复发记录与反馈
            </h3>
            {mistake.recurrenceLog.map((log, idx) => (
              <div key={idx} className="bg-red-50/30 p-3.5 border border-red-100 rounded-2xl relative">
                <div className="text-[9px] text-stone-400 font-mono font-bold">{log.date}</div>
                <p className="text-xs text-[#2F3E3A] leading-relaxed mt-1">{log.note}</p>
                <div className="flex gap-2 mt-2.5">
                  <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded">
                    针对原则：{log.wasEffective}
                  </span>
                  <span className="text-[9px] font-extrabold bg-[#E8A86A]/10 text-coral border border-[#E8A86A]/20 px-2 py-0.5 rounded">
                    更新计划：{log.needsUpdate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Persistent floating actions button panel */}
      {isReviewed && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#F7F3EC]/90 backdrop-blur-md border-t border-stone-200/50 p-4 grid grid-cols-2 gap-3 z-30">
          <button
            onClick={() => onModify(mistake.id)}
            className="py-3.5 rounded-full border border-stone-300 text-stone-600 font-bold bg-stone-100 hover:bg-stone-200 text-xs tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            再次深度复盘
          </button>
          <button
            onClick={() => onMarkRecurrence(mistake.id)}
            className="py-3.5 rounded-full bg-gradient-to-r from-coral to-rose-600 hover:from-coral hover:to-rose-700 text-white font-black text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            标记又犯了
          </button>
        </div>
      )}
    </div>
  );
}
