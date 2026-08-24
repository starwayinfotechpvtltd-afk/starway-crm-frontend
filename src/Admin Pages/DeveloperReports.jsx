import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Calendar,
  AlertCircle,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  MessageSquare,
  ExternalLink,
  X,
  Loader2,
  ChevronDown,
  Search,
  FolderDot,
  User,
  Flag,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  RefreshCw,
  BarChart3,
  PieChart as PieIcon,
  Check,
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { differenceInCalendarDays, format as fnsFormat } from "date-fns";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import Modal from "../components/ui/Modal";
import { StatCardsSkeleton, TableSkeleton, ChartSkeleton } from "../components/ui/Skeleton";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Starway Enterprise Color System ───────────────────────────────────────────
const PALETTE = [
  "#2563EB", // Primary Blue
  "#059669", // Success Green
  "#D97706", // Amber Warning
  "#7C3AED", // Royal Purple
  "#DB2777", // Pink / Fuchsia
  "#0891B2", // Cyan
  "#DC2626", // Danger Red
  "#475569", // Slate
];

const PRIORITY_THEME = {
  Critical: { color: "#DC2626", bg: "bg-rose-50", border: "border-rose-200", badge: "red", icon: <Flag size={11} className="text-rose-600" /> },
  High:     { color: "#D97706", bg: "bg-amber-50", border: "border-amber-200", badge: "amber", icon: <ArrowUp size={11} className="text-amber-600" /> },
  Medium:   { color: "#2563EB", bg: "bg-blue-50", border: "border-blue-200", badge: "blue", icon: <ArrowRight size={11} className="text-blue-600" /> },
  Low:      { color: "#059669", bg: "bg-emerald-50", border: "border-emerald-200", badge: "green", icon: <ArrowDown size={11} className="text-emerald-600" /> },
};

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
  if (!s) return PALETTE[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const isDateToday = (dateString) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  const today = new Date();
  return d.getDate() === today.getDate() && 
         d.getMonth() === today.getMonth() && 
         d.getFullYear() === today.getFullYear();
};

const isDateThisWeek = (dateString) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  const day = now.getDay() || 7; 
  if (day !== 1) now.setHours(-24 * (day - 1));
  now.setHours(0,0,0,0);
  return d >= now && d <= new Date();
};

// ── Deadline Chip Component ───────────────────────────────────────────────────
const DeadlineChip = ({ deadline }) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const diff = differenceInCalendarDays(d, new Date());
  
  const isOverdue = diff < 0;
  const isCritical = diff === 0 || diff === 1;
  const isSoon = diff > 1 && diff <= 3;

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase font-mono">
        <AlertTriangle size={11} className="text-rose-600" /> Overdue ({Math.abs(diff)}d)
      </span>
    );
  }
  if (isCritical) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase font-mono">
        <AlertCircle size={11} className="text-rose-600" /> {diff === 0 ? "Due Today" : "Tomorrow"}
      </span>
    );
  }
  if (isSoon) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase font-mono">
        <Clock size={11} className="text-amber-600" /> Due {diff}d
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 font-mono">
      <Calendar size={11} className="text-slate-400" /> {fnsFormat(d, "MMM d")}
    </span>
  );
};

// ── Custom Recharts Tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#EAE3D6] rounded shadow-lg p-3 text-xs z-50">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 border-b border-slate-100 pb-1">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <p key={i} className="font-semibold text-xs flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              {p.name}:
            </span>
            <span className="font-bold text-slate-900 font-mono">{p.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

// ── Custom Recharts X-Axis Tick with Avatar ──────────────────────────────────
const CustomXAxisTick = ({ x, y, payload, devMap, onUserClick }) => {
  const username = payload.value;
  const avatarUrl = devMap[username];
  const IMG_SIZE = 28;
  
  return (
    <g transform={`translate(${x},${y})`}>
      {avatarUrl ? (
        <foreignObject
          x={-(IMG_SIZE / 2)}
          y={6}
          width={IMG_SIZE}
          height={IMG_SIZE}
          style={{ cursor: "pointer", overflow: "visible" }}
          onClick={(e) => { e.stopPropagation(); onUserClick(username); }}
        >
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: "100%", height: "100%" }}>
            <img
              src={avatarUrl}
              alt={username}
              className="w-7 h-7 rounded-full object-cover border border-slate-300 shadow-xs hover:ring-2 hover:ring-[#1E40AF] transition-all"
            />
          </div>
        </foreignObject>
      ) : (
        <foreignObject
          x={-(IMG_SIZE / 2)}
          y={6}
          width={IMG_SIZE}
          height={IMG_SIZE}
          style={{ cursor: "pointer", overflow: "visible" }}
          onClick={(e) => { e.stopPropagation(); onUserClick(username); }}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs hover:ring-2 hover:ring-[#1E40AF] transition-all"
            style={{ backgroundColor: stringToColor(username) }}
          >
            {username?.charAt(0).toUpperCase() || "?"}
          </div>
        </foreignObject>
      )}
      <text
        x={0}
        y={IMG_SIZE + 18}
        dy={0}
        textAnchor="middle"
        fill="#475569"
        fontSize={10}
        fontWeight={600}
        style={{ cursor: "pointer" }}
        onClick={(e) => { e.stopPropagation(); onUserClick(username); }}
      >
        {username}
      </text>
    </g>
  );
};

