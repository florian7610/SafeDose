// src/app/patient-dashboard/interactions/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  FiAlertOctagon,
  FiAlertTriangle,
  FiCheckCircle,
  FiSearch,
} from "react-icons/fi";
import { AppShell } from "@/components/layout/app-shell";
import { usePatientState } from "@/components/providers/app-state-provider";
import { toInteractionViewModel } from "@/lib/mock-mappers";

export default function PatientInteractionsPage() {
  const { medications, interactions } = usePatientState();
  const [query, setQuery] = useState("");

  const medsById = useMemo(
    () => new Map(medications.map((m) => [m.id, m])),
    [medications]
  );

  const viewItems = useMemo(
    () => interactions.map((i) => toInteractionViewModel(i, medsById)),
    [interactions, medsById]
  );

  const filtered = useMemo(
    () =>
      viewItems.filter(
        (item) =>
          item.pairLabel.toLowerCase().includes(query.toLowerCase()) ||
          item.summary.toLowerCase().includes(query.toLowerCase())
      ),
    [query, viewItems]
  );

  const highCount     = filtered.filter((i) => i.severityVariant === "high").length;
  const moderateCount = filtered.filter((i) => i.severityVariant === "moderate").length;
  const lowCount      = filtered.filter((i) => i.severityVariant === "low").length;

  return (
    <AppShell
      title="Safety Center"
      subtitle="Review active medication interaction alerts"
      allowedRoles={["admin", "patient"]}
    >
      {/* ── Summary cards ── */}
      <section className="int-summary">
        <article className="int-sum-card">
          <div className="int-sum-icon" style={{ background: "var(--danger-soft)" }}>
            <FiAlertOctagon />
          </div>
          <div>
            <div className="int-sum-val" style={{ color: "var(--danger)" }}>{highCount}</div>
            <div className="int-sum-lbl">High risk</div>
          </div>
        </article>

        <article className="int-sum-card">
          <div className="int-sum-icon" style={{ background: "var(--warn-soft)" }}>
            <FiAlertTriangle />
          </div>
          <div>
            <div className="int-sum-val" style={{ color: "var(--warn)" }}>{moderateCount}</div>
            <div className="int-sum-lbl">Moderate risk</div>
          </div>
        </article>

        <article className="int-sum-card">
          <div className="int-sum-icon" style={{ background: "var(--safe-soft)" }}>
            <FiCheckCircle />
          </div>
          <div>
            <div className="int-sum-val" style={{ color: "var(--safe)" }}>{lowCount}</div>
            <div className="int-sum-lbl">Low risk</div>
          </div>
        </article>
      </section>

      {/* ── Interaction list ── */}
      <section>
        <div className="int-search-bar">
          <span><FiSearch /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search interactions..."
          />
        </div>

        <div className="section-hdr">
          <h3>Active interactions</h3>
          <span className="view-all">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 && (
          <p style={{ color: "var(--color-text-tertiary)", fontSize: 14, padding: "20px 0" }}>
            {query ? "No interactions match your search." : "No drug interactions recorded."}
          </p>
        )}

        {filtered.map((interaction) => (
          <article
            key={interaction.id}
            className="interaction-card"
            style={{
              borderLeftColor:
                interaction.severityVariant === "high"     ? "var(--danger)" :
                interaction.severityVariant === "moderate" ? "var(--warn)"   :
                                                             "var(--safe)",
            }}
          >
            <div className="int-header">
              <div className="int-drugs">
                <span className="int-drug">
                  {interaction.pairLabel.split(" + ")[0] ?? interaction.pairLabel}
                </span>
                {interaction.pairLabel.includes(" + ") && (
                  <>
                    <span className="int-plus">+</span>
                    <span className="int-drug">{interaction.pairLabel.split(" + ")[1]}</span>
                  </>
                )}
              </div>
              <span className={
                interaction.severityVariant === "high"     ? "int-sev sev-high" :
                interaction.severityVariant === "moderate" ? "int-sev sev-mod"  :
                                                             "int-sev"
              }>
                {interaction.severityLabel}
              </span>
            </div>

            <p className="int-desc">{interaction.summary}</p>
            <p style={{ margin: 0, color: "var(--gray-400)", fontSize: 12 }}>
              Recommendation: {interaction.recommendation}
            </p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
