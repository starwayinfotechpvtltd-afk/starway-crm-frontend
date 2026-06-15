// import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
// import axios from "axios";
// import { differenceInCalendarDays, format } from "date-fns";

// const ProjectKanban = React.lazy(() => import("../Admin Pages/Components/Projectkanban"));

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// // Priority weights map for strict ordering
// const PRIORITY_ORDER = {
//   Critical: 1,
//   High: 2,
//   Medium: 3,
//   Low: 4,
// };

// // ── Design Tokens (Light Theme) ───────────────────────────────────────────────
// const T = {
//   // Core surfaces
//   bg: "#F8FAFC",
//   bgCard: "#FFFFFF",
//   bgElevated: "#F1F5F9",
//   bgInput: "#FFFFFF",
//   bgHover: "#F1F5F9",

//   // Borders
//   border: "#E2E8F0",
//   borderMed: "#CBD5E1",
//   borderFocus: "#4F6EF7",

//   // Brand accent — vibrant indigo
//   accent: "#4F6EF7",
//   accentDim: "rgba(79, 110, 247, 0.08)",
//   accentHover: "#3B52C7",
//   accentText: "#3F5AD3",

//   // Semantic colors
//   green: "#10B981",
//   greenDim: "rgba(16, 185, 129, 0.08)",
//   greenText: "#047857",
//   red: "#EF4444",
//   redDim: "rgba(239, 68, 68, 0.08)",
//   orange: "#F59E0B",
//   orangeDim: "rgba(245, 158, 11, 0.08)",
//   blue: "#3B82F6",
//   blueDim: "rgba(59, 130, 246, 0.08)",

//   // Typography
//   textPrimary: "#0F172A",
//   textSecondary: "#475569",
//   textMuted: "#64748B",
//   textDisabled: "#94A3B8",

//   // Utility
//   font: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
//   fontMono: "'JetBrains Mono', 'Fira Code', monospace",
//   radius: "10px",
//   radiusSm: "6px",
//   radiusXs: "4px",
//   shadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)",
//   shadowMd: "0 4px 12px rgba(15,23,42,0.05), 0 2px 4px rgba(15,23,42,0.05)",
//   shadowLg: "0 12px 32px rgba(15,23,42,0.12), 0 4px 12px rgba(15,23,42,0.06)",
// };

// const PRIORITY_CFG = {
//   Critical: { color: T.red, bg: T.redDim, dot: "●", ring: "#EF4444" },
//   High: { color: T.orange, bg: T.orangeDim, dot: "▲", ring: "#F59E0B" },
//   Medium: { color: T.accentText, bg: T.accentDim, dot: "◆", ring: "#4F6EF7" },
//   Low: { color: T.greenText, bg: T.greenDim, dot: "▼", ring: "#10B981" },
// };

// const authHeaders = () => ({
//   Authorization: `Bearer ${localStorage.getItem("token")}`,
// });

// // ── Urgency helpers ───────────────────────────────────────────────────────────
// const getUrgency = (deadline) => {
//   if (!deadline) return null;
//   const diff = differenceInCalendarDays(new Date(deadline), new Date());
//   if (diff < 0) return "overdue";
//   if (diff <= 1) return "critical";
//   if (diff <= 3) return "high";
//   if (diff <= 6) return "medium";
//   if (diff <= 10) return "low";
//   return null;
// };

// const URGENCY_STYLES = {
//   overdue: {
//     borderLeft: `3px solid ${T.red}`,
//     labelColor: T.red,
//     labelBg: T.redDim,
//     label: "Overdue",
//   },
//   critical: {
//     borderLeft: `3px solid ${T.red}`,
//     labelColor: T.red,
//     labelBg: T.redDim,
//     label: "Due today",
//   },
//   high: {
//     borderLeft: `3px solid ${T.orange}`,
//     labelColor: T.orange,
//     labelBg: T.orangeDim,
//     label: "Due soon",
//   },
//   medium: {
//     borderLeft: `3px solid ${T.accent}`,
//     labelColor: T.accentText,
//     labelBg: T.accentDim,
//     label: "Upcoming",
//   },
//   low: {
//     borderLeft: `3px solid ${T.border}`,
//     labelColor: T.textMuted,
//     labelBg: "transparent",
//     label: "",
//   },
// };

// // ── Atom: Badge ───────────────────────────────────────────────────────────────
// const Badge = ({ children, color = T.textMuted, bg = T.bgElevated, border = T.border }) => (
//   <span style={{
//     display: "inline-flex", alignItems: "center",
//     padding: "2px 7px", borderRadius: "20px",
//     fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.02em",
//     background: bg, color, border: `1px solid ${border}`,
//     whiteSpace: "nowrap", lineHeight: "1.6",
//   }}>{children}</span>
// );

// const ServiceTag = ({ label }) => (
//   <Badge color={T.accentText} bg={T.accentDim} border={`${T.accent}20`}>{label}</Badge>
// );

// const SubTag = ({ label }) => (
//   <Badge color={T.textSecondary} bg={T.bgElevated} border={T.border}>{label}</Badge>
// );

// // ── Atom: StatusDot ───────────────────────────────────────────────────────────
// const StatusPill = ({ status }) => {
//   const isActive = status === "Active";
//   return (
//     <span style={{
//       display: "inline-flex", alignItems: "center", gap: 5,
//       padding: "2px 8px", borderRadius: "20px",
//       fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.04em",
//       background: isActive ? T.greenDim : T.bgElevated,
//       color: isActive ? T.greenText : T.textMuted,
//       border: `1px solid ${isActive ? T.green + "25" : T.border}`,
//     }}>
//       <span style={{
//         width: 5, height: 5, borderRadius: "50%",
//         background: isActive ? T.green : T.textMuted,
//         boxShadow: isActive ? `0 0 4px ${T.green}` : "none",
//       }} />
//       {status}
//     </span>
//   );
// };

// // ── Atom: DeadlineLabel ───────────────────────────────────────────────────────
// const DeadlineLabel = ({ deadline }) => {
//   if (!deadline) return null;
//   const diff = differenceInCalendarDays(new Date(deadline), new Date());
//   const overdue = diff < 0;
//   const critical = !overdue && diff <= 1;
//   const soon = !overdue && !critical && diff <= 3;
//   return (
//     <span style={{
//       fontSize: "0.7rem", fontWeight: 500,
//       color: overdue ? T.red : critical ? T.orange : soon ? T.orange : T.textSecondary,
//       fontFamily: T.fontMono,
//     }}>
//       {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : diff === 1 ? "Due tomorrow" : `${diff}d left`}
//     </span>
//   );
// };

// // ── Atom: Spinner ─────────────────────────────────────────────────────────────
// const Spinner = ({ size = 10, color = "currentColor" }) => (
//   <span style={{
//     display: "inline-block", width: size, height: size,
//     border: `1.5px solid ${color}`, borderRightColor: "transparent",
//     borderRadius: "50%", animation: "spin 0.65s linear infinite", flexShrink: 0,
//   }} />
// );