// ── Empty State Component ─────────────────────────────────────────────────────
const EmptyState = ({ message = "No data found matching your current filters" }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-full mb-3 text-slate-400">
      <Inbox size={28} />
    </div>
    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{message}</p>
    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your filters or date range above.</p>
  </div>
);

// ── Deliverables Matrix: Split Pending & Completed Tasks ──────────────────────
function SplitDeliverablesMatrix({ tasks, onTaskClick, onUserClick }) {
  const [pendingPage, setPendingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const PAGE_SIZE = 8;

  const pending = useMemo(() => tasks.filter((t) => t.status !== "Done"), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.status === "Done"), [tasks]);

  const pendingPages = Math.ceil(pending.length / PAGE_SIZE) || 1;
  const completedPages = Math.ceil(completed.length / PAGE_SIZE) || 1;

  const pendingSlice = pending.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
  const completedSlice = completed.slice((completedPage - 1) * PAGE_SIZE, completedPage * PAGE_SIZE);

  const Pagination = ({ page, total, onChange }) => {
    if (total <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
        <button
          type="button"
          onClick={() => onChange((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="ent-btn-secondary py-1 px-2.5 text-[11px] disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="text-[11px] font-semibold text-slate-500 font-mono">
          Page {page} of {total}
        </span>
        <button
          type="button"
          onClick={() => onChange((p) => Math.min(total, p + 1))}
          disabled={page === total}
          className="ent-btn-secondary py-1 px-2.5 text-[11px] disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── Active & Pending Deliverables ── */}
      <div className="ent-card p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-[#1E40AF] rounded">
                <Clock size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Pending & In-Progress Tasks
                </h3>
                <p className="text-[10px] text-slate-400">Open deliverables awaiting completion</p>
              </div>
            </div>
            <Badge variant="blue">{pending.length} Active</Badge>
          </div>

          <div className="space-y-2.5">
            {pendingSlice.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-2">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-xs font-bold text-slate-800">All Caught Up!</p>
                <p className="text-[10px] text-slate-400">No open deliverables match current filters.</p>
              </div>
            ) : (
              pendingSlice.map((t) => {
                const priorityInfo = PRIORITY_THEME[t.priority] || PRIORITY_THEME.Medium;

                return (
                  <div
                    key={t._id}
                    onClick={() => onTaskClick(t)}
                    className="p-3 rounded border border-[#EAE3D6] bg-white hover:border-[#1E40AF] hover:shadow-xs transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="beige" className="max-w-[140px] truncate">
                          {t.projectName || "General"}
                        </Badge>
                        <Badge variant={priorityInfo.badge} className="flex items-center gap-1">
                          {priorityInfo.icon} {t.priority}
                        </Badge>
                      </div>
                      <DeadlineChip deadline={t.deadline} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors line-clamp-1">
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div
                        className="flex items-center gap-2 cursor-pointer group/user"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUserClick(t.assignedTo?.username);
                        }}
                      >
                        {t.assignedTo?.avatar ? (
                          <img
                            src={t.assignedTo.avatar}
                            alt="assignee"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ backgroundColor: stringToColor(t.assignedTo?.username) }}
                          >
                            {t.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="text-[11px] font-medium text-slate-700 group-hover/user:text-[#1E40AF] group-hover/user:underline">
                          {t.assignedTo?.username || "Unassigned"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-slate-400">
                        {t.comments?.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                            <MessageSquare size={11} /> {t.comments.length}
                          </span>
                        )}
                        {t.links?.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                            <ExternalLink size={11} /> {t.links.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Pagination page={pendingPage} total={pendingPages} onChange={setPendingPage} />
      </div>

      {/* ── Completed Deliverables ── */}
      <div className="ent-card p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Completed Deliverables
                </h3>
                <p className="text-[10px] text-slate-400">Tasks verified and marked as finished</p>
              </div>
            </div>
            <Badge variant="green">{completed.length} Completed</Badge>
          </div>

          <div className="space-y-2.5">
            {completedSlice.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-2">
                  <Inbox size={24} />
                </div>
                <p className="text-xs font-bold text-slate-800">No Completed Tasks</p>
                <p className="text-[10px] text-slate-400">No tasks marked Done in this timeframe.</p>
              </div>
            ) : (
              completedSlice.map((t) => {
                const isLate = t.deadline && t.completedAt && new Date(t.completedAt) > new Date(t.deadline);
                const daysLate = isLate
                  ? differenceInCalendarDays(new Date(t.completedAt), new Date(t.deadline))
                  : 0;

                return (
                  <div
                    key={t._id}
                    onClick={() => onTaskClick(t)}
                    className={`p-3 rounded border transition-all cursor-pointer group space-y-2 ${
                      isLate
                        ? "bg-amber-50/40 border-amber-200/80 hover:border-amber-400"
                        : "bg-emerald-50/20 border-emerald-200/60 hover:border-emerald-400"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge variant="slate" className="max-w-[140px] truncate">
                        {t.projectName || "General"}
                      </Badge>
                      {isLate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase font-mono">
                          <AlertTriangle size={10} className="text-amber-600" /> Done ({daysLate}d Late)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase font-mono">
                          <CheckCircle2 size={10} className="text-emerald-600" /> Done On Time
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-700 line-through decoration-slate-400 line-clamp-1">
                        {t.title}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <div
                        className="flex items-center gap-2 cursor-pointer group/user"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUserClick(t.assignedTo?.username);
                        }}
                      >
                        {t.assignedTo?.avatar ? (
                          <img
                            src={t.assignedTo.avatar}
                            alt="assignee"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
                              isLate ? "bg-amber-600" : "bg-emerald-600"
                            }`}
                          >
                            {t.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="text-[11px] font-medium text-slate-700 group-hover/user:underline">
                          {t.assignedTo?.username || "Unassigned"}
                        </span>
                      </div>

                      {t.completedAt && (
                        <span className="text-[10px] font-medium text-slate-500 font-mono">
                          {fnsFormat(new Date(t.completedAt), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Pagination page={completedPage} total={completedPages} onChange={setCompletedPage} />
      </div>
    </div>
  );
}

// ── Overdue Risk Board Component ──────────────────────────────────────────────
function OverdueRiskBoard({ tasks, onTaskClick, onUserClick }) {
  const overdueTasks = useMemo(() => {
    return tasks
      .filter((t) => checkIsOverdue(t.deadline, t.status))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [tasks]);

  if (overdueTasks.length === 0) {
    return (
      <div className="ent-card p-12 text-center flex flex-col items-center justify-center">
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-3 border border-emerald-200">
          <ShieldCheck size={32} />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Zero Overdue Deliverables
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          All team deliverables are currently on schedule. No critical deadline breaches detected.
        </p>
      </div>
    );
  }

  return (
    <div className="ent-card p-4 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-50 text-rose-600 rounded">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Critical Overdue Deliverables ({overdueTasks.length})
            </h3>
            <p className="text-[10px] text-slate-400">Deliverables that have breached their scheduled target deadline</p>
          </div>
        </div>
        <Badge variant="red">{overdueTasks.length} Urgent Breaches</Badge>
      </div>

      <div className="space-y-2.5">
        {overdueTasks.map((t) => {
          const daysOverdue = differenceInCalendarDays(new Date(), new Date(t.deadline));
          const priorityInfo = PRIORITY_THEME[t.priority] || PRIORITY_THEME.Medium;

          return (
            <div
              key={t._id}
              onClick={() => onTaskClick(t)}
              className="p-3.5 rounded border border-rose-200 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={priorityInfo.badge} className="flex items-center gap-1">
                    {priorityInfo.icon} {t.priority}
                  </Badge>
                  <Badge variant="beige">{t.projectName || "General"}</Badge>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase font-mono">
                    {daysOverdue} Day{daysOverdue > 1 ? "s" : ""} Overdue
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors truncate">
                  {t.title}
                </p>

                <div
                  className="flex items-center gap-2 cursor-pointer w-fit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserClick(t.assignedTo?.username);
                  }}
                >
                  {t.assignedTo?.avatar ? (
                    <img
                      src={t.assignedTo.avatar}
                      alt="assignee"
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: stringToColor(t.assignedTo?.username) }}
                    >
                      {t.assignedTo?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="text-[11px] font-medium text-slate-600 hover:underline">
                    Assigned: {t.assignedTo?.username || "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <div className="px-3 py-1.5 rounded bg-white border border-rose-200 text-rose-700 font-mono text-[11px] font-bold flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Target: {fnsFormat(new Date(t.deadline), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Developer Reports Dashboard ──────────────────────────────────────────
export default function DeveloperReports() {
  const currentUserId = localStorage.getItem("userId");

  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDev, setSelectedDev] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("This Month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "overdue" | "dev-activity"

  // Inspection Modals
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [selectedUserStats, setSelectedUserStats] = useState(null);

  const fetchReportData = useCallback(async (preset, cFrom, cTo, isSilent = false) => {
    const presetObj = DATE_PRESETS.find((d) => d.label === preset);
    const isCustom = preset === "Custom";
    const fDate = isCustom ? (cFrom ? new Date(cFrom) : null) : presetObj?.from;
    const tDate = isCustom ? (cTo ? new Date(cTo) : null) : presetObj?.to;

    const CACHE_KEY = `dev_reports_${currentUserId}_${preset}_${cFrom}_${cTo}`;
    const cachedData = sessionStorage.getItem(CACHE_KEY);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.tasks && parsed.tasks.length > 0) {
          setProjects(parsed.projects || []);
          setAllTasks(parsed.tasks || []);
          setCompletions(parsed.completions || []);
          if (!isSilent) setLoading(false);
          isSilent = true;
        }
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

      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          projects: data.projects || [],
          tasks: data.tasks || [],
          completions: data.completions || [],
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      if (!isSilent) setError(e.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchReportData(datePreset, customFrom, customTo);
  }, [datePreset, customFrom, customTo, fetchReportData]);

  // Alphabetically sorted projects list
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) =>
      (a.projectName || a.title || "").localeCompare(b.projectName || b.title || "", undefined, {
        sensitivity: "base",
      })
    );
  }, [projects]);

  // Extract Avatars Mapping
  const devMap = useMemo(() => {
    const map = {};
    allTasks.forEach((t) => {
      if (t.assignedTo?.username && t.assignedTo?.avatar) {
        map[t.assignedTo.username] = t.assignedTo.avatar;
      }
      if (t.createdBy?.username && t.createdBy?.avatar) {
        map[t.createdBy.username] = t.createdBy.avatar;
      }
    });
    completions.forEach((c) => {
      if (c.completedBy?.username && c.completedBy?.avatar) {
        map[c.completedBy.username] = c.completedBy.avatar;
      }
    });
    return map;
  }, [allTasks, completions]);

  const handleTaskClick = async (task) => {
    setSelectedTaskDetails({ ...task, commentsLoading: true });
    const pid = (task.projectId?._id || task.projectId)?.toString();
    try {
      const commentsRes = await authFetch(`${API_BASE}/api/tasks/${pid}/${task._id}/comments`);
      const comments = Array.isArray(commentsRes) ? commentsRes : [];
      setSelectedTaskDetails((prev) =>
        prev?._id === task._id ? { ...prev, comments, commentsLoading: false } : prev
      );
    } catch (err) {
      setSelectedTaskDetails((prev) =>
        prev?._id === task._id ? { ...prev, comments: [], commentsLoading: false } : prev
      );
    }
  };

  const { fromDate, toDate } = useMemo(() => {
    if (datePreset === "Custom")
      return { fromDate: customFrom ? new Date(customFrom) : null, toDate: customTo ? new Date(customTo) : null };
    const preset = DATE_PRESETS.find((d) => d.label === datePreset);
    return { fromDate: preset?.from ?? null, toDate: preset?.to ?? null };
  }, [datePreset, customFrom, customTo]);

  // Filtered tasks pool
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const pid = (t.projectId?._id || t.projectId)?.toString();
      if (selectedProject !== "all" && pid !== selectedProject) return false;
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (statusFilter === "complete" && t.status !== "Done") return false;
      if (statusFilter === "incomplete" && t.status === "Done") return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchProj = t.projectName?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchProj) return false;
      }

      if (fromDate || toDate) {
        if (t.status === "Done") {
          const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
          if (fromDate && ref < fromDate) return false;
          if (toDate && ref > toDate) return false;
        }
      }
      return true;
    });
  }, [allTasks, selectedProject, selectedDev, statusFilter, priorityFilter, searchQuery, fromDate, toDate]);

  // Alphabetically sorted developer usernames
  const developers = useMemo(() => {
    const relevantTasks =
      selectedProject === "all"
        ? allTasks
        : allTasks.filter((t) => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    const devs = [...new Set(relevantTasks.map((t) => t.assignedTo?.username).filter(Boolean))];
    return devs.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [allTasks, selectedProject]);

  // Executive KPI summary statistics
  const stats = useMemo(() => {
    const pool =
      selectedProject === "all"
        ? allTasks
        : allTasks.filter((t) => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    const allPending = pool.filter((t) => t.status !== "Done");
    const allCompleted = pool.filter((t) => {
      if (t.status !== "Done") return false;
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (fromDate || toDate) {
        const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        if (fromDate && ref < fromDate) return false;
        if (toDate && ref > toDate) return false;
      }
      return true;
    });

    const pending =
      selectedDev !== "all" ? allPending.filter((t) => t.assignedTo?.username === selectedDev) : allPending;
    const overdue = pending.filter((t) => checkIsOverdue(t.deadline, t.status)).length;
    const critical = pending.filter((t) => t.priority === "Critical").length;
    const total = pending.length + allCompleted.length;
    const completionRate = total > 0 ? Math.round((allCompleted.length / total) * 100) : 0;

    return { total, done: allCompleted.length, pending: pending.length, overdue, critical, completionRate };
  }, [allTasks, selectedProject, selectedDev, fromDate, toDate]);

  // Chart: Developer Activity
  const devBarData = useMemo(() => {
    const pool =
      selectedProject === "all"
        ? allTasks
        : allTasks.filter((t) => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    const map = {};
    pool
      .filter((t) => t.status !== "Done")
      .forEach((t) => {
        if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return;
        if (priorityFilter !== "all" && t.priority !== priorityFilter) return;
        const name = t.assignedTo?.username || "Unknown";
        if (!map[name]) map[name] = { name, Done: 0, Pending: 0 };
        map[name].Pending++;
      });

    pool
      .filter((t) => {
        if (t.status !== "Done") return false;
        if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
        if (fromDate || toDate) {
          const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
          if (fromDate && ref < fromDate) return false;
          if (toDate && ref > toDate) return false;
        }
        return true;
      })
      .forEach((t) => {
        const name = t.assignedTo?.username || "Unknown";
        if (!map[name]) map[name] = { name, Done: 0, Pending: 0 };
        map[name].Done++;
      });
    return Object.values(map).sort((a, b) => b.Done + b.Pending - (a.Done + a.Pending));
  }, [allTasks, selectedProject, selectedDev, priorityFilter, fromDate, toDate]);

  // Chart: Developer Contribution Share
  const devPieData = useMemo(() => {
    const pool =
      selectedProject === "all"
        ? allTasks
        : allTasks.filter((t) => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    const map = {};
    pool
      .filter((t) => {
        if (t.status !== "Done") return false;
        if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
        if (fromDate || toDate) {
          const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
          if (fromDate && ref < fromDate) return false;
          if (toDate && ref > toDate) return false;
        }
        return true;
      })
      .forEach((t) => {
        const name = t.assignedTo?.username || "Unknown";
        map[name] = (map[name] || 0) + 1;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allTasks, selectedProject, selectedDev, fromDate, toDate]);

  // Chart: Completions in period
  const completionBarData = useMemo(() => {
    const filtered = completions.filter((c) => {
      const d = new Date(c.completedAt);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      if (selectedProject !== "all") {
        const cPid = (c.projectId?._id || c.projectId)?.toString();
        if (cPid !== selectedProject) return false;
      }
      if (selectedDev !== "all" && c.completedBy?.username !== selectedDev) return false;
      return true;
    });
    const map = {};
    filtered.forEach((c) => {
      const name = c.completedBy?.username || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, Completed]) => ({ name, Completed }))
      .sort((a, b) => b.Completed - a.Completed);
  }, [completions, fromDate, toDate, selectedProject, selectedDev]);

  // Developer Cards data
  const devCardData = useMemo(() => {
    const pool =
      selectedProject === "all"
        ? allTasks
        : allTasks.filter((t) => (t.projectId?._id || t.projectId)?.toString() === selectedProject);
    return developers.map((dev, i) => {
      const pendingTasks = pool.filter((t) => t.status !== "Done" && t.assignedTo?.username === dev);
      const doneTasks = pool.filter((t) => {
        if (t.status !== "Done" || t.assignedTo?.username !== dev) return false;
        if (fromDate || toDate) {
          const ref = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
          if (fromDate && ref < fromDate) return false;
          if (toDate && ref > toDate) return false;
        }
        return true;
      });
      const overdueCount = pendingTasks.filter((t) => checkIsOverdue(t.deadline, t.status)).length;
      const total = pendingTasks.length + doneTasks.length;
      const pct = total ? Math.round((doneTasks.length / total) * 100) : 0;
      return { dev, i, pendingTasks, doneTasks, overdueCount, total, pct };
    });
  }, [developers, allTasks, selectedProject, fromDate, toDate]);

  // Handler for Developer Profile Modal
  const handleUserClick = (username) => {
    if (!username || username === "Unknown") return;

    const userTasks = allTasks.filter((t) => t.assignedTo?.username === username);
    const doneToday = userTasks.filter(
      (t) => t.status === "Done" && isDateToday(t.completedAt || t.updatedAt)
    ).length;
    const doneThisWeek = userTasks.filter(
      (t) => t.status === "Done" && isDateThisWeek(t.completedAt || t.updatedAt)
    ).length;
    const totalTasksAssigned = userTasks.length;
    const totalDone = userTasks.filter((t) => t.status === "Done").length;
    const rate = totalTasksAssigned > 0 ? Math.round((totalDone / totalTasksAssigned) * 100) : 0;

    const projectsSet = new Set();
    userTasks.forEach((t) => {
      if (t.projectName) projectsSet.add(t.projectName);
    });
    const projectsContributed = Array.from(projectsSet);

    setSelectedUserStats({
      dev: username,
      avatar: devMap[username],
      doneToday,
      doneThisWeek,
      totalTasksAssigned,
      totalDone,
      rate,
      projectsContributed,
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Executive KPI Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total Deliverables"
          value={loading ? "..." : stats.total}
          icon={ClipboardList}
          variant="blue"
          subtitle="All tasks in scope"
        />
        <StatCard
          title="Completed"
          value={loading ? "..." : stats.done}
          icon={CheckCircle2}
          variant="emerald"
          subtitle={`${stats.completionRate}% completion rate`}
        />
        <StatCard
          title="In Progress"
          value={loading ? "..." : stats.pending}
          icon={Clock}
          variant="indigo"
          subtitle="Active deliverables"
        />
        <StatCard
          title="Overdue Risk"
          value={loading ? "..." : stats.overdue}
          icon={AlertTriangle}
          variant="rose"
          subtitle="Target date breached"
        />
        <StatCard
          title="Critical Open"
          value={loading ? "..." : stats.critical}
          icon={Flame}
          variant="amber"
          subtitle="High urgency items"
        />
      </div>

      {/* ── Filter & Control Bar ────────────────────────────────────────────── */}
      <div className="ent-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#1E40AF]" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Work & Performance Filters
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchReportData(datePreset, customFrom, customTo)}
              className="ent-btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Quick Search */}
          <div className="lg:col-span-2">
            <label className="ent-label">Search Deliverables</label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, description, project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ent-input text-xs pl-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Project Selector (Alphabetical) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="ent-label">Project</label>
              <span className="text-[9px] text-slate-400 font-mono">A–Z</span>
            </div>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedDev("all");
              }}
              className="ent-select text-xs font-medium"
            >
              <option value="all">All Projects</option>
              {sortedProjects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName || p.title || p._id}
                </option>
              ))}
            </select>
          </div>

          {/* Developer Selector (Alphabetical) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="ent-label">Developer</label>
              <span className="text-[9px] text-slate-400 font-mono">A–Z</span>
            </div>
            <select
              value={selectedDev}
              onChange={(e) => setSelectedDev(e.target.value)}
              className="ent-select text-xs font-medium"
            >
              <option value="all">All Developers</option>
              {developers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="ent-label">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="ent-select text-xs font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical 🔴</option>
              <option value="High">High 🟡</option>
              <option value="Medium">Medium 🔵</option>
              <option value="Low">Low 🟢</option>
            </select>
          </div>

          {/* Timeframe Presets */}
          <div>
            <label className="ent-label">Time Period</label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="ent-select text-xs font-medium"
            >
              {DATE_PRESETS.map((d) => (
                <option key={d.label} value={d.label}>
                  {d.label}
                </option>
              ))}
              <option value="Custom">Custom Range...</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {datePreset === "Custom" && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="ent-label">Start Date</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="ent-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="ent-label">End Date</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="ent-input text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── View Navigation Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "tasks"
              ? "bg-[#1E40AF] text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 border border-[#EAE3D6]"
          }`}
        >
          <ClipboardList size={14} /> Deliverables Matrix
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === "tasks" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {filteredTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overdue")}
          className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "overdue"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-rose-700 border border-[#EAE3D6]"
          }`}
        >
          <AlertTriangle size={14} /> Overdue Risks
          {stats.overdue > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === "overdue" ? "bg-white text-rose-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {stats.overdue}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dev-activity")}
          className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "dev-activity"
              ? "bg-[#1E40AF] text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 border border-[#EAE3D6]"
          }`}
        >
          <BarChart3 size={14} /> Performance & Analytics
        </button>
      </div>

      {/* ── Tab Views ───────────────────────────────────────────────────────── */}
      {loading && allTasks.length === 0 ? (
        <div className="space-y-4">
          <StatCardsSkeleton count={3} />
          <TableSkeleton rows={6} cols={4} />
        </div>
      ) : (
        <>
          {activeTab === "tasks" && (
            <SplitDeliverablesMatrix
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onUserClick={handleUserClick}
            />
          )}

          {activeTab === "overdue" && (
            <OverdueRiskBoard
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onUserClick={handleUserClick}
            />
          )}

          {activeTab === "dev-activity" && (
            <div className="space-y-5">
              {/* Informational Scope Pill */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded flex items-center justify-between text-xs text-slate-800">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#1E40AF]" />
                  <span>
                    Analytics reflect completed deliverables within{" "}
                    <strong className="text-[#1E40AF] font-bold">{datePreset}</strong> and open pending tasks.
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  {developers.length} Developers Active
                </span>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Completions Bar Chart */}
                <div className="ent-card p-4">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Completions in Period
                      </h3>
                      <p className="text-[10px] text-slate-400">Tasks verified done · {datePreset}</p>
                    </div>
                    <Badge variant="green">Velocity</Badge>
                  </div>

                  {completionBarData.length === 0 ? (
                    <EmptyState message="No completed tasks in this period" />
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={completionBarData} barCategoryGap="28%" margin={{ top: 10, right: 10, left: -20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={<CustomXAxisTick devMap={devMap} onUserClick={handleUserClick} />} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748B", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: "#F1F5F9" }} content={<CustomTooltip />} />
                        <Bar dataKey="Completed" radius={[4, 4, 0, 0]}>
                          {completionBarData.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Contribution Donut */}
                <div className="ent-card p-4">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Team Contribution Share
                      </h3>
                      <p className="text-[10px] text-slate-400">% of Completed Deliverables per Member</p>
                    </div>
                    <Badge variant="purple">Distribution</Badge>
                  </div>

                  {devPieData.length === 0 ? (
                    <EmptyState message="No completed tasks matching filters" />
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={devPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {devPieData.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Task Breakdown Stacked Bar Chart */}
              <div className="ent-card p-4">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Workload Breakdown (Done vs Pending)
                    </h3>
                    <p className="text-[10px] text-slate-400">Total deliverables load per developer</p>
                  </div>
                  <Badge variant="blue">Volume</Badge>
                </div>

                {devBarData.length === 0 ? (
                  <EmptyState message="No tasks match filters" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={devBarData} barCategoryGap="25%" margin={{ top: 10, right: 10, left: -20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={<CustomXAxisTick devMap={devMap} onUserClick={handleUserClick} />} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748B", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "#F1F5F9" }} content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600, color: "#475569", paddingTop: "10px" }} />
                      <Bar dataKey="Done" name="Completed" fill="#059669" radius={[4, 4, 0, 0]} stackId="a" />
                      <Bar dataKey="Pending" name="In Progress" fill="#2563EB" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Developer Performance Scorecards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {devCardData.map(({ dev, i, pendingTasks, doneTasks, overdueCount, total, pct }) => (
                  <div
                    key={dev}
                    onClick={() => handleUserClick(dev)}
                    className="ent-card p-4 hover:border-[#1E40AF] hover:shadow-xs transition-all cursor-pointer group space-y-3"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      {devMap[dev] ? (
                        <img
                          src={devMap[dev]}
                          alt={dev}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                      ) : (
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xs"
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        >
                          {dev[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors truncate">
                          {dev}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{total} Total Tasks</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        <span>Completion Rate</span>
                        <span className="text-slate-900 font-mono">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1E40AF] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold font-mono">
                        <span className="text-emerald-700">{doneTasks.length} Done</span>
                        <span className="text-blue-700">{pendingTasks.length} Pending</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                        <p className="font-bold text-sm text-emerald-700 font-mono">{doneTasks.length}</p>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">Done</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded border border-blue-100">
                        <p className="font-bold text-sm text-blue-700 font-mono">{pendingTasks.length}</p>
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">Pending</p>
                      </div>
                      <div className="p-2 bg-rose-50 rounded border border-rose-100">
                        <p className="font-bold text-sm text-rose-700 font-mono">{overdueCount}</p>
                        <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider mt-0.5">Overdue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Developer 360° Profile Modal ────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedUserStats)}
        onClose={() => setSelectedUserStats(null)}
        title={selectedUserStats?.dev || "Developer Profile"}
        subtitle="Performance metrics & project contribution breakdown"
        maxWidth="max-w-md"
        footer={
          <button
            type="button"
            onClick={() => setSelectedUserStats(null)}
            className="ent-btn-secondary"
          >
            Close Profile
          </button>
        }
      >
        {selectedUserStats && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#FAF8F5] rounded border border-[#EAE3D6]">
              {selectedUserStats.avatar ? (
                <img
                  src={selectedUserStats.avatar}
                  alt={selectedUserStats.dev}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xs"
                  style={{ background: stringToColor(selectedUserStats.dev) }}
                >
                  {selectedUserStats.dev?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedUserStats.dev}</h3>
                <Badge variant="blue" className="mt-1">
                  Active Developer
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-center">
                <p className="font-bold text-lg text-emerald-700 font-mono">{selectedUserStats.doneToday}</p>
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-0.5">Done Today</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-center">
                <p className="font-bold text-lg text-blue-700 font-mono">{selectedUserStats.doneThisWeek}</p>
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mt-0.5">This Week</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                <p className="font-bold text-lg text-slate-900 font-mono">{selectedUserStats.totalTasksAssigned}</p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">Total Tasks</p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded border border-[#EAE3D6] space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Projects Contributed To ({selectedUserStats.projectsContributed.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedUserStats.projectsContributed.length > 0 ? (
                  selectedUserStats.projectsContributed.map((p) => (
                    <Badge key={p} variant="beige">
                      {p}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No project deliverables assigned yet</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Deliverable 360° Inspection & Comments Modal ───────────────────── */}
      <Modal
        isOpen={Boolean(selectedTaskDetails)}
        onClose={() => setSelectedTaskDetails(null)}
        title={selectedTaskDetails?.title || "Deliverable Details"}
        subtitle={`Project: ${selectedTaskDetails?.projectName || "General"} • Status: ${selectedTaskDetails?.status || "Pending"}`}
        maxWidth="max-w-2xl"
        footer={
          <button
            type="button"
            onClick={() => setSelectedTaskDetails(null)}
            className="ent-btn-secondary"
          >
            Close Window
          </button>
        }
      >
        {selectedTaskDetails && (
          <div className="space-y-4">
            {/* Header Badges */}
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100">
              <Badge variant="beige">{selectedTaskDetails.projectName || "General"}</Badge>
              <Badge variant={PRIORITY_THEME[selectedTaskDetails.priority]?.badge || "blue"}>
                {selectedTaskDetails.priority} Priority
              </Badge>
              {selectedTaskDetails.status === "Done" ? (
                <Badge variant="green" className="flex items-center gap-1">
                  <CheckCircle2 size={11} /> Completed
                </Badge>
              ) : (
                <Badge variant="blue" className="flex items-center gap-1">
                  <Clock size={11} /> In Progress
                </Badge>
              )}
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3 rounded border border-[#EAE3D6]">
              <div>
                <span className="ent-label text-[10px] mb-0.5">Assignee</span>
                <div
                  className="flex items-center gap-1.5 cursor-pointer hover:underline"
                  onClick={() => handleUserClick(selectedTaskDetails.assignedTo?.username)}
                >
                  <User size={13} className="text-slate-400" />
                  <span className="font-bold text-slate-900 text-xs truncate">
                    {selectedTaskDetails.assignedTo?.username || "Unassigned"}
                  </span>
                </div>
              </div>

              <div>
                <span className="ent-label text-[10px] mb-0.5">Created By</span>
                <span className="font-semibold text-slate-700 text-xs truncate block">
                  {selectedTaskDetails.createdBy?.username || "System Lead"}
                </span>
              </div>

              <div>
                <span className="ent-label text-[10px] mb-0.5">Deadline</span>
                <span
                  className={`font-bold text-xs font-mono ${
                    checkIsOverdue(selectedTaskDetails.deadline, selectedTaskDetails.status)
                      ? "text-rose-600"
                      : "text-slate-900"
                  }`}
                >
                  {selectedTaskDetails.deadline
                    ? fnsFormat(new Date(selectedTaskDetails.deadline), "MMM d, yyyy")
                    : "No Deadline"}
                </span>
              </div>

              <div>
                <span className="ent-label text-[10px] mb-0.5">Created On</span>
                <span className="font-medium text-slate-600 text-xs font-mono">
                  {selectedTaskDetails.createdAt
                    ? fnsFormat(new Date(selectedTaskDetails.createdAt), "MMM d, yyyy")
                    : "--"}
                </span>
              </div>

              {/* Completion Metadata Banner */}
              {selectedTaskDetails.status === "Done" && selectedTaskDetails.completedAt && (() => {
                const isLate =
                  selectedTaskDetails.deadline &&
                  new Date(selectedTaskDetails.completedAt) > new Date(selectedTaskDetails.deadline);
                const daysLate = isLate
                  ? differenceInCalendarDays(
                      new Date(selectedTaskDetails.completedAt),
                      new Date(selectedTaskDetails.deadline)
                    )
                  : 0;

                return (
                  <div
                    className={`col-span-2 sm:col-span-4 p-2.5 rounded border text-xs flex items-center gap-2 mt-1 ${
                      isLate
                        ? "bg-amber-50 border-amber-300 text-amber-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    {isLate ? <AlertTriangle size={14} className="text-amber-600 shrink-0" /> : <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />}
                    <span>
                      Completed on{" "}
                      <strong>
                        {fnsFormat(new Date(selectedTaskDetails.completedAt), "MMM d, yyyy · h:mm a")}
                      </strong>
                      {isLate ? ` (${daysLate} day${daysLate > 1 ? "s" : ""} late / overdue)` : " (On Time)"}
                      {selectedTaskDetails.completedBy?.username && ` by ${selectedTaskDetails.completedBy.username}`}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Description */}
            {selectedTaskDetails.description && (
              <div className="space-y-1">
                <span className="ent-label text-[10px]">Technical Instructions & Scope</span>
                <div className="p-3 bg-white rounded border border-[#EAE3D6] text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedTaskDetails.description}
                </div>
              </div>
            )}

            {/* Reference Links */}
            {selectedTaskDetails.links?.length > 0 && (
              <div className="space-y-1">
                <span className="ent-label text-[10px]">Reference Links</span>
                <div className="flex flex-col gap-1.5">
                  {selectedTaskDetails.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1E40AF] hover:underline flex items-center gap-1.5 font-mono p-2 bg-slate-50 border border-slate-200 rounded truncate"
                    >
                      <ExternalLink size={12} className="shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Live Comments Thread */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="ent-label text-[10px] flex items-center gap-1.5">
                <MessageSquare size={12} /> Discussion & Comments ({selectedTaskDetails.comments?.length || 0})
              </span>

              {selectedTaskDetails.commentsLoading ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-xs text-[#1E40AF] font-semibold flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Fetching comments...
                </div>
              ) : selectedTaskDetails.comments?.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-400 italic">
                  No comments posted on this deliverable yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedTaskDetails.comments.map((c, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">
                          {c.createdBy?.username || c.user?.username || "Developer"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.createdAt ? fnsFormat(new Date(c.createdAt), "MMM d, h:mm a") : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
