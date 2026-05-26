import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box, Typography, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, IconButton, Avatar, Grid,
  CircularProgress, Snackbar, Alert, Divider
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { X, Phone, Mail, Calendar as CalendarIcon, Save, Briefcase, UserCheck, RefreshCw } from "lucide-react";

/* ─── Light Mode Design Tokens ──────────────────────────────────── */
const T = {
  bg:         "#f1f5f9", // Slate 50 (App background)
  surface:    "#ffffff", // White cards & modals
  surfaceAlt: "#f8fafc", // Slate 50 (Header/secondary areas)
  border:     "#e2e8f0", // Slate 200
  borderHov:  "#cbd5e1", // Slate 300
  text:       "#0f172a", // Slate 900 (Main text)
  textMuted:  "#64748b", // Slate 500 (Subtitles, icons)
  textFaint:  "#94a3b8", // Slate 400 (Dividers, disabled)
  
  amber:      "#f59e0b",
  amberDim:   "rgba(245,158,11,0.15)",
  amberText:  "#d97706", // Darker amber for readability on white
  
  emerald:    "#10b981",
  emeraldDim: "rgba(16,185,129,0.15)",
  emeraldText:"#059669", // Darker green for readability on white
  
  blue:       "#2563eb",
  blueDim:    "rgba(37,99,235,0.12)",
  
  radius:     "10px",
  radiusSm:   "6px",
};

/* ─── Global injected styles (FullCalendar overrides) ────────────── */
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  body { background: ${T.bg}; }

  /* Calendar shell */
  .fc { font-family: 'DM Sans', sans-serif !important; color: ${T.text}; }
  .fc-theme-standard td,
  .fc-theme-standard th { border-color: ${T.border} !important; }
  .fc-scrollgrid { border-color: ${T.border} !important; }

  /* Header toolbar */
  .fc-toolbar-title {
    font-family: 'Syne', sans-serif !important;
    font-size: 1.35rem !important;
    font-weight: 700 !important;
    color: ${T.text} !important;
    letter-spacing: -0.02em;
  }
  .fc-button-primary {
    background: ${T.surfaceAlt} !important;
    color: ${T.textMuted} !important;
    border: 1px solid ${T.border} !important;
    border-radius: ${T.radiusSm} !important;
    font-family: 'DM Sans', sans-serif !important;
    font-weight: 600 !important;
    font-size: 13px !important;
    padding: 6px 14px !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03) !important;
    transition: all 0.15s ease !important;
  }
  .fc-button-primary:hover {
    background: #f1f5f9 !important;
    color: ${T.text} !important;
    border-color: ${T.borderHov} !important;
  }
  .fc-button-primary:not(:disabled).fc-button-active,
  .fc-button-primary:not(:disabled):active {
    background: ${T.blueDim} !important;
    color: ${T.blue} !important;
    border-color: rgba(37,99,235,0.3) !important;
  }
  .fc-today-button {
    background: ${T.surface} !important;
    color: ${T.text} !important;
    border-color: ${T.border} !important;
  }
  .fc-today-button:disabled { opacity: 0.5 !important; }

  /* Column headers */
  .fc-col-header-cell {
    background: ${T.surfaceAlt} !important;
    padding: 10px 0 !important;
  }
  .fc-col-header-cell-cushion {
    color: ${T.textMuted} !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    text-decoration: none !important;
  }

  /* Day cells */
  .fc-daygrid-day { background: transparent !important; transition: background 0.15s; }
  .fc-daygrid-day:hover { background: rgba(0,0,0,0.015) !important; }
  .fc-daygrid-day-number {
    color: ${T.textMuted} !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    text-decoration: none !important;
    padding: 8px 10px !important;
  }
  .fc-day-today { background: rgba(37,99,235,0.04) !important; }
  .fc-day-today .fc-daygrid-day-number {
    color: ${T.blue} !important;
    background: ${T.blueDim};
    border-radius: 4px;
    margin: 4px;
    padding: 4px 8px !important;
  }
  .fc-day-other .fc-daygrid-day-number { color: ${T.textFaint} !important; }

  /* Events */
  .fc-event {
    border-radius: 4px !important;
    border: none !important;
    padding: 3px 6px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.01em !important;
    cursor: pointer !important;
    transition: transform 0.1s ease, opacity 0.15s ease !important;
  }
  .fc-event:hover { transform: translateY(-1px) !important; opacity: 0.85 !important; }
  .fc-event-title { font-family: 'DM Sans', sans-serif !important; }

  /* More link */
  .fc-daygrid-more-link {
    color: ${T.blue} !important;
    font-size: 11px !important;
    font-weight: 700 !important;
  }

  /* Popover */
  .fc-popover {
    background: ${T.surface} !important;
    border: 1px solid ${T.border} !important;
    border-radius: ${T.radius} !important;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important;
  }
  .fc-popover-header {
    background: ${T.surfaceAlt} !important;
    color: ${T.text} !important;
    font-weight: 700 !important;
  }
  .fc-popover-close { color: ${T.textMuted} !important; }

  /* MUI DatePicker override */
  .MuiPickersPopper-root .MuiPaper-root {
    background: ${T.surface} !important;
    border: 1px solid ${T.border} !important;
    border-radius: ${T.radius} !important;
    color: ${T.text} !important;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important;
  }
