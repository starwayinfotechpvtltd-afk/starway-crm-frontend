// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import axios from "axios";
// import { format, isAfter, isBefore, addDays, differenceInDays } from "date-fns";
// import ProjectKanban from "../Admin Pages/Components/Projectkanban";
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// // ── Design tokens (Light Theme) ───────────────────────────────────────────────
// const T = {
//   bg: "#F6F8FA",             
//   bgCard: "#FFFFFF",         
//   bgSidebar: "#F6F8FA",      
//   bgInput: "#FFFFFF",        
//   border: "#D0D7DE",         
//   borderFocus: "#D97706",    
//   accent: "#D97706",        
//   accentDim: "#D9770615",   
//   accentHover: "#B35900",    
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
//   closedBg: "#F8F9FA",       
//   closedBorder: "#D0D7DE",   
//   closedText: "#656D76",     
//   font: "'DM Sans', 'Segoe UI', sans-serif",
//   fontMono: "'JetBrains Mono', monospace",
//   radius: "8px",
//   radiusSm: "5px",
//   shadow: "0 1px 3px rgba(0,0,0,0.08)",
//   shadowMd: "0 4px 14px rgba(0,0,0,0.1)",
// };

// const PRIORITY_CFG = {
//   Critical: { color: T.red, bg: T.redBg, dot: "●" },
//   High: { color: T.orange, bg: T.orangeBg, dot: "▲" },
//   Medium: { color: T.blue, bg: T.blueBg, dot: "◆" },
//   Low: { color: T.green, bg: T.greenBg, dot: "▼" },
// };

// const authHeaders = () => ({
//   Authorization: `Bearer ${localStorage.getItem("token")}`,
// });

// // ── Tiny helpers ──────────────────────────────────────────────────────────────
// const avatar = (name = "?") => name.charAt(0).toUpperCase();
// const avatarColor = (s) => {
//   // Light mode friendly avatar backgrounds
//   const palette = ["#D97706", "#0969DA", "#1A7F37", "#D1242F", "#8250DF", "#BF8700"];
//   let h = 0;
//   for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
//   return palette[Math.abs(h) % palette.length];
// };

// const ServiceTag = ({ label, closed }) => (
//   <span style={{
//     display: "inline-block",
//     padding: "2px 8px",
//     borderRadius: "20px",
//     fontSize: "0.68rem",
//     fontWeight: 600,
//     letterSpacing: "0.03em",
//     background: closed ? T.grayBg : T.accentDim,
//     color: closed ? T.textDisabled : T.accent,
//     border: `1px solid ${closed ? T.border : T.accent}30`,
//     whiteSpace: "nowrap",
//   }}>
//     {label}
//   </span>
// );

// const SubTag = ({ label, closed }) => (
//   <span style={{
//     display: "inline-block",
//     padding: "2px 8px",
//     borderRadius: "20px",
//     fontSize: "0.68rem",
//     fontWeight: 600,
//     background: closed ? T.grayBg : T.blueBg,
//     color: closed ? T.textDisabled : T.blue,
//     border: `1px solid ${closed ? T.border : T.blue}30`,
//     whiteSpace: "nowrap",
//   }}>
//     {label}
//   </span>
// );

// const StatusPill = ({ status }) => {
//   const isActive = status === "Active";
//   return (
//     <span style={{
//       display: "inline-flex",
//       alignItems: "center",
//       gap: "5px",
//       padding: "3px 10px",
//       borderRadius: "20px",
//       fontSize: "0.7rem",
//       fontWeight: 700,
//       letterSpacing: "0.05em",
//       background: isActive ? T.greenBg : T.grayBg,
//       color: isActive ? T.green : T.textDisabled,
//       border: `1px solid ${isActive ? T.green : T.border}40`,
//     }}>
//       <span style={{
//         width: 6, height: 6, borderRadius: "50%",
//         background: isActive ? T.green : T.textDisabled,
//         display: "inline-block",
//       }} />
//       {status}
//     </span>
//   );
// };

// const DeadlineLabel = ({ deadline }) => {
//   if (!deadline) return null;
//   const d = new Date(deadline);
//   const now = new Date();
//   const diff = differenceInDays(d, now);
//   const overdue = diff < 0;
//   const soon = !overdue && diff <= 3;
//   return (
//     <span style={{
//       fontSize: "0.7rem",
//       fontWeight: 600,
//       color: overdue ? T.red : soon ? T.orange : T.textSecondary,
//     }}>
//       {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `Due in ${diff}d`}
//     </span>
//   );
// };

// // ── Pending Task Sidebar Item ─────────────────────────────────────────────────
// const SidebarTaskItem = ({ task, projectName }) => {
//   const cfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
//   return (
//     <div className="sidebar-task" style={{
//       padding: "10px 12px",
//       borderRadius: T.radiusSm,
//       background: T.bgCard,
//       border: `1px solid ${T.border}`,
//       marginBottom: 8,
//     }}>
//       <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
//         <span style={{
//           fontSize: "0.65rem",
//           color: cfg.color,
//           marginTop: 2,
//           flexShrink: 0,
//         }}>{cfg.dot}</span>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{
//             fontSize: "0.8rem",
//             fontWeight: 600,
//             color: T.textPrimary,
//             lineHeight: 1.4,
//             marginBottom: 3,
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             whiteSpace: "nowrap",
//           }}>
//             {task.title}
//           </div>
//           <div style={{
//             fontSize: "0.7rem",
//             color: T.textSecondary,
//             marginBottom: task.deadline ? 4 : 0,
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             whiteSpace: "nowrap",
//           }}>
//             {projectName}
//           </div>
//           {task.deadline && <DeadlineLabel deadline={task.deadline} />}
//         </div>
//         <span style={{
//           fontSize: "0.62rem",
//           fontWeight: 700,
//           padding: "2px 6px",
//           borderRadius: "4px",
//           background: cfg.bg,
//           color: cfg.color,
//           flexShrink: 0,
//         }}>
//           {task.status === "In Progress" ? "WIP" : "TODO"}
//         </span>
//       </div>
//     </div>
//   );
// };

// // ── Project Card ──────────────────────────────────────────────────────────────
// const ProjectCard = ({ project, onOpenKanban }) => {
//   const closed = project.status === "Closed";
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <div 
//       className={`project-card ${closed ? 'closed' : ''}`}
//       style={{
//         background: closed ? T.closedBg : T.bgCard,
//         border: `1px solid ${closed ? T.closedBorder : T.border}`,
//         borderRadius: T.radius,
//         marginBottom: 12,
//         overflow: "hidden",
//         boxShadow: T.shadow,
//         opacity: closed ? 0.75 : 1,
//       }}
//     >
//       {/* Card header */}
//       <div style={{
//         padding: "14px 18px",
//         display: "flex",
//         alignItems: "flex-start",
//         gap: 14,
//         cursor: "pointer",
//       }} onClick={() => setExpanded(p => !p)}>
//         {/* Folder icon */}
//         <div style={{
//           width: 36, height: 36, borderRadius: 8,
//           background: closed ? T.grayBg : T.accentDim,
//           display: "flex", alignItems: "center", justifyContent: "center",
//           flexShrink: 0,
//           fontSize: "1rem",
//         }}>
//           📁
//         </div>

