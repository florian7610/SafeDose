"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FiPackage, FiSearch, FiTrash2 } from "react-icons/fi";
import { AppShell } from "@/components/layout/app-shell";
import { useAppState } from "@/components/providers/app-state-provider";

interface AddMedicationFormValues {
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  rxcui: string;
}

export default function MedManagerPage() {
  const { medications, addMedication, removeMedication } = useAppState();
  const [query, setQuery] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMedicationFormValues>({
    defaultValues: {
      name: "",
      genericName: "",
      dosage: "",
      frequency: "",
      scheduleTime: "",
      rxcui: "",
    },
  });

  const filtered = useMemo(
    () => medications.filter((med) => med.name.toLowerCase().includes(query.toLowerCase())),
    [medications, query],
  );

  const onAdd = handleSubmit((values) => {
    addMedication({
      name: values.name,
      genericName: values.genericName,
      dosage: values.dosage,
      frequency: values.frequency,
      scheduleTime: values.scheduleTime,
      rxcui: values.rxcui.trim() || "manual-rxcui",
    });

    reset();
  });

  return (
    <AppShell title="My Medications" subtitle="Add, search, and remove medications">
      <section className="card-box" style={{ marginBottom: "20px" }}>
        <div className="section-hdr">
          <h3>Add Medication</h3>
        </div>

        <form className="form-row" onSubmit={onAdd} noValidate>
          <div className="form-row-2">
            <div className="form-grp">
              <label htmlFor="name">Drug Name</label>
              <input
                id="name"
                {...register("name", {
                  validate: (value) => value.trim().length > 0 || "Drug name is required.",
                })}
              />
              {errors.name ? <p className="form-error">{errors.name.message}</p> : null}
            </div>
            <div className="form-grp">
              <label htmlFor="genericName">Generic Name</label>
              <input
                id="genericName"
                {...register("genericName", {
                  validate: (value) => value.trim().length > 0 || "Generic name is required.",
                })}
              />
              {errors.genericName ? <p className="form-error">{errors.genericName.message}</p> : null}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-grp">
              <label htmlFor="dosage">Dosage</label>
              <input
                id="dosage"
                {...register("dosage", {
                  validate: (value) =>
                    /^\d+\s?(mg|mcg|g|ml)$/i.test(value.trim()) || "Use dosage format like 500mg.",
                })}
                placeholder="500mg"
              />
              {errors.dosage ? <p className="form-error">{errors.dosage.message}</p> : null}
            </div>
            <div className="form-grp">
              <label htmlFor="frequency">Frequency</label>
              <input
                id="frequency"
                {...register("frequency", {
                  validate: (value) => value.trim().length > 0 || "Frequency is required.",
                })}
                placeholder="Twice daily"
              />
              {errors.frequency ? <p className="form-error">{errors.frequency.message}</p> : null}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-grp">
              <label htmlFor="scheduleTime">Scheduled Time</label>
              <input
                id="scheduleTime"
                type="time"
                {...register("scheduleTime", {
                  validate: (value) => value.trim().length > 0 || "Time is required.",
                })}
              />
              {errors.scheduleTime ? <p className="form-error">{errors.scheduleTime.message}</p> : null}
            </div>
            <div className="form-grp">
              <label htmlFor="rxcui">RxCUI (optional)</label>
              <input id="rxcui" {...register("rxcui")} placeholder="860975" />
            </div>
          </div>

          <button className="btn btn-teal" type="submit">
            Save Medication
          </button>
        </form>
      </section>

      <section>
        <div className="page-hdr">
          <div className="search-bar">
            <span className="search-icon"><FiSearch /></span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your medications..."
            />
          </div>
        </div>

        <div className="med-manager-card">
          <div className="mm-header">
            <div>Drug Name</div>
            <div>Dosage</div>
            <div>Frequency</div>
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
              <div className="mm-cell">{med.frequency}</div>

              <div>
                <span className={`status-badge ${med.status === "interaction" ? "status-missed" : "status-taken"}`}>
                  {med.status === "interaction" ? "Alert" : "Active"}
                </span>
              </div>

              <div className="mm-actions">
                <button className="icon-btn icon-btn-del" type="button" onClick={() => removeMedication(med.id)}>
                  <FiTrash2 />
                </button>
              </div>
            </article>
          ))}

          {filtered.length === 0 ? <div style={{ padding: "20px", color: "var(--gray-400)" }}>No medications found.</div> : null}
        </div>
      </section>
    </AppShell>
  );
}