// // ── Atom: Icon Button ─────────────────────────────────────────────────────────
// const IconBtn = ({ onClick, disabled, children, variant = "ghost", style = {} }) => {
//   const variants = {
//     ghost: { bg: "transparent", border: T.border, color: T.textSecondary, hover: T.bgHover },
//     accent: { bg: T.accentDim, border: `${T.accent}30`, color: T.accentText },
//     success: { bg: T.greenDim, border: `${T.green}30`, color: T.greenText },
//     danger: { bg: T.redDim, border: `${T.red}30`, color: T.red },
//   };
//   const v = variants[variant];
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       style={{
//         display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
//         padding: "4px 10px", borderRadius: T.radiusSm,
//         background: v.bg, border: `1px solid ${v.border}`, color: v.color,
//         fontSize: "0.7rem", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
//         opacity: disabled ? 0.5 : 1, transition: "all 0.12s", whiteSpace: "nowrap",
//         fontFamily: T.font,
//         ...style,
//       }}
//     >
//       {children}
//     </button>
//   );
// };

// // ── Comment Modal ─────────────────────────────────────────────────────────────
// const CommentModal = ({ task, projectId, onClose }) => {
//   const [text, setText] = useState("");
//   const [posting, setPosting] = useState(false);
//   const [posted, setPosted] = useState(false);

//   const submit = async () => {
//     if (!text.trim()) return;
//     setPosting(true);
//     try {
//       await axios.post(
//         `${API_BASE}/api/tasks/${projectId}/${task._id}/comments`,
//         { text: text.trim() },
//         { headers: authHeaders() }
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
//     <div onClick={onClose} style={{
//       position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)",
//       zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
//       backdropFilter: "blur(4px)",
//     }}>
//       <div onClick={e => e.stopPropagation()} style={{
//         background: T.bgCard, border: `1px solid ${T.borderMed}`,
//         borderRadius: T.radius, padding: "24px", width: 380,
//         boxShadow: T.shadowLg, fontFamily: T.font,
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
//           <div>
//             <div style={{ fontSize: "0.65rem", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Add Comment</div>
//             <div style={{ fontSize: "0.9rem", fontWeight: 600, color: T.textPrimary, lineHeight: 1.4, maxWidth: 280 }}>{task.title}</div>
//           </div>
//           <button onClick={onClose} style={{
//             background: "none", border: "none", cursor: "pointer",
//             fontSize: "1.1rem", color: T.textMuted, padding: "0 4px", lineHeight: 1,
//           }}>×</button>
//         </div>
//         {posted ? (
//           <div style={{ textAlign: "center", padding: "20px 0", color: T.greenText, fontWeight: 600, fontSize: "0.85rem" }}>
//             ✓ Comment posted
//           </div>
//         ) : (
//           <>
//             <textarea
//               autoFocus value={text} onChange={e => setText(e.target.value)}
//               placeholder="Add your comment..." rows={4}
//               style={{
//                 width: "100%", resize: "none",
//                 background: T.bgInput, border: `1px solid ${T.border}`,
//                 borderRadius: T.radiusSm, color: T.textPrimary,
//                 fontSize: "0.82rem", padding: "10px 12px",
//                 outline: "none", fontFamily: T.font, lineHeight: 1.6,
//                 boxSizing: "border-box",
//               }}
//               onFocus={e => e.target.style.borderColor = T.borderFocus}
//               onBlur={e => e.target.style.borderColor = T.border}
//             />
//             <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
//               <IconBtn onClick={onClose} disabled={posting}>Cancel</IconBtn>
//               <button onClick={submit} disabled={!text.trim() || posting} style={{
//                 display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
//                 padding: "6px 16px", borderRadius: T.radiusSm,
//                 background: text.trim() ? T.accent : T.bgElevated,
//                 border: `1px solid ${text.trim() ? T.accent : T.border}`,
//                 color: text.trim() ? "#FFF" : T.textMuted,
//                 fontSize: "0.78rem", fontWeight: 600,
//                 cursor: text.trim() && !posting ? "pointer" : "not-allowed",
//                 transition: "all 0.12s",
//               }}>
//                 {posting && <Spinner size={10} color="#FFF" />}
//                 {posting ? "Posting…" : "Post comment"}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Global Add Task Modal ─────────────────────────────────────────────────────
// const GlobalAddTaskModal = ({ projects, initialProjectId, currentUserId, currentUsername, onClose, onSuccess }) => {
//   const currentUserRole = localStorage.getItem("role") || "developer";
//   const isAdmin = currentUserRole === "admin";

//   // Sorted so the last project with an added task sits on top; others stay alphabetical.
//   const activeProjects = useMemo(() => {
//     const list = projects.filter(p => p.status !== "Closed");
//     const lastProjectId = localStorage.getItem("last_added_project_id");

//     return list.sort((a, b) => {
//       const isALast = a._id === lastProjectId;
//       const isBLast = b._id === lastProjectId;

//       if (isALast && !isBLast) return -1;
//       if (!isALast && isBLast) return 1;

//       return (a.projectName || "").localeCompare(b.projectName || "", undefined, { sensitivity: "base" });
//     });
//   }, [projects]);

//   const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || activeProjects[0]?._id || "");
//   const project = useMemo(() => activeProjects.find(p => p._id === selectedProjectId), [activeProjects, selectedProjectId]);
//   const isCreator = isAdmin || project?.createdBy === currentUsername;

//   const developers = useMemo(() => {
//     if (!project) return [];
//     const devs = (project?.assignedDeveloper || []).map(d => ({ id: d.id, username: d.username }));
//     const inList = devs.some(d => d.id === currentUserId);
//     if (!inList && (isCreator || isAdmin)) devs.unshift({ id: currentUserId, username: currentUsername });
//     return devs;
//   }, [project, currentUserId, currentUsername, isCreator, isAdmin]);

//   const [form, setForm] = useState({
//     title: "", description: "", priority: "Medium", deadline: "",
//     assignedTo: { id: currentUserId, username: currentUsername }, links: [],
//   });
//   const [errors, setErrors] = useState({});
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     setForm(p => ({ ...p, assignedTo: { id: currentUserId, username: currentUsername } }));
//   }, [selectedProjectId, currentUserId, currentUsername]);

//   if (activeProjects.length === 0) {
//     return (
//       <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
//         <div onClick={e => e.stopPropagation()} style={{ background: T.bgCard, padding: 32, borderRadius: T.radius, textAlign: "center", boxShadow: T.shadowLg, fontFamily: T.font, border: `1px solid ${T.borderMed}` }}>
//           <div style={{ fontSize: "2rem", marginBottom: 12 }}>🚫</div>
//           <div style={{ fontSize: "1rem", fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>No active projects</div>
//           <div style={{ fontSize: "0.82rem", color: T.textSecondary, marginBottom: 16 }}>There are no active projects to add tasks to.</div>
//           <IconBtn onClick={onClose}>Close</IconBtn>
//         </div>
//       </div>
//     );
//   }

//   const set = (k, v) => {
//     setForm(p => ({ ...p, [k]: v }));
//     if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
//   };

//   const validate = () => {
//     const e = {};
//     if (!form.title.trim()) e.title = "Title is required";
//     if (!form.deadline) e.deadline = "Deadline is required";
//     return e;
//   };

//   const handleSubmit = async () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setSaving(true);
//     try {
//       const res = await axios.post(
//         `${API_BASE}/api/tasks/${selectedProjectId}`,
//         { ...form, deadline: form.deadline || null },
//         { headers: authHeaders() }
//       );
//       const newTask = res.data?.task || res.data;
//       onSuccess?.(newTask, selectedProjectId);

//       // Persist the last successfully targeted project ID for layout priorities
//       localStorage.setItem("last_added_project_id", selectedProjectId);

//       onClose();
//     } catch (err) {
//       console.error("Add task error:", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const fieldStyle = (hasError) => ({
//     width: "100%", padding: "8px 12px", borderRadius: T.radiusSm,
//     border: `1px solid ${hasError ? T.red : T.border}`,
//     background: T.bgInput, color: T.textPrimary,
//     fontSize: "0.82rem", fontFamily: T.font, outline: "none",
//     boxSizing: "border-box", transition: "border-color 0.12s",
//   });

//   const labelStyle = {
//     display: "block", fontSize: "0.65rem", fontWeight: 600, color: T.textMuted,
//     textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
//   };

//   return (
//     <div onClick={onClose} style={{
//       position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)",
//       zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
//       backdropFilter: "blur(4px)",
//     }}>
//       <div onClick={e => e.stopPropagation()} style={{
//         background: T.bgCard, border: `1px solid ${T.borderMed}`,
//         borderRadius: T.radius, width: 460, maxHeight: "88vh",
//         display: "flex", flexDirection: "column", boxShadow: T.shadowLg, fontFamily: T.font,
//       }}>
//         {/* Modal Header */}
//         <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <div>
//             <div style={{ fontSize: "0.65rem", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>New Task</div>
//             <div style={{ fontSize: "1rem", fontWeight: 600, color: T.textPrimary }}>Create task</div>
//           </div>
//           <button onClick={onClose} style={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, cursor: "pointer", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: T.textSecondary }}>×</button>
//         </div>

//         <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
//           <div>
//             <label style={labelStyle}>Project</label>
//             <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} style={fieldStyle(false)} disabled={saving}>
//               {activeProjects.map(p => (
//                 <option key={p._id} value={p._id}>
//                   {p.projectName} {p._id === localStorage.getItem("last_added_project_id") ? " (last used)" : ""}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label style={labelStyle}>Task title <span style={{ color: T.red }}>*</span></label>
//             <input
//               value={form.title} onChange={e => set("title", e.target.value)}
//               placeholder="What needs to be done?"
//               style={fieldStyle(!!errors.title)}
//               disabled={saving}
//               onFocus={e => e.target.style.borderColor = T.borderFocus}
//               onBlur={e => e.target.style.borderColor = errors.title ? T.red : T.border}
//             />
//             {errors.title && <div style={{ fontSize: "0.7rem", color: T.red, marginTop: 4 }}>{errors.title}</div>}
//           </div>

//           <div>
//             <label style={labelStyle}>Description</label>
//             <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Add context or notes..." rows={3}
//               style={{ ...fieldStyle(false), resize: "none" }}
//               disabled={saving}
//               onFocus={e => e.target.style.borderColor = T.borderFocus}
//               onBlur={e => e.target.style.borderColor = T.border}
//             />
//           </div>

//           <div style={{ display: "flex", gap: 12 }}>
//             <div style={{ flex: 1 }}>
//               <label style={labelStyle}>Priority</label>
//               <select value={form.priority} onChange={e => set("priority", e.target.value)} style={fieldStyle(false)} disabled={saving}>
//                 {["Low", "Medium", "High", "Critical"].map(p => <option key={p} value={p}>{p}</option>)}
//               </select>
//             </div>
//             <div style={{ flex: 1 }}>
//               <label style={labelStyle}>Deadline <span style={{ color: T.red }}>*</span></label>
//               <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)}
//                 style={{ ...fieldStyle(!!errors.deadline), colorScheme: "light" }}
//                 disabled={saving}
//                 onFocus={e => e.target.style.borderColor = T.borderFocus}
//                 onBlur={e => e.target.style.borderColor = errors.deadline ? T.red : T.border}
//               />
//               {errors.deadline && <div style={{ fontSize: "0.7rem", color: T.red, marginTop: 4 }}>{errors.deadline}</div>}
//             </div>
//           </div>
//         </div>

//         <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
//           <IconBtn onClick={onClose} disabled={saving}>Cancel</IconBtn>
//           <button onClick={handleSubmit} disabled={saving} style={{
//             display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
//             padding: "8px 20px", borderRadius: T.radiusSm,
//             background: T.accent, border: "none",
//             color: "#FFF", fontSize: "0.82rem", fontWeight: 600,
//             cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1,
//             transition: "all 0.12s",
//           }}>
//             {saving && <Spinner size={10} color="#FFF" />}
//             {saving ? "Creating…" : "Create task"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Task Detail Modal ─────────────────────────────────────────────────────────
// const SidebarTaskDetailModal = ({ task, projectId, projectName, onClose, onTaskComplete }) => {
//   const cfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
//   const [completing, setCompleting] = useState(false);

//   const handleComplete = async () => {
//     setCompleting(true);
//     try {
//       await axios.post(`${API_BASE}/api/tasks/${projectId}/${task._id}/complete`, {}, { headers: authHeaders() });
//       onTaskComplete(task._id, projectId);
//       onClose();
//     } catch (err) {
//       console.error("Complete error:", err);
//       setCompleting(false);
//     }
//   };

//   return (
//     <div onClick={onClose} style={{
//       position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)",
//       zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
//       backdropFilter: "blur(4px)",
//     }}>
//       <div onClick={e => e.stopPropagation()} style={{
//         background: T.bgCard, border: `1px solid ${T.borderMed}`,
//         borderRadius: T.radius, width: 480, maxHeight: "88vh",
//         display: "flex", flexDirection: "column", boxShadow: T.shadowLg, fontFamily: T.font,
//       }}>
//         {/* Colored priority stripe */}
//         <div style={{ height: 3, background: cfg.ring, borderRadius: "10px 10px 0 0" }} />

//         <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//           <div style={{ flex: 1, paddingRight: 12 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//               <span style={{
//                 padding: "2px 8px", borderRadius: T.radiusSm,
//                 background: cfg.bg, color: cfg.color,
//                 fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em",
//               }}>
//                 {cfg.dot} {task.priority}
//               </span>
//               {task.deadline && (
//                 <span style={{
//                   padding: "2px 8px", borderRadius: T.radiusSm,
//                   background: T.bgElevated, border: `1px solid ${T.border}`,
//                   fontSize: "0.68rem",
//                 }}>
//                   <DeadlineLabel deadline={task.deadline} />
//                 </span>
//               )}
//             </div>
//             <div style={{ fontSize: "1rem", fontWeight: 600, color: T.textPrimary, lineHeight: 1.4 }}>{task.title}</div>
//             <div style={{ fontSize: "0.75rem", color: T.textMuted, marginTop: 4 }}>
//               <span style={{ color: T.textSecondary }}>{projectName}</span>
//             </div>
//           </div>
//           <button onClick={onClose} style={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, cursor: "pointer", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: T.textSecondary }}>×</button>
//         </div>

//         <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
//           {task.description ? (
//             <div>
//               <div style={{ fontSize: "0.65rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Description</div>
//               <div style={{
//                 fontSize: "0.85rem", color: T.textSecondary, lineHeight: 1.7,
//                 background: T.bgElevated, padding: "14px 16px",
//                 borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
//               }}>
//                 {task.description}
//               </div>
//             </div>
//           ) : (
//             <div style={{ textAlign: "center", padding: "20px 0", color: T.textMuted, fontSize: "0.82rem" }}>
//               No description provided.
//             </div>
//           )}
//         </div>

//         <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
//           <IconBtn onClick={onClose} disabled={completing}>Close</IconBtn>
//           <button onClick={handleComplete} disabled={completing} style={{
//             display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
//             padding: "8px 20px", borderRadius: T.radiusSm,
//             background: completing ? T.bgElevated : T.greenDim,
//             border: `1px solid ${completing ? T.border : T.green + "30"}`,
//             color: completing ? T.textDisabled : T.greenText,
//             fontSize: "0.82rem", fontWeight: 600,
//             cursor: completing ? "not-allowed" : "pointer",
//             transition: "all 0.12s",
//           }}>
//             {completing && <Spinner size={10} color={T.greenText} />}
//             {completing ? "Marking done…" : "Mark as done"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── TaskCard ──────────────────────────────────────────────────────────────────
// const TaskCard = ({ task, projectId, projectName, onTaskComplete, onTaskClick, onOpenKanban, openingKanbanId }) => {
//   const cfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
//   const urgency = getUrgency(task.deadline);
//   const ustyle = urgency ? URGENCY_STYLES[urgency] : null;
//   const [completing, setCompleting] = useState(false);
//   const [commentOpen, setCommentOpen] = useState(false);
//   const [hovered, setHovered] = useState(false);

//   const handleComplete = async (e) => {
//     e.stopPropagation();
//     setCompleting(true);
//     try {
//       await axios.post(`${API_BASE}/api/tasks/${projectId}/${task._id}/complete`, {}, { headers: authHeaders() });
//       onTaskComplete(task._id, projectId);
//     } catch (err) {
//       console.error(err);
//       setCompleting(false);
//     }
//   };

//   const isKanbanLoading = openingKanbanId === projectId;

//   return (
//     <>
//       <div
//         onClick={() => onTaskClick(task, projectId, projectName)}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//         style={{
//           padding: "12px 14px",
//           borderRadius: T.radiusSm,
//           cursor: "pointer",
//           background: hovered ? T.bgHover : T.bgCard,
//           borderWidth: "1px 1px 1px 0px",
//           borderStyle: "solid",
//           borderColor: hovered ? T.borderMed : T.border,
//           borderLeft: ustyle?.borderLeft || `3px solid ${T.border}`,
//           marginBottom: 6,
//           transition: "all 0.12s",
//           position: "relative",
//           boxShadow: T.shadow,
//         }}
//       >
//         <div style={{ display: "flex", gap: 10 }}>
//           {/* Priority indicator */}
//           <div style={{ paddingTop: 2, flexShrink: 0 }}>
//             <span style={{ fontSize: "0.6rem", color: cfg.color }}>{cfg.dot}</span>
//           </div>

//           <div style={{ flex: 1, minWidth: 0 }}>
//             {/* Title */}
//             <div style={{
//               fontSize: "0.82rem", fontWeight: 500, color: T.textPrimary,
//               marginBottom: 3, lineHeight: 1.4,
//               whiteSpace: "normal",
//               wordBreak: "break-word",
//             }}>
//               {task.title}
//             </div>

//             {/* Project name */}
//             <div style={{
//               fontSize: "0.68rem", color: T.textMuted, marginBottom: 8,
//               whiteSpace: "normal",
//               wordBreak: "break-word",
//             }}>
//               {projectName}
//             </div>

//             {/* Meta row */}
//             <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//               {task.deadline && <DeadlineLabel deadline={task.deadline} />}
//               {urgency && urgency !== "low" && ustyle.label && (
//                 <span style={{
//                   fontSize: "0.58rem", fontWeight: 700, padding: "1px 5px",
//                   borderRadius: T.radiusXs, background: ustyle.labelBg,
//                   color: ustyle.labelColor, textTransform: "uppercase", letterSpacing: "0.06em",
//                 }}>
//                   {urgency === "overdue" ? "OVERDUE" : "URGENT"}
//                 </span>
//               )}
//             </div>

//             {/* Actions row */}
//             <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
//               <IconBtn onClick={handleComplete} disabled={completing} variant="success">
//                 {completing && <Spinner size={8} color={T.greenText} />}
//                 Done
//               </IconBtn>
//               <IconBtn onClick={e => { e.stopPropagation(); setCommentOpen(true); }} disabled={completing}>
//                 Comment
//               </IconBtn>
//               <IconBtn
//                 onClick={e => { e.stopPropagation(); onOpenKanban(projectId); }}
//                 disabled={isKanbanLoading || completing}
//                 variant="accent"
//                 style={{ marginLeft: "auto" }}
//               >
//                 {isKanbanLoading && <Spinner size={8} color={T.accentText} />}
//                 Board
//               </IconBtn>
//             </div>
//           </div>
//         </div>
//       </div>

//       {commentOpen && (
//         <CommentModal task={task} projectId={projectId} onClose={() => setCommentOpen(false)} />
//       )}
//     </>
//   );
// };

// // ── ProjectCard ───────────────────────────────────────────────────────────────
// const ProjectCard = ({ project, onAddTaskTrigger, onOpenKanban, openingKanbanId }) => {
//   const closed = project.status === "Closed";
//   const [expanded, setExpanded] = useState(false);
//   const isKanbanLoading = openingKanbanId === project._id;

//   return (
//     <div style={{
//       background: T.bgCard,
//       border: `1px solid ${T.border}`,
//       borderRadius: T.radius,
//       marginBottom: 8,
//       overflow: "hidden",
//       transition: "border-color 0.12s",
//       opacity: closed ? 0.65 : 1,
//       boxShadow: T.shadow,
//     }}>
//       {/* Row header */}
//       <div
//         style={{
//           padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
//           cursor: "pointer",
//           background: expanded ? T.bgElevated : "transparent",
//           transition: "background 0.12s",
//         }}
//         onClick={() => setExpanded(!expanded)}
//       >
//         {/* Folder icon */}
//         <div style={{
//           width: 34, height: 34, borderRadius: T.radiusSm,
//           background: closed ? T.bgElevated : T.accentDim,
//           border: `1px solid ${closed ? T.border : T.accent + "20"}`,
//           display: "flex", alignItems: "center", justifyContent: "center",
//           fontSize: "0.85rem", flexShrink: 0,
//         }}>
//           {closed ? "🔒" : "📁"}
//         </div>

//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
//             <span style={{
//               fontSize: "0.875rem", fontWeight: 600,
//               color: closed ? T.textSecondary : T.textPrimary,
//               whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
//               maxWidth: "240px",
//             }}>
//               {project.projectName}
//             </span>
//             <StatusPill status={project.status} />
//           </div>
//           <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
//             {(project.serviceType || []).map((s, i) => <ServiceTag key={i} label={s} />)}
//             {project.subscriptionType && <SubTag label={project.subscriptionType} />}
//           </div>
//         </div>

//         <span style={{
//           color: T.textMuted, fontSize: "0.6rem",
//           transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
//           transition: "transform 0.15s",
//         }}>▼</span>
//       </div>

//       {/* Expanded content */}
//       {expanded && (
//         <div style={{
//           borderTop: `1px solid ${T.border}`,
//           padding: "16px 18px",
//           background: T.bgElevated,
//         }}>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 14 }}>
//             <div>
//               <div style={{ fontSize: "0.62rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Business niche</div>
//               <div style={{ fontSize: "0.8rem", color: T.textSecondary }}>{project.businessNiche || "—"}</div>
//             </div>
//             <div>
//               <div style={{ fontSize: "0.62rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Reference site</div>
//               {project.referenceSite ? (
//                 <a href={project.referenceSite} target="_blank" rel="noopener noreferrer"
//                   style={{ fontSize: "0.8rem", color: T.accentText, textDecoration: "none", fontFamily: T.fontMono }}>
//                   {project.referenceSite.replace(/^https?:\/\//, "").slice(0, 30)}…
//                 </a>
//               ) : <span style={{ fontSize: "0.8rem", color: T.textMuted }}>None</span>}
//             </div>
//           </div>

//           {project.projectDetails && (
//             <div style={{ marginBottom: 14 }}>
//               <div style={{ fontSize: "0.62rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Project details</div>
//               <p style={{
//                 fontSize: "0.8rem", color: T.textSecondary, margin: 0, lineHeight: 1.65,
//                 background: T.bgCard, padding: "10px 14px",
//                 border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
//               }}>
//                 {project.projectDetails}
//               </p>
//             </div>
//           )}

//           {!closed && (
//             <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
//               <IconBtn
//                 onClick={e => { e.stopPropagation(); onOpenKanban(project._id); }}
//                 disabled={isKanbanLoading}
//               >
//                 {isKanbanLoading && <Spinner size={8} />}
//                 Open board
//               </IconBtn>
//               <IconBtn
//                 onClick={e => { e.stopPropagation(); onAddTaskTrigger(project._id); }}
//                 variant="accent"
//                 disabled={isKanbanLoading}
//               >
//                 + Add task
//               </IconBtn>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // ── FilterSelect ──────────────────────────────────────────────────────────────
// const FilterSelect = ({ label, value, onChange, options }) => (
//   <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 130 }}>
//     <label style={{ fontSize: "0.6rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
//     <select value={value} onChange={e => onChange(e.target.value)} style={{
//       background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
//       color: value ? T.textPrimary : T.textSecondary,
//       fontSize: "0.78rem", padding: "6px 10px", outline: "none", fontFamily: T.font,
//     }}>
//       <option value="">All</option>
//       {options.map(o => <option key={o} value={o}>{o}</option>)}
//     </select>
//   </div>
// );

// // ── Toast ─────────────────────────────────────────────────────────────────────
// const Toast = ({ message, onHide }) => {
//   useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t); }, [onHide]);
//   return (
//     <div style={{
//       position: "fixed", bottom: 24, right: 24, zIndex: 99999,
//       background: T.bgCard, color: T.greenText,
//       border: `1px solid ${T.green}40`,
//       borderRadius: T.radius, padding: "10px 18px",
//       fontSize: "0.82rem", fontWeight: 600, boxShadow: T.shadowMd,
//       display: "flex", alignItems: "center", gap: 8,
//       fontFamily: T.font,
//     }}>
//       <span style={{
//         width: 18, height: 18, borderRadius: "50%",
//         background: T.greenDim, display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: "0.65rem", color: T.greenText,
//       }}>✓</span>
//       {message}
//     </div>
//   );
// };

// // ── Skeleton loader ───────────────────────────────────────────────────────────
// const SkeletonCard = () => (
//   <div style={{
//     padding: "12px 14px", borderRadius: T.radiusSm,
//     background: T.bgElevated, border: `1px solid ${T.border}`,
//     borderLeft: `3px solid ${T.border}`, marginBottom: 6,
//   }}>
//     <div style={{ display: "flex", gap: 10 }}>
//       <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.bgHover, marginTop: 4 }} />
//       <div style={{ flex: 1 }}>
//         <div style={{ height: 11, background: T.bgHover, borderRadius: T.radiusXs, width: "72%", marginBottom: 6 }} />
//         <div style={{ height: 9, background: T.bgHover, borderRadius: T.radiusXs, width: "42%", marginBottom: 10 }} />
//         <div style={{ display: "flex", gap: 6 }}>
//           <div style={{ height: 20, width: 44, background: T.bgHover, borderRadius: T.radiusSm }} />
//           <div style={{ height: 20, width: 56, background: T.bgHover, borderRadius: T.radiusSm }} />
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // ── Tab Button ────────────────────────────────────────────────────────────────
// const TabBtn = ({ active, onClick, children }) => (
//   <button onClick={onClick} style={{
//     padding: "7px 14px", borderRadius: T.radiusSm, border: "none",
//     background: active ? T.accentDim : "transparent",
//     color: active ? T.accentText : T.textSecondary,
//     fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
//     transition: "all 0.12s", fontFamily: T.font,
//     borderBottom: active ? `2px solid ${T.accent}` : "2px solid transparent",
//   }}>
//     {children}
//   </button>
// );

// // ── Main Dashboard ────────────────────────────────────────────────────────────
// const DeveloperDashboard = () => {
//   const [projects, setProjects] = useState([]);
//   const [tasks, setTasks] = useState({});
//   const [completions, setCompletions] = useState([]);
//   const [loadingInitial, setLoadingInitial] = useState(true);

//   const [kanbanProject, setKanbanProject] = useState(null);
//   const [kanbanOpen, setKanbanOpen] = useState(false);
//   const [openingKanbanId, setOpeningKanbanId] = useState(null);

//   const [activeTab, setActiveTab] = useState("projects");

//   const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
//   const [quickAddInitialProject, setQuickAddInitialProject] = useState("");
//   const [selectedSidebarTask, setSelectedSidebarTask] = useState(null);
//   const [toast, setToast] = useState("");

//   const [search, setSearch] = useState("");
//   const [filterCreatedBy, setFilterCreatedBy] = useState("");
//   const [filterSub, setFilterSub] = useState("");
//   const [filterService, setFilterService] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");

//   const currentUserId = localStorage.getItem("userId");
//   const currentUsername = localStorage.getItem("username") || "Developer";

//   const CACHE_KEYS = useMemo(() => ({
//     projects: `dev_cache_projects_${currentUserId}`,
//     tasks: `dev_cache_tasks_${currentUserId}`,
//     completions: `dev_cache_completions_${currentUserId}`,
//   }), [currentUserId]);

//   useEffect(() => {
//     if (!currentUserId) return;
//     try {
//       const cp = sessionStorage.getItem(CACHE_KEYS.projects);
//       const ct = sessionStorage.getItem(CACHE_KEYS.tasks);
//       const cc = sessionStorage.getItem(CACHE_KEYS.completions);
//       if (cp) setProjects(JSON.parse(cp));
//       if (ct) setTasks(JSON.parse(ct));
//       if (cc) setCompletions(JSON.parse(cc));
//       if (cp && ct && cc) setLoadingInitial(false);
//     } catch (e) {
//       console.warn("Cache parse error:", e);
//     }
//   }, [CACHE_KEYS, currentUserId]);

//   const loadInitialData = useCallback(async (isSilent = false) => {
//     const hasCache = sessionStorage.getItem(CACHE_KEYS.projects);
//     if (!isSilent && !hasCache) setLoadingInitial(true);

//     try {
//       const r = await axios.get(`${API_BASE}/api/newproject/projects`, { headers: authHeaders() });
//       const all = Array.isArray(r.data) ? r.data : [];
//       const mine = all.filter(p =>
//         (p.assignedDeveloper || []).some(d => d.id && currentUserId && d.id.toString() === currentUserId.toString())
//       );

//       const tasksResult = {};
//       const completedList = [];

//       await Promise.allSettled(mine.map(async (p) => {
//         try {
//           const tr = await axios.get(`${API_BASE}/api/tasks/${p._id}`, { headers: authHeaders() });
//           tasksResult[p._id] = (tr.data || []).filter(
//             t => t.status !== "Done" && t.assignedTo?.id?.toString() === currentUserId?.toString()
//           );
//         } catch { tasksResult[p._id] = []; }

//         try {
//           const cr = await axios.get(`${API_BASE}/api/tasks/${p._id}/completions`, { headers: authHeaders() });
//           const list = Array.isArray(cr.data) ? cr.data : [];
//           list.forEach(item => {
//             const mine =
//               item.completedBy?.id?.toString() === currentUserId?.toString() ||
//               item.completedBy?._id?.toString() === currentUserId?.toString() ||
//               item.completedBy?.username === currentUsername;
//             if (mine) completedList.push({ ...item, projectName: p.projectName, projectId: p._id });
//           });
//         } catch (e) { console.error("Completions fetch failed:", p.projectName); }
//       }));

//       completedList.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));

//       setTasks(tasksResult);
//       setCompletions(completedList);
//       setProjects(mine);

//       sessionStorage.setItem(CACHE_KEYS.projects, JSON.stringify(mine));
//       sessionStorage.setItem(CACHE_KEYS.tasks, JSON.stringify(tasksResult));
//       sessionStorage.setItem(CACHE_KEYS.completions, JSON.stringify(completedList));
//     } catch (err) {
//       console.error("Dashboard load error:", err);
//     } finally {
//       setLoadingInitial(false);
//     }
//   }, [currentUserId, CACHE_KEYS, currentUsername]);

//   useEffect(() => { loadInitialData(); }, [loadInitialData]);

//   const handleTaskComplete = useCallback((taskId, projectId) => {
//     setTasks(prev => {
//       const updated = { ...prev, [projectId]: (prev[projectId] || []).filter(t => t._id !== taskId) };
//       sessionStorage.setItem(CACHE_KEYS.tasks, JSON.stringify(updated));
//       return updated;
//     });
//     setToast("Task marked as done");
//     loadInitialData(true);
//   }, [loadInitialData, CACHE_KEYS]);

//   const handleQuickAddSuccess = useCallback((newTask, projectId) => {
//     setToast("Task created");
//     setTasks(prev => {
//       const updated = { ...prev, [projectId]: [...(prev[projectId] || []), newTask] };
//       sessionStorage.setItem(CACHE_KEYS.tasks, JSON.stringify(updated));
//       return updated;
//     });
//     loadInitialData(true);
//   }, [loadInitialData, CACHE_KEYS]);

//   const handleOpenKanban = useCallback((pId) => {
//     setOpeningKanbanId(pId);
//     const target = projects.find(p => p._id === pId);
//     setTimeout(() => {
//       if (target) { setKanbanProject(target); setKanbanOpen(true); }
//       setOpeningKanbanId(null);
//     }, 450);
//   }, [projects]);

//   // Sidebar tasks sorted strictly by priority weight (Critical first, down to Low)
//   const allPendingTasks = useMemo(() => {
//     const list = [];
//     projects.forEach(p => {
//       (tasks[p._id] || []).forEach(t => list.push({ ...t, projectId: p._id, projectName: p.projectName }));
//     });
//     return list.sort((a, b) => {
//       const orderA = PRIORITY_ORDER[a.priority] || 99;
//       const orderB = PRIORITY_ORDER[b.priority] || 99;
//       if (orderA !== orderB) {
//         return orderA - orderB;
//       }
//       const aD = a.deadline ? differenceInCalendarDays(new Date(a.deadline), new Date()) : 999;
//       const bD = b.deadline ? differenceInCalendarDays(new Date(b.deadline), new Date()) : 999;
//       return aD - bD;
//     });
//   }, [projects, tasks]);

//   const groupedCompletedTasks = useMemo(() => {
//     const groups = { Today: [], Yesterday: [], "This week": [], Older: [] };
//     completions.forEach(c => {
//       if (!c.completedAt) { groups.Older.push(c); return; }
//       const diff = differenceInCalendarDays(new Date(), new Date(c.completedAt));
//       if (diff === 0) groups.Today.push(c);
//       else if (diff === 1) groups.Yesterday.push(c);
//       else if (diff <= 7) groups["This week"].push(c);
//       else groups.Older.push(c);
//     });
//     return groups;
//   }, [completions]);

//   // Main workspace project cards are arranged alphabetically
//   const filteredProjects = useMemo(() => {
//     const list = projects.filter(p => {
//       const s = search.toLowerCase();
//       return (
//         (!search || p.projectName?.toLowerCase().includes(s) || p.clientName?.toLowerCase().includes(s)) &&
//         (!filterCreatedBy || p.createdBy === filterCreatedBy) &&
//         (!filterSub || p.subscriptionType === filterSub) &&
//         (!filterService || (p.serviceType || []).includes(filterService)) &&
//         (!filterStatus || p.status === filterStatus)
//       );
//     });
//     return list.sort((a, b) =>
//       (a.projectName || "").localeCompare(b.projectName || "", undefined, { sensitivity: "base" })
//     );
//   }, [projects, search, filterCreatedBy, filterSub, filterService, filterStatus]);

//   const createdByOptions = [...new Set(projects.map(p => p.createdBy).filter(Boolean))];
//   const subOptions = [...new Set(projects.map(p => p.subscriptionType).filter(Boolean))];
//   const serviceOptions = [...new Set(projects.flatMap(p => p.serviceType || []))];

//   // Task urgency summary for sidebar header
//   const overdueCount = allPendingTasks.filter(t => getUrgency(t.deadline) === "overdue").length;
//   const urgentCount = allPendingTasks.filter(t => ["critical", "high"].includes(getUrgency(t.deadline))).length;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
//         * { box-sizing: border-box; margin: 0; padding: 0; }

//         @keyframes spin { to { transform: rotate(360deg); } }

//         @keyframes pulse-skeleton {
//           0%, 100% { opacity: 0.4; }
//           50% { opacity: 0.7; }
//         }
//         .skeleton-pulse { animation: pulse-skeleton 1.6s ease-in-out infinite; }

//         @keyframes fadeSlideIn {
//           from { opacity: 0; transform: translateY(4px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .fade-in { animation: fadeSlideIn 0.18s ease; }

//         ::-webkit-scrollbar { width: 4px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
//         ::-webkit-scrollbar-thumb:hover { background: ${T.borderMed}; }

//         input[type="date"]::-webkit-calendar-picker-indicator { filter: none; opacity: 0.6; }

//         select option { background: ${T.bgCard}; color: ${T.textPrimary}; }
//       `}</style>

//       <div style={{
//         display: "flex", flexDirection: "column",
//         height: "calc(100vh - 60px)", background: T.bg,
//         fontFamily: T.font, color: T.textPrimary, overflow: "hidden",
//       }}>
//         <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

//           {/* ── LEFT: Main Workspace ── */}
//           <div style={{
//             flex: 1, display: "flex", flexDirection: "column",
//             background: T.bg, borderRight: `1px solid ${T.border}`,
//             overflow: "hidden", minWidth: 0,
//           }}>

//             {/* Top Bar */}
//             <div style={{
//               padding: "0 24px",
//               borderBottom: `1px solid ${T.border}`,
//               display: "flex", justifyContent: "space-between", alignItems: "center",
//               flexShrink: 0, background: T.bgCard, height: 52,
//             }}>
//               <div style={{ display: "flex", gap: 4 }}>
//                 <TabBtn active={activeTab === "projects"} onClick={() => setActiveTab("projects")}>
//                   Projects <span style={{
//                     marginLeft: 5, padding: "1px 6px", borderRadius: "10px",
//                     background: T.bgElevated, color: T.textMuted,
//                     fontSize: "0.65rem", fontWeight: 600,
//                   }}>{filteredProjects.length}</span>
//                 </TabBtn>
//                 <TabBtn active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>
//                   History <span style={{
//                     marginLeft: 5, padding: "1px 6px", borderRadius: "10px",
//                     background: T.bgElevated, color: T.textMuted,
//                     fontSize: "0.65rem", fontWeight: 600,
//                   }}>{completions.length}</span>
//                 </TabBtn>
//               </div>

//               <button
//                 onClick={() => { setQuickAddInitialProject(""); setQuickAddModalOpen(true); }}
//                 style={{
//                   display: "flex", alignItems: "center", gap: 6,
//                   padding: "6px 14px", borderRadius: T.radiusSm,
//                   background: T.accent, border: "none", color: "#FFF",
//                   fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
//                   transition: "background 0.12s",
//                 }}
//                 onMouseEnter={e => e.currentTarget.style.background = T.accentHover}
//                 onMouseLeave={e => e.currentTarget.style.background = T.accent}
//               >
//                 <span style={{ fontSize: "0.8rem" }}>+</span> New task
//               </button>
//             </div>

//             {/* Content area */}
//             {loadingInitial ? (
//               <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.textMuted, fontSize: "0.82rem" }}>
//                   <Spinner size={14} color={T.accent} />
//                   Loading workspace…
//                 </div>
//               </div>
//             ) : activeTab === "projects" ? (
//               <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

//                 {/* Filter bar */}
//                 <div style={{
//                   padding: "10px 24px",
//                   borderBottom: `1px solid ${T.border}`,
//                   background: T.bgCard,
//                   display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end",
//                 }}>
//                   <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 }}>
//                     <label style={{ fontSize: "0.6rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Search</label>
//                     <input
//                       value={search} onChange={e => setSearch(e.target.value)}
//                       placeholder="Project name or client…"
//                       style={{
//                         background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
//                         color: T.textPrimary, fontSize: "0.78rem", padding: "6px 10px", outline: "none",
//                         fontFamily: T.font,
//                       }}
//                       onFocus={e => e.target.style.borderColor = T.borderFocus}
//                       onBlur={e => e.target.style.borderColor = T.border}
//                     />
//                   </div>
//                   <FilterSelect label="Created by" value={filterCreatedBy} onChange={setFilterCreatedBy} options={createdByOptions} />
//                   <FilterSelect label="Subscription" value={filterSub} onChange={setFilterSub} options={subOptions} />
//                   <FilterSelect label="Service" value={filterService} onChange={setFilterService} options={serviceOptions} />
//                   <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={["Active", "Closed"]} />
//                   {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
//                     <button
//                       onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }}
//                       style={{
//                         alignSelf: "flex-end", padding: "6px 10px", borderRadius: T.radiusSm,
//                         background: "none", border: `1px solid ${T.border}`, color: T.textMuted,
//                         fontSize: "0.72rem", cursor: "pointer", fontFamily: T.font,
//                       }}
//                     >
//                       Clear
//                     </button>
//                   )}
//                 </div>

//                 {/* Projects list */}
//                 <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }} className="fade-in">
//                   {filteredProjects.length === 0 ? (
//                     <div style={{ textAlign: "center", paddingTop: 60, color: T.textMuted }}>
//                       <div style={{ fontSize: "1.5rem", marginBottom: 8, opacity: 0.5 }}>📂</div>
//                       <div style={{ fontSize: "0.85rem" }}>No projects match your filters.</div>
//                       <div style={{ fontSize: "0.75rem", marginTop: 4, color: T.textDisabled }}>Try adjusting or clearing your search.</div>
//                     </div>
//                   ) : (
//                     filteredProjects.map(p => (
//                       <ProjectCard
//                         key={p._id}
//                         project={p}
//                         onOpenKanban={handleOpenKanban}
//                         openingKanbanId={openingKanbanId}
//                         onAddTaskTrigger={(projId) => {
//                           setQuickAddInitialProject(projId);
//                           setQuickAddModalOpen(true);
//                         }}
//                       />
//                     ))
//                   )}
//                 </div>
//               </div>

//             ) : (
//               /* ── Completed history ── */
//               <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }} className="fade-in">
//                 {completions.length === 0 ? (
//                   <div style={{ textAlign: "center", paddingTop: 60, color: T.textMuted }}>
//                     <div style={{ fontSize: "1.5rem", marginBottom: 8, opacity: 0.5 }}>✓</div>
//                     <div style={{ fontSize: "0.85rem" }}>No completed tasks yet.</div>
//                     <div style={{ fontSize: "0.75rem", marginTop: 4, color: T.textDisabled }}>Tasks you complete will appear here.</div>
//                   </div>
//                 ) : (
//                   Object.entries(groupedCompletedTasks).map(([groupName, items]) => {
//                     if (items.length === 0) return null;
//                     return (
//                       <div key={groupName} style={{ marginBottom: 28 }}>
//                         <div style={{
//                           display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
//                         }}>
//                           <span style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
//                             {groupName}
//                           </span>
//                           <span style={{ padding: "1px 6px", borderRadius: "10px", background: T.bgElevated, color: T.textMuted, fontSize: "0.62rem", fontWeight: 600 }}>
//                             {items.length}
//                           </span>
//                           <div style={{ flex: 1, height: "1px", background: T.border }} />
//                         </div>

//                         <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//                           {items.map((item, idx) => (
//                             <div key={idx} style={{
//                               display: "flex", alignItems: "center", gap: 12,
//                               padding: "11px 14px", background: T.bgCard,
//                               border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
//                               boxShadow: T.shadow,
//                             }}>
//                               <span style={{
//                                 width: 20, height: 20, borderRadius: "50%",
//                                 background: T.greenDim, display: "flex",
//                                 alignItems: "center", justifyContent: "center",
//                                 fontSize: "0.6rem", color: T.greenText, flexShrink: 0,
//                               }}>✓</span>
//                               <div style={{ flex: 1, minWidth: 0 }}>
//                                 <div style={{ fontSize: "0.82rem", fontWeight: 500, color: T.textPrimary, marginBottom: 2 }}>{item.taskTitle}</div>
//                                 <div style={{ fontSize: "0.7rem", color: T.textMuted }}>{item.projectName}</div>
//                               </div>
//                               <div style={{ textAlign: "right", flexShrink: 0 }}>
//                                 <div style={{ fontSize: "0.68rem", color: T.textMuted }}>by {item.completedBy?.username}</div>
//                                 {item.completedAt && (
//                                   <div style={{ fontSize: "0.65rem", color: T.textDisabled, marginTop: 2, fontFamily: T.fontMono }}>
//                                     {format(new Date(item.completedAt), "MMM d · h:mm a")}
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     );
//                   })
//                 )}
//               </div>
//             )}
//           </div>

//           {/* ── RIGHT: Task Sidebar ── */}
//           <div style={{
//             width: 340, minWidth: 340, maxWidth: 340,
//             background: T.bgCard, display: "flex", flexDirection: "column",
//             overflow: "hidden", borderLeft: `1px solid ${T.border}`,
//           }}>
//             {/* Sidebar header */}
//             <div style={{
//               padding: "14px 18px",
//               borderBottom: `1px solid ${T.border}`,
//               flexShrink: 0,
//               background: T.bgCard,
//             }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                 <div>
//                   <div style={{ fontSize: "0.82rem", fontWeight: 600, color: T.textPrimary, marginBottom: 3 }}>My tasks</div>
//                   <div style={{ fontSize: "0.7rem", color: T.textMuted }}>
//                     {loadingInitial ? "Syncing…" : `${allPendingTasks.length} pending`}
//                   </div>
//                 </div>
//                 {!loadingInitial && (overdueCount > 0 || urgentCount > 0) && (
//                   <div style={{ display: "flex", gap: 4 }}>
//                     {overdueCount > 0 && (
//                       <span style={{ padding: "2px 7px", borderRadius: "10px", background: T.redDim, color: T.red, fontSize: "0.65rem", fontWeight: 700, border: `1px solid ${T.red}40` }}>
//                         {overdueCount} overdue
//                       </span>
//                     )}
//                     {urgentCount > 0 && (
//                       <span style={{ padding: "2px 7px", borderRadius: "10px", background: T.orangeDim, color: T.orange, fontSize: "0.65rem", fontWeight: 700, border: `1px solid ${T.orange}40` }}>
//                         {urgentCount} urgent
//                       </span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Sidebar task list */}
//             <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
//               {loadingInitial ? (
//                 <div className="skeleton-pulse">
//                   {[1, 2, 3].map(v => <SkeletonCard key={v} />)}
//                 </div>
//               ) : allPendingTasks.length === 0 ? (
//                 <div style={{ textAlign: "center", paddingTop: 50, color: T.textMuted }}>
//                   <div style={{ fontSize: "1.4rem", marginBottom: 8, opacity: 0.4 }}>✓</div>
//                   <div style={{ fontSize: "0.82rem" }}>All caught up!</div>
//                   <div style={{ fontSize: "0.72rem", marginTop: 4, color: T.textDisabled }}>No pending tasks.</div>
//                 </div>
//               ) : (
//                 <div className="fade-in">
//                   {allPendingTasks.map(t => (
//                     <TaskCard
//                       key={t._id}
//                       task={t}
//                       projectId={t.projectId}
//                       projectName={t.projectName}
//                       onTaskComplete={handleTaskComplete}
//                       onOpenKanban={handleOpenKanban}
//                       openingKanbanId={openingKanbanId}
//                       onTaskClick={(task, pId, pName) => setSelectedSidebarTask({ task, projectId: pId, projectName: pName })}
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Kanban overlay ── */}
//       {kanbanProject && (
//         <Suspense fallback={
//           <div style={{
//             position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)",
//             zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
//             backdropFilter: "blur(4px)",
//           }}>
//             <div style={{
//               background: T.bgCard, padding: "20px 28px", borderRadius: T.radius,
//               border: `1px solid ${T.borderMed}`, boxShadow: T.shadowLg,
//               fontFamily: T.font, display: "flex", alignItems: "center", gap: 10,
//             }}>
//               <Spinner size={14} color={T.accent} />
//               <span style={{ fontSize: "0.85rem", fontWeight: 500, color: T.textSecondary }}>Loading board…</span>
//             </div>
//           </div>
//         }>
//           <ProjectKanban
//             open={kanbanOpen}
//             onClose={() => {
//               setKanbanOpen(false);
//               setKanbanProject(null);
//               loadInitialData(true);
//             }}
//             project={kanbanProject}
//           />
//         </Suspense>
//       )}

