import React from "react";
import { motion } from "motion/react";

interface OnboardingGuideProps {
  onComplete: () => void;
}

export default function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const steps = [
    {
      id: 1,
      title: "记录痛感",
      description: "快速记下当下真实感受，不急着总结",
    },
    {
      id: 2,
      title: "AI拆解原因",
      description: "用5Why五层原因链找到问题根源",
    },
    {
      id: 3,
      title: "生成原则卡",
      description: "把改善对策变成下次可执行动作",
    },
    {
      id: 4,
      title: "默认私密",
      description: "所有错题默认仅自己可见",
    },
  ];

  return (
    <div 
      className="flex-1 flex flex-col h-full w-full relative overflow-hidden select-none"
      style={{
        background: "linear-gradient(135deg, #E2F2FC 0%, #F5FAED 45%, #E6FAF8 100%)"
      }}
    >
      {/* Absolute diffuse gradient highlight background lights */}
      <div className="absolute top-[5%] left-[10%] w-72 h-72 rounded-full bg-[#E5FAD7]/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-72 h-72 rounded-full bg-[#DEF0FC]/60 blur-3xl pointer-events-none" />

      {/* Top Triple-dot Header Actions Row */}
      <div className="h-14 px-6 flex items-center justify-between text-stone-500/80 z-20">
        <span className="text-[10px] font-black tracking-wider text-stone-400 invisible">9:41</span>
        <span className="text-[14px] font-bold text-stone-700 tracking-wider font-sans">初次引导</span>
        <button className="text-[18px] font-extrabold text-stone-700 tracking-widest outline-none active:scale-95 transition-transform">
          •••
        </button>
      </div>

      {/* Intro Header Section with exact 1:1 image content typography layout */}
      <div className="px-8 pt-4 pb-6 z-15 text-left">
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[42px] font-semibold leading-[1.2] text-[#1E3F39] tracking-tight font-sans drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
        >
          欢迎来到
          <br />
          <span className="text-[#1A3833] font-semibold" style={{ fontFamily: "'ZCOOL KuaiLe', sans-serif" }}>「错了吗」</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-[13px] text-stone-500/90 font-semibold tracking-wide mt-3.5 leading-relaxed"
        >
          一个帮助你把错误变成成长资产的工具
        </motion.p>
      </div>

      {/* Staggered Guide Step Cards container */}
      <div className="flex-1 px-5 space-y-4 z-15 overflow-y-auto no-scrollbar pb-32">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 140, 
              damping: 18, 
              delay: 0.25 + idx * 0.12 
            }}
            className="flex items-center gap-3.5"
          >
            {/* Round Green Number Icon */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-white text-[13.5px] shadow-sm shrink-0"
              style={{ backgroundColor: "#78D048" }}
            >
              {step.id}
            </div>

            {/* Light opaque frosted card background matching image perfectly */}
            <div 
              className="flex-1 bg-white/60 hover:bg-white/75 transition-colors border border-white/40 rounded-[20px] px-5 py-4 shadow-[0_4px_16px_rgba(30,63,57,0.02)] backdrop-blur-sm"
            >
              <h3 className="text-[15px] font-[800] text-[#1E3F39] tracking-wide mb-1">
                {step.title}
              </h3>
              <p className="text-[11.5px] text-stone-500 font-bold leading-normal">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Bottom Button Segment container with micro-shimmer shine effect */}
      <div className="absolute bottom-6 left-0 right-0 px-6 z-20">
        <motion.button
          onClick={onComplete}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 24px -2px rgba(94, 189, 240, 0.35)"
          }}
          whileTap={{ 
            scale: 0.96 
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 16, 
            delay: 0.7 
          }}
          className="w-full h-13 rounded-full flex items-center justify-center font-[800] text-[15px] text-[#1A3833] tracking-widest cursor-pointer shimmer-btn border border-white/30"
          style={{
            background: "linear-gradient(90deg, #C2EC97 0%, #D4F2AC 30%, #76CAEB 100%)",
            boxShadow: "0 6px 18px rgba(94, 189, 240, 0.2)"
          }}
        >
          开始使用
        </motion.button>
      </div>
    </div>
  );
}
