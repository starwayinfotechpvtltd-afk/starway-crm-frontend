// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   Button,
//   Avatar,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   FormControl,
//   Select,
//   MenuItem,
//   Chip,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   Badge,
//   Divider,
// } from "@mui/material";
// import {
//   Close as CloseIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   CheckCircle as CheckCircleIcon,
//   Link as LinkIcon,
//   CalendarToday as CalendarIcon,
//   Flag as FlagIcon,
//   DragIndicator as DragIcon,
//   History as HistoryIcon,
// } from "@mui/icons-material";
// import axios from "axios";
// import { format, isAfter, isBefore, addDays } from "date-fns";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// // ── Design tokens (matches your existing J palette) ───────────────────────────
// const J = {
//   blue: "#0052CC",
//   blueDark: "#0747A6",
//   blueLight: "#DEEBFF",
//   green: "#006644",
//   greenBg: "#E3FCEF",
//   red: "#BF2600",
//   redBg: "#FFEBE6",
//   orange: "#974F0C",
//   orangeBg: "#FFF0B3",
//   purple: "#5243AA",
//   purpleBg: "#EAE6FF",
//   border: "#DFE1E6",
//   borderFocus: "#4C9AFF",
//   bgPage: "#F4F5F7",
//   bgSurface: "#FFFFFF",
//   bgHover: "#EBECF0",
//   bgSubtle: "#F4F5F7",
//   textPrimary: "#172B4D",
//   textSecondary: "#5E6C84",
//   textDisabled: "#A5ADBA",
//   fontFamily:
//     "'Atlassian Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//   radius: "3px",
//   shadowCard: "0 1px 3px rgba(9, 30, 66, 0.13)",
//   shadowCardHover: "0 4px 12px rgba(9, 30, 66, 0.2)",
// };

// const PRIORITY_CONFIG = {
//   Low: { color: J.green, bg: J.greenBg, icon: "↓" },
//   Medium: { color: "#0052CC", bg: "#DEEBFF", icon: "→" },
//   High: { color: J.orange, bg: J.orangeBg, icon: "↑" },
//   Critical: { color: J.red, bg: J.redBg, icon: "⚑" },
// };

// const COLUMNS = [
//   { id: "Todo", label: "To Do", color: J.textSecondary },
//   { id: "In Progress", label: "In Progress", color: J.blue },
//   { id: "Done", label: "Done", color: J.green },
// ];

// const AVATAR_PALETTE = ["#0052CC","#00875A","#FF5630","#FF991F","#6554C0","#00B8D9"];
// const stringToColor = (s) => {
//   if (!s) return AVATAR_PALETTE[0];
//   let h = 0;
//   for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
//   return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
// };

// const authHeaders = () => ({
//   Authorization: `Bearer ${localStorage.getItem("token")}`,
// });

// // ── Priority badge ─────────────────────────────────────────────────────────────
// const PriorityBadge = ({ priority }) => {
//   const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
//   return (
//     <Box
//       sx={{
//         display: "inline-flex",
//         alignItems: "center",
//         gap: "3px",
//         px: 0.75,
//         py: 0.25,
//         borderRadius: J.radius,
//         bgcolor: cfg.bg,
//         color: cfg.color,
//         fontSize: "0.68rem",
//         fontWeight: 700,
//         letterSpacing: "0.03em",
//         userSelect: "none",
//       }}
//     >
//       <span style={{ fontSize: "0.75rem" }}>{cfg.icon}</span>
//       {priority}
//     </Box>
//   );
// };

// // ── Deadline display ──────────────────────────────────────────────────────────
// const DeadlineChip = ({ deadline }) => {
//   if (!deadline) return null;
//   const d = new Date(deadline);
//   const now = new Date();
//   const isOverdue = isBefore(d, now);
//   const isSoon = !isOverdue && isBefore(d, addDays(now, 3));

//   return (
//     <Box
//       sx={{
//         display: "inline-flex",
//         alignItems: "center",
//         gap: "3px",
//         px: 0.75,
//         py: 0.25,
//         borderRadius: J.radius,
//         bgcolor: isOverdue ? J.redBg : isSoon ? J.orangeBg : J.bgSubtle,
//         color: isOverdue ? J.red : isSoon ? J.orange : J.textSecondary,
//         fontSize: "0.68rem",
//         fontWeight: 600,
//       }}
//     >
//       <CalendarIcon sx={{ fontSize: 10 }} />
//       {format(d, "MMM d")}
//     </Box>
//   );
// };

// // ── Task card ─────────────────────────────────────────────────────────────────
// const TaskCard = ({
//   task,
//   currentUserId,
//   isCreator,
//   isAdmin,
//   onEdit,
//   onDelete,
//   onComplete,
//   onDragStart,
//   onDragEnd,
// }) => {
//   const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
//   const isDone = task.status === "Done";
//   const canComplete = (isAssigned || isAdmin) && !isDone;
//   const canEdit = isCreator || isAdmin;
//   const canDelete = isCreator || isAdmin;

//   return (
//     <Box
//       draggable={canEdit}
//       onDragStart={(e) => onDragStart(e, task)}
//       onDragEnd={onDragEnd}
//       sx={{
//         bgcolor: J.bgSurface,
//         border: `1px solid ${J.border}`,
//         borderRadius: J.radius,
//         p: "10px 12px",
//         mb: 1,
//         boxShadow: J.shadowCard,
//         cursor: canEdit ? "grab" : "default",
//         opacity: isDone ? 0.75 : 1,
//         transition: "box-shadow 0.15s, transform 0.1s",
//         "&:hover": {
//           boxShadow: J.shadowCardHover,
//           transform: "translateY(-1px)",
//         },
//         "&:active": { cursor: "grabbing" },
//         position: "relative",
//       }}
//     >
//       {/* Priority + deadline row */}
//       <Box sx={{ display: "flex", gap: 0.5, mb: 0.75, flexWrap: "wrap" }}>
//         <PriorityBadge priority={task.priority} />
//         <DeadlineChip deadline={task.deadline} />
//       </Box>

//       {/* Title */}
//       <Typography
//         sx={{
//           fontSize: "0.8125rem",
//           fontWeight: 600,
//           color: isDone ? J.textSecondary : J.textPrimary,
//           lineHeight: 1.4,
//           mb: 0.5,
//           textDecoration: isDone ? "line-through" : "none",
//         }}
//       >
//         {task.title}
//       </Typography>

//       {/* Description snippet */}
//       {task.description && (
//         <Typography
//           sx={{
//             fontSize: "0.75rem",
//             color: J.textSecondary,
//             lineHeight: 1.4,
//             mb: 0.75,
//             overflow: "hidden",
//             display: "-webkit-box",
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: "vertical",
//           }}
//         >
//           {task.description}
//         </Typography>
//       )}