//       {/* ── Modals ── */}
//       {quickAddModalOpen && (
//         <GlobalAddTaskModal
//           projects={projects}
//           initialProjectId={quickAddInitialProject}
//           currentUserId={currentUserId}
//           currentUsername={currentUsername}
//           onClose={() => setQuickAddModalOpen(false)}
//           onSuccess={handleQuickAddSuccess}
//         />
//       )}

//       {selectedSidebarTask && (
//         <SidebarTaskDetailModal
//           task={selectedSidebarTask.task}
//           projectId={selectedSidebarTask.projectId}
//           projectName={selectedSidebarTask.projectName}
//           onClose={() => setSelectedSidebarTask(null)}
//           onTaskComplete={handleTaskComplete}
//         />
//       )}

//       {toast && <Toast message={toast} onHide={() => setToast("")} />}
//     </>
//   );
// };

// export default DeveloperDashboard;











import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import axios from "axios";
import { differenceInCalendarDays, format } from "date-fns";

const ProjectKanban = React.lazy(() => import("../Admin Pages/Components/Projectkanban"));

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// Priority weights map for strict ordering
const PRIORITY_ORDER = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

// ── Design Tokens (Professional Soft UI / Neumorphism) ────────────────────────
const T = {
  // Neumorphic Base
  neuBase: "#F0F4F8",
  neuLight: "#FFFFFF",
  neuDark: "#D1DCEB",

  // Core surfaces - unified for Neumorphism
  bg: "#F0F4F8",
  bgCard: "#F0F4F8",
  bgElevated: "#F0F4F8",
  bgInput: "#F0F4F8",
  bgHover: "#E6ECF3",

  // Brand accent — vibrant indigo
  accent: "#4F6EF7",
  accentDim: "rgba(79, 110, 247, 0.08)",
  accentHover: "#3B52C7",
  accentText: "#4F6EF7",

  // Semantic colors
  green: "#1A7F37",
  greenDim: "rgba(26, 127, 55, 0.08)",
  greenText: "#1A7F37",
  red: "#D1242F",
  redDim: "rgba(209, 36, 47, 0.08)",
  orange: "#BF8700",
  orangeDim: "rgba(191, 135, 0, 0.08)",
  blue: "#0969DA",
  blueDim: "rgba(9, 105, 218, 0.08)",

  // Typography
  textPrimary: "#1F2328",
  textSecondary: "#656D76",
  textMuted: "#8C959F",
  textDisabled: "#A3B1C6",

  // Utility (Preserving exact original border radiuses)
  font: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
  radius: "10px",
  radiusSm: "6px",
  radiusXs: "4px",
};

