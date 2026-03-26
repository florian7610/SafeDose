import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Medication from "@/data/models/Medication";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_production";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await connectToDatabase();
    const meds = await Medication.find({ userId: id }).sort({ createdAt: -1 });

    return NextResponse.json(
      meds.map(m => ({
        id: m._id.toString(),
        name: m.name,
        genericName: m.genericName,
        dosage: m.dosage,
        frequency: m.frequency,
        status: m.status,
        takenToday: m.takenToday,
      })),
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
}
