// src/app/api/caregiver/patients/[patientId]/medications/[medId]/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import Assignment from "@/data/models/Assignment";
import Medication from "@/data/models/Medication";
import { dosesPerDay, parseTakenIndices, toggleTakenIndex } from "@/lib/medication-utils";

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

/**
 * PATCH — caregivers can mark doses on behalf of patients.
 * Dose toggle: { doseIndex: 0, taken: true }
 * Clinical:    { dosage, frequency, scheduleTime, status, startDate, endDate, isOngoing }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ patientId: string; medId: string }> }
) {
  const caller = await requireRole("caregiver", "admin");
  if (!caller) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { patientId, medId } = await params;
  await connectToDatabase();

  if (!(await assertAssigned(caller.userId, patientId)))
    return NextResponse.json({ message: "You are not assigned to this patient" }, { status: 403 });

  const body = await req.json();
  const safe: Record<string, any> = {};

  // ── Dose toggle ───────────────────────────────────────────────────────────
  if (typeof body.doseIndex === "number" && typeof body.taken === "boolean") {
    const current = await Medication.findOne({ _id: medId, patientId });
    if (!current) return NextResponse.json({ message: "Medication not found" }, { status: 404 });
    safe.takenDoses = toggleTakenIndex(current.takenDoses ?? null, todayStr(), body.doseIndex, body.taken);
  }

  // ── Clinical fields ───────────────────────────────────────────────────────
  const ALLOWED = ["dosage", "frequency", "scheduleTime", "status", "startDate", "endDate", "isOngoing"];
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.includes(k)) safe[k] = v;
  }
  if (safe.status === "stopped") safe.stoppedAt = new Date();
  if (safe.isOngoing === true) safe.endDate = null;

  const med = await Medication.findOneAndUpdate(
    { _id: medId, patientId },
    { $set: safe },
    { new: true }
  );

  if (!med) return NextResponse.json({ message: "Medication not found" }, { status: 404 });
  return NextResponse.json(serializeMed(med));
}

/**
 * DELETE — hard-deletes (accidental entry).
 * To soft-stop, PATCH with { status: "stopped" }.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ patientId: string; medId: string }> }
) {
  const caller = await requireRole("caregiver", "admin");
  if (!caller) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { patientId, medId } = await params;
  await connectToDatabase();

  if (!(await assertAssigned(caller.userId, patientId)))
    return NextResponse.json({ message: "You are not assigned to this patient" }, { status: 403 });

  const deleted = await Medication.findOneAndDelete({ _id: medId, patientId });
  if (!deleted) return NextResponse.json({ message: "Medication not found" }, { status: 404 });
  return NextResponse.json({ message: "Medication deleted" }, { status: 200 });
}
