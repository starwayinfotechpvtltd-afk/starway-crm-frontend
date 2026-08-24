import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderKanban,
  Clock,
  Calendar,
  CheckSquare,
  TrendingUp,
  Briefcase,
  Layers,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ListTodo,
  MessageSquare,
  GitBranch,
  ShieldCheck,
  CalendarDays,
  FileBarChart,
  UserCheck,
  Building2,
  FolderPlus,
  CreditCard,
  Receipt,
  Fingerprint
} from "lucide-react";
import assets from "../assets/assets";
import ClockWidget from "../components/attendance/ClockWidget";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function DashboardLayout({ children, role = "admin" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({
    username: localStorage.getItem("username") || "User",
    role: localStorage.getItem("role") || role,
    avatar: "",
    designation: "",
    department: "",
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API_BASE}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user details", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ── Navigation Definitions by Role ─────────────────────────────────────────
  const getNavSections = () => {
    const currentRole = user.role || role;

    if (currentRole === "admin") {
      return [
        {
          title: "Executive Overview",
          items: [
            { label: "Admin Overview", to: "/dashboard-admin", icon: LayoutDashboard },
            { label: "Work & Performance Reports", to: "/dashboard-admin/developer-reports", icon: FileBarChart },
          ],
        },
        {
          title: "Human Resources & Payroll",
          items: [
            { label: "Employees Directory (360°)", to: "/dashboard-admin/employees", icon: Users },
            { label: "Live Attendance & Shifts", to: "/dashboard-admin/attendance", icon: Fingerprint },
            { label: "Leave Requests", to: "/dashboard-admin/leaves", icon: CalendarDays },
            { label: "Payroll & Compensation", to: "/dashboard-admin/payroll", icon: CreditCard },
            { label: "Onboard Employee", to: "/dashboard-admin/create-user", icon: UserPlus },
            { label: "Operating Teams", to: "/dashboard-admin/caller-teams", icon: GitBranch },
          ],
        },
        {
          title: "Sales & CRM",
          items: [
            { label: "Add Lead", to: "/dashboard-admin/add-leads", icon: UserCheck },
            { label: "All New Leads", to: "/dashboard-admin/new-leads", icon: CalendarDays },
            { label: "Transferred Leads", to: "/dashboard-admin/assigned-leads", icon: Layers },
            { label: "Closed Leads", to: "/dashboard-admin/closed-leads", icon: CheckSquare },
          ],
        },
        {
          title: "Projects & Operations",
          items: [
            { label: "All Projects", to: "/dashboard-admin/projects", icon: FolderKanban },
            { label: "Create Project", to: "/dashboard-admin/create-project", icon: FolderPlus },
            { label: "Master Calendar", to: "/dashboard-admin/calendar", icon: Calendar },
          ],
        },
      ];
    }

    if (currentRole === "hr") {
      return [
        {
          title: "HR Portal",
          items: [
            { label: "HR Overview", to: "/dashboard-hr", icon: LayoutDashboard },
            { label: "Employees Directory", to: "/dashboard-hr/employees", icon: Users },
            { label: "Onboard Employee", to: "/dashboard-hr/create-user", icon: UserPlus },
            { label: "Operating Teams", to: "/dashboard-hr/teams", icon: GitBranch },
            { label: "Leave Requests", to: "/dashboard-hr/leaves", icon: CalendarDays },
            { label: "Payroll & Compensation", to: "/dashboard-hr/payroll", icon: CreditCard },
            { label: "Company Calendar", to: "/dashboard-hr/calendar", icon: Calendar },
            { label: "Performance Reports", to: "/dashboard-hr/reports", icon: FileBarChart },
            { label: "Attendance", to: "/dashboard-hr/attendance", icon: Fingerprint },
          ],
        },
      ];
    }

    if (currentRole === "team_lead") {
      return [
        {
          title: "Team Leadership",
          items: [
            { label: "TL Overview", to: "/dashboard-team-lead", icon: LayoutDashboard },
            { label: "Assign Team Tasks", to: "/dashboard-team-lead/tasks", icon: CheckSquare },
            { label: "Team Members", to: "/dashboard-team-lead/members", icon: Users },
            { label: "Team Projects", to: "/dashboard-team-lead/projects", icon: FolderKanban },
            { label: "My Leaves", to: "/dashboard-team-lead/leaves", icon: CalendarDays },
            { label: "My Payslips & Payroll", to: "/dashboard-team-lead/my-payroll", icon: Receipt },
            { label: "Team Calendar", to: "/dashboard-team-lead/calendar", icon: Calendar },
            { label: "My Attendance", to: "/dashboard-team-lead/attendance", icon: Fingerprint },
          ],
        },
      ];
    }

    if (currentRole === "developer") {
      return [
        {
          title: "Workspace",
          items: [
            { label: "Overview", to: "/dashboard-developer", icon: LayoutDashboard },
            { label: "Tasks", to: "/dashboard-developer/tasks", icon: CheckSquare },
            { label: "Projects", to: "/dashboard-developer/one-time", icon: FolderKanban },
            { label: "My Leaves", to: "/dashboard-developer/leaves", icon: CalendarDays },
            { label: "My Payslips & Payroll", to: "/dashboard-developer/my-payroll", icon: Receipt },
            { label: "Calendar", to: "/dashboard-developer/calendar", icon: Calendar },
            { label: "My Attendance", to: "/dashboard-developer/attendance", icon: Fingerprint },
          ],
        },
      ];
    }

    if (currentRole === "caller") {
      return [
        {
          title: "Sales Pipeline",
          items: [
            { label: "Caller Overview", to: "/dashboard-caller", icon: LayoutDashboard },
            { label: "Add New Lead", to: "/dashboard-caller/add-leads", icon: UserPlus },
            { label: "All Leads", to: "/dashboard-caller/all-leads", icon: Layers },
            { label: "Closed Deals", to: "/dashboard-caller/closed-leads", icon: CheckSquare },
            { label: "My Leaves", to: "/dashboard-caller/leaves", icon: CalendarDays },
            { label: "My Payslips & Payroll", to: "/dashboard-caller/my-payroll", icon: Receipt },
            { label: "Shifts & Callbacks", to: "/dashboard-caller/calendar", icon: Calendar },
            { label: "My Attendance", to: "/dashboard-caller/attendance", icon: Fingerprint },
          ],
        },
      ];
    }

    if (currentRole === "manager") {
      return [
        {
          title: "Manager Hub",
          items: [
            { label: "Manager Overview", to: "/dashboard-team-manager", icon: LayoutDashboard },
            { label: "Team Leads", to: "/dashboard-team-manager/leads", icon: Layers },
            { label: "New Leads", to: "/dashboard-team-manager/new-leads", icon: CalendarDays },
            { label: "Closed Deals", to: "/dashboard-team-manager/closed-leads", icon: CheckSquare },
            { label: "My Leaves", to: "/dashboard-team-manager/leaves", icon: CalendarDays },
            { label: "My Payslips & Payroll", to: "/dashboard-team-manager/my-payroll", icon: Receipt },
            { label: "Operations Calendar", to: "/dashboard-team-manager/calendar", icon: Calendar },
            { label: "My Attendance", to: "/dashboard-team-manager/attendance", icon: Fingerprint },
          ],
        },
      ];
    }

    return [];
  };

  // Toggle to hide payroll globally across all dashboards without deleting any code/routes
  const HIDE_PAYROLL = true;
  // Toggle to hide attendance & clock-in globally across all dashboards without deleting any code/routes
  const HIDE_ATTENDANCE = true;

  const navSections = getNavSections()
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (HIDE_PAYROLL) {
          const isPayroll =
            item.to?.includes("payroll") ||
            item.label?.toLowerCase().includes("payroll") ||
            item.label?.toLowerCase().includes("payslip");
          if (isPayroll) return false;
        }
        if (HIDE_ATTENDANCE) {
          const isAttendance =
            item.to?.includes("attendance") ||
            item.label?.toLowerCase().includes("attendance") ||
            item.label?.toLowerCase().includes("shift");
          if (isAttendance) return false;
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Helper to format role label
  const formatRole = (r) => {
    switch (r) {
      case "admin": return "Super Admin";
      case "hr": return "HR Director";
      case "team_lead": return "Team Lead";
      case "developer": return "Developer";
      case "caller": return "Sales Executive";
      case "manager": return "Operations Manager";
      default: return r || "Staff";
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5]">
      {/* ── Fixed Sidebar (Royal Blue & Blue 600) ──────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1E40AF] border-r border-[#1D4ED8] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-[#2563EB]/50 flex items-center justify-between">
          <div className="flex  justify-center gap-2">
            <img
              src="https://crm.starwaywebdigital.com/assets/starwaylogo-CBhcSc4Y.png"
              alt="Starway Logo"
              className="h-9 object-contain brightness-0 invert"
            />

          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/80 hover:text-white p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-[#DBEAFE]/80">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== "/dashboard-admin" &&
                     item.to !== "/dashboard-hr" &&
                     item.to !== "/dashboard-team-lead" &&
                     item.to !== "/dashboard-developer" &&
                     item.to !== "/dashboard-caller" &&
                     item.to !== "/dashboard-team-manager" &&
                     location.pathname.startsWith(item.to));

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${
                        isActive
                          ? "bg-white text-[#1E40AF] font-bold shadow-xs"
                          : "text-white/85 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={15}
                        className={isActive ? "text-[#1E40AF] shrink-0" : "text-[#BFDBFE] shrink-0"}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Logout Bottom */}
        <div className="p-3 border-t border-[#2563EB]/50 bg-[#1E3A8A]">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded bg-white text-[#1E40AF] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user.username}</div>
              <div className="text-[10px] text-[#DBEAFE] font-medium truncate">
                {user.designation || formatRole(user.role)}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-[#DBEAFE] hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Canvas ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 h-full">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-[#EAE3D6] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded text-[#1E40AF] hover:bg-[#F5EFE6]"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="font-semibold text-[#1E40AF] uppercase tracking-wider text-[11px]">
                {formatRole(user.role)}
              </span>
              <span className="text-[#D8CEBE]">/</span>
              <span className="text-slate-700 capitalize">
                {location.pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!HIDE_ATTENDANCE && !['admin'].includes(user.role || role) && (
              <ClockWidget />
            )}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#F5EFE6] border border-[#EAE3D6] rounded text-[11px] font-semibold text-[#785E3E]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online</span>
            </div>

            <div className="h-4 w-px bg-[#EAE3D6]" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 hidden sm:inline">
                {user.username}
              </span>
              <span className="ent-badge ent-badge-blue text-[10px] hidden sm:inline">
                {user.department || "Enterprise"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-[#FAF8F5] py-3 px-1 sm:py-4 sm:px-2 w-full flex flex-col items-center">
          <div className="w-[97%] space-y-4">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
