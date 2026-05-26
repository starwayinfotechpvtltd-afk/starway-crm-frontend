import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Typography, Box, Avatar, Pagination, Stack,
  Chip, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, InputAdornment,
  Card, CardContent, Divider, CircularProgress, Alert
} from "@mui/material";
import {
  Search as SearchIcon,
  RotateCcw,
  Archive,
  CalendarDays,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  User as UserIcon,
  Clock
} from "lucide-react";
import dayjs from "dayjs";

// --- Cache Keys ---
const CACHE_KEY_DATA = "crm_closed_leads_data";
const CACHE_KEY_FILTERS = "crm_closed_leads_filters";

const ClosedLeads = () => {
  // --- Initialize State from Session Storage ---
  const getCachedFilters = () => {
    const saved = sessionStorage.getItem(CACHE_KEY_FILTERS);
    return saved ? JSON.parse(saved) : null;
  };

  const cachedFilters = getCachedFilters();

  const [leads, setLeads] = useState(() => {
    const saved = sessionStorage.getItem(CACHE_KEY_DATA);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState(cachedFilters?.searchTerm || "");
  const [dateFilter, setDateFilter] = useState(cachedFilters?.dateFilter || "all");
  const [assignedFilter, setAssignedFilter] = useState(cachedFilters?.assignedFilter || "all");
  const [page, setPage] = useState(cachedFilters?.page || 1);
  const rowsPerPage = 10;

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
  const token = localStorage.getItem("token");

  // --- Sync to Session Storage ---
  useEffect(() => {
    const filterState = { searchTerm, dateFilter, assignedFilter, page };
    sessionStorage.setItem(CACHE_KEY_FILTERS, JSON.stringify(filterState));
    sessionStorage.setItem(CACHE_KEY_DATA, JSON.stringify(leads));
  }, [leads, searchTerm, dateFilter, assignedFilter, page]);

  useEffect(() => {
    if (leads.length === 0) fetchData();
    else fetchUsers(); // Always fetch users to keep the dropdown fresh
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/leads/closed`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/api/auth/admins-managers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const data = Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data.leads || [];
      setLeads(data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (err) {
      setError("Failed to load historical lead data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/admins-managers`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (e) { console.error("User fetch failed"); }
  };

  const handleReset = () => {
    setSearchTerm("");
    setDateFilter("all");
    setAssignedFilter("all");
    setPage(1);
    sessionStorage.removeItem(CACHE_KEY_FILTERS);
  };

  // --- Filtering Logic ---
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (assignedFilter !== "all" && lead.assignedTo?._id !== assignedFilter) return false;

      if (dateFilter !== "all") {
        const leadDate = dayjs(lead.updatedAt || lead.createdAt);
        const today = dayjs().startOf('day');
        if (dateFilter === "today" && !leadDate.isSame(today, 'day')) return false;
        if (dateFilter === "week" && leadDate.isBefore(dayjs().startOf('week'))) return false;
        if (dateFilter === "month" && leadDate.isBefore(dayjs().startOf('month'))) return false;
      }
      return true;
    });
  }, [leads, searchTerm, dateFilter, assignedFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    thisMonth: leads.filter(l => dayjs(l.updatedAt).isAfter(dayjs().startOf('month'))).length,
    thisWeek: leads.filter(l => dayjs(l.updatedAt).isAfter(dayjs().startOf('week'))).length,
  }), [leads]);

  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading && leads.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh" gap={2}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary">Loading archive...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Header */}
      {/* <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
          Closed Archive
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          A read-only repository of successfully processed and closed leads.
        </Typography>
      </Box> */}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: "Total Closed", value: stats.total, icon: Archive, color: "#2563eb", bg: "#eff6ff" },
          { label: "This Month", value: stats.thisMonth, icon: CalendarDays, color: "#059669", bg: "#ecfdf5" },
          { label: "This Week", value: stats.thisWeek, icon: Calendar, color: "#d97706", bg: "#fffbeb" },
        ].map((stat, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card variant="outlined" sx={{ borderRadius: "6px", borderColor: "#e2e8f0" }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: "20px !important" }}>
                <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: stat.bg, color: stat.color }}>
                  <stat.icon size={22} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500, color: "#0f172a" }}>{stat.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters Container */}
      <Paper variant="outlined" sx={{ mb: 3, borderRadius: "6px", borderColor: "#e2e8f0", overflow: "hidden" }}>
        <Box sx={{ p: 2.5, bgcolor: "#fff" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth size="small"
                placeholder="Search lead name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: "4px" } }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={assignedFilter}
                  label="Assigned To"
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  sx={{ borderRadius: "4px" }}
                >
                  <MenuItem value="all">All Agents</MenuItem>
                  {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.username}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={dateFilter}
                  label="Timeframe"
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{ borderRadius: "4px" }}
                >
                  <MenuItem value="all">All History</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Button 
                fullWidth variant="outlined" color="inherit" 
                startIcon={<RotateCcw size={16} />}
                onClick={handleReset}
                sx={{ borderRadius: "4px", textTransform: 'none', height: "40px", borderColor: "#e2e8f0", color: "#64748b" }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "12px" }}>LEAD NAME</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "12px" }}>COUNTRY</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "12px" }}>PACKAGES</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "12px" }}>PITCHED AMOUNT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "12px" }}>TIMELINE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "12px" }}>CLOSING AGENT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <Typography variant="body2" color="text.secondary">No records found matching your criteria.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => (
                  <TableRow key={lead._id} sx={{ '&:hover': { bgcolor: "#f1f5f9" } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: "#e2e8f0", color: "#475569", fontWeight: 700 }}>
                          {lead.leadName?.charAt(0)}
                        </Avatar>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{lead.leadName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: "#64748b" }}>
                        <MapPin size={14} />
                        <Typography sx={{ fontSize: "13px" }}>{lead.country || "N/A"}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {lead.packages?.length > 0 ? (
                          lead.packages.map((p, i) => (
                            <Chip key={i} label={p} size="small" sx={{ height: 20, fontSize: "10px", borderRadius: "4px", bgcolor: "#f1f5f9" }} />
                          ))
                        ) : "—"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#059669" }}>
                        {lead.currencySymbol || "$"}{lead.pitchedAmount?.toLocaleString() || "0.00"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontSize: "11px", display: 'flex', alignItems: 'center', gap: 0.5, color: "#64748b" }}>
                          <Clock size={12} /> Created: {dayjs(lead.createdAt).format('DD MMM YYYY')}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", display: 'flex', alignItems: 'center', gap: 0.5, color: "#ef4444", fontWeight: 600 }}>
                          <Archive size={12} /> Closed: {dayjs(lead.updatedAt).format('DD MMM YYYY')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UserIcon size={14} color="#94a3b8" />
                        <Typography sx={{ fontSize: "13px", color: "#334155" }}>
                          {lead.assignedTo?.username || "System"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: "1px solid #e2e8f0" }}>
          <Pagination
            count={Math.ceil(filteredLeads.length / rowsPerPage)}
            page={page}
            onChange={(e, v) => setPage(v)}
            color="primary"
            size="medium"
            sx={{ '& .MuiPaginationItem-root': { borderRadius: "8px", fontWeight: 600 } }}
          />
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mt: 2, borderRadius: "8px" }}>{error}</Alert>}
    </Box>
  );
};

export default ClosedLeads;