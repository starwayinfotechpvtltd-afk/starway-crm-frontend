import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Typography,
  Avatar,
  Box,
  CircularProgress,
  Button,
  TextField,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Chip,
  InputAdornment,
  Tooltip
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Launch, Edit } from "@mui/icons-material";
import { X, Calendar, User, Briefcase, ShieldAlert } from "lucide-react";

dayjs.extend(isBetween);

function ManagerTeamLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Team Context
  const [myTeam, setMyTeam] = useState(null);
  const [teamCallers, setTeamCallers] = useState([]);

  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadOwner, setSelectedLeadOwner] = useState(""); 
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFilterType, setDateFilterType] = useState(""); 
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Pagination & Modal
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedLead, setSelectedLead] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [editedLead, setEditedLead] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Current User, Teams, and Leads in parallel
        const [userRes, teamsRes, leadsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/auth/user`, config),
          axios.get(`${API_BASE}/api/teams`, config),
          axios.get(`${API_BASE}/api/leads/all-assigned`, config) // Or your active leads endpoint
        ]);

        const currentUser = userRes.data;
        const allTeams = teamsRes.data;
        const allLeads = leadsRes.data;

        // 2. Find the team where current user is the manager
        const managerTeam = allTeams.find(t => t.manager?._id === currentUser._id);
        
        if (!managerTeam) {
          setMyTeam(null);
          setLoading(false);
          return; // Stop here if they don't manage a team
        }

        setMyTeam(managerTeam);

        // 3. Extract usernames of the manager's team members
        const validTeamUsernames = managerTeam.members.map(m => m.username);
        validTeamUsernames.push(currentUser.username); // Include manager just in case they own leads
        setTeamCallers([...new Set(validTeamUsernames)]);

        // 4. Filter Leads: Must belong to team member AND NOT be closed
        const activeTeamLeads = allLeads.filter(lead => {
          const isNotClosed = lead.status !== "closed";
          const belongsToTeam = validTeamUsernames.includes(lead.leadOwner);
          return isNotClosed && belongsToTeam;
        });

        // Sort by assignment date descending
        const sortedLeads = activeTeamLeads.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
        setLeads(sortedLeads);

      } catch (err) {
        console.error("Error initializing dashboard:", err);
        setError("Failed to load your team's leads. Please verify your connection.");
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // --- Date Logic ---
  const getDateRange = () => {
    const today = dayjs();
    switch (dateFilterType) {
      case "today": return { start: today.startOf("day"), end: today.endOf("day") };
      case "thisMonth": return { start: today.startOf("month"), end: today.endOf("month") };
      case "lastMonth": return { start: today.subtract(1, "month").startOf("month"), end: today.subtract(1, "month").endOf("month") };
      case "custom": return startDate && endDate ? { start: startDate.startOf("day"), end: endDate.endOf("day") } : null;
      default: return null;
    }
  };

  // --- Filter Logic ---
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (selectedLeadOwner && lead.leadOwner !== selectedLeadOwner) return false;
      if (selectedStatus !== "all" && lead.status !== selectedStatus) return false;
      
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        if (!lead.leadName?.toLowerCase().includes(lowerQuery) && !lead.email?.toLowerCase().includes(lowerQuery)) return false;
      }

      const dateRange = getDateRange();
      if (dateRange && lead.assignedAt) {
        const assignedDate = dayjs(lead.assignedAt);
        if (!assignedDate.isBetween(dateRange.start, dateRange.end, "day", "[]")) return false;
      }

      return true;
    });
  }, [leads, selectedLeadOwner, selectedStatus, searchQuery, dateFilterType, startDate, endDate]);

  // --- Handlers ---
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(1); };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setEditedLead({ ...lead });
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedLead(null);
    setEditedLead(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/leads/${selectedLead._id}`,
        editedLead,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // If manager changed status to closed, remove it from this view entirely. Otherwise, update it.
      let updatedLeads;
      if (response.data.status === "closed") {
        updatedLeads = leads.filter(lead => lead._id !== selectedLead._id);
      } else {
        updatedLeads = leads.map((lead) => lead._id === selectedLead._id ? response.data : lead);
      }

      setLeads(updatedLeads);
      handleClosePopup();
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
    }
  };

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "ongoing") return { bg: '#DEEBFF', color: '#0052CC' }; 
    if (s.includes("hot") || s.includes("urgent")) return { bg: '#FFEBE6', color: '#DE350B' }; 
    if (s.includes("new")) return { bg: '#E3FCEF', color: '#006644' }; 
    return { bg: '#DFE1E6', color: '#42526E' }; 
  };

  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50/50"><CircularProgress /></div>;
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm border border-red-200 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5" /> {error}
      </div>
    </div>
  );

  // Empty State if user is not a manager of any team
  if (!myTeam) {
    return (
      <div className="min-h-screen bg-white p-10 flex flex-col items-center justify-center">
        <div className="max-w-md text-center border border-dashed border-[#DFE1E6] rounded-[3px] bg-[#FAFBFC] p-10">
          <Briefcase className="w-12 h-12 text-[#6B778C] mx-auto mb-4 opacity-50" />
          <h2 className="text-[20px] font-medium text-[#172B4D] mb-2">No Active Team Found</h2>
          <p className="text-[#42526E] text-sm">
            You do not currently manage an active team. To view this dashboard, an administrator must assign you as the Manager of a team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="max-w-full mx-4 md:mx-8 p-2 md:p-6 bg-white min-h-screen">
        
        {/* --- Header & Team Context --- */}
        <div className="mb-6">
          <h1 className="text-[24px] font-medium text-[#172B4D] tracking-tight">{myTeam.teamName} - Active Pipeline</h1>
          <p className="text-sm text-[#6B778C] mt-1">Viewing ongoing leads managed by your pod ({teamCallers.length} active callers).</p>
        </div>

        {/* --- JIRA-STYLE FILTER BAR --- */}
        <Box className="sticky top-0 z-40 bg-white pb-4 pt-2 mb-6" sx={{ borderBottom: '2px solid #EBECF0' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
            <TextField
              size="small"
              placeholder="Search client or email..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              sx={{ width: { xs: '100%', md: '50%' }, '& .MuiOutlinedInput-root': { borderRadius: '3px' } }}
            />
          </div>

          <Grid container spacing={2} alignItems="center">
            {/* Filter by Team Caller */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Pod Member</InputLabel>
                <Select
                  value={selectedLeadOwner}
                  onChange={(e) => { setSelectedLeadOwner(e.target.value); setPage(1); }}
                  label="Pod Member"
                  sx={{ borderRadius: '3px' }}
                >
                  <MenuItem value=""><em>All Members</em></MenuItem>
                  {teamCallers.map((caller, idx) => (
                    <MenuItem key={idx} value={caller}>{caller}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                  label="Status"
                  sx={{ borderRadius: '3px' }}
                >
                  <MenuItem value="all"><em>All Active</em></MenuItem>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="hot">Hot</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date Preset Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Assignment Date</InputLabel>
                <Select
                  value={dateFilterType}
                  onChange={(e) => { setDateFilterType(e.target.value); setPage(1); }}
                  label="Assignment Date"
                  sx={{ borderRadius: '3px' }}
                >
                  <MenuItem value=""><em>All Time</em></MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="custom">Custom Range...</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Date Pickers */}
            {dateFilterType === "custom" && (
              <>
                <Grid item xs={6} sm={3} md={2}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { size: "small", fullWidth: true, sx: { borderRadius: '3px' } } }}
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { size: "small", fullWidth: true, sx: { borderRadius: '3px' } } }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>

        {/* --- JIRA-STYLE LIST (TABLE) --- */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px' }}>
          <Table size="small" sx={{ minWidth: 1000 }}>
            <TableHead sx={{ backgroundColor: '#F4F5F7' }}>
              <TableRow>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', paddingY: '12px' }}>Client Info</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Pod Member</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Transferred To</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Pitched Amount</TableCell>
                <TableCell align="right" sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Manage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: '#5E6C84' }}>
                    Your pod has no active leads matching these filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => {
                  const statusColors = getStatusColor(lead.status);
                  return (
                    <TableRow key={lead._id} hover sx={{ '&:hover': { backgroundColor: '#FAFBFC' }, '& td': { borderBottom: '1px solid #DFE1E6', paddingY: '10px' } }}>
                      
                      {/* Client Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar sx={{ bgcolor: '#0052CC', width: 32, height: 32, fontSize: '14px', fontWeight: 'bold' }}>
                            {getInitials(lead.leadName)}
                          </Avatar>
                          <div className="flex flex-col">
                            <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 600 }}>
                              {lead.leadName || "N/A"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                              {lead.email || "No email"} • {lead.country || "N/A"}
                            </Typography>
                          </div>
                        </div>
                      </TableCell>

                      {/* Pod Member (Caller) */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 500 }}>
                          {lead.leadOwner || "--"}
                        </Typography>
                      </TableCell>

                      {/* Transferred To */}
                      <TableCell>
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: '#FFAB00' }}>
                              {lead.assignedTo.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ color: '#172B4D' }}>
                              {lead.assignedTo.username}
                            </Typography>
                          </div>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#7A869A', fontStyle: 'italic' }}>Unassigned</Typography>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip 
                          label={(lead.status || "ongoing").toUpperCase()} 
                          size="small" 
                          sx={{ height: '20px', fontSize: '11px', fontWeight: 700, borderRadius: '3px', backgroundColor: statusColors.bg, color: statusColors.color }} 
                        />
                      </TableCell>

                      {/* Pitched Amount */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#006644' }}>
                          {lead.currencySymbol} {lead.pitchedAmount?.toLocaleString() || 0}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Manage Lead">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Edit sx={{ width: 14, height: 14 }}/>}
                              onClick={() => handleEditClick(lead)}
                              sx={{
                                height: '28px', fontSize: '12px', fontWeight: 600, color: '#42526E', borderColor: '#DFE1E6', borderRadius: '3px', textTransform: 'none',
                                '&:hover': { backgroundColor: '#EBECF0', borderColor: '#DFE1E6' }
                              }}
                            >
                              Manage
                            </Button>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* --- PAGINATION --- */}
        <Stack direction="row" justifyContent="flex-end" alignItems="center" className="mt-4 gap-4">
          <FormControl size="small" variant="standard">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ color: '#5E6C84' }}>Rows per page:</Typography>
              <Select value={rowsPerPage} onChange={handleChangeRowsPerPage} disableUnderline sx={{ fontSize: '14px', color: '#172B4D', fontWeight: 500 }}>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Stack>
          </FormControl>
          <Pagination count={Math.ceil(filteredLeads.length / rowsPerPage) || 1} page={page} onChange={handleChangePage} shape="rounded" size="small"
            sx={{ '& .MuiPaginationItem-root': { borderRadius: '3px', color: '#42526E' }, '& .Mui-selected': { backgroundColor: '#0052CC !important', color: 'white' } }}
          />
        </Stack>

        {/* --- EDIT MODAL --- */}
        <Dialog open={popupOpen} onClose={handleClosePopup} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '3px', backgroundColor: '#F4F5F7' } }}>
          <DialogTitle sx={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Manage Team Lead
            <IconButton onClick={handleClosePopup} size="small" sx={{ color: '#42526E' }}><X className="w-5 h-5" /></IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            {editedLead && (
              <Grid container spacing={3}>
                {/* Left Column: Client Details */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: '#FFFFFF', p: 3, borderRadius: '3px', border: '1px solid #DFE1E6', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <User className="w-4 h-4" /> Client Overview
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <TextField size="small" label="Lead Name" name="leadName" fullWidth value={editedLead.leadName || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Email" name="email" fullWidth value={editedLead.email || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Phone Number" name="phoneNumber" fullWidth value={editedLead.phoneNumber || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Website" name="website" fullWidth value={editedLead.website || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                    </Stack>
                  </Box>
                </Grid>

                {/* Right Column: Deal Overview */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: '#FFFFFF', p: 3, borderRadius: '3px', border: '1px solid #DFE1E6', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Briefcase className="w-4 h-4" /> Pipeline Strategy
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <TextField 
                        size="small" 
                        label="Pitched Amount" 
                        name="pitchedAmount" 
                        fullWidth 
                        value={editedLead.pitchedAmount || ""} 
                        onChange={handleInputChange} 
                        InputProps={{ 
                          startAdornment: <InputAdornment position="start">{editedLead.currencySymbol || "$"}</InputAdornment>,
                          sx: { borderRadius: '3px' }
                        }} 
                      />
                      {/* Critical: Dropdown to change status, including CLOSING the lead */}
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          name="status"
                          value={editedLead.status || "ongoing"}
                          onChange={handleInputChange}
                          label="Status"
                          sx={{ borderRadius: '3px' }}
                        >
                          <MenuItem value="ongoing">Ongoing</MenuItem>
                          <MenuItem value="hot">Hot</MenuItem>
                          <MenuItem value="urgent">Urgent</MenuItem>
                          <MenuItem value="closed" sx={{ color: '#006644', fontWeight: 600 }}>Mark as Closed (Won)</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <TextField 
                        size="small" 
                        label="Manager Notes" 
                        name="note" 
                        fullWidth 
                        multiline 
                        rows={3} 
                        value={editedLead.note || ""} 
                        onChange={handleInputChange} 
                        InputProps={{ sx: { borderRadius: '3px' } }}
                        placeholder="Add strategic notes for your pod here..."
                      />
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #DFE1E6', padding: '16px' }}>
            <Button onClick={handleClosePopup} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#0052CC', borderRadius: '3px', '&:hover': { backgroundColor: '#0047B3' }, disableElevation: true }}>
              Save Pipeline Updates
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
}

export default ManagerTeamLeads;