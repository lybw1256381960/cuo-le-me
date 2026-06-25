import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MessageSquare, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import AppLogo from "../AppLogo";
import GlassIcon from "../GlassIcon";

interface WelcomeScreenProps {
  onLoginSuccess: (method: "wechat" | "guest") => void;
}

export default function WelcomeScreen({ onLoginSuccess }: WelcomeScreenProps) {
  // "splash" -> logo/slogan only (first 2 seconds)
  // "login" -> reveal the buttons smoothly
  const [phase, setPhase] = useState<"splash" | "login">("splash");
  const [loadingMethod, setLoadingMethod] = useState<"wechat" | "guest" | null>(null);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Wait 2.2 seconds then automatically slide/fade into login stage
    const timer = setTimeout(() => {
      setPhase("login");
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (method: "wechat" | "guest") => {
    setLoadingMethod(method);
    setTimeout(() => {
      onLoginSuccess(method);
    }, 1200); // 1.2s realistic sweet login transition
  };

  const handleAccountLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.trim() || !password.trim()) {
      setLoginError("请输入账号和密码");
      return;
    }
    setLoginError("");
    setLoadingMethod("guest");
    setTimeout(() => {
      onLoginSuccess("guest");
    }, 1200);
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-[#EBF7EE] overflow-hidden flex flex-col justify-between p-5 select-none relative">
      
      {/* 1. True 1:1 High-Fidelity Diffuse Mesh Gradient Background */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000" 
        style={{
          background: `
            radial-gradient(circle at 85% 12%, rgba(251, 255, 80, 0.85) 0%, rgba(251, 255, 80, 0) 55%),
            radial-gradient(circle at 15% 42%, rgba(142, 255, 108, 0.75) 0%, rgba(142, 255, 108, 0) 65%),
            radial-gradient(circle at 65% 88%, rgba(45, 230, 217, 0.75) 0%, rgba(45, 230, 217, 0) 55%),
            radial-gradient(circle at 50% 50%, rgba(245, 253, 248, 0.95) 0%, rgba(245, 253, 248, 0.4) 100%)
          `
        }} 
      />

      {/* Modern gradient overlay / gradient mask for beautiful soft ambient blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient-mask pointer-events-none opacity-85" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(235, 247, 238, 0.35) 100%)"
      }} />

      {/* Multi-layered dynamic fluid neon spheres with floating keyframe feel */}
      <div className="absolute top-[-5%] right-[-14%] w-96 h-96 rounded-full bg-[#FBFF36]/40 opacity-50 blur-[90px] pointer-events-none animate-pulse-gently" />
      <div className="absolute top-[30%] left-[-20%] w-96 h-96 rounded-full bg-[#8EFF67]/35 blur-[100px] pointer-events-none" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#1FF0FF]/45 opacity-45 blur-[80px] pointer-events-none" style={{ animationDelay: "3s" }} />

      {/* Decorative center radiant glow for the transparent logo */}
      <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/25 blur-3xl pointer-events-none" />

      {/* Centered container packaging Logo, Title, and Credentials Form for visual stability */}
      <div className={`flex-1 flex flex-col items-center relative z-10 w-full max-w-[342px] mx-auto h-full px-4 select-none ${
        phase === "splash" ? "justify-center -mt-12" : "justify-center space-y-4 pt-6 pb-12"
      }`}>
        
        {/* Top Segment: Logo & Title (App logo with title is slightly above center) */}
        <motion.div 
          className="flex flex-col items-center text-center"
          layout
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          initial={{ opacity: 0, scale: 0.75, y: -25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          {/* Logo with micro-scaling auto-floating animation during loading state */}
          <motion.div
            animate={phase === "splash" ? {
              y: [0, -6, 0],
              scale: [1, 1.02, 1],
            } : {
              y: 0,
              scale: 1,
            }}
            transition={phase === "splash" ? {
              y: {
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              },
              scale: {
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              }
            } : {
              type: "spring",
              stiffness: 160,
              damping: 22,
            }}
          >
            <AppLogo size={phase === "login" ? "lg" : "xl"} showText={true} />
          </motion.div>
          
          {phase !== "login" && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.95, y: 0 }}
              className="text-stone-600 text-xs font-semibold tracking-wide text-center max-w-[260px] mt-4"
            >
              人生没有后悔药，但可以有错题本
            </motion.p>
          )}
        </motion.div>

        {/* Middle Segment: Credentials Form placed right at the screen visual center (重心) */}
        {phase === "login" && (
          <motion.div 
            id="login-credentials-container"
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.1 }}
            className="w-full py-2 space-y-3.5"
            layout
          >
            
            {/* Account & Password Credentials Premium Frosted Glass Card */}
            <form 
              onSubmit={handleAccountLogin} 
              className="clm-card space-y-3.5 bg-white/55 backdrop-blur-[24px] p-5.5 rounded-[28px] border border-white/70 shadow-[0_15px_40px_rgba(26,54,49,0.06),inset_0_1px_3px_rgba(255,255,255,0.8)]"
            >
              {loginError && (
                <div className="text-[10px] text-rose-600 bg-rose-50/80 px-3 py-1.5 rounded-xl border border-rose-100 flex items-center gap-1.5 font-bold animate-shake">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{loginError}</span>
                </div>
              )}
              
              {/* Account Input with focused micro-scaling breathing effect */}
              <div className="relative login-input-focus rounded-2xl bg-white/90 border border-stone-200/50 flex items-center">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                  <GlassIcon emoji="👤" size="xs" />
                </span>
                <input
                  type="text"
                  placeholder="账号 / 手机号 / 邮箱"
                  value={account}
                  onChange={(e) => {
                    setAccount(e.target.value);
                    if (loginError) setLoginError("");
                  }}
                  className="w-full pl-10 pr-3.5 h-10 bg-transparent text-[12px] font-semibold text-[#1E3F39] outline-none border-none shadow-none placeholder:text-stone-400"
                />
              </div>

              {/* Password Input with focused micro-scaling breathing effect */}
              <div className="relative login-input-focus rounded-2xl bg-white/90 border border-stone-200/50 flex items-center">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                  <GlassIcon emoji="🔑" size="xs" />
                </span>
                <input
                  type="password"
                  placeholder="请输入您的登录密码"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError("");
                  }}
                  className="w-full pl-10 pr-3.5 h-10 bg-transparent text-[12px] font-semibold text-[#1E3F39] outline-none border-none shadow-none placeholder:text-stone-400"
                />
              </div>

              {/* Account Submit Button with scale feedback and smooth shadow-diffusion feedback */}
              <motion.button
                type="submit"
                disabled={loadingMethod !== null}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 14px 34px -4px rgba(65, 107, 97, 0.45)"
                }}
                whileTap={{ 
                  scale: 0.94,
                  boxShadow: "0 2px 6px rgba(65, 107, 97, 0.15)"
                }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 10
                }}
                className="w-full h-10 rounded-2xl bg-gradient-to-r from-[#5E7F73] to-[#416B61] text-white hover:brightness-[1.03] transition-all duration-350 font-bold text-[12px] flex items-center justify-center cursor-pointer shimmer-btn"
              >
                {loadingMethod === "guest" ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                    <span>验证中...</span>
                  </div>
                ) : (
                  <span className="tracking-widest">登录 / 注册</span>
                )}
              </motion.button>
            </form>

            {/* Alternating Quick Entrances */}
            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                type="button"
                onClick={() => handleLogin("wechat")}
                disabled={loadingMethod !== null}
                whileHover={{ 
                  scale: 1.025,
                  boxShadow: "0 10px 22px rgba(16, 185, 129, 0.22)"
                }}
                whileTap={{ 
                  scale: 0.94,
                  boxShadow: "0 2px 4px rgba(16, 185, 129, 0.05)"
                }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 10
                }}
                className="h-10 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-800 text-[11px] font-bold border border-emerald-500/20 shadow-xs flex items-center justify-center gap-1.5 tracking-wider transition-all cursor-pointer shimmer-btn"
               >
                <GlassIcon emoji="💬" size="xs" />
                微信登录
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleLogin("guest")}
                disabled={loadingMethod !== null}
                whileHover={{ 
                  scale: 1.025,
                  boxShadow: "0 10px 22px rgba(30, 63, 57, 0.14)"
                }}
                whileTap={{ 
                  scale: 0.94,
                  boxShadow: "0 2px 4px rgba(30, 63, 57, 0.02)"
                }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 10
                }}
                className="h-10 rounded-2xl bg-[#FFFDF2]/90 border border-stone-200/40 text-[11px] font-bold text-stone-600 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shimmer-btn"
              >
                <GlassIcon emoji="👤" size="xs" /> 游客体验
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Bottom Segment: Disclosures absolute-positioned nicely at the bottom rim */}
        {phase === "login" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-4 left-0 right-0 flex flex-col items-center space-y-1 text-center text-[10px] select-none text-stone-500/80 font-bold"
          >
            <div className="flex items-center gap-1">
              <GlassIcon emoji="🔒" size="xs" />
              <span>默认仅自己可见，隐私加密级防护</span>
            </div>
            <div className="text-[#2F4D46]/90 text-[11px] font-extrabold tracking-wider mt-0.5 font-display">
              用 AI 在和解中把错误转为资产
            </div>
          </motion.div>
        )}

      </div>

    </div>
  );
}
