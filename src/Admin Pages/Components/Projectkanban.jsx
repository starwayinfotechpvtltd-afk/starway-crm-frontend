// import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import { 
//   format, isBefore, addDays, startOfMonth, endOfMonth, 
//   eachDayOfInterval, getDay, isSameDay, isToday, differenceInCalendarDays 
// } from "date-fns";
// import {
//   X, Plus, Trash2, Edit, CheckCircle2, Link as LinkIcon, 
//   Calendar, History, KanbanSquare, BarChart, List, 
//   Send, MessageSquare, Filter, Loader2, ChevronDown, 
//   AlertCircle, AlertTriangle, ArrowRight, ArrowDown, ArrowUp, Flag,
//   FolderDot, ChevronLeft, ChevronRight, ChevronUp
// } from "lucide-react";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// // ── Strict System Colors ──────────────────────────────────────────────────────
// const C = {
//   primary: "#0969DA",
//   success: "#1A7F37",
//   danger: "#D1242F",
//   warning: "#BF8700",
//   text: "#1F2328",
//   textSec: "#656D76"
// };

// const PRIORITY_CONFIG = {
//   Low:      { color: C.success, icon: <ArrowDown size={12}/> },
//   Medium:   { color: C.primary, icon: <ArrowRight size={12}/> },
//   High:     { color: C.warning, icon: <ArrowUp size={12}/> },
//   Critical: { color: C.danger,  icon: <Flag size={12}/> },
// };

// const COLUMNS = [
//   { id: "Todo",        label: "To Do",       color: C.textSec },
//   { id: "In Progress", label: "In Progress", color: C.primary },
//   { id: "Done",        label: "Done",        color: C.success },
// ];

// const AVATAR_PALETTE = [C.primary, C.success, C.warning, C.danger, "#8B5CF6", "#06B6D4"];
// const stringToColor = (s) => {
//   if (!s) return AVATAR_PALETTE[0];
//   let h = 0;
//   for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
//   return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
// };

// const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
// const todayStr = () => format(new Date(), "yyyy-MM-dd");

// // ── Small Helpers ─────────────────────────────────────────────────────────────
// const PriorityBadge = ({ priority }) => {
//   const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
//   return (
//     <div className="flex items-center gap-1 neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
//       {cfg.icon} {priority}
//     </div>
//   );
// };

// const DeadlineChip = ({ deadline }) => {
//   if (!deadline) return null;
//   const d = new Date(deadline);
//   const diff = differenceInCalendarDays(d, new Date());
  
//   const isOverdue = diff < 0;
//   const isCritical = diff === 0 || diff === 1;
//   const isSoon = diff > 1 && diff <= 3;

//   let color = C.textSec;
//   let label = format(d, "MMM d");
//   let icon = <Calendar size={12} />;

//   if (isOverdue) {
//     color = C.danger;
//     label = `OVERDUE (${Math.abs(diff)}d)`;
//     icon = <AlertTriangle size={12} />;
//   } else if (isCritical) {
//     color = C.danger;
//     label = diff === 0 ? "Due Today" : "Due Tomorrow";
//     icon = <AlertCircle size={12} />;
//   } else if (isSoon) {
//     color = C.warning;
//     label = `Due in ${diff}d`;
//   }

//   return (
//     <div className="flex items-center gap-1.5 neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
//       {icon} {label}
//     </div>
//   );
// };

// // ── Comments Panel ────────────────────────────────────────────────────────────
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
//       const r = await axios.get(`${API_BASE}/api/tasks/${projectId}/${taskId}/comments`, { headers: authHeaders() });
//       setComments(r.data || []);
//     } catch { setComments([]); } 
//     finally { setLoading(false); }
//   }, [taskId, projectId]);

//   useEffect(() => { fetchComments(); }, [fetchComments]);
//   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

//   const postComment = async () => {
//     if (!text.trim()) return;
//     setPosting(true);
//     try {
//       await axios.post(`${API_BASE}/api/tasks/${projectId}/${taskId}/comments`, { text: text.trim() }, { headers: authHeaders() });
//       setText("");
//       await fetchComments();
//     } catch (err) { console.error(err); } 
//     finally { setPosting(false); }
//   };

//   const deleteComment = async (commentId) => {
//     setDeletingId(commentId);
//     try {
//       await axios.delete(`${API_BASE}/api/tasks/${projectId}/${taskId}/comments/${commentId}`, { headers: authHeaders() });
//       setComments(prev => prev.filter(c => c._id !== commentId));
//     } catch (err) { console.error(err); } 
//     finally { setDeletingId(null); }
//   };

//   return (
//     <div className="flex flex-col h-full min-h-0 bg-[#F0F4F8]">
//       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
//         {loading ? (
//           <div className="flex justify-center pt-8"><Loader2 size={24} className="animate-spin text-[#0969DA]" /></div>
//         ) : comments.length === 0 ? (
//           <div className="text-center py-8 text-xs font-bold text-[#656D76] italic">No comments yet.</div>
//         ) : comments.map((c) => {
//           const isMe = c.createdBy?.id?.toString() === currentUserId?.toString();
//           return (
//             <div key={c._id} className={`flex gap-3 items-start ${isMe ? "flex-row-reverse" : "flex-row"}`}>
//               <div className="w-8 h-8 rounded-full neu-flat-sm flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ backgroundColor: stringToColor(c.createdBy?.username) }}>
//                 {c.createdBy?.username?.charAt(0).toUpperCase()}
//               </div>
//               <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
//                 <div className="flex items-center gap-2 mb-1.5">
//                   <span className="text-[10px] font-bold text-[#1F2328]">{isMe ? "You" : c.createdBy?.username}</span>
//                   <span className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider">{c.createdAt ? format(new Date(c.createdAt), "MMM d, h:mm a") : ""}</span>
//                   {isMe && (
//                     <button onClick={() => deleteComment(c._id)} disabled={deletingId === c._id} className="neu-flat-sm neu-action-btn p-1 rounded text-[#D1242F] disabled:opacity-50">
//                       {deletingId === c._id ? <Loader2 size={10} className="animate-spin pointer-events-none" /> : <Trash2 size={10} className="pointer-events-none" />}
//                     </button>
//                   )}
//                 </div>
//                 <div className={`neu-pressed rounded-xl p-3 text-sm font-medium text-[#1F2328] whitespace-pre-wrap ${isMe ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
//                   {c.text}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={bottomRef} />
//       </div>

//       <div className="p-4 border-t border-[#D1DCEB]/50 shrink-0 flex gap-3 relative z-20">
//         <textarea
//           rows={2}
//           placeholder="Write a comment..."
//           value={text}
//           onChange={e => setText(e.target.value)}
//           onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
//           className="flex-1 neu-pressed rounded-lg p-3 text-sm font-medium text-[#1F2328] outline-none resize-none custom-scrollbar relative z-20"
//         />
//         <button
//           onClick={postComment}
//           disabled={!text.trim() || posting}
//           className="neu-btn-primary rounded-lg px-5 flex items-center justify-center text-white disabled:opacity-50 neu-action-btn shrink-0"
//         >
//           {posting ? <Loader2 size={18} className="animate-spin pointer-events-none" /> : <Send size={18} className="pointer-events-none" />}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Task Detail Dialog ────────────────────────────────────────────────────────
// const TaskDetailDialog = ({ open, onClose, task, projectId, currentUserId, currentUsername, canEdit, onEdit, canDelete, onDelete }) => {
//   const [tab, setTab] = useState("details");
//   if (!task) return null;
//   const isDone = task.status === "Done";

//   return (
//     <AnimatePresence>
//       {open && (
//         <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
//           <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
//             className="neu-flat rounded-2xl w-full max-w-2xl flex flex-col relative z-10 max-h-[90vh] overflow-hidden"
//           >
//             <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-start shrink-0">
//               <div className="pr-4">
//                 <h2 className={`text-xl font-bold ${isDone ? "text-[#1F2328]/60 line-through decoration-[#1A7F37]" : "text-[#1F2328]"} mb-3`}>{task.title}</h2>
//                 <div className="flex flex-wrap gap-2 items-center">
//                   <PriorityBadge priority={task.priority} />
//                   {!isDone && <DeadlineChip deadline={task.deadline} />}
//                   {isDone && <div className="neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-[#1A7F37] flex items-center gap-1"><CheckCircle2 size={12}/> Completed</div>}
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 shrink-0">
//                 {canEdit && <button onClick={() => { onClose(); onEdit(task); }} className="neu-flat-sm neu-action-btn p-2 rounded-full text-[#0969DA]"><Edit size={16} className="pointer-events-none"/></button>}
//                 {canDelete && <button onClick={() => { onDelete(task._id); onClose(); }} className="neu-flat-sm neu-action-btn p-2 rounded-full text-[#D1242F]"><Trash2 size={16} className="pointer-events-none"/></button>}
//                 <button onClick={onClose} className="neu-flat-sm neu-action-btn p-2 rounded-full text-[#656D76] hover:text-[#D1242F]"><X size={16} className="pointer-events-none"/></button>
//               </div>
//             </div>

//             <div className="flex border-b border-[#D1DCEB]/50 shrink-0 px-6 gap-2">
//               <button onClick={() => setTab("details")} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative neu-action-btn ${tab === "details" ? "text-[#0969DA]" : "text-[#656D76]"}`}>
//                 Details
//                 {tab === "details" && <motion.div layoutId="tabIndicatorTask" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0969DA]" />}
//               </button>
//               <button onClick={() => setTab("comments")} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 neu-action-btn ${tab === "comments" ? "text-[#0969DA]" : "text-[#656D76]"}`}>
//                 <MessageSquare size={14} className="pointer-events-none" /> Comments
//                 {tab === "comments" && <motion.div layoutId="tabIndicatorTask" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0969DA]" />}
//               </button>
//             </div>

//             <div className="flex-1 overflow-hidden flex flex-col relative z-10">
//               {tab === "details" ? (
//                 <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
//                   {task.description && (
//                     <div className="neu-pressed rounded-xl p-5">
//                       <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Description</p>
//                       <p className="text-sm font-medium text-[#1F2328] whitespace-pre-wrap leading-relaxed">{task.description}</p>
//                     </div>
//                   )}
                  
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="neu-pressed rounded-xl p-4">
//                       <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Assigned To</p>
//                       <div className="flex items-center gap-2">
//                         <div className="w-6 h-6 rounded-full neu-btn-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: stringToColor(task.assignedTo?.username) }}>
//                           {task.assignedTo?.username?.charAt(0).toUpperCase()}
//                         </div>
//                         <span className="text-sm font-bold text-[#1F2328]">{task.assignedTo?.username || "Unassigned"}</span>
//                       </div>
//                     </div>
                    
//                     {!isDone && task.deadline && (
//                       <div className="neu-pressed rounded-xl p-4">
//                         <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Deadline</p>
//                         <DeadlineChip deadline={task.deadline} />
//                       </div>
//                     )}
//                     {isDone && task.completedAt && (
//                       <div className="col-span-2 neu-pressed-sm border border-[#1A7F37]/20 rounded-xl p-4 flex items-center gap-3 bg-[#1A7F37]/5">
//                         <CheckCircle2 size={20} className="text-[#1A7F37] shrink-0" />
//                         <span className="text-sm font-bold text-[#1A7F37]">Completed by {task.completedBy?.username} on {format(new Date(task.completedAt), "MMM d, yyyy")}</span>
//                       </div>
//                     )}
//                   </div>

//                   {task.links?.length > 0 && (
//                     <div className="neu-pressed rounded-xl p-5">
//                       <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-3">Reference Links</p>
//                       <div className="flex flex-col gap-2">
//                         {task.links.map((link, i) => (
//                           <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-[#0969DA] hover:underline truncate w-fit relative z-20">
//                             <LinkIcon size={14} /> {link}
//                           </a>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <CommentsPanel taskId={task._id} projectId={projectId} currentUserId={currentUserId} currentUsername={currentUsername} />
//               )}
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// // ── Task Card ─────────────────────────────────────────────────────────────────
// const TaskCard = ({ task, currentUserId, isCreator, isAdmin, isDeveloper, onEdit, onDelete, onComplete, onDragStart, onDragEnd, onClick }) => {
//   const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
//   const isDone     = task.status === "Done";
//   const canComplete = (isAssigned || isAdmin) && !isDone;
//   const canEdit     = isAdmin || isCreator || (isDeveloper && isAssigned);
//   const canDelete   = isAdmin || isCreator || (isDeveloper && isAssigned);
//   const canDrag     = isAdmin || isCreator || isDeveloper;

//   return (
//     <div
//       draggable={canDrag}
//       onDragStart={e => canDrag && onDragStart(e, task)}
//       onDragEnd={canDrag ? onDragEnd : undefined}
//       onClick={() => onClick(task)}
//       className={`relative rounded-xl p-4 mb-3 transition-all duration-200 group flex flex-col gap-3 ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} ${isDone ? "neu-pressed bg-[#1A7F37]/5 border border-[#1A7F37]/20" : "neu-flat-sm hover:-translate-y-[2px]"}`}
//     >
//       <div className="flex gap-2 flex-wrap items-center">
//         <PriorityBadge priority={task.priority} />
//         {!isDone && <DeadlineChip deadline={task.deadline} />}
//         {isDone && <span className="neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-[#1A7F37] flex items-center gap-1"><CheckCircle2 size={10}/> Done</span>}
//       </div>