//       {/* Links */}
//       {task.links?.length > 0 && (
//         <Box sx={{ display: "flex", gap: 0.5, mb: 0.75, flexWrap: "wrap" }}>
//           {task.links.map((link, i) => (
//             <Box
//               key={i}
//               component="a"
//               href={link}
//               target="_blank"
//               rel="noopener noreferrer"
//               sx={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "3px",
//                 color: J.blue,
//                 fontSize: "0.7rem",
//                 textDecoration: "none",
//                 "&:hover": { textDecoration: "underline" },
//               }}
//             >
//               <LinkIcon sx={{ fontSize: 10 }} />
//               Link {i + 1}
//             </Box>
//           ))}
//         </Box>
//       )}

//       {/* Footer: assignee + actions */}
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           mt: 0.5,
//         }}
//       >
//         <Tooltip title={`Assigned to: ${task.assignedTo?.username}`} arrow>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//             <Avatar
//               sx={{
//                 width: 20,
//                 height: 20,
//                 fontSize: "0.6rem",
//                 fontWeight: 700,
//                 bgcolor: stringToColor(task.assignedTo?.username),
//               }}
//             >
//               {task.assignedTo?.username?.charAt(0).toUpperCase()}
//             </Avatar>
//             <Typography sx={{ fontSize: "0.72rem", color: J.textSecondary }}>
//               {task.assignedTo?.username}
//             </Typography>
//           </Box>
//         </Tooltip>

//         <Box sx={{ display: "flex", gap: 0.25 }}>
//           {canComplete && (
//             <Tooltip title="Mark complete" arrow>
//               <IconButton
//                 size="small"
//                 onClick={() => onComplete(task)}
//                 sx={{
//                   p: "3px",
//                   color: J.textDisabled,
//                   "&:hover": { color: J.green, bgcolor: J.greenBg },
//                 }}
//               >
//                 <CheckCircleIcon sx={{ fontSize: 14 }} />
//               </IconButton>
//             </Tooltip>
//           )}
//           {canEdit && (
//             <Tooltip title="Edit" arrow>
//               <IconButton
//                 size="small"
//                 onClick={() => onEdit(task)}
//                 sx={{
//                   p: "3px",
//                   color: J.textDisabled,
//                   "&:hover": { color: J.blue, bgcolor: J.blueLight },
//                 }}
//               >
//                 <EditIcon sx={{ fontSize: 13 }} />
//               </IconButton>
//             </Tooltip>
//           )}
//           {canDelete && (
//             <Tooltip title="Delete" arrow>
//               <IconButton
//                 size="small"
//                 onClick={() => onDelete(task._id)}
//                 sx={{
//                   p: "3px",
//                   color: J.textDisabled,
//                   "&:hover": { color: J.red, bgcolor: J.redBg },
//                 }}
//               >
//                 <DeleteIcon sx={{ fontSize: 13 }} />
//               </IconButton>
//             </Tooltip>
//           )}
//         </Box>
//       </Box>

//       {/* Completed banner */}
//       {isDone && task.completedAt && (
//         <Box
//           sx={{
//             mt: 0.75,
//             pt: 0.75,
//             borderTop: `1px solid ${J.border}`,
//             display: "flex",
//             alignItems: "center",
//             gap: 0.5,
//           }}
//         >
//           <CheckCircleIcon sx={{ fontSize: 11, color: J.green }} />
//           <Typography sx={{ fontSize: "0.68rem", color: J.green }}>
//             Completed by {task.completedBy?.username} ·{" "}
//             {format(new Date(task.completedAt), "MMM d, yyyy")}
//           </Typography>
//         </Box>
//       )}
//     </Box>
//   );
// };

// // ── Column ────────────────────────────────────────────────────────────────────
// const KanbanColumn = ({
//   column,
//   tasks,
//   currentUserId,
//   isCreator,
//   isAdmin,
//   onAddTask,
//   onEdit,
//   onDelete,
//   onComplete,
//   onDragStart,
//   onDragEnd,
//   onDrop,
//   onDragOver,
// }) => {
//   const [isOver, setIsOver] = useState(false);

//   return (
//     <Box
//       onDragOver={(e) => {
//         e.preventDefault();
//         setIsOver(true);
//         onDragOver(e);
//       }}
//       onDragLeave={() => setIsOver(false)}
//       onDrop={(e) => {
//         setIsOver(false);
//         onDrop(e, column.id);
//       }}
//       sx={{
//         flex: "1 1 0",
//         minWidth: 240,
//         maxWidth: 340,
//         bgcolor: isOver ? "#EBF2FF" : J.bgPage,
//         border: `2px dashed ${isOver ? J.blue : "transparent"}`,
//         borderRadius: "4px",
//         transition: "background 0.15s, border-color 0.15s",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       {/* Column header */}
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           px: 1.5,
//           py: 1.25,
//           borderBottom: `2px solid ${column.color}20`,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <Box
//             sx={{
//               width: 8,
//               height: 8,
//               borderRadius: "50%",
//               bgcolor: column.color,
//               flexShrink: 0,
//             }}
//           />
//           <Typography
//             sx={{
//               fontSize: "0.75rem",
//               fontWeight: 700,
//               color: column.color,
//               textTransform: "uppercase",
//               letterSpacing: "0.06em",
//             }}
//           >
//             {column.label}
//           </Typography>
//           <Box
//             sx={{
//               bgcolor: `${column.color}20`,
//               color: column.color,
//               borderRadius: "10px",
//               px: 0.75,
//               fontSize: "0.68rem",
//               fontWeight: 700,
//               lineHeight: 1.6,
//               minWidth: 18,
//               textAlign: "center",
//             }}
//           >
//             {tasks.length}
//           </Box>
//         </Box>
//         {(isCreator || isAdmin) && column.id === "Todo" && (
//           <Tooltip title="Add task" arrow>
//             <IconButton
//               size="small"
//               onClick={onAddTask}
//               sx={{
//                 p: "3px",
//                 color: J.textSecondary,
//                 "&:hover": { color: J.blue, bgcolor: J.blueLight },
//               }}
//             >
//               <AddIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//           </Tooltip>
//         )}
//       </Box>

//       {/* Cards */}
//       <Box
//         sx={{
//           flex: 1,
//           overflowY: "auto",
//           p: 1.25,
//           minHeight: 80,
//         }}
//       >
//         {tasks.length === 0 && (
//           <Box
//             sx={{
//               textAlign: "center",
//               py: 3,
//               color: J.textDisabled,
//               fontSize: "0.75rem",
//             }}
//           >
//             No tasks
//           </Box>
//         )}
//         {tasks.map((task) => (
//           <TaskCard
//             key={task._id}
//             task={task}
//             currentUserId={currentUserId}
//             isCreator={isCreator}
//             isAdmin={isAdmin}
//             onEdit={onEdit}
//             onDelete={onDelete}
//             onComplete={onComplete}
//             onDragStart={onDragStart}
//             onDragEnd={onDragEnd}
//           />
//         ))}
//       </Box>
//     </Box>
//   );
// };

