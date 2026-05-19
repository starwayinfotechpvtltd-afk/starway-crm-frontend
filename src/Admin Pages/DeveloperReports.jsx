// import { useState, useEffect, useMemo } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend,
// } from "recharts";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Inbox, Calendar, AlertCircle,
//   ClipboardList, CheckCircle, Clock, AlertOctagon, Flame,
//   MessageSquare, ExternalLink, ChevronDown, ChevronUp, X, Folder,
//   AlertTriangle,
// } from "lucide-react";
// import { differenceInCalendarDays, format as fnsFormat } from "date-fns";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
// const PROJECT_ENDPOINT = `${API_BASE}/api/newproject/projects`;

// const PRIORITY_COLOR = {
//   Critical: "#ef4444",
//   High:     "#f97316",
//   Medium:   "#eab308",
//   Low:      "#22c55e",
// };

// const DEV_PALETTE = [
//   "#6366f1","#ec4899","#14b8a6","#f97316","#8b5cf6","#06b6d4","#84cc16","#f43f5e",
// ];

// function buildPresets() {
//   const n = new Date();
//   const todayStart = new Date(n.getFullYear(), n.getMonth(), n.getDate());
//   return [
//     { label: "Today",         from: todayStart, to: null },
//     { label: "This Week",     from: new Date(n - 7  * 86400000), to: null },
//     { label: "Last 2 Weeks",  from: new Date(n - 14 * 86400000), to: null },
//     { label: "This Month",    from: new Date(n.getFullYear(), n.getMonth(), 1), to: null },
//     { label: "Last Month",    from: new Date(n.getFullYear(), n.getMonth() - 1, 1),
//                               to:   new Date(n.getFullYear(), n.getMonth(), 0) },
//     { label: "Last 3 Months", from: new Date(n - 90 * 86400000), to: null },
//     { label: "All Time",      from: null, to: null },
//   ];
// }
// const DATE_PRESETS = buildPresets();

// const getToken = () => localStorage.getItem("token") || "";
// const authFetch = (url) =>
//   fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
//     .then(r => (r.ok ? r.json() : []));

// const resolveProjectName = (projectsList, projectId) => {
//   const pid = (projectId?._id || projectId)?.toString();
//   const match = projectsList.find(p => p._id?.toString() === pid);
//   return match?.projectName || match?.title || "Unknown";
// };

// /**
//  * Overdue = deadline date has fully passed, meaning:
//  *   the end-of-day of the deadline < now
//  *   i.e. midnight starting the NEXT day after the deadline.
//  *
//  * Example: deadline = May 15 → overdue at 00:00:00 of May 16, not May 15.
//  */
// const checkIsOverdue = (deadline, status) => {
//   if (!deadline || status === "Done") return false;
//   // Build end-of-deadline-day: start of the day AFTER the deadline
//   const d = new Date(deadline);
//   const endOfDeadlineDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
//   return endOfDeadlineDay <= new Date();
// };

// // ── Shared components ──────────────────────────────────────────────────────────
// const Badge = ({ label, color }) => (
//   <span
//     style={{ background: color + "15", color, border: `1px solid ${color}33` }}
//     className="text-xs font-semibold px-2 py-0.5 rounded-sm whitespace-nowrap uppercase tracking-wider"
//   >
//     {label}
//   </span>
// );

// // ── Page-level skeleton loader ─────────────────────────────────────────────────
// const SkeletonBlock = ({ h = "h-4", w = "w-full", rounded = "rounded" }) => (
//   <div className={`${h} ${w} ${rounded} bg-gray-200 animate-pulse`} />
// );

// const PageLoader = () => (
//   <div className="min-h-screen bg-[#F6F8FA] font-sans">
//     {/* sticky header skeleton */}
//     <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
//       <div className="max-w-[95%] mx-auto flex items-center justify-between">
//         <div className="space-y-2">
//           <SkeletonBlock h="h-7" w="w-56" rounded="rounded-md" />
//           <SkeletonBlock h="h-4" w="w-36" rounded="rounded" />
//         </div>
//         <SkeletonBlock h="h-5" w="w-28" rounded="rounded-full" />
//       </div>
//     </div>

//     <div className="max-w-[95%] mx-auto px-6 py-6 space-y-6">
//       {/* Filter bar skeleton */}
//       <div className="bg-white border border-gray-200 rounded-md p-5 flex gap-4 flex-wrap">
//         {[140, 140, 110, 110, 130].map((w, i) => (
//           <div key={i} className="flex flex-col gap-2">
//             <SkeletonBlock h="h-3" w={`w-16`} />
//             <div className="h-9 rounded-sm bg-gray-200 animate-pulse" style={{ width: w }} />
//           </div>
//         ))}
//       </div>

//       {/* Stat cards skeleton */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <div key={i} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
//             <div className="flex justify-between">
//               <SkeletonBlock h="h-3" w="w-20" />
//               <SkeletonBlock h="h-5" w="w-5" rounded="rounded-full" />
//             </div>
//             <SkeletonBlock h="h-8" w="w-12" rounded="rounded-md" />
//           </div>
//         ))}
//       </div>

//       {/* Tab bar skeleton */}
//       <div className="flex gap-1 bg-gray-200/60 border border-gray-200 rounded-md p-1 w-fit">
//         {[80, 100, 120, 100].map((w, i) => (
//           <div key={i} className="h-8 rounded bg-gray-300 animate-pulse" style={{ width: w }} />
//         ))}
//       </div>

//       {/* Content skeleton rows */}
//       <div className="space-y-3">
//         {Array.from({ length: 6 }).map((_, i) => (
//           <div key={i} className="bg-white border border-gray-200 rounded-md p-4 flex gap-4 items-center">
//             <div className="w-1 self-stretch rounded bg-gray-200 animate-pulse" />
//             <div className="flex-1 space-y-2 pl-2">
//               <SkeletonBlock h="h-3" w="w-24" />
//               <SkeletonBlock h="h-5" w="w-3/4" />
//             </div>
//             <SkeletonBlock h="h-6" w="w-20" rounded="rounded-full" />
//             <SkeletonBlock h="h-6" w="w-24" rounded="rounded-sm" />
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );

// const SelectBox = ({ value, onChange, children, className = "" }) => (
//   <select
//     value={value}
//     onChange={e => onChange(e.target.value)}
//     className={
//       "bg-white border border-gray-200 shadow-xs text-gray-800 text-sm rounded-sm px-3 py-2 " +
//       "focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer relative z-20 " +
//       className
//     }
//   >
//     {children}
//   </select>
// );

// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-white border border-gray-100 rounded-sm px-4 py-3 shadow-md text-sm z-50 relative">
//       <p className="text-gray-800 font-semibold mb-1">{label}</p>
//       {payload.map((p, i) => (
//         <p key={i} style={{ color: p.color }} className="font-medium text-xs">
//           {p.name}: <span className="text-gray-600">{p.value}</span>
//         </p>
//       ))}
//     </div>
//   );
// };

// const EmptyState = ({ message }) => (
//   <div className="flex flex-col items-center justify-center py-12 text-gray-400">
//     <Inbox strokeWidth={1.5} className="w-12 h-12 mb-3 text-gray-300" />
//     <p className="text-sm">{message}</p>
//   </div>
// );

// // ── Task Row (for Task List tab) ───────────────────────────────────────────────
// function TaskRow({ task, onClick }) {
//   const isOverdue = checkIsOverdue(task.deadline, task.status);
//   const isDone = task.status === "Done";
//   const priorityColor = PRIORITY_COLOR[task.priority] || "#94a3b8";

//   return (
//     <div
//       onClick={() => onClick(task)}
//       className={`group border shadow-sm rounded-md p-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:shadow-md transition-all relative overflow-hidden
//         ${isDone ? "bg-emerald-50/60 border-emerald-200 hover:border-emerald-400" : "bg-white border-gray-200 hover:border-indigo-300"}`}
//     >
//       <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: isDone ? "#16a34a" : priorityColor }} />

//       <div className="flex-1 min-w-0 pl-2">
//         <div className="flex items-center gap-2 mb-1 flex-wrap">
//           <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{task.projectName}</span>
//           <span className="text-gray-300">•</span>
//           <Badge label={task.priority} color={priorityColor} />
//           {isOverdue && (
//             <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-sm border border-red-200 uppercase">
//               Overdue
//             </span>
//           )}
//           {isDone && task.completedAt && (
//             <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm border border-emerald-200">
//               ✓ Completed {fnsFormat(new Date(task.completedAt), "MMM d, yyyy")}
//             </span>
//           )}
//         </div>
//         <h4 className={`text-base font-semibold truncate ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
//           {task.title}
//         </h4>
//         {/* Deadline row */}
//         <div className="flex items-center gap-3 mt-1 flex-wrap">
//           {task.deadline && !isDone && (
//             <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
//               <Calendar size={12} />
//               Due {fnsFormat(new Date(task.deadline), "MMM d, yyyy")}
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="flex items-center gap-4 text-sm text-gray-600 shrink-0">
//         <div className="flex items-center gap-1.5" title="Comments">
//           <MessageSquare size={16} className={task.comments?.length ? "text-indigo-500" : "text-gray-400"} />
//           <span className="font-medium">{task.comments?.length || 0}</span>
//         </div>

//         <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-200">
//           <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
//             {task.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
//           </div>
//           <span className="font-medium truncate max-w-[100px]">{task.assignedTo?.username}</span>
//         </div>

//         <span className={`px-2.5 py-1 rounded-sm text-xs font-bold border uppercase tracking-wider ${
//           isDone ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
//           task.status === "In Progress" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
//           "bg-gray-100 text-gray-600 border-gray-200"
//         }`}>
//           {task.status}
//         </span>
//       </div>
//     </div>
//   );
// }

// // ── Completed/Pending split list ───────────────────────────────────────────────
// function SplitTaskList({ tasks, onTaskClick, datePreset }) {
//   const [pendingPage, setPendingPage]     = useState(1);
//   const [completedPage, setCompletedPage] = useState(1);
//   const PAGE = 8;

//   const pending   = useMemo(() => tasks.filter(t => t.status !== "Done"), [tasks]);
//   const completed = useMemo(() => tasks.filter(t => t.status === "Done"), [tasks]);

//   // For "Today" we show tasks completed today; otherwise use all completed in filter window
//   const pendingTotal   = pending.length;
//   const completedTotal = completed.length;

//   const pendingPages   = Math.ceil(pending.length / PAGE)   || 1;
//   const completedPages = Math.ceil(completed.length / PAGE) || 1;

//   const pendingSlice   = pending.slice((pendingPage - 1) * PAGE, pendingPage * PAGE);
//   const completedSlice = completed.slice((completedPage - 1) * PAGE, completedPage * PAGE);

//   const Pagination = ({ page, total, onChange }) => {
//     if (total <= 1) return null;
//     return (
//       <div className="flex items-center justify-center gap-3 mt-4">
//         <button onClick={() => onChange(p => Math.max(1, p - 1))} disabled={page === 1}
//           className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40">← Prev</button>
//         <span className="text-xs text-gray-500 font-medium">Page {page} of {total}</span>
//         <button onClick={() => onChange(p => Math.min(total, p + 1))} disabled={page === total}
//           className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40">Next →</button>
//       </div>
//     );
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//       {/* Pending */}
//       <div className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
//         <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
//           <div className="flex items-center gap-2">
//             <Clock size={16} className="text-indigo-500" />
//             <h3 className="font-bold text-gray-800">Pending Tasks</h3>
//           </div>
//           <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{pendingTotal}</span>
//         </div>
//         <div className="p-4 space-y-3 max-h-[560px] overflow-y-auto">
//           {pendingSlice.length === 0 ? (
//             <div className="py-8 text-center text-gray-400 text-sm">No pending tasks 🎉</div>
//           ) : pendingSlice.map(t => {
//             const isOverdue = checkIsOverdue(t.deadline, t.status);
//             const pc = PRIORITY_COLOR[t.priority] || "#94a3b8";
//             const blue = "#3b82f6";
//             return (
//               <div key={t._id} onClick={() => onTaskClick(t)}
//                 className="border border-gray-200 rounded-md p-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all bg-white relative overflow-hidden">
//                 <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" style={{ backgroundColor: pc }} />
//                 <div className="pl-3">
//                   <div className="flex items-center gap-2 mb-1 flex-wrap">
//                     <Badge label={t.priority} color={pc} />
//                     <Badge label={t.projectName} color={blue} />
//                     {isOverdue && (
//                       <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 uppercase">Overdue</span>
//                     )}
//                   </div>
//                   <p className="text-sm font-semibold text-gray-800 truncate pt-2">{t.title}</p>
//                   <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
//                     <span className="text-xs text-gray-500">{t.assignedTo?.username}</span>

//                     {t.deadline && (
//                       <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
//                         <Calendar size={11} />
//                         Due {fnsFormat(new Date(t.deadline), "MMM d, yyyy")}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//           <Pagination page={pendingPage} total={pendingPages} onChange={setPendingPage} />
//         </div>
//       </div>

