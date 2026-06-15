import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  X, 
  Calendar, 
  User, 
  Briefcase,
  Mail,
  Globe
} from "lucide-react";

dayjs.extend(isBetween);

export default function ClosedLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState(""); // Transferred To
  const [selectedLeadOwner, setSelectedLeadOwner] = useState(""); // Caller / Lead Owner
  const [selectedTeam, setSelectedTeam] = useState(""); // Team Filter
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  const [dateFilterType, setDateFilterType] = useState(""); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Dropdown Options
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [uniqueLeadOwners, setUniqueLeadOwners] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [teams, setTeams] = useState([]);

  // Pagination & Modal
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedLead, setSelectedLead] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [editedLead, setEditedLead] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchClosedLeads = async () => {
      try {
        const token = localStorage.getItem("token");
        const leadsResponse = await axios.get(
          `${API_BASE}/api/leads/all-assigned`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        let closedLeads = leadsResponse.data.filter(
          (lead) => lead.status === "closed"
        );

        // Extract Transferred To (Assigned To)
        const uniqueAssignedTo = [
          ...new Set(closedLeads.map((lead) => lead.assignedTo?.username).filter(Boolean)),
        ];
        setAssignedUsers(uniqueAssignedTo);

        // Extract Callers (Lead Owners)
        const uniqueOwners = [
          ...new Set(closedLeads.map((lead) => lead.leadOwner).filter(Boolean)),
        ];
        setUniqueLeadOwners(uniqueOwners);

        closedLeads = closedLeads.sort(
          (a, b) => new Date(b.closedAt) - new Date(a.closedAt)
        );

        setLeads(closedLeads);
      } catch (error) {
        console.error("Error fetching closed leads:", error);
        setError("Failed to fetch closed leads. Please try again later.");
      }
    };

    const fetchServiceTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/api/servicetypes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServiceTypes(response.data);
      } catch (error) {
        console.error("Error fetching service types:", error);
      }
    };

    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/api/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([fetchClosedLeads(), fetchServiceTypes(), fetchTeams()]);
      setLoading(false);
    };

    loadAllData();
  }, []);

  // --- Date Logic ---
  const getDateRange = () => {
    const today = dayjs();
    switch (dateFilterType) {
      case "today":
        return { start: today.startOf("day"), end: today.endOf("day") };
      case "thisMonth":
        return { start: today.startOf("month"), end: today.endOf("month") };
      case "lastMonth":
        return {
          start: today.subtract(1, "month").startOf("month"),
          end: today.subtract(1, "month").endOf("month"),
        };
      case "custom":
        return startDate && endDate
          ? { start: dayjs(startDate).startOf("day"), end: dayjs(endDate).endOf("day") }
          : null;
      default:
        return null;
    }
  };

  // --- Filter Logic ---
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Dropdown matches
      if (assignedToFilter && lead.assignedTo?.username !== assignedToFilter) return false;
      if (selectedLeadOwner && lead.leadOwner !== selectedLeadOwner) return false;
      if (serviceTypeFilter && (!lead.packages || !lead.packages.includes(serviceTypeFilter))) return false;
      
      // Team Match Logic
      const teamMatch = selectedTeam ? (() => {
        const targetTeam = teams.find(t => t._id === selectedTeam);
        if (!targetTeam) return true;
        
        const validTeamMembers = [
          ...targetTeam.members.map(m => m.username),
          targetTeam.manager?.username
        ].filter(Boolean); 

        return validTeamMembers.includes(lead.leadOwner);
      })() : true;

      if (!teamMatch) return false;

      // Search match
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        if (!lead.leadName?.toLowerCase().includes(lowerQuery) && !lead.email?.toLowerCase().includes(lowerQuery)) {
          return false;
        }
      }

      // Date match (based on closedAt)
      const dateRange = getDateRange();
      if (dateRange && lead.closedAt) {
        const closedDate = dayjs(lead.closedAt);
        if (!closedDate.isBetween(dateRange.start, dateRange.end, "day", "[]")) return false;
      }

      return true;
    });
  }, [leads, assignedToFilter, selectedLeadOwner, selectedTeam, teams, serviceTypeFilter, searchQuery, dateFilterType, startDate, endDate]);

  // --- Handlers ---
  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setEditedLead({ ...lead });
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedLead(null);
    setEditedLead(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedLead((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/leads/${selectedLead._id}`,
        editedLead,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let updatedLeads = leads.map((lead) =>
        lead._id === selectedLead._id ? response.data : lead
      );
      // Re-sort to ensure latest closed is on top
      updatedLeads = updatedLeads.sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt));
      setLeads(updatedLeads);
      handleClosePopup();
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
    }
  };

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";
  };

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // --- UI States ---
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center neu-base">
        <div className="neu-flat rounded-2xl p-10 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#D1DCEB] border-t-[#0969DA] rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-[#656D76] animate-pulse uppercase tracking-wider">Loading Closed Leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center neu-base">
        <div className="neu-flat rounded-2xl p-8 flex items-center gap-3">
          <X size={24} className="text-[#D1242F]" />
          <span className="text-sm font-bold text-[#D1242F]">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col neu-base p-4 sm:p-6 montserrat-regular text-[#1F2328]">
      
      {/* ── Header & Filters (Fixed at Top) ── */}
      <div className="shrink-0 flex flex-col gap-4 mb-4 z-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl montserrat-medium text-[#1F2328]">Did you close any leads today?</h1>
          <div className="neu-pressed-sm rounded-md px-3.5 py-1.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#1A7F37]" />
            <span className="text-xs font-bold text-[#656D76]">{filteredLeads.length} total won</span>
          </div>
        </div>

        <div className="neu-flat rounded-xl p-5 flex flex-col gap-4">
          {/* Top Row: Search */}
          <div className="relative w-full md:w-1/2 z-20">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by lead name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full neu-pressed rounded-md py-2.5 pl-10 pr-4 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
            />
          </div>

          {/* Bottom Row: Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-20">
            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Filter by Team</label>
              <select value={selectedTeam} onChange={(e) => { setSelectedTeam(e.target.value); setPage(1); }} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="">All Teams</option>
                {teams.map((team) => <option key={team._id} value={team._id}>{team.teamName}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Filter by Caller</label>
              <select value={selectedLeadOwner} onChange={(e) => { setSelectedLeadOwner(e.target.value); setPage(1); }} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="">All Callers</option>
                {uniqueLeadOwners.map((owner, idx) => <option key={idx} value={owner}>{owner}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Transferred To</label>
              <select value={assignedToFilter} onChange={(e) => { setAssignedToFilter(e.target.value); setPage(1); }} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="">All Staff</option>
                {assignedUsers.map((user) => <option key={user} value={user}>{user}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Service Type</label>
              <select value={serviceTypeFilter} onChange={(e) => { setServiceTypeFilter(e.target.value); setPage(1); }} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="">All Services</option>
                {serviceTypes.map((type) => <option key={type._id} value={type.name}>{type.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Closed Date</label>
              <select value={dateFilterType} onChange={(e) => { setDateFilterType(e.target.value); setPage(1); }} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range...</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            {dateFilterType === "custom" && (
              <div className="col-span-2 md:col-span-5 flex gap-4 mt-2">
                <div className="relative flex-1 max-w-[200px]">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full neu-pressed rounded-md p-2 text-xs font-medium text-[#1F2328] outline-none cursor-pointer" />
                </div>
                <div className="relative flex-1 max-w-[200px]">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full neu-pressed rounded-md p-2 text-xs font-medium text-[#1F2328] outline-none cursor-pointer" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table Container (Flexible Height, Internal Scroll) ── */}
      <div className="flex-1 min-h-0 relative z-10 flex flex-col neu-flat rounded-xl p-2 sm:p-4 mb-4">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-[#F0F4F8]">
              <tr>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Client Info</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Location</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Caller</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Transferred To</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Closed Info</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Packages</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-bold text-[#656D76]">No closed leads match your current filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr key={lead._id} className="border-b border-[#D1DCEB]/30 last:border-0 hover:bg-[#D1DCEB]/10 transition-colors">
                    
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full neu-btn-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getInitials(lead.leadName)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1F2328]">{lead.leadName || "N/A"}</p>
                          <p className="text-[10px] font-bold text-[#656D76] flex items-center gap-1 mt-0.5">
                            {lead.email ? <><Mail size={10} /> {lead.email}</> : "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="text-sm font-medium text-[#1F2328] flex items-center gap-1.5">
                        {lead.country ? <><Globe size={14} className="text-[#656D76]" /> {lead.country}</> : "--"}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="text-sm font-medium text-[#1F2328] flex items-center gap-1.5">
                         <User size={14} className="text-[#656D76]" /> {lead.leadOwner || "--"}
                      </span>
                    </td>

                    <td className="p-3">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full neu-flat-sm text-[#BF8700] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {lead.assignedTo.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-[#1F2328]">{lead.assignedTo.username}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-[#656D76] italic neu-pressed-sm px-2 py-1 rounded-md">Unassigned</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1A7F37]/10 text-[#1A7F37]">
                          CLOSED
                        </span>
                        <span className="text-xs font-bold text-[#656D76] pl-0.5">
                          {lead.closedAt ? dayjs(lead.closedAt).format("MMM DD, YYYY") : "--"}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <p className="text-xs font-bold text-[#0969DA] max-w-[150px] truncate">
                        {lead.packages?.join(", ") || "--"}
                      </p>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleEditClick(lead)}
                        className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#0969DA] hover:text-[#0854b3]"
                        title="Edit Lead"
                      >
                        <Edit size={16} className="pointer-events-none" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer Pagination (Fixed at Bottom) ── */}
      <div className="shrink-0 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Rows per page</label>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="neu-pressed rounded-md p-2 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="neu-flat-sm neu-action-btn rounded-md px-3 py-1.5 flex items-center gap-1 text-xs font-bold text-[#656D76] disabled:opacity-40"
          >
            <ChevronLeft size={14} className="pointer-events-none" /> Prev
          </button>
          <span className="text-xs font-bold text-[#1F2328] neu-pressed-sm px-3 py-1.5 rounded-md">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="neu-flat-sm neu-action-btn rounded-md px-3 py-1.5 flex items-center gap-1 text-xs font-bold text-[#656D76] disabled:opacity-40"
          >
             Next <ChevronRight size={14} className="pointer-events-none" />
          </button>
        </div>
      </div>

      {/* ── EDIT LEAD MODAL ── */}
      <AnimatePresence>
        {popupOpen && editedLead && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClosePopup} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10"
            >
              <div className="p-6 sm:p-8 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-bold text-[#1F2328]">Edit Closed Lead</h2>
                <button type="button" onClick={handleClosePopup} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]">
                  <X size={20} className="pointer-events-none" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                  
                  {/* Left Column: Client Details */}
                  <div className="neu-pressed rounded-xl p-6 h-fit space-y-4">
                    <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 border-b border-[#D1DCEB]/50 pb-2 flex items-center gap-2">
                      <User size={14} /> Client Details
                    </h3>
                    <div className="space-y-4 relative z-20">
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Lead Name</label>
                        <input type="text" name="leadName" value={editedLead.leadName || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Designation</label>
                        <input type="text" name="designation" value={editedLead.designation || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Email</label>
                        <input type="email" name="email" value={editedLead.email || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Phone Number</label>
                        <input type="text" name="phoneNumber" value={editedLead.phoneNumber || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Website</label>
                        <input type="text" name="website" value={editedLead.website || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Country</label>
                        <input type="text" name="country" value={editedLead.country || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Deal Overview */}
                  <div className="neu-pressed rounded-xl p-6 h-fit space-y-4">
                    <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 border-b border-[#D1DCEB]/50 pb-2 flex items-center gap-2">
                      <Briefcase size={14} /> Deal Overview
                    </h3>
                    <div className="space-y-4 relative z-20">
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Lead Type</label>
                        <input type="text" name="leadType" value={editedLead.leadType || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Caller (Lead Owner)</label>
                        <input type="text" name="leadOwner" value={editedLead.leadOwner || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Packages (Comma separated)</label>
                        <input type="text" name="packages" value={editedLead.packages || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Pitched Amount</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#656D76] font-bold text-sm pointer-events-none">{editedLead.currencySymbol || "$"}</span>
                           <input type="text" name="pitchedAmount" value={editedLead.pitchedAmount || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 pl-8 text-sm font-medium text-[#1F2328] outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Status</label>
                        <input type="text" name="status" value={editedLead.status || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1 block">Notes</label>
                        <textarea rows={3} name="note" value={editedLead.note || ""} onChange={handleInputChange} className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none resize-none custom-scrollbar" />
                      </div>
                      
                      <div className="neu-flat-sm rounded-lg p-3 flex items-center gap-2 mt-2">
                        <Calendar size={14} className="text-[#656D76]" />
                        <span className="text-xs font-bold text-[#1F2328]">
                          Closed Date: <span className="text-[#1A7F37]">{editedLead.closedAt ? dayjs(editedLead.closedAt).format("MMM DD, YYYY - h:mm A") : "N/A"}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="p-6 sm:p-8 border-t border-[#D1DCEB]/50 flex justify-end gap-4 shrink-0">
                <button type="button" onClick={handleClosePopup} className="neu-flat neu-action-btn px-6 py-2.5 rounded-lg text-sm font-bold text-[#656D76]">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} className="neu-btn-primary px-8 py-2.5 rounded-lg text-sm font-bold text-white neu-action-btn">
                  Save Changes
                </button>
              </div>
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

        /* Prevent SVG Icons from intercepting clicks */
        button svg {
          pointer-events: none !important;
        }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px var(--neu-bg) inset !important;
          -webkit-text-fill-color: #1F2328 !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 4px 0;}
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </div>
  );
}