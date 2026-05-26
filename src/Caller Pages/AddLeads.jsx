// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   TextField,
//   Autocomplete,
//   Select,
//   MenuItem,
//   Typography,
//   Grid,
//   Box,
//   Snackbar,
//   Alert,
//   InputAdornment,
//   LinearProgress,
//   ButtonBase,
// } from "@mui/material";
// import {
//   Users,
//   Globe,
//   Phone,
//   Mail,
//   MapPin,
//   Calendar,
//   Flame,
//   PhoneCall,
//   Clock,
//   Zap,
//   CheckCheck,
//   ChevronRight,
//   ChevronLeft,
//   ArrowLeft,
//   Check,
// } from "lucide-react";

// // --- Static Data ---
// const countries = [
//   "USA", "India", "UK", "Canada", "Australia", "Germany",
//   "France", "Japan", "China", "Brazil", "South Africa", "Mexico",
// ];

// const currencySymbols = ["$", "€", "₹", "£", "¥", "₽", "₺", "₩", "₱"];

// const leadTypes = [
//   { value: "Hot Lead", color: "#ef4444", bg: "#fef2f2", icon: <Flame size={20} />, desc: "High-intent" },
//   { value: "Contacted", color: "#3b82f6", bg: "#eff6ff", icon: <CheckCheck size={20} />, desc: "In communication" },
//   { value: "Contact in Future", color: "#8b5cf6", bg: "#f5f3ff", icon: <Clock size={20} />, desc: "Schedule for later" },
//   { value: "Callback", color: "#f59e0b", bg: "#fffbeb", icon: <PhoneCall size={20} />, desc: "Callback requested" },
//   { value: "New Lead", color: "#10b981", bg: "#ecfdf5", icon: <Zap size={20} />, desc: "Fresh, uncontacted" },
// ];

// const steps = [
//   { id: 1, label: "Contact Info", desc: "Name & location" },
//   { id: 2, label: "Packages", desc: "Service selection" },
//   { id: 3, label: "Lead Details", desc: "Notes & financials" },
// ];

// const THEME_COLOR = "#0a68da";
// const THEME_LIGHT = "rgba(10, 104, 218, 0.04)";

// const fieldSx = {
//   "& .MuiOutlinedInput-root": {
//     borderRadius: "8px",
//     background: "#fff",
//     fontSize: "0.95rem",
//     "& fieldset": { borderColor: "#e2e8f0" },
//     "&:hover fieldset": { borderColor: "#cbd5e1" },
//     "&.Mui-focused fieldset": { borderColor: THEME_COLOR, borderWidth: "1.5px" },
//   },
//   "& .MuiInputLabel-root": { color: "#64748b" },
// };

// // --- Sub-Components (Defined OUTSIDE to prevent focus loss) ---

// const Step1 = ({ formData, handleChange, setFormData }) => (
//   <Box>
//     <Typography variant="h5" sx={{ fontWeight: 500, color: "#0f172a", mb: 1 }}>Contact Information</Typography>
//     <Typography sx={{ color: "#64748b", mb: 4 }}>Primary details for the new lead engagement.</Typography>

//     <Grid container spacing={3}>
//       {[
//         { label: "Lead Name", name: "leadName", icon: <Users size={18} />, required: true },
//         { label: "Phone Number", name: "phoneNumber", icon: <Phone size={18} />, required: true },
//         { label: "Email Address", name: "email", icon: <Mail size={18} /> },
//         { label: "Website", name: "website", icon: <Globe size={18} /> },
//       ].map((f) => (
//         <Grid item xs={12} sm={6} key={f.name}>
//           <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1, fontWeight: 400 }}>
//             {f.label} {f.required && "*"}
//           </Typography>
//           <TextField
//             fullWidth
//             name={f.name}
//             value={formData[f.name]}
//             onChange={handleChange}
//             placeholder={`Enter ${f.label.toLowerCase()}`}
//             InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mr: 1 }}>{f.icon}</InputAdornment> }}
//             sx={fieldSx}
//           />
//         </Grid>
//       ))}
//       <Grid item xs={12} sm={6}>
//         <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1 }}>Country *</Typography>
//         <Autocomplete
//           options={countries}
//           value={formData.country}
//           onChange={(_, v) => setFormData(p => ({ ...p, country: v || "" }))}
//           renderInput={(params) => <TextField {...params} placeholder="Search country..." sx={fieldSx} />}
//         />
//       </Grid>
//     </Grid>
//   </Box>
// );