//       {/* Completed */}
//       <div className="bg-white border border-emerald-200 shadow-sm rounded-md overflow-hidden">
//         <div className="px-5 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/60">
//           <div className="flex items-center gap-2">
//             <CheckCircle size={16} className="text-emerald-600" />
//             <h3 className="font-bold text-emerald-800">Completed Tasks</h3>
//           </div>
//           <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">{completedTotal}</span>
//         </div>
//         <div className="p-4 space-y-3 max-h-[560px] overflow-y-auto">
//           {completedSlice.length === 0 ? (
//             <div className="py-8 text-center text-gray-400 text-sm">No completed tasks in this period</div>
//           ) : completedSlice.map(t => (
            
//             <div key={t._id} onClick={() => onTaskClick(t)}
//               className="border border-emerald-200 rounded-md p-3 cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all bg-emerald-50/40 relative overflow-hidden">
//               <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md bg-emerald-500" />
//               {/* add it here */}
//               <span className="text-xs border border-gray-300 text-gray-500 px-2 py-1 rounded ml-3 mb-4">{t.projectName}</span>
//               <div className="pl-3 pt-2">
//                 <p className="text-sm font-semibold text-gray-700 line-through decoration-emerald-400 truncate">{t.title}</p>
//                 <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
//                   <span className="text-xs text-gray-500">{t.assignedTo?.username}</span>
//                   {t.completedAt && (
//                     <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
//                       <CheckCircle size={11} />
//                       {fnsFormat(new Date(t.completedAt), "MMM d, yyyy")}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//           <Pagination page={completedPage} total={completedPages} onChange={setCompletedPage} />
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Overdue Task List ─────────────────────────────────────────────────────────
// function OverdueTaskList({ tasks, onTaskClick }) {
//   const overdue = useMemo(
//     () => tasks.filter(t => checkIsOverdue(t.deadline, t.status))
//       .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)),
//     [tasks]
//   );

//   if (overdue.length === 0) {
//     return (
//       <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
//         <CheckCircle className="mx-auto mb-3 text-emerald-500" size={32} />
//         <p className="text-gray-600 font-medium">No overdue tasks!</p>
//         <p className="text-gray-400 text-sm mt-1">All tasks are on track.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white border border-red-200 shadow-sm rounded-md overflow-hidden">
//       <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <AlertTriangle size={16} className="text-red-600" />
//           <h3 className="font-bold text-red-800">Overdue Tasks</h3>
//         </div>
//         <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">{overdue.length}</span>
//       </div>
//       <div className="divide-y divide-red-50">
//         {overdue.map(t => {
//           const daysOverdue = differenceInCalendarDays(new Date(), new Date(t.deadline));
//           const pc = PRIORITY_COLOR[t.priority] || "#94a3b8";
//           return (
//             <div key={t._id} onClick={() => onTaskClick(t)}
//               className="px-5 py-3 flex items-center gap-4 cursor-pointer hover:bg-red-50/50 transition-colors">
//               <div className="w-1 self-stretch rounded bg-red-400 flex-shrink-0" />
//               <div className="flex-1 min-w-0 pl-1">
//                 <div className="flex items-center gap-2 mb-0.5">
//                   <Badge label={t.priority} color={pc} />
//                   <span className="text-xs font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
//                     {daysOverdue}d overdue
//                   </span>
//                 </div>
//                 <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
//                 <p className="text-xs text-gray-500 mt-0.5">{t.projectName} · {t.assignedTo?.username}</p>
//               </div>
//               <div className="text-xs text-red-600 font-medium flex-shrink-0 flex items-center gap-1">
//                 <Calendar size={12} />
//                 {fnsFormat(new Date(t.deadline), "MMM d, yyyy")}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ── Project Report Card (unchanged as requested) ───────────────────────────────
// function ProjectReportCard({ project, tasks, completions }) {
//   const [expanded, setExpanded] = useState(false);

//   const pTasks = useMemo(() => tasks.filter(t => {
//     const pid = (t.projectId?._id || t.projectId)?.toString();
//     return pid === project._id?.toString();
//   }), [tasks, project._id]);

//   const pCompletions = useMemo(() => completions.filter(c => {
//     const pid = (c.projectId?._id || c.projectId)?.toString();
//     return pid === project._id?.toString();
//   }), [completions, project._id]);

//   const completedTasksList = pTasks.filter(t => t.status === "Done");
//   const pendingTasksList   = pTasks.filter(t => t.status !== "Done");

//   const pieData = useMemo(() => {
//     const map = {};
//     pCompletions.forEach(c => {
//       const dev = c.completedBy?.username || "Unknown";
//       map[dev] = (map[dev] || 0) + 1;
//     });
//     return Object.entries(map).map(([name, value]) => ({ name, value }));
//   }, [pCompletions]);

//   const statusData = useMemo(() => {
//     const map = {};
//     pTasks.forEach(t => {
//       const dev = t.assignedTo?.username || "Unknown";
//       if (!map[dev]) map[dev] = { name: dev, Done: 0, Pending: 0 };
//       if (t.status === "Done") map[dev].Done++;
//       else map[dev].Pending++;
//     });
//     return Object.values(map);
//   }, [pTasks]);

//   const priorityData = useMemo(() => {
//     const map = {};
//     pTasks.filter(t => t.status !== "Done").forEach(t => {
//       const dev = t.assignedTo?.username || "Unknown";
//       if (!map[dev]) map[dev] = { name: dev, Critical: 0, High: 0, Medium: 0, Low: 0 };
//       if (t.priority in map[dev]) map[dev][t.priority]++;
//     });
//     return Object.values(map);
//   }, [pTasks]);

//   return (
//     <div className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
//       <div
//         onClick={() => setExpanded(!expanded)}
//         className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
//       >
//         <div className="flex items-center gap-3">
//           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md"><Folder size={24} /></div>
//           <div>
//             <h3 className="text-lg font-bold text-gray-900">{project.projectName}</h3>
//             <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
//               <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${project.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
//                 {project.status}
//               </span>
//               <span>•</span>
//               <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border bg-indigo-50 text-indigo-700 border-indigo-200">
//                 {completedTasksList.length} / {pTasks.length} Completed
//               </span>
//               <span>•</span>
//               <span>{(project.serviceType || []).join(", ") || "No Services"}</span>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-6">
//           <div className="hidden md:flex flex-col text-right">
//             <span className="text-xs text-gray-400 font-semibold uppercase">Assigned Team</span>
//             <span className="text-sm font-medium text-gray-700">
//               {project.assignedDeveloper?.map(d => d.username).join(", ") || "Unassigned"}
//             </span>
//           </div>
//           <div className="text-gray-400">{expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {expanded && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className="border-t border-gray-100 bg-gray-50/50"
//           >
//             <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
//                 <h4 className="text-sm font-bold text-gray-800 mb-4 text-center">Developer Contribution % (Completed Tasks)</h4>
//                 {pieData.length === 0 ? <EmptyState message="No completed tasks" /> : (
//                   <ResponsiveContainer width="100%" height={220}>
//                     <PieChart>
//                       <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value"
//                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
//                         {pieData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
//                       </Pie>
//                       <Tooltip content={<CustomTooltip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 )}
//               </div>

//               <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
//                 <h4 className="text-sm font-bold text-gray-800 mb-4 text-center">Pending vs Completed</h4>
//                 {statusData.length === 0 ? <EmptyState message="No tasks assigned" /> : (
//                   <ResponsiveContainer width="100%" height={220}>
//                     <BarChart data={statusData} barCategoryGap="20%">
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                       <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
//                       <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend wrapperStyle={{ fontSize: 12 }} />
//                       <Bar dataKey="Done" fill="#16a34a" radius={[2,2,0,0]} stackId="a" />
//                       <Bar dataKey="Pending" fill="#4f46e5" radius={[2,2,0,0]} stackId="a" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 )}
//               </div>

//               <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
//                 <h4 className="text-sm font-bold text-gray-800 mb-4 text-center">Open Tasks by Priority</h4>
//                 {priorityData.length === 0 ? <EmptyState message="No open tasks" /> : (
//                   <ResponsiveContainer width="100%" height={220}>
//                     <BarChart data={priorityData} barCategoryGap="20%">
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                       <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
//                       <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend wrapperStyle={{ fontSize: 12 }} />
//                       <Bar dataKey="Critical" fill={PRIORITY_COLOR.Critical} stackId="p" />
//                       <Bar dataKey="High"     fill={PRIORITY_COLOR.High}     stackId="p" />
//                       <Bar dataKey="Medium"   fill={PRIORITY_COLOR.Medium}   stackId="p" />
//                       <Bar dataKey="Low"      fill={PRIORITY_COLOR.Low}      stackId="p" radius={[2,2,0,0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 )}
//               </div>

//               <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
//                 <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
//                   <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
//                     Pending Tasks
//                     <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{pendingTasksList.length}</span>
//                   </h4>
//                   <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
//                     {pendingTasksList.length === 0 ? <p className="text-sm text-gray-400">All caught up!</p>
//                       : pendingTasksList.map(t => (
//                       <div key={t._id} className="text-sm border border-gray-100 bg-gray-50 p-3 rounded flex justify-between items-start gap-2">
//                         <div>
//                           <p className="font-semibold text-gray-800">{t.title}</p>
//                           <p className="text-xs text-gray-500 mt-1">Dev: <span className="font-medium text-gray-700">{t.assignedTo?.username}</span></p>
//                         </div>
//                         <Badge label={t.priority} color={PRIORITY_COLOR[t.priority] || "#94a3b8"} />
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="bg-white border border-emerald-200 rounded-md p-4 shadow-sm">
//                   <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center justify-between">
//                     Completed Tasks
//                     <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{completedTasksList.length}</span>
//                   </h4>
//                   <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
//                     {completedTasksList.length === 0 ? <p className="text-sm text-gray-400">No completed tasks yet.</p>
//                       : completedTasksList.map(t => (
//                       <div key={t._id} className="text-sm border border-emerald-100 bg-emerald-50/50 p-3 rounded flex justify-between items-start gap-2">
//                         <div>
//                           <p className="font-semibold text-emerald-900 line-through decoration-emerald-300">{t.title}</p>
//                           <p className="text-xs text-emerald-600 mt-1">Completed by: <span className="font-medium text-emerald-800">{t.assignedTo?.username}</span></p>
//                         </div>
//                         <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ── Main Dashboard ────────────────────────────────────────────────────────────
// export default function DeveloperReports() {
//   const [projects,        setProjects]        = useState([]);
//   const [allTasks,        setAllTasks]        = useState([]);
//   const [completions,     setCompletions]     = useState([]);
//   const [loadingProjects, setLoadingProjects] = useState(true);
//   const [loadingTasks,    setLoadingTasks]    = useState(false);
//   const [error,           setError]           = useState(null);

//   const [selectedProject,  setSelectedProject]  = useState("all");
//   const [selectedDev,      setSelectedDev]      = useState("all");
//   const [statusFilter,     setStatusFilter]     = useState("all");
//   const [priorityFilter,   setPriorityFilter]   = useState("all");
//   const [datePreset,       setDatePreset]       = useState("All Time");
//   const [customFrom,       setCustomFrom]       = useState("");
//   const [customTo,         setCustomTo]         = useState("");
//   const [activeTab,        setActiveTab]        = useState("tasks");
//   const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

//   // ── Fetch projects ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(PROJECT_ENDPOINT, { headers: { Authorization: `Bearer ${getToken()}` } });
//         if (!res.ok) throw new Error(`Projects fetch failed (${res.status}).`);
//         const data = await res.json();
//         setProjects(Array.isArray(data) ? data : data.projects ?? []);
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoadingProjects(false);
//       }
//     })();
//   }, []);

//   // ── Fetch tasks + comments + completions ───────────────────────────────────
//   useEffect(() => {
//     if (!projects.length) return;
//     const targets = selectedProject === "all"
//       ? projects
//       : projects.filter(p => p._id === selectedProject);
//     if (!targets.length) return;

//     (async () => {
//       setLoadingTasks(true);
//       setError(null);
//       try {
//         const taskResults = await Promise.all(targets.map(p => authFetch(`${API_BASE}/api/tasks/${p._id}`)));
//         const rawFlatTasks = taskResults.flat();

//         const tasksWithComments = await Promise.all(
//           rawFlatTasks.map(async t => {
//             const pid = (t.projectId?._id || t.projectId)?.toString();
//             const commentsRes = await authFetch(`${API_BASE}/api/tasks/${pid}/${t._id}/comments`).catch(() => []);
//             return {
//               ...t,
//               projectName: resolveProjectName(targets, t.projectId),
//               comments: Array.isArray(commentsRes) ? commentsRes : [],
//             };
//           })
//         );

//         setAllTasks(tasksWithComments);

