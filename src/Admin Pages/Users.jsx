import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Briefcase,
  LayoutGrid,
  List,
  Check,
  X,
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { TableSkeleton } from "../components/ui/Skeleton";
import { apiCache } from "../utils/apiCache";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const SYSTEM_ROLES = [
  { value: "developer", label: "Developer" },
  { value: "caller", label: "Caller / Sales" },
  { value: "team_lead", label: "Team Lead" },
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR" },
  { value: "admin", label: "Admin" },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);

  const [shifts, setShifts] = useState([]);

  // Forms
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "developer",
    designation: "",
    shiftId: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_BASE}/api/shifts`, config);
      setShifts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch shifts:", err);
    }
  };

  const fetchUsers = async () => {
    const cachedUsers = apiCache.get("admin_users_list");
    if (cachedUsers?.data) {
      setUsers(cachedUsers.data);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_BASE}/api/auth/users`, config);
      const uData = res.data || [];
      setUsers(uData);
      apiCache.set("admin_users_list", uData, 3 * 60 * 1000);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Add User
  const handleOpenAdd = () => {
    setUserForm({
      username: "",
      email: "",
      password: "",
      phone: "",
      role: "developer",
      designation: "",
      shiftId: "",
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        username: userForm.username.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        phone: userForm.phone.trim(),
        role: userForm.role || "developer",
        designation: userForm.designation.trim(),
        shiftId: userForm.shiftId || null,
      };

      await axios.post(`${API_BASE}/api/auth/register`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      apiCache.invalidate("users");
      apiCache.invalidate("admin_overview_metrics");
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Failed to create user:", err);
      setErrorMsg(err.response?.data?.message || "Failed to onboard employee");
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Edit User
  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setUserForm({
      username: u.username || "",
      email: u.email || "",
      password: "",
      phone: u.phone || "",
      role: u.role || "developer",
      designation: u.designation || "",
      shiftId: u.shiftId?._id || u.shiftId || "",
    });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        username: userForm.username.trim(),
        role: userForm.role || "developer",
        designation: userForm.designation.trim(),
        phone: userForm.phone.trim(),
        shiftId: userForm.shiftId || null,
      };

      if (userForm.password && userForm.password.length >= 6) {
        payload.password = userForm.password;
      }

      await axios.put(`${API_BASE}/api/auth/users/${editingUser._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      apiCache.invalidate("users");
      apiCache.invalidate("admin_overview_metrics");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      setErrorMsg(err.response?.data?.message || "Failed to update employee");
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Change Password Modal
  const handleOpenPassword = (u) => {
    setPasswordUser(u);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setShowPassword(false);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordUser) return;

    if (passwordForm.newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await axios.put(
        `${API_BASE}/api/auth/users/${passwordUser._id}/password`,
        { newPassword: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg(`Password for ${passwordUser.username} updated successfully!`);
      setTimeout(() => {
        setPasswordUser(null);
        setSuccessMsg("");
      }, 1200);
    } catch (err) {
      console.error("Failed to update password:", err);
      setErrorMsg(err.response?.data?.message || "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete ${username}? This action cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE}/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      apiCache.invalidate("users");
      apiCache.invalidate("admin_overview_metrics");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete employee");
    }
  };

  // Filtered employees list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        (u.username || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.designation || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q);

      const matchRole = roleFilter === "all" || (u.role || "").toLowerCase() === roleFilter.toLowerCase();
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const getRoleBadgeVariant = (role) => {
    switch ((role || "").toLowerCase()) {
      case "admin":
        return "purple";
      case "manager":
      case "team_lead":
        return "blue";
      case "developer":
        return "green";
      case "caller":
        return "amber";
      case "hr":
        return "red";
      default:
        return "slate";
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Actions ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <span className="bg-[#EFF6FF] text-[#2563EB] font-bold text-xs px-2 py-0.5 rounded border border-[#BFDBFE]">
            {users.length} Total
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="inline-flex items-center bg-[#F5EFE6] p-0.5 rounded border border-[#EAE3D6] gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "table"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "cards"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Cards View"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Onboard Employee */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="ent-btn-primary"
          >
            <Plus size={14} /> Onboard Employee
          </button>
        </div>
      </div>

      {/* Global Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check size={14} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Search & Filter Strip ────────────────────────────────────────────── */}
      <div className="ent-card p-3 bg-white border-[#EAE3D6] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
            className="ent-input ent-input-with-icon text-xs"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded text-xs font-bold shrink-0 transition-all border ${
              roleFilter === "all"
                ? "bg-[#1E40AF] text-white border-[#1E40AF] shadow-xs"
                : "bg-[#FAF8F5] text-slate-600 border-[#EAE3D6] hover:bg-[#F5EFE6]"
            }`}
          >
            All Roles
          </button>
          {SYSTEM_ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRoleFilter(r.value)}
              className={`px-3 py-1.5 rounded text-xs font-bold shrink-0 transition-all border ${
                roleFilter.toLowerCase() === r.value.toLowerCase()
                  ? "bg-[#1E40AF] text-white border-[#1E40AF] shadow-xs"
                  : "bg-[#FAF8F5] text-slate-600 border-[#EAE3D6] hover:bg-[#F5EFE6]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table View ──────────────────────────────────────────────────────── */}
      {viewMode === "table" ? (
        <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] shadow-xs">
          <div className="overflow-x-auto">
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Role</th>
                  <th>Designation</th>
                  <th>Contact Number</th>
                  <th>Email Address</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4">
                      <TableSkeleton rows={5} />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">
                      No employees match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1E40AF] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-white">
                            {u.username ? u.username.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {u.role ? u.role.replace("_", " ").toUpperCase() : "STAFF"}
                        </Badge>
                      </td>
                      <td>
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <Briefcase size={12} className="text-slate-400 shrink-0" />
                          {u.designation || "Staff Member"}
                        </div>
                      </td>
                      <td>
                        {u.phone ? (
                          <a
                            href={`tel:${u.phone}`}
                            className="text-xs font-medium text-slate-700 hover:text-[#2563EB] flex items-center gap-1.5 font-mono"
                          >
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            {u.phone}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td>
                        <a
                          href={`mailto:${u.email}`}
                          className="text-xs font-medium text-slate-700 hover:text-[#2563EB] flex items-center gap-1.5"
                        >
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          {u.email}
                        </a>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenPassword(u)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Change Password"
                          >
                            <KeyRound size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-600 hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded transition-colors"
                            title="Edit Employee"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u._id, u.username)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Cards View ──────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && users.length === 0 ? (
            <div className="col-span-full">
              <TableSkeleton rows={4} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full ent-card p-12 text-center text-slate-500 font-medium bg-white">
              No employees match your search or filter.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u._id}
                className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E40AF] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border-2 border-white">
                        {u.username ? u.username.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm">{u.username}</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{u.designation || "Staff Member"}</p>
                      </div>
                    </div>
                    <Badge variant={getRoleBadgeVariant(u.role)}>
                      {u.role ? u.role.replace("_", " ").toUpperCase() : "STAFF"}
                    </Badge>
                  </div>

                  <div className="mt-3.5 space-y-2 pt-3 border-t border-[#FAF8F5]">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Mail size={12} className="text-slate-400 shrink-0" />
                      <a href={`mailto:${u.email}`} className="truncate hover:text-[#2563EB]">
                        {u.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-700 font-mono">
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      {u.phone ? (
                        <a href={`tel:${u.phone}`} className="hover:text-[#2563EB]">
                          {u.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-sans">No contact added</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-3 border-t border-[#EAE3D6]">
                  <button
                    type="button"
                    onClick={() => handleOpenPassword(u)}
                    className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-xs font-bold transition-colors"
                    title="Change Password"
                  >
                    <KeyRound size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(u)}
                    className="flex-1 py-1.5 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u._id, u.username)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Change Password Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(passwordUser)}
        onClose={() => setPasswordUser(null)}
        title={`Change Password - ${passwordUser?.username || "Employee"}`}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPasswordUser(null)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="change-password-modal-form"
              disabled={submitting}
              className="ent-btn-primary"
            >
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </>
        }
      >
        <form id="change-password-modal-form" onSubmit={handleSavePassword} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs font-semibold text-rose-800 flex items-center gap-2">
              <X size={14} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check size={14} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-2.5 bg-[#FAF8F5] border border-[#EAE3D6] rounded text-xs space-y-0.5">
            <div className="font-bold text-slate-900">{passwordUser?.username}</div>
            <div className="text-slate-500 font-mono text-[11px]">{passwordUser?.email}</div>
          </div>

          <div>
            <label className="ent-label">New Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minimum 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="ent-input text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="ent-label">Confirm New Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Re-type new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="ent-input text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* ── Onboard Employee Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Employee"
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-user-modal-form"
              disabled={submitting}
              className="ent-btn-primary"
            >
              {submitting ? "Creating..." : "Save & Onboard"}
            </button>
          </>
        }
      >
        <form id="create-user-modal-form" onSubmit={handleCreateUser} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs font-semibold text-rose-800 flex items-center gap-2">
              <X size={14} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="ent-label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Asad Ullah"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              className="ent-input text-xs"
            />
          </div>

          <div>
            <label className="ent-label">Email Address *</label>
            <input
              type="email"
              required
              placeholder="employee@starway.com"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="ent-input text-xs"
            />
          </div>

          <div>
            <label className="ent-label">Initial Password *</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="ent-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ent-label">System Role *</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="ent-select text-xs"
              >
                {SYSTEM_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="ent-label">Designation *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Developer"
                value={userForm.designation}
                onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                className="ent-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="ent-label">Contact Number</label>
            <input
              type="text"
              placeholder="+1 234 567 890"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              className="ent-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="ent-label">Work Shift Timing</label>
            <select
              value={userForm.shiftId || ""}
              onChange={(e) => setUserForm({ ...userForm, shiftId: e.target.value })}
              className="ent-select text-xs font-medium"
            >
              <option value="">-- No Shift Assigned --</option>
              {shifts.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.startTime} - {s.endTime}{s.isNightShift ? " 🌙 Night" : ""})
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* ── Edit Employee Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Edit Employee - ${editingUser?.username || ""}`}
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-user-modal-form"
              disabled={submitting}
              className="ent-btn-primary"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <form id="edit-user-modal-form" onSubmit={handleUpdateUser} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs font-semibold text-rose-800 flex items-center gap-2">
              <X size={14} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="ent-label">Full Name *</label>
            <input
              type="text"
              required
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              className="ent-input text-xs"
            />
          </div>

          <div>
            <label className="ent-label">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={userForm.email}
              className="ent-input text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ent-label">System Role *</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="ent-select text-xs"
              >
                {SYSTEM_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="ent-label">Designation *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Developer"
                value={userForm.designation}
                onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                className="ent-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="ent-label">Contact Number</label>
            <input
              type="text"
              placeholder="+1 234 567 890"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              className="ent-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="ent-label">Work Shift Timing</label>
            <select
              value={userForm.shiftId || ""}
              onChange={(e) => setUserForm({ ...userForm, shiftId: e.target.value })}
              className="ent-select text-xs font-medium"
            >
              <option value="">-- No Shift Assigned --</option>
              {shifts.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.startTime} - {s.endTime}{s.isNightShift ? " 🌙 Night" : ""})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="ent-label">Reset Password (Optional)</label>
            <input
              type="password"
              placeholder="Leave empty to keep current password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="ent-input text-xs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}