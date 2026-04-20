import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Avatar,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Visibility, Launch } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

// Extend dayjs with the isBetween plugin
dayjs.extend(isBetween);

const NewLeads = () => {
  const [leads, setLeads] = useState([]);
  const [callers, setCallers] = useState([]);
  const [adminsManagers, setAdminsManagers] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilterType, setDateFilterType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedAssignedTo, setSelectedAssignedTo] = useState("");
  const [selectedCreatedBy, setSelectedCreatedBy] = useState("");
  const [showTransfersOnly, setShowTransfersOnly] = useState(false);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  
  // UI States
  const [selectedLead, setSelectedLead] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [uniqueLeadOwners, setUniqueLeadOwners] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15); // Jira-like compact view allows more rows

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const leadsResponse = await axios.get(`${API_BASE}/api/leads/new`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeads(leadsResponse.data);

        const owners = [
          ...new Set(leadsResponse.data.map((lead) => lead.leadOwner)),
        ];
        setUniqueLeadOwners(owners);

        const adminsManagersResponse = await axios.get(
          `${API_BASE}/api/auth/admins-managers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAdminsManagers(adminsManagersResponse.data);

        const callersResponse = await axios.get(
          `${API_BASE}/api/auth/callers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCallers(callersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
          ? {
              start: startDate.startOf("day"),
              end: endDate.endOf("day"),
            }
          : null;
      default:
        return null;
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const searchMatch = lead.leadName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const dateRange = getDateRange();
    const leadDate = dayjs(lead.createdAt);
    const dateMatch = dateRange
      ? leadDate.isBetween(dateRange.start, dateRange.end, "day", "[]")
      : true;

    const assignedToMatch = selectedAssignedTo
      ? lead.assignedTo?._id === selectedAssignedTo
      : true;
      
    const createdByMatch = selectedCreatedBy
      ? lead.leadOwner === selectedCreatedBy
      : true;

    // Toggle logic
    const transfersMatch = showTransfersOnly ? Boolean(lead.assignedTo) : true;
    const unassignedMatch = showUnassignedOnly ? !lead.assignedTo : true;

    return (
      searchMatch &&
      dateMatch &&
      assignedToMatch &&
      createdByMatch &&
      transfersMatch &&
      unassignedMatch
    );
  });

  const handleOpenModal = (lead) => {
    setSelectedLead(lead);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedLead(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Prevent conflicting toggles
  const handleTransferToggle = (e) => {
    setShowTransfersOnly(e.target.checked);
    if (e.target.checked) setShowUnassignedOnly(false);
  };

  const handleUnassignedToggle = (e) => {
    setShowUnassignedOnly(e.target.checked);
    if (e.target.checked) setShowTransfersOnly(false);
  };

  const paginatedLeads = filteredLeads.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Jira-like Status Lozenge Styling
  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("hot") || s.includes("urgent")) return { bg: '#FFEBE6', color: '#DE350B' }; // Red
    if (s.includes("new") || s.includes("active")) return { bg: '#E3FCEF', color: '#006644' }; // Green
    if (s.includes("contacted") || s.includes("progress")) return { bg: '#DEEBFF', color: '#0052CC' }; // Blue
    return { bg: '#DFE1E6', color: '#42526E' }; // Gray default
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="max-w-full mx-4 md:mx-8 p-2 md:p-6 bg-white min-h-screen">
        
        {/* --- JIRA-STYLE FILTER BAR --- */}
        <Box 
          className="sticky top-0 z-40 bg-white pb-4 pt-2 mb-6"
          sx={{ borderBottom: '2px solid #EBECF0' }} 
        >
          <div className="flex flex-col md:flex-row justify-start items-start md:items-end gap-4 mb-4">
            <TextField
              size="small"
              placeholder="Search by lead name..."
              variant="outlined"
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', md: '50%' }, '& .MuiOutlinedInput-root': { borderRadius: '3px' } }}
            />

          </div>

          <Grid container spacing={2} alignItems="center">
            {/* Caller Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Caller</InputLabel>
                <Select
                  value={selectedCreatedBy}
                  onChange={(e) => setSelectedCreatedBy(e.target.value)}
                  label="Filter by Caller"
                  sx={{ borderRadius: '3px' }}
                >
                  <MenuItem value=""><em>All Callers</em></MenuItem>
                  {uniqueLeadOwners.map((owner) => (
                    <MenuItem key={owner} value={owner}>{owner}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Transferred To Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Transferred To</InputLabel>
                <Select
                  value={selectedAssignedTo}
                  onChange={(e) => setSelectedAssignedTo(e.target.value)}
                  label="Transferred To"
                  sx={{ borderRadius: '3px' }}
                  disabled={showUnassignedOnly}
                >
                  <MenuItem value=""><em>All Staff</em></MenuItem>
                  {adminsManagers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Preset Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilterType}
                  onChange={(e) => setDateFilterType(e.target.value)}
                  label="Date Range"
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

            {/* Quick Toggles */}
            <Grid item xs={12} md={dateFilterType === 'custom' ? 12 : 4}>
              <Stack direction="row" spacing={2} className="pl-2">
                <FormControlLabel
                  control={<Switch size="small" checked={showTransfersOnly} onChange={handleTransferToggle} color="primary" />}
                  label={<Typography variant="body2" className="text-[#42526E] font-medium">Transfers Only</Typography>}
                />
                <FormControlLabel
                  control={<Switch size="small" checked={showUnassignedOnly} onChange={handleUnassignedToggle} color="secondary" />}
                  label={<Typography variant="body2" className="text-[#42526E] font-medium">Unassigned Only</Typography>}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* --- JIRA-STYLE LIST (TABLE) --- */}
        <TableContainer 
          component={Paper} 
          elevation={0} 
          sx={{ border: '1px solid #DFE1E6', borderRadius: '3px' }}
        >
          <Table size="small" sx={{ minWidth: 1000 }} aria-label="leads list">
            <TableHead sx={{ backgroundColor: '#F4F5F7' }}>
              <TableRow>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', paddingY: '12px' }}>Client Info</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Location</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Caller Name</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Transferred To</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Status & Type</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Pitched Amount</TableCell>
                <TableCell align="right" sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#5E6C84' }}>
                    No leads match your current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => {
                  const statusColors = getStatusColor(lead.leadStatus || lead.leadType);
                  return (
                    <TableRow 
                      key={lead._id} 
                      hover 
                      sx={{ 
                        '&:hover': { backgroundColor: '#FAFBFC' },
                        '& td': { borderBottom: '1px solid #DFE1E6', paddingY: '10px' }
                      }}
                    >
                      {/* Client Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar sx={{ bgcolor: '#0052CC', width: 32, height: 32, fontSize: '14px', fontWeight: 'bold' }}>
                            {lead.leadName?.charAt(0).toUpperCase() || "?"}
                          </Avatar>
                          <div className="flex flex-col">
                            <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 600 }}>
                              {lead.leadName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                              {lead.email}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                              {lead.phoneNumber}
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

                      {/* Status & Type */}
                      <TableCell>
                        <Stack direction="column" spacing={1} alignItems="flex-start">
                          {lead.leadStatus && (
                            <Chip 
                              label={lead.leadStatus.toUpperCase()} 
                              size="small" 
                              sx={{ 
                                height: '20px', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                borderRadius: '3px',
                                backgroundColor: statusColors.bg,
                                color: statusColors.color
                              }} 
                            />
                          )}
                          <Chip 
                            label={(lead.leadType || "Uncategorized").toUpperCase()} 
                            size="small" 
                            sx={{ 
                              height: '20px', 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              borderRadius: '3px',
                              backgroundColor: '#EBECF0',
                              color: '#42526E'
                            }} 
                          />
                        </Stack>
                      </TableCell>

                      {/* Pitched Amount */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#006644' }}>
                          {lead.currencySymbol} {lead.pitchedAmount?.toLocaleString() || 0}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Tooltip title="View Lead Details">
                          <IconButton 
                            onClick={() => handleOpenModal(lead)} 
                            size="small"
                            sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}
                          >
                            <Launch fontSize="small" />
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

        {/* PAGINATION */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          className="mt-4 gap-4"
        >
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

        {/* --- LEAD DETAILS MODAL --- */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: '3px' } }}
        >
          <DialogTitle sx={{ backgroundColor: '#F4F5F7', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600 }}>
            Lead Details: {selectedLead?.leadName}
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
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Pitched Amount</Typography>
                    <Typography variant="body2" sx={{ color: '#006644', fontWeight: 600, mt: 0.5 }}>
                      {`${selectedLead.currencySymbol} ${selectedLead.pitchedAmount?.toLocaleString() || 0}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase' }}>Lead Status</Typography>
                    <Box sx={{ mt: 0.5 }}>
                       <Chip label={selectedLead.leadStatus || "UNKNOWN"} size="small" sx={{ height: '24px', fontSize: '12px', fontWeight: 600, borderRadius: '3px' }} />
                    </Box>
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
            <Button onClick={handleCloseModal} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}>
              Cancel
            </Button>
            <Button onClick={handleCloseModal} variant="contained" sx={{ backgroundColor: '#0052CC', borderRadius: '3px', '&:hover': { backgroundColor: '#0047B3' }, disableElevation: true }}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default NewLeads;