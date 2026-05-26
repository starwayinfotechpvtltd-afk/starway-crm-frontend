// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import {
//   Typography,
//   Box,
//   Grid,
//   TextField,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Avatar,
//   Chip,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Paper,
//   CircularProgress,
//   IconButton,
// } from "@mui/material";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";
// import { format, isSameMonth, startOfWeek, startOfMonth, startOfYear, isAfter, isBefore } from "date-fns";
// import { motion } from "framer-motion";
// import {
//   Phone,
//   Mail,
//   Globe,
//   Package,
//   X,
//   Archive,
//   Target,
//   UserCheck,
//   Filter,
//   TrendingUp,
// } from "lucide-react";

// // Helper for Avatar colors
// const stringToColor = (string) => {
//   if (!string) return "#9e9e9e";
//   let hash = 0;
//   for (let i = 0; i < string.length; i += 1) {
//     hash = string.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   let color = "#";
//   for (let i = 0; i < 3; i += 1) {
//     const value = (hash >> (i * 8)) & 0xff;
//     color += `00${value.toString(16)}`.slice(-2);
//   }
//   return color;
// };

// // Helper to safely render usernames whether the field is populated or just an ID
// const renderUsername = (userField, fallback = "Unassigned") => {
//   if (!userField) return fallback;
//   if (typeof userField === "object") return userField.username || fallback;
//   return "Assigned";
// };

// // Animation Variants
// const containerVariants = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.1 },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
// };

// const CHART_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

// const CallerDashboard = () => {
//   const [allLeads, setAllLeads] = useState([]); // Master list for charts & metrics
//   const [unassignedLeads, setUnassignedLeads] = useState([]);
//   const [assignedLeads, setAssignedLeads] = useState([]);
//   const [closedLeads, setClosedLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Dialog State
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);

//   // Global Chart Filter State
//   const [chartFilter, setChartFilter] = useState("month");
//   const [customStart, setCustomStart] = useState("");
//   const [customEnd, setCustomEnd] = useState("");

//   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const headers = { Authorization: `Bearer ${token}` };

//       // Fetch the three distinct categories
//       const [allRes, closedRes, assignedRes] = await Promise.all([
//         axios.get(`${API_BASE}/api/leads/all`, { headers }).catch(() => ({ data: [] })),
//         axios.get(`${API_BASE}/api/leads/closed`, { headers }).catch(() => ({ data: [] })),
//         // This maps to your getAllAssignedLeads backend route
//         axios.get(`${API_BASE}/api/leads/assigned`, { headers }).catch(() => ({ data: [] })), 
//       ]);

//       const leadsData = Array.isArray(allRes.data) ? allRes.data : allRes.data.leads || [];
//       const closedData = Array.isArray(closedRes.data) ? closedRes.data : closedRes.data.closedLeads || [];
//       const assignedData = Array.isArray(assignedRes.data) ? assignedRes.data : assignedRes.data.assignedLeads || [];
      
//       // Unassigned leads: exists in allLeads, has no assignee, and is not closed
//       const unassigned = leadsData.filter(l => !l.assignedTo && l.status !== "closed");

//       setAllLeads(leadsData);
//       setClosedLeads(closedData);
//       setAssignedLeads(assignedData);
//       setUnassignedLeads(unassigned);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Metrics Calculations (4 Top Cards) ---
//   const metrics = useMemo(() => {
//     const now = new Date();
    
//     // 1. Total Closed Leads
//     const totalClosed = closedLeads.length;

//     // 2. Transfers (This Month) -> Calculated strictly from allLeads
//     const assignedThisMonth = allLeads.filter(
//       (l) => l.assignedTo && l.assignedAt && isSameMonth(new Date(l.assignedAt), now)
//     ).length;

//     // 3. In Funnel (Unassigned)
//     const inFunnel = unassignedLeads.length;

//     // 4. Closed Leads This Month
//     const closedThisMonth = closedLeads.filter(
//       (l) => l.closedAt && isSameMonth(new Date(l.closedAt), now)
//     ).length;

//     return { 
//       totalClosed, 
//       assignedThisMonth, 
//       inFunnel, 
//       closedThisMonth 
//     };
//   }, [allLeads, closedLeads, unassignedLeads]);

//   // --- Global Chart Filtering Logic ---
//   const { chartData, pieData } = useMemo(() => {
//     const now = new Date();
//     let startDate = new Date(0);
//     let endDate = now;

//     if (chartFilter === "week") startDate = startOfWeek(now);
//     else if (chartFilter === "month") startDate = startOfMonth(now);
//     else if (chartFilter === "year") startDate = startOfYear(now);
//     else if (chartFilter === "custom") {
//       if (customStart) startDate = new Date(customStart);
//       if (customEnd) {
//         endDate = new Date(customEnd);
//         endDate.setHours(23, 59, 59, 999);
//       }
//     }

