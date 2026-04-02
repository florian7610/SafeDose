// src/app/api/admin/users/[id]/medications/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import Patient from "@/data/models/Patient";
import Medication from "@/data/models/Medication";

/**
 * GET /api/admin/users/[id]/medications
 * [id] is a User._id. We resolve it to a Patient profile first,
 * then fetch medications by patientId.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await requireRole("admin");
  if (!caller) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await connectToDatabase();

  // id is a User._id — find the linked Patient profile
  const patient = await Patient.findOne({ linkedUserId: id });
  if (!patient) {
    // User exists but has no patient profile (e.g. a caregiver account)
    return NextResponse.json([], { status: 200 });
  }

  const meds = await Medication.find({ patientId: patient._id }).sort({
    createdAt: -1,
  });

  return NextResponse.json(
    meds.map((m) => ({
      id:          m._id.toString(),
      name:        m.name,
      genericName: m.genericName,
      dosage:      m.dosage,
      frequency:   m.frequency,
      status:      m.status,
      takenToday:  m.takenToday,
    })),
    { status: 200 }
  );
}