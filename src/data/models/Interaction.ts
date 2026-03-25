import mongoose from "mongoose";

const InteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    drugIds: [{ type: String }],
    severity: {
      type: String,
      enum: ["HIGH", "MODERATE", "LOW"],
      required: true,
    },
    summary: { type: String, required: true },
    recommendation: { type: String, required: true },
    fdaSource: { type: String },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Interaction || mongoose.model("Interaction", InteractionSchema);