//     const filteredLeads = allLeads.filter((l) => {
//       const date = new Date(l.createdAt);
//       return isAfter(date, startDate) && isBefore(date, endDate);
//     });

//     const dateMap = {};
//     filteredLeads.forEach(l => {
//       const dateStr = format(new Date(l.createdAt), "MMM dd");
//       dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
//     });
    
//     const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(`${a} ${now.getFullYear()}`) - new Date(`${b} ${now.getFullYear()}`));
//     const chartData = sortedDates.map(date => ({ date, leads: dateMap[date] }));

//     const typeMap = {};
//     filteredLeads.forEach(l => {
//       const type = l.leadType || "Unspecified";
//       typeMap[type] = (typeMap[type] || 0) + 1;
//     });
//     const pieData = Object.keys(typeMap).map(key => ({ name: key, value: typeMap[key] }));

//     return { chartData, pieData };
//   }, [allLeads, chartFilter, customStart, customEnd]);

//   const handleOpen = (lead) => {
//     setSelectedLead(lead);
//     setOpenDialog(true);
//   };

//   const handleClose = () => {
//     setOpenDialog(false);
//     setSelectedLead(null);
//   };

//   // --- Subcomponents ---
//   const StatCard = ({ title, value, icon: Icon, color, bg }) => (
//     <Paper elevation={0} sx={{ p: 2.5, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", height: '100%' }}>
//       <Box display="flex" justifyContent="space-between" alignItems="flex-start">
//         <Box>
//           <Typography variant="body2" color="text.secondary" fontWeight="600" gutterBottom>
//             {title}
//           </Typography>
//           <Typography variant="h4" fontWeight="base" color="text.primary">
//             {value}
//           </Typography>
//         </Box>
//         <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: bg, color: color, display: "flex" }}>
//           <Icon size={24} />
//         </Box>
//       </Box>
//     </Paper>
//   );

//   const JiraStyleRow = ({ lead }) => {
//     const isClosed = lead.status?.toLowerCase() === "closed";
//     const safeName = lead.leadName || "?";
    
//     return (
//       <Paper
//         elevation={0}
//         component={motion.div}
//         variants={itemVariants}
//         onClick={() => handleOpen(lead)}
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           p: 1.5,
//           mb: 1,
//           borderRadius: 1,
//           border: "1px solid",
//           borderColor: "divider",
//           boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
//           cursor: "pointer",
//           transition: "all 0.2s",
//           "&:hover": { bgcolor: "grey.50", borderColor: "primary.light" },
//         }}
//       >
//         <Box display="flex" alignItems="center" gap={2} flex={2} minWidth={200}>
//           <Avatar sx={{ bgcolor: stringToColor(safeName), width: 36, height: 36, fontSize: '0.9rem', fontWeight: 600 }}>
//             {safeName[0].toUpperCase()}
//           </Avatar>
//           <Box overflow="hidden">
//             <Typography variant="subtitle2" fontWeight="600" noWrap>{lead.leadName}</Typography>
//             <Typography variant="caption" color="text.secondary" noWrap display="block">{lead.email}</Typography>
//           </Box>
//         </Box>
//         <Box flex={1} minWidth={120}>
//           <Chip 
//             label={lead.leadType || "New"} 
//             size="small" 
//             sx={{ borderRadius: 1, height: 24, bgcolor: 'indigo.50', color: 'indigo.700', fontWeight: 500 }} 
//           />
//         </Box>
//         <Box flex={1.5} minWidth={150}>
//            <Typography variant="caption" color={lead.assignedTo ? "text.primary" : "text.secondary"}>
//               {renderUsername(lead.assignedTo)}
//            </Typography>
//         </Box>
//         <Box flex={1} minWidth={100}>
//           <Typography variant="caption" color="text.secondary">
//             {new Date(lead.createdAt).toLocaleDateString()}
//           </Typography>
//         </Box>
//         <Box flex={0.5} minWidth={80} display="flex" justifyContent="flex-end">
//            {isClosed ? (
//              <Chip label="Closed" color="error" size="small" sx={{ borderRadius: 1, height: 24, fontSize: '0.7rem' }} />
//            ) : (
//              <Chip label={lead.status || "Open"} color="default" size="small" sx={{ borderRadius: 1, height: 24, fontSize: '0.7rem' }} />
//            )}
//         </Box>
//       </Paper>
//     );
//   };

//   // Reusable Section Component for the 3 Lists
//   const LeadListSection = ({ title, leads }) => (
//     <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
//       <Typography variant="subtitle1" fontWeight="base" mb={3}>
//         {title} <Chip size="small" label={leads.length} sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
//       </Typography>
      
//       <Box display={{ xs: 'none', md: 'flex' }} px={1.5} pb={1} borderBottom="1px solid" borderColor="divider" mb={2}>
//         <Typography variant="caption" fontWeight="600" color="text.secondary" flex={2} minWidth={200}>Contact</Typography>
//         <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1} minWidth={120}>Type</Typography>
//         <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1.5} minWidth={150}>Assignee</Typography>
//         <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1} minWidth={100}>Created</Typography>
//         <Typography variant="caption" fontWeight="600" color="text.secondary" flex={0.5} minWidth={80} align="right">Status</Typography>
//       </Box>

