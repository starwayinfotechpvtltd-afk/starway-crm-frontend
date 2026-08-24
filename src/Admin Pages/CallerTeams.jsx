import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Plus, Edit, Trash2, GitBranch, Shield, Check, UserCheck, Search } from "lucide-react";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function TeamsHub() {
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);

  const [formData, setFormData] = useState({
    teamName: "",
    teamType: "development",
    department: "Engineering",
    description: "",
    teamLeadId: "",
    managerId: "",
    memberIds: [],
  });

  const [isNewDeptOpen, setIsNewDeptOpen] = useState(false);
  const [newDeptInput, setNewDeptInput] = useState("");
  const [addingDept, setAddingDept] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [teamsRes, usersRes, deptRes] = await Promise.all([
        axios.get(`${API_BASE}/api/teams`, config).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/auth/users`, config).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/departments`, config).catch(() => ({ data: [] })),
      ]);

      // Deduplicate departments strictly by lowercased name
      const uniqueDepts = [];
      const seen = new Set();
      for (const d of (deptRes.data || [])) {
        const nameLower = d.name?.trim().toLowerCase();
        if (nameLower && !seen.has(nameLower)) {
          seen.add(nameLower);
          uniqueDepts.push({ ...d, name: d.name.trim() });
        }
      }

      setTeams(teamsRes.data || []);
      setAllUsers(usersRes.data || []);
      setDepartments(uniqueDepts);
    } catch (error) {
      console.error("Failed to fetch teams data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAddDepartment = async () => {
    if (!newDeptInput.trim()) return;
    setAddingDept(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(
        `${API_BASE}/api/departments`,
        { name: newDeptInput.trim() },
        config
      );
      const created = res.data;
      setDepartments((prev) => {
        const exists = prev.some((d) => d.name.toLowerCase() === created.name.toLowerCase());
        return exists ? prev : [...prev, created];
      });
      setFormData((prev) => ({ ...prev, department: created.name }));
      setNewDeptInput("");
      setIsNewDeptOpen(false);
    } catch (err) {
      console.error("Failed to add department:", err);
      alert(err.response?.data?.message || "Failed to add department");
    } finally {
      setAddingDept(false);
    }
  };

  const openCreateModal = () => {
    setEditingTeamId(null);
    setFormData({
      teamName: "",
      teamType: "development",
      department: departments[0]?.name || "Engineering",
      description: "",
      teamLeadId: "",
      managerId: "",
      memberIds: [],
    });
    setIsNewDeptOpen(false);
    setIsModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditingTeamId(team._id);
    setFormData({
      teamName: team.teamName || "",
      teamType: team.teamType || "development",
      department: team.department || "Engineering",
      description: team.description || "",
      teamLeadId: team.teamLead?._id || team.teamLead || "",
      managerId: team.manager?._id || team.manager || "",
      memberIds: team.members?.map((m) => m._id || m) || [],
    });
    setIsModalOpen(true);
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.memberIds.includes(userId);
      return {
        ...prev,
        memberIds: isSelected
          ? prev.memberIds.filter((id) => id !== userId)
          : [...prev.memberIds, userId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamName.trim()) return;

    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingTeamId) {
        await axios.put(`${API_BASE}/api/teams/${editingTeamId}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/api/teams`, formData, config);
      }

      await fetchInitialData();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save team:", err);
      alert(err.response?.data?.message || "Failed to save team configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (id, name) => {
    if (!window.confirm(`Are you sure you want to dismantle team "${name}"?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/api/teams/${id}`, config);
      setTeams((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Failed to delete team:", err);
      alert("Failed to delete team");
    }
  };

  const filteredTeams = teams.filter((t) => {
    const matchSearch =
      t.teamName?.toLowerCase().includes(search.toLowerCase()) ||
      t.teamLead?.username?.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Operating Teams Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Form cross-functional teams, appoint any team member as Team Lead (TL), and organize team members.
          </p>
        </div>
        <button onClick={openCreateModal} className="ent-btn-primary">
          <Plus size={14} /> Create New Team
        </button>
      </div>

      {/* Search Bar */}
      <div className="ent-card p-3 flex items-center justify-between gap-3 bg-white">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams by name, appointed Team Lead, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ent-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400 font-medium">
          Loading teams...
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="ent-card p-12 text-center text-slate-500">
          <GitBranch size={32} className="mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-800">No Teams Formed Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Create developer, design, or calling units with appointed Team Leads.
          </p>
          <button onClick={openCreateModal} className="ent-btn-primary mx-auto">
            <Plus size={14} /> Create First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team._id}
              className="ent-card p-5 bg-white flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
            >
              <div>
                {/* Team Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {team.teamName}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {team.description || "Operational unit"}
                    </p>
                  </div>
                  <Badge variant="blue">
                    {team.department || team.teamType || "General"}
                  </Badge>
                </div>

                {/* Team Lead Identity */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded mb-4">
                  <span className="ent-label text-[10px] text-slate-500">Appointed Team Lead (TL)</span>
                  {team.teamLead ? (
                    <div className="flex items-center gap-2.5 mt-1">
                      <div className="w-7 h-7 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {team.teamLead.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {team.teamLead.username}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {team.teamLead.designation || team.teamLead.role || "Team Lead"} • {team.teamLead.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No Lead Appointed</span>
                  )}
                </div>

                {/* Team Members List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Assigned Team Members</span>
                    <span className="text-[11px] text-slate-500 font-bold">
                      {team.members?.length || 0} members
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {team.members?.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No members assigned to this team</span>
                    ) : (
                      team.members?.map((m) => (
                        <div
                          key={m._id}
                          className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {m.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {m.username}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {m.designation || m.role}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">
                  Total { (team.members?.length || 0) + (team.teamLead ? 1 : 0) } Staff
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(team)}
                    className="p-1.5 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Configure Team"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team._id, team.teamName)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Dismantle Team"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeamId ? "Configure Team Structure" : "Create New Team"}
        subtitle="Specify team name, appoint any user as Team Lead (TL), and select team members"
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="teamForm"
              disabled={isSubmitting}
              className="ent-btn-primary"
            >
              {isSubmitting ? "Saving..." : editingTeamId ? "Save Team Changes" : "Create Team"}
            </button>
          </>
        }
      >
        <form id="teamForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="ent-label">Team Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Core Engineering / Alpha Calling"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                className="ent-input"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="ent-label mb-0">Department / Unit</label>
                <button
                  type="button"
                  onClick={() => setIsNewDeptOpen(!isNewDeptOpen)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {isNewDeptOpen ? "Cancel" : "+ Add Department"}
                </button>
              </div>

              {isNewDeptOpen ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    placeholder="Enter new department name..."
                    value={newDeptInput}
                    onChange={(e) => setNewDeptInput(e.target.value)}
                    className="ent-input text-xs py-1.5"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddDepartment}
                    disabled={addingDept || !newDeptInput.trim()}
                    className="px-2.5 py-1.5 rounded bg-blue-600 text-white font-bold text-xs shrink-0 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addingDept ? "Adding..." : "Add"}
                  </button>
                </div>
              ) : (
                <select
                  value={formData.department}
                  onChange={(e) => {
                    if (e.target.value === "__ADD_NEW__") {
                      setIsNewDeptOpen(true);
                    } else {
                      setFormData({ ...formData, department: e.target.value });
                    }
                  }}
                  className="ent-select"
                >
                  {departments.length === 0 ? (
                    <option value="General">General</option>
                  ) : (
                    departments.map((d) => (
                      <option key={d._id || d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))
                  )}
                  <option value="__ADD_NEW__">+ Add New Department...</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="ent-label">Appointed Team Lead (Select Any User)</label>
            <select
              value={formData.teamLeadId}
              onChange={(e) => setFormData({ ...formData, teamLeadId: e.target.value })}
              className="ent-select"
            >
              <option value="">-- Select Any User as Team Lead (TL) --</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.username} ({u.role} - {u.designation || "Staff"}) - {u.email}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              You can appoint any user to lead this team and delegate deliverables.
            </p>
          </div>

          <div>
            <label className="ent-label">Team Description / Purpose</label>
            <textarea
              rows={2}
              placeholder="Responsibilities or focus area of this unit..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="ent-input resize-none"
            />
          </div>

          {/* Member Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="ent-label mb-0">Select Team Members</label>
              <span className="text-[10px] text-slate-500 font-semibold">
                {formData.memberIds.length} Selected
              </span>
            </div>
            <div className="border border-slate-200 rounded p-2 max-h-48 overflow-y-auto space-y-1 bg-slate-50/50">
              {allUsers.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">No users available</div>
              ) : (
                allUsers.map((u) => {
                  const isSelected = formData.memberIds.includes(u._id);
                  const isTL = formData.teamLeadId === u._id;
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleMemberToggle(u._id)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs ${
                        isSelected
                          ? "bg-blue-50 border border-blue-200 text-blue-900"
                          : "hover:bg-slate-100 border border-transparent text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                        }`}>
                          {isSelected ? <Check size={10} /> : u.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold">{u.username}</span>
                          {isTL && (
                            <span className="ml-1 text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-bold">
                              Appointed TL
                            </span>
                          )}
                          <span className="text-slate-400 ml-1.5 text-[10px]">
                            ({u.role} - {u.department || "General"})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}