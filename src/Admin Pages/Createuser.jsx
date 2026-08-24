import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Shield,
  CreditCard,
  Building,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

// Toggle flag to hide base monthly salary input during onboarding without deleting logic
const HIDE_BASE_SALARY = true;

export default function CreateUser() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "developer",
    designation: "",
    employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    employmentType: "full_time",
    baseSalary: 45000,
    shiftId: "",
  });

  const [shifts, setShifts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentRole = localStorage.getItem("role") || "admin";

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/shifts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShifts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch shifts:", err);
      }
    };
    fetchShifts();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role || "developer",
        designation: formData.designation.trim(),
        employeeId: formData.employeeId.trim(),
        employmentType: formData.employmentType,
        baseSalary: Number(formData.baseSalary || 0),
        shiftId: formData.shiftId || null,
      };

      const res = await axios.post(`${API_BASE}/api/auth/register`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      apiCache.invalidate("users");
      apiCache.invalidate("admin_overview_metrics");

      setStatusMessage({
        type: "success",
        text: res.data.message || "Employee successfully onboarded!",
      });

      setTimeout(() => {
        if (currentRole === "hr") {
          navigate("/dashboard-hr/employees");
        } else {
          navigate("/dashboard-admin/users");
        }
      }, 1000);
    } catch (error) {
      console.error("Error onboarding user:", error);
      setStatusMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to onboard employee",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Onboard New Workforce Member
          </h1>
        </div>

        <Link
          to={currentRole === "hr" ? "/dashboard-hr/employees" : "/dashboard-admin/users"}
          className="ent-btn-secondary text-xs"
        >
          <ArrowLeft size={13} /> Back to Directory
        </Link>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded border text-xs font-semibold flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Onboarding Form Card */}
      <div className="ent-card p-6 bg-white border-[#EAE3D6] shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="ent-label">Full Name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.username}
                  onChange={handleChange}
                  className="ent-input ent-input-with-icon text-xs"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="ent-label">Work Email *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="alex.morgan@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="ent-input ent-input-with-icon text-xs"
                />
              </div>
            </div>

            {/* Initial Password */}
            <div>
              <label className="ent-label">Initial Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="ent-input ent-input-with-icon text-xs"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="ent-label">Contact Number *</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="ent-input ent-input-with-icon text-xs font-mono"
                />
              </div>
            </div>

            {/* System Role */}
            <div>
              <label className="ent-label">System Role *</label>
              <div className="relative">
                <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="ent-select ent-input-with-icon text-xs font-bold"
                >
                  {SYSTEM_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="ent-label">Designation *</label>
              <div className="relative">
                <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="designation"
                  required
                  placeholder="e.g. Senior Fullstack Developer"
                  value={formData.designation}
                  onChange={handleChange}
                  className="ent-input ent-input-with-icon text-xs"
                />
              </div>
            </div>

            {/* Employee ID */}
            <div>
              <label className="ent-label">Employee ID Code *</label>
              <input
                type="text"
                name="employeeId"
                required
                placeholder="EMP-101"
                value={formData.employeeId}
                onChange={handleChange}
                className="ent-input text-xs font-mono font-bold"
              />
            </div>

            {/* Base Monthly Salary */}
            {!HIDE_BASE_SALARY && (
              <div>
                <label className="ent-label">Base Monthly Salary (₹) *</label>
                <div className="relative">
                  <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    name="baseSalary"
                    required
                    placeholder="45000"
                    value={formData.baseSalary}
                    onChange={handleChange}
                    className="ent-input ent-input-with-icon text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* Assigned Work Shift */}
            <div>
              <label className="ent-label">Work Shift Timing (Optional)</label>
              <div className="relative">
                <select
                  name="shiftId"
                  value={formData.shiftId}
                  onChange={handleChange}
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
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="ent-btn-primary"
            >
              <UserPlus size={14} />
              {isSubmitting ? "Onboarding Staff..." : "Complete Onboarding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}