// src/data/models/Patient.ts
import mongoose from "mongoose";

/**
 * Patient = the clinical profile. Completely decoupled from login.
 *
 * Two creation paths:
 *
 * 1. Patient self-registers → a Patient document is auto-created by the
 *    register route with linkedUserId set. They can log in and manage
 *    their own data independently.
 *
 * 2. Caregiver creates a profile for someone who has no account →
 *    Patient document is created with linkedUserId: null.
 *    If that person later registers, we match on email and set
 *    linkedUserId so they inherit all existing medication history.
 *
 * Medications always reference Patient._id, never User._id directly.
 * This keeps every query uniform regardless of whether the patient
 * has a login or not.
 */
const PatientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },

    // Optional — used for account-claim matching when a managed patient
    // later creates their own login.
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // allows null but enforces uniqueness when set
    },

    dateOfBirth: { type: Date },

    // Null when the patient has no SafeDose account.
    // Set to User._id when they register or claim this profile.
    linkedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Who created this profile (always a caregiver or the patient themselves
    // via the register flow where createdBy === linkedUserId).
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Free-text clinical notes visible to caregivers.
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// One Patient profile per linked user account
PatientSchema.index({ linkedUserId: 1 }, { sparse: true });

export default mongoose.models.Patient ||
  mongoose.model("Patient", PatientSchema);