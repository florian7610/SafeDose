import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/data/models/User";
import Medication from "@/data/models/Medication";
import Interaction from "@/data/models/Interaction";

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
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });

  const userRows = await Promise.all(
    users.map(async (u) => {
      const medCount = await Medication.countDocuments({ userId: u._id });
      return {
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role ?? "patient",
        medCount,
        createdAt: u.createdAt,
      };
    })
  );

  return NextResponse.json(userRows, { status: 200 });
}
