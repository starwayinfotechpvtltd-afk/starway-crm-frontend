import React, { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import axios from "axios";
import { differenceInCalendarDays, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderDot, CheckCircle2, Clock, AlertTriangle, Calendar, Eye, 
  Trash2, Edit3, MessageSquare, ExternalLink, Plus, X, ChevronDown, 
  ChevronUp, ChevronRight, Loader2, Briefcase, Send, Shield, Search, 
  Badge as BadgeIcon, KanbanSquare 
} from "lucide-react";
import { useTasks } from "../TaskContext";

const ProjectKanban = React.lazy(() => import("../Admin Pages/Components/Projectkanban"));

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

const PRIORITY_ORDER = { Critical: 1, High: 2, Medium: 3, Low: 4 };

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ── Atom: UI Badge Component ──────────────────────────────────────────────────
const Badge = ({ label, color = C.primary }) => (
  <span 
    className="neu-pressed-sm px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap" 
    style={{ color }}
  >
    {label}
  </span>
);

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

// ── Atom: Priority & Deadlines ────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const cfg = {
    Critical: { color: C.danger },
    High:     { color: C.warning },
    Medium:   { color: C.primary },
    Low:      { color: C.success }
  }[priority] || { color: C.primary };

  return (
    <span className="neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: cfg.color }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {priority}
    </span>
  );
};

const DeadlineLabel = ({ deadline }) => {
  if (!deadline) return null;
  const diff = differenceInCalendarDays(new Date(deadline), new Date());
  const overdue = diff < 0;
  const critical = !overdue && diff <= 1;
  const soon = !overdue && !critical && diff <= 3;
  
  let color = C.textSec;
  if (overdue) color = C.danger;
  else if (critical || soon) color = C.warning;

  return (
    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color }}>
      <Calendar size={12} />
      {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? "Due today" : diff === 1 ? "Due tomorrow" : `${diff}d left`}
    </span>
  );
};

// ── Atom: Spinner ─────────────────────────────────────────────────────────────
const Spinner = ({ size = 14 }) => (
  <Loader2 size={size} className="animate-spin pointer-events-none" />
);

