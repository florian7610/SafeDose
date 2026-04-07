// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/data/models/User";
import Patient from "@/data/models/Patient";

export async function POST(req: Request) {
  try {
    const {
      firstName, lastName, email, password, phoneNumber, address, role,
      dob, gender, qualification, experienceYears, specialization, availability, licenseId, languages
    } = await req.json();

    if (!firstName || !lastName || !email || !password || !phoneNumber || !address || !dob || !gender) {
      return NextResponse.json(
        { message: "All standard fields including Date of Birth and Gender are required." },
        { status: 400 }
      );
    }

    if (role === "caregiver") {
      if (!qualification || !experienceYears || !specialization || !availability || !licenseId || !languages) {
        return NextResponse.json(
          { message: "All caregiver-specific fields are required for caregiver registration." },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    const existingUserByPhone = await User.findOne({ phoneNumber });
    if (existingUserByPhone) {
      return NextResponse.json(
        { message: "Phone number already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === "caregiver" ? "caregiver" : "patient";

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      role: assignedRole,
      isApproved: assignedRole === "patient",
      dob,
      gender,
      qualification: assignedRole === "caregiver" ? qualification : undefined,
      experienceYears: assignedRole === "caregiver" ? Number(experienceYears) : undefined,
      specialization: assignedRole === "caregiver" ? specialization : undefined,
      availability: assignedRole === "caregiver" ? availability : undefined,
      licenseId: assignedRole === "caregiver" ? licenseId : undefined,
      languages: assignedRole === "caregiver" ? languages : undefined,
    });

    /**
     * For patients: auto-create a Patient profile linked to this account.
     *
     * If a caregiver previously created an unlinked Patient record for this
     * email, we claim it instead of creating a duplicate — the patient then
     * inherits all medication history the caregiver already entered.
     */
    if (assignedRole === "patient") {
      const existingProfile = await Patient.findOne({ email });

      if (existingProfile && !existingProfile.linkedUserId) {
        // Claim the existing caregiver-created profile
        await Patient.findByIdAndUpdate(existingProfile._id, {
          linkedUserId: newUser._id,
        });
      } else if (!existingProfile) {
        // Fresh registration — create a new profile
        await Patient.create({
          firstName,
          lastName,
          email,
          linkedUserId: newUser._id,
          createdBy: newUser._id,
        });
      }
    }

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}