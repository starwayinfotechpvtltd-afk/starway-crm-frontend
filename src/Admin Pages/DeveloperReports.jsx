import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, User, Calendar, AlertCircle, 
  ClipboardList, CheckCircle, Clock, AlertOctagon, Flame 
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
const PROJECT_ENDPOINT = `${API_BASE}/api/newproject/projects`;

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
  return [
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

const authFetch = (url) =>
  fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
    .then(r => (r.ok ? r.json() : []));

const resolveProjectName = (projectsList, projectId) => {
  const pid = (projectId?._id || projectId)?.toString();
  const match = projectsList.find(p => p._id?.toString() === pid);
  return match?.projectName || match?.title || "Unknown";
};

// ── Shared small components ───────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <span
    style={{ background: color + "15", color, border: `1px solid ${color}33` }}
    className="text-xs font-semibold px-2 py-0.5 rounded-sm whitespace-nowrap"
  >
    {label}
  </span>
);

const Spinner = () => (
  <div className="flex items-center justify-center h-40 relative z-20">
    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const SelectBox = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={
      "bg-white border border-gray-200 shadow-xs text-gray-800 text-base rounded-sm px-3 py-2 " +
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
    <div className="bg-white border border-gray-100 rounded-sm px-4 py-3 shadow-md text-base">
      <p className="text-gray-800 font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium text-sm">
          {p.name}: <span className="text-gray-600">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <Inbox strokeWidth={1.5} className="w-12 h-12 mb-3 text-gray-300" />
    <p className="text-base">{message}</p>
  </div>
);

function TaskRow({ task, index = 0 }) {
  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "Done";

  const deadlineStr = task.deadline
    ? new Date(task.deadline).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.4) }}
      className={
        "bg-white shadow-xs border rounded-sm px-4 py-3 flex flex-wrap items-center gap-3 relative z-10 " +
        "hover:border-gray-300 transition-colors " +
        (isOverdue ? "border-red-200" : "border-gray-200")
      }
    >
      <span
        className={
          "w-2.5 h-2.5 rounded-full flex-shrink-0 " +
          (task.status === "Done"
            ? "bg-emerald-400"
            : task.status === "In Progress"
            ? "bg-yellow-400"
            : "bg-gray-400")
        }
      />
      <p
        className={
          "flex-1 min-w-0 text-base font-medium truncate " +
          (task.status === "Done" ? "line-through text-gray-400" : "text-gray-800")
        }
      >
        {task.title}
      </p>
      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <Badge label={task.priority} color={PRIORITY_COLOR[task.priority] || "#94a3b8"} />
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-sm border border-gray-200">
          {task.status}
        </span>
        {task.projectName && (
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-sm">
            {task.projectName}
          </span>
        )}
        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
          <User size={12} strokeWidth={2.5} /> 
          {task.assignedTo?.username || "—"}
        </span>
        {deadlineStr && (
          <span
            className={
              "text-xs px-2 py-0.5 rounded-sm border flex items-center gap-1 " +
              (isOverdue
                ? "text-red-600 bg-red-50 border-red-200"
                : "text-gray-500 bg-gray-50 border-gray-200")
            }
          >
            <Calendar size={12} strokeWidth={2.5} /> 
            {deadlineStr}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DeveloperReports() {
  const [projects,        setProjects]        = useState([]);
  const [allTasks,        setAllTasks]        = useState([]);
  const [completions,     setCompletions]     = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks,    setLoadingTasks]    = useState(false);
  const [error,           setError]           = useState(null);

  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDev,     setSelectedDev]     = useState("all");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [priorityFilter,  setPriorityFilter]  = useState("all");
  const [datePreset,      setDatePreset]      = useState("All Time");
  const [customFrom,      setCustomFrom]      = useState("");
  const [customTo,        setCustomTo]        = useState("");
  const [activeTab,       setActiveTab]       = useState("tasks");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(PROJECT_ENDPOINT, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error(`Projects fetch failed (${res.status}).`);
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : data.projects ?? []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!projects.length) return;
    const targets =
      selectedProject === "all"
        ? projects
        : projects.filter(p => p._id === selectedProject);

    if (!targets.length) return;

    (async () => {
      setLoadingTasks(true);
      setError(null);
      try {
        const taskResults = await Promise.all(
          targets.map(p => authFetch(`${API_BASE}/api/tasks/${p._id}`))
        );

        const flat = taskResults.flat().map(t => ({
          ...t,
          projectName: resolveProjectName(targets, t.projectId),
        }));
        setAllTasks(flat);

        const compResults = await Promise.all(
          targets.map(p =>
            authFetch(`${API_BASE}/api/tasks/${p._id}/completions`)
          )
        );
        setCompletions(compResults.flat());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingTasks(false);
      }
    })();
  }, [projects, selectedProject]);

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

  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (selectedDev !== "all" && t.assignedTo?.username !== selectedDev) return false;
      if (statusFilter === "complete"   && t.status !== "Done")          return false;
      if (statusFilter === "incomplete" && t.status === "Done")          return false;
      if (priorityFilter !== "all"      && t.priority !== priorityFilter) return false;
      const ref = new Date(t.createdAt);
      if (fromDate && ref < fromDate) return false;
      if (toDate   && ref > toDate)   return false;
      return true;
    });
  }, [allTasks, selectedDev, statusFilter, priorityFilter, fromDate, toDate]);

  const developers = useMemo(
    () => [...new Set(allTasks.map(t => t.assignedTo?.username).filter(Boolean))],
    [allTasks]
  );

  const stats = useMemo(() => {
    const total    = filteredTasks.length;
    const done     = filteredTasks.filter(t => t.status === "Done").length;
    const overdue  = filteredTasks.filter(
      t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "Done"
    ).length;
    const critical = filteredTasks.filter(
      t => t.priority === "Critical" && t.status !== "Done"
    ).length;
    return { total, done, pending: total - done, overdue, critical };
  }, [filteredTasks]);

  const devBarData = useMemo(() => {
    const map = {};
    filteredTasks.forEach(t => {
      const name = t.assignedTo?.username || "Unknown";
      if (!map[name]) map[name] = { name, Total: 0, Done: 0, Pending: 0 };
      map[name].Total++;
      if (t.status === "Done") map[name].Done++;
      else map[name].Pending++;
    });
    return Object.values(map).sort((a, b) => b.Total - a.Total);
  }, [filteredTasks]);

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

  const projectPieData = useMemo(() => {
    const scope =
      selectedProject === "all"
        ? allTasks
        : allTasks.filter(t => {
            const pid = (t.projectId?._id || t.projectId)?.toString();
            return pid === selectedProject;
          });
    const map = {};
    scope
      .filter(t => t.status === "Done")
      .forEach(t => {
        const name = t.assignedTo?.username || "Unknown";
        map[name] = (map[name] || 0) + 1;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allTasks, selectedProject]);

  const overdueList = filteredTasks.filter(
    t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "Done"
  );
  const normalList = filteredTasks.filter(
    t => !(t.deadline && new Date(t.deadline) < new Date() && t.status !== "Done")
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans text-base">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
          .font-sans { font-family: 'DM Sans', sans-serif; }
          .font-display { font-family: 'Space Grotesk', sans-serif; }
        `}
      </style>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-30 px-6 py-4 shadow-xs">
        <div className="max-w-[90%] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">
              Developer Reports
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Task analytics & team activity</p>
          </div>
          <div className="flex items-center gap-2 text-base text-gray-500 font-medium">
            <span
              className={
                "w-2 h-2 rounded-full inline-block " +
                (loadingTasks ? "bg-yellow-400 animate-pulse" : "bg-emerald-500")
              }
            />
            {loadingTasks ? "Syncing…" : `${allTasks.length} tasks loaded`}
          </div>
        </div>
      </div>

      <div className="max-w-[90%] mx-auto px-6 py-6 space-y-6 relative z-10">

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 shadow-xs rounded-sm p-5 relative z-20"
        >
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Project</label>
              {loadingProjects ? (
                <div className="w-40 h-10 rounded-sm bg-gray-100 animate-pulse" />
              ) : (
                <SelectBox
                  value={selectedProject}
                  onChange={v => { setSelectedProject(v); setSelectedDev("all"); }}
                >
                  <option value="all">All Projects</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.projectName || p.title || p._id}
                    </option>
                  ))}
                </SelectBox>
              )}
            </div>

            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Developer</label>
              <SelectBox value={selectedDev} onChange={setSelectedDev}>
                <option value="all">All Developers</option>
                {developers.map(d => <option key={d} value={d}>{d}</option>)}
              </SelectBox>
            </div>

            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</label>
              <SelectBox value={statusFilter} onChange={setStatusFilter}>
                <option value="all">All</option>
                <option value="complete">Completed</option>
                <option value="incomplete">Incomplete</option>
              </SelectBox>
            </div>

            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Priority</label>
              <SelectBox value={priorityFilter} onChange={setPriorityFilter}>
                <option value="all">All</option>
                {["Critical","High","Medium","Low"].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </SelectBox>
            </div>

            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Period</label>
              <SelectBox value={datePreset} onChange={setDatePreset}>
                {DATE_PRESETS.map(d => (
                  <option key={d.label} value={d.label}>{d.label}</option>
                ))}
                <option value="Custom">Custom Range</option>
              </SelectBox>
            </div>

            {datePreset === "Custom" && (
              <>
                <div className="flex flex-col gap-1.5 relative z-20">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="bg-white border border-gray-200 shadow-xs text-gray-800 text-base rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1.5 relative z-20">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">To</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    className="bg-white border border-gray-200 shadow-xs text-gray-800 text-base rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 rounded-sm px-4 py-3 text-base shadow-xs relative z-10 flex items-center"
            >
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats cards */}
        {loadingTasks ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 rounded-sm bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {[
              { label: "Total Tasks",   value: stats.total,    color: "#4f46e5", icon: <ClipboardList size={22} strokeWidth={2} /> },
              { label: "Completed",     value: stats.done,     color: "#16a34a", icon: <CheckCircle size={22} strokeWidth={2} /> },
              { label: "Pending",       value: stats.pending,  color: "#64748b", icon: <Clock size={22} strokeWidth={2} /> },
              { label: "Overdue",       value: stats.overdue,  color: "#dc2626", icon: <AlertOctagon size={22} strokeWidth={2} /> },
              { label: "Critical Open", value: stats.critical, color: "#ea580c", icon: <Flame size={22} strokeWidth={2} /> },
            ].map(card => (
              <motion.div
                key={card.label}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="bg-white border border-gray-200 shadow-xs rounded-sm p-4 flex flex-col gap-2 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-semibold">{card.label}</span>
                  <span style={{ color: card.color }} className="opacity-80">{card.icon}</span>
                </div>
                <p className="text-3xl font-bold font-display" style={{ color: card.color }}>
                  {card.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-200/50 border border-gray-200 rounded-sm p-1 w-fit relative z-20">
          {[
            { id: "tasks",         label: "Task List" },
            { id: "dev-activity",  label: "Dev Activity" },
            { id: "project-chart", label: "Project Chart" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                "px-4 py-2 rounded-sm text-base font-medium transition-all " +
                (activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-xs border border-gray-100"
                  : "text-gray-500 hover:text-gray-800")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Tab: Task List ── */}
          {activeTab === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 relative z-10"
            >
              {loadingTasks ? <Spinner /> : (
                <>
                  {overdueList.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1.5">
                        <AlertCircle size={14} strokeWidth={2.5} /> Overdue ({overdueList.length})
                      </h3>
                      <div className="space-y-2">
                        {overdueList.map((t, i) => <TaskRow key={t._id} task={t} index={i} />)}
                      </div>
                    </div>
                  )}
                  {normalList.length === 0 && overdueList.length === 0 && (
                    <EmptyState message="No tasks match your filters" />
                  )}
                  {normalList.length > 0 && (
                    <div className="space-y-2">
                      {normalList.map((t, i) => <TaskRow key={t._id} task={t} index={i} />)}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── Tab: Dev Activity ── */}
          {activeTab === "dev-activity" && (
            <motion.div
              key="dev-activity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 relative z-10"
            >
              {loadingTasks ? <Spinner /> : (
                <>
                  <div className="bg-white border border-gray-200 shadow-xs rounded-sm p-5">
                    <h3 className="font-semibold font-display text-gray-900 mb-1">
                      Completions in Period
                    </h3>
                    <p className="text-sm text-gray-500 mb-5">
                      Tasks marked Done · {datePreset}
                    </p>
                    {completionBarData.length === 0 ? (
                      <EmptyState message="No completions in this period" />
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={completionBarData} barCategoryGap="30%">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="Completed" radius={[4,4,0,0]}>
                            {completionBarData.map((_, i) => (
                              <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 shadow-xs rounded-sm p-5">
                    <h3 className="font-semibold font-display text-gray-900 mb-1">
                      Task Breakdown per Developer
                    </h3>
                    <p className="text-sm text-gray-500 mb-5">Done vs Pending</p>
                    {devBarData.length === 0 ? (
                      <EmptyState message="No data" />
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={devBarData} barCategoryGap="25%">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ color: "#475569", fontSize: 13 }} />
                          <Bar dataKey="Done"    fill="#16a34a" radius={[2,2,0,0]} />
                          <Bar dataKey="Pending" fill="#4f46e5" radius={[2,2,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {developers.length === 0 && (
                      <EmptyState message="No developer data yet" />
                    )}
                    {developers.map((dev, i) => {
                      const devTasks = filteredTasks.filter(t => t.assignedTo?.username === dev);
                      const done     = devTasks.filter(t => t.status === "Done").length;
                      const pct      = devTasks.length ? Math.round((done / devTasks.length) * 100) : 0;
                      const overdueCount = devTasks.filter(
                        t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "Done"
                      ).length;
                      return (
                        <motion.div
                          key={dev}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white border border-gray-200 shadow-xs rounded-sm p-5 hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-xs"
                              style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }}
                            >
                              {dev[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-base">{dev}</p>
                              <p className="text-sm text-gray-500">{devTasks.length} tasks assigned</p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 font-medium mb-1.5">
                              <span>Completion</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-2 rounded-sm bg-gray-100 overflow-hidden">
                              <motion.div
                                className="h-full rounded-sm"
                                style={{ background: DEV_PALETTE[i % DEV_PALETTE.length] }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.08 }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                              { label: "Done",    value: done,                        color: "#16a34a", bg: "bg-green-50" },
                              { label: "Pending", value: devTasks.length - done, color: "#4f46e5", bg: "bg-indigo-50" },
                              { label: "Overdue", value: overdueCount,           color: "#dc2626", bg: "bg-red-50" },
                            ].map(s => (
                              <div key={s.label} className={`${s.bg} border border-gray-100 rounded-sm py-2 px-1`}>
                                <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
                                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── Tab: Project Chart ── */}
          {activeTab === "project-chart" && (
            <motion.div
              key="project-chart"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 relative z-10"
            >
              {loadingTasks ? <Spinner /> : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  <div className="bg-white border border-gray-200 shadow-xs rounded-sm p-5">
                    <h3 className="font-semibold font-display text-gray-900 mb-1">
                      Completed Tasks by Developer
                    </h3>
                    <p className="text-sm text-gray-500 mb-5">
                      {selectedProject === "all"
                        ? "Across all projects"
                        : projects.find(p => p._id === selectedProject)?.projectName || "—"}
                    </p>
                    {projectPieData.length === 0 ? (
                      <EmptyState message="No completed tasks found" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={projectPieData}
                            cx="50%" cy="50%"
                            innerRadius={70} outerRadius={115}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                            labelLine={{ stroke: "#94a3b8" }}
                          >
                            {projectPieData.map((_, i) => (
                              <Cell key={i} fill={DEV_PALETTE[i % DEV_PALETTE.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ color: "#475569", fontSize: 13 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 shadow-xs rounded-sm p-5">
                    <h3 className="font-semibold font-display text-gray-900 mb-1">
                      Tasks per Developer
                    </h3>
                    <p className="text-sm text-gray-500 mb-5">Done vs Pending (stacked)</p>
                    {devBarData.length === 0 ? (
                      <EmptyState message="No tasks found" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={devBarData} layout="vertical" barCategoryGap="25%">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} width={90} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ color: "#475569", fontSize: 13 }} />
                          <Bar dataKey="Done"    fill="#16a34a" radius={[0,2,2,0]} stackId="a" />
                          <Bar dataKey="Pending" fill="#4f46e5" radius={[0,2,2,0]} stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 shadow-xs rounded-sm p-5 lg:col-span-2">
                    <h3 className="font-semibold font-display text-gray-900 mb-1">
                      Open Tasks by Priority
                    </h3>
                    <p className="text-sm text-gray-500 mb-5">Only incomplete tasks</p>
                    {(() => {
                      const data = ["Critical","High","Medium","Low"]
                        .map(p => ({
                          name: p,
                          value: filteredTasks.filter(t => t.priority === p && t.status !== "Done").length,
                        }))
                        .filter(d => d.value > 0);
                      return data.length === 0 ? (
                        <EmptyState message="No open tasks" />
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={data} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Open Tasks" radius={[4,4,0,0]}>
                              {data.map(d => (
                                <Cell key={d.name} fill={PRIORITY_COLOR[d.name]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}