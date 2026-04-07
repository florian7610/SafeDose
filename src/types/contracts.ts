// src/types/contracts.ts
// ─── Status / severity enums ────────────────────────────────────────────────

export type MedicationStatus   = "active" | "interaction" | "stopped";
export type InteractionSeverity = "HIGH" | "MODERATE" | "LOW";
export type RosterStatus        = "alert" | "warning" | "ok";

// ─── Entity models (mirror DB documents) ────────────────────────────────────

export interface UserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
<<<<<<< Updated upstream
  role: "admin" | "patient" | "caregiver";
}

/**
 * Patient = clinical profile. Exists independently of a login account.
 * hasAccount is true when linkedUserId is set (i.e. the patient registered).
 */
export interface PatientEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  hasAccount: boolean;
  notes: string;
  createdAt: string;
=======
  phoneNumber: string;
  address: string;
  role: "admin" | "patient";
>>>>>>> Stashed changes
}

export interface MedicationEntity {
  id: string;
  patientId: string;      // Patient._id — never User._id
  addedBy: string | null; // User._id of whoever created this record
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  status: MedicationStatus;
  rxcui: string;
  dosesPerDay: number;       // total doses required per occurrence day (1, 2, or 3)
  takenIndices: number[];    // which dose slots have been taken today (auto-resets at midnight)
  takenToday: boolean;       // computed: takenIndices.length === dosesPerDay
  startDate: string;
  endDate: string | null;  // null when isOngoing
  isOngoing: boolean;
  stoppedAt: string | null; // ISO timestamp set when status → "stopped"
  createdAt: string;
  updatedAt: string;
}

export interface InteractionEntity {
  id: string;
  patientId: string;
  drugIds: string[];
  severity: InteractionSeverity;
  summary: string;
  recommendation: string;
  fdaSource: string;
  reviewed: boolean;
  createdAt: string;
}

// ─── Caregiver roster ───────────────────────────────────────────────────────

export interface RosterPatient {
  patientId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  hasAccount: boolean;       // false = caregiver-managed, no login
  notes: string;
  rosterStatus: RosterStatus;
  activeMedCount: number;
  takenToday: number;
  missedToday: number;
  interactionCount: number;
  assignedAt: string | null;
}

export interface CaregiverDashboardResponse {
  summary: {
    totalPatients: number;
    patientsWithAlerts: number;
    patientsWithWarnings: number;
    patientsOnTrack: number;
  };
  roster: RosterPatient[];
}

// ─── Request DTOs ────────────────────────────────────────────────────────────

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
<<<<<<< Updated upstream
  role?: "patient" | "caregiver";
=======
  phoneNumber: string;
  address: string;
>>>>>>> Stashed changes
}

export interface CreateMedicationRequestDto {
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  rxcui: string;
<<<<<<< Updated upstream
  startDate: string;       // ISO date string e.g. "2024-01-10"
  endDate: string | null;  // null when isOngoing
  isOngoing: boolean;
=======
}

export interface UpdateUserProfileRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: "admin" | "patient";
>>>>>>> Stashed changes
}

export interface UpdateMedicationRequestDto {
  dosage?: string;
  frequency?: string;
  scheduleTime?: string;
  status?: MedicationStatus;
  takenToday?: boolean;
  startDate?: string;
  endDate?: string | null;
  isOngoing?: boolean;
}

export interface UpdateUserProfileRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "patient" | "caregiver";
}

/**
 * Create a new unlinked patient profile (no account required).
 * Used by caregivers for patients who don't use the app themselves.
 */
export interface CreatePatientRequestDto {
  mode: "create";
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
  notes?: string;
}

/**
 * Link a caregiver to an existing registered patient by email.
 */
export interface LinkPatientRequestDto {
  mode: "link";
  email: string;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface AuthResponseDto {
  tokenType: "Bearer";
  accessToken: string;
  expiresInSeconds: number;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "patient" | "caregiver";
  };
}

export interface MedicationResponseDto {
  id: string;
  patientId: string;
  addedBy: string | null;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  status: MedicationStatus;
  rxcui: string;
  takenToday: boolean;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
}

export interface InteractionResponseDto {
  id: string;
  patientId: string;
  severity: InteractionSeverity;
  drugNames: string[];
  summary: string;
  recommendation: string;
  fdaSource: string;
  reviewed: boolean;
}

export interface DashboardSummaryResponseDto {
  activeMedicationCount: number;
  adherencePercent: number;
  activeInteractionCount: number;
  dosesDueToday: number;
}

// ─── Frontend view models ────────────────────────────────────────────────────

export interface MedicationViewModel {
  id: string;
  title: string;
  subtitle: string;
  timeLabel: string;
  badgeText: string;
  badgeVariant: "safe" | "warn" | "danger";
  takenToday: boolean;
}

export interface InteractionViewModel {
  id: string;
  pairLabel: string;
  severityLabel: string;
  summary: string;
  recommendation: string;
  severityVariant: "high" | "moderate" | "low";
  reviewed: boolean;
}

export interface DashboardStatViewModel {
  id: string;
  label: string;
  value: string;
  trendLabel: string;
  trendVariant: "up" | "down" | "neutral";
}

// ─── API contract descriptor ─────────────────────────────────────────────────

export interface ApiEndpointContract {
  endpoint: string;
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  authRequired: boolean;
  requestDto: string;
  responseDto: string;
  statusCodes: { code: number; meaning: string }[];
}

// ─── Error model ─────────────────────────────────────────────────────────────

export interface StandardErrorModel {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    traceId: string;
    timestamp: string;
  };
}