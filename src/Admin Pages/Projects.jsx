
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Switch,
  Dialog as MUIDialog,
  DialogActions as MUIDialogActions,
  DialogContent as MUIDialogContent,
  DialogContentText as MUIDialogContentText,
  DialogTitle as MUIDialogTitle,
  Tooltip,
  IconButton,
  Pagination,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Drawer,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Search,
  Edit,
  FilterList,
  Close as CloseIcon,
} from "@mui/icons-material";
import FolderIcon from "@mui/icons-material/Folder";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { CircularProgress } from "@mui/material";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const J = {
  blue: "#0052CC",
  blueDark: "#0747A6",
  blueLight: "#DEEBFF",
  green: "#006644",
  greenBg: "#E3FCEF",
  red: "#BF2600",
  redBg: "#FFEBE6",
  border: "#DFE1E6",
  borderFocus: "#4C9AFF",
  bgPage: "#F4F5F7",
  bgSurface: "#FFFFFF",
  bgHover: "#EBECF0",
  bgSubtle: "#F4F5F7",
  textPrimary: "#172B4D",
  textSecondary: "#5E6C84",
  textDisabled: "#A5ADBA",
  fontFamily:
    "'Atlassian Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  radius: "3px",
  shadowCard: "0 1px 3px rgba(9, 30, 66, 0.13)",
};

const statusConfig = {
  Active: { bg: J.greenBg, color: J.green, label: "ACTIVE" },
  Closed: { bg: J.redBg, color: J.red, label: "CLOSED" },
};

// ── Normalize assignedDeveloper to always be an array ────────────────────────
const normalizeDevelopers = (assignedDeveloper) => {
  if (!assignedDeveloper) return [];
  if (Array.isArray(assignedDeveloper))
    return assignedDeveloper.filter((d) => d && d.username);
  if (assignedDeveloper.username) return [assignedDeveloper];
  return [];
};

const getDevNamesString = (assignedDeveloper) =>
  normalizeDevelopers(assignedDeveloper)
    .map((d) => d.username)
    .join(", ") || "—";

// ── Avatar colour from name ──────────────────────────────────────────────────
const AVATAR_PALETTE = [
  "#0052CC", "#00875A", "#FF5630", "#FF991F", "#6554C0", "#00B8D9",
];
const stringToColor = (s) => {
  if (!s) return AVATAR_PALETTE[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
};

// ── DevCell — compact stacked avatars + truncated name, tooltip for all ──────
// Fixed to 160 px wide. Shows up to 2 overlapping avatars then a "+N" disc.
// Only the first developer's first name is shown as text to avoid overflow.
const DevCell = ({ assignedDeveloper }) => {
  const devs = normalizeDevelopers(assignedDeveloper);

  if (devs.length === 0)
    return (
      <Typography sx={{ fontSize: "0.8rem", color: J.textSecondary }}>
        —
      </Typography>
    );

  const MAX_AVATARS = 2;
  const shown = devs.slice(0, MAX_AVATARS);
  const overflow = devs.length - MAX_AVATARS;
  const tooltipLabel = devs.map((d) => d.username).join(", ");

  // Label text: first name of first dev; if >1 devs, truncate with "…"
  const labelText =
    devs.length === 1
      ? devs[0].username
      : `${devs[0].username.split(" ")[0]} +${devs.length - 1}`;

  return (
    <Tooltip title={tooltipLabel} arrow placement="top">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: 0,
          maxWidth: "100%",
          cursor: "default",
          overflow: "hidden",
        }}
      >
        {/* Overlapping avatar stack */}
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {shown.map((dev, i) => (
            <Avatar
              key={dev.id || i}
              sx={{
                width: 22,
                height: 22,
                fontSize: "0.62rem",
                fontWeight: 700,
                bgcolor: stringToColor(dev.username),
                border: `1.5px solid ${J.bgSurface}`,
                ml: i > 0 ? "-7px" : 0,
                zIndex: shown.length - i,
              }}
            >
              {dev.username.charAt(0).toUpperCase()}
            </Avatar>
          ))}
          {overflow > 0 && (
            <Avatar
              sx={{
                width: 22,
                height: 22,
                fontSize: "0.58rem",
                fontWeight: 700,
                bgcolor: J.bgHover,
                color: J.textSecondary,
                border: `1.5px solid ${J.bgSurface}`,
                ml: "-7px",
                zIndex: 0,
              }}
            >
              +{overflow}
            </Avatar>
          )}
        </Box>

        {/* Name label — truncated */}
        <Typography
          sx={{
            fontSize: "0.8rem",
            color: J.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
          }}
        >
          {labelText}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.Active;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1,
        py: 0.25,
        borderRadius: J.radius,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: "0.7rem",
        letterSpacing: "0.04em",
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {cfg.label}
    </Box>
  );
};

