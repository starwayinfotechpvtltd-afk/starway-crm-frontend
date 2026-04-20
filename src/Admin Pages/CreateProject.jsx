// import React, { useState, useEffect } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Grid,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Snackbar,
//   Alert,
//   Divider,
//   Drawer,
//   Checkbox,
//   ListItemText,
//   Chip,
// } from "@mui/material";
// import { ListChecks, X, Plus, Settings } from "lucide-react";
// import ToggleButton from "@mui/material/ToggleButton";
// import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";
// import axios from "axios";

// // Swiper js imports
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/navigation";
// import { Navigation } from "swiper/modules";

// // Modern, high-contrast minimalist theme
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: "#2383e2", // Professional blue
//     },
//     background: {
//       default: "#f8fafc", // Tailwind slate-50
//     },
//     text: {
//       primary: "#0f172a", // Tailwind slate-900
//       secondary: "#64748b", // Tailwind slate-500
//     },
//   },
//   typography: {
//     fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//     button: {
//       textTransform: "none",
//       fontWeight: 600,
//     },
//   },
//   components: {
//     MuiTextField: {
//       styleOverrides: {
//         root: {
//           "& .MuiOutlinedInput-root": {
//             backgroundColor: "#ffffff",
//             borderRadius: "8px",
//             "& fieldset": {
//               borderColor: "#e2e8f0",
//             },
//             "&:hover fieldset": {
//               borderColor: "#cbd5e1",
//             },
//             "&.Mui-focused fieldset": {
//               borderColor: "#2383e2",
//             },
//           },
//         },
//       },
//     },
//     MuiSelect: {
//       styleOverrides: {
//         root: {
//           backgroundColor: "#ffffff",
//           borderRadius: "8px",
//           "& fieldset": {
//             borderColor: "#e2e8f0",
//           },
//         },
//       },
//     },
//   },
// });

// // Restyled as modern pill/chips
// const StyledToggleButton = styled(ToggleButton)(({ theme, selected }) => ({
//   "&.MuiToggleButton-root": {
//     border: "1px solid #e2e8f0",
//     borderRadius: "9999px",
//     padding: "6px 16px",
//     margin: theme.spacing(0.5),
//     color: "#64748b",
//     fontWeight: 500,
//     transition: "all 0.2s ease-in-out",
//     "&.Mui-selected": {
//       backgroundColor: "#2383e2",
//       color: "#ffffff",
//       border: "1px solid #2383e2",
//       "&:hover": {
//         backgroundColor: "#1e70c1",
//       },
//     },
//     "&:hover": {
//       backgroundColor: "#f1f5f9",
//     },
//   },
// }));

// function CreateProject() {
//   const [projectName, setProjectName] = useState("");
//   const [projectDetails, setProjectDetails] = useState("");
//   const [clientName, setClientName] = useState("");
//   const [clientEmail, setClientEmail] = useState("");
//   const [clientNumber, setClientNumber] = useState("");
//   const [amount, setAmount] = useState("");
//   // Updated state for multiple developers
//   const [assignedDevelopers, setAssignedDevelopers] = useState([]);
//   const [serviceType, setServiceType] = useState([]);
//   const [serviceTypes, setServiceTypes] = useState([]);
//   const [referenceSite, setReferenceSite] = useState("");
//   const [businessNiche, setBusinessNiche] = useState("");
//   const [comments, setComments] = useState("");
//   const [developers, setDevelopers] = useState([]);
//   const [subscriptionType, setSubscriptionType] = useState("One-Time");

//   // Sidebar and Service Type States
//   const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
//   const [newServiceType, setNewServiceType] = useState("");
//   const [deletePopupOpen, setDeletePopupOpen] = useState(false);
//   const [serviceTypeToDelete, setServiceTypeToDelete] = useState(null);

//   // Snackbar States
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState("success");

//   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

//   useEffect(() => {
//     const fetchDevelopers = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get(`${API_BASE}/api/auth/developers`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setDevelopers(response.data);
//       } catch (error) {
//         console.error("Failed to fetch developers:", error);
//       }
//     };

//     fetchDevelopers();
//   }, []);

//   useEffect(() => {
//     const fetchServiceTypes = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get(`${API_BASE}/api/servicetypes`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setServiceTypes(response.data.map((st) => st.name));
//       } catch (error) {
//         console.error("Failed to fetch service types:", error);
//       }
//     };

