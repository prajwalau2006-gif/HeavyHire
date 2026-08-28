import React, { useState, useEffect } from "react";
import { Wifi, Signal, Battery, ChevronLeft, Circle, Square } from "lucide-react";

interface AndroidFrameProps {
  children: React.ReactNode;
  isDark: boolean;
  enabled: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isDark,
  enabled,
}) => {
  const [timeStr, setTimeStr] = useState("09:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!enabled) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="flex items-center justify-center p-2 sm:p-6 w-full">
      <div
        id="android-device-frame"
        className={`w-full max-w-[430px] rounded-[48px] border-[10px] shadow-2xl overflow-hidden transition-all duration-300 relative flex flex-col ${
          isDark
            ? "border-slate-800 bg-slate-950 shadow-amber-500/5 ring-1 ring-slate-700"
            : "border-slate-800 bg-slate-900 shadow-slate-400/20 ring-1 ring-slate-300"
        }`}
        style={{ minHeight: "860px" }}
      >
        {/* Top Camera Punch Hole & Status Bar */}
        <div
          id="android-status-bar"
          className="h-10 px-6 flex items-center justify-between text-white text-[11px] font-semibold select-none bg-slate-950 z-30 shrink-0"
        >
          <span>{timeStr}</span>

          {/* Camera Notch */}
          <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>

          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span>98%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Screen Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          {children}
        </div>

        {/* Bottom Android Gesture Bar / System Navigation */}
        <div
          id="android-nav-bar"
          className="h-9 flex items-center justify-center select-none bg-slate-950 shrink-0"
        >
          <div className="w-32 h-1 rounded-full bg-slate-600/80" />
        </div>
      </div>
    </div>
  );
};
