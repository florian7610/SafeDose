// src/app/api/caregiver/dashboard/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import Assignment from "@/data/models/Assignment";
import Patient from "@/data/models/Patient";
import Medication from "@/data/models/Medication";
import Interaction from "@/data/models/Interaction";

/**
 * GET /api/caregiver/dashboard
 *
 * Single endpoint that returns everything the caregiver home screen needs:
 *   - summary counts (total patients, alerts, warnings, on-track)
 *   - full patient roster sorted by urgency
 *
 * Works identically whether patients have accounts or not.
 */
export async function GET() {
  const caller = await requireRole("caregiver", "admin");
  if (!caller) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const assignments = await Assignment.find({
    caregiverId: caller.userId,
    status: "active",
  });

  if (assignments.length === 0) {
    return NextResponse.json(
      { summary: { totalPatients: 0, patientsWithAlerts: 0, patientsWithWarnings: 0, patientsOnTrack: 0 }, roster: [] },
      { status: 200 }
    );
  }

  const patientIds = assignments.map((a) => a.patientId);

  const [patients, allMeds, allInteractions] = await Promise.all([
    Patient.find({ _id: { $in: patientIds } }),
    Medication.find({ patientId: { $in: patientIds } }),
    Interaction.find({ patientId: { $in: patientIds }, reviewed: false }),
  ]);

  const roster = patients.map((patient) => {
    const pid = patient._id.toString();
    const meds = allMeds.filter((m) => m.patientId.toString() === pid);
    const interactions = allInteractions.filter(
      (i) => i.patientId.toString() === pid
    );

    const activeMeds = meds.filter((m) => m.status === "active");
    const takenToday = activeMeds.filter((m) => m.takenToday).length;
    const missedToday = Math.max(0, activeMeds.length - takenToday);
    const interactionCount = interactions.length;

    const status =
      interactionCount > 0 ? "alert" : missedToday > 0 ? "warning" : "ok";

    const assignment = assignments.find((a) => a.patientId.toString() === pid);

    return {
      patientId:        pid,
      firstName:        patient.firstName,
      lastName:         patient.lastName,
      email:            patient.email ?? null,
      hasAccount:       !!patient.linkedUserId,
      notes:            patient.notes ?? "",
      rosterStatus:     status,
      activeMedCount:   activeMeds.length,
      takenToday,
      missedToday,
      interactionCount,
      assignedAt:       assignment?.assignedAt ?? null,
    };
  });

  const ORDER: Record<string, number> = { alert: 0, warning: 1, ok: 2 };
  roster.sort((a, b) => ORDER[a.rosterStatus] - ORDER[b.rosterStatus]);

  return NextResponse.json(
    {
      summary: {
        totalPatients:       roster.length,
        patientsWithAlerts:  roster.filter((p) => p.rosterStatus === "alert").length,
        patientsWithWarnings:roster.filter((p) => p.rosterStatus === "warning").length,
        patientsOnTrack:     roster.filter((p) => p.rosterStatus === "ok").length,
      },
      roster,
    },
    { status: 200 }
  );
}