//     fetchServiceTypes();
//   }, []);

//   const handleDeveloperChange = (event) => {
//     const {
//       target: { value },
//     } = event;
//     // value is an array of selected usernames
//     const selectedDevs = developers
//       .filter((dev) => value.includes(dev.username))
//       .map((dev) => ({ id: dev._id, username: dev.username }));
//     setAssignedDevelopers(selectedDevs);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const projectData = {
//       projectName,
//       projectDetails,
//       clientName,
//       clientEmail,
//       clientNumber,
//       amount,
//       assignedDeveloper: assignedDevelopers, // Pass array of developers
//       serviceType,
//       referenceSite,
//       businessNiche,
//       comments,
//       subscriptionType,
//       createdDate: new Date(),
//     };

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.error("No token found in localStorage");
//         return;
//       }

//       const response = await axios.post(
//         `${API_BASE}/api/newproject/projects`,
//         projectData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (response.status === 201) {
//         setProjectName("");
//         setProjectDetails("");
//         setClientName("");
//         setClientEmail("");
//         setClientNumber("");
//         setAmount("");
//         setAssignedDevelopers([]);
//         setServiceType([]);
//         setReferenceSite("");
//         setBusinessNiche("");
//         setComments("");
//         setSubscriptionType("One-Time");

//         setSnackbarMessage("Project created successfully!");
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//       } else {
//         setSnackbarMessage("Failed to create project.");
//         setSnackbarSeverity("error");
//         setSnackbarOpen(true);
//       }
//     } catch (error) {
//       setSnackbarMessage(`Error: ${error.message}`);
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     }
//   };

//   const handleCreateServiceType = async () => {
//     if (!newServiceType.trim()) return;
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(
//         `${API_BASE}/api/servicetypes`,
//         { name: newServiceType },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (response.status === 201) {
//         setServiceTypes([...serviceTypes, newServiceType]);
//         setNewServiceType("");
//       }
//     } catch (error) {
//       console.error("Failed to create service type:", error);
//     }
//   };

//   const handleDeleteServiceType = async (type) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.delete(
//         `${API_BASE}/api/servicetypes/${type}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (response.status === 200) {
//         setServiceTypes(serviceTypes.filter((st) => st !== type));
//         setServiceType(serviceType.filter((st) => st !== type));
//       }
//     } catch (error) {
//       console.error("Failed to delete service type:", error);
//     }
//   };

//   const handleDeleteClick = (type) => {
//     setServiceTypeToDelete(type);
//     setDeletePopupOpen(true);
//   };

//   const handleDeleteConfirm = () => {
//     if (serviceTypeToDelete) {
//       handleDeleteServiceType(serviceTypeToDelete);
//       setDeletePopupOpen(false);
//       setServiceTypeToDelete(null);
//     }
//   };

//   const handleDeleteCancel = () => {
//     setDeletePopupOpen(false);
//     setServiceTypeToDelete(null);
//   };

//   const handleCloseSnackbar = (event, reason) => {
//     if (reason === "clickaway") return;
//     setSnackbarOpen(false);
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
//         <Box
//           component="form"
//           onSubmit={handleSubmit}
//           className="bg-white border border-slate-200 rounded-xl px-6 py-8 md:px-10 md:py-10 mb-4 w-full max-w-6xl"
//           sx={{
//             boxShadow:
//               "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
//           }}
//         >
//           <Box mb={5} display="flex" justifyContent="space-between" alignItems="center">
//             <Box>
//               <Typography variant="h5" fontWeight="bold" color="text.primary">
//                 Create New Project
//               </Typography>
//               <Typography variant="body2" color="text.secondary" mt={0.5}>
//                 Fill in the details below to initialize a new client project workspace.
//               </Typography>
//             </Box>
//           </Box>

//           <Grid container spacing={4}>
//             {/* Section: Project Information */}
//             <Grid item xs={12}>
//               <Typography
//                 variant="subtitle2"
//                 fontWeight="bold"
//                 color="primary"
//                 gutterBottom
//                 sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
//               >
//                 1. Project Information
//               </Typography>
//               <Divider sx={{ mb: 3 }} />
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Project Name"
//                     variant="outlined"
//                     fullWidth
//                     value={projectName}
//                     onChange={(e) => setProjectName(e.target.value)}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                   <FormControl fullWidth required>
//                     <InputLabel>Subscription Type</InputLabel>
//                     <Select
//                       value={subscriptionType}
//                       onChange={(e) => setSubscriptionType(e.target.value)}
//                       label="Subscription Type"
//                     >
//                       <MenuItem value="One-Time">One-Time</MenuItem>
//                       <MenuItem value="Subscription-Based">
//                         Subscription-Based
//                       </MenuItem>
//                       <MenuItem value="Website-Based">Website-Based</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <TextField
//                     label="Project Details"
//                     variant="outlined"
//                     fullWidth
//                     multiline
//                     rows={3}
//                     value={projectDetails}
//                     onChange={(e) => setProjectDetails(e.target.value)}
//                   />
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Section: Client Details */}
//             <Grid item xs={12}>
//               <Typography
//                 variant="subtitle2"
//                 fontWeight="bold"
//                 color="primary"
//                 gutterBottom
//                 sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
//               >
//                 2. Client Details
//               </Typography>
//               <Divider sx={{ mb: 3 }} />
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Client Name"
//                     variant="outlined"
//                     fullWidth
//                     value={clientName}
//                     onChange={(e) => setClientName(e.target.value)}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Client Email"
//                     variant="outlined"
//                     fullWidth
//                     type="email"
//                     value={clientEmail}
//                     onChange={(e) => setClientEmail(e.target.value)}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Client Number"
//                     variant="outlined"
//                     fullWidth
//                     value={clientNumber}
//                     onChange={(e) => setClientNumber(e.target.value)}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Deal Amount"
//                     variant="outlined"
//                     fullWidth
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     required
//                   />
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Section: Technical Specs */}
//             <Grid item xs={12}>
//               <Typography
//                 variant="subtitle2"
//                 fontWeight="bold"
//                 color="primary"
//                 gutterBottom
//                 sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
//               >
//                 3. Specifications & Services
//               </Typography>
//               <Divider sx={{ mb: 3 }} />
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Reference Site (URL)"
//                     variant="outlined"
//                     fullWidth
//                     value={referenceSite}
//                     onChange={(e) => setReferenceSite(e.target.value)}
//                   />
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Business Niche"
//                     variant="outlined"
//                     fullWidth
//                     value={businessNiche}
//                     onChange={(e) => setBusinessNiche(e.target.value)}
//                   />
//                 </Grid>

