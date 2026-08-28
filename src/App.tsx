import React, { useState, useEffect } from "react";
import {
  UserRole,
  LanguageCode,
  Equipment,
  Booking,
} from "./types";
import { translations } from "./translations";
import {
  initialEquipmentList,
  initialBookings,
  initialMaintenanceList,
  initialDisputes,
  initialFraudFlags,
} from "./mockData";
import {
  seedInitialFirestoreData,
  subscribeToEquipment,
  saveBookingToFirebase,
} from "./services/firebaseService";
import { MaterialTopBar } from "./components/MaterialTopBar";
import { VoiceBookingModal } from "./components/VoiceBookingModal";
import { JobEstimatorModal } from "./components/JobEstimatorModal";
import { BookingCheckoutModal } from "./components/BookingCheckoutModal";
import { LiveTrackingView } from "./components/LiveTrackingView";
import { EquipmentCatalog } from "./components/EquipmentCatalog";
import { BookingHistoryView } from "./components/BookingHistoryView";
import { ChatCallModal } from "./components/ChatCallModal";
import { OwnerView } from "./components/OwnerView";
import { AdminView } from "./components/AdminView";
import { KotlinSourceViewer } from "./components/KotlinSourceViewer";
import { AndroidFrame } from "./components/AndroidFrame";
import {
  Compass,
  Navigation,
  Clock,
  Mic,
  Code2,
  Zap,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Database,
} from "lucide-react";