//       <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show">
//         {leads.length === 0 ? (
//           <Box textAlign="center" py={4} bgcolor="grey.50" borderRadius={1} border="1px dashed" borderColor="divider">
//             <Typography variant="subtitle2" color="text.secondary">No leads found in this section.</Typography>
//           </Box>
//         ) : (
//           leads.map((lead) => <JiraStyleRow key={lead._id} lead={lead} />)
//         )}
//       </Box>
//     </Paper>
//   );

//   if (loading) {
//     return (
//       <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
//         <CircularProgress size={40} />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ width: '100%', maxWidth: 'xl', mx: 'auto', p: { xs: 2, md: 4 }, bgcolor: '#fff', minHeight: '100vh' }}>
      
//       {/* Header & Global Filters */}
//       <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} gap={2}>
//         <Typography variant="h5" fontWeight="base" color="text.primary">
//           What did you do this month?
//         </Typography>

//         <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, px: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
//           <Box display="flex" alignItems="center" gap={1}>
//             <Filter size={18} className="text-gray-500" />
//             <Typography variant="subtitle2" color="text.secondary">Global Filter:</Typography>
//           </Box>
//           <FormControl size="small" sx={{ minWidth: 120 }}>
//             <Select
//               value={chartFilter}
//               onChange={(e) => setChartFilter(e.target.value)}
//               sx={{ borderRadius: 1, '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, bgcolor: 'grey.50' }}
//             >
//               <MenuItem value="week">This Week</MenuItem>
//               <MenuItem value="month">This Month</MenuItem>
//               <MenuItem value="year">This Year</MenuItem>
//               <MenuItem value="custom">Custom Date</MenuItem>
//             </Select>
//           </FormControl>
//           {chartFilter === "custom" && (
//             <Box display="flex" gap={1}>
//               <TextField type="date" size="small" value={customStart} onChange={(e) => setCustomStart(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'grey.50' } }} />
//               <TextField type="date" size="small" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'grey.50' } }} />
//             </Box>
//           )}
//         </Paper>
//       </Box>

//       {/* 4 Top Metric Cards */}
//       <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" mb={4}>
//         <Grid container spacing={3}>
//           <Grid item xs={12} sm={6} lg={3}>
//             <motion.div variants={itemVariants}>
//               <StatCard title="Total Closed Leads" value={metrics.totalClosed} icon={Archive} color="#16a34a" bg="#dcfce7" />
//             </motion.div>
//           </Grid>
//           <Grid item xs={12} sm={6} lg={3}>
//             <motion.div variants={itemVariants}>
//               <StatCard title="Transfers (This Month)" value={metrics.assignedThisMonth} icon={UserCheck} color="#2563eb" bg="#dbeafe" />
//             </motion.div>
//           </Grid>
//           <Grid item xs={12} sm={6} lg={3}>
//             <motion.div variants={itemVariants}>
//               <StatCard title="In Funnel (Unassigned)" value={metrics.inFunnel} icon={Target} color="#ea580c" bg="#ffedd5" />
//             </motion.div>
//           </Grid>
//           <Grid item xs={12} sm={6} lg={3}>
//             <motion.div variants={itemVariants}>
//               <StatCard title="Closed (This Month)" value={metrics.closedThisMonth} icon={TrendingUp} color="#9333ea" bg="#f3e8ff" />
//             </motion.div>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Charts Section */}
//       <Grid container spacing={3} mb={4}>
//         <Grid item xs={12} lg={8}>
//           <Paper elevation={0} sx={{ p: 3, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", height: 400 }}>
//             <Typography variant="subtitle1" fontWeight="base" mb={3}>Lead Acquisition Trend</Typography>
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
//                 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
//                 <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
//                 <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
//               </AreaChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>

//         <Grid item xs={12} lg={4}>
//           <Paper elevation={0} sx={{ p: 3, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", height: 400 }}>
//             <Typography variant="subtitle1" fontWeight="base" mb={1}>Lead Type Distribution</Typography>
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
//                 <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
//               </PieChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>
//       </Grid>

//       {/* The 3 Distinct Lead Sections */}
//       <LeadListSection title="1. In Funnel (Unassigned)" leads={unassignedLeads} />
//       {/* assignedLeads is populated directly from the /api/leads/assigned endpoint */}
//       {/* <LeadListSection title="2. Active Transfers (Assigned)" leads={assignedLeads} /> */}
//       <LeadListSection title="3. Closed Deals" leads={closedLeads} />

