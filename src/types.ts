export type UserRole = "CUSTOMER" | "OWNER" | "ADMIN";

export type LanguageCode = "en" | "kn" | "hi";

export type EquipmentCategory =
  | "earthmoving"
  | "agricultural"
  | "concrete"
  | "lifting"
  | "drilling"
  | "haulage"
  | "roadwork";

export interface GeoLocation {
  lat: number;
  lng: number;
  city: string;
  state: string;
  address: string;
  district?: string;
}

export interface LiveGpsTelemetry {
  lat: number;
  lng: number;
  speedKmH: number;
  fuelLevelPct: number;
  engineHours: number;
  batteryVoltage: number;
  engineRpm: number;
  isOnline: boolean;
  immobilizerLocked: boolean;
  lastUpdated: string;
}

export interface OwnerDocument {
  id: string;
  type: "RC_BOOK" | "INSURANCE" | "FITNESS_CERT" | "POLLUTION_PUC" | "OWNER_AADHAAR_GST";
  name: string;
  url: string;
  fileSize?: string;
  uploadedAt: string;
  status: "VERIFIED" | "PENDING_VERIFICATION" | "REJECTED";
}

export interface OwnerRegistration {
  id: string;
  ownerName: string;
  companyName: string;
  phone: string;
  email: string;
  gstin?: string;
  panNumber?: string;
  address: string;
  city: string;
  state: string;
  documents: OwnerDocument[];
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  verifiedAt?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  modelNumber: string;
  year: number;
  tonnage?: number;
  horsepower: number;
  fuelType: "Diesel" | "Electric" | "Hybrid";
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  mobilizationBaseRatePerKm: number;
  operatorIncluded: boolean;
  operatorDailyCharge: number;
  fuelIncluded: boolean;
  location: GeoLocation;
  rating: number;
  reviewCount: number;
  verified: boolean;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  adminRemarks?: string;
  verifiedAt?: string;
  rcNumber: string;
  insuranceValidUntil: string;
  fitnessValidUntil: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  operatorName: string;
  operatorPhone: string;
  available: boolean;
  blockedDates: string[];
  attachmentsAvailable: string[];
  documents?: OwnerDocument[];
  specs: {
    maxDiggingDepthM?: number;
    bucketCapacityCbm?: number;
    liftingCapacityTons?: number;
    boomLengthM?: number;
    grainTankCapacityL?: number;
    cutterBarWidthM?: number;
    drumCapacityCbm?: number;
    compactionForceKn?: number;
    drillingDepthM?: number;
  };
  liveGps: LiveGpsTelemetry;
  images: string[];
  description: string;
}

export type BookingStatus =
  | "PENDING_APPROVAL"
  | "ACCEPTED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "WORKING_ON_SITE"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "ESCROW_HELD"
  | "MILESTONE_RELEASED"
  | "REFUNDED";

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  ownerId: string;
  ownerName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentImage: string;
  category: EquipmentCategory;
  locationAddress: string;
  locationCoords: { lat: number; lng: number };
  startDate: string;
  endDate: string;
  durationDays: number;
  requiresOperator: boolean;
  includeFuel: boolean;
  selectedAttachments: string[];
  baseRental: number;
  mobilizationCost: number;
  operatorCost: number;
  fuelCost: number;
  gstTax: number;
  securityDeposit: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "UPI" | "CARD" | "NETBANKING" | "ESCROW_WALLET";
  liveEtaMinutes?: number;
  distanceRemainingKm?: number;
  currentTransitCoords?: { lat: number; lng: number };
  createdAt: string;
  rating?: number;
  reviewText?: string;
  hourlyLogs?: { date: string; startEngineHours: number; endEngineHours: number; verified: boolean }[];
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderRole: UserRole | "OPERATOR";
  senderName: string;
  text: string;
  translatedText?: string;
  originalLanguage?: LanguageCode;
  timestamp: string;
  isVoiceNote?: boolean;
}

export interface MaintenanceReminder {
  id: string;
  equipmentId: string;
  equipmentName: string;
  category: string;
  taskTitle: string;
  urgency: "NORMAL" | "HIGH" | "CRITICAL";
  currentEngineHours: number;
  intervalHours: number;
  hoursRemaining: number;
  estimatedCost: number;
  dueDate: string;
  status: "PENDING" | "SCHEDULED" | "COMPLETED";
}

export interface DisputeCase {
  id: string;
  bookingId: string;
  customerName: string;
  ownerName: string;
  equipmentName: string;
  disputeType: "HOUR_METER_MISMATCH" | "MACHINE_BREAKDOWN" | "LATE_DELIVERY" | "DAMAGE_CLAIM" | "SITE_OBSTRUCTION";
  claimAmount: number;
  description: string;
  filedAt: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
  aiFraudScore: number;
  aiVerdict?: string;
  aiJustification?: string;
  aiRecommendedAction?: string;
  resolutionOutcome?: string;
}

export interface FraudFlag {
  id: string;
  type: "GEOFENCE_BREACH" | "FAKE_RC_DETECTION" | "UNUSUAL_RPM_SPIKE" | "DOUBLE_BOOKING_ATTEMPT" | "SUSPICIOUS_PAYMENT";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  subject: string;
  timestamp: string;
  details: string;
  status: "ACTIVE" | "CLEARED" | "ACTION_TAKEN";
}

export interface AIRecommendation {
  machineName: string;
  category: string;
  matchScore: number;
  recommendedAttachments: string[];
  reasoning: string;
  estimatedDays: number;
  estimatedHoursPerDay: number;
  fuelConsumptionEstimateLiters: number;
  suggestedCrew: string;
  costBreakdown: {
    baseRentalPerDay: number;
    mobilizationFreight: number;
    operatorChargePerDay: number;
    estimatedFuelCost: number;
    totalEstimate: number;
  };
  alternativeMachine?: string;
}
