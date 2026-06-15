// import React, { useEffect, useState, useMemo, useCallback, Suspense } from "react";
// import {
//   ClipboardDocumentCheckIcon,
//   ClockIcon,
//   ExclamationCircleIcon,
//   CheckBadgeIcon,
//   PlusIcon,
//   CheckIcon,
//   MagnifyingGlassIcon,
//   EyeIcon,
//   ChatBubbleLeftRightIcon
// } from "@heroicons/react/24/outline";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Typography,
//   Box,
// } from "@mui/material";
// import axios from "axios";
// import { motion } from "framer-motion";
// import {
//   BarChart,
//   Bar,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   ResponsiveContainer,
//   Legend
// } from "recharts";
// import { 
//   format, differenceInCalendarDays, isToday, isYesterday, 
//   isThisWeek, isThisMonth, subMonths, subDays, isWithinInterval, 
//   startOfDay, endOfDay 
// } from "date-fns";

// // Lazy load the Kanban Board component to optimize initial asset delivery
// const ProjectKanban = React.lazy(() => import("../Admin Pages/Components/Projectkanban"));

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// // ── Design Tokens ─────────────────────────────────────────────────────────────
// const T = {
//   bg: "#F6F8FA",
//   bgCard: "#FFFFFF",
//   bgSidebar: "#F6F8FA",
//   bgInput: "#FFFFFF",
//   border: "#D0D7DE",
//   borderFocus: "#0969DA",
//   accent: "#0969DA",
//   accentDim: "#0969DA15",
//   accentHover: "#0349B6",
//   green: "#1A7F37",
//   greenBg: "#DAFBE1",
//   red: "#D1242F",
//   redBg: "#FFEBE9",
//   blue: "#0969DA",
//   blueBg: "#DDF4FF",
//   orange: "#BF8700",
//   orangeBg: "#FFF8C5",
//   gray: "#656D76",
//   grayBg: "#EAEEF2",
//   textPrimary: "#1F2328",
//   textSecondary: "#656D76",
//   textDisabled: "#8C959F",
//   radius: "8px",
//   radiusSm: "5px",
//   shadow: "0 1px 3px rgba(0,0,0,0.08)",
//   shadowMd: "0 4px 14px rgba(0,0,0,0.1)",
//   font: "'Montserrat', sans-serif"
// };

// // ── Framer Motion Variants ───────────────────────────────────────────────────
// const containerVariants = {
//   hidden: { opacity: 0 },
//   show: { opacity: 1, transition: { staggerChildren: 0.08 } },
// };
// const itemVariants = {
//   hidden: { opacity: 0, y: 10 },
//   show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 26 } },
// };

