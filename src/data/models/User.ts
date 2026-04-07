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
    phoneNumber: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      sparse: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "patient", "caregiver"],
      default: "patient",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    dob: { type: Date, required: false },
    gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"], required: false },
    // Caregiver specific
    qualification: { type: String, required: false },
    experienceYears: { type: Number, required: false },
    specialization: { type: String, required: false },
    availability: { type: String, required: false },
    licenseId: { type: String, required: false },
    languages: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);