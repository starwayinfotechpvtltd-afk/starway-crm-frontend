import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpIcon,
  UsersIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { FaUserCircle, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  neuBase: "#F0F4F8", 
  textPrimary: "#1F2328",
  textSecondary: "#656D76",
  accent: "#0969DA",
  green: "#1A7F37",
  red: "#D1242F",
  orange: "#BF8700",
  font: "'Montserrat', sans-serif"
};

const CHART_COLORS = [T.accent, T.green, T.orange, "#8b5cf6", "#64748b"];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ── Neumorphic Skeleton Loader ───────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="min-h-screen neu-base flex flex-col p-4 md:p-8 space-y-8 font-sans pb-12">
    {/* Top Metrics Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="neu-flat p-5 rounded-lg flex flex-col justify-between h-[130px]">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-1/2">
              <div className="h-3 neu-pressed rounded w-full skeleton-pulse"></div>
              <div className="h-6 neu-pressed rounded w-1/2 skeleton-pulse"></div>
            </div>
            <div className="w-10 h-10 neu-pressed rounded-lg skeleton-pulse flex-shrink-0"></div>
          </div>
          <div className="h-3 neu-pressed rounded w-1/3 skeleton-pulse mt-4"></div>
        </div>
      ))}
    </div>

    {/* Primary Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <div className="lg:col-span-2 neu-flat p-5 md:p-6 rounded-lg h-[380px] flex flex-col gap-6">
        <div className="h-4 neu-pressed rounded w-1/4 skeleton-pulse"></div>
        <div className="flex-1 neu-pressed rounded-lg skeleton-pulse"></div>
      </div>
      <div className="neu-flat p-5 md:p-6 rounded-lg h-[380px] flex flex-col gap-6">
        <div className="h-4 neu-pressed rounded w-1/2 skeleton-pulse"></div>
        <div className="flex-1 neu-pressed rounded-full skeleton-pulse mx-12 my-4"></div>
      </div>
    </div>

    {/* Secondary Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {[1, 2].map(i => (
        <div key={i} className="neu-flat p-5 md:p-6 rounded-lg h-[380px] flex flex-col gap-6">
          <div className="h-4 neu-pressed rounded w-1/3 skeleton-pulse"></div>
          <div className="flex-1 neu-pressed rounded-lg skeleton-pulse"></div>
        </div>
      ))}
    </div>

    {/* Tables Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {[1, 2].map(tableIdx => (
        <div key={tableIdx} className="neu-flat rounded-lg flex flex-col overflow-hidden h-[400px]">
          <div className="p-5 border-b border-[#D1DCEB]/40">
            <div className="h-4 neu-pressed rounded w-1/3 skeleton-pulse"></div>
          </div>
          <div className="p-5 flex-1 space-y-4">
            {[1, 2, 3, 4].map(rowIdx => (
              <div key={rowIdx} className="flex justify-between items-center neu-pressed p-4 rounded-md h-16">
                <div className="h-3 neu-pressed rounded w-1/3 skeleton-pulse"></div>
                <div className="h-3 neu-pressed rounded w-1/4 skeleton-pulse"></div>
                <div className="h-6 neu-pressed rounded w-16 skeleton-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Project Details Modal ───────────────────────────────────────────────────
const ProjectDetailsModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#1F2328]/40 backdrop-blur-sm animate-fadeIn">
      <div onClick={e => e.stopPropagation()} className="neu-flat rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col font-sans overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D1DCEB]/40 flex justify-between items-start">
          <div>
            <div className="text-[10px] text-[#656D76] font-bold uppercase tracking-wider mb-1">Project Details</div>
            <h2 className="text-xl font-bold text-[#1F2328]">{project.projectName}</h2>
          </div>
          <button onClick={onClose} className="text-[#656D76] hover:text-[#1F2328] text-2xl font-bold neu-action-btn w-8 h-8 rounded-full flex items-center justify-center leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="neu-pressed p-4 rounded-md">
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Client Name</p>
              <p className="font-semibold text-[#1F2328]">{project.clientName || "N/A"}</p>
            </div>
            <div className="neu-pressed p-4 rounded-md">
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Client Email</p>
              <p className="font-semibold text-[#0969DA] break-all">{project.clientEmail || "N/A"}</p>
            </div>
            <div className="neu-pressed p-4 rounded-md">
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Client Number</p>
              <p className="font-semibold text-[#1F2328]">{project.clientNumber || "N/A"}</p>
            </div>
            <div className="neu-pressed p-4 rounded-md">
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Amount</p>
              <p className="font-semibold text-[#1A7F37]">${project.amount?.toLocaleString() || "0"}</p>
            </div>
          </div>

          <div className="neu-pressed p-4 rounded-md">
            <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Project Overview</p>
            <p className="text-sm text-[#1F2328] leading-relaxed whitespace-pre-wrap">{project.projectDetails || "No details provided."}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="neu-pressed p-4 rounded-md">
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Assigned Developers</p>
              {project.assignedDeveloper && project.assignedDeveloper.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.assignedDeveloper.map(dev => (
                    <span key={dev.id} className="text-xs bg-[#0969DA]/10 text-[#0969DA] px-2.5 py-1 rounded-md font-semibold">
                      {dev.username}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#656D76]">Unassigned</p>
              )}
            </div>
            <div className="neu-pressed p-4 rounded-md">
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Services & Subscription</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {project.serviceType && project.serviceType.length > 0 ? (
                  project.serviceType.map((svc, i) => (
                    <span key={i} className="text-[10px] neu-flat-sm text-[#1F2328] px-2 py-1 rounded-md font-semibold">{svc}</span>
                  ))
                ) : (
                  <span className="text-sm text-[#656D76]">N/A</span>
                )}
              </div>
              <p className="text-xs font-semibold text-[#1F2328]">
                Subscription: <span className="font-normal text-[#656D76]">{project.subscriptionType}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="neu-pressed p-4 rounded-md">
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Business Niche</p>
              <p className="font-semibold text-[#1F2328]">{project.businessNiche || "N/A"}</p>
            </div>
            <div className="neu-pressed p-4 rounded-md overflow-hidden">
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Reference Site</p>
              {project.referenceSite ? (
                <a href={project.referenceSite.startsWith('http') ? project.referenceSite : `https://${project.referenceSite}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0969DA] hover:underline truncate block">
                  {project.referenceSite}
                </a>
              ) : (
                <p className="text-sm text-[#656D76]">N/A</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center p-4 border border-[#D1DCEB] rounded-md border-dashed">
            <div>
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Status</p>
              <p className={`text-sm font-bold ${project.status === 'Active' ? 'text-[#1A7F37]' : project.status === 'Closed' ? 'text-[#656D76]' : 'text-[#BF8700]'}`}>
                {project.status || "Unknown"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Created By</p>
              <p className="text-sm font-semibold text-[#1F2328]">{project.createdBy || "System"}</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#D1DCEB]/40 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 text-xs font-bold text-[#1F2328] neu-flat neu-action-btn rounded-md transition-all">
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Shared Metric Card Component ────────────────────────────────────────────
const MetricCard = ({ title, value, icon: Icon, linkText, linkTo, trendColor }) => (
  <motion.div variants={itemVariants} className="neu-flat p-5 rounded-lg flex flex-col justify-between h-full min-h-[140px]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-[#1F2328] mt-1.5">{value}</p>
      </div>
      <div className="p-2.5 neu-pressed rounded-lg">
        <Icon className={`h-6 w-6 ${trendColor || 'text-[#0969DA]'}`} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs font-semibold">
      <ArrowUpIcon className="h-3.5 w-3.5 text-[#1A7F37] mr-1" strokeWidth={3} />
      <Link to={linkTo} className="text-[#656D76] hover:text-[#0969DA] transition-colors">
        {linkText}
      </Link>
    </div>
  </motion.div>
);


// ── Main App Component ──────────────────────────────────────────────────────
function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [totalLeads, setTotalLeads] = useState(0);
  const [closedLeads, setClosedLeads] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  
  // Array States
  const [leadData, setLeadData] = useState([]);
  const [userLeads, setUserLeads] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [closedLeadsByDate, setClosedLeadsByDate] = useState([]);

  // Modal State
  const [selectedProject, setSelectedProject] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [
          totalRes, closedRes, newRes, activeCountRes,
          closedDateRes, recentRes, activeProjRes, userLeadsRes, trendsRes
        ] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/leads/total-leads`, { headers }),
          axios.get(`${API_BASE}/api/leads/total-closed-leads`, { headers }),
          axios.get(`${API_BASE}/api/leads/new-leads-this-month`, { headers }),
          axios.get(`${API_BASE}/api/newproject/active-projects-count`, { headers }),
          axios.get(`${API_BASE}/api/leads/closed-leads-by-date`, { headers }),
          axios.get(`${API_BASE}/api/leads/recent-leads`, { headers }),
          axios.get(`${API_BASE}/api/newproject/active-projects`, { headers }),
          axios.get(`${API_BASE}/api/leads/leads-by-user`, { headers }),
          axios.get(`${API_BASE}/api/leads/lead-trends`, { headers })
        ]);

        if (totalRes.status === "fulfilled") setTotalLeads(totalRes.value.data?.totalLeads || 0);
        if (closedRes.status === "fulfilled") setClosedLeads(closedRes.value.data?.totalClosedLeads || 0);
        if (newRes.status === "fulfilled") setNewLeads(newRes.value.data?.totalNewLeads || 0);
        if (activeCountRes.status === "fulfilled") setActiveProjectsCount(activeCountRes.value.data?.count || 0);
        if (closedDateRes.status === "fulfilled") setClosedLeadsByDate(Array.isArray(closedDateRes.value.data) ? closedDateRes.value.data : []);
        if (recentRes.status === "fulfilled") setRecentLeads(Array.isArray(recentRes.value.data) ? recentRes.value.data : []);
        if (activeProjRes.status === "fulfilled") setActiveProjects(Array.isArray(activeProjRes.value.data) ? activeProjRes.value.data : []);
        
        if (userLeadsRes.status === "fulfilled") {
          const userLeadsArr = Array.isArray(userLeadsRes.value.data) ? userLeadsRes.value.data : [];
          setUserLeads(userLeadsArr.map(item => ({ user: item._id || "Unknown", leads: item.count })));
        }
        
        if (trendsRes.status === "fulfilled") {
          const trendsArr = Array.isArray(trendsRes.value.data) ? trendsRes.value.data : [];
          setLeadData(trendsArr.map(item => ({ name: item._id, leads: item.count })));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [API_BASE]);

  // --- Derived Data for Pie Chart ---
  const pieChartData = useMemo(() => {
    const leadsList = Array.isArray(recentLeads) ? recentLeads : [];
    const typeCounts = leadsList.reduce((acc, lead) => {
      const type = lead.leadType || "Uncategorized";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [recentLeads]);

  // --- Custom Tooltip Styles for Recharts ---
  const tooltipStyle = {
    backgroundColor: '#F0F4F8',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '4px 4px 10px #D1DCEB, -4px -4px 10px #FFFFFF',
    fontSize: '12px',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 'bold',
    color: '#1F2328'
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen neu-base font-sans pb-12 relative text-[#1F2328]">
      <motion.div className="p-4 md:p-8 max-w-[100%] mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 mb-8">
          <MetricCard title="Total Leads" value={totalLeads.toLocaleString()} icon={UsersIcon} linkText="View Leads" linkTo="/dashboard-admin/new-leads" />
          <MetricCard title="Closed Leads" value={closedLeads} icon={CheckCircleIcon} linkText="View Closed" linkTo="/dashboard-admin/closed-leads" trendColor="text-[#1A7F37]" />
          <MetricCard title="New This Month" value={newLeads} icon={ChartBarIcon} linkText="View Leads" linkTo="/dashboard-admin/new-leads" trendColor="text-[#8b5cf6]" />
          <MetricCard title="Active Projects" value={activeProjectsCount} icon={CurrencyDollarIcon} linkText="View Projects" linkTo="/dashboard-admin/projects" trendColor="text-[#BF8700]" />
        </div>

        {/* Primary Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
          {/* Line Chart */}
          <motion.div variants={itemVariants} className="neu-flat p-5 md:p-6 rounded-lg lg:col-span-2">
            <h3 className="text-xs font-bold text-[#1F2328] mb-6 uppercase tracking-wider">Lead Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D1DCEB" opacity={0.6} vertical={false} />
                <XAxis dataKey="name" stroke="#656D76" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#656D76" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="leads" stroke={T.accent} strokeWidth={3} dot={{ fill: T.accent, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div variants={itemVariants} className="neu-flat p-5 md:p-6 rounded-lg">
            <h3 className="text-xs font-bold text-[#1F2328] mb-6 uppercase tracking-wider">Recent Lead Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Secondary Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-8">
          {/* Bar Chart */}
          <motion.div variants={itemVariants} className="neu-flat p-5 md:p-6 rounded-lg">
            <h3 className="text-xs font-bold text-[#1F2328] mb-6 uppercase tracking-wider">Leads by User</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userLeads}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D1DCEB" opacity={0.6} vertical={false} />
                <XAxis dataKey="user" stroke="#656D76" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#656D76" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} />
                <Bar dataKey="leads" fill={T.accent} radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Scatter Chart (Closed Leads) */}
          <motion.div variants={itemVariants} className="neu-flat p-5 md:p-6 rounded-lg">
            <h3 className="text-xs font-bold text-[#1F2328] mb-6 uppercase tracking-wider">Closed Leads Analysis</h3>
            {closedLeadsByDate.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-[#656D76] text-sm font-semibold">No closed leads data available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D1DCEB" opacity={0.6} vertical={false} />
                  <XAxis dataKey="date" stroke="#656D76" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(date) => new Date(date).toLocaleDateString()} dy={10} />
                  <YAxis dataKey="count" stroke="#656D76" fontSize={11} tickLine={false} axisLine={false} domain={[0, "auto"]} dx={-10} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name, props) => [`${value} lead${value !== 1 ? "s" : ""} closed`, `Date: ${props.payload.date}`]} />
                  <Scatter data={closedLeadsByDate} fill={T.green} shape="circle" />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-8">
          
          {/* Active Projects Table */}
          <motion.div variants={itemVariants} className="neu-flat rounded-lg flex flex-col overflow-hidden max-h-[450px]">
            <div className="p-5 border-b border-[#D1DCEB]/40">
              <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">Active Projects Workspace</h3>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 p-3">
              <div className="space-y-3">
                {activeProjects.length === 0 ? (
                  <p className="text-center text-sm font-semibold text-[#656D76] py-10">No active projects found.</p>
                ) : (
                  activeProjects.map((project, index) => (
                    <div 
                      key={index} 
                      onClick={() => setSelectedProject(project)}
                      className="neu-pressed rounded-md p-4 flex justify-between items-center cursor-pointer neu-action-btn transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1F2328] truncate group-hover:text-[#0969DA] transition-colors">{project.projectName}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#656D76] font-semibold">
                          <FaUser className="text-[#8C959F] text-[10px]" />
                          <span className="truncate">{project.assignedDeveloper?.[0]?.username || "Unassigned"}</span>
                          {project.assignedDeveloper?.length > 1 && (
                            <span className="text-[9px] bg-[#D1DCEB] px-1.5 py-0.5 rounded text-[#1F2328]">+{project.assignedDeveloper.length - 1}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                          project.status === "Active" ? "text-[#1A7F37] neu-flat-sm" : 
                          project.status === "At Risk" ? "text-[#D1242F] neu-flat-sm" : 
                          "text-[#656D76] neu-flat-sm"
                        }`}>
                          {project.status || "Unknown"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent Leads Table */}
          <motion.div variants={itemVariants} className="neu-flat rounded-lg flex flex-col overflow-hidden max-h-[450px]">
            <div className="p-5 border-b border-[#D1DCEB]/40">
              <h3 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">Recent Lead Influx</h3>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 p-3">
              <div className="space-y-3">
                {recentLeads.length === 0 ? (
                  <p className="text-center text-sm font-semibold text-[#656D76] py-10">No recent leads found.</p>
                ) : (
                  recentLeads.map((lead) => (
                    <div key={lead._id} className="neu-pressed rounded-md p-4 flex justify-between items-center transition-all">
                      <div className="flex items-center flex-1 min-w-0 pr-4">
                        <div className="w-8 h-8 rounded-full neu-flat-sm flex items-center justify-center mr-3 flex-shrink-0 text-[#0969DA]">
                          <FaUserCircle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#1F2328] truncate">{lead.leadName}</p>
                          <p className="text-xs text-[#656D76] font-semibold truncate mt-0.5">{lead.leadOwner || "Unassigned"}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                          lead.leadType === "Hot Lead" ? "text-[#D1242F] neu-flat-sm" : 
                          lead.leadType === "New Lead" ? "text-[#0969DA] neu-flat-sm" : 
                          "text-[#656D76] neu-flat-sm"
                        }`}>
                          {lead.leadType || "Unknown"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Embedded Project Details Modal */}
      <ProjectDetailsModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

      {/* Global Neumorphism CSS & Animations */}
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

        .neu-action-btn { cursor: pointer; transition: all 0.2s ease; }
        .neu-action-btn:active {
          box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light);
        }

        /* Scoped Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8C959F; }

        @keyframes pulse-skeleton {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .skeleton-pulse {
          animation: pulse-skeleton 1.6s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;