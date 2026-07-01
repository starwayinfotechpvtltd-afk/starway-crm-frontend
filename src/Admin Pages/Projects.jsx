import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderDot, 
  Eye, 
  Trash2, 
  KanbanSquare, 
  CheckCircle2,
  PenSquare,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import ProjectKanban from "../Admin Pages/Components/Projectkanban";
import ProjectSpreadsheet from "../Components Global/ProjectSpreadsheet";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Helpers ──────────────────────────────────────────────────────────────────
const normalizeDevelopers = (assignedDeveloper) => {
  if (!assignedDeveloper) return [];
  if (Array.isArray(assignedDeveloper)) return assignedDeveloper.filter((d) => d && d.username);
  if (assignedDeveloper.username) return [assignedDeveloper];
  return [];
};

const getDevNamesString = (assignedDeveloper) =>
  normalizeDevelopers(assignedDeveloper).map((d) => d.username).join(", ") || "—";

// ── UI Components ─────────────────────────────────────────────────────────────
const DevCell = ({ assignedDeveloper }) => {
  const devs = normalizeDevelopers(assignedDeveloper);
  if (devs.length === 0) return <span className="text-[10px] font-bold text-[#656D76] italic neu-pressed-sm px-2 py-1 rounded-md">Unassigned</span>;

  const MAX_AVATARS = 2;
  const shown = devs.slice(0, MAX_AVATARS);
  const overflow = devs.length - MAX_AVATARS;
  const labelText = devs.length === 1 ? devs[0].username : `${devs[0].username.split(" ")[0]} +${devs.length - 1}`;
  const tooltipLabel = devs.map((d) => d.username).join(", ");

  return (
    <div className="flex items-center gap-2 cursor-default" title={tooltipLabel}>
      <div className="flex items-center shrink-0">
        {shown.map((dev, i) => (
          <div key={dev.id || i} className="w-6 h-6 rounded-full neu-btn-primary flex items-center justify-center text-white text-[9px] font-bold border-2 border-[#F0F4F8]" style={{ marginLeft: i > 0 ? "-8px" : "0", zIndex: shown.length - i }}>
            {dev.username.charAt(0).toUpperCase()}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-6 h-6 rounded-full neu-pressed flex items-center justify-center text-[#656D76] text-[9px] font-bold border-2 border-[#F0F4F8] z-0" style={{ marginLeft: "-8px" }}>
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-xs font-bold text-[#1F2328] truncate max-w-[80px]">{labelText}</span>
    </div>
  );
};

const ProgressCapsule = ({ stats }) => {
  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  
  if (total === 0) return <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">No tasks</span>;
  
  const pct = Math.round((completed / total) * 100);
  const isDone = pct === 100;

  return (
    <div className="flex flex-col gap-1 w-full max-w-[100px]">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider">{completed}/{total}</span>
        <span className={`text-[9px] font-bold ${isDone ? 'text-[#1A7F37]' : 'text-[#0969DA]'}`}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full neu-pressed-sm overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-[#1A7F37]' : 'bg-[#0969DA]'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// Custom Switch
const ToggleSwitch = ({ checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group relative z-20">
    <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${checked ? 'neu-btn-primary' : 'neu-pressed'}`}>
      <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
  </label>
);

// ── Desktop Row Component ────────────────────────────────────────────────────
const ProjectRow = ({ project, isLast, onView, onStatusChange, onToggleUpSale, onUpsaleAdd, onKanban, onSpreadsheet, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className={`border-b border-[#D1DCEB]/30 transition-colors hover:bg-[#D1DCEB]/10 ${isLast ? 'border-none' : ''}`}>
        
        {/* Project Name */}
        <td className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg neu-flat-sm flex items-center justify-center shrink-0 text-[#0969DA]">
              <FolderDot size={16} />
            </div>
            <div className="min-w-0">
              <button type="button" onClick={() => onView(project)} className="text-sm font-bold text-[#1F2328] hover:text-[#0969DA] truncate text-left w-full neu-action-btn relative z-20 block">
                {project.projectName}
              </button>
              <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider truncate">Created by {project.createdBy}</p>
            </div>
          </div>
        </td>

        {/* Assigned */}
        <td className="p-3"><DevCell assignedDeveloper={project.assignedDeveloper} /></td>

        {/* Service Type */}
        <td className="p-3">
          <div className="flex flex-wrap gap-1.5 items-center max-w-[120px]">
            {project.serviceType.slice(0, 2).map((s, i) => (
              <span key={i} className="text-[9px] font-bold text-[#0969DA] uppercase tracking-wider bg-[#0969DA]/10 px-1.5 py-0.5 rounded-md truncate max-w-[80px]">{s}</span>
            ))}
            {project.serviceType.length > 2 && (
              <span className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider border border-[#D1DCEB] px-1.5 py-0.5 rounded-md">+{project.serviceType.length - 2}</span>
            )}
          </div>
        </td>

        {/* Status */}
        <td className="p-3">
          <div className="relative w-24 z-20">
            <select
              value={project.status}
              onChange={(e) => onStatusChange(project._id, e.target.value)}
              className={`w-full neu-pressed-sm rounded-md p-1.5 pr-6 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none bg-transparent ${project.status === 'Active' ? 'text-[#1A7F37]' : 'text-[#D1242F]'}`}
            >
              <option value="Active">ACTIVE</option>
              <option value="Closed">CLOSED</option>
            </select>
            <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${project.status === 'Active' ? 'text-[#1A7F37]' : 'text-[#D1242F]'}`} />
          </div>
        </td>

        {/* Progress */}
        <td className="p-3"><ProgressCapsule stats={project.taskStats} /></td>

        {/* Up-Sale */}
        <td className="p-3">
          <div className="flex items-center gap-2">
            <ToggleSwitch checked={project.upSale} onChange={() => onToggleUpSale(project._id, project.upSale)} />
            {project.upSale && (
              <button type="button" onClick={() => onUpsaleAdd(project._id)} className="neu-flat-sm neu-action-btn text-[10px] font-bold text-[#1F2328] px-2 py-1 rounded-md">
                Add
              </button>
            )}
          </div>
        </td>

        {/* Actions */}
        <td className="p-3 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button type="button" onClick={() => onSpreadsheet(project)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#1A7F37]" title="Open Spreadsheets"><FileSpreadsheet size={14} className="pointer-events-none"/></button>
            <button type="button" onClick={() => onKanban(project)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#0969DA]" title="Open Kanban"><KanbanSquare size={14} className="pointer-events-none"/></button>
            <button type="button" onClick={() => onView(project)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#656D76]" title="View Details"><Eye size={14} className="pointer-events-none"/></button>
            <button type="button" onClick={() => setExpanded(!expanded)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#656D76]">
              {expanded ? <ChevronUp size={14} className="pointer-events-none"/> : <ChevronDown size={14} className="pointer-events-none"/>}
            </button>
            <button type="button" onClick={() => onDelete(project._id)} className="neu-flat-sm neu-action-btn p-1.5 rounded-md text-[#D1242F] border border-[#D1242F]/30" title="Delete"><Trash2 size={14} className="pointer-events-none"/></button>
          </div>
        </td>
      </tr>

      {/* Expanded Row: Recent Completions */}
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={7} className="p-0 border-b border-[#D1DCEB]/30">
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[#D1DCEB]/10">
                <div className="p-4 pl-14">
                  <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Recent Completions</p>
                  {(!project.recentCompletions || project.recentCompletions.length === 0) ? (
                    <p className="text-xs font-bold text-[#656D76] italic">No tasks completed yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {project.recentCompletions.map((task) => (
                        <div key={task._id} className="neu-pressed rounded-md p-2 px-3 flex items-center gap-3 w-fit pr-8">
                          <CheckCircle2 size={14} className="text-[#1A7F37] shrink-0" />
                          <span className="text-xs font-bold text-[#1F2328]">{task.taskTitle || task.title}</span>
                          <span className="text-[10px] font-bold text-[#656D76] ml-4 bg-[#D1DCEB]/50 px-2 py-0.5 rounded-md">{task.completedBy?.username}</span>
                          <span className="text-[10px] font-bold text-[#656D76] ml-2">{task.completedAt ? format(new Date(task.completedAt), "MMM d, yyyy") : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProjectList() {
  const [isLoading, setIsLoading] = useState(true);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const [kanbanProject, setKanbanProject] = useState(null);
  
  const [spreadsheetOpen, setSpreadsheetOpen] = useState(false);
  const [spreadsheetProject, setSpreadsheetProject] = useState(null);
  
  // Data States
  const [projects, setProjects] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [developers, setDevelopers] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  
  // Dialogs
  const [selectedProject, setSelectedProject] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [projectToDeleteId, setProjectToDeleteId] = useState(null);
  const [upsaleDialogOpen, setUpsaleDialogOpen] = useState(false);
  const [upsaleData, setUpsaleData] = useState({ serviceType: "", amount: "", details: "", comments: "" });
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [editUpsaleDialogOpen, setEditUpsaleDialogOpen] = useState(false);
  const [selectedUpsaleId, setSelectedUpsaleId] = useState(null);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [editProjectData, setEditProjectData] = useState({});
  
  // Feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const CACHE_KEY = "admin_projects_cache";

  // NEW OPTIMIZED API FETCH
  const fetchAllData = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [dashRes, devsRes, servRes] = await Promise.all([
        axios.get(`${API_BASE}/api/reports/dashboard`, { headers }),
        axios.get(`${API_BASE}/api/auth/developers`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/servicetypes`, { headers }).catch(() => ({ data: [] }))
      ]);

      const fetchedProjects = dashRes.data.projects || [];
      const fetchedTasks = dashRes.data.tasks || [];
      const fetchedCompletions = dashRes.data.completions || [];
      const fetchedDevs = devsRes.data || [];
      const fetchedServices = servRes.data?.map(st => st.name) || [];

      // Link Task Stats and Completions internally to avoid N+1 queries
      fetchedProjects.forEach(p => {
        const pid = p._id.toString();
        const pTasks = fetchedTasks.filter(t => (t.projectId?._id || t.projectId)?.toString() === pid && t.status !== "Done");
        const pComps = fetchedCompletions.filter(c => (c.projectId?._id || c.projectId)?.toString() === pid);
        
        p.taskStats = {
          total: pTasks.length + pComps.length,
          completed: pComps.length
        };
        
        p.recentCompletions = pComps
          .sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt))
          .slice(0, 5);
      });

      setProjects(fetchedProjects);
      setDevelopers(fetchedDevs);
      setServiceTypes(fetchedServices);

      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
         projects: fetchedProjects,
         developers: fetchedDevs,
         serviceTypes: fetchedServices,
         timestamp: Date.now()
      }));

    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setProjects(parsed.projects || []);
        setDevelopers(parsed.developers || []);
        setServiceTypes(parsed.serviceTypes || []);
        setIsLoading(false);
        fetchAllData(true);
      } catch (e) {
        fetchAllData();
      }
    } else {
      fetchAllData();
    }
  }, []);

  const handleKanbanClick = (project) => {
    setKanbanProject(project);
    setKanbanOpen(true);
  };

  const handleSpreadsheetClick = (project) => {
    setSpreadsheetProject(project);
    setSpreadsheetOpen(true);
  };

  const filteredProjects = projects.filter((p) => {
    const devNames = normalizeDevelopers(p.assignedDeveloper).map((d) => d.username);
    return (
      p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!subscriptionFilter || p.subscriptionType === subscriptionFilter) &&
      (!createdByFilter || p.createdBy === createdByFilter) &&
      (!assignedToFilter || devNames.includes(assignedToFilter)) &&
      (!serviceTypeFilter || p.serviceType.includes(serviceTypeFilter))
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage) || 1;
  const currentProjects = filteredProjects.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const subscriptionTypes = [...new Set(projects.map((p) => p.subscriptionType).filter(Boolean))];
  const createdByValues = [...new Set(projects.map((p) => p.createdBy).filter(Boolean))];
  const assignedToValues = [...new Set(projects.flatMap((p) => normalizeDevelopers(p.assignedDeveloper).map((d) => d.username)))];
  const serviceTypeValues = [...new Set(projects.flatMap((p) => p.serviceType || []))];

  const showSnackbar = (msg, sev) => {
    setSnackbarMessage(msg); setSnackbarSeverity(sev); setSnackbarOpen(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      const r = await axios.put(`${API_BASE}/api/newproject/projects/${id}/status`, { status }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      const updated = r.data.updatedProject;
      setProjects((prev) => prev.map((p) => (p._id === updated._id ? { ...p, status: updated.status } : p)));
    } catch (err) { console.error(err); }
  };

  const handleToggleUpSale = async (id, cur) => {
    const newStatus = !cur;
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, upSale: newStatus } : p)));
    try {
      await axios.put(`${API_BASE}/api/newproject/projects/${id}/up-sale`, { upSale: newStatus }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    } catch { }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/api/newproject/projects/${projectToDeleteId}`);
      fetchAllData(true);
      showSnackbar("Project deleted successfully.", "success");
    } catch {
      showSnackbar("Failed to delete project.", "error");
    } finally {
      setDeleteConfirmationOpen(false);
      setProjectToDeleteId(null);
    }
  };

  const handleEditProjectClick = (p) => {
    setEditProjectData({ 
      ...p, 
      assignedDeveloper: normalizeDevelopers(p.assignedDeveloper),
      excelAuthorizedDevelopers: p.excelAuthorizedDevelopers || []
    });
    setEditProjectDialogOpen(true);
  };

  const handleEditProjectDialogClose = () => {
    setEditProjectDialogOpen(false);
  };

  const handleEditProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/newproject/projects/${selectedProject._id}`, editProjectData, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      fetchAllData(true);
      setEditProjectDialogOpen(false);
      setSelectedProject({...editProjectData}); // Update view modal instantly
      showSnackbar("Project updated successfully.", "success");
    } catch {
      showSnackbar("Update failed.", "error");
    }
  };

  const handleUpsaleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/newproject/projects/${selectedProjectId}/upsale`, upsaleData, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      fetchAllData(true);
      setUpsaleDialogOpen(false);
      setUpsaleData({ serviceType: "", amount: "", details: "", comments: "" });
      showSnackbar("Upsale added successfully.", "success");
    } catch {
      showSnackbar("Failed to add upsale.", "error");
    }
  };

  const handleEditUpsaleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/newproject/projects/${selectedProjectId}/upsale/${selectedUpsaleId}`, upsaleData, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      fetchAllData(true);
      setEditUpsaleDialogOpen(false);
      
      // Update currently viewed project to reflect upsale change instantly
      const updatedUpsaleList = selectedProject.upsaleData.map(u => u._id === selectedUpsaleId ? {...upsaleData, _id: selectedUpsaleId} : u);
      setSelectedProject({...selectedProject, upsaleData: updatedUpsaleList});
      
      setUpsaleData({ serviceType: "", amount: "", details: "", comments: "" });
      showSnackbar("Upsale updated successfully.", "success");
    } catch { 
      showSnackbar("Failed to update upsale.", "error");
    }
  };


  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center neu-base">
        <div className="neu-flat rounded-2xl p-10 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#D1DCEB] border-t-[#0969DA] rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-[#656D76] animate-pulse uppercase tracking-wider">Loading Projects Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col neu-base p-4 sm:p-6 montserrat-regular text-[#1F2328]">
      
      {/* ── Header & Filters (Fixed at Top) ── */}
      <div className="shrink-0 flex flex-col gap-4 mb-4 z-20">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="neu-pressed-sm p-2 rounded-lg text-[#0969DA]">
               <FolderDot size={20} />
            </div>
            <h1 className="text-2xl montserrat-medium text-[#1F2328]">Have a look at your projects!</h1>
          </div>
          <div className="neu-pressed-sm rounded-md px-3.5 py-1.5 flex items-center gap-2">
            <span className="text-xs font-bold text-[#656D76]">{filteredProjects.length} Projects</span>
          </div>
        </div>

        <div className="neu-flat rounded-xl p-5 flex flex-col md:flex-row gap-4">
          
          <div className="relative w-full md:w-1/3 z-20">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full neu-pressed rounded-md py-2.5 pl-10 pr-4 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
            />
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-20">
            {[
              { label: "Subscription", value: subscriptionFilter, onChange: (e) => {setSubscriptionFilter(e.target.value); setPage(1);}, options: subscriptionTypes },
              { label: "Created By", value: createdByFilter, onChange: (e) => {setCreatedByFilter(e.target.value); setPage(1);}, options: createdByValues },
              { label: "Assigned To", value: assignedToFilter, onChange: (e) => {setAssignedToFilter(e.target.value); setPage(1);}, options: assignedToValues },
              { label: "Service", value: serviceTypeFilter, onChange: (e) => {setServiceTypeFilter(e.target.value); setPage(1);}, options: serviceTypeValues },
            ].map(({ label, value, onChange, options }) => (
              <div key={label} className="relative">
                <select value={value} onChange={onChange} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                  <option value="">All {label}</option>
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table Container (Flexible Height, Internal Scroll) ── */}
      <div className="flex-1 min-h-0 relative z-10 flex flex-col neu-flat rounded-xl p-2 sm:p-4 mb-4">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-[#F0F4F8]">
              <tr>
                {["Project", "Assigned Team", "Tags", "Status", "Progress", "Up-Sale", "Actions"].map((h, i) => (
                  <th key={h} className={`p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80 ${i === 6 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-bold text-[#656D76]">No projects match your current filters.</p>
                  </td>
                </tr>
              ) : (
                currentProjects.map((project, idx) => (
                  <ProjectRow 
                    key={project._id} 
                    project={project} 
                    isLast={idx === currentProjects.length - 1} 
                    onView={(p) => { setSelectedProject(p); setOpen(true); }} 
                    onStatusChange={handleStatusChange} 
                    onToggleUpSale={handleToggleUpSale} 
                    onUpsaleAdd={(id) => { setSelectedProjectId(id); setUpsaleDialogOpen(true); }} 
                    onKanban={handleKanbanClick} 
                    onSpreadsheet={handleSpreadsheetClick}
                    onDelete={(id) => { setProjectToDeleteId(id); setDeleteConfirmationOpen(true); }} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer Pagination (Fixed at Bottom) ── */}
      <div className="shrink-0 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Rows per page</label>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="neu-pressed rounded-md p-2 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="neu-flat-sm neu-action-btn rounded-md px-3 py-1.5 flex items-center gap-1 text-xs font-bold text-[#656D76] disabled:opacity-40"
          >
            <ChevronLeft size={14} className="pointer-events-none" /> Prev
          </button>
          <span className="text-xs font-bold text-[#1F2328] neu-pressed-sm px-3 py-1.5 rounded-md">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="neu-flat-sm neu-action-btn rounded-md px-3 py-1.5 flex items-center gap-1 text-xs font-bold text-[#656D76] disabled:opacity-40"
          >
             Next <ChevronRight size={14} className="pointer-events-none" />
          </button>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* 1. Project Details Modal */}
      <AnimatePresence>
        {open && selectedProject && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-4xl flex flex-col relative z-10 max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-start shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl neu-btn-primary flex items-center justify-center text-white shrink-0">
                     <FolderDot size={20} />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-[#1F2328]">{selectedProject.projectName}</h2>
                     <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Project Details</p>
                   </div>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]">
                  <X size={18} className="pointer-events-none" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                
                <div className="neu-pressed rounded-xl p-6">
                  <h3 className="text-[10px] font-bold text-[#0969DA] uppercase tracking-wider mb-4 border-b border-[#D1DCEB]/50 pb-2">Core Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { label: "Client", value: selectedProject.clientName },
                      { label: "Client Email", value: selectedProject.clientEmail },
                      { label: "Client Number", value: selectedProject.clientNumber },
                      { label: "Amount", value: selectedProject.amount ? `$${selectedProject.amount}` : "—" },
                      { label: "Assigned Developer(s)", value: getDevNamesString(selectedProject.assignedDeveloper) },
                      { label: "Service Type", value: (selectedProject.serviceType || []).join(", ") || "—" },
                      { label: "Reference Site", value: selectedProject.referenceSite || "—" },
                      { label: "Business Niche", value: selectedProject.businessNiche || "—" },
                      { label: "Subscription Type", value: selectedProject.subscriptionType || "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-bold text-[#1F2328] break-words">{value}</p>
                      </div>
                    ))}
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Details</p>
                      <div className="neu-flat-sm rounded-lg p-4 text-sm font-medium text-[#1F2328] whitespace-pre-wrap">{selectedProject.projectDetails || "—"}</div>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Comments</p>
                      <div className="neu-flat-sm rounded-lg p-4 text-sm font-medium text-[#1F2328] whitespace-pre-wrap">{selectedProject.comments || "—"}</div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button type="button" onClick={() => handleEditProjectClick(selectedProject)} className="neu-btn-primary px-6 py-2.5 rounded-lg text-xs font-bold text-white neu-action-btn flex items-center gap-2">
                      <PenSquare size={14} className="pointer-events-none" /> Edit Project
                    </button>
                  </div>
                </div>

                {selectedProject.upsaleData?.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold text-[#0969DA] uppercase tracking-wider mb-4 border-b border-[#D1DCEB]/50 pb-2">Upsale Packages</h3>
                    <div className="space-y-4">
                      {selectedProject.upsaleData.map((upsale, idx) => (
                        <div key={idx} className="neu-flat-sm rounded-xl p-5 border border-[#D1DCEB]/30 relative">
                          <div className="absolute top-4 right-4 z-20">
                            <button type="button" onClick={() => { setSelectedProjectId(selectedProject._id); setSelectedUpsaleId(upsale._id); setUpsaleData(upsale); setEditUpsaleDialogOpen(true); }} className="neu-pressed-sm neu-action-btn px-4 py-2 rounded-lg text-[10px] font-bold text-[#0969DA] flex items-center gap-1.5">
                              <PenSquare size={12} className="pointer-events-none" /> Edit
                            </button>
                          </div>
                          <span className="text-[10px] font-bold text-[#1F2328] neu-pressed-sm px-2 py-1 rounded-md mb-4 inline-block">Package {idx + 1}</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Service Type</p><p className="text-sm font-bold text-[#1F2328]">{upsale.serviceType || "—"}</p></div>
                            <div><p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Amount</p><p className="text-sm font-bold text-[#1A7F37]">{upsale.amount ? `$${upsale.amount}` : "—"}</p></div>
                            <div className="sm:col-span-2"><p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Details</p><p className="text-sm font-medium text-[#1F2328]">{upsale.details || "—"}</p></div>
                            <div className="sm:col-span-2"><p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Comments</p><p className="text-sm font-medium text-[#1F2328]">{upsale.comments || "—"}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end shrink-0">
                <button type="button" onClick={() => setOpen(false)} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Edit Project Modal */}
      <AnimatePresence>
        {editProjectDialogOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleEditProjectDialogClose} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-4xl flex flex-col relative z-10 max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#1F2328]">Edit Project</h2>
                <button type="button" onClick={handleEditProjectDialogClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]">
                  <X size={18} className="pointer-events-none" />
                </button>
              </div>

              <form id="editProjectForm" onSubmit={handleEditProjectSubmit} className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-20">
                  {[
                    { label: "Project Name", key: "projectName", type: "text" }, 
                    { label: "Client Name", key: "clientName", type: "text" },
                    { label: "Client Email", key: "clientEmail", type: "email" }, 
                    { label: "Client Number", key: "clientNumber", type: "text" },
                    { label: "Amount", key: "amount", type: "text" }, 
                    { label: "Reference Site", key: "referenceSite", type: "text" },
                    { label: "Business Niche", key: "businessNiche", type: "text" },
                  ].map((f) => (
                    <div key={f.key} className="relative z-20">
                      <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">{f.label}</label>
                      <input type={f.type} value={editProjectData[f.key] || ""} onChange={(e) => setEditProjectData((p) => ({ ...p, [f.key]: e.target.value }))} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                    </div>
                  ))}

                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Subscription Type</label>
                    <div className="relative">
                      <select value={editProjectData.subscriptionType || ""} onChange={(e) => setEditProjectData((p) => ({ ...p, subscriptionType: e.target.value }))} className="w-full neu-pressed rounded-md p-3 pr-8 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20">
                        <option value="Subscription-Based">Subscription-Based</option>
                        <option value="One-Time">One-Time</option>
                        <option value="Website-Based">Website-Based</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
                    </div>
                  </div>

                  {/* Developers Checkbox List */}
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Assigned Developer(s)</label>
                    <div className="neu-pressed rounded-xl p-3 h-[150px] overflow-y-auto custom-scrollbar space-y-1 relative z-20">
                      {developers.map((dev) => {
                        const isSelected = (editProjectData.assignedDeveloper || []).some(d => d.id === dev._id);
                        return (
                          <label key={dev._id} className={`flex items-center px-4 py-2 cursor-pointer rounded-lg transition-all duration-200 relative z-20 ${isSelected ? "neu-flat bg-[#F0F4F8]" : "hover:bg-[#D1DCEB]/20"}`}>
                            <input type="checkbox" checked={isSelected} onChange={() => {
                               let arr = editProjectData.assignedDeveloper || [];
                               if (isSelected) arr = arr.filter(d => d.id !== dev._id);
                               else arr = [...arr, { id: dev._id, username: dev.username }];
                               setEditProjectData(p => ({ ...p, assignedDeveloper: arr }));
                            }} className="w-4 h-4 accent-[#0969DA] cursor-pointer relative z-30" />
                            <span className={`ml-3 text-sm transition-colors ${isSelected ? "font-bold text-[#0969DA]" : "font-medium text-[#1F2328]"}`}>{dev.username}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Excel Authorization Checkbox List */}
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Excel Sheet Authorization</label>
                    <div className="neu-pressed rounded-xl p-3 h-[150px] overflow-y-auto custom-scrollbar space-y-1 relative z-20">
                      {developers.map((dev) => {
                        const isSelected = (editProjectData.excelAuthorizedDevelopers || []).includes(dev._id);
                        return (
                          <label key={dev._id} className={`flex items-center px-4 py-2 cursor-pointer rounded-lg transition-all duration-200 relative z-20 ${isSelected ? "neu-flat bg-[#F0F4F8]" : "hover:bg-[#D1DCEB]/20"}`}>
                            <input type="checkbox" checked={isSelected} onChange={() => {
                               let arr = editProjectData.excelAuthorizedDevelopers || [];
                               if (isSelected) arr = arr.filter(id => id !== dev._id);
                               else arr = [...arr, dev._id];
                               setEditProjectData(p => ({ ...p, excelAuthorizedDevelopers: arr }));
                            }} className="w-4 h-4 accent-[#107C41] cursor-pointer relative z-30" />
                            <span className={`ml-3 text-sm transition-colors ${isSelected ? "font-bold text-[#107C41]" : "font-medium text-[#1F2328]"}`}>{dev.username}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Services Toggle Pills */}
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Service Type</label>
                    <div className="neu-pressed rounded-xl p-4 h-[150px] overflow-y-auto custom-scrollbar flex flex-wrap gap-2 items-start relative z-20">
                      {serviceTypes.map(type => {
                        const isSelected = (editProjectData.serviceType || []).includes(type);
                        return (
                          <button
                            type="button"
                            key={type}
                            onClick={() => {
                              let arr = editProjectData.serviceType || [];
                              if (isSelected) arr = arr.filter(t => t !== type);
                              else arr = [...arr, type];
                              setEditProjectData(p => ({ ...p, serviceType: arr }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all neu-action-btn relative z-30 ${
                              isSelected ? "neu-pressed border border-[#0969DA] text-[#0969DA] shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.1)]" : "neu-flat-sm text-[#656D76]"
                            }`}
                          >
                            {type}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="sm:col-span-2 relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Details</label>
                    <textarea rows={3} value={editProjectData.projectDetails || ""} onChange={(e) => setEditProjectData((p) => ({ ...p, projectDetails: e.target.value }))} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text resize-none custom-scrollbar relative z-20" />
                  </div>
                  <div className="sm:col-span-2 relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Comments</label>
                    <textarea rows={2} value={editProjectData.comments || ""} onChange={(e) => setEditProjectData((p) => ({ ...p, comments: e.target.value }))} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text resize-none custom-scrollbar relative z-20" />
                  </div>
                </div>
              </form>

              <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end gap-4 shrink-0 relative z-20">
                <button type="button" onClick={handleEditProjectDialogClose} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">
                  Cancel
                </button>
                <button type="submit" form="editProjectForm" className="neu-btn-primary px-8 py-2.5 rounded-lg text-sm font-bold text-white neu-action-btn">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Add/Edit Upsale Modal */}
      <AnimatePresence>
        {(upsaleDialogOpen || editUpsaleDialogOpen) && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => {setUpsaleDialogOpen(false); setEditUpsaleDialogOpen(false); setUpsaleData({ serviceType: "", amount: "", details: "", comments: "" });}} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-md flex flex-col relative z-10"
            >
              <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#1F2328]">{editUpsaleDialogOpen ? "Edit Upsale" : "Add Upsale Package"}</h2>
                <button type="button" onClick={() => {setUpsaleDialogOpen(false); setEditUpsaleDialogOpen(false); setUpsaleData({ serviceType: "", amount: "", details: "", comments: "" });}} className="neu-flat-sm neu-action-btn rounded-full p-2 text-[#656D76] hover:text-[#D1242F]">
                  <X size={18} className="pointer-events-none" />
                </button>
              </div>

              <form id="upsaleForm" onSubmit={editUpsaleDialogOpen ? handleEditUpsaleSubmit : handleUpsaleSubmit} className="p-6 space-y-4">
                {[{ label: "Service Type", name: "serviceType" }, { label: "Amount", name: "amount" }].map((f) => (
                  <div key={f.name} className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">{f.label}</label>
                    <input required type={f.name === "amount" ? "number" : "text"} value={upsaleData[f.name]} onChange={(e) => setUpsaleData((p) => ({ ...p, [f.name]: e.target.value }))} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                  </div>
                ))}
                {[{ label: "Details", name: "details" }, { label: "Comments", name: "comments" }].map((f) => (
                  <div key={f.name} className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">{f.label}</label>
                    <textarea rows={2} value={upsaleData[f.name]} onChange={(e) => setUpsaleData((p) => ({ ...p, [f.name]: e.target.value }))} className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text resize-none custom-scrollbar relative z-20" />
                  </div>
                ))}
              </form>

              <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end gap-4 shrink-0 relative z-20">
                <button type="button" onClick={() => {setUpsaleDialogOpen(false); setEditUpsaleDialogOpen(false); setUpsaleData({ serviceType: "", amount: "", details: "", comments: "" });}} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">
                  Cancel
                </button>
                <button type="submit" form="upsaleForm" className="neu-btn-primary px-8 py-2.5 rounded-lg text-sm font-bold text-white neu-action-btn">
                  {editUpsaleDialogOpen ? "Save Package" : "Add Package"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirmationOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cancelDelete} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-sm flex flex-col relative z-10 p-8 text-center items-center"
            >
              <div className="neu-pressed-sm p-4 rounded-full text-[#D1242F] mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#1F2328] mb-2">Delete Project?</h2>
              <p className="text-sm font-medium text-[#656D76] mb-8">
                This action is permanent and cannot be undone. Are you sure you want to delete this project?
              </p>
              
              <div className="flex gap-4 w-full relative z-20">
                <button type="button" onClick={cancelDelete} className="flex-1 neu-flat neu-action-btn rounded-lg py-3 text-sm font-bold text-[#656D76]">
                  Cancel
                </button>
                <button type="button" onClick={confirmDelete} className="flex-1 neu-flat neu-action-btn border border-[#D1242F]/30 rounded-lg py-3 text-sm font-bold text-[#D1242F]">
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Custom Snackbar ── */}
      <AnimatePresence>
        {snackbarOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[99999] flex items-center gap-4 neu-flat rounded-xl p-4 montserrat-medium max-w-sm"
          >
            <div className={`neu-pressed-sm p-2 rounded-full shrink-0 ${snackbarSeverity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
               {snackbarSeverity === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <span className={`text-xs font-bold ${snackbarSeverity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
              {snackbarMessage}
            </span>
            <button type="button" onClick={() => setSnackbarOpen(false)} className="neu-flat-sm neu-action-btn rounded-lg p-1.5 text-[#656D76] ml-auto shrink-0">
              <X size={14} className="pointer-events-none" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban View */}
      {kanbanProject && (
        <ProjectKanban open={kanbanOpen} onClose={() => { setKanbanOpen(false); setKanbanProject(null); fetchAllData(true); }} project={kanbanProject} />
      )}

      {/* Spreadsheet View */}
      {spreadsheetOpen && spreadsheetProject && (
        <ProjectSpreadsheet 
          projectId={spreadsheetProject._id} 
          onClose={() => { setSpreadsheetOpen(false); setSpreadsheetProject(null); }} 
        />
      )}

      {/* Neumorphic CSS Rules & Bug Fixes */}
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
        
        /* Force Input Clickability and Text Selection globally */
        input, textarea, select {
          position: relative;
          z-index: 20;
          pointer-events: auto !important;
          user-select: text !important;
          -webkit-user-select: text !important;
        }
        
        select {
          cursor: pointer !important;
          -moz-appearance: none; 
          -webkit-appearance: none; 
          appearance: none;
        }

        /* Fixed Interactive Buttons to Ensure Clickability */
        .neu-action-btn { 
          cursor: pointer; 
          transition: all 0.2s ease; 
          position: relative;
          z-index: 20;
          user-select: none;
          -webkit-user-select: none;
        }
        .neu-action-btn:active:not(:disabled) {
          box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light) !important;
        }
        .neu-btn-primary {
          background-color: #0969DA;
          box-shadow: 3px 3px 8px rgba(9, 105, 218, 0.3);
          border: none;
          position: relative;
          z-index: 20;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }
        .neu-btn-primary:active:not(:disabled) {
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
        }

        /* Prevent SVG Icons from intercepting clicks */
        button svg {
          pointer-events: none !important;
        }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px var(--neu-bg) inset !important;
          -webkit-text-fill-color: #1F2328 !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 4px 0;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </div>
  );
}