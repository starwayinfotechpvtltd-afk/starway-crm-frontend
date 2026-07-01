import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users, UserPlus, Megaphone, UserCheck, BarChart2,
  Plus, Trash2, Edit, X, Mail, Phone, Briefcase,
  Check, ExternalLink, Clock, Clipboard, Search, AlertCircle,
  Eye, HelpCircle, ChevronDown, CheckCircle2, AlertTriangle, FileText,
  DollarSign, MapPin, ShieldAlert, Award, Calendar, Layers,
  Table, FileSpreadsheet, PlusCircle, Trash, Filter, Info, Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import DeveloperReports from "../Admin Pages/DeveloperReports";
import Teams from "../Admin Pages/CallerTeams";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
  
  :root {
    --neu-bg: #F0F4F8;
    --neu-light: #FFFFFF;
    --neu-dark: #D1DCEB;
    --accent: #0969DA;
    --text-primary: #1F2328;
    --text-muted: #656D76;
    --success: #1A7F37;
    --danger: #D1242F;
    --warning: #BF8700;
  }

  .hr-dashboard {
    font-family: 'Montserrat', sans-serif;
    background-color: var(--neu-bg);
    min-height: 100vh;
    color: var(--text-primary);
  }

  .neu-flat {
    background: var(--neu-bg);
    box-shadow: 6px 6px 12px var(--neu-dark), -6px -6px 12px var(--neu-light);
  }

  .neu-flat-sm {
    background: var(--neu-bg);
    box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light);
  }

  .neu-pressed {
    background: var(--neu-bg);
    box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
  }

  .neu-pressed-sm {
    background: var(--neu-bg);
    box-shadow: inset 1.5px 1.5px 3px var(--neu-dark), inset -1.5px -1.5px 3px var(--neu-light);
  }

  .neu-action-btn {
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    user-select: none;
    z-index: 10;
  }
  .neu-action-btn:active:not(:disabled) {
    box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light) !important;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--neu-dark);
    border-radius: 10px;
  }
`;

export default function HrDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [leads, setLeads] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, noticesRes, appsRes, leadsRes, desgRes] = await Promise.all([
        axios.get(`${API_BASE}/api/auth/users`, getHeaders()),
        axios.get(`${API_BASE}/api/notices/all`, getHeaders()),
        axios.get(`${API_BASE}/api/applications`, getHeaders()),
        axios.get(`${API_BASE}/api/leads/all`, getHeaders()),
        axios.get(`${API_BASE}/api/designations`, getHeaders())
      ]);
      setUsers(usersRes.data || []);
      setNotices(noticesRes.data || []);
      setApplications(appsRes.data || []);
      setLeads(leadsRes.data || []);
      setDesignations(desgRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to sync workspace details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="hr-dashboard min-h-screen flex flex-col md:flex-row w-full max-w-none">
      <style>{styles}</style>
      
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 p-6 flex flex-col justify-between border-r border-[#D1DCEB]/50 bg-[#F0F4F8] z-20">
        <div className="space-y-6">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl neu-flat flex items-center justify-center text-[#0969DA]">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-md font-bold text-slate-800 tracking-tight">Starway HR</h1>
              <p className="text-[10px] font-bold text-[#0969DA] uppercase tracking-wider">Enterprise Hub</p>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-4">
            {/* Section 1: Dashboard */}
            <div>
              <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-widest px-2 mb-2">Main Dashboard</p>
              <nav className="flex flex-col gap-2">
                {[
                  { id: "overview", label: "Overview", icon: BarChart2 },
                  { id: "reports", label: "Work Reports", icon: FileText }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all neu-action-btn ${
                        isActive ? "neu-pressed text-[#0969DA]" : "neu-flat-sm text-[#656D76] hover:text-slate-800"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Section 2: Employee Control */}
            <div>
              <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-widest px-2 mb-2">Employee Hub</p>
              <nav className="flex flex-col gap-2">
                {[
                  { id: "users", label: "User Control", icon: Users },
                  { id: "teams", label: "Teams Manager", icon: UserPlus },
                  { id: "notices", label: "Notices Board", icon: Megaphone }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all neu-action-btn ${
                        isActive ? "neu-pressed text-[#0969DA]" : "neu-flat-sm text-[#656D76] hover:text-slate-800"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Section 3: CRM & Pipeline */}
            <div>
              <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-widest px-2 mb-2">CRM & Pipeline</p>
              <nav className="flex flex-col gap-2">
                {[
                  { id: "leads", label: "Leads Tracking", icon: Clipboard },
                  { id: "ats", label: "ATS Pipeline", icon: UserCheck }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all neu-action-btn ${
                        isActive ? "neu-pressed text-[#0969DA]" : "neu-flat-sm text-[#656D76] hover:text-slate-800"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Section 4: Productivity */}
            <div>
              <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-widest px-2 mb-2">Data & Sheets</p>
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab("sheets")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all neu-action-btn ${
                    activeTab === "sheets" ? "neu-pressed text-[#0969DA]" : "neu-flat-sm text-[#656D76] hover:text-slate-800"
                  }`}
                >
                  <FileSpreadsheet size={14} />
                  <span>Custom Sheets</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#0969DA] text-white flex items-center justify-center text-xs font-bold shadow-md">
              HR
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 truncate">{localStorage.getItem("username") || "HR Manager"}</p>
              <p className="text-[9px] font-bold text-[#656D76] uppercase">HR Specialist</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl text-xs font-bold uppercase text-[#D1242F] neu-flat-sm neu-action-btn hover:bg-red-50/50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar max-h-screen w-full">
        {loading && activeTab !== "reports" && activeTab !== "ats" && activeTab !== "sheets" ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="neu-flat rounded-2xl p-8 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-[#D1DCEB] border-t-[#0969DA] rounded-full animate-spin mb-3"></div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-widest animate-pulse">Syncing HR Workspace...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {/* Header section */}
            <div className="flex justify-between items-center pb-4 border-b border-[#D1DCEB]/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800 uppercase">{activeTab === "ats" ? "ATS Candidate Pipeline" : activeTab === "sheets" ? "Excel Spreadsheet Manager" : activeTab}</h2>
                <p className="text-xs text-[#656D76]">Starway CRM Enterprise Management Control Room.</p>
              </div>
              <button
                onClick={fetchData}
                className="neu-flat-sm neu-action-btn px-4 py-2.5 rounded-xl text-xs font-bold text-[#0969DA]"
              >
                Sync Data
              </button>
            </div>

            {/* Tab view routes */}
            {activeTab === "overview" && <OverviewTab users={users} notices={notices} applications={applications} leads={leads} />}
            {activeTab === "users" && <UsersTab users={users} designations={designations} fetchUsers={fetchData} />}
            {activeTab === "teams" && <div className="neu-flat rounded-2xl p-2 w-full"><Teams /></div>}
            {activeTab === "notices" && <NoticesTab notices={notices} users={users} fetchNotices={fetchData} />}
            {activeTab === "ats" && <AtsTab applications={applications} designations={designations} fetchApplications={fetchData} />}
            {activeTab === "leads" && <LeadsTab users={users} />}
            {activeTab === "reports" && <div className="neu-flat rounded-2xl p-2 w-full"><DeveloperReports /></div>}
            {activeTab === "sheets" && <SheetsTab />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. OVERVIEW VIEW (WITH RECHARTS DIAGRAMS)
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ users, notices, applications, leads }) {
  const [reportsData, setReportsData] = useState({ completions: [], tasks: [] });

  useEffect(() => {
    const fetchReportsForChart = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/reports/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReportsData({
          completions: res.data.completions || [],
          tasks: res.data.tasks || []
        });
      } catch (err) {
        console.error("Failed to load reports overview chart data:", err);
      }
    };
    fetchReportsForChart();
  }, []);

  const activeCount = users.filter(u => u.employeeStatus !== "terminated").length;
  const totalSalary = users.reduce((acc, u) => acc + (parseFloat(u.salary) || 0), 0);
  const pendingApps = applications.filter(a => ["Applied", "Screening", "Interview", "Offered"].includes(a.status)).length;
  
  const stats = [
    { label: "Active Staff", val: activeCount, sub: `${users.filter(u => u.employeeStatus === "suspended").length} Suspended`, color: "#0969DA", icon: Users },
    { label: "Monthly Payroll", val: `₹${totalSalary.toLocaleString()}`, sub: "Est. Total Salary (INR)", color: "#1A7F37", icon: DollarSign },
    { label: "ATS Queue", val: pendingApps, sub: `${applications.filter(a => a.status === "Hired" || a.status === "Accepted").length} Onboarded`, color: "#BF8700", icon: UserCheck },
    { label: "Client Leads", val: leads.length, color: "#8B5CF6", icon: Clipboard }
  ];

  // 1. Leads Flow (Area Chart)
  const leadFlowData = React.useMemo(() => {
    const counts = {};
    leads.forEach(l => {
      if (l.createdAt) {
        const date = new Date(l.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        counts[date] = (counts[date] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([date, count]) => ({ date, "Registered Leads": count })).slice(-10);
  }, [leads]);

  // 2. Lead Distribution by Owner/Assignee (Bar Chart)
  const leadDistData = React.useMemo(() => {
    const distribution = {};
    leads.forEach(l => {
      const owner = l.leadOwner || "Unassigned";
      distribution[owner] = (distribution[owner] || 0) + 1;
    });
    return Object.entries(distribution).map(([owner, count]) => ({ name: owner, Leads: count })).slice(0, 8);
  }, [leads]);

  // 3. Developer Task Completions (Bar Chart)
  const devCompletionsData = React.useMemo(() => {
    const devCounts = {};
    reportsData.completions.forEach(c => {
      const devName = c.completedBy?.username || "Unknown";
      devCounts[devName] = (devCounts[devName] || 0) + 1;
    });
    return Object.entries(devCounts).map(([dev, count]) => ({ name: dev, Completed: count }));
  }, [reportsData]);

  return (
    <div className="space-y-8 w-full">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="neu-flat rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">{s.label}</p>
                <span className="text-xl font-bold text-slate-800">{s.val}</span>
                {s.sub && <p className="text-[9px] font-bold text-[#656D76] mt-1">{s.sub}</p>}
              </div>
              <div className="w-12 h-12 rounded-xl neu-pressed-sm flex items-center justify-center" style={{ color: s.color }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Leads Flow Area Chart */}
        <div className="neu-flat rounded-2xl p-6">
          <h3 className="text-xs font-bold text-[#656D76] uppercase tracking-wider mb-4 border-b border-[#D1DCEB]/50 pb-2">
            Lead Flow Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadFlowData}>
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1DCEB" />
                <XAxis dataKey="date" tick={{fontSize: 9, fontWeight: 700}} stroke="#656D76" />
                <YAxis tick={{fontSize: 9, fontWeight: 700}} stroke="#656D76" />
                <Tooltip contentStyle={{background: "#F0F4F8", border: "none", borderRadius: "10px", fontSize: "11px", fontWeight: "bold"}} />
                <Area type="monotone" dataKey="Registered Leads" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#leadGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Transfers / Owner Distribution */}
        <div className="neu-flat rounded-2xl p-6">
          <h3 className="text-xs font-bold text-[#656D76] uppercase tracking-wider mb-4 border-b border-[#D1DCEB]/50 pb-2">
            Lead Transfers & Ownership
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadDistData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1DCEB" />
                <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 700}} stroke="#656D76" />
                <YAxis tick={{fontSize: 9, fontWeight: 700}} stroke="#656D76" />
                <Tooltip contentStyle={{background: "#F0F4F8", border: "none", borderRadius: "10px", fontSize: "11px", fontWeight: "bold"}} />
                <Bar dataKey="Leads" fill="#0969DA" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task completions by Developers */}
        <div className="neu-flat rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-xs font-bold text-[#656D76] uppercase tracking-wider mb-4 border-b border-[#D1DCEB]/50 pb-2">
            Developer Completed Tasks Summary
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={devCompletionsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1DCEB" />
                <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 700}} stroke="#656D76" />
                <YAxis tick={{fontSize: 9, fontWeight: 700}} stroke="#656D76" />
                <Tooltip contentStyle={{background: "#F0F4F8", border: "none", borderRadius: "10px", fontSize: "11px", fontWeight: "bold"}} />
                <Bar dataKey="Completed" fill="#1A7F37" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. USER CONTROL & DESIGNATION MANAGER
