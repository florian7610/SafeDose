"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FiAlertTriangle, FiSave, FiTrash2 } from "react-icons/fi";
import { AppShell } from "@/components/layout/app-shell";
import { useAppState } from "@/components/providers/app-state-provider";
import type { UpdateUserProfileRequestDto } from "@/types/contracts";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUserProfile, deleteAccount } = useAppState();
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [accountDeleted, setAccountDeleted] = useState(false);
  const defaultProfileValues = useMemo<UpdateUserProfileRequestDto>(
    () => ({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "patient",
    }),
    [user],
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserProfileRequestDto>({
    defaultValues: defaultProfileValues,
  });

  useEffect(() => {
    reset(defaultProfileValues);
  }, [defaultProfileValues, reset]);

  const onSave = handleSubmit((values) => {
    updateUserProfile(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  });

  const onDeleteAccount = () => {
    deleteAccount();
    setAccountDeleted(true);
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  return (
    <AppShell title="Settings" subtitle="Update your profile and account preferences">
      <section className="settings-grid">
        <article className="card-box">
          <div className="section-hdr">
            <h3>Profile Information</h3>
          </div>

          <form className="form-row" onSubmit={onSave} noValidate>
            <div className="form-row-2">
              <div className="form-grp">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  {...register("firstName", {
                    validate: (value) => value.trim().length >= 2 || "First name is required.",
                  })}
                />
                {errors.firstName ? <p className="form-error">{errors.firstName.message}</p> : null}
              </div>

              <div className="form-grp">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  {...register("lastName", {
                    validate: (value) => value.trim().length >= 2 || "Last name is required.",
                  })}
                />
                {errors.lastName ? <p className="form-error">{errors.lastName.message}</p> : null}
              </div>
            </div>

            <div className="form-grp">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  validate: (value) => value.includes("@") || "Enter a valid email address.",
                })}
              />
              {errors.email ? <p className="form-error">{errors.email.message}</p> : null}
            </div>

            <div className="form-grp">
              <label htmlFor="role">Account Role</label>
              <select id="role" className="settings-select" {...register("role")}>
                <option value="patient">Patient</option>
                <option value="caregiver">Caregiver</option>
              </select>
            </div>

            <button className="btn btn-teal settings-save" type="submit">
              <FiSave />
              Save Changes
            </button>

            {saved ? <p className="settings-msg">Profile updated successfully.</p> : null}
          </form>
        </article>

        <article className="card-box danger-box">
          <div className="section-hdr">
            <h3>Danger Zone</h3>
          </div>

          <p className="danger-copy">
            Deleting your account removes all medication and interaction data from this app session.
          </p>

          <label className="danger-label" htmlFor="delete-confirm">
            Type DELETE to confirm account deletion.
          </label>
          <input
            id="delete-confirm"
            className="danger-input"
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            placeholder="DELETE"
          />

          <button
            className="btn danger-btn"
            type="button"
            onClick={onDeleteAccount}
            disabled={deleteConfirm !== "DELETE" || accountDeleted}
          >
            <FiTrash2 />
            {accountDeleted ? "Account Deleted" : "Delete Account"}
          </button>

          {accountDeleted ? (
            <p className="danger-confirm">
              <FiAlertTriangle />
              Account deleted. Redirecting to home...
            </p>
          ) : null}
        </article>
      </section>
    </AppShell>
  );
}
