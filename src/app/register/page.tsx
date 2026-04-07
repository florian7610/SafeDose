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
  phoneNumber: string;
  address: string;
  role: "patient" | "caregiver";
  dob: string;
  gender: string;
  qualification?: string;
  experienceYears?: number;
  specialization?: string;
  availability?: string;
  licenseId?: string;
  languages?: string;
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      address: "",
      role: "patient",
      dob: "",
      gender: "",
      qualification: "",
      experienceYears: undefined,
      specialization: "",
      availability: "",
      licenseId: "",
      languages: "",
    },
  });

  const currentRole = watch("role");

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
          phoneNumber: data.phoneNumber,
          address: data.address,
          role: data.role,
          dob: data.dob,
          gender: data.gender,
          qualification: data.qualification,
          experienceYears: data.experienceYears,
          specialization: data.specialization,
          availability: data.availability,
          licenseId: data.licenseId,
          languages: data.languages,
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
          <Link href="/" className="logo" style={{ textDecoration: "none" }}>
            Safe<span>Dose</span>
          </Link>
          <h2>
            Take control of <br /> medication safety.
          </h2>
          <p>
            Join SafeDose today and experience a smarter way to manage your
            health. Track prescriptions, discover interactions, and never miss a
            dose again.
          </p>

          <div className="auth-trust">
            <div className="trust-item">
              <span className="trust-icon">
                <FiPackage />
              </span>
              <span>
                <strong>Smart Inventory:</strong> Add medications in seconds
              </span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">
                <FiAlertTriangle />
              </span>
              <span>
                <strong>Safety Guard:</strong> Real-time interaction alerts
              </span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">
                <FiCheckCircle />
              </span>
              <span>
                <strong>Adherence Pro:</strong> Detailed habit tracking
              </span>
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
              <label htmlFor="firstName">
                First Name <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                id="firstName"
                placeholder="John"
                {...register("firstName", {
                  validate: (value) =>
                    value.trim().length >= 2 || "First name is required.",
                })}
              />
              {errors.firstName ? (
                <p className="form-error">{errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="form-grp">
              <label htmlFor="lastName">
                Last Name <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                id="lastName"
                placeholder="Doe"
                {...register("lastName", {
                  validate: (value) =>
                    value.trim().length >= 2 || "Last name is required.",
                })}
              />
              {errors.lastName ? (
                <p className="form-error">{errors.lastName.message}</p>
              ) : null}
            </div>
          </div>

          <div className="form-grp">
            <label htmlFor="email">
              Email <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email", {
                validate: (value) =>
                  value.includes("@") || "Enter a valid email address.",
              })}
            />
            {errors.email ? (
              <p className="form-error">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="form-grp">
            <label htmlFor="phoneNumber">
              Phone Number <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register("phoneNumber", {
                validate: (value) =>
                  value.trim().length >= 10 ||
                  "Valid phone number is required.",
              })}
            />
            {errors.phoneNumber ? (
              <p className="form-error">{errors.phoneNumber.message}</p>
            ) : null}
          </div>

          <div className="form-grp">
            <label htmlFor="address">
              Address <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              id="address"
              placeholder="123 Health St, Wellness City, NY 10001"
              {...register("address", {
                validate: (value) =>
                  value.trim().length >= 5 || "Address is required.",
              })}
            />
            {errors.address ? (
              <p className="form-error">{errors.address.message}</p>
            ) : null}
          </div>

          <div className="form-row-2">
            <div className="form-grp">
              <label htmlFor="dob">
                Date of Birth <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                id="dob"
                type="date"
                {...register("dob", {
                  required: "Date of Birth is required.",
                })}
              />
              {errors.dob ? (
                <p className="form-error">{errors.dob.message}</p>
              ) : null}
            </div>
            <div className="form-grp">
              <label htmlFor="gender">
                Gender <span style={{ color: "#f87171" }}>*</span>
              </label>
              <select
                id="gender"
                {...register("gender", { required: "Gender is required." })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender ? (
                <p className="form-error">{errors.gender.message}</p>
              ) : null}
            </div>
          </div>

          <div className="form-grp">
            <label htmlFor="password">
              Password <span style={{ color: "#f87171" }}>*</span>
            </label>
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
            {errors.password ? (
              <p className="form-error">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="form-grp">
            <label htmlFor="confirmPassword">
              Confirm Password <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repeat password"
              {...register("confirmPassword", {
                validate: (value) =>
                  value === getValues("password") || "Passwords must match.",
              })}
            />
            {errors.confirmPassword ? (
              <p className="form-error">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <div className="form-grp">
            <label htmlFor="role">I am a</label>
            <select id="role" {...register("role")}>
              <option value="patient">Patient</option>
              <option value="caregiver">Caregiver</option>
            </select>
          </div>

          {currentRole === "caregiver" && (
            <div
              style={{
                marginTop: "1rem",
                marginBottom: "1rem",
                padding: "1.25rem",
                border: "1px solid var(--gray-200)",
                borderRadius: "12px",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--gray-600)",
                  fontWeight: 600,
                }}
              >
                Caregiver Credentials
              </h4>

              <div className="form-grp">
                <label htmlFor="qualification" style={{ fontSize: "13px" }}>
                  Qualification / Certification{" "}
                  <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  id="qualification"
                  placeholder="e.g. Registered Nurse, CPR Certified"
                  {...register("qualification", {
                    required: "Qualification is required for caregivers.",
                  })}
                />
                {errors.qualification ? (
                  <p className="form-error">{errors.qualification.message}</p>
                ) : null}
              </div>

              <div className="form-row-2">
                <div className="form-grp">
                  <label htmlFor="experienceYears" style={{ fontSize: "13px" }}>
                    Experience (Years){" "}
                    <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input
                    id="experienceYears"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    {...register("experienceYears", {
                      required: "Experience is required.",
                      min: {
                        value: 0,
                        message: "Valid number of years is required.",
                      },
                    })}
                  />
                  {errors.experienceYears ? (
                    <p className="form-error">
                      {errors.experienceYears.message}
                    </p>
                  ) : null}
                </div>
                <div className="form-grp">
                  <label htmlFor="specialization" style={{ fontSize: "13px" }}>
                    Specialization <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input
                    id="specialization"
                    placeholder="e.g. Elder care"
                    {...register("specialization", {
                      required: "Specialization is required.",
                    })}
                  />
                  {errors.specialization ? (
                    <p className="form-error">
                      {errors.specialization.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-grp">
                  <label htmlFor="availability" style={{ fontSize: "13px" }}>
                    Availability <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <select
                    id="availability"
                    {...register("availability", {
                      required: "Availability is required.",
                    })}
                  >
                    <option value="">Select Schedule</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Weekends">Weekends only</option>
                    <option value="Flexible">Flexible schedule</option>
                  </select>
                  {errors.availability ? (
                    <p className="form-error">{errors.availability.message}</p>
                  ) : null}
                </div>
                <div className="form-grp">
                  <label htmlFor="licenseId" style={{ fontSize: "13px" }}>
                    License ID <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input
                    id="licenseId"
                    placeholder="e.g. LIC-12345"
                    {...register("licenseId", {
                      required: "License ID is required.",
                    })}
                  />
                  {errors.licenseId ? (
                    <p className="form-error">{errors.licenseId.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="form-grp">
                <label htmlFor="languages" style={{ fontSize: "13px" }}>
                  Languages Spoken <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  id="languages"
                  placeholder="e.g. English, Spanish"
                  {...register("languages", {
                    required: "Languages spoken is required.",
                  })}
                />
                {errors.languages ? (
                  <p className="form-error">{errors.languages.message}</p>
                ) : null}
              </div>
            </div>
          )}

          {errorMsg && (
            <p
              className="form-error"
              style={{ marginBottom: "1rem", color: "#f87171" }}
            >
              {errorMsg}
            </p>
          )}
          <button
            className="btn btn-teal btn-full"
            type="submit"
            disabled={isLoading}
          >
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
