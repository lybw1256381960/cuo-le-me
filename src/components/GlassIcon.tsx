import React, { CSSProperties } from "react";

interface GlassIconProps {
  emoji: string;
  className?: string;
  size?: "inline" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  style?: CSSProperties;
}

export default function GlassIcon({ emoji, className = "", size = "inline" }: GlassIconProps) {
  // Map the emojis to their specific SVG rendering paths
  const cleanEmoji = emoji.trim().replace(/\uFE0F/g, "");

  // Determine size classes (all are at least 25px * 25px)
  const sizeClasses = {
    inline: "w-[26px] h-[26px] inline-flex mx-0.5 align-middle",
    xs: "w-[26px] h-[26px]",
    sm: "w-[32px] h-[32px]",
    md: "w-[40px] h-[40px]",
    lg: "w-[52px] h-[52px]",
    xl: "w-[68px] h-[68px]",
    "2xl": "w-[84px] h-[84px]",
  }[size];

  // Helper to render the inner SVG paths
  const renderIconSvg = () => {
    const gradientDef = (
      <defs>
        <linearGradient id="premiumYGBGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FFF886" />   {/* High-end Clear Pastel Yellow */}
          <stop offset="45%" stopColor="#34D399" />  {/* Clear Mint/Teal Green */}
          <stop offset="100%" stopColor="#3B82F6" /> {/* Radiant Ocean Blue */}
        </linearGradient>
        {/* Emotion Gradients */}
        <linearGradient id="emotionHappyGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FFE259" />
          <stop offset="100%" stopColor="#FFA751" />
        </linearGradient>
        <linearGradient id="emotionCalmGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#C0E890" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="emotionNeutralGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FFF9B1" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="emotionAnxiousGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="emotionAngryGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
        {/* Symptom Gradients from Image 2 */}
        <linearGradient id="symptomHeadGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id="symptomNeckGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="symptomChestGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#C7D2FE" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="symptomHeartGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#F9A8D4" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
        <linearGradient id="symptomStomachGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
        <linearGradient id="symptomLungGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="symptomSweatGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="symptomDizzyGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#C0F396" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id="symptomSleepGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    );

    switch (cleanEmoji) {
      // --- PHYSICAL SYMPTOMS (Image 2) ---
      case "头痛":
      case "Brain":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomHeadGrad)" fillOpacity="0.12" />
            <path d="M12 4.5c-3.5 0-6 2.5-6 6 0 1.8.8 3 1.5 4 .5.5.5 1.2.5 1.8v1.2c0 1 .8 1.8 1.8 1.8h4.4c1 0 1.8-.8 1.8-1.8v-1.2c0-.6 0-1.3.5-1.8.7-1 1.5-2.2 1.5-4 0-3.5-2.5-6-6-6z" fill="url(#symptomHeadGrad)" fillOpacity="0.2" stroke="white" strokeWidth="0.8" />
            <path d="M11.5 12c.5-1 1.5-1 2 0M10.5 12.5c-.3 0-.6-.3-.6-.6 0-.3.3-.6.6-.6s.6.3.6.6c0 .3-.3.6-.6.6zm3 0c-.3 0-.6-.3-.6-.6 0-.3.3-.6.6-.6s.6.3.6.6c0 .3-.3.6-.6.6z" stroke="url(#symptomHeadGrad)" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M13.5 3.5l-2 3h2.5l-2 3.5" stroke="url(#symptomHeadGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        );

      case "肩颈紧张":
      case "紧绷":
      case "Scale":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomNeckGrad)" fillOpacity="0.12" />
            <path d="M12 6.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="white" strokeWidth="0.8" fill="url(#symptomNeckGrad)" fillOpacity="0.2" />
            <path d="M5.5 20c0-3.2 2.5-5 6.5-5s6.5 1.8 6.5 5" stroke="white" strokeWidth="0.8" fill="none" />
            {/* Neck and spine core */}
            <path d="M12 9v7.5M9.5 11l-1.5 1.5M14.5 11l1.5 1.5" stroke="url(#symptomNeckGrad)" strokeWidth="1" strokeLinecap="round" />
            {/* Tension indicators */}
            <path d="M7 11.5a1.8 1.8 0 011.8-1.8M17 11.5a1.8 1.8 0 00-1.8-1.8" stroke="url(#symptomNeckGrad)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        );

      case "胸口闷":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomChestGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="5.5" r="2" stroke="white" strokeWidth="0.8" fill="url(#symptomChestGrad)" fillOpacity="0.2" />
            <path d="M6 19.5c0-2.8 2.5-4.5 6-4.5s6 1.7 6 4.5" stroke="white" strokeWidth="0.8" fill="none" />
            {/* Purplish tight ring core */}
            <circle cx="12" cy="13.5" r="3.5" stroke="url(#symptomChestGrad)" strokeWidth="1.5" fill="url(#symptomChestGrad)" fillOpacity="0.3" className="animate-pulse" />
            <circle cx="12" cy="13.5" r="1" fill="url(#symptomChestGrad)" />
          </svg>
        );

      case "心悸":
      case "Activity":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomHeartGrad)" fillOpacity="0.12" />
            <path d="M12 18.5l-1.15-1.05C6.75 13.8 4 11.15 4 8c0-2.4 1.8-4.2 4.2-4.2 1.35 0 2.65.65 3.5 1.65.85-1 2.15-1.65 3.5-1.65 2.4 0 4.2 1.8 4.2 4.2 0 3.15-2.75 5.8-6.85 9.45L12 18.5z" fill="url(#symptomHeartGrad)" fillOpacity="0.2" stroke="white" strokeWidth="0.8" />
            {/* High contract heartbeat pulse */}
            <path d="M5.5 8h2.5l1-2.5 1.5 5 1-3.5 1 1.5h3.5" stroke="url(#symptomHeartGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        );

      case "胃部不适":
      case "Flame":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomStomachGrad)" fillOpacity="0.12" />
            <path d="M18 7c-1.5-1.5-4-2.2-6-1.2-3.5 1.5-6 5-6 8.5 0 3 2 4.8 4.8 4.8 3.8 0 5.8-3 5.8-6.5s-2.2-3.8-2.6-3.4" stroke="white" strokeWidth="0.8" fill="url(#symptomStomachGrad)" fillOpacity="0.2" strokeLinejoin="round" />
            {/* Distress warning indicator */}
            <path d="M10.5 11.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" fill="url(#symptomStomachGrad)" />
            <path d="M6.5 12.5c-.5.5-.8 1.2-.8 2M14.5 11c.4-.6 1.2-.9 2-.9" stroke="url(#symptomStomachGrad)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case "呼吸急促":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomLungGrad)" fillOpacity="0.12" />
            {/* Left lung */}
            <path d="M11 6.5c-2-1-5 1.5-5 5.5s2 5 4.5 3.8V6.5z" fill="url(#symptomLungGrad)" fillOpacity="0.2" stroke="white" strokeWidth="0.8" />
            {/* Right lung */}
            <path d="M13 6.5c2-1 5 1.5 5 5.5s-2 5-4.5 3.8V6.5z" fill="url(#symptomLungGrad)" fillOpacity="0.2" stroke="white" strokeWidth="0.8" />
            {/* Wind/Rapid breathing indicator waves */}
            <path d="M18.5 7.5c1.5.3 1.5 1 0 1.3M19.5 10c1 .3 1 1 0 1.3M18 12.5c1.5.3 1.5 1 0 1.3" stroke="url(#symptomLungGrad)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "手心出汗":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomSweatGrad)" fillOpacity="0.12" />
            <path d="M17.5 11c0-.8-.7-1.5-1.5-1.5-.2 0-.4 0-.6.1V5c0-.8-.7-1.5-1.5-1.5S12.4 4.2 12.4 5v3.8c-.2 0-.4-.1-.6-.1-.8 0-1.5.7-1.5 1.5V11c0-.8-.7-1.5-1.5-1.5S7.3 10.2 7.3 11c0 3 2.5 5 5.5 5h3.5c3 0 5.5-2 5.5-5V11z" stroke="white" strokeWidth="0.8" fill="url(#symptomSweatGrad)" fillOpacity="0.2" />
            {/* Translucent sweating drops */}
            <path d="M9.5 13.5c0 .6-.5 1-1 1s-1-.4-1-1c0-.8 1-2 1-2s1 1.2 1 2zm4.5 1c0 .6-.5 1-1 1s-1-.4-1-1c0-.8 1-2 1-2s1 1.2 1 2z" fill="url(#symptomSweatGrad)" />
          </svg>
        );

      case "头晕":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomDizzyGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12.5" r="4" fill="url(#symptomDizzyGrad)" fillOpacity="0.2" stroke="white" strokeWidth="0.8" />
            {/* Swirling orbits */}
            <ellipse cx="12" cy="11.5" rx="7.5" ry="2.2" stroke="url(#symptomDizzyGrad)" strokeWidth="1.2" fill="none" transform="rotate(-15,12,11.5)" />
            {/* Golden stars */}
            <path d="M12 5.5l.3.8.9.1-.7.6.2.9-.7-.5-.7.5.2-.9-.7-.6.9-.1.3-.8zm-6.5 4l.2.6.7.1-.5.5.2.8-.6-.4-.6.4.2-.8-.5-.5.7-.1.2-.6z" fill="url(#symptomDizzyGrad)" />
          </svg>
        );

      case "睡眠不好":
      case "疲惫":
      case "BatteryLow":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomSleepGrad)" fillOpacity="0.12" />
            <path d="M12 3.5a8.5 8.5 0 108.5 8.5 9.25 9.25 0 01-8.5-8.5z" fill="url(#symptomSleepGrad)" fillOpacity="0.22" stroke="white" strokeWidth="0.8" />
            <path d="M8.5 15c0-1.2 1-2 2-2h3c1.2 0 2 .8 2 2" stroke="white" strokeWidth="0.8" />
            {/* Floating sleeping Z's */}
            <path d="M14.5 4.5h2.5l-2.5 2.5h2.5M17.5 7.5h2l-2 2h2" stroke="url(#symptomSleepGrad)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case "其他":
      case "MoreHorizontal":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="6.5" fill="url(#premiumYGBGrad)" fillOpacity="0.2" stroke="white" strokeWidth="0.8" />
            <circle cx="8" cy="12" r="1.2" fill="url(#premiumYGBGrad)" />
            <circle cx="12" cy="12" r="1.2" fill="url(#premiumYGBGrad)" />
            <circle cx="16" cy="12" r="1.2" fill="url(#premiumYGBGrad)" />
          </svg>
        );

      // --- EMOTION EXPRESSION FACES (Image 1 - spectrum of 7 levels) ---
      // Premium Custom Emotion Grid Icons based on User Image 1:
      case "焦虑":
      case "Anxious":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionNeutralGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#emotionNeutralGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.8" />
            {/* Worried eyes and eyebrows */}
            <circle cx="9" cy="11.5" r="1" fill="#78350F" />
            <circle cx="15" cy="11.5" r="1" fill="#78350F" />
            <path d="M7.5 10c.8-.5 1.5-.2 1.5-.2M16.5 10c-.8-.5-1.5-.2-1.5-.2" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
            {/* Worried squiggly mouth */}
            <path d="M9.5 15c.8-.5 1.5.5 2.2 0s1.5-.5 2.2 0" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Tension squiggly waves on the sides */}
            <path d="M4 9.5c.3-.5.3-1 0-1.5s-.3-1 0-1.5M20 9.5c.3-.5.3-1 0-1.5s-.3-1 0-1.5" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "愤怒":
      case "Angry":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionAngryGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#emotionAngryGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.85" />
            {/* Furious slanted eyebrows and furious eyes */}
            <circle cx="9" cy="12" r="1.1" fill="#450A0A" />
            <circle cx="15" cy="12" r="1.1" fill="#450A0A" />
            <path d="M7.5 9.5l2.2 1.2M16.5 9.5l-2.2 1.2" stroke="#450A0A" strokeWidth="1.5" strokeLinecap="round" />
            {/* Tense tight straight mouth */}
            <path d="M9.5 15.5h5" stroke="#450A0A" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        );

      case "沮丧":
      case "Depressed":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomLungGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#symptomLungGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.8" />
            {/* Sad downcast eyes and eyebrows */}
            <circle cx="9" cy="11.5" r="1" fill="#1E3A8A" />
            <circle cx="15" cy="11.5" r="1" fill="#1E3A8A" />
            <path d="M7.5 9.5c.8-.3 1.5 0 1.5 0M16.5 9.5c-.8-.3-1.5 0-1.5 0" stroke="#1E3A8A" strokeWidth="1.2" strokeLinecap="round" />
            {/* Downward turned mouth */}
            <path d="M9 15.5a3 3 0 016 0" stroke="#1E3A8A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            {/* Teardrop rolling down on side */}
            <path d="M17 13.5c0 .6-.5 1-1 1s-1-.4-1-1c0-.8 1-2 1-2s1 1.2 1 2z" fill="#93C5FD" />
          </svg>
        );

      case "内疚":
      case "Guilty":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionNeutralGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#emotionNeutralGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.8" />
            {/* Downcast ashamed eyes */}
            <path d="M7.5 11c.5.5 1 .5 1.5 0M15 11c.5.5 1 .5 1.5 0" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Worried eyebrows */}
            <path d="M7.5 9.2c1-.4 1.5 0 1.5 0M16.5 9.2c-1-.4-1.5 0-1.5 0" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
            {/* Ashamed tiny mouth */}
            <circle cx="12" cy="14.5" r="1" fill="#78350F" />
            {/* Shy little hands touching chin */}
            <path d="M9 18c1 1 2 1 3 0M15 18c-1 1-2 1-3 0" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
          </svg>
        );

      case "失望":
      case "Disappointed":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomChestGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#symptomChestGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.85" />
            {/* Disillusioned flat straight eyes */}
            <circle cx="9" cy="11.5" r="1" fill="#1E1B4B" />
            <circle cx="15" cy="11.5" r="1" fill="#1E1B4B" />
            <path d="M7.5 10h2.5M14 10h2.5" stroke="#1E1B4B" strokeWidth="1" strokeLinecap="round" />
            {/* Downcast flat straight mouth */}
            <path d="M9 15.5h6" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case "无助":
      case "Helpless":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomSleepGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#symptomSleepGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.8" />
            {/* Helpless tearing eyes */}
            <path d="M7.5 11c.5.5 1.5.5 2 0M14.5 11c.5.5 1.5.5 2 0" stroke="#4C1D95" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Trembling sad mouth */}
            <path d="M10.5 15c.5-.4 1-.4 1.5 0s1 .4 1.5 0" stroke="#4C1D95" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Small helpless raised hands on the sides */}
            <path d="M4.5 16.5c.5-1 1.5-1 2 0M17.5 16.5c.5-1 1.5-1 2 0" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
          </svg>
        );

      case "平静":
      case "Calm":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionCalmGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#emotionCalmGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.85" />
            {/* Peaceful closed curved eyes */}
            <path d="M7.5 11.5c.5-.5 1.5-.5 2 0M14.5 11.5c.5-.5 1.5-.5 2 0" stroke="#064E3B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Gentle calm smile */}
            <path d="M9.5 14c1 1 3 1 4 0" stroke="#064E3B" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            {/* Serene lotus / leaf motif at the top center */}
            <path d="M12 4.5c.4-1 1.2-1 1.2 0s-.8 1.2-1.2 0z" fill="#34D399" />
          </svg>
        );

      case "害怕":
      case "Scared":
      case "Fear":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionAnxiousGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#emotionAnxiousGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.8" />
            {/* Wide scared eyes with white ring accents */}
            <circle cx="8.5" cy="11" r="1.5" fill="#1E1B4B" stroke="white" strokeWidth="0.4" />
            <circle cx="15.5" cy="11" r="1.5" fill="#1E1B4B" stroke="white" strokeWidth="0.4" />
            {/* Trembling wave fear mouth */}
            <path d="M9.5 15.5c.8-.5 1.5.5 2.2 0s1.5-.5 2.2 0" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Fear sweat drops */}
            <path d="M5.5 10c0 .5-.3.8-.7.8s-.7-.3-.7-.8c0-.6.7-1.5.7-1.5s.7.9.7 1.5z" fill="#60A5FA" />
          </svg>
        );

      case "开心":
      case "Happy":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionHappyGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#emotionHappyGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.85" />
            {/* Laughing closed eyes */}
            <path d="M7.5 11c.5-.8 1.5-.8 2 0M14.5 11c.5-.8 1.5-.8 2 0" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Rosy blushing cheeks */}
            <circle cx="6.5" cy="13.2" r="1.2" fill="#F43F5E" fillOpacity="0.5" />
            <circle cx="17.5" cy="13.2" r="1.2" fill="#F43F5E" fillOpacity="0.5" />
            {/* Happy sweet curved smile */}
            <path d="M8.5 13.5a3.5 3.5 0 007 0" stroke="#78350F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        );

      case "尴尬":
      case "Awkward":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#symptomHeartGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#symptomHeartGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.8" />
            {/* Strong blushing cheeks circles */}
            <circle cx="7" cy="13" r="2" fill="#DB2777" fillOpacity="0.3" />
            <circle cx="17" cy="13" r="2" fill="#DB2777" fillOpacity="0.3" />
            {/* Embarrassed sweat drop on forehead */}
            <path d="M17.5 7.5c0 .5-.3.8-.7.8s-.7-.3-.7-.8c0-.6.7-1.5.7-1.5s.7.9.7 1.5z" fill="#38BDF8" />
            {/* Worried eyes */}
            <circle cx="9" cy="11.2" r="1" fill="#4D0F29" />
            <circle cx="15" cy="11.2" r="1" fill="#4D0F29" />
            {/* Awkward squiggly smile */}
            <path d="M9.5 14.5c.8-.4 1.5.4 2.2 0" stroke="#4D0F29" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        );

      case "释然":
      case "Relieved":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionCalmGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" fill="url(#emotionCalmGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.85" />
            {/* Curved soft eyes (sleeping/relaxed) */}
            <path d="M7.5 11c.5-.5 1.2-.5 1.5 0M15 11c.5-.5 1.2-.5 1.5 0" stroke="#064E3B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Whistling mouth blowing out a gentle breeze */}
            <circle cx="12" cy="14.5" r="1" stroke="#064E3B" strokeWidth="1" fill="none" />
            {/* Soft wind blow cloud */}
            <path d="M14 14.5h2.5c.4 0 .4-.4 0-.4s-.4-.4 0-.4" stroke="#34D399" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        );

      // Level 7: Highly Joyful / Exquisite / Excited (🤩 or 😇)
      case "🤩":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionHappyGrad)" stroke="white" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionHappyGrad)" fillOpacity="0.12" />
            {/* Starry eyes */}
            <path d="M8.5 7.5l.4 1.2 1.2.1-1 .9.3 1.2-1-.7-1 .7.3-1.2-1-.9 1.2-.1.4-1.2zM15.5 7.5l.4 1.2 1.2.1-1 .9.3 1.2-1-.7-1 .7.3-1.2-1-.9 1.2-.1.4-1.2z" fill="white" />
            {/* Big smiling mouth */}
            <path d="M7.5 12.5a4.5 4.5 0 009 0H7.5z" fill="#312E81" />
            <path d="M8 12.5h8" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        );

      // Level 6: Healing / Blissful / Spiritual (😇)
      case "😇":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionCalmGrad)" stroke="white" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionCalmGrad)" fillOpacity="0.12" />
            {/* Glowing Angel Halo above */}
            <ellipse cx="12" cy="3.5" rx="3.5" ry="1" stroke="url(#emotionHappyGrad)" strokeWidth="1.2" fill="none" className="animate-pulse" />
            {/* Peaceful closed eyes */}
            <path d="M7.5 10c.5.5 1.5.5 2 0M14.5 10c.5.5 1.5.5 2 0" stroke="#064E3B" strokeWidth="1.2" strokeLinecap="round" />
            {/* Gentle smile */}
            <path d="M9.5 13.5a2.5 2.5 0 005 0" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        );

      // Level 5: Calm / Happy / Smiling (😊)
      case "😊":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#premiumYGBGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.85" />
            {/* Smiley eyes */}
            <path d="M7 10c.5-.8 1.5-.8 2 0M15 10c.5-.8 1.5-.8 2 0" stroke="#1E3A8A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Sweet warm smile */}
            <path d="M8.5 13.2a3.5 3.5 0 007 0" stroke="#1E3A8A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        );

      // Level 4: Soft Smiling / Content (🙂)
      case "🙂":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionNeutralGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.85" />
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionNeutralGrad)" fillOpacity="0.1" />
            {/* Calm dot eyes */}
            <circle cx="9.2" cy="10" r="1" fill="#78350F" />
            <circle cx="14.8" cy="10" r="1" fill="#78350F" />
            {/* Moderate smile */}
            <path d="M9 13.5a3 3 0 006 0" stroke="#78350F" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          </svg>
        );

      // Level 3: Neutral / Unmoved (😐)
      case "😐":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionNeutralGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.75" />
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionNeutralGrad)" fillOpacity="0.08" />
            {/* Clear flat eyes */}
            <circle cx="9.2" cy="10" r="1" fill="#78350F" />
            <circle cx="14.8" cy="10" r="1" fill="#78350F" />
            {/* Straight flat mouth */}
            <path d="M8.5 14h7" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      // Level 2: Worried / Anxious / Sad (😟 or 🙁)
      case "😟":
      case "🙁":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionAnxiousGrad)" stroke="white" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionAnxiousGrad)" fillOpacity="0.12" />
            {/* Worried eyes */}
            <circle cx="9.2" cy="10" r="1" fill="#1E1B4B" />
            <circle cx="14.8" cy="10" r="1" fill="#1E1B4B" />
            {/* Slanted sad eyebrows */}
            <path d="M7.5 8.5c1-.5 1.8 0 1.8 0M16.5 8.5c-1-.5-1.8 0-1.8 0" stroke="#1E1B4B" strokeWidth="1" strokeLinecap="round" />
            {/* Downward turned sad mouth */}
            <path d="M9 15a3 3 0 016 0" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        );

      // Level 1.5: Nervous / Distressed / Sweating (😰)
      case "😰":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionAnxiousGrad)" stroke="white" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionAnxiousGrad)" fillOpacity="0.15" />
            {/* Squiggly nervous eyes */}
            <circle cx="9.2" cy="10" r="1" fill="#1E1B4B" />
            <circle cx="14.8" cy="10" r="1" fill="#1E1B4B" />
            <path d="M7.5 8c.8-.5 1.5-.2 1.5-.2M16.5 8c-.8-.5-1.5-.2-1.5-.2" stroke="#1E1B4B" strokeWidth="1" strokeLinecap="round" />
            {/* Sweating drop sliding down */}
            <path d="M19 10c0 .6-.5 1-1 1s-1-.4-1-1c0-.8 1-2 1-2s1 1.2 1 2z" fill="#60A5FA" />
            {/* Squiggly mouth representing nervousness */}
            <path d="M9 14.5c.8-.5 1.5.5 2.2 0s1.5-.5 2.2 0" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        );

      // Level 1: Angry / Furious (😡 or 😣)
      case "😡":
      case "😣":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionAngryGrad)" stroke="white" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionAngryGrad)" fillOpacity="0.12" />
            {/* Furious dot eyes */}
            <circle cx="9.2" cy="11.2" r="1" fill="#450A0A" />
            <circle cx="14.8" cy="11.2" r="1" fill="#450A0A" />
            {/* Downward slanted angry eyebrows */}
            <path d="M7.5 9l2.2 1.2M16.5 9l-2.2 1.2" stroke="#450A0A" strokeWidth="1.4" strokeLinecap="round" />
            {/* Furious straight or downward curve mouth */}
            <path d="M9 15.5a3 3 0 016 0" stroke="#450A0A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        );

      // Level 0: Crying / Extreme Distress (😫)
      case "😫":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionAngryGrad)" stroke="white" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9.5" fill="url(#emotionAngryGrad)" fillOpacity="0.15" />
            {/* Squeezed closed distress eyes > < */}
            <path d="M7.5 9.5l1.5 1.5-1.5 1.5M16.5 9.5l-1.5 1.5 1.5 1.5" stroke="#450A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Double teardrop crying streams */}
            <path d="M9 13.5c0 .8-.5 1.5-.5 1.5s-.5-.7-.5-1.5.5-1.5.5-1.5.5.7.5 1.5zm6 0c0 .8-.5 1.5-.5 1.5s-.5-.7-.5-1.5.5-1.5.5-1.5.5.7.5 1.5z" fill="#93C5FD" />
            {/* Distressed open crying mouth */}
            <path d="M9.5 15.5c0-1.5 1.2-2.5 2.5-2.5s2.5 1 2.5 2.5H9.5z" fill="#450A0A" />
          </svg>
        );

      // --- EXISTING CORE CASES ---
      case "👤": // User
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* Clear core glow */}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="8" r="4.2" fill="url(#premiumYGBGrad)" stroke="white" strokeWidth="0.8" />
            <path
              d="M3.8 19.5C3.8 15.4 7.2 13 12 13C16.8 13 20.2 15.4 20.2 19.5C20.2 20.2 19.6 20.8 18.9 20.8H5.1C4.4 20.8 3.8 20.2 3.8 19.5Z"
              fill="url(#premiumYGBGrad)"
              stroke="white"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          </svg>
        );

      case "🔑": // Key
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide-key w-full h-full p-0.5">
            {gradientDef}
            <mask id="keyHeadMask">
              <rect x="0" y="0" width="24" height="24" fill="white" />
              <circle cx="12" cy="8" r="1.8" fill="black" />
            </mask>
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="8" r="4.5" fill="url(#premiumYGBGrad)" mask="url(#keyHeadMask)" />
            <rect x="11" y="11.5" width="2" height="10" rx="1" fill="url(#premiumYGBGrad)" />
            <rect x="12" y="15" width="3.5" height="2" rx="0.8" fill="url(#premiumYGBGrad)" />
            <rect x="12" y="18.5" width="3.5" height="2" rx="0.8" fill="url(#premiumYGBGrad)" />
          </svg>
        );

      case "🔒": // Lock
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <path
              d="M7.5 11.5V7C7.5 4.5 9.5 2.5 12 2.5C14.5 2.5 16.5 4.5 16.5 7V11.5"
              stroke="url(#premiumYGBGrad)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <rect
              x="4.5"
              y="10.5"
              width="15"
              height="11"
              rx="3"
              fill="url(#premiumYGBGrad)"
              stroke="white"
              strokeWidth="0.8"
            />
            <circle cx="12" cy="15" r="1.5" fill="white" />
            <path d="M12 16.5V18.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case "📅": // Calendar
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <rect
              x="4"
              y="5.5"
              width="16"
              height="15"
              rx="3"
              fill="url(#premiumYGBGrad)"
              stroke="white"
              strokeWidth="0.8"
            />
            <line x1="4" y1="10.5" x2="20" y2="10.5" stroke="white" strokeWidth="0.8" />
            <rect x="7" y="3" width="1.8" height="4.5" rx="0.9" fill="white" />
            <rect x="15" y="3" width="1.8" height="4.5" rx="0.9" fill="white" />
            <circle cx="8" cy="13.5" r="1" fill="white" fillOpacity="0.9" />
            <circle cx="12" cy="13.5" r="1" fill="white" fillOpacity="0.9" />
            <circle cx="16" cy="13.5" r="1" fill="white" fillOpacity="0.9" />
            <circle cx="8" cy="17" r="1" fill="white" fillOpacity="0.9" />
            <circle cx="12" cy="17" r="1" fill="white" fillOpacity="0.9" />
            <circle cx="16" cy="17" r="1" fill="white" fillOpacity="0.9" />
          </svg>
        );

      case "📝": // Document
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <rect
              x="4.5"
              y="5.5"
              width="15"
              height="15.5"
              rx="2.5"
              fill="url(#premiumYGBGrad)"
              stroke="white"
              strokeWidth="0.8"
            />
            <path d="M9 3.5H15V5.5H9V3.5Z" fill="white" />
            <rect x="10.5" y="3" width="3" height="1.5" rx="0.75" fill="#34D399" />
            <line x1="8" y1="9.5" x2="16" y2="9.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="8" y1="13.5" x2="14" y2="13.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="8" y1="16.5" x2="12" y2="16.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "🎫": // Ticket
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <path
              d="M3 8C3 6.9 3.9 6 5 6H19C20.1 6 21 6.9 21 8C21 9.4 19.9 10.5 18.5 10.5C18.5 10.5 18.5 10.5 18.5 10.5C18.5 10.5 18.5 10.5 18.5 10.5C19.9 10.5 21 11.6 21 13C21 14.1 20.1 15 19 15H5C3.9 15 3 14.1 3 13C3 11.6 4.1 10.5 5.5 10.5C5.5 10.5 5.5 10.5 5.5 10.5C5.5 10.5 5.5 10.5 5.5 10.5C4.1 10.5 3 9.4 3 8ZM3 15C3 16.1 3.9 17 5 17H19C20.1 17 21 16.1 21 15"
              fill="url(#premiumYGBGrad)"
              stroke="white"
              strokeWidth="0.8"
              fillRule="evenodd"
              clipRule="evenodd"
            />
            <line
              x1="9"
              y1="6.5"
              x2="9"
              y2="16.5"
              stroke="white"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
            <path
              d="M15 9.5L15.6 10.8L17 11L16 12L16.2 13.4L15 12.7L13.8 13.4L14 12L13 11L14.4 10.8L15 9.5Z"
              fill="white"
            />
          </svg>
        );

      case "🍵": // Tea
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <path
              d="M9.5 6C9.5 5 10.5 4.5 10.5 3.5"
              stroke="url(#premiumYGBGrad)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M12.5 6C12.5 5 13.5 4.5 13.5 3.5"
              stroke="url(#premiumYGBGrad)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M6 8.5H16C16 13.5 14.5 16.5 11 16.5C7.5 16.5 6 13.5 6 8.5Z"
              fill="url(#premiumYGBGrad)"
              stroke="white"
              strokeWidth="0.8"
            />
            <path
              d="M16 10.5C18 10.5 19 11.5 19 12.5C19 13.5 18 14.5 16 14.5"
              stroke="url(#premiumYGBGrad)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path d="M5.5 18.5H16.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case "🌸": // Cherry Blossom
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <path
              d="M12 12C12.5 9 14.5 7 12 7C9.5 7 11.5 9 12 12ZM12 12C15 12.5 17 14.5 17 12C17 9.5 15 11.5 12 12ZM12 12C11.5 15 9.5 17 12 17C14.5 17 12.5 15 12 12ZM12 12C9 11.5 7 9.5 7 12C7 14.5 9 12.5 12 12ZM12 12C13.8 10.2 15.6 10.2 12 12Z"
              fill="url(#premiumYGBGrad)"
              stroke="white"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="1.8" fill="white" />
          </svg>
        );

      case "🍃": // Leaves
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <path
              d="M11.5 8C8.5 9.5 6.5 13.5 10 16.5C13.5 13.5 13.5 10.5 11.5 8Z"
              fill="url(#premiumYGBGrad)"
              stroke="white"
              strokeWidth="0.8"
            />
            <path d="M11.5 8C10.5 11 9 14 10 16.5" stroke="white" strokeWidth="0.8" />

            <path
              d="M15.5 11.5C13.5 12.5 12 15.5 14.5 17.5C17 15.5 17 13.5 15.5 11.5Z"
              fill="url(#premiumYGBGrad)"
              stroke="white"
              strokeWidth="0.8"
            />
            <path d="M15.5 11.5C14.5 13.5 13.5 15.5 14.5 17.5" stroke="white" strokeWidth="0.8" />
          </svg>
        );

      case "💬": // WeChat / Chat bubble "图1"
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <path
              d="M17.5 7.5C19.9 9.3 21 11.4 21 13.5C21 17.1 16.5 19.5 12 19.5C10.8 19.5 9.6 19.2 8.5 18.6L4.5 19.5C4.1 19.6 3.8 19.2 4.0 18.8L5.1 15.2C4.1 14.0 3.5 12.6 3.5 11C3.5 7.4 8.0 4.5 12.5 4.5C17.0 4.5 20.0 7.0 21 9.5"
              fill="url(#premiumYGBGrad)"
              fillOpacity="0.85"
              stroke="white"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            {/* Highlight for glassy look */}
            <path
              d="M6 10C8 7.5 11 6 14 6"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.75"
            />
          </svg>
        );

      case "💡":
      case "Idea":
      case "Lightbulb":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <path d="M12 2a7 7 0 00-7 7c0 2.5 1.2 4.8 3.2 6.2a2 2 0 01.8 1.6v1.2a1.5 1.5 0 001.5 1.5h3a1.5 1.5 0 001.5-1.5v-1.2a2 2 0 01.8-1.6c2-1.4 3.2-3.7 3.2-6.2a7 7 0 00-7-7z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* Filament wires */}
            <path d="M10 11.5c.5-.8 1-.8 1.5 0s1 .8 1.5 0M9.5 9l2.5-3.5L14.5 9" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            {/* Thread base */}
            <path d="M10 20h4M9.5 18h5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            {/* External rays */}
            <path d="M12 2v-1M4.5 4.5l.7.7M2 12H1M22 12h-1M19.5 4.5l-.7.7" stroke="url(#premiumYGBGrad)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "🖊️":
      case "🖊":
      case "Pen":
      case "Write":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <path d="M18.5 3a2.12 2.12 0 113 3L7.5 20H4.5v-3L18.5 3z" fill="url(#premiumYGBGrad)" fillOpacity="0.25" stroke="white" strokeWidth="0.8" />
            <path d="M16 5.5l2.5 2.5M13.5 8l2.5 2.5" stroke="white" strokeWidth="0.8" />
            <path d="M4.5 17l3 3" stroke="url(#premiumYGBGrad)" strokeWidth="1.2" />
          </svg>
        );

      case "⭐":
      case "⭐️":
      case "Star":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Sparkle lines */}
            <path d="M12 4v2M12 15v2M5 12h2M17 12h2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.8" />
          </svg>
        );

      case "☀️":
      case "Sun":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="5" fill="url(#premiumYGBGrad)" fillOpacity="0.25" stroke="white" strokeWidth="0.8" />
            {/* Sun rays */}
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="url(#premiumYGBGrad)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case "💎":
      case "Diamond":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="url(#premiumYGBGrad)" fillOpacity="0.2" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Diamond cuts */}
            <path d="M2 9h20M6 3l6 6 6-6M9 3l-3 6M15 3l3 6M12 9v12M6 9l6 12 6-12" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
          </svg>
        );

      case "🔔":
      case "Bell":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <path d="M18 15v-4c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v4l-2 2v1h16v-1l-2-2z" fill="url(#premiumYGBGrad)" fillOpacity="0.25" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Clapper */}
            <path d="M12 21.5c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" fill="url(#premiumYGBGrad)" />
            {/* Sound waves on the sides */}
            <path d="M3 11a7 7 0 011-3M20 8a7 7 0 011 3" stroke="url(#premiumYGBGrad)" strokeWidth="1" strokeLinecap="round" fill="none" />
          </svg>
        );

      case "⚠️":
      case "⚠":
      case "Warning":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Exclamation point */}
            <path d="M12 9v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="1" fill="white" />
          </svg>
        );

      case "🎯":
      case "Target":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="0.8" fill="url(#premiumYGBGrad)" fillOpacity="0.2" />
            <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="0.6" fill="url(#premiumYGBGrad)" fillOpacity="0.2" />
            <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="0.6" fill="url(#premiumYGBGrad)" />
            {/* Dart arrow */}
            <path d="M19.5 4.5L12 12M19.5 4.5l-3 .5M19.5 4.5l-.5 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case "🏷️":
      case "🏷":
      case "Tag":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="9.5" fill="url(#premiumYGBGrad)" fillOpacity="0.12" />
            <path d="M20.85 12.15l-8.3-8.3A2 2 0 0011.13 3.3H4.5a1.2 1.2 0 00-1.2 1.2v6.63a2 2 0 00.56 1.42l8.3 8.3a2 2 0 002.83 0l5.86-5.87a2 2 0 000-2.83z" fill="url(#premiumYGBGrad)" fillOpacity="0.2" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Tag hole */}
            <circle cx="7.5" cy="7.5" r="1.2" fill="white" />
            {/* String thread */}
            <path d="M4.5 4.5L2 2" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        );

      case "⚡️":
      case "⚡":
      case "Lightning":
      case "Bolt":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
          </svg>
        );

      case "🎖️":
      case "🎖":
      case "RibbonMedal":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* Ribbon hanger */}
            <path d="M7 3h10v6l-5 3-5-3V3z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            <path d="M10 3v6M14 3v6" stroke="white" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
            {/* Circular Medal pendant */}
            <circle cx="12" cy="15.5" r="4.5" fill="url(#premiumYGBGrad)" fillOpacity="0.95" stroke="white" strokeWidth="0.8" />
            <path d="M12 13.5l.5 1 1 .1-.7.7.2 1-.9-.5-.9.5.2-1-.7-.7 1-.1z" fill="white" />
          </svg>
        );

      case "📊":
      case "BarChart":
      case "Chart":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <rect x="4.5" y="13.5" width="3.5" height="6" rx="1" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            <rect x="10.25" y="8.5" width="3.5" height="11" rx="1" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            <rect x="16" y="4.5" width="3.5" height="15" rx="1" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* Base line */}
            <path d="M3 19.5h18" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "🏅":
      case "Medal":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* sash hanger */}
            <path d="M12 2l-3.5 6h7L12 2z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            <circle cx="12" cy="13.5" r="5.5" fill="url(#premiumYGBGrad)" fillOpacity="0.95" stroke="white" strokeWidth="0.8" />
            <text x="12" y="15.5" fill="white" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">1</text>
          </svg>
        );

      case "⏰":
      case "AlarmClock":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="13" r="6.5" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* Bells */}
            <path d="M5 6.5C5.5 5 7 4.5 8 5M19 6.5c-.5-1.5-2-2-3-1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            {/* Hands */}
            <path d="M12 9.5V13h3" stroke="white" strokeWidth="1" strokeLinecap="round" />
            {/* Legs */}
            <path d="M7.5 19l-1.5 1.5M16.5 19l1.5 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case "🧠":
      case "脑":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* Elegant glass brain outline hemispheres */}
            <path d="M12 18.5c-3.5 0-5.5-2-5.5-5a4 4 0 011-2.5 3 3 0 010-4c1.5-1.5 3.5-1 4.5 0a3.5 3.5 0 011.5-.5M12 18.5c3.5 0 5.5-2 5.5-5a4 4 0 00-1-2.5 3 3 0 000-4c-1.5-1.5-3.5-1-4.5 0a3.5 3.5 0 00-1.5-.5" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* Inside fold patterns */}
            <path d="M9.5 10c.5-.5.5-1.5 0-2M14.5 10c-.5-.5-.5-1.5 0-2M8 13.5a1.5 1.5 0 010-2M16 13.5a1.5 1.5 0 000-2" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M12 6.5v11" stroke="white" strokeWidth="0.6" strokeLinecap="round" strokeOpacity="0.7" />
          </svg>
        );

      case "🫁":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* Left lung */}
            <path d="M11 6.5c-2-1-5 1.5-5 5.5s2 5 4.5 3.8V6.5z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* Right lung */}
            <path d="M13 6.5c2-1 5 1.5 5 5.5s-2 5-4.5 3.8V6.5z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* Wind pipe */}
            <path d="M12 3.5v3" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "📜":
      case "Scroll":
      case "Paper":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <path d="M15.5 3h-8a2.5 2.5 0 00-2.5 2.5V18a2.5 2.5 0 002.5 2.5h8.5c1.5 0 2.5-.8 2.5-2V5c0-1.2-1-2-3-2z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Scroll roll details */}
            <path d="M5 18a2.5 2.5 0 002.5 2.5M15.5 3c-.5.5-.5 1.5 0 2" stroke="white" strokeWidth="0.8" />
            <line x1="8" y1="8.5" x2="14" y2="8.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="8" y1="12.5" x2="15" y2="12.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="8" y1="16.5" x2="13" y2="16.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "📈":
      case "LineChart":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* Ascending curve line */}
            <path d="M5.5 16.5l3.5-3.5 3.5 1.5 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Upward arrowhead */}
            <path d="M14.5 8.5H18.5V12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Axis base */}
            <path d="M3.5 19.5h16.5M4.5 3.5v16" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        );

      case "🗓️":
      case "🗓":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <rect x="4" y="5.5" width="16" height="15" rx="3" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            <line x1="4" y1="10.5" x2="20" y2="10.5" stroke="white" strokeWidth="0.8" />
            {/* Binder loops */}
            <rect x="7" y="3" width="1.8" height="4.5" rx="0.9" fill="white" />
            <rect x="15" y="3" width="1.8" height="4.5" rx="0.9" fill="white" />
            {/* Grid dots */}
            <circle cx="8" cy="13.5" r="1" fill="white" />
            <circle cx="12" cy="13.5" r="1" fill="white" />
            <circle cx="16" cy="13.5" r="1" fill="white" />
            <circle cx="8" cy="17" r="1" fill="white" />
            <circle cx="12" cy="17" r="1" fill="white" />
            <circle cx="16" cy="17" r="1" fill="white" />
          </svg>
        );

      case "🪵":
      case "Log":
      case "Wood":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* Slanted cylindrical wood trunk log */}
            <ellipse cx="12" cy="8" rx="6" ry="3" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            <path d="M6 8v8c0 1.6 2.7 3 6 3s6-1.4 6-3V8" fill="url(#premiumYGBGrad)" fillOpacity="0.75" stroke="white" strokeWidth="0.8" />
            {/* Tree age rings */}
            <ellipse cx="12" cy="8" rx="4" ry="2" stroke="white" strokeWidth="0.5" fill="none" />
            <ellipse cx="12" cy="8" rx="2" ry="1" stroke="white" strokeWidth="0.5" fill="none" />
            <path d="M12 8l3 1M6 12c1 .5 3 .8 6 .8" stroke="white" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          </svg>
        );

      case "🔍":
      case "Search":
      case "Magnifier":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* Magnifying lens */}
            <circle cx="10" cy="10" r="5.5" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* Glass reflection highlight */}
            <path d="M7 7.5a3 3 0 013-3" stroke="white" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.8" />
            {/* Handle */}
            <line x1="14" y1="14" x2="20" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="15" y1="15" x2="19" y2="19" stroke="url(#premiumYGBGrad)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "🏆":
      case "Trophy":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* Main chalice bowl */}
            <path d="M6 4.5h12v6c0 3.3-2.7 6-6 6s-6-2.7-6-6v-6z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Side handles */}
            <path d="M6 7H3.5a1.5 1.5 0 00-1.5 1.5V10A2.5 2.5 0 004.5 12.5h1.5M18 7h2.5A1.5 1.5 0 0122 8.5V10a2.5 2.5 0 01-2.5 2.5H18" stroke="white" strokeWidth="0.8" fill="none" />
            {/* Stand and base */}
            <path d="M12 16.5v2.5M8 19.5h8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="7" y="19" width="10" height="1.5" rx="0.5" fill="url(#premiumYGBGrad)" />
          </svg>
        );

      case "🚀":
      case "Rocket":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* Rocket fuselage */}
            <path d="M18.5 5.5s-4-1-8 3-4 8.5-4 8.5 4.5 0 8.5-4 3.5-7.5 3.5-7.5z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Rocket circular window */}
            <circle cx="12.5" cy="11.5" r="1.5" fill="white" />
            {/* Wings and fins */}
            <path d="M6.5 17l-2.5 2 .5-3L6.5 17zm7.5-11.5l2.5-2-.5 3-2-1z" fill="url(#premiumYGBGrad)" stroke="white" strokeWidth="0.6" />
            {/* Fire blast */}
            <path d="M5.5 17c-.5.5-1.5 0-2-1s-1.5-1.5-1-2c.5-.5 1.5.5 2 1s1.5 1.5 1 2z" fill="#F59E0B" fillOpacity="0.8" />
          </svg>
        );

      case "📋":
      case "Clipboard":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <rect x="5.5" y="5.5" width="13" height="15" rx="2" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* Header metal clip */}
            <path d="M9 3.5h6a1.5 1.5 0 011.5 1.5V6H7.5V5a1.5 1.5 0 011.5-1.5z" fill="white" fillOpacity="0.9" />
            {/* Sheet lines */}
            <line x1="8.5" y1="10.5" x2="15.5" y2="10.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="8.5" y1="13.5" x2="15.5" y2="13.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="8.5" y1="16.5" x2="13.5" y2="16.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "🍀":
      case "☘️":
      case "☘":
      case "Clover":
        return (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-full p-0.5"
          >
            {gradientDef}
            <path 
              d="M12 12c.5-2.2 2.2-3.5 3.5-2.5s1 2.8-1 3.5-2.2-1-2.5-1zM12 12c-2.2-.5-3.5-2.2-2.5-3.5s2.8-1 3.5 1-1 2.2-1 2.5zM12 12c-.5 2.2-2.2 3.5-3.5 2.5s-1-2.8 1-3.5 2.2 1 2.5 1zM12 12c2.2.5 3.5 2.2 2.5 3.5s-2.8 1-3.5-1 1-2.2 1-2.5z" 
              fill="url(#premiumYGBGrad)" 
              fillOpacity="0.85" 
              stroke="white" 
              strokeWidth="0.8" 
              strokeLinejoin="round" 
            />
            {/* stem */}
            <path d="M12 12c.5 3 2 4.5 3 5" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        );

      case "🧭":
      case "Compass":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <circle cx="12" cy="12" r="8.5" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* compass ticks */}
            <path d="M12 4v1.5M12 18.5v1.5M4 12h1.5M18.5 12H20" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
            {/* Needle */}
            <path d="M12 12l2-4-2-2-2 2 2 4zm0 0l-2 4 2 2 2-2-2-4z" fill="url(#premiumYGBGrad)" stroke="white" strokeWidth="0.6" />
            <circle cx="12" cy="12" r="1" fill="white" />
          </svg>
        );

      case "🛡️":
      case "🛡":
      case "Shield":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <path d="M12 2.5s5.5 1.5 5.5 5.5v5c0 4-5.5 7.5-5.5 7.5S6.5 17 6.5 13V8c0-4 5.5-5.5 5.5-5.5z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Inner diagonal cross light reflect */}
            <path d="M12 3.5V19M7.5 8.5c2.5 1 6.5 1 9 0" stroke="white" strokeWidth="0.6" strokeOpacity="0.6" />
          </svg>
        );

      case "🚨":
      case "Siren":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            {/* siren stand */}
            <path d="M5 19.5h14v-2H5v2z" fill="url(#premiumYGBGrad)" stroke="white" strokeWidth="0.8" />
            {/* rotating flasher bulb */}
            <path d="M6 17.5a6 6 0 0112 0H6z" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* warning beam lines */}
            <path d="M12 11V5M7.5 10L3.5 7M16.5 10l4-3" stroke="url(#premiumYGBGrad)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case "✨":
      case "Sparkles":
        return (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-full p-0.5"
          >
            {gradientDef}
            {/* Main center starburst */}
            <path d="M12 4c0 3.5 1.5 5 5 5-3.5 0-5 1.5-5 5 0-3.5-1.5-5-5-5 3.5 0 5-1.5 5-5z" fill="url(#premiumYGBGrad)" stroke="white" strokeWidth="0.6" />
            {/* Top right secondary sparkle */}
            <path d="M19 6c0 1.5.8 2.2 2.2 2.2-1.4 0-2.2.7-2.2 2.2 0-1.5-.8-2.2-2.2-2.2 1.4 0 2.2-.7 2.2-2.2z" fill="white" />
            {/* Bottom left small sparkle */}
            <path d="M6 15c0 1.2.6 1.8 1.8 1.8-1.2 0-1.8.6-1.8 1.8 0-1.2-.6-1.8-1.8-1.8 1.2 0 1.8-.6 1.8-1.8z" fill="white" />
          </svg>
        );

      case "🖼️":
      case "🖼":
      case "Picture":
      case "Card":
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5">
            {gradientDef}
            <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" fill="url(#premiumYGBGrad)" fillOpacity="0.85" stroke="white" strokeWidth="0.8" />
            {/* mountain landscape peaks */}
            <path d="M5 18.5l4.5-5.5 3.5 3 4.5-6.5 3.5 5.5v2H5v-4z" fill="url(#premiumYGBGrad)" fillOpacity="0.95" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            {/* sun */}
            <circle cx="15.5" cy="8.5" r="2.2" fill="white" />
          </svg>
        );

      default:
        // Attempt to render standard fallback for general emojis to prevent text rendering
        // If it's a known smiley/face emoji, redirect to custom glass face svg!
        const emotionMap: Record<string, string> = {
          "🙁": "🙁", "😟": "😟", "😰": "😰", "😊": "😊", "😇": "😇", "🤩": "🤩", "🙂": "🙂", "😐": "😐", "😡": "😡", "😫": "😫", "😣": "😣"
        };
        if (emotionMap[cleanEmoji]) {
          // If fallback is matched, we can self-recurse with standard key
          return null; // Handled outside or we can code-embed directly
        }
        return (
          <span className="w-full h-full flex items-center justify-center text-sm font-bold">{cleanEmoji}</span>
        );
    }
  };

  // Safe wrapper for recursed smiley rendering
  const renderIconSvgWithFallback = () => {
    const rawSvg = renderIconSvg();
    if (rawSvg === null) {
      // Direct render for recurse smileys to bypass switch returning null
      const gradientDef = (
        <defs>
          <linearGradient id="emotionHappyGrad" x1="10%" y1="10%" x2="90%" y2="90%"><stop offset="0%" stopColor="#FFE259" /><stop offset="100%" stopColor="#FFA751" /></linearGradient>
          <linearGradient id="emotionCalmGrad" x1="10%" y1="10%" x2="90%" y2="90%"><stop offset="0%" stopColor="#C0E890" /><stop offset="100%" stopColor="#34D399" /></linearGradient>
          <linearGradient id="emotionNeutralGrad" x1="10%" y1="10%" x2="90%" y2="90%"><stop offset="0%" stopColor="#FFF9B1" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient>
          <linearGradient id="emotionAnxiousGrad" x1="10%" y1="10%" x2="90%" y2="90%"><stop offset="0%" stopColor="#A5B4FC" /><stop offset="100%" stopColor="#6366F1" /></linearGradient>
          <linearGradient id="emotionAngryGrad" x1="10%" y1="10%" x2="90%" y2="90%"><stop offset="0%" stopColor="#FCA5A5" /><stop offset="100%" stopColor="#EF4444" /></linearGradient>
        </defs>
      );
      // Map basic emotions to rendering
      if (cleanEmoji === "🙂") {
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionNeutralGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.85" />
            <circle cx="9.2" cy="10" r="1" fill="#78350F" />
            <circle cx="14.8" cy="10" r="1" fill="#78350F" />
            <path d="M9 13.5a3 3 0 006 0" stroke="#78350F" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          </svg>
        );
      }
      if (cleanEmoji === "😐") {
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionNeutralGrad)" stroke="white" strokeWidth="0.8" fillOpacity="0.75" />
            <circle cx="9.2" cy="10" r="1" fill="#78350F" />
            <circle cx="14.8" cy="10" r="1" fill="#78350F" />
            <path d="M8.5 14h7" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      }
      if (cleanEmoji === "😡" || cleanEmoji === "😣") {
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionAngryGrad)" stroke="white" strokeWidth="0.8" />
            <circle cx="9.2" cy="11.2" r="1" fill="#450A0A" />
            <circle cx="14.8" cy="11.2" r="1" fill="#450A0A" />
            <path d="M7.5 9l2.2 1.2M16.5 9l-2.2 1.2" stroke="#450A0A" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M9 15.5a3 3 0 016 0" stroke="#450A0A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        );
      }
      if (cleanEmoji === "🙁" || cleanEmoji === "😟") {
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionAnxiousGrad)" stroke="white" strokeWidth="0.8" />
            <circle cx="9.2" cy="10" r="1" fill="#1E1B4B" />
            <circle cx="14.8" cy="10" r="1" fill="#1E1B4B" />
            <path d="M7.5 8.5c1-.5 1.8 0 1.8 0M16.5 8.5c-1-.5-1.8 0-1.8 0" stroke="#1E1B4B" strokeWidth="1" strokeLinecap="round" />
            <path d="M9 15a3 3 0 016 0" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        );
      }
      if (cleanEmoji === "😫") {
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            {gradientDef}
            <circle cx="12" cy="12" r="9" fill="url(#emotionAngryGrad)" stroke="white" strokeWidth="0.8" />
            <path d="M7.5 9.5l1.5 1.5-1.5 1.5M16.5 9.5l-1.5 1.5 1.5 1.5" stroke="#450A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M9 13.5c0 .8-.5 1.5-.5 1.5s-.5-.7-.5-1.5.5-1.5.5-1.5.5.7.5 1.5zm6 0c0 .8-.5 1.5-.5 1.5s-.5-.7-.5-1.5.5-1.5.5-1.5.5.7.5 1.5z" fill="#93C5FD" />
            <path d="M9.5 15.5c0-1.5 1.2-2.5 2.5-2.5s2.5 1 2.5 2.5H9.5z" fill="#450A0A" />
          </svg>
        );
      }
      return <span className="w-full h-full flex items-center justify-center text-sm font-bold">{cleanEmoji}</span>;
    }
    return rawSvg;
  };

  // Render clean vector icon without the frosted glass box container
  return (
    <div
      id={`glass-icon-${cleanEmoji}`}
      className={`
        relative overflow-visible shrink-0 select-none
        transition-all duration-300 ease-out hover:scale-[1.08]
        flex items-center justify-center
        ${sizeClasses}
        ${className}
      `}
    >
      {renderIconSvgWithFallback()}
    </div>
  );
}