// ─────────────────────────────────────────────────────────────────────────────
function UsersTab({ users, designations, fetchUsers }) {
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "developer", designation: "", phoneNumber: "", salary: "", address: "", emergencyContact: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  // Designations management states
  const [newDesgTitle, setNewDesgTitle] = useState("");

  // Global leave settings state
  const [globalLeaveVal, setGlobalLeaveVal] = useState("");
  const [globalLeaveRole, setGlobalLeaveRole] = useState("all");

  // Global timings settings state
  const [globalWorkHours, setGlobalWorkHours] = useState("");
  const [globalBreakTime, setGlobalBreakTime] = useState("");
  // Filtering and Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDesignation, setFilterDesignation] = useState("all");

  const filteredUsers = React.useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.designation || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchDesg = filterDesignation === "all" || u.designation === filterDesignation;

      return matchSearch && matchRole && matchDesg;
    });
  }, [users, searchTerm, filterRole, filterDesignation]);
  const [globalTimingRole, setGlobalTimingRole] = useState("developer");

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, newUser, getHeaders());
      if (res.data && res.data.user?._id) {
        await axios.put(`${API_BASE}/api/auth/users/${res.data.user._id}`, newUser, getHeaders());
      }
      showToast("Employee registered with designations details!");
      setCreateUserOpen(false);
      setNewUser({ username: "", email: "", password: "", role: "developer", designation: "", phoneNumber: "", salary: "", address: "", emergencyContact: "" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast("Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.put(`${API_BASE}/api/auth/users/${editingUser._id}`, editingUser, getHeaders());
      showToast("Employee details updated!");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast("Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGlobalLeaveUpdate = async (e) => {
    e.preventDefault();
    if (!globalLeaveVal) return;
    setSubmitting(true);
    try {
      await axios.put(`${API_BASE}/api/auth/users/global/leave-balance`, {
        leaveBalance: globalLeaveVal,
        targetRole: globalLeaveRole
      }, getHeaders());
      showToast("Global leave balances updated!");
      setGlobalLeaveVal("");
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast("Failed to update global leaves.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGlobalTimingUpdate = async (e) => {
    e.preventDefault();
    if (!globalWorkHours || !globalBreakTime) return;
    setSubmitting(true);
    try {
      await axios.put(`${API_BASE}/api/auth/admin/role-timings`, {
        role: globalTimingRole,
        requiredWorkHours: parseFloat(globalWorkHours),
        allottedBreakTime: parseFloat(globalBreakTime)
      }, getHeaders());
      showToast(`Global timings updated for ${globalTimingRole}!`);
      setGlobalWorkHours("");
      setGlobalBreakTime("");
    } catch (err) {
      console.error(err);
      showToast("Failed to update role timings.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDesignation = async (e) => {
    e.preventDefault();
    if (!newDesgTitle.trim()) return;
    try {
      await axios.post(`${API_BASE}/api/designations`, { title: newDesgTitle }, getHeaders());
      showToast("Global designation added!");
      setNewDesgTitle("");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add designation.");
    }
  };

  const handleDeleteDesignation = async (id) => {
    if (!window.confirm("Remove this global designation?")) return;
    try {
      await axios.delete(`${API_BASE}/api/designations/${id}`, getHeaders());
      showToast("Designation removed.");
      fetchUsers();
    } catch (err) {
      showToast("Failed to remove designation.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent action: Delete this user account?")) return;
    try {
      await axios.delete(`${API_BASE}/api/auth/users/${id}`, getHeaders());
      showToast("User deleted.");
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast("Deletion failed.");
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Toast popup */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-[9999] bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#1A7F37]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Settings Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Global Leaves Card */}
        <div className="neu-flat rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50 pb-2 flex items-center gap-2">
            <Layers size={14} /> Global Leave Balances
          </h3>
          <form onSubmit={handleGlobalLeaveUpdate} className="flex flex-col gap-4">
            <div className="flex-1 w-full relative z-20">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Allot Leaves</label>
              <input
                required type="number" value={globalLeaveVal}
                onChange={e => setGlobalLeaveVal(e.target.value)}
                placeholder="e.g. 15 leaves"
                className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-bold"
              />
            </div>
            <div className="flex-1 w-full relative z-20">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Target Group</label>
              <select
                value={globalLeaveRole}
                onChange={e => setGlobalLeaveRole(e.target.value)}
                className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
              >
                <option value="all">Everyone</option>
                <option value="developer">Developer</option>
                <option value="caller">Caller</option>
                <option value="manager">Team Manager</option>
                <option value="hr">HR Specialist</option>
              </select>
            </div>
            <button
              type="submit" disabled={submitting}
              className="neu-btn-primary bg-[#0969DA] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider neu-action-btn shadow-md w-full"
            >
              Apply Global Leaves
            </button>
          </form>
        </div>

        {/* Global Timings Card */}
        <div className="neu-flat rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50 pb-2 flex items-center gap-2">
            <Clock size={14} /> Global Role Timings
          </h3>
          <form onSubmit={handleGlobalTimingUpdate} className="flex flex-col gap-4">
            <div className="relative z-20">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Role Target</label>
              <select
                value={globalTimingRole}
                onChange={e => setGlobalTimingRole(e.target.value)}
                className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
              >
                <option value="developer">Developer</option>
                <option value="caller">Lead Caller</option>
                <option value="manager">Team Manager</option>
                <option value="hr">HR Specialist</option>
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 relative z-20">
                <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Work Hours</label>
                <input
                  required type="number" step="0.5" value={globalWorkHours}
                  onChange={e => setGlobalWorkHours(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-bold"
                />
              </div>
              <div className="flex-1 relative z-20">
                <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Break Mins</label>
                <input
                  required type="number" value={globalBreakTime}
                  onChange={e => setGlobalBreakTime(e.target.value)}
                  placeholder="e.g. 60"
                  className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-bold"
                />
              </div>
            </div>
            <button
              type="submit" disabled={submitting}
              className="neu-btn-primary bg-[#0969DA] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider neu-action-btn shadow-md w-full"
            >
              Apply Timing Settings
            </button>
          </form>
        </div>

        {/* Global Designations Card */}
        <div className="neu-flat rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50 pb-2 flex items-center gap-2">
            <Award size={14} /> Global Designations
          </h3>
          
          <form onSubmit={handleAddDesignation} className="flex gap-2">
            <input
              type="text" value={newDesgTitle}
              onChange={e => setNewDesgTitle(e.target.value)}
              placeholder="e.g. Tech Lead"
              className="flex-1 neu-pressed rounded-xl p-2.5 text-xs outline-none font-bold"
            />
            <button type="submit" className="px-3.5 bg-[#0969DA] text-white rounded-xl neu-action-btn flex items-center justify-center">
              <Plus size={16} />
            </button>
          </form>

          <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {designations.map(d => (
              <div key={d._id} className="neu-flat-sm rounded-lg p-2 flex justify-between items-center text-xs font-bold text-slate-800">
                <span>{d.title}</span>
                <button type="button" onClick={() => handleDeleteDesignation(d._id)} className="text-[#D1242F] p-1"><Trash2 size={12} /></button>
              </div>
            ))}
            {designations.length === 0 && <p className="text-[10px] font-bold text-[#656D76] italic text-center py-4">No designations created</p>}
          </div>
        </div>
      </div>

      {/* Active Employees List */}
      <div className="space-y-4 w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Employee Staff List</h3>
          <button
            onClick={() => setCreateUserOpen(true)}
            className="neu-btn-primary bg-[#0969DA] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg neu-action-btn"
          >
            <Plus size={14} /> Add New User
          </button>
        </div>

        {/* Filters Header block */}
        <div className="neu-flat rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative w-full z-20">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full neu-pressed rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#1F2328] outline-none"
            />
          </div>

          <div className="relative z-20">
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="w-full neu-pressed rounded-xl p-2.5 text-xs outline-none bg-transparent font-bold cursor-pointer"
            >
              <option value="all">All Security Roles</option>
              <option value="admin">System Admin</option>
              <option value="hr">HR Specialist</option>
              <option value="manager">Team Manager</option>
              <option value="developer">Developer</option>
              <option value="caller">Lead Caller</option>
            </select>
          </div>

          <div className="relative z-20">
            <select
              value={filterDesignation}
              onChange={e => setFilterDesignation(e.target.value)}
              className="w-full neu-pressed rounded-xl p-2.5 text-xs outline-none bg-transparent font-bold cursor-pointer"
            >
              <option value="all">All Designations</option>
              {designations.map(d => <option key={d._id} value={d.title}>{d.title}</option>)}
            </select>
          </div>
        </div>

        {/* Grid listing users */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {filteredUsers.map(u => (
            <div key={u._id} className="neu-flat rounded-2xl p-5 flex flex-col justify-between gap-4 border-t-4" style={{ borderTopColor: u.employeeStatus === "suspended" ? "#BF8700" : u.employeeStatus === "terminated" ? "#D1242F" : "#0969DA" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={u.avatar || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{u.username}</h4>
                    <p className="text-[9px] font-bold text-[#656D76] uppercase mt-0.5 truncate max-w-[140px]">{u.designation || "No Designation"}</p>
                    <p className="text-[9px] font-medium text-[#656D76] truncate max-w-[140px]">{u.email}</p>
                  </div>
                </div>
                <span className="neu-pressed-sm px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-[#0969DA]">
                  {u.role}
                </span>
              </div>

              {/* Extra details summary */}
              <div className="text-[10px] space-y-1.5 font-medium text-[#656D76] border-t border-[#D1DCEB]/50 pt-3 flex flex-col">
                <p className="flex items-center gap-2"><Phone size={10} /> {u.phoneNumber || "—"}</p>
                <p className="flex items-center gap-2"><DollarSign size={10} /> {u.salary ? `₹${u.salary.toLocaleString()}` : "—"}</p>
                <p className="flex items-center gap-2"><Award size={10} /> Status: <span className="uppercase font-bold text-xs" style={{ color: u.employeeStatus === "suspended" ? "#BF8700" : u.employeeStatus === "terminated" ? "#D1242F" : "#1A7F37" }}>{u.employeeStatus || "Active"}</span></p>
              </div>

              <div className="flex justify-between items-center border-t border-[#D1DCEB]/50 pt-3">
                <span className="text-[9px] font-bold text-[#656D76] uppercase">
                  Leaves: {u.leaveBalance || 0}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="neu-flat-sm p-2 rounded-lg text-[#0969DA] neu-action-btn"
                    title="Edit User Details"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="neu-flat-sm p-2 rounded-lg text-[#D1242F] border border-[#D1242F]/20 neu-action-btn"
                    title="Delete User"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register User Modal */}
      <AnimatePresence>
        {createUserOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateUserOpen(false)} className="fixed inset-0 z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="neu-flat rounded-2xl w-full max-w-lg p-6 relative z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center border-b border-[#D1DCEB]/50 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Register User Account</h3>
                <button onClick={() => setCreateUserOpen(false)} className="neu-flat-sm p-1.5 rounded-full text-[#656D76] hover:text-[#D1242F] neu-action-btn"><X size={14} /></button>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Username *", name: "username", type: "text" },
                    { label: "Email Address *", name: "email", type: "email" },
                    { label: "Initial Password *", name: "password", type: "password" },
                    { label: "Phone Number", name: "phoneNumber", type: "text" },
                    { label: "Monthly Salary", name: "salary", type: "number" },
                    { label: "Home Address", name: "address", type: "text" },
                    { label: "Emergency Contact", name: "emergencyContact", type: "text" }
                  ].map(f => (
                    <div key={f.name} className={f.name === "address" ? "col-span-2" : ""}>
                      <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                      <input
                        required={f.label.includes("*")} type={f.type} value={newUser[f.name]}
                        onChange={e => setNewUser(p => ({ ...p, [f.name]: e.target.value }))}
                        className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Designation</label>
                    <select
                      value={newUser.designation}
                      onChange={e => setNewUser(p => ({ ...p, designation: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
                    >
                      <option value="">Select global designation...</option>
                      {designations.map(d => <option key={d._id} value={d.title}>{d.title}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Security Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                    className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
                  >
                    <option value="developer">Developer</option>
                    <option value="caller">Lead Caller</option>
                    <option value="manager">Team Manager</option>
                    <option value="hr">HR Specialist</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full neu-btn-primary bg-[#0969DA] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider neu-action-btn mt-4 shadow-md"
                >
                  {submitting ? "Processing…" : "Submit Registration"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingUser(null)} className="fixed inset-0 z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="neu-flat rounded-2xl w-full max-w-lg p-6 relative z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center border-b border-[#D1DCEB]/50 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Edit User Details</h3>
                <button onClick={() => setEditingUser(null)} className="neu-flat-sm p-1.5 rounded-full text-[#656D76] hover:text-[#D1242F] neu-action-btn"><X size={14} /></button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Username</label>
                    <input
                      required type="text" value={editingUser.username || ""}
                      onChange={e => setEditingUser(p => ({ ...p, username: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Email Address</label>
                    <input
                      required type="email" value={editingUser.email || ""}
                      onChange={e => setEditingUser(p => ({ ...p, email: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Designation</label>
                    <select
                      value={editingUser.designation || ""}
                      onChange={e => setEditingUser(p => ({ ...p, designation: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
                    >
                      <option value="">Select global designation...</option>
                      {designations.map(d => <option key={d._id} value={d.title}>{d.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Phone Number</label>
                    <input
                      type="text" value={editingUser.phoneNumber || ""}
                      onChange={e => setEditingUser(p => ({ ...p, phoneNumber: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Monthly Salary</label>
                    <input
                      type="number" value={editingUser.salary || ""}
                      onChange={e => setEditingUser(p => ({ ...p, salary: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Home Address</label>
                    <input
                      type="text" value={editingUser.address || ""}
                      onChange={e => setEditingUser(p => ({ ...p, address: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Emergency Contact</label>
                    <input
                      type="text" value={editingUser.emergencyContact || ""}
                      onChange={e => setEditingUser(p => ({ ...p, emergencyContact: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Employee Status</label>
                    <select
                      value={editingUser.employeeStatus || "active"}
                      onChange={e => setEditingUser(p => ({ ...p, employeeStatus: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Reset Password (Optional)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current..."
                      value={editingUser.password || ""}
                      onChange={e => setEditingUser(p => ({ ...p, password: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Security Role</label>
                  <select
                    value={editingUser.role || "developer"}
                    onChange={e => setEditingUser(p => ({ ...p, role: e.target.value }))}
                    className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
                  >
                    <option value="developer">Developer</option>
                    <option value="caller">Lead Caller</option>
                    <option value="manager">Team Manager</option>
                    <option value="hr">HR Specialist</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full neu-btn-primary bg-[#0969DA] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider neu-action-btn mt-4 shadow-md"
                >
                  {submitting ? "Saving…" : "Save Updates"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ANNOUNCEMENTS / NOTICES VIEW
// ─────────────────────────────────────────────────────────────────────────────
function NoticesTab({ notices, users, fetchNotices }) {
  const [newNotice, setNewNotice] = useState({ title: "", content: "", targetType: "all", targetValue: "", priority: "Info" });
  const [publishing, setPublishing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setPublishing(true);
    try {
      await axios.post(`${API_BASE}/api/notices`, newNotice, getHeaders());
      showToast("Notice published to notifications!");
      setNewNotice({ title: "", content: "", targetType: "all", targetValue: "", priority: "Info" });
      fetchNotices();
    } catch (err) {
      console.error(err);
      showToast("Notice publishing failed.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete notice and pull notifications?")) return;
    try {
      await axios.delete(`${API_BASE}/api/notices/${id}`, getHeaders());
      showToast("Notice removed.");
      fetchNotices();
    } catch (err) {
      console.error(err);
      showToast("Deletion failed.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      {/* Toast notifications */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-[9999] bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#1A7F37]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notice Board Form */}
      <div className="lg:col-span-1 neu-flat rounded-2xl p-6 h-fit space-y-5">
        <h3 className="text-xs font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50 pb-2">Publish announcement</h3>
        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Notice Title</label>
            <input
              required type="text" value={newNotice.title}
              onChange={e => setNewNotice(p => ({ ...p, title: e.target.value }))}
              placeholder="System update, Meeting, etc."
              className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Announcement Message</label>
            <textarea
              required rows={4} value={newNotice.content}
              onChange={e => setNewNotice(p => ({ ...p, content: e.target.value }))}
              placeholder="Write the notice details here..."
              className="w-full neu-pressed rounded-xl p-3 text-xs outline-none resize-none font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Priority</label>
              <select
                value={newNotice.priority}
                onChange={e => setNewNotice(p => ({ ...p, priority: e.target.value }))}
                className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
              >
                <option value="Info">Info</option>
                <option value="Critical">Critical</option>
                <option value="Holiday">Holiday</option>
                <option value="Event">Event</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Audience Target</label>
              <select
                value={newNotice.targetType}
                onChange={e => setNewNotice(p => ({ ...p, targetType: e.target.value, targetValue: "" }))}
                className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
              >
                <option value="all">Everyone</option>
                <option value="role">Specific Role Group</option>
                <option value="user">Specific Single User</option>
              </select>
            </div>
          </div>

          {newNotice.targetType === "role" && (
            <div>
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Select Role</label>
              <select
                required value={newNotice.targetValue}
                onChange={e => setNewNotice(p => ({ ...p, targetValue: e.target.value }))}
                className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
              >
                <option value="">Select target role...</option>
                <option value="developer">Developer</option>
                <option value="caller">Lead Caller</option>
                <option value="manager">Team Manager</option>
                <option value="hr">HR Specialist</option>
              </select>
            </div>
          )}

          {newNotice.targetType === "user" && (
            <div>
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Select targeted user</label>
              <select
                required value={newNotice.targetValue}
                onChange={e => setNewNotice(p => ({ ...p, targetValue: e.target.value }))}
                className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
              >
                <option value="">Select targeted user...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.role})</option>)}
              </select>
            </div>
          )}

          <button
            type="submit" disabled={publishing}
            className="w-full neu-btn-primary bg-[#0969DA] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider neu-action-btn mt-4 shadow-md"
          >
            {publishing ? "Publishing…" : "Publish Notice"}
          </button>
        </form>
      </div>

      {/* Notices List */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Active Notices</h3>
        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {notices.map(notice => (
            <div key={notice._id} className="neu-flat rounded-2xl p-5 flex flex-col gap-3 relative border-l-4" style={{ borderLeftColor: notice.priority === "Critical" ? "#D1242F" : notice.priority === "Holiday" ? "#BF8700" : notice.priority === "Event" ? "#8B5CF6" : "#0969DA" }}>
              <button
                onClick={() => handleDelete(notice._id)}
                className="absolute top-4 right-4 p-2 rounded-lg text-[#D1242F] hover:bg-red-50/50 neu-flat-sm neu-action-btn border border-red-200/10"
                title="Delete Notice"
              >
                <Trash2 size={12} />
              </button>
              <div className="flex items-center gap-3">
                <span className="neu-pressed-sm px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-[#0969DA]">
                  Target: {notice.targetType === "all" ? "Everyone" : notice.targetValue}
                </span>
                <span className="text-[10px] text-[#656D76] font-medium">
                  {new Date(notice.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 leading-snug flex items-center gap-2">
                <span>{notice.title}</span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: notice.priority === "Critical" ? "#D1242F/10" : "#0969DA/10", color: notice.priority === "Critical" ? "#D1242F" : "#0969DA" }}>
                  {notice.priority || "Info"}
                </span>
              </h4>
              <p className="text-xs font-medium text-[#656D76] whitespace-pre-wrap leading-relaxed">{notice.content}</p>
            </div>
          ))}
          {notices.length === 0 && <p className="text-xs font-bold text-[#656D76] italic text-center py-12 neu-flat rounded-2xl">No notice history.</p>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ATS / CANDIDATE PIPELINE VIEW (ATS Tab WITH DRAG AND DROP & SCHEDULER)
// ─────────────────────────────────────────────────────────────────────────────
function AtsTab({ applications, designations, fetchApplications }) {
  const [createAppOpen, setCreateAppOpen] = useState(false);
  const [newApp, setNewApp] = useState({ candidateName: "", email: "", phoneNumber: "", position: "", resumeUrl: "", notes: "" });
  const [editingApp, setEditingApp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const boardRef = React.useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  // Filters & search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const handleMouseDown = (e) => {
    if (e.target.closest("[draggable]")) return; // Don't scroll when dragging a candidate card
    setIsDown(true);
    setStartX(e.pageX - boardRef.current.offsetLeft);
    setScrollLeftState(boardRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - boardRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    boardRef.current.scrollLeft = scrollLeftState - walk;
  };

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/applications`, newApp, getHeaders());
      showToast("Application created!");
      setCreateAppOpen(false);
      setNewApp({ candidateName: "", email: "", phoneNumber: "", position: "", resumeUrl: "", notes: "" });
      fetchApplications();
    } catch (err) {
      console.error(err);
      showToast("Creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Update candidate application
      await axios.put(`${API_BASE}/api/applications/${editingApp._id}`, editingApp, getHeaders());
      
      // 2. If interview date was scheduled, trigger a global reminder automatically for the HR creator
      if (editingApp.status === "Interview" && editingApp.interviewDate) {
        await axios.post(`${API_BASE}/api/reminders`, {
          title: `Interview with ${editingApp.candidateName} for ${editingApp.position}`,
          remindAt: editingApp.interviewDate
        }, getHeaders());
        showToast("Application updated & HR reminder scheduled!");
      } else {
        showToast("Application details saved!");
      }

      setEditingApp(null);
      fetchApplications();
    } catch (err) {
      console.error(err);
      showToast("Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent: Remove candidate application?")) return;
    try {
      await axios.delete(`${API_BASE}/api/applications/${id}`, getHeaders());
      showToast("Application deleted.");
      fetchApplications();
    } catch (err) {
      console.error(err);
      showToast("Deletion failed.");
    }
  };

  // Drag and drop event handlers
  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData("text/plain", appId);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("text/plain");
    if (!appId) return;

    try {
      // Update status via PUT
      await axios.put(`${API_BASE}/api/applications/${appId}`, { status: targetStatus }, getHeaders());
      showToast(`Candidate moved to ${targetStatus}`);
      fetchApplications();
    } catch (err) {
      console.error(err);
      showToast("Failed to move candidate.");
    }
  };

  // Columns & pipeline structure
  const columns = ["Applied", "Screening", "Interview", "Offered", "Hired", "Rejected", "Future"];

  // Unique positions and months for filtering
  const positionsList = React.useMemo(() => {
    const set = new Set();
    applications.forEach(a => { if (a.position) set.add(a.position); });
    return Array.from(set);
  }, [applications]);

  const monthsList = React.useMemo(() => {
    const set = new Set();
    applications.forEach(a => {
      if (a.createdAt) {
        const monthYear = new Date(a.createdAt).toLocaleString(undefined, { month: "long", year: "numeric" });
        set.add(monthYear);
      }
    });
    return Array.from(set);
  }, [applications]);

  // Apply filters
  const filteredApps = React.useMemo(() => {
    return applications.filter(a => {
      const matchSearch =
        (a.candidateName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = filterRole === "all" || a.position === filterRole;

      const candMonth = a.createdAt ? new Date(a.createdAt).toLocaleString(undefined, { month: "long", year: "numeric" }) : "";
      const matchMonth = filterMonth === "all" || candMonth === filterMonth;

      return matchSearch && matchRole && matchMonth;
    });
  }, [applications, searchTerm, filterRole, filterMonth]);

  return (
    <div className="space-y-6 w-full">
      {/* Toast notifications */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-[9999] bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#1A7F37]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and search block */}
      <div className="neu-flat rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative w-full z-20">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search candidate name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full neu-pressed rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#1F2328] outline-none"
          />
        </div>

        <div className="relative z-20">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="w-full neu-pressed rounded-xl p-2.5 text-xs outline-none bg-transparent font-bold cursor-pointer"
          >
            <option value="all">All Applied Positions</option>
            {positionsList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="relative z-20">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="w-full neu-pressed rounded-xl p-2.5 text-xs outline-none bg-transparent font-bold cursor-pointer"
          >
            <option value="all">All Applied Dates</option>
            {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <button
          onClick={() => setCreateAppOpen(true)}
          className="neu-btn-primary bg-[#0969DA] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg neu-action-btn"
        >
          <Plus size={14} /> Add Applicant
        </button>
      </div>

      {/* Drag & Drop Columns Board */}
      <div
        ref={boardRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex gap-6 overflow-x-auto custom-scrollbar pb-6 min-h-[500px] w-full select-none"
        style={{ cursor: isDown ? "grabbing" : "grab" }}
      >
        {columns.map(col => {
          const colApps = filteredApps.filter(a => a.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col)}
              className="w-80 shrink-0 flex flex-col gap-4 rounded-2xl p-2.5 bg-[#F0F4F8]/50 border border-[#D1DCEB]/20"
            >
              {/* Column Header */}
              <div className="neu-flat rounded-xl p-4 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">{col}</span>
                <span className="text-[10px] font-bold text-[#0969DA] neu-pressed-sm px-2.5 py-1 rounded-md">{colApps.length}</span>
              </div>

              {/* Column List */}
              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar max-h-[500px] pr-1 min-h-[400px]">
                {colApps.map(app => (
                  <div
                    key={app._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app._id)}
                    className="neu-flat-sm rounded-2xl p-4 space-y-3 border-l-4 cursor-grab active:cursor-grabbing bg-white transition-all hover:scale-[1.01]"
                    style={{ borderLeftColor: col === "Hired" || col === "Accepted" ? "#1A7F37" : col === "Rejected" ? "#D1242F" : col === "Interview" ? "#8B5CF6" : "#0969DA" }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{app.candidateName}</h4>
                        <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mt-0.5">{app.position}</p>
                      </div>
                      <button onClick={() => setEditingApp(app)} className="p-1 rounded text-[#0969DA] hover:bg-[#D1DCEB]/30 shrink-0"><Edit size={12} /></button>
                    </div>

                    <div className="text-[10px] text-[#656D76] space-y-1 font-medium border-t border-[#D1DCEB]/50 pt-2 flex flex-col gap-0.5">
                      <p className="flex items-center gap-1.5"><Mail size={10} className="shrink-0" /> {app.email}</p>
                      <p className="flex items-center gap-1.5"><Phone size={10} className="shrink-0" /> {app.phoneNumber}</p>
                      
                      {app.interviewDate && (
                        <p className="flex items-center gap-1 text-[#8B5CF6] font-bold mt-1">
                          <Clock size={10} /> Interview: {new Date(app.interviewDate).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}

                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-[#0969DA] font-bold flex items-center gap-1 hover:underline mt-1">
                          <ExternalLink size={10} /> View Resume
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {colApps.length === 0 && (
                  <div className="text-center py-12 text-[10px] font-bold text-[#656D76] italic border border-dashed border-[#D1DCEB] rounded-2xl">
                    Drag candidates here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Applicant Modal */}
      <AnimatePresence>
        {createAppOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateAppOpen(false)} className="fixed inset-0 z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="neu-flat rounded-2xl w-full max-w-md p-6 relative z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center border-b border-[#D1DCEB]/50 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create Candidate Record</h3>
                <button onClick={() => setCreateAppOpen(false)} className="neu-flat-sm p-1.5 rounded-full text-[#656D76] hover:text-[#D1242F] neu-action-btn"><X size={14} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                {[
                  { label: "Candidate Name", name: "candidateName", type: "text" },
                  { label: "Email Address", name: "email", type: "email" },
                  { label: "Phone Number", name: "phoneNumber", type: "text" },
                  { label: "Resume Drive URL", name: "resumeUrl", type: "text" }
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                    <input
                      required={f.name !== "resumeUrl"} type={f.type} value={newApp[f.name]}
                      onChange={e => setNewApp(p => ({ ...p, [f.name]: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Applied Position</label>
                  <select
                    required value={newApp.position}
                    onChange={e => setNewApp(p => ({ ...p, position: e.target.value }))}
                    className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
                  >
                    <option value="">Select applied designation...</option>
                    {designations.map(d => <option key={d._id} value={d.title}>{d.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Additional Notes</label>
                  <textarea
                    rows={2} value={newApp.notes}
                    onChange={e => setNewApp(p => ({ ...p, notes: e.target.value }))}
                    className="w-full neu-pressed rounded-xl p-3 text-xs outline-none resize-none font-medium"
                  />
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full neu-btn-primary bg-[#0969DA] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider neu-action-btn mt-4 shadow-md"
                >
                  {submitting ? "Submitting…" : "Record Application"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Applicant Modal (With Interview scheduler & Extended Statuses) */}
      <AnimatePresence>
        {editingApp && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#F0F4F8]/85 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingApp(null)} className="fixed inset-0 z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="neu-flat rounded-2xl w-full max-w-md p-6 relative z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center border-b border-[#D1DCEB]/50 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Candidate Details & Scheduling</h3>
                <button onClick={() => setEditingApp(null)} className="neu-flat-sm p-1.5 rounded-full text-[#656D76] hover:text-[#D1242F] neu-action-btn"><X size={14} /></button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Pipeline Stage</label>
                    <select
                      value={editingApp.status}
                      onChange={e => setEditingApp(p => ({ ...p, status: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
                    >
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Schedule Interview</label>
                    <input
                      type="datetime-local"
                      value={editingApp.interviewDate ? new Date(editingApp.interviewDate).toISOString().slice(0, 16) : ""}
                      onChange={e => setEditingApp(p => ({ ...p, interviewDate: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                </div>
                {[
                  { label: "Candidate Name", name: "candidateName", type: "text" },
                  { label: "Email Address", name: "email", type: "email" },
                  { label: "Phone Number", name: "phoneNumber", type: "text" },
                  { label: "Resume Drive URL", name: "resumeUrl", type: "text" }
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                    <input
                      required={f.name !== "resumeUrl"} type={f.type} value={editingApp[f.name]}
                      onChange={e => setEditingApp(p => ({ ...p, [f.name]: e.target.value }))}
                      className="w-full neu-pressed rounded-xl p-3 text-xs outline-none font-medium"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Applied Position</label>
                  <select
                    value={editingApp.position || ""}
                    onChange={e => setEditingApp(p => ({ ...p, position: e.target.value }))}
                    className="w-full neu-pressed rounded-xl p-3 text-xs outline-none bg-transparent font-bold cursor-pointer"
                  >
                    <option value="">Select global designation...</option>
                    {designations.map(d => <option key={d._id} value={d.title}>{d.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Additional Notes</label>
                  <textarea
                    rows={2} value={editingApp.notes || ""}
                    onChange={e => setEditingApp(p => ({ ...p, notes: e.target.value }))}
                    className="w-full neu-pressed rounded-xl p-3 text-xs outline-none resize-none font-medium"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button" onClick={() => handleDelete(editingApp._id)}
                    className="flex-1 border border-red-300 text-red-600 py-3 rounded-xl text-xs font-bold uppercase tracking-wider neu-flat-sm neu-action-btn"
                  >
                    Remove Candidate
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="flex-1 neu-btn-primary bg-[#0969DA] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider neu-action-btn shadow-md"
                  >
                    {submitting ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. LEADS VIEW (WITH MULTI-ENDPOINT TABS & CREATOR FILTERS)
// ─────────────────────────────────────────────────────────────────────────────
function LeadsTab({ users }) {
  const [activeSubTab, setActiveSubTab] = useState("new"); // "new", "assigned", "closed"
  const [leadsList, setLeadsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOwner, setFilterOwner] = useState("all");

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const fetchLeads = async (subTab) => {
    setLoading(true);
    try {
      let endpoint = `${API_BASE}/api/leads/new`;
      if (subTab === "assigned") {
        endpoint = `${API_BASE}/api/leads/all-assigned`;
      } else if (subTab === "closed") {
        endpoint = `${API_BASE}/api/leads/closed`;
      }
      const res = await axios.get(endpoint, getHeaders());
      setLeadsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching leads list:", err);
      setLeadsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(activeSubTab);
  }, [activeSubTab]);

  // Unique creators list (Callers & Admins)
  const creatorsList = React.useMemo(() => {
    const set = new Set();
    leadsList.forEach(l => { if (l.leadOwner) set.add(l.leadOwner); });
    return Array.from(set);
  }, [leadsList]);

  const filtered = leadsList.filter(l => {
    const matchSearch =
      (l.leadName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (l.leadOwner || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchOwner = filterOwner === "all" || l.leadOwner === filterOwner;

    return matchSearch && matchOwner;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Sub-tab Navigation */}
      <div className="flex gap-4 p-2.5 neu-pressed rounded-2xl w-fit">
        {[
          { id: "new", label: "New Leads" },
          { id: "assigned", label: "Assigned Leads" },
          { id: "closed", label: "Closed Leads" }
        ].map(st => {
          const isActive = activeSubTab === st.id;
          return (
            <button
              key={st.id}
              onClick={() => {
                setActiveSubTab(st.id);
                setFilterOwner("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all neu-action-btn ${
                isActive ? "neu-flat text-[#0969DA] font-extrabold" : "text-[#656D76] hover:text-slate-800"
              }`}
            >
              {st.label}
            </button>
          );
        })}
      </div>

      {/* Search Header */}
      <div className="neu-flat rounded-2xl p-5 flex flex-col md:flex-row gap-4 justify-between items-center w-full">
        <div className="relative w-full md:w-1/3 z-20">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search leads by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full neu-pressed rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#1F2328] outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto relative z-20">
          <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider shrink-0">Filter by Caller/Admin:</label>
          <select
            value={filterOwner}
            onChange={e => setFilterOwner(e.target.value)}
            className="neu-pressed rounded-xl py-2 px-3 text-xs font-bold text-[#1F2328] outline-none bg-transparent cursor-pointer"
          >
            <option value="all">All Creators</option>
            {creatorsList.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="neu-flat rounded-2xl p-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0969DA]"></div>
        </div>
      ) : (
        <div className="neu-flat rounded-2xl p-4 overflow-x-auto custom-scrollbar w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#D1DCEB]/50">
                {["Lead Name", "Masked Email", "Masked Phone", "Owner / Assignee", "Pitched Amount", "Status"].map(h => (
                  <th key={h} className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l._id} className="hover:bg-[#D1DCEB]/10 transition-colors">
                  <td className="p-3 text-xs font-bold text-slate-800">{l.leadName}</td>
                  <td className="p-3 text-xs font-medium text-[#656D76]">
                    <span className="flex items-center gap-1.5"><Mail size={10} /> {l.email || "—"}</span>
                  </td>
                  <td className="p-3 text-xs font-medium text-[#656D76]">
                    <span className="flex items-center gap-1.5"><Phone size={10} /> {l.phoneNumber || "—"}</span>
                  </td>
                  <td className="p-3 text-xs font-bold text-[#0969DA]">
                    {activeSubTab === "assigned" ? (
                      <span className="flex items-center gap-1">
                        Owner: {l.leadOwner || "—"} → Assigned to: {l.assignedTo?.username || "—"}
                      </span>
                    ) : (
                      l.leadOwner || "—"
                    )}
                  </td>
                  <td className="p-3 text-xs font-bold text-slate-800">{l.pitchedAmount ? `${l.currencySymbol || "$"}${l.pitchedAmount}` : "—"}</td>
                  <td className="p-3">
                    <span className="neu-pressed-sm px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ color: l.status === "closed" ? "#1A7F37" : l.status === "dropped" ? "#D1242F" : "#BF8700" }}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-bold text-[#656D76] italic">No leads found in this view.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. EXCEL SPREADSHEET BUILDER (SheetsTab Component)
// ─────────────────────────────────────────────────────────────────────────────
function SheetsTab() {
  const [sheetsList, setSheetsList] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(null);
  const [sheetNameInput, setSheetNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, colName }
  const [selectedCell, setSelectedCell] = useState(null); // { rowIndex, colName }
  const [formulaValue, setFormulaValue] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "editor"

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchSheets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/sheets`, getHeaders());
      setSheetsList(res.data || []);
      if (res.data?.length > 0 && currentSheet) {
        const refreshed = res.data.find(s => s._id === currentSheet._id);
        if (refreshed) setCurrentSheet(refreshed);
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading spreadsheets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const handleCreateSheet = async (e) => {
    e.preventDefault();
    if (!sheetNameInput.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/api/sheets`, {
        name: sheetNameInput.trim(),
        columns: ["Employee Name", "Department", "Base Salary", "Allotted Bonus"],
        rows: [
          { "Employee Name": "John Doe", "Department": "Engineering", "Base Salary": "85000", "Allotted Bonus": "15000" },
          { "Employee Name": "Alice Smith", "Department": "Marketing", "Base Salary": "60000", "Allotted Bonus": "8000" }
        ]
      }, getHeaders());
      showToast("Sheet created successfully!");
      setSheetNameInput("");
      setCurrentSheet(res.data);
      setViewMode("editor");
      fetchSheets();
    } catch (err) {
      showToast("Failed to create sheet.");
    }
  };

  const handleSyncSheet = async (updatedSheet) => {
    try {
      const res = await axios.put(`${API_BASE}/api/sheets/${updatedSheet._id}`, updatedSheet, getHeaders());
      setCurrentSheet(res.data);
      setSheetsList(prev => prev.map(s => s._id === res.data._id ? res.data : s));
    } catch (err) {
      console.error(err);
      showToast("Auto-save failed.");
    }
  };

  const handleAddColumn = () => {
    if (!currentSheet) return;
    const colName = window.prompt("Enter new column header name:");
    if (!colName) return;
    if (currentSheet.columns.includes(colName)) return showToast("Column already exists.");

    const updated = {
      ...currentSheet,
      columns: [...currentSheet.columns, colName]
    };
    handleSyncSheet(updated);
  };

  const handleDeleteColumn = (colName) => {
    if (!currentSheet) return;
    if (!window.confirm(`Delete column "${colName}" and all its rows data?`)) return;

    const updated = {
      ...currentSheet,
      columns: currentSheet.columns.filter(c => c !== colName),
      rows: currentSheet.rows.map(row => {
        const copy = { ...row };
        delete copy[colName];
        return copy;
      })
    };
    handleSyncSheet(updated);
  };

  const handleAddRow = () => {
    if (!currentSheet) return;
    const newRow = {};
    currentSheet.columns.forEach(col => { newRow[col] = ""; });
    const updated = {
      ...currentSheet,
      rows: [...currentSheet.rows, newRow]
    };
    handleSyncSheet(updated);
  };

  const handleDeleteRow = (index) => {
    if (!currentSheet) return;
    const updated = {
      ...currentSheet,
      rows: currentSheet.rows.filter((_, idx) => idx !== index)
    };
    handleSyncSheet(updated);
  };

  const handleCellChange = (rowIndex, colName, value) => {
    if (!currentSheet) return;
    const updatedRows = [...currentSheet.rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [colName]: value
    };
    const updated = {
      ...currentSheet,
      rows: updatedRows
    };
    setCurrentSheet(updated); // Instant UI feedback
  };

  const handleDeleteSheet = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Permanent action: Delete this custom spreadsheet?")) return;
    try {
      await axios.delete(`${API_BASE}/api/sheets/${id}`, getHeaders());
      showToast("Spreadsheet deleted.");
      if (currentSheet?._id === id) {
        setCurrentSheet(null);
      }
      fetchSheets();
    } catch (err) {
      showToast("Deletion failed.");
    }
  };

  const handleExportCSV = () => {
    if (!currentSheet || currentSheet.rows.length === 0) return showToast("No sheet data to export.");
    
    const headersStr = currentSheet.columns.join(",");
    const rowsStr = currentSheet.rows.map(row => {
      return currentSheet.columns.map(col => `"${(row[col] || "").replace(/"/g, '""')}"`).join(",");
    }).join("\n");
    const csvContent = `${headersStr}\n${rowsStr}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentSheet.name.replace(/\s+/g, "_")}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV export downloaded!");
  };

  const getColLetter = (index) => String.fromCharCode(65 + index);

  const evaluateExpression = (expr, rows, columns) => {
    if (!expr || typeof expr !== "string" || !expr.startsWith("=")) return expr;
    
    if (expr.toUpperCase().startsWith("=SUM(")) {
      const match = expr.match(/=SUM\(([A-Z])([0-9]+):([A-Z])([0-9]+)\)/i);
      if (match) {
        const startCol = match[1].toUpperCase().charCodeAt(0) - 65;
        const startRow = parseInt(match[2], 10) - 1;
        const endCol = match[3].toUpperCase().charCodeAt(0) - 65;
        const endRow = parseInt(match[4], 10) - 1;
        
        let sum = 0;
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            if (r >= 0 && r < rows.length && c >= 0 && c < columns.length) {
              const rawVal = rows[r][columns[c]];
              sum += parseFloat(evaluateExpression(rawVal, rows, columns)) || 0;
            }
          }
        }
        return sum.toString();
      }
    }

    let formula = expr.substring(1).toUpperCase();
    const cellRefRegex = /[A-Z][0-9]+/g;
    
    formula = formula.replace(cellRefRegex, (cellId) => {
      const match = cellId.match(/^([A-Z])([0-9]+)$/);
      if (!match) return "0";
      const colLetter = match[1];
      const rIdx = parseInt(match[2], 10) - 1;
      const cIdx = colLetter.charCodeAt(0) - 65;
      
      if (rIdx >= 0 && rIdx < rows.length && cIdx >= 0 && cIdx < columns.length) {
        const rawVal = rows[rIdx][columns[cIdx]];
        return parseFloat(evaluateExpression(rawVal, rows, columns)) || 0;
      }
      return "0";
    });
    
    try {
      if (/^[0-9.+\-*/() ]+$/.test(formula)) {
        return Function(`"use strict"; return (${formula})`)().toString();
      }
      return expr;
    } catch (e) {
      return "#ERROR!";
    }
  };

  const handleSelectCell = (rowIndex, colName) => {
    setSelectedCell({ rowIndex, colName });
    if (currentSheet) {
      const val = currentSheet.rows[rowIndex][colName] || "";
      setFormulaValue(val);
    }
  };

  const handleFormulaBarChange = (val) => {
    setFormulaValue(val);
    if (selectedCell && currentSheet) {
      handleCellChange(selectedCell.rowIndex, selectedCell.colName, val);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Toast notifications */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-[9999] bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#1A7F37]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === "list" ? (
        <div className="space-y-6">
          {/* Header toolbar */}
          <div className="neu-flat rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <div>
              <h3 className="text-md font-bold text-slate-800 uppercase tracking-tight">Excel Spreadsheet Library</h3>
              <p className="text-[10px] font-bold text-[#656D76] uppercase">Double click a sheet card to launch editor.</p>
            </div>
            
            <form onSubmit={handleCreateSheet} className="flex gap-2 w-full lg:w-auto">
              <input
                required type="text" value={sheetNameInput}
                onChange={e => setSheetNameInput(e.target.value)}
                placeholder="New sheet name..."
                className="flex-1 neu-pressed rounded-xl p-2.5 text-xs outline-none font-bold"
              />
              <button type="submit" className="px-5 py-2.5 bg-[#107C41] text-white text-xs font-bold uppercase rounded-xl neu-action-btn flex items-center gap-1.5 shadow-md shrink-0">
                <PlusCircle size={14} /> Create New Sheet
              </button>
            </form>
          </div>

          {/* Cards Grid */}
          {sheetsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sheetsList.map(sheet => (
                <div
                  key={sheet._id}
                  onDoubleClick={() => {
                    setCurrentSheet(sheet);
                    setSelectedCell(null);
                    setFormulaValue("");
                    setViewMode("editor");
                  }}
                  className="neu-flat rounded-2xl p-5 flex flex-col justify-between gap-4 border-t-4 border-[#107C41] bg-white cursor-pointer transition-all hover:scale-[1.01] select-none"
                  title="Double click to open sheet"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl neu-pressed-sm flex items-center justify-center text-[#107C41]">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{sheet.name}</h4>
                        <p className="text-[9px] font-bold text-[#656D76] uppercase mt-0.5">Excel Sheet</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSheet(sheet._id, e)}
                      className="p-2 rounded-lg text-[#D1242F] hover:bg-red-50/50 neu-flat-sm neu-action-btn border border-red-200/10"
                      title="Delete Sheet"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="text-[10px] font-medium text-[#656D76] border-t border-[#D1DCEB]/50 pt-3 flex justify-between">
                    <span>Columns: <strong className="text-slate-800">{sheet.columns?.length || 0}</strong></span>
                    <span>Rows: <strong className="text-slate-800">{sheet.rows?.length || 0}</strong></span>
                  </div>

                  <div className="text-center text-[9px] font-bold text-[#107C41] uppercase bg-[#107C41]/5 rounded-lg py-1.5 border border-[#107C41]/20">
                    Double Tap to Open
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="neu-flat rounded-2xl p-16 flex flex-col items-center justify-center text-center">
              <FileSpreadsheet size={48} className="text-[#656D76] opacity-40 mb-3" />
              <h4 className="text-sm font-bold text-[#1F2328]">No Custom Sheets Found</h4>
              <p className="text-xs text-[#656D76] mt-1">Add a new sheet document from the panel above to start computations.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {/* Action Toolbar */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#F0F4F8] p-3 rounded-2xl border border-[#D1DCEB]">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setViewMode("list")}
                className="neu-flat-sm neu-action-btn px-4 py-2 rounded-xl text-xs font-bold text-[#656D76] flex items-center gap-1 bg-white hover:text-slate-800"
              >
                ← Back to Sheets
              </button>
              <span className="text-[10px] font-extrabold px-3 py-1.5 rounded-lg bg-[#107C41] text-white uppercase tracking-wider">
                {currentSheet?.name}
              </span>
              <button
                onClick={handleAddColumn}
                className="neu-flat-sm neu-action-btn px-4 py-2 rounded-xl text-xs font-bold text-[#107C41] flex items-center gap-1.5 hover:bg-[#107C41]/5"
              >
                <Plus size={12} /> Column
              </button>
              <button
                onClick={handleAddRow}
                className="neu-flat-sm neu-action-btn px-4 py-2 rounded-xl text-xs font-bold text-[#107C41] flex items-center gap-1.5 hover:bg-[#107C41]/5"
              >
                <Plus size={12} /> Row
              </button>
              <button
                onClick={handleExportCSV}
                className="neu-flat-sm neu-action-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                Export Excel (CSV)
              </button>
              <button
                onClick={(e) => {
                  handleDeleteSheet(currentSheet._id, e);
                  setViewMode("list");
                }}
                className="neu-flat-sm neu-action-btn px-4 py-2 rounded-xl text-xs font-bold text-[#D1242F]"
              >
                Delete Sheet
              </button>
            </div>

            <div className="text-[9px] font-bold text-[#656D76] italic">
              * Support formulas like <span className="font-extrabold text-[#107C41]">=A1+B1</span> or <span className="font-extrabold text-[#107C41]">=SUM(C1:C10)</span>
            </div>
          </div>

          {/* Excel Formula Bar */}
          <div className="flex items-center gap-3 bg-white border border-[#D1DCEB] rounded-xl px-4 py-2 shadow-sm">
            <span className="text-sm font-extrabold italic text-[#107C41] w-6 select-none">fx</span>
            <input
              type="text"
              placeholder={selectedCell ? `Formula / Value for cell ${getColLetter(currentSheet.columns.indexOf(selectedCell.colName))}${selectedCell.rowIndex + 1}` : "Select a cell to write formula..."}
              disabled={!selectedCell}
              value={formulaValue}
              onChange={e => handleFormulaBarChange(e.target.value)}
              onBlur={() => handleSyncSheet(currentSheet)}
              className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-[#1F2328] placeholder-gray-400"
            />
          </div>

          {/* Spreadsheet Table Grid */}
          <div className="neu-flat rounded-2xl p-2.5 overflow-x-auto custom-scrollbar w-full border border-[#D1DCEB]">
            <table className="w-full text-left border border-gray-300 border-collapse table-fixed select-none">
              <thead>
                {/* Excel Letter Coordinate Row */}
                <tr className="bg-gray-100">
                  <th className="p-1 border border-gray-300 w-12 text-center text-[9px] font-bold text-[#656D76]"></th>
                  {currentSheet.columns.map((_, idx) => (
                    <th key={idx} className="p-1 border border-gray-300 text-center text-[10px] font-extrabold text-[#656D76] bg-gray-50 select-none">
                      {getColLetter(idx)}
                    </th>
                  ))}
                  <th className="p-1 border border-gray-300 w-16 bg-gray-50"></th>
                </tr>

                {/* Custom Column Titles Row */}
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-2 border border-gray-300 text-center text-[10px] font-bold text-[#656D76]">#</th>
                  {currentSheet.columns.map((col, idx) => (
                    <th key={col + idx} className="p-2 border border-gray-300 text-[10px] font-bold text-slate-800 uppercase tracking-wider relative group bg-[#D1DCEB]/20">
                      <div className="flex justify-between items-center gap-2">
                        <span className="truncate" title={col}>{col}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteColumn(col)}
                          className="opacity-0 group-hover:opacity-100 text-[#D1242F] p-0.5"
                        >
                          <Trash size={10} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="p-2 border border-gray-300 text-center text-[10px] font-bold text-[#656D76]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSheet.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                    {/* Row Coordinates Index */}
                    <td className="p-2 border border-gray-300 text-xs font-bold text-center text-[#656D76] bg-gray-50">
                      {rowIndex + 1}
                    </td>

                    {currentSheet.columns.map(col => {
                      const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colName === col;
                      const isSelected = selectedCell?.rowIndex === rowIndex && selectedCell?.colName === col;
                      
                      const rawVal = row[col] || "";
                      const computedVal = evaluateExpression(rawVal, currentSheet.rows, currentSheet.columns);

                      return (
                        <td
                          key={col}
                          onClick={() => handleSelectCell(rowIndex, col)}
                          onDoubleClick={() => setEditingCell({ rowIndex, colName: col })}
                          className={`p-2 border border-gray-300 text-xs font-semibold min-h-[36px] cursor-cell transition-all relative ${
                            isSelected ? "ring-2 ring-[#107C41] ring-inset bg-white" : ""
                          }`}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              type="text"
                              value={rawVal}
                              onChange={e => handleCellChange(rowIndex, col, e.target.value)}
                              onBlur={() => {
                                setEditingCell(null);
                                handleSyncSheet(currentSheet);
                              }}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  setEditingCell(null);
                                  handleSyncSheet(currentSheet);
                                }
                              }}
                              className="w-full p-0.5 bg-white outline-none rounded text-xs font-bold text-[#1F2328]"
                            />
                          ) : (
                            <span className={rawVal.startsWith("=") ? "text-[#107C41] font-bold" : "text-slate-800"}>
                              {computedVal || <span className="text-gray-300 italic font-normal">0</span>}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2 border border-gray-300 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="text-[#D1242F] hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {currentSheet.rows.length === 0 && (
                  <tr>
                    <td colSpan={currentSheet.columns.length + 2} className="p-8 text-center text-xs font-bold text-[#656D76] italic">
                      This spreadsheet contains no rows yet. Click "Add Row" to write values.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

