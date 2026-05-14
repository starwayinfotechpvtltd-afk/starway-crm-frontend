// import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import {
//   Box, Typography, IconButton, Button, Avatar, Tooltip,
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   TextField, FormControl, Select, MenuItem, CircularProgress,
//   Snackbar, Alert, Chip,
// } from "@mui/material";
// import {
//   Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon,
//   Edit as EditIcon, CheckCircle as CheckCircleIcon,
//   Link as LinkIcon, CalendarToday as CalendarIcon,
//   History as HistoryIcon, ViewKanban as KanbanIcon,
//   BarChart as ChartIcon, List as ListIcon,
//   Send as SendIcon, Chat as ChatIcon,
//   FilterList as FilterIcon,
// } from "@mui/icons-material";
// import axios from "axios";
// // Added differenceInCalendarDays for strict day-to-day comparison without time bleeding
// import { format, isBefore, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, differenceInCalendarDays } from "date-fns";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// // ── Design tokens ─────────────────────────────────────────────────────────────
// const J = {
//   blue: "#0052CC", blueDark: "#0747A6", blueLight: "#DEEBFF",
//   green: "#006644", greenBg: "#E3FCEF", greenAccent: "#00A86B",
//   red: "#BF2600", redBg: "#FFEBE6",
//   orange: "#974F0C", orangeBg: "#FFF0B3",
//   purple: "#5243AA", purpleBg: "#EAE6FF",
//   border: "#DFE1E6", borderFocus: "#4C9AFF",
//   bgPage: "#F4F5F7", bgSurface: "#FFFFFF", bgHover: "#EBECF0", bgSubtle: "#F4F5F7",
//   textPrimary: "#172B4D", textSecondary: "#5E6C84", textDisabled: "#A5ADBA",
//   radius: "3px",
//   shadowCard: "0 1px 3px rgba(9,30,66,0.13)",
//   shadowCardHover: "0 4px 12px rgba(9,30,66,0.2)",
// };

// const PRIORITY_CONFIG = {
//   Low:      { color: J.green,  bg: J.greenBg,  icon: "↓", bar: "#00A86B" },
//   Medium:   { color: J.blue,   bg: J.blueLight, icon: "→", bar: "#0052CC" },
//   High:     { color: J.orange, bg: J.orangeBg,  icon: "↑", bar: "#FF8B00" },
//   Critical: { color: J.red,    bg: J.redBg,     icon: "⚑", bar: "#BF2600" },
// };

// const COLUMNS = [
//   { id: "Todo",        label: "To Do",       color: J.textSecondary },
//   { id: "In Progress", label: "In Progress",  color: J.blue },
//   { id: "Done",        label: "Done",         color: J.green },
// ];

// const AVATAR_PALETTE = ["#0052CC","#00875A","#FF5630","#FF991F","#6554C0","#00B8D9"];
// const stringToColor = (s) => {
//   if (!s) return AVATAR_PALETTE[0];
//   let h = 0;
//   for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
//   return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
// };

// const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// // Today's date in yyyy-MM-dd for min attribute on date inputs
// const todayStr = () => format(new Date(), "yyyy-MM-dd");

// // ── Small helpers ─────────────────────────────────────────────────────────────
// const PriorityBadge = ({ priority }) => {
//   const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
//   return (
//     <Box sx={{ display:"inline-flex", alignItems:"center", gap:"3px", px:0.75, py:0.25,
//       borderRadius:J.radius, bgcolor:cfg.bg, color:cfg.color,
//       fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.03em", userSelect:"none" }}>
//       <span style={{ fontSize:"0.75rem" }}>{cfg.icon}</span>{priority}
//     </Box>
//   );
// };

// const DeadlineChip = ({ deadline }) => {
//   if (!deadline) return null;
//   const d = new Date(deadline);
  
//   // Use differenceInCalendarDays to safely ignore hours/minutes
//   const diff = differenceInCalendarDays(d, new Date());
  
//   const isOverdue = diff < 0;
//   const isCritical = diff === 0 || diff === 1; // Today or Tomorrow
//   const isSoon = diff > 1 && diff <= 3; // In 2-3 days

//   let bgcolor = J.bgSubtle;
//   let color = J.textSecondary;
//   let label = format(d, "MMM d");
//   let icon = <CalendarIcon sx={{ fontSize:10 }} />;

//   if (isOverdue) {
//     bgcolor = "#A40E26"; // Distinct Deep Red
//     color = "#FFFFFF";
//     label = `OVERDUE (${Math.abs(diff)}d)`;
//     icon = <span style={{ fontSize:"10px", lineHeight:1 }}>🚨</span>;
//   } else if (isCritical) {
//     bgcolor = J.redBg;
//     color = J.red;
//     label = diff === 0 ? "Due Today" : "Due Tomorrow";
//     icon = <span style={{ fontSize:"10px", lineHeight:1 }}>🔥</span>;
//   } else if (isSoon) {
//     bgcolor = J.orangeBg;
//     color = J.orange;
//     label = `Due in ${diff}d`;
//   }

//   return (
//     <Box sx={{ display:"inline-flex", alignItems:"center", gap:"4px", px:0.75, py:0.25,
//       borderRadius:J.radius, bgcolor, color,
//       fontSize:"0.68rem", fontWeight:700 }}>
//       {icon} {label}
//     </Box>
//   );
// };

// // ── Comments panel ────────────────────────────────────────────────────────────
// const CommentsPanel = ({ taskId, projectId, currentUserId, currentUsername }) => {
//   const [comments, setComments] = useState([]);
//   const [loading,  setLoading]  = useState(false);
//   const [text,     setText]     = useState("");
//   const [posting,  setPosting]  = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const bottomRef = useRef(null);

//   const fetchComments = useCallback(async () => {
//     if (!taskId || !projectId) return;
//     setLoading(true);
//     try {
//       const r = await axios.get(
//         `${API_BASE}/api/tasks/${projectId}/${taskId}/comments`,
//         { headers: authHeaders() }
//       );
//       setComments(r.data || []);
//     } catch {
//       setComments([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [taskId, projectId]);

//   useEffect(() => { fetchComments(); }, [fetchComments]);
//   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

//   const postComment = async () => {
//     if (!text.trim()) return;
//     setPosting(true);
//     try {
//       await axios.post(
//         `${API_BASE}/api/tasks/${projectId}/${taskId}/comments`,
//         { text: text.trim() },
//         { headers: authHeaders() }
//       );
//       setText("");
//       await fetchComments();
//     } catch (err) {
//       console.error("Post comment error:", err);
//     } finally {
//       setPosting(false);
//     }
//   };

