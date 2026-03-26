"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiAlertTriangle, FiBell, FiGrid, FiLogOut, FiPackage, FiSettings, FiShield } from "react-icons/fi";
import { useAppState } from "@/components/providers/app-state-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meds", label: "My Medications" },
  { href: "/interactions", label: "Safety Center" },
  { href: "/settings", label: "Settings" },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href;
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, interactions, isAuthLoading } = useAppState();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return (
      <div className="app-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--gray-600)' }}>
        <p>Loading application...</p>
      </div>
    );
  }

  const openAlerts = interactions.filter((item) => !item.reviewed).length;
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="logo">
            Safe<span>Dose</span>
          </div>
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
              className={isCurrent(pathname, item.href) ? "sb-link active" : "sb-link"}
            >
              <span className="sb-icon">
                {item.href === "/dashboard" ? (
                  <FiGrid />
                ) : item.href === "/meds" ? (
                  <FiPackage />
                ) : item.href === "/interactions" ? (
                  <FiAlertTriangle />
                ) : (
                  <FiSettings />
                )}
              </span>
              <span>{item.label}</span>
              {item.href === "/interactions" && openAlerts > 0 ? (
                <span className="sb-badge">{openAlerts}</span>
              ) : null}
            </Link>
          ))}
        </nav>

        {user.role === "admin" && (
          <div style={{ padding: "0 12px 8px" }}>
            <div className="sb-section-lbl">Admin</div>
            <Link href="/admin" className={isCurrent(pathname, "/admin") ? "sb-link active" : "sb-link"} style={{ color: "#f59e0b" }}>
              <span className="sb-icon"><FiShield /></span>
              <span>Admin Panel</span>
            </Link>
          </div>
        )}

        <div className="sb-bottom">
          <Link className="sb-link" href="/">
            <span className="sb-icon"><FiLogOut /></span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <div>
        <header className="app-topbar">
          <div className="topbar-title">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <div className="topbar-right">
            <button className="notif-btn" type="button" aria-label="Notifications">
              <FiBell />
              {openAlerts > 0 ? <span className="notif-dot" /> : null}
            </button>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </header>

        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
