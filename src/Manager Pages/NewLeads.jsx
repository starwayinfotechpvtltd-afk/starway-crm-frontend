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
  Pagination
} from "@mui/material";
import { Launch } from "@mui/icons-material";
import { ShieldAlert, X } from "lucide-react";
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
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamMember, setSelectedTeamMember] = useState("all");
  const [selectedTransferredTo, setSelectedTransferredTo] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  
  // Custom Date States
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Dynamic Filter Options
  const [teamMembers, setTeamMembers] = useState([]);
  const [transferredToUsers, setTransferredToUsers] = useState([]);

  // Pagination & Modal
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedLead, setSelectedLead] = useState(null);
  const [open, setOpen] = useState(false);

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
      
      const leadsData = response.data;
      setAssignedLeads(leadsData);

      // Extract unique values for our dynamic dropdowns
      const uniqueMembers = [...new Set(leadsData.map(l => l.leadOwner).filter(Boolean))];
      const uniqueTransferred = [...new Set(leadsData.map(l => l.assignedTo?.username).filter(Boolean))];
      
      setTeamMembers(uniqueMembers);
      setTransferredToUsers(uniqueTransferred);

    } catch (error) {
      console.error("Error fetching assigned leads:", error);
      setError("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (leadId) => {
    if (!window.confirm("Are you sure you want to unassign this lead?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/leads/unassign/${leadId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedLeads((prev) => prev.filter((lead) => lead._id !== leadId));
    } catch (error) {
      console.error("Error unassigning lead:", error);
      alert("Failed to unassign lead.");
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

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "?";
  };

  const renderStatus = (status) => {
    const s = (status || "ongoing").toLowerCase();
    const isClosed = s === "closed";
    
    return (
      <div 
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-bold tracking-wider cursor-pointer transition-colors ${
          isClosed ? "bg-[#E3FCEF] text-[#006644] hover:bg-[#D3F9E8]" : "bg-[#DEEBFF] text-[#0052CC] hover:bg-[#Cce0ff]"
        }`}
      >
        {s.toUpperCase()}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>
    );
  };

  // --- Date Range Helper ---
  const getDateRange = () => {
    const today = dayjs();
    switch (selectedDate) {
      case "today": return { start: today.startOf("day"), end: today.endOf("day") };
      case "week": return { start: today.startOf("week"), end: today.endOf("week") };
      case "month": return { start: today.startOf("month"), end: today.endOf("month") };
      case "custom": return startDate && endDate ? { start: startDate.startOf("day"), end: endDate.endOf("day") } : null;
      default: return null;
    }
  };

  // --- Filter Logic ---
  const filteredLeads = useMemo(() => {
    return assignedLeads.filter((lead) => {
      if (selectedStatus !== "all" && lead.status !== selectedStatus) return false;
      if (selectedTeamMember !== "all" && lead.leadOwner !== selectedTeamMember) return false;
      if (selectedTransferredTo !== "all" && lead.assignedTo?.username !== selectedTransferredTo) return false;

      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        if (!lead.leadName?.toLowerCase().includes(lowerQ) && !lead.email?.toLowerCase().includes(lowerQ)) return false;
      }

      // Apply Date Filter based on assignment date (or created date fallback)
      const dateRange = getDateRange();
      if (dateRange) {
        const leadDate = dayjs(lead.assignedAt || lead.createdAt);
        if (!leadDate.isBetween(dateRange.start, dateRange.end, "day", "[]")) return false;
      }

      return true;
    });
  }, [assignedLeads, selectedStatus, selectedTeamMember, selectedTransferredTo, searchQuery, selectedDate, startDate, endDate]);

  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]"><CircularProgress /></div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-200">
        <ShieldAlert className="w-5 h-5" /> {error}
      </div>
    </div>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-[#FAFBFC] p-4 md:p-8 font-sans" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        
        {/* Search Bar - Full Width */}
        <div className="mb-4">
          <TextField
            fullWidth
            size="small"
            placeholder="Search by lead name..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            sx={{ backgroundColor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '3px', color: '#172B4D' } }}
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          
          <FormControl size="small" sx={{ minWidth: 200, backgroundColor: '#FFFFFF' }}>
            <Select
              value={selectedTeamMember}
              onChange={(e) => { setSelectedTeamMember(e.target.value); setPage(1); }}
              displayEmpty
              sx={{ borderRadius: '3px', fontSize: '14px', color: '#172B4D' }}
            >
              <MenuItem value="all"><em>Filter by Team Member</em></MenuItem>
              {teamMembers.map((member, idx) => (
                <MenuItem key={idx} value={member}>{member}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200, backgroundColor: '#FFFFFF' }}>
            <Select
              value={selectedTransferredTo}
              onChange={(e) => { setSelectedTransferredTo(e.target.value); setPage(1); }}
              displayEmpty
              sx={{ borderRadius: '3px', fontSize: '14px', color: '#172B4D' }}
            >
              <MenuItem value="all"><em>Transferred To</em></MenuItem>
              {transferredToUsers.map((user, idx) => (
                <MenuItem key={idx} value={user}>{user}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200, backgroundColor: '#FFFFFF' }}>
            <Select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              displayEmpty
              sx={{ borderRadius: '3px', fontSize: '14px', color: '#172B4D' }}
            >
              <MenuItem value="all"><em>All Statuses</em></MenuItem>
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200, backgroundColor: '#FFFFFF' }}>
            <Select
              value={selectedDate}
              onChange={(e) => { 
                setSelectedDate(e.target.value); 
                setPage(1);
                if (e.target.value !== 'custom') {
                  setStartDate(null);
                  setEndDate(null);
                }
              }}
              displayEmpty
              sx={{ borderRadius: '3px', fontSize: '14px', color: '#172B4D' }}
            >
              <MenuItem value="all"><em>Assignment Date</em></MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="custom">Custom Date Range...</MenuItem>
            </Select>
          </FormControl>

          {/* Conditional Custom Date Pickers */}
          {selectedDate === "custom" && (
            <div className="flex gap-2">
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { size: "small", sx: { backgroundColor: '#FFFFFF', borderRadius: '3px', width: 140 } } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { size: "small", sx: { backgroundColor: '#FFFFFF', borderRadius: '3px', width: 140 } } }}
              />
            </div>
          )}

        </div>

        {/* Main Table */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: '3px' }}>
          <Table sx={{ minWidth: 1000 }} size="small">
            <TableHead sx={{ backgroundColor: '#F4F5F7' }}>
              <TableRow>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', py: 2 }}>Client Info</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Location</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Caller Name</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Transferred To</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Pitched Amount</TableCell>
                <TableCell align="right" sx={{ color: '#5E6C84', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#5E6C84' }}>No leads found.</TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => (
                  <TableRow key={lead._id} hover sx={{ '&:hover': { backgroundColor: '#FAFBFC' }, '& td': { borderBottom: '1px solid #DFE1E6' } }}>
                    
                    <TableCell sx={{ py: 1.5 }}>
                      <div className="flex items-center gap-3">
                        <Avatar sx={{ bgcolor: '#0052CC', width: 32, height: 32, fontSize: '14px', fontWeight: 'bold' }}>
                          {getInitials(lead.leadName)}
                        </Avatar>
                        <div>
                          <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 600 }}>{lead.leadName || "N/A"}</Typography>
                          <Typography variant="caption" sx={{ color: '#6B778C' }}>{lead.email || "No email"}</Typography>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#172B4D' }}>{lead.country || "N/A"}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#172B4D' }}>{lead.leadOwner || "--"}</Typography>
                    </TableCell>

                    <TableCell>
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar sx={{ bgcolor: '#FF991F', width: 24, height: 24, fontSize: '12px', fontWeight: 'bold' }}>
                            {getInitials(lead.assignedTo.username)[0]}
                          </Avatar>
                          <Typography variant="body2" sx={{ color: '#172B4D' }}>{lead.assignedTo.username}</Typography>
                        </div>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#7A869A', fontStyle: 'italic' }}>Unassigned</Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {renderStatus(lead.status)}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#006644', fontWeight: 700 }}>
                        {lead.currencySymbol || "$"} {lead.pitchedAmount?.toLocaleString() || "0"}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <div className="flex justify-end gap-2 items-center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleUnassign(lead._id)}
                          sx={{
                            height: '28px', color: '#42526E', borderColor: '#DFE1E6', textTransform: 'none', fontSize: '12px', fontWeight: 500,
                            '&:hover': { backgroundColor: '#EBECF0', borderColor: '#DFE1E6' }
                          }}
                        >
                          Unassign
                        </Button>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpen(lead)}
                          sx={{ border: '1px solid #DFE1E6', borderRadius: '3px', padding: '4px', '&:hover': { backgroundColor: '#EBECF0' } }}
                        >
                          <Launch sx={{ fontSize: '16px', color: '#42526E' }} />
                        </IconButton>
                      </div>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Stack direction="row" justifyContent="flex-end" alignItems="center" className="mt-4 gap-4">
          <div className="flex items-center gap-2">
            <Typography variant="caption" sx={{ color: '#5E6C84' }}>Rows per page:</Typography>
            <Select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(1); }}
              variant="standard"
              disableUnderline
              sx={{ fontSize: '13px', color: '#172B4D', fontWeight: 500 }}
            >
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </div>
          <Pagination 
            count={Math.ceil(filteredLeads.length / rowsPerPage) || 1} 
            page={page} 
            onChange={(e, newPage) => setPage(newPage)} 
            shape="rounded" 
            size="small"
            sx={{ '& .MuiPaginationItem-root': { borderRadius: '3px', color: '#42526E' }, '& .Mui-selected': { backgroundColor: '#0052CC !important', color: 'white' } }}
          />
        </Stack>

        {/* MODAL */}
        <Modal open={open} onClose={handleClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-[#091E42]/50">
          <div className="bg-white rounded-[3px] shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25)] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#FFFFFF] px-6 py-4 border-b border-[#DFE1E6] flex justify-between items-center">
              <Typography variant="h6" sx={{ color: '#172B4D', fontWeight: 500 }}>Lead Details</Typography>
              <IconButton onClick={handleClose} size="small" sx={{ color: '#6B778C' }}><X className="w-5 h-5" /></IconButton>
            </div>
            
            <div className="flex flex-col md:flex-row overflow-y-auto bg-[#FAFBFC]">
              <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-[#DFE1E6] bg-[#FFFFFF]">
                <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 700, textTransform: 'uppercase', mb: 3, display: 'block' }}>Client Information</Typography>
                {selectedLead && (
                  <div className="space-y-4">
                    <div>
                      <Typography sx={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Lead Name</Typography>
                      <Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.leadName || "N/A"}</Typography>
                    </div>
                    <div>
                      <Typography sx={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Email</Typography>
                      <Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.email || "N/A"}</Typography>
                    </div>
                    <div>
                      <Typography sx={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Phone</Typography>
                      <Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.phoneNumber || "N/A"}</Typography>
                    </div>
                    <div>
                      <Typography sx={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Website</Typography>
                      <Typography sx={{ fontSize: '14px', color: '#0052CC', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{selectedLead.website || "N/A"}</Typography>
                    </div>
                    <div>
                      <Typography sx={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Country</Typography>
                      <Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.country || "N/A"}</Typography>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 md:w-1/2 bg-[#FFFFFF]">
                <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 700, textTransform: 'uppercase', mb: 3, display: 'block' }}>Deal Specifics</Typography>
                {selectedLead && (
                  <div className="space-y-4">
                    <div>
                      <Typography sx={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Lead Type</Typography>
                      <Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.leadType || "N/A"}</Typography>
                    </div>
                    <div>
                      <Typography sx={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Packages</Typography>
                      <Typography sx={{ fontSize: '14px', color: '#172B4D' }}>{selectedLead.packages?.join(", ") || "None"}</Typography>
                    </div>
                    <div>
                      <Typography sx={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Pitched Amount</Typography>
                      <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#006644' }}>
                        {selectedLead.currencySymbol || "$"}{selectedLead.pitchedAmount?.toLocaleString() || "0"}
                      </Typography>
                    </div>
                    <div>
                      <Typography sx={{ fontSize: '12px', color: '#6B778C', fontWeight: 600 }}>Notes</Typography>
                      <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] p-3 mt-1">
                        <Typography sx={{ fontSize: '14px', color: '#172B4D', whiteSpace: 'pre-wrap' }}>
                          {selectedLead.note || "No additional notes provided."}
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-[#FFFFFF] px-6 py-4 border-t border-[#DFE1E6] flex justify-end">
               <Button onClick={handleClose} sx={{ color: '#42526E', '&:hover': { backgroundColor: '#EBECF0' }, textTransform: 'none', fontWeight: 500 }}>
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