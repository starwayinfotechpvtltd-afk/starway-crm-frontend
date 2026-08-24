import React, { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import axios from "axios";
import {
  differenceInCalendarDays,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isBefore,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderDot,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Eye,
  Trash2,
  Edit3,
  MessageSquare,
  ExternalLink,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Send,
  Shield,
  Search,
  KanbanSquare,
  Check,
  Globe,
  Sparkles,
  Layers,
  Flame,
  ArrowUpRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useTasks } from "../TaskContext";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const ProjectKanban = React.lazy(() => import("../Admin Pages/Components/Projectkanban"));
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const PRIORITY_ORDER = { Critical: 1, High: 2, Medium: 3, Low: 4 };
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "x-timezone-offset": new Date().getTimezoneOffset().toString(),
});

// ── Urgency Helper ────────────────────────────────────────────────────────────
const getUrgency = (deadline) => {
  if (!deadline) return null;
  const diff = differenceInCalendarDays(new Date(deadline), new Date());
  if (diff < 0) return "overdue";
  if (diff <= 1) return "critical";
  if (diff <= 3) return "high";
  if (diff <= 6) return "medium";
  return "normal";
};

export default function OneTime() {
  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "Developer";

  const {
    projects,
    pendingTasks,
    completions,
    loading: loadingInitial,
    completeTask,
    addTaskToState,
    refreshData,
  } = useTasks();

  const [activeTab, setActiveTab] = useState("projects"); // "projects" | "tasks" | "scheduled" | "history"
  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("Active");

  // Kanban Modal
  const [kanbanProject, setKanbanProject] = useState(null);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const [openingKanbanId, setOpeningKanbanId] = useState(null);

  // Quick Add Task Modal
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddInitialProject, setQuickAddInitialProject] = useState("");

  // Comment Modal
  const [commentTask, setCommentTask] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Scheduled Tasks State
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [editScheduledTask, setEditScheduledTask] = useState(null);

  // Toast
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  const showToast = (msg, sev = "success") => {
    setToast({ open: true, msg, sev });
    setTimeout(() => setToast((p) => ({ ...p, open: false })), 3500);
  };

  const fetchUpcomingScheduledTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/scheduled-tasks/upcoming`, { headers: authHeaders() });
      setScheduledTasks(res.data || []);
    } catch (err) {
      console.error("Error fetching scheduled tasks:", err);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingScheduledTasks();
  }, [fetchUpcomingScheduledTasks]);

  const handleTaskComplete = async (taskId, projectId) => {
    await completeTask(taskId, projectId);
    showToast("Task marked as done! 🎉");
  };

  const handleOpenKanban = useCallback(
    (pId) => {
      setOpeningKanbanId(pId);
      const target = projects.find((p) => p._id === pId);
      setTimeout(() => {
        if (target) {
          setKanbanProject(target);
          setKanbanOpen(true);
        }
        setOpeningKanbanId(null);
      }, 300);
    },
    [projects]
  );

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !commentTask) return;
    setPostingComment(true);
    try {
      await axios.post(
        `${API_BASE}/api/tasks/${commentTask.projectId}/${commentTask._id}/comments`,
        { text: commentText.trim() },
        { headers: authHeaders() }
      );
      showToast("Comment posted!");
      setCommentTask(null);
      setCommentText("");
      refreshData(true);
    } catch (err) {
      showToast("Failed to post comment", "error");
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteScheduledTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this scheduled task?")) return;
    try {
      await axios.delete(`${API_BASE}/api/scheduled-tasks/${taskId}`, { headers: authHeaders() });
      showToast("Scheduled task deleted");
      fetchUpcomingScheduledTasks();
    } catch (err) {
      showToast("Failed to delete scheduled task", "error");
    }
  };

  // Filtered lists
  const filteredProjects = useMemo(() => {
    const s = search.toLowerCase();
    return projects
      .filter((p) => {
        const matchQuery =
          !search ||
          p.projectName?.toLowerCase().includes(s) ||
          p.clientName?.toLowerCase().includes(s) ||
          p.businessNiche?.toLowerCase().includes(s);
        const matchService = !filterService || (p.serviceType || []).includes(filterService);
        const matchStatus = !filterStatus || p.status === filterStatus;
        return matchQuery && matchService && matchStatus;
      })
      .sort((a, b) => (a.projectName || "").localeCompare(b.projectName || ""));
  }, [projects, search, filterService, filterStatus]);

  const allPendingTasks = useMemo(() => {
    return [...pendingTasks].sort((a, b) => {
      const orderA = PRIORITY_ORDER[a.priority] || 99;
      const orderB = PRIORITY_ORDER[b.priority] || 99;
      if (orderA !== orderB) return orderA - orderB;
      const aD = a.deadline ? differenceInCalendarDays(new Date(a.deadline), new Date()) : 999;
      const bD = b.deadline ? differenceInCalendarDays(new Date(b.deadline), new Date()) : 999;
      return aD - bD;
    });
  }, [pendingTasks]);

  const overdueCount = allPendingTasks.filter((t) => getUrgency(t.deadline) === "overdue").length;
  const urgentCount = allPendingTasks.filter((t) => ["critical", "high"].includes(getUrgency(t.deadline))).length;
  const serviceOptions = useMemo(() => [...new Set(projects.flatMap((p) => p.serviceType || []))], [projects]);

  const groupedCompletedTasks = useMemo(() => {
    const groups = { Today: [], Yesterday: [], "This Week": [], Older: [] };
    completions.forEach((c) => {
      if (!c.completedAt) {
        groups.Older.push(c);
        return;
      }
      const diff = differenceInCalendarDays(new Date(), new Date(c.completedAt));
      if (diff === 0) groups.Today.push(c);
      else if (diff === 1) groups.Yesterday.push(c);
      else if (diff <= 7) groups["This Week"].push(c);
      else groups.Older.push(c);
    });
    return groups;
  }, [completions]);

  return (
    <div className="space-y-3.5 w-full">
      {/* ── Top Header Actions ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => refreshData(false)}
          className="ent-btn-secondary text-xs flex items-center gap-1.5"
          title="Refresh workspace"
        >
          <RefreshCw size={13} /> Refresh
        </button>
        <button
          type="button"
          onClick={() => {
            setQuickAddInitialProject("");
            setQuickAddModalOpen(true);
          }}
          className="ent-btn-primary text-xs"
        >
          <Plus size={13} /> New Task
        </button>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Projects</span>
            <div className="text-2xl font-black text-[#1E40AF] mt-1 font-mono">
              {projects.filter((p) => p.status !== "Closed").length}
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center">
            <FolderDot size={20} />
          </div>
        </div>

        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {allPendingTasks.length}
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-[#FAF8F5] border border-[#EAE3D6] text-slate-700 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urgent & Overdue</span>
            <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
              {overdueCount + urgentCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Tasks</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              {completions.length}
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
            activeTab === "projects" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          <FolderDot size={13} /> Active Projects ({filteredProjects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
            activeTab === "tasks" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          <Clock size={13} /> My Task Queue ({allPendingTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("scheduled")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
            activeTab === "scheduled" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          <Calendar size={13} /> Scheduled Deliverables ({scheduledTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
            activeTab === "history" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          <CheckCircle2 size={13} /> Work History ({completions.length})
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 1: PROJECTS GRID & DETAILS
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="ent-card p-3 bg-white border-[#EAE3D6] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects by name, client, or niche..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ent-input text-xs pl-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {serviceOptions.length > 0 && (
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="ent-select text-xs font-semibold"
                >
                  <option value="">All Services</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="ent-select text-xs font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>

              {(search || filterService || filterStatus !== "Active") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilterService("");
                    setFilterStatus("Active");
                  }}
                  className="ent-btn-secondary text-xs py-1 px-2 text-rose-600"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Projects Grid */}
          {loadingInitial ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="ent-card p-5 bg-white border-[#EAE3D6] shadow-xs animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-8 bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="ent-card p-12 bg-white border-[#EAE3D6] shadow-xs text-center space-y-2">
              <FolderDot size={32} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No Projects Found</h3>
              <p className="text-xs text-slate-500">
                {search ? "No projects match your search query." : "You do not have any assigned projects in this view."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((p) => {
                const isClosed = p.status === "Closed";
                const isKanbanLoading = openingKanbanId === p._id;
                const projTasks = allPendingTasks.filter((t) => String(t.projectId) === String(p._id));

                return (
                  <div
                    key={p._id}
                    className={`ent-card p-5 bg-white border-[#EAE3D6] shadow-xs hover:border-[#1E40AF]/40 transition-all flex flex-col justify-between space-y-4 ${
                      isClosed ? "opacity-75 bg-slate-50/50" : ""
                    }`}
                  >
                    <div>
                      {/* Card Top: Title & Status */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                            {p.subscriptionType || "One-Time Deliverable"}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {p.projectName}
                          </h3>
                        </div>
                        <Badge variant={isClosed ? "neutral" : "green"}>
                          {p.status || "ACTIVE"}
                        </Badge>
                      </div>

                      {/* Business Niche & Client */}
                      {p.businessNiche && (
                        <p className="text-xs text-slate-600 mb-2">
                          <span className="font-semibold text-slate-400 text-[10px] uppercase">Niche:</span>{" "}
                          {p.businessNiche}
                        </p>
                      )}

                      {/* Service Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(p.serviceType || []).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Reference Site Link */}
                      {p.referenceSite && (
                        <a
                          href={p.referenceSite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#1E40AF] hover:underline inline-flex items-center gap-1 font-semibold mb-3 truncate max-w-full"
                        >
                          <Globe size={12} /> {p.referenceSite.replace(/^https?:\/\//, "")}
                        </a>
                      )}

                      {/* Details / Briefing snippet */}
                      {p.projectDetails && (
                        <p className="text-xs text-slate-500 line-clamp-2 bg-[#FAF8F5] p-2.5 rounded border border-[#EAE3D6]">
                          {p.projectDetails}
                        </p>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> {projTasks.length} Pending Task{projTasks.length !== 1 ? "s" : ""}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickAddInitialProject(p._id);
                            setQuickAddModalOpen(true);
                          }}
                          className="ent-btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                        >
                          <Plus size={12} /> Task
                        </button>
                        <button
                          type="button"
                          disabled={isKanbanLoading}
                          onClick={() => handleOpenKanban(p._id)}
                          className="ent-btn-primary text-xs py-1 px-3 inline-flex items-center gap-1"
                        >
                          <KanbanSquare size={12} /> {isKanbanLoading ? "Loading..." : "Kanban Board ↗"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 2: MY TASK QUEUE (ACTIONABLE)
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] shadow-xs">
            <div className="ent-card-header flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                My Active Deliverables & Sprint Items ({allPendingTasks.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="ent-table">
                <thead>
                  <tr>
                    <th>Task Description</th>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allPendingTasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">
                        All caught up! You have no pending sprint tasks assigned to your queue.
                      </td>
                    </tr>
                  ) : (
                    allPendingTasks.map((t) => {
                      const urgency = getUrgency(t.deadline);
                      return (
                        <tr key={t._id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td>
                            <div className="font-bold text-slate-900 text-xs">{t.title}</div>
                            {t.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 max-w-md">
                                {t.description}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="font-semibold text-xs text-[#1E40AF]">
                              {t.projectName || "Starway Project"}
                            </span>
                          </td>
                          <td>
                            <Badge
                              variant={
                                t.priority === "Critical"
                                  ? "red"
                                  : t.priority === "High"
                                  ? "amber"
                                  : t.priority === "Medium"
                                  ? "blue"
                                  : "green"
                              }
                            >
                              {t.priority || "NORMAL"}
                            </Badge>
                          </td>
                          <td>
                            {t.deadline ? (
                              <div
                                className={`text-xs font-semibold flex items-center gap-1 ${
                                  urgency === "overdue"
                                    ? "text-rose-600 font-bold"
                                    : urgency === "critical"
                                    ? "text-amber-700 font-bold"
                                    : "text-slate-700"
                                }`}
                              >
                                <Calendar size={12} />
                                {format(new Date(t.deadline), "MMM d, yyyy")}
                                {urgency === "overdue" && " (Overdue)"}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                              {t.status || "In Progress"}
                            </span>
                          </td>
                          <td className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleTaskComplete(t._id, t.projectId)}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1"
                              >
                                <Check size={12} /> Mark Done
                              </button>
                              <button
                                type="button"
                                onClick={() => setCommentTask(t)}
                                className="ent-btn-secondary text-xs py-1 px-2 inline-flex items-center gap-1"
                              >
                                <MessageSquare size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenKanban(t.projectId)}
                                className="ent-btn-secondary text-xs py-1 px-2 text-[#1E40AF] inline-flex items-center gap-1"
                                title="Open Project Board"
                              >
                                <KanbanSquare size={12} />
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
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 3: SCHEDULED TASKS
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "scheduled" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Automated Recurring & Scheduled Deliverables</h2>
            <button
              type="button"
              onClick={() => {
                setQuickAddInitialProject("");
                setQuickAddModalOpen(true);
              }}
              className="ent-btn-primary text-xs"
            >
              <Plus size={13} /> Schedule New Task
            </button>
          </div>

          {scheduledTasks.length === 0 ? (
            <div className="ent-card p-12 bg-white border-[#EAE3D6] shadow-xs text-center space-y-2">
              <Calendar size={32} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No Scheduled Deliverables</h3>
              <p className="text-xs text-slate-500">
                You do not have any upcoming automated recurring tasks scheduled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledTasks.map((task) => (
                <div key={task._id} className="ent-card p-5 bg-white border-[#EAE3D6] shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider block">
                      {task.projectName || "Starway Project"}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    )}

                    <div className="mt-3 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Scheduled Dates:</span>
                      <div className="flex flex-wrap gap-1">
                        {(task.scheduledDates || []).map((d, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF] text-[10px] font-semibold rounded border border-[#BFDBFE] inline-flex items-center gap-1"
                          >
                            <Calendar size={10} /> {format(new Date(d), "MMM d, yyyy")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Deadline: +{task.deadlineOffset || 0}d
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditScheduledTask(task)}
                        className="ent-btn-secondary text-xs py-1 px-2 text-[#1E40AF]"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduledTask(task._id)}
                        className="ent-btn-secondary text-xs py-1 px-2 text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 4: DELIVERY HISTORY & COMPLETED LOG
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {completions.length === 0 ? (
            <div className="ent-card p-12 bg-white border-[#EAE3D6] shadow-xs text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-800">No Completed Deliverables Yet</h3>
              <p className="text-xs text-slate-500">
                Completed tasks will be recorded here with delivery timestamps.
              </p>
            </div>
          ) : (
            Object.entries(groupedCompletedTasks).map(([groupName, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={groupName} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>{groupName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-mono text-slate-700">
                      {items.length}
                    </span>
                  </div>

                  <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] shadow-xs divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                            ✓
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{item.taskTitle}</span>
                            <span className="text-[11px] font-semibold text-[#1E40AF]">
                              {item.projectName}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Completed by {item.completedBy?.username || currentUsername}
                          </span>
                          {item.completedAt && (
                            <span className="text-[11px] font-bold text-slate-600 font-mono">
                              {format(new Date(item.completedAt), "MMM d, yyyy · h:mm a")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Add Task Modal ──────────────────────────────────────────────────── */}
      {quickAddModalOpen && (
        <GlobalAddTaskModal
          projects={projects}
          initialProjectId={quickAddInitialProject}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
          onClose={() => setQuickAddModalOpen(false)}
          onSuccess={(newTask, pId, isSch) => {
            if (isSch) {
              showToast("Scheduled task created successfully!");
              fetchUpcomingScheduledTasks();
            } else {
              addTaskToState(newTask, pId);
              showToast("Task created in workspace!");
            }
          }}
        />
      )}

      {/* ── Comment Modal ───────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(commentTask)}
        onClose={() => setCommentTask(null)}
        title={`Add Comment — ${commentTask?.title || ""}`}
        maxWidth="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => setCommentTask(null)} className="ent-btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              form="post-comment-form"
              disabled={postingComment || !commentText.trim()}
              className="ent-btn-primary"
            >
              {postingComment ? "Posting..." : "Post Comment"}
            </button>
          </>
        }
      >
        <form id="post-comment-form" onSubmit={handlePostComment} className="space-y-3 text-xs">
          <div>
            <label className="ent-label">Comment Message *</label>
            <textarea
              rows={4}
              required
              placeholder="Write your update, blocker note, or feedback..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="ent-input text-xs resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* ── Edit Scheduled Task Modal ───────────────────────────────────────── */}
      {editScheduledTask && (
        <EditScheduledTaskModal
          task={editScheduledTask}
          onClose={() => setEditScheduledTask(null)}
          onSuccess={() => {
            showToast("Scheduled task updated successfully!");
            fetchUpcomingScheduledTasks();
          }}
        />
      )}

      {/* ── Kanban Board Overlay ────────────────────────────────────────────── */}
      {kanbanProject && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-xl p-6 shadow-xl text-xs font-bold text-slate-800">
                Loading Board...
              </div>
            </div>
          }
        >
          <ProjectKanban
            open={kanbanOpen}
            onClose={() => {
              setKanbanOpen(false);
              setKanbanProject(null);
              refreshData(true);
            }}
            project={kanbanProject}
          />
        </Suspense>
      )}

      {/* Toast */}
      {toast.open && (
        <div
          className={`fixed bottom-6 right-6 z-[99999] p-3.5 rounded-lg border text-xs font-bold shadow-lg flex items-center gap-2 ${
            toast.sev === "error"
              ? "bg-rose-50 text-rose-900 border-rose-200"
              : "bg-emerald-50 text-emerald-900 border-emerald-200"
          }`}
        >
          {toast.sev === "error" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// ── Global Add Task Modal Component ───────────────────────────────────────────
function GlobalAddTaskModal({ projects, initialProjectId, currentUserId, currentUsername, onClose, onSuccess }) {
  // Alphabetically sorted active projects
  const activeProjects = useMemo(() => {
    return [...projects]
      .filter((p) => p.status !== "Closed")
      .sort((a, b) =>
        (a.projectName || "").localeCompare(b.projectName || "", undefined, { sensitivity: "base" })
      );
  }, [projects]);

  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const saved = localStorage.getItem("last_selected_project_id");
    return initialProjectId || saved || "";
  });

  // Pre-select remembered project when activeProjects load
  useEffect(() => {
    if (activeProjects.length > 0) {
      const saved = localStorage.getItem("last_selected_project_id");
      const exists = activeProjects.some((p) => p._id === (initialProjectId || saved));
      if (!selectedProjectId || !activeProjects.some((p) => p._id === selectedProjectId)) {
        const fallback = exists ? (initialProjectId || saved) : activeProjects[0]._id;
        setSelectedProjectId(fallback);
      }
    }
  }, [activeProjects, initialProjectId]);

  // Multiple task items for regular (non-scheduled) tasks
  const [taskItems, setTaskItems] = useState([
    { id: "task-1", title: "", description: "", priority: "Medium", deadline: "" },
  ]);

  // Scheduled task fields
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDates, setScheduledDates] = useState([]);
  const [deadlineOffset, setDeadlineOffset] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const addTaskRow = () => {
    setTaskItems((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: "",
        description: "",
        priority: "Medium",
        deadline: "",
      },
    ]);
  };

  const removeTaskRow = (id) => {
    if (taskItems.length <= 1) return;
    setTaskItems((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskRow = (id, field, value) => {
    setTaskItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isScheduled) {
      if (!taskItems[0]?.title?.trim()) {
        setErrors({ title: "Task title is required" });
        return;
      }
      if (scheduledDates.length === 0) {
        setErrors({ calendar: "At least one scheduled date is required" });
        return;
      }
    } else {
      const validItems = taskItems.filter((t) => t.title.trim());
      if (validItems.length === 0) {
        setErrors({ title: "Please enter at least one task title" });
        return;
      }
    }

    if (!selectedProjectId) {
      setErrors({ api: "Please select a target project" });
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem("last_selected_project_id", selectedProjectId);

      if (isScheduled) {
        await axios.post(
          `${API_BASE}/api/scheduled-tasks`,
          {
            projectId: selectedProjectId,
            title: taskItems[0].title.trim(),
            description: taskItems[0].description.trim(),
            priority: taskItems[0].priority,
            scheduledDates,
            deadlineOffset,
            assignedTo: { id: currentUserId, username: currentUsername },
          },
          { headers: authHeaders() }
        );
        onSuccess(null, selectedProjectId, true);
      } else {
        const validItems = taskItems.filter((t) => t.title.trim());
        for (const item of validItems) {
          const res = await axios.post(
            `${API_BASE}/api/tasks/${selectedProjectId}`,
            {
              title: item.title.trim(),
              description: item.description.trim(),
              priority: item.priority,
              deadline: item.deadline || null,
              assignedTo: { id: currentUserId, username: currentUsername },
            },
            { headers: authHeaders() }
          );
          onSuccess(res.data, selectedProjectId, false);
        }
      }
      onClose();
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Failed to create task(s)" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        isScheduled
          ? "Create Scheduled Task"
          : taskItems.length > 1
          ? `Create ${taskItems.length} Project Tasks`
          : "Create New Project Task"
      }
      maxWidth="max-w-2xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="ent-btn-secondary">
            Cancel
          </button>
          <button type="submit" form="add-task-form" disabled={saving} className="ent-btn-primary">
            {saving
              ? "Creating..."
              : isScheduled
              ? "Schedule Task"
              : taskItems.length > 1
              ? `Create ${taskItems.length} Tasks`
              : "Create Task"}
          </button>
        </>
      }
    >
      <form id="add-task-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errors.api && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 font-bold">
            {errors.api}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="ent-label">Target Project *</label>

          </div>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              localStorage.setItem("last_selected_project_id", e.target.value);
            }}
            className="ent-select text-xs font-bold"
          >
            {activeProjects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Mode Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="rounded text-[#1E40AF]"
            />
            <span className="font-bold text-slate-800 text-xs">
              Make this a Scheduled Recurring Task
            </span>
          </label>

          {!isScheduled && (
            <button
              type="button"
              onClick={addTaskRow}
              className="px-2.5 py-1 bg-blue-50 text-[#1E40AF] hover:bg-blue-100 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> Add Another Task
            </button>
          )}
        </div>

        {isScheduled ? (
          <div className="space-y-3">
            <div>
              <label className="ent-label">Task Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Monthly System Backup Verification"
                value={taskItems[0].title}
                onChange={(e) => updateTaskRow(taskItems[0].id, "title", e.target.value)}
                className="ent-input text-xs font-bold"
              />
            </div>

            <div>
              <label className="ent-label">Description & Acceptance Criteria</label>
              <textarea
                rows={3}
                placeholder="Provide context, design references, or technical specifications..."
                value={taskItems[0].description}
                onChange={(e) => updateTaskRow(taskItems[0].id, "description", e.target.value)}
                className="ent-input text-xs resize-none"
              />
            </div>

            <div>
              <label className="ent-label">Priority</label>
              <select
                value={taskItems[0].priority}
                onChange={(e) => updateTaskRow(taskItems[0].id, "priority", e.target.value)}
                className="ent-select text-xs font-semibold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D6] rounded space-y-3">
              <div>
                <label className="ent-label">Select Scheduled Dates *</label>
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      setScheduledDates([...scheduledDates, new Date(e.target.value)]);
                    }
                  }}
                  className="ent-input text-xs font-mono"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {scheduledDates.map((d, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] bg-white border border-[#EAE3D6] font-mono flex items-center gap-1"
                    >
                      {format(new Date(d), "MMM d")}
                      <button
                        type="button"
                        onClick={() => setScheduledDates(scheduledDates.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {taskItems.map((item, idx) => (
              <div
                key={item.id}
                className={`p-3.5 rounded border transition-all ${
                  taskItems.length > 1
                    ? "bg-[#FAF8F5]/70 border-[#EAE3D6] space-y-3 relative"
                    : "space-y-3 border-transparent p-0"
                }`}
              >
                {taskItems.length > 1 && (
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#1E40AF] text-white text-[9px] flex items-center justify-center font-mono font-bold">
                        {idx + 1}
                      </span>
                      Task #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTaskRow(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
                      title="Remove this task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                <div>
                  <label className="ent-label">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. ${
                      idx === 0
                        ? "Implement Responsive Hero Banner"
                        : idx === 1
                        ? "Configure API endpoint & error handling"
                        : "Optimize database queries"
                    }`}
                    value={item.title}
                    onChange={(e) => updateTaskRow(item.id, "title", e.target.value)}
                    className="ent-input text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="ent-label">Priority</label>
                    <select
                      value={item.priority}
                      onChange={(e) => updateTaskRow(item.id, "priority", e.target.value)}
                      className="ent-select text-xs font-semibold"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="ent-label">Deadline</label>
                    <input
                      type="date"
                      value={item.deadline}
                      onChange={(e) => updateTaskRow(item.id, "deadline", e.target.value)}
                      className="ent-input text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="ent-label">Description & Acceptance Criteria</label>
                  <textarea
                    rows={2}
                    placeholder="Provide context, design references, or technical specifications..."
                    value={item.description}
                    onChange={(e) => updateTaskRow(item.id, "description", e.target.value)}
                    className="ent-input text-xs resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </Modal>
  );
}

