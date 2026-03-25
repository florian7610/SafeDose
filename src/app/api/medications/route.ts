import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Medication from "@/data/models/Medication";

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
  const medications = await Medication.find({ userId }).sort({ createdAt: -1 });

  const returnedMeds = medications.map(m => ({
    id: m._id.toString(),
    userId: m.userId.toString(),
    name: m.name,
    genericName: m.genericName,
    dosage: m.dosage,
    frequency: m.frequency,
    scheduleTime: m.scheduleTime,
    status: m.status,
    rxcui: m.rxcui,
    takenToday: m.takenToday,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));

  return NextResponse.json(returnedMeds, { status: 200 });
}

export async function POST(req: Request) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    await connectToDatabase();
    
    const newMedication = new Medication({
      ...data,
      userId,
    });
    
    await newMedication.save();
    
    return NextResponse.json({
      id: newMedication._id.toString(),
      userId: newMedication.userId.toString(),
      name: newMedication.name,
      genericName: newMedication.genericName,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      scheduleTime: newMedication.scheduleTime,
      status: newMedication.status,
      rxcui: newMedication.rxcui,
      takenToday: newMedication.takenToday,
      createdAt: newMedication.createdAt,
      updatedAt: newMedication.updatedAt,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create medication" }, { status: 500 });
  }
}
