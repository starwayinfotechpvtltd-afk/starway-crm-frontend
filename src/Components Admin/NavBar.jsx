import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, Users, UserPlus, FileBarChart, 
  UsersRound, TrendingUp, UserPlus2, CalendarDays, 
  ClipboardList, CheckSquare, Calendar, FolderOpen, 
  FolderPlus, Network, LogOut, ChevronDown
} from "lucide-react";
import assets from "../assets/assets";
import ReminderSystem from "../Components Global/ReminderSystem";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Sidebar Content Component ────────────────────────────────────────────────
const SidebarContent = ({ setSidebarOpen, onLogout }) => {
  const [hrOpen, setHrOpen] = useState(true);
  const [salesOpen, setSalesOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 neu-action-btn ${
          active 
            ? "neu-pressed text-[#0969DA] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)]" 
            : "neu-flat-sm text-[#656D76] hover:text-[#1F2328]"
        }`}
      >
        <Icon size={16} className={`shrink-0 ${active ? "text-[#0969DA]" : "text-[#656D76]"}`} />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  const NavGroup = ({ label, icon: Icon, open, onToggle, children }) => (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 neu-action-btn ${
          open ? "neu-pressed border-b border-[#0969DA]/20" : "neu-flat"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className={open ? "text-[#0969DA]" : "text-[#656D76]"} />
          <span className={`text-xs font-bold uppercase tracking-wider ${open ? "text-[#0969DA]" : "text-[#1F2328]"}`}>
            {label}
          </span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-300 text-[#656D76] ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1 px-2 space-y-2 border-l-2 border-[#D1DCEB]/50 ml-4 pl-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F0F4F8] montserrat-regular">
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between border-b border-[#D1DCEB]/50 shrink-0">
        <div className="flex items-center gap-3">
          <img src={assets.logo} alt="Starway" className="h-8 w-auto" />
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="neu-flat-sm neu-action-btn p-2 rounded-lg text-[#656D76] hover:text-[#D1242F]"
        >
          <X size={18} className="pointer-events-none" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
        
        <NavItem to="/dashboard-admin" icon={LayoutDashboard} label="Overview" />

        <NavGroup label="HR" icon={UsersRound} open={hrOpen} onToggle={() => setHrOpen(!hrOpen)}>
          <NavItem to="/dashboard-admin/create-user" icon={UserPlus} label="Create User" />
          <NavItem to="/dashboard-admin/users" icon={Users} label="All Users" />
          <NavItem to="/dashboard-admin/developer-reports" icon={FileBarChart} label="Work Reports" />
          <NavItem to="/dashboard-admin/caller-teams" icon={UsersRound} label="Calling Teams" />
        </NavGroup>

        <NavGroup label="Sales" icon={TrendingUp} open={salesOpen} onToggle={() => setSalesOpen(!salesOpen)}>
          <NavItem to="/dashboard-admin/add-leads" icon={UserPlus2} label="Add Leads" />
          <NavItem to="/dashboard-admin/new-leads" icon={CalendarDays} label="All New Leads" />
          <NavItem to="/dashboard-admin/assigned-leads" icon={ClipboardList} label="Transfers" />
          <NavItem to="/dashboard-admin/closed-leads" icon={CheckSquare} label="Closed Leads" />
          <NavItem to="/dashboard-admin/calendar" icon={Calendar} label="Calendar" />
        </NavGroup>

        <NavGroup label="Projects" icon={FolderOpen} open={projectsOpen} onToggle={() => setProjectsOpen(!projectsOpen)}>
          <NavItem to="/dashboard-admin/create-project" icon={FolderPlus} label="Create Project" />
          <NavItem to="/dashboard-admin/projects" icon={Network} label="Projects List" />
        </NavGroup>

      </div>

      {/* Logout Footer */}
      <div className="p-5 border-t border-[#D1DCEB]/50 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 neu-flat neu-action-btn rounded-xl text-[#D1242F] text-xs font-bold uppercase tracking-wider transition-colors hover:text-[#A40E26]"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

// ── Top Navigation Bar ────────────────────────────────────────────────────────
export default function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("Admin");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(`${API_BASE}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="montserrat-regular">
      {/* ── Fixed Top Header ── */}
      <header className="sticky top-0 z-[9999] w-full h-[70px] neu-base flex items-center justify-between px-4 sm:px-8 border-b border-[#D1DCEB]/50 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="neu-flat neu-action-btn p-2.5 rounded-lg text-[#0969DA] hover:text-[#0854b3] transition-colors"
          >
            <Menu size={20} className="pointer-events-none" />
          </button>
          <img className="h-10 w-auto" src={assets.logo} alt="Starway Logo" />
        </div>

        <p className="hidden sm:block absolute left-1/2 -translate-x-1/2 text-sm montserrat-medium text-[#1F2328]">
          Hey, <span className="text-[#0969DA]">{username}</span> — good to see you!
        </p>

        <div className="flex items-center gap-4">
          <ReminderSystem />
          <button
            onClick={handleLogout}
            className="neu-flat-sm neu-action-btn px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#D1242F] hidden sm:flex items-center gap-2"
          >
            Logout <LogOut size={14} className="pointer-events-none" />
          </button>
        </div>
      </header>

      {/* ── Sliding Framer-Motion Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-start">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-[#F0F4F8]/80 backdrop-blur-sm z-0 cursor-pointer"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative z-10 w-[280px] sm:w-[320px] h-full neu-base border-r border-[#D1DCEB]/50 shadow-2xl"
            >
              <SidebarContent setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Neumorphic CSS Rules */}
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

        button svg { pointer-events: none !important; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 4px 0;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </div>
  );
}