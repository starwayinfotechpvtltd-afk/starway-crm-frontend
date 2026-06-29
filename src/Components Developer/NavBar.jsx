
// import React, { useState, useEffect, useRef } from "react";
// import assets from "../assets/assets";
// import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
// import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
// import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
// import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
// import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

// // Attendance Icons
// import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
// import FreeBreakfastOutlinedIcon from "@mui/icons-material/FreeBreakfastOutlined";
// import StopOutlinedIcon from "@mui/icons-material/StopOutlined";
// import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

// import { Link, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

//   :root {
//     --neu-bg: #F0F4F8;
//     --neu-light: #FFFFFF;
//     --neu-dark: #D1DCEB;
//     --accent: #4F6EF7;
//     --text-primary: #1F2328;
//     --text-muted: #656D76;
//     --red: #D1242F;
//     --green: #10B981;
//     --orange: #F59E0B;
//   }

//   .dev-navbar {
//     font-family: 'Montserrat', sans-serif;
//     position: sticky;
//     top: 0;
//     z-index: 50;
//     background: var(--neu-bg);
//     box-shadow: 0 4px 10px -2px rgba(209, 220, 235, 0.6);
//     border: none;
//     padding: 20px 32px;
//     height: 70px;
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     gap: 16px;
//   }

//   .dev-nb-logo { height: 40px; width: auto; flex-shrink: 0; }
//   .dev-nb-nav { display: flex; align-items: center; gap: 6px; }
//   .dev-nb-link { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--text-muted); text-decoration: none; background: transparent; transition: all 0.2s ease; white-space: nowrap; border: none; }
//   .dev-nb-link:hover { box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); color: var(--text-primary); }
//   .dev-nb-link.active { box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light); color: var(--accent); background: var(--neu-bg); }
//   .dev-nb-link svg { font-size: 18px !important; opacity: 0.8; }
//   .dev-nb-link.active svg { opacity: 1; }
  
//   /* --- NEW: ATTENDANCE UI --- */
//   .attendance-group { display: flex; align-items: center; gap: 12px; margin: 0 auto; padding: 0 16px; border-left: 2px solid rgba(209, 220, 235, 0.5); border-right: 2px solid rgba(209, 220, 235, 0.5); }
  
//   .timer-box { background: var(--neu-bg); box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light); padding: 4px 14px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; min-width: 90px; position: relative; }
//   .timer-label { font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
//   .timer-value { font-size: 14px; font-family: monospace; font-weight: 800; letter-spacing: 1px; }
//   .timer-value.work { color: var(--green); }
//   .timer-value.break { color: var(--orange); }
//   .timer-value.danger { color: var(--red); animation: pulse 1s infinite; }
  
//   .att-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s ease; box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); background: var(--neu-bg); font-family: 'Montserrat', sans-serif; }
//   .att-btn:active:not(:disabled) { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light); }
//   .att-btn svg { font-size: 16px !important; }
//   .att-btn.start { color: var(--green); }
//   .att-btn.break { color: var(--orange); }
//   .att-btn.end { color: var(--red); }
//   .att-btn.disabled { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light); opacity: 0.6; cursor: not-allowed; color: var(--text-muted); }
  
//   @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
//   .over-break-warn { position: absolute; bottom: -14px; font-size: 8px; color: var(--red); font-weight: 800; text-transform: uppercase; white-space: nowrap; }

//   /* --- EXISTING STYLES --- */
//   .dev-nb-right { display: flex; align-items: center; gap: 18px; flex-shrink: 0; position: relative; }
//   .dev-nb-username { font-size: 13px; font-weight: 600; color: var(--text-muted); }
//   .dev-nb-username span { color: var(--accent); font-weight: 700; }
  
//   .dev-nb-logout { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--neu-bg); box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); border: none; border-radius: 8px; padding: 7px 16px; cursor: pointer; transition: all 0.15s ease; }
//   .dev-nb-logout:hover { color: var(--red); }
//   .dev-nb-logout:active { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light); }
  
//   .notification-container { position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; background: var(--neu-bg); transition: all 0.2s ease; }
//   .notification-container:hover { box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); }
//   .notification-container:active { box-shadow: inset 2px 2px 4px var(--neu-dark), inset -2px -2px 4px var(--neu-light); }
//   .notification-bell { font-size: 20px !important; color: var(--text-muted); transition: color 0.15s ease; }
//   .notification-container:hover .notification-bell { color: var(--text-primary); }
//   .notification-badge { position: absolute; top: -2px; right: -2px; background: var(--red); color: white; font-size: 9px; font-weight: 800; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; box-shadow: 2px 2px 6px rgba(209, 36, 47, 0.4); }
  