//   const deleteComment = async (commentId) => {
//     setDeletingId(commentId);
//     try {
//       await axios.delete(
//         `${API_BASE}/api/tasks/${projectId}/${taskId}/comments/${commentId}`,
//         { headers: authHeaders() }
//       );
//       setComments(prev => prev.filter(c => c._id !== commentId));
//     } catch (err) {
//       console.error("Delete comment error:", err);
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <Box sx={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
//       <Box sx={{ flex:1, overflowY:"auto", p:1.5, display:"flex", flexDirection:"column", gap:1 }}>
//         {loading ? (
//           <Box sx={{ display:"flex", justifyContent:"center", pt:2 }}>
//             <CircularProgress size={18} sx={{ color:J.blue }} />
//           </Box>
//         ) : comments.length === 0 ? (
//           <Box sx={{ textAlign:"center", py:3, color:J.textDisabled, fontSize:"0.78rem" }}>
//             No comments yet — be the first!
//           </Box>
//         ) : comments.map((c, i) => {
//           const isMe = c.createdBy?.id?.toString() === currentUserId?.toString();
//           return (
//             <Box key={c._id || i} sx={{ display:"flex", gap:1, alignItems:"flex-start",
//               flexDirection: isMe ? "row-reverse" : "row" }}>
//               <Avatar sx={{ width:24, height:24, fontSize:"0.6rem", fontWeight:700,
//                 bgcolor: stringToColor(c.createdBy?.username), flexShrink:0 }}>
//                 {c.createdBy?.username?.charAt(0).toUpperCase()}
//               </Avatar>
//               <Box sx={{ maxWidth:"75%" }}>
//                 <Box sx={{ display:"flex", alignItems:"center", gap:0.5, mb:0.25,
//                   justifyContent: isMe ? "flex-end" : "flex-start" }}>
//                   <Typography sx={{ fontSize:"0.68rem", fontWeight:600, color:J.textSecondary }}>
//                     {isMe ? "You" : c.createdBy?.username}
//                   </Typography>
//                   <Typography sx={{ fontSize:"0.62rem", color:J.textDisabled }}>
//                     · {c.createdAt ? format(new Date(c.createdAt), "MMM d, h:mm a") : ""}
//                   </Typography>
//                   {isMe && (
//                     <Tooltip title="Delete" arrow>
//                       <IconButton
//                         size="small"
//                         onClick={() => deleteComment(c._id)}
//                         disabled={deletingId === c._id}
//                         sx={{ p:"1px", ml:0.25, color:J.textDisabled,
//                           "&:hover":{ color:J.red, bgcolor:J.redBg },
//                           opacity: deletingId === c._id ? 0.5 : 1 }}>
//                         {deletingId === c._id
//                           ? <CircularProgress size={10} />
//                           : <DeleteIcon sx={{ fontSize:11 }} />}
//                       </IconButton>
//                     </Tooltip>
//                   )}
//                 </Box>
//                 <Box sx={{ bgcolor: isMe ? J.blueLight : J.bgPage,
//                   border:`1px solid ${isMe ? "#B3D4FF" : J.border}`,
//                   borderRadius: isMe ? "8px 2px 8px 8px" : "2px 8px 8px 8px",
//                   px:1.25, py:0.75 }}>
//                   <Typography sx={{ fontSize:"0.8rem", color:J.textPrimary, lineHeight:1.5,
//                     whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
//                     {c.text}
//                   </Typography>
//                 </Box>
//               </Box>
//             </Box>
//           );
//         })}
//         <div ref={bottomRef} />
//       </Box>

//       {/* Input */}
//       <Box sx={{ p:1.25, borderTop:`1px solid ${J.border}`, display:"flex", gap:1, alignItems:"flex-end" }}>
//         <TextField
//           multiline maxRows={3} fullWidth size="small"
//           placeholder="Write a comment…"
//           value={text}
//           onChange={e => setText(e.target.value)}
//           onKeyDown={e => {
//             if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); }
//           }}
//           sx={{ "& .MuiOutlinedInput-root":{ borderRadius:"6px", fontSize:"0.8rem",
//             "& fieldset":{ borderColor:J.border },
//             "&:hover fieldset":{ borderColor:J.borderFocus },
//             "&.Mui-focused fieldset":{ borderColor:J.blue } } }}
//         />
//         <IconButton
//           size="small" onClick={postComment}
//           disabled={!text.trim() || posting}
//           sx={{ bgcolor:J.blue, color:"#fff", borderRadius:"6px", p:"7px",
//             "&:hover":{ bgcolor:J.blueDark },
//             "&:disabled":{ bgcolor:J.bgSubtle, color:J.textDisabled } }}>
//           {posting
//             ? <CircularProgress size={14} sx={{ color:"#fff" }} />
//             : <SendIcon sx={{ fontSize:15 }} />}
//         </IconButton>
//       </Box>
//     </Box>
//   );
// };

// // ── Task Detail Dialog ────────────────────────────────────────────────────────
// const TaskDetailDialog = ({ open, onClose, task, projectId, currentUserId, currentUsername,
//   canEdit, onEdit, canDelete, onDelete }) => {
//   const [tab, setTab] = useState("details");
//   if (!task) return null;
//   const isDone = task.status === "Done";

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
//       PaperProps={{ sx:{ borderRadius:"8px", height:"75vh", display:"flex", flexDirection:"column" } }}>
//       <DialogTitle sx={{ borderBottom:`1px solid ${J.border}`, py:1.5, px:2.5,
//         display:"flex", alignItems:"center", justifyContent:"space-between" }}>
//         <Box sx={{ flex:1, minWidth:0, mr:1 }}>
//           <Typography sx={{ fontWeight:700, fontSize:"0.9375rem",
//             color: isDone ? J.green : J.textPrimary,
//             textDecoration: isDone ? "line-through" : "none", lineHeight:1.3 }}>
//             {task.title}
//           </Typography>
//           <Box sx={{ display:"flex", gap:0.5, mt:0.5, flexWrap:"wrap" }}>
//             <PriorityBadge priority={task.priority} />
//             {!isDone && <DeadlineChip deadline={task.deadline} />}
//             {isDone && (
//               <Box sx={{ display:"inline-flex", alignItems:"center", gap:"3px", px:0.75, py:0.25,
//                 borderRadius:J.radius, bgcolor:J.greenBg, color:J.green, fontSize:"0.68rem", fontWeight:700 }}>
//                 <CheckCircleIcon sx={{ fontSize:10 }} /> Done
//               </Box>
//             )}
//           </Box>
//         </Box>
//         <Box sx={{ display:"flex", gap:0.5, flexShrink:0 }}>
//           {canEdit && (
//             <Tooltip title="Edit">
//               <IconButton size="small" onClick={() => { onClose(); onEdit(task); }}
//                 sx={{ p:"4px", "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
//                 <EditIcon sx={{ fontSize:14 }} />
//               </IconButton>
//             </Tooltip>
//           )}
//           {canDelete && (
//             <Tooltip title="Delete">
//               <IconButton size="small" onClick={() => { onDelete(task._id); onClose(); }}
//                 sx={{ p:"4px", "&:hover":{ color:J.red, bgcolor:J.redBg } }}>
//                 <DeleteIcon sx={{ fontSize:14 }} />
//               </IconButton>
//             </Tooltip>
//           )}
//           <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize:16 }} /></IconButton>
//         </Box>
//       </DialogTitle>

//       {/* Tabs */}
//       <Box sx={{ display:"flex", borderBottom:`1px solid ${J.border}`, px:2.5, flexShrink:0 }}>
//         {[{ id:"details", label:"Details" }, { id:"comments", label:"Comments", icon:<ChatIcon sx={{ fontSize:12 }} /> }]
//           .map(t => (
//           <Box key={t.id} onClick={() => setTab(t.id)}
//             sx={{ py:1, px:1.5, cursor:"pointer", fontSize:"0.8rem",
//               fontWeight: tab===t.id ? 700 : 400,
//               color: tab===t.id ? J.blue : J.textSecondary,
//               borderBottom: tab===t.id ? `2px solid ${J.blue}` : "2px solid transparent",
//               display:"flex", alignItems:"center", gap:0.5,
//               "&:hover":{ color:J.blue } }}>
//             {t.icon}{t.label}
//           </Box>
//         ))}
//       </Box>

//       <DialogContent sx={{ p:0, flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
//         {tab === "details" ? (
//           <Box sx={{ p:2.5, overflowY:"auto" }}>
//             {task.description && (
//               <Box sx={{ mb:2 }}>
//                 <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
//                   textTransform:"uppercase", letterSpacing:"0.05em", mb:0.5 }}>Description</Typography>
//                 <Typography sx={{ fontSize:"0.85rem", color:J.textSecondary, lineHeight:1.6,
//                   whiteSpace:"pre-wrap" }}>{task.description}</Typography>
//               </Box>
//             )}
//             <Box sx={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, mb:2 }}>
//               <Box>
//                 <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
//                   textTransform:"uppercase", letterSpacing:"0.05em", mb:0.5 }}>Assigned To</Typography>
//                 <Box sx={{ display:"flex", alignItems:"center", gap:0.75 }}>
//                   <Avatar sx={{ width:20, height:20, fontSize:"0.6rem",
//                     bgcolor:stringToColor(task.assignedTo?.username) }}>
//                     {task.assignedTo?.username?.charAt(0).toUpperCase()}
//                   </Avatar>
//                   <Typography sx={{ fontSize:"0.82rem", color:J.textPrimary }}>{task.assignedTo?.username}</Typography>
//                 </Box>
//               </Box>
//               {!isDone && task.deadline && (
//                 <Box>
//                   <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
//                     textTransform:"uppercase", letterSpacing:"0.05em", mb:0.5 }}>Deadline</Typography>
//                   <DeadlineChip deadline={task.deadline} />
//                 </Box>
//               )}
//               {isDone && task.completedAt && (
//                 <Box>
//                   <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
//                     textTransform:"uppercase", letterSpacing:"0.05em", mb:0.5 }}>Completed</Typography>
//                   <Typography sx={{ fontSize:"0.82rem", color:J.green }}>
//                     {format(new Date(task.completedAt), "MMM d, yyyy")}
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//             {task.links?.length > 0 && (
//               <Box>
//                 <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
//                   textTransform:"uppercase", letterSpacing:"0.05em", mb:0.75 }}>Links</Typography>
//                 {task.links.map((link, i) => (
//                   <Box key={i} component="a" href={link} target="_blank" rel="noopener noreferrer"
//                     sx={{ display:"flex", alignItems:"center", gap:0.5, mb:0.5, color:J.blue,
//                       fontSize:"0.8rem", textDecoration:"none", "&:hover":{ textDecoration:"underline" } }}>
//                     <LinkIcon sx={{ fontSize:12 }} />{link}
//                   </Box>
//                 ))}
//               </Box>
//             )}
//             {isDone && task.completedBy && (
//               <Box sx={{ mt:2, p:1.25, bgcolor:J.greenBg, borderRadius:"6px",
//                 border:`1px solid ${J.green}30`, display:"flex", alignItems:"center", gap:0.75 }}>
//                 <CheckCircleIcon sx={{ fontSize:14, color:J.green }} />
//                 <Typography sx={{ fontSize:"0.78rem", color:J.green }}>
//                   Completed by <strong>{task.completedBy?.username}</strong>
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//         ) : (
//           <CommentsPanel
//             taskId={task._id} projectId={projectId}
//             currentUserId={currentUserId} currentUsername={currentUsername}
//           />
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// // ── Task card ─────────────────────────────────────────────────────────────────
// const TaskCard = ({ task, currentUserId, isCreator, isAdmin, isDeveloper,
//   onEdit, onDelete, onComplete, onDragStart, onDragEnd, onClick }) => {
//   const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
//   const isDone     = task.status === "Done";
//   const canComplete = (isAssigned || isAdmin) && !isDone;
//   const canEdit     = isAdmin || isCreator || (isDeveloper && isAssigned);
//   const canDelete   = isAdmin || isCreator || (isDeveloper && isAssigned);
//   const canDrag     = isAdmin || isCreator || isDeveloper;

//   return (
//     <Box
//       draggable={canDrag}
//       onDragStart={e => canDrag && onDragStart(e, task)}
//       onDragEnd={canDrag ? onDragEnd : undefined}
//       onClick={() => onClick(task)}
//       sx={{
//         bgcolor: isDone ? "#F0FFF6" : J.bgSurface,
//         border: `1px solid ${isDone ? "#A3D9B1" : J.border}`,
//         borderLeft: isDone ? `3px solid ${J.greenAccent}` : `3px solid transparent`,
//         borderRadius: J.radius,
//         p: "10px 12px", mb:1,
//         boxShadow: isDone ? "none" : J.shadowCard,
//         cursor: canDrag ? "grab" : "pointer",
//         transition: "box-shadow 0.15s, transform 0.1s, border-color 0.2s, background 0.2s",
//         "&:hover": { boxShadow: isDone ? "0 1px 4px rgba(0,100,68,0.12)" : J.shadowCardHover, transform:"translateY(-1px)" },
//         "&:active": { cursor: canDrag ? "grabbing" : "pointer" },
//         position:"relative",
//       }}>
//       <Box sx={{ display:"flex", gap:0.5, mb:0.75, flexWrap:"wrap" }}>
//         <PriorityBadge priority={task.priority} />
//         {!isDone && <DeadlineChip deadline={task.deadline} />}
//         {isDone && (
//           <Box sx={{ display:"inline-flex", alignItems:"center", gap:"3px", px:0.75, py:0.25,
//             borderRadius:J.radius, bgcolor:J.greenBg, color:J.green, fontSize:"0.68rem", fontWeight:700 }}>
//             <CheckCircleIcon sx={{ fontSize:10 }} /> Completed
//           </Box>
//         )}
//       </Box>

//       <Typography sx={{ fontSize:"0.8125rem", fontWeight:600, lineHeight:1.4, mb:0.5,
//         color: isDone ? J.green : J.textPrimary,
//         textDecoration: isDone ? "line-through" : "none" }}>
//         {task.title}
//       </Typography>

//       {task.description && (
//         <Typography sx={{ fontSize:"0.75rem", color:J.textSecondary, lineHeight:1.4, mb:0.75,
//           overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
//           {task.description}
//         </Typography>
//       )}

//       <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mt:0.5 }}>
//         <Tooltip title={`Assigned to: ${task.assignedTo?.username}`} arrow>
//           <Box sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
//             <Avatar sx={{ width:20, height:20, fontSize:"0.6rem", fontWeight:700,
//               bgcolor: isDone ? J.greenAccent : stringToColor(task.assignedTo?.username) }}>
//               {task.assignedTo?.username?.charAt(0).toUpperCase()}
//             </Avatar>
//             <Typography sx={{ fontSize:"0.72rem", color: isDone ? J.green : J.textSecondary }}>
//               {task.assignedTo?.username}
//             </Typography>
//           </Box>
//         </Tooltip>

//         <Box sx={{ display:"flex", gap:0.25 }} onClick={e => e.stopPropagation()}>
//           {canComplete && (
//             <Tooltip title="Mark complete" arrow>
//               <IconButton size="small" onClick={() => onComplete(task)}
//                 sx={{ p:"3px", color:J.textDisabled, "&:hover":{ color:J.green, bgcolor:J.greenBg } }}>
//                 <CheckCircleIcon sx={{ fontSize:14 }} />
//               </IconButton>
//             </Tooltip>
//           )}
//           {canEdit && (
//             <Tooltip title="Edit" arrow>
//               <IconButton size="small" onClick={() => onEdit(task)}
//                 sx={{ p:"3px", color:J.textDisabled, "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
//                 <EditIcon sx={{ fontSize:13 }} />
//               </IconButton>
//             </Tooltip>
//           )}
//           {canDelete && (
//             <Tooltip title="Delete" arrow>
//               <IconButton size="small" onClick={() => onDelete(task._id)}
//                 sx={{ p:"3px", color:J.textDisabled, "&:hover":{ color:J.red, bgcolor:J.redBg } }}>
//                 <DeleteIcon sx={{ fontSize:13 }} />
//               </IconButton>
//             </Tooltip>
//           )}
//         </Box>
//       </Box>

//       {isDone && task.completedAt && (
//         <Box sx={{ mt:0.75, pt:0.75, borderTop:`1px solid #A3D9B130`,
//           display:"flex", alignItems:"center", gap:0.5 }}>
//           <CheckCircleIcon sx={{ fontSize:11, color:J.green }} />
//           <Typography sx={{ fontSize:"0.68rem", color:J.green }}>
//             {task.completedBy?.username} · {format(new Date(task.completedAt),"MMM d, yyyy")}
//           </Typography>
//         </Box>
//       )}
//     </Box>
//   );
// };

// // ── Kanban Column ─────────────────────────────────────────────────────────────
// const KanbanColumn = ({ column, tasks, currentUserId, isCreator, isAdmin, isDeveloper,
//   canAddTask, onAddTask, onEdit, onDelete, onComplete, onDragStart, onDragEnd,
//   onDrop, onDragOver, onCardClick }) => {
//   const [isOver, setIsOver] = useState(false);
//   return (
//     <Box
//       onDragOver={e => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
//       onDragLeave={() => setIsOver(false)}
//       onDrop={e => { setIsOver(false); onDrop(e, column.id); }}
//       sx={{ flex:"1 1 0", minWidth:240, maxWidth:340,
//         bgcolor: isOver ? "#EBF2FF" : J.bgPage,
//         border:`2px dashed ${isOver ? J.blue : "transparent"}`,
//         borderRadius:"4px", transition:"background 0.15s, border-color 0.15s",
//         display:"flex", flexDirection:"column" }}>
//       <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between",
//         px:1.5, py:1.25, borderBottom:`2px solid ${column.color}20` }}>
//         <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
//           <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:column.color, flexShrink:0 }} />
//           <Typography sx={{ fontSize:"0.75rem", fontWeight:700, color:column.color,
//             textTransform:"uppercase", letterSpacing:"0.06em" }}>{column.label}</Typography>
//           <Box sx={{ bgcolor:`${column.color}20`, color:column.color, borderRadius:"10px",
//             px:0.75, fontSize:"0.68rem", fontWeight:700, lineHeight:1.6, minWidth:18, textAlign:"center" }}>
//             {tasks.length}
//           </Box>
//         </Box>
//         {canAddTask && column.id === "Todo" && (
//           <Tooltip title="Add task" arrow>
//             <IconButton size="small" onClick={onAddTask}
//               sx={{ p:"3px", color:J.textSecondary, "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
//               <AddIcon sx={{ fontSize:16 }} />
//             </IconButton>
//           </Tooltip>
//         )}
//       </Box>
//       <Box sx={{ flex:1, overflowY:"auto", p:1.25, minHeight:80 }}>
//         {tasks.length === 0 && (
//           <Box sx={{ textAlign:"center", py:3, color:J.textDisabled, fontSize:"0.75rem" }}>No tasks</Box>
//         )}
//         {tasks.map(task => (
//           <TaskCard key={task._id} task={task}
//             currentUserId={currentUserId} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper}
//             onEdit={onEdit} onDelete={onDelete} onComplete={onComplete}
//             onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onCardClick} />
//         ))}
//       </Box>
//     </Box>
//   );
// };

// // ── Task Form Dialog ──────────────────────────────────────────────────────────
// const TaskFormDialog = ({ open, onClose, onSubmit, initialData, projectDevelopers,
//   isCreator, isAdmin, isDeveloper, currentUserId, currentUsername }) => {

//   const blankForm = useCallback(() => ({
//     title: "",
//     description: "",
//     links: [],
//     priority: "Medium",
//     deadline: "",
//     assignedTo: { id: currentUserId, username: currentUsername },
//   }), [currentUserId, currentUsername]);

//   const [form,        setForm]       = useState(blankForm);
//   const [linkInput,   setLinkInput]  = useState("");
//   const [errors,      setErrors]     = useState({});

//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         title:        initialData.title        || "",
//         description:  initialData.description  || "",
//         links:        initialData.links        || [],
//         priority:     initialData.priority     || "Medium",
//         deadline:     initialData.deadline
//           ? format(new Date(initialData.deadline), "yyyy-MM-dd")
//           : "",
//         assignedTo:   initialData.assignedTo   || { id: currentUserId, username: currentUsername },
//       });
//     } else {
//       setForm(blankForm());
//     }
//     setLinkInput("");
//     setErrors({});
//   }, [open, initialData, currentUserId, currentUsername, blankForm]);

//   const set = (k, v) => {
//     setForm(p => ({ ...p, [k]: v }));
//     if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
//   };

//   const addLink = () => {
//     if (linkInput.trim()) {
//       set("links", [...form.links, linkInput.trim()]);
//       setLinkInput("");
//     }
//   };

//   const removeLink = i => set("links", form.links.filter((_, idx) => idx !== i));

//   const validate = () => {
//     const e = {};
//     if (!form.title.trim())    e.title    = "Title is required";
//     if (!form.deadline)        e.deadline = "Deadline is required";
//     return e;
//   };

//   const handleSubmit = () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     onSubmit({ ...form, deadline: form.deadline || null });
//   };

//   const canAssignToOthers = isAdmin || isCreator;
//   const visibleDevelopers = canAssignToOthers
//     ? projectDevelopers
//     : projectDevelopers.filter(d => d.id === currentUserId);

//   const labelSx = {
//     fontSize:"0.75rem", fontWeight:600, color:J.textSecondary, mb:0.5,
//     display:"block", textTransform:"uppercase", letterSpacing:"0.04em",
//   };
//   const fieldSx = {
//     "& .MuiOutlinedInput-root":{ borderRadius:J.radius, fontSize:"0.875rem",
//       "& fieldset":{ borderColor:J.border },
//       "&:hover fieldset":{ borderColor:J.borderFocus },
//       "&.Mui-focused fieldset":{ borderColor:J.blue },
//     },
//   };
//   const errorFieldSx = (key) => ({
//     ...fieldSx,
//     "& .MuiOutlinedInput-root":{ ...fieldSx["& .MuiOutlinedInput-root"],
//       "& fieldset":{ borderColor: errors[key] ? J.red : J.border },
//     },
//   });

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
//       PaperProps={{ sx:{ borderRadius:"8px" } }}>
//       <DialogTitle sx={{ borderBottom:`1px solid ${J.border}`, py:2, px:3,
//         display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//         <Typography sx={{ fontWeight:600, fontSize:"1rem", color:J.textPrimary }}>
//           {initialData ? "Edit Task" : "Create Task"}
//         </Typography>
//         <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize:18 }} /></IconButton>
//       </DialogTitle>

//       <DialogContent sx={{ p:3 }}>
//         <Box sx={{ display:"flex", flexDirection:"column", gap:2 }}>

//           {/* Title — required */}
//           <Box>
//             <Typography component="span" sx={labelSx}>
//               Title <span style={{ color:J.red }}>*</span>
//             </Typography>
//             <TextField
//               fullWidth size="small"
//               value={form.title}
//               onChange={e => set("title", e.target.value)}
//               placeholder="What needs to be done?"
//               error={!!errors.title}
//               helperText={errors.title}
//               sx={errorFieldSx("title")}
//               FormHelperTextProps={{ sx:{ fontSize:"0.7rem", color:J.red, mt:0.25 } }}
//             />
//           </Box>

//           {/* Description */}
//           <Box>
//             <Typography component="span" sx={labelSx}>Description</Typography>
//             <TextField
//               fullWidth size="small" multiline rows={3}
//               value={form.description}
//               onChange={e => set("description", e.target.value)}
//               placeholder="Add details, context, or acceptance criteria..."
//               sx={fieldSx}
//             />
//           </Box>

//           {/* Priority + Deadline */}
//           <Box sx={{ display:"flex", gap:2 }}>
//             <Box sx={{ flex:1 }}>
//               <Typography component="span" sx={labelSx}>Priority</Typography>
//               <FormControl fullWidth size="small" sx={fieldSx}>
//                 <Select
//                   value={form.priority}
//                   onChange={e => set("priority", e.target.value)}
//                   sx={{ borderRadius:J.radius, fontSize:"0.875rem" }}>
//                   {["Low","Medium","High","Critical"].map(p => (
//                     <MenuItem key={p} value={p} sx={{ fontSize:"0.875rem" }}>
//                       <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
//                         <span>{PRIORITY_CONFIG[p].icon}</span>{p}
//                       </Box>
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>

//             {/* Deadline — required, no past dates */}
//             <Box sx={{ flex:1 }}>
//               <Typography component="span" sx={labelSx}>
//                 Deadline <span style={{ color:J.red }}>*</span>
//               </Typography>
//               <TextField
//                 fullWidth size="small" type="date"
//                 value={form.deadline}
//                 onChange={e => set("deadline", e.target.value)}
//                 inputProps={{ min: todayStr() }}
//                 error={!!errors.deadline}
//                 helperText={errors.deadline}
//                 sx={errorFieldSx("deadline")}
//                 InputLabelProps={{ shrink:true }}
//                 FormHelperTextProps={{ sx:{ fontSize:"0.7rem", color:J.red, mt:0.25 } }}
//               />
//             </Box>
//           </Box>

//           {/* Assign To */}
//           <Box>
//             <Typography component="span" sx={labelSx}>
//               Assign To
//               {!canAssignToOthers && (
//                 <Typography component="span" sx={{ fontSize:"0.68rem", color:J.textDisabled, ml:1,
//                   textTransform:"none", fontWeight:400 }}>(you only)</Typography>
//               )}
//             </Typography>
//             <FormControl fullWidth size="small" sx={fieldSx}>
//               <Select
//                 value={form.assignedTo?.id || ""}
//                 disabled={!canAssignToOthers}
//                 onChange={e => {
//                   const dev = projectDevelopers.find(d => d.id === e.target.value);
//                   if (dev) set("assignedTo", dev);
//                 }}
//                 sx={{ borderRadius:J.radius, fontSize:"0.875rem" }}>
//                 {visibleDevelopers.map(dev => (
//                   <MenuItem key={dev.id} value={dev.id} sx={{ fontSize:"0.875rem" }}>
//                     <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
//                       <Avatar sx={{ width:20, height:20, fontSize:"0.6rem", bgcolor:stringToColor(dev.username) }}>
//                         {dev.username.charAt(0).toUpperCase()}
//                       </Avatar>
//                       {dev.username}
//                       {dev.id === currentUserId && (
//                         <Typography sx={{ fontSize:"0.72rem", color:J.textSecondary }}>(you)</Typography>
//                       )}
//                     </Box>
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>

//           {/* Links */}
//           <Box>
//             <Typography component="span" sx={labelSx}>Links / References</Typography>
//             <Box sx={{ display:"flex", gap:1, mb:0.75 }}>
//               <TextField
//                 fullWidth size="small"
//                 value={linkInput}
//                 onChange={e => setLinkInput(e.target.value)}
//                 onKeyPress={e => e.key === "Enter" && addLink()}
//                 placeholder="https://..."
//                 sx={fieldSx}
//               />
//               <Button variant="outlined" size="small" onClick={addLink}
//                 sx={{ height:32, borderRadius:J.radius, color:J.blue, borderColor:J.border,
//                   textTransform:"none", fontSize:"0.8125rem", whiteSpace:"nowrap",
//                   "&:hover":{ borderColor:J.blue, bgcolor:J.blueLight } }}>
//                 Add
//               </Button>
//             </Box>
//             {form.links.map((link, i) => (
//               <Box key={i} sx={{ display:"flex", alignItems:"center", gap:0.5, mb:0.5 }}>
//                 <LinkIcon sx={{ fontSize:13, color:J.blue }} />
//                 <Typography
//                   component="a" href={link} target="_blank" rel="noopener noreferrer"
//                   sx={{ fontSize:"0.8rem", color:J.blue, flex:1, overflow:"hidden",
//                     textOverflow:"ellipsis", whiteSpace:"nowrap",
//                     textDecoration:"none", "&:hover":{ textDecoration:"underline" } }}>
//                   {link}
//                 </Typography>
//                 <IconButton size="small" onClick={() => removeLink(i)}
//                   sx={{ p:"2px", color:J.textDisabled }}>
//                   <CloseIcon sx={{ fontSize:12 }} />
//                 </IconButton>
//               </Box>
//             ))}
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ px:3, py:2, borderTop:`1px solid ${J.border}` }}>
//         <Button onClick={onClose}
//           sx={{ height:32, borderRadius:J.radius, color:J.textSecondary,
//             fontSize:"0.8125rem", textTransform:"none" }}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           variant="contained" disableElevation
//           sx={{ height:32, borderRadius:J.radius, bgcolor:J.blue,
//             fontSize:"0.8125rem", textTransform:"none",
//             "&:hover":{ bgcolor:J.blueDark } }}>
//           {initialData ? "Save changes" : "Create task"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// // ── Chart Tab ─────────────────────────────────────────────────────────────────
// const ChartTab = ({ tasks, projectDevelopers }) => {
//   const byStatus   = COLUMNS.map(c => ({ label:c.label, count:tasks.filter(t=>t.status===c.id).length, color:c.color }));
//   const byPriority = ["Critical","High","Medium","Low"].map(p => ({
//     label:p, count:tasks.filter(t=>t.priority===p).length, ...PRIORITY_CONFIG[p] }));
//   const byDev = projectDevelopers.map(d => ({
//     username: d.username,
//     todo: tasks.filter(t=>t.assignedTo?.id===d.id && t.status==="Todo").length,
//     wip:  tasks.filter(t=>t.assignedTo?.id===d.id && t.status==="In Progress").length,
//     done: tasks.filter(t=>t.assignedTo?.id===d.id && t.status==="Done").length,
//   }));
//   const maxStatus   = Math.max(...byStatus.map(s=>s.count), 1);
//   const maxPriority = Math.max(...byPriority.map(p=>p.count), 1);
//   const totalTasks  = tasks.length;
//   const doneTasks   = tasks.filter(t=>t.status==="Done").length;
//   const progress    = totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0;

