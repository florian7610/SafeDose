"use client";

import { useMemo, useState } from "react";
import { FiAlertOctagon, FiAlertTriangle, FiCheckCircle, FiSearch } from "react-icons/fi";
import { AppShell } from "@/components/layout/app-shell";
import { useAppState } from "@/components/providers/app-state-provider";
import { toInteractionViewModel } from "@/lib/mock-mappers";

export default function InteractionsPage() {
  const { medications, interactions } = useAppState();
  const [query, setQuery] = useState("");

  const medsById = useMemo(() => new Map(medications.map((med) => [med.id, med])), [medications]);
  const viewItems = useMemo(
    () => interactions.map((interaction) => toInteractionViewModel(interaction, medsById)),
    [interactions, medsById],
  );

  const filtered = useMemo(
    () =>
      viewItems.filter(
        (item) =>
          item.pairLabel.toLowerCase().includes(query.toLowerCase()) ||
          item.summary.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, viewItems],
  );

  const highCount = filtered.filter((item) => item.severityVariant === "high").length;
  const moderateCount = filtered.filter((item) => item.severityVariant === "moderate").length;
  const lowCount = filtered.filter((item) => item.severityVariant === "low").length;

  return (
    <AppShell title="Safety Center" subtitle="Review active medication interaction alerts">
      <section className="int-summary">
        <article className="int-sum-card">
          <div className="int-sum-icon" style={{ background: "var(--danger-soft)" }}><FiAlertOctagon /></div>
          <div>
            <div className="int-sum-val" style={{ color: "var(--danger)" }}>{highCount}</div>
            <div className="int-sum-lbl">High Risk</div>
          </div>
        </article>

        <article className="int-sum-card">
          <div className="int-sum-icon" style={{ background: "var(--warn-soft)" }}><FiAlertTriangle /></div>
          <div>
            <div className="int-sum-val" style={{ color: "var(--warn)" }}>{moderateCount}</div>
            <div className="int-sum-lbl">Moderate Risk</div>
          </div>
        </article>

        <article className="int-sum-card">
          <div className="int-sum-icon" style={{ background: "var(--safe-soft)" }}><FiCheckCircle /></div>
          <div>
            <div className="int-sum-val" style={{ color: "var(--safe)" }}>{lowCount}</div>
            <div className="int-sum-lbl">Low Risk</div>
          </div>
        </article>
      </section>

      <section>
        <div className="int-search-bar">
          <span><FiSearch /></span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search interaction"
          />
        </div>

        <div className="section-hdr">
          <h3>Active Interactions</h3>
          <span className="view-all">{filtered.length} checks</span>
        </div>

        <div>
          {filtered.map((interaction) => (
            <article
              key={interaction.id}
              className="interaction-card"
              style={{
                borderLeftColor:
                  interaction.severityVariant === "high"
                    ? "var(--danger)"
                    : interaction.severityVariant === "moderate"
                      ? "var(--warn)"
                      : "var(--safe)",
              }}
            >
              <div className="int-header">
                <div className="int-drugs">
                  <span className="int-drug">{interaction.pairLabel.split(" + ")[0] ?? interaction.pairLabel}</span>
                  {interaction.pairLabel.includes(" + ") ? <span className="int-plus">+</span> : null}
                  {interaction.pairLabel.includes(" + ") ? (
                    <span className="int-drug">{interaction.pairLabel.split(" + ")[1]}</span>
                  ) : null}
                </div>

                <span
                  className={
                    interaction.severityVariant === "high"
                      ? "int-sev sev-high"
                      : interaction.severityVariant === "moderate"
                        ? "int-sev sev-mod"
                        : "int-sev"
                  }
                >
                  {interaction.severityLabel}
                </span>
              </div>

              <p className="int-desc">{interaction.summary}</p>
              <p style={{ margin: 0, color: "var(--gray-400)", fontSize: "12px" }}>
                Recommendation: {interaction.recommendation}
              </p>
            </article>
          ))}

          {filtered.length === 0 ? <div style={{ color: "var(--gray-400)", padding: "20px 0" }}>No interactions found.</div> : null}
        </div>
      </section>
    </AppShell>
  );
}
