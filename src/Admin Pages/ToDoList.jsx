// import React, { useState, useEffect, useRef, useCallback } from "react";
// // 1. FIXED: Using the modern, React 18 compatible library
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   Plus, Trash2, Search, X, Calendar as CalendarIcon, AlertCircle, Clock,
//   CheckCircle2, Link2, FileText, ChevronDown, Flag, LayoutList, Trello,
//   GanttChartSquare, MoreHorizontal, Paperclip, ChevronRight, Circle,
//   ArrowLeft, Tag, User, MessageSquare, ExternalLink, RotateCcw,
//   ArrowUpDown, Edit3, Eye,
// } from "lucide-react";
// import {
//   format, differenceInDays, parseISO, isValid, addDays,
//   eachDayOfInterval, isSameDay, startOfMonth, endOfMonth,
//   eachWeekOfInterval, startOfWeek, endOfWeek, isSameMonth,
//   getMonth, getYear, addMonths, subMonths,
// } from "date-fns";
// import axios from "axios";

// // ─── API setup ────────────────────────────────────────────────────────────────

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// const api = axios.create({ baseURL: `${API_BASE}/api` });
// api.interceptors.request.use(cfg => {
//   const token = localStorage.getItem("token");
//   if (token) cfg.headers.Authorization = `Bearer ${token}`;
//   return cfg;
// });

// // 2. FIXED: StrictModeDroppable to prevent the "Stuck Mouse Pointer" bug
// export const StrictModeDroppable = ({ children, ...props }) => {
//   const [enabled, setEnabled] = useState(false);
//   useEffect(() => {
//     const animation = requestAnimationFrame(() => setEnabled(true));
//     return () => {
//       cancelAnimationFrame(animation);
//       setEnabled(false);
//     };
//   }, []);
//   if (!enabled) return null;
//   return <Droppable {...props}>{children}</Droppable>;
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const uid = () => Math.random().toString(36).slice(2, 10);

// const PRIORITY_CONFIG = {
//   High:   { fill: "#ef4444", label: "High",   weight: 3 },
//   Medium: { fill: "#f59e0b", label: "Medium", weight: 2 },
//   Low:    { fill: "#38bdf8", label: "Low",    weight: 1 },
//   None:   { fill: "#cbd5e1", label: "None",   weight: 0 },
// };

// const COL_ACCENTS = ["#64748b","#f97316","#3b82f6","#8b5cf6","#10b981","#ec4899"];
// const getColAccent = idx => COL_ACCENTS[idx % COL_ACCENTS.length];

// function PriorityFlag({ priority, size = 13 }) {
//   const { fill } = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.None;
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24"
//       fill={priority === "None" ? "none" : fill}
//       stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
//       <line x1="4" y1="22" x2="4" y2="15"/>
//     </svg>
//   );
// }

// function getDeadlineStatus(deadline) {
//   if (!deadline) return null;
//   const parsed = parseISO(deadline);
//   if (!isValid(parsed)) return null;
//   const days = differenceInDays(parsed, new Date());
//   if (days < 0)  return { color: "text-red-500",  icon: <AlertCircle size={10}/>, date: format(parsed,"MMM d"), overdue: true  };
//   if (days <= 3) return { color: "text-amber-500", icon: <Clock size={10}/>,        date: format(parsed,"MMM d"), overdue: false };
//   return              { color: "text-slate-500",  icon: <CalendarIcon size={10}/>, date: format(parsed,"MMM d"), overdue: false };
// }

// function sortCards(items, sortMode) {
//   if (sortMode === "none") return items;
//   return [...items].sort((a, b) => {
//     if (sortMode === "priority")
//       return (PRIORITY_CONFIG[b.priority]?.weight ?? 0) - (PRIORITY_CONFIG[a.priority]?.weight ?? 0);
//     if (sortMode === "deadline") {
//       if (!a.deadline && !b.deadline) return 0;
//       if (!a.deadline) return 1;
//       if (!b.deadline) return -1;
//       return new Date(a.deadline) - new Date(b.deadline);
//     }
//     return 0;
//   });
// }

// const DEFAULT_COLUMNS = [
//   { localId: uid(), title: "Backlog",     items: [] },
//   { localId: uid(), title: "To Do",       items: [] },
//   { localId: uid(), title: "In Progress", items: [] },
//   { localId: uid(), title: "For Review",  items: [] },
//   { localId: uid(), title: "Done",        items: [] },
// ];

// // ─── Simple date-picker (no shadcn dependency) ────────────────────────────────

// function SimpleDatePicker({ value, onChange, onClose }) {
//   const [month, setMonth] = useState(value && isValid(parseISO(value)) ? parseISO(value) : new Date());
//   const monthStart = startOfMonth(month);
//   const monthEnd   = endOfMonth(month);
//   const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
//   const selected = value && isValid(parseISO(value)) ? parseISO(value) : null;

//   return (
//     <div className="absolute z-50 mt-1 bg-white border border-slate-200 rounded-md shadow-xl p-3 w-64" style={{ top: "100%", left: 0 }}>
//       <div className="flex items-center justify-between mb-2">
//         <button type="button" onClick={() => setMonth(m => subMonths(m,1))} className="p-1 hover:bg-slate-100 rounded text-slate-500">‹</button>
//         <span className="text-[12px] font-bold text-slate-700">{format(month,"MMMM yyyy")}</span>
//         <button type="button" onClick={() => setMonth(m => addMonths(m,1))} className="p-1 hover:bg-slate-100 rounded text-slate-500">›</button>
//       </div>
//       <div className="grid grid-cols-7 mb-1">
//         {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
//           <div key={d} className="text-center text-[9px] font-bold text-slate-400 py-1">{d}</div>
//         ))}
//       </div>
//       {weeks.map((wk, wi) => {
//         const days = eachDayOfInterval({ start: wk, end: endOfWeek(wk,{weekStartsOn:0}) });
//         return (
//           <div key={wi} className="grid grid-cols-7">
//             {days.map((day,di) => {
//               const inMonth = isSameMonth(day, month);
//               const isToday = isSameDay(day, new Date());
//               const isSel   = selected && isSameDay(day, selected);
//               return (
//                 <button type="button" key={di} onClick={() => { onChange(format(day,"yyyy-MM-dd")); onClose(); }}
//                   className={`text-center text-[11px] py-1 rounded-full mx-0.5 transition-colors
//                     ${!inMonth ? "text-slate-300" : isToday ? "text-blue-600 font-bold" : "text-slate-700"}
//                     ${isSel ? "bg-blue-600 !text-white font-bold" : "hover:bg-slate-100"}`}>
//                   {format(day,"d")}
//                 </button>
//               );
//             })}
//           </div>
//         );
//       })}
//       {value && (
//         <button type="button" onClick={() => { onChange(""); onClose(); }}
//           className="mt-2 w-full text-[10px] text-red-400 hover:text-red-600 font-semibold">
//           Clear date
//         </button>
//       )}
//     </div>
//   );
// }

// // ─── Tag Input ────────────────────────────────────────────────────────────────

// function TagInput({ tags, onChange }) {
//   const [input, setInput] = useState("");
//   const commit = val => {
//     const t = val.trim().toLowerCase();
//     if (t && !tags.includes(t)) onChange([...tags, t]);
//     setInput("");
//   };
//   return (
//     <div className="flex flex-wrap gap-1.5 p-2 rounded border border-slate-200 bg-slate-50 min-h-[38px]">
//       {tags.map(tag => (
//         <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200 uppercase tracking-wide">
//           {tag}
//           <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="text-violet-400 hover:text-red-500">
//             <X size={9}/>
//           </button>
//         </span>
//       ))}
//       <input value={input}
//         onChange={e => { const v=e.target.value; if(v.endsWith(",")){ commit(v.slice(0,-1)); }else setInput(v); }}
//         onKeyDown={e => { if(e.key==="Enter"||e.key===","){ e.preventDefault(); commit(input); } else if(e.key==="Backspace"&&input===""&&tags.length>0) onChange(tags.slice(0,-1)); }}
//         placeholder={tags.length===0?"Add tags (Enter or comma)…":""}
//         className="flex-1 min-w-[120px] bg-transparent text-[12px] text-slate-700 placeholder-slate-300 focus:outline-none"/>
//     </div>
//   );
// }

// // ─── Card Detail Panel ────────────────────────────────────────────────────────

// function CardDetailPanel({ card, isNew, columnId, columns, onSave, onDelete, onClose, onMarkComplete, onUndoComplete }) {
//   const [editMode, setEditMode]     = useState(isNew);
//   const [title, setTitle]           = useState(card?.title ?? "");
//   const [description, setDesc]      = useState(card?.description ?? "");
//   const [notes, setNotes]           = useState(card?.notes ?? "");
//   const [priority, setPriority]     = useState(card?.priority ?? "None");
//   const [deadline, setDeadline]     = useState(card?.deadline ?? "");
//   const [links, setLinks]           = useState(card?.links ?? []);
//   const [comments, setComments]     = useState(card?.comments ?? []);
//   const [tags, setTags]             = useState(card?.tags ?? []);
//   const [selectedCol, setSelCol]    = useState(columnId);
//   const [commentText, setComText]   = useState("");
//   const [activeTab, setActiveTab]   = useState("details");
//   const [deleteConfirm, setDelConf] = useState(false);
//   const [completeConf, setCompConf] = useState(false);
//   const [undoConf, setUndoConf]     = useState(false);
//   const [priorityOpen, setPriOpen]  = useState(false);
//   const [calOpen, setCalOpen]       = useState(false);
//   const isCompleted = card?.completed ?? false;
//   const ds = getDeadlineStatus(deadline);
//   const colForCard = columns.find(c => (c._id || c.localId) === columnId);
//   const colIdx = columns.findIndex(c => (c._id || c.localId) === columnId);
//   const accent = getColAccent(colIdx);

//   const handleSave = () => {
//     if (!title.trim()) return;
//     onSave(selectedCol, {
//       _id: card?._id, localId: card?.localId ?? uid(),
//       title: title.trim(), description, notes,
//       priority, deadline, links, comments, tags, completed: isCompleted
//     });
//   };
//   const handleComplete = () => {
//     if (!title.trim()) return;
//     onMarkComplete(columnId, { ...card, title: title.trim(), description, notes, priority, deadline, links, comments, tags, completed: true });
//     onClose();
//   };
//   const handleUndoComplete = () => {
//     if (!card) return;
//     onUndoComplete({ ...card, completed: false });
//     onClose();
//   };

//   const addLink    = () => setLinks(p => [...p, { id: uid(), title: "", url: "" }]);
//   const updateLink = (id, f, v) => setLinks(p => p.map(l => l.id===id ? {...l,[f]:v} : l));
//   const removeLink = id => setLinks(p => p.filter(l => l.id!==id));
//   const addComment = () => {
//     if (!commentText.trim()) return;
//     setComments(p => [...p, { id: uid(), text: commentText.trim(), timestamp: new Date().toISOString() }]);
//     setComText("");
//   };

//   return (
//     <motion.div className="fixed inset-0 z-50 flex" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
//       <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose}/>
//       <motion.div className="w-full sm:max-w-[420px] h-full bg-white flex flex-col border-l border-slate-200 shadow-2xl"
//         initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}}
//         transition={{type:"spring",stiffness:400,damping:36}}
//         style={{scrollbarWidth:"none"}}>
//         {/* Top bar */}
//         <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-white">
//           <button type="button" onClick={onClose} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors">
//             <ArrowLeft size={12}/> Back
//           </button>
//           <div className="flex-1"/>
//           <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-white" style={{backgroundColor:accent}}>
//             {colForCard?.title ?? ""}
//           </span>
//           <div className="flex items-center gap-1">
//             {!isNew && (
//               <button type="button" onClick={() => setEditMode(v => !v)}
//                 className={`p-1.5 rounded transition-colors ${editMode ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
//                 title={editMode ? "View mode" : "Edit card"}>
//                 {editMode ? <Eye size={12}/> : <Edit3 size={12}/>}
//               </button>
//             )}
//             {!isNew && (deleteConfirm
//               ? <div className="flex items-center gap-1">
//                   <span className="text-[10px] text-red-500 font-semibold">Delete?</span>
//                   <button type="button" onClick={() => { onDelete(columnId, card._id || card.localId); onClose(); }} className="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold hover:bg-red-600">Yes</button>
//                   <button type="button" onClick={() => setDelConf(false)} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200">No</button>
//                 </div>
//               : <button type="button" onClick={() => setDelConf(true)} className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={12}/></button>
//             )}
//             <button type="button" onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X size={13}/></button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="shrink-0 flex border-b border-slate-100 px-4 bg-white">
//           {["details","links"].map(tab => (
//             <button type="button" key={tab} onClick={() => setActiveTab(tab)}
//               className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide capitalize transition-colors border-b-2 -mb-px
//                 ${activeTab===tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
//               {tab}
//               {tab==="links" && links.length>0 && <span className="ml-1.5 text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-black">{links.length}</span>}
//             </button>
//           ))}
//         </div>

