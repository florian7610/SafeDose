export type MedicationStatus = "active" | "interaction" | "paused";
export type InteractionSeverity = "HIGH" | "MODERATE" | "LOW";

// Entity models (database level)
export interface UserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "patient";
}

export interface MedicationEntity {
  id: string;
  userId: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  status: MedicationStatus;
  rxcui: string;
  takenToday: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InteractionEntity {
  id: string;
  userId: string;
  drugIds: string[];
  severity: InteractionSeverity;
  summary: string;
  recommendation: string;
  fdaSource: string;
  reviewed: boolean;
  createdAt: string;
}

// Standard error model
export interface StandardErrorModel {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    traceId: string;
    timestamp: string;
  };
}

// Request DTOs
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
}

export interface CreateMedicationRequestDto {
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  rxcui: string;
}

export interface UpdateUserProfileRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "patient";
}

export interface UpdateMedicationRequestDto {
  dosage?: string;
  frequency?: string;
  scheduleTime?: string;
  status?: MedicationStatus;
  takenToday?: boolean;
}

// Response DTOs
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
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  status: MedicationStatus;
  rxcui: string;
  takenToday: boolean;
}

export interface InteractionResponseDto {
  id: string;
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

// Frontend view models
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

export interface ApiEndpointContract {
  endpoint: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  authRequired: boolean;
  requestDto: string;
  responseDto: string;
  statusCodes: Array<{
    code: number;
    meaning: string;
  }>;
}
