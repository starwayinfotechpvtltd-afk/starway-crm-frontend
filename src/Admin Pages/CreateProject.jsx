import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Settings, 
  Briefcase, 
  User, 
  CheckCircle,
  Trash2,
  ChevronDown,
  Plus,
  Loader2,
  AlertCircle,
  Layers
} from "lucide-react";

export default function CreateProject() {
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

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
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
          headers: { Authorization: `Bearer ${token}` },
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
          headers: { Authorization: `Bearer ${token}` },
        });
        setServiceTypes(response.data.map((st) => st.name));
      } catch (error) {
        console.error("Failed to fetch service types:", error);
      }
    };
    fetchServiceTypes();
  }, []);

  // Custom Snackbar Auto-Hide
  useEffect(() => {
    if (snackbarOpen) {
      const timer = setTimeout(() => setSnackbarOpen(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbarOpen]);

  const toggleDeveloper = (dev) => {
    const isSelected = assignedDevelopers.some((d) => d.username === dev.username);
    if (isSelected) {
      setAssignedDevelopers(assignedDevelopers.filter((d) => d.username !== dev.username));
    } else {
      setAssignedDevelopers([...assignedDevelopers, { id: dev._id, username: dev.username }]);
    }
  };

  const toggleService = (type) => {
    if (serviceType.includes(type)) {
      setServiceType(serviceType.filter((t) => t !== type));
    } else {
      setServiceType([...serviceType, type]);
    }
  };

  const showSnackbar = (msg, sev) => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(sev);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || !clientName.trim() || !clientEmail.trim() || !amount.trim()) {
      showSnackbar("Please fill in all required fields.", "error");
      return;
    }
    
    setIsSubmitting(true);
    const projectData = {
      projectName, projectDetails, clientName, clientEmail,
      clientNumber, amount, assignedDeveloper: assignedDevelopers,
      serviceType, referenceSite, businessNiche, comments,
      subscriptionType, createdDate: new Date(),
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) return setIsSubmitting(false);

      const response = await axios.post(`${API_BASE}/api/newproject/projects`, projectData, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 201) {
        setProjectName(""); setProjectDetails(""); setClientName(""); setClientEmail("");
        setClientNumber(""); setAmount(""); setAssignedDevelopers([]); setServiceType([]);
        setReferenceSite(""); setBusinessNiche(""); setComments(""); setSubscriptionType("One-Time");
        showSnackbar("Project created successfully!", "success");
      } else {
        showSnackbar("Failed to create project", "error");
      }
    } catch (error) {
      showSnackbar(`Error: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateServiceType = async () => {
    if (!newServiceType.trim()) return;
    setIsServiceAdding(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_BASE}/api/servicetypes`, { name: newServiceType }, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        setServiceTypes([...serviceTypes, newServiceType]);
        setNewServiceType("");
      }
    } catch (error) {
      console.error("Failed to create service type:", error);
    } finally {
      setIsServiceAdding(false);
    }
  };

  const handleDeleteServiceType = async (type) => {
    setIsServiceDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_BASE}/api/servicetypes/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setServiceTypes(serviceTypes.filter((st) => st !== type));
        setServiceType(serviceType.filter((st) => st !== type));
      }
    } catch (error) {
      console.error("Failed to delete service type:", error);
    } finally {
      setIsServiceDeleting(false);
      setDeletePopupOpen(false);
      setServiceTypeToDelete(null);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden neu-base flex flex-col montserrat-regular text-[#1F2328] relative">
      
      {/* ── Scrollable Form Container ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:px-8 relative z-10">
        <form id="createProjectForm" onSubmit={handleSubmit} className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8 pb-12">
          
          {/* ── LEFT COLUMN (Main Form) ── */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Section: Project Information */}
            <div className="neu-flat rounded-2xl p-6 sm:p-8">
              <h2 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[#D1DCEB]/50 pb-3">
                <Briefcase size={16} /> Project Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Project Name <span className="text-[#D1242F]">*</span></label>
                  <input required type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Acme Corp Redesign" className="w-full neu-pressed rounded-md p-3.5 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                </div>
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Subscription Type <span className="text-[#D1242F]">*</span></label>
                  <div className="relative">
                    <select required value={subscriptionType} onChange={(e) => setSubscriptionType(e.target.value)} className="w-full neu-pressed rounded-md p-3.5 pr-10 text-sm font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20">
                      <option value="One-Time">One-Time</option>
                      <option value="Subscription-Based">Subscription-Based</option>
                      <option value="Website-Based">Website-Based</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30" />
                  </div>
                </div>
                <div className="md:col-span-2 relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Description</label>
                  <textarea rows={3} value={projectDetails} onChange={(e) => setProjectDetails(e.target.value)} placeholder="High level overview of the project goals..." className="w-full neu-pressed rounded-md p-3.5 text-sm font-medium text-[#1F2328] outline-none cursor-text resize-none custom-scrollbar relative z-20" />
                </div>
              </div>
            </div>

            {/* Section: Client Details */}
            <div className="neu-flat rounded-2xl p-6 sm:p-8">
              <h2 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[#D1DCEB]/50 pb-3">
                <User size={16} /> Client Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Client Name <span className="text-[#D1242F]">*</span></label>
                  <input required type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Full Name" className="w-full neu-pressed rounded-md p-3.5 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                </div>
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Client Email <span className="text-[#D1242F]">*</span></label>
                  <input required type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="email@example.com" className="w-full neu-pressed rounded-md p-3.5 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                </div>
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Client Number <span className="text-[#D1242F]">*</span></label>
                  <input required type="text" value={clientNumber} onChange={(e) => setClientNumber(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full neu-pressed rounded-md p-3.5 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                </div>
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Deal Amount <span className="text-[#D1242F]">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] font-bold pointer-events-none z-30">$</span>
                    <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full neu-pressed rounded-md p-3.5 pl-8 text-sm font-bold text-[#1A7F37] outline-none cursor-text relative z-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Specifications & Assignments */}
            <div className="neu-flat rounded-2xl p-6 sm:p-8">
              <h2 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[#D1DCEB]/50 pb-3">
                <Settings size={16} /> Specifications & Assignments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                
                {/* Ref Site & Niche */}
                <div className="space-y-6">
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Reference Site (URL)</label>
                    <input type="text" value={referenceSite} onChange={(e) => setReferenceSite(e.target.value)} placeholder="https://" className="w-full neu-pressed rounded-md p-3.5 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                  </div>
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Business Niche</label>
                    <input type="text" value={businessNiche} onChange={(e) => setBusinessNiche(e.target.value)} placeholder="e.g. Real Estate, E-commerce" className="w-full neu-pressed rounded-md p-3.5 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20" />
                  </div>
                </div>

                {/* Developer Assignees Checklist */}
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Assign Developers</label>
                  <div className="neu-pressed rounded-xl p-3 h-[155px] overflow-y-auto custom-scrollbar space-y-1 relative z-20">
                    {developers.map((dev) => {
                      const isSelected = assignedDevelopers.some(d => d.username === dev.username);
                      return (
                        <label key={dev._id} className={`flex items-center px-4 py-2.5 cursor-pointer rounded-lg transition-all duration-200 relative z-20 ${isSelected ? "neu-flat bg-[#F0F4F8]" : "hover:bg-[#D1DCEB]/20"}`}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleDeveloper(dev)} className="w-4 h-4 accent-[#0969DA] cursor-pointer relative z-30" />
                          <span className={`ml-3 text-sm transition-colors ${isSelected ? "font-bold text-[#0969DA]" : "font-medium text-[#1F2328]"}`}>{dev.username}</span>
                        </label>
                      );
                    })}
                    {developers.length === 0 && <p className="text-center text-xs text-[#656D76] italic mt-4">No developers found.</p>}
                  </div>
                </div>

                {/* Final Notes */}
                <div className="md:col-span-2 relative z-20 mt-2">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Internal Comments</label>
                  <textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Add any special instructions or requirements..." className="w-full neu-pressed rounded-md p-3.5 text-sm font-medium text-[#1F2328] outline-none cursor-text resize-none custom-scrollbar relative z-20" />
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN (Sidebar) ── */}
          <div className="xl:col-span-1 relative z-20">
            <div className="sticky top-0 space-y-8">
              {/* Section: Required Services */}
              <div className="neu-flat rounded-2xl p-6 sm:p-8">
                <div className="flex justify-between items-center border-b border-[#D1DCEB]/50 pb-3 mb-5">
                  <h2 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider flex items-center gap-2">
                    <Layers size={16} /> Required Services
                  </h2>
                  <button type="button" onClick={() => setIsServiceModalOpen(true)} className="text-[10px] font-bold text-[#0969DA] uppercase tracking-wider hover:underline flex items-center gap-1 neu-action-btn relative z-30">
                    <Settings size={12} className="pointer-events-none" /> Manage
                  </button>
                </div>
                
                <div className="neu-pressed rounded-xl p-5 min-h-[150px] flex flex-wrap gap-3 items-start relative z-20">
                  {serviceTypes.map(type => {
                    const isSelected = serviceType.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => toggleService(type)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all neu-action-btn relative z-30 ${
                          isSelected ? "neu-pressed border border-[#0969DA] text-[#0969DA] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]" : "neu-flat text-[#656D76] hover:text-[#1F2328]"
                        }`}
                      >
                        {type}
                      </button>
                    )
                  })}
                  {serviceTypes.length === 0 && <p className="text-center w-full text-xs text-[#656D76] italic mt-2">No services configured.</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER ACTIONS (Non-Sticky, flows at the bottom of the grid) ── */}
          <div className="xl:col-span-3 flex justify-end gap-4 pt-6 border-t border-[#D1DCEB]/50 relative z-20">
            <button type="button" onClick={() => document.getElementById("createProjectForm").reset()} className="neu-flat neu-action-btn px-6 py-3 rounded-lg text-sm font-bold text-[#656D76]">
              Reset Form
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="neu-btn-primary px-8 py-3 rounded-lg text-sm font-bold text-white neu-action-btn flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin pointer-events-none" /> Creating...</> : "Finalize & Create Project"}
            </button>
          </div>

        </form>
      </div>

      {/* ── MODALS ── */}

      {/* 1. Manage Services Modal */}
      <AnimatePresence>
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsServiceModalOpen(false)} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-md flex flex-col relative z-10 max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#1F2328]">Configure Services</h2>
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="neu-flat-sm neu-action-btn rounded-full p-2 text-[#656D76] hover:text-[#D1242F]">
                  <X size={18} className="pointer-events-none" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* Add New */}
                <div className="neu-pressed rounded-xl p-5 relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-3 block">Add New Service</label>
                  <div className="flex gap-3 relative z-30">
                    <input 
                      type="text" 
                      placeholder="e.g. SEO Optimization" 
                      value={newServiceType} 
                      onChange={(e) => setNewServiceType(e.target.value)} 
                      onKeyDown={(e) => { if (e.key === "Enter" && newServiceType.trim() && !isServiceAdding) { e.preventDefault(); handleCreateServiceType(); } }}
                      className="flex-1 neu-flat-sm rounded-lg p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-40" 
                    />
                    <button 
                      type="button" 
                      disabled={!newServiceType.trim() || isServiceAdding} 
                      onClick={handleCreateServiceType} 
                      className="neu-btn-primary px-5 rounded-lg text-white font-bold neu-action-btn disabled:opacity-50 flex items-center justify-center relative z-40"
                    >
                      {isServiceAdding ? <Loader2 size={18} className="animate-spin pointer-events-none" /> : <Plus size={18} className="pointer-events-none" />}
                    </button>
                  </div>
                </div>

                {/* Existing List */}
                <div>
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-3 block">Existing Services</label>
                  <div className="space-y-3">
                    {serviceTypes.map((type) => (
                      <div key={type} className="neu-flat-sm rounded-lg p-3.5 flex justify-between items-center group">
                        <span className="text-sm font-bold text-[#1F2328]">{type}</span>
                        <button 
                          type="button" 
                          onClick={() => { setServiceTypeToDelete(type); setDeletePopupOpen(true); }}
                          className="neu-pressed-sm neu-action-btn rounded-md p-1.5 text-[#656D76] hover:text-[#D1242F] opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} className="pointer-events-none" />
                        </button>
                      </div>
                    ))}
                    {serviceTypes.length === 0 && <p className="text-center text-xs font-bold italic text-[#656D76] mt-4">No services available.</p>}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Confirm Delete Service Modal */}
      <AnimatePresence>
        {deletePopupOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeletePopupOpen(false)} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-sm flex flex-col relative z-10 p-8 text-center items-center"
            >
              <div className="neu-pressed-sm p-4 rounded-full text-[#D1242F] mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#1F2328] mb-2">Delete Service?</h2>
              <p className="text-sm font-medium text-[#656D76] mb-8">
                Are you sure you want to permanently delete <strong>{serviceTypeToDelete}</strong>? This action cannot be undone.
              </p>
              
              <div className="flex gap-4 w-full relative z-20">
                <button type="button" onClick={() => setDeletePopupOpen(false)} disabled={isServiceDeleting} className="flex-1 neu-flat neu-action-btn rounded-lg py-3 text-sm font-bold text-[#656D76] disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" onClick={() => handleDeleteServiceType(serviceTypeToDelete)} disabled={isServiceDeleting} className="flex-1 neu-flat neu-action-btn border border-[#D1242F]/30 rounded-lg py-3 text-sm font-bold text-[#D1242F] flex justify-center items-center gap-2 disabled:opacity-50">
                  {isServiceDeleting ? <Loader2 size={16} className="animate-spin pointer-events-none" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Custom Snackbar ── */}
      <AnimatePresence>
        {snackbarOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[99999] flex items-center gap-4 neu-flat rounded-xl p-4 montserrat-medium max-w-sm"
          >
            <div className={`neu-pressed-sm p-2 rounded-full shrink-0 ${snackbarSeverity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
               {snackbarSeverity === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            </div>
            <span className={`text-xs font-bold ${snackbarSeverity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
              {snackbarMessage}
            </span>
            <button type="button" onClick={() => setSnackbarOpen(false)} className="neu-flat-sm neu-action-btn rounded-lg p-1.5 text-[#656D76] ml-auto shrink-0">
              <X size={14} className="pointer-events-none" />
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 10px 0;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </div>
  );
}