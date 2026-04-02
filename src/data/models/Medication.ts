// src/data/models/Medication.ts
import mongoose from "mongoose";

/**
 * Medication belongs to a Patient profile, not a User account.
 *
 * patientId → Patient._id
 *   Always set. Works for both account-holding and account-less patients.
 *
 * addedBy → User._id
 *   Who created this record — could be the patient's own userId
 *   (when a registered patient adds it themselves) or a caregiver's userId.
 *   Useful for the UI label "Added by [name]".
 *
 * status:
 *   active      — being taken normally
 *   interaction — flagged by FDA interaction check; requires review
 *   paused      — soft-discontinued; kept for history, not shown as active
 */
const MedicationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name:         { type: String, required: true },
    genericName:  { type: String, required: true },
    dosage:       { type: String, required: true },
    frequency:    { type: String, required: true },
    scheduleTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "interaction", "stopped"],
      default: "active",
    },
    rxcui:     { type: String, default: "" },
    // Stores which individual doses were taken today.
    // Format: "YYYY-MM-DD:0,1,2" — date prefix + comma-separated dose indices.
    // If the date prefix doesn't match today the value is treated as empty
    // (auto-resets at midnight, no cron required).
    // e.g. "twice daily" has indices 0 and 1 — "2026-04-01:0" means only first taken.
    takenDoses: { type: String, default: null },

    // Duration fields
    // startDate   — when the patient first takes this medication
    // endDate     — last day of the course (null when isOngoing)
    // isOngoing   — true for chronic meds with no planned end (e.g. blood pressure, diabetes)
    //
    // A medication is considered "active for today" when:
    //   startDate <= today  AND  (isOngoing === true OR endDate >= today)
    startDate:  { type: Date, default: Date.now },
    endDate:    { type: Date, default: null },
    isOngoing:  { type: Boolean, default: true },
    stoppedAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Medication ||
  mongoose.model("Medication", MedicationSchema);