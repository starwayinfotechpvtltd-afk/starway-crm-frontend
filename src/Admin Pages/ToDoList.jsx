import React, { useState, useEffect, useRef, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, Trash2, Search, X, Calendar as CalendarIcon, AlertCircle, Clock,
  CheckCircle2, Link2, FileText, ChevronDown, LayoutList, Trello,
  GanttChartSquare, MoreHorizontal, Paperclip, ChevronRight, Circle,
  ArrowLeft, Tag, User, MessageSquare, ExternalLink, RotateCcw,
  ArrowUpDown, Edit3, Eye, Loader2, AlertTriangle, ArrowRight, ArrowDown, ArrowUp, Flag
} from "lucide-react";
import {
  format, differenceInDays, parseISO, isValid, addDays,
  eachDayOfInterval, isSameDay, startOfMonth, endOfMonth,
  eachWeekOfInterval, startOfWeek, endOfWeek, isSameMonth,
  getMonth, getYear, addMonths, subMonths,
} from "date-fns";
import axios from "axios";

// ─── API setup ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── System Colors ─────────────────────────────────────────────────────────────
const C = {
  primary: "#0969DA",
  success: "#1A7F37",
  danger: "#D1242F",
  warning: "#BF8700",
  text: "#1F2328",
  textSec: "#656D76"
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const PRIORITY_CONFIG = {
  Critical: { color: C.danger,  icon: <Flag size={12}/>, weight: 3 },
  High:     { color: C.warning, icon: <ArrowUp size={12}/>, weight: 2 },
  Medium:   { color: C.primary, icon: <ArrowRight size={12}/>, weight: 1 },
  Low:      { color: C.success, icon: <ArrowDown size={12}/>, weight: 0 },
  None:     { color: C.textSec, icon: <Circle size={12}/>, weight: -1 },
};

const COL_ACCENTS = [C.primary, C.success, C.warning, C.danger, "#8B5CF6", "#06B6D4"];
const getColAccent = idx => COL_ACCENTS[idx % COL_ACCENTS.length];

function PriorityFlag({ priority, size = 12 }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.None;
  return (
    <div className="flex items-center justify-center" style={{ color: cfg.color }}>
      {React.cloneElement(cfg.icon, { size })}
    </div>
  );
}

function getDeadlineStatus(deadline) {
  if (!deadline) return null;
  const parsed = parseISO(deadline);
  if (!isValid(parsed)) return null;
  const days = differenceInDays(parsed, new Date());
  if (days < 0)  return { color: C.danger, icon: <AlertTriangle size={10}/>, date: format(parsed,"MMM d"), overdue: true  };
  if (days <= 3) return { color: C.warning, icon: <Clock size={10}/>, date: format(parsed,"MMM d"), overdue: false };
  return         { color: C.textSec, icon: <CalendarIcon size={10}/>, date: format(parsed,"MMM d"), overdue: false };
}

function sortCards(items, sortMode) {
  if (sortMode === "none") return items;
  return [...items].sort((a, b) => {
    if (sortMode === "priority") return (PRIORITY_CONFIG[b.priority]?.weight ?? 0) - (PRIORITY_CONFIG[a.priority]?.weight ?? 0);
    if (sortMode === "deadline") {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1; if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return 0;
  });
}

// ─── STRICT MODE FIX for DnD ──────────────────────────────────────────────────
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => { cancelAnimationFrame(animation); setEnabled(false); };
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
    <div className="absolute z-50 mt-1 neu-flat rounded-xl p-3 w-64" style={{ top: "100%", left: 0 }}>
      <div className="flex items-center justify-between mb-3 border-b border-[#D1DCEB]/50 pb-2">
        <button type="button" onClick={() => setMonth(m => subMonths(m,1))} className="neu-flat-sm neu-action-btn p-1.5 rounded-lg text-[#656D76]"><ChevronLeft size={14}/></button>
        <span className="text-xs font-bold text-[#1F2328]">{format(month,"MMMM yyyy")}</span>
        <button type="button" onClick={() => setMonth(m => addMonths(m,1))} className="neu-flat-sm neu-action-btn p-1.5 rounded-lg text-[#656D76]"><ChevronRight size={14}/></button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="text-center text-[9px] font-bold text-[#656D76] uppercase tracking-wider">{d}</div>)}
      </div>
      {weeks.map((wk, wi) => {
        const days = eachDayOfInterval({ start: wk, end: endOfWeek(wk,{weekStartsOn:0}) });
        return (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {days.map((day,di) => {
              const inMonth = isSameMonth(day, month);
              const isToday = isSameDay(day, new Date());
              const isSel   = selected && isSameDay(day, selected);
              return (
                <button type="button" key={di} onClick={() => { onChange(format(day,"yyyy-MM-dd")); onClose(); }}
                  className={`text-center text-[10px] font-bold py-1.5 rounded-md transition-colors neu-action-btn
                    ${!inMonth ? "text-[#656D76] opacity-40" : isToday ? "text-[#0969DA]" : "text-[#1F2328]"}
                    ${isSel ? "neu-btn-primary !text-white" : "neu-pressed-sm hover:bg-[#D1DCEB]/20"}`}>
                  {format(day,"d")}
                </button>
              );
            })}
          </div>
        );
      })}
      {value && (
        <button type="button" onClick={() => { onChange(""); onClose(); }} className="mt-3 w-full text-[10px] font-bold text-[#D1242F] uppercase tracking-wider neu-flat-sm neu-action-btn py-2 rounded-lg">
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
    <div className="flex flex-wrap gap-2 p-2.5 rounded-lg neu-pressed min-h-[44px]">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0969DA]/10 text-[#0969DA] text-[10px] font-bold uppercase tracking-wider">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="text-[#0969DA] hover:text-[#D1242F]"><X size={10}/></button>
        </span>
      ))}
      <input value={input}
        onChange={e => { const v=e.target.value; if(v.endsWith(",")){ commit(v.slice(0,-1)); }else setInput(v); }}
        onKeyDown={e => { if(e.key==="Enter"||e.key===","){ e.preventDefault(); commit(input); } else if(e.key==="Backspace"&&input===""&&tags.length>0) onChange(tags.slice(0,-1)); }}
        placeholder={tags.length===0?"Add tags (Enter or comma)…":""}
        className="flex-1 min-w-[120px] bg-transparent text-xs font-medium text-[#1F2328] outline-none"/>
    </div>
  );
}