//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
//             <span style={{
//               fontSize: "0.9rem",
//               fontWeight: 700,
//               color: closed ? T.closedText : T.textPrimary,
//               fontFamily: T.font,
//             }}>
//               {project.projectName}
//             </span>
//             <StatusPill status={project.status} />
//             {closed && (
//               <span style={{
//                 fontSize: "0.68rem",
//                 color: T.textDisabled,
//                 fontStyle: "italic",
//               }}>Read-only</span>
//             )}
//           </div>

//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
//             {(project.serviceType || []).map((s, i) => (
//               <ServiceTag key={i} label={s} closed={closed} />
//             ))}
//             <SubTag label={project.subscriptionType} closed={closed} />
//           </div>

//           <div style={{
//             display: "flex", gap: 16, flexWrap: "wrap",
//             fontSize: "0.75rem", color: closed ? T.textDisabled : T.textSecondary,
//           }}>
//             <span>Created by <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.createdBy}</strong></span>
//             {project.clientName && (
//               <span>Client: <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.clientName}</strong></span>
//             )}
//             {project.amount && (
//               <span>Amount: <strong style={{ color: closed ? T.textDisabled : T.accent }}>${Number(project.amount).toLocaleString()}</strong></span>
//             )}
//           </div>
//         </div>

//         {/* Expand chevron */}
//         <div style={{
//           fontSize: "0.75rem", color: T.textSecondary,
//           transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
//           transition: "transform 0.2s",
//           marginTop: 6, flexShrink: 0,
//         }}>▼</div>
//       </div>

//       {/* Expanded details */}
//       {expanded && (
//         <div style={{
//           borderTop: `1px solid ${T.border}`,
//           padding: "14px 18px",
//           display: "flex", flexDirection: "column", gap: 12,
//         }}>
//           {/* Detail grid */}
//           <div style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
//             gap: "10px 20px",
//           }}>
//             {[
//               { label: "Client Email", value: project.clientEmail },
//               { label: "Client Number", value: project.clientNumber },
//               { label: "Business Niche", value: project.businessNiche },
//               { label: "Reference Site", value: project.referenceSite },
//             ].filter(f => f.value).map(({ label, value }) => (
//               <div key={label}>
//                 <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
//                   {label}
//                 </div>
//                 <div style={{ fontSize: "0.8rem", color: closed ? T.textDisabled : T.textPrimary, wordBreak: "break-all" }}>
//                   {label === "Reference Site" ? (
//                     <a href={value} target="_blank" rel="noopener noreferrer"
//                       style={{ color: closed ? T.textDisabled : T.blue, textDecoration: "none" }}
//                       onClick={e => e.stopPropagation()}
//                     >{value}</a>
//                   ) : value}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Project details */}
//           {project.projectDetails && (
//             <div>
//               <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
//                 Details
//               </div>
//               <div style={{
//                 fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
//                 lineHeight: 1.6,
//                 padding: "8px 12px",
//                 background: T.bgInput,
//                 borderRadius: T.radiusSm,
//                 border: `1px solid ${T.border}`,
//               }}>
//                 {project.projectDetails}
//               </div>
//             </div>
//           )}

//           {/* Comments */}
//           {project.comments && (
//             <div>
//               <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
//                 Comments
//               </div>
//               <div style={{
//                 fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
//                 lineHeight: 1.6,
//                 padding: "8px 12px",
//                 background: T.bgInput,
//                 borderRadius: T.radiusSm,
//                 border: `1px solid ${T.border}`,
//               }}>
//                 {project.comments}
//               </div>
//             </div>
//           )}

//           {/* Assigned developers */}
//           <div>
//             <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
//               Team
//             </div>
//             <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//               {(project.assignedDeveloper || []).map((dev, i) => (
//                 <div key={i} style={{
//                   display: "flex", alignItems: "center", gap: 7,
//                   padding: "4px 10px",
//                   background: T.bgInput,
//                   borderRadius: "20px",
//                   border: `1px solid ${T.border}`,
//                 }}>
//                   <div style={{
//                     width: 20, height: 20, borderRadius: "50%",
//                     background: avatarColor(dev.username),
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     fontSize: "0.6rem", fontWeight: 800, color: "#FFF",
//                   }}>
//                     {avatar(dev.username)}
//                   </div>
//                   <span style={{ fontSize: "0.78rem", color: closed ? T.textDisabled : T.textPrimary }}>
//                     {dev.username}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Upsale info */}
//           {project.upsaleData?.length > 0 && (
//             <div>
//               <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
//                 Upsale Packages
//               </div>
//               <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                 {project.upsaleData.map((u, i) => (
//                   <div key={i} style={{
//                     padding: "6px 12px",
//                     background: T.bgInput,
//                     borderRadius: T.radiusSm,
//                     border: `1px solid ${T.border}`,
//                     fontSize: "0.78rem",
//                     color: closed ? T.textDisabled : T.textSecondary,
//                   }}>
//                     <strong style={{ color: closed ? T.textDisabled : T.accent }}>{u.serviceType}</strong>
//                     {u.amount && <span> · ${Number(u.amount).toLocaleString()}</span>}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Kanban button — only for active projects */}
//           {!closed && (
//             <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
//               <button
//                 type="button"
//                 className="btn btn-kanban"
//                 onClick={(e) => { e.stopPropagation(); onOpenKanban(project); }}
//                 style={{
//                   display: "flex", alignItems: "center", gap: 7,
//                   padding: "7px 16px",
//                   borderRadius: T.radiusSm,
//                   fontSize: "0.8rem",
//                   fontWeight: 700,
//                   fontFamily: T.font,
//                 }}
//               >
//                 ⬛ Open Kanban
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Filter Select ─────────────────────────────────────────────────────────────
// const FilterSelect = ({ label, value, onChange, options }) => (
//   <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140 }}>
//     <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
//       {label}
//     </label>
//     <select
//       value={value}
//       onChange={e => onChange(e.target.value)}
//       style={{
//         background: T.bgInput,
//         border: `1px solid ${T.border}`,
//         borderRadius: T.radiusSm,
//         color: value ? T.textPrimary : T.textSecondary,
//         fontSize: "0.8rem",
//         padding: "6px 10px",
//         outline: "none",
//         cursor: "pointer",
//         fontFamily: T.font,
//         appearance: "none",
//         backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
//         backgroundRepeat: "no-repeat",
//         backgroundPosition: "right 8px center",
//         paddingRight: 28,
//       }}
//     >
//       <option value="">All {label}</option>
//       {options.map(o => <option key={o} value={o}>{o}</option>)}
//     </select>
//   </div>
// );

