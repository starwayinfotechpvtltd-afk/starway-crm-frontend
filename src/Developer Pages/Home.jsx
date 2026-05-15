// import React, { useEffect, useState, useMemo } from "react";
// import {
//   CurrencyDollarIcon,
//   ChartBarIcon,
//   ClipboardDocumentCheckIcon,
//   ClockIcon,
//   ExclamationCircleIcon,
//   CheckBadgeIcon
// } from "@heroicons/react/24/outline";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Typography,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   Box,
//   Chip
// } from "@mui/material";
// import axios from "axios";
// import { motion } from "framer-motion";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend
// } from "recharts";
// import { subDays, isAfter, format, differenceInCalendarDays, startOfMonth } from "date-fns";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// // Framer Motion variants
// const containerVariants = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.1 },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 15 },
//   show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
// };

// function App() {
//   // Project states
//   const [totalActiveProjectsCount, setTotalActiveProjectsCount] = useState(0);
//   const [projectsData, setProjectsData] = useState([]);
  
//   // Task states
//   const [pendingTasks, setPendingTasks] = useState([]);
//   const [overdueTasks, setOverdueTasks] = useState([]);
//   const [allCompletions, setAllCompletions] = useState([]);
  
//   // UI states
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [openProjectDialog, setOpenProjectDialog] = useState(false);
//   const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
//   const [openTaskDialog, setOpenTaskDialog] = useState(false);

//   // User details
//   const currentUserId = localStorage.getItem("userId");
//   const username = localStorage.getItem("username") || "Developer";

//   // Consolidated Data Fetching
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) throw new Error("No authentication token found");
        
//         const authHeader = { headers: { Authorization: `Bearer ${token}` } };

//         // 1. Fetch Projects exactly how OneTime.jsx does it & Fetch Active Counts
//         const [projectsRes, totalRes] = await Promise.allSettled([
//           axios.get(`${API_BASE}/api/newproject/projects`, authHeader),
//           axios.get(`${API_BASE}/api/newproject/projects/total-active`, authHeader)
//         ]);

//         let fetchedProjects = [];

//         if (projectsRes.status === "fulfilled") {
//           const allProjects = Array.isArray(projectsRes.value.data) ? projectsRes.value.data : [];
//           // Filter to only projects where the developer is assigned (same as OneTime.jsx)
//           fetchedProjects = allProjects.filter(p =>
//             (p.assignedDeveloper || []).some(
//               d => d.id && currentUserId && d.id.toString() === currentUserId.toString()
//             )
//           );
//           setProjectsData(fetchedProjects);
//         } else {
//           throw new Error(projectsRes.reason?.message || "Error fetching projects");
//         }

//         if (totalRes.status === "fulfilled") setTotalActiveProjectsCount(totalRes.value.data.length);

//         // 2. Fetch Tasks & Completions based on fetched projects
//         if (fetchedProjects.length > 0 && currentUserId) {
//           let allPending = [];
//           let allCompletedList = [];

//           await Promise.all(
//             fetchedProjects.map(async (p) => {
//               try {
//                 const [tasksRes, compRes] = await Promise.all([
//                   axios.get(`${API_BASE}/api/tasks/${p._id}`, authHeader).catch(() => ({ data: [] })),
//                   axios.get(`${API_BASE}/api/tasks/${p._id}/completions`, authHeader).catch(() => ({ data: [] }))
//                 ]);

//                 // Filter pending tasks safely using .toString() on the ID
//                 const pending = tasksRes.data.filter(
//                   t => t.status !== "Done" && t.assignedTo?.id?.toString() === currentUserId?.toString()
//                 );
//                 allPending.push(...pending);

//                 // Filter completions safely using .toString() on the ID
//                 const myCompletions = compRes.data.filter(
//                   c => c.completedBy?.id?.toString() === currentUserId?.toString()
//                 );
//                 allCompletedList.push(...myCompletions);
//               } catch (err) {
//                 console.error(`Failed to fetch tasks for project ${p._id}`, err);
//               }
//             })
//           );

//           // Calculate Overdue Logic (Deadline is End of Day)
//           const overdue = allPending.filter(t => {
//             if (!t.deadline) return false;
//             return differenceInCalendarDays(new Date(t.deadline), new Date()) < 0;
//           });
          
//           // Sort pending by deadline
//           allPending.sort((a, b) => new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01'));
//           // Sort completions by newest first
//           allCompletedList.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
          
//           setPendingTasks(allPending);
//           setOverdueTasks(overdue);
//           setAllCompletions(allCompletedList);
//         }
//       } catch (err) {
//         console.error("Error fetching dashboard data:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [currentUserId]);

//   // --- Chart Data Preparation ---
  
