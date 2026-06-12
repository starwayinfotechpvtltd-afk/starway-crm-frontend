import React, { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  PlusIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  format, differenceInCalendarDays, isToday, isYesterday, 
  isThisWeek, isThisMonth, subMonths, isWithinInterval, 
  startOfDay, endOfDay 
} from "date-fns";

// Lazy load the Kanban Board component to optimize initial asset delivery
const ProjectKanban = React.lazy(() => import("../Admin Pages/Components/Projectkanban"));

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: "#F6F8FA",
  bgCard: "#FFFFFF",
  bgSidebar: "#F6F8FA",
  bgInput: "#FFFFFF",
  border: "#D0D7DE",
  borderFocus: "#0969DA",
  accent: "#0969DA",
  accentDim: "#0969DA15",
  accentHover: "#0349B6",
  green: "#1A7F37",
  greenBg: "#DAFBE1",
  red: "#D1242F",
  redBg: "#FFEBE9",
  blue: "#0969DA",
  blueBg: "#DDF4FF",
  orange: "#BF8700",
  orangeBg: "#FFF8C5",
  gray: "#656D76",
  grayBg: "#EAEEF2",
  textPrimary: "#1F2328",
  textSecondary: "#656D76",
  textDisabled: "#8C959F",
  radius: "8px",
  radiusSm: "5px",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
  shadowMd: "0 4px 14px rgba(0,0,0,0.1)",
  font: "'DM Sans', 'Segoe UI', sans-serif"
};

// ── Framer Motion Variants ───────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 26 } },
};