//   .notifications-dropdown { position: absolute; top: 50px; right: 0; width: 340px; max-height: 400px; background: var(--neu-bg); border: none; border-radius: 12px; box-shadow: 6px 6px 16px var(--neu-dark), -6px -6px 16px var(--neu-light); display: flex; flex-direction: column; overflow: hidden; z-index: 100; animation: dropFade 0.2s ease-out; }
//   @keyframes dropFade { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
//   .notif-header { padding: 14px 18px; border-bottom: 1px solid rgba(209, 220, 235, 0.4); background: transparent; font-size: 11px; font-weight: 800; color: var(--text-primary); display: flex; justify-content: space-between; letter-spacing: 0.05em; }
//   .notif-list { overflow-y: auto; flex: 1; padding: 8px; }
//   .notif-list::-webkit-scrollbar { width: 4px; }
//   .notif-list::-webkit-scrollbar-track { background: transparent; }
//   .notif-list::-webkit-scrollbar-thumb { background: var(--neu-dark); border-radius: 10px; }
//   .notif-item { padding: 12px 14px; border-radius: 8px; margin-bottom: 6px; display: flex; flex-direction: column; gap: 4px; background: transparent; border: none; transition: all 0.15s ease; }
//   .notif-item:hover { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light); }
//   .notif-title { font-size: 12px; font-weight: 700; color: var(--text-primary); }
//   .notif-project { font-size: 11px; font-weight: 600; color: var(--text-muted); }
//   .notif-deadline { font-size: 10px; color: var(--red); font-weight: 800; margin-top: 2px; }
//   .notif-empty { padding: 30px 20px; text-align: center; color: var(--text-muted); font-size: 12px; font-weight: 600; }
  
//   .dev-nb-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; cursor: pointer; box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); border: 2px solid var(--neu-bg); transition: all 0.2s ease; }
//   .dev-nb-avatar:hover { transform: scale(1.05); }

//   .avatar-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: dropFade 0.2s ease-out; }
//   .avatar-modal-content { background: var(--neu-bg); width: 350px; padding: 30px 24px 24px; border-radius: 16px; box-shadow: 8px 8px 20px var(--neu-dark), -8px -8px 20px var(--neu-light); display: flex; flex-direction: column; gap: 16px; position: relative; font-family: 'Montserrat', sans-serif; }
//   .avatar-modal-close, .avatar-modal-back { position: absolute; top: 16px; cursor: pointer; color: var(--text-muted); transition: color 0.2s; }
//   .avatar-modal-close { right: 16px; }
//   .avatar-modal-close:hover { color: var(--red); }
//   .avatar-modal-back { left: 16px; }
//   .avatar-modal-back:hover { color: var(--text-primary); }
//   .avatar-modal-title { font-size: 16px; font-weight: 700; color: var(--text-primary); text-align: center; margin-bottom: 4px; }
//   .large-avatar-container { display: flex; justify-content: center; align-items: center; margin: 10px 0 20px 0; }
//   .avatar-modal-large-img { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; box-shadow: 6px 6px 12px var(--neu-dark), -6px -6px 12px var(--neu-light); border: 4px solid var(--neu-bg); }
//   .avatar-input-group { display: flex; flex-direction: column; gap: 6px; }
//   .avatar-input-group label { font-size: 11px; font-weight: 700; color: var(--text-muted); }
//   .avatar-input { background: var(--neu-bg); border: none; padding: 10px 14px; border-radius: 8px; box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light); font-family: 'Montserrat', sans-serif; font-size: 12px; outline: none; color: var(--text-primary); }
//   .avatar-btn { margin-top: 8px; padding: 12px; border-radius: 8px; border: none; background: var(--neu-bg); box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); color: var(--accent); font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
//   .avatar-btn:hover:not(:disabled) { color: var(--text-primary); }
//   .avatar-btn:active:not(:disabled) { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light); }
//   .avatar-btn:disabled { opacity: 0.6; cursor: not-allowed; }
//   .divider { text-align: center; font-size: 11px; font-weight: 700; color: var(--text-muted); margin: 4px 0; }

//   @media (max-width: 1024px) {
//     .attendance-group { display: none; }
//   }
// `;

// const NavBar = () => {
//   const [username, setUsername] = useState("Developer");
//   const [avatar, setAvatar] = useState("https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg");
//   const [overdueTasks, setOverdueTasks] = useState([]);
  
//   // UI States
//   const [showNotif, setShowNotif] = useState(false);
//   const [showAvatarModal, setShowAvatarModal] = useState(false);
//   const [isEditingAvatar, setIsEditingAvatar] = useState(false);

