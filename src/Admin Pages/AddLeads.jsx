import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown
} from "lucide-react";

// --- Static Data Mapped to Strict System Colors ---
const countries = [
  "USA", "India", "UK", "Canada", "Australia", "Germany",
  "France", "Japan", "China", "Brazil", "South Africa", "Mexico",
];

const currencySymbols = ["$", "€", "₹", "£", "¥", "₽", "₺", "₩", "₱"];

const leadTypes = [
  { value: "Hot Lead", color: "#D1242F", icon: <Flame size={18} />, desc: "High-intent" },
  { value: "Contacted", color: "#0969DA", icon: <CheckCheck size={18} />, desc: "In communication" },
  { value: "Contact in Future", color: "#656D76", icon: <Clock size={18} />, desc: "Schedule later" },
  { value: "Callback", color: "#BF8700", icon: <PhoneCall size={18} />, desc: "Requested" },
  { value: "New Lead", color: "#1A7F37", icon: <Zap size={18} />, desc: "Fresh, uncontacted" },
];

const steps = [
  { id: 1, label: "Contact Info", desc: "Name & location" },
  { id: 2, label: "Packages", desc: "Service selection" },
  { id: 3, label: "Lead Details", desc: "Notes & financials" },
];

// --- Sub-Components (Compressed for 1-Page Fit) ---