//   // 1. Bar Chart: Last 7 Days Completions
//   const taskChartData = useMemo(() => {
//     const days = [];
//     for (let i = 6; i >= 0; i--) {
//       days.push({
//         date: format(subDays(new Date(), i), "MMM dd"),
//         tasks: 0,
//       });
//     }
//     allCompletions.forEach((c) => {
//       const dateStr = format(new Date(c.completedAt), "MMM dd");
//       const dayObj = days.find((d) => d.date === dateStr);
//       if (dayObj) dayObj.tasks += 1;
//     });
//     return days;
//   }, [allCompletions]);

//   // 2. Pie Chart: Completions by Priority
//   const priorityDistributionData = useMemo(() => {
//     const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
//     allCompletions.forEach(c => {
//       const p = c.priority || 'Medium';
//       if (counts[p] !== undefined) counts[p]++;
//     });

//     return [
//       { name: "Critical", value: counts.Critical, color: "#DC2626" }, // Red
//       { name: "High", value: counts.High, color: "#EA580C" },       // Orange
//       { name: "Medium", value: counts.Medium, color: "#2563EB" },     // Blue
//       { name: "Low", value: counts.Low, color: "#16A34A" },         // Green
//     ].filter(d => d.value > 0);
//   }, [allCompletions]);

//   // General Metrics
//   const completionsThisMonth = useMemo(() => {
//     const startOfCurrentMonth = startOfMonth(new Date());
//     return allCompletions.filter(c => isAfter(new Date(c.completedAt), startOfCurrentMonth)).length;
//   }, [allCompletions]);

