import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, CheckCircle2, Clock, AlertCircle, Filter, Search, User, Trash2, Edit } from "lucide-react";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function TeamTaskBoard() {
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState("all");

  // Task creation/edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    deadline: "",
    assignedToId: "",
    status: "Todo",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
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

      let projs = [];
      if (projRes.status === "fulfilled") {
        projs = projRes.value.data || [];
        setProjects(projs);
      }

      // Default to first project
      if (projs.length > 0) {
        setSelectedProjectId(projs[0]._id);
        fetchTasksForProject(projs[0]._id);
      }
    } catch (err) {
      console.error("Failed to load task board", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForProject = async (projId) => {
    if (!projId) return;
    setTasksLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/tasks/${projId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch project tasks", err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const projId = e.target.value;
    setSelectedProjectId(projId);
    fetchTasksForProject(projId);
  };

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setTaskForm({
      title: "",
      description: "",
      priority: "Medium",
      deadline: "",
      assignedToId: team?.members?.[0]?._id || "",
      status: "Todo",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t) => {
    setEditingTaskId(t._id);
    setTaskForm({
      title: t.title || "",
      description: t.description || "",
      priority: t.priority || "Medium",
      deadline: t.deadline ? t.deadline.split("T")[0] : "",
      assignedToId: t.assignedTo?.id || "",
      status: t.status || "Todo",
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !taskForm.title) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const assignedUser = team?.members?.find((m) => m._id === taskForm.assignedToId);

      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        deadline: taskForm.deadline ? new Date(taskForm.deadline) : null,
        status: taskForm.status,
        assignedTo: assignedUser
          ? { id: assignedUser._id, username: assignedUser.username }
          : undefined,
      };

      if (editingTaskId) {
        await axios.put(
          `${API_BASE}/api/tasks/${selectedProjectId}/${editingTaskId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE}/api/tasks/${selectedProjectId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setIsModalOpen(false);
      fetchTasksForProject(selectedProjectId);
    } catch (err) {
      console.error("Save task error:", err);
      alert("Failed to save task: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/tasks/${selectedProjectId}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Failed to delete task", err);
      alert("Failed to delete task");
    }
  };

  const handleStatusQuickChange = async (task, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/tasks/${selectedProjectId}/${task._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedDeveloperId === "all") return true;
    return t.assignedTo?.id === selectedDeveloperId;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === "Todo");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "In Progress");
  const doneTasks = filteredTasks.filter((t) => t.status === "Done");

  const members = team?.members || [];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Team Task Delegation Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Delegate project deliverables to team members, set priorities and deadlines, and track development progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleOpenCreateModal} className="ent-btn-primary">
            <Plus size={14} /> Delegate Task to Member
          </button>
        </div>
      </div>

      {/* Project & Member Filter Strip */}
      <div className="ent-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <label className="ent-label">Active Project</label>
            <select
              value={selectedProjectId}
              onChange={handleProjectChange}
              className="ent-select min-w-[220px]"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName} ({p.clientName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="ent-label">Filter by Junior Developer</label>
            <select
              value={selectedDeveloperId}
              onChange={(e) => setSelectedDeveloperId(e.target.value)}
              className="ent-select min-w-[180px]"
            >
              <option value="all">All Team Members</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span>Total Tasks: {filteredTasks.length}</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-600">Todo: {todoTasks.length}</span>
          <span className="text-slate-300">|</span>
          <span className="text-amber-600">In Progress: {inProgressTasks.length}</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-600">Done: {doneTasks.length}</span>
        </div>
      </div>

      {/* 3-Column Kanban Board for Delegated Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: TODO */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pending / To-Do
              </h2>
            </div>
            <Badge variant="blue">{todoTasks.length}</Badge>
          </div>

          <div className="space-y-3 flex-1 min-h-[300px] p-2 bg-slate-100/60 rounded border border-slate-200">
            {tasksLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading tasks...</div>
            ) : todoTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No pending tasks</div>
            ) : (
              todoTasks.map((t) => (
                <div
                  key={t._id}
                  className="bg-white p-3.5 rounded border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{t.title}</h3>
                    <Badge
                      variant={
                        t.priority === "Critical"
                          ? "red"
                          : t.priority === "High"
                          ? "amber"
                          : t.priority === "Low"
                          ? "green"
                          : "blue"
                      }
                    >
                      {t.priority}
                    </Badge>
                  </div>

                  {t.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <User size={12} className="text-slate-400" />
                      <span>{t.assignedTo?.username || "Unassigned"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStatusQuickChange(t, "In Progress")}
                        className="p-1 px-1.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 rounded"
                        title="Move to In Progress"
                      >
                        Start &rarr;
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                In Progress
              </h2>
            </div>
            <Badge variant="amber">{inProgressTasks.length}</Badge>
          </div>

          <div className="space-y-3 flex-1 min-h-[300px] p-2 bg-slate-100/60 rounded border border-slate-200">
            {tasksLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading tasks...</div>
            ) : inProgressTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No active tasks in progress</div>
            ) : (
              inProgressTasks.map((t) => (
                <div
                  key={t._id}
                  className="bg-white p-3.5 rounded border border-amber-200 shadow-xs space-y-2 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{t.title}</h3>
                    <Badge
                      variant={
                        t.priority === "Critical"
                          ? "red"
                          : t.priority === "High"
                          ? "amber"
                          : "blue"
                      }
                    >
                      {t.priority}
                    </Badge>
                  </div>

                  {t.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <User size={12} className="text-slate-400" />
                      <span>{t.assignedTo?.username || "Unassigned"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStatusQuickChange(t, "Done")}
                        className="p-1 px-1.5 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Mark Complete"
                      >
                        Complete &rarr;
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: DONE */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Completed & Verified
              </h2>
            </div>
            <Badge variant="green">{doneTasks.length}</Badge>
          </div>

          <div className="space-y-3 flex-1 min-h-[300px] p-2 bg-slate-100/60 rounded border border-slate-200">
            {tasksLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading tasks...</div>
            ) : doneTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No completed tasks yet</div>
            ) : (
              doneTasks.map((t) => (
                <div
                  key={t._id}
                  className="bg-white p-3.5 rounded border border-slate-200 shadow-xs space-y-2 opacity-90"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-700 line-through leading-snug">
                      {t.title}
                    </h3>
                    <Badge variant="green">Done</Badge>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>{t.assignedTo?.username || "Dev"}</span>
                    </div>

                    <button
                      onClick={() => handleStatusQuickChange(t, "Todo")}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Re-open
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTaskId ? "Edit Delegated Task" : "Assign New Task to Junior Developer"}
        subtitle="Manage task requirements, priority, and developer assignment"
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
              form="taskForm"
              disabled={saving}
              className="ent-btn-primary"
            >
              {saving ? "Saving..." : editingTaskId ? "Update Task" : "Assign Task"}
            </button>
          </>
        }
      >
        <form id="taskForm" onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="ent-label">Assign To Developer *</label>
            <select
              required
              value={taskForm.assignedToId}
              onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
              className="ent-select"
            >
              <option value="">Select Team Member...</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.username} ({m.designation || m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="ent-label">Task Deliverable Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Build Payment Gateway Webhooks Integration"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="ent-input"
            />
          </div>

          <div>
            <label className="ent-label">Detailed Instructions / References</label>
            <textarea
              rows={3}
              placeholder="Technical specs, Figma links, PR review criteria..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="ent-input resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="ent-label">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="ent-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="ent-label">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="ent-select"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="ent-label">Deadline</label>
              <input
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="ent-input"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
