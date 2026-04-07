import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/data/models/User";
import Medication from "@/data/models/Medication";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_production";

async function getAdminFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  await connectToDatabase();
  const users = await User.find({}).sort({ createdAt: -1 });

  const userRows = await Promise.all(
    users.map(async (u) => {
      const medCount = await Medication.countDocuments({ userId: u._id });
      return {
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phoneNumber: u.phoneNumber,
        address: u.address,
        role: u.role ?? "patient",
        medCount,
        createdAt: u.createdAt,
      };
    })
  );

  return NextResponse.json(userRows, { status: 200 });
}

export async function POST(req: Request) {
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { firstName, lastName, email, password, phoneNumber, address, role } = await req.json();

    if (!firstName || !lastName || !email || !password || !phoneNumber || !address || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Phone number";
      return NextResponse.json({ message: `${field} already exists` }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      role,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin user creation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
