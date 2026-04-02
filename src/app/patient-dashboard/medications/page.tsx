// src/app/patient-dashboard/medications/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FiPackage, FiSearch, FiSquare, FiTrash2 } from "react-icons/fi";
import { AppShell } from "@/components/layout/app-shell";
import { usePatientState } from "@/components/providers/app-state-provider";
import { FREQUENCY_OPTIONS, isInHistory } from "@/lib/medication-utils";

interface AddMedicationFormValues {
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

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function PatientMedicationsPage() {
  const { medications, addMedication, stopMedication, removeMedication } = usePatientState();
  const [query, setQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, reset, watch, formState: { errors } } =
    useForm<AddMedicationFormValues>({
      defaultValues: {
        name: "", genericName: "", dosage: "", frequency: FREQUENCY_OPTIONS[0],
        scheduleTime: "", rxcui: "", startDate: today, endDate: "", isOngoing: true,
      },
    });

  const isOngoing = watch("isOngoing");

  const activeMeds = medications.filter((m) => !isInHistory(m));
  const historyMeds = medications.filter((m) => isInHistory(m));

  const filtered = useMemo(
    () => activeMeds.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    [activeMeds, query]
  );

  const onAdd = handleSubmit((values) => {
    addMedication({
      name:         values.name,
      genericName:  values.genericName,
      dosage:       values.dosage,
      frequency:    values.frequency,
      scheduleTime: values.scheduleTime,
      rxcui:        values.rxcui.trim() || "",
      startDate:    values.startDate,
      endDate:      values.isOngoing ? null : (values.endDate || null),
      isOngoing:    values.isOngoing,
    });
    reset({ name: "", genericName: "", dosage: "", frequency: FREQUENCY_OPTIONS[0],
            scheduleTime: "", rxcui: "", startDate: today, endDate: "", isOngoing: true });
  });

  return (
    <AppShell
      title="My Medications"
      subtitle="Add, search, and manage your medications"
      allowedRoles={["admin", "patient"]}
    >
      {/* ── Add form ── */}
      <section className="card-box" style={{ marginBottom: 20 }}>
        <div className="section-hdr"><h3>Add medication</h3></div>

        <form className="form-row" onSubmit={onAdd} noValidate>
          <div className="form-row-2">
            <div className="form-grp">
              <label htmlFor="name">Drug name</label>
              <input
                id="name"
                {...register("name", { validate: (v) => v.trim().length > 0 || "Drug name is required." })}
                placeholder="Metformin"
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div className="form-grp">
              <label htmlFor="genericName">Generic name</label>
              <input
                id="genericName"
                {...register("genericName", { validate: (v) => v.trim().length > 0 || "Generic name is required." })}
                placeholder="metformin hydrochloride"
              />
              {errors.genericName && <p className="form-error">{errors.genericName.message}</p>}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-grp">
              <label htmlFor="dosage">Dosage</label>
              <input
                id="dosage"
                {...register("dosage", {
                  validate: (v) => /^\d+\s?(mg|mcg|g|ml)$/i.test(v.trim()) || "Use format like 500mg.",
                })}
                placeholder="500mg"
              />
              {errors.dosage && <p className="form-error">{errors.dosage.message}</p>}
            </div>
            <div className="form-grp">
              <label htmlFor="frequency">Frequency</label>
              <select id="frequency" {...register("frequency")}>
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-grp">
              <label htmlFor="scheduleTime">Scheduled time</label>
              <input
                id="scheduleTime"
                type="time"
                {...register("scheduleTime", { validate: (v) => v.trim().length > 0 || "Time is required." })}
              />
              {errors.scheduleTime && <p className="form-error">{errors.scheduleTime.message}</p>}
            </div>
            <div className="form-grp">
              <label htmlFor="rxcui">RxCUI (optional)</label>
              <input id="rxcui" {...register("rxcui")} placeholder="860975" />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-grp">
              <label htmlFor="startDate">Start date</label>
              <input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="form-grp">
              <label htmlFor="endDate">End date</label>
              <input
                id="endDate"
                type="date"
                disabled={isOngoing}
                {...register("endDate", {
                  validate: (v, vals) =>
                    vals.isOngoing || v.trim().length > 0 || "End date required for non-ongoing medications.",
                })}
                style={{ opacity: isOngoing ? 0.4 : 1 }}
              />
              {errors.endDate && <p className="form-error">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="form-grp" style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}>
            <input
              id="isOngoing"
              type="checkbox"
              {...register("isOngoing")}
              style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }}
            />
            <label htmlFor="isOngoing" style={{ margin: 0, cursor: "pointer", fontSize: 14 }}>
              Ongoing / chronic medication (no end date)
            </label>
          </div>

          <button className="btn btn-teal" type="submit">Save medication</button>
        </form>
      </section>

      {/* ── Active medications table ── */}
      <section>
        <div className="page-hdr">
          <div className="search-bar">
            <span className="search-icon"><FiSearch /></span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your medications..."
            />
          </div>
        </div>

        <div className="med-manager-card">
          <div className="mm-header">
            <div>Drug name</div>
            <div>Dosage</div>
            <div>Frequency</div>
            <div>Duration</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {filtered.map((med) => (
            <article key={med.id} className="mm-row">
              <div className="mm-drug-cell">
                <div className="mm-icon"><FiPackage /></div>
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
              <div className="mm-cell">
                {med.isOngoing
                  ? <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Ongoing</span>
                  : med.endDate
                    ? <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Until {formatDate(med.endDate)}</span>
                    : <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>—</span>
                }
              </div>
              <div>
                <span className={`status-badge ${med.status === "interaction" ? "status-missed" : "status-taken"}`}>
                  {med.status === "interaction" ? "Alert" : "Active"}
                </span>
              </div>
              <div className="mm-actions">
                <button
                  className="icon-btn"
                  type="button"
                  title="Stop medication (side effects / no longer needed)"
                  onClick={() => stopMedication(med.id)}
                >
                  <FiSquare size={13} />
                </button>
                <button
                  className="icon-btn icon-btn-del"
                  type="button"
                  title="Delete (added by mistake)"
                  onClick={() => removeMedication(med.id)}
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: 20, color: "var(--color-text-tertiary)", fontSize: 14 }}>
              {query ? "No medications match your search." : "No active medications. Add one above."}
            </div>
          )}
        </div>

        {/* ── History ── */}
        {historyMeds.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}
              onClick={() => setShowHistory((v) => !v)}
            >
              {showHistory ? "▾" : "▸"} History ({historyMeds.length})
            </button>

            {showHistory && (
              <div className="med-manager-card">
                <div className="mm-header">
                  <div>Drug name</div>
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
                        <button
                          className="icon-btn icon-btn-del"
                          type="button"
                          title="Delete record"
                          onClick={() => removeMedication(med.id)}
                        >
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
      </section>
    </AppShell>
  );
}
