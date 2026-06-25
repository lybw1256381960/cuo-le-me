import React, { useState } from "react";
import { ArrowLeft, RefreshCw, AlertOctagon, HelpCircle, Save } from "lucide-react";
import { MistakeEntry } from "../../types";

interface RecurrenceMarkProps {
  mistake: MistakeEntry;
  onBack: () => void;
  onConfirmRecurrence: (id: string, recurrenceLogItem: {
    note: string;
    wasEffective: string;
    needsUpdate: string;
  }) => void;
}

export default function RecurrenceMark({ mistake, onBack, onConfirmRecurrence }: RecurrenceMarkProps) {
  const [similarityNote, setSimilarityNote] = useState("");
  const [effectiveness, setEffectiveness] = useState("部分有效");
  const [needsUpdate, setNeedsUpdate] = useState("需要微调");

  const effects = [
    { name: "有效", style: "border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50" },
    { name: "部分有效", style: "border-amber-200 text-amber-700 bg-[#E8A86A]/10 hover:bg-[#E8A86A]/20" },
    { name: "无效", style: "border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50" },
  ];

  const updateOptions = [
    { name: "不需要", desc: "继续坚守观察" },
    { name: "需要微调", desc: "补充触发预警细节" },
    { name: "需要重写", desc: "推翻重建5Why反思" },
  ];

  const handleConfirm = () => {
    onConfirmRecurrence(mistake.id, {
      note: similarityNote || "又一次触发了类似的场景，原则起到了部分防守作用，但依然由于急燥习惯犯错。",
      wasEffective: effectiveness,
      needsUpdate,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent h-full text-neutral-800 relative">
      {/* Header */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-white/20 bg-white/45 sticky top-0 backdrop-blur-md z-40">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-stone-200/50">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <span className="text-sm font-semibold font-display tracking-wider text-sage-dark">
          复发标记
        </span>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 pb-24">
        
        {/* Prompt Card */}
        <div className="text-center">
          <div className="inline-block p-3.5 bg-red-500/10 text-coral rounded-full mb-3 select-none animate-pulse-gently">
            <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-black text-sage-dark font-display leading-tight">
            是不是又犯了同类错误？
          </h2>
          <p className="text-xs text-mocha mt-1">
            人是在重复中学习的。标记复发不是评判处罚，而是原则卡升级的核心契机。
          </p>
        </div>

        {/* 1. Similarity note */}
        <div className="space-y-2">
          <label className="text-xs font-black text-stone-400 uppercase tracking-widest block">
            1. 这次和上次有什么相似之处？
          </label>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
            <textarea
              value={similarityNote}
              onChange={(e) => setSimilarityNote(e.target.value)}
              placeholder="写下这次复发的客观相似点。如：这次汇报还是在截止前最后一小时仓促应战，对方也同样提出了缺少依据的问题..."
              maxLength={300}
              className="w-full h-28 border-none outline-none resize-none text-sm placeholder-stone-400 text-stone-800 leading-relaxed font-medium"
            />
          </div>
        </div>

        {/* 2. Was original principle effective? */}
        <div className="space-y-3">
          <label className="text-xs font-black text-stone-400 uppercase tracking-widest block">
            2. 原则是否起到了防护效用？
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {effects.map((item) => {
              const isSelected = effectiveness === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setEffectiveness(item.name)}
                  className={`py-3 px-1 rounded-2xl text-xs font-black text-center border shadow-3xs transition-all ${
                    isSelected 
                      ? "ring-2 ring-emerald-500 bg-sage border-sage text-white font-extrabold" 
                      : `bg-white text-stone-600 ${item.style}`
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Needs update principle? */}
        <div className="space-y-3">
          <label className="text-xs font-black text-stone-400 uppercase tracking-widest block">
            3. 是否需要修正或修改此原则卡？
          </label>
          <div className="flex flex-col gap-2">
            {updateOptions.map((opt) => {
              const isSelected = needsUpdate === opt.name;
              return (
                <button
                  key={opt.name}
                  onClick={() => setNeedsUpdate(opt.name)}
                  className={`p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                    isSelected 
                      ? "bg-sage border-sage text-white font-bold shadow-xs" 
                      : "bg-white border-stone-200 text-[#20302D] hover:bg-stone-50"
                  }`}
                >
                  <div>
                    <span className="text-xs font-extrabold block">{opt.name}</span>
                    <span className={`text-[10px] mt-0.5 block ${isSelected ? "text-emerald-100" : "text-stone-400"}`}>
                      {opt.desc}
                    </span>
                  </div>
                  {isSelected && <span className="text-xs font-bold font-mono">✓ Selected</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive note */}
        <div className="bg-white/70 border border-stone-200/80 p-4 rounded-2xl flex gap-2.5">
          <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-mocha leading-relaxed">
            <span className="font-bold text-sage-dark block">为何原则需要微调？</span>
            若多次复发，说明当前原则大口令的预警阈值订高了，或者下一步动作缺乏微观物理学，应当调整至能随时被执行。
          </p>
        </div>
      </div>

      {/* Floating confirm bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F7F3EC]/90 backdrop-blur-sm p-4 border-t border-stone-200/50 z-30">
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-full bg-gradient-to-r from-coral to-rose-600 hover:from-coral hover:to-rose-700 text-white font-black text-sm tracking-widest flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Save className="w-4.5 h-4.5 stroke-[2.5]" />
          确认标记为此同类犯错复发
        </button>
      </div>
    </div>
  );
}
