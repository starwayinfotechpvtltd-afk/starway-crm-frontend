import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, isSameMonth, startOfWeek, startOfMonth, startOfYear, isAfter, isBefore } from "date-fns";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  Globe,
  Package,
  X,
  Archive,
  Target,
  UserCheck,
  Filter,
  TrendingUp,
} from "lucide-react";

// Helper for Avatar colors
const stringToColor = (string) => {
  if (!string) return "#9e9e9e";
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// Helper to safely render usernames whether the field is populated or just an ID
const renderUsername = (userField, fallback = "Unassigned") => {
  if (!userField) return fallback;
  if (typeof userField === "object") return userField.username || fallback;
  return "Assigned";
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const CHART_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

const CallerDashboard = () => {
  const [allLeads, setAllLeads] = useState([]); // Master list for charts & metrics
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [closedLeads, setClosedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog State
  const [selectedLead, setSelectedLead] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Global Chart Filter State
  const [chartFilter, setChartFilter] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch the three distinct categories
      const [allRes, closedRes, assignedRes] = await Promise.all([
        axios.get(`${API_BASE}/api/leads/all`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/leads/closed`, { headers }).catch(() => ({ data: [] })),
        // This maps to your getAllAssignedLeads backend route
        axios.get(`${API_BASE}/api/leads/assigned`, { headers }).catch(() => ({ data: [] })), 
      ]);

      const leadsData = Array.isArray(allRes.data) ? allRes.data : allRes.data.leads || [];
      const closedData = Array.isArray(closedRes.data) ? closedRes.data : closedRes.data.closedLeads || [];
      const assignedData = Array.isArray(assignedRes.data) ? assignedRes.data : assignedRes.data.assignedLeads || [];
      
      // Unassigned leads: exists in allLeads, has no assignee, and is not closed
      const unassigned = leadsData.filter(l => !l.assignedTo && l.status !== "closed");

      setAllLeads(leadsData);
      setClosedLeads(closedData);
      setAssignedLeads(assignedData);
      setUnassignedLeads(unassigned);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Metrics Calculations (4 Top Cards) ---
  const metrics = useMemo(() => {
    const now = new Date();
    
    // 1. Total Closed Leads
    const totalClosed = closedLeads.length;

    // 2. Transfers (This Month) -> Calculated strictly from allLeads
    const assignedThisMonth = allLeads.filter(
      (l) => l.assignedTo && l.assignedAt && isSameMonth(new Date(l.assignedAt), now)
    ).length;

    // 3. In Funnel (Unassigned)
    const inFunnel = unassignedLeads.length;

    // 4. Closed Leads This Month
    const closedThisMonth = closedLeads.filter(
      (l) => l.closedAt && isSameMonth(new Date(l.closedAt), now)
    ).length;

    return { 
      totalClosed, 
      assignedThisMonth, 
      inFunnel, 
      closedThisMonth 
    };
  }, [allLeads, closedLeads, unassignedLeads]);

  // --- Global Chart Filtering Logic ---
  const { chartData, pieData } = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0);
    let endDate = now;

    if (chartFilter === "week") startDate = startOfWeek(now);
    else if (chartFilter === "month") startDate = startOfMonth(now);
    else if (chartFilter === "year") startDate = startOfYear(now);
    else if (chartFilter === "custom") {
      if (customStart) startDate = new Date(customStart);
      if (customEnd) {
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    const filteredLeads = allLeads.filter((l) => {
      const date = new Date(l.createdAt);
      return isAfter(date, startDate) && isBefore(date, endDate);
    });

    const dateMap = {};
    filteredLeads.forEach(l => {
      const dateStr = format(new Date(l.createdAt), "MMM dd");
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
    });
    
    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(`${a} ${now.getFullYear()}`) - new Date(`${b} ${now.getFullYear()}`));
    const chartData = sortedDates.map(date => ({ date, leads: dateMap[date] }));

    const typeMap = {};
    filteredLeads.forEach(l => {
      const type = l.leadType || "Unspecified";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    const pieData = Object.keys(typeMap).map(key => ({ name: key, value: typeMap[key] }));

    return { chartData, pieData };
  }, [allLeads, chartFilter, customStart, customEnd]);

  const handleOpen = (lead) => {
    setSelectedLead(lead);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedLead(null);
  };

  // --- Subcomponents ---
  const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="600" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="base" color="text.primary">
            {value}
          </Typography>
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: bg, color: color, display: "flex" }}>
          <Icon size={24} />
        </Box>
      </Box>
    </Paper>
  );

  const JiraStyleRow = ({ lead }) => {
    const isClosed = lead.status?.toLowerCase() === "closed";
    const safeName = lead.leadName || "?";
    
    return (
      <Paper
        elevation={0}
        component={motion.div}
        variants={itemVariants}
        onClick={() => handleOpen(lead)}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1.5,
          mb: 1,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": { bgcolor: "grey.50", borderColor: "primary.light" },
        }}
      >
        <Box display="flex" alignItems="center" gap={2} flex={2} minWidth={200}>
          <Avatar sx={{ bgcolor: stringToColor(safeName), width: 36, height: 36, fontSize: '0.9rem', fontWeight: 600 }}>
            {safeName[0].toUpperCase()}
          </Avatar>
          <Box overflow="hidden">
            <Typography variant="subtitle2" fontWeight="600" noWrap>{lead.leadName}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">{lead.email}</Typography>
          </Box>
        </Box>
        <Box flex={1} minWidth={120}>
          <Chip 
            label={lead.leadType || "New"} 
            size="small" 
            sx={{ borderRadius: 1, height: 24, bgcolor: 'indigo.50', color: 'indigo.700', fontWeight: 500 }} 
          />
        </Box>
        <Box flex={1.5} minWidth={150}>
           <Typography variant="caption" color={lead.assignedTo ? "text.primary" : "text.secondary"}>
              {renderUsername(lead.assignedTo)}
           </Typography>
        </Box>
        <Box flex={1} minWidth={100}>
          <Typography variant="caption" color="text.secondary">
            {new Date(lead.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Box flex={0.5} minWidth={80} display="flex" justifyContent="flex-end">
           {isClosed ? (
             <Chip label="Closed" color="error" size="small" sx={{ borderRadius: 1, height: 24, fontSize: '0.7rem' }} />
           ) : (
             <Chip label={lead.status || "Open"} color="default" size="small" sx={{ borderRadius: 1, height: 24, fontSize: '0.7rem' }} />
           )}
        </Box>
      </Paper>
    );
  };

  // Reusable Section Component for the 3 Lists
  const LeadListSection = ({ title, leads }) => (
    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
      <Typography variant="subtitle1" fontWeight="base" mb={3}>
        {title} <Chip size="small" label={leads.length} sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
      </Typography>
      
      <Box display={{ xs: 'none', md: 'flex' }} px={1.5} pb={1} borderBottom="1px solid" borderColor="divider" mb={2}>
        <Typography variant="caption" fontWeight="600" color="text.secondary" flex={2} minWidth={200}>Contact</Typography>
        <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1} minWidth={120}>Type</Typography>
        <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1.5} minWidth={150}>Assignee</Typography>
        <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1} minWidth={100}>Created</Typography>
        <Typography variant="caption" fontWeight="600" color="text.secondary" flex={0.5} minWidth={80} align="right">Status</Typography>
      </Box>

      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show">
        {leads.length === 0 ? (
          <Box textAlign="center" py={4} bgcolor="grey.50" borderRadius={1} border="1px dashed" borderColor="divider">
            <Typography variant="subtitle2" color="text.secondary">No leads found in this section.</Typography>
          </Box>
        ) : (
          leads.map((lead) => <JiraStyleRow key={lead._id} lead={lead} />)
        )}
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 'xl', mx: 'auto', p: { xs: 2, md: 4 }, bgcolor: '#fff', minHeight: '100vh' }}>
      
      {/* Header & Global Filters */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} gap={2}>
        <Typography variant="h5" fontWeight="base" color="text.primary">
          What did you do this month?
        </Typography>

        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, px: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Filter size={18} className="text-gray-500" />
            <Typography variant="subtitle2" color="text.secondary">Global Filter:</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              sx={{ borderRadius: 1, '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, bgcolor: 'grey.50' }}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="custom">Custom Date</MenuItem>
            </Select>
          </FormControl>
          {chartFilter === "custom" && (
            <Box display="flex" gap={1}>
              <TextField type="date" size="small" value={customStart} onChange={(e) => setCustomStart(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'grey.50' } }} />
              <TextField type="date" size="small" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'grey.50' } }} />
            </Box>
          )}
        </Paper>
      </Box>

      {/* 4 Top Metric Cards */}
      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <motion.div variants={itemVariants}>
              <StatCard title="Total Closed Leads" value={metrics.totalClosed} icon={Archive} color="#16a34a" bg="#dcfce7" />
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <motion.div variants={itemVariants}>
              <StatCard title="Transfers (This Month)" value={metrics.assignedThisMonth} icon={UserCheck} color="#2563eb" bg="#dbeafe" />
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <motion.div variants={itemVariants}>
              <StatCard title="In Funnel (Unassigned)" value={metrics.inFunnel} icon={Target} color="#ea580c" bg="#ffedd5" />
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <motion.div variants={itemVariants}>
              <StatCard title="Closed (This Month)" value={metrics.closedThisMonth} icon={TrendingUp} color="#9333ea" bg="#f3e8ff" />
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", height: 400 }}>
            <Typography variant="subtitle1" fontWeight="base" mb={3}>Lead Acquisition Trend</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", height: 400 }}>
            <Typography variant="subtitle1" fontWeight="base" mb={1}>Lead Type Distribution</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* The 3 Distinct Lead Sections */}
      <LeadListSection title="1. In Funnel (Unassigned)" leads={unassignedLeads} />
      {/* assignedLeads is populated directly from the /api/leads/assigned endpoint */}
      {/* <LeadListSection title="2. Active Transfers (Assigned)" leads={assignedLeads} /> */}
      <LeadListSection title="3. Closed Deals" leads={closedLeads} />

      {/* Modern Lead Details Modal */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, pt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Lead Details</Typography>
          <IconButton onClick={handleClose} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedLead && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: stringToColor(selectedLead.leadName), width: 56, height: 56, fontSize: '1.5rem', fontWeight: 200 }}>
                  {selectedLead.leadName ? selectedLead.leadName[0].toUpperCase() : "?"}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" lineHeight={1}>{selectedLead.leadName}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {selectedLead.designation || "No Designation"} • {selectedLead.email}
                  </Typography>
                </Box>
              </Grid>
              
              {[
                { label: "Phone", value: selectedLead.phoneNumber, icon: Phone },
                { label: "Website", value: selectedLead.website || "N/A", icon: Globe },
                { label: "Country", value: selectedLead.country },
                { label: "Lead Type", value: selectedLead.leadType },
                { label: "Lead Owner", value: selectedLead.leadOwner || "N/A" },
                { label: "Status", value: selectedLead.status },
                { label: "Assigned To", value: renderUsername(selectedLead.assignedTo) },
                { label: "Assigned By", value: renderUsername(selectedLead.assignedBy, selectedLead.leadOwner || "N/A") },
                { label: "Created At", value: new Date(selectedLead.createdAt).toLocaleString() },
                { label: "Closed At", value: selectedLead.closedAt ? new Date(selectedLead.closedAt).toLocaleString() : "N/A" },
                { label: "Pitched Amount", value: `${selectedLead.currencySymbol || ""} ${selectedLead.pitchedAmount || 0}` },
                { label: "Packages", value: selectedLead.packages?.join(", ") || "None", fullWidth: true },
                { label: "Note", value: selectedLead.note || "No notes available", fullWidth: true },
              ].map((field, idx) => (
                <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={idx}>
                  <Box sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 1, border: '1px solid', borderColor: 'divider', height: "100%" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="flex" alignItems="center" gap={1}>
                      {field.icon && <field.icon size={14} />} {field.label}
                    </Typography>
                    <Typography variant="body2" color="text.primary" mt={0.5} sx={{ wordBreak: 'break-word' }}>
                      {field.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="contained" disableElevation size="small" sx={{ borderRadius: 1, textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CallerDashboard;