//   return (
//     <Box sx={{ p:2.5, overflowY:"auto", height:"100%", display:"flex", flexDirection:"column", gap:2.5 }}>
//       <Box sx={{ bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"6px", p:2,
//         display:"flex", alignItems:"center", gap:2.5 }}>
//         <Box sx={{ position:"relative", width:80, height:80, flexShrink:0 }}>
//           <svg width="80" height="80" viewBox="0 0 80 80">
//             <circle cx="40" cy="40" r="34" fill="none" stroke={J.border} strokeWidth="8" />
//             <circle cx="40" cy="40" r="34" fill="none" stroke={J.greenAccent} strokeWidth="8"
//               strokeDasharray={`${2*Math.PI*34*progress/100} ${2*Math.PI*34*(1-progress/100)}`}
//               strokeLinecap="round" transform="rotate(-90 40 40)"
//               style={{ transition:"stroke-dasharray 0.5s ease" }} />
//           </svg>
//           <Box sx={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
//             justifyContent:"center", flexDirection:"column" }}>
//             <Typography sx={{ fontSize:"1.1rem", fontWeight:800, color:J.green, lineHeight:1 }}>{progress}%</Typography>
//           </Box>
//         </Box>
//         <Box>
//           <Typography sx={{ fontSize:"0.9rem", fontWeight:700, color:J.textPrimary, mb:0.5 }}>Project Progress</Typography>
//           <Typography sx={{ fontSize:"0.8rem", color:J.textSecondary }}>{doneTasks} of {totalTasks} tasks completed</Typography>
//         </Box>
//       </Box>

//       <Box sx={{ bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"6px", p:2 }}>
//         <Typography sx={{ fontSize:"0.78rem", fontWeight:700, color:J.textSecondary, mb:1.5,
//           textTransform:"uppercase", letterSpacing:"0.05em" }}>Tasks by Status</Typography>
//         {byStatus.map(s => (
//           <Box key={s.label} sx={{ mb:1.25 }}>
//             <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.4 }}>
//               <Typography sx={{ fontSize:"0.78rem", color:J.textPrimary, fontWeight:500 }}>{s.label}</Typography>
//               <Typography sx={{ fontSize:"0.78rem", color:J.textSecondary }}>{s.count}</Typography>
//             </Box>
//             <Box sx={{ height:8, bgcolor:J.bgSubtle, borderRadius:4, overflow:"hidden" }}>
//               <Box sx={{ height:"100%", width:`${(s.count/maxStatus)*100}%`, bgcolor:s.color,
//                 borderRadius:4, transition:"width 0.4s ease" }} />
//             </Box>
//           </Box>
//         ))}
//       </Box>

//       <Box sx={{ bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"6px", p:2 }}>
//         <Typography sx={{ fontSize:"0.78rem", fontWeight:700, color:J.textSecondary, mb:1.5,
//           textTransform:"uppercase", letterSpacing:"0.05em" }}>Tasks by Priority</Typography>
//         {byPriority.map(p => (
//           <Box key={p.label} sx={{ mb:1.25 }}>
//             <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.4 }}>
//               <Box sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
//                 <span style={{ fontSize:"0.75rem", color:p.color }}>{p.icon}</span>
//                 <Typography sx={{ fontSize:"0.78rem", color:J.textPrimary, fontWeight:500 }}>{p.label}</Typography>
//               </Box>
//               <Typography sx={{ fontSize:"0.78rem", color:J.textSecondary }}>{p.count}</Typography>
//             </Box>
//             <Box sx={{ height:8, bgcolor:J.bgSubtle, borderRadius:4, overflow:"hidden" }}>
//               <Box sx={{ height:"100%", width:`${(p.count/maxPriority)*100}%`, bgcolor:p.bar,
//                 borderRadius:4, transition:"width 0.4s ease" }} />
//             </Box>
//           </Box>
//         ))}
//       </Box>

//       {byDev.length > 0 && (
//         <Box sx={{ bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"6px", p:2 }}>
//           <Typography sx={{ fontSize:"0.78rem", fontWeight:700, color:J.textSecondary, mb:1.5,
//             textTransform:"uppercase", letterSpacing:"0.05em" }}>Workload by Developer</Typography>
//           {byDev.map(d => (
//             <Box key={d.username} sx={{ mb:1.5 }}>
//               <Box sx={{ display:"flex", alignItems:"center", gap:0.75, mb:0.75 }}>
//                 <Avatar sx={{ width:20, height:20, fontSize:"0.6rem", bgcolor:stringToColor(d.username) }}>
//                   {d.username.charAt(0).toUpperCase()}
//                 </Avatar>
//                 <Typography sx={{ fontSize:"0.8rem", fontWeight:600, color:J.textPrimary }}>{d.username}</Typography>
//               </Box>
//               <Box sx={{ display:"flex", gap:1 }}>
//                 {[{ label:"Todo", val:d.todo, color:J.textSecondary },
//                   { label:"WIP",  val:d.wip,  color:J.blue },
//                   { label:"Done", val:d.done, color:J.green }].map(s => (
//                   <Box key={s.label} sx={{ flex:1, textAlign:"center", p:"6px 4px",
//                     bgcolor:J.bgSubtle, borderRadius:"4px", border:`1px solid ${J.border}` }}>
//                     <Typography sx={{ fontSize:"1rem", fontWeight:700, color:s.color }}>{s.val}</Typography>
//                     <Typography sx={{ fontSize:"0.62rem", color:J.textDisabled }}>{s.label}</Typography>
//                   </Box>
//                 ))}
//               </Box>
//             </Box>
//           ))}
//         </Box>
//       )}
//     </Box>
//   );
// };

// // ── Calendar Tab ──────────────────────────────────────────────────────────────
// const CalendarTab = ({ tasks, onCardClick }) => {
//   const [current, setCurrent] = useState(new Date());
//   const monthStart = startOfMonth(current);
//   const monthEnd   = endOfMonth(current);
//   const days       = eachDayOfInterval({ start:monthStart, end:monthEnd });
//   const startPad   = getDay(monthStart);
//   const tasksWithDeadline = tasks.filter(t => t.deadline && t.status !== "Done");
//   const tasksOnDay = day => tasksWithDeadline.filter(t => isSameDay(new Date(t.deadline), day));

//   return (
//     <Box sx={{ p:2, overflowY:"auto", height:"100%" }}>
//       <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mb:2 }}>
//         <IconButton size="small"
//           onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}>
//           <Typography sx={{ fontSize:"1rem", color:J.textPrimary, lineHeight:1 }}>‹</Typography>
//         </IconButton>
//         <Typography sx={{ fontWeight:700, fontSize:"0.9rem", color:J.textPrimary }}>
//           {format(current, "MMMM yyyy")}
//         </Typography>
//         <IconButton size="small"
//           onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}>
//           <Typography sx={{ fontSize:"1rem", color:J.textPrimary, lineHeight:1 }}>›</Typography>
//         </IconButton>
//       </Box>

//       <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", mb:0.5 }}>
//         {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
//           <Box key={d} sx={{ textAlign:"center", fontSize:"0.65rem", fontWeight:700,
//             color:J.textDisabled, textTransform:"uppercase", py:0.5 }}>{d}</Box>
//         ))}
//       </Box>

//       <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px" }}>
//         {Array.from({ length:startPad }).map((_,i) => <Box key={`pad-${i}`} />)}
//         {days.map(day => {
//           const dayTasks = tasksOnDay(day);
//           const isCurrentDay = isToday(day);
//           return (
//             <Box key={day.toISOString()} sx={{ minHeight:64, border:`1px solid ${J.border}`,
//               borderRadius:"3px", bgcolor: isCurrentDay ? J.blueLight : J.bgSurface, p:"4px",
//               "&:hover":{ bgcolor: isCurrentDay ? "#C4DAFF" : J.bgHover } }}>
//               <Typography sx={{ fontSize:"0.7rem", fontWeight: isCurrentDay ? 800 : 500,
//                 color: isCurrentDay ? J.blue : J.textPrimary, mb:0.25 }}>
//                 {format(day,"d")}
//               </Typography>
//               {dayTasks.slice(0,2).map(t => (
//                 <Box key={t._id} onClick={() => onCardClick(t)}
//                   sx={{ fontSize:"0.6rem", fontWeight:600, mb:"2px", p:"1px 4px",
//                     borderRadius:"2px", cursor:"pointer", overflow:"hidden", whiteSpace:"nowrap",
//                     textOverflow:"ellipsis",
//                     bgcolor: PRIORITY_CONFIG[t.priority]?.bg || J.blueLight,
//                     color:   PRIORITY_CONFIG[t.priority]?.color || J.blue,
//                     "&:hover":{ opacity:0.8 } }}>
//                   {t.title}
//                 </Box>
//               ))}
//               {dayTasks.length > 2 && (
//                 <Typography sx={{ fontSize:"0.58rem", color:J.textDisabled }}>
//                   +{dayTasks.length-2} more
//                 </Typography>
//               )}
//             </Box>
//           );
//         })}
//       </Box>

//       <Box sx={{ mt:2 }}>
//         <Typography sx={{ fontSize:"0.75rem", fontWeight:700, color:J.textSecondary, mb:1,
//           textTransform:"uppercase", letterSpacing:"0.05em" }}>Upcoming Deadlines</Typography>
//         {tasksWithDeadline
//           .sort((a,b) => new Date(a.deadline)-new Date(b.deadline))
//           .slice(0,6)
//           .map(t => (
//             <Box key={t._id} onClick={() => onCardClick(t)}
//               sx={{ display:"flex", alignItems:"center", gap:1, p:"8px 12px",
//                 bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"4px",
//                 mb:0.75, cursor:"pointer", "&:hover":{ borderColor:J.blue, bgcolor:J.blueLight } }}>
//               <PriorityBadge priority={t.priority} />
//               <Typography sx={{ fontSize:"0.8rem", flex:1, fontWeight:500, color:J.textPrimary,
//                 overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</Typography>
//               <DeadlineChip deadline={t.deadline} />
//             </Box>
//           ))}
//         {tasksWithDeadline.length === 0 && (
//           <Typography sx={{ fontSize:"0.8rem", color:J.textDisabled, textAlign:"center", py:2 }}>
//             No upcoming deadlines
//           </Typography>
//         )}
//       </Box>
//     </Box>
//   );
// };

// // ── List Tab ──────────────────────────────────────────────────────────────────
// const ListTab = ({ tasks, currentUserId, isAdmin, isCreator, isDeveloper,
//   onEdit, onDelete, onComplete, onCardClick }) => {
//   const [sortBy, setSortBy] = useState("priority");
//   const priorityOrder = { Critical:0, High:1, Medium:2, Low:3 };
//   const sorted = [...tasks].sort((a,b) => {
//     if (sortBy === "priority") return (priorityOrder[a.priority]??2)-(priorityOrder[b.priority]??2);
//     if (sortBy === "deadline") {
//       if (!a.deadline && !b.deadline) return 0;
//       if (!a.deadline) return 1; if (!b.deadline) return -1;
//       return new Date(a.deadline)-new Date(b.deadline);
//     }
//     if (sortBy === "status")   return COLUMNS.findIndex(c=>c.id===a.status)-COLUMNS.findIndex(c=>c.id===b.status);
//     if (sortBy === "assignee") return (a.assignedTo?.username||"").localeCompare(b.assignedTo?.username||"");
//     return 0;
//   });
//   const statusColor = s => ({ "Todo":J.textSecondary, "In Progress":J.blue, "Done":J.green }[s]||J.textSecondary);

//   return (
//     <Box sx={{ height:"100%", display:"flex", flexDirection:"column" }}>
//       <Box sx={{ display:"flex", alignItems:"center", gap:1, px:2, py:1.25,
//         borderBottom:`1px solid ${J.border}`, bgcolor:J.bgSurface, flexShrink:0 }}>
//         <Typography sx={{ fontSize:"0.72rem", color:J.textDisabled, mr:0.5 }}>Sort:</Typography>
//         {["priority","deadline","status","assignee"].map(s => (
//           <Chip key={s} label={s.charAt(0).toUpperCase()+s.slice(1)} size="small"
//             onClick={() => setSortBy(s)} clickable
//             sx={{ height:22, fontSize:"0.7rem", fontWeight: sortBy===s ? 700 : 400,
//               bgcolor: sortBy===s ? J.blueLight : J.bgSubtle,
//               color: sortBy===s ? J.blue : J.textSecondary,
//               border:`1px solid ${sortBy===s ? J.blue+"40" : J.border}`,
//               "& .MuiChip-label":{ px:1 } }} />
//         ))}
//         <Typography sx={{ ml:"auto", fontSize:"0.72rem", color:J.textDisabled }}>
//           {tasks.length} tasks
//         </Typography>
//       </Box>

