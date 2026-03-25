import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Interaction from "@/data/models/Interaction";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_production";

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const interactions = await Interaction.find({ userId }).sort({ createdAt: -1 });

  const returnedAlerts = interactions.map(m => ({
    id: m._id.toString(),
    userId: m.userId.toString(),
    drugIds: m.drugIds,
    severity: m.severity,
    summary: m.summary,
    recommendation: m.recommendation,
    fdaSource: m.fdaSource,
    reviewed: m.reviewed,
    createdAt: m.createdAt,
  }));

  return NextResponse.json(returnedAlerts, { status: 200 });
}
