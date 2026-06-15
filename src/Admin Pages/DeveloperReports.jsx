import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Calendar, AlertCircle, ClipboardList, CheckCircle2, Clock, 
  AlertTriangle, Flame, MessageSquare, ExternalLink, X, Loader2, 
  ChevronDown, Search, FolderDot, User, Flag, ArrowUp, ArrowRight, ArrowDown
} from "lucide-react";
import { differenceInCalendarDays, format as fnsFormat } from "date-fns";

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
  Critical: { color: C.danger,  icon: <Flag size={10}/> },
  High:     { color: C.warning, icon: <ArrowUp size={10}/> },
  Medium:   { color: C.primary, icon: <ArrowRight size={10}/> },
  Low:      { color: C.success, icon: <ArrowDown size={10}/> },
};

const DEV_PALETTE = [
  C.primary, C.success, C.warning, C.danger, "#8b5cf6", "#06b6d4", "#ec4899", "#1F2328"
];

function buildPresets() {
  const n = new Date();
  const todayStart = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  return [
    { label: "Today",         from: todayStart, to: null },
    { label: "This Week",     from: new Date(n - 7  * 86400000), to: null },
    { label: "Last 2 Weeks",  from: new Date(n - 14 * 86400000), to: null },
    { label: "This Month",    from: new Date(n.getFullYear(), n.getMonth(), 1), to: null },
    { label: "Last Month",    from: new Date(n.getFullYear(), n.getMonth() - 1, 1),
                              to:   new Date(n.getFullYear(), n.getMonth(), 0) },
    { label: "Last 3 Months", from: new Date(n - 90 * 86400000), to: null },
    { label: "All Time",      from: null, to: null },
  ];
}
const DATE_PRESETS = buildPresets();

const getToken = () => localStorage.getItem("token") || "";
const authFetch = async (url) => {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

const checkIsOverdue = (deadline, status) => {
  if (!deadline || status === "Done") return false;
  const d = new Date(deadline);
  const endOfDeadlineDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return endOfDeadlineDay <= new Date();
};

const stringToColor = (s) => {
  if (!s) return DEV_PALETTE[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return DEV_PALETTE[Math.abs(h) % DEV_PALETTE.length];
};

// ── Shared components ──────────────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <span
    style={{ color, backgroundColor: color + "15" }}
    className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
  >
    {label}
  </span>
);

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  return (
    <div className="flex items-center gap-1 neu-pressed-sm px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
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
  let label = fnsFormat(d, "MMM d");
  let icon = <Calendar size={10} />;

  if (isOverdue) {
    color = C.danger;
    label = `OVERDUE (${Math.abs(diff)}d)`;
    icon = <AlertTriangle size={10} />;
  } else if (isCritical) {
    color = C.danger;
    label = diff === 0 ? "Due Today" : "Tomorrow";
    icon = <AlertCircle size={10} />;
  } else if (isSoon) {
    color = C.warning;
    label = `Due ${diff}d`;
  }

  return (
    <div className="flex items-center gap-1 neu-pressed-sm px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider" style={{ color }}>
      {icon} {label}
    </div>
  );
};

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center neu-base">
    <div className="neu-flat rounded-xl p-8 flex flex-col items-center">
      <div className="w-8 h-8 border-4 border-[#D1DCEB] border-t-[#0969DA] rounded-full animate-spin mb-3"></div>
      <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider animate-pulse">Loading Reports...</p>
    </div>
  </div>
);

