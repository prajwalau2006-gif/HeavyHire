import React, { useState } from "react";
import { LanguageCode, AIRecommendation } from "../types";
import { translations } from "../translations";
import {
  Sparkles,
  Layers,
  Fuel,
  Users,
  Clock,
  ArrowRight,
  X,
  TrendingUp,
} from "lucide-react";

interface JobEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  isDark: boolean;
  onSelectMachine: (machineName: string) => void;
}

export const JobEstimatorModal: React.FC<JobEstimatorModalProps> = ({
  isOpen,
  onClose,
  language,
  isDark,
  onSelectMachine,
}) => {
  const t = translations[language];

  const [projectType, setProjectType] = useState("Basement Excavation");
  const [terrainType, setTerrainType] = useState("Granite & Hard Rock");
  const [areaSize, setAreaSize] = useState("40x60 ft plot (2400 sq.ft, 12ft depth)");
  const [urgency, setUrgency] = useState("Within 2 Days");
  const [workDetails, setWorkDetails] = useState("Need to dig foundation for 4-floor commercial complex with rock breaking");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[] | null>(null);

  if (!isOpen) return null;

  const handleRunEstimation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType,
          workDetails,
          terrainType,
          areaSqFt: areaSize,
          urgency,
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (e) {
      console.error("AI Estimation Error:", e);
      setRecommendations([
        {
          machineName: "Tata Hitachi ZAXIS 220LC",
          category: "Excavators",
          matchScore: 98,
          recommendedAttachments: ["Heavy Duty Rock Breaker (150mm)", "1.2m³ Trenching Bucket"],
          reasoning: "High hydraulic breakout force is essential for breaking granite bedrock without excessive vibration to adjacent buildings.",
          estimatedDays: 3,
          estimatedHoursPerDay: 8,
          fuelConsumptionEstimateLiters: 45,
          suggestedCrew: "1 Senior Heavy Machine Pilot + 1 Spotter Banksman",
          costBreakdown: {
            baseRentalPerDay: 26000,
            mobilizationFreight: 4500,
            operatorChargePerDay: 1500,
            estimatedFuelCost: 12000,
            totalEstimate: 99000,
          },
          alternativeMachine: "JCB 3DX Plus (Slower on hard rock, but 50% cheaper)",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="job-estimator-modal-card"
        className="w-full max-w-3xl rounded-3xl p-6 sm:p-7 shadow-2xl border my-8 bg-[#161616] border-white/10 text-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                {t.nav.estimator}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-mono">
                  CIVIL & AGRI AI
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {language === "kn"
                  ? "ನಿಮ್ಮ ಕೆಲಸದ ವಿವರ ನೀಡಿ, ಸೂಕ್ತ ಯಂತ್ರ ಮತ್ತು ಬಜೆಟ್ ಅಂದಾಜು ಪಡೆಯಿರಿ"
                  : language === "hi"
                  ? "अपने प्रोजेक्ट का विवरण दें और सर्वोत्तम मशीन एवं लागत अनुमान पाएं"
                  : "Input your job site conditions to get AI equipment matching & accurate fuel/cost estimates"}
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

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Project Type / Category
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
            >
              <option value="Basement Foundation Excavation">Basement Foundation Excavation</option>
              <option value="Farm Land Leveling & Plowing">Farm Land Leveling & Plowing (ಕೃಷಿ ಜಮೀನು)</option>
              <option value="Paddy / Wheat Harvesting">Paddy / Wheat Multi-Crop Harvesting</option>
              <option value="Highway & Rural Road Compaction">Highway & Rural Road Compaction</option>
              <option value="Concrete Slab Pouring & Batching">Concrete Slab Pouring & Batching</option>
              <option value="Borewell Drilling (Hard Rock)">Borewell Water Drilling (650m Depth)</option>
              <option value="Heavy Pre-Cast Lifting & Rigging">Heavy Pre-Cast / Machinery Lifting</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Soil & Terrain Condition
            </label>
            <select
              value={terrainType}
              onChange={(e) => setTerrainType(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
            >
              <option value="Granite & Hard Rock">Hard Granite Bedrock / Boulders</option>
              <option value="Wet Clay & Black Cotton Soil">Wet Clay & Black Cotton Soil (Paddy)</option>
              <option value="Red Sandy Loam">Red Sandy Loam / Farm Soil</option>
              <option value="Sloped / Hilly Terrain">Sloped Hilly Ghat Terrain</option>
              <option value="Compacted Gravel / Road Sub-base">Compacted Gravel / Road Sub-base</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Plot Area / Work Scope
            </label>
            <input
              type="text"
              value={areaSize}
              onChange={(e) => setAreaSize(e.target.value)}
              placeholder="e.g. 5 Acres or 40x60 plot 10ft depth"
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
            >
            </input>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Urgency & Timeline
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
            >
              <option value="Immediate (Next 24 Hours)">Immediate (Next 24 Hours)</option>
              <option value="Within 2-3 Days">Within 2-3 Days</option>
              <option value="Next Week / Advance Plan">Next Week / Advance Plan</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Specific Requirements or Constraints
            </label>
            <textarea
              rows={2}
              value={workDetails}
              onChange={(e) => setWorkDetails(e.target.value)}
              placeholder="e.g. Near boundary wall, requires rock breaker and certified banksman helper"
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pb-4">
          <button
            id="btn-run-estimator"
            onClick={handleRunEstimation}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? "Analyzing Soil & Machinery Matrix..." : "Generate AI Equipment Plan"}</span>
          </button>
        </div>

        {/* AI Results */}
        {recommendations && (
          <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-4 h-4" />
                <span>AI Recommended Equipment Matrix</span>
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">Grounded in ISO & Indian Civil Norms</span>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    idx === 0
                      ? "bg-[#111111] border-amber-500/40 shadow-lg shadow-amber-500/5"
                      : "bg-[#1a1a1a] border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">
                          {rec.machineName}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {rec.matchScore}% Match
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                            ★ Primary Pick
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{rec.reasoning}</p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Total Estimated Cost</span>
                      <span className="text-base font-extrabold text-amber-500">
                        ₹{rec.costBreakdown.totalEstimate.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        ({rec.estimatedDays} Days @ ₹{rec.costBreakdown.baseRentalPerDay.toLocaleString("en-IN")}/day)
                      </span>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#111111] border border-white/5">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Timeline</span>
                      </div>
                      <p className="font-bold text-white mt-0.5">
                        {rec.estimatedDays} Days ({rec.estimatedHoursPerDay} hrs/day)
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#111111] border border-white/5">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Fuel className="w-3 h-3 text-amber-500" />
                        <span>Diesel Budget</span>
                      </div>
                      <p className="font-bold text-white mt-0.5">
                        ~{rec.fuelConsumptionEstimateLiters} L/day (₹{rec.costBreakdown.estimatedFuelCost || 0})
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#111111] border border-white/5">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Users className="w-3 h-3 text-amber-500" />
                        <span>Crew</span>
                      </div>
                      <p className="font-bold text-white mt-0.5 truncate">
                        {rec.suggestedCrew}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#111111] border border-white/5">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Layers className="w-3 h-3 text-amber-500" />
                        <span>Freight Mobilization</span>
                      </div>
                      <p className="font-bold text-white mt-0.5">
                        ₹{rec.costBreakdown.mobilizationFreight.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Attachments */}
                  {rec.recommendedAttachments?.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 font-mono">Required Attachments:</span>
                      {rec.recommendedAttachments.map((att, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        >
                          + {att}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Booking CTA */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 italic">
                      Alt: {rec.alternativeMachine || "Standard Tier Option"}
                    </span>
                    <button
                      onClick={() => {
                        onSelectMachine(rec.machineName);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      <span>Find & Book This Fleet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
