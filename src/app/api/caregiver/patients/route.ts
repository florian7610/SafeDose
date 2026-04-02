// src/app/api/caregiver/patients/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import User from "@/data/models/User";
import Patient from "@/data/models/Patient";
import Assignment from "@/data/models/Assignment";
import Medication from "@/data/models/Medication";
import Interaction from "@/data/models/Interaction";

function rosterStatus(missedToday: number, interactionCount: number) {
  if (interactionCount > 0) return "alert";
  if (missedToday > 0) return "warning";
  return "ok";
}

/**
 * GET /api/caregiver/patients
 * Returns all active Patient profiles assigned to this caregiver,
 * with a computed status summary for the roster board.
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
    return NextResponse.json([], { status: 200 });
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

    const assignment = assignments.find((a) => a.patientId.toString() === pid);

    return {
      patientId:        pid,
      firstName:        patient.firstName,
      lastName:         patient.lastName,
      email:            patient.email ?? null,
      hasAccount:       !!patient.linkedUserId,
      notes:            patient.notes ?? "",
      rosterStatus:     rosterStatus(missedToday, interactions.length),
      activeMedCount:   activeMeds.length,
      takenToday,
      missedToday,
      interactionCount: interactions.length,
      assignedAt:       assignment?.assignedAt ?? null,
    };
  });

  // Sort: alerts first, warnings second, on-track last
  const ORDER: Record<string, number> = { alert: 0, warning: 1, ok: 2 };
  roster.sort((a, b) => ORDER[a.rosterStatus] - ORDER[b.rosterStatus]);

  return NextResponse.json(roster, { status: 200 });
}

/**
 * POST /api/caregiver/patients
 *
 * Two modes — determined by the request body:
 *
 * Mode A — Create a new unlinked patient (no SafeDose account):
 *   { mode: "create", firstName, lastName, email?, dateOfBirth?, notes? }
 *   Creates a fresh Patient profile and assigns it to this caregiver.
 *
 * Mode B — Link to an existing registered patient by email:
 *   { mode: "link", email }
 *   Looks up the Patient profile whose linkedUserId matches a registered
 *   patient account with that email, then creates the assignment.
 */
export async function POST(req: Request) {
  const caller = await requireRole("caregiver", "admin");
  if (!caller) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { mode } = body;

  await connectToDatabase();

  // ── Mode A: create a brand-new patient profile ──────────────────────────
  if (mode === "create") {
    const { firstName, lastName, email, dateOfBirth, notes } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { message: "firstName and lastName are required" },
        { status: 400 }
      );
    }

    // If an email is provided and a linked Patient profile already exists,
    // switch to link mode automatically rather than creating a duplicate.
    if (email) {
      const existing = await Patient.findOne({ email });
      if (existing) {
        return NextResponse.json(
          {
            message:
              "A patient profile with this email already exists. Use mode 'link' to assign them.",
          },
          { status: 409 }
        );
      }
    }

    const patient = await Patient.create({
      firstName,
      lastName,
      email:       email ?? undefined,
      dateOfBirth: dateOfBirth ?? undefined,
      notes:       notes ?? "",
      linkedUserId: null,
      createdBy:   caller.userId,
    });

    await Assignment.create({
      caregiverId: caller.userId,
      patientId:   patient._id,
      status:      "active",
      assignedAt:  new Date(),
    });

    return NextResponse.json(
      {
        patientId:  patient._id.toString(),
        firstName:  patient.firstName,
        lastName:   patient.lastName,
        email:      patient.email ?? null,
        hasAccount: false,
      },
      { status: 201 }
    );
  }

  // ── Mode B: link to a registered patient by email ───────────────────────
  if (mode === "link") {
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "email is required for mode 'link'" },
        { status: 400 }
      );
    }

    // Find the User account with this email
    const userAccount = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "patient",
    });

    if (!userAccount) {
      return NextResponse.json(
        { message: "No registered patient found with that email" },
        { status: 404 }
      );
    }

    // Find the Patient profile linked to that user
    const patient = await Patient.findOne({ linkedUserId: userAccount._id });
    if (!patient) {
      return NextResponse.json(
        { message: "Patient profile not found for this account" },
        { status: 404 }
      );
    }

    if (patient.linkedUserId?.toString() === caller.userId) {
      return NextResponse.json(
        { message: "You cannot assign yourself as a patient" },
        { status: 400 }
      );
    }

    // Upsert: reactivate if a previous assignment was removed
    const assignment = await Assignment.findOneAndUpdate(
      { caregiverId: caller.userId, patientId: patient._id },
      { status: "active", assignedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        patientId:    patient._id.toString(),
        firstName:    patient.firstName,
        lastName:     patient.lastName,
        email:        patient.email ?? null,
        hasAccount:   true,
        assignmentId: assignment._id.toString(),
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { message: "mode must be 'create' or 'link'" },
    { status: 400 }
  );
}