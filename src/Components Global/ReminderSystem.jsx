import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function ReminderSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [loading, setLoading] = useState(false);
  const popupRef = useRef(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/reminders`, getHeaders());
      const list = Array.isArray(res.data) ? res.data : [];
      setReminders(list);

      // Check for active alerts
      const now = new Date();
      list.forEach(async (r) => {
        if (new Date(r.remindAt) <= now && !r.isSent) {
          alert(`⏰ REMINDER ALERT: ${r.title}`);
          await axios.put(`${API_BASE}/api/reminders/${r._id}/read`, {}, getHeaders());
          fetchReminders();
        }
      });
    } catch (err) {
      console.error("Reminder fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !remindAt) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/reminders`, { title, remindAt }, getHeaders());
      setTitle("");
      setRemindAt("");
      fetchReminders();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/reminders/${id}`, getHeaders());
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const activeReminders = reminders.filter(r => !r.isSent);

  return (
    <div className="relative inline-block" ref={popupRef} style={{ fontFamily: "'Montserrat', sans-serif", zIndex: 999999 }}>
      {/* Alarm Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 cursor-pointer text-[#656D76] hover:text-slate-800 focus:outline-none"
        style={{
          boxShadow: isOpen 
            ? "inset 1.5px 1.5px 4px #D1DCEB, inset -1.5px -1.5px 4px #FFFFFF" 
            : "2px 2px 5px #D1DCEB, -2px -2px 5px #FFFFFF",
          backgroundColor: "#F0F4F8"
        }}
        title="Schedule & View Reminders"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        {activeReminders.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D1242F] text-[8px] font-extrabold text-white shadow-sm animate-pulse">
            {activeReminders.length}
          </span>
        )}
      </button>

      {/* Reminders Dropdown Popup */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="absolute right-0 mt-3.5 w-72 rounded-2xl p-4 text-left z-[999999]"
            style={{
              backgroundColor: "#F0F4F8",
              boxShadow: "6px 6px 16px #D1DCEB, -6px -6px 16px #FFFFFF",
              border: "1px solid rgba(209, 220, 235, 0.5)"
            }}
          >
            <h4 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-3 border-b border-[#D1DCEB]/50 pb-2">
              Reminders Scheduler
            </h4>

            {/* Reminder Scheduler Form */}
            <form onSubmit={handleCreate} className="space-y-2.5 mb-4">
              <input
                required
                type="text"
                placeholder="Alert title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border-none outline-none font-bold"
                style={{
                  backgroundColor: "#F0F4F8",
                  boxShadow: "inset 2px 2px 4px #D1DCEB, inset -2px -2px 4px #FFFFFF"
                }}
              />
              <input
                required
                type="datetime-local"
                value={remindAt}
                onChange={e => setRemindAt(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border-none outline-none font-bold cursor-pointer"
                style={{
                  backgroundColor: "#F0F4F8",
                  boxShadow: "inset 2px 2px 4px #D1DCEB, inset -2px -2px 4px #FFFFFF"
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#0969DA] text-white text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer shadow-sm hover:bg-[#0753ab] focus:outline-none"
              >
                {loading ? "Scheduling..." : "Add Reminder"}
              </button>
            </form>

            {/* Reminders List */}
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {activeReminders.map(r => (
                <div
                  key={r._id}
                  className="rounded-xl p-2 flex justify-between items-start gap-2"
                  style={{
                    backgroundColor: "#F0F4F8",
                    boxShadow: "2px 2px 4px #D1DCEB, -2px -2px 4px #FFFFFF",
                    border: "1px solid rgba(209, 220, 235, 0.2)"
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-[10px] truncate">{r.title}</p>
                    <p className="text-[8px] text-[#8B5CF6] font-bold mt-0.5">
                      {new Date(r.remindAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(r._id)}
                    className="text-[#D1242F] hover:bg-red-50 p-1 rounded-lg transition-colors focus:outline-none shrink-0"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
              {activeReminders.length === 0 && (
                <p className="text-[10px] font-bold text-[#656D76] italic text-center py-4">No active reminders</p>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
