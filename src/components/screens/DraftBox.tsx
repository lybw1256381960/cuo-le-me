import React, { useState } from "react";
import { ChevronLeft, Trash2, Edit3, Archive, Grid, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MistakeEntry } from "../../types";
import GlassIcon from "../GlassIcon";

interface DraftBoxProps {
  drafts: MistakeEntry[];
  onResumeDraft: (draft: MistakeEntry) => void;
  onDeleteDrafts: (ids: string[]) => void;
  onClose: () => void;
}

export default function DraftBox({ drafts, onResumeDraft, onDeleteDrafts, onClose }: DraftBoxProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[] | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === drafts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(drafts.map(x => x.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirmIds(selectedIds);
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-50 text-stone-800 h-full relative select-none overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-emerald-100 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-amber-100 blur-3xl" />
      </div>

      {/* Header bar */}
      <div className="relative z-10 px-4 pt-4 pb-3 flex items-center justify-between bg-white/70 backdrop-blur-md border-b border-stone-200/50">
        <button 
          onClick={onClose} 
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-stone-200 shadow-3xs cursor-pointer active:scale-95 transition-all text-stone-700"
        >
          <ChevronLeft className="w-5 h-5 text-stone-600 stroke-[2.5]" />
        </button>
        <div className="text-center">
          <h2 className="text-md font-black text-stone-900 tracking-tight flex items-center justify-center gap-1.5">
            <GlassIcon emoji="📝" size="xs" /> 未完草稿箱
          </h2>
          <p className="text-[10px] text-stone-400 font-bold font-mono">DRAFTS ({drafts.length})</p>
        </div>
        {drafts.length > 0 ? (
          <button 
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedIds([]);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
              isSelectMode 
                ? "bg-stone-200 text-stone-700" 
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
            }`}
          >
            {isSelectMode ? "取消管理" : "管理"}
          </button>
        ) : (
          <div className="w-10 h-10 lg:block hidden" />
        )}
      </div>

      {/* Intro info line */}
      <div className="relative z-10 bg-amber-500/5 border-b border-amber-600/10 px-6 py-2 flex items-center gap-2">
        <GlassIcon emoji="💡" size="xs" />
        <span className="text-[10.5px] text-amber-800 font-extrabold">快记未发表、未写完的内容将列在此处，随时可以通过点击继续编辑剖析。</span>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 relative z-10 no-scrollbar pb-32">
        {drafts.length > 0 ? (
          <div className="space-y-3">
            {drafts.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div 
                  key={item.id}
                  className="flex gap-3 items-center"
                >
                  {isSelectMode && (
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected 
                          ? "bg-rose-500 border-rose-500 text-white" 
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {isSelected && <span className="text-[10px] font-black">✓</span>}
                    </button>
                  )}

                  <div 
                    onClick={() => {
                      if (isSelectMode) {
                        handleToggleSelect(item.id);
                      } else {
                        onResumeDraft(item);
                      }
                    }}
                    className={`flex-1 clm-card bg-white/80 backdrop-blur-md rounded-2xl p-4.5 border shadow-3xs hover:shadow-xs transition-all duration-200 relative group cursor-pointer ${
                      isSelected ? "border-rose-300 bg-rose-550/5" : "border-stone-200/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-amber-50 border border-amber-100 font-extrabold px-1.5 py-0.5 rounded text-amber-700 flex items-center gap-1">
                        <GlassIcon emoji="🖊" size="xs" /> 暂存草稿 · {item.category}
                      </span>
                      <span className="text-[9px] text-stone-400 font-mono font-bold">
                        {item.createdAt.substring(5, 16)}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 font-semibold mt-2.5 line-clamp-2 leading-relaxed">
                      {item.rawText || "无文字快记录"}
                    </p>

                    {/* Metadata line */}
                    <div className="mt-3 pt-2.5 border-t border-dashed border-stone-100 flex items-center justify-between text-[10px] text-stone-450 font-bold">
                      <span className="text-rose-500">痛感级别: {item.painLevel}⭐</span>
                      {!isSelectMode && (
                        <span className="text-emerald-700 hover:underline flex items-center gap-0.5 text-[10.5px]">
                          <span>继续编辑</span>
                          <Edit3 className="w-3 h-3 text-emerald-600 inline" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
              <GlassIcon emoji="📝" size="lg" />
            </div>
            <p className="text-sm font-black text-stone-605">
              草稿箱冷冷清清
            </p>
            <p className="text-[11px] text-stone-400 mt-1 max-w-xs leading-relaxed">
              当你写了快记又中断时，或点击“保存草稿”时，未完的心碎印记会整齐陈列在此。安全且绝对私密。
            </p>
          </div>
        )}
      </div>

      {/* Floating manage actions bar */}
      <AnimatePresence>
        {isSelectMode && selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 58, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 58, opacity: 0 }}
            className="absolute bottom-16 left-4 right-4 z-40 bg-stone-900 text-white rounded-2xl p-3 shadow-lg border border-white/10 flex items-center justify-between gap-4"
          >
            <span className="text-xs font-black tracking-wide pl-2">
              已选中 <span className="font-mono text-rose-400 text-sm font-extrabold">{selectedIds.length}</span> 个草稿
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleSelectAll}
                className="px-3 py-1.5 bg-stone-800 text-stone-300 hover:text-white rounded-lg text-[11px] font-black cursor-pointer"
              >
                {selectedIds.length === drafts.length ? "取消全选" : "全选"}
              </button>
              <button 
                onClick={handleBulkDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-lg text-[11px] font-black flex items-center gap-0.5 cursor-pointer text-white"
              >
                <Trash2 className="w-3 h-3 inline" />
                <span>批量删除</span>
              </button>
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
            className="fixed top-12 left-1/2 z-50 bg-stone-900 border border-white/10 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-black select-none pointer-events-none animate-fade-in"
          >
            <GlassIcon emoji="🍃" size="xs" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern In-app Custom Confirmation Dialog Modal Sheet overlay */}
      <AnimatePresence>
        {deleteConfirmIds && (
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
                  草稿安全销毁确认
                </h3>
                <p className="text-[11px] text-[#7B7268] font-bold leading-relaxed px-1">
                  您确定要永久物理销毁这 <span className="text-rose-600 font-extrabold font-mono bg-rose-50 px-1.5 py-0.5 rounded">{deleteConfirmIds.length}</span> 个未完自省草稿吗？此决策不可逆，草稿内容及记录的情绪状态将被物理清算。
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmIds(null)}
                  className="flex-1 py-3 bg-stone-100 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-black active:scale-95 transition-all cursor-pointer"
                >
                  放弃/返回
                </button>
                <button
                  onClick={() => {
                    onDeleteDrafts(deleteConfirmIds);
                    setSelectedIds([]);
                    setIsSelectMode(false);
                    setDeleteConfirmIds(null);
                    showToast("所选自省草稿已成功永久删除");
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black active:scale-95 transition-all shadow-md shadow-rose-200 cursor-pointer"
                >
                  果断物理删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