const PRIORITY_CFG = {
  Critical: { color: T.red, bg: T.redDim, dot: "●", ring: "#D1242F" },
  High: { color: T.orange, bg: T.orangeDim, dot: "▲", ring: "#BF8700" },
  Medium: { color: T.accentText, bg: T.accentDim, dot: "◆", ring: "#4F6EF7" },
  Low: { color: T.greenText, bg: T.greenDim, dot: "▼", ring: "#1A7F37" },
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Urgency helpers ───────────────────────────────────────────────────────────
const getUrgency = (deadline) => {
  if (!deadline) return null;
  const diff = differenceInCalendarDays(new Date(deadline), new Date());
  if (diff < 0) return "overdue";
  if (diff <= 1) return "critical";
  if (diff <= 3) return "high";
  if (diff <= 6) return "medium";
  if (diff <= 10) return "low";
  return null;
};

const URGENCY_STYLES = {
  overdue: {
    borderLeft: `3px solid ${T.red}`,
    labelColor: T.red,
    labelBg: T.redDim,
    label: "Overdue",
  },
  critical: {
    borderLeft: `3px solid ${T.red}`,
    labelColor: T.red,
    labelBg: T.redDim,
    label: "Due today",
  },
  high: {
    borderLeft: `3px solid ${T.orange}`,
    labelColor: T.orange,
    labelBg: T.orangeDim,
    label: "Due soon",
  },
  medium: {
    borderLeft: `3px solid ${T.accent}`,
    labelColor: T.accentText,
    labelBg: T.accentDim,
    label: "Upcoming",
  },
  low: {
    borderLeft: `3px solid transparent`,
    labelColor: T.textMuted,
    labelBg: "transparent",
    label: "",
  },
};

// ── Atom: Badge ───────────────────────────────────────────────────────────────
const Badge = ({ children, color = T.textMuted }) => (
  <span className="neu-pressed-sm" style={{
    display: "inline-flex", alignItems: "center",
    padding: "3px 8px", borderRadius: "20px",
    fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.02em",
    color, whiteSpace: "nowrap", lineHeight: "1.6",
  }}>{children}</span>
);

const ServiceTag = ({ label }) => (
  <Badge color={T.accentText}>{label}</Badge>
);

const SubTag = ({ label }) => (
  <Badge color={T.textSecondary}>{label}</Badge>
);

// ── Atom: StatusDot ───────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const isActive = status === "Active";
  return (
    <span className="neu-pressed-sm" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: "20px",
      fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em",
      color: isActive ? T.greenText : T.textMuted,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: isActive ? T.green : T.textMuted,
        boxShadow: isActive ? `0 0 4px ${T.green}` : "none",
      }} />
      {status}
    </span>
  );
};

