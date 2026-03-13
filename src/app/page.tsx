import Link from "next/link";
import { FiAlertTriangle, FiHeart, FiPackage, FiStar } from "react-icons/fi";

export default function HomePage() {
  return (
    <div className="page-wrap" id="landing">
      <header className="land-nav">
        <div className="logo">
          Safe<span>Dose</span>
        </div>
        <div className="land-nav-right">
          <Link className="btn btn-ghost" href="/login">
            Login
          </Link>
          <Link className="btn btn-teal" href="/register">
            Get Started
          </Link>
        </div>
      </header>

      <section className="land-hero">
        <div>
          <div className="land-tag">FDA-Inspired Safety Checks</div>
          <h1>
            Your Medications,
            <br />
            <em>Safer Together.</em>
          </h1>
          <p>
            SafeDose helps you manage medications, stay on schedule, and review interaction warnings in one
            streamlined experience.
          </p>

          <div className="hero-btns">
            <Link className="btn btn-teal" href="/register">
              Create Account
            </Link>
            <Link className="btn btn-outline" href="/dashboard">
              Explore Dashboard
            </Link>
          </div>
        </div>

        <div className="land-card">
          <div className="land-card-title">Today&apos;s Medication Schedule</div>
          <div className="ld-drug">
            <div className="ld-drug-left">
              <div className="ld-drug-icon"><FiPackage /></div>
              <div>
                <div className="ld-drug-name">Metformin</div>
                <div className="ld-drug-dose">500mg · Morning</div>
              </div>
            </div>
            <div className="ld-drug-time">8:00 AM</div>
          </div>
          <div className="ld-drug">
            <div className="ld-drug-left">
              <div className="ld-drug-icon"><FiHeart /></div>
              <div>
                <div className="ld-drug-name">Lisinopril</div>
                <div className="ld-drug-dose">10mg · Afternoon</div>
              </div>
            </div>
            <div className="ld-drug-time">2:00 PM</div>
          </div>
          <div className="land-alert">
            <div className="land-alert-icon"><FiAlertTriangle /></div>
            <div className="land-alert-text">
              <strong>Interaction Alert</strong>
              One active interaction requires review in the Safety Center.
            </div>
          </div>
        </div>
      </section>

      <section className="land-features">
        {[
          "Interaction Checker",
          "Dose Adherence",
          "Responsive UI",
          "Medication Timeline",
          "App Router Navigation",
          "Validation-first Forms",
        ].map((feature) => (
          <article key={feature} className="land-feat">
            <div className="feat-icon"><FiStar /></div>
            <h4>{feature}</h4>
            <p>Designed to follow the SafeDose workflow for daily medication safety and monitoring.</p>
          </article>
        ))}
      </section>

      <section className="land-cta">
        <h2>Start Managing Medications Safely</h2>
        <p>Sign in or create an account to access your dashboard.</p>
        <Link className="btn btn-teal" href="/register">
          Get Started
        </Link>
      </section>
    </div>
  );
}
