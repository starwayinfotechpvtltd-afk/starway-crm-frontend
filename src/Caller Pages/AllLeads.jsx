// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import {
//   TextField, Button, Select, MenuItem, FormControl, InputLabel,
//   Typography, Box, Avatar, IconButton, Pagination, Stack,
//   Dialog, DialogActions, DialogContent, DialogTitle, Snackbar,
//   Alert, Tabs, Tab, Chip, Grid, Divider, Paper, Table,
//   TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Tooltip, Badge, InputAdornment, Card, CardContent, CircularProgress
// } from "@mui/material";
// import {
//   Search as SearchIcon,
//   MessageSquare,
//   Eye,
//   Send,
//   X,
//   Clock,
//   Briefcase,
//   UserCheck,
//   XCircle,
//   RotateCcw,
//   Save, // Added Save icon
// } from "lucide-react";
// import dayjs from "dayjs";
// import isBetween from "dayjs/plugin/isBetween";
// import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// dayjs.extend(isBetween);

// const LEAD_TYPE_CONFIG = {
//   "Hot Lead": { color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
//   "Contacted": { color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
//   "Contact in Future": { color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" },
//   "Callback": { color: "#d97706", bg: "#fffbeb", border: "#fef3c7" },
//   "New Lead": { color: "#059669", bg: "#ecfdf5", border: "#d1fae5" },
// };

// const noSelectSx = {
//   userSelect: "none",
//   WebkitUserSelect: "none",
//   MozUserSelect: "none",
//   msUserSelect: "none",
//   cursor: "default"
// };

// const CACHE_KEY_LEADS = "crm_leads_data";
// const CACHE_KEY_FILTERS = "crm_leads_filters";

// const AllLeads = () => {
//   const getCachedFilters = () => {
//     const saved = sessionStorage.getItem(CACHE_KEY_FILTERS);
//     return saved ? JSON.parse(saved) : null;
//   };

//   const cachedFilters = getCachedFilters();

//   const [leads, setLeads] = useState(() => {
//     const saved = sessionStorage.getItem(CACHE_KEY_LEADS);
//     return saved ? JSON.parse(saved) : [];
//   });
  
//   const [users, setUsers] = useState([]);
//   const [activeTab, setActiveTab] = useState(cachedFilters?.activeTab || 0);
//   const [loading, setLoading] = useState(false);
//   const [updating, setUpdating] = useState(false); // New state for button loading
  
//   const [searchTerm, setSearchTerm] = useState(cachedFilters?.searchTerm || "");
//   const [filterType, setFilterType] = useState(cachedFilters?.filterType || "all");
//   const [startDate, setStartDate] = useState(cachedFilters?.startDate ? dayjs(cachedFilters.startDate) : null);
//   const [endDate, setEndDate] = useState(cachedFilters?.endDate ? dayjs(cachedFilters.endDate) : null);
//   const [page, setPage] = useState(cachedFilters?.page || 1);

//   // Modal States
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
//   const [isCommentOpen, setIsCommentOpen] = useState(false);
  
//   // Edit States for the Modal
//   const [editNote, setEditNote] = useState("");
//   const [editLeadType, setEditLeadType] = useState("");

//   const [newComment, setNewComment] = useState("");
//   const rowsPerPage = 10;
//   const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

//   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const filterState = { activeTab, searchTerm, filterType, startDate: startDate?.toISOString(), endDate: endDate?.toISOString(), page };
//     sessionStorage.setItem(CACHE_KEY_FILTERS, JSON.stringify(filterState));
//     sessionStorage.setItem(CACHE_KEY_LEADS, JSON.stringify(leads));
//   }, [leads, activeTab, searchTerm, filterType, startDate, endDate, page]);

