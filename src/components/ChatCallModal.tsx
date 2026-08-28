import React, { useState, useEffect, useRef } from "react";
import { LanguageCode, Booking, ChatMessage } from "../types";
import { translations } from "../translations";
import {
  X,
  Send,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Languages,
  Clock,
} from "lucide-react";

interface ChatCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  language: LanguageCode;
  isDark: boolean;
  mode: "CHAT" | "CALL";
}

export const ChatCallModal: React.FC<ChatCallModalProps> = ({
  isOpen,
  onClose,
  booking,
  language,
  isDark,
  mode: initialMode,
}) => {
  const t = translations[language];
  const [activeMode, setActiveMode] = useState<"CHAT" | "CALL">(initialMode);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      bookingId: booking.id,
      senderRole: "OPERATOR",
      senderName: "Manjunath Gowda (Operator)",
      text: "ನಮಸ್ಕಾರ ಸರ್, ಟ್ರೈಲರ್‌ನಲ್ಲಿ ಹಿಟಾಚಿ ಮೆಷಿನ್ ಲೋಡ್ ಆಗಿದೆ. ಈಗ ಹೊಸಕೋಟೆ ಟೋಲ್ ದಾಟುತ್ತಿದ್ದೇವೆ.",
      translatedText: "Hello Sir, Hitachi machine is loaded on the trailer. We are currently crossing Hoskote toll gate.",
      originalLanguage: "kn",
      timestamp: "10:15 AM",
    },
    {
      id: "msg-2",
      bookingId: booking.id,
      senderRole: "CUSTOMER",
      senderName: "Prajwal A. U.",
      text: "Great! Please take the Whitefield Outer Ring Road route. Site gate is wide enough for 40ft trailer.",
      translatedText: "ಉತ್ತಮ! ದಯವಿಟ್ಟು ವೈಟ್‌ಫೀಲ್ಡ್ ಔಟರ್ ರಿಂಗ್ ರಸ್ತೆ ಮಾರ್ಗವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ. ಸೈಟ್ ಗೇಟ್ 40 ಅಡಿ ಟ್ರೇಲರ್‌ಗೆ ವಿಶಾಲವಾಗಿದೆ.",
      originalLanguage: "en",
      timestamp: "10:18 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Yes, site is ready with water tanker.",
    "Please call once you reach the main arch.",
    "Do you need diesel refilling today?",
  ]);

  // Audio Call Simulation State
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<"CONNECTING" | "IN_CALL" | "ENDED">("CONNECTING");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (activeMode === "CALL") {
      setCallStatus("CONNECTING");
      setCallDuration(0);
      const timer = setTimeout(() => {
        setCallStatus("IN_CALL");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeMode]);

  useEffect(() => {
    let interval: any;
    if (activeMode === "CALL" && callStatus === "IN_CALL") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMode, callStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId: booking.id,
      senderRole: "CUSTOMER",
      senderName: "Prajwal A. U.",
      text: textToSend,
      originalLanguage: language,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTranslating(true);

    try {
      const res = await fetch("/api/gemini/chat-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          fromLang: language,
          targetLang: "Kannada",
          context: "Heavy equipment delivery, worksite directions, diesel fueling",
        }),
      });

      const data = await res.json();
      if (data.success) {
        userMessage.translatedText = data.translatedText;
        if (data.quickReplies?.length) {
          setQuickReplies(data.quickReplies);
        }

        setTimeout(() => {
          const operatorReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            bookingId: booking.id,
            senderRole: "OPERATOR",
            senderName: "Manjunath Gowda (Operator)",
            text: "ಸರಿ ಸರ್, ನಾನು ಇನ್ನೊಂದು 15 ನಿಮಿಷದಲ್ಲಿ ಸೈಟ್ ತಲುಪುತ್ತೇನೆ. ರಾಕ್ ಬ್ರೇಕರ್ ಜೋಡಿಸಲು ಕ್ರೇನ್ ಸಹಾಯ ಬೇಕಿಲ್ಲ, ನಾವೇ ಫಿಟ್ ಮಾಡುತ್ತೇವೆ.",
            translatedText: "Alright Sir, I will reach the site in 15 minutes. We can attach the rock breaker ourselves without crane help.",
            originalLanguage: "kn",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, operatorReply]);
        }, 1800);
      }
    } catch (e) {
      console.warn("Translation fallback:", e);
    } finally {
      setIsTranslating(false);
    }
  };

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="chat-call-modal-card"
        className="w-full max-w-lg rounded-3xl shadow-2xl border flex flex-col overflow-hidden transition-all h-[580px] bg-[#161616] border-white/10 text-gray-100"
      >
        {/* Header with Mode Toggle (Chat vs Call) */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2 bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 font-bold flex items-center justify-center border border-amber-500/30 font-mono">
                MG
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <span>Manjunath Gowda</span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-mono">
                  PILOT
                </span>
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                {booking.equipmentName} • #{booking.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 rounded-full bg-[#1a1a1a] border border-white/10">
              <button
                onClick={() => setActiveMode("CHAT")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeMode === "CHAT"
                    ? "bg-amber-500 text-black shadow-sm font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveMode("CALL")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeMode === "CALL"
                    ? "bg-emerald-500 text-black shadow-sm font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Call
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CHAT MODE */}
        {activeMode === "CHAT" && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Real-Time Auto-Translation Notice */}
            <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[11px] text-amber-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Live Auto-Translation: Kannada ⇄ English ⇄ Hindi</span>
              </div>
              <span className="text-[10px] font-bold text-amber-500">GEMINI 2.5</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderRole === "CUSTOMER";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] text-gray-500 mb-1 px-1 font-mono">
                      {msg.senderName} • {msg.timestamp}
                    </span>
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1.5 shadow-md ${
                        isMe
                          ? "bg-amber-500 text-black rounded-tr-none font-semibold"
                          : "bg-[#1a1a1a] text-gray-100 rounded-tl-none border border-white/5"
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.translatedText && (
                        <div
                          className={`pt-1.5 border-t text-[11px] italic flex items-start gap-1 ${
                            isMe
                              ? "border-black/20 text-black/80"
                              : "border-white/10 text-gray-400"
                          }`}
                        >
                          <Languages className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                          <span>{msg.translatedText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isTranslating && (
                <div className="flex items-center gap-2 text-xs text-gray-400 italic font-mono">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  <span>Translating message stream...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies Chips */}
            <div className="px-4 py-2 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#111111]">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(reply)}
                  className="shrink-0 text-[11px] font-medium px-3 py-1 rounded-full bg-[#1a1a1a] hover:bg-amber-500/20 border border-white/5 text-gray-300 hover:text-white transition-colors font-mono"
                >
                  ⚡ {reply}
                </button>
              ))}
            </div>

            {/* Chat Input Field */}
            <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#111111]">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
                placeholder={
                  language === "kn"
                    ? "ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸಂದೇಶ ಬರೆಯಿರಿ..."
                    : language === "hi"
                    ? "संदेश टाइप करें (कन्नड़/हिंदी/अंग्रेजी)..."
                    : "Type message in English, Kannada or Hindi..."
                }
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
              <button
                id="btn-chat-send"
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CALL MODE */}
        {activeMode === "CALL" && (
          <div className="flex-1 flex flex-col items-center justify-between p-8 text-center animate-in zoom-in-95 duration-200 bg-[#0e0e0e]">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-amber-500 text-black font-mono font-extrabold text-2xl flex items-center justify-center shadow-2xl border-4 border-amber-400">
                  MG
                </div>
                {callStatus === "IN_CALL" && (
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-40" />
                )}
              </div>

              <h2 className="text-base font-extrabold text-white">
                Manjunath Gowda
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                Heavy Equipment Pilot • +91 94480 88219
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1a1a1a] border border-white/10 text-xs font-mono font-semibold">
                {callStatus === "CONNECTING" && <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                {callStatus === "IN_CALL" && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                <span className={callStatus === "IN_CALL" ? "text-emerald-400" : "text-gray-400"}>
                  {callStatus === "CONNECTING" ? "Connecting to Operator GSM..." : formatCallTime(callDuration)}
                </span>
              </div>
            </div>

            {/* In-Call Telemetry Snippet */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 text-xs max-w-xs text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-500 block font-mono">
                Active Telemetry Stream:
              </span>
              <p className="font-bold text-white">{booking.equipmentName}</p>
              <p className="text-[11px] text-gray-400 font-mono">
                Speed: 38 km/h • ETA: 24 mins • Whitefield Site
              </p>
            </div>

            {/* Call Control Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`p-4 rounded-full border transition-all ${
                  isCallMuted
                    ? "bg-amber-500 text-black border-amber-500 shadow-md"
                    : "bg-[#1a1a1a] text-gray-300 border-white/10 hover:text-white"
                }`}
              >
                {isCallMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  setCallStatus("ENDED");
                  setTimeout(() => setActiveMode("CHAT"), 800);
                }}
                className="p-5 rounded-full bg-red-600 text-white shadow-xl shadow-red-600/30 hover:bg-red-500 active:scale-95 transition-all"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-4 rounded-full border transition-all ${
                  isSpeakerOn
                    ? "bg-amber-500 text-black border-amber-500 shadow-md"
                    : "bg-[#1a1a1a] text-gray-300 border-white/10 hover:text-white"
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