//         {/* Body */}
//         <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:"none"}}>
//           {activeTab==="details" && (
//             <div className="px-5 py-5 space-y-5">
//               {/* Completed banner */}
//               {isCompleted && (
//                 <div className="flex items-center gap-2.5 px-3 py-2.5 rounded bg-emerald-50 border border-emerald-200">
//                   <CheckCircle2 size={14} className="text-emerald-500 shrink-0"/>
//                   <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest flex-1">Completed</p>
//                   {undoConf
//                     ? <div className="flex items-center gap-1">
//                         <button type="button" onClick={handleUndoComplete} className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600">Undo</button>
//                         <button type="button" onClick={() => setUndoConf(false)} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200">Keep</button>
//                       </div>
//                     : <button type="button" onClick={() => setUndoConf(true)} className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-amber-600 px-2 py-1 rounded hover:bg-amber-50">
//                         <RotateCcw size={10}/> Undo
//                       </button>
//                   }
//                 </div>
//               )}

//               {/* VIEW MODE */}
//               {!editMode && !isNew
//                 ? <div className="space-y-4">
//                     <h2 className={`text-[18px] font-black leading-tight text-slate-900 ${isCompleted?"line-through text-slate-400":""}`}>
//                       {title || <span className="text-slate-300 italic font-normal">Untitled</span>}
//                     </h2>
//                     <div className="flex flex-wrap gap-3">
//                       <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200">
//                         <PriorityFlag priority={priority} size={11}/>
//                         <span className="text-[11px] font-semibold text-slate-600">{PRIORITY_CONFIG[priority]?.label}</span>
//                       </div>
//                       {deadline && ds && (
//                         <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] font-semibold ${ds.overdue?"bg-red-50 border-red-200 text-red-600":"bg-slate-50 border-slate-200 text-slate-600"}`}>
//                           {ds.icon} {ds.date}
//                         </div>
//                       )}
//                     </div>
//                     {tags.length>0 && (
//                       <div className="flex flex-wrap gap-1.5">
//                         {tags.map(tag => (
//                           <span key={tag} className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200 uppercase tracking-wide">{tag}</span>
//                         ))}
//                       </div>
//                     )}
//                     {description && (
//                       <div className="space-y-1.5">
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</p>
//                         <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">{description}</p>
//                       </div>
//                     )}
//                     {notes && (
//                       <div className="space-y-1.5">
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><FileText size={9}/> Notes</p>
//                         <p className="text-[13px] text-slate-500 leading-relaxed whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded px-3 py-2.5">{notes}</p>
//                       </div>
//                     )}
//                     {comments.length>0 && (
//                       <div className="space-y-2">
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MessageSquare size={9}/> Comments ({comments.length})</p>
//                         {comments.map(c => (
//                           <div key={c.id||c._id} className="flex gap-2 items-start">
//                             <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><User size={11} className="text-violet-600"/></div>
//                             <div className="flex-1 bg-slate-50 border border-slate-100 rounded p-2.5">
//                               <p className="text-[12px] text-slate-700 whitespace-pre-wrap">{c.text}</p>
//                               <span className="text-[9px] text-slate-400 mt-1 block">{c.timestamp && isValid(parseISO(c.timestamp)) ? format(parseISO(c.timestamp),"MMM d, h:mm a") : "Just now"}</span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                     <button type="button" onClick={() => setEditMode(true)}
//                       className="w-full flex items-center justify-center gap-1.5 py-2 rounded border border-dashed border-slate-200 text-[11px] font-bold text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-wide">
//                       <Edit3 size={11}/> Edit this card
//                     </button>
//                   </div>

//                 /* EDIT MODE */
//                 : <div className="space-y-5">
//                     <div className="flex items-center justify-between">
//                       <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">
//                         #{(card?._id || card?.localId || "NEW").toString().slice(-6).toUpperCase()}
//                       </span>
//                       <select value={selectedCol} onChange={e => setSelCol(e.target.value)}
//                         className="text-[11px] font-semibold bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
//                         {columns.map(c => <option key={c._id||c.localId} value={c._id||c.localId}>{c.title}</option>)}
//                       </select>
//                     </div>
//                     <input autoFocus={isNew} value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title…"
//                       className="w-full text-[17px] font-black text-slate-900 bg-transparent border-0 border-b-2 border-slate-100 focus:border-blue-500 focus:outline-none pb-2 placeholder-slate-300 transition-colors leading-tight"/>

//                     {/* Priority + Deadline */}
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority</p>
//                         <div className="relative">
//                           <button type="button" onClick={() => setPriOpen(v => !v)}
//                             className="flex items-center gap-2 w-full px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
//                             <PriorityFlag priority={priority} size={11}/>
//                             <span className="text-slate-700 text-[12px] font-semibold">{PRIORITY_CONFIG[priority]?.label}</span>
//                             <ChevronDown size={10} className="ml-auto text-slate-400"/>
//                           </button>
//                           {priorityOpen && (
//                             <div className="absolute z-50 mt-1 bg-white border border-slate-200 rounded shadow-xl w-full p-1">
//                               {["High","Medium","Low","None"].map(p => (
//                                 <button type="button" key={p} onClick={() => { setPriority(p); setPriOpen(false); }}
//                                   className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-[11px] font-medium hover:bg-slate-50 transition-colors ${priority===p?"bg-slate-100":""}`}>
//                                   <PriorityFlag priority={p} size={11}/><span className="text-slate-700">{PRIORITY_CONFIG[p].label}</span>
//                                 </button>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <div>
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</p>
//                         <div className="relative">
//                           <button type="button" onClick={() => setCalOpen(v => !v)}
//                             className="flex items-center gap-2 w-full px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-[12px] text-left transition-colors">
//                             <CalendarIcon size={11} className="text-slate-400 shrink-0"/>
//                             <span className={deadline ? "text-slate-700" : "text-slate-400"}>
//                               {deadline && isValid(parseISO(deadline)) ? format(parseISO(deadline),"MMM d, yyyy") : "Pick date"}
//                             </span>
//                           </button>
//                           {calOpen && <SimpleDatePicker value={deadline} onChange={setDeadline} onClose={() => setCalOpen(false)}/>}
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
//                       <textarea value={description} onChange={e => setDesc(e.target.value)}
//                         placeholder="What needs to be done?" rows={3}
//                         className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none leading-relaxed"/>
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><FileText size={9}/> Notes</p>
//                       <textarea value={notes} onChange={e => setNotes(e.target.value)}
//                         placeholder="Extended context, sub-tasks…" rows={3}
//                         className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"/>
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Tag size={9}/> Tags</p>
//                       <TagInput tags={tags} onChange={setTags}/>
//                     </div>

//                     {/* Comments */}
//                     <div>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1"><MessageSquare size={9}/> Comments</p>
//                       {comments.length>0 && (
//                         <div className="space-y-3 mb-4">
//                           {comments.map(c => (
//                             <div key={c.id||c._id} className="flex gap-2 items-start group">
//                               <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><User size={11} className="text-violet-600"/></div>
//                               <div className="flex-1 bg-slate-50 border border-slate-100 rounded p-2.5">
//                                 <p className="text-[12px] text-slate-700 whitespace-pre-wrap">{c.text}</p>
//                                 <span className="text-[9px] text-slate-400 mt-1.5 block">{c.timestamp && isValid(parseISO(c.timestamp)) ? format(parseISO(c.timestamp),"MMM d, h:mm a") : "Just now"}</span>
//                               </div>
//                               <button type="button" onClick={() => setComments(p => p.filter(x => (x.id||x._id)!==(c.id||c._id)))}
//                                 className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={11}/></button>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                       <div className="flex gap-2 items-start">
//                         <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 border border-blue-500"><User size={11} className="text-blue-600"/></div>
//                         <div className="flex-1 flex flex-col gap-2">
//                           <textarea value={commentText} onChange={e => setComText(e.target.value)}
//                             placeholder="Add a comment…" rows={2}
//                             className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 text-[12px] text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"/>
//                           <button type="button" onClick={addComment} disabled={!commentText.trim()}
//                             className="self-end px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
//                             Post Comment
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//               }
//             </div>
//           )}

//           {activeTab==="links" && (
//             <div className="px-5 py-5">
//               <div className="flex items-center justify-between mb-3">
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Links & Files</p>
//                 <button type="button" onClick={addLink} className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition-colors"><Plus size={11}/> Add</button>
//               </div>
//               <AnimatePresence>
//                 {links.map(link => (
//                   <motion.div key={link.id} initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="mb-2">
//                     <div className="flex items-center gap-2 p-2.5 rounded border border-slate-200 bg-slate-50 group hover:border-slate-300">
//                       <ExternalLink size={11} className="text-slate-400 shrink-0"/>
//                       <input value={link.title} onChange={e => updateLink(link.id,"title",e.target.value)} placeholder="Label" className="flex-1 min-w-0 bg-transparent text-[12px] text-slate-700 placeholder-slate-300 focus:outline-none"/>
//                       <input value={link.url} onChange={e => updateLink(link.id,"url",e.target.value)} placeholder="https://…" className="flex-[2] min-w-0 bg-transparent text-[12px] text-slate-500 placeholder-slate-300 focus:outline-none"/>
//                       <button type="button" onClick={() => removeLink(link.id)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={11}/></button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//               {links.length===0 && (
//                 <div className="flex flex-col items-center py-12 text-slate-300"><Link2 size={24} className="mb-2"/><p className="text-[12px]">No links yet</p></div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="shrink-0 border-t border-slate-100 px-5 py-3 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
//           {!isNew && !isCompleted && (
//             completeConf
//               ? <div className="flex items-center gap-1.5">
//                   <span className="text-[10px] text-emerald-600 font-semibold">Mark complete?</span>
//                   <button type="button" onClick={handleComplete} className="px-2 py-1 rounded bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600">Yes</button>
//                   <button type="button" onClick={() => setCompConf(false)} className="px-2 py-1 rounded bg-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-300">No</button>
//                 </div>
//               : <button type="button" onClick={() => setCompConf(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100">
//                   <CheckCircle2 size={12}/> Mark Complete
//                 </button>
//           )}
//           {(isNew || isCompleted) && <div/>}
//           <div className="flex items-center gap-2">
//             <button type="button" onClick={onClose} className="px-3 py-1.5 rounded text-[12px] font-semibold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
//             {(editMode || isNew) && (
//               <button type="button" onClick={handleSave} disabled={!title.trim()}
//                 className="px-4 py-1.5 rounded text-[12px] font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
//                 {isNew ? "Create Task" : "Save Changes"}
//               </button>
//             )}
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ─── Kanban Card ──────────────────────────────────────────────────────────────

// function KanbanCard({ card, index, colIndex, searchQuery, isSearchActive, onClick }) {
//   const ds = getDeadlineStatus(card.deadline);
//   const q  = searchQuery.toLowerCase();
//   const matches = !isSearchActive ||
//     card.title.toLowerCase().includes(q) ||
//     (card.description||"").toLowerCase().includes(q) ||
//     (card.tags??[]).some(t => t.toLowerCase().includes(q));
//   const accent = getColAccent(colIndex);

//   return (
//     <Draggable draggableId={card._id?.toString() || card.localId} index={index} isDragDisabled={isSearchActive}>
//       {(provided, snapshot) => (
//         <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
//           style={{
//             ...provided.draggableProps.style,
//             display: matches ? undefined : "none",
//             borderRadius: "4px",
//             borderLeft: `3px solid ${accent}`,
//             borderTop: "1px solid #e2e8f0",
//             borderRight: "1px solid #e2e8f0",
//             borderBottom: "1px solid #e2e8f0",
//             transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} rotate(0.5deg)` : provided.draggableProps.style?.transform,
//           }}
//           className={`bg-white cursor-grab active:cursor-grabbing select-none transition-all duration-100 relative overflow-hidden
//             ${snapshot.isDragging ? "shadow-xl z-50" : "hover:shadow-md z-10"}
//             ${card.completed ? "opacity-90" : ""}`}>
            
//           {/* 3. FIXED: Insulated onClick Wrapper to prevent DND from swallowing clicks */}
//           <div onClick={onClick} className="w-full h-full">
//             {card.completed && (
//               <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
//                 <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(135deg,transparent,transparent 18px,rgba(16,185,129,0.04) 18px,rgba(16,185,129,0.04) 20px)"}}/>
//                 <span style={{transform:"rotate(-28deg)",fontSize:"13px",fontWeight:900,letterSpacing:"0.35em",whiteSpace:"nowrap",color:"#10b981",opacity:0.18,userSelect:"none",textTransform:"uppercase",fontFamily:"monospace",border:"2.5px solid #10b981",padding:"2px 10px",borderRadius:"2px"}}>✓ DONE</span>
//               </div>
//             )}
//             <div className="p-3">
//               {(card.tags?.length??0)>0 && (
//                 <div className="flex flex-wrap gap-1 mb-2">
//                   {card.tags.slice(0,3).map(tag => (
//                     <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200 uppercase tracking-wide">{tag}</span>
//                   ))}
//                 </div>
//               )}
//               <div className="flex items-start gap-1.5">
//                 {card.completed && <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5"/>}
//                 <p className={`text-[13px] font-semibold leading-snug mb-1.5 ${card.completed?"line-through text-slate-400":"text-slate-800"}`}>{card.title}</p>
//               </div>
//               {card.description && <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-2">{card.description}</p>}
//               <div className="flex items-center justify-between gap-1 pt-2 mt-1 border-t border-slate-100">
//                 <div className="flex items-center gap-2">
//                   {ds && <span className={`flex items-center gap-1 text-[10px] font-semibold ${ds.color}`}>{ds.icon}{ds.date}</span>}
//                   <div className="flex items-center gap-2 text-slate-400">
//                     {(card.comments?.length??0)>0 && <span className="flex items-center gap-0.5 text-[10px]"><MessageSquare size={10}/>{card.comments.length}</span>}
//                     {(card.links?.length??0)>0 && <span className="flex items-center gap-0.5 text-[10px]"><Paperclip size={10}/>{card.links.length}</span>}
//                   </div>
//                 </div>
//                 <PriorityFlag priority={card.priority||"None"} size={11}/>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Draggable>
//   );
// }