//       {/* Modern Lead Details Modal */}
//       <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
//         <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, pt: 2 }}>
//           <Typography variant="subtitle1" fontWeight="bold">Lead Details</Typography>
//           <IconButton onClick={handleClose} size="small">
//             <X size={18} />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent dividers sx={{ p: 3 }}>
//           {selectedLead && (
//             <Grid container spacing={2.5}>
//               <Grid item xs={12} display="flex" alignItems="center" gap={2} mb={2}>
//                 <Avatar sx={{ bgcolor: stringToColor(selectedLead.leadName), width: 56, height: 56, fontSize: '1.5rem', fontWeight: 200 }}>
//                   {selectedLead.leadName ? selectedLead.leadName[0].toUpperCase() : "?"}
//                 </Avatar>
//                 <Box>
//                   <Typography variant="h6" fontWeight="bold" lineHeight={1}>{selectedLead.leadName}</Typography>
//                   <Typography variant="body2" color="text.secondary" mt={0.5}>
//                     {selectedLead.designation || "No Designation"} • {selectedLead.email}
//                   </Typography>
//                 </Box>
//               </Grid>
              
//               {[
//                 { label: "Phone", value: selectedLead.phoneNumber, icon: Phone },
//                 { label: "Website", value: selectedLead.website || "N/A", icon: Globe },
//                 { label: "Country", value: selectedLead.country },
//                 { label: "Lead Type", value: selectedLead.leadType },
//                 { label: "Lead Owner", value: selectedLead.leadOwner || "N/A" },
//                 { label: "Status", value: selectedLead.status },
//                 { label: "Assigned To", value: renderUsername(selectedLead.assignedTo) },
//                 { label: "Assigned By", value: renderUsername(selectedLead.assignedBy, selectedLead.leadOwner || "N/A") },
//                 { label: "Created At", value: new Date(selectedLead.createdAt).toLocaleString() },
//                 { label: "Closed At", value: selectedLead.closedAt ? new Date(selectedLead.closedAt).toLocaleString() : "N/A" },
//                 { label: "Pitched Amount", value: `${selectedLead.currencySymbol || ""} ${selectedLead.pitchedAmount || 0}` },
//                 { label: "Packages", value: selectedLead.packages?.join(", ") || "None", fullWidth: true },
//                 { label: "Note", value: selectedLead.note || "No notes available", fullWidth: true },
//               ].map((field, idx) => (
//                 <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={idx}>
//                   <Box sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 1, border: '1px solid', borderColor: 'divider', height: "100%" }}>
//                     <Typography variant="caption" color="text.secondary" fontWeight="600" display="flex" alignItems="center" gap={1}>
//                       {field.icon && <field.icon size={14} />} {field.label}
//                     </Typography>
//                     <Typography variant="body2" color="text.primary" mt={0.5} sx={{ wordBreak: 'break-word' }}>
//                       {field.value}
//                     </Typography>
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button onClick={handleClose} variant="contained" disableElevation size="small" sx={{ borderRadius: 1, textTransform: 'none' }}>
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default CallerDashboard;




















import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  Typography, Box, Grid, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Avatar, Chip, Select, MenuItem,
  FormControl, Paper, CircularProgress, IconButton, Tabs, Tab,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Pagination, Stack, Tooltip, Badge, InputAdornment, Snackbar, Alert, Drawer, Divider
} from "@mui/material";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { motion } from "framer-motion";
import {
  Phone, Globe, X, Target, UserCheck, Filter, MessageSquare, Eye,
  Send, Clock, Briefcase, RotateCcw, Save, Search as SearchIcon
} from "lucide-react";

dayjs.extend(isBetween);