//         const compResults = await Promise.all(targets.map(p => authFetch(`${API_BASE}/api/tasks/${p._id}/completions`)));
//         setCompletions(compResults.flat());
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoadingTasks(false);
//       }
//     })();
//   }, [projects, selectedProject]);

//   // ── Date window ────────────────────────────────────────────────────────────
//   const { fromDate, toDate } = useMemo(() => {
//     if (datePreset === "Custom") {
//       return {
//         fromDate: customFrom ? new Date(customFrom) : null,
//         toDate:   customTo   ? new Date(customTo)   : null,
//       };
//     }
//     const preset = DATE_PRESETS.find(d => d.label === datePreset);
//     return { fromDate: preset?.from ?? null, toDate: preset?.to ?? null };
//   }, [datePreset, customFrom, customTo]);

//   /**
//    * Core filter logic.
//    *
//    * For PENDING tasks we check createdAt against the date window — a task
//    * created before the window is still pending "now" so we include it when
//    * the window doesn't have a lower bound (e.g. "All Time", "Today" means
//    * "show me what's pending right now regardless of when it was created").
//    *
//    * For COMPLETED tasks we gate on completedAt so "Today" = completed today.
//    *
//    * The combined list (used for stat cards and charts) applies the rule:
//    *   - Pending tasks: always included (they're still open), date filter is
//    *     applied on createdAt only as a secondary refinement when a window
//    *     is explicitly chosen.
//    *   - Completed tasks: gated on completedAt so the period makes sense.
//    *
//    * Special case "Today": pending means CURRENTLY pending (no date gate on
//    * pending), completed means completed today.
//    */
//   const filteredTasks = useMemo(() => {
//     return allTasks.filter(t => {
//       if (selectedDev     !== "all" && t.assignedTo?.username !== selectedDev)  return false;
//       if (statusFilter    === "complete"   && t.status !== "Done")              return false;
//       if (statusFilter    === "incomplete" && t.status === "Done")              return false;
//       if (priorityFilter  !== "all"        && t.priority !== priorityFilter)    return false;

//       // Date window
//       if (fromDate || toDate) {
//         if (t.status === "Done") {
//           // Completed tasks: gate on completedAt
//           const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
//           if (fromDate && ref < fromDate) return false;
//           if (toDate   && ref > toDate)   return false;
//         } else {
//           // Pending tasks: always show — they're still open.
//           // Only apply createdAt gate when NOT a "today/this-week" type preset
//           // (for those presets we want "tasks pending RIGHT NOW", not "tasks
//           // created in the window").
//           // We skip the createdAt gate entirely for pending tasks so the user
//           // always sees their outstanding work.
//         }
//       }

//       return true;
//     });
//   }, [allTasks, selectedDev, statusFilter, priorityFilter, fromDate, toDate]);

//   const developers = useMemo(
//     () => [...new Set(allTasks.map(t => t.assignedTo?.username).filter(Boolean))],
//     [allTasks]
//   );

//   // ── Stats — pending = still open, completed = done in window ──────────────
//   const stats = useMemo(() => {
//     const allPending   = allTasks.filter(t => t.status !== "Done");
//     const allCompleted = allTasks.filter(t => {
//       if (t.status !== "Done") return false;
//       if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
//       if (fromDate || toDate) {
//         const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
//         if (fromDate && ref < fromDate) return false;
//         if (toDate   && ref > toDate)   return false;
//       }
//       return true;
//     });

//     // apply dev filter to pending too
//     const pending = selectedDev !== "all"
//       ? allPending.filter(t => t.assignedTo?.username === selectedDev)
//       : allPending;

//     const overdue  = pending.filter(t => checkIsOverdue(t.deadline, t.status)).length;
//     const critical = pending.filter(t => t.priority === "Critical").length;

//     return {
//       total:     pending.length + allCompleted.length,
//       done:      allCompleted.length,
//       pending:   pending.length,
//       overdue,
//       critical,
//     };
//   }, [allTasks, selectedDev, fromDate, toDate]);

//   // ── Dev Activity chart data — same window logic ────────────────────────────
//   const devBarData = useMemo(() => {
//     const map = {};
//     // Pending: all currently pending (for chosen dev)
//     allTasks.filter(t => t.status !== "Done").forEach(t => {
//       if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return;
//       if (priorityFilter !== "all" && t.priority !== priorityFilter) return;
//       const name = t.assignedTo?.username || "Unknown";
//       if (!map[name]) map[name] = { name, Done: 0, Pending: 0 };
//       map[name].Pending++;
//     });
//     // Completed: gated on completedAt window
//     allTasks.filter(t => {
//       if (t.status !== "Done") return false;
//       if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
//       if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
//       if (fromDate || toDate) {
//         const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
//         if (fromDate && ref < fromDate) return false;
//         if (toDate   && ref > toDate)   return false;
//       }
//       return true;
//     }).forEach(t => {
//       const name = t.assignedTo?.username || "Unknown";
//       if (!map[name]) map[name] = { name, Done: 0, Pending: 0 };
//       map[name].Done++;
//     });
//     return Object.values(map).sort((a, b) => (b.Done + b.Pending) - (a.Done + a.Pending));
//   }, [allTasks, selectedDev, priorityFilter, fromDate, toDate]);

//   const devPieData = useMemo(() => {
//     const map = {};
//     allTasks.filter(t => {
//       if (t.status !== "Done") return false;
//       if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
//       if (fromDate || toDate) {
//         const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
//         if (fromDate && ref < fromDate) return false;
//         if (toDate   && ref > toDate)   return false;
//       }
//       return true;
//     }).forEach(t => {
//       const name = t.assignedTo?.username || "Unknown";
//       map[name] = (map[name] || 0) + 1;
//     });
//     return Object.entries(map).map(([name, value]) => ({ name, value }));
//   }, [allTasks, selectedDev, fromDate, toDate]);

//   const completionBarData = useMemo(() => {
//     const filtered = completions.filter(c => {
//       const d = new Date(c.completedAt);
//       if (fromDate && d < fromDate) return false;
//       if (toDate   && d > toDate)   return false;
//       if (selectedProject !== "all") {
//         const cPid = (c.projectId?._id || c.projectId)?.toString();
//         if (cPid !== selectedProject) return false;
//       }
//       if (selectedDev !== "all" && c.completedBy?.username !== selectedDev) return false;
//       return true;
//     });
//     const map = {};
//     filtered.forEach(c => {
//       const name = c.completedBy?.username || "Unknown";
//       map[name] = (map[name] || 0) + 1;
//     });
//     return Object.entries(map)
//       .map(([name, Completed]) => ({ name, Completed }))
//       .sort((a, b) => b.Completed - a.Completed);
//   }, [completions, fromDate, toDate, selectedProject, selectedDev]);

//   // ── Per-dev cards: pending = currently open, done = in window ─────────────
//   const devCardData = useMemo(() => {
//     return developers.map((dev, i) => {
//       const pendingTasks = allTasks.filter(t =>
//         t.status !== "Done" && t.assignedTo?.username === dev
//       );
//       const doneTasks = allTasks.filter(t => {
//         if (t.status !== "Done" || t.assignedTo?.username !== dev) return false;
//         if (fromDate || toDate) {
//           const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
//           if (fromDate && ref < fromDate) return false;
//           if (toDate   && ref > toDate)   return false;
//         }
//         return true;
//       });
//       const overdueCount = pendingTasks.filter(t => checkIsOverdue(t.deadline, t.status)).length;
//       const total = pendingTasks.length + doneTasks.length;
//       const pct   = total ? Math.round((doneTasks.length / total) * 100) : 0;
//       return { dev, i, pendingTasks, doneTasks, overdueCount, total, pct };
//     });
//   }, [developers, allTasks, fromDate, toDate]);

//   if (loadingProjects || loadingTasks) return <PageLoader />;

//   return (
//     <div className="min-h-screen bg-[#F6F8FA] text-gray-800 font-sans text-base pb-10 relative">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
//         .font-sans    { font-family: 'DM Sans', sans-serif; }
//         .font-display { font-family: 'Space Grotesk', sans-serif; }
//       `}</style>

//       {/* ── Header ── */}
//       <div className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-30 px-6 py-4 shadow-sm">
//         <div className="max-w-[95%] mx-auto flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Developer Reports</h1>
//             <p className="text-gray-500 text-sm mt-0.5">Task analytics &amp; team activity</p>
//           </div>
//           <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
//             <span className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-500" />
//             {allTasks.length} tasks loaded
//           </div>
//         </div>
//       </div>

//       <div className="max-w-[95%] mx-auto px-6 py-6 space-y-6 relative z-10">

//         {/* ── Filters ── */}
//         <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
//           className="bg-white border border-gray-200 shadow-sm rounded-md p-5 relative z-20">
//           <div className="flex flex-wrap gap-4 items-end">
//             <div className="flex flex-col gap-1.5 relative z-20">
//               <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Project</label>
//               <SelectBox value={selectedProject} onChange={v => { setSelectedProject(v); setSelectedDev("all"); }}>
//                 <option value="all">All Projects</option>
//                 {projects.map(p => <option key={p._id} value={p._id}>{p.projectName || p.title || p._id}</option>)}
//               </SelectBox>
//             </div>
//             <div className="flex flex-col gap-1.5 relative z-20">
//               <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Developer</label>
//               <SelectBox value={selectedDev} onChange={setSelectedDev}>
//                 <option value="all">All Developers</option>
//                 {developers.map(d => <option key={d} value={d}>{d}</option>)}
//               </SelectBox>
//             </div>
//             <div className="flex flex-col gap-1.5 relative z-20">
//               <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</label>
//               <SelectBox value={statusFilter} onChange={setStatusFilter}>
//                 <option value="all">All</option>
//                 <option value="complete">Completed</option>
//                 <option value="incomplete">Incomplete</option>
//               </SelectBox>
//             </div>
//             <div className="flex flex-col gap-1.5 relative z-20">
//               <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Priority</label>
//               <SelectBox value={priorityFilter} onChange={setPriorityFilter}>
//                 <option value="all">All</option>
//                 {["Critical","High","Medium","Low"].map(p => <option key={p} value={p}>{p}</option>)}
//               </SelectBox>
//             </div>
//             <div className="flex flex-col gap-1.5 relative z-20">
//               <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Period</label>
//               <SelectBox value={datePreset} onChange={setDatePreset}>
//                 {DATE_PRESETS.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
//                 <option value="Custom">Custom Range</option>
//               </SelectBox>
//             </div>
//             {datePreset === "Custom" && (
//               <>
//                 <div className="flex flex-col gap-1.5 relative z-20">
//                   <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">From</label>
//                   <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
//                     className="bg-white border border-gray-200 shadow-sm text-sm rounded-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div className="flex flex-col gap-1.5 relative z-20">
//                   <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">To</label>
//                   <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
//                     className="bg-white border border-gray-200 shadow-sm text-sm rounded-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//               </>
//             )}
//           </div>
//         </motion.div>

//         {/* Error */}
//         <AnimatePresence>
//           {error && (
//             <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
//               className="bg-red-50 border border-red-200 text-red-600 rounded-md px-4 py-3 text-sm shadow-sm flex items-center">
//               <AlertCircle size={18} className="mr-2 flex-shrink-0" />{error}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* ── Stat cards ── */}
//         <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10"
//           initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
//           {[
//             { label:"Total Tasks",   value:stats.total,    color:"#4f46e5", icon:<ClipboardList size={22} /> },
//             { label:"Completed",     value:stats.done,     color:"#16a34a", icon:<CheckCircle   size={22} /> },
//             { label:"Pending",       value:stats.pending,  color:"#64748b", icon:<Clock         size={22} /> },
//             { label:"Overdue",       value:stats.overdue,  color:"#dc2626", icon:<AlertOctagon  size={22} /> },
//             { label:"Critical Open", value:stats.critical, color:"#ea580c", icon:<Flame         size={22} /> },
//           ].map(card => (
//             <motion.div key={card.label}
//               variants={{ hidden:{ opacity:0, y:12 }, show:{ opacity:1, y:0 } }}
//               className="bg-white border border-gray-200 shadow-sm rounded-md p-4 flex flex-col gap-2 hover:border-indigo-300 transition-colors">
//               <div className="flex items-center justify-between">
//                 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{card.label}</span>
//                 <span style={{ color:card.color }} className="opacity-80">{card.icon}</span>
//               </div>
//               <p className="text-3xl font-bold font-display" style={{ color:card.color }}>{card.value}</p>
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* ── Tab bar ── */}
//         <div className="flex gap-1 bg-gray-200/60 border border-gray-200 rounded-md p-1 w-fit relative z-20 flex-wrap">
//           {[
//             { id:"tasks",         label:"Task List" },
//             { id:"overdue",       label:"Overdue" },
//             { id:"dev-activity",  label:"Dev Activity" },
//             { id:"project-chart", label:"Project Charts" },
//           ].map(tab => (
//             <button key={tab.id} onClick={() => setActiveTab(tab.id)}
//               className={"px-4 py-2 rounded text-sm font-bold transition-all " +
//                 (activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-800")}>
//               {tab.label}
//               {tab.id === "overdue" && stats.overdue > 0 && (
//                 <span className="ml-1.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">{stats.overdue}</span>
//               )}
//             </button>
//           ))}
//         </div>

