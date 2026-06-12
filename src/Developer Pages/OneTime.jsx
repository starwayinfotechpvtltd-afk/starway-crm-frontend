// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import axios from "axios";
// import { differenceInCalendarDays, format } from "date-fns";
// import ProjectKanban from "../Admin Pages/Components/Projectkanban";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// // ── Design tokens (Blue Theme) ─────────────────────────────────────────────────
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
//     bg: "linear-gradient(135deg, #FFF0F0 0%, #FFDCE0 100%)",
//     border: "#A40E26",
//     borderLeft: "4px solid #A40E26",
//     glow: "0 0 0 1px #A40E2640, 0 4px 16px rgba(164,14,38,0.2)",
//     labelColor: "#FFFFFF",
//     labelBg: "#A40E26",
//   },
//   critical: {
//     bg: "linear-gradient(135deg, #FFFDFD 0%, #FFEBE9 100%)",
//     border: "#D1242F",
//     borderLeft: "4px solid #D1242F",
//     glow: "0 0 0 1px #D1242F20, 0 2px 10px rgba(209,36,47,0.1)",
//     labelColor: "#D1242F",
//     labelBg: "#FFEBE9",
//   },
//   high: {
//     bg: "linear-gradient(135deg, #FFFBF0 0%, #FFF3D0 100%)",
//     border: "#BF8700",
//     borderLeft: "4px solid #BF8700",
//     glow: "0 0 0 1px #BF870030, 0 2px 8px rgba(191,135,0,0.12)",
//     labelColor: "#BF8700",
//     labelBg: "#FFF8C5",
//   },
//   medium: {
//     bg: "linear-gradient(135deg, #FAFBFF 0%, #F0F4FF 100%)",
//     border: "#0969DA",
//     borderLeft: "4px solid #0969DA40",
//     glow: "0 0 0 1px #0969DA20",
//     labelColor: "#0969DA",
//     labelBg: "#DDF4FF",
//   },
//   low: {
//     bg: "#FFFFFF",
//     border: T.border,
//     borderLeft: `4px solid ${T.border}`,
//     glow: T.shadow,
//     labelColor: T.textSecondary,
//     labelBg: T.grayBg,
//   },
// };

// // ── Tiny helpers ──────────────────────────────────────────────────────────────
// const avatar = (name = "?") => name.charAt(0).toUpperCase();
// const avatarColor = (s) => {
//   const palette = ["#0969DA", "#1A7F37", "#D1242F", "#8250DF", "#BF8700", "#0349B6"];
//   let h = 0;
//   for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
//   return palette[Math.abs(h) % palette.length];
// };

// const stopDragEvent = (e) => e.stopPropagation();
// const todayStr = () => format(new Date(), "yyyy-MM-dd");

// const ServiceTag = ({ label, closed }) => (
//   <span style={{
//     display: "inline-block", padding: "2px 8px", borderRadius: "20px",
//     fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.03em",
//     background: closed ? T.grayBg : T.accentDim,
//     color: closed ? T.textDisabled : T.accent,
//     border: `1px solid ${closed ? T.border : T.accent}30`,
//     whiteSpace: "nowrap",
//   }}>{label}</span>
// );

// const SubTag = ({ label, closed }) => (
//   <span style={{
//     display: "inline-block", padding: "2px 8px", borderRadius: "20px",
//     fontSize: "0.68rem", fontWeight: 600,
//     background: closed ? T.grayBg : T.blueBg,
//     color: closed ? T.textDisabled : T.blue,
//     border: `1px solid ${closed ? T.border : T.blue}30`,
//     whiteSpace: "nowrap",
//   }}>{label}</span>
// );

// const StatusPill = ({ status }) => {
//   const isActive = status === "Active";
//   return (
//     <span style={{
//       display: "inline-flex", alignItems: "center", gap: "5px",
//       padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700,
//       letterSpacing: "0.05em",
//       background: isActive ? T.greenBg : T.grayBg,
//       color: isActive ? T.green : T.textDisabled,
//       border: `1px solid ${isActive ? T.green : T.border}40`,
//     }}>
//       <span style={{
//         width: 6, height: 6, borderRadius: "50%",
//         background: isActive ? T.green : T.textDisabled, display: "inline-block"
//       }} />
//       {status}
//     </span>
//   );
// };

// const DeadlineLabel = ({ deadline }) => {
//   if (!deadline) return null;
//   const diff = differenceInCalendarDays(new Date(deadline), new Date());
//   const overdue = diff < 0;
//   const critical = !overdue && diff <= 1;
//   const soon = !overdue && !critical && diff <= 3;
//   return (
//     <span style={{
//       fontSize: "0.7rem", fontWeight: 600,
//       color: overdue ? "#A40E26" : critical ? T.red : soon ? T.orange : T.textSecondary,
//     }}>
//       {overdue
//         ? `${Math.abs(diff)}d overdue`
//         : diff === 0 ? "Due today"
//           : diff === 1 ? "Due tomorrow"
//             : `Due in ${diff}d`}
//     </span>
//   );
// };

// // ── Comment Modal ─────────────────────────────────────────────────────────────
// const CommentModal = ({ task, projectId, currentUserId, onClose }) => {
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
//       position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
//       zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
//     }}>
//       <div onClick={e => e.stopPropagation()} style={{
//         background: T.bgCard, border: `1px solid ${T.border}`,
//         borderRadius: T.radius, padding: "20px", width: 360,
//         boxShadow: T.shadowMd, fontFamily: T.font,
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
//           <div>
//             <div style={{
//               fontSize: "0.7rem", color: T.textDisabled, textTransform: "uppercase",
//               letterSpacing: "0.06em", marginBottom: 3
//             }}>Add Comment</div>
//             <div style={{
//               fontSize: "0.875rem", fontWeight: 700, color: T.textPrimary,
//               lineHeight: 1.3, maxWidth: 260
//             }}>{task.title}</div>
//           </div>
//           <button onClick={onClose} style={{
//             background: "none", border: "none", cursor: "pointer",
//             fontSize: "1.1rem", color: T.textDisabled, padding: "0 4px", lineHeight: 1
//           }}>×</button>
//         </div>
//         {posted ? (
//           <div style={{ textAlign: "center", padding: "16px 0", color: T.green, fontWeight: 600, fontSize: "0.875rem" }}>
//             ✓ Comment posted!
//           </div>
//         ) : (
//           <>
//             <textarea
//               autoFocus value={text} onChange={e => setText(e.target.value)}
//               onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
//               placeholder="Write your comment… (Enter to send)" rows={3}
//               style={{
//                 width: "100%", resize: "vertical", background: T.bgInput,
//                 border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
//                 color: T.textPrimary, fontSize: "0.82rem", padding: "8px 10px",
//                 outline: "none", fontFamily: T.font, lineHeight: 1.5,
//               }}
//               onFocus={e => e.target.style.borderColor = T.borderFocus}
//               onBlur={e => e.target.style.borderColor = T.border}
//             />
//             <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
//               <button onClick={onClose} style={{
//                 padding: "6px 14px", borderRadius: T.radiusSm,
//                 background: "none", border: `1px solid ${T.border}`,
//                 color: T.textSecondary, fontSize: "0.78rem", cursor: "pointer", fontFamily: T.font,
//               }}>Cancel</button>
//               <button onClick={submit} disabled={!text.trim() || posting} style={{
//                 padding: "6px 14px", borderRadius: T.radiusSm,
//                 background: text.trim() ? T.accent : T.grayBg, border: "none",
//                 color: text.trim() ? "#FFF" : T.textDisabled,
//                 fontSize: "0.78rem", fontWeight: 600,
//                 cursor: text.trim() ? "pointer" : "not-allowed",
//                 fontFamily: T.font, transition: "background 0.15s",
//               }}>
//                 {posting ? "Posting…" : "Post"}
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

//   const activeProjects = useMemo(() => projects.filter(p => p.status !== "Closed"), [projects]);
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

//   const canAssignToOthers = isAdmin || isCreator;

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     priority: "Medium",
//     deadline: "",
//     assignedTo: { id: currentUserId, username: currentUsername },
//     links: [],
//   });
//   const [errors, setErrors] = useState({});
//   const [saving, setSaving] = useState(false);
//   const [linkInput, setLinkInput] = useState("");

//   useEffect(() => {
//     setForm(p => ({ ...p, assignedTo: { id: currentUserId, username: currentUsername } }));
//   }, [selectedProjectId, currentUserId, currentUsername]);

//   if (activeProjects.length === 0) {
//     return (
//       <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <div onClick={e => e.stopPropagation()} style={{ background: T.bgCard, padding: 24, borderRadius: T.radius, textAlign: "center", boxShadow: T.shadowMd, fontFamily: T.font }}>
//           <div style={{ fontSize: "1.2rem", marginBottom: 12 }}>🚫</div>
//           <div style={{ fontSize: "0.95rem", fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>No Active Projects</div>
//           <div style={{ fontSize: "0.8rem", color: T.textSecondary, marginBottom: 16 }}>You must be assigned to an active project to create tasks.</div>
//           <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: T.radiusSm, background: T.bgInput, border: `1px solid ${T.border}`, cursor: "pointer", fontFamily: T.font }}>Close</button>
//         </div>
//       </div>
//     );
//   }

//   const set = (k, v) => {
//     setForm(p => ({ ...p, [k]: v }));
//     if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
//   };

//   const addLink = () => {
//     if (linkInput.trim()) { set("links", [...form.links, linkInput.trim()]); setLinkInput(""); }
//   };
//   const removeLink = (i) => set("links", form.links.filter((_, idx) => idx !== i));

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

//       const newTask = res.data?.task || res.data || {
//         ...form,
//         _id: Math.random().toString(),
//         status: "Todo",
//         createdAt: new Date().toISOString()
//       };

