// src/app/caregiver-dashboard/patients/[patientId]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiPackage,
  FiPlus,
  FiSquare,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { CaregiverShell } from "@/components/layout/caregiver-shell";
import { useCaregiverState } from "@/components/providers/app-state-provider";
import { FREQUENCY_OPTIONS, isDueToday, isInHistory } from "@/lib/medication-utils";
import type { MedicationEntity } from "@/types/contracts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientDetail {
  patientId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  hasAccount: boolean;
  notes: string;
  rosterStatus: "alert" | "warning" | "ok";
  activeMedCount: number;
  takenToday: number;
  missedToday: number;
  interactionCount: number;
  assignedAt: string | null;
}

interface AddMedFormValues {
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  rxcui: string;
  startDate: string;
  endDate: string;
  isOngoing: boolean;
}

// ─── Duration label ───────────────────────────────────────────────────────────

function DurationLabel({ med }: { med: MedicationEntity }) {
  if (med.isOngoing) {
    return <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Ongoing</span>;
  }

  let daysRemaining: number | null = null;
  if (med.endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(med.endDate);
    end.setHours(0, 0, 0, 0);
    daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div>
      {med.endDate && (
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
          Until {formatDate(med.endDate)}
        </div>
      )}
      {daysRemaining !== null && (
        <div style={{
          fontSize: 11,
          fontWeight: daysRemaining <= 3 ? 500 : 400,
          color: daysRemaining <= 0
            ? "var(--color-text-danger)"
            : daysRemaining <= 3
            ? "var(--color-text-danger)"
            : daysRemaining <= 7
            ? "var(--color-text-warning)"
            : "var(--color-text-tertiary)",
        }}>
          {daysRemaining <= 0 ? "Course ended" : daysRemaining === 1 ? "Last day" : `${daysRemaining} days left`}
        </div>
      )}
    </div>
  );
}

// ─── Add medication modal ─────────────────────────────────────────────────────