//         <AnimatePresence mode="wait">

//           {/* ── Tab: Task List ── */}
//           {activeTab === "tasks" && (
//             <motion.div key="tasks" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
//               exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-4 relative z-10">
//               <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm flex items-center justify-between">
//                 <h2 className="text-lg font-bold text-gray-800">Tasks</h2>
//                 <span className="text-sm font-medium text-gray-500">{filteredTasks.length} tasks</span>
//               </div>
//               {filteredTasks.length === 0
//                 ? <EmptyState message="No tasks match your filters" />
//                 : <SplitTaskList tasks={filteredTasks} onTaskClick={setSelectedTaskDetails} datePreset={datePreset} />
//               }
//             </motion.div>
//           )}

//           {/* ── Tab: Overdue ── */}
//           {activeTab === "overdue" && (
//             <motion.div key="overdue" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
//               exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-4 relative z-10">
//               <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm flex items-center justify-between">
//                 <h2 className="text-lg font-bold text-gray-800">Overdue Tasks</h2>
//                 <span className="text-sm font-medium text-red-600 font-bold">{stats.overdue} overdue</span>
//               </div>
//               <OverdueTaskList tasks={filteredTasks} onTaskClick={setSelectedTaskDetails} />
//             </motion.div>
//           )}

//           {/* ── Tab: Dev Activity ── */}
//           {activeTab === "dev-activity" && (
//             <motion.div key="dev-activity" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
//               exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-6 relative z-10">

//               {/* Context note about date window */}
//               <div className="bg-indigo-50 border border-indigo-200 rounded-md px-4 py-2.5 text-sm text-indigo-700 flex items-center gap-2">
//                 <Clock size={14} />
//                 <span>
//                   <strong>Completed</strong> counts reflect tasks finished within <strong>{datePreset}</strong>.
//                   &nbsp;<strong>Pending</strong> counts show all currently open tasks regardless of date.
//                 </span>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Completions in period */}
//                 <div className="bg-white border border-gray-200 shadow-sm rounded-md p-5">
//                   <h3 className="font-bold font-display text-gray-900 mb-1">Completions in Period</h3>
//                   <p className="text-sm text-gray-500 mb-5">Tasks marked Done · {datePreset}</p>
//                   {completionBarData.length === 0 ? <EmptyState message="No completions in this period" /> : (
//                     <ResponsiveContainer width="100%" height={280}>
//                       <BarChart data={completionBarData} barCategoryGap="30%" margin={{ top:20, right:30, left:0, bottom:10 }}>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                         <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
//                         <YAxis tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
//                         <Tooltip content={<CustomTooltip />} />
//                         <Bar dataKey="Completed" radius={[4,4,0,0]}>
//                           {completionBarData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
//                         </Bar>
//                       </BarChart>
//                     </ResponsiveContainer>
//                   )}
//                 </div>

//                 {/* Contribution pie */}
//                 <div className="bg-white border border-gray-200 shadow-sm rounded-md p-5">
//                   <h3 className="font-bold font-display text-gray-900 mb-1">Total Contribution</h3>
//                   <p className="text-sm text-gray-500 mb-5">% of Completed Tasks per Developer · {datePreset}</p>
//                   {devPieData.length === 0 ? <EmptyState message="No completed tasks match filters" /> : (
//                     <ResponsiveContainer width="100%" height={280}>
//                       <PieChart>
//                         <Pie data={devPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
//                           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
//                           {devPieData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
//                         </Pie>
//                         <Tooltip content={<CustomTooltip />} />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   )}
//                 </div>
//               </div>

//               {/* Pending vs Completed stacked bar */}
//               <div className="bg-white border border-gray-200 shadow-sm rounded-md p-5">
//                 <h3 className="font-bold font-display text-gray-900 mb-1">Task Breakdown</h3>
//                 <p className="text-sm text-gray-500 mb-5">
//                   Completed (in {datePreset}) vs Pending (currently open)
//                 </p>
//                 {devBarData.length === 0 ? <EmptyState message="No tasks match filters" /> : (
//                   <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={devBarData} barCategoryGap="25%" margin={{ top:20, right:30, left:0, bottom:10 }}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                       <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
//                       <YAxis tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend wrapperStyle={{ fontSize:13 }} />
//                       <Bar dataKey="Done"    fill="#16a34a" radius={[2,2,0,0]} stackId="a" />
//                       <Bar dataKey="Pending" fill="#4f46e5" radius={[2,2,0,0]} stackId="a" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 )}
//               </div>

//               {/* Per-dev cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {devCardData.length === 0 && <EmptyState message="No developer data yet" />}
//                 {devCardData.map(({ dev, i, pendingTasks, doneTasks, overdueCount, total, pct }) => (
//                   <motion.div key={dev}
//                     initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
//                     transition={{ delay:i * 0.05 }}
//                     className="bg-white border border-gray-200 shadow-sm rounded-md p-5 hover:border-indigo-300 transition-colors">
//                     <div className="flex items-center gap-3 mb-4">
//                       <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm"
//                         style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }}>
//                         {dev[0]?.toUpperCase()}
//                       </div>
//                       <div>
//                         <p className="font-bold text-gray-900 text-base">{dev}</p>
//                         <p className="text-sm text-gray-500">{total} tasks total</p>
//                       </div>
//                     </div>

//                     {/* Progress bar: done / (done + pending) */}
//                     <div className="mb-4">
//                       <div className="flex justify-between text-sm text-gray-600 font-bold mb-1.5">
//                         <span>Completion</span>
//                         <span>{pct}%</span>
//                       </div>
//                       <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
//                         <motion.div className="h-full rounded-full"
//                           style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }}
//                           initial={{ width:0 }} animate={{ width:`${pct}%` }}
//                           transition={{ duration:0.8, delay:i * 0.08 }} />
//                       </div>
//                       <p className="text-xs text-gray-400 mt-1">
//                         {doneTasks.length} done in {datePreset} · {pendingTasks.length} still pending
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-3 gap-2 text-center">
//                       {[
//                         { label:"Done",    value:doneTasks.length,    color:"#16a34a", bg:"bg-green-50" },
//                         { label:"Pending", value:pendingTasks.length, color:"#4f46e5", bg:"bg-indigo-50" },
//                         { label:"Overdue", value:overdueCount,        color:"#dc2626", bg:"bg-red-50" },
//                       ].map(s => (
//                         <div key={s.label} className={`${s.bg} border border-gray-100 rounded-md py-2 px-1`}>
//                           <p className="font-bold text-lg" style={{ color:s.color }}>{s.value}</p>
//                           <p className="text-xs text-gray-500 font-bold uppercase">{s.label}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>
//           )}

//           {/* ── Tab: Project Charts (unchanged) ── */}
//           {activeTab === "project-chart" && (
//             <motion.div key="project-chart" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
//               exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-6 relative z-10">
//               {projects.length === 0 ? <EmptyState message="No active projects" />
//                 : projects
//                     .filter(p => selectedProject === "all" || p._id === selectedProject)
//                     .map(project => (
//                   <ProjectReportCard key={project._id} project={project} tasks={allTasks} completions={completions} />
//                 ))}
//             </motion.div>
//           )}

//         </AnimatePresence>
//       </div>

//       {/* ── Task Details Modal ── */}
//       <AnimatePresence>
//         {selectedTaskDetails && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//             <motion.div
//               initial={{ opacity:0, scale:0.95, y:20 }}
//               animate={{ opacity:1, scale:1, y:0 }}
//               exit={{ opacity:0, scale:0.95, y:20 }}
//               className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-[101]"
//             >
//               <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50">
//                 <div>
//                   <div className="flex items-center gap-2 mb-1 flex-wrap">
//                     <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{selectedTaskDetails.projectName}</span>
//                     <span className="text-gray-300">•</span>
//                     <Badge label={selectedTaskDetails.priority} color={PRIORITY_COLOR[selectedTaskDetails.priority] || "#94a3b8"} />
//                     {selectedTaskDetails.status === "Done" && (
//                       <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
//                         ✓ Completed
//                       </span>
//                     )}
//                   </div>
//                   <h2 className={`text-xl font-bold ${selectedTaskDetails.status === "Done" ? "line-through text-gray-400" : "text-gray-900"}`}>
//                     {selectedTaskDetails.title}
//                   </h2>
//                 </div>
//                 <button onClick={() => setSelectedTaskDetails(null)}
//                   className="p-1 hover:bg-gray-200 rounded text-gray-500 transition">
//                   <X size={20} />
//                 </button>
//               </div>

//               <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
//                   <div>
//                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
//                     <p className="text-sm font-semibold text-gray-800">{selectedTaskDetails.status}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assignee</p>
//                     <p className="text-sm font-semibold text-gray-800">{selectedTaskDetails.assignedTo?.username}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Created By</p>
//                     <p className="text-sm font-semibold text-gray-800">{selectedTaskDetails.createdBy?.username}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
//                     <p className={`text-sm font-semibold ${checkIsOverdue(selectedTaskDetails.deadline, selectedTaskDetails.status) ? "text-red-600" : "text-gray-800"}`}>
//                       {selectedTaskDetails.deadline
//                         ? fnsFormat(new Date(selectedTaskDetails.deadline), "MMM d, yyyy")
//                         : "None"}
//                     </p>
//                   </div>
//                   {selectedTaskDetails.status === "Done" && selectedTaskDetails.completedAt && (
//                     <div className="sm:col-span-4 bg-emerald-50 rounded-md p-3 border border-emerald-200 flex items-center gap-2">
//                       <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
//                       <p className="text-sm text-emerald-700 font-medium">
//                         Completed on {fnsFormat(new Date(selectedTaskDetails.completedAt), "MMMM d, yyyy · h:mm a")}
//                         {selectedTaskDetails.completedBy?.username && ` by ${selectedTaskDetails.completedBy.username}`}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <h4 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Description</h4>
//                   <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white border border-gray-200 p-4 rounded-md leading-relaxed">
//                     {selectedTaskDetails.description || <span className="italic text-gray-400">No description provided.</span>}
//                   </div>
//                 </div>

//                 {selectedTaskDetails.links?.length > 0 && (
//                   <div>
//                     <h4 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Links</h4>
//                     <div className="flex flex-col gap-2">
//                       {selectedTaskDetails.links.map((link, idx) => (
//                         <a key={idx} href={link} target="_blank" rel="noopener noreferrer"
//                           className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 hover:underline truncate">
//                           <ExternalLink size={14} />{link}
//                         </a>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div>
//                   <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
//                     <MessageSquare size={16} /> Comments ({selectedTaskDetails.comments?.length || 0})
//                   </h4>
//                   <div className="space-y-3">
//                     {(!selectedTaskDetails.comments || selectedTaskDetails.comments.length === 0) ? (
//                       <p className="text-sm text-gray-400 italic">No comments yet.</p>
//                     ) : selectedTaskDetails.comments.map((comment, idx) => (
//                       <div key={idx} className="bg-gray-50 border border-gray-100 p-3 rounded-md">
//                         <div className="flex items-center justify-between mb-1">
//                           <span className="text-sm font-bold text-gray-900">
//                             {comment.createdBy?.username || comment.user?.username || "Unknown"}
//                           </span>
//                           <span className="text-xs font-medium text-gray-400">
//                             {comment.createdAt ? fnsFormat(new Date(comment.createdAt), "MMM d, yyyy · h:mm a") : ""}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-700">{comment.text}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #D0D7DE; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8C959F; }
//       `}</style>
//     </div>
//   );
// }




















import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Calendar, AlertCircle,
  ClipboardList, CheckCircle, Clock, AlertOctagon, Flame,
  MessageSquare, ExternalLink, ChevronDown, ChevronUp, X, Folder,
  AlertTriangle,
} from "lucide-react";
import { differenceInCalendarDays, format as fnsFormat } from "date-fns";
// Redis client — installed globally: npm install -g ioredis
// In Vite/React frontend we use a lightweight browser-compatible Redis client.
// We use `ioredis` is server-side only; for the browser we use a simple
// in-memory LRU cache that mirrors the Redis API surface (get/set/del/exists).
// If you have a Redis-over-HTTP proxy (e.g. Upstash REST API), swap the
// cache.get / cache.set calls to hit that endpoint instead.

// ── Browser-compatible in-memory cache (Redis-like interface) ─────────────────
// Stores { value, expiresAt } with optional TTL (seconds).
// Replace `MemoryCache` with Upstash Redis fetch calls if you have a REST proxy.
class MemoryCache {
  constructor(maxEntries = 200) {
    this._store = new Map();
    this._max = maxEntries;
  }
  _evict() {
    if (this._store.size >= this._max) {
      // evict the oldest entry
      const firstKey = this._store.keys().next().value;
      this._store.delete(firstKey);
    }
  }
  set(key, value, ttlSeconds = 300) {
    this._evict();
    this._store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }
  del(key) { this._store.delete(key); }
  exists(key) { return this.get(key) !== null; }
  // Flush all keys matching a prefix
  flushPrefix(prefix) {
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) this._store.delete(key);
    }
  }
}