// ── Jira chip ─────────────────────────────────────────────────────────────────
const JiraChip = ({ label, color = "blue" }) => {
  const palette = {
    blue: { bg: J.blueLight, text: J.blue },
    green: { bg: J.greenBg, text: J.green },
    gray: { bg: J.bgSubtle, text: J.textSecondary },
  };
  const c = palette[color] || palette.blue;
  return (
    <Box
      sx={{
        display: "inline-block",
        px: 0.75,
        py: 0.25,
        borderRadius: J.radius,
        bgcolor: c.bg,
        color: c.text,
        fontSize: "0.72rem",
        fontWeight: 500,
        lineHeight: 1.5,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
};

// ── Mobile card ───────────────────────────────────────────────────────────────
const MobileProjectCard = ({
  project,
  onView,
  onDelete,
  onToggleUpSale,
  onUpsaleInfo,
}) => (
  <Card
    sx={{
      mb: 1,
      borderRadius: J.radius,
      boxShadow: J.shadowCard,
      border: `1px solid ${J.border}`,
      bgcolor: J.bgSurface,
    }}
  >
    <CardContent sx={{ p: "12px 16px", "&:last-child": { pb: "12px" } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          <FolderIcon sx={{ color: J.blue, fontSize: 18, flexShrink: 0 }} />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              color: J.textPrimary,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {project.projectName}
          </Typography>
        </Box>
        <StatusBadge status={project.status} />
      </Box>

      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
        {project.serviceType.map((s, i) => (
          <JiraChip key={i} label={s} color="blue" />
        ))}
        <JiraChip label={project.subscriptionType} color="gray" />
      </Box>

      <Typography sx={{ fontSize: "0.8rem", color: J.textSecondary, mb: 1 }}>
        Assigned:{" "}
        <span style={{ color: J.textPrimary, fontWeight: 500 }}>
          {getDevNamesString(project.assignedDeveloper)}
        </span>
      </Typography>

      <Divider sx={{ my: 1, borderColor: J.border }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: "0.8rem", color: J.textSecondary }}>
            Up-Sale
          </Typography>
          <Switch
            checked={project.upSale}
            onChange={() => onToggleUpSale(project._id, project.upSale)}
            size="small"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: J.blue },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                bgcolor: J.blue,
              },
            }}
          />
          {project.upSale && (
            <Button
              size="small"
              onClick={() => onUpsaleInfo(project._id)}
              sx={{
                color: J.blue,
                fontSize: "0.75rem",
                textTransform: "none",
                p: 0,
                minWidth: 0,
              }}
            >
              + Info
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => onView(project)}
            sx={{ color: J.blue, p: "4px" }}
          >
            <VisibilityIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(project._id)}
            sx={{ color: J.red, p: "4px" }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ── Filter drawer ─────────────────────────────────────────────────────────────
const FilterDrawer = ({
  open,
  onClose,
  subscriptionFilter,
  createdByFilter,
  assignedToFilter,
  serviceTypeFilter,
  onSubscriptionChange,
  onCreatedByChange,
  onAssignedToChange,
  onServiceTypeChange,
  subscriptionTypes,
  createdByValues,
  assignedToValues,
  serviceTypeValues,
}) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: { width: 280, borderLeft: `1px solid ${J.border}` },
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        py: 1.5,
        borderBottom: `1px solid ${J.border}`,
        bgcolor: J.bgPage,
      }}
    >
      <Typography
        sx={{ fontWeight: 600, fontSize: "0.875rem", color: J.textPrimary }}
      >
        Filters
      </Typography>
      <IconButton onClick={onClose} size="small">
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
    <Stack spacing={0} divider={<Divider sx={{ borderColor: J.border }} />}>
      {[
        {
          label: "Subscription",
          value: subscriptionFilter,
          onChange: onSubscriptionChange,
          options: subscriptionTypes,
        },
        {
          label: "Created By",
          value: createdByFilter,
          onChange: onCreatedByChange,
          options: createdByValues,
        },
        {
          label: "Assigned To",
          value: assignedToFilter,
          onChange: onAssignedToChange,
          options: assignedToValues,
        },
        {
          label: "Service Type",
          value: serviceTypeFilter,
          onChange: onServiceTypeChange,
          options: serviceTypeValues,
        },
      ].map(({ label, value, onChange, options }) => (
        <Box key={label} sx={{ px: 2, py: 1.5 }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: J.textSecondary,
              mb: 0.75,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={value}
              onChange={onChange}
              displayEmpty
              sx={{
                fontSize: "0.875rem",
                borderRadius: J.radius,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: J.border,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: J.borderFocus,
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: "0.875rem" }}>
                All
              </MenuItem>
              {options.map((o) => (
                <MenuItem key={o} value={o} sx={{ fontSize: "0.875rem" }}>
                  {o}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ))}
    </Stack>
  </Drawer>
);

// ── Shared MUI field styles ───────────────────────────────────────────────────
const jiraField = {
  "& .MuiOutlinedInput-root": {
    borderRadius: J.radius,
    fontSize: "0.875rem",
    "& fieldset": { borderColor: J.border },
    "&:hover fieldset": { borderColor: J.borderFocus },
    "&.Mui-focused fieldset": { borderColor: J.blue },
  },
  "& .MuiInputLabel-root": { fontSize: "0.875rem", color: J.textSecondary },
  "& .MuiInputLabel-root.Mui-focused": { color: J.blue },
};

const jiraFilledField = {
  "& .MuiFilledInput-root": {
    borderRadius: J.radius,
    bgcolor: J.bgSubtle,
    fontSize: "0.875rem",
    "&:before, &:after": { display: "none" },
    "&:hover": { bgcolor: "#EBECF0" },
  },
};

const labelSx = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: J.textSecondary,
  mb: 0.5,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

// ── Grid column widths ────────────────────────────────────────────────────────
// "Assigned To" is a fixed 155px — DevCell handles internal truncation.
// The whole table has a minWidth so it scrolls horizontally rather than
// collapsing on narrow screens.
const COLS = "minmax(160px,2fr) 155px minmax(110px,1.2fr) 110px 120px 130px 96px";

// ── Main component ────────────────────────────────────────────────────────────
const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [open, setOpen] = useState(false);
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [projectToDeleteId, setProjectToDeleteId] = useState(null);
  const [upsaleDialogOpen, setUpsaleDialogOpen] = useState(false);
  const [upsaleData, setUpsaleData] = useState({
    serviceType: "",
    amount: "",
    details: "",
    comments: "",
  });
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [editUpsaleDialogOpen, setEditUpsaleDialogOpen] = useState(false);
  const [selectedUpsaleId, setSelectedUpsaleId] = useState(null);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [editProjectData, setEditProjectData] = useState({
    projectName: "",
    clientName: "",
    clientEmail: "",
    clientNumber: "",
    amount: "",
    assignedDeveloper: [],
    serviceType: [],
    referenceSite: "",
    businessNiche: "",
    projectDetails: "",
    comments: "",
    subscriptionType: "",
    createdBy: "",
  });
  const [serviceTypes, setServiceTypes] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const projectsPerPage = 10;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [updates, setUpdates] = useState([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/auth/developers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((r) => setDevelopers(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/servicetypes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((r) => setServiceTypes(r.data.map((st) => st.name)))
      .catch(() => {});
  }, []);

  const fetchProjects = async () => {
    try {
      const r = await axios.get(`${API_BASE}/api/newproject/projects`);
      setProjects(Array.isArray(r.data) ? r.data : []);
    } catch {
      setProjects([]);
    }
  };

  const filteredProjects = Array.isArray(projects)
    ? projects.filter((p) => {
        const devNames = normalizeDevelopers(p.assignedDeveloper).map(
          (d) => d.username
        );
        return (
          p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (!subscriptionFilter || p.subscriptionType === subscriptionFilter) &&
          (!createdByFilter || p.createdBy === createdByFilter) &&
          (!assignedToFilter || devNames.includes(assignedToFilter)) &&
          (!serviceTypeFilter || p.serviceType.includes(serviceTypeFilter))
        );
      })
    : [];

  const currentProjects = filteredProjects.slice(
    (page - 1) * projectsPerPage,
    page * projectsPerPage
  );

  const subscriptionTypes = [
    ...new Set(projects.map((p) => p.subscriptionType).filter(Boolean)),
  ];
  const createdByValues = [
    ...new Set(projects.map((p) => p.createdBy).filter(Boolean)),
  ];
  const assignedToValues = [
    ...new Set(
      projects.flatMap((p) =>
        normalizeDevelopers(p.assignedDeveloper).map((d) => d.username)
      )
    ),
  ];
  const serviceTypeValues = [
    ...new Set(projects.flatMap((p) => p.serviceType || [])),
  ];

  const handleViewClick = (p) => {
    setSelectedProject(p);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedProject(null);
  };
  const handleDeleteClick = (id) => {
    setProjectToDeleteId(id);
    setDeleteConfirmationOpen(true);
  };
  const cancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setProjectToDeleteId(null);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE}/api/newproject/projects/${projectToDeleteId}`
      );
      fetchProjects();
      setSnackbarMessage("Project deleted successfully.");
      setSnackbarSeverity("success");
    } catch {
      setSnackbarMessage("Failed to delete project.");
      setSnackbarSeverity("error");
    } finally {
      setDeleteConfirmationOpen(false);
      setProjectToDeleteId(null);
      setSnackbarOpen(true);
    }
  };

  const handleToggleUpSale = async (id, cur) => {
    const newStatus = !cur;
    setProjects((prev) =>
      prev.map((p) => (p._id === id ? { ...p, upSale: newStatus } : p))
    );
    try {
      await axios.put(
        `${API_BASE}/api/newproject/projects/${id}/up-sale`,
        { upSale: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch {}
  };

  const handleStatusChange = async (id, status) => {
    try {
      const r = await axios.put(
        `${API_BASE}/api/newproject/projects/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const updated = r.data.updatedProject;
      setProjects((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }
  };

  const handleEditProjectClick = (p) => {
    setEditProjectData({
      ...p,
      assignedDeveloper: normalizeDevelopers(p.assignedDeveloper),
    });
    setEditProjectDialogOpen(true);
  };
  const handleEditProjectDialogClose = () => setEditProjectDialogOpen(false);

  const handleEditProjectSubmit = async () => {
    try {
      await axios.put(
        `${API_BASE}/api/newproject/projects/${selectedProject._id}`,
        editProjectData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchProjects();
      handleEditProjectDialogClose();
      setSnackbarMessage("Project updated.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage("Update failed.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleUpsaleSubmit = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/newproject/projects/${selectedProjectId}/upsale`,
        upsaleData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchProjects();
      setUpsaleDialogOpen(false);
      setUpsaleData({ serviceType: "", amount: "", details: "", comments: "" });
      setSnackbarMessage("Upsale added.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage("Failed to add upsale.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditUpsaleSubmit = async () => {
    try {
      await axios.put(
        `${API_BASE}/api/newproject/projects/${selectedProjectId}/upsale/${selectedUpsaleId}`,
        upsaleData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchProjects();
      setEditUpsaleDialogOpen(false);
      setUpsaleData({ serviceType: "", amount: "", details: "", comments: "" });
    } catch {}
  };

  const handleUpdateClick = async (project) => {
    setSelectedProject(project);
    setIsChatOpen(true);
    setIsLoadingUpdates(true);
    try {
      const r = await axios.get(
        `${API_BASE}/api/newproject/projects/${project._id}/updates`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          validateStatus: (s) => s < 500,
        }
      );
      setUpdates(
        (r.data || []).map((u) => ({
          ...u,
          _id: u._id || Math.random().toString(),
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          createdBy: {
            id: u.createdBy?.id || "unknown",
            username: u.createdBy?.username || "Unknown",
          },
        }))
      );
    } catch {
      setUpdates([]);
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  const handleSendUpdate = async () => {
    if (!message.trim() || !selectedProject) return;
    const tempId = Date.now().toString();
    const newUpdate = {
      _id: tempId,
      text: message,
      createdAt: new Date(),
      createdBy: {
        id: localStorage.getItem("userId"),
        username: localStorage.getItem("username") || "You",
      },
    };
    setUpdates((prev) => [...prev, newUpdate]);
    setMessage("");
    try {
      await axios.post(
        `${API_BASE}/api/newproject/projects/${selectedProject._id}/updates`,
        { text: message },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const r = await axios.get(
        `${API_BASE}/api/newproject/projects/${selectedProject._id}/updates`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUpdates(r.data || []);
    } catch {
      setUpdates((prev) => prev.filter((u) => u._id !== tempId));
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [updates]);

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: J.bgPage,
        minHeight: "100vh",
        fontFamily: J.fontFamily,
      }}
    >
      {/* ── Top bar ── */}
      <Box
        sx={{
          bgcolor: J.bgSurface,
          borderBottom: `1px solid ${J.border}`,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, height: 48 }}
        >
          <FolderIcon sx={{ color: J.blue, fontSize: 20 }} />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9375rem",
              color: J.textPrimary,
            }}
          >
            Projects
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: "0.8rem", color: J.textSecondary }}>
            {filteredProjects.length} project
            {filteredProjects.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>

      {/* ── Toolbar ── */}
      <Box
        sx={{
          bgcolor: J.bgSurface,
          borderBottom: `1px solid ${J.border}`,
          px: { xs: 2, md: 4 },
          py: 1.25,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Search projects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: J.textSecondary, fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: J.radius,
                fontSize: "0.875rem",
                height: 32,
                bgcolor: J.bgPage,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: J.border,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: J.borderFocus,
                },
              },
            }}
            sx={{ width: 220 }}
          />

          {!isMobile &&
            [
              {
                label: "Subscription",
                value: subscriptionFilter,
                onChange: (e) => setSubscriptionFilter(e.target.value),
                options: subscriptionTypes,
              },
              {
                label: "Created by",
                value: createdByFilter,
                onChange: (e) => setCreatedByFilter(e.target.value),
                options: createdByValues,
              },
              {
                label: "Assigned to",
                value: assignedToFilter,
                onChange: (e) => setAssignedToFilter(e.target.value),
                options: assignedToValues,
              },
              {
                label: "Service",
                value: serviceTypeFilter,
                onChange: (e) => setServiceTypeFilter(e.target.value),
                options: serviceTypeValues,
              },
            ].map(({ label, value, onChange, options }) => (
              <FormControl key={label} size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={value}
                  onChange={onChange}
                  displayEmpty
                  sx={{
                    height: 32,
                    borderRadius: J.radius,
                    fontSize: "0.8125rem",
                    bgcolor: J.bgSurface,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: J.border,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: J.borderFocus,
                    },
                  }}
                  renderValue={(v) =>
                    v ? (
                      <span style={{ color: J.textPrimary }}>{v}</span>
                    ) : (
                      <span style={{ color: J.textSecondary }}>{label}</span>
                    )
                  }
                >
                  <MenuItem value="" sx={{ fontSize: "0.8125rem" }}>
                    All {label}
                  </MenuItem>
                  {options.map((o) => (
                    <MenuItem key={o} value={o} sx={{ fontSize: "0.8125rem" }}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}

          {isMobile && (
            <Button
              size="small"
              startIcon={<FilterList sx={{ fontSize: 16 }} />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                height: 32,
                borderRadius: J.radius,
                color: J.textSecondary,
                border: `1px solid ${J.border}`,
                bgcolor: J.bgSurface,
                fontSize: "0.8125rem",
                textTransform: "none",
              }}
            >
              Filters
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        {isMobile ? (
          currentProjects.map((p) => (
            <MobileProjectCard
              key={p._id}
              project={p}
              onView={handleViewClick}
              onDelete={handleDeleteClick}
              onToggleUpSale={handleToggleUpSale}
              onUpsaleInfo={(id) => {
                setSelectedProjectId(id);
                setUpsaleDialogOpen(true);
              }}
            />
          ))
        ) : (
          // Outer wrapper enables horizontal scroll on narrow viewports
          // so the grid never collapses below its min-width.
          <Box sx={{ overflowX: "auto" }}>
            <Box
              sx={{
                bgcolor: J.bgSurface,
                border: `1px solid ${J.border}`,
                borderRadius: J.radius,
                boxShadow: J.shadowCard,
                overflow: "hidden",
                minWidth: 860,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: COLS,
                  px: 2,
                  py: 1,
                  bgcolor: J.bgPage,
                  borderBottom: `2px solid ${J.border}`,
                }}
              >
                {[
                  "Project",
                  "Assigned To",
                  "Service Type",
                  "Subscription",
                  "Status",
                  "Up-Sale",
                  "Actions",
                ].map((h) => (
                  <Typography
                    key={h}
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: J.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </Typography>
                ))}
              </Box>

              {/* Rows */}
              {currentProjects.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <FolderIcon
                    sx={{ fontSize: 40, color: J.textDisabled, mb: 1 }}
                  />
                  <Typography
                    sx={{ color: J.textSecondary, fontSize: "0.875rem" }}
                  >
                    No projects found
                  </Typography>
                </Box>
              ) : (
                currentProjects.map((project, idx) => (
                  <Box
                    key={project._id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: COLS,
                      px: 2,
                      py: 1.25,
                      borderBottom:
                        idx < currentProjects.length - 1
                          ? `1px solid ${J.border}`
                          : "none",
                      alignItems: "center",
                      transition: "background 0.1s",
                      "&:hover": { bgcolor: "#FAFBFC" },
                    }}
                  >
                    {/* Project name */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        minWidth: 0,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: J.radius,
                          bgcolor: J.blueLight,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FolderIcon sx={{ fontSize: 15, color: J.blue }} />
                      </Box>
                      <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                        <Typography
                          onClick={() => handleViewClick(project)}
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: J.blue,
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {project.projectName}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.72rem",
                            color: J.textSecondary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {project.createdBy}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Assigned — compact, never overflows */}
                    <DevCell assignedDeveloper={project.assignedDeveloper} />

                    {/* Service type */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        overflow: "hidden",
                      }}
                    >
                      {project.serviceType.slice(0, 2).map((s, i) => (
                        <JiraChip key={i} label={s} color="blue" />
                      ))}
                      {project.serviceType.length > 2 && (
                        <JiraChip
                          label={`+${project.serviceType.length - 2}`}
                          color="gray"
                        />
                      )}
                    </Box>

                    {/* Subscription */}
                    <JiraChip label={project.subscriptionType} color="gray" />

                    {/* Status */}
                    <FormControl size="small">
                      <Select
                        value={project.status}
                        onChange={(e) =>
                          handleStatusChange(project._id, e.target.value)
                        }
                        sx={{
                          height: 28,
                          borderRadius: J.radius,
                          bgcolor:
                            project.status === "Active"
                              ? J.greenBg
                              : J.redBg,
                          color:
                            project.status === "Active" ? J.green : J.red,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          letterSpacing: "0.04em",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "& .MuiSelect-icon": {
                            color:
                              project.status === "Active" ? J.green : J.red,
                          },
                        }}
                      >
                        <MenuItem
                          value="Active"
                          sx={{ fontSize: "0.8125rem" }}
                        >
                          ACTIVE
                        </MenuItem>
                        <MenuItem
                          value="Closed"
                          sx={{ fontSize: "0.8125rem" }}
                        >
                          CLOSED
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {/* Up-sale */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Switch
                        checked={project.upSale}
                        onChange={() =>
                          handleToggleUpSale(project._id, project.upSale)
                        }
                        size="small"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: J.blue,
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            { bgcolor: J.blue },
                        }}
                      />
                      {project.upSale && (
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedProjectId(project._id);
                            setUpsaleDialogOpen(true);
                          }}
                          sx={{
                            color: J.blue,
                            fontSize: "0.7rem",
                            textTransform: "none",
                            p: "2px 6px",
                            minWidth: 0,
                            border: `1px solid ${J.border}`,
                            borderRadius: J.radius,
                          }}
                        >
                          + Add
                        </Button>
                      )}
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.25,
                      }}
                    >
                      <Tooltip title="Updates" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateClick(project)}
                          sx={{
                            color: J.textSecondary,
                            p: "4px",
                            borderRadius: J.radius,
                            "&:hover": { bgcolor: J.bgHover, color: J.blue },
                          }}
                        >
                          <MessageSquare size={15} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleViewClick(project)}
                          sx={{
                            color: J.textSecondary,
                            p: "4px",
                            borderRadius: J.radius,
                            "&:hover": { bgcolor: J.bgHover, color: J.blue },
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(project._id)}
                          sx={{
                            color: J.textSecondary,
                            p: "4px",
                            borderRadius: J.radius,
                            "&:hover": {
                              bgcolor: "#FFEBE6",
                              color: J.red,
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )}

        {/* Pagination */}
        {filteredProjects.length > projectsPerPage && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography sx={{ fontSize: "0.8rem", color: J.textSecondary }}>
              {(page - 1) * projectsPerPage + 1}–
              {Math.min(page * projectsPerPage, filteredProjects.length)} of{" "}
              {filteredProjects.length}
            </Typography>
            <Pagination
              count={Math.ceil(filteredProjects.length / projectsPerPage)}
              page={page}
              onChange={(_, v) => setPage(v)}
              size="small"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: J.radius,
                  fontSize: "0.8125rem",
                  color: J.textSecondary,
                  border: `1px solid ${J.border}`,
                  "&:hover": { bgcolor: J.bgHover },
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  bgcolor: J.blue,
                  color: "#fff",
                  border: "none",
                  "&:hover": { bgcolor: J.blueDark },
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* ── Filter drawer ── */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        subscriptionFilter={subscriptionFilter}
        createdByFilter={createdByFilter}
        assignedToFilter={assignedToFilter}
        serviceTypeFilter={serviceTypeFilter}
        onSubscriptionChange={(e) => setSubscriptionFilter(e.target.value)}
        onCreatedByChange={(e) => setCreatedByFilter(e.target.value)}
        onAssignedToChange={(e) => setAssignedToFilter(e.target.value)}
        onServiceTypeChange={(e) => setServiceTypeFilter(e.target.value)}
        subscriptionTypes={subscriptionTypes}
        createdByValues={createdByValues}
        assignedToValues={assignedToValues}
        serviceTypeValues={serviceTypeValues}
      />

      {/* ── Project details dialog ── */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: J.radius,
            boxShadow: "0 8px 32px rgba(9,30,66,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${J.border}`,
            py: 2,
            px: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <FolderIcon sx={{ color: J.blue, fontSize: 20 }} />
            <Typography
              sx={{ fontWeight: 600, fontSize: "1rem", color: J.textPrimary }}
            >
              Project Details
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: J.bgPage }}>
          {selectedProject && (
            <>
              <Box
                sx={{
                  bgcolor: J.bgSurface,
                  border: `1px solid ${J.border}`,
                  borderRadius: J.radius,
                  p: 3,
                  mb: 3,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: J.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    mb: 2,
                  }}
                >
                  Project Information
                </Typography>
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Project Name",
                      value: selectedProject.projectName,
                    },
                    { label: "Client", value: selectedProject.clientName },
                    {
                      label: "Client Email",
                      value: selectedProject.clientEmail,
                    },
                    {
                      label: "Client Number",
                      value: selectedProject.clientNumber,
                    },
                    { label: "Amount", value: selectedProject.amount },
                    {
                      label: "Assigned Developer(s)",
                      value: getDevNamesString(selectedProject.assignedDeveloper),
                    },
                    {
                      label: "Service Type",
                      value: (selectedProject.serviceType || []).join(", "),
                    },
                    {
                      label: "Reference Site",
                      value: selectedProject.referenceSite,
                    },
                    {
                      label: "Business Niche",
                      value: selectedProject.businessNiche,
                    },
                    {
                      label: "Subscription Type",
                      value: selectedProject.subscriptionType,
                    },
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Typography component="span" sx={labelSx}>
                        {label}
                      </Typography>
                      <TextField
                        variant="filled"
                        fullWidth
                        value={value || "—"}
                        InputProps={{ readOnly: true, disableUnderline: true }}
                        sx={jiraFilledField}
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Typography component="span" sx={labelSx}>
                      Details
                    </Typography>
                    <TextField
                      variant="filled"
                      fullWidth
                      multiline
                      rows={3}
                      value={selectedProject.projectDetails || "—"}
                      InputProps={{ readOnly: true, disableUnderline: true }}
                      sx={jiraFilledField}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography component="span" sx={labelSx}>
                      Comments
                    </Typography>
                    <TextField
                      variant="filled"
                      fullWidth
                      multiline
                      rows={2}
                      value={selectedProject.comments || "—"}
                      InputProps={{ readOnly: true, disableUnderline: true }}
                      sx={jiraFilledField}
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  startIcon={<Edit sx={{ fontSize: 15 }} />}
                  onClick={() => handleEditProjectClick(selectedProject)}
                  disableElevation
                  sx={{
                    mt: 2.5,
                    height: 32,
                    borderRadius: J.radius,
                    bgcolor: J.blue,
                    fontSize: "0.8125rem",
                    textTransform: "none",
                    "&:hover": { bgcolor: J.blueDark },
                  }}
                >
                  Edit project
                </Button>
              </Box>

              {selectedProject.upsaleData?.length > 0 && (
                <Box
                  sx={{
                    bgcolor: J.bgSurface,
                    border: `1px solid ${J.border}`,
                    borderRadius: J.radius,
                    p: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      color: J.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      mb: 2,
                    }}
                  >
                    Upsale Packages
                  </Typography>
                  {selectedProject.upsaleData.map((upsale, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        mb:
                          idx < selectedProject.upsaleData.length - 1 ? 3 : 0,
                        pb:
                          idx < selectedProject.upsaleData.length - 1 ? 3 : 0,
                        borderBottom:
                          idx < selectedProject.upsaleData.length - 1
                            ? `1px solid ${J.border}`
                            : "none",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
                        <JiraChip label={`Package ${idx + 1}`} color="blue" />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit sx={{ fontSize: 13 }} />}
                          onClick={() => {
                            setSelectedProjectId(selectedProject._id);
                            setSelectedUpsaleId(upsale._id);
                            setUpsaleData(upsale);
                            setEditUpsaleDialogOpen(true);
                          }}
                          sx={{
                            height: 28,
                            borderRadius: J.radius,
                            color: J.blue,
                            borderColor: J.border,
                            fontSize: "0.75rem",
                            textTransform: "none",
                            "&:hover": {
                              borderColor: J.blue,
                              bgcolor: J.blueLight,
                            },
                          }}
                        >
                          Edit
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        {[
                          {
                            label: "Service Type",
                            value: upsale.serviceType,
                          },
                          { label: "Amount", value: upsale.amount },
                        ].map(({ label, value }) => (
                          <Grid item xs={12} sm={6} key={label}>
                            <Typography component="span" sx={labelSx}>
                              {label}
                            </Typography>
                            <TextField
                              variant="filled"
                              fullWidth
                              value={value || "—"}
                              InputProps={{
                                readOnly: true,
                                disableUnderline: true,
                              }}
                              sx={jiraFilledField}
                            />
                          </Grid>
                        ))}
                        {[
                          { label: "Details", value: upsale.details },
                          { label: "Comments", value: upsale.comments },
                        ].map(({ label, value }) => (
                          <Grid item xs={12} key={label}>
                            <Typography component="span" sx={labelSx}>
                              {label}
                            </Typography>
                            <TextField
                              variant="filled"
                              fullWidth
                              value={value || "—"}
                              InputProps={{
                                readOnly: true,
                                disableUnderline: true,
                              }}
                              sx={jiraFilledField}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${J.border}`,
            bgcolor: J.bgSurface,
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              height: 32,
              borderRadius: J.radius,
              color: J.textSecondary,
              fontSize: "0.8125rem",
              textTransform: "none",
              border: `1px solid ${J.border}`,
              "&:hover": { bgcolor: J.bgHover },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add upsale dialog ── */}
      <Dialog
        open={upsaleDialogOpen}
        onClose={() => {
          setUpsaleDialogOpen(false);
          setUpsaleData({
            serviceType: "",
            amount: "",
            details: "",
            comments: "",
          });
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: J.radius } }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${J.border}`,
            py: 2,
            px: 3,
            fontSize: "1rem",
            fontWeight: 600,
            color: J.textPrimary,
          }}
        >
          Add Upsale Package
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {[
              { label: "Service Type", name: "serviceType" },
              { label: "Amount", name: "amount" },
            ].map((f) => (
              <Grid item xs={12} sm={6} key={f.name}>
                <Typography component="span" sx={labelSx}>
                  {f.label}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={upsaleData[f.name]}
                  onChange={(e) =>
                    setUpsaleData((p) => ({
                      ...p,
                      [f.name]: e.target.value,
                    }))
                  }
                  sx={jiraField}
                />
              </Grid>
            ))}
            {[
              { label: "Details", name: "details" },
              { label: "Comments", name: "comments" },
            ].map((f) => (
              <Grid item xs={12} key={f.name}>
                <Typography component="span" sx={labelSx}>
                  {f.label}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  value={upsaleData[f.name]}
                  onChange={(e) =>
                    setUpsaleData((p) => ({
                      ...p,
                      [f.name]: e.target.value,
                    }))
                  }
                  sx={jiraField}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${J.border}` }}
        >
          <Button
            onClick={() => {
              setUpsaleDialogOpen(false);
              setUpsaleData({
                serviceType: "",
                amount: "",
                details: "",
                comments: "",
              });
            }}
            sx={{
              height: 32,
              borderRadius: J.radius,
              color: J.textSecondary,
              fontSize: "0.8125rem",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpsaleSubmit}
            variant="contained"
            disableElevation
            sx={{
              height: 32,
              borderRadius: J.radius,
              bgcolor: J.blue,
              fontSize: "0.8125rem",
              textTransform: "none",
              "&:hover": { bgcolor: J.blueDark },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit project dialog ── */}
      <Dialog
        open={editProjectDialogOpen}
        onClose={handleEditProjectDialogClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: J.radius } }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${J.border}`,
            py: 2,
            px: 3,
            fontSize: "1rem",
            fontWeight: 600,
            color: J.textPrimary,
          }}
        >
          Edit Project
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {[
              { label: "Project Name", key: "projectName" },
              { label: "Client Name", key: "clientName" },
              { label: "Client Email", key: "clientEmail" },
              { label: "Client Number", key: "clientNumber" },
              { label: "Amount", key: "amount" },
              { label: "Reference Site", key: "referenceSite" },
              { label: "Business Niche", key: "businessNiche" },
            ].map((f) => (
              <Grid item xs={12} sm={6} key={f.key}>
                <Typography component="span" sx={labelSx}>
                  {f.label}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editProjectData[f.key] || ""}
                  onChange={(e) =>
                    setEditProjectData((p) => ({
                      ...p,
                      [f.key]: e.target.value,
                    }))
                  }
                  sx={jiraField}
                />
              </Grid>
            ))}

            {/* Multi-select developers */}
            <Grid item xs={12} sm={6}>
              <Typography component="span" sx={labelSx}>
                Assigned Developer(s)
              </Typography>
              <FormControl fullWidth size="small" sx={jiraField}>
                <Select
                  multiple
                  value={normalizeDevelopers(
                    editProjectData.assignedDeveloper
                  ).map((d) => d.id)}
                  onChange={(e) => {
                    const ids = e.target.value;
                    const selected = ids
                      .map((id) => {
                        const dev = developers.find((x) => x._id === id);
                        return dev
                          ? { id: dev._id, username: dev.username }
                          : null;
                      })
                      .filter(Boolean);
                    setEditProjectData((p) => ({
                      ...p,
                      assignedDeveloper: selected,
                    }));
                  }}
                  renderValue={(ids) =>
                    ids
                      .map(
                        (id) =>
                          developers.find((x) => x._id === id)?.username || id
                      )
                      .join(", ")
                  }
                  sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
                >
                  {developers.map((d) => (
                    <MenuItem
                      key={d._id}
                      value={d._id}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {d.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Service type */}
            <Grid item xs={12} sm={6}>
              <Typography component="span" sx={labelSx}>
                Service Type
              </Typography>
              <FormControl fullWidth size="small" sx={jiraField}>
                <Select
                  multiple
                  value={editProjectData.serviceType || []}
                  onChange={(e) =>
                    setEditProjectData((p) => ({
                      ...p,
                      serviceType: e.target.value,
                    }))
                  }
                  renderValue={(s) => s.join(", ")}
                  sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
                >
                  {serviceTypes.map((t) => (
                    <MenuItem key={t} value={t} sx={{ fontSize: "0.875rem" }}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Subscription type */}
            <Grid item xs={12} sm={6}>
              <Typography component="span" sx={labelSx}>
                Subscription Type
              </Typography>
              <FormControl fullWidth size="small" sx={jiraField}>
                <Select
                  value={editProjectData.subscriptionType || ""}
                  onChange={(e) =>
                    setEditProjectData((p) => ({
                      ...p,
                      subscriptionType: e.target.value,
                    }))
                  }
                  sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
                >
                  <MenuItem
                    value="Subscription-Based"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    Subscription-Based
                  </MenuItem>
                  <MenuItem value="One-Time" sx={{ fontSize: "0.875rem" }}>
                    One-Time
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography component="span" sx={labelSx}>
                Details
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={4}
                value={editProjectData.projectDetails || ""}
                onChange={(e) =>
                  setEditProjectData((p) => ({
                    ...p,
                    projectDetails: e.target.value,
                  }))
                }
                sx={jiraField}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography component="span" sx={labelSx}>
                Comments
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                value={editProjectData.comments || ""}
                onChange={(e) =>
                  setEditProjectData((p) => ({
                    ...p,
                    comments: e.target.value,
                  }))
                }
                sx={jiraField}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${J.border}` }}
        >
          <Button
            onClick={handleEditProjectDialogClose}
            sx={{
              height: 32,
              borderRadius: J.radius,
              color: J.textSecondary,
              fontSize: "0.8125rem",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditProjectSubmit}
            variant="contained"
            disableElevation
            sx={{
              height: 32,
              borderRadius: J.radius,
              bgcolor: J.blue,
              fontSize: "0.8125rem",
              textTransform: "none",
              "&:hover": { bgcolor: J.blueDark },
            }}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit upsale dialog ── */}
      <Dialog
        open={editUpsaleDialogOpen}
        onClose={() => {
          setEditUpsaleDialogOpen(false);
          setUpsaleData({
            serviceType: "",
            amount: "",
            details: "",
            comments: "",
          });
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: J.radius } }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${J.border}`,
            py: 2,
            px: 3,
            fontSize: "1rem",
            fontWeight: 600,
            color: J.textPrimary,
          }}
        >
          Edit Upsale
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {[
              { label: "Service Type", name: "serviceType" },
              { label: "Amount", name: "amount" },
            ].map((f) => (
              <Grid item xs={12} sm={6} key={f.name}>
                <Typography component="span" sx={labelSx}>
                  {f.label}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={upsaleData[f.name]}
                  onChange={(e) =>
                    setUpsaleData((p) => ({
                      ...p,
                      [f.name]: e.target.value,
                    }))
                  }
                  sx={jiraField}
                />
              </Grid>
            ))}
            {[
              { label: "Details", name: "details" },
              { label: "Comments", name: "comments" },
            ].map((f) => (
              <Grid item xs={12} key={f.name}>
                <Typography component="span" sx={labelSx}>
                  {f.label}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  value={upsaleData[f.name]}
                  onChange={(e) =>
                    setUpsaleData((p) => ({
                      ...p,
                      [f.name]: e.target.value,
                    }))
                  }
                  sx={jiraField}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${J.border}` }}
        >
          <Button
            onClick={() => setEditUpsaleDialogOpen(false)}
            sx={{
              height: 32,
              borderRadius: J.radius,
              color: J.textSecondary,
              fontSize: "0.8125rem",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditUpsaleSubmit}
            variant="contained"
            disableElevation
            sx={{
              height: 32,
              borderRadius: J.radius,
              bgcolor: J.blue,
              fontSize: "0.8125rem",
              textTransform: "none",
              "&:hover": { bgcolor: J.blueDark },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Updates chat dialog ── */}
      <Dialog
        open={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setUpdates([]);
          setMessage("");
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            height: "75vh",
            maxHeight: 700,
            display: "flex",
            flexDirection: "column",
            borderRadius: isMobile ? 0 : J.radius,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${J.border}`,
            py: 1.5,
            px: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9375rem",
                color: J.textPrimary,
              }}
            >
              Activity
            </Typography>
            {selectedProject && (
              <Typography sx={{ fontSize: "0.75rem", color: J.textSecondary }}>
                {selectedProject.projectName}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setIsChatOpen(false);
              setUpdates([]);
              setMessage("");
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ flex: 1, overflow: "auto", p: 0, bgcolor: J.bgPage }}
        >
          {isLoadingUpdates ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress size={28} sx={{ color: J.blue }} />
            </Box>
          ) : updates.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              height="100%"
              gap={1}
            >
              <MessageSquare size={32} color={J.textDisabled} />
              <Typography sx={{ color: J.textSecondary, fontSize: "0.875rem" }}>
                No activity yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {updates.map((update) => (
                <Box
                  key={update._id}
                  sx={{ display: "flex", gap: 1.5, mb: 2.5 }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: "0.7rem",
                      bgcolor: stringToColor(update.createdBy.username),
                      fontWeight: 700,
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    {update.createdBy.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          color: J.textPrimary,
                        }}
                      >
                        {update.createdBy.username}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: J.textSecondary }}
                      >
                        {format(
                          new Date(update.createdAt),
                          "MMM d, yyyy · h:mm a"
                        )}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: J.bgSurface,
                        border: `1px solid ${J.border}`,
                        borderRadius: J.radius,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          color: J.textPrimary,
                          lineHeight: 1.5,
                        }}
                      >
                        {update.text}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </DialogContent>

        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${J.border}`,
            bgcolor: J.bgSurface,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Add a comment..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSendUpdate()
            }
            sx={{
              ...jiraField,
              "& .MuiOutlinedInput-root": {
                ...jiraField["& .MuiOutlinedInput-root"],
                bgcolor: J.bgPage,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleSendUpdate}
                    disabled={!message.trim()}
                    sx={{
                      color: message.trim() ? J.blue : J.textDisabled,
                      p: "4px",
                    }}
                  >
                    <Send size={16} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Dialog>

      {/* ── Delete confirm ── */}
      <MUIDialog
        open={deleteConfirmationOpen}
        onClose={cancelDelete}
        PaperProps={{ sx: { borderRadius: J.radius, minWidth: 360 } }}
      >
        <MUIDialogTitle
          sx={{
            borderBottom: `1px solid ${J.border}`,
            py: 2,
            px: 3,
            fontSize: "1rem",
            fontWeight: 600,
            color: J.textPrimary,
          }}
        >
          Delete project?
        </MUIDialogTitle>
        <MUIDialogContent sx={{ p: 3 }}>
          <MUIDialogContentText
            sx={{ fontSize: "0.875rem", color: J.textPrimary }}
          >
            This action is permanent and cannot be undone. Are you sure you want
            to delete this project?
          </MUIDialogContentText>
        </MUIDialogContent>
        <MUIDialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${J.border}` }}
        >
          <Button
            onClick={cancelDelete}
            sx={{
              height: 32,
              borderRadius: J.radius,
              color: J.textSecondary,
              fontSize: "0.8125rem",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            disableElevation
            sx={{
              height: 32,
              borderRadius: J.radius,
              bgcolor: "#DE350B",
              fontSize: "0.8125rem",
              textTransform: "none",
              "&:hover": { bgcolor: "#BF2600" },
            }}
          >
            Delete
          </Button>
        </MUIDialogActions>
      </MUIDialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={(_, r) => r !== "clickaway" && setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
          variant="filled"
          sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectList;