import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [callers, setCallers] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  
  const [formData, setFormData] = useState({
    teamName: "",
    managerId: "",
    memberIds: [],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [teamsRes, mgrRes, callRes] = await Promise.all([
        axios.get(`${API_BASE}/api/teams`, config),
        axios.get(`${API_BASE}/api/auth/admins-managers`, config),
        axios.get(`${API_BASE}/api/auth/callers`, config),
      ]);

      setTeams(teamsRes.data);
      setManagers(mgrRes.data);
      setCallers(callRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (callerId) => {
    setFormData((prev) => {
      const isSelected = prev.memberIds.includes(callerId);
      return {
        ...prev,
        memberIds: isSelected
          ? prev.memberIds.filter((id) => id !== callerId)
          : [...prev.memberIds, callerId],
      };
    });
  };

  const openCreateModal = () => {
    setEditingTeamId(null);
    setFormData({ teamName: "", managerId: "", memberIds: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditingTeamId(team._id);
    setFormData({
      teamName: team.teamName,
      managerId: team.manager?._id || "",
      memberIds: team.members.map(m => m._id),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeamId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingTeamId) {
        await axios.put(`${API_BASE}/api/teams/${editingTeamId}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/api/teams`, formData, config);
      }
      
      await fetchInitialData();
      closeModal();
    } catch (err) {
      console.error("Failed to save team:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTeam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(teams.filter((team) => team._id !== id));
    } catch (err) {
      console.error("Failed to delete team:", err);
    }
  };

  return (
    <div className="w-full min-h-screen neu-base p-4 sm:p-6 md:p-8 montserrat-regular text-[#1F2328] relative">
      
      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
        <div>
          <nav className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>Projects</span> 
            <span>/</span>
            <span>CRM Settings</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#1F2328]">Teams Management</h1>
        </div>
        
        <button
          type="button"
          onClick={openCreateModal}
          className="neu-btn-primary px-6 py-3 rounded-lg text-white font-bold text-sm tracking-wide neu-action-btn relative z-20 flex items-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create New Team
        </button>
      </div>

      {/* ── Data Table ── */}
      <div className="max-w-7xl mx-auto relative z-0">
        {isLoading ? (
          <div className="neu-flat rounded-xl p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0969DA]"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="neu-flat rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <div className="neu-pressed-sm p-5 rounded-full mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#656D76" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <p className="text-lg font-bold text-[#1F2328] mb-1">No Teams Found</p>
            <p className="text-sm font-medium text-[#656D76]">Create your first team to get started.</p>
          </div>
        ) : (
          <div className="neu-flat rounded-xl overflow-hidden p-2 sm:p-4">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Team Name</th>
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Manager</th>
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Members (Callers)</th>
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team._id} className="border-b border-[#D1DCEB]/30 last:border-0 hover:bg-[#D1DCEB]/10 transition-colors group">
                      <td className="p-4 text-sm font-bold text-[#1F2328]">
                        {team.teamName}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full neu-flat-sm text-[#0969DA] flex items-center justify-center text-xs font-bold shrink-0">
                            {team.manager?.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-medium text-[#1F2328]">{team.manager?.username || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {team.members.map((member) => (
                            <span key={member._id} className="neu-pressed-sm text-[#1F2328] text-xs px-3 py-1.5 rounded-md font-bold">
                              {member.username}
                            </span>
                          ))}
                          {team.members.length === 0 && (
                            <span className="text-xs font-medium text-[#656D76] italic neu-pressed-sm px-3 py-1.5 rounded-md">No members</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button"
                            onClick={() => openEditModal(team)}
                            className="neu-flat-sm neu-action-btn text-[#0969DA] text-xs font-bold px-4 py-2 rounded-lg"
                          >
                            Edit
                          </button>
                          <button 
                            type="button"
                            onClick={() => deleteTeam(team._id)}
                            className="neu-flat-sm neu-action-btn text-[#D1242F] text-xs font-bold px-4 py-2 rounded-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer"
            />
            
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-lg p-6 sm:p-8 flex flex-col relative z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#D1DCEB]/50">
                <h2 className="text-xl font-bold text-[#1F2328]">
                  {editingTeamId ? "Edit Team" : "Create New Team"}
                </h2>
                <button 
                  type="button"
                  onClick={closeModal} 
                  className="neu-flat-sm neu-action-btn rounded-lg p-2.5 text-[#656D76] hover:text-[#D1242F]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 max-h-[70vh]">
                <div className="overflow-y-auto custom-scrollbar pr-2 space-y-6">
                  
                  {/* Name Input */}
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">
                      Team Name <span className="text-[#D1242F]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alpha Squad"
                      className="w-full neu-pressed rounded-md p-3.5 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
                      value={formData.teamName}
                      onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    />
                  </div>

                  {/* Manager Select */}
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">
                      Manager <span className="text-[#D1242F]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        className="w-full neu-pressed rounded-md p-3.5 pr-10 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent relative z-20"
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      >
                        <option value="" disabled>Select a manager...</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>{m.username}</option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-30">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#656D76" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Callers Multi-select Checklist */}
                  <div className="relative z-10 pb-2">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">
                      Members (Callers)
                    </label>
                    <div className="neu-pressed rounded-xl p-3 max-h-56 overflow-y-auto custom-scrollbar space-y-2">
                      {callers.map((caller) => {
                        const isChecked = formData.memberIds.includes(caller._id);
                        return (
                          <label 
                            key={caller._id} 
                            className={`flex items-center px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 relative z-20 ${
                              isChecked ? "neu-flat bg-[#F0F4F8]" : "hover:bg-[#D1DCEB]/20"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(caller._id)}
                              className="w-4 h-4 accent-[#0969DA] cursor-pointer relative z-30"
                            />
                            <span className={`ml-3 text-sm transition-colors ${isChecked ? "font-bold text-[#0969DA]" : "font-medium text-[#1F2328]"}`}>
                              {caller.username}
                            </span>
                          </label>
                        );
                      })}
                      {callers.length === 0 && (
                        <div className="p-4 text-center text-sm font-medium text-[#656D76] italic">No callers available</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#D1DCEB]/50 relative z-20">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="neu-flat neu-action-btn px-6 py-3 rounded-lg text-sm font-bold text-[#656D76]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="neu-btn-primary px-8 py-3 rounded-lg text-sm font-bold text-white neu-action-btn disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : editingTeamId ? "Update Team" : "Create Team"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
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
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 10px 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Teams;