// const Step2 = ({ formData, togglePackage, packagesList }) => (
//   <Box>
//     <Typography variant="h5" sx={{ fontWeight: 500, color: "#0f172a", mb: 1 }}>Service Packages</Typography>
//     <Typography sx={{ color: "#64748b", mb: 4 }}>Select all services this lead is interested in.</Typography>
//     <Grid container spacing={2}>
//       {packagesList.map((pkg, idx) => {
//         const pkgName = typeof pkg === "string" ? pkg : (pkg.serviceName || pkg.name || `Service ${idx}`);
//         const isSelected = formData.packages.includes(pkgName);
//         return (
//           <Grid item xs={12} sm={6} md={4} key={pkgName}>
//             <ButtonBase
//               onClick={() => togglePackage(pkgName)}
//               sx={{
//                 width: "100%", height: "100%", minHeight: "80px", p: 2, borderRadius: "10px",
//                 border: "1px solid", borderColor: isSelected ? THEME_COLOR : "#e2e8f0",
//                 bgcolor: isSelected ? THEME_LIGHT : "#fff",
//                 display: "flex", justifyContent: "flex-start", gap: 2, transition: "0.2s",
//                 "&:hover": { borderColor: THEME_COLOR, bgcolor: THEME_LIGHT }
//               }}
//             >
//               <Box sx={{
//                 width: 22, height: 22, borderRadius: "6px", border: "2px solid",
//                 borderColor: isSelected ? THEME_COLOR : "#cbd5e1",
//                 bgcolor: isSelected ? THEME_COLOR : "transparent",
//                 display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
//               }}>
//                 {isSelected && <Check size={14} color="#fff" strokeWidth={4} />}
//               </Box>
//               <Typography sx={{ fontSize: "0.95rem", fontWeight: isSelected ? 500 : 400, color: isSelected ? THEME_COLOR : "#1e293b", textAlign: 'left' }}>
//                 {pkgName}
//               </Typography>
//             </ButtonBase>
//           </Grid>
//         );
//       })}
//     </Grid>
//   </Box>
// );

// const Step3 = ({ formData, handleChange, setFormData, selectedCurrency, setSelectedCurrency }) => (
//   <Box>
//     <Typography variant="h5" sx={{ fontWeight: 500, color: "#0f172a", mb: 1 }}>Lead Status & Details</Typography>
//     <Typography sx={{ color: "#64748b", mb: 4 }}>Define the current status and add internal context.</Typography>

//     <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1.5 }}>Select Lead Status *</Typography>
//     <Grid container spacing={2} sx={{ mb: 4 }}>
//       {leadTypes.map((lt) => {
//         const isSelected = formData.leadType === lt.value;
//         return (
//           <Grid item xs={12} sm={6} md={4} key={lt.value}>
//             <ButtonBase
//               onClick={() => setFormData(p => ({ ...p, leadType: lt.value }))}
//               sx={{
//                 width: "100%", height: "100%", p: 2.5, borderRadius: "10px", border: "1px solid",
//                 borderColor: isSelected ? lt.color : "#e2e8f0",
//                 bgcolor: isSelected ? lt.bg : "#fff",
//                 display: "flex", flexDirection: "column", alignItems: "center", gap: 1, transition: "0.2s",
//               }}
//             >
//               <Box sx={{ color: isSelected ? lt.color : "#94a3b8" }}>{lt.icon}</Box>
//               <Typography sx={{ fontSize: "0.9rem", fontWeight: 500, color: isSelected ? lt.color : "#475569" }}>{lt.value}</Typography>
//             </ButtonBase>
//           </Grid>
//         );
//       })}
//     </Grid>

//     <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1 }}>Internal Notes *</Typography>
//     <TextField fullWidth multiline rows={4} name="note" value={formData.note} onChange={handleChange} placeholder="Enter relevant lead history or notes..." sx={{ ...fieldSx, mb: 4 }} />

//     <Grid container spacing={3}>
//       <Grid item xs={12} sm={6}>
//         <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1 }}>Pitched Amount</Typography>
//         <Box sx={{ display: "flex", gap: 1.5 }}>
//           <Select
//             value={selectedCurrency}
//             onChange={(e) => { setSelectedCurrency(e.target.value); setFormData(p => ({ ...p, currencySymbol: e.target.value })); }}
//             sx={{ width: 100, borderRadius: "8px" }}
//           >
//             {currencySymbols.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
//           </Select>
//           <TextField fullWidth name="pitchedAmount" value={formData.pitchedAmount} onChange={handleChange} placeholder="0.00" sx={fieldSx} />
//         </Box>
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1 }}>Next Follow-up</Typography>
//         <TextField fullWidth type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={fieldSx} />
//       </Grid>
//     </Grid>
//   </Box>
// );

// // --- Main Component ---

// export default function AddLeadForm() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [openSnackbar, setOpenSnackbar] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//   const [packagesList, setPackagesList] = useState([]);
//   const [selectedCurrency, setSelectedCurrency] = useState("$");

//   const [formData, setFormData] = useState({
//     leadName: "", email: "", website: "", phoneNumber: "",
//     country: "", packages: [], leadType: "", note: "",
//     pitchedAmount: "", currencySymbol: "$", followUpDate: "",
//   });

//   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

//   useEffect(() => {
//     const fetchPackages = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const { data } = await axios.get(`${API_BASE}/api/servicetypes`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setPackagesList(Array.isArray(data) ? data : []);
//       } catch {
//         setPackagesList([
//           "SEO Services", "Web Design", "PPC Ads", "Social Media",
//           "Content Writing", "Email Marketing", "App Development", "Logo Design"
//         ]);
//       }
//     };
//     fetchPackages();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({
//       ...p,
//       [name]: name === "pitchedAmount" ? value.replace(/[^0-9.]/g, "") : value,
//     }));
//   };

//   const togglePackage = (pkgName) => {
//     setFormData((prev) => ({
//       ...prev,
//       packages: prev.packages.includes(pkgName)
//         ? prev.packages.filter((x) => x !== pkgName)
//         : [...prev.packages, pkgName],
//     }));
//   };

//   const validateStep = (step) => {
//     if (step === 1) {
//       if (!formData.leadName.trim()) return showError("Lead name is required.");
//       if (!formData.phoneNumber.trim()) return showError("Phone number is required.");
//       if (!formData.country) return showError("Please select a country.");
//     }
//     if (step === 2 && !formData.packages.length) return showError("Select at least one package.");
//     if (step === 3) {
//       if (!formData.leadType) return showError("Please select a lead type.");
//       if (!formData.note.trim()) return showError("Note is required.");
//     }
//     return true;
//   };

//   const showError = (msg) => {
//     setSnackbarMessage(msg);
//     setSnackbarSeverity("error");
//     setOpenSnackbar(true);
//     return false;
//   };

//   const handleNext = () => { if (validateStep(currentStep)) setCurrentStep(s => s + 1); };

//   const handleSubmit = async () => {
//     if (!validateStep(3)) return;
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post(`${API_BASE}/api/leads/add`, formData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSnackbarMessage("Lead added successfully.");
//       setSnackbarSeverity("success");
//       setOpenSnackbar(true);
//       setCurrentStep(1);
//       setFormData({
//         leadName: "", email: "", website: "", phoneNumber: "",
//         country: "", packages: [], leadType: "", note: "",
//         pitchedAmount: "", currencySymbol: "$", followUpDate: "",
//       });
//     } catch (error) {
//       showError("Failed to add lead.");
//     }
//   };

//   return (
//     <Box sx={{ minHeight: "92vh", display: "flex", bgcolor: "#fff", fontFamily: 'Inter, sans-serif' }}>
//       <Box sx={{ width: 300, borderRight: "1px solid #f1f5f9", bgcolor: "#f8fafc", p: 4, display: { xs: "none", md: "block" } }}>
//         <ButtonBase sx={{ display: "flex", alignItems: "center", gap: 1, mb: 6, color: "#64748b", p: 1, borderRadius: 1 }}>
//           <ArrowLeft size={18} /> <Typography sx={{ fontSize: "0.9rem" }}><a href="/dashboard-caller">Back to Dashboard</a></Typography>
//         </ButtonBase>
//         {steps.map((s) => (
//           <Box key={s.id} sx={{ mb: 5, opacity: currentStep >= s.id ? 1 : 0.4, display: "flex", gap: 2.5, alignItems: 'center' }}>
//             <Box sx={{
//               width: 32, height: 32, borderRadius: "10px",
//               bgcolor: currentStep >= s.id ? THEME_COLOR : "#e2e8f0",
//               color: "#fff", display: "flex", alignItems: "center", justifyContent: "center"
//             }}>
//               {currentStep > s.id ? <Check size={18} strokeWidth={3} /> : <Typography sx={{ fontWeight: 600 }}>{s.id}</Typography>}
//             </Box>
//             <Box>
//               <Typography sx={{ fontSize: "1rem", fontWeight: currentStep === s.id ? 600 : 500, color: currentStep === s.id ? "#0f172a" : "#64748b" }}>{s.label}</Typography>
//               <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>{s.desc}</Typography>
//             </Box>
//           </Box>
//         ))}
//       </Box>

//       <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <LinearProgress variant="determinate" value={(currentStep / 3) * 100} sx={{ height: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: THEME_COLOR } }} />

//         <Box sx={{ flex: 1, p: { xs: 4, md: 8 }, maxWidth: 1000, mx: "auto", width: "100%" }}>
//           <AnimatePresence mode="wait">
//             <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
//               {currentStep === 1 && <Step1 formData={formData} handleChange={handleChange} setFormData={setFormData} />}
//               {currentStep === 2 && <Step2 formData={formData} togglePackage={togglePackage} packagesList={packagesList} />}
//               {currentStep === 3 && <Step3 formData={formData} handleChange={handleChange} setFormData={setFormData} selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />}
//             </motion.div>
//           </AnimatePresence>
//         </Box>

//         <Box sx={{ p: 3, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", px: { xs: 4, md: 10 }, bgcolor: "#fff" }}>
//           <Box>
//             {currentStep > 1 && (
//               <ButtonBase onClick={() => setCurrentStep(s => s - 1)} sx={{ px: 4, py: 1.5, borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.9rem", fontWeight: 500 }}>
//                 <ChevronLeft size={18} style={{ marginRight: 8 }} /> Back
//               </ButtonBase>
//             )}
//           </Box>
//           <ButtonBase
//             onClick={currentStep < 3 ? handleNext : handleSubmit}
//             sx={{ px: 6, py: 1.5, borderRadius: "8px", bgcolor: THEME_COLOR, color: "#fff", fontWeight: 500, fontSize: "0.9rem", transition: '0.2s', '&:hover': { bgcolor: '#0854b3' } }}
//           >
//             {currentStep < 3 ? "Continue" : "Complete Lead"} <ChevronRight size={18} style={{ marginLeft: 8 }} />
//           </ButtonBase>
//         </Box>
//       </Box>

//       <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
//         <Alert severity={snackbarSeverity} variant="filled" sx={{ width: "100%", borderRadius: '8px' }}>{snackbarMessage}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }






import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  Typography,
  Grid,
  Box,
  Snackbar,
  Alert,
  InputAdornment,
  LinearProgress,
  ButtonBase,
} from "@mui/material";
import {
  Users,
  Globe,
  Phone,
  Mail,
  Flame,
  PhoneCall,
  Clock,
  Zap,
  CheckCheck,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Check,
  UserPlus,
} from "lucide-react";

// --- Static Data ---
const countries = [
  "USA", "India", "UK", "Canada", "Australia", "Germany",
  "France", "Japan", "China", "Brazil", "South Africa", "Mexico",
];

const currencySymbols = ["$", "€", "₹", "£", "¥", "₽", "₺", "₩", "₱"];

const leadTypes = [
  { value: "Hot Lead", color: "#ef4444", bg: "#fef2f2", icon: <Flame size={20} />, desc: "High-intent" },
  { value: "Contacted", color: "#3b82f6", bg: "#eff6ff", icon: <CheckCheck size={20} />, desc: "In communication" },
  { value: "Contact in Future", color: "#8b5cf6", bg: "#f5f3ff", icon: <Clock size={20} />, desc: "Schedule for later" },
  { value: "Callback", color: "#f59e0b", bg: "#fffbeb", icon: <PhoneCall size={20} />, desc: "Callback requested" },
  { value: "New Lead", color: "#10b981", bg: "#ecfdf5", icon: <Zap size={20} />, desc: "Fresh, uncontacted" },
];