//   // Form States
//   const [uploadUrl, setUploadUrl] = useState("");
//   const [uploadFile, setUploadFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
  
//   // --- ATTENDANCE STATES ---
//   const [attendance, setAttendance] = useState(null);
//   const [limits, setLimits] = useState({ workLimits: 480, breakLimits: 60 });
//   const [status, setStatus] = useState("NOT_STARTED"); 
//   const [liveWorkTime, setLiveWorkTime] = useState(0);
//   const [liveBreakTime, setLiveBreakTime] = useState(0);

//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ==========================================
//   // ROUTING FIX APPLIED HERE
//   // ==========================================
//   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
  
//   // Since your UserController handles `/user`, `/login`, and now `/attendance`, 
//   // they all sit behind the exact same prefix your server uses. 
//   // Based on your 404 logs calling `/api/auth/user`, the prefix is `/api/auth`.
//   const ROUTE_PREFIX = `${API_BASE}/api/auth`; 
//   // (If you ever change your server.js to use app.use('/api', ...), just change this to `${API_BASE}/api`)

//   const getAuthHeaders = () => ({
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   });

//   // Fetch User & Avatar on mount
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return;
//         // Using fixed prefix
//         const response = await axios.get(`${ROUTE_PREFIX}/user`, getAuthHeaders());
//         setUsername(response.data.username);
//         if(response.data.avatar) {
//           setAvatar(response.data.avatar);
//         }
//       } catch (error) {
//         console.error("Failed to fetch user details", error);
//       }
//     };
//     fetchUser();
//   }, [ROUTE_PREFIX]);

//   // Fetch Overdue Tasks (Assuming Project APIs are mounted differently, so we keep API_BASE)
//   const fetchOverdueTasks = async () => {
//     try {
//       const currentUserId = localStorage.getItem("userId");
//       if (!currentUserId) return;

//       const r = await axios.get(`${API_BASE}/api/newproject/projects`, getAuthHeaders());
//       const mine = (r.data || []).filter(p =>
//         (p.assignedDeveloper || []).some(d => d.id && d.id.toString() === currentUserId.toString())
//       );

//       let accumulatedOverdue = [];

//       await Promise.allSettled(mine.map(async (p) => {
//         try {
//           const tasksRes = await axios.get(`${API_BASE}/api/tasks/${p._id}`, getAuthHeaders());
//           const overdue = (tasksRes.data || []).filter(t => {
//             if (t.status === "Done") return false;
//             const assignedId = t.assignedTo?.id || t.assignedTo;
//             const isAssigned = assignedId?.toString() === currentUserId.toString();
//             if (!isAssigned || !t.deadline) return false;
//             return new Date(t.deadline).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
//           });

//           overdue.forEach(t => {
//             accumulatedOverdue.push({ id: t._id, title: t.title, projectName: p.projectName, deadline: t.deadline });
//           });
//         } catch (e) { /* ignore */ }
//       }));
//       setOverdueTasks(accumulatedOverdue);
//     } catch (err) { console.error("Failed loading task updates", err); }
//   };

//   // Fetch Attendance Status
//   const fetchTodayStatus = async () => {
//     try {
//       // Using fixed prefix
//       const res = await axios.get(`${ROUTE_PREFIX}/attendance/today`, getAuthHeaders());
//       setLimits({ workLimits: res.data.workLimits, breakLimits: res.data.breakLimits });
      
//       const record = res.data.attendance;
//       if (!record) {
//         setStatus("NOT_STARTED");
//       } else if (record.clockOut) {
//         setStatus("FINISHED");
//         setAttendance(record);
//         setLiveWorkTime(record.totalWorkTime);
//         setLiveBreakTime(record.totalBreakTime);
//       } else {
//         setAttendance(record);
//         const isOnBreak = record.breaks.some(b => !b.end);
//         setStatus(isOnBreak ? "ON_BREAK" : "WORKING");
//       }
//     } catch (error) {
//       console.error("Failed to fetch attendance:", error);
//     }
//   };

//   useEffect(() => {
//     fetchOverdueTasks();
//     fetchTodayStatus();
//     const interval = setInterval(fetchOverdueTasks, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   // Live Timer
//   useEffect(() => {
//     let interval;
//     if (status === "WORKING" || status === "ON_BREAK") {
//       interval = setInterval(() => {
//         const now = new Date().getTime();
//         let currentTotalBreak = 0;

//         attendance.breaks.forEach((b) => {
//           if (b.end) {
//             currentTotalBreak += (new Date(b.end).getTime() - new Date(b.start).getTime());
//           } else {
//             currentTotalBreak += (now - new Date(b.start).getTime());
//           }
//         });

