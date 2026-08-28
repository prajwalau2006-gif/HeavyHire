import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  onSnapshot,
} from "../firebase";
import { Equipment, OwnerRegistration, Booking } from "../types";
import { initialEquipmentList } from "../mockData";

const EQUIPMENT_COLLECTION = "equipment_listings";
const OWNER_REG_COLLECTION = "owner_registrations";
const BOOKINGS_COLLECTION = "bookings";

// Initial seed helper to populate Firestore if empty
export async function seedInitialFirestoreData() {
  try {
    const snap = await getDocs(collection(db, EQUIPMENT_COLLECTION));
    if (snap.empty) {
      console.log("Seeding initial equipment to Firestore...");
      for (const eq of initialEquipmentList) {
        const itemWithStatus: Equipment = {
          ...eq,
          verificationStatus: eq.verified ? "APPROVED" : "PENDING",
          documents: [
            {
              id: `doc-${eq.id}-rc`,
              type: "RC_BOOK",
              name: `RC_Book_${eq.rcNumber}.pdf`,
              url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
              uploadedAt: "2026-08-20",
              status: "VERIFIED",
              fileSize: "1.8 MB",
            },
            {
              id: `doc-${eq.id}-ins`,
              type: "INSURANCE",
              name: `Commercial_Insurance_${eq.id}.pdf`,
              url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
              uploadedAt: "2026-08-20",
              status: "VERIFIED",
              fileSize: "2.4 MB",
            },
            {
              id: `doc-${eq.id}-fit`,
              type: "FITNESS_CERT",
              name: `RTO_Fitness_Certificate_${eq.rcNumber}.pdf`,
              url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
              uploadedAt: "2026-08-20",
              status: "VERIFIED",
              fileSize: "1.2 MB",
            },
          ],
        };
        await setDoc(doc(db, EQUIPMENT_COLLECTION, eq.id), itemWithStatus);
      }

      // Seed sample owner registrations
      const sampleOwners: OwnerRegistration[] = [
        {
          id: "owner-reg-101",
          ownerName: "Sri Manjunatha Earthmovers & Infra",
          companyName: "Manjunatha Fleet Logistics LLP",
          phone: "+91 98450 12389",
          email: "manjunatha.infra@heavyhire.in",
          gstin: "29AABCM9812K1Z9",
          panNumber: "AABCM9812K",
          address: "Heavy Yard 14, Outer Ring Road, Mahadevapura",
          city: "Bengaluru",
          state: "Karnataka",
          verificationStatus: "APPROVED",
          verifiedAt: "2026-08-15",
          adminNotes: "Parivahan database matched. GST active.",
          createdAt: "2026-08-10",
          documents: [
            {
              id: "doc-owner-101-gst",
              type: "OWNER_AADHAAR_GST",
              name: "GST_Certificate_29AABCM.pdf",
              url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
              uploadedAt: "2026-08-10",
              status: "VERIFIED",
              fileSize: "1.4 MB",
            },
          ],
        },
        {
          id: "owner-reg-102",
          ownerName: "Cauvery Farm & Agro Logistics",
          companyName: "Cauvery Agro Fleet Services",
          phone: "+91 98860 44910",
          email: "cauvery.agro@heavyhire.in",
          gstin: "29ABCDE1234F1Z5",
          panNumber: "ABCDE1234F",
          address: "Near Sugar Factory Road, Mandya Central",
          city: "Mandya",
          state: "Karnataka",
          verificationStatus: "APPROVED",
          verifiedAt: "2026-08-18",
          adminNotes: "Mandya District RTO verified.",
          createdAt: "2026-08-14",
          documents: [
            {
              id: "doc-owner-102-rc",
              type: "RC_BOOK",
              name: "Mandya_Fleet_Registration.pdf",
              url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
              uploadedAt: "2026-08-14",
              status: "VERIFIED",
              fileSize: "2.1 MB",
            },
          ],
        },
        {
          id: "owner-reg-103",
          ownerName: "Sahyadri Heavy Rigs & Cranes",
          companyName: "Sahyadri Infra Projects Pvt Ltd",
          phone: "+91 97410 99881",
          email: "sahyadri.rigs@heavyhire.in",
          gstin: "29XYZAB8899C1Z2",
          panNumber: "XYZAB8899C",
          address: "Gokul Road Industrial Estate",
          city: "Hubballi",
          state: "Karnataka",
          verificationStatus: "PENDING",
          createdAt: "2026-08-26",
          documents: [
            {
              id: "doc-owner-103-rc",
              type: "RC_BOOK",
              name: "Hubli_Crane_Fleet_RC.pdf",
              url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
              uploadedAt: "2026-08-26",
              status: "PENDING_VERIFICATION",
              fileSize: "3.2 MB",
            },
            {
              id: "doc-owner-103-ins",
              type: "INSURANCE",
              name: "Heavy_Hydra_Insurance_Policy.pdf",
              url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
              uploadedAt: "2026-08-26",
              status: "PENDING_VERIFICATION",
              fileSize: "2.8 MB",
            },
          ],
        },
      ];

      for (const owner of sampleOwners) {
        await setDoc(doc(db, OWNER_REG_COLLECTION, owner.id), owner);
      }
    }
  } catch (err) {
    console.warn("Firestore seed note:", err);
  }
}

