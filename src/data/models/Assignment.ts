// src/data/models/Assignment.ts
import mongoose from "mongoose";

/**
 * Assignment links a caregiver (User) to a Patient profile.
 *
 * Crucially, patientId references Patient._id — NOT User._id.
 * This means caregivers can be assigned to both:
 *   - patients who have a SafeDose account (Patient.linkedUserId set)
 *   - patients who have no account at all   (Patient.linkedUserId null)
 *
 * Status flow:
 *   active  → caregiver can view and manage this patient
 *   removed → soft-deleted; history preserved, access revoked
 *
 * (A "pending" status for invite flows can be added later without
 *  changing anything else — just add it to the enum.)
 */
const AssignmentSchema = new mongoose.Schema(
  {
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One assignment record per caregiver–patient pair (upsert-safe)
AssignmentSchema.index({ caregiverId: 1, patientId: 1 }, { unique: true });

export default mongoose.models.Assignment ||
  mongoose.model("Assignment", AssignmentSchema);