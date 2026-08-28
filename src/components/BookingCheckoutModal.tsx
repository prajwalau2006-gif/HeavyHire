import React, { useState, useEffect } from "react";
import { LanguageCode, Equipment, Booking } from "../types";
import { translations } from "../translations";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Lock,
  ArrowRight,
  X,
  MapPin,
  CheckCircle2,
} from "lucide-react";

interface BookingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  isDark: boolean;
  equipment: Equipment | null;
  initialDraft?: Partial<Booking>;
  onBookingConfirmed: (newBooking: Booking) => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  isOpen,
  onClose,
  language,
  isDark,
  equipment,
  initialDraft,
  onBookingConfirmed,
}) => {
  const t = translations[language];

  const [durationDays, setDurationDays] = useState<number>(initialDraft?.durationDays || 2);
  const [distanceKm, setDistanceKm] = useState<number>(18);
  const [includeOperator, setIncludeOperator] = useState<boolean>(true);
  const [includeFuel, setIncludeFuel] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    initialDraft?.locationAddress || "Brigade Tech Gardens, Whitefield, Bengaluru"
  );
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "NETBANKING" | "ESCROW_WALLET">("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (initialDraft?.durationDays) {
      setDurationDays(initialDraft.durationDays);
    }
    if (initialDraft?.locationAddress) {
      setDeliveryAddress(initialDraft.locationAddress);
    }
  }, [initialDraft]);

  if (!isOpen || !equipment) return null;

  // Price calculations
  const baseRate = equipment.dailyRate * durationDays;
  const mobilizationCost = Math.max(2000, Math.round(distanceKm * equipment.mobilizationBaseRatePerKm));
  const operatorCost = includeOperator ? durationDays * equipment.operatorDailyCharge : 0;
  const fuelCost = includeFuel ? durationDays * 3800 : 0;
  const subtotal = baseRate + mobilizationCost + operatorCost + fuelCost;
  const gstTax = Math.round(subtotal * 0.18);
  const securityDeposit = Math.round(equipment.dailyRate * 0.8);
  const totalAmount = subtotal + gstTax + securityDeposit;

  const handlePayAndConfirm = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const newBooking: Booking = {
        id: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: "cust-01",
        customerName: "Prajwal A. U.",
        customerPhone: "+91 98765 43210",
        ownerId: equipment.ownerId,
        ownerName: equipment.ownerName,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        equipmentImage: equipment.images[0],
        category: equipment.category,
        locationAddress: deliveryAddress,
        locationCoords: { lat: 12.975, lng: 77.728 },
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + durationDays * 86400000).toISOString().split("T")[0],
        durationDays,
        requiresOperator: includeOperator,
        includeFuel,
        selectedAttachments: equipment.attachmentsAvailable.slice(0, 2),
        baseRental: baseRate,
        mobilizationCost,
        operatorCost,
        fuelCost,
        gstTax,
        securityDeposit,
        totalAmount,
        status: "ACCEPTED",
        paymentStatus: "ESCROW_HELD",
        paymentMethod,
        liveEtaMinutes: 28,
        distanceRemainingKm: distanceKm,
        currentTransitCoords: { lat: equipment.location.lat, lng: equipment.location.lng },
        createdAt: new Date().toISOString(),
      };

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      setIsProcessing(false);
      setConfirmedBooking(newBooking);
      onBookingConfirmed(newBooking);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="checkout-modal-card"
        className="w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border my-6 bg-[#161616] border-white/10 text-gray-100"
      >
        {/* Success Confirmation View */}
        {confirmedBooking ? (
          <div className="text-center py-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-lg font-extrabold text-white">
              {language === "kn" ? "ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ!" : language === "hi" ? "बुकिंग सफलतापूर्वक संपन्न!" : "Booking Confirmed & Escrow Held!"}
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Booking ID: <span className="font-bold text-amber-500 font-mono">{confirmedBooking.id}</span> • Machine is being prepped for low-bed trailer dispatch.
            </p>

            <div className="p-4 rounded-2xl bg-[#111111] border border-white/5 my-5 text-left text-xs max-w-md mx-auto space-y-2">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Equipment:</span>
                <span className="font-bold text-white truncate max-w-[200px]">{confirmedBooking.equipmentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                <span className="text-gray-400">Escrow Total:</span>
                <span className="font-bold text-emerald-400">₹{confirmedBooking.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 font-mono">
                <span className="text-gray-400">Live ETA:</span>
                <span className="font-bold text-amber-500">{confirmedBooking.liveEtaMinutes} MINS</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  onClose();
                }}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
              >
                Go to Live Telemetry & GPS
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5 font-mono">
                    {t.pricing.transparentEstimate}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Open Ledger Rate Architecture • Vahan Verified Fleet
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

            {/* Equipment Summary Banner */}
            <div className="flex items-center gap-3.5 p-4 my-4 rounded-2xl bg-[#111111] border border-white/5">
              <img
                src={equipment.images[0]}
                alt={equipment.name}
                className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white truncate">
                    {equipment.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 shrink-0">
                    {equipment.horsepower} HP
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  Owner: {equipment.ownerName} • RC: {equipment.rcNumber}
                </p>
                <p className="text-[11px] font-mono font-bold text-amber-500 mt-0.5">
                  ₹{equipment.dailyRate.toLocaleString("en-IN")}/day base rate
                </p>
              </div>
            </div>

            {/* Config Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Rental Duration (Days)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                  <span className="text-xs text-gray-400 font-mono">Days</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Site Distance ({equipment.location.city} Yard)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                  <span className="text-xs text-gray-400 font-mono">km (₹{equipment.mobilizationBaseRatePerKm}/km)</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Delivery Site Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter site location or GPS landmark"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-white/5">
                <span className="text-xs font-medium text-gray-300">
                  Include Certified Operator (₹{equipment.operatorDailyCharge}/day)
                </span>
                <input
                  type="checkbox"
                  checked={includeOperator}
                  onChange={(e) => setIncludeOperator(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-white/5">
                <span className="text-xs font-medium text-gray-300">
                  Pre-paid Diesel Tanker Pack
                </span>
                <input
                  type="checkbox"
                  checked={includeFuel}
                  onChange={(e) => setIncludeFuel(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>
            </div>

            {/* Transparent Ledger Breakdown */}
            <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-300">
                <span>{t.pricing.baseRental} ({durationDays} days):</span>
                <span className="font-semibold text-white">₹{baseRate.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>{t.pricing.mobilizationFreight} ({distanceKm} km freight):</span>
                <span className="font-semibold text-white">₹{mobilizationCost.toLocaleString("en-IN")}</span>
              </div>
              {includeOperator && (
                <div className="flex justify-between text-gray-300">
                  <span>{t.pricing.operatorWage}:</span>
                  <span className="font-semibold text-white">₹{operatorCost.toLocaleString("en-IN")}</span>
                </div>
              )}
              {includeFuel && (
                <div className="flex justify-between text-gray-300">
                  <span>{t.pricing.fuelCost}:</span>
                  <span className="font-semibold text-white">₹{fuelCost.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-300">
                <span>{t.pricing.gstTax}:</span>
                <span className="font-semibold text-white">₹{gstTax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-emerald-400 pt-1.5 border-t border-white/5">
                <span className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.pricing.securityDeposit}:</span>
                </span>
                <span className="font-bold">₹{securityDeposit.toLocaleString("en-IN")} (Refundable)</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                <span>{t.pricing.totalPayable}:</span>
                <span className="text-amber-500 text-base">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[10px] text-gray-500 italic pt-1 font-sans">
                {t.pricing.refundableNote}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="my-4">
              <span className="text-xs font-bold text-gray-300 block mb-2 font-mono uppercase">
                Select Escrow Payment Mode
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === "UPI"
                      ? "bg-amber-500/15 border-amber-500 text-amber-500 font-extrabold shadow-md"
                      : "bg-[#1a1a1a] border-white/10 text-gray-300 hover:text-white"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === "CARD"
                      ? "bg-amber-500/15 border-amber-500 text-amber-500 font-extrabold shadow-md"
                      : "bg-[#1a1a1a] border-white/10 text-gray-300 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Debit / Corporate Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("NETBANKING")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === "NETBANKING"
                      ? "bg-amber-500/15 border-amber-500 text-amber-500 font-extrabold shadow-md"
                      : "bg-[#1a1a1a] border-white/10 text-gray-300 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>NetBanking Escrow</span>
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-gray-400 hover:text-white"
              >
                {t.common.cancel}
              </button>

              <button
                id="btn-pay-escrow-confirm"
                onClick={handlePayAndConfirm}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isProcessing ? "Authorizing Escrow Vault..." : `Secure Escrow & Book (₹${totalAmount.toLocaleString("en-IN")})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