//       onSuccess?.(newTask, selectedProjectId);
//       onClose();
//     } catch (err) {
//       console.error("Global add task error:", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const inputStyle = (hasError) => ({
//     width: "100%", padding: "7px 10px", borderRadius: T.radiusSm,
//     border: `1px solid ${hasError ? T.red : T.border}`,
//     background: T.bgInput, color: T.textPrimary,
//     fontSize: "0.82rem", fontFamily: T.font, outline: "none",
//     boxSizing: "border-box",
//   });

//   const labelStyle = {
//     display: "block", fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//     textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5,
//   };

//   const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;

//   return (
//     <div onClick={onClose} style={{
//       position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
//       zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
//     }}>
//       <div onClick={e => e.stopPropagation()} style={{
//         background: T.bgCard, border: `1px solid ${T.border}`,
//         borderRadius: T.radius, width: 480, maxHeight: "85vh",
//         display: "flex", flexDirection: "column",
//         boxShadow: T.shadowMd, fontFamily: T.font,
//         overflow: "hidden",
//       }}>
//         <div style={{
//           padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
//           display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
//         }}>
//           <div>
//             <div style={{ fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>Create New Task</div>
//           </div>
//           <button onClick={onClose} style={{
//             background: "none", border: "none", cursor: "pointer",
//             fontSize: "1.2rem", color: T.textDisabled, lineHeight: 1, padding: "2px 6px",
//           }}>×</button>
//         </div>

//         <div style={{ padding: "18px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
//           <div>
//             <label style={labelStyle}>Project <span style={{ color: T.red }}>*</span></label>
//             <select
//               value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}
//               style={{
//                 ...inputStyle(false), appearance: "none",
//                 backgroundImage: selectChevron,
//                 backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
//               }}
//             >
//               {activeProjects.map(p => (
//                 <option key={p._id} value={p._id}>{p.projectName}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label style={labelStyle}>Title <span style={{ color: T.red }}>*</span></label>
//             <input
//               autoFocus value={form.title} onChange={e => set("title", e.target.value)}
//               placeholder="What needs to be done?" style={inputStyle(!!errors.title)}
//               onFocus={e => e.target.style.borderColor = errors.title ? T.red : T.borderFocus}
//               onBlur={e => e.target.style.borderColor = errors.title ? T.red : T.border}
//             />
//             {errors.title && <div style={{ fontSize: "0.68rem", color: T.red, marginTop: 4 }}>{errors.title}</div>}
//           </div>

//           <div>
//             <label style={labelStyle}>Description</label>
//             <textarea
//               value={form.description} onChange={e => set("description", e.target.value)}
//               placeholder="Add details, context, or acceptance criteria..." rows={3}
//               style={{ ...inputStyle(false), resize: "vertical", lineHeight: 1.5 }}
//               onFocus={e => e.target.style.borderColor = T.borderFocus}
//               onBlur={e => e.target.style.borderColor = T.border}
//             />
//           </div>

//           <div style={{ display: "flex", gap: 12 }}>
//             <div style={{ flex: 1 }}>
//               <label style={labelStyle}>Priority</label>
//               <select
//                 value={form.priority} onChange={e => set("priority", e.target.value)}
//                 style={{
//                   ...inputStyle(false), appearance: "none",
//                   backgroundImage: selectChevron,
//                   backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
//                 }}
//               >
//                 {["Low", "Medium", "High", "Critical"].map(p => (
//                   <option key={p} value={p}>{{ Low: "↓ Low", Medium: "→ Medium", High: "↑ High", Critical: "⚑ Critical" }[p]}</option>
//                 ))}
//               </select>
//             </div>
//             <div style={{ flex: 1 }}>
//               <label style={labelStyle}>Deadline <span style={{ color: T.red }}>*</span></label>
//               <input
//                 type="date" value={form.deadline} min={todayStr()}
//                 onChange={e => set("deadline", e.target.value)} style={inputStyle(!!errors.deadline)}
//                 onFocus={e => e.target.style.borderColor = errors.deadline ? T.red : T.borderFocus}
//                 onBlur={e => e.target.style.borderColor = errors.deadline ? T.red : T.border}
//               />
//               {errors.deadline && <div style={{ fontSize: "0.68rem", color: T.red, marginTop: 4 }}>{errors.deadline}</div>}
//             </div>
//           </div>

//           <div>
//             <label style={labelStyle}>Assign To</label>
//             <select
//               value={form.assignedTo?.id || ""} disabled={!canAssignToOthers}
//               onChange={e => { const dev = developers.find(d => d.id === e.target.value); if (dev) set("assignedTo", dev); }}
//               style={{
//                 ...inputStyle(false), appearance: "none",
//                 backgroundImage: selectChevron, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
//                 opacity: !canAssignToOthers ? 0.6 : 1,
//               }}
//             >
//               {(canAssignToOthers ? developers : developers.filter(d => d.id === currentUserId)).map(dev => (
//                 <option key={dev.id} value={dev.id}>{dev.username}{dev.id === currentUserId ? " (you)" : ""}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div style={{
//           padding: "14px 20px", borderTop: `1px solid ${T.border}`,
//           display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0,
//         }}>
//           <button onClick={onClose} style={{
//             padding: "7px 16px", borderRadius: T.radiusSm,
//             background: "none", border: `1px solid ${T.border}`,
//             color: T.textSecondary, fontSize: "0.82rem", cursor: "pointer", fontFamily: T.font,
//           }}>Cancel</button>
//           <button onClick={handleSubmit} disabled={saving} style={{
//             padding: "7px 18px", borderRadius: T.radiusSm,
//             background: saving ? T.grayBg : T.accent, border: "none",
//             color: saving ? T.textDisabled : "#FFF",
//             fontSize: "0.82rem", fontWeight: 700,
//             cursor: saving ? "not-allowed" : "pointer",
//             fontFamily: T.font, transition: "background 0.15s",
//           }}>
//             {saving ? "Creating…" : "Create Task"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Task Details Modal ────────────────────────────────────────────────────────
// const SidebarTaskDetailModal = ({ task, projectId, projectName, currentUserId, onClose, onTaskComplete }) => {
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
//       position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
//       zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
//     }}>
//       <div onClick={e => e.stopPropagation()} style={{
//         background: T.bgCard, border: `1px solid ${T.border}`,
//         borderRadius: T.radius, width: 500, maxHeight: "85vh",
//         display: "flex", flexDirection: "column",
//         boxShadow: T.shadowMd, fontFamily: T.font,
//       }}>
//         <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//           <div>
//             <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Task Details</div>
//             <div style={{ fontSize: "1.1rem", fontWeight: 700, color: T.textPrimary, lineHeight: 1.3 }}>{task.title}</div>
//             <div style={{ fontSize: "0.8rem", color: T.textSecondary, marginTop: 4 }}>Project: <strong style={{ color: T.textPrimary }}>{projectName}</strong></div>
//           </div>
//           <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: T.textDisabled }}>×</button>
//         </div>

//         <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
//           <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: cfg.bg, color: cfg.color, borderRadius: T.radiusSm, fontSize: "0.78rem", fontWeight: 700 }}>
//               <span>{cfg.dot}</span> {task.priority} Priority
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: "0.78rem" }}>
//               <span style={{ fontWeight: 700, color: T.textSecondary }}>Status:</span>
//               <span style={{ color: task.status === "In Progress" ? T.blue : T.textPrimary, fontWeight: 700 }}>{task.status}</span>
//             </div>
//             {task.deadline && (
//               <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: "0.78rem" }}>
//                 <span style={{ fontWeight: 700, color: T.textSecondary }}>Deadline:</span>
//                 <DeadlineLabel deadline={task.deadline} />
//               </div>
//             )}
//           </div>

//           {task.description && (
//             <div>
//               <div style={{ fontSize: "0.7rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Description</div>
//               <div style={{ fontSize: "0.85rem", color: T.textSecondary, lineHeight: 1.6, background: T.bgInput, padding: "12px 16px", borderRadius: T.radiusSm, border: `1px solid ${T.border}`, whiteSpace: "pre-wrap" }}>
//                 {task.description}
//               </div>
//             </div>
//           )}

//           {task.links?.length > 0 && (
//             <div>
//               <div style={{ fontSize: "0.7rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Links</div>
//               <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//                 {task.links.map((lnk, i) => (
//                   <a key={i} href={lnk} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: T.blue, textDecoration: "none", wordBreak: "break-all" }}>🔗 {lnk}</a>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 12 }}>
//           <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: T.radiusSm, background: "none", border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: "0.85rem", cursor: "pointer", fontFamily: T.font }}>Close</button>
//           <button onClick={handleComplete} disabled={completing} style={{ padding: "8px 20px", borderRadius: T.radiusSm, background: completing ? T.grayBg : T.green, border: "none", color: completing ? T.textDisabled : "#FFF", fontSize: "0.85rem", fontWeight: 700, cursor: completing ? "not-allowed" : "pointer", fontFamily: T.font, transition: "background 0.15s" }}>
//             {completing ? "Completing…" : "Mark As Done"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Generic Task Card (Used in Boards and Sidebar) ────────────────────────────
// const TaskCard = ({ task, projectId, projectName, currentUserId, onTaskComplete, onTaskClick }) => {
//   const cfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
//   const urgency = getUrgency(task.deadline);
//   const ustyle = urgency ? URGENCY_STYLES[urgency] : null;
//   const [completing, setCompleting] = useState(false);
//   const [commentOpen, setCommentOpen] = useState(false);

