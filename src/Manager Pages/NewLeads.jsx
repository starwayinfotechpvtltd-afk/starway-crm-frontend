import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Typography,
  Avatar,
  Button,
  Select,
  MenuItem,
  FormControl,
  Modal,
  CircularProgress,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Pagination,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from "@mui/material";
import { Launch } from "@mui/icons-material";
import { ShieldAlert, X, MessageSquare, Calendar as CalendarIcon, Send } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const AssignedLeads = () => {
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User Role Checking
  const userRole = localStorage.getItem("role") || "";
  const canEditAdvanced = userRole === "admin" || userRole === "manager";
  const loggedInUsername = localStorage.getItem("username");

  // Filters & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityToggle, setVisibilityToggle] = useState("active"); 
  const [sortOrder, setSortOrder] = useState("newest"); 
  
  const [selectedTeamMember, setSelectedTeamMember] = useState("all");
  const [selectedTransferredTo, setSelectedTransferredTo] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedService, setSelectedService] = useState("all");

  // Pagination & Modals
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedLead, setSelectedLead] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  
  // Confirmation Dialog States
  const [confirmUnassignOpen, setConfirmUnassignOpen] = useState(false);
  const [leadToUnassign, setLeadToUnassign] = useState(null);

  const [confirmDropOpen, setConfirmDropOpen] = useState(false);
  const [leadToDrop, setLeadToDrop] = useState(null);

  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [leadToClose, setLeadToClose] = useState(null);
  
  // Comments State
  const [openComments, setOpenComments] = useState(false);
  const [activeCommentLead, setActiveCommentLead] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    fetchAssignedLeads();
  }, []);

  const fetchAssignedLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/leads/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedLeads(response.data);
    } catch (error) {
      console.error("Error fetching assigned leads:", error);
      setError("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleOpenUnassignConfirm = (lead) => {
    setLeadToUnassign(lead);
    setConfirmUnassignOpen(true);
  };

  const handleUnassignConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/leads/unassign/${leadToUnassign._id}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedLeads((prev) => prev.filter((l) => l._id !== leadToUnassign._id));
      setConfirmUnassignOpen(false);
    } catch (error) {
      alert("Failed to unassign lead.");
    }
  };

  const handleOpenDropConfirm = (lead) => {
    setLeadToDrop(lead);
    setConfirmDropOpen(true);
  };

  const handleDropConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/leads/update-status/${leadToDrop._id}`, { status: "dropped" }, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads((prev) => prev.map((lead) => lead._id === leadToDrop._id ? { ...lead, status: "dropped" } : lead));
      setConfirmDropOpen(false);
    } catch (error) { 
      alert("Failed to drop lead."); 
    }
  };

  const handleOpenCloseConfirm = (lead) => {
    setLeadToClose(lead);
    setConfirmCloseOpen(true);
  };

  const handleCloseConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/leads/update-status/${leadToClose._id}`, { status: "closed" }, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads((prev) => prev.map((lead) => lead._id === leadToClose._id ? { ...lead, status: "closed" } : lead));
      setConfirmCloseOpen(false);
    } catch (error) { 
      alert("Failed to close lead."); 
    }
  };

  const handleUndrop = async (leadId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/leads/update-status/${leadId}`, { status: "ongoing" }, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads((prev) => prev.map((lead) => lead._id === leadId ? { ...lead, status: "ongoing" } : lead));
    } catch (error) { 
      alert("Failed to undrop lead."); 
    }
  };

  const handleUpdateFollowUp = async (leadId, newDate) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/leads/${leadId}/follow-up`, { followUpDate: newDate }, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads((prev) => prev.map((lead) => lead._id === leadId ? { ...lead, followUpDate: newDate } : lead));
      setSelectedLead((prev) => ({ ...prev, followUpDate: newDate }));
    } catch (error) { 
      alert("Failed to update follow-up date."); 
    }
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
    } catch (error) {
      alert("Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "?";

  const renderStatus = (status) => {
    const s = (status || "ongoing").toLowerCase();
    let bg = "bg-[#DEEBFF]", text = "text-[#0052CC]";
    if (s === "closed") { bg = "bg-[#E3FCEF]"; text = "text-[#006644]"; }
    if (s === "dropped") { bg = "bg-[#FFEBE6]"; text = "text-[#DE350B]"; }
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-bold tracking-wider ${bg} ${text}`}>
        {s.toUpperCase()}
      </div>
    );
  };

  const processedLeads = useMemo(() => {
    let filtered = assignedLeads.filter((lead) => {
      if (visibilityToggle === "active" && lead.status === "dropped") return false;
      if (visibilityToggle === "dropped" && lead.status !== "dropped") return false;
      if (selectedStatus !== "all" && lead.status !== selectedStatus) return false;
      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        if (!lead.leadName?.toLowerCase().includes(lowerQ) && !lead.email?.toLowerCase().includes(lowerQ)) return false;
      }
      return true;
    });

    if (sortOrder.includes("followup")) {
      filtered.sort((a, b) => {
        if (!a.followUpDate) return 1; 
        if (!b.followUpDate) return -1;
        const dateA = new Date(a.followUpDate).getTime();
        const dateB = new Date(b.followUpDate).getTime();
        return sortOrder === "followup_asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return filtered;
  }, [assignedLeads, selectedStatus, searchQuery, visibilityToggle, sortOrder]);

  const paginatedLeads = processedLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]"><CircularProgress /></div>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-[#FAFBFC] p-4 md:p-8 font-sans">
        
        <div className="mb-8">
          <TextField 
            fullWidth size="small" placeholder="Search by lead name or email..." 
            value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} 
            sx={{ backgroundColor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '3px' } }} 
          />
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#DFE1E6] pb-4">
            <ToggleButtonGroup
              color="primary" value={visibilityToggle} exclusive
              onChange={(e, val) => { if(val) { setVisibilityToggle(val); setPage(1); } }}
              size="small" sx={{ backgroundColor: '#FFFFFF', height: '36px' }}
            >
              <ToggleButton value="active" sx={{ textTransform: 'none', px: 3, fontWeight: 600 }}>Active Pipeline</ToggleButton>
              <ToggleButton value="dropped" sx={{ textTransform: 'none', px: 3, fontWeight: 600 }}>Dropped Leads</ToggleButton>
              <ToggleButton value="all" sx={{ textTransform: 'none', px: 3, fontWeight: 600 }}>All Leads</ToggleButton>
            </ToggleButtonGroup>

            <FormControl size="small" sx={{ minWidth: 200, backgroundColor: '#FFFFFF' }}>
              <Select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setPage(1); }} displayEmpty sx={{ borderRadius: '3px', fontSize: '13px' }}>
                <MenuItem value="newest"><em>Sort: Newest First</em></MenuItem>
                <MenuItem value="followup_asc">Follow-up: Nearest to Farthest</MenuItem>
                <MenuItem value="followup_desc">Follow-up: Farthest to Nearest</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px' }}>
          <Table sx={{ minWidth: 1000 }} size="small">
            <TableHead sx={{ backgroundColor: '#F4F5F7' }}>
              <TableRow>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', py: 2 }}>Client Info</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Transferred From</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Follow-up</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="right" sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.map((lead) => (
                <TableRow key={lead._id} hover sx={{ '& td': { borderBottom: '1px solid #DFE1E6' }, opacity: lead.status === 'dropped' ? 0.65 : 1 }}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <Avatar sx={{ bgcolor: '#0052CC', width: 32, height: 32, fontSize: '14px', fontWeight: 'bold' }}>{getInitials(lead.leadName)}</Avatar>
                      <div>
                        <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 600 }}>{lead.leadName}</Typography>
                        <Typography variant="caption" sx={{ color: '#6B778C' }}>Caller: {lead.leadOwner}</Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{lead.leadOwner || "Admin"}</Typography>
                  </TableCell>
                  <TableCell>
                    {lead.followUpDate ? (
                      <div className="flex items-center gap-1 text-[#0052CC] bg-[#DEEBFF] px-2 py-1 rounded-[3px] inline-flex">
                        <CalendarIcon size={12} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 600 }}>{dayjs(lead.followUpDate).format('MMM DD, YYYY')}</Typography>
                      </div>
                    ) : "--"}
                  </TableCell>
                  <TableCell>{renderStatus(lead.status)}</TableCell>
                  
                  {/* Actions Column */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                      
                      {/* Dynamic Status Buttons */}
                      {lead.status === "dropped" && (
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
                      )}

                      {lead.status !== "dropped" && lead.status !== "closed" && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenCloseConfirm(lead)}
                            sx={{
                              height: '28px', fontSize: '12px', fontWeight: 600, color: '#006644', 
                              borderColor: '#E3FCEF', backgroundColor: '#E3FCEF', textTransform: 'none',
                              '&:hover': { backgroundColor: '#D3F9E8', borderColor: '#D3F9E8' }
                            }}
                          >
                            Close
                          </Button>

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenDropConfirm(lead)}
                            sx={{
                              height: '28px', fontSize: '12px', fontWeight: 600, color: '#DE350B', 
                              borderColor: '#DFE1E6', textTransform: 'none',
                              '&:hover': { backgroundColor: '#FFEBE6', color: '#BF2600', borderColor: '#FFBDAD' }
                            }}
                          >
                            Drop
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenUnassignConfirm(lead)}
                        sx={{ 
                          height: '28px', fontSize: '12px', fontWeight: 600, color: '#42526E', 
                          borderColor: '#DFE1E6', borderRadius: '3px', textTransform: 'none', 
                          '&:hover': { backgroundColor: '#EBECF0', borderColor: '#DFE1E6' } 
                        }}
                      >
                        Unassign
                      </Button>

                      <IconButton size="small" onClick={() => { setActiveCommentLead(lead); setOpenComments(true); }} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', padding: '4px', '&:hover': { backgroundColor: '#EBECF0' } }}>
                        <Badge badgeContent={lead.comments?.length || 0} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '9px', height: '14px', minWidth: '14px' } }}>
                          <MessageSquare size={16} color="#42526E" />
                        </Badge>
                      </IconButton>
                      
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => { setSelectedLead(lead); setOpenDetails(true); }} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', padding: '4px', color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}>
                          <Launch fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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
          <Pagination count={Math.ceil(processedLeads.length / rowsPerPage) || 1} page={page} onChange={(e, p) => setPage(p)} shape="rounded" size="small" sx={{ '& .MuiPaginationItem-root': { borderRadius: '3px', color: '#42526E' }, '& .Mui-selected': { backgroundColor: '#0052CC !important', color: 'white' } }} />
        </Stack>

        {/* --- CLOSE DEAL CONFIRMATION MODAL --- */}
        <Dialog open={confirmCloseOpen} onClose={() => setConfirmCloseOpen(false)} PaperProps={{ sx: { borderRadius: "3px" } }}>
          <DialogTitle sx={{ backgroundColor: '#F4F5F7', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600 }}>
            Close Deal (Won)
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#42526E' }}>
              Are you sure you want to mark <b>{leadToClose?.leadName}</b> as Closed (Won)? This indicates the deal is finalized and will log the revenue.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #DFE1E6', padding: '16px' }}>
            <Button onClick={() => setConfirmCloseOpen(false)} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}>
              Cancel
            </Button>
            <Button onClick={handleCloseConfirm} variant="contained" sx={{ backgroundColor: '#006644', borderRadius: '3px', '&:hover': { backgroundColor: '#005035' }, disableElevation: true }}>
              Confirm Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- DROP LEAD CONFIRMATION MODAL --- */}
        <Dialog open={confirmDropOpen} onClose={() => setConfirmDropOpen(false)} PaperProps={{ sx: { borderRadius: "3px" } }}>
          <DialogTitle sx={{ backgroundColor: '#F4F5F7', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600 }}>
            Drop Lead
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#42526E' }}>
              Are you sure you want to mark <b>{leadToDrop?.leadName}</b> as dropped? This will move the lead to your dropped pipeline.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #DFE1E6', padding: '16px' }}>
            <Button onClick={() => setConfirmDropOpen(false)} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}>
              Cancel
            </Button>
            <Button onClick={handleDropConfirm} variant="contained" sx={{ backgroundColor: '#DE350B', borderRadius: '3px', '&:hover': { backgroundColor: '#BF2600' }, disableElevation: true }}>
              Drop Lead
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- UNASSIGN CONFIRMATION MODAL --- */}
        <Dialog open={confirmUnassignOpen} onClose={() => setConfirmUnassignOpen(false)} PaperProps={{ sx: { borderRadius: "3px" } }}>
          <DialogTitle sx={{ backgroundColor: '#F4F5F7', borderBottom: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 600 }}>
            Unassign Lead
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#42526E' }}>
              Are you sure you want to unassign yourself from <b>{leadToUnassign?.leadName}</b>? This lead will return to the unassigned pool.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #DFE1E6', padding: '16px' }}>
            <Button onClick={() => setConfirmUnassignOpen(false)} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' } }}>
              Cancel
            </Button>
            <Button onClick={handleUnassignConfirm} variant="contained" sx={{ backgroundColor: '#DE350B', borderRadius: '3px', '&:hover': { backgroundColor: '#BF2600' }, disableElevation: true }}>
              Unassign Lead
            </Button>
          </DialogActions>
        </Dialog>

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

            {canEditAdvanced ? (
              <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC]">
                <div className="flex gap-2">
                  <TextField fullWidth size="small" placeholder="Type a comment..." multiline maxRows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} sx={{ backgroundColor: '#FFFFFF' }} />
                  <Button variant="contained" disabled={isSubmittingComment || !newComment.trim()} onClick={handleAddComment} sx={{ backgroundColor: '#0052CC', minWidth: '48px', px: 0 }}>
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] text-center">
                <Typography sx={{ fontSize: '12px', color: '#6B778C' }}>Only Admins and Managers can leave comments.</Typography>
              </div>
            )}
          </div>
        </Modal>

        {/* --- LEAD DETAILS MODAL --- */}
        <Modal open={openDetails} onClose={() => setOpenDetails(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#091E42]/50">
          <div className="bg-white rounded-[3px] shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
            <div className="bg-[#FFFFFF] px-6 py-4 border-b border-[#DFE1E6] flex justify-between items-center">
              <Typography variant="h6" sx={{ color: '#172B4D', fontWeight: 600 }}>Lead Details: {selectedLead?.leadName}</Typography>
              <IconButton onClick={() => setOpenDetails(false)} size="small"><X className="w-5 h-5" /></IconButton>
            </div>
            
            <div className="flex flex-col md:flex-row overflow-y-auto bg-[#FAFBFC] p-6 gap-6">
              <div className="md:w-1/2 space-y-6">
                <div>
                  <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>Contact Information</Typography>
                  {selectedLead && (
                    <div className="bg-white p-4 border border-[#DFE1E6] rounded-[3px] space-y-3">
                      <div className="flex flex-col"><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Name</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.leadName}</Typography></div>
                      <div className="flex flex-col"><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Email</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.email}</Typography></div>
                      <div className="flex flex-col"><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Phone</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.phoneNumber}</Typography></div>
                      <div className="flex flex-col"><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Designation</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.designation || "N/A"}</Typography></div>
                    </div>
                  )}
                </div>

                <div>
                  <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>Company Information</Typography>
                  {selectedLead && (
                    <div className="bg-white p-4 border border-[#DFE1E6] rounded-[3px] space-y-3">
                      <div className="flex flex-col"><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Website</Typography><Typography sx={{ fontSize: '14px', color: '#0052CC', cursor: 'pointer', '&:hover': { textDecoration: 'underline'} }}>{selectedLead.website || "N/A"}</Typography></div>
                      <div className="flex flex-col"><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Country</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.country}</Typography></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:w-1/2 space-y-6">
                <div>
                  <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>Deal Specifics</Typography>
                  {selectedLead && (
                    <div className="bg-white p-4 border border-[#DFE1E6] rounded-[3px] space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col"><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Lead Type</Typography><Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.leadType}</Typography></div>
                        <div className="flex flex-col"><Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600 }}>Pitched Amount</Typography><Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#006644' }}>{selectedLead.currencySymbol || "$"}{selectedLead.pitchedAmount?.toLocaleString()}</Typography></div>
                      </div>
                      <div className="flex flex-col">
                        <Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Packages</Typography>
                        <div className="flex flex-wrap gap-1">
                          {selectedLead.packages?.map((pkg, idx) => (
                            <div key={idx} className="bg-[#EBECF0] text-[#172B4D] text-[12px] px-2 py-0.5 rounded-[3px] font-medium">{pkg}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>Strategy & Follow-up</Typography>
                  {selectedLead && (
                    <div className="bg-white p-4 border border-[#DFE1E6] rounded-[3px] space-y-4">
                      <div className="flex flex-col">
                        <Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Follow-up Date</Typography>
                        {canEditAdvanced ? (
                          <DatePicker
                            value={selectedLead.followUpDate ? dayjs(selectedLead.followUpDate) : null}
                            onChange={(newValue) => handleUpdateFollowUp(selectedLead._id, newValue ? newValue.toISOString() : null)}
                            slotProps={{ textField: { size: "small", fullWidth: true, sx: { backgroundColor: '#FAFBFC' } } }}
                          />
                        ) : (
                          <Typography sx={{ fontSize: '14px', color: '#172B4D', fontWeight: 500 }}>
                            {selectedLead.followUpDate ? dayjs(selectedLead.followUpDate).format('MMMM DD, YYYY') : "No follow-up set."}
                          </Typography>
                        )}
                      </div>
                      <div className="flex flex-col">
                         <Typography sx={{ fontSize: '11px', color: '#6B778C', textTransform: 'uppercase', fontWeight: 600, mb: 1 }}>Original Note</Typography>
                         <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] p-3">
                           <Typography sx={{ fontSize: '14px', color: '#172B4D', whiteSpace: 'pre-wrap' }}>
                             {selectedLead.note || "No notes provided."}
                           </Typography>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-[#FFFFFF] px-6 py-4 border-t border-[#DFE1E6] flex justify-end">
               <Button onClick={() => setOpenDetails(false)} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' }, textTransform: 'none', fontWeight: 500 }}>
                 Close Details
               </Button>
            </div>
          </div>
        </Modal>
      </div>
    </LocalizationProvider>
  );
};

export default AssignedLeads;