//         const clockInTime = new Date(attendance.clockIn).getTime();
//         const totalElapsed = now - clockInTime;
//         const currentWorkTime = totalElapsed - currentTotalBreak;

//         setLiveWorkTime(currentWorkTime);
//         setLiveBreakTime(currentTotalBreak);
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [status, attendance]);

//   // Dropdown click outside logic
//   useEffect(() => {
//     const clickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowNotif(false);
//       }
//     };
//     document.addEventListener("mousedown", clickOutside);
//     return () => document.removeEventListener("mousedown", clickOutside);
//   }, []);

//   const formatTime = (ms) => {
//     if (ms < 0) ms = 0;
//     const totalSeconds = Math.floor(ms / 1000);
//     const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
//     const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
//     const s = (totalSeconds % 60).toString().padStart(2, '0');
//     return `${h}:${m}:${s}`;
//   };

//   // --- ATTENDANCE ACTIONS ---
//   const handleClockIn = async () => {
//     try { await axios.post(`${ROUTE_PREFIX}/attendance/clock-in`, {}, getAuthHeaders()); fetchTodayStatus(); }
//     catch (e) { alert("Error Clocking In"); }
//   };
//   const handleTakeBreak = async () => {
//     try { await axios.post(`${ROUTE_PREFIX}/attendance/break/start`, {}, getAuthHeaders()); fetchTodayStatus(); }
//     catch (e) { alert("Error taking break"); }
//   };
//   const handleEndBreak = async () => {
//     try { await axios.post(`${ROUTE_PREFIX}/attendance/break/end`, {}, getAuthHeaders()); fetchTodayStatus(); }
//     catch (e) { alert("Error ending break"); }
//   };
//   const handleClockOut = async () => {
//     const requiredMs = limits.workLimits * 60 * 1000;
//     if (liveWorkTime < requiredMs) {
//       if (!window.confirm("Warning: You have not completed your required working hours today. Are you sure you want to Clock Out?")) return;
//     }
//     try { await axios.post(`${ROUTE_PREFIX}/attendance/clock-out`, {}, getAuthHeaders()); fetchTodayStatus(); }
//     catch (e) { alert("Error Clocking Out"); }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   const openAvatarModal = () => {
//     setIsEditingAvatar(false);
//     setUploadFile(null);
//     setUploadUrl("");
//     setShowAvatarModal(true);
//   };

//   const handleAvatarUpload = async () => {
//     if (!uploadFile && !uploadUrl) return alert("Please select an image or enter a URL.");
//     setIsUploading(true);
//     const formData = new FormData();
//     if (uploadFile) formData.append("image", uploadFile);
//     else if (uploadUrl) formData.append("imageUrl", uploadUrl);

//     try {
//       const response = await axios.put(`${ROUTE_PREFIX}/user/avatar`, formData, getAuthHeaders());
//       setAvatar(response.data.avatar);
//       setIsEditingAvatar(false); 
//       setShowAvatarModal(false);
//       setUploadUrl("");
//       setUploadFile(null);
//     } catch (error) { alert("Failed to upload avatar"); } 
//     finally { setIsUploading(false); }
//   };

//   const isActive = (path) => location.pathname === path;

//   const NavLink = ({ to, icon: Icon, label }) => (
//     <Link to={to} className={`dev-nb-link ${isActive(to) ? "active" : ""}`}>
//       <Icon />
//       <span className="dev-nb-link-label">{label}</span>
//     </Link>
//   );

//   const isOverBreak = liveBreakTime > limits.breakLimits * 60 * 1000;

//   return (
//     <>
//       <style>{styles}</style>
//       <header className="dev-navbar">
//         <img className="dev-nb-logo" src={assets.logo} alt="Logo" />

//         <nav className="dev-nb-nav">
//           <NavLink to="/dashboard-developer" icon={WidgetsOutlinedIcon} label="Home" />
//           <NavLink to="/dashboard-developer/one-time" icon={AccountTreeOutlinedIcon} label="Projects" />
//         </nav>

//         {/* --- ATTENDANCE COMPONENT --- */}
//         <div className="attendance-group">
//           <div className="timer-box">
//             <span className="timer-label">Work Time</span>
//             <span className="timer-value work">{formatTime(liveWorkTime)}</span>
//           </div>
          
//           <div className="timer-box">
//             <span className="timer-label">Break Time</span>
//             <span className={`timer-value ${isOverBreak && status === 'ON_BREAK' ? 'danger' : 'break'}`}>
//               {formatTime(liveBreakTime)}
//             </span>
//             {isOverBreak && status === "ON_BREAK" && <span className="over-break-warn">Over Limit!</span>}
//           </div>

