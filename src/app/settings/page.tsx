// src/app/settings/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FiAlertTriangle, FiSave, FiTrash2 } from "react-icons/fi";
import { AppShell } from "@/components/layout/app-shell";
import { usePatientState } from "@/components/providers/app-state-provider";
import type { UpdateUserProfileRequestDto } from "@/types/contracts";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUserProfile, deleteAccount } = usePatientState();
  const [saved,          setSaved]          = useState(false);
  const [deleteConfirm,  setDeleteConfirm]  = useState("");
  const [accountDeleted, setAccountDeleted] = useState(false);

  const defaultValues = useMemo<UpdateUserProfileRequestDto>(
    () => ({
      firstName: user?.firstName ?? "",
<<<<<<< Updated upstream
      lastName:  user?.lastName  ?? "",
      email:     user?.email     ?? "",
      role:      user?.role      ?? "patient",
=======
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      address: user?.address ?? "",
      role: user?.role ?? "patient",
>>>>>>> Stashed changes
    }),
    [user]
  );

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<UpdateUserProfileRequestDto>({ defaultValues });

  useEffect(() => { reset(defaultValues); }, [defaultValues, reset]);

  const onSave = handleSubmit((values) => {
    updateUserProfile(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  const onDelete = () => {
    deleteAccount();
    setAccountDeleted(true);
    setTimeout(() => router.push("/"), 1200);
  };

  return (
    <AppShell title="Settings" subtitle="Update your profile and account preferences">
      <section className="settings-grid">
        {/* ── Profile ── */}
        <article className="card-box">
          <div className="section-hdr"><h3>Profile information</h3></div>

          <form className="form-row" onSubmit={onSave} noValidate>
            <div className="form-row-2">
              <div className="form-grp">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  {...register("firstName", {
                    validate: (v) => v.trim().length >= 2 || "First name is required.",
                  })}
                />
                {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
              </div>
              <div className="form-grp">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  {...register("lastName", {
                    validate: (v) => v.trim().length >= 2 || "Last name is required.",
                  })}
                />
                {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="form-grp">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  validate: (v) => v.includes("@") || "Enter a valid email address.",
                })}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-grp">
<<<<<<< Updated upstream
              <label htmlFor="role">Account role</label>
=======
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                {...register("phoneNumber", {
                  validate: (value) => value.trim().length >= 10 || "Valid phone number is required.",
                })}
              />
              {errors.phoneNumber ? <p className="form-error">{errors.phoneNumber.message}</p> : null}
            </div>

            <div className="form-grp">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                {...register("address", {
                  validate: (value) => value.trim().length >= 5 || "Address is required.",
                })}
              />
              {errors.address ? <p className="form-error">{errors.address.message}</p> : null}
            </div>

            <div className="form-grp">
              <label htmlFor="role">Account Role</label>
>>>>>>> Stashed changes
              <select id="role" className="settings-select" {...register("role")}>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button className="btn btn-teal settings-save" type="submit">
              <FiSave /> Save changes
            </button>

            {saved && <p className="settings-msg">Profile updated successfully.</p>}
          </form>
        </article>

        {/* ── Danger zone ── */}
        <article className="card-box danger-box">
          <div className="section-hdr"><h3>Danger zone</h3></div>

          <p className="danger-copy">
            Deleting your account removes all medication and interaction data.
          </p>

          <label className="danger-label" htmlFor="delete-confirm">
            Type DELETE to confirm account deletion.
          </label>
          <input
            id="delete-confirm"
            className="danger-input"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />

          <button
            className="btn danger-btn"
            type="button"
            onClick={onDelete}
            disabled={deleteConfirm !== "DELETE" || accountDeleted}
          >
            <FiTrash2 />
            {accountDeleted ? "Account deleted" : "Delete account"}
          </button>

          {accountDeleted && (
            <p className="danger-confirm">
              <FiAlertTriangle /> Account deleted. Redirecting...
            </p>
          )}
        </article>
      </section>
    </AppShell>
  );
}