//   // UI Helpers
//   const getStatusStyles = (status) => {
//     switch (status?.toLowerCase()) {
//       case "active": return "bg-green-100 text-green-800 border border-green-200";
//       case "pending": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
//       case "completed": return "bg-blue-100 text-blue-800 border border-blue-200";
//       default: return "bg-gray-100 text-gray-800 border border-gray-200";
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch(priority) {
//       case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
//       case 'High': return 'text-orange-700 bg-orange-100 border-orange-200';
//       case 'Low': return 'text-green-700 bg-green-100 border-green-200';
//       default: return 'text-blue-700 bg-blue-100 border-blue-200';
//     }
//   };

//   // --- Loader Screen ---
//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
//         <div className="w-10 h-10 border-4 border-[#EBECF0] border-t-[#0969DA] rounded-full animate-spin"></div>
//         <p className="mt-4 text-[#5E6C84] text-sm font-medium animate-pulse">Loading developer dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#F6F8FA] min-h-screen font-sans antialiased text-[#1F2328] pb-12">

//       <main className="max-w-[95%] mx-auto py-8 sm:px-6 lg:px-8 space-y-6">
        
//         {/* --- Top Metrics Grid --- */}
//         <motion.div 
//           variants={containerVariants} 
//           initial="hidden" 
//           animate="show"
//           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
//         >
//           {/* Active Projects */}
//           <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between transition-shadow hover:shadow-md">
//             <div>
//               <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Active Projects</p>
//               <p className="text-2xl font-base text-[#1F2328] mt-1">{totalActiveProjectsCount}</p>
//             </div>
//             <div className="p-3 bg-blue-50 rounded-lg">
//               <ClipboardDocumentCheckIcon className="h-6 w-6 text-[#0969DA]" />
//             </div>
//           </motion.div>

//           {/* Pending Tasks */}
//           <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between transition-shadow hover:shadow-md">
//             <div>
//               <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Pending Tasks</p>
//               <p className="text-2xl font-base text-[#0969DA] mt-1">{pendingTasks.length}</p>
//             </div>
//             <div className="p-3 bg-blue-50 rounded-lg">
//               <ClockIcon className="h-6 w-6 text-[#0969DA]" />
//             </div>
//           </motion.div>

//           {/* Overdue Tasks */}
//           <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between transition-shadow hover:shadow-md">
//             <div>
//               <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Overdue Tasks</p>
//               <p className="text-2xl font-base text-[#D1242F] mt-1">{overdueTasks.length}</p>
//             </div>
//             <div className="p-3 bg-red-50 rounded-lg">
//               <ExclamationCircleIcon className="h-6 w-6 text-[#D1242F]" />
//             </div>
//           </motion.div>

//           {/* Completions This Month */}
//           <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between transition-shadow hover:shadow-md">
//             <div>
//               <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Completed (This Month)</p>
//               <p className="text-2xl font-base text-[#1A7F37] mt-1">{completionsThisMonth}</p>
//             </div>
//             <div className="p-3 bg-green-50 rounded-lg">
//               <CheckBadgeIcon className="h-6 w-6 text-[#1A7F37]" />
//             </div>
//           </motion.div>
//         </motion.div>

//         {/* --- Charts Section --- */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="grid grid-cols-1 lg:grid-cols-3 gap-6"
//         >
//           {/* Bar Chart: Tasks Completed */}
//           <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5">
//             <h3 className="text-sm font-bold text-[#1F2328] mb-4 uppercase tracking-wider">Tasks Completed (Last 7 Days)</h3>
//             <div className="h-64 w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={taskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} dy={10} />
//                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} allowDecimals={false} />
//                   <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '8px', border: '1px solid #D0D7DE', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
//                   <Bar dataKey="tasks" fill="#0969DA" radius={[4, 4, 0, 0]} maxBarSize={45} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Pie Chart: Completions by Priority */}
//           <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5 flex flex-col">
//             <h3 className="text-sm font-bold text-[#1F2328] mb-2 uppercase tracking-wider">Completed By Priority</h3>
//             {priorityDistributionData.length > 0 ? (
//               <div className="flex-1 flex flex-col justify-center items-center">
//                 <div className="h-56 w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={priorityDistributionData}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={55}
//                         outerRadius={80}
//                         paddingAngle={3}
//                         dataKey="value"
//                       >
//                         {priorityDistributionData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #D0D7DE', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
//                       <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#656D76' }} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex-1 flex items-center justify-center text-sm text-[#656D76]">
//                 No completed tasks yet.
//               </div>
//             )}
//           </div>
//         </motion.div>

//         {/* --- Layout: Projects & Tasks --- */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="grid grid-cols-1 xl:grid-cols-3 gap-6"
//         >
          
//           {/* Assigned Projects Table (Spans 2 columns) */}
//           <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden flex flex-col">
//             <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex justify-between items-center">
//               <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Projects Assigned To Me</h3>
//             </div>
//             <div className="overflow-x-auto flex-1 max-h-[400px] overflow-y-auto custom-scrollbar">
//               <table className="min-w-full divide-y divide-[#D0D7DE]">
//                 <thead className="bg-white sticky top-0 z-10">
//                   <tr>
//                     <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D0D7DE]">Project</th>
//                     <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D0D7DE]">Client</th>
//                     <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D0D7DE]">Type</th>
//                     <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D0D7DE]">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-100">
//                   {error ? (
//                     <tr>
//                       <td colSpan="4" className="px-5 py-8 text-center text-sm text-red-500">{error}</td>
//                     </tr>
//                   ) : projectsData.length === 0 ? (
//                     <tr>
//                       <td colSpan="4" className="px-5 py-8 text-center text-sm text-[#656D76]">No projects assigned</td>
//                     </tr>
//                   ) : (
//                     projectsData.map((project, index) => (
//                       <tr
//                         key={project._id || index}
//                         className="hover:bg-[#F6F8FA] transition-colors cursor-pointer"
//                         onClick={() => {
//                           setSelectedProject(project);
//                           setOpenProjectDialog(true);
//                         }}
//                       >
//                         <td className="px-5 py-3 whitespace-nowrap text-sm font-bold text-[#0969DA]">{project.projectName}</td>
//                         <td className="px-5 py-3 whitespace-nowrap text-sm text-[#1F2328]">{project.clientName}</td>
//                         <td className="px-5 py-3 whitespace-nowrap text-sm text-[#656D76] capitalize">{project.subscriptionType}</td>
//                         <td className="px-5 py-3 whitespace-nowrap">
//                           <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase tracking-wider ${getStatusStyles(project.status)}`}>
//                             {project.status}
//                           </span>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Pending Tasks List */}
//           <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden flex flex-col">
//             <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex justify-between items-center">
//               <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Pending Tasks</h3>
//               <span className="bg-[#DDF4FF] text-[#0969DA] border border-[#0969DA] border-opacity-20 text-[10px] py-0.5 px-2 rounded-full font-bold uppercase">
//                 {pendingTasks.length} pending
//               </span>
//             </div>
//             <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
//               {pendingTasks.length === 0 ? (
//                 <div className="p-8 text-center text-sm text-[#656D76] font-medium">You're all caught up! 🎉</div>
//               ) : (
//                 <ul className="divide-y divide-gray-100">
//                   {pendingTasks.map((task) => {
//                     const isOverdue = task.deadline && differenceInCalendarDays(new Date(task.deadline), new Date()) < 0;
//                     return (
//                       <li key={task._id} className={`p-4 hover:bg-[#F6F8FA] transition-colors ${isOverdue ? 'border-l-4 border-l-[#D1242F]' : ''}`}>
//                         <div className="flex justify-between items-start mb-1.5">
//                           <p className="text-sm font-bold text-[#1F2328] truncate pr-3">{task.title}</p>
//                           <span className={`flex-shrink-0 text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
//                             {task.priority}
//                           </span>
//                         </div>
//                         <div className="flex justify-between items-center mt-2">
//                           <span className="text-[11px] font-bold text-[#656D76] bg-[#EAEEF2] px-2 py-1 rounded-md uppercase tracking-wider">
//                             {task.status}
//                           </span>
//                           {task.deadline && (
//                             <span className={`text-[11px] font-bold flex items-center ${isOverdue ? 'text-[#D1242F]' : 'text-[#656D76]'}`}>
//                               <ClockIcon className="w-3.5 h-3.5 mr-1" />
//                               {isOverdue ? 'Overdue' : format(new Date(task.deadline), "MMM d")}
//                             </span>
//                           )}
//                         </div>
//                       </li>
//                     )
//                   })}
//                 </ul>
//               )}
//             </div>
//           </div>
//         </motion.div>

//         {/* --- Recent Completions --- */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5 }}
//           className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden"
//         >
//           <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex justify-between items-center">
//             <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Recently Completed Tasks</h3>
//           </div>
//           <div className="p-0 overflow-x-auto">
//             {allCompletions.length === 0 ? (
//               <div className="p-8 text-center text-sm text-[#656D76] font-medium">No tasks completed yet.</div>
//             ) : (
//               <table className="min-w-full divide-y divide-[#D0D7DE]">
//                 <thead className="bg-white">
//                   <tr>
//                     <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider">Task Title</th>
//                     <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider">Priority</th>
//                     <th className="px-5 py-3 text-left text-[11px] font-bold text-[#656D76] uppercase tracking-wider">Completed At</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-100">
//                   {allCompletions.slice(0, 5).map((comp) => (
//                     <tr 
//                       key={comp._id} 
//                       className="hover:bg-[#F6F8FA] transition-colors cursor-pointer"
//                       onClick={() => {
//                         setSelectedCompletedTask(comp);
//                         setOpenTaskDialog(true);
//                       }}
//                     >
//                       <td className="px-5 py-3 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <CheckBadgeIcon className="w-5 h-5 text-[#1A7F37] mr-2" />
//                           <span className="text-sm font-semibold text-[#1F2328]">{comp.taskTitle}</span>
//                         </div>
//                       </td>
//                       <td className="px-5 py-3 whitespace-nowrap">
//                         <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold border rounded-full uppercase tracking-wider ${getPriorityColor(comp.priority)}`}>
//                           {comp.priority || "Medium"}
//                         </span>
//                       </td>
//                       <td className="px-5 py-3 whitespace-nowrap text-sm text-[#656D76]">
//                         {format(new Date(comp.completedAt), "MMM d, yyyy · h:mm a")}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </motion.div>

//       </main>

//       {/* --- Project Details Dialog --- */}
//       {selectedProject && (
//         <Dialog open={openProjectDialog} onClose={() => setOpenProjectDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
//           <DialogTitle sx={{ bgcolor: "#F6F8FA", py: 2, borderBottom: '1px solid #D0D7DE' }}>
//             <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: '#1F2328', fontFamily: "'DM Sans', sans-serif" }}>
//               {selectedProject.projectName}
//             </Typography>
//           </DialogTitle>
//           <DialogContent sx={{ py: 3, fontFamily: "'DM Sans', sans-serif" }}>
//             <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
//               <Typography variant="subtitle2" sx={{ color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 800 }}>
//                 Project Overview
//               </Typography>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <TextField label="Client Name" value={selectedProject.clientName || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
//                 <TextField label="Client Email" value={selectedProject.clientEmail || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
//                 <TextField label="Subscription Type" value={selectedProject.subscriptionType || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
//                 <TextField label="Status" value={selectedProject.status || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
//                 <TextField label="Business Niche" value={selectedProject.businessNiche || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
//                 <TextField label="Reference Site" value={selectedProject.referenceSite || "N/A"} fullWidth InputProps={{ readOnly: true }} variant="outlined" size="small" />
//               </div>

//               <TextField label="Description" value={selectedProject.projectDetails || "N/A"} fullWidth InputProps={{ readOnly: true }} multiline minRows={2} variant="outlined" size="small" />
//               <TextField label="Comments" value={selectedProject.comments || "N/A"} fullWidth InputProps={{ readOnly: true }} multiline minRows={2} variant="outlined" size="small" />

//               {selectedProject.upSale && selectedProject.upsaleData?.length > 0 && (
//                 <>
//                   <Divider sx={{ my: 1, borderColor: '#D0D7DE' }} />
//                   <Typography variant="subtitle2" sx={{ color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 800 }}>
//                     Upsale Data
//                   </Typography>
//                   <List sx={{ bgcolor: "#F6F8FA", borderRadius: 2, p: 1, border: '1px solid #D0D7DE' }}>
//                     {selectedProject.upsaleData.map((upsale, index) => (
//                       <ListItem key={index} sx={{ flexDirection: "column", alignItems: "flex-start", py: 1.5, bgcolor: "white", borderRadius: 1.5, mb: index < selectedProject.upsaleData.length - 1 ? 1 : 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #D0D7DE' }}>
//                         <ListItemText primaryTypographyProps={{ variant: "subtitle2", color: "textPrimary", fontWeight: 700 }} primary={`Service Type: ${upsale.serviceType || "N/A"}`} />
//                         <ListItemText primaryTypographyProps={{ variant: "body2", sx: { color: '#656D76', mt: 0.5 } }} primary={`Details: ${upsale.details || "N/A"}`} />
//                         <ListItemText primaryTypographyProps={{ variant: "body2", sx: { color: '#656D76', mt: 0.5 } }} primary={`Comments: ${upsale.comments || "N/A"}`} />
//                         <ListItemText primaryTypographyProps={{ variant: "body2", sx: { color: '#656D76', mt: 0.5, fontWeight: 600 } }} primary={`Date: ${upsale.date ? new Date(upsale.date).toLocaleDateString() : "N/A"}`} />
//                       </ListItem>
//                     ))}
//                   </List>
//                 </>
//               )}
//             </Box>
//           </DialogContent>
//           <DialogActions sx={{ p: 2, borderTop: '1px solid #D0D7DE', bgcolor: "#F6F8FA" }}>
//             <Button onClick={() => setOpenProjectDialog(false)} variant="outlined" sx={{ textTransform: 'none', borderRadius: '6px', color: '#1F2328', borderColor: '#D0D7DE', fontWeight: 600 }}>
//               Close
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}