//   const handleComplete = async (e) => {
//     e.stopPropagation();
//     setCompleting(true);
//     try {
//       await axios.post(`${API_BASE}/api/tasks/${projectId}/${task._id}/complete`, {}, { headers: authHeaders() });
//       onTaskComplete(task._id, projectId);
//     } catch (err) {
//       console.error("Complete error:", err);
//       setCompleting(false);
//     }
//   };

//   const cardBg = ustyle?.bg || T.bgCard;
//   const cardBorder = ustyle ? `1px solid ${ustyle.border}` : `1px solid ${T.border}`;
//   const cardShadow = ustyle?.glow || T.shadow;
//   const borderLeft = ustyle?.borderLeft || "4px solid transparent";

//   return (
//     <>
//       <div
//         className={`sidebar-task${urgency === "overdue" ? " sidebar-task--overdue" : ""}`}
//         onClick={(e) => {
//           // If we drag, don't trigger click
//           if (e.defaultPrevented) return;
//           onTaskClick(task, projectId, projectName);
//         }}
//         style={{
//           padding: "10px 12px", borderRadius: T.radiusSm, cursor: "pointer",
//           background: cardBg, border: cardBorder, borderLeft,
//           marginBottom: 8, boxShadow: cardShadow,
//           transition: "box-shadow 0.2s, border-color 0.2s, transform 0.15s",
//           position: "relative", overflow: "hidden",
//         }}
//       >
//         {(urgency === "overdue" || urgency === "critical") && (
//           <div style={{
//             position: "absolute", top: 0, left: 0, right: 0, height: 2,
//             background: urgency === "overdue"
//               ? "linear-gradient(90deg, #A40E26, #FF4D4D, #A40E26)"
//               : "linear-gradient(90deg, #D1242F, #FF6B6B, #D1242F)",
//             backgroundSize: "200% 100%",
//             animation: "shimmer 2s linear infinite",
//           }} />
//         )}
//         <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
//           <span style={{ fontSize: "0.65rem", color: cfg.color, marginTop: 2, flexShrink: 0 }}>{cfg.dot}</span>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{
//               fontSize: "0.8rem", fontWeight: 600, color: T.textPrimary,
//               lineHeight: 1.4, marginBottom: 4,
//               wordBreak: "break-word"
//             }}>{task.title}</div>

//             <div style={{
//               fontSize: "0.7rem", color: T.textSecondary, marginBottom: 6,
//               wordBreak: "break-word"
//             }}>{projectName}</div>

//             <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
//               {task.deadline && <DeadlineLabel deadline={task.deadline} />}
//               {urgency && urgency !== "low" && (
//                 <span style={{
//                   fontSize: "0.58rem", fontWeight: 800, padding: "1px 5px", borderRadius: "3px",
//                   background: ustyle.labelBg, color: ustyle.labelColor,
//                   textTransform: "uppercase", letterSpacing: "0.06em",
//                 }}>
//                   {urgency === "overdue" ? "🚨 OVERDUE" : urgency === "critical" ? "🔥 URGENT" : urgency === "high" ? "⚠ SOON" : "SOON"}
//                 </span>
//               )}
//             </div>

//             <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
//               <button onClick={handleComplete} disabled={completing} style={{
//                 display: "flex", alignItems: "center", gap: 4,
//                 padding: "4px 9px", borderRadius: "4px",
//                 background: completing ? T.grayBg : T.greenBg,
//                 border: `1px solid ${completing ? T.border : T.green}40`,
//                 color: completing ? T.textDisabled : T.green,
//                 fontSize: "0.68rem", fontWeight: 700,
//                 cursor: completing ? "not-allowed" : "pointer",
//                 fontFamily: T.font, transition: "background 0.15s, color 0.15s",
//                 whiteSpace: "nowrap",
//               }}
//                 onMouseEnter={e => { if (!completing) { e.currentTarget.style.background = T.green; e.currentTarget.style.color = "#FFF"; } }}
//                 onMouseLeave={e => { e.currentTarget.style.background = completing ? T.grayBg : T.greenBg; e.currentTarget.style.color = completing ? T.textDisabled : T.green; }}
//               >{completing ? "…" : "Mark As Done"}</button>
//               <button onClick={e => { e.stopPropagation(); setCommentOpen(true); }} style={{
//                 display: "flex", alignItems: "center", gap: 4,
//                 padding: "4px 9px", borderRadius: "4px",
//                 background: T.bgInput, border: `1px solid ${T.border}`,
//                 color: T.textSecondary, fontSize: "0.68rem", fontWeight: 600,
//                 cursor: "pointer", fontFamily: T.font,
//                 transition: "border-color 0.15s, color 0.15s", whiteSpace: "nowrap",
//               }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.blue; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary; }}
//               >Comment</button>
//             </div>
//           </div>
//           <span style={{
//             fontSize: "0.62rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px",
//             background: task.status === "In Progress" ? T.blueBg : T.grayBg,
//             color: task.status === "In Progress" ? T.blue : T.textSecondary,
//             flexShrink: 0, alignSelf: "flex-start",
//           }}>
//             {task.status === "In Progress" ? "WIP" : "TODO"}
//           </span>
//         </div>
//       </div>
//       {commentOpen && (
//         <CommentModal task={task} projectId={projectId} currentUserId={currentUserId} onClose={() => setCommentOpen(false)} />
//       )}
//     </>
//   );
// };

// // ── Project Card (List View) ──────────────────────────────────────────────────
// const ProjectCard = ({ project, onOpenKanban }) => {
//   const closed = project.status === "Closed";
//   const [expanded, setExpanded] = useState(false);
//   const [completions, setCompletions] = useState([]);
//   const [loadingComps, setLoadingComps] = useState(false);

//   const handleToggleExpand = async (e) => {
//     e.stopPropagation();
//     if (!expanded && completions.length === 0) {
//       setLoadingComps(true);
//       try {
//         const r = await axios.get(`${API_BASE}/api/tasks/${project._id}/completions`, { headers: authHeaders() });
//         setCompletions(r.data || []);
//       } catch (err) {
//         console.error("Failed to load completions");
//       }
//       setLoadingComps(false);
//     }
//     setExpanded(!expanded);
//   };

//   return (
//     <div
//       className={`project-card ${closed ? "closed" : ""}`}
//       style={{
//         background: closed ? T.closedBg : T.bgCard,
//         border: `1px solid ${closed ? T.closedBorder : T.border}`,
//         borderRadius: T.radius, marginBottom: 12, overflow: "hidden",
//         boxShadow: T.shadow, opacity: closed ? 0.75 : 1,
//         position: "relative", zIndex: 1,
//       }}
//     >
//       <div
//         style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer" }}
//         onClick={handleToggleExpand}
//         onPointerDown={stopDragEvent}
//       >
//         <div style={{
//           width: 36, height: 36, borderRadius: 8,
//           background: closed ? T.grayBg : T.accentDim,
//           display: "flex", alignItems: "center", justifyContent: "center",
//           flexShrink: 0, fontSize: "1rem",
//         }}>📁</div>

//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
//             <span style={{
//               fontSize: "0.9rem", fontWeight: 700,
//               color: closed ? T.closedText : T.textPrimary, fontFamily: T.font
//             }}>
//               {project.projectName}
//             </span>
//             <StatusPill status={project.status} />
//             {closed && <span style={{ fontSize: "0.68rem", color: T.textDisabled, fontStyle: "italic" }}>Read-only</span>}
//           </div>
//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
//             {(project.serviceType || []).map((s, i) => <ServiceTag key={i} label={s} closed={closed} />)}
//             <SubTag label={project.subscriptionType} closed={closed} />
//           </div>
//           <div style={{
//             display: "flex", gap: 16, flexWrap: "wrap",
//             fontSize: "0.75rem", color: closed ? T.textDisabled : T.textSecondary
//           }}>
//             <span>Created by <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.createdBy}</strong></span>
//             {project.clientName && (
//               <span>Client: <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.clientName}</strong></span>
//             )}
//           </div>
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
//           <div style={{
//             fontSize: "0.75rem", color: T.textSecondary,
//             transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
//             transition: "transform 0.2s",
//           }}>▼</div>
//         </div>
//       </div>

//       {expanded && (
//         <div style={{
//           borderTop: `1px solid ${T.border}`, padding: "16px 18px",
//           display: "flex", flexDirection: "column", gap: 16,
//         }}>
//           {loadingComps ? (
//             <div style={{ fontSize: "0.75rem", color: T.textSecondary }}>Loading history...</div>
//           ) : completions.length > 0 && (
//             <div>
//               <div style={{
//                 fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//                 textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8
//               }}>Recent Completions</div>
//               <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//                 {completions.slice(0, 5).map((u, i) => (
//                   <div key={i} style={{
//                     display: "flex", alignItems: "center", gap: 8,
//                     padding: "7px 12px", background: T.bgInput,
//                     borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
//                   }}>
//                     <span style={{ fontSize: "0.7rem", color: T.green }}>✔</span>
//                     <span style={{ fontSize: "0.78rem", fontWeight: 600, color: closed ? T.textDisabled : T.textPrimary, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                       {u.taskTitle}
//                     </span>
//                     <span style={{ fontSize: "0.7rem", color: T.textSecondary }}>
//                       {u.completedBy?.username} {u.completedAt ? `· ${format(new Date(u.completedAt), "MMM d, yyyy")}` : ""}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px 20px" }}>
//             {[
//               { label: "Business Niche", value: project.businessNiche },
//               { label: "Client Website", value: project.referenceSite },
//             ].filter(f => f.value).map(({ label, value }) => (
//               <div key={label}>
//                 <div style={{
//                   fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//                   textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3
//                 }}>{label}</div>
//                 <div style={{ fontSize: "0.8rem", color: closed ? T.textDisabled : T.textPrimary, wordBreak: "break-all" }}>
//                   {label === "Client Website" ? (
//                     <a href={value} target="_blank" rel="noopener noreferrer"
//                       style={{ color: closed ? T.textDisabled : T.blue, textDecoration: "none" }}
//                       onClick={e => e.stopPropagation()} onPointerDown={stopDragEvent}>{value}</a>
//                   ) : value}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {project.projectDetails && (
//             <div>
//               <div style={{
//                 fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//                 textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4
//               }}>Details</div>
//               <div style={{
//                 fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
//                 lineHeight: 1.6, padding: "8px 12px", background: T.bgInput,
//                 borderRadius: T.radiusSm, border: `1px solid ${T.border}`
//               }}>
//                 {project.projectDetails}
//               </div>
//             </div>
//           )}

