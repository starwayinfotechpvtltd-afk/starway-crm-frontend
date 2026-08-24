import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import FreeBreakfastOutlinedIcon from "@mui/icons-material/FreeBreakfastOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

const Timesheet = () => {
  const [activeTab, setActiveTab] = useState("logs"); // logs, roles, exceptions
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [roleTimings, setRoleTimings] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // list, calendar
  
  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterUser, setFilterUser] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
  const ROUTE_PREFIX = `${API_BASE}/api/auth`;

  const getAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }), []);

  const neoStyle = {
    bg: "bg-[#F8FAFC]",
    box: "ent-card",
    inset: "bg-slate-50/70 border border-slate-200 rounded p-4",
    input: "ent-input",
    btn: "ent-btn-secondary",
    btnActive: "ent-btn-primary",
  };

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get(`${ROUTE_PREFIX}/admin/attendance-logs`, {
        ...getAuthHeaders(),
        params: { startDate, endDate, userId: filterUser }
      });
      setLogs(res.data);
    } catch (e) { console.error("Error fetching timesheet logs", e); }
  }, [ROUTE_PREFIX, getAuthHeaders, startDate, endDate, filterUser]);

  const fetchDependencies = useCallback(async () => {
    try {
      const usersRes = await axios.get(`${ROUTE_PREFIX}/users`, getAuthHeaders());
      setUsers(usersRes.data);
      const rolesRes = await axios.get(`${ROUTE_PREFIX}/admin/role-timings`, getAuthHeaders());
      setRoleTimings(rolesRes.data);
    } catch (e) { console.error("Error fetching dependencies", e); }
  }, [ROUTE_PREFIX, getAuthHeaders]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDisplayTime = (ms) => {
    if (!ms || ms < 0) return "0h 0m 0s";
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const formatClockTime = (dateStr) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const updateRoleTiming = async (e, role) => {
    e.preventDefault();
    const reqHrs = e.target.work.value;
    const brkHrs = e.target.break.value;
    try {
      await axios.put(`${ROUTE_PREFIX}/admin/role-timings`, {
        role, requiredWorkHours: reqHrs, allottedBreakTime: brkHrs
      }, getAuthHeaders());
      alert("Role timing updated successfully!");
      fetchDependencies(); // Refresh roleTimings so UI reflects saved values
    } catch (err) { alert("Error updating role"); }
  };

  const updateUserException = async (e, userId) => {
    e.preventDefault();
    const customWork = e.target.customWork.value;
    const customBreak = e.target.customBreak.value;
    try {
      await axios.put(`${ROUTE_PREFIX}/admin/user-exceptions/${userId}`, {
        customWorkHours: customWork ? Number(customWork) : null,
        customBreakTime: customBreak ? Number(customBreak) : null
      }, getAuthHeaders());
      alert("User exception updated successfully!");
      fetchDependencies();
    } catch (err) { alert("Error updating user exception"); }
  };

  return (
    <div className={`min-h-screen p-8 ${neoStyle.bg} text-[#1F2328] font-['Montserrat']`}>
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-8 ml-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-wide text-[#1F2328]">HR Employee Timesheet</h2>
          <p className="text-xs text-[#656D76] font-semibold mt-1">
            Real-time work hours, breaks, and location verification logs (Target Office: 22.539493, 88.377259)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        {[
          { key: "logs", label: "Timesheet Logs" },
          { key: "roles", label: "Role Timings" },
          { key: "exceptions", label: "User Shift Exceptions" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? neoStyle.btnActive : neoStyle.btn}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TIMESHEET LOGS */}
      {activeTab === "logs" && (
        <div className={`${neoStyle.box} p-6`}>
          
          {/* Filters & Toggles */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-[10px] font-extrabold text-[#656D76] uppercase ml-2 mb-1 block tracking-wider">From Date</label>
                <input type="date" className={neoStyle.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-[#656D76] uppercase ml-2 mb-1 block tracking-wider">To Date</label>
                <input type="date" className={neoStyle.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-[#656D76] uppercase ml-2 mb-1 block tracking-wider">Filter Employee</label>
                <select className={neoStyle.input} value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                  <option value="">All Employees</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.role})</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setViewMode("list")} className={viewMode === "list" ? neoStyle.btnActive : neoStyle.btn}>
                <ViewListOutlinedIcon fontSize="small" /> List
              </button>
              <button onClick={() => setViewMode("calendar")} className={viewMode === "calendar" ? neoStyle.btnActive : neoStyle.btn}>
                <CalendarMonthOutlinedIcon fontSize="small" /> Cards
              </button>
            </div>
          </div>

          {/* List View */}
          {viewMode === "list" && (
            <div className={`${neoStyle.inset} overflow-hidden`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#D1DCEB]/30 text-[#656D76] text-xs uppercase tracking-wider font-extrabold">
                    <th className="p-4">Date</th>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Login Time</th>
                    <th className="p-4">Logout Time</th>
                    <th className="p-4">Total Work Time</th>
                    <th className="p-4">Break Duration</th>
                    <th className="p-4">Breaks Count</th>
                    <th className="p-4">Location</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold">
                  {logs.map(log => {
                    const breakCount = log.breaks ? log.breaks.length : 0;
                    return (
                      <tr key={log._id} className="border-b border-[#D1DCEB]/40 last:border-0 hover:bg-white/10 transition-colors">
                        <td className="p-4">{log.date}</td>
                        <td className="p-4">
                          <span className="text-[#4F6EF7] font-bold block">{log.user?.username || "Unknown"}</span>
                          <span className="text-[10px] text-[#656D76] uppercase tracking-wider font-extrabold">{log.user?.role || "Employee"}</span>
                        </td>
                        <td className="p-4 text-[#10B981] font-mono font-bold">{formatClockTime(log.clockIn)}</td>
                        <td className="p-4 text-[#D1242F] font-mono font-bold">{formatClockTime(log.clockOut)}</td>
                        <td className="p-4 font-bold font-mono text-indigo-700">{formatDisplayTime(log.totalWorkTime)}</td>
                        <td className="p-4 text-[#F59E0B] font-mono font-bold">{formatDisplayTime(log.totalBreakTime)}</td>
                        <td className="p-4 font-bold">{breakCount} break{breakCount === 1 ? "" : "s"}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                            <LocationOnOutlinedIcon style={{ fontSize: 14 }} /> Verified
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr><td colSpan="8" className="p-8 text-center text-[#656D76] font-bold">No timesheet records found for the selected filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards View */}
          {viewMode === "calendar" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {logs.map(log => {
                const breakCount = log.breaks ? log.breaks.length : 0;
                return (
                  <div key={log._id} className={`${neoStyle.inset} p-5 flex flex-col gap-3 relative`}>
                    <div className="flex justify-between items-center border-b border-[#D1DCEB]/50 pb-2">
                      <span className="font-extrabold text-[#1F2328]">{log.date}</span>
                      <span className="text-[10px] bg-[#D1DCEB]/50 text-[#4F6EF7] px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                        {log.user?.username || "Unknown"} ({log.user?.role})
                      </span>
                    </div>

                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#656D76]">Login Shift:</span>
                      <span className="text-[#10B981] font-mono font-bold">{formatClockTime(log.clockIn)}</span>
                    </div>

                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#656D76]">Logout Shift:</span>
                      <span className="text-[#D1242F] font-mono font-bold">{formatClockTime(log.clockOut)}</span>
                    </div>

                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#656D76]">Breaks Taken:</span>
                      <span className="text-[#F59E0B] font-bold">{breakCount} session{breakCount === 1 ? "" : "s"}</span>
                    </div>

                    <div className="mt-2 pt-3 border-t border-[#D1DCEB]/50 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-[#656D76] font-extrabold uppercase block">Work Time</span>
                        <span className="font-extrabold text-sm font-mono text-indigo-700">{formatDisplayTime(log.totalWorkTime)}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#656D76] font-extrabold uppercase block">Break Time</span>
                        <span className="text-[#F59E0B] font-bold text-sm font-mono">{formatDisplayTime(log.totalBreakTime)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {logs.length === 0 && (
                <div className="col-span-full p-8 text-center text-[#656D76] font-bold">No timesheet records found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLE TIMINGS */}
      {activeTab === "roles" && (
        <div className={`${neoStyle.box} p-8 max-w-4xl`}>
          <h3 className="text-xl font-extrabold mb-2 text-[#1F2328]">Default Shift Timings</h3>
          <p className="text-sm text-[#656D76] mb-8 font-medium">Set the standard required working hours and allotted break time (in minutes) for each role.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {["developer", "caller", "manager", "admin"].map(role => {
              const current = roleTimings.find(r => r.role === role) || { requiredWorkHours: 480, allottedBreakTime: 60 };
              return (
                <form key={role} onSubmit={(e) => updateRoleTiming(e, role)} className={`${neoStyle.inset} p-6 flex flex-col gap-4`}>
                  <div className="flex items-center justify-between border-b border-[#D1DCEB]/50 pb-3">
                    <h4 className="font-extrabold text-lg text-[#4F6EF7] uppercase tracking-widest">{role}</h4>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Required Work (Mins)</label>
                    <input name="work" type="number" defaultValue={current.requiredWorkHours} className={neoStyle.input} required />
                    <span className="text-[10px] text-[#656D76] font-medium italic">Example: 480 mins = 8 hours</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#656D76] uppercase tracking-wider">Allotted Break (Mins)</label>
                    <input name="break" type="number" defaultValue={current.allottedBreakTime} className={neoStyle.input} required />
                    <span className="text-[10px] text-[#656D76] font-medium italic">Example: 60 mins = 1 hour</span>
                  </div>
                  
                  <button type="submit" className={`${neoStyle.btn} mt-2 text-[#10B981]`}>Save {role} Timings</button>
                </form>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: USER EXCEPTIONS */}
      {activeTab === "exceptions" && (
        <div className={`${neoStyle.box} p-8 max-w-5xl`}>
          <h3 className="text-xl font-extrabold mb-2 text-[#F59E0B]">User Shift Exceptions</h3>
          <p className="text-sm text-[#656D76] mb-8 font-medium">Set custom minutes here to override default role timings for specific individual users.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map(user => (
              <form key={user._id} onSubmit={(e) => updateUserException(e, user._id)} className={`${neoStyle.inset} p-5 flex flex-col gap-4`}>
                <div className="flex items-center justify-between border-b border-[#D1DCEB]/50 pb-2">
                  <h4 className="font-extrabold text-[#1F2328] text-lg">{user.username}</h4>
                  <span className="text-[10px] bg-[#D1DCEB]/50 text-[#656D76] px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">{user.role}</span>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Custom Work (Mins)</label>
                    <input name="customWork" type="number" defaultValue={user.customWorkHours || ""} placeholder="Role Default" className={neoStyle.input} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider">Custom Break (Mins)</label>
                    <input name="customBreak" type="number" defaultValue={user.customBreakTime || ""} placeholder="Role Default" className={neoStyle.input} />
                  </div>
                </div>
                
                <button type="submit" className={neoStyle.btn}>Update {user.username}</button>
              </form>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Timesheet;
