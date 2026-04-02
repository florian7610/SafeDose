// src/app/api/caregiver/patients/[patientId]/medications/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import Assignment from "@/data/models/Assignment";
import Medication from "@/data/models/Medication";
import { dosesPerDay, parseTakenIndices } from "@/lib/medication-utils";

async function assertAssigned(caregiverId: string, patientId: string) {
  const a = await Assignment.findOne({ caregiverId, patientId, status: "active" });
  return !!a;
}

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const caller = await requireRole("caregiver", "admin");
  if (!caller) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { patientId } = await params;
  await connectToDatabase();

  if (!(await assertAssigned(caller.userId, patientId)))
    return NextResponse.json({ message: "You are not assigned to this patient" }, { status: 403 });

  const meds = await Medication.find({ patientId }).sort({ createdAt: -1 });
  return NextResponse.json(meds.map(serializeMed), { status: 200 });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const caller = await requireRole("caregiver", "admin");
  if (!caller) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { patientId } = await params;
  await connectToDatabase();

  if (!(await assertAssigned(caller.userId, patientId)))
    return NextResponse.json({ message: "You are not assigned to this patient" }, { status: 403 });

  const { name, genericName, dosage, frequency, scheduleTime, rxcui, startDate, endDate, isOngoing } = await req.json();

  if (!name || !genericName || !dosage || !frequency || !scheduleTime)
    return NextResponse.json({ message: "Missing required medication fields" }, { status: 400 });

  const med = await Medication.create({
    patientId, addedBy: caller.userId,
    name, genericName, dosage, frequency, scheduleTime,
    rxcui:     rxcui ?? "",
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate:   isOngoing ? null : (endDate ? new Date(endDate) : null),
    isOngoing: isOngoing ?? true,
  });

  return NextResponse.json(serializeMed(med), { status: 201 });
}
