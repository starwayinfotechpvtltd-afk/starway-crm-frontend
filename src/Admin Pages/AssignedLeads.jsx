import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  Send, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  UserMinus,
  RefreshCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

export default function AssignedLeads() {
  const [isLoading, setIsLoading] = useState(true);
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  const loggedInUsername = localStorage.getItem("username");

  // Filter & Toggle States
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityToggle, setVisibilityToggle] = useState("active"); // "active", "dropped", "all"
  const [sortOrder, setSortOrder] = useState("newest");

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLeadOwner, setSelectedLeadOwner] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [dateFilterType, setDateFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal & Pagination State
  const [selectedLead, setSelectedLead] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leadIdToUnassign, setLeadIdToUnassign] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Comments State
  const [openComments, setOpenComments] = useState(false);
  const [activeCommentLead, setActiveCommentLead] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchAssignedLeads(),
          fetchUsers(),
          fetchTeams()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const fetchAssignedLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/leads/all-assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedLeads(response.data);
    } catch (error) {
      console.error("Error fetching assigned leads:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/auth/admins-managers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) { console.error("Error fetching users:", error); }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(response.data);
    } catch (error) { console.error("Error fetching teams:", error); }
  };

  const uniqueLeadOwners = useMemo(() => {
    const owners = assignedLeads.map((lead) => lead.leadOwner).filter(Boolean);
    return [...new Set(owners)];
  }, [assignedLeads]);

  // --- Handlers ---
  const handleUnassign = (leadId) => {
    setLeadIdToUnassign(leadId);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setLeadIdToUnassign(null);
  };

  const handleUnassignConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/leads/unassign/${leadIdToUnassign}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads(prev => prev.filter(l => l._id !== leadIdToUnassign));
    } catch (error) {
      console.error("Error unassigning lead:", error);
    } finally {
      handleConfirmClose();
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      let updateData = { status: newStatus };
      if (newStatus === "closed") updateData.closedAt = new Date();
      else updateData.closedAt = null;

      await axios.put(`${API_BASE}/api/leads/update-status/${leadId}`, updateData, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads((prevLeads) =>
        prevLeads.map((lead) => lead._id === leadId ? { ...lead, status: newStatus, closedAt: updateData.closedAt } : lead)
      );
    } catch (error) { console.error("Error updating lead status:", error); }
  };

  const handleUpdateFollowUp = async (leadId, newDate) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/leads/${leadId}/follow-up`, { followUpDate: newDate }, { headers: { Authorization: `Bearer ${token}` } });
      setAssignedLeads((prev) => prev.map((lead) => lead._id === leadId ? { ...lead, followUpDate: newDate } : lead));
      setSelectedLead((prev) => prev ? { ...prev, followUpDate: newDate } : null);
    } catch (error) { alert("Failed to update follow-up date."); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const token = localStorage.getItem("token");
      const fallbackComment = { text: newComment, postedBy: { username: loggedInUsername }, postedAt: new Date() };
      const res = await axios.post(`${API_BASE}/api/leads/${activeCommentLead._id}/comments`, { text: newComment }, { headers: { Authorization: `Bearer ${token}` } });

      const updatedComments = res.data.comments || [...(activeCommentLead.comments || []), fallbackComment];
      setAssignedLeads((prev) => prev.map(lead => lead._id === activeCommentLead._id ? { ...lead, comments: updatedComments } : lead));
      setActiveCommentLead((prev) => ({ ...prev, comments: updatedComments }));
      setNewComment("");
    } catch (error) { alert("Failed to post comment."); }
    finally { setIsSubmittingComment(false); }
  };

  const handleOpen = (lead) => { setSelectedLead(lead); setOpen(true); };
  const handleClose = () => { setSelectedLead(null); setOpen(false); };

  const handleMarkDropped = async (leadId) => {
    if (!window.confirm("Are you sure you want to mark this lead as DROPPED?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/leads/update-status/${leadId}`,
        { status: "dropped" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedLeads((prev) => prev.map((lead) => lead._id === leadId ? { ...lead, status: "dropped" } : lead));
    } catch (error) { alert("Failed to drop lead."); }
  };

  const handleUndrop = async (leadId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/leads/update-status/${leadId}`,
        { status: "ongoing" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedLeads((prev) => prev.map((lead) => lead._id === leadId ? { ...lead, status: "ongoing" } : lead));
    } catch (error) { alert("Failed to undrop lead."); }
  };

  const getDateRange = () => {
    const today = dayjs();
    switch (dateFilterType) {
      case "today": return { start: today.startOf("day"), end: today.endOf("day") };
      case "thisMonth": return { start: today.startOf("month"), end: today.endOf("month") };
      case "lastMonth": return { start: today.subtract(1, "month").startOf("month"), end: today.subtract(1, "month").endOf("month") };
      case "custom": return startDate && endDate ? { start: dayjs(startDate).startOf("day"), end: dayjs(endDate).endOf("day") } : null;
      default: return null;
    }
  };

  // --- Filtering & Sorting Logic ---
  const processedLeads = useMemo(() => {
    let filtered = assignedLeads.filter((lead) => {
      if (visibilityToggle === "active" && lead.status === "dropped") return false;
      if (visibilityToggle === "dropped" && lead.status !== "dropped") return false;

      const searchMatch = lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) || lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = selectedStatus !== "all" ? lead.status === selectedStatus : true;
      const assignedToMatch = selectedUser ? lead.assignedTo?._id === selectedUser : true;
      const ownerMatch = selectedLeadOwner ? lead.leadOwner === selectedLeadOwner : true;

      const teamMatch = selectedTeam ? (() => {
        const targetTeam = teams.find(t => t._id === selectedTeam);
        if (!targetTeam) return true;
        const validTeamMembers = [...targetTeam.members.map(m => m.username), targetTeam.manager?.username].filter(Boolean);
        return validTeamMembers.includes(lead.leadOwner);
      })() : true;

      const dateRange = getDateRange();
      const dateMatch = dateRange && lead.assignedAt ? dayjs(lead.assignedAt).isBetween(dateRange.start, dateRange.end, "day", "[]") : true;

      return searchMatch && statusMatch && assignedToMatch && ownerMatch && teamMatch && dateMatch;
    });

    if (sortOrder === "followup_asc" || sortOrder === "followup_desc") {
      filtered.sort((a, b) => {
        if (!a.followUpDate) return 1;
        if (!b.followUpDate) return -1;
        const dateA = new Date(a.followUpDate).getTime();
        const dateB = new Date(b.followUpDate).getTime();
        return sortOrder === "followup_asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      filtered.sort((a, b) => new Date(b.assignedAt || b.createdAt) - new Date(a.assignedAt || a.createdAt));
    }

    return filtered;
  }, [assignedLeads, searchTerm, selectedStatus, selectedUser, selectedLeadOwner, selectedTeam, dateFilterType, startDate, endDate, visibilityToggle, sortOrder, teams]);

  const paginatedLeads = processedLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(processedLeads.length / rowsPerPage) || 1;

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "ongoing") return { text: '#0969DA', bg: 'rgba(9, 105, 218, 0.1)' };
    if (s === "closed") return { text: '#1A7F37', bg: 'rgba(26, 127, 55, 0.1)' };
    if (s === "dropped") return { text: '#D1242F', bg: 'rgba(209, 36, 47, 0.1)' };
    if (s.includes("hot") || s.includes("urgent")) return { text: '#D1242F', bg: 'rgba(209, 36, 47, 0.1)' };
    return { text: '#656D76', bg: 'rgba(101, 109, 118, 0.1)' };
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center neu-base">
        <div className="neu-flat rounded-2xl p-10 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#D1DCEB] border-t-[#0969DA] rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-[#656D76] animate-pulse uppercase tracking-wider">Loading Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col neu-base p-4 sm:p-6 montserrat-regular text-[#1F2328]">
      
      {/* ── Header & Filters (Fixed at Top) ── */}
      <div className="shrink-0 flex flex-col gap-4 mb-4 z-20">
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl montserrat-medium text-[#1F2328]">What your sales team has been up to?</h1>
          <div className="neu-pressed-sm rounded-md px-3.5 py-1.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#0969DA]" />
            <span className="text-xs font-bold text-[#656D76]">{processedLeads.length} leads found</span>
          </div>
        </div>

        <div className="neu-flat rounded-xl p-5 flex flex-col gap-5">
          
          {/* Top Row: Search, Toggle & Sort */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D1DCEB]/50 pb-4">
            
            <div className="relative w-full md:w-1/3 z-20">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by lead name or email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full neu-pressed rounded-md py-2.5 pl-10 pr-4 text-sm font-medium text-[#1F2328] outline-none cursor-text relative z-20"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 relative z-20">
              {/* Pipeline Toggle */}
              <div className="neu-pressed rounded-md p-1 flex items-center">
                {[
                  { id: "active", label: "Active Pipeline" },
                  { id: "dropped", label: "Dropped" },
                  { id: "all", label: "All Leads" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setVisibilityToggle(tab.id); setPage(1); }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all neu-action-btn ${
                      visibilityToggle === tab.id ? "neu-flat text-[#0969DA]" : "text-[#656D76] bg-transparent shadow-none"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort Order */}
              <div className="relative">
                <select 
                  value={sortOrder} 
                  onChange={(e) => { setSortOrder(e.target.value); setPage(1); }} 
                  className="w-full neu-pressed rounded-md p-2.5 pr-8 text-xs font-bold text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="followup_asc">Follow-up: Nearest to Farthest</option>
                  <option value="followup_desc">Follow-up: Farthest to Nearest</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#656D76] pointer-events-none" />
              </div>
            </div>
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
              <select value={selectedUser} onChange={(e) => { setSelectedUser(e.target.value); setPage(1); }} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="">All Assignees</option>
                {users.map((user) => <option key={user._id} value={user._id}>{user.username}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Status</label>
              <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }} className="w-full neu-pressed rounded-md p-2.5 pr-8 text-sm font-medium text-[#1F2328] outline-none cursor-pointer appearance-none bg-transparent">
                <option value="all">All Sub-Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="closed">Closed</option>
                <option value="dropped">Dropped</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 bottom-3 text-[#656D76] pointer-events-none" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Assignment Date</label>
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
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Client Info & Latest Update</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Transferred To</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Follow-up</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Status</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80">Pitched Amt</th>
                <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/80 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-sm font-bold text-[#656D76]">No assigned leads match your current filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const latestComment = lead.comments && lead.comments.length > 0 ? lead.comments[lead.comments.length - 1] : null;
                  const sColor = getStatusColor(lead.status);

                  return (
                    <tr key={lead._id} className={`border-b border-[#D1DCEB]/30 last:border-0 hover:bg-[#D1DCEB]/10 transition-colors ${lead.status === 'dropped' ? 'opacity-60' : 'opacity-100'}`}>
                      
                      <td className="p-3 max-w-[300px]">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full neu-btn-primary flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                            {lead.leadName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-bold text-[#1F2328] truncate">{lead.leadName || "N/A"}</p>
                            <p className="text-[10px] font-bold text-[#656D76] truncate">{lead.email} • Caller: {lead.leadOwner}</p>
                            {latestComment && (
                              <div className="mt-1.5 neu-pressed-sm rounded-md px-2 py-1 max-w-full overflow-hidden text-ellipsis">
                                <p className="text-[10px] text-[#656D76] truncate italic font-medium">
                                  <span className="font-bold text-[#1F2328] mr-1">{latestComment.postedBy?.username || "Unknown"}:</span>
                                  "{latestComment.text}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
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
                        {lead.followUpDate ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0969DA] bg-[#0969DA]/10 px-2 py-1 rounded-md w-fit">
                            <CalendarIcon size={12} />
                            {dayjs(lead.followUpDate).format('MMM DD, YYYY')}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-[#656D76]">No Date Set</span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="relative w-28">
                          <select
                            value={lead.status || "ongoing"}
                            onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                            className="w-full neu-pressed-sm rounded-md p-1.5 pr-6 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none bg-transparent"
                            style={{ color: sColor.text }}
                          >
                            <option value="ongoing">ONGOING</option>
                            <option value="closed">CLOSED</option>
                            <option value="dropped">DROPPED</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: sColor.text }} />
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="text-sm font-bold text-[#1A7F37] bg-[#1A7F37]/10 px-2 py-1 rounded-md">
                          {lead.currencySymbol} {lead.pitchedAmount?.toLocaleString() || 0}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {lead.status === "dropped" ? (
                            <button
                              type="button"
                              onClick={() => handleUndrop(lead._id)}
                              className="neu-flat-sm neu-action-btn rounded-md px-3 py-1.5 text-[10px] font-bold text-[#1A7F37] border border-[#1A7F37]/30"
                            >
                              Undrop
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkDropped(lead._id)}
                              className="neu-flat-sm neu-action-btn rounded-md px-3 py-1.5 text-[10px] font-bold text-[#D1242F] border border-[#D1242F]/30"
                            >
                              Drop
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleUnassign(lead._id)}
                            className="neu-flat-sm neu-action-btn rounded-md px-3 py-1.5 text-[10px] font-bold text-[#656D76]"
                          >
                            <UserMinus size={14} className="pointer-events-none" />
                          </button>

                          <button
                            type="button"
                            onClick={() => { setActiveCommentLead(lead); setOpenComments(true); }}
                            className="neu-flat-sm neu-action-btn rounded-md p-1.5 text-[#0969DA] relative"
                          >
                            <MessageSquare size={14} className="pointer-events-none" />
                            {(lead.comments?.length || 0) > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#D1242F] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                {lead.comments.length}
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpen(lead)}
                            className="neu-flat-sm neu-action-btn rounded-md p-1.5 text-[#656D76]"
                          >
                            <Eye size={14} className="pointer-events-none" />
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
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
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


      {/* ── MODALS ── */}

      {/* 1. Comments Modal */}
      <AnimatePresence>
        {openComments && activeCommentLead && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenComments(false)} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-lg flex flex-col h-[600px] relative z-10"
            >
              <div className="p-6 border-b border-[#D1DCEB]/50 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[#1F2328]">Team Comments</h2>
                <button type="button" onClick={() => setOpenComments(false)} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]">
                  <X size={18} className="pointer-events-none" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {activeCommentLead.comments?.length > 0 ? (
                  activeCommentLead.comments.map((comment, i) => (
                    <div key={i} className="neu-pressed rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2 border-b border-[#D1DCEB]/30 pb-2">
                        <span className="text-xs font-bold text-[#1F2328]">{comment.postedBy?.username || "Unknown"}</span>
                        <span className="text-[10px] font-bold text-[#656D76]">{dayjs(comment.postedAt).format('MMM DD, HH:mm')}</span>
                      </div>
                      <p className="text-sm font-medium text-[#1F2328] whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#656D76] mt-10 text-sm font-bold italic">No comments on this lead yet.</p>
                )}
              </div>

              <div className="p-6 border-t border-[#D1DCEB]/50 shrink-0">
                <div className="flex gap-3 relative z-20">
                  <textarea
                    rows="2"
                    placeholder="Type a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 neu-pressed rounded-lg p-3 text-sm font-medium text-[#1F2328] outline-none resize-none custom-scrollbar relative z-20"
                  />
                  <button
                    type="button"
                    disabled={isSubmittingComment || !newComment.trim()}
                    onClick={handleAddComment}
                    className="neu-btn-primary rounded-lg px-5 flex items-center justify-center text-white disabled:opacity-50 neu-action-btn"
                  >
                    <Send size={18} className="pointer-events-none" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Lead Details Modal */}
      <AnimatePresence>
        {open && selectedLead && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10"
            >
              <div className="p-6 sm:p-8 border-b border-[#D1DCEB]/50 flex justify-between items-start shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-[#1F2328] mb-1">Assigned Lead Details</h2>
                  <p className="text-sm font-bold text-[#0969DA]">{selectedLead.leadName}</p>
                </div>
                <button type="button" onClick={handleClose} className="neu-flat-sm neu-action-btn rounded-full p-2.5 text-[#656D76] hover:text-[#D1242F]">
                  <X size={20} className="pointer-events-none" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                  
                  {/* Left Column */}
                  <div className="neu-pressed rounded-xl p-6 h-fit">
                    <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-4 border-b border-[#D1DCEB]/50 pb-2">Contact Information</h3>
                    <div className="space-y-4">
                      <div><p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Name</p><p className="text-sm font-bold text-[#1F2328]">{selectedLead.leadName}</p></div>
                      <div><p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Email</p><p className="text-sm font-bold text-[#1F2328]">{selectedLead.email}</p></div>
                      <div><p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Phone</p><p className="text-sm font-bold text-[#1F2328]">{selectedLead.phoneNumber}</p></div>
                      <div><p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Website</p><p className="text-sm font-bold text-[#0969DA] hover:underline cursor-pointer">{selectedLead.website || "N/A"}</p></div>
                      <div><p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Country</p><p className="text-sm font-bold text-[#1F2328]">{selectedLead.country}</p></div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="neu-pressed rounded-xl p-6 h-fit">
                    <h3 className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-4 border-b border-[#D1DCEB]/50 pb-2">Strategy & Follow-up</h3>
                    <div className="space-y-5">
                      
                      <div className="relative z-20">
                        <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Follow-up Date</label>
                        <input
                          type="date"
                          value={selectedLead.followUpDate ? dayjs(selectedLead.followUpDate).format('YYYY-MM-DD') : ""}
                          onChange={(e) => handleUpdateFollowUp(selectedLead._id, e.target.value)}
                          className="w-full neu-pressed-sm rounded-md p-2.5 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Transferred To</p>
                           <p className="text-sm font-bold text-[#1F2328]">{selectedLead.assignedTo?.username || "N/A"}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1">Pitched Amount</p>
                           <p className="text-lg font-bold text-[#1A7F37]">{selectedLead.currencySymbol || "$"}{selectedLead.pitchedAmount?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2">Original Note</p>
                        <div className="neu-flat-sm rounded-xl p-4 text-sm font-medium text-[#1F2328] whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto custom-scrollbar">
                          {selectedLead.note || <span className="italic text-[#656D76]">No notes provided.</span>}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 border-t border-[#D1DCEB]/50 flex justify-end shrink-0">
                <button type="button" onClick={handleClose} className="neu-btn-primary px-8 py-2.5 rounded-lg text-sm font-bold text-white neu-action-btn flex items-center gap-2">
                  <CheckCircle size={16} className="pointer-events-none" /> Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Confirm Unassign Modal */}
      <AnimatePresence>
        {confirmOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleConfirmClose} className="fixed inset-0 bg-[#F0F4F8]/85 backdrop-blur-sm z-0 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} 
              className="neu-flat rounded-2xl w-full max-w-sm flex flex-col relative z-10 p-8 text-center items-center"
            >
              <div className="neu-pressed-sm p-4 rounded-full text-[#D1242F] mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#1F2328] mb-2">Unassign Lead?</h2>
              <p className="text-sm font-medium text-[#656D76] mb-8">
                Are you sure? They will be removed from this view and returned to the main unassigned pool.
              </p>
              
              <div className="flex gap-4 w-full">
                <button type="button" onClick={handleConfirmClose} className="flex-1 neu-flat neu-action-btn rounded-lg py-3 text-sm font-bold text-[#656D76]">
                  Cancel
                </button>
                <button type="button" onClick={handleUnassignConfirm} className="flex-1 neu-flat neu-action-btn border border-[#D1242F]/30 rounded-lg py-3 text-sm font-bold text-[#D1242F]">
                  Unassign Lead
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