// // ─── Kanban Column ────────────────────────────────────────────────────────────

// function KanbanColumn({ column, colIndex, index, searchQuery, isSearchActive, sortMode, onAddCard, onEditCard, onDeleteColumn, onRenameColumn }) {
//   const [hovered, setHovered]           = useState(false);
//   const [deleteConfirm, setDelConf]     = useState(false);
//   const [editingTitle, setEditTitle]    = useState(false);
//   const [titleVal, setTitleVal]         = useState(column.title);
//   const accent = getColAccent(colIndex);
//   const sortedItems = sortCards(column.items, sortMode);
//   const colKey = column._id?.toString() || column.localId;

//   const commitTitle = () => {
//     setEditTitle(false);
//     if (titleVal.trim()) onRenameColumn(colKey, titleVal.trim());
//     else setTitleVal(column.title);
//   };

//   return (
//     <Draggable draggableId={colKey} index={index}>
//       {(provided, snapshot) => (
//         <div ref={provided.innerRef} {...provided.draggableProps}
//           className={`flex flex-col w-[260px] shrink-0 border border-slate-200 bg-slate-50/50 rounded-md p-2 transition-all duration-150 ${snapshot.isDragging?"opacity-95 rotate-[0.3deg] shadow-lg bg-white z-40":""}`}
//           onMouseEnter={() => setHovered(true)}
//           onMouseLeave={() => { setHovered(false); setDelConf(false); }}>
//           {/* Header */}
//           <div {...provided.dragHandleProps}
//             className="flex items-center gap-2 px-3 py-2 mb-2 bg-white border border-slate-200 rounded cursor-grab active:cursor-grabbing shadow-sm"
//             style={{borderTop:`2px solid ${accent}`}}>
//             {editingTitle
//               ? <input autoFocus value={titleVal} onChange={e => setTitleVal(e.target.value)}
//                   onBlur={commitTitle}
//                   onKeyDown={e => { if(e.key==="Enter") commitTitle(); if(e.key==="Escape"){ setTitleVal(column.title); setEditTitle(false); } }}
//                   onClick={e => e.stopPropagation()}
//                   className="flex-1 min-w-0 bg-transparent text-[12px] font-bold text-slate-800 focus:outline-none"/>
//               : <span className="text-[12px] font-bold text-slate-700 flex-1 truncate cursor-text uppercase tracking-wide"
//                   onDoubleClick={() => setEditTitle(true)}>{column.title}</span>
//             }
//             <span className="text-[10px] font-bold text-white shrink-0 px-1.5 py-0.5 rounded" style={{backgroundColor:accent}}>{column.items.length}</span>
//             <AnimatePresence>
//               {hovered && (
//                 <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
//                   className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
//                   <button type="button" onClick={() => onAddCard(colKey)} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><Plus size={12}/></button>
//                   {deleteConfirm
//                     ? <>
//                         <button type="button" onClick={() => onDeleteColumn(colKey)} className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold">Del</button>
//                         <button type="button" onClick={() => setDelConf(false)} className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold">No</button>
//                       </>
//                     : <button type="button" onClick={() => setDelConf(true)} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><MoreHorizontal size={12}/></button>
//                   }
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Drop zone */}
//           <StrictModeDroppable droppableId={colKey} type="card">
//             {(drop, dropSnap) => (
//               <div ref={drop.innerRef} {...drop.droppableProps}
//                 className={`flex-1 space-y-2 min-h-[60px] p-1 rounded transition-colors duration-100 ${dropSnap.isDraggingOver?"bg-violet-50":""}`}>
//                 {sortedItems.map((card, i) => (
//                   <KanbanCard key={card._id?.toString()||card.localId} card={card} index={i} colIndex={colIndex}
//                     searchQuery={searchQuery} isSearchActive={isSearchActive}
//                     onClick={() => onEditCard(colKey, card)}/>
//                 ))}
//                 {drop.placeholder}
//               </div>
//             )}
//           </StrictModeDroppable>

//           <button type="button" onClick={() => onAddCard(colKey)}
//             className="flex items-center gap-1.5 mt-2 px-3 py-2 rounded text-[11px] font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-dashed border-slate-200 hover:border-slate-300 transition-all uppercase tracking-wide">
//             <Plus size={11}/> Add task
//           </button>
//         </div>
//       )}
//     </Draggable>
//   );
// }

// // ─── List View ────────────────────────────────────────────────────────────────

// function ListView({ columns, onEditCard, onAddCard, searchQuery, sortMode }) {
//   const [expanded, setExpanded] = useState(() => Object.fromEntries(columns.map(c => [c._id||c.localId, true])));
//   const q = searchQuery.toLowerCase();

//   return (
//     <div className="flex-1 overflow-y-auto px-2 sm:px-5 py-4 space-y-1.5" style={{scrollbarWidth:"none"}}>
//       {columns.map((col, ci) => {
//         const accent = getColAccent(ci);
//         const colKey = col._id?.toString()||col.localId;
//         const isOpen = expanded[colKey] !== false;
//         const sortedItems = sortCards(col.items, sortMode);
//         const filteredItems = q ? sortedItems.filter(c => c.title.toLowerCase().includes(q)||(c.description||"").toLowerCase().includes(q)||(c.tags??[]).some(t=>t.toLowerCase().includes(q))) : sortedItems;

//         return (
//           <div key={colKey} className="bg-white border border-slate-200 rounded overflow-hidden">
//             <button type="button" onClick={() => setExpanded(p => ({...p,[colKey]:!isOpen}))}
//               className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-2.5 hover:bg-slate-50 transition-colors border-l-2"
//               style={{borderLeftColor:accent}}>
//               <span className="text-[11px] font-bold text-slate-700 flex-1 text-left uppercase tracking-wide">{col.title}</span>
//               <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{backgroundColor:accent}}>{col.items.length}</span>
//               <ChevronRight size={12} className={`text-slate-400 transition-transform ${isOpen?"rotate-90":""}`}/>
//             </button>
//             <AnimatePresence>
//               {isOpen && (
//                 <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden">
//                   {filteredItems.length>0 && (
//                     <div className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_90px] gap-3 px-4 py-1.5 border-t border-slate-100 bg-slate-50">
//                       {["Task","Deadline","Priority","Status"].map(h => (
//                         <span key={h} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{h}</span>
//                       ))}
//                     </div>
//                   )}
//                   {filteredItems.map(card => {
//                     const ds = getDeadlineStatus(card.deadline);
//                     return (
//                       <div key={card._id?.toString()||card.localId} onClick={() => onEditCard(colKey, card)}
//                         className="relative overflow-hidden border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
//                         {card.completed && (
//                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
//                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em] select-none"
//                               style={{transform:"rotate(-8deg)",opacity:0.15,whiteSpace:"nowrap"}}>✓ DONE ✓ DONE ✓ DONE ✓ DONE</span>
//                           </div>
//                         )}
//                         <div className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_90px] gap-3 px-4 py-2.5">
//                           <div className="flex items-center gap-2 min-w-0">
//                             {card.completed ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0"/> : <Circle size={11} className="text-slate-300 shrink-0 group-hover:text-violet-400 transition-colors"/>}
//                             <div className="min-w-0">
//                               <span className={`block text-[12px] font-semibold truncate ${card.completed?"line-through text-slate-400":"text-slate-700"}`}>{card.title}</span>
//                               {(card.tags?.length??0)>0 && (
//                                 <div className="flex gap-1 mt-0.5 flex-wrap">
//                                   {card.tags.slice(0,2).map(t => <span key={t} className="text-[8px] font-bold px-1 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-100 uppercase">{t}</span>)}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                           <div className="flex items-center">
//                             {ds && card.deadline ? <span className={`flex items-center gap-1 text-[10px] font-semibold ${ds.color}`}>{ds.icon}{ds.date}</span> : <span className="text-[10px] text-slate-300">—</span>}
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <PriorityFlag priority={card.priority||"None"} size={10}/>
//                             <span className="text-[10px] text-slate-500">{PRIORITY_CONFIG[card.priority||"None"]?.label}</span>
//                           </div>
//                           <div className="flex items-center">
//                             <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white truncate uppercase tracking-wide" style={{backgroundColor:accent}}>{col.title}</span>
//                           </div>
//                         </div>
//                         <div className="sm:hidden grid grid-cols-[1fr_auto] gap-2 px-3 py-2.5 items-center">
//                           <div className="flex items-center gap-2 min-w-0">
//                             {card.completed ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0"/> : <Circle size={11} className="text-slate-300 shrink-0"/>}
//                             <div className="min-w-0">
//                               <span className={`block text-[12px] font-semibold truncate ${card.completed?"line-through text-slate-400":"text-slate-700"}`}>{card.title}</span>
//                               <div className="flex items-center gap-1.5 mt-0.5">
//                                 <PriorityFlag priority={card.priority||"None"} size={9}/>
//                                 <span className="text-[9px] font-bold px-1 py-0.5 rounded text-white uppercase" style={{backgroundColor:accent}}>{col.title}</span>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="flex items-center shrink-0">
//                             {ds && card.deadline ? <span className={`flex items-center gap-1 text-[10px] font-semibold ${ds.color}`}>{ds.icon}{ds.date}</span> : <span className="text-[10px] text-slate-300">—</span>}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                   <button type="button" onClick={() => onAddCard(colKey)}
//                     className="w-full flex items-center gap-1.5 px-3 sm:px-4 py-2 border-t border-slate-100 text-[11px] font-semibold text-slate-400 hover:text-violet-600 hover:bg-violet-50/30 transition-colors uppercase tracking-wide">
//                     <Plus size={11}/> Add task
//                   </button>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // ─── Gantt / Calendar View ────────────────────────────────────────────────────

// function GanttView({ columns, onEditCard }) {
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [ganttTab, setGanttTab] = useState("calendar");
//   const allCards = columns.flatMap((col, ci) => col.items.map(card => ({ card, col, ci })));

//   const CalendarSubView = () => {
//     const monthStart = startOfMonth(currentMonth);
//     const monthEnd   = endOfMonth(currentMonth);
//     const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
//     const getCardsForDay = day => allCards.filter(({ card }) => {
//       if (!card.deadline) return false;
//       const dl = parseISO(card.deadline);
//       return isValid(dl) && isSameDay(dl, day);
//     });
//     return (
//       <div className="flex-1 overflow-y-auto px-2 sm:px-5 py-4" style={{scrollbarWidth:"none"}}>
//         <div className="flex items-center justify-between mb-4 bg-white border border-slate-200 rounded px-4 py-2.5">
//           <button type="button" onClick={() => setCurrentMonth(m => subMonths(m,1))} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100">◀</button>
//           <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">{format(currentMonth,"MMMM yyyy")}</h2>
//           <button type="button" onClick={() => setCurrentMonth(m => addMonths(m,1))} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100">▶</button>
//         </div>
//         <div className="bg-white border border-slate-200 rounded overflow-hidden">
//           <div className="grid grid-cols-7 border-b border-slate-200">
//             {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
//               <div key={d} className="text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-100">{d}</div>
//             ))}
//           </div>
//           {weeks.map((weekStart, wi) => {
//             const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart,{weekStartsOn:0}) });
//             return (
//               <div key={wi} className="grid grid-cols-7 border-b last:border-b-0 border-slate-100">
//                 {weekDays.map((day, di) => {
//                   const inMonth = isSameMonth(day, currentMonth);
//                   const isToday = isSameDay(day, new Date());
//                   const dayCards = getCardsForDay(day);
//                   return (
//                     <div key={di} className={`min-h-[80px] sm:min-h-[100px] p-1.5 border-r last:border-r-0 border-slate-100 ${!inMonth?"bg-slate-50/50":isToday?"bg-blue-50":"bg-white"}`}>
//                       <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black mb-1 leading-none ${isToday?"bg-blue-600 text-white":inMonth?"text-slate-700":"text-slate-300"}`}>{format(day,"d")}</div>
//                       <div className="space-y-0.5">
//                         {dayCards.slice(0,3).map(({ card, col, ci }) => (
//                           <button type="button" key={card._id?.toString()||card.localId} onClick={() => onEditCard(col._id?.toString()||col.localId, card)}
//                             className="w-full text-left px-1.5 py-0.5 rounded text-[9px] font-bold text-white truncate hover:opacity-80"
//                             style={{backgroundColor: card.completed ? "#10b981" : getColAccent(ci)}}>
//                             {card.completed&&"✓ "}{card.title}
//                           </button>
//                         ))}
//                         {dayCards.length>3 && <div className="text-[9px] text-slate-400 font-bold px-1">+{dayCards.length-3} more</div>}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             );
//           })}
//         </div>
//         <div className="mt-4 space-y-1">
//           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">All deadlines in {format(currentMonth,"MMMM")}</p>
//           {allCards
//             .filter(({ card }) => { if(!card.deadline) return false; const dl=parseISO(card.deadline); return isValid(dl)&&getMonth(dl)===getMonth(currentMonth)&&getYear(dl)===getYear(currentMonth); })
//             .sort((a,b) => new Date(a.card.deadline)-new Date(b.card.deadline))
//             .map(({ card, col, ci }) => {
//               const acc = getColAccent(ci);
//               const ds = getDeadlineStatus(card.deadline);
//               return (
//                 <div key={card._id?.toString()||card.localId} onClick={() => onEditCard(col._id?.toString()||col.localId, card)}
//                   className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 cursor-pointer group">
//                   <div className="w-1.5 h-8 rounded-full shrink-0" style={{backgroundColor: card.completed ? "#10b981" : acc}}/>
//                   <div className="flex-1 min-w-0">
//                     <p className={`text-[12px] font-semibold truncate ${card.completed?"line-through text-slate-400":"text-slate-700"}`}>{card.title}</p>
//                     <div className="flex items-center gap-2 mt-0.5">
//                       <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded uppercase" style={{backgroundColor:acc}}>{col.title}</span>
//                       <PriorityFlag priority={card.priority||"None"} size={9}/>
//                     </div>
//                   </div>
//                   {ds && <span className={`flex items-center gap-1 text-[10px] font-semibold ${ds.color} shrink-0`}>{ds.icon}{ds.date}</span>}
//                 </div>
//               );
//             })}
//         </div>
//       </div>
//     );
//   };

