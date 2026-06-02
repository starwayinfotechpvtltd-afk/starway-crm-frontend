import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Calendar, AlertCircle,
  ClipboardList, CheckCircle, Clock, AlertOctagon, Flame,
  MessageSquare, ExternalLink, X, AlertTriangle, Loader2
} from "lucide-react";
import { differenceInCalendarDays, format as fnsFormat } from "date-fns";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const PRIORITY_COLOR = {
  Critical: "#ef4444",
  High:     "#f97316",
  Medium:   "#eab308",
  Low:      "#22c55e",
};

const DEV_PALETTE = [
  "#6366f1","#ec4899","#14b8a6","#f97316","#8b5cf6","#06b6d4","#84cc16","#f43f5e",
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

// ── Shared components ──────────────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <span
    style={{ background: color + "15", color, border: `1px solid ${color}33` }}
    className="text-xs font-semibold px-2 py-0.5 rounded-sm whitespace-nowrap uppercase tracking-wider"
  >
    {label}
  </span>
);

const SkeletonBlock = ({ h = "h-4", w = "w-full", rounded = "rounded" }) => (
  <div className={`${h} ${w} ${rounded} bg-gray-200 animate-pulse`} />
);

const PageLoader = () => (
  <div className="min-h-screen bg-[#F6F8FA] font-sans">
    <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="max-w-[95%] mx-auto flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock h="h-7" w="w-56" rounded="rounded-md" />
          <SkeletonBlock h="h-4" w="w-36" rounded="rounded" />
        </div>
        <SkeletonBlock h="h-5" w="w-28" rounded="rounded-full" />
      </div>
    </div>
    <div className="max-w-[95%] mx-auto px-6 py-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-md p-5 flex gap-4 flex-wrap">
        {[140, 140, 110, 110, 130].map((w, i) => (
          <div key={i} className="flex flex-col gap-2">
            <SkeletonBlock h="h-3" w={`w-16`} />
            <div className="h-9 rounded-sm bg-gray-200 animate-pulse" style={{ width: w }} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
            <div className="flex justify-between">
              <SkeletonBlock h="h-3" w="w-20" />
              <SkeletonBlock h="h-5" w="w-5" rounded="rounded-full" />
            </div>
            <SkeletonBlock h="h-8" w="w-12" rounded="rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex gap-1 bg-gray-200/60 border border-gray-200 rounded-md p-1 w-fit">
        {[80, 100, 120].map((w, i) => (
          <div key={i} className="h-8 rounded bg-gray-300 animate-pulse" style={{ width: w }} />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-md p-4 flex gap-4 items-center">
            <div className="w-1 self-stretch rounded bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2 pl-2">
              <SkeletonBlock h="h-3" w="w-24" />
              <SkeletonBlock h="h-5" w="w-3/4" />
            </div>
            <SkeletonBlock h="h-6" w="w-20" rounded="rounded-full" />
            <SkeletonBlock h="h-6" w="w-24" rounded="rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SelectBox = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={
      "bg-white border border-gray-200 shadow-xs text-gray-800 text-sm rounded-sm px-3 py-2 " +
      "focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer relative z-20 " +
      className
    }
  >
    {children}
  </select>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-sm px-4 py-3 shadow-md text-sm z-50 relative">
      <p className="text-gray-800 font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium text-xs">
          {p.name}: <span className="text-gray-600">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <Inbox strokeWidth={1.5} className="w-12 h-12 mb-3 text-gray-300" />
    <p className="text-sm">{message}</p>
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
      <div className="flex items-center justify-center gap-3 mt-4">
        <button onClick={() => onChange(p => Math.max(1, p - 1))} disabled={page === 1}
          className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40">← Prev</button>
        <span className="text-xs text-gray-500 font-medium">Page {page} of {total}</span>
        <button onClick={() => onChange(p => Math.min(total, p + 1))} disabled={page === total}
          className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40">Next →</button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-500" />
            <h3 className="font-bold text-gray-800">Pending Tasks</h3>
          </div>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{pendingTotal}</span>
        </div>
        <div className="p-4 space-y-3 max-h-[560px] overflow-y-auto">
          {pendingSlice.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No pending tasks 🎉</div>
          ) : pendingSlice.map(t => {
            const isOverdue = checkIsOverdue(t.deadline, t.status);
            const pc = PRIORITY_COLOR[t.priority] || "#94a3b8";
            const blue = "#3b82f6";
            return (
              <div key={t._id} onClick={() => onTaskClick(t)}
                className="border border-gray-200 rounded-md p-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all bg-white relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" style={{ backgroundColor: pc }} />
                <div className="pl-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge label={t.priority} color={pc} />
                    <Badge label={t.projectName} color={blue} />
                    {isOverdue && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 uppercase">Overdue</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate pt-2">{t.title}</p>
                  <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
                    <span className="text-xs text-gray-500">{t.assignedTo?.username}</span>
                    {t.deadline && (
                      <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                        <Calendar size={11} />
                        Due {fnsFormat(new Date(t.deadline), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <Pagination page={pendingPage} total={pendingPages} onChange={setPendingPage} />
        </div>
      </div>

      <div className="bg-white border border-emerald-200 shadow-sm rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600" />
            <h3 className="font-bold text-emerald-800">Completed Tasks</h3>
          </div>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">{completedTotal}</span>
        </div>
        <div className="p-4 space-y-3 max-h-[560px] overflow-y-auto">
          {completedSlice.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No completed tasks in this period</div>
          ) : completedSlice.map(t => (
            <div key={t._id} onClick={() => onTaskClick(t)}
              className="border border-emerald-200 rounded-md p-3 cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all bg-emerald-50/40 relative overflow-hidden flex flex-col">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md bg-emerald-500" />
              <span className="text-[10px] w-fit border border-gray-300 text-gray-500 px-2 py-0.5 rounded ml-3 mb-2 uppercase font-bold tracking-wider">{t.projectName}</span>
              <div className="pl-3">
                <p className="text-sm font-semibold text-gray-700 line-through decoration-emerald-400 truncate">{t.title}</p>
                <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
                  <span className="text-xs text-gray-500">{t.assignedTo?.username}</span>
                  {t.completedAt && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle size={11} />
                      {fnsFormat(new Date(t.completedAt), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Pagination page={completedPage} total={completedPages} onChange={setCompletedPage} />
        </div>
      </div>
    </div>
  );
}

// ── Overdue Task List ─────────────────────────────────────────────────────────
function OverdueTaskList({ tasks, onTaskClick }) {
  const overdue = useMemo(
    () => tasks.filter(t => checkIsOverdue(t.deadline, t.status))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)),
    [tasks]
  );

  if (overdue.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
        <CheckCircle className="mx-auto mb-3 text-emerald-500" size={32} />
        <p className="text-gray-600 font-medium">No overdue tasks!</p>
        <p className="text-gray-400 text-sm mt-1">All tasks are on track.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-red-200 shadow-sm rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600" />
          <h3 className="font-bold text-red-800">Overdue Tasks</h3>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">{overdue.length}</span>
      </div>
      <div className="divide-y divide-red-50">
        {overdue.map(t => {
          const daysOverdue = differenceInCalendarDays(new Date(), new Date(t.deadline));
          const pc = PRIORITY_COLOR[t.priority] || "#94a3b8";
          return (
            <div key={t._id} onClick={() => onTaskClick(t)}
              className="px-5 py-3 flex items-center gap-4 cursor-pointer hover:bg-red-50/50 transition-colors">
              <div className="w-1 self-stretch rounded bg-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0 pl-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge label={t.priority} color={pc} />
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                    {daysOverdue}d overdue
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.projectName} · {t.assignedTo?.username}</p>
              </div>
              <div className="text-xs text-red-600 font-medium flex-shrink-0 flex items-center gap-1">
                <Calendar size={12} />
                {fnsFormat(new Date(t.deadline), "MMM d, yyyy")}
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

  // ── Fetch & Cache Data using Single End Point ───────────────────────────────
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
      } catch (e) {
        // Cache corrupted
      }
    }

    if (!isSilent) setLoading(true);

    try {
      // Query String for timeframe
      const params = new URLSearchParams();
      if (fDate) params.append("startDate", fDate.toISOString());
      if (tDate) params.append("endDate", tDate.toISOString());
      const queryStr = params.toString();

      // THE FIX: ONE SINGLE HTTP REQUEST instead of chunking/looping
      const data = await authFetch(`${API_BASE}/api/reports/dashboard?${queryStr}`);

      setProjects(data.projects || []);
      setAllTasks(data.tasks || []);
      setCompletions(data.completions || []);

      // Save to Session Cache
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

  // ── Handle Task Details & Lazy Load Comments ────────────────────────────────
  const handleTaskClick = async (task) => {
    setSelectedTaskDetails({ ...task, commentsLoading: true });
    
    const pid = (task.projectId?._id || task.projectId)?.toString();
    try {
      const commentsRes = await authFetch(`${API_BASE}/api/tasks/${pid}/${task._id}/comments`);
      const comments = Array.isArray(commentsRes) ? commentsRes : [];
      
      setSelectedTaskDetails(prev => 
        prev?._id === task._id ? { ...prev, comments, commentsLoading: false } : prev
      );
    } catch (err) {
      console.error("Failed to fetch comments", err);
      setSelectedTaskDetails(prev => 
        prev?._id === task._id ? { ...prev, comments: [], commentsLoading: false } : prev
      );
    }
  };

  // ── Date window logic (Frontend Fallback Check) ───────────────────────────
  const { fromDate, toDate } = useMemo(() => {
    if (datePreset === "Custom") {
      return {
        fromDate: customFrom ? new Date(customFrom) : null,
        toDate:   customTo   ? new Date(customTo)   : null,
      };
    }
    const preset = DATE_PRESETS.find(d => d.label === datePreset);
    return { fromDate: preset?.from ?? null, toDate: preset?.to ?? null };
  }, [datePreset, customFrom, customTo]);


  // ── Apply Filters to Data ──────────────────────────────────────────────────
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
    const relevantTasks = selectedProject === "all" 
      ? allTasks 
      : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    return [...new Set(relevantTasks.map(t => t.assignedTo?.username).filter(Boolean))];
  }, [allTasks, selectedProject]);

  const stats = useMemo(() => {
    const pool = selectedProject === "all" 
      ? allTasks 
      : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);

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

    const pending = selectedDev !== "all"
      ? allPending.filter(t => t.assignedTo?.username === selectedDev)
      : allPending;

    const overdue  = pending.filter(t => checkIsOverdue(t.deadline, t.status)).length;
    const critical = pending.filter(t => t.priority === "Critical").length;

    return {
      total:     pending.length + allCompleted.length,
      done:      allCompleted.length,
      pending:   pending.length,
      overdue,
      critical,
    };
  }, [allTasks, selectedProject, selectedDev, fromDate, toDate]);

  const devBarData = useMemo(() => {
    const pool = selectedProject === "all" 
      ? allTasks 
      : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);

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
    const pool = selectedProject === "all" 
      ? allTasks 
      : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);

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
    return Object.entries(map)
      .map(([name, Completed]) => ({ name, Completed }))
      .sort((a, b) => b.Completed - a.Completed);
  }, [completions, fromDate, toDate, selectedProject, selectedDev]);

  const devCardData = useMemo(() => {
    const pool = selectedProject === "all" 
      ? allTasks 
      : allTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === selectedProject);

    return developers.map((dev, i) => {
      const pendingTasks = pool.filter(t =>
        t.status !== "Done" && t.assignedTo?.username === dev
      );
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
    <div className="min-h-screen bg-[#F6F8FA] text-gray-800 font-sans text-base pb-10 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        .font-sans    { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* ── Header ── */}
      <div className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-[95%] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Developer Reports</h1>
            <p className="text-gray-500 text-sm mt-0.5">Task analytics &amp; team activity</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-500" />
            {allTasks.length} tasks loaded
          </div>
        </div>
      </div>

      <div className="max-w-[95%] mx-auto px-6 py-6 space-y-6 relative z-10">
        {/* ── Filters ── */}
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="bg-white border border-gray-200 shadow-sm rounded-md p-5 relative z-20">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Project</label>
              <SelectBox value={selectedProject} onChange={v => { setSelectedProject(v); setSelectedDev("all"); }}>
                <option value="all">All Projects</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.projectName || p.title || p._id}</option>)}
              </SelectBox>
            </div>
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Developer</label>
              <SelectBox value={selectedDev} onChange={setSelectedDev}>
                <option value="all">All Developers</option>
                {developers.map(d => <option key={d} value={d}>{d}</option>)}
              </SelectBox>
            </div>
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</label>
              <SelectBox value={statusFilter} onChange={setStatusFilter}>
                <option value="all">All</option>
                <option value="complete">Completed</option>
                <option value="incomplete">Incomplete</option>
              </SelectBox>
            </div>
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Priority</label>
              <SelectBox value={priorityFilter} onChange={setPriorityFilter}>
                <option value="all">All</option>
                {["Critical","High","Medium","Low"].map(p => <option key={p} value={p}>{p}</option>)}
              </SelectBox>
            </div>
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Period</label>
              <SelectBox value={datePreset} onChange={setDatePreset}>
                {DATE_PRESETS.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
                <option value="Custom">Custom Range</option>
              </SelectBox>
            </div>
            {datePreset === "Custom" && (
              <>
                <div className="flex flex-col gap-1.5 relative z-20">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">From</label>
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    className="bg-white border border-gray-200 shadow-sm text-sm rounded-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex flex-col gap-1.5 relative z-20">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">To</label>
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    className="bg-white border border-gray-200 shadow-sm text-sm rounded-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="bg-red-50 border border-red-200 text-red-600 rounded-md px-4 py-3 text-sm shadow-sm flex items-center">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />{error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stat cards ── */}
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10"
          initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
          {[
            { label:"Total Tasks",   value:stats.total,    color:"#4f46e5", icon:<ClipboardList size={22} /> },
            { label:"Completed",     value:stats.done,     color:"#16a34a", icon:<CheckCircle   size={22} /> },
            { label:"Pending",       value:stats.pending,  color:"#64748b", icon:<Clock         size={22} /> },
            { label:"Overdue",       value:stats.overdue,  color:"#dc2626", icon:<AlertOctagon  size={22} /> },
            { label:"Critical Open", value:stats.critical, color:"#ea580c", icon:<Flame         size={22} /> },
          ].map(card => (
            <motion.div key={card.label}
              variants={{ hidden:{ opacity:0, y:12 }, show:{ opacity:1, y:0 } }}
              className="bg-white border border-gray-200 shadow-sm rounded-md p-4 flex flex-col gap-2 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{card.label}</span>
                <span style={{ color:card.color }} className="opacity-80">{card.icon}</span>
              </div>
              <p className="text-3xl font-bold font-display" style={{ color:card.color }}>{card.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 bg-gray-200/60 border border-gray-200 rounded-md p-1 w-fit relative z-20 flex-wrap">
          {[
            { id:"tasks",         label:"Task List" },
            { id:"overdue",       label:"Overdue" },
            { id:"dev-activity",  label:"Dev Activity" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={"px-4 py-2 rounded text-sm font-bold transition-all " +
                (activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-800")}>
              {tab.label}
              {tab.id === "overdue" && stats.overdue > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">{stats.overdue}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Tab: Task List ── */}
          {activeTab === "tasks" && (
            <motion.div key="tasks" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-4 relative z-10">
              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Tasks</h2>
                <span className="text-sm font-medium text-gray-500">{filteredTasks.length} tasks</span>
              </div>
              {filteredTasks.length === 0
                ? <EmptyState message="No tasks match your filters" />
                : <SplitTaskList tasks={filteredTasks} onTaskClick={handleTaskClick} datePreset={datePreset} />
              }
            </motion.div>
          )}

          {/* ── Tab: Overdue ── */}
          {activeTab === "overdue" && (
            <motion.div key="overdue" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-4 relative z-10">
              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Overdue Tasks</h2>
                <span className="text-sm font-base text-red-600 font-bold">{stats.overdue} overdue</span>
              </div>
              <OverdueTaskList tasks={filteredTasks} onTaskClick={handleTaskClick} />
            </motion.div>
          )}

          {/* ── Tab: Dev Activity ── */}
          {activeTab === "dev-activity" && (
            <motion.div key="dev-activity" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }} transition={{ duration:0.2 }} className="space-y-6 relative z-10">
              <div className="bg-indigo-50 border border-indigo-200 rounded-md px-4 py-2.5 text-sm text-indigo-700 flex items-center gap-2">
                <Clock size={14} />
                <span>
                  <strong>Completed</strong> counts reflect tasks finished within <strong>{datePreset}</strong>.
                  &nbsp;<strong>Pending</strong> counts show all currently open tasks regardless of date.
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 shadow-sm rounded-md p-5">
                  <h3 className="font-bold font-display text-gray-900 mb-1">Completions in Period</h3>
                  <p className="text-sm text-gray-500 mb-5">Tasks marked Done · {datePreset}</p>
                  {completionBarData.length === 0 ? <EmptyState message="No completions in this period" /> : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={completionBarData} barCategoryGap="30%" margin={{ top:20, right:30, left:0, bottom:10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="Completed" radius={[4,4,0,0]}>
                          {completionBarData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-md p-5">
                  <h3 className="font-bold font-display text-gray-900 mb-1">Total Contribution</h3>
                  <p className="text-sm text-gray-500 mb-5">% of Completed Tasks per Developer · {datePreset}</p>
                  {devPieData.length === 0 ? <EmptyState message="No completed tasks match filters" /> : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={devPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {devPieData.map((_, i) => <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              <div className="bg-white border border-gray-200 shadow-sm rounded-md p-5">
                <h3 className="font-bold font-display text-gray-900 mb-1">Task Breakdown</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Completed (in {datePreset}) vs Pending (currently open)
                </p>
                {devBarData.length === 0 ? <EmptyState message="No tasks match filters" /> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={devBarData} barCategoryGap="25%" margin={{ top:20, right:30, left:0, bottom:10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"#64748b", fontSize:13 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize:13 }} />
                      <Bar dataKey="Done"    fill="#16a34a" radius={[2,2,0,0]} stackId="a" />
                      <Bar dataKey="Pending" fill="#4f46e5" radius={[2,2,0,0]} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {devCardData.length === 0 && <EmptyState message="No developer data yet" />}
                {devCardData.map(({ dev, i, pendingTasks, doneTasks, overdueCount, total, pct }) => (
                  <motion.div key={dev}
                    initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
                    transition={{ delay:i * 0.05 }}
                    className="bg-white border border-gray-200 shadow-sm rounded-md p-5 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm"
                        style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }}>
                        {dev[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{dev}</p>
                        <p className="text-sm text-gray-500">{total} tasks total</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 font-bold mb-1.5">
                        <span>Completion</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }}
                          initial={{ width:0 }} animate={{ width:`${pct}%` }}
                          transition={{ duration:0.8, delay:i * 0.08 }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {doneTasks.length} done in {datePreset} · {pendingTasks.length} still pending
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label:"Done",    value:doneTasks.length,    color:"#16a34a", bg:"bg-green-50" },
                        { label:"Pending", value:pendingTasks.length, color:"#4f46e5", bg:"bg-indigo-50" },
                        { label:"Overdue", value:overdueCount,        color:"#dc2626", bg:"bg-red-50" },
                      ].map(s => (
                        <div key={s.label} className={`${s.bg} border border-gray-100 rounded-md py-2 px-1`}>
                          <p className="font-bold text-lg" style={{ color:s.color }}>{s.value}</p>
                          <p className="text-xs text-gray-500 font-bold uppercase">{s.label}</p>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity:0, scale:0.95, y:20 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95, y:20 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-[101]"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{selectedTaskDetails.projectName}</span>
                    <span className="text-gray-300">•</span>
                    <Badge label={selectedTaskDetails.priority} color={PRIORITY_COLOR[selectedTaskDetails.priority] || "#94a3b8"} />
                    {selectedTaskDetails.status === "Done" && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                  <h2 className={`text-xl font-bold ${selectedTaskDetails.status === "Done" ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {selectedTaskDetails.title}
                  </h2>
                </div>
                <button onClick={() => setSelectedTaskDetails(null)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500 transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTaskDetails.status}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assignee</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTaskDetails.assignedTo?.username}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Created By</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTaskDetails.createdBy?.username}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
                    <p className={`text-sm font-semibold ${checkIsOverdue(selectedTaskDetails.deadline, selectedTaskDetails.status) ? "text-red-600" : "text-gray-800"}`}>
                      {selectedTaskDetails.deadline
                        ? fnsFormat(new Date(selectedTaskDetails.deadline), "MMM d, yyyy")
                        : "None"}
                    </p>
                  </div>
                  {selectedTaskDetails.status === "Done" && selectedTaskDetails.completedAt && (
                    <div className="sm:col-span-4 bg-emerald-50 rounded-md p-3 border border-emerald-200 flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                      <p className="text-sm text-emerald-700 font-medium">
                        Completed on {fnsFormat(new Date(selectedTaskDetails.completedAt), "MMMM d, yyyy · h:mm a")}
                        {selectedTaskDetails.completedBy?.username && ` by ${selectedTaskDetails.completedBy.username}`}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Description</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white border border-gray-200 p-4 rounded-md leading-relaxed">
                    {selectedTaskDetails.description || <span className="italic text-gray-400">No description provided.</span>}
                  </div>
                </div>

                {selectedTaskDetails.links?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">Links</h4>
                    <div className="flex flex-col gap-2">
                      {selectedTaskDetails.links.map((link, idx) => (
                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 hover:underline truncate">
                          <ExternalLink size={14} />{link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <MessageSquare size={16} /> Comments ({selectedTaskDetails.comments?.length || 0})
                  </h4>
                  
                  {selectedTaskDetails.commentsLoading ? (
                     <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium py-3">
                       <Loader2 size={16} className="animate-spin" /> Fetching comments...
                     </div>
                  ) : (
                    <div className="space-y-3">
                      {(!selectedTaskDetails.comments || selectedTaskDetails.comments.length === 0) ? (
                        <p className="text-sm text-gray-400 italic">No comments yet.</p>
                      ) : selectedTaskDetails.comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-100 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900">
                              {comment.createdBy?.username || comment.user?.username || "Unknown"}
                            </span>
                            <span className="text-xs font-medium text-gray-400">
                              {comment.createdAt ? fnsFormat(new Date(comment.createdAt), "MMM d, yyyy · h:mm a") : ""}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #D0D7DE; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8C959F; }
      `}</style>
    </div>
  );
}