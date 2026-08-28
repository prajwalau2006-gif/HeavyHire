import React, { useState, useEffect } from "react";
import { LanguageCode, Booking, Equipment } from "../types";
import { translations } from "../translations";
import {
  Phone,
  MessageSquare,
  Gauge,
  Fuel,
  Activity,
  BatteryCharging,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Sparkles,
} from "lucide-react";

interface LiveTrackingViewProps {
  booking: Booking;
  equipment?: Equipment;
  language: LanguageCode;
  isDark: boolean;
  onOpenChat: () => void;
  onOpenCall: () => void;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  booking,
  equipment,
  language,
  isDark,
  onOpenChat,
  onOpenCall,
}) => {
  const t = translations[language];

  // Dynamic simulation state
  const [etaMinutes, setEtaMinutes] = useState(booking.liveEtaMinutes || 24);
  const [speedKmH, setSpeedKmH] = useState(equipment?.liveGps.speedKmH || 36);
  const [fuelPct, setFuelPct] = useState(equipment?.liveGps.fuelLevelPct || 82);
  const [engineRpm, setEngineRpm] = useState(equipment?.liveGps.engineRpm || 1750);
  const [routeProgress, setRouteProgress] = useState(35); // 0 to 100%
  const [isSimulating, setIsSimulating] = useState(true);
  const [sosAlertTriggered, setSosAlertTriggered] = useState(false);

  // Live telemetry pulse
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setRouteProgress((prev) => {
        const next = prev + 0.5;
        if (next >= 100) return 100;
        return next;
      });

      setEtaMinutes((prev) => Math.max(1, Math.round(24 * (1 - routeProgress / 100))));
      setSpeedKmH((prev) => Math.max(28, Math.min(52, prev + (Math.random() * 4 - 2))));
      setEngineRpm((prev) => Math.max(1600, Math.min(1950, Math.round(prev + (Math.random() * 60 - 30)))));
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, routeProgress]);

  // Coordinates for interactive vector radar map
  const truckX = 100 + (520 - 100) * (routeProgress / 100);
  const truckY = 320 - (320 - 120) * (routeProgress / 100) + Math.sin(routeProgress / 10) * 20;

  return (
    <div
      id="live-tracking-container"
      className="rounded-3xl border border-white/10 bg-[#111111] text-gray-100 shadow-2xl overflow-hidden"
    >
      {/* Top Telemetry Header */}
      <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-base font-bold text-white uppercase tracking-tight font-mono">
              {t.tracking.title}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-mono border border-amber-500/30">
              BOOKING #{booking.id}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {booking.equipmentName} • {booking.ownerName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold font-mono transition-all ${
              isSimulating
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold"
                : "bg-white/5 border-white/10 text-gray-400"
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? "GPS LIVE" : "PAUSED"}</span>
          </button>

          <button
            onClick={() => setSosAlertTriggered(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 text-xs font-bold transition-all font-mono"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SOS DISPATCH</span>
          </button>
        </div>
      </div>

      {/* Interactive Vector GPS Map Stage (Obsidian Dark Radar Theme) */}
      <div className="relative w-full h-80 sm:h-96 bg-[#0a0a0a] overflow-hidden select-none border-b border-white/10">
        {/* Map Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(245, 158, 11, 0.4) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <svg className="w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Road Network Lines */}
          <path
            d="M 50 150 Q 200 180 350 100 T 580 80"
            fill="none"
            stroke="#1c1c1c"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 80 380 Q 250 300 400 340 T 570 280"
            fill="none"
            stroke="#1c1c1c"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 100 320 C 180 280, 240 200, 380 230 S 460 140, 520 120"
            fill="none"
            stroke="#161616"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Active Navigation Route Line */}
          <path
            d="M 100 320 C 180 280, 240 200, 380 230 S 460 140, 520 120"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            strokeDasharray="8 4"
            className="animate-pulse"
            filter="url(#glow)"
          />

          {/* Origin Depot Pin */}
          <g transform="translate(100, 320)">
            <circle r="14" fill="#f59e0b" fillOpacity="0.2" className="animate-ping" />
            <circle r="8" fill="#f59e0b" />
            <text x="14" y="4" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
              DEPOT: {equipment?.location.city || "Bangalore Yard"}
            </text>
          </g>

          {/* Destination Site Pin */}
          <g transform="translate(520, 120)">
            <circle r="18" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
            <circle r="10" fill="#10b981" />
            <text x="-160" y="-12" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">
              SITE: {booking.locationAddress.split(",")[0]}
            </text>
          </g>

          {/* Live Moving Trailer Marker */}
          <g transform={`translate(${truckX}, ${truckY})`} className="transition-transform duration-700">
            <circle r="22" fill="#f59e0b" fillOpacity="0.25" className="animate-ping" />
            <circle r="16" fill="#000000" stroke="#f59e0b" strokeWidth="3" />
            <rect x="-8" y="-6" width="16" height="12" rx="2" fill="#f59e0b" />
            <polygon points="-8,-6 -14,-2 -14,4 -8,6" fill="#f59e0b" />
            <circle cx="-4" cy="6" r="2.5" fill="#000000" />
            <circle cx="4" cy="6" r="2.5" fill="#000000" />
          </g>
        </svg>

        {/* Floating ETA HUD Widget */}
        <div className="absolute top-4 left-4 p-4 rounded-3xl bg-[#111111]/90 border border-white/10 backdrop-blur-md shadow-2xl text-white">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="text-xs font-mono text-gray-400">{t.tracking.liveEta}:</span>
            <span className="text-sm font-extrabold text-amber-500 font-mono">{etaMinutes} MINS</span>
          </div>
          <div className="mt-2 w-48 bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${routeProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1.5">
            <span>YARD</span>
            <span>{Math.round(routeProgress)}% PROGRESS</span>
            <span>SITE</span>
          </div>
        </div>

        {/* Floating Speedometer Overlay */}
        <div className="absolute bottom-4 right-4 p-3.5 rounded-3xl bg-[#111111]/90 border border-white/10 backdrop-blur-md shadow-2xl text-white flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase font-bold font-mono block">{t.tracking.speed}</span>
            <span className="text-base font-extrabold text-amber-500 font-mono">{Math.round(speedKmH)} km/h</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
            <Gauge className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Telemetry Sensor Metrics in Elegant Dark Cards */}
      <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-white/10">
        <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <Fuel className="w-4 h-4 text-amber-500" />
            <span>{t.tracking.fuelLevel}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-extrabold text-white font-mono">{fuelPct}%</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">OPTIMAL</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${fuelPct}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <Activity className="w-4 h-4 text-amber-500" />
            <span>{t.tracking.engineRpm}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-extrabold text-white font-mono">{engineRpm} RPM</span>
            <span className="text-[10px] text-gray-500 font-mono">BS6 TIER</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(engineRpm / 2200) * 100}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{t.tracking.engineHours}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-extrabold text-white font-mono">
              {equipment?.liveGps.engineHours || 1420.5} h
            </span>
            <span className="text-[10px] text-amber-500 font-mono font-bold">TELEMATICS</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono">Real-time CANbus sync</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <BatteryCharging className="w-4 h-4 text-amber-500" />
            <span>BATTERY & SENSORS</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-extrabold text-white font-mono">
              {equipment?.liveGps.batteryVoltage || 24.6} V
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">ONLINE</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono">Anti-theft GPS ACTIVE</p>
        </div>
      </div>

      {/* Operator & Communication Footer */}
      <div className="p-5 sm:p-6 flex items-center justify-between gap-4 flex-wrap bg-[#0d0d0d]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-sm border border-amber-500/30">
            MG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {equipment?.operatorName || "Manjunath Gowda (Lead Pilot)"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                VERIFIED OPERATOR
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Carrier Trailer #KA-01-TR-9021 • Phone: {equipment?.operatorPhone || "+91 94480 88219"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-call-operator"
            onClick={onOpenCall}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>{t.common.callOperator}</span>
          </button>

          <button
            id="btn-chat-translate"
            onClick={onOpenChat}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Chat & Translate</span>
          </button>
        </div>
      </div>

      {/* SOS Alert Modal/Banner */}
      {sosAlertTriggered && (
        <div className="p-4 bg-red-500/20 border-t border-red-500/30 flex items-center justify-between text-xs text-red-300 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Emergency breakdown signal broadcasted to HeavyHire 24x7 Quick Response Fleet.</span>
          </div>
          <button
            onClick={() => setSosAlertTriggered(false)}
            className="text-[11px] underline font-bold text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
