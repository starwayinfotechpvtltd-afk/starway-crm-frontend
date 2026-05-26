import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip
} from "@mui/material";
import { ShieldAlert, Briefcase, TrendingUp, CheckCircle2, UserCheck, DollarSign } from "lucide-react";
import dayjs from "dayjs";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

function ManagerDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Raw Data State
  const [teamName, setTeamName] = useState("");
  const [recentLeads, setRecentLeads] = useState([]);
  
  // Dashboard Metrics State
  const [metrics, setMetrics] = useState({
    totalTeamLeads: 0,
    assignedToMe: 0,
    closedThisMonth: 0,
    totalRevenue: 0,
  });

  // Chart Data States
  const [trendData, setTrendData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [callerData, setCallerData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch user context and team leads in parallel
        const [userRes, leadsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/auth/user`, config),
          axios.get(`${API_BASE}/api/leads/team-leads`, config)
        ]);

        const currentUser = userRes.data;
        const { team, leads } = leadsRes.data;

        if (!team) {
          setError("You do not currently manage an active team. Please contact an administrator.");
          setLoading(false);
          return;
        }

        setTeamName(team.teamName);

        // --- 1. CALCULATE TOP CARDS ---
        const currentMonth = dayjs().month();
        const currentYear = dayjs().year();

        const assignedToMeCount = leads.filter(l => l.assignedTo?._id === currentUser._id).length;
        
        const closedThisMonthCount = leads.filter(l => 
          l.status === "closed" && 
          dayjs(l.closedAt || l.updatedAt).month() === currentMonth &&
          dayjs(l.closedAt || l.updatedAt).year() === currentYear
        ).length;

        const totalRevenueCalc = leads
          .filter(l => l.status === "closed")
          .reduce((sum, curr) => sum + (curr.pitchedAmount || 0), 0);

        setMetrics({
          totalTeamLeads: leads.length,
          assignedToMe: assignedToMeCount,
          closedThisMonth: closedThisMonthCount,
          totalRevenue: totalRevenueCalc
        });

        // --- 2. RECENT LEADS TABLE ---
        setRecentLeads(leads.slice(0, 5)); // Get top 5 most recent

        // --- 3. STATUS PIE CHART ---
        const ongoing = leads.filter(l => !l.status || l.status === "ongoing").length;
        const closed = leads.filter(l => l.status === "closed").length;
        const dropped = leads.filter(l => l.status === "dropped").length;
        
        setStatusData([
          { name: 'Ongoing', value: ongoing, color: '#0052CC' },
          { name: 'Closed (Won)', value: closed, color: '#006644' },
          { name: 'Dropped', value: dropped, color: '#DE350B' }
        ]);

        // --- 4. TREND LINE CHART (Last 6 Months) ---
        const monthsMap = {};
        for (let i = 5; i >= 0; i--) {
          const m = dayjs().subtract(i, 'month').format('MMM YYYY');
          monthsMap[m] = { name: m, Created: 0, Closed: 0 };
        }

        leads.forEach(l => {
          // Created Trend
          if (l.createdAt) {
            const cMonth = dayjs(l.createdAt).format('MMM YYYY');
            if (monthsMap[cMonth]) monthsMap[cMonth].Created += 1;
          }
          // Closed Trend
          if (l.status === "closed" && (l.closedAt || l.updatedAt)) {
            const clMonth = dayjs(l.closedAt || l.updatedAt).format('MMM YYYY');
            if (monthsMap[clMonth]) monthsMap[clMonth].Closed += 1;
          }
        });
        setTrendData(Object.values(monthsMap));

        // --- 5. CALLER PERFORMANCE BAR CHART ---
        const callerMap = {};
        leads.forEach(l => {
          const owner = l.leadOwner || "Unknown";
          if (!callerMap[owner]) {
            callerMap[owner] = { name: owner, Leads: 0, Revenue: 0 };
          }
          callerMap[owner].Leads += 1;
          if (l.status === "closed") {
            callerMap[owner].Revenue += (l.pitchedAmount || 0);
          }
        });
        
        // Convert to array and sort by most leads
        const sortedCallers = Object.values(callerMap).sort((a, b) => b.Leads - a.Leads).slice(0, 7);
        setCallerData(sortedCallers);

      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "?";

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]"><CircularProgress /></div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-200">
        <ShieldAlert className="w-5 h-5" /> {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-4 md:p-8 font-sans" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* --- HEADER --- */}
      <div className="mb-8">
        <h1 className="text-[24px] font-medium text-[#172B4D] tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-[#6B778C] mt-1">Real-time insights and performance metrics for <b>{teamName}</b>.</p>
      </div>

      {/* --- TOP STATS CARDS --- */}
      <Grid container spacing={3} className="mb-8">
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px' }}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-full bg-[#EAE6FF] flex items-center justify-center text-[#403294]">
                <Briefcase size={24} />
              </div>
              <div>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase' }}>Total Team Leads</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{metrics.totalTeamLeads}</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px' }}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-full bg-[#DEEBFF] flex items-center justify-center text-[#0052CC]">
                <UserCheck size={24} />
              </div>
              <div>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase' }}>Assigned To Me</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{metrics.assignedToMe}</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px' }}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-full bg-[#E3FCEF] flex items-center justify-center text-[#006644]">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase' }}>Closed This Month</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#172B4D' }}>{metrics.closedThisMonth}</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px' }}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-full bg-[#E3FCEF] flex items-center justify-center text-[#006644]">
                <DollarSign size={24} />
              </div>
              <div>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase' }}>Total Revenue</Typography>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#006644' }}>${metrics.totalRevenue.toLocaleString()}</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* --- CHARTS ROW 1 --- */}
      <Grid container spacing={3} className="mb-8">
        
        {/* Trend Line Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#172B4D', mb: 3 }}>
              Team Pipeline Trend (Last 6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBECF0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B778C' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B778C' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '3px', border: '1px solid #DFE1E6', fontSize: '13px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Created" stroke="#0052CC" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Closed" stroke="#006644" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#172B4D', mb: 1 }}>
              Overall Pipeline Status
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={statusData} innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '3px', border: '1px solid #DFE1E6', fontSize: '13px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* --- CHARTS ROW 2 & RECENT LEADS --- */}
      <Grid container spacing={3}>
        
        {/* Caller Performance Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#172B4D', mb: 3 }}>
              Top Callers by Lead Generation
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={callerData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EBECF0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B778C' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#172B4D', fontWeight: 500 }} width={100} />
                <RechartsTooltip cursor={{ fill: '#FAFBFC' }} contentStyle={{ borderRadius: '3px', border: '1px solid #DFE1E6', fontSize: '13px' }} />
                <Bar dataKey="Leads" fill="#0052CC" radius={[0, 3, 3, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Leads Table */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="p-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#FAFBFC]">
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#172B4D' }}>
                Recent Additions to Pipeline
              </Typography>
            </div>
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Client</TableCell>
                    <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Caller</TableCell>
                    <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentLeads.length === 0 ? (
                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: '#5E6C84' }}>No recent leads found.</TableCell></TableRow>
                  ) : (
                    recentLeads.map((lead) => (
                      <TableRow key={lead._id} hover sx={{ '& td': { borderBottom: '1px solid #DFE1E6' } }}>
                        <TableCell>
                          <div className="flex items-center gap-3 py-1">
                            <Avatar sx={{ bgcolor: '#403294', width: 28, height: 28, fontSize: '12px', fontWeight: 'bold' }}>
                              {getInitials(lead.leadName)}
                            </Avatar>
                            <div>
                              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{lead.leadName}</Typography>
                              <Typography sx={{ fontSize: '11px', color: '#6B778C' }}>{dayjs(lead.createdAt).format('MMM DD, YYYY')}</Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '13px', color: '#172B4D' }}>{lead.leadOwner || "--"}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={(lead.status || "ongoing").toUpperCase()} 
                            size="small" 
                            sx={{ 
                              height: '20px', fontSize: '10px', fontWeight: 700, borderRadius: '3px',
                              backgroundColor: lead.status === 'closed' ? '#E3FCEF' : lead.status === 'dropped' ? '#FFEBE6' : '#DEEBFF',
                              color: lead.status === 'closed' ? '#006644' : lead.status === 'dropped' ? '#DE350B' : '#0052CC',
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

      </Grid>
    </div>
  );
}

export default ManagerDashboardHome;