//       {/* --- Completed Task Details Dialog --- */}
//       {selectedCompletedTask && (
//         <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
//           <DialogTitle sx={{ bgcolor: "#F6F8FA", py: 2, borderBottom: '1px solid #D0D7DE', display: 'flex', alignItems: 'center', gap: 1 }}>
//             <CheckBadgeIcon className="w-6 h-6 text-[#1A7F37]" />
//             <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: '#1F2328', fontFamily: "'DM Sans', sans-serif" }}>
//               Completed Task
//             </Typography>
//           </DialogTitle>
//           <DialogContent sx={{ py: 4, fontFamily: "'DM Sans', sans-serif" }}>
//             <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              
//               <Box>
//                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Task Title</Typography>
//                 <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1F2328' }}>{selectedCompletedTask.taskTitle}</Typography>
//               </Box>

//               <div className="grid grid-cols-2 gap-4">
//                 <Box>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Priority</Typography>
//                   <Chip 
//                     label={selectedCompletedTask.priority || "Medium"} 
//                     size="small"
//                     sx={{ 
//                       fontWeight: 800, 
//                       textTransform: 'uppercase', 
//                       letterSpacing: '0.05em',
//                       fontSize: '0.7rem',
//                       borderRadius: '4px',
//                       ...(selectedCompletedTask.priority === 'Critical' && { bgcolor: '#FFEBE9', color: '#D1242F', border: '1px solid #FF8182' }),
//                       ...(selectedCompletedTask.priority === 'High' && { bgcolor: '#FFF8C5', color: '#BF8700', border: '1px solid #EAC54F' }),
//                       ...(selectedCompletedTask.priority === 'Medium' && { bgcolor: '#DDF4FF', color: '#0969DA', border: '1px solid #54AEFF' }),
//                       ...(selectedCompletedTask.priority === 'Low' && { bgcolor: '#DAFBE1', color: '#1A7F37', border: '1px solid #4AC26B' }),
//                     }} 
//                   />
//                 </Box>
                