//   const TimelineSubView = () => {
//     const today = new Date();
//     const start = addDays(today, -5);
//     const end   = addDays(today, 28);
//     const days  = eachDayOfInterval({ start, end });
//     const containerRef = useRef(null);
//     const [dayWidth, setDayWidth] = useState(32);

//     useEffect(() => {
//       const update = () => {
//         if (containerRef.current) {
//           const w = containerRef.current.clientWidth;
//           setDayWidth(w < 480 ? 22 : w < 768 ? 26 : 32);
//         }
//       };
//       update();
//       window.addEventListener("resize", update);
//       return () => window.removeEventListener("resize", update);
//     }, []);

//     const TASK_COL_W = dayWidth < 26 ? 110 : 176;
//     const withDL = allCards.filter(({ card }) => card.deadline && isValid(parseISO(card.deadline)));

//     return (
//       <div className="flex-1 overflow-auto px-2 sm:px-5 py-4" ref={containerRef} style={{scrollbarWidth:"none"}}>
//         <div className="bg-white border border-slate-200 rounded overflow-hidden" style={{minWidth: TASK_COL_W + days.length * dayWidth}}>
//           <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10">
//             <div className="shrink-0 px-3 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-200" style={{width:TASK_COL_W}}>Task</div>
//             <div className="flex overflow-hidden">
//               {days.map(d => (
//                 <div key={d.toISOString()} style={{minWidth:dayWidth,width:dayWidth}}
//                   className={`text-center py-2 border-r border-slate-100 ${isSameDay(d,today)?"bg-violet-50":""}`}>
//                   <div className={`text-[10px] font-bold leading-none ${isSameDay(d,today)?"text-violet-600":"text-slate-400"}`}>{format(d,"d")}</div>
//                   {(dayWidth>=26||d.getDate()%7===1) && <div className="text-[8px] text-slate-300 uppercase leading-none mt-0.5">{format(d,"MMM")}</div>}
//                 </div>
//               ))}
//             </div>
//           </div>
//           {withDL.length===0 && (
//             <div className="flex flex-col items-center py-14 text-slate-300"><GanttChartSquare size={24} className="mb-2"/><p className="text-[12px]">No tasks with deadlines</p></div>
//           )}
//           {withDL.map(({ card, col, ci }) => {
//             const dl     = parseISO(card.deadline);
//             const offset = Math.max(0, differenceInDays(dl, start));
//             const barW   = dayWidth < 26 ? 44 : 68;
//             const accent = getColAccent(ci);
//             return (
//               <div key={card._id?.toString()||card.localId} onClick={() => onEditCard(col._id?.toString()||col.localId, card)}
//                 className="flex border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer">
//                 <div className="shrink-0 px-2 sm:px-3 py-2.5 border-r border-slate-200 flex items-center gap-1.5 min-w-0" style={{width:TASK_COL_W}}>
//                   {card.completed ? <CheckCircle2 size={10} className="text-emerald-500 shrink-0"/> : <PriorityFlag priority={card.priority||"None"} size={10}/>}
//                   <span className={`text-[11px] font-semibold truncate ${card.completed?"line-through text-slate-400":"text-slate-700"}`}>{card.title}</span>
//                 </div>
//                 <div className="relative flex items-center" style={{width:days.length*dayWidth,minWidth:days.length*dayWidth}}>
//                   <div className="absolute top-0 bottom-0 w-px bg-violet-200" style={{left:differenceInDays(today,start)*dayWidth+dayWidth/2}}/>
//                   <div className={`absolute h-5 rounded flex items-center px-1.5 text-[9px] font-bold text-white truncate ${card.completed?"opacity-60":""}`}
//                     style={{left:Math.max(0,offset*dayWidth-barW+dayWidth/2),width:barW,backgroundColor:card.completed?"#10b981":accent}}>
//                     {dayWidth>=26 ? format(dl,"MMM d") : format(dl,"d")}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex-1 flex flex-col min-h-0">
//       <div className="shrink-0 flex items-center gap-0 px-5 pt-3 border-b border-slate-100">
//         {[
//           { key: "calendar", label: "Calendar", icon: <CalendarIcon size={11}/> },
//           { key: "timeline", label: "Timeline", icon: <GanttChartSquare size={11}/> },
//         ].map(t => (
//           <button type="button" key={t.key} onClick={() => setGanttTab(t.key)}
//             className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors
//               ${ganttTab===t.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
//             {t.icon}{t.label}
//           </button>
//         ))}
//       </div>
//       {ganttTab==="calendar" ? <CalendarSubView/> : <TimelineSubView/>}
//     </div>
//   );
// }

// // ─── Main Board ───────────────────────────────────────────────────────────────

// export default function KanbanBoard() {
//   const [columns, setColumns]     = useState([]);
//   const [loading, setLoading]     = useState(true);
//   const [viewMode, setViewMode]   = useState("board");
//   const [sortMode, setSortMode]   = useState("none");
//   const [sortOpen, setSortOpen]   = useState(false);
//   const [searchQuery, setSearch]  = useState("");
//   const [modal, setModal]         = useState(null);
//   const isDraggingRef             = useRef(false);
//   const saveTimerRef              = useRef(null);
//   const isInitRef                 = useRef(false);

//   // ── Load board ──
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await api.get("/kanban");
//         if (res.data.success && res.data.columns?.length > 0) {
//           setColumns(res.data.columns);
//         } else {
//           setColumns(DEFAULT_COLUMNS);
//         }
//       } catch {
//         setColumns(DEFAULT_COLUMNS);
//       } finally {
//         setLoading(false);
//         setTimeout(() => { isInitRef.current = true; }, 100);
//       }
//     })();
//   }, []);

//   // ── Auto-save with debounce ──
//   useEffect(() => {
//     if (!isInitRef.current || loading) return;
//     if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
//     saveTimerRef.current = setTimeout(async () => {
//       try {
//         await api.post("/kanban", { columns });
//       } catch (e) {
//         console.error("Failed to save board:", e);
//       }
//     }, 600);
//     return () => clearTimeout(saveTimerRef.current);
//   }, [columns, loading]);

//   // ── Auto-move overdue cards to Backlog ──
//   useEffect(() => {
//     if (loading) return;
//     const today = new Date(); today.setHours(0,0,0,0);
//     setColumns(prev => {
//       const backlog = prev.find(c => c.title.toLowerCase() === "backlog");
//       if (!backlog) return prev;
//       const bKey = backlog._id?.toString() || backlog.localId;
//       let changed = false;
//       const overdue = [];
//       const next = prev.map(col => {
//         const cKey = col._id?.toString()||col.localId;
//         if (cKey === bKey) return col;
//         const kept = [];
//         for (const card of col.items) {
//           if (card.completed || !card.deadline) { kept.push(card); continue; }
//           const dl = parseISO(card.deadline);
//           if (isValid(dl) && dl < today) { overdue.push(card); changed = true; }
//           else kept.push(card);
//         }
//         return kept.length !== col.items.length ? {...col, items: kept} : col;
//       });
//       if (!changed) return prev;
//       return next.map(col => {
//         const cKey = col._id?.toString()||col.localId;
//         if (cKey !== bKey) return col;
//         const ids = new Set(col.items.map(i => i._id?.toString()||i.localId));
//         return {...col, items: [...col.items, ...overdue.filter(c => !ids.has(c._id?.toString()||c.localId))]};
//       });
//     });
//   }, [loading]);

//   const isSearchActive = searchQuery.trim().length > 0;

//   const onDragEnd = useCallback((result) => {
//     isDraggingRef.current = true;
//     setTimeout(() => { isDraggingRef.current = false; }, 120);
//     const { source: s, destination: d, type } = result;
//     if (!d || (s.droppableId===d.droppableId && s.index===d.index)) return;

//     if (type === "board") {
//       setColumns(prev => { const n=[...prev]; const [m]=n.splice(s.index,1); n.splice(d.index,0,m); return n; });
//     } else {
//       setColumns(prev => {
//         const n = prev.map(c => ({...c, items:[...c.items]}));
//         const getCol = id => n.find(c => (c._id?.toString()||c.localId) === id);
//         const src = getCol(s.droppableId);
//         const dst = getCol(d.droppableId);
//         if (!src || !dst) return prev;
//         const [moved] = src.items.splice(s.index, 1);
//         dst.items.splice(d.index, 0, moved);
//         return n;
//       });
//     }
//   }, []);

//   const openAdd  = colId => setModal({ card: null, isNew: true, columnId: colId });
//   const openEdit = (colId, card) => {
//     if (isDraggingRef.current) return;
//     setModal({ card, isNew: false, columnId: colId });
//   };

//   const handleSave = (targetColId, card) => {
//     const srcId = modal?.columnId;
//     setColumns(prev => {
//       let n = prev.map(c => ({...c, items:[...c.items]}));
//       const getKey = col => col._id?.toString()||col.localId;
//       const cardKey = c => c._id?.toString()||c.localId;
//       const newCardKey = card._id?.toString()||card.localId;

//       // Remove from source if moving to different column
//       if (!modal?.isNew && srcId && srcId !== targetColId) {
//         n = n.map(c => getKey(c)===srcId ? {...c, items: c.items.filter(i => cardKey(i)!==newCardKey)} : c);
//       }
//       n = n.map(c => {
//         if (getKey(c) !== targetColId) return c;
//         const existing = c.items.find(i => cardKey(i)===newCardKey);
//         return {...c, items: existing ? c.items.map(i => cardKey(i)===newCardKey ? card : i) : [...c.items, card]};
//       });
//       return n;
//     });
//     setModal(null);
//   };

//   const handleMarkComplete = (srcColId, card) => {
//     const completedCard = {...card, completed: true};
//     setColumns(prev => {
//       const getKey = col => col._id?.toString()||col.localId;
//       const cardKey = c => c._id?.toString()||c.localId;
//       const doneCol = prev.find(c => c.title.toLowerCase()==="done") ?? prev[prev.length-1];
//       const doneKey = getKey(doneCol);
//       return prev.map(c => {
//         const ck = getKey(c);
//         if (ck===srcColId && ck!==doneKey) return {...c, items: c.items.filter(i => cardKey(i)!==cardKey(card))};
//         if (ck===doneKey && ck!==srcColId) {
//           const exists = c.items.some(i => cardKey(i)===cardKey(card));
//           return {...c, items: exists ? c.items.map(i => cardKey(i)===cardKey(card)?completedCard:i) : [...c.items, completedCard]};
//         }
//         if (ck===srcColId && ck===doneKey) return {...c, items: c.items.map(i => cardKey(i)===cardKey(card)?completedCard:i)};
//         return c;
//       });
//     });
//   };

//   const handleUndoComplete = card => {
//     const cardKey = c => c._id?.toString()||c.localId;
//     setColumns(prev => prev.map(col => ({...col, items: col.items.map(i => cardKey(i)===cardKey(card) ? {...card, completed:false} : i)})));
//   };