const Step1 = ({ formData, handleChange, setFormData }) => (
  <div className="flex flex-col h-full relative z-10">
    <div className="mb-4 border-b border-[#D1DCEB]/50 pb-3 shrink-0">
      <h2 className="text-xl font-bold text-[#1F2328] mb-1">Contact Information</h2>
      <p className="text-xs font-bold text-[#656D76]">Primary details for the new lead engagement.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 relative z-20">
      {[
        { label: "Lead Name", name: "leadName", icon: <Users size={16} />, required: true },
        { label: "Phone Number", name: "phoneNumber", icon: <Phone size={16} />, required: true },
        { label: "Email Address", name: "email", icon: <Mail size={16} /> },
        { label: "Website", name: "website", icon: <Globe size={16} /> },
      ].map((f) => (
        <div key={f.name} className="relative z-20">
          <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">
            {f.label} {f.required && <span className="text-[#D1242F]">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30">
              {f.icon}
            </div>
            <input
              type="text"
              name={f.name}
              value={formData[f.name]}
              onChange={handleChange}
              placeholder={`Enter ${f.label.toLowerCase()}`}
              className="w-full neu-pressed rounded-md p-2.5 pl-9 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
            />
          </div>
        </div>
      ))}
      
      <div className="relative z-20 sm:col-span-2 md:col-span-1">
        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">
          Country <span className="text-[#D1242F]">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30">
            <Globe size={16} />
          </div>
          <select
            name="country"
            value={formData.country}
            onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))}
            className="w-full neu-pressed rounded-md p-2.5 pl-9 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20"
          >
            <option value="" disabled>Select a country...</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Step2 = ({ formData, togglePackage, packagesList }) => (
  <div className="flex flex-col h-full relative z-10">
    <div className="mb-4 border-b border-[#D1DCEB]/50 pb-3 shrink-0">
      <h2 className="text-xl font-bold text-[#1F2328] mb-1">Service Packages</h2>
      <p className="text-xs font-bold text-[#656D76]">Select all services this lead is interested in.</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 relative z-20">
      {packagesList.map((pkg, idx) => {
        const pkgName = typeof pkg === "string" ? pkg : (pkg.serviceName || pkg.name || `Service ${idx}`);
        const isSelected = formData.packages.includes(pkgName);
        return (
          <button
            type="button"
            key={pkgName}
            onClick={() => togglePackage(pkgName)}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 text-left neu-action-btn relative z-20 ${
              isSelected ? "neu-pressed border-l-4 border-[#0969DA]" : "neu-flat hover:bg-[#D1DCEB]/10"
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
              isSelected ? "neu-btn-primary text-white" : "neu-pressed-sm text-transparent"
            }`}>
              <Check size={12} strokeWidth={4} />
            </div>
            <span className={`text-xs ${isSelected ? "font-bold text-[#0969DA]" : "font-bold text-[#1F2328]"}`}>
              {pkgName}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const Step3 = ({ formData, handleChange, setFormData, selectedCurrency, setSelectedCurrency }) => (
  <div className="flex flex-col h-full relative z-10">
    <div className="mb-4 border-b border-[#D1DCEB]/50 pb-3 shrink-0">
      <h2 className="text-xl font-bold text-[#1F2328] mb-1">Lead Status & Details</h2>
      <p className="text-xs font-bold text-[#656D76]">Define current status and add internal context.</p>
    </div>

    <div className="flex flex-col gap-4 relative z-20">
      <div className="relative z-20">
        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">
          Lead Status <span className="text-[#D1242F]">*</span>
        </label>
        <div className="grid grid-cols-5 gap-3">
          {leadTypes.map((lt) => {
            const isSelected = formData.leadType === lt.value;
            return (
              <button
                type="button"
                key={lt.value}
                onClick={() => setFormData(p => ({ ...p, leadType: lt.value }))}
                className={`p-2 rounded-lg flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 neu-action-btn relative z-20 ${
                  isSelected ? "neu-pressed" : "neu-flat hover:bg-[#D1DCEB]/10"
                }`}
              >
                <div 
                  className={`p-2 rounded-full ${isSelected ? 'neu-flat text-current' : 'neu-pressed-sm text-[#656D76]'}`} 
                  style={{ color: isSelected ? lt.color : undefined }}
                >
                  {lt.icon}
                </div>
                <div>
                  <p className={`text-[10px] font-bold`} style={{ color: isSelected ? lt.color : '#1F2328' }}>{lt.value}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-20">
        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">
          Internal Notes <span className="text-[#D1242F]">*</span>
        </label>
        <textarea
          name="note"
          rows="2"
          value={formData.note}
          onChange={handleChange}
          placeholder="Relevant lead history or notes..."
          className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20 resize-none custom-scrollbar"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-20">
        <div className="relative z-20">
          <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">
            Pitched Amount
          </label>
          <div className="flex gap-2">
            <div className="relative w-20 shrink-0">
              <select
                value={selectedCurrency}
                onChange={(e) => { setSelectedCurrency(e.target.value); setFormData(p => ({ ...p, currencySymbol: e.target.value })); }}
                className="w-full neu-pressed rounded-md p-2.5 pr-6 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20 text-center"
              >
                {currencySymbols.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
            </div>
            <input
              type="text"
              name="pitchedAmount"
              value={formData.pitchedAmount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full neu-pressed rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
            />
          </div>
        </div>
        
        <div className="relative z-20">
          <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">
            Next Follow-up
          </label>
          <input
            type="date"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
            className="w-full neu-pressed rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20"
          />
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---

export default function AddLeadForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [packagesList, setPackagesList] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("$");

  const [formData, setFormData] = useState({
    leadName: "", email: "", website: "", phoneNumber: "",
    country: "", packages: [], leadType: "", note: "",
    pitchedAmount: "", currencySymbol: "$", followUpDate: "",
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/servicetypes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPackagesList(Array.isArray(data) ? data : []);
      } catch {
        setPackagesList([
          "SEO Services", "Web Design", "PPC Ads", "Social Media",
          "Content Writing", "Email Marketing", "App Development", "Logo Design"
        ]);
      }
    };
    fetchPackages();
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
      });
    } catch (error) {
      showError("Failed to add lead.");
    }
  };

  return (
    // STRICT `h-screen` and `overflow-hidden` ensures it fits strictly on one page
    <div className="w-full h-[94vh] overflow-hidden neu-base flex flex-col md:flex-row montserrat-regular text-[#1F2328] relative">
      
      {/* ── Sidebar Progress ── */}
      <div className="w-full md:w-72 h-auto md:h-full p-4 sm:p-6 flex flex-col gap-6 shrink-0 relative z-10 border-b md:border-b-0 md:border-r border-[#D1DCEB]/50">
        <a href="/dashboard-admin" className="neu-flat-sm neu-action-btn w-fit px-4 py-2 rounded-lg flex items-center gap-2 text-[#656D76] hover:text-[#1F2328]">
          <ArrowLeft size={16} className="pointer-events-none" /> 
          <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
        </a>
        
        <div className="flex md:flex-col gap-4 overflow-x-hidden md:overflow-visible flex-1">
          {steps.map((s) => {
            const isCompleted = currentStep > s.id;
            const isActive = currentStep === s.id;
            const isPending = currentStep < s.id;
            
            return (
              <div key={s.id} className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'} min-w-[160px] md:min-w-0`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? "neu-flat text-[#0969DA]" : isCompleted ? "neu-btn-primary text-white" : "neu-pressed text-[#656D76]"
                }`}>
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-bold">{s.id}</span>}
                </div>
                <div>
                  <p className={`text-xs font-bold ${isActive ? "text-[#1F2328]" : "text-[#656D76]"}`}>{s.label}</p>
                  <p className="text-[9px] font-bold text-[#656D76] uppercase tracking-wider mt-0.5">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Form Area ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-full overflow-hidden">
        
        {/* Progress Bar Header */}
        <div className="p-4 sm:p-6 pb-2 shrink-0">
          <div className="h-1.5 rounded-full neu-pressed-sm overflow-hidden w-full max-w-4xl mx-auto">
             <motion.div 
               className="h-full rounded-full bg-[#0969DA]"
               initial={{ width: "33%" }}
               animate={{ width: `${(currentStep / 3) * 100}%` }}
               transition={{ duration: 0.3 }}
             />
          </div>
        </div>

        {/* Dynamic Form Step Container */}
        <div className="flex-1 p-4 sm:p-6 min-h-0 flex flex-col w-full max-w-4xl mx-auto">
          <div className="neu-flat rounded-2xl p-5 sm:p-8 flex-1 flex flex-col overflow-hidden relative z-20">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentStep} 
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }} 
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {currentStep === 1 && <Step1 formData={formData} handleChange={handleChange} setFormData={setFormData} />}
                {currentStep === 2 && <Step2 formData={formData} togglePackage={togglePackage} packagesList={packagesList} />}
                {currentStep === 3 && <Step3 formData={formData} handleChange={handleChange} setFormData={setFormData} selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 pt-3 shrink-0 border-t border-[#D1DCEB]/50 flex justify-between items-center max-w-4xl mx-auto w-full relative z-20">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(s => s - 1)} 
                className="neu-flat neu-action-btn px-5 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold text-[#656D76]"
              >
                <ChevronLeft size={16} className="pointer-events-none" /> Back
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={currentStep < 3 ? handleNext : handleSubmit}
            className="neu-btn-primary px-6 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold text-white neu-action-btn"
          >
            {currentStep < 3 ? "Continue Step" : "Save Lead"} 
            <ChevronRight size={16} className="pointer-events-none" />
          </button>
        </div>
      </div>

      {/* ── Custom Snackbar ── */}
      <AnimatePresence>
        {openSnackbar && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[999] flex items-center gap-4 neu-flat rounded-xl p-4 montserrat-medium max-w-sm"
          >
            <div className={`neu-pressed-sm p-2 rounded-full shrink-0 ${snackbarSeverity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
               {snackbarSeverity === 'error' ? <Flame size={16} /> : <CheckCheck size={16} />}
            </div>
            <span className={`text-xs font-bold ${snackbarSeverity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
              {snackbarMessage}
            </span>
            <button
              type="button"
              onClick={() => setOpenSnackbar(false)}
              className="neu-flat-sm neu-action-btn rounded-lg p-1.5 text-[#656D76] ml-auto shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neumorphic CSS Rules & Bug Fixes */}
      <style>{`
        :root {
          --neu-bg: #F0F4F8; 
          --neu-light: #FFFFFF;
          --neu-dark: #D1DCEB;
        }
        .neu-base { background-color: var(--neu-bg); }
        .neu-flat {
          background-color: var(--neu-bg);
          box-shadow: 5px 5px 10px var(--neu-dark), -5px -5px 10px var(--neu-light);
        }
        .neu-flat-sm {
          background-color: var(--neu-bg);
          box-shadow: 2px 2px 5px var(--neu-dark), -2px -2px 5px var(--neu-light);
        }
        .neu-pressed {
          background-color: var(--neu-bg);
          box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
        }
        .neu-pressed-sm {
          background-color: var(--neu-bg);
          box-shadow: inset 1.5px 1.5px 3px var(--neu-dark), inset -1.5px -1.5px 3px var(--neu-light);
        }
        
        /* Force Input Clickability and Text Selection globally over any wrapper rules */
        input, textarea, select {
          position: relative;
          z-index: 20;
          pointer-events: auto !important;
          user-select: text !important;
          -webkit-user-select: text !important;
        }
        
        select {
          cursor: pointer !important;
          -moz-appearance: none; 
          -webkit-appearance: none; 
          appearance: none;
        }

        /* Fixed Interactive Buttons to Ensure Clickability */
        .neu-action-btn { 
          cursor: pointer; 
          transition: all 0.2s ease; 
          position: relative;
          z-index: 20;
          user-select: none;
          -webkit-user-select: none;
        }
        .neu-action-btn:active:not(:disabled) {
          box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light) !important;
        }
        .neu-btn-primary {
          background-color: #0969DA;
          box-shadow: 3px 3px 8px rgba(9, 105, 218, 0.3);
          border: none;
          position: relative;
          z-index: 20;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }
        .neu-btn-primary:active:not(:disabled) {
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
        }

        /* Prevent SVG Icons from intercepting parent button clicks */
        button svg {
          pointer-events: none !important;
        }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px var(--neu-bg) inset !important;
          -webkit-text-fill-color: #1F2328 !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </div>
  );
}