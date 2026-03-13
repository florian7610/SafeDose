"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { FiBarChart2, FiLock, FiShield } from "react-icons/fi";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
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
            Welcome back.
          </h2>
          <p>Sign in to review your medications, interactions, and adherence dashboard.</p>

          <div className="auth-trust">
            <div className="trust-item">
              <span className="trust-icon"><FiLock /></span>
              JWT-secured sessions
            </div>
            <div className="trust-item">
              <span className="trust-icon"><FiShield /></span>
              Protected route access
            </div>
            <div className="trust-item">
              <span className="trust-icon"><FiBarChart2 /></span>
              Personalized dashboard
            </div>
          </div>
        </div>
      </section>

      <section className="auth-right">
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <h3>Sign In</h3>
          <p className="sub">Access your medication dashboard</p>

          <div className="form-grp">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register("email", {
                validate: (value) => value.includes("@") || "Enter a valid email address.",
              })}
              placeholder="you@example.com"
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
                  message: "Password must contain at least 8 characters.",
                },
              })}
              placeholder="Minimum 8 characters"
            />
            {errors.password ? <p className="form-error">{errors.password.message}</p> : null}
          </div>

          <button className="btn btn-teal btn-full" type="submit">
            Sign In
          </button>

          <Link href="/dashboard" className="btn btn-outline btn-full" style={{ textAlign: "center" }}>
            Continue to Dashboard
          </Link>

          <p className="auth-switch">
            No account yet? <Link href="/register">Register</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
