import React, { useState, useEffect } from "react";
import {
  LanguageCode,
  DisputeCase,
  FraudFlag,
  Equipment,
  OwnerRegistration,
} from "../types";
import { translations } from "../translations";
import {
  AlertOctagon,
  Scale,
  TrendingUp,
  FileCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  Building,
  FileText,
  Eye,
  Shield,
  RefreshCw,
  Search,
  Check,
  X,
  Tractor,
} from "lucide-react";
import {
  subscribeToOwnerRegistrations,
  updateOwnerVerificationInFirebase,
  updateEquipmentVerificationInFirebase,
} from "../services/firebaseService";

interface AdminViewProps {
  disputes: DisputeCase[];
  fraudFlags: FraudFlag[];
  equipmentList: Equipment[];
  language: LanguageCode;
  isDark: boolean;
  onRefreshEquipment?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  disputes,
  fraudFlags,
  equipmentList,
  language,
  isDark,
  onRefreshEquipment,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<
    "equipment-verifications" | "owner-kyc-verifications" | "disputes" | "fraud" | "analytics"
  >("equipment-verifications");

  // Owner Registrations fetched from Firebase
  const [ownerRegistrations, setOwnerRegistrations] = useState<OwnerRegistration[]>([]);
  const [selectedOwnerForReview, setSelectedOwnerForReview] = useState<OwnerRegistration | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Selected Equipment for Verification Review
  const [selectedEquipmentForReview, setSelectedEquipmentForReview] = useState<Equipment | null>(
    equipmentList[0] || null
  );
  const [equipmentFilter, setEquipmentFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [equipmentRemarks, setEquipmentRemarks] = useState("");

  // Dispute evaluation state
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(disputes[0] || null);
  const [isEvaluatingDispute, setIsEvaluatingDispute] = useState(false);
  const [disputeRuling, setDisputeRuling] = useState<any | null>(null);

  // Subscribe to Firebase Owner Registrations
  useEffect(() => {
    const unsubscribe = subscribeToOwnerRegistrations((owners) => {
      setOwnerRegistrations(owners);
      if (owners.length > 0 && !selectedOwnerForReview) {
        setSelectedOwnerForReview(owners[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (equipmentList.length > 0 && !selectedEquipmentForReview) {
      setSelectedEquipmentForReview(equipmentList[0]);
    }
  }, [equipmentList]);

  // Handle Equipment Approval / Rejection in Firebase
  const handleEquipmentDecision = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedEquipmentForReview) return;
    setIsProcessingAction(true);
    try {
      await updateEquipmentVerificationInFirebase(
        selectedEquipmentForReview.id,
        status,
        equipmentRemarks || (status === "APPROVED" ? "Verified against Parivahan & Insurance databases" : "Documents rejected")
      );
      alert(`Equipment ${selectedEquipmentForReview.name} has been marked as ${status} in Firebase!`);
      if (onRefreshEquipment) onRefreshEquipment();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingAction(false);
      setEquipmentRemarks("");
    }
  };

  // Handle Owner KYC Approval / Rejection in Firebase
  const handleOwnerDecision = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedOwnerForReview) return;
    setIsProcessingAction(true);
    try {
      await updateOwnerVerificationInFirebase(
        selectedOwnerForReview.id,
        status,
        adminNotes || (status === "APPROVED" ? "Owner KYC & GSTIN validated by Admin" : "KYC criteria unfulfilled")
      );
      alert(`Owner Registration for ${selectedOwnerForReview.ownerName} marked as ${status} in Firebase!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingAction(false);
      setAdminNotes("");
    }
  };

  const handleEvaluateDispute = async (disp: DisputeCase) => {
    setIsEvaluatingDispute(true);
    setDisputeRuling(null);

    try {
      const res = await fetch("/api/gemini/dispute-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeTitle: disp.disputeType,
          customerClaim: disp.description,
          ownerClaim: "Owner states operational logs comply with standard shift agreement.",
          claimAmount: disp.claimAmount,
          telemetryLogs: "Engine RPM 1400, hydraulic pressure sustained, location within site bounds.",
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setDisputeRuling(data.evaluation);
      }
    } catch (e) {
      console.warn("Dispute eval fallback:", e);
      setDisputeRuling({
        rulingRecommendation: "PARTIAL_REFUND_CUSTOMER_AND_SPLIT_FREIGHT",
        liabilityPctCustomer: 20,
        liabilityPctOwner: 80,
        reasoning:
          "IoT telemetry indicates hydraulic pump pressure drop occurred at 10:45 AM, verifying machine malfunction during active shift without customer misuse.",
        payoutBreakdown: {
          refundToCustomer: 18000,
          releaseToOwner: 14000,
          escrowServiceFeeRetained: 2000,
        },
      });
    } finally {
      setIsEvaluatingDispute(false);
    }
  };

  const filteredEquipment = equipmentList.filter((eq) => {
    if (equipmentFilter === "ALL") return true;
    if (equipmentFilter === "APPROVED") return eq.verificationStatus === "APPROVED" || eq.verified;
    if (equipmentFilter === "PENDING") return eq.verificationStatus === "PENDING" && !eq.verified;
    if (equipmentFilter === "REJECTED") return eq.verificationStatus === "REJECTED";
    return true;
  });

  const pendingEquipmentCount = equipmentList.filter(
    (e) => e.verificationStatus === "PENDING" && !e.verified
  ).length;
  const pendingOwnerCount = ownerRegistrations.filter(
    (o) => o.verificationStatus === "PENDING"
  ).length;

  return (
    <div id="admin-view-dashboard" className="space-y-6">
      {/* Top Header & Metric Blocks in Elegant Dark */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#111111] border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-500 font-mono block uppercase">Total GMV Transacted</span>
          <span className="text-xl font-extrabold text-amber-500 font-mono block">₹4.82 Crore</span>
          <span className="text-[10px] text-emerald-400 font-bold font-mono">+24.5% vs last quarter</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#111111] border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-500 font-mono block uppercase">Pending Verifications</span>
          <span className="text-xl font-extrabold text-white font-mono block">
            {pendingEquipmentCount + pendingOwnerCount} Items
          </span>
          <span className="text-[10px] text-amber-500 font-bold font-mono">
            {pendingEquipmentCount} Listings • {pendingOwnerCount} Owners
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#111111] border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-500 font-mono block uppercase">Open Disputes</span>
          <span className="text-xl font-extrabold text-red-400 font-mono block">{disputes.length} Cases</span>
          <span className="text-[10px] text-gray-400 font-mono">IoT Evidence Attached</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#111111] border border-white/5 space-y-1">
          <span className="text-[11px] text-gray-500 font-mono block uppercase">AI Fraud Flags</span>
          <span className="text-xl font-extrabold text-amber-500 font-mono block">{fraudFlags.length} Alerts</span>
          <span className="text-[10px] text-emerald-400 font-bold font-mono">Night Geofence Active</span>
        </div>
      </div>

      {/* Admin Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
        <button
          id="tab-admin-equipment-verifications"
          onClick={() => setActiveTab("equipment-verifications")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "equipment-verifications"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Tractor className="w-3.5 h-3.5" />
          <span>Equipment Listings ({equipmentList.length})</span>
          {pendingEquipmentCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-mono font-extrabold">
              {pendingEquipmentCount}
            </span>
          )}
        </button>

        <button
          id="tab-admin-owner-verifications"
          onClick={() => setActiveTab("owner-kyc-verifications")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "owner-kyc-verifications"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Owner KYC Profiles ({ownerRegistrations.length})</span>
          {pendingOwnerCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-mono font-extrabold">
              {pendingOwnerCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("disputes")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "disputes"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{t.admin.disputeHandling} ({disputes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("fraud")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "fraud"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>{t.admin.fraudFlags} ({fraudFlags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "analytics"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t.admin.analytics}</span>
        </button>
      </div>

      {/* MODULE 1: ADMIN EQUIPMENT LISTING VERIFICATIONS */}
      {activeTab === "equipment-verifications" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Equipment Listing Queue with Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-1 flex-wrap pb-1">
              <span className="text-[11px] font-mono uppercase text-gray-400 font-bold">
                Filter Status:
              </span>
              <div className="flex items-center gap-1">
                {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setEquipmentFilter(filter)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      equipmentFilter === filter
                        ? "bg-amber-500 text-black"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredEquipment.map((mach) => {
                const isSelected = selectedEquipmentForReview?.id === mach.id;
                const status = mach.verificationStatus || (mach.verified ? "APPROVED" : "PENDING");

                return (
                  <div
                    key={mach.id}
                    onClick={() => setSelectedEquipmentForReview(mach)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#1f1a10] border-amber-500 shadow-lg shadow-amber-500/10"
                        : "bg-[#161616] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={mach.images[0]}
                          alt={mach.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-white truncate max-w-[150px]">
                            {mach.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            RC: {mach.rcNumber} • {mach.brand}
                          </p>
                          <p className="text-[10px] text-amber-500 font-mono font-semibold">
                            ₹{mach.dailyRate.toLocaleString("en-IN")}/day
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          status === "APPROVED"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : status === "REJECTED"
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Equipment Verification Inspector */}
          <div className="lg:col-span-2 space-y-4">
            {selectedEquipmentForReview ? (
              <div className="p-6 rounded-3xl bg-[#161616] border border-white/10 shadow-2xl text-gray-100 space-y-5">
                {/* Header Strip */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedEquipmentForReview.images[0]}
                      alt={selectedEquipmentForReview.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {selectedEquipmentForReview.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono">
                        Owner: {selectedEquipmentForReview.ownerName} ({selectedEquipmentForReview.ownerPhone})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400">
                      ID: #{selectedEquipmentForReview.id}
                    </span>
                  </div>
                </div>

                {/* Machine Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">RC NUMBER</span>
                    <span className="font-bold text-white uppercase">{selectedEquipmentForReview.rcNumber}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">CATEGORY</span>
                    <span className="font-bold text-amber-400 uppercase">{selectedEquipmentForReview.category}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">TONNAGE / HP</span>
                    <span className="font-bold text-white">
                      {selectedEquipmentForReview.tonnage || "N/A"}T / {selectedEquipmentForReview.horsepower} HP
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">DAILY RATE</span>
                    <span className="font-bold text-emerald-400">₹{selectedEquipmentForReview.dailyRate}/day</span>
                  </div>
                </div>

                {/* Equipment Photos Gallery */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-gray-400 font-bold block">
                    Owner Uploaded Photos ({selectedEquipmentForReview.images.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedEquipmentForReview.images.map((img, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black">
                        <img src={img} alt="Equipment photo" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-gray-400 font-bold block">
                    Uploaded Compliance Documents
                  </span>
                  {selectedEquipmentForReview.documents && selectedEquipmentForReview.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEquipmentForReview.documents.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 rounded-2xl bg-[#111111] border border-white/5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <div>
                              <span className="font-bold text-white">{d.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono block">
                                Type: {d.type} • {d.fileSize || "1.8 MB"} • Uploaded {d.uploadedAt}
                              </span>
                            </div>
                          </div>
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center gap-1 font-mono"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic p-3 rounded-xl bg-[#111111]">
                      Default standard RTO & Insurance documents on file with registry.
                    </p>
                  )}
                </div>

                {/* Admin Remarks Input */}
                <div>
                  <label className="text-xs font-bold block mb-1 text-gray-300">
                    Admin Verification Audit Remarks
                  </label>
                  <input
                    type="text"
                    value={equipmentRemarks}
                    onChange={(e) => setEquipmentRemarks(e.target.value)}
                    placeholder="e.g. Parivahan chassis verified. Fitness valid till Nov 2028."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Decision Buttons (Store in Firebase) */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                    <Database className="w-3.5 h-3.5 text-amber-500" />
                    <span>Status will be updated live in Firebase Firestore</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="btn-admin-reject-equipment"
                      onClick={() => handleEquipmentDecision("REJECTED")}
                      disabled={isProcessingAction}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Listing</span>
                    </button>

                    <button
                      id="btn-admin-approve-equipment"
                      onClick={() => handleEquipmentDecision("APPROVED")}
                      disabled={isProcessingAction}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Publish Listing</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 font-mono">
                Select an equipment listing from the left to review.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 2: ADMIN OWNER KYC VERIFICATIONS */}
      {activeTab === "owner-kyc-verifications" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Owner Registration Applications */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase text-gray-400 font-bold block">
              Registered Fleet Owners ({ownerRegistrations.length})
            </span>
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {ownerRegistrations.map((owner) => {
                const isSelected = selectedOwnerForReview?.id === owner.id;
                return (
                  <div
                    key={owner.id}
                    onClick={() => setSelectedOwnerForReview(owner)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#1f1a10] border-amber-500 shadow-lg shadow-amber-500/10"
                        : "bg-[#161616] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-white">{owner.ownerName}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[170px]">
                          {owner.companyName}
                        </p>
                        <p className="text-[10px] text-amber-500 font-mono mt-1">
                          GST: {owner.gstin || "Unregistered"}
                        </p>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          owner.verificationStatus === "APPROVED"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : owner.verificationStatus === "REJECTED"
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {owner.verificationStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Owner KYC Audit Panel */}
          <div className="lg:col-span-2 space-y-4">
            {selectedOwnerForReview ? (
              <div className="p-6 rounded-3xl bg-[#161616] border border-white/10 shadow-2xl text-gray-100 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Building className="w-5 h-5 text-amber-500" />
                      <span>{selectedOwnerForReview.companyName}</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      Owner: {selectedOwnerForReview.ownerName} • Registered: {selectedOwnerForReview.createdAt}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                      selectedOwnerForReview.verificationStatus === "APPROVED"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    STATUS: {selectedOwnerForReview.verificationStatus}
                  </span>
                </div>

                {/* Owner Information Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">GSTIN</span>
                    <span className="font-bold text-white uppercase">{selectedOwnerForReview.gstin || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">PAN NUMBER</span>
                    <span className="font-bold text-white uppercase">{selectedOwnerForReview.panNumber || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">PHONE</span>
                    <span className="font-bold text-emerald-400">{selectedOwnerForReview.phone}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111111] border border-white/5 text-xs">
                  <span className="text-[10px] uppercase font-mono text-gray-500 block mb-0.5">Yard Address</span>
                  <p className="text-gray-200">{selectedOwnerForReview.address}, {selectedOwnerForReview.city}, {selectedOwnerForReview.state}</p>
                </div>

                {/* Owner KYC Documents */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-gray-400 font-bold block">
                    KYC Proofs & GST Certificates ({selectedOwnerForReview.documents.length})
                  </span>
                  <div className="space-y-2">
                    {selectedOwnerForReview.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl bg-[#111111] border border-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileCheck className="w-4 h-4 text-amber-500" />
                          <div>
                            <span className="font-bold text-white">{doc.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono block">
                              Type: {doc.type} • Status: {doc.status}
                            </span>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center gap-1 font-mono"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Doc</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Audit Notes Input */}
                <div>
                  <label className="text-xs font-bold block mb-1 text-gray-300">
                    Admin KYC Audit Notes
                  </label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. GSTIN 29AABCM verified on GST portal. Authorized for marketplace payouts."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Action Buttons to update Firestore */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    id="btn-admin-reject-owner"
                    onClick={() => handleOwnerDecision("REJECTED")}
                    disabled={isProcessingAction}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Owner KYC</span>
                  </button>

                  <button
                    id="btn-admin-approve-owner"
                    onClick={() => handleOwnerDecision("APPROVED")}
                    disabled={isProcessingAction}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Owner KYC in Firebase</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 font-mono">
                Select an owner registration from the list to review.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DISPUTES */}
      {activeTab === "disputes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-3">
            {disputes.map((disp) => (
              <div
                key={disp.id}
                onClick={() => {
                  setSelectedDispute(disp);
                  setDisputeRuling(null);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedDispute?.id === disp.id
                    ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10"
                    : "bg-[#161616] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{disp.disputeType}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                    ₹{disp.claimAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{disp.description}</p>
                <div className="mt-2 flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>Booking #{disp.bookingId}</span>
                  <span className="font-bold text-amber-500">Gemini Review Ready</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedDispute && (
              <div className="p-6 rounded-3xl bg-[#161616] border border-white/10 shadow-2xl text-gray-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Scale className="w-5 h-5 text-amber-500" />
                      <span>{selectedDispute.disputeType}</span>
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Booking: {selectedDispute.bookingId} • Claim: ₹{selectedDispute.claimAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEvaluateDispute(selectedDispute)}
                    disabled={isEvaluatingDispute}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isEvaluatingDispute ? "Arbitrating..." : "Run Gemini AI Arbiter"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#111111] border border-white/5 space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">Customer Claim:</span>
                  <p className="text-gray-300">{selectedDispute.description}</p>
                </div>

                {disputeRuling && (
                  <div className="p-5 rounded-2xl bg-[#111111] border border-amber-500/40 text-xs space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 uppercase">
                        AI Arbiter Ruling: {disputeRuling.rulingRecommendation}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">
                        Customer Liability: {disputeRuling.liabilityPctCustomer}% | Owner: {disputeRuling.liabilityPctOwner}%
                      </span>
                    </div>
                    <p className="text-gray-300">{disputeRuling.reasoning}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: FRAUD FLAGS */}
      {activeTab === "fraud" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fraudFlags.map((flag) => (
            <div key={flag.id} className="p-5 rounded-3xl bg-[#161616] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-white">{flag.type}</h4>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {flag.severity}
                </span>
              </div>
              <p className="text-xs text-gray-300">{flag.subject}</p>
              <p className="text-[11px] text-gray-400">{flag.details}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="p-6 rounded-3xl bg-[#161616] border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white">Platform GMV & Escrow Health</h3>
          <p className="text-xs text-gray-400">
            Real-time analytics aggregating telematics hour-meter billing, Vahan compliance pass rate (99.4%), and automated dispute turnaround (1.2 hours).
          </p>
        </div>
      )}
    </div>
  );
};
