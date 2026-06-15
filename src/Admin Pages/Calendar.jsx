import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, Calendar as CalendarIcon } from "lucide-react";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    start: "",
    end: "",
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/events`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const eventsData = await response.json();
          const mappedEvents = eventsData.map((event) => ({
            ...event,
            id: event._id,
            title: event.title,
            start: event.start,
            end: event.end,
          }));
          setEvents(mappedEvents);
        } else {
          console.error("Failed to fetch events. Status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDateClick = (arg) => {
    setOpenModal(true);
    setNewEvent({
      title: "",
      start: arg.dateStr,
      end: arg.dateStr,
    });
    setErrors({
      title: "",
      start: "",
      end: "",
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { title: "", start: "", end: "" };

    if (!newEvent.title.trim()) {
      newErrors.title = "Title is required";
      valid = false;
    }

    if (!newEvent.start) {
      newErrors.start = "Start date is required";
      valid = false;
    }

    if (!newEvent.end) {
      newErrors.end = "End date is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const eventPayload = {
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
      };

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE}/api/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(eventPayload),
        });

        if (response.ok) {
          const savedEvent = await response.json();
          setEvents((prevEvents) => [
            ...prevEvents,
            {
              ...savedEvent,
              id: savedEvent._id,
            },
          ]);
          setOpenModal(false);
        } else {
          console.error("Failed to create event. Status:", response.status);
        }
      } catch (error) {
        console.error("Error creating event:", error);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      if (!eventId) {
        console.error("Event ID is missing");
        return;
      }

      const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
        setOpenEventModal(false);
      } else {
        console.error("Failed to delete event. Status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setOpenEventModal(true);
  };

  // Custom rendering for events to make them look Neumorphic
  const renderEventContent = (eventInfo) => {
    return (
      <div className="event-item cursor-pointer pointer-events-auto">
        <div className="event-dot shrink-0" />
        <span className="truncate">{eventInfo.event.title}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center neu-base">
        <div className="neu-flat rounded-2xl p-10 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#D1DCEB] border-t-[#0969DA] rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-[#656D76] animate-pulse uppercase tracking-wider">Loading Calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden neu-base p-4 sm:p-6 flex flex-col montserrat-regular text-[#1F2328] relative">
      
      {/* ── Header (Fixed at top) ── */}
      <div className="flex justify-between items-center shrink-0 mb-5 relative z-20">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2328]">Calendar</h1>
          <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mt-1">Manage Schedule & Events</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNewEvent({ title: "", start: "", end: "" });
            setErrors({ title: "", start: "", end: "" });
            setOpenModal(true);
          }}
          className="neu-btn-primary px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold text-white neu-action-btn"
        >
          <Plus size={16} className="pointer-events-none" />
          <span className="hidden sm:inline">Create New Event</span>
        </button>
      </div>

      {/* ── Calendar Container (Flexes to fill remaining height) ── */}
      <div className="flex-1 min-h-0 neu-flat rounded-2xl p-4 sm:p-6 relative z-10 flex flex-col overflow-hidden w-full [&_.fc]:h-full">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="100%"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek"
          }}
        />
      </div>

      {/* ── MODAL: Create Event ── */}
      <AnimatePresence>
        {openModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenModal(false)} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-md flex flex-col relative z-10"
            >
              <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#1F2328]">Create New Event</h2>
                <button type="button" onClick={() => setOpenModal(false)} className="neu-flat-sm neu-action-btn rounded-full p-2 text-[#656D76] hover:text-[#D1242F]">
                  <X size={18} className="pointer-events-none" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="relative z-20">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Event Title</label>
                  <input
                    autoFocus
                    type="text"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    placeholder="Enter event name..."
                    className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
                  />
                  {errors.title && <span className="text-[#D1242F] text-[10px] font-bold mt-1.5 block">{errors.title}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-20">
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Start Date</label>
                    <input
                      type="date"
                      name="start"
                      value={newEvent.start}
                      onChange={handleInputChange}
                      className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20"
                    />
                    {errors.start && <span className="text-[#D1242F] text-[10px] font-bold mt-1.5 block">{errors.start}</span>}
                  </div>
                  <div className="relative z-20">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">End Date</label>
                    <input
                      type="date"
                      name="end"
                      value={newEvent.end}
                      onChange={handleInputChange}
                      className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20"
                    />
                    {errors.end && <span className="text-[#D1242F] text-[10px] font-bold mt-1.5 block">{errors.end}</span>}
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#D1DCEB]/50 relative z-20">
                  <button type="button" onClick={() => setOpenModal(false)} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">
                    Cancel
                  </button>
                  <button type="submit" className="neu-btn-primary px-8 py-2.5 rounded-lg text-sm font-bold text-white neu-action-btn">
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Event Details ── */}
      <AnimatePresence>
        {openEventModal && selectedEvent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenEventModal(false)} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-sm flex flex-col relative z-10"
            >
              <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-start shrink-0">
                <div className="pr-4">
                  <h2 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Event Title</h2>
                  <p className="text-xl font-bold text-[#1F2328] leading-tight">{selectedEvent.title}</p>
                </div>
                <button type="button" onClick={() => setOpenEventModal(false)} className="neu-flat-sm neu-action-btn rounded-full p-2 text-[#656D76] hover:text-[#D1242F] shrink-0">
                  <X size={18} className="pointer-events-none" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="neu-pressed rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="neu-flat-sm p-2 rounded-lg text-[#0969DA]">
                      <CalendarIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Start Date</p>
                      <p className="text-sm font-bold text-[#1F2328]">
                        {selectedEvent.start ? new Date(selectedEvent.start).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="neu-pressed rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="neu-flat-sm p-2 rounded-lg text-[#BF8700]">
                      <CalendarIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">End Date</p>
                      <p className="text-sm font-bold text-[#1F2328]">
                        {selectedEvent.end ? new Date(selectedEvent.end).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
                <button 
                  type="button" 
                  onClick={() => handleDeleteEvent(selectedEvent?.id)} 
                  className="neu-flat-sm neu-action-btn px-4 py-2.5 rounded-lg text-xs font-bold text-[#D1242F] flex items-center gap-2"
                >
                  <Trash2 size={14} className="pointer-events-none" /> Delete
                </button>
                <button type="button" onClick={() => setOpenEventModal(false)} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Neumorphic CSS Rules & FullCalendar CSS Overrides */}
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
        
        /* Force Input Clickability */
        input, textarea, select {
          position: relative;
          z-index: 20;
          pointer-events: auto !important;
          user-select: text !important;
          -webkit-user-select: text !important;
        }

        /* Fixed Interactive Buttons */
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
        }
        .neu-btn-primary:active:not(:disabled) {
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
        }

        button svg { pointer-events: none !important; }

        /* FullCalendar Custom Neumorphic Styling */
        .fc { font-family: inherit !important; }
        .fc-theme-standard .fc-scrollgrid { border: none !important; }
        .fc-theme-standard td, .fc-theme-standard th { 
          border-color: rgba(209, 220, 235, 0.5) !important; 
        }
        .fc-col-header-cell { 
          padding: 12px 0 !important; 
          color: #656D76 !important; 
          font-size: 10px !important; 
          font-weight: bold !important; 
          text-transform: uppercase !important; 
          letter-spacing: 1px !important; 
          border-bottom: 2px solid rgba(209, 220, 235, 0.8) !important; 
        }
        .fc .fc-toolbar-title { 
          font-size: 1.1rem !important; 
          font-weight: bold !important; 
          color: #1F2328 !important; 
        }
        .fc .fc-button-primary { 
          background-color: var(--neu-bg) !important; 
          color: #656D76 !important; 
          border: none !important; 
          box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light) !important; 
          text-transform: capitalize !important; 
          font-weight: bold !important; 
          transition: all 0.2s ease !important; 
          border-radius: 8px !important; 
          padding: 6px 16px !important;
          font-size: 12px !important;
        }
        .fc .fc-button-primary:not(:disabled):active, 
        .fc .fc-button-primary:not(:disabled).fc-button-active { 
          background-color: var(--neu-bg) !important; 
          box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light) !important; 
          color: #0969DA !important; 
        }
        .fc .fc-button-primary:focus { outline: none !important; box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light) !important; }
        .fc .fc-button-primary:disabled { opacity: 0.5; box-shadow: none !important; }
        .fc-daygrid-day-number { color: #1F2328 !important; font-weight: bold !important; font-size: 12px !important; padding: 8px !important; }
        .fc-day-today { background-color: rgba(9, 105, 218, 0.05) !important; border-radius: 8px !important; }
        .fc-event { background: transparent !important; border: none !important; padding: 2px !important; }
        
        .event-item { 
          background-color: var(--neu-bg); 
          box-shadow: inset 1.5px 1.5px 3px var(--neu-dark), inset -1.5px -1.5px 3px var(--neu-light); 
          border-radius: 6px; 
          padding: 4px 6px; 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-size: 10px; 
          font-weight: bold; 
          color: #1F2328; 
          width: 100%;
        }
        .event-dot { 
          width: 6px; 
          height: 6px; 
          border-radius: 50%; 
          background-color: #0969DA; 
        }
      `}</style>
    </div>
  );
}