//   const handleDelete = (colId, cardId) => {
//     setColumns(prev => prev.map(c => {
//       const ck = c._id?.toString()||c.localId;
//       if (ck!==colId) return c;
//       return {...c, items: c.items.filter(i => (i._id?.toString()||i.localId)!==cardId)};
//     }));
//     setModal(null);
//   };

//   const handleDeleteColumn = id => setColumns(p => p.filter(c => (c._id?.toString()||c.localId)!==id));
//   const handleRenameColumn = (id, title) => setColumns(p => p.map(c => (c._id?.toString()||c.localId)===id ? {...c,title} : c));
//   const handleAddColumn    = () => setColumns(p => [...p, { localId: uid(), title: "New Status", items: [] }]);

//   const sortLabels = { none: "Default", priority: "Priority", deadline: "Deadline" };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full gap-3">
//         <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/>
//         <p className="text-slate-400 text-sm">Loading board…</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full w-full overflow-hidden bg-white font-sans" style={{scrollbarWidth:"none"}}>
//       <style>{`* { scrollbar-width: none; } *::-webkit-scrollbar { display: none; }`}</style>

//       {/* Header */}
//       <header className="shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 bg-white border-b border-slate-200 z-30 flex-wrap sm:flex-nowrap">
//         {/* View toggles */}
//         <div className="flex items-center border border-slate-200 rounded overflow-hidden shrink-0">
//           {[
//             { mode: "board", icon: <Trello size={12}/>, label: "Board" },
//             { mode: "list",  icon: <LayoutList size={12}/>, label: "List" },
//             { mode: "gantt", icon: <GanttChartSquare size={12}/>, label: "Gantt" },
//           ].map(v => (
//             <button type="button" key={v.mode} onClick={() => setViewMode(v.mode)}
//               className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all border-r last:border-r-0 border-slate-200 cursor-pointer
//                 ${viewMode===v.mode ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
//               {v.icon}<span className="hidden sm:inline">{v.label}</span>
//             </button>
//           ))}
//         </div>

//         {/* Search */}
//         <div className="relative flex-1 min-w-0">
//           <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
//           <input value={searchQuery} onChange={e => setSearch(e.target.value)} placeholder="Search tasks, tags…"
//             className="w-full pl-7 pr-7 py-1.5 rounded border border-slate-200 bg-slate-50 text-[12px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"/>
//           {searchQuery && (
//             <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={11}/></button>
//           )}
//         </div>

//         {/* Sort */}
//         <div className="relative shrink-0">
//           <button type="button" onClick={() => setSortOpen(v => !v)}
//             className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] font-bold uppercase tracking-wide transition-colors
//               ${sortMode!=="none" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>
//             <ArrowUpDown size={11}/><span className="hidden sm:inline">{sortLabels[sortMode]}</span>
//           </button>
//           {sortOpen && (
//             <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl w-40 p-1 z-50">
//               {["none","priority","deadline"].map(s => (
//                 <button type="button" key={s} onClick={() => { setSortMode(s); setSortOpen(false); }}
//                   className={`flex items-center gap-2 w-full px-2.5 py-2 rounded text-[11px] font-semibold hover:bg-slate-50 capitalize ${sortMode===s?"bg-slate-100 text-blue-600":"text-slate-600"}`}>
//                   {sortLabels[s]}{sortMode===s && <span className="ml-auto text-blue-600">✓</span>}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-2 shrink-0">
//           {isSearchActive && (
//             <motion.span initial={{opacity:0}} animate={{opacity:1}}
//               className="text-[9px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200 uppercase tracking-wide hidden sm:block">
//               Drag disabled
//             </motion.span>
//           )}
//           <button type="button" onClick={handleAddColumn}
//             className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-colors shrink-0 uppercase tracking-wide cursor-pointer">
//             <Plus size={12}/><span className="hidden sm:inline">Add Status</span><span className="sm:hidden">Add</span>
//           </button>
//         </div>
//       </header>

//       {/* Content */}
//       {viewMode==="board" && (
//         <div className="flex-1 min-h-0 overflow-auto px-3 sm:px-5 py-4 sm:py-5" style={{scrollbarWidth:"none"}}>
//           <DragDropContext onDragEnd={onDragEnd}>
//             {/* 4. FIXED: StrictModeDroppable for horizontal board as well */}
//             <StrictModeDroppable droppableId="board" direction="horizontal" type="board">
//               {provided => (
//                 <div ref={provided.innerRef} {...provided.droppableProps} className="flex items-start gap-3 sm:gap-4 w-max min-h-full">
//                   {columns.map((col, idx) => (
//                     <KanbanColumn key={col._id?.toString()||col.localId} column={col} colIndex={idx} index={idx}
//                       searchQuery={searchQuery} isSearchActive={isSearchActive} sortMode={sortMode}
//                       onAddCard={openAdd} onEditCard={openEdit}
//                       onDeleteColumn={handleDeleteColumn} onRenameColumn={handleRenameColumn}/>
//                   ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </StrictModeDroppable>
//           </DragDropContext>
//         </div>
//       )}
//       {viewMode==="list" && <ListView columns={columns} onEditCard={openEdit} onAddCard={openAdd} searchQuery={searchQuery} sortMode={sortMode}/>}
//       {viewMode==="gantt" && <GanttView columns={columns} onEditCard={openEdit}/>}

//       {/* Detail Panel */}
//       <AnimatePresence>
//         {modal && (
//           <CardDetailPanel
//             key={modal.card?._id||modal.card?.localId||"new"}
//             card={modal.card} isNew={modal.isNew} columnId={modal.columnId} columns={columns}
//             onSave={handleSave} onDelete={handleDelete} onClose={() => setModal(null)}
//             onMarkComplete={handleMarkComplete} onUndoComplete={handleUndoComplete}/>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }






import React, { useState, useEffect, useRef, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, Trash2, Search, X, Calendar as CalendarIcon, AlertCircle, Clock,
  CheckCircle2, Link2, FileText, ChevronDown, LayoutList, Trello,
  GanttChartSquare, MoreHorizontal, Paperclip, ChevronRight, Circle,
  ArrowLeft, Tag, User, MessageSquare, ExternalLink, RotateCcw,
  ArrowUpDown, Edit3, Eye,
} from "lucide-react";
import {
  format, differenceInDays, parseISO, isValid, addDays,
  eachDayOfInterval, isSameDay, startOfMonth, endOfMonth,
  eachWeekOfInterval, startOfWeek, endOfWeek, isSameMonth,
  getMonth, getYear, addMonths, subMonths,
} from "date-fns";
import axios from "axios";

// ─── API setup ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Fallback ID generator (no external npm package needed)
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const PRIORITY_CONFIG = {
  High:   { fill: "#ef4444", label: "High",   weight: 3 },
  Medium: { fill: "#f59e0b", label: "Medium", weight: 2 },
  Low:    { fill: "#38bdf8", label: "Low",    weight: 1 },
  None:   { fill: "#cbd5e1", label: "None",   weight: 0 },
};

const COL_ACCENTS = ["#64748b","#f97316","#3b82f6","#8b5cf6","#10b981","#ec4899"];
const getColAccent = idx => COL_ACCENTS[idx % COL_ACCENTS.length];

function PriorityFlag({ priority, size = 13 }) {
  const { fill } = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.None;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={priority === "None" ? "none" : fill}
      stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  );
}

function getDeadlineStatus(deadline) {
  if (!deadline) return null;
  const parsed = parseISO(deadline);
  if (!isValid(parsed)) return null;
  const days = differenceInDays(parsed, new Date());
  if (days < 0)  return { color: "text-red-500",  icon: <AlertCircle size={10}/>, date: format(parsed,"MMM d"), overdue: true  };
  if (days <= 3) return { color: "text-amber-500", icon: <Clock size={10}/>,        date: format(parsed,"MMM d"), overdue: false };
  return              { color: "text-slate-500",  icon: <CalendarIcon size={10}/>, date: format(parsed,"MMM d"), overdue: false };
}

function sortCards(items, sortMode) {
  if (sortMode === "none") return items;
  return [...items].sort((a, b) => {
    if (sortMode === "priority")
      return (PRIORITY_CONFIG[b.priority]?.weight ?? 0) - (PRIORITY_CONFIG[a.priority]?.weight ?? 0);
    if (sortMode === "deadline") {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return 0;
  });
}

// ─── STRICT MODE FIX ──────────────────────────────────────────────────────────
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

// ─── Simple date-picker ───────────────────────────────────────────────────────
function SimpleDatePicker({ value, onChange, onClose }) {
  const [month, setMonth] = useState(value && isValid(parseISO(value)) ? parseISO(value) : new Date());
  const monthStart = startOfMonth(month);
  const monthEnd   = endOfMonth(month);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
  const selected = value && isValid(parseISO(value)) ? parseISO(value) : null;

  return (
    <div className="absolute z-50 mt-1 bg-white border border-slate-200 rounded-md shadow-xl p-3 w-64" style={{ top: "100%", left: 0 }}>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => setMonth(m => subMonths(m,1))} className="p-1 hover:bg-slate-100 rounded text-slate-500">‹</button>
        <span className="text-[12px] font-bold text-slate-700">{format(month,"MMMM yyyy")}</span>
        <button type="button" onClick={() => setMonth(m => addMonths(m,1))} className="p-1 hover:bg-slate-100 rounded text-slate-500">›</button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-center text-[9px] font-bold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      {weeks.map((wk, wi) => {
        const days = eachDayOfInterval({ start: wk, end: endOfWeek(wk,{weekStartsOn:0}) });
        return (
          <div key={wi} className="grid grid-cols-7">
            {days.map((day,di) => {
              const inMonth = isSameMonth(day, month);
              const isToday = isSameDay(day, new Date());
              const isSel   = selected && isSameDay(day, selected);
              return (
                <button type="button" key={di} onClick={() => { onChange(format(day,"yyyy-MM-dd")); onClose(); }}
                  className={`text-center text-[11px] py-1 rounded-full mx-0.5 transition-colors
                    ${!inMonth ? "text-slate-300" : isToday ? "text-blue-600 font-bold" : "text-slate-700"}
                    ${isSel ? "bg-blue-600 !text-white font-bold" : "hover:bg-slate-100"}`}>
                  {format(day,"d")}
                </button>
              );
            })}
          </div>
        );
      })}
      {value && (
        <button type="button" onClick={() => { onChange(""); onClose(); }}
          className="mt-2 w-full text-[10px] text-red-400 hover:text-red-600 font-semibold">
          Clear date
        </button>
      )}
    </div>
  );
}

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");
  const commit = val => {
    const t = val.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };
  return (
    <div className="flex flex-wrap gap-1.5 p-2 rounded border border-slate-200 bg-slate-50 min-h-[38px]">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200 uppercase tracking-wide">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="text-violet-400 hover:text-red-500">
            <X size={9}/>
          </button>
        </span>
      ))}
      <input value={input}
        onChange={e => { const v=e.target.value; if(v.endsWith(",")){ commit(v.slice(0,-1)); }else setInput(v); }}
        onKeyDown={e => { if(e.key==="Enter"||e.key===","){ e.preventDefault(); commit(input); } else if(e.key==="Backspace"&&input===""&&tags.length>0) onChange(tags.slice(0,-1)); }}
        placeholder={tags.length===0?"Add tags (Enter or comma)…":""}
        className="flex-1 min-w-[120px] bg-transparent text-[12px] text-slate-700 placeholder-slate-300 focus:outline-none"/>
    </div>
  );
}

