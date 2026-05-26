// import React, { useState, useEffect, useCallback, useMemo } from "react";
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
//         onClick={() => onTaskClick(task, projectId, projectName)}
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
//         ::-webkit-scrollbar { width: 8px; height: 8px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: #C1C7CD; border-radius: 4px; }
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

//         <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

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

//             <div style={{
//               display: "flex", gap: 20, padding: 24, overflowX: "auto", overflowY: "hidden",
//               flex: 1, alignItems: "flex-start", scrollBehavior: "smooth"
//             }}>
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
//                       width: 340, minWidth: 340, maxWidth: 340, // Stricter widths so boards are uniform sizes
//                       maxHeight: "100%",
//                       background: T.bgSidebar, border: `1px solid ${T.border}`,
//                       borderRadius: T.radius, display: "flex", flexDirection: "column",
//                       boxShadow: T.shadow
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
//                         overflowY: "auto", // Keeps height flexible but scrollable if hitting maxHeight
//                         flexShrink: 1,
//                         display: "flex", flexDirection: "column", gap: 10
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


























import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { differenceInCalendarDays, format } from "date-fns";
import ProjectKanban from "../Admin Pages/Components/Projectkanban";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Design tokens (Blue Theme) ─────────────────────────────────────────────────
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
  closedBg: "#F8F9FA",
  closedBorder: "#D0D7DE",
  closedText: "#656D76",
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
    bg: "linear-gradient(135deg, #FFF0F0 0%, #FFDCE0 100%)",
    border: "#A40E26",
    borderLeft: "4px solid #A40E26",
    glow: "0 0 0 1px #A40E2640, 0 4px 16px rgba(164,14,38,0.2)",
    labelColor: "#FFFFFF",
    labelBg: "#A40E26",
  },
  critical: {
    bg: "linear-gradient(135deg, #FFFDFD 0%, #FFEBE9 100%)",
    border: "#D1242F",
    borderLeft: "4px solid #D1242F",
    glow: "0 0 0 1px #D1242F20, 0 2px 10px rgba(209,36,47,0.1)",
    labelColor: "#D1242F",
    labelBg: "#FFEBE9",
  },
  high: {
    bg: "linear-gradient(135deg, #FFFBF0 0%, #FFF3D0 100%)",
    border: "#BF8700",
    borderLeft: "4px solid #BF8700",
    glow: "0 0 0 1px #BF870030, 0 2px 8px rgba(191,135,0,0.12)",
    labelColor: "#BF8700",
    labelBg: "#FFF8C5",
  },
  medium: {
    bg: "linear-gradient(135deg, #FAFBFF 0%, #F0F4FF 100%)",
    border: "#0969DA",
    borderLeft: "4px solid #0969DA40",
    glow: "0 0 0 1px #0969DA20",
    labelColor: "#0969DA",
    labelBg: "#DDF4FF",
  },
  low: {
    bg: "#FFFFFF",
    border: T.border,
    borderLeft: `4px solid ${T.border}`,
    glow: T.shadow,
    labelColor: T.textSecondary,
    labelBg: T.grayBg,
  },
};

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const avatar = (name = "?") => name.charAt(0).toUpperCase();
const avatarColor = (s) => {
  const palette = ["#0969DA", "#1A7F37", "#D1242F", "#8250DF", "#BF8700", "#0349B6"];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
};

const stopDragEvent = (e) => e.stopPropagation();
const todayStr = () => format(new Date(), "yyyy-MM-dd");

const ServiceTag = ({ label, closed }) => (
  <span style={{
    display: "inline-block", padding: "2px 8px", borderRadius: "20px",
    fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.03em",
    background: closed ? T.grayBg : T.accentDim,
    color: closed ? T.textDisabled : T.accent,
    border: `1px solid ${closed ? T.border : T.accent}30`,
    whiteSpace: "nowrap",
  }}>{label}</span>
);

const SubTag = ({ label, closed }) => (
  <span style={{
    display: "inline-block", padding: "2px 8px", borderRadius: "20px",
    fontSize: "0.68rem", fontWeight: 600,
    background: closed ? T.grayBg : T.blueBg,
    color: closed ? T.textDisabled : T.blue,
    border: `1px solid ${closed ? T.border : T.blue}30`,
    whiteSpace: "nowrap",
  }}>{label}</span>
);

const StatusPill = ({ status }) => {
  const isActive = status === "Active";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700,
      letterSpacing: "0.05em",
      background: isActive ? T.greenBg : T.grayBg,
      color: isActive ? T.green : T.textDisabled,
      border: `1px solid ${isActive ? T.green : T.border}40`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: isActive ? T.green : T.textDisabled, display: "inline-block"
      }} />
      {status}
    </span>
  );
};