//                 {/* Multiple Developers Dropdown */}
//                 <Grid item xs={12} md={6}>
//                   <FormControl fullWidth>
//                     <InputLabel>Assign Developers</InputLabel>
//                     <Select
//                       multiple
//                       value={assignedDevelopers.map((dev) => dev.username)}
//                       onChange={handleDeveloperChange}
//                       label="Assign Developers"
//                       renderValue={(selected) => (
//                         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                           {selected.map((value) => (
//                             <Chip
//                               key={value}
//                               label={value}
//                               sx={{
//                                 height: 24,
//                                 backgroundColor: "#f1f5f9",
//                                 fontWeight: 500,
//                               }}
//                             />
//                           ))}
//                         </Box>
//                       )}
//                     >
//                       {developers.map((dev) => (
//                         <MenuItem key={dev._id} value={dev.username}>
//                           <Checkbox
//                             checked={assignedDevelopers.some(
//                               (d) => d.username === dev.username
//                             )}
//                             sx={{
//                               color: "#cbd5e1",
//                               "&.Mui-checked": { color: "#2383e2" },
//                             }}
//                           />
//                           <ListItemText primary={dev.username} />
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>

//                 {/* Services Section */}
//                 <Grid item xs={12}>
//                   <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//                     <Typography variant="body2" color="text.secondary">
//                       Select Required Services:
//                     </Typography>
//                     <Button
//                       size="small"
//                       variant="outlined"
//                       onClick={() => setIsSidebarDrawerOpen(true)}
//                       sx={{ borderRadius: "8px", color: "#64748b", borderColor: "#cbd5e1" }}
//                     >
//                       <Settings size={16} className="mr-1" /> Manage Services
//                     </Button>
//                   </Box>
//                   <Box
//                     sx={{
//                       border: "1px solid #e2e8f0",
//                       borderRadius: "8px",
//                       padding: "16px 8px",
//                       backgroundColor: "#ffffff",
//                     }}
//                   >
//                     <Swiper
//                       slidesPerView={"auto"}
//                       spaceBetween={8}
//                       modules={[Navigation]}
//                       className="px-2"
//                     >
//                       {serviceTypes.map((type) => (
//                         <SwiperSlide key={type} style={{ width: "auto" }}>
//                           <StyledToggleButton
//                             value={type}
//                             selected={serviceType.includes(type)}
//                             onChange={() => {
//                               const newSelection = serviceType.includes(type)
//                                 ? serviceType.filter((t) => t !== type)
//                                 : [...serviceType, type];
//                               setServiceType(newSelection);
//                             }}
//                           >
//                             {type}
//                           </StyledToggleButton>
//                         </SwiperSlide>
//                       ))}
//                       {serviceTypes.length === 0 && (
//                         <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
//                           No service types available. Manage services to add one.
//                         </Typography>
//                       )}
//                     </Swiper>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Grid>