// ─── Card Detail Panel ────────────────────────────────────────────────────────
function CardDetailPanel({ card, isNew, columnId, columns, onSave, onDelete, onClose, onMarkComplete, onUndoComplete }) {
  const [editMode, setEditMode]     = useState(isNew);
  const [title, setTitle]           = useState(card?.title ?? "");
  const [description, setDesc]      = useState(card?.description ?? "");
  const [notes, setNotes]           = useState(card?.notes ?? "");
  const [priority, setPriority]     = useState(card?.priority ?? "None");
  const [deadline, setDeadline]     = useState(card?.deadline ?? "");
  const [links, setLinks]           = useState(card?.links ?? []);
  const [comments, setComments]     = useState(card?.comments ?? []);
  const [tags, setTags]             = useState(card?.tags ?? []);
  const [selectedCol, setSelCol]    = useState(columnId);
  const [commentText, setComText]   = useState("");
  const [activeTab, setActiveTab]   = useState("details");
  const [deleteConfirm, setDelConf] = useState(false);
  const [completeConf, setCompConf] = useState(false);
  const [undoConf, setUndoConf]     = useState(false);
  const [priorityOpen, setPriOpen]  = useState(false);
  const [calOpen, setCalOpen]       = useState(false);

  const isCompleted = card?.completed ?? false;
  const ds = getDeadlineStatus(deadline);
  const colForCard = columns.find(c => c.id === columnId);
  const colIdx = columns.findIndex(c => c.id === columnId);
  const accent = getColAccent(colIdx);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(selectedCol, {
      id: card?.id ?? uid(),
      title: title.trim(), description, notes,
      priority, deadline, links, comments, tags, completed: isCompleted
    });
  };

  const handleComplete = () => {
    if (!title.trim()) return;
    onMarkComplete(columnId, { ...card, title: title.trim(), description, notes, priority, deadline, links, comments, tags, completed: true });
    onClose();
  };

  const handleUndoComplete = () => {
    if (!card) return;
    onUndoComplete({ ...card, completed: false });
    onClose();
  };

  const addLink    = () => setLinks(p => [...p, { id: uid(), title: "", url: "" }]);
  const updateLink = (id, f, v) => setLinks(p => p.map(l => l.id===id ? {...l,[f]:v} : l));
  const removeLink = id => setLinks(p => p.filter(l => l.id!==id));
 
  const addComment = () => {
    if (!commentText.trim()) return;
    setComments(p => [...p, { id: uid(), text: commentText.trim(), timestamp: new Date().toISOString() }]);
    setComText("");
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose}/>
      <motion.div className="w-full sm:max-w-[420px] h-full bg-white flex flex-col border-l border-slate-200 shadow-2xl"
        initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}}
        transition={{type:"spring",stiffness:400,damping:36}}
        style={{scrollbarWidth:"none"}}>
        {/* Top bar */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-white">
          <button type="button" onClick={onClose} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors">
            <ArrowLeft size={12}/> Back
          </button>
          <div className="flex-1"/>
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-white" style={{backgroundColor:accent}}>
            {colForCard?.title ?? ""}
          </span>
          <div className="flex items-center gap-1">
            {!isNew && (
              <button type="button" onClick={() => setEditMode(v => !v)}
                className={`p-1.5 rounded transition-colors ${editMode ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
                title={editMode ? "View mode" : "Edit card"}>
                {editMode ? <Eye size={12}/> : <Edit3 size={12}/>}
              </button>
            )}
            {!isNew && (deleteConfirm
              ? <div className="flex items-center gap-1">
                  <span className="text-[10px] text-red-500 font-semibold">Delete?</span>
                  <button type="button" onClick={() => { onDelete(columnId, card.id); onClose(); }} className="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold hover:bg-red-600">Yes</button>
                  <button type="button" onClick={() => setDelConf(false)} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200">No</button>
                </div>
              : <button type="button" onClick={() => setDelConf(true)} className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={12}/></button>
            )}
            <button type="button" onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X size={13}/></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 flex border-b border-slate-100 px-4 bg-white">
          {["details","links"].map(tab => (
            <button type="button" key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide capitalize transition-colors border-b-2 -mb-px
                ${activeTab===tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              {tab}
              {tab==="links" && links.length>0 && <span className="ml-1.5 text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-black">{links.length}</span>}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:"none"}}>
          {activeTab==="details" && (
            <div className="px-5 py-5 space-y-5">
              {isCompleted && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0"/>
                  <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest flex-1">Completed</p>
                  {undoConf
                    ? <div className="flex items-center gap-1">
                        <button type="button" onClick={handleUndoComplete} className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600">Undo</button>
                        <button type="button" onClick={() => setUndoConf(false)} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200">Keep</button>
                      </div>
                    : <button type="button" onClick={() => setUndoConf(true)} className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-amber-600 px-2 py-1 rounded hover:bg-amber-50">
                        <RotateCcw size={10}/> Undo
                      </button>
                  }
                </div>
              )}

              {!editMode && !isNew
                ? <div className="space-y-4">
                    <h2 className={`text-[18px] font-black leading-tight text-slate-900 ${isCompleted?"line-through text-slate-400":""}`}>
                      {title || <span className="text-slate-300 italic font-normal">Untitled</span>}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200">
                        <PriorityFlag priority={priority} size={11}/>
                        <span className="text-[11px] font-semibold text-slate-600">{PRIORITY_CONFIG[priority]?.label}</span>
                      </div>
                      {deadline && ds && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] font-semibold ${ds.overdue?"bg-red-50 border-red-200 text-red-600":"bg-slate-50 border-slate-200 text-slate-600"}`}>
                          {ds.icon} {ds.date}
                        </div>
                      )}
                    </div>
                    {tags.length>0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200 uppercase tracking-wide">{tag}</span>
                        ))}
                      </div>
                    )}
                    {description && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</p>
                        <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">{description}</p>
                      </div>
                    )}
                    {notes && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><FileText size={9}/> Notes</p>
                        <p className="text-[13px] text-slate-500 leading-relaxed whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded px-3 py-2.5">{notes}</p>
                      </div>
                    )}
                    {comments.length>0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MessageSquare size={9}/> Comments ({comments.length})</p>
                        {comments.map(c => (
                          <div key={c.id} className="flex gap-2 items-start">
                            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><User size={11} className="text-violet-600"/></div>
                            <div className="flex-1 bg-slate-50 border border-slate-100 rounded p-2.5">
                              <p className="text-[12px] text-slate-700 whitespace-pre-wrap">{c.text}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block">{c.timestamp && isValid(parseISO(c.timestamp)) ? format(parseISO(c.timestamp),"MMM d, h:mm a") : "Just now"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" onClick={() => setEditMode(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded border border-dashed border-slate-200 text-[11px] font-bold text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-wide">
                      <Edit3 size={11}/> Edit this card
                    </button>
                  </div>

                : <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">
                        #{(card?.id || "NEW").toString().slice(-6).toUpperCase()}
                      </span>
                      <select value={selectedCol} onChange={e => setSelCol(e.target.value)}
                        className="text-[11px] font-semibold bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                        {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    <input autoFocus={isNew} value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title…"
                      className="w-full text-[17px] font-black text-slate-900 bg-transparent border-0 border-b-2 border-slate-100 focus:border-blue-500 focus:outline-none pb-2 placeholder-slate-300 transition-colors leading-tight"/>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority</p>
                        <div className="relative">
                          <button type="button" onClick={() => setPriOpen(v => !v)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                            <PriorityFlag priority={priority} size={11}/>
                            <span className="text-slate-700 text-[12px] font-semibold">{PRIORITY_CONFIG[priority]?.label}</span>
                            <ChevronDown size={10} className="ml-auto text-slate-400"/>
                          </button>
                          {priorityOpen && (
                            <div className="absolute z-50 mt-1 bg-white border border-slate-200 rounded shadow-xl w-full p-1">
                              {["High","Medium","Low","None"].map(p => (
                                <button type="button" key={p} onClick={() => { setPriority(p); setPriOpen(false); }}
                                  className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-[11px] font-medium hover:bg-slate-50 transition-colors ${priority===p?"bg-slate-100":""}`}>
                                  <PriorityFlag priority={p} size={11}/><span className="text-slate-700">{PRIORITY_CONFIG[p].label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</p>
                        <div className="relative">
                          <button type="button" onClick={() => setCalOpen(v => !v)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-[12px] text-left transition-colors">
                            <CalendarIcon size={11} className="text-slate-400 shrink-0"/>
                            <span className={deadline ? "text-slate-700" : "text-slate-400"}>
                              {deadline && isValid(parseISO(deadline)) ? format(parseISO(deadline),"MMM d, yyyy") : "Pick date"}
                            </span>
                          </button>
                          {calOpen && <SimpleDatePicker value={deadline} onChange={setDeadline} onClose={() => setCalOpen(false)}/>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
                      <textarea value={description} onChange={e => setDesc(e.target.value)}
                        placeholder="What needs to be done?" rows={3}
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none leading-relaxed"/>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><FileText size={9}/> Notes</p>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Extended context, sub-tasks…" rows={3}
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-300 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"/>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Tag size={9}/> Tags</p>
                      <TagInput tags={tags} onChange={setTags}/>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1"><MessageSquare size={9}/> Comments</p>
                      {comments.length>0 && (
                        <div className="space-y-3 mb-4">
                          {comments.map(c => (
                            <div key={c.id} className="flex gap-2 items-start group">
                              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><User size={11} className="text-violet-600"/></div>
                              <div className="flex-1 bg-slate-50 border border-slate-100 rounded p-2.5">
                                <p className="text-[12px] text-slate-700 whitespace-pre-wrap">{c.text}</p>
                                <span className="text-[9px] text-slate-400 mt-1.5 block">{c.timestamp && isValid(parseISO(c.timestamp)) ? format(parseISO(c.timestamp),"MMM d, h:mm a") : "Just now"}</span>
                              </div>
                              <button type="button" onClick={() => setComments(p => p.filter(x => x.id !== c.id))}
                                className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={11}/></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 items-start">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 border border-blue-500"><User size={11} className="text-blue-600"/></div>
                        <div className="flex-1 flex flex-col gap-2">
                          <textarea value={commentText} onChange={e => setComText(e.target.value)}
                            placeholder="Add a comment…" rows={2}
                            className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 text-[12px] text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"/>
                          <button type="button" onClick={addComment} disabled={!commentText.trim()}
                            className="self-end px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              }
            </div>
          )}

          {activeTab==="links" && (
            <div className="px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Links & Files</p>
                <button type="button" onClick={addLink} className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition-colors"><Plus size={11}/> Add</button>
              </div>
              <AnimatePresence>
                {links.map(link => (
                  <motion.div key={link.id} initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="mb-2">
                    <div className="flex items-center gap-2 p-2.5 rounded border border-slate-200 bg-slate-50 group hover:border-slate-300">
                      <ExternalLink size={11} className="text-slate-400 shrink-0"/>
                      <input value={link.title} onChange={e => updateLink(link.id,"title",e.target.value)} placeholder="Label" className="flex-1 min-w-0 bg-transparent text-[12px] text-slate-700 placeholder-slate-300 focus:outline-none"/>
                      <input value={link.url} onChange={e => updateLink(link.id,"url",e.target.value)} placeholder="https://…" className="flex-[2] min-w-0 bg-transparent text-[12px] text-slate-500 placeholder-slate-300 focus:outline-none"/>
                      <button type="button" onClick={() => removeLink(link.id)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={11}/></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {links.length===0 && (
                <div className="flex flex-col items-center py-12 text-slate-300"><Link2 size={24} className="mb-2"/><p className="text-[12px]">No links yet</p></div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-3 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
          {!isNew && !isCompleted && (
            completeConf
              ? <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-600 font-semibold">Mark complete?</span>
                  <button type="button" onClick={handleComplete} className="px-2 py-1 rounded bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600">Yes</button>
                  <button type="button" onClick={() => setCompConf(false)} className="px-2 py-1 rounded bg-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-300">No</button>
                </div>
              : <button type="button" onClick={() => setCompConf(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100">
                  <CheckCircle2 size={12}/> Mark Complete
                </button>
          )}
          {(isNew || isCompleted) && <div/>}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded text-[12px] font-semibold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
            {(editMode || isNew) && (
              <button type="button" onClick={handleSave} disabled={!title.trim()}
                className="px-4 py-1.5 rounded text-[12px] font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {isNew ? "Create Task" : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────
function KanbanCard({ card, index, colIndex, searchQuery, isSearchActive, onClick }) {
  const ds = getDeadlineStatus(card.deadline);
  const q  = searchQuery.toLowerCase();
  const matches = !isSearchActive ||
    card.title.toLowerCase().includes(q) ||
    (card.description||"").toLowerCase().includes(q) ||
    (card.tags??[]).some(t => t.toLowerCase().includes(q));
  const accent = getColAccent(colIndex);

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={isSearchActive}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
          onClick={onClick}
          style={{
            ...provided.draggableProps.style,
            display: matches ? undefined : "none",
            borderRadius: "4px",
            borderLeft: `3px solid ${accent}`,
            borderTop: "1px solid #e2e8f0",
            borderRight: "1px solid #e2e8f0",
            borderBottom: "1px solid #e2e8f0",
            transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} rotate(0.5deg)` : provided.draggableProps.style?.transform,
          }}
          className={`bg-white cursor-pointer select-none transition-all duration-100 relative overflow-hidden
            ${snapshot.isDragging ? "shadow-xl" : "hover:shadow-md"}
            ${card.completed ? "opacity-90" : ""}`}>
          {card.completed && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
              <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(135deg,transparent,transparent 18px,rgba(16,185,129,0.04) 18px,rgba(16,185,129,0.04) 20px)"}}/>
              <span style={{transform:"rotate(-28deg)",fontSize:"13px",fontWeight:900,letterSpacing:"0.35em",whiteSpace:"nowrap",color:"#10b981",opacity:0.18,userSelect:"none",textTransform:"uppercase",fontFamily:"monospace",border:"2.5px solid #10b981",padding:"2px 10px",borderRadius:"2px"}}>✓ DONE</span>
            </div>
          )}
          <div className="p-3">
            {(card.tags?.length??0)>0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {card.tags.slice(0,3).map(tag => (
                  <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200 uppercase tracking-wide">{tag}</span>
                ))}
              </div>
            )}
            <div className="flex items-start gap-1.5">
              {card.completed && <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5"/>}
              <p className={`text-[13px] font-semibold leading-snug mb-1.5 ${card.completed?"line-through text-slate-400":"text-slate-800"}`}>{card.title}</p>
            </div>
            {card.description && <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-2">{card.description}</p>}
            <div className="flex items-center justify-between gap-1 pt-2 mt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {ds && <span className={`flex items-center gap-1 text-[10px] font-semibold ${ds.color}`}>{ds.icon}{ds.date}</span>}
                <div className="flex items-center gap-2 text-slate-400">
                  {(card.comments?.length??0)>0 && <span className="flex items-center gap-0.5 text-[10px]"><MessageSquare size={10}/>{card.comments.length}</span>}
                  {(card.links?.length??0)>0 && <span className="flex items-center gap-0.5 text-[10px]"><Paperclip size={10}/>{card.links.length}</span>}
                </div>
              </div>
              <PriorityFlag priority={card.priority||"None"} size={11}/>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
function KanbanColumn({ column, colIndex, index, searchQuery, isSearchActive, sortMode, onAddCard, onEditCard, onDeleteColumn, onRenameColumn }) {
  const [hovered, setHovered]           = useState(false);
  const [deleteConfirm, setDelConf]     = useState(false);
  const [editingTitle, setEditTitle]    = useState(false);
  const [titleVal, setTitleVal]         = useState(column.title);
  const accent = getColAccent(colIndex);
  const sortedItems = sortCards(column.items, sortMode);

  const commitTitle = () => {
    setEditTitle(false);
    if (titleVal.trim()) onRenameColumn(column.id, titleVal.trim());
    else setTitleVal(column.title);
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}
          className={`flex flex-col w-[260px] shrink-0 border border-slate-200 bg-slate-50/50 rounded-md p-2 transition-all duration-150 ${snapshot.isDragging?"opacity-95 rotate-[0.3deg] shadow-lg bg-white":""}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setDelConf(false); }}>
          {/* Header */}
          <div {...provided.dragHandleProps}
            className="flex items-center gap-2 px-3 py-2 mb-2 bg-white border border-slate-200 rounded cursor-grab active:cursor-grabbing shadow-sm"
            style={{borderTop:`2px solid ${accent}`}}>
            {editingTitle
              ? <input autoFocus value={titleVal} onChange={e => setTitleVal(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={e => { if(e.key==="Enter") commitTitle(); if(e.key==="Escape"){ setTitleVal(column.title); setEditTitle(false); } }}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  onTouchStart={e => e.stopPropagation()}
                  className="flex-1 min-w-0 bg-transparent text-[12px] font-bold text-slate-800 focus:outline-none"/>
              : <span className="text-[12px] font-bold text-slate-700 flex-1 truncate cursor-text uppercase tracking-wide"
                  onDoubleClick={() => setEditTitle(true)}>{column.title}</span>
            }
            <span className="text-[10px] font-bold text-white shrink-0 px-1.5 py-0.5 rounded" style={{backgroundColor:accent}}>{column.items.length}</span>
            <AnimatePresence>
              {hovered && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  className="flex items-center gap-0.5 relative z-10 cursor-default"
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()} 
                  onTouchStart={e => e.stopPropagation()}>
                  <button type="button" onClick={() => onAddCard(column.id)} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"><Plus size={12}/></button>
                  {deleteConfirm
                    ? <>
                        <button type="button" onClick={() => onDeleteColumn(column.id)} className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold cursor-pointer">Del</button>
                        <button type="button" onClick={() => setDelConf(false)} className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer">No</button>
                      </>
                    : <button type="button" onClick={() => setDelConf(true)} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"><MoreHorizontal size={12}/></button>
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Drop zone */}
          <StrictModeDroppable droppableId={column.id} type="card">
            {(drop, dropSnap) => (
              <div ref={drop.innerRef} {...drop.droppableProps}
                className={`flex-1 space-y-2 min-h-[60px] p-1 rounded transition-colors duration-100 ${dropSnap.isDraggingOver?"bg-violet-50":""}`}>
                {sortedItems.map((card, i) => (
                  <KanbanCard key={card.id} card={card} index={i} colIndex={colIndex}
                    searchQuery={searchQuery} isSearchActive={isSearchActive}
                    onClick={() => onEditCard(column.id, card)}/>
                ))}
                {drop.placeholder}
              </div>
            )}
          </StrictModeDroppable>

          <button type="button" 
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            onClick={() => onAddCard(column.id)}
            className="cursor-pointer relative z-10 flex items-center gap-1.5 mt-2 px-3 py-2 rounded text-[11px] font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-dashed border-slate-200 hover:border-slate-300 transition-all uppercase tracking-wide">
            <Plus size={11}/> Add task
          </button>
        </div>
      )}
    </Draggable>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
function ListView({ columns, onEditCard, onAddCard, searchQuery, sortMode }) {
  const [expanded, setExpanded] = useState(() => Object.fromEntries(columns.map(c => [c.id, true])));
  const q = searchQuery.toLowerCase();

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-5 py-4 space-y-1.5" style={{scrollbarWidth:"none"}}>
      {columns.map((col, ci) => {
        const accent = getColAccent(ci);
        const isOpen = expanded[col.id] !== false;
        const sortedItems = sortCards(col.items, sortMode);
        const filteredItems = q ? sortedItems.filter(c => c.title.toLowerCase().includes(q)||(c.description||"").toLowerCase().includes(q)||(c.tags??[]).some(t=>t.toLowerCase().includes(q))) : sortedItems;

        return (
          <div key={col.id} className="bg-white border border-slate-200 rounded overflow-hidden">
            <button type="button" onClick={() => setExpanded(p => ({...p,[col.id]:!isOpen}))}
              className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-2.5 hover:bg-slate-50 transition-colors border-l-2"
              style={{borderLeftColor:accent}}>
              <span className="text-[11px] font-bold text-slate-700 flex-1 text-left uppercase tracking-wide">{col.title}</span>
              <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{backgroundColor:accent}}>{col.items.length}</span>
              <ChevronRight size={12} className={`text-slate-400 transition-transform ${isOpen?"rotate-90":""}`}/>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden">
                  {filteredItems.length>0 && (
                    <div className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_90px] gap-3 px-4 py-1.5 border-t border-slate-100 bg-slate-50">
                      {["Task","Deadline","Priority","Status"].map(h => (
                        <span key={h} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{h}</span>
                      ))}
                    </div>
                  )}
                  {filteredItems.map(card => {
                    const ds = getDeadlineStatus(card.deadline);
                    return (
                      <div key={card.id} onClick={() => onEditCard(col.id, card)}
                        className="relative overflow-hidden border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                        {card.completed && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em] select-none"
                              style={{transform:"rotate(-8deg)",opacity:0.15,whiteSpace:"nowrap"}}>✓ DONE ✓ DONE ✓ DONE ✓ DONE</span>
                          </div>
                        )}
                        <div className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_90px] gap-3 px-4 py-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            {card.completed ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0"/> : <Circle size={11} className="text-slate-300 shrink-0 group-hover:text-violet-400 transition-colors"/>}
                            <div className="min-w-0">
                              <span className={`block text-[12px] font-semibold truncate ${card.completed?"line-through text-slate-400":"text-slate-700"}`}>{card.title}</span>
                              {(card.tags?.length??0)>0 && (
                                <div className="flex gap-1 mt-0.5 flex-wrap">
                                  {card.tags.slice(0,2).map(t => <span key={t} className="text-[8px] font-bold px-1 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-100 uppercase">{t}</span>)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {ds && card.deadline ? <span className={`flex items-center gap-1 text-[10px] font-semibold ${ds.color}`}>{ds.icon}{ds.date}</span> : <span className="text-[10px] text-slate-300">—</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <PriorityFlag priority={card.priority||"None"} size={10}/>
                            <span className="text-[10px] text-slate-500">{PRIORITY_CONFIG[card.priority||"None"]?.label}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white truncate uppercase tracking-wide" style={{backgroundColor:accent}}>{col.title}</span>
                          </div>
                        </div>
                        <div className="sm:hidden grid grid-cols-[1fr_auto] gap-2 px-3 py-2.5 items-center">
                          <div className="flex items-center gap-2 min-w-0">
                            {card.completed ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0"/> : <Circle size={11} className="text-slate-300 shrink-0"/>}
                            <div className="min-w-0">
                              <span className={`block text-[12px] font-semibold truncate ${card.completed?"line-through text-slate-400":"text-slate-700"}`}>{card.title}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <PriorityFlag priority={card.priority||"None"} size={9}/>
                                <span className="text-[9px] font-bold px-1 py-0.5 rounded text-white uppercase" style={{backgroundColor:accent}}>{col.title}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center shrink-0">
                            {ds && card.deadline ? <span className={`flex items-center gap-1 text-[10px] font-semibold ${ds.color}`}>{ds.icon}{ds.date}</span> : <span className="text-[10px] text-slate-300">—</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => onAddCard(col.id)}
                    className="w-full flex items-center gap-1.5 px-3 sm:px-4 py-2 border-t border-slate-100 text-[11px] font-semibold text-slate-400 hover:text-violet-600 hover:bg-violet-50/30 transition-colors uppercase tracking-wide cursor-pointer relative z-10">
                    <Plus size={11}/> Add task
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Gantt / Calendar View ────────────────────────────────────────────────────
function GanttView({ columns, onEditCard }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [ganttTab, setGanttTab] = useState("calendar");
  const allCards = columns.flatMap((col, ci) => col.items.map(card => ({ card, col, ci })));

  const CalendarSubView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd   = endOfMonth(currentMonth);
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
    const getCardsForDay = day => allCards.filter(({ card }) => {
      if (!card.deadline) return false;
      const dl = parseISO(card.deadline);
      return isValid(dl) && isSameDay(dl, day);
    });
    return (
      <div className="flex-1 overflow-y-auto px-2 sm:px-5 py-4" style={{scrollbarWidth:"none"}}>
        <div className="flex items-center justify-between mb-4 bg-white border border-slate-200 rounded px-4 py-2.5">
          <button type="button" onClick={() => setCurrentMonth(m => subMonths(m,1))} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100">◀</button>
          <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">{format(currentMonth,"MMMM yyyy")}</h2>
          <button type="button" onClick={() => setCurrentMonth(m => addMonths(m,1))} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100">▶</button>
        </div>
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-100">{d}</div>
            ))}
          </div>
          {weeks.map((weekStart, wi) => {
            const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart,{weekStartsOn:0}) });
            return (
              <div key={wi} className="grid grid-cols-7 border-b last:border-b-0 border-slate-100">
                {weekDays.map((day, di) => {
                  const inMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const dayCards = getCardsForDay(day);
                  return (
                    <div key={di} className={`min-h-[80px] sm:min-h-[100px] p-1.5 border-r last:border-r-0 border-slate-100 ${!inMonth?"bg-slate-50/50":isToday?"bg-blue-50":"bg-white"}`}>
                      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black mb-1 leading-none ${isToday?"bg-blue-600 text-white":inMonth?"text-slate-700":"text-slate-300"}`}>{format(day,"d")}</div>
                      <div className="space-y-0.5">
                        {dayCards.slice(0,3).map(({ card, col, ci }) => (
                          <button type="button" key={card.id} onClick={() => onEditCard(col.id, card)}
                            className="w-full text-left px-1.5 py-0.5 rounded text-[9px] font-bold text-white truncate hover:opacity-80 cursor-pointer"
                            style={{backgroundColor: card.completed ? "#10b981" : getColAccent(ci)}}>
                            {card.completed&&"✓ "}{card.title}
                          </button>
                        ))}
                        {dayCards.length>3 && <div className="text-[9px] text-slate-400 font-bold px-1">+{dayCards.length-3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">All deadlines in {format(currentMonth,"MMMM")}</p>
          {allCards
            .filter(({ card }) => { if(!card.deadline) return false; const dl=parseISO(card.deadline); return isValid(dl)&&getMonth(dl)===getMonth(currentMonth)&&getYear(dl)===getYear(currentMonth); })
            .sort((a,b) => new Date(a.card.deadline)-new Date(b.card.deadline))
            .map(({ card, col, ci }) => {
              const acc = getColAccent(ci);
              const ds = getDeadlineStatus(card.deadline);
              return (
                <div key={card.id} onClick={() => onEditCard(col.id, card)}
                  className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 cursor-pointer group">
                  <div className="w-1.5 h-8 rounded-full shrink-0" style={{backgroundColor: card.completed ? "#10b981" : acc}}/>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-semibold truncate ${card.completed?"line-through text-slate-400":"text-slate-700"}`}>{card.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded uppercase" style={{backgroundColor:acc}}>{col.title}</span>
                      <PriorityFlag priority={card.priority||"None"} size={9}/>
                    </div>
                  </div>
                  {ds && <span className={`flex items-center gap-1 text-[10px] font-semibold ${ds.color} shrink-0`}>{ds.icon}{ds.date}</span>}
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const TimelineSubView = () => {
    const today = new Date();
    const start = addDays(today, -5);
    const end   = addDays(today, 28);
    const days  = eachDayOfInterval({ start, end });
    const containerRef = useRef(null);
    const [dayWidth, setDayWidth] = useState(32);

    useEffect(() => {
      const update = () => {
        if (containerRef.current) {
          const w = containerRef.current.clientWidth;
          setDayWidth(w < 480 ? 22 : w < 768 ? 26 : 32);
        }
      };
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }, []);

    const TASK_COL_W = dayWidth < 26 ? 110 : 176;
    const withDL = allCards.filter(({ card }) => card.deadline && isValid(parseISO(card.deadline)));

    return (
      <div className="flex-1 overflow-auto px-2 sm:px-5 py-4" ref={containerRef} style={{scrollbarWidth:"none"}}>
        <div className="bg-white border border-slate-200 rounded overflow-hidden" style={{minWidth: TASK_COL_W + days.length * dayWidth}}>
          <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="shrink-0 px-3 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-200" style={{width:TASK_COL_W}}>Task</div>
            <div className="flex overflow-hidden">
              {days.map(d => (
                <div key={d.toISOString()} style={{minWidth:dayWidth,width:dayWidth}}
                  className={`text-center py-2 border-r border-slate-100 ${isSameDay(d,today)?"bg-violet-50":""}`}>
                  <div className={`text-[10px] font-bold leading-none ${isSameDay(d,today)?"text-violet-600":"text-slate-400"}`}>{format(d,"d")}</div>
                  {(dayWidth>=26||d.getDate()%7===1) && <div className="text-[8px] text-slate-300 uppercase leading-none mt-0.5">{format(d,"MMM")}</div>}
                </div>
              ))}
            </div>
          </div>
          {withDL.length===0 && (
            <div className="flex flex-col items-center py-14 text-slate-300"><GanttChartSquare size={24} className="mb-2"/><p className="text-[12px]">No tasks with deadlines</p></div>
          )}
          {withDL.map(({ card, col, ci }) => {
            const dl     = parseISO(card.deadline);
            const offset = Math.max(0, differenceInDays(dl, start));
            const barW   = dayWidth < 26 ? 44 : 68;
            const accent = getColAccent(ci);
            return (
              <div key={card.id} onClick={() => onEditCard(col.id, card)}
                className="flex border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer">
                <div className="shrink-0 px-2 sm:px-3 py-2.5 border-r border-slate-200 flex items-center gap-1.5 min-w-0" style={{width:TASK_COL_W}}>
                  {card.completed ? <CheckCircle2 size={10} className="text-emerald-500 shrink-0"/> : <PriorityFlag priority={card.priority||"None"} size={10}/>}
                  <span className={`text-[11px] font-semibold truncate ${card.completed?"line-through text-slate-400":"text-slate-700"}`}>{card.title}</span>
                </div>
                <div className="relative flex items-center" style={{width:days.length*dayWidth,minWidth:days.length*dayWidth}}>
                  <div className="absolute top-0 bottom-0 w-px bg-violet-200" style={{left:differenceInDays(today,start)*dayWidth+dayWidth/2}}/>
                  <div className={`absolute h-5 rounded flex items-center px-1.5 text-[9px] font-bold text-white truncate ${card.completed?"opacity-60":""}`}
                    style={{left:Math.max(0,offset*dayWidth-barW+dayWidth/2),width:barW,backgroundColor:card.completed?"#10b981":accent}}>
                    {dayWidth>=26 ? format(dl,"MMM d") : format(dl,"d")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center gap-0 px-5 pt-3 border-b border-slate-100">
        {[
          { key: "calendar", label: "Calendar", icon: <CalendarIcon size={11}/> },
          { key: "timeline", label: "Timeline", icon: <GanttChartSquare size={11}/> },
        ].map(t => (
          <button type="button" key={t.key} onClick={() => setGanttTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors
              ${ganttTab===t.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      {ganttTab==="calendar" ? <CalendarSubView/> : <TimelineSubView/>}
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const [columns, setColumns]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [viewMode, setViewMode]   = useState("board");
  const [sortMode, setSortMode]   = useState("none");
  const [sortOpen, setSortOpen]   = useState(false);
  const [searchQuery, setSearch]  = useState("");
  const [modal, setModal]         = useState(null);
  const isDraggingRef             = useRef(false);
  const saveTimerRef              = useRef(null);
  const isInitRef                 = useRef(false);

  // ── Load board ──
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/tasks");
        if (res.data.success && res.data.columns?.length > 0) {
          setColumns(res.data.columns);
        } else {
          setColumns(DEFAULT_COLUMNS);
        }
      } catch {
        setColumns(DEFAULT_COLUMNS);
      } finally {
        setLoading(false);
        setTimeout(() => { isInitRef.current = true; }, 100);
      }
    })();
  }, []);

  // ── Auto-save with debounce ──
  useEffect(() => {
    if (!isInitRef.current || loading) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.post("/tasks", { columns });
      } catch (e) {
        console.error("Failed to save board:", e);
      }
    }, 600);
    return () => clearTimeout(saveTimerRef.current);
  }, [columns, loading]);

  // ── Auto-move overdue cards to Backlog ──
  useEffect(() => {
    if (loading) return;
    const today = new Date(); today.setHours(0,0,0,0);
    setColumns(prev => {
      const backlog = prev.find(c => c.title.toLowerCase() === "backlog");
      if (!backlog) return prev;
      let changed = false;
      const overdue = [];
      const next = prev.map(col => {
        if (col.id === backlog.id) return col;
        const kept = [];
        for (const card of col.items) {
          if (card.completed || !card.deadline) { kept.push(card); continue; }
          const dl = parseISO(card.deadline);
          if (isValid(dl) && dl < today) { overdue.push(card); changed = true; }
          else kept.push(card);
        }
        return kept.length !== col.items.length ? {...col, items: kept} : col;
      });
      if (!changed) return prev;
      return next.map(col => {
        if (col.id !== backlog.id) return col;
        const ids = new Set(col.items.map(i => i.id));
        return {...col, items: [...col.items, ...overdue.filter(c => !ids.has(c.id))]};
      });
    });
  }, [loading]);

  const isSearchActive = searchQuery.trim().length > 0;

  const onDragEnd = useCallback((result) => {
    isDraggingRef.current = true;
    setTimeout(() => { isDraggingRef.current = false; }, 120);
    const { source: s, destination: d, type } = result;
    if (!d || (s.droppableId===d.droppableId && s.index===d.index)) return;

    if (type === "board") {
      setColumns(prev => { const n=[...prev]; const [m]=n.splice(s.index,1); n.splice(d.index,0,m); return n; });
    } else {
      setColumns(prev => {
        const n = prev.map(c => ({...c, items:[...c.items]}));
        const src = n.find(c => c.id === s.droppableId);
        const dst = n.find(c => c.id === d.droppableId);
        if (!src || !dst) return prev;
        const [moved] = src.items.splice(s.index, 1);
        dst.items.splice(d.index, 0, moved);
        return n;
      });
    }
  }, []);

  const openAdd  = colId => setModal({ card: null, isNew: true, columnId: colId });
  const openEdit = (colId, card) => {
    if (isDraggingRef.current) return;
    setModal({ card, isNew: false, columnId: colId });
  };

  const handleSave = (targetColId, card) => {
    const srcId = modal?.columnId;
    setColumns(prev => {
      let n = prev.map(c => ({...c, items:[...c.items]}));
      // Remove from source if moving to different column
      if (!modal?.isNew && srcId && srcId !== targetColId) {
        n = n.map(c => c.id===srcId ? {...c, items: c.items.filter(i => i.id!==card.id)} : c);
      }
      n = n.map(c => {
        if (c.id !== targetColId) return c;
        const existing = c.items.find(i => i.id===card.id);
        return {...c, items: existing ? c.items.map(i => i.id===card.id ? card : i) : [...c.items, card]};
      });
      return n;
    });
    setModal(null);
  };

  const handleMarkComplete = (srcColId, card) => {
    const completedCard = {...card, completed: true};
    setColumns(prev => {
      const doneCol = prev.find(c => c.title.toLowerCase()==="done") ?? prev[prev.length-1];
      return prev.map(c => {
        if (c.id===srcColId && c.id!==doneCol.id) return {...c, items: c.items.filter(i => i.id!==card.id)};
        if (c.id===doneCol.id && c.id!==srcColId) {
          const exists = c.items.some(i => i.id===card.id);
          return {...c, items: exists ? c.items.map(i => i.id===card.id?completedCard:i) : [...c.items, completedCard]};
        }
        if (c.id===srcColId && c.id===doneCol.id) return {...c, items: c.items.map(i => i.id===card.id?completedCard:i)};
        return c;
      });
    });
  };

  const handleUndoComplete = card => {
    setColumns(prev => prev.map(col => ({...col, items: col.items.map(i => i.id===card.id ? {...card, completed:false} : i)})));
  };

  const handleDelete = (colId, cardId) => {
    setColumns(prev => prev.map(c => {
      if (c.id!==colId) return c;
      return {...c, items: c.items.filter(i => i.id!==cardId)};
    }));
    setModal(null);
  };

  const handleDeleteColumn = id => setColumns(p => p.filter(c => c.id!==id));
  const handleRenameColumn = (id, title) => setColumns(p => p.map(c => c.id===id ? {...c,title} : c));
  const handleAddColumn    = () => setColumns(p => [...p, { id: uid(), title: "New Status", items: [] }]);

  const sortLabels = { none: "Default", priority: "Priority", deadline: "Deadline" };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/>
        <p className="text-slate-400 text-sm">Loading board…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white font-sans" style={{scrollbarWidth:"none"}}>
      <style>{`* { scrollbar-width: none; } *::-webkit-scrollbar { display: none; }`}</style>

      {/* Header */}
      <header className="shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 bg-white border-b border-slate-200 z-30 flex-wrap sm:flex-nowrap">
        <div className="flex items-center border border-slate-200 rounded overflow-hidden shrink-0">
          {[
            { mode: "board", icon: <Trello size={12}/>, label: "Board" },
            { mode: "list",  icon: <LayoutList size={12}/>, label: "List" },
            { mode: "gantt", icon: <GanttChartSquare size={12}/>, label: "Gantt" },
          ].map(v => (
            <button type="button" key={v.mode} onClick={() => setViewMode(v.mode)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all border-r last:border-r-0 border-slate-200 cursor-pointer
                ${viewMode===v.mode ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
              {v.icon}<span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-0">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
          <input value={searchQuery} onChange={e => setSearch(e.target.value)} placeholder="Search tasks, tags…"
            className="w-full pl-7 pr-7 py-1.5 rounded border border-slate-200 bg-slate-50 text-[12px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"/>
          {searchQuery && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={11}/></button>
          )}
        </div>

        <div className="relative shrink-0">
          <button type="button" onClick={() => setSortOpen(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer
              ${sortMode!=="none" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>
            <ArrowUpDown size={11}/><span className="hidden sm:inline">{sortLabels[sortMode]}</span>
          </button>
          {sortOpen && (
            <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl w-40 p-1 z-50">
              {["none","priority","deadline"].map(s => (
                <button type="button" key={s} onClick={() => { setSortMode(s); setSortOpen(false); }}
                  className={`flex items-center gap-2 w-full px-2.5 py-2 rounded text-[11px] font-semibold hover:bg-slate-50 capitalize cursor-pointer ${sortMode===s?"bg-slate-100 text-blue-600":"text-slate-600"}`}>
                  {sortLabels[s]}{sortMode===s && <span className="ml-auto text-blue-600">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSearchActive && (
            <motion.span initial={{opacity:0}} animate={{opacity:1}}
              className="text-[9px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200 uppercase tracking-wide hidden sm:block">
              Drag disabled
            </motion.span>
          )}
          <button type="button" onClick={handleAddColumn}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-colors shrink-0 uppercase tracking-wide cursor-pointer relative z-10">
            <Plus size={12}/><span className="hidden sm:inline">Add Board</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      {/* Content */}
      {viewMode==="board" && (
        <div className="flex-1 min-h-0 overflow-auto px-3 sm:px-5 py-4 sm:py-5" style={{scrollbarWidth:"none"}}>
          <DragDropContext onDragEnd={onDragEnd}>
            <StrictModeDroppable droppableId="board" direction="horizontal" type="board">
              {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex items-start gap-3 sm:gap-4 w-max min-h-full">
                  {columns.map((col, idx) => (
                    <KanbanColumn key={col.id} column={col} colIndex={idx} index={idx}
                      searchQuery={searchQuery} isSearchActive={isSearchActive} sortMode={sortMode}
                      onAddCard={openAdd} onEditCard={openEdit}
                      onDeleteColumn={handleDeleteColumn} onRenameColumn={handleRenameColumn}/>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </DragDropContext>
        </div>
      )}
      {viewMode==="list" && <ListView columns={columns} onEditCard={openEdit} onAddCard={openAdd} searchQuery={searchQuery} sortMode={sortMode}/>}
      {viewMode==="gantt" && <GanttView columns={columns} onEditCard={openEdit}/>}

      {/* Detail Panel */}
      <AnimatePresence>
        {modal && (
          <CardDetailPanel
            key={modal.card?.id||"new"}
            card={modal.card} isNew={modal.isNew} columnId={modal.columnId} columns={columns}
            onSave={handleSave} onDelete={handleDelete} onClose={() => setModal(null)}
            onMarkComplete={handleMarkComplete} onUndoComplete={handleUndoComplete}/>
        )}
      </AnimatePresence>
    </div>
  );
}