//   useEffect(() => {
//     if (leads.length === 0) fetchData();
//     else fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/api/auth/admins-managers`, { headers: { Authorization: `Bearer ${token}` } });
//       setUsers(res.data);
//     } catch (err) { console.error(err); }
//   };

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [leadsRes, usersRes] = await Promise.all([
//         axios.get(`${API_BASE}/api/leads/all`, { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get(`${API_BASE}/api/auth/admins-managers`, { headers: { Authorization: `Bearer ${token}` } })
//       ]);
//       setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : []);
//       setUsers(usersRes.data);
//     } catch (err) { showToast("Failed to fetch data", "error"); }
//     finally { setLoading(false); }
//   };

//   // Open Details and Initialize Edit States
//   const handleOpenDetails = (lead) => {
//     setSelectedLead(lead);
//     setEditNote(lead.note || "");
//     setEditLeadType(lead.leadType || "");
//     setIsDetailsOpen(true);
//   };

//   const handleUpdateLeadDetails = async () => {
//     setUpdating(true);
//     try {
//       const res = await axios.put(`${API_BASE}/api/leads/${selectedLead._id}`, 
//         { note: editNote, leadType: editLeadType }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       // Update local state (triggers session storage sync)
//       setLeads(prev => prev.map(l => l._id === selectedLead._id ? res.data : l));
//       setSelectedLead(res.data);
//       showToast("Lead updated successfully");
//     } catch (err) {
//       showToast("Failed to update lead", "error");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleUpdateFollowUp = async (leadId, date) => {
//     try {
//       await axios.put(`${API_BASE}/api/leads/${leadId}/follow-up`, { followUpDate: date }, { headers: { Authorization: `Bearer ${token}` } });
//       setLeads(prev => prev.map(l => l._id === leadId ? { ...l, followUpDate: date } : l));
//       showToast("Follow-up updated");
//     } catch (err) { showToast("Update failed", "error"); }
//   };

//   const handleAssign = async (leadId, userId) => {
//     if (!userId) return;
//     try {
//       const res = await axios.put(`${API_BASE}/api/leads/assign/${leadId}`, { userId, assignedAt: new Date() }, { headers: { Authorization: `Bearer ${token}` } });
//       setLeads(prev => prev.map(l => l._id === leadId ? res.data : l));
//       showToast("Lead assigned successfully");
//     } catch (err) { showToast("Assignment failed", "error"); }
//   };

//   const handleAddComment = async (e) => {
//     if (e) e.preventDefault();
//     if (!newComment.trim()) return;
//     try {
//       const res = await axios.post(`${API_BASE}/api/leads/${selectedLead._id}/comments`, { text: newComment }, { headers: { Authorization: `Bearer ${token}` } });
//       setLeads(prev => prev.map(l => l._id === selectedLead._id ? res.data : l));
//       setSelectedLead(res.data);
//       setNewComment("");
//     } catch (err) { showToast("Failed to post comment", "error"); }
//   };

//   const showToast = (message, severity = "success") => setToast({ open: true, message, severity });
//   const handleReset = () => { setStartDate(null); setEndDate(null); setFilterType("all"); setSearchTerm(""); setPage(1); };

//   const filteredLeads = useMemo(() => {
//     return leads.filter(lead => {
//       const isDropped = lead.status === "dropped";
//       const isAssigned = !!lead.assignedTo;
//       if (activeTab === 0 && (isAssigned || isDropped)) return false;
//       if (activeTab === 1 && (!isAssigned || isDropped)) return false;
//       if (activeTab === 2 && !isDropped) return false;

//       const matchesSearch = lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                             lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
//       if (!matchesSearch) return false;
//       if (filterType !== "all" && lead.leadType !== filterType) return false;
//       if (startDate && endDate) {
//         const leadDate = dayjs(lead.createdAt);
//         if (!leadDate.isBetween(startDate, endDate, 'day', '[]')) return false;
//       }
//       return true;
//     });
//   }, [leads, activeTab, searchTerm, filterType, startDate, endDate]);

//   const stats = useMemo(() => ({
//     ongoing: leads.filter(l => !l.assignedTo && l.status !== "dropped").length,
//     assigned: leads.filter(l => !!l.assignedTo && l.status !== "dropped").length,
//     dropped: leads.filter(l => l.status === "dropped").length,
//   }), [leads]);

//   const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//   const getLeadTypeStyle = (type) => LEAD_TYPE_CONFIG[type] || { color: "#4b5563", bg: "#f3f4f6", border: "#e5e7eb" };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: "#fafafa", minHeight: "100vh" }}>
        
//         {/* KPI Indicators */}
//         <Grid container spacing={2} sx={{ mb: 4 }}>
//           {[
//             { label: "Ongoing Pipeline", count: stats.ongoing, icon: <Briefcase size={20} color="#2563eb"/>, border: "#dbeafe" },
//             { label: "Assigned Leads", count: stats.assigned, icon: <UserCheck size={20} color="#059669"/>, border: "#d1fae5" },
//             { label: "Dropped Enquiries", count: stats.dropped, icon: <XCircle size={20} color="#dc2626"/>, border: "#fee2e2" }
//           ].map((item, idx) => (
//             <Grid item xs={12} sm={4} key={idx}>
//               <Card variant="outlined" sx={{ borderRadius: "6px", border: "1px solid #e2e8f0" }}>
//                 <CardContent sx={{ p: "20px !important", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                   <Box>
//                     <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</Typography>
//                     <Typography variant="h4" sx={{ color: "#0f172a", fontWeight: 500, mt: 0.5 }}>{item.count}</Typography>
//                   </Box>
//                   <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#f8fafc", border: `1px solid ${item.border}` }}>{item.icon}</Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>

//         <Paper variant="outlined" sx={{ border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden", bgcolor: "#fff" }}>
//           <Box sx={{ borderBottom: "1px solid #e2e8f0", px: 3, pt: 1 }}>
//             <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setPage(1); }}>
//               <Tab label="Ongoing" />
//               <Tab label="Assigned" />
//               <Tab label="Dropped" />
//             </Tabs>
//           </Box>

//           {/* Filters */}
//           <Box sx={{ p: 3, borderBottom: "1px solid #e2e8f0", bgcolor: "#fafafa" }}>
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12} md={4}>
//                 <TextField fullWidth size="small" placeholder="Search name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                   InputProps={{ startAdornment: <SearchIcon size={16} style={{ marginRight: 8, color: "#94a3b8" }} /> }}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={4} md={2.5}>
//                 <FormControl fullWidth size="small">
//                   <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
//                     <MenuItem value="all">All Lead Types</MenuItem>
//                     {Object.keys(LEAD_TYPE_CONFIG).map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12} sm={4} md={2}>
//                 <DatePicker label="From" value={startDate} onChange={setStartDate} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
//               </Grid>
//               <Grid item xs={12} sm={4} md={2}>
//                 <DatePicker label="To" value={endDate} onChange={setEndDate} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
//               </Grid>
//               <Grid item xs={12} md={1.5}>
//                 <Button fullWidth variant="outlined" onClick={handleReset} startIcon={<RotateCcw size={14} />}>Reset</Button>
//               </Grid>
//             </Grid>
//           </Box>

//           <TableContainer>
//             <Table size="medium">
//               <TableHead sx={{ bgcolor: "#f8fafc" }}>
//                 <TableRow>
//                   <TableCell sx={{ color: "#475569", fontSize: "11px", fontWeight: 700 }}>LEAD IDENTITY</TableCell>
//                   <TableCell sx={{ color: "#475569", fontSize: "11px", fontWeight: 700 }}>CLASSIFICATION</TableCell>
//                   <TableCell sx={{ color: "#475569", fontSize: "11px", fontWeight: 700 }}>FOLLOW-UP WINDOW</TableCell>
//                   <TableCell sx={{ color: "#475569", fontSize: "11px", fontWeight: 700 }}>{activeTab === 1 ? "ASSIGNED AGENT" : "SOURCE CREATOR"}</TableCell>
//                   <TableCell align="right" sx={{ color: "#475569", fontSize: "11px", fontWeight: 700 }}>MANAGEMENT</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {loading ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>Loading...</TableCell></TableRow> :
//                   paginatedLeads.map((lead) => (
//                     <TableRow key={lead._id} sx={{ '&:hover': { bgcolor: "#f8fafc" } }}>
//                       <TableCell>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                           <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: "#e0f2fe", color: "#0369a1" }}>{lead.leadName?.charAt(0)}</Avatar>
//                           <Box sx={noSelectSx}>
//                             <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>{lead.leadName}</Typography>
//                             <Typography sx={{ fontSize: "11px", color: "#64748b" }}>{lead.email}</Typography>
//                           </Box>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Chip label={lead.leadType} size="small" sx={{ fontSize: "10px", fontWeight: 700, color: getLeadTypeStyle(lead.leadType).color, bgcolor: getLeadTypeStyle(lead.leadType).bg, border: `1px solid ${getLeadTypeStyle(lead.leadType).border}` }} />
//                       </TableCell>
//                       <TableCell>
//                         {activeTab === 0 ? 
//                           <DatePicker value={lead.followUpDate ? dayjs(lead.followUpDate) : null} onChange={(d) => handleUpdateFollowUp(lead._id, d)} slotProps={{ textField: { size: 'small', variant: 'standard', sx: { width: 110 } } }} />
//                           : <Typography sx={{ fontSize: "13px", display: 'flex', alignItems: 'center', gap: 1 }}><Clock size={14} /> {lead.followUpDate ? dayjs(lead.followUpDate).format('DD MMM YYYY') : "N/A"}</Typography>
//                         }
//                       </TableCell>
//                       <TableCell><Typography sx={{ fontSize: "13px" }}>{activeTab === 1 ? lead.assignedTo?.username : lead.leadOwner}</Typography></TableCell>
//                       <TableCell align="right">
//                         <Stack direction="row" spacing={1} justifyContent="flex-end">
//                           {activeTab === 0 && (
//                             <FormControl size="small" sx={{ width: 130 }}>
//                               <Select displayEmpty value="" onChange={(e) => handleAssign(lead._id, e.target.value)} sx={{ height: 32, fontSize: '12px' }}>
//                                 <MenuItem value="" disabled>Assign Agent</MenuItem>
//                                 {users.map(u => <MenuItem key={u._id} value={u._id}>{u.username}</MenuItem>)}
//                               </Select>
//                             </FormControl>
//                           )}
//                           <IconButton size="small" onClick={() => handleOpenDetails(lead)} sx={{ border: "1px solid #e2e8f0" }}><Eye size={15} /></IconButton>
//                         </Stack>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
//             <Pagination count={Math.ceil(filteredLeads.length / rowsPerPage)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
//           </Box>
//         </Paper>

//         {/* --- Details Profile View Modal (Now with Editing) --- */}
//         <Dialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "14px" } }}>
//           <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             Comprehensive Lead Dossier
//             <IconButton onClick={() => setIsDetailsOpen(false)}><X size={20}/></IconButton>
//           </DialogTitle>
//           <DialogContent dividers sx={{ p: 3, bgcolor: "#fafafa" }}>
//             {selectedLead && (
//               <Grid container spacing={4}>
//                 {/* Editable Fields */}
//                 <Grid item xs={12} md={6}>
//                   <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>LEAD CLASSIFICATION</Typography>
//                   <FormControl fullWidth size="small" sx={{ mt: 1 }}>
//                     <Select value={editLeadType} onChange={(e) => setEditLeadType(e.target.value)} sx={{ bgcolor: "#fff", borderRadius: "8px" }}>
//                       {Object.keys(LEAD_TYPE_CONFIG).map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
//                     </Select>
//                   </FormControl>
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>FOLLOW-UP DATE</Typography>
//                   <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>{selectedLead.followUpDate ? dayjs(selectedLead.followUpDate).format('DD MMM YYYY') : "Not Set"}</Typography>
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>INTERNAL NOTES / REMARKS</Typography>
//                   <TextField 
//                     fullWidth multiline rows={4} variant="outlined" value={editNote} onChange={(e) => setEditNote(e.target.value)}
//                     placeholder="Enter internal lead history or notes here..." sx={{ mt: 1, bgcolor: "#fff", '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
//                   />
//                 </Grid>

//                 <Divider sx={{ width: '100%', my: 2 }} />

//                 {/* Read Only Fields */}
//                 <Grid item xs={12} sm={6} md={4}>
//                   <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>CONTACT NAME</Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 600, ...noSelectSx }}>{selectedLead.leadName || "N/A"}</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={4}>
//                   <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>EMAIL ADDRESS</Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 600, ...noSelectSx }}>{selectedLead.email || "N/A"}</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={4}>
//                   <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>PHONE NUMBER</Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 600, ...noSelectSx }}>{selectedLead.phoneNumber || "N/A"}</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={4}>
//                   <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>PITCHED AMOUNT</Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLead.currencySymbol}{selectedLead.pitchedAmount || "0.00"}</Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={4}>
//                   <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>COUNTRY</Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLead.country || "N/A"}</Typography>
//                 </Grid>
//               </Grid>
//             )}
//           </DialogContent>
//           <DialogActions sx={{ p: 2.5, gap: 1 }}>
//             <Button variant="outlined" color="inherit" onClick={() => setIsDetailsOpen(false)} sx={{ borderRadius: "8px" }}>Cancel</Button>
//             <Button 
//               variant="contained" color="primary" startIcon={updating ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />} 
//               onClick={handleUpdateLeadDetails} disabled={updating} sx={{ borderRadius: "8px", boxShadow: 'none' }}
//             >
//               Save Changes
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Discussions Modal & Snackbar remain same */}
//         <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
//           <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: "8px" }}>{toast.message}</Alert>
//         </Snackbar>