//           {!closed && (
//             <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
//               <button type="button"
//                 onClick={(e) => { e.stopPropagation(); onOpenKanban(project); }}
//                 onPointerDown={stopDragEvent}
//                 style={{
//                   display: "flex", alignItems: "center", gap: 7,
//                   padding: "7px 16px", borderRadius: T.radiusSm,
//                   fontSize: "0.8rem", fontWeight: 700, fontFamily: T.font,
//                   background: T.accentDim, border: `1px solid ${T.accent}50`,
//                   color: T.accent, cursor: "pointer", transition: "all 0.15s",
//                 }}
//                 onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#FFF"; }}
//                 onMouseLeave={e => { e.currentTarget.style.background = T.accentDim; e.currentTarget.style.color = T.accent; }}
//               >⬛ Open Kanban</button>
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
//     <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
//     <select value={value} onChange={e => onChange(e.target.value)} onPointerDown={stopDragEvent}
//       style={{
//         background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
//         color: value ? T.textPrimary : T.textSecondary, fontSize: "0.8rem",
//         padding: "6px 10px", outline: "none", fontFamily: T.font, appearance: "none",
//         backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
//         backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
//       }}
//     >
//       <option value="">All {label}</option>
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
//       background: T.green, color: "#fff", borderRadius: T.radius,
//       padding: "10px 18px", fontSize: "0.82rem", fontWeight: 600,
//       fontFamily: T.font, boxShadow: T.shadowMd,
//       animation: "fadeInUp 0.25s ease",
//     }}>
//       ✓ {message}
//     </div>
//   );
// };

// // ── Main Dashboard ────────────────────────────────────────────────────────────
// const DeveloperDashboard = () => {
//   const [viewMode, setViewMode] = useState("boards");
//   const [projects, setProjects] = useState([]);
//   const [tasks, setTasks] = useState({});
//   const [loadingInitial, setLoadingInitial] = useState(true);

//   const [kanbanProject, setKanbanProject] = useState(null);
//   const [kanbanOpen, setKanbanOpen] = useState(false);
//   const [openingKanbanId, setOpeningKanbanId] = useState(null);

//   const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
//   const [quickAddInitialProject, setQuickAddInitialProject] = useState("");
//   const [selectedSidebarTask, setSelectedSidebarTask] = useState(null);
//   const [toast, setToast] = useState("");

//   const [search, setSearch] = useState("");
//   const [filterCreatedBy, setFilterCreatedBy] = useState("");
//   const [filterSub, setFilterSub] = useState("");
//   const [filterService, setFilterService] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
//   const [projectVisibleCount, setProjectVisibleCount] = useState(10);

//   const currentUserId = localStorage.getItem("userId");
//   const currentUsername = localStorage.getItem("username") || "Developer";

//   // Drag to scroll References
//   const scrollRef = useRef(null);
//   const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
//   const [isGrabbing, setIsGrabbing] = useState(false);

//   useEffect(() => { setProjectVisibleCount(10); }, [search, filterCreatedBy, filterSub, filterService, filterStatus]);

//   const loadInitialData = useCallback(async (isSilent = false) => {
//     if (!isSilent) setLoadingInitial(true);
//     try {
//       const r = await axios.get(`${API_BASE}/api/newproject/projects`, { headers: authHeaders() });
//       const all = Array.isArray(r.data) ? r.data : [];
//       const mine = all.filter(p =>
//         (p.assignedDeveloper || []).some(
//           d => d.id && currentUserId && d.id.toString() === currentUserId.toString()
//         )
//       );

//       const tasksResult = {};
//       await Promise.allSettled(mine.map(async (p) => {
//         try {
//           const tasksRes = await axios.get(`${API_BASE}/api/tasks/${p._id}`, { headers: authHeaders() });
//           tasksResult[p._id] = (tasksRes.data || []).filter(
//             t => t.status !== "Done" && t.assignedTo?.id?.toString() === currentUserId?.toString()
//           );
//         } catch {
//           tasksResult[p._id] = [];
//         }
//       }));

//       setTasks(tasksResult);
//       setProjects(mine);
//     } catch (err) {
//       console.error("Dashboard load error:", err);
//     } finally {
//       if (!isSilent) setLoadingInitial(false);
//     }
//   }, [currentUserId]);

//   useEffect(() => {
//     loadInitialData();
//   }, [loadInitialData]);

//   const handleTaskComplete = useCallback((taskId, projectId) => {
//     setTasks(prev => {
//       const projectTasks = prev[projectId] || [];
//       return {
//         ...prev,
//         [projectId]: projectTasks.filter(t => t._id !== taskId)
//       };
//     });
//   }, []);

//   const handleQuickAddSuccess = useCallback((newTask, projectId) => {
//     setToast("Task created successfully!");
//     setTasks(prev => ({
//       ...prev,
//       [projectId]: [...(prev[projectId] || []), newTask]
//     }));
//   }, []);

//   const handleOpenKanban = useCallback((project) => {
//     setOpeningKanbanId(project._id);
//     setTimeout(() => {
//       setKanbanProject(project);
//       setKanbanOpen(true);
//       setOpeningKanbanId(null);
//     }, 450);
//   }, []);

//   // Drag Handlers
//   const handleMouseDown = (e) => {
//     if (!scrollRef.current) return;
//     dragState.current.isDown = true;
//     setIsGrabbing(true);
//     dragState.current.startX = e.pageX - scrollRef.current.offsetLeft;
//     dragState.current.scrollLeft = scrollRef.current.scrollLeft;
//   };

//   const handleMouseLeave = () => {
//     dragState.current.isDown = false;
//     setIsGrabbing(false);
//   };

//   const handleMouseUp = () => {
//     dragState.current.isDown = false;
//     setIsGrabbing(false);
//   };

//   const handleMouseMove = (e) => {
//     if (!dragState.current.isDown || !scrollRef.current) return;
//     const x = e.pageX - scrollRef.current.offsetLeft;
//     const walk = (x - dragState.current.startX) * 1.5; // Scroll speed multiplier
    
//     // If we've dragged a decent amount, prevent accidental clicks
//     if (Math.abs(walk) > 5) {
//       e.preventDefault(); 
//     }
    
//     scrollRef.current.scrollLeft = dragState.current.scrollLeft - walk;
//   };

//   const activeCount = projects.filter(p => p.status === "Active").length;
//   const closedCount = projects.filter(p => p.status === "Closed").length;

//   const boardProjects = useMemo(() => {
//     return projects.filter(p => p.status !== "Closed" && tasks[p._id]?.length > 0);
//   }, [projects, tasks]);

//   const filteredProjects = useMemo(() => projects.filter(p => {
//     const matchSearch = !search || p.projectName.toLowerCase().includes(search.toLowerCase()) || p.clientName?.toLowerCase().includes(search.toLowerCase());
//     const matchCreatedBy = !filterCreatedBy || p.createdBy === filterCreatedBy;
//     const matchSub = !filterSub || p.subscriptionType === filterSub;
//     const matchService = !filterService || (p.serviceType || []).includes(filterService);
//     const matchStatus = !filterStatus || p.status === filterStatus;
//     return matchSearch && matchCreatedBy && matchSub && matchService && matchStatus;
//   }), [projects, search, filterCreatedBy, filterSub, filterService, filterStatus]);

//   const createdByOptions = [...new Set(projects.map(p => p.createdBy).filter(Boolean))];
//   const subOptions = [...new Set(projects.map(p => p.subscriptionType).filter(Boolean))];
//   const serviceOptions = [...new Set(projects.flatMap(p => p.serviceType || []))];

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
//         * { box-sizing: border-box; }
        
//         /* Prominent Horizontal Scrollbar Setup */
//         ::-webkit-scrollbar { width: 8px; height: 12px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: #C1C7CD; border-radius: 6px; border: 2px solid ${T.bg}; }
//         ::-webkit-scrollbar-thumb:hover { background: #A1A8AE; }
        
//         input::placeholder, textarea::placeholder { color: ${T.textDisabled}; }
        
//         @keyframes shimmer {
//           0%   { background-position: 200% center; }
//           100% { background-position: -200% center; }
//         }
//         @keyframes urgentPulse {
//           0%, 100% { box-shadow: 0 0 0 0 rgba(164,14,38,0.35); }
//           50%       { box-shadow: 0 0 0 4px rgba(164,14,38,0); }
//         }
//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(8px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }

//         .sidebar-task--overdue { animation: urgentPulse 2.2s ease-in-out infinite; }
//         .sidebar-task--overdue:hover { animation: none; }
        
//         .project-card { transition: border-color 0.2s, box-shadow 0.2s; }
//         .project-card:not(.closed):hover {
//           border-color: ${T.accent}50 !important;
//           box-shadow: 0 0 0 1px ${T.accent}30, ${T.shadowMd} !important;
//         }
//         .sidebar-task { transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s; }
//         .sidebar-task:hover { transform: translateY(-1px); border-color: ${T.blue}80 !important; }

//         .btn-loading {
//           opacity: 0.7;
//           cursor: not-allowed !important;
//           position: relative;
//         }
//       `}</style>

