import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  format,
  isBefore,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  differenceInCalendarDays,
  addMonths,
  subMonths,
} from "date-fns";
import {
  X,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Link as LinkIcon,
  Calendar,
  History,
  KanbanSquare,
  BarChart,
  List,
  Send,
  MessageSquare,
  Filter,
  Loader2,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Flag,
  FolderDot,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit3,
  User,
  Check,
  Clock,
  ExternalLink,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const PRIORITY_CONFIG = {
  Low: { color: "#10B981", variant: "green", icon: <ArrowDown size={12} /> },
  Medium: { color: "#2563EB", variant: "blue", icon: <ArrowRight size={12} /> },
  High: { color: "#D97706", variant: "amber", icon: <ArrowUp size={12} /> },
  Critical: { color: "#DC2626", variant: "red", icon: <Flag size={12} /> },
};

const COLUMNS = [
  { id: "Todo", label: "To Do", color: "#64748B", dot: "bg-slate-400" },
  { id: "In Progress", label: "In Progress", color: "#2563EB", dot: "bg-blue-600" },
  { id: "Done", label: "Done", color: "#16A34A", dot: "bg-emerald-600" },
];

const AVATAR_PALETTE = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#8B5CF6", "#06B6D4"];
const stringToColor = (s) => {
  if (!s) return AVATAR_PALETTE[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "x-timezone-offset": new Date().getTimezoneOffset().toString(),
});
const todayStr = () => format(new Date(), "yyyy-MM-dd");

// Helper to check if a task is within 2 hours of creation
const isTaskWithin2Hours = (task) => {
  if (!task) return false;
  let createdTime = 0;
  if (task.createdAt) {
    createdTime = new Date(task.createdAt).getTime();
  } else if (task._id && typeof task._id === "string" && task._id.length === 24) {
    createdTime = parseInt(task._id.substring(0, 8), 16) * 1000;
  }
  if (!createdTime) return false;
  return Date.now() - createdTime <= 2 * 60 * 60 * 1000;
};

// ── Small Helpers ─────────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
        priority === "Critical"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : priority === "High"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : priority === "Medium"
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}
    >
      {cfg.icon} {priority}
    </span>
  );
};

const DeadlineChip = ({ deadline }) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const diff = differenceInCalendarDays(d, new Date());

  const isOverdue = diff < 0;
  const isCritical = diff === 0 || diff === 1;
  const isSoon = diff > 1 && diff <= 3;

  let badgeStyle = "bg-slate-50 text-slate-600 border-slate-200";
  let label = format(d, "MMM d");
  let icon = <Calendar size={11} />;

  if (isOverdue) {
    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
    label = `OVERDUE (${Math.abs(diff)}d)`;
    icon = <AlertTriangle size={11} />;
  } else if (isCritical) {
    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
    label = diff === 0 ? "Due Today" : "Due Tomorrow";
    icon = <AlertCircle size={11} />;
  } else if (isSoon) {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
    label = `Due in ${diff}d`;
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border ${badgeStyle}`}>
      {icon} {label}
    </span>
  );
};

// ── Comments Panel ────────────────────────────────────────────────────────────
const CommentsPanel = ({ taskId, projectId, currentUserId, currentUsername }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef(null);

  const fetchComments = useCallback(async () => {
    if (!taskId || !projectId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/tasks/${projectId}/${taskId}/comments`, {
        headers: authHeaders(),
      });
      setComments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [taskId, projectId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const postComment = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/tasks/${projectId}/${taskId}/comments`,
        { text: text.trim() },
        { headers: authHeaders() }
      );
      setComments(res.data || []);
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5]">
      <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 font-medium">
            No comments yet. Start the conversation below.
          </div>
        ) : (
          comments.map((c, i) => {
            const isMe = c.author?.id === currentUserId || c.author === currentUsername;
            return (
              <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-slate-700">
                    {c.author?.username || c.author || "User"}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {c.createdAt && format(new Date(c.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-lg text-xs font-medium max-w-[85%] whitespace-pre-wrap ${
                    isMe
                      ? "bg-[#1E40AF] text-white rounded-tr-none shadow-xs"
                      : "bg-white text-slate-800 border border-[#EAE3D6] rounded-tl-none shadow-xs"
                  }`}
                >
                  {c.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white border-t border-[#EAE3D6] flex gap-2">
        <textarea
          rows={2}
          placeholder="Type a comment or status update..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              postComment();
            }
          }}
          className="flex-1 ent-input text-xs resize-none p-2"
        />
        <button
          type="button"
          onClick={postComment}
          disabled={!text.trim() || posting}
          className="ent-btn-primary px-3 self-end shrink-0 disabled:opacity-50"
        >
          {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
};

