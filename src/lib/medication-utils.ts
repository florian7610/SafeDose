// src/lib/medication-utils.ts
import type { MedicationEntity } from "@/types/contracts";

// ─── Frequency options ────────────────────────────────────────────────────────

export const FREQUENCY_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Every 2 days",
  "Every 3 days",
  "Once a week",
  "Twice a week",
  "As needed (PRN)",
] as const;

export type FrequencyOption = (typeof FREQUENCY_OPTIONS)[number];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// ─── Active date-window check ─────────────────────────────────────────────────

/**
 * True if today falls within the medication's start/end date window.
 * Does NOT consider frequency — call isDueToday for the full check.
 */
export function isActiveToday(
  med: Pick<MedicationEntity, "startDate" | "endDate" | "isOngoing">
): boolean {
  const today = startOfDay(new Date());

  if (med.startDate) {
    const start = startOfDay(new Date(med.startDate));
    if (start > today) return false;
  }

  if (med.isOngoing) return true;
  if (!med.endDate) return true;

  const end = startOfDay(new Date(med.endDate));
  return end >= today;
}

// ─── Frequency-aware due-today check ─────────────────────────────────────────

/**
 * True if the medication should be taken today based on its frequency and
 * start date.
 *
 * Logic:
 *  - "Once/Twice/Three times daily" → always due (every day)
 *  - "Every N days" → due when (daysSinceStart % N === 0)
 *  - "Once a week" → due when daysSinceStart % 7 === 0
 *  - "Twice a week" → due on start-day and start-day+3 (e.g. Mon + Thu)
 *  - "As needed (PRN)" → never shown in today's doses list
 *  - Unknown string → shown (fail-safe)
 */
export function isDueToday(
  med: Pick<MedicationEntity, "startDate" | "endDate" | "isOngoing" | "frequency" | "status">
): boolean {
  if (med.status === "stopped") return false;
  if (!isActiveToday(med)) return false;

  const freq = med.frequency.trim().toLowerCase();

  if (freq === "as needed (prn)" || freq === "as needed") return false;

  if (
    freq === "once daily" ||
    freq === "twice daily" ||
    freq === "three times daily" ||
    freq.includes("daily")
  ) return true;

  // Interval-based: anchor on startDate
  const today = startOfDay(new Date());
  const start = med.startDate ? startOfDay(new Date(med.startDate)) : today;
  const daysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (freq === "every 2 days") return daysSinceStart % 2 === 0;
  if (freq === "every 3 days") return daysSinceStart % 3 === 0;
  if (freq === "once a week" || freq === "weekly") return daysSinceStart % 7 === 0;
  if (freq === "twice a week") {
    const mod = daysSinceStart % 7;
    return mod === 0 || mod === 3;
  }

  return true; // unknown frequency — show it as a fail-safe
}

// ─── Dose-count helpers ───────────────────────────────────────────────────────

/**
 * How many individual doses per occurrence day this frequency requires.
 * "Twice daily" → 2 checkboxes, "Three times daily" → 3, everything else → 1.
 */
export function dosesPerDay(frequency: string): number {
  const f = frequency.trim().toLowerCase();
  if (f === "twice daily") return 2;
  if (f === "three times daily") return 3;
  return 1;
}

/**
 * Parse takenDoses string "YYYY-MM-DD:0,1" → array of taken indices for today.
 * Returns [] if null, empty, or stale (date doesn't match today).
 */
export function parseTakenIndices(takenDoses: string | null, today: string): number[] {
  if (!takenDoses) return [];
  const colonIdx = takenDoses.indexOf(":");
  if (colonIdx === -1) return [];
  const date = takenDoses.slice(0, colonIdx);
  if (date !== today) return []; // stale — auto-reset
  const rest = takenDoses.slice(colonIdx + 1);
  if (!rest) return [];
  return rest.split(",").map(Number).filter((n) => !isNaN(n));
}

/**
 * Produce a new takenDoses string after toggling one dose index.
 */
export function toggleTakenIndex(
  takenDoses: string | null,
  today: string,
  doseIndex: number,
  taken: boolean
): string | null {
  const current = parseTakenIndices(takenDoses, today);
  const next = taken
    ? [...new Set([...current, doseIndex])]
    : current.filter((i) => i !== doseIndex);
  next.sort((a, b) => a - b);
  return next.length > 0 ? `${today}:${next.join(",")}` : null;
}

// ─── History check ────────────────────────────────────────────────────────────

/**
 * True if the medication should appear in the history section:
 *  - Explicitly stopped by the patient/caregiver
 *  - Course ended (non-ongoing with endDate in the past)
 */
export function isInHistory(
  med: Pick<MedicationEntity, "status" | "endDate" | "isOngoing">
): boolean {
  if (med.status === "stopped") return true;
  if (!med.isOngoing && med.endDate) {
    const today = startOfDay(new Date());
    const end = startOfDay(new Date(med.endDate));
    return end < today;
  }
  return false;
}