//       <div style={{
//         display: "flex", flexDirection: "column", height: "100vh", background: T.bg,
//         fontFamily: T.font, color: T.textPrimary, overflow: "hidden", 
//       }}>

//         <div style={{
//           padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
//           display: "flex", alignItems: "center", gap: 16,
//           background: T.bgCard, flexShrink: 0, zIndex: 10, 
//         }}>
//           <div style={{
//             width: 36, height: 36, borderRadius: "50%", background: avatarColor(currentUsername),
//             display: "flex", alignItems: "center", justifyContent: "center",
//             fontSize: "0.85rem", fontWeight: 800, color: "#FFF", flexShrink: 0,
//           }}>{avatar(currentUsername)}</div>

//           <div>
//             <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginBottom: 1 }}>Developer Dashboard</div>
//             <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary }}>{currentUsername}</div>
//           </div>

//           <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
//             {[
//               { label: "Active", val: activeCount, color: T.green },
//               { label: "Closed", val: closedCount, color: T.textDisabled },
//             ].map(({ label, val, color }, i) => (
//               <React.Fragment key={label}>
//                 {i > 0 && <div style={{ width: 1, height: 28, background: T.border }} />}
//                 <div style={{ textAlign: "right" }}>
//                   <div style={{ fontSize: "0.65rem", color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
//                   <div style={{ fontSize: "1.1rem", fontWeight: 800, color }}>{val}</div>
//                 </div>
//               </React.Fragment>
//             ))}

//             <div style={{ width: 1, height: 28, background: T.border, margin: "0 4px" }} />

//             <button onClick={() => { setQuickAddInitialProject(""); setQuickAddModalOpen(true); }}
//               style={{
//                 padding: "8px 16px", borderRadius: T.radiusSm,
//                 fontSize: "0.8rem", fontWeight: 700, fontFamily: T.font,
//                 background: T.accent, border: "none", color: "#FFF",
//                 cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap"
//               }}
//               onMouseEnter={e => e.currentTarget.style.background = T.accentHover}
//               onMouseLeave={e => e.currentTarget.style.background = T.accent}
//             >+ Add Task</button>

//             <button onClick={() => setViewMode(v => v === "boards" ? "list" : "boards")}
//               style={{
//                 padding: "8px 16px", borderRadius: T.radiusSm,
//                 fontSize: "0.8rem", fontWeight: 700, fontFamily: T.font,
//                 background: T.bgInput, border: `1px solid ${T.border}`,
//                 color: T.textPrimary, cursor: "pointer", transition: "border 0.15s",
//                 whiteSpace: "nowrap"
//               }}
//               onMouseEnter={e => e.currentTarget.style.borderColor = T.borderFocus}
//               onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
//             >
//               {viewMode === "boards" ? "☰ View Full Projects" : "⏸ View Boards"}
//             </button>
//           </div>
//         </div>

//         <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", width: "100%" }}>

//           {loadingInitial ? (
//             <div style={{ display: "flex", width: "100%", justifyContent: "center", paddingTop: 80 }}>
//               <div style={{ textAlign: "center" }}>
//                 <div style={{
//                   width: 40, height: 40, borderRadius: "50%",
//                   border: `3px solid ${T.border}`, borderTopColor: T.accent,
//                   animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
//                 }} />
//                 <div style={{ fontSize: "0.85rem", color: T.textSecondary, fontWeight: 600 }}>Loading workspace...</div>
//               </div>
//             </div>
//           ) : viewMode === "boards" ? (

//             // ── CHANGED: Drag to scroll container ──
//             <div 
//               ref={scrollRef}
//               onMouseDown={handleMouseDown}
//               onMouseLeave={handleMouseLeave}
//               onMouseUp={handleMouseUp}
//               onMouseMove={handleMouseMove}
//               style={{
//                 display: "flex",
//                 flexWrap: "nowrap",
//                 gap: 20,
//                 padding: 24,
//                 overflowX: "auto",  
//                 overflowY: "auto",  
//                 width: "100%",      
//                 height: "100%",     
//                 alignItems: "flex-start", 
//                 // Adjust cursor based on state
//                 cursor: isGrabbing ? "grabbing" : "grab",
//                 // Prevent highlighting text while dragging
//                 userSelect: isGrabbing ? "none" : "auto", 
//               }}
//             >
//               {boardProjects.length === 0 ? (
//                 <div style={{ width: "100%", textAlign: "center", paddingTop: 60, color: T.textSecondary }}>
//                   <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⏸</div>
//                   <div style={{ fontSize: "1rem", fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>No Pending Tasks</div>
//                   <div style={{ fontSize: "0.85rem", maxWidth: 300, margin: "0 auto" }}>
//                     There are currently no active tasks across your projects. Use the "Add Task" button to create one and initialize a board.
//                   </div>
//                 </div>
//               ) : (
//                 boardProjects.map(p => {
//                   const projectTasks = tasks[p._id] || [];
//                   return (
//                     <div key={p._id} style={{
//                       width: 340,
//                       minWidth: 340,
//                       maxWidth: 340,
//                       flexShrink: 0,
//                       background: T.bgSidebar,
//                       border: `1px solid ${T.border}`,
//                       borderRadius: T.radius,
//                       display: "flex",
//                       flexDirection: "column",
//                       boxShadow: T.shadow,
//                     }}>
//                       <div style={{
//                         padding: "12px 16px", borderBottom: `1px solid ${T.border}`,
//                         display: "flex", alignItems: "center", justifyContent: "space-between",
//                         background: T.bgCard, borderRadius: `${T.radius} ${T.radius} 0 0`, flexShrink: 0
//                       }}>
//                         <div style={{ minWidth: 0, paddingRight: 8 }}>
//                           <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary, wordBreak: "break-word" }}>
//                             {p.projectName}
//                           </div>
//                           <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginTop: 2 }}>
//                             {projectTasks.length} Pending {projectTasks.length === 1 ? "Task" : "Tasks"}
//                           </div>
//                         </div>
//                         <button onClick={() => { setQuickAddInitialProject(p._id); setQuickAddModalOpen(true); }}
//                           // Stop drag event so clicking the button doesn't start a drag
//                           onMouseDown={stopDragEvent} 
//                           style={{
//                             width: 28, height: 28, borderRadius: "50%", background: T.accentDim,
//                             border: `1px solid ${T.accent}30`, color: T.accent, fontSize: "1.1rem",
//                             fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
//                             cursor: "pointer", transition: "all 0.15s", flexShrink: 0
//                           }}
//                           onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#FFF"; }}
//                           onMouseLeave={e => { e.currentTarget.style.background = T.accentDim; e.currentTarget.style.color = T.accent; }}
//                           title="Add task to this project"
//                         >+</button>
//                       </div>

//                       <div style={{
//                         padding: "12px 10px",
//                         display: "flex",
//                         flexDirection: "column",
//                         gap: 10,
//                       }}>
//                         {projectTasks.map(t => (
//                           <TaskCard
//                             key={t._id} task={t} projectId={p._id} projectName={p.projectName}
//                             currentUserId={currentUserId} onTaskComplete={handleTaskComplete}
//                             onTaskClick={(task, pId, pName) => setSelectedSidebarTask({ task, projectId: pId, projectName: pName })}
//                           />
//                         ))}
//                       </div>

//                       <div style={{ padding: "10px", borderTop: `1px solid ${T.border}`, background: T.bgCard, borderRadius: `0 0 ${T.radius} ${T.radius}`, flexShrink: 0 }}>
//                         <button
//                           className={openingKanbanId === p._id ? "btn-loading" : ""}
//                           onClick={() => handleOpenKanban(p)}
//                           onMouseDown={stopDragEvent}
//                           disabled={openingKanbanId === p._id}
//                           style={{
//                             width: "100%", padding: "8px", borderRadius: T.radiusSm,
//                             background: "transparent", border: `1px solid ${T.border}`, color: T.textSecondary,
//                             fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: T.font,
//                             display: "flex", justifyContent: "center", alignItems: "center", gap: 6
//                           }}
//                         >
//                           {openingKanbanId === p._id ? (
//                             <><div style={{ width: 12, height: 12, border: `2px solid ${T.textSecondary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Loading...</>
//                           ) : "⬛ Open Kanban"}
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>

//           ) : (

//             <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
//               <div style={{
//                 padding: "12px 24px", borderBottom: `1px solid ${T.border}`,
//                 background: T.bgCard, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", flexShrink: 0
//               }}>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px", minWidth: 180 }}>
//                   <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>Search</label>
//                   <div style={{ position: "relative" }}>
//                     <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDisabled, fontSize: "0.8rem", pointerEvents: "none" }}>⌕</span>
//                     <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Project name, client..."
//                       style={{
//                         width: "100%", background: T.bgInput, border: `1px solid ${T.border}`,
//                         borderRadius: T.radiusSm, color: T.textPrimary, fontSize: "0.8rem",
//                         padding: "6px 10px 6px 28px", outline: "none", fontFamily: T.font,
//                       }}
//                       onFocus={e => e.target.style.borderColor = T.borderFocus}
//                       onBlur={e => e.target.style.borderColor = T.border}
//                     />
//                   </div>
//                 </div>
//                 <FilterSelect label="Created By" value={filterCreatedBy} onChange={setFilterCreatedBy} options={createdByOptions} />
//                 <FilterSelect label="Subscription" value={filterSub} onChange={setFilterSub} options={subOptions} />
//                 <FilterSelect label="Service" value={filterService} onChange={setFilterService} options={serviceOptions} />
//                 <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={["Active", "Closed"]} />
//                 {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
//                   <button onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }}
//                     style={{
//                       padding: "6px 12px", alignSelf: "flex-end", borderRadius: T.radiusSm,
//                       fontSize: "0.78rem", fontFamily: T.font, whiteSpace: "nowrap",
//                       background: "transparent", border: `1px solid ${T.border}`, color: T.textSecondary, cursor: "pointer",
//                     }}
//                   >× Clear</button>
//                 )}
//               </div>

