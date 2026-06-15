import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  ChevronDown, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  UserPlus, 
  Loader2 
} from "lucide-react";

export default function UserRegistrationForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "caller",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showSnackbar = (msg, severity) => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/api/auth/register`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSnackbar(response.data.message || "User registered successfully!", "success");

      setFormData({
        username: "",
        email: "",
        password: "",
        role: "caller",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      showSnackbar(error.response?.data?.message || "Failed to register user", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-[90vh] overflow-hidden flex items-center justify-center neu-base p-4 sm:p-6 montserrat-regular text-[#1F2328]">
      
      <div className="neu-flat rounded-2xl p-6 sm:p-10 w-full max-w-md relative z-10 flex flex-col">
        
        <div className="flex flex-col items-center justify-center mb-8 border-b border-[#D1DCEB]/50 pb-6 shrink-0">
          <div className="neu-pressed-sm p-4 rounded-full text-[#0969DA] mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-xl montserrat-medium text-[#1F2328]">Add New User</h2>
          <p className="text-[10px] montserrat-medium text-[#656D76] uppercase tracking-wider mt-1.5">Add a new member to the workspace</p>
        </div>
        
        {/* autoComplete="off" prevents standard autofill */}
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-5 flex-1 overflow-y-auto custom-scrollbar pr-2">
          
          {/* Honeypot hidden fields to absorb aggressive browser autofill */}
          <input type="text" name="fakeusernameremembered" className="hidden" aria-hidden="true" tabIndex="-1" />
          <input type="password" name="fakepasswordremembered" className="hidden" aria-hidden="true" tabIndex="-1" />

          {/* Username Input */}
          <div className="relative z-20">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">
              Username <span className="text-[#D1242F]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30">
                <User size={16} />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="new-username"
                className="w-full neu-pressed rounded-md p-3.5 pl-10 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
                placeholder="Enter username"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="relative z-20">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">
              Email Address <span className="text-[#D1242F]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30">
                <Mail size={16} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="new-email"
                className="w-full neu-pressed rounded-md p-3.5 pl-10 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative z-20">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">
              Password <span className="text-[#D1242F]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30">
                <Lock size={16} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full neu-pressed rounded-md p-3.5 pl-10 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20 tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Role Select */}
          <div className="relative z-20">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">
              System Role <span className="text-[#D1242F]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30">
                <Shield size={16} />
              </div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full neu-pressed rounded-md p-3.5 pl-10 pr-10 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20"
              >
                <option value="caller">Caller</option>
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
                <option value="manager">Team Manager</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none z-30">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="neu-btn-primary mt-6 w-full py-3.5 rounded-lg text-white font-bold text-sm neu-action-btn flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin pointer-events-none" /> Processing...</>
            ) : (
              <><UserPlus size={18} className="pointer-events-none" /> Register User</>
            )}
          </button>
        </form>
      </div>

      {/* Custom Snackbar */}
      <AnimatePresence>
        {openSnackbar && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[99999] flex items-center gap-4 neu-flat rounded-xl p-4 montserrat-medium max-w-sm"
          >
            <div className={`neu-pressed-sm p-2 rounded-full shrink-0 ${snackbarSeverity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
               {snackbarSeverity === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <span className={`text-xs font-bold ${snackbarSeverity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
              {snackbarMessage}
            </span>
            <button
              type="button"
              onClick={() => setOpenSnackbar(false)}
              className="neu-flat-sm neu-action-btn rounded-lg p-1.5 text-[#656D76] ml-auto shrink-0"
            >
              <X size={14} className="pointer-events-none" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neumorphic CSS Rules */}
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
        
        /* Force Input Clickability and Text Selection globally */
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

        /* Defeat Auto-fill styling */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
          -webkit-box-shadow: 0 0 0 30px var(--neu-bg) inset !important;
          -webkit-text-fill-color: #1F2328 !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </div>
  );
}