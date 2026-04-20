import { useState, useEffect, useMemo } from "react";
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

function App() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [closedLeads, setClosedLeads] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [leadData, setLeadData] = useState([]);
  const [userLeads, setUserLeads] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [closedLeadsByDate, setClosedLeadsByDate] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
  const TRUST_BLUE = "#2383e2";
  const CHART_COLORS = [TRUST_BLUE, "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          totalRes, closedRes, newRes, activeCountRes,
          closedDateRes, recentRes, activeProjRes, userLeadsRes, trendsRes
        ] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/leads/total-leads`),
          axios.get(`${API_BASE}/api/leads/total-closed-leads`),
          axios.get(`${API_BASE}/api/leads/new-leads-this-month`),
          fetch(`${API_BASE}/api/newproject/active-projects-count`).then(res => res.json()),
          fetch(`${API_BASE}/api/leads/closed-leads-by-date`).then(res => res.json()),
          fetch(`${API_BASE}/api/leads/recent-leads`).then(res => res.json()),
          fetch(`${API_BASE}/api/newproject/active-projects`).then(res => res.json()),
          fetch(`${API_BASE}/api/leads/leads-by-user`).then(res => res.json()),
          fetch(`${API_BASE}/api/leads/lead-trends`).then(res => res.json())
        ]);

        if (totalRes.status === "fulfilled") setTotalLeads(totalRes.value.data.totalLeads);
        if (closedRes.status === "fulfilled") setClosedLeads(closedRes.value.data.totalClosedLeads);
        if (newRes.status === "fulfilled") setNewLeads(newRes.value.data.totalNewLeads);
        if (activeCountRes.status === "fulfilled") setActiveProjectsCount(activeCountRes.value.count);
        if (closedDateRes.status === "fulfilled") setClosedLeadsByDate(closedDateRes.value);
        if (recentRes.status === "fulfilled") setRecentLeads(recentRes.value);
        if (activeProjRes.status === "fulfilled") setActiveProjects(activeProjRes.value);
        
        if (userLeadsRes.status === "fulfilled") {
          setUserLeads(userLeadsRes.value.map(item => ({ user: item._id || "Unknown", leads: item.count })));
        }
        
        if (trendsRes.status === "fulfilled") {
          setLeadData(trendsRes.value.map(item => ({ name: item._id, leads: item.count })));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchAllData();
  }, [API_BASE]);

  // --- Derived Data for Pie Chart ---
  const pieChartData = useMemo(() => {
    const typeCounts = recentLeads.reduce((acc, lead) => {
      const type = lead.leadType || "Uncategorized";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [recentLeads]);

  // --- Shared Metric Card Component ---
  const MetricCard = ({ title, value, icon: Icon, linkText, linkTo, trendColor }) => (
    <motion.div variants={itemVariants} className="bg-white p-5 rounded-sm border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-base text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="p-2 rounded-sm bg-slate-50">
          <Icon className={`h-6 w-6 ${trendColor}`} style={{ color: title === 'Total Leads' ? TRUST_BLUE : undefined }} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-base">
        <ArrowUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
        <Link to={linkTo} className="text-slate-600 hover:text-blue-600 transition-colors">
          {linkText}
        </Link>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-base text-slate-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <MetricCard title="Total Leads" value={totalLeads.toLocaleString()} icon={UsersIcon} linkText="View Leads" linkTo="/dashboard-admin/new-leads" />
        <MetricCard title="Closed Leads" value={closedLeads} icon={CheckCircleIcon} linkText="View Closed Leads" linkTo="/dashboard-admin/closed-leads" trendColor="text-emerald-600" />
        <MetricCard title="New This Month" value={newLeads} icon={ChartBarIcon} linkText="View Leads" linkTo="/dashboard-admin/new-leads" trendColor="text-violet-600" />
        <MetricCard title="Active Projects" value={activeProjectsCount} icon={CurrencyDollarIcon} linkText="View Projects" linkTo="/dashboard-admin/projects" trendColor="text-amber-600" />
      </div>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Line Chart */}
        <motion.div variants={itemVariants} className="bg-white p-5 md:p-6 rounded-sm border border-slate-200 shadow-xs lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-800 mb-4 md:mb-6">Lead Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={14} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={14} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "0.125rem", fontSize: "14px", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '14px' }} />
              <Line type="monotone" dataKey="leads" stroke={TRUST_BLUE} strokeWidth={2} dot={{ fill: TRUST_BLUE, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart (New) */}
        <motion.div variants={itemVariants} className="bg-white p-5 md:p-6 rounded-sm border border-slate-200 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-4 md:mb-6">Recent Lead Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "0.125rem", fontSize: "14px", border: "1px solid #E2E8F0" }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '14px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Secondary Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        
        {/* Bar Chart */}
        <motion.div variants={itemVariants} className="bg-white p-5 md:p-6 rounded-sm border border-slate-200 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-4 md:mb-6">Leads by User</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userLeads}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="user" stroke="#64748B" fontSize={14} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={14} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "0.125rem", fontSize: "14px" }} />
              <Bar dataKey="leads" fill={TRUST_BLUE} radius={[2, 2, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Scatter Chart (Closed Leads) */}
        <motion.div variants={itemVariants} className="bg-white p-5 md:p-6 rounded-sm border border-slate-200 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-4 md:mb-6">Closed Leads Analysis</h3>
          {closedLeadsByDate.length === 0 ? (
            <p className="text-slate-500 text-base text-center py-10">No closed leads data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={14} tickLine={false} axisLine={false} tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis dataKey="count" stroke="#64748B" fontSize={14} tickLine={false} axisLine={false} domain={[0, "auto"]} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "0.125rem", fontSize: "14px" }} formatter={(value, name, props) => [`${value} lead${value !== 1 ? "s" : ""} closed`, `Date: ${props.payload.date}`]} />
                <Scatter data={closedLeadsByDate} fill={TRUST_BLUE} shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        
        {/* Active Projects Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-800">Active Projects</h3>
          </div>
          <div className="overflow-x-auto flex-1 max-h-84">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500 text-sm tracking-wider">
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Assigned To</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeProjects.map((project, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-base font-medium text-slate-900">{project.projectName}</td>
                    <td className="px-5 py-4 flex items-center space-x-2 text-base text-slate-600">
                      <FaUser className="text-slate-400" />
                      <span>{project.assignedDeveloper?.username || "Unassigned"}</span>
                    </td>
                    <td className="px-5 py-4 text-base">
                      <span className={`inline-flex px-2.5 py-1 rounded-sm text-sm font-medium border ${
                        project.status === "Active" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                        project.status === "At Risk" ? "bg-red-50 text-red-700 border-red-200" : 
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Leads Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-800">Recent Leads</h3>
          </div>
          <div className="overflow-x-auto flex-1 max-h-[350px]">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-medium text-slate-500 tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-sm font-medium text-slate-500 tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-sm font-medium text-slate-500 tracking-wider">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 flex items-center">
                      <FaUserCircle className="h-8 w-8 text-slate-300 mr-3" />
                      <div>
                        <div className="text-base font-medium text-slate-900">{lead.leadName}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{lead.email}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-base">
                      <span className={`inline-flex px-2.5 py-1 rounded-sm text-sm font-medium border ${
                        lead.leadType === "Hot Lead" ? "bg-red-50 text-red-700 border-red-200" : 
                        lead.leadType === "New Lead" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }`}>
                        {lead.leadType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-base text-slate-600">{lead.leadOwner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default App;