//               <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
//                 {filteredProjects.length === 0 ? (
//                   <div style={{ textAlign: "center", paddingTop: 60, color: T.textSecondary }}>
//                     <div style={{ fontSize: "2rem", marginBottom: 12 }}>📂</div>
//                     <div style={{ fontSize: "0.95rem", fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>No projects match your filters</div>
//                   </div>
//                 ) : (
//                   <>
//                     <div style={{ fontSize: "0.75rem", color: T.textSecondary, marginBottom: 14 }}>
//                       Showing <strong style={{ color: T.textPrimary }}>{Math.min(projectVisibleCount, filteredProjects.length)}</strong> of{" "}
//                       <strong style={{ color: T.textPrimary }}>{filteredProjects.length}</strong> projects
//                     </div>
//                     {filteredProjects.slice(0, projectVisibleCount).map(p => (
//                       <ProjectCard key={p._id} project={p} onOpenKanban={handleOpenKanban} />
//                     ))}
//                     {projectVisibleCount < filteredProjects.length && (
//                       <div style={{ textAlign: "center", padding: "20px 0" }}>
//                         <button onClick={() => setProjectVisibleCount(p => p + 10)}
//                           style={{
//                             padding: "8px 20px", borderRadius: T.radiusSm, background: T.bgInput,
//                             border: `1px solid ${T.border}`, color: T.blue, fontSize: "0.85rem",
//                             fontWeight: 700, cursor: "pointer", fontFamily: T.font
//                           }}
//                         >Load More Projects...</button>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {kanbanProject && (
//         <ProjectKanban
//           open={kanbanOpen}
//           onClose={() => {
//             setKanbanOpen(false);
//             setKanbanProject(null);
//             loadInitialData(true);
//           }}
//           project={kanbanProject}
//         />
//       )}

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
//           currentUserId={currentUserId}
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

// ── Design Tokens (Light Theme) ───────────────────────────────────────────────
const T = {
  // Core surfaces
  bg: "#F8FAFC",
  bgCard: "#FFFFFF",
  bgElevated: "#F1F5F9",
  bgInput: "#FFFFFF",
  bgHover: "#F1F5F9",

  // Borders
  border: "#E2E8F0",
  borderMed: "#CBD5E1",
  borderFocus: "#4F6EF7",

  // Brand accent — vibrant indigo
  accent: "#4F6EF7",
  accentDim: "rgba(79, 110, 247, 0.08)",
  accentHover: "#3B52C7",
  accentText: "#3F5AD3",

  // Semantic colors
  green: "#10B981",
  greenDim: "rgba(16, 185, 129, 0.08)",
  greenText: "#047857",
  red: "#EF4444",
  redDim: "rgba(239, 68, 68, 0.08)",
  orange: "#F59E0B",
  orangeDim: "rgba(245, 158, 11, 0.08)",
  blue: "#3B82F6",
  blueDim: "rgba(59, 130, 246, 0.08)",

  // Typography
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  textDisabled: "#94A3B8",

  // Utility
  font: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
  radius: "10px",
  radiusSm: "6px",
  radiusXs: "4px",
  shadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 12px rgba(15,23,42,0.05), 0 2px 4px rgba(15,23,42,0.05)",
  shadowLg: "0 12px 32px rgba(15,23,42,0.12), 0 4px 12px rgba(15,23,42,0.06)",
};

const PRIORITY_CFG = {
  Critical: { color: T.red, bg: T.redDim, dot: "●", ring: "#EF4444" },
  High: { color: T.orange, bg: T.orangeDim, dot: "▲", ring: "#F59E0B" },
  Medium: { color: T.accentText, bg: T.accentDim, dot: "◆", ring: "#4F6EF7" },
  Low: { color: T.greenText, bg: T.greenDim, dot: "▼", ring: "#10B981" },
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
    borderLeft: `3px solid ${T.border}`,
    labelColor: T.textMuted,
    labelBg: "transparent",
    label: "",
  },
};

// ── Atom: Badge ───────────────────────────────────────────────────────────────
const Badge = ({ children, color = T.textMuted, bg = T.bgElevated, border = T.border }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    padding: "2px 7px", borderRadius: "20px",
    fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.02em",
    background: bg, color, border: `1px solid ${border}`,
    whiteSpace: "nowrap", lineHeight: "1.6",
  }}>{children}</span>
);

const ServiceTag = ({ label }) => (
  <Badge color={T.accentText} bg={T.accentDim} border={`${T.accent}20`}>{label}</Badge>
);

const SubTag = ({ label }) => (
  <Badge color={T.textSecondary} bg={T.bgElevated} border={T.border}>{label}</Badge>
);

// ── Atom: StatusDot ───────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const isActive = status === "Active";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: "20px",
      fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.04em",
      background: isActive ? T.greenDim : T.bgElevated,
      color: isActive ? T.greenText : T.textMuted,
      border: `1px solid ${isActive ? T.green + "25" : T.border}`,
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
      fontSize: "0.7rem", fontWeight: 500,
      color: overdue ? T.red : critical ? T.orange : soon ? T.orange : T.textSecondary,
      fontFamily: T.fontMono,
    }}>
      {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : diff === 1 ? "Due tomorrow" : `${diff}d left`}
    </span>
  );
};

