import mongoose from "mongoose";

const MedicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    genericName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    scheduleTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "interaction", "paused"],
      default: "active",
    },
    rxcui: { type: String },
    takenToday: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Medication || mongoose.model("Medication", MedicationSchema);
