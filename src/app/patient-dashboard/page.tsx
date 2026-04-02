// src/app/patient-dashboard/page.tsx

"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiPackage,
} from "react-icons/fi";
import { AppShell } from "@/components/layout/app-shell";
import { usePatientState } from "@/components/providers/app-state-provider";
import { buildDashboardStats } from "@/lib/mock-mappers";
import { isDueToday } from "@/lib/medication-utils";

export default function PatientDashboardPage() {
  const { user, medications, interactions, toggleDose } = usePatientState();

  const activeMeds = medications.filter((m) => isDueToday(m));
  const stats        = buildDashboardStats(activeMeds, interactions);
  // total individual doses due vs taken today
  const totalDoses = activeMeds.reduce((sum, m) => sum + m.dosesPerDay, 0);
  const takenDoses = activeMeds.reduce((sum, m) => sum + m.takenIndices.length, 0);
  const openAlerts   = interactions.filter((i) => !i.reviewed).length;

  return (
    <AppShell
      title="Dashboard"
      subtitle="Medication overview and daily dose tracking"
      allowedRoles={["admin", "patient"]}
    >
      {/* ── Stats ── */}
      <section className="stat-grid">
        {stats.map((stat) => {
          const icon =
            stat.id === "stat-meds"      ? <FiPackage />      :
            stat.id === "stat-adherence" ? <FiCheckCircle />  :
            stat.id === "stat-alerts"    ? <FiAlertTriangle /> :
                                           <FiClock />;
          return (
            <article key={stat.id} className="stat-card">
              <div className="stat-icon">{icon}</div>
              <div className="stat-val">{stat.value}</div>
              <div className="stat-lbl">{stat.label}</div>
              <div className="stat-change">{stat.trendLabel}</div>
            </article>
          );
        })}
      </section>

      <section className="dash-grid">
        {/* ── Today's dose checklist ── */}
        <div className="card-box">
          <div className="section-hdr">
            <h3>Today&apos;s doses</h3>
            <span className="view-all">{takenDoses} of {totalDoses} taken</span>
          </div>

          {activeMeds.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", padding: "1rem 0" }}>
              No active medications. <Link href="/patient-dashboard/medications">Add one</Link>.
            </p>
          )}

          {activeMeds.map((med) => {
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

                <span className={`status-badge ${
                  allTaken ? "status-taken" : hasAlert ? "status-missed" : "status-due"
                }`}>
                  {allTaken ? "Done" : hasAlert ? "Alert" : "Pending"}
                </span>
              </article>
            );
          })}
        </div>

        {/* ── Sidebar ── */}
        <aside style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card-box">
            <div className="section-hdr"><h3>Quick links</h3></div>
            <div style={{ display: "grid", gap: 10 }}>
              <Link className="btn btn-outline" href="/patient-dashboard/medications" style={{ textAlign: "center" }}>
                Manage medications
              </Link>
              <Link className="btn btn-outline" href="/patient-dashboard/interactions" style={{ textAlign: "center" }}>
                Safety center {openAlerts > 0 && `(${openAlerts})`}
              </Link>
              <Link className="btn btn-outline" href="/drugs" style={{ textAlign: "center" }}>
                Drug directory
              </Link>
            </div>
          </div>

          {openAlerts > 0 && (
            <div className="card-box" style={{ borderColor: "var(--color-border-danger)" }}>
              <div className="section-hdr">
                <h3 style={{ color: "var(--color-text-danger)" }}>
                  <FiAlertTriangle style={{ display: "inline", marginRight: 6 }} />
                  Interaction alerts
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
                You have {openAlerts} unreviewed drug interaction{openAlerts !== 1 ? "s" : ""}.
              </p>
              <Link
                href="/patient-dashboard/interactions"
                className="btn btn-outline"
                style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: 13 }}
              >
                Review now
              </Link>
            </div>
          )}

          <div className="card-box">
            <div className="section-hdr"><h3>Account</h3></div>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-secondary)" }}>
              Signed in as <strong>{user?.firstName} {user?.lastName}</strong>
            </p>
            <Link className="btn btn-outline" href="/settings" style={{ textAlign: "center", display: "block", fontSize: 13 }}>
              Settings
            </Link>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
