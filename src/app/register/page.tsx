"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiAlertTriangle, FiCheckCircle, FiPackage } from "react-icons/fi";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
<<<<<<< Updated upstream
  role: "patient" | "caregiver";
=======
  phoneNumber: string;
  address: string;
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      role: "patient",
=======
      phoneNumber: "",
      address: "",
>>>>>>> Stashed changes
    },
  });

  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
<<<<<<< Updated upstream
          role: data.role,
=======
          phoneNumber: data.phoneNumber,
          address: data.address,
>>>>>>> Stashed changes
        }),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.message || "Registration failed");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="auth-wrapper">
      <section className="auth-left">
        <div className="auth-left-content">
          <div className="logo">
            Safe<span>Dose</span>
          </div>
          <h2>
            Take control of <br /> medication safety.
          </h2>
          <p>
            Join SafeDose today and experience a smarter way to manage your health. 
            Track prescriptions, discover interactions, and never miss a dose again.
          </p>

          <div className="auth-trust">
            <div className="trust-item">
              <span className="trust-icon"><FiPackage /></span>
              <span><strong>Smart Inventory:</strong> Add medications in seconds</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon"><FiAlertTriangle /></span>
              <span><strong>Safety Guard:</strong> Real-time interaction alerts</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon"><FiCheckCircle /></span>
              <span><strong>Adherence Pro:</strong> Detailed habit tracking</span>
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
                placeholder="John"
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
                placeholder="Doe"
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
              placeholder="john@example.com"
              {...register("email", {
                validate: (value) => value.includes("@") || "Enter a valid email address.",
              })}
            />
            {errors.email ? <p className="form-error">{errors.email.message}</p> : null}
          </div>

          <div className="form-grp">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
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
              placeholder="123 Health St, Wellness City, NY 10001"
              {...register("address", {
                validate: (value) => value.trim().length >= 5 || "Address is required.",
              })}
            />
            {errors.address ? <p className="form-error">{errors.address.message}</p> : null}
          </div>

          <div className="form-grp">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
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
              placeholder="Repeat password"
              {...register("confirmPassword", {
                validate: (value) => value === getValues("password") || "Passwords must match.",
              })}
            />
            {errors.confirmPassword ? <p className="form-error">{errors.confirmPassword.message}</p> : null}
          </div>

          <div className="form-grp">
            <label htmlFor="role">I am a</label>
            <select
              id="role"
              {...register("role")}
            >
              <option value="patient">Patient</option>
              <option value="caregiver">Caregiver</option>
            </select>
          </div>

          {errorMsg && <p className="form-error" style={{ marginBottom: "1rem", color: "#f87171" }}>{errorMsg}</p>}
          <button className="btn btn-teal btn-full" type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="auth-switch">
            Already registered? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