//             {/* Section: Final Notes */}
//             <Grid item xs={12}>
//               <TextField
//                 label="Internal Comments"
//                 variant="outlined"
//                 fullWidth
//                 multiline
//                 rows={3}
//                 value={comments}
//                 onChange={(e) => setComments(e.target.value)}
//               />
//             </Grid>

//             {/* Submit Action */}
//             <Grid item xs={12}>
//               <Box display="flex" justifyContent="flex-end" mt={2}>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   color="primary"
//                   size="large"
//                   sx={{
//                     px: 4,
//                     py: 1.5,
//                     borderRadius: "8px",
//                     boxShadow: "0 4px 6px -1px rgb(35 131 226 / 0.3)",
//                     "&:hover": {
//                       boxShadow: "0 6px 8px -1px rgb(35 131 226 / 0.4)",
//                     },
//                   }}
//                 >
//                   <ListChecks className="mr-2" size={20} />
//                   Create Project Workspace
//                 </Button>
//               </Box>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Sidebar Drawer for Service Management */}
//         <Drawer
//           anchor="right"
//           open={isSidebarDrawerOpen}
//           onClose={() => setIsSidebarDrawerOpen(false)}
//           PaperProps={{
//             sx: { width: { xs: '100%', sm: 400 }, p: 3, backgroundColor: "#f8fafc" },
//           }}
//         >
//           <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//             <Typography variant="h6" fontWeight="bold">
//               Manage Services
//             </Typography>
//             <IconButton onClick={() => setIsSidebarDrawerOpen(false)}>
//               <X size={20} />
//             </IconButton>
//           </Box>

//           <Box sx={{ backgroundColor: "#ffffff", p: 2, borderRadius: "12px", border: "1px solid #e2e8f0", mb: 4 }}>
//             <Typography variant="subtitle2" mb={2} color="text.secondary">Add New Service Type</Typography>
//             <Box display="flex" gap={2}>
//               <TextField
//                 label="Service Name"
//                 variant="outlined"
//                 size="small"
//                 fullWidth
//                 value={newServiceType}
//                 onChange={(e) => setNewServiceType(e.target.value)}
//                 onKeyPress={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     handleCreateServiceType();
//                   }
//                 }}
//               />
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateServiceType}
//                 disabled={!newServiceType.trim()}
//                 sx={{ minWidth: "100px", borderRadius: "8px" }}
//               >
//                 <Plus size={18} className="mr-1" /> Add
//               </Button>
//             </Box>
//           </Box>

//           <Typography variant="subtitle2" mb={2} color="text.secondary" sx={{ px: 1 }}>Existing Services</Typography>
//           <Box display="flex" flexDirection="column" gap={1}>
//             {serviceTypes.map((type) => (
//               <Box 
//                 key={type} 
//                 display="flex" 
//                 justifyContent="space-between" 
//                 alignItems="center"
//                 sx={{ backgroundColor: "#ffffff", p: 1.5, borderRadius: "8px", border: "1px solid #e2e8f0" }}
//               >
//                 <Typography variant="body2" fontWeight="500">{type}</Typography>
//                 <IconButton
//                   size="small"
//                   onClick={() => handleDeleteClick(type)}
//                   sx={{
//                     color: "#ef4444",
//                     "&:hover": { backgroundColor: "#fee2e2" },
//                   }}
//                 >
//                   <X size={16} />
//                 </IconButton>
//               </Box>
//             ))}
//             {serviceTypes.length === 0 && (
//               <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
//                 No service types found.
//               </Typography>
//             )}
//           </Box>
//         </Drawer>

