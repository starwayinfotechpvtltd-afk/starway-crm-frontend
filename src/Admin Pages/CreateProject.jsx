



// import React, { useState, useEffect, useRef } from "react";
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
//   CircularProgress,
//   Paper,
//   InputAdornment,
//   Switch,
//   FormControlLabel
// } from "@mui/material";
// import { 
//   X, 
//   Settings, 
//   Briefcase, 
//   User, 
//   Cpu, 
//   MessageSquare, 
//   Plus, 
//   CheckCircle2,
//   Layers,
//   Download,
//   DollarSign,
//   Trash2
// } from "lucide-react";
// import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";
// import axios from "axios";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// // Import your logo
// import assets from "../assets/assets"; 

// const theme = createTheme({
//   palette: {
//     primary: { main: "#3b4e87", dark: "#2a3962", light: "#E9F2FF" }, // Navy Blue like the image
//     secondary: { main: "#172B4D" },
//     background: { default: "#F4F5F7", paper: "#FFFFFF" },
//   },
//   typography: {
//     fontFamily: 'Arial, sans-serif',
//     h5: { fontWeight: 700 },
//   },
//   shape: { borderRadius: 2 },
// });

// // --- Styled Components for the Form ---
// const FormSection = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(3),
//   border: "1px solid #DFE1E6",
//   boxShadow: "none",
//   marginBottom: theme.spacing(3),
//   borderRadius: '8px'
// }));

// const ServiceCard = styled(Paper)(({ selected }) => ({
//   width: "100%",
//   minHeight: "100px",
//   cursor: "pointer",
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "center",
//   justifyContent: "center",
//   padding: "12px",
//   border: `2px solid ${selected ? "#3b4e87" : "#DFE1E6"}`,
//   backgroundColor: selected ? "#f0f2f8" : "#fff",
//   transition: "all 0.15s ease",
//   position: "relative",
// }));

// // --- Styled Components for the EXACT INVOICE UI ---
// const InvoicePaper = styled(Box)(({ theme }) => ({
//   width: "210mm", // A4 Width
//   minHeight: "297mm", // A4 Height
//   padding: "15mm",
//   backgroundColor: "#fff",
//   color: "#333",
//   margin: "0 auto",
//   fontSize: "12px",
//   lineHeight: "1.4",
//   "& *": { boxSizing: "border-box" },
// }));

// const MetaTable = styled("table")({
//   borderCollapse: "collapse",
//   width: "220px",
//   "& td": {
//     border: "1px solid #ccc",
//     padding: "4px 8px",
//     fontSize: "11px",
//   },
//   "& td:first-of-type": {
//     backgroundColor: "#f9f9f9",
//     fontWeight: "bold",
//     textAlign: "right",
//     width: "100px",
//   }
// });

// const ItemTable = styled("table")({
//   width: "100%",
//   borderCollapse: "collapse",
//   marginTop: "20px",
//   "& th": {
//     backgroundColor: "#3b4e87",
//     color: "#fff",
//     padding: "8px",
//     textAlign: "center",
//     textTransform: "uppercase",
//     fontSize: "11px",
//     border: "1px solid #3b4e87",
//   },
//   "& td": {
//     border: "1px solid #ccc",
//     padding: "8px",
//     height: "30px",
//   },
//   "& tr:nth-of-type(even)": {
//     backgroundColor: "#f2f2f2",
//   }
// });

// function CreateProject() {
//   const [projectName, setProjectName] = useState("");
//   const [projectDetails, setProjectDetails] = useState("");
//   const [clientName, setClientName] = useState("");
//   const [clientEmail, setClientEmail] = useState("");
//   const [clientNumber, setClientNumber] = useState("");
//   const [subscriptionType, setSubscriptionType] = useState("One-Time");
//   const [amount, setAmount] = useState(""); 
//   const [isItemized, setIsItemized] = useState(false); 
//   const [servicePrices, setServicePrices] = useState({}); 
//   const [serviceType, setServiceType] = useState([]);
//   const [serviceTypes, setServiceTypes] = useState([]);
//   const [assignedDevelopers, setAssignedDevelopers] = useState([]);
//   const [developers, setDevelopers] = useState([]);
//   const [comments, setComments] = useState("");