// // ── Main Dashboard ────────────────────────────────────────────────────────────
// const DeveloperDashboard = () => {
//   const [projects, setProjects] = useState([]);
//   const [tasks, setTasks] = useState({});        // { [projectId]: Task[] }
//   const [loadingProjects, setLoadingProjects] = useState(true);
//   const [loadingTasks, setLoadingTasks] = useState(false);
//   const [kanbanProject, setKanbanProject] = useState(null);
//   const [kanbanOpen, setKanbanOpen] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   // Filters
//   const [search, setSearch] = useState("");
//   const [filterCreatedBy, setFilterCreatedBy] = useState("");
//   const [filterSub, setFilterSub] = useState("");
//   const [filterService, setFilterService] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");

//   const currentUserId = localStorage.getItem("userId");
//   const currentUsername = localStorage.getItem("username") || "Developer";

//   // ── Fetch developer's assigned projects ──────────────────────────────────────
//   const fetchProjects = useCallback(async () => {
//     setLoadingProjects(true);
//     try {
//       const r = await axios.get(`${API_BASE}/api/newproject/projects`, {
//         headers: authHeaders(),
//       });
//       const all = Array.isArray(r.data) ? r.data : [];
//       // Filter to only this developer's projects
//       const mine = all.filter(p =>
//         (p.assignedDeveloper || []).some(
//           d => d.id && currentUserId && d.id.toString() === currentUserId.toString()
//         )
//       );
//       setProjects(mine);
//       return mine;
//     } catch {
//       setProjects([]);
//       return [];
//     } finally {
//       setLoadingProjects(false);
//     }
//   }, [currentUserId]);

//   // ── Fetch pending tasks for all assigned projects ────────────────────────────
//   const fetchAllTasks = useCallback(async (projectList) => {
//     setLoadingTasks(true);
//     const result = {};
//     await Promise.allSettled(
//       projectList.map(async (p) => {
//         try {
//           const r = await axios.get(`${API_BASE}/api/tasks/${p._id}`, {
//             headers: authHeaders(),
//           });
//           result[p._id] = (r.data || []).filter(
//             t =>
//               t.status !== "Done" &&
//               t.assignedTo?.id?.toString() === currentUserId?.toString()
//           );
//         } catch {
//           result[p._id] = [];
//         }
//       })
//     );
//     setTasks(result);
//     setLoadingTasks(false);
//   }, [currentUserId]);

//   useEffect(() => {
//     fetchProjects().then(mine => {
//       if (mine.length) fetchAllTasks(mine);
//     });
//   }, [fetchProjects, fetchAllTasks]);

//   // ── Pending tasks flat list for sidebar ──────────────────────────────────────
//   const pendingTasks = useMemo(() => {
//     const flat = [];
//     projects.forEach(p => {
//       const ptasks = tasks[p._id] || [];
//       ptasks.forEach(t => flat.push({ ...t, _projectName: p.projectName }));
//     });
//     // Sort: Critical first, then by deadline asc, then by creation
//     const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
//     return flat.sort((a, b) => {
//       const pd = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
//       if (pd !== 0) return pd;
//       if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
//       if (a.deadline) return -1;
//       if (b.deadline) return 1;
//       return 0;
//     });
//   }, [projects, tasks]);

//   // ── Filter logic ─────────────────────────────────────────────────────────────
//   const filteredProjects = useMemo(() => {
//     return projects.filter(p => {
//       const matchSearch = !search || p.projectName.toLowerCase().includes(search.toLowerCase()) || p.clientName?.toLowerCase().includes(search.toLowerCase());
//       const matchCreatedBy = !filterCreatedBy || p.createdBy === filterCreatedBy;
//       const matchSub = !filterSub || p.subscriptionType === filterSub;
//       const matchService = !filterService || (p.serviceType || []).includes(filterService);
//       const matchStatus = !filterStatus || p.status === filterStatus;
//       return matchSearch && matchCreatedBy && matchSub && matchService && matchStatus;
//     });
//   }, [projects, search, filterCreatedBy, filterSub, filterService, filterStatus]);

//   // ── Filter options ────────────────────────────────────────────────────────────
//   const createdByOptions = [...new Set(projects.map(p => p.createdBy).filter(Boolean))];
//   const subOptions = [...new Set(projects.map(p => p.subscriptionType).filter(Boolean))];
//   const serviceOptions = [...new Set(projects.flatMap(p => p.serviceType || []))];

//   const activeCount = projects.filter(p => p.status === "Active").length;
//   const closedCount = projects.filter(p => p.status === "Closed").length;

//   return (
//     <>
//       {/* ── Fixed CSS Classes inside Style Tag ──────────────────────────── */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
//         * { box-sizing: border-box; }
//         ::-webkit-scrollbar { width: 6px; height: 6px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: #C1C7CD; border-radius: 3px; }
//         ::-webkit-scrollbar-thumb:hover { background: #A1A8AE; }
//         input::placeholder { color: ${T.textDisabled}; }
        
//         /* CSS Classes to replace unstable inline JS onMouseEnter events */
//         .btn {
//           cursor: pointer;
//           transition: all 0.15s ease-in-out;
//         }
//         .btn-toggle {
//           background: ${sidebarOpen ? T.accentDim : T.bgInput};
//           border: 1px solid ${sidebarOpen ? T.accent + "50" : T.border};
//           color: ${sidebarOpen ? T.accent : T.textSecondary};
//         }
//         .btn-toggle:hover {
//           border-color: ${T.borderFocus};
//           color: ${T.textPrimary};
//         }
//         .btn-clear {
//           background: transparent;
//           border: 1px solid ${T.border};
//           color: ${T.textSecondary};
//         }
//         .btn-clear:hover {
//           background: ${T.bgCardHover};
//           color: ${T.textPrimary};
//         }
//         .btn-kanban {
//           background: ${T.accentDim};
//           border: 1px solid ${T.accent}50;
//           color: ${T.accent};
//         }
//         .btn-kanban:hover {
//           background: ${T.accent};
//           color: #FFF;
//         }
//         .btn-refresh {
//           background: ${T.bgInput};
//           border: 1px solid ${T.border};
//           color: ${T.textSecondary};
//         }
//         .btn-refresh:hover {
//           border-color: ${T.borderFocus};
//           color: ${T.textPrimary};
//         }
        
