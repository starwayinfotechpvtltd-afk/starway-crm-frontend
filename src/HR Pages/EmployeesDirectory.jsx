import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Search,
  Edit,
  Trash2,
  UserPlus,
  Phone,
  Mail,
  Shield,
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  X,
  UserCheck,
  UserX,
  FileText,
  Upload,
  CreditCard,
  Building,
  Calendar,
  AlertTriangle,
  FileCheck,
  Download,
  ExternalLink,
  Plus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Receipt,
  Printer,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const SYSTEM_ROLES = [
  { value: "developer", label: "Developer" },
  { value: "caller", label: "Caller / Sales" },
  { value: "team_lead", label: "Team Lead" },
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR" },
  { value: "admin", label: "Admin" },
];

// Toggle flag to hide payroll features in employee directory without deleting code
const HIDE_PAYROLL = true;
// Toggle flag to hide attendance/shift features in employee directory without deleting code
const HIDE_ATTENDANCE = true;

export default function EmployeesDirectory() {
  const [users, setUsers] = useState([]);
  const [structures, setStructures] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // 360° Profile Modal / Drawer
  const [profileUser, setProfileUser] = useState(null);
  const [profileTab, setProfileTab] = useState("personal"); // "personal" | "employment" | "payroll" | "documents"
  const [profileFormData, setProfileFormData] = useState({});
  const [userDocs, setUserDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // New Document Upload State
  const [docUploadForm, setDocUploadForm] = useState({
    title: "",
    category: "employment_contract",
    fileUrl: "",
    expiryDate: "",
    notes: "",
  });

  // Termination Modal State
  const [terminatingUser, setTerminatingUser] = useState(null);
  const [terminateData, setTerminateData] = useState({
    exitType: "terminated",
    terminationDate: new Date().toISOString().split("T")[0],
    reason: "",
    notes: "",
  });

  // Password Change Modal
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Employee Salary Slips Modal
  const [viewingPayslipsUser, setViewingPayslipsUser] = useState(null);
  const [userPayslips, setUserPayslips] = useState([]);
  const [loadingPayslips, setLoadingPayslips] = useState(false);
  const [selectedStatementPreview, setSelectedStatementPreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token");

  const handleOpenPayslipsModal = async (u) => {
    setViewingPayslipsUser(u);
    setLoadingPayslips(true);
    setSelectedStatementPreview(null);
    try {
      const res = await axios.get(`${API_BASE}/api/payroll-engine/payslips/employee/${u._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserPayslips(res.data || []);
      if (res.data?.length > 0) {
        setSelectedStatementPreview(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load employee payslips", err);
    } finally {
      setLoadingPayslips(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStructures();
    fetchShifts();
  }, []);

  // Re-fetch users + shifts whenever user navigates back to this tab/page
  // (e.g. after assigning a shift in AttendanceHub, the Assigned Shift column reflects the update)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUsers();
        fetchShifts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStructures = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/payroll-engine/structures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStructures(res.data || []);
    } catch (err) {
      console.error("Failed to fetch salary structures", err);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/shifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch shifts", err);
    }
  };

  // Open 360° Profile Editor
  const handleOpen360Profile = async (u) => {
    setProfileUser(u);
    setProfileTab("personal");
    setProfileFormData({
      employeeId: u.employeeId || "",
      firstName: u.firstName || "",
      middleName: u.middleName || "",
      lastName: u.lastName || "",
      personalEmail: u.personalEmail || "",
      phone: u.phone || "",
      dob: u.dob ? new Date(u.dob).toISOString().split("T")[0] : "",
      gender: u.gender || "",
      address: {
        street: u.address?.street || "",
        city: u.address?.city || "",
        state: u.address?.state || "",
        postalCode: u.address?.postalCode || "",
      },
      emergencyContact: {
        name: u.emergencyContact?.name || "",
        relationship: u.emergencyContact?.relationship || "",
        phone: u.emergencyContact?.phone || "",
      },
      username: u.username || "",
      role: u.role || "developer",
      designation: u.designation || "",
      employmentType: u.employmentType || "full_time",
      employmentStatus: u.employmentStatus || "active",
      location: u.location || "Main Office",
      joiningDate: u.joiningDate ? new Date(u.joiningDate).toISOString().split("T")[0] : "",
      probationPeriod: u.probationPeriod || "3 months",
      leaveBalance: u.leaveBalance ?? 12,
      baseSalary: u.baseSalary || (u.role === "developer" ? 45000 : 30000),
      salaryStructureId: u.salaryStructureId?._id || u.salaryStructureId || "",
      shiftId: u.shiftId?._id || u.shiftId || "",
      payFrequency: u.payFrequency || "monthly",
      paymentMethod: u.paymentMethod || "bank_transfer",
      taxId: u.taxId || "",
      bankDetails: {
        bankName: u.bankDetails?.bankName || "",
        accountNumber: u.bankDetails?.accountNumber || "",
        ifscRouting: u.bankDetails?.ifscRouting || "",
        accountHolderName: u.bankDetails?.accountHolderName || "",
      },
    });

    fetchUserDocuments(u._id);
    setErrorMsg("");
  };

  const fetchUserDocuments = async (userId) => {
    setLoadingDocs(true);
    try {
      const res = await axios.get(`${API_BASE}/api/payroll-engine/documents/employee/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserDocs(res.data || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Save 360° Profile
  const handleSave360Profile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    try {
      await axios.put(
        `${API_BASE}/api/auth/users/${profileUser._id}/hr-profile`,
        profileFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileUser(null);
      setSuccessMsg("Employee HR profile saved successfully!");
      fetchUsers();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Failed to update profile", err);
      setErrorMsg(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // Upload Document
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docUploadForm.title || !docUploadForm.fileUrl) return;

    try {
      await axios.post(
        `${API_BASE}/api/payroll-engine/documents/employee/${profileUser._id}`,
        docUploadForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocUploadForm({ title: "", category: "employment_contract", fileUrl: "", expiryDate: "", notes: "" });
      fetchUserDocuments(profileUser._id);
    } catch (err) {
      alert("Failed to record document");
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Remove this document?")) return;
    try {
      await axios.delete(`${API_BASE}/api/payroll-engine/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserDocuments(profileUser._id);
    } catch (err) {
      alert("Failed to delete document");
    }
  };

  // Handle Offboarding / Termination
  const handleOpenTermination = (u) => {
    setTerminatingUser(u);
    setTerminateData({
      exitType: "terminated",
      terminationDate: new Date().toISOString().split("T")[0],
      reason: "",
      notes: "",
    });
    setErrorMsg("");
  };

  const handleConfirmTermination = async (e) => {
    e.preventDefault();
    if (!terminateData.reason.trim()) {
      setErrorMsg("Please specify the termination or exit reason.");
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/api/auth/users/${terminatingUser._id}/terminate`,
        terminateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerminatingUser(null);
      setSuccessMsg(`Employee ${terminatingUser.username} has been offboarded and login access revoked.`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Termination failed", err);
      setErrorMsg(err.response?.data?.message || "Failed to offboard employee.");
    } finally {
      setSaving(false);
    }
  };

  // Reactivate Employee
  const handleReactivateEmployee = async (u) => {
    if (!window.confirm(`Reactivate account for ${u.username}? They will be able to log in again.`)) return;
    try {
      await axios.put(`${API_BASE}/api/auth/users/${u._id}/reactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMsg(`Employee ${u.username} reactivated successfully.`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      alert("Failed to reactivate employee.");
    }
  };

  // Change Password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/api/auth/users/${passwordUser._id}/password`,
        { newPassword: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordUser(null);
      setSuccessMsg(`Password for ${passwordUser.username} updated successfully!`);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered Employees
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const s = search.toLowerCase();
      const matchSearch =
        u.username?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.designation?.toLowerCase().includes(s) ||
        u.employeeId?.toLowerCase().includes(s);

      const matchRole = roleFilter === "all" || u.role === roleFilter;

      let matchStatus = true;
      if (statusFilter === "active") matchStatus = u.employmentStatus === "active" || (!u.employmentStatus && u.status !== "terminated");
      if (statusFilter === "terminated") matchStatus = u.employmentStatus === "terminated" || u.employmentStatus === "resigned" || u.status === "terminated";
      if (statusFilter === "probation") matchStatus = u.employmentStatus === "probation";

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const activeCount = users.filter((u) => u.employmentStatus === "active" || (!u.employmentStatus && u.status !== "terminated")).length;
  const terminatedCount = users.filter((u) => u.employmentStatus === "terminated" || u.employmentStatus === "resigned" || u.status === "terminated").length;

  return (
    <div className="space-y-3.5 w-full">
      {/* ── Top Header Actions ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => { fetchUsers(); fetchShifts(); }}
          className="ent-btn-secondary text-xs flex items-center gap-1.5"
        >
          <RefreshCw size={13} /> Refresh
        </button>
        <Link to="create-user" className="ent-btn-primary text-xs">
          <UserPlus size={13} /> Onboard Employee
        </Link>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Search & Filter Controls ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ent-input ent-input-with-icon text-xs w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded border border-[#EAE3D6] text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                statusFilter === "active" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("terminated")}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                statusFilter === "terminated" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600"
              }`}
            >
              Offboarded ({terminatedCount})
            </button>
          </div>

          {/* Role Filter Dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="ent-select text-xs w-auto min-w-[130px]"
          >
            <option value="all">All Roles</option>
            {SYSTEM_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Employee Roster Table ───────────────────────────────────────────── */}
      <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] shadow-xs">
        <div className="overflow-x-auto">
          <table className="ent-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>System Role</th>
                <th>Designation</th>
                {!HIDE_ATTENDANCE && <th>Assigned Shift</th>}
                <th>Employment Status</th>
                {!HIDE_PAYROLL && <th>Salary Structure</th>}
                {!HIDE_PAYROLL && <th>Base Rate</th>}
                <th>Leave Balance</th>
                <th>Contact</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7 + (!HIDE_ATTENDANCE ? 1 : 0) + (!HIDE_PAYROLL ? 2 : 0)} className="text-center py-12 text-slate-400 font-medium">
                    Loading workforce directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7 + (!HIDE_ATTENDANCE ? 1 : 0) + (!HIDE_PAYROLL ? 2 : 0)} className="text-center py-12 text-slate-500 font-medium">
                    No employees matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isTerminated =
                    u.employmentStatus === "terminated" ||
                    u.employmentStatus === "resigned" ||
                    u.status === "terminated";

                  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                  const displayName = fullName || u.username;

                  return (
                    <tr
                      key={u._id}
                      className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                        isTerminated ? "bg-rose-50/20 opacity-75" : ""
                      }`}
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              u.avatar ||
                              "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8="
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-[#EAE3D6]"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{displayName}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {u.employeeId || `EMP-${u._id.slice(-4)}`}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {u.email} {fullName && <span className="text-slate-400">(@{u.username})</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <Badge
                          variant={
                            u.role === "admin"
                              ? "red"
                              : u.role === "manager"
                              ? "purple"
                              : u.role === "team_lead"
                              ? "amber"
                              : u.role === "developer"
                              ? "blue"
                              : "neutral"
                          }
                        >
                          {(u.role || "caller").toUpperCase()}
                        </Badge>
                      </td>

                      <td>
                        <div className="text-xs font-semibold text-slate-800">
                          {u.designation || "Staff Member"}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {(u.employmentType || "full_time").replace(/_/g, " ")}
                        </div>
                      </td>

                      {/* Assigned Shift Column */}
                      {!HIDE_ATTENDANCE && (
                        <td>
                          {u.shiftId ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold"
                              style={{
                                backgroundColor: `${u.shiftId.color || '#2563EB'}15`,
                                color: u.shiftId.color || '#2563EB',
                                border: `1px solid ${u.shiftId.color || '#2563EB'}30`
                              }}
                            >
                              {u.shiftId.name || "Shift"} ({u.shiftId.startTime} - {u.shiftId.endTime}{u.shiftId.isNightShift ? " 🌙" : ""})
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              No Shift Assigned
                            </span>
                          )}
                        </td>
                      )}

                      <td>
                        <Badge variant={isTerminated ? "red" : u.employmentStatus === "probation" ? "amber" : "green"}>
                          {isTerminated ? "TERMINATED / REVOKED" : (u.employmentStatus || "ACTIVE").toUpperCase()}
                        </Badge>
                      </td>

                      {!HIDE_PAYROLL && (
                        <>
                          <td>
                            {u.salaryStructureId ? (
                              <span className="text-xs font-semibold text-slate-800">
                                {u.salaryStructureId?.name || (structures.find((s) => s._id === u.salaryStructureId)?.name) || "Custom Structure"}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td>
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              ₹{Number(u.baseSalary || (u.role === "developer" ? 45000 : 30000)).toLocaleString()}
                            </span>
                          </td>
                        </>
                      )}

                      <td>
                        <span className="text-xs font-bold text-[#1E40AF]">
                          {u.leaveBalance ?? 12} <span className="text-[10px] font-normal text-slate-400">days</span>
                        </span>
                      </td>

                      <td>
                        <div className="text-xs font-mono text-slate-600">{u.phone || "—"}</div>
                      </td>

                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Payslips History */}
                          {!HIDE_PAYROLL && (
                            <button
                              type="button"
                              onClick={() => handleOpenPayslipsModal(u)}
                              title="View Salary Slips & History"
                              className="p-1.5 rounded text-[#1E40AF] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors"
                            >
                              <Receipt size={14} />
                            </button>
                          )}

                          {/* 360 Profile Editor */}
                          <button
                            type="button"
                            onClick={() => handleOpen360Profile(u)}
                            title="Edit 360° HR Profile & Documents"
                            className="p-1.5 rounded text-slate-600 hover:bg-[#F5EFE6] hover:text-slate-900 transition-colors"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordUser(u);
                              setPasswordForm({ newPassword: "", confirmPassword: "" });
                              setShowPassword(false);
                              setErrorMsg("");
                            }}
                            title="Change Password"
                            className="p-1.5 rounded text-slate-600 hover:bg-[#F5EFE6] hover:text-slate-900 transition-colors"
                          >
                            <KeyRound size={14} />
                          </button>

                          {/* Terminate or Reactivate */}
                          {isTerminated ? (
                            <button
                              type="button"
                              onClick={() => handleReactivateEmployee(u)}
                              title="Reactivate Account (Restore Access)"
                              className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              <UserCheck size={14} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenTermination(u)}
                              title="Offboard / Terminate Employee (Revoke Login)"
                              className="p-1.5 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                            >
                              <UserX size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Comprehensive 360° Employee Profile & Documents Modal ────────────── */}
      <Modal
        isOpen={Boolean(profileUser)}
        onClose={() => setProfileUser(null)}
        title={`360° Employee Profile — ${profileUser?.username || ""}`}
        maxWidth="max-w-4xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setProfileUser(null)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-360-form"
              disabled={saving}
              className="ent-btn-primary"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setProfileTab("personal")}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                profileTab === "personal" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
              }`}
            >
              1. Personal & Emergency
            </button>
            <button
              type="button"
              onClick={() => setProfileTab("employment")}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                profileTab === "employment" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
              }`}
            >
              2. Employment & Roles
            </button>
            {!HIDE_PAYROLL && (
              <button
                type="button"
                onClick={() => setProfileTab("payroll")}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  profileTab === "payroll" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
                }`}
              >
                3. Payroll & Bank Details
              </button>
            )}
            <button
              type="button"
              onClick={() => setProfileTab("documents")}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                profileTab === "documents" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
              }`}
            >
              3. Employee Documents ({userDocs.length})
            </button>
          </div>

          <form id="profile-360-form" onSubmit={handleSave360Profile} className="space-y-4">
            {/* ── Tab 1: Personal Info ── */}
            {profileTab === "personal" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="ent-label">Employee ID</label>
                  <input
                    type="text"
                    value={profileFormData.employeeId || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, employeeId: e.target.value })}
                    className="ent-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="ent-label">First Name</label>
                  <input
                    type="text"
                    value={profileFormData.firstName || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, firstName: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">Last Name</label>
                  <input
                    type="text"
                    value={profileFormData.lastName || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, lastName: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">Date of Birth</label>
                  <input
                    type="date"
                    value={profileFormData.dob || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, dob: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">Gender</label>
                  <select
                    value={profileFormData.gender || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, gender: e.target.value })}
                    className="ent-select text-xs"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="ent-label">Phone Number</label>
                  <input
                    type="text"
                    value={profileFormData.phone || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                    className="ent-input text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="ent-label">Personal Email</label>
                  <input
                    type="email"
                    value={profileFormData.personalEmail || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, personalEmail: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">Location / City</label>
                  <input
                    type="text"
                    value={profileFormData.location || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, location: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                {!HIDE_ATTENDANCE && (
                  <div className="sm:col-span-2">
                    <label className="ent-label font-bold text-blue-900">Work Shift Timing</label>
                    <select
                      value={profileFormData.shiftId || ""}
                      onChange={(e) => setProfileFormData({ ...profileFormData, shiftId: e.target.value || null })}
                      className="ent-select text-xs font-semibold bg-blue-50/50 border-blue-200"
                    >
                      <option value="">-- No Shift Assigned --</option>
                      {shifts.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.startTime} - {s.endTime}{s.isNightShift ? " 🌙 Night" : ""})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="sm:col-span-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Emergency Contact</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={profileFormData.emergencyContact?.name || ""}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          emergencyContact: { ...profileFormData.emergencyContact, name: e.target.value },
                        })
                      }
                      className="ent-input text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Relationship (e.g. Spouse, Parent)"
                      value={profileFormData.emergencyContact?.relationship || ""}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          emergencyContact: { ...profileFormData.emergencyContact, relationship: e.target.value },
                        })
                      }
                      className="ent-input text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Emergency Phone"
                      value={profileFormData.emergencyContact?.phone || ""}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          emergencyContact: { ...profileFormData.emergencyContact, phone: e.target.value },
                        })
                      }
                      className="ent-input text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 2: Employment & Roles ── */}
            {profileTab === "employment" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="ent-label">Username *</label>
                  <input
                    type="text"
                    required
                    value={profileFormData.username || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, username: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">System Role *</label>
                  <select
                    value={profileFormData.role || "developer"}
                    onChange={(e) => setProfileFormData({ ...profileFormData, role: e.target.value })}
                    className="ent-select text-xs font-semibold"
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
                    value={profileFormData.designation || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, designation: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">Employment Type</label>
                  <select
                    value={profileFormData.employmentType || "full_time"}
                    onChange={(e) => setProfileFormData({ ...profileFormData, employmentType: e.target.value })}
                    className="ent-select text-xs"
                  >
                    <option value="full_time">Full-Time</option>
                    <option value="part_time">Part-Time</option>
                    <option value="contractor">Contractor</option>
                    <option value="intern">Intern</option>
                    <option value="temporary">Temporary</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="ent-label">Joining Date</label>
                  <input
                    type="date"
                    value={profileFormData.joiningDate || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, joiningDate: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">Leave Balance (Days)</label>
                  <input
                    type="number"
                    value={profileFormData.leaveBalance ?? 12}
                    onChange={(e) => setProfileFormData({ ...profileFormData, leaveBalance: Number(e.target.value) })}
                    className="ent-input text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="ent-label">Probation Period</label>
                  <input
                    type="text"
                    value={profileFormData.probationPeriod || "3 months"}
                    onChange={(e) => setProfileFormData({ ...profileFormData, probationPeriod: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">Employment Status</label>
                  <select
                    value={profileFormData.employmentStatus || "active"}
                    onChange={(e) => setProfileFormData({ ...profileFormData, employmentStatus: e.target.value })}
                    className="ent-select text-xs font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="probation">Probation</option>
                    <option value="on_leave">On Leave</option>
                    <option value="resigned">Resigned</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                {!HIDE_ATTENDANCE && (
                  <div>
                    <label className="ent-label">Assigned Work Shift</label>
                    <select
                      value={profileFormData.shiftId || ""}
                      onChange={(e) => setProfileFormData({ ...profileFormData, shiftId: e.target.value || null })}
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
                )}
              </div>
            )}

            {/* ── Tab 3: Payroll & Bank Details ── */}
            {!HIDE_PAYROLL && profileTab === "payroll" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="ent-label">Assigned Salary Structure</label>
                  <select
                    value={profileFormData.salaryStructureId || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, salaryStructureId: e.target.value || null })}
                    className="ent-select text-xs font-semibold"
                  >
                    <option value="">-- No Structure Attached (Unassigned) --</option>
                    {structures.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="ent-label">Base Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    value={profileFormData.baseSalary || 0}
                    onChange={(e) => setProfileFormData({ ...profileFormData, baseSalary: Number(e.target.value) })}
                    className="ent-input text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="ent-label">Payment Method</label>
                  <select
                    value={profileFormData.paymentMethod || "bank_transfer"}
                    onChange={(e) => setProfileFormData({ ...profileFormData, paymentMethod: e.target.value })}
                    className="ent-select text-xs"
                  >
                    <option value="bank_transfer">Bank Direct Deposit</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="ent-label">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, ICICI"
                    value={profileFormData.bankDetails?.bankName || ""}
                    onChange={(e) =>
                      setProfileFormData({
                        ...profileFormData,
                        bankDetails: { ...profileFormData.bankDetails, bankName: e.target.value },
                      })
                    }
                    className="ent-input text-xs"
                  />
                </div>

                <div>
                  <label className="ent-label">Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 50100492810293"
                    value={profileFormData.bankDetails?.accountNumber || ""}
                    onChange={(e) =>
                      setProfileFormData({
                        ...profileFormData,
                        bankDetails: { ...profileFormData.bankDetails, accountNumber: e.target.value },
                      })
                    }
                    className="ent-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="ent-label">IFSC / Routing Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001928"
                    value={profileFormData.bankDetails?.ifscRouting || ""}
                    onChange={(e) =>
                      setProfileFormData({
                        ...profileFormData,
                        bankDetails: { ...profileFormData.bankDetails, ifscRouting: e.target.value },
                      })
                    }
                    className="ent-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="ent-label">Tax ID (PAN / SSN)</label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={profileFormData.taxId || ""}
                    onChange={(e) => setProfileFormData({ ...profileFormData, taxId: e.target.value })}
                    className="ent-input text-xs font-mono"
                  />
                </div>

                {/* Custom Employee Specific Allowances */}
                <div className="sm:col-span-3 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase">
                      Custom Employee Allowances & Overrides ({profileFormData.customSalaryAllowances?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileFormData({
                          ...profileFormData,
                          customSalaryAllowances: [
                            ...(profileFormData.customSalaryAllowances || []),
                            { name: "Special Allowance", amount: 2000, isPercentage: false },
                          ],
                        })
                      }
                      className="ent-btn-secondary text-[11px] py-0.5 px-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    >
                      + Add Allowance
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(profileFormData.customSalaryAllowances || []).map((ca, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded border border-[#EAE3D6] text-xs">
                        <input
                          type="text"
                          placeholder="Allowance Name"
                          value={ca.name}
                          onChange={(e) => {
                            const updated = [...profileFormData.customSalaryAllowances];
                            updated[idx].name = e.target.value;
                            setProfileFormData({ ...profileFormData, customSalaryAllowances: updated });
                          }}
                          className="ent-input text-xs font-semibold bg-white"
                        />
                        <input
                          type="number"
                          placeholder="Amount (₹)"
                          value={ca.amount}
                          onChange={(e) => {
                            const updated = [...profileFormData.customSalaryAllowances];
                            updated[idx].amount = Number(e.target.value);
                            setProfileFormData({ ...profileFormData, customSalaryAllowances: updated });
                          }}
                          className="ent-input text-xs font-mono font-bold bg-white w-32"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = profileFormData.customSalaryAllowances.filter((_, i) => i !== idx);
                            setProfileFormData({ ...profileFormData, customSalaryAllowances: updated });
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Employee Specific Deductions */}
                <div className="sm:col-span-3 pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase">
                      Custom Employee Deductions & Overrides ({profileFormData.customSalaryDeductions?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileFormData({
                          ...profileFormData,
                          customSalaryDeductions: [
                            ...(profileFormData.customSalaryDeductions || []),
                            { name: "Special Deduction", amount: 1000, isPercentage: false },
                          ],
                        })
                      }
                      className="ent-btn-secondary text-[11px] py-0.5 px-2 text-rose-700 bg-rose-50 hover:bg-rose-100"
                    >
                      + Add Deduction
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(profileFormData.customSalaryDeductions || []).map((cd, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded border border-[#EAE3D6] text-xs">
                        <input
                          type="text"
                          placeholder="Deduction Name"
                          value={cd.name}
                          onChange={(e) => {
                            const updated = [...profileFormData.customSalaryDeductions];
                            updated[idx].name = e.target.value;
                            setProfileFormData({ ...profileFormData, customSalaryDeductions: updated });
                          }}
                          className="ent-input text-xs font-semibold bg-white"
                        />
                        <input
                          type="number"
                          placeholder="Amount (₹)"
                          value={cd.amount}
                          onChange={(e) => {
                            const updated = [...profileFormData.customSalaryDeductions];
                            updated[idx].amount = Number(e.target.value);
                            setProfileFormData({ ...profileFormData, customSalaryDeductions: updated });
                          }}
                          className="ent-input text-xs font-mono font-bold bg-white w-32 text-rose-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = profileFormData.customSalaryDeductions.filter((_, i) => i !== idx);
                            setProfileFormData({ ...profileFormData, customSalaryDeductions: updated });
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* ── Tab 4: Employee Document Repository ── */}
          {profileTab === "documents" && (
            <div className="space-y-4">
              {/* Document List */}
              <div className="border border-[#EAE3D6] rounded overflow-hidden">
                <div className="bg-[#FAF8F5] p-2 text-xs font-bold text-slate-800 border-b border-[#EAE3D6] flex justify-between">
                  <span>ATTACHED HR DOCUMENTS</span>
                  <span>{userDocs.length} Documents</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {loadingDocs ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading documents...</div>
                  ) : userDocs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No documents attached to this employee profile yet. Use the upload box below to add contracts, ID proofs, or certificates.
                    </div>
                  ) : (
                    userDocs.map((doc) => (
                      <div key={doc._id} className="p-2.5 flex items-center justify-between hover:bg-[#FAF8F5]/60">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-[#1E40AF]" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{doc.title}</div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              Category: {doc.category.replace(/_/g, " ")} • {doc.fileSize || "PDF"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-slate-600 hover:text-[#1E40AF]"
                            title="Preview / Download"
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc._id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upload Document Box */}
              <form onSubmit={handleAddDocument} className="p-3 bg-[#FAF8F5] border border-[#EAE3D6] rounded space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Record New Document</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Document Title (e.g. Signed Offer Letter)"
                    value={docUploadForm.title}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, title: e.target.value })}
                    className="ent-input text-xs"
                  />
                  <select
                    value={docUploadForm.category}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, category: e.target.value })}
                    className="ent-select text-xs"
                  >
                    <option value="employment_contract">Employment Contract</option>
                    <option value="offer_letter">Offer Letter</option>
                    <option value="id_proof">Government ID / Passport</option>
                    <option value="tax_document">Tax Form (W4/Form 16/PAN)</option>
                    <option value="bank_document">Bank Cheque / Statement</option>
                    <option value="certificate">Degrees & Certificates</option>
                    <option value="other">Other Document</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="File URL or Cloud Link"
                    value={docUploadForm.fileUrl}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, fileUrl: e.target.value })}
                    className="ent-input text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="ent-btn-primary text-xs">
                    <Upload size={13} /> Attach Document
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Offboarding / Termination Security Modal ─────────────────────────── */}
      <Modal
        isOpen={Boolean(terminatingUser)}
        onClose={() => setTerminatingUser(null)}
        title="Employee Offboarding & Access Revocation"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setTerminatingUser(null)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="terminate-emp-form"
              disabled={saving}
              className="px-3.5 py-1.5 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              {saving ? "Revoking..." : "Confirm Offboarding & Revoke Login"}
            </button>
          </>
        }
      >
        <form id="terminate-emp-form" onSubmit={handleConfirmTermination} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-rose-600 shrink-0" />
              <span>Immediate Security Revocation</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Offboarding <strong>{terminatingUser?.username}</strong> ({terminatingUser?.email}) will immediately reject any future login attempts with a 403 Forbidden status.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-100 text-rose-800 rounded text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="ent-label">Exit Type *</label>
            <select
              value={terminateData.exitType}
              onChange={(e) => setTerminateData({ ...terminateData, exitType: e.target.value })}
              className="ent-select text-xs font-bold"
            >
              <option value="terminated">Termination (Involuntary)</option>
              <option value="resigned">Voluntary Resignation</option>
              <option value="contract_end">Contract Completion</option>
              <option value="layoff">Layoff / Restructuring</option>
            </select>
          </div>

          <div>
            <label className="ent-label">Last Working Date *</label>
            <input
              type="date"
              required
              value={terminateData.terminationDate}
              onChange={(e) => setTerminateData({ ...terminateData, terminationDate: e.target.value })}
              className="ent-input text-xs"
            />
          </div>

          <div>
            <label className="ent-label">Primary Reason *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Performance issues, Insubordination, Career transition..."
              value={terminateData.reason}
              onChange={(e) => setTerminateData({ ...terminateData, reason: e.target.value })}
              className="ent-input text-xs resize-none"
            />
          </div>

          <div>
            <label className="ent-label">HR / Exit Notes</label>
            <textarea
              rows={2}
              placeholder="Asset return status, severance agreement details..."
              value={terminateData.notes}
              onChange={(e) => setTerminateData({ ...terminateData, notes: e.target.value })}
              className="ent-input text-xs resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* ── Password Change Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(passwordUser)}
        onClose={() => setPasswordUser(null)}
        title={`Change Password — ${passwordUser?.username || ""}`}
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
              form="change-pass-form"
              disabled={saving}
              className="ent-btn-primary"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </>
        }
      >
        <form id="change-pass-form" onSubmit={handleSavePassword} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="ent-label">New Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="ent-input text-xs pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              minLength={6}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="ent-input text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* ── Employee Salary Slips History Modal ───────────────────────────────── */}
      <Modal
        isOpen={Boolean(viewingPayslipsUser)}
        onClose={() => setViewingPayslipsUser(null)}
        title={`Salary Statements & Payslips — ${viewingPayslipsUser?.username || ""}`}
        maxWidth="max-w-4xl"
        footer={
          <button type="button" onClick={() => setViewingPayslipsUser(null)} className="ent-btn-secondary">
            Close
          </button>
        }
      >
        <div className="space-y-4 text-xs">
          {loadingPayslips ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading salary statements...</div>
          ) : userPayslips.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-[#FAF8F5] rounded border border-[#EAE3D6]">
              No finalized salary statements generated for this employee yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left List of Months */}
              <div className="md:col-span-4 border border-[#EAE3D6] rounded divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {userPayslips.map((p) => (
                  <button
                    key={p.runId}
                    type="button"
                    onClick={() => setSelectedStatementPreview(p)}
                    className={`w-full p-2.5 text-left transition-all ${
                      selectedStatementPreview?.runId === p.runId
                        ? "bg-[#EFF6FF] text-[#1E40AF] font-bold"
                        : "hover:bg-[#FAF8F5] text-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs">{p.periodLabel}</span>
                      <span className="font-mono text-[11px] font-bold">₹{p.record.netPay?.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {p.isSent ? "✓ Sent to Employee" : "Pending Dispatch"}
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Statement Preview */}
              <div className="md:col-span-8 border border-[#EAE3D6] rounded p-4 bg-white space-y-4">
                {selectedStatementPreview && (
                  <>
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="https://crm.starwaywebdigital.com/assets/starwaylogo-CBhcSc4Y.png"
                          alt="Starway"
                          className="h-9 object-contain"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{selectedStatementPreview.periodLabel}</span>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {selectedStatementPreview.record.employeeIdCode} • {selectedStatementPreview.record.designation}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="ent-btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1.5"
                      >
                        <Printer size={13} /> Print / Save PDF
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="border border-[#EAE3D6] rounded p-2.5 space-y-1">
                        <span className="font-bold text-emerald-800 text-[11px] block">EARNINGS & ALLOWANCES</span>
                        {(selectedStatementPreview.record.earnings || []).map((e, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span className="text-slate-600">{e.name}</span>
                            <span className="font-mono font-bold">₹{e.amount?.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-slate-100 flex justify-between font-bold text-emerald-900">
                          <span>Gross:</span>
                          <span className="font-mono">₹{selectedStatementPreview.record.grossPay?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="border border-[#EAE3D6] rounded p-2.5 space-y-1">
                        <span className="font-bold text-rose-800 text-[11px] block">DEDUCTIONS & TAXES</span>
                        {(selectedStatementPreview.record.deductions || []).map((d, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span className="text-slate-600">{d.name}</span>
                            <span className="font-mono font-bold text-rose-700">-₹{d.amount?.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-slate-100 flex justify-between font-bold text-rose-900">
                          <span>Total Deduct:</span>
                          <span className="font-mono">-₹{selectedStatementPreview.record.totalDeductions?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#1E40AF] text-white rounded flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-200">Net Take-Home Pay</span>
                        <div className="text-[11px] text-blue-100">
                          Bank: {selectedStatementPreview.record.bankDetails?.bankName || "Direct Deposit"}
                        </div>
                      </div>
                      <div className="text-xl font-black font-mono">
                        ₹{selectedStatementPreview.record.netPay?.toLocaleString()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
