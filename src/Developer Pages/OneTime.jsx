// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import axios from "axios";
// import { differenceInDays } from "date-fns";
// import ProjectKanban from "../Admin Pages/Components/Projectkanban";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// // ── Design tokens ─────────────────────────────────────────────────────────────
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
//   Critical: { color: T.red,    bg: T.redBg,    dot: "●" },
//   High:     { color: T.orange, bg: T.orangeBg,  dot: "▲" },
//   Medium:   { color: T.blue,   bg: T.blueBg,    dot: "◆" },
//   Low:      { color: T.green,  bg: T.greenBg,   dot: "▼" },
// };

// const authHeaders = () => ({
//   Authorization: `Bearer ${localStorage.getItem("token")}`,
// });

// // ── Urgency helpers ───────────────────────────────────────────────────────────
// /**
//  * Returns urgency level based on days until deadline:
//  *   "critical" → overdue or due today
//  *   "high"     → 1–2 days
//  *   "medium"   → 3–5 days
//  *   "low"      → 6–10 days
//  *   null       → > 10 days or no deadline
//  */
// const getUrgency = (deadline) => {
//   if (!deadline) return null;
//   const diff = differenceInDays(new Date(deadline), new Date());
//   if (diff <= 0)  return "critical";
//   if (diff <= 2)  return "high";
//   if (diff <= 5)  return "medium";
//   if (diff <= 10) return "low";
//   return null;
// };

// const URGENCY_STYLES = {
//   critical: {
//     bg:          "linear-gradient(135deg, #FFF0F0 0%, #FFE0E0 100%)",
//     border:      "#D1242F",
//     borderLeft:  "4px solid #D1242F",
//     glow:        "0 0 0 1px #D1242F30, 0 2px 12px rgba(209,36,47,0.15)",
//     labelColor:  "#D1242F",
//     labelBg:     "#FFEBE9",
//     pulse:       true,
//   },
//   high: {
//     bg:          "linear-gradient(135deg, #FFFBF0 0%, #FFF3D0 100%)",
//     border:      "#BF8700",
//     borderLeft:  "4px solid #BF8700",
//     glow:        "0 0 0 1px #BF870030, 0 2px 8px rgba(191,135,0,0.12)",
//     labelColor:  "#BF8700",
//     labelBg:     "#FFF8C5",
//     pulse:       false,
//   },
//   medium: {
//     bg:          "linear-gradient(135deg, #FAFBFF 0%, #F0F4FF 100%)",
//     border:      "#0969DA",
//     borderLeft:  "4px solid #0969DA40",
//     glow:        "0 0 0 1px #0969DA20",
//     labelColor:  "#0969DA",
//     labelBg:     "#DDF4FF",
//     pulse:       false,
//   },
//   low: {
//     bg:          "#FFFFFF",
//     border:      T.border,
//     borderLeft:  `4px solid ${T.border}`,
//     glow:        T.shadow,
//     labelColor:  T.textSecondary,
//     labelBg:     T.grayBg,
//     pulse:       false,
//   },
// };

// // ── Tiny helpers ──────────────────────────────────────────────────────────────
// const avatar = (name = "?") => name.charAt(0).toUpperCase();
// const avatarColor = (s) => {
//   const palette = ["#D97706","#0969DA","#1A7F37","#D1242F","#8250DF","#BF8700"];
//   let h = 0;
//   for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
//   return palette[Math.abs(h) % palette.length];
// };

// const stopDragEvent = (e) => e.stopPropagation();

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
//       <span style={{ width: 6, height: 6, borderRadius: "50%",
//         background: isActive ? T.green : T.textDisabled, display: "inline-block" }} />
//       {status}
//     </span>
//   );
// };

// const DeadlineLabel = ({ deadline }) => {
//   if (!deadline) return null;
//   const diff = differenceInDays(new Date(deadline), new Date());
//   const overdue = diff < 0;
//   const soon = !overdue && diff <= 3;
//   return (
//     <span style={{
//       fontSize: "0.7rem", fontWeight: 600,
//       color: overdue ? T.red : soon ? T.orange : T.textSecondary,
//     }}>
//       {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : `Due in ${diff}d`}
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
//     // Backdrop
//     <div
//       onClick={onClose}
//       style={{
//         position: "fixed", inset: 0,
//         background: "rgba(0,0,0,0.45)",
//         zIndex: 9999,
//         display: "flex", alignItems: "center", justifyContent: "center",
//       }}
//     >
//       {/* Panel */}
//       <div
//         onClick={e => e.stopPropagation()}
//         style={{
//           background: T.bgCard,
//           border: `1px solid ${T.border}`,
//           borderRadius: T.radius,
//           padding: "20px",
//           width: 360,
//           boxShadow: T.shadowMd,
//           fontFamily: T.font,
//         }}
//       >
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
//           <div>
//             <div style={{ fontSize: "0.7rem", color: T.textDisabled, textTransform: "uppercase",
//               letterSpacing: "0.06em", marginBottom: 3 }}>Add Comment</div>
//             <div style={{ fontSize: "0.875rem", fontWeight: 700, color: T.textPrimary,
//               lineHeight: 1.3, maxWidth: 260 }}>{task.title}</div>
//           </div>
//           <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
//             fontSize: "1.1rem", color: T.textDisabled, padding: "0 4px", lineHeight: 1 }}>×</button>
//         </div>

//         {posted ? (
//           <div style={{ textAlign: "center", padding: "16px 0", color: T.green, fontWeight: 600, fontSize: "0.875rem" }}>
//             ✓ Comment posted!
//           </div>
//         ) : (
//           <>
//             <textarea
//               autoFocus
//               value={text}
//               onChange={e => setText(e.target.value)}
//               onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
//               placeholder="Write your comment… (Enter to send)"
//               rows={3}
//               style={{
//                 width: "100%", resize: "vertical",
//                 background: T.bgInput,
//                 border: `1px solid ${T.border}`,
//                 borderRadius: T.radiusSm,
//                 color: T.textPrimary,
//                 fontSize: "0.82rem",
//                 padding: "8px 10px",
//                 outline: "none",
//                 fontFamily: T.font,
//                 lineHeight: 1.5,
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
//               <button
//                 onClick={submit}
//                 disabled={!text.trim() || posting}
//                 style={{
//                   padding: "6px 14px", borderRadius: T.radiusSm,
//                   background: text.trim() ? T.accent : T.grayBg,
//                   border: "none",
//                   color: text.trim() ? "#FFF" : T.textDisabled,
//                   fontSize: "0.78rem", fontWeight: 600,
//                   cursor: text.trim() ? "pointer" : "not-allowed",
//                   fontFamily: T.font,
//                   transition: "background 0.15s",
//                 }}
//               >
//                 {posting ? "Posting…" : "Post"}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Pending Task Sidebar Item ─────────────────────────────────────────────────
// const SidebarTaskItem = ({ task, projectId, projectName, currentUserId, onTaskComplete }) => {
//   const cfg      = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
//   const urgency  = getUrgency(task.deadline);
//   const ustyle   = urgency ? URGENCY_STYLES[urgency] : null;
//   const [completing, setCompleting] = useState(false);
//   const [commentOpen, setCommentOpen] = useState(false);

