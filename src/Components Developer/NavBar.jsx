// import React, { useState, useEffect, useRef } from "react";
// import assets from "../assets/assets";
// import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
// import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
// import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

//   .dev-navbar {
//     font-family: 'DM Sans', sans-serif;
//     position: sticky;
//     top: 0;
//     z-index: 50;
//     background: rgba(255, 255, 255, 0.93);
//     backdrop-filter: blur(14px);
//     -webkit-backdrop-filter: blur(14px);
//     border-bottom: 1px solid #eef0f6;
//     padding: 0 28px;
//     height: 60px;
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     gap: 16px;
//   }

//   .dev-nb-logo {
//     height: 30px;
//     width: auto;
//     flex-shrink: 0;
//   }

//   .dev-nb-nav {
//     display: flex;
//     align-items: center;
//     gap: 2px;
//     flex: 1;
//     justify-content: center;
//   }

//   .dev-nb-link {
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     padding: 6px 14px;
//     border-radius: 8px;
//     font-size: 13px;
//     color: #6b7280;
//     text-decoration: none;
//     transition: all 0.15s ease;
//     white-space: nowrap;
//   }
//   .dev-nb-link:hover {
//     background: #f5f6fb;
//     color: #374151;
//   }
//   .dev-nb-link.active {
//     background: #eef1fd;
//     color: #4f56c8;
//   }
//   .dev-nb-link svg {
//     font-size: 16px !important;
//     opacity: 0.7;
//   }
//   .dev-nb-link.active svg {
//     opacity: 1;
//   }

//   .dev-nb-right {
//     display: flex;
//     align-items: center;
//     gap: 16px;
//     flex-shrink: 0;
//     position: relative;
//   }

//   .dev-nb-username {
//     font-size: 13px;
//     color: #9ca3af;
//   }
//   .dev-nb-username span {
//     color: #4f56c8;
//     font-weight: 500;
//   }

//   .dev-nb-logout {
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13px;
//     color: #6b7280;
//     background: transparent;
//     border: 1px solid #e2e4ee;
//     border-radius: 8px;
//     padding: 5px 14px;
//     cursor: pointer;
//     transition: all 0.18s ease;
//   }
//   .dev-nb-logout:hover {
//     color: #ef4444;
//     border-color: #fca5a5;
//     background: #fff5f5;
//   }

//   .notification-container {
//     position: relative;
//     display: flex;
//     align-items: center;
//     cursor: pointer;
//   }

//   .notification-bell {
//     font-size: 20px !important;
//     color: #6b7280;
//     transition: color 0.15s ease;
//   }
//   .notification-bell:hover {
//     color: #374151;
//   }

//   .notification-badge {
//     position: absolute;
//     top: -5px;
//     right: -5px;
//     background: #ef4444;
//     color: white;
//     font-size: 9px;
//     font-weight: 700;
//     width: 15px;
//     height: 15px;
//     border-radius: 50%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     border: 1.5px solid #fff;
//   }

//   .notifications-dropdown {
//     position: absolute;
//     top: 45px;
//     right: 0;
//     width: 320px;
//     max-height: 400px;
//     background: #ffffff;
//     border: 1px solid #eef0f6;
//     border-radius: 12px;
//     box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
//     display: flex;
//     flex-direction: column;
//     overflow: hidden;
//     z-index: 100;
//     animation: dropFade 0.2s ease-out;
//   }

//   @keyframes dropFade {
//     from { opacity: 0; transform: translateY(-8px); }
//     to { opacity: 1; transform: translateY(0); }
//   }

//   .notif-header {
//     padding: 12px 16px;
//     border-bottom: 1px solid #eef0f6;
//     background: #fafbfe;
//     font-size: 12px;
//     font-weight: 700;
//     color: #374151;
//     display: flex;
//     justify-content: space-between;
//   }

//   .notif-list {
//     overflow-y: auto;
//     flex: 1;
//   }

//   .notif-item {
//     padding: 12px 16px;
//     border-bottom: 1px solid #f9fafb;
//     display: flex;
//     flex-direction: column;
//     gap: 2px;
//     transition: background 0.1s ease;
//   }
//   .notif-item:hover {
//     background: #fff5f5;
//   }

//   .notif-title {
//     font-size: 12px;
//     font-weight: 600;
//     color: #111827;
//   }

//   .notif-project {
//     font-size: 11px;
//     color: #6b7280;
//   }

//   .notif-deadline {
//     font-size: 10px;
//     color: #ef4444;
//     font-weight: 700;
//     margin-top: 3px;
//   }

//   .notif-empty {
//     padding: 24px;
//     text-align: center;
//     color: #9ca3af;
//     font-size: 12px;
//   }

