// src/data/models/User.ts
import mongoose from "mongoose";

/**
 * User = login identity only.
 * Clinical data lives in the Patient collection.
 * Every User with role "patient" has exactly one Patient record
 * with linkedUserId pointing back here.
 */
const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "patient", "caregiver"],
      default: "patient",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);