import Link from "next/link";
import { FiAlertTriangle, FiHeart, FiPackage, FiStar, FiCheck } from "react-icons/fi";

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
            <Link className="btn btn-outline" href="/login">
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

      {/* Pricing Section */}
      <section className="px-8 md:px-16 py-16 mb-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Choose the plan that best fits your medication management needs. No hidden fees.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col hover:border-teal-500/50 transition-colors duration-300">
            <h3 className="text-xl font-semibold text-white mb-2">Basic</h3>
            <p className="text-slate-400 text-sm mb-6">Perfect for personal use</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-400">/ forever</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Up to 5 medications', 'Basic interaction alerts', 'Daily schedule view'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <FiCheck className="text-teal-400 shrink-0 mt-0.5 text-base" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn btn-outline w-full justify-center">Get Started</Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-teal-900/20 border border-teal-500 rounded-2xl p-8 relative flex flex-col shadow-[0_0_40px_-15px_rgba(20,184,166,0.3)]">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Premium</h3>
            <p className="text-teal-100/70 text-sm mb-6">Advanced tracking and insights</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$9</span>
              <span className="text-slate-400">/ month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited medications', 'Advanced FDA interactions', 'Detailed adherence tracking', 'Priority Support'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <FiCheck className="text-teal-400 shrink-0 mt-0.5 text-base" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn btn-teal w-full justify-center">Start Free Trial</Link>
          </div>

          {/* Family Plan */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col hover:border-teal-500/50 transition-colors duration-300">
            <h3 className="text-xl font-semibold text-white mb-2">Family & Caregiver</h3>
            <p className="text-slate-400 text-sm mb-6">For those managing others</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$19</span>
              <span className="text-slate-400">/ month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['All Premium Features', 'Manage up to 5 patient profiles', 'Multi-user notifications', 'Shared adherence reports'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <FiCheck className="text-teal-400 shrink-0 mt-0.5 text-base" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn btn-outline w-full justify-center">Start Free Trial</Link>
          </div>
        </div>
      </section>

      <section className="land-cta">
        <h2>Start Managing Medications Safely</h2>
        <p>Sign in or create an account to access your dashboard.</p>
        <Link className="btn btn-teal" href="/register">
          Get Started
        </Link>
      </section>

      <footer className="border-t border-white/10 px-8 md:px-16 py-16 pb-8 text-white mt-16" style={{ background: "var(--navy)" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-12">
          <div className="max-w-[300px]">
            <div className="logo text-3xl mb-4 inline-block">
              Safe<span>Dose</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your personalized medication dashboard and safety guard, built to follow FDA-inspired safety methodologies.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold text-base mb-2">Product</h4>
              <Link href="/login" className="block text-slate-400 hover:text-teal-400 transition-colors text-sm">Sign In</Link>
              <Link href="/register" className="block text-slate-400 hover:text-teal-400 transition-colors text-sm">Get Started</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold text-base mb-2">Legal</h4>
              <Link href="#" className="block text-slate-400 hover:text-teal-400 transition-colors text-sm">Privacy Policy</Link>
              <Link href="#" className="block text-slate-400 hover:text-teal-400 transition-colors text-sm">Terms of Service</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold text-base mb-2">Connect</h4>
              <Link href="#" className="block text-slate-400 hover:text-teal-400 transition-colors text-sm">Support Helpdesk</Link>
              <Link href="/contact" className="block text-slate-400 hover:text-teal-400 transition-colors text-sm">Contact Us</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} SafeDose. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