`;

/* ─── Stat Card ──────────────────────────────────────────────────── */
const StatCard = ({ label, value, accent, icon: Icon }) => (
  <Box sx={{
    p: 2.5,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    bgcolor: T.surface,
    display: "flex",
    alignItems: "center",
    gap: 2,
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:hover": { borderColor: T.borderHov, boxShadow: `0 4px 12px rgba(0,0,0,0.03)` },
  }}>
    <Box sx={{
      width: 42, height: 42, borderRadius: "10px",
      bgcolor: `${accent}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={20} color={accent} />
    </Box>
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: T.text, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: "12px", color: T.textMuted, mt: 0.4, fontWeight: 600 }}>{label}</Typography>
    </Box>
  </Box>
);

/* ─── Toggle ─────────────────────────────────────────────────────── */
const FilterToggle = ({ checked, onChange, color, icon: Icon, label }) => (
  <Box
    onClick={() => onChange(!checked)}
    sx={{
      display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.2,
      border: `1px solid ${checked ? `${color}40` : T.border}`,
      borderRadius: T.radiusSm,
      bgcolor: checked ? `${color}0f` : T.surface,
      cursor: "pointer",
      transition: "all 0.18s ease",
      userSelect: "none",
      "&:hover": { borderColor: `${color}60`, bgcolor: `${color}0f` },
    }}
  >
    <Box sx={{
      width: 32, height: 18, borderRadius: "10px",
      bgcolor: checked ? color : T.border,
      position: "relative", transition: "background 0.18s",
    }}>
      <Box sx={{
        position: "absolute", top: "50%",
        left: checked ? "calc(100% - 16px)" : "2px",
        transform: "translateY(-50%)",
        width: 14, height: 14, borderRadius: "50%",
        bgcolor: "#fff", transition: "left 0.18s ease",
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }} />
    </Box>
    <Icon size={14} color={checked ? color : T.textMuted} />
    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: checked ? color : T.textMuted, transition: "color 0.18s" }}>
      {label}
    </Typography>
  </Box>
);

