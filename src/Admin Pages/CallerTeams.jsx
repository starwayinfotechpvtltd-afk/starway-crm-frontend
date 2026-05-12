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
    <div className="min-h-screen bg-[#FFFFFF] text-[#172B4D] p-10 font-sans relative" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* Jira-style Header */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center relative z-10">
        <div>
          <nav className="text-sm text-[#6B778C] mb-2 flex items-center gap-2">
            <span>Projects</span> 
            <span>/</span>
            <span>CRM Settings</span>
          </nav>
          <h1 className="text-[24px] font-medium text-[#172B4D] tracking-tight">Teams</h1>
        </div>
        
        {/* ADDED z-20 to ensure it punches through any invisible wrappers */}
        <button
          type="button"
          onClick={openCreateModal}
          className="relative z-20 bg-[#0052CC] hover:bg-[#0047B3] text-white text-sm font-medium px-4 py-2 rounded-[3px] transition-colors cursor-pointer shadow-sm"
        >
          Create team
        </button>
      </div>

      {/* Jira-style Data Table */}
      <div className="max-w-6xl mx-auto relative z-0">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0052CC]"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#DFE1E6] rounded-[3px] bg-[#FAFBFC]">
            <p className="text-[#42526E] text-sm font-medium">No teams have been created yet.</p>
          </div>
        ) : (
          <div className="border border-[#DFE1E6] rounded-[3px] overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6]">
                <tr>
                  <th className="py-3 px-4 text-xs font-bold text-[#5E6C84] uppercase tracking-wider w-1/4">Team Name</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#5E6C84] uppercase tracking-wider w-1/4">Manager</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#5E6C84] uppercase tracking-wider w-2/4">Members (Callers)</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#5E6C84] uppercase tracking-wider text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {teams.map((team) => (
                  <tr key={team._id} className="hover:bg-[#FAFBFC] transition-colors group">
                    <td className="py-3 px-4 text-sm font-medium text-[#172B4D]">
                      {team.teamName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#DFE1E6] text-[#172B4D] flex items-center justify-center text-xs font-bold">
                          {team.manager?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-sm text-[#42526E]">{team.manager?.username || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {team.members.map((member) => (
                          <span key={member._id} className="inline-flex items-center bg-[#EBECF0] text-[#172B4D] text-xs px-2 py-0.5 rounded-[3px] font-medium">
                            {member.username}
                          </span>
                        ))}
                        {team.members.length === 0 && (
                          <span className="text-xs text-[#6B778C] italic">No members</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={() => openEditModal(team)}
                          className="text-[#42526E] hover:text-[#0052CC] text-sm font-medium px-2 py-1 rounded hover:bg-[#EBECF0] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          type="button"
                          onClick={() => deleteTeam(team._id)}
                          className="text-[#DE350B] hover:text-[#BF2600] text-sm font-medium px-2 py-1 rounded hover:bg-[#FFEBE6] cursor-pointer"
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
        )}
      </div>

      {/* Jira-style Dialog (Modal) - RESTRUCTURED FOR BULLETPROOF CLICKS */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999]">
            {/* Layer 1: Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-[#091E42]/50 z-[9998] cursor-pointer"
            />
            
            {/* Layer 2: Centering Container (Pointer Events None prevents it from blocking clicks) */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4">
              
              {/* Layer 3: Modal Content (Pointer Events Auto re-enables clicks) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()} // Prevents clicks inside modal from triggering backdrop
                className="relative w-full max-w-[500px] bg-white rounded-[3px] shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25)] flex flex-col pointer-events-auto"
              >
                {/* Header */}
                <div className="px-6 py-5 flex justify-between items-center">
                  <h2 className="text-[20px] font-medium text-[#172B4D]">
                    {editingTeamId ? "Edit team" : "Create team"}
                  </h2>
                  <button 
                    type="button"
                    onClick={closeModal} 
                    className="text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] p-1 rounded transition-colors cursor-pointer"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
                  <div className="px-6 py-2 overflow-y-auto space-y-5">
                    
                    {/* Name Input */}
                    <div>
                      <label className="block text-sm font-semibold text-[#6B778C] mb-1">Team name <span className="text-[#DE350B]">*</span></label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] text-sm text-[#172B4D] focus:bg-white focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] outline-none transition-colors relative z-10"
                        value={formData.teamName}
                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                      />
                    </div>

                    {/* Manager Select */}
                    <div>
                      <label className="block text-sm font-semibold text-[#6B778C] mb-1">Manager <span className="text-[#DE350B]">*</span></label>
                      <select
                        required
                        className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] text-sm text-[#172B4D] focus:bg-white focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] outline-none transition-colors cursor-pointer appearance-none relative z-10"
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      >
                        <option value="" disabled>Select manager...</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>{m.username}</option>
                        ))}
                      </select>
                    </div>

                    {/* Callers Multi-select Checklist */}
                    <div>
                      <label className="block text-sm font-semibold text-[#6B778C] mb-1">Members</label>
                      <div className="border border-[#DFE1E6] rounded-[3px] max-h-48 overflow-y-auto bg-white relative z-10">
                        {callers.map((caller) => {
                          const isChecked = formData.memberIds.includes(caller._id);
                          return (
                            <label 
                              key={caller._id} 
                              className="flex items-center px-3 py-2 hover:bg-[#FAFBFC] cursor-pointer border-b border-[#DFE1E6] last:border-0"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(caller._id)}
                                className="w-4 h-4 text-[#0052CC] border-[#DFE1E6] rounded-[3px] focus:ring-[#0052CC] cursor-pointer"
                              />
                              <span className="ml-3 text-sm text-[#172B4D]">{caller.username}</span>
                            </label>
                          );
                        })}
                        {callers.length === 0 && (
                          <div className="p-3 text-sm text-[#6B778C]">No callers available</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="px-6 py-5 flex justify-end gap-2 border-t border-[#DFE1E6] mt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-[#42526E] hover:bg-gray-100 bg-transparent rounded-[3px] transition-colors cursor-pointer relative z-10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#0052CC] hover:bg-[#0047B3] rounded-[3px] transition-colors cursor-pointer disabled:opacity-50 relative z-10"
                    >
                      {isSubmitting ? "Saving..." : editingTeamId ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teams;