const DeadlineLabel = ({ deadline }) => {
  if (!deadline) return null;
  const diff = differenceInCalendarDays(new Date(deadline), new Date());
  const overdue = diff < 0;
  const critical = !overdue && diff <= 1;
  const soon = !overdue && !critical && diff <= 3;
  return (
    <span style={{
      fontSize: "0.7rem", fontWeight: 600,
      color: overdue ? "#A40E26" : critical ? T.red : soon ? T.orange : T.textSecondary,
    }}>
      {overdue
        ? `${Math.abs(diff)}d overdue`
        : diff === 0 ? "Due today"
          : diff === 1 ? "Due tomorrow"
            : `Due in ${diff}d`}
    </span>
  );
};

// ── Comment Modal ─────────────────────────────────────────────────────────────
const CommentModal = ({ task, projectId, currentUserId, onClose }) => {
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
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: T.radius, padding: "20px", width: 360,
        boxShadow: T.shadowMd, fontFamily: T.font,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{
              fontSize: "0.7rem", color: T.textDisabled, textTransform: "uppercase",
              letterSpacing: "0.06em", marginBottom: 3
            }}>Add Comment</div>
            <div style={{
              fontSize: "0.875rem", fontWeight: 700, color: T.textPrimary,
              lineHeight: 1.3, maxWidth: 260
            }}>{task.title}</div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "1.1rem", color: T.textDisabled, padding: "0 4px", lineHeight: 1
          }}>×</button>
        </div>
        {posted ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: T.green, fontWeight: 600, fontSize: "0.875rem" }}>
            ✓ Comment posted!
          </div>
        ) : (
          <>
            <textarea
              autoFocus value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder="Write your comment… (Enter to send)" rows={3}
              style={{
                width: "100%", resize: "vertical", background: T.bgInput,
                border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
                color: T.textPrimary, fontSize: "0.82rem", padding: "8px 10px",
                outline: "none", fontFamily: T.font, lineHeight: 1.5,
              }}
              onFocus={e => e.target.style.borderColor = T.borderFocus}
              onBlur={e => e.target.style.borderColor = T.border}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
              <button onClick={onClose} style={{
                padding: "6px 14px", borderRadius: T.radiusSm,
                background: "none", border: `1px solid ${T.border}`,
                color: T.textSecondary, fontSize: "0.78rem", cursor: "pointer", fontFamily: T.font,
              }}>Cancel</button>
              <button onClick={submit} disabled={!text.trim() || posting} style={{
                padding: "6px 14px", borderRadius: T.radiusSm,
                background: text.trim() ? T.accent : T.grayBg, border: "none",
                color: text.trim() ? "#FFF" : T.textDisabled,
                fontSize: "0.78rem", fontWeight: 600,
                cursor: text.trim() ? "pointer" : "not-allowed",
                fontFamily: T.font, transition: "background 0.15s",
              }}>
                {posting ? "Posting…" : "Post"}
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

  const canAssignToOthers = isAdmin || isCreator;

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    deadline: "",
    assignedTo: { id: currentUserId, username: currentUsername },
    links: [],
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  useEffect(() => {
    setForm(p => ({ ...p, assignedTo: { id: currentUserId, username: currentUsername } }));
  }, [selectedProjectId, currentUserId, currentUsername]);

  if (activeProjects.length === 0) {
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.bgCard, padding: 24, borderRadius: T.radius, textAlign: "center", boxShadow: T.shadowMd, fontFamily: T.font }}>
          <div style={{ fontSize: "1.2rem", marginBottom: 12 }}>🚫</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>No Active Projects</div>
          <div style={{ fontSize: "0.8rem", color: T.textSecondary, marginBottom: 16 }}>You must be assigned to an active project to create tasks.</div>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: T.radiusSm, background: T.bgInput, border: `1px solid ${T.border}`, cursor: "pointer", fontFamily: T.font }}>Close</button>
        </div>
      </div>
    );
  }

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  };

  const addLink = () => {
    if (linkInput.trim()) { set("links", [...form.links, linkInput.trim()]); setLinkInput(""); }
  };
  const removeLink = (i) => set("links", form.links.filter((_, idx) => idx !== i));

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

      const newTask = res.data?.task || res.data || {
        ...form,
        _id: Math.random().toString(),
        status: "Todo",
        createdAt: new Date().toISOString()
      };

      onSuccess?.(newTask, selectedProjectId);
      onClose();
    } catch (err) {
      console.error("Global add task error:", err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%", padding: "7px 10px", borderRadius: T.radiusSm,
    border: `1px solid ${hasError ? T.red : T.border}`,
    background: T.bgInput, color: T.textPrimary,
    fontSize: "0.82rem", fontFamily: T.font, outline: "none",
    boxSizing: "border-box",
  });

  const labelStyle = {
    display: "block", fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5,
  };

  const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: T.radius, width: 480, maxHeight: "85vh",
        display: "flex", flexDirection: "column",
        boxShadow: T.shadowMd, fontFamily: T.font,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>Create New Task</div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "1.2rem", color: T.textDisabled, lineHeight: 1, padding: "2px 6px",
          }}>×</button>
        </div>

        <div style={{ padding: "18px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Project <span style={{ color: T.red }}>*</span></label>
            <select
              value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}
              style={{
                ...inputStyle(false), appearance: "none",
                backgroundImage: selectChevron,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
              }}
            >
              {activeProjects.map(p => (
                <option key={p._id} value={p._id}>{p.projectName}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Title <span style={{ color: T.red }}>*</span></label>
            <input
              autoFocus value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="What needs to be done?" style={inputStyle(!!errors.title)}
              onFocus={e => e.target.style.borderColor = errors.title ? T.red : T.borderFocus}
              onBlur={e => e.target.style.borderColor = errors.title ? T.red : T.border}
            />
            {errors.title && <div style={{ fontSize: "0.68rem", color: T.red, marginTop: 4 }}>{errors.title}</div>}
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Add details, context, or acceptance criteria..." rows={3}
              style={{ ...inputStyle(false), resize: "vertical", lineHeight: 1.5 }}
              onFocus={e => e.target.style.borderColor = T.borderFocus}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority</label>
              <select
                value={form.priority} onChange={e => set("priority", e.target.value)}
                style={{
                  ...inputStyle(false), appearance: "none",
                  backgroundImage: selectChevron,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
                }}
              >
                {["Low", "Medium", "High", "Critical"].map(p => (
                  <option key={p} value={p}>{{ Low: "↓ Low", Medium: "→ Medium", High: "↑ High", Critical: "⚑ Critical" }[p]}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Deadline <span style={{ color: T.red }}>*</span></label>
              <input
                type="date" value={form.deadline} min={todayStr()}
                onChange={e => set("deadline", e.target.value)} style={inputStyle(!!errors.deadline)}
                onFocus={e => e.target.style.borderColor = errors.deadline ? T.red : T.borderFocus}
                onBlur={e => e.target.style.borderColor = errors.deadline ? T.red : T.border}
              />
              {errors.deadline && <div style={{ fontSize: "0.68rem", color: T.red, marginTop: 4 }}>{errors.deadline}</div>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Assign To</label>
            <select
              value={form.assignedTo?.id || ""} disabled={!canAssignToOthers}
              onChange={e => { const dev = developers.find(d => d.id === e.target.value); if (dev) set("assignedTo", dev); }}
              style={{
                ...inputStyle(false), appearance: "none",
                backgroundImage: selectChevron, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
                opacity: !canAssignToOthers ? 0.6 : 1,
              }}
            >
              {(canAssignToOthers ? developers : developers.filter(d => d.id === currentUserId)).map(dev => (
                <option key={dev.id} value={dev.id}>{dev.username}{dev.id === currentUserId ? " (you)" : ""}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{
          padding: "14px 20px", borderTop: `1px solid ${T.border}`,
          display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            padding: "7px 16px", borderRadius: T.radiusSm,
            background: "none", border: `1px solid ${T.border}`,
            color: T.textSecondary, fontSize: "0.82rem", cursor: "pointer", fontFamily: T.font,
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            padding: "7px 18px", borderRadius: T.radiusSm,
            background: saving ? T.grayBg : T.accent, border: "none",
            color: saving ? T.textDisabled : "#FFF",
            fontSize: "0.82rem", fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: T.font, transition: "background 0.15s",
          }}>
            {saving ? "Creating…" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Task Details Modal ────────────────────────────────────────────────────────
const SidebarTaskDetailModal = ({ task, projectId, projectName, currentUserId, onClose, onTaskComplete }) => {
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
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: T.radius, width: 500, maxHeight: "85vh",
        display: "flex", flexDirection: "column",
        boxShadow: T.shadowMd, fontFamily: T.font,
      }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Task Details</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: T.textPrimary, lineHeight: 1.3 }}>{task.title}</div>
            <div style={{ fontSize: "0.8rem", color: T.textSecondary, marginTop: 4 }}>Project: <strong style={{ color: T.textPrimary }}>{projectName}</strong></div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: T.textDisabled }}>×</button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: cfg.bg, color: cfg.color, borderRadius: T.radiusSm, fontSize: "0.78rem", fontWeight: 700 }}>
              <span>{cfg.dot}</span> {task.priority} Priority
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: "0.78rem" }}>
              <span style={{ fontWeight: 700, color: T.textSecondary }}>Status:</span>
              <span style={{ color: task.status === "In Progress" ? T.blue : T.textPrimary, fontWeight: 700 }}>{task.status}</span>
            </div>
            {task.deadline && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: "0.78rem" }}>
                <span style={{ fontWeight: 700, color: T.textSecondary }}>Deadline:</span>
                <DeadlineLabel deadline={task.deadline} />
              </div>
            )}
          </div>

          {task.description && (
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Description</div>
              <div style={{ fontSize: "0.85rem", color: T.textSecondary, lineHeight: 1.6, background: T.bgInput, padding: "12px 16px", borderRadius: T.radiusSm, border: `1px solid ${T.border}`, whiteSpace: "pre-wrap" }}>
                {task.description}
              </div>
            </div>
          )}

          {task.links?.length > 0 && (
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {task.links.map((lnk, i) => (
                  <a key={i} href={lnk} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: T.blue, textDecoration: "none", wordBreak: "break-all" }}>🔗 {lnk}</a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: T.radiusSm, background: "none", border: `1px solid ${T.border}`, color: T.textSecondary, fontSize: "0.85rem", cursor: "pointer", fontFamily: T.font }}>Close</button>
          <button onClick={handleComplete} disabled={completing} style={{ padding: "8px 20px", borderRadius: T.radiusSm, background: completing ? T.grayBg : T.green, border: "none", color: completing ? T.textDisabled : "#FFF", fontSize: "0.85rem", fontWeight: 700, cursor: completing ? "not-allowed" : "pointer", fontFamily: T.font, transition: "background 0.15s" }}>
            {completing ? "Completing…" : "Mark As Done"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Generic Task Card (Used in Boards and Sidebar) ────────────────────────────
const TaskCard = ({ task, projectId, projectName, currentUserId, onTaskComplete, onTaskClick }) => {
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
      console.error("Complete error:", err);
      setCompleting(false);
    }
  };

  const cardBg = ustyle?.bg || T.bgCard;
  const cardBorder = ustyle ? `1px solid ${ustyle.border}` : `1px solid ${T.border}`;
  const cardShadow = ustyle?.glow || T.shadow;
  const borderLeft = ustyle?.borderLeft || "4px solid transparent";

  return (
    <>
      <div
        className={`sidebar-task${urgency === "overdue" ? " sidebar-task--overdue" : ""}`}
        onClick={(e) => {
          // If we drag, don't trigger click
          if (e.defaultPrevented) return;
          onTaskClick(task, projectId, projectName);
        }}
        style={{
          padding: "10px 12px", borderRadius: T.radiusSm, cursor: "pointer",
          background: cardBg, border: cardBorder, borderLeft,
          marginBottom: 8, boxShadow: cardShadow,
          transition: "box-shadow 0.2s, border-color 0.2s, transform 0.15s",
          position: "relative", overflow: "hidden",
        }}
      >
        {(urgency === "overdue" || urgency === "critical") && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: urgency === "overdue"
              ? "linear-gradient(90deg, #A40E26, #FF4D4D, #A40E26)"
              : "linear-gradient(90deg, #D1242F, #FF6B6B, #D1242F)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }} />
        )}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: "0.65rem", color: cfg.color, marginTop: 2, flexShrink: 0 }}>{cfg.dot}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "0.8rem", fontWeight: 600, color: T.textPrimary,
              lineHeight: 1.4, marginBottom: 4,
              wordBreak: "break-word"
            }}>{task.title}</div>

            <div style={{
              fontSize: "0.7rem", color: T.textSecondary, marginBottom: 6,
              wordBreak: "break-word"
            }}>{projectName}</div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {task.deadline && <DeadlineLabel deadline={task.deadline} />}
              {urgency && urgency !== "low" && (
                <span style={{
                  fontSize: "0.58rem", fontWeight: 800, padding: "1px 5px", borderRadius: "3px",
                  background: ustyle.labelBg, color: ustyle.labelColor,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {urgency === "overdue" ? "🚨 OVERDUE" : urgency === "critical" ? "🔥 URGENT" : urgency === "high" ? "⚠ SOON" : "SOON"}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button onClick={handleComplete} disabled={completing} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 9px", borderRadius: "4px",
                background: completing ? T.grayBg : T.greenBg,
                border: `1px solid ${completing ? T.border : T.green}40`,
                color: completing ? T.textDisabled : T.green,
                fontSize: "0.68rem", fontWeight: 700,
                cursor: completing ? "not-allowed" : "pointer",
                fontFamily: T.font, transition: "background 0.15s, color 0.15s",
                whiteSpace: "nowrap",
              }}
                onMouseEnter={e => { if (!completing) { e.currentTarget.style.background = T.green; e.currentTarget.style.color = "#FFF"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = completing ? T.grayBg : T.greenBg; e.currentTarget.style.color = completing ? T.textDisabled : T.green; }}
              >{completing ? "…" : "Mark As Done"}</button>
              <button onClick={e => { e.stopPropagation(); setCommentOpen(true); }} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 9px", borderRadius: "4px",
                background: T.bgInput, border: `1px solid ${T.border}`,
                color: T.textSecondary, fontSize: "0.68rem", fontWeight: 600,
                cursor: "pointer", fontFamily: T.font,
                transition: "border-color 0.15s, color 0.15s", whiteSpace: "nowrap",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.blue; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary; }}
              >Comment</button>
            </div>
          </div>
          <span style={{
            fontSize: "0.62rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px",
            background: task.status === "In Progress" ? T.blueBg : T.grayBg,
            color: task.status === "In Progress" ? T.blue : T.textSecondary,
            flexShrink: 0, alignSelf: "flex-start",
          }}>
            {task.status === "In Progress" ? "WIP" : "TODO"}
          </span>
        </div>
      </div>
      {commentOpen && (
        <CommentModal task={task} projectId={projectId} currentUserId={currentUserId} onClose={() => setCommentOpen(false)} />
      )}
    </>
  );
};

