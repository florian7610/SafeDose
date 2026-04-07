// src/components/layout/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiBell,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiSearch,
  FiSettings,
  FiShield,
} from "react-icons/fi";
import { usePatientState } from "@/components/providers/app-state-provider";

const navItems = [
  { href: "/patient-dashboard",               label: "Dashboard",       icon: "grid"     },
  { href: "/patient-dashboard/medications",   label: "My Medications",  icon: "package"  },
  { href: "/drugs",                           label: "Drug Directory",  icon: "search"   },
  { href: "/patient-dashboard/interactions",  label: "Safety Center",   icon: "alert"    },
  { href: "/settings",                        label: "Settings",        icon: "settings" },
];

export function AppShell({
  title,
  subtitle,
  children,
  allowedRoles,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "patient" | "caregiver">;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, interactions, isAuthLoading } = usePatientState();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) { router.push("/login"); return; }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push(user.role === "caregiver" ? "/caregiver-dashboard" : "/patient-dashboard");
    }
  }, [isAuthLoading, user, router, allowedRoles]);

  // Close sidebar on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (isAuthLoading || !user) {
    return (
      <div className="app-layout" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--gray-600)" }}>
        <p>Loading application...</p>
      </div>
    );
  }

  const openAlerts = interactions.filter((i) => !i.reviewed).length;
  const initials   = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`;

  return (
    <div className={`app-layout ${isMobileOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'active' : ''}`}>
        <div className="sb-logo">
          <div className="logo">Safe<span>Dose</span></div>
        </div>

        <div className="sb-user">
          <div className="sb-avatar">{initials}</div>
          <div>
            <p className="sb-user-name">{user.firstName} {user.lastName}</p>
            <p className="sb-user-role">{user.role}</p>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section-lbl">Main</div>
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
              <span className="sb-icon">
                {item.icon === "grid"     ? <FiGrid />          :
                 item.icon === "package"  ? <FiPackage />       :
                 item.icon === "search"   ? <FiSearch />        :
                 item.icon === "alert"    ? <FiAlertTriangle /> :
                                           <FiSettings />}
              </span>
              <span>{item.label}</span>
              {item.icon === "alert" && openAlerts > 0 && (
                <span className="sb-badge">{openAlerts}</span>
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

      <div className="app-content-wrapper" style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <header className="app-topbar">
          <div className="topbar-left">
            <button 
              className="menu-toggle" 
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle Menu"
            >
              <FiMenu />
            </button>
            <div className="topbar-title">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
          </div>
          <div className="topbar-right">
            <button className="notif-btn" type="button" aria-label="Notifications">
              <FiBell />
              {openAlerts > 0 && <span className="notif-dot" />}
            </button>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </header>

        <main className="app-main" style={{ overflowY: "auto", height: "calc(100vh - 65px)" }}>{children}</main>
      </div>
    </div>
  );
}