// ── Atom: Icon Button ─────────────────────────────────────────────────────────
const IconBtn = ({ onClick, disabled, children, variant = "ghost", style = {} }) => {
  const variants = {
    ghost: { bg: "transparent", border: T.border, color: T.textSecondary, hover: T.bgHover },
    accent: { bg: T.accentDim, border: `${T.accent}30`, color: T.accentText },
    success: { bg: T.greenDim, border: `${T.green}30`, color: T.greenText },
    danger: { bg: T.redDim, border: `${T.red}30`, color: T.red },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
        padding: "4px 10px", borderRadius: T.radiusSm,
        background: v.bg, border: `1px solid ${v.border}`, color: v.color,
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

// ── Atom: Spinner ─────────────────────────────────────────────────────────────
const Spinner = ({ size = 10, color = "currentColor" }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    border: `1.5px solid ${color}`, borderRightColor: "transparent",
    borderRadius: "50%", animation: "spin 0.65s linear infinite", flexShrink: 0,
  }} />
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
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bgCard, border: `1px solid ${T.borderMed}`,
        borderRadius: T.radius, padding: "24px", width: 380,
        boxShadow: T.shadowLg, fontFamily: T.font,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: "0.65rem", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Add Comment</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: T.textPrimary, lineHeight: 1.4, maxWidth: 280 }}>{task.title}</div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "1.1rem", color: T.textMuted, padding: "0 4px", lineHeight: 1,
          }}>×</button>
        </div>
        {posted ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: T.greenText, fontWeight: 600, fontSize: "0.85rem" }}>
            ✓ Comment posted
          </div>
        ) : (
          <>
            <textarea
              autoFocus value={text} onChange={e => setText(e.target.value)}
              placeholder="Add your comment..." rows={4}
              style={{
                width: "100%", resize: "none",
                background: T.bgInput, border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm, color: T.textPrimary,
                fontSize: "0.82rem", padding: "10px 12px",
                outline: "none", fontFamily: T.font, lineHeight: 1.6,
                boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = T.borderFocus}
              onBlur={e => e.target.style.borderColor = T.border}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <IconBtn onClick={onClose}>Cancel</IconBtn>
              <button onClick={submit} disabled={!text.trim() || posting} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 16px", borderRadius: T.radiusSm,
                background: text.trim() ? T.accent : T.bgElevated,
                border: `1px solid ${text.trim() ? T.accent : T.border}`,
                color: text.trim() ? "#FFF" : T.textMuted,
                fontSize: "0.78rem", fontWeight: 600,
                cursor: text.trim() ? "pointer" : "not-allowed",
                transition: "all 0.12s",
              }}>
                {posting && <Spinner color="#FFF" />}
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

  const activeProjects = useMemo(() => projects.filter(p => p.status !== "Closed"), [projects]);
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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.bgCard, padding: 32, borderRadius: T.radius, textAlign: "center", boxShadow: T.shadowLg, fontFamily: T.font, border: `1px solid ${T.borderMed}` }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🚫</div>
          <div style={{ fontSize: "1rem", fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>No active projects</div>
          <div style={{ fontSize: "0.82rem", color: T.textSecondary, marginBottom: 16 }}>There are no active projects to add tasks to.</div>
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
      onClose();
    } catch (err) {
      console.error("Add task error:", err);
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = (hasError) => ({
    width: "100%", padding: "8px 12px", borderRadius: T.radiusSm,
    border: `1px solid ${hasError ? T.red : T.border}`,
    background: T.bgInput, color: T.textPrimary,
    fontSize: "0.82rem", fontFamily: T.font, outline: "none",
    boxSizing: "border-box", transition: "border-color 0.12s",
  });

  const labelStyle = {
    display: "block", fontSize: "0.65rem", fontWeight: 600, color: T.textMuted,
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bgCard, border: `1px solid ${T.borderMed}`,
        borderRadius: T.radius, width: 460, maxHeight: "88vh",
        display: "flex", flexDirection: "column", boxShadow: T.shadowLg, fontFamily: T.font,
      }}>
        {/* Modal Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.65rem", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>New Task</div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: T.textPrimary }}>Create task</div>
          </div>
          <button onClick={onClose} style={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, cursor: "pointer", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: T.textSecondary }}>×</button>
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Project</label>
            <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} style={fieldStyle(false)}>
              {activeProjects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Task title <span style={{ color: T.red }}>*</span></label>
            <input
              value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="What needs to be done?"
              style={fieldStyle(!!errors.title)}
              onFocus={e => e.target.style.borderColor = T.borderFocus}
              onBlur={e => e.target.style.borderColor = errors.title ? T.red : T.border}
            />
            {errors.title && <div style={{ fontSize: "0.7rem", color: T.red, marginTop: 4 }}>{errors.title}</div>}
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Add context or notes..." rows={3}
              style={{ ...fieldStyle(false), resize: "none" }}
              onFocus={e => e.target.style.borderColor = T.borderFocus}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} style={fieldStyle(false)}>
                {["Low", "Medium", "High", "Critical"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Deadline <span style={{ color: T.red }}>*</span></label>
              <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)}
                style={{ ...fieldStyle(!!errors.deadline), colorScheme: "light" }}
                onFocus={e => e.target.style.borderColor = T.borderFocus}
                onBlur={e => e.target.style.borderColor = errors.deadline ? T.red : T.border}
              />
              {errors.deadline && <div style={{ fontSize: "0.7rem", color: T.red, marginTop: 4 }}>{errors.deadline}</div>}
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <IconBtn onClick={onClose}>Cancel</IconBtn>
          <button onClick={handleSubmit} disabled={saving} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 20px", borderRadius: T.radiusSm,
            background: T.accent, border: "none",
            color: "#FFF", fontSize: "0.82rem", fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1,
          }}>
            {saving && <Spinner color="#FFF" />}
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
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bgCard, border: `1px solid ${T.borderMed}`,
        borderRadius: T.radius, width: 480, maxHeight: "88vh",
        display: "flex", flexDirection: "column", boxShadow: T.shadowLg, fontFamily: T.font,
      }}>
        {/* Colored priority stripe */}
        <div style={{ height: 3, background: cfg.ring, borderRadius: "10px 10px 0 0" }} />

        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                padding: "2px 8px", borderRadius: T.radiusSm,
                background: cfg.bg, color: cfg.color,
                fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em",
              }}>
                {cfg.dot} {task.priority}
              </span>
              {task.deadline && (
                <span style={{
                  padding: "2px 8px", borderRadius: T.radiusSm,
                  background: T.bgElevated, border: `1px solid ${T.border}`,
                  fontSize: "0.68rem",
                }}>
                  <DeadlineLabel deadline={task.deadline} />
                </span>
              )}
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: T.textPrimary, lineHeight: 1.4 }}>{task.title}</div>
            <div style={{ fontSize: "0.75rem", color: T.textMuted, marginTop: 4 }}>
              <span style={{ color: T.textSecondary }}>{projectName}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, cursor: "pointer", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: T.textSecondary }}>×</button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {task.description ? (
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Description</div>
              <div style={{
                fontSize: "0.85rem", color: T.textSecondary, lineHeight: 1.7,
                background: T.bgElevated, padding: "14px 16px",
                borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
              }}>
                {task.description}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0", color: T.textMuted, fontSize: "0.82rem" }}>
              No description provided.
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <IconBtn onClick={onClose}>Close</IconBtn>
          <button onClick={handleComplete} disabled={completing} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 20px", borderRadius: T.radiusSm,
            background: T.greenDim, border: `1px solid ${T.green}30`,
            color: T.greenText, fontSize: "0.82rem", fontWeight: 600,
            cursor: completing ? "not-allowed" : "pointer",
          }}>
            {completing && <Spinner color={T.greenText} />}
            {completing ? "Marking done…" : "Mark as done"}
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
  const [hovered, setHovered] = useState(false);

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
        onClick={() => onTaskClick(task, projectId, projectName)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "12px 14px",
          borderRadius: T.radiusSm,
          cursor: "pointer",
          background: hovered ? T.bgHover : T.bgCard,
          border: `1px solid ${hovered ? T.borderMed : T.border}`,
          borderLeft: ustyle?.borderLeft || `3px solid ${T.border}`,
          marginBottom: 6,
          transition: "all 0.12s",
          position: "relative",
          boxShadow: T.shadow,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {/* Priority indicator */}
          <div style={{ paddingTop: 2, flexShrink: 0 }}>
            <span style={{ fontSize: "0.6rem", color: cfg.color }}>{cfg.dot}</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title */}
            <div style={{
              fontSize: "0.82rem", fontWeight: 500, color: T.textPrimary,
              marginBottom: 3, lineHeight: 1.4,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {task.title}
            </div>

            {/* Project name */}
            <div style={{
              fontSize: "0.68rem", color: T.textMuted, marginBottom: 8,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {projectName}
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {task.deadline && <DeadlineLabel deadline={task.deadline} />}
                {urgency && urgency !== "low" && ustyle.label && (
                  <span style={{
                    fontSize: "0.58rem", fontWeight: 700, padding: "1px 5px",
                    borderRadius: T.radiusXs, background: ustyle.labelBg,
                    color: ustyle.labelColor, textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {urgency === "overdue" ? "OVERDUE" : "URGENT"}
                  </span>
                )}
              </div>
            </div>

            {/* Actions row */}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <IconBtn onClick={handleComplete} disabled={completing} variant="success">
                {completing && <Spinner size={8} color={T.greenText} />}
                Done
              </IconBtn>
              <IconBtn onClick={e => { e.stopPropagation(); setCommentOpen(true); }}>
                Comment
              </IconBtn>
              <IconBtn
                onClick={e => { e.stopPropagation(); onOpenKanban(projectId); }}
                disabled={isKanbanLoading}
                variant="accent"
                style={{ marginLeft: "auto" }}
              >
                {isKanbanLoading ? <Spinner size={8} color={T.accentText} /> : null}
                Board
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
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      marginBottom: 8,
      overflow: "hidden",
      transition: "border-color 0.12s",
      opacity: closed ? 0.65 : 1,
      boxShadow: T.shadow,
    }}>
      {/* Row header */}
      <div
        style={{
          padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
          cursor: "pointer",
          background: expanded ? T.bgElevated : "transparent",
          transition: "background 0.12s",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Folder icon */}
        <div style={{
          width: 34, height: 34, borderRadius: T.radiusSm,
          background: closed ? T.bgElevated : T.accentDim,
          border: `1px solid ${closed ? T.border : T.accent + "20"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.85rem", flexShrink: 0,
        }}>
          {closed ? "🔒" : "📁"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{
              fontSize: "0.875rem", fontWeight: 600,
              color: closed ? T.textSecondary : T.textPrimary,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: "240px",
            }}>
              {project.projectName}
            </span>
            <StatusPill status={project.status} />
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {(project.serviceType || []).map((s, i) => <ServiceTag key={i} label={s} />)}
            {project.subscriptionType && <SubTag label={project.subscriptionType} />}
          </div>
        </div>

        <span style={{
          color: T.textMuted, fontSize: "0.6rem",
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.15s",
        }}>▼</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${T.border}`,
          padding: "16px 18px",
          background: T.bgElevated,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Business niche</div>
              <div style={{ fontSize: "0.8rem", color: T.textSecondary }}>{project.businessNiche || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Reference site</div>
              {project.referenceSite ? (
                <a href={project.referenceSite} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.8rem", color: T.accentText, textDecoration: "none", fontFamily: T.fontMono }}>
                  {project.referenceSite.replace(/^https?:\/\//, "").slice(0, 30)}…
                </a>
              ) : <span style={{ fontSize: "0.8rem", color: T.textMuted }}>None</span>}
            </div>
          </div>

          {project.projectDetails && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Project details</div>
              <p style={{
                fontSize: "0.8rem", color: T.textSecondary, margin: 0, lineHeight: 1.65,
                background: T.bgCard, padding: "10px 14px",
                border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
              }}>
                {project.projectDetails}
              </p>
            </div>
          )}

          {!closed && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <IconBtn
                onClick={e => { e.stopPropagation(); onOpenKanban(project._id); }}
                disabled={isKanbanLoading}
              >
                {isKanbanLoading ? <Spinner size={8} /> : null}
                Open board
              </IconBtn>
              <IconBtn
                onClick={e => { e.stopPropagation(); onAddTaskTrigger(project._id); }}
                variant="accent"
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
  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 130 }}>
    <label style={{ fontSize: "0.6rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
      color: value ? T.textPrimary : T.textSecondary,
      fontSize: "0.78rem", padding: "6px 10px", outline: "none", fontFamily: T.font,
    }}>
      <option value="">All</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, onHide }) => {
  useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t); }, [onHide]);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 99999,
      background: T.bgCard, color: T.greenText,
      border: `1px solid ${T.green}40`,
      borderRadius: T.radius, padding: "10px 18px",
      fontSize: "0.82rem", fontWeight: 600, boxShadow: T.shadowMd,
      display: "flex", alignItems: "center", gap: 8,
      fontFamily: T.font,
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: "50%",
        background: T.greenDim, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.65rem", color: T.greenText,
      }}>✓</span>
      {message}
    </div>
  );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{
    padding: "12px 14px", borderRadius: T.radiusSm,
    background: T.bgElevated, border: `1px solid ${T.border}`,
    borderLeft: `3px solid ${T.border}`, marginBottom: 6,
  }}>
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.bgHover, marginTop: 4 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 11, background: T.bgHover, borderRadius: T.radiusXs, width: "72%", marginBottom: 6 }} />
        <div style={{ height: 9, background: T.bgHover, borderRadius: T.radiusXs, width: "42%", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ height: 20, width: 44, background: T.bgHover, borderRadius: T.radiusSm }} />
          <div style={{ height: 20, width: 56, background: T.bgHover, borderRadius: T.radiusSm }} />
        </div>
      </div>
    </div>
  </div>
);