// ── Skeleton Loader ───────────────────────────────────────────────────────────
const SkeletonDashboard = () => (
  <div className="min-h-screen bg-[#F6F8FA] flex flex-col font-sans">
    <div className="h-16 bg-white border-b border-[#D0D7DE] w-full animate-pulse text-center"></div>
    <div className="p-6 max-w-[95%] mx-auto space-y-6 w-full flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-5 rounded-lg border border-[#D0D7DE] animate-pulse h-24">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Comment Modal ─────────────────────────────────────────────────────────────
const CommentModal = ({ task, projectId, onClose }) => {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/tasks/${projectId}/${task._id}/comments`,
        { text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosted(true);
      setTimeout(onClose, 900);
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1F2328]/50 backdrop-blur-sm animate-fadeIn">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-[#D0D7DE] font-sans">
        <div className="px-5 py-4 border-b border-[#D0D7DE] flex justify-between items-center bg-[#F6F8FA]">
          <div>
            <div className="text-[10px] text-[#656D76] font-bold uppercase tracking-wider">Add Comment</div>
            <div className="text-xs font-bold text-[#1F2328] mt-1 break-words max-w-[280px]">{task.title}</div>
          </div>
          <button onClick={onClose} className="text-[#656D76] hover:text-[#1F2328] text-xl font-bold">&times;</button>
        </div>
        {posted ? (
          <div className="text-center py-8 text-[#1A7F37] font-semibold text-xs">
            ✓ Comment posted!
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write your comment..."
              rows={3}
              className="w-full border border-[#D0D7DE] rounded-md p-2.5 text-xs outline-none focus:border-[#0969DA] resize-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-3 py-1.5 text-xs font-bold text-[#656D76] border border-[#D0D7DE] rounded-md hover:bg-[#F6F8FA] transition-colors">Cancel</button>
              <button onClick={submit} disabled={!text.trim() || posting} className="px-3 py-1.5 text-xs font-bold text-white bg-[#0969DA] hover:bg-[#0349B6] rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50">
                {posting && <div className="btn-spinner" />}
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Task Creation Modal ────────────────────────────────────────────────────────
const AddTaskModal = ({ open, onClose, projects, onSuccess, currentUserId, currentUsername }) => {
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', deadline: '', projectId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ title: '', description: '', priority: 'Medium', deadline: '', projectId: projects[0]?._id || '' });
    }
  }, [open, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectId) return alert("Please select a project");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/api/tasks/${form.projectId}`, {
         ...form,
         assignedTo: { id: currentUserId, username: currentUsername }
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const newTask = res.data?.task || res.data || { ...form, _id: Math.random().toString(), createdAt: new Date().toISOString(), status: "Todo" };
      onSuccess(newTask, form.projectId);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1F2328]/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-[#D0D7DE] font-sans">
        <div className="px-5 py-4 border-b border-[#D0D7DE] flex justify-between items-center bg-[#F6F8FA]">
          <h2 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">Create New Task</h2>
          <button onClick={onClose} className="text-[#656D76] hover:text-[#1F2328] text-xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Project</label>
            <select required value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA] bg-white text-[#1F2328] font-medium">
               {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Title</label>
            <input required autoFocus value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA]" placeholder="What needs to be done?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA] bg-white text-[#1F2328] font-medium">
                 <option value="Low">Low</option>
                 <option value="Medium">Medium</option>
                 <option value="High">High</option>
                 <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Deadline</label>
              <input required type="date" min={new Date().toISOString().split('T')[0]} value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA]" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA] resize-none" rows="3" placeholder="Add context or criteria..."></textarea>
          </div>
          <div className="pt-3 flex justify-end gap-3 border-t border-[#D0D7DE] mt-4">
             <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#656D76] border border-[#D0D7DE] rounded-md hover:bg-[#F6F8FA] transition-colors">Cancel</button>
             <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-bold text-white bg-[#0969DA] rounded-md hover:bg-[#0349B6] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {submitting ? 'Creating...' : 'Create Task'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Dashboard App ─────────────────────────────────────────────────────────
function App() {
  const currentUserId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "Developer";
  const CACHE_KEY = `dev_dash_cache_${currentUserId}`;

  // Global Filter States
  const [globalTimeFilter, setGlobalTimeFilter] = useState("Today");
  const [globalCustomDates, setGlobalCustomDates] = useState({ start: "", end: "" });
  const [globalProjectFilter, setGlobalProjectFilter] = useState("All");

  // Inline List Searches
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  const [completedSearchQuery, setCompletedSearchQuery] = useState("");

  // Core Data States
  const [totalActiveProjectsCount, setTotalActiveProjectsCount] = useState(0);
  const [projectsData, setProjectsData] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]);
  
  // UI & Pagination States
  const [loading, setLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [completedVisibleCount, setCompletedVisibleCount] = useState(10);

  // Detail & Comment Modals
  const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [commentTask, setCommentTask] = useState(null);

  // Kanban States
  const [kanbanProject, setKanbanProject] = useState(null);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const [openingKanbanId, setOpeningKanbanId] = useState(null);

  // Reset pagination when filters change
  useEffect(() => { 
    setCompletedVisibleCount(10);
  }, [globalTimeFilter, globalProjectFilter, globalCustomDates]);

  // ── Data Fetching & Local Storage Caching ────────────────────────────────────
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };

      const [dashRes, totalRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/reports/dashboard`, authHeader),
        axios.get(`${API_BASE}/api/newproject/projects/total-active`, authHeader)
      ]);

      let fetchedProjects = [];
      let allPending = [];
      let allCompletedList = [];
      let activeCount = totalRes.status === "fulfilled" ? totalRes.value.data.length : 0;

      if (dashRes.status === "fulfilled") {
        const { projects, tasks, completions } = dashRes.value.data;
        fetchedProjects = projects || [];

        // Map Pending Tasks
        allPending = (tasks || [])
          .filter(t => t.status !== "Done" && t.assignedTo?.id?.toString() === currentUserId?.toString())
          .map(t => ({ ...t, _projectId: t.projectId, _projectName: t.projectName }));

        // Map Completions
        allCompletedList = (completions || [])
          .filter(c => c.completedBy?.id?.toString() === currentUserId?.toString())
          .map(c => ({ ...c, _projectId: c.projectId }));

        // Sort Data
        allPending.sort((a, b) => new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01'));
        allCompletedList.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      }

      setProjectsData(fetchedProjects);
      setTotalActiveProjectsCount(activeCount);
      setPendingTasks(allPending);
      setAllCompletions(allCompletedList);

      // Save to Local Cache
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        projectsData: fetchedProjects,
        totalActiveProjectsCount: activeCount,
        pendingTasks: allPending,
        allCompletions: allCompletedList,
        timestamp: new Date().getTime()
      }));

    } catch (err) {
      console.error("Dashboard Fetch Error", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [currentUserId, CACHE_KEY]);

  useEffect(() => {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setProjectsData(parsed.projectsData || []);
        setTotalActiveProjectsCount(parsed.totalActiveProjectsCount || 0);
        setPendingTasks(parsed.pendingTasks || []);
        setAllCompletions(parsed.allCompletions || []);
        setLoading(false);
        fetchDashboardData(true); 
      } catch (e) {
        fetchDashboardData();
      }
    } else {
      fetchDashboardData();
    }
  }, [fetchDashboardData, CACHE_KEY]);

  // ── Kanban Action ────────────────────────────────────────────────────────────
  const handleOpenKanban = useCallback((pId) => {
    setOpeningKanbanId(pId);
    const targetProject = projectsData.find(p => p._id === pId);
    
    setTimeout(() => {
      if (targetProject) {
        setKanbanProject(targetProject);
        setKanbanOpen(true);
      }
      setOpeningKanbanId(null);
    }, 450);
  }, [projectsData]);

  // ── Optimistic Actions ───────────────────────────────────────────────────────
  const handleCompleteTask = async (taskId, projectId) => {
    setCompletingTaskId(taskId);
    
    // Optimistic UI Update (Instant response)
    const taskToComplete = pendingTasks.find(t => t._id === taskId);
    if (taskToComplete) {
      const mockCompletion = {
        ...taskToComplete,
        _id: Math.random().toString(),
        taskId: taskToComplete._id,
        taskTitle: taskToComplete.title,
        completedAt: new Date().toISOString(),
        completedBy: { id: currentUserId, username }
      };
      
      setPendingTasks(prev => prev.filter(t => t._id !== taskId));
      setAllCompletions(prev => [mockCompletion, ...prev]);
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/api/tasks/${projectId}/${taskId}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchDashboardData(true);
    } catch (error) {
      console.error("Failed to complete task", error);
      fetchDashboardData(true); 
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleQuickAddSuccess = (newTask, projectId) => {
    const project = projectsData.find(p => p._id === projectId);
    const mappedTask = { ...newTask, _projectId: projectId, _projectName: project?.projectName };
    
    setPendingTasks(prev => {
      const arr = [...prev, mappedTask];
      return arr.sort((a, b) => new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01'));
    });
    fetchDashboardData(true);
  };

  // ── Global Filter Logic ──────────────────────────────────────────────────────
  const isDateInRange = useCallback((dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    switch (globalTimeFilter) {
      case "Today": return isToday(d);
      case "Yesterday": return isYesterday(d);
      case "This Week": return isThisWeek(d);
      case "This Month": return isThisMonth(d);
      case "Last Month": {
        const lm = subMonths(new Date(), 1);
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
      }
      case "All Time": return true;
      case "Custom":
        if (globalCustomDates.start && globalCustomDates.end) {
          return isWithinInterval(d, { start: startOfDay(new Date(globalCustomDates.start)), end: endOfDay(new Date(globalCustomDates.end)) });
        }
        return true;
      default: return true;
    }
  }, [globalTimeFilter, globalCustomDates]);

  // Apply Global Filters + Search across all data arrays
  const globallyFilteredCompletions = useMemo(() => {
    let list = allCompletions;
    if (globalProjectFilter !== "All") list = list.filter(c => c._projectId === globalProjectFilter);
    list = list.filter(c => isDateInRange(c.completedAt));
    if (completedSearchQuery.trim()) {
      const query = completedSearchQuery.toLowerCase();
      list = list.filter(c => (c.taskTitle || c.title || "").toLowerCase().includes(query));
    }
    return list;
  }, [allCompletions, globalProjectFilter, isDateInRange, completedSearchQuery]);

  const globallyFilteredPending = useMemo(() => {
    let list = pendingTasks;
    if (globalProjectFilter !== "All") list = list.filter(t => t._projectId === globalProjectFilter);
    
    if (globalTimeFilter !== "All Time") {
      list = list.filter(t => 
        isDateInRange(t.createdAt) || 
        isDateInRange(t.deadline) || 
        (t.deadline && differenceInCalendarDays(new Date(t.deadline), new Date()) < 0) 
      );
    }
    if (pendingSearchQuery.trim()) {
      const query = pendingSearchQuery.toLowerCase();
      list = list.filter(t => (t.title || "").toLowerCase().includes(query));
    }
    return list;
  }, [pendingTasks, globalProjectFilter, globalTimeFilter, isDateInRange, pendingSearchQuery]);

  const globallyFilteredOverdue = useMemo(() => {
    return globallyFilteredPending.filter(t => t.deadline && differenceInCalendarDays(new Date(t.deadline), new Date()) < 0);
  }, [globallyFilteredPending]);

  // ── Chart Data Calculations ──────────────────────────────────────────────────
  const projectBarData = useMemo(() => {
    const targetProjects = globalProjectFilter === "All" ? projectsData : projectsData.filter(p => p._id === globalProjectFilter);
    return targetProjects.map(p => ({
       name: p.projectName,
       Completed: globallyFilteredCompletions.filter(c => c._projectId === p._id).length,
       Pending: globallyFilteredPending.filter(t => t._projectId === p._id).length
    })).filter(p => p.Completed > 0 || p.Pending > 0)
      .sort((a, b) => (b.Completed + b.Pending) - (a.Completed + a.Pending))
      .slice(0, 10);
  }, [projectsData, globallyFilteredCompletions, globallyFilteredPending, globalProjectFilter]);

  const priorityBarData = useMemo(() => {
    const priorities = ["Critical", "High", "Medium", "Low"];
    return priorities.map(pri => ({
        priority: pri,
        Completed: globallyFilteredCompletions.filter(c => c.priority === pri).length
    }));
  }, [globallyFilteredCompletions]);

  const dailyCompletionData = useMemo(() => {
    const groups = {};
    globallyFilteredCompletions.forEach(c => {
       const key = format(new Date(c.completedAt), "yyyy-MM-dd");
       groups[key] = (groups[key] || 0) + 1;
    });
    return Object.keys(groups).sort().map(key => ({
       date: format(new Date(key), "MMM dd"),
       Completed: groups[key]
    }));
  }, [globallyFilteredCompletions]);

  // UI Helpers
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'text-[#D1242F] bg-[#FFEBE9] border-[#FF8182]';
      case 'High': return 'text-[#BF8700] bg-[#FFF8C5] border-[#EAC54F]';
      case 'Low': return 'text-[#1A7F37] bg-[#DAFBE1] border-[#4AC26B]';
      default: return 'text-[#0969DA] bg-[#DDF4FF] border-[#54AEFF]';
    }
  };

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="bg-[#F6F8FA] min-h-screen font-sans antialiased text-[#1F2328] pb-12 flex flex-col relative">
      
      {/* ── Global Top Navbar ── */}
      <nav className="sticky top-15 z-[50] bg-white border-b border-[#D0D7DE] shadow-sm px-6 py-3 flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0969DA] text-white flex items-center justify-center font-bold text-xs">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xs font-bold leading-tight text-[#1F2328]">Developer Workspace</h1>
            <p className="text-[9px] text-[#656D76] uppercase tracking-wider font-bold">Active Assignment: {username}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#F6F8FA] p-1.5 rounded-lg border border-[#D0D7DE]">
          <div className="flex items-center gap-2 px-2 border-r border-[#D0D7DE]">
            <ClockIcon className="w-3.5 h-3.5 text-[#656D76]" />
            <select 
              value={globalTimeFilter} 
              onChange={e => setGlobalTimeFilter(e.target.value)} 
              className="bg-transparent border-none text-[11px] font-bold text-[#1F2328] outline-none cursor-pointer py-1"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="All Time">All Time</option>
              <option value="Custom">Custom Range...</option>
            </select>
          </div>

          {globalTimeFilter === "Custom" && (
            <div className="flex items-center gap-2 px-2 border-r border-[#D0D7DE] animate-fadeIn">
              <input type="date" value={globalCustomDates.start} onChange={e => setGlobalCustomDates({...globalCustomDates, start: e.target.value})} className="border border-[#D0D7DE] bg-white rounded text-[10px] px-1 py-1 outline-none font-semibold text-[#1F2328]" />
              <span className="text-[10px] text-[#656D76] font-bold">to</span>
              <input type="date" value={globalCustomDates.end} onChange={e => setGlobalCustomDates({...globalCustomDates, end: e.target.value})} className="border border-[#D0D7DE] bg-white rounded text-[10px] px-1 py-1 outline-none font-semibold text-[#1F2328]" />
            </div>
          )}

          <div className="flex items-center gap-2 px-2">
            <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-[#656D76]" />
            <select 
              value={globalProjectFilter} 
              onChange={e => setGlobalProjectFilter(e.target.value)} 
              className="bg-transparent border-none text-[11px] font-bold text-[#1F2328] outline-none cursor-pointer py-1 max-w-[180px]"
            >
              <option value="All">All Projects</option>
              {projectsData.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
            </select>
          </div>
        </div>
      </nav>

      <AddTaskModal 
        open={addTaskModalOpen} 
        onClose={() => setAddTaskModalOpen(false)} 
        projects={projectsData.filter(p => p.status !== "Closed")}
        onSuccess={handleQuickAddSuccess}
        currentUserId={currentUserId}
        currentUsername={username}
      />

      <main className="max-w-[95%] mx-auto py-6 sm:px-6 lg:px-8 space-y-6 w-full flex-1">
        
        {/* --- Metrics Overview Grid --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg border border-[#D0D7DE] flex items-center justify-between shadow-sm hover:shadow transition-shadow">
            <div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Active Projects</p>
              <p className="text-2xl font-bold text-[#1F2328] mt-1">{totalActiveProjectsCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg"><ClipboardDocumentCheckIcon className="h-5 w-5 text-[#0969DA]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg border border-[#D0D7DE] flex items-center justify-between shadow-sm hover:shadow transition-shadow">
            <div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Pending Tasks</p>
              <p className="text-2xl font-bold text-[#0969DA] mt-1">{globallyFilteredPending.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg"><ClockIcon className="h-5 w-5 text-[#0969DA]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg border border-[#D0D7DE] flex items-center justify-between shadow-sm hover:shadow transition-shadow">
            <div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-bold text-[#D1242F] mt-1">{globallyFilteredOverdue.length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg"><ExclamationCircleIcon className="h-5 w-5 text-[#D1242F]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg border border-[#D0D7DE] flex items-center justify-between shadow-sm hover:shadow transition-shadow">
            <div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Completed Tasks</p>
              <p className="text-2xl font-bold text-[#1A7F37] mt-1">{globallyFilteredCompletions.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg"><CheckBadgeIcon className="h-5 w-5 text-[#1A7F37]" /></div>
          </motion.div>
        </motion.div>

        {/* --- Primary Workspace: Pending Workspace Docket & Completions History --- */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Unified Action Work Board System */}
          <div className="xl:col-span-2 bg-white rounded-lg border border-[#D0D7DE] overflow-hidden flex flex-col shadow-sm">
            <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">My Pending Tasks</h3>
                <span className="text-[10px] text-[#656D76] font-semibold">{globallyFilteredPending.length} Tasks Scheduled</span>
              </div>
              
              <div className="flex gap-2 items-center w-full sm:w-auto">
                {/* Board Inline Search */}
                <div className="relative flex-1 sm:flex-initial">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-[#8C959F]" />
                  <input
                    type="text"
                    value={pendingSearchQuery}
                    onChange={e => setPendingSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full bg-white border border-[#D0D7DE] rounded-md py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0969DA] font-medium"
                  />
                </div>
                <button onClick={() => setAddTaskModalOpen(true)} className="flex items-center gap-1.5 bg-[#0969DA] hover:bg-[#0349B6] text-white text-xs font-bold py-2 px-3 rounded-md transition-colors shadow-sm flex-shrink-0">
                  <PlusIcon className="w-3.5 h-3.5" strokeWidth={3} /> Add Task
                </button>
              </div>
            </div>

            {/* Task Workspace List */}
            <div className="p-4 bg-[#F8F9FA] flex-1 min-h-[420px] overflow-y-auto max-h-[420px] custom-scrollbar">
              {globallyFilteredPending.length === 0 ? (
                <div className="text-center py-20 text-xs text-[#8C959F] font-medium">No pending tasks found. All caught up! 🎉</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {globallyFilteredPending.map(task => {
                    const isOverdue = task.deadline && differenceInCalendarDays(new Date(task.deadline), new Date()) < 0;
                    const isCompleting = completingTaskId === task._id;
                    const isKanbanLoading = openingKanbanId === task._projectId;

                    return (
                      <div key={task._id} className={`p-4 bg-[#FCFDFE] border border-[#D0D7DE] rounded-md shadow-sm hover:border-[#0969DA]/40 transition-colors relative flex flex-col justify-between ${isOverdue ? "border-l-4 border-l-[#D1242F]" : ""}`}>
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-xs font-bold text-[#1F2328] leading-tight block break-words">{task.title}</span>
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#656D76] font-bold block truncate mb-4">{task._projectName}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-[#EAEEF2] mt-auto">
                          <div className="flex gap-2">
                            <button 
                              disabled={isCompleting}
                              onClick={() => handleCompleteTask(task._id, task._projectId)}
                              className="flex items-center gap-1 text-[10px] font-bold text-[#1A7F37] bg-[#DAFBE1] border border-[#4AC26B]/30 hover:bg-[#c1f5cc] px-2.5 py-1 rounded transition-colors"
                            >
                              {isCompleting ? <div className="btn-spinner" /> : <CheckIcon className="w-3 h-3 text-[#1A7F37]" strokeWidth={3} />}
                              Mark As Done
                            </button>
                            
                            <button onClick={() => setCommentTask(task)} className="p-1 text-[#656D76] hover:text-[#0969DA] bg-gray-50 hover:bg-blue-50 rounded border border-[#D0D7DE] transition-colors">
                              <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            {task.deadline && (
                              <span className={`text-[9px] font-bold flex items-center ${isOverdue ? 'text-[#D1242F]' : 'text-[#656D76]'}`}>
                                {isOverdue ? 'Overdue' : format(new Date(task.deadline), "MMM d")}
                              </span>
                            )}
                            <button 
                              disabled={isKanbanLoading}
                              onClick={() => handleOpenKanban(task._projectId)}
                              className="text-[10px] text-[#0969DA] hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                            >
                              {isKanbanLoading && <div className="btn-spinner" />}
                              View Kanban
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Completed History List */}
          <div className="bg-white rounded-lg border border-[#D0D7DE] overflow-hidden flex flex-col shadow-sm">
            <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex flex-col gap-3 flex-shrink-0">
              <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">Completed History ({globallyFilteredCompletions.length})</h3>
              
              {/* Completed Inline Search */}
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-[#8C959F]" />
                <input
                  type="text"
                  value={completedSearchQuery}
                  onChange={e => setCompletedSearchQuery(e.target.value)}
                  placeholder="Search completions..."
                  className="w-full bg-white border border-[#D0D7DE] rounded-md py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0969DA] font-medium"
                />
              </div>
            </div>
            
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar flex-1 divide-y divide-[#EAEEF2]">
              {globallyFilteredCompletions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#656D76] font-medium">No completions found.</div>
              ) : (
                <>
                  {globallyFilteredCompletions.slice(0, completedVisibleCount).map((task) => (
                    <div 
                      key={task._id || task.taskId} 
                      className="p-4 hover:bg-[#F6F8FA] transition-colors cursor-pointer flex justify-between items-start gap-4" 
                      onClick={() => { setSelectedCompletedTask(task); setOpenTaskDialog(true); }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#1F2328] leading-normal break-words">{task.taskTitle || task.title}</p>
                        <p className="text-[9px] text-[#656D76] mt-0.5 uppercase tracking-wider font-bold truncate">
                          {projectsData.find(p => p._id === task._projectId)?.projectName || "N/A Project"}
                        </p>
                        <div className="flex gap-4 items-center mt-3 text-[10px] text-[#656D76] font-medium">
                          <span className="flex items-center"><ClockIcon className="w-3.5 h-3.5 mr-1" />Done {format(new Date(task.completedAt), "MMM d")}</span>
                        </div>
                      </div>
                      
                      <button className="flex items-center gap-1 border border-[#D0D7DE] bg-white hover:bg-gray-50 text-[10px] font-bold text-[#656D76] py-1 px-2 rounded transition-colors flex-shrink-0">
                        <EyeIcon className="w-3 h-3" /> View
                      </button>
                    </div>
                  ))}
                  {completedVisibleCount < globallyFilteredCompletions.length && (
                    <div className="p-3 text-center border-t border-[#D0D7DE] bg-[#F6F8FA]">
                      <button 
                        onClick={() => setCompletedVisibleCount(prev => prev + 10)}
                        className="text-xs font-bold text-[#0969DA] hover:underline"
                      >
                        Load More Completed
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* --- Visual Analysis Row (Repositioned to the footer block) --- */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-lg border border-[#D0D7DE] p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#1F2328] mb-4 uppercase tracking-wider">Completed vs Pending Assignments</h3>
            <div className="h-64 w-full">
              {projectBarData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-[#656D76]">No data matches current operations.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEEF2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} dy={10} tickFormatter={(v) => v.length > 12 ? v.substring(0,11)+"..." : v} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '6px', border: '1px solid #D0D7DE', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }} />
                    <Legend wrapperStyle={{ fontSize: '11px', pt: 10 }} />
                    <Bar dataKey="Completed" fill="#1A7F37" radius={[3, 3, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="Pending" fill="#0969DA" radius={[3, 3, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#D0D7DE] p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#1F2328] mb-4 uppercase tracking-wider">Completed Tasks Sorted By Priority</h3>
            <div className="h-64 w-full">
              {globallyFilteredCompletions.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-[#656D76]">No tasks completed within current filters.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEEF2" />
                    <XAxis dataKey="priority" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '6px', border: '1px solid #D0D7DE', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }} />
                    <Bar dataKey="Completed" fill="#BF8700" radius={[3, 3, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg border border-[#D0D7DE] p-5 shadow-sm">
             <h3 className="text-xs font-bold text-[#1F2328] mb-4 uppercase tracking-wider">Daily Completions Progress Tracker</h3>
             <div className="h-64 w-full">
               {dailyCompletionData.length === 0 ? (
                 <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-[#656D76]">
                    No completed tasks listed in this date range.
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={dailyCompletionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#8250DF" stopOpacity={0.4}/>
                         <stop offset="95%" stopColor="#8250DF" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEEF2" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} allowDecimals={false} />
                     <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '6px', border: '1px solid #D0D7DE', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }} />
                     <Area type="monotone" dataKey="Completed" stroke="#8250DF" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
                   </AreaChart>
                 </ResponsiveContainer>
               )}
             </div>
          </div>
        </motion.div>

      </main>

      {/* --- Completed Task Details Modal --- */}
      {selectedCompletedTask && (
        <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', border: '1px solid #D0D7DE', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } }}>
          <DialogTitle sx={{ bgcolor: "#F6F8FA", py: 2, px: 3, borderBottom: '1px solid #D0D7DE' }}>
            <Typography variant="span" sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#1F2328', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: T.font }}>
              Completed Task Profile
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ py: 3, px: 3, fontFamily: T.font }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <div>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, fontFamily: T.font }}>Task Title</Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1F2328', fontFamily: T.font }}>
                  {selectedCompletedTask.taskTitle || selectedCompletedTask.title}
                </Typography>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, fontFamily: T.font }}>Project Space</Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0969DA', fontFamily: T.font }}>
                    {projectsData.find(p => p._id === selectedCompletedTask._projectId)?.projectName || "N/A Project"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, fontFamily: T.font }}>Completions Metric</Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1F2328', fontFamily: T.font }}>
                    {format(new Date(selectedCompletedTask.completedAt), "MMM d, yyyy 'at' h:mm a")}
                  </Typography>
                </Box>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, fontFamily: T.font }}>Completed By</Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1F2328', fontFamily: T.font }}>
                    {selectedCompletedTask.completedBy?.username || "System Owner"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, fontFamily: T.font }}>Originally Assigned By</Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1F2328', fontFamily: T.font }}>
                    {selectedCompletedTask.assignedBy?.username || "System Assignment"}
                  </Typography>
                </Box>
              </div>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #D0D7DE', bgcolor: "#F6F8FA", px: 3 }}>
            <button onClick={() => setOpenTaskDialog(false)} className="border border-[#D0D7DE] bg-white hover:bg-gray-50 text-xs font-bold text-[#1F2328] py-1.5 px-4 rounded transition-colors">
              Close Overview
            </button>
          </DialogActions>
        </Dialog>
      )}

      {/* Comment Trigger Modal */}
      {commentTask && (
        <CommentModal
          task={commentTask}
          projectId={commentTask._projectId}
          onClose={() => setCommentTask(null)}
        />
      )}

      {/* Lazy-Loaded Fullscreen Kanban Integration */}
      {kanbanProject && (
        <Suspense fallback={
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              background: T.bgCard, padding: "20px 30px", borderRadius: T.radius,
              boxShadow: T.shadowMd, fontFamily: T.font, display: "flex", alignItems: "center", gap: 10
            }}>
              <span className="btn-spinner" style={{ color: T.accent }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Loading Kanban Board...</span>
            </div>
          </div>
        }>
          <ProjectKanban
            open={kanbanOpen}
            onClose={() => {
              setKanbanOpen(false);
              setKanbanProject(null);
              fetchDashboardData(true);
            }}
            project={kanbanProject}
          />
        </Suspense>
      )}

      {/* Scoped Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #D0D7DE; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8C959F; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .btn-spinner {
          display: inline-block;
          width: 10px;
          height: 10px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default App;