//   @media (max-width: 640px) {
//     .dev-navbar { padding: 0 16px; }
//     .dev-nb-link { padding: 6px 10px; gap: 0; }
//     .dev-nb-link-label { display: none; }
//     .dev-nb-username { display: none; }
//   }
// `;

// const NavBar = () => {
//   const [username, setUsername] = useState("Developer");
//   const [overdueTasks, setOverdueTasks] = useState([]);
//   const [showNotif, setShowNotif] = useState(false);
//   const dropdownRef = useRef(null);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return;
//         const response = await axios.get(`${API_BASE}/api/auth/user`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsername(response.data.username);
//       } catch (error) {
//         console.error("Failed to fetch user details", error);
//       }
//     };
//     fetchUser();
//   }, []);

//   const fetchOverdueTasks = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const currentUserId = localStorage.getItem("userId");
//       if (!token || !currentUserId) return;

//       const r = await axios.get(`${API_BASE}/api/newproject/projects`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const mine = (r.data || []).filter(p =>
//         (p.assignedDeveloper || []).some(d => d.id && d.id.toString() === currentUserId.toString())
//       );

//       let accumulatedOverdue = [];

//       await Promise.allSettled(mine.map(async (p) => {
//         try {
//           const tasksRes = await axios.get(`${API_BASE}/api/tasks/${p._id}`, {
//             headers: { Authorization: `Bearer ${token}` }
//           });
          
//           const overdue = (tasksRes.data || []).filter(t => {
//             if (t.status === "Done") return false;
//             const assignedId = t.assignedTo?.id || t.assignedTo;
//             const isAssigned = assignedId?.toString() === currentUserId.toString();
//             if (!isAssigned || !t.deadline) return false;

//             const target = new Date(t.deadline).setHours(0,0,0,0);
//             const today = new Date().setHours(0,0,0,0);
//             return target < today;
//           });

//           overdue.forEach(t => {
//             accumulatedOverdue.push({
//               id: t._id,
//               title: t.title,
//               projectName: p.projectName,
//               deadline: t.deadline
//             });
//           });
//         } catch (e) {
//           // ignore parsing error
//         }
//       }));

//       setOverdueTasks(accumulatedOverdue);
//     } catch (err) {
//       console.error("Failed loading task updates for navbar notifications", err);
//     }
//   };

//   useEffect(() => {
//     fetchOverdueTasks();
//     const interval = setInterval(fetchOverdueTasks, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const clickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowNotif(false);
//       }
//     };
//     document.addEventListener("mousedown", clickOutside);
//     return () => document.removeEventListener("mousedown", clickOutside);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   const isActive = (path) => location.pathname === path;

//   const NavLink = ({ to, icon: Icon, label }) => (
//     <Link to={to} className={`dev-nb-link ${isActive(to) ? "active" : ""}`}>
//       <Icon />
//       <span className="dev-nb-link-label">{label}</span>
//     </Link>
//   );

//   return (
//     <>
//       <style>{styles}</style>
//       <header className="dev-navbar">
//         <img className="dev-nb-logo" src={assets.logo} alt="Logo" />

//         <nav className="dev-nb-nav">
//           <NavLink to="/dashboard-developer" icon={WidgetsOutlinedIcon} label="Home" />
//           <NavLink to="/dashboard-developer/one-time" icon={AccountTreeOutlinedIcon} label="Projects" />
//         </nav>

//         <div className="dev-nb-right" ref={dropdownRef}>
//           <div className="notification-container" onClick={() => setShowNotif(!showNotif)}>
//             <NotificationsOutlinedIcon className="notification-bell" />
//             {overdueTasks.length > 0 && (
//               <div className="notification-badge">{overdueTasks.length}</div>
//             )}
//           </div>

//           {showNotif && (
//             <div className="notifications-dropdown">
//               <div className="notif-header">
//                 <span>OVERDUE WORK</span>
//                 <span>{overdueTasks.length} Task{overdueTasks.length === 1 ? "" : "s"}</span>
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

//           <span className="dev-nb-username">Hey, <span>{username}</span></span>
//           <button className="dev-nb-logout" onClick={handleLogout}>Logout</button>
//         </div>
//       </header>
//     </>
//   );
// };

// export default NavBar;

