// ── Tab Button ────────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "7px 14px", borderRadius: T.radiusSm, border: "none",
    background: active ? T.accentDim : "transparent",
    color: active ? T.accentText : T.textSecondary,
    fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
    transition: "all 0.12s", fontFamily: T.font,
    borderBottom: active ? `2px solid ${T.accent}` : "2px solid transparent",
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

  const filteredProjects = useMemo(() => projects.filter(p => {
    const s = search.toLowerCase();
    return (
      (!search || p.projectName?.toLowerCase().includes(s) || p.clientName?.toLowerCase().includes(s)) &&
      (!filterCreatedBy || p.createdBy === filterCreatedBy) &&
      (!filterSub || p.subscriptionType === filterSub) &&
      (!filterService || (p.serviceType || []).includes(filterService)) &&
      (!filterStatus || p.status === filterStatus)
    );
  }), [projects, search, filterCreatedBy, filterSub, filterService, filterStatus]);

  const createdByOptions = [...new Set(projects.map(p => p.createdBy).filter(Boolean))];
  const subOptions = [...new Set(projects.map(p => p.subscriptionType).filter(Boolean))];
  const serviceOptions = [...new Set(projects.flatMap(p => p.serviceType || []))];

  // Task urgency summary for sidebar header
  const overdueCount = allPendingTasks.filter(t => getUrgency(t.deadline) === "overdue").length;
  const urgentCount = allPendingTasks.filter(t => ["critical", "high"].includes(getUrgency(t.deadline))).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
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

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.borderMed}; }

        input[type="date"]::-webkit-calendar-picker-indicator { filter: none; opacity: 0.6; }

        select option { background: ${T.bgCard}; color: ${T.textPrimary}; }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 60px)", background: T.bg,
        fontFamily: T.font, color: T.textPrimary, overflow: "hidden",
      }}>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── LEFT: Main Workspace ── */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            background: T.bg, borderRight: `1px solid ${T.border}`,
            overflow: "hidden", minWidth: 0,
          }}>

            {/* Top Bar */}
            <div style={{
              padding: "0 24px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0, background: T.bgCard, height: 52,
            }}>
              <div style={{ display: "flex", gap: 4 }}>
                <TabBtn active={activeTab === "projects"} onClick={() => setActiveTab("projects")}>
                  Projects <span style={{
                    marginLeft: 5, padding: "1px 6px", borderRadius: "10px",
                    background: T.bgElevated, color: T.textMuted,
                    fontSize: "0.65rem", fontWeight: 600,
                  }}>{filteredProjects.length}</span>
                </TabBtn>
                <TabBtn active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>
                  History <span style={{
                    marginLeft: 5, padding: "1px 6px", borderRadius: "10px",
                    background: T.bgElevated, color: T.textMuted,
                    fontSize: "0.65rem", fontWeight: 600,
                  }}>{completions.length}</span>
                </TabBtn>
              </div>

              <button
                onClick={() => { setQuickAddInitialProject(""); setQuickAddModalOpen(true); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: T.radiusSm,
                  background: T.accent, border: "none", color: "#FFF",
                  fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.accentHover}
                onMouseLeave={e => e.currentTarget.style.background = T.accent}
              >
                <span style={{ fontSize: "0.8rem" }}>+</span> New task
              </button>
            </div>

            {/* Content area */}
            {loadingInitial ? (
              <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.textMuted, fontSize: "0.82rem" }}>
                  <Spinner size={14} color={T.accent} />
                  Loading workspace…
                </div>
              </div>
            ) : activeTab === "projects" ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Filter bar */}
                <div style={{
                  padding: "10px 24px",
                  borderBottom: `1px solid ${T.border}`,
                  background: T.bgCard,
                  display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 }}>
                    <label style={{ fontSize: "0.6rem", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Search</label>
                    <input
                      value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Project name or client…"
                      style={{
                        background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
                        color: T.textPrimary, fontSize: "0.78rem", padding: "6px 10px", outline: "none",
                        fontFamily: T.font,
                      }}
                      onFocus={e => e.target.style.borderColor = T.borderFocus}
                      onBlur={e => e.target.style.borderColor = T.border}
                    />
                  </div>
                  <FilterSelect label="Created by" value={filterCreatedBy} onChange={setFilterCreatedBy} options={createdByOptions} />
                  <FilterSelect label="Subscription" value={filterSub} onChange={setFilterSub} options={subOptions} />
                  <FilterSelect label="Service" value={filterService} onChange={setFilterService} options={serviceOptions} />
                  <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={["Active", "Closed"]} />
                  {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
                    <button
                      onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }}
                      style={{
                        alignSelf: "flex-end", padding: "6px 10px", borderRadius: T.radiusSm,
                        background: "none", border: `1px solid ${T.border}`, color: T.textMuted,
                        fontSize: "0.72rem", cursor: "pointer", fontFamily: T.font,
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Projects list */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }} className="fade-in">
                  {filteredProjects.length === 0 ? (
                    <div style={{ textAlign: "center", paddingTop: 60, color: T.textMuted }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: 8, opacity: 0.5 }}>📂</div>
                      <div style={{ fontSize: "0.85rem" }}>No projects match your filters.</div>
                      <div style={{ fontSize: "0.75rem", marginTop: 4, color: T.textDisabled }}>Try adjusting or clearing your search.</div>
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
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }} className="fade-in">
                {completions.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 60, color: T.textMuted }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: 8, opacity: 0.5 }}>✓</div>
                    <div style={{ fontSize: "0.85rem" }}>No completed tasks yet.</div>
                    <div style={{ fontSize: "0.75rem", marginTop: 4, color: T.textDisabled }}>Tasks you complete will appear here.</div>
                  </div>
                ) : (
                  Object.entries(groupedCompletedTasks).map(([groupName, items]) => {
                    if (items.length === 0) return null;
                    return (
                      <div key={groupName} style={{ marginBottom: 28 }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                        }}>
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            {groupName}
                          </span>
                          <span style={{ padding: "1px 6px", borderRadius: "10px", background: T.bgElevated, color: T.textMuted, fontSize: "0.62rem", fontWeight: 600 }}>
                            {items.length}
                          </span>
                          <div style={{ flex: 1, height: "1px", background: T.border }} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {items.map((item, idx) => (
                            <div key={idx} style={{
                              display: "flex", alignItems: "center", gap: 12,
                              padding: "11px 14px", background: T.bgCard,
                              border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
                              boxShadow: T.shadow,
                            }}>
                              <span style={{
                                width: 20, height: 20, borderRadius: "50%",
                                background: T.greenDim, display: "flex",
                                alignItems: "center", justifyContent: "center",
                                fontSize: "0.6rem", color: T.greenText, flexShrink: 0,
                              }}>✓</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.82rem", fontWeight: 500, color: T.textPrimary, marginBottom: 2 }}>{item.taskTitle}</div>
                                <div style={{ fontSize: "0.7rem", color: T.textMuted }}>{item.projectName}</div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: "0.68rem", color: T.textMuted }}>by {item.completedBy?.username}</div>
                                {item.completedAt && (
                                  <div style={{ fontSize: "0.65rem", color: T.textDisabled, marginTop: 2, fontFamily: T.fontMono }}>
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
            width: 340, minWidth: 340, maxWidth: 340,
            background: T.bgCard, display: "flex", flexDirection: "column",
            overflow: "hidden", borderLeft: `1px solid ${T.border}`,
          }}>
            {/* Sidebar header */}
            <div style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${T.border}`,
              flexShrink: 0,
              background: T.bgCard,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: T.textPrimary, marginBottom: 3 }}>My tasks</div>
                  <div style={{ fontSize: "0.7rem", color: T.textMuted }}>
                    {loadingInitial ? "Syncing…" : `${allPendingTasks.length} pending`}
                  </div>
                </div>
                {!loadingInitial && (overdueCount > 0 || urgentCount > 0) && (
                  <div style={{ display: "flex", gap: 4 }}>
                    {overdueCount > 0 && (
                      <span style={{ padding: "2px 7px", borderRadius: "10px", background: T.redDim, color: T.red, fontSize: "0.65rem", fontWeight: 700, border: `1px solid ${T.red}40` }}>
                        {overdueCount} overdue
                      </span>
                    )}
                    {urgentCount > 0 && (
                      <span style={{ padding: "2px 7px", borderRadius: "10px", background: T.orangeDim, color: T.orange, fontSize: "0.65rem", fontWeight: 700, border: `1px solid ${T.orange}40` }}>
                        {urgentCount} urgent
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar task list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
              {loadingInitial ? (
                <div className="skeleton-pulse">
                  {[1, 2, 3].map(v => <SkeletonCard key={v} />)}
                </div>
              ) : allPendingTasks.length === 0 ? (
                <div style={{ textAlign: "center", paddingTop: 50, color: T.textMuted }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 8, opacity: 0.4 }}>✓</div>
                  <div style={{ fontSize: "0.82rem" }}>All caught up!</div>
                  <div style={{ fontSize: "0.72rem", marginTop: 4, color: T.textDisabled }}>No pending tasks.</div>
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

      {/* ── Kanban overlay ── */}
      {kanbanProject && (
        <Suspense fallback={
          <div style={{
            position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)",
            zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}>
            <div style={{
              background: T.bgCard, padding: "20px 28px", borderRadius: T.radius,
              border: `1px solid ${T.borderMed}`, boxShadow: T.shadowLg,
              fontFamily: T.font, display: "flex", alignItems: "center", gap: 10,
            }}>
              <Spinner size={14} color={T.accent} />
              <span style={{ fontSize: "0.85rem", fontWeight: 500, color: T.textSecondary }}>Loading board…</span>
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