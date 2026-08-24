import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  Sliders,
  Filter,
  Check,
  X,
  User,
  Shield,
  HelpCircle,
  RefreshCw,
  Search,
  RotateCcw,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const SYSTEM_ROLES = [
  { value: "developer", label: "Developer" },
  { value: "caller", label: "Caller" },
  { value: "team_lead", label: "Team Lead" },
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR" },
];

const LEAVE_TYPES = [
  { value: "paid", label: "Paid Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "annual", label: "Annual Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "maternity", label: "Maternity / Paternity" },
  { value: "other", label: "Other" },
];

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "approved" | "rejected" | "negotiated"
  const [actionLoading, setActionLoading] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [datePreset, setDatePreset] = useState("all"); // "all" | "this_month" | "next_30" | "past_30" | "custom"
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Reject Modal State (Mandatory Reason)
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Negotiate Modal State
  const [negotiateModalData, setNegotiateModalData] = useState(null);
  const [negotiatedDays, setNegotiatedDays] = useState(1);
  const [negotiationNotes, setNegotiationNotes] = useState("");
  const [negotiateError, setNegotiateError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLeaves();
    fetchUsers();
  }, []);

  // Re-fetch leaves and users when HR returns to this page/tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLeaves();
        fetchUsers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/auth/hr/all-leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data || []);
    } catch (err) {
      console.error("Failed to load leaves", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersList((res.data || []).filter((u) => u.role !== "admin"));
    } catch (err) {
      console.error("Failed to load users list", err);
    }
  };

  // Direct Approve
  const handleDirectApprove = async (leave) => {
    setActionLoading(leave.recordId);
    try {
      await axios.put(
        `${API_BASE}/api/auth/hr/leave-status/${leave.userId}/${leave.recordId}`,
        {
          status: "approved",
          finalApprovedDays: leave.daysCount || (leave.duration === "half_day" || leave.type === "half" ? 0.5 : 1),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeaves();
    } catch (err) {
      console.error("Failed to approve leave", err);
      alert("Failed to approve leave request.");
    } finally {
      setActionLoading(null);
    }
  };

  // Open Reject Modal
  const handleOpenReject = (leave) => {
    setRejectModalData(leave);
    setRejectionReason("");
    setRejectError("");
  };

  // Submit Rejection (Mandatory Reason)
  const handleSubmitRejection = async (e) => {
    e.preventDefault();
    if (!rejectionReason || !rejectionReason.trim()) {
      setRejectError("Please provide a reason explaining why this leave request is being declined.");
      return;
    }

    setActionLoading(rejectModalData.recordId);
    try {
      await axios.put(
        `${API_BASE}/api/auth/hr/leave-status/${rejectModalData.userId}/${rejectModalData.recordId}`,
        {
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejectModalData(null);
      fetchLeaves();
    } catch (err) {
      console.error("Failed to reject leave", err);
      setRejectError(err.response?.data?.message || "Failed to reject leave.");
    } finally {
      setActionLoading(null);
    }
  };

  // Open Negotiate Modal
  const handleOpenNegotiate = (leave) => {
    setNegotiateModalData(leave);
    setNegotiatedDays(leave.finalApprovedDays || leave.daysCount || 1);
    setNegotiationNotes(leave.negotiationNotes || "Approved with adjusted working days schedule.");
    setNegotiateError("");
  };

  // Submit Negotiation / Counter-Offer
  const handleSubmitNegotiation = async (e) => {
    e.preventDefault();
    if (isNaN(Number(negotiatedDays)) || Number(negotiatedDays) <= 0) {
      setNegotiateError("Please enter a valid number of approved days.");
      return;
    }

    setActionLoading(negotiateModalData.recordId);
    try {
      await axios.put(
        `${API_BASE}/api/auth/hr/leave-status/${negotiateModalData.userId}/${negotiateModalData.recordId}`,
        {
          status: "negotiated",
          finalApprovedDays: Number(negotiatedDays),
          negotiationNotes: negotiationNotes.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNegotiateModalData(null);
      fetchLeaves();
    } catch (err) {
      console.error("Failed to negotiate leave", err);
      setNegotiateError(err.response?.data?.message || "Failed to submit negotiated leave.");
    } finally {
      setActionLoading(null);
    }
  };

  // Reset Filters Helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedUser("all");
    setSelectedRole("all");
    setSelectedLeaveType("all");
    setSelectedDuration("all");
    setDatePreset("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setActiveTab("all");
  };

  const isFilterActive =
    searchQuery ||
    selectedUser !== "all" ||
    selectedRole !== "all" ||
    selectedLeaveType !== "all" ||
    selectedDuration !== "all" ||
    datePreset !== "all" ||
    customStartDate ||
    customEndDate;

  // Filtered Leaves List
  const filteredLeaves = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return leaves.filter((l) => {
      // Tab Status
      if (activeTab !== "all" && l.status !== activeTab) return false;

      // User Filter
      if (selectedUser !== "all" && String(l.userId) !== String(selectedUser)) return false;

      // Role Filter
      if (selectedRole !== "all" && l.role !== selectedRole) return false;

      // Leave Type Filter
      if (selectedLeaveType !== "all" && l.leaveType !== selectedLeaveType) return false;

      // Duration Filter
      if (selectedDuration !== "all") {
        const isHalf = l.duration === "half_day" || l.type === "half";
        if (selectedDuration === "half_day" && !isHalf) return false;
        if (selectedDuration === "full_day" && isHalf) return false;
      }

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (l.fullName || l.username || "").toLowerCase().includes(q);
        const matchesEmail = (l.email || "").toLowerCase().includes(q);
        const matchesEmpId = (l.employeeId || "").toLowerCase().includes(q);
        const matchesNote = (l.note || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesEmpId && !matchesNote) return false;
      }

      // Date Filtering
      const lStart = new Date(l.startDate);
      const lEnd = new Date(l.endDate);

      if (datePreset === "this_month") {
        if (lEnd < startOfCurrentMonth || lStart > endOfCurrentMonth) return false;
      } else if (datePreset === "past_30") {
        if (lEnd < past30Days || lStart > now) return false;
      } else if (datePreset === "next_30") {
        if (lEnd < now || lStart > next30Days) return false;
      } else if (datePreset === "custom") {
        if (customStartDate && lEnd < new Date(customStartDate)) return false;
        if (customEndDate && lStart > new Date(customEndDate + "T23:59:59")) return false;
      }

      return true;
    });
  }, [
    leaves,
    activeTab,
    selectedUser,
    selectedRole,
    selectedLeaveType,
    selectedDuration,
    searchQuery,
    datePreset,
    customStartDate,
    customEndDate,
  ]);

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;
  const negotiatedCount = leaves.filter((l) => l.status === "negotiated").length;

  const totalFilteredDays = filteredLeaves.reduce(
    (sum, l) => sum + (l.finalApprovedDays ?? (l.duration === "half_day" || l.type === "half" ? 0.5 : l.daysCount || 1)),
    0
  );

  return (
    <div className="space-y-3.5 w-full">
      {/* ── Top Action Row ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={fetchLeaves}
          className="ent-btn-secondary text-xs flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
            activeTab === "all" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          All Requests ({leaves.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all shrink-0 inline-flex items-center gap-1.5 ${
            activeTab === "pending" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("approved")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
            activeTab === "approved" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("negotiated")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
            activeTab === "negotiated" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          Countered / Negotiated ({negotiatedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rejected")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
            activeTab === "rejected" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          Declined ({rejectedCount})
        </button>
      </div>

      {/* ── Enhanced Filter Toolbar ─────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#EAE3D6] p-3 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {/* 1. Search Query */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* 2. Employee Dropdown Filter */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Employees ({usersList.length})</option>
              {usersList.map((u) => {
                const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
                return (
                  <option key={u._id} value={u._id}>
                    {name} ({u.designation || u.role})
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. Role Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Roles</option>
              {SYSTEM_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Presets */}
          <div>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">📅 All Dates</option>
              <option value="this_month">📅 This Month</option>
              <option value="next_30">📅 Next 30 Days</option>
              <option value="past_30">📅 Past 30 Days</option>
              <option value="custom">📅 Custom Date Range...</option>
            </select>
          </div>

          {/* 5. Leave Type */}
          <div>
            <select
              value={selectedLeaveType}
              onChange={(e) => setSelectedLeaveType(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Leave Types</option>
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range Pickers (shown when Custom is selected) */}
        {datePreset === "custom" && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-600">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 border border-[#EAE3D6] rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[11px] font-bold text-slate-600">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 border border-[#EAE3D6] rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Filter Stats & Reset Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900">{filteredLeaves.length}</strong> of {leaves.length} requests
            </span>
            <span>•</span>
            <span>
              Total <strong className="text-blue-700">{totalFilteredDays}</strong> leave days
            </span>
          </div>

          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 text-slate-500 hover:text-rose-600 text-[11px] font-bold flex items-center gap-1 rounded hover:bg-slate-50"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table of Leave Requests ─────────────────────────────────────────── */}
      <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] shadow-xs">
        <div className="overflow-x-auto">
          <table className="ent-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role & Designation</th>
                <th>Date Window</th>
                <th>Duration & Type</th>
                <th>Applied / Approved</th>
                <th>Leave Balance</th>
                <th>Employee Note</th>
                <th>Status & HR Feedback</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400 font-medium">
                    Loading leave requests...
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-500 font-medium">
                    No leave requests found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => {
                  const start = new Date(leave.startDate);
                  const end = new Date(leave.endDate);
                  const isHalf = leave.duration === "half_day" || leave.type === "half";
                  const isPending = leave.status === "pending";
                  const displayName = leave.fullName || leave.username;

                  return (
                    <tr key={leave.recordId} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              leave.avatar ||
                              "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8="
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-[#EAE3D6]"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <span>{displayName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {leave.employeeId || leave.email} {leave.fullName && <span className="text-slate-400">(@{leave.username})</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="font-semibold text-slate-800 text-xs capitalize">
                          {leave.role || "Staff"}
                        </div>
                        <div className="text-[11px] text-slate-500">{leave.designation || "—"}</div>
                      </td>

                      <td>
                        <div className="font-bold text-slate-900 text-xs">
                          {start.toLocaleDateString()} &rarr; {end.toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Applied: {leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : "—"}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                            isHalf
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                          }`}
                        >
                          {isHalf ? "Half Day" : "Full Day"}
                        </span>
                        <div className="text-[10px] text-slate-500 capitalize mt-0.5 font-medium">
                          {leave.leaveType || "paid"}
                        </div>
                      </td>

                      <td>
                        <div className="font-black text-slate-900 text-xs">
                          {leave.finalApprovedDays ?? (isHalf ? 0.5 : leave.daysCount || 1)}{" "}
                          <span className="text-[10px] font-normal text-slate-500">
                            {leave.finalApprovedDays === 1 ? "day" : "days"}
                          </span>
                        </div>
                        {leave.status === "negotiated" && (
                          <div className="text-[10px] text-purple-700 font-semibold">
                            (Orig: {leave.daysCount}d)
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="font-bold text-[#1E40AF] text-xs">
                          {leave.leaveBalance ?? 12} <span className="text-[10px] font-normal text-slate-500">left</span>
                        </div>
                      </td>

                      <td className="max-w-[160px] text-xs text-slate-600 truncate" title={leave.note}>
                        {leave.note || "—"}
                      </td>

                      <td className="max-w-[200px] text-xs">
                        <Badge
                          variant={
                            leave.status === "approved"
                              ? "green"
                              : leave.status === "rejected"
                              ? "red"
                              : leave.status === "negotiated"
                              ? "purple"
                              : "amber"
                          }
                        >
                          {leave.status === "negotiated" ? "COUNTER-OFFER" : (leave.status || "PENDING").toUpperCase()}
                        </Badge>

                        {leave.status === "rejected" && leave.rejectionReason && (
                          <div className="text-[11px] text-rose-700 font-medium mt-1 truncate" title={leave.rejectionReason}>
                            Reason: {leave.rejectionReason}
                          </div>
                        )}

                        {leave.status === "negotiated" && leave.negotiationNotes && (
                          <div className="text-[11px] text-purple-700 font-medium mt-1 truncate" title={leave.negotiationNotes}>
                            Terms: {leave.negotiationNotes}
                          </div>
                        )}
                      </td>

                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve */}
                          <button
                            type="button"
                            disabled={actionLoading === leave.recordId}
                            onClick={() => handleDirectApprove(leave)}
                            title="Approve leave request"
                            className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            <Check size={14} />
                          </button>

                          {/* Negotiate / Adjust Days */}
                          <button
                            type="button"
                            disabled={actionLoading === leave.recordId}
                            onClick={() => handleOpenNegotiate(leave)}
                            title="Negotiate days / counter-offer"
                            className="p-1.5 rounded bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors disabled:opacity-50"
                          >
                            <Sliders size={14} />
                          </button>

                          {/* Reject */}
                          <button
                            type="button"
                            disabled={actionLoading === leave.recordId}
                            onClick={() => handleOpenReject(leave)}
                            title="Decline request with reason"
                            className="p-1.5 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
                          >
                            <X size={14} />
                          </button>
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

      {/* ── Mandatory Rejection Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(rejectModalData)}
        onClose={() => setRejectModalData(null)}
        title="Decline Leave Request"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRejectModalData(null)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="reject-leave-form"
              disabled={actionLoading === rejectModalData?.recordId}
              className="ent-btn-danger flex items-center gap-1.5"
            >
              {actionLoading === rejectModalData?.recordId ? "Declining..." : "Confirm Decline"}
            </button>
          </>
        }
      >
        {rejectModalData && (
          <form id="reject-leave-form" onSubmit={handleSubmitRejection} className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertCircle size={14} /> Declining request for {rejectModalData.fullName || rejectModalData.username}
              </div>
              <div className="text-[11px] text-rose-700">
                Window: {new Date(rejectModalData.startDate).toLocaleDateString()} &rarr;{" "}
                {new Date(rejectModalData.endDate).toLocaleDateString()} (
                {rejectModalData.daysCount} days)
              </div>
            </div>

            {rejectError && (
              <div className="p-2 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded">
                {rejectError}
              </div>
            )}

            <div>
              <label className="ent-label">
                Decline Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being declined..."
                className="ent-input text-xs"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* ── Negotiate / Counter-Offer Modal ──────────────────────────────────── */}
      <Modal
        isOpen={Boolean(negotiateModalData)}
        onClose={() => setNegotiateModalData(null)}
        title="Negotiate Leave Request Days"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setNegotiateModalData(null)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="negotiate-leave-form"
              disabled={actionLoading === negotiateModalData?.recordId}
              className="ent-btn-primary flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800"
            >
              {actionLoading === negotiateModalData?.recordId ? "Submitting..." : "Apply Adjusted Schedule"}
            </button>
          </>
        }
      >
        {negotiateModalData && (
          <form id="negotiate-leave-form" onSubmit={handleSubmitNegotiation} className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Sliders size={14} /> Adjusting request for {negotiateModalData.fullName || negotiateModalData.username}
              </div>
              <div className="text-[11px] text-purple-700">
                Original Request: {negotiateModalData.daysCount} days (
                {new Date(negotiateModalData.startDate).toLocaleDateString()} &rarr;{" "}
                {new Date(negotiateModalData.endDate).toLocaleDateString()})
              </div>
            </div>

            {negotiateError && (
              <div className="p-2 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded">
                {negotiateError}
              </div>
            )}

            <div>
              <label className="ent-label">Approved Working Days Allowed</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={negotiatedDays}
                onChange={(e) => setNegotiatedDays(e.target.value)}
                className="ent-input text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="ent-label">Negotiation Terms / Schedule Notes</label>
              <textarea
                rows={3}
                value={negotiationNotes}
                onChange={(e) => setNegotiationNotes(e.target.value)}
                placeholder="e.g. Approved 2 days instead of 4 due to ongoing project release."
                className="ent-input text-xs"
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
