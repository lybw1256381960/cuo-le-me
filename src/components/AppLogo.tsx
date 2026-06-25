import React from "react";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function AppLogo({ className = "", size = "md", showText = true }: AppLogoProps) {
  // Dimensions based on size
  const iconSizes = {
    sm: "w-16 h-16",
    md: "w-36 h-36",
    lg: "w-44 h-44",
    xl: "w-52 h-52",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-[36px] mt-1",
    lg: "text-[42px] mt-1.5",
    xl: "text-[52px] mt-2",
  };

  const subSizes = {
    sm: "text-[9px] mt-0.5",
    md: "text-[11px] mt-0.5",
    lg: "text-xs mt-1",
    xl: "text-sm mt-1.5",
  };

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* 3D Glassmorphic / Volumetric SVG Logo Icon */}
      <div className={`relative ${iconSizes[size]} transition-transform duration-500 hover:scale-105 active:scale-95`}>
        {/* Soft background ambient glow */}
        <div className="absolute inset-0 bg-emerald-400/15 rounded-full blur-xl pointer-events-none transform scale-125" />
        
        <svg 
          id="global-brand-logo-svg"
          viewBox="0 0 100 100" 
          className="w-full h-full relative z-10 filter drop-shadow-[0_8px_16px_rgba(30,63,57,0.12)]"
        >
          <defs>
            {/* Emerald Green gradient for the circular arrow tube */}
            <linearGradient id="logoArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8EE058" /> {/* Apple yellow-green */}
              <stop offset="50%" stopColor="#4BBB6B" /> {/* Vibrant emerald green */}
              <stop offset="100%" stopColor="#3CD19F" /> {/* Shiny mint cyan */}
            </linearGradient>

            {/* Glossy 3D radial gradient for the golden sun bullet */}
            <radialGradient id="goldenBall" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF176" />
              <stop offset="35%" stopColor="#FBC02D" />
              <stop offset="85%" stopColor="#F57C00" />
              <stop offset="100%" stopColor="#E65100" />
            </radialGradient>

            {/* Dark green gradient for the checkmark to look premium */}
            <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3F39" />
              <stop offset="100%" stopColor="#0F2420" />
            </linearGradient>

            {/* Dropshadow filter within SVG */}
            <filter id="vectorShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#274D43" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* 1. Golden glossy sphere at the top right gap (around 1:30) */}
          <circle 
            cx="70" 
            cy="18" 
            r="8.5" 
            fill="url(#goldenBall)" 
            className="animate-pulse-gently"
            style={{ transformOrigin: "70px 18px" }}
          />

          {/* 2. Loop sprout (the little stem and two green leaves) grew from the tip at 3:30 */}
          {/* Sprout stem */}
          <path 
            d="M 72.5 39 C 72 32.5, 71.5 29, 69.5 28" 
            fill="none" 
            stroke="#47C76C" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
          />
          {/* Left leaf */}
          <path 
            d="M 69.5 28 C 61.5 25, 60.5 33, 69.5 28 Z" 
            fill="#3DBC62" 
            stroke="#47C76C"
            strokeWidth="0.5"
          />
          {/* Right leaf */}
          <path 
            d="M 69.5 28 C 77.5 23.5, 80.5 31, 69.5 28 Z" 
            fill="#50D577"
            stroke="#47C76C"
            strokeWidth="0.5"
          />

          {/* 3. The Grand Gradient Circular Arrow Arc Tubing */}
          <path 
            d="M 72.8 39 A 24 24 0 1 1 42.5 24.5" 
            fill="none" 
            stroke="url(#logoArcGrad)" 
            strokeWidth="11.5" 
            strokeLinecap="round" 
            className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.06)]"
          />

          {/* 4. Rounded Arrow Head pointing northeast (clockwise) at the top tip */}
          {/* Created using the masterfully designed soft corner triangular path */}
          <path 
            d="M 33 16 C 33 14, 35 14, 37.2 15.5 L 51 22.5 C 52.5 23.2, 52.5 24.8, 51 25.5 L 37.2 32.5 C 35 34, 33 33.5, 33 31.5 Z" 
            fill="url(#logoArcGrad)" 
            className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
          />

          {/* 5. Center checkmark - beautiful, crisp, and solid charcoal-green */}
          <path 
            d="M 38.5 48.5 L 46.5 56.5 L 63.5 35" 
            fill="none" 
            stroke="url(#checkGrad)" 
            strokeWidth="6.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#vectorShadow)"
          />
        </svg>
      </div>

      {showText && (
        <div className="animate-fade-in">
          {/* Main Title "错了吗" styled with ZCOOL KuaiLe Google Font */}
          <h1 
            id="brand-logo-text-title"
            className={`font-medium text-[#1E3F39] tracking-wider select-none font-sans drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] ${textSizes[size]}`}
            style={{ fontFamily: "'ZCOOL KuaiLe', sans-serif" }}
          >
            错了吗
          </h1>
          
          {/* Subtitle "人生错题本 AI 成长助手" with flanked sleek horizontal design lines */}
          <div className="flex items-center justify-center gap-2.5 opacity-90">
            <span className="w-6 h-[1px] bg-gradient-to-r from-transparent to-[#5E7F73]/50" />
            <p className={`text-[#5E7F73] font-bold tracking-widest font-sans uppercase ${subSizes[size]}`}>
              人生错题本 AI 成长助手
            </p>
            <span className="w-6 h-[1px] bg-gradient-to-l from-transparent to-[#5E7F73]/50" />
          </div>
        </div>
      )}
    </div>
  );
}
