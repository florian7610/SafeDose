// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/data/models/User";
import Patient from "@/data/models/Patient";

export async function POST(req: Request) {
  try {
<<<<<<< Updated upstream
    const { firstName, lastName, email, password, role } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
=======
    const { firstName, lastName, email, password, phoneNumber, address } = await req.json();

    if (!firstName || !lastName || !email || !password || !phoneNumber || !address) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
>>>>>>> Stashed changes
    }

    await connectToDatabase();

<<<<<<< Updated upstream
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
=======
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    const existingUserByPhone = await User.findOne({ phoneNumber });
    if (existingUserByPhone) {
      return NextResponse.json({ message: "Phone number already exists" }, { status: 409 });
>>>>>>> Stashed changes
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === "caregiver" ? "caregiver" : "patient";

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
<<<<<<< Updated upstream
      role: assignedRole,
=======
      phoneNumber,
      address,
      role: "patient",
>>>>>>> Stashed changes
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