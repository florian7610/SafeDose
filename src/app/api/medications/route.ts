// src/app/api/medications/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import Patient from "@/data/models/Patient";
import Medication from "@/data/models/Medication";
import { dosesPerDay, parseTakenIndices } from "@/lib/medication-utils";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function serializeMed(m: any) {
  const today  = todayStr();
  const dpd    = dosesPerDay(m.frequency);
  const taken  = parseTakenIndices(m.takenDoses ?? null, today);
  return {
    id:           m._id.toString(),
    patientId:    m.patientId.toString(),
    addedBy:      m.addedBy?.toString() ?? null,
    name:         m.name,
    genericName:  m.genericName,
    dosage:       m.dosage,
    frequency:    m.frequency,
    scheduleTime: m.scheduleTime,
    status:       m.status,
    rxcui:        m.rxcui ?? "",
    dosesPerDay:  dpd,
    takenIndices: taken,
    takenToday:   taken.length >= dpd,
    startDate:    m.startDate?.toISOString() ?? null,
    endDate:      m.endDate?.toISOString()   ?? null,
    isOngoing:    m.isOngoing ?? true,
    stoppedAt:    m.stoppedAt?.toISOString() ?? null,
    createdAt:    m.createdAt,
    updatedAt:    m.updatedAt,
  };
}

/** GET /api/medications — all of the logged-in patient's medications */
export async function GET() {
  const caller = await requireRole("patient", "admin");
  if (!caller) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const patient = await Patient.findOne({ linkedUserId: caller.userId });
  if (!patient) {
    return NextResponse.json({ message: "Patient profile not found" }, { status: 404 });
  }

  const meds = await Medication.find({ patientId: patient._id }).sort({ createdAt: -1 });
  return NextResponse.json(meds.map(serializeMed), { status: 200 });
}

/** POST /api/medications — patient adds their own medication */
export async function POST(req: Request) {
  const caller = await requireRole("patient", "admin");
  if (!caller) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const patient = await Patient.findOne({ linkedUserId: caller.userId });
  if (!patient) {
    return NextResponse.json({ message: "Patient profile not found" }, { status: 404 });
  }

  const { name, genericName, dosage, frequency, scheduleTime, rxcui, startDate, endDate, isOngoing } = await req.json();

  if (!name || !genericName || !dosage || !frequency || !scheduleTime) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const med = await Medication.create({
    patientId:    patient._id,
    addedBy:      caller.userId,
    name, genericName, dosage, frequency, scheduleTime,
    rxcui:        rxcui ?? "",
    startDate:    startDate ? new Date(startDate) : new Date(),
    endDate:      isOngoing ? null : (endDate ? new Date(endDate) : null),
    isOngoing:    isOngoing ?? true,
  });

  return NextResponse.json(serializeMed(med), { status: 201 });
}