// ── Atom: DeadlineLabel ───────────────────────────────────────────────────────
const DeadlineLabel = ({ deadline }) => {
  if (!deadline) return null;
  const diff = differenceInCalendarDays(new Date(deadline), new Date());
  const overdue = diff < 0;
  const critical = !overdue && diff <= 1;
  const soon = !overdue && !critical && diff <= 3;
  return (
    <span style={{
      fontSize: "0.7rem", fontWeight: 600,
      color: overdue ? T.red : critical ? T.orange : soon ? T.orange : T.textSecondary,
      fontFamily: T.fontMono,
    }}>
      {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : diff === 1 ? "Due tomorrow" : `${diff}d left`}
    </span>
  );
};

// ── Atom: Spinner ─────────────────────────────────────────────────────────────
const Spinner = ({ size = 10, color = "currentColor" }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    border: `1.5px solid ${color}`, borderRightColor: "transparent",
    borderRadius: "50%", animation: "spin 0.65s linear infinite", flexShrink: 0,
  }} />
);

// ── Atom: Icon Button ─────────────────────────────────────────────────────────
const IconBtn = ({ onClick, disabled, children, variant = "ghost", style = {} }) => {
  const variants = {
    ghost: { color: T.textSecondary },
    accent: { color: T.accentText },
    success: { color: T.greenText },
    danger: { color: T.red },
  };
  const v = variants[variant] || variants.ghost;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="neu-flat-sm neu-action-btn"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
        padding: "6px 12px", borderRadius: T.radiusSm,
        color: v.color,
        fontSize: "0.7rem", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: "all 0.12s", whiteSpace: "nowrap",
        fontFamily: T.font,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ── Comment Modal ─────────────────────────────────────────────────────────────
const CommentModal = ({ task, projectId, onClose }) => {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await axios.post(
        `${API_BASE}/api/tasks/${projectId}/${task._id}/comments`,
        { text: text.trim() },
        { headers: authHeaders() }
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
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} className="neu-flat" style={{
        borderRadius: T.radius, padding: "24px", width: 380, fontFamily: T.font,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Add Comment</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary, lineHeight: 1.4, maxWidth: 280 }}>{task.title}</div>
          </div>
          <button onClick={onClose} className="neu-flat-sm neu-action-btn" style={{
            cursor: "pointer", fontSize: "1.1rem", color: T.textMuted, 
            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%"
          }}>&times;</button>
        </div>
        {posted ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: T.greenText, fontWeight: 700, fontSize: "0.85rem" }}>
            ✓ Comment posted
          </div>
        ) : (
          <>
            <textarea
              autoFocus value={text} onChange={e => setText(e.target.value)}
              placeholder="Add your comment..." rows={4}
              className="neu-pressed"
              style={{
                width: "100%", resize: "none",
                borderRadius: T.radiusSm, color: T.textPrimary,
                fontSize: "0.82rem", padding: "12px 14px",
                outline: "none", fontFamily: T.font, lineHeight: 1.6,
                boxSizing: "border-box", background: "transparent"
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <IconBtn onClick={onClose} disabled={posting}>Cancel</IconBtn>
              <button onClick={submit} disabled={!text.trim() || posting} className="neu-btn-primary" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 18px", borderRadius: T.radiusSm,
                fontSize: "0.78rem", fontWeight: 600,
                cursor: text.trim() && !posting ? "pointer" : "not-allowed",
                opacity: text.trim() ? 1 : 0.5, transition: "all 0.12s",
              }}>
                {posting && <Spinner size={10} color="#FFF" />}
                {posting ? "Posting…" : "Post comment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Global Add Task Modal ─────────────────────────────────────────────────────
const GlobalAddTaskModal = ({ projects, initialProjectId, currentUserId, currentUsername, onClose, onSuccess }) => {
  const currentUserRole = localStorage.getItem("role") || "developer";
  const isAdmin = currentUserRole === "admin";

  const activeProjects = useMemo(() => {
    const list = projects.filter(p => p.status !== "Closed");
    const lastProjectId = localStorage.getItem("last_added_project_id");

    return list.sort((a, b) => {
      const isALast = a._id === lastProjectId;
      const isBLast = b._id === lastProjectId;
      if (isALast && !isBLast) return -1;
      if (!isALast && isBLast) return 1;
      return (a.projectName || "").localeCompare(b.projectName || "", undefined, { sensitivity: "base" });
    });
  }, [projects]);

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || activeProjects[0]?._id || "");
  const project = useMemo(() => activeProjects.find(p => p._id === selectedProjectId), [activeProjects, selectedProjectId]);
  const isCreator = isAdmin || project?.createdBy === currentUsername;

  const developers = useMemo(() => {
    if (!project) return [];
    const devs = (project?.assignedDeveloper || []).map(d => ({ id: d.id, username: d.username }));
    const inList = devs.some(d => d.id === currentUserId);
    if (!inList && (isCreator || isAdmin)) devs.unshift({ id: currentUserId, username: currentUsername });
    return devs;
  }, [project, currentUserId, currentUsername, isCreator, isAdmin]);

  const [form, setForm] = useState({
    title: "", description: "", priority: "Medium", deadline: "",
    assignedTo: { id: currentUserId, username: currentUsername }, links: [],
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(p => ({ ...p, assignedTo: { id: currentUserId, username: currentUsername } }));
  }, [selectedProjectId, currentUserId, currentUsername]);

  if (activeProjects.length === 0) {
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
        <div className="neu-flat" onClick={e => e.stopPropagation()} style={{ padding: 32, borderRadius: T.radius, textAlign: "center", fontFamily: T.font }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🚫</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>No active projects</div>
          <div style={{ fontSize: "0.82rem", color: T.textSecondary, marginBottom: 20 }}>There are no active projects to add tasks to.</div>
          <IconBtn onClick={onClose}>Close</IconBtn>
        </div>
      </div>
    );
  }

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.deadline) e.deadline = "Deadline is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/tasks/${selectedProjectId}`,
        { ...form, deadline: form.deadline || null },
        { headers: authHeaders() }
      );
      const newTask = res.data?.task || res.data;
      onSuccess?.(newTask, selectedProjectId);
      localStorage.setItem("last_added_project_id", selectedProjectId);
      onClose();
    } catch (err) {
      console.error("Add task error:", err);
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = (hasError) => ({
    width: "100%", padding: "10px 14px", borderRadius: T.radiusSm,
    background: "transparent", color: T.textPrimary,
    fontSize: "0.82rem", fontFamily: T.font, outline: "none",
    boxSizing: "border-box", border: hasError ? `1px solid ${T.red}` : "none",
  });

  const labelStyle = {
    display: "block", fontSize: "0.65rem", fontWeight: 700, color: T.textMuted,
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, paddingLeft: 4
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div className="neu-flat" onClick={e => e.stopPropagation()} style={{
        borderRadius: T.radius, width: 460, maxHeight: "88vh",
        display: "flex", flexDirection: "column", fontFamily: T.font,
      }}>
        {/* Modal Header */}
        <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>New Task</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>Create task</div>
          </div>
          <button onClick={onClose} className="neu-flat-sm neu-action-btn" style={{ cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: T.textSecondary, borderRadius: "50%" }}>&times;</button>
        </div>

        <div style={{ padding: "0 24px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Project</label>
            <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="neu-pressed" style={{...fieldStyle(false), paddingRight: 30}} disabled={saving}>
              {activeProjects.map(p => (
                <option key={p._id} value={p._id} style={{background: T.neuBase}}>
                  {p.projectName} {p._id === localStorage.getItem("last_added_project_id") ? " (last used)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Task title <span style={{ color: T.red }}>*</span></label>
            <input
              value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="What needs to be done?"
              className="neu-pressed"
              style={fieldStyle(!!errors.title)}
              disabled={saving}
            />
            {errors.title && <div style={{ fontSize: "0.7rem", color: T.red, marginTop: 6, paddingLeft: 4 }}>{errors.title}</div>}
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Add context or notes..." rows={3}
              className="neu-pressed"
              style={{ ...fieldStyle(false), resize: "none" }}
              disabled={saving}
            />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} className="neu-pressed" style={fieldStyle(false)} disabled={saving}>
                {["Low", "Medium", "High", "Critical"].map(p => <option key={p} value={p} style={{background: T.neuBase}}>{p}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Deadline <span style={{ color: T.red }}>*</span></label>
              <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)}
                className="neu-pressed"
                style={{ ...fieldStyle(!!errors.deadline), colorScheme: "light" }}
                disabled={saving}
              />
              {errors.deadline && <div style={{ fontSize: "0.7rem", color: T.red, marginTop: 6, paddingLeft: 4 }}>{errors.deadline}</div>}
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <IconBtn onClick={onClose} disabled={saving}>Cancel</IconBtn>
          <button onClick={handleSubmit} disabled={saving} className="neu-btn-primary" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "10px 24px", borderRadius: T.radiusSm,
            fontSize: "0.82rem", fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1,
            transition: "all 0.12s",
          }}>
            {saving && <Spinner size={10} color="#FFF" />}
            {saving ? "Creating…" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Task Detail Modal ─────────────────────────────────────────────────────────
const SidebarTaskDetailModal = ({ task, projectId, projectName, onClose, onTaskComplete }) => {
  const cfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await axios.post(`${API_BASE}/api/tasks/${projectId}/${task._id}/complete`, {}, { headers: authHeaders() });
      onTaskComplete(task._id, projectId);
      onClose();
    } catch (err) {
      console.error("Complete error:", err);
      setCompleting(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} className="neu-flat" style={{
        borderRadius: T.radius, width: 480, maxHeight: "88vh",
        display: "flex", flexDirection: "column", fontFamily: T.font,
      }}>
        {/* Colored priority stripe */}
        <div style={{ height: 4, background: cfg.ring, borderRadius: "10px 10px 0 0" }} />

        <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span className="neu-pressed-sm" style={{
                padding: "3px 10px", borderRadius: T.radiusSm, color: cfg.color,
                fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em",
              }}>
                {cfg.dot} {task.priority}
              </span>
              {task.deadline && (
                <span className="neu-pressed-sm" style={{
                  padding: "3px 10px", borderRadius: T.radiusSm, color: T.textSecondary,
                  fontSize: "0.68rem",
                }}>
                  <DeadlineLabel deadline={task.deadline} />
                </span>
              )}
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: T.textPrimary, lineHeight: 1.4 }}>{task.title}</div>
            <div style={{ fontSize: "0.75rem", color: T.textMuted, marginTop: 6, fontWeight: 500 }}>
              {projectName}
            </div>
          </div>
          <button onClick={onClose} className="neu-flat-sm neu-action-btn" style={{ cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: T.textSecondary, borderRadius: "50%" }}>&times;</button>
        </div>

        <div style={{ padding: "0 24px 24px", overflowY: "auto", flex: 1 }}>
          {task.description ? (
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, paddingLeft: 4 }}>Description</div>
              <div className="neu-pressed" style={{
                fontSize: "0.85rem", color: T.textSecondary, lineHeight: 1.7,
                padding: "16px", borderRadius: T.radiusSm,
              }}>
                {task.description}
              </div>
            </div>
          ) : (
            <div className="neu-pressed" style={{ textAlign: "center", padding: "24px 0", color: T.textMuted, fontSize: "0.82rem", borderRadius: T.radiusSm }}>
              No description provided.
            </div>
          )}
        </div>

        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <IconBtn onClick={onClose} disabled={completing}>Close</IconBtn>
          <button onClick={handleComplete} disabled={completing} className="neu-flat-sm neu-action-btn" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "10px 24px", borderRadius: T.radiusSm,
            color: completing ? T.textDisabled : T.greenText,
            fontSize: "0.82rem", fontWeight: 700,
            cursor: completing ? "not-allowed" : "pointer",
            transition: "all 0.12s",
          }}>
            {completing && <Spinner size={12} color={T.greenText} />}
            {completing ? "Marking done…" : "✓ Mark as done"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── TaskCard ──────────────────────────────────────────────────────────────────
const TaskCard = ({ task, projectId, projectName, onTaskComplete, onTaskClick, onOpenKanban, openingKanbanId }) => {
  const cfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
  const urgency = getUrgency(task.deadline);
  const ustyle = urgency ? URGENCY_STYLES[urgency] : null;
  const [completing, setCompleting] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  const handleComplete = async (e) => {
    e.stopPropagation();
    setCompleting(true);
    try {
      await axios.post(`${API_BASE}/api/tasks/${projectId}/${task._id}/complete`, {}, { headers: authHeaders() });
      onTaskComplete(task._id, projectId);
    } catch (err) {
      console.error(err);
      setCompleting(false);
    }
  };

  const isKanbanLoading = openingKanbanId === projectId;

  return (
    <>
      <div
        className="neu-flat neu-action-btn"
        onClick={() => onTaskClick(task, projectId, projectName)}
        style={{
          padding: "14px",
          borderRadius: T.radiusSm,
          cursor: "pointer",
          border: "none",
          borderLeft: ustyle?.borderLeft || `3px solid transparent`,
          marginBottom: 12,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {/* Priority indicator */}
          <div style={{ paddingTop: 2, flexShrink: 0 }}>
            <span style={{ fontSize: "0.6rem", color: cfg.color }}>{cfg.dot}</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title */}
            <div style={{
              fontSize: "0.85rem", fontWeight: 700, color: T.textPrimary,
              marginBottom: 4, lineHeight: 1.4,
              whiteSpace: "normal", wordBreak: "break-word",
            }}>
              {task.title}
            </div>

            {/* Project name */}
            <div style={{
              fontSize: "0.7rem", color: T.textMuted, marginBottom: 10,
              whiteSpace: "normal", wordBreak: "break-word", fontWeight: 500
            }}>
              {projectName}
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {task.deadline && (
                <span className="neu-pressed-sm" style={{ padding: "3px 8px", borderRadius: T.radiusXs }}>
                  <DeadlineLabel deadline={task.deadline} />
                </span>
              )}
              {urgency && urgency !== "low" && ustyle.label && (
                <span className="neu-pressed-sm" style={{
                  fontSize: "0.58rem", fontWeight: 700, padding: "3px 8px",
                  borderRadius: T.radiusXs, color: ustyle.labelColor, textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {urgency === "overdue" ? "OVERDUE" : "URGENT"}
                </span>
              )}
            </div>

            {/* Actions row */}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <IconBtn onClick={handleComplete} disabled={completing} variant="success">
                {completing && <Spinner size={8} color={T.greenText} />}
                ✓ Done
              </IconBtn>
              <IconBtn onClick={e => { e.stopPropagation(); setCommentOpen(true); }} disabled={completing}>
                Comment
              </IconBtn>
              <IconBtn
                onClick={e => { e.stopPropagation(); onOpenKanban(projectId); }}
                disabled={isKanbanLoading || completing}
                variant="accent"
                style={{ marginLeft: "auto" }}
              >
                {isKanbanLoading && <Spinner size={8} color={T.accentText} />}
                Board ↗
              </IconBtn>
            </div>
          </div>
        </div>
      </div>

      {commentOpen && (
        <CommentModal task={task} projectId={projectId} onClose={() => setCommentOpen(false)} />
      )}
    </>
  );
};

// ── ProjectCard ───────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onAddTaskTrigger, onOpenKanban, openingKanbanId }) => {
  const closed = project.status === "Closed";
  const [expanded, setExpanded] = useState(false);
  const isKanbanLoading = openingKanbanId === project._id;

  return (
    <div className="neu-flat" style={{
      borderRadius: T.radius,
      marginBottom: 16,
      overflow: "hidden",
      opacity: closed ? 0.65 : 1,
    }}>
      {/* Row header */}
      <div
        className={expanded ? "neu-pressed" : ""}
        style={{
          padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
          cursor: "pointer", transition: "all 0.15s",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Folder icon */}
        <div className="neu-pressed" style={{
          width: 38, height: 38, borderRadius: T.radiusSm,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem", flexShrink: 0,
        }}>
          {closed ? "🔒" : "📁"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{
              fontSize: "0.95rem", fontWeight: 700,
              color: closed ? T.textSecondary : T.textPrimary,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: "280px",
            }}>
              {project.projectName}
            </span>
            <StatusPill status={project.status} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(project.serviceType || []).map((s, i) => <ServiceTag key={i} label={s} />)}
            {project.subscriptionType && <SubTag label={project.subscriptionType} />}
          </div>
        </div>

        <span style={{
          color: T.textMuted, fontSize: "0.7rem", fontWeight: 800,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.15s",
        }}>▼</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="neu-pressed" style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>Business niche</div>
              <div className="neu-flat-sm" style={{ fontSize: "0.82rem", color: T.textSecondary, padding: "8px 12px", borderRadius: T.radiusSm }}>{project.businessNiche || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>Reference site</div>
              <div className="neu-flat-sm" style={{ padding: "8px 12px", borderRadius: T.radiusSm, overflow: "hidden", textOverflow: "ellipsis" }}>
                {project.referenceSite ? (
                  <a href={project.referenceSite} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.82rem", color: T.accentText, textDecoration: "none", fontFamily: T.fontMono }}>
                    {project.referenceSite.replace(/^https?:\/\//, "")}
                  </a>
                ) : <span style={{ fontSize: "0.82rem", color: T.textMuted }}>None</span>}
              </div>
            </div>
          </div>

          {project.projectDetails && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>Project details</div>
              <p className="neu-flat-sm" style={{
                fontSize: "0.82rem", color: T.textSecondary, margin: 0, lineHeight: 1.65,
                padding: "12px 16px", borderRadius: T.radiusSm,
              }}>
                {project.projectDetails}
              </p>
            </div>
          )}

          {!closed && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <IconBtn
                onClick={e => { e.stopPropagation(); onOpenKanban(project._id); }}
                disabled={isKanbanLoading}
              >
                {isKanbanLoading && <Spinner size={8} />}
                Open board
              </IconBtn>
              <IconBtn
                onClick={e => { e.stopPropagation(); onAddTaskTrigger(project._id); }}
                variant="accent"
                disabled={isKanbanLoading}
              >
                + Add task
              </IconBtn>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── FilterSelect ──────────────────────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 130 }}>
    <label style={{ fontSize: "0.6rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 4 }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="neu-pressed" style={{
      borderRadius: T.radiusSm, color: value ? T.textPrimary : T.textSecondary,
      fontSize: "0.78rem", padding: "8px 12px", outline: "none", fontFamily: T.font, border: "none"
    }}>
      <option value="" style={{background: T.neuBase}}>All</option>
      {options.map(o => <option key={o} value={o} style={{background: T.neuBase}}>{o}</option>)}
    </select>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, onHide }) => {
  useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t); }, [onHide]);
  return (
    <div className="neu-flat" style={{
      position: "fixed", bottom: 30, right: 30, zIndex: 99999,
      color: T.greenText, borderRadius: T.radius, padding: "12px 20px",
      fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 10,
      fontFamily: T.font,
    }}>
      <span className="neu-pressed-sm" style={{
        width: 22, height: 22, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.7rem", color: T.greenText,
      }}>✓</span>
      {message}
    </div>
  );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="neu-flat" style={{
    padding: "16px", borderRadius: T.radiusSm, marginBottom: 12,
  }}>
    <div style={{ display: "flex", gap: 12 }}>
      <div className="neu-pressed" style={{ width: 10, height: 10, borderRadius: "50%", marginTop: 4 }} />
      <div style={{ flex: 1 }}>
        <div className="neu-pressed" style={{ height: 12, borderRadius: T.radiusXs, width: "72%", marginBottom: 8 }} />
        <div className="neu-pressed" style={{ height: 10, borderRadius: T.radiusXs, width: "42%", marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <div className="neu-pressed" style={{ height: 22, width: 50, borderRadius: T.radiusSm }} />
          <div className="neu-pressed" style={{ height: 22, width: 64, borderRadius: T.radiusSm }} />
        </div>
      </div>
    </div>
  </div>
);

// ── Tab Button ────────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button className={active ? "neu-pressed" : "neu-flat-sm neu-action-btn"} onClick={onClick} style={{
    padding: "8px 16px", borderRadius: T.radiusSm, border: "none",
    color: active ? T.accentText : T.textSecondary,
    fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
    transition: "all 0.12s", fontFamily: T.font,
  }}>
    {children}
  </button>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const DeveloperDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [completions, setCompletions] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [kanbanProject, setKanbanProject] = useState(null);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const [openingKanbanId, setOpeningKanbanId] = useState(null);

  const [activeTab, setActiveTab] = useState("projects");

  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddInitialProject, setQuickAddInitialProject] = useState("");
  const [selectedSidebarTask, setSelectedSidebarTask] = useState(null);
  const [toast, setToast] = useState("");

  const [search, setSearch] = useState("");
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "Developer";

  const CACHE_KEYS = useMemo(() => ({
    projects: `dev_cache_projects_${currentUserId}`,
    tasks: `dev_cache_tasks_${currentUserId}`,
    completions: `dev_cache_completions_${currentUserId}`,
  }), [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    try {
      const cp = sessionStorage.getItem(CACHE_KEYS.projects);
      const ct = sessionStorage.getItem(CACHE_KEYS.tasks);
      const cc = sessionStorage.getItem(CACHE_KEYS.completions);
      if (cp) setProjects(JSON.parse(cp));
      if (ct) setTasks(JSON.parse(ct));
      if (cc) setCompletions(JSON.parse(cc));
      if (cp && ct && cc) setLoadingInitial(false);
    } catch (e) {
      console.warn("Cache parse error:", e);
    }
  }, [CACHE_KEYS, currentUserId]);

  const loadInitialData = useCallback(async (isSilent = false) => {
    const hasCache = sessionStorage.getItem(CACHE_KEYS.projects);
    if (!isSilent && !hasCache) setLoadingInitial(true);

    try {
      const r = await axios.get(`${API_BASE}/api/newproject/projects`, { headers: authHeaders() });
      const all = Array.isArray(r.data) ? r.data : [];
      const mine = all.filter(p =>
        (p.assignedDeveloper || []).some(d => d.id && currentUserId && d.id.toString() === currentUserId.toString())
      );

      const tasksResult = {};
      const completedList = [];

      await Promise.allSettled(mine.map(async (p) => {
        try {
          const tr = await axios.get(`${API_BASE}/api/tasks/${p._id}`, { headers: authHeaders() });
          tasksResult[p._id] = (tr.data || []).filter(
            t => t.status !== "Done" && t.assignedTo?.id?.toString() === currentUserId?.toString()
          );
        } catch { tasksResult[p._id] = []; }

        try {
          const cr = await axios.get(`${API_BASE}/api/tasks/${p._id}/completions`, { headers: authHeaders() });
          const list = Array.isArray(cr.data) ? cr.data : [];
          list.forEach(item => {
            const mine =
              item.completedBy?.id?.toString() === currentUserId?.toString() ||
              item.completedBy?._id?.toString() === currentUserId?.toString() ||
              item.completedBy?.username === currentUsername;
            if (mine) completedList.push({ ...item, projectName: p.projectName, projectId: p._id });
          });
        } catch (e) { console.error("Completions fetch failed:", p.projectName); }
      }));

      completedList.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));

      setTasks(tasksResult);
      setCompletions(completedList);
      setProjects(mine);

      sessionStorage.setItem(CACHE_KEYS.projects, JSON.stringify(mine));
      sessionStorage.setItem(CACHE_KEYS.tasks, JSON.stringify(tasksResult));
      sessionStorage.setItem(CACHE_KEYS.completions, JSON.stringify(completedList));
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoadingInitial(false);
    }
  }, [currentUserId, CACHE_KEYS, currentUsername]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const handleTaskComplete = useCallback((taskId, projectId) => {
    setTasks(prev => {
      const updated = { ...prev, [projectId]: (prev[projectId] || []).filter(t => t._id !== taskId) };
      sessionStorage.setItem(CACHE_KEYS.tasks, JSON.stringify(updated));
      return updated;
    });
    setToast("Task marked as done");
    loadInitialData(true);
  }, [loadInitialData, CACHE_KEYS]);

  const handleQuickAddSuccess = useCallback((newTask, projectId) => {
    setToast("Task created");
    setTasks(prev => {
      const updated = { ...prev, [projectId]: [...(prev[projectId] || []), newTask] };
      sessionStorage.setItem(CACHE_KEYS.tasks, JSON.stringify(updated));
      return updated;
    });
    loadInitialData(true);
  }, [loadInitialData, CACHE_KEYS]);

  const handleOpenKanban = useCallback((pId) => {
    setOpeningKanbanId(pId);
    const target = projects.find(p => p._id === pId);
    setTimeout(() => {
      if (target) { setKanbanProject(target); setKanbanOpen(true); }
      setOpeningKanbanId(null);
    }, 450);
  }, [projects]);

  const allPendingTasks = useMemo(() => {
    const list = [];
    projects.forEach(p => {
      (tasks[p._id] || []).forEach(t => list.push({ ...t, projectId: p._id, projectName: p.projectName }));
    });
    return list.sort((a, b) => {
      const orderA = PRIORITY_ORDER[a.priority] || 99;
      const orderB = PRIORITY_ORDER[b.priority] || 99;
      if (orderA !== orderB) return orderA - orderB;
      const aD = a.deadline ? differenceInCalendarDays(new Date(a.deadline), new Date()) : 999;
      const bD = b.deadline ? differenceInCalendarDays(new Date(b.deadline), new Date()) : 999;
      return aD - bD;
    });
  }, [projects, tasks]);

  const groupedCompletedTasks = useMemo(() => {
    const groups = { Today: [], Yesterday: [], "This week": [], Older: [] };
    completions.forEach(c => {
      if (!c.completedAt) { groups.Older.push(c); return; }
      const diff = differenceInCalendarDays(new Date(), new Date(c.completedAt));
      if (diff === 0) groups.Today.push(c);
      else if (diff === 1) groups.Yesterday.push(c);
      else if (diff <= 7) groups["This week"].push(c);
      else groups.Older.push(c);
    });
    return groups;
  }, [completions]);

  const filteredProjects = useMemo(() => {
    const list = projects.filter(p => {
      const s = search.toLowerCase();
      return (
        (!search || p.projectName?.toLowerCase().includes(s) || p.clientName?.toLowerCase().includes(s)) &&
        (!filterCreatedBy || p.createdBy === filterCreatedBy) &&
        (!filterSub || p.subscriptionType === filterSub) &&
        (!filterService || (p.serviceType || []).includes(filterService)) &&
        (!filterStatus || p.status === filterStatus)
      );
    });
    return list.sort((a, b) => (a.projectName || "").localeCompare(b.projectName || "", undefined, { sensitivity: "base" }));
  }, [projects, search, filterCreatedBy, filterSub, filterService, filterStatus]);

  const createdByOptions = [...new Set(projects.map(p => p.createdBy).filter(Boolean))];
  const subOptions = [...new Set(projects.map(p => p.subscriptionType).filter(Boolean))];
  const serviceOptions = [...new Set(projects.flatMap(p => p.serviceType || []))];

  const overdueCount = allPendingTasks.filter(t => getUrgency(t.deadline) === "overdue").length;
  const urgentCount = allPendingTasks.filter(t => ["critical", "high"].includes(getUrgency(t.deadline))).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        /* Neumorphism Core CSS */
        :root {
          --neu-bg: #F0F4F8;
          --neu-light: #FFFFFF;
          --neu-dark: #D1DCEB;
        }

        .neu-base {
          background-color: var(--neu-bg);
        }

        .neu-flat {
          background-color: var(--neu-bg);
          box-shadow: 5px 5px 10px var(--neu-dark), -5px -5px 10px var(--neu-light);
          border: none;
        }

        .neu-flat-sm {
          background-color: var(--neu-bg);
          box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light);
          border: none;
        }

        .neu-pressed {
          background-color: var(--neu-bg);
          box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
          border: none;
        }

        .neu-pressed-sm {
          background-color: var(--neu-bg);
          box-shadow: inset 1.5px 1.5px 3px var(--neu-dark), inset -1.5px -1.5px 3px var(--neu-light);
          border: none;
        }

        .neu-btn-primary {
          background-color: #4F6EF7;
          box-shadow: 3px 3px 8px rgba(79, 110, 247, 0.35);
          border: none;
          color: #FFF;
        }

        .neu-btn-primary:active {
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
        }

        .neu-action-btn:active {
          box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes pulse-skeleton {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .skeleton-pulse { animation: pulse-skeleton 1.6s ease-in-out infinite; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeSlideIn 0.18s ease; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--neu-dark); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #A3B1C6; }

        input[type="date"]::-webkit-calendar-picker-indicator { filter: none; opacity: 0.6; }
      `}</style>

      <div className="neu-base" style={{
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 60px)",
        fontFamily: T.font, color: T.textPrimary, overflow: "hidden",
      }}>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── LEFT: Main Workspace ── */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            overflow: "hidden", minWidth: 0, paddingRight: 0
          }}>

            {/* Top Bar */}
            <div className="neu-flat" style={{
              padding: "0 24px", margin: "0 0 16px 0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0, height: 60, zIndex: 10
            }}>
              <div style={{ display: "flex", gap: 12 }}>
                <TabBtn active={activeTab === "projects"} onClick={() => setActiveTab("projects")}>
                  Projects <span className="neu-pressed-sm" style={{
                    marginLeft: 6, padding: "2px 8px", borderRadius: "10px",
                    color: T.textSecondary, fontSize: "0.65rem", fontWeight: 700,
                  }}>{filteredProjects.length}</span>
                </TabBtn>
                <TabBtn active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>
                  History <span className="neu-pressed-sm" style={{
                    marginLeft: 6, padding: "2px 8px", borderRadius: "10px",
                    color: T.textSecondary, fontSize: "0.65rem", fontWeight: 700,
                  }}>{completions.length}</span>
                </TabBtn>
              </div>

              <button
                className="neu-btn-primary"
                onClick={() => { setQuickAddInitialProject(""); setQuickAddModalOpen(true); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px", borderRadius: T.radiusSm,
                  fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                <span style={{ fontSize: ".9rem" }}>+</span> New task
              </button>
            </div>

            {/* Content area */}
            {loadingInitial ? (
              <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="neu-flat" style={{ padding: "16px 24px", borderRadius: T.radius, display: "flex", alignItems: "center", gap: 10, color: T.textMuted, fontSize: "0.85rem", fontWeight: 600 }}>
                  <Spinner size={16} color={T.accent} />
                  Loading workspace…
                </div>
              </div>
            ) : activeTab === "projects" ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Filter bar */}
                <div style={{
                  padding: "0 24px 16px",
                  display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 180 }}>
                    <label style={{ fontSize: "0.6rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 4 }}>Search</label>
                    <input
                      className="neu-pressed"
                      value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Project name or client…"
                      style={{
                        borderRadius: T.radiusSm,
                        color: T.textPrimary, fontSize: "0.78rem", padding: "8px 14px", outline: "none",
                        fontFamily: T.font, background: "transparent"
                      }}
                    />
                  </div>
                  <FilterSelect label="Created by" value={filterCreatedBy} onChange={setFilterCreatedBy} options={createdByOptions} />
                  <FilterSelect label="Subscription" value={filterSub} onChange={setFilterSub} options={subOptions} />
                  <FilterSelect label="Service" value={filterService} onChange={setFilterService} options={serviceOptions} />
                  <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={["Active", "Closed"]} />
                  {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
                    <button
                      className="neu-flat-sm neu-action-btn"
                      onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }}
                      style={{
                        alignSelf: "flex-end", padding: "8px 14px", borderRadius: T.radiusSm,
                        color: T.textMuted, fontWeight: 700,
                        fontSize: "0.72rem", cursor: "pointer", fontFamily: T.font,
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Projects list */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 24px" }} className="fade-in">
                  {filteredProjects.length === 0 ? (
                    <div style={{ textAlign: "center", paddingTop: 80, color: T.textMuted }}>
                      <div style={{ fontSize: "2rem", marginBottom: 12, opacity: 0.4 }}>📂</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>No projects match your filters.</div>
                      <div style={{ fontSize: "0.75rem", marginTop: 6, color: T.textDisabled }}>Try adjusting or clearing your search.</div>
                    </div>
                  ) : (
                    filteredProjects.map(p => (
                      <ProjectCard
                        key={p._id}
                        project={p}
                        onOpenKanban={handleOpenKanban}
                        openingKanbanId={openingKanbanId}
                        onAddTaskTrigger={(projId) => {
                          setQuickAddInitialProject(projId);
                          setQuickAddModalOpen(true);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

            ) : (
              /* ── Completed history ── */
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 24px" }} className="fade-in">
                {completions.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 80, color: T.textMuted }}>
                    <div className="neu-flat-sm" style={{ display: "inline-flex", width: 60, height: 60, borderRadius: "50%", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", marginBottom: 16, opacity: 0.6, color: T.greenText }}>✓</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>No completed tasks yet.</div>
                    <div style={{ fontSize: "0.75rem", marginTop: 6, color: T.textDisabled }}>Tasks you complete will appear here.</div>
                  </div>
                ) : (
                  Object.entries(groupedCompletedTasks).map(([groupName, items]) => {
                    if (items.length === 0) return null;
                    return (
                      <div key={groupName} style={{ marginBottom: 32 }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
                        }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            {groupName}
                          </span>
                          <span className="neu-pressed-sm" style={{ padding: "2px 8px", borderRadius: "10px", color: T.textMuted, fontSize: "0.65rem", fontWeight: 700 }}>
                            {items.length}
                          </span>
                          <div className="neu-pressed-sm" style={{ flex: 1, height: "2px", opacity: 0.5 }} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {items.map((item, idx) => (
                            <div key={idx} className="neu-flat" style={{
                              display: "flex", alignItems: "center", gap: 16,
                              padding: "16px 20px", borderRadius: T.radiusSm,
                            }}>
                              <span className="neu-pressed" style={{
                                width: 28, height: 28, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.75rem", color: T.greenText, flexShrink: 0,
                              }}>✓</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>{item.taskTitle}</div>
                                <div style={{ fontSize: "0.75rem", color: T.textMuted, fontWeight: 500 }}>{item.projectName}</div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: "0.7rem", color: T.textMuted, fontWeight: 600 }}>by {item.completedBy?.username}</div>
                                {item.completedAt && (
                                  <div className="neu-pressed-sm" style={{ padding: "4px 8px", borderRadius: T.radiusXs, fontSize: "0.65rem", color: T.textSecondary, marginTop: 6, fontFamily: T.fontMono, display: "inline-block" }}>
                                    {format(new Date(item.completedAt), "MMM d · h:mm a")}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Task Sidebar ── */}
          <div style={{
            width: 390, minWidth: 390, maxWidth: 390,
            display: "flex", flexDirection: "column",
            overflow: "hidden", padding: "0 0px 0px 0px",
          }}>
            <div className="neu-flat" style={{
              display: "flex", flexDirection: "column", flex: 1,
              borderRadius: T.radius, overflow: "hidden"
            }}>
              {/* Sidebar header */}
              <div style={{
                padding: "20px", flexShrink: 0,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>My tasks</div>
                    <div style={{ fontSize: "0.75rem", color: T.textMuted, fontWeight: 600 }}>
                      {loadingInitial ? "Syncing…" : `${allPendingTasks.length} pending`}
                    </div>
                  </div>
                  {!loadingInitial && (overdueCount > 0 || urgentCount > 0) && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {overdueCount > 0 && (
                        <span className="neu-pressed-sm" style={{ padding: "3px 8px", borderRadius: "10px", color: T.red, fontSize: "0.65rem", fontWeight: 800 }}>
                          {overdueCount} overdue
                        </span>
                      )}
                      {urgentCount > 0 && (
                        <span className="neu-pressed-sm" style={{ padding: "3px 8px", borderRadius: "10px", color: T.orange, fontSize: "0.65rem", fontWeight: 800 }}>
                          {urgentCount} urgent
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar task list */}
              <div className="neu-pressed" style={{ flex: 1, overflowY: "auto", padding: "16px", margin: "0 16px 16px", borderRadius: T.radiusSm }}>
                {loadingInitial ? (
                  <div className="skeleton-pulse">
                    {[1, 2, 3].map(v => <SkeletonCard key={v} />)}
                  </div>
                ) : allPendingTasks.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 60, color: T.textMuted }}>
                    <div className="neu-flat-sm" style={{ display: "inline-flex", width: 60, height: 60, borderRadius: "50%", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", marginBottom: 16, opacity: 0.6 }}>✓</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>All caught up!</div>
                    <div style={{ fontSize: "0.75rem", marginTop: 6, color: T.textDisabled }}>No pending tasks.</div>
                  </div>
                ) : (
                  <div className="fade-in">
                    {allPendingTasks.map(t => (
                      <TaskCard
                        key={t._id}
                        task={t}
                        projectId={t.projectId}
                        projectName={t.projectName}
                        onTaskComplete={handleTaskComplete}
                        onOpenKanban={handleOpenKanban}
                        openingKanbanId={openingKanbanId}
                        onTaskClick={(task, pId, pName) => setSelectedSidebarTask({ task, projectId: pId, projectName: pName })}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Kanban overlay ── */}
      {kanbanProject && (
        <Suspense fallback={
          <div style={{
            position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)",
            zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}>
            <div className="neu-flat" style={{
              padding: "24px 32px", borderRadius: T.radius,
              fontFamily: T.font, display: "flex", alignItems: "center", gap: 14,
            }}>
              <Spinner size={16} color={T.accent} />
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textSecondary }}>Loading board…</span>
            </div>
          </div>
        }>
          <ProjectKanban
            open={kanbanOpen}
            onClose={() => {
              setKanbanOpen(false);
              setKanbanProject(null);
              loadInitialData(true);
            }}
            project={kanbanProject}
          />
        </Suspense>
      )}

      {/* ── Modals ── */}
      {quickAddModalOpen && (
        <GlobalAddTaskModal
          projects={projects}
          initialProjectId={quickAddInitialProject}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
          onClose={() => setQuickAddModalOpen(false)}
          onSuccess={handleQuickAddSuccess}
        />
      )}

      {selectedSidebarTask && (
        <SidebarTaskDetailModal
          task={selectedSidebarTask.task}
          projectId={selectedSidebarTask.projectId}
          projectName={selectedSidebarTask.projectName}
          onClose={() => setSelectedSidebarTask(null)}
          onTaskComplete={handleTaskComplete}
        />
      )}

      {toast && <Toast message={toast} onHide={() => setToast("")} />}
    </>
  );
};

export default DeveloperDashboard;