//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [newService, setNewService] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, msg: "", sev: "success" });

//   const invoiceRef = useRef(null);
//   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

//   const calculateTotal = () => {
//     if (!isItemized) return parseFloat(amount) || 0;
//     return serviceType.reduce((acc, curr) => acc + (parseFloat(servicePrices[curr]) || 0), 0);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem("token");
//       try {
//         const [devs, svcs] = await Promise.all([
//           axios.get(`${API_BASE}/api/auth/developers`, { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get(`${API_BASE}/api/servicetypes`, { headers: { Authorization: `Bearer ${token}` } })
//         ]);
//         setDevelopers(devs.data);
//         setServiceTypes(svcs.data.map(s => s.name));
//       } catch (e) { console.error(e); }
//     };
//     fetchData();
//   }, []);

//   const handleCreateServiceType = async () => {
//     if (!newService.trim()) return;
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post(`${API_BASE}/api/servicetypes`, { name: newService }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setServiceTypes([...serviceTypes, newService]);
//       setNewService("");
//     } catch (e) { console.error(e); }
//   };

//   const handleDownloadPDF = async () => {
//     const canvas = await html2canvas(invoiceRef.current, { scale: 3, useCORS: true });
//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");
//     pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
//     pdf.save(`Invoice_${clientName || "Project"}.pdf`);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post(`${API_BASE}/api/newproject/projects`, {
//         projectName, clientName, clientEmail, clientNumber,
//         amount: calculateTotal(), serviceType, subscriptionType,
//         assignedDeveloper: assignedDevelopers, comments, createdDate: new Date()
//       }, { headers: { Authorization: `Bearer ${token}` }});
//       setSnackbar({ open: true, msg: "Project Created Successfully!", sev: "success" });
//     } catch (e) { setSnackbar({ open: true, msg: "Error saving project", sev: "error" }); }
//     finally { setIsSubmitting(false); }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Box sx={{ p: 4, bgcolor: "background.default", minHeight: "100vh" }}>
        
//         <Grid container spacing={4} maxWidth="xl" sx={{ mx: "auto" }}>
          
//           {/* LEFT: INVOICE PREVIEW (BASED ON IMAGE) */}
//           <Grid item xs={12} lg={6}>
//             <Box display="flex" justifyContent="space-between" mb={2}>
//                 <Typography variant="subtitle2">Invoice View</Typography>
//                 <Button size="small" variant="contained" startIcon={<Download size={16}/>} onClick={handleDownloadPDF}>Download PDF</Button>
//             </Box>

//             <Paper elevation={3} sx={{ overflow: 'hidden' }}>
//               <InvoicePaper ref={invoiceRef}>
//                 {/* Header Section */}
//                 <Box display="flex" justifyContent="space-between" mb={4}>
//                   <Box>
//                     <img src={assets.logo} alt="Logo" style={{ height: "45px", marginBottom: "5px" }} />
//                     <Typography variant="h5" color="#3b4e87" sx={{ fontSize: '24px' }}>Starway Management</Typography>
//                     <Typography variant="body2" color="text.secondary">79 Business Ave, Phase 8</Typography>
//                     <Typography variant="body2" color="text.secondary">Phone: [000-000-0000]</Typography>
//                     <Typography variant="body2" color="text.secondary">Website: starwaymanagement.com</Typography>
//                   </Box>
//                   <Box>
//                     <Typography variant="h3" color="#3b4e87" sx={{ fontSize: '32px', textAlign: 'right', fontWeight: 'bold', mb: 2 }}>INVOICE</Typography>
//                     <MetaTable>
//                       <tbody>
//                         <tr><td>DATE</td><td>{new Date().toLocaleDateString()}</td></tr>
//                         <tr><td>INVOICE #</td><td>[{Math.floor(100000 + Math.random() * 900000)}]</td></tr>
//                         <tr><td>CUSTOMER ID</td><td>[123]</td></tr>
//                         <tr><td>DUE DATE</td><td>{new Date(Date.now() + 15 * 86400000).toLocaleDateString()}</td></tr>
//                       </tbody>
//                     </MetaTable>
//                   </Box>
//                 </Box>

//                 {/* Bill To Section */}
//                 <Box mb={4}>
//                   <Box sx={{ backgroundColor: '#3b4e87', color: '#fff', p: '4px 12px', fontWeight: 'bold', width: '300px', mb: 1 }}>
//                     BILL TO
//                   </Box>
//                   <Box pl={1.5}>
//                     <Typography sx={{ fontWeight: 'bold' }}>{clientName || "[Name]"}</Typography>
//                     <Typography>{projectName || "[Company Name]"}</Typography>
//                     <Typography>{clientEmail || "[Email Address]"}</Typography>
//                     <Typography>{clientNumber || "[Phone]"}</Typography>
//                   </Box>
//                 </Box>

//                 {/* Itemized Table */}
//                 <ItemTable>
//                   <thead>
//                     <tr>
//                       <th style={{ width: '70%' }}>DESCRIPTION</th>
//                       <th style={{ width: '10%' }}>TAXED</th>
//                       <th style={{ width: '20%' }}>AMOUNT</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {/* Render Selected Services */}
//                     {serviceType.map((s) => (
//                       <tr key={s}>
//                         <td>{s}</td>
//                         <td style={{ textAlign: 'center' }}></td>
//                         <td style={{ textAlign: 'right' }}>
//                           {isItemized ? (parseFloat(servicePrices[s]) || 0).toFixed(2) : ""}
//                         </td>
//                       </tr>
//                     ))}
//                     {/* Render Flat Fee if not itemized */}
//                     {!isItemized && (
//                       <tr>
//                         <td>Project Service Package: {projectName}</td>
//                         <td style={{ textAlign: 'center' }}></td>
//                         <td style={{ textAlign: 'right' }}>{parseFloat(amount || 0).toFixed(2)}</td>
//                       </tr>
//                     )}
//                     {/* Add empty rows to match image style (filling the paper) */}
//                     {[...Array(Math.max(0, 12 - serviceType.length))].map((_, i) => (
//                       <tr key={`empty-${i}`}><td></td><td></td><td></td></tr>
//                     ))}
//                   </tbody>
//                 </ItemTable>

//                 {/* Bottom Section */}
//                 <Box display="flex" justifyContent="space-between" mt={4}>
//                   {/* Comments Box */}
//                   <Box sx={{ width: '55%' }}>
//                     <Box sx={{ backgroundColor: '#3b4e87', color: '#fff', p: '4px 12px', fontWeight: 'bold', mb: 1 }}>
//                       OTHER COMMENTS
//                     </Box>
//                     <Box sx={{ border: '1px solid #ccc', p: 2, minHeight: '100px', fontSize: '11px' }}>
//                       1. Total payment due in 15 days.<br />
//                       2. Please include the invoice number on your check.<br />
//                       {comments && <><br />Note: {comments}</>}
//                     </Box>
//                   </Box>

//                   {/* Summary Box */}
//                   <Box sx={{ width: '35%' }}>
//                     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
//                       <tbody>
//                         <tr>
//                           <td style={{ padding: '4px', textAlign: 'right' }}>Subtotal</td>
//                           <td style={{ padding: '4px', textAlign: 'right', border: '1px solid #ccc', width: '100px' }}>{calculateTotal().toFixed(2)}</td>
//                         </tr>
//                         <tr>
//                           <td style={{ padding: '4px', textAlign: 'right' }}>Taxable</td>
//                           <td style={{ padding: '4px', textAlign: 'right', border: '1px solid #ccc' }}>0.00</td>
//                         </tr>
//                         <tr>
//                           <td style={{ padding: '4px', textAlign: 'right' }}>Tax Rate</td>
//                           <td style={{ padding: '4px', textAlign: 'right', border: '1px solid #ccc' }}>0.000%</td>
//                         </tr>
//                         <tr>
//                           <td style={{ padding: '4px', textAlign: 'right' }}>Tax Due</td>
//                           <td style={{ padding: '4px', textAlign: 'right', border: '1px solid #ccc' }}>0.00</td>
//                         </tr>
//                         <tr style={{ fontWeight: 'bold' }}>
//                           <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: '14px' }}>TOTAL</td>
//                           <td style={{ padding: '8px 4px', textAlign: 'right', border: '2px solid #3b4e87', fontSize: '14px', backgroundColor: '#f0f2f8' }}>
//                             ${calculateTotal().toFixed(2)}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                     <Typography sx={{ textAlign: 'center', mt: 2, fontSize: '10px', fontStyle: 'italic' }}>
//                       Make all checks payable to <br/> <b>Starway Management</b>
//                     </Typography>
//                   </Box>
//                 </Box>

//                 {/* Footer Center */}
//                 <Box textAlign="center" mt={6}>
//                   <Typography variant="body2">If you have any questions about this invoice, please contact</Typography>
//                   <Typography variant="body2" fontWeight="bold">[Operations Department, +000-000, billing@starway.com]</Typography>
//                   <Typography variant="h6" sx={{ mt: 2, fontStyle: 'italic', fontWeight: 'bold' }}>Thank You For Your Business!</Typography>
//                 </Box>
//               </InvoicePaper>
//             </Paper>
//           </Grid>

//           {/* RIGHT: FORM CONTROLS */}
//           <Grid item xs={12} lg={6}>
//             <FormSection>
//               <Box display="flex" alignItems="center" gap={1} mb={3}>
//                 <Briefcase size={20} color="#3b4e87" />
//                 <Typography variant="h6">Project Details</Typography>
//               </Box>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} md={8}>
//                   <TextField label="Project Title" fullWidth value={projectName} onChange={e => setProjectName(e.target.value)} />
//                 </Grid>
//                 <Grid item xs={12} md={4}>
//                   <FormControl fullWidth>
//                     <InputLabel>Subscription</InputLabel>
//                     <Select value={subscriptionType} label="Subscription" onChange={e => setSubscriptionType(e.target.value)}>
//                       <MenuItem value="One-Time">One-Time</MenuItem>
//                       <MenuItem value="Subscription-Based">Monthly</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Grid>
//               </Grid>
//             </FormSection>

//             <FormSection>
//               <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//                 <Typography variant="h6">Billing Configuration</Typography>
//                 <FormControlLabel
//                   control={<Switch checked={isItemized} onChange={e => setIsItemized(e.target.checked)} />}
//                   label="Itemized Pricing"
//                 />
//               </Box>

//               {!isItemized ? (
//                 <TextField 
//                   label="Flat Amount" fullWidth type="number" value={amount} 
//                   onChange={e => setAmount(e.target.value)}
//                   InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
//                 />
//               ) : (
//                 <Typography variant="caption" color="primary">Assign prices to each service card below.</Typography>
//               )}

//               <Grid container spacing={2} mt={2}>
//                 <Grid item xs={12} sm={6}><TextField label="Client Name" fullWidth size="small" value={clientName} onChange={e => setClientName(e.target.value)} /></Grid>
//                 <Grid item xs={12} sm={6}><TextField label="Client Email" fullWidth size="small" value={clientEmail} onChange={e => setClientEmail(e.target.value)} /></Grid>
//                 <Grid item xs={12} sm={6}><TextField label="Phone" fullWidth size="small" value={clientNumber} onChange={e => setClientNumber(e.target.value)} /></Grid>
//               </Grid>
//             </FormSection>

//             <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
//               <Typography variant="subtitle2">Services</Typography>
//               <Button size="small" onClick={() => setIsSidebarOpen(true)}>Manage List</Button>
//             </Box>
            
//             <Grid container spacing={2} mb={4}>
//               {serviceTypes.map((type) => {
//                 const isSelected = serviceType.includes(type);
//                 return (
//                   <Grid item xs={6} md={4} key={type}>
//                     <ServiceCard selected={isSelected} onClick={() => {
//                       setServiceType(isSelected ? serviceType.filter(t => t !== type) : [...serviceType, type]);
//                     }}>
//                       <Typography variant="body2" fontWeight="bold">{type}</Typography>
//                       {isSelected && isItemized && (
//                         <TextField
//                           size="small" placeholder="Price" type="number"
//                           value={servicePrices[type] || ""}
//                           onClick={e => e.stopPropagation()}
//                           onChange={e => setServicePrices({...servicePrices, [type]: e.target.value})}
//                           sx={{ mt: 1 }}
//                         />
//                       )}
//                     </ServiceCard>
//                   </Grid>
//                 );
//               })}
//             </Grid>

//             <Button 
//               fullWidth variant="contained" size="large" onClick={handleSubmit}
//               disabled={isSubmitting} sx={{ py: 2, bgcolor: "#3b4e87" }}
//             >
//               {isSubmitting ? <CircularProgress size={24} /> : "Finalize & Create Project"}
//             </Button>
//           </Grid>
//         </Grid>

//         {/* Management Sidebar */}
//         <Drawer anchor="right" open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} PaperProps={{ sx: { width: 350, p: 3 } }}>
//           <Typography variant="h6" mb={3}>Add/Remove Services</Typography>
//           <Box display="flex" gap={1} mb={4}>
//             <TextField fullWidth size="small" value={newService} onChange={e => setNewService(e.target.value)} />
//             <Button variant="contained" onClick={handleCreateServiceType}>Add</Button>
//           </Box>
//           {serviceTypes.map(s => (
//             <Box key={s} display="flex" justifyContent="space-between" p={1.5} borderBottom="1px solid #eee">
//               <Typography>{s}</Typography>
//               <IconButton size="small" color="error"><Trash2 size={16}/></IconButton>
//             </Box>
//           ))}
//         </Drawer>

//         <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
//           <Alert severity={snackbar.sev} variant="filled">{snackbar.msg}</Alert>
//         </Snackbar>

//       </Box>
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
  CircularProgress, // Added CircularProgress import
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
      main: "#0C66E4", 
      dark: "#0052CC",
    },
    error: {
      main: "#CA3521", 
    },
    background: {
      default: "#FFFFFF",
    },
    text: {
      primary: "#172B4D", 
      secondary: "#44546F", 
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
    borderRadius: 3, 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none", 
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FAFBFC", 
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
            color: "#44546F", 
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

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isServiceAdding, setIsServiceAdding] = useState(false);
  const [isServiceDeleting, setIsServiceDeleting] = useState(false);

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
    setIsSubmitting(true); // Start loading

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
      if (!token) {
        setIsSubmitting(false);
        return;
      }

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
    } finally {
      setIsSubmitting(false); // Stop loading regardless of success or failure
    }
  };

  const handleCreateServiceType = async () => {
    if (!newServiceType.trim()) return;
    setIsServiceAdding(true); // Start loading

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
    } finally {
      setIsServiceAdding(false); // Stop loading
    }
  };

  const handleDeleteServiceType = async (type) => {
    setIsServiceDeleting(true); // Start loading
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
    } finally {
      setIsServiceDeleting(false); // Stop loading
      setDeletePopupOpen(false);
      setServiceTypeToDelete(null);
    }
  };

  const handleDeleteClick = (type) => {
    setServiceTypeToDelete(type);
    setDeletePopupOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (serviceTypeToDelete) {
      handleDeleteServiceType(serviceTypeToDelete);
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
                  disabled={isSubmitting} // Optional: Disable cancel while submitting
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {isSubmitting ? "Creating..." : "Create"}
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
                disabled={isServiceAdding}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newServiceType.trim() && !isServiceAdding) {
                    e.preventDefault();
                    handleCreateServiceType();
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateServiceType}
                disabled={!newServiceType.trim() || isServiceAdding}
                disableElevation
                startIcon={isServiceAdding ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {isServiceAdding ? "Adding..." : "Add"}
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
                  disabled={isServiceDeleting && serviceTypeToDelete === type}
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
            <Button 
              onClick={handleDeleteCancel} 
              sx={{ color: "#44546F", fontWeight: 500 }}
              disabled={isServiceDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disableElevation
              disabled={isServiceDeleting}
              startIcon={isServiceDeleting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isServiceDeleting ? "Deleting..." : "Delete"}
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

export default CreateProject;``