// // ── Task form dialog ──────────────────────────────────────────────────────────
// const TaskFormDialog = ({
//   open,
//   onClose,
//   onSubmit,
//   initialData,
//   projectDevelopers,
//   isCreator,
//   isAdmin,
//   currentUserId,
//   currentUsername,
// }) => {
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     links: [],
//     priority: "Medium",
//     deadline: "",
//     assignedTo: { id: currentUserId, username: currentUsername },
//   });
//   const [linkInput, setLinkInput] = useState("");

//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         title: initialData.title || "",
//         description: initialData.description || "",
//         links: initialData.links || [],
//         priority: initialData.priority || "Medium",
//         deadline: initialData.deadline
//           ? format(new Date(initialData.deadline), "yyyy-MM-dd")
//           : "",
//         assignedTo: initialData.assignedTo || {
//           id: currentUserId,
//           username: currentUsername,
//         },
//       });
//     } else {
//       setForm({
//         title: "",
//         description: "",
//         links: [],
//         priority: "Medium",
//         deadline: "",
//         assignedTo: { id: currentUserId, username: currentUsername },
//       });
//     }
//     setLinkInput("");
//   }, [open, initialData, currentUserId, currentUsername]);

//   const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

//   const addLink = () => {
//     if (linkInput.trim()) {
//       set("links", [...form.links, linkInput.trim()]);
//       setLinkInput("");
//     }
//   };

//   const removeLink = (i) =>
//     set("links", form.links.filter((_, idx) => idx !== i));

//   const handleSubmit = () => {
//     if (!form.title.trim()) return;
//     onSubmit({
//       ...form,
//       deadline: form.deadline || null,
//     });
//   };

//   const canAssignToOthers = isCreator || isAdmin;

//   const labelSx = {
//     fontSize: "0.75rem",
//     fontWeight: 600,
//     color: J.textSecondary,
//     mb: 0.5,
//     display: "block",
//     textTransform: "uppercase",
//     letterSpacing: "0.04em",
//   };

//   const fieldSx = {
//     "& .MuiOutlinedInput-root": {
//       borderRadius: J.radius,
//       fontSize: "0.875rem",
//       "& fieldset": { borderColor: J.border },
//       "&:hover fieldset": { borderColor: J.borderFocus },
//       "&.Mui-focused fieldset": { borderColor: J.blue },
//     },
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       fullWidth
//       maxWidth="sm"
//       PaperProps={{ sx: { borderRadius: J.radius } }}
//     >
//       <DialogTitle
//         sx={{
//           borderBottom: `1px solid ${J.border}`,
//           py: 2,
//           px: 3,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: J.textPrimary }}>
//           {initialData ? "Edit Task" : "Create Task"}
//         </Typography>
//         <IconButton size="small" onClick={onClose}>
//           <CloseIcon sx={{ fontSize: 18 }} />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent sx={{ p: 3 }}>
//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           {/* Title */}
//           <Box>
//             <Typography component="span" sx={labelSx}>Title *</Typography>
//             <TextField
//               fullWidth
//               size="small"
//               value={form.title}
//               onChange={(e) => set("title", e.target.value)}
//               placeholder="What needs to be done?"
//               sx={fieldSx}
//             />
//           </Box>

//           {/* Description */}
//           <Box>
//             <Typography component="span" sx={labelSx}>Description</Typography>
//             <TextField
//               fullWidth
//               size="small"
//               multiline
//               rows={3}
//               value={form.description}
//               onChange={(e) => set("description", e.target.value)}
//               placeholder="Add details, context, or acceptance criteria..."
//               sx={fieldSx}
//             />
//           </Box>

//           {/* Priority + Deadline */}
//           <Box sx={{ display: "flex", gap: 2 }}>
//             <Box sx={{ flex: 1 }}>
//               <Typography component="span" sx={labelSx}>Priority</Typography>
//               <FormControl fullWidth size="small" sx={fieldSx}>
//                 <Select
//                   value={form.priority}
//                   onChange={(e) => set("priority", e.target.value)}
//                   sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
//                 >
//                   {["Low", "Medium", "High", "Critical"].map((p) => (
//                     <MenuItem key={p} value={p} sx={{ fontSize: "0.875rem" }}>
//                       <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                         <span>{PRIORITY_CONFIG[p].icon}</span>
//                         {p}
//                       </Box>
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>
//             <Box sx={{ flex: 1 }}>
//               <Typography component="span" sx={labelSx}>Deadline</Typography>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type="date"
//                 value={form.deadline}
//                 onChange={(e) => set("deadline", e.target.value)}
//                 sx={fieldSx}
//                 InputLabelProps={{ shrink: true }}
//               />
//             </Box>
//           </Box>

//           {/* Assign to */}
//           <Box>
//             <Typography component="span" sx={labelSx}>Assign To</Typography>
//             <FormControl fullWidth size="small" sx={fieldSx}>
//               <Select
//                 value={form.assignedTo?.id || ""}
//                 onChange={(e) => {
//                   const dev = projectDevelopers.find(
//                     (d) => d.id === e.target.value
//                   );
//                   if (dev) set("assignedTo", dev);
//                 }}
//                 disabled={!canAssignToOthers && projectDevelopers.length <= 1}
//                 sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
//               >
//                 {projectDevelopers.map((dev) => (
//                   <MenuItem
//                     key={dev.id}
//                     value={dev.id}
//                     sx={{ fontSize: "0.875rem" }}
//                   >
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                       <Avatar
//                         sx={{
//                           width: 20,
//                           height: 20,
//                           fontSize: "0.6rem",
//                           bgcolor: stringToColor(dev.username),
//                         }}
//                       >
//                         {dev.username.charAt(0).toUpperCase()}
//                       </Avatar>
//                       {dev.username}
//                       {dev.id === currentUserId && (
//                         <Typography
//                           sx={{ fontSize: "0.72rem", color: J.textSecondary }}
//                         >
//                           (you)
//                         </Typography>
//                       )}
//                     </Box>
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>

