// src/data/models/Interaction.ts
import mongoose from "mongoose";

/**
 * Drug interaction alert for a patient.
 * patientId → Patient._id (consistent with Medication).
 */
const InteractionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    drugIds:  [{ type: String }],
    severity: {
      type: String,
      enum: ["HIGH", "MODERATE", "LOW"],
      required: true,
    },
    summary:        { type: String, required: true },
    recommendation: { type: String, required: true },
    fdaSource:      { type: String },
    reviewed:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Interaction ||
  mongoose.model("Interaction", InteractionSchema);