//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default AllLeads;






















import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import {
  TextField, Button, Select, MenuItem, FormControl, Typography, Box, Avatar,
  IconButton, Pagination, Stack, Dialog, DialogActions, DialogContent, DialogTitle,
  Snackbar, Alert, Tabs, Tab, Chip, Grid, Divider, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Badge, InputAdornment,
  Card, CardContent, CircularProgress, Drawer
} from "@mui/material";
import {
  Search as SearchIcon, MessageSquare, Eye, Send, X, Clock, Briefcase, UserCheck,
  XCircle, RotateCcw, Save, Filter
} from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

dayjs.extend(isBetween);

const LEAD_TYPE_CONFIG = {
  "Hot Lead": { color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
  "Contacted": { color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
  "Contact in Future": { color: "#7c3aed", bg: "#f5f3ff", border: "#ede9fe" },
  "Callback": { color: "#d97706", bg: "#fffbeb", border: "#fef3c7" },
  "New Lead": { color: "#059669", bg: "#ecfdf5", border: "#d1fae5" },
};

const noSelectSx = {
  userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", cursor: "default"
};

const CACHE_KEY_LEADS = "crm_leads_data";
const CACHE_KEY_FILTERS = "crm_leads_filters";

const AllLeads = () => {
  const getCachedFilters = () => {
    const saved = sessionStorage.getItem(CACHE_KEY_FILTERS);
    return saved ? JSON.parse(saved) : null;
  };

  const cachedFilters = getCachedFilters();

  const [leads, setLeads] = useState(() => {
    const saved = sessionStorage.getItem(CACHE_KEY_LEADS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState(cachedFilters?.activeTab || 0);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState(cachedFilters?.searchTerm || "");
  const [filterType, setFilterType] = useState(cachedFilters?.filterType || "all");
  const [sortBy, setSortBy] = useState(cachedFilters?.sortBy || "newest");
  const [startDate, setStartDate] = useState(cachedFilters?.startDate ? dayjs(cachedFilters.startDate) : null);
  const [endDate, setEndDate] = useState(cachedFilters?.endDate ? dayjs(cachedFilters.endDate) : null);
  const [page, setPage] = useState(cachedFilters?.page || 1);

  // Modal & Drawer States
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Edit States for the Modal
  const [editNote, setEditNote] = useState("");
  const [editLeadType, setEditLeadType] = useState("");
  const [newComment, setNewComment] = useState("");
  
  const chatScrollRef = useRef(null);
  const rowsPerPage = 10;
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const filterState = { activeTab, searchTerm, filterType, sortBy, startDate: startDate?.toISOString(), endDate: endDate?.toISOString(), page };
    sessionStorage.setItem(CACHE_KEY_FILTERS, JSON.stringify(filterState));
    sessionStorage.setItem(CACHE_KEY_LEADS, JSON.stringify(leads));
  }, [leads, activeTab, searchTerm, filterType, sortBy, startDate, endDate, page]);

  useEffect(() => {
    if (leads.length === 0) fetchData();
    else fetchUsers();
  }, []);

  useEffect(() => {
    if (isChatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedLead?.comments, isChatOpen]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/admins-managers`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/leads/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/api/auth/admins-managers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : []);
      setUsers(usersRes.data);
    } catch (err) { showToast("Failed to fetch data", "error"); }
    finally { setLoading(false); }
  };

  const getUserName = (userRef) => {
    if (!userRef) return "System/Agent";
    if (typeof userRef === "object" && userRef.username) return userRef.username;
    const foundUser = users.find(u => u._id === userRef);
    return foundUser ? foundUser.username : "Agent";
  };

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
      const res = await axios.put(`${API_BASE}/api/leads/${selectedLead._id}`, 
        { note: editNote, leadType: editLeadType }, { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });
  
  const handleReset = () => { 
    setStartDate(null); setEndDate(null); setFilterType("all"); setSearchTerm(""); setSortBy("newest"); setPage(1); 
  };

  // 1. FILTERING
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const isDropped = lead.status === "dropped";
      const isAssigned = !!lead.assignedTo;
      if (activeTab === 0 && (isAssigned || isDropped)) return false;
      if (activeTab === 1 && (!isAssigned || isDropped)) return false;
      if (activeTab === 2 && !isDropped) return false;

      const matchesSearch = lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filterType !== "all" && lead.leadType !== filterType) return false;
      if (startDate && endDate) {
        const leadDate = dayjs(lead.createdAt);
        if (!leadDate.isBetween(startDate, endDate, 'day', '[]')) return false;
      }
      return true;
    });
  }, [leads, activeTab, searchTerm, filterType, startDate, endDate]);

  // 2. SORTING
  const sortedLeads = useMemo(() => {
    const arr = [...filteredLeads];
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
        if (!a.followUpDate) return 1; // push nulls to end
        if (!b.followUpDate) return -1;
        return new Date(a.followUpDate) - new Date(b.followUpDate);
      });
    }
    return arr;
  }, [filteredLeads, sortBy]);

  const stats = useMemo(() => ({
    ongoing: leads.filter(l => !l.assignedTo && l.status !== "dropped").length,
    assigned: leads.filter(l => !!l.assignedTo && l.status !== "dropped").length,
    dropped: leads.filter(l => l.status === "dropped").length,
  }), [leads]);

  const paginatedLeads = sortedLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const getLeadTypeStyle = (type) => LEAD_TYPE_CONFIG[type] || { color: "#4b5563", bg: "#f3f4f6", border: "#e5e7eb" };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f1f5f9", minHeight: "100vh" }}>
        
        {/* KPI Indicators */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: "Ongoing Pipeline", count: stats.ongoing, icon: <Briefcase size={22} color="#2563eb"/>, border: "#dbeafe", gradient: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" },
            { label: "Assigned Leads", count: stats.assigned, icon: <UserCheck size={22} color="#059669"/>, border: "#d1fae5", gradient: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)" },
            { label: "Dropped Enquiries", count: stats.dropped, icon: <XCircle size={22} color="#dc2626"/>, border: "#fee2e2", gradient: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)" }
          ].map((item, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Card sx={{ 
                borderRadius: "4px", // Updated to sm
                border: `1px solid ${item.border}`, 
                background: item.gradient,
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
              }}>
                <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{item.label}</Typography>
                    <Typography variant="h4" sx={{ color: "#0f172a", fontWeight: 700, mt: 0.5 }}>{item.count}</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: "4px", bgcolor: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>{item.icon}</Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ border: "1px solid #e2e8f0", borderRadius: "4px", overflow: "hidden", bgcolor: "#fff", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <Box sx={{ borderBottom: "1px solid #e2e8f0", px: 3, pt: 1, bgcolor: "#fafafa" }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, v) => { setActiveTab(v); setPage(1); }}
              TabIndicatorProps={{ sx: { height: 3 } }}
              sx={{ minHeight: 48, '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '14px' } }}
            >
              <Tab label="Ongoing" />
              <Tab label="Transfers" />
              <Tab label="Dropped" />
            </Tabs>
          </Box>

          {/* Filters & Sorting */}
          <Box sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3.5}>
                <TextField fullWidth size="small" placeholder="Search name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ 
                    startAdornment: <SearchIcon size={16} style={{ marginRight: 8, color: "#94a3b8" }} />,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} sx={{ borderRadius: '4px' }}>
                    <MenuItem value="all">All Classifications</MenuItem>
                    {Object.keys(LEAD_TYPE_CONFIG).map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{ borderRadius: '4px' }}>
                    <MenuItem value="newest">Newly Added</MenuItem>
                    <MenuItem value="comments">New Comments</MenuItem>
                    <MenuItem value="followup">Upcoming Followup</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={1.5}>
                <DatePicker label="From" value={startDate} onChange={setStartDate} slotProps={{ textField: { size: 'small', fullWidth: true, sx:{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } } } }} />
              </Grid>
              <Grid item xs={12} sm={4} md={1.5}>
                <DatePicker label="To" value={endDate} onChange={setEndDate} slotProps={{ textField: { size: 'small', fullWidth: true, sx:{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } } } }} />
              </Grid>
              <Grid item xs={12} sm={4} md={1.5}>
                <Button fullWidth variant="outlined" onClick={handleReset} startIcon={<RotateCcw size={14} />} sx={{ borderRadius: '4px', textTransform: 'none', fontWeight: 600, height: "40px" }}>Reset</Button>
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
                {loading ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><CircularProgress size={30} /></TableCell></TableRow> :
                  paginatedLeads.map((lead) => {
                    const latestComment = lead.comments && lead.comments.length > 0 
                      ? lead.comments[lead.comments.length - 1] 
                      : null;

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
                              
                              {/* Latest Comment Snippet */}
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
                        <TableCell>
                          <Chip label={lead.leadType} size="small" sx={{ fontSize: "11px", fontWeight: 700, borderRadius: "4px", color: getLeadTypeStyle(lead.leadType).color, bgcolor: getLeadTypeStyle(lead.leadType).bg, border: `1px solid ${getLeadTypeStyle(lead.leadType).border}` }} />
                        </TableCell>
                        <TableCell>
                          {activeTab === 0 ? 
                            <DatePicker 
                              value={lead.followUpDate ? dayjs(lead.followUpDate) : null} 
                              onChange={(d) => handleUpdateFollowUp(lead._id, d)} 
                              slotProps={{ textField: { size: 'small', variant: 'standard', sx: { width: 120 } } }} 
                            />
                            : <Typography sx={{ fontSize: "13px", display: 'flex', alignItems: 'center', gap: 1, color: "#334155" }}><Clock size={14} color="#94a3b8" /> {lead.followUpDate ? dayjs(lead.followUpDate).format('DD MMM YYYY') : "N/A"}</Typography>
                          }
                        </TableCell>
                        <TableCell><Typography sx={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>{activeTab === 1 ? lead.assignedTo?.username : lead.leadOwner}</Typography></TableCell>
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
                            
                            {/* Chat Button */}
                            {(activeTab === 0 || activeTab === 1) && (
                              <Tooltip title="Discussions">
                                <IconButton size="small" onClick={() => handleOpenChat(lead)} sx={{ borderRadius: "4px", border: "1px solid #e2e8f0", bgcolor: "#fff", '&:hover': { bgcolor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" } }}>
                                  <Badge color="error" variant="dot" invisible={!lead.comments?.length}>
                                    <MessageSquare size={14} />
                                  </Badge>
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => handleOpenDetails(lead)} sx={{ borderRadius: "4px", border: "1px solid #e2e8f0", bgcolor: "#fff", '&:hover': { bgcolor: "#f8fafc" } }}>
                                <Eye size={14} color="#475569" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: "1px solid #e2e8f0" }}>
            <Pagination count={Math.ceil(filteredLeads.length / rowsPerPage)} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
          </Box>
        </Paper>

        {/* --- Details Profile View Modal --- */}
        <Dialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "4px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } }}>
          <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            Comprehensive Lead Dossier
            <IconButton onClick={() => setIsDetailsOpen(false)} sx={{ borderRadius: "4px", bgcolor: "#fff", border: "1px solid #e2e8f0" }}><X size={16}/></IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: "#fff" }}>
            {selectedLead && (
              <Grid container spacing={4}>
                {/* Editable Fields */}
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
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                      {selectedLead.followUpDate ? dayjs(selectedLead.followUpDate).format('DD MMMM YYYY') : "Not Set"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, letterSpacing: "0.5px" }}>INTERNAL NOTES / REMARKS</Typography>
                  <TextField 
                    fullWidth multiline rows={4} variant="outlined" value={editNote} onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Enter internal lead history or notes here..." sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
                  />
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>

                {/* Read Only Fields */}
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
            <Button 
              variant="contained" color="primary" startIcon={updating ? <CircularProgress size={14} color="inherit" /> : <Save size={14} />} 
              onClick={handleUpdateLeadDetails} disabled={updating} sx={{ borderRadius: "4px", textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none' }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- Chat / Discussions Drawer --- */}
        <Drawer anchor="right" open={isChatOpen} onClose={() => setIsChatOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, bgcolor: "#f8fafc", borderRadius: "4px 0 0 4px" } }}>
          {selectedLead && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Drawer Header */}
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

              {/* Chat Messages */}
              <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!selectedLead.comments || selectedLead.comments.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: "#94a3b8" }}>
                    <MessageSquare size={36} opacity={0.5} style={{ marginBottom: 8 }} />
                    <Typography variant="body2">No messages yet.</Typography>
                    <Typography variant="caption">Start the conversation below.</Typography>
                  </Box>
                ) : (
                  selectedLead.comments.map((msg, index) => (
                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: "flex-start", maxWidth: '85%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>
                          {getUserName(msg.postedBy)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "10px" }}>
                          {dayjs(msg.postedAt).format("DD MMM, HH:mm")}
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, px: 2, bgcolor: "#fff", color: "#1e293b", borderRadius: "0 4px 4px 4px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.text}</Typography>
                      </Box>
                    </Box>
                  ))
                )}
                <div ref={chatScrollRef} />
              </Box>

              {/* Chat Input */}
              <Box sx={{ p: 2, bgcolor: "#fff", borderTop: "1px solid #e2e8f0" }} component="form" onSubmit={handleAddComment}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px', pr: 0.5, bgcolor: "#f1f5f9" } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="submit" disabled={!newComment.trim()} sx={{ borderRadius: "4px", bgcolor: "#2563eb", color: "#fff", '&:hover': { bgcolor: "#1d4ed8" }, '&.Mui-disabled': { bgcolor: "#cbd5e1", color: "#f8fafc" }, width: 30, height: 30 }}>
                          <Send size={14} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </Box>
          )}
        </Drawer>

        {/* Global Snackbar */}
        <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: "4px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>{toast.message}</Alert>
        </Snackbar>

      </Box>
    </LocalizationProvider>
  );
};

export default AllLeads;