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
import { Edit } from "@mui/icons-material";
import { X, Calendar, User, Briefcase } from "lucide-react";

dayjs.extend(isBetween);

function ClosedLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState(""); // Transferred To
  const [selectedLeadOwner, setSelectedLeadOwner] = useState(""); // Caller / Lead Owner
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  const [dateFilterType, setDateFilterType] = useState(""); 
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Dropdown Options
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [uniqueLeadOwners, setUniqueLeadOwners] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);

  // Pagination & Modal
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedLead, setSelectedLead] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [editedLead, setEditedLead] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchClosedLeads = async () => {
      try {
        const token = localStorage.getItem("token");
        const leadsResponse = await axios.get(
          `${API_BASE}/api/leads/all-assigned`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        let closedLeads = leadsResponse.data.filter(
          (lead) => lead.status === "closed"
        );

        // Extract Transferred To (Assigned To)
        const uniqueAssignedTo = [
          ...new Set(closedLeads.map((lead) => lead.assignedTo?.username).filter(Boolean)),
        ];
        setAssignedUsers(uniqueAssignedTo);

        // Extract Callers (Lead Owners)
        const uniqueOwners = [
          ...new Set(closedLeads.map((lead) => lead.leadOwner).filter(Boolean)),
        ];
        setUniqueLeadOwners(uniqueOwners);

        closedLeads = closedLeads.sort(
          (a, b) => new Date(b.closedAt) - new Date(a.closedAt)
        );

        setLeads(closedLeads);
      } catch (error) {
        console.error("Error fetching closed leads:", error);
        setError("Failed to fetch closed leads. Please try again later.");
      }
    };

    const fetchServiceTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/api/servicetypes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServiceTypes(response.data);
      } catch (error) {
        console.error("Error fetching service types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedLeads();
    fetchServiceTypes();
  }, []);

  // --- Date Logic ---
  const getDateRange = () => {
    const today = dayjs();
    switch (dateFilterType) {
      case "today":
        return { start: today.startOf("day"), end: today.endOf("day") };
      case "thisMonth":
        return { start: today.startOf("month"), end: today.endOf("month") };
      case "lastMonth":
        return {
          start: today.subtract(1, "month").startOf("month"),
          end: today.subtract(1, "month").endOf("month"),
        };
      case "custom":
        return startDate && endDate
          ? { start: startDate.startOf("day"), end: endDate.endOf("day") }
          : null;
      default:
        return null;
    }
  };

  // --- Filter Logic ---
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Dropdown matches
      if (assignedToFilter && lead.assignedTo?.username !== assignedToFilter) return false;
      if (selectedLeadOwner && lead.leadOwner !== selectedLeadOwner) return false;
      if (serviceTypeFilter && (!lead.packages || !lead.packages.includes(serviceTypeFilter))) return false;
      
      // Search match
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        if (!lead.leadName?.toLowerCase().includes(lowerQuery) && !lead.email?.toLowerCase().includes(lowerQuery)) {
          return false;
        }
      }

      // Date match (based on closedAt)
      const dateRange = getDateRange();
      if (dateRange && lead.closedAt) {
        const closedDate = dayjs(lead.closedAt);
        if (!closedDate.isBetween(dateRange.start, dateRange.end, "day", "[]")) return false;
      }

      return true;
    });
  }, [leads, assignedToFilter, selectedLeadOwner, serviceTypeFilter, searchQuery, dateFilterType, startDate, endDate]);

  // --- Handlers ---
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

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
    setEditedLead((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/leads/${selectedLead._id}`,
        editedLead,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let updatedLeads = leads.map((lead) =>
        lead._id === selectedLead._id ? response.data : lead
      );
      // Re-sort to ensure latest closed is on top
      updatedLeads = updatedLeads.sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt));
      setLeads(updatedLeads);
      handleClosePopup();
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
    }
  };

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";
  };

  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm">{error}</div>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="max-w-full mx-4 md:mx-8 p-2 md:p-6 bg-white min-h-screen">
        
        {/* --- JIRA-STYLE FILTER BAR --- */}
        <Box className="sticky top-0 z-40 bg-white pb-4 pt-2 mb-6" sx={{ borderBottom: '2px solid #EBECF0' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
            <TextField
              size="small"
              placeholder="Search by name or email..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              sx={{ width: { xs: '100%', md: '50%' }, '& .MuiOutlinedInput-root': { borderRadius: '3px' } }}
            />
          </div>

          <Grid container spacing={2} alignItems="center">
            {/* Filter by Caller (Lead Owner) */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Caller</InputLabel>
                <Select
                  value={selectedLeadOwner}
                  onChange={(e) => { setSelectedLeadOwner(e.target.value); setPage(1); }}
                  label="Filter by Caller"
                  sx={{ borderRadius: '3px' }}
                >
                  <MenuItem value=""><em>All Callers</em></MenuItem>
                  {uniqueLeadOwners.map((owner, idx) => (
                    <MenuItem key={idx} value={owner}>{owner}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Transferred To */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Transferred To</InputLabel>
                <Select
                  value={assignedToFilter}
                  onChange={(e) => { setAssignedToFilter(e.target.value); setPage(1); }}
                  label="Transferred To"
                  sx={{ borderRadius: '3px' }}
                >
                  <MenuItem value=""><em>All Staff</em></MenuItem>
                  {assignedUsers.map((user) => (
                    <MenuItem key={user} value={user}>{user}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Service Type */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={serviceTypeFilter}
                  onChange={(e) => { setServiceTypeFilter(e.target.value); setPage(1); }}
                  label="Service Type"
                  sx={{ borderRadius: '3px' }}
                >
                  <MenuItem value=""><em>All Services</em></MenuItem>
                  {serviceTypes.map((type) => (
                    <MenuItem key={type._id} value={type.name}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Preset Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Closed Date Range</InputLabel>
                <Select
                  value={dateFilterType}
                  onChange={(e) => { setDateFilterType(e.target.value); setPage(1); }}
                  label="Closed Date Range"
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
          <Table size="small" sx={{ minWidth: 1000 }} aria-label="closed leads list">
            <TableHead sx={{ backgroundColor: '#F4F5F7' }}>
              <TableRow>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', paddingY: '12px' }}>Client Info</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Location</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Caller Name</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Transferred To</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Closed Info</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Packages</TableCell>
                <TableCell align="right" sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#5E6C84' }}>
                    No closed leads match your current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => (
                  <TableRow 
                    key={lead._id} 
                    hover 
                    sx={{ '&:hover': { backgroundColor: '#FAFBFC' }, '& td': { borderBottom: '1px solid #DFE1E6', paddingY: '10px' } }}
                  >
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
                            {lead.email || "No email"}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#172B4D' }}>
                        {lead.country || "--"}
                      </Typography>
                    </TableCell>

                    {/* Caller Name */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#172B4D' }}>
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
                        <Typography variant="body2" sx={{ color: '#7A869A', fontStyle: 'italic' }}>
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>

                    {/* Closed Info (Date + Lozenge) */}
                    <TableCell>
                      <Stack direction="column" spacing={0.5} alignItems="flex-start">
                        <Chip 
                          label="CLOSED" 
                          size="small" 
                          sx={{ height: '20px', fontSize: '11px', fontWeight: 700, borderRadius: '3px', backgroundColor: '#E3FCEF', color: '#006644' }} 
                        />
                        <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                          {lead.closedAt ? new Date(lead.closedAt).toLocaleDateString() : "--"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Packages */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#5E6C84', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lead.packages?.join(", ") || "--"}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Tooltip title="Edit Lead">
                        <IconButton 
                          onClick={() => handleEditClick(lead)} 
                          size="small"
                          sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* --- PAGINATION --- */}
        <Stack direction="row" justifyContent="flex-end" alignItems="center" className="mt-4 gap-4">
          <FormControl size="small" variant="standard">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ color: '#5E6C84' }}>Rows per page:</Typography>
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                disableUnderline
                sx={{ fontSize: '14px', color: '#172B4D', fontWeight: 500 }}
              >
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Stack>
          </FormControl>
          <Pagination
            count={Math.ceil(filteredLeads.length / rowsPerPage) || 1}
            page={page}
            onChange={handleChangePage}
            shape="rounded"
            size="small"
            sx={{
              '& .MuiPaginationItem-root': { borderRadius: '3px', color: '#42526E' },
              '& .Mui-selected': { backgroundColor: '#0052CC !important', color: 'white' }
            }}
          />
        </Stack>

        {/* --- EDIT MODAL --- */}
        <Dialog open={popupOpen} onClose={handleClosePopup} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '3px', backgroundColor: '#F4F5F7' } }}>
          <DialogTitle sx={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Edit Closed Lead
            <IconButton onClick={handleClosePopup} size="small" sx={{ color: '#42526E' }}>
              <X className="w-5 h-5" />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            {editedLead && (
              <Grid container spacing={3}>
                {/* Left Column: Client Details */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: '#FFFFFF', p: 3, borderRadius: '3px', border: '1px solid #DFE1E6', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <User className="w-4 h-4" /> Client Details
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <TextField size="small" label="Lead Name" name="leadName" fullWidth value={editedLead.leadName || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Designation" name="designation" fullWidth value={editedLead.designation || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Email" name="email" fullWidth value={editedLead.email || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Phone Number" name="phoneNumber" fullWidth value={editedLead.phoneNumber || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Website" name="website" fullWidth value={editedLead.website || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Country" name="country" fullWidth value={editedLead.country || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                    </Stack>
                  </Box>
                </Grid>

                {/* Right Column: Deal Overview */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: '#FFFFFF', p: 3, borderRadius: '3px', border: '1px solid #DFE1E6', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Briefcase className="w-4 h-4" /> Deal Overview
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <TextField size="small" label="Lead Type" name="leadType" fullWidth value={editedLead.leadType || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Caller (Lead Owner)" name="leadOwner" fullWidth value={editedLead.leadOwner || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField size="small" label="Packages (Comma separated)" name="packages" fullWidth value={editedLead.packages || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
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
                      <TextField size="small" label="Status" name="status" fullWidth value={editedLead.status || ""} onChange={handleInputChange} InputProps={{ sx: { borderRadius: '3px' } }} />
                      <TextField 
                        size="small" 
                        label="Notes" 
                        name="note" 
                        fullWidth 
                        multiline 
                        rows={3} 
                        value={editedLead.note || ""} 
                        onChange={handleInputChange} 
                        InputProps={{ sx: { borderRadius: '3px' } }}
                      />
                      <Box sx={{ backgroundColor: '#F4F5F7', p: 1.5, borderRadius: '3px', border: '1px solid #DFE1E6', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar className="w-4 h-4 text-[#5E6C84]" />
                        <Typography variant="caption" sx={{ color: '#172B4D', fontWeight: 500 }}>
                          Closed Date: {editedLead.closedAt ? new Date(editedLead.closedAt).toLocaleString() : "N/A"}
                        </Typography>
                      </Box>
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
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
}

export default ClosedLeads;