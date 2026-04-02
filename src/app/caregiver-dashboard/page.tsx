// src/app/caregiver-dashboard/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { CaregiverShell } from "@/components/layout/caregiver-shell";
import { useCaregiverState } from "@/components/providers/app-state-provider";
import type { RosterPatient } from "@/types/contracts";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RosterPatient["rosterStatus"] }) {
  if (status === "alert")
    return <span className="badge badge-danger">Alert</span>;
  if (status === "warning")
    return <span className="badge badge-warn">Warning</span>;
  return <span className="badge badge-safe">On track</span>;
}

// ─── Add patient modal ────────────────────────────────────────────────────────

function AddPatientModal({ onClose }: { onClose: () => void }) {
  const { addPatient } = useCaregiverState();
  const [mode, setMode]         = useState<"create" | "link">("create");
  const [firstName, setFirst]   = useState("");
  const [lastName,  setLast]    = useState("");
  const [email,     setEmail]   = useState("");
  const [dob,       setDob]     = useState("");
  const [notes,     setNotes]   = useState("");
  const [error,     setError]   = useState("");
  const [loading,   setLoading] = useState(false);

  async function handleSubmit() {
    setError("");

    if (mode === "create" && (!firstName.trim() || !lastName.trim())) {
      setError("First name and last name are required.");
      return;
    }
    if (mode === "link" && !email.trim()) {
      setError("Email is required to link a registered patient.");
      return;
    }

    setLoading(true);
    const payload =
      mode === "create"
        ? { mode: "create" as const, firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() || undefined, dateOfBirth: dob || undefined, notes: notes.trim() || undefined }
        : { mode: "link"   as const, email: email.trim() };

    const result = await addPatient(payload);
    setLoading(false);

    if (!result) {
      setError(
        mode === "link"
          ? "No registered patient found with that email."
          : "Something went wrong. Please try again."
      );
      return;
    }
    onClose();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 480, padding: "1.5rem", position: "relative" }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
        >
          <FiX size={18} />
        </button>

        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 500 }}>Add patient</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--color-text-secondary)" }}>
          Create a profile for someone without an account, or link an existing registered patient.
        </p>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["create", "link"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={mode === m ? "btn btn-teal" : "btn btn-outline"}
              style={{ flex: 1, fontSize: 13 }}
            >
              {m === "create" ? "New patient" : "Link registered patient"}
            </button>
          ))}
        </div>

        {mode === "create" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div className="form-grp" style={{ margin: 0 }}>
                <label>First name *</label>
                <input value={firstName} onChange={(e) => setFirst(e.target.value)} placeholder="Jane" />
              </div>
              <div className="form-grp" style={{ margin: 0 }}>
                <label>Last name *</label>
                <input value={lastName} onChange={(e) => setLast(e.target.value)} placeholder="Smith" />
              </div>
            </div>
            <div className="form-grp">
              <label>Email (optional — used for account claim later)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="form-grp">
              <label>Date of birth (optional)</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="form-grp">
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergies, conditions, special instructions..."
                rows={3}
                style={{ width: "100%", resize: "vertical", padding: "8px 10px", fontSize: 13, borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
              />
            </div>
          </>
        )}

        {mode === "link" && (
          <div className="form-grp">
            <label>Patient's registered email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@example.com" />
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>
              The patient must already have a SafeDose account with this email.
            </p>
          </div>
        )}

        {error && (
          <p style={{ fontSize: 13, color: "var(--color-text-danger)", marginBottom: 12 }}>{error}</p>
        )}

        <button
          className="btn btn-teal btn-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : mode === "create" ? "Create patient" : "Link patient"}
        </button>
      </div>
    </div>
  );
}

// ─── Patient row ──────────────────────────────────────────────────────────────