const steps = [
  { id: 1, label: "Contact Info", desc: "Name & location" },
  { id: 2, label: "Packages", desc: "Service selection" },
  { id: 3, label: "Lead Details", desc: "Notes & financials" },
];

const THEME_COLOR = "#0a68da";
const THEME_LIGHT = "rgba(10, 104, 218, 0.04)";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    background: "#fff",
    fontSize: "0.95rem",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: THEME_COLOR, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { color: "#64748b" },
};

// --- Sub-Components ---

const Step1 = ({ formData, handleChange, setFormData }) => (
  <Box>
    <Typography variant="h5" sx={{ fontWeight: 500, color: "#0f172a", mb: 1 }}>Contact Information</Typography>
    <Typography sx={{ color: "#64748b", mb: 4 }}>Primary details for the new lead engagement.</Typography>

    <Grid container spacing={3}>
      {[
        { label: "Lead Name", name: "leadName", icon: <Users size={18} />, required: true },
        { label: "Phone Number", name: "phoneNumber", icon: <Phone size={18} />, required: true },
        { label: "Email Address", name: "email", icon: <Mail size={18} /> },
        { label: "Website", name: "website", icon: <Globe size={18} /> },
      ].map((f) => (
        <Grid item xs={12} sm={6} key={f.name}>
          <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1, fontWeight: 400 }}>
            {f.label} {f.required && "*"}
          </Typography>
          <TextField
            fullWidth
            name={f.name}
            value={formData[f.name]}
            onChange={handleChange}
            placeholder={`Enter ${f.label.toLowerCase()}`}
            InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mr: 1 }}>{f.icon}</InputAdornment> }}
            sx={fieldSx}
          />
        </Grid>
      ))}
      <Grid item xs={12} sm={6}>
        <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1 }}>Country *</Typography>
        <Autocomplete
          options={countries}
          value={formData.country}
          onChange={(_, v) => setFormData(p => ({ ...p, country: v || "" }))}
          renderInput={(params) => <TextField {...params} placeholder="Search country..." sx={fieldSx} />}
        />
      </Grid>
    </Grid>
  </Box>
);