//   const handleComplete = async (e) => {
//     e.stopPropagation();
//     setCompleting(true);
//     try {
//       await axios.post(
//         `${API_BASE}/api/tasks/${projectId}/${task._id}/complete`,
//         {},
//         { headers: authHeaders() }
//       );
//       onTaskComplete(task._id);
//     } catch (err) {
//       console.error("Complete error:", err);
//       setCompleting(false);
//     }
//   };

//   // Deadline urgency background & border
//   const cardBg     = ustyle?.bg     || T.bgCard;
//   const cardBorder = ustyle ? `1px solid ${ustyle.border}` : `1px solid ${T.border}`;
//   const cardShadow = ustyle?.glow   || T.shadow;
//   const borderLeft = ustyle?.borderLeft || `4px solid transparent`;

//   return (
//     <>
//       <div
//         className={`sidebar-task${urgency === "critical" ? " sidebar-task--critical" : ""}`}
//         style={{
//           padding: "10px 12px",
//           borderRadius: T.radiusSm,
//           background: cardBg,
//           border: cardBorder,
//           borderLeft,
//           marginBottom: 8,
//           boxShadow: cardShadow,
//           transition: "box-shadow 0.2s, border-color 0.2s",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         {/* Critical shimmer bar */}
//         {urgency === "critical" && (
//           <div style={{
//             position: "absolute", top: 0, left: 0, right: 0, height: 2,
//             background: "linear-gradient(90deg, #D1242F, #FF6B6B, #D1242F)",
//             backgroundSize: "200% 100%",
//             animation: "shimmer 2s linear infinite",
//           }} />
//         )}

//         <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
//           {/* Priority dot */}
//           <span style={{ fontSize: "0.65rem", color: cfg.color, marginTop: 2, flexShrink: 0 }}>
//             {cfg.dot}
//           </span>

//           <div style={{ flex: 1, minWidth: 0 }}>
//             {/* Task title */}
//             <div style={{
//               fontSize: "0.8rem", fontWeight: 600,
//               color: T.textPrimary,
//               lineHeight: 1.4, marginBottom: 2,
//               overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//             }}>
//               {task.title}
//             </div>

//             {/* Project name */}
//             <div style={{
//               fontSize: "0.7rem", color: T.textSecondary, marginBottom: 4,
//               overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//             }}>
//               {projectName}
//             </div>

//             {/* Deadline label + urgency badge */}
//             <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
//               {task.deadline && <DeadlineLabel deadline={task.deadline} />}
//               {urgency && urgency !== "low" && (
//                 <span style={{
//                   fontSize: "0.58rem", fontWeight: 800,
//                   padding: "1px 5px", borderRadius: "3px",
//                   background: ustyle.labelBg,
//                   color: ustyle.labelColor,
//                   textTransform: "uppercase", letterSpacing: "0.06em",
//                 }}>
//                   {urgency === "critical" ? "🔥 Urgent" : urgency === "high" ? "⚠ Soon" : "Soon"}
//                 </span>
//               )}
//             </div>

//             {/* Action buttons */}
//             <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
//               {/* Complete button */}
//               <button
//                 onClick={handleComplete}
//                 disabled={completing}
//                 style={{
//                   display: "flex", alignItems: "center", gap: 4,
//                   padding: "4px 9px",
//                   borderRadius: "4px",
//                   background: completing ? T.grayBg : T.greenBg,
//                   border: `1px solid ${completing ? T.border : T.green}40`,
//                   color: completing ? T.textDisabled : T.green,
//                   fontSize: "0.68rem", fontWeight: 700,
//                   cursor: completing ? "not-allowed" : "pointer",
//                   fontFamily: T.font,
//                   transition: "background 0.15s, color 0.15s",
//                   whiteSpace: "nowrap",
//                 }}
//                 onMouseEnter={e => { if (!completing) e.currentTarget.style.background = T.green; e.currentTarget.style.color = "#FFF"; }}
//                 onMouseLeave={e => { e.currentTarget.style.background = completing ? T.grayBg : T.greenBg; e.currentTarget.style.color = completing ? T.textDisabled : T.green; }}
//               >
//                 {completing ? "…" : "Mark As Done"}
//               </button>

//               {/* Comment button */}
//               <button
//                 onClick={e => { e.stopPropagation(); setCommentOpen(true); }}
//                 style={{
//                   display: "flex", alignItems: "center", gap: 4,
//                   padding: "4px 9px",
//                   borderRadius: "4px",
//                   background: T.bgInput,
//                   border: `1px solid ${T.border}`,
//                   color: T.textSecondary,
//                   fontSize: "0.68rem", fontWeight: 600,
//                   cursor: "pointer",
//                   fontFamily: T.font,
//                   transition: "border-color 0.15s, color 0.15s",
//                   whiteSpace: "nowrap",
//                 }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.blue; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary; }}
//               >
//                 Comment
//               </button>
//             </div>
//           </div>

//           {/* Status badge */}
//           <span style={{
//             fontSize: "0.62rem", fontWeight: 700,
//             padding: "2px 6px", borderRadius: "4px",
//             background: task.status === "In Progress" ? T.blueBg : T.grayBg,
//             color: task.status === "In Progress" ? T.blue : T.textSecondary,
//             flexShrink: 0, alignSelf: "flex-start",
//           }}>
//             {task.status === "In Progress" ? "WIP" : "TODO"}
//           </span>
//         </div>
//       </div>

//       {/* Comment modal — rendered via portal-like approach at root */}
//       {commentOpen && (
//         <CommentModal
//           task={task}
//           projectId={projectId}
//           currentUserId={currentUserId}
//           onClose={() => setCommentOpen(false)}
//         />
//       )}
//     </>
//   );
// };