import React, { useState, useEffect, useRef } from "react";
import assets from "../assets/assets";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
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
    /* Neumorphic bottom elevation instead of a hard border */
    box-shadow: 0 4px 10px -2px rgba(209, 220, 235, 0.6);
    border: none;
    padding: 20px 32px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .dev-nb-logo {
    height: 40px;
    width: auto;
    flex-shrink: 0;
  }

  .dev-nb-nav {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    justify-content: center;
  }

  .dev-nb-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px; /* Preserved */
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;
    background: transparent;
    transition: all 0.2s ease;
    white-space: nowrap;
    border: none;
  }
  
  .dev-nb-link:hover {
    /* Soft elevation on hover */
    box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light);
    color: var(--text-primary);
  }
  
  .dev-nb-link.active {
    /* Debossed/pressed look for active link */
    box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
    color: var(--accent);
    background: var(--neu-bg);
  }
  
  .dev-nb-link svg {
    font-size: 18px !important;
    opacity: 0.8;
  }
  
  .dev-nb-link.active svg {
    opacity: 1;
  }

  .dev-nb-right {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-shrink: 0;
    position: relative;
  }

  .dev-nb-username {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .dev-nb-username span {
    color: var(--accent);
    font-weight: 700;
  }

  .dev-nb-logout {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    background: var(--neu-bg);
    /* Neumorphic button */
    box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light);
    border: none;
    border-radius: 8px; /* Preserved */
    padding: 7px 16px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .dev-nb-logout:hover {
    color: var(--red);
  }
  
  .dev-nb-logout:active {
    /* Pressed effect */
    box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light);
  }

  .notification-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--neu-bg);
    transition: all 0.2s ease;
  }
  
  .notification-container:hover {
    box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light);
  }
  
  .notification-container:active {
    box-shadow: inset 2px 2px 4px var(--neu-dark), inset -2px -2px 4px var(--neu-light);
  }

  .notification-bell {
    font-size: 20px !important;
    color: var(--text-muted);
    transition: color 0.15s ease;
  }
  .notification-container:hover .notification-bell {
    color: var(--text-primary);
  }

  .notification-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: var(--red);
    color: white;
    font-size: 9px;
    font-weight: 800;
    width: 16px;
    height: 16px;
    border-radius: 50%; /* Preserved */
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    /* Colored shadow for the badge */
    box-shadow: 2px 2px 6px rgba(209, 36, 47, 0.4);
  }

  .notifications-dropdown {
    position: absolute;
    top: 50px;
    right: 0;
    width: 340px;
    max-height: 400px;
    background: var(--neu-bg);
    border: none;
    border-radius: 12px; /* Preserved */
    /* Floating Neumorphic Box */
    box-shadow: 6px 6px 16px var(--neu-dark), -6px -6px 16px var(--neu-light);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 100;
    animation: dropFade 0.2s ease-out;
  }

  @keyframes dropFade {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .notif-header {
    padding: 14px 18px;
    border-bottom: 1px solid rgba(209, 220, 235, 0.4);
    background: transparent;
    font-size: 11px;
    font-weight: 800;
    color: var(--text-primary);
    display: flex;
    justify-content: space-between;
    letter-spacing: 0.05em;
  }

  .notif-list {
    overflow-y: auto;
    flex: 1;
    padding: 8px;
  }
  
  /* Custom Scrollbar for Dropdown */
  .notif-list::-webkit-scrollbar { width: 4px; }
  .notif-list::-webkit-scrollbar-track { background: transparent; }
  .notif-list::-webkit-scrollbar-thumb { background: var(--neu-dark); border-radius: 10px; }

  .notif-item {
    padding: 12px 14px;
    border-radius: 8px;
    margin-bottom: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: transparent;
    border: none;
    transition: all 0.15s ease;
  }
  
  .notif-item:hover {
    /* Pressed effect on hover for notification items */
    box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light);
  }

  .notif-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .notif-project {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .notif-deadline {
    font-size: 10px;
    color: var(--red);
    font-weight: 800;
    margin-top: 2px;
  }

  .notif-empty {
    padding: 30px 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 600;
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
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(`${API_BASE}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      }
    };
    fetchUser();
  }, []);

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

  useEffect(() => {
    fetchOverdueTasks();
    const interval = setInterval(fetchOverdueTasks, 60000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="notification-container" onClick={() => setShowNotif(!showNotif)}>
            <NotificationsOutlinedIcon className="notification-bell" />
            {overdueTasks.length > 0 && (
              <div className="notification-badge">{overdueTasks.length}</div>
            )}
          </div>

          {showNotif && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <span>OVERDUE WORK</span>
                <span style={{color: "var(--red)"}}>{overdueTasks.length} Task{overdueTasks.length === 1 ? "" : "s"}</span>
              </div>
              <div className="notif-list">
                {overdueTasks.length === 0 ? (
                  <div className="notif-empty">No overdue items. Great job!</div>
                ) : (
                  overdueTasks.map((t) => (
                    <div key={t.id} className="notif-item">
                      <span className="notif-title">{t.title}</span>
                      <span className="notif-project">{t.projectName}</span>
                      <span className="notif-deadline">
                        Overdue since: {new Date(t.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <span className="dev-nb-username">Hey, <span>{username}</span></span>
          <button className="dev-nb-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>
    </>
  );
};

export default NavBar;