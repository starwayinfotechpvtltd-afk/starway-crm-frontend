import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Typography,
  Avatar,
  Button,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  TextField,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Stack,
  InputLabel,
  Tooltip
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Launch } from "@mui/icons-material";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const AssignedLeads = () => {
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(""); // Transferred To
  const [selectedLeadOwner, setSelectedLeadOwner] = useState(""); // Caller
  const [dateFilterType, setDateFilterType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Modal & Pagination State
  const [selectedLead, setSelectedLead] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leadIdToUnassign, setLeadIdToUnassign] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    fetchAssignedLeads();
    fetchUsers();
  }, []);

  const fetchAssignedLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/leads/all-assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedLeads = response.data.sort(
        (a, b) => new Date(b.assignedAt) - new Date(a.assignedAt)
      );
      setAssignedLeads(sortedLeads);
    } catch (error) {
      console.error("Error fetching assigned leads:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/auth/admins-managers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const uniqueLeadOwners = useMemo(() => {
    const owners = assignedLeads.map((lead) => lead.leadOwner).filter(Boolean);
    return [...new Set(owners)];
  }, [assignedLeads]);

  // --- Handlers ---
  const handleUnassign = (leadId) => {
    setLeadIdToUnassign(leadId);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setLeadIdToUnassign(null);
  };

  const handleUnassignConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/leads/unassign/${leadIdToUnassign}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAssignedLeads();
    } catch (error) {
      console.error("Error unassigning lead:", error);
    } finally {
      handleConfirmClose();
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      let updateData = { status: newStatus };
      if (newStatus === "closed") {
        updateData = { ...updateData, closedAt: new Date() };
      } else if (newStatus === "ongoing") {
        updateData = { ...updateData, closedAt: null };
      }

      await axios.put(
        `${API_BASE}/api/leads/update-status/${leadId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAssignedLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === leadId
            ? { ...lead, status: newStatus, closedAt: updateData.closedAt }
            : lead
        )
      );
    } catch (error) {
      console.error("Error updating lead status:", error);
    }
  };

  const handleOpen = (lead) => {
    setSelectedLead(lead);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedLead(null);
    setOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // --- Jira-Style Status Lozenge ---
  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "ongoing") return { bg: '#DEEBFF', color: '#0052CC' }; // Blue
    if (s === "closed") return { bg: '#E3FCEF', color: '#006644' }; // Green
    if (s.includes("hot") || s.includes("urgent")) return { bg: '#FFEBE6', color: '#DE350B' }; // Red
    return { bg: '#DFE1E6', color: '#42526E' }; // Gray default
  };

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

  // --- Filtering Logic ---
  const filteredLeads = assignedLeads.filter((lead) => {
    const searchMatch = lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = selectedStatus !== "all" ? lead.status === selectedStatus : true;
    const assignedToMatch = selectedUser ? lead.assignedTo?._id === selectedUser : true;
    const ownerMatch = selectedLeadOwner ? lead.leadOwner === selectedLeadOwner : true;

    const dateRange = getDateRange();
    const leadDate = dayjs(lead.assignedAt);
    const dateMatch = dateRange ? leadDate.isBetween(dateRange.start, dateRange.end, "day", "[]") : true;

    return searchMatch && statusMatch && assignedToMatch && ownerMatch && dateMatch;
  });

  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="max-w-full mx-4 md:mx-8 p-2 md:p-6 bg-white min-h-screen">
        
        {/* --- JIRA-STYLE FILTER BAR --- */}
        <Box className="sticky top-0 z-40 bg-white pb-4 pt-2 mb-6" sx={{ borderBottom: '2px solid #EBECF0' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
            <TextField
              size="small"
              placeholder="Search by lead name..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', md: '50%' }, '& .MuiOutlinedInput-root': { borderRadius: '3px' } }}
            />
          </div>

          <Grid container spacing={2} alignItems="center">
            {/* Filter by Caller */}
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
                  value={selectedUser}
                  onChange={(e) => { setSelectedUser(e.target.value); setPage(1); }}
                  label="Transferred To"
                  sx={{ borderRadius: '3px' }}
                >
                  <MenuItem value=""><em>All Assignees</em></MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                  label="Status"
                  sx={{ borderRadius: '3px' }}
                >
                  <MenuItem value="all"><em>All Statuses</em></MenuItem>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
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

            {/* Custom Date Range Pickers */}
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
          <Table size="small" sx={{ minWidth: 1000 }} aria-label="assigned leads list">
            <TableHead sx={{ backgroundColor: '#F4F5F7' }}>
              <TableRow>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', paddingY: '12px' }}>Client Info</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Location</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Caller Name</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Transferred To</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Pitched Amount</TableCell>
                <TableCell align="right" sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#5E6C84' }}>
                    No assigned leads match your current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => {
                  return (
                    <TableRow 
                      key={lead._id} 
                      hover 
                      sx={{ '&:hover': { backgroundColor: '#FAFBFC' }, '& td': { borderBottom: '1px solid #DFE1E6', paddingY: '10px' } }}
                    >
                      {/* Client Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar sx={{ bgcolor: '#0052CC', width: 32, height: 32, fontSize: '14px', fontWeight: 'bold' }}>
                            {lead.leadName?.charAt(0).toUpperCase() || "?"}
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

                      {/* Status Dropdown (Inline) */}
                      <TableCell>
                        <Select
                          value={lead.status || "ongoing"}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          size="small"
                          sx={{
                            height: "24px",
                            fontSize: "11px",
                            fontWeight: 700,
                            borderRadius: "3px",
                            backgroundColor: getStatusColor(lead.status).bg,
                            color: getStatusColor(lead.status).color,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& .MuiSelect-select': { paddingRight: '24px !important', paddingLeft: '8px' },
                            '& .MuiSvgIcon-root': { color: getStatusColor(lead.status).color }
                          }}
                        >
                          <MenuItem value="ongoing" sx={{ fontSize: '12px', fontWeight: 600 }}>ONGOING</MenuItem>
                          <MenuItem value="closed" sx={{ fontSize: '12px', fontWeight: 600 }}>CLOSED</MenuItem>
                        </Select>
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
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleUnassign(lead._id)}
                            sx={{
                              height: '28px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#42526E',
                              borderColor: '#DFE1E6',
                              borderRadius: '3px',
                              textTransform: 'none',
                              '&:hover': { backgroundColor: '#FFEBE6', color: '#DE350B', borderColor: '#FFEBE6' }
                            }}
                          >
                            Unassign
                          </Button>
                          <Tooltip title="View Details">
                            <IconButton 
                              onClick={() => handleOpen(lead)} 
                              size="small"
                              sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}
                            >
                              <Launch fontSize="small" />
                            </IconButton>
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

        {/* PAGINATION */}
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
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={30}>30</MenuItem>
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

        {/* --- LEAD DETAILS MODAL --- */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '3px' } }}>
          <DialogTitle sx={{ backgroundColor: '#F4F5F7', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600 }}>
            Assigned Lead Details: {selectedLead?.leadName}
          </DialogTitle>
          <DialogContent className="max-h-[80vh] overflow-y-auto mt-4">
            {selectedLead && (
              <div className="space-y-6">
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Lead Name</Typography>
                    <Typography variant="body2" sx={{ color: '#172B4D', mt: 0.5 }}>{selectedLead.leadName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Email</Typography>
                    <Typography variant="body2" sx={{ color: '#172B4D', mt: 0.5 }}>{selectedLead.email}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Website</Typography>
                    <Typography variant="body2" sx={{ color: '#0052CC', mt: 0.5, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                      {selectedLead.website || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Phone</Typography>
                    <Typography variant="body2" sx={{ color: '#172B4D', mt: 0.5 }}>{selectedLead.phoneNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Designation</Typography>
                    <Typography variant="body2" sx={{ color: '#172B4D', mt: 0.5 }}>{selectedLead.designation || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Country</Typography>
                    <Typography variant="body2" sx={{ color: '#172B4D', mt: 0.5 }}>{selectedLead.country || "N/A"}</Typography>
                  </Grid>
                  
                  {/* Assignment Specific Info */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Transferred To</Typography>
                    <Typography variant="body2" sx={{ color: '#172B4D', mt: 0.5 }}>{selectedLead.assignedTo?.username || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Assignment Date</Typography>
                    <Typography variant="body2" sx={{ color: '#172B4D', mt: 0.5 }}>
                      {selectedLead.assignedAt ? new Date(selectedLead.assignedAt).toLocaleDateString() : "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Lead Status</Typography>
                    <Box sx={{ mt: 0.5 }}>
                       <Chip label={selectedLead.status || "UNKNOWN"} size="small" sx={{ height: '24px', fontSize: '12px', fontWeight: 600, borderRadius: '3px', textTransform: 'uppercase' }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Pitched Amount</Typography>
                    <Typography variant="body2" sx={{ color: '#006644', fontWeight: 600, mt: 0.5 }}>
                      {`${selectedLead.currencySymbol} ${selectedLead.pitchedAmount?.toLocaleString() || 0}`}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Packages</Typography>
                    <Typography variant="body2" sx={{ color: '#172B4D', mt: 0.5 }}>
                      {selectedLead.packages?.join(", ") || "None"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Notes</Typography>
                    <Paper elevation={0} sx={{ backgroundColor: '#F4F5F7', p: 2, mt: 1, borderRadius: '3px', border: '1px solid #DFE1E6' }}>
                      <Typography variant="body2" sx={{ color: '#172B4D', whiteSpace: 'pre-wrap' }}>
                        {selectedLead.note || "No notes available."}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </div>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #DFE1E6', padding: '16px' }}>
            <Button onClick={handleClose} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}>
              Cancel
            </Button>
            <Button onClick={handleClose} variant="contained" sx={{ backgroundColor: '#0052CC', borderRadius: '3px', '&:hover': { backgroundColor: '#0047B3' }, disableElevation: true }}>
              Done
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- CONFIRM UNASSIGN MODAL --- */}
        <Dialog open={confirmOpen} onClose={handleConfirmClose} PaperProps={{ sx: { borderRadius: "3px" } }}>
          <DialogTitle sx={{ backgroundColor: '#F4F5F7', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600 }}>
            Unassign Lead
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#42526E' }}>
              Are you sure you want to unassign this lead? They will be removed from this view and returned to the main pool.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #DFE1E6', padding: '16px' }}>
            <Button onClick={handleConfirmClose} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUnassignConfirm} 
              variant="contained" 
              sx={{ backgroundColor: '#DE350B', borderRadius: '3px', '&:hover': { backgroundColor: '#BF2600' }, disableElevation: true }}
            >
              Unassign Lead
            </Button>
          </DialogActions>
        </Dialog>

      </div>
    </LocalizationProvider>
  );
};

export default AssignedLeads;