// // ── Project Card ──────────────────────────────────────────────────────────────
// const ProjectCard = ({ project, onOpenKanban }) => {
//   const closed = project.status === "Closed";
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <div
//       className={`project-card ${closed ? "closed" : ""}`}
//       style={{
//         background: closed ? T.closedBg : T.bgCard,
//         border: `1px solid ${closed ? T.closedBorder : T.border}`,
//         borderRadius: T.radius,
//         marginBottom: 12,
//         overflow: "hidden",
//         boxShadow: T.shadow,
//         opacity: closed ? 0.75 : 1,
//         // Ensure cards don't bleed over sidebar
//         position: "relative",
//         zIndex: 1,
//       }}
//     >
//       {/* Card header */}
//       <div
//         style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer" }}
//         onClick={() => setExpanded(p => !p)}
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
//             <span style={{ fontSize: "0.9rem", fontWeight: 700,
//               color: closed ? T.closedText : T.textPrimary, fontFamily: T.font }}>
//               {project.projectName}
//             </span>
//             <StatusPill status={project.status} />
//             {closed && (
//               <span style={{ fontSize: "0.68rem", color: T.textDisabled, fontStyle: "italic" }}>
//                 Read-only
//               </span>
//             )}
//           </div>
//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
//             {(project.serviceType || []).map((s, i) => <ServiceTag key={i} label={s} closed={closed} />)}
//             <SubTag label={project.subscriptionType} closed={closed} />
//           </div>
//           <div style={{ display: "flex", gap: 16, flexWrap: "wrap",
//             fontSize: "0.75rem", color: closed ? T.textDisabled : T.textSecondary }}>
//             <span>Created by <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.createdBy}</strong></span>
//             {project.clientName && (
//               <span>Client: <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.clientName}</strong></span>
//             )}
//           </div>
//         </div>

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
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px 20px" }}>
//             {[
//               { label: "Business Niche", value: project.businessNiche },
//               { label: "Client Website", value: project.referenceSite },
//             ].filter(f => f.value).map(({ label, value }) => (
//               <div key={label}>
//                 <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//                   textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
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
//               <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//                 textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Details</div>
//               <div style={{ fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
//                 lineHeight: 1.6, padding: "8px 12px", background: T.bgInput,
//                 borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}>
//                 {project.projectDetails}
//               </div>
//             </div>
//           )}

//           {project.comments && (
//             <div>
//               <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//                 textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Comments</div>
//               <div style={{ fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
//                 lineHeight: 1.6, padding: "8px 12px", background: T.bgInput,
//                 borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}>
//                 {project.comments}
//               </div>
//             </div>
//           )}

//           <div>
//             <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//               textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Team</div>
//             <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//               {(project.assignedDeveloper || []).map((dev, i) => (
//                 <div key={i} style={{
//                   display: "flex", alignItems: "center", gap: 7,
//                   padding: "4px 10px", background: T.bgInput,
//                   borderRadius: "20px", border: `1px solid ${T.border}`,
//                 }}>
//                   <div style={{
//                     width: 20, height: 20, borderRadius: "50%",
//                     background: avatarColor(dev.username),
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     fontSize: "0.6rem", fontWeight: 800, color: "#FFF",
//                   }}>{avatar(dev.username)}</div>
//                   <span style={{ fontSize: "0.78rem", color: closed ? T.textDisabled : T.textPrimary }}>
//                     {dev.username}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {project.upsaleData?.length > 0 && (
//             <div>
//               <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//                 textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Upsale Packages</div>
//               <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                 {project.upsaleData.map((u, i) => (
//                   <div key={i} style={{
//                     padding: "6px 12px", background: T.bgInput,
//                     borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
//                     fontSize: "0.78rem", color: closed ? T.textDisabled : T.textSecondary,
//                   }}>
//                     <strong style={{ color: closed ? T.textDisabled : T.accent }}>{u.serviceType}</strong>
//                     {u.amount && <span> · ${Number(u.amount).toLocaleString()}</span>}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {!closed && (
//             <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
//               <button
//                 type="button"
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
//     <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//       textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
//     <select
//       value={value} onChange={e => onChange(e.target.value)} onPointerDown={stopDragEvent}
//       style={{
//         background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
//         color: value ? T.textPrimary : T.textSecondary, fontSize: "0.8rem",
//         padding: "6px 10px", outline: "none", fontFamily: T.font,
//         appearance: "none",
//         backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
//         backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
//       }}
//     >
//       <option value="">All {label}</option>
//       {options.map(o => <option key={o} value={o}>{o}</option>)}
//     </select>
//   </div>
// );

// // ── Main Dashboard ────────────────────────────────────────────────────────────
// const DeveloperDashboard = () => {
//   const [projects,        setProjects]        = useState([]);
//   const [tasks,           setTasks]           = useState({});
//   const [loadingProjects, setLoadingProjects] = useState(true);
//   const [loadingTasks,    setLoadingTasks]    = useState(false);
//   const [kanbanProject,   setKanbanProject]   = useState(null);
//   const [kanbanOpen,      setKanbanOpen]      = useState(false);
//   const [sidebarOpen,     setSidebarOpen]     = useState(true);

//   const [search,          setSearch]          = useState("");
//   const [filterCreatedBy, setFilterCreatedBy] = useState("");
//   const [filterSub,       setFilterSub]       = useState("");
//   const [filterService,   setFilterService]   = useState("");
//   const [filterStatus,    setFilterStatus]    = useState("");

//   const currentUserId   = localStorage.getItem("userId");
//   const currentUsername = localStorage.getItem("username") || "Developer";

//   // ── Fetch projects ──────────────────────────────────────────────────────────
//   const fetchProjects = useCallback(async () => {
//     setLoadingProjects(true);
//     try {
//       const r = await axios.get(`${API_BASE}/api/newproject/projects`, { headers: authHeaders() });
//       const all  = Array.isArray(r.data) ? r.data : [];
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

//   // ── Fetch tasks ─────────────────────────────────────────────────────────────
//   const fetchAllTasks = useCallback(async (projectList) => {
//     setLoadingTasks(true);
//     const result = {};
//     await Promise.allSettled(
//       projectList.map(async (p) => {
//         try {
//           const r = await axios.get(`${API_BASE}/api/tasks/${p._id}`, { headers: authHeaders() });
//           result[p._id] = (r.data || []).filter(
//             t => t.status !== "Done" &&
//                  t.assignedTo?.id?.toString() === currentUserId?.toString()
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
//     fetchProjects().then(mine => { if (mine.length) fetchAllTasks(mine); });
//   }, [fetchProjects, fetchAllTasks]);

//   // Remove a completed task from local state immediately (optimistic)
//   const handleTaskComplete = useCallback((taskId) => {
//     setTasks(prev => {
//       const next = { ...prev };
//       for (const pid in next) {
//         next[pid] = next[pid].filter(t => t._id !== taskId);
//       }
//       return next;
//     });
//   }, []);

//   // ── Pending tasks flat list ─────────────────────────────────────────────────
//   const pendingTasks = useMemo(() => {
//     const flat = [];
//     projects.forEach(p => {
//       (tasks[p._id] || []).forEach(t => flat.push({ ...t, _projectId: p._id, _projectName: p.projectName }));
//     });
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

//   // ── Filters ─────────────────────────────────────────────────────────────────
//   const filteredProjects = useMemo(() => projects.filter(p => {
//     const matchSearch     = !search          || p.projectName.toLowerCase().includes(search.toLowerCase()) || p.clientName?.toLowerCase().includes(search.toLowerCase());
//     const matchCreatedBy  = !filterCreatedBy || p.createdBy === filterCreatedBy;
//     const matchSub        = !filterSub       || p.subscriptionType === filterSub;
//     const matchService    = !filterService   || (p.serviceType || []).includes(filterService);
//     const matchStatus     = !filterStatus    || p.status === filterStatus;
//     return matchSearch && matchCreatedBy && matchSub && matchService && matchStatus;
//   }), [projects, search, filterCreatedBy, filterSub, filterService, filterStatus]);