//                 <Box>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Completed At</Typography>
//                   <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2328' }}>
//                     {format(new Date(selectedCompletedTask.completedAt), "MMM d, yyyy · h:mm a")}
//                   </Typography>
//                 </Box>

//                 <Box>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Completed By</Typography>
//                   <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2328' }}>
//                     {selectedCompletedTask.completedBy?.username || "Unknown"}
//                   </Typography>
//                 </Box>

//                 <Box>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Originally Assigned By</Typography>
//                   <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2328' }}>
//                     {selectedCompletedTask.assignedBy?.username || "System/Unknown"}
//                   </Typography>
//                 </Box>
//               </div>

//             </Box>
//           </DialogContent>
//           <DialogActions sx={{ p: 2, borderTop: '1px solid #D0D7DE', bgcolor: "#F6F8FA" }}>
//             <Button onClick={() => setOpenTaskDialog(false)} variant="outlined" sx={{ textTransform: 'none', borderRadius: '6px', color: '#1F2328', borderColor: '#D0D7DE', fontWeight: 600 }}>
//               Close
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}

//       {/* Scoped Custom Scrollbar Styles for the tables/lists */}
//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//           height: 6px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background-color: #D0D7DE;
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background-color: #8C959F;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default App;





















import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  PlusIcon,
  CheckIcon,
  ChatBubbleLeftEllipsisIcon
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// --- Skeleton Loaders ---
const SkeletonDashboard = () => (
  <div className="min-h-screen bg-[#F6F8FA] p-8 max-w-[95%] mx-auto space-y-6">
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
    <div className="bg-white h-80 rounded-lg border border-[#D0D7DE] animate-pulse mt-6"></div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse mt-6">
       <div className="xl:col-span-2 bg-white h-96 rounded-lg border border-[#D0D7DE]"></div>
       <div className="bg-white h-96 rounded-lg border border-[#D0D7DE]"></div>
    </div>
  </div>
);

