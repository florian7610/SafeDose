// src/app/login/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiBarChart2, FiLock, FiShield } from "react-icons/fi";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } =
    useForm<LoginFormValues>({ defaultValues: { email: "", password: "" } });

  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (res.ok) {
        const json = await res.json();
        const role = json.user?.role;
        if (role === "admin")      router.push("/admin");
        else if (role === "caregiver") router.push("/caregiver-dashboard");
        else                       router.push("/patient-dashboard");
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Invalid credentials");
      }
    } catch {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="auth-wrapper">
      <section className="auth-left">
        <div className="auth-left-content">
          <div className="logo">Safe<span>Dose</span></div>
          <h2>Welcome back.</h2>
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
                validate: (v) => v.includes("@") || "Enter a valid email address.",
              })}
              placeholder="you@example.com"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-grp">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register("password", {
                minLength: { value: 8, message: "Password must be at least 8 characters." },
              })}
              placeholder="Minimum 8 characters"
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {errorMsg && (
            <p className="form-error" style={{ marginBottom: "1rem", color: "#f87171" }}>
              {errorMsg}
            </p>
          )}

          <button className="btn btn-teal btn-full" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <p className="auth-switch">
            No account yet? <Link href="/register">Register</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