//           <div className="flex gap-2">
//             {status === "NOT_STARTED" && (
//               <button onClick={handleClockIn} className="att-btn start">
//                 <PlayArrowOutlinedIcon /> Clock In
//               </button>
//             )}

//             {status === "WORKING" && (
//               <>
//                 <button onClick={handleTakeBreak} className="att-btn break">
//                   <FreeBreakfastOutlinedIcon /> Break
//                 </button>
//                 <button onClick={handleClockOut} className="att-btn end">
//                   <StopOutlinedIcon /> Clock Out
//                 </button>
//               </>
//             )}

//             {status === "ON_BREAK" && (
//               <button onClick={handleEndBreak} className="att-btn start">
//                 <PlayArrowOutlinedIcon /> End Break
//               </button>
//             )}

//             {status === "FINISHED" && (
//               <button disabled className="att-btn disabled">
//                 <CheckCircleOutlinedIcon /> Finished
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="dev-nb-right" ref={dropdownRef}>
//           <div className="notification-container" onClick={() => setShowNotif(!showNotif)}>
//             <NotificationsOutlinedIcon className="notification-bell" />
//             {overdueTasks.length > 0 && (
//               <div className="notification-badge">{overdueTasks.length}</div>
//             )}
//           </div>

//           <span className="dev-nb-username">Hey, <span>{username}</span></span>
//           <img 
//             src={avatar} 
//             alt="Profile Avatar" 
//             className="dev-nb-avatar" 
//             onClick={openAvatarModal}
//             title="View Profile Picture"
//           />
//           <button className="dev-nb-logout" onClick={handleLogout}>Logout</button>

//           {showNotif && (
//             <div className="notifications-dropdown">
//               <div className="notif-header">
//                 <span>OVERDUE WORK</span>
//                 <span style={{color: "var(--red)"}}>{overdueTasks.length} Task{overdueTasks.length === 1 ? "" : "s"}</span>
//               </div>
//               <div className="notif-list">
//                 {overdueTasks.length === 0 ? (
//                   <div className="notif-empty">No overdue items. Great job!</div>
//                 ) : (
//                   overdueTasks.map((t) => (
//                     <div key={t.id} className="notif-item">
//                       <span className="notif-title">{t.title}</span>
//                       <span className="notif-project">{t.projectName}</span>
//                       <span className="notif-deadline">
//                         Overdue since: {new Date(t.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
//                       </span>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </header>

//       {showAvatarModal && (
//         <div className="avatar-modal-overlay" onClick={() => setShowAvatarModal(false)}>
//           <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
//             {isEditingAvatar && (
//                <ArrowBackOutlinedIcon className="avatar-modal-back" onClick={() => setIsEditingAvatar(false)} />
//             )}
//             <CloseOutlinedIcon className="avatar-modal-close" onClick={() => setShowAvatarModal(false)} />

//             {!isEditingAvatar ? (
//               <>
//                 <div className="avatar-modal-title">Profile Picture</div>
//                 <div className="large-avatar-container">
//                   <img src={avatar} alt="Large Profile" className="avatar-modal-large-img" />
//                 </div>
//                 <button className="avatar-btn" onClick={() => setIsEditingAvatar(true)}>
//                   Update Avatar
//                 </button>
//               </>
//             ) : (
//               <>
//                 <div className="avatar-modal-title">Update Profile Picture</div>
//                 <div className="avatar-input-group" style={{marginTop: "10px"}}>
//                   <label>Upload an Image File</label>
//                   <input type="file" accept="image/*" className="avatar-input" onChange={(e) => {
//                       setUploadFile(e.target.files[0]); setUploadUrl(""); 
//                     }} />
//                 </div>
//                 <div className="divider">OR</div>
//                 <div className="avatar-input-group">
//                   <label>Paste an Image URL</label>
//                   <input type="text" placeholder="https://example.com/image.jpg" className="avatar-input" value={uploadUrl} onChange={(e) => {
//                       setUploadUrl(e.target.value); setUploadFile(null);
//                     }} />
//                 </div>
//                 <button className="avatar-btn" onClick={handleAvatarUpload} disabled={isUploading} style={{marginTop: "16px"}}>
//                   {isUploading ? "Uploading..." : "Save New Avatar"}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default NavBar;


























