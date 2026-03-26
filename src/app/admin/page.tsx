"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUsers, FiTrash2, FiShield, FiPackage, FiLogOut,
  FiAlertTriangle, FiChevronRight, FiX, FiUserCheck, FiUserX,
} from "react-icons/fi";
import { useAppState } from "@/components/providers/app-state-provider";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "patient";
  medCount: number;
  createdAt: string;
}

interface UserMed {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  status: string;
  takenToday: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAppState();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userMeds, setUserMeds] = useState<UserMed[]>([]);
  const [medsLoading, setMedsLoading] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "admin") { router.push("/dashboard"); return; }

    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("Failed to load users."); setLoading(false); });
  }, [user, isAuthLoading, router]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} and all their data? This cannot be undone.`)) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
    } else {
      const data = await res.json();
      alert(data.message || "Delete failed.");
    }
    setDeletingId(null);
  };

  const handleRoleToggle = async (targetUser: AdminUser) => {
    const newRole = targetUser.role === "admin" ? "patient" : "admin";
    setTogglingId(targetUser.id);
    const res = await fetch(`/api/admin/users/${targetUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      if (selectedUser?.id === targetUser.id) setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
    } else {
      const data = await res.json();
      alert(data.message || "Failed to update role.");
    }
    setTogglingId(null);
  };

  const openUserDetail = async (u: AdminUser) => {
    setSelectedUser(u);
    setMedsLoading(true);
    setUserMeds([]);
    const res = await fetch(`/api/admin/users/${u.id}/medications`);
    if (res.ok) setUserMeds(await res.json());
    setMedsLoading(false);
  };

  if (isAuthLoading || !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--navy)", color: "#fff" }}>
        <p>Loading...</p>
      </div>
    );
  }

  const totalMeds = users.reduce((acc, u) => acc + u.medCount, 0);
  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="logo" style={{ fontSize: 20 }}>Safe<span>Dose</span></div>
          <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, letterSpacing: "1px", marginTop: 4 }}>ADMIN PANEL</div>
        </div>

        <div className="sb-user">
          <div className="sb-avatar" style={{ background: "#f59e0b", color: "#000" }}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <p className="sb-user-name">{user.firstName} {user.lastName}</p>
            <p className="sb-user-role" style={{ color: "#f59e0b" }}>Administrator</p>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section-lbl">Admin</div>
          <div className="sb-link active">
            <span className="sb-icon"><FiUsers /></span>
            <span>User Management</span>
          </div>
        </nav>

        <div className="sb-bottom">
          <button
            className="sb-link"
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
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

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header className="app-topbar">
          <div className="topbar-title">
            <h2>User Management</h2>
            <p>Manage roles, view medications, and delete accounts</p>
          </div>
          <div className="topbar-right">
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef3c7", color: "#92400e", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              <FiShield size={13} />
              Admin Mode
            </div>
          </div>
        </header>

        <main className="app-main" style={{ flex: 1 }}>
          {/* Stats Row */}
          <section className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 24 }}>
            <article className="stat-card">
              <div className="stat-icon"><FiUsers /></div>
              <div className="stat-val">{users.length}</div>
              <div className="stat-lbl">Total Users</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon"><FiPackage /></div>
              <div className="stat-val">{totalMeds}</div>
              <div className="stat-lbl">Total Medications</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon" style={{ background: "#fef3c7" }}>
                <FiShield style={{ color: "#f59e0b" }} />
              </div>
              <div className="stat-val">{adminCount}</div>
              <div className="stat-lbl">Admin Accounts</div>
            </article>
          </section>

          {/* Users Table */}
          <section className="card-box">
            <div className="section-hdr">
              <h3>Registered Users</h3>
              <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{users.length} total — click a row to view details</span>
            </div>

            {loading && <p style={{ padding: "20px", color: "var(--gray-400)" }}>Loading users...</p>}
            {error && (
              <div style={{ display: "flex", gap: 8, padding: "16px", background: "var(--danger-soft)", borderRadius: 10, margin: "0 20px 20px", color: "var(--danger)", fontSize: 13 }}>
                <FiAlertTriangle /> {error}
              </div>
            )}

            {!loading && !error && (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Medications</th>
                      <th>Joined</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr
                        key={u.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => openUserDetail(u)}
                      >
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="admin-avatar">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--gray-600)", fontSize: 13 }}>{u.email}</td>
                        <td>
                          {u.role === "admin" ? (
                            <span className="admin-badge admin-badge-admin">Admin</span>
                          ) : (
                            <span className="admin-badge admin-badge-patient">Patient</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>{u.medCount}</td>
                        <td style={{ color: "var(--gray-600)", fontSize: 13 }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            {u.id !== user.id && (
                              <>
                                <button
                                  className="icon-btn"
                                  title={u.role === "admin" ? "Demote to Patient" : "Promote to Admin"}
                                  disabled={togglingId === u.id}
                                  onClick={() => handleRoleToggle(u)}
                                  style={{ background: u.role === "admin" ? "#fef3c7" : "var(--teal-soft)", color: u.role === "admin" ? "#92400e" : "var(--teal)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", fontSize: 14 }}
                                >
                                  {u.role === "admin" ? <FiUserX /> : <FiUserCheck />}
                                </button>
                                <button
                                  className="icon-btn icon-btn-del"
                                  onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                                  disabled={deletingId === u.id}
                                  title="Delete user"
                                >
                                  <FiTrash2 />
                                </button>
                              </>
                            )}
                            {u.id === user.id && (
                              <span style={{ fontSize: 12, color: "var(--gray-400)" }}>You</span>
                            )}
                            <button
                              className="icon-btn"
                              title="View details"
                              onClick={() => openUserDetail(u)}
                              style={{ background: "var(--gray-100)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", fontSize: 14, color: "var(--gray-600)" }}
                            >
                              <FiChevronRight />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--gray-400)" }}>No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="admin-drawer-overlay" onClick={() => setSelectedUser(null)}>
          <aside className="admin-drawer" onClick={e => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="admin-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div style={{ fontSize: 13, color: "var(--gray-400)" }}>{selectedUser.email}</div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--gray-400)" }}>
                <FiX />
              </button>
            </div>

            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", marginBottom: 6 }}>Current Role</div>
                  {selectedUser.role === "admin" ? (
                    <span className="admin-badge admin-badge-admin">Admin</span>
                  ) : (
                    <span className="admin-badge admin-badge-patient">Patient</span>
                  )}
                </div>
                {selectedUser.id !== user.id && (
                  <button
                    onClick={() => handleRoleToggle(selectedUser)}
                    disabled={togglingId === selectedUser.id}
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: "8px 16px" }}
                  >
                    {selectedUser.role === "admin" ? <><FiUserX /> Demote to Patient</> : <><FiUserCheck /> Promote to Admin</>}
                  </button>
                )}
              </div>

              <div style={{ fontSize: 12, color: "var(--gray-400)", marginBottom: 6 }}>
                Joined: {new Date(selectedUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--gray-200)", margin: "16px 0" }} />

              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Medications ({selectedUser.medCount})
              </div>

              {medsLoading && <p style={{ color: "var(--gray-400)", fontSize: 13 }}>Loading medications...</p>}

              {!medsLoading && userMeds.length === 0 && (
                <p style={{ color: "var(--gray-400)", fontSize: 13 }}>No medications on record.</p>
              )}

              {!medsLoading && userMeds.map(med => (
                <div key={med.id} className="admin-med-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--teal-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiPackage size={14} style={{ color: "var(--teal)" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{med.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{med.genericName}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{med.dosage}</div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{med.frequency}</div>
                  </div>
                </div>
              ))}

              {selectedUser.id !== user.id && (
                <>
                  <hr style={{ border: "none", borderTop: "1px solid var(--gray-200)", margin: "20px 0" }} />
                  <button
                    className="btn"
                    style={{ background: "var(--danger-soft)", color: "var(--danger)", width: "100%" }}
                    onClick={() => {
                      setSelectedUser(null);
                      handleDelete(selectedUser.id, `${selectedUser.firstName} ${selectedUser.lastName}`);
                    }}
                  >
                    <FiTrash2 /> Delete Account
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
