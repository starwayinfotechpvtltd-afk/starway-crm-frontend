import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  Search,
  Check,
  Briefcase,
  Layers,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    headOfDepartment: "",
    color: "#2563EB",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [deptRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/departments`, config),
        axios.get(`${API_BASE}/api/auth/users`, config),
      ]);
      const uniqueDepts = [];
      const seen = new Set();
      for (const d of (deptRes.data || [])) {
        const nameLower = d.name?.trim().toLowerCase();
        if (nameLower && !seen.has(nameLower)) {
          seen.add(nameLower);
          uniqueDepts.push({ ...d, name: d.name.trim() });
        }
      }

      setDepartments(uniqueDepts);
      setAllUsers(usersRes.data || []);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      headOfDepartment: "",
      color: "#2563EB",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code || "",
      description: dept.description || "",
      headOfDepartment: dept.headOfDepartment?._id || dept.headOfDepartment || "",
      color: dept.color || "#2563EB",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingDept) {
        await axios.put(`${API_BASE}/api/departments/${editingDept._id}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/api/departments`, formData, config);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save department:", err);
      alert(err.response?.data?.message || "Failed to save department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the "${dept.name}" department? Any assigned employees will be moved to General.`
      )
    )
      return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/api/departments/${dept._id}`, config);
      // Re-fetch both departments AND allUsers so staff counts stay accurate
      await fetchData();
    } catch (err) {
      console.error("Failed to delete department:", err);
      alert(err.response?.data?.message || "Failed to delete department");
    }
  };

  const filteredDepts = departments.filter((d) => {
    return (
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code?.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Department Governance & Unit Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Define and manage organizational departments, designate department heads, and structure company units.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="ent-btn-primary">
          <Plus size={14} /> Add New Department
        </button>
      </div>

      {/* Filter Bar */}
      <div className="ent-card p-3 flex items-center justify-between gap-3 bg-white">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments by name, code, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ent-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400 font-medium">
          Loading departments...
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="ent-card p-12 text-center text-slate-500">
          <Building2 size={32} className="mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-800">No Departments Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Create departments to organize staff members and delegate tasks.
          </p>
          <button onClick={handleOpenCreate} className="ent-btn-primary mx-auto">
            <Plus size={14} /> Create Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map((dept) => (
            <div
              key={dept._id}
              className="ent-card p-5 bg-white flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ backgroundColor: dept.color || "#2563EB" }}
                    >
                      {dept.code || dept.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {dept.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Code: {dept.code || "N/A"}
                      </span>
                    </div>
                  </div>
                  <Badge variant="blue">{dept.staffCount || 0} Staff</Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 font-medium line-clamp-2 mb-4">
                  {dept.description || "No description provided for this department unit."}
                </p>

                {/* Department Head */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded mb-3">
                  <span className="ent-label text-[10px] text-slate-500">Head of Department</span>
                  {dept.headOfDepartment ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {dept.headOfDepartment.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {dept.headOfDepartment.username}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {dept.headOfDepartment.designation || dept.headOfDepartment.role}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No Head Appointed</span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {dept.tlCount || 0} Team Leads
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Edit Department"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(dept)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? "Edit Department Unit" : "Create Organizational Department"}
        subtitle="Specify department name, code, description, and appointed head"
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
              form="deptForm"
              disabled={isSubmitting}
              className="ent-btn-primary"
            >
              {isSubmitting ? "Saving..." : editingDept ? "Save Changes" : "Create Department"}
            </button>
          </>
        }
      >
        <form id="deptForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="ent-label">Department Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Mobile Engineering / Marketing"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="ent-input"
              />
            </div>
            <div>
              <label className="ent-label">Code / Acronym</label>
              <input
                type="text"
                placeholder="e.g. MOB"
                maxLength={5}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="ent-input uppercase"
              />
            </div>
          </div>

          <div>
            <label className="ent-label">Appointed Head of Department (HOD)</label>
            <select
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              className="ent-select"
            >
              <option value="">-- No Head Appointed --</option>
              {allUsers
                .filter((u) => ["admin", "manager", "team_lead", "hr"].includes(u.role))
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.username} ({u.role} - {u.designation || "Staff"})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="ent-label">Description & Unit Scope</label>
            <textarea
              rows={3}
              placeholder="Responsibilities and purpose of this department..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="ent-input resize-none"
            />
          </div>

          <div>
            <label className="ent-label">Badge Color Identifier</label>
            <div className="flex items-center gap-2">
              {[
                "#2563EB", // Blue
                "#7C3AED", // Purple
                "#059669", // Green
                "#D97706", // Amber
                "#DC2626", // Red
                "#0F172A", // Slate
                "#0284C7", // Sky
                "#EC4899", // Pink
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                    formData.color === c ? "border-slate-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {formData.color === c && <Check size={12} className="text-white font-bold" />}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