//         /* Interactive Cards */
//         .project-card {
//           transition: border-color 0.2s, box-shadow 0.2s;
//         }
//         .project-card:not(.closed):hover {
//           border-color: ${T.accent}50;
//           box-shadow: 0 0 0 1px ${T.accent}30, ${T.shadowMd} !important;
//         }
//         .sidebar-task {
//           transition: border-color 0.15s;
//         }
//         .sidebar-task:hover {
//           border-color: ${T.borderFocus}80 !important;
//         }
//       `}</style>

//       <div style={{
//         display: "flex",
//         height: "100vh",
//         background: T.bg,
//         fontFamily: T.font,
//         color: T.textPrimary,
//         overflow: "hidden",
//       }}>
//         {/* ── Main content ──────────────────────────────────────────────────── */}
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

//           {/* Top bar */}
//           <div style={{
//             padding: "16px 24px",
//             borderBottom: `1px solid ${T.border}`,
//             display: "flex", alignItems: "center", gap: 16,
//             background: T.bgCard,
//             flexShrink: 0,
//           }}>
//             {/* User avatar */}
//             <div style={{
//               width: 36, height: 36, borderRadius: "50%",
//               background: avatarColor(currentUsername),
//               display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: "0.85rem", fontWeight: 800, color: "#FFF",
//               flexShrink: 0,
//             }}>
//               {avatar(currentUsername)}
//             </div>
//             <div>
//               <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginBottom: 1 }}>
//                 Developer Dashboard
//               </div>
//               <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary }}>
//                 {currentUsername}
//               </div>
//             </div>

//             {/* Stats */}
//             <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
//               <div style={{ textAlign: "right" }}>
//                 <div style={{ fontSize: "0.65rem", color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>Active</div>
//                 <div style={{ fontSize: "1.1rem", fontWeight: 800, color: T.green }}>{activeCount}</div>
//               </div>
//               <div style={{ width: 1, height: 28, background: T.border }} />
//               <div style={{ textAlign: "right" }}>
//                 <div style={{ fontSize: "0.65rem", color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>Closed</div>
//                 <div style={{ fontSize: "1.1rem", fontWeight: 800, color: T.textDisabled }}>{closedCount}</div>
//               </div>
//               <div style={{ width: 1, height: 28, background: T.border }} />
//               <div style={{ textAlign: "right" }}>
//                 <div style={{ fontSize: "0.65rem", color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pending Tasks</div>
//                 <div style={{ fontSize: "1.1rem", fontWeight: 800, color: pendingTasks.length > 0 ? T.orange : T.textSecondary }}>
//                   {loadingTasks ? "…" : pendingTasks.length}
//                 </div>
//               </div>
//               {/* Toggle sidebar */}
//               <button
//                 type="button"
//                 className="btn btn-toggle"
//                 onClick={() => setSidebarOpen(p => !p)}
//                 style={{
//                   padding: "6px 12px",
//                   borderRadius: T.radiusSm,
//                   fontSize: "0.75rem",
//                   fontWeight: 600,
//                   fontFamily: T.font,
//                 }}
//               >
//                 {sidebarOpen ? "Hide Tasks" : "Show Tasks"}
//               </button>
//             </div>
//           </div>

//           {/* Filter bar */}
//           <div style={{
//             padding: "12px 24px",
//             borderBottom: `1px solid ${T.border}`,
//             background: T.bgCard,
//             display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap",
//             flexShrink: 0,
//           }}>
//             {/* Search */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px", minWidth: 180 }}>
//               <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
//                 Search
//               </label>
//               <div style={{ position: "relative" }}>
//                 <span style={{
//                   position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
//                   color: T.textDisabled, fontSize: "0.8rem", pointerEvents: "none",
//                 }}>⌕</span>
//                 <input
//                   value={search}
//                   onChange={e => setSearch(e.target.value)}
//                   placeholder="Project name, client..."
//                   style={{
//                     width: "100%",
//                     background: T.bgInput,
//                     border: `1px solid ${T.border}`,
//                     borderRadius: T.radiusSm,
//                     color: T.textPrimary,
//                     fontSize: "0.8rem",
//                     padding: "6px 10px 6px 28px",
//                     outline: "none",
//                     fontFamily: T.font,
//                   }}
//                   onFocus={e => e.target.style.borderColor = T.borderFocus}
//                   onBlur={e => e.target.style.borderColor = T.border}
//                 />
//               </div>
//             </div>

//             <FilterSelect label="Created By" value={filterCreatedBy} onChange={setFilterCreatedBy} options={createdByOptions} />
//             <FilterSelect label="Subscription" value={filterSub} onChange={setFilterSub} options={subOptions} />
//             <FilterSelect label="Service" value={filterService} onChange={setFilterService} options={serviceOptions} />
//             <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={["Active", "Closed"]} />

//             {/* Clear */}
//             {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
//               <button
//                 type="button"
//                 className="btn btn-clear"
//                 onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }}
//                 style={{
//                   padding: "6px 12px",
//                   alignSelf: "flex-end",
//                   borderRadius: T.radiusSm,
//                   fontSize: "0.78rem",
//                   fontFamily: T.font,
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 × Clear
//               </button>
//             )}
//           </div>

//           {/* Project list */}
//           <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
//             {loadingProjects ? (
//               <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
//                 <div style={{ textAlign: "center" }}>
//                   <div style={{
//                     width: 36, height: 36, borderRadius: "50%",
//                     border: `3px solid ${T.border}`,
//                     borderTopColor: T.accent,
//                     animation: "spin 0.7s linear infinite",
//                     margin: "0 auto 12px",
//                   }} />
//                   <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//                   <div style={{ fontSize: "0.85rem", color: T.textSecondary }}>Loading your projects…</div>
//                 </div>
//               </div>
//             ) : filteredProjects.length === 0 ? (
//               <div style={{ textAlign: "center", paddingTop: 60, color: T.textSecondary }}>
//                 <div style={{ fontSize: "2rem", marginBottom: 12 }}>📂</div>
//                 <div style={{ fontSize: "0.95rem", fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>
//                   {projects.length === 0 ? "No projects assigned to you" : "No projects match your filters"}
//                 </div>
//                 <div style={{ fontSize: "0.8rem" }}>
//                   {projects.length === 0 ? "Ask your project manager to assign you to a project." : "Try adjusting or clearing the filters."}
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div style={{ fontSize: "0.75rem", color: T.textSecondary, marginBottom: 14 }}>
//                   Showing <strong style={{ color: T.textPrimary }}>{filteredProjects.length}</strong> of <strong style={{ color: T.textPrimary }}>{projects.length}</strong> projects
//                 </div>
//                 {filteredProjects.map(p => (
//                   <ProjectCard
//                     key={p._id}
//                     project={p}
//                     onOpenKanban={(proj) => { setKanbanProject(proj); setKanbanOpen(true); }}
//                   />
//                 ))}
//               </>
//             )}
//           </div>
//         </div>