// ── Task Detail Modal ─────────────────────────────────────────────────────────
const TaskDetailDialog = ({
  open,
  onClose,
  task,
  projectId,
  currentUserId,
  currentUsername,
  canEdit,
  onEdit,
  canDelete,
  onDelete,
}) => {
  const [tab, setTab] = useState("details");
  if (!task) return null;
  const isDone = task.status === "Done";

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={task.title}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
                className="ent-btn-secondary text-xs"
              >
                <Edit size={13} /> Edit
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(task._id);
                  onClose();
                }}
                className="ent-btn-secondary text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} className="ent-btn-secondary text-xs">
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs -mt-2">
        {/* Priority & Status Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
          <PriorityBadge priority={task.priority} />
          {!isDone && <DeadlineChip deadline={task.deadline} />}
          {isDone && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
              <CheckCircle2 size={11} /> COMPLETED
            </span>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            type="button"
            onClick={() => setTab("details")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              tab === "details" ? "bg-[#1E40AF] text-white" : "text-slate-600 hover:bg-[#FAF8F5]"
            }`}
          >
            Deliverable Details
          </button>
          <button
            type="button"
            onClick={() => setTab("comments")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
              tab === "comments" ? "bg-[#1E40AF] text-white" : "text-slate-600 hover:bg-[#FAF8F5]"
            }`}
          >
            <MessageSquare size={13} /> Comments & Activity
          </button>
        </div>

        {tab === "details" ? (
          <div className="space-y-4 pt-1">
            {task.description && (
              <div className="p-3 bg-[#FAF8F5] rounded border border-[#EAE3D6]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Description / Criteria
                </span>
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded border border-[#EAE3D6]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Assigned Developer
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: stringToColor(task.assignedTo?.username) }}
                  >
                    {task.assignedTo?.username?.charAt(0).toUpperCase() || "D"}
                  </div>
                  <span className="font-bold text-slate-800">
                    {task.assignedTo?.username || "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded border border-[#EAE3D6]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Deadline
                </span>
                <div className="font-bold text-slate-800">
                  {task.deadline ? format(new Date(task.deadline), "MMM d, yyyy") : "No fixed deadline"}
                </div>
              </div>
            </div>

            {task.links?.length > 0 && (
              <div className="p-3 bg-white rounded border border-[#EAE3D6] space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Reference Links
                </span>
                <div className="flex flex-col gap-1">
                  {task.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1E40AF] hover:underline font-semibold inline-flex items-center gap-1 truncate"
                    >
                      <ExternalLink size={12} /> {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[280px] rounded border border-[#EAE3D6] overflow-hidden">
            <CommentsPanel
              taskId={task._id}
              projectId={projectId}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

// ── Task Card on Kanban Column ────────────────────────────────────────────────
const TaskCard = ({
  task,
  currentUserId,
  isCreator,
  isAdmin,
  isDeveloper,
  onEdit,
  onDelete,
  onComplete,
  onDragStart,
  onDragEnd,
  onClick,
}) => {
  const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
  const isDone = task.status === "Done";

  const canEdit = isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(task));
  const canDelete = isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(task));
  const canComplete = (isAssigned || isAdmin) && !isDone;
  const canDrag = isAdmin || isCreator || isDeveloper;

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => canDrag && onDragStart(e, task)}
      onDragEnd={canDrag ? onDragEnd : undefined}
      onClick={() => onClick(task)}
      className={`ent-card p-3.5 mb-3 bg-white border-[#EAE3D6] shadow-xs hover:border-[#1E40AF]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-2.5 ${
        isDone ? "opacity-80 bg-emerald-50/20 border-emerald-200" : ""
      }`}
    >
      <div>
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          <PriorityBadge priority={task.priority} />
          {!isDone && <DeadlineChip deadline={task.deadline} />}
          {isDone && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
              <Check size={10} /> Done
            </span>
          )}
        </div>

        <h4 className={`text-xs font-bold text-slate-900 leading-snug ${isDone ? "line-through text-slate-400" : ""}`}>
          {task.title}
        </h4>

        {task.description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ backgroundColor: stringToColor(task.assignedTo?.username) }}
          >
            {task.assignedTo?.username?.charAt(0).toUpperCase() || "D"}
          </div>
          <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[100px]">
            {task.assignedTo?.username || "Unassigned"}
          </span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {canComplete && (
            <button
              type="button"
              onClick={() => onComplete(task)}
              className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              title="Mark Complete"
            >
              <Check size={12} />
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="p-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              title="Edit Task"
            >
              <Edit3 size={12} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(task._id)}
              className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
              title="Delete Task"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Kanban Column ─────────────────────────────────────────────────────────────
const KanbanColumn = ({
  column,
  tasks,
  currentUserId,
  isCreator,
  isAdmin,
  isDeveloper,
  canAddTask,
  onAddTask,
  onEdit,
  onDelete,
  onComplete,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onCardClick,
}) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
        onDragOver(e);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        setIsOver(false);
        onDrop(e, column.id);
      }}
      className={`w-[320px] shrink-0 h-full flex flex-col rounded-xl border transition-all duration-200 bg-[#FAF8F5] ${
        isOver ? "border-[#1E40AF] ring-2 ring-[#1E40AF]/20" : "border-[#EAE3D6]"
      }`}
    >
      <div className="p-3.5 border-b border-[#EAE3D6] flex items-center justify-between bg-white rounded-t-xl shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {column.label}
          </h3>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF8F5] border border-[#EAE3D6] text-slate-700">
            {tasks.length}
          </span>
        </div>

        {canAddTask && column.id === "Todo" && (
          <button
            type="button"
            onClick={onAddTask}
            className="p-1 rounded bg-[#EFF6FF] text-[#1E40AF] hover:bg-[#DBEAFE] border border-[#BFDBFE]"
            title="Add task"
          >
            <Plus size={13} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 font-medium">
            Drop tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              currentUserId={currentUserId}
              isCreator={isCreator}
              isAdmin={isAdmin}
              isDeveloper={isDeveloper}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ── Main ProjectKanban Component ──────────────────────────────────────────────
export default function ProjectKanban({ open, onClose, project }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kanban"); // "kanban" | "list" | "scheduled" | "history"

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDeveloper, setFilterDeveloper] = useState("");

  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "User";
  const userRole = localStorage.getItem("role") || "developer";
  const isAdmin = userRole === "admin";
  const isDeveloper = userRole === "developer";
  const isCreator = project?.createdBy === currentUsername;
  const canAddTask = true;

  const projectDevelopers = useMemo(() => {
    if (!project?.assignedDeveloper) return [];
    return project.assignedDeveloper
      .map((d) => (typeof d === "object" ? { id: d._id || d.id, username: d.username } : { id: d, username: "Developer" }))
      .filter(Boolean);
  }, [project]);

  const fetchTasks = useCallback(async () => {
    if (!project?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/tasks/${project._id}`, { headers: authHeaders() });
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [project?._id]);

  useEffect(() => {
    if (open) fetchTasks();
  }, [open, fetchTasks]);

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("text/plain", task._id);
  };
  const handleDragEnd = () => {};
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === columnId) return;

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: columnId } : t)));
    try {
      await axios.put(
        `${API_BASE}/api/tasks/${project._id}/${taskId}/status`,
        { status: columnId },
        { headers: authHeaders() }
      );
    } catch (err) {
      fetchTasks();
    }
  };

  const handleComplete = async (task) => {
    try {
      await axios.post(`${API_BASE}/api/tasks/${project._id}/${task._id}/complete`, {}, { headers: authHeaders() });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API_BASE}/api/tasks/${project._id}/${taskId}`, { headers: authHeaders() });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const s = search.toLowerCase();
      const matchSearch = !search || t.title?.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s);
      const matchPriority = !filterPriority || t.priority === filterPriority;
      const matchDev = !filterDeveloper || t.assignedTo?.id === filterDeveloper;
      return matchSearch && matchPriority && matchDev;
    });
  }, [tasks, search, filterPriority, filterDeveloper]);

  const tasksByStatus = (status) => filteredTasks.filter((t) => t.status === status);

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE3D6] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <KanbanSquare size={18} className="text-[#1E40AF]" />
                {project.projectName}
              </h2>
              <Badge variant={project.status === "Closed" ? "neutral" : "green"}>
                {project.status || "ACTIVE"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client: <span className="font-semibold text-slate-700">{project.clientName || "Direct"}</span> •
              Niche: <span className="font-semibold text-slate-700">{project.businessNiche || "General"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setTaskFormOpen(true);
              }}
              className="ent-btn-primary text-xs"
            >
              <Plus size={13} /> Add Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter & View Bar */}
        <div className="px-4 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("kanban")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeTab === "kanban" ? "bg-[#1E40AF] text-white" : "text-slate-600 hover:bg-[#FAF8F5]"
              }`}
            >
              Board View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeTab === "list" ? "bg-[#1E40AF] text-white" : "text-slate-600 hover:bg-[#FAF8F5]"
              }`}
            >
              List View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ent-input text-xs py-1 px-2.5 w-44"
            />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="ent-select text-xs py-1 font-semibold"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Workspace Viewport */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-[#FAF8F5]">
          {loading ? (
            <div className="flex h-full items-center justify-center text-xs font-bold text-slate-500 gap-2">
              <Loader2 size={18} className="animate-spin text-[#1E40AF]" /> Loading project board...
            </div>
          ) : activeTab === "kanban" ? (
            <div className="flex gap-4 h-full overflow-x-auto custom-scrollbar items-start pb-2">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={tasksByStatus(col.id)}
                  currentUserId={currentUserId}
                  isCreator={isCreator}
                  isAdmin={isAdmin}
                  isDeveloper={isDeveloper}
                  canAddTask={canAddTask}
                  onAddTask={() => {
                    setEditingTask(null);
                    setTaskFormOpen(true);
                  }}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setTaskFormOpen(true);
                  }}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onCardClick={setDetailTask}
                />
              ))}
            </div>
          ) : (
            <div className="h-full overflow-y-auto custom-scrollbar bg-white rounded-xl border border-[#EAE3D6]">
              <table className="ent-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                    <th>Assigned Developer</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">
                        No tasks match the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => (
                      <tr key={t._id} onClick={() => setDetailTask(t)} className="cursor-pointer hover:bg-[#FAF8F5]">
                        <td className="font-bold text-slate-900 text-xs">{t.title}</td>
                        <td><PriorityBadge priority={t.priority} /></td>
                        <td>{t.deadline ? format(new Date(t.deadline), "MMM d, yyyy") : "—"}</td>
                        <td>
                          <span className="font-semibold text-xs text-slate-700">
                            {t.assignedTo?.username || "Unassigned"}
                          </span>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {t.status}
                          </span>
                        </td>
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {t.status !== "Done" && (
                              <button
                                type="button"
                                onClick={() => handleComplete(t)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                              >
                                Done
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTask(t);
                                setTaskFormOpen(true);
                              }}
                              className="ent-btn-secondary text-xs py-1 px-2"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {taskFormOpen && (
        <TaskFormModal
          isOpen={taskFormOpen}
          onClose={() => {
            setTaskFormOpen(false);
            setEditingTask(null);
          }}
          initialData={editingTask}
          projectId={project._id}
          projectDevelopers={projectDevelopers}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
          onSuccess={() => {
            setTaskFormOpen(false);
            setEditingTask(null);
            fetchTasks();
          }}
        />
      )}

      {/* Task Detail Modal */}
      {detailTask && (
        <TaskDetailDialog
          open={Boolean(detailTask)}
          onClose={() => setDetailTask(null)}
          task={detailTask}
          projectId={project._id}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
          canEdit={isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(detailTask))}
          canDelete={isAdmin || isCreator || (isDeveloper && isTaskWithin2Hours(detailTask))}
          onEdit={(task) => {
            setDetailTask(null);
            setEditingTask(task);
            setTaskFormOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// ── Task Form Modal ───────────────────────────────────────────────────────────
function TaskFormModal({ isOpen, onClose, initialData, projectId, projectDevelopers, currentUserId, currentUsername, onSuccess }) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "Medium",
    deadline: initialData?.deadline ? format(new Date(initialData.deadline), "yyyy-MM-dd") : "",
    assignedTo: initialData?.assignedTo || { id: currentUserId, username: currentUsername },
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (initialData) {
        await axios.put(`${API_BASE}/api/tasks/${projectId}/${initialData._id}`, form, { headers: authHeaders() });
      } else {
        await axios.post(`${API_BASE}/api/tasks/${projectId}`, form, { headers: authHeaders() });
      }
      onSuccess();
    } catch (err) {
      alert("Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Task" : "Create New Task"}
      maxWidth="max-w-md"
      footer={
        <>
          <button type="button" onClick={onClose} className="ent-btn-secondary">
            Cancel
          </button>
          <button type="submit" form="kanban-task-form" disabled={saving} className="ent-btn-primary">
            {saving ? "Saving..." : initialData ? "Save Changes" : "Create Task"}
          </button>
        </>
      }
    >
      <form id="kanban-task-form" onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="ent-label">Task Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="ent-input text-xs font-bold"
            placeholder="e.g. Implement Navigation & Auth flow"
          />
        </div>

        <div>
          <label className="ent-label">Description / Criteria</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="ent-input text-xs resize-none"
            placeholder="Details, specs, criteria..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="ent-label">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="ent-select text-xs font-semibold"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="ent-label">Deadline</label>
            <input
              type="date"
              min={todayStr()}
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="ent-input text-xs font-mono"
            />
          </div>
        </div>

        {projectDevelopers.length > 0 && (
          <div>
            <label className="ent-label">Assign Developer</label>
            <select
              value={form.assignedTo?.id || ""}
              onChange={(e) => {
                const dev = projectDevelopers.find((d) => d.id === e.target.value);
                if (dev) setForm({ ...form, assignedTo: dev });
              }}
              className="ent-select text-xs font-semibold"
            >
              {projectDevelopers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.username} {d.id === currentUserId ? "(You)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
}