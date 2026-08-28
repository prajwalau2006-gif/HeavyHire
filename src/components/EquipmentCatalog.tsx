import React, { useState } from "react";
import { LanguageCode, Equipment } from "../types";
import { translations } from "../translations";
import {
  Search,
  Star,
  MapPin,
  CheckCircle2,
  Zap,
  HardHat,
  Tractor,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface EquipmentCatalogProps {
  equipmentList: Equipment[];
  language: LanguageCode;
  isDark: boolean;
  onSelectForBooking: (equipment: Equipment) => void;
  onOpenEstimator: () => void;
}

export const EquipmentCatalog: React.FC<EquipmentCatalogProps> = ({
  equipmentList,
  language,
  isDark,
  onSelectForBooking,
  onOpenEstimator,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyWithOperator, setOnlyWithOperator] = useState(false);

  const categories = [
    { id: "ALL", label: t.categories.all, icon: Layers },
    { id: "earthmoving", label: t.categories.earthmoving, icon: HardHat },
    { id: "agricultural", label: t.categories.agriculture, icon: Tractor },
    { id: "lifting", label: t.categories.cranes, icon: Layers },
    { id: "concrete", label: t.categories.concrete, icon: Layers },
    { id: "roadwork", label: t.categories.roadwork, icon: Layers },
    { id: "drilling", label: t.categories.drilling, icon: Layers },
  ];

  const filteredList = equipmentList.filter((item) => {
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
    if (onlyVerified && !item.verified) return false;
    if (onlyWithOperator && !item.operatorIncluded) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.location.city.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="equipment-catalog-section" className="space-y-6">
      {/* Search & Filter Header Container */}
      <div className="p-5 rounded-3xl bg-[#111111] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-amber-500 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="w-full text-xs pl-11 pr-4 py-3 rounded-2xl bg-[#1a1a1a] border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            {/* Filter Toggle Chips */}
            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                onlyVerified
                  ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vahan Verified</span>
            </button>

            <button
              onClick={() => setOnlyWithOperator(!onlyWithOperator)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                onlyWithOperator
                  ? "bg-amber-500/15 border-amber-500 text-amber-500 font-bold"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>With Operator</span>
            </button>

            {/* AI Estimator Launcher */}
            <button
              id="btn-catalog-estimator"
              onClick={onOpenEstimator}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t.nav.estimator}</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
                    : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment Cards Grid (Matching Elegant Dark Archetype) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredList.map((machine) => (
          <div
            key={machine.id}
            id={`equipment-card-${machine.id}`}
            className="bg-[#1a1a1a] p-5 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-white/15 transition-all group shadow-xl"
          >
            <div>
              {/* Header Title & Badges */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {machine.name}
                    </h3>
                    {machine.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    {machine.brand} • {machine.year} • {machine.tonnage}T ({machine.horsepower} HP)
                  </p>
                </div>

                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                    machine.category === "earthmoving"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}
                >
                  {machine.category.toUpperCase()}
                </span>
              </div>

              {/* Machinery Media Banner */}
              <div className="h-40 bg-[#222222] rounded-2xl mb-3.5 relative overflow-hidden">
                <img
                  src={machine.images[0]}
                  alt={machine.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Rating Overlay */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-amber-400 text-[11px] font-bold border border-white/10">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{machine.rating}</span>
                  <span className="text-gray-400 text-[9px]">({machine.reviewCount})</span>
                </div>

                {/* Location Overlay */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[11px] text-gray-300">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>{machine.location.city}, {machine.location.state}</span>
                </div>

                {/* Status Indicator */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      machine.available
                        ? "bg-emerald-500/80 text-black font-extrabold"
                        : "bg-neutral-800 text-gray-300"
                    }`}
                  >
                    {machine.available ? "AVAILABLE" : "BOOKED"}
                  </span>
                </div>
              </div>

              {/* Description & Specs */}
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
                {machine.description}
              </p>

              {/* Attachments Chips */}
              <div className="flex items-center gap-1.5 flex-wrap mb-4">
                {machine.attachmentsAvailable.slice(0, 2).map((att, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5"
                  >
                    + {att}
                  </span>
                ))}
                {machine.operatorIncluded && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ✓ Operator Included
                  </span>
                )}
              </div>
            </div>

            {/* Price & Book Action */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-mono uppercase block">Daily Rate</span>
                <span className="text-base font-extrabold text-amber-500 font-mono">
                  ₹{machine.dailyRate.toLocaleString("en-IN")}<span className="text-xs text-gray-500 font-normal">/day</span>
                </span>
              </div>

              <button
                id={`btn-book-${machine.id}`}
                onClick={() => onSelectForBooking(machine)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <span>{t.common.bookNow}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 rounded-3xl bg-[#111111] border border-white/10">
          <Layers className="w-10 h-10 text-gray-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-200">No equipment matches your search</h3>
          <p className="text-xs text-gray-500 mt-1">Try changing category or clearing filters</p>
        </div>
      )}
    </div>
  );
};
