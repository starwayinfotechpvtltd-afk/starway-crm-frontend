import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  CalendarDays,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Info,
  CalendarCheck,
  ChevronRight,
  Shield,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function MyLeaves() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    duration: "full_day", // 'full_day' | 'half_day'
    leaveType: "paid", // 'paid' | 'sick' | 'casual' | 'unpaid'
    note: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMyLeaveData();
  }, []);

  // Re-fetch leave data when page becomes visible (e.g. if HR approved/rejected leaves)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMyLeaveData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchMyLeaveData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
    } catch (err) {
      console.error("Failed to load user leave data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = () => {
    const today = new Date().toISOString().split("T")[0];
    setLeaveForm({
      startDate: today,
      endDate: today,
      duration: "full_day",
      leaveType: "paid",
      note: "",
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsApplyModalOpen(true);
  };

  const calculateDays = () => {
    if (!leaveForm.startDate || !leaveForm.endDate) return 1;
    if (leaveForm.duration === "half_day") return 0.5;
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diff) || diff < 1 ? 1 : diff;
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) {
      setErrorMsg("Please select valid start and end dates.");
      return;
    }

    if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
      setErrorMsg("End date cannot be earlier than start date.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await axios.post(
        `${API_BASE}/api/auth/leave-request`,
        {
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          duration: leaveForm.duration,
          leaveType: leaveForm.leaveType,
          note: leaveForm.note.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsApplyModalOpen(false);
      setSuccessMsg("Leave application submitted to HR successfully!");
      fetchMyLeaveData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Failed to apply for leave:", err);
      setErrorMsg(err.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const leaveRecords = (userData?.leaveRecords || []).slice().reverse();
  const pendingCount = leaveRecords.filter((r) => r.status === "pending").length;
  const approvedCount = leaveRecords.filter((r) => r.status === "approved" || r.status === "negotiated").length;
  const rejectedCount = leaveRecords.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-3.5 w-full">
      {/* ── Top Header Actions ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={fetchMyLeaveData}
          className="ent-btn-secondary text-xs flex items-center gap-1.5"
          title="Refresh"
        >
          <RefreshCw size={13} /> Refresh
        </button>
        <button
          type="button"
          onClick={handleOpenApply}
          className="ent-btn-primary text-xs"
        >
          <Plus size={13} /> Apply for Leave
        </button>
      </div>

      {/* ── Success Alert ───────────────────────────────────────────────────── */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── KPI Balance & Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Leave Balance */}
        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Balance</span>
            <div className="text-2xl font-black text-[#1E40AF] mt-1">
              {loading ? "..." : `${userData?.leaveBalance ?? 12}`} <span className="text-sm font-bold text-slate-400">Days</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center">
            <CalendarCheck size={20} />
          </div>
        </div>

        {/* Card 2: Pending Applications */}
        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {loading ? "..." : pendingCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 3: Approved Leaves */}
        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Leaves</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {loading ? "..." : approvedCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 4: Rejected / Countered */}
        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Declined / Closed</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {loading ? "..." : rejectedCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* ── Leave Requests History Table ────────────────────────────────────── */}
      <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] shadow-xs">
        <div className="ent-card-header flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            My Leave Request History
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {leaveRecords.length} Total Applications
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="ent-table">
            <thead>
              <tr>
                <th>Date Range</th>
                <th>Duration & Unit</th>
                <th>Days Count</th>
                <th>Category</th>
                <th>My Reason / Note</th>
                <th>HR Status</th>
                <th>HR Response / Note</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400 font-medium">
                    Loading your leave history...
                  </td>
                </tr>
              ) : leaveRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500 font-medium">
                    No leave requests found. Click "Apply for Leave" above to create one.
                  </td>
                </tr>
              ) : (
                leaveRecords.map((r) => {
                  const start = new Date(r.startDate);
                  const end = new Date(r.endDate);
                  const isHalf = r.duration === "half_day" || r.type === "half";

                  return (
                    <tr key={r._id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td>
                        <span className="text-xs font-bold text-slate-900">
                          {start.toLocaleDateString()} &rarr; {end.toLocaleDateString()}
                        </span>
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
                      </td>
                      <td>
                        <span className="text-xs font-black text-slate-800">
                          {r.finalApprovedDays ?? (isHalf ? 0.5 : r.daysCount || 1)}{" "}
                          <span className="text-[10px] font-normal text-slate-500">
                            {r.finalApprovedDays === 1 ? "day" : "days"}
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-medium text-slate-700 capitalize">
                          {r.leaveType || "Paid Leave"}
                        </span>
                      </td>
                      <td className="max-w-[180px] truncate text-slate-600 text-xs" title={r.note}>
                        {r.note || "—"}
                      </td>
                      <td>
                        <Badge
                          variant={
                            r.status === "approved"
                              ? "green"
                              : r.status === "rejected"
                              ? "red"
                              : r.status === "negotiated"
                              ? "purple"
                              : "amber"
                          }
                        >
                          {r.status === "negotiated" ? "COUNTER-OFFER / APPROVED" : (r.status || "PENDING").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="max-w-[200px] text-xs">
                        {r.status === "rejected" && r.rejectionReason ? (
                          <div className="text-rose-700 font-medium flex items-center gap-1">
                            <AlertCircle size={12} className="shrink-0" />
                            <span className="truncate" title={r.rejectionReason}>
                              {r.rejectionReason}
                            </span>
                          </div>
                        ) : r.status === "negotiated" && r.negotiationNotes ? (
                          <div className="text-purple-700 font-medium flex items-center gap-1">
                            <MessageSquare size={12} className="shrink-0" />
                            <span className="truncate" title={r.negotiationNotes}>
                              {r.negotiationNotes}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Apply Leave Modal ────────────────────────────────────────────────── */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="apply-leave-form"
              disabled={submitting}
              className="ent-btn-primary"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </>
        }
      >
        <form id="apply-leave-form" onSubmit={handleApplyLeave} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Duration Selector: Full Day vs Half Day */}
          <div>
            <label className="ent-label">Leave Duration *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLeaveForm({ ...leaveForm, duration: "full_day" })}
                className={`py-2 px-3 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  leaveForm.duration === "full_day"
                    ? "bg-[#1E40AF] text-white border-[#1E40AF] shadow-xs"
                    : "bg-[#FAF8F5] text-slate-700 border-[#EAE3D6] hover:bg-[#F5EFE6]"
                }`}
              >
                <Calendar size={13} /> Full Day
              </button>
              <button
                type="button"
                onClick={() =>
                  setLeaveForm({
                    ...leaveForm,
                    duration: "half_day",
                    endDate: leaveForm.startDate,
                  })
                }
                className={`py-2 px-3 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  leaveForm.duration === "half_day"
                    ? "bg-[#1E40AF] text-white border-[#1E40AF] shadow-xs"
                    : "bg-[#FAF8F5] text-slate-700 border-[#EAE3D6] hover:bg-[#F5EFE6]"
                }`}
              >
                <Clock size={13} /> Half Day (0.5d)
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ent-label">Start Date *</label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => {
                  const s = e.target.value;
                  setLeaveForm((prev) => ({
                    ...prev,
                    startDate: s,
                    endDate: prev.duration === "half_day" ? s : prev.endDate < s ? s : prev.endDate,
                  }));
                }}
                className="ent-input text-xs"
              />
            </div>

            <div>
              <label className="ent-label">End Date *</label>
              <input
                type="date"
                required
                disabled={leaveForm.duration === "half_day"}
                value={leaveForm.duration === "half_day" ? leaveForm.startDate : leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="ent-input text-xs disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Calculation Badge */}
          <div className="p-2.5 bg-[#FAF8F5] border border-[#EAE3D6] rounded text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Calculated Leave Days:</span>
            <span className="font-black text-[#1E40AF] text-sm">
              {calculateDays()} {calculateDays() === 1 ? "Day" : "Days"}
            </span>
          </div>

          {/* Category */}
          <div>
            <label className="ent-label">Leave Category</label>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="ent-select text-xs"
            >
              <option value="paid">Paid Annual / Casual Leave</option>
              <option value="sick">Sick / Medical Leave</option>
              <option value="unpaid">Unpaid Leave</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Reason / Note */}
          <div>
            <label className="ent-label">Reason / Justification</label>
            <textarea
              rows={3}
              required
              placeholder="State the reason for your leave request..."
              value={leaveForm.note}
              onChange={(e) => setLeaveForm({ ...leaveForm, note: e.target.value })}
              className="ent-input text-xs resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