//         {/* Delete Confirmation Modal */}
//         <Dialog
//           open={deletePopupOpen}
//           onClose={handleDeleteCancel}
//           PaperProps={{ sx: { borderRadius: "12px", p: 1 } }}
//         >
//           <DialogTitle fontWeight="bold">Confirm Deletion</DialogTitle>
//           <DialogContent>
//             <Typography>
//               Are you sure you want to permanently delete the <strong>"{serviceTypeToDelete}"</strong> service type? This action cannot be undone.
//             </Typography>
//           </DialogContent>
//           <DialogActions sx={{ pb: 2, pr: 3 }}>
//             <Button onClick={handleDeleteCancel} color="inherit" sx={{ fontWeight: 600 }}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleDeleteConfirm}
//               variant="contained"
//               color="error"
//               disableElevation
//               sx={{ borderRadius: "6px" }}
//             >
//               Delete Service
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Snackbar Notification */}
//         <Snackbar
//           open={snackbarOpen}
//           autoHideDuration={6000}
//           onClose={handleCloseSnackbar}
//           anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//         >
//           <Alert
//             onClose={handleCloseSnackbar}
//             severity={snackbarSeverity}
//             variant="filled"
//             sx={{ width: "100%", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
//           >
//             {snackbarMessage}
//           </Alert>
//         </Snackbar>
//       </div>
//     </ThemeProvider>
//   );
// }

// export default CreateProject;











import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Drawer,
  Checkbox,
  ListItemText,
  Chip,
} from "@mui/material";
import { ListChecks, X, Plus, Settings } from "lucide-react";
import ToggleButton from "@mui/material/ToggleButton";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import axios from "axios";

// Swiper js imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

// Jira-style Atlassian Design Theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#0C66E4", // Atlassian Blue
      dark: "#0052CC",
    },
    error: {
      main: "#CA3521", // Atlassian Red
    },
    background: {
      default: "#FFFFFF",
    },
    text: {
      primary: "#172B4D", // Atlassian dark text
      secondary: "#44546F", // Atlassian gray text
    },
    divider: "#DFE1E6",
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", Ubuntu, "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 14,
    button: {
      textTransform: "none",
      fontWeight: 500,
      fontSize: "14px",
    },
    h5: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#172B4D",
    },
    subtitle2: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#172B4D",
    },
  },
  shape: {
    borderRadius: 3, // Jira's standard small border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none", // Flat buttons
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FAFBFC", // Jira's slight gray input background
          transition: "background-color 0.2s ease-in-out",
          "& fieldset": {
            borderColor: "#DFE1E6",
            borderWidth: "2px",
          },
          "&:hover fieldset": {
            borderColor: "#C1C7D0",
          },
          "&.Mui-focused": {
            backgroundColor: "#FFFFFF",
            "& fieldset": {
              borderColor: "#0C66E4",
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          color: "#44546F",
          "&.Mui-focused": {
            color: "#44546F", // Keep label gray even when focused, like Jira
          },
        },
      },
    },
  },
});

// Restyled as Jira-like tags/selectable buttons
const StyledToggleButton = styled(ToggleButton)(({ theme, selected }) => ({
  "&.MuiToggleButton-root": {
    border: "none",
    backgroundColor: "#F1F2F4",
    borderRadius: "3px",
    padding: "4px 12px",
    margin: theme.spacing(0.5),
    color: "#172B4D",
    fontWeight: 500,
    fontSize: "14px",
    transition: "all 0.1s ease-in-out",
    "&.Mui-selected": {
      backgroundColor: "#E9F2FF",
      color: "#0C66E4",
      "&:hover": {
        backgroundColor: "#CCE0FF",
      },
    },
    "&:hover": {
      backgroundColor: "#DFE1E6",
    },
  },
}));

