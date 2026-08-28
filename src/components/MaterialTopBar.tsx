import React, { useState } from "react";
import {
  UserRole,
  LanguageCode,
} from "../types";
import { translations } from "../translations";
import {
  HardHat,
  Tractor,
  ShieldCheck,
  Languages,
  Moon,
  Sun,
  Bell,
  Smartphone,
  Maximize2,
  Mic,
  Code2,
  CheckCircle2,
  MapPin,
} from "lucide-react";

interface MaterialTopBarProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (mobile: boolean) => void;
  onOpenVoiceBooking: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notificationsCount: number;
}

export const MaterialTopBar: React.FC<MaterialTopBarProps> = ({
  role,
  setRole,
  language,
  setLanguage,
  isDark,
  setIsDark,
  isMobileFrame,
  setIsMobileFrame,
  onOpenVoiceBooking,
  activeTab,
  setActiveTab,
  notificationsCount,
}) => {
  const t = translations[language];
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsList = [
    {
      id: 1,
      title: language === "kn" ? "ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಅಪ್‌ಡೇಟ್" : language === "hi" ? "लाइव ट्रैकिंग अपडेट" : "Live Dispatch Update",
      desc: language === "kn" ? "ಹಿಟಾಚಿ ಎಕ್ಸ್‌ಕವೇಟರ್ ಸೈಟ್‌ಗೆ 24 ನಿಮಿಷಗಳಲ್ಲಿ ತಲುಪಲಿದೆ." : language === "hi" ? "टाटा हिताची एक्सकेवेटर 24 मिनट में पहुंचेगा।" : "Tata Hitachi 220LC is 14.8 km away (ETA: 24 mins).",
      time: "2m ago",
      type: "transit",
    },
    {
      id: 2,
      title: language === "kn" ? "ಪಾವತಿ ಎಸ್ಕ್ರೋ ಲಾಕ್ ಆಗಿದೆ" : language === "hi" ? "भुगतान एस्क्रो में सुरक्षित" : "Escrow Payment Secured",
      desc: language === "kn" ? "₹1,26,952 ಮೊತ್ತವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಹೋಲ್ಡ್ ಮಾಡಲಾಗಿದೆ." : language === "hi" ? "₹1,26,952 राशि सुरक्षित एस्क्रो में रखी गई है।" : "₹1,26,952 held safely in escrow for Booking #8801.",
      time: "15m ago",
      type: "payment",
    },
    {
      id: 3,
      title: language === "kn" ? "ಆರ್‌ಟಿಒ ವಾಹನ್ ಪರಿಶೀಲನೆ ಯಶಸ್ವಿ" : language === "hi" ? "वाहन आरटीओ सत्यापन सफल" : "Vahan KYC Verified",
      desc: language === "kn" ? "ಜೆಸಿಬಿ 3DX ನಂಬರ್ KA-11-JCB-4412 ದೃಢೀಕರಿಸಲಾಗಿದೆ." : language === "hi" ? "जेसीबी 3DX का आरसी सत्यापन पूरा हुआ।" : "JCB 3DX (KA-11-JCB-4412) fitness approved by AI.",
      time: "1h ago",
      type: "verified",
    },
  ];

  return (
    <header
      id="heavyhire-topbar"
      className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/10 bg-[#111111] text-gray-100 sticky top-0 z-40"
    >
      {/* Brand and Logo */}
      <div className="flex items-center space-x-3">
        <div
          id="brand-badge"
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab("explore")}
        >
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-black text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            H
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              HEAVYHIRE <span className="text-amber-500">AI</span>
            </h1>
          </div>
        </div>

        {/* Quick Kotlin Source Switcher Pill */}
        <button
          id="btn-nav-kotlin-source"
          onClick={() => setActiveTab("kotlinSource")}
          className={`hidden xl:flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border transition-all ${
            activeTab === "kotlinSource"
              ? "bg-amber-500 text-black border-amber-500 font-bold"
              : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Kotlin 2.0 Compose</span>
        </button>
      </div>

      {/* Center Role Toggle (Customer / Fleet Owner / Admin) in Elegant Dark Pill Style */}
      <div className="flex items-center space-x-4">
        <div
          id="role-switcher-group"
          className="flex bg-white/5 rounded-full p-1 border border-white/5"
        >
          <button
            id="role-btn-customer"
            onClick={() => {
              setRole("CUSTOMER");
              if (activeTab === "fleet" || activeTab === "verifications") setActiveTab("explore");
            }}
            className={`px-3 sm:px-4 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              role === "CUSTOMER"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <HardHat className="w-3 h-3" />
            <span>{t.roles.customer}</span>
          </button>

          <button
            id="role-btn-owner"
            onClick={() => {
              setRole("OWNER");
              if (activeTab === "explore" || activeTab === "verifications") setActiveTab("fleet");
            }}
            className={`px-3 sm:px-4 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              role === "OWNER"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Tractor className="w-3 h-3" />
            <span>{t.roles.owner}</span>
          </button>

          <button
            id="role-btn-admin"
            onClick={() => {
              setRole("ADMIN");
              setActiveTab("verifications");
            }}
            className={`px-3 sm:px-4 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              role === "ADMIN"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{t.roles.admin}</span>
          </button>
        </div>

        {/* Live GPS Location indicator matching mockup */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="truncate max-w-[140px]">Bangalore, Hebbal</span>
        </div>
      </div>

      {/* Right Controls: AI Voice Trigger, Language Switcher, Notifications, Dark/Light, Mobile Frame */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Voice Booking Trigger */}
        <button
          id="btn-quick-voice"
          onClick={onOpenVoiceBooking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          title="AI Voice Booking (ಕನ್ನಡ / हिंदी / English)"
        >
          <Mic className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden md:inline">{t.nav.voiceBooking}</span>
        </button>

        {/* Tri-Lingual Language Selector */}
        <div className="relative group">
          <button
            id="btn-language-selector"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-amber-500" />
            <span className="uppercase font-mono">{language}</span>
          </button>
          <div className="absolute right-0 mt-1 w-36 py-1 rounded-2xl shadow-2xl border hidden group-hover:block z-50 bg-[#161616] border-white/10 text-gray-200">
            <button
              onClick={() => setLanguage("kn")}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 ${
                language === "kn" ? "text-amber-500 font-bold" : "text-gray-300"
              }`}
            >
              <span>ಕನ್ನಡ (Kannada)</span>
              {language === "kn" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 ${
                language === "hi" ? "text-amber-500 font-bold" : "text-gray-300"
              }`}
            >
              <span>हिंदी (Hindi)</span>
              {language === "hi" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 ${
                language === "en" ? "text-amber-500 font-bold" : "text-gray-300"
              }`}
            >
              <span>English</span>
              {language === "en" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          </div>
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">
                {notificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              id="notifications-panel"
              className="absolute right-0 mt-2 w-80 p-4 rounded-3xl shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 bg-[#161616] border-white/10 text-gray-100"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">
                  {language === "kn" ? "ಸೂಚನೆಗಳು" : language === "hi" ? "सूचनाएं" : "Live Telemetry Alerts"}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">REAL-TIME</span>
              </div>
              <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                {notificationsList.map((item) => (
                  <div key={item.id} className="py-3 first:pt-2 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-200">{item.title}</p>
                      <span className="text-[10px] text-gray-500 font-mono">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Android Device Frame / Fullscreen Mode Toggle */}
        <button
          id="btn-device-frame-toggle"
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
            isMobileFrame
              ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
              : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Switch between Android Device View and Desktop Canvas"
        >
          {isMobileFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          <span>{isMobileFrame ? "Expand View" : "Device View"}</span>
        </button>

        {/* User Profile Avatar matching mockup */}
        <div
          id="user-profile-avatar"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 border border-white/20 flex items-center justify-center font-bold text-black text-xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
          title="Active Contractor / Heavy Fleet Profile"
        >
          KA
        </div>
      </div>
    </header>
  );
};
