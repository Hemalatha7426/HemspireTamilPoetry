import { useEffect, useState } from "react";
import { getAdminStats, getAdminUsers, updateUserRole, deleteUser } from "../api/adminApi";
import "./AdminDashboardPage.css";

function StatIcon({ children }) {
  return (
    <span className="admin-stat-icon" aria-hidden="true">
      {children}
    </span>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([getAdminStats(), getAdminUsers()]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      window.alert(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      fetchData();
    } catch (err) {
      window.alert(err.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user account?")) return;

    try {
      await deleteUser(userId);
      setUsers((current) => current.filter((user) => user.id !== userId));
    } catch (err) {
      window.alert(err.message || "Failed to delete user");
    }
  };

  return (
    <section className="page container admin-page">
      <div className="admin-hero panel themed-panel">
        <div className="admin-hero-content">
          <span className="admin-badge">Operations Control</span>
          <h1>Admin Dashboard</h1>
          <p>Manage users, monitor engagement, and keep Hemspire running smoothly.</p>
        </div>
        <div className="admin-hero-visual" aria-hidden="true">
          <div className="admin-hero-illustration">
            <div className="admin-illus-card admin-illus-card-a">
              <span className="admin-illus-dot" />
              <div>
                <strong>Role Matrix</strong>
                <p>Access and permission control</p>
              </div>
            </div>
            <div className="admin-illus-card admin-illus-card-b">
              <span className="admin-illus-dot" />
              <div>
                <strong>Activity Monitor</strong>
                <p>Users and content trends</p>
              </div>
            </div>
            <div className="admin-illus-chart">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="admin-hero-visual-caption">
            <strong>Platform Administration</strong>
            <span>Users, roles, and content health in one place</span>
          </div>
        </div>
      </div>

      {loading && <p>Loading dashboard...</p>}

      {!loading && stats && (
        <div className="admin-stats-grid">
          <article className="admin-stat-card">
            <h3>
              <StatIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </StatIcon>
              Total Users
            </h3>
            <p>{stats.totalUsers}</p>
          </article>

          <article className="admin-stat-card">
            <h3>
              <StatIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M3 12h18" />
                </svg>
              </StatIcon>
              Total Admins
            </h3>
            <p>{stats.totalAdmins}</p>
          </article>

          <article className="admin-stat-card">
            <h3>
              <StatIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h10l6 6v10H4z" />
                  <path d="M14 4v6h6" />
                  <path d="M8 14h8M8 18h8" />
                </svg>
              </StatIcon>
              Total Poems
            </h3>
            <p>{stats.totalPoems}</p>
          </article>

          <article className="admin-stat-card">
            <h3>
              <StatIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 18a3 3 0 1 1-2-2.83V6l10-2v9" />
                  <path d="M19 13a3 3 0 1 1-2-2.83" />
                </svg>
              </StatIcon>
              Total Audios
            </h3>
            <p>{stats.totalAudios}</p>
          </article>

          <article className="admin-stat-card">
            <h3>
              <StatIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width="14" height="14" rx="2" />
                  <path d="m21 8-4 3v2l4 3z" />
                </svg>
              </StatIcon>
              Total Videos
            </h3>
            <p>{stats.totalVideos}</p>
          </article>

          <article className="admin-stat-card">
            <h3>
              <StatIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
              </StatIcon>
              Total Likes
            </h3>
            <p>{stats.totalLikes}</p>
          </article>
        </div>
      )}

      <article className="panel themed-panel admin-users-panel">
        <div className="admin-panel-header">
          <h2>User Management</h2>
          <p>Promote, demote, and manage account access with clear role actions.</p>
        </div>
        <div className="table-wrap">
          <table className="table admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-user-avatar" aria-hidden="true">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </span>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-role-pill ${user.role === "ROLE_ADMIN" ? "is-admin" : "is-user"}`}>
                      {user.role === "ROLE_ADMIN" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="inline-actions">
                    <button
                      className="btn ghost small admin-action-btn"
                      onClick={() => handleRoleChange(user.id, "USER")}
                    >
                      Set USER
                    </button>
                    <button
                      className="btn ghost small admin-action-btn"
                      onClick={() => handleRoleChange(user.id, "ADMIN")}
                    >
                      Set ADMIN
                    </button>
                    <button className="btn danger small admin-action-btn" onClick={() => handleDeleteUser(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