//       <h4 className={`text-sm font-bold leading-snug ${isDone ? "text-[#1F2328]/60 line-through decoration-[#1A7F37]" : "text-[#1F2328]"}`}>
//         {task.title}
//       </h4>

//       {task.description && (
//         <p className="text-[10px] font-medium text-[#656D76] line-clamp-2 leading-relaxed">
//           {task.description}
//         </p>
//       )}

//       <div className="flex items-center justify-between mt-1 pt-3 border-t border-[#D1DCEB]/50">
//         <div className="flex items-center gap-2">
//           <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ backgroundColor: isDone ? C.success : stringToColor(task.assignedTo?.username) }}>
//             {task.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
//           </div>
//           <span className={`text-[10px] font-bold ${isDone ? "text-[#1A7F37]" : "text-[#656D76]"}`}>{task.assignedTo?.username || "Unassigned"}</span>
//         </div>

//         <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
//           {canComplete && <button onClick={() => onComplete(task)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#1A7F37] hover:text-[#115524]" title="Mark Complete"><CheckCircle2 size={12} className="pointer-events-none" /></button>}
//           {canEdit && <button onClick={() => onEdit(task)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#0969DA] hover:text-[#0854b3]" title="Edit Task"><Edit size={12} className="pointer-events-none" /></button>}
//           {canDelete && <button onClick={() => onDelete(task._id)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#D1242F] hover:text-[#A40E26]" title="Delete Task"><Trash2 size={12} className="pointer-events-none" /></button>}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Kanban Column ─────────────────────────────────────────────────────────────
// const KanbanColumn = ({ column, tasks, currentUserId, isCreator, isAdmin, isDeveloper, canAddTask, onAddTask, onEdit, onDelete, onComplete, onDragStart, onDragEnd, onDrop, onDragOver, onCardClick }) => {
//   const [isOver, setIsOver] = useState(false);
  
//   return (
//     <div
//       onDragOver={e => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
//       onDragLeave={() => setIsOver(false)}
//       onDrop={e => { setIsOver(false); onDrop(e, column.id); }}
//       className={`flex-shrink-0 w-[300px] sm:w-[340px] h-full max-h-full flex flex-col rounded-2xl transition-all duration-200 ${isOver ? "neu-pressed border-2 border-[#0969DA]" : "neu-pressed border-2 border-transparent"}`}
//     >
//       <div className="p-4 flex items-center justify-between border-b border-[#D1DCEB]/50 shrink-0">
//         <div className="flex items-center gap-3">
//           <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
//           <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: column.color }}>{column.label}</h3>
//           <span className="neu-pressed-sm px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ color: column.color }}>{tasks.length}</span>
//         </div>
//         {canAddTask && column.id === "Todo" && (
//           <button onClick={onAddTask} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#0969DA]">
//             <Plus size={14} className="pointer-events-none" />
//           </button>
//         )}
//       </div>
      
//       <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3">
//         {tasks.length === 0 && <div className="text-center py-6 text-xs font-bold text-[#656D76] italic">Drop tasks here</div>}
//         {tasks.map(task => (
//           <TaskCard key={task._id} task={task} currentUserId={currentUserId} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onCardClick} />
//         ))}
//       </div>
//     </div>
//   );
// };

// // ── Task Form Dialog ──────────────────────────────────────────────────────────
// const TaskFormDialog = ({ open, onClose, onSubmit, initialData, projectDevelopers, isCreator, isAdmin, isDeveloper, currentUserId, currentUsername, isSubmitting }) => {

//   const blankForm = useCallback(() => ({
//     title: "", description: "", links: [], priority: "Medium", deadline: "", assignedTo: { id: currentUserId, username: currentUsername },
//   }), [currentUserId, currentUsername]);

//   const [form, setForm] = useState(blankForm);
//   const [linkInput, setLinkInput] = useState("");
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         title: initialData.title || "", description: initialData.description || "", links: initialData.links || [],
//         priority: initialData.priority || "Medium", deadline: initialData.deadline ? format(new Date(initialData.deadline), "yyyy-MM-dd") : "",
//         assignedTo: initialData.assignedTo || { id: currentUserId, username: currentUsername },
//       });
//     } else {
//       setForm(blankForm());
//     }
//     setLinkInput(""); setErrors({});
//   }, [open, initialData, currentUserId, currentUsername, blankForm]);

//   const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: "" })); };

//   const addLink = () => { if (linkInput.trim()) { set("links", [...form.links, linkInput.trim()]); setLinkInput(""); } };
//   const removeLink = i => set("links", form.links.filter((_, idx) => idx !== i));

//   const validate = () => {
//     const e = {};
//     if (!form.title.trim()) e.title = "Title is required";
//     if (!form.deadline) e.deadline = "Deadline is required";
//     return e;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const errs = validate();
//     if (Object.keys(errs).length) { setErrors(errs); return; }
//     onSubmit({ ...form, deadline: form.deadline || null });
//   };

//   const canAssignToOthers = isAdmin || isCreator;
//   const visibleDevelopers = canAssignToOthers ? projectDevelopers : projectDevelopers.filter(d => d.id === currentUserId);

//   return (
//     <AnimatePresence>
//       {open && (
//         <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
//           <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
//             className="neu-flat rounded-2xl w-full max-w-xl flex flex-col relative z-10 max-h-[90vh] overflow-hidden"
//           >
//             <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
//               <h2 className="text-xl font-bold text-[#1F2328]">{initialData ? "Edit Task" : "Create New Task"}</h2>
//               <button type="button" onClick={onClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]">
//                 <X size={18} className="pointer-events-none" />
//               </button>
//             </div>

//             <form id="taskForm" onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
//               <div className="relative z-20">
//                 <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Task Title <span className="text-[#D1242F]">*</span></label>
//                 <input autoFocus type="text" value={form.title} onChange={e => set("title", e.target.value)} placeholder="What needs to be done?" className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
//                 {errors.title && <span className="text-[9px] font-bold text-[#D1242F] mt-1.5 block">{errors.title}</span>}
//               </div>

//               <div className="relative z-20">
//                 <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Description</label>
//                 <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Details, context, criteria..." className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text resize-none custom-scrollbar relative z-20" />
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-20">
//                 <div className="relative z-20">
//                   <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Priority</label>
//                   <div className="relative">
//                     <select value={form.priority} onChange={e => set("priority", e.target.value)} className="w-full neu-pressed rounded-md p-3 pr-8 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20">
//                       <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
//                     </select>
//                     <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
//                   </div>
//                 </div>
//                 <div className="relative z-20">
//                   <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Deadline <span className="text-[#D1242F]">*</span></label>
//                   <input type="date" min={todayStr()} value={form.deadline} onChange={e => set("deadline", e.target.value)} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20" />
//                   {errors.deadline && <span className="text-[9px] font-bold text-[#D1242F] mt-1.5 block">{errors.deadline}</span>}
//                 </div>
//               </div>

//               <div className="relative z-20">
//                 <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Assign To {!canAssignToOthers && "(You Only)"}</label>
//                 <div className="relative">
//                   <select disabled={!canAssignToOthers} value={form.assignedTo?.id || ""} onChange={e => { const dev = projectDevelopers.find(d => d.id === e.target.value); if (dev) set("assignedTo", dev); }} className="w-full neu-pressed rounded-md p-3 pr-8 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent disabled:opacity-60 relative z-20">
//                     {visibleDevelopers.map(dev => <option key={dev.id} value={dev.id}>{dev.username} {dev.id === currentUserId ? "(You)" : ""}</option>)}
//                   </select>
//                   <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
//                 </div>
//               </div>

//               <div className="relative z-20">
//                 <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Reference Links</label>
//                 <div className="flex gap-2 mb-3 relative z-30">
//                   <input type="text" value={linkInput} onChange={e => setLinkInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }} placeholder="https://..." className="flex-1 neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-40" />
//                   <button type="button" onClick={addLink} className="neu-flat neu-action-btn px-4 rounded-md text-xs font-bold text-[#0969DA] relative z-40">Add Link</button>
//                 </div>
//                 <div className="space-y-2">
//                   {form.links.map((link, i) => (
//                     <div key={i} className="flex items-center gap-2 neu-pressed-sm rounded-md p-2 pl-3">
//                       <LinkIcon size={12} className="text-[#0969DA] shrink-0" />
//                       <span className="text-xs font-bold text-[#0969DA] truncate flex-1">{link}</span>
//                       <button type="button" onClick={() => removeLink(i)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#D1242F]"><X size={12} className="pointer-events-none"/></button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </form>

//             <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end gap-4 shrink-0 relative z-20">
//               <button type="button" onClick={onClose} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">Cancel</button>
//               <button type="submit" form="taskForm" disabled={isSubmitting} className="neu-btn-primary px-8 py-2.5 rounded-lg text-sm font-bold text-white neu-action-btn flex items-center gap-2 disabled:opacity-50">
//                 {isSubmitting ? <Loader2 size={16} className="animate-spin pointer-events-none" /> : <CheckCircle2 size={16} className="pointer-events-none" />}
//                 {initialData ? "Save Changes" : "Create Task"}
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// // ── Chart Tab ─────────────────────────────────────────────────────────────────
// const ChartTab = ({ tasks, projectDevelopers }) => {
//   const byStatus   = COLUMNS.map(c => ({ label:c.label, count:tasks.filter(t=>t.status===c.id).length, color:c.color }));
//   const byPriority = ["Critical","High","Medium","Low"].map(p => ({ label:p, count:tasks.filter(t=>t.priority===p).length, ...PRIORITY_CONFIG[p] }));
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
//     <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6">
      
//       {/* Progress Ring */}
//       <div className="neu-flat rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
//         <div className="relative w-24 h-24 shrink-0 neu-pressed rounded-full p-2">
//           <svg width="100%" height="100%" viewBox="0 0 80 80" className="transform -rotate-90">
//             <circle cx="40" cy="40" r="34" fill="none" stroke="#D1DCEB" strokeWidth="8" opacity="0.5" />
//             <circle cx="40" cy="40" r="34" fill="none" stroke="#1A7F37" strokeWidth="8" strokeDasharray={`${2*Math.PI*34*progress/100} ${2*Math.PI*34*(1-progress/100)}`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
//           </svg>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <span className="text-xl font-bold text-[#1A7F37]">{progress}%</span>
//           </div>
//         </div>
//         <div className="text-center sm:text-left pt-2">
//           <h3 className="text-xl font-bold text-[#1F2328]">Overall Project Progress</h3>
//           <p className="text-sm font-bold text-[#656D76] mt-1">{doneTasks} of {totalTasks} tasks fully completed</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Status Bars */}
//         <div className="neu-flat rounded-2xl p-6">
//           <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-5">Tasks by Status</h3>
//           <div className="space-y-4">
//             {byStatus.map(s => (
//               <div key={s.label}>
//                 <div className="flex justify-between items-end mb-1.5">
//                   <span className="text-xs font-bold text-[#1F2328]">{s.label}</span>
//                   <span className="text-xs font-bold text-[#656D76]">{s.count}</span>
//                 </div>
//                 <div className="h-2.5 rounded-full neu-pressed-sm overflow-hidden">
//                   <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(s.count/maxStatus)*100}%`, backgroundColor: s.color }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Priority Bars */}
//         <div className="neu-flat rounded-2xl p-6">
//           <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-5">Tasks by Priority</h3>
//           <div className="space-y-4">
//             {byPriority.map(p => (
//               <div key={p.label}>
//                 <div className="flex justify-between items-end mb-1.5">
//                   <span className="text-xs font-bold text-[#1F2328] flex items-center gap-1"><span style={{color: p.color}}>{p.icon}</span> {p.label}</span>
//                   <span className="text-xs font-bold text-[#656D76]">{p.count}</span>
//                 </div>
//                 <div className="h-2.5 rounded-full neu-pressed-sm overflow-hidden">
//                   <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(p.count/maxPriority)*100}%`, backgroundColor: p.color }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Workload */}
//       {byDev.length > 0 && (
//         <div className="neu-flat rounded-2xl p-6">
//           <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-5">Developer Workload</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {byDev.map(d => (
//               <div key={d.username} className="neu-pressed rounded-xl p-4">
//                 <div className="flex items-center gap-2 mb-4 border-b border-[#D1DCEB]/50 pb-3">
//                   <div className="w-6 h-6 rounded-full neu-btn-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: stringToColor(d.username) }}>
//                     {d.username.charAt(0).toUpperCase()}
//                   </div>
//                   <span className="text-sm font-bold text-[#1F2328] truncate">{d.username}</span>
//                 </div>
//                 <div className="grid grid-cols-3 gap-2 text-center">
//                   <div className="neu-flat-sm rounded-lg py-2"><p className="text-lg font-bold text-[#656D76]">{d.todo}</p><p className="text-[9px] font-bold text-[#656D76] uppercase">Todo</p></div>
//                   <div className="neu-flat-sm rounded-lg py-2"><p className="text-lg font-bold text-[#0969DA]">{d.wip}</p><p className="text-[9px] font-bold text-[#656D76] uppercase">WIP</p></div>
//                   <div className="neu-flat-sm rounded-lg py-2"><p className="text-lg font-bold text-[#1A7F37]">{d.done}</p><p className="text-[9px] font-bold text-[#656D76] uppercase">Done</p></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
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
//     <div className="h-full overflow-y-auto custom-scrollbar p-6 flex flex-col xl:flex-row gap-6">
      
