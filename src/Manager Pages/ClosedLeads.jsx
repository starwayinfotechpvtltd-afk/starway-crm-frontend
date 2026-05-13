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
  Tooltip
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Launch } from "@mui/icons-material";
import { X, Briefcase, ShieldAlert, Trophy } from "lucide-react";

dayjs.extend(isBetween);

function ManagerClosedLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Team Context
  const [myTeam, setMyTeam] = useState(null);
  const [teamCallers, setTeamCallers] = useState([]);

  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadOwner, setSelectedLeadOwner] = useState(""); 
  const [dateFilterType, setDateFilterType] = useState(""); 
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Pagination & Modal
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchTeamDashboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Reuse the highly optimized team endpoint
        const response = await axios.get(`${API_BASE}/api/leads/team-leads`, config);
        const { team, leads: fetchedLeads } = response.data;

        if (!team) {
          setMyTeam(null);
          setLoading(false);
          return;
        }

        setMyTeam(team);

        // Extract member usernames for the filter dropdown
        const usernames = team.members.map(m => m.username);
        usernames.push(localStorage.getItem("username")); // Include manager
        setTeamCallers([...new Set(usernames)]);

        // Filter for ONLY CLOSED LEADS
        const closedLeads = fetchedLeads.filter(lead => lead.status === "closed");
        
        // Sort by closedAt date (most recent first)
        closedLeads.sort((a, b) => new Date(b.closedAt || b.updatedAt) - new Date(a.closedAt || a.updatedAt));

        setLeads(closedLeads);
      } catch (err) {
        console.error("Error loading closed leads:", err);
        setError("Failed to load your team's closed deals.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDashboard();
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
      
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        if (!lead.leadName?.toLowerCase().includes(lowerQuery) && !lead.email?.toLowerCase().includes(lowerQuery)) return false;
      }

      const dateRange = getDateRange();
      if (dateRange && (lead.closedAt || lead.updatedAt)) {
        const closedDate = dayjs(lead.closedAt || lead.updatedAt);
        if (!closedDate.isBetween(dateRange.start, dateRange.end, "day", "[]")) return false;
      }

      return true;
    });
  }, [leads, selectedLeadOwner, searchQuery, dateFilterType, startDate, endDate]);

  // --- Handlers ---
  const handleOpenDetails = (lead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  // Calculate Total Won Amount for current filter
  const totalRevenue = filteredLeads.reduce((sum, lead) => sum + (lead.pitchedAmount || 0), 0);

  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50/50"><CircularProgress /></div>;
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm border border-red-200 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5" /> {error}
      </div>
    </div>
  );

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
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-medium text-[#172B4D] tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#006644]" /> Won Deals - {myTeam.teamName}
            </h1>
            <p className="text-sm text-[#6B778C] mt-1">Viewing all closed (won) leads generated by your pod.</p>
          </div>
          
          <div className="bg-[#E3FCEF] border border-[#006644] px-4 py-2 rounded-[3px]">
            <Typography sx={{ fontSize: '11px', color: '#006644', textTransform: 'uppercase', fontWeight: 700 }}>Total Revenue (Filtered)</Typography>
            <Typography sx={{ fontSize: '20px', color: '#006644', fontWeight: 700 }}>${totalRevenue.toLocaleString()}</Typography>
          </div>
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

            {/* Date Preset Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Closing Date</InputLabel>
                <Select
                  value={dateFilterType}
                  onChange={(e) => { setDateFilterType(e.target.value); setPage(1); }}
                  label="Closing Date"
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

        {/* --- MAIN TABLE --- */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px' }}>
          <Table size="small" sx={{ minWidth: 1000 }}>
            <TableHead sx={{ backgroundColor: '#F4F5F7' }}>
              <TableRow>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', paddingY: '12px' }}>Client Info</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Pod Member</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Services</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Closed Date</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Won Amount</TableCell>
                <TableCell align="right" sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: '#5E6C84' }}>
                    No closed deals found matching these filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => {
                  return (
                    <TableRow key={lead._id} hover sx={{ '&:hover': { backgroundColor: '#FAFBFC' }, '& td': { borderBottom: '1px solid #DFE1E6', paddingY: '10px' } }}>
                      
                      {/* Client Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar sx={{ bgcolor: '#006644', width: 32, height: 32, fontSize: '14px', fontWeight: 'bold' }}>
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

                      {/* Services/Packages */}
                      <TableCell>
                         <div className="flex gap-1 mt-1 flex-wrap">
                           {lead.packages?.slice(0,2).map((pkg, i) => (
                             <span key={i} className="text-[10px] bg-[#EBECF0] text-[#42526E] px-1.5 py-0.5 rounded-[2px]">{pkg}</span>
                           ))}
                           {lead.packages?.length > 2 && <span className="text-[10px] text-[#6B778C]">+{lead.packages.length - 2} more</span>}
                           {!lead.packages?.length && <span className="text-[11px] text-[#6B778C]">--</span>}
                         </div>
                      </TableCell>

                      {/* Closed Date */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#172B4D' }}>
                           {lead.closedAt ? dayjs(lead.closedAt).format('MMM DD, YYYY') : (lead.updatedAt ? dayjs(lead.updatedAt).format('MMM DD, YYYY') : "--")}
                        </Typography>
                      </TableCell>

                      {/* Won Amount */}
                      <TableCell>
                        <Chip 
                           label={`${lead.currencySymbol || "$"} ${lead.pitchedAmount?.toLocaleString() || 0}`}
                           size="small"
                           sx={{ backgroundColor: '#E3FCEF', color: '#006644', fontWeight: 700, borderRadius: '3px' }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Tooltip title="View Deal Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDetails(lead)}
                            sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', padding: '4px', '&:hover': { backgroundColor: '#EBECF0' } }}
                          >
                            <Launch sx={{ fontSize: '16px', color: '#42526E' }} />
                          </IconButton>
                        </Tooltip>
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
              <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(1); }} disableUnderline sx={{ fontSize: '14px', color: '#172B4D', fontWeight: 500 }}>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Stack>
          </FormControl>
          <Pagination count={Math.ceil(filteredLeads.length / rowsPerPage) || 1} page={page} onChange={(e, p) => setPage(p)} shape="rounded" size="small"
            sx={{ '& .MuiPaginationItem-root': { borderRadius: '3px', color: '#42526E' }, '& .Mui-selected': { backgroundColor: '#0052CC !important', color: 'white' } }}
          />
        </Stack>

        {/* --- VIEW DETAILS MODAL --- */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '3px', backgroundColor: '#F4F5F7' } }}>
          <DialogTitle sx={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Closed Deal: {selectedLead?.leadName}
            <IconButton onClick={() => setDetailsOpen(false)} size="small" sx={{ color: '#42526E' }}><X className="w-5 h-5" /></IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            {selectedLead && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: '#FFFFFF', p: 3, borderRadius: '3px', border: '1px solid #DFE1E6', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase', mb: 2, display: 'block' }}>Contact Information</Typography>
                    <Stack spacing={2}>
                      <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Name</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.leadName}</Typography></div>
                      <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Email</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.email}</Typography></div>
                      <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Phone</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.phoneNumber}</Typography></div>
                      <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Country</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.country}</Typography></div>
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: '#FFFFFF', p: 3, borderRadius: '3px', border: '1px solid #DFE1E6', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase', mb: 2, display: 'block' }}>Deal Specifics</Typography>
                    <Stack spacing={3}>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Closed Date</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.closedAt ? dayjs(selectedLead.closedAt).format('MMM DD, YYYY') : "N/A"}</Typography></div>
                        <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Revenue</Typography><Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#006644' }}>{selectedLead.currencySymbol || "$"}{selectedLead.pitchedAmount?.toLocaleString()}</Typography></div>
                      </div>
                      <div>
                        <Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Packages Sold</Typography>
                        <div className="flex flex-wrap gap-1">
                          {selectedLead.packages?.map((pkg, idx) => (
                            <div key={idx} className="bg-[#EBECF0] text-[#172B4D] text-[12px] px-2 py-0.5 rounded-[3px] font-medium">{pkg}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                         <Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Closing Notes</Typography>
                         <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] p-3">
                           <Typography sx={{ fontSize: '14px', color: '#172B4D', whiteSpace: 'pre-wrap' }}>{selectedLead.note || "No notes provided."}</Typography>
                         </div>
                      </div>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #DFE1E6', padding: '16px' }}>
            <Button onClick={() => setDetailsOpen(false)} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' }, textTransform: 'none', fontWeight: 500 }}>Close View</Button>
          </DialogActions>
        </Dialog>

      </div>
    </LocalizationProvider>
  );
}

export default ManagerClosedLeads;