const Step2 = ({ formData, togglePackage, packagesList }) => (
  <Box>
    <Typography variant="h5" sx={{ fontWeight: 500, color: "#0f172a", mb: 1 }}>Service Packages</Typography>
    <Typography sx={{ color: "#64748b", mb: 4 }}>Select all services this lead is interested in.</Typography>
    <Grid container spacing={2}>
      {packagesList.map((pkg, idx) => {
        const pkgName = typeof pkg === "string" ? pkg : (pkg.serviceName || pkg.name || `Service ${idx}`);
        const isSelected = formData.packages.includes(pkgName);
        return (
          <Grid item xs={12} sm={6} md={4} key={pkgName}>
            <ButtonBase
              onClick={() => togglePackage(pkgName)}
              sx={{
                width: "100%", height: "100%", minHeight: "80px", p: 2, borderRadius: "10px",
                border: "1px solid", borderColor: isSelected ? THEME_COLOR : "#e2e8f0",
                bgcolor: isSelected ? THEME_LIGHT : "#fff",
                display: "flex", justifyContent: "flex-start", gap: 2, transition: "0.2s",
                "&:hover": { borderColor: THEME_COLOR, bgcolor: THEME_LIGHT }
              }}
            >
              <Box sx={{
                width: 22, height: 22, borderRadius: "6px", border: "2px solid",
                borderColor: isSelected ? THEME_COLOR : "#cbd5e1",
                bgcolor: isSelected ? THEME_COLOR : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {isSelected && <Check size={14} color="#fff" strokeWidth={4} />}
              </Box>
              <Typography sx={{ fontSize: "0.95rem", fontWeight: isSelected ? 500 : 400, color: isSelected ? THEME_COLOR : "#1e293b", textAlign: 'left' }}>
                {pkgName}
              </Typography>
            </ButtonBase>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);

const Step3 = ({ formData, handleChange, setFormData, selectedCurrency, setSelectedCurrency, usersList }) => (
  <Box>
    <Typography variant="h5" sx={{ fontWeight: 500, color: "#0f172a", mb: 1 }}>Lead Status & Details</Typography>
    <Typography sx={{ color: "#64748b", mb: 4 }}>Define the current status and add internal context.</Typography>

    <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1.5 }}>Select Lead Status *</Typography>
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {leadTypes.map((lt) => {
        const isSelected = formData.leadType === lt.value;
        return (
          <Grid item xs={12} sm={6} md={4} key={lt.value}>
            <ButtonBase
              onClick={() => setFormData(p => ({ ...p, leadType: lt.value }))}
              sx={{
                width: "100%", height: "100%", p: 2.5, borderRadius: "10px", border: "1px solid",
                borderColor: isSelected ? lt.color : "#e2e8f0",
                bgcolor: isSelected ? lt.bg : "#fff",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 1, transition: "0.2s",
              }}
            >
              <Box sx={{ color: isSelected ? lt.color : "#94a3b8" }}>{lt.icon}</Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 500, color: isSelected ? lt.color : "#475569" }}>{lt.value}</Typography>
            </ButtonBase>
          </Grid>
        );
      })}
    </Grid>

    <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1 }}>Internal Notes *</Typography>
    <TextField fullWidth multiline rows={4} name="note" value={formData.note} onChange={handleChange} placeholder="Enter relevant lead history or notes..." sx={{ ...fieldSx, mb: 4 }} />

    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1 }}>Pitched Amount</Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Select
            value={selectedCurrency}
            onChange={(e) => { setSelectedCurrency(e.target.value); setFormData(p => ({ ...p, currencySymbol: e.target.value })); }}
            sx={{ width: 100, borderRadius: "8px" }}
          >
            {currencySymbols.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
          <TextField fullWidth name="pitchedAmount" value={formData.pitchedAmount} onChange={handleChange} placeholder="0.00" sx={fieldSx} />
        </Box>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography sx={{ fontSize: "0.85rem", color: "#475569", mb: 1 }}>Next Follow-up</Typography>
        <TextField fullWidth type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={fieldSx} />
      </Grid>

      {/* Assignment Section (Optional) */}
      <Grid item xs={12}>
        <Box sx={{ 
          p: 3, 
          mt: 2, 
          borderRadius: "12px", 
          bgcolor: "#f8fafc", 
          border: "1px dashed", 
          borderColor: "#cbd5e1" 
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <UserPlus size={18} color={THEME_COLOR} />
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b" }}>
              Transfer Lead to Admin/Manager (Optional)
            </Typography>
          </Box>
          <Autocomplete
            options={usersList}
            getOptionLabel={(option) => `${option.username} (${option.email})`}
            value={usersList.find(u => u._id === formData.assignedTo) || null}
            onChange={(_, newValue) => {
              setFormData(p => ({ ...p, assignedTo: newValue ? newValue._id : "" }));
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="Search by name or email..." 
                sx={fieldSx} 
              />
            )}
          />
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 1, ml: 0.5 }}>
            Leave blank if you don't want to assign this lead immediately.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

// --- Main Component ---

export default function AddLeadForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [packagesList, setPackagesList] = useState([]);
  const [usersList, setUsersList] = useState([]); // New state for assignable users
  const [selectedCurrency, setSelectedCurrency] = useState("$");

  const [formData, setFormData] = useState({
    leadName: "", email: "", website: "", phoneNumber: "",
    country: "", packages: [], leadType: "", note: "",
    pitchedAmount: "", currencySymbol: "$", followUpDate: "",
    assignedTo: "", // New field
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Packages
      try {
        const { data } = await axios.get(`${API_BASE}/api/servicetypes`, { headers });
        setPackagesList(Array.isArray(data) ? data : []);
      } catch {
        setPackagesList([
          "SEO Services", "Web Design", "PPC Ads", "Social Media",
          "Content Writing", "Email Marketing", "App Development", "Logo Design"
        ]);
      }

      // 2. Fetch Assignable Users (Admins/Managers)
      try {
        const { data } = await axios.get(`${API_BASE}/api/auth/admins-managers`, { headers });
        setUsersList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching assignable users:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: name === "pitchedAmount" ? value.replace(/[^0-9.]/g, "") : value,
    }));
  };

  const togglePackage = (pkgName) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.includes(pkgName)
        ? prev.packages.filter((x) => x !== pkgName)
        : [...prev.packages, pkgName],
    }));
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.leadName.trim()) return showError("Lead name is required.");
      if (!formData.phoneNumber.trim()) return showError("Phone number is required.");
      if (!formData.country) return showError("Please select a country.");
    }
    if (step === 2 && !formData.packages.length) return showError("Select at least one package.");
    if (step === 3) {
      if (!formData.leadType) return showError("Please select a lead type.");
      if (!formData.note.trim()) return showError("Note is required.");
    }
    return true;
  };

  const showError = (msg) => {
    setSnackbarMessage(msg);
    setSnackbarSeverity("error");
    setOpenSnackbar(true);
    return false;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep(s => s + 1); };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/api/leads/add`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Lead added successfully.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setCurrentStep(1);
      setFormData({
        leadName: "", email: "", website: "", phoneNumber: "",
        country: "", packages: [], leadType: "", note: "",
        pitchedAmount: "", currencySymbol: "$", followUpDate: "",
        assignedTo: ""
      });
    } catch (error) {
      showError("Failed to add lead.");
    }
  };

  return (
    <Box sx={{ minHeight: "92vh", display: "flex", bgcolor: "#fff", fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar Navigation */}
      <Box sx={{ width: 300, borderRight: "1px solid #f1f5f9", bgcolor: "#f8fafc", p: 4, display: { xs: "none", md: "block" } }}>
        <ButtonBase sx={{ display: "flex", alignItems: "center", gap: 1, mb: 6, color: "#64748b", p: 1, borderRadius: 1 }}>
          <ArrowLeft size={18} /> <Typography sx={{ fontSize: "0.9rem" }}><a href="/dashboard-caller" style={{ textDecoration: 'none', color: 'inherit' }}>Back to Dashboard</a></Typography>
        </ButtonBase>
        {steps.map((s) => (
          <Box key={s.id} sx={{ mb: 5, opacity: currentStep >= s.id ? 1 : 0.4, display: "flex", gap: 2.5, alignItems: 'center' }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: "10px",
              bgcolor: currentStep >= s.id ? THEME_COLOR : "#e2e8f0",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {currentStep > s.id ? <Check size={18} strokeWidth={3} /> : <Typography sx={{ fontWeight: 600 }}>{s.id}</Typography>}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1rem", fontWeight: currentStep === s.id ? 600 : 500, color: currentStep === s.id ? "#0f172a" : "#64748b" }}>{s.label}</Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>{s.desc}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <LinearProgress variant="determinate" value={(currentStep / 3) * 100} sx={{ height: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: THEME_COLOR } }} />

        <Box sx={{ flex: 1, p: { xs: 4, md: 8 }, maxWidth: 1000, mx: "auto", width: "100%" }}>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {currentStep === 1 && <Step1 formData={formData} handleChange={handleChange} setFormData={setFormData} />}
              {currentStep === 2 && <Step2 formData={formData} togglePackage={togglePackage} packagesList={packagesList} />}
              {currentStep === 3 && (
                <Step3 
                  formData={formData} 
                  handleChange={handleChange} 
                  setFormData={setFormData} 
                  selectedCurrency={selectedCurrency} 
                  setSelectedCurrency={setSelectedCurrency}
                  usersList={usersList} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 3, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", px: { xs: 4, md: 10 }, bgcolor: "#fff" }}>
          <Box>
            {currentStep > 1 && (
              <ButtonBase onClick={() => setCurrentStep(s => s - 1)} sx={{ px: 4, py: 1.5, borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.9rem", fontWeight: 500 }}>
                <ChevronLeft size={18} style={{ marginRight: 8 }} /> Back
              </ButtonBase>
            )}
          </Box>
          <ButtonBase
            onClick={currentStep < 3 ? handleNext : handleSubmit}
            sx={{ px: 6, py: 1.5, borderRadius: "8px", bgcolor: THEME_COLOR, color: "#fff", fontWeight: 500, fontSize: "0.9rem", transition: '0.2s', '&:hover': { bgcolor: '#0854b3' } }}
          >
            {currentStep < 3 ? "Continue" : "Complete Lead"} <ChevronRight size={18} style={{ marginLeft: 8 }} />
          </ButtonBase>
        </Box>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={snackbarSeverity} variant="filled" sx={{ width: "100%", borderRadius: '8px' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}