import React, { useState, useEffect, useRef } from "react";
import assets from "../assets/assets";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

  :root {
    --neu-bg: #F0F4F8;
    --neu-light: #FFFFFF;
    --neu-dark: #D1DCEB;
    --accent: #4F6EF7;
    --text-primary: #1F2328;
    --text-muted: #656D76;
    --red: #D1242F;
  }

  .dev-navbar {
    font-family: 'Montserrat', sans-serif;
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--neu-bg);
    box-shadow: 0 4px 10px -2px rgba(209, 220, 235, 0.6);
    border: none;
    padding: 20px 32px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .dev-nb-logo { height: 40px; width: auto; flex-shrink: 0; }
  .dev-nb-nav { display: flex; align-items: center; gap: 6px; flex: 1; justify-content: center; }
  .dev-nb-link { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--text-muted); text-decoration: none; background: transparent; transition: all 0.2s ease; white-space: nowrap; border: none; }
  .dev-nb-link:hover { box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); color: var(--text-primary); }
  .dev-nb-link.active { box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light); color: var(--accent); background: var(--neu-bg); }
  .dev-nb-link svg { font-size: 18px !important; opacity: 0.8; }
  .dev-nb-link.active svg { opacity: 1; }
  
  .dev-nb-right { display: flex; align-items: center; gap: 18px; flex-shrink: 0; position: relative; }
  .dev-nb-username { font-size: 13px; font-weight: 600; color: var(--text-muted); }
  .dev-nb-username span { color: var(--accent); font-weight: 700; }
  
  .dev-nb-logout { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--neu-bg); box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); border: none; border-radius: 8px; padding: 7px 16px; cursor: pointer; transition: all 0.15s ease; }
  .dev-nb-logout:hover { color: var(--red); }
  .dev-nb-logout:active { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light); }
  
  .notification-container { position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; background: var(--neu-bg); transition: all 0.2s ease; }
  .notification-container:hover { box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light); }
  .notification-container:active { box-shadow: inset 2px 2px 4px var(--neu-dark), inset -2px -2px 4px var(--neu-light); }
  .notification-bell { font-size: 20px !important; color: var(--text-muted); transition: color 0.15s ease; }
  .notification-container:hover .notification-bell { color: var(--text-primary); }
  .notification-badge { position: absolute; top: -2px; right: -2px; background: var(--red); color: white; font-size: 9px; font-weight: 800; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; box-shadow: 2px 2px 6px rgba(209, 36, 47, 0.4); }
  
  .notifications-dropdown { position: absolute; top: 50px; right: 0; width: 340px; max-height: 400px; background: var(--neu-bg); border: none; border-radius: 12px; box-shadow: 6px 6px 16px var(--neu-dark), -6px -6px 16px var(--neu-light); display: flex; flex-direction: column; overflow: hidden; z-index: 100; animation: dropFade 0.2s ease-out; }
  @keyframes dropFade { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  .notif-header { padding: 14px 18px; border-bottom: 1px solid rgba(209, 220, 235, 0.4); background: transparent; font-size: 11px; font-weight: 800; color: var(--text-primary); display: flex; justify-content: space-between; letter-spacing: 0.05em; }
  .notif-list { overflow-y: auto; flex: 1; padding: 8px; }
  .notif-list::-webkit-scrollbar { width: 4px; }
  .notif-list::-webkit-scrollbar-track { background: transparent; }
  .notif-list::-webkit-scrollbar-thumb { background: var(--neu-dark); border-radius: 10px; }
  .notif-item { padding: 12px 14px; border-radius: 8px; margin-bottom: 6px; display: flex; flex-direction: column; gap: 4px; background: transparent; border: none; transition: all 0.15s ease; }
  .notif-item:hover { box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light); }
  .notif-title { font-size: 12px; font-weight: 700; color: var(--text-primary); }
  .notif-project { font-size: 11px; font-weight: 600; color: var(--text-muted); }
  .notif-deadline { font-size: 10px; color: var(--red); font-weight: 800; margin-top: 2px; }
  .notif-empty { padding: 30px 20px; text-align: center; color: var(--text-muted); font-size: 12px; font-weight: 600; }
  
  /* --- AVATAR & MODAL CSS --- */
  .dev-nb-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light);
    border: 2px solid var(--neu-bg);
    transition: all 0.2s ease;
  }
  .dev-nb-avatar:hover {
    transform: scale(1.05);
  }

  .avatar-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: dropFade 0.2s ease-out;
  }
  
  .avatar-modal-content {
    background: var(--neu-bg);
    width: 350px;
    padding: 30px 24px 24px;
    border-radius: 16px;
    box-shadow: 8px 8px 20px var(--neu-dark), -8px -8px 20px var(--neu-light);
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    font-family: 'Montserrat', sans-serif;
  }

  .avatar-modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    cursor: pointer;
    color: var(--text-muted);
    transition: color 0.2s;
  }
  .avatar-modal-close:hover { color: var(--red); }

  .avatar-modal-back {
    position: absolute;
    top: 16px;
    left: 16px;
    cursor: pointer;
    color: var(--text-muted);
    transition: color 0.2s;
  }
  .avatar-modal-back:hover { color: var(--text-primary); }

  .avatar-modal-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 4px;
  }

  /* Large Avatar View Styles */
  .large-avatar-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0 20px 0;
  }

  .avatar-modal-large-img {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 6px 6px 12px var(--neu-dark), -6px -6px 12px var(--neu-light);
    border: 4px solid var(--neu-bg);
  }

  /* Form Input Styles */
  .avatar-input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .avatar-input-group label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
  }

  .avatar-input {
    background: var(--neu-bg);
    border: none;
    padding: 10px 14px;
    border-radius: 8px;
    box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    outline: none;
    color: var(--text-primary);
  }

  .avatar-btn {
    margin-top: 8px;
    padding: 12px;
    border-radius: 8px;
    border: none;
    background: var(--neu-bg);
    box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light);
    color: var(--accent);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .avatar-btn:hover:not(:disabled) {
    color: var(--text-primary);
  }

  .avatar-btn:active:not(:disabled) {
    box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light);
  }
  
  .avatar-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .divider {
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    margin: 4px 0;
  }

  @media (max-width: 640px) { 
    .dev-navbar { padding: 0 16px; } 
    .dev-nb-link { padding: 6px 10px; gap: 0; } 
    .dev-nb-link-label { display: none; } 
    .dev-nb-username { display: none; } 
  }