// ── Edit Scheduled Task Modal Component ───────────────────────────────────────
function EditScheduledTaskModal({ task, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority || "Medium",
  });
  const [scheduledDates, setScheduledDates] = useState(task.scheduledDates.map((d) => new Date(d)));
  const [deadlineOffset, setDeadlineOffset] = useState(task.deadlineOffset || 0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || scheduledDates.length === 0) return;
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/api/scheduled-tasks/${task._id}`,
        {
          title: form.title,
          description: form.description,
          priority: form.priority,
          scheduledDates,
          deadlineOffset,
        },
        { headers: authHeaders() }
      );
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to update scheduled task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Scheduled Task"
      maxWidth="max-w-md"
      footer={
        <>
          <button type="button" onClick={onClose} className="ent-btn-secondary">
            Cancel
          </button>
          <button type="submit" form="edit-scheduled-form" disabled={saving} className="ent-btn-primary">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </>
      }
    >
      <form id="edit-scheduled-form" onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="ent-label">Task Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="ent-input text-xs font-bold"
          />
        </div>
        <div>
          <label className="ent-label">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="ent-input text-xs resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="ent-label">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="ent-select text-xs font-semibold"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="ent-label">Deadline Offset</label>
            <select
              value={deadlineOffset}
              onChange={(e) => setDeadlineOffset(Number(e.target.value))}
              className="ent-select text-xs"
            >
              <option value={0}>Same day</option>
              <option value={1}>+1 day</option>
              <option value={2}>+2 days</option>
              <option value={3}>+3 days</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