function AddMedModal({
  patientId,
  onClose,
  onSaved,
}: {
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } =
    useForm<AddMedFormValues>({
      defaultValues: {
        name: "", genericName: "", dosage: "", frequency: FREQUENCY_OPTIONS[0],
        scheduleTime: "", rxcui: "", startDate: todayStr(), endDate: "", isOngoing: true,
      },
    });

  const isOngoing = watch("isOngoing");

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/caregiver/patients/${patientId}/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          rxcui:     values.rxcui.trim() || "",
          endDate:   values.isOngoing ? null : (values.endDate || null),
          isOngoing: values.isOngoing,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || "Failed to add medication.");
        return;
      }
      reset();
      onSaved();
      onClose();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 540, padding: "1.5rem", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}>
          <FiX size={18} />
        </button>

        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 500 }}>Add medication</h3>

        <form onSubmit={onSubmit} noValidate>
          <div className="form-row-2">
            <div className="form-grp">
              <label>Drug name *</label>
              <input {...register("name", { validate: (v) => v.trim().length > 0 || "Required." })} placeholder="Metformin" />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div className="form-grp">
              <label>Generic name *</label>
              <input {...register("genericName", { validate: (v) => v.trim().length > 0 || "Required." })} placeholder="metformin hydrochloride" />
              {errors.genericName && <p className="form-error">{errors.genericName.message}</p>}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-grp">
              <label>Dosage *</label>
              <input
                {...register("dosage", { validate: (v) => /^\d+\s?(mg|mcg|g|ml)$/i.test(v.trim()) || "Use format like 500mg." })}
                placeholder="500mg"
              />
              {errors.dosage && <p className="form-error">{errors.dosage.message}</p>}
            </div>
            <div className="form-grp">
              <label>Frequency *</label>
              <select {...register("frequency")}>
                {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-grp">
              <label>Scheduled time *</label>
              <input type="time" {...register("scheduleTime", { validate: (v) => v.trim().length > 0 || "Required." })} />
              {errors.scheduleTime && <p className="form-error">{errors.scheduleTime.message}</p>}
            </div>
            <div className="form-grp">
              <label>RxCUI (optional)</label>
              <input {...register("rxcui")} placeholder="860975" />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-grp">
              <label>Start date</label>
              <input type="date" {...register("startDate")} />
            </div>
            <div className="form-grp">
              <label>End date</label>
              <input
                type="date"
                disabled={isOngoing}
                style={{ opacity: isOngoing ? 0.4 : 1 }}
                {...register("endDate", {
                  validate: (v, vals) => vals.isOngoing || v.trim().length > 0 || "End date required.",
                })}
              />
              {errors.endDate && <p className="form-error">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="form-grp" style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}>
            <input id="addIsOngoing" type="checkbox" {...register("isOngoing")} style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
            <label htmlFor="addIsOngoing" style={{ margin: 0, cursor: "pointer", fontSize: 14 }}>Ongoing / chronic medication (no end date)</label>
          </div>

          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

          <button className="btn btn-teal btn-full" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add medication"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Edit medication modal ────────────────────────────────────────────────────

function EditMedModal({
  patientId,
  med,
  onClose,
  onSaved,
}: {
  patientId: string;
  med: MedicationEntity;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [dosage,       setDosage]       = useState(med.dosage);
  const [frequency,    setFrequency]    = useState(med.frequency);
  const [scheduleTime, setScheduleTime] = useState(med.scheduleTime);
  const [startDate,    setStartDate]    = useState(med.startDate ? med.startDate.split("T")[0] : todayStr());
  const [endDate,      setEndDate]      = useState(med.endDate   ? med.endDate.split("T")[0]   : "");
  const [isOngoing,    setIsOngoing]    = useState(med.isOngoing ?? true);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  async function handleSave() {
    setError("");
    if (!dosage.trim() || !frequency.trim() || !scheduleTime.trim()) {
      setError("Dosage, frequency and scheduled time are required.");
      return;
    }
    if (!isOngoing && !endDate.trim()) {
      setError("End date is required for non-ongoing medications.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/caregiver/patients/${patientId}/medications/${med.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dosage, frequency, scheduleTime, startDate, endDate: isOngoing ? null : endDate, isOngoing }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || "Failed to update.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 460, padding: "1.5rem", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}>
          <FiX size={18} />
        </button>

        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 500 }}>Edit medication</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--color-text-secondary)" }}>
          {med.name} · {med.genericName}
        </p>

        <div className="form-row-2">
          <div className="form-grp">
            <label>Dosage</label>
            <input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="500mg" />
          </div>
          <div className="form-grp">
            <label>Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-grp">
            <label>Scheduled time</label>
            <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
          </div>
          <div className="form-grp">
            <label>Start date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>

        <div className="form-grp">
          <label>End date</label>
          <input
            type="date"
            value={endDate}
            disabled={isOngoing}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ opacity: isOngoing ? 0.4 : 1 }}
          />
        </div>

        <div className="form-grp" style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}>
          <input
            id="editIsOngoing"
            type="checkbox"
            checked={isOngoing}
            onChange={(e) => { setIsOngoing(e.target.checked); if (e.target.checked) setEndDate(""); }}
            style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }}
          />
          <label htmlFor="editIsOngoing" style={{ margin: 0, cursor: "pointer", fontSize: 14 }}>
            Ongoing / chronic medication (no end date)
          </label>
        </div>

        {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-teal btn-full" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatientDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const patientId = params.patientId as string;

  const { caregiverDashboard } = useCaregiverState();

  const [medications,  setMedications]  = useState<MedicationEntity[]>([]);
  const [medLoading,   setMedLoading]   = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMed,   setEditingMed]   = useState<MedicationEntity | null>(null);
  const [showHistory,  setShowHistory]  = useState(false);

  const patient: PatientDetail | undefined =
    caregiverDashboard?.roster.find((p) => p.patientId === patientId) as PatientDetail | undefined;

  const fetchMeds = useCallback(async () => {
    setMedLoading(true);
    try {
      const res = await fetch(`/api/caregiver/patients/${patientId}/medications`);
      if (res.ok) setMedications(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setMedLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchMeds(); }, [fetchMeds]);

  async function toggleDose(medId: string, doseIndex: number) {
    const med = medications.find((m) => m.id === medId);
    if (!med) return;
    const alreadyTaken = med.takenIndices.includes(doseIndex);
    const newIndices = alreadyTaken
      ? med.takenIndices.filter((i) => i !== doseIndex)
      : [...med.takenIndices, doseIndex].sort((a, b) => a - b);
    setMedications((prev) =>
      prev.map((m) => m.id === medId
        ? { ...m, takenIndices: newIndices, takenToday: newIndices.length >= m.dosesPerDay }
        : m)
    );
    try {
      await fetch(`/api/caregiver/patients/${patientId}/medications/${medId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doseIndex, taken: !alreadyTaken }),
      });
    } catch {
      fetchMeds();
    }
  }

  async function stopMed(medId: string) {
    setMedications((prev) =>
      prev.map((m) => m.id === medId ? { ...m, status: "stopped" as const, stoppedAt: new Date().toISOString() } : m)
    );
    try {
      await fetch(`/api/caregiver/patients/${patientId}/medications/${medId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "stopped" }),
      });
    } catch {
      fetchMeds();
    }
  }

  async function deleteMed(medId: string) {
    setMedications((prev) => prev.filter((m) => m.id !== medId));
    try {
      await fetch(`/api/caregiver/patients/${patientId}/medications/${medId}`, { method: "DELETE" });
    } catch {
      fetchMeds();
    }
  }

  const dueTodayMeds  = medications.filter((m) => isDueToday(m));
  const activeMeds    = medications.filter((m) => !isInHistory(m));
  const historyMeds   = medications.filter((m) => isInHistory(m));
  const totalDoses   = dueTodayMeds.reduce((s, m) => s + m.dosesPerDay, 0);
  const takenDoses   = dueTodayMeds.reduce((s, m) => s + m.takenIndices.length, 0);
  const pendingCount = totalDoses - takenDoses;
  const adherencePct = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  const interactionCount = activeMeds.filter((m) => m.status === "interaction").length;

  const initials = patient
    ? `${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <CaregiverShell
      title={patient ? `${patient.firstName} ${patient.lastName}` : "Patient"}
      subtitle="Medication management and overview"
    >
      <button
        className="btn btn-ghost"
        style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13 }}
        onClick={() => router.push("/caregiver-dashboard")}
      >
        <FiArrowLeft size={14} /> Back to patients
      </button>

      <div className="dash-grid">
        {/* ── Left column ── */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {/* Patient info */}
          <div className="card-box">
            <div className="section-hdr"><h3>Patient info</h3></div>
            {!patient ? (
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Loading...</p>
            ) : (
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 500, color: "var(--color-text-info)", flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 500, fontSize: 15 }}>{patient.firstName} {patient.lastName}</p>
                  {patient.email && <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--color-text-secondary)" }}>{patient.email}</p>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {patient.hasAccount
                      ? <span className="badge badge-safe">Has account</span>
                      : <span className="badge" style={{ background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }}>No account</span>
                    }
                    {patient.rosterStatus === "alert"   && <span className="badge badge-danger">Drug interaction</span>}
                    {patient.rosterStatus === "warning" && <span className="badge badge-warn">Missed doses</span>}
                  </div>
                  {patient.notes && (
                    <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--color-text-secondary)", padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
                      {patient.notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <section className="stat-grid">
            <article className="stat-card">
              <div className="stat-icon"><FiPackage /></div>
              <div className="stat-val">{activeMeds.length}</div>
              <div className="stat-lbl">Active Medications</div>
              <div className="stat-change">Data refreshed from app state</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon"><FiCheckCircle /></div>
              <div className="stat-val">{adherencePct}%</div>
              <div className="stat-lbl">Today Adherence</div>
              <div className="stat-change">Updated from today's activity</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon"><FiAlertTriangle /></div>
              <div className="stat-val">{interactionCount}</div>
              <div className="stat-lbl">Active Interactions</div>
              <div className="stat-change">Review suggested</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon"><FiClock /></div>
              <div className="stat-val">{pendingCount}</div>
              <div className="stat-lbl">Doses Pending</div>
              <div className="stat-change">Mark doses in dashboard</div>
            </article>
          </section>

          {/* Today's doses */}
          <div className="card-box">
            <div className="section-hdr">
              <h3>Today&apos;s doses</h3>
              <span className="view-all">{takenDoses} of {totalDoses} taken</span>
            </div>

            {medLoading && <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Loading...</p>}

            {!medLoading && dueTodayMeds.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "0.5rem 0" }}>
                No doses due today.
              </p>
            )}

            {dueTodayMeds.map((med) => {
              const allTaken = med.takenIndices.length >= med.dosesPerDay;
              const hasAlert = med.status === "interaction";
              return (
                <article key={med.id} className="check-item" style={{ alignItems: "flex-start", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 2 }}>
                    {Array.from({ length: med.dosesPerDay }, (_, i) => {
                      const taken = med.takenIndices.includes(i);
                      const label = med.dosesPerDay === 1 ? "Dose" : `Dose ${i + 1}`;
                      return (
                        <button
                          key={i}
                          className={taken ? "check-box checked" : "check-box"}
                          type="button"
                          onClick={() => toggleDose(med.id, i)}
                          aria-label={taken ? `Unmark ${label}` : `Mark ${label} taken`}
                          title={label}
                        >
                          {taken ? "✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                  <div className="check-body" style={{ flex: 1 }}>
                    <div className="check-name">{med.name}</div>
                    <div className="check-time">{med.dosage} · {med.frequency} · {med.scheduleTime}</div>
                    {med.dosesPerDay > 1 && (
                      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>
                        {med.takenIndices.length} of {med.dosesPerDay} doses taken
                      </div>
                    )}
                  </div>
                  <span className={`status-badge ${allTaken ? "status-taken" : hasAlert ? "status-missed" : "status-due"}`}>
                    {allTaken ? "Done" : hasAlert ? "Alert" : "Pending"}
                  </span>
                </article>
              );
            })}
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card-box">
            <div className="section-hdr">
              <h3>Medications</h3>
              <button
                className="btn btn-teal"
                style={{ fontSize: 13, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => setShowAddModal(true)}
              >
                <FiPlus size={14} /> Add medication
              </button>
            </div>

            {medLoading && <p style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "1rem 0" }}>Loading medications...</p>}

            {!medLoading && activeMeds.length === 0 && (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--color-text-secondary)" }}>
                <FiPackage size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
                <p style={{ fontSize: 14 }}>No active medications. Add one above.</p>
              </div>
            )}

            {activeMeds.length > 0 && (
              <div className="med-manager-card">
                <div className="mm-header">
                  <div>Drug</div>
                  <div>Dosage</div>
                  <div>Frequency</div>
                  <div>Duration</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {activeMeds.map((med) => (
                  <article key={med.id} className="mm-row">
                    <div className="mm-drug-cell">
                      <div className="mm-icon">
                        {med.status === "interaction" ? <FiAlertTriangle style={{ color: "var(--color-text-danger)" }} /> : <FiPackage />}
                      </div>
                      <div>
                        <div className="mm-drug-name">{med.name}</div>
                        <div className="mm-drug-generic">{med.genericName}</div>
                      </div>
                    </div>
                    <div className="mm-cell">{med.dosage}</div>
                    <div className="mm-cell">
                      {med.frequency}
                      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{med.scheduleTime}</div>
                    </div>
                    <div className="mm-cell"><DurationLabel med={med} /></div>
                    <div>
                      <span className={`status-badge ${med.status === "interaction" ? "status-missed" : "status-taken"}`}>
                        {med.status === "interaction" ? "Alert" : "Active"}
                      </span>
                    </div>
                    <div className="mm-actions">
                      <button className="icon-btn" title="Edit" onClick={() => setEditingMed(med)}>
                        <FiEdit2 size={13} />
                      </button>
                      <button className="icon-btn" title="Stop medication (side effects / no longer needed)" onClick={() => stopMed(med.id)}>
                        <FiSquare size={13} />
                      </button>
                      <button className="icon-btn icon-btn-del" title="Delete (added by mistake)" onClick={() => deleteMed(med.id)}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          {historyMeds.length > 0 && (
            <div className="card-box">
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", padding: 0, marginBottom: showHistory ? 12 : 0 }}
                onClick={() => setShowHistory((v) => !v)}
              >
                {showHistory ? "▾" : "▸"} History ({historyMeds.length})
              </button>

              {showHistory && (
                <div className="med-manager-card">
                  <div className="mm-header">
                    <div>Drug</div>
                    <div>Dosage</div>
                    <div>Frequency</div>
                    <div>Reason</div>
                    <div>Stopped / ended</div>
                    <div>Actions</div>
                  </div>
                  {historyMeds.map((med) => {
                    const reason = med.status === "stopped" ? "Stopped" : "Course ended";
                    const date   = med.status === "stopped" && med.stoppedAt
                      ? formatDate(med.stoppedAt)
                      : med.endDate ? formatDate(med.endDate) : "—";
                    return (
                      <article key={med.id} className="mm-row" style={{ opacity: 0.6 }}>
                        <div className="mm-drug-cell">
                          <div className="mm-icon"><FiPackage /></div>
                          <div>
                            <div className="mm-drug-name">{med.name}</div>
                            <div className="mm-drug-generic">{med.genericName}</div>
                          </div>
                        </div>
                        <div className="mm-cell">{med.dosage}</div>
                        <div className="mm-cell">{med.frequency}</div>
                        <div className="mm-cell">
                          <span className="status-badge" style={{ background: "var(--color-background-secondary)", color: "var(--color-text-tertiary)" }}>
                            {reason}
                          </span>
                        </div>
                        <div className="mm-cell" style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{date}</div>
                        <div className="mm-actions">
                          <button className="icon-btn icon-btn-del" title="Delete record" onClick={() => deleteMed(med.id)}>
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddModal && <AddMedModal patientId={patientId} onClose={() => setShowAddModal(false)} onSaved={fetchMeds} />}
      {editingMed   && <EditMedModal patientId={patientId} med={editingMed} onClose={() => setEditingMed(null)} onSaved={fetchMeds} />}
    </CaregiverShell>
  );
}