// Singleton cache — 5-minute TTL by default
const cache = new MemoryCache(200);
const CACHE_TTL = 300; // seconds

// ── Constants ─────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
const PROJECT_ENDPOINT = `${API_BASE}/api/newproject/projects`;

const PRIORITY_COLOR = {
  Critical: "#ef4444",
  High:     "#f97316",
  Medium:   "#eab308",
  Low:      "#22c55e",
};

const DEV_PALETTE = [
  "#6366f1","#ec4899","#14b8a6","#f97316","#8b5cf6","#06b6d4","#84cc16","#f43f5e",
];

// ── Date presets ──────────────────────────────────────────────────────────────
function buildPresets() {
  const n = new Date();
  const todayStart = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  return [
    { label: "Today",         from: todayStart, to: null },
    { label: "This Week",     from: new Date(n - 7  * 86400000), to: null },
    { label: "Last 2 Weeks",  from: new Date(n - 14 * 86400000), to: null },
    { label: "This Month",    from: new Date(n.getFullYear(), n.getMonth(), 1), to: null },
    { label: "Last Month",    from: new Date(n.getFullYear(), n.getMonth() - 1, 1),
                              to:   new Date(n.getFullYear(), n.getMonth(), 0) },
    { label: "Last 3 Months", from: new Date(n - 90 * 86400000), to: null },
    { label: "All Time",      from: null, to: null },
  ];
}
const DATE_PRESETS = buildPresets();

// ── Helpers ───────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token") || "";

const authFetch = async (url) => {
  // Check cache first
  const cached = cache.get(url);
  if (cached !== null) return cached;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  const data = res.ok ? await res.json() : [];
  cache.set(url, data, CACHE_TTL);
  return data;
};

const resolveProjectName = (projectsList, projectId) => {
  const pid = (projectId?._id || projectId)?.toString();
  const match = projectsList.find(p => p._id?.toString() === pid);
  return match?.projectName || match?.title || "Unknown";
};

const checkIsOverdue = (deadline, status) => {
  if (!deadline || status === "Done") return false;
  const d = new Date(deadline);
  const endOfDeadlineDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return endOfDeadlineDay <= new Date();
};

// Build a stable cache key from filters
const buildCacheKey = (prefix, projectId, datePreset, customFrom, customTo) =>
  `${prefix}:${projectId}:${datePreset}:${customFrom}:${customTo}`;

// ── Shared UI components ──────────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <span
    style={{ background: color + "15", color, border: `1px solid ${color}33` }}
    className="text-xs font-semibold px-2 py-0.5 rounded-sm whitespace-nowrap uppercase tracking-wider"
  >
    {label}
  </span>
);

// ── Shimmer base (shared wave animation) ──────────────────────────────────────
const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent`;

const SkeletonBlock = ({ h = "h-4", w = "w-full", rounded = "rounded" }) => (
  <div className={`${h} ${w} ${rounded} bg-gray-200 animate-pulse`} />
);

// ── Full-page loader shown while projects are being fetched ───────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-[#F6F8FA] font-sans">
    <style>{`
      @keyframes shimmer { 100% { transform: translateX(100%); } }
      @keyframes spin-slow { to { transform: rotate(360deg); } }
    `}</style>

    {/* Header skeleton */}
    <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="max-w-[95%] mx-auto flex items-center justify-between">
        <div className="space-y-2.5">
          <div className={`h-7 w-52 rounded-md bg-gray-200 ${shimmer}`} />
          <div className={`h-3.5 w-36 rounded bg-gray-200 ${shimmer}`} />
        </div>
        <div className={`h-8 w-32 rounded-full bg-gray-200 ${shimmer}`} />
      </div>
    </div>

    <div className="max-w-[95%] mx-auto px-6 py-6 space-y-6">
      {/* Filter bar skeleton */}
      <div className="bg-white border border-gray-200 rounded-md p-5 flex gap-5 flex-wrap items-end">
        {[{ lw: 56, bw: 140 }, { lw: 56, bw: 140 }, { lw: 40, bw: 110 }, { lw: 40, bw: 110 }, { lw: 48, bw: 130 }].map(({ lw, bw }, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className={`h-2.5 rounded bg-gray-200 ${shimmer}`} style={{ width: lw }} />
            <div className={`h-9 rounded-sm bg-gray-200 ${shimmer}`} style={{ width: bw }} />
          </div>
        ))}
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { icon: "w-5 h-5", color: "bg-indigo-100" },
          { icon: "w-5 h-5", color: "bg-emerald-100" },
          { icon: "w-5 h-5", color: "bg-slate-100" },
          { icon: "w-5 h-5", color: "bg-red-100" },
          { icon: "w-5 h-5", color: "bg-orange-100" },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className={`h-2.5 w-20 rounded bg-gray-200 ${shimmer}`} />
              <div className={`w-5 h-5 rounded-full ${c.color} ${shimmer}`} />
            </div>
            <div className={`h-9 w-14 rounded-md bg-gray-200 ${shimmer}`} />
          </div>
        ))}
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-1 bg-gray-200/60 border border-gray-200 rounded-md p-1 w-fit">
        {[80, 72, 104, 112].map((w, i) => (
          <div key={i} className={`h-8 rounded bg-gray-300 ${shimmer}`} style={{ width: w }} />
        ))}
      </div>

      {/* Split task columns skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {["border-gray-200 bg-gray-50", "border-emerald-200 bg-emerald-50/60"].map((style, col) => (
          <div key={col} className={`bg-white border ${style} rounded-md overflow-hidden`}>
            {/* Column header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between ${col === 0 ? "border-gray-100 bg-gray-50" : "border-emerald-100 bg-emerald-50/60"}`}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${col === 0 ? "bg-indigo-200" : "bg-emerald-200"} ${shimmer}`} />
                <div className={`h-3.5 w-24 rounded bg-gray-200 ${shimmer}`} />
              </div>
              <div className={`h-5 w-7 rounded-full ${col === 0 ? "bg-indigo-100" : "bg-emerald-100"} ${shimmer}`} />
            </div>
            {/* Task card skeletons */}
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`border ${col === 0 ? "border-gray-200" : "border-emerald-200"} rounded-md p-3 relative overflow-hidden`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${col === 0 ? "bg-indigo-200" : "bg-emerald-300"}`} />
                  <div className="pl-3 space-y-2.5">
                    <div className="flex gap-2">
                      <div className={`h-4 w-14 rounded-sm bg-gray-200 ${shimmer}`} />
                      <div className={`h-4 w-20 rounded-sm bg-gray-200 ${shimmer}`} />
                    </div>
                    <div className={`h-4 rounded bg-gray-200 ${shimmer}`} style={{ width: `${65 + (i % 3) * 10}%` }} />
                    <div className="flex justify-between">
                      <div className={`h-3 w-16 rounded bg-gray-200 ${shimmer}`} />
                      <div className={`h-3 w-20 rounded bg-gray-200 ${shimmer}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Stat cards shimmer (shown while tasks are loading after initial page load) ─
const StatCardsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    {[
      { color: "bg-indigo-100/60" }, { color: "bg-emerald-100/60" },
      { color: "bg-slate-100/60"  }, { color: "bg-red-100/60"     },
      { color: "bg-orange-100/60" },
    ].map((c, i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-md p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className={`h-2.5 w-20 rounded bg-gray-200 ${shimmer}`} />
          <div className={`w-5 h-5 rounded-full ${c.color} ${shimmer}`} />
        </div>
        <div className={`h-9 w-14 rounded-md bg-gray-200 ${shimmer}`} />
      </div>
    ))}
  </div>
);

// ── Task List tab skeleton (split-column layout) ───────────────────────────────
const SplitTaskSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    {[
      { header: "border-gray-100 bg-gray-50",       accent: "bg-indigo-200",  badge: "bg-indigo-100",  border: "border-gray-200",   bar: "bg-indigo-200"  },
      { header: "border-emerald-100 bg-emerald-50/60", accent: "bg-emerald-200", badge: "bg-emerald-100", border: "border-emerald-200", bar: "bg-emerald-300" },
    ].map((s, col) => (
      <div key={col} className={`bg-white border ${s.border} rounded-md overflow-hidden`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${s.header}`}>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${s.accent} ${shimmer}`} />
            <div className={`h-3.5 w-24 rounded bg-gray-200 ${shimmer}`} />
          </div>
          <div className={`h-5 w-7 rounded-full ${s.badge} ${shimmer}`} />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`border ${s.border} rounded-md p-3 relative overflow-hidden bg-white`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
              <div className="pl-3 space-y-2.5">
                <div className="flex gap-2">
                  <div className={`h-4 w-14 rounded-sm bg-gray-200 ${shimmer}`} />
                  <div className={`h-4 w-20 rounded-sm bg-gray-200 ${shimmer}`} />
                </div>
                <div className={`h-4 rounded bg-gray-200 ${shimmer}`} style={{ width: `${60 + (i % 3) * 12}%` }} />
                <div className="flex justify-between">
                  <div className={`h-3 w-16 rounded bg-gray-200 ${shimmer}`} />
                  <div className={`h-3 w-24 rounded bg-gray-200 ${shimmer}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ── Overdue tab skeleton ───────────────────────────────────────────────────────
const OverdueSkeleton = () => (
  <div className="bg-white border border-red-200 rounded-md overflow-hidden">
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full bg-red-200 ${shimmer}`} />
        <div className={`h-3.5 w-28 rounded bg-red-200 ${shimmer}`} />
      </div>
      <div className={`h-5 w-7 rounded-full bg-red-100 ${shimmer}`} />
    </div>
    <div className="divide-y divide-red-50">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-center gap-4">
          <div className="w-1 self-stretch rounded bg-red-200 flex-shrink-0" />
          <div className="flex-1 min-w-0 pl-1 space-y-2">
            <div className="flex gap-2">
              <div className={`h-4 w-14 rounded-sm bg-gray-200 ${shimmer}`} />
              <div className={`h-4 w-16 rounded bg-red-100 ${shimmer}`} />
            </div>
            <div className={`h-4 rounded bg-gray-200 ${shimmer}`} style={{ width: `${55 + (i % 3) * 15}%` }} />
            <div className={`h-3 w-32 rounded bg-gray-200 ${shimmer}`} />
          </div>
          <div className={`h-4 w-20 rounded bg-red-100 flex-shrink-0 ${shimmer}`} />
        </div>
      ))}
    </div>
  </div>
);

// ── Dev Activity tab skeleton ─────────────────────────────────────────────────
const DevActivitySkeleton = () => (
  <div className="space-y-6">
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    {/* Info banner */}
    <div className={`h-10 rounded-md bg-indigo-50 border border-indigo-100 ${shimmer}`} />

    {/* Two chart cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[0, 1].map(i => (
        <div key={i} className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
          <div className={`h-4 w-44 rounded bg-gray-200 ${shimmer}`} />
          <div className={`h-3 w-36 rounded bg-gray-200 ${shimmer}`} />
          {/* Fake bar chart */}
          <div className="flex items-end gap-3 h-48 pt-4">
            {[60, 90, 45, 110, 75, 55].map((h, j) => (
              <div key={j} className={`flex-1 rounded-t bg-gray-200 ${shimmer}`} style={{ height: h }} />
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Wide stacked bar */}
    <div className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
      <div className={`h-4 w-40 rounded bg-gray-200 ${shimmer}`} />
      <div className={`h-3 w-56 rounded bg-gray-200 ${shimmer}`} />
      <div className="flex items-end gap-4 h-52 pt-4">
        {[80, 120, 60, 100, 90].map((h, j) => (
          <div key={j} className="flex-1 flex flex-col gap-0.5 justify-end">
            <div className={`rounded-t bg-emerald-100 ${shimmer}`} style={{ height: h * 0.4 }} />
            <div className={`rounded-t bg-indigo-100 ${shimmer}`} style={{ height: h * 0.6 }} />
          </div>
        ))}
      </div>
    </div>

    {/* Dev cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gray-200 ${shimmer}`} />
            <div className="space-y-2 flex-1">
              <div className={`h-4 w-28 rounded bg-gray-200 ${shimmer}`} />
              <div className={`h-3 w-20 rounded bg-gray-200 ${shimmer}`} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className={`h-3 w-16 rounded bg-gray-200 ${shimmer}`} />
              <div className={`h-3 w-8 rounded bg-gray-200 ${shimmer}`} />
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full w-2/3 rounded-full bg-gray-200 ${shimmer}`} />
            </div>
            <div className={`h-3 w-40 rounded bg-gray-200 ${shimmer}`} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["bg-green-50", "bg-indigo-50", "bg-red-50"].map((bg, j) => (
              <div key={j} className={`${bg} rounded-md py-3 px-2 flex flex-col items-center gap-1.5`}>
                <div className={`h-5 w-6 rounded bg-gray-200 ${shimmer}`} />
                <div className={`h-2.5 w-10 rounded bg-gray-200 ${shimmer}`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Project Charts tab skeleton ────────────────────────────────────────────────
const ProjectChartsSkeleton = () => (
  <div className="space-y-4">
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    <div className="flex items-center justify-between">
      <div className={`h-4 w-48 rounded bg-gray-200 ${shimmer}`} />
      <div className="flex gap-2">
        {[0,1,2].map(i => <div key={i} className={`h-7 w-7 rounded bg-gray-200 ${shimmer}`} />)}
      </div>
    </div>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {/* Card header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-md bg-indigo-100 ${shimmer}`} />
            <div className="space-y-2.5">
              <div className={`h-5 w-44 rounded bg-gray-200 ${shimmer}`} />
              <div className="flex gap-2">
                <div className={`h-4 w-14 rounded bg-gray-200 ${shimmer}`} />
                <div className={`h-4 w-24 rounded bg-gray-200 ${shimmer}`} />
                <div className={`h-4 w-20 rounded bg-gray-200 ${shimmer}`} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block space-y-1.5 text-right">
              <div className={`h-2.5 w-20 rounded bg-gray-200 ${shimmer}`} />
              <div className={`h-4 w-28 rounded bg-gray-200 ${shimmer}`} />
            </div>
            <div className={`w-6 h-6 rounded bg-gray-200 ${shimmer}`} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SelectBox = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={
      "bg-white border border-gray-200 shadow-xs text-gray-800 text-sm rounded-sm px-3 py-2 " +
      "focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer relative z-20 " +
      className
    }
  >
    {children}
  </select>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-sm px-4 py-3 shadow-md text-sm z-50 relative">
      <p className="text-gray-800 font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium text-xs">
          {p.name}: <span className="text-gray-600">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <Inbox strokeWidth={1.5} className="w-12 h-12 mb-3 text-gray-300" />
    <p className="text-sm">{message}</p>
  </div>
);