function PatientRow({
  patient,
  onRemove,
}: {
  patient: RosterPatient;
  onRemove: (id: string) => void;
}) {
  const router   = useRouter();
  const initials = `${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div
      className="check-item"
      style={{ cursor: "pointer", alignItems: "center" }}
      onClick={() => router.push(`/caregiver-dashboard/patients/${patient.patientId}`)}
    >
      {/* Avatar */}
      <div
        style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "var(--color-text-info)", flexShrink: 0 }}
      >
        {initials}
      </div>

      {/* Name + meta */}
      <div className="check-body" style={{ flex: 1 }}>
        <div className="check-name">
          {patient.firstName} {patient.lastName}
          {!patient.hasAccount && (
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginLeft: 8, fontWeight: 400 }}>
              no account
            </span>
          )}
        </div>
        <div className="check-time">
          {patient.activeMedCount} medication{patient.activeMedCount !== 1 ? "s" : ""}
          {patient.missedToday > 0 && ` · ${patient.missedToday} missed today`}
          {patient.interactionCount > 0 && ` · ${patient.interactionCount} interaction${patient.interactionCount !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Status + remove */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={(e) => e.stopPropagation()}>
        <StatusBadge status={patient.rosterStatus} />
        <button
          className="icon-btn icon-btn-del"
          title="Remove patient"
          onClick={() => onRemove(patient.patientId)}
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CaregiverDashboardPage() {
  const { caregiverDashboard, isCaregiverLoading, removePatient } = useCaregiverState();
  const [showModal, setShowModal] = useState(false);

  const summary = caregiverDashboard?.summary;
  const roster  = caregiverDashboard?.roster ?? [];

  const alertPatients   = roster.filter((p) => p.rosterStatus === "alert");
  const warningPatients = roster.filter((p) => p.rosterStatus === "warning");
  const okPatients      = roster.filter((p) => p.rosterStatus === "ok");

  return (
    <CaregiverShell title="My Patients" subtitle="Monitor and manage all assigned patients">

      {/* ── Summary stats ── */}
      <section className="stat-grid">
        <article className="stat-card">
          <div className="stat-icon"><FiUsers /></div>
          <div className="stat-val">{summary?.totalPatients ?? "–"}</div>
          <div className="stat-lbl">Total patients</div>
          <div className="stat-change">under your care</div>
        </article>
        <article className="stat-card">
          <div className="stat-icon" style={{ color: "var(--color-text-success)" }}><FiCheckCircle /></div>
          <div className="stat-val">{summary?.patientsOnTrack ?? "–"}</div>
          <div className="stat-lbl">On track today</div>
          <div className="stat-change">all doses taken</div>
        </article>
        <article className="stat-card">
          <div className="stat-icon" style={{ color: "var(--color-text-warning)" }}><FiAlertTriangle /></div>
          <div className="stat-val">{summary?.patientsWithWarnings ?? "–"}</div>
          <div className="stat-lbl">Missed doses</div>
          <div className="stat-change">need follow-up</div>
        </article>
        <article className="stat-card">
          <div className="stat-icon" style={{ color: "var(--color-text-danger)" }}><FiAlertTriangle /></div>
          <div className="stat-val">{summary?.patientsWithAlerts ?? "–"}</div>
          <div className="stat-lbl">Drug interactions</div>
          <div className="stat-change">require review</div>
        </article>
      </section>

      {/* ── Roster ── */}
      <section className="dash-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div className="card-box">
          <div className="section-hdr">
            <h3>Patient roster</h3>
            <button
              className="btn btn-teal"
              style={{ fontSize: 13, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => setShowModal(true)}
            >
              <FiPlus size={14} /> Add patient
            </button>
          </div>

          {isCaregiverLoading && (
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, padding: "1rem 0" }}>Loading patients...</p>
          )}

          {!isCaregiverLoading && roster.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--color-text-secondary)" }}>
              <FiUsers size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>No patients yet. Add your first patient to get started.</p>
            </div>
          )}

          {alertPatients.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-danger)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "16px 0 6px" }}>
                Needs attention
              </p>
              {alertPatients.map((p) => (
                <PatientRow key={p.patientId} patient={p} onRemove={removePatient} />
              ))}
            </>
          )}

          {warningPatients.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-warning)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "16px 0 6px" }}>
                Missed doses
              </p>
              {warningPatients.map((p) => (
                <PatientRow key={p.patientId} patient={p} onRemove={removePatient} />
              ))}
            </>
          )}

          {okPatients.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-success)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "16px 0 6px" }}>
                On track
              </p>
              {okPatients.map((p) => (
                <PatientRow key={p.patientId} patient={p} onRemove={removePatient} />
              ))}
            </>
          )}
        </div>
      </section>

      {showModal && <AddPatientModal onClose={() => setShowModal(false)} />}
    </CaregiverShell>
  );
}
