// src/app/api/interactions/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import Patient from "@/data/models/Patient";
import Interaction from "@/data/models/Interaction";

/** GET /api/interactions — the logged-in patient's drug interaction alerts */
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

  const interactions = await Interaction.find({ patientId: patient._id }).sort({
    createdAt: -1,
  });

  return NextResponse.json(
    interactions.map((i) => ({
      id:             i._id.toString(),
      patientId:      i.patientId.toString(),
      drugIds:        i.drugIds,
      severity:       i.severity,
      summary:        i.summary,
      recommendation: i.recommendation,
      fdaSource:      i.fdaSource,
      reviewed:       i.reviewed,
      createdAt:      i.createdAt,
    })),
    { status: 200 }
  );
}