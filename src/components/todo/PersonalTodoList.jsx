import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ListTodo,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit,
  Flag,
  ArrowRight,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Calendar,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const DEFAULT_COLUMNS = [
  { id: "col-backlog", title: "Backlog", items: [] },
  { id: "col-todo", title: "To Do", items: [] },
  { id: "col-progress", title: "In Progress", items: [] },
  { id: "col-done", title: "Done", items: [] },
];

export default function PersonalTodoList() {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("board"); // "board" or "list"
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Add / Edit Modal
  const [activeModal, setActiveModal] = useState(null); // { mode: "add"|"edit", columnId, item }
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    deadline: "",
    tag: "General",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.columns && Array.isArray(res.data.columns) && res.data.columns.length > 0) {
        setColumns(res.data.columns);
      } else {
        setColumns(DEFAULT_COLUMNS);
      }
    } catch (err) {
      console.error("Failed to fetch personal to-do board:", err);
      setColumns(DEFAULT_COLUMNS);
    } finally {
      setLoading(false);
    }
  };

  const saveBoard = async (newColumns) => {
    setColumns(newColumns);
    setSaving(true);
    try {
      await axios.post(
        `${API_BASE}/api/tasks`,
        { columns: newColumns },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save personal to-do board:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAdd = (columnId = "col-todo") => {
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      deadline: new Date().toISOString().split("T")[0],
      tag: "General",
    });
    setActiveModal({ mode: "add", columnId });
  };

  const handleOpenEdit = (columnId, item) => {
    setFormData({
      title: item.title || "",
      description: item.description || "",
      priority: item.priority || "Medium",
      deadline: item.deadline || "",
      tag: item.tag || "General",
    });
    setActiveModal({ mode: "edit", columnId, item });
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (activeModal.mode === "add") {
      const newItem = {
        id: uid(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        deadline: formData.deadline,
        tag: formData.tag,
        createdAt: new Date().toISOString(),
      };

      const updated = columns.map((col) => {
        if (col.id === activeModal.columnId) {
          return { ...col, items: [newItem, ...(col.items || [])] };
        }
        return col;
      });

      saveBoard(updated);
    } else {
      const updated = columns.map((col) => {
        if (col.id === activeModal.columnId) {
          return {
            ...col,
            items: col.items.map((item) =>
              item.id === activeModal.item.id ? { ...item, ...formData } : item
            ),
          };
        }
        return col;
      });

      saveBoard(updated);
    }

    setActiveModal(null);
  };

  const handleDeleteItem = (columnId, itemId) => {
    const updated = columns.map((col) => {
      if (col.id === columnId) {
        return { ...col, items: col.items.filter((i) => i.id !== itemId) };
      }
      return col;
    });
    saveBoard(updated);
  };

  const handleMoveItem = (fromColId, toColId, item) => {
    if (fromColId === toColId) return;
    const updated = columns.map((col) => {
      if (col.id === fromColId) {
        return { ...col, items: col.items.filter((i) => i.id !== item.id) };
      }
      if (col.id === toColId) {
        return { ...col, items: [item, ...(col.items || [])] };
      }
      return col;
    });
    saveBoard(updated);
  };

  // Progress metrics
  const totalItems = useMemo(() => {
    return columns.reduce((acc, col) => acc + (col.items?.length || 0), 0);
  }, [columns]);

  const doneItems = useMemo(() => {
    const doneCol = columns.find((c) => c.title.toLowerCase().includes("done"));
    return doneCol?.items?.length || 0;
  }, [columns]);

  const completionPct = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);

  // Filtered Items helper
  const filterItem = (item) => {
    const matchSearch =
      search === "" ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.tag?.toLowerCase().includes(search.toLowerCase());

    const matchPriority = priorityFilter === "all" || item.priority === priorityFilter;

    return matchSearch && matchPriority;
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* ── Top Action Row ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-[10px] text-blue-600 font-bold animate-pulse">
              • Saving to cloud...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === "board" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Kanban Board"
            >
              <LayoutGrid size={13} /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="List Matrix"
            >
              <List size={13} /> Matrix
            </button>
          </div>

          <button onClick={() => handleOpenAdd("col-todo")} className="ent-btn-primary text-xs">
            <Plus size={13} /> Add Task
          </button>
        </div>
      </div>

      {/* ── Overall Progress Bar Strip ─────────────────────────────────────── */}
      <div className="ent-card p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-200">
            {completionPct}%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Completed {doneItems} of {totalItems} Tasks
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {totalItems - doneItems} actionable items remaining in your pipeline
            </div>
          </div>
        </div>

        <div className="w-full sm:w-64 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* ── Filter & Search Bar ────────────────────────────────────────────── */}
      <div className="ent-card p-3 flex flex-col md:flex-row items-center justify-between gap-3 bg-white">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search personal tasks by title, tag, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ent-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="ent-select text-xs min-w-[130px]"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* ── View 1: Kanban Board ────────────────────────────────────────────── */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const filteredItems = (col.items || []).filter(filterItem);
            return (
              <div key={col.id} className="ent-card bg-slate-50/70 border border-slate-200 overflow-hidden flex flex-col max-h-[75vh]">
                {/* Column Header */}
                <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{col.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {filteredItems.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenAdd(col.id)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                    title="Add task to this column"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="p-3 overflow-y-auto space-y-2.5 flex-1 min-h-[160px]">
                  {loading ? (
                    <div className="text-center py-8 text-xs text-slate-400 font-medium">
                      Loading items...
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded p-4">
                      No tasks in this list.
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="ent-card p-3 bg-white hover:border-blue-400 transition-all shadow-2xs group flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 leading-snug">
                            {item.title}
                          </span>
                          <Badge
                            variant={
                              item.priority === "Critical"
                                ? "red"
                                : item.priority === "High"
                                ? "amber"
                                : item.priority === "Medium"
                                ? "blue"
                                : "green"
                            }
                          >
                            {item.priority}
                          </Badge>
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-slate-600 font-medium line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          {item.deadline ? (
                            <span className="flex items-center gap-1 font-semibold text-slate-600">
                              <Calendar size={11} /> {item.deadline}
                            </span>
                          ) : (
                            <span className="italic">No deadline</span>
                          )}

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(col.id, item)}
                              className="p-1 text-slate-500 hover:text-blue-600"
                              title="Edit Task"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(col.id, item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Delete Task"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Move To Dropdown Buttons */}
                        <div className="pt-1.5 flex items-center gap-1">
                          {columns
                            .filter((c) => c.id !== col.id)
                            .map((targetCol) => (
                              <button
                                key={targetCol.id}
                                onClick={() => handleMoveItem(col.id, targetCol.id, item)}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                → {targetCol.title}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View 2: Checklist Matrix View ──────────────────────────────────── */}
      {viewMode === "list" && (
        <div className="ent-card overflow-hidden bg-white">
          <table className="ent-table">
            <thead>
              <tr>
                <th>Status / Checklist</th>
                <th>Task Title</th>
                <th>Priority</th>
                <th>Tag / Category</th>
                <th>Deadline</th>
                <th>Current List</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {columns.flatMap((col) =>
                (col.items || []).filter(filterItem).map((item) => {
                  const isDone = col.title.toLowerCase().includes("done");
                  return (
                    <tr key={item.id} className={isDone ? "bg-slate-50/50" : ""}>
                      <td className="w-10">
                        <button
                          onClick={() => {
                            const doneCol = columns.find((c) => c.title.toLowerCase().includes("done"));
                            const todoCol = columns.find((c) => c.title.toLowerCase().includes("to do") || c.title.toLowerCase().includes("backlog"));
                            if (isDone && todoCol) {
                              handleMoveItem(col.id, todoCol.id, item);
                            } else if (doneCol) {
                              handleMoveItem(col.id, doneCol.id, item);
                            }
                          }}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {isDone ? (
                            <CheckCircle2 size={16} className="text-emerald-600" />
                          ) : (
                            <Circle size={16} />
                          )}
                        </button>
                      </td>
                      <td>
                        <div className={`font-bold text-xs ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}>
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 font-normal truncate max-w-md">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge
                          variant={
                            item.priority === "Critical"
                              ? "red"
                              : item.priority === "High"
                              ? "amber"
                              : item.priority === "Medium"
                              ? "blue"
                              : "green"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-slate-600">
                          {item.tag || "General"}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">
                        {item.deadline || "—"}
                      </td>
                      <td>
                        <select
                          value={col.id}
                          onChange={(e) => handleMoveItem(col.id, e.target.value, item)}
                          className="ent-select text-xs py-1"
                        >
                          {columns.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(col.id, item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(col.id, item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Task Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        title={activeModal?.mode === "add" ? "Create Personal Task" : "Edit Personal Task"}
        subtitle="Organize your personal deliverables, milestones, or private notes"
        footer={
          <>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="ent-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="personalTaskForm"
              className="ent-btn-primary"
            >
              {activeModal?.mode === "add" ? "Add to Board" : "Save Changes"}
            </button>
          </>
        }
      >
        <form id="personalTaskForm" onSubmit={handleSaveModal} className="space-y-4">
          <div>
            <label className="ent-label">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Refactor Auth middleware / Follow up with client"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="ent-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ent-label">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="ent-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="ent-label">Tag / Category</label>
              <input
                type="text"
                placeholder="e.g. Frontend, Sales, Bug"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="ent-input"
              />
            </div>
          </div>

          <div>
            <label className="ent-label">Target Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="ent-input"
            />
          </div>

          <div>
            <label className="ent-label">Description & Notes</label>
            <textarea
              rows={3}
              placeholder="Details or subtasks..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="ent-input resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