// 1. Subscribe to Equipment listings from Firestore
export function subscribeToEquipment(callback: (equipments: Equipment[]) => void) {
  const q = collection(db, EQUIPMENT_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: Equipment[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Equipment);
        });
        callback(list);
      } else {
        callback(initialEquipmentList);
      }
    },
    (err) => {
      console.warn("Firestore equipment subscription error, falling back to local:", err);
      callback(initialEquipmentList);
    }
  );
}

// 2. Save/Register Equipment into Firestore
export async function saveEquipmentToFirebase(equipment: Equipment): Promise<boolean> {
  try {
    await setDoc(doc(db, EQUIPMENT_COLLECTION, equipment.id), equipment);
    return true;
  } catch (error) {
    console.error("Failed to save equipment in Firestore:", error);
    return false;
  }
}

// 3. Update Equipment Verification Status (Admin role)
export async function updateEquipmentVerificationInFirebase(
  equipmentId: string,
  status: "APPROVED" | "REJECTED",
  remarks?: string
): Promise<boolean> {
  try {
    const ref = doc(db, EQUIPMENT_COLLECTION, equipmentId);
    await updateDoc(ref, {
      verificationStatus: status,
      verified: status === "APPROVED",
      adminRemarks: remarks || (status === "APPROVED" ? "Vahan & RTO OCR verified by Admin" : "Rejected due to invalid documents"),
      verifiedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Failed to update equipment verification:", error);
    return false;
  }
}

// 4. Subscribe to Owner Registrations (Admin role)
export function subscribeToOwnerRegistrations(callback: (owners: OwnerRegistration[]) => void) {
  const q = collection(db, OWNER_REG_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const list: OwnerRegistration[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as OwnerRegistration);
      });
      callback(list);
    },
    (err) => {
      console.warn("Firestore owner reg subscription error:", err);
    }
  );
}

// 5. Register New Equipment Owner into Firebase
export async function registerOwnerInFirebase(owner: OwnerRegistration): Promise<boolean> {
  try {
    await setDoc(doc(db, OWNER_REG_COLLECTION, owner.id), owner);
    return true;
  } catch (error) {
    console.error("Failed to register owner in Firestore:", error);
    return false;
  }
}

// 6. Update Owner Verification Status (Admin role)
export async function updateOwnerVerificationInFirebase(
  ownerId: string,
  status: "APPROVED" | "REJECTED",
  adminNotes?: string
): Promise<boolean> {
  try {
    const ref = doc(db, OWNER_REG_COLLECTION, ownerId);
    await updateDoc(ref, {
      verificationStatus: status,
      verifiedAt: new Date().toISOString(),
      adminNotes: adminNotes || (status === "APPROVED" ? "KYC & GST verified by Admin" : "Rejected"),
    });
    return true;
  } catch (error) {
    console.error("Failed to update owner verification in Firestore:", error);
    return false;
  }
}

// 7. Save Booking into Firebase
export async function saveBookingToFirebase(booking: Booking): Promise<boolean> {
  try {
    await setDoc(doc(db, BOOKINGS_COLLECTION, booking.id), booking);
    return true;
  } catch (error) {
    console.error("Failed to save booking in Firestore:", error);
    return false;
  }
}
