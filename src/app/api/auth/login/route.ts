import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/data/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_production";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
    // Auto-promote to admin role if email matches ADMIN_EMAIL
    if (ADMIN_EMAIL && user.email === ADMIN_EMAIL.toLowerCase() && user.role !== "admin") {
      await user.updateOne({ role: "admin" });
      user.role = "admin";
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      { message: "Logged in successfully", user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
