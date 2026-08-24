import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Users,
  CheckCircle2,
  TrendingUp,
  FolderKanban,
  UserCheck,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
  FileBarChart,
  Plus,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { TableSkeleton, StatCardsSkeleton } from "../components/ui/Skeleton";
import { apiCache } from "../utils/apiCache";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const PALETTE = ["#2563EB", "#059669", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#475569"];

export default function AdminHome() {
  const [isLoading, setIsLoading] = useState(true);

  // Core Statistics State
  const [totalLeads, setTotalLeads] = useState(0);
  const [closedLeads, setClosedLeads] = useState(0);
  const [newLeadsMonth, setNewLeadsMonth] = useState(0);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);

  // Entities & Collections
  const [allProjects, setAllProjects] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [userLeads, setUserLeads] = useState([]);
  const [leadTrends, setLeadTrends] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Modals & Inspection State
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Active View Filter for Analytics Suite
  const [analyticsTab, setAnalyticsTab] = useState("acquisition"); // 'acquisition' | 'portfolio' | 'channels' | 'team'

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // 1. Check cache for 0ms instant display
    const cachedData = apiCache.get("admin_overview_metrics_v2");
    if (cachedData?.data) {
      const c = cachedData.data;
      setTotalLeads(c.totalLeads || 0);
      setClosedLeads(c.closedLeads || 0);
      setNewLeadsMonth(c.newLeadsMonth || 0);
      setActiveProjectsCount(c.activeProjectsCount || 0);
      setAllProjects(c.allProjects || []);
      setRecentLeads(c.recentLeads || []);
      setUserLeads(c.userLeads || []);
      setLeadTrends(c.leadTrends || []);
      setAllTasks(c.allTasks || []);
      setAllUsers(c.allUsers || []);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // 2. Fetch fresh data from backend
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [
        totalRes,
        closedRes,
        newMonthRes,
        activeCountRes,
        trendsRes,
        recentLeadsRes,
        userLeadsRes,
        projectsRes,
        tasksRes,
        usersRes,
      ] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/leads/total-leads`, config),
        axios.get(`${API_BASE}/api/leads/total-closed-leads`, config),
        axios.get(`${API_BASE}/api/leads/new-leads-this-month`, config),
        axios.get(`${API_BASE}/api/newproject/active-projects-count`, config),
        axios.get(`${API_BASE}/api/leads/lead-trends`, config),
        axios.get(`${API_BASE}/api/leads/recent-leads`, config),
        axios.get(`${API_BASE}/api/leads/leads-by-user`, config),
        axios.get(`${API_BASE}/api/newproject/projects`, config),
        axios.get(`${API_BASE}/api/tasks/all`, config),
        axios.get(`${API_BASE}/api/auth/users`, config),
      ]);

      const tLeads = totalRes.status === "fulfilled" ? totalRes.value.data.totalLeads || 0 : 0;
      const cLeads = closedRes.status === "fulfilled" ? closedRes.value.data.totalClosedLeads || 0 : 0;
      const nLeads = newMonthRes.status === "fulfilled" ? newMonthRes.value.data.totalNewLeads || 0 : 0;
      const aProjCount = activeCountRes.status === "fulfilled" ? activeCountRes.value.data?.count || 0 : 0;
      const rLeads = recentLeadsRes.status === "fulfilled" ? recentLeadsRes.value.data || [] : [];
      const projs = projectsRes.status === "fulfilled" ? projectsRes.value.data || [] : [];
      const tasks = tasksRes.status === "fulfilled" ? tasksRes.value.data || [] : [];
      const users = usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data) ? usersRes.value.data : [];

      const trends =
        trendsRes.status === "fulfilled" && Array.isArray(trendsRes.value.data)
          ? trendsRes.value.data.map((item) => ({
              name: item._id || "Period",
              leads: item.count || 0,
            }))
          : [];

      const uLeads =
        userLeadsRes.status === "fulfilled" && Array.isArray(userLeadsRes.value.data)
          ? userLeadsRes.value.data.map((item) => ({
              user: item._id || "Unknown",
              leads: item.count || 0,
            }))
          : [];

      setTotalLeads(tLeads);
      setClosedLeads(cLeads);
      setNewLeadsMonth(nLeads);
      setActiveProjectsCount(aProjCount);
      setRecentLeads(rLeads);
      setAllProjects(projs);
      setAllTasks(tasks);
      setAllUsers(users);
      setLeadTrends(trends);
      setUserLeads(uLeads);

      const dashboardPayload = {
        totalLeads: tLeads,
        closedLeads: cLeads,
        newLeadsMonth: nLeads,
        activeProjectsCount: aProjCount,
        recentLeads: rLeads,
        allProjects: projs,
        allTasks: tasks,
        allUsers: users,
        leadTrends: trends,
        userLeads: uLeads,
      };

      apiCache.set("admin_overview_metrics_v2", dashboardPayload, 3 * 60 * 1000);
    } catch (err) {
      console.error("Failed to load admin overview data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Computed Business Intelligence Metrics ──────────────────────────────────
  const metrics = useMemo(() => {
    const activeProjects = allProjects.filter((p) => (p.status || "Active").toLowerCase() === "active");

    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : "0.0";

    const oneTimeCount = allProjects.filter((p) => p.category === "One-Time" || p.serviceType === "One-Time").length;
    const subscriptionCount = allProjects.filter((p) => p.category === "Subscription" || p.serviceType === "Subscription-Based").length;
    const websiteCount = allProjects.filter((p) => p.category === "Website" || p.serviceType === "Website-Based").length;

    const doneTasksCount = allTasks.filter((t) => (t.status || "").toLowerCase() === "done").length;
    const overdueTasksCount = allTasks.filter((t) => {
      if ((t.status || "").toLowerCase() === "done") return false;
      return t.deadline && new Date(t.deadline) < new Date();
    }).length;

    const workforceCount = allUsers.length || 0;
    const devCount = allUsers.filter((u) => u.role === "developer").length;
    const callerCount = allUsers.filter((u) => u.role === "caller").length;
    const leadCount = allUsers.filter((u) => u.role === "team_lead" || u.role === "manager").length;

    return {
      conversionRate,
      activeProjectsCount: activeProjects.length || activeProjectsCount,
      oneTimeCount,
      subscriptionCount,
      websiteCount,
      totalTasksCount: allTasks.length,
      doneTasksCount,
      overdueTasksCount,
      workforceCount,
      devCount,
      callerCount,
      leadCount,
      activeProjects,
    };
  }, [allProjects, totalLeads, closedLeads, activeProjectsCount, allTasks, allUsers]);

  // ── Chart Data Calculations ────────────────────────────────────────────────
  const leadChannelData = useMemo(() => {
    const typeCounts = recentLeads.reduce((acc, lead) => {
      const type = lead.leadType || "Prospect";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(typeCounts);
    if (entries.length === 0) {
      return [
        { name: "Hot Lead", value: 12 },
        { name: "Direct Inbound", value: 24 },
        { name: "Referral", value: 8 },
        { name: "Organic Web", value: 15 },
      ];
    }
    return entries.map(([name, value]) => ({ name, value }));
  }, [recentLeads]);

  const projectPortfolioData = useMemo(() => {
    return [
      { name: "One-Time Builds", value: metrics.oneTimeCount || 1, color: "#2563EB" },
      { name: "Subscriptions", value: metrics.subscriptionCount || 1, color: "#059669" },
      { name: "Website Solutions", value: metrics.websiteCount || 1, color: "#D97706" },
    ];
  }, [metrics]);

  const teamPerformanceData = useMemo(() => {
    if (userLeads.length > 0) {
      return userLeads.slice(0, 6).map((u) => ({
        name: u.user,
        leads: u.leads,
      }));
    }
    return [
      { name: "Sarah K.", leads: 18 },
      { name: "Alex M.", leads: 14 },
      { name: "David R.", leads: 11 },
      { name: "Emma W.", leads: 9 },
    ];
  }, [userLeads]);

  const customTooltipStyle = {
    backgroundColor: "#FFFFFF",
    borderColor: "#EAE3D6",
    borderRadius: "6px",
    padding: "8px 12px",
    boxShadow: "0 4px 12px rgba(30, 41, 59, 0.08)",
    fontSize: "12px",
    fontWeight: "700",
    color: "#1E293B",
  };

  return (
    <div className="space-y-6">
      {/* ── Executive Command Banner ─────────────────────────────────────────── */}
      <div className="ent-card p-5 bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#1D4ED8] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded bg-white text-[#1E40AF] font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Enterprise Command & Executive Overview
              </h1>
              <span className="bg-white/20 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider border border-white/25">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-[#DBEAFE] mt-0.5 font-medium">
              Real-time sales performance, active client projects, and team operations.
            </p>
          </div>
        </div>

        {/* Quick Actions Launchpad */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Link
            to="/dashboard-admin/add-leads"
            className="px-3.5 py-1.5 bg-white text-[#1E40AF] hover:bg-[#FAF8F5] font-bold text-xs rounded shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus size={13} /> Add Lead
          </Link>
          <Link
            to="/dashboard-admin/create-project"
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded border border-white/30 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <FolderKanban size={13} /> Create Project
          </Link>
          <Link
            to="/dashboard-admin/developer-reports"
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded border border-white/30 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <FileBarChart size={13} /> Work Reports
          </Link>
          <Link
            to="/dashboard-admin/users"
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded border border-white/30 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Users size={13} /> Staff Directory
          </Link>
        </div>
      </div>

      {/* ── 5-Card Executive Business Intelligence Grid ──────────────────────── */}
      {isLoading && allProjects.length === 0 ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Leads & Conversion */}
          <div className="ent-card p-4 bg-white border-[#EAE3D6] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#FAF8F5]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Leads</span>
              <div className="w-6 h-6 rounded bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Users size={13} />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                {totalLeads.toLocaleString()}
              </div>
              <span className="text-[10px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE] mt-1 inline-block">
                {metrics.conversionRate}% conversion
              </span>
            </div>
          </div>

          {/* Card 2: Closed Deals */}
          <div className="ent-card p-4 bg-white border-[#EAE3D6] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#FAF8F5]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Closed Deals</span>
              <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={13} />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-xl font-bold text-emerald-800 font-mono tracking-tight">
                {closedLeads.toLocaleString()}
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-1 block">
                +{newLeadsMonth} this month
              </span>
            </div>
          </div>

          {/* Card 3: Active Projects */}
          <div className="ent-card p-4 bg-white border-[#EAE3D6] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#FAF8F5]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Projects</span>
              <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                <FolderKanban size={13} />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                {metrics.activeProjectsCount}
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-1 block">
                {metrics.subscriptionCount} recurring • {metrics.oneTimeCount} one-time
              </span>
            </div>
          </div>

          {/* Card 4: Task Health & Overdue */}
          <div className="ent-card p-4 bg-white border-[#EAE3D6] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#FAF8F5]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Task Output</span>
              <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock size={13} />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                {metrics.doneTasksCount}/{metrics.totalTasksCount}
              </div>
              {metrics.overdueTasksCount > 0 ? (
                <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-1 inline-block">
                  {metrics.overdueTasksCount} overdue
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                  All on track
                </span>
              )}
            </div>
          </div>

          {/* Card 5: Workforce Strength */}
          <div className="ent-card p-4 bg-white border-[#EAE3D6] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#FAF8F5]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Staff</span>
              <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center">
                <Building2 size={13} />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                {metrics.workforceCount}
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-1 block">
                {metrics.devCount} Devs • {metrics.callerCount} Callers • {metrics.leadCount} Leads
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive Analytics & Performance Command Suite ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Chart Card (2 Cols) */}
        <div className="lg:col-span-2 ent-card p-5 bg-white border-[#EAE3D6] shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D6] mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#2563EB]" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Pipeline Trajectory & Performance Velocity
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Multi-metric trend tracking lead volume, conversion, and task velocity.
              </p>
            </div>

            {/* View Tab Controls */}
            <div className="inline-flex items-center bg-[#F5EFE6] p-0.5 rounded border border-[#EAE3D6] gap-0.5 text-xs">
              <button
                onClick={() => setAnalyticsTab("acquisition")}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  analyticsTab === "acquisition"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Lead Trends
              </button>
              <button
                onClick={() => setAnalyticsTab("team")}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  analyticsTab === "team"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Staff Output
              </button>
            </div>
          </div>

          {/* Chart Rendering Container */}
          <div className="w-full h-72">
            {isLoading && leadTrends.length === 0 ? (
              <div className="w-full h-full ent-shimmer rounded" />
            ) : analyticsTab === "acquisition" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadTrends.length > 0 ? leadTrends : [{ name: "Current Month", leads: totalLeads }]}>
                  <defs>
                    <linearGradient id="adminLeadColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE3D6" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="Inbound Leads"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#adminLeadColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE3D6" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="leads" name="Leads Handled" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Secondary Donut / Distribution Card (1 Col) */}
        <div className="ent-card p-5 bg-white border-[#EAE3D6] shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#EAE3D6] mb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#2563EB]" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Portfolio & Channels
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Breakdown of project suites & prospect streams
              </p>
            </div>

            <div className="inline-flex items-center bg-[#F5EFE6] p-0.5 rounded border border-[#EAE3D6] gap-0.5 text-[11px]">
              <button
                onClick={() => setAnalyticsTab("portfolio")}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  analyticsTab === "portfolio" || analyticsTab === "acquisition"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-600"
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setAnalyticsTab("channels")}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  analyticsTab === "channels"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-600"
                }`}
              >
                Channels
              </button>
            </div>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsTab === "channels" ? leadChannelData : projectPortfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(analyticsTab === "channels" ? leadChannelData : projectPortfolioData).map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color || PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-[#EAE3D6]">
            {(analyticsTab === "channels" ? leadChannelData : projectPortfolioData).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs p-1.5 bg-[#FAF8F5] rounded border border-[#EAE3D6]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color || PALETTE[index % PALETTE.length] }}
                  />
                  <span className="font-semibold text-slate-700 text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 text-xs font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Operational Workspaces: Dual Tables Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Active Client Projects */}
        <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] flex flex-col justify-between shadow-xs">
          <div className="p-4 border-b border-[#EAE3D6] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban size={15} className="text-[#2563EB]" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Active Client Projects
                </h2>
                <span className="text-[11px] font-bold bg-[#F5EFE6] text-[#785E3E] px-2 py-0.5 rounded border border-[#EAE3D6]">
                  {metrics.activeProjectsCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Underway client deliverables, financial values, and engineering teams.
              </p>
            </div>
            <Link to="/dashboard-admin/projects" className="ent-btn-ghost text-xs shrink-0">
              All Projects &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Contract Value</th>
                  <th>Assignees</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && allProjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-2">
                      <TableSkeleton rows={4} />
                    </td>
                  </tr>
                ) : metrics.activeProjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-500 font-medium">
                      No active projects currently underway.
                    </td>
                  </tr>
                ) : (
                  metrics.activeProjects.slice(0, 6).map((p) => {
                    const upsales = (p.upsaleData || []).reduce((uSum, u) => uSum + (Number(u.amount) || 0), 0);
                    const totalVal = (Number(p.amount) || 0) + upsales;

                    return (
                      <tr
                        key={p._id}
                        className="cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
                        onClick={() => setSelectedProject(p)}
                      >
                        <td>
                          <div className="font-bold text-slate-900 hover:text-[#2563EB] transition-colors line-clamp-1">
                            {p.projectName}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {p.category || p.serviceType || "Project Suite"}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs text-slate-700 font-semibold">{p.clientName || "—"}</div>
                        </td>
                        <td>
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            ${totalVal.toLocaleString()}
                          </span>
                          {upsales > 0 && (
                            <span className="text-[9px] font-bold text-emerald-700 block">
                              +${upsales.toLocaleString()} upsale
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center -space-x-1.5">
                            {p.assignedDeveloper && p.assignedDeveloper.length > 0 ? (
                              p.assignedDeveloper.slice(0, 3).map((dev, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="w-6 h-6 rounded-full bg-[#1E40AF] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-xs"
                                  title={dev.username}
                                >
                                  {dev.username ? dev.username.charAt(0).toUpperCase() : "?"}
                                </div>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">Unassigned</span>
                            )}
                            {p.assignedDeveloper?.length > 3 && (
                              <span className="text-[9px] font-bold text-slate-500 pl-2">
                                +{p.assignedDeveloper.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge variant={(p.status || "Active").toLowerCase() === "active" ? "green" : "slate"}>
                            {p.status || "Active"}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(p);
                            }}
                            className="px-2 py-1 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] rounded font-bold text-[11px] transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Priority Inbound Leads */}
        <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] flex flex-col justify-between shadow-xs">
          <div className="p-4 border-b border-[#EAE3D6] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <UserCheck size={15} className="text-[#2563EB]" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Priority Inbound Leads
                </h2>
                <span className="text-[11px] font-bold bg-[#F5EFE6] text-[#785E3E] px-2 py-0.5 rounded border border-[#EAE3D6]">
                  {recentLeads.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                New prospects, lead qualifications, and assigned sales representatives.
              </p>
            </div>
            <Link to="/dashboard-admin/new-leads" className="ent-btn-ghost text-xs shrink-0">
              All Leads &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Lead Prospect</th>
                  <th>Category</th>
                  <th>Country</th>
                  <th>Lead Owner</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-2">
                      <TableSkeleton rows={4} />
                    </td>
                  </tr>
                ) : recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-500 font-medium">
                      No recent leads recorded in sales pipeline.
                    </td>
                  </tr>
                ) : (
                  recentLeads.slice(0, 6).map((l) => (
                    <tr
                      key={l._id}
                      className="cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
                      onClick={() => setSelectedLead(l)}
                    >
                      <td>
                        <div className="font-bold text-slate-900 hover:text-[#2563EB] transition-colors">
                          {l.leadName || "Unnamed Prospect"}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium font-mono">
                          {l.phoneNumber || l.email || "No direct contact"}
                        </span>
                      </td>
                      <td>
                        <Badge
                          variant={
                            l.leadType === "Hot Lead"
                              ? "red"
                              : l.leadType === "Warm Lead"
                              ? "amber"
                              : "blue"
                          }
                        >
                          {l.leadType || "Prospect"}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-xs text-slate-700 font-semibold">{l.country || "Global"}</span>
                      </td>
                      <td>
                        <div className="text-xs text-slate-800 font-semibold flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#EAE3D6] text-[10px] font-bold flex items-center justify-center text-slate-700">
                            {l.leadOwner ? l.leadOwner.charAt(0).toUpperCase() : "U"}
                          </div>
                          {l.leadOwner || "Unassigned"}
                        </div>
                      </td>
                      <td>
                        <Badge variant={(l.status || "").toLowerCase() === "closed" ? "green" : "slate"}>
                          {l.status || "Open"}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(l);
                          }}
                          className="px-2 py-1 bg-[#F5EFE6] text-[#785E3E] hover:bg-[#EAE3D6] rounded font-bold text-[11px] transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Project Inspection Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.projectName || "Project Specifications"}
        subtitle={`Client: ${selectedProject?.clientName || "Direct"} • Status: ${selectedProject?.status || "Active"}`}
        maxWidth="max-w-2xl"
        footer={
          <button
            type="button"
            onClick={() => setSelectedProject(null)}
            className="ent-btn-secondary"
          >
            Close Window
          </button>
        }
      >
        {selectedProject && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3 rounded border border-[#EAE3D6]">
              <div>
                <span className="ent-label text-[10px] mb-0.5">Contract Base Value</span>
                <span className="font-bold text-slate-900 text-xs font-mono">
                  ${selectedProject.amount?.toLocaleString() || "0"}
                </span>
              </div>
              <div>
                <span className="ent-label text-[10px] mb-0.5">Category</span>
                <span className="font-bold text-[#2563EB] text-xs">
                  {selectedProject.category || selectedProject.serviceType || "One-Time"}
                </span>
              </div>
              <div>
                <span className="ent-label text-[10px] mb-0.5">Client Email</span>
                <span className="text-slate-700 text-xs truncate block">{selectedProject.clientEmail || "—"}</span>
              </div>
              <div>
                <span className="ent-label text-[10px] mb-0.5">Client Contact</span>
                <span className="text-slate-700 text-xs font-mono">{selectedProject.clientNumber || "—"}</span>
              </div>
            </div>

            {/* Scope & Description */}
            <div>
              <label className="ent-label">Project Scope & Deliverable Details</label>
              <div className="p-3 bg-white border border-[#EAE3D6] rounded text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedProject.projectDetails || "No scope specification recorded."}
              </div>
            </div>

            {/* Upsale History */}
            {selectedProject.upsaleData && selectedProject.upsaleData.length > 0 && (
              <div>
                <label className="ent-label">Upsale Extensions & Add-ons</label>
                <div className="space-y-2">
                  {selectedProject.upsaleData.map((u, uIdx) => (
                    <div
                      key={uIdx}
                      className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded border border-[#EAE3D6] text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{u.serviceType || "Add-on Service"}</span>
                        <span className="text-[11px] text-slate-500 block">{u.details || u.comments}</span>
                      </div>
                      <span className="font-bold text-emerald-700 font-mono text-xs">
                        +${Number(u.amount)?.toLocaleString() || "0"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Developers */}
            <div>
              <label className="ent-label">Allocated Engineering Team</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedProject.assignedDeveloper?.length > 0 ? (
                  selectedProject.assignedDeveloper.map((dev, dIdx) => (
                    <span
                      key={dIdx}
                      className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] px-2.5 py-1 rounded text-xs font-semibold border border-[#BFDBFE]"
                    >
                      <div className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[9px] font-bold flex items-center justify-center">
                        {dev.username ? dev.username.charAt(0).toUpperCase() : "D"}
                      </div>
                      {dev.username}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No developers currently assigned</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Lead Inspection Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.leadName || "Lead Prospect Details"}
        subtitle={`Owner: ${selectedLead?.leadOwner || "Unassigned"} • Origin: ${selectedLead?.country || "Global"}`}
        maxWidth="max-w-xl"
        footer={
          <button
            type="button"
            onClick={() => setSelectedLead(null)}
            className="ent-btn-secondary"
          >
            Close Window
          </button>
        }
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-3 rounded border border-[#EAE3D6]">
              <div>
                <span className="ent-label text-[10px] mb-0.5">Phone Number</span>
                <span className="font-bold text-slate-900 text-xs font-mono flex items-center gap-1.5">
                  <Phone size={11} className="text-slate-400" /> {selectedLead.phoneNumber || "—"}
                </span>
              </div>
              <div>
                <span className="ent-label text-[10px] mb-0.5">Email Address</span>
                <span className="text-slate-700 text-xs truncate flex items-center gap-1.5">
                  <Mail size={11} className="text-slate-400" /> {selectedLead.email || "—"}
                </span>
              </div>
              <div>
                <span className="ent-label text-[10px] mb-0.5">Lead Type</span>
                <Badge
                  variant={
                    selectedLead.leadType === "Hot Lead"
                      ? "red"
                      : selectedLead.leadType === "Warm Lead"
                      ? "amber"
                      : "blue"
                  }
                >
                  {selectedLead.leadType || "Prospect"}
                </Badge>
              </div>
              <div>
                <span className="ent-label text-[10px] mb-0.5">Pipeline Status</span>
                <Badge variant={(selectedLead.status || "").toLowerCase() === "closed" ? "green" : "slate"}>
                  {selectedLead.status || "Open"}
                </Badge>
              </div>
            </div>

            {/* Comments / Interaction Notes */}
            {selectedLead.comments && selectedLead.comments.length > 0 && (
              <div>
                <label className="ent-label">Interaction Log & Notes</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedLead.comments.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-2.5 bg-white border border-[#EAE3D6] rounded text-xs text-slate-700 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-600">{c.author || "Sales Rep"}</span>
                        <span>{c.date ? new Date(c.date).toLocaleDateString() : ""}</span>
                      </div>
                      <p>{c.text || c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}