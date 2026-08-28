import React, { useState } from "react";
import { LanguageCode, Booking } from "../types";
import { translations } from "../translations";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Star,
  CheckCircle2,
  Navigation,
} from "lucide-react";

interface BookingHistoryViewProps {
  bookings: Booking[];
  language: LanguageCode;
  isDark: boolean;
  onTrackBooking: (booking: Booking) => void;
}

export const BookingHistoryView: React.FC<BookingHistoryViewProps> = ({
  bookings,
  language,
  isDark,
  onTrackBooking,
}) => {
  const t = translations[language];
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmittedId, setReviewSubmittedId] = useState<string | null>(null);

  const handleSubmitReview = (bookingId: string) => {
    setReviewSubmittedId(bookingId);
    setReviewBooking(null);
    setReviewComment("");
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "IN_TRANSIT":
        return {
          label: "IN-TRANSIT (DISPATCHED)",
          color: "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse",
        };
      case "WORKING_ON_SITE":
        return {
          label: "ACTIVE ON SITE",
          color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        };
      case "COMPLETED":
        return {
          label: "COMPLETED",
          color: "bg-white/5 text-gray-400 border-white/10",
        };
      case "ACCEPTED":
        return {
          label: "CONFIRMED (PREPPING)",
          color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        };
      default:
        return {
          label: status,
          color: "bg-white/5 text-gray-400 border-white/10",
        };
    }
  };

  return (
    <div id="booking-history-view" className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>{t.nav.history}</span>
          </h2>
          <p className="text-xs text-gray-400">
            Escrow Protected Machinery Bookings & Digital GST Invoices
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
          {bookings.length} TOTAL BOOKINGS
        </span>
      </div>

      <div className="space-y-4">
        {bookings.map((item) => {
          const statusMeta = getStatusBadge(item.status);
          const isReviewDone = reviewSubmittedId === item.id || item.ratingScore !== undefined;

          return (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-[#1a1a1a] border border-white/5 shadow-xl space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.equipmentImage}
                    alt={item.equipmentName}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-white">
                        {item.equipmentName}
                      </h3>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5 flex-wrap font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.startDate} ({item.durationDays} Days)</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.locationAddress}</span>
                      </span>
                      <span>•</span>
                      <span className="font-bold text-amber-500">
                        ₹{item.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {(item.status === "IN_TRANSIT" || item.status === "WORKING_ON_SITE" || item.status === "ACCEPTED") && (
                    <button
                      onClick={() => onTrackBooking(item)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t.history.trackGps}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedInvoice(item)}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.history.downloadInvoice}</span>
                  </button>

                  {item.status === "COMPLETED" && !isReviewDone && (
                    <button
                      onClick={() => setReviewBooking(item)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition-all"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{t.history.leaveReview}</span>
                    </button>
                  )}

                  {isReviewDone && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reviewed (5★)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Milestones Tracker */}
              <div className="pt-3 border-t border-white/5">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono font-bold text-gray-500">
                  <div className="flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-extrabold flex items-center justify-center mb-1">
                      ✓
                    </span>
                    <span className="text-emerald-400">ESCROW HELD</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 font-extrabold ${
                      item.status !== "PENDING" ? "bg-emerald-500 text-black" : "bg-neutral-800 text-gray-400"
                    }`}>
                      {item.status !== "PENDING" ? "✓" : "2"}
                    </span>
                    <span className={item.status !== "PENDING" ? "text-emerald-400" : ""}>
                      DISPATCH
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 font-extrabold ${
                      item.status === "WORKING_ON_SITE" || item.status === "COMPLETED"
                        ? "bg-emerald-500 text-black"
                        : "bg-neutral-800 text-gray-400"
                    }`}>
                      {item.status === "WORKING_ON_SITE" || item.status === "COMPLETED" ? "✓" : "3"}
                    </span>
                    <span className={item.status === "WORKING_ON_SITE" || item.status === "COMPLETED" ? "text-emerald-400" : ""}>
                      JOB SITE
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 font-extrabold ${
                      item.status === "COMPLETED" ? "bg-emerald-500 text-black" : "bg-neutral-800 text-gray-400"
                    }`}>
                      {item.status === "COMPLETED" ? "✓" : "4"}
                    </span>
                    <span className={item.status === "COMPLETED" ? "text-emerald-400" : ""}>
                      RELEASE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl border bg-[#161616] border-white/10 text-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-white">TAX INVOICE #{selectedInvoice.id}</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-gray-400">GSTIN / SAC Code:</span>
                <span className="font-semibold text-gray-200">29AAAAH0000A1Z5 (SAC: 997319)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Customer:</span>
                <span className="font-semibold text-gray-200">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Equipment Model:</span>
                <span className="font-semibold text-gray-200">{selectedInvoice.equipmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rental Duration:</span>
                <span className="font-semibold text-gray-200">{selectedInvoice.durationDays} Days</span>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Base Machinery Charge:</span>
                  <span className="text-gray-200">₹{selectedInvoice.baseRental.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Freight Mobilization:</span>
                  <span className="text-gray-200">₹{selectedInvoice.mobilizationCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Operator Allowance:</span>
                  <span className="text-gray-200">₹{selectedInvoice.operatorCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GST (18% CGST + SGST):</span>
                  <span className="text-gray-200">₹{selectedInvoice.gstTax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Refundable Security Deposit:</span>
                  <span>₹{selectedInvoice.securityDeposit.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-white/10 text-amber-500">
                  <span>Total Paid (Escrow):</span>
                  <span>₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => alert("Digital GST Invoice PDF generated & downloaded.")}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/20"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl border bg-[#161616] border-white/10 text-gray-100">
            <h3 className="text-sm font-extrabold text-white">
              {t.history.leaveReview} - {reviewBooking.equipmentName}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Rate machine condition & operator performance</p>

            <div className="flex items-center justify-center gap-2 my-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingVal(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingVal
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-700"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Machine operated smoothly with high hydraulic power. Operator was punctual."
              className="w-full text-xs p-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 placeholder-gray-500 mb-4 focus:outline-none focus:border-amber-500/50"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReviewBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitReview(reviewBooking.id)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/20"
              >
                Submit Verified Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