/* ─── Main Component ─────────────────────────────────────────────── */
const LeadCalendar = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOngoing, setShowOngoing] = useState(true);
  const [showAssigned, setShowAssigned] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFollowUpDate, setNewFollowUpDate] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
  const token = localStorage.getItem("token");

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/leads/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : res.data.leads || [];
      setLeads(data);
    } catch {
      showToast("Failed to fetch leads", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  const stats = useMemo(() => {
    const active = leads.filter(l => l.status !== "dropped" && l.followUpDate);
    return {
      total: active.length,
      ongoing: active.filter(l => !l.assignedTo).length,
      assigned: active.filter(l => !!l.assignedTo).length,
      today: active.filter(l => dayjs(l.followUpDate).isSame(dayjs(), "day")).length,
    };
  }, [leads]);

  const calendarEvents = useMemo(() => {
    return leads
      .filter(l => l.status !== "dropped" && l.followUpDate)
      .filter(l => {
        const isAssigned = !!l.assignedTo;
        if (isAssigned && !showAssigned) return false;
        if (!isAssigned && !showOngoing) return false;
        return true;
      })
      .map(l => ({
        id: l._id,
        title: l.leadName,
        start: dayjs(l.followUpDate).format("YYYY-MM-DD"),
        allDay: true,
        backgroundColor: !!l.assignedTo ? T.emeraldDim : T.amberDim,
        textColor: !!l.assignedTo ? T.emeraldText : T.amberText,
        borderColor: "transparent",
        extendedProps: { lead: l },
      }));
  }, [leads, showOngoing, showAssigned]);

  const handleEventClick = (info) => {
    const lead = info.event.extendedProps.lead;
    setSelectedLead(lead);
    setNewFollowUpDate(dayjs(lead.followUpDate));
    setIsModalOpen(true);
  };

  const handleUpdateFollowUp = async () => {
    if (!newFollowUpDate || !selectedLead) return;
    setUpdating(true);
    try {
      const updatedDate = newFollowUpDate.toISOString();
      await axios.put(
        `${API_BASE}/api/leads/${selectedLead._id}/follow-up`,
        { followUpDate: updatedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeads(prev => prev.map(l => l._id === selectedLead._id ? { ...l, followUpDate: updatedDate } : l));
      showToast("Follow-up rescheduled successfully");
      setIsModalOpen(false);
    } catch {
      showToast("Failed to update follow-up", "error");
    } finally {
      setUpdating(false);
    }
  };

  /* Inject global styles */
  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = globalStyle;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  if (loading) return (
    <Box display="flex" alignItems="center" justifyContent="center" height="100vh" bgcolor={T.bg}>
      <Box textAlign="center">
        <CircularProgress size={32} sx={{ color: T.blue }} />
        <Typography sx={{ mt: 2, color: T.textMuted, fontSize: "14px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
          Loading calendar…
        </Typography>
      </Box>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: T.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Page Header ── */}
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={4} gap={2}>
          <Box>
            <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: { xs: "22px", md: "28px" }, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Follow-up Calendar
            </Typography>
            <Typography sx={{ fontSize: "14px", color: T.textMuted, mt: 0.6, fontWeight: 500 }}>
              Track and manage your upcoming lead interactions
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1.5}>
            <FilterToggle checked={showOngoing} onChange={setShowOngoing} color={T.amberText} icon={Briefcase} label="Ongoing" />
            <FilterToggle checked={showAssigned} onChange={setShowAssigned} color={T.emeraldText} icon={UserCheck} label="Transfers" />
            <IconButton onClick={fetchLeads} sx={{ border: `1px solid ${T.border}`, borderRadius: T.radiusSm, bgcolor: T.surface, color: T.textMuted, width: 40, height: 40, boxShadow: "0 1px 2px rgba(0,0,0,0.02)", "&:hover": { borderColor: T.borderHov, color: T.text } }}>
              <RefreshCw size={16} />
            </IconButton>
          </Box>
        </Box>

        {/* ── Stats Row ── */}
        <Grid container spacing={2} mb={4}>
          {[
            { label: "Total scheduled", value: stats.total, accent: T.blue, icon: CalendarIcon },
            { label: "Ongoing leads", value: stats.ongoing, accent: T.amberText, icon: Briefcase },
            { label: "Transferred leads", value: stats.assigned, accent: T.emeraldText, icon: UserCheck },
            { label: "Due today", value: stats.today, accent: "#8b5cf6", icon: CalendarIcon },
          ].map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>

        {/* ── Legend ── */}
        <Box display="flex" gap={3} mb={2.5} ml={0.5}>
          {[
            { color: T.amberText, label: "Ongoing follow-up" },
            { color: T.emeraldText, label: "Transferred lead" },
          ].map(({ color, label }) => (
            <Box key={label} display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
              <Typography sx={{ fontSize: "12px", color: T.textMuted, fontWeight: 600 }}>{label}</Typography>
            </Box>
          ))}
        </Box>

        {/* ── Calendar ── */}
        <Paper elevation={0} sx={{
          p: { xs: 2, md: 3 },
          borderRadius: T.radius,
          border: `1px solid ${T.border}`,
          bgcolor: T.surface,
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
          overflow: "hidden",
        }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            weekends
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,dayGridWeek" }}
          />
        </Paper>

        {/* ── Modal ── */}
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fullWidth maxWidth="xs"
          PaperProps={{
            sx: {
              bgcolor: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "14px",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }
          }}
        >
          {/* Modal header */}
          <DialogTitle sx={{ p: 0 }}>
            <Box sx={{ px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, bgcolor: T.surfaceAlt }}>
              <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "17px", color: T.text }}>
                Follow-up Details
              </Typography>
              <IconButton onClick={() => setIsModalOpen(false)} size="small" sx={{ color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, width: 30, height: 30, bgcolor: T.surface, "&:hover": { color: T.text, borderColor: T.borderHov } }}>
                <X size={16} />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3, bgcolor: T.surface }}>
            {selectedLead && (
              <Box display="flex" flexDirection="column" gap={3}>

                {/* Contact header */}
                <Box display="flex" alignItems="center" gap={2.5}>
                  <Avatar sx={{
                    width: 52, height: 52,
                    bgcolor: !!selectedLead.assignedTo ? T.emeraldDim : T.amberDim,
                    color: !!selectedLead.assignedTo ? T.emeraldText : T.amberText,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800, fontSize: "20px",
                    border: `1px solid ${!!selectedLead.assignedTo ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                  }}>
                    {selectedLead.leadName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "18px", color: T.text, lineHeight: 1.2 }}>
                      {selectedLead.leadName}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.8} mt={0.5}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: !!selectedLead.assignedTo ? T.emeraldText : T.amberText }} />
                      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: !!selectedLead.assignedTo ? T.emeraldText : T.amberText, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {!!selectedLead.assignedTo ? "Transferred" : "Ongoing"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Contact info */}
                {[
                  { icon: Mail, label: "Email Address", value: selectedLead.email },
                  { icon: Phone, label: "Phone Number", value: selectedLead.phoneNumber },
                ].map(({ icon: Icon, label, value }) => (
                  <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, borderRadius: T.radiusSm, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: "#fff", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={16} color={T.textMuted} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "10px", color: T.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
                      <Typography sx={{ fontSize: "14px", color: value ? T.text : T.textMuted, fontWeight: 600, mt: 0.2 }}>{value || "Not provided"}</Typography>
                    </Box>
                  </Box>
                ))}

                <Divider sx={{ borderColor: T.border }} />

                {/* Reschedule */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <CalendarIcon size={16} color={T.blue} />
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: T.text }}>Reschedule Date</Typography>
                  </Box>
                  <DatePicker
                    value={newFollowUpDate}
                    onChange={setNewFollowUpDate}
                    slotProps={{
                      textField: {
                        fullWidth: true, size: "medium",
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: T.radiusSm,
                            bgcolor: T.surfaceAlt,
                            color: T.text,
                            fontWeight: 500,
                            "& fieldset": { borderColor: T.border },
                            "&:hover fieldset": { borderColor: T.borderHov },
                            "&.Mui-focused fieldset": { borderColor: T.blue, borderWidth: "2px" },
                          },
                          "& .MuiInputAdornment-root .MuiIconButton-root": { color: T.textMuted },
                        }
                      }
                    }}
                  />
                </Box>

              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1.5 }}>
            <Button onClick={() => setIsModalOpen(false)} sx={{ flex: 1, borderRadius: T.radiusSm, textTransform: "none", fontWeight: 700, fontSize: "14px", color: T.textMuted, border: `1px solid ${T.border}`, bgcolor: T.surface, "&:hover": { bgcolor: T.surfaceAlt, color: T.text, borderColor: T.borderHov } }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFollowUp}
              disabled={updating || !newFollowUpDate}
              startIcon={updating ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : <Save size={14} />}
              sx={{ flex: 1, borderRadius: T.radiusSm, textTransform: "none", fontWeight: 700, fontSize: "14px", bgcolor: T.blue, color: "#fff", boxShadow: "0 2px 4px rgba(37,99,235,0.2)", "&:hover": { bgcolor: "#1d4ed8", boxShadow: "0 4px 6px rgba(37,99,235,0.3)" }, "&.Mui-disabled": { bgcolor: T.blueDim, color: T.blue + "80", boxShadow: "none" } }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Toast ── */}
        <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert
            severity={toast.severity}
            variant="filled"
            sx={{
              borderRadius: T.radiusSm,
              bgcolor: toast.severity === "success" ? T.emeraldText : "#ef4444",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>

      </Box>
    </LocalizationProvider>
  );
};

export default LeadCalendar;