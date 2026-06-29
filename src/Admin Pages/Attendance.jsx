import React, { useState, useEffect } from "react";
import axios from "axios";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("logs"); // logs, roles, exceptions
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [roleTimings, setRoleTimings] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // list, calendar
  
  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterUser, setFilterUser] = useState("");

  // ==========================================
  // API ROUTING SETUP
  // ==========================================
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  // Pointing to /api/auth because that's where the UserController routes are mounted
  const ROUTE_PREFIX = `${API_BASE}/api/auth`;

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // ==========================================
  // NEUMORPHIC STYLES (Tailwind based)
  // ==========================================
  const neoStyle = {
    bg: "bg-[#F0F4F8]",
    box: "bg-[#F0F4F8] shadow-[9px_9px_16px_rgba(209,220,235,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] rounded-2xl",
    inset: "bg-[#F0F4F8] shadow-[inset_6px_6px_10px_0_rgba(209,220,235,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] rounded-xl",
    input: "w-full bg-[#F0F4F8] shadow-[inset_4px_4px_8px_rgba(209,220,235,0.7),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] border-none outline-none p-3 rounded-xl text-[#1F2328] text-sm font-semibold",
    btn: "bg-[#F0F4F8] shadow-[5px_5px_10px_rgba(209,220,235,0.8),-5px_-5px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_8px_rgba(209,220,235,0.8),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-[#656D76] font-bold py-2 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
    btnActive: "bg-[#F0F4F8] shadow-[inset_4px_4px_8px_rgba(209,220,235,0.8),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] text-[#4F6EF7] font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2",
  };

  // ==========================================
  // DATA FETCHING
  // ==========================================
  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${ROUTE_PREFIX}/admin/attendance-logs`, {
        ...getAuthHeaders(),
        params: { startDate, endDate, userId: filterUser }
      });
      setLogs(res.data);
    } catch (e) { console.error("Error fetching logs", e); }
  };

  const fetchDependencies = async () => {
    try {
      const usersRes = await axios.get(`${ROUTE_PREFIX}/users`, getAuthHeaders());
      setUsers(usersRes.data);
      const rolesRes = await axios.get(`${ROUTE_PREFIX}/admin/role-timings`, getAuthHeaders());
      setRoleTimings(rolesRes.data);
    } catch (e) { console.error("Error fetching dependencies", e); }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate, filterUser]);

  // ==========================================
  // HELPERS
  // ==========================================
  const formatDisplayTime = (ms) => {
    if (!ms) return "0h 0m";
    const totalMinutes = Math.floor(ms / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const formatClockTime = (dateStr) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ==========================================
  // FORM SUBMISSIONS
  // ==========================================
  const updateRoleTiming = async (e, role) => {
    e.preventDefault();
    const reqHrs = e.target.work.value;
    const brkHrs = e.target.break.value;
    try {
      await axios.put(`${ROUTE_PREFIX}/admin/role-timings`, {
        role, requiredWorkHours: reqHrs, allottedBreakTime: brkHrs
      }, getAuthHeaders());
      alert("Role timing updated successfully!");
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
      <h2 className="text-3xl font-extrabold mb-8 ml-2 tracking-wide text-[#1F2328]">Workspace Admin</h2>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        {["logs", "roles", "exceptions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? neoStyle.btnActive : neoStyle.btn}
            style={{ textTransform: "capitalize" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* =========================================
          TAB 1: ATTENDANCE LOGS 
          ========================================= */}
      {activeTab === "logs" && (
        <div className={`${neoStyle.box} p-6`}>
          
          {/* Filters & View Toggles */}
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
                <label className="text-[10px] font-extrabold text-[#656D76] uppercase ml-2 mb-1 block tracking-wider">Specific User</label>
                <select className={neoStyle.input} value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                  <option value="">All Users</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setViewMode("list")} className={viewMode === "list" ? neoStyle.btnActive : neoStyle.btn}>
                <ViewListOutlinedIcon fontSize="small" /> List
              </button>
              <button onClick={() => setViewMode("calendar")} className={viewMode === "calendar" ? neoStyle.btnActive : neoStyle.btn}>
                <CalendarMonthOutlinedIcon fontSize="small" /> Grid
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
                    <th className="p-4">User</th>
                    <th className="p-4">Clock In</th>
                    <th className="p-4">Clock Out</th>
                    <th className="p-4">Work Time</th>
                    <th className="p-4">Break Time</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold">
                  {logs.map(log => (
                    <tr key={log._id} className="border-b border-[#D1DCEB]/40 last:border-0 hover:bg-white/10 transition-colors">
                      <td className="p-4">{log.date}</td>
                      <td className="p-4 text-[#4F6EF7] font-bold">{log.user?.username || "Unknown"}</td>
                      <td className="p-4 text-[#10B981]">{formatClockTime(log.clockIn)}</td>
                      <td className="p-4 text-[#D1242F]">{formatClockTime(log.clockOut)}</td>
                      <td className="p-4 font-bold">{formatDisplayTime(log.totalWorkTime)}</td>
                      <td className="p-4 text-[#F59E0B]">{formatDisplayTime(log.totalBreakTime)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan="6" className="p-8 text-center text-[#656D76] font-bold">No attendance logs found for this filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Calendar/Grid View */}
          {viewMode === "calendar" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {logs.map(log => (
                <div key={log._id} className={`${neoStyle.inset} p-5 flex flex-col gap-3 relative`}>
                  <div className="flex justify-between items-center border-b border-[#D1DCEB]/50 pb-2">
                    <span className="font-extrabold text-[#1F2328]">{log.date}</span>
                    <span className="text-[10px] bg-[#D1DCEB]/50 text-[#4F6EF7] px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                      {log.user?.username || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-[#656D76]">Clock In:</span>
                    <span className="text-[#10B981]">{formatClockTime(log.clockIn)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-[#656D76]">Clock Out:</span>
                    <span className="text-[#D1242F]">{formatClockTime(log.clockOut)}</span>
                  </div>
                  <div className="mt-2 pt-3 border-t border-[#D1DCEB]/50 flex justify-between items-center">
                    <span className="font-extrabold text-base">{formatDisplayTime(log.totalWorkTime)} <span className="text-[10px] text-[#656D76] font-semibold">WORK</span></span>
                    <span className="text-[#F59E0B] font-bold text-sm">{formatDisplayTime(log.totalBreakTime)} <span className="text-[10px] text-[#656D76] font-semibold">BREAK</span></span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="col-span-full p-8 text-center text-[#656D76] font-bold">No attendance logs found for this filter.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================
          TAB 2: ROLE SHIFT TIMINGS 
          ========================================= */}
      {activeTab === "roles" && (
        <div className={`${neoStyle.box} p-8 max-w-4xl`}>
          <h3 className="text-xl font-extrabold mb-2 text-[#1F2328]">Default Role Timings</h3>
          <p className="text-sm text-[#656D76] mb-8 font-medium">Set the standard required working hours and allowed break time (in minutes) for each role.</p>
          
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

      {/* =========================================
          TAB 3: USER EXCEPTIONS 
          ========================================= */}
      {activeTab === "exceptions" && (
        <div className={`${neoStyle.box} p-8 max-w-5xl`}>
          <h3 className="text-xl font-extrabold mb-2 text-[#F59E0B]">User Shift Exceptions</h3>
          <p className="text-sm text-[#656D76] mb-8 font-medium">Set custom minutes here to override the default role timings for individual users. Leave blank to default back to their role settings.</p>
          
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

export default AdminAttendance;