//         {/* ── Pending Tasks Sidebar ─────────────────────────────────────────── */}
//         {sidebarOpen && (
//           <div style={{
//             width: 280,
//             borderLeft: `1px solid ${T.border}`,
//             background: T.bgSidebar,
//             display: "flex",
//             flexDirection: "column",
//             overflow: "hidden",
//             flexShrink: 0,
//           }}>
//             {/* Sidebar header */}
//             <div style={{
//               padding: "16px 16px 12px",
//               borderBottom: `1px solid ${T.border}`,
//               flexShrink: 0,
//             }}>
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
//                 <span style={{ fontSize: "0.8rem", fontWeight: 700, color: T.textPrimary }}>
//                   Pending Tasks
//                 </span>
//                 {!loadingTasks && pendingTasks.length > 0 && (
//                   <span style={{
//                     background: T.orange,
//                     color: "#000",
//                     fontSize: "0.65rem",
//                     fontWeight: 800,
//                     borderRadius: "10px",
//                     padding: "2px 7px",
//                     minWidth: 20,
//                     textAlign: "center",
//                   }}>
//                     {pendingTasks.length}
//                   </span>
//                 )}
//               </div>
//               <div style={{ fontSize: "0.7rem", color: T.textDisabled }}>
//                 Assigned to you · not yet done
//               </div>
//             </div>

//             {/* Task list */}
//             <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
//               {loadingTasks ? (
//                 <div style={{ textAlign: "center", paddingTop: 30, color: T.textDisabled, fontSize: "0.8rem" }}>
//                   Loading tasks…
//                 </div>
//               ) : pendingTasks.length === 0 ? (
//                 <div style={{ textAlign: "center", paddingTop: 30 }}>
//                   <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>✓</div>
//                   <div style={{ fontSize: "0.8rem", color: T.green, fontWeight: 600 }}>All caught up!</div>
//                   <div style={{ fontSize: "0.72rem", color: T.textDisabled, marginTop: 4 }}>No pending tasks</div>
//                 </div>
//               ) : (
//                 <>
//                   {/* Group by In Progress first */}
//                   {["In Progress", "Todo"].map(status => {
//                     const group = pendingTasks.filter(t => t.status === status);
//                     if (group.length === 0) return null;
//                     return (
//                       <div key={status} style={{ marginBottom: 16 }}>
//                         <div style={{
//                           fontSize: "0.62rem",
//                           fontWeight: 700,
//                           color: status === "In Progress" ? T.blue : T.textDisabled,
//                           textTransform: "uppercase",
//                           letterSpacing: "0.08em",
//                           marginBottom: 8,
//                           paddingLeft: 2,
//                         }}>
//                           {status === "In Progress" ? "▶ In Progress" : "○ To Do"} ({group.length})
//                         </div>
//                         {group.map(t => (
//                           <SidebarTaskItem
//                             key={t._id}
//                             task={t}
//                             projectName={t._projectName}
//                           />
//                         ))}
//                       </div>
//                     );
//                   })}
//                 </>
//               )}
//             </div>

//             {/* Sidebar footer */}
//             <div style={{
//               padding: "10px 12px",
//               borderTop: `1px solid ${T.border}`,
//               flexShrink: 0,
//             }}>
//               <button
//                 type="button"
//                 className="btn btn-refresh"
//                 onClick={() => fetchProjects().then(mine => { if (mine.length) fetchAllTasks(mine); })}
//                 style={{
//                   width: "100%",
//                   padding: "7px",
//                   borderRadius: T.radiusSm,
//                   fontSize: "0.75rem",
//                   fontFamily: T.font,
//                 }}
//               >
//                 ↻ Refresh
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Kanban dialog ─────────────────────────────────────────────────────── */}
//       {kanbanProject && (
//         <ProjectKanban
//           open={kanbanOpen}
//           onClose={() => { setKanbanOpen(false); setKanbanProject(null); fetchAllTasks(projects); }}
//           project={kanbanProject}
//         />
//       )}
//     </>
//   );
// };

// export default DeveloperDashboard;











import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { format, isAfter, isBefore, addDays, differenceInDays } from "date-fns";
import ProjectKanban from "../Admin Pages/Components/Projectkanban";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Design tokens (Light Theme) ───────────────────────────────────────────────
const T = {
  bg: "#F6F8FA",             // App background
  bgCard: "#FFFFFF",         // Card background
  bgSidebar: "#F6F8FA",      // Sidebar background
  bgInput: "#FFFFFF",        // Input/select background
  border: "#D0D7DE",         // Default borders
  borderFocus: "#D97706",    // Amber border focus
  accent: "#D97706",         // Primary brand color
  accentDim: "#D9770615",    // Dimmed brand background
  accentHover: "#B35900",    // Hover state for brand
  green: "#1A7F37",          // Success text
  greenBg: "#DAFBE1",        // Success background
  red: "#D1242F",            // Critical text
  redBg: "#FFEBE9",          // Critical background
  blue: "#0969DA",           // Info text
  blueBg: "#DDF4FF",         // Info background
  orange: "#BF8700",         // Warning text
  orangeBg: "#FFF8C5",       // Warning background
  gray: "#656D76",           // Neutral icon/text
  grayBg: "#EAEEF2",         // Neutral background
  textPrimary: "#1F2328",    // Main text
  textSecondary: "#656D76",  // Subtext
  textDisabled: "#8C959F",   // Muted text
  closedBg: "#F8F9FA",       // Closed project background
  closedBorder: "#D0D7DE",   // Closed project border
  closedText: "#656D76",     // Closed project text
  font: "'DM Sans', 'Segoe UI', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  radius: "8px",
  radiusSm: "5px",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
  shadowMd: "0 4px 14px rgba(0,0,0,0.1)",
};

