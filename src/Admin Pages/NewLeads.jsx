import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X, 
  Calendar,
  Globe,
  Phone,
  Mail,
  User,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

// Extend dayjs
dayjs.extend(isBetween);

export default function NewLeads() {
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [callers, setCallers] = useState([]);
  const [adminsManagers, setAdminsManagers] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilterType, setDateFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAssignedTo, setSelectedAssignedTo] = useState("");
  const [selectedCreatedBy, setSelectedCreatedBy] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showTransfersOnly, setShowTransfersOnly] = useState(false);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  
  // UI States
  const [selectedLead, setSelectedLead] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [uniqueLeadOwners, setUniqueLeadOwners] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15); 

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [
          leadsResponse, 
          adminsManagersResponse, 
          callersResponse, 
          teamsResponse
        ] = await Promise.all([
          axios.get(`${API_BASE}/api/leads/new`, config),
          axios.get(`${API_BASE}/api/auth/admins-managers`, config),
          axios.get(`${API_BASE}/api/auth/callers`, config),
          axios.get(`${API_BASE}/api/teams`, config)
        ]);

        setLeads(leadsResponse.data);
        setAdminsManagers(adminsManagersResponse.data);
        setCallers(callersResponse.data);
        setTeams(teamsResponse.data);

        const owners = [...new Set(leadsResponse.data.map((lead) => lead.leadOwner))];
        setUniqueLeadOwners(owners);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const filteredLeads = leads.filter((lead) => {
    const searchMatch = lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase());

    const dateRange = getDateRange();
    const leadDate = dayjs(lead.createdAt);
    const dateMatch = dateRange ? leadDate.isBetween(dateRange.start, dateRange.end, "day", "[]") : true;

    const assignedToMatch = selectedAssignedTo ? lead.assignedTo?._id === selectedAssignedTo : true;
    const createdByMatch = selectedCreatedBy ? lead.leadOwner === selectedCreatedBy : true;

    const teamMatch = selectedTeam ? (() => {
      const targetTeam = teams.find(t => t._id === selectedTeam);
      if (!targetTeam) return true;
      
      const validTeamMembers = [
        ...targetTeam.members.map(m => m.username),
        targetTeam.manager?.username
      ].filter(Boolean);

      return validTeamMembers.includes(lead.leadOwner);
    })() : true;

    const transfersMatch = showTransfersOnly ? Boolean(lead.assignedTo) : true;
    const unassignedMatch = showUnassignedOnly ? !lead.assignedTo : true;

    return (
      searchMatch &&
      dateMatch &&
      assignedToMatch &&
      createdByMatch &&
      teamMatch &&
      transfersMatch &&
      unassignedMatch
    );
  });

  const handleOpenModal = (lead) => {
    setSelectedLead(lead);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedLead(null);
  };

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleTransferToggle = () => {
    const next = !showTransfersOnly;
    setShowTransfersOnly(next);
    if (next) setShowUnassignedOnly(false);
  };

  const handleUnassignedToggle = () => {
    const next = !showUnassignedOnly;
    setShowUnassignedOnly(next);
    if (next) setShowTransfersOnly(false);
  };

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("hot") || s.includes("urgent")) return { text: '#D1242F', bg: 'rgba(209, 36, 47, 0.1)' };
    if (s.includes("new") || s.includes("active")) return { text: '#1A7F37', bg: 'rgba(26, 127, 55, 0.1)' };
    if (s.includes("contacted") || s.includes("progress")) return { text: '#0969DA', bg: 'rgba(9, 105, 218, 0.1)' };
    return { text: '#656D76', bg: 'rgba(101, 109, 118, 0.1)' };
  };

  // --- Loader Screen ---
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center neu-base">
        <div className="neu-flat rounded-2xl p-10 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#D1DCEB] border-t-[#0969DA] rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-[#656D76] animate-pulse uppercase tracking-wider">Loading Leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col neu-base p-4 sm:p-6 montserrat-regular text-[#1F2328]">
      
      {/* ── Header & Filters (Fixed at Top) ── */}
      <div className="shrink-0 flex flex-col gap-4 mb-4 z-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl montserrat-medium text-[#1F2328]">Find a needle in the haystack</h1>
          <div className="neu-pressed-sm rounded-md px-3.5 py-1.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#0969DA]" />
            <span className="text-xs font-bold text-[#656D76]">{filteredLeads.length} total leads</span>
          </div>
        </div>

        <div className="neu-flat rounded-xl p-5 flex flex-col gap-4">
          
          {/* Top Row: Search & Toggles */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-1/3 z-20">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by lead name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full neu-pressed rounded-md py-2.5 pl-10 pr-4 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
              />
            </div>
            
            <div className="flex items-center gap-6 relative z-20">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${showTransfersOnly ? 'neu-btn-primary' : 'neu-pressed'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${showTransfersOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <input type="checkbox" checked={showTransfersOnly} onChange={handleTransferToggle} className="hidden" />
                <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider group-hover:text-[#1F2328]">Transfers Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${showUnassignedOnly ? 'bg-[#BF8700] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]' : 'neu-pressed'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${showUnassignedOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <input type="checkbox" checked={showUnassignedOnly} onChange={handleUnassignedToggle} className="hidden" />
                <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider group-hover:text-[#1F2328]">Unassigned Only</span>
              </label>
            </div>
          </div>

          {/* Bottom Row: Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-20">
            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Team</label>
              <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="">All Teams</option>
                {teams.map((team) => <option key={team._id} value={team._id}>{team.teamName}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Caller</label>
              <select value={selectedCreatedBy} onChange={(e) => setSelectedCreatedBy(e.target.value)} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="">All Callers</option>
                {uniqueLeadOwners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Transferred To</label>
              <select value={selectedAssignedTo} onChange={(e) => setSelectedAssignedTo(e.target.value)} disabled={showUnassignedOnly} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent disabled:opacity-50">
                <option value="">All Staff</option>
                {adminsManagers.map((user) => <option key={user._id} value={user._id}>{user.username}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Date Range</label>
              <select value={dateFilterType} onChange={(e) => setDateFilterType(e.target.value)} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range...</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            {dateFilterType === "custom" && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full neu-pressed rounded-md p-2 text-xs font-medium text-[#1F2328] outline-none cursor-pointer" />
                </div>
                <div className="relative flex-1">
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
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Status & Type</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80 text-right">Pitched Amount</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-bold text-[#656D76]">No leads match your current filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const sColor = getStatusColor(lead.leadStatus || lead.leadType);
                  return (
                    <tr key={lead._id} className="border-b border-[#D1DCEB]/30 last:border-0 hover:bg-[#D1DCEB]/10 transition-colors">
                      
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full neu-btn-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {lead.leadName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1F2328]">{lead.leadName}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                               {lead.email && <span className="text-[10px] font-bold text-[#656D76] flex items-center gap-1"><Mail size={10}/> {lead.email}</span>}
                               {lead.phoneNumber && <span className="text-[10px] font-bold text-[#656D76] flex items-center gap-1"><Phone size={10}/> {lead.phoneNumber}</span>}
                            </div>
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
                        <div className="flex flex-col gap-1.5 items-start">
                          {lead.leadStatus && (
                            <span 
                              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: sColor.bg, color: sColor.text }}
                            >
                              {lead.leadStatus}
                            </span>
                          )}
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md neu-pressed-sm text-[#656D76]">
                            {lead.leadType || "Uncategorized"}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <span className="text-sm font-bold text-[#1A7F37] bg-[#1A7F37]/10 px-2 py-1 rounded-md">
                          {lead.currencySymbol} {lead.pitchedAmount?.toLocaleString() || 0}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(lead)}
                          className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#0969DA] hover:text-[#0854b3]"
                          title="View Lead Details"
                        >
                          <Eye size={16} className="pointer-events-none" />
                        </button>
                      </td>

                    </tr>
                  );
                })
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

      {/* ── Lead Details Modal ── */}
      <AnimatePresence>
        {openModal && selectedLead && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-3xl flex flex-col relative z-10 max-h-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 sm:p-8 border-b border-[#D1DCEB]/50 flex justify-between items-start shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-[#1F2328] mb-1">Lead Details</h2>
                  <p className="text-sm font-bold text-[#0969DA]">{selectedLead.leadName}</p>
                </div>
                <button 
                  type="button"
                  onClick={handleCloseModal} 
                  className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]"
                >
                  <X size={20} className="pointer-events-none" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 neu-pressed rounded-xl p-6">
                  <div>
                    <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-bold text-[#1F2328]">{selectedLead.email || "--"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-sm font-bold text-[#1F2328]">{selectedLead.phoneNumber || "--"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Country</p>
                    <p className="text-sm font-bold text-[#1F2328]">{selectedLead.country || "--"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Website</p>
                    {selectedLead.website ? (
                      <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#0969DA] hover:underline">
                        {selectedLead.website}
                      </a>
                    ) : <p className="text-sm font-bold text-[#1F2328]">--</p>}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Designation</p>
                    <p className="text-sm font-bold text-[#1F2328]">{selectedLead.designation || "--"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Pitched Amount</p>
                    <p className="text-sm font-bold text-[#1A7F37]">{selectedLead.currencySymbol} {selectedLead.pitchedAmount?.toLocaleString() || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Packages</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.packages?.length > 0 ? (
                        selectedLead.packages.map(pkg => (
                           <span key={pkg} className="neu-flat-sm px-3 py-1.5 rounded-md text-xs font-bold text-[#0969DA]">{pkg}</span>
                        ))
                      ) : (
                        <span className="text-xs font-bold text-[#656D76] italic neu-pressed-sm px-3 py-1.5 rounded-md">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Current Status</h4>
                    <span 
                      className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md inline-block"
                      style={{ 
                        backgroundColor: getStatusColor(selectedLead.leadStatus).bg, 
                        color: getStatusColor(selectedLead.leadStatus).text 
                      }}
                    >
                      {selectedLead.leadStatus || "UNKNOWN"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Internal Notes</h4>
                  <div className="neu-pressed rounded-xl p-5 text-sm font-medium text-[#1F2328] whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {selectedLead.note || <span className="italic text-[#656D76]">No notes provided.</span>}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#D1DCEB]/50 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="neu-btn-primary px-8 py-2.5 rounded-lg text-sm font-bold text-white neu-action-btn flex items-center gap-2"
                >
                  <CheckCircle size={16} className="pointer-events-none" /> Done
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