// ── Reusable Shimmer Skeleton ────────────────────────────────────────────────
const Skeleton = ({ width = "100%", height = "20px", rounded = "rounded-md", className = "" }) => (
  <div className={`neu-pressed-sm relative overflow-hidden ${rounded} ${className}`} style={{ width, height }}>
    <div className="absolute inset-0 skeleton-shimmer" />
  </div>
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
      await axios.post(`${API_BASE}/api/tasks/${projectId}/${task._id}/comments`, { text: text.trim() }, { headers: authHeaders() });
      setPosted(true);
      setTimeout(onClose, 900);
    } catch (err) { console.error("Comment error:", err); } 
    finally { setPosting(false); }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} onClick={e => e.stopPropagation()} className="neu-flat rounded-2xl w-full max-w-sm flex flex-col relative z-10 overflow-hidden">
        <div className="p-5 border-b border-[#D1DCEB]/50 flex justify-between items-center bg-[#F0F4F8]">
          <div>
            <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Add Comment</p>
            <p className="text-sm font-bold text-[#1F2328] truncate max-w-[250px]">{task.title}</p>
          </div>
          <button onClick={onClose} className="neu-flat-sm neu-action-btn p-2 rounded-full text-[#656D76] hover:text-[#D1242F]"><X size={16} className="pointer-events-none" /></button>
        </div>
        {posted ? (
          <div className="p-8 text-center text-sm font-bold text-[#1A7F37] flex flex-col items-center gap-2">
            <CheckCircle2 size={32} /> ✓ Comment posted successfully!
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <textarea autoFocus value={text} onChange={e => setText(e.target.value)} placeholder="Type your comment..." rows={4} className="w-full neu-pressed rounded-xl p-4 text-sm font-medium text-[#1F2328] outline-none resize-none custom-scrollbar" />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} disabled={posting} className="neu-flat neu-action-btn px-5 py-2.5 rounded-lg text-xs font-bold text-[#656D76]">Cancel</button>
              <button onClick={submit} disabled={!text.trim() || posting} className="neu-btn-primary px-6 py-2.5 rounded-lg text-xs font-bold text-white flex items-center gap-2 disabled:opacity-50 neu-action-btn">
                {posting ? <Spinner /> : <Send size={14} className="pointer-events-none" />}
                {posting ? "Posting…" : "Post Comment"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ── Global Add Task Modal ─────────────────────────────────────────────────────
const GlobalAddTaskModal = ({ projects, initialProjectId, currentUserId, currentUsername, onClose, onSuccess }) => {
  const activeProjects = useMemo(() => {
    const list = projects.filter(p => p.status !== "Closed");
    const lastId = localStorage.getItem("last_added_project_id");
    return list.sort((a, b) => {
      if (a._id === lastId) return -1;
      if (b._id === lastId) return 1;
      return (a.projectName || "").localeCompare(b.projectName || "");
    });
  }, [projects]);

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || activeProjects[0]?._id || "");
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium", deadline: "", assignedTo: { id: currentUserId, username: currentUsername }, links: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(p => ({ ...p, assignedTo: { id: currentUserId, username: currentUsername } })); }, [selectedProjectId, currentUserId, currentUsername]);

  if (activeProjects.length === 0) {
    return (
      <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} onClick={e => e.stopPropagation()} className="neu-flat rounded-2xl w-full max-w-sm p-8 text-center flex flex-col items-center">
          <div className="neu-pressed-sm p-4 rounded-full text-[#D1242F] mb-4"><AlertTriangle size={32} /></div>
          <h2 className="text-lg font-bold text-[#1F2328] mb-2">No Active Projects</h2>
          <p className="text-xs font-medium text-[#656D76] mb-6">There are no active projects to assign tasks to.</p>
          <button onClick={onClose} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">Close</button>
        </motion.div>
      </div>
    );
  }

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: "" })); };
  const validate = () => { const e = {}; if (!form.title.trim()) e.title = "Required"; if (!form.deadline) e.deadline = "Required"; return e; };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const res = await axios.post(`${API_BASE}/api/tasks/${selectedProjectId}`, { ...form, deadline: form.deadline || null }, { headers: authHeaders() });
      const newTask = res.data?.task || res.data;
      onSuccess?.(newTask, selectedProjectId);
      localStorage.setItem("last_added_project_id", selectedProjectId);
      onClose();
    } catch (err) { console.error("Add task error:", err); } 
    finally { setSaving(false); }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} onClick={e => e.stopPropagation()} className="neu-flat rounded-2xl w-full max-w-md flex flex-col relative z-10 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-[#1F2328]">Create New Task</h2>
          <button onClick={onClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]"><X size={18} className="pointer-events-none" /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          <div className="relative">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Project Target</label>
            <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} disabled={saving} className="w-full neu-pressed rounded-md p-3 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
              {activeProjects.map(p => <option key={p._id} value={p._id}>{p.projectName} {p._id === localStorage.getItem("last_added_project_id") ? "(Last used)" : ""}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 bottom-3.5 text-[#656D76] pointer-events-none" />
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Task Title <span className="text-[#D1242F]">*</span></label>
            <input value={form.title} onChange={e => set("title", e.target.value)} disabled={saving} placeholder="What needs to be done?" className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text" />
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
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Deadline <span className="text-[#D1242F]">*</span></label>
              <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} disabled={saving} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-pointer" />
              {errors.deadline && <span className="text-[9px] font-bold text-[#D1242F] mt-1 block">{errors.deadline}</span>}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={saving} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">Cancel</button>
          {/* Using soft blue button here too for consistency */}
          <button onClick={handleSubmit} disabled={saving} className="neu-btn-soft-blue px-8 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 neu-action-btn">
            {saving ? <Spinner /> : <Plus size={16} className="pointer-events-none" />} {saving ? "Creating…" : "Create task"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Sidebar Task Detail Modal ─────────────────────────────────────────────────
const SidebarTaskDetailModal = ({ task, projectId, projectName, onClose, onTaskComplete }) => {
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    await onTaskComplete(task._id, projectId);
    setCompleting(false);
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} onClick={e => e.stopPropagation()} className="neu-flat rounded-2xl w-full max-w-md flex flex-col relative z-10 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-start shrink-0">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <PriorityBadge priority={task.priority} />
              {task.deadline && <span className="neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold text-[#656D76]"><DeadlineLabel deadline={task.deadline} /></span>}
            </div>
            <h2 className="text-xl font-bold text-[#1F2328] mb-1 leading-tight">{task.title}</h2>
            <p className="text-xs font-bold text-[#0969DA]">{projectName}</p>
          </div>
          <button onClick={onClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F] shrink-0"><X size={16} className="pointer-events-none" /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <h4 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Description</h4>
          {task.description ? (
            <div className="neu-pressed rounded-xl p-5 text-sm font-medium text-[#1F2328] whitespace-pre-wrap leading-relaxed">
              {task.description}
            </div>
          ) : (
            <div className="neu-pressed rounded-xl p-5 text-center text-sm font-medium text-[#656D76] italic">No description provided.</div>
          )}
        </div>

        <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={completing} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">Close</button>
          <button onClick={handleComplete} disabled={completing} className="neu-flat-sm neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#1A7F37] border border-[#1A7F37]/30 flex items-center gap-2 disabled:opacity-50">
            {completing ? <Spinner /> : <CheckCircle2 size={16} className="pointer-events-none" />} {completing ? "Marking..." : "Mark as done"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── TaskCard ──────────────────────────────────────────────────────────────────
const TaskCard = ({ task, projectId, projectName, onTaskComplete, onTaskClick, onOpenKanban, openingKanbanId }) => {
  const [completing, setCompleting] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  const handleComplete = async (e) => {
    e.stopPropagation();
    setCompleting(true);
    await onTaskComplete(task._id, projectId);
  };

  const isKanbanLoading = openingKanbanId === projectId;

  return (
    <>
      <div onClick={() => onTaskClick(task, projectId, projectName)} className="neu-flat-sm rounded-xl p-4 mb-4 cursor-pointer neu-action-btn transition-transform hover:-translate-y-0.5 group">
        <div className="flex gap-2 flex-wrap items-center mb-3">
          <PriorityBadge priority={task.priority} />
          {task.deadline && <span className="neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold text-[#656D76]"><DeadlineLabel deadline={task.deadline} /></span>}
        </div>
        
        <h4 className="text-sm font-bold text-[#1F2328] mb-1.5 leading-snug group-hover:text-[#0969DA] transition-colors">{task.title}</h4>
        <p className="text-[10px] font-bold text-[#656D76] truncate mb-4">{projectName}</p>
        
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#D1DCEB]/50">
          <button onClick={handleComplete} disabled={completing} className="neu-flat-sm neu-action-btn px-3 py-1.5 rounded-md text-[10px] font-bold text-[#1A7F37] border border-[#1A7F37]/30 flex items-center gap-1.5 disabled:opacity-50">
            {completing ? <Spinner size={12}/> : <CheckCircle2 size={12} className="pointer-events-none"/>} Done
          </button>
          <button onClick={e => { e.stopPropagation(); setCommentOpen(true); }} disabled={completing} className="neu-flat-sm neu-action-btn px-3 py-1.5 rounded-md text-[10px] font-bold text-[#656D76] flex items-center gap-1.5">
            <MessageSquare size={12} className="pointer-events-none"/> Comment
          </button>
          <button onClick={e => { e.stopPropagation(); onOpenKanban(projectId); }} disabled={isKanbanLoading || completing} className="ml-auto neu-flat-sm neu-action-btn px-3 py-1.5 rounded-md text-[10px] font-bold text-[#0969DA] flex items-center gap-1.5 disabled:opacity-50">
            {isKanbanLoading ? <Spinner size={12}/> : <FolderDot size={12} className="pointer-events-none"/>} Board ↗
          </button>
        </div>
      </div>
      {commentOpen && <CommentModal task={task} projectId={projectId} onClose={() => setCommentOpen(false)} />}
    </>
  );
};

// ── ProjectCard ───────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onAddTaskTrigger, onOpenKanban, openingKanbanId }) => {
  const closed = project.status === "Closed";
  const [expanded, setExpanded] = useState(false);
  const isKanbanLoading = openingKanbanId === project._id;

  return (
    <div className={`neu-flat rounded-2xl mb-5 transition-all duration-300 ${closed ? "opacity-60" : "opacity-100"}`}>
      <div onClick={() => setExpanded(!expanded)} className={`p-5 flex items-center gap-4 cursor-pointer neu-action-btn rounded-2xl transition-colors ${expanded ? "neu-pressed" : ""}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${closed ? "neu-pressed-sm text-[#656D76]" : "neu-btn-primary text-white"}`}>
          {closed ? <Shield size={18}/> : <FolderDot size={18}/>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className={`text-base font-bold truncate ${closed ? "text-[#656D76]" : "text-[#1F2328]"}`}>{project.projectName}</h3>
            <span className={`neu-pressed-sm px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${closed ? "text-[#D1242F]" : "text-[#1A7F37]"}`}>{project.status}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(project.serviceType || []).map((s, i) => <Badge key={i} label={s} color={C.primary} />)}
            {project.subscriptionType && <Badge label={project.subscriptionType} color={C.textSec} />}
          </div>
        </div>
        <ChevronDown size={18} className={`text-[#656D76] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-6 border-t border-[#D1DCEB]/50 bg-[#F0F4F8]/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div className="neu-pressed rounded-xl p-4">
                  <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Business Niche</p>
                  <p className="text-sm font-bold text-[#1F2328]">{project.businessNiche || "—"}</p>
                </div>
                <div className="neu-pressed rounded-xl p-4">
                  <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Reference Site</p>
                  {project.referenceSite ? (
                    <a href={project.referenceSite} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#0969DA] hover:underline truncate block">
                      {project.referenceSite.replace(/^https?:\/\//, "")}
                    </a>
                  ) : <p className="text-sm font-bold text-[#1f281f]">None</p>}
                </div>
              </div>
              
              {project.projectDetails && (
                <div className="neu-pressed rounded-xl p-5 mb-6">
                  <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Project Details</p>
                  <p className="text-sm font-medium text-[#1F2328] whitespace-pre-wrap leading-relaxed">{project.projectDetails}</p>
                </div>
              )}

              {!closed && (
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={e => { e.stopPropagation(); onOpenKanban(project._id); }} disabled={isKanbanLoading} className="neu-flat neu-action-btn px-5 py-2.5 rounded-lg text-xs font-bold text-[#0969DA] flex items-center gap-2 disabled:opacity-50">
                    {isKanbanLoading ? <Spinner /> : <KanbanSquare size={14} className="pointer-events-none"/>} Open Board
                  </button>
                  {/* Using the soft blue button here too */}
                  <button onClick={e => { e.stopPropagation(); onAddTaskTrigger(project._id); }} disabled={isKanbanLoading} className="neu-btn-soft-blue px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 neu-action-btn disabled:opacity-50">
                    <Plus size={14} className="pointer-events-none"/> Add Task
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── FilterSelect ──────────────────────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-[130px] relative z-20">
    <label className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider pl-1">{label}</label>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full neu-pressed rounded-md py-2 px-3 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
    </div>
  </div>
);

// ── Skeleton Loader Card for Sidebar ──────────────────────────────────────────
const SkeletonCard = () => (
  <div className="neu-flat-sm rounded-xl p-4 mb-4">
    <div className="flex gap-2 flex-wrap mb-3">
        <Skeleton width="60px" height="18px" />
        <Skeleton width="80px" height="18px" />
    </div>
    <Skeleton width="85%" height="16px" className="mb-2" />
    <Skeleton width="40%" height="10px" className="mb-4" />
    <div className="flex gap-2 pt-3 border-t border-[#D1DCEB]/50">
        <Skeleton width="60px" height="28px" />
        <Skeleton width="80px" height="28px" />
    </div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const DeveloperDashboard = () => {
  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "Developer";

  const { 
    projects, 
    pendingTasks, 
    completions, 
    loading: loadingInitial, 
    completeTask, 
    addTaskToState, 
    refreshData 
  } = useTasks();

  const [kanbanProject, setKanbanProject] = useState(null);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const [openingKanbanId, setOpeningKanbanId] = useState(null);

  const [activeTab, setActiveTab] = useState("projects");

  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddInitialProject, setQuickAddInitialProject] = useState("");
  const [selectedSidebarTask, setSelectedSidebarTask] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  const [search, setSearch] = useState("");
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const showToast = (msg, sev = "success") => setToast({ open: true, msg, sev });

  const handleTaskComplete = async (taskId, projectId) => {
    await completeTask(taskId, projectId);
    showToast("Task marked as done! 🎉");
  };

  const handleQuickAddSuccess = (newTask, projectId) => {
    addTaskToState(newTask, projectId);
    showToast("Task created successfully");
  };

  const handleOpenKanban = useCallback((pId) => {
    setOpeningKanbanId(pId);
    const target = projects.find(p => p._id === pId);
    setTimeout(() => {
      if (target) { setKanbanProject(target); setKanbanOpen(true); }
      setOpeningKanbanId(null);
    }, 450);
  }, [projects]);

  const allPendingTasks = useMemo(() => {
    return [...pendingTasks].sort((a, b) => {
      const orderA = PRIORITY_ORDER[a.priority] || 99;
      const orderB = PRIORITY_ORDER[b.priority] || 99;
      if (orderA !== orderB) return orderA - orderB;
      const aD = a.deadline ? differenceInCalendarDays(new Date(a.deadline), new Date()) : 999;
      const bD = b.deadline ? differenceInCalendarDays(new Date(b.deadline), new Date()) : 999;
      return aD - bD;
    });
  }, [pendingTasks]);

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
    <div className="h-[93vh] w-full flex flex-col overflow-hidden neu-base montserrat-regular text-[#1F2328] relative">
      
      {/* ── Main Layout Split ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT: Main Workspace ── */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[#D1DCEB]/50">
          
          {/* Top Bar (Visible even while loading) */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#D1DCEB]/50 bg-[#F0F4F8] shrink-0 z-20 h-[72px]">
            <div className="neu-pressed p-1.5 rounded-lg inline-flex gap-2">
              <button onClick={() => setActiveTab("projects")} className={`px-5 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all neu-action-btn flex items-center gap-2 ${activeTab === "projects" ? "neu-flat text-[#0969DA]" : "text-[#656D76] bg-transparent shadow-none"}`}>
                Projects {!loadingInitial && <span className="neu-pressed-sm px-2 py-0.5 rounded text-[8px] text-[#656D76] pointer-events-none">{filteredProjects.length}</span>}
              </button>
              <button onClick={() => setActiveTab("completed")} className={`px-5 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all neu-action-btn flex items-center gap-2 ${activeTab === "completed" ? "neu-flat text-[#1A7F37]" : "text-[#656D76] bg-transparent shadow-none"}`}>
                History {!loadingInitial && <span className="neu-pressed-sm px-2 py-0.5 rounded text-[8px] text-[#656D76] pointer-events-none">{completions.length}</span>}
              </button>
            </div>
            
            {/* The New Soft Blue Button */}
            <button onClick={() => { setQuickAddInitialProject(""); setQuickAddModalOpen(true); }} className="neu-btn-soft-blue px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 neu-action-btn">
              <Plus size={14} className="pointer-events-none"/> New Task
            </button>
          </div>

          {/* Content Area */}
          {loadingInitial ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Fake Filter Bar */}
              <div className="p-5 border-b border-[#D1DCEB]/50 bg-[#F0F4F8] shrink-0 flex flex-wrap gap-4 items-end z-10">
                <div className="flex-1 min-w-[200px]"><Skeleton width="100%" height="36px" /></div>
                <div className="w-[130px]"><Skeleton width="100%" height="36px" /></div>
                <div className="w-[130px]"><Skeleton width="100%" height="36px" /></div>
                <div className="w-[130px]"><Skeleton width="100%" height="36px" /></div>
              </div>
              {/* Fake Project List */}
              <div className="flex-1 p-6 space-y-5 overflow-hidden">
                {[1,2,3,4].map(i => (
                  <div key={i} className="neu-flat rounded-2xl p-5 flex items-center gap-4">
                    <Skeleton width="40px" height="40px" rounded="rounded-xl" className="shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-3 items-center">
                        <Skeleton width="180px" height="16px" />
                        <Skeleton width="50px" height="14px" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton width="70px" height="14px" />
                        <Skeleton width="90px" height="14px" />
                      </div>
                    </div>
                    <Skeleton width="18px" height="18px" rounded="rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "projects" ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Filter Bar */}
              <div className="p-5 border-b border-[#D1DCEB]/50 bg-[#F0F4F8] shrink-0 flex flex-wrap gap-4 items-end z-10 relative">
                <div className="flex-1 min-w-[200px] relative z-20">
                  <label className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider pl-1 mb-1.5 block">Search</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Project name or client…" className="w-full neu-pressed rounded-md py-2 pl-9 pr-3 text-xs font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                  </div>
                </div>
                <FilterSelect label="Created by" value={filterCreatedBy} onChange={setFilterCreatedBy} options={createdByOptions} />
                <FilterSelect label="Subscription" value={filterSub} onChange={setFilterSub} options={subOptions} />
                <FilterSelect label="Service" value={filterService} onChange={setFilterService} options={serviceOptions} />
                <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={["Active", "Closed"]} />
                {(search || filterCreatedBy || filterSub || filterService || filterStatus) && (
                  <button onClick={() => { setSearch(""); setFilterCreatedBy(""); setFilterSub(""); setFilterService(""); setFilterStatus(""); }} className="neu-flat-sm neu-action-btn px-4 py-2 rounded-md text-[10px] font-bold text-[#D1242F] uppercase tracking-wider shrink-0 mb-[1px]">
                    Clear
                  </button>
                )}
              </div>
              
              {/* Projects List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center">
                    <div className="neu-pressed-sm p-6 rounded-full mb-4 text-[#656D76] opacity-50"><FolderDot size={32}/></div>
                    <p className="text-lg font-bold text-[#1F2328] mb-1">No Projects Found</p>
                    <p className="text-xs font-medium text-[#656D76]">Try adjusting or clearing your filters.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredProjects.map(p => (
                      <ProjectCard key={p._id} project={p} onOpenKanban={handleOpenKanban} openingKanbanId={openingKanbanId} onAddTaskTrigger={(projId) => { setQuickAddInitialProject(projId); setQuickAddModalOpen(true); }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
              {completions.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="neu-pressed-sm p-6 rounded-full mb-4 text-[#1A7F37] opacity-50"><CheckCircle2 size={32}/></div>
                  <p className="text-lg font-bold text-[#1F2328] mb-1">No Completed Tasks</p>
                  <p className="text-xs font-medium text-[#656D76]">Tasks you mark as done will appear here.</p>
                </div>
              ) : (
                Object.entries(groupedCompletedTasks).map(([groupName, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={groupName} className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-widest">{groupName}</span>
                        <span className="neu-pressed-sm px-2 py-0.5 rounded text-[9px] font-bold text-[#656D76]">{items.length}</span>
                        <div className="flex-1 h-[2px] neu-pressed-sm opacity-50" />
                      </div>
                      <div className="space-y-3">
                        {items.map((item, idx) => (
                          <div key={idx} className="neu-flat rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-[#D1DCEB]/10 cursor-default">
                            <div className="w-8 h-8 rounded-full neu-btn-primary flex items-center justify-center shrink-0 text-white text-[10px] font-bold bg-[#1A7F37] shadow-none border-2 border-[#F0F4F8]">✓</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#1F2328] mb-1 truncate">{item.taskTitle}</p>
                              <p className="text-[10px] font-bold text-[#0969DA] uppercase tracking-wider truncate">{item.projectName}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">By {item.completedBy?.username}</p>
                              {item.completedAt && <p className="neu-pressed-sm px-2 py-1 rounded-md text-[9px] font-bold text-[#656D76]">{format(new Date(item.completedAt), "MMM d · h:mm a")}</p>}
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
        <div className="w-[380px] shrink-0 flex flex-col min-h-0 bg-[#F0F4F8]">
          <div className="p-6 border-b border-[#D1DCEB]/50 shrink-0 h-[72px] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1F2328]">My Tasks</h2>
              <p className="text-[10px] font-bold text-[#0969DA] uppercase tracking-wider mt-0.5">{loadingInitial ? "Syncing…" : `${allPendingTasks.length} pending`}</p>
            </div>
            {!loadingInitial && (overdueCount > 0 || urgentCount > 0) && (
              <div className="flex gap-2">
                {overdueCount > 0 && <span className="neu-pressed-sm px-2 py-1 rounded bg-[#D1242F]/10 border border-[#D1242F]/20 text-[9px] font-bold text-[#D1242F] uppercase tracking-wider">{overdueCount} overdue</span>}
                {urgentCount > 0 && <span className="neu-pressed-sm px-2 py-1 rounded bg-[#BF8700]/10 border border-[#BF8700]/20 text-[9px] font-bold text-[#BF8700] uppercase tracking-wider">{urgentCount} urgent</span>}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {loadingInitial ? (
              <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
            ) : allPendingTasks.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="neu-pressed-sm p-5 rounded-full mb-4 text-[#1A7F37] opacity-50"><CheckCircle2 size={24}/></div>
                <p className="text-sm font-bold text-[#1F2328] mb-1">All caught up!</p>
                <p className="text-[10px] font-bold text-[#656D76]">No pending tasks assigned to you.</p>
              </div>
            ) : (
              allPendingTasks.map(t => (
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Modals & Overlays ── */}
      {kanbanProject && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#F0F4F8]/85 backdrop-blur-sm">
             <div className="neu-flat rounded-2xl p-8 flex items-center gap-4">
                <div className="w-6 h-6 border-4 border-[#D1DCEB] border-t-[#0969DA] rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">Loading Board...</span>
             </div>
          </div>
        }>
          <ProjectKanban
            open={kanbanOpen}
            onClose={() => { 
              setKanbanOpen(false); 
              setKanbanProject(null); 
              refreshData(true); 
            }}
            project={kanbanProject}
          />
        </Suspense>
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
          onClose={() => setSelectedSidebarTask(null)}
          onTaskComplete={handleTaskComplete}
        />
      )}

      <AnimatePresence>
        {toast.open && (
          <motion.div initial={{ opacity:0, y:50, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.9 }} className="fixed bottom-6 right-6 z-[999999] flex items-center gap-4 neu-flat rounded-xl p-4 montserrat-medium max-w-sm">
            <div className={`neu-pressed-sm p-2 rounded-full shrink-0 ${toast.sev === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
               {toast.sev === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            </div>
            <span className={`text-xs font-bold ${toast.sev === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>{toast.msg}</span>
            <button type="button" onClick={() => setToast(p=>({...p, open:false}))} className="neu-flat-sm neu-action-btn rounded-lg p-1.5 text-[#656D76] ml-auto shrink-0"><X size={12} className="pointer-events-none" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Neumorphism CSS */}
      <style>{`
        :root {
          --neu-bg: #F0F4F8; 
          --neu-light: #FFFFFF;
          --neu-dark: #D1DCEB;
        }
        .neu-base { background-color: var(--neu-bg); }
        .neu-flat { background-color: var(--neu-bg); box-shadow: 5px 5px 10px var(--neu-dark), -5px -5px 10px var(--neu-light); }
        .neu-flat-sm { background-color: var(--neu-bg); box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); }
        .neu-pressed { background-color: var(--neu-bg); box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light); }
        .neu-pressed-sm { background-color: var(--neu-bg); box-shadow: inset 1.5px 1.5px 3px var(--neu-dark), inset -1.5px -1.5px 3px var(--neu-light); }
        
        .neu-btn-primary { background-color: #0969DA; box-shadow: 3px 3px 8px rgba(9, 105, 218, 0.3); border: none; }
        .neu-btn-primary:active:not(:disabled) { box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2); }
        
        /* Soft Ice Blue Neumorphic Button */
        .neu-btn-soft-blue {
          background-color: #E8F1FC;
          color: #0969DA;
          box-shadow: 4px 4px 8px var(--neu-dark), -4px -4px 8px var(--neu-light);
          border: none;
        }
        .neu-btn-soft-blue:active:not(:disabled) {
          box-shadow: inset 2px 2px 5px rgba(9, 105, 218, 0.2), inset -2px -2px 5px #FFFFFF;
          background-color: #E0EBF8;
        }

        .neu-action-btn { cursor: pointer; transition: all 0.2s ease; position: relative; z-index: 20; user-select: none; -webkit-user-select: none; }
        .neu-action-btn:active:not(:disabled, .neu-btn-soft-blue, .neu-btn-primary) { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light) !important; }
        
        input, textarea, select { position: relative; z-index: 20; pointer-events: auto !important; user-select: text !important; -webkit-user-select: text !important; }
        select { cursor: pointer !important; -moz-appearance: none; -webkit-appearance: none; appearance: none; }
        button svg { pointer-events: none !important; }

        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px var(--neu-bg) inset !important; -webkit-text-fill-color: #1F2328 !important; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 4px 0;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }

        /* Smoother Glass-like Shimmer Animation */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          background: linear-gradient(
            90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.5) 50%, 
            transparent 100%
          );
          animation: shimmer 1.8s infinite linear;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 0.75s linear infinite; vertical-align: middle; }
      `}</style>
    </div>
  );
}

export default DeveloperDashboard;  