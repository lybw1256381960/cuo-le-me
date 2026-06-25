import React, { useState } from "react";
import { 
  Compass, Palette, Type, Heart, BarChart3, AppWindow, Sparkles, 
  Smile, Wind, Trees, Star, ChevronRight, Activity, Moon, Sun, 
  Volume2, ShieldAlert, Check
} from "lucide-react";
import GlassIcon from "./GlassIcon";

interface BrandGuideProps {
  activeMockup: string;
  onSelectMockup: (mockupType: "morning" | "mood" | "breathing" | "insights" | "default") => void;
  currentStreak: number;
}

export default function BrandGuide({ activeMockup, onSelectMockup, currentStreak }: BrandGuideProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Overview", sub: "概览", icon: Compass },
    { id: "color", label: "Color", sub: "色彩系统", icon: Palette },
    { id: "typography", label: "Typography", sub: "字体系统", icon: Type },
    { id: "iconography", label: "Iconography", sub: "图标系统", icon: Heart },
    { id: "dataviz", label: "Data Viz", sub: "数据可视化", icon: BarChart3 },
    { id: "mockups", label: "Mockups", sub: "界面示例", icon: AppWindow },
    { id: "feelings", label: "Feelings", sub: "情绪与体验", icon: Smile },
  ];

  const handleScrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`vone-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#FFFDF2] flex text-stone-800 font-sans overflow-hidden">
      
      {/* 1. Left Brand Sidebar Menu */}
      <aside className="w-64 border-r border-stone-200/50 bg-white p-6 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
        <div>
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2.5 px-2 py-4">
            <GlassIcon emoji="🌸" size="xs" className="animate-pulse-gently" />
            <div>
              <span className="font-display font-black text-xl tracking-tight text-[#1E3F39]">Vone.Lin</span>
              <p className="text-[9px] text-[#5E7F73] font-bold tracking-widest leading-none mt-1 uppercase">Brand Guidelines</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleScrollTo(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all ${
                    isSelected 
                      ? "bg-[#E0F0F8]/50 text-[#1E3F39] font-bold shadow-xs border-l-4 border-[#5E7F73]" 
                      : "text-[#5B6B67] hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-[#5E7F73]" : "text-[#9EB0AC]"}`} />
                    <span className="text-xs font-semibold text-left">{item.label}</span>
                  </div>
                  <span className="text-[9px] text-stone-400 font-medium px-1">{item.sub}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Credit */}
        <div className="p-2 border-t border-stone-100 mt-auto">
          <p className="text-[10px] text-stone-400 font-mono font-bold leading-relaxed">
            Vone.Lin © 2026<br />
            1:1 Brand Visual System
          </p>
        </div>
      </aside>

      {/* 2. Main Visual Gallery Sheet */}
      <main className="flex-1 overflow-y-auto h-screen p-8 space-y-10 no-scrollbar pb-24 bg-stone-50/45">
        
        {/* Banner Cover Title card */}
        <section id="vone-overview" className="bg-white rounded-[32px] border border-stone-200/50 p-8 shadow-xs relative overflow-hidden">
          {/* Sunny sunrise tide background mimic */}
          <div className="absolute right-0 top-0 bottom-0 w-2/5 vone-shoreline opacity-80 pointer-events-none select-none border-l border-stone-100" />
          <div className="absolute top-12 right-1/4 w-12 h-12 bg-amber-200/50 rounded-full blur-sm animate-pulse-gently" />
          
          <div className="relative max-w-lg z-10">
            <span className="text-xs font-extrabold text-[#5E7F73] uppercase tracking-widest font-mono">Brand Visual Identity</span>
            <h2 className="text-3xl font-black font-display text-[#1E3F39] leading-tight mt-3">
              Let emotions flow naturally, <br />
              releasing healthy like the ocean tide.
            </h2>
            <p className="text-sm font-semibold text-[#5B6B67] mt-3 leading-relaxed">
              让情绪自然流动，如海水潮汐般健康释放。
            </p>
            
            <div className="mt-8 flex gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-[#E0F0F8] text-[#1E3F39] text-xs font-bold border border-[#E0F0F8]">
                💙 感受
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#FFF9B1] text-[#1E3F39] text-xs font-bold border border-[#FFF9B1]">
                💛 释放
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#C0E890] text-[#1E3F39] text-xs font-bold border border-[#C0E890]">
                💚 治愈
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 01: Color Palette */}
        <section id="vone-color" className="space-y-4">
          <div className="flex items-baseline gap-2.5 border-b border-stone-200 pb-2">
            <span className="font-mono text-base font-black text-[#5E7F73]">01</span>
            <h3 className="font-display font-black text-lg text-[#1E3F39]">Color Palette 色彩系统</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Transparent Water", cn: "透明水蓝", hex: "#E0F0F8", bg: "bg-[#E0F0F8]" },
              { label: "Release Yellow", cn: "释放黄", hex: "#FFF9B1", bg: "bg-[#FFF9B1]" },
              { label: "Fresh Green", cn: "清新绿", hex: "#C0E890", bg: "bg-[#C0E890]" },
              { label: "Light Cream", cn: "柔和奶油", hex: "#FFFDF2", bg: "bg-[#FFFDF2] border border-stone-200/50" },
            ].map((col) => (
              <div key={col.hex} className="bg-white p-4 rounded-3xl border border-stone-200/40 shadow-xs flex flex-col gap-3">
                <div className={`h-24 rounded-2xl ${col.bg} transition-transform hover:scale-[1.02]`} />
                <div>
                  <h4 className="text-xs font-black text-stone-900">{col.label}</h4>
                  <p className="text-[10px] text-stone-500 font-bold mt-0.5">{col.cn}</p>
                  <p className="text-[10px] text-[#5E7F73] font-mono mt-1">{col.hex}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/40">
            <p className="text-xs font-bold text-stone-500 mb-2">Natural Gradient 自然渐变研究</p>
            <div className="h-10 rounded-2xl vone-gradient-bg shadow-inner w-full flex items-center justify-between px-4">
              <span className="text-[10px] font-mono text-stone-800/70">#E0F0F8</span>
              <span className="text-[10px] font-mono text-stone-800/70">#FFF9B1</span>
              <span className="text-[10px] font-mono text-stone-800/70">#C0E890</span>
            </div>
          </div>
        </section>

        {/* SECTION 02: Brand Story */}
        <section id="vone-feelings" className="space-y-4">
          <div className="flex items-baseline gap-2.5 border-b border-stone-200 pb-2">
            <span className="font-mono text-base font-black text-[#5E7F73]">02</span>
            <h3 className="font-display font-black text-lg text-[#1E3F39]">Brand Story 品牌故事</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200/40 space-y-4">
            <p className="text-xs text-[#5B6B67] leading-relaxed font-semibold italic">
              "We believe that every emotion has its rhythm. Vone.Lin creates a safe, natural space for you to feel, release, and reconnect. Like the ocean tide, when emotions flow freely, the mind becomes lighter and life grows brighter."
            </p>
            <div className="w-10 h-[1.5px] bg-[#C0E890]" />
            <p className="text-xs text-stone-800 leading-relaxed font-semibold">
              我们相信，每一种情绪都有它的节奏。Vone.Lin 为你打造一个安全、自然的空间，让你感受、释放与重连。如海水潮汐般，当情绪自由流动，内心更轻盈，生活更明亮。
            </p>
          </div>
        </section>

        {/* SECTION 03: Keywords */}
        <section id="vone-typography" className="space-y-4">
          <div className="flex items-baseline gap-2.5 border-b border-stone-200 pb-2">
            <span className="font-mono text-base font-black text-[#5E7F73]">03</span>
            <h3 className="font-display font-black text-lg text-[#1E3F39]">Keywords 关键词</h3>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {[
              { eng: "Flowing", cn: "流动", emoji: "🌊", desc: "如水无形" },
              { eng: "Release", cn: "释放", emoji: "✨", desc: "舒缓释压" },
              { eng: "Healing", cn: "治愈", emoji: "🍃", desc: "温润疗愈" },
              { eng: "Natural", cn: "自然", emoji: "🌸", desc: "天然而生" },
              { eng: "Balance", cn: "平衡", emoji: "⚖️", desc: "身心自洽" },
              { eng: "Bright", cn: "明亮", emoji: "☀️", desc: "向光生长" },
            ].map((kw) => (
              <div key={kw.eng} className="bg-white p-4 rounded-3xl border border-stone-200/40 text-center space-y-1.5 shadow-xs hover:border-[#C0E890] transition-colors flex flex-col items-center justify-center">
                <GlassIcon emoji={kw.emoji} size="xs" />
                <h4 className="text-xs font-black text-stone-900 leading-none mt-1">{kw.eng}</h4>
                <p className="text-[10px] text-stone-500 font-bold leading-none">{kw.cn}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 04: Gradient Studies */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-2.5 border-b border-stone-200 pb-2">
            <span className="font-mono text-base font-black text-[#5E7F73]">04</span>
            <h3 className="font-display font-black text-lg text-[#1E3F39]">Gradient Studies 渐变研究</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-44 rounded-3xl bg-gradient-to-tr from-[#E0F0F8] through-[#FFF9B1] to-[#FFFDF2] border border-stone-200/30 p-5 flex flex-col justify-end">
              <span className="text-[10px] font-mono text-stone-600 font-bold bg-white/70 px-2.5 py-1 rounded-full w-max text-center">Tidal Inhale 潮汐吸气</span>
            </div>
            <div className="h-44 rounded-3xl bg-gradient-to-br from-[#FFF9B1] via-[#FFFDF2] to-[#C0E890] border border-stone-200/30 p-5 flex flex-col justify-end">
              <span className="text-[10px] font-mono text-stone-600 font-bold bg-white/70 px-2.5 py-1 rounded-full w-max text-center">Gentle Shore 朋友和解</span>
            </div>
            <div className="h-44 rounded-3xl bg-gradient-to-tr from-[#E0F0F8] via-[#FFFDF2] to-[#C0E890] border border-stone-200/30 p-5 flex flex-col justify-end">
              <span className="text-[10px] font-mono text-stone-600 font-bold bg-white/70 px-2.5 py-1 rounded-full w-max text-center">Forest Mind 林下绿光</span>
            </div>
          </div>
        </section>

        {/* SECTION 05: Iconography */}
        <section id="vone-iconography" className="space-y-4">
          <div className="flex items-baseline gap-2.5 border-b border-stone-200 pb-2">
            <span className="font-mono text-base font-black text-[#5E7F73]">05</span>
            <h3 className="font-display font-black text-lg text-[#1E3F39]">Icon System 图标系统</h3>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-stone-200/40">
            <div className="grid grid-cols-9 gap-4 text-center">
              {[
                { label: "流动", icon: Wind },
                { label: "明亮", icon: Sun },
                { label: "治愈", icon: Trees },
                { label: "感受", icon: Smile },
                { label: "静安", icon: Moon },
                { label: "律动", icon: Activity },
                { label: "警笛", icon: ShieldAlert },
                { label: "声音", icon: Volume2 },
                { label: "成长", icon: Star },
              ].map((ic, idx) => {
                const Icon = ic.icon;
                return (
                  <div key={idx} className="space-y-2 flex flex-col items-center">
                    <div className="w-11 h-11 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-700 hover:bg-[#E0F0F8]/30 transition-colors">
                      <Icon className="w-5 h-5 text-[#5E7F73]" />
                    </div>
                    <span className="text-[10px] text-stone-500 font-bold">{ic.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SECTION 06: Data Visualization */}
        <section id="vone-dataviz" className="space-y-4">
          <div className="flex items-baseline gap-2.5 border-b border-stone-200 pb-2">
            <span className="font-mono text-base font-black text-[#5E7F73]">06</span>
            <h3 className="font-display font-black text-lg text-[#1E3F39]">Data Visualization 数据可视化</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Card 1: Wave trend */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/45 space-y-3 shadow-xs">
              <span className="text-[10px] font-bold text-stone-400">Mood Trend 情绪有谱</span>
              <div className="h-28 flex items-end justify-between px-2 pt-4 relative">
                {/* Simulated wavy lines as SVG */}
                <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0,25 C15,10 30,35 45,15 C60,2 75,30 100,10" fill="none" stroke="#C0E890" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0,25 C15,10 30,35 45,15 C60,2 75,30 100,10" fill="none" stroke="#E0F0F8" strokeWidth="1.5" strokeDasharray="3" />
                  {/* points */}
                  <circle cx="45" cy="15" r="3" fill="#5E7F73" />
                  <circle cx="68" cy="12" r="3.5" fill="#C35A3A" />
                </svg>
                <div className="text-[9px] text-stone-400 font-mono flex justify-between w-full mt-auto">
                  <span>周一</span>
                  <span>周三</span>
                  <span>周五</span>
                  <span>周日</span>
                </div>
              </div>
            </div>

            {/* Card 2: Wellbeing Score */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/45 flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold text-stone-400">Well-being Score 幸福指数</span>
              <div className="flex items-center justify-center py-2">
                <div className="w-20 h-20 rounded-full border-[8px] border-[#E0F0F8] flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-[8px] border-transparent border-t-[#C0E890] border-r-[#C0E890] animate-pulse-gently" />
                  <span className="text-xl font-mono font-black text-[#1E3F39]">82</span>
                  <span className="text-[9px] text-stone-400 font-bold">Good 良好</span>
                </div>
              </div>
            </div>

            {/* Card 3: Emotion Balance */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/45 space-y-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-stone-400">Emotion Balance 情绪平衡</span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[9px] font-bold text-stone-500 mb-1">
                    <span>平静度</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#E0F0F8] h-full rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-bold text-stone-500 mb-1">
                    <span>抗挫力</span>
                    <span>88%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#C0E890] h-full rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-bold text-stone-500 mb-1">
                    <span>释放感</span>
                    <span>60%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#FFF9B1] h-full rounded-full pb-1" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 07: Typography */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-2.5 border-b border-stone-200 pb-2">
            <span className="font-mono text-base font-black text-[#5E7F73]">07</span>
            <h3 className="font-display font-black text-lg text-[#1E3F39]">Typography 字体系统</h3>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-stone-200/45 grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-5xl font-display font-black text-[#1E3F39] block">Aa</span>
              <p className="text-xs text-stone-500 font-bold tracking-wide">Harmony in every type. 让每一个字母都传递温润与力量。</p>
            </div>
            <div className="space-y-2 border-l border-stone-100 pl-6 text-stone-700">
              <p className="text-sm font-semibold">思源黑体 Source Han Sans</p>
              <p className="text-xs text-stone-400 font-medium">安静 · 自然 · 轻盈 · 朋友</p>
              <div className="h-0.5 bg-[#E0F0F8] w-12 mt-4" />
              <p className="text-xs text-[#5B6B67] leading-relaxed pt-2">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ <br />
                abcdefghijklmnopqrstuvwxyz <br />
                0123456789
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 08: Mockups & Demo Control */}
        <section id="vone-mockups" className="space-y-4">
          <div className="flex items-baseline gap-2.5 border-b border-stone-200 pb-2">
            <span className="font-mono text-base font-black text-[#5E7F73]">08</span>
            <h3 className="font-display font-black text-lg text-[#1E3F39]">Mockups 界面示例 (可点击触发交互)</h3>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              {
                id: "morning",
                title: "Good Morning 早上好",
                desc: "和解海洋开启面板",
                emoji: "🌅",
                actionDesc: "切换到和解海洋首页"
              },
              {
                id: "mood",
                title: "Mood Today 今日心情",
                desc: "滑动笑脸评分记录",
                emoji: "💛",
                actionDesc: "打开笑容滑动录入"
              },
              {
                id: "breathing",
                title: "Breathing 呼吸练习",
                desc: "吸气/呼气律动疗愈",
                emoji: "🍃",
                actionDesc: "启动4分钟吸气计时器"
              },
              {
                id: "insights",
                title: "Insights 行为洞察",
                desc: "周心情与幸福评分",
                emoji: "📈",
                actionDesc: "开启成长分析周图谱"
              }
            ].map((mock) => {
              const isActive = activeMockup === mock.id;
              return (
                <button
                  key={mock.id}
                  onClick={() => onSelectMockup(mock.id as any)}
                  className={`p-4 rounded-3xl border text-left flex flex-col gap-3 transition-all ${
                    isActive 
                      ? "bg-[#C0E890]/25 border-[#5E7F73] shadow-xs scale-[1.03]" 
                      : "bg-white border-stone-200/40 hover:border-[#E0F0F8] hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <GlassIcon emoji={mock.emoji} size="sm" />
                    {isActive && <span className="text-[10px] bg-[#5E7F73] text-white px-2 py-0.5 rounded-full font-bold">已同步模拟</span>}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">{mock.title}</h4>
                    <p className="text-[10px] text-stone-500 font-bold mt-0.5">{mock.desc}</p>
                    <p className="text-[9px] text-[#5E7F73] font-bold mt-2.5 flex items-center gap-0.5 group">
                      点击同步演示 ➔
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