// --- Task Creation Modal ---
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
      await axios.post(`${API_BASE}/api/tasks/${form.projectId}`, {
         ...form,
         assignedTo: { id: currentUserId, username: currentUsername }
      }, { headers: { Authorization: `Bearer ${token}` } });
      onSuccess();
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
             <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-bold text-white bg-[#0969DA] rounded-md hover:bg-[#0349B6] disabled:opacity-50 transition-colors">
                {submitting ? 'Creating...' : 'Create Task'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  // Project & Task states
  const [totalActiveProjectsCount, setTotalActiveProjectsCount] = useState(0);
  const [projectsData, setProjectsData] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  
  // Modals for details
  const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  // Global Filters State (for top charts)
  const [filterProject, setFilterProject] = useState("All");
  
  // Daily Chart Date Filter States
  const [dailyTimeFilter, setDailyTimeFilter] = useState("This Month");
  const [dailyCustomDates, setDailyCustomDates] = useState({ start: "", end: "" });

  // Completed Tasks List Filter States
  const [completedListProjectFilter, setCompletedListProjectFilter] = useState("All");
  const [completedListTimeFilter, setCompletedListTimeFilter] = useState("This Month");
  const [completedListCustomDates, setCompletedListCustomDates] = useState({ start: "", end: "" });

  const currentUserId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "Developer";

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };

      const [projectsRes, totalRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/newproject/projects`, authHeader),
        axios.get(`${API_BASE}/api/newproject/projects/total-active`, authHeader)
      ]);

      let fetchedProjects = [];
      if (projectsRes.status === "fulfilled") {
        const allProjects = Array.isArray(projectsRes.value.data) ? projectsRes.value.data : [];
        fetchedProjects = allProjects.filter(p =>
          (p.assignedDeveloper || []).some(
            d => d.id && currentUserId && d.id.toString() === currentUserId.toString()
          )
        );
        setProjectsData(fetchedProjects);
      }

      if (totalRes.status === "fulfilled") setTotalActiveProjectsCount(totalRes.value.data.length);

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

              const pending = tasksRes.data.filter(
                t => t.status !== "Done" && t.assignedTo?.id?.toString() === currentUserId?.toString()
              ).map(t => ({ ...t, _projectId: p._id, _projectName: p.projectName }));
              allPending.push(...pending);

              const myCompletions = compRes.data.filter(
                c => c.completedBy?.id?.toString() === currentUserId?.toString()
              ).map(c => ({ ...c, _projectId: p._id }));
              allCompletedList.push(...myCompletions);
            } catch (err) {
              console.error(`Failed to fetch tasks for project ${p._id}`, err);
            }
          })
        );

        const overdue = allPending.filter(t => t.deadline && differenceInCalendarDays(new Date(t.deadline), new Date()) < 0);
        
        allPending.sort((a, b) => new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01'));
        allCompletedList.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        setPendingTasks(allPending);
        setOverdueTasks(overdue);
        setAllCompletions(allCompletedList);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Actions ---
  const handleCompleteTask = async (taskId, projectId) => {
    setCompletingTaskId(taskId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/api/tasks/${projectId}/${taskId}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchDashboardData(); 
    } catch (error) {
      console.error("Failed to complete task", error);
    } finally {
      setCompletingTaskId(null);
    }
  };

  // --- Filter Logic ---
  
  // Top Level Charts Filter
  const filteredCompletions = useMemo(() => {
    if (filterProject === "All") return allCompletions;
    return allCompletions.filter(c => c._projectId === filterProject);
  }, [allCompletions, filterProject]);

  const filteredPending = useMemo(() => {
    if (filterProject === "All") return pendingTasks;
    return pendingTasks.filter(t => t._projectId === filterProject);
  }, [pendingTasks, filterProject]);

  const projectBarData = useMemo(() => {
    const targetProjects = filterProject === "All" ? projectsData : projectsData.filter(p => p._id === filterProject);
    return targetProjects.map(p => ({
       name: p.projectName,
       Completed: filteredCompletions.filter(c => c._projectId === p._id).length,
       Pending: filteredPending.filter(t => t._projectId === p._id).length
    })).sort((a, b) => (b.Completed + b.Pending) - (a.Completed + a.Pending)).slice(0, 10);
  }, [projectsData, filteredCompletions, filteredPending, filterProject]);

  const priorityBarData = useMemo(() => {
    const priorities = ["Critical", "High", "Medium", "Low"];
    return priorities.map(pri => ({
        priority: pri,
        Completed: filteredCompletions.filter(c => c.priority === pri).length
    }));
  }, [filteredCompletions]);

  // Daily Chart Filter logic
  const checkDailyDateMatch = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    switch (dailyTimeFilter) {
      case "Today": return isToday(d);
      case "Yesterday": return isYesterday(d);
      case "This Week": return isThisWeek(d);
      case "This Month": return isThisMonth(d);
      case "Last Month": {
        const lm = subMonths(new Date(), 1);
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
      }
      case "Custom":
        if (dailyCustomDates.start && dailyCustomDates.end) {
          return isWithinInterval(d, { start: startOfDay(new Date(dailyCustomDates.start)), end: endOfDay(new Date(dailyCustomDates.end)) });
        }
        return true;
      default: return true;
    }
  };

  const dailyCompletionData = useMemo(() => {
    const targetCompletions = filteredCompletions.filter(c => checkDailyDateMatch(c.completedAt));
    const groups = {};
    targetCompletions.forEach(c => {
       const key = format(new Date(c.completedAt), "yyyy-MM-dd");
       groups[key] = (groups[key] || 0) + 1;
    });
    return Object.keys(groups).sort().map(key => ({
       date: format(new Date(key), "MMM dd"),
       Completed: groups[key]
    }));
  }, [filteredCompletions, dailyTimeFilter, dailyCustomDates]);

  // --- Completed Tasks List Filter Logic ---
  const checkCompletedListDateMatch = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    switch (completedListTimeFilter) {
      case "Today": return isToday(d);
      case "Yesterday": return isYesterday(d);
      case "This Week": return isThisWeek(d);
      case "This Month": return isThisMonth(d);
      case "Last Month": {
        const lm = subMonths(new Date(), 1);
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
      }
      case "Custom":
        if (completedListCustomDates.start && completedListCustomDates.end) {
          return isWithinInterval(d, { start: startOfDay(new Date(completedListCustomDates.start)), end: endOfDay(new Date(completedListCustomDates.end)) });
        }
        return true;
      default: return true;
    }
  };

  const filteredCompletedTasksList = useMemo(() => {
    let list = allCompletions;
    if (completedListProjectFilter !== "All") {
      list = list.filter(c => c._projectId === completedListProjectFilter);
    }
    return list.filter(c => checkCompletedListDateMatch(c.completedAt));
  }, [allCompletions, completedListProjectFilter, completedListTimeFilter, completedListCustomDates]);

  // General Top Metrics
  const completionsThisMonth = useMemo(() => {
    const startOfCurrentMonth = startOfMonth(new Date());
    return allCompletions.filter(c => isAfter(new Date(c.completedAt), startOfCurrentMonth)).length;
  }, [allCompletions]);

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
    <div className="bg-[#F6F8FA] min-h-screen font-sans antialiased text-[#1F2328] pb-12 relative">
      <AddTaskModal 
        open={addTaskModalOpen} 
        onClose={() => setAddTaskModalOpen(false)} 
        projects={projectsData.filter(p => p.status !== "Closed")}
        onSuccess={fetchDashboardData}
        currentUserId={currentUserId}
        currentUsername={username}
      />

      <main className="max-w-[95%] mx-auto py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* --- Top Metrics Grid --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Active Projects</p>
              <p className="text-2xl font-base text-[#1F2328] mt-1">{totalActiveProjectsCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg"><ClipboardDocumentCheckIcon className="h-6 w-6 text-[#0969DA]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Pending Tasks</p>
              <p className="text-2xl font-base text-[#0969DA] mt-1">{pendingTasks.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg"><ClockIcon className="h-6 w-6 text-[#0969DA]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Overdue Tasks</p>
              <p className="text-2xl font-base text-[#D1242F] mt-1">{overdueTasks.length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg"><ExclamationCircleIcon className="h-6 w-6 text-[#D1242F]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg shadow-sm border border-[#D0D7DE] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Completed (This Month)</p>
              <p className="text-2xl font-base text-[#1A7F37] mt-1">{completionsThisMonth}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg"><CheckBadgeIcon className="h-6 w-6 text-[#1A7F37]" /></div>
          </motion.div>
        </motion.div>

        {/* --- Advanced Native Filter Header --- */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-4 rounded-lg shadow-sm border border-[#D0D7DE] flex justify-between items-center">
           <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Dashboard Analytics & Charts</h3>
           <div className="flex gap-4 items-center">
              <span className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Filter By Project:</span>
              <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="border border-[#D0D7DE] rounded-md p-1.5 text-sm font-semibold outline-none bg-[#F6F8FA] focus:border-[#0969DA] cursor-pointer">
                 <option value="All">All Projects Dashboard</option>
                 {projectsData.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
              </select>
           </div>
        </motion.div>

        {/* --- Bar Charts Section --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Completed vs Pending Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5">
            <h3 className="text-sm font-bold text-[#1F2328] mb-4 uppercase tracking-wider">Completed vs Pending Tasks</h3>
            <div className="h-64 w-full">
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
            </div>
          </div>

          {/* Completed By Priority Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5">
            <h3 className="text-sm font-bold text-[#1F2328] mb-4 uppercase tracking-wider">Completed Tasks Grouped by Priority</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="priority" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#656D76' }} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '8px', border: '1px solid #D0D7DE', fontWeight: 600 }} />
                  <Bar dataKey="Completed" fill="#BF8700" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Task Completion Timeline (Spans both columns) */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-[#D0D7DE] p-5">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Daily Task Completions Timeline</h3>
                <div className="flex items-center gap-3">
                   {dailyTimeFilter === "Custom" && (
                      <div className="flex items-center gap-2">
                        <input type="date" value={dailyCustomDates.start} onChange={e => setDailyCustomDates({...dailyCustomDates, start: e.target.value})} className="border border-[#D0D7DE] rounded text-xs px-2 py-1 outline-none" />
                        <span className="text-xs text-[#656D76]">to</span>
                        <input type="date" value={dailyCustomDates.end} onChange={e => setDailyCustomDates({...dailyCustomDates, end: e.target.value})} className="border border-[#D0D7DE] rounded text-xs px-2 py-1 outline-none" />
                      </div>
                   )}
                   <select value={dailyTimeFilter} onChange={(e) => setDailyTimeFilter(e.target.value)} className="bg-[#F6F8FA] border border-[#D0D7DE] text-[#1F2328] text-xs font-semibold rounded-md px-2 py-1 outline-none cursor-pointer">
                     {["Today", "Yesterday", "This Week", "This Month", "Last Month", "Custom"].map(o => <option key={o} value={o}>{o}</option>)}
                   </select>
                </div>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Completed Tasks History List (Replaced Projects Overview) */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Completed Tasks History</h3>
              <div className="flex flex-wrap items-center gap-3">
                 {/* Date Filter */}
                 {completedListTimeFilter === "Custom" && (
                    <div className="flex items-center gap-2">
                      <input type="date" value={completedListCustomDates.start} onChange={e => setCompletedListCustomDates({...completedListCustomDates, start: e.target.value})} className="border border-[#D0D7DE] rounded text-xs px-2 py-1 outline-none" />
                      <span className="text-xs text-[#656D76]">to</span>
                      <input type="date" value={completedListCustomDates.end} onChange={e => setCompletedListCustomDates({...completedListCustomDates, end: e.target.value})} className="border border-[#D0D7DE] rounded text-xs px-2 py-1 outline-none" />
                    </div>
                 )}
                 <select value={completedListTimeFilter} onChange={(e) => setCompletedListTimeFilter(e.target.value)} className="bg-white border border-[#D0D7DE] text-[#1F2328] text-xs font-semibold rounded-md px-2 py-1 outline-none cursor-pointer">
                   {["Today", "Yesterday", "This Week", "This Month", "Last Month", "Custom"].map(o => <option key={o} value={o}>{o}</option>)}
                 </select>
                 
                 {/* Project Filter */}
                 <select value={completedListProjectFilter} onChange={e => setCompletedListProjectFilter(e.target.value)} className="bg-white border border-[#D0D7DE] text-[#1F2328] text-xs font-semibold rounded-md px-2 py-1 outline-none cursor-pointer">
                   <option value="All">All Projects</option>
                   {projectsData.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                 </select>
              </div>
            </div>
            
            <div className="p-0 max-h-[450px] overflow-y-auto custom-scrollbar">
              {filteredCompletedTasksList.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#656D76] font-medium">No completed tasks match your filters.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredCompletedTasksList.map((task) => (
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
              )}
            </div>
          </div>

          {/* Pending Tasks Action Center */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D0D7DE] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#1F2328] uppercase tracking-wider">Action Center</h3>
                <span className="bg-[#DDF4FF] text-[#0969DA] border border-[#54AEFF] text-[10px] py-0.5 px-2 rounded-full font-bold uppercase">{filteredPending.length} pending</span>
              </div>
              <button onClick={() => setAddTaskModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-[#0969DA] hover:bg-[#0349B6] text-white text-sm font-bold py-2 rounded-md transition-colors">
                <PlusIcon className="w-4 h-4 text-white font-bold" strokeWidth={3} /> Add New Task
              </button>
            </div>
            <div className="p-0 max-h-[385px] overflow-y-auto custom-scrollbar">
              {filteredPending.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#656D76] font-medium">You're all caught up! 🎉</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredPending.map((task) => {
                    const isOverdue = task.deadline && differenceInCalendarDays(new Date(task.deadline), new Date()) < 0;
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
                            disabled={completingTaskId === task._id}
                            onClick={() => handleCompleteTask(task._id, task._projectId)}
                            className="flex items-center gap-1 text-[11px] font-bold text-[#1A7F37] bg-[#DAFBE1] hover:bg-[#c1f5cc] px-2 py-1.5 border border-[#4AC26B] rounded-md transition-colors disabled:opacity-50"
                          >
                            <CheckIcon className="w-3.5 h-3.5" strokeWidth={3} /> {completingTaskId === task._id ? 'Doing...' : 'Mark Done'}
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