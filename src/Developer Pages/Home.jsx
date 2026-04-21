import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowUpIcon,
  UsersIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
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
} from "@mui/material";
import { Link } from "react-router-dom";
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
} from "recharts";
import { subDays, isAfter, format } from "date-fns";

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
  const [activeOneTimeProjectsCount, setActiveOneTimeProjectsCount] = useState(0);
  const [activeSubscriptionBasedProjectsCount, setActiveSubscriptionBasedProjectsCount] = useState(0);
  const [websiteBasedCount, setWebsiteBasedCount] = useState(0);
  const [totalActiveProjectsCount, setTotalActiveProjectsCount] = useState(0);
  const [projectsData, setProjectsData] = useState([]);
  
  // Task states
  const [pendingTasks, setPendingTasks] = useState([]);
  const [weeklyCompletions, setWeeklyCompletions] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // User details
  const currentUserId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "MD ASAD";

  // 1. Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${API_BASE}/api/newproject/projects/my-projects`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch projects");
        }

        const data = await response.json();
        setProjectsData(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 2. Fetch Tasks & Completions based on Projects
  useEffect(() => {
    if (!projectsData.length || !currentUserId) return;

    const fetchTasksAndCompletions = async () => {
      const token = localStorage.getItem("token");
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      
      let allPending = [];
      let allCompleted = [];
      const oneWeekAgo = subDays(new Date(), 7);

      await Promise.all(
        projectsData.map(async (p) => {
          try {
            const [tasksRes, compRes] = await Promise.all([
              axios.get(`${API_BASE}/api/tasks/${p._id}`, authHeader).catch(() => ({ data: [] })),
              axios.get(`${API_BASE}/api/tasks/${p._id}/completions`, authHeader).catch(() => ({ data: [] }))
            ]);

            // Filter pending tasks assigned to me
            const pending = tasksRes.data.filter(
              t => t.status !== "Done" && t.assignedTo?.id === currentUserId
            );
            allPending.push(...pending);

            // Filter completions done by me in the last 7 days
            const recentComps = compRes.data.filter(
              c => c.completedBy?.id === currentUserId && isAfter(new Date(c.completedAt), oneWeekAgo)
            );
            allCompleted.push(...recentComps);
          } catch (err) {
            console.error(`Failed to fetch tasks for project ${p._id}`, err);
          }
        })
      );

      // Sort pending by deadline
      allPending.sort((a, b) => new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01'));
      
      setPendingTasks(allPending);
      setWeeklyCompletions(allCompleted);
    };

    fetchTasksAndCompletions();
  }, [projectsData, currentUserId]);

  // 3. Fetch independent project counts (keeping your existing logic)
  useEffect(() => {
    const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
    
    axios.get(`${API_BASE}/api/newproject/projects/active-one-time`, authHeader)
      .then(res => setActiveOneTimeProjectsCount(res.data.length)).catch(console.error);
      
    axios.get(`${API_BASE}/api/newproject/projects/active-subscription-based`, authHeader)
      .then(res => setActiveSubscriptionBasedProjectsCount(res.data.length)).catch(console.error);
      
    axios.get(`${API_BASE}/api/newproject/projects/active-website-based`, authHeader)
      .then(res => setWebsiteBasedCount(res.data.length)).catch(console.error);
      
    axios.get(`${API_BASE}/api/newproject/projects/total-active`, authHeader)
      .then(res => setTotalActiveProjectsCount(res.data.length)).catch(console.error);
  }, []);

  // --- Chart Data Preparation ---
  const taskChartData = useMemo(() => {
    // Generate last 7 days array
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push({
        date: format(subDays(new Date(), i), "MMM dd"),
        tasks: 0,
      });
    }
    // Count completions per day
    weeklyCompletions.forEach((c) => {
      const dateStr = format(new Date(c.completedAt), "MMM dd");
      const dayObj = days.find((d) => d.date === dateStr);
      if (dayObj) dayObj.tasks += 1;
    });
    return days;
  }, [weeklyCompletions]);

  const projectDistributionData = [
    { name: "One-Time", value: activeOneTimeProjectsCount, color: "#4F46E5" },
    { name: "Subscription", value: activeSubscriptionBasedProjectsCount, color: "#F97316" },
    { name: "Website", value: websiteBasedCount, color: "#10B981" },
  ].filter(d => d.value > 0);

  // UI Helpers
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-red-100 text-red-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-900 pb-12">

      <main className="max-w-[90%] mx-auto py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* --- Top Metrics Grid --- */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Active Projects */}
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalActiveProjectsCount}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-sm">
              <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </motion.div>

          {/* Pending Tasks */}
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">My Pending Tasks</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{pendingTasks.length}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-sm">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
          </motion.div>

          {/* Weekly Completions */}
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed This Week</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{weeklyCompletions.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-sm">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </motion.div>

          {/* Website Projects */}
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-sm shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Website Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{websiteBasedCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-sm">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
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
          <div className="lg:col-span-2 bg-white rounded-sm shadow-sm border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Tasks Completed (Last 7 Days)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="tasks" fill="#4F46E5" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Project Distribution */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 mb-2">My Active Project Mix</h3>
            {projectDistributionData.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {projectDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {projectDistributionData.map((item, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-600">
                      <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                      {item.name} ({item.value})
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                No active projects
              </div>
            )}
          </div>
        </motion.div>

        {/* --- Tables Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        >
          
          {/* Assigned Projects Table */}
          <div className="xl:col-span-2 bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-900">Projects Assigned To Me</h3>
            </div>
            <div className="overflow-x-auto flex-1 max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500 animate-pulse">
                        Loading projects...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-8 text-center text-sm text-red-500">{error}</td>
                    </tr>
                  ) : projectsData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500">No projects assigned</td>
                    </tr>
                  ) : (
                    projectsData.map((project, index) => (
                      <tr
                        key={project._id || index}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedProject(project);
                          setOpenDialog(true);
                        }}
                      >
                        <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-indigo-600">{project.projectName}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">{project.clientName}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{project.subscriptionType}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-semibold rounded-sm uppercase tracking-wide ${getStatusStyles(project.status)}`}>
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
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-900">Pending Tasks</h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs py-0.5 px-2 rounded-sm font-medium">
                {pendingTasks.length} left
              </span>
            </div>
            <div className="p-0 max-h-[400px] overflow-y-auto">
              {pendingTasks.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">You're all caught up!</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {pendingTasks.map((task) => (
                    <li key={task._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate pr-3">{task.title}</p>
                        <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-sm">
                          {task.status}
                        </span>
                        {task.deadline && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {format(new Date(task.deadline), "MMM d")}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </motion.div>
      </main>

      {/* --- Project Details Dialog --- */}
      {selectedProject && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '6px' } }}>
          <DialogTitle sx={{ bgcolor: "grey.50", py: 2, borderBottom: '1px solid #E5E7EB' }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 600, color: '#111827' }}>
              {selectedProject.projectName}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 700 }}>
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
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 700 }}>
                    Upsale Data
                  </Typography>
                  <List sx={{ bgcolor: "grey.50", borderRadius: 1, p: 1, border: '1px solid #E5E7EB' }}>
                    {selectedProject.upsaleData.map((upsale, index) => (
                      <ListItem key={index} sx={{ flexDirection: "column", alignItems: "flex-start", py: 1.5, bgcolor: "white", borderRadius: 1, mb: index < selectedProject.upsaleData.length - 1 ? 1 : 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
                        <ListItemText primaryTypographyProps={{ variant: "subtitle2", color: "textPrimary" }} primary={`Service Type: ${upsale.serviceType || "N/A"}`} />
                        <ListItemText primaryTypographyProps={{ variant: "body2", color: "textSecondary" }} primary={`Details: ${upsale.details || "N/A"}`} />
                        <ListItemText primaryTypographyProps={{ variant: "body2", color: "textSecondary" }} primary={`Comments: ${upsale.comments || "N/A"}`} />
                        <ListItemText primaryTypographyProps={{ variant: "body2", color: "textSecondary" }} primary={`Date: ${upsale.date ? new Date(upsale.date).toLocaleDateString() : "N/A"}`} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB', bgcolor: "grey.50" }}>
            <Button onClick={() => setOpenDialog(false)} variant="outlined" sx={{ textTransform: 'none', borderRadius: '4px' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default App;