// ── Task Row ──────────────────────────────────────────────────────────────────
function TaskRow({ task, onClick }) {
  const isOverdue = checkIsOverdue(task.deadline, task.status);
  const isDone = task.status === "Done";
  const priorityColor = PRIORITY_COLOR[task.priority] || "#94a3b8";

  return (
    <div
      onClick={() => onClick(task)}
      className={`group border shadow-sm rounded-md p-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:shadow-md transition-all relative overflow-hidden
        ${isDone ? "bg-emerald-50/60 border-emerald-200 hover:border-emerald-400" : "bg-white border-gray-200 hover:border-indigo-300"}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: isDone ? "#16a34a" : priorityColor }} />
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{task.projectName}</span>
          <span className="text-gray-300">•</span>
          <Badge label={task.priority} color={priorityColor} />
          {isOverdue && (
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-sm border border-red-200 uppercase">Overdue</span>
          )}
          {isDone && task.completedAt && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm border border-emerald-200">
              ✓ Completed {fnsFormat(new Date(task.completedAt), "MMM d, yyyy")}
            </span>
          )}
        </div>
        <h4 className={`text-base font-semibold truncate ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {task.deadline && !isDone && (
            <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
              <Calendar size={12} />
              Due {fnsFormat(new Date(task.deadline), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600 shrink-0">
        <div className="flex items-center gap-1.5" title="Comments">
          <MessageSquare size={16} className={task.comments?.length ? "text-indigo-500" : "text-gray-400"} />
          <span className="font-medium">{task.comments?.length || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-200">
          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
            {task.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="font-medium truncate max-w-[100px]">{task.assignedTo?.username}</span>
        </div>
        <span className={`px-2.5 py-1 rounded-sm text-xs font-bold border uppercase tracking-wider ${
          isDone ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
          task.status === "In Progress" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
          "bg-gray-100 text-gray-600 border-gray-200"
        }`}>
          {task.status}
        </span>
      </div>
    </div>
  );
}

// ── Split task list ───────────────────────────────────────────────────────────
function SplitTaskList({ tasks, onTaskClick }) {
  const [pendingPage, setPendingPage]     = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const PAGE = 8;

  const pending   = useMemo(() => tasks.filter(t => t.status !== "Done"), [tasks]);
  const completed = useMemo(() => tasks.filter(t => t.status === "Done"), [tasks]);

  const pendingPages   = Math.ceil(pending.length / PAGE)   || 1;
  const completedPages = Math.ceil(completed.length / PAGE) || 1;

  const pendingSlice   = pending.slice((pendingPage - 1) * PAGE, pendingPage * PAGE);
  const completedSlice = completed.slice((completedPage - 1) * PAGE, completedPage * PAGE);

  const Pagination = ({ page, total, onChange }) => {
    if (total <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-3 mt-4">
        <button onClick={() => onChange(p => Math.max(1, p - 1))} disabled={page === 1}
          className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40">← Prev</button>
        <span className="text-xs text-gray-500 font-medium">Page {page} of {total}</span>
        <button onClick={() => onChange(p => Math.min(total, p + 1))} disabled={page === total}
          className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40">Next →</button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pending */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-500" />
            <h3 className="font-bold text-gray-800">Pending Tasks</h3>
          </div>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{pending.length}</span>
        </div>
        <div className="p-4 space-y-3 max-h-[560px] overflow-y-auto">
          {pendingSlice.length === 0
            ? <div className="py-8 text-center text-gray-400 text-sm">No pending tasks 🎉</div>
            : pendingSlice.map(t => {
              const isOverdue = checkIsOverdue(t.deadline, t.status);
              const pc = PRIORITY_COLOR[t.priority] || "#94a3b8";
              return (
                <div key={t._id} onClick={() => onTaskClick(t)}
                  className="border border-gray-200 rounded-md p-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all bg-white relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" style={{ backgroundColor: pc }} />
                  <div className="pl-3">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge label={t.priority} color={pc} />
                      <Badge label={t.projectName} color="#3b82f6" />
                      {isOverdue && (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 uppercase">Overdue</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate pt-2">{t.title}</p>
                    <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
                      <span className="text-xs text-gray-500">{t.assignedTo?.username}</span>
                      {t.deadline && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                          <Calendar size={11} />
                          Due {fnsFormat(new Date(t.deadline), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          <Pagination page={pendingPage} total={pendingPages} onChange={setPendingPage} />
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white border border-emerald-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600" />
            <h3 className="font-bold text-emerald-800">Completed Tasks</h3>
          </div>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">{completed.length}</span>
        </div>
        <div className="p-4 space-y-3 max-h-[560px] overflow-y-auto">
          {completedSlice.length === 0
            ? <div className="py-8 text-center text-gray-400 text-sm">No completed tasks in this period</div>
            : completedSlice.map(t => (
              <div key={t._id} onClick={() => onTaskClick(t)}
                className="border border-emerald-200 rounded-md p-3 cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all bg-emerald-50/40 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md bg-emerald-500" />
                <span className="text-xs border border-gray-300 text-gray-500 px-2 py-1 rounded ml-3 mb-4">{t.projectName}</span>
                <div className="pl-3 pt-2">
                  <p className="text-sm font-semibold text-gray-700 line-through decoration-emerald-400 truncate">{t.title}</p>
                  <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
                    <span className="text-xs text-gray-500">{t.assignedTo?.username}</span>
                    {t.completedAt && (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle size={11} />
                        {fnsFormat(new Date(t.completedAt), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          <Pagination page={completedPage} total={completedPages} onChange={setCompletedPage} />
        </div>
      </div>
    </div>
  );
}

// ── Overdue list ──────────────────────────────────────────────────────────────
function OverdueTaskList({ tasks, onTaskClick }) {
  const overdue = useMemo(
    () => tasks.filter(t => checkIsOverdue(t.deadline, t.status))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)),
    [tasks]
  );

  if (overdue.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
        <CheckCircle className="mx-auto mb-3 text-emerald-500" size={32} />
        <p className="text-gray-600 font-medium">No overdue tasks!</p>
        <p className="text-gray-400 text-sm mt-1">All tasks are on track.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-red-200 shadow-sm rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600" />
          <h3 className="font-bold text-red-800">Overdue Tasks</h3>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">{overdue.length}</span>
      </div>
      <div className="divide-y divide-red-50">
        {overdue.map(t => {
          const daysOverdue = differenceInCalendarDays(new Date(), new Date(t.deadline));
          const pc = PRIORITY_COLOR[t.priority] || "#94a3b8";
          return (
            <div key={t._id} onClick={() => onTaskClick(t)}
              className="px-5 py-3 flex items-center gap-4 cursor-pointer hover:bg-red-50/50 transition-colors">
              <div className="w-1 self-stretch rounded bg-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0 pl-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge label={t.priority} color={pc} />
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">{daysOverdue}d overdue</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.projectName} · {t.assignedTo?.username}</p>
              </div>
              <div className="text-xs text-red-600 font-medium flex-shrink-0 flex items-center gap-1">
                <Calendar size={12} />
                {fnsFormat(new Date(t.deadline), "MMM d, yyyy")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Dev Activity Tab (lazy-loaded) ────────────────────────────────────────────
function DevActivityTab({
  allTasks, completions, selectedDev, priorityFilter,
  fromDate, toDate, datePreset, loading,
}) {
  const devBarData = useMemo(() => {
    const map = {};
    allTasks.filter(t => t.status !== "Done").forEach(t => {
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return;
      const name = t.assignedTo?.username || "Unknown";
      if (!map[name]) map[name] = { name, Done: 0, Pending: 0 };
      map[name].Pending++;
    });
    allTasks.filter(t => {
      if (t.status !== "Done") return false;
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (fromDate || toDate) {
        const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        if (fromDate && ref < fromDate) return false;
        if (toDate   && ref > toDate)   return false;
      }
      return true;
    }).forEach(t => {
      const name = t.assignedTo?.username || "Unknown";
      if (!map[name]) map[name] = { name, Done: 0, Pending: 0 };
      map[name].Done++;
    });
    return Object.values(map).sort((a, b) => (b.Done + b.Pending) - (a.Done + a.Pending));
  }, [allTasks, selectedDev, priorityFilter, fromDate, toDate]);

  const devPieData = useMemo(() => {
    const map = {};
    allTasks.filter(t => {
      if (t.status !== "Done") return false;
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (fromDate || toDate) {
        const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        if (fromDate && ref < fromDate) return false;
        if (toDate   && ref > toDate)   return false;
      }
      return true;
    }).forEach(t => {
      const name = t.assignedTo?.username || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allTasks, selectedDev, fromDate, toDate]);

  const completionBarData = useMemo(() => {
    const filtered = completions.filter(c => {
      const d = new Date(c.completedAt);
      if (fromDate && d < fromDate) return false;
      if (toDate   && d > toDate)   return false;
      if (selectedDev !== "all" && c.completedBy?.username !== selectedDev) return false;
      return true;
    });
    const map = {};
    filtered.forEach(c => {
      const name = c.completedBy?.username || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, Completed]) => ({ name, Completed }))
      .sort((a, b) => b.Completed - a.Completed);
  }, [completions, fromDate, toDate, selectedDev]);

  const developers = useMemo(
    () => [...new Set(allTasks.map(t => t.assignedTo?.username).filter(Boolean))],
    [allTasks]
  );

  const devCardData = useMemo(() => {
    return developers.map((dev, i) => {
      const pendingTasks = allTasks.filter(t =>
        t.status !== "Done" && t.assignedTo?.username === dev
      );
      const doneTasks = allTasks.filter(t => {
        if (t.status !== "Done" || t.assignedTo?.username !== dev) return false;
        if (fromDate || toDate) {
          const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
          if (fromDate && ref < fromDate) return false;
          if (toDate   && ref > toDate)   return false;
        }
        return true;
      });
      const overdueCount = pendingTasks.filter(t => checkIsOverdue(t.deadline, t.status)).length;
      const total = pendingTasks.length + doneTasks.length;
      const pct   = total ? Math.round((doneTasks.length / total) * 100) : 0;
      return { dev, i, pendingTasks, doneTasks, overdueCount, total, pct };
    });
  }, [developers, allTasks, fromDate, toDate]);

  if (loading) return <DevActivitySkeleton />;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-md px-4 py-2.5 text-sm text-indigo-700 flex items-center gap-2">
        <Clock size={14} />
        <span>
          <strong>Completed</strong> counts reflect tasks finished within <strong>{datePreset}</strong>.
          &nbsp;<strong>Pending</strong> counts show all currently open tasks regardless of date.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-md p-5">
          <h3 className="font-bold font-display text-gray-900 mb-1">Completions in Period</h3>
          <p className="text-sm text-gray-500 mb-5">Tasks marked Done · {datePreset}</p>
          {completionBarData.length === 0 ? <EmptyState message="No completions in this period" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={completionBarData} barCategoryGap="30%" margin={{ top:20, right:30, left:0, bottom:10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Completed" radius={[4,4,0,0]}>
                  {completionBarData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-md p-5">
          <h3 className="font-bold font-display text-gray-900 mb-1">Total Contribution</h3>
          <p className="text-sm text-gray-500 mb-5">% of Completed Tasks per Developer · {datePreset}</p>
          {devPieData.length === 0 ? <EmptyState message="No completed tasks match filters" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={devPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {devPieData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-md p-5">
        <h3 className="font-bold font-display text-gray-900 mb-1">Task Breakdown</h3>
        <p className="text-sm text-gray-500 mb-5">Completed (in {datePreset}) vs Pending (currently open)</p>
        {devBarData.length === 0 ? <EmptyState message="No tasks match filters" /> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={devBarData} barCategoryGap="25%" margin={{ top:20, right:30, left:0, bottom:10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:13 }} />
              <Bar dataKey="Done"    fill="#16a34a" radius={[2,2,0,0]} stackId="a" />
              <Bar dataKey="Pending" fill="#4f46e5" radius={[2,2,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {devCardData.length === 0 && <EmptyState message="No developer data yet" />}
        {devCardData.map(({ dev, i, pendingTasks, doneTasks, overdueCount, total, pct }) => (
          <motion.div key={dev}
            initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-gray-200 shadow-sm rounded-md p-5 hover:border-indigo-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm"
                style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }}>
                {dev[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">{dev}</p>
                <p className="text-sm text-gray-500">{total} tasks total</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 font-bold mb-1.5">
                <span>Completion</span><span>{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }}
                  initial={{ width:0 }} animate={{ width:`${pct}%` }}
                  transition={{ duration:0.8, delay: i * 0.08 }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {doneTasks.length} done in {datePreset} · {pendingTasks.length} still pending
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label:"Done",    value:doneTasks.length,    color:"#16a34a", bg:"bg-green-50" },
                { label:"Pending", value:pendingTasks.length, color:"#4f46e5", bg:"bg-indigo-50" },
                { label:"Overdue", value:overdueCount,        color:"#dc2626", bg:"bg-red-50" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border border-gray-100 rounded-md py-2 px-1`}>
                  <p className="font-bold text-lg" style={{ color:s.color }}>{s.value}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Project Report Card ───────────────────────────────────────────────────────
function ProjectReportCard({ project, tasks, completions }) {
  const [expanded, setExpanded] = useState(false);

  const pTasks = useMemo(() => tasks.filter(t => {
    const pid = (t.projectId?._id || t.projectId)?.toString();
    return pid === project._id?.toString();
  }), [tasks, project._id]);

  const pCompletions = useMemo(() => completions.filter(c => {
    const pid = (c.projectId?._id || c.projectId)?.toString();
    return pid === project._id?.toString();
  }), [completions, project._id]);

  const completedTasksList = pTasks.filter(t => t.status === "Done");
  const pendingTasksList   = pTasks.filter(t => t.status !== "Done");

  const pieData = useMemo(() => {
    const map = {};
    pCompletions.forEach(c => {
      const dev = c.completedBy?.username || "Unknown";
      map[dev] = (map[dev] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [pCompletions]);

  const statusData = useMemo(() => {
    const map = {};
    pTasks.forEach(t => {
      const dev = t.assignedTo?.username || "Unknown";
      if (!map[dev]) map[dev] = { name: dev, Done: 0, Pending: 0 };
      if (t.status === "Done") map[dev].Done++;
      else map[dev].Pending++;
    });
    return Object.values(map);
  }, [pTasks]);

  const priorityData = useMemo(() => {
    const map = {};
    pTasks.filter(t => t.status !== "Done").forEach(t => {
      const dev = t.assignedTo?.username || "Unknown";
      if (!map[dev]) map[dev] = { name: dev, Critical: 0, High: 0, Medium: 0, Low: 0 };
      if (t.priority in map[dev]) map[dev][t.priority]++;
    });
    return Object.values(map);
  }, [pTasks]);

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md"><Folder size={24} /></div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{project.projectName}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${project.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {project.status}
              </span>
              <span>•</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border bg-indigo-50 text-indigo-700 border-indigo-200">
                {completedTasksList.length} / {pTasks.length} Completed
              </span>
              <span>•</span>
              <span>{(project.serviceType || []).join(", ") || "No Services"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs text-gray-400 font-semibold uppercase">Assigned Team</span>
            <span className="text-sm font-medium text-gray-700">
              {project.assignedDeveloper?.map(d => d.username).join(", ") || "Unassigned"}
            </span>
          </div>
          <div className="text-gray-400">{expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50/50"
          >
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
                <h4 className="text-sm font-bold text-gray-800 mb-4 text-center">Developer Contribution % (Completed Tasks)</h4>
                {pieData.length === 0 ? <EmptyState message="No completed tasks" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
                <h4 className="text-sm font-bold text-gray-800 mb-4 text-center">Pending vs Completed</h4>
                {statusData.length === 0 ? <EmptyState message="No tasks assigned" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={statusData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Done" fill="#16a34a" radius={[2,2,0,0]} stackId="a" />
                      <Bar dataKey="Pending" fill="#4f46e5" radius={[2,2,0,0]} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
                <h4 className="text-sm font-bold text-gray-800 mb-4 text-center">Open Tasks by Priority</h4>
                {priorityData.length === 0 ? <EmptyState message="No open tasks" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={priorityData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Critical" fill={PRIORITY_COLOR.Critical} stackId="p" />
                      <Bar dataKey="High"     fill={PRIORITY_COLOR.High}     stackId="p" />
                      <Bar dataKey="Medium"   fill={PRIORITY_COLOR.Medium}   stackId="p" />
                      <Bar dataKey="Low"      fill={PRIORITY_COLOR.Low}      stackId="p" radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
                    Pending Tasks
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{pendingTasksList.length}</span>
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {pendingTasksList.length === 0
                      ? <p className="text-sm text-gray-400">All caught up!</p>
                      : pendingTasksList.map(t => (
                        <div key={t._id} className="text-sm border border-gray-100 bg-gray-50 p-3 rounded flex justify-between items-start gap-2">
                          <div>
                            <p className="font-semibold text-gray-800">{t.title}</p>
                            <p className="text-xs text-gray-500 mt-1">Dev: <span className="font-medium text-gray-700">{t.assignedTo?.username}</span></p>
                          </div>
                          <Badge label={t.priority} color={PRIORITY_COLOR[t.priority] || "#94a3b8"} />
                        </div>
                      ))}
                  </div>
                </div>
                <div className="bg-white border border-emerald-200 rounded-md p-4 shadow-sm">
                  <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center justify-between">
                    Completed Tasks
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{completedTasksList.length}</span>
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {completedTasksList.length === 0
                      ? <p className="text-sm text-gray-400">No completed tasks yet.</p>
                      : completedTasksList.map(t => (
                        <div key={t._id} className="text-sm border border-emerald-100 bg-emerald-50/50 p-3 rounded flex justify-between items-start gap-2">
                          <div>
                            <p className="font-semibold text-emerald-900 line-through decoration-emerald-300">{t.title}</p>
                            <p className="text-xs text-emerald-600 mt-1">Completed by: <span className="font-medium text-emerald-800">{t.assignedTo?.username}</span></p>
                          </div>
                          <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Project Charts Tab — paginated lazy loading ───────────────────────────────
const PROJECTS_PER_PAGE = 3;

function ProjectChartsTab({ projects, selectedProject, allTasks, completions, loading }) {
  const [page, setPage] = useState(1);

  const visibleProjects = useMemo(() =>
    projects.filter(p => selectedProject === "all" || p._id === selectedProject),
    [projects, selectedProject]
  );

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1); }, [selectedProject]);

  const totalPages = Math.ceil(visibleProjects.length / PROJECTS_PER_PAGE) || 1;
  const pageProjects = visibleProjects.slice((page - 1) * PROJECTS_PER_PAGE, page * PROJECTS_PER_PAGE);

  if (loading) {
    return <ProjectChartsSkeleton />;
  }

  if (visibleProjects.length === 0) return <EmptyState message="No active projects" />;

  return (
    <div className="space-y-6">
      {/* Pagination info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">
          Showing {(page - 1) * PROJECTS_PER_PAGE + 1}–{Math.min(page * PROJECTS_PER_PAGE, visibleProjects.length)} of {visibleProjects.length} projects
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-sm bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 text-xs font-bold rounded transition-colors ${
                    page === i + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-sm bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Render only current page of project cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {pageProjects.map(project => (
            <ProjectReportCard
              key={project._id}
              project={project}
              tasks={allTasks}
              completions={completions}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Bottom pagination for convenience */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40">← Prev</button>
          <span className="text-xs text-gray-500 font-medium">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DeveloperReports() {
  const [projects,        setProjects]        = useState([]);
  const [allTasks,        setAllTasks]        = useState([]);
  const [completions,     setCompletions]     = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks,    setLoadingTasks]    = useState(false);
  // Per-tab loading states
  const [loadingDevActivity,    setLoadingDevActivity]    = useState(false);
  const [loadingProjectCharts,  setLoadingProjectCharts]  = useState(false);

  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDev,     setSelectedDev]     = useState("all");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [priorityFilter,  setPriorityFilter]  = useState("all");
  const [datePreset,      setDatePreset]      = useState("Today");
  const [customFrom,      setCustomFrom]      = useState("");
  const [customTo,        setCustomTo]        = useState("");
  const [activeTab,       setActiveTab]       = useState("tasks");
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [error,           setError]           = useState(null);

  // Track which tabs have ever been loaded so we don't re-fetch on tab switch
  const tabLoadedRef = useRef({ tasks: false, "dev-activity": false, "project-chart": false });

  // ── Fetch projects (once on mount) ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const cacheKey = "projects:list";
        const cached = cache.get(cacheKey);
        let data;
        if (cached) {
          data = cached;
        } else {
          const res = await fetch(PROJECT_ENDPOINT, { headers: { Authorization: `Bearer ${getToken()}` } });
          if (!res.ok) throw new Error(`Projects fetch failed (${res.status}).`);
          data = await res.json();
          cache.set(cacheKey, data, CACHE_TTL);
        }
        setProjects(Array.isArray(data) ? data : data.projects ?? []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, []);

  // ── Date window ───────────────────────────────────────────────────────────
  const { fromDate, toDate } = useMemo(() => {
    if (datePreset === "Custom") {
      return {
        fromDate: customFrom ? new Date(customFrom) : null,
        toDate:   customTo   ? new Date(customTo)   : null,
      };
    }
    const preset = DATE_PRESETS.find(d => d.label === datePreset);
    return { fromDate: preset?.from ?? null, toDate: preset?.to ?? null };
  }, [datePreset, customFrom, customTo]);

  // ── Core task fetch — triggered by project/date changes ───────────────────
  // Fetches ONLY the data needed: tasks (always), completions (dev-activity/project-chart tabs)
  const fetchTaskData = useCallback(async (targetProjects, includeCompletions = false) => {
    if (!targetProjects.length) return;
    setLoadingTasks(true);
    setError(null);

    try {
      // Build a cache key incorporating the relevant filters
      const cacheKey = buildCacheKey("tasks", selectedProject, datePreset, customFrom, customTo);
      const cachedTasks = cache.get(cacheKey);

      let tasksWithComments;
      if (cachedTasks) {
        tasksWithComments = cachedTasks;
      } else {
        const taskResults = await Promise.all(
          targetProjects.map(p => authFetch(`${API_BASE}/api/tasks/${p._id}`))
        );
        const rawFlatTasks = taskResults.flat();

        tasksWithComments = await Promise.all(
          rawFlatTasks.map(async t => {
            const pid = (t.projectId?._id || t.projectId)?.toString();
            const commentsRes = await authFetch(`${API_BASE}/api/tasks/${pid}/${t._id}/comments`).catch(() => []);
            return {
              ...t,
              projectName: resolveProjectName(targetProjects, t.projectId),
              comments: Array.isArray(commentsRes) ? commentsRes : [],
            };
          })
        );
        cache.set(cacheKey, tasksWithComments, CACHE_TTL);
      }

      setAllTasks(tasksWithComments);

      if (includeCompletions) {
        const compCacheKey = buildCacheKey("completions", selectedProject, datePreset, customFrom, customTo);
        const cachedComp = cache.get(compCacheKey);
        if (cachedComp) {
          setCompletions(cachedComp);
        } else {
          const compResults = await Promise.all(
            targetProjects.map(p => authFetch(`${API_BASE}/api/tasks/${p._id}/completions`))
          );
          const flat = compResults.flat();
          cache.set(compCacheKey, flat, CACHE_TTL);
          setCompletions(flat);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedProject, datePreset, customFrom, customTo]);

  // ── Fetch completions separately (for dev-activity / project-chart tabs) ──
  const fetchCompletions = useCallback(async (targetProjects) => {
    if (!targetProjects.length) return;
    const compCacheKey = buildCacheKey("completions", selectedProject, datePreset, customFrom, customTo);
    const cached = cache.get(compCacheKey);
    if (cached) {
      setCompletions(cached);
      return;
    }
    try {
      const compResults = await Promise.all(
        targetProjects.map(p => authFetch(`${API_BASE}/api/tasks/${p._id}/completions`))
      );
      const flat = compResults.flat();
      cache.set(compCacheKey, flat, CACHE_TTL);
      setCompletions(flat);
    } catch (e) {
      console.error("Completions fetch error:", e);
    }
  }, [selectedProject, datePreset, customFrom, customTo]);

  // ── Initial load: fetch tasks for "Today" when projects are ready ─────────
  useEffect(() => {
    if (!projects.length) return;
    const targets = selectedProject === "all"
      ? projects
      : projects.filter(p => p._id === selectedProject);
    fetchTaskData(targets, false);
    // Reset tab-loaded tracking when project/date changes
    tabLoadedRef.current = { tasks: true, "dev-activity": false, "project-chart": false };
  }, [projects, selectedProject, datePreset, customFrom, customTo]); // re-run on date/project change

  // ── Tab switch: lazy-load data for dev-activity and project-chart ─────────
  useEffect(() => {
    if (!projects.length || !allTasks.length) return;

    const targets = selectedProject === "all"
      ? projects
      : projects.filter(p => p._id === selectedProject);

    if (activeTab === "dev-activity" && !tabLoadedRef.current["dev-activity"]) {
      tabLoadedRef.current["dev-activity"] = true;
      setLoadingDevActivity(true);
      fetchCompletions(targets).finally(() => setLoadingDevActivity(false));
    }

    if (activeTab === "project-chart" && !tabLoadedRef.current["project-chart"]) {
      tabLoadedRef.current["project-chart"] = true;
      setLoadingProjectCharts(true);
      fetchCompletions(targets).finally(() => setLoadingProjectCharts(false));
    }
  }, [activeTab, projects, allTasks.length, selectedProject]);

  // When date/project filters change, reset tab-loaded flags so tabs re-fetch
  useEffect(() => {
    tabLoadedRef.current = { tasks: true, "dev-activity": false, "project-chart": false };
    setCompletions([]); // clear stale completions
  }, [datePreset, customFrom, customTo, selectedProject]);

  // ── Filter tasks ──────────────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (selectedDev    !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (statusFilter   === "complete"   && t.status !== "Done")             return false;
      if (statusFilter   === "incomplete" && t.status === "Done")             return false;
      if (priorityFilter !== "all"        && t.priority !== priorityFilter)   return false;

      if (fromDate || toDate) {
        if (t.status === "Done") {
          const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
          if (fromDate && ref < fromDate) return false;
          if (toDate   && ref > toDate)   return false;
        }
        // Pending tasks always shown — they're still open
      }
      return true;
    });
  }, [allTasks, selectedDev, statusFilter, priorityFilter, fromDate, toDate]);

  const developers = useMemo(
    () => [...new Set(allTasks.map(t => t.assignedTo?.username).filter(Boolean))],
    [allTasks]
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const allPending = allTasks.filter(t => t.status !== "Done");
    const allCompleted = allTasks.filter(t => {
      if (t.status !== "Done") return false;
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (fromDate || toDate) {
        const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        if (fromDate && ref < fromDate) return false;
        if (toDate   && ref > toDate)   return false;
      }
      return true;
    });
    const pending = selectedDev !== "all"
      ? allPending.filter(t => t.assignedTo?.username === selectedDev)
      : allPending;
    const overdue  = pending.filter(t => checkIsOverdue(t.deadline, t.status)).length;
    const critical = pending.filter(t => t.priority === "Critical").length;
    return { total: pending.length + allCompleted.length, done: allCompleted.length, pending: pending.length, overdue, critical };
  }, [allTasks, selectedDev, fromDate, toDate]);

  if (loadingProjects) return <PageLoader />;

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-gray-800 font-sans text-base pb-10 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        .font-sans    { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>

      {/* ── Header ── */}
      <div className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-[95%] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Developer Reports</h1>
            <p className="text-gray-500 text-sm mt-0.5">Task analytics &amp; team activity</p>
          </div>
          <div className="flex items-center gap-3">
            {loadingTasks && (
              <span className="text-xs text-indigo-600 font-medium flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block" />
                Fetching…
              </span>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-500" />
              {allTasks.length} tasks loaded
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[95%] mx-auto px-6 py-6 space-y-6 relative z-10">

        {/* ── Filters ── */}
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="bg-white border border-gray-200 shadow-sm rounded-md p-5 relative z-20">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Project</label>
              <SelectBox value={selectedProject} onChange={v => { setSelectedProject(v); setSelectedDev("all"); }}>
                <option value="all">All Projects</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.projectName || p.title || p._id}</option>)}
              </SelectBox>
            </div>
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Developer</label>
              <SelectBox value={selectedDev} onChange={setSelectedDev}>
                <option value="all">All Developers</option>
                {developers.map(d => <option key={d} value={d}>{d}</option>)}
              </SelectBox>
            </div>
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</label>
              <SelectBox value={statusFilter} onChange={setStatusFilter}>
                <option value="all">All</option>
                <option value="complete">Completed</option>
                <option value="incomplete">Incomplete</option>
              </SelectBox>
            </div>
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Priority</label>
              <SelectBox value={priorityFilter} onChange={setPriorityFilter}>
                <option value="all">All</option>
                {["Critical","High","Medium","Low"].map(p => <option key={p} value={p}>{p}</option>)}
              </SelectBox>
            </div>
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Period</label>
              <SelectBox value={datePreset} onChange={setDatePreset}>
                {DATE_PRESETS.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
                <option value="Custom">Custom Range</option>
              </SelectBox>
            </div>
            {datePreset === "Custom" && (
              <>
                <div className="flex flex-col gap-1.5 relative z-20">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">From</label>
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    className="bg-white border border-gray-200 shadow-sm text-sm rounded-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex flex-col gap-1.5 relative z-20">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">To</label>
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    className="bg-white border border-gray-200 shadow-sm text-sm rounded-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="bg-red-50 border border-red-200 text-red-600 rounded-md px-4 py-3 text-sm shadow-sm flex items-center">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />{error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stat cards ── */}
        {loadingTasks ? <StatCardsSkeleton /> : (
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10"
          initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
          {[
            { label:"Total Tasks",   value:stats.total,    color:"#4f46e5", icon:<ClipboardList size={22} /> },
            { label:"Completed",     value:stats.done,     color:"#16a34a", icon:<CheckCircle   size={22} /> },
            { label:"Pending",       value:stats.pending,  color:"#64748b", icon:<Clock         size={22} /> },
            { label:"Overdue",       value:stats.overdue,  color:"#dc2626", icon:<AlertOctagon  size={22} /> },
            { label:"Critical Open", value:stats.critical, color:"#ea580c", icon:<Flame         size={22} /> },
          ].map(card => (
            <motion.div key={card.label}
              variants={{ hidden:{ opacity:0, y:12 }, show:{ opacity:1, y:0 } }}
              className="bg-white border border-gray-200 shadow-sm rounded-md p-4 flex flex-col gap-2 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{card.label}</span>
                <span style={{ color:card.color }} className="opacity-80">{card.icon}</span>
              </div>
              <p className="text-3xl font-bold font-display" style={{ color:card.color }}>{card.value}</p>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* ── Tab bar ── */}
        <div className="flex gap-1 bg-gray-200/60 border border-gray-200 rounded-md p-1 w-fit relative z-20 flex-wrap">
          {[
            { id:"tasks",         label:"Task List" },
            { id:"overdue",       label:"Overdue" },
            { id:"dev-activity",  label:"Dev Activity" },
            { id:"project-chart", label:"Project Charts" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={"px-4 py-2 rounded text-sm font-bold transition-all " +
                (activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-800")}>
              {tab.label}
              {tab.id === "overdue" && stats.overdue > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">{stats.overdue}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Tab: Task List ── */}
          {activeTab === "tasks" && (
            <motion.div key="tasks" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-4 relative z-10">
              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Tasks</h2>
                {loadingTasks
                  ? <span className="text-sm text-indigo-500 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />Loading…</span>
                  : <span className="text-sm font-medium text-gray-500">{filteredTasks.length} tasks</span>
                }
              </div>
              {loadingTasks
                ? <SplitTaskSkeleton />
                : filteredTasks.length === 0
                  ? <EmptyState message="No tasks match your filters" />
                  : <SplitTaskList tasks={filteredTasks} onTaskClick={setSelectedTaskDetails} />
              }
            </motion.div>
          )}

          {/* ── Tab: Overdue ── */}
          {activeTab === "overdue" && (
            <motion.div key="overdue" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-4 relative z-10">
              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Overdue Tasks</h2>
                {loadingTasks
                  ? <span className="text-sm text-indigo-500 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />Loading…</span>
                  : <span className="text-sm font-medium text-red-600 font-bold">{stats.overdue} overdue</span>
                }
              </div>
              {loadingTasks
                ? <OverdueSkeleton />
                : <OverdueTaskList tasks={filteredTasks} onTaskClick={setSelectedTaskDetails} />
              }
            </motion.div>
          )}

          {/* ── Tab: Dev Activity (lazy) ── */}
          {activeTab === "dev-activity" && (
            <motion.div key="dev-activity" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-6 relative z-10">
              <DevActivityTab
                allTasks={allTasks}
                completions={completions}
                selectedDev={selectedDev}
                priorityFilter={priorityFilter}
                fromDate={fromDate}
                toDate={toDate}
                datePreset={datePreset}
                loading={loadingDevActivity || loadingTasks}
              />
            </motion.div>
          )}

          {/* ── Tab: Project Charts (lazy + paginated) ── */}
          {activeTab === "project-chart" && (
            <motion.div key="project-chart" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-6 relative z-10">
              <ProjectChartsTab
                projects={projects}
                selectedProject={selectedProject}
                allTasks={allTasks}
                completions={completions}
                loading={loadingProjectCharts || loadingTasks}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Task Details Modal ── */}
      <AnimatePresence>
        {selectedTaskDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity:0, scale:0.95, y:20 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95, y:20 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-[101]"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{selectedTaskDetails.projectName}</span>
                    <span className="text-gray-300">•</span>
                    <Badge label={selectedTaskDetails.priority} color={PRIORITY_COLOR[selectedTaskDetails.priority] || "#94a3b8"} />
                    {selectedTaskDetails.status === "Done" && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">✓ Completed</span>
                    )}
                  </div>
                  <h2 className={`text-xl font-bold ${selectedTaskDetails.status === "Done" ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {selectedTaskDetails.title}
                  </h2>
                </div>
                <button onClick={() => setSelectedTaskDetails(null)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500 transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTaskDetails.status}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assignee</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTaskDetails.assignedTo?.username}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Created By</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTaskDetails.createdBy?.username}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
                    <p className={`text-sm font-semibold ${checkIsOverdue(selectedTaskDetails.deadline, selectedTaskDetails.status) ? "text-red-600" : "text-gray-800"}`}>
                      {selectedTaskDetails.deadline ? fnsFormat(new Date(selectedTaskDetails.deadline), "MMM d, yyyy") : "None"}
                    </p>
                  </div>
                  {selectedTaskDetails.status === "Done" && selectedTaskDetails.completedAt && (
                    <div className="sm:col-span-4 bg-emerald-50 rounded-md p-3 border border-emerald-200 flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                      <p className="text-sm text-emerald-700 font-medium">
                        Completed on {fnsFormat(new Date(selectedTaskDetails.completedAt), "MMMM d, yyyy · h:mm a")}
                        {selectedTaskDetails.completedBy?.username && ` by ${selectedTaskDetails.completedBy.username}`}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Description</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white border border-gray-200 p-4 rounded-md leading-relaxed">
                    {selectedTaskDetails.description || <span className="italic text-gray-400">No description provided.</span>}
                  </div>
                </div>

                {selectedTaskDetails.links?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Links</h4>
                    <div className="flex flex-col gap-2">
                      {selectedTaskDetails.links.map((link, idx) => (
                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 hover:underline truncate">
                          <ExternalLink size={14} />{link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <MessageSquare size={16} /> Comments ({selectedTaskDetails.comments?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {(!selectedTaskDetails.comments || selectedTaskDetails.comments.length === 0)
                      ? <p className="text-sm text-gray-400 italic">No comments yet.</p>
                      : selectedTaskDetails.comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-100 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900">
                              {comment.createdBy?.username || comment.user?.username || "Unknown"}
                            </span>
                            <span className="text-xs font-medium text-gray-400">
                              {comment.createdAt ? fnsFormat(new Date(comment.createdAt), "MMM d, yyyy · h:mm a") : ""}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #D0D7DE; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8C959F; }
      `}</style>
    </div>
  );
}