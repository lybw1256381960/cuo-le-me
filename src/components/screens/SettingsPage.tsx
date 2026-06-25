import React, { useState } from "react";
import { User, Shield, Volume2, HardDrive, Info, LogOut, RefreshCw, Sparkles, Check } from "lucide-react";
import { UserProfile } from "../../types";
import GlassIcon from "../GlassIcon";

interface SettingsPageProps {
  user: UserProfile;
  onChangeUser: (updated: UserProfile) => void;
  onRestoreMockData: () => void;
  onOpenReport?: () => void;
  onLogout?: () => void;
}

export default function SettingsPage({ user, onChangeUser, onRestoreMockData, onOpenReport, onLogout }: SettingsPageProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [statusText, setStatusText] = useState(user.statusText);
  const [aiTone, setAiTone] = useState(user.aiTone);
  const [isPrivateOnly, setIsPrivateOnly] = useState(user.isPrivateOnly);
  const [showNotification, setShowNotification] = useState(false);

  const tones: Array<UserProfile["aiTone"]> = ["温和陪伴", "理性倾听", "麻辣批判", "严肃顾问"];

  const handleUpdate = (updatedFields: Partial<UserProfile>) => {
    const next = { ...user, ...updatedFields };
    onChangeUser(next);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent pb-24 relative">
      {/* Top Save Confirmation notification banner */}
      {showNotification && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-sage text-white text-xs px-4 py-2 rounded-full shadow-md z-50 flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          设置已保存
        </div>
      )}

      {/* Header bar */}
      <div className="px-6 pt-5 pb-3 border-b border-stone-200/40">
        <p className="text-[10px] text-sage font-extrabold tracking-widest uppercase font-mono">My personal configuration</p>
        <h1 className="text-2xl font-black text-sage-dark font-display tracking-tight mt-1">
          设置与陪伴
        </h1>
      </div>

      {/* Primary Scrollable Menu lists */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        
        {/* Profile Card and avatar */}
        <div className="vone-interactive-card bg-white/70 backdrop-blur-[16px] rounded-3xl border border-white/60 p-5 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-2.5 right-2.5 select-none opacity-40">
            <GlassIcon emoji="🍃" size="xs" />
          </div>
          
          <div className="inline-block relative">
            {/* Using a placeholder image for avatar. User can replace this with a real image or upload functionality. */}
            <img
              src="/images/shark_avatar.png" // User-provided image
              alt="用户头像"
              className="w-16 h-16 rounded-full border border-stone-200 inline-block shadow-inner select-none object-cover"
            />
          </div>

          <div className="mt-3.5 space-y-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                handleUpdate({ nickname: e.target.value });
              }}
              className="text-[#2F3E3A] font-black text-center text-base border-none outline-none w-full focus:bg-stone-50 rounded py-0.5"
              placeholder="修改昵称..."
            />
            <input
              type="text"
              value={statusText}
              onChange={(e) => {
                setStatusText(e.target.value);
                handleUpdate({ statusText: e.target.value });
              }}
              className="text-stone-400 font-semibold text-center text-xs border-none outline-none w-full focus:bg-stone-50 rounded py-0.5"
              placeholder="写下当下的签名档..."
            />
          </div>
        </div>

        {/* Interactive Growth Report Card */}
        {onOpenReport && (
          <div 
            onClick={onOpenReport}
            className="group vone-interactive-card bg-gradient-to-br from-[#E1F2E9] via-[#ECF9F2] to-[#FFFCEE] border border-emerald-250 rounded-3xl p-5 shadow-[0_8px_32px_rgba(16,185,129,0.06)] cursor-pointer relative overflow-hidden transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 z-10 pr-4">
                <div className="inline-flex items-center gap-1.5 bg-[#D1F3E2] text-emerald-800 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide border border-emerald-300/40 uppercase">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse animate-duration-3000" />
                  <span>AI 智能分析报告</span>
                </div>
                <h3 className="text-sm font-black text-emerald-950 font-sans tracking-tight">
                  个人成长报告书 ✦
                </h3>
                <p className="text-[10.5px] text-[#5E7F73] font-bold leading-relaxed">
                  每周一自动提炼汇总本周错题趋势、AI 年度高频反思词云，智能导出每周智慧改进建议文本。
                </p>
              </div>
              <span className="w-10 h-10 rounded-2xl bg-[#D5F4E4] flex items-center justify-center text-emerald-600 font-extrabold text-lg shadow-sm border border-[#A6EBC5] group-hover:scale-105 transition-transform shrink-0">
                <GlassIcon emoji="📊" size="sm" />
              </span>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-black text-emerald-700 mt-4 border-t border-emerald-200/40 pt-3 select-none">
              <span>立即查看属于你的个人成长报告</span>
              <span className="flex items-center gap-0.5 group-hover:translate-x-1 duration-300 transition-transform">
                点击进入 
                <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        )}

        {/* 1. Privacy Switch */}
        <div className="vone-interactive-card bg-white/70 backdrop-blur-[16px] rounded-3xl border border-white/60 p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-orange-50 text-coral">
                <Shield className="w-4.5 h-4.5" />
              </span>
              <div>
                <h4 className="text-xs font-black text-sage-dark leading-none">
                  默认私密防护
                </h4>
                <p className="text-[10px] text-stone-400 mt-1 leading-none">
                  仅自己可见，放心袒露客观真实
                </p>
              </div>
            </div>
            
            {/* Toggle checkbox UI */}
            <input
              type="checkbox"
              checked={isPrivateOnly}
              onChange={(e) => {
                setIsPrivateOnly(e.target.checked);
                handleUpdate({ isPrivateOnly: e.target.checked });
              }}
              className="w-9 h-5 rounded-full appearance-none bg-stone-200 cursor-pointer checked:bg-sage relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:left-4.5 before:transition-all shadow-inner"
            />
          </div>
        </div>

        {/* 2. AI Companion Mode selection */}
        <div className="vone-interactive-card bg-white/70 backdrop-blur-[16px] rounded-3xl border border-white/60 p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <span className="p-2 rounded-xl bg-emerald-50 text-sage shrink-0">
              <Volume2 className="w-4.5 h-4.5" />
            </span>
            <div>
              <h4 className="text-xs font-black text-sage-dark leading-none">
                AI 倾听语气调试
              </h4>
              <p className="text-[10px] text-stone-400 mt-1 leading-none">
                提供最能包容或最能唤醒你的回复方式
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1.5">
            {tones.map((t) => {
              const isSelected = aiTone === t;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setAiTone(t);
                    handleUpdate({ aiTone: t });
                  }}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center ${
                    isSelected 
                      ? "bg-sage border-sage text-white shadow-xs" 
                      : "bg-stone-50 border-stone-200/65 text-stone-600 hover:bg-stone-100/60"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Data management */}
        <div className="vone-interactive-card bg-white/70 backdrop-blur-[16px] rounded-3xl border border-white/60 p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <HardDrive className="w-4.5 h-4.5" />
            </span>
            <div>
              <h4 className="text-xs font-black text-sage-dark leading-none">
                系统备份与重装
              </h4>
              <p className="text-[10px] text-stone-400 mt-1 leading-none">
                导出你的反思数据档案或还原演示设定
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={onRestoreMockData}
              className="w-full py-3 border border-stone-200 rounded-2xl text-xs font-bold text-[#C35A3A] bg-red-50/15 hover:bg-rose-50/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              恢复内置演示错题数据
            </button>
          </div>
        </div>

        {/* 4. Privacy policies and and generic info */}
        <div className="space-y-1 bg-white/50 border border-stone-200/70 p-4.5 rounded-3xl">
          <div className="flex items-center gap-2 text-xs font-black text-stone-500 mb-2">
            <Info className="w-4 h-4 shrink-0" />
            错了吗的人生说明
          </div>
          <p className="text-[10px] text-mocha leading-relaxed font-semibold">
            这是一部不具他人审判的自主安全退避日志罐。
            当你在工作或生活里产生痛感与冲突，这里绝非拷问惩罚的修罗场，而是你用理性自洽提炼智慧资产的魔法工坊。
            AI成长反思分析所产生任何言辞，均建立在理性中立、关切健康的宗旨上，不承担精神及医疗诊断用途。
          </p>
        </div>

        {/* Log out buttons block */}
        <div className="pt-2">
          <button 
            onClick={onLogout}
            className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 border border-stone-300 text-stone-600 rounded-full font-bold text-xs tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            退出当前的账户登录
          </button>
          <div className="text-center text-[9px] text-stone-400 font-mono mt-4 font-bold select-none">
            错了吗 ｜ AI Life Mistake Booklet v1.1.0 (PROD)
          </div>
        </div>
      </div>
    </div>
  );
}