export default function App() {
  // Global App States
  const [role, setRole] = useState<UserRole>("CUSTOMER");
  const [language, setLanguage] = useState<LanguageCode>("kn");
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("explore");

  // Dynamic Data Stores connected to Firebase
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(initialEquipmentList);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  // Active tracking booking
  const [trackedBooking, setTrackedBooking] = useState<Booking>(initialBookings[0]);

  // Modals
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutEquipment, setCheckoutEquipment] = useState<Equipment | null>(null);
  const [checkoutDraft, setCheckoutDraft] = useState<Partial<Booking> | undefined>(undefined);

  // Chat & Call Modals
  const [isChatCallOpen, setIsChatCallOpen] = useState(false);
  const [chatCallMode, setChatCallMode] = useState<"CHAT" | "CALL">("CHAT");

  // Sync dark class on DOM root and seed Firebase Firestore
  useEffect(() => {
    document.documentElement.classList.add("dark");
    // Seed initial data to Firestore if not already present
    seedInitialFirestoreData();

    // Subscribe to real-time equipment changes from Firestore
    const unsubscribe = subscribeToEquipment((equipments) => {
      if (equipments && equipments.length > 0) {
        setEquipmentList(equipments);
      }
    });

    return () => unsubscribe();
  }, []);

  const t = translations[language];

  // Handler for booking initiation
  const handleInitiateBooking = (equipment: Equipment, draft?: Partial<Booking>) => {
    setCheckoutEquipment(equipment);
    setCheckoutDraft(draft);
    setIsCheckoutOpen(true);
  };

  // Handler for booking confirmation
  const handleBookingConfirmed = async (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setTrackedBooking(newBooking);
    setActiveTab("tracking");
    // Save booking to Firebase
    await saveBookingToFirebase(newBooking);
  };

  // Handler when user selects machine from AI Estimator
  const handleMachineFromEstimator = (machineName: string) => {
    const matched =
      equipmentList.find((eq) => eq.name.toLowerCase().includes(machineName.toLowerCase())) ||
      equipmentList[0];
    handleInitiateBooking(matched);
  };

  // Handle adding new machine from Owner tab
  const handleAddEquipment = (newEq: Equipment) => {
    setEquipmentList((prev) => [newEq, ...prev]);
  };

  return (
    <div
      id="heavyhire-app-root"
      className="min-h-screen flex flex-col bg-[#0a0a0a] text-gray-100 font-sans selection:bg-amber-500 selection:text-black"
    >
      {/* Top Navigation Bar with Elegant Dark Theme */}
      <MaterialTopBar
        role={role}
        setRole={setRole}
        language={language}
        setLanguage={setLanguage}
        isDark={isDark}
        setIsDark={setIsDark}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        onOpenVoiceBooking={() => setIsVoiceOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notificationsCount={2}
      />

      {/* Main Canvas Container with Optional Android Frame */}
      <AndroidFrame isDark={true} enabled={isMobileFrame}>
        <div className="flex flex-1 w-full overflow-x-hidden min-h-[calc(100vh-104px)]">
          {/* Left Sleek Quick Tool Rail */}
          <aside className="hidden md:flex w-16 lg:w-20 flex-col items-center py-6 space-y-6 border-r border-white/10 bg-[#0d0d0d] shrink-0">
            <button
              id="sidebar-btn-explore"
              onClick={() => {
                setRole("CUSTOMER");
                setActiveTab("explore");
              }}
              title="Explore Machinery Fleet"
              className={`p-3 rounded-2xl transition-all ${
                activeTab === "explore" && role === "CUSTOMER"
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Compass className="w-5 h-5" />
            </button>

            <button
              id="sidebar-btn-tracking"
              onClick={() => {
                setRole("CUSTOMER");
                setActiveTab("tracking");
              }}
              title="Live GPS & Telematics Tracking"
              className={`p-3 rounded-2xl transition-all ${
                activeTab === "tracking" && role === "CUSTOMER"
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Navigation className="w-5 h-5" />
            </button>

            <button
              id="sidebar-btn-history"
              onClick={() => {
                setRole("CUSTOMER");
                setActiveTab("history");
              }}
              title="Rental Bookings & Escrow History"
              className={`p-3 rounded-2xl transition-all ${
                activeTab === "history" && role === "CUSTOMER"
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Clock className="w-5 h-5" />
            </button>

            <button
              id="sidebar-btn-estimator"
              onClick={() => setIsEstimatorOpen(true)}
              title="AI Job Site Project Estimator"
              className="p-3 rounded-2xl text-gray-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
            >
              <Zap className="w-5 h-5" />
            </button>

            <button
              id="sidebar-btn-kotlin"
              onClick={() => setActiveTab("kotlinSource")}
              title="Android Jetpack Compose MVVM Source (.kt)"
              className={`p-3 rounded-2xl transition-all ${
                activeTab === "kotlinSource"
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                  : "text-gray-500 hover:text-indigo-400 hover:bg-white/5"
              }`}
            >
              <Code2 className="w-5 h-5" />
            </button>

            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col items-center space-y-4">
              <button
                onClick={() => setIsVoiceOpen(true)}
                title="AI Voice Booking in Kannada/Hindi/English"
                className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all"
              >
                <Mic className="w-5 h-5 animate-pulse" />
              </button>
            </div>
          </aside>

          {/* Main Content Workspace Layout */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Top AI Voice Prompt Feature Card */}
            {role === "CUSTOMER" && activeTab === "explore" && (
              <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/5 to-transparent p-6 rounded-3xl border border-amber-500/20 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h2 className="text-xs uppercase tracking-widest text-amber-500 font-extrabold font-mono">
                        Multilingual AI Voice Assistant • ಕನ್ನಡ / हिंदी / English
                      </h2>
                    </div>
                    <p className="text-xl sm:text-2xl font-medium text-white leading-snug">
                      &quot;Hey HeavyHire, book a <span className="text-amber-500 font-bold">20T Excavator</span> for Monday near the <span className="text-amber-500 font-bold">Hebbal Flyover</span> project.&quot;
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 border border-white/5 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Firebase Firestore Database Synced</span>
                      </div>
                      <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 font-mono border border-white/5">
                        ESCROW: 100% PROTECTED
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setIsVoiceOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Speak Voice Prompt</span>
                    </button>
                    <button
                      onClick={() => setIsEstimatorOpen(true)}
                      className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 font-bold text-xs transition-all"
                    >
                      AI Project Estimator
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOMER VIEWS */}
            {role === "CUSTOMER" && (
              <>
                {/* Horizontal Navigation Pills */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      id="tab-btn-explore"
                      onClick={() => setActiveTab("explore")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        activeTab === "explore"
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{t.nav.explore}</span>
                    </button>

                    <button
                      id="tab-btn-tracking"
                      onClick={() => setActiveTab("tracking")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        activeTab === "tracking"
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t.nav.liveTracking}</span>
                    </button>

                    <button
                      id="tab-btn-history"
                      onClick={() => setActiveTab("history")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        activeTab === "history"
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.nav.history}</span>
                    </button>

                    <button
                      id="tab-btn-kotlin"
                      onClick={() => setActiveTab("kotlinSource")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold transition-all ${
                        activeTab === "kotlinSource"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                          : "bg-white/5 text-indigo-400 hover:text-indigo-300 hover:bg-white/10"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Android (.kt)</span>
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400">
                    <span className="text-amber-500">●</span> {equipmentList.length} Units in Firebase Live Fleet
                  </div>
                </div>

                {/* Sub-Views */}
                {activeTab === "explore" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                      <EquipmentCatalog
                        equipmentList={equipmentList}
                        language={language}
                        isDark={true}
                        onSelectForBooking={(eq) => handleInitiateBooking(eq)}
                        onOpenEstimator={() => setIsEstimatorOpen(true)}
                      />
                    </div>

                    {/* Right Rail: Quick Telemetry, Recent Activity & Dynamic Insights */}
                    <div className="lg:col-span-4 space-y-6">
                      {/* Active Dispatch Mini Card */}
                      <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold uppercase tracking-tight text-xs text-gray-400 font-mono">
                            Live Fleet Telemetry
                          </h3>
                          <div className="flex space-x-2">
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded font-bold">
                              EN ROUTE
                            </span>
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-mono rounded font-bold">
                              ETA: 24 MIN
                            </span>
                          </div>
                        </div>

                        <div
                          onClick={() => setActiveTab("tracking")}
                          className="h-36 bg-[#1a1a1a] rounded-2xl relative overflow-hidden flex items-center justify-center cursor-pointer border border-white/5 group hover:border-amber-500/40 transition-all"
                        >
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage: "radial-gradient(#fff 0.5px, transparent 0.5px)",
                              backgroundSize: "16px 16px",
                            }}
                          />
                          <div className="relative z-10 text-center space-y-1">
                            <Navigation className="w-6 h-6 text-amber-500 mx-auto group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold text-gray-200">Tata Hitachi 220LC</p>
                            <p className="text-[10px] text-gray-500 font-mono">14.8 km to Site • Speed: 32 km/h</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab("tracking")}
                          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Open Live Tracking Radar</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                      </div>

                      {/* Recent Activity Log */}
                      <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5 space-y-4">
                        <h3 className="font-bold text-sm text-white flex items-center justify-between">
                          <span>Recent Activity</span>
                          <span className="text-[10px] font-mono text-gray-500">LIVE FEED</span>
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3.5 pb-3.5 border-b border-white/5">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
                              <DollarSign className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-200">Escrow Payment Locked</p>
                              <p className="text-[11px] text-gray-400">₹42,000 for 3 Days Digging</p>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">10m ago</span>
                          </div>

                          <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-200">Owner Accepted Booking</p>
                              <p className="text-[11px] text-gray-400">JCB 3DX Excavator - Tomorrow</p>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">25m ago</span>
                          </div>
                        </div>
                      </div>

                      {/* Fleet Owner Promotion Card */}
                      <div className="bg-amber-500 p-6 rounded-3xl text-black shadow-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-xl tracking-tight uppercase italic">
                            Earn More
                          </h3>
                          <TrendingUp className="w-6 h-6 text-black" />
                        </div>
                        <p className="text-xs font-medium text-black/90 leading-relaxed">
                          Register your earthmovers, harvesters, or cranes today and start earning up to ₹5,00,000/month with guaranteed escrow.
                        </p>
                        <button
                          onClick={() => {
                            setRole("OWNER");
                            setActiveTab("register");
                          }}
                          className="w-full bg-black text-white text-xs font-bold py-3 rounded-xl uppercase tracking-widest hover:bg-neutral-900 active:scale-95 transition-all shadow-md"
                        >
                          Register Fleet Now
                        </button>
                      </div>

                      {/* Multilingual Switcher Card */}
                      <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
                          Regional Language
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setLanguage("en")}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${
                              language === "en"
                                ? "bg-amber-500 text-black shadow-md"
                                : "bg-white/5 hover:bg-white/10 text-gray-300"
                            }`}
                          >
                            English
                          </button>
                          <button
                            onClick={() => setLanguage("kn")}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${
                              language === "kn"
                                ? "bg-amber-500 text-black shadow-md"
                                : "bg-white/5 hover:bg-white/10 text-gray-300"
                            }`}
                          >
                            ಕನ್ನಡ
                          </button>
                          <button
                            onClick={() => setLanguage("hi")}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${
                              language === "hi"
                                ? "bg-amber-500 text-black shadow-md"
                                : "bg-white/5 hover:bg-white/10 text-gray-300"
                            }`}
                          >
                            हिंदी
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "tracking" && (
                  <LiveTrackingView
                    booking={trackedBooking}
                    equipment={equipmentList.find((e) => e.id === trackedBooking.equipmentId)}
                    language={language}
                    isDark={true}
                    onOpenChat={() => {
                      setChatCallMode("CHAT");
                      setIsChatCallOpen(true);
                    }}
                    onOpenCall={() => {
                      setChatCallMode("CALL");
                      setIsChatCallOpen(true);
                    }}
                  />
                )}

                {activeTab === "history" && (
                  <BookingHistoryView
                    bookings={bookings}
                    language={language}
                    isDark={true}
                    onTrackBooking={(b) => {
                      setTrackedBooking(b);
                      setActiveTab("tracking");
                    }}
                  />
                )}

                {activeTab === "kotlinSource" && <KotlinSourceViewer isDark={true} />}
              </>
            )}

            {/* FLEET OWNER ROLE VIEW */}
            {role === "OWNER" && (
              <OwnerView
                equipmentList={equipmentList}
                bookings={bookings}
                maintenanceList={initialMaintenanceList}
                language={language}
                isDark={true}
                onAddEquipment={handleAddEquipment}
              />
            )}

            {/* ADMIN ROLE VIEW */}
            {role === "ADMIN" && (
              <AdminView
                disputes={initialDisputes}
                fraudFlags={initialFraudFlags}
                equipmentList={equipmentList}
                language={language}
                isDark={true}
                onRefreshEquipment={() => {
                  // Firestore onSnapshot automatically keeps it synced
                }}
              />
            )}
          </main>
        </div>
      </AndroidFrame>

      {/* System Status Footer */}
      <footer className="h-10 bg-black border-t border-white/5 px-6 sm:px-8 flex items-center justify-between text-[10px] text-gray-500 tracking-widest font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>FIREBASE FIRESTORE: PERSISTENT</span>
        </div>
        <div className="hidden sm:block">
          <span>GEMINI 2.5 AI: CONNECTED</span>
        </div>
        <div>
          <span>© 2026 HEAVYHIRE AI INDUSTRIES</span>
        </div>
      </footer>

      {/* MODALS */}
      <VoiceBookingModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        language={language}
        isDark={true}
        equipmentList={equipmentList}
        onProceedToBooking={(extractedDraft, matchedMachine) => {
          const target = matchedMachine || equipmentList[0];
          handleInitiateBooking(target, extractedDraft);
        }}
      />

      <JobEstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
        language={language}
        isDark={true}
        onSelectMachine={handleMachineFromEstimator}
      />

      <BookingCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        language={language}
        isDark={true}
        equipment={checkoutEquipment}
        initialDraft={checkoutDraft}
        onBookingConfirmed={handleBookingConfirmed}
      />

      <ChatCallModal
        isOpen={isChatCallOpen}
        onClose={() => setIsChatCallOpen(false)}
        booking={trackedBooking}
        language={language}
        isDark={true}
        mode={chatCallMode}
      />
    </div>
  );
}
