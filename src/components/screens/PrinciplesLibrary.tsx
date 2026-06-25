import React, { useState } from "react";
import { Search, Filter, ShieldAlert, Sparkles, Star, Plus, VolumeX, CheckSquare } from "lucide-react";
import { MistakeEntry } from "../../types";
import { safeStorage } from "../../storage";
import GlassIcon from "../GlassIcon";

interface PrinciplesLibraryProps {
  mistakes: MistakeEntry[];
  onSelectPrinciple: (id: string) => void;
  onOpenReminderSetup: (entry: MistakeEntry) => void;
}

export default function PrinciplesLibrary({ mistakes, onSelectPrinciple, onOpenReminderSetup }: PrinciplesLibraryProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("全部");
  const [viewMode, setViewMode] = useState<"standard" | "smart">("standard");
  const [activeStreakModal, setActiveStreakModal] = useState<{
    id: string;
    title: string;
    principleText: string;
  } | null>(null);

  const filterPills = ["全部", "生效中", "待验证", "需修改"];

  // Calculate dynamic correlation intensity
  const calculateAssociation = (item: MistakeEntry) => {
    let score = 65;
    
    // 1. Tag or category match similarity across database mistakes
    const categoryMatches = mistakes.filter(m => m.id !== item.id && m.category === item.category).length;
    score += Math.min(20, categoryMatches * 6);

    // 2. Exact custom tags similarities
    if (item.tags && item.tags.length > 0) {
      const otherTags = mistakes.filter(m => m.id !== item.id).flatMap(m => m.tags || []);
      const sharedCount = item.tags.filter(t => otherTags.includes(t)).length;
      score += Math.min(14, sharedCount * 5);
    }

    return Math.min(99, score);
  };

  // Principle individual streak counter
  const getPrincipleStreak = (principleId: string) => {
    const saved = safeStorage.getItem("clm_user_evaluations");
    let evaluations: any[] = [];
    if (saved) {
      try {
        evaluations = JSON.parse(saved);
      } catch (e) {
        evaluations = [];
      }
    } else {
      // Historical seeded database
      evaluations = [
        { principleId: "m-1", score: 6, note: "和团队进行初步沟通并记录了细节疑问点", date: "2026-06-11" },
        { principleId: "m-1", score: 5, note: "会议中没有急于反击他人，而是追问事实基础", date: "2026-06-12" },
        { principleId: "m-1", score: 7, note: "沟通体验堪称完美，大家先达成一致目标，细节跟进十分默契", date: "2026-06-13" },
        { principleId: "m-1", score: 6, note: "自我感知十分清晰，平息了反响偏好", date: "2026-06-14" },
        { principleId: "m-1", score: 7, note: "对齐了交付目标，避开了无端摩擦", date: "2026-06-15" },

        { principleId: "m-3", score: 5, note: "不再拖延，写出底层设计直接开工，克服冷启动阻力", date: "2026-06-13" },
        { principleId: "m-3", score: 6, note: "拆分为小事务专注了1小时", date: "2026-06-14" },
        { principleId: "m-3", score: 6, note: "今天完美笃行达标！", date: "2026-06-15" },
      ];
    }

    const pEvals = evaluations.filter((e) => e.principleId === principleId);
    if (pEvals.length === 0) {
      return { streak: 0, history: [] };
    }

    // Sort chrono
    const history = [...pEvals].sort((a, b) => a.date.localeCompare(b.date));

    // Unique consecutive dates
    const sortedDates = Array.from(new Set(pEvals.map((e) => e.date))).sort((a, b) => b.localeCompare(a));
    const todayStr = "2026-06-15";
    const yesterdayStr = "2026-06-14";

    const latestDate = sortedDates[0];
    if (latestDate !== todayStr && latestDate !== yesterdayStr) {
      return { streak: sortedDates.length > 0 ? 1 : 0, history };
    }

    let streakVal = 0;
    let currentCheckStr = latestDate;

    while (true) {
      if (sortedDates.includes(currentCheckStr)) {
        streakVal++;
        const curDate = new Date(currentCheckStr + "T12:00:00");
        curDate.setDate(curDate.getDate() - 1);
        currentCheckStr = curDate.toISOString().substring(0, 10);
      } else {
        break;
      }
    }

    return { streak: streakVal, history };
  };

  // Fetch mistakes which generated principles
  const basePrinciples = mistakes.filter((x) => x.principleText);

  // Apply inputs logic
  const filtered = basePrinciples.filter((item) => {
    const textMatch = 
      item.title?.toLowerCase().includes(search.toLowerCase()) || 
      item.principleText?.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    if (!textMatch) return false;

    if (activeFilter === "全部") return true;
    if (activeFilter === "生效中") return item.status === "已生成原则";
    if (activeFilter === "待验证") return item.status === "待反思";
    if (activeFilter === "需修改") return item.status === "复发过";

    return true;
  });

  const getSmartGroupedPrinciples = () => {
    const list = filtered;
    const comm: MistakeEntry[] = [];
    const eff: MistakeEntry[] = [];
    const other: MistakeEntry[] = [];

    list.forEach((item) => {
      const categoryText = (item.category || "").toLowerCase();
      const rawTextStr = (item.rawText || "").toLowerCase();
      if (
        categoryText.includes("沟通") || 
        categoryText.includes("冲突") || 
        categoryText.includes("社交") || 
        categoryText.includes("情绪") ||
        rawTextStr.includes("沟通") || 
        rawTextStr.includes("例会") ||
        rawTextStr.includes("辩解") ||
        rawTextStr.includes("冲突")
      ) {
        comm.push(item);
      } else if (
        categoryText.includes("拖延") || 
        categoryText.includes("决策") || 
        categoryText.includes("高效") || 
        categoryText.includes("习惯") ||
        rawTextStr.includes("拖延") ||
        rawTextStr.includes("进度") ||
        rawTextStr.includes("困难") ||
        rawTextStr.includes("代码")
      ) {
        eff.push(item);
      } else {
        other.push(item);
      }
    });

    return [
      { id: "comm", emoji: "💬", name: "心绪及沟通情绪阻断防线", desc: "专治例会、述职答辩或协作对立中主抗、反唇及急躁自我防卫", items: comm },
      { id: "eff", emoji: "⚡", name: "效能及自律行动启动保护索", desc: "消解启动畏难性拖延、冲动情绪下决策等认知行动盲点", items: eff },
      { id: "other", emoji: "🧠", name: "认知与客观自省常规群组", desc: "关于日常习惯机制以及不特定场景的心智重构不二过资产", items: other }
    ].filter(g => g.items.length > 0);
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent pb-24">
      
      {/* Header bar */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-sage font-extrabold tracking-widest uppercase font-mono">My compiled rule assets</p>
          <h1 className="text-xl font-black text-sage-dark font-display tracking-tight mt-1">原则库</h1>
        </div>
        
        {/* View Mode Toggle: Standard List vs Smart Grouping */}
        <div className="bg-stone-100/80 p-0.5 rounded-full flex gap-0.5 items-center border border-stone-200/40 scale-95 shadow-3xs shrink-0 select-none">
          <button
            onClick={() => setViewMode("standard")}
            className={`text-sm px-3 py-1.2 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === "standard"
                ? "bg-white text-stone-850 shadow-3xs border border-stone-200/20"
                : "text-stone-550 border-transparent hover:bg-stone-50"
            }`}          >
            <GlassIcon emoji="📋" size="xs" />
            <span>列表</span>
          </button>
          <button
            onClick={() => setViewMode("smart")}
            className={`text-sm px-3 py-1.2 rounded-full font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === "smart"
                ? "bg-[#5E7F73] text-white shadow-3xs"
                : "text-stone-555 border-transparent hover:bg-[#5E7F73]/10"
            }`}          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>智能分组</span>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="px-6 space-y-3">
        <div className="relative flex items-center bg-white rounded-2xl border border-stone-200/80 px-3 py-2.5 shadow-xs">
          <Search className="w-4 h-4 text-stone-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索原则、触发场景、防守痛感..."
            className="w-full text-xs bg-transparent border-none outline-none text-stone-800 placeholder-stone-400 font-medium"
          />
        </div>

        {/* Filters Carousel scroll horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filterPills.map((pill) => {
            const isSelected = activeFilter === pill;
            return (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-bold border tracking-wide transition-all ${
                  isSelected 
                    ? "bg-sage border-sage text-white shadow-xs" 
                    : "bg-white border-stone-200 text-[#7B7268] hover:bg-stone-50"
                }`}              >
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards collection list container scroll */}
      <div className="px-6 mt-4 flex-1 space-y-4 overflow-y-auto">
        {filtered.length > 0 ? (
          viewMode === "smart" ? (
            getSmartGroupedPrinciples().map((group) => (
              <div key={group.id} className="space-y-3">
                {/* Dynamic Smart Group Header Banner */}
                <div className="bg-[#5E7F73]/5 border border-[#5E7F73]/15 rounded-2xl p-3.5 space-y-1 select-none animate-fade-in">
                  <div className="flex items-center gap-1.5 text-sage-dark font-black text-xs">
                    <GlassIcon emoji={group.emoji} size="xs" />
                    <span>{group.name}</span>
                    <span className="bg-[#5E7F73] text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded">
                      {group.items.length} 个原则
                    </span>
                  </div>
                  <p className="text-[10px] text-[#7B7268] font-bold leading-normal">{group.desc}</p>
                </div>

                <div className="space-y-4">
                  {group.items.map((item) => {
                    const runsCount = item.id === "m-1" ? 28 : item.id === "m-3" ? 16 : 5;
                    const stars = item.id === "m-1" ? 5 : item.id === "m-3" ? 4 : 3;
                    const { streak } = getPrincipleStreak(item.id);

                    return (
                      <div
                        key={item.id}
                        className="vone-interactive-card bg-white/70 backdrop-blur-[16px] rounded-3xl p-5 border border-white/60 shadow-xs relative overflow-hidden flex flex-col justify-between group transition-all duration-300 animate-fade-in"
                      >
                        {/* Streak micro-medal badge */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveStreakModal({ id: item.id, title: item.title || "温和自省原则", principleText: item.principleText || "" });
                          }}
                          className="absolute right-4 top-3.5 hover:scale-108 active:scale-95 transition-all flex items-center gap-1 bg-[#FFF9E6] hover:bg-amber-100/75 border border-amber-500/20 text-neutral-800 rounded-full px-2.5 py-1 text-[9.5px] font-black shadow-xs z-20 cursor-pointer"
                        >
                          <GlassIcon emoji="🏅" size="xs" />
                          <span className="text-stone-500 font-bold">已践行</span>
                          <span className="text-amber-700 font-sans font-black pr-0.5">{streak}天</span>
                        </button>

                        <div 
                          onClick={() => onSelectPrinciple(item.id)}
                          className="cursor-pointer flex-1"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-extrabold bg-[#E8A86A]/10 text-[#C1623C] border border-[#E8A86A]/25 px-2 py-0.5 rounded shrink-0">
                                {item.category}原则
                              </span>
                              <span className="text-[9.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/40 px-2 py-0.5 rounded shadow-3xs shrink-0 select-none flex items-center gap-1">
                                <GlassIcon emoji="⚡" size="xs" />
                                <span>关联度 {calculateAssociation(item)}%</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono font-bold shrink-0">
                              {runsCount}次执行
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-black text-sage-dark font-display leading-snug mt-3">
                            {item.title || "自定义行为原则"}
                          </h3>

                          {/* Core logic italic */}
                          <p className="text-xs text-stone-700 italic font-semibold mt-2 bg-[#E8A86A]/5 border border-[#E8A86A]/20 p-3 rounded-2xl leading-relaxed">
                            “{item.principleText}”
                          </p>

                          {/* Footer specs */}
                          <div className="mt-3.5 space-y-1 text-[11px] text-[#7B7268] leading-relaxed">
                            <div className="line-clamp-1">
                              <span className="font-bold text-sage">触发场景：</span>
                              下次遇到沟通或汇报受到质疑时
                            </div>
                            {item.nextAction && (
                              <div className="line-clamp-1">
                                <span className="font-bold text-coral">下一次动作：</span>
                                {item.nextAction}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Star rating and Action settings shortcut */}
                        <div className="mt-4 pt-3.5 border-t border-dashed border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-0.5 text-coral/80">
                            <span className="text-[10px] text-stone-400 font-bold mr-1">推荐度:</span>
                            {Array(stars).fill(0).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-coral" />
                            ))}
                          </div>

                          <button
                            onClick={() => onOpenReminderSetup(item)}
                            className="text-[10px] bg-slate-50 border border-stone-200 text-stone-500 hover:text-sage font-bold hover:bg-white px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
                          >
                            <GlassIcon emoji="⏰" size="xs" />
                            <span>{item.hasReminder ? "修改提醒" : "设置防守提醒"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            filtered.map((item) => {
              const runsCount = item.id === "m-1" ? 28 : item.id === "m-3" ? 16 : 5;
              const stars = item.id === "m-1" ? 5 : item.id === "m-3" ? 4 : 3;
              const { streak } = getPrincipleStreak(item.id);

              return (
                <div
                  key={item.id}
                  className="vone-interactive-card bg-white/70 backdrop-blur-[16px] rounded-3xl p-5 border border-white/60 shadow-xs relative overflow-hidden flex flex-col justify-between group transition-all duration-300"
                >
                  {/* Streak micro-medal badge in top right corner */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStreakModal({ id: item.id, title: item.title || "温和自省原则", principleText: item.principleText || "" });
                    }}
                    className="absolute right-4 top-3.5 hover:scale-108 active:scale-95 transition-all flex items-center gap-1 bg-[#FFF9E6] hover:bg-amber-100/75 border border-amber-500/20 text-neutral-800 rounded-full px-2.5 py-1 text-[9.5px] font-black shadow-xs z-20 cursor-pointer animate-fade-in"
                  >
                    <GlassIcon emoji="🏅" size="xs" />
                    <span className="text-stone-500 font-bold">已践行</span>
                    <span className="text-amber-700 font-sans font-black pr-0.5">{streak}天</span>
                  </button>

                  <div 
                    onClick={() => onSelectPrinciple(item.id)}
                    className="cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-extrabold bg-[#E8A86A]/10 text-[#C1623C] border border-[#E8A86A]/25 px-2 py-0.5 rounded shrink-0">
                          {item.category}原则
                        </span>
                        <span className="text-[9.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/40 px-2 py-0.5 rounded shadow-3xs shrink-0 select-none flex items-center gap-1">
                          <GlassIcon emoji="⚡" size="xs" />
                          <span>关联度 {calculateAssociation(item)}%</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono font-bold shrink-0">
                        {runsCount}次执行
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-black text-sage-dark font-display leading-snug mt-3">
                      {item.title || "自定义行为原则"}
                    </h3>

                    {/* Core logic italic */}
                    <p className="text-xs text-stone-700 italic font-semibold mt-2 bg-[#E8A86A]/5 border border-[#E8A86A]/20 p-3 rounded-2xl leading-relaxed">
                      “{item.principleText}”
                    </p>

                    {/* Footer specs */}
                    <div className="mt-3.5 space-y-1 text-[11px] text-[#7B7268] leading-relaxed">
                      <div className="line-clamp-1">
                        <span className="font-bold text-sage">触发场景：</span>
                        下次遇到沟通或汇报受到质疑时
                      </div>
                      {item.nextAction && (
                        <div className="line-clamp-1">
                          <span className="font-bold text-coral">下一次动作：</span>
                          {item.nextAction}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Star rating and Action settings shortcut */}
                  <div className="mt-4 pt-3.5 border-t border-dashed border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-coral/80">
                      <span className="text-[10px] text-stone-400 font-bold mr-1">推荐度:</span>
                      {Array(stars).fill(0).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-coral" />
                      ))}
                    </div>

                    <button
                      onClick={() => onOpenReminderSetup(item)}
                      className="text-[10px] bg-slate-50 border border-stone-200 text-stone-500 hover:text-sage font-bold hover:bg-white px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
                    >
                      <GlassIcon emoji="⏰" size="xs" />
                      <span>{item.hasReminder ? "修改提醒" : "设置防守提醒"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          <div className="bg-white/50 border border-dashed border-stone-300 rounded-3xl py-14 px-6 flex flex-col items-center justify-center text-center">
            <CheckSquare className="w-10 h-10 text-stone-400 mb-3" />
            <p className="text-xs font-bold text-stone-500">原则库空空如也</p>
            <p className="text-[10px] text-stone-400 mt-1 max-w-xs leading-relaxed">
              原则是通过 5Why 剖析产生的警醒口诀。建立原则卡可以让你在下一次遇到同样场景之前触发脑钟震动，彻底逃逸不犯同类错，赶快前往详情复盘！
            </p>
          </div>
        )}
      </div>

      {/* Streak popup with responsive SVG interactive trend line / area chart */}
      {activeStreakModal && (() => {
        const { streak, history } = getPrincipleStreak(activeStreakModal.id);

        // Custom SVG Area Chart calculation
        const chartHeight = 110;
        const chartWidth = 320;
        const paddingX = 25;
        const paddingY = 20;

        // Populate beautiful high-fidelity seeded values to avoid blank charts
        const displayHistory = history.length >= 2 ? history : [
          { date: "06-11", score: 4, note: hLineNote(activeStreakModal.id, 0) },
          { date: "06-12", score: 5, note: hLineNote(activeStreakModal.id, 1) },
          { date: "06-13", score: 6, note: hLineNote(activeStreakModal.id, 2) },
          { date: "06-14", score: 5, note: hLineNote(activeStreakModal.id, 3) },
          { date: "06-15", score: 7, note: "今日最高效笃行达成！沟通十分默契" }
        ];

        const points = displayHistory.map((h, i) => {
          const x = paddingX + (i / Math.max(1, displayHistory.length - 1)) * (chartWidth - 2 * paddingX);
          const y = chartHeight - paddingY - ((h.score - 1) / 6) * (chartHeight - 2 * paddingY);
          return { x, y, date: h.date, score: h.score, note: h.note };
        });

        // Generate SVG curves or points
        let pathD = "";
        let areaD = "";
        if (points.length >= 2) {
          pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
          areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;
        }

        return (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-end justify-center animate-fade-in select-none">
            <div className="bg-white w-full rounded-t-[36px] p-6 pb-10 space-y-5 shadow-2xl max-h-[88%] overflow-y-auto animate-slide-up border-t border-stone-200">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏅</span>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">践行轨迹验证</h3>
                    <p className="text-[10px] text-stone-400 mt-0.5">连续笃行天数与成果走势</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveStreakModal(null)}
                  className="text-stone-400 hover:text-stone-600 text-xs font-black px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200"
                >
                  关闭
                </button>
              </div>

              {/* Big Badge Details */}
              <div className="bg-gradient-to-tr from-amber-50 to-[#FCFBEB] p-4 rounded-3xl border border-amber-500/15 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[9.5px] uppercase tracking-widest font-black text-[#8E8575] block">
                    当前连续达标践行
                  </span>
                  <span className="text-3xl font-black font-display text-amber-500 mt-0.5 block">
                    {streak} <span className="text-xs text-stone-500 font-extrabold">天</span>
                  </span>
                </div>
                <div className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-black text-[10.5px] rounded-2xl shadow-xs select-none">
                  🎖️ 笃行勋章认证
                </div>
              </div>

              {/* Principle Text */}
              <div className="bg-[#EBF7EE]/45 p-3.5 rounded-2xl border border-emerald-500/10 text-left">
                <span className="text-[8.5px] uppercase font-black text-emerald-800 tracking-wider block mb-1">
                  正在践行的警戒原则：
                </span>
                <p className="text-xs font-black text-slate-850 italic leading-relaxed">
                  “{activeStreakModal.principleText}”
                </p>
              </div>

              {/* Responsive SVG Chart */}
              <div className="space-y-2 text-left">
                <p className="text-[9.5px] font-black text-[#8E8575] tracking-wider uppercase font-sans flex items-center gap-1">
                  <span>践行成效走势指数 (1-7打分指数)</span> <GlassIcon emoji="📈" size="xs" />
                </p>
                <div className="bg-gradient-to-tr from-[#FAFBF9] to-white rounded-2xl p-4 border border-stone-200/40 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[8px] font-mono font-bold text-stone-400">
                    Vone.Lin Autopsy Grid
                  </div>
                  <svg width={chartWidth} height={chartHeight} className="overflow-visible mt-2">
                    <defs>
                      <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#84E1A9" />
                      </linearGradient>
                      <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    {/* Guiding Grid Lines */}
                    {[1, 4, 7].map((val) => {
                      const y = chartHeight - paddingY - ((val - 1) / 6) * (chartHeight - 2 * paddingY);
                      return (
                        <g key={val}>
                          <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#F2F2F2" strokeWidth="1.5" strokeDasharray="3 3" />
                          <text x={paddingX - 10} y={y + 3} fill="#9CA3AF" fontSize="8" fontWeight="black" textAnchor="end">{val}</text>
                        </g>
                      );
                    })}

                    {/* Area path */}
                    {areaD && <path d={areaD} fill="url(#chartAreaGrad)" />}
                    
                    {/* Line path */}
                    {pathD && <path d={pathD} fill="none" stroke="url(#chartLineGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}

                    {/* Interactive Circles / Values */}
                    {points.map((p, i) => (
                      <g key={i} className="group">
                        <circle cx={p.x} cy={p.y} r="5.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
                        <circle cx={p.x} cy={p.y} r="2" fill="#047857" />
                        <text x={p.x} y={p.y - 10} fill="#047857" fontSize="8.5" fontWeight="900" textAnchor="middle">
                          {p.score}
                        </text>
                        <text x={p.x} y={chartHeight - 4} fill="#9CA3AF" fontSize="8" fontWeight="black" textAnchor="middle">
                          {p.date.length > 5 ? p.date.substring(5) : p.date}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Diary reflections feed */}
              <div className="space-y-1.5 text-left">
                <p className="text-[9.5px] font-black text-[#8E8575] tracking-wider uppercase font-sans flex items-center gap-1">
                  <span>践行感言及心路反馈</span> <GlassIcon emoji="📜" size="xs" />
                </p>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {displayHistory.slice().reverse().map((h, i) => (
                    <div key={i} className="p-3 bg-stone-50 rounded-2xl border border-stone-200/50 text-left space-y-1 animate-fade-in">
                      <div className="flex justify-between items-center text-[9px] font-extrabold text-[#7B7268]">
                        <span className="flex items-center gap-0.5"><GlassIcon emoji="🗓️" size="xs" /> 日期: 2026-{h.date}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 rounded font-black">
                          打分: {h.score}/7
                        </span>
                      </div>
                      <p className="text-[11.5px] font-bold text-neutral-800 leading-relaxed italic">
                        “{h.note || "今天按原则行事。"}”
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}

// Helper notes preloads helper
function hLineNote(id: string, index: number): string {
  if (id === "m-1") {
    const notes = [
      "沟通前在脑中静默了3秒，向自己核对今天究竟要达成什么指标",
      "今天在例会上被开发质疑进度，克制了反唇相讥，而是让他把阻碍写成清单",
      "今天和产品经理先理顺了需求大方向，对齐细节进展顺利",
      "情绪比较平稳，听到指责时能本能地深呼吸，抓住关键数据来证实观点",
    ];
    return notes[index] || "遵循自律，完成度高。";
  }
  const notes = [
    "起床便强力列出了最不愿动手的第一件事，成功开荒",
    "写代码遇到畏难情绪，用3小时微格法强攻启动",
    "克制无端刷视频的行为，专注于核心架构搭建",
    "今日实践优异，专注时间达到4.5小时",
  ];
  return notes[index] || "稳妥启动，战胜拖延！";
}
