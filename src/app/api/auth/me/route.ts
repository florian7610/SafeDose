import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import User from "@/data/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_production";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    await connectToDatabase();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role ?? "patient",
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
}
