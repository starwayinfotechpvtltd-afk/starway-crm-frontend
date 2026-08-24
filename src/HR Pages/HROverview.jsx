import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  ArrowRight,
  Shield,
  CreditCard,
  UserPlus,
  GitBranch,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Building,
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";

// Toggle to hide attendance feature without deleting code
const HIDE_ATTENDANCE = true;
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const ROLE_COLORS = {
  developer: "#2563EB",
  caller: "#D97706",
  team_lead: "#4F46E5",
  manager: "#0891B2",
  hr: "#E11D48",
  admin: "#7C3AED",
};

export default function HROverview() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [teams, setTeams] = useState([]);
  const [latestRun, setLatestRun] = useState(null);

  const fetchHRData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [usersRes, leavesRes, teamsRes, runsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/auth/users`, config),
        axios.get(`${API_BASE}/api/auth/hr/all-leaves`, config),
        axios.get(`${API_BASE}/api/teams`, config),
        axios.get(`${API_BASE}/api/payroll-engine/runs`, config),
      ]);

      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data || []);
      if (leavesRes.status === "fulfilled") setLeaves(leavesRes.value.data || []);
      if (teamsRes.status === "fulfilled") setTeams(teamsRes.value.data || []);
      if (runsRes.status === "fulfilled" && runsRes.value.data?.length > 0) {
        setLatestRun(runsRes.value.data[0]);
      }
    } catch (err) {
      console.error("Failed to load HR dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRData();
  }, []);

  // Re-fetch HR dashboard data on visibility return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchHRData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const pendingLeaves = leaves.filter((l) => l.status === "pending");
  const activeStaff = users.filter((u) => u.employmentStatus === "active" || (!u.employmentStatus && u.status !== "terminated"));
  const offboardedStaff = users.filter((u) => u.employmentStatus === "terminated" || u.employmentStatus === "resigned" || u.status === "terminated");

  // Role distribution for chart
  const roleCounts = users.reduce((acc, u) => {
    const r = (u.role || "developer").toLowerCase();
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  const roleChartData = Object.entries(roleCounts).map(([name, value]) => ({
    name: name.replace("_", " ").toUpperCase(),
    value,
    roleKey: name,
  }));

  const getRoleBadgeVariant = (role) => {
    switch ((role || "").toLowerCase()) {
      case "admin": return "purple";
      case "manager":
      case "team_lead": return "blue";
      case "hr": return "red";
      case "developer": return "green";
      default: return "neutral";
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Human Resources & Workforce Overview
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/dashboard-hr/create-user" className="ent-btn-primary">
            <UserPlus size={14} /> Onboard Employee
          </Link>
          <Link to="/dashboard-hr/payroll" className="ent-btn-secondary">
            <CreditCard size={14} /> Payroll Hub
          </Link>
        </div>
      </div>

      {/* ── Executive Stat Cards Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workforce"
          value={loading ? "..." : `${activeStaff.length}`}
          icon={Users}
          description={`${users.length} Total Registered Accounts`}
          badge={loading ? null : { label: `${offboardedStaff.length} Exited`, variant: "neutral" }}
        />
        <StatCard
          title="Pending Leave Desk"
          value={loading ? "..." : `${pendingLeaves.length}`}
          icon={Calendar}
          description="Requests waiting for HR authorization"
          badge={pendingLeaves.length > 0 ? { label: "Requires Action", variant: "amber" } : { label: "All Clear", variant: "green" }}
        />
        <StatCard
          title="Operating Teams"
          value={loading ? "..." : `${teams.length}`}
          icon={GitBranch}
          description="Cross-functional units & rosters"
          badge={{ label: "Active", variant: "green" }}
        />
        {!HIDE_ATTENDANCE ? (
          <StatCard
            title="Attendance & Shifts"
            value={loading ? "..." : `${users.length}`}
            icon={Clock}
            description="GPS Live Board & Shift Rotas"
            badge={{ label: "Live System", variant: "green" }}
          />
        ) : (
          <StatCard
            title="Departments"
            value={loading ? "..." : "Active"}
            icon={Building}
            description="Departmental Units & Structure"
            badge={{ label: "Operational", variant: "neutral" }}
          />
        )}
      </div>

      {/* ── Quick Action Command Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          to="/dashboard-hr/employees"
          className="p-3.5 bg-white border border-[#EAE3D6] rounded shadow-xs hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-[#1E40AF]">Employee Directory</div>
              <div className="text-[11px] text-slate-500">Profiles, Docs & Offboarding</div>
            </div>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:text-[#1E40AF]" />
        </Link>

        <Link
          to="/dashboard-hr/leaves"
          className="p-3.5 bg-white border border-[#EAE3D6] rounded shadow-xs hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Calendar size={16} />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-amber-800">Review Leave Requests</div>
              <div className="text-[11px] text-slate-500">{pendingLeaves.length} pending approval</div>
            </div>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-800" />
        </Link>

        {!HIDE_ATTENDANCE ? (
          <Link
            to="/dashboard-hr/attendance"
            className="p-3.5 bg-white border border-[#EAE3D6] rounded shadow-xs hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Clock size={16} />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800">Live Attendance Board</div>
                <div className="text-[11px] text-slate-500">GPS logs & Shift Rotas</div>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-800" />
          </Link>
        ) : (
          <Link
            to="/dashboard-hr/departments"
            className="p-3.5 bg-white border border-[#EAE3D6] rounded shadow-xs hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building size={16} />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-800">Manage Departments</div>
                <div className="text-[11px] text-slate-500">Division & Units Roster</div>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-800" />
          </Link>
        )}

        <Link
          to="/dashboard-hr/teams"
          className="p-3.5 bg-white border border-[#EAE3D6] rounded shadow-xs hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GitBranch size={16} />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-purple-800">Operating Teams</div>
              <div className="text-[11px] text-slate-500">Structure & Leaders</div>
            </div>
          </div>
          <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-800" />
        </Link>
      </div>

      {/* ── Main Dashboard Split (Chart & Recent Leaves) ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Role Distribution Donut Chart */}
        <div className="lg:col-span-5 ent-card p-5 bg-white border-[#EAE3D6] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Workforce Role Distribution
            </h2>
            <span className="text-xs font-mono font-bold text-slate-400">{users.length} Total</span>
          </div>

          <div className="h-56 w-full">
            {roleChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No employee roles registered.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ROLE_COLORS[entry.roleKey] || "#64748B"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} staff`, name]}
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "none",
                      borderRadius: "4px",
                      color: "#FFF",
                      fontSize: "11px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    formatter={(val) => <span className="text-[11px] font-semibold text-slate-600">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Recent Leave Requests */}
        <div className="lg:col-span-7 ent-card overflow-hidden bg-white border-[#EAE3D6] shadow-xs flex flex-col justify-between">
          <div>
            <div className="ent-card-header flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Leave Requests
              </h2>
              <Link
                to="/dashboard-hr/leaves"
                className="text-xs text-[#1E40AF] font-bold hover:underline inline-flex items-center gap-1"
              >
                All Requests <ArrowRight size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="ent-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Duration & Units</th>
                    <th>Date Window</th>
                    <th>HR Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.slice(0, 5).map((l) => (
                    <tr key={l.recordId} className="hover:bg-[#FAF8F5]">
                      <td>
                        <div className="font-bold text-slate-900 text-xs">{l.username}</div>
                        <div className="text-[11px] text-slate-500 capitalize">{l.role || "Staff"}</div>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            l.duration === "half_day" || l.type === "half"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                          }`}
                        >
                          {l.duration === "half_day" || l.type === "half" ? "Half Day (0.5d)" : "Full Day"}
                        </span>
                      </td>
                      <td className="text-xs text-slate-700 font-mono">
                        {new Date(l.startDate).toLocaleDateString()} &rarr; {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        <Badge
                          variant={
                            l.status === "approved"
                              ? "green"
                              : l.status === "rejected"
                              ? "red"
                              : l.status === "negotiated"
                              ? "purple"
                              : "amber"
                          }
                        >
                          {(l.status || "PENDING").toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-xs text-slate-400">
                        No leave records recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