//       {/* Calendar Grid */}
//       <div className="flex-1 neu-flat rounded-2xl p-6">
//         <div className="flex justify-between items-center mb-6">
//           <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()-1, 1))} className="neu-flat-sm neu-action-btn p-2 rounded-lg text-[#656D76]"><ChevronLeft size={16} className="pointer-events-none"/></button>
//           <h2 className="text-lg font-bold text-[#1F2328]">{format(current, "MMMM yyyy")}</h2>
//           <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()+1, 1))} className="neu-flat-sm neu-action-btn p-2 rounded-lg text-[#656D76]"><ChevronRight size={16} className="pointer-events-none"/></button>
//         </div>

//         <div className="grid grid-cols-7 gap-2 mb-2">
//           {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
//             <div key={d} className="text-center text-[10px] font-bold text-[#656D76] uppercase tracking-wider py-1">{d}</div>
//           ))}
//         </div>

//         <div className="grid grid-cols-7 gap-2">
//           {Array.from({ length:startPad }).map((_,i) => <div key={`pad-${i}`} className="neu-pressed-sm rounded-lg opacity-30 min-h-[80px]" />)}
//           {days.map(day => {
//             const dayTasks = tasksOnDay(day);
//             const isCurrentDay = isToday(day);
//             return (
//               <div key={day.toISOString()} className={`min-h-[80px] rounded-lg p-1.5 flex flex-col gap-1 transition-colors ${isCurrentDay ? "neu-pressed border border-[#0969DA]/30" : "neu-pressed-sm"}`}>
//                 <span className={`text-xs font-bold text-center mb-1 ${isCurrentDay ? "text-[#0969DA]" : "text-[#656D76]"}`}>{format(day,"d")}</span>
//                 {dayTasks.slice(0,2).map(t => (
//                   <button type="button" key={t._id} onClick={() => onCardClick(t)} className="text-left w-full truncate px-1.5 py-1 rounded-[4px] text-[9px] font-bold neu-action-btn" style={{ backgroundColor: PRIORITY_CONFIG[t.priority]?.color + '15', color: PRIORITY_CONFIG[t.priority]?.color }}>
//                     {t.title}
//                   </button>
//                 ))}
//                 {dayTasks.length > 2 && <span className="text-center text-[9px] font-bold text-[#656D76] italic">+{dayTasks.length-2} more</span>}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Upcoming List */}
//       <div className="w-full xl:w-80 shrink-0 neu-pressed rounded-2xl p-5 h-fit">
//         <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-4 border-b border-[#D1DCEB]/50 pb-2">Upcoming Deadlines</h3>
//         {tasksWithDeadline.length === 0 ? (
//           <p className="text-center py-6 text-xs font-bold text-[#656D76] italic">No active deadlines.</p>
//         ) : (
//           <div className="space-y-3">
//             {tasksWithDeadline.sort((a,b) => new Date(a.deadline)-new Date(b.deadline)).slice(0,8).map(t => (
//               <div key={t._id} onClick={() => onCardClick(t)} className="neu-flat-sm neu-action-btn rounded-xl p-3 flex flex-col gap-2">
//                 <span className="text-xs font-bold text-[#1F2328] truncate leading-tight">{t.title}</span>
//                 <div className="flex justify-between items-center">
//                   <PriorityBadge priority={t.priority} />
//                   <DeadlineChip deadline={t.deadline} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── List Tab ──────────────────────────────────────────────────────────────────
// const ListTab = ({ tasks, currentUserId, isAdmin, isCreator, isDeveloper, onEdit, onDelete, onComplete, onCardClick }) => {
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

//   return (
//     <div className="h-full flex flex-col">
//       <div className="p-4 sm:px-6 border-b border-[#D1DCEB]/50 shrink-0 flex flex-wrap items-center justify-between gap-4 relative z-20">
//         <div className="flex items-center gap-2">
//           <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mr-2">Sort by:</span>
//           {["priority", "deadline", "status", "assignee"].map(s => (
//             <button key={s} onClick={() => setSortBy(s)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors neu-action-btn ${sortBy === s ? "neu-pressed text-[#0969DA]" : "neu-flat-sm text-[#656D76]"}`}>
//               {s}
//             </button>
//           ))}
//         </div>
//         <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">{tasks.length} Total Tasks</span>
//       </div>

//       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 relative z-10">
//         {sorted.length === 0 ? (
//           <div className="text-center py-12 text-sm font-bold text-[#656D76] italic">No tasks found.</div>
//         ) : sorted.map(task => {
//           const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
//           const isDone     = task.status === "Done";
//           const canEdit    = isAdmin || isCreator || (isDeveloper && isAssigned);
//           const canDel     = isAdmin || isCreator || (isDeveloper && isAssigned);
//           const canComp    = (isAssigned || isAdmin) && !isDone;

//           return (
//             <div key={task._id} onClick={() => onCardClick(task)} className={`rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-transform duration-200 cursor-pointer group ${isDone ? "neu-pressed bg-[#1A7F37]/5 border border-[#1A7F37]/20" : "neu-flat-sm hover:-translate-y-[2px]"}`}>
              
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2 mb-1.5">
//                   <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLUMNS.find(c => c.id === task.status)?.color }} />
//                   <span className={`text-sm font-bold truncate ${isDone ? "text-[#1F2328]/60 line-through decoration-[#1A7F37]" : "text-[#1F2328]"}`}>{task.title}</span>
//                 </div>
//                 <div className="flex items-center gap-2 flex-wrap ml-4">
//                   <PriorityBadge priority={task.priority} />
//                   {!isDone && <DeadlineChip deadline={task.deadline} />}
//                 </div>
//               </div>

//               <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pl-4 sm:pl-0 border-t sm:border-none border-[#D1DCEB]/50 pt-3 sm:pt-0">
//                 <div className="flex items-center gap-2" title={task.assignedTo?.username}>
//                   <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: isDone ? C.success : stringToColor(task.assignedTo?.username) }}>
//                     {task.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
//                   </div>
//                   <span className={`text-xs font-bold ${isDone ? "text-[#1A7F37]" : "text-[#656D76]"} hidden md:inline-block max-w-[100px] truncate`}>{task.assignedTo?.username || "Unassigned"}</span>
//                 </div>

//                 <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
//                   {canComp && <button onClick={() => onComplete(task)} className="neu-flat-sm neu-action-btn p-2 rounded-md text-[#1A7F37] hover:text-[#115524]"><CheckCircle2 size={14} className="pointer-events-none" /></button>}
//                   {canEdit && <button onClick={() => onEdit(task)} className="neu-flat-sm neu-action-btn p-2 rounded-md text-[#0969DA] hover:text-[#0854b3]"><Edit size={14} className="pointer-events-none" /></button>}
//                   {canDel && <button onClick={() => onDelete(task._id)} className="neu-flat-sm neu-action-btn p-2 rounded-md text-[#D1242F] hover:text-[#A40E26]"><Trash2 size={14} className="pointer-events-none" /></button>}
//                 </div>
//               </div>

//             </div>
//           );
//         })}
//       </div>
//     </div>
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
//     <AnimatePresence>
//       {open && (
//         <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
//           <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
//             className="neu-flat rounded-2xl w-full max-w-lg flex flex-col relative z-10 max-h-[85vh] overflow-hidden"
//           >
//             <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
//               <div className="flex items-center gap-3">
//                 <div className="neu-pressed-sm p-2 rounded-lg text-[#656D76]"><History size={18}/></div>
//                 <h2 className="text-xl font-bold text-[#1F2328]">Completion History</h2>
//               </div>
//               <button type="button" onClick={onClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]">
//                 <X size={18} className="pointer-events-none" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
//               {loading ? (
//                 <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#0969DA]"/></div>
//               ) : completions.length === 0 ? (
//                 <div className="text-center py-12 text-sm font-bold text-[#656D76] italic">No completed tasks yet.</div>
//               ) : (
//                 completions.map((c) => (
//                   <div key={c._id} className="neu-pressed rounded-xl p-4 flex gap-4 items-start">
//                     <CheckCircle2 size={20} className="text-[#1A7F37] shrink-0 mt-0.5" />
//                     <div className="min-w-0 flex-1">
//                       <p className="text-sm font-bold text-[#1F2328] mb-2 truncate">{c.taskTitle}</p>
//                       <div className="flex flex-wrap items-center gap-2 mb-2">
//                         <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider neu-pressed-sm px-2 py-1 rounded-md">By {c.completedBy?.username}</span>
//                         <span className="text-[10px] font-bold text-[#656D76]">{format(new Date(c.completedAt),"MMM d, yyyy · h:mm a")}</span>
//                       </div>
//                       {c.priority && <PriorityBadge priority={c.priority} />}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
            
//             <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end shrink-0">
//               <button type="button" onClick={onClose} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">Close</button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// // ── MAIN KANBAN (Exported Component) ──────────────────────────────────────────
// export default function ProjectKanban({ open, onClose, project }) {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [taskFormOpen, setTaskFormOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);
//   const [historyOpen, setHistoryOpen] = useState(false);
//   const [detailTask, setDetailTask] = useState(null);
//   const [activeTab, setActiveTab] = useState("kanban");
//   const [filterUser, setFilterUser] = useState("all");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterPriority, setFilterPriority] = useState("all");
//   const [isSubmittingTask, setIsSubmittingTask] = useState(false); 
//   const [snack, setSnack] = useState({ open:false, msg:"", severity:"success" });
  
//   const dragTask = useRef(null);

//   const currentUserId   = localStorage.getItem("userId");
//   const currentUsername = localStorage.getItem("username") || "You";
//   const currentUserRole = localStorage.getItem("role") || "developer";
  
//   const isAdmin     = currentUserRole === "admin";
//   const isDeveloper = currentUserRole === "developer";
//   const isCreator   = isAdmin || project?.createdBy === currentUsername;

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

//   const fetchTasks = useCallback(async (showLoader = true) => {
//     if (!project?._id) return;
//     if (showLoader) setLoading(true);
//     try {
//       const r = await axios.get(`${API_BASE}/api/tasks/${project._id}`, { headers:authHeaders() });
//       setTasks(r.data || []);
//     } catch {
//       if (showLoader) setTasks([]);
//     } finally {
//       if (showLoader) setLoading(false);
//     }
//   }, [project?._id]);

//   useEffect(() => { 
//     if (open) fetchTasks(true); 
//     else setTasks([]); 
//   }, [open, fetchTasks]);

//   const filteredTasks = useMemo(() => tasks.filter(t => {
//     if (filterUser     !== "all" && t.assignedTo?.id !== filterUser) return false;
//     if (filterStatus   !== "all" && t.status         !== filterStatus) return false;
//     if (filterPriority !== "all" && t.priority        !== filterPriority) return false;
//     return true;
//   }), [tasks, filterUser, filterStatus, filterPriority]);

//   const tasksByStatus = status => filteredTasks.filter(t => t.status === status);
//   const hasFilters    = filterUser !== "all" || filterStatus !== "all" || filterPriority !== "all";

//   // CRUD Handlers
//   const handleTaskSubmit = async formData => {
//     setIsSubmittingTask(true);
//     try {
//       if (editingTask) {
//         await axios.put(`${API_BASE}/api/tasks/${project._id}/${editingTask._id}`, formData, { headers:authHeaders() });
//         toast("Task updated successfully");
//       } else {
//         await axios.post(`${API_BASE}/api/tasks/${project._id}`, formData, { headers:authHeaders() });
//         toast("Task created successfully");
//       }
//       setTaskFormOpen(false); 
//       setEditingTask(null); 
//       if (detailTask && editingTask) {
//          setDetailTask({...detailTask, ...formData});
//       }
//       fetchTasks(false); 
//     } catch (err) { 
//       toast(err.response?.data?.message || "Failed to save task","error"); 
//     } finally {
//       setIsSubmittingTask(false);
//     }
//   };

//   const handleDelete = async taskId => {
//     try {
//       await axios.delete(`${API_BASE}/api/tasks/${project._id}/${taskId}`, { headers:authHeaders() });
//       setTasks(prev => prev.filter(t => t._id !== taskId));
//       toast("Task deleted");
//     } catch (err) { toast(err.response?.data?.message || "Failed to delete task","error"); }
//   };

//   const handleComplete = async task => {
//     setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: "Done" } : t));
//     try {
//       await axios.post(`${API_BASE}/api/tasks/${project._id}/${task._id}/complete`, {}, { headers:authHeaders() });
//       toast("Task completed! 🎉"); 
//       fetchTasks(false); 
//     } catch (err) { 
//       toast(err.response?.data?.message || "Failed to complete task","error"); 
//       fetchTasks(false); 
//     }
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
//         await axios.post(`${API_BASE}/api/tasks/${project._id}/${task._id}/complete`, {}, { headers:authHeaders() });
//         toast("Task completed! 🎉");
//       } else {
//         await axios.put(`${API_BASE}/api/tasks/${project._id}/${task._id}`, { status:newStatus }, { headers:authHeaders() });
//       }
//       fetchTasks(false);
//     } catch {
//       fetchTasks(false);
//       toast("Failed to move task","error");
//     }
//   };

