import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Avatar,
  IconButton,
  Pagination,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Chip,
  Grid,
  Divider,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Phone,
  Mail,
  Globe,
  Package,
  X,
  Users,
  UserCheck,
  UserMinus,
} from "lucide-react";

// Helper function to generate dynamic colors for avatars
const stringToColor = (string) => {
  if (!string) return "#9e9e9e";
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const AllLeads = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Shifted breakpoint for list view
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserByLeadId, setSelectedUserByLeadId] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [leadsPerPage] = useState(10); // Increased for list view

  // Filters
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("all");

  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchLeads(), fetchUsers()]);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/leads/all`, {
        headers: { Authorization: "Bearer " + token },
      });

      const leadsData = Array.isArray(response.data)
        ? response.data
        : response.data.leads || [];

      const sortedLeads = leadsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLeads(sortedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError("Error fetching leads. Please try again later.");
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      const response = await axios.get(`${API_BASE}/api/auth/admins-managers`, {
        headers: { Authorization: "Bearer " + token },
      });

      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const assignLead = async (leadId, userId) => {
    try {
      const token = localStorage.getItem("token");
      const assignedAt = new Date().toISOString();
      if (!leadId || !userId || userId === "select") return;

      const url = `${API_BASE}/api/leads/assign/${leadId}`;
      const response = await axios.put(
        url,
        { userId, assignedAt },
        { headers: { Authorization: "Bearer " + token } }
      );

      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === leadId
            ? { ...response.data, assignedAt: assignedAt }
            : lead
        )
      );

      setToastMessage("Lead assigned successfully!");
      setToastSeverity("success");
      setToastOpen(true);
      
      // Clear the local selection after success
      setSelectedUserByLeadId(prev => ({...prev, [leadId]: undefined}));
    } catch (error) {
      console.error("Error assigning lead:", error);
      setToastMessage("Error assigning lead.");
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE}/api/leads/delete/${leadToDelete}`;
      await axios.delete(url, {
        headers: { Authorization: "Bearer " + token },
      });
      setLeads((prev) => prev.filter((lead) => lead._id !== leadToDelete));
      setToastMessage("Lead deleted successfully");
      setToastSeverity("success");
    } catch (error) {
      console.error("Error deleting lead:", error);
      setToastMessage("Error deleting lead. Please try again later.");
      setToastSeverity("error");
    } finally {
      setOpenConfirmation(false);
      setLeadToDelete(null);
      setToastOpen(true);
    }
  };

  const handleOpenConfirmation = (leadId, e) => {
    e.stopPropagation();
    setLeadToDelete(leadId);
    setOpenConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
    setLeadToDelete(null);
  };

  const openLeadDetailsModal = (lead, e) => {
    e.stopPropagation();
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const closeLeadDetailsModal = () => {
    setSelectedLead(null);
    setIsModalOpen(false);
  };

  // --- Filtering Logic ---
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.leadName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (assignedFilter === "unassigned" && lead.assignedTo) return false;
      if (assignedFilter === "assigned" && !lead.assignedTo) return false;
      if (
        assignedFilter !== "all" &&
        assignedFilter !== "unassigned" &&
        assignedFilter !== "assigned"
      ) {
        if (lead.assignedTo?._id !== assignedFilter) return false;
      }

      if (dateFilter !== "all") {
        const leadDate = new Date(lead.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === "today") {
          if (leadDate < today) return false;
        } else if (dateFilter === "week") {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          if (leadDate < startOfWeek) return false;
        } else if (dateFilter === "month") {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          if (leadDate < startOfMonth) return false;
        } else if (dateFilter === "custom") {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (leadDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (leadDate > end) return false;
          }
        }
      }
      return true;
    });
  }, [leads, searchTerm, dateFilter, customStartDate, customEndDate, assignedFilter]);

  const totalLeadsCount = leads.length;
  const assignedLeadsCount = leads.filter((l) => l.assignedTo).length;
  const unassignedLeadsCount = totalLeadsCount - assignedLeadsCount;

  const indexOfLastLead = page * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, dateFilter, assignedFilter, customStartDate, customEndDate]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") return;
    setToastOpen(false);
  };

  // --- Reusable Subcomponents ---
  const LeadAvatar = ({ name, size = 36 }) => {
    const safeName = name || "?";
    const initials = safeName[0].toUpperCase();
    const bgColor = stringToColor(safeName);
    return (
      <Avatar
        sx={{
          bgcolor: bgColor,
          width: size,
          height: size,
          fontSize: size * 0.45,
          fontWeight: "600",
        }}
      >
        {initials}
      </Avatar>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <Card sx={{ borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ p: 1, borderRadius: 1, bgcolor: bg, color: color, display: "flex" }}>
          <Icon size={20} />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {title}
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const LeadDetailItem = ({ title, value, icon: Icon, fullWidth = false }) => (
    <Grid item xs={12} sm={fullWidth ? 12 : 6}>
      <Box sx={{ display: "flex", alignItems: "center", p: 1.5, bgcolor: "grey.50", borderRadius: 1, border: '1px solid', borderColor: 'divider', height: "100%" }}>
        {Icon && <Icon size={18} style={{ color: "#6b7280", marginRight: "12px" }} />}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="medium">
            {title}
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight="500">
            {value || "N/A"}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );

  // --- List Items ---
  const DesktopLeadRow = ({ lead }) => {
    const isClosed = lead.status?.toLowerCase() === "closed";

    return (
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1.5,
          mb: 1,
          borderRadius: 1, // sm
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)", // xs shadow
          transition: "background-color 0.2s",
          "&:hover": {
            bgcolor: "grey.50",
          },
        }}
      >
        {/* Contact Info Col */}
        <Box display="flex" alignItems="center" gap={2} flex={2} minWidth={200} onClick={(e) => openLeadDetailsModal(lead, e)} sx={{ cursor: 'pointer' }}>
          <LeadAvatar name={lead.leadName} />
          <Box overflow="hidden">
            <Typography variant="subtitle2" fontWeight="600" noWrap>
              {lead.leadName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {lead.email}
            </Typography>
          </Box>
        </Box>

        {/* Status Col */}
        <Box flex={1} minWidth={100}>
          {isClosed ? (
            <Chip label="Closed" color="error" size="small" sx={{ borderRadius: 1, height: 24 }} />
          ) : (
            <Chip label={lead.status || "Open"} color="default" size="small" sx={{ borderRadius: 1, height: 24 }} />
          )}
        </Box>

        {/* Assignee Col */}
        <Box flex={1.5} minWidth={150}>
           <Typography variant="caption" color={lead.assignedTo ? "text.primary" : "text.secondary"} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {lead.assignedTo ? lead.assignedTo.username : "Unassigned"}
           </Typography>
        </Box>

        {/* Date Col */}
        <Box flex={1} minWidth={100}>
          <Typography variant="caption" color="text.secondary">
            {new Date(lead.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        {/* Action/Assign Col */}
        <Box flex={2} minWidth={200} display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
          <Select
            size="small"
            value={selectedUserByLeadId[lead._id] || "select"}
            onChange={(e) => setSelectedUserByLeadId((prev) => ({ ...prev, [lead._id]: e.target.value }))}
            disabled={isClosed}
            sx={{ width: 130, height: 32, fontSize: '0.8rem', borderRadius: 1 }}
          >
            <MenuItem value="select" disabled sx={{ fontSize: '0.8rem' }}>
              {isClosed ? "Closed" : "Assign to..."}
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id} sx={{ fontSize: '0.8rem' }}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            size="small"
            disableElevation
            sx={{ minWidth: 60, height: 32, borderRadius: 1, textTransform: 'none' }}
            onClick={() => assignLead(lead._id, selectedUserByLeadId[lead._id])}
            disabled={isClosed || !selectedUserByLeadId[lead._id] || selectedUserByLeadId[lead._id] === "select"}
          >
            Assign
          </Button>

          <Box display="flex" gap={0.5} ml={1}>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={(e) => openLeadDetailsModal(lead, e)} color="primary">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isClosed ? "Cannot delete closed lead" : "Delete"}>
              <span>
                <IconButton size="small" onClick={(e) => handleOpenConfirmation(lead._id, e)} color="error" disabled={isClosed}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    );
  };

  const MobileLeadRow = ({ lead }) => {
    const isClosed = lead.status?.toLowerCase() === "closed";

    return (
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          p: 2,
          borderRadius: 1, // sm
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)", // xs
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box display="flex" gap={1.5} flex={1}>
            <LeadAvatar name={lead.leadName} size={40} />
            <Box>
              <Typography variant="subtitle2" fontWeight="600">{lead.leadName}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">{lead.email}</Typography>
              <Typography variant="caption" color="text.disabled">{new Date(lead.createdAt).toLocaleDateString()}</Typography>
            </Box>
          </Box>
          <Box>
            {isClosed ? (
              <Chip label="Closed" color="error" size="small" sx={{ borderRadius: 1, height: 20, fontSize: '0.7rem' }} />
            ) : (
               <Chip label={lead.assignedTo ? lead.assignedTo.username : "Unassigned"} color={lead.assignedTo ? "primary" : "default"} variant="outlined" size="small" sx={{ borderRadius: 1, height: 20, fontSize: '0.7rem' }} />
            )}
          </Box>
        </Box>

        <Box display="flex" gap={1}>
           <Select
              size="small"
              fullWidth
              value={selectedUserByLeadId[lead._id] || "select"}
              onChange={(e) => setSelectedUserByLeadId((prev) => ({ ...prev, [lead._id]: e.target.value }))}
              disabled={isClosed}
              sx={{ height: 32, fontSize: '0.8rem', borderRadius: 1 }}
            >
              <MenuItem value="select" disabled sx={{ fontSize: '0.8rem' }}>
                {isClosed ? "Lead Closed" : "Select User"}
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id} sx={{ fontSize: '0.8rem' }}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              disableElevation
              sx={{ minWidth: 80, height: 32, borderRadius: 1, textTransform: 'none' }}
              onClick={() => assignLead(lead._id, selectedUserByLeadId[lead._id])}
              disabled={isClosed || !selectedUserByLeadId[lead._id] || selectedUserByLeadId[lead._id] === "select"}
            >
              Assign
            </Button>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box display="flex" justifyContent="space-between">
          <Button size="small" startIcon={<VisibilityIcon />} onClick={(e) => openLeadDetailsModal(lead, e)} sx={{ textTransform: 'none' }}>
            View Details
          </Button>
          <IconButton size="small" onClick={(e) => handleOpenConfirmation(lead._id, e)} color="error" disabled={isClosed}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Typography variant="body1" color="text.secondary">Loading leads...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 1 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth="xl" mx="auto" p={{ xs: 2, md: 4 }}>

      {/* Top Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Leads" value={totalLeadsCount} icon={Users} color="#1976d2" bg="#e3f2fd" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Transferred Leads" value={assignedLeadsCount} icon={UserCheck} color="#2e7d32" bg="#e8f5e9" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Unassigned Leads" value={unassignedLeadsCount} icon={UserMinus} color="#ed6c02" bg="#fff3e0" />
        </Grid>
      </Grid>

      {/* Filter & Search Bar */}
      <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterListIcon color="action" fontSize="small" />
          <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
            Filters
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Transferred To</InputLabel>
              <Select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                label="Transferred To"
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="all">All Leads</MenuItem>
                <MenuItem value="unassigned">Unassigned Only</MenuItem>
                <MenuItem value="assigned">Transferred</MenuItem>
                <Divider />
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Date</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Date"
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="custom">Custom...</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {dateFilter === "custom" && (
            <Grid item xs={12} md={3} display="flex" gap={1}>
              <TextField fullWidth type="date" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
              <TextField fullWidth type="date" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Leads List View */}
      <Box mb={4}>
        {!isMobile && currentLeads.length > 0 && (
          <Box display="flex" px={1.5} pb={1}>
            <Typography variant="caption" fontWeight="600" color="text.secondary" flex={2} minWidth={200}>Contact</Typography>
            <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1} minWidth={100}> Lead Status</Typography>
            <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1.5} minWidth={150}>Trasferred To</Typography>
            <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1} minWidth={100}>Created At</Typography>
            <Typography variant="caption" fontWeight="600" color="text.secondary" flex={2} minWidth={200} align="right" pr={8}>Actions</Typography>
          </Box>
        )}

        {currentLeads.length === 0 ? (
          <Box textAlign="center" py={6} bgcolor="grey.50" borderRadius={1} border="1px dashed" borderColor="divider">
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              No leads found
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Adjust your filters to see more results.
            </Typography>
          </Box>
        ) : (
          currentLeads.map((lead) =>
            isMobile ? (
              <MobileLeadRow key={lead._id} lead={lead} />
            ) : (
              <DesktopLeadRow key={lead._id} lead={lead} />
            )
          )
        )}
      </Box>

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <Stack alignItems="center" mt={3} mb={2}>
          <Pagination
            count={Math.ceil(filteredLeads.length / leadsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
            shape="rounded"
            size="small"
          />
        </Stack>
      )}

      {/* Lead Details Dialog */}
      <Dialog open={isModalOpen && selectedLead !== null} onClose={closeLeadDetailsModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, pt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Lead Details</Typography>
          <IconButton onClick={closeLeadDetailsModal} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {selectedLead && (
            <Grid container spacing={1.5}>
              <Grid item xs={12} display="flex" alignItems="center" gap={2} mb={1}>
                <LeadAvatar name={selectedLead.leadName} size={48} />
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1}>{selectedLead.leadName}</Typography>
                    {selectedLead.status?.toLowerCase() === "closed" && <Chip label="Closed" color="error" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {selectedLead.designation || "No Designation"}
                  </Typography>
                </Box>
              </Grid>
              <LeadDetailItem title="Email" value={selectedLead.email} icon={Mail} />
              <LeadDetailItem title="Phone" value={selectedLead.phoneNumber} icon={Phone} />
              <LeadDetailItem title="Website" value={selectedLead.website} icon={Globe} />
              <LeadDetailItem title="Country" value={selectedLead.country} />
              <LeadDetailItem title="Lead Type" value={selectedLead.leadType} />
              <LeadDetailItem title="Pitched Amount" value={`${selectedLead.currencySymbol || ""} ${selectedLead.pitchedAmount || 0}`} />
              <LeadDetailItem title="Status" value={selectedLead.status || "Open"} />
              <LeadDetailItem title="Packages" value={selectedLead.packages?.join(", ") || "None specified"} icon={Package} fullWidth />
              <LeadDetailItem title="Note" value={selectedLead.note || "No notes available"} fullWidth />
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5, px: 2 }}>
          <Button onClick={closeLeadDetailsModal} variant="outlined" color="inherit" size="small" sx={{ borderRadius: 1 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openConfirmation} onClose={handleCloseConfirmation} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle variant="subtitle1" fontWeight="bold">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            Are you sure you want to delete this lead? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={handleCloseConfirmation} color="inherit" variant="text" size="small">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disableElevation size="small" sx={{ borderRadius: 1 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notifications */}
      <Snackbar open={toastOpen} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={handleCloseToast} severity={toastSeverity} variant="filled" sx={{ width: "100%", borderRadius: 1, boxShadow: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AllLeads;