function CreateProject() {
  const [projectName, setProjectName] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNumber, setClientNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [assignedDevelopers, setAssignedDevelopers] = useState([]);
  const [serviceType, setServiceType] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [referenceSite, setReferenceSite] = useState("");
  const [businessNiche, setBusinessNiche] = useState("");
  const [comments, setComments] = useState("");
  const [developers, setDevelopers] = useState([]);
  const [subscriptionType, setSubscriptionType] = useState("One-Time");

  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
  const [newServiceType, setNewServiceType] = useState("");
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/api/auth/developers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDevelopers(response.data);
      } catch (error) {
        console.error("Failed to fetch developers:", error);
      }
    };
    fetchDevelopers();
  }, []);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/api/servicetypes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setServiceTypes(response.data.map((st) => st.name));
      } catch (error) {
        console.error("Failed to fetch service types:", error);
      }
    };
    fetchServiceTypes();
  }, []);

  const handleDeveloperChange = (event) => {
    const {
      target: { value },
    } = event;
    const selectedDevs = developers
      .filter((dev) => value.includes(dev.username))
      .map((dev) => ({ id: dev._id, username: dev.username }));
    setAssignedDevelopers(selectedDevs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectData = {
      projectName,
      projectDetails,
      clientName,
      clientEmail,
      clientNumber,
      amount,
      assignedDeveloper: assignedDevelopers,
      serviceType,
      referenceSite,
      businessNiche,
      comments,
      subscriptionType,
      createdDate: new Date(),
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${API_BASE}/api/newproject/projects`,
        projectData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        setProjectName("");
        setProjectDetails("");
        setClientName("");
        setClientEmail("");
        setClientNumber("");
        setAmount("");
        setAssignedDevelopers([]);
        setServiceType([]);
        setReferenceSite("");
        setBusinessNiche("");
        setComments("");
        setSubscriptionType("One-Time");

        setSnackbarMessage("Project created successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Failed to create project");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCreateServiceType = async () => {
    if (!newServiceType.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/api/servicetypes`,
        { name: newServiceType },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        setServiceTypes([...serviceTypes, newServiceType]);
        setNewServiceType("");
      }
    } catch (error) {
      console.error("Failed to create service type:", error);
    }
  };

  const handleDeleteServiceType = async (type) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_BASE}/api/servicetypes/${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setServiceTypes(serviceTypes.filter((st) => st !== type));
        setServiceType(serviceType.filter((st) => st !== type));
      }
    } catch (error) {
      console.error("Failed to delete service type:", error);
    }
  };

  const handleDeleteClick = (type) => {
    setServiceTypeToDelete(type);
    setDeletePopupOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (serviceTypeToDelete) {
      handleDeleteServiceType(serviceTypeToDelete);
      setDeletePopupOpen(false);
      setServiceTypeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletePopupOpen(false);
    setServiceTypeToDelete(null);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen flex items-start justify-center p-4 md:p-8 bg-[#FAFBFC]">
        <Box
          component="form"
          onSubmit={handleSubmit}
          className="bg-white border border-[#DFE1E6] rounded-sm px-6 py-8 md:px-8 md:py-8 w-full max-w-4xl"
        >
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              Create Project
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>

          <Grid container spacing={3}>
            {/* Section: Project Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Project Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Project Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Subscription Type</InputLabel>
                    <Select
                      value={subscriptionType}
                      onChange={(e) => setSubscriptionType(e.target.value)}
                      label="Subscription Type"
                    >
                      <MenuItem value="One-Time">One-Time</MenuItem>
                      <MenuItem value="Subscription-Based">
                        Subscription-Based
                      </MenuItem>
                      <MenuItem value="Website-Based">Website-Based</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    rows={4}
                    value={projectDetails}
                    onChange={(e) => setProjectDetails(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Section: Client Details */}
            <Grid item xs={12} mt={1}>
              <Typography variant="subtitle2" gutterBottom>
                Client Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Client Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Client Email"
                    variant="outlined"
                    size="small"
                    fullWidth
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Client Number"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={clientNumber}
                    onChange={(e) => setClientNumber(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Deal Amount"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Section: Technical Specs */}
            <Grid item xs={12} mt={1}>
              <Typography variant="subtitle2" gutterBottom>
                Specifications & Assignments
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Reference Site (URL)"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={referenceSite}
                    onChange={(e) => setReferenceSite(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Business Niche"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={businessNiche}
                    onChange={(e) => setBusinessNiche(e.target.value)}
                  />
                </Grid>

                {/* Multiple Developers Dropdown */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Assignee</InputLabel>
                    <Select
                      multiple
                      value={assignedDevelopers.map((dev) => dev.username)}
                      onChange={handleDeveloperChange}
                      label="Assignee"
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              sx={{
                                borderRadius: "3px",
                                backgroundColor: "#F1F2F4",
                                color: "#172B4D",
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {developers.map((dev) => (
                        <MenuItem key={dev._id} value={dev.username}>
                          <Checkbox
                            size="small"
                            checked={assignedDevelopers.some(
                              (d) => d.username === dev.username
                            )}
                            sx={{
                              color: "#DFE1E6",
                              "&.Mui-checked": { color: "#0C66E4" },
                            }}
                          />
                          <ListItemText primary={dev.username} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Services Section */}
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Labels / Services
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setIsSidebarDrawerOpen(true)}
                      sx={{ color: "#44546F" }}
                    >
                      <Settings size={14} className="mr-1" /> Configure Services
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      border: "1px solid #DFE1E6",
                      borderRadius: "3px",
                      padding: "8px 4px",
                      backgroundColor: "#FAFBFC",
                    }}
                  >
                    <Swiper
                      slidesPerView={"auto"}
                      spaceBetween={4}
                      modules={[Navigation]}
                      className="px-2"
                    >
                      {serviceTypes.map((type) => (
                        <SwiperSlide key={type} style={{ width: "auto" }}>
                          <StyledToggleButton
                            value={type}
                            selected={serviceType.includes(type)}
                            onChange={() => {
                              const newSelection = serviceType.includes(type)
                                ? serviceType.filter((t) => t !== type)
                                : [...serviceType, type];
                              setServiceType(newSelection);
                            }}
                          >
                            {type}
                          </StyledToggleButton>
                        </SwiperSlide>
                      ))}
                      {serviceTypes.length === 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ p: 1 }}
                        >
                          No labels found. Configure services to add one.
                        </Typography>
                      )}
                    </Swiper>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Section: Final Notes */}
            <Grid item xs={12} mt={1}>
              <TextField
                label="Internal Comments"
                variant="outlined"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </Grid>

            {/* Submit Action */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="text"
                  color="inherit"
                  sx={{ color: "#44546F" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disableElevation
                >
                  Create
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Sidebar Drawer for Service Management */}
        <Drawer
          anchor="right"
          open={isSidebarDrawerOpen}
          onClose={() => setIsSidebarDrawerOpen(false)}
          PaperProps={{
            sx: { width: { xs: "100%", sm: 400 }, p: 3, backgroundColor: "#FFFFFF" },
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="600" color="#172B4D">
              Configure Services
            </Typography>
            <IconButton onClick={() => setIsSidebarDrawerOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </Box>

          <Box sx={{ backgroundColor: "#FAFBFC", p: 2, borderRadius: "3px", border: "1px solid #DFE1E6", mb: 4 }}>
            <Typography variant="subtitle2" mb={1.5} color="text.secondary">
              Add New Service
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Service name..."
                fullWidth
                value={newServiceType}
                onChange={(e) => setNewServiceType(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateServiceType();
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateServiceType}
                disabled={!newServiceType.trim()}
                disableElevation
              >
                Add
              </Button>
            </Box>
          </Box>

          <Typography variant="subtitle2" mb={1.5} color="text.secondary">
            Existing Services
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {serviceTypes.map((type) => (
              <Box
                key={type}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ backgroundColor: "#FFFFFF", p: 1, borderRadius: "3px", border: "1px solid #DFE1E6" }}
              >
                <Typography variant="body2" fontWeight="500" color="#172B4D">
                  {type}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(type)}
                  sx={{
                    color: "#44546F",
                    "&:hover": { color: "#CA3521", backgroundColor: "#FFEBE6" },
                  }}
                >
                  <X size={16} />
                </IconButton>
              </Box>
            ))}
            {serviceTypes.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                No service types found.
              </Typography>
            )}
          </Box>
        </Drawer>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deletePopupOpen}
          onClose={handleDeleteCancel}
          PaperProps={{ sx: { borderRadius: "3px", p: 1 } }}
        >
          <DialogTitle sx={{ color: "#172B4D", fontWeight: 600 }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "#44546F" }}>
              Are you sure you want to permanently delete <strong>{serviceTypeToDelete}</strong>? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 3 }}>
            <Button onClick={handleDeleteCancel} sx={{ color: "#44546F", fontWeight: 500 }}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disableElevation
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ borderRadius: "3px", fontSize: "14px", fontWeight: 500 }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}

export default CreateProject;
