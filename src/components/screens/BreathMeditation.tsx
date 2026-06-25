import React, { useState, useEffect, useRef } from "react";
import { Wind, Play, Pause, ChevronLeft, Sparkles, Volume2, VolumeX, HardDrive } from "lucide-react";
import GlassIcon from "../GlassIcon";

interface BreathMeditationProps {
  onClose: () => void;
}

export default function BreathMeditation({ onClose }: BreathMeditationProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeLeft, setTimeLeft] = useState(240); // 4:00 minutes
  const [breathPhase, setBreathPhase] = useState<"吸气" | "憋气" | "呼气">("吸气");
  const [breathSeconds, setBreathSeconds] = useState(4); // 4-second cycles
  const [inhaleCount, setInhaleCount] = useState(0);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5); // Default volume 50%
  const [selectedAudio, setSelectedAudio] = useState("white_noise"); // Default to white noise
  const audioRef = useRef<HTMLAudioElement>(null);

  const audioOptions = [
    { label: "无", value: "none" },
    { label: "白噪音", value: "white_noise", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { label: "森林雨声", value: "forest_rain", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  ];

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });

      setBreathSeconds((prevSec) => {
        if (prevSec <= 1) {
          // Toggle phase
          setBreathPhase((prevPhase) => {
            if (prevPhase === "吸气") {
              return "憋气";
            } else if (prevPhase === "憋气") {
              return "呼气";
            } else {
              setInhaleCount(prev => prev + 1);
              return "吸气";
            }
          });
          return 4; // Reset to 4s
        }
        return prevSec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isAudioPlaying && selectedAudio !== "none") {
        audioRef.current.volume = audioVolume;
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isAudioPlaying, audioVolume, selectedAudio]);

  // Format time
  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Breathing circle scale style
  const getCircleScale = () => {
    if (!isPlaying) return "scale-100";
    if (breathPhase === "吸气") {
      // expand from 85% to 125%
      return "scale-[1.25] duration-[4000ms] ease-out bg-sky-200/60";
    }
    if (breathPhase === "憋气") {
      return "scale-[1.25] duration-[4000ms] bg-indigo-200/60";
    }
    // contract to 85%
    return "scale-[0.85] duration-[4000ms] ease-in bg-emerald-200/60";
  };

  return (
    <div className="absolute inset-0 bg-transparent z-50 flex flex-col h-full overflow-hidden select-none">
      
      {/* 1. Header Navigation */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-white/20 bg-white/45 backdrop-blur-md">
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-stone-100/50 text-[#1E3F39] active:scale-90"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-black text-[#1E3F39] tracking-wider font-display">呼吸练习 · Breathing</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <GlassIcon emoji="🍃" size="xs" />
        </div>
      </header>

      {/* 2. Audio/Guidance banner */}
      <div className="m-5 bg-gradient-to-tr from-[#E0F0F8]/30 to-[#C0E890]/20 p-4 rounded-3xl border border-stone-200/20 text-center">
        <span className="text-[10px] font-extrabold text-[#5E7F73] uppercase tracking-wider block font-mono">Ocean Wave Bio-Feedback</span>
        <p className="text-[11px] text-stone-600 font-medium leading-relaxed mt-1">
          配合海水潮汐律动慢呼吸，排出胸腹浊气与防卫急躁。
        </p>
      </div>

      {/* 3. Central Breathing Animation Sphere */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-6">
        
        {/* Breathing guide text background */}
        <div className="text-center absolute top-12 z-10 pointer-events-none">
          <span className="text-[10px] bg-white/80 border border-stone-200/45 px-3 py-1 rounded-full text-stone-500 font-bold tracking-wide">
            已呼气循环 {inhaleCount} 次
          </span>
        </div>

        {/* Pulsing ring outer container */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          
          {/* Animated Halo Rings */}
          <div className={`absolute inset-0 rounded-full border border-blue-300/35 transition-all duration-[4000ms] ${isPlaying ? "scale-110 opacity-70 animate-pulse-gently" : "scale-100 opacity-40"}`} />
          <div className={`absolute inset-4 rounded-full border border-indigo-300/45 transition-all duration-[4000ms] ${isPlaying ? "scale-[1.18] opacity-50" : "scale-100 opacity-30"}`} />
          
          {/* Main Breathing Core Orb */}
          <div 
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-md transition-all z-10 ${getCircleScale()}`}
          >
            {/* Center action visual */}
            <Wind className="w-8 h-8 text-[#1E3F39]/70 animate-bounce" />
            <span className="text-lg font-black text-[#1E3F39] mt-2 tracking-widest animate-pulse">
              {isPlaying ? breathPhase : "已暂停"}
            </span>
            <span className="text-[10px] text-[#1E3F39]/60 font-semibold font-mono mt-1">
              {isPlaying ? `${breathSeconds}s` : "点击播放开始"}
            </span>
          </div>

          {/* Subtitle feedback helper */}
          <div className="absolute -bottom-10 left-0 right-0 text-center">
            <span className="text-xs font-black text-[#1E3F39] tracking-wider uppercase font-mono">
              {breathPhase === "吸气" && "吸气 · 肺部扩张 · 潮水上涨"}
              {breathPhase === "憋气" && "平静 · 感受停留 · 阳光普照"}
              {breathPhase === "呼气" && "呼气 · 全身放松 · 潮水退落"}
            </span>
          </div>
        </div>

        {/* 4:00 countdown timer display */}
        <div className="mt-20 text-center">
          <span className="text-4xl font-mono font-black italic tracking-tight text-stone-700 block">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[10px] text-stone-400 font-bold mt-1 block">剩余练习时长</span>
        </div>

      </div>

      {/* 4. Footer Control buttons */}
      <footer className="p-6 bg-white border-t border-stone-100 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => {
            setTimeLeft(240);
            setIsPlaying(true);
            setBreathPhase("吸气");
            setBreathSeconds(4);
            setInhaleCount(0);
          }}
          className="text-xs font-bold text-stone-500 hover:text-stone-700 bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-full px-5 py-2.5 active:scale-95"
        >
          重置练习
        </button>

        {/* Audio Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setIsAudioPlaying(!isAudioPlaying)}
            className={`p-2 rounded-full transition-colors ${
              isAudioPlaying ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <select
            value={selectedAudio}
            onChange={(e) => setSelectedAudio(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-full px-2 py-1 flex-shrink-0"
          >
            {audioOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audioVolume}
            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
            className="w-20 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 flex-shrink-0"
          />
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform ${
            isPlaying
              ? "bg-[#5E7F73] hover:bg-[#1E3F39]"
              : "bg-[#C0E890] hover:bg-[#5E7F73] text-[#1E3F39]"
          }`}
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
        </button>

        <button
          onClick={onClose}
          className="text-xs font-bold text-stone-500 hover:text-stone-700 bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-full px-5 py-2.5 active:scale-95"
        >
          结束并返回
        </button>
      </footer>

      {/* Background Audio Player */}
      {selectedAudio !== "none" && (
        <audio ref={audioRef} loop src={audioOptions.find(opt => opt.value === selectedAudio)?.src} />
      )}

    </div>
  );
}
