import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  PlusIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  isAfter, format, differenceInCalendarDays, startOfMonth, 
  isToday, isYesterday, isThisWeek, isThisMonth, subMonths, 
  isWithinInterval, startOfDay, endOfDay 
} from "date-fns";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Framer Motion variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ── Skeleton Loaders ───────────────────────────────────────────────────────────
const SkeletonDashboard = () => (
  <div className="min-h-screen bg-[#F6F8FA] flex flex-col">
    <div className="h-16 bg-white border-b border-[#D0D7DE] w-full animate-pulse"></div>
    <div className="p-8 max-w-[95%] mx-auto space-y-6 w-full flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="bg-white h-80 rounded-lg border border-[#D0D7DE]"></div>
        <div className="bg-white h-80 rounded-lg border border-[#D0D7DE]"></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse mt-6">
        <div className="xl:col-span-2 bg-white h-96 rounded-lg border border-[#D0D7DE]"></div>
        <div className="bg-white h-96 rounded-lg border border-[#D0D7DE]"></div>
      </div>
    </div>
  </div>
);

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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
        <div className="px-5 py-4 border-b border-[#D0D7DE] flex justify-between items-center bg-[#F6F8FA]">
          <h2 className="text-lg font-bold text-[#1F2328]">Create New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#656D76] uppercase tracking-wider mb-1">Project</label>
            <select required value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2.5 text-sm outline-none focus:border-[#0969DA] bg-white">
               {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#656D76] uppercase tracking-wider mb-1">Title</label>
            <input required autoFocus value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2.5 text-sm outline-none focus:border-[#0969DA]" placeholder="What needs to be done?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#656D76] uppercase tracking-wider mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2.5 text-sm outline-none focus:border-[#0969DA] bg-white">
                 <option value="Low">Low</option>
                 <option value="Medium">Medium</option>
                 <option value="High">High</option>
                 <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#656D76] uppercase tracking-wider mb-1">Deadline</label>
              <input required type="date" min={new Date().toISOString().split('T')[0]} value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2.5 text-sm outline-none focus:border-[#0969DA]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#656D76] uppercase tracking-wider mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2.5 text-sm outline-none focus:border-[#0969DA]" rows="3" placeholder="Add context or criteria..."></textarea>
          </div>
          <div className="pt-3 flex justify-end gap-3 border-t border-[#D0D7DE] mt-4">
             <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-[#656D76] border border-[#D0D7DE] rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
             <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-bold text-white bg-[#0969DA] rounded-md hover:bg-[#0349B6] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
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

  // Core Data States
  const [totalActiveProjectsCount, setTotalActiveProjectsCount] = useState(0);
  const [projectsData, setProjectsData] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]);
  
  // UI & Pagination States
  const [loading, setLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [pendingVisibleCount, setPendingVisibleCount] = useState(10);
  const [completedVisibleCount, setCompletedVisibleCount] = useState(10);

  // Detail Modal States
  const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  // Reset pagination when filters change
  useEffect(() => { 
    setPendingVisibleCount(10); 
    setCompletedVisibleCount(10);
  }, [globalTimeFilter, globalProjectFilter, globalCustomDates]);

  // ── Data Fetching & Local Storage Caching ────────────────────────────────────
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };

      // THE FIX: ONE SINGLE PARALLEL REQUEST
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

      // Update State
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
    // Attempt to load from cache first for instant UI response
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setProjectsData(parsed.projectsData || []);
        setTotalActiveProjectsCount(parsed.totalActiveProjectsCount || 0);
        setPendingTasks(parsed.pendingTasks || []);
        setAllCompletions(parsed.allCompletions || []);
        setLoading(false);
        // Silently fetch to sync any background updates
        fetchDashboardData(true); 
      } catch (e) {
        fetchDashboardData();
      }
    } else {
      fetchDashboardData();
    }
  }, [fetchDashboardData, CACHE_KEY]);

  // ── Optimistic Actions ───────────────────────────────────────────────────────
  const handleCompleteTask = async (taskId, projectId) => {
    setCompletingTaskId(taskId);
    
    // 1. Optimistic UI Update (Instant)
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

    // 2. Background API Sync
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

  // Apply Global Filters across all data arrays
  const globallyFilteredCompletions = useMemo(() => {
    let list = allCompletions;
    if (globalProjectFilter !== "All") list = list.filter(c => c._projectId === globalProjectFilter);
    return list.filter(c => isDateInRange(c.completedAt));
  }, [allCompletions, globalProjectFilter, isDateInRange]);

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
    return list;
  }, [pendingTasks, globalProjectFilter, globalTimeFilter, isDateInRange]);

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

  // UI Helper
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
          <div className="w-8 h-8 rounded-full bg-[#0969DA] text-white flex items-center justify-center font-bold text-sm">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Developer Home</h1>
            <p className="text-[10px] text-[#656D76] uppercase tracking-wider font-semibold">Welcome back, {username}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-[#F6F8FA] p-1.5 rounded-lg border border-[#D0D7DE]">
          <div className="flex items-center gap-2 px-2 border-r border-[#D0D7DE]">
            <ClockIcon className="w-4 h-4 text-[#656D76]" />
            <select 
              value={globalTimeFilter} 
              onChange={e => setGlobalTimeFilter(e.target.value)} 
              className="bg-transparent border-none text-xs font-bold text-[#1F2328] outline-none cursor-pointer py-1"
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
            <div className="flex items-center gap-2 px-2 border-r border-[#D0D7DE]">
              <input type="date" value={globalCustomDates.start} onChange={e => setGlobalCustomDates({...globalCustomDates, start: e.target.value})} className="border border-[#D0D7DE] bg-white rounded text-[10px] px-1 py-1 outline-none font-semibold" />
              <span className="text-[10px] text-[#656D76] font-bold">to</span>
              <input type="date" value={globalCustomDates.end} onChange={e => setGlobalCustomDates({...globalCustomDates, end: e.target.value})} className="border border-[#D0D7DE] bg-white rounded text-[10px] px-1 py-1 outline-none font-semibold" />
            </div>
          )}

          <div className="flex items-center gap-2 px-2">
            <ClipboardDocumentCheckIcon className="w-4 h-4 text-[#656D76]" />
            <select 
              value={globalProjectFilter} 
              onChange={e => setGlobalProjectFilter(e.target.value)} 
              className="bg-transparent border-none text-xs font-bold text-[#1F2328] outline-none cursor-pointer py-1 max-w-[200px]"
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

      <main className="max-w-[95%] mx-auto py-8 sm:px-6 lg:px-8 space-y-6 w-full flex-1">
        
        {/* --- Top Metrics Grid --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Active Projects</p>
              <p className="text-2xl font-base text-[#1F2328] mt-1">{totalActiveProjectsCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg"><ClipboardDocumentCheckIcon className="h-6 w-6 text-[#0969DA]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Pending (Filtered)</p>
              <p className="text-2xl font-base text-[#0969DA] mt-1">{globallyFilteredPending.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg"><ClockIcon className="h-6 w-6 text-[#0969DA]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-base text-[#D1242F] mt-1">{globallyFilteredOverdue.length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg"><ExclamationCircleIcon className="h-6 w-6 text-[#D1242F]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Completed (Filtered)</p>
              <p className="text-2xl font-base text-[#1A7F37] mt-1">{globallyFilteredCompletions.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg"><CheckBadgeIcon className="h-6 w-6 text-[#1A7F37]" /></div>
          </motion.div>
        </motion.div>

        {/* --- Bar Charts Section --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5">
            <h3 className="text-sm font-bold text-[#1F2328] mb-4 uppercase tracking-wider">Completed vs Pending (Filtered)</h3>
            <div className="h-64 w-full">
              {projectBarData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-[#656D76]">No data for selected filters.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#656D76' }} dy={10} tickFormatter={(v) => v.length > 12 ? v.substring(0,12)+"..." : v} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '8px', border: '1px solid #D0D7DE', fontWeight: 600 }} />
                    <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                    <Bar dataKey="Completed" fill="#1A7F37" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Pending" fill="#0969DA" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5">
            <h3 className="text-sm font-bold text-[#1F2328] mb-4 uppercase tracking-wider">Completed Grouped by Priority</h3>
            <div className="h-64 w-full">
              {globallyFilteredCompletions.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-[#656D76]">No completed tasks found.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="priority" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '8px', border: '1px solid #D0D7DE', fontWeight: 600 }} />
                    <Bar dataKey="Completed" fill="#BF8700" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Daily Completions Timeline (Filtered)</h3>
             </div>
             <div className="h-64 w-full">
               {dailyCompletionData.length === 0 ? (
                 <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-[#656D76]">
                    No completed tasks found in this date range.
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={dailyCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#656D76' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} allowDecimals={false} />
                     <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '8px', border: '1px solid #D0D7DE', fontWeight: 600 }} />
                     <Bar dataKey="Completed" fill="#8250DF" radius={[4, 4, 0, 0]} maxBarSize={30} />
                   </BarChart>
                 </ResponsiveContainer>
               )}
             </div>
          </div>
        </motion.div>

        {/* --- Layout: Completed Tasks & Action Center --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Completed History (Filtered)</h3>
            </div>
            <div className="p-0 max-h-[450px] overflow-y-auto custom-scrollbar flex-1">
              {globallyFilteredCompletions.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#656D76] font-medium">No completed tasks match your filters.</div>
              ) : (
                <>
                  <ul className="divide-y divide-gray-100">
                    {globallyFilteredCompletions.slice(0, completedVisibleCount).map((task) => (
                      <li 
                        key={task._id || task.taskId} 
                        className="p-4 hover:bg-[#F6F8FA] transition-colors cursor-pointer" 
                        onClick={() => { setSelectedCompletedTask(task); setOpenTaskDialog(true); }}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <p className="text-sm font-bold text-[#1F2328] leading-tight">{task.taskTitle || task.title}</p>
                            <p className="text-[10px] text-[#656D76] mt-1 uppercase tracking-wider font-semibold">
                              {projectsData.find(p => p._id === task._projectId)?.projectName || "Unknown Project"}
                            </p>
                          </div>
                          <span className="flex-shrink-0 text-[10px] bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Completed
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-[11px] text-[#656D76] font-medium flex items-center">
                             <ClockIcon className="w-3 h-3 mr-1" /> 
                             Done on {format(new Date(task.completedAt), "MMM d, yyyy h:mm a")}
                          </div>
                          <div className="text-[11px] font-bold text-[#1F2328]">
                             By: {task.completedBy?.username || username}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {completedVisibleCount < globallyFilteredCompletions.length && (
                    <div className="p-3 text-center border-t border-[#D0D7DE]">
                      <button 
                        onClick={() => setCompletedVisibleCount(prev => prev + 10)}
                        className="text-xs font-bold text-[#0969DA] hover:underline"
                      >
                        Load More Completed Tasks...
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Action Center (Filtered)</h3>
                <span className="bg-[#DDF4FF] text-[#0969DA] border border-[#54AEFF] text-[10px] py-0.5 px-2 rounded-full font-bold uppercase">{globallyFilteredPending.length} pending</span>
              </div>
              <button onClick={() => setAddTaskModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-[#0969DA] hover:bg-[#0349B6] text-white text-sm font-bold py-2 rounded-md transition-colors">
                <PlusIcon className="w-4 h-4 text-white font-bold" strokeWidth={3} /> Add New Task
              </button>
            </div>
            <div className="p-0 max-h-[385px] overflow-y-auto custom-scrollbar flex-1">
              {globallyFilteredPending.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#656D76] font-medium">You're all caught up for this period! 🎉</div>
              ) : (
                <>
                  <ul className="divide-y divide-gray-100">
                    {globallyFilteredPending.slice(0, pendingVisibleCount).map((task) => {
                      const isOverdue = task.deadline && differenceInCalendarDays(new Date(task.deadline), new Date()) < 0;
                      const isCompleting = completingTaskId === task._id;
                      
                      return (
                        <li key={task._id} className={`p-4 hover:bg-[#F6F8FA] transition-colors ${isOverdue ? 'border-l-4 border-l-[#D1242F]' : ''}`}>
                          <div className="flex justify-between items-start mb-1.5">
                            <div>
                              <p className="text-sm font-bold text-[#1F2328] leading-tight">{task.title}</p>
                              <p className="text-[10px] text-[#656D76] mt-1 uppercase tracking-wider font-semibold">{task._projectName}</p>
                            </div>
                            <span className={`flex-shrink-0 text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <button 
                              disabled={isCompleting}
                              onClick={() => handleCompleteTask(task._id, task._projectId)}
                              className="flex items-center justify-center gap-1 min-w-[90px] text-[11px] font-bold text-[#1A7F37] bg-[#DAFBE1] hover:bg-[#c1f5cc] px-2 py-1.5 border border-[#4AC26B] rounded-md transition-colors disabled:opacity-50"
                            >
                              {isCompleting ? (
                                <div className="w-3 h-3 border-2 border-[#1A7F37] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <><CheckIcon className="w-3.5 h-3.5" strokeWidth={3} /> Mark Done</>
                              )}
                            </button>
                            {task.deadline && (
                              <span className={`text-[10px] font-bold flex items-center ${isOverdue ? 'text-[#D1242F]' : 'text-[#656D76]'}`}>
                                <ClockIcon className="w-3 h-3 mr-1" />
                                {isOverdue ? 'Overdue' : format(new Date(task.deadline), "MMM d")}
                              </span>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  {pendingVisibleCount < globallyFilteredPending.length && (
                    <div className="p-3 text-center border-t border-[#D0D7DE]">
                      <button 
                        onClick={() => setPendingVisibleCount(prev => prev + 10)}
                        className="text-xs font-bold text-[#0969DA] hover:underline"
                      >
                        Load More Pending Tasks...
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

      </main>

      {/* --- Completed Task Details Modal --- */}
      {selectedCompletedTask && (
        <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
          <DialogTitle sx={{ bgcolor: "#F6F8FA", py: 2, borderBottom: '1px solid #D0D7DE' }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: '#1F2328', fontFamily: "'DM Sans', sans-serif" }}>
              Completed Task Details
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ py: 3, fontFamily: "'DM Sans', sans-serif" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Task Title</Typography>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2328' }}>
                  {selectedCompletedTask.taskTitle || selectedCompletedTask.title}
                </Typography>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Project</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0969DA' }}>
                    {projectsData.find(p => p._id === selectedCompletedTask._projectId)?.projectName || "Unknown Project"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Completed At</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2328' }}>
                    {format(new Date(selectedCompletedTask.completedAt), "MMM d, yyyy 'at' h:mm a")}
                  </Typography>
                </Box>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Completed By</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2328' }}>
                    {selectedCompletedTask.completedBy?.username || "System/Unknown"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Originally Assigned By</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2328' }}>
                    {selectedCompletedTask.assignedBy?.username || "System/Unknown"}
                  </Typography>
                </Box>
              </div>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #D0D7DE', bgcolor: "#F6F8FA" }}>
            <Button onClick={() => setOpenTaskDialog(false)} variant="outlined" sx={{ textTransform: 'none', borderRadius: '6px', color: '#1F2328', borderColor: '#D0D7DE', fontWeight: 600 }}>
              Close Details
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Scoped Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #D0D7DE; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8C959F; }
      `}</style>
    </div>
  );
}

export default App;