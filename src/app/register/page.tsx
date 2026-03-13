"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { FiAlertTriangle, FiCheckCircle, FiPackage } from "react-icons/fi";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(() => {
    // Validation only; submit integration can be added when auth API is connected.
  });

  return (
    <div className="auth-wrapper">
      <section className="auth-left">
        <div className="auth-left-content">
          <div className="logo">
            Safe<span>Dose</span>
          </div>
          <h2>
            Take control of medication safety.
          </h2>
          <p>Create an account to manage adherence tracking and safety monitoring across all pages.</p>

          <div className="auth-trust">
            <div className="trust-item">
              <span className="trust-icon"><FiPackage /></span>
              Add medications quickly
            </div>
            <div className="trust-item">
              <span className="trust-icon"><FiAlertTriangle /></span>
              Review interaction alerts
            </div>
            <div className="trust-item">
              <span className="trust-icon"><FiCheckCircle /></span>
              Track daily adherence
            </div>
          </div>
        </div>
      </section>

      <section className="auth-right">
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <h3>Create Account</h3>
          <p className="sub">Set up your SafeDose profile</p>

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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register("password", {
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters.",
                },
              })}
            />
            {errors.password ? <p className="form-error">{errors.password.message}</p> : null}
          </div>

          <div className="form-grp">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                validate: (value) => value === getValues("password") || "Passwords must match.",
              })}
            />
            {errors.confirmPassword ? <p className="form-error">{errors.confirmPassword.message}</p> : null}
          </div>

          <button className="btn btn-teal btn-full" type="submit">
            Create Account
          </button>

          <Link href="/dashboard" className="btn btn-outline btn-full" style={{ textAlign: "center" }}>
            Continue to Dashboard
          </Link>

          <p className="auth-switch">
            Already registered? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
