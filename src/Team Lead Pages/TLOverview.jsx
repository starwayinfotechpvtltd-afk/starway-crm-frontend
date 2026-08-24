import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Users, CheckSquare, Clock, AlertCircle, Plus, FolderKanban, ArrowRight, UserCheck, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function TLOverview() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  // Quick Task Assignment Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return localStorage.getItem("last_selected_project_id") || "";
  });
  const [assignedToId, setAssignedToId] = useState("");
  const [taskItems, setTaskItems] = useState([
    { id: "task-1", title: "", description: "", priority: "Medium", deadline: "" },
  ]);
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [teamRes, projRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/teams/my-team`, config),
        axios.get(`${API_BASE}/api/newproject/projects`, config),
      ]);

      if (teamRes.status === "fulfilled" && teamRes.value.data.team) {
        setTeam(teamRes.value.data.team);
      }

      if (projRes.status === "fulfilled") {
        setProjects(projRes.value.data || []);
      }
    } catch (err) {
      console.error("Failed to load Team Lead dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const members = team?.members || [];
  const teamProjects = team?.projects?.length > 0 ? team.projects : projects;

  // Alphabetically sorted projects
  const sortedProjects = useMemo(() => {
    return [...teamProjects].sort((a, b) =>
      (a.projectName || "").localeCompare(b.projectName || "", undefined, { sensitivity: "base" })
    );
  }, [teamProjects]);

  // Pre-select remembered project when sortedProjects load
  useEffect(() => {
    if (sortedProjects.length > 0) {
      const savedId = localStorage.getItem("last_selected_project_id");
      const exists = sortedProjects.some((p) => p._id === savedId);
      if (!selectedProjectId || !exists) {
        const fallbackId = exists ? savedId : sortedProjects[0]._id;
        setSelectedProjectId(fallbackId);
      }
    }
  }, [sortedProjects]);

  const addTaskRow = () => {
    setTaskItems((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: "",
        description: "",
        priority: "Medium",
        deadline: "",
      },
    ]);
  };

  const removeTaskRow = (id) => {
    if (taskItems.length <= 1) return;
    setTaskItems((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskRow = (id, field, value) => {
    setTaskItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const validItems = taskItems.filter((t) => t.title.trim());
    if (validItems.length === 0) {
      alert("Please enter at least one task title.");
      return;
    }
    if (!selectedProjectId) {
      alert("Please select a target project.");
      return;
    }
    if (!assignedToId) {
      alert("Please select an assigned developer.");
      return;
    }

    setCreatingTask(true);
    try {
      const token = localStorage.getItem("token");
      localStorage.setItem("last_selected_project_id", selectedProjectId);
      const assignedUser = members.find((m) => m._id === assignedToId);

      for (const item of validItems) {
        await axios.post(
          `${API_BASE}/api/tasks/${selectedProjectId}`,
          {
            title: item.title.trim(),
            description: item.description.trim(),
            priority: item.priority || "Medium",
            deadline: item.deadline ? new Date(item.deadline) : null,
            assignedTo: {
              id: assignedToId,
              username: assignedUser?.username || "Developer",
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert(validItems.length > 1 ? `${validItems.length} tasks successfully assigned!` : "Task successfully assigned to developer!");
      setIsTaskModalOpen(false);
      fetchTeamData();
      setTaskItems([
        { id: `task-${Date.now()}`, title: "", description: "", priority: "Medium", deadline: "" },
      ]);
    } catch (err) {
      console.error("Failed to create task(s)", err);
      alert("Failed to assign task(s): " + (err.response?.data?.message || err.message));
    } finally {
      setCreatingTask(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {team ? `${team.teamName} — Lead Command Center` : "Team Leadership Command Center"}
            </h1>
            <Badge variant="blue">{team?.teamType || "Development"}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Assign work items to junior developers, monitor project milestones, and supervise team workload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="ent-btn-primary"
          >
            <Plus size={14} />
            Assign Task to Junior
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Team Developers"
          value={members.length}
          icon={Users}
          variant="blue"
          linkTo="/dashboard-team-lead/members"
          linkText="Manage Members"
        />
        <StatCard
          title="Active Projects"
          value={teamProjects.length}
          icon={FolderKanban}
          variant="indigo"
          linkTo="/dashboard-team-lead/projects"
          linkText="View Projects"
        />
        <StatCard
          title="Department Allocation"
          value={team?.department || "Engineering"}
          icon={UserCheck}
          variant="emerald"
          subtitle="Operating Unit"
        />
        <StatCard
          title="Supervisory Mode"
          value="Active TL"
          icon={Clock}
          variant="amber"
          subtitle="Task Delegator Enabled"
        />
      </div>

      {/* Team Members Workload Grid */}
      <div className="ent-card">
        <div className="ent-card-header">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Assigned Junior Developers & Specialists
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Direct team members reporting to you for task assignments and review
            </p>
          </div>
          <Link to="/dashboard-team-lead/tasks" className="ent-btn-secondary text-xs">
            Open Task Matrix &rarr;
          </Link>
        </div>

        <div className="p-4">
          {members.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No developers currently assigned to this team. Please contact the administrator or HR to link members.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="border border-slate-200 rounded p-4 bg-white flex flex-col justify-between hover:border-blue-400 transition-colors shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {member.username}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {member.designation || member.role}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="ent-badge ent-badge-slate text-[10px]">
                      {member.department || "Dev"}
                    </span>
                    <button
                      onClick={() => {
                        setTaskForm((prev) => ({ ...prev, assignedToId: member._id }));
                        setIsTaskModalOpen(true);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} /> Assign Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects Under Team Supervision */}
      <div className="ent-card">
        <div className="ent-card-header">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Projects Portfolio
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Client software deliveries under your team's technical supervision
            </p>
          </div>
          <Link to="/dashboard-team-lead/projects" className="text-xs font-semibold text-blue-600 hover:underline">
            All Projects &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="ent-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client Name</th>
                <th>Service Type</th>
                <th>Assigned Developers</th>
                <th>Status</th>
                <th>Amount</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {teamProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No active projects assigned to this team.
                  </td>
                </tr>
              ) : (
                teamProjects.slice(0, 5).map((p) => (
                  <tr key={p._id}>
                    <td className="font-bold text-slate-900">{p.projectName}</td>
                    <td className="text-slate-600">{p.clientName}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {p.serviceType?.map((s, i) => (
                          <span key={i} className="ent-badge ent-badge-slate text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-medium text-slate-700">
                        {p.assignedDeveloper?.map((d) => d.username).join(", ") || "Unassigned"}
                      </span>
                    </td>
                    <td>
                      <Badge variant={p.status === "Active" ? "green" : "slate"}>
                        {p.status || "Active"}
                      </Badge>
                    </td>
                    <td className="font-semibold text-slate-800">
                      ${p.amount?.toLocaleString() || "0"}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => {
                          setTaskForm((prev) => ({ ...prev, projectId: p._id }));
                          setIsTaskModalOpen(true);
                        }}
                        className="ent-btn-secondary py-1 px-2 text-[11px]"
                      >
                        + Assign Task
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Assignment Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={taskItems.length > 1 ? `Assign ${taskItems.length} Tasks to Developer` : "Assign Project Task"}
        subtitle="Delegate work items with project association, priority level, and deadline"
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="createTaskForm"
              disabled={creatingTask}
              className="ent-btn-primary"
            >
              {creatingTask
                ? "Assigning..."
                : taskItems.length > 1
                ? `Assign ${taskItems.length} Tasks`
                : "Assign Task"}
            </button>
          </>
        }
      >
        <form id="createTaskForm" onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="ent-label">Target Project *</label>
              <span className="text-[10px] text-slate-400 font-mono">Sorted Alphabetically (A–Z)</span>
            </div>
            <select
              required
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                localStorage.setItem("last_selected_project_id", e.target.value);
              }}
              className="ent-select text-xs font-semibold"
            >
              <option value="">Select Project...</option>
              {sortedProjects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName} (Client: {p.clientName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="ent-label">Assign To Developer / Junior *</label>
            <select
              required
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="ent-select text-xs font-semibold"
            >
              <option value="">Select Junior Developer...</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.username} — {m.designation || m.department || "Developer"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Work Deliverables ({taskItems.length})
              </span>
              {taskItems.length > 1 && (
                <span className="text-[10px] bg-blue-50 text-[#1E40AF] px-2 py-0.5 rounded font-bold">
                  Batch Mode Active
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={addTaskRow}
              className="px-2.5 py-1 bg-blue-50 text-[#1E40AF] hover:bg-blue-100 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> Add Another Task
            </button>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {taskItems.map((item, idx) => (
              <div
                key={item.id}
                className={`p-3.5 rounded border transition-all ${
                  taskItems.length > 1
                    ? "bg-[#FAF8F5]/70 border-[#EAE3D6] space-y-3 relative"
                    : "space-y-3 border-transparent p-0"
                }`}
              >
                {taskItems.length > 1 && (
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#1E40AF] text-white text-[9px] flex items-center justify-center font-mono font-bold">
                        {idx + 1}
                      </span>
                      Task #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTaskRow(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
                      title="Remove this task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                <div>
                  <label className="ent-label">Task Title / Deliverable *</label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. ${
                      idx === 0
                        ? "Implement Responsive Navbar & Stripe Webhooks"
                        : idx === 1
                        ? "Build Admin reporting exports"
                        : "Optimize database queries"
                    }`}
                    value={item.title}
                    onChange={(e) => updateTaskRow(item.id, "title", e.target.value)}
                    className="ent-input text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="ent-label">Technical Instructions / Scope (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Provide exact requirements, API endpoints, or design links..."
                    value={item.description}
                    onChange={(e) => updateTaskRow(item.id, "description", e.target.value)}
                    className="ent-input text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="ent-label">Priority Level</label>
                    <select
                      value={item.priority}
                      onChange={(e) => updateTaskRow(item.id, "priority", e.target.value)}
                      className="ent-select text-xs font-semibold"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical (Urgent)</option>
                    </select>
                  </div>

                  <div>
                    <label className="ent-label">Deadline</label>
                    <input
                      type="date"
                      value={item.deadline}
                      onChange={(e) => updateTaskRow(item.id, "deadline", e.target.value)}
                      className="ent-input text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal>
    </div>
  );
}