const LEAD_TYPE_CONFIG = {
  "Hot Lead": { color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
  "Contacted": { color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
  "Contact in Future": { color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" },
  "Callback": { color: "#d97706", bg: "#fffbeb", border: "#fef3c7" },
  "New Lead": { color: "#059669", bg: "#ecfdf5", border: "#d1fae5" },
};

const CHART_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];
const CACHE_KEY_DASHBOARD = "crm_dashboard_leads";
const CACHE_KEY_FILTER = "crm_dashboard_filter";

const noSelectSx = { userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", cursor: "default" };

const CallerDashboard = () => {
  // --- Global States & Caching ---
  const [globalPeriod, setGlobalPeriod] = useState(() => sessionStorage.getItem(CACHE_KEY_FILTER) || "week");
  const [leads, setLeads] = useState(() => {
    const saved = sessionStorage.getItem(CACHE_KEY_DASHBOARD);
    return saved ? JSON.parse(saved) : [];
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // --- Table/List States ---
  const [activeTab, setActiveTab] = useState(0); // 0 = Ongoing, 1 = Assigned
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  
  // Table Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // Modal & Drawer States
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [editLeadType, setEditLeadType] = useState("");
  const [newComment, setNewComment] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const chatScrollRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
  const token = localStorage.getItem("token");

  // --- Fetch Logic (Triggered on Period Change or First Load) ---
  useEffect(() => {
    sessionStorage.setItem(CACHE_KEY_FILTER, globalPeriod);
    fetchDashboardData(globalPeriod);
  }, [globalPeriod]);

  // Sync cache when leads array updates (like adding comments or editing)
  useEffect(() => {
    sessionStorage.setItem(CACHE_KEY_DASHBOARD, JSON.stringify(leads));
  }, [leads]);

  // Auto-scroll chat
  useEffect(() => {
    if (isChatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedLead?.comments, isChatOpen]);

  const fetchDashboardData = async (period) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Calculate Date Ranges based on period to save bandwidth
      const now = dayjs();
      let startDate, endDate = now.toISOString();

      if (period === "week") startDate = now.startOf('week').toISOString();
      else if (period === "month") startDate = now.startOf('month').toISOString();
      else if (period === "year") startDate = now.startOf('year').toISOString();
      else startDate = dayjs(0).toISOString(); // "all"

      // Pass dates to backend (If backend ignores queries, client-side filter handles it below)
      const [leadsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/leads/all`, { headers, params: { startDate, endDate } }),
        axios.get(`${API_BASE}/api/auth/admins-managers`, { headers })
      ]);

      let fetchedLeads = Array.isArray(leadsRes.data) ? leadsRes.data : (leadsRes.data.leads || []);
      
      // Strict Client-Side Filter: Remove Closed/Dropped & Enforce Date Window
      fetchedLeads = fetchedLeads.filter(l => {
        if (l.status === "closed" || l.status === "dropped") return false;
        const leadDate = dayjs(l.createdAt);
        return leadDate.isBetween(startDate, endDate, 'day', '[]');
      });

      setLeads(fetchedLeads);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userRef) => {
    if (!userRef) return "System/Agent";
    if (typeof userRef === "object" && userRef.username) return userRef.username;
    const foundUser = users.find(u => u._id === userRef);
    return foundUser ? foundUser.username : "Agent";
  };

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  // --- Lead Actions (Same as AllLeads) ---
  const handleOpenDetails = (lead) => {
    setSelectedLead(lead);
    setEditNote(lead.note || "");
    setEditLeadType(lead.leadType || "");
    setIsDetailsOpen(true);
  };

  const handleOpenChat = (lead) => {
    setSelectedLead(lead);
    setIsChatOpen(true);
  };

  const handleUpdateLeadDetails = async () => {
    setUpdating(true);
    try {
      const res = await axios.put(`${API_BASE}/api/leads/${selectedLead._id}`, { note: editNote, leadType: editLeadType }, { headers: { Authorization: `Bearer ${token}` } });
      setLeads(prev => prev.map(l => l._id === selectedLead._id ? res.data : l));
      setSelectedLead(res.data);
      showToast("Lead updated successfully");
      setIsDetailsOpen(false);
    } catch (err) { showToast("Failed to update lead", "error"); } 
    finally { setUpdating(false); }
  };

  const handleUpdateFollowUp = async (leadId, date) => {
    try {
      await axios.put(`${API_BASE}/api/leads/${leadId}/follow-up`, { followUpDate: date }, { headers: { Authorization: `Bearer ${token}` } });
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, followUpDate: date } : l));
      showToast("Follow-up updated");
    } catch (err) { showToast("Update failed", "error"); }
  };

  const handleAssign = async (leadId, userId) => {
    if (!userId) return;
    try {
      const res = await axios.put(`${API_BASE}/api/leads/assign/${leadId}`, { userId, assignedAt: new Date() }, { headers: { Authorization: `Bearer ${token}` } });
      setLeads(prev => prev.map(l => l._id === leadId ? res.data : l));
      showToast("Lead assigned successfully");
    } catch (err) { showToast("Assignment failed", "error"); }
  };

  const handleAddComment = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/api/leads/${selectedLead._id}/comments`, { text: newComment }, { headers: { Authorization: `Bearer ${token}` } });
      setLeads(prev => prev.map(l => l._id === selectedLead._id ? res.data : l));
      setSelectedLead(res.data); 
      setNewComment("");
    } catch (err) { showToast("Failed to send message", "error"); }
  };

  // --- Filtering & Sorting Data ---
  const filteredTableLeads = useMemo(() => {
    return leads.filter(lead => {
      const isAssigned = !!lead.assignedTo;
      if (activeTab === 0 && isAssigned) return false;
      if (activeTab === 1 && !isAssigned) return false;

      const matchesSearch = lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) || lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filterType !== "all" && lead.leadType !== filterType) return false;
      return true;
    });
  }, [leads, activeTab, searchTerm, filterType]);

  const sortedTableLeads = useMemo(() => {
    const arr = [...filteredTableLeads];
    if (sortBy === "newest") {
      arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === "comments") {
      arr.sort((a, b) => {
        const aTime = a.comments?.length ? new Date(a.comments[a.comments.length - 1].postedAt).getTime() : 0;
        const bTime = b.comments?.length ? new Date(b.comments[b.comments.length - 1].postedAt).getTime() : 0;
        return bTime - aTime;
      });
    } else if (sortBy === "followup") {
      arr.sort((a, b) => {
        if (!a.followUpDate) return 1;
        if (!b.followUpDate) return -1;
        return new Date(a.followUpDate) - new Date(b.followUpDate);
      });
    }
    return arr;
  }, [filteredTableLeads, sortBy]);

  const paginatedLeads = sortedTableLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  // --- Chart Processing ---
  const { chartData, pieData } = useMemo(() => {
    const dateMap = {};
    leads.forEach(l => {
      const dateStr = dayjs(l.createdAt).format("MMM DD");
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
    });
    const sortedDates = Object.keys(dateMap).sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
    const processedChartData = sortedDates.map(date => ({ date, leads: dateMap[date] }));

    const typeMap = {};
    leads.forEach(l => {
      const type = l.leadType || "Unspecified";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    const processedPieData = Object.keys(typeMap).map(key => ({ name: key, value: typeMap[key] }));

    return { chartData: processedChartData, pieData: processedPieData };
  }, [leads]);

  const stats = useMemo(() => ({
    total: leads.length,
    ongoing: leads.filter(l => !l.assignedTo).length,
    assigned: leads.filter(l => !!l.assignedTo).length,
    comments: leads.reduce((acc, l) => acc + (l.comments?.length || 0), 0)
  }), [leads]);

  const getLeadTypeStyle = (type) => LEAD_TYPE_CONFIG[type] || { color: "#4b5563", bg: "#f3f4f6", border: "#e5e7eb" };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto', p: { xs: 2, md: 3 }, bgcolor: '#f1f5f9', minHeight: '100vh' }}>
        
        {/* Header & Global Period Filter */}
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={3} gap={2}>
          <Box>
            <Typography variant="h5" fontWeight="500" color="#0f172a">Leads Pipeline Dashboard</Typography>
            <Typography variant="body2" color="#64748b">Manage ongoing interactions and assigned transfers.</Typography>
          </Box>

          <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 0.8, px: 2, borderRadius: "4px", border: '1px solid #e2e8f0' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Filter size={16} color="#64748b" />
              <Typography variant="body2" color="#475569" fontWeight={600}>Data Period:</Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={globalPeriod}
                onChange={(e) => setGlobalPeriod(e.target.value)}
                sx={{ borderRadius: "4px", height: "34px", fontSize: "14px", bgcolor: "#f8fafc" }}
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Box>

        {/* 4 Top Metric Cards */}
        <Grid container spacing={3} mb={3}>
          {[
            { title: "Total Active Leads", value: stats.total, icon: Target, color: "#ea580c", bg: "#ffedd5" },
            { title: "Ongoing Pipeline", value: stats.ongoing, icon: Briefcase, color: "#2563eb", bg: "#dbeafe" },
            { title: "Assigned Pipeline", value: stats.assigned, icon: UserCheck, color: "#16a34a", bg: "#dcfce7" },
            { title: "Total Discussions", value: stats.comments, icon: MessageSquare, color: "#9333ea", bg: "#f3e8ff" },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} lg={3} key={idx}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: "4px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{item.title}</Typography>
                  <Typography variant="h4" sx={{ color: "#0f172a", fontWeight: 500, mt: 0.5 }}>{item.value}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "4px", bgcolor: item.bg, color: item.color, display: "flex" }}>
                  <item.icon size={22} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "4px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", height: 350 }}>
              <Typography variant="subtitle2" fontWeight="700" color="#334155" mb={3}>Acquisition Trend ({globalPeriod})</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "4px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", height: 350 }}>
              <Typography variant="subtitle2" fontWeight="700" color="#334155" mb={1}>Classification Distribution</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* --- Data Table Management --- */}
        <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: "4px", overflow: "hidden", bgcolor: "#fff", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <Box sx={{ borderBottom: "1px solid #e2e8f0", px: 3, pt: 1, bgcolor: "#fafafa" }}>
            <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setPage(1); }} TabIndicatorProps={{ sx: { height: 3 } }} sx={{ minHeight: 48, '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '14px' } }}>
              <Tab label={`Ongoing Pipeline (${stats.ongoing})`} />
              <Tab label={`Assigned Pipeline (${stats.assigned})`} />
            </Tabs>
          </Box>

          <Box sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField fullWidth size="small" placeholder="Search name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <SearchIcon size={16} style={{ marginRight: 8, color: "#94a3b8" }} /> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
              </Grid>
              <Grid item xs={12} sm={4} md={2.5}>
                <FormControl fullWidth size="small">
                  <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} sx={{ borderRadius: '4px' }}>
                    <MenuItem value="all">All Classifications</MenuItem>
                    {Object.keys(LEAD_TYPE_CONFIG).map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={2.5}>
                <FormControl fullWidth size="small">
                  <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{ borderRadius: '4px' }}>
                    <MenuItem value="newest">Newly Added</MenuItem>
                    <MenuItem value="comments">New Comments</MenuItem>
                    <MenuItem value="followup">Upcoming Followup</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={1.5}>
                <Button fullWidth variant="outlined" onClick={() => { setSearchTerm(""); setFilterType("all"); setSortBy("newest"); setPage(1); }} startIcon={<RotateCcw size={14} />} sx={{ borderRadius: '4px', textTransform: 'none', fontWeight: 600, height: "40px" }}>Reset</Button>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ color: "#64748b", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" }}>LEAD IDENTITY & UPDATES</TableCell>
                  <TableCell sx={{ color: "#64748b", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" }}>CLASSIFICATION</TableCell>
                  <TableCell sx={{ color: "#64748b", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" }}>FOLLOW-UP WINDOW</TableCell>
                  <TableCell sx={{ color: "#64748b", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" }}>{activeTab === 1 ? "ASSIGNED AGENT" : "SOURCE CREATOR"}</TableCell>
                  <TableCell align="right" sx={{ color: "#64748b", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" }}>MANAGEMENT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}><CircularProgress size={30} /></TableCell></TableRow> :
                  paginatedLeads.map((lead) => {
                    const latestComment = lead.comments && lead.comments.length > 0 ? lead.comments[lead.comments.length - 1] : null;
                    return (
                      <TableRow key={lead._id} sx={{ '&:hover': { bgcolor: "#f8fafc" }, transition: "background-color 0.2s" }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar sx={{ width: 38, height: 38, fontSize: 13, fontWeight: 600, bgcolor: "#e0f2fe", color: "#0284c7", mt: 0.5 }}>
                              {lead.leadName?.charAt(0)}
                            </Avatar>
                            <Box sx={{ ...noSelectSx, display: "flex", flexDirection: "column" }}>
                              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{lead.leadName}</Typography>
                              <Typography sx={{ fontSize: "12px", color: "#64748b" }}>{lead.email}</Typography>
                              {latestComment && (
                                <Tooltip title={`${getUserName(latestComment.postedBy)}: ${latestComment.text}`}>
                                  <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5, maxWidth: "220px" }}>
                                    <MessageSquare size={12} color="#94a3b8" />
                                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      <span style={{ fontWeight: 600 }}>{getUserName(latestComment.postedBy)}:</span> {latestComment.text}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell><Chip label={lead.leadType} size="small" sx={{ fontSize: "11px", fontWeight: 700, borderRadius: "4px", color: getLeadTypeStyle(lead.leadType).color, bgcolor: getLeadTypeStyle(lead.leadType).bg, border: `1px solid ${getLeadTypeStyle(lead.leadType).border}` }} /></TableCell>
                        <TableCell>
                          {activeTab === 0 ? 
                            <DatePicker value={lead.followUpDate ? dayjs(lead.followUpDate) : null} onChange={(d) => handleUpdateFollowUp(lead._id, d)} slotProps={{ textField: { size: 'small', variant: 'standard', sx: { width: 120 } } }} />
                            : <Typography sx={{ fontSize: "13px", display: 'flex', alignItems: 'center', gap: 1, color: "#334155" }}><Clock size={14} color="#94a3b8" /> {lead.followUpDate ? dayjs(lead.followUpDate).format('DD MMM YYYY') : "N/A"}</Typography>
                          }
                        </TableCell>
                        <TableCell><Typography sx={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>{activeTab === 1 ? getUserName(lead.assignedTo) : lead.leadOwner}</Typography></TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                            {activeTab === 0 && (
                              <FormControl size="small" sx={{ width: 130 }}>
                                <Select displayEmpty value="" onChange={(e) => handleAssign(lead._id, e.target.value)} sx={{ height: 32, fontSize: '12px', borderRadius: '4px' }}>
                                  <MenuItem value="" disabled>Assign Agent</MenuItem>
                                  {users.map(u => <MenuItem key={u._id} value={u._id}>{u.username}</MenuItem>)}
                                </Select>
                              </FormControl>
                            )}
                            <Tooltip title="Discussions"><IconButton size="small" onClick={() => handleOpenChat(lead)} sx={{ borderRadius: "4px", border: "1px solid #e2e8f0", bgcolor: "#fff", '&:hover': { bgcolor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" } }}><Badge color="error" variant="dot" invisible={!lead.comments?.length}><MessageSquare size={14} /></Badge></IconButton></Tooltip>
                            <Tooltip title="View Details"><IconButton size="small" onClick={() => handleOpenDetails(lead)} sx={{ borderRadius: "4px", border: "1px solid #e2e8f0", bgcolor: "#fff", '&:hover': { bgcolor: "#f8fafc" } }}><Eye size={14} color="#475569" /></IconButton></Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: "1px solid #e2e8f0" }}>
            <Pagination count={Math.ceil(filteredTableLeads.length / rowsPerPage)} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
          </Box>
        </Paper>

        {/* --- Modals & Drawers --- */}
        {/* Comprehensive Details Modal */}
        <Dialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "4px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } }}>
          <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            Comprehensive Lead Dossier
            <IconButton onClick={() => setIsDetailsOpen(false)} sx={{ borderRadius: "4px", bgcolor: "#fff", border: "1px solid #e2e8f0" }}><X size={16}/></IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: "#fff" }}>
            {selectedLead && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, letterSpacing: "0.5px" }}>LEAD CLASSIFICATION</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <Select value={editLeadType} onChange={(e) => setEditLeadType(e.target.value)} sx={{ borderRadius: "4px" }}>
                      {Object.keys(LEAD_TYPE_CONFIG).map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, letterSpacing: "0.5px" }}>FOLLOW-UP DATE</Typography>
                  <Box sx={{ mt: 1, p: 1, border: "1px solid #e2e8f0", borderRadius: "4px", bgcolor: "#f8fafc" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>{selectedLead.followUpDate ? dayjs(selectedLead.followUpDate).format('DD MMMM YYYY') : "Not Set"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, letterSpacing: "0.5px" }}>INTERNAL NOTES / REMARKS</Typography>
                  <TextField fullWidth multiline rows={4} variant="outlined" value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Enter internal lead history or notes here..." sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '4px' } }} />
                </Grid>
                <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
                {[
                  { label: "CONTACT NAME", value: selectedLead.leadName },
                  { label: "EMAIL ADDRESS", value: selectedLead.email },
                  { label: "PHONE NUMBER", value: selectedLead.phoneNumber },
                  { label: "PITCHED AMOUNT", value: `${selectedLead.currencySymbol || "$"}${selectedLead.pitchedAmount || "0.00"}` },
                  { label: "COUNTRY", value: selectedLead.country || "N/A" },
                  { label: "SOURCE", value: selectedLead.source || "N/A" }
                ].map((info, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, letterSpacing: "0.5px" }}>{info.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", mt: 0.5, ...noSelectSx }}>{info.value || "N/A"}</Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1, borderTop: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
            <Button variant="outlined" color="inherit" onClick={() => setIsDetailsOpen(false)} sx={{ borderRadius: "4px", textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
            <Button variant="contained" color="primary" startIcon={updating ? <CircularProgress size={14} color="inherit" /> : <Save size={14} />} onClick={handleUpdateLeadDetails} disabled={updating} sx={{ borderRadius: "4px", textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none' }}>Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Chat Drawer */}
        <Drawer anchor="right" open={isChatOpen} onClose={() => setIsChatOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, bgcolor: "#f8fafc", borderRadius: "4px 0 0 4px" } }}>
          {selectedLead && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ p: 2.5, bgcolor: "#fff", borderBottom: "1px solid #e2e8f0", display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 600, fontSize: "14px" }}>{selectedLead.leadName?.charAt(0)}</Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>{selectedLead.leadName}</Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Internal Discussion</Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setIsChatOpen(false)} sx={{ borderRadius: "4px", border: "1px solid #e2e8f0" }}><X size={16} /></IconButton>
              </Box>
              <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!selectedLead.comments || selectedLead.comments.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: "#94a3b8" }}><MessageSquare size={36} opacity={0.5} style={{ marginBottom: 8 }} /><Typography variant="body2">No messages yet.</Typography></Box>
                ) : (
                  selectedLead.comments.map((msg, index) => (
                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: "flex-start", maxWidth: '85%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>{getUserName(msg.postedBy)}</Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "10px" }}>{dayjs(msg.postedAt).format("DD MMM, HH:mm")}</Typography>
                      </Box>
                      <Box sx={{ p: 1.5, px: 2, bgcolor: "#fff", color: "#1e293b", borderRadius: "0 4px 4px 4px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.text}</Typography>
                      </Box>
                    </Box>
                  ))
                )}
                <div ref={chatScrollRef} />
              </Box>
              <Box sx={{ p: 2, bgcolor: "#fff", borderTop: "1px solid #e2e8f0" }} component="form" onSubmit={handleAddComment}>
                <TextField fullWidth placeholder="Type a message..." variant="outlined" size="small" value={newComment} onChange={(e) => setNewComment(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px', pr: 0.5, bgcolor: "#f1f5f9" } }} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton type="submit" disabled={!newComment.trim()} sx={{ borderRadius: "4px", bgcolor: "#2563eb", color: "#fff", '&:hover': { bgcolor: "#1d4ed8" }, '&.Mui-disabled': { bgcolor: "#cbd5e1", color: "#f8fafc" }, width: 30, height: 30 }}><Send size={14} /></IconButton></InputAdornment>) }} />
              </Box>
            </Box>
          )}
        </Drawer>

        <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: "4px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>{toast.message}</Alert>
        </Snackbar>

      </Box>
    </LocalizationProvider>
  );
};

export default CallerDashboard;