// ─── Card Detail Panel (Slide from Right) ─────────────────────────────────────
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
    <motion.div className="fixed inset-0 z-[999999] flex justify-end" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="absolute inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" onClick={onClose}/>
      <motion.div className="w-full sm:max-w-md h-full neu-base flex flex-col border-l border-[#D1DCEB]/50 shadow-2xl relative z-10"
        initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",stiffness:400,damping:36}}>
        
        {/* Top bar */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#D1DCEB]/50">
          <div className="flex items-center gap-3">
             <button type="button" onClick={onClose} className="neu-flat-sm neu-action-btn p-2 rounded-lg text-[#656D76]"><ArrowLeft size={16}/></button>
             <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md text-white" style={{backgroundColor:accent}}>{colForCard?.title ?? ""}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button type="button" onClick={() => setEditMode(v => !v)} className={`neu-flat-sm neu-action-btn p-2 rounded-lg ${editMode ? "text-[#0969DA]" : "text-[#656D76]"}`}>
                {editMode ? <Eye size={16}/> : <Edit3 size={16}/>}
              </button>
            )}
            {!isNew && (deleteConfirm
              ? <div className="flex items-center gap-2 neu-pressed-sm rounded-lg p-1">
                  <button type="button" onClick={() => { onDelete(columnId, card.id); onClose(); }} className="px-3 py-1 rounded-md bg-[#D1242F] text-white text-[10px] font-bold">Delete</button>
                  <button type="button" onClick={() => setDelConf(false)} className="px-3 py-1 rounded-md text-[#656D76] text-[10px] font-bold">Cancel</button>
                </div>
              : <button type="button" onClick={() => setDelConf(true)} className="neu-flat-sm neu-action-btn p-2 rounded-lg text-[#656D76] hover:text-[#D1242F]"><Trash2 size={16}/></button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 flex border-b border-[#D1DCEB]/50 px-5 gap-4">
          {["details","links"].map(tab => (
            <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`py-3 text-[10px] font-bold uppercase tracking-wider capitalize transition-colors relative neu-action-btn ${activeTab===tab ? "text-[#0969DA]" : "text-[#656D76]"}`}>
              {tab} {tab==="links" && links.length>0 && <span className="ml-1.5 bg-[#0969DA]/10 text-[#0969DA] px-1.5 py-0.5 rounded-md">{links.length}</span>}
              {activeTab===tab && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0969DA]" />}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab==="details" && (
            <div className="px-6 py-6 space-y-6">
              {isCompleted && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl neu-pressed border border-[#1A7F37]/20 bg-[#1A7F37]/5">
                  <CheckCircle2 size={18} className="text-[#1A7F37] shrink-0"/>
                  <p className="text-[10px] font-bold text-[#1A7F37] uppercase tracking-wider flex-1">Task Completed</p>
                  {undoConf
                    ? <div className="flex items-center gap-2">
                        <button type="button" onClick={handleUndoComplete} className="px-3 py-1.5 rounded-md bg-[#BF8700] text-white text-[10px] font-bold neu-action-btn">Undo</button>
                        <button type="button" onClick={() => setUndoConf(false)} className="px-3 py-1.5 rounded-md text-[#656D76] text-[10px] font-bold neu-action-btn">Keep</button>
                      </div>
                    : <button type="button" onClick={() => setUndoConf(true)} className="flex items-center gap-1 text-[10px] font-bold text-[#BF8700] neu-flat-sm neu-action-btn px-3 py-1.5 rounded-md">
                        <RotateCcw size={12}/> Undo
                      </button>
                  }
                </div>
              )}

              {!editMode && !isNew
                ? <div className="space-y-6">
                    <h2 className={`text-2xl font-bold leading-tight ${isCompleted?"line-through text-[#656D76] decoration-[#1A7F37]":"text-[#1F2328]"}`}>
                      {title || <span className="italic text-[#656D76]">Untitled</span>}
                    </h2>
                    
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 neu-pressed-sm px-3 py-1.5 rounded-md">
                        <PriorityFlag priority={priority} size={14}/>
                        <span className="text-xs font-bold text-[#1F2328]">{PRIORITY_CONFIG[priority]?.label || priority}</span>
                      </div>
                      {deadline && ds && (
                        <div className={`flex items-center gap-2 neu-pressed-sm px-3 py-1.5 rounded-md text-xs font-bold`} style={{ color: ds.color }}>
                          {ds.icon} {ds.date}
                        </div>
                      )}
                    </div>
                    
                    {tags.length>0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => <span key={tag} className="px-2.5 py-1 rounded-md bg-[#0969DA]/10 text-[#0969DA] text-[10px] font-bold uppercase tracking-wider">{tag}</span>)}
                      </div>
                    )}
                    
                    {description && (
                      <div className="neu-pressed rounded-xl p-5">
                        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Description</p>
                        <p className="text-sm font-medium text-[#1F2328] whitespace-pre-wrap leading-relaxed">{description}</p>
                      </div>
                    )}
                    
                    {notes && (
                      <div className="neu-pressed rounded-xl p-5">
                        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText size={12}/> Notes</p>
                        <p className="text-sm font-medium text-[#1F2328] whitespace-pre-wrap leading-relaxed">{notes}</p>
                      </div>
                    )}
                    
                    {comments.length>0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider flex items-center gap-1.5"><MessageSquare size={12}/> Comments ({comments.length})</p>
                        {comments.map(c => (
                          <div key={c.id} className="neu-flat-sm rounded-xl p-4 flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-full neu-btn-primary flex items-center justify-center shrink-0 text-[10px] font-bold text-white"><User size={14}/></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[#1F2328] whitespace-pre-wrap mb-1">{c.text}</p>
                              <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">{c.timestamp && isValid(parseISO(c.timestamp)) ? format(parseISO(c.timestamp),"MMM d, h:mm a") : "Just now"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                : <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">
                        #{(card?.id || "NEW").toString().slice(-6)}
                      </span>
                      <select value={selectedCol} onChange={e => setSelCol(e.target.value)} className="neu-pressed-sm rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                        {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    
                    <input autoFocus={isNew} value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title…" className="w-full text-2xl font-bold text-[#1F2328] bg-transparent border-b-2 border-[#D1DCEB]/50 focus:border-[#0969DA] outline-none pb-2 placeholder-[#656D76]/50 transition-colors"/>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative z-20">
                        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Priority</p>
                        <button type="button" onClick={() => setPriOpen(v => !v)} className="flex items-center justify-between w-full p-3 rounded-lg neu-pressed text-sm font-bold text-[#1F2328]">
                          <div className="flex items-center gap-2"><PriorityFlag priority={priority} size={14}/> {PRIORITY_CONFIG[priority]?.label || priority}</div>
                          <ChevronDown size={14} className="text-[#656D76]"/>
                        </button>
                        {priorityOpen && (
                          <div className="absolute z-50 mt-1 neu-flat rounded-xl w-full p-2 space-y-1">
                            {["High","Medium","Low","None"].map(p => (
                              <button type="button" key={p} onClick={() => { setPriority(p); setPriOpen(false); }} className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold transition-colors neu-action-btn ${priority===p?"neu-pressed text-[#0969DA]":"hover:bg-[#D1DCEB]/20 text-[#1F2328]"}`}>
                                <PriorityFlag priority={p} size={14}/> {PRIORITY_CONFIG[p]?.label || p}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="relative z-20">
                        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Deadline</p>
                        <button type="button" onClick={() => setCalOpen(v => !v)} className="flex items-center gap-2 w-full p-3 rounded-lg neu-pressed text-sm font-bold transition-colors">
                          <CalendarIcon size={14} className="text-[#656D76] shrink-0"/>
                          <span className={deadline ? "text-[#1F2328]" : "text-[#656D76]"}>{deadline && isValid(parseISO(deadline)) ? format(parseISO(deadline),"MMM d, yyyy") : "Pick date"}</span>
                        </button>
                        {calOpen && <SimpleDatePicker value={deadline} onChange={setDeadline} onClose={() => setCalOpen(false)}/>}
                      </div>
                    </div>

                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Description</p>
                      <textarea value={description} onChange={e => setDesc(e.target.value)} placeholder="What needs to be done?" rows={3} className="w-full p-4 rounded-xl neu-pressed text-sm font-medium text-[#1F2328] outline-none resize-none custom-scrollbar"/>
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText size={12}/> Notes</p>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Extended context, sub-tasks…" rows={3} className="w-full p-4 rounded-xl neu-pressed text-sm font-medium text-[#1F2328] outline-none resize-none custom-scrollbar"/>
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag size={12}/> Tags</p>
                      <TagInput tags={tags} onChange={setTags}/>
                    </div>

                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-3 flex items-center gap-1.5"><MessageSquare size={12}/> Comments</p>
                      {comments.length>0 && (
                        <div className="space-y-4 mb-4">
                          {comments.map(c => (
                            <div key={c.id} className="flex gap-3 items-start group">
                              <div className="w-8 h-8 rounded-full neu-btn-primary flex items-center justify-center shrink-0 text-[10px] font-bold text-white"><User size={14}/></div>
                              <div className="flex-1 neu-flat-sm rounded-xl p-4 relative">
                                <p className="text-sm font-medium text-[#1F2328] whitespace-pre-wrap">{c.text}</p>
                                <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mt-2 block">{c.timestamp && isValid(parseISO(c.timestamp)) ? format(parseISO(c.timestamp),"MMM d, h:mm a") : "Just now"}</span>
                                <button type="button" onClick={() => setComments(p => p.filter(x => x.id !== c.id))} className="absolute top-2 right-2 p-1.5 neu-pressed-sm neu-action-btn rounded-md text-[#D1242F] opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full neu-flat-sm flex items-center justify-center shrink-0 text-[#0969DA]"><User size={14}/></div>
                        <div className="flex-1 flex flex-col gap-3">
                          <textarea value={commentText} onChange={e => setComText(e.target.value)} placeholder="Add a comment…" rows={2} className="w-full p-3 rounded-xl neu-pressed text-sm font-medium text-[#1F2328] outline-none resize-none custom-scrollbar"/>
                          <button type="button" onClick={addComment} disabled={!commentText.trim()} className="self-end px-5 py-2 neu-btn-primary text-white text-xs font-bold rounded-lg disabled:opacity-50 neu-action-btn">Post Comment</button>
                        </div>
                      </div>
                    </div>
                  </div>
              }
            </div>
          )}

          {activeTab==="links" && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Links & Files</p>
                <button type="button" onClick={addLink} className="neu-flat-sm neu-action-btn px-4 py-2 rounded-lg text-[10px] font-bold text-[#0969DA] uppercase tracking-wider flex items-center gap-1.5"><Plus size={14}/> Add Link</button>
              </div>
              <AnimatePresence>
                {links.map(link => (
                  <motion.div key={link.id} initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="mb-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl neu-pressed group">
                      <ExternalLink size={16} className="text-[#656D76] shrink-0"/>
                      <input value={link.title} onChange={e => updateLink(link.id,"title",e.target.value)} placeholder="Label" className="flex-1 min-w-0 bg-transparent text-sm font-bold text-[#1F2328] outline-none"/>
                      <input value={link.url} onChange={e => updateLink(link.id,"url",e.target.value)} placeholder="https://…" className="flex-[2] min-w-0 bg-transparent text-xs font-medium text-[#0969DA] outline-none"/>
                      <button type="button" onClick={() => removeLink(link.id)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#D1242F] opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {links.length===0 && (
                <div className="flex flex-col items-center py-12 text-[#656D76]"><Link2 size={32} className="mb-3 opacity-50"/><p className="text-xs font-bold">No links attached</p></div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#D1DCEB]/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {!isNew && !isCompleted && (
            completeConf
              ? <div className="flex items-center gap-2 neu-pressed-sm rounded-lg p-1.5">
                  <span className="text-[10px] font-bold text-[#1A7F37] uppercase tracking-wider px-2">Mark complete?</span>
                  <button type="button" onClick={handleComplete} className="px-3 py-1.5 rounded-md bg-[#1A7F37] text-white text-[10px] font-bold neu-action-btn">Yes</button>
                  <button type="button" onClick={() => setCompConf(false)} className="px-3 py-1.5 rounded-md text-[#656D76] text-[10px] font-bold neu-action-btn">No</button>
                </div>
              : <button type="button" onClick={() => setCompConf(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-[#1A7F37] neu-flat-sm neu-action-btn border border-[#1A7F37]/30">
                  <CheckCircle2 size={16}/> Mark Complete
                </button>
          )}
          {(isNew || isCompleted) && <div/>}
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-bold text-[#656D76] neu-flat neu-action-btn">Cancel</button>
            {(editMode || isNew) && (
              <button type="button" onClick={handleSave} disabled={!title.trim()} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white neu-btn-primary disabled:opacity-50 neu-action-btn">
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
  const matches = !isSearchActive || card.title.toLowerCase().includes(q) || (card.description||"").toLowerCase().includes(q) || (card.tags??[]).some(t => t.toLowerCase().includes(q));
  const accent = getColAccent(colIndex);

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={isSearchActive}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={onClick}
          className={`neu-flat-sm rounded-xl p-4 cursor-pointer select-none transition-all duration-200 relative overflow-hidden mb-3 border-l-4 ${card.completed ? "opacity-70 bg-[#1A7F37]/5" : ""}`}
          style={{ 
            ...provided.draggableProps.style, 
            display: matches ? undefined : "none", 
            transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} rotate(2deg)` : provided.draggableProps.style?.transform,
            borderLeftColor: card.completed ? "#1A7F37" : accent 
          }}
        >
          {card.completed && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden opacity-20">
              <span style={{transform:"rotate(-20deg)",fontSize:"24px",fontWeight:900,letterSpacing:"0.2em",color:"#1A7F37",textTransform:"uppercase",border:"4px solid #1A7F37",padding:"4px 16px",borderRadius:"8px"}}>DONE</span>
            </div>
          )}
          
          <div className="relative z-20">
            {(card.tags?.length??0)>0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {card.tags.slice(0,3).map(tag => <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#0969DA]/10 text-[#0969DA] uppercase tracking-wider">{tag}</span>)}
              </div>
            )}
            
            <div className="flex items-start gap-2 mb-2">
              {card.completed && <CheckCircle2 size={16} className="text-[#1A7F37] shrink-0 mt-0.5"/>}
              <p className={`text-sm font-bold leading-snug ${card.completed?"line-through text-[#656D76]":"text-[#1F2328]"}`}>{card.title}</p>
            </div>
            
            {card.description && <p className="text-[10px] font-medium text-[#656D76] leading-relaxed line-clamp-2 mb-3">{card.description}</p>}
            
            <div className="flex items-center justify-between gap-2 pt-3 mt-1 border-t border-[#D1DCEB]/50">
              <div className="flex items-center gap-3">
                {ds && <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: ds.color }}>{ds.icon}{ds.date}</span>}
                <div className="flex items-center gap-2.5 text-[#656D76]">
                  {(card.comments?.length??0)>0 && <span className="flex items-center gap-1 text-[10px] font-bold"><MessageSquare size={12}/>{card.comments.length}</span>}
                  {(card.links?.length??0)>0 && <span className="flex items-center gap-1 text-[10px] font-bold"><Paperclip size={12}/>{card.links.length}</span>}
                </div>
              </div>
              <PriorityFlag priority={card.priority||"None"} size={14}/>
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
          className={`flex flex-col w-[300px] sm:w-[340px] shrink-0 neu-pressed rounded-2xl p-3 transition-all duration-200 ${snapshot.isDragging?"opacity-90 shadow-2xl scale-105 z-50 bg-[#F0F4F8]":""}`}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setDelConf(false); }}>
          
          {/* Header */}
          <div {...provided.dragHandleProps} className="flex items-center gap-3 px-4 py-3 mb-3 neu-flat rounded-xl cursor-grab active:cursor-grabbing border-t-4" style={{borderTopColor:accent}}>
            {editingTitle
              ? <input autoFocus value={titleVal} onChange={e => setTitleVal(e.target.value)} onBlur={commitTitle} onKeyDown={e => { if(e.key==="Enter") commitTitle(); if(e.key==="Escape"){ setTitleVal(column.title); setEditTitle(false); } }} onClick={e => e.stopPropagation()} className="flex-1 min-w-0 bg-transparent text-sm font-bold text-[#1F2328] uppercase tracking-wider outline-none"/>
              : <span className="text-sm font-bold text-[#1F2328] flex-1 truncate cursor-text uppercase tracking-wider" onDoubleClick={() => setEditTitle(true)}>{column.title}</span>
            }
            <span className="text-[10px] font-bold text-white px-2 py-1 rounded-md shrink-0" style={{backgroundColor:accent}}>{column.items.length}</span>
            
            <AnimatePresence>
              {hovered && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-1 relative z-10 cursor-default" onClick={e => e.stopPropagation()}>
                  <button type="button" onClick={() => onAddCard(column.id)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#0969DA]"><Plus size={14} className="pointer-events-none"/></button>
                  {deleteConfirm
                    ? <div className="flex items-center gap-1 neu-pressed-sm rounded-md p-0.5">
                        <button type="button" onClick={() => onDeleteColumn(column.id)} className="px-2 py-1 rounded bg-[#D1242F] text-white text-[9px] font-bold">Del</button>
                        <button type="button" onClick={() => setDelConf(false)} className="px-2 py-1 rounded text-[#656D76] text-[9px] font-bold">No</button>
                      </div>
                    : <button type="button" onClick={() => setDelConf(true)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#656D76] hover:text-[#D1242F]"><MoreHorizontal size={14} className="pointer-events-none"/></button>
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Drop zone */}
          <StrictModeDroppable droppableId={column.id} type="card">
            {(drop, dropSnap) => (
              <div ref={drop.innerRef} {...drop.droppableProps} className={`flex-1 min-h-[100px] overflow-y-auto custom-scrollbar p-1 transition-colors duration-200 rounded-xl ${dropSnap.isDraggingOver?"bg-[#0969DA]/10":""}`}>
                {sortedItems.map((card, i) => (
                  <KanbanCard key={card.id} card={card} index={i} colIndex={colIndex} searchQuery={searchQuery} isSearchActive={isSearchActive} onClick={() => onEditCard(column.id, card)}/>
                ))}
                {drop.placeholder}
              </div>
            )}
          </StrictModeDroppable>

          <button type="button" onClick={() => onAddCard(column.id)} className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-[#656D76] uppercase tracking-wider neu-flat-sm neu-action-btn border border-dashed border-[#D1DCEB]/80 hover:text-[#0969DA] hover:border-[#0969DA]/50">
            <Plus size={14}/> Add Task
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
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-6 space-y-4">
      {columns.map((col, ci) => {
        const accent = getColAccent(ci);
        const isOpen = expanded[col.id] !== false;
        const sortedItems = sortCards(col.items, sortMode);
        const filteredItems = q ? sortedItems.filter(c => c.title.toLowerCase().includes(q)||(c.description||"").toLowerCase().includes(q)||(c.tags??[]).some(t=>t.toLowerCase().includes(q))) : sortedItems;

        return (
          <div key={col.id} className="neu-flat rounded-2xl overflow-hidden">
            <button type="button" onClick={() => setExpanded(p => ({...p,[col.id]:!isOpen}))} className="w-full flex items-center gap-4 px-6 py-4 transition-colors border-l-4 neu-action-btn" style={{borderLeftColor:accent}}>
              <span className="text-sm font-bold text-[#1F2328] flex-1 text-left uppercase tracking-wider">{col.title}</span>
              <span className="text-[10px] font-bold text-white px-2.5 py-1 rounded-md" style={{backgroundColor:accent}}>{col.items.length}</span>
              <ChevronRight size={18} className={`text-[#656D76] transition-transform ${isOpen?"rotate-90":""}`}/>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden">
                  <div className="px-6 py-4 bg-[#D1DCEB]/10 space-y-3">
                    {filteredItems.length>0 && (
                      <div className="hidden sm:grid sm:grid-cols-[1fr_120px_100px_120px] gap-4 px-4 py-2 border-b border-[#D1DCEB]/50">
                        {["Task","Deadline","Priority","Status"].map(h => <span key={h} className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">{h}</span>)}
                      </div>
                    )}
                    {filteredItems.map(card => {
                      const ds = getDeadlineStatus(card.deadline);
                      return (
                        <div key={card.id} onClick={() => onEditCard(col.id, card)} className={`neu-pressed rounded-xl cursor-pointer transition-colors group relative overflow-hidden ${card.completed ? "bg-[#1A7F37]/5 border border-[#1A7F37]/20" : "hover:bg-[#F0F4F8]"}`}>
                          <div className="hidden sm:grid sm:grid-cols-[1fr_120px_100px_120px] gap-4 px-4 py-4 items-center">
                            <div className="flex items-center gap-3 min-w-0">
                              {card.completed ? <CheckCircle2 size={16} className="text-[#1A7F37] shrink-0"/> : <Circle size={16} className="text-[#D1DCEB] shrink-0 group-hover:text-[#0969DA] transition-colors"/>}
                              <div className="min-w-0">
                                <span className={`block text-sm font-bold truncate ${card.completed?"line-through text-[#656D76]":"text-[#1F2328]"}`}>{card.title}</span>
                                {(card.tags?.length??0)>0 && (
                                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                    {card.tags.slice(0,2).map(t => <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#0969DA]/10 text-[#0969DA] uppercase tracking-wider">{t}</span>)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center">{ds && card.deadline ? <span className="text-[10px] font-bold flex items-center gap-1.5" style={{color:ds.color}}>{ds.icon}{ds.date}</span> : <span className="text-[#656D76] text-xs">—</span>}</div>
                            <div className="flex items-center"><PriorityBadge priority={card.priority||"None"} /></div>
                            <div className="flex items-center"><span className="text-[9px] font-bold px-2.5 py-1 rounded-md text-white uppercase tracking-wider truncate" style={{backgroundColor:accent}}>{col.title}</span></div>
                          </div>
                        </div>
                      );
                    })}
                    <button type="button" onClick={() => onAddCard(col.id)} className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl text-xs font-bold text-[#656D76] hover:text-[#0969DA] uppercase tracking-wider border border-dashed border-[#D1DCEB]/50 hover:border-[#0969DA]/50 transition-colors neu-action-btn">
                      <Plus size={14}/> Add New Task
                    </button>
                  </div>
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
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-8">
        
        {/* Calendar Grid */}
        <div className="flex-1 neu-flat rounded-2xl p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setCurrentMonth(m => subMonths(m,1))} className="neu-flat-sm neu-action-btn p-2 rounded-lg text-[#656D76]"><ChevronLeft size={16}/></button>
            <h2 className="text-xl font-bold text-[#1F2328] uppercase tracking-wider">{format(currentMonth,"MMMM yyyy")}</h2>
            <button onClick={() => setCurrentMonth(m => addMonths(m,1))} className="neu-flat-sm neu-action-btn p-2 rounded-lg text-[#656D76]"><ChevronRight size={16}/></button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2 border-b border-[#D1DCEB]/50 pb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-[#656D76] uppercase tracking-wider">{d}</div>
            ))}
          </div>
          
          <div className="flex flex-col gap-2">
            {weeks.map((weekStart, wi) => {
              const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart,{weekStartsOn:0}) });
              return (
                <div key={wi} className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, di) => {
                    const inMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());
                    const dayCards = getCardsForDay(day);
                    return (
                      <div key={di} className={`min-h-[100px] rounded-xl p-2 flex flex-col gap-1.5 transition-colors ${!inMonth ? "neu-pressed-sm opacity-40" : isToday ? "neu-pressed border border-[#0969DA]/30" : "neu-pressed"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 shrink-0 ${isToday ? "neu-btn-primary text-white" : "text-[#656D76]"}`}>{format(day,"d")}</div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                          {dayCards.slice(0,4).map(({ card, col, ci }) => (
                            <button type="button" key={card.id} onClick={() => onEditCard(col.id, card)} className="w-full text-left px-2 py-1 rounded-md text-[9px] font-bold text-white truncate neu-action-btn" style={{backgroundColor: card.completed ? "#1A7F37" : getColAccent(ci)}}>
                              {card.completed && "✓ "}{card.title}
                            </button>
                          ))}
                          {dayCards.length>4 && <div className="text-[9px] font-bold text-[#656D76] text-center italic">+{dayCards.length-4}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Deadline List */}
        <div className="w-full xl:w-[350px] shrink-0 neu-pressed rounded-2xl p-6 h-fit">
          <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50 pb-3 mb-4">Deadlines in {format(currentMonth,"MMMM")}</p>
          <div className="space-y-3">
            {allCards.filter(({ card }) => { if(!card.deadline) return false; const dl=parseISO(card.deadline); return isValid(dl)&&getMonth(dl)===getMonth(currentMonth)&&getYear(dl)===getYear(currentMonth); }).sort((a,b) => new Date(a.card.deadline)-new Date(b.card.deadline)).map(({ card, col, ci }) => {
              const acc = getColAccent(ci);
              const ds = getDeadlineStatus(card.deadline);
              return (
                <div key={card.id} onClick={() => onEditCard(col.id, card)} className="flex items-center gap-4 p-4 neu-flat-sm rounded-xl cursor-pointer neu-action-btn">
                  <div className="w-1.5 h-10 rounded-full shrink-0" style={{backgroundColor: card.completed ? "#1A7F37" : acc}}/>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate mb-1.5 ${card.completed?"line-through text-[#656D76]":"text-[#1F2328]"}`}>{card.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded-md uppercase tracking-wider" style={{backgroundColor:acc}}>{col.title}</span>
                      <PriorityBadge priority={card.priority||"None"} />
                    </div>
                  </div>
                  {ds && <span className="flex items-center gap-1 text-[10px] font-bold shrink-0" style={{color:ds.color}}>{ds.icon}{ds.date}</span>}
                </div>
              );
            })}
          </div>
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
    const [dayWidth, setDayWidth] = useState(36);

    useEffect(() => {
      const update = () => {
        if (containerRef.current) {
          const w = containerRef.current.clientWidth;
          setDayWidth(w < 480 ? 24 : w < 768 ? 30 : 36);
        }
      };
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }, []);

    const TASK_COL_W = dayWidth < 30 ? 120 : 200;
    const withDL = allCards.filter(({ card }) => card.deadline && isValid(parseISO(card.deadline)));

    return (
      <div className="flex-1 overflow-auto custom-scrollbar px-4 sm:px-6 py-6" ref={containerRef}>
        <div className="neu-flat rounded-2xl overflow-hidden border border-[#D1DCEB]/50" style={{minWidth: TASK_COL_W + days.length * dayWidth}}>
          
          <div className="flex border-b border-[#D1DCEB]/50 sticky top-0 bg-[#F0F4F8] z-20">
            <div className="shrink-0 px-4 py-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-r border-[#D1DCEB]/50 flex items-center" style={{width:TASK_COL_W}}>Task Timeline</div>
            <div className="flex overflow-hidden">
              {days.map(d => (
                <div key={d.toISOString()} style={{minWidth:dayWidth,width:dayWidth}} className={`text-center py-2 border-r border-[#D1DCEB]/30 flex flex-col items-center justify-center ${isSameDay(d,today)?"bg-[#0969DA]/10":""}`}>
                  <div className={`text-[10px] font-bold ${isSameDay(d,today)?"text-[#0969DA]":"text-[#656D76]"}`}>{format(d,"d")}</div>
                  {(dayWidth>=30||d.getDate()%7===1) && <div className="text-[8px] font-bold text-[#656D76] uppercase mt-1">{format(d,"MMM")}</div>}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#F0F4F8] relative">
            {withDL.length===0 && (
              <div className="flex flex-col items-center py-16 text-[#656D76]"><GanttChartSquare size={32} className="mb-3 opacity-50"/><p className="text-xs font-bold uppercase tracking-wider">No tasks with deadlines</p></div>
            )}
            {withDL.map(({ card, col, ci }) => {
              const dl     = parseISO(card.deadline);
              const offset = Math.max(0, differenceInDays(dl, start));
              const barW   = dayWidth < 30 ? 50 : 80;
              const accent = getColAccent(ci);
              return (
                <div key={card.id} onClick={() => onEditCard(col.id, card)} className="flex border-b border-[#D1DCEB]/30 last:border-0 hover:bg-[#D1DCEB]/20 cursor-pointer transition-colors neu-action-btn relative z-10">
                  <div className="shrink-0 px-4 py-3 border-r border-[#D1DCEB]/50 flex items-center gap-2.5 min-w-0 bg-[#F0F4F8] relative z-20" style={{width:TASK_COL_W}}>
                    {card.completed ? <CheckCircle2 size={12} className="text-[#1A7F37] shrink-0"/> : <Circle size={12} className="text-[#D1DCEB] shrink-0"/>}
                    <span className={`text-xs font-bold truncate ${card.completed?"line-through text-[#656D76]":"text-[#1F2328]"}`}>{card.title}</span>
                  </div>
                  <div className="relative flex items-center" style={{width:days.length*dayWidth,minWidth:days.length*dayWidth}}>
                    <div className="absolute top-0 bottom-0 w-[2px] bg-[#0969DA]/20 z-0" style={{left:differenceInDays(today,start)*dayWidth+dayWidth/2}}/>
                    <div className={`absolute h-6 rounded-md flex items-center justify-center px-2 text-[10px] font-bold text-white truncate shadow-md z-10 neu-action-btn ${card.completed?"opacity-70":""}`}
                      style={{left:Math.max(0,offset*dayWidth-barW+dayWidth/2),width:barW,backgroundColor:card.completed?"#1A7F37":accent}}>
                      {dayWidth>=30 ? format(dl,"MMM d") : format(dl,"d")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F0F4F8]">
      <div className="shrink-0 flex items-center gap-2 px-6 pt-4 border-b border-[#D1DCEB]/50">
        {[
          { key: "calendar", label: "Calendar", icon: <CalendarIcon size={14}/> },
          { key: "timeline", label: "Timeline", icon: <GanttChartSquare size={14}/> },
        ].map(t => (
          <button type="button" key={t.key} onClick={() => setGanttTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors relative neu-action-btn ${ganttTab===t.key ? "text-[#0969DA]" : "text-[#656D76] hover:text-[#1F2328]"}`}>
            {t.icon}{t.label}
            {ganttTab===t.key && <motion.div layoutId="ganttTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0969DA]" />}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={ganttTab} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration:0.2}} className="flex-1 min-h-0">
          {ganttTab==="calendar" ? <CalendarSubView/> : <TimelineSubView/>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const DEFAULT_COLUMNS = [
    { id: "Todo", title: "To Do", items: [] },
    { id: "In Progress", title: "In Progress", items: [] },
    { id: "Done", title: "Done", items: [] }
  ];

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
      const backlog = prev.find(c => c.title.toLowerCase() === "backlog") || prev[0];
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

  const sortLabels = { none: "Default Order", priority: "Priority", deadline: "Deadline" };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full neu-base gap-4">
        <div className="w-12 h-12 border-4 border-[#D1DCEB] border-t-[#0969DA] rounded-full animate-spin"/>
        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider animate-pulse">Loading Board...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden neu-base font-sans montserrat-regular text-[#1F2328]">
      
      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-[#D1DCEB]/50 relative z-30 flex-wrap lg:flex-nowrap">
        
        {/* View Toggles */}
        <div className="neu-pressed rounded-lg p-1.5 flex items-center shrink-0 overflow-x-auto custom-scrollbar">
          {[
            { mode: "board", icon: <Trello size={14}/>, label: "Board" },
            { mode: "list",  icon: <LayoutList size={14}/>, label: "List" },
            { mode: "gantt", icon: <GanttChartSquare size={14}/>, label: "Timeline" },
          ].map(v => (
            <button type="button" key={v.mode} onClick={() => setViewMode(v.mode)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all neu-action-btn ${viewMode===v.mode ? "neu-flat text-[#0969DA]" : "text-[#656D76]"}`}>
              {v.icon}<span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none"/>
          <input value={searchQuery} onChange={e => setSearch(e.target.value)} placeholder="Search tasks, tags..." className="w-full neu-pressed rounded-md py-2.5 pl-10 pr-10 text-sm font-medium text-[#1F2328] outline-none focus:ring-1 focus:ring-[#0969DA]/50 transition-all"/>
          {searchQuery && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#656D76] hover:text-[#D1242F] neu-action-btn"><X size={14}/></button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <button type="button" onClick={() => setSortOpen(v => !v)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors neu-action-btn ${sortMode!=="none" ? "neu-pressed text-[#0969DA] border border-[#0969DA]/30" : "neu-flat-sm text-[#656D76]"}`}>
              <ArrowUpDown size={14}/><span className="hidden sm:inline">{sortLabels[sortMode]}</span>
            </button>
            {sortOpen && (
              <div className="absolute right-0 mt-2 neu-flat rounded-xl w-48 p-2 z-50">
                {["none","priority","deadline"].map(s => (
                  <button type="button" key={s} onClick={() => { setSortMode(s); setSortOpen(false); }} className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider neu-action-btn transition-colors ${sortMode===s?"neu-pressed text-[#0969DA]":"hover:bg-[#D1DCEB]/20 text-[#656D76]"}`}>
                    {sortLabels[s]} {sortMode===s && <CheckCircle2 size={14} className="text-[#0969DA]"/>}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button type="button" onClick={handleAddColumn} className="neu-btn-primary px-5 py-2.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2 neu-action-btn shrink-0">
            <Plus size={14}/> <span className="hidden sm:inline">Add List</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          <motion.div key={viewMode} initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.98}} transition={{duration:0.2}} className="h-full">
            
            {viewMode==="board" && (
              <div className="h-full overflow-auto custom-scrollbar px-4 sm:px-6 py-6 relative z-10">
                <DragDropContext onDragEnd={onDragEnd}>
                  <StrictModeDroppable droppableId="board" direction="horizontal" type="board">
                    {provided => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="flex items-start gap-6 w-max min-h-full pb-4">
                        {columns.map((col, idx) => (
                          <KanbanColumn key={col.id} column={col} colIndex={idx} index={idx} searchQuery={searchQuery} isSearchActive={isSearchActive} sortMode={sortMode} onAddCard={openAdd} onEditCard={openEdit} onDeleteColumn={handleDeleteColumn} onRenameColumn={handleRenameColumn}/>
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

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {modal && (
          <CardDetailPanel key={modal.card?.id||"new"} card={modal.card} isNew={modal.isNew} columnId={modal.columnId} columns={columns} onSave={handleSave} onDelete={handleDelete} onClose={() => setModal(null)} onMarkComplete={handleMarkComplete} onUndoComplete={handleUndoComplete}/>
        )}
      </AnimatePresence>

      {/* CSS overrides to hide default scrollbars strictly for Kanban inner columns if needed, but custom-scrollbar handles it globally */}
      <style>{`
        /* Force Input Clickability and Text Selection globally */
        input, textarea, select { position: relative; z-index: 20; pointer-events: auto !important; user-select: text !important; -webkit-user-select: text !important; }
        .neu-action-btn { cursor: pointer; transition: all 0.2s ease; position: relative; z-index: 20; user-select: none; -webkit-user-select: none; }
        .neu-action-btn:active:not(:disabled) { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light) !important; }
        .neu-btn-primary { background-color: #0969DA; box-shadow: 3px 3px 8px rgba(9, 105, 218, 0.3); border: none; position: relative; z-index: 20; cursor: pointer; user-select: none; -webkit-user-select: none; }
        .neu-btn-primary:active:not(:disabled) { box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2); }
        button svg { pointer-events: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 4px 0;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #D1DCEB; border-radius: 10px; }
      `}</style>
    </div>
  );
}