//   if (!project) return null;

//   const TABS = [
//     { id:"kanban",   label:"Board",    Icon:KanbanSquare },
//     { id:"list",     label:"List",     Icon:List         },
//     { id:"calendar", label:"Calendar", Icon:Calendar     },
//     { id:"chart",    label:"Charts",   Icon:BarChart     },
//   ];

//   return (
//     <AnimatePresence>
//       {open && (
//         <div className="fixed inset-0 z-[99990] flex items-center justify-center p-0 sm:p-6 md:p-8 montserrat-regular text-[#1F2328]">
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#F0F4F8]/90 backdrop-blur-md z-0 cursor-pointer" />
          
//           <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} onClick={(e) => e.stopPropagation()} 
//             className="neu-flat sm:rounded-2xl w-full h-full sm:h-[95vh] flex flex-col relative z-10 overflow-hidden shadow-2xl border border-[#D1DCEB]/50"
//           >
//             {/* Header */}
//             <div className="p-4 sm:px-6 border-b border-[#D1DCEB]/50 flex items-center justify-between shrink-0 bg-[#F0F4F8] z-20 relative">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 rounded-xl neu-btn-primary flex items-center justify-center text-white shrink-0 shadow-lg">
//                   <FolderDot size={24} />
//                 </div>
//                 <div>
//                   <h2 className="text-xl sm:text-2xl font-bold text-[#1F2328]">{project.projectName}</h2>
//                   <p className="text-[10px] sm:text-xs font-bold text-[#0969DA] uppercase tracking-wider mt-0.5">Project Workspace</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 sm:gap-4 shrink-0">
//                 <button onClick={() => setHistoryOpen(true)} title="Completion History" className="neu-flat-sm neu-action-btn p-2 sm:p-3 rounded-xl text-[#656D76] hover:text-[#0969DA]">
//                   <History size={18} className="pointer-events-none" />
//                 </button>
//                 {canAddTask && (
//                   <button onClick={() => { setEditingTask(null); setTaskFormOpen(true); }} className="neu-btn-primary px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-bold text-white neu-action-btn flex items-center gap-2">
//                     <Plus size={16} className="pointer-events-none" /> <span className="hidden sm:inline">Add Task</span>
//                   </button>
//                 )}
//                 <button onClick={onClose} className="neu-flat-sm neu-action-btn p-2 sm:p-3 rounded-xl text-[#656D76] hover:text-[#D1242F] ml-2">
//                   <X size={20} className="pointer-events-none" />
//                 </button>
//               </div>
//             </div>

//             {/* Tab Bar & Filters */}
//             <div className="px-4 sm:px-6 py-3 border-b border-[#D1DCEB]/50 flex flex-col xl:flex-row justify-between xl:items-center gap-4 shrink-0 bg-[#F0F4F8] z-20 relative">
              
//               {/* Tabs */}
//               <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 xl:pb-0">
//                 {TABS.map(({ id, label, Icon }) => (
//                   <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 neu-action-btn ${activeTab === id ? "neu-pressed text-[#0969DA]" : "neu-flat-sm text-[#656D76]"}`}>
//                     <Icon size={14} className="pointer-events-none" /> {label}
//                   </button>
//                 ))}
//               </div>

//               {/* Filters */}
//               <div className="flex flex-wrap items-center gap-3">
//                 <div className="flex items-center gap-2">
//                   <Filter size={14} className="text-[#656D76]" />
//                   <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider hidden sm:inline">Filters</span>
//                 </div>
                
//                 <div className="relative">
//                   <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="neu-pressed rounded-md py-2 pl-3 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
//                     <option value="all">All Members</option>
//                     {projectDevelopers.map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
//                   </select>
//                   <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
//                 </div>

//                 <div className="relative">
//                   <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="neu-pressed rounded-md py-2 pl-3 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
//                     <option value="all">All Status</option>
//                     {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
//                   </select>
//                   <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
//                 </div>

//                 <div className="relative">
//                   <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="neu-pressed rounded-md py-2 pl-3 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
//                     <option value="all">All Priorities</option>
//                     {["Critical","High","Medium","Low"].map(p => <option key={p} value={p}>{p}</option>)}
//                   </select>
//                   <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
//                 </div>

//                 {hasFilters && (
//                   <button onClick={() => { setFilterUser("all"); setFilterStatus("all"); setFilterPriority("all"); }} className="neu-pressed-sm neu-action-btn px-3 py-2 rounded-md text-[10px] font-bold text-[#D1242F] uppercase tracking-wider">
//                     Clear
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Dynamic Tab Content Area */}
//             <div className="flex-1 overflow-hidden relative z-10 bg-[#F0F4F8]">
//               {loading ? (
//                 <div className="flex h-full items-center justify-center"><Loader2 size={32} className="animate-spin text-[#0969DA]" /></div>
//               ) : (
//                 <AnimatePresence mode="wait">
//                   <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
                    
//                     {activeTab === "kanban" && (
//                       <div className="flex gap-6 p-4 sm:p-6 h-full min-h-0 overflow-x-auto overflow-y-hidden custom-scrollbar items-start">
//                         {COLUMNS.map(col => (
//                           <KanbanColumn key={col.id} column={col} tasks={tasksByStatus(col.id)} currentUserId={currentUserId} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper} canAddTask={canAddTask} onAddTask={() => { setEditingTask(null); setTaskFormOpen(true); }} onEdit={task => { setEditingTask(task); setTaskFormOpen(true); }} onDelete={handleDelete} onComplete={handleComplete} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDrop={handleDrop} onCardClick={setDetailTask} />
//                         ))}
//                       </div>
//                     )}
                    
//                     {activeTab === "list" && <ListTab tasks={filteredTasks} currentUserId={currentUserId} isAdmin={isAdmin} isCreator={isCreator} isDeveloper={isDeveloper} onEdit={task => { setEditingTask(task); setTaskFormOpen(true); }} onDelete={handleDelete} onComplete={handleComplete} onCardClick={setDetailTask} />}
                    
//                     {activeTab === "calendar" && <CalendarTab tasks={filteredTasks} onCardClick={setDetailTask} />}
                    
//                     {activeTab === "chart" && <ChartTab tasks={filteredTasks} projectDevelopers={projectDevelopers} />}
                    
//                   </motion.div>
//                 </AnimatePresence>
//               )}
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* Embedded Modals managed by Kanban */}
//       <TaskFormDialog open={taskFormOpen} onClose={() => { setTaskFormOpen(false); setEditingTask(null); }} onSubmit={handleTaskSubmit} initialData={editingTask} projectDevelopers={projectDevelopers} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper} currentUserId={currentUserId} currentUsername={currentUsername} isSubmitting={isSubmittingTask} />
      
//       <TaskDetailDialog open={!!detailTask} onClose={() => setDetailTask(null)} task={detailTask} projectId={project?._id} currentUserId={currentUserId} currentUsername={currentUsername} canEdit={isAdmin || isCreator || (isDeveloper && detailTask?.assignedTo?.id?.toString() === currentUserId?.toString())} canDelete={isAdmin || isCreator || (isDeveloper && detailTask?.assignedTo?.id?.toString() === currentUserId?.toString())} onEdit={task => { setDetailTask(null); setEditingTask(task); setTaskFormOpen(true); }} onDelete={handleDelete} />
      
//       <CompletionHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} projectId={project?._id} />

//       {/* Snackbar */}
//       <AnimatePresence>
//         {snack.open && (
//           <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-6 right-6 z-[999999] flex items-center gap-4 neu-flat rounded-xl p-4 montserrat-medium max-w-sm">
//             <div className={`neu-pressed-sm p-2 rounded-full shrink-0 ${snack.severity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
//                {snack.severity === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
//             </div>
//             <span className={`text-xs font-bold ${snack.severity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>{snack.msg}</span>
//             <button type="button" onClick={() => setSnack(p=>({...p, open:false}))} className="neu-flat-sm neu-action-btn rounded-lg p-1.5 text-[#656D76] ml-auto shrink-0"><X size={14} className="pointer-events-none" /></button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <style>{`
//         /* Force Input Clickability and Text Selection globally */
//         input, textarea, select { position: relative; z-index: 20; pointer-events: auto !important; user-select: text !important; -webkit-user-select: text !important; }
//         select { cursor: pointer !important; -moz-appearance: none; -webkit-appearance: none; appearance: none; }
//         .neu-action-btn { cursor: pointer; transition: all 0.2s ease; position: relative; z-index: 20; user-select: none; -webkit-user-select: none; }
//         .neu-action-btn:active:not(:disabled) { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light) !important; }
//         .neu-btn-primary { background-color: #0969DA; box-shadow: 3px 3px 8px rgba(9, 105, 218, 0.3); border: none; position: relative; z-index: 20; cursor: pointer; user-select: none; -webkit-user-select: none; }
//         .neu-btn-primary:active:not(:disabled) { box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2); }
//         button svg { pointer-events: none !important; }
//         input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px var(--neu-bg) inset !important; -webkit-text-fill-color: #1F2328 !important; }
//         .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 4px 0;}
//         .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
//       `}</style>
//     </AnimatePresence>
//   );

// }






