// ── Project Card (List View) ──────────────────────────────────────────────────
const ProjectCard = ({ project, onOpenKanban }) => {
  const closed = project.status === "Closed";
  const [expanded, setExpanded] = useState(false);
  const [completions, setCompletions] = useState([]);
  const [loadingComps, setLoadingComps] = useState(false);

  const handleToggleExpand = async (e) => {
    e.stopPropagation();
    if (!expanded && completions.length === 0) {
      setLoadingComps(true);
      try {
        const r = await axios.get(`${API_BASE}/api/tasks/${project._id}/completions`, { headers: authHeaders() });
        setCompletions(r.data || []);
      } catch (err) {
        console.error("Failed to load completions");
      }
      setLoadingComps(false);
    }
    setExpanded(!expanded);
  };

  return (
    <div
      className={`project-card ${closed ? "closed" : ""}`}
      style={{
        background: closed ? T.closedBg : T.bgCard,
        border: `1px solid ${closed ? T.closedBorder : T.border}`,
        borderRadius: T.radius, marginBottom: 12, overflow: "hidden",
        boxShadow: T.shadow, opacity: closed ? 0.75 : 1,
        position: "relative", zIndex: 1,
      }}
    >
      <div
        style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer" }}
        onClick={handleToggleExpand}
        onPointerDown={stopDragEvent}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: closed ? T.grayBg : T.accentDim,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: "1rem",
        }}>📁</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              fontSize: "0.9rem", fontWeight: 700,
              color: closed ? T.closedText : T.textPrimary, fontFamily: T.font
            }}>
              {project.projectName}
            </span>
            <StatusPill status={project.status} />
            {closed && <span style={{ fontSize: "0.68rem", color: T.textDisabled, fontStyle: "italic" }}>Read-only</span>}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {(project.serviceType || []).map((s, i) => <ServiceTag key={i} label={s} closed={closed} />)}
            <SubTag label={project.subscriptionType} closed={closed} />
          </div>
          <div style={{
            display: "flex", gap: 16, flexWrap: "wrap",
            fontSize: "0.75rem", color: closed ? T.textDisabled : T.textSecondary
          }}>
            <span>Created by <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.createdBy}</strong></span>
            {project.clientName && (
              <span>Client: <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.clientName}</strong></span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            fontSize: "0.75rem", color: T.textSecondary,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>▼</div>
        </div>
      </div>

      {expanded && (
        <div style={{
          borderTop: `1px solid ${T.border}`, padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {loadingComps ? (
            <div style={{ fontSize: "0.75rem", color: T.textSecondary }}>Loading history...</div>
          ) : completions.length > 0 && (
            <div>
              <div style={{
                fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8
              }}>Recent Completions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {completions.slice(0, 5).map((u, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 12px", background: T.bgInput,
                    borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
                  }}>
                    <span style={{ fontSize: "0.7rem", color: T.green }}>✔</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: closed ? T.textDisabled : T.textPrimary, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {u.taskTitle}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: T.textSecondary }}>
                      {u.completedBy?.username} {u.completedAt ? `· ${format(new Date(u.completedAt), "MMM d, yyyy")}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px 20px" }}>
            {[
              { label: "Business Niche", value: project.businessNiche },
              { label: "Client Website", value: project.referenceSite },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label}>
                <div style={{
                  fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3
                }}>{label}</div>
                <div style={{ fontSize: "0.8rem", color: closed ? T.textDisabled : T.textPrimary, wordBreak: "break-all" }}>
                  {label === "Client Website" ? (
                    <a href={value} target="_blank" rel="noopener noreferrer"
                      style={{ color: closed ? T.textDisabled : T.blue, textDecoration: "none" }}
                      onClick={e => e.stopPropagation()} onPointerDown={stopDragEvent}>{value}</a>
                  ) : value}
                </div>
              </div>
            ))}
          </div>

          {project.projectDetails && (
            <div>
              <div style={{
                fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4
              }}>Details</div>
              <div style={{
                fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
                lineHeight: 1.6, padding: "8px 12px", background: T.bgInput,
                borderRadius: T.radiusSm, border: `1px solid ${T.border}`
              }}>
                {project.projectDetails}
              </div>
            </div>
          )}

          {!closed && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
              <button type="button"
                onClick={(e) => { e.stopPropagation(); onOpenKanban(project); }}
                onPointerDown={stopDragEvent}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 16px", borderRadius: T.radiusSm,
                  fontSize: "0.8rem", fontWeight: 700, fontFamily: T.font,
                  background: T.accentDim, border: `1px solid ${T.accent}50`,
                  color: T.accent, cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#FFF"; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.accentDim; e.currentTarget.style.color = T.accent; }}
              >⬛ Open Kanban</button>
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
    <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} onPointerDown={stopDragEvent}
      style={{
        background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
        color: value ? T.textPrimary : T.textSecondary, fontSize: "0.8rem",
        padding: "6px 10px", outline: "none", fontFamily: T.font, appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
      }}
    >
      <option value="">All {label}</option>
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
      background: T.green, color: "#fff", borderRadius: T.radius,
      padding: "10px 18px", fontSize: "0.82rem", fontWeight: 600,
      fontFamily: T.font, boxShadow: T.shadowMd,
      animation: "fadeInUp 0.25s ease",
    }}>
      ✓ {message}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const DeveloperDashboard = () => {
  const [viewMode, setViewMode] = useState("boards");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [kanbanProject, setKanbanProject] = useState(null);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const [openingKanbanId, setOpeningKanbanId] = useState(null);

  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddInitialProject, setQuickAddInitialProject] = useState("");
  const [selectedSidebarTask, setSelectedSidebarTask] = useState(null);
  const [toast, setToast] = useState("");

  const [search, setSearch] = useState("");
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [projectVisibleCount, setProjectVisibleCount] = useState(10);

  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "Developer";

  // Drag to scroll References
  const scrollRef = useRef(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => { setProjectVisibleCount(10); }, [search, filterCreatedBy, filterSub, filterService, filterStatus]);

  const loadInitialData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingInitial(true);
    try {
      const r = await axios.get(`${API_BASE}/api/newproject/projects`, { headers: authHeaders() });
      const all = Array.isArray(r.data) ? r.data : [];
      const mine = all.filter(p =>
        (p.assignedDeveloper || []).some(
          d => d.id && currentUserId && d.id.toString() === currentUserId.toString()
        )
      );

      const tasksResult = {};
      await Promise.allSettled(mine.map(async (p) => {
        try {
          const tasksRes = await axios.get(`${API_BASE}/api/tasks/${p._id}`, { headers: authHeaders() });
          tasksResult[p._id] = (tasksRes.data || []).filter(
            t => t.status !== "Done" && t.assignedTo?.id?.toString() === currentUserId?.toString()
          );
        } catch {
          tasksResult[p._id] = [];
        }
      }));

      setTasks(tasksResult);
      setProjects(mine);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      if (!isSilent) setLoadingInitial(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleTaskComplete = useCallback((taskId, projectId) => {
    setTasks(prev => {
      const projectTasks = prev[projectId] || [];
      return {
        ...prev,
        [projectId]: projectTasks.filter(t => t._id !== taskId)
      };
    });
  }, []);

  const handleQuickAddSuccess = useCallback((newTask, projectId) => {
    setToast("Task created successfully!");
    setTasks(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newTask]
    }));
  }, []);

  const handleOpenKanban = useCallback((project) => {
    setOpeningKanbanId(project._id);
    setTimeout(() => {
      setKanbanProject(project);
      setKanbanOpen(true);
      setOpeningKanbanId(null);
    }, 450);
  }, []);

  // Drag Handlers
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    dragState.current.isDown = true;
    setIsGrabbing(true);
    dragState.current.startX = e.pageX - scrollRef.current.offsetLeft;
    dragState.current.scrollLeft = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    dragState.current.isDown = false;
    setIsGrabbing(false);
  };

  const handleMouseUp = () => {
    dragState.current.isDown = false;
    setIsGrabbing(false);
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.isDown || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5; // Scroll speed multiplier
    
    // If we've dragged a decent amount, prevent accidental clicks
    if (Math.abs(walk) > 5) {
      e.preventDefault(); 
    }
    
    scrollRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const activeCount = projects.filter(p => p.status === "Active").length;
  const closedCount = projects.filter(p => p.status === "Closed").length;

  const boardProjects = useMemo(() => {
    return projects.filter(p => p.status !== "Closed" && tasks[p._id]?.length > 0);
  }, [projects, tasks]);

  const filteredProjects = useMemo(() => projects.filter(p => {
    const matchSearch = !search || p.projectName.toLowerCase().includes(search.toLowerCase()) || p.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchCreatedBy = !filterCreatedBy || p.createdBy === filterCreatedBy;
    const matchSub = !filterSub || p.subscriptionType === filterSub;
    const matchService = !filterService || (p.serviceType || []).includes(filterService);
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchCreatedBy && matchSub && matchService && matchStatus;
  }), [projects, search, filterCreatedBy, filterSub, filterService, filterStatus]);

  const createdByOptions = [...new Set(projects.map(p => p.createdBy).filter(Boolean))];
  const subOptions = [...new Set(projects.map(p => p.subscriptionType).filter(Boolean))];
  const serviceOptions = [...new Set(projects.flatMap(p => p.serviceType || []))];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        
        /* Prominent Horizontal Scrollbar Setup */
        ::-webkit-scrollbar { width: 8px; height: 12px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #C1C7CD; border-radius: 6px; border: 2px solid ${T.bg}; }
        ::-webkit-scrollbar-thumb:hover { background: #A1A8AE; }
        
        input::placeholder, textarea::placeholder { color: ${T.textDisabled}; }
        
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(164,14,38,0.35); }
          50%       { box-shadow: 0 0 0 4px rgba(164,14,38,0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .sidebar-task--overdue { animation: urgentPulse 2.2s ease-in-out infinite; }
        .sidebar-task--overdue:hover { animation: none; }
        
        .project-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .project-card:not(.closed):hover {
          border-color: ${T.accent}50 !important;
          box-shadow: 0 0 0 1px ${T.accent}30, ${T.shadowMd} !important;
        }
        .sidebar-task { transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s; }
        .sidebar-task:hover { transform: translateY(-1px); border-color: ${T.blue}80 !important; }

        .btn-loading {
          opacity: 0.7;
          cursor: not-allowed !important;
          position: relative;
        }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column", height: "100vh", background: T.bg,
        fontFamily: T.font, color: T.textPrimary, overflow: "hidden", 
      }}>

        <div style={{
          padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 16,
          background: T.bgCard, flexShrink: 0, zIndex: 10, 
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: avatarColor(currentUsername),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.85rem", fontWeight: 800, color: "#FFF", flexShrink: 0,
          }}>{avatar(currentUsername)}</div>

          <div>
            <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginBottom: 1 }}>Developer Dashboard</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary }}>{currentUsername}</div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
            {[
              { label: "Active", val: activeCount, color: T.green },
              { label: "Closed", val: closedCount, color: T.textDisabled },
            ].map(({ label, val, color }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div style={{ width: 1, height: 28, background: T.border }} />}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.65rem", color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color }}>{val}</div>
                </div>
              </React.Fragment>
            ))}

            <div style={{ width: 1, height: 28, background: T.border, margin: "0 4px" }} />

            <button onClick={() => { setQuickAddInitialProject(""); setQuickAddModalOpen(true); }}
              style={{
                padding: "8px 16px", borderRadius: T.radiusSm,
                fontSize: "0.8rem", fontWeight: 700, fontFamily: T.font,
                background: T.accent, border: "none", color: "#FFF",
                cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap"
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.accentHover}
              onMouseLeave={e => e.currentTarget.style.background = T.accent}
            >+ Add Task</button>

            <button onClick={() => setViewMode(v => v === "boards" ? "list" : "boards")}
              style={{
                padding: "8px 16px", borderRadius: T.radiusSm,
                fontSize: "0.8rem", fontWeight: 700, fontFamily: T.font,
                background: T.bgInput, border: `1px solid ${T.border}`,
                color: T.textPrimary, cursor: "pointer", transition: "border 0.15s",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.borderFocus}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >
              {viewMode === "boards" ? "☰ View Full Projects" : "⏸ View Boards"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", width: "100%" }}>

          {loadingInitial ? (
            <div style={{ display: "flex", width: "100%", justifyContent: "center", paddingTop: 80 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: `3px solid ${T.border}`, borderTopColor: T.accent,
                  animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
                }} />
                <div style={{ fontSize: "0.85rem", color: T.textSecondary, fontWeight: 600 }}>Loading workspace...</div>
              </div>
            </div>
          ) : viewMode === "boards" ? (

            // ── CHANGED: Drag to scroll container ──
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              style={{
                display: "flex",
                flexWrap: "nowrap",
                gap: 20,
                padding: 24,
                overflowX: "auto",  
                overflowY: "auto",  
                width: "100%",      
                height: "100%",     
                alignItems: "flex-start", 
                // Adjust cursor based on state
                cursor: isGrabbing ? "grabbing" : "grab",
                // Prevent highlighting text while dragging
                userSelect: isGrabbing ? "none" : "auto", 
              }}
            >
              {boardProjects.length === 0 ? (
                <div style={{ width: "100%", textAlign: "center", paddingTop: 60, color: T.textSecondary }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⏸</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>No Pending Tasks</div>
                  <div style={{ fontSize: "0.85rem", maxWidth: 300, margin: "0 auto" }}>
                    There are currently no active tasks across your projects. Use the "Add Task" button to create one and initialize a board.
                  </div>
                </div>
              ) : (
                boardProjects.map(p => {
                  const projectTasks = tasks[p._id] || [];
                  return (
                    <div key={p._id} style={{
                      width: 340,
                      minWidth: 340,
                      maxWidth: 340,
                      flexShrink: 0,
                      background: T.bgSidebar,
                      border: `1px solid ${T.border}`,
                      borderRadius: T.radius,
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: T.shadow,
                    }}>
                      <div style={{
                        padding: "12px 16px", borderBottom: `1px solid ${T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: T.bgCard, borderRadius: `${T.radius} ${T.radius} 0 0`, flexShrink: 0
                      }}>
                        <div style={{ minWidth: 0, paddingRight: 8 }}>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary, wordBreak: "break-word" }}>
                            {p.projectName}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginTop: 2 }}>
                            {projectTasks.length} Pending {projectTasks.length === 1 ? "Task" : "Tasks"}
                          </div>
                        </div>
                        <button onClick={() => { setQuickAddInitialProject(p._id); setQuickAddModalOpen(true); }}
                          // Stop drag event so clicking the button doesn't start a drag
                          onMouseDown={stopDragEvent} 
                          style={{
                            width: 28, height: 28, borderRadius: "50%", background: T.accentDim,
                            border: `1px solid ${T.accent}30`, color: T.accent, fontSize: "1.1rem",
                            fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.15s", flexShrink: 0
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#FFF"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = T.accentDim; e.currentTarget.style.color = T.accent; }}
                          title="Add task to this project"
                        >+</button>
                      </div>

                      <div style={{
                        padding: "12px 10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}>
                        {projectTasks.map(t => (
                          <TaskCard
                            key={t._id} task={t} projectId={p._id} projectName={p.projectName}
                            currentUserId={currentUserId} onTaskComplete={handleTaskComplete}
                            onTaskClick={(task, pId, pName) => setSelectedSidebarTask({ task, projectId: pId, projectName: pName })}
                          />
                        ))}
                      </div>

                      <div style={{ padding: "10px", borderTop: `1px solid ${T.border}`, background: T.bgCard, borderRadius: `0 0 ${T.radius} ${T.radius}`, flexShrink: 0 }}>
                        <button
                          className={openingKanbanId === p._id ? "btn-loading" : ""}
                          onClick={() => handleOpenKanban(p)}
                          onMouseDown={stopDragEvent}
                          disabled={openingKanbanId === p._id}
                          style={{
                            width: "100%", padding: "8px", borderRadius: T.radiusSm,
                            background: "transparent", border: `1px solid ${T.border}`, color: T.textSecondary,
                            fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: T.font,
                            display: "flex", justifyContent: "center", alignItems: "center", gap: 6
                          }}
                        >
                          {openingKanbanId === p._id ? (
                            <><div style={{ width: 12, height: 12, border: `2px solid ${T.textSecondary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Loading...</>
                          ) : "⬛ Open Kanban"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          ) : (

            <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
              <div style={{
                padding: "12px 24px", borderBottom: `1px solid ${T.border}`,
                background: T.bgCard, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", flexShrink: 0
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px", minWidth: 180 }}>
                  <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>Search</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDisabled, fontSize: "0.8rem", pointerEvents: "none" }}>⌕</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Project name, client..."
                      style={{
                        width: "100%", background: T.bgInput, border: `1px solid ${T.border}`,
                        borderRadius: T.radiusSm, color: T.textPrimary, fontSize: "0.8rem",
                        padding: "6px 10px 6px 28px", outline: "none", fontFamily: T.font,
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
                {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
                  <button onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }}
                    style={{
                      padding: "6px 12px", alignSelf: "flex-end", borderRadius: T.radiusSm,
                      fontSize: "0.78rem", fontFamily: T.font, whiteSpace: "nowrap",
                      background: "transparent", border: `1px solid ${T.border}`, color: T.textSecondary, cursor: "pointer",
                    }}
                  >× Clear</button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {filteredProjects.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 60, color: T.textSecondary }}>
                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>📂</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>No projects match your filters</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: "0.75rem", color: T.textSecondary, marginBottom: 14 }}>
                      Showing <strong style={{ color: T.textPrimary }}>{Math.min(projectVisibleCount, filteredProjects.length)}</strong> of{" "}
                      <strong style={{ color: T.textPrimary }}>{filteredProjects.length}</strong> projects
                    </div>
                    {filteredProjects.slice(0, projectVisibleCount).map(p => (
                      <ProjectCard key={p._id} project={p} onOpenKanban={handleOpenKanban} />
                    ))}
                    {projectVisibleCount < filteredProjects.length && (
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <button onClick={() => setProjectVisibleCount(p => p + 10)}
                          style={{
                            padding: "8px 20px", borderRadius: T.radiusSm, background: T.bgInput,
                            border: `1px solid ${T.border}`, color: T.blue, fontSize: "0.85rem",
                            fontWeight: 700, cursor: "pointer", fontFamily: T.font
                          }}
                        >Load More Projects...</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {kanbanProject && (
        <ProjectKanban
          open={kanbanOpen}
          onClose={() => {
            setKanbanOpen(false);
            setKanbanProject(null);
            loadInitialData(true);
          }}
          project={kanbanProject}
        />
      )}

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
          currentUserId={currentUserId}
          onClose={() => setSelectedSidebarTask(null)}
          onTaskComplete={handleTaskComplete}
        />
      )}

      {toast && <Toast message={toast} onHide={() => setToast("")} />}
    </>
  );
};

export default DeveloperDashboard;