const SelectBox = ({ value, onChange, children, className = "" }) => (
  <div className="relative z-20">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full neu-pressed rounded-md py-1.5 px-3 pr-7 text-[11px] font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20 ${className}`}
    >
      {children}
    </select>
    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="neu-flat rounded-lg p-3 text-xs z-50 relative montserrat-medium">
      <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-bold text-xs flex items-center justify-between gap-3">
            <span>{p.name}:</span>
            <span className="text-[#1F2328]">{p.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-[#656D76]">
    <div className="neu-pressed-sm p-4 rounded-full mb-3">
      <Inbox strokeWidth={1.5} className="w-8 h-8 opacity-60" />
    </div>
    <p className="text-xs font-bold uppercase tracking-wider">{message}</p>
  </div>
);

// ── Completed/Pending split list ───────────────────────────────────────────────
function SplitTaskList({ tasks, onTaskClick, datePreset }) {
  const [pendingPage, setPendingPage]     = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const PAGE = 8;

  const pending   = useMemo(() => tasks.filter(t => t.status !== "Done"), [tasks]);
  const completed = useMemo(() => tasks.filter(t => t.status === "Done"), [tasks]);

  const pendingTotal   = pending.length;
  const completedTotal = completed.length;

  const pendingPages   = Math.ceil(pending.length / PAGE)   || 1;
  const completedPages = Math.ceil(completed.length / PAGE) || 1;

  const pendingSlice   = pending.slice((pendingPage - 1) * PAGE, pendingPage * PAGE);
  const completedSlice = completed.slice((completedPage - 1) * PAGE, completedPage * PAGE);

  const Pagination = ({ page, total, onChange }) => {
    if (total <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-[#D1DCEB]/50 shrink-0">
        <button type="button" onClick={() => onChange(p => Math.max(1, p - 1))} disabled={page === 1}
          className="neu-flat-sm neu-action-btn rounded-md px-3 py-1.5 text-[10px] font-bold text-[#656D76] disabled:opacity-40">← Prev</button>
        <span className="text-[10px] font-bold text-[#1F2328] neu-pressed-sm px-3 py-1.5 rounded-md">Page {page} of {total}</span>
        <button type="button" onClick={() => onChange(p => Math.min(total, p + 1))} disabled={page === total}
          className="neu-flat-sm neu-action-btn rounded-md px-3 py-1.5 text-[10px] font-bold text-[#656D76] disabled:opacity-40">Next →</button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
      {/* ── Pending Tasks Column ── */}
      <div className="neu-flat rounded-xl p-4 flex flex-col h-full min-h-[400px]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D1DCEB]/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="neu-pressed-sm p-1.5 rounded-lg text-[#0969DA]"><Clock size={16} /></div>
            <h3 className="text-sm font-bold text-[#1F2328]">Pending Tasks</h3>
          </div>
          <span className="neu-pressed-sm rounded-md px-2.5 py-1 text-[10px] font-bold text-[#0969DA]">{pendingTotal}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-3">
          {pendingSlice.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="neu-pressed-sm p-4 rounded-full mb-3 text-[#1A7F37]"><CheckCircle2 size={24} /></div>
              <p className="text-sm font-bold text-[#1F2328] mb-0.5">All Caught Up!</p>
              <p className="text-[10px] font-bold text-[#656D76]">No pending tasks matching filters.</p>
            </div>
          ) : pendingSlice.map(t => {
            const pc = PRIORITY_CONFIG[t.priority]?.color || C.textSec;
            return (
              <div key={t._id} onClick={() => onTaskClick(t)} 
                className="neu-flat-sm rounded-lg p-3.5 cursor-pointer neu-action-btn group hover:-translate-y-0.5 transition-transform border-l-[3px] flex flex-col gap-2"
                style={{ borderLeftColor: pc }}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Badge label={t.projectName} color="#0969DA" />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <DeadlineChip deadline={t.deadline} />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-[#1F2328] group-hover:text-[#0969DA] transition-colors line-clamp-1">{t.title}</p>
                  {t.description && <p className="text-[9px] font-medium text-[#656D76] line-clamp-1 mt-0.5">{t.description}</p>}
                </div>
                <div className="flex items-center justify-between pt-2 mt-0.5 border-t border-[#D1DCEB]/50 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 shadow-sm" style={{backgroundColor: stringToColor(t.assignedTo?.username)}}>
                      {t.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="text-[10px] font-bold text-[#656D76]">{t.assignedTo?.username || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#656D76]">
                    {(t.comments?.length > 0) && <span className="flex items-center gap-1 text-[9px] font-bold"><MessageSquare size={10}/> {t.comments.length}</span>}
                    {(t.links?.length > 0) && <span className="flex items-center gap-1 text-[9px] font-bold"><ExternalLink size={10}/> {t.links.length}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Pagination page={pendingPage} total={pendingPages} onChange={setPendingPage} />
      </div>

      {/* ── Completed Tasks Column ── */}
      <div className="neu-flat rounded-xl p-4 flex flex-col h-full min-h-[400px]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D1DCEB]/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="neu-pressed-sm p-1.5 rounded-lg text-[#1A7F37]"><CheckCircle2 size={16} /></div>
            <h3 className="text-sm font-bold text-[#1F2328]">Completed Tasks</h3>
          </div>
          <span className="neu-pressed-sm rounded-md px-2.5 py-1 text-[10px] font-bold text-[#1A7F37]">{completedTotal}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-3">
          {completedSlice.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="neu-pressed-sm p-4 rounded-full mb-3 text-[#656D76] opacity-50"><Inbox size={24} /></div>
              <p className="text-sm font-bold text-[#1F2328] mb-0.5">No Completions</p>
              <p className="text-[10px] font-bold text-[#656D76]">No tasks marked done in this period.</p>
            </div>
          ) : completedSlice.map(t => (
            <div key={t._id} onClick={() => onTaskClick(t)} className="neu-pressed bg-[#1A7F37]/5 border border-[#1A7F37]/20 rounded-lg p-3.5 cursor-pointer neu-action-btn group flex flex-col gap-2 transition-all opacity-80 hover:opacity-100">
              <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
                <Badge label={t.projectName} color="#656D76" />
                <span className="neu-pressed-sm px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-[#1A7F37] flex items-center gap-1"><CheckCircle2 size={9}/> Done</span>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-[#1F2328]/60 line-through decoration-[#1A7F37] line-clamp-1">{t.title}</p>
              </div>
              <div className="flex items-center justify-between pt-2 mt-0.5 border-t border-[#D1DCEB]/50 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 shadow-sm bg-[#1A7F37]">
                    {t.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-[10px] font-bold text-[#1A7F37]">{t.assignedTo?.username || "Unassigned"}</span>
                </div>
                {t.completedAt && <span className="text-[8px] font-bold text-[#656D76] uppercase tracking-wider">{fnsFormat(new Date(t.completedAt), "MMM d, yyyy")}</span>}
              </div>
            </div>
          ))}
        </div>
        <Pagination page={completedPage} total={completedPages} onChange={setCompletedPage} />
      </div>
    </div>
  );
}

// ── Overdue Task List ─────────────────────────────────────────────────────────
function OverdueTaskList({ tasks, onTaskClick }) {
  const overdue = useMemo(
    () => tasks.filter(t => checkIsOverdue(t.deadline, t.status)).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)),
    [tasks]
  );

  if (overdue.length === 0) {
    return (
      <div className="neu-flat rounded-xl p-12 text-center flex flex-col items-center">
        <div className="neu-pressed-sm p-5 rounded-full mb-4 text-[#1A7F37]"><CheckCircle2 size={32} /></div>
        <p className="text-lg font-bold text-[#1F2328] mb-1">No overdue tasks!</p>
        <p className="text-xs font-bold text-[#656D76]">Your team is completely on track.</p>
      </div>
    );
  }

  return (
    <div className="neu-flat rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D1DCEB]/50">
        <div className="flex items-center gap-2">
          <div className="neu-pressed-sm p-1.5 rounded-lg text-[#D1242F]"><AlertTriangle size={16} /></div>
          <h3 className="text-sm font-bold text-[#1F2328]">Overdue Tasks</h3>
        </div>
        <span className="neu-pressed-sm rounded-md px-2.5 py-1 text-[10px] font-bold text-[#D1242F]">{overdue.length}</span>
      </div>
      <div className="space-y-3">
        {overdue.map(t => {
          const daysOverdue = differenceInCalendarDays(new Date(), new Date(t.deadline));
          return (
            <div key={t._id} onClick={() => onTaskClick(t)} className="neu-flat-sm rounded-lg p-3.5 cursor-pointer neu-action-btn flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <PriorityBadge priority={t.priority} />
                  <Badge label={t.projectName} color="#0969DA" />
                  <span className="text-[8px] font-bold text-[#D1242F] uppercase tracking-wider neu-pressed-sm px-1.5 py-0.5 rounded bg-[#D1242F]/10 border border-[#D1242F]/20">
                    {daysOverdue}d overdue
                  </span>
                </div>
                <p className="text-xs font-bold text-[#1F2328] group-hover:text-[#D1242F] transition-colors truncate mb-1">{t.title}</p>
                <div className="flex items-center gap-1.5">
                  <User size={10} className="text-[#656D76]"/>
                  <span className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider">{t.assignedTo?.username || "Unassigned"}</span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-[#D1242F] shrink-0 flex items-center gap-1.5 relative z-10 neu-pressed-sm p-2 rounded-md border border-[#D1242F]/20">
                <Calendar size={12} />
                <span>{fnsFormat(new Date(t.deadline), "MMM d, yyyy")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DeveloperReports() {
  const currentUserId = localStorage.getItem("userId");

  const [projects,        setProjects]        = useState([]);
  const [allTasks,        setAllTasks]        = useState([]);
  const [completions,     setCompletions]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  const [selectedProject,  setSelectedProject]  = useState("all");
  const [selectedDev,      setSelectedDev]      = useState("all");
  const [statusFilter,     setStatusFilter]     = useState("all");
  const [priorityFilter,   setPriorityFilter]   = useState("all");
  const [datePreset,       setDatePreset]       = useState("Today");
  const [customFrom,       setCustomFrom]       = useState("");
  const [customTo,         setCustomTo]         = useState("");
  const [activeTab,        setActiveTab]        = useState("tasks");
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  const fetchReportData = useCallback(async (preset, cFrom, cTo, isSilent = false) => {
    const presetObj = DATE_PRESETS.find(d => d.label === preset);
    const isCustom = preset === "Custom";
    const fDate = isCustom ? (cFrom ? new Date(cFrom) : null) : presetObj?.from;
    const tDate = isCustom ? (cTo ? new Date(cTo) : null) : presetObj?.to;

    const CACHE_KEY = `dev_reports_${currentUserId}_${preset}_${cFrom}_${cTo}`;
    const cachedData = sessionStorage.getItem(CACHE_KEY);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setProjects(parsed.projects || []);
        setAllTasks(parsed.tasks || []);
        setCompletions(parsed.completions || []);
        if (!isSilent) setLoading(false);
        isSilent = true; 
      } catch (e) {}
    }

    if (!isSilent) setLoading(true);

    try {
      const params = new URLSearchParams();
      if (fDate) params.append("startDate", fDate.toISOString());
      if (tDate) params.append("endDate", tDate.toISOString());
      const queryStr = params.toString();

      const data = await authFetch(`${API_BASE}/api/reports/dashboard?${queryStr}`);

      setProjects(data.projects || []);
      setAllTasks(data.tasks || []);
      setCompletions(data.completions || []);

      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        projects: data.projects || [],
        tasks: data.tasks || [],
        completions: data.completions || [],
        timestamp: Date.now()
      }));

    } catch (e) {
      if (!isSilent) setError(e.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchReportData(datePreset, customFrom, customTo);
  }, [datePreset, customFrom, customTo, fetchReportData]);

  const handleTaskClick = async (task) => {
    setSelectedTaskDetails({ ...task, commentsLoading: true });
    const pid = (task.projectId?._id || task.projectId)?.toString();
    try {
      const commentsRes = await authFetch(`${API_BASE}/api/tasks/${pid}/${task._id}/comments`);
      const comments = Array.isArray(commentsRes) ? commentsRes : [];
      setSelectedTaskDetails(prev => prev?._id === task._id ? { ...prev, comments, commentsLoading: false } : prev);
    } catch (err) {
      setSelectedTaskDetails(prev => prev?._id === task._id ? { ...prev, comments: [], commentsLoading: false } : prev);
    }
  };

  const { fromDate, toDate } = useMemo(() => {
    if (datePreset === "Custom") return { fromDate: customFrom ? new Date(customFrom) : null, toDate: customTo ? new Date(customTo) : null };
    const preset = DATE_PRESETS.find(d => d.label === datePreset);
    return { fromDate: preset?.from ?? null, toDate: preset?.to ?? null };
  }, [datePreset, customFrom, customTo]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      const pid = (t.projectId?._id || t.projectId)?.toString();
      if (selectedProject !== "all" && pid !== selectedProject) return false;
      if (selectedDev     !== "all" && t.assignedTo?.username !== selectedDev)  return false;
      if (statusFilter    === "complete"   && t.status !== "Done")              return false;
      if (statusFilter    === "incomplete" && t.status === "Done")              return false;
      if (priorityFilter  !== "all"        && t.priority !== priorityFilter)    return false;

      if (fromDate || toDate) {
        if (t.status === "Done") {
          const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
          if (fromDate && ref < fromDate) return false;
          if (toDate   && ref > toDate)   return false;
        }
      }
      return true;
    });
  }, [allTasks, selectedProject, selectedDev, statusFilter, priorityFilter, fromDate, toDate]);

  const developers = useMemo(() => {
    const relevantTasks = selectedProject === "all" ? allTasks : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    return [...new Set(relevantTasks.map(t => t.assignedTo?.username).filter(Boolean))];
  }, [allTasks, selectedProject]);

  const stats = useMemo(() => {
    const pool = selectedProject === "all" ? allTasks : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    const allPending   = pool.filter(t => t.status !== "Done");
    const allCompleted = pool.filter(t => {
      if (t.status !== "Done") return false;
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (fromDate || toDate) {
        const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        if (fromDate && ref < fromDate) return false;
        if (toDate   && ref > toDate)   return false;
      }
      return true;
    });

    const pending = selectedDev !== "all" ? allPending.filter(t => t.assignedTo?.username === selectedDev) : allPending;
    const overdue  = pending.filter(t => checkIsOverdue(t.deadline, t.status)).length;
    const critical = pending.filter(t => t.priority === "Critical").length;

    return { total: pending.length + allCompleted.length, done: allCompleted.length, pending: pending.length, overdue, critical };
  }, [allTasks, selectedProject, selectedDev, fromDate, toDate]);

  const devBarData = useMemo(() => {
    const pool = selectedProject === "all" ? allTasks : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    const map = {};
    pool.filter(t => t.status !== "Done").forEach(t => {
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return;
      const name = t.assignedTo?.username || "Unknown";
      if (!map[name]) map[name] = { name, Done: 0, Pending: 0 };
      map[name].Pending++;
    });
    
    pool.filter(t => {
      if (t.status !== "Done") return false;
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (fromDate || toDate) {
        const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        if (fromDate && ref < fromDate) return false;
        if (toDate   && ref > toDate)   return false;
      }
      return true;
    }).forEach(t => {
      const name = t.assignedTo?.username || "Unknown";
      if (!map[name]) map[name] = { name, Done: 0, Pending: 0 };
      map[name].Done++;
    });
    return Object.values(map).sort((a, b) => (b.Done + b.Pending) - (a.Done + a.Pending));
  }, [allTasks, selectedProject, selectedDev, priorityFilter, fromDate, toDate]);

  const devPieData = useMemo(() => {
    const pool = selectedProject === "all" ? allTasks : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    const map = {};
    pool.filter(t => {
      if (t.status !== "Done") return false;
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (fromDate || toDate) {
        const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        if (fromDate && ref < fromDate) return false;
        if (toDate   && ref > toDate)   return false;
      }
      return true;
    }).forEach(t => {
      const name = t.assignedTo?.username || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allTasks, selectedProject, selectedDev, fromDate, toDate]);

  const completionBarData = useMemo(() => {
    const filtered = completions.filter(c => {
      const d = new Date(c.completedAt);
      if (fromDate && d < fromDate) return false;
      if (toDate   && d > toDate)   return false;
      if (selectedProject !== "all") {
        const cPid = (c.projectId?._id || c.projectId)?.toString();
        if (cPid !== selectedProject) return false;
      }
      if (selectedDev !== "all" && c.completedBy?.username !== selectedDev) return false;
      return true;
    });
    const map = {};
    filtered.forEach(c => {
      const name = c.completedBy?.username || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, Completed]) => ({ name, Completed })).sort((a, b) => b.Completed - a.Completed);
  }, [completions, fromDate, toDate, selectedProject, selectedDev]);

  const devCardData = useMemo(() => {
    const pool = selectedProject === "all" ? allTasks : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    return developers.map((dev, i) => {
      const pendingTasks = pool.filter(t => t.status !== "Done" && t.assignedTo?.username === dev);
      const doneTasks = pool.filter(t => {
        if (t.status !== "Done" || t.assignedTo?.username !== dev) return false;
        if (fromDate || toDate) {
          const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
          if (fromDate && ref < fromDate) return false;
          if (toDate   && ref > toDate)   return false;
        }
        return true;
      });
      const overdueCount = pendingTasks.filter(t => checkIsOverdue(t.deadline, t.status)).length;
      const total = pendingTasks.length + doneTasks.length;
      const pct   = total ? Math.round((doneTasks.length / total) * 100) : 0;
      return { dev, i, pendingTasks, doneTasks, overdueCount, total, pct };
    });
  }, [developers, allTasks, selectedProject, fromDate, toDate]);

  if (loading && allTasks.length === 0) return <PageLoader />;

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col neu-base montserrat-regular text-[#1F2328]">
      
      {/* ── Fixed Header ── */}
      <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-[#D1DCEB]/50 flex justify-between items-center z-20 relative bg-[#F0F4F8]">
        <div>
          <h1 className="text-xl montserrat-medium text-[#1F2328]">Have a look at what your developers have been up to</h1>
        </div>
        <div className="neu-pressed-sm rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block bg-[#1A7F37]" />
          <span className="text-[10px] font-bold text-[#656D76]">{allTasks.length} tasks</span>
        </div>
      </div>

      {/* ── Scrollable Content Area ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:px-6 space-y-5 relative z-10 pb-16">
        
        {/* Filters */}
        <div className="neu-flat rounded-xl p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[130px] relative z-20">
              <label className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Project</label>
              <SelectBox value={selectedProject} onChange={v => { setSelectedProject(v); setSelectedDev("all"); }}>
                <option value="all">All Projects</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.projectName || p.title || p._id}</option>)}
              </SelectBox>
            </div>
            <div className="flex-1 min-w-[130px] relative z-20">
              <label className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Developer</label>
              <SelectBox value={selectedDev} onChange={setSelectedDev}>
                <option value="all">All Developers</option>
                {developers.map(d => <option key={d} value={d}>{d}</option>)}
              </SelectBox>
            </div>
            <div className="flex-1 min-w-[130px] relative z-20">
              <label className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Status</label>
              <SelectBox value={statusFilter} onChange={setStatusFilter}>
                <option value="all">All Status</option>
                <option value="complete">Completed</option>
                <option value="incomplete">Incomplete</option>
              </SelectBox>
            </div>
            <div className="flex-1 min-w-[130px] relative z-20">
              <label className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Priority</label>
              <SelectBox value={priorityFilter} onChange={setPriorityFilter}>
                <option value="all">All Priorities</option>
                {["Critical","High","Medium","Low"].map(p => <option key={p} value={p}>{p}</option>)}
              </SelectBox>
            </div>
            <div className="flex-1 min-w-[130px] relative z-20">
              <label className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Period</label>
              <SelectBox value={datePreset} onChange={setDatePreset}>
                {DATE_PRESETS.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
                <option value="Custom">Custom Range</option>
              </SelectBox>
            </div>
            {datePreset === "Custom" && (
              <>
                <div className="flex-1 min-w-[130px] relative z-20">
                  <label className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">From</label>
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-full neu-pressed rounded-md py-1.5 px-3 text-[11px] font-bold text-[#1F2328] outline-none cursor-pointer relative z-20" />
                </div>
                <div className="flex-1 min-w-[130px] relative z-20">
                  <label className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">To</label>
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-full neu-pressed rounded-md py-1.5 px-3 text-[11px] font-bold text-[#1F2328] outline-none cursor-pointer relative z-20" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} className="neu-pressed rounded-lg p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#D1242F]" />
              <span className="text-[11px] font-bold text-[#D1242F]">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
          {[
            { label:"Total Tasks",   value:stats.total,    color:"#0969DA", icon:<ClipboardList size={16} /> },
            { label:"Completed",     value:stats.done,     color:"#1A7F37", icon:<CheckCircle2  size={16} /> },
            { label:"Pending",       value:stats.pending,  color:"#656D76", icon:<Clock         size={16} /> },
            { label:"Overdue",       value:stats.overdue,  color:"#D1242F", icon:<AlertTriangle size={16} /> },
            { label:"Critical Open", value:stats.critical, color:"#BF8700", icon:<Flame         size={16} /> },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }} className="neu-flat rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider">{card.label}</span>
                <div className="neu-pressed-sm p-1.5 rounded-md" style={{ color:card.color }}>{card.icon}</div>
              </div>
              <p className="text-2xl font-bold" style={{ color:card.color }}>{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="neu-pressed rounded-lg p-1.5 inline-flex flex-wrap gap-1.5 relative z-20">
          {[
            { id:"tasks",         label:"Task List" },
            { id:"overdue",       label:"Overdue" },
            { id:"dev-activity",  label:"Dev Activity" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all neu-action-btn flex items-center gap-1.5 ${activeTab === tab.id ? "neu-flat text-[#0969DA]" : "text-[#656D76] bg-transparent shadow-none"}`}>
              {tab.label}
              {tab.id === "overdue" && stats.overdue > 0 && <span className="bg-[#D1242F] text-white text-[8px] font-bold rounded px-1.5 py-0.5 pointer-events-none">{stats.overdue}</span>}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "tasks" && (
            <motion.div key="tasks" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-4 relative z-10">
              <div className="neu-flat rounded-xl p-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1F2328]">Tasks Overview</h2>
                <span className="neu-pressed-sm rounded-md px-3 py-1.5 text-[10px] font-bold text-[#656D76]">{filteredTasks.length} tasks matching</span>
              </div>
              {filteredTasks.length === 0 ? <EmptyState message="No tasks match your filters" /> : <SplitTaskList tasks={filteredTasks} onTaskClick={handleTaskClick} datePreset={datePreset} />}
            </motion.div>
          )}

          {activeTab === "overdue" && (
            <motion.div key="overdue" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-4 relative z-10">
              <OverdueTaskList tasks={filteredTasks} onTaskClick={handleTaskClick} />
            </motion.div>
          )}

          {activeTab === "dev-activity" && (
            <motion.div key="dev-activity" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-5 relative z-10">
              
              <div className="neu-pressed rounded-lg p-4 text-xs font-medium text-[#1F2328] flex items-start sm:items-center gap-3">
                <div className="neu-flat-sm p-1.5 rounded-full text-[#0969DA] shrink-0"><Clock size={14}/></div>
                <span><strong>Completed</strong> counts reflect tasks finished within <span className="font-bold text-[#0969DA] bg-[#D1DCEB]/30 px-1.5 rounded">{datePreset}</span>. <strong>Pending</strong> counts show all open tasks.</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="neu-flat rounded-xl p-5">
                  <h3 className="text-base font-bold text-[#1F2328] mb-1">Completions in Period</h3>
                  <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-6">Tasks marked Done · {datePreset}</p>
                  {completionBarData.length === 0 ? <EmptyState message="No completions in this period" /> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={completionBarData} barCategoryGap="30%" margin={{ top:10, right:10, left:0, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1DCEB" opacity={0.6} />
                        <XAxis dataKey="name" tick={{ fill:"#656D76", fontSize:10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill:"#656D76", fontSize:10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(209, 220, 235, 0.3)' }} content={<CustomTooltip />} />
                        <Bar dataKey="Completed" radius={[4,4,0,0]}>
                          {completionBarData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="neu-flat rounded-xl p-5">
                  <h3 className="text-base font-bold text-[#1F2328] mb-1">Total Contribution</h3>
                  <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-6">% of Completed Tasks per Developer</p>
                  {devPieData.length === 0 ? <EmptyState message="No completed tasks match filters" /> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={devPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {devPieData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="neu-flat rounded-xl p-5">
                <h3 className="text-base font-bold text-[#1F2328] mb-1">Task Breakdown</h3>
                <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-6">Completed vs Pending (Currently Open)</p>
                {devBarData.length === 0 ? <EmptyState message="No tasks match filters" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={devBarData} barCategoryGap="25%" margin={{ top:10, right:10, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1DCEB" opacity={0.6} />
                      <XAxis dataKey="name" tick={{ fill:"#656D76", fontSize:10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"#656D76", fontSize:10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(209, 220, 235, 0.3)' }} content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, color: '#656D76', paddingTop: '10px' }} />
                      <Bar dataKey="Done"    fill="#1A7F37" radius={[4,4,0,0]} stackId="a" />
                      <Bar dataKey="Pending" fill="#0969DA" radius={[4,4,0,0]} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {devCardData.length === 0 && <EmptyState message="No developer data yet" />}
                {devCardData.map(({ dev, i, pendingTasks, doneTasks, overdueCount, total, pct }) => (
                  <motion.div key={dev} initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i * 0.05 }} className="neu-flat rounded-xl p-4">
                    <div className="flex items-center gap-4 mb-4 border-b border-[#D1DCEB]/50 pb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg neu-flat shadow-sm" style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }}>
                        {dev[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#1F2328]">{dev}</p>
                        <p className="text-[10px] font-bold text-[#656D76] mt-0.5">{total} total tasks</p>
                      </div>
                    </div>
                    <div className="mb-5 neu-pressed rounded-lg p-3.5">
                      <div className="flex justify-between text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-2.5">
                        <span>Completion Rate</span>
                        <span className="text-[#1F2328]">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full neu-pressed-sm overflow-hidden mb-2">
                        <motion.div className="h-full rounded-full" style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }} initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, delay:i * 0.08 }} />
                      </div>
                      <p className="text-[10px] font-bold text-[#1F2328] mt-2 flex justify-between">
                        <span className="text-[#1A7F37]">{doneTasks.length} done</span> 
                        <span className="text-[#0969DA]">{pendingTasks.length} pending</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label:"Done",    value:doneTasks.length,    color:"#1A7F37" },
                        { label:"Pending", value:pendingTasks.length, color:"#0969DA" },
                        { label:"Overdue", value:overdueCount,        color:"#D1242F" },
                      ].map(s => (
                        <div key={s.label} className="neu-pressed rounded-lg py-2.5 px-2 text-center">
                          <p className="font-bold text-lg mb-1" style={{ color:s.color }}>{s.value}</p>
                          <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Task Details Modal ── */}
      <AnimatePresence>
        {selectedTaskDetails && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTaskDetails(null)} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden"
            >
              <div className="flex items-start justify-between border-b border-[#D1DCEB]/50 p-5 shrink-0 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge label={selectedTaskDetails.projectName} color="#0969DA" />
                    <PriorityBadge priority={selectedTaskDetails.priority} />
                    {selectedTaskDetails.status === "Done" && (
                      <span className="neu-pressed-sm text-[#1A7F37] text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10} /> Completed</span>
                    )}
                  </div>
                  <h2 className={`text-xl font-bold ${selectedTaskDetails.status === "Done" ? "line-through text-[#656D76]" : "text-[#1F2328]"}`}>
                    {selectedTaskDetails.title}
                  </h2>
                </div>
                <button type="button" onClick={() => setSelectedTaskDetails(null)} className="neu-flat-sm neu-action-btn rounded-full p-2 text-[#656D76] hover:text-[#D1242F]">
                  <X size={16} className="pointer-events-none" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 neu-pressed rounded-lg p-4">
                  <div>
                    <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5">Status</p>
                    <p className="text-xs font-bold text-[#1F2328] capitalize">{selectedTaskDetails.status}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5">Assignee</p>
                    <p className="text-xs font-bold text-[#1F2328]">{selectedTaskDetails.assignedTo?.username}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5">Created By</p>
                    <p className="text-xs font-bold text-[#1F2328]">{selectedTaskDetails.createdBy?.username}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5">Deadline</p>
                    <p className={`text-xs font-bold ${checkIsOverdue(selectedTaskDetails.deadline, selectedTaskDetails.status) ? "text-[#D1242F]" : "text-[#1F2328]"}`}>
                      {selectedTaskDetails.deadline ? fnsFormat(new Date(selectedTaskDetails.deadline), "MMM d, yyyy") : "None"}
                    </p>
                  </div>
                  {selectedTaskDetails.status === "Done" && selectedTaskDetails.completedAt && (
                    <div className="sm:col-span-4 neu-pressed-sm rounded-md p-3 flex items-center gap-2 mt-2 bg-[#1A7F37]/5 border border-[#1A7F37]/20">
                      <div className="neu-flat-sm p-1.5 rounded-full text-[#1A7F37] flex-shrink-0"><CheckCircle2 size={12} /></div>
                      <p className="text-[11px] text-[#1A7F37] font-bold">
                        Completed on {fnsFormat(new Date(selectedTaskDetails.completedAt), "MMM d, yyyy · h:mm a")}
                        {selectedTaskDetails.completedBy?.username && ` by ${selectedTaskDetails.completedBy.username}`}
                      </p>
                    </div>
                  )}
                </div>

                {selectedTaskDetails.description && (
                  <div>
                    <h4 className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Description</h4>
                    <div className="text-xs font-medium text-[#1F2328] whitespace-pre-wrap neu-pressed rounded-lg p-4 leading-relaxed">
                      {selectedTaskDetails.description}
                    </div>
                  </div>
                )}

                {selectedTaskDetails.links?.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Links</h4>
                    <div className="flex flex-col gap-2 neu-pressed rounded-lg p-3.5">
                      {selectedTaskDetails.links.map((link, idx) => (
                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#0969DA] flex items-center gap-1.5 hover:underline truncate relative z-20 w-fit neu-flat-sm px-3 py-1.5 rounded-md">
                          <ExternalLink size={12} />{link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MessageSquare size={12} /> Comments ({selectedTaskDetails.comments?.length || 0})
                  </h4>
                  {selectedTaskDetails.commentsLoading ? (
                     <div className="flex items-center gap-2 text-xs text-[#0969DA] font-bold py-4 px-3 neu-pressed rounded-lg"><Loader2 size={14} className="animate-spin" /> Fetching comments...</div>
                  ) : (
                    <div className="neu-pressed rounded-lg p-4 space-y-4">
                      {(!selectedTaskDetails.comments || selectedTaskDetails.comments.length === 0) ? (
                        <p className="text-[11px] font-bold text-[#656D76] italic text-center py-2">No comments yet.</p>
                      ) : selectedTaskDetails.comments.map((comment, idx) => (
                        <div key={idx} className="neu-flat-sm rounded-lg p-3.5">
                          <div className="flex items-center justify-between mb-2 border-b border-[#D1DCEB]/30 pb-1.5">
                            <span className="text-[11px] font-bold text-[#1F2328] flex items-center gap-1.5">
                               <div className="w-5 h-5 rounded-full neu-pressed-sm flex items-center justify-center text-[8px] text-[#0969DA]">
                                 {(comment.createdBy?.username || comment.user?.username || "U")[0].toUpperCase()}
                               </div>
                              {comment.createdBy?.username || comment.user?.username || "Unknown"}
                            </span>
                            <span className="text-[9px] font-bold text-[#656D76]">{comment.createdAt ? fnsFormat(new Date(comment.createdAt), "MMM d, h:mm a") : ""}</span>
                          </div>
                          <p className="text-xs font-medium text-[#1F2328] leading-relaxed pl-1">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        :root {
          --neu-bg: #F0F4F8; 
          --neu-light: #FFFFFF;
          --neu-dark: #D1DCEB;
        }
        .neu-base { background-color: var(--neu-bg); }
        .neu-flat {
          background-color: var(--neu-bg);
          box-shadow: 5px 5px 10px var(--neu-dark), -5px -5px 10px var(--neu-light);
        }
        .neu-flat-sm {
          background-color: var(--neu-bg);
          box-shadow: 2px 2px 5px var(--neu-dark), -2px -2px 5px var(--neu-light);
        }
        .neu-pressed {
          background-color: var(--neu-bg);
          box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
        }
        .neu-pressed-sm {
          background-color: var(--neu-bg);
          box-shadow: inset 1.5px 1.5px 3px var(--neu-dark), inset -1.5px -1.5px 3px var(--neu-light);
        }
        
        input, textarea, select {
          position: relative; z-index: 20; pointer-events: auto !important;
          user-select: text !important; -webkit-user-select: text !important;
        }
        select { cursor: pointer !important; -moz-appearance: none; -webkit-appearance: none; appearance: none; }
        .neu-action-btn { cursor: pointer; transition: all 0.2s ease; position: relative; z-index: 20; user-select: none; -webkit-user-select: none; }
        .neu-action-btn:active:not(:disabled) { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light) !important; }
        button svg { pointer-events: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 4px 0;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </div>
  );
}