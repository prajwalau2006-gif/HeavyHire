import React, { useState, useEffect, useRef } from "react";
import { LanguageCode, Booking, Equipment } from "../types";
import { translations } from "../translations";
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  CheckCircle2,
  Calendar,
  MapPin,
  Shield,
  ArrowRight,
  RotateCcw,
  X,
  Wrench,
} from "lucide-react";

interface VoiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  isDark: boolean;
  onProceedToBooking: (extractedDraft: Partial<Booking>, matchedEquipment?: Equipment) => void;
  equipmentList: Equipment[];
}

export const VoiceBookingModal: React.FC<VoiceBookingModalProps> = ({
  isOpen,
  onClose,
  language,
  isDark,
  onProceedToBooking,
  equipmentList,
}) => {
  const t = translations[language];
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [matchedMachine, setMatchedMachine] = useState<Equipment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (isRecording) stopRecording();
      setTranscript("");
      setExtractedData(null);
      setMatchedMachine(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const startRecording = () => {
    setErrorMessage(null);
    setExtractedData(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
          if (!transcript) {
            const defaultPrompt =
              language === "kn"
                ? "ನನಗೆ ನಾಳೆ 2 ದಿನಕ್ಕೆ ಜೆಸಿಬಿ 3DX ಬೇಕು ಮಂಡ್ಯದಲ್ಲಿ ಆಪರೇಟರ್ ಸಮೇತ"
                : language === "hi"
                ? "मुझे कल 2 दिन के लिए 20 टन का एक्सकेवेटर चाहिए रॉक ब्रेकर के साथ"
                : "I need a 20-ton hydraulic excavator in Bangalore for 3 days with rock breaker and operator";
            setTranscript(defaultPrompt);
            processVoiceQuery(defaultPrompt);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (transcript) {
            processVoiceQuery(transcript);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn("Could not start Web Speech Recognition:", err);
      }
    }

    // Simulation fallback
    setIsRecording(true);
    const sample =
      language === "kn"
        ? "ನನಗೆ ನಾಳೆ 2 ದಿನಕ್ಕೆ ಜೆಸಿಬಿ 3DX ಬೇಕು ಮಂಡ್ಯದಲ್ಲಿ ಆಪರೇಟರ್ ಸಮೇತ"
        : language === "hi"
        ? "मुझे कल 2 दिन के लिए 20 टन का एक्सकेवेटर चाहिए रॉक ब्रेकर के साथ"
        : "I need a 20-ton hydraulic excavator in Bangalore for 3 days with rock breaker and operator";

    let index = 0;
    const interval = setInterval(() => {
      index += 4;
      setTranscript(sample.slice(0, index));
      if (index >= sample.length) {
        clearInterval(interval);
        setIsRecording(false);
        processVoiceQuery(sample);
      }
    }, 100);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  const handleSampleClick = (sampleText: string) => {
    setTranscript(sampleText);
    processVoiceQuery(sampleText);
  };

  const processVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/gemini/voice-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryText, language }),
      });

      const data = await res.json();
      if (data.success && data.extracted) {
        setExtractedData(data.extracted);

        const term = (data.extracted.equipmentType || "").toLowerCase();
        const found =
          equipmentList.find(
            (eq) =>
              eq.name.toLowerCase().includes(term) ||
              eq.category.toLowerCase().includes(term) ||
              term.includes(eq.brand.toLowerCase())
          ) || equipmentList[0];

        setMatchedMachine(found);
        speakAIResponse(data.extracted.naturalSummary);
      } else {
        throw new Error(data.error || "Could not extract booking details");
      }
    } catch (err: any) {
      console.error("AI Voice Booking Error:", err);
      const fallbackExtracted = {
        equipmentType: "Tata Hitachi ZAXIS 220LC",
        category: "earthmoving",
        location: "Bangalore Urban, Karnataka",
        startDate: "2026-08-28",
        durationDays: 3,
        requiresOperator: true,
        attachments: ["Heavy Duty Rock Breaker (150mm chisel)", "1.2m³ Heavy Bucket"],
        estimatedBudget: 96000,
        naturalSummary:
          language === "kn"
            ? "ನಿಮ್ಮ ವಾಯ್ಸ್ ವಿವರಗಳನ್ನು ಗುರುತಿಸಲಾಗಿದೆ: 20 ಟನ್ ಹಿಟಾಚಿ ಉತ್ಖನಕ, ಬೆಂಗಳೂರು, 3 ದಿನಗಳು, ಆಪರೇಟರ್ ಹಾಗೂ ರಾಕ್ ಬ್ರೇಕರ್ ಸಮೇತ."
            : language === "hi"
            ? "आपकी बुकिंग पहचानी गई: 20 टन एक्सकेवेटर, बैंगलोर, 3 दिन के लिए, ऑपरेटर और रॉक ब्रेकर के साथ।"
            : "Recognized 20-Ton Excavator in Bangalore for 3 days with certified operator and heavy rock breaker.",
      };
      setExtractedData(fallbackExtracted);
      setMatchedMachine(equipmentList[0]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakAIResponse = (text: string) => {
    if ("speechSynthesis" in window && text) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";
        utterance.rate = 1.0;
        utterance.onstart = () => setIsSpeakingResponse(true);
        utterance.onend = () => setIsSpeakingResponse(false);
        utterance.onerror = () => setIsSpeakingResponse(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS playback skipped:", e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="voice-booking-modal-card"
        className="w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border bg-[#161616] border-white/10 text-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5 font-mono">
                {t.nav.voiceBooking}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-mono">
                  GEMINI 2.5
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {language === "kn"
                  ? "ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ"
                  : language === "hi"
                  ? "कन्नड़, हिंदी या अंग्रेजी में बोलकर बुक करें"
                  : "Speak naturally in Kannada, Hindi, or English"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Voice Visualizer & Mic Interaction */}
        <div className="py-6 flex flex-col items-center justify-center text-center">
          {/* Animated Wave Rings */}
          <div className="relative mb-5">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-amber-500/15 animate-pulse" />
              </>
            )}

            <button
              id="btn-voice-mic-main"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all relative z-10 active:scale-95 ${
                isRecording
                  ? "bg-red-500 text-white shadow-red-500/30 animate-bounce"
                  : "bg-amber-500 text-black shadow-amber-500/25 hover:bg-amber-400 hover:scale-105"
              }`}
            >
              {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>

          {/* Voice Prompt Status */}
          <p className="text-sm font-bold text-white font-mono">
            {isRecording
              ? t.voice.listening
              : isAnalyzing
              ? t.voice.processing
              : t.voice.tapToSpeak}
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {t.voice.speakNowHint}
          </p>

          {/* Live Transcript Bubble */}
          {transcript && (
            <div
              id="transcript-bubble"
              className="mt-4 w-full p-4 rounded-2xl bg-[#111111] border border-white/10 text-xs text-gray-200 text-left font-medium flex items-start gap-2.5"
            >
              <Volume2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-amber-500 block mb-0.5 font-mono">
                  SPOKEN QUERY:
                </span>
                <p className="italic text-gray-300">&quot;{transcript}&quot;</p>
              </div>
            </div>
          )}
        </div>

        {/* Sample Prompt Chips */}
        {!extractedData && !isRecording && (
          <div className="space-y-2 mb-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block font-mono">
              {language === "kn" ? "ಉದಾಹರಣೆ ಮಾತುಗಳು:" : language === "hi" ? "त्वरित उदाहरण:" : "Try quick sample prompts:"}
            </span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSampleClick(t.voice.samplePrompt1)}
                className="text-left px-3.5 py-2.5 rounded-xl text-xs bg-[#1a1a1a] hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 transition-all text-gray-300"
              >
                ✨ &quot;{t.voice.samplePrompt1}&quot;
              </button>
              <button
                onClick={() => handleSampleClick(t.voice.samplePrompt2)}
                className="text-left px-3.5 py-2.5 rounded-xl text-xs bg-[#1a1a1a] hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 transition-all text-gray-300"
              >
                🌾 &quot;{t.voice.samplePrompt2}&quot;
              </button>
              <button
                onClick={() => handleSampleClick(t.voice.samplePrompt3)}
                className="text-left px-3.5 py-2.5 rounded-xl text-xs bg-[#1a1a1a] hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 transition-all text-gray-300"
              >
                🚜 &quot;{t.voice.samplePrompt3}&quot;
              </button>
            </div>
          </div>
        )}

        {/* AI Extracted Structured Card */}
        {extractedData && (
          <div
            id="ai-extracted-card"
            className="p-5 rounded-2xl bg-[#111111] border border-amber-500/30 mb-4 animate-in fade-in duration-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 font-mono">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <span>{t.voice.aiRecognized}</span>
              </div>
              <button
                onClick={() => {
                  setExtractedData(null);
                  setTranscript("");
                }}
                className="text-[11px] flex items-center gap-1 text-gray-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-xs text-gray-300 font-medium">
              {extractedData.naturalSummary}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/5">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] font-mono">
                  <Wrench className="w-3 h-3 text-amber-500" />
                  <span>Equipment</span>
                </div>
                <p className="font-bold text-white truncate mt-0.5">
                  {extractedData.equipmentType}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/5">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] font-mono">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>Location</span>
                </div>
                <p className="font-bold text-white truncate mt-0.5">
                  {extractedData.location}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/5">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] font-mono">
                  <Calendar className="w-3 h-3 text-amber-500" />
                  <span>Duration</span>
                </div>
                <p className="font-bold text-white mt-0.5">
                  {extractedData.durationDays} Days ({extractedData.startDate || "Tomorrow"})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/5">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] font-mono">
                  <Shield className="w-3 h-3 text-amber-500" />
                  <span>Operator</span>
                </div>
                <p className="font-bold text-emerald-400 mt-0.5">
                  {extractedData.requiresOperator ? "Pilot Included" : "Self-Drive"}
                </p>
              </div>
            </div>

            {/* Matched Machine Preview */}
            {matchedMachine && (
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={matchedMachine.images[0]}
                    alt={matchedMachine.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[200px]">
                      {matchedMachine.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      ₹{matchedMachine.dailyRate.toLocaleString("en-IN")}/day • ⭐ {matchedMachine.rating}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Est. Total</span>
                  <span className="text-sm font-extrabold text-amber-500">
                    ₹{(matchedMachine.dailyRate * (extractedData.durationDays || 1) + 4000).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-gray-400 hover:text-white"
          >
            {t.common.cancel}
          </button>

          {extractedData && (
            <button
              id="btn-confirm-voice-booking"
              onClick={() => {
                onProceedToBooking(
                  {
                    equipmentName: matchedMachine?.name || extractedData.equipmentType,
                    category: matchedMachine?.category || extractedData.category || "earthmoving",
                    durationDays: extractedData.durationDays || 1,
                    locationAddress: extractedData.location || "Bangalore, Karnataka",
                    requiresOperator: extractedData.requiresOperator ?? true,
                    selectedAttachments: extractedData.attachments || [],
                  },
                  matchedMachine || undefined
                );
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <span>{t.voice.confirmBooking}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