const PRIORITY_CFG = {
  Critical: { color: T.red, bg: T.redBg, dot: "●" },
  High: { color: T.orange, bg: T.orangeBg, dot: "▲" },
  Medium: { color: T.blue, bg: T.blueBg, dot: "◆" },
  Low: { color: T.green, bg: T.greenBg, dot: "▼" },
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const avatar = (name = "?") => name.charAt(0).toUpperCase();
const avatarColor = (s) => {
  const palette = ["#D97706", "#0969DA", "#1A7F37", "#D1242F", "#8250DF", "#BF8700"];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
};

// Event blocker to stop parent libraries from stealing the click
const stopDragEvent = (e) => e.stopPropagation();

const ServiceTag = ({ label, closed }) => (
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "0.68rem",
    fontWeight: 600,
    letterSpacing: "0.03em",
    background: closed ? T.grayBg : T.accentDim,
    color: closed ? T.textDisabled : T.accent,
    border: `1px solid ${closed ? T.border : T.accent}30`,
    whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

const SubTag = ({ label, closed }) => (
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "0.68rem",
    fontWeight: 600,
    background: closed ? T.grayBg : T.blueBg,
    color: closed ? T.textDisabled : T.blue,
    border: `1px solid ${closed ? T.border : T.blue}30`,
    whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

const StatusPill = ({ status }) => {
  const isActive = status === "Active";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      background: isActive ? T.greenBg : T.grayBg,
      color: isActive ? T.green : T.textDisabled,
      border: `1px solid ${isActive ? T.green : T.border}40`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: isActive ? T.green : T.textDisabled,
        display: "inline-block",
      }} />
      {status}
    </span>
  );
};

const DeadlineLabel = ({ deadline }) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const diff = differenceInDays(d, now);
  const overdue = diff < 0;
  const soon = !overdue && diff <= 3;
  return (
    <span style={{
      fontSize: "0.7rem",
      fontWeight: 600,
      color: overdue ? T.red : soon ? T.orange : T.textSecondary,
    }}>
      {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `Due in ${diff}d`}
    </span>
  );
};

