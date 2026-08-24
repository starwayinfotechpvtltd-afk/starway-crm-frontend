import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderKanban,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  Layers,
  ArrowRight,
  User,
  Building2,
  Calendar,
  Send,
  Plus,
  Play,
  RotateCcw,
  AlertTriangle,
  Eye,
  List,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  X,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import Modal from "../components/ui/Modal";
import { TableSkeleton, StatCardsSkeleton, ChartSkeleton } from "../components/ui/Skeleton";
import { apiCache } from "../utils/apiCache";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const PRIORITY_COLORS = {
  Critical: "#DC2626",
  High: "#D97706",
  Medium: "#2563EB",
  Low: "#059669",
};

export default function DeveloperHome() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);

  // Table Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Chart Analytics Filters
  const [chartTimeframe, setChartTimeframe] = useState("30"); // "7", "30", "all"
  const [chartProject, setChartProject] = useState("all");

  // Inspect / Details Modal
  const [inspectTask, setInspectTask] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);

  // Multi-Select & Bulk Actions
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Create Task Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return localStorage.getItem("last_selected_project_id") || "";
  });
  const [taskItems, setTaskItems] = useState([
    { id: "task-1", title: "", description: "", priority: "Medium", deadline: "", links: "" },
  ]);
  const [creatingTask, setCreatingTask] = useState(false);

  // Alphabetically sorted projects
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) =>
      (a.projectName || "").localeCompare(b.projectName || "", undefined, { sensitivity: "base" })
    );
  }, [projects]);

  // Pre-select remembered project when projects are loaded
  useEffect(() => {
    if (sortedProjects.length > 0) {
      const savedId = localStorage.getItem("last_selected_project_id");
      const exists = sortedProjects.some((p) => p._id === savedId);
      if (!selectedProjectId || !exists) {
        const fallbackId = exists ? savedId : sortedProjects[0]._id;
        setSelectedProjectId(fallbackId);
      }
    }
  }, [sortedProjects]);

  const addTaskRow = () => {
    setTaskItems((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: "",
        description: "",
        priority: "Medium",
        deadline: "",
        links: "",
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDeveloperData();
  }, []);

  const toggleSelectTask = (taskId) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.size === filteredTasks.length && filteredTasks.length > 0) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(filteredTasks.map((t) => t._id)));
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedTaskIds.size === 0) return;
    setBulkUpdating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const taskIds = Array.from(selectedTaskIds);

      await axios.put(
        `${API_BASE}/api/tasks/bulk-status`,
        { taskIds, status: newStatus },
        config
      );

      setTasks((prev) => {
        const updated = prev.map((t) =>
          selectedTaskIds.has(t._id)
            ? { ...t, status: newStatus, completedAt: newStatus === "Done" ? new Date() : t.completedAt }
            : t
        );
        apiCache.set("dev_tasks", updated);
        return updated;
      });

      apiCache.invalidate("tasks");
      setSelectedTaskIds(new Set());
    } catch (err) {
      console.error("Bulk status change failed, trying fallback:", err);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const promises = Array.from(selectedTaskIds).map((taskId) => {
          const task = tasks.find((t) => t._id === taskId);
          const projId = typeof task?.projectId === "object" ? task.projectId?._id : task?.projectId;
          return axios.put(`${API_BASE}/api/tasks/${projId}/${taskId}`, { status: newStatus }, config);
        });
        await Promise.all(promises);
        setTasks((prev) => {
          const updated = prev.map((t) => (selectedTaskIds.has(t._id) ? { ...t, status: newStatus } : t));
          apiCache.set("dev_tasks", updated);
          return updated;
        });
        apiCache.invalidate("tasks");
        setSelectedTaskIds(new Set());
      } catch (fallbackErr) {
        console.error("Fallback bulk update failed:", fallbackErr);
        alert("Failed to update selected tasks");
      }
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const validItems = taskItems.filter((t) => t.title.trim());
    if (validItems.length === 0) {
      alert("Please enter at least one task title");
      return;
    }
    if (!selectedProjectId && sortedProjects.length > 0) {
      alert("Please select a project suite");
      return;
    }

    const projId = selectedProjectId || sortedProjects[0]?._id;
    setCreatingTask(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      localStorage.setItem("last_selected_project_id", projId);

      const createdList = [];
      for (const item of validItems) {
        const linksArray = item.links
          ? item.links.split("\n").map((l) => l.trim()).filter(Boolean)
          : [];

        const payload = {
          title: item.title.trim(),
          description: item.description.trim(),
          priority: item.priority || "Medium",
          deadline: item.deadline || null,
          links: linksArray,
          assignedTo: { id: currentUser._id, username: currentUser.username },
        };

        const res = await axios.post(`${API_BASE}/api/tasks/${projId}`, payload, config);
        if (res.data) {
          const matchedProj = projects.find((p) => p._id === projId);
          createdList.push({
            ...res.data,
            projectId: matchedProj || { _id: projId, projectName: "Project Deliverable" },
          });
        }
      }

      if (createdList.length > 0) {
        setTasks((prev) => {
          const updated = [...createdList, ...prev];
          apiCache.set("dev_tasks", updated);
          return updated;
        });
        apiCache.invalidate("tasks");
      }

      setCreateModalOpen(false);
      // Reset items back to 1 row, but preserve selectedProjectId for next click!
      setTaskItems([
        { id: `task-${Date.now()}`, title: "", description: "", priority: "Medium", deadline: "", links: "" },
      ]);
    } catch (err) {
      console.error("Failed to create task(s):", err);
      alert(err.response?.data?.message || "Failed to create task(s)");
    } finally {
      setCreatingTask(false);
    }
  };

  const fetchDeveloperData = async () => {
    // Check Cache first for instant 0ms rendering
    const cachedTasks = apiCache.get("dev_tasks");
    const cachedProjects = apiCache.get("dev_projects");

    if (cachedTasks?.data && cachedProjects?.data) {
      setTasks(cachedTasks.data);
      setProjects(cachedProjects.data);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [userRes, tasksRes, projectsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/auth/user`, config),
        axios.get(`${API_BASE}/api/tasks/developer/tasks`, config),
        axios.get(`${API_BASE}/api/newproject/projects`, config),
      ]);

      let userObj = currentUser;
      if (userRes.status === "fulfilled" && userRes.value.data) {
        userObj = userRes.value.data;
        setCurrentUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
      }

      const allTasks = tasksRes.status === "fulfilled" ? tasksRes.value.data || [] : [];
      setTasks(allTasks);
      apiCache.set("dev_tasks", allTasks, 3 * 60 * 1000);

      const allProjects = projectsRes.status === "fulfilled" ? projectsRes.value.data || [] : [];
      const myProjects = allProjects.filter((p) => {
        if (userObj.role === "admin") return true;
        const devs = p.assignedDeveloper || [];
        return devs.some(
          (d) =>
            d.id?.toString() === userObj._id?.toString() ||
            d.username?.toLowerCase() === userObj.username?.toLowerCase()
        );
      });
      setProjects(myProjects);
      apiCache.set("dev_projects", myProjects, 3 * 60 * 1000);
    } catch (err) {
      console.error("Error fetching developer data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const projId = typeof task.projectId === "object" ? task.projectId?._id : task.projectId;

      await axios.put(
        `${API_BASE}/api/tasks/${projId}/${task._id}`,
        { status: newStatus },
        config
      );

      setTasks((prev) => {
        const updated = prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t));
        apiCache.set("dev_tasks", updated);
        return updated;
      });

      apiCache.invalidate("tasks");

      if (inspectTask && inspectTask._id === task._id) {
        setInspectTask((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Failed to update status");
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !inspectTask) return;
    setCommenting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const projId = typeof inspectTask.projectId === "object" ? inspectTask.projectId?._id : inspectTask.projectId;

      await axios.post(
        `${API_BASE}/api/tasks/${projId}/${inspectTask._id}/comments`,
        { text: newCommentText.trim() },
        config
      );
      setNewCommentText("");
      await fetchDeveloperData();
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert("Failed to add comment");
    } finally {
      setCommenting(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalAssigned = tasks.length;
    const inProgress = tasks.filter((t) => (t.status || "").toLowerCase() === "in progress").length;
    const done = tasks.filter((t) => (t.status || "").toLowerCase() === "done").length;
    const pending = tasks.filter(
      (t) => (t.status || "").toLowerCase() === "todo" || (t.status || "").toLowerCase() === "to do"
    ).length;
    const completionRate = totalAssigned > 0 ? Math.round((done / totalAssigned) * 100) : 0;

    return { totalAssigned, inProgress, done, pending, completionRate, activeProjects: projects.length };
  }, [tasks, projects]);

  // Chart 1: Deliverables Velocity Timeline
  const velocityChartData = useMemo(() => {
    // Filter tasks based on chartProject
    const filtered = tasks.filter((t) => {
      if (chartProject === "all") return true;
      const pId = typeof t.projectId === "object" ? t.projectId?._id : t.projectId;
      return pId === chartProject;
    });

    const daysCount = chartTimeframe === "7" ? 7 : chartTimeframe === "30" ? 30 : 60;
    const now = new Date();
    const buckets = {};

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      buckets[key] = { name: key, assigned: 0, completed: 0 };
    }

    filtered.forEach((t) => {
      if (t.createdAt) {
        const d = new Date(t.createdAt);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (buckets[key]) buckets[key].assigned += 1;
      }
      if ((t.status || "").toLowerCase() === "done" && t.completedAt) {
        const d = new Date(t.completedAt);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (buckets[key]) buckets[key].completed += 1;
      }
    });

    return Object.values(buckets);
  }, [tasks, chartTimeframe, chartProject]);

  // Chart 2: Priority & Status Breakdown
  const priorityChartData = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    tasks.forEach((t) => {
      const p = t.priority || "Medium";
      if (counts[p] !== undefined) counts[p] += 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: PRIORITY_COLORS[name] || "#2563EB",
    }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        search === "" ||
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.projectId?.projectName?.toLowerCase().includes(search.toLowerCase());

      const curStatus = (t.status || "Todo").toLowerCase();
      let matchStatus = true;
      if (statusFilter === "Todo") {
        matchStatus = curStatus === "todo" || curStatus === "to do";
      } else if (statusFilter === "In Progress") {
        matchStatus = curStatus === "in progress";
      } else if (statusFilter === "Done") {
        matchStatus = curStatus === "done";
      }

      const matchPriority =
        priorityFilter === "all" ||
        (t.priority || "Medium").toLowerCase() === priorityFilter.toLowerCase();

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter, pageSize]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTasks.slice(startIndex, startIndex + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const getDeadlineBadge = (deadline, status, completedAt) => {
    const isDone = (status || "").toLowerCase() === "done";

    // 1. Completed Deliverable Handling
    if (isDone) {
      if (!deadline) {
        return (
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
              <CheckCircle2 size={11} /> Done
            </span>
            {completedAt && (
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {new Date(completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        );
      }

      const d = new Date(deadline);
      const completionDate = completedAt ? new Date(completedAt) : new Date();
      const diffMs = completionDate.getTime() - d.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 w-fit"
              title={`Target deadline was ${d.toLocaleDateString()} - Completed ${diffDays} day(s) late`}
            >
              <AlertTriangle size={11} className="text-amber-600" /> Done ({diffDays}d Late)
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Completed {completionDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
              <CheckCircle2 size={11} /> Done On Time
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {completionDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        );
      }
    }

    // 2. Active / Pending Deliverable Handling
    if (!deadline) return <span className="text-slate-400 text-xs font-mono">—</span>;
    const d = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 w-fit animate-pulse">
            <AlertTriangle size={11} /> Overdue by {Math.abs(diffDays)}d
          </span>
          <span className="text-[10px] text-rose-600 font-medium">
            Due {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>
      );
    } else if (diffDays === 0) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
            <Clock size={11} /> Due Today
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>
      );
    } else if (diffDays <= 3) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 w-fit">
            <Clock size={11} /> In {diffDays} days
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] text-slate-700 font-semibold">
          {d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          In {diffDays} days
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* ── Top Action Row ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 pb-1 border-b border-slate-200">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="ent-btn-primary text-xs"
        >
          <Plus size={13} /> Add Task
        </button>
        <Link
          to="/dashboard-developer/tasks"
          className="ent-btn-secondary text-xs"
        >
          View All Tasks
        </Link>
      </div>

      {/* ── KPI Metric Cards ───────────────────────────────────────────────── */}
      {loading && tasks.length === 0 ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Tasks"
            value={metrics.totalAssigned}
            subtitle={`${metrics.pending} pending action`}
            icon={Clock}
            variant="blue"
          />
          <StatCard
            title="In Progress"
            value={metrics.inProgress}
            subtitle="Currently in progress"
            icon={AlertCircle}
            variant="amber"
          />
          <StatCard
            title="Completed Tasks"
            value={metrics.done}
            subtitle={`${metrics.completionRate}% completion rate`}
            icon={CheckCircle2}
            variant="emerald"
          />
          <StatCard
            title="Active Projects"
            value={metrics.activeProjects}
            subtitle="Assigned projects"
            icon={FolderKanban}
            variant="royal"
          />
        </div>
      )}

      {/* ── Performance & Analytics ─────────────────────────────────────────── */}
      {loading && tasks.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <div>
            <ChartSkeleton />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Velocity & Trends */}
        <div className="lg:col-span-2 ent-card p-5 bg-white border-[#EAE3D6] shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D6] mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-[#2563EB]" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Task Velocity & Completion Timeline
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Task assignment and completion throughput over time
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center bg-[#F5EFE6] p-0.5 rounded border border-[#EAE3D6] gap-0.5 text-xs">
                <button
                  onClick={() => setChartTimeframe("7")}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    chartTimeframe === "7"
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setChartTimeframe("30")}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    chartTimeframe === "30"
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  30D
                </button>
                <button
                  onClick={() => setChartTimeframe("all")}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    chartTimeframe === "all"
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All
                </button>
              </div>

              {projects.length > 0 && (
                <select
                  value={chartProject}
                  onChange={(e) => setChartProject(e.target.value)}
                  className="h-7 py-0 px-2 text-[11px] bg-white border border-[#D8CEBE] rounded text-slate-700 focus:border-[#2563EB] outline-none max-w-[130px] truncate"
                >
                  <option value="all">All Projects</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAssigned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#EAE3D6" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#EAE3D6" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EAE3D6",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 600, paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="assigned"
                  name="Assigned Deliverables"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAssigned)"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed Deliverables"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Priority & Workload Distribution */}
        <div className="ent-card p-5 bg-white border-[#EAE3D6] shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#EAE3D6] mb-3">
            <div className="flex items-center gap-2">
              <PieIcon size={15} className="text-[#2563EB]" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Workload by Priority
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Task distribution across criticality tiers
            </p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#EAE3D6",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900 leading-none">{tasks.length}</span>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mt-0.5">
                Tasks
              </span>
            </div>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAE3D6]">
            {priorityChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs p-1.5 bg-[#FAF8F5] rounded border border-[#EAE3D6]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700 text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 text-xs font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ── Main Work Queue Matrix ─────────────────────────────────────────── */}
      <div className="ent-card overflow-hidden bg-white border-[#EAE3D6]">
        {/* Table Header & Controls */}
        <div className="p-4 border-b border-[#EAE3D6] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                My Assigned Tasks
              </h2>
              <span className="text-[11px] font-bold bg-[#F5EFE6] text-[#785E3E] px-2 py-0.5 rounded border border-[#EAE3D6]">
                {tasks.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Review assigned tasks, update status, and view details.
            </p>
          </div>

          {/* Filters Suite */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Segmented Pill Bar */}
            <div className="inline-flex items-center bg-[#F5EFE6] p-0.5 rounded border border-[#EAE3D6] gap-0.5">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  statusFilter === "all"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("Todo")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  statusFilter === "Todo"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                To Do
              </button>
              <button
                onClick={() => setStatusFilter("In Progress")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  statusFilter === "In Progress"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-blue-700 hover:bg-blue-50"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter("Done")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  statusFilter === "Done"
                    ? "bg-[#059669] text-white shadow-xs"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Done
              </button>
            </div>

            {/* Search Box */}
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs bg-white border border-[#D8CEBE] rounded text-slate-800 placeholder-slate-400 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none h-8 w-40 sm:w-48"
              />
            </div>

            {/* Priority Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 py-1 px-2 text-xs bg-white border border-[#D8CEBE] rounded text-slate-700 focus:border-[#2563EB] outline-none cursor-pointer min-w-[110px]"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical 🔴</option>
              <option value="High">High 🟡</option>
              <option value="Medium">Medium 🔵</option>
              <option value="Low">Low 🟢</option>
            </select>

            {/* Clear Button */}
            {(search || statusFilter !== "all" || priorityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
                className="h-8 px-2 bg-[#F5EFE6] hover:bg-[#EAE3D6] text-[#785E3E] text-xs font-semibold rounded border border-[#EAE3D6] flex items-center gap-1 transition-colors shrink-0"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="ent-table">
            <thead>
              <tr>
                <th className="w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredTasks.length > 0 && selectedTaskIds.size === filteredTasks.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                    title="Select all visible tasks"
                  />
                </th>
                <th>Task Title</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Deadline</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && tasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-2">
                    <TableSkeleton rows={5} />
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 font-medium">
                    No assigned tasks found. Tasks delegated to you by Team Leads will appear here.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => {
                  const statusNorm = (task.status || "Todo").toLowerCase();
                  const isDone = statusNorm === "done";
                  const isInProgress = statusNorm === "in progress";
                  const isSelected = selectedTaskIds.has(task._id);

                  return (
                    <tr
                      key={task._id}
                      className={`hover:bg-[#FAF7F2] transition-colors ${
                        isSelected ? "bg-[#EFF6FF]/80" : isDone ? "bg-slate-50/40 opacity-75" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTask(task._id)}
                          className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                        />
                      </td>

                      <td className="max-w-md">
                        <div className="cursor-pointer" onClick={() => setInspectTask(task)}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-xs hover:text-blue-600 transition-colors ${
                                isDone ? "text-slate-400 line-through" : "text-slate-900"
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.links?.length > 0 && (
                              <span className="text-[10px] bg-[#F5EFE6] text-[#785E3E] px-1.5 py-0.2 rounded border border-[#EAE3D6]">
                                {task.links.length} link{task.links.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <div className="text-[11px] text-slate-500 font-normal truncate max-w-sm mt-0.5">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                          <FolderKanban size={13} className="text-slate-400" />
                          {task.projectId?.projectName || "General"}
                        </span>
                      </td>
                      <td>
                        <Badge
                          variant={
                            task.priority === "Critical"
                              ? "red"
                              : task.priority === "High"
                              ? "amber"
                              : task.priority === "Medium"
                              ? "blue"
                              : "green"
                          }
                        >
                          {task.priority || "Medium"}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          variant={
                            isDone
                              ? "green"
                              : isInProgress
                              ? "blue"
                              : "slate"
                          }
                        >
                          {task.status || "Todo"}
                        </Badge>
                      </td>
                      <td>{getDeadlineBadge(task.deadline, task.status, task.completedAt)}</td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {!isInProgress && !isDone && (
                            <button
                              onClick={() => handleStatusChange(task, "In Progress")}
                              className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <Play size={10} /> Start
                            </button>
                          )}
                          {isInProgress && (
                            <button
                              onClick={() => handleStatusChange(task, "Done")}
                              className="px-2.5 py-1 bg-[#059669] hover:bg-[#047857] text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle2 size={11} /> Done
                            </button>
                          )}
                          {isDone && (
                            <button
                              onClick={() => handleStatusChange(task, "In Progress")}
                              className="px-2 py-1 bg-[#F5EFE6] hover:bg-[#EAE3D6] text-slate-700 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              <RotateCcw size={10} /> Reopen
                            </button>
                          )}
                          <button
                            onClick={() => setInspectTask(task)}
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-[#F5EFE6] transition-colors"
                            title="Inspect Task & Specs"
                          >
                            <Eye size={13} />
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

        {/* Pagination Footer Bar */}
        <div className="p-3 border-t border-[#EAE3D6] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span>
              Showing <span className="font-bold text-slate-900">{filteredTasks.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{" "}
              <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredTasks.length)}</span> of{" "}
              <span className="font-bold text-slate-900">{filteredTasks.length}</span> deliverables
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-7 py-0 px-2 text-xs bg-white border border-[#D8CEBE] rounded text-slate-800 font-semibold focus:border-[#2563EB] outline-none cursor-pointer"
              >
                <option value={25}>25 / page</option>
                <option value={75}>75 / page</option>
                <option value={100}>100 / page</option>
                <option value={200}>200 / page</option>
                <option value={300}>300 / page</option>
              </select>
            </div>

            {/* Page Nav Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="h-7 px-2.5 bg-white border border-[#D8CEBE] rounded text-slate-700 font-bold hover:bg-[#F5EFE6] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Prev
              </button>

              <div className="flex items-center gap-1 px-1 font-bold text-slate-700">
                <span>Page {currentPage} of {totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="h-7 px-2.5 bg-white border border-[#D8CEBE] rounded text-slate-700 font-bold hover:bg-[#F5EFE6] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Projects Grid ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              My Active Client Projects ({projects.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Projects currently in development where you are an appointed engineer.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="ent-card p-8 text-center text-xs text-slate-400 border-[#EAE3D6]">
            No active projects assigned to your profile yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="ent-card p-4 flex flex-col justify-between hover:border-[#2563EB]/40 transition-all bg-white border-[#EAE3D6]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-xs text-slate-900">{proj.projectName}</span>
                    <Badge variant="green">{proj.status || "Active"}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mb-3">
                    {proj.projectDetails || "No details provided."}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Client:</span>
                      <span className="font-semibold text-slate-800">{proj.clientName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Services:</span>
                      <span className="font-semibold text-slate-800">
                        {proj.serviceType?.join(", ") || "Development"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#EAE3D6] flex items-center justify-between text-[10px] text-slate-400">
                  <span>Created {new Date(proj.createdDate || proj.createdAt).toLocaleDateString()}</span>
                  <span className="font-bold text-[#1E40AF] text-[10px] uppercase tracking-wider">{proj.subscriptionType || "Active Deliverable"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Task Inspection & Comments Modal ───────────────────────────────── */}
      <Modal
        isOpen={Boolean(inspectTask)}
        onClose={() => setInspectTask(null)}
        title={inspectTask?.title || "Task Details"}
        subtitle={`Project: ${inspectTask?.projectId?.projectName || "Engineering"} • Assigned to ${currentUser.username}`}
        maxWidth="max-w-2xl"
        footer={
          <>
            <div className="flex items-center gap-2 mr-auto">
              {(inspectTask?.status || "").toLowerCase() !== "in progress" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(inspectTask, "In Progress")}
                  className="px-3 py-1.5 bg-[#2563EB] text-white rounded text-xs font-bold hover:bg-[#1D4ED8] shadow-xs"
                >
                  <Play size={12} className="inline mr-1" /> Start Task
                </button>
              )}
              {(inspectTask?.status || "").toLowerCase() !== "done" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(inspectTask, "Done")}
                  className="px-3 py-1.5 bg-[#059669] text-white rounded text-xs font-bold hover:bg-[#047857] shadow-xs"
                >
                  <CheckCircle2 size={12} className="inline mr-1" /> Mark Complete
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setInspectTask(null)}
              className="ent-btn-secondary"
            >
              Close
            </button>
          </>
        }
      >
        {inspectTask && (
          <div className="space-y-5">
            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3 rounded border border-[#EAE3D6]">
              <div>
                <span className="ent-label text-[10px] mb-0.5">Priority</span>
                <Badge
                  variant={
                    inspectTask.priority === "Critical"
                      ? "red"
                      : inspectTask.priority === "High"
                      ? "amber"
                      : inspectTask.priority === "Medium"
                      ? "blue"
                      : "green"
                  }
                >
                  {inspectTask.priority || "Medium"}
                </Badge>
              </div>

              <div>
                <span className="ent-label text-[10px] mb-0.5">Status</span>
                <Badge
                  variant={
                    (inspectTask.status || "").toLowerCase() === "done"
                      ? "green"
                      : (inspectTask.status || "").toLowerCase() === "in progress"
                      ? "blue"
                      : "slate"
                  }
                >
                  {inspectTask.status || "Todo"}
                </Badge>
              </div>

              <div>
                <span className="ent-label text-[10px] mb-0.5">Target Deadline</span>
                <span className="text-xs font-bold text-slate-800">
                  {inspectTask.deadline
                    ? new Date(inspectTask.deadline).toLocaleDateString()
                    : "No deadline"}
                </span>
              </div>

              <div>
                <span className="ent-label text-[10px] mb-0.5">Delivery Status</span>
                <div>{getDeadlineBadge(inspectTask.deadline, inspectTask.status, inspectTask.completedAt)}</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="ent-label">Description & Notes</label>
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D6] rounded text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {inspectTask.description || "No specific instructions provided for this task."}
              </div>
            </div>

            {/* External Links */}
            {inspectTask.links?.length > 0 && (
              <div>
                <label className="ent-label">Reference Links</label>
                <div className="flex flex-wrap gap-2">
                  {inspectTask.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded border border-[#BFDBFE] hover:bg-[#DBEAFE]"
                    >
                      <ExternalLink size={12} /> {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Fast Comment Box */}
            <div className="border-t border-[#EAE3D6] pt-4">
              <label className="ent-label mb-2">Post Comment / Update</label>
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type note, blockers, or progress update..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="ent-input text-xs border-[#D8CEBE]"
                />
                <button
                  type="submit"
                  disabled={commenting || !newCommentText.trim()}
                  className="ent-btn-primary shrink-0"
                >
                  <Send size={12} /> {commenting ? "Posting..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create Task Modal ────────────────────────────────────── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={taskItems.length > 1 ? `Create ${taskItems.length} Project Tasks` : "Create New Task"}
        subtitle="Add one or multiple deliverables to your assigned project"
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-task-form-home"
              disabled={creatingTask}
              className="ent-btn-primary"
            >
              {creatingTask
                ? "Creating..."
                : taskItems.length > 1
                ? `Create ${taskItems.length} Tasks`
                : "Create Task"}
            </button>
          </>
        }
      >
        <form id="create-task-form-home" onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="ent-label">Target Project *</label>

            </div>
            <select
              required
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                localStorage.setItem("last_selected_project_id", e.target.value);
              }}
              className="ent-select text-xs font-semibold"
            >
              {sortedProjects.length === 0 ? (
                <option value="">No active projects assigned</option>
              ) : (
                sortedProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectName} ({p.clientName})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Task Deliverables ({taskItems.length})
              </span>
              {taskItems.length > 1 && (
                <span className="text-[10px] bg-blue-50 text-[#1E40AF] px-2 py-0.5 rounded font-bold">
                  Batch Creation Active
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={addTaskRow}
              className="px-2.5 py-1 bg-blue-50 text-[#1E40AF] hover:bg-blue-100 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> Add Another Task
            </button>
          </div>

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
                      Deliverable #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTaskRow(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
                      title="Remove this deliverable"
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
                        ? "Implement user authentication flow"
                        : idx === 1
                        ? "Setup database migration & models"
                        : "Build responsive dashboard widgets"
                    }`}
                    value={item.title}
                    onChange={(e) => updateTaskRow(item.id, "title", e.target.value)}
                    className="ent-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="ent-label">Priority</label>
                    <select
                      value={item.priority}
                      onChange={(e) => updateTaskRow(item.id, "priority", e.target.value)}
                      className="ent-select text-xs"
                    >
                      <option value="Critical">Critical 🔴</option>
                      <option value="High">High 🟡</option>
                      <option value="Medium">Medium 🔵</option>
                      <option value="Low">Low 🟢</option>
                    </select>
                  </div>

                  <div>
                    <label className="ent-label">Deadline</label>
                    <input
                      type="date"
                      value={item.deadline}
                      onChange={(e) => updateTaskRow(item.id, "deadline", e.target.value)}
                      className="ent-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="ent-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Provide task details or instructions..."
                    value={item.description}
                    onChange={(e) => updateTaskRow(item.id, "description", e.target.value)}
                    className="ent-input text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="ent-label">Reference Links (Optional, one per line)</label>
                  <textarea
                    rows={1}
                    placeholder="https://github.com/..."
                    value={item.links}
                    onChange={(e) => updateTaskRow(item.id, "links", e.target.value)}
                    className="ent-input text-xs resize-none font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal>


      {/* ── Floating Bulk Action Bar ────────────────────────────────────────── */}
      {selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1E40AF] text-white px-5 py-3 rounded shadow-2xl border border-white/20 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white text-[#1E40AF] font-bold text-xs flex items-center justify-center font-mono shadow-xs">
              {selectedTaskIds.size}
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              Task{selectedTaskIds.size > 1 ? "s" : ""} Selected
            </span>
          </div>

          <div className="h-4 w-px bg-white/30" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange("Done")}
              disabled={bulkUpdating}
              className="px-3.5 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={13} /> {bulkUpdating ? "Updating..." : "Mark as Done"}
            </button>

            <button
              onClick={() => handleBulkStatusChange("In Progress")}
              disabled={bulkUpdating}
              className="px-3 py-1.5 bg-white text-[#1E40AF] hover:bg-[#FAF8F5] text-xs font-bold rounded shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play size={12} /> Move to In Progress
            </button>

            <button
              onClick={() => handleBulkStatusChange("Todo")}
              disabled={bulkUpdating}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={12} /> Set To Do
            </button>
          </div>

          <div className="h-4 w-px bg-white/30" />

          <button
            onClick={() => setSelectedTaskIds(new Set())}
            className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Deselect all"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}