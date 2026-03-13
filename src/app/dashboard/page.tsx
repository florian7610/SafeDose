"use client";

import Link from "next/link";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiPackage } from "react-icons/fi";
import { AppShell } from "@/components/layout/app-shell";
import { useAppState } from "@/components/providers/app-state-provider";
import { buildDashboardStats, toMedicationViewModel } from "@/lib/mock-mappers";

export default function DashboardPage() {
  const { medications, interactions, toggleDoseTaken } = useAppState();
  const stats = buildDashboardStats(medications, interactions);
  const medicationView = medications.map(toMedicationViewModel);
  const takenToday = medicationView.filter((med) => med.takenToday).length;

  return (
    <AppShell title="Dashboard" subtitle="Medication overview and daily dose tracking">
      <section className="stat-grid">
        {stats.map((stat) => {
          const icon =
            stat.id === "stat-meds"
              ? <FiPackage />
              : stat.id === "stat-adherence"
                ? <FiCheckCircle />
                : stat.id === "stat-alerts"
                  ? <FiAlertTriangle />
                  : <FiClock />;

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
        <div className="card-box">
          <div className="section-hdr">
            <h3>Today&apos;s Doses</h3>
            <span className="view-all">{takenToday} of {medicationView.length} taken</span>
          </div>

          <div>
            {medicationView.map((med) => (
              <article key={med.id} className="check-item">
                <button
                  className={med.takenToday ? "check-box checked" : "check-box"}
                  type="button"
                  onClick={() => toggleDoseTaken(med.id)}
                  aria-label={med.takenToday ? "Mark pending" : "Mark taken"}
                >
                  {med.takenToday ? "✓" : ""}
                </button>

                <div className="check-body">
                  <div className="check-name">{med.title}</div>
                  <div className="check-time">{med.subtitle} · {med.timeLabel}</div>
                </div>

                <span className={`status-badge ${med.takenToday ? "status-taken" : "status-due"}`}>
                  {med.takenToday ? "Taken" : "Pending"}
                </span>
              </article>
            ))}
          </div>
        </div>

        <aside style={{ display: "grid", gap: "16px" }}>
          <div className="card-box">
            <div className="section-hdr">
              <h3>Quick Links</h3>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              <Link className="btn btn-outline" href="/meds" style={{ textAlign: "center" }}>
                Manage Medications
              </Link>
              <Link className="btn btn-outline" href="/interactions" style={{ textAlign: "center" }}>
                View Interactions
              </Link>
            </div>
          </div>

          <div className="card-box">
            <div className="section-hdr">
              <h3>Architecture</h3>
            </div>
            <p style={{ margin: 0, color: "var(--gray-600)", fontSize: "0.87rem" }}>
              C4 model and API contract are included in the project docs folder.
            </p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
