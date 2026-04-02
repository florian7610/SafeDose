// src/components/layout/caregiver-shell.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FiBell,
  FiLogOut,
  FiSearch,
  FiSettings,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { useCaregiverState } from "@/components/providers/app-state-provider";

const navItems = [
  { href: "/caregiver-dashboard",          label: "My Patients",    icon: <FiUsers /> },
  { href: "/drugs",                         label: "Drug Directory", icon: <FiSearch /> },
  { href: "/caregiver-dashboard/settings",                      label: "Settings",       icon: <FiSettings /> },
];

export function CaregiverShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, isAuthLoading, caregiverDashboard } = useCaregiverState();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "caregiver" && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return (
      <div className="app-layout" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--gray-600)" }}>
        <p>Loading...</p>
      </div>
    );
  }

  const initials      = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`;
  const alertCount    = caregiverDashboard?.summary.patientsWithAlerts ?? 0;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="logo">Safe<span>Dose</span></div>
        </div>

        <div className="sb-user">
          <div className="sb-avatar">{initials}</div>
          <div>
            <p className="sb-user-name">{user.firstName} {user.lastName}</p>
            <p className="sb-user-role">caregiver</p>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section-lbl">Caregiver</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname.startsWith(item.href) && item.href !== "/drugs" && item.href !== "/settings"
                ? "sb-link active"
                : pathname === item.href
                ? "sb-link active"
                : "sb-link"
              }
            >
              <span className="sb-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === "/caregiver-dashboard" && alertCount > 0 && (
                <span className="sb-badge">{alertCount}</span>
              )}
            </Link>
          ))}
        </nav>

        {user.role === "admin" && (
          <div style={{ padding: "0 12px 8px" }}>
            <div className="sb-section-lbl">Admin</div>
            <Link
              href="/admin"
              className={pathname === "/admin" ? "sb-link active" : "sb-link"}
              style={{ color: "#f59e0b" }}
            >
              <span className="sb-icon"><FiShield /></span>
              <span>Admin Panel</span>
            </Link>
          </div>
        )}

        <div className="sb-bottom">
          <button
            className="sb-link"
            style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
          >
            <span className="sb-icon"><FiLogOut /></span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div style={{ height: "100vh", overflow: "hidden" }}>
        <header className="app-topbar">
          <div className="topbar-title">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="topbar-right">
            <button className="notif-btn" type="button" aria-label="Notifications">
              <FiBell />
              {alertCount > 0 && <span className="notif-dot" />}
            </button>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </header>

        <main className="app-main" style={{ overflowY: "auto", height: "calc(100vh - 65px)" }}>{children}</main>
      </div>
    </div>
  );
}
