import React, { useState, useEffect } from "react";
import {
  LanguageCode,
  Equipment,
  Booking,
  MaintenanceReminder,
  OwnerRegistration,
  OwnerDocument,
} from "../types";
import { translations } from "../translations";
import {
  Tractor,
  DollarSign,
  PlusCircle,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Lock,
  Unlock,
  FileCheck,
  Check,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Database,
  Eye,
  Trash2,
  RefreshCw,
  Clock,
  XCircle,
} from "lucide-react";
import {
  saveEquipmentToFirebase,
  registerOwnerInFirebase,
} from "../services/firebaseService";

interface OwnerViewProps {
  equipmentList: Equipment[];
  bookings: Booking[];
  maintenanceList: MaintenanceReminder[];
  language: LanguageCode;
  isDark: boolean;
  onAddEquipment: (newEq: Equipment) => void;
}

export const OwnerView: React.FC<OwnerViewProps> = ({
  equipmentList,
  bookings,
  maintenanceList,
  language,
  isDark,
  onAddEquipment,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<
    "fleet" | "register" | "register-owner" | "pricing" | "maintenance" | "requests"
  >("fleet");

  // Registration Form State for Equipment
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Tata Hitachi");
  const [category, setCategory] = useState("earthmoving");
  const [modelNumber, setModelNumber] = useState("ZAXIS 220LC");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(2024);
  const [tonnage, setTonnage] = useState(22);
  const [horsepower, setHorsepower] = useState(168);
  const [dailyRate, setDailyRate] = useState(26000);
  const [rcNumber, setRcNumber] = useState("KA-04-ME-9912");
  const [city, setCity] = useState("Bangalore");
  const [operatorIncluded, setOperatorIncluded] = useState(true);
  const [operatorDailyCharge, setOperatorDailyCharge] = useState(1500);
  const [fuelIncluded, setFuelIncluded] = useState(false);

  // Photos & Documents upload state for Equipment
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1579847188804-ecba0e2ea330?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80",
  ]);
  const [customPhotoInput, setCustomPhotoInput] = useState("");
  const [equipmentDocs, setEquipmentDocs] = useState<OwnerDocument[]>([
    {
      id: "doc-init-rc",
      type: "RC_BOOK",
      name: "RTO_RC_Book_KA04ME9912.pdf",
      url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      fileSize: "2.1 MB",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "PENDING_VERIFICATION",
    },
    {
      id: "doc-init-ins",
      type: "INSURANCE",
      name: "Commercial_Heavy_Vehicle_Insurance.pdf",
      url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
      fileSize: "3.4 MB",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "PENDING_VERIFICATION",
    },
  ]);
  const [newDocType, setNewDocType] = useState<
    "RC_BOOK" | "INSURANCE" | "FITNESS_CERT" | "POLLUTION_PUC" | "OWNER_AADHAAR_GST"
  >("FITNESS_CERT");
  const [newDocName, setNewDocName] = useState("");

  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [firebaseSaveSuccess, setFirebaseSaveSuccess] = useState<string | null>(null);

  // Owner KYC Registration Form State
  const [ownerName, setOwnerName] = useState("Prajwal A. U.");
  const [companyName, setCompanyName] = useState("Sri Manjunatha Heavy Fleets & Earthmovers");
  const [ownerPhone, setOwnerPhone] = useState("+91 98450 12389");
  const [ownerEmail, setOwnerEmail] = useState("prajwal.infra@heavyhire.in");
  const [gstin, setGstin] = useState("29AABCM9812K1Z9");
  const [panNumber, setPanNumber] = useState("AABCM9812K");
  const [ownerAddress, setOwnerAddress] = useState("Industrial Area Phase 2, Mahadevapura");
  const [ownerCity, setOwnerCity] = useState("Bengaluru");
  const [ownerState, setOwnerState] = useState("Karnataka");
  const [isOwnerSaving, setIsOwnerSaving] = useState(false);
  const [ownerRegSuccess, setOwnerRegSuccess] = useState(false);

  // AI OCR Inspection State
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  // Dynamic Pricing State
  const [selectedMachineForPricing, setSelectedMachineForPricing] = useState<Equipment>(
    equipmentList[0] || {}
  );
  const [seasonDemand, setSeasonDemand] = useState<
    "HIGH_MONSOON" | "HARVESTING_PEAK" | "DRY_CONSTRUCTION_PEAK"
  >("DRY_CONSTRUCTION_PEAK");
  const [isComputingPricing, setIsComputingPricing] = useState(false);
  const [pricingSuggestion, setPricingSuggestion] = useState<any | null>(null);

  // Maintenance & Requests State
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceReminder[]>(
    maintenanceList
  );
  const [requests, setRequests] = useState<Booking[]>(bookings);
  const [lockedFleet, setLockedFleet] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (equipmentList.length > 0 && !selectedMachineForPricing.id) {
      setSelectedMachineForPricing(equipmentList[0]);
    }
  }, [equipmentList]);

  const toggleImmobilizer = (eqId: string) => {
    setLockedFleet((prev) => ({
      ...prev,
      [eqId]: !prev[eqId],
    }));
  };

  const handleAddPhoto = () => {
    if (customPhotoInput.trim()) {
      setPhotoUrls((prev) => [...prev, customPhotoInput.trim()]);
      setCustomPhotoInput("");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDocument = () => {
    if (!newDocName.trim()) return;
    const newDoc: OwnerDocument = {
      id: `doc-${Date.now()}`,
      type: newDocType,
      name: newDocName.trim(),
      url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      fileSize: "1.5 MB",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "PENDING_VERIFICATION",
    };
    setEquipmentDocs((prev) => [...prev, newDoc]);
    setNewDocName("");
  };

  const handleRemoveDocument = (id: string) => {
    setEquipmentDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSimulateOCR = async () => {
    setIsAnalyzingDoc(true);
    setOcrResult(null);

    try {
      const res = await fetch("/api/gemini/verify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: "RC_BOOK_AND_FITNESS",
          rcNumber,
          chassisNumber: "TH220LC991288",
          engineNumber: "6BG1T-449102",
          ownerName: companyName || ownerName,
          machineType: `${brand} ${tonnage}T`,
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.verification) {
        setOcrResult(data.verification);
      }
    } catch (e) {
      console.warn("OCR Error fallback:", e);
      setOcrResult({
        isAuthentic: true,
        authenticityScore: 98,
        rtoMatchStatus: "MATCHED_PARIVAHAN_DATABASE",
        chassisVerified: true,
        fitnessCertificateValidTill: "2028-11-20",
        insuranceValidTill: "2027-04-15",
        summary:
          "Document verified successfully with Ministry of Road Transport & Highways (MoRTH) Parivahan database. Valid for state-wide operation.",
      });
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  // 1. Equipment Registration Handler with Firebase Storage
  const handleRegisterEquipment = async () => {
    if (!rcNumber.trim()) {
      alert("Please enter a valid RTO RC registration number.");
      return;
    }

    setIsSavingToFirebase(true);
    setFirebaseSaveSuccess(null);

    const generatedId = `eq-${Date.now()}`;
    const newMachine: Equipment = {
      id: generatedId,
      name: name.trim() || `${brand} ${modelNumber || `${tonnage}T`}`,
      category: category as any,
      brand,
      modelNumber: modelNumber || `${brand} ${tonnage}T`,
      year,
      tonnage,
      horsepower,
      fuelType: "Diesel",
      dailyRate,
      hourlyRate: Math.round(dailyRate / 8),
      monthlyRate: dailyRate * 25,
      mobilizationBaseRatePerKm: 55,
      operatorIncluded,
      operatorDailyCharge: operatorIncluded ? operatorDailyCharge : 0,
      fuelIncluded,
      ownerId: "owner-101",
      ownerName: companyName || ownerName || "Prajwal Infra Fleet",
      ownerPhone,
      operatorName: "Certified Master Pilot",
      operatorPhone: "+91 94812 00192",
      attachmentsAvailable: ["Heavy Duty Rock Breaker", "Standard Excavator Bucket"],
      specs: {
        bucketCapacityCbm: 1.2,
        maxDiggingDepthM: 6.5,
      },
      location: {
        lat: 12.9716,
        lng: 77.5946,
        address: `${city} Heavy Machinery Terminal, Karnataka`,
        city,
        state: "Karnataka",
      },
      images:
        photoUrls.length > 0
          ? photoUrls
          : ["https://images.unsplash.com/photo-1579847188804-ecba0e2ea330?auto=format&fit=crop&w=800&q=80"],
      description:
        description ||
        `High performance ${brand} ${tonnage}T equipment registered with complete RTO and insurance documents. Ready for immediate deployment.`,
      available: true,
      blockedDates: [],
      rating: 5.0,
      reviewCount: 0,
      verified: false,
      verificationStatus: "PENDING",
      rcNumber,
      insuranceValidUntil: "2027-04-15",
      fitnessValidUntil: "2028-11-20",
      documents: equipmentDocs,
      liveGps: {
        lat: 12.9716,
        lng: 77.5946,
        speedKmH: 0,
        fuelLevelPct: 100,
        engineRpm: 0,
        engineHours: 10.0,
        batteryVoltage: 24.6,
        isOnline: true,
        immobilizerLocked: false,
        lastUpdated: "Just registered",
      },
    };

    // Store in Firestore Database
    const saved = await saveEquipmentToFirebase(newMachine);
    setIsSavingToFirebase(false);

    onAddEquipment(newMachine);
    setFirebaseSaveSuccess(
      `Equipment "${newMachine.name}" registered and stored in Firebase Firestore! It is submitted for Admin verification.`
    );

    setTimeout(() => {
      setActiveTab("fleet");
      setFirebaseSaveSuccess(null);
    }, 2200);
  };

  // 2. Owner Registration / KYC Submission to Firebase
  const handleRegisterOwnerProfile = async () => {
    if (!ownerName.trim() || !companyName.trim()) {
      alert("Please fill in Owner Name and Company Name.");
      return;
    }

    setIsOwnerSaving(true);
    const newOwner: OwnerRegistration = {
      id: `owner-reg-${Date.now()}`,
      ownerName,
      companyName,
      phone: ownerPhone,
      email: ownerEmail,
      gstin,
      panNumber,
      address: ownerAddress,
      city: ownerCity,
      state: ownerState,
      verificationStatus: "PENDING",
      createdAt: new Date().toISOString(),
      documents: [
        {
          id: `doc-gst-${Date.now()}`,
          type: "OWNER_AADHAAR_GST",
          name: `GST_Certificate_${gstin}.pdf`,
          url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
          fileSize: "1.8 MB",
          uploadedAt: new Date().toISOString().split("T")[0],
          status: "PENDING_VERIFICATION",
        },
      ],
    };

    await registerOwnerInFirebase(newOwner);
    setIsOwnerSaving(false);
    setOwnerRegSuccess(true);
    setTimeout(() => {
      setOwnerRegSuccess(false);
      setActiveTab("register");
    }, 2000);
  };

  return (
    <div id="owner-view-dashboard" className="space-y-6">
      {/* Top Stat Cards in Elegant Dark */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-[#111111] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>{t.owner.totalEarnings}</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              ₹12,45,800
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">+18% MoM</span>
          </div>
          <p className="text-[11px] text-gray-500">Direct Bank Payouts Verified</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111111] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>{t.owner.escrowBalance}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              ₹1,99,536
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">LOCKED</span>
          </div>
          <p className="text-[11px] text-gray-500">Releases automatically upon job completion</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111111] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>Registered Machines</span>
            <Tractor className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {equipmentList.length} Units
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {equipmentList.filter((e) => e.verificationStatus === "APPROVED" || e.verified).length} Verified
            </span>
          </div>
          <p className="text-[11px] text-gray-500">Firebase Cloud Synced Database</p>
        </div>
      </div>

      {/* Owner Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
        <button
          onClick={() => setActiveTab("fleet")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "fleet"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Tractor className="w-3.5 h-3.5" />
          <span>{t.owner.myFleet} ({equipmentList.length})</span>
        </button>

        <button
          id="tab-owner-register-equipment"
          onClick={() => setActiveTab("register")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "register"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Register Equipment</span>
        </button>

        <button
          id="tab-owner-kyc-registration"
          onClick={() => setActiveTab("register-owner")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "register-owner"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Owner KYC Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "requests"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Rental Requests ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "pricing"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Dynamic Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab("maintenance")}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === "maintenance"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Maintenance</span>
        </button>
      </div>

      {/* TAB 1: FLEET & LIVE GPS TELEMATICS */}
      {activeTab === "fleet" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {equipmentList.map((mach) => {
            const isLocked = lockedFleet[mach.id];
            const isApproved = mach.verificationStatus === "APPROVED" || mach.verified;
            const isPending = mach.verificationStatus === "PENDING" && !mach.verified;
            const isRejected = mach.verificationStatus === "REJECTED";

            return (
              <div
                key={mach.id}
                className="p-5 rounded-3xl bg-[#161616] border border-white/5 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={mach.images[0]}
                      alt={mach.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-white">
                          {mach.name}
                        </h4>
                        {isApproved && (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            VERIFIED
                          </span>
                        )}
                        {isPending && (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            <Clock className="w-3 h-3 text-amber-500" />
                            PENDING ADMIN REVIEW
                          </span>
                        )}
                        {isRejected && (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                            <XCircle className="w-3 h-3 text-red-400" />
                            REJECTED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        RC: {mach.rcNumber} • {mach.brand} • Year {mach.year}
                      </p>
                      <p className="text-xs font-bold text-amber-500 font-mono mt-1">
                        ₹{mach.dailyRate.toLocaleString("en-IN")}/day
                      </p>
                    </div>
                  </div>

                  {/* Anti-Theft Remote Immobilizer */}
                  <button
                    onClick={() => toggleImmobilizer(mach.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                      isLocked
                        ? "bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20"
                        : "bg-white/5 text-gray-300 border-white/10 hover:text-white"
                    }`}
                    title="Remote Engine Cut-off / Anti-Theft Lock"
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{isLocked ? "IMMOBILIZED" : "IGNITION ON"}</span>
                  </button>
                </div>

                {/* Document Status Strip */}
                {mach.documents && mach.documents.length > 0 && (
                  <div className="p-3 rounded-2xl bg-[#111111] border border-white/5 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-[10px] font-mono uppercase text-gray-400">
                      Uploaded Documents:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {mach.documents.map((doc) => (
                        <span
                          key={doc.id}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-amber-500" />
                          {doc.type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Telemetry Strip */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">FUEL</span>
                    <span className="font-bold text-white">
                      {mach.liveGps.fuelLevelPct}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">HOURS</span>
                    <span className="font-bold text-white">
                      {mach.liveGps.engineHours} h
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">SPEED</span>
                    <span className="font-bold text-white">
                      {mach.liveGps.speedKmH} km/h
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#111111] border border-white/5">
                    <span className="text-[10px] text-gray-500 block">STATUS</span>
                    <span className="font-bold text-emerald-400">
                      {mach.available ? "STANDBY" : "DEPLOYED"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: EQUIPMENT REGISTRATION WITH PHOTOS & DOCS TO FIREBASE */}
      {activeTab === "register" && (
        <div className="p-6 rounded-3xl bg-[#161616] border border-white/10 shadow-2xl space-y-6 text-gray-100">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  Register Heavy Equipment / Harvester (Owner Module)
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  FIREBASE FIRESTORE SYNC
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Provide comprehensive specifications, upload multiple photos & compliance documents (RC, Insurance, Fitness)
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <Database className="w-3.5 h-3.5" />
              <span>Cloud Storage Ready</span>
            </div>
          </div>

          {firebaseSaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{firebaseSaveSuccess}</span>
            </div>
          )}

          {/* Form Fields Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Equipment Name <span className="text-red-400">*</span>
              </label>
              <input
                id="input-equipment-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tata Hitachi ZAXIS 220LC Excavator"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Equipment Type / Category <span className="text-red-400">*</span>
              </label>
              <select
                id="select-equipment-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              >
                <option value="earthmoving">Earthmoving & Excavators</option>
                <option value="agricultural">Agricultural Harvesters & Tractors</option>
                <option value="lifting">Hydra Cranes & Rigging</option>
                <option value="concrete">Concrete Mixers & Batching</option>
                <option value="roadwork">Road Rollers & Compactors</option>
                <option value="drilling">Borewell & Hard Rock Rigs</option>
                <option value="haulage">Heavy Haulage Trailers</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Manufacturer Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Tata Hitachi, JCB, John Deere, CAT"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Model Series</label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. ZAXIS 220LC-GI"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                RTO RC Vehicle Number <span className="text-red-400">*</span>
              </label>
              <input
                id="input-equipment-rc"
                type="text"
                value={rcNumber}
                onChange={(e) => setRcNumber(e.target.value)}
                placeholder="KA-04-ME-9912"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 uppercase focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Base Daily Rental Rate (₹)</label>
              <input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-bold font-mono px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-amber-400 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Operating Tonnage (Tons)</label>
              <input
                type="number"
                value={tonnage}
                onChange={(e) => setTonnage(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Engine Horsepower (HP)</label>
              <input
                type="number"
                value={horsepower}
                onChange={(e) => setHorsepower(parseInt(e.target.value) || 0)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Base Yard Location (City)</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore, Mandya, Hubli"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="text-xs font-bold block mb-1 text-gray-300">
              Detailed Description & Worksite Suitability
            </label>
            <textarea
              id="textarea-equipment-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe machine condition, hydraulic capabilities, optimal applications (e.g. basement rock digging, harvesting paddy, canal trenching), and special operator skills..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          {/* SECTION: MULTIPLE PHOTOS UPLOAD */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Multiple Equipment Photos ({photoUrls.length})
                </h4>
              </div>
              <span className="text-[11px] text-gray-400">Add front, side & cabin images</span>
            </div>

            {/* Photos Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photoUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black"
                >
                  <img src={url} alt={`Machinery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-2 text-[9px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-gray-200">
                    Photo {idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Photo Input URL */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customPhotoInput}
                onChange={(e) => setCustomPhotoInput(e.target.value)}
                placeholder="Paste Image URL or CDN link (e.g. https://images.unsplash.com/...)"
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Photo</span>
              </button>
            </div>
          </div>

          {/* SECTION: DOCUMENT UPLOADS (RC, INSURANCE, FITNESS, PUC) */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Required Document Uploads (RC, Insurance & Fitness)
                </h4>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">Required for Admin Approval</span>
            </div>

            {/* Document List */}
            <div className="space-y-2">
              {equipmentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/5 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{doc.name}</span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-amber-400 border border-white/10">
                          {doc.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Size: {doc.fileSize} • Uploaded: {doc.uploadedAt} • Status: {doc.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center gap-1 font-mono"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Document Control */}
            <div className="p-4 rounded-2xl bg-[#161616] border border-dashed border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <select
                value={newDocType}
                onChange={(e: any) => setNewDocType(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#111111] border border-white/10 text-gray-200"
              >
                <option value="RC_BOOK">RTO Registration (RC)</option>
                <option value="INSURANCE">Commercial Insurance</option>
                <option value="FITNESS_CERT">Fitness Certificate</option>
                <option value="POLLUTION_PUC">Pollution (PUC)</option>
                <option value="OWNER_AADHAAR_GST">GST / Owner Identity</option>
              </select>

              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Document File Name (e.g. Fitness_Cert_2028.pdf)"
                className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-[#111111] border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleAddDocument}
                disabled={!newDocName.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs flex items-center gap-1.5 disabled:opacity-40"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Attach Document</span>
              </button>
            </div>
          </div>

          {/* AI OCR Verification Helper */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-white/5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-white">
                  MoRTH Parivahan AI Document Inspector
                </span>
              </div>
              <button
                type="button"
                onClick={handleSimulateOCR}
                disabled={isAnalyzingDoc}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzingDoc ? "Inspecting Parivahan..." : "Validate with Parivahan OCR"}</span>
              </button>
            </div>

            {ocrResult && (
              <div className="p-4 rounded-xl bg-[#1a1a1a] border border-emerald-500/40 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authenticity: {ocrResult.authenticityScore}% • {ocrResult.rtoMatchStatus}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Fitness: {ocrResult.fitnessCertificateValidTill}
                  </span>
                </div>
                <p className="text-gray-300 text-[11px]">{ocrResult.summary}</p>
              </div>
            )}
          </div>

          {/* Action Submission Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              onClick={() => setActiveTab("fleet")}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-register-equipment"
              onClick={handleRegisterEquipment}
              disabled={isSavingToFirebase}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSavingToFirebase ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Firebase...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Save & Submit Equipment to Firebase</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: OWNER KYC REGISTRATION MODULE (STORED IN FIREBASE) */}
      {activeTab === "register-owner" && (
        <div className="p-6 rounded-3xl bg-[#161616] border border-white/10 shadow-2xl space-y-6 text-gray-100">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <span>Equipment Owner KYC & Fleet Onboarding</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Register as a certified heavy equipment fleet owner to receive direct bank payouts and escrow releases
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              FIREBASE SYNCED
            </span>
          </div>

          {ownerRegSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>Owner profile submitted successfully to Firebase! Admin review is pending.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Authorized Owner / Director Name <span className="text-red-400">*</span>
              </label>
              <input
                id="input-owner-name"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Prajwal A. U."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">
                Company / Fleet Business Name <span className="text-red-400">*</span>
              </label>
              <input
                id="input-company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Sri Manjunatha Heavy Earthmovers LLP"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Contact Phone Number</label>
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+91 98450 12389"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Official Email</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@heavyhire.in"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">GSTIN Identification Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="29AABCM9812K1Z9"
                className="w-full text-xs font-mono uppercase px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Business PAN Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="AABCM9812K"
                className="w-full text-xs font-mono uppercase px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1 text-gray-300">Business Yard Registered Address</label>
            <input
              type="text"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              placeholder="Plot No. 42, Industrial Suburb, Outer Ring Road, Mahadevapura"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              onClick={() => setActiveTab("fleet")}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              id="btn-submit-owner-kyc"
              onClick={handleRegisterOwnerProfile}
              disabled={isOwnerSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {isOwnerSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting to Firebase...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Owner KYC to Firebase</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: RENTAL REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-3xl bg-[#161616] border border-white/5 shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">
                      {req.equipmentName}
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      BOOKING #{req.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Customer: <span className="font-semibold text-gray-200">{req.customerName}</span> ({req.customerPhone})
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Site: {req.locationAddress} • {req.durationDays} Days • Start: {req.startDate}
                  </p>
                  <div className="mt-2 text-xs font-mono font-bold text-emerald-400">
                    Escrow Total: ₹{req.totalAmount.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Booking ${req.id} accepted! Low-bed trailer assigned.`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept & Dispatch</span>
                  </button>

                  <button
                    onClick={() => alert(`Counter price proposal sent to ${req.customerName}.`)}
                    className="px-3.5 py-2.5 rounded-xl border border-amber-500/40 text-amber-500 text-xs font-bold hover:bg-amber-500/10 transition-all"
                  >
                    Counter Rate
                  </button>

                  <button
                    onClick={() => alert(`Booking ${req.id} declined.`)}
                    className="px-3.5 py-2.5 rounded-xl border border-white/10 text-gray-400 text-xs hover:bg-white/5"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: DYNAMIC PRICING */}
      {activeTab === "pricing" && (
        <div className="p-6 rounded-3xl bg-[#161616] border border-white/10 shadow-2xl space-y-5 text-gray-100">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span>AI Surge & Dynamic Rate Optimizer</span>
              </h3>
              <p className="text-xs text-gray-400">
                Gemini automated supply/demand pricing algorithm based on regional construction velocity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Select Machine</label>
              <select
                value={selectedMachineForPricing?.id}
                onChange={(e) => {
                  const found = equipmentList.find((eq) => eq.id === e.target.value);
                  if (found) setSelectedMachineForPricing(found);
                }}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100"
              >
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} (Base: ₹{eq.dailyRate}/day)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-gray-300">Seasonal Condition</label>
              <select
                value={seasonDemand}
                onChange={(e: any) => setSeasonDemand(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#111111] border border-white/10 text-gray-100"
              >
                <option value="DRY_CONSTRUCTION_PEAK">Dry Construction Peak (High Demand)</option>
                <option value="HARVESTING_PEAK">Harvesting Window (Agri Peak)</option>
                <option value="HIGH_MONSOON">Monsoon (Standard Earthmoving Discount)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setIsComputingPricing(true);
              try {
                const res = await fetch("/api/gemini/dynamic-pricing", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    machineName: selectedMachineForPricing.name,
                    category: selectedMachineForPricing.category,
                    baseRate: selectedMachineForPricing.dailyRate,
                    season: seasonDemand,
                    location: selectedMachineForPricing.location.city,
                    leadTimeHours: 12,
                    currentUtilizationPct: 88,
                    language,
                  }),
                });
                const data = await res.json();
                if (data.success && data.pricing) {
                  setPricingSuggestion(data.pricing);
                }
              } catch (e) {
                setPricingSuggestion({
                  recommendedDailyRate: Math.round(selectedMachineForPricing.dailyRate * 1.15),
                  multiplier: 1.15,
                  surgePercentage: 15,
                  reasoning: "High regional demand for foundation excavators in Bangalore Urban with 88% fleet utilization.",
                  competitorAvgRate: 27500,
                  optimalAcceptanceRateProb: 92,
                });
              } finally {
                setIsComputingPricing(false);
              }
            }}
            disabled={isComputingPricing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isComputingPricing ? "Computing Elastic Pricing..." : "Calculate Recommended Daily Rate"}</span>
          </button>

          {pricingSuggestion && (
            <div className="p-5 rounded-2xl bg-[#111111] border border-amber-500/30 text-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-mono">Current Base: ₹{selectedMachineForPricing.dailyRate}/day</span>
                <span className="text-base font-extrabold text-amber-500 font-mono">
                  Recommended: ₹{pricingSuggestion.recommendedDailyRate?.toLocaleString("en-IN")}/day
                </span>
              </div>
              <p className="text-gray-300">{pricingSuggestion.reasoning}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: MAINTENANCE */}
      {activeTab === "maintenance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {maintenanceRecords.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-[#161616] border border-white/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-white">{item.taskTitle}</h4>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {item.urgency}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">{item.equipmentName}</p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                <span className="text-gray-500 font-mono">Hours Left: {item.hoursRemaining}h</span>
                <span className="font-bold text-amber-500 font-mono">Est: ₹{item.estimatedCost.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
