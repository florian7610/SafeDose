"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiMail, FiMapPin, FiMessageSquare, FiPhone } from "react-icons/fi";

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    setSuccessMsg("");
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSuccessMsg("Thanks for reaching out! A member of our team will get back to you shortly.");
    reset();
  });

  return (
    <div className="min-h-screen bg-[var(--navy)] text-white flex flex-col">
      <header className="land-nav border-b border-white/10">
        <Link href="/" className="logo text-2xl font-serif text-teal-400 block" style={{ textDecoration: 'none' }}>
          Safe<span className="text-white">Dose</span>
        </Link>
        <div className="land-nav-right">
          <Link href="/login" className="btn btn-ghost">Login</Link>
          <Link href="/register" className="btn btn-teal">Get Started</Link>
        </div>
      </header>

      <main className="flex-1 px-8 md:px-16 py-16 md:py-24 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        {/* Left Col: Info */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            We&apos;re here to help you stay safe.
          </h1>
          <p className="text-slate-400 mb-12 text-lg leading-relaxed max-w-md">
            Whether you have questions about our FDA-inspired safety methodologies, need technical support, or want to explore our enterprise options, our team is ready to assist.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center shrink-0">
                <FiMail className="text-teal-400 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Email Us</h3>
                <p className="text-slate-400 mb-2">Our friendly team is here to help.</p>
                <a href="mailto:support@safedose.app" className="text-teal-400 font-medium hover:underline">support@safedose.app</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center shrink-0">
                <FiMapPin className="text-teal-400 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Our Office</h3>
                <p className="text-slate-400 mb-2">Come say hello at our headquarters.</p>
                <span className="text-teal-400 font-medium">100 Health Drive, San Francisco, CA 94105</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center shrink-0">
                <FiPhone className="text-teal-400 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-lg">Phone</h3>
                <p className="text-slate-400 mb-2">Mon-Fri from 8am to 5pm.</p>
                <a href="tel:+15551234567" className="text-teal-400 font-medium hover:underline">+1 (555) 123-4567</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Form */}
        <div className="bg-white rounded-3xl p-8 md:p-10 text-gray-800 shadow-2xl relative">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-teal-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 pointer-events-none"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-8">
            <FiMessageSquare className="text-2xl text-teal-600" />
            <h2 className="text-2xl font-serif font-bold text-slate-800">Send us a message</h2>
          </div>

          {successMsg ? (
            <div className="bg-teal-50 border border-teal-200 text-teal-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageSquare className="text-teal-600 text-xl" />
              </div>
              <h3 className="font-semibold mb-2">Message Sent!</h3>
              <p className="text-sm">{successMsg}</p>
              <button 
                onClick={() => setSuccessMsg("")} 
                className="mt-6 text-teal-700 font-medium text-sm hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5 relative z-10" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-1.5 text-slate-700">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                    placeholder="John Doe"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-1.5 text-slate-700">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                    placeholder="john@example.com"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Use a valid email" }
                    })}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold mb-1.5 text-slate-700">Subject</label>
                <input
                  id="subject"
                  type="text"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                  placeholder="How can we help?"
                  {...register("subject", { required: "Subject is required" })}
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.subject.message}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-1.5 text-slate-700">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none resize-none"
                  placeholder="Leave us a message..."
                  {...register("message", { required: "Message is required" })}
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.message.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl py-3.5 transition-colors shadow-lg shadow-teal-500/30 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 pt-8 pb-8 text-center text-slate-500 text-sm mt-auto">
        <p>&copy; {new Date().getFullYear()} SafeDose. All rights reserved.</p>
      </footer>
    </div>
  );
}
