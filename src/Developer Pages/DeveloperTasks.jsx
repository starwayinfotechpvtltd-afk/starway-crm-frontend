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
  Calendar,
  Send,
  LayoutGrid,
  List,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { TableSkeleton, KanbanSkeleton } from "../components/ui/Skeleton";
import { apiCache } from "../utils/apiCache";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function DeveloperTasks() {
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

  // Filters & Views
  const [viewMode, setViewMode] = useState("table"); // "table" | "board"
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Inspect / Details Drawer
  const [selectedTask, setSelectedTask] = useState(null);
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
    fetchTasks();
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

  const fetchTasks = async () => {
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

      if (myProjects.length > 0) {
        setNewTaskForm((prev) => ({ ...prev, projectId: prev.projectId || myProjects[0]._id }));
      }
    } catch (err) {
      console.error("Failed to load developer tasks:", err);
    } finally {
      setLoading(false);
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
      // Reset items back to 1 row, but preserve selectedProjectId for the next time!
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

      if (selectedTask && selectedTask._id === task._id) {
        setSelectedTask((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;
    setCommenting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const projId = typeof selectedTask.projectId === "object" ? selectedTask.projectId?._id : selectedTask.projectId;

      await axios.post(
        `${API_BASE}/api/tasks/${projId}/${selectedTask._id}/comments`,
        { text: newCommentText.trim() },
        config
      );
      setNewCommentText("");
      await fetchTasks();
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert("Failed to add comment");
    } finally {
      setCommenting(false);
    }
  };

  // Metrics
  const counts = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => (t.status || "").toLowerCase() === "todo" || (t.status || "").toLowerCase() === "to do").length;
    const inProgress = tasks.filter((t) => (t.status || "").toLowerCase() === "in progress").length;
    const done = tasks.filter((t) => (t.status || "").toLowerCase() === "done").length;
    return { total, todo, inProgress, done };
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

      const projId = typeof t.projectId === "object" ? t.projectId?._id : t.projectId;
      const matchProject = projectFilter === "all" || projId === projectFilter;

      return matchSearch && matchStatus && matchPriority && matchProject;
    });
  }, [tasks, search, statusFilter, priorityFilter, projectFilter]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter, projectFilter, pageSize]);

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
      {/* ── Top Header Actions ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2.5 pb-2 border-b border-[#EAE3D6]">
        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="inline-flex items-center bg-[#F5EFE6] p-0.5 rounded border border-[#EAE3D6] gap-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "table"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List size={13} /> List
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "board"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid size={13} /> Board
            </button>
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="ent-btn-primary text-xs"
          >
            <Plus size={13} /> Add Task
          </button>
        </div>
      </div>

      {/* ── Status Filter Pills Strip ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 ent-card border-[#EAE3D6] shadow-xs">
        {/* Status Segmented Controls */}
        <div className="inline-flex items-center bg-[#F5EFE6] p-1 rounded border border-[#EAE3D6] gap-1 overflow-x-auto max-w-full">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "all"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-[#EBE3D4]"
            }`}
          >
            All Tasks
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                statusFilter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-white/70 text-slate-600 border border-slate-200"
              }`}
            >
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Todo")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "Todo"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-[#EBE3D4]"
            }`}
          >
            <Clock size={12} className={statusFilter === "Todo" ? "text-white" : "text-slate-400"} />
            To Do
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                statusFilter === "Todo"
                  ? "bg-white/20 text-white"
                  : "bg-white/70 text-slate-600 border border-slate-200"
              }`}
            >
              {counts.todo}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("In Progress")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "In Progress"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-blue-700 bg-blue-50/70 border border-blue-200/80 hover:bg-blue-100/70"
            }`}
          >
            <Play size={11} className={statusFilter === "In Progress" ? "text-white" : "text-blue-600"} />
            In Progress
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                statusFilter === "In Progress"
                  ? "bg-white/20 text-white"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {counts.inProgress}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Done")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "Done"
                ? "bg-[#059669] text-white shadow-xs"
                : "text-emerald-700 bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/70"
            }`}
          >
            <CheckCircle2 size={12} className={statusFilter === "Done" ? "text-white" : "text-emerald-600"} />
            Completed
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                statusFilter === "Done"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {counts.done}
            </span>
          </button>
        </div>

        {/* Search & Select Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Box */}
          <div className="relative flex items-center w-full sm:w-auto">
            <Search size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-white border border-[#D8CEBE] rounded text-slate-800 placeholder-slate-400 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none h-8 w-full sm:w-52"
            />
          </div>

          {/* Priority Select */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 py-1 px-2.5 text-xs bg-white border border-[#D8CEBE] rounded text-slate-700 focus:border-[#2563EB] outline-none cursor-pointer min-w-[125px]"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical 🔴</option>
            <option value="High">High 🟡</option>
            <option value="Medium">Medium 🔵</option>
            <option value="Low">Low 🟢</option>
          </select>

          {/* Project Select */}
          {projects.length > 0 && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-8 py-1 px-2.5 text-xs bg-white border border-[#D8CEBE] rounded text-slate-700 focus:border-[#2563EB] outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters Button */}
          {(search || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setProjectFilter("all");
              }}
              className="h-8 px-2.5 bg-[#F5EFE6] hover:bg-[#EAE3D6] text-[#785E3E] text-xs font-semibold rounded border border-[#EAE3D6] flex items-center gap-1 transition-colors shrink-0"
              title="Reset all filters"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table View Mode ─────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="ent-card overflow-hidden bg-white border-[#EAE3D6]">
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
                      <TableSkeleton rows={6} />
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-slate-500 font-medium">
                      No matching tasks found in this view.
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

                        {/* Task Title & Details */}
                        <td className="max-w-md">
                          <div className="cursor-pointer" onClick={() => setSelectedTask(task)}>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-xs hover:text-blue-600 transition-colors ${
                                  isDone ? "text-slate-400 line-through" : "text-slate-900"
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.links?.length > 0 && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                  {task.links.length} link{task.links.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>

                            {task.description && (
                              <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Project */}
                        <td>
                          <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                            <FolderKanban size={13} className="text-slate-400" />
                            {task.projectId?.projectName || "General Engineering"}
                          </span>
                        </td>

                        {/* Priority */}
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

                        {/* Status */}
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

                        {/* Deadline */}
                        <td>{getDeadlineBadge(task.deadline, task.status, task.completedAt)}</td>

                        {/* Action Progression */}
                        <td className="text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {!isInProgress && !isDone && (
                              <button
                                onClick={() => handleStatusChange(task, "In Progress")}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <Play size={10} /> Start
                              </button>
                            )}
                            {isInProgress && (
                              <button
                                onClick={() => handleStatusChange(task, "Done")}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 size={11} /> Done
                              </button>
                            )}
                            {isDone && (
                              <button
                                onClick={() => handleStatusChange(task, "In Progress")}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                              >
                                <RotateCcw size={10} /> Reopen
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                <span className="font-bold text-slate-900">{filteredTasks.length}</span> tasks
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
      )}

      {/* ── Kanban Board View Mode ─────────────────────────────────────────── */}
      {viewMode === "board" && (
        loading && tasks.length === 0 ? (
          <KanbanSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. To Do Column */}
          <div className="ent-card p-4 bg-slate-50/70 border-slate-200 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  To Do
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {filteredTasks.filter((t) => (t.status || "").toLowerCase() === "todo" || (t.status || "").toLowerCase() === "to do").length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px]">
              {filteredTasks
                .filter((t) => (t.status || "").toLowerCase() === "todo" || (t.status || "").toLowerCase() === "to do")
                .map((task) => (
                  <div
                    key={task._id}
                    className="ent-card p-3.5 bg-white hover:border-blue-300 transition-all cursor-pointer shadow-xs"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-500">
                        {task.projectId?.projectName || "Engineering"}
                      </span>
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
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-snug mb-1">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {getDeadlineBadge(task.deadline, task.status, task.completedAt)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task, "In Progress");
                        }}
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        Start <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 2. In Progress Column */}
          <div className="ent-card p-4 bg-blue-50/30 border-blue-200 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                  In Development
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-white text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                {filteredTasks.filter((t) => (t.status || "").toLowerCase() === "in progress").length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px]">
              {filteredTasks
                .filter((t) => (t.status || "").toLowerCase() === "in progress")
                .map((task) => (
                  <div
                    key={task._id}
                    className="ent-card p-3.5 bg-white border-blue-200 hover:border-blue-400 transition-all cursor-pointer shadow-xs"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-500">
                        {task.projectId?.projectName || "Engineering"}
                      </span>
                      <Badge
                        variant={
                          task.priority === "Critical"
                            ? "red"
                            : task.priority === "High"
                            ? "amber"
                            : "blue"
                        }
                      >
                        {task.priority || "Medium"}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-snug mb-1">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {getDeadlineBadge(task.deadline, task.status, task.completedAt)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task, "Done");
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 size={10} /> Complete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 3. Done Column */}
          <div className="ent-card p-4 bg-emerald-50/20 border-emerald-200 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h3 className="font-bold text-xs text-emerald-900 uppercase tracking-wider">
                  Delivered / Done
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                {filteredTasks.filter((t) => (t.status || "").toLowerCase() === "done").length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px]">
              {filteredTasks
                .filter((t) => (t.status || "").toLowerCase() === "done")
                .map((task) => (
                  <div
                    key={task._id}
                    className="ent-card p-3.5 bg-white opacity-85 hover:opacity-100 transition-all cursor-pointer shadow-xs"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {task.projectId?.projectName || "Engineering"}
                      </span>
                      <Badge variant="green">Done</Badge>
                    </div>

                    <h4 className="font-bold text-xs text-slate-600 line-through leading-snug mb-1">
                      {task.title}
                    </h4>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {getDeadlineBadge(task.deadline, task.status, task.completedAt)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task, "In Progress");
                        }}
                        className="text-slate-500 hover:text-blue-600 font-bold text-[10px]"
                      >
                        Reopen
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        )
      )}

      {/* ── Task Inspection & Comments Modal ───────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || "Task Details"}
        subtitle={`Project: ${selectedTask?.projectId?.projectName || "Engineering"} • Assigned to ${currentUser.username}`}
        maxWidth="max-w-2xl"
        footer={
          <>
            <div className="flex items-center gap-2 mr-auto">
              {(selectedTask?.status || "").toLowerCase() !== "in progress" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedTask, "In Progress")}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                >
                  <Play size={12} className="inline mr-1" /> Start Task
                </button>
              )}
              {(selectedTask?.status || "").toLowerCase() !== "done" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedTask, "Done")}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700"
                >
                  <CheckCircle2 size={12} className="inline mr-1" /> Mark Complete
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="ent-btn-secondary"
            >
              Close
            </button>
          </>
        }
      >
        {selectedTask && (
          <div className="space-y-5">
            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="ent-label text-[10px] mb-0.5">Priority</span>
                <Badge
                  variant={
                    selectedTask.priority === "Critical"
                      ? "red"
                      : selectedTask.priority === "High"
                      ? "amber"
                      : selectedTask.priority === "Medium"
                      ? "blue"
                      : "green"
                  }
                >
                  {selectedTask.priority || "Medium"}
                </Badge>
              </div>

              <div>
                <span className="ent-label text-[10px] mb-0.5">Status</span>
                <Badge
                  variant={
                    (selectedTask.status || "").toLowerCase() === "done"
                      ? "green"
                      : (selectedTask.status || "").toLowerCase() === "in progress"
                      ? "blue"
                      : "slate"
                  }
                >
                  {selectedTask.status || "Todo"}
                </Badge>
              </div>

              <div>
                <span className="ent-label text-[10px] mb-0.5">Target Deadline</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedTask.deadline
                    ? new Date(selectedTask.deadline).toLocaleDateString()
                    : "No deadline"}
                </span>
              </div>

              <div>
                <span className="ent-label text-[10px] mb-0.5">Delivery Status</span>
                <div>{getDeadlineBadge(selectedTask.deadline, selectedTask.status, selectedTask.completedAt)}</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="ent-label">Technical Specification & Requirements</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedTask.description || "No specific instructions provided for this task."}
              </div>
            </div>

            {/* External Links */}
            {selectedTask.links?.length > 0 && (
              <div>
                <label className="ent-label">Reference Documents & Links</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 hover:bg-blue-100"
                    >
                      <ExternalLink size={12} /> {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Fast Comment Box */}
            <div className="border-t border-slate-200 pt-4">
              <label className="ent-label mb-2">Post Comment / Update</label>
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type note, blockers, or progress update..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="ent-input text-xs"
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
              form="create-task-form-matrix"
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
        <form id="create-task-form-matrix" onSubmit={handleCreateTask} className="space-y-4">
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
