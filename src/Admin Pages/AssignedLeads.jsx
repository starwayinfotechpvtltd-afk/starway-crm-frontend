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
  Tooltip,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Modal
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Launch } from "@mui/icons-material";
import { ShieldAlert, X, MessageSquare, Calendar as CalendarIcon, Send } from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const AssignedLeads = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  const loggedInUsername = localStorage.getItem("username");

  // Filter & Toggle States
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityToggle, setVisibilityToggle] = useState("active"); // "active", "dropped", "all"
  const [sortOrder, setSortOrder] = useState("newest");

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLeadOwner, setSelectedLeadOwner] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
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

  // Comments State
  const [openComments, setOpenComments] = useState(false);
  const [activeCommentLead, setActiveCommentLead] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchAssignedLeads(),
          fetchUsers(),
          fetchTeams()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const fetchAssignedLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/leads/all-assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedLeads(response.data);
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
    } catch (error) { console.error("Error fetching users:", error); }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(response.data);
    } catch (error) { console.error("Error fetching teams:", error); }
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
      await axios.put(`${API_BASE}/api/leads/unassign/${leadIdToUnassign}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads(prev => prev.filter(l => l._id !== leadIdToUnassign));
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
      if (newStatus === "closed") updateData.closedAt = new Date();
      else updateData.closedAt = null;

      await axios.put(`${API_BASE}/api/leads/update-status/${leadId}`, updateData, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads((prevLeads) =>
        prevLeads.map((lead) => lead._id === leadId ? { ...lead, status: newStatus, closedAt: updateData.closedAt } : lead)
      );
    } catch (error) { console.error("Error updating lead status:", error); }
  };

  const handleUpdateFollowUp = async (leadId, newDate) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/leads/${leadId}/follow-up`, { followUpDate: newDate }, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads((prev) => prev.map((lead) => lead._id === leadId ? { ...lead, followUpDate: newDate } : lead));
      setSelectedLead((prev) => prev ? { ...prev, followUpDate: newDate } : null);
    } catch (error) { alert("Failed to update follow-up date."); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const token = localStorage.getItem("token");
      const fallbackComment = { text: newComment, postedBy: { username: loggedInUsername }, postedAt: new Date() };
      const res = await axios.post(`${API_BASE}/api/leads/${activeCommentLead._id}/comments`, { text: newComment }, { headers: { Authorization: `Bearer ${token}` } });

      const updatedComments = res.data.comments || [...(activeCommentLead.comments || []), fallbackComment];
      setAssignedLeads((prev) => prev.map(lead => lead._id === activeCommentLead._id ? { ...lead, comments: updatedComments } : lead));
      setActiveCommentLead((prev) => ({ ...prev, comments: updatedComments }));
      setNewComment("");
    } catch (error) { alert("Failed to post comment."); }
    finally { setIsSubmittingComment(false); }
  };

  const handleOpen = (lead) => { setSelectedLead(lead); setOpen(true); };
  const handleClose = () => { setSelectedLead(null); setOpen(false); };
  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(1); };

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "ongoing") return { bg: '#DEEBFF', color: '#0052CC' };
    if (s === "closed") return { bg: '#E3FCEF', color: '#006644' };
    if (s === "dropped") return { bg: '#FFEBE6', color: '#DE350B' };
    if (s.includes("hot") || s.includes("urgent")) return { bg: '#FFEBE6', color: '#DE350B' };
    return { bg: '#DFE1E6', color: '#42526E' };
  };

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

  // --- Filtering & Sorting Logic ---
  const processedLeads = useMemo(() => {
    let filtered = assignedLeads.filter((lead) => {
      if (visibilityToggle === "active" && lead.status === "dropped") return false;
      if (visibilityToggle === "dropped" && lead.status !== "dropped") return false;

      const searchMatch = lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) || lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = selectedStatus !== "all" ? lead.status === selectedStatus : true;
      const assignedToMatch = selectedUser ? lead.assignedTo?._id === selectedUser : true;
      const ownerMatch = selectedLeadOwner ? lead.leadOwner === selectedLeadOwner : true;

      const teamMatch = selectedTeam ? (() => {
        const targetTeam = teams.find(t => t._id === selectedTeam);
        if (!targetTeam) return true;
        const validTeamMembers = [...targetTeam.members.map(m => m.username), targetTeam.manager?.username].filter(Boolean);
        return validTeamMembers.includes(lead.leadOwner);
      })() : true;

      const dateRange = getDateRange();
      const dateMatch = dateRange && lead.assignedAt ? dayjs(lead.assignedAt).isBetween(dateRange.start, dateRange.end, "day", "[]") : true;

      return searchMatch && statusMatch && assignedToMatch && ownerMatch && teamMatch && dateMatch;
    });

    if (sortOrder === "followup_asc" || sortOrder === "followup_desc") {
      filtered.sort((a, b) => {
        if (!a.followUpDate) return 1;
        if (!b.followUpDate) return -1;
        const dateA = new Date(a.followUpDate).getTime();
        const dateB = new Date(b.followUpDate).getTime();
        return sortOrder === "followup_asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      filtered.sort((a, b) => new Date(b.assignedAt || b.createdAt) - new Date(a.assignedAt || a.createdAt));
    }

    return filtered;
  }, [assignedLeads, searchTerm, selectedStatus, selectedUser, selectedLeadOwner, selectedTeam, dateFilterType, startDate, endDate, visibilityToggle, sortOrder, teams]);

  const paginatedLeads = processedLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans">
        <div className="w-10 h-10 border-4 border-[#EBECF0] border-t-[#0052CC] rounded-full animate-spin"></div>
        <p className="mt-4 text-[#5E6C84] text-sm font-medium animate-pulse">Loading assigned leads...</p>
      </div>
    );
  }

  const handleMarkDropped = async (leadId) => {
    if (!window.confirm("Are you sure you want to mark this lead as DROPPED?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/leads/update-status/${leadId}`,
        { status: "dropped" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state so it moves to the "Dropped Leads" toggle view
      setAssignedLeads((prev) =>
        prev.map((lead) => lead._id === leadId ? { ...lead, status: "dropped" } : lead)
      );
    } catch (error) {
      console.error("Error dropping lead:", error);
      alert("Failed to drop lead.");
    }
  };

  // NEW: handleUndrop to bring a lead back to the active pipeline
  const handleUndrop = async (leadId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/leads/update-status/${leadId}`,
        { status: "ongoing" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state so it moves back to the "Active Pipeline" toggle view
      setAssignedLeads((prev) =>
        prev.map((lead) => lead._id === leadId ? { ...lead, status: "ongoing" } : lead)
      );
    } catch (error) {
      console.error("Error undropping lead:", error);
      alert("Failed to undrop lead.");
    }
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="max-w-full mx-4 md:mx-8 p-2 md:p-6 bg-white min-h-screen">

        {/* --- SEARCH BAR (With Bottom Padding) --- */}
        <div className="mb-8">
          <TextField
            fullWidth
            size="small"
            placeholder="Search by lead name or email..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            sx={{ backgroundColor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '3px' } }}
          />
        </div>

        {/* --- TOGGLES & FILTERS --- */}
        <Box className="sticky top-0 z-40 bg-white pb-4 pt-2 mb-6" sx={{ borderBottom: '2px solid #EBECF0' }}>

          {/* Top Row: Pipeline Toggle & Sorting */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-[#DFE1E6] pb-4">
            <ToggleButtonGroup
              color="primary"
              value={visibilityToggle}
              exclusive
              onChange={(e, val) => { if (val) { setVisibilityToggle(val); setPage(1); } }}
              size="small"
              sx={{ backgroundColor: '#FFFFFF', height: '36px' }}
            >
              <ToggleButton value="active" sx={{ textTransform: 'none', px: 3, fontWeight: 600 }}>Active Pipeline</ToggleButton>
              <ToggleButton value="dropped" sx={{ textTransform: 'none', px: 3, fontWeight: 600 }}>Dropped Leads</ToggleButton>
              <ToggleButton value="all" sx={{ textTransform: 'none', px: 3, fontWeight: 600 }}>All Leads</ToggleButton>
            </ToggleButtonGroup>

            <FormControl size="small" sx={{ minWidth: 200, backgroundColor: '#FFFFFF' }}>
              <Select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setPage(1); }} displayEmpty sx={{ borderRadius: '3px', fontSize: '13px', fontWeight: 500 }}>
                <MenuItem value="newest"><em>Sort: Newest First</em></MenuItem>
                <MenuItem value="followup_asc">Follow-up: Nearest to Farthest</MenuItem>
                <MenuItem value="followup_desc">Follow-up: Farthest to Nearest</MenuItem>
              </Select>
            </FormControl>
          </div>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Team</InputLabel>
                <Select value={selectedTeam} onChange={(e) => { setSelectedTeam(e.target.value); setPage(1); }} label="Filter by Team" sx={{ borderRadius: '3px' }}>
                  <MenuItem value=""><em>All Teams</em></MenuItem>
                  {teams.map((team) => <MenuItem key={team._id} value={team._id}>{team.teamName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Caller</InputLabel>
                <Select value={selectedLeadOwner} onChange={(e) => { setSelectedLeadOwner(e.target.value); setPage(1); }} label="Filter by Caller" sx={{ borderRadius: '3px' }}>
                  <MenuItem value=""><em>All Callers</em></MenuItem>
                  {uniqueLeadOwners.map((owner, idx) => <MenuItem key={idx} value={owner}>{owner}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Transferred To</InputLabel>
                <Select value={selectedUser} onChange={(e) => { setSelectedUser(e.target.value); setPage(1); }} label="Transferred To" sx={{ borderRadius: '3px' }}>
                  <MenuItem value=""><em>All Assignees</em></MenuItem>
                  {users.map((user) => <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }} label="Status" sx={{ borderRadius: '3px' }}>
                  <MenuItem value="all"><em>All Sub-Statuses</em></MenuItem>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                  <MenuItem value="dropped">Dropped</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Assignment Date</InputLabel>
                <Select value={dateFilterType} onChange={(e) => { setDateFilterType(e.target.value); setPage(1); }} label="Assignment Date" sx={{ borderRadius: '3px' }}>
                  <MenuItem value=""><em>All Time</em></MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="custom">Custom Range...</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {dateFilterType === "custom" && (
              <>
                <Grid item xs={6} sm={3} md={1}>
                  <DatePicker label="Start" value={startDate} onChange={(newValue) => setStartDate(newValue)} slotProps={{ textField: { size: "small", fullWidth: true, sx: { borderRadius: '3px' } } }} />
                </Grid>
                <Grid item xs={6} sm={3} md={1}>
                  <DatePicker label="End" value={endDate} onChange={(newValue) => setEndDate(newValue)} slotProps={{ textField: { size: "small", fullWidth: true, sx: { borderRadius: '3px' } } }} />
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
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Transferred To</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Follow-up</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Pitched Amount</TableCell>
                <TableCell align="right" sx={{ color: '#5E6C84', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: '#5E6C84' }}>No assigned leads match your current filters.</TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => {
                  const latestComment = lead.comments && lead.comments.length > 0 ? lead.comments[lead.comments.length - 1] : null;

                  return (
                    <TableRow key={lead._id} hover sx={{ '&:hover': { backgroundColor: '#FAFBFC' }, '& td': { borderBottom: '1px solid #DFE1E6', paddingY: '10px' }, opacity: lead.status === 'dropped' ? 0.65 : 1 }}>

                      {/* Client Info & Latest Update */}
                      <TableCell sx={{ maxWidth: '300px' }}>
                        <div className="flex items-start gap-3">
                          <Avatar sx={{ bgcolor: '#0052CC', width: 32, height: 32, fontSize: '14px', fontWeight: 'bold' }}>{lead.leadName?.charAt(0).toUpperCase() || "?"}</Avatar>
                          <div className="flex flex-col">
                            <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 600 }}>{lead.leadName || "N/A"}</Typography>
                            <Typography variant="caption" sx={{ color: '#5E6C84' }}>{lead.email} • Caller: {lead.leadOwner}</Typography>
                            {/* Latest Comment Snippet */}
                            {latestComment && (
                              <div className="bg-[#EBECF0] px-2 py-1 rounded-[3px] mt-1 inline-block">
                                <Typography sx={{ fontSize: '11px', color: '#42526E', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  <span className="font-bold mr-1">{latestComment.postedBy?.username || "Unknown"}:</span>
                                  "{latestComment.text}"
                                </Typography>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Transferred To */}
                      <TableCell>
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: '#FFAB00' }}>{lead.assignedTo.username.charAt(0).toUpperCase()}</Avatar>
                            <Typography variant="body2" sx={{ color: '#172B4D' }}>{lead.assignedTo.username}</Typography>
                          </div>
                        ) : (<Typography variant="body2" sx={{ color: '#7A869A', fontStyle: 'italic' }}>Unassigned</Typography>)}
                      </TableCell>

                      {/* Follow-up Date */}
                      <TableCell>
                        {lead.followUpDate ? (
                          <div className="flex items-center gap-1 text-[#0052CC] bg-[#DEEBFF] px-2 py-1 rounded-[3px] inline-flex">
                            <CalendarIcon size={12} />
                            <Typography sx={{ fontSize: '11px', fontWeight: 600 }}>{dayjs(lead.followUpDate).format('MMM DD, YYYY')}</Typography>
                          </div>
                        ) : (<Typography sx={{ fontSize: '12px', color: '#7A869A' }}>No Date Set</Typography>)}
                      </TableCell>

                      {/* Status Dropdown */}
                      <TableCell>
                        <Select
                          value={lead.status || "ongoing"}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          size="small"
                          sx={{
                            height: "24px", fontSize: "11px", fontWeight: 700, borderRadius: "3px",
                            backgroundColor: getStatusColor(lead.status).bg, color: getStatusColor(lead.status).color,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& .MuiSelect-select': { paddingRight: '24px !important', paddingLeft: '8px' },
                            '& .MuiSvgIcon-root': { color: getStatusColor(lead.status).color }
                          }}
                        >
                          <MenuItem value="ongoing" sx={{ fontSize: '12px', fontWeight: 600 }}>ONGOING</MenuItem>
                          <MenuItem value="closed" sx={{ fontSize: '12px', fontWeight: 600 }}>CLOSED</MenuItem>
                          <MenuItem value="dropped" sx={{ fontSize: '12px', fontWeight: 600 }}>DROPPED</MenuItem>
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
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">

                          {/* Conditional Button: Show 'Drop' for active leads, 'Undrop' for dropped leads */}
                          {lead.status === "dropped" ? (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleUndrop(lead._id)}
                              sx={{
                                height: '28px', fontSize: '12px', fontWeight: 600, color: '#006644',
                                borderColor: '#E3FCEF', backgroundColor: '#E3FCEF', textTransform: 'none',
                                '&:hover': { backgroundColor: '#D3F9E8', borderColor: '#D3F9E8' }
                              }}
                            >
                              Undrop
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleMarkDropped(lead._id)}
                              sx={{
                                height: '28px', fontSize: '12px', fontWeight: 600, color: '#DE350B',
                                borderColor: '#DFE1E6', textTransform: 'none',
                                '&:hover': { backgroundColor: '#FFEBE6', color: '#BF2600', borderColor: '#FFBDAD' }
                              }}
                            >
                              Drop
                            </Button>
                          )}

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleUnassign(lead._id)}
                            sx={{
                              height: '28px', fontSize: '12px', fontWeight: 600, color: '#42526E',
                              borderColor: '#DFE1E6', borderRadius: '3px', textTransform: 'none',
                              '&:hover': { backgroundColor: '#EBECF0', borderColor: '#DFE1E6' }
                            }}
                          >
                            Unassign
                          </Button>

                          <IconButton
                            size="small"
                            onClick={() => { setActiveCommentLead(lead); setOpenComments(true); }}
                            sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', padding: '4px' }}
                          >
                            <Badge badgeContent={lead.comments?.length || 0} color="primary">
                              <MessageSquare size={16} color="#42526E" />
                            </Badge>
                          </IconButton>

                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleOpen(lead)}
                              size="small"
                              sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', padding: '4px', color: '#42526E' }}
                            >
                              <Launch fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="flex-end" alignItems="center" className="mt-4 gap-4">
          <FormControl size="small" variant="standard">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" sx={{ color: '#5E6C84' }}>Rows per page:</Typography>
              <Select value={rowsPerPage} onChange={handleChangeRowsPerPage} disableUnderline sx={{ fontSize: '14px', color: '#172B4D', fontWeight: 500 }}>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={30}>30</MenuItem>
              </Select>
            </Stack>
          </FormControl>
          <Pagination count={Math.ceil(processedLeads.length / rowsPerPage) || 1} page={page} onChange={handleChangePage} shape="rounded" size="small" sx={{ '& .MuiPaginationItem-root': { borderRadius: '3px', color: '#42526E' }, '& .Mui-selected': { backgroundColor: '#0052CC !important', color: 'white' } }} />
        </Stack>

        {/* --- COMMENTS DIALOG --- */}
        <Modal open={openComments} onClose={() => setOpenComments(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#091E42]/50">
          <div className="bg-white rounded-[3px] shadow-xl w-full max-w-lg flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#FAFBFC]">
              <Typography variant="h6" sx={{ color: '#172B4D', fontWeight: 600, fontSize: '16px' }}>Team Comments</Typography>
              <IconButton onClick={() => setOpenComments(false)} size="small"><X className="w-5 h-5" /></IconButton>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FFFFFF]">
              {activeCommentLead?.comments?.length > 0 ? (
                activeCommentLead.comments.map((comment, i) => (
                  <div key={i} className="bg-[#FAFBFC] border border-[#DFE1E6] p-3 rounded-[3px]">
                    <div className="flex justify-between items-center mb-1">
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{comment.postedBy?.username || "Unknown"}</Typography>
                      <Typography sx={{ fontSize: '11px', color: '#6B778C' }}>{dayjs(comment.postedAt).format('MMM DD, HH:mm')}</Typography>
                    </div>
                    <Typography sx={{ fontSize: '14px', color: '#172B4D', whiteSpace: 'pre-wrap' }}>{comment.text}</Typography>
                  </div>
                ))
              ) : (
                <div className="text-center text-[#6B778C] mt-10 text-sm">No comments on this lead yet.</div>
              )}
            </div>

            <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC]">
              <div className="flex gap-2">
                <TextField fullWidth size="small" placeholder="Type a comment..." multiline maxRows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} sx={{ backgroundColor: '#FFFFFF' }} />
                <Button variant="contained" disabled={isSubmittingComment || !newComment.trim()} onClick={handleAddComment} sx={{ backgroundColor: '#0052CC', minWidth: '48px', px: 0 }}>
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* --- LEAD DETAILS MODAL --- */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '3px', backgroundColor: '#F4F5F7' } }}>
          <DialogTitle sx={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Assigned Lead Details: {selectedLead?.leadName}
            <IconButton onClick={handleClose} size="small" sx={{ color: '#42526E' }}><X className="w-5 h-5" /></IconButton>
          </DialogTitle>
          <DialogContent className="max-h-[80vh] overflow-y-auto mt-4 px-6 pb-6">
            {selectedLead && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: '#FFFFFF', p: 3, borderRadius: '3px', border: '1px solid #DFE1E6', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase', mb: 2, display: 'block' }}>Contact Information</Typography>
                    <Stack spacing={2}>
                      <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Name</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.leadName}</Typography></div>
                      <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Email</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.email}</Typography></div>
                      <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Phone</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.phoneNumber}</Typography></div>
                      <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Website</Typography><Typography sx={{ fontSize: '14px', color: '#0052CC', cursor: 'pointer' }}>{selectedLead.website || "N/A"}</Typography></div>
                      <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Country</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.country}</Typography></div>
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: '#FFFFFF', p: 3, borderRadius: '3px', border: '1px solid #DFE1E6', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600, textTransform: 'uppercase', mb: 2, display: 'block' }}>Strategy & Follow-up</Typography>
                    <Stack spacing={3}>
                      <div>
                        <Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Follow-up Date</Typography>
                        <DatePicker
                          value={selectedLead.followUpDate ? dayjs(selectedLead.followUpDate) : null}
                          onChange={(newValue) => handleUpdateFollowUp(selectedLead._id, newValue ? newValue.toISOString() : null)}
                          slotProps={{ textField: { size: "small", fullWidth: true, sx: { backgroundColor: '#FAFBFC' } } }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Transferred To</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.assignedTo?.username || "N/A"}</Typography></div>
                        <div><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Pitched Amount</Typography><Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#006644' }}>{selectedLead.currencySymbol || "$"}{selectedLead.pitchedAmount?.toLocaleString()}</Typography></div>
                      </div>
                      <div>
                        <Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Original Note</Typography>
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
            <Button onClick={handleClose} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' }, textTransform: 'none', fontWeight: 500 }}>Close Details</Button>
          </DialogActions>
        </Dialog>

        {/* --- CONFIRM UNASSIGN MODAL --- */}
        <Dialog open={confirmOpen} onClose={handleConfirmClose} PaperProps={{ sx: { borderRadius: "3px" } }}>
          <DialogTitle sx={{ backgroundColor: '#F4F5F7', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600 }}>Unassign Lead</DialogTitle>
          <DialogContent sx={{ mt: 3 }}><Typography variant="body2" sx={{ color: '#42526E' }}>Are you sure you want to unassign this lead? They will be removed from this view and returned to the main pool.</Typography></DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #DFE1E6', padding: '16px' }}>
            <Button onClick={handleConfirmClose} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}>Cancel</Button>
            <Button onClick={handleUnassignConfirm} variant="contained" sx={{ backgroundColor: '#DE350B', borderRadius: '3px', '&:hover': { backgroundColor: '#BF2600' }, disableElevation: true }}>Unassign Lead</Button>
          </DialogActions>
        </Dialog>

      </div>
    </LocalizationProvider>
  );
};

export default AssignedLeads;