//       <Box sx={{ flex:1, overflowY:"auto" }}>
//         {sorted.length === 0 ? (
//           <Box sx={{ textAlign:"center", py:5, color:J.textDisabled, fontSize:"0.85rem" }}>No tasks</Box>
//         ) : sorted.map((task, i) => {
//           const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
//           const isDone     = task.status === "Done";
//           const canEdit    = isAdmin || isCreator || (isDeveloper && isAssigned);
//           const canDel     = isAdmin || isCreator || (isDeveloper && isAssigned);
//           const canComp    = (isAssigned || isAdmin) && !isDone;
//           return (
//             <Box key={task._id} onClick={() => onCardClick(task)}
//               sx={{ display:"flex", alignItems:"center", gap:1.5, px:2, py:1.25,
//                 borderBottom:`1px solid ${J.border}`,
//                 bgcolor: isDone ? "#F6FFFB" : i%2===0 ? J.bgSurface : J.bgPage,
//                 cursor:"pointer", "&:hover":{ bgcolor: isDone ? "#ECFFF5" : J.bgHover },
//                 transition:"background 0.1s" }}>
//               <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:statusColor(task.status), flexShrink:0 }} />
//               <Typography sx={{ flex:1, fontSize:"0.8rem", fontWeight:600,
//                 color: isDone ? J.green : J.textPrimary,
//                 textDecoration: isDone ? "line-through" : "none",
//                 overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
//                 {task.title}
//               </Typography>
//               <Box sx={{ flexShrink:0 }}><PriorityBadge priority={task.priority} /></Box>
//               <Box sx={{ width:70, flexShrink:0 }}>
//                 {!isDone && <DeadlineChip deadline={task.deadline} />}
//                 {isDone && (
//                   <Box sx={{ display:"inline-flex", alignItems:"center", gap:"3px", px:0.75, py:0.25,
//                     borderRadius:J.radius, bgcolor:J.greenBg, color:J.green, fontSize:"0.65rem", fontWeight:700 }}>
//                     ✓ Done
//                   </Box>
//                 )}
//               </Box>
//               <Tooltip title={task.assignedTo?.username} arrow>
//                 <Avatar sx={{ width:22, height:22, fontSize:"0.62rem", flexShrink:0,
//                   bgcolor: isDone ? J.greenAccent : stringToColor(task.assignedTo?.username) }}>
//                   {task.assignedTo?.username?.charAt(0).toUpperCase()}
//                 </Avatar>
//               </Tooltip>
//               <Box sx={{ display:"flex", gap:0.25, flexShrink:0 }} onClick={e => e.stopPropagation()}>
//                 {canComp && (
//                   <Tooltip title="Complete" arrow>
//                     <IconButton size="small" onClick={() => onComplete(task)}
//                       sx={{ p:"2px", "&:hover":{ color:J.green, bgcolor:J.greenBg } }}>
//                       <CheckCircleIcon sx={{ fontSize:13 }} />
//                     </IconButton>
//                   </Tooltip>
//                 )}
//                 {canEdit && (
//                   <Tooltip title="Edit" arrow>
//                     <IconButton size="small" onClick={() => onEdit(task)}
//                       sx={{ p:"2px", "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
//                       <EditIcon sx={{ fontSize:13 }} />
//                     </IconButton>
//                   </Tooltip>
//                 )}
//                 {canDel && (
//                   <Tooltip title="Delete" arrow>
//                     <IconButton size="small" onClick={() => onDelete(task._id)}
//                       sx={{ p:"2px", "&:hover":{ color:J.red, bgcolor:J.redBg } }}>
//                       <DeleteIcon sx={{ fontSize:13 }} />
//                     </IconButton>
//                   </Tooltip>
//                 )}
//               </Box>
//             </Box>
//           );
//         })}
//       </Box>
//     </Box>
//   );
// };

// // ── Completion History Dialog ─────────────────────────────────────────────────
// const CompletionHistoryDialog = ({ open, onClose, projectId }) => {
//   const [completions, setCompletions] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!open || !projectId) return;
//     setLoading(true);
//     axios.get(`${API_BASE}/api/tasks/${projectId}/completions`, { headers:authHeaders() })
//       .then(r => setCompletions(r.data || []))
//       .catch(() => setCompletions([]))
//       .finally(() => setLoading(false));
//   }, [open, projectId]);

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
//       PaperProps={{ sx:{ borderRadius:"8px", maxHeight:"70vh" } }}>
//       <DialogTitle sx={{ borderBottom:`1px solid ${J.border}`, py:2, px:3,
//         display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//         <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
//           <HistoryIcon sx={{ fontSize:18, color:J.textSecondary }} />
//           <Typography sx={{ fontWeight:600, fontSize:"1rem", color:J.textPrimary }}>Completion History</Typography>
//         </Box>
//         <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize:18 }} /></IconButton>
//       </DialogTitle>
//       <DialogContent sx={{ p:0 }}>
//         {loading ? (
//           <Box sx={{ display:"flex", justifyContent:"center", py:4 }}>
//             <CircularProgress size={24} sx={{ color:J.blue }} />
//           </Box>
//         ) : completions.length === 0 ? (
//           <Box sx={{ py:4, textAlign:"center" }}>
//             <Typography sx={{ color:J.textSecondary, fontSize:"0.875rem" }}>No completed tasks yet</Typography>
//           </Box>
//         ) : completions.map((c, i) => (
//           <Box key={c._id||i} sx={{ px:3, py:1.5,
//             borderBottom: i<completions.length-1 ? `1px solid ${J.border}` : "none",
//             "&:hover":{ bgcolor:J.bgPage } }}>
//             <Box sx={{ display:"flex", alignItems:"flex-start", gap:1.5 }}>
//               <CheckCircleIcon sx={{ fontSize:16, color:J.green, mt:0.25, flexShrink:0 }} />
//               <Box sx={{ flex:1, minWidth:0 }}>
//                 <Typography sx={{ fontSize:"0.875rem", fontWeight:600, color:J.textPrimary, mb:0.25 }}>
//                   {c.taskTitle}
//                 </Typography>
//                 <Box sx={{ display:"flex", gap:1, flexWrap:"wrap" }}>
//                   <Typography sx={{ fontSize:"0.75rem", color:J.textSecondary }}>
//                     Completed by <strong style={{ color:J.textPrimary }}>{c.completedBy?.username}</strong>
//                   </Typography>
//                   <Typography sx={{ fontSize:"0.75rem", color:J.textDisabled }}>·</Typography>
//                   <Typography sx={{ fontSize:"0.75rem", color:J.textSecondary }}>
//                     {format(new Date(c.completedAt),"MMM d, yyyy · h:mm a")}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display:"flex", gap:0.5, mt:0.5 }}>
//                   {c.priority && <PriorityBadge priority={c.priority} />}
//                 </Box>
//               </Box>
//             </Box>
//           </Box>
//         ))}
//       </DialogContent>
//     </Dialog>
//   );
// };

// // ── MAIN KANBAN ───────────────────────────────────────────────────────────────
// const ProjectKanban = ({ open, onClose, project }) => {
//   const [tasks,          setTasks]          = useState([]);
//   const [loading,        setLoading]        = useState(false);
//   const [taskFormOpen,   setTaskFormOpen]   = useState(false);
//   const [editingTask,    setEditingTask]    = useState(null);
//   const [historyOpen,    setHistoryOpen]    = useState(false);
//   const [detailTask,     setDetailTask]     = useState(null);
//   const [activeTab,      setActiveTab]      = useState("kanban");
//   const [filterUser,     setFilterUser]     = useState("all");
//   const [filterStatus,   setFilterStatus]   = useState("all");
//   const [filterPriority, setFilterPriority] = useState("all");
//   const [snack, setSnack] = useState({ open:false, msg:"", severity:"success" });
//   const dragTask = useRef(null);

//   const currentUserId   = localStorage.getItem("userId");
//   const currentUsername = localStorage.getItem("username") || "You";
//   const currentUserRole = localStorage.getItem("role") || "developer";
//   const isAdmin         = currentUserRole === "admin";
//   const isDeveloper     = currentUserRole === "developer";
//   const isCreator       = isAdmin || project?.createdBy === currentUsername;

//   const isAssignedDeveloper = useMemo(() => {
//     if (!project || !currentUserId) return false;
//     return (project.assignedDeveloper||[]).some(d => d.id?.toString() === currentUserId.toString());
//   }, [project, currentUserId]);

//   const canAddTask = isAdmin || isCreator || (isDeveloper && isAssignedDeveloper);

//   const projectDevelopers = useMemo(() => {
//     if (!project) return [];
//     const devs = (project.assignedDeveloper||[]).map(d => ({ id:d.id, username:d.username }));
//     const inList = devs.some(d => d.id === currentUserId);
//     if (!inList && (isCreator || isAdmin)) devs.unshift({ id:currentUserId, username:currentUsername });
//     return devs;
//   }, [project, currentUserId, currentUsername, isCreator, isAdmin]);

//   const toast = (msg, severity="success") => setSnack({ open:true, msg, severity });

//   const fetchTasks = useCallback(async () => {
//     if (!project?._id) return;
//     setLoading(true);
//     try {
//       const r = await axios.get(`${API_BASE}/api/tasks/${project._id}`, { headers:authHeaders() });
//       setTasks(r.data || []);
//     } catch { setTasks([]); }
//     finally { setLoading(false); }
//   }, [project?._id]);

//   useEffect(() => { if (open) fetchTasks(); else setTasks([]); }, [open, fetchTasks]);

//   const filteredTasks = useMemo(() => tasks.filter(t => {
//     if (filterUser     !== "all" && t.assignedTo?.id !== filterUser) return false;
//     if (filterStatus   !== "all" && t.status         !== filterStatus) return false;
//     if (filterPriority !== "all" && t.priority        !== filterPriority) return false;
//     return true;
//   }), [tasks, filterUser, filterStatus, filterPriority]);

//   const tasksByStatus = status => filteredTasks.filter(t => t.status === status);
//   const hasFilters    = filterUser !== "all" || filterStatus !== "all" || filterPriority !== "all";

//   // ── CRUD ──────────────────────────────────────────────────────────────────
//   const handleTaskSubmit = async formData => {
//     try {
//       if (editingTask) {
//         await axios.put(`${API_BASE}/api/tasks/${project._id}/${editingTask._id}`, formData, { headers:authHeaders() });
//         toast("Task updated");
//       } else {
//         await axios.post(`${API_BASE}/api/tasks/${project._id}`, formData, { headers:authHeaders() });
//         toast("Task created");
//       }
//       setTaskFormOpen(false); setEditingTask(null); fetchTasks();
//     } catch (err) { toast(err.response?.data?.message || "Failed to save task","error"); }
//   };

//   const handleDelete = async taskId => {
//     try {
//       await axios.delete(`${API_BASE}/api/tasks/${project._id}/${taskId}`, { headers:authHeaders() });
//       setTasks(prev => prev.filter(t => t._id !== taskId));
//       toast("Task deleted");
//     } catch (err) { toast(err.response?.data?.message || "Failed to delete task","error"); }
//   };

//   const handleComplete = async task => {
//     try {
//       await axios.post(`${API_BASE}/api/tasks/${project._id}/${task._id}/complete`, {}, { headers:authHeaders() });
//       toast("Task marked complete! 🎉"); fetchTasks();
//     } catch (err) { toast(err.response?.data?.message || "Failed to complete task","error"); }
//   };

//   const handleDragStart = (e, task) => { dragTask.current = task; e.dataTransfer.effectAllowed = "move"; };
//   const handleDragEnd   = () => { dragTask.current = null; };
//   const handleDragOver  = e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

//   const handleDrop = async (e, newStatus) => {
//     e.preventDefault();
//     const task = dragTask.current;
//     if (!task || task.status === newStatus) return;

//     setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status:newStatus } : t));

//     try {
//       if (newStatus === "Done") {
//         await axios.post(
//           `${API_BASE}/api/tasks/${project._id}/${task._id}/complete`, {},
//           { headers:authHeaders() }
//         );
//         toast("Task completed! 🎉");
//       } else {
//         await axios.put(
//           `${API_BASE}/api/tasks/${project._id}/${task._id}`,
//           { status:newStatus }, { headers:authHeaders() }
//         );
//       }
//       fetchTasks();
//     } catch {
//       fetchTasks();
//       toast("Failed to move task","error");
//     }
//   };

//   if (!project) return null;

//   const TABS = [
//     { id:"kanban",   label:"Board",    Icon:KanbanIcon   },
//     { id:"list",     label:"List",     Icon:ListIcon     },
//     { id:"calendar", label:"Calendar", Icon:CalendarIcon },
//     { id:"chart",    label:"Charts",   Icon:ChartIcon    },
//   ];

//   return (
//     <>
//       <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl"
//         PaperProps={{ sx:{ borderRadius:"8px", height:"90vh", display:"flex", flexDirection:"column" } }}>

//         {/* Header */}
//         <DialogTitle sx={{ borderBottom:`1px solid ${J.border}`, py:1.25, px:2.5,
//           display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
//           <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
//             <Box sx={{ width:28, height:28, borderRadius:J.radius, bgcolor:J.blueLight,
//               display:"flex", alignItems:"center", justifyContent:"center" }}>
//               <Typography sx={{ fontSize:"0.8rem", fontWeight:700, color:J.blue }}>K</Typography>
//             </Box>
//             <Box>
//               <Typography sx={{ fontWeight:600, fontSize:"0.9375rem", color:J.textPrimary }}>
//                 {project.projectName}
//               </Typography>
//               <Typography sx={{ fontSize:"0.72rem", color:J.textSecondary }}>Kanban Board</Typography>
//             </Box>
//           </Box>
//           <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
//             <Tooltip title="Completion history" arrow>
//               <IconButton size="small" onClick={() => setHistoryOpen(true)}
//                 sx={{ color:J.textSecondary, border:`1px solid ${J.border}`, borderRadius:J.radius, p:"5px",
//                   "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
//                 <HistoryIcon sx={{ fontSize:16 }} />
//               </IconButton>
//             </Tooltip>
//             {canAddTask && (
//               <Button size="small" variant="contained"
//                 startIcon={<AddIcon sx={{ fontSize:15 }} />}
//                 onClick={() => { setEditingTask(null); setTaskFormOpen(true); }}
//                 disableElevation
//                 sx={{ height:32, borderRadius:J.radius, bgcolor:J.blue, fontSize:"0.8125rem",
//                   textTransform:"none", "&:hover":{ bgcolor:J.blueDark } }}>
//                 Add Task
//               </Button>
//             )}
//             <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize:18 }} /></IconButton>
//           </Box>
//         </DialogTitle>

//         {/* Tab bar + Filters */}
//         <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between",
//           px:2.5, borderBottom:`1px solid ${J.border}`, bgcolor:J.bgSurface, flexShrink:0, flexWrap:"wrap" }}>
//           <Box sx={{ display:"flex" }}>
//             {TABS.map(({ id, label, Icon }) => (
//               <Box key={id} onClick={() => setActiveTab(id)}
//                 sx={{ display:"flex", alignItems:"center", gap:0.5, py:1, px:1.5, cursor:"pointer",
//                   fontSize:"0.8rem", fontWeight: activeTab===id ? 700 : 400,
//                   color: activeTab===id ? J.blue : J.textSecondary,
//                   borderBottom: activeTab===id ? `2px solid ${J.blue}` : "2px solid transparent",
//                   "&:hover":{ color:J.blue } }}>
//                 <Icon sx={{ fontSize:15 }} />{label}
//               </Box>
//             ))}
//           </Box>

//           <Box sx={{ display:"flex", alignItems:"center", gap:1, py:0.75 }}>
//             <FilterIcon sx={{ fontSize:14, color:J.textDisabled }} />
//             <Select size="small" value={filterUser} onChange={e => setFilterUser(e.target.value)}
//               sx={{ height:28, fontSize:"0.75rem", borderRadius:J.radius, minWidth:120,
//                 "& .MuiOutlinedInput-notchedOutline":{ borderColor:J.border },
//                 "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:J.blue } }}>
//               <MenuItem value="all" sx={{ fontSize:"0.78rem" }}>All Members</MenuItem>
//               {projectDevelopers.map(d => (
//                 <MenuItem key={d.id} value={d.id} sx={{ fontSize:"0.78rem" }}>
//                   <Box sx={{ display:"flex", alignItems:"center", gap:0.75 }}>
//                     <Avatar sx={{ width:16, height:16, fontSize:"0.5rem", bgcolor:stringToColor(d.username) }}>
//                       {d.username.charAt(0).toUpperCase()}
//                     </Avatar>
//                     {d.username}
//                   </Box>
//                 </MenuItem>
//               ))}
//             </Select>
//             <Select size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
//               sx={{ height:28, fontSize:"0.75rem", borderRadius:J.radius, minWidth:100,
//                 "& .MuiOutlinedInput-notchedOutline":{ borderColor:J.border },
//                 "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:J.blue } }}>
//               <MenuItem value="all" sx={{ fontSize:"0.78rem" }}>All Status</MenuItem>
//               {COLUMNS.map(c => <MenuItem key={c.id} value={c.id} sx={{ fontSize:"0.78rem" }}>{c.label}</MenuItem>)}
//             </Select>
//             <Select size="small" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
//               sx={{ height:28, fontSize:"0.75rem", borderRadius:J.radius, minWidth:100,
//                 "& .MuiOutlinedInput-notchedOutline":{ borderColor:J.border },
//                 "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:J.blue } }}>
//               <MenuItem value="all" sx={{ fontSize:"0.78rem" }}>All Priority</MenuItem>
//               {["Critical","High","Medium","Low"].map(p => (
//                 <MenuItem key={p} value={p} sx={{ fontSize:"0.78rem" }}>{p}</MenuItem>
//               ))}
//             </Select>
//             {hasFilters && (
//               <Chip label="Clear" size="small" clickable
//                 onClick={() => { setFilterUser("all"); setFilterStatus("all"); setFilterPriority("all"); }}
//                 sx={{ height:22, fontSize:"0.7rem", bgcolor:J.redBg, color:J.red,
//                   border:`1px solid ${J.red}30`, "& .MuiChip-label":{ px:1 } }} />
//             )}
//           </Box>
//         </Box>