// ── Pending Task Sidebar Item ─────────────────────────────────────────────────
const SidebarTaskItem = ({ task, projectName }) => {
  const cfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
  return (
    <div className="sidebar-task" style={{
      padding: "10px 12px",
      borderRadius: T.radiusSm,
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{
          fontSize: "0.65rem",
          color: cfg.color,
          marginTop: 2,
          flexShrink: 0,
        }}>{cfg.dot}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: T.textPrimary,
            lineHeight: 1.4,
            marginBottom: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {task.title}
          </div>
          <div style={{
            fontSize: "0.7rem",
            color: T.textSecondary,
            marginBottom: task.deadline ? 4 : 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {projectName}
          </div>
          {task.deadline && <DeadlineLabel deadline={task.deadline} />}
        </div>
        <span style={{
          fontSize: "0.62rem",
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: "4px",
          background: cfg.bg,
          color: cfg.color,
          flexShrink: 0,
        }}>
          {task.status === "In Progress" ? "WIP" : "TODO"}
        </span>
      </div>
    </div>
  );
};

// ── Project Card ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onOpenKanban }) => {
  const closed = project.status === "Closed";
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`project-card ${closed ? 'closed' : ''}`}
      style={{
        background: closed ? T.closedBg : T.bgCard,
        border: `1px solid ${closed ? T.closedBorder : T.border}`,
        borderRadius: T.radius,
        marginBottom: 12,
        overflow: "hidden",
        boxShadow: T.shadow,
        opacity: closed ? 0.75 : 1,
      }}
    >
      {/* Card header */}
      <div 
        className="interactive-element"
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }} 
        onClick={() => setExpanded(p => !p)}
        onPointerDown={stopDragEvent} // Block external drag hijacking
      >
        {/* Folder icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: closed ? T.grayBg : T.accentDim,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          fontSize: "1rem",
        }}>
          📁
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: closed ? T.closedText : T.textPrimary,
              fontFamily: T.font,
            }}>
              {project.projectName}
            </span>
            <StatusPill status={project.status} />
            {closed && (
              <span style={{
                fontSize: "0.68rem",
                color: T.textDisabled,
                fontStyle: "italic",
              }}>Read-only</span>
            )}
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {(project.serviceType || []).map((s, i) => (
              <ServiceTag key={i} label={s} closed={closed} />
            ))}
            <SubTag label={project.subscriptionType} closed={closed} />
          </div>

          <div style={{
            display: "flex", gap: 16, flexWrap: "wrap",
            fontSize: "0.75rem", color: closed ? T.textDisabled : T.textSecondary,
          }}>
            <span>Created by <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.createdBy}</strong></span>
            {project.clientName && (
              <span>Client: <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.clientName}</strong></span>
            )}

          </div>
        </div>

        {/* Expand chevron */}
        <div style={{
          fontSize: "0.75rem", color: T.textSecondary,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          marginTop: 6, flexShrink: 0,
        }}>▼</div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${T.border}`,
          padding: "14px 18px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {/* Detail grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "10px 20px",
          }}>
            {[
              { label: "Business Niche", value: project.businessNiche },
              { label: "Client Website", value: project.referenceSite },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                  {label}
                </div>
                <div style={{ fontSize: "0.8rem", color: closed ? T.textDisabled : T.textPrimary, wordBreak: "break-all" }}>
                  {label === "Reference Site" ? (
                    <a href={value} target="_blank" rel="noopener noreferrer"
                      style={{ color: closed ? T.textDisabled : T.blue, textDecoration: "none" }}
                      onClick={e => e.stopPropagation()}
                      onPointerDown={stopDragEvent}
                    >{value}</a>
                  ) : value}
                </div>
              </div>
            ))}
          </div>

          {/* Project details */}
          {project.projectDetails && (
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Details
              </div>
              <div style={{
                fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
                lineHeight: 1.6,
                padding: "8px 12px",
                background: T.bgInput,
                borderRadius: T.radiusSm,
                border: `1px solid ${T.border}`,
              }}>
                {project.projectDetails}
              </div>
            </div>
          )}

          {/* Comments */}
          {project.comments && (
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Comments
              </div>
              <div style={{
                fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
                lineHeight: 1.6,
                padding: "8px 12px",
                background: T.bgInput,
                borderRadius: T.radiusSm,
                border: `1px solid ${T.border}`,
              }}>
                {project.comments}
              </div>
            </div>
          )}

          {/* Assigned developers */}
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Team
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(project.assignedDeveloper || []).map((dev, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "4px 10px",
                  background: T.bgInput,
                  borderRadius: "20px",
                  border: `1px solid ${T.border}`,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: avatarColor(dev.username),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", fontWeight: 800, color: "#FFF",
                  }}>
                    {avatar(dev.username)}
                  </div>
                  <span style={{ fontSize: "0.78rem", color: closed ? T.textDisabled : T.textPrimary }}>
                    {dev.username}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upsale info */}
          {project.upsaleData?.length > 0 && (
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Upsale Packages
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {project.upsaleData.map((u, i) => (
                  <div key={i} style={{
                    padding: "6px 12px",
                    background: T.bgInput,
                    borderRadius: T.radiusSm,
                    border: `1px solid ${T.border}`,
                    fontSize: "0.78rem",
                    color: closed ? T.textDisabled : T.textSecondary,
                  }}>
                    <strong style={{ color: closed ? T.textDisabled : T.accent }}>{u.serviceType}</strong>
                    {u.amount && <span> · ${Number(u.amount).toLocaleString()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kanban button — only for active projects */}
          {!closed && (
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
              <button
                type="button"
                className="btn btn-kanban interactive-element"
                onClick={(e) => { e.stopPropagation(); onOpenKanban(project); }}
                onPointerDown={stopDragEvent} // Block external drag hijacking
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 16px",
                  borderRadius: T.radiusSm,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  fontFamily: T.font,
                }}
              >
                ⬛ Open Kanban
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Filter Select ─────────────────────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140 }}>
    <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onPointerDown={stopDragEvent} // Block external drag hijacking
      className="interactive-element"
      style={{
        background: T.bgInput,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusSm,
        color: value ? T.textPrimary : T.textSecondary,
        fontSize: "0.8rem",
        padding: "6px 10px",
        outline: "none",
        fontFamily: T.font,
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        paddingRight: 28,
      }}
    >
      <option value="">All {label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const DeveloperDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [kanbanProject, setKanbanProject] = useState(null);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "Developer";

  // ── Fetch developer's assigned projects ──────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const r = await axios.get(`${API_BASE}/api/newproject/projects`, {
        headers: authHeaders(),
      });
      const all = Array.isArray(r.data) ? r.data : [];
      const mine = all.filter(p =>
        (p.assignedDeveloper || []).some(
          d => d.id && currentUserId && d.id.toString() === currentUserId.toString()
        )
      );
      setProjects(mine);
      return mine;
    } catch {
      setProjects([]);
      return [];
    } finally {
      setLoadingProjects(false);
    }
  }, [currentUserId]);

  // ── Fetch pending tasks for all assigned projects ────────────────────────────
  const fetchAllTasks = useCallback(async (projectList) => {
    setLoadingTasks(true);
    const result = {};
    await Promise.allSettled(
      projectList.map(async (p) => {
        try {
          const r = await axios.get(`${API_BASE}/api/tasks/${p._id}`, {
            headers: authHeaders(),
          });
          result[p._id] = (r.data || []).filter(
            t =>
              t.status !== "Done" &&
              t.assignedTo?.id?.toString() === currentUserId?.toString()
          );
        } catch {
          result[p._id] = [];
        }
      })
    );
    setTasks(result);
    setLoadingTasks(false);
  }, [currentUserId]);

  useEffect(() => {
    fetchProjects().then(mine => {
      if (mine.length) fetchAllTasks(mine);
    });
  }, [fetchProjects, fetchAllTasks]);

  // ── Pending tasks flat list for sidebar ──────────────────────────────────────
  const pendingTasks = useMemo(() => {
    const flat = [];
    projects.forEach(p => {
      const ptasks = tasks[p._id] || [];
      ptasks.forEach(t => flat.push({ ...t, _projectName: p.projectName }));
    });
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return flat.sort((a, b) => {
      const pd = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (pd !== 0) return pd;
      if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });
  }, [projects, tasks]);

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !search || p.projectName.toLowerCase().includes(search.toLowerCase()) || p.clientName?.toLowerCase().includes(search.toLowerCase());
      const matchCreatedBy = !filterCreatedBy || p.createdBy === filterCreatedBy;
      const matchSub = !filterSub || p.subscriptionType === filterSub;
      const matchService = !filterService || (p.serviceType || []).includes(filterService);
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchCreatedBy && matchSub && matchService && matchStatus;
    });
  }, [projects, search, filterCreatedBy, filterSub, filterService, filterStatus]);

  // ── Filter options ────────────────────────────────────────────────────────────
  const createdByOptions = [...new Set(projects.map(p => p.createdBy).filter(Boolean))];
  const subOptions = [...new Set(projects.map(p => p.subscriptionType).filter(Boolean))];
  const serviceOptions = [...new Set(projects.flatMap(p => p.serviceType || []))];

  const activeCount = projects.filter(p => p.status === "Active").length;
  const closedCount = projects.filter(p => p.status === "Closed").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #C1C7CD; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #A1A8AE; }
        input::placeholder { color: ${T.textDisabled}; }
        
        /* Forces buttons/inputs to sit on top of invisible overlays */
        .interactive-element {
          position: relative;
          z-index: 50;
          cursor: pointer;
        }

        .btn {
          transition: all 0.15s ease-in-out;
        }
        .btn-toggle {
          background: ${sidebarOpen ? T.accentDim : T.bgInput};
          border: 1px solid ${sidebarOpen ? T.accent + "50" : T.border};
          color: ${sidebarOpen ? T.accent : T.textSecondary};
        }
        .btn-toggle:hover {
          border-color: ${T.borderFocus};
          color: ${T.textPrimary};
        }
        .btn-clear {
          background: transparent;
          border: 1px solid ${T.border};
          color: ${T.textSecondary};
        }
        .btn-clear:hover {
          background: ${T.bgCardHover};
          color: ${T.textPrimary};
        }
        .btn-kanban {
          background: ${T.accentDim};
          border: 1px solid ${T.accent}50;
          color: ${T.accent};
        }
        .btn-kanban:hover {
          background: ${T.accent};
          color: #FFF;
        }
        .btn-refresh {
          background: ${T.bgInput};
          border: 1px solid ${T.border};
          color: ${T.textSecondary};
        }
        .btn-refresh:hover {
          border-color: ${T.borderFocus};
          color: ${T.textPrimary};
        }
        
        .project-card {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .project-card:not(.closed):hover {
          border-color: ${T.accent}50;
          box-shadow: 0 0 0 1px ${T.accent}30, ${T.shadowMd} !important;
        }
        .sidebar-task {
          transition: border-color 0.15s;
        }
        .sidebar-task:hover {
          border-color: ${T.borderFocus}80 !important;
        }
      `}</style>

      <div style={{
        display: "flex",
        height: "100vh",
        background: T.bg,
        fontFamily: T.font,
        color: T.textPrimary,
        overflow: "hidden",
      }}>
        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Top bar */}
          <div style={{
            padding: "16px 24px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", gap: 16,
            background: T.bgCard,
            flexShrink: 0,
          }}>
            {/* User avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: avatarColor(currentUsername),
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem", fontWeight: 800, color: "#FFF",
              flexShrink: 0,
            }}>
              {avatar(currentUsername)}
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginBottom: 1 }}>
                Developer Dashboard
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary }}>
                {currentUsername}
              </div>
            </div>

            {/* Stats */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.65rem", color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>Active</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: T.green }}>{activeCount}</div>
              </div>
              <div style={{ width: 1, height: 28, background: T.border }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.65rem", color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>Closed</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: T.textDisabled }}>{closedCount}</div>
              </div>
              <div style={{ width: 1, height: 28, background: T.border }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.65rem", color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pending Tasks</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: pendingTasks.length > 0 ? T.orange : T.textSecondary }}>
                  {loadingTasks ? "…" : pendingTasks.length}
                </div>
              </div>
              {/* Toggle sidebar */}
              <button
                type="button"
                className="btn btn-toggle interactive-element"
                onClick={() => setSidebarOpen(p => !p)}
                onPointerDown={stopDragEvent} // Block external drag hijacking
                style={{
                  padding: "6px 12px",
                  borderRadius: T.radiusSm,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  fontFamily: T.font,
                }}
              >
                {sidebarOpen ? "Hide Tasks" : "Show Tasks"}
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{
            padding: "12px 24px",
            borderBottom: `1px solid ${T.border}`,
            background: T.bgCard,
            display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap",
            flexShrink: 0,
          }}>
            {/* Search */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px", minWidth: 180 }}>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Search
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                  color: T.textDisabled, fontSize: "0.8rem", pointerEvents: "none", zIndex: 60,
                }}>⌕</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onPointerDown={stopDragEvent} // Block external drag hijacking
                  className="interactive-element"
                  placeholder="Project name, client..."
                  style={{
                    width: "100%",
                    background: T.bgInput,
                    border: `1px solid ${T.border}`,
                    borderRadius: T.radiusSm,
                    color: T.textPrimary,
                    fontSize: "0.8rem",
                    padding: "6px 10px 6px 28px",
                    outline: "none",
                    fontFamily: T.font,
                    cursor: "text"
                  }}
                  onFocus={e => e.target.style.borderColor = T.borderFocus}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>
            </div>

            <FilterSelect label="Created By" value={filterCreatedBy} onChange={setFilterCreatedBy} options={createdByOptions} />
            <FilterSelect label="Subscription" value={filterSub} onChange={setFilterSub} options={subOptions} />
            <FilterSelect label="Service" value={filterService} onChange={setFilterService} options={serviceOptions} />
            <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={["Active", "Closed"]} />

            {/* Clear */}
            {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
              <button
                type="button"
                className="btn btn-clear interactive-element"
                onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }}
                onPointerDown={stopDragEvent} // Block external drag hijacking
                style={{
                  padding: "6px 12px",
                  alignSelf: "flex-end",
                  borderRadius: T.radiusSm,
                  fontSize: "0.78rem",
                  fontFamily: T.font,
                  whiteSpace: "nowrap",
                }}
              >
                × Clear
              </button>
            )}
          </div>

          {/* Project list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {loadingProjects ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `3px solid ${T.border}`,
                    borderTopColor: T.accent,
                    animation: "spin 0.7s linear infinite",
                    margin: "0 auto 12px",
                  }} />
                  <div style={{ fontSize: "0.85rem", color: T.textSecondary }}>Loading your projects…</div>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 60, color: T.textSecondary }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>📂</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>
                  {projects.length === 0 ? "No projects assigned to you" : "No projects match your filters"}
                </div>
                <div style={{ fontSize: "0.8rem" }}>
                  {projects.length === 0 ? "Ask your project manager to assign you to a project." : "Try adjusting or clearing the filters."}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "0.75rem", color: T.textSecondary, marginBottom: 14 }}>
                  Showing <strong style={{ color: T.textPrimary }}>{filteredProjects.length}</strong> of <strong style={{ color: T.textPrimary }}>{projects.length}</strong> projects
                </div>
                {filteredProjects.map(p => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    onOpenKanban={(proj) => { setKanbanProject(proj); setKanbanOpen(true); }}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Pending Tasks Sidebar ─────────────────────────────────────────── */}
        {sidebarOpen && (
          <div style={{
            width: 280,
            borderLeft: `1px solid ${T.border}`,
            background: T.bgSidebar,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            {/* Sidebar header */}
            <div style={{
              padding: "16px 16px 12px",
              borderBottom: `1px solid ${T.border}`,
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: T.textPrimary }}>
                  Pending Tasks
                </span>
                {!loadingTasks && pendingTasks.length > 0 && (
                  <span style={{
                    background: T.orange,
                    color: "#000",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    borderRadius: "10px",
                    padding: "2px 7px",
                    minWidth: 20,
                    textAlign: "center",
                  }}>
                    {pendingTasks.length}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.7rem", color: T.textDisabled }}>
                Assigned to you · not yet done
              </div>
            </div>

            {/* Task list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {loadingTasks ? (
                <div style={{ textAlign: "center", paddingTop: 30, color: T.textDisabled, fontSize: "0.8rem" }}>
                  Loading tasks…
                </div>
              ) : pendingTasks.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 30 }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>✓</div>
                  <div style={{ fontSize: "0.8rem", color: T.green, fontWeight: 600 }}>All caught up!</div>
                  <div style={{ fontSize: "0.72rem", color: T.textDisabled, marginTop: 4 }}>No pending tasks</div>
                </div>
              ) : (
                <>
                  {/* Group by In Progress first */}
                  {["In Progress", "Todo"].map(status => {
                    const group = pendingTasks.filter(t => t.status === status);
                    if (group.length === 0) return null;
                    return (
                      <div key={status} style={{ marginBottom: 16 }}>
                        <div style={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color: status === "In Progress" ? T.blue : T.textDisabled,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 8,
                          paddingLeft: 2,
                        }}>
                          {status === "In Progress" ? "▶ In Progress" : "○ To Do"} ({group.length})
                        </div>
                        {group.map(t => (
                          <SidebarTaskItem
                            key={t._id}
                            task={t}
                            projectName={t._projectName}
                          />
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Sidebar footer */}
            <div style={{
              padding: "10px 12px",
              borderTop: `1px solid ${T.border}`,
              flexShrink: 0,
            }}>
              <button
                type="button"
                className="btn btn-refresh interactive-element"
                onClick={() => fetchProjects().then(mine => { if (mine.length) fetchAllTasks(mine); })}
                onPointerDown={stopDragEvent} // Block external drag hijacking
                style={{
                  width: "100%",
                  padding: "7px",
                  borderRadius: T.radiusSm,
                  fontSize: "0.75rem",
                  fontFamily: T.font,
                }}
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Kanban dialog ─────────────────────────────────────────────────────── */}
      {kanbanProject && (
        <ProjectKanban
          open={kanbanOpen}
          onClose={() => { setKanbanOpen(false); setKanbanProject(null); fetchAllTasks(projects); }}
          project={kanbanProject}
        />
      )}
    </>
  );
};

export default DeveloperDashboard;