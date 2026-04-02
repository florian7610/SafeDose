// src/app/api/caregiver/patients/[patientId]/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import Assignment from "@/data/models/Assignment";

/**
 * DELETE /api/caregiver/patients/[patientId]
 *
 * Soft-removes the assignment (status → "removed").
 * The Patient profile and all their medications are untouched —
 * history is never destroyed.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const caller = await requireRole("caregiver", "admin");
  if (!caller) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { patientId } = await params;
  await connectToDatabase();

  const assignment = await Assignment.findOneAndUpdate(
    { caregiverId: caller.userId, patientId, status: "active" },
    { status: "removed" },
    { new: true }
  );

  if (!assignment) {
    return NextResponse.json(
      { message: "Assignment not found or already removed" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Patient removed from your roster" }, { status: 200 });
}