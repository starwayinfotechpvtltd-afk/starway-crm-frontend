import React, { useState, useEffect, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  User,
  Users,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  Flag,
  AlertCircle,
  X,
  Trash2,
  Edit,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sun,
  Coffee,
  Search,
  RotateCcw,
  CheckSquare,
  FolderKanban,
  Fingerprint,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const ALL_CHANNELS = [
  { id: "all", label: "All Channels", icon: Layers, color: "bg-slate-900 text-white", roles: ["admin", "hr", "manager", "team_lead", "developer", "caller"] },
  { id: "task", label: "Tasks & Deadlines", icon: CheckSquare, color: "bg-blue-600 text-white", roles: ["admin", "hr", "manager", "team_lead", "developer"] },
  { id: "project", label: "Projects & Milestones", icon: FolderKanban, color: "bg-indigo-600 text-white", roles: ["admin", "hr", "manager", "team_lead", "developer"] },
  { id: "lead", label: "Lead Callbacks", icon: Phone, color: "bg-amber-600 text-white", roles: ["admin", "hr", "manager", "team_lead", "caller"] },
  { id: "attendance", label: "Attendance Logs", icon: Fingerprint, color: "bg-emerald-600 text-white", roles: ["admin", "hr", "manager", "team_lead", "developer", "caller"] },
  { id: "shift", label: "Shift Schedules", icon: Clock, color: "bg-sky-600 text-white", roles: ["admin", "hr", "manager", "team_lead", "developer", "caller"] },
  { id: "leave", label: "Leaves & Time-off", icon: CalendarDays, color: "bg-purple-600 text-white", roles: ["admin", "hr", "manager", "team_lead", "developer", "caller"] },
  { id: "event", label: "Company Events", icon: CalendarIcon, color: "bg-rose-600 text-white", roles: ["admin", "hr", "manager", "team_lead", "developer", "caller"] },
];

const SYSTEM_ROLES = [
  { value: "developer", label: "Developer" },
  { value: "caller", label: "Caller" },
  { value: "team_lead", label: "Team Lead" },
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR" },
];

export default function GlobalEnterpriseCalendar({ mode = "admin" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  // Active Filters State
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Modal / Drawer States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    eventType: "event",
    targetRole: "all",
    targetDepartment: "all",
    priority: "medium",
  });
  const [submitting, setSubmitting] = useState(false);

  const calendarRef = useRef(null);
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = currentUser.role || localStorage.getItem("role") || mode;

  // Toggle flag to hide attendance channels globally
  const HIDE_ATTENDANCE = true;

  // Filter channels applicable to the current user's role
  const availableChannels = useMemo(() => {
    return ALL_CHANNELS.filter((ch) => {
      if (HIDE_ATTENDANCE && (ch.id === "attendance" || ch.id === "shift")) return false;
      return ch.roles.includes(userRole);
    });
  }, [userRole]);

  useEffect(() => {
    fetchEvents();
    if (["admin", "hr", "manager", "team_lead"].includes(userRole)) {
      fetchMetadata();
    }
  }, [selectedChannel, selectedUser, selectedRole, selectedDept, selectedPriority, searchQuery]);

  // Re-fetch calendar events on page focus / tab visibility change or attendance update
  useEffect(() => {
    const handleRefresh = () => {
      if (document.visibilityState === 'visible') {
        fetchEvents();
      }
    };
    const handleAttendance = () => fetchEvents();

    document.addEventListener('visibilitychange', handleRefresh);
    window.addEventListener('attendance-updated', handleAttendance);
    return () => {
      document.removeEventListener('visibilitychange', handleRefresh);
      window.removeEventListener('attendance-updated', handleAttendance);
    };
  }, [selectedChannel, selectedUser, selectedRole, selectedDept, selectedPriority, searchQuery]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          channel: selectedChannel,
          filterUserId: selectedUser,
          role: selectedRole,
          department: selectedDept,
          priority: selectedPriority,
          search: searchQuery,
        },
      });
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [usersRes, deptRes] = await Promise.all([
        axios.get(`${API_BASE}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUsersList((usersRes.data || []).filter((u) => u.role !== "admin"));
      setDepartmentsList(deptRes.data || []);
    } catch (err) {
      console.error("Failed to fetch metadata:", err);
    }
  };

  const handleResetFilters = () => {
    setSelectedChannel("all");
    setSearchQuery("");
    setSelectedUser("all");
    setSelectedRole("all");
    setSelectedDept("all");
    setSelectedPriority("all");
  };

  const isFilterActive =
    selectedChannel !== "all" ||
    searchQuery ||
    selectedUser !== "all" ||
    selectedRole !== "all" ||
    selectedDept !== "all" ||
    selectedPriority !== "all";

  const handleDateClick = (arg) => {
    if (["admin", "hr", "manager", "team_lead"].includes(userRole)) {
      setNewEvent({
        ...newEvent,
        start: `${arg.dateStr}T09:00`,
        end: `${arg.dateStr}T10:00`,
      });
      setIsAddModalOpen(true);
    }
  };

  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event;
    const rawProps = ev.extendedProps || {};
    setSelectedEvent({
      id: ev.id,
      title: ev.title,
      start: ev.start,
      end: ev.end,
      color: ev.backgroundColor,
      ...rawProps,
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/events`, newEvent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAddModalOpen(false);
      setNewEvent({
        title: "",
        description: "",
        start: "",
        end: "",
        eventType: "event",
        targetRole: "all",
        targetDepartment: "all",
        priority: "medium",
      });
      fetchEvents();
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const cleanId = id.replace("event_", "");
      await axios.delete(`${API_BASE}/api/events/${cleanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  // Format FullCalendar Event items
  const formattedCalendarEvents = useMemo(() => {
    return events.map((ev) => ({
      id: ev.id || ev._id,
      title: ev.title,
      start: ev.start,
      end: ev.end || ev.start,
      backgroundColor: ev.color || "#2563EB",
      borderColor: ev.color || "#2563EB",
      textColor: "#FFFFFF",
      extendedProps: { ...ev },
    }));
  }, [events]);

  // Statistics Summary
  const stats = useMemo(() => {
    const tasksCount = events.filter((e) => e.eventType === "task").length;
    const projectsCount = events.filter((e) => e.eventType === "project").length;
    const callbacksCount = events.filter((e) => e.eventType === "lead_callback").length;
    const attendanceCount = events.filter((e) => e.eventType === "attendance").length;
    const shiftsCount = events.filter((e) => e.eventType === "shift").length;
    const leavesCount = events.filter((e) => e.eventType === "leave").length;
    const companyEventsCount = events.filter(
      (e) => e.eventType === "event" || e.eventType === "meeting" || e.eventType === "milestone"
    ).length;
    return { tasksCount, projectsCount, callbacksCount, attendanceCount, shiftsCount, leavesCount, companyEventsCount };
  }, [events]);

  // Crisp Custom Event Card for FullCalendar
  const renderEventContent = (eventInfo) => {
    const raw = eventInfo.event.extendedProps || {};
    const type = raw.eventType || "event";
    const priority = raw.priority;

    let bgClass = "bg-blue-50 text-blue-900 border-l-3 border-l-blue-600";
    let typeLabel = "Event";

    if (type === "task") {
      bgClass =
        priority === "Critical"
          ? "bg-rose-50 text-rose-900 border-l-3 border-l-rose-600"
          : priority === "High"
          ? "bg-amber-50 text-amber-900 border-l-3 border-l-amber-600"
          : "bg-blue-50 text-blue-900 border-l-3 border-l-blue-600";
      typeLabel = priority ? `${priority} Task` : "Task";
    } else if (type === "project") {
      bgClass = "bg-indigo-50 text-indigo-900 border-l-3 border-l-indigo-600";
      typeLabel = "Project";
    } else if (type === "lead_callback") {
      bgClass = "bg-amber-50 text-amber-900 border-l-3 border-l-amber-600";
      typeLabel = "Lead";
    } else if (type === "attendance") {
      bgClass = "bg-emerald-50 text-emerald-900 border-l-3 border-l-emerald-600";
      typeLabel = "Attend";
    } else if (type === "shift") {
      bgClass = "bg-sky-50 text-sky-900 border-l-3 border-l-sky-600";
      typeLabel = "Shift";
    } else if (type === "leave") {
      bgClass = "bg-purple-50 text-purple-900 border-l-3 border-l-purple-600";
      typeLabel = "Leave";
    } else if (type === "meeting" || type === "milestone") {
      bgClass = "bg-rose-50 text-rose-900 border-l-3 border-l-rose-600";
      typeLabel = type === "meeting" ? "Meeting" : "Milestone";
    }

    return (
      <div
        className={`w-full px-1.5 py-0.5 rounded-xs flex items-center justify-between gap-1 ${bgClass} shadow-2xs hover:brightness-95 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-black/5 shrink-0">
            {typeLabel}
          </span>
          <span className="text-[11px] font-bold truncate">
            {eventInfo.event.title.replace(/^\[.*?\]\s*/, "")}
          </span>
        </div>
        {eventInfo.timeText && (
          <span className="text-[9px] font-semibold opacity-75 shrink-0 hidden sm:inline">
            {eventInfo.timeText}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* ── Top Header Actions ────────────────────────────────────────────────── */}
      {["admin", "hr", "manager", "team_lead"].includes(userRole) && (
        <div className="flex items-center justify-end pb-1">
          <button onClick={() => setIsAddModalOpen(true)} className="ent-btn-primary text-xs">
            <Plus size={13} /> Schedule Event / Milestone
          </button>
        </div>
      )}

      {/* ── Role-Specific KPI Counter Strip ──────────────────────────────────── */}
      {userRole === "developer" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div
            onClick={() => setSelectedChannel("task")}
            className={`ent-card p-2.5 border-l-4 border-l-blue-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "task" ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">My Tasks Due</span>
            <span className="text-base font-bold text-slate-900">{stats.tasksCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("project")}
            className={`ent-card p-2.5 border-l-4 border-l-indigo-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "project" ? "ring-2 ring-indigo-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Projects</span>
            <span className="text-base font-bold text-slate-900">{stats.projectsCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("attendance")}
            className={`ent-card p-2.5 border-l-4 border-l-emerald-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "attendance" ? "ring-2 ring-emerald-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">My Attendance Logs</span>
            <span className="text-base font-bold text-slate-900">{stats.attendanceCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("shift")}
            className={`ent-card p-2.5 border-l-4 border-l-sky-500 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "shift" ? "ring-2 ring-sky-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">My Shifts Rota</span>
            <span className="text-base font-bold text-slate-900">{stats.shiftsCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("leave")}
            className={`ent-card p-2.5 border-l-4 border-l-purple-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "leave" ? "ring-2 ring-purple-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">My Leaves</span>
            <span className="text-base font-bold text-slate-900">{stats.leavesCount}</span>
          </div>
        </div>
      ) : userRole === "caller" ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div
            onClick={() => setSelectedChannel("lead")}
            className={`ent-card p-2.5 border-l-4 border-l-amber-500 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "lead" ? "ring-2 ring-amber-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">My Callbacks</span>
            <span className="text-base font-bold text-slate-900">{stats.callbacksCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("attendance")}
            className={`ent-card p-2.5 border-l-4 border-l-emerald-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "attendance" ? "ring-2 ring-emerald-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">My Attendance Logs</span>
            <span className="text-base font-bold text-slate-900">{stats.attendanceCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("shift")}
            className={`ent-card p-2.5 border-l-4 border-l-sky-500 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "shift" ? "ring-2 ring-sky-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">My Shifts Rota</span>
            <span className="text-base font-bold text-slate-900">{stats.shiftsCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("leave")}
            className={`ent-card p-2.5 border-l-4 border-l-purple-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "leave" ? "ring-2 ring-purple-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">My Leaves</span>
            <span className="text-base font-bold text-slate-900">{stats.leavesCount}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div
            onClick={() => setSelectedChannel("task")}
            className={`ent-card p-2.5 border-l-4 border-l-blue-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "task" ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tasks Due</span>
            <span className="text-base font-bold text-slate-900">{stats.tasksCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("project")}
            className={`ent-card p-2.5 border-l-4 border-l-indigo-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "project" ? "ring-2 ring-indigo-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Projects</span>
            <span className="text-base font-bold text-slate-900">{stats.projectsCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("lead")}
            className={`ent-card p-2.5 border-l-4 border-l-amber-500 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "lead" ? "ring-2 ring-amber-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Lead Callbacks</span>
            <span className="text-base font-bold text-slate-900">{stats.callbacksCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("attendance")}
            className={`ent-card p-2.5 border-l-4 border-l-emerald-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "attendance" ? "ring-2 ring-emerald-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Logs</span>
            <span className="text-base font-bold text-slate-900">{stats.attendanceCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("shift")}
            className={`ent-card p-2.5 border-l-4 border-l-sky-500 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "shift" ? "ring-2 ring-sky-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Shifts Rota</span>
            <span className="text-base font-bold text-slate-900">{stats.shiftsCount}</span>
          </div>

          <div
            onClick={() => setSelectedChannel("leave")}
            className={`ent-card p-2.5 border-l-4 border-l-purple-600 bg-white cursor-pointer hover:shadow-xs transition-all ${
              selectedChannel === "leave" ? "ring-2 ring-purple-500" : ""
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Leaves</span>
            <span className="text-base font-bold text-slate-900">{stats.leavesCount}</span>
          </div>
        </div>
      )}

      {/* ── Channel Selector Strip (Quick Filter Channel) ────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {availableChannels.map((ch) => {
          const Icon = ch.icon;
          const isSelected = selectedChannel === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`px-2.5 py-1.5 rounded text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all shrink-0 ${
                isSelected
                  ? `${ch.color} shadow-xs`
                  : "bg-white text-slate-600 border border-[#EAE3D6] hover:bg-slate-50"
              }`}
            >
              <Icon size={13} />
              <span>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Advanced Pinpoint Filter Toolbar ─────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#EAE3D6] p-3 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {/* 1. Pinpoint Live Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, employee, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* 2. Pinpoint Employee Dropdown Filter (Admin/HR/Manager/TL) */}
          {["admin", "hr", "manager", "team_lead"].includes(userRole) && (
            <div>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="all">👤 All Staff Members ({usersList.length})</option>
                {usersList.map((u) => {
                  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
                  return (
                    <option key={u._id} value={u._id}>
                      {name} ({u.role})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* 3. Role Filter (Admin/HR/Manager) */}
          {["admin", "hr", "manager"].includes(userRole) && (
            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="all">🏢 All Roles</option>
                {SYSTEM_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 4. Department Filter (Admin/HR/Manager) */}
          {["admin", "hr", "manager"].includes(userRole) && (
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="all">🏛️ All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d._id || d.name} value={d.name}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 5. Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">🚩 All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900">{events.length}</strong> active entries
            </span>
            <span>•</span>
            <span className="capitalize">Channel: <strong className="text-blue-700">{selectedChannel}</strong></span>
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

      {/* ── Main FullCalendar Canvas ───────────────────────────────────────── */}
      <div className="ent-card p-4 bg-white relative overflow-hidden shadow-xs">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Syncing Schedule...
            </div>
          </div>
        )}

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={formattedCalendarEvents}
          eventContent={renderEventContent}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          editable={false}
          dayMaxEvents={4}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
        />
      </div>

      {/* ── Event Detail Inspection Modal ─────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Schedule Item"}
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {selectedEvent?.canDelete && (
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="ent-btn-danger text-xs flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete Event
                </button>
              )}
            </div>
            <button type="button" onClick={() => setSelectedEvent(null)} className="ent-btn-secondary">
              Close
            </button>
          </div>
        }
      >
        {selectedEvent && (
          <div className="space-y-3.5 text-xs text-slate-700">
            {/* Header info */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Channel / Type</span>
                <span className="font-bold text-slate-900 uppercase text-xs">
                  {selectedEvent.eventType || "Event"}
                </span>
              </div>

              {selectedEvent.priority && (
                <Badge
                  variant={
                    selectedEvent.priority === "Critical"
                      ? "red"
                      : selectedEvent.priority === "High"
                      ? "amber"
                      : "blue"
                  }
                >
                  {selectedEvent.priority}
                </Badge>
              )}

              {selectedEvent.status && (
                <Badge variant={selectedEvent.status === "completed" || selectedEvent.status === "approved" ? "green" : "neutral"}>
                  {selectedEvent.status.toUpperCase()}
                </Badge>
              )}
            </div>

            {/* Time Window */}
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-blue-50/40 border border-blue-100 rounded">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Start</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedEvent.start ? new Date(selectedEvent.start).toLocaleString() : "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase block">End / Deadline</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedEvent.end ? new Date(selectedEvent.end).toLocaleString() : "—"}
                </span>
              </div>
            </div>

            {/* Attendance Specific Metrics */}
            {selectedEvent.eventType === "attendance" && (
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-950 font-medium">
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-800 block">Work Time</span>
                  <span className="font-bold text-xs">
                    {Math.floor((selectedEvent.totalWorkMinutes || 0) / 60)}h {(selectedEvent.totalWorkMinutes || 0) % 60}m
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-800 block">Break Time</span>
                  <span className="font-bold text-xs">{selectedEvent.totalBreakMinutes || 0}m</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-800 block">Compliance</span>
                  <span className="font-bold text-xs capitalize">{selectedEvent.complianceStatus || "On Time"}</span>
                </div>
              </div>
            )}

            {/* Shift Specific Details */}
            {selectedEvent.eventType === "shift" && (
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded text-sky-950">
                <div className="font-bold">Shift Name: {selectedEvent.shiftName}</div>
                <div className="text-[11px] text-sky-800">Timing: {selectedEvent.shiftTimes}</div>
                <div className="text-[11px] text-sky-800">Allowed Break: {selectedEvent.allowedBreakMinutes || 60} minutes</div>
              </div>
            )}

            {/* Lead Specific Details */}
            {selectedEvent.eventType === "lead_callback" && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-950 space-y-1">
                <div className="font-bold">Lead Contact: {selectedEvent.leadName} ({selectedEvent.phoneNumber || "No phone"})</div>
                <div className="text-[11px] text-amber-800">Lead Owner: {selectedEvent.leadOwner || "—"}</div>
                {selectedEvent.pitchedAmount > 0 && (
                  <div className="text-[11px] font-bold text-amber-900">
                    Pitched Deal Value: {selectedEvent.currencySymbol || "$"}{selectedEvent.pitchedAmount}
                  </div>
                )}
              </div>
            )}

            {/* Project Specific Details */}
            {selectedEvent.eventType === "project" && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-950 space-y-1">
                <div className="font-bold">Client: {selectedEvent.clientName} ({selectedEvent.clientNumber || selectedEvent.clientEmail || ""})</div>
                {selectedEvent.amount && (
                  <div className="text-[11px] font-bold text-indigo-900">Contract Value: ₹{Number(selectedEvent.amount).toLocaleString()}</div>
                )}
              </div>
            )}

            {/* Task Specific Details */}
            {selectedEvent.eventType === "task" && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-950 space-y-1">
                <div className="font-bold">Project: {selectedEvent.projectName}</div>
                {selectedEvent.assignedTo && (
                  <div className="text-[11px] text-blue-800">
                    Assignee: {selectedEvent.assignedTo.username || selectedEvent.assignedTo.name || "Assigned Dev"}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {selectedEvent.description && (
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Details / Notes</span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Schedule New Event Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Enterprise Event / Milestone"
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="ent-btn-secondary">
              Cancel
            </button>
            <button type="submit" form="add-event-form" disabled={submitting} className="ent-btn-primary">
              {submitting ? "Scheduling..." : "Create Event"}
            </button>
          </div>
        }
      >
        <form id="add-event-form" onSubmit={handleCreateEvent} className="space-y-3 text-xs">
          <div>
            <label className="ent-label">Event Title *</label>
            <input
              type="text"
              required
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="e.g. Sprint Review, Client Demo, Team Outing"
              className="ent-input text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="ent-label">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={newEvent.start}
                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                className="ent-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="ent-label">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={newEvent.end}
                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                className="ent-input text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="ent-label">Event Category</label>
              <select
                value={newEvent.eventType}
                onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                className="ent-select text-xs font-semibold"
              >
                <option value="event">🏢 General Event</option>
                <option value="meeting">🤝 Meeting / Sync</option>
                <option value="milestone">🎯 Key Milestone</option>
              </select>
            </div>

            <div>
              <label className="ent-label">Priority</label>
              <select
                value={newEvent.priority}
                onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value })}
                className="ent-select text-xs font-semibold"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="ent-label">Description / Agenda</label>
            <textarea
              rows={3}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Meeting link, location, discussion points..."
              className="ent-input text-xs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