// // ── Skeleton Loader ───────────────────────────────────────────────────────────
// const SkeletonDashboard = () => (
//   <div className="min-h-screen bg-[#F6F8FA] flex flex-col montserrat-regular">
//     <div className="h-16 bg-white border-b border-[#D0D7DE] w-full animate-pulse text-center"></div>
//     <div className="p-6 max-w-[95%] mx-auto space-y-6 w-full flex-1">
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         {[1, 2, 3, 4].map(i => (
//           <div key={i} className="bg-white p-5 rounded-lg border border-[#D0D7DE] animate-pulse h-24">
//             <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
//             <div className="h-6 bg-gray-200 rounded w-1/4"></div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );

// // ── Comment Modal ─────────────────────────────────────────────────────────────
// const CommentModal = ({ task, projectId, onClose }) => {
//   const [text, setText] = useState("");
//   const [posting, setPosting] = useState(false);
//   const [posted, setPosted] = useState(false);

//   const submit = async () => {
//     if (!text.trim()) return;
//     setPosting(true);
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post(
//         `${API_BASE}/api/tasks/${projectId}/${task._id}/comments`,
//         { text: text.trim() },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPosted(true);
//       setTimeout(onClose, 900);
//     } catch (err) {
//       console.error("Comment error:", err);
//     } finally {
//       setPosting(false);
//     }
//   };

//   return (
//     <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1F2328]/50 backdrop-blur-sm animate-fadeIn">
//       <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-[#D0D7DE] montserrat-regular">
//         <div className="px-5 py-4 border-b border-[#D0D7DE] flex justify-between items-center bg-[#F6F8FA]">
//           <div>
//             <div className="text-[10px] text-[#656D76] montserrat-bold uppercase tracking-wider">Add Comment</div>
//             <div className="text-xs montserrat-bold text-[#1F2328] mt-1 break-words max-w-[280px]">{task.title}</div>
//           </div>
//           <button onClick={onClose} className="text-[#656D76] hover:text-[#1F2328] text-xl montserrat-bold">&times;</button>
//         </div>
//         {posted ? (
//           <div className="text-center py-8 text-[#1A7F37] montserrat-medium text-xs">
//             ✓ Comment posted!
//           </div>
//         ) : (
//           <div className="p-5 space-y-4">
//             <textarea
//               autoFocus
//               value={text}
//               onChange={e => setText(e.target.value)}
//               placeholder="Write your comment..."
//               rows={3}
//               className="w-full border border-[#D0D7DE] rounded-md p-2.5 text-xs outline-none focus:border-[#0969DA] resize-none"
//             />
//             <div className="flex justify-end gap-3 pt-2">
//               <button onClick={onClose} className="px-3 py-1.5 text-xs montserrat-bold text-[#656D76] border border-[#D0D7DE] rounded-md hover:bg-[#F6F8FA] transition-colors">Cancel</button>
//               <button onClick={submit} disabled={!text.trim() || posting} className="px-3 py-1.5 text-xs montserrat-bold text-white bg-[#0969DA] hover:bg-[#0349B6] rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50">
//                 {posting && <div className="btn-spinner" />}
//                 {posting ? "Posting..." : "Post"}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Task Creation Modal ────────────────────────────────────────────────────────
// const AddTaskModal = ({ open, onClose, projects, onSuccess, currentUserId, currentUsername }) => {
//   const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', deadline: '', projectId: '' });
//   const [submitting, setSubmitting] = useState(false);

//   // Sort projects alphabetically to ensure consistent alignment in dropdown
//   const sortedProjects = useMemo(() => {
//     return [...projects].sort((a, b) =>
//       (a.projectName || "").localeCompare(b.projectName || "", undefined, { sensitivity: "base" })
//     );
//   }, [projects]);

//   useEffect(() => {
//     if (open) {
//       setForm({ title: '', description: '', priority: 'Medium', deadline: '', projectId: sortedProjects[0]?._id || '' });
//     }
//   }, [open, sortedProjects]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.projectId) return alert("Please select a project");
//     setSubmitting(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post(`${API_BASE}/api/tasks/${form.projectId}`, {
//          ...form,
//          assignedTo: { id: currentUserId, username: currentUsername }
//       }, { headers: { Authorization: `Bearer ${token}` } });
      
//       const newTask = res.data?.task || res.data || { ...form, _id: Math.random().toString(), createdAt: new Date().toISOString(), status: "Todo" };
//       onSuccess(newTask, form.projectId);
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to create task");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1F2328]/50 backdrop-blur-sm">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-[#D0D7DE] montserrat-regular">
//         <div className="px-5 py-4 border-b border-[#D0D7DE] flex justify-between items-center bg-[#F6F8FA]">
//           <h2 className="text-xs montserrat-bold text-[#1F2328] uppercase tracking-wider">Create New Task</h2>
//           <button onClick={onClose} className="text-[#656D76] hover:text-[#1F2328] text-xl montserrat-bold">&times;</button>
//         </div>
//         <form onSubmit={handleSubmit} className="p-5 space-y-4">
//           <div>
//             <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1">Project</label>
//             <select required value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA] bg-white text-[#1F2328] montserrat-medium">
//                {sortedProjects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
//             </select>
//           </div>
//           <div>
//             <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1">Title</label>
//             <input required autoFocus value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA]" placeholder="What needs to be done?" />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1">Priority</label>
//               <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA] bg-white text-[#1F2328] montserrat-medium">
//                  <option value="Low">Low</option>
//                  <option value="Medium">Medium</option>
//                  <option value="High">High</option>
//                  <option value="Critical">Critical</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1">Deadline</label>
//               <input required type="date" min={new Date().toISOString().split('T')[0]} value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA]" />
//             </div>
//           </div>
//           <div>
//             <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1">Description</label>
//             <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-[#D0D7DE] rounded-md p-2 text-xs outline-none focus:border-[#0969DA] resize-none" rows="3" placeholder="Add context or criteria..."></textarea>
//           </div>
//           <div className="pt-3 flex justify-end gap-3 border-t border-[#D0D7DE] mt-4">
//              <button type="button" onClick={onClose} className="px-4 py-2 text-xs montserrat-bold text-[#656D76] border border-[#D0D7DE] rounded-md hover:bg-[#F6F8FA] transition-colors">Cancel</button>
//              <button type="submit" disabled={submitting} className="px-4 py-2 text-xs montserrat-bold text-white bg-[#0969DA] rounded-md hover:bg-[#0349B6] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
//                 {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
//                 {submitting ? 'Creating...' : 'Create Task'}
//              </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // ── Main Dashboard App ─────────────────────────────────────────────────────────
// function App() {
//   const currentUserId = localStorage.getItem("userId");
//   const username = localStorage.getItem("username") || "Developer";
//   const CACHE_KEY = `dev_dash_cache_${currentUserId}`;

//   // Global Filter States - Default set to "Last 2 Weeks"
//   const [globalTimeFilter, setGlobalTimeFilter] = useState("Last 2 Weeks");
//   const [globalCustomDates, setGlobalCustomDates] = useState({ start: "", end: "" });
//   const [globalProjectFilter, setGlobalProjectFilter] = useState("All");

//   // Inline List Searches
//   const [pendingSearchQuery, setPendingSearchQuery] = useState("");
//   const [completedSearchQuery, setCompletedSearchQuery] = useState("");

//   // Core Data States
//   const [totalActiveProjectsCount, setTotalActiveProjectsCount] = useState(0);
//   const [projectsData, setProjectsData] = useState([]);
//   const [pendingTasks, setPendingTasks] = useState([]);
//   const [allCompletions, setAllCompletions] = useState([]);
  
//   // UI & Pagination States
//   const [loading, setLoading] = useState(true);
//   const [completingTaskId, setCompletingTaskId] = useState(null);
//   const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
//   const [completedVisibleCount, setCompletedVisibleCount] = useState(10);

//   // Detail & Comment Modals
//   const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
//   const [openTaskDialog, setOpenTaskDialog] = useState(false);
//   const [commentTask, setCommentTask] = useState(null);

//   // Kanban States
//   const [kanbanProject, setKanbanProject] = useState(null);
//   const [kanbanOpen, setKanbanOpen] = useState(false);
//   const [openingKanbanId, setOpeningKanbanId] = useState(null);

//   // Reset pagination when filters change
//   useEffect(() => { 
//     setCompletedVisibleCount(10);
//   }, [globalTimeFilter, globalProjectFilter, globalCustomDates]);

//   // ── Data Fetching & Local Storage Caching ────────────────────────────────────
//   const fetchDashboardData = useCallback(async (isSilent = false) => {
//     if (!isSilent) setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return;
//       const authHeader = { headers: { Authorization: `Bearer ${token}` } };

//       const [dashRes, totalRes] = await Promise.allSettled([
//         axios.get(`${API_BASE}/api/reports/dashboard`, authHeader),
//         axios.get(`${API_BASE}/api/newproject/projects/total-active`, authHeader)
//       ]);

//       let fetchedProjects = [];
//       let allPending = [];
//       let allCompletedList = [];
//       let activeCount = totalRes.status === "fulfilled" ? totalRes.value.data.length : 0;

//       if (dashRes.status === "fulfilled") {
//         const { projects, tasks, completions } = dashRes.value.data;
//         fetchedProjects = projects || [];

//         // Map Pending Tasks
//         allPending = (tasks || [])
//           .filter(t => t.status !== "Done" && t.assignedTo?.id?.toString() === currentUserId?.toString())
//           .map(t => ({ ...t, _projectId: t.projectId, _projectName: t.projectName }));

//         // Map Completions
//         allCompletedList = (completions || [])
//           .filter(c => c.completedBy?.id?.toString() === currentUserId?.toString())
//           .map(c => ({ ...c, _projectId: c.projectId }));

//         // Sort Data
//         allPending.sort((a, b) => new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01'));
//         allCompletedList.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
//       }

//       setProjectsData(fetchedProjects);
//       setTotalActiveProjectsCount(activeCount);
//       setPendingTasks(allPending);
//       setAllCompletions(allCompletedList);

//       // Save to Local Cache
//       sessionStorage.setItem(CACHE_KEY, JSON.stringify({
//         projectsData: fetchedProjects,
//         totalActiveProjectsCount: activeCount,
//         pendingTasks: allPending,
//         allCompletions: allCompletedList,
//         timestamp: new Date().getTime()
//       }));

//     } catch (err) {
//       console.error("Dashboard Fetch Error", err);
//     } finally {
//       if (!isSilent) setLoading(false);
//     }
//   }, [currentUserId, CACHE_KEY]);

//   useEffect(() => {
//     const cachedData = sessionStorage.getItem(CACHE_KEY);
//     if (cachedData) {
//       try {
//         const parsed = JSON.parse(cachedData);
//         setProjectsData(parsed.projectsData || []);
//         setTotalActiveProjectsCount(parsed.totalActiveProjectsCount || 0);
//         setPendingTasks(parsed.pendingTasks || []);
//         setAllCompletions(parsed.allCompletions || []);
//         setLoading(false);
//         fetchDashboardData(true); 
//       } catch (e) {
//         fetchDashboardData();
//       }
//     } else {
//       fetchDashboardData();
//     }
//   }, [fetchDashboardData, CACHE_KEY]);

//   // ── Kanban Action ────────────────────────────────────────────────────────────
//   const handleOpenKanban = useCallback((pId) => {
//     setOpeningKanbanId(pId);
//     const targetProject = projectsData.find(p => p._id === pId);
    
//     setTimeout(() => {
//       if (targetProject) {
//         setKanbanProject(targetProject);
//         setKanbanOpen(true);
//       }
//       setOpeningKanbanId(null);
//     }, 450);
//   }, [projectsData]);

//   // ── Optimistic Actions ───────────────────────────────────────────────────────
//   const handleCompleteTask = async (taskId, projectId) => {
//     setCompletingTaskId(taskId);
    
//     // Optimistic UI Update (Instant response)
//     const taskToComplete = pendingTasks.find(t => t._id === taskId);
//     if (taskToComplete) {
//       const mockCompletion = {
//         ...taskToComplete,
//         _id: Math.random().toString(),
//         taskId: taskToComplete._id,
//         taskTitle: taskToComplete.title,
//         completedAt: new Date().toISOString(),
//         completedBy: { id: currentUserId, username }
//       };
      
//       setPendingTasks(prev => prev.filter(t => t._id !== taskId));
//       setAllCompletions(prev => [mockCompletion, ...prev]);
//     }

//     try {
//       const token = localStorage.getItem("token");
//       await axios.post(`${API_BASE}/api/tasks/${projectId}/${taskId}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       fetchDashboardData(true);
//     } catch (error) {
//       console.error("Failed to complete task", error);
//       fetchDashboardData(true); 
//     } finally {
//       setCompletingTaskId(null);
//     }
//   };

//   const handleQuickAddSuccess = (newTask, projectId) => {
//     const project = projectsData.find(p => p._id === projectId);
//     const mappedTask = { ...newTask, _projectId: projectId, _projectName: project?.projectName };
    
//     setPendingTasks(prev => {
//       const arr = [...prev, mappedTask];
//       return arr.sort((a, b) => new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01'));
//     });
//     fetchDashboardData(true);
//   };

//   // ── Global Filter Logic ──────────────────────────────────────────────────────
//   const isDateInRange = useCallback((dateStr) => {
//     if (!dateStr) return false;
//     const d = new Date(dateStr);
//     switch (globalTimeFilter) {
//       case "Today": return isToday(d);
//       case "Yesterday": return isYesterday(d);
//       case "This Week": return isThisWeek(d);
//       case "Last 2 Weeks": {
//         const twoWeeksAgo = subDays(new Date(), 14);
//         return isWithinInterval(d, { start: startOfDay(twoWeeksAgo), end: endOfDay(new Date()) });
//       }
//       case "This Month": return isThisMonth(d);
//       case "Last Month": {
//         const lm = subMonths(new Date(), 1);
//         return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
//       }
//       case "All Time": return true;
//       case "Custom":
//         if (globalCustomDates.start && globalCustomDates.end) {
//           return isWithinInterval(d, { start: startOfDay(new Date(globalCustomDates.start)), end: endOfDay(new Date(globalCustomDates.end)) });
//         }
//         return true;
//       default: return true;
//     }
//   }, [globalTimeFilter, globalCustomDates]);

//   // Apply Global Filters + Search across all data arrays
//   const globallyFilteredCompletions = useMemo(() => {
//     let list = allCompletions;
//     if (globalProjectFilter !== "All") list = list.filter(c => c._projectId === globalProjectFilter);
//     list = list.filter(c => isDateInRange(c.completedAt));
//     if (completedSearchQuery.trim()) {
//       const query = completedSearchQuery.toLowerCase();
//       list = list.filter(c => (c.taskTitle || c.title || "").toLowerCase().includes(query));
//     }
//     return list;
//   }, [allCompletions, globalProjectFilter, isDateInRange, completedSearchQuery]);

//   const globallyFilteredPending = useMemo(() => {
//     let list = pendingTasks;
//     if (globalProjectFilter !== "All") list = list.filter(t => t._projectId === globalProjectFilter);
    
//     if (globalTimeFilter !== "All Time") {
//       list = list.filter(t => 
//         isDateInRange(t.createdAt) || 
//         isDateInRange(t.deadline) || 
//         (t.deadline && differenceInCalendarDays(new Date(t.deadline), new Date()) < 0) 
//       );
//     }
//     if (pendingSearchQuery.trim()) {
//       const query = pendingSearchQuery.toLowerCase();
//       list = list.filter(t => (t.title || "").toLowerCase().includes(query));
//     }
//     return list;
//   }, [pendingTasks, globalProjectFilter, globalTimeFilter, isDateInRange, pendingSearchQuery]);

//   const globallyFilteredOverdue = useMemo(() => {
//     return globallyFilteredPending.filter(t => t.deadline && differenceInCalendarDays(new Date(t.deadline), new Date()) < 0);
//   }, [globallyFilteredPending]);

//   // ── Chart Data Calculations ──────────────────────────────────────────────────
//   const projectBarData = useMemo(() => {
//     const targetProjects = globalProjectFilter === "All" ? projectsData : projectsData.filter(p => p._id === globalProjectFilter);
//     return targetProjects.map(p => ({
//        name: p.projectName,
//        Completed: globallyFilteredCompletions.filter(c => c._projectId === p._id).length,
//        Pending: globallyFilteredPending.filter(t => t._projectId === p._id).length
//     })).filter(p => p.Completed > 0 || p.Pending > 0)
//       .sort((a, b) => (b.Completed + b.Pending) - (a.Completed + a.Pending))
//       .slice(0, 10);
//   }, [projectsData, globallyFilteredCompletions, globallyFilteredPending, globalProjectFilter]);

//   const priorityBarData = useMemo(() => {
//     const priorities = ["Critical", "High", "Medium", "Low"];
//     return priorities.map(pri => ({
//         priority: pri,
//         Completed: globallyFilteredCompletions.filter(c => c.priority === pri).length
//     }));
//   }, [globallyFilteredCompletions]);

//   const dailyCompletionData = useMemo(() => {
//     const groups = {};
//     globallyFilteredCompletions.forEach(c => {
//        const key = format(new Date(c.completedAt), "yyyy-MM-dd");
//        groups[key] = (groups[key] || 0) + 1;
//     });
//     return Object.keys(groups).sort().map(key => ({
//        date: format(new Date(key), "MMM dd"),
//        Completed: groups[key]
//     }));
//   }, [globallyFilteredCompletions]);

//   // UI Helpers
//   const getPriorityColor = (priority) => {
//     switch(priority) {
//       case 'Critical': return 'text-[#D1242F] bg-[#FFEBE9] border-[#FF8182]';
//       case 'High': return 'text-[#BF8700] bg-[#FFF8C5] border-[#EAC54F]';
//       case 'Low': return 'text-[#1A7F37] bg-[#DAFBE1] border-[#4AC26B]';
//       default: return 'text-[#0969DA] bg-[#DDF4FF] border-[#54AEFF]';
//     }
//   };

//   if (loading) return <SkeletonDashboard />;

//   return (
//     <div className="bg-[#F6F8FA] min-h-screen montserrat-regular antialiased text-[#1F2328] pb-12 flex flex-col relative">
      
//       {/* ── Global Top Navbar ── */}
//       <nav className="sticky top-15 z-[50] bg-white border-b border-[#D0D7DE] shadow-sm px-6 py-3 flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 rounded-full bg-[#0969DA] text-white flex items-center justify-center montserrat-bold text-xs">
//             {username.charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <h1 className="text-xs montserrat-bold leading-tight text-[#1F2328]">Developer Workspace</h1>
//             <p className="text-[9px] text-[#656D76] uppercase tracking-wider montserrat-bold">Active Assignment: {username}</p>
//           </div>
//         </div>

//         <div className="flex flex-wrap items-center gap-3 bg-[#F6F8FA] p-1.5 rounded-lg border border-[#D0D7DE]">
//           <div className="flex items-center gap-2 px-2 border-r border-[#D0D7DE]">
//             <ClockIcon className="w-3.5 h-3.5 text-[#656D76]" />
//             <select 
//               value={globalTimeFilter} 
//               onChange={e => setGlobalTimeFilter(e.target.value)} 
//               className="bg-transparent border-none text-[11px] montserrat-bold text-[#1F2328] outline-none cursor-pointer py-1"
//             >
//               <option value="Today">Today</option>
//               <option value="Yesterday">Yesterday</option>
//               <option value="This Week">This Week</option>
//               <option value="Last 2 Weeks">Last 2 Weeks</option>
//               <option value="This Month">This Month</option>
//               <option value="Last Month">Last Month</option>
//               <option value="All Time">All Time</option>
//               <option value="Custom">Custom Range...</option>
//             </select>
//           </div>

//           {globalTimeFilter === "Custom" && (
//             <div className="flex items-center gap-2 px-2 border-r border-[#D0D7DE] animate-fadeIn">
//               <input type="date" value={globalCustomDates.start} onChange={e => setGlobalCustomDates({...globalCustomDates, start: e.target.value})} className="border border-[#D0D7DE] bg-white rounded text-[10px] px-1 py-1 outline-none montserrat-medium text-[#1F2328]" />
//               <span className="text-[10px] text-[#656D76] montserrat-bold">to</span>
//               <input type="date" value={globalCustomDates.end} onChange={e => setGlobalCustomDates({...globalCustomDates, end: e.target.value})} className="border border-[#D0D7DE] bg-white rounded text-[10px] px-1 py-1 outline-none montserrat-medium text-[#1F2328]" />
//             </div>
//           )}

//           <div className="flex items-center gap-2 px-2">
//             <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-[#656D76]" />
//             <select 
//               value={globalProjectFilter} 
//               onChange={e => setGlobalProjectFilter(e.target.value)} 
//               className="bg-transparent border-none text-[11px] montserrat-bold text-[#1F2328] outline-none cursor-pointer py-1 max-w-[180px]"
//             >
//               <option value="All">All Projects</option>
//               {projectsData.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
//             </select>
//           </div>
//         </div>
//       </nav>

//       <AddTaskModal 
//         open={addTaskModalOpen} 
//         onClose={() => setAddTaskModalOpen(false)} 
//         projects={projectsData.filter(p => p.status !== "Closed")}
//         onSuccess={handleQuickAddSuccess}
//         currentUserId={currentUserId}
//         currentUsername={username}
//       />

//       <main className="max-w-[95%] mx-auto py-6 sm:px-6 lg:px-8 space-y-6 w-full flex-1">
        
//         {/* --- Metrics Overview Grid --- */}
//         <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//           <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg border border-[#D0D7DE] flex items-center justify-between shadow-sm hover:shadow transition-shadow">
//             <div>
//               <p className="text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider">Active Projects</p>
//               <p className="text-2xl montserrat-bold text-[#1F2328] mt-1">{totalActiveProjectsCount}</p>
//             </div>
//             <div className="p-3 bg-blue-50 rounded-lg"><ClipboardDocumentCheckIcon className="h-5 w-5 text-[#0969DA]" /></div>
//           </motion.div>
//           <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg border border-[#D0D7DE] flex items-center justify-between shadow-sm hover:shadow transition-shadow">
//             <div>
//               <p className="text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider">Pending Tasks</p>
//               <p className="text-2xl montserrat-bold text-[#0969DA] mt-1">{globallyFilteredPending.length}</p>
//             </div>
//             <div className="p-3 bg-blue-50 rounded-lg"><ClockIcon className="h-5 w-5 text-[#0969DA]" /></div>
//           </motion.div>
//           <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg border border-[#D0D7DE] flex items-center justify-between shadow-sm hover:shadow transition-shadow">
//             <div>
//               <p className="text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider">Overdue</p>
//               <p className="text-2xl montserrat-bold text-[#D1242F] mt-1">{globallyFilteredOverdue.length}</p>
//             </div>
//             <div className="p-3 bg-red-50 rounded-lg"><ExclamationCircleIcon className="h-5 w-5 text-[#D1242F]" /></div>
//           </motion.div>
//           <motion.div variants={itemVariants} className="bg-white p-5 rounded-lg border border-[#D0D7DE] flex items-center justify-between shadow-sm hover:shadow transition-shadow">
//             <div>
//               <p className="text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider">Completed Tasks</p>
//               <p className="text-2xl montserrat-bold text-[#1A7F37] mt-1">{globallyFilteredCompletions.length}</p>
//             </div>
//             <div className="p-3 bg-green-50 rounded-lg"><CheckBadgeIcon className="h-5 w-5 text-[#1A7F37]" /></div>
//           </motion.div>
//         </motion.div>

//         {/* --- Primary Workspace: Pending Workspace Docket & Completions History --- */}
//         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
//           {/* Unified Action Work Board System */}
//           <div className="xl:col-span-2 bg-white rounded-lg border border-[#D0D7DE] overflow-hidden flex flex-col shadow-sm">
//             <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div>
//                 <h3 className="text-xs montserrat-bold text-[#1F2328] uppercase tracking-wider">My Pending Tasks</h3>
//                 <span className="text-[10px] text-[#656D76] montserrat-medium">{globallyFilteredPending.length} Tasks Scheduled</span>
//               </div>
              
//               <div className="flex gap-2 items-center w-full sm:w-auto">
//                 {/* Board Inline Search */}
//                 <div className="relative flex-1 sm:flex-initial">
//                   <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-[#8C959F]" />
//                   <input
//                     type="text"
//                     value={pendingSearchQuery}
//                     onChange={e => setPendingSearchQuery(e.target.value)}
//                     placeholder="Search tasks..."
//                     className="w-full bg-white border border-[#D0D7DE] rounded-md py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0969DA] montserrat-medium"
//                   />
//                 </div>
//                 <button onClick={() => setAddTaskModalOpen(true)} className="flex items-center gap-1.5 bg-[#0969DA] hover:bg-[#0349B6] text-white text-xs montserrat-bold py-2 px-3 rounded-md transition-colors shadow-sm flex-shrink-0">
//                   <PlusIcon className="w-3.5 h-3.5" strokeWidth={3} /> Add Task
//                 </button>
//               </div>
//             </div>

//             {/* Task Workspace List */}
//             <div className="p-4 bg-[#F8F9FA] flex-1 min-h-[420px] overflow-y-auto max-h-[420px] custom-scrollbar">
//               {globallyFilteredPending.length === 0 ? (
//                 <div className="text-center py-20 text-xs text-[#8C959F] montserrat-medium">No pending tasks found. All caught up! 🎉</div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   {globallyFilteredPending.map(task => {
//                     const isOverdue = task.deadline && differenceInCalendarDays(new Date(task.deadline), new Date()) < 0;
//                     const isCompleting = completingTaskId === task._id;
//                     const isKanbanLoading = openingKanbanId === task._projectId;

//                     return (
//                       <div key={task._id} className={`p-4 bg-[#FCFDFE] border border-[#D0D7DE] rounded-md shadow-sm hover:border-[#0969DA]/40 transition-colors relative flex flex-col justify-between ${isOverdue ? "border-l-4 border-l-[#D1242F]" : ""}`}>
//                         <div>
//                           <div className="flex justify-between items-start gap-2 mb-1.5">
//                             <span className="text-xs montserrat-bold text-[#1F2328] leading-tight block break-words">{task.title}</span>
//                             <span className={`text-[8px] montserrat-bold uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${getPriorityColor(task.priority)}`}>
//                               {task.priority}
//                             </span>
//                           </div>
//                           <span className="text-[9px] text-[#656D76] montserrat-bold block truncate mb-4">{task._projectName}</span>
//                         </div>
                        
//                         <div className="flex justify-between items-center pt-3 border-t border-[#EAEEF2] mt-auto">
//                           <div className="flex gap-2">
//                             <button 
//                               disabled={isCompleting}
//                               onClick={() => handleCompleteTask(task._id, task._projectId)}
//                               className="flex items-center gap-1.5 text-[10px] montserrat-bold text-[#1A7F37] bg-[#DAFBE1] border border-[#4AC26B]/30 hover:bg-[#c1f5cc] px-2.5 py-1.5 rounded transition-colors disabled:opacity-50"
//                             >
//                               {isCompleting ? <div className="btn-spinner mr-1" /> : <CheckIcon className="w-3 h-3 text-[#1A7F37]" strokeWidth={3} />}
//                               Mark As Done
//                             </button>
                            
//                             <button onClick={() => setCommentTask(task)} disabled={isCompleting} className="p-1 text-[#656D76] hover:text-[#0969DA] bg-gray-50 hover:bg-blue-50 rounded border border-[#D0D7DE] transition-colors disabled:opacity-50">
//                               <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
//                             </button>
//                           </div>

//                           <div className="flex items-center gap-3">
//                             {task.deadline && (
//                               <span className={`text-[9px] montserrat-bold flex items-center ${isOverdue ? 'text-[#D1242F]' : 'text-[#656D76]'}`}>
//                                 {isOverdue ? 'Overdue' : format(new Date(task.deadline), "MMM d")}
//                               </span>
//                             )}
//                             <button 
//                               disabled={isKanbanLoading || isCompleting}
//                               onClick={() => handleOpenKanban(task._projectId)}
//                               className="text-[10px] text-[#0969DA] hover:underline flex items-center gap-1 montserrat-bold cursor-pointer disabled:opacity-50"
//                             >
//                               {isKanbanLoading && <div className="btn-spinner" />}
//                               View Kanban
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Completed History List */}
//           <div className="bg-white rounded-lg border border-[#D0D7DE] overflow-hidden flex flex-col shadow-sm">
//             <div className="px-5 py-4 border-b border-[#D0D7DE] bg-[#F6F8FA] flex flex-col gap-3 flex-shrink-0">
//               <h3 className="text-xs montserrat-bold text-[#1F2328] uppercase tracking-wider">Completed History ({globallyFilteredCompletions.length})</h3>
              
//               {/* Completed Inline Search */}
//               <div className="relative w-full">
//                 <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-[#8C959F]" />
//                 <input
//                   type="text"
//                   value={completedSearchQuery}
//                   onChange={e => setCompletedSearchQuery(e.target.value)}
//                   placeholder="Search completions..."
//                   className="w-full bg-white border border-[#D0D7DE] rounded-md py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0969DA] montserrat-medium"
//                 />
//               </div>
//             </div>
            
//             <div className="max-h-[420px] overflow-y-auto custom-scrollbar flex-1 divide-y divide-[#EAEEF2]">
//               {globallyFilteredCompletions.length === 0 ? (
//                 <div className="p-8 text-center text-xs text-[#656D76] montserrat-medium">No completions found.</div>
//               ) : (
//                 <>
//                   {globallyFilteredCompletions.slice(0, completedVisibleCount).map((task) => (
//                     <div 
//                       key={task._id || task.taskId} 
//                       className="p-4 hover:bg-[#F6F8FA] transition-colors cursor-pointer flex justify-between items-start gap-4" 
//                       onClick={() => { setSelectedCompletedTask(task); setOpenTaskDialog(true); }}
//                     >
//                       <div className="min-w-0 flex-1">
//                         <p className="text-xs montserrat-bold text-[#1F2328] leading-normal break-words">{task.taskTitle || task.title}</p>
//                         <p className="text-[9px] text-[#656D76] mt-0.5 uppercase tracking-wider montserrat-bold truncate">
//                           {projectsData.find(p => p._id === task._projectId)?.projectName || "N/A Project"}
//                         </p>
//                         <div className="flex gap-4 items-center mt-3 text-[10px] text-[#656D76] montserrat-medium">
//                           <span className="flex items-center"><ClockIcon className="w-3.5 h-3.5 mr-1" />Done {format(new Date(task.completedAt), "MMM d")}</span>
//                         </div>
//                       </div>
                      
//                       <button className="flex items-center gap-1 border border-[#D0D7DE] bg-white hover:bg-gray-50 text-[10px] montserrat-bold text-[#656D76] py-1 px-2 rounded transition-colors flex-shrink-0">
//                         <EyeIcon className="w-3 h-3" /> View
//                       </button>
//                     </div>
//                   ))}
//                   {completedVisibleCount < globallyFilteredCompletions.length && (
//                     <div className="p-3 text-center border-t border-[#D0D7DE] bg-[#F6F8FA]">
//                       <button 
//                         onClick={() => setCompletedVisibleCount(prev => prev + 10)}
//                         className="text-xs montserrat-bold text-[#0969DA] hover:underline"
//                       >
//                         Load More Completed
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </motion.div>

//         {/* --- Visual Analysis Row (Repositioned to the footer block) --- */}
//         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
//           <div className="bg-white rounded-lg border border-[#D0D7DE] p-5 shadow-sm">
//             <h3 className="text-xs montserrat-bold text-[#1F2328] mb-4 uppercase tracking-wider">Completed vs Pending Assignments</h3>
//             <div className="h-64 w-full">
//               {projectBarData.length === 0 ? (
//                 <div className="h-full w-full flex items-center justify-center text-xs montserrat-medium text-[#656D76]">No data matches current operations.</div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={projectBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEEF2" />
//                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} dy={10} tickFormatter={(v) => v.length > 12 ? v.substring(0,11)+"..." : v} />
//                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} allowDecimals={false} />
//                     <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '6px', border: '1px solid #D0D7DE', fontSize: '11px', fontFamily: "'Montserrat', sans-serif" }} />
//                     <Legend wrapperStyle={{ fontSize: '11px', pt: 10 }} />
//                     <Bar dataKey="Completed" fill="#1A7F37" radius={[3, 3, 0, 0]} maxBarSize={30} />
//                     <Bar dataKey="Pending" fill="#0969DA" radius={[3, 3, 0, 0]} maxBarSize={30} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>

//           <div className="bg-white rounded-lg border border-[#D0D7DE] p-5 shadow-sm">
//             <h3 className="text-xs montserrat-bold text-[#1F2328] mb-4 uppercase tracking-wider">Completed Tasks Sorted By Priority</h3>
//             <div className="h-64 w-full">
//               {globallyFilteredCompletions.length === 0 ? (
//                 <div className="h-full w-full flex items-center justify-center text-xs montserrat-medium text-[#656D76]">No tasks completed within current filters.</div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={priorityBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEEF2" />
//                     <XAxis dataKey="priority" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} dy={10} />
//                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} allowDecimals={false} />
//                     <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '6px', border: '1px solid #D0D7DE', fontSize: '11px', fontFamily: "'Montserrat', sans-serif" }} />
//                     <Bar dataKey="Completed" fill="#BF8700" radius={[3, 3, 0, 0]} maxBarSize={45} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>

//           <div className="lg:col-span-2 bg-white rounded-lg border border-[#D0D7DE] p-5 shadow-sm">
//              <h3 className="text-xs montserrat-bold text-[#1F2328] mb-4 uppercase tracking-wider">Daily Completions Progress Tracker</h3>
//              <div className="h-64 w-full">
//                {dailyCompletionData.length === 0 ? (
//                  <div className="h-full w-full flex items-center justify-center text-xs montserrat-medium text-[#656D76]">
//                     No completed tasks listed in this date range.
//                  </div>
//                ) : (
//                  <ResponsiveContainer width="100%" height="100%">
//                    <AreaChart data={dailyCompletionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
//                      <defs>
//                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
//                          <stop offset="5%" stopColor="#8250DF" stopOpacity={0.4}/>
//                          <stop offset="95%" stopColor="#8250DF" stopOpacity={0}/>
//                        </linearGradient>
//                      </defs>
//                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEEF2" />
//                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} dy={10} />
//                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} allowDecimals={false} />
//                      <RechartsTooltip cursor={{ fill: '#F6F8FA' }} contentStyle={{ borderRadius: '6px', border: '1px solid #D0D7DE', fontSize: '11px', fontFamily: "'Montserrat', sans-serif" }} />
//                      <Area type="monotone" dataKey="Completed" stroke="#8250DF" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
//                    </AreaChart>
//                  </ResponsiveContainer>
//                )}
//              </div>
//           </div>
//         </motion.div>

//       </main>

//       {/* --- Completed Task Details Modal --- */}
//       {selectedCompletedTask && (
//         <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', border: '1px solid #D0D7DE', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } }}>
//           <DialogTitle sx={{ bgcolor: "#F6F8FA", py: 2, px: 3, borderBottom: '1px solid #D0D7DE' }}>
//             <Typography variant="span" className="montserrat-bold" sx={{ fontSize: '0.85rem', color: '#1F2328', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//               Completed Task Profile
//             </Typography>
//           </DialogTitle>
//           <DialogContent sx={{ py: 3, px: 3 }}>
//             <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
//               <div>
//                 <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Task Title</Typography>
//                 <Typography className="montserrat-bold" sx={{ fontSize: '1rem', color: '#1F2328' }}>
//                   {selectedCompletedTask.taskTitle || selectedCompletedTask.title}
//                 </Typography>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <Box>
//                   <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Project Space</Typography>
//                   <Typography className="montserrat-medium" sx={{ fontSize: '0.82rem', color: '#0969DA' }}>
//                     {projectsData.find(p => p._id === selectedCompletedTask._projectId)?.projectName || "N/A Project"}
//                   </Typography>
//                 </Box>
//                 <Box>
//                   <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Completions Metric</Typography>
//                   <Typography className="montserrat-medium" sx={{ fontSize: '0.82rem', color: '#1F2328' }}>
//                     {format(new Date(selectedCompletedTask.completedAt), "MMM d, yyyy 'at' h:mm a")}
//                   </Typography>
//                 </Box>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <Box>
//                   <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Completed By</Typography>
//                   <Typography className="montserrat-medium" sx={{ fontSize: '0.82rem', color: '#1F2328' }}>
//                     {selectedCompletedTask.completedBy?.username || "System Owner"}
//                   </Typography>
//                 </Box>
//                 <Box>
//                   <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Originally Assigned By</Typography>
//                   <Typography className="montserrat-medium" sx={{ fontSize: '0.82rem', color: '#1F2328' }}>
//                     {selectedCompletedTask.assignedBy?.username || "System Assignment"}
//                   </Typography>
//                 </Box>
//               </div>
//             </Box>
//           </DialogContent>
//           <DialogActions sx={{ p: 2, borderTop: '1px solid #D0D7DE', bgcolor: "#F6F8FA", px: 3 }}>
//             <button onClick={() => setOpenTaskDialog(false)} className="border border-[#D0D7DE] bg-white hover:bg-gray-50 text-xs montserrat-bold text-[#1F2328] py-1.5 px-4 rounded transition-colors">
//               Close Overview
//             </button>
//           </DialogActions>
//         </Dialog>
//       )}

//       {/* Comment Trigger Modal */}
//       {commentTask && (
//         <CommentModal
//           task={commentTask}
//           projectId={commentTask._projectId}
//           onClose={() => setCommentTask(null)}
//         />
//       )}

//       {/* Lazy-Loaded Fullscreen Kanban Integration */}
//       {kanbanProject && (
//         <Suspense fallback={
//           <div style={{
//             position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
//             zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center"
//           }}>
//             <div style={{
//               background: T.bgCard, padding: "20px 30px", borderRadius: T.radius,
//               boxShadow: T.shadowMd, fontFamily: T.font, display: "flex", alignItems: "center", gap: 10
//             }}>
//               <span className="btn-spinner" style={{ color: T.accent }} />
//               <span className="montserrat-medium" style={{ fontSize: "0.85rem" }}>Loading Kanban Board...</span>
//             </div>
//           </div>
//         }>
//           <ProjectKanban
//             open={kanbanOpen}
//             onClose={() => {
//               setKanbanOpen(false);
//               setKanbanProject(null);
//               fetchDashboardData(true);
//             }}
//             project={kanbanProject}
//           />
//         </Suspense>
//       )}

//       {/* Scoped Custom Scrollbar Styles */}
//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #D0D7DE; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8C959F; }

//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }

//         .btn-spinner {
//           display: inline-block;
//           width: 10px;
//           height: 10px;
//           border: 2px solid currentColor;
//           border-right-color: transparent;
//           border-radius: 50%;
//           animation: spin 0.75s linear infinite;
//           vertical-align: middle;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default App;































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
  isThisWeek, isThisMonth, subMonths, subDays, isWithinInterval, 
  startOfDay, endOfDay 
} from "date-fns";

// Lazy load the Kanban Board component to optimize initial asset delivery
const ProjectKanban = React.lazy(() => import("../Admin Pages/Components/Projectkanban"));

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  neuBase: "#F0F4F8", // Cleaner, professional light gray-blue
  textPrimary: "#1F2328",
  textSecondary: "#656D76",
  accent: "#0969DA",
  green: "#1A7F37",
  red: "#D1242F",
  orange: "#BF8700",
  font: "'Montserrat', sans-serif"
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

// ── Advanced Neumorphic Skeleton Loader ──────────────────────────────────────
const SkeletonDashboard = () => (
  <div className="min-h-screen neu-base flex flex-col montserrat-regular pb-12">
    {/* Navbar Skeleton */}
    <div className="neu-flat sticky top-0 z-[50] px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center w-full mb-6">
      <div className="flex items-center gap-3 w-full sm:w-1/3">
        <div className="w-10 h-10 rounded-full neu-pressed skeleton-pulse flex-shrink-0"></div>
        <div className="space-y-2 flex-1">
          <div className="h-3 neu-pressed rounded w-32 skeleton-pulse"></div>
          <div className="h-2 neu-pressed rounded w-24 skeleton-pulse"></div>
        </div>
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <div className="neu-pressed h-8 w-28 rounded-lg skeleton-pulse"></div>
        <div className="neu-pressed h-8 w-32 rounded-lg skeleton-pulse"></div>
      </div>
    </div>

    <div className="max-w-[95%] mx-auto sm:px-6 lg:px-8 space-y-8 w-full flex-1">
      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="neu-flat p-5 rounded-lg flex items-center justify-between">
            <div className="space-y-3 w-1/2">
              <div className="h-2 neu-pressed rounded w-full skeleton-pulse"></div>
              <div className="h-6 neu-pressed rounded w-1/2 skeleton-pulse"></div>
            </div>
            <div className="w-12 h-12 neu-pressed rounded-lg skeleton-pulse flex-shrink-0"></div>
          </div>
        ))}
      </div>

      {/* Main Workspace Row Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Pending Tasks Area Skeleton */}
        <div className="xl:col-span-2 neu-flat rounded-lg p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2 w-1/3">
              <div className="h-3 neu-pressed rounded w-full skeleton-pulse"></div>
              <div className="h-2 neu-pressed rounded w-2/3 skeleton-pulse"></div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
               <div className="w-48 h-10 neu-pressed rounded-lg skeleton-pulse"></div>
               <div className="w-24 h-10 neu-pressed rounded-lg skeleton-pulse"></div>
            </div>
          </div>
          <div className="neu-pressed rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[420px]">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 neu-flat rounded-md h-[150px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-3 neu-pressed rounded w-2/3 skeleton-pulse"></div>
                    <div className="h-4 neu-pressed rounded w-12 skeleton-pulse"></div>
                  </div>
                  <div className="h-2 neu-pressed rounded w-1/2 skeleton-pulse mt-2"></div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#D1DCEB]/30 mt-4">
                  <div className="flex gap-2">
                     <div className="h-6 w-24 neu-pressed rounded skeleton-pulse"></div>
                     <div className="h-6 w-8 neu-pressed rounded skeleton-pulse"></div>
                  </div>
                  <div className="flex gap-2 items-center">
                     <div className="h-2 w-8 neu-pressed rounded skeleton-pulse"></div>
                     <div className="h-3 w-12 neu-pressed rounded skeleton-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed History Area Skeleton */}
        <div className="neu-flat rounded-lg p-5 flex flex-col gap-4">
          <div className="h-3 neu-pressed rounded w-1/2 skeleton-pulse mt-1 mb-1"></div>
          <div className="h-10 w-full neu-pressed rounded-lg skeleton-pulse"></div>
          <div className="neu-pressed rounded-lg p-3 flex-1 min-h-[420px] flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-3 neu-flat rounded-md flex justify-between items-center gap-4 h-[72px]">
                <div className="flex-1 space-y-2.5">
                  <div className="h-3 neu-pressed rounded w-full skeleton-pulse"></div>
                  <div className="h-2 neu-pressed rounded w-2/3 skeleton-pulse"></div>
                </div>
                <div className="w-8 h-8 rounded-full neu-pressed flex-shrink-0 skeleton-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map(i => (
          <div key={i} className="neu-flat rounded-lg p-6 h-[340px] flex flex-col gap-6">
             <div className="h-3 neu-pressed rounded w-1/2 skeleton-pulse"></div>
             <div className="flex-1 neu-pressed rounded-lg skeleton-pulse"></div>
          </div>
        ))}
        <div className="lg:col-span-2 neu-flat rounded-lg p-6 h-[340px] flex flex-col gap-6">
             <div className="h-3 neu-pressed rounded w-1/4 skeleton-pulse"></div>
             <div className="flex-1 neu-pressed rounded-lg skeleton-pulse"></div>
        </div>
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
    <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1F2328]/40 backdrop-blur-sm animate-fadeIn">
      <div onClick={e => e.stopPropagation()} className="neu-flat rounded-lg w-full max-w-sm overflow-hidden montserrat-regular">
        <div className="px-5 py-4 border-b border-[#D1DCEB]/40 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-[#656D76] montserrat-bold uppercase tracking-wider">Add Comment</div>
            <div className="text-xs montserrat-bold text-[#1F2328] mt-1 break-words max-w-[280px]">{task.title}</div>
          </div>
          <button onClick={onClose} className="text-[#656D76] hover:text-[#1F2328] text-xl montserrat-bold neu-action-btn w-8 h-8 rounded-full flex items-center justify-center">&times;</button>
        </div>
        {posted ? (
          <div className="text-center py-8 text-[#1A7F37] montserrat-medium text-xs">
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
              className="w-full neu-pressed rounded-md p-3 text-xs outline-none resize-none bg-transparent text-[#1F2328]"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-xs montserrat-bold text-[#656D76] neu-flat neu-action-btn rounded-md transition-all">Cancel</button>
              <button onClick={submit} disabled={!text.trim() || posting} className="px-4 py-2 text-xs montserrat-bold text-white neu-btn-primary rounded-md transition-all flex items-center gap-1.5 disabled:opacity-50">
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

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) =>
      (a.projectName || "").localeCompare(b.projectName || "", undefined, { sensitivity: "base" })
    );
  }, [projects]);

  useEffect(() => {
    if (open) {
      setForm({ title: '', description: '', priority: 'Medium', deadline: '', projectId: sortedProjects[0]?._id || '' });
    }
  }, [open, sortedProjects]);

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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1F2328]/40 backdrop-blur-sm">
      <div className="neu-flat rounded-lg w-full max-w-md overflow-hidden montserrat-regular">
        <div className="px-5 py-4 border-b border-[#D1DCEB]/40 flex justify-between items-center">
          <h2 className="text-xs montserrat-bold text-[#1F2328] uppercase tracking-wider">Create New Task</h2>
          <button onClick={onClose} className="text-[#656D76] hover:text-[#1F2328] text-xl montserrat-bold neu-action-btn w-8 h-8 rounded-full flex items-center justify-center">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1.5 ml-1">Project</label>
            <select required value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} className="w-full neu-pressed rounded-md p-2.5 text-xs outline-none bg-transparent text-[#1F2328] montserrat-medium">
               {sortedProjects.map(p => <option key={p._id} value={p._id} className="bg-[#F0F4F8]">{p.projectName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1.5 ml-1">Title</label>
            <input required autoFocus value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full neu-pressed rounded-md p-2.5 text-xs outline-none bg-transparent text-[#1F2328]" placeholder="What needs to be done?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1.5 ml-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full neu-pressed rounded-md p-2.5 text-xs outline-none bg-transparent text-[#1F2328] montserrat-medium">
                 <option value="Low" className="bg-[#F0F4F8]">Low</option>
                 <option value="Medium" className="bg-[#F0F4F8]">Medium</option>
                 <option value="High" className="bg-[#F0F4F8]">High</option>
                 <option value="Critical" className="bg-[#F0F4F8]">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1.5 ml-1">Deadline</label>
              <input required type="date" min={new Date().toISOString().split('T')[0]} value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full neu-pressed rounded-md p-2.5 text-xs outline-none bg-transparent text-[#1F2328]" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider mb-1.5 ml-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full neu-pressed rounded-md p-2.5 text-xs outline-none bg-transparent text-[#1F2328] resize-none" rows="3" placeholder="Add context or criteria..."></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-4 mt-2">
             <button type="button" onClick={onClose} className="px-5 py-2 text-xs montserrat-bold text-[#656D76] neu-flat neu-action-btn rounded-md transition-all">Cancel</button>
             <button type="submit" disabled={submitting} className="px-5 py-2 text-xs montserrat-bold text-white neu-btn-primary rounded-md transition-all flex items-center justify-center gap-2">
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
  const [globalTimeFilter, setGlobalTimeFilter] = useState("Last 2 Weeks");
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

  // ── Process Task Action ───────────────────────────────────────────────────────
  const handleCompleteTask = async (taskId, projectId) => {
    // 1. Turn on the loader for this specific task
    setCompletingTaskId(taskId);
    
    try {
      const token = localStorage.getItem("token");
      // 2. Make the API request
      await axios.post(`${API_BASE}/api/tasks/${projectId}/${taskId}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      // 3. Fetch fresh data to move the task naturally to completed
      await fetchDashboardData(true);
    } catch (error) {
      console.error("Failed to complete task", error);
    } finally {
      // 4. Turn off the loader
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
      case "Last 2 Weeks": {
        const twoWeeksAgo = subDays(new Date(), 14);
        return isWithinInterval(d, { start: startOfDay(twoWeeksAgo), end: endOfDay(new Date()) });
      }
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

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'text-[#D1242F] neu-pressed-sm border-none';
      case 'High': return 'text-[#BF8700] neu-pressed-sm border-none';
      case 'Low': return 'text-[#1A7F37] neu-pressed-sm border-none';
      default: return 'text-[#0969DA] neu-pressed-sm border-none';
    }
  };

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="neu-base min-h-screen montserrat-regular antialiased text-[#1F2328] pb-12 flex flex-col relative">
      
      {/* ── Global Top Navbar ── */}
      <nav className="neu-flat sticky top-0 z-[50] px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center w-full mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0969DA] shadow-sm text-white flex items-center justify-center montserrat-bold text-sm">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-sm montserrat-bold leading-tight text-[#1F2328]">Developer Workspace</h1>
            <p className="text-[10px] text-[#656D76] uppercase tracking-wider montserrat-bold mt-0.5">Active Assignment: {username}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 neu-pressed px-2 py-1.5 rounded-lg">
          <div className="flex items-center gap-2 px-3 border-r border-[#D1DCEB]">
            <ClockIcon className="w-4 h-4 text-[#656D76]" />
            <select 
              value={globalTimeFilter} 
              onChange={e => setGlobalTimeFilter(e.target.value)} 
              className="bg-transparent border-none text-[11px] montserrat-bold text-[#1F2328] outline-none cursor-pointer py-1"
            >
              <option value="Today" className="bg-[#F0F4F8]">Today</option>
              <option value="Yesterday" className="bg-[#F0F4F8]">Yesterday</option>
              <option value="This Week" className="bg-[#F0F4F8]">This Week</option>
              <option value="Last 2 Weeks" className="bg-[#F0F4F8]">Last 2 Weeks</option>
              <option value="This Month" className="bg-[#F0F4F8]">This Month</option>
              <option value="Last Month" className="bg-[#F0F4F8]">Last Month</option>
              <option value="All Time" className="bg-[#F0F4F8]">All Time</option>
              <option value="Custom" className="bg-[#F0F4F8]">Custom Range...</option>
            </select>
          </div>

          {globalTimeFilter === "Custom" && (
            <div className="flex items-center gap-2 px-3 border-r border-[#D1DCEB] animate-fadeIn">
              <input type="date" value={globalCustomDates.start} onChange={e => setGlobalCustomDates({...globalCustomDates, start: e.target.value})} className="neu-pressed bg-transparent rounded text-[10px] px-2 py-1 outline-none montserrat-medium text-[#1F2328]" />
              <span className="text-[10px] text-[#656D76] montserrat-bold">to</span>
              <input type="date" value={globalCustomDates.end} onChange={e => setGlobalCustomDates({...globalCustomDates, end: e.target.value})} className="neu-pressed bg-transparent rounded text-[10px] px-2 py-1 outline-none montserrat-medium text-[#1F2328]" />
            </div>
          )}

          <div className="flex items-center gap-2 px-3">
            <ClipboardDocumentCheckIcon className="w-4 h-4 text-[#656D76]" />
            <select 
              value={globalProjectFilter} 
              onChange={e => setGlobalProjectFilter(e.target.value)} 
              className="bg-transparent border-none text-[11px] montserrat-bold text-[#1F2328] outline-none cursor-pointer py-1 max-w-[180px]"
            >
              <option value="All" className="bg-[#F0F4F8]">All Projects</option>
              {projectsData.map(p => <option key={p._id} value={p._id} className="bg-[#F0F4F8]">{p.projectName}</option>)}
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

      <main className="max-w-[95%] mx-auto sm:px-6 lg:px-8 space-y-8 w-full flex-1">
        
        {/* --- Metrics Overview Grid --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} className="neu-flat p-5 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider">Active Projects</p>
              <p className="text-2xl montserrat-bold text-[#1F2328] mt-1">{totalActiveProjectsCount}</p>
            </div>
            <div className="p-3 neu-pressed rounded-lg"><ClipboardDocumentCheckIcon className="h-6 w-6 text-[#0969DA]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="neu-flat p-5 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider">Pending Tasks</p>
              <p className="text-2xl montserrat-bold text-[#0969DA] mt-1">{globallyFilteredPending.length}</p>
            </div>
            <div className="p-3 neu-pressed rounded-lg"><ClockIcon className="h-6 w-6 text-[#0969DA]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="neu-flat p-5 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider">Overdue</p>
              <p className="text-2xl montserrat-bold text-[#D1242F] mt-1">{globallyFilteredOverdue.length}</p>
            </div>
            <div className="p-3 neu-pressed rounded-lg"><ExclamationCircleIcon className="h-6 w-6 text-[#D1242F]" /></div>
          </motion.div>
          <motion.div variants={itemVariants} className="neu-flat p-5 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-[10px] montserrat-bold text-[#656D76] uppercase tracking-wider">Completed Tasks</p>
              <p className="text-2xl montserrat-bold text-[#1A7F37] mt-1">{globallyFilteredCompletions.length}</p>
            </div>
            <div className="p-3 neu-pressed rounded-lg"><CheckBadgeIcon className="h-6 w-6 text-[#1A7F37]" /></div>
          </motion.div>
        </motion.div>

        {/* --- Primary Workspace: Pending Workspace Docket & Completions History --- */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Unified Action Work Board System */}
          <div className="xl:col-span-2 neu-flat rounded-lg overflow-hidden flex flex-col pt-2 pb-4 px-2">
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs montserrat-bold text-[#1F2328] uppercase tracking-wider pl-1">My Pending Tasks</h3>
                <span className="text-[10px] text-[#656D76] montserrat-medium pl-1">{globallyFilteredPending.length} Tasks Scheduled</span>
              </div>
              
              <div className="flex gap-4 items-center w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-[#8C959F]" />
                  <input
                    type="text"
                    value={pendingSearchQuery}
                    onChange={e => setPendingSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full neu-pressed bg-transparent rounded-md py-2 pl-9 pr-4 text-xs outline-none montserrat-medium text-[#1F2328]"
                  />
                </div>
                <button onClick={() => setAddTaskModalOpen(true)} className="flex items-center gap-1.5 text-white neu-btn-primary text-xs montserrat-bold py-2.5 px-4 rounded-md transition-all flex-shrink-0">
                  <PlusIcon className="w-3.5 h-3.5" strokeWidth={3} /> Add Task
                </button>
              </div>
            </div>

            {/* Task Workspace List */}
            <div className="p-4 mx-3 neu-pressed rounded-lg flex-1 min-h-[420px] overflow-y-auto max-h-[420px] custom-scrollbar">
              {globallyFilteredPending.length === 0 ? (
                <div className="text-center py-20 text-xs text-[#8C959F] montserrat-medium">No pending tasks found. Add some more!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {globallyFilteredPending.map(task => {
                    const isOverdue = task.deadline && differenceInCalendarDays(new Date(task.deadline), new Date()) < 0;
                    const isCompleting = completingTaskId === task._id;
                    const isKanbanLoading = openingKanbanId === task._projectId;

                    return (
                      <div key={task._id} className={`p-4 neu-flat rounded-md transition-all relative flex flex-col justify-between ${isOverdue ? "border-l-4 border-l-[#D1242F] border-transparent" : "border-l-4 border-l-transparent"}`}>
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-xs montserrat-bold text-[#1F2328] leading-tight block break-words">{task.title}</span>
                            <span className={`text-[8px] montserrat-bold uppercase px-2 py-1 rounded-md flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#656D76] montserrat-bold block truncate mb-5">{task._projectName}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 mt-auto border-t border-[#D1DCEB]/30">
                          <div className="flex gap-3">
                            <button 
                              disabled={isCompleting}
                              onClick={() => handleCompleteTask(task._id, task._projectId)}
                              className="flex items-center gap-1.5 text-[10px] montserrat-bold text-[#1A7F37] neu-flat neu-action-btn px-3 py-1.5 rounded-md transition-all disabled:opacity-50"
                            >
                              {isCompleting ? (
                                <div className="btn-spinner mr-1 text-[#1A7F37]" />
                              ) : (
                                <CheckIcon className="w-3.5 h-3.5 text-[#1A7F37]" strokeWidth={3} />
                              )}
                              {isCompleting ? "Marking..." : "Mark As Done"}
                            </button>
                            
                            <button onClick={() => setCommentTask(task)} disabled={isCompleting} className="p-1.5 text-[#656D76] hover:text-[#0969DA] neu-flat neu-action-btn rounded-md transition-all disabled:opacity-50">
                              <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            {task.deadline && (
                              <span className={`text-[9px] montserrat-bold flex items-center ${isOverdue ? 'text-[#D1242F]' : 'text-[#656D76]'}`}>
                                {isOverdue ? 'Overdue' : format(new Date(task.deadline), "MMM d")}
                              </span>
                            )}
                            <button 
                              disabled={isKanbanLoading || isCompleting}
                              onClick={() => handleOpenKanban(task._projectId)}
                              className="text-[10px] text-[#0969DA] flex items-center gap-1 montserrat-bold cursor-pointer disabled:opacity-50 hover:opacity-70 transition-opacity"
                            >
                              {isKanbanLoading && <div className="btn-spinner" />}
                              Kanban ↗
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
          <div className="neu-flat rounded-lg overflow-hidden flex flex-col pt-2 pb-4 px-2">
            <div className="px-5 py-4 flex flex-col gap-4 flex-shrink-0">
              <h3 className="text-xs montserrat-bold text-[#1F2328] uppercase tracking-wider pl-1">Completed History ({globallyFilteredCompletions.length})</h3>
              
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-[#8C959F]" />
                <input
                  type="text"
                  value={completedSearchQuery}
                  onChange={e => setCompletedSearchQuery(e.target.value)}
                  placeholder="Search completions..."
                  className="w-full neu-pressed bg-transparent rounded-md py-2 pl-9 pr-4 text-xs outline-none montserrat-medium text-[#1F2328]"
                />
              </div>
            </div>
            
            <div className="max-h-[420px] mx-3 p-3 neu-pressed rounded-lg overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-3">
              {globallyFilteredCompletions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#656D76] montserrat-medium">No completions found.</div>
              ) : (
                <>
                  {globallyFilteredCompletions.slice(0, completedVisibleCount).map((task) => (
                    <div 
                      key={task._id || task.taskId} 
                      className="p-3 neu-flat rounded-md cursor-pointer flex justify-between items-center gap-4 neu-action-btn transition-all" 
                      onClick={() => { setSelectedCompletedTask(task); setOpenTaskDialog(true); }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs montserrat-bold text-[#1F2328] leading-normal break-words">{task.taskTitle || task.title}</p>
                        <p className="text-[9px] text-[#656D76] mt-1 uppercase tracking-wider montserrat-bold truncate">
                          {projectsData.find(p => p._id === task._projectId)?.projectName || "N/A Project"}
                        </p>
                        <div className="flex gap-4 items-center mt-2.5 text-[10px] text-[#656D76] montserrat-medium">
                          <span className="flex items-center"><ClockIcon className="w-3 h-3 mr-1" />{format(new Date(task.completedAt), "MMM d")}</span>
                        </div>
                      </div>
                      
                      <button className="flex items-center justify-center neu-pressed w-8 h-8 rounded-full text-[#656D76] flex-shrink-0">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {completedVisibleCount < globallyFilteredCompletions.length && (
                    <div className="p-2 text-center mt-2">
                      <button 
                        onClick={() => setCompletedVisibleCount(prev => prev + 10)}
                        className="text-xs montserrat-bold text-[#0969DA] hover:opacity-70 transition-opacity"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* --- Visual Analysis Row --- */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="neu-flat rounded-lg p-6">
            <h3 className="text-xs montserrat-bold text-[#1F2328] mb-6 uppercase tracking-wider pl-1">Completed vs Pending Assignments</h3>
            <div className="h-64 w-full">
              {projectBarData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs montserrat-medium text-[#656D76]">No data matches current operations.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1DCEB" opacity={0.6} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} dy={10} tickFormatter={(v) => v.length > 12 ? v.substring(0,11)+"..." : v} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#F0F4F8', borderRadius: '8px', border: 'none', boxShadow: '4px 4px 10px #D1DCEB, -4px -4px 10px #FFFFFF', fontSize: '11px', fontFamily: "'Montserrat', sans-serif" }} />
                    <Legend wrapperStyle={{ fontSize: '11px', pt: 10 }} />
                    <Bar dataKey="Completed" fill="#1A7F37" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="Pending" fill="#0969DA" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="neu-flat rounded-lg p-6">
            <h3 className="text-xs montserrat-bold text-[#1F2328] mb-6 uppercase tracking-wider pl-1">Completed Tasks Sorted By Priority</h3>
            <div className="h-64 w-full">
              {globallyFilteredCompletions.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs montserrat-medium text-[#656D76]">No tasks completed within current filters.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1DCEB" opacity={0.6} />
                    <XAxis dataKey="priority" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#F0F4F8', borderRadius: '8px', border: 'none', boxShadow: '4px 4px 10px #D1DCEB, -4px -4px 10px #FFFFFF', fontSize: '11px', fontFamily: "'Montserrat', sans-serif" }} />
                    <Bar dataKey="Completed" fill="#BF8700" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 neu-flat rounded-lg p-6 mb-8">
             <h3 className="text-xs montserrat-bold text-[#1F2328] mb-6 uppercase tracking-wider pl-1">Daily Completions Progress Tracker</h3>
             <div className="h-64 w-full">
               {dailyCompletionData.length === 0 ? (
                 <div className="h-full w-full flex items-center justify-center text-xs montserrat-medium text-[#656D76]">
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
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1DCEB" opacity={0.6} />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#656D76' }} allowDecimals={false} />
                     <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#F0F4F8', borderRadius: '8px', border: 'none', boxShadow: '4px 4px 10px #D1DCEB, -4px -4px 10px #FFFFFF', fontSize: '11px', fontFamily: "'Montserrat', sans-serif" }} />
                     <Area type="monotone" dataKey="Completed" stroke="#8250DF" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
                   </AreaChart>
                 </ResponsiveContainer>
               )}
             </div>
          </div>
        </motion.div>

      </main>

      {/* --- Completed Task Details Modal --- */}
      {selectedCompletedTask && (
        <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}>
          <div className="neu-flat rounded-lg overflow-hidden w-full">
            <DialogTitle sx={{ py: 3, px: 4, borderBottom: '1px solid rgba(209, 220, 235, 0.4)' }}>
              <Typography variant="span" className="montserrat-bold" sx={{ fontSize: '0.85rem', color: '#1F2328', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Completed Task Profile
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ py: 4, px: 4 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                <div className="neu-pressed p-4 rounded-md">
                  <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Task Title</Typography>
                  <Typography className="montserrat-bold" sx={{ fontSize: '1rem', color: '#1F2328' }}>
                    {selectedCompletedTask.taskTitle || selectedCompletedTask.title}
                  </Typography>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <Box className="neu-pressed p-4 rounded-md">
                    <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Project Space</Typography>
                    <Typography className="montserrat-medium" sx={{ fontSize: '0.82rem', color: '#0969DA' }}>
                      {projectsData.find(p => p._id === selectedCompletedTask._projectId)?.projectName || "N/A Project"}
                    </Typography>
                  </Box>
                  <Box className="neu-pressed p-4 rounded-md">
                    <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Completions Metric</Typography>
                    <Typography className="montserrat-medium" sx={{ fontSize: '0.82rem', color: '#1F2328' }}>
                      {format(new Date(selectedCompletedTask.completedAt), "MMM d, yyyy 'at' h:mm a")}
                    </Typography>
                  </Box>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <Box className="neu-pressed p-4 rounded-md">
                    <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Completed By</Typography>
                    <Typography className="montserrat-medium" sx={{ fontSize: '0.82rem', color: '#1F2328' }}>
                      {selectedCompletedTask.completedBy?.username || "System Owner"}
                    </Typography>
                  </Box>
                  <Box className="neu-pressed p-4 rounded-md">
                    <Typography className="montserrat-bold" sx={{ fontSize: '0.65rem', color: '#656D76', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Originally Assigned By</Typography>
                    <Typography className="montserrat-medium" sx={{ fontSize: '0.82rem', color: '#1F2328' }}>
                      {selectedCompletedTask.assignedBy?.username || "System Assignment"}
                    </Typography>
                  </Box>
                </div>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(209, 220, 235, 0.4)', px: 4 }}>
              <button onClick={() => setOpenTaskDialog(false)} className="neu-flat neu-action-btn text-xs montserrat-bold text-[#1F2328] py-2.5 px-6 rounded-md transition-all">
                Close Overview
              </button>
            </DialogActions>
          </div>
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
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div className="neu-flat p-6 rounded-lg flex items-center gap-4">
              <span className="btn-spinner" style={{ color: T.accent }} />
              <span className="montserrat-medium text-[#1F2328] text-sm">Loading Kanban Board...</span>
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

      {/* Global Neumorphism CSS & Scrollbar Styles */}
      <style>{`
        :root {
          --neu-bg: #F0F4F8; /* Professional light neutral */
          --neu-light: #FFFFFF;
          --neu-dark: #D1DCEB; /* Soft clear shadow */
        }

        .neu-base {
          background-color: var(--neu-bg);
        }

        /* Subtle, structural drop shadows rather than floaty bubbles */
        .neu-flat {
          background-color: var(--neu-bg);
          box-shadow: 5px 5px 10px var(--neu-dark), -5px -5px 10px var(--neu-light);
        }

        .neu-flat-sm {
          background-color: var(--neu-bg);
          box-shadow: 2px 2px 5px var(--neu-dark), -2px -2px 5px var(--neu-light);
        }

        /* Soft debossing */
        .neu-pressed {
          background-color: var(--neu-bg);
          box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
        }

        .neu-pressed-sm {
          background-color: var(--neu-bg);
          box-shadow: inset 1.5px 1.5px 3px var(--neu-dark), inset -1.5px -1.5px 3px var(--neu-light);
        }

        /* Primary standard-looking button (no weird floating color glow) */
        .neu-btn-primary {
          background-color: #0969DA;
          box-shadow: 2px 2px 6px rgba(9, 105, 218, 0.3);
          border: none;
        }

        .neu-btn-primary:active {
          box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.15);
        }

        .neu-action-btn:active {
          box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light);
        }

        /* Prevent auto-fill background from overriding transparency */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px var(--neu-bg) inset !important;
            -webkit-text-fill-color: #1F2328 !important;
        }

        /* Scoped Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8C959F; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .btn-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          vertical-align: middle;
        }

        @keyframes pulse-skeleton {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .skeleton-pulse {
          animation: pulse-skeleton 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;