`;

const NavBar = () => {
  const [username, setUsername] = useState("Developer");
  const [avatar, setAvatar] = useState("https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg");
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // UI States
  const [showNotif, setShowNotif] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false); // Controls View vs Edit modes

  // Form States
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  // Fetch User & Avatar on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(`${API_BASE}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username);
        if(response.data.avatar) {
          setAvatar(response.data.avatar);
        }
      } catch (error) {
        console.error("Failed to fetch user details", error);
      }
    };
    fetchUser();
  }, [API_BASE]);

  const fetchOverdueTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUserId = localStorage.getItem("userId");
      if (!token || !currentUserId) return;

      const r = await axios.get(`${API_BASE}/api/newproject/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mine = (r.data || []).filter(p =>
        (p.assignedDeveloper || []).some(d => d.id && d.id.toString() === currentUserId.toString())
      );

      let accumulatedOverdue = [];

      await Promise.allSettled(mine.map(async (p) => {
        try {
          const tasksRes = await axios.get(`${API_BASE}/api/tasks/${p._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const overdue = (tasksRes.data || []).filter(t => {
            if (t.status === "Done") return false;
            const assignedId = t.assignedTo?.id || t.assignedTo;
            const isAssigned = assignedId?.toString() === currentUserId.toString();
            if (!isAssigned || !t.deadline) return false;

            const target = new Date(t.deadline).setHours(0,0,0,0);
            const today = new Date().setHours(0,0,0,0);
            return target < today;
          });

          overdue.forEach(t => {
            accumulatedOverdue.push({
              id: t._id,
              title: t.title,
              projectName: p.projectName,
              deadline: t.deadline
            });
          });
        } catch (e) {
          // ignore parsing error
        }
      }));

      setOverdueTasks(accumulatedOverdue);
    } catch (err) {
      console.error("Failed loading task updates for navbar notifications", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_BASE}/api/scheduled-tasks/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed loading notifications", err);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(`${API_BASE}/api/scheduled-tasks/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed marking notifications as read", err);
    }
  };

  useEffect(() => {
    fetchOverdueTasks();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchOverdueTasks();
      fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Dropdown click outside logic
  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Open the main Avatar view
  const openAvatarModal = () => {
    setIsEditingAvatar(false); // Make sure it starts in VIEW mode
    setUploadFile(null);
    setUploadUrl("");
    setShowAvatarModal(true);
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async () => {
    if (!uploadFile && !uploadUrl) return alert("Please select an image or enter a URL.");
    
    setIsUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    if (uploadFile) {
      formData.append("image", uploadFile);
    } else if (uploadUrl) {
      formData.append("imageUrl", uploadUrl);
    }

    try {
      const response = await axios.put(`${API_BASE}/api/auth/user/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvatar(response.data.avatar);
      // Reset and close
      setIsEditingAvatar(false); 
      setShowAvatarModal(false);
      setUploadUrl("");
      setUploadFile(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link to={to} className={`dev-nb-link ${isActive(to) ? "active" : ""}`}>
      <Icon />
      <span className="dev-nb-link-label">{label}</span>
    </Link>
  );

  return (
    <>
      <style>{styles}</style>
      <header className="dev-navbar">
        <img className="dev-nb-logo" src={assets.logo} alt="Logo" />

        <nav className="dev-nb-nav">
          <NavLink to="/dashboard-developer" icon={WidgetsOutlinedIcon} label="Home" />
          <NavLink to="/dashboard-developer/one-time" icon={AccountTreeOutlinedIcon} label="Projects" />
        </nav>

        <div className="dev-nb-right" ref={dropdownRef}>
          <div className="notification-container" onClick={() => {
            const nextShow = !showNotif;
            setShowNotif(nextShow);
            if (nextShow) {
              markNotificationsAsRead();
            }
          }}>
            <NotificationsOutlinedIcon className="notification-bell" />
            {(overdueTasks.length + notifications.filter(n => !n.read).length) > 0 && (
              <div className="notification-badge">{overdueTasks.length + notifications.filter(n => !n.read).length}</div>
            )}
          </div>

          {/* User Profile Area */}
          <span className="dev-nb-username">Hey, <span>{username}</span></span>
          <img 
            src={avatar} 
            alt="Profile Avatar" 
            className="dev-nb-avatar" 
            onClick={openAvatarModal}
            title="View Profile Picture"
          />
          <button className="dev-nb-logout" onClick={handleLogout}>Logout</button>

          {/* Notification Dropdown */}
          {showNotif && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <span>NOTIFICATIONS</span>
                <span style={{color: "var(--red)"}}>{overdueTasks.length + notifications.filter(n => !n.read).length} Unread</span>
              </div>
              <div className="notif-list">
                {overdueTasks.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--red)", marginBottom: "6px", textTransform: "uppercase" }}>Overdue Tasks</div>
                    {overdueTasks.map((t) => (
                      <div key={t.id} className="notif-item">
                        <span className="notif-title">{t.title}</span>
                        <span className="notif-project">{t.projectName}</span>
                        <span className="notif-deadline">
                          Overdue since: {new Date(t.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {notifications.length > 0 && (
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--accent)", marginBottom: "6px", textTransform: "uppercase" }}>Live Scheduled Tasks</div>
                    {notifications.map((n) => (
                      <div key={n._id} className="notif-item" style={{ opacity: n.read ? 0.7 : 1 }}>
                        <span className="notif-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {!n.read && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--red)", shrink: 0 }} />}
                          {n.title}
                        </span>
                        <span className="notif-project">{n.projectName}</span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{n.message}</span>
                      </div>
                    ))}
                  </div>
                )}
                {overdueTasks.length === 0 && notifications.length === 0 && (
                  <div className="notif-empty">No updates. Great job!</div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Avatar Modal (View + Edit Modes) */}
      {showAvatarModal && (
        <div className="avatar-modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* If in edit mode, show a Back arrow. Otherwise, nothing on the left */}
            {isEditingAvatar && (
               <ArrowBackOutlinedIcon 
                 className="avatar-modal-back" 
                 onClick={() => setIsEditingAvatar(false)} 
               />
            )}

            <CloseOutlinedIcon 
              className="avatar-modal-close" 
              onClick={() => setShowAvatarModal(false)}
            />

            {/* Conditionally render View vs Edit */}
            {!isEditingAvatar ? (
              // --- VIEW MODE ---
              <>
                <div className="avatar-modal-title">Profile Picture</div>
                <div className="large-avatar-container">
                  <img src={avatar} alt="Large Profile" className="avatar-modal-large-img" />
                </div>
                <button className="avatar-btn" onClick={() => setIsEditingAvatar(true)}>
                  Update Avatar
                </button>
              </>
            ) : (
              // --- EDIT MODE (UPLOAD FORM) ---
              <>
                <div className="avatar-modal-title">Update Profile Picture</div>
                
                <div className="avatar-input-group" style={{marginTop: "10px"}}>
                  <label>Upload an Image File</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="avatar-input"
                    onChange={(e) => {
                      setUploadFile(e.target.files[0]);
                      setUploadUrl(""); // Clear URL if file selected
                    }}
                  />
                </div>

                <div className="divider">OR</div>

                <div className="avatar-input-group">
                  <label>Paste an Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/image.jpg"
                    className="avatar-input"
                    value={uploadUrl}
                    onChange={(e) => {
                      setUploadUrl(e.target.value);
                      setUploadFile(null); // Clear file if URL typed
                    }}
                  />
                </div>

                <button 
                  className="avatar-btn" 
                  onClick={handleAvatarUpload}
                  disabled={isUploading}
                  style={{marginTop: "16px"}}
                >
                  {isUploading ? "Uploading..." : "Save New Avatar"}
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;




















