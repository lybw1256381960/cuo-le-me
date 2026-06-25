import React, { useState, useEffect } from "react";
import { Wifi, Battery, Signal } from "lucide-react";

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strHours = hours < 10 ? `0${hours}` : hours;
      const strMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setTime(`${strHours}:${strMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="mobile-frame-wrapper" className="flex items-center justify-center bg-transparent py-4">
      {/* Phone Body Shell Container - strictly fixed size on all views */}
      <div 
        id="smartphone-chassis" 
        className="relative shrink-0 rounded-[48px] shadow-[0_25px_60px_-15px_rgba(30,63,57,0.15)] border-[12px] border-neutral-800 overflow-hidden flex flex-col font-sans"
        style={{
          width: "390px",
          height: "844px",
          minWidth: "390px",
          minHeight: "844px",
          maxWidth: "390px",
          maxHeight: "844px"
        }}
      >
        {/* Dynamic Island / Earpiece Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-[22px] bg-neutral-800 rounded-full z-50 flex items-center justify-center">
          <div className="w-3 h-3 bg-neutral-900 rounded-full ml-1"></div>
          <div className="w-14 h-1 bg-neutral-950 rounded-full ml-auto mr-4"></div>
        </div>

        {/* Status Bar */}
        <div 
          id="smartphone-status-bar" 
          className="h-11 pt-2 px-6 flex items-center justify-between text-neutral-800 text-xs font-semibold z-45 select-none"
        >
          {/* Left Side: Time */}
          <div className="flex items-center pl-1 font-display tracking-wide">{time}</div>
          
          {/* Right Side: Cellular, Wifi, Battery Status */}
          <div className="flex items-center gap-1.5 pr-1">
            <Signal className="w-3.5 h-3.5 text-neutral-800 fill-neutral-800" />
            <Wifi className="w-3.5 h-3.5 text-neutral-800" />
            <span className="text-[10px] mr-0.5">WiFi</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-normal">85%</span>
              <Battery className="w-4 h-4 text-neutral-800 fill-neutral-800" />
            </div>
          </div>
        </div>

        {/* Screen Client Area with safe-scroll overlay */}
        <div 
          id="smartphone-screen-body" 
          className="flex-1 flex flex-col overflow-y-auto relative p-0 bg-[#FFFDF2] no-scrollbar"
        >
          {children}
        </div>

        {/* Home Swipe Indicator bar */}
        <div className="absolute b-1.5 left-1/2 -translate-x-1/2 w-32 h-[4px] bg-neutral-700/60 rounded-full z-50 bottom-1"></div>
      </div>
    </div>
  );
}