import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  format, isBefore, addDays, startOfMonth, endOfMonth, 
  eachDayOfInterval, getDay, isSameDay, isToday, differenceInCalendarDays,
  addMonths, subMonths
} from "date-fns";
import {
  X, Plus, Trash2, Edit, CheckCircle2, Link as LinkIcon, 
  Calendar, History, KanbanSquare, BarChart, List, 
  Send, MessageSquare, Filter, Loader2, ChevronDown, 
  AlertCircle, AlertTriangle, ArrowRight, ArrowDown, ArrowUp, Flag,
  FolderDot, ChevronLeft, ChevronRight, ChevronUp, Edit3, User
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Strict System Colors ──────────────────────────────────────────────────────
const C = {
  primary: "#0969DA",
  success: "#1A7F37",
  danger: "#D1242F",
  warning: "#BF8700",
  text: "#1F2328",
  textSec: "#656D76"
};

const PRIORITY_CONFIG = {
  Low:      { color: C.success, icon: <ArrowDown size={12}/> },
  Medium:   { color: C.primary, icon: <ArrowRight size={12}/> },
  High:     { color: C.warning, icon: <ArrowUp size={12}/> },
  Critical: { color: C.danger,  icon: <Flag size={12}/> },
};

const COLUMNS = [
  { id: "Todo",        label: "To Do",       color: C.textSec },
  { id: "In Progress", label: "In Progress", color: C.primary },
  { id: "Done",        label: "Done",        color: C.success },
];

const AVATAR_PALETTE = [C.primary, C.success, C.warning, C.danger, "#8B5CF6", "#06B6D4"];
const stringToColor = (s) => {
  if (!s) return AVATAR_PALETTE[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
};
const getAvatarBg = stringToColor;

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}`, "x-timezone-offset": new Date().getTimezoneOffset().toString() });
const todayStr = () => format(new Date(), "yyyy-MM-dd");

// Helper to check if a task is within 2 hours of creation
const isTaskWithin2Hours = (task) => {
  if (!task) return false;
  let createdTime = 0;
  if (task.createdAt) {
    createdTime = new Date(task.createdAt).getTime();
  } else if (task._id && typeof task._id === 'string' && task._id.length === 24) {
    // Fallback: extract timestamp from MongoDB ObjectId
    createdTime = parseInt(task._id.substring(0, 8), 16) * 1000;
  }
  if (!createdTime) return false;
  return (Date.now() - createdTime) <= 2 * 60 * 60 * 1000;
};

// ── Small Helpers ─────────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  return (
    <div className="flex items-center gap-1 neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
      {cfg.icon} {priority}
    </div>
  );
};

const DeadlineChip = ({ deadline }) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const diff = differenceInCalendarDays(d, new Date());
  
  const isOverdue = diff < 0;
  const isCritical = diff === 0 || diff === 1;
  const isSoon = diff > 1 && diff <= 3;

  let color = C.textSec;
  let label = format(d, "MMM d");
  let icon = <Calendar size={12} />;

  if (isOverdue) {
    color = C.danger;
    label = `OVERDUE (${Math.abs(diff)}d)`;
    icon = <AlertTriangle size={12} />;
  } else if (isCritical) {
    color = C.danger;
    label = diff === 0 ? "Due Today" : "Due Tomorrow";
    icon = <AlertCircle size={12} />;
  } else if (isSoon) {
    color = C.warning;
    label = `Due in ${diff}d`;
  }

  return (
    <div className="flex items-center gap-1.5 neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
      {icon} {label}
    </div>
  );
};

// ── Comments Panel ────────────────────────────────────────────────────────────
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
      const r = await axios.get(`${API_BASE}/api/tasks/${projectId}/${taskId}/comments`, { headers: authHeaders() });
      setComments(r.data || []);
    } catch { setComments([]); } 
    finally { setLoading(false); }
  }, [taskId, projectId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const postComment = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await axios.post(`${API_BASE}/api/tasks/${projectId}/${taskId}/comments`, { text: text.trim() }, { headers: authHeaders() });
      setText("");
      await fetchComments();
    } catch (err) { console.error(err); } 
    finally { setPosting(false); }
  };

  const deleteComment = async (commentId) => {
    setDeletingId(commentId);
    try {
      await axios.delete(`${API_BASE}/api/tasks/${projectId}/${taskId}/comments/${commentId}`, { headers: authHeaders() });
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) { console.error(err); } 
    finally { setDeletingId(null); }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F0F4F8]">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center pt-8"><Loader2 size={24} className="animate-spin text-[#0969DA]" /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-xs font-bold text-[#656D76] italic">No comments yet.</div>
        ) : comments.map((c) => {
          const isMe = c.createdBy?.id?.toString() === currentUserId?.toString();
          return (
            <div key={c._id} className={`flex gap-3 items-start ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-8 h-8 rounded-full neu-flat-sm flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ backgroundColor: stringToColor(c.createdBy?.username) }}>
                {c.createdBy?.username?.charAt(0).toUpperCase()}
              </div>
              <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-[#1F2328]">{isMe ? "You" : c.createdBy?.username}</span>
                  <span className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider">{c.createdAt ? format(new Date(c.createdAt), "MMM d, h:mm a") : ""}</span>
                  {isMe && (
                    <button onClick={() => deleteComment(c._id)} disabled={deletingId === c._id} className="neu-flat-sm neu-action-btn p-1 rounded text-[#D1242F] disabled:opacity-50">
                      {deletingId === c._id ? <Loader2 size={10} className="animate-spin pointer-events-none" /> : <Trash2 size={10} className="pointer-events-none" />}
                    </button>
                  )}
                </div>
                <div className={`neu-pressed rounded-xl p-3 text-sm font-medium text-[#1F2328] whitespace-pre-wrap ${isMe ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
                  {c.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-[#D1DCEB]/50 shrink-0 flex gap-3 relative z-20">
        <textarea
          rows={2}
          placeholder="Write a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
          className="flex-1 neu-pressed rounded-lg p-3 text-sm font-medium text-[#1F2328] outline-none resize-none custom-scrollbar relative z-20"
        />
        <button
          onClick={postComment}
          disabled={!text.trim() || posting}
          className="neu-btn-primary rounded-lg px-5 flex items-center justify-center text-white disabled:opacity-50 neu-action-btn shrink-0"
        >
          {posting ? <Loader2 size={18} className="animate-spin pointer-events-none" /> : <Send size={18} className="pointer-events-none" />}
        </button>
      </div>
    </div>
  );
};

// ── Task Detail Dialog ────────────────────────────────────────────────────────
const TaskDetailDialog = ({ open, onClose, task, projectId, currentUserId, currentUsername, canEdit, onEdit, canDelete, onDelete }) => {
  const [tab, setTab] = useState("details");
  if (!task) return null;
  const isDone = task.status === "Done";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
            className="neu-flat rounded-2xl w-full max-w-2xl flex flex-col relative z-10 max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-start shrink-0">
              <div className="pr-4">
                <h2 className={`text-xl font-bold ${isDone ? "text-[#1F2328]/60 line-through decoration-[#1A7F37]" : "text-[#1F2328]"} mb-3`}>{task.title}</h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <PriorityBadge priority={task.priority} />
                  {!isDone && <DeadlineChip deadline={task.deadline} />}
                  {isDone && <div className="neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-[#1A7F37] flex items-center gap-1"><CheckCircle2 size={12}/> Completed</div>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canEdit && <button onClick={() => { onClose(); onEdit(task); }} className="neu-flat-sm neu-action-btn p-2 rounded-full text-[#0969DA]"><Edit size={16} className="pointer-events-none"/></button>}
                {canDelete && <button onClick={() => { onDelete(task._id); onClose(); }} className="neu-flat-sm neu-action-btn p-2 rounded-full text-[#D1242F]"><Trash2 size={16} className="pointer-events-none"/></button>}
                <button onClick={onClose} className="neu-flat-sm neu-action-btn p-2 rounded-full text-[#656D76] hover:text-[#D1242F]"><X size={16} className="pointer-events-none"/></button>
              </div>
            </div>

            <div className="flex border-b border-[#D1DCEB]/50 shrink-0 px-6 gap-2">
              <button onClick={() => setTab("details")} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative neu-action-btn ${tab === "details" ? "text-[#0969DA]" : "text-[#656D76]"}`}>
                Details
                {tab === "details" && <motion.div layoutId="tabIndicatorTask" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0969DA]" />}
              </button>
              <button onClick={() => setTab("comments")} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 neu-action-btn ${tab === "comments" ? "text-[#0969DA]" : "text-[#656D76]"}`}>
                <MessageSquare size={14} className="pointer-events-none" /> Comments
                {tab === "comments" && <motion.div layoutId="tabIndicatorTask" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0969DA]" />}
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col relative z-10">
              {tab === "details" ? (
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                  {task.description && (
                    <div className="neu-pressed rounded-xl p-5">
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Description</p>
                      <p className="text-sm font-medium text-[#1F2328] whitespace-pre-wrap leading-relaxed">{task.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="neu-pressed rounded-xl p-4">
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Assigned To</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full neu-btn-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: stringToColor(task.assignedTo?.username) }}>
                          {task.assignedTo?.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-[#1F2328]">{task.assignedTo?.username || "Unassigned"}</span>
                      </div>
                    </div>
                    
                    {!isDone && task.deadline && (
                      <div className="neu-pressed rounded-xl p-4">
                        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Deadline</p>
                        <DeadlineChip deadline={task.deadline} />
                      </div>
                    )}
                    {isDone && task.completedAt && (
                      <div className="col-span-2 neu-pressed-sm border border-[#1A7F37]/20 rounded-xl p-4 flex items-center gap-3 bg-[#1A7F37]/5">
                        <CheckCircle2 size={20} className="text-[#1A7F37] shrink-0" />
                        <span className="text-sm font-bold text-[#1A7F37]">Completed by {task.completedBy?.username} on {format(new Date(task.completedAt), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  {task.links?.length > 0 && (
                    <div className="neu-pressed rounded-xl p-5">
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-3">Reference Links</p>
                      <div className="flex flex-col gap-2">
                        {task.links.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-[#0969DA] hover:underline truncate w-fit relative z-20">
                            <LinkIcon size={14} /> {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CommentsPanel taskId={task._id} projectId={projectId} currentUserId={currentUserId} currentUsername={currentUsername} />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, currentUserId, isCreator, isAdmin, isDeveloper, onEdit, onDelete, onComplete, onDragStart, onDragEnd, onClick }) => {
  const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
  const isDone     = task.status === "Done";
  
  // Update: Developers can edit and delete within 2hrs of task creation
  const canEdit     = isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(task));
  const canDelete   = isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(task));
  
  const canComplete = (isAssigned || isAdmin) && !isDone;
  const canDrag     = isAdmin || isCreator || isDeveloper;

  return (
    <div
      draggable={canDrag}
      onDragStart={e => canDrag && onDragStart(e, task)}
      onDragEnd={canDrag ? onDragEnd : undefined}
      onClick={() => onClick(task)}
      className={`relative rounded-xl p-4 mb-3 transition-all duration-200 group flex flex-col gap-3 ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} ${isDone ? "neu-pressed bg-[#1A7F37]/5 border border-[#1A7F37]/20" : "neu-flat-sm hover:-translate-y-[2px]"}`}
    >
      <div className="flex gap-2 flex-wrap items-center">
        <PriorityBadge priority={task.priority} />
        {!isDone && <DeadlineChip deadline={task.deadline} />}
        {isDone && <span className="neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-[#1A7F37] flex items-center gap-1"><CheckCircle2 size={10}/> Done</span>}
      </div>

      <h4 className={`text-sm font-bold leading-snug ${isDone ? "text-[#1F2328]/60 line-through decoration-[#1A7F37]" : "text-[#1F2328]"}`}>
        {task.title}
      </h4>

      {task.description && (
        <p className="text-[10px] font-medium text-[#656D76] line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-1 pt-3 border-t border-[#D1DCEB]/50">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ backgroundColor: isDone ? C.success : stringToColor(task.assignedTo?.username) }}>
            {task.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className={`text-[10px] font-bold ${isDone ? "text-[#1A7F37]" : "text-[#656D76]"}`}>{task.assignedTo?.username || "Unassigned"}</span>
        </div>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {canComplete && <button onClick={() => onComplete(task)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#1A7F37] hover:text-[#115524]" title="Mark Complete"><CheckCircle2 size={12} className="pointer-events-none" /></button>}
          {canEdit && <button onClick={() => onEdit(task)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#0969DA] hover:text-[#0854b3]" title="Edit Task"><Edit size={12} className="pointer-events-none" /></button>}
          {canDelete && <button onClick={() => onDelete(task._id)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#D1242F] hover:text-[#A40E26]" title="Delete Task"><Trash2 size={12} className="pointer-events-none" /></button>}
        </div>
      </div>
    </div>
  );
};

// ── Kanban Column ─────────────────────────────────────────────────────────────
const KanbanColumn = ({ column, tasks, currentUserId, isCreator, isAdmin, isDeveloper, canAddTask, onAddTask, onEdit, onDelete, onComplete, onDragStart, onDragEnd, onDrop, onDragOver, onCardClick }) => {
  const [isOver, setIsOver] = useState(false);
  
  return (
    <div
      onDragOver={e => { e.preventDefault(); setIsOver(true); onDragOver(e); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={e => { setIsOver(false); onDrop(e, column.id); }}
      className={`flex-shrink-0 w-[300px] sm:w-[340px] h-full max-h-full flex flex-col rounded-2xl transition-all duration-200 ${isOver ? "neu-pressed border-2 border-[#0969DA]" : "neu-pressed border-2 border-transparent"}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-[#D1DCEB]/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: column.color }}>{column.label}</h3>
          <span className="neu-pressed-sm px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ color: column.color }}>{tasks.length}</span>
        </div>
        {canAddTask && column.id === "Todo" && (
          <button onClick={onAddTask} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#0969DA]">
            <Plus size={14} className="pointer-events-none" />
          </button>
        )}
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3">
        {tasks.length === 0 && <div className="text-center py-6 text-xs font-bold text-[#656D76] italic">Drop tasks here</div>}
        {tasks.map(task => (
          <TaskCard key={task._id} task={task} currentUserId={currentUserId} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
};

// ── Scheduled Tasks Helper ────────────────────────────────────────────────────
const isScheduledTaskEditable = (task) => {
  if (!task || !task.scheduledDates || task.scheduledDates.length === 0) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return task.scheduledDates.some(d => new Date(d) >= tomorrow);
};

// ── Custom Neumorphic Multi-Date Calendar ──────────────────────────────────────
const ScheduleCalendar = ({ selectedDates, onChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const toggleDate = (date) => {
    const isSelected = selectedDates.some((d) => isSameDay(new Date(d), date));
    if (isSelected) {
      onChange(selectedDates.filter((d) => !isSameDay(new Date(d), date)));
    } else {
      onChange([...selectedDates, date]);
    }
  };

  const isSelected = (date) => selectedDates.some((d) => isSameDay(new Date(d), date));
  const isPast = (date) => isBefore(date, startOfMonth(new Date())) || (isBefore(date, new Date()) && !isToday(date));

  return (
    <div className="neu-pressed rounded-xl p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={handlePrevMonth} className="neu-flat-sm neu-action-btn p-1.5 rounded-lg text-[#656D76]">
          <ChevronLeft size={14} className="pointer-events-none" />
        </button>
        <span className="text-xs font-bold text-[#1F2328]">{format(currentMonth, "MMMM yyyy")}</span>
        <button type="button" onClick={handleNextMonth} className="neu-flat-sm neu-action-btn p-1.5 rounded-lg text-[#656D76]">
          <ChevronRight size={14} className="pointer-events-none" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square opacity-0 pointer-events-none" />
        ))}
        {days.map((day) => {
          const active = isSelected(day);
          const disabled = isPast(day);
          return (
            <button
              type="button"
              key={day.toISOString()}
              disabled={disabled}
              onClick={() => toggleDate(day)}
              className={`aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                active 
                  ? "neu-btn-primary text-white" 
                  : disabled 
                    ? "text-[#656D76]/30 cursor-not-allowed neu-pressed-sm" 
                    : "neu-flat-sm text-[#1F2328] hover:text-[#0969DA]"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── ScheduledTaskCard ──────────────────────────────────────────────────────────
const ScheduledTaskCard = ({ task, onEdit, onDelete }) => {
  const isEditable = isScheduledTaskEditable(task);

  const deadlineLabel = task.deadlineOffset === 0 
    ? "Same day" 
    : task.deadlineOffset === 1 
      ? "Next day" 
      : `+${task.deadlineOffset} days`;

  return (
    <div className="neu-flat rounded-xl p-5 mb-4 group transition-transform hover:-translate-y-0.5 flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-[#1F2328] mb-3 leading-snug group-hover:text-[#0969DA] transition-colors">{task.title}</h4>
        
        {task.description && (
          <p className="text-[10px] font-medium text-[#656D76] mb-4 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="space-y-3 mb-4">
          <div>
            <span className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider block mb-1.5">Scheduled Dates</span>
            <div className="flex flex-wrap gap-1.5">
              {task.scheduledDates.map((d, index) => (
                <span key={index} className="neu-pressed-sm px-2.5 py-1 rounded text-[8px] font-bold text-[#0969DA] bg-[#E8F1FC]/50 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={10} className="shrink-0" /> {format(new Date(d), "MMM d, yyyy")}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider">Deadline</span>
            <span className="neu-pressed-sm px-2.5 py-1 rounded text-[8px] font-bold text-[#1A7F37] bg-[#1A7F37]/5 uppercase tracking-wider">
              {deadlineLabel}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#D1DCEB]/50">
        {isEditable ? (
          <>
            <button onClick={() => onEdit(task)} className="neu-flat-sm neu-action-btn px-3 py-1.5 rounded-md text-[10px] font-bold text-[#0969DA] flex items-center gap-1.5">
              <Edit3 size={12} className="pointer-events-none"/> Edit
            </button>
            <button onClick={() => onDelete(task._id)} className="neu-flat-sm neu-action-btn px-3 py-1.5 rounded-md text-[10px] font-bold text-[#D1242F] flex items-center gap-1.5">
              <Trash2 size={12} className="pointer-events-none"/> Delete
            </button>
          </>
        ) : (
          <span className="text-[9px] font-bold text-[#656D76] italic opacity-60">Locked (Today/Live task)</span>
        )}
      </div>
    </div>
  );
};

// ── EditScheduledTaskModal ────────────────────────────────────────────────────
const EditScheduledTaskModal = ({ task, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority || "Medium",
  });
  const [scheduledDates, setScheduledDates] = useState(task.scheduledDates.map(d => new Date(d)));
  const [deadlineOffset, setDeadlineOffset] = useState(task.deadlineOffset || 0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}`, "x-timezone-offset": new Date().getTimezoneOffset().toString() });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setErrors({ title: "Required" }); return; }
    if (scheduledDates.length === 0) { setErrors({ calendar: "At least one date is required" }); return; }
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/api/scheduled-tasks/${task._id}`, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        scheduledDates,
        deadlineOffset
      }, { headers: authHeaders() });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Edit scheduled task error:", err);
      setErrors({ api: err.response?.data?.message || "Failed to update scheduled task" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} onClick={e => e.stopPropagation()} className="neu-flat rounded-2xl w-full max-w-lg flex flex-col relative z-10 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-[#1F2328]">Edit Scheduled Task</h2>
          <button onClick={onClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]"><X size={18} className="pointer-events-none" /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {errors.api && <div className="p-3 neu-pressed rounded-xl text-xs font-bold text-[#D1242F]">{errors.api}</div>}
          
          <div className="relative">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Task Title <span className="text-[#D1242F]">*</span></label>
            <input value={form.title} onChange={e => set("title", e.target.value)} disabled={saving} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text" />
            {errors.title && <span className="text-[9px] font-bold text-[#D1242F] mt-1 block">{errors.title}</span>}
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} disabled={saving} placeholder="Context or criteria..." rows={3} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none resize-none custom-scrollbar cursor-text" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Priority</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} disabled={saving} className="w-full neu-pressed rounded-md p-3 pr-8 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 bottom-3.5 text-[#656D76] pointer-events-none" />
            </div>
            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Relative Deadline</label>
              <div className="relative">
                <select value={deadlineOffset} onChange={e => setDeadlineOffset(parseInt(e.target.value))} disabled={saving} className="w-full neu-pressed rounded-md p-3 pr-8 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                  <option value={0}>Same day</option>
                  <option value={1}>Next day</option>
                  <option value={2}>After 2 days</option>
                  <option value={3}>After 3 days</option>
                  <option value={5}>After 5 days</option>
                  <option value={7}>After 7 days</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 bottom-3.5 text-[#656D76] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Scheduled Dates <span className="text-[#D1242F]">*</span></label>
            <ScheduleCalendar selectedDates={scheduledDates} onChange={setScheduledDates} />
            {errors.calendar && <span className="text-[9px] font-bold text-[#D1242F] mt-1 block">{errors.calendar}</span>}
          </div>
        </div>

        <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={saving} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="neu-btn-soft-blue px-8 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 neu-action-btn">
            {saving ? <Spinner /> : <CheckCircle2 size={16} className="pointer-events-none" />} {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── DevStatsDialog ────────────────────────────────────────────────────────────
const DevStatsDialog = ({ open, onClose, developer, tasks }) => {
  if (!developer) return null;

  const devTasks = tasks.filter(t => t.assignedTo?.id === developer.id);
  const total = devTasks.length;
  const todo = devTasks.filter(t => t.status === "Todo").length;
  const wip = devTasks.filter(t => t.status === "In Progress").length;
  const done = devTasks.filter(t => t.status === "Done").length;

  const priorityBreakdown = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  devTasks.forEach(t => {
    if (priorityBreakdown[t.priority] !== undefined) {
      priorityBreakdown[t.priority]++;
    }
  });

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const initials = (developer.username || "").slice(0, 2).toUpperCase();
  const avatarBg = getAvatarBg(developer.username || "");

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-0 cursor-pointer" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="neu-flat rounded-2xl w-full max-w-lg flex flex-col relative z-10 max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md" style={{ backgroundColor: avatarBg }}>
                  {initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1F2328]">{developer.username}</h3>
                  <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Developer Statistics</p>
                </div>
              </div>
              <button onClick={onClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]"><X size={18} className="pointer-events-none" /></button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Progress Summary */}
              <div className="neu-pressed rounded-xl p-5 flex items-center gap-6">
                {/* Circular Progress Ring */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="#D1DCEB" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="40" cy="40" r="34" stroke="#0969DA" strokeWidth="6" fill="transparent"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - completionRate / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-[#1F2328]">{completionRate}%</span>
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#1F2328] mb-1">Completion Rate</h4>
                  <p className="text-xs font-medium text-[#656D76]">
                    Developer completed {done} of {total} assigned tasks in this project.
                  </p>
                </div>
              </div>

              {/* Numeric Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "To Do", val: todo, color: "#BF8700" },
                  { label: "In Progress", val: wip, color: "#0969DA" },
                  { label: "Done", val: done, color: "#1A7F37" },
                ].map(s => (
                  <div key={s.label} className="neu-flat-sm rounded-xl p-4 text-center">
                    <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">{s.label}</p>
                    <span className="text-xl font-bold" style={{ color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Priority Breakdown (Bar Charts) */}
              <div>
                <h4 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider mb-3">Tasks by Priority</h4>
                <div className="space-y-3.5 neu-pressed rounded-xl p-5">
                  {Object.entries(priorityBreakdown).map(([prio, count]) => {
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={prio} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-[#1F2328] flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prio === "Critical" ? "#D1242F" : prio === "High" ? "#BF8700" : prio === "Medium" ? "#0969DA" : "#656D76" }} /> {prio}
                          </span>
                          <span className="text-[#656D76]">{count} tasks ({Math.round(pct)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-[#D1DCEB] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: prio === "Critical" ? "#D1242F" : prio === "High" ? "#BF8700" : prio === "Medium" ? "#0969DA" : "#656D76" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Tasks List */}
              <div>
                <h4 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider mb-3">Active Tasks</h4>
                {devTasks.filter(t => t.status !== "Done").length === 0 ? (
                  <p className="text-xs font-bold text-[#656D76] italic p-4 neu-pressed rounded-xl text-center">No active tasks assigned.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                    {devTasks.filter(t => t.status !== "Done").map(t => (
                      <div key={t._id} className="neu-flat-sm rounded-xl p-3 flex justify-between items-center gap-4 text-xs font-bold">
                        <span className="text-[#1F2328] truncate">{t.title}</span>
                        <span className="neu-pressed-sm px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0" style={{ color: t.status === "Todo" ? "#BF8700" : t.status === "In Progress" ? "#0969DA" : "#1A7F37" }}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end shrink-0">
              <button onClick={onClose} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">Close</button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Task Form Dialog ──────────────────────────────────────────────────────────
const TaskFormDialog = ({ open, onClose, onSubmit, initialData, projectDevelopers, isCreator, isAdmin, isDeveloper, currentUserId, currentUsername, isSubmitting }) => {

  const blankForm = useCallback(() => ({
    title: "", description: "", links: [], priority: "Medium", deadline: "", assignedTo: { id: currentUserId, username: currentUsername },
  }), [currentUserId, currentUsername]);

  const [form, setForm] = useState(blankForm);
  const [linkInput, setLinkInput] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDates, setScheduledDates] = useState([]);
  const [deadlineOffset, setDeadlineOffset] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "", description: initialData.description || "", links: initialData.links || [],
        priority: initialData.priority || "Medium", deadline: initialData.deadline ? format(new Date(initialData.deadline), "yyyy-MM-dd") : "",
        assignedTo: initialData.assignedTo || { id: currentUserId, username: currentUsername },
      });
      setIsScheduled(false);
    } else {
      setForm(blankForm());
      setIsScheduled(false);
      setScheduledDates([]);
      setDeadlineOffset(0);
    }
    setLinkInput(""); setErrors({});
  }, [open, initialData, currentUserId, currentUsername, blankForm]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: "" })); };

  const addLink = () => { if (linkInput.trim()) { set("links", [...form.links, linkInput.trim()]); setLinkInput(""); } };
  const removeLink = i => set("links", form.links.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.deadline) e.deadline = "Deadline is required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isScheduled) {
      if (!form.title.trim()) { setErrors({ title: "Title is required" }); return; }
      if (scheduledDates.length === 0) { setErrors({ calendar: "At least one date is required" }); return; }
      onSubmit({
        title: form.title,
        description: form.description,
        priority: form.priority,
        scheduledDates,
        deadlineOffset,
        assignedTo: form.assignedTo
      }, true);
    } else {
      const errs = validate();
      if (Object.keys(errs).length) { setErrors(errs); return; }
      onSubmit({ ...form, deadline: form.deadline || null }, false);
    }
  };

  const canAssignToOthers = isAdmin || isCreator;
  const visibleDevelopers = canAssignToOthers ? projectDevelopers : projectDevelopers.filter(d => d.id === currentUserId);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
            className={`neu-flat rounded-2xl w-full flex flex-col relative z-10 max-h-[90vh] overflow-hidden transition-all duration-300 ${isScheduled ? "max-w-lg" : "max-w-xl"}`}
          >
            <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-[#1F2328]">{initialData ? "Edit Task" : (isScheduled ? "Schedule New Task" : "Create New Task")}</h2>
              <button type="button" onClick={onClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]">
                <X size={18} className="pointer-events-none" />
              </button>
            </div>

            <form id="taskForm" onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              {!initialData && (
                <div className="flex gap-4 items-center justify-between p-3 neu-pressed rounded-xl relative z-20">
                  <span className="text-xs font-bold text-[#1F2328]">Task Scheduling</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsScheduled(false)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all neu-action-btn ${!isScheduled ? "neu-flat text-[#0969DA]" : "text-[#656D76] bg-transparent shadow-none"}`}
                    >
                      Regular
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScheduled(true)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all neu-action-btn ${isScheduled ? "neu-flat text-[#0969DA]" : "text-[#656D76] bg-transparent shadow-none"}`}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              )}

              <div className="relative z-20">
                <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Task Title <span className="text-[#D1242F]">*</span></label>
                <input autoFocus type="text" value={form.title} onChange={e => set("title", e.target.value)} placeholder="What needs to be done?" className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                {errors.title && <span className="text-[9px] font-bold text-[#D1242F] mt-1.5 block">{errors.title}</span>}
              </div>

              <div className="relative z-20">
                <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Description</label>
                <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Details, context, criteria..." className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text resize-none custom-scrollbar relative z-20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-20">
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Priority</label>
                  <div className="relative">
                    <select value={form.priority} onChange={e => set("priority", e.target.value)} className="w-full neu-pressed rounded-md p-3 pr-8 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20">
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
                  </div>
                </div>
                
                {isScheduled ? (
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Relative Deadline</label>
                    <div className="relative">
                      <select value={deadlineOffset} onChange={e => setDeadlineOffset(parseInt(e.target.value))} className="w-full neu-pressed rounded-md p-3 pr-8 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20">
                        <option value={0}>Same day</option>
                        <option value={1}>Next day</option>
                        <option value={2}>After 2 days</option>
                        <option value={3}>After 3 days</option>
                        <option value={5}>After 5 days</option>
                        <option value={7}>After 7 days</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
                    </div>
                  </div>
                ) : (
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Deadline <span className="text-[#D1242F]">*</span></label>
                    <input type="date" min={todayStr()} value={form.deadline} onChange={e => set("deadline", e.target.value)} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20" />
                    {errors.deadline && <span className="text-[9px] font-bold text-[#D1242F] mt-1.5 block">{errors.deadline}</span>}
                  </div>
                )}
              </div>

              <div className="relative z-20">
                <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Assign To {!canAssignToOthers && "(You Only)"}</label>
                <div className="relative">
                  <select disabled={!canAssignToOthers} value={form.assignedTo?.id || ""} onChange={e => { const dev = projectDevelopers.find(d => d.id === e.target.value); if (dev) set("assignedTo", dev); }} className="w-full neu-pressed rounded-md p-3 pr-8 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent disabled:opacity-60 relative z-20">
                    {visibleDevelopers.map(dev => <option key={dev.id} value={dev.id}>{dev.username} {dev.id === currentUserId ? "(You)" : ""}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
                </div>
              </div>

              {!isScheduled && (
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Reference Links</label>
                  <div className="flex gap-2 mb-3 relative z-30">
                    <input type="text" value={linkInput} onChange={e => setLinkInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }} placeholder="https://..." className="flex-1 neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-40" />
                    <button type="button" onClick={addLink} className="neu-flat neu-action-btn px-4 rounded-md text-xs font-bold text-[#0969DA] relative z-40">Add Link</button>
                  </div>
                  <div className="space-y-2">
                    {form.links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 neu-pressed-sm rounded-md p-2 pl-3">
                        <LinkIcon size={12} className="text-[#0969DA] shrink-0" />
                        <span className="text-xs font-bold text-[#0969DA] truncate flex-1">{link}</span>
                        <button type="button" onClick={() => removeLink(i)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#D1242F]"><X size={12} className="pointer-events-none"/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isScheduled && (
                <div className="space-y-4 pt-2 relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Scheduled Dates <span className="text-[#D1242F]">*</span></label>
                  <ScheduleCalendar selectedDates={scheduledDates} onChange={setScheduledDates} />
                  {errors.calendar && <span className="text-[9px] font-bold text-[#D1242F] mt-1 block">{errors.calendar}</span>}
                </div>
              )}
            </form>

            <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end gap-4 shrink-0 relative z-20">
              <button type="button" onClick={onClose} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">Cancel</button>
              <button type="submit" form="taskForm" disabled={isSubmitting} className="neu-btn-primary px-8 py-2.5 rounded-lg text-sm font-bold text-white neu-action-btn flex items-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 size={16} className="animate-spin pointer-events-none" /> : <CheckCircle2 size={16} className="pointer-events-none" />}
                {initialData ? "Save Changes" : (isScheduled ? "Schedule Task" : "Create Task")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Chart Tab ─────────────────────────────────────────────────────────────────
const ChartTab = ({ tasks, projectDevelopers }) => {
  const byStatus   = COLUMNS.map(c => ({ label:c.label, count:tasks.filter(t=>t.status===c.id).length, color:c.color }));
  const byPriority = ["Critical","High","Medium","Low"].map(p => ({ label:p, count:tasks.filter(t=>t.priority===p).length, ...PRIORITY_CONFIG[p] }));
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
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6">
      
      {/* Progress Ring */}
      <div className="neu-flat rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative w-24 h-24 shrink-0 neu-pressed rounded-full p-2">
          <svg width="100%" height="100%" viewBox="0 0 80 80" className="transform -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#D1DCEB" strokeWidth="8" opacity="0.5" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="#1A7F37" strokeWidth="8" strokeDasharray={`${2*Math.PI*34*progress/100} ${2*Math.PI*34*(1-progress/100)}`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-[#1A7F37]">{progress}%</span>
          </div>
        </div>
        <div className="text-center sm:text-left pt-2">
          <h3 className="text-xl font-bold text-[#1F2328]">Overall Project Progress</h3>
          <p className="text-sm font-bold text-[#656D76] mt-1">{doneTasks} of {totalTasks} tasks fully completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Bars */}
        <div className="neu-flat rounded-2xl p-6">
          <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-5">Tasks by Status</h3>
          <div className="space-y-4">
            {byStatus.map(s => (
              <div key={s.label}>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-[#1F2328]">{s.label}</span>
                  <span className="text-xs font-bold text-[#656D76]">{s.count}</span>
                </div>
                <div className="h-2.5 rounded-full neu-pressed-sm overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(s.count/maxStatus)*100}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Bars */}
        <div className="neu-flat rounded-2xl p-6">
          <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-5">Tasks by Priority</h3>
          <div className="space-y-4">
            {byPriority.map(p => (
              <div key={p.label}>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-[#1F2328] flex items-center gap-1"><span style={{color: p.color}}>{p.icon}</span> {p.label}</span>
                  <span className="text-xs font-bold text-[#656D76]">{p.count}</span>
                </div>
                <div className="h-2.5 rounded-full neu-pressed-sm overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(p.count/maxPriority)*100}%`, backgroundColor: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workload */}
      {byDev.length > 0 && (
        <div className="neu-flat rounded-2xl p-6">
          <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-5">Developer Workload</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {byDev.map(d => (
              <div key={d.username} className="neu-pressed rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4 border-b border-[#D1DCEB]/50 pb-3">
                  <div className="w-6 h-6 rounded-full neu-btn-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: stringToColor(d.username) }}>
                    {d.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-[#1F2328] truncate">{d.username}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="neu-flat-sm rounded-lg py-2"><p className="text-lg font-bold text-[#656D76]">{d.todo}</p><p className="text-[9px] font-bold text-[#656D76] uppercase">Todo</p></div>
                  <div className="neu-flat-sm rounded-lg py-2"><p className="text-lg font-bold text-[#0969DA]">{d.wip}</p><p className="text-[9px] font-bold text-[#656D76] uppercase">WIP</p></div>
                  <div className="neu-flat-sm rounded-lg py-2"><p className="text-lg font-bold text-[#1A7F37]">{d.done}</p><p className="text-[9px] font-bold text-[#656D76] uppercase">Done</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
    <div className="h-full overflow-y-auto custom-scrollbar p-6 flex flex-col xl:flex-row gap-6">
      
      {/* Calendar Grid */}
      <div className="flex-1 neu-flat rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()-1, 1))} className="neu-flat-sm neu-action-btn p-2 rounded-lg text-[#656D76]"><ChevronLeft size={16} className="pointer-events-none"/></button>
          <h2 className="text-lg font-bold text-[#1F2328]">{format(current, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()+1, 1))} className="neu-flat-sm neu-action-btn p-2 rounded-lg text-[#656D76]"><ChevronRight size={16} className="pointer-events-none"/></button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-[#656D76] uppercase tracking-wider py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length:startPad }).map((_,i) => <div key={`pad-${i}`} className="neu-pressed-sm rounded-lg opacity-30 min-h-[80px]" />)}
          {days.map(day => {
            const dayTasks = tasksOnDay(day);
            const isCurrentDay = isToday(day);
            return (
              <div key={day.toISOString()} className={`min-h-[80px] rounded-lg p-1.5 flex flex-col gap-1 transition-colors ${isCurrentDay ? "neu-pressed border border-[#0969DA]/30" : "neu-pressed-sm"}`}>
                <span className={`text-xs font-bold text-center mb-1 ${isCurrentDay ? "text-[#0969DA]" : "text-[#656D76]"}`}>{format(day,"d")}</span>
                {dayTasks.slice(0,2).map(t => (
                  <button type="button" key={t._id} onClick={() => onCardClick(t)} className="text-left w-full truncate px-1.5 py-1 rounded-[4px] text-[9px] font-bold neu-action-btn" style={{ backgroundColor: PRIORITY_CONFIG[t.priority]?.color + '15', color: PRIORITY_CONFIG[t.priority]?.color }}>
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 2 && <span className="text-center text-[9px] font-bold text-[#656D76] italic">+{dayTasks.length-2} more</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming List */}
      <div className="w-full xl:w-80 shrink-0 neu-pressed rounded-2xl p-5 h-fit">
        <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-4 border-b border-[#D1DCEB]/50 pb-2">Upcoming Deadlines</h3>
        {tasksWithDeadline.length === 0 ? (
          <p className="text-center py-6 text-xs font-bold text-[#656D76] italic">No active deadlines.</p>
        ) : (
          <div className="space-y-3">
            {tasksWithDeadline.sort((a,b) => new Date(a.deadline)-new Date(b.deadline)).slice(0,8).map(t => (
              <div key={t._id} onClick={() => onCardClick(t)} className="neu-flat-sm neu-action-btn rounded-xl p-3 flex flex-col gap-2">
                <span className="text-xs font-bold text-[#1F2328] truncate leading-tight">{t.title}</span>
                <div className="flex justify-between items-center">
                  <PriorityBadge priority={t.priority} />
                  <DeadlineChip deadline={t.deadline} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── List Tab ──────────────────────────────────────────────────────────────────
const ListTab = ({ tasks, currentUserId, isAdmin, isCreator, isDeveloper, onEdit, onDelete, onComplete, onCardClick }) => {
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:px-6 border-b border-[#D1DCEB]/50 shrink-0 flex flex-wrap items-center justify-between gap-4 relative z-20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mr-2">Sort by:</span>
          {["priority", "deadline", "status", "assignee"].map(s => (
            <button key={s} onClick={() => setSortBy(s)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors neu-action-btn ${sortBy === s ? "neu-pressed text-[#0969DA]" : "neu-flat-sm text-[#656D76]"}`}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">{tasks.length} Total Tasks</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 relative z-10">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-sm font-bold text-[#656D76] italic">No tasks found.</div>
        ) : sorted.map(task => {
          const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
          const isDone     = task.status === "Done";
          
          // Update: Developers can edit and delete within 2hrs of task creation
          const canEdit    = isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(task));
          const canDel     = isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(task));
          
          const canComp    = (isAssigned || isAdmin) && !isDone;

          return (
            <div key={task._id} onClick={() => onCardClick(task)} className={`rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-transform duration-200 cursor-pointer group ${isDone ? "neu-pressed bg-[#1A7F37]/5 border border-[#1A7F37]/20" : "neu-flat-sm hover:-translate-y-[2px]"}`}>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLUMNS.find(c => c.id === task.status)?.color }} />
                  <span className={`text-sm font-bold truncate ${isDone ? "text-[#1F2328]/60 line-through decoration-[#1A7F37]" : "text-[#1F2328]"}`}>{task.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap ml-4">
                  <PriorityBadge priority={task.priority} />
                  {!isDone && <DeadlineChip deadline={task.deadline} />}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pl-4 sm:pl-0 border-t sm:border-none border-[#D1DCEB]/50 pt-3 sm:pt-0">
                <div className="flex items-center gap-2" title={task.assignedTo?.username}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: isDone ? C.success : stringToColor(task.assignedTo?.username) }}>
                    {task.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className={`text-xs font-bold ${isDone ? "text-[#1A7F37]" : "text-[#656D76]"} hidden md:inline-block max-w-[100px] truncate`}>{task.assignedTo?.username || "Unassigned"}</span>
                </div>

                <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  {canComp && <button onClick={() => onComplete(task)} className="neu-flat-sm neu-action-btn p-2 rounded-md text-[#1A7F37] hover:text-[#115524]"><CheckCircle2 size={14} className="pointer-events-none" /></button>}
                  {canEdit && <button onClick={() => onEdit(task)} className="neu-flat-sm neu-action-btn p-2 rounded-md text-[#0969DA] hover:text-[#0854b3]"><Edit size={14} className="pointer-events-none" /></button>}
                  {canDel && <button onClick={() => onDelete(task._id)} className="neu-flat-sm neu-action-btn p-2 rounded-md text-[#D1242F] hover:text-[#A40E26]"><Trash2 size={14} className="pointer-events-none" /></button>}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
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
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
            className="neu-flat rounded-2xl w-full max-w-lg flex flex-col relative z-10 max-h-[85vh] overflow-hidden"
          >
            <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="neu-pressed-sm p-2 rounded-lg text-[#656D76]"><History size={18}/></div>
                <h2 className="text-xl font-bold text-[#1F2328]">Completion History</h2>
              </div>
              <button type="button" onClick={onClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]">
                <X size={18} className="pointer-events-none" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#0969DA]"/></div>
              ) : completions.length === 0 ? (
                <div className="text-center py-12 text-sm font-bold text-[#656D76] italic">No completed tasks yet.</div>
              ) : (
                completions.map((c) => (
                  <div key={c._id} className="neu-pressed rounded-xl p-4 flex gap-4 items-start">
                    <CheckCircle2 size={20} className="text-[#1A7F37] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#1F2328] mb-2 truncate">{c.taskTitle}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider neu-pressed-sm px-2 py-1 rounded-md">By {c.completedBy?.username}</span>
                        <span className="text-[10px] font-bold text-[#656D76]">{format(new Date(c.completedAt),"MMM d, yyyy · h:mm a")}</span>
                      </div>
                      {c.priority && <PriorityBadge priority={c.priority} />}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end shrink-0">
              <button type="button" onClick={onClose} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── MAIN KANBAN (Exported Component) ──────────────────────────────────────────
export default function ProjectKanban({ open, onClose, project }) {
  const [tasks, setTasks] = useState([]);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingScheduledTask, setEditingScheduledTask] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [activeTab, setActiveTab] = useState("kanban");
  const [filterUser, setFilterUser] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false); 
  const [snack, setSnack] = useState({ open:false, msg:"", severity:"success" });
  const [selectedDevStats, setSelectedDevStats] = useState(null);
  
  const dragTask = useRef(null);

  const currentUserId   = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "You";
  const currentUserRole = localStorage.getItem("role") || "developer";
  
  const isAdmin     = currentUserRole === "admin";
  const isDeveloper = currentUserRole === "developer";
  const isCreator   = isAdmin || project?.createdBy === currentUsername;

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

  const fetchScheduledTasks = useCallback(async () => {
    if (!project?._id) return;
    try {
      const r = await axios.get(`${API_BASE}/api/scheduled-tasks?projectId=${project._id}`, { headers:authHeaders() });
      setScheduledTasks(r.data || []);
    } catch {
      setScheduledTasks([]);
    }
  }, [project?._id]);

  const handleDeleteScheduledTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this scheduled task?")) return;
    try {
      await axios.delete(`${API_BASE}/api/scheduled-tasks/${taskId}`, { headers: authHeaders() });
      toast("Scheduled task deleted");
      fetchScheduledTasks();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete scheduled task", "error");
    }
  };

  useEffect(() => { 
    if (open) {
      fetchTasks(true); 
      fetchScheduledTasks();
    } else {
      setTasks([]); 
      setScheduledTasks([]);
    }
  }, [open, fetchTasks, fetchScheduledTasks]);

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (filterUser     !== "all" && t.assignedTo?.id !== filterUser) return false;
    if (filterStatus   !== "all" && t.status         !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority        !== filterPriority) return false;
    return true;
  }), [tasks, filterUser, filterStatus, filterPriority]);

  const tasksByStatus = status => filteredTasks.filter(t => t.status === status);
  const hasFilters    = filterUser !== "all" || filterStatus !== "all" || filterPriority !== "all";

  // CRUD Handlers
  const handleTaskSubmit = async (formData, isSch) => {
    setIsSubmittingTask(true);
    try {
      if (isSch) {
        await axios.post(`${API_BASE}/api/scheduled-tasks`, {
          projectId: project._id,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          scheduledDates: formData.scheduledDates,
          deadlineOffset: formData.deadlineOffset,
          assignedTo: formData.assignedTo
        }, { headers:authHeaders() });
        toast("Scheduled task created successfully");
        fetchScheduledTasks();
      } else if (editingTask) {
        await axios.put(`${API_BASE}/api/tasks/${project._id}/${editingTask._id}`, formData, { headers:authHeaders() });
        toast("Task updated successfully");
        fetchTasks(false);
      } else {
        await axios.post(`${API_BASE}/api/tasks/${project._id}`, formData, { headers:authHeaders() });
        toast("Task created successfully");
        fetchTasks(false);
      }
      setTaskFormOpen(false); 
      setEditingTask(null); 
      if (detailTask && editingTask) {
         setDetailTask({...detailTask, ...formData});
      }
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
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: "Done" } : t));
    try {
      await axios.post(`${API_BASE}/api/tasks/${project._id}/${task._id}/complete`, {}, { headers:authHeaders() });
      toast("Task completed! 🎉"); 
      fetchTasks(false); 
    } catch (err) { 
      toast(err.response?.data?.message || "Failed to complete task","error"); 
      fetchTasks(false); 
    }
  };

  const handleDragStart = (e, task) => { dragTask.current = task; e.dataTransfer.effectAllowed = "move"; };
  const handleDragEnd   = () => { dragTask.current = null; };
  const handleDragOver  = e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const task = dragTask.current;
    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status:newStatus } : t));
    try {
      if (newStatus === "Done") {
        await axios.post(`${API_BASE}/api/tasks/${project._id}/${task._id}/complete`, {}, { headers:authHeaders() });
        toast("Task completed! 🎉");
      } else {
        await axios.put(`${API_BASE}/api/tasks/${project._id}/${task._id}`, { status:newStatus }, { headers:authHeaders() });
      }
      fetchTasks(false);
    } catch {
      fetchTasks(false);
      toast("Failed to move task","error");
    }
  };

  if (!project) return null;

  const TABS = [
    { id:"kanban",   label:"Board",    Icon:KanbanSquare },
    { id:"list",     label:"List",     Icon:List         },
    { id:"calendar", label:"Calendar", Icon:Calendar     },
    { id:"chart",    label:"Charts",   Icon:BarChart     },
    { id:"scheduled",label:"Scheduled",Icon:History      },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99990] flex items-center justify-center p-0 sm:p-6 md:p-8 montserrat-regular text-[#1F2328]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#F0F4F8]/90 backdrop-blur-md z-0 cursor-pointer" />
          
          <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} onClick={(e) => e.stopPropagation()} 
            className="neu-flat sm:rounded-2xl w-full h-full sm:h-[95vh] flex flex-col relative z-10 overflow-hidden shadow-2xl border border-[#D1DCEB]/50"
          >
            {/* Header */}
            <div className="p-4 sm:px-6 border-b border-[#D1DCEB]/50 flex items-center justify-between shrink-0 bg-[#F0F4F8] z-20 relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl neu-btn-primary flex items-center justify-center text-white shrink-0 shadow-lg">
                  <FolderDot size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1F2328]">{project.projectName}</h2>
                  <p className="text-[10px] sm:text-xs font-bold text-[#0969DA] uppercase tracking-wider mt-0.5">Project Workspace</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button onClick={() => setHistoryOpen(true)} title="Completion History" className="neu-flat-sm neu-action-btn p-2 sm:p-3 rounded-xl text-[#656D76] hover:text-[#0969DA]">
                  <History size={18} className="pointer-events-none" />
                </button>
                {canAddTask && (
                  <button onClick={() => { setEditingTask(null); setTaskFormOpen(true); }} className="neu-btn-primary px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-bold text-white neu-action-btn flex items-center gap-2">
                    <Plus size={16} className="pointer-events-none" /> <span className="hidden sm:inline">Add Task</span>
                  </button>
                )}
                <button onClick={onClose} className="neu-flat-sm neu-action-btn p-2 sm:p-3 rounded-xl text-[#656D76] hover:text-[#D1242F] ml-2">
                  <X size={20} className="pointer-events-none" />
                </button>
              </div>
            </div>

            {/* Tab Bar & Filters */}
            <div className="px-4 sm:px-6 py-3 border-b border-[#D1DCEB]/50 flex flex-col xl:flex-row justify-between xl:items-center gap-4 shrink-0 bg-[#F0F4F8] z-20 relative">
              
              <div className="flex flex-wrap items-center gap-4 flex-1">
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 xl:pb-0">
                  {TABS.map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 neu-action-btn ${activeTab === id ? "neu-pressed text-[#0969DA]" : "neu-flat-sm text-[#656D76]"}`}>
                      <Icon size={14} className="pointer-events-none" /> {label}
                    </button>
                  ))}
                </div>

                {/* Developer Avatars */}
                <div className="flex items-center gap-1.5 pl-4 border-l border-[#D1DCEB]/35">
                  {projectDevelopers.map(dev => {
                    const initials = (dev.username || "").slice(0, 2).toUpperCase();
                    const avatarBg = getAvatarBg(dev.username || "");
                    return (
                      <button
                        type="button"
                        key={dev.id}
                        onClick={() => setSelectedDevStats(dev)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md neu-action-btn border-2 border-white hover:scale-110 transition-all shrink-0"
                        style={{ backgroundColor: avatarBg }}
                        title={`${dev.username} - View Stats`}
                      >
                        {initials}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-[#656D76]" />
                  <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider hidden sm:inline">Filters</span>
                </div>
                
                <div className="relative">
                  <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="neu-pressed rounded-md py-2 pl-3 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                    <option value="all">All Members</option>
                    {projectDevelopers.map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
                </div>

                <div className="relative">
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="neu-pressed rounded-md py-2 pl-3 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                    <option value="all">All Status</option>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
                </div>

                <div className="relative">
                  <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="neu-pressed rounded-md py-2 pl-3 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                    <option value="all">All Priorities</option>
                    {["Critical","High","Medium","Low"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
                </div>

                {hasFilters && (
                  <button onClick={() => { setFilterUser("all"); setFilterStatus("all"); setFilterPriority("all"); }} className="neu-pressed-sm neu-action-btn px-3 py-2 rounded-md text-[10px] font-bold text-[#D1242F] uppercase tracking-wider">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Tab Content Area */}
            <div className="flex-1 overflow-hidden relative z-10 bg-[#F0F4F8]">
              {loading ? (
                <div className="flex h-full items-center justify-center"><Loader2 size={32} className="animate-spin text-[#0969DA]" /></div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
                    
                    {activeTab === "kanban" && (
                      <div className="flex gap-6 p-4 sm:p-6 h-full min-h-0 overflow-x-auto overflow-y-hidden custom-scrollbar items-start">
                        {COLUMNS.map(col => (
                          <KanbanColumn key={col.id} column={col} tasks={tasksByStatus(col.id)} currentUserId={currentUserId} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper} canAddTask={canAddTask} onAddTask={() => { setEditingTask(null); setTaskFormOpen(true); }} onEdit={task => { setEditingTask(task); setTaskFormOpen(true); }} onDelete={handleDelete} onComplete={handleComplete} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDrop={handleDrop} onCardClick={setDetailTask} />
                        ))}
                      </div>
                    )}
                    
                    {activeTab === "list" && <ListTab tasks={filteredTasks} currentUserId={currentUserId} isAdmin={isAdmin} isCreator={isCreator} isDeveloper={isDeveloper} onEdit={task => { setEditingTask(task); setTaskFormOpen(true); }} onDelete={handleDelete} onComplete={handleComplete} onCardClick={setDetailTask} />}
                    
                    {activeTab === "calendar" && <CalendarTab tasks={filteredTasks} onCardClick={setDetailTask} />}
                    
                    {activeTab === "chart" && <ChartTab tasks={filteredTasks} projectDevelopers={projectDevelopers} />}
                    
                    {activeTab === "scheduled" && (
                      <div className="h-full overflow-y-auto custom-scrollbar p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-base font-bold text-[#1F2328]">Scheduled Project Tasks</h3>
                          <span className="neu-pressed-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-[#0969DA]">{scheduledTasks.length} scheduled</span>
                        </div>
                        {scheduledTasks.length === 0 ? (
                          <div className="text-center py-20 flex flex-col items-center">
                            <div className="neu-pressed-sm p-6 rounded-full mb-4 text-[#656D76] opacity-50"><History size={32}/></div>
                            <p className="text-lg font-bold text-[#1F2328] mb-1">No Scheduled Tasks</p>
                            <p className="text-xs font-medium text-[#656D76]">Use the Add Task button to schedule future tasks.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scheduledTasks.map(t => (
                              <ScheduledTaskCard
                                key={t._id}
                                task={t}
                                onEdit={(task) => {
                                  setEditingScheduledTask(task);
                                }}
                                onDelete={handleDeleteScheduledTask}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Embedded Modals managed by Kanban */}
      <TaskFormDialog open={taskFormOpen} onClose={() => { setTaskFormOpen(false); setEditingTask(null); }} onSubmit={handleTaskSubmit} initialData={editingTask} projectDevelopers={projectDevelopers} isCreator={isCreator} isAdmin={isAdmin} isDeveloper={isDeveloper} currentUserId={currentUserId} currentUsername={currentUsername} isSubmitting={isSubmittingTask} />
      
      <TaskDetailDialog 
        open={!!detailTask} 
        onClose={() => setDetailTask(null)} 
        task={detailTask} 
        projectId={project?._id} 
        currentUserId={currentUserId} 
        currentUsername={currentUsername} 
        // Update: Detail Dialog receives updated access props
        canEdit={isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(detailTask))} 
        canDelete={isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(detailTask))} 
        onEdit={task => { setDetailTask(null); setEditingTask(task); setTaskFormOpen(true); }} 
        onDelete={handleDelete} 
      />
      
      <CompletionHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} projectId={project?._id} />

      {editingScheduledTask && (
        <EditScheduledTaskModal
          task={editingScheduledTask}
          onClose={() => setEditingScheduledTask(null)}
          onSuccess={() => {
            toast("Scheduled task updated");
            fetchScheduledTasks();
          }}
        />
      )}

      {selectedDevStats && (
        <DevStatsDialog
          open={!!selectedDevStats}
          onClose={() => setSelectedDevStats(null)}
          developer={selectedDevStats}
          tasks={tasks}
        />
      )}

      {/* Snackbar */}
      <AnimatePresence>
        {snack.open && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-6 right-6 z-[999999] flex items-center gap-4 neu-flat rounded-xl p-4 montserrat-medium max-w-sm">
            <div className={`neu-pressed-sm p-2 rounded-full shrink-0 ${snack.severity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
               {snack.severity === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <span className={`text-xs font-bold ${snack.severity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>{snack.msg}</span>
            <button type="button" onClick={() => setSnack(p=>({...p, open:false}))} className="neu-flat-sm neu-action-btn rounded-lg p-1.5 text-[#656D76] ml-auto shrink-0"><X size={14} className="pointer-events-none" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* Force Input Clickability and Text Selection globally */
        input, textarea, select { position: relative; z-index: 20; pointer-events: auto !important; user-select: text !important; -webkit-user-select: text !important; }
        select { cursor: pointer !important; -moz-appearance: none; -webkit-appearance: none; appearance: none; }
        .neu-action-btn { cursor: pointer; transition: all 0.2s ease; position: relative; z-index: 20; user-select: none; -webkit-user-select: none; }
        .neu-action-btn:active:not(:disabled) { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light) !important; }
        .neu-btn-primary { background-color: #0969DA; box-shadow: 3px 3px 8px rgba(9, 105, 218, 0.3); border: none; position: relative; z-index: 20; cursor: pointer; user-select: none; -webkit-user-select: none; }
        .neu-btn-primary:active:not(:disabled) { box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2); }
        button svg { pointer-events: none !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px var(--neu-bg) inset !important; -webkit-text-fill-color: #1F2328 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 4px 0;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </AnimatePresence>
  );

}