//         {/* Content */}
//         <DialogContent sx={{ flex:1, overflow:"hidden", p:0, bgcolor:J.bgPage }}>
//           {loading ? (
//             <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100%" }}>
//               <CircularProgress size={28} sx={{ color:J.blue }} />
//             </Box>
//           ) : (
//             <>
//               {activeTab === "kanban" && (
//                 <Box sx={{ display:"flex", gap:2, p:2, height:"100%", overflowX:"auto", overflowY:"hidden" }}>
//                   {COLUMNS.map(col => (
//                     <KanbanColumn key={col.id} column={col} tasks={tasksByStatus(col.id)}
//                       currentUserId={currentUserId} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper}
//                       canAddTask={canAddTask}
//                       onAddTask={() => { setEditingTask(null); setTaskFormOpen(true); }}
//                       onEdit={task => { setEditingTask(task); setTaskFormOpen(true); }}
//                       onDelete={handleDelete} onComplete={handleComplete}
//                       onDragStart={handleDragStart} onDragEnd={handleDragEnd}
//                       onDragOver={handleDragOver} onDrop={handleDrop}
//                       onCardClick={setDetailTask} />
//                   ))}
//                 </Box>
//               )}
//               {activeTab === "list" && (
//                 <ListTab tasks={filteredTasks} currentUserId={currentUserId}
//                   isAdmin={isAdmin} isCreator={isCreator} isDeveloper={isDeveloper}
//                   onEdit={task => { setEditingTask(task); setTaskFormOpen(true); }}
//                   onDelete={handleDelete} onComplete={handleComplete} onCardClick={setDetailTask} />
//               )}
//               {activeTab === "calendar" && (
//                 <CalendarTab tasks={filteredTasks} onCardClick={setDetailTask} />
//               )}
//               {activeTab === "chart" && (
//                 <ChartTab tasks={filteredTasks} projectDevelopers={projectDevelopers} />
//               )}
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       <TaskFormDialog
//         open={taskFormOpen}
//         onClose={() => { setTaskFormOpen(false); setEditingTask(null); }}
//         onSubmit={handleTaskSubmit}
//         initialData={editingTask}
//         projectDevelopers={projectDevelopers}
//         isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper}
//         currentUserId={currentUserId} currentUsername={currentUsername}
//       />

//       {detailTask && (
//         <TaskDetailDialog
//           open={!!detailTask} onClose={() => setDetailTask(null)}
//           task={detailTask} projectId={project._id}
//           currentUserId={currentUserId} currentUsername={currentUsername}
//           canEdit={isAdmin || isCreator || (isDeveloper && detailTask.assignedTo?.id?.toString() === currentUserId?.toString())}
//           canDelete={isAdmin || isCreator || (isDeveloper && detailTask.assignedTo?.id?.toString() === currentUserId?.toString())}
//           onEdit={task => { setDetailTask(null); setEditingTask(task); setTaskFormOpen(true); }}
//           onDelete={handleDelete}
//         />
//       )}

//       <CompletionHistoryDialog
//         open={historyOpen} onClose={() => setHistoryOpen(false)} projectId={project?._id}
//       />

//       <Snackbar open={snack.open} autoHideDuration={4000}
//         onClose={() => setSnack(p => ({ ...p, open:false }))}
//         anchorOrigin={{ vertical:"bottom", horizontal:"right" }}>
//         <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open:false }))}
//           variant="filled" sx={{ borderRadius:J.radius, fontSize:"0.875rem" }}>
//           {snack.msg}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default ProjectKanban;
