//           {/* Links */}
//           <Box>
//             <Typography component="span" sx={labelSx}>Links / References</Typography>
//             <Box sx={{ display: "flex", gap: 1, mb: 0.75 }}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 value={linkInput}
//                 onChange={(e) => setLinkInput(e.target.value)}
//                 onKeyPress={(e) => e.key === "Enter" && addLink()}
//                 placeholder="https://..."
//                 sx={fieldSx}
//               />
//               <Button
//                 variant="outlined"
//                 size="small"
//                 onClick={addLink}
//                 sx={{
//                   height: 32,
//                   borderRadius: J.radius,
//                   color: J.blue,
//                   borderColor: J.border,
//                   textTransform: "none",
//                   fontSize: "0.8125rem",
//                   whiteSpace: "nowrap",
//                   "&:hover": { borderColor: J.blue, bgcolor: J.blueLight },
//                 }}
//               >
//                 Add
//               </Button>
//             </Box>
//             {form.links.map((link, i) => (
//               <Box
//                 key={i}
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 0.5,
//                   mb: 0.5,
//                 }}
//               >
//                 <LinkIcon sx={{ fontSize: 13, color: J.blue }} />
//                 <Typography
//                   component="a"
//                   href={link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   sx={{
//                     fontSize: "0.8rem",
//                     color: J.blue,
//                     flex: 1,
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                     whiteSpace: "nowrap",
//                     textDecoration: "none",
//                     "&:hover": { textDecoration: "underline" },
//                   }}
//                 >
//                   {link}
//                 </Typography>
//                 <IconButton
//                   size="small"
//                   onClick={() => removeLink(i)}
//                   sx={{ p: "2px", color: J.textDisabled }}
//                 >
//                   <CloseIcon sx={{ fontSize: 12 }} />
//                 </IconButton>
//               </Box>
//             ))}
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${J.border}` }}>
//         <Button
//           onClick={onClose}
//           sx={{
//             height: 32,
//             borderRadius: J.radius,
//             color: J.textSecondary,
//             fontSize: "0.8125rem",
//             textTransform: "none",
//           }}
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           variant="contained"
//           disableElevation
//           disabled={!form.title.trim()}
//           sx={{
//             height: 32,
//             borderRadius: J.radius,
//             bgcolor: J.blue,
//             fontSize: "0.8125rem",
//             textTransform: "none",
//             "&:hover": { bgcolor: J.blueDark },
//           }}
//         >
//           {initialData ? "Save changes" : "Create task"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// // ── Completion history dialog ─────────────────────────────────────────────────
// const CompletionHistoryDialog = ({ open, onClose, projectId }) => {
//   const [completions, setCompletions] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!open || !projectId) return;
//     setLoading(true);
//     axios
//       .get(`${API_BASE}/api/tasks/${projectId}/completions`, {
//         headers: authHeaders(),
//       })
//       .then((r) => setCompletions(r.data || []))
//       .catch(() => setCompletions([]))
//       .finally(() => setLoading(false));
//   }, [open, projectId]);

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       fullWidth
//       maxWidth="sm"
//       PaperProps={{ sx: { borderRadius: J.radius, maxHeight: "70vh" } }}
//     >
//       <DialogTitle
//         sx={{
//           borderBottom: `1px solid ${J.border}`,
//           py: 2,
//           px: 3,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <HistoryIcon sx={{ fontSize: 18, color: J.textSecondary }} />
//           <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: J.textPrimary }}>
//             Completion History
//           </Typography>
//         </Box>
//         <IconButton size="small" onClick={onClose}>
//           <CloseIcon sx={{ fontSize: 18 }} />
//         </IconButton>
//       </DialogTitle>
//       <DialogContent sx={{ p: 0 }}>
//         {loading ? (
//           <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//             <CircularProgress size={24} sx={{ color: J.blue }} />
//           </Box>
//         ) : completions.length === 0 ? (
//           <Box sx={{ py: 4, textAlign: "center" }}>
//             <Typography sx={{ color: J.textSecondary, fontSize: "0.875rem" }}>
//               No completed tasks yet
//             </Typography>
//           </Box>
//         ) : (
//           completions.map((c, i) => (
//             <Box
//               key={c._id || i}
//               sx={{
//                 px: 3,
//                 py: 1.5,
//                 borderBottom: i < completions.length - 1 ? `1px solid ${J.border}` : "none",
//                 "&:hover": { bgcolor: J.bgPage },
//               }}
//             >
//               <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
//                 <CheckCircleIcon sx={{ fontSize: 16, color: J.green, mt: 0.25, flexShrink: 0 }} />
//                 <Box sx={{ flex: 1, minWidth: 0 }}>
//                   <Typography
//                     sx={{
//                       fontSize: "0.875rem",
//                       fontWeight: 600,
//                       color: J.textPrimary,
//                       mb: 0.25,
//                     }}
//                   >
//                     {c.taskTitle}
//                   </Typography>
//                   <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//                     <Typography sx={{ fontSize: "0.75rem", color: J.textSecondary }}>
//                       Completed by{" "}
//                       <strong style={{ color: J.textPrimary }}>
//                         {c.completedBy?.username}
//                       </strong>
//                     </Typography>
//                     <Typography sx={{ fontSize: "0.75rem", color: J.textDisabled }}>·</Typography>
//                     <Typography sx={{ fontSize: "0.75rem", color: J.textSecondary }}>
//                       {format(new Date(c.completedAt), "MMM d, yyyy · h:mm a")}
//                     </Typography>
//                   </Box>
//                   <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
//                     {c.priority && <PriorityBadge priority={c.priority} />}
//                     {c.deadline && <DeadlineChip deadline={c.deadline} />}
//                   </Box>
//                 </Box>
//               </Box>
//             </Box>
//           ))
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// // ── Main Kanban component ─────────────────────────────────────────────────────
// const ProjectKanban = ({ open, onClose, project }) => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [taskFormOpen, setTaskFormOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);
//   const [historyOpen, setHistoryOpen] = useState(false);
//   const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
//   const dragTask = useRef(null);

//   const currentUserId = localStorage.getItem("userId");
//   const currentUsername = localStorage.getItem("username") || "You";
//   const currentUserRole = localStorage.getItem("role") || "developer"; // "admin" | "developer"
//   const isAdmin = currentUserRole === "admin";

//   // Check if current user is the project creator
//   // The project.createdBy is a username string in your schema
//   const isCreator =
//     isAdmin || project?.createdBy === currentUsername;

//   // Build developer list for assignment dropdown
//   // Include the creator if they're also a developer, plus all assigned devs
//   const projectDevelopers = React.useMemo(() => {
//     if (!project) return [];
//     const devs = (project.assignedDeveloper || []).map((d) => ({
//       id: d.id,
//       username: d.username,
//     }));
//     // If current user is creator but not in dev list, add them for self-assignment
//     const currentInList = devs.some((d) => d.id === currentUserId);
//     if (!currentInList && (isCreator || isAdmin)) {
//       devs.unshift({ id: currentUserId, username: currentUsername });
//     }
//     return devs;
//   }, [project, currentUserId, currentUsername, isCreator, isAdmin]);

//   const toast = (msg, severity = "success") =>
//     setSnack({ open: true, msg, severity });

//   const fetchTasks = useCallback(async () => {
//     if (!project?._id) return;
//     setLoading(true);
//     try {
//       const r = await axios.get(`${API_BASE}/api/tasks/${project._id}`, {
//         headers: authHeaders(),
//       });
//       setTasks(r.data || []);
//     } catch {
//       setTasks([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [project?._id]);

//   useEffect(() => {
//     if (open) fetchTasks();
//     else setTasks([]);
//   }, [open, fetchTasks]);

//   const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

//   // ── Create / edit ───────────────────────────────────────────────────────────
//   const handleTaskSubmit = async (formData) => {
//     try {
//       if (editingTask) {
//         await axios.put(
//           `${API_BASE}/api/tasks/${project._id}/${editingTask._id}`,
//           formData,
//           { headers: authHeaders() }
//         );
//         toast("Task updated");
//       } else {
//         await axios.post(`${API_BASE}/api/tasks/${project._id}`, formData, {
//           headers: authHeaders(),
//         });
//         toast("Task created");
//       }
//       setTaskFormOpen(false);
//       setEditingTask(null);
//       fetchTasks();
//     } catch (err) {
//       toast(err.response?.data?.message || "Failed to save task", "error");
//     }
//   };

//   // ── Delete ──────────────────────────────────────────────────────────────────
//   const handleDelete = async (taskId) => {
//     try {
//       await axios.delete(`${API_BASE}/api/tasks/${project._id}/${taskId}`, {
//         headers: authHeaders(),
//       });
//       setTasks((prev) => prev.filter((t) => t._id !== taskId));
//       toast("Task deleted");
//     } catch (err) {
//       toast(err.response?.data?.message || "Failed to delete task", "error");
//     }
//   };

//   // ── Complete ────────────────────────────────────────────────────────────────
//   const handleComplete = async (task) => {
//     try {
//       await axios.post(
//         `${API_BASE}/api/tasks/${project._id}/${task._id}/complete`,
//         {},
//         { headers: authHeaders() }
//       );
//       toast("Task marked complete! 🎉");
//       fetchTasks();
//     } catch (err) {
//       toast(err.response?.data?.message || "Failed to complete task", "error");
//     }
//   };

//   // ── Drag & drop ─────────────────────────────────────────────────────────────
//   const handleDragStart = (e, task) => {
//     dragTask.current = task;
//     e.dataTransfer.effectAllowed = "move";
//   };
//   const handleDragEnd = () => {
//     dragTask.current = null;
//   };
//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = "move";
//   };
//   const handleDrop = async (e, newStatus) => {
//     e.preventDefault();
//     const task = dragTask.current;
//     if (!task || task.status === newStatus) return;

//     // Optimistic update
//     setTasks((prev) =>
//       prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
//     );

//     try {
//       await axios.put(
//         `${API_BASE}/api/tasks/${project._id}/${task._id}`,
//         { status: newStatus },
//         { headers: authHeaders() }
//       );
//       fetchTasks(); // Sync from server for completedAt etc.
//     } catch {
//       fetchTasks(); // Rollback
//       toast("Failed to move task", "error");
//     }
//   };

//   if (!project) return null;

//   return (
//     <>
//       <Dialog
//         open={open}
//         onClose={onClose}
//         fullWidth
//         maxWidth="xl"
//         PaperProps={{
//           sx: {
//             borderRadius: J.radius,
//             height: "85vh",
//             display: "flex",
//             flexDirection: "column",
//           },
//         }}
//       >
//         {/* Header */}
//         <DialogTitle
//           sx={{
//             borderBottom: `1px solid ${J.border}`,
//             py: 1.5,
//             px: 3,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             flexShrink: 0,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//             <Box
//               sx={{
//                 width: 28,
//                 height: 28,
//                 borderRadius: J.radius,
//                 bgcolor: J.blueLight,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: J.blue }}>
//                 K
//               </Typography>
//             </Box>
//             <Box>
//               <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem", color: J.textPrimary }}>
//                 {project.projectName}
//               </Typography>
//               <Typography sx={{ fontSize: "0.72rem", color: J.textSecondary }}>
//                 Kanban Board
//               </Typography>
//             </Box>
//           </Box>

//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Tooltip title="Completion history" arrow>
//               <IconButton
//                 size="small"
//                 onClick={() => setHistoryOpen(true)}
//                 sx={{
//                   color: J.textSecondary,
//                   border: `1px solid ${J.border}`,
//                   borderRadius: J.radius,
//                   p: "5px",
//                   "&:hover": { color: J.blue, bgcolor: J.blueLight },
//                 }}
//               >
//                 <HistoryIcon sx={{ fontSize: 16 }} />
//               </IconButton>
//             </Tooltip>
//             {(isCreator || isAdmin) && (
//               <Button
//                 size="small"
//                 variant="contained"
//                 startIcon={<AddIcon sx={{ fontSize: 15 }} />}
//                 onClick={() => {
//                   setEditingTask(null);
//                   setTaskFormOpen(true);
//                 }}
//                 disableElevation
//                 sx={{
//                   height: 32,
//                   borderRadius: J.radius,
//                   bgcolor: J.blue,
//                   fontSize: "0.8125rem",
//                   textTransform: "none",
//                   "&:hover": { bgcolor: J.blueDark },
//                 }}
//               >
//                 Add Task
//               </Button>
//             )}
//             <IconButton size="small" onClick={onClose}>
//               <CloseIcon sx={{ fontSize: 18 }} />
//             </IconButton>
//           </Box>
//         </DialogTitle>

//         {/* Board */}
//         <DialogContent sx={{ flex: 1, overflow: "hidden", p: 0, bgcolor: J.bgPage }}>
//           {loading ? (
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 height: "100%",
//               }}
//             >
//               <CircularProgress size={28} sx={{ color: J.blue }} />
//             </Box>
//           ) : (
//             <Box
//               sx={{
//                 display: "flex",
//                 gap: 2,
//                 p: 2,
//                 height: "100%",
//                 overflowX: "auto",
//                 overflowY: "hidden",
//               }}
//             >
//               {COLUMNS.map((col) => (
//                 <KanbanColumn
//                   key={col.id}
//                   column={col}
//                   tasks={tasksByStatus(col.id)}
//                   currentUserId={currentUserId}
//                   isCreator={isCreator}
//                   isAdmin={isAdmin}
//                   onAddTask={() => {
//                     setEditingTask(null);
//                     setTaskFormOpen(true);
//                   }}
//                   onEdit={(task) => {
//                     setEditingTask(task);
//                     setTaskFormOpen(true);
//                   }}
//                   onDelete={handleDelete}
//                   onComplete={handleComplete}
//                   onDragStart={handleDragStart}
//                   onDragEnd={handleDragEnd}
//                   onDragOver={handleDragOver}
//                   onDrop={handleDrop}
//                 />
//               ))}
//             </Box>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Task form */}
//       <TaskFormDialog
//         open={taskFormOpen}
//         onClose={() => {
//           setTaskFormOpen(false);
//           setEditingTask(null);
//         }}
//         onSubmit={handleTaskSubmit}
//         initialData={editingTask}
//         projectDevelopers={projectDevelopers}
//         isCreator={isCreator}
//         isAdmin={isAdmin}
//         currentUserId={currentUserId}
//         currentUsername={currentUsername}
//       />

//       {/* Completion history */}
//       <CompletionHistoryDialog
//         open={historyOpen}
//         onClose={() => setHistoryOpen(false)}
//         projectId={project?._id}
//       />

//       {/* Snackbar */}
//       <Snackbar
//         open={snack.open}
//         autoHideDuration={4000}
//         onClose={() => setSnack((p) => ({ ...p, open: false }))}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//       >
//         <Alert
//           severity={snack.severity}
//           onClose={() => setSnack((p) => ({ ...p, open: false }))}
//           variant="filled"
//           sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
//         >
//           {snack.msg}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default ProjectKanban;










import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Link as LinkIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format, isAfter, isBefore, addDays } from "date-fns";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// ── Design tokens (matches your existing J palette) ───────────────────────────
const J = {
  blue: "#0052CC",
  blueDark: "#0747A6",
  blueLight: "#DEEBFF",
  green: "#006644",
  greenBg: "#E3FCEF",
  red: "#BF2600",
  redBg: "#FFEBE6",
  orange: "#974F0C",
  orangeBg: "#FFF0B3",
  purple: "#5243AA",
  purpleBg: "#EAE6FF",
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
  shadowCardHover: "0 4px 12px rgba(9, 30, 66, 0.2)",
};

const PRIORITY_CONFIG = {
  Low: { color: J.green, bg: J.greenBg, icon: "↓" },
  Medium: { color: "#0052CC", bg: "#DEEBFF", icon: "→" },
  High: { color: J.orange, bg: J.orangeBg, icon: "↑" },
  Critical: { color: J.red, bg: J.redBg, icon: "⚑" },
};

const COLUMNS = [
  { id: "Todo", label: "To Do", color: J.textSecondary },
  { id: "In Progress", label: "In Progress", color: J.blue },
  { id: "Done", label: "Done", color: J.green },
];

const AVATAR_PALETTE = ["#0052CC","#00875A","#FF5630","#FF991F","#6554C0","#00B8D9"];
const stringToColor = (s) => {
  if (!s) return AVATAR_PALETTE[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Priority badge ─────────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        px: 0.75,
        py: 0.25,
        borderRadius: J.radius,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.03em",
        userSelect: "none",
      }}
    >
      <span style={{ fontSize: "0.75rem" }}>{cfg.icon}</span>
      {priority}
    </Box>
  );
};

// ── Deadline display ──────────────────────────────────────────────────────────
const DeadlineChip = ({ deadline }) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const isOverdue = isBefore(d, now);
  const isSoon = !isOverdue && isBefore(d, addDays(now, 3));

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        px: 0.75,
        py: 0.25,
        borderRadius: J.radius,
        bgcolor: isOverdue ? J.redBg : isSoon ? J.orangeBg : J.bgSubtle,
        color: isOverdue ? J.red : isSoon ? J.orange : J.textSecondary,
        fontSize: "0.68rem",
        fontWeight: 600,
      }}
    >
      <CalendarIcon sx={{ fontSize: 10 }} />
      {format(d, "MMM d")}
    </Box>
  );
};

// ── Task card ─────────────────────────────────────────────────────────────────
const TaskCard = ({
  task,
  currentUserId,
  currentUserRole,
  isCreator,
  isAdmin,
  onEdit,
  onDelete,
  onComplete,
  onDragStart,
  onDragEnd,
}) => {
  const isAssigned = task.assignedTo?.id?.toString() === currentUserId?.toString();
  const isDone = task.status === "Done";
  
  const canComplete = (isAssigned || isAdmin) && !isDone;
  const canEdit = isCreator || isAdmin;
  const canDelete = isCreator || isAdmin;
  // Developers and Admins can drag tasks
  const canDrag = isCreator || isAdmin || currentUserRole === "developer";

  return (
    <Box
      draggable={canDrag}
      onDragStart={(e) => canDrag && onDragStart(e, task)}
      onDragEnd={canDrag ? onDragEnd : undefined}
      sx={{
        bgcolor: J.bgSurface,
        border: `1px solid ${J.border}`,
        borderRadius: J.radius,
        p: "10px 12px",
        mb: 1,
        boxShadow: J.shadowCard,
        cursor: canDrag ? "grab" : "default",
        opacity: isDone ? 0.75 : 1,
        transition: "box-shadow 0.15s, transform 0.1s",
        "&:hover": {
          boxShadow: J.shadowCardHover,
          transform: "translateY(-1px)",
        },
        "&:active": { cursor: canDrag ? "grabbing" : "default" },
        position: "relative",
      }}
    >
      {/* Priority + deadline row */}
      <Box sx={{ display: "flex", gap: 0.5, mb: 0.75, flexWrap: "wrap" }}>
        <PriorityBadge priority={task.priority} />
        <DeadlineChip deadline={task.deadline} />
      </Box>

      {/* Title */}
      <Typography
        sx={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: isDone ? J.textSecondary : J.textPrimary,
          lineHeight: 1.4,
          mb: 0.5,
          textDecoration: isDone ? "line-through" : "none",
        }}
      >
        {task.title}
      </Typography>

      {/* Description snippet */}
      {task.description && (
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: J.textSecondary,
            lineHeight: 1.4,
            mb: 0.75,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {task.description}
        </Typography>
      )}

      {/* Links */}
      {task.links?.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.5, mb: 0.75, flexWrap: "wrap" }}>
          {task.links.map((link, i) => (
            <Box
              key={i}
              component="a"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                color: J.blue,
                fontSize: "0.7rem",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              <LinkIcon sx={{ fontSize: 10 }} />
              Link {i + 1}
            </Box>
          ))}
        </Box>
      )}

      {/* Footer: assignee + actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 0.5,
        }}
      >
        <Tooltip title={`Assigned to: ${task.assignedTo?.username}`} arrow>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Avatar
              sx={{
                width: 20,
                height: 20,
                fontSize: "0.6rem",
                fontWeight: 700,
                bgcolor: stringToColor(task.assignedTo?.username),
              }}
            >
              {task.assignedTo?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography sx={{ fontSize: "0.72rem", color: J.textSecondary }}>
              {task.assignedTo?.username}
            </Typography>
          </Box>
        </Tooltip>

        <Box sx={{ display: "flex", gap: 0.25 }}>
          {canComplete && (
            <Tooltip title="Mark complete" arrow>
              <IconButton
                size="small"
                onClick={() => onComplete(task)}
                sx={{
                  p: "3px",
                  color: J.textDisabled,
                  "&:hover": { color: J.green, bgcolor: J.greenBg },
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip title="Edit" arrow>
              <IconButton
                size="small"
                onClick={() => onEdit(task)}
                sx={{
                  p: "3px",
                  color: J.textDisabled,
                  "&:hover": { color: J.blue, bgcolor: J.blueLight },
                }}
              >
                <EditIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete" arrow>
              <IconButton
                size="small"
                onClick={() => onDelete(task._id)}
                sx={{
                  p: "3px",
                  color: J.textDisabled,
                  "&:hover": { color: J.red, bgcolor: J.redBg },
                }}
              >
                <DeleteIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Completed banner */}
      {isDone && task.completedAt && (
        <Box
          sx={{
            mt: 0.75,
            pt: 0.75,
            borderTop: `1px solid ${J.border}`,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 11, color: J.green }} />
          <Typography sx={{ fontSize: "0.68rem", color: J.green }}>
            Completed by {task.completedBy?.username} ·{" "}
            {format(new Date(task.completedAt), "MMM d, yyyy")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Column ────────────────────────────────────────────────────────────────────
const KanbanColumn = ({
  column,
  tasks,
  currentUserId,
  currentUserRole,
  isCreator,
  isAdmin,
  onAddTask,
  onEdit,
  onDelete,
  onComplete,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
}) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
        onDragOver(e);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        setIsOver(false);
        onDrop(e, column.id);
      }}
      sx={{
        flex: "1 1 0",
        minWidth: 240,
        maxWidth: 340,
        bgcolor: isOver ? "#EBF2FF" : J.bgPage,
        border: `2px dashed ${isOver ? J.blue : "transparent"}`,
        borderRadius: "4px",
        transition: "background 0.15s, border-color 0.15s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Column header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1.25,
          borderBottom: `2px solid ${column.color}20`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: column.color,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: column.color,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {column.label}
          </Typography>
          <Box
            sx={{
              bgcolor: `${column.color}20`,
              color: column.color,
              borderRadius: "10px",
              px: 0.75,
              fontSize: "0.68rem",
              fontWeight: 700,
              lineHeight: 1.6,
              minWidth: 18,
              textAlign: "center",
            }}
          >
            {tasks.length}
          </Box>
        </Box>
        {(isCreator || isAdmin) && column.id === "Todo" && (
          <Tooltip title="Add task" arrow>
            <IconButton
              size="small"
              onClick={onAddTask}
              sx={{
                p: "3px",
                color: J.textSecondary,
                "&:hover": { color: J.blue, bgcolor: J.blueLight },
              }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Cards */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1.25,
          minHeight: 80,
        }}
      >
        {tasks.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 3,
              color: J.textDisabled,
              fontSize: "0.75rem",
            }}
          >
            No tasks
          </Box>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            isCreator={isCreator}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </Box>
    </Box>
  );
};

// ── Task form dialog ──────────────────────────────────────────────────────────
const TaskFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  projectDevelopers,
  isCreator,
  isAdmin,
  currentUserId,
  currentUsername,
}) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    links: [],
    priority: "Medium",
    deadline: "",
    assignedTo: { id: currentUserId, username: currentUsername },
  });
  const [linkInput, setLinkInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        links: initialData.links || [],
        priority: initialData.priority || "Medium",
        deadline: initialData.deadline
          ? format(new Date(initialData.deadline), "yyyy-MM-dd")
          : "",
        assignedTo: initialData.assignedTo || {
          id: currentUserId,
          username: currentUsername,
        },
      });
    } else {
      setForm({
        title: "",
        description: "",
        links: [],
        priority: "Medium",
        deadline: "",
        assignedTo: { id: currentUserId, username: currentUsername },
      });
    }
    setLinkInput("");
  }, [open, initialData, currentUserId, currentUsername]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addLink = () => {
    if (linkInput.trim()) {
      set("links", [...form.links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const removeLink = (i) =>
    set("links", form.links.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      deadline: form.deadline || null,
    });
  };

  const canAssignToOthers = isCreator || isAdmin;

  const labelSx = {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: J.textSecondary,
    mb: 0.5,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: J.radius,
      fontSize: "0.875rem",
      "& fieldset": { borderColor: J.border },
      "&:hover fieldset": { borderColor: J.borderFocus },
      "&.Mui-focused fieldset": { borderColor: J.blue },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: J.radius } }}
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
        <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: J.textPrimary }}>
          {initialData ? "Edit Task" : "Create Task"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Title */}
          <Box>
            <Typography component="span" sx={labelSx}>Title *</Typography>
            <TextField
              fullWidth
              size="small"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="What needs to be done?"
              sx={fieldSx}
            />
          </Box>

          {/* Description */}
          <Box>
            <Typography component="span" sx={labelSx}>Description</Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Add details, context, or acceptance criteria..."
              sx={fieldSx}
            />
          </Box>

          {/* Priority + Deadline */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography component="span" sx={labelSx}>Priority</Typography>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <Select
                  value={form.priority}
                  onChange={(e) => set("priority", e.target.value)}
                  sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
                >
                  {["Low", "Medium", "High", "Critical"].map((p) => (
                    <MenuItem key={p} value={p} sx={{ fontSize: "0.875rem" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>{PRIORITY_CONFIG[p].icon}</span>
                        {p}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography component="span" sx={labelSx}>Deadline</Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                sx={fieldSx}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>

          {/* Assign to */}
          <Box>
            <Typography component="span" sx={labelSx}>Assign To</Typography>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <Select
                value={form.assignedTo?.id || ""}
                onChange={(e) => {
                  const dev = projectDevelopers.find(
                    (d) => d.id === e.target.value
                  );
                  if (dev) set("assignedTo", dev);
                }}
                disabled={!canAssignToOthers && projectDevelopers.length <= 1}
                sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
              >
                {projectDevelopers.map((dev) => (
                  <MenuItem
                    key={dev.id}
                    value={dev.id}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 20,
                          height: 20,
                          fontSize: "0.6rem",
                          bgcolor: stringToColor(dev.username),
                        }}
                      >
                        {dev.username.charAt(0).toUpperCase()}
                      </Avatar>
                      {dev.username}
                      {dev.id === currentUserId && (
                        <Typography
                          sx={{ fontSize: "0.72rem", color: J.textSecondary }}
                        >
                          (you)
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Links */}
          <Box>
            <Typography component="span" sx={labelSx}>Links / References</Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 0.75 }}>
              <TextField
                fullWidth
                size="small"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLink()}
                placeholder="https://..."
                sx={fieldSx}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={addLink}
                sx={{
                  height: 32,
                  borderRadius: J.radius,
                  color: J.blue,
                  borderColor: J.border,
                  textTransform: "none",
                  fontSize: "0.8125rem",
                  whiteSpace: "nowrap",
                  "&:hover": { borderColor: J.blue, bgcolor: J.blueLight },
                }}
              >
                Add
              </Button>
            </Box>
            {form.links.map((link, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                <LinkIcon sx={{ fontSize: 13, color: J.blue }} />
                <Typography
                  component="a"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontSize: "0.8rem",
                    color: J.blue,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {link}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeLink(i)}
                  sx={{ p: "2px", color: J.textDisabled }}
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${J.border}` }}>
        <Button
          onClick={onClose}
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
          onClick={handleSubmit}
          variant="contained"
          disableElevation
          disabled={!form.title.trim()}
          sx={{
            height: 32,
            borderRadius: J.radius,
            bgcolor: J.blue,
            fontSize: "0.8125rem",
            textTransform: "none",
            "&:hover": { bgcolor: J.blueDark },
          }}
        >
          {initialData ? "Save changes" : "Create task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Completion history dialog ─────────────────────────────────────────────────
const CompletionHistoryDialog = ({ open, onClose, projectId }) => {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !projectId) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/api/tasks/${projectId}/completions`, {
        headers: authHeaders(),
      })
      .then((r) => setCompletions(r.data || []))
      .catch(() => setCompletions([]))
      .finally(() => setLoading(false));
  }, [open, projectId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: J.radius, maxHeight: "70vh" } }}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HistoryIcon sx={{ fontSize: 18, color: J.textSecondary }} />
          <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: J.textPrimary }}>
            Completion History
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} sx={{ color: J.blue }} />
          </Box>
        ) : completions.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography sx={{ color: J.textSecondary, fontSize: "0.875rem" }}>
              No completed tasks yet
            </Typography>
          </Box>
        ) : (
          completions.map((c, i) => (
            <Box
              key={c._id || i}
              sx={{
                px: 3,
                py: 1.5,
                borderBottom: i < completions.length - 1 ? `1px solid ${J.border}` : "none",
                "&:hover": { bgcolor: J.bgPage },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: J.green, mt: 0.25, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: J.textPrimary,
                      mb: 0.25,
                    }}
                  >
                    {c.taskTitle}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: "0.75rem", color: J.textSecondary }}>
                      Completed by{" "}
                      <strong style={{ color: J.textPrimary }}>
                        {c.completedBy?.username}
                      </strong>
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: J.textDisabled }}>·</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: J.textSecondary }}>
                      {format(new Date(c.completedAt), "MMM d, yyyy · h:mm a")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                    {c.priority && <PriorityBadge priority={c.priority} />}
                    {c.deadline && <DeadlineChip deadline={c.deadline} />}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Main Kanban component ─────────────────────────────────────────────────────
const ProjectKanban = ({ open, onClose, project }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const dragTask = useRef(null);

  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username") || "You";
  const currentUserRole = localStorage.getItem("role") || "developer"; // "admin" | "developer"
  const isAdmin = currentUserRole === "admin";

  // Check if current user is the project creator
  // The project.createdBy is a username string in your schema
  const isCreator =
    isAdmin || project?.createdBy === currentUsername;

  // Build developer list for assignment dropdown
  // Include the creator if they're also a developer, plus all assigned devs
  const projectDevelopers = React.useMemo(() => {
    if (!project) return [];
    const devs = (project.assignedDeveloper || []).map((d) => ({
      id: d.id,
      username: d.username,
    }));
    // If current user is creator but not in dev list, add them for self-assignment
    const currentInList = devs.some((d) => d.id === currentUserId);
    if (!currentInList && (isCreator || isAdmin)) {
      devs.unshift({ id: currentUserId, username: currentUsername });
    }
    return devs;
  }, [project, currentUserId, currentUsername, isCreator, isAdmin]);

  const toast = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const fetchTasks = useCallback(async () => {
    if (!project?._id) return;
    setLoading(true);
    try {
      const r = await axios.get(`${API_BASE}/api/tasks/${project._id}`, {
        headers: authHeaders(),
      });
      setTasks(r.data || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [project?._id]);

  useEffect(() => {
    if (open) fetchTasks();
    else setTasks([]);
  }, [open, fetchTasks]);

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  // ── Create / edit ───────────────────────────────────────────────────────────
  const handleTaskSubmit = async (formData) => {
    try {
      if (editingTask) {
        await axios.put(
          `${API_BASE}/api/tasks/${project._id}/${editingTask._id}`,
          formData,
          { headers: authHeaders() }
        );
        toast("Task updated");
      } else {
        await axios.post(`${API_BASE}/api/tasks/${project._id}`, formData, {
          headers: authHeaders(),
        });
        toast("Task created");
      }
      setTaskFormOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to save task", "error");
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/api/tasks/${project._id}/${taskId}`, {
        headers: authHeaders(),
      });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast("Task deleted");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete task", "error");
    }
  };

  // ── Complete ────────────────────────────────────────────────────────────────
  const handleComplete = async (task) => {
    try {
      await axios.post(
        `${API_BASE}/api/tasks/${project._id}/${task._id}/complete`,
        {},
        { headers: authHeaders() }
      );
      toast("Task marked complete! 🎉");
      fetchTasks();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to complete task", "error");
    }
  };

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  const handleDragStart = (e, task) => {
    dragTask.current = task;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnd = () => {
    dragTask.current = null;
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const task = dragTask.current;
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );

    try {
      await axios.put(
        `${API_BASE}/api/tasks/${project._id}/${task._id}`,
        { status: newStatus },
        { headers: authHeaders() }
      );
      fetchTasks(); // Sync from server for completedAt etc.
    } catch {
      fetchTasks(); // Rollback
      toast("Failed to move task", "error");
    }
  };

  if (!project) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            borderRadius: J.radius,
            height: "85vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${J.border}`,
            py: 1.5,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: J.radius,
                bgcolor: J.blueLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: J.blue }}>
                K
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem", color: J.textPrimary }}>
                {project.projectName}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: J.textSecondary }}>
                Kanban Board
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Completion history" arrow>
              <IconButton
                size="small"
                onClick={() => setHistoryOpen(true)}
                sx={{
                  color: J.textSecondary,
                  border: `1px solid ${J.border}`,
                  borderRadius: J.radius,
                  p: "5px",
                  "&:hover": { color: J.blue, bgcolor: J.blueLight },
                }}
              >
                <HistoryIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            {(isCreator || isAdmin) && (
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                onClick={() => {
                  setEditingTask(null);
                  setTaskFormOpen(true);
                }}
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
                Add Task
              </Button>
            )}
            <IconButton size="small" onClick={onClose}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Board */}
        <DialogContent sx={{ flex: 1, overflow: "hidden", p: 0, bgcolor: J.bgPage }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress size={28} sx={{ color: J.blue }} />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                p: 2,
                height: "100%",
                overflowX: "auto",
                overflowY: "hidden",
              }}
            >
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={tasksByStatus(col.id)}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  isCreator={isCreator}
                  isAdmin={isAdmin}
                  onAddTask={() => {
                    setEditingTask(null);
                    setTaskFormOpen(true);
                  }}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setTaskFormOpen(true);
                  }}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Task form */}
      <TaskFormDialog
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        projectDevelopers={projectDevelopers}
        isCreator={isCreator}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        currentUsername={currentUsername}
      />

      {/* Completion history */}
      <CompletionHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        projectId={project?._id}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          variant="filled"
          sx={{ borderRadius: J.radius, fontSize: "0.875rem" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProjectKanban;