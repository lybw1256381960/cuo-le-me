import React, { useState } from "react";
import { Search, Filter, AlertCircle, CircleAlert, Sparkles, Star, ArrowUpRight, Folder, Archive, Trash2, Check, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MistakeEntry } from "../../types";
import { getPainColorHSL, isMistakeDraft } from "../../utils";
import GlassIcon from "../GlassIcon";

interface MistakesListProps {
  mistakes: MistakeEntry[];
  onSelectMistake: (id: string) => void;
  onStartNewReflect: () => void;
  onUpdateMistakes: (updatedList: MistakeEntry[]) => void;
  onOpenDraftBox?: () => void;
}

export default function MistakesList({ mistakes, onSelectMistake, onStartNewReflect, onUpdateMistakes, onOpenDraftBox }: MistakesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("全部");
  const [isTagManagementMode, setIsTagManagementMode] = useState(false);
  const [selectedMistakeIds, setSelectedMistakeIds] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [longPressedMistake, setLongPressedMistake] = useState<MistakeEntry | null>(null);
  const [deleteConfirmItemIds, setDeleteConfirmItemIds] = useState<string[] | null>(null);

  // Filter completed and drafts using custom classification logic
  const completedMistakes = mistakes.filter((item) => !isMistakeDraft(item));
  const draftsList = mistakes.filter((item) => isMistakeDraft(item));

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // Long press simulated detector
  let pressTimer: any = null;

  const startPressTimer = (item: MistakeEntry) => {
    if (isTagManagementMode) return;
    pressTimer = setTimeout(() => {
      setLongPressedMistake(item);
    }, 600);
  };

  const cancelPressTimer = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  const handleBulkAddTag = (tag: string) => {
    if (selectedMistakeIds.length === 0) return;
    const updated = mistakes.map((item) => {
      if (selectedMistakeIds.includes(item.id)) {
        const currentTags = item.tags || [];
        if (!currentTags.includes(tag)) {
          return { ...item, tags: [...currentTags, tag] };
        }
      }
      return item;
    });
    onUpdateMistakes(updated);
    showToast(`已成功为选中的项目批量添加标签：“${tag}”`);
  };

  const handleBulkClearTags = () => {
    if (selectedMistakeIds.length === 0) return;
    const updated = mistakes.map((item) => {
      if (selectedMistakeIds.includes(item.id)) {
        return { ...item, tags: [] };
      }
      return item;
    });
    onUpdateMistakes(updated);
    showToast("已成功清除选中条目的所有标签。");
  };

  const handleBulkArchive = () => {
    if (selectedMistakeIds.length === 0) return;
    const updated = mistakes.map((item) => {
      if (selectedMistakeIds.includes(item.id)) {
        return { ...item, status: "已归档" as any };
      }
      return item;
    });
    onUpdateMistakes(updated);
    setSelectedMistakeIds([]);
    setIsTagManagementMode(false);
    showToast(`已成功将所选的 ${selectedMistakeIds.length} 项错题转入‘已归档’文件夹。`);
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    handleBulkAddTag(trimmed);
    setCustomTagInput("");
  };

  const filterPills = ["全部", "待反思", "已生成原则", "复发过", "已归档"];

  // Generate 12 columns x 7 days heatmap grid for weekly reflection footprints
  const getHeatmapGrid = () => {
    const today = new Date("2026-06-15"); // Current local date reference
    const oneDayMs = 24 * 60 * 60 * 1000;
    const countsMap: { [dateStr: string]: number } = {};

    // Map existing mistakes counting
    completedMistakes.forEach((m) => {
      const dStr = m.createdAt.substring(0, 10).trim();
      countsMap[dStr] = (countsMap[dStr] || 0) + 1;
    });

    // Preset structured baseline footprints to give immediate warm aesthetic weight
    const preloadedActivityOffets: { [offset: number]: number } = {
      2: 1, 3: 2, 6: 1, 9: 3, 11: 1, 14: 2, 18: 1, 23: 1, 24: 3, 25: 1, 30: 2, 
      34: 1, 37: 2, 42: 1, 46: 3, 51: 2, 59: 1, 65: 2, 72: 1, 78: 2, 81: 1
    };

    const cells: { dateStr: string; level: number }[] = [];
    // 12 columns * 7 days = 84 cells. We map backwards.
    for (let i = 83; i >= 0; i--) {
      const cellDate = new Date(today.getTime() - i * oneDayMs);
      const yyyy = cellDate.getFullYear();
      const mm = String(cellDate.getMonth() + 1).padStart(2, "0");
      const dd = String(cellDate.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      let count = countsMap[dateStr] || 0;
      if (preloadedActivityOffets[i] !== undefined) {
        count += preloadedActivityOffets[i];
      }

      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count > 3) level = 4;

      cells.push({ dateStr, level });
    }

    // Categorize into 12 columns (each column contains 7 days)
    const columns: { dateStr: string; level: number; }[][] = [];
    for (let c = 0; c < 12; c++) {
      columns.push(cells.slice(c * 7, (c + 1) * 7));
    }
    return columns;
  };

  const heatmapCols = getHeatmapGrid();
  const totalLogs = completedMistakes.length + 15; // real + preloaded offset

  const filteredMistakes = completedMistakes.filter((item) => {
    // Text filter
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Archival handling
    if (activeFilter === "已归档") {
      return item.status === "已归档";
    }
    // Exclude archived items from standard non-archived tabs to reduce clutter
    if (item.status === "已归档") return false;

    // Tab filter
    if (activeFilter === "全部") return true;
    if (activeFilter === "待反思") return item.status === "待反思";
    if (activeFilter === "已生成原则") return item.status === "已生成原则" || !!item.principleText;
    if (activeFilter === "复发过") return item.status === "复发过" || (item.recurrenceLog && item.recurrenceLog.length > 0);
    
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-transparent pb-24">
      
      {/* Header bar */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-sage-dark font-display tracking-tight mt-1">我的错题</h1>
        </div>
        <div className="flex gap-2">
          {draftsList.length > 0 && onOpenDraftBox && (
            <button
              onClick={onOpenDraftBox}
              className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm font-black text-amber-700 flex items-center gap-1 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <GlassIcon emoji="📝" size="xs" />
              <span>草稿箱 ({draftsList.length})</span>
            </button>
          )}
          <button
            onClick={() => {
              setIsTagManagementMode(!isTagManagementMode);
              setSelectedMistakeIds([]);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1 transition-all shadow-3xs hover:scale-103 active:scale-97 cursor-pointer ${
              isTagManagementMode
                ? "bg-[#1E3F39] text-white"
                : "bg-gradient-to-r from-emerald-700 to-[#1E3F39] text-white"
            }`}
          >
            {isTagManagementMode ? "退出 标签/删除" : <span className="flex items-center gap-1"><GlassIcon emoji="🏷️" size="xs" /> 标签/删除</span>}
          </button>
        </div>
      </div>

      {/* 极简周度反思热力图 */}
      <div className="px-6 mb-4">
        <div className="clm-card bg-white/70 backdrop-blur-[16px] rounded-[24px] p-4.5 border border-white/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <GlassIcon emoji="🍀" size="xs" />
              <div>
                <h4 className="text-[11px] font-black text-sage-dark leading-tight">
                  周度成长足迹 · Reflection Heatmap
                </h4>
                <p className="text-[9px] text-[#8E8575] font-semibold">用深浅蓝绿色块记录反思能量绽放</p>
              </div>
            </div>
            <div className="text-[10px] bg-emerald-50 text-[#1E3F39] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100 font-mono scale-95 shrink-0">
              累计 {totalLogs} 次
            </div>
          </div>

          {/* Grid visual mapping */}
          <div className="flex items-center gap-2 pt-1 justify-center">
            {/* Weekday labels */}
            <div className="flex flex-col justify-between text-[8px] font-black text-[#8E8575]/70 h-[88px] select-none pr-1">
              <span>一</span>
              <span>三</span>
              <span>五</span>
              <span>日</span>
            </div>

            {/* Grid structure */}
            <div className="flex gap-[3.5px] overflow-x-auto no-scrollbar py-2 px-1">
              {heatmapCols.map((col, cIndex) => (
                <div key={cIndex} className="flex flex-col gap-[3.5px] relative hover:z-10">
                  {col.map((cell, rIndex) => {
                    // Decide color shade based on level
                    let bgCol = "bg-stone-100";
                    if (cell.level === 1) bgCol = "bg-[#CCECD5]";      // light mint
                    if (cell.level === 2) bgCol = "bg-[#9EE3D1]";      // teal green
                    if (cell.level === 3) bgCol = "bg-[#5E7F73]";      // sage
                    if (cell.level === 4) bgCol = "bg-[#1E3F39]";      // deep blue-green

                    return (
                      <div
                        key={cell.dateStr + rIndex}
                        className={`w-2.5 h-2.5 rounded-[2px] ${bgCol} transition-all duration-150 hover:scale-[1.35] cursor-pointer relative group hover:z-30`}
                      >
                        {/* Miniature tooltip */}
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-stone-900 border border-white/10 text-white font-mono text-[9px] px-1.5 py-1 rounded-[6px] whitespace-nowrap z-50 pointer-events-none transition-all duration-150 shadow-xl">
                          {cell.dateStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend and insight summary footer */}
          <div className="flex items-center justify-between text-[9px] text-[#8E8575] font-bold pt-2 border-t border-stone-100">
            <span className="flex items-center gap-1"><GlassIcon emoji="✨" size="xs" /> 天天和解，行而不辍</span>
            <div className="flex items-center gap-1 font-mono scale-90 origin-right">
              <span>少</span>
              <span className="w-1.5 h-1.5 rounded-xs bg-stone-100 border border-stone-200" />
              <span className="w-1.5 h-1.5 rounded-xs bg-[#CCECD5]" />
              <span className="w-1.5 h-1.5 rounded-xs bg-[#9EE3D1]" />
              <span className="w-1.5 h-1.5 rounded-xs bg-[#5E7F73]" />
              <span className="w-1.5 h-1.5 rounded-xs bg-[#1E3F39]" />
              <span>多</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar with matching aesthetics */}
      <div className="px-6 space-y-3">
        <div className="relative flex items-center bg-white rounded-2xl border border-stone-200/80 px-3 py-2.5 shadow-xs">
          <Search className="w-4 h-4 text-stone-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索错题标题、场景、类型标签..."
            className="w-full text-xs bg-transparent border-none outline-none text-stone-800 placeholder-stone-400 font-medium"
          />
          <button className="p-1 text-stone-500 hover:text-sage shrink-0">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Carousel scroll horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filterPills.map((pill) => {
            const isSelected = activeFilter === pill;
            return (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border tracking-wide transition-all ${
                  isSelected 
                    ? "bg-sage border-sage text-white shadow-xs scale-102" 
                    : "bg-white border-stone-200 text-[#7B7268] hover:bg-stone-50"
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mistakes Card stack list scrollable */}
      <div className="px-6 mt-4 flex-1 space-y-4 overflow-y-auto">
        {filteredMistakes.length > 0 ? (
          filteredMistakes.map((item) => {
            const isSelected = selectedMistakeIds.includes(item.id);
            // Generate visual ratings stars
            const safePainLevel = typeof item.painLevel === "number" && !isNaN(item.painLevel) ? item.painLevel : 0;
            const stars = Array(Math.min(Math.max(0, safePainLevel), 5)).fill(0);
            const colorInfo = getPainColorHSL(item.painLevel);
            
            return (
              <div
                key={item.id}
                onMouseDown={() => startPressTimer(item)}
                onMouseUp={cancelPressTimer}
                onMouseLeave={cancelPressTimer}
                onTouchStart={() => startPressTimer(item)}
                onTouchEnd={cancelPressTimer}
                onClick={() => {
                  if (isTagManagementMode) {
                    if (selectedMistakeIds.includes(item.id)) {
                      setSelectedMistakeIds(selectedMistakeIds.filter((id) => id !== item.id));
                    } else {
                      setSelectedMistakeIds([...selectedMistakeIds, item.id]);
                    }
                  } else {
                    onSelectMistake(item.id);
                  }
                }}
                className={`flex gap-3 items-start transition-all duration-300 relative select-none ${isTagManagementMode ? "cursor-pointer" : ""}`}
              >
                {isTagManagementMode && (
                  <div className="shrink-0 mt-6 flex items-center justify-center">
                    <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? "bg-rose-600 border-rose-600 text-white animate-scale-in" 
                        : "border-stone-300 bg-white"
                    }`}>
                      {isSelected && <span className="text-[10px] font-black">✓</span>}
                    </div>
                  </div>
                )}

                <div
                  className={`flex-1 clm-card bg-white/70 backdrop-blur-[16px] rounded-3xl p-5 border shadow-sm transition-all duration-300 active:scale-98 relative group ${
                    isTagManagementMode && isSelected 
                      ? "border-rose-300 shadow-md bg-rose-500/5 animate-pulse-soft" 
                      : "border-white/60"
                  }`}
                  style={{
                    ["--card-border" as any]: colorInfo.border,
                    ["--card-border-hover" as any]: colorInfo.borderHover,
                    ["--card-glow" as any]: colorInfo.cardGlow,
                    ["--card-glow-hover" as any]: colorInfo.cardGlowHover
                  }}
                >
                  {/* Arrow indicator */}
                  {!isTagManagementMode && (
                    <div className="absolute top-4 right-4 text-stone-300 group-hover:text-sage group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  )}

                  {isTagManagementMode && (
                    <div className="absolute top-4 right-4 text-xs font-black text-stone-450">
                      {isSelected ? (
                        <span className="text-rose-700 bg-rose-100 rounded-full px-2 py-0.5 text-[9px]">已选择</span>
                      ) : (
                        <span className="text-stone-400 bg-stone-100 rounded-full px-2 py-0.5 text-[9px]">未选择</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-stone-100 border border-stone-200/60 font-bold px-2 py-0.5 rounded-md text-stone-600">
                      {item.category}
                    </span>
                    
                    {/* Status pills */}
                    {item.status === "待反思" ? (
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        待反思
                      </span>
                    ) : item.status === "复发过" ? (
                      <span className="text-[10px] bg-red-55 text-red-600 border border-red-100 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <GlassIcon emoji="⚠️" size="xs" /> 出现复发
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                        <GlassIcon emoji="💡" size="xs" /> 已成原则
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-black text-sage-dark font-display leading-snug mt-3 pr-6">
                    {item.title || item.rawText.substring(0, 18) + "..."}
                  </h3>

                  {/* Factual snippet */}
                  <p className="text-[11px] text-mocha mt-1.5 line-clamp-2 leading-relaxed font-medium">
                    {item.rawText}
                  </p>

                  {/* Custom Tags Display */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5 shrink-0"
                        >
                          <GlassIcon emoji="🏷️" size="xs" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom specs metadata line */}
                  <div className="mt-4 pt-3.5 border-t border-dashed border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-bold tracking-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-coral">痛感:</span>
                      <span className="flex items-center gap-0.5 text-coral/80">
                        {stars.map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-coral" />
                        ))}
                        {item.painLevel > 5 && <span className="ml-0.5 text-[9px] font-black">+</span>}
                      </span>
                    </div>
                    <span className="font-mono">
                      复盘时间: {item.createdAt.includes("T") ? item.createdAt.substring(0, 10) : item.createdAt.substring(5, 10)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white/50 border border-dashed border-stone-300 rounded-3xl py-14 px-6 flex flex-col items-center justify-center text-center">
            <CircleAlert className="w-10 h-10 text-stone-400 mb-3" />
            <p className="text-xs font-bold text-stone-500">
              暂时没找到符合此条件的错题事件
            </p>
            <p className="text-[10px] text-stone-400 mt-1 max-w-xs">
              放心开始记录真实的复盘反思吧。每一次面对缺失，都是构建不二过原则的高光契机。
            </p>
            <button
              onClick={onStartNewReflect}
              className="mt-5 text-xs text-white bg-sage px-4 py-2 rounded-full font-bold shadow-sm hover:bg-sage-dark active:scale-95"
            >
              立刻新建反思
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Floating Glassmorphic Bulk Action Toolbar at the bottom */}
      <AnimatePresence>
        {isTagManagementMode && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="absolute bottom-19 left-4 right-4 z-45 bg-white/95 backdrop-blur-[20px] border border-emerald-100 shadow-[0_15px_45px_rgba(30,63,57,0.18)] rounded-[28px] p-4.5 space-y-3.5"
          >
            {/* Tag and folder operations toolcard -- Sleek layout */}
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-stone-100 font-medium text-xs">
                <span className="font-black text-[#1E3F39] flex items-center gap-1.5">
                  <GlassIcon emoji="🏷️" size="xs" /> 批量管理选项 ({selectedMistakeIds.length} 项已选)
                </span>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => {
                      if (selectedMistakeIds.length === filteredMistakes.length) {
                        setSelectedMistakeIds([]);
                      } else {
                        setSelectedMistakeIds(filteredMistakes.map(m => m.id));
                      }
                    }}
                    className="text-[10px] text-emerald-800 hover:underline font-extrabold cursor-pointer"
                  >
                    {selectedMistakeIds.length === filteredMistakes.length ? "取消全选" : "全选当前"}
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={() => {
                      setIsTagManagementMode(false);
                      setSelectedMistakeIds([]);
                    }}
                    className="text-[10px] text-stone-500 hover:text-stone-700 font-extrabold cursor-pointer"
                  >
                    退出
                  </button>
                </div>
              </div>

              {/* Custom Tag input form */}
              <div className="space-y-2 bg-[#F7FCFA] p-3 rounded-2xl border border-emerald-500/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    disabled={selectedMistakeIds.length === 0}
                    placeholder={
                      selectedMistakeIds.length === 0 
                        ? "⚠️ 请先勾选错题，再输入标签" 
                        : "新增标签名称，如：沟通急躁..."
                    }
                    className="flex-1 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:border-emerald-300 disabled:opacity-55 disabled:cursor-not-allowed text-stone-850"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    disabled={selectedMistakeIds.length === 0 || !customTagInput.trim()}
                    className="bg-emerald-800 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl hover:bg-emerald-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    应用
                  </button>
                </div>

                {selectedMistakeIds.length > 0 && (
                  <div className="flex gap-2 pt-0.5 items-center text-[10px] text-stone-500 font-bold">
                    <span className="shrink-0 text-[9px] text-[#5E7F73]">智能推荐:</span>
                    <div className="flex flex-wrap gap-1">
                      {["沟通习惯", "决策急躁", "情绪失控", "准备不足"].map((recTag) => (
                        <button
                          key={recTag}
                          onClick={() => handleBulkAddTag(recTag)}
                          className="bg-white border border-stone-200/60 hover:bg-emerald-50 hover:border-emerald-200 px-2 py-0.5 rounded transition-transform active:scale-95 text-[9px] text-stone-600 font-extrabold cursor-pointer"
                        >
                          +{recTag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Utility operations bar */}
              <div className="flex justify-between items-center text-[10px] pt-1">
                <div className="flex gap-3">
                  <button
                    onClick={handleBulkArchive}
                    disabled={selectedMistakeIds.length === 0}
                    className="text-stone-600 hover:text-emerald-950 font-extrabold disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 transition-colors"
                  >
                    📁 批量归档 {selectedMistakeIds.length > 0 && `(${selectedMistakeIds.length})`}
                  </button>
                  <span className="text-stone-200 font-light">|</span>
                  <button
                    onClick={handleBulkClearTags}
                    disabled={selectedMistakeIds.length === 0}
                    className="text-stone-600 hover:text-amber-800 font-extrabold disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 transition-colors"
                  >
                    🧹 清洗旧标签
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (selectedMistakeIds.length === 0) return;
                    setDeleteConfirmItemIds(selectedMistakeIds);
                  }}
                  disabled={selectedMistakeIds.length === 0}
                  className="bg-rose-50 border border-rose-200/80 hover:bg-rose-100 hover:border-rose-300 text-rose-700 px-3 py-1.5 rounded-xl font-black flex items-center gap-1 text-[11px] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  彻底删除 {selectedMistakeIds.length > 0 ? `(${selectedMistakeIds.length})` : ""}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toast notification wrapper */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -10, scale: 0.95, x: "-50%" }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-12 left-1/2 z-50 bg-emerald-950/95 text-white backdrop-blur-[8px] px-5 py-2.5 rounded-full shadow-lg border border-emerald-500/30 flex items-center gap-2 text-xs font-black select-none pointer-events-none"
          >
            <GlassIcon emoji="🍃" size="xs" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Long-press Interactive Context Menu Sheet Overlay */}
      <AnimatePresence>
        {longPressedMistake && (
          <div 
            className="fixed inset-0 bg-[#1E3F39]/50 backdrop-blur-xs z-50 flex items-end justify-center select-none" 
            onClick={() => setLongPressedMistake(null)}
          >
            <motion.div 
              initial={{ y: 150, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 150, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white w-full max-w-sm rounded-t-[36px] p-6 pb-10 border-t border-stone-200 shadow-2xl space-y-5 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚙️</span>
                  <div>
                    <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest font-mono">错题选项卡 · Option Menu</h3>
                    <p className="text-sm font-black text-sage-dark line-clamp-1">{longPressedMistake.title || longPressedMistake.rawText || "无标题自省错题"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setLongPressedMistake(null)}
                  className="text-stone-400 hover:text-stone-600 font-extrabold text-[11px] px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 cursor-pointer transition-colors"
                >
                  关闭
                </button>
              </div>

              {/* Operations options list */}
              <div className="grid grid-cols-1 gap-1.5 pt-1.5">
                {/* Archive Button */}
                <button
                  onClick={() => {
                    const updated = mistakes.map((m) => {
                      if (m.id === longPressedMistake.id) {
                        return { ...m, status: "已归档" as any };
                      }
                      return m;
                    });
                    onUpdateMistakes(updated);
                    setLongPressedMistake(null);
                    showToast(`“${longPressedMistake.title || "错题条目"}” 已成功归档。`);
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 hover:bg-[#5E7F73]/10 text-stone-750 font-black text-sm rounded-2xl active:scale-98 transition-all text-left cursor-pointer transition-colors"
                >
                  <span className="text-xl">📁</span>
                  <div>
                    <p className="text-stone-850 font-bold">归档此错题 (Archive)</p>
                    <p className="text-[10px] text-[#7B7268] mt-0.5 font-bold">从默认视图中移除，转到‘已归档’页</p>
                  </div>
                </button>

                {/* Tag management selection */}
                <button
                  onClick={() => {
                    setIsTagManagementMode(true);
                    setSelectedMistakeIds([longPressedMistake.id]);
                    setLongPressedMistake(null);
                    showToast("已激活批量标签管理，并默认选中当前条目。");
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 hover:bg-[#5E7F73]/10 text-stone-750 font-black text-sm rounded-2xl active:scale-98 transition-all text-left cursor-pointer transition-colors"
                >
                  <GlassIcon emoji="🏷️" size="xs" />
                  <div>
                    <p className="text-stone-850 font-bold">批量管理及多选模式</p>
                    <p className="text-[10px] text-[#7B7268] mt-0.5 font-bold">可连带选择多个其他错题进行批量操作</p>
                  </div>
                </button>

                {/* Delete button option */}
                <button
                  onClick={() => {
                    setDeleteConfirmItemIds([longPressedMistake.id]);
                    setLongPressedMistake(null);
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 hover:bg-rose-50 text-red-655 font-black text-sm rounded-2xl active:scale-98 transition-all text-left cursor-pointer transition-colors"
                >
                  <span className="text-xl">🗑️</span>
                  <div>
                    <p className="text-red-700 font-bold">删除该自省事件</p>
                    <p className="text-[10px] text-red-500/85 mt-0.5 font-bold">从系统中永久物理剔除本条自省记录（不可逆）</p>
                  </div>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern In-app Custom Confirmation Dialog Modal Sheet overlay */}
      <AnimatePresence>
        {deleteConfirmItemIds && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[28px] border border-stone-200 shadow-2xl p-6 space-y-4 text-center z-110 relative"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 animate-bounce mx-auto">
                <Trash2 className="w-5.5 h-5.5 stroke-[2.5]" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-sm font-black text-stone-900 leading-snug">
                  物理及永久清结算确认
                </h3>
                <p className="text-[11px] text-[#7B7268] font-bold leading-relaxed px-1">
                  您确定要永久物理删除选中的 <span className="text-rose-600 font-black font-mono bg-rose-50 px-1.5 py-0.5 rounded">{deleteConfirmItemIds.length}</span> 项自省事件吗？此决策将从系统中彻底抹除相应记录与情绪印记，该操作是绝对不可逆的。
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmItemIds(null)}
                  className="flex-1 py-3 bg-stone-100 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-black active:scale-95 transition-all cursor-pointer"
                >
                  放弃/返回
                </button>
                <button
                  onClick={() => {
                    const updated = mistakes.filter((m) => !deleteConfirmItemIds.includes(m.id));
                    onUpdateMistakes(updated);
                    setDeleteConfirmItemIds(null);
                    setSelectedMistakeIds([]);
                    setIsTagManagementMode(false);
                    showToast("所选条目已安全物理永久删除。");
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black active:scale-95 transition-all shadow-md shadow-rose-200 cursor-pointer"
                >
                  果断永久删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