import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Box, Typography, IconButton, Button, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, Select, MenuItem, CircularProgress,
  Snackbar, Alert, Chip,
} from "@mui/material";
import {
  Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon,
  Edit as EditIcon, CheckCircle as CheckCircleIcon,
  Link as LinkIcon, CalendarToday as CalendarIcon,
  History as HistoryIcon, ViewKanban as KanbanIcon,
  BarChart as ChartIcon, List as ListIcon,
  Send as SendIcon, Chat as ChatIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import axios from "axios";
// Added differenceInCalendarDays for strict day-to-day comparison without time bleeding
import { format, isBefore, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, differenceInCalendarDays } from "date-fns";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Design tokens ─────────────────────────────────────────────────────────────
const J = {
  blue: "#0052CC", blueDark: "#0747A6", blueLight: "#DEEBFF",
  green: "#006644", greenBg: "#E3FCEF", greenAccent: "#00A86B",
  red: "#BF2600", redBg: "#FFEBE6",
  orange: "#974F0C", orangeBg: "#FFF0B3",
  purple: "#5243AA", purpleBg: "#EAE6FF",
  border: "#DFE1E6", borderFocus: "#4C9AFF",
  bgPage: "#F4F5F7", bgSurface: "#FFFFFF", bgHover: "#EBECF0", bgSubtle: "#F4F5F7",
  textPrimary: "#172B4D", textSecondary: "#5E6C84", textDisabled: "#A5ADBA",
  radius: "3px",
  shadowCard: "0 1px 3px rgba(9,30,66,0.13)",
  shadowCardHover: "0 4px 12px rgba(9,30,66,0.2)",
};

const PRIORITY_CONFIG = {
  Low:      { color: J.green,  bg: J.greenBg,  icon: "↓", bar: "#00A86B" },
  Medium:   { color: J.blue,   bg: J.blueLight, icon: "→", bar: "#0052CC" },
  High:     { color: J.orange, bg: J.orangeBg,  icon: "↑", bar: "#FF8B00" },
  Critical: { color: J.red,    bg: J.redBg,     icon: "⚑", bar: "#BF2600" },
};

const COLUMNS = [
  { id: "Todo",        label: "To Do",       color: J.textSecondary },
  { id: "In Progress", label: "In Progress",  color: J.blue },
  { id: "Done",        label: "Done",         color: J.green },
];

const AVATAR_PALETTE = ["#0052CC","#00875A","#FF5630","#FF991F","#6554C0","#00B8D9"];
const stringToColor = (s) => {
  if (!s) return AVATAR_PALETTE[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
};

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Today's date in yyyy-MM-dd for min attribute on date inputs
const todayStr = () => format(new Date(), "yyyy-MM-dd");

// ── Small helpers ─────────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  return (
    <Box sx={{ display:"inline-flex", alignItems:"center", gap:"3px", px:0.75, py:0.25,
      borderRadius:J.radius, bgcolor:cfg.bg, color:cfg.color,
      fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.03em", userSelect:"none" }}>
      <span style={{ fontSize:"0.75rem" }}>{cfg.icon}</span>{priority}
    </Box>
  );
};

const DeadlineChip = ({ deadline }) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  
  // Use differenceInCalendarDays to safely ignore hours/minutes
  const diff = differenceInCalendarDays(d, new Date());
  
  const isOverdue = diff < 0;
  const isCritical = diff === 0 || diff === 1; // Today or Tomorrow
  const isSoon = diff > 1 && diff <= 3; // In 2-3 days

  let bgcolor = J.bgSubtle;
  let color = J.textSecondary;
  let label = format(d, "MMM d");
  let icon = <CalendarIcon sx={{ fontSize:10 }} />;

  if (isOverdue) {
    bgcolor = "#A40E26"; // Distinct Deep Red
    color = "#FFFFFF";
    label = `OVERDUE (${Math.abs(diff)}d)`;
    icon = <span style={{ fontSize:"10px", lineHeight:1 }}>🚨</span>;
  } else if (isCritical) {
    bgcolor = J.redBg;
    color = J.red;
    label = diff === 0 ? "Due Today" : "Due Tomorrow";
    icon = <span style={{ fontSize:"10px", lineHeight:1 }}>🔥</span>;
  } else if (isSoon) {
    bgcolor = J.orangeBg;
    color = J.orange;
    label = `Due in ${diff}d`;
  }

  return (
    <Box sx={{ display:"inline-flex", alignItems:"center", gap:"4px", px:0.75, py:0.25,
      borderRadius:J.radius, bgcolor, color,
      fontSize:"0.68rem", fontWeight:700 }}>
      {icon} {label}
    </Box>
  );
};

// ── Comments panel ────────────────────────────────────────────────────────────
const CommentsPanel = ({ taskId, projectId, currentUserId, currentUsername }) => {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [text,     setText]     = useState("");
  const [posting,  setPosting]  = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const bottomRef = useRef(null);

  const fetchComments = useCallback(async () => {
    if (!taskId || !projectId) return;
    setLoading(true);
    try {
      const r = await axios.get(
        `${API_BASE}/api/tasks/${projectId}/${taskId}/comments`,
        { headers: authHeaders() }
      );
      setComments(r.data || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [taskId, projectId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const postComment = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await axios.post(
        `${API_BASE}/api/tasks/${projectId}/${taskId}/comments`,
        { text: text.trim() },
        { headers: authHeaders() }
      );
      setText("");
      await fetchComments();
    } catch (err) {
      console.error("Post comment error:", err);
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (commentId) => {
    setDeletingId(commentId);
    try {
      await axios.delete(
        `${API_BASE}/api/tasks/${projectId}/${taskId}/comments/${commentId}`,
        { headers: authHeaders() }
      );
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      console.error("Delete comment error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <Box sx={{ flex:1, overflowY:"auto", p:1.5, display:"flex", flexDirection:"column", gap:1 }}>
        {loading ? (
          <Box sx={{ display:"flex", justifyContent:"center", pt:2 }}>
            <CircularProgress size={18} sx={{ color:J.blue }} />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ textAlign:"center", py:3, color:J.textDisabled, fontSize:"0.78rem" }}>
            No comments yet — be the first!
          </Box>
        ) : comments.map((c, i) => {
          const isMe = c.createdBy?.id?.toString() === currentUserId?.toString();
          return (
            <Box key={c._id || i} sx={{ display:"flex", gap:1, alignItems:"flex-start",
              flexDirection: isMe ? "row-reverse" : "row" }}>
              <Avatar sx={{ width:24, height:24, fontSize:"0.6rem", fontWeight:700,
                bgcolor: stringToColor(c.createdBy?.username), flexShrink:0 }}>
                {c.createdBy?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ maxWidth:"75%" }}>
                <Box sx={{ display:"flex", alignItems:"center", gap:0.5, mb:0.25,
                  justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <Typography sx={{ fontSize:"0.68rem", fontWeight:600, color:J.textSecondary }}>
                    {isMe ? "You" : c.createdBy?.username}
                  </Typography>
                  <Typography sx={{ fontSize:"0.62rem", color:J.textDisabled }}>
                    · {c.createdAt ? format(new Date(c.createdAt), "MMM d, h:mm a") : ""}
                  </Typography>
                  {isMe && (
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        size="small"
                        onClick={() => deleteComment(c._id)}
                        disabled={deletingId === c._id}
                        sx={{ p:"1px", ml:0.25, color:J.textDisabled,
                          "&:hover":{ color:J.red, bgcolor:J.redBg },
                          opacity: deletingId === c._id ? 0.5 : 1 }}>
                        {deletingId === c._id
                          ? <CircularProgress size={10} />
                          : <DeleteIcon sx={{ fontSize:11 }} />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Box sx={{ bgcolor: isMe ? J.blueLight : J.bgPage,
                  border:`1px solid ${isMe ? "#B3D4FF" : J.border}`,
                  borderRadius: isMe ? "8px 2px 8px 8px" : "2px 8px 8px 8px",
                  px:1.25, py:0.75 }}>
                  <Typography sx={{ fontSize:"0.8rem", color:J.textPrimary, lineHeight:1.5,
                    whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                    {c.text}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p:1.25, borderTop:`1px solid ${J.border}`, display:"flex", gap:1, alignItems:"flex-end" }}>
        <TextField
          multiline maxRows={3} fullWidth size="small"
          placeholder="Write a comment…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); }
          }}
          sx={{ "& .MuiOutlinedInput-root":{ borderRadius:"6px", fontSize:"0.8rem",
            "& fieldset":{ borderColor:J.border },
            "&:hover fieldset":{ borderColor:J.borderFocus },
            "&.Mui-focused fieldset":{ borderColor:J.blue } } }}
        />
        <IconButton
          size="small" onClick={postComment}
          disabled={!text.trim() || posting}
          sx={{ bgcolor:J.blue, color:"#fff", borderRadius:"6px", p:"7px",
            "&:hover":{ bgcolor:J.blueDark },
            "&:disabled":{ bgcolor:J.bgSubtle, color:J.textDisabled } }}>
          {posting
            ? <CircularProgress size={14} sx={{ color:"#fff" }} />
            : <SendIcon sx={{ fontSize:15 }} />}
        </IconButton>
      </Box>
    </Box>
  );
};

// ── Task Detail Dialog ────────────────────────────────────────────────────────
const TaskDetailDialog = ({ open, onClose, task, projectId, currentUserId, currentUsername,
  canEdit, onEdit, canDelete, onDelete }) => {
  const [tab, setTab] = useState("details");
  if (!task) return null;
  const isDone = task.status === "Done";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx:{ borderRadius:"8px", height:"75vh", display:"flex", flexDirection:"column" } }}>
      <DialogTitle sx={{ borderBottom:`1px solid ${J.border}`, py:1.5, px:2.5,
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Box sx={{ flex:1, minWidth:0, mr:1 }}>
          <Typography sx={{ fontWeight:700, fontSize:"0.9375rem",
            color: isDone ? J.green : J.textPrimary,
            textDecoration: isDone ? "line-through" : "none", lineHeight:1.3 }}>
            {task.title}
          </Typography>
          <Box sx={{ display:"flex", gap:0.5, mt:0.5, flexWrap:"wrap" }}>
            <PriorityBadge priority={task.priority} />
            {!isDone && <DeadlineChip deadline={task.deadline} />}
            {isDone && (
              <Box sx={{ display:"inline-flex", alignItems:"center", gap:"3px", px:0.75, py:0.25,
                borderRadius:J.radius, bgcolor:J.greenBg, color:J.green, fontSize:"0.68rem", fontWeight:700 }}>
                <CheckCircleIcon sx={{ fontSize:10 }} /> Done
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ display:"flex", gap:0.5, flexShrink:0 }}>
          {canEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => { onClose(); onEdit(task); }}
                sx={{ p:"4px", "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
                <EditIcon sx={{ fontSize:14 }} />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => { onDelete(task._id); onClose(); }}
                sx={{ p:"4px", "&:hover":{ color:J.red, bgcolor:J.redBg } }}>
                <DeleteIcon sx={{ fontSize:14 }} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize:16 }} /></IconButton>
        </Box>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ display:"flex", borderBottom:`1px solid ${J.border}`, px:2.5, flexShrink:0 }}>
        {[{ id:"details", label:"Details" }, { id:"comments", label:"Comments", icon:<ChatIcon sx={{ fontSize:12 }} /> }]
          .map(t => (
          <Box key={t.id} onClick={() => setTab(t.id)}
            sx={{ py:1, px:1.5, cursor:"pointer", fontSize:"0.8rem",
              fontWeight: tab===t.id ? 700 : 400,
              color: tab===t.id ? J.blue : J.textSecondary,
              borderBottom: tab===t.id ? `2px solid ${J.blue}` : "2px solid transparent",
              display:"flex", alignItems:"center", gap:0.5,
              "&:hover":{ color:J.blue } }}>
            {t.icon}{t.label}
          </Box>
        ))}
      </Box>

      <DialogContent sx={{ p:0, flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {tab === "details" ? (
          <Box sx={{ p:2.5, overflowY:"auto" }}>
            {task.description && (
              <Box sx={{ mb:2 }}>
                <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
                  textTransform:"uppercase", letterSpacing:"0.05em", mb:0.5 }}>Description</Typography>
                <Typography sx={{ fontSize:"0.85rem", color:J.textSecondary, lineHeight:1.6,
                  whiteSpace:"pre-wrap" }}>{task.description}</Typography>
              </Box>
            )}
            <Box sx={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, mb:2 }}>
              <Box>
                <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
                  textTransform:"uppercase", letterSpacing:"0.05em", mb:0.5 }}>Assigned To</Typography>
                <Box sx={{ display:"flex", alignItems:"center", gap:0.75 }}>
                  <Avatar sx={{ width:20, height:20, fontSize:"0.6rem",
                    bgcolor:stringToColor(task.assignedTo?.username) }}>
                    {task.assignedTo?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontSize:"0.82rem", color:J.textPrimary }}>{task.assignedTo?.username}</Typography>
                </Box>
              </Box>
              {!isDone && task.deadline && (
                <Box>
                  <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
                    textTransform:"uppercase", letterSpacing:"0.05em", mb:0.5 }}>Deadline</Typography>
                  <DeadlineChip deadline={task.deadline} />
                </Box>
              )}
              {isDone && task.completedAt && (
                <Box>
                  <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
                    textTransform:"uppercase", letterSpacing:"0.05em", mb:0.5 }}>Completed</Typography>
                  <Typography sx={{ fontSize:"0.82rem", color:J.green }}>
                    {format(new Date(task.completedAt), "MMM d, yyyy")}
                  </Typography>
                </Box>
              )}
            </Box>
            {task.links?.length > 0 && (
              <Box>
                <Typography sx={{ fontSize:"0.68rem", fontWeight:700, color:J.textDisabled,
                  textTransform:"uppercase", letterSpacing:"0.05em", mb:0.75 }}>Links</Typography>
                {task.links.map((link, i) => (
                  <Box key={i} component="a" href={link} target="_blank" rel="noopener noreferrer"
                    sx={{ display:"flex", alignItems:"center", gap:0.5, mb:0.5, color:J.blue,
                      fontSize:"0.8rem", textDecoration:"none", "&:hover":{ textDecoration:"underline" } }}>
                    <LinkIcon sx={{ fontSize:12 }} />{link}
                  </Box>
                ))}
              </Box>
            )}
            {isDone && task.completedBy && (
              <Box sx={{ mt:2, p:1.25, bgcolor:J.greenBg, borderRadius:"6px",
                border:`1px solid ${J.green}30`, display:"flex", alignItems:"center", gap:0.75 }}>
                <CheckCircleIcon sx={{ fontSize:14, color:J.green }} />
                <Typography sx={{ fontSize:"0.78rem", color:J.green }}>
                  Completed by <strong>{task.completedBy?.username}</strong>
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <CommentsPanel
            taskId={task._id} projectId={projectId}
            currentUserId={currentUserId} currentUsername={currentUsername}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Task card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, currentUserId, isCreator, isAdmin, isDeveloper,
  onEdit, onDelete, onComplete, onDragStart, onDragEnd, onClick }) => {
  const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
  const isDone     = task.status === "Done";
  const canComplete = (isAssigned || isAdmin) && !isDone;
  const canEdit     = isAdmin || isCreator || (isDeveloper && isAssigned);
  const canDelete   = isAdmin || isCreator || (isDeveloper && isAssigned);
  const canDrag     = isAdmin || isCreator || isDeveloper;

  return (
    <Box
      draggable={canDrag}
      onDragStart={e => canDrag && onDragStart(e, task)}
      onDragEnd={canDrag ? onDragEnd : undefined}
      onClick={() => onClick(task)}
      sx={{
        bgcolor: isDone ? "#F0FFF6" : J.bgSurface,
        border: `1px solid ${isDone ? "#A3D9B1" : J.border}`,
        borderLeft: isDone ? `3px solid ${J.greenAccent}` : `3px solid transparent`,
        borderRadius: J.radius,
        p: "10px 12px", mb:1,
        boxShadow: isDone ? "none" : J.shadowCard,
        cursor: canDrag ? "grab" : "pointer",
        transition: "box-shadow 0.15s, transform 0.1s, border-color 0.2s, background 0.2s",
        "&:hover": { boxShadow: isDone ? "0 1px 4px rgba(0,100,68,0.12)" : J.shadowCardHover, transform:"translateY(-1px)" },
        "&:active": { cursor: canDrag ? "grabbing" : "pointer" },
        position:"relative",
      }}>
      <Box sx={{ display:"flex", gap:0.5, mb:0.75, flexWrap:"wrap" }}>
        <PriorityBadge priority={task.priority} />
        {!isDone && <DeadlineChip deadline={task.deadline} />}
        {isDone && (
          <Box sx={{ display:"inline-flex", alignItems:"center", gap:"3px", px:0.75, py:0.25,
            borderRadius:J.radius, bgcolor:J.greenBg, color:J.green, fontSize:"0.68rem", fontWeight:700 }}>
            <CheckCircleIcon sx={{ fontSize:10 }} /> Completed
          </Box>
        )}
      </Box>

      <Typography sx={{ fontSize:"0.8125rem", fontWeight:600, lineHeight:1.4, mb:0.5,
        color: isDone ? J.green : J.textPrimary,
        textDecoration: isDone ? "line-through" : "none" }}>
        {task.title}
      </Typography>

      {task.description && (
        <Typography sx={{ fontSize:"0.75rem", color:J.textSecondary, lineHeight:1.4, mb:0.75,
          overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
          {task.description}
        </Typography>
      )}

      <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mt:0.5 }}>
        <Tooltip title={`Assigned to: ${task.assignedTo?.username}`} arrow>
          <Box sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
            <Avatar sx={{ width:20, height:20, fontSize:"0.6rem", fontWeight:700,
              bgcolor: isDone ? J.greenAccent : stringToColor(task.assignedTo?.username) }}>
              {task.assignedTo?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography sx={{ fontSize:"0.72rem", color: isDone ? J.green : J.textSecondary }}>
              {task.assignedTo?.username}
            </Typography>
          </Box>
        </Tooltip>

        <Box sx={{ display:"flex", gap:0.25 }} onClick={e => e.stopPropagation()}>
          {canComplete && (
            <Tooltip title="Mark complete" arrow>
              <IconButton size="small" onClick={() => onComplete(task)}
                sx={{ p:"3px", color:J.textDisabled, "&:hover":{ color:J.green, bgcolor:J.greenBg } }}>
                <CheckCircleIcon sx={{ fontSize:14 }} />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip title="Edit" arrow>
              <IconButton size="small" onClick={() => onEdit(task)}
                sx={{ p:"3px", color:J.textDisabled, "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
                <EditIcon sx={{ fontSize:13 }} />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete" arrow>
              <IconButton size="small" onClick={() => onDelete(task._id)}
                sx={{ p:"3px", color:J.textDisabled, "&:hover":{ color:J.red, bgcolor:J.redBg } }}>
                <DeleteIcon sx={{ fontSize:13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {isDone && task.completedAt && (
        <Box sx={{ mt:0.75, pt:0.75, borderTop:`1px solid #A3D9B130`,
          display:"flex", alignItems:"center", gap:0.5 }}>
          <CheckCircleIcon sx={{ fontSize:11, color:J.green }} />
          <Typography sx={{ fontSize:"0.68rem", color:J.green }}>
            {task.completedBy?.username} · {format(new Date(task.completedAt),"MMM d, yyyy")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Kanban Column ─────────────────────────────────────────────────────────────
const KanbanColumn = ({ column, tasks, currentUserId, isCreator, isAdmin, isDeveloper,
  canAddTask, onAddTask, onEdit, onDelete, onComplete, onDragStart, onDragEnd,
  onDrop, onDragOver, onCardClick }) => {
  const [isOver, setIsOver] = useState(false);
  return (
    <Box
      onDragOver={e => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={e => { setIsOver(false); onDrop(e, column.id); }}
      sx={{ flex:"1 1 0", minWidth:240, maxWidth:340,
        bgcolor: isOver ? "#EBF2FF" : J.bgPage,
        border:`2px dashed ${isOver ? J.blue : "transparent"}`,
        borderRadius:"4px", transition:"background 0.15s, border-color 0.15s",
        display:"flex", flexDirection:"column" }}>
      <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        px:1.5, py:1.25, borderBottom:`2px solid ${column.color}20` }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
          <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:column.color, flexShrink:0 }} />
          <Typography sx={{ fontSize:"0.75rem", fontWeight:700, color:column.color,
            textTransform:"uppercase", letterSpacing:"0.06em" }}>{column.label}</Typography>
          <Box sx={{ bgcolor:`${column.color}20`, color:column.color, borderRadius:"10px",
            px:0.75, fontSize:"0.68rem", fontWeight:700, lineHeight:1.6, minWidth:18, textAlign:"center" }}>
            {tasks.length}
          </Box>
        </Box>
        {canAddTask && column.id === "Todo" && (
          <Tooltip title="Add task" arrow>
            <IconButton size="small" onClick={onAddTask}
              sx={{ p:"3px", color:J.textSecondary, "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
              <AddIcon sx={{ fontSize:16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box sx={{ flex:1, overflowY:"auto", p:1.25, minHeight:80 }}>
        {tasks.length === 0 && (
          <Box sx={{ textAlign:"center", py:3, color:J.textDisabled, fontSize:"0.75rem" }}>No tasks</Box>
        )}
        {tasks.map(task => (
          <TaskCard key={task._id} task={task}
            currentUserId={currentUserId} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper}
            onEdit={onEdit} onDelete={onDelete} onComplete={onComplete}
            onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onCardClick} />
        ))}
      </Box>
    </Box>
  );
};

// ── Task Form Dialog ──────────────────────────────────────────────────────────
const TaskFormDialog = ({ open, onClose, onSubmit, initialData, projectDevelopers,
  isCreator, isAdmin, isDeveloper, currentUserId, currentUsername, isSubmitting }) => {

  const blankForm = useCallback(() => ({
    title: "",
    description: "",
    links: [],
    priority: "Medium",
    deadline: "",
    assignedTo: { id: currentUserId, username: currentUsername },
  }), [currentUserId, currentUsername]);

  const [form,        setForm]       = useState(blankForm);
  const [linkInput,   setLinkInput]  = useState("");
  const [errors,      setErrors]     = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title:        initialData.title        || "",
        description:  initialData.description  || "",
        links:        initialData.links        || [],
        priority:     initialData.priority     || "Medium",
        deadline:     initialData.deadline
          ? format(new Date(initialData.deadline), "yyyy-MM-dd")
          : "",
        assignedTo:   initialData.assignedTo   || { id: currentUserId, username: currentUsername },
      });
    } else {
      setForm(blankForm());
    }
    setLinkInput("");
    setErrors({});
  }, [open, initialData, currentUserId, currentUsername, blankForm]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  };

  const addLink = () => {
    if (linkInput.trim()) {
      set("links", [...form.links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const removeLink = i => set("links", form.links.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = "Title is required";
    if (!form.deadline)        e.deadline = "Deadline is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ ...form, deadline: form.deadline || null });
  };

  const canAssignToOthers = isAdmin || isCreator;
  const visibleDevelopers = canAssignToOthers
    ? projectDevelopers
    : projectDevelopers.filter(d => d.id === currentUserId);

  const labelSx = {
    fontSize:"0.75rem", fontWeight:600, color:J.textSecondary, mb:0.5,
    display:"block", textTransform:"uppercase", letterSpacing:"0.04em",
  };
  const fieldSx = {
    "& .MuiOutlinedInput-root":{ borderRadius:J.radius, fontSize:"0.875rem",
      "& fieldset":{ borderColor:J.border },
      "&:hover fieldset":{ borderColor:J.borderFocus },
      "&.Mui-focused fieldset":{ borderColor:J.blue },
    },
  };
  const errorFieldSx = (key) => ({
    ...fieldSx,
    "& .MuiOutlinedInput-root":{ ...fieldSx["& .MuiOutlinedInput-root"],
      "& fieldset":{ borderColor: errors[key] ? J.red : J.border },
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx:{ borderRadius:"8px" } }}>
      <DialogTitle sx={{ borderBottom:`1px solid ${J.border}`, py:2, px:3,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Typography sx={{ fontWeight:600, fontSize:"1rem", color:J.textPrimary }}>
          {initialData ? "Edit Task" : "Create Task"}
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={isSubmitting}>
          <CloseIcon sx={{ fontSize:18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p:3 }}>
        <Box sx={{ display:"flex", flexDirection:"column", gap:2 }}>

          {/* Title — required */}
          <Box>
            <Typography component="span" sx={labelSx}>
              Title <span style={{ color:J.red }}>*</span>
            </Typography>
            <TextField
              fullWidth size="small"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="What needs to be done?"
              error={!!errors.title}
              helperText={errors.title}
              sx={errorFieldSx("title")}
              FormHelperTextProps={{ sx:{ fontSize:"0.7rem", color:J.red, mt:0.25 } }}
              disabled={isSubmitting}
            />
          </Box>

          {/* Description */}
          <Box>
            <Typography component="span" sx={labelSx}>Description</Typography>
            <TextField
              fullWidth size="small" multiline rows={3}
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Add details, context, or acceptance criteria..."
              sx={fieldSx}
              disabled={isSubmitting}
            />
          </Box>

          {/* Priority + Deadline */}
          <Box sx={{ display:"flex", gap:2 }}>
            <Box sx={{ flex:1 }}>
              <Typography component="span" sx={labelSx}>Priority</Typography>
              <FormControl fullWidth size="small" sx={fieldSx} disabled={isSubmitting}>
                <Select
                  value={form.priority}
                  onChange={e => set("priority", e.target.value)}
                  sx={{ borderRadius:J.radius, fontSize:"0.875rem" }}>
                  {["Low","Medium","High","Critical"].map(p => (
                    <MenuItem key={p} value={p} sx={{ fontSize:"0.875rem" }}>
                      <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                        <span>{PRIORITY_CONFIG[p].icon}</span>{p}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Deadline — required, no past dates */}
            <Box sx={{ flex:1 }}>
              <Typography component="span" sx={labelSx}>
                Deadline <span style={{ color:J.red }}>*</span>
              </Typography>
              <TextField
                fullWidth size="small" type="date"
                value={form.deadline}
                onChange={e => set("deadline", e.target.value)}
                inputProps={{ min: todayStr() }}
                error={!!errors.deadline}
                helperText={errors.deadline}
                sx={errorFieldSx("deadline")}
                InputLabelProps={{ shrink:true }}
                FormHelperTextProps={{ sx:{ fontSize:"0.7rem", color:J.red, mt:0.25 } }}
                disabled={isSubmitting}
              />
            </Box>
          </Box>

          {/* Assign To */}
          <Box>
            <Typography component="span" sx={labelSx}>
              Assign To
              {!canAssignToOthers && (
                <Typography component="span" sx={{ fontSize:"0.68rem", color:J.textDisabled, ml:1,
                  textTransform:"none", fontWeight:400 }}>(you only)</Typography>
              )}
            </Typography>
            <FormControl fullWidth size="small" sx={fieldSx} disabled={isSubmitting}>
              <Select
                value={form.assignedTo?.id || ""}
                disabled={!canAssignToOthers}
                onChange={e => {
                  const dev = projectDevelopers.find(d => d.id === e.target.value);
                  if (dev) set("assignedTo", dev);
                }}
                sx={{ borderRadius:J.radius, fontSize:"0.875rem" }}>
                {visibleDevelopers.map(dev => (
                  <MenuItem key={dev.id} value={dev.id} sx={{ fontSize:"0.875rem" }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                      <Avatar sx={{ width:20, height:20, fontSize:"0.6rem", bgcolor:stringToColor(dev.username) }}>
                        {dev.username.charAt(0).toUpperCase()}
                      </Avatar>
                      {dev.username}
                      {dev.id === currentUserId && (
                        <Typography sx={{ fontSize:"0.72rem", color:J.textSecondary }}>(you)</Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Links */}
          <Box>
            <Typography component="span" sx={labelSx}>Links / References</Typography>
            <Box sx={{ display:"flex", gap:1, mb:0.75 }}>
              <TextField
                fullWidth size="small"
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && addLink()}
                placeholder="https://..."
                sx={fieldSx}
                disabled={isSubmitting}
              />
              <Button variant="outlined" size="small" onClick={addLink}
                disabled={isSubmitting}
                sx={{ height:32, borderRadius:J.radius, color:J.blue, borderColor:J.border,
                  textTransform:"none", fontSize:"0.8125rem", whiteSpace:"nowrap",
                  "&:hover":{ borderColor:J.blue, bgcolor:J.blueLight } }}>
                Add
              </Button>
            </Box>
            {form.links.map((link, i) => (
              <Box key={i} sx={{ display:"flex", alignItems:"center", gap:0.5, mb:0.5 }}>
                <LinkIcon sx={{ fontSize:13, color:J.blue }} />
                <Typography
                  component="a" href={link} target="_blank" rel="noopener noreferrer"
                  sx={{ fontSize:"0.8rem", color:J.blue, flex:1, overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap",
                    textDecoration:"none", "&:hover":{ textDecoration:"underline" } }}>
                  {link}
                </Typography>
                <IconButton size="small" onClick={() => removeLink(i)} disabled={isSubmitting}
                  sx={{ p:"2px", color:J.textDisabled }}>
                  <CloseIcon sx={{ fontSize:12 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px:3, py:2, borderTop:`1px solid ${J.border}` }}>
        <Button onClick={onClose} disabled={isSubmitting}
          sx={{ height:32, borderRadius:J.radius, color:J.textSecondary,
            fontSize:"0.8125rem", textTransform:"none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained" disableElevation
          disabled={isSubmitting}
          sx={{ height:32, borderRadius:J.radius, bgcolor:J.blue,
            fontSize:"0.8125rem", textTransform:"none",
            "&:hover":{ bgcolor:J.blueDark },
            "&.Mui-disabled": { bgcolor: J.textDisabled, color: "#fff" } }}>
          {isSubmitting ? (
             <>
               <CircularProgress size={14} sx={{ color:"#fff", mr:1 }} />
               {initialData ? "Saving..." : "Creating..."}
             </>
          ) : (
             initialData ? "Save changes" : "Create task"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Chart Tab ─────────────────────────────────────────────────────────────────
const ChartTab = ({ tasks, projectDevelopers }) => {
  const byStatus   = COLUMNS.map(c => ({ label:c.label, count:tasks.filter(t=>t.status===c.id).length, color:c.color }));
  const byPriority = ["Critical","High","Medium","Low"].map(p => ({
    label:p, count:tasks.filter(t=>t.priority===p).length, ...PRIORITY_CONFIG[p] }));
  const byDev = projectDevelopers.map(d => ({
    username: d.username,
    todo: tasks.filter(t=>t.assignedTo?.id===d.id && t.status==="Todo").length,
    wip:  tasks.filter(t=>t.assignedTo?.id===d.id && t.status==="In Progress").length,
    done: tasks.filter(t=>t.assignedTo?.id===d.id && t.status==="Done").length,
  }));
  const maxStatus   = Math.max(...byStatus.map(s=>s.count), 1);
  const maxPriority = Math.max(...byPriority.map(p=>p.count), 1);
  const totalTasks  = tasks.length;
  const doneTasks   = tasks.filter(t=>t.status==="Done").length;
  const progress    = totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0;

  return (
    <Box sx={{ p:2.5, overflowY:"auto", height:"100%", display:"flex", flexDirection:"column", gap:2.5 }}>
      <Box sx={{ bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"6px", p:2,
        display:"flex", alignItems:"center", gap:2.5 }}>
        <Box sx={{ position:"relative", width:80, height:80, flexShrink:0 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke={J.border} strokeWidth="8" />
            <circle cx="40" cy="40" r="34" fill="none" stroke={J.greenAccent} strokeWidth="8"
              strokeDasharray={`${2*Math.PI*34*progress/100} ${2*Math.PI*34*(1-progress/100)}`}
              strokeLinecap="round" transform="rotate(-90 40 40)"
              style={{ transition:"stroke-dasharray 0.5s ease" }} />
          </svg>
          <Box sx={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", flexDirection:"column" }}>
            <Typography sx={{ fontSize:"1.1rem", fontWeight:800, color:J.green, lineHeight:1 }}>{progress}%</Typography>
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize:"0.9rem", fontWeight:700, color:J.textPrimary, mb:0.5 }}>Project Progress</Typography>
          <Typography sx={{ fontSize:"0.8rem", color:J.textSecondary }}>{doneTasks} of {totalTasks} tasks completed</Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"6px", p:2 }}>
        <Typography sx={{ fontSize:"0.78rem", fontWeight:700, color:J.textSecondary, mb:1.5,
          textTransform:"uppercase", letterSpacing:"0.05em" }}>Tasks by Status</Typography>
        {byStatus.map(s => (
          <Box key={s.label} sx={{ mb:1.25 }}>
            <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.4 }}>
              <Typography sx={{ fontSize:"0.78rem", color:J.textPrimary, fontWeight:500 }}>{s.label}</Typography>
              <Typography sx={{ fontSize:"0.78rem", color:J.textSecondary }}>{s.count}</Typography>
            </Box>
            <Box sx={{ height:8, bgcolor:J.bgSubtle, borderRadius:4, overflow:"hidden" }}>
              <Box sx={{ height:"100%", width:`${(s.count/maxStatus)*100}%`, bgcolor:s.color,
                borderRadius:4, transition:"width 0.4s ease" }} />
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"6px", p:2 }}>
        <Typography sx={{ fontSize:"0.78rem", fontWeight:700, color:J.textSecondary, mb:1.5,
          textTransform:"uppercase", letterSpacing:"0.05em" }}>Tasks by Priority</Typography>
        {byPriority.map(p => (
          <Box key={p.label} sx={{ mb:1.25 }}>
            <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.4 }}>
              <Box sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
                <span style={{ fontSize:"0.75rem", color:p.color }}>{p.icon}</span>
                <Typography sx={{ fontSize:"0.78rem", color:J.textPrimary, fontWeight:500 }}>{p.label}</Typography>
              </Box>
              <Typography sx={{ fontSize:"0.78rem", color:J.textSecondary }}>{p.count}</Typography>
            </Box>
            <Box sx={{ height:8, bgcolor:J.bgSubtle, borderRadius:4, overflow:"hidden" }}>
              <Box sx={{ height:"100%", width:`${(p.count/maxPriority)*100}%`, bgcolor:p.bar,
                borderRadius:4, transition:"width 0.4s ease" }} />
            </Box>
          </Box>
        ))}
      </Box>

      {byDev.length > 0 && (
        <Box sx={{ bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"6px", p:2 }}>
          <Typography sx={{ fontSize:"0.78rem", fontWeight:700, color:J.textSecondary, mb:1.5,
            textTransform:"uppercase", letterSpacing:"0.05em" }}>Workload by Developer</Typography>
          {byDev.map(d => (
            <Box key={d.username} sx={{ mb:1.5 }}>
              <Box sx={{ display:"flex", alignItems:"center", gap:0.75, mb:0.75 }}>
                <Avatar sx={{ width:20, height:20, fontSize:"0.6rem", bgcolor:stringToColor(d.username) }}>
                  {d.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ fontSize:"0.8rem", fontWeight:600, color:J.textPrimary }}>{d.username}</Typography>
              </Box>
              <Box sx={{ display:"flex", gap:1 }}>
                {[{ label:"Todo", val:d.todo, color:J.textSecondary },
                  { label:"WIP",  val:d.wip,  color:J.blue },
                  { label:"Done", val:d.done, color:J.green }].map(s => (
                  <Box key={s.label} sx={{ flex:1, textAlign:"center", p:"6px 4px",
                    bgcolor:J.bgSubtle, borderRadius:"4px", border:`1px solid ${J.border}` }}>
                    <Typography sx={{ fontSize:"1rem", fontWeight:700, color:s.color }}>{s.val}</Typography>
                    <Typography sx={{ fontSize:"0.62rem", color:J.textDisabled }}>{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ── Calendar Tab ──────────────────────────────────────────────────────────────
const CalendarTab = ({ tasks, onCardClick }) => {
  const [current, setCurrent] = useState(new Date());
  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const days       = eachDayOfInterval({ start:monthStart, end:monthEnd });
  const startPad   = getDay(monthStart);
  const tasksWithDeadline = tasks.filter(t => t.deadline && t.status !== "Done");
  const tasksOnDay = day => tasksWithDeadline.filter(t => isSameDay(new Date(t.deadline), day));

  return (
    <Box sx={{ p:2, overflowY:"auto", height:"100%" }}>
      <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mb:2 }}>
        <IconButton size="small"
          onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}>
          <Typography sx={{ fontSize:"1rem", color:J.textPrimary, lineHeight:1 }}>‹</Typography>
        </IconButton>
        <Typography sx={{ fontWeight:700, fontSize:"0.9rem", color:J.textPrimary }}>
          {format(current, "MMMM yyyy")}
        </Typography>
        <IconButton size="small"
          onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}>
          <Typography sx={{ fontSize:"1rem", color:J.textPrimary, lineHeight:1 }}>›</Typography>
        </IconButton>
      </Box>

      <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", mb:0.5 }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <Box key={d} sx={{ textAlign:"center", fontSize:"0.65rem", fontWeight:700,
            color:J.textDisabled, textTransform:"uppercase", py:0.5 }}>{d}</Box>
        ))}
      </Box>

      <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px" }}>
        {Array.from({ length:startPad }).map((_,i) => <Box key={`pad-${i}`} />)}
        {days.map(day => {
          const dayTasks = tasksOnDay(day);
          const isCurrentDay = isToday(day);
          return (
            <Box key={day.toISOString()} sx={{ minHeight:64, border:`1px solid ${J.border}`,
              borderRadius:"3px", bgcolor: isCurrentDay ? J.blueLight : J.bgSurface, p:"4px",
              "&:hover":{ bgcolor: isCurrentDay ? "#C4DAFF" : J.bgHover } }}>
              <Typography sx={{ fontSize:"0.7rem", fontWeight: isCurrentDay ? 800 : 500,
                color: isCurrentDay ? J.blue : J.textPrimary, mb:0.25 }}>
                {format(day,"d")}
              </Typography>
              {dayTasks.slice(0,2).map(t => (
                <Box key={t._id} onClick={() => onCardClick(t)}
                  sx={{ fontSize:"0.6rem", fontWeight:600, mb:"2px", p:"1px 4px",
                    borderRadius:"2px", cursor:"pointer", overflow:"hidden", whiteSpace:"nowrap",
                    textOverflow:"ellipsis",
                    bgcolor: PRIORITY_CONFIG[t.priority]?.bg || J.blueLight,
                    color:   PRIORITY_CONFIG[t.priority]?.color || J.blue,
                    "&:hover":{ opacity:0.8 } }}>
                  {t.title}
                </Box>
              ))}
              {dayTasks.length > 2 && (
                <Typography sx={{ fontSize:"0.58rem", color:J.textDisabled }}>
                  +{dayTasks.length-2} more
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt:2 }}>
        <Typography sx={{ fontSize:"0.75rem", fontWeight:700, color:J.textSecondary, mb:1,
          textTransform:"uppercase", letterSpacing:"0.05em" }}>Upcoming Deadlines</Typography>
        {tasksWithDeadline
          .sort((a,b) => new Date(a.deadline)-new Date(b.deadline))
          .slice(0,6)
          .map(t => (
            <Box key={t._id} onClick={() => onCardClick(t)}
              sx={{ display:"flex", alignItems:"center", gap:1, p:"8px 12px",
                bgcolor:J.bgSurface, border:`1px solid ${J.border}`, borderRadius:"4px",
                mb:0.75, cursor:"pointer", "&:hover":{ borderColor:J.blue, bgcolor:J.blueLight } }}>
              <PriorityBadge priority={t.priority} />
              <Typography sx={{ fontSize:"0.8rem", flex:1, fontWeight:500, color:J.textPrimary,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</Typography>
              <DeadlineChip deadline={t.deadline} />
            </Box>
          ))}
        {tasksWithDeadline.length === 0 && (
          <Typography sx={{ fontSize:"0.8rem", color:J.textDisabled, textAlign:"center", py:2 }}>
            No upcoming deadlines
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// ── List Tab ──────────────────────────────────────────────────────────────────
const ListTab = ({ tasks, currentUserId, isAdmin, isCreator, isDeveloper,
  onEdit, onDelete, onComplete, onCardClick }) => {
  const [sortBy, setSortBy] = useState("priority");
  const priorityOrder = { Critical:0, High:1, Medium:2, Low:3 };
  const sorted = [...tasks].sort((a,b) => {
    if (sortBy === "priority") return (priorityOrder[a.priority]??2)-(priorityOrder[b.priority]??2);
    if (sortBy === "deadline") {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1; if (!b.deadline) return -1;
      return new Date(a.deadline)-new Date(b.deadline);
    }
    if (sortBy === "status")   return COLUMNS.findIndex(c=>c.id===a.status)-COLUMNS.findIndex(c=>c.id===b.status);
    if (sortBy === "assignee") return (a.assignedTo?.username||"").localeCompare(b.assignedTo?.username||"");
    return 0;
  });
  const statusColor = s => ({ "Todo":J.textSecondary, "In Progress":J.blue, "Done":J.green }[s]||J.textSecondary);

  return (
    <Box sx={{ height:"100%", display:"flex", flexDirection:"column" }}>
      <Box sx={{ display:"flex", alignItems:"center", gap:1, px:2, py:1.25,
        borderBottom:`1px solid ${J.border}`, bgcolor:J.bgSurface, flexShrink:0 }}>
        <Typography sx={{ fontSize:"0.72rem", color:J.textDisabled, mr:0.5 }}>Sort:</Typography>
        {["priority","deadline","status","assignee"].map(s => (
          <Chip key={s} label={s.charAt(0).toUpperCase()+s.slice(1)} size="small"
            onClick={() => setSortBy(s)} clickable
            sx={{ height:22, fontSize:"0.7rem", fontWeight: sortBy===s ? 700 : 400,
              bgcolor: sortBy===s ? J.blueLight : J.bgSubtle,
              color: sortBy===s ? J.blue : J.textSecondary,
              border:`1px solid ${sortBy===s ? J.blue+"40" : J.border}`,
              "& .MuiChip-label":{ px:1 } }} />
        ))}
        <Typography sx={{ ml:"auto", fontSize:"0.72rem", color:J.textDisabled }}>
          {tasks.length} tasks
        </Typography>
      </Box>

      <Box sx={{ flex:1, overflowY:"auto" }}>
        {sorted.length === 0 ? (
          <Box sx={{ textAlign:"center", py:5, color:J.textDisabled, fontSize:"0.85rem" }}>No tasks</Box>
        ) : sorted.map((task, i) => {
          const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
          const isDone     = task.status === "Done";
          const canEdit    = isAdmin || isCreator || (isDeveloper && isAssigned);
          const canDel     = isAdmin || isCreator || (isDeveloper && isAssigned);
          const canComp    = (isAssigned || isAdmin) && !isDone;
          return (
            <Box key={task._id} onClick={() => onCardClick(task)}
              sx={{ display:"flex", alignItems:"center", gap:1.5, px:2, py:1.25,
                borderBottom:`1px solid ${J.border}`,
                bgcolor: isDone ? "#F6FFFB" : i%2===0 ? J.bgSurface : J.bgPage,
                cursor:"pointer", "&:hover":{ bgcolor: isDone ? "#ECFFF5" : J.bgHover },
                transition:"background 0.1s" }}>
              <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:statusColor(task.status), flexShrink:0 }} />
              <Typography sx={{ flex:1, fontSize:"0.8rem", fontWeight:600,
                color: isDone ? J.green : J.textPrimary,
                textDecoration: isDone ? "line-through" : "none",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {task.title}
              </Typography>
              <Box sx={{ flexShrink:0 }}><PriorityBadge priority={task.priority} /></Box>
              <Box sx={{ width:70, flexShrink:0 }}>
                {!isDone && <DeadlineChip deadline={task.deadline} />}
                {isDone && (
                  <Box sx={{ display:"inline-flex", alignItems:"center", gap:"3px", px:0.75, py:0.25,
                    borderRadius:J.radius, bgcolor:J.greenBg, color:J.green, fontSize:"0.65rem", fontWeight:700 }}>
                    ✓ Done
                  </Box>
                )}
              </Box>
              <Tooltip title={task.assignedTo?.username} arrow>
                <Avatar sx={{ width:22, height:22, fontSize:"0.62rem", flexShrink:0,
                  bgcolor: isDone ? J.greenAccent : stringToColor(task.assignedTo?.username) }}>
                  {task.assignedTo?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
              <Box sx={{ display:"flex", gap:0.25, flexShrink:0 }} onClick={e => e.stopPropagation()}>
                {canComp && (
                  <Tooltip title="Complete" arrow>
                    <IconButton size="small" onClick={() => onComplete(task)}
                      sx={{ p:"2px", "&:hover":{ color:J.green, bgcolor:J.greenBg } }}>
                      <CheckCircleIcon sx={{ fontSize:13 }} />
                    </IconButton>
                  </Tooltip>
                )}
                {canEdit && (
                  <Tooltip title="Edit" arrow>
                    <IconButton size="small" onClick={() => onEdit(task)}
                      sx={{ p:"2px", "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
                      <EditIcon sx={{ fontSize:13 }} />
                    </IconButton>
                  </Tooltip>
                )}
                {canDel && (
                  <Tooltip title="Delete" arrow>
                    <IconButton size="small" onClick={() => onDelete(task._id)}
                      sx={{ p:"2px", "&:hover":{ color:J.red, bgcolor:J.redBg } }}>
                      <DeleteIcon sx={{ fontSize:13 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ── Completion History Dialog ─────────────────────────────────────────────────
const CompletionHistoryDialog = ({ open, onClose, projectId }) => {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !projectId) return;
    setLoading(true);
    axios.get(`${API_BASE}/api/tasks/${projectId}/completions`, { headers:authHeaders() })
      .then(r => setCompletions(r.data || []))
      .catch(() => setCompletions([]))
      .finally(() => setLoading(false));
  }, [open, projectId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx:{ borderRadius:"8px", maxHeight:"70vh" } }}>
      <DialogTitle sx={{ borderBottom:`1px solid ${J.border}`, py:2, px:3,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
          <HistoryIcon sx={{ fontSize:18, color:J.textSecondary }} />
          <Typography sx={{ fontWeight:600, fontSize:"1rem", color:J.textPrimary }}>Completion History</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize:18 }} /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p:0 }}>
        {loading ? (
          <Box sx={{ display:"flex", justifyContent:"center", py:4 }}>
            <CircularProgress size={24} sx={{ color:J.blue }} />
          </Box>
        ) : completions.length === 0 ? (
          <Box sx={{ py:4, textAlign:"center" }}>
            <Typography sx={{ color:J.textSecondary, fontSize:"0.875rem" }}>No completed tasks yet</Typography>
          </Box>
        ) : completions.map((c, i) => (
          <Box key={c._id||i} sx={{ px:3, py:1.5,
            borderBottom: i<completions.length-1 ? `1px solid ${J.border}` : "none",
            "&:hover":{ bgcolor:J.bgPage } }}>
            <Box sx={{ display:"flex", alignItems:"flex-start", gap:1.5 }}>
              <CheckCircleIcon sx={{ fontSize:16, color:J.green, mt:0.25, flexShrink:0 }} />
              <Box sx={{ flex:1, minWidth:0 }}>
                <Typography sx={{ fontSize:"0.875rem", fontWeight:600, color:J.textPrimary, mb:0.25 }}>
                  {c.taskTitle}
                </Typography>
                <Box sx={{ display:"flex", gap:1, flexWrap:"wrap" }}>
                  <Typography sx={{ fontSize:"0.75rem", color:J.textSecondary }}>
                    Completed by <strong style={{ color:J.textPrimary }}>{c.completedBy?.username}</strong>
                  </Typography>
                  <Typography sx={{ fontSize:"0.75rem", color:J.textDisabled }}>·</Typography>
                  <Typography sx={{ fontSize:"0.75rem", color:J.textSecondary }}>
                    {format(new Date(c.completedAt),"MMM d, yyyy · h:mm a")}
                  </Typography>
                </Box>
                <Box sx={{ display:"flex", gap:0.5, mt:0.5 }}>
                  {c.priority && <PriorityBadge priority={c.priority} />}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

// ── MAIN KANBAN ───────────────────────────────────────────────────────────────
const ProjectKanban = ({ open, onClose, project }) => {
  const [tasks,          setTasks]          = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [taskFormOpen,   setTaskFormOpen]   = useState(false);
  const [editingTask,    setEditingTask]    = useState(null);
  const [historyOpen,    setHistoryOpen]    = useState(false);
  const [detailTask,     setDetailTask]     = useState(null);
  const [activeTab,      setActiveTab]      = useState("kanban");
  const [filterUser,     setFilterUser]     = useState("all");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false); // NEW STATE FOR BUTTON
  const [snack, setSnack] = useState({ open:false, msg:"", severity:"success" });
  const dragTask = useRef(null);

  const currentUserId   = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "You";
  const currentUserRole = localStorage.getItem("role") || "developer";
  const isAdmin         = currentUserRole === "admin";
  const isDeveloper     = currentUserRole === "developer";
  const isCreator       = isAdmin || project?.createdBy === currentUsername;

  const isAssignedDeveloper = useMemo(() => {
    if (!project || !currentUserId) return false;
    return (project.assignedDeveloper||[]).some(d => d.id?.toString() === currentUserId.toString());
  }, [project, currentUserId]);

  const canAddTask = isAdmin || isCreator || (isDeveloper && isAssignedDeveloper);

  const projectDevelopers = useMemo(() => {
    if (!project) return [];
    const devs = (project.assignedDeveloper||[]).map(d => ({ id:d.id, username:d.username }));
    const inList = devs.some(d => d.id === currentUserId);
    if (!inList && (isCreator || isAdmin)) devs.unshift({ id:currentUserId, username:currentUsername });
    return devs;
  }, [project, currentUserId, currentUsername, isCreator, isAdmin]);

  const toast = (msg, severity="success") => setSnack({ open:true, msg, severity });

  // Modified fetchTasks to accept a boolean. If false, it updates in background without a loading spinner
  const fetchTasks = useCallback(async (showLoader = true) => {
    if (!project?._id) return;
    if (showLoader) setLoading(true);
    try {
      const r = await axios.get(`${API_BASE}/api/tasks/${project._id}`, { headers:authHeaders() });
      setTasks(r.data || []);
    } catch {
      if (showLoader) setTasks([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [project?._id]);

  useEffect(() => { 
    if (open) fetchTasks(true); 
    else setTasks([]); 
  }, [open, fetchTasks]);

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (filterUser     !== "all" && t.assignedTo?.id !== filterUser) return false;
    if (filterStatus   !== "all" && t.status         !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority        !== filterPriority) return false;
    return true;
  }), [tasks, filterUser, filterStatus, filterPriority]);

  const tasksByStatus = status => filteredTasks.filter(t => t.status === status);
  const hasFilters    = filterUser !== "all" || filterStatus !== "all" || filterPriority !== "all";

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleTaskSubmit = async formData => {
    setIsSubmittingTask(true);
    try {
      if (editingTask) {
        await axios.put(`${API_BASE}/api/tasks/${project._id}/${editingTask._id}`, formData, { headers:authHeaders() });
        toast("Task updated");
      } else {
        await axios.post(`${API_BASE}/api/tasks/${project._id}`, formData, { headers:authHeaders() });
        toast("Task created");
      }
      setTaskFormOpen(false); 
      setEditingTask(null); 
      fetchTasks(false); // Background fetch to avoid jumping
    } catch (err) { 
      toast(err.response?.data?.message || "Failed to save task","error"); 
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDelete = async taskId => {
    try {
      await axios.delete(`${API_BASE}/api/tasks/${project._id}/${taskId}`, { headers:authHeaders() });
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast("Task deleted");
    } catch (err) { toast(err.response?.data?.message || "Failed to delete task","error"); }
  };

  const handleComplete = async task => {
    // Optimistic Update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: "Done" } : t));
    try {
      await axios.post(`${API_BASE}/api/tasks/${project._id}/${task._id}/complete`, {}, { headers:authHeaders() });
      toast("Task marked complete! 🎉"); 
      fetchTasks(false); // Background sync
    } catch (err) { 
      toast(err.response?.data?.message || "Failed to complete task","error"); 
      fetchTasks(false); // Revert on fail
    }
  };

  const handleDragStart = (e, task) => { dragTask.current = task; e.dataTransfer.effectAllowed = "move"; };
  const handleDragEnd   = () => { dragTask.current = null; };
  const handleDragOver  = e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const task = dragTask.current;
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status:newStatus } : t));

    try {
      if (newStatus === "Done") {
        await axios.post(
          `${API_BASE}/api/tasks/${project._id}/${task._id}/complete`, {},
          { headers:authHeaders() }
        );
        toast("Task completed! 🎉");
      } else {
        await axios.put(
          `${API_BASE}/api/tasks/${project._id}/${task._id}`,
          { status:newStatus }, { headers:authHeaders() }
        );
      }
      fetchTasks(false); // Background sync
    } catch {
      fetchTasks(false); // Revert on fail
      toast("Failed to move task","error");
    }
  };

  if (!project) return null;

  const TABS = [
    { id:"kanban",   label:"Board",    Icon:KanbanIcon   },
    { id:"list",     label:"List",     Icon:ListIcon     },
    { id:"calendar", label:"Calendar", Icon:CalendarIcon },
    { id:"chart",    label:"Charts",   Icon:ChartIcon    },
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl"
        PaperProps={{ sx:{ borderRadius:"8px", height:"90vh", display:"flex", flexDirection:"column" } }}>

        {/* Header */}
        <DialogTitle sx={{ borderBottom:`1px solid ${J.border}`, py:1.25, px:2.5,
          display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
            <Box sx={{ width:28, height:28, borderRadius:J.radius, bgcolor:J.blueLight,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Typography sx={{ fontSize:"0.8rem", fontWeight:700, color:J.blue }}>K</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight:600, fontSize:"0.9375rem", color:J.textPrimary }}>
                {project.projectName}
              </Typography>
              <Typography sx={{ fontSize:"0.72rem", color:J.textSecondary }}>Kanban Board</Typography>
            </Box>
          </Box>
          <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
            <Tooltip title="Completion history" arrow>
              <IconButton size="small" onClick={() => setHistoryOpen(true)}
                sx={{ color:J.textSecondary, border:`1px solid ${J.border}`, borderRadius:J.radius, p:"5px",
                  "&:hover":{ color:J.blue, bgcolor:J.blueLight } }}>
                <HistoryIcon sx={{ fontSize:16 }} />
              </IconButton>
            </Tooltip>
            {canAddTask && (
              <Button size="small" variant="contained"
                startIcon={<AddIcon sx={{ fontSize:15 }} />}
                onClick={() => { setEditingTask(null); setTaskFormOpen(true); }}
                disableElevation
                sx={{ height:32, borderRadius:J.radius, bgcolor:J.blue, fontSize:"0.8125rem",
                  textTransform:"none", "&:hover":{ bgcolor:J.blueDark } }}>
                Add Task
              </Button>
            )}
            <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize:18 }} /></IconButton>
          </Box>
        </DialogTitle>

        {/* Tab bar + Filters */}
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          px:2.5, borderBottom:`1px solid ${J.border}`, bgcolor:J.bgSurface, flexShrink:0, flexWrap:"wrap" }}>
          <Box sx={{ display:"flex" }}>
            {TABS.map(({ id, label, Icon }) => (
              <Box key={id} onClick={() => setActiveTab(id)}
                sx={{ display:"flex", alignItems:"center", gap:0.5, py:1, px:1.5, cursor:"pointer",
                  fontSize:"0.8rem", fontWeight: activeTab===id ? 700 : 400,
                  color: activeTab===id ? J.blue : J.textSecondary,
                  borderBottom: activeTab===id ? `2px solid ${J.blue}` : "2px solid transparent",
                  "&:hover":{ color:J.blue } }}>
                <Icon sx={{ fontSize:15 }} />{label}
              </Box>
            ))}
          </Box>

          <Box sx={{ display:"flex", alignItems:"center", gap:1, py:0.75 }}>
            <FilterIcon sx={{ fontSize:14, color:J.textDisabled }} />
            <Select size="small" value={filterUser} onChange={e => setFilterUser(e.target.value)}
              sx={{ height:28, fontSize:"0.75rem", borderRadius:J.radius, minWidth:120,
                "& .MuiOutlinedInput-notchedOutline":{ borderColor:J.border },
                "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:J.blue } }}>
              <MenuItem value="all" sx={{ fontSize:"0.78rem" }}>All Members</MenuItem>
              {projectDevelopers.map(d => (
                <MenuItem key={d.id} value={d.id} sx={{ fontSize:"0.78rem" }}>
                  <Box sx={{ display:"flex", alignItems:"center", gap:0.75 }}>
                    <Avatar sx={{ width:16, height:16, fontSize:"0.5rem", bgcolor:stringToColor(d.username) }}>
                      {d.username.charAt(0).toUpperCase()}
                    </Avatar>
                    {d.username}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <Select size="small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              sx={{ height:28, fontSize:"0.75rem", borderRadius:J.radius, minWidth:100,
                "& .MuiOutlinedInput-notchedOutline":{ borderColor:J.border },
                "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:J.blue } }}>
              <MenuItem value="all" sx={{ fontSize:"0.78rem" }}>All Status</MenuItem>
              {COLUMNS.map(c => <MenuItem key={c.id} value={c.id} sx={{ fontSize:"0.78rem" }}>{c.label}</MenuItem>)}
            </Select>
            <Select size="small" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              sx={{ height:28, fontSize:"0.75rem", borderRadius:J.radius, minWidth:100,
                "& .MuiOutlinedInput-notchedOutline":{ borderColor:J.border },
                "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:J.blue } }}>
              <MenuItem value="all" sx={{ fontSize:"0.78rem" }}>All Priority</MenuItem>
              {["Critical","High","Medium","Low"].map(p => (
                <MenuItem key={p} value={p} sx={{ fontSize:"0.78rem" }}>{p}</MenuItem>
              ))}
            </Select>
            {hasFilters && (
              <Chip label="Clear" size="small" clickable
                onClick={() => { setFilterUser("all"); setFilterStatus("all"); setFilterPriority("all"); }}
                sx={{ height:22, fontSize:"0.7rem", bgcolor:J.redBg, color:J.red,
                  border:`1px solid ${J.red}30`, "& .MuiChip-label":{ px:1 } }} />
            )}
          </Box>
        </Box>

        {/* Content */}
        <DialogContent sx={{ flex:1, overflow:"hidden", p:0, bgcolor:J.bgPage }}>
          {loading ? (
            <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100%" }}>
              <CircularProgress size={28} sx={{ color:J.blue }} />
            </Box>
          ) : (
            <>
              {activeTab === "kanban" && (
                <Box sx={{ display:"flex", gap:2, p:2, height:"100%", overflowX:"auto", overflowY:"hidden" }}>
                  {COLUMNS.map(col => (
                    <KanbanColumn key={col.id} column={col} tasks={tasksByStatus(col.id)}
                      currentUserId={currentUserId} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper}
                      canAddTask={canAddTask}
                      onAddTask={() => { setEditingTask(null); setTaskFormOpen(true); }}
                      onEdit={task => { setEditingTask(task); setTaskFormOpen(true); }}
                      onDelete={handleDelete} onComplete={handleComplete}
                      onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver} onDrop={handleDrop}
                      onCardClick={setDetailTask} />
                  ))}
                </Box>
              )}
              {activeTab === "list" && (
                <ListTab tasks={filteredTasks} currentUserId={currentUserId}
                  isAdmin={isAdmin} isCreator={isCreator} isDeveloper={isDeveloper}
                  onEdit={task => { setEditingTask(task); setTaskFormOpen(true); }}
                  onDelete={handleDelete} onComplete={handleComplete} onCardClick={setDetailTask} />
              )}
              {activeTab === "calendar" && (
                <CalendarTab tasks={filteredTasks} onCardClick={setDetailTask} />
              )}
              {activeTab === "chart" && (
                <ChartTab tasks={filteredTasks} projectDevelopers={projectDevelopers} />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <TaskFormDialog
        open={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditingTask(null); }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        projectDevelopers={projectDevelopers}
        isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper}
        currentUserId={currentUserId} currentUsername={currentUsername}
        isSubmitting={isSubmittingTask} // Passed down the submitting state
      />

      {detailTask && (
        <TaskDetailDialog
          open={!!detailTask} onClose={() => setDetailTask(null)}
          task={detailTask} projectId={project._id}
          currentUserId={currentUserId} currentUsername={currentUsername}
          canEdit={isAdmin || isCreator || (isDeveloper && detailTask.assignedTo?.id?.toString() === currentUserId?.toString())}
          canDelete={isAdmin || isCreator || (isDeveloper && detailTask.assignedTo?.id?.toString() === currentUserId?.toString())}
          onEdit={task => { setDetailTask(null); setEditingTask(task); setTaskFormOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      <CompletionHistoryDialog
        open={historyOpen} onClose={() => setHistoryOpen(false)} projectId={project?._id}
      />

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack(p => ({ ...p, open:false }))}
        anchorOrigin={{ vertical:"bottom", horizontal:"right" }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open:false }))}
          variant="filled" sx={{ borderRadius:J.radius, fontSize:"0.875rem" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProjectKanban;