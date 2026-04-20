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
  DialogTitle,
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
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Phone,
  Mail,
  Globe,
  Package,
  X,
  Archive,
  CalendarDays,
  Calendar,
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

const ClosedLeads = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [closedLeads, setClosedLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [leadsPerPage] = useState(10);

  // Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch both closed leads and users (for the assignee filter)
      const [leadsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/leads/closed`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/auth/admins-managers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const leadsData = Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data.leads || [];
      // Sort by recently updated (closed date)
      const sortedLeads = leadsData.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      
      setClosedLeads(sortedLeads);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load closed leads data.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (lead, e) => {
    if (e) e.stopPropagation();
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  // --- Calculations for Top Cards ---
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let thisWeek = 0;
    let thisMonth = 0;

    closedLeads.forEach(lead => {
      // Use updatedAt as the proxy for when it was closed, fallback to createdAt
      const closedDate = new Date(lead.updatedAt || lead.createdAt);
      if (closedDate >= startOfWeek) thisWeek++;
      if (closedDate >= startOfMonth) thisMonth++;
    });

    return {
      total: closedLeads.length,
      thisWeek,
      thisMonth
    };
  }, [closedLeads]);

  // --- Filtering Logic ---
  const filteredLeads = useMemo(() => {
    return closedLeads.filter((lead) => {
      const matchesSearch = lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase());
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
        const leadDate = new Date(lead.updatedAt || lead.createdAt);
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
  }, [closedLeads, searchTerm, dateFilter, customStartDate, customEndDate, assignedFilter]);

  // Pagination Logic
  const indexOfLastLead = page * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, dateFilter, assignedFilter, customStartDate, customEndDate]);

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
  const DesktopLeadRow = ({ lead }) => (
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
      <Box display="flex" alignItems="center" gap={2} flex={2} minWidth={200} onClick={(e) => handleViewClick(lead, e)} sx={{ cursor: 'pointer' }}>
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

      <Box flex={1} minWidth={100}>
        <Chip label="Closed" color="error" size="small" variant="filled" sx={{ borderRadius: 1, height: 24 }} />
      </Box>

      <Box flex={1.5} minWidth={150}>
         <Typography variant="caption" color={lead.assignedTo ? "text.primary" : "text.secondary"}>
            {lead.assignedTo ? lead.assignedTo.username : "Not Assigned"}
         </Typography>
      </Box>

      <Box flex={1} minWidth={100}>
        <Typography variant="caption" color="text.secondary">
          {new Date(lead.updatedAt || lead.createdAt).toLocaleDateString()}
        </Typography>
      </Box>

      <Box flex={1} minWidth={120} display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          size="small"
          startIcon={<VisibilityIcon fontSize="small" />}
          sx={{ borderRadius: 1, textTransform: 'none', height: 32 }}
          onClick={(e) => handleViewClick(lead, e)}
        >
          View Details
        </Button>
      </Box>
    </Paper>
  );

  const MobileLeadRow = ({ lead }) => (
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
            <Typography variant="caption" color="text.disabled">{new Date(lead.updatedAt || lead.createdAt).toLocaleDateString()}</Typography>
          </Box>
        </Box>
        <Box>
           <Chip label="Closed" color="error" size="small" sx={{ borderRadius: 1, height: 20, fontSize: '0.7rem' }} />
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Assigned to: <span style={{ fontWeight: 600, color: 'inherit' }}>{lead.assignedTo ? lead.assignedTo.username : "Unassigned"}</span>
      </Typography>

      <Button 
        fullWidth
        variant="outlined" 
        size="small" 
        startIcon={<VisibilityIcon />} 
        onClick={(e) => handleViewClick(lead, e)} 
        sx={{ textTransform: 'none', borderRadius: 1 }}
      >
        View Details
      </Button>
    </Paper>
  );

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress size={40} />
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
          <StatCard title="Total Closed Leads" value={stats.total} icon={Archive} color="#1976d2" bg="#e3f2fd" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Closed This Month" value={stats.thisMonth} icon={CalendarDays} color="#2e7d32" bg="#e8f5e9" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Closed This Week" value={stats.thisWeek} icon={Calendar} color="#ed6c02" bg="#fff3e0" />
        </Grid>
      </Grid>

      {/* Filter & Search Bar */}
      <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 1, border: "1px solid", borderColor: "divider", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterListIcon color="action" fontSize="small" />
          <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
            Filters & Search
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
              <InputLabel>Trasnferred To</InputLabel>
              <Select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                label="Trasnferred To"
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="all">All Closed Leads</MenuItem>
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
              <InputLabel>Closed Date</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Closed Date"
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
            <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1} minWidth={100}>Status</Typography>
            <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1.5} minWidth={150}>Assignee</Typography>
            <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1} minWidth={100}>Closed Date</Typography>
            <Typography variant="caption" fontWeight="600" color="text.secondary" flex={1} minWidth={120} align="right" pr={2}>Actions</Typography>
          </Box>
        )}

        {currentLeads.length === 0 ? (
          <Box textAlign="center" py={6} bgcolor="grey.50" borderRadius={1} border="1px dashed" borderColor="divider">
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              No closed leads found
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
            onChange={(e, val) => setPage(val)}
            color="primary"
            shape="rounded"
            size="small"
          />
        </Stack>
      )}

      {/* Modern Lead Details Modal */}
      <Dialog open={isModalOpen && selectedLead !== null} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, pt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Lead Details</Typography>
          <IconButton onClick={handleClose} size="small">
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
                    <Chip label="Closed" color="error" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
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
              
              <LeadDetailItem 
                title="Assigned To" 
                value={selectedLead.assignedTo ? selectedLead.assignedTo.username : "Not Assigned"} 
              />
              <LeadDetailItem 
                title="Assigned By" 
                value={selectedLead.assignedBy ? selectedLead.assignedBy.username : "Unknown"} 
              />
              
              <LeadDetailItem title="Packages" value={selectedLead.packages?.join(", ") || "None specified"} icon={Package} fullWidth />
              <LeadDetailItem title="Note" value={selectedLead.note || "No notes available"} fullWidth />
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5, px: 2 }}>
          <Button onClick={handleClose} variant="contained" disableElevation size="small" sx={{ borderRadius: 1 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClosedLeads;