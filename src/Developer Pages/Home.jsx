import React, { useEffect, useState, useMemo } from "react";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip
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
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { subDays, isAfter, format, differenceInCalendarDays, startOfMonth } from "date-fns";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function App() {
  // Project states
  const [totalActiveProjectsCount, setTotalActiveProjectsCount] = useState(0);
  const [projectsData, setProjectsData] = useState([]);
  
  // Task states
  const [pendingTasks, setPendingTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  // User details
  const currentUserId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "Developer";

  // Consolidated Data Fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        
        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Projects exactly how OneTime.jsx does it & Fetch Active Counts
        const [projectsRes, totalRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/newproject/projects`, authHeader),
          axios.get(`${API_BASE}/api/newproject/projects/total-active`, authHeader)
        ]);

        let fetchedProjects = [];

        if (projectsRes.status === "fulfilled") {
          const allProjects = Array.isArray(projectsRes.value.data) ? projectsRes.value.data : [];
          // Filter to only projects where the developer is assigned (same as OneTime.jsx)
          fetchedProjects = allProjects.filter(p =>
            (p.assignedDeveloper || []).some(
              d => d.id && currentUserId && d.id.toString() === currentUserId.toString()
            )
          );
          setProjectsData(fetchedProjects);
        } else {
          throw new Error(projectsRes.reason?.message || "Error fetching projects");
        }

        if (totalRes.status === "fulfilled") setTotalActiveProjectsCount(totalRes.value.data.length);

        // 2. Fetch Tasks & Completions based on fetched projects
        if (fetchedProjects.length > 0 && currentUserId) {
          let allPending = [];
          let allCompletedList = [];

          await Promise.all(
            fetchedProjects.map(async (p) => {
              try {
                const [tasksRes, compRes] = await Promise.all([
                  axios.get(`${API_BASE}/api/tasks/${p._id}`, authHeader).catch(() => ({ data: [] })),
                  axios.get(`${API_BASE}/api/tasks/${p._id}/completions`, authHeader).catch(() => ({ data: [] }))
                ]);

                // Filter pending tasks safely using .toString() on the ID
                const pending = tasksRes.data.filter(
                  t => t.status !== "Done" && t.assignedTo?.id?.toString() === currentUserId?.toString()
                );
                allPending.push(...pending);

                // Filter completions safely using .toString() on the ID
                const myCompletions = compRes.data.filter(
                  c => c.completedBy?.id?.toString() === currentUserId?.toString()
                );
                allCompletedList.push(...myCompletions);
              } catch (err) {
                console.error(`Failed to fetch tasks for project ${p._id}`, err);
              }
            })
          );

          // Calculate Overdue Logic (Deadline is End of Day)
          const overdue = allPending.filter(t => {
            if (!t.deadline) return false;
            return differenceInCalendarDays(new Date(t.deadline), new Date()) < 0;
          });
          
          // Sort pending by deadline
          allPending.sort((a, b) => new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01'));
          // Sort completions by newest first
          allCompletedList.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
          
          setPendingTasks(allPending);
          setOverdueTasks(overdue);
          setAllCompletions(allCompletedList);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUserId]);

  // --- Chart Data Preparation ---
  
  // 1. Bar Chart: Last 7 Days Completions
  const taskChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push({
        date: format(subDays(new Date(), i), "MMM dd"),
        tasks: 0,
      });
    }
    allCompletions.forEach((c) => {
      const dateStr = format(new Date(c.completedAt), "MMM dd");
      const dayObj = days.find((d) => d.date === dateStr);
      if (dayObj) dayObj.tasks += 1;
    });
    return days;
  }, [allCompletions]);

  // 2. Pie Chart: Completions by Priority
  const priorityDistributionData = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    allCompletions.forEach(c => {
      const p = c.priority || 'Medium';
      if (counts[p] !== undefined) counts[p]++;
    });

    return [
      { name: "Critical", value: counts.Critical, color: "#DC2626" }, // Red
      { name: "High", value: counts.High, color: "#EA580C" },       // Orange
      { name: "Medium", value: counts.Medium, color: "#2563EB" },     // Blue
      { name: "Low", value: counts.Low, color: "#16A34A" },         // Green
    ].filter(d => d.value > 0);
  }, [allCompletions]);

  // General Metrics
  const completionsThisMonth = useMemo(() => {
    const startOfCurrentMonth = startOfMonth(new Date());
    return allCompletions.filter(c => isAfter(new Date(c.completedAt), startOfCurrentMonth)).length;
  }, [allCompletions]);

  // UI Helpers
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800 border border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "completed": return "bg-blue-100 text-blue-800 border border-blue-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'High': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  // --- Loader Screen ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="w-10 h-10 border-4 border-[#EBECF0] border-t-[#0969DA] rounded-full animate-spin"></div>
        <p className="mt-4 text-[#5E6C84] text-sm font-medium animate-pulse">Loading developer dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F8FA] min-h-screen font-sans antialiased text-[#1F2328] pb-12">

      <main className="max-w-[95%] mx-auto py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* --- Top Metrics Grid --- */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Active Projects */}
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between transition-shadow hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Active Projects</p>
              <p className="text-2xl font-base text-[#1F2328] mt-1">{totalActiveProjectsCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-[#0969DA]" />
            </div>
          </motion.div>

          {/* Pending Tasks */}
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between transition-shadow hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Pending Tasks</p>
              <p className="text-2xl font-base text-[#0969DA] mt-1">{pendingTasks.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-[#0969DA]" />
            </div>
          </motion.div>

          {/* Overdue Tasks */}
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between transition-shadow hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Overdue Tasks</p>
              <p className="text-2xl font-base text-[#D1242F] mt-1">{overdueTasks.length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <ExclamationCircleIcon className="h-6 w-6 text-[#D1242F]" />
            </div>
          </motion.div>

          {/* Completions This Month */}
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between transition-shadow hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Completed (This Month)</p>
              <p className="text-2xl font-base text-[#1A7F37] mt-1">{completionsThisMonth}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckBadgeIcon className="h-6 w-6 text-[#1A7F37]" />
            </div>
          </motion.div>
        </motion.div>

        {/* --- Charts Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Bar Chart: Tasks Completed */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5">
            <h3 className="text-sm font-bold text-[#1F2328] mb-4 uppercase tracking-wider">Tasks Completed (Last 7 Days)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '8px', border: '1px solid #D0D7DE', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="tasks" fill="#0969DA" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Completions by Priority */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5 flex flex-col">
            <h3 className="text-sm font-bold text-[#1F2328] mb-2 uppercase tracking-wider">Completed By Priority</h3>
            {priorityDistributionData.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {priorityDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #D0D7DE', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#656D76' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-[#656D76]">
                No completed tasks yet.
              </div>
            )}
          </div>
        </motion.div>

        {/* --- Layout: Projects & Tasks --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        >
          
          {/* Assigned Projects Table (Spans 2 columns) */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Projects Assigned To Me</h3>
            </div>
            <div className="overflow-x-auto flex-1 max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-[#D0D7DE]">
                <thead className="bg-white sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D0D7DE]">Project</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D0D7DE]">Client</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D0D7DE]">Type</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D0D7DE]">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {error ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-8 text-center text-sm text-red-500">{error}</td>
                    </tr>
                  ) : projectsData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-8 text-center text-sm text-[#656D76]">No projects assigned</td>
                    </tr>
                  ) : (
                    projectsData.map((project, index) => (
                      <tr
                        key={project._id || index}
                        className="hover:bg-[#F6F8FA] transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedProject(project);
                          setOpenProjectDialog(true);
                        }}
                      >
                        <td className="px-5 py-3 whitespace-nowrap text-sm font-bold text-[#0969DA]">{project.projectName}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-[#1F2328]">{project.clientName}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-[#656D76] capitalize">{project.subscriptionType}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase tracking-wider ${getStatusStyles(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Tasks List */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Pending Tasks</h3>
              <span className="bg-[#DDF4FF] text-[#0969DA] border border-[#0969DA] border-opacity-20 text-[10px] py-0.5 px-2 rounded-full font-bold uppercase">
                {pendingTasks.length} pending
              </span>
            </div>
            <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
              {pendingTasks.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#656D76] font-medium">You're all caught up! 🎉</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {pendingTasks.map((task) => {
                    const isOverdue = task.deadline && differenceInCalendarDays(new Date(task.deadline), new Date()) < 0;
                    return (
                      <li key={task._id} className={`p-4 hover:bg-[#F6F8FA] transition-colors ${isOverdue ? 'border-l-4 border-l-[#D1242F]' : ''}`}>
                        <div className="flex justify-between items-start mb-1.5">
                          <p className="text-sm font-bold text-[#1F2328] truncate pr-3">{task.title}</p>
                          <span className={`flex-shrink-0 text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[11px] font-bold text-[#656D76] bg-[#EAEEF2] px-2 py-1 rounded-md uppercase tracking-wider">
                            {task.status}
                          </span>
                          {task.deadline && (
                            <span className={`text-[11px] font-bold flex items-center ${isOverdue ? 'text-[#D1242F]' : 'text-[#656D76]'}`}>
                              <ClockIcon className="w-3.5 h-3.5 mr-1" />
                              {isOverdue ? 'Overdue' : format(new Date(task.deadline), "MMM d")}
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </motion.div>

        {/* --- Recent Completions --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Recently Completed Tasks</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            {allCompletions.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#656D76] font-medium">No tasks completed yet.</div>
            ) : (
              <table className="min-w-full divide-y divide-[#D0D7DE]">
                <thead className="bg-white">
                  <tr>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider">Task Title</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider">Priority</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider">Completed At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {allCompletions.slice(0, 5).map((comp) => (
                    <tr 
                      key={comp._id} 
                      className="hover:bg-[#F6F8FA] transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCompletedTask(comp);
                        setOpenTaskDialog(true);
                      }}
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <CheckBadgeIcon className="w-5 h-5 text-[#1A7F37] mr-2" />
                          <span className="text-sm font-semibold text-[#1F2328]">{comp.taskTitle}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold border rounded-full uppercase tracking-wider ${getPriorityColor(comp.priority)}`}>
                          {comp.priority || "Medium"}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-sm text-[#656D76]">
                        {format(new Date(comp.completedAt), "MMM d, yyyy · h:mm a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

      </main>

      {/* --- Project Details Dialog --- */}
      {selectedProject && (
        <Dialog open={openProjectDialog} onClose={() => setOpenProjectDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
          <DialogTitle sx={{ bgcolor: "#F6F8FA", py: 2, borderBottom: '1px solid #D0D7DE' }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: '#1F2328', fontFamily: "'DM Sans', sans-serif" }}>
              {selectedProject.projectName}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ py: 3, fontFamily: "'DM Sans', sans-serif" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography variant="subtitle2" sx={{ color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 800 }}>
                Project Overview
              </Typography>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Client Name" value={selectedProject.clientName || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
                <TextField label="Client Email" value={selectedProject.clientEmail || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
                <TextField label="Subscription Type" value={selectedProject.subscriptionType || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
                <TextField label="Status" value={selectedProject.status || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
                <TextField label="Business Niche" value={selectedProject.businessNiche || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
                <TextField label="Reference Site" value={selectedProject.referenceSite || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
              </div>

              <TextField label="Description" value={selectedProject.projectDetails || "N/A"} fullWidth InputProps={{ readOnly: true }} multiline minRows={2} variant="outlined" size="small" />
              <TextField label="Comments" value={selectedProject.comments || "N/A"} fullWidth InputProps={{ readOnly: true }} multiline minRows={2} variant="outlined" size="small" />

              {selectedProject.upSale && selectedProject.upsaleData?.length > 0 && (
                <>
                  <Divider sx={{ my: 1, borderColor: '#D0D7DE' }} />
                  <Typography variant="subtitle2" sx={{ color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 800 }}>
                    Upsale Data
                  </Typography>
                  <List sx={{ bgcolor: "#F6F8FA", borderRadius: 2, p: 1, border: '1px solid #D0D7DE' }}>
                    {selectedProject.upsaleData.map((upsale, index) => (
                      <ListItem key={index} sx={{ flexDirection: "column", alignItems: "flex-start", py: 1.5, bgcolor: "white", borderRadius: 1.5, mb: index < selectedProject.upsaleData.length - 1 ? 1 : 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #D0D7DE' }}>
                        <ListItemText primaryTypographyProps={{ variant: "subtitle2", color: "textPrimary", fontWeight: 700 }} primary={`Service Type: ${upsale.serviceType || "N/A"}`} />
                        <ListItemText primaryTypographyProps={{ variant: "body2", sx: { color: '#656D76', mt: 0.5 } }} primary={`Details: ${upsale.details || "N/A"}`} />
                        <ListItemText primaryTypographyProps={{ variant: "body2", sx: { color: '#656D76', mt: 0.5 } }} primary={`Comments: ${upsale.comments || "N/A"}`} />
                        <ListItemText primaryTypographyProps={{ variant: "body2", sx: { color: '#656D76', mt: 0.5, fontWeight: 600 } }} primary={`Date: ${upsale.date ? new Date(upsale.date).toLocaleDateString() : "N/A"}`} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #D0D7DE', bgcolor: "#F6F8FA" }}>
            <Button onClick={() => setOpenProjectDialog(false)} variant="outlined" sx={{ textTransform: 'none', borderRadius: '6px', color: '#1F2328', borderColor: '#D0D7DE', fontWeight: 600 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* --- Completed Task Details Dialog --- */}
      {selectedCompletedTask && (
        <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
          <DialogTitle sx={{ bgcolor: "#F6F8FA", py: 2, borderBottom: '1px solid #D0D7DE', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckBadgeIcon className="w-6 h-6 text-[#1A7F37]" />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: '#1F2328', fontFamily: "'DM Sans', sans-serif" }}>
              Completed Task
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ py: 4, fontFamily: "'DM Sans', sans-serif" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Task Title</Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1F2328' }}>{selectedCompletedTask.taskTitle}</Typography>
              </Box>

              <div className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Priority</Typography>
                  <Chip 
                    label={selectedCompletedTask.priority || "Medium"} 
                    size="small"
                    sx={{ 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      ...(selectedCompletedTask.priority === 'Critical' && { bgcolor: '#FFEBE9', color: '#D1242F', border: '1px solid #FF8182' }),
                      ...(selectedCompletedTask.priority === 'High' && { bgcolor: '#FFF8C5', color: '#BF8700', border: '1px solid #EAC54F' }),
                      ...(selectedCompletedTask.priority === 'Medium' && { bgcolor: '#DDF4FF', color: '#0969DA', border: '1px solid #54AEFF' }),
                      ...(selectedCompletedTask.priority === 'Low' && { bgcolor: '#DAFBE1', color: '#1A7F37', border: '1px solid #4AC26B' }),
                    }} 
                  />
                </Box>
                
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Completed At</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2328' }}>
                    {format(new Date(selectedCompletedTask.completedAt), "MMM d, yyyy · h:mm a")}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Completed By</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2328' }}>
                    {selectedCompletedTask.completedBy?.username || "Unknown"}
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
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Scoped Custom Scrollbar Styles for the tables/lists */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #D0D7DE;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #8C959F;
        }
      `}</style>
    </div>
  );
}

export default App;