//   const createdByOptions = [...new Set(projects.map(p => p.createdBy).filter(Boolean))];
//   const subOptions       = [...new Set(projects.map(p => p.subscriptionType).filter(Boolean))];
//   const serviceOptions   = [...new Set(projects.flatMap(p => p.serviceType || []))];

//   const activeCount  = projects.filter(p => p.status === "Active").length;
//   const closedCount  = projects.filter(p => p.status === "Closed").length;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
//         * { box-sizing: border-box; }
//         ::-webkit-scrollbar { width: 6px; height: 6px; }
//         ::-webkit-scrollbar-track { background: transparent; }
//         ::-webkit-scrollbar-thumb { background: #C1C7CD; border-radius: 3px; }
//         ::-webkit-scrollbar-thumb:hover { background: #A1A8AE; }
//         input::placeholder, textarea::placeholder { color: ${T.textDisabled}; }

//         /* Urgency shimmer animation */
//         @keyframes shimmer {
//           0%   { background-position: 200% center; }
//           100% { background-position: -200% center; }
//         }
//         /* Overdue pulse ring */
//         @keyframes urgentPulse {
//           0%, 100% { box-shadow: 0 0 0 0 rgba(209,36,47,0.35); }
//           50%       { box-shadow: 0 0 0 4px rgba(209,36,47,0); }
//         }
//         .sidebar-task--critical {
//           animation: urgentPulse 2.2s ease-in-out infinite;
//         }
//         .sidebar-task--critical:hover {
//           animation: none;
//         }

//         /* Spinning loader */
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }

//         .project-card {
//           transition: border-color 0.2s, box-shadow 0.2s;
//         }
//         .project-card:not(.closed):hover {
//           border-color: ${T.accent}50 !important;
//           box-shadow: 0 0 0 1px ${T.accent}30, ${T.shadowMd} !important;
//         }
//         .sidebar-task {
//           transition: border-color 0.15s, box-shadow 0.15s;
//         }
//       `}</style>

//       {/*
//         ── Root layout ──────────────────────────────────────────────────────────
//         Key z-index fix: the sidebar sits at z-index:10, the main content at z-index:1.
//         Dialogs/modals inside the sidebar (CommentModal) use z-index:9999 so they
//         escape the sidebar stacking context and float above everything.
//       */}
//       <div style={{
//         display: "flex",
//         height: "100vh",
//         background: T.bg,
//         fontFamily: T.font,
//         color: T.textPrimary,
//         overflow: "hidden",
//         position: "relative",   // establishes the root stacking context
//       }}>

//         {/* ── Main content ────────────────────────────────────────────────── */}
//         <div style={{
//           flex: 1, display: "flex", flexDirection: "column",
//           overflow: "hidden",
//           position: "relative",
//           zIndex: 1,           // keeps project cards BELOW the sidebar
//         }}>

//           {/* Top bar */}
//           <div style={{
//             padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
//             display: "flex", alignItems: "center", gap: 16,
//             background: T.bgCard, flexShrink: 0,
//             position: "relative", zIndex: 2,  // above the card list
//           }}>
//             <div style={{
//               width: 36, height: 36, borderRadius: "50%",
//               background: avatarColor(currentUsername),
//               display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: "0.85rem", fontWeight: 800, color: "#FFF", flexShrink: 0,
//             }}>{avatar(currentUsername)}</div>
//             <div>
//               <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginBottom: 1 }}>
//                 Developer Dashboard
//               </div>
//               <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary }}>
//                 {currentUsername}
//               </div>
//             </div>

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
//               <button
//                 type="button"
//                 onClick={() => setSidebarOpen(p => !p)}
//                 onPointerDown={stopDragEvent}
//                 style={{
//                   padding: "6px 12px", borderRadius: T.radiusSm,
//                   fontSize: "0.75rem", fontWeight: 600, fontFamily: T.font,
//                   background: sidebarOpen ? T.accentDim : T.bgInput,
//                   border: `1px solid ${sidebarOpen ? T.accent + "50" : T.border}`,
//                   color: sidebarOpen ? T.accent : T.textSecondary,
//                   cursor: "pointer", transition: "all 0.15s",
//                 }}
//               >{sidebarOpen ? "Hide Tasks" : "Show Tasks"}</button>
//             </div>
//           </div>

//           {/* Filter bar */}
//           <div style={{
//             padding: "12px 24px", borderBottom: `1px solid ${T.border}`,
//             background: T.bgCard,
//             display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap",
//             flexShrink: 0,
//             position: "relative", zIndex: 2,
//           }}>
//             <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px", minWidth: 180 }}>
//               <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
//                 textTransform: "uppercase", letterSpacing: "0.06em" }}>Search</label>
//               <div style={{ position: "relative" }}>
//                 <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
//                   color: T.textDisabled, fontSize: "0.8rem", pointerEvents: "none" }}>⌕</span>
//                 <input
//                   value={search}
//                   onChange={e => setSearch(e.target.value)}
//                   onPointerDown={stopDragEvent}
//                   placeholder="Project name, client..."
//                   style={{
//                     width: "100%", background: T.bgInput,
//                     border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
//                     color: T.textPrimary, fontSize: "0.8rem",
//                     padding: "6px 10px 6px 28px",
//                     outline: "none", fontFamily: T.font, cursor: "text",
//                   }}
//                   onFocus={e => e.target.style.borderColor = T.borderFocus}
//                   onBlur={e => e.target.style.borderColor = T.border}
//                 />
//               </div>
//             </div>
//             <FilterSelect label="Created By"   value={filterCreatedBy} onChange={setFilterCreatedBy} options={createdByOptions} />
//             <FilterSelect label="Subscription" value={filterSub}       onChange={setFilterSub}       options={subOptions} />
//             <FilterSelect label="Service"      value={filterService}   onChange={setFilterService}   options={serviceOptions} />
//             <FilterSelect label="Status"       value={filterStatus}    onChange={setFilterStatus}    options={["Active","Closed"]} />
//             {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
//               <button
//                 type="button"
//                 onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }}
//                 onPointerDown={stopDragEvent}
//                 style={{
//                   padding: "6px 12px", alignSelf: "flex-end", borderRadius: T.radiusSm,
//                   fontSize: "0.78rem", fontFamily: T.font, whiteSpace: "nowrap",
//                   background: "transparent", border: `1px solid ${T.border}`,
//                   color: T.textSecondary, cursor: "pointer",
//                 }}
//               >× Clear</button>
//             )}
//           </div>

//           {/* Project list */}
//           <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", position: "relative", zIndex: 1 }}>
//             {loadingProjects ? (
//               <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
//                 <div style={{ textAlign: "center" }}>
//                   <div style={{
//                     width: 36, height: 36, borderRadius: "50%",
//                     border: `3px solid ${T.border}`, borderTopColor: T.accent,
//                     animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
//                   }} />
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
//                   {projects.length === 0
//                     ? "Ask your project manager to assign you to a project."
//                     : "Try adjusting or clearing the filters."}
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div style={{ fontSize: "0.75rem", color: T.textSecondary, marginBottom: 14 }}>
//                   Showing <strong style={{ color: T.textPrimary }}>{filteredProjects.length}</strong> of{" "}
//                   <strong style={{ color: T.textPrimary }}>{projects.length}</strong> projects
//                 </div>
//                 {filteredProjects.map(p => (
//                   <ProjectCard
//                     key={p._id} project={p}
//                     onOpenKanban={(proj) => { setKanbanProject(proj); setKanbanOpen(true); }}
//                   />
//                 ))}
//               </>
//             )}
//           </div>
//         </div>

//         {/* ── Pending Tasks Sidebar ──────────────────────────────────────── */}
//         {sidebarOpen && (
//           <div style={{
//             width: 290,
//             borderLeft: `1px solid ${T.border}`,
//             background: T.bgSidebar,
//             display: "flex", flexDirection: "column",
//             overflow: "hidden", flexShrink: 0,
//             position: "relative",
//             zIndex: 10,          // sidebar must sit ABOVE main content cards
//           }}>
//             {/* Sidebar header */}
//             <div style={{
//               padding: "16px 16px 12px",
//               borderBottom: `1px solid ${T.border}`,
//               flexShrink: 0,
//             }}>
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
//                 <span style={{ fontSize: "0.8rem", fontWeight: 700, color: T.textPrimary }}>Pending Tasks</span>
//                 {!loadingTasks && pendingTasks.length > 0 && (
//                   <span style={{
//                     background: T.orange, color: "#000",
//                     fontSize: "0.65rem", fontWeight: 800,
//                     borderRadius: "10px", padding: "2px 7px",
//                     minWidth: 20, textAlign: "center",
//                   }}>{pendingTasks.length}</span>
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
//                   {["In Progress", "Todo"].map(status => {
//                     const group = pendingTasks.filter(t => t.status === status);
//                     if (group.length === 0) return null;
//                     return (
//                       <div key={status} style={{ marginBottom: 16 }}>
//                         <div style={{
//                           fontSize: "0.62rem", fontWeight: 700,
//                           color: status === "In Progress" ? T.blue : T.textDisabled,
//                           textTransform: "uppercase", letterSpacing: "0.08em",
//                           marginBottom: 8, paddingLeft: 2,
//                         }}>
//                           {status === "In Progress" ? "▶ In Progress" : "○ To Do"} ({group.length})
//                         </div>
//                         {group.map(t => (
//                           <SidebarTaskItem
//                             key={t._id}
//                             task={t}
//                             projectId={t._projectId}
//                             projectName={t._projectName}
//                             currentUserId={currentUserId}
//                             onTaskComplete={handleTaskComplete}
//                           />
//                         ))}
//                       </div>
//                     );
//                   })}
//                 </>
//               )}
//             </div>

//             {/* Refresh footer */}
//             <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
//               <button
//                 type="button"
//                 onClick={() => fetchProjects().then(mine => { if (mine.length) fetchAllTasks(mine); })}
//                 onPointerDown={stopDragEvent}
//                 style={{
//                   width: "100%", padding: "7px", borderRadius: T.radiusSm,
//                   fontSize: "0.75rem", fontFamily: T.font,
//                   background: T.bgInput, border: `1px solid ${T.border}`,
//                   color: T.textSecondary, cursor: "pointer", transition: "all 0.15s",
//                 }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderFocus; e.currentTarget.style.color = T.textPrimary; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary; }}
//               >↻ Refresh</button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Kanban dialog ──────────────────────────────────────────────────── */}
//       {kanbanProject && (
//         <ProjectKanban
//           open={kanbanOpen}
//           onClose={() => {
//             setKanbanOpen(false);
//             setKanbanProject(null);
//             fetchAllTasks(projects);
//           }}
//           project={kanbanProject}
//         />
//       )}
//     </>
//   );
// };

// export default DeveloperDashboard;























import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { differenceInCalendarDays } from "date-fns";
import ProjectKanban from "../Admin Pages/Components/Projectkanban";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: "#F6F8FA",
  bgCard: "#FFFFFF",
  bgSidebar: "#F6F8FA",
  bgInput: "#FFFFFF",
  border: "#D0D7DE",
  borderFocus: "#D97706",
  accent: "#D97706",
  accentDim: "#D9770615",
  accentHover: "#B35900",
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
  Critical: { color: T.red,    bg: T.redBg,    dot: "●" },
  High:     { color: T.orange, bg: T.orangeBg,  dot: "▲" },
  Medium:   { color: T.blue,   bg: T.blueBg,    dot: "◆" },
  Low:      { color: T.green,  bg: T.greenBg,   dot: "▼" },
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Urgency helpers ───────────────────────────────────────────────────────────
/**
 * Returns urgency level based on calendar days until deadline:
 *   "overdue"  → < 0 days
 *   "critical" → 0–1 days (due today or tomorrow)
 *   "high"     → 2–3 days
 *   "medium"   → 4–6 days
 *   "low"      → 7–10 days
 *   null       → > 10 days or no deadline
 */
const getUrgency = (deadline) => {
  if (!deadline) return null;
  const diff = differenceInCalendarDays(new Date(deadline), new Date());
  
  if (diff < 0)  return "overdue";  // Strictly overdue
  if (diff <= 1) return "critical"; // Due today or tomorrow (Red)
  if (diff <= 3) return "high";     // Soon (Orange)
  if (diff <= 6) return "medium";   // Upcoming (Blue)
  if (diff <= 10) return "low";     // (Gray)
  return null;
};

const URGENCY_STYLES = {
  overdue: {
    bg:          "linear-gradient(135deg, #FFF0F0 0%, #FFDCE0 100%)",
    border:      "#A40E26", // Deeper red for overdue
    borderLeft:  "4px solid #A40E26",
    glow:        "0 0 0 1px #A40E2640, 0 4px 16px rgba(164,14,38,0.2)",
    labelColor:  "#FFFFFF",
    labelBg:     "#A40E26",
    pulse:       true,
  },
  critical: {
    bg:          "linear-gradient(135deg, #FFFDFD 0%, #FFEBE9 100%)",
    border:      "#D1242F",
    borderLeft:  "4px solid #D1242F",
    glow:        "0 0 0 1px #D1242F20, 0 2px 10px rgba(209,36,47,0.1)",
    labelColor:  "#D1242F",
    labelBg:     "#FFEBE9",
    pulse:       false,
  },
  high: {
    bg:          "linear-gradient(135deg, #FFFBF0 0%, #FFF3D0 100%)",
    border:      "#BF8700",
    borderLeft:  "4px solid #BF8700",
    glow:        "0 0 0 1px #BF870030, 0 2px 8px rgba(191,135,0,0.12)",
    labelColor:  "#BF8700",
    labelBg:     "#FFF8C5",
    pulse:       false,
  },
  medium: {
    bg:          "linear-gradient(135deg, #FAFBFF 0%, #F0F4FF 100%)",
    border:      "#0969DA",
    borderLeft:  "4px solid #0969DA40",
    glow:        "0 0 0 1px #0969DA20",
    labelColor:  "#0969DA",
    labelBg:     "#DDF4FF",
    pulse:       false,
  },
  low: {
    bg:          "#FFFFFF",
    border:      T.border,
    borderLeft:  `4px solid ${T.border}`,
    glow:        T.shadow,
    labelColor:  T.textSecondary,
    labelBg:     T.grayBg,
    pulse:       false,
  },
};

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const avatar = (name = "?") => name.charAt(0).toUpperCase();
const avatarColor = (s) => {
  const palette = ["#D97706","#0969DA","#1A7F37","#D1242F","#8250DF","#BF8700"];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
};

const stopDragEvent = (e) => e.stopPropagation();

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
      <span style={{ width: 6, height: 6, borderRadius: "50%",
        background: isActive ? T.green : T.textDisabled, display: "inline-block" }} />
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
        : diff === 0 
          ? "Due today" 
          : diff === 1 
            ? "Due tomorrow" 
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
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: T.radius,
          padding: "20px",
          width: 360,
          boxShadow: T.shadowMd,
          fontFamily: T.font,
        }}
      >
        <div style={{ display: "flex", justifyContents: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: T.textDisabled, textTransform: "uppercase",
              letterSpacing: "0.06em", marginBottom: 3 }}>Add Comment</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: T.textPrimary,
              lineHeight: 1.3, maxWidth: 260 }}>{task.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            fontSize: "1.1rem", color: T.textDisabled, padding: "0 4px", lineHeight: 1 }}>×</button>
        </div>

        {posted ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: T.green, fontWeight: 600, fontSize: "0.875rem" }}>
            ✓ Comment posted!
          </div>
        ) : (
          <>
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder="Write your comment… (Enter to send)"
              rows={3}
              style={{
                width: "100%", resize: "vertical",
                background: T.bgInput,
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm,
                color: T.textPrimary,
                fontSize: "0.82rem",
                padding: "8px 10px",
                outline: "none",
                fontFamily: T.font,
                lineHeight: 1.5,
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
              <button
                onClick={submit}
                disabled={!text.trim() || posting}
                style={{
                  padding: "6px 14px", borderRadius: T.radiusSm,
                  background: text.trim() ? T.accent : T.grayBg,
                  border: "none",
                  color: text.trim() ? "#FFF" : T.textDisabled,
                  fontSize: "0.78rem", fontWeight: 600,
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  fontFamily: T.font,
                  transition: "background 0.15s",
                }}
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Pending Task Sidebar Item ─────────────────────────────────────────────────
const SidebarTaskItem = ({ task, projectId, projectName, currentUserId, onTaskComplete }) => {
  const cfg      = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
  const urgency  = getUrgency(task.deadline);
  const ustyle   = urgency ? URGENCY_STYLES[urgency] : null;
  const [completing, setCompleting] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  const handleComplete = async (e) => {
    e.stopPropagation();
    setCompleting(true);
    try {
      await axios.post(
        `${API_BASE}/api/tasks/${projectId}/${task._id}/complete`,
        {},
        { headers: authHeaders() }
      );
      onTaskComplete(task._id);
    } catch (err) {
      console.error("Complete error:", err);
      setCompleting(false);
    }
  };

  const cardBg     = ustyle?.bg     || T.bgCard;
  const cardBorder = ustyle ? `1px solid ${ustyle.border}` : `1px solid ${T.border}`;
  const cardShadow = ustyle?.glow   || T.shadow;
  const borderLeft = ustyle?.borderLeft || `4px solid transparent`;

  return (
    <>
      <div
        className={`sidebar-task${urgency === "overdue" ? " sidebar-task--overdue" : ""}`}
        style={{
          padding: "10px 12px",
          borderRadius: T.radiusSm,
          background: cardBg,
          border: cardBorder,
          borderLeft,
          marginBottom: 8,
          boxShadow: cardShadow,
          transition: "box-shadow 0.2s, border-color 0.2s",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shimmer bar for both Overdue and Critical */}
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
          <span style={{ fontSize: "0.65rem", color: cfg.color, marginTop: 2, flexShrink: 0 }}>
            {cfg.dot}
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "0.8rem", fontWeight: 600,
              color: T.textPrimary,
              lineHeight: 1.4, marginBottom: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {task.title}
            </div>

            <div style={{
              fontSize: "0.7rem", color: T.textSecondary, marginBottom: 4,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {projectName}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {task.deadline && <DeadlineLabel deadline={task.deadline} />}
              {urgency && urgency !== "low" && (
                <span style={{
                  fontSize: "0.58rem", fontWeight: 800,
                  padding: "1px 5px", borderRadius: "3px",
                  background: ustyle.labelBg,
                  color: ustyle.labelColor,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {urgency === "overdue" ? "🚨 OVERDUE" : urgency === "critical" ? "🔥 URGENT" : urgency === "high" ? "⚠ SOON" : "SOON"}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button
                onClick={handleComplete}
                disabled={completing}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 9px",
                  borderRadius: "4px",
                  background: completing ? T.grayBg : T.greenBg,
                  border: `1px solid ${completing ? T.border : T.green}40`,
                  color: completing ? T.textDisabled : T.green,
                  fontSize: "0.68rem", fontWeight: 700,
                  cursor: completing ? "not-allowed" : "pointer",
                  fontFamily: T.font,
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!completing) { e.currentTarget.style.background = T.green; e.currentTarget.style.color = "#FFF"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = completing ? T.grayBg : T.greenBg; e.currentTarget.style.color = completing ? T.textDisabled : T.green; }}
              >
                {completing ? "…" : "Mark As Done"}
              </button>

              <button
                onClick={e => { e.stopPropagation(); setCommentOpen(true); }}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 9px",
                  borderRadius: "4px",
                  background: T.bgInput,
                  border: `1px solid ${T.border}`,
                  color: T.textSecondary,
                  fontSize: "0.68rem", fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: T.font,
                  transition: "border-color 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.blue; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary; }}
              >
                Comment
              </button>
            </div>
          </div>

          <span style={{
            fontSize: "0.62rem", fontWeight: 700,
            padding: "2px 6px", borderRadius: "4px",
            background: task.status === "In Progress" ? T.blueBg : T.grayBg,
            color: task.status === "In Progress" ? T.blue : T.textSecondary,
            flexShrink: 0, alignSelf: "flex-start",
          }}>
            {task.status === "In Progress" ? "WIP" : "TODO"}
          </span>
        </div>
      </div>

      {commentOpen && (
        <CommentModal
          task={task}
          projectId={projectId}
          currentUserId={currentUserId}
          onClose={() => setCommentOpen(false)}
        />
      )}
    </>
  );
};

// ── Project Card ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onOpenKanban }) => {
  const closed = project.status === "Closed";
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`project-card ${closed ? "closed" : ""}`}
      style={{
        background: closed ? T.closedBg : T.bgCard,
        border: `1px solid ${closed ? T.closedBorder : T.border}`,
        borderRadius: T.radius,
        marginBottom: 12,
        overflow: "hidden",
        boxShadow: T.shadow,
        opacity: closed ? 0.75 : 1,
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer" }}
        onClick={() => setExpanded(p => !p)}
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
            <span style={{ fontSize: "0.9rem", fontWeight: 700,
              color: closed ? T.closedText : T.textPrimary, fontFamily: T.font }}>
              {project.projectName}
            </span>
            <StatusPill status={project.status} />
            {closed && (
              <span style={{ fontSize: "0.68rem", color: T.textDisabled, fontStyle: "italic" }}>
                Read-only
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {(project.serviceType || []).map((s, i) => <ServiceTag key={i} label={s} closed={closed} />)}
            <SubTag label={project.subscriptionType} closed={closed} />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap",
            fontSize: "0.75rem", color: closed ? T.textDisabled : T.textSecondary }}>
            <span>Created by <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.createdBy}</strong></span>
            {project.clientName && (
              <span>Client: <strong style={{ color: closed ? T.textDisabled : T.textPrimary }}>{project.clientName}</strong></span>
            )}
          </div>
        </div>

        <div style={{
          fontSize: "0.75rem", color: T.textSecondary,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          marginTop: 6, flexShrink: 0,
        }}>▼</div>
      </div>

      {expanded && (
        <div style={{
          borderTop: `1px solid ${T.border}`,
          padding: "14px 18px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px 20px" }}>
            {[
              { label: "Business Niche", value: project.businessNiche },
              { label: "Client Website", value: project.referenceSite },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
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
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Details</div>
              <div style={{ fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
                lineHeight: 1.6, padding: "8px 12px", background: T.bgInput,
                borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}>
                {project.projectDetails}
              </div>
            </div>
          )}

          {project.comments && (
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Comments</div>
              <div style={{ fontSize: "0.8rem", color: closed ? T.textDisabled : T.textSecondary,
                lineHeight: 1.6, padding: "8px 12px", background: T.bgInput,
                borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}>
                {project.comments}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Team</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(project.assignedDeveloper || []).map((dev, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "4px 10px", background: T.bgInput,
                  borderRadius: "20px", border: `1px solid ${T.border}`,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: avatarColor(dev.username),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", fontWeight: 800, color: "#FFF",
                  }}>{avatar(dev.username)}</div>
                  <span style={{ fontSize: "0.78rem", color: closed ? T.textDisabled : T.textPrimary }}>
                    {dev.username}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {project.upsaleData?.length > 0 && (
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Upsale Packages</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {project.upsaleData.map((u, i) => (
                  <div key={i} style={{
                    padding: "6px 12px", background: T.bgInput,
                    borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
                    fontSize: "0.78rem", color: closed ? T.textDisabled : T.textSecondary,
                  }}>
                    <strong style={{ color: closed ? T.textDisabled : T.accent }}>{u.serviceType}</strong>
                    {u.amount && <span> · ${Number(u.amount).toLocaleString()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!closed && (
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
              <button
                type="button"
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
    <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
      textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
    <select
      value={value} onChange={e => onChange(e.target.value)} onPointerDown={stopDragEvent}
      style={{
        background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
        color: value ? T.textPrimary : T.textSecondary, fontSize: "0.8rem",
        padding: "6px 10px", outline: "none", fontFamily: T.font,
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B949E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: 28,
      }}
    >
      <option value="">All {label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const DeveloperDashboard = () => {
  const [projects,        setProjects]        = useState([]);
  const [tasks,           setTasks]           = useState({});
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks,    setLoadingTasks]    = useState(false);
  const [kanbanProject,   setKanbanProject]   = useState(null);
  const [kanbanOpen,      setKanbanOpen]      = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(true);

  const [search,          setSearch]          = useState("");
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [filterSub,       setFilterSub]       = useState("");
  const [filterService,   setFilterService]   = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");

  const currentUserId   = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "Developer";

  // ── Fetch projects ──────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const r = await axios.get(`${API_BASE}/api/newproject/projects`, { headers: authHeaders() });
      const all  = Array.isArray(r.data) ? r.data : [];
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

  // ── Fetch tasks ─────────────────────────────────────────────────────────────
  const fetchAllTasks = useCallback(async (projectList) => {
    setLoadingTasks(true);
    const result = {};
    await Promise.allSettled(
      projectList.map(async (p) => {
        try {
          const r = await axios.get(`${API_BASE}/api/tasks/${p._id}`, { headers: authHeaders() });
          result[p._id] = (r.data || []).filter(
            t => t.status !== "Done" &&
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
    fetchProjects().then(mine => { if (mine.length) fetchAllTasks(mine); });
  }, [fetchProjects, fetchAllTasks]);

  const handleTaskComplete = useCallback((taskId) => {
    setTasks(prev => {
      const next = { ...prev };
      for (const pid in next) {
        next[pid] = next[pid].filter(t => t._id !== taskId);
      }
      return next;
    });
  }, []);

  // ── Pending tasks flat list ─────────────────────────────────────────────────
  const pendingTasks = useMemo(() => {
    const flat = [];
    projects.forEach(p => {
      (tasks[p._id] || []).forEach(t => flat.push({ ...t, _projectId: p._id, _projectName: p.projectName }));
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

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => projects.filter(p => {
    const matchSearch     = !search          || p.projectName.toLowerCase().includes(search.toLowerCase()) || p.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchCreatedBy  = !filterCreatedBy || p.createdBy === filterCreatedBy;
    const matchSub        = !filterSub       || p.subscriptionType === filterSub;
    const matchService    = !filterService   || (p.serviceType || []).includes(filterService);
    const matchStatus     = !filterStatus    || p.status === filterStatus;
    return matchSearch && matchCreatedBy && matchSub && matchService && matchStatus;
  }), [projects, search, filterCreatedBy, filterSub, filterService, filterStatus]);

  const createdByOptions = [...new Set(projects.map(p => p.createdBy).filter(Boolean))];
  const subOptions       = [...new Set(projects.map(p => p.subscriptionType).filter(Boolean))];
  const serviceOptions   = [...new Set(projects.flatMap(p => p.serviceType || []))];

  const activeCount  = projects.filter(p => p.status === "Active").length;
  const closedCount  = projects.filter(p => p.status === "Closed").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #C1C7CD; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #A1A8AE; }
        input::placeholder, textarea::placeholder { color: ${T.textDisabled}; }

        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(164, 14, 38, 0.35); }
          50%       { box-shadow: 0 0 0 4px rgba(164, 14, 38, 0); }
        }
        .sidebar-task--overdue {
          animation: urgentPulse 2.2s ease-in-out infinite;
        }
        .sidebar-task--overdue:hover {
          animation: none;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .project-card {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .project-card:not(.closed):hover {
          border-color: ${T.accent}50 !important;
          box-shadow: 0 0 0 1px ${T.accent}30, ${T.shadowMd} !important;
        }
        .sidebar-task {
          transition: border-color 0.15s, box-shadow 0.15s;
        }
      `}</style>

      <div style={{
        display: "flex",
        height: "100vh",
        background: T.bg,
        fontFamily: T.font,
        color: T.textPrimary,
        overflow: "hidden",
        position: "relative",
      }}>

        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{
            padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", gap: 16,
            background: T.bgCard, flexShrink: 0,
            position: "relative", zIndex: 2,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: avatarColor(currentUsername),
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem", fontWeight: 800, color: "#FFF", flexShrink: 0,
            }}>{avatar(currentUsername)}</div>
            <div>
              <div style={{ fontSize: "0.7rem", color: T.textSecondary, marginBottom: 1 }}>
                Developer Dashboard
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: T.textPrimary }}>
                {currentUsername}
              </div>
            </div>

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
              <button
                type="button"
                onClick={() => setSidebarOpen(p => !p)}
                onPointerDown={stopDragEvent}
                style={{
                  padding: "6px 12px", borderRadius: T.radiusSm,
                  fontSize: "0.75rem", fontWeight: 600, fontFamily: T.font,
                  background: sidebarOpen ? T.accentDim : T.bgInput,
                  border: `1px solid ${sidebarOpen ? T.accent + "50" : T.border}`,
                  color: sidebarOpen ? T.accent : T.textSecondary,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >{sidebarOpen ? "Hide Tasks" : "Show Tasks"}</button>
            </div>
          </div>

          <div style={{
            padding: "12px 24px", borderBottom: `1px solid ${T.border}`,
            background: T.bgCard,
            display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap",
            flexShrink: 0,
            position: "relative", zIndex: 2,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px", minWidth: 180 }}>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textDisabled,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>Search</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                  color: T.textDisabled, fontSize: "0.8rem", pointerEvents: "none" }}>⌕</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onPointerDown={stopDragEvent}
                  placeholder="Project name, client..."
                  style={{
                    width: "100%", background: T.bgInput,
                    border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
                    color: T.textPrimary, fontSize: "0.8rem",
                    padding: "6px 10px 6px 28px",
                    outline: "none", fontFamily: T.font, cursor: "text",
                  }}
                  onFocus={e => e.target.style.borderColor = T.borderFocus}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>
            </div>
            <FilterSelect label="Created By"   value={filterCreatedBy} onChange={setFilterCreatedBy} options={createdByOptions} />
            <FilterSelect label="Subscription" value={filterSub}       onChange={setFilterSub}       options={subOptions} />
            <FilterSelect label="Service"      value={filterService}   onChange={setFilterService}   options={serviceOptions} />
            <FilterSelect label="Status"       value={filterStatus}    onChange={setFilterStatus}    options={["Active","Closed"]} />
            {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
              <button
                type="button"
                onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }}
                onPointerDown={stopDragEvent}
                style={{
                  padding: "6px 12px", alignSelf: "flex-end", borderRadius: T.radiusSm,
                  fontSize: "0.78rem", fontFamily: T.font, whiteSpace: "nowrap",
                  background: "transparent", border: `1px solid ${T.border}`,
                  color: T.textSecondary, cursor: "pointer",
                }}
              >× Clear</button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", position: "relative", zIndex: 1 }}>
            {loadingProjects ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `3px solid ${T.border}`, borderTopColor: T.accent,
                    animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
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
                  {projects.length === 0
                    ? "Ask your project manager to assign you to a project."
                    : "Try adjusting or clearing the filters."}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "0.75rem", color: T.textSecondary, marginBottom: 14 }}>
                  Showing <strong style={{ color: T.textPrimary }}>{filteredProjects.length}</strong> of{" "}
                  <strong style={{ color: T.textPrimary }}>{projects.length}</strong> projects
                </div>
                {filteredProjects.map(p => (
                  <ProjectCard
                    key={p._id} project={p}
                    onOpenKanban={(proj) => { setKanbanProject(proj); setKanbanOpen(true); }}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {sidebarOpen && (
          <div style={{
            width: 290,
            borderLeft: `1px solid ${T.border}`,
            background: T.bgSidebar,
            display: "flex", flexDirection: "column",
            overflow: "hidden", flexShrink: 0,
            position: "relative",
            zIndex: 10,
          }}>
            <div style={{
              padding: "16px 16px 12px",
              borderBottom: `1px solid ${T.border}`,
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: T.textPrimary }}>Pending Tasks</span>
                {!loadingTasks && pendingTasks.length > 0 && (
                  <span style={{
                    background: T.orange, color: "#000",
                    fontSize: "0.65rem", fontWeight: 800,
                    borderRadius: "10px", padding: "2px 7px",
                    minWidth: 20, textAlign: "center",
                  }}>{pendingTasks.length}</span>
                )}
              </div>
              <div style={{ fontSize: "0.7rem", color: T.textDisabled }}>
                Assigned to you · not yet done
              </div>
            </div>

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
                  {["In Progress", "Todo"].map(status => {
                    const group = pendingTasks.filter(t => t.status === status);
                    if (group.length === 0) return null;
                    return (
                      <div key={status} style={{ marginBottom: 16 }}>
                        <div style={{
                          fontSize: "0.62rem", fontWeight: 700,
                          color: status === "In Progress" ? T.blue : T.textDisabled,
                          textTransform: "uppercase", letterSpacing: "0.08em",
                          marginBottom: 8, paddingLeft: 2,
                        }}>
                          {status === "In Progress" ? "▶ In Progress" : "○ To Do"} ({group.length})
                        </div>
                        {group.map(t => (
                          <SidebarTaskItem
                            key={t._id}
                            task={t}
                            projectId={t._projectId}
                            projectName={t._projectName}
                            currentUserId={currentUserId}
                            onTaskComplete={handleTaskComplete}
                          />
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => fetchProjects().then(mine => { if (mine.length) fetchAllTasks(mine); })}
                onPointerDown={stopDragEvent}
                style={{
                  width: "100%", padding: "7px", borderRadius: T.radiusSm,
                  fontSize: "0.75rem", fontFamily: T.font,
                  background: T.bgInput, border: `1px solid ${T.border}`,
                  color: T.textSecondary, cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderFocus; e.currentTarget.style.color = T.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary; }}
              >↻ Refresh</button>
            </div>
          </div>
        )}
      </div>

      {kanbanProject && (
        <ProjectKanban
          open={kanbanOpen}
          onClose={() => {
            setKanbanOpen(false);
            setKanbanProject(null);
            fetchAllTasks(projects);
          }}
          project={kanbanProject}
        />
      )}
    </>
  );
};

export default DeveloperDashboard;