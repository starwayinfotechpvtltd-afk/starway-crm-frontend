// // import React, { useState, useEffect } from "react";
// // import assets from "../assets/assets";
// // import MenuOpenIcon from "@mui/icons-material/MenuOpen";
// // import CloseIcon from "@mui/icons-material/Close";
// // import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// // import Sidebar from "react-sidebar";
// // import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
// // import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
// // import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
// // import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
// // import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
// // import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
// // import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
// // import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
// // import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
// // import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
// // import MailOutlineIcon from "@mui/icons-material/MailOutline";
// // import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// // import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
// // import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
// // import { Link, useNavigate, useLocation } from "react-router-dom";
// // import axios from "axios";

// // const NavBar = () => {
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [username, setUsername] = useState("Admin");
// //   const navigate = useNavigate();

// //   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// //   useEffect(() => {
// //     const fetchUser = async () => {
// //       try {
// //         const token = localStorage.getItem("token");
// //         if (!token) return;

// //         const response = await axios.get(`${API_BASE}/api/auth/user`, {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         });
// //         setUsername(response.data.username);
// //       } catch (error) {
// //         console.error("Failed to fetch user details", error);
// //       }
// //     };

// //     fetchUser();
// //   }, []);

// //   // Logout function
// //   const handleLogout = () => {
// //     localStorage.removeItem("token");
// //     navigate("/");
// //   };

// //   return (
// //     <>
// //       <header className="p-4 lg:px-9 sticky top-0 flex justify-between items-center bg-white z-50 shadow-md relative">
// //         <div className="flex items-center space-x-2">
// //           <MenuOpenIcon
// //             className="text-indigo-800 cursor-pointer text-6xl"
// //             onClick={() => setSidebarOpen(true)}
// //           />
// //           <img
// //             className="w-30 h-10 sm:ml-3 sm:hover:scale-120 transition duration-300 ease-in-out"
// //             src={assets.logo}
// //             alt="Logo"
// //           />
// //         </div>
// //         <p className="hidden sm:block md:text-xl lg:text-2xl font-medium text-indigo-800 absolute left-1/2 -translate-x-1/2">
// //           Hey! {username}, Sup ?
// //         </p>
// //         <div className="hidden md:block">
// //           <button
// //             onClick={handleLogout}
// //             className="w-22 h-10 rounded-sm cursor-pointer text-white bg-[#2636ee] hover:bg-indigo-500 px-4 hover:bg-red-500 hover:text-white hover:scale-110 transition duration-300 ease-in-out"
// //           >
// //             Logout
// //           </button>
// //         </div>
// //       </header>

// //       <Sidebar
// //         sidebar={
// //           <SidebarContent
// //             setSidebarOpen={setSidebarOpen}
// //             onLogout={handleLogout}
// //           />
// //         }
// //         open={sidebarOpen}
// //         onSetOpen={setSidebarOpen}
// //         styles={{
// //           sidebar: {
// //             background: "#f8fafc",
// //             width: "290px",
// //             padding: "20px",
// //             boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
// //             borderRadius: "8px 0 0 8px",
// //             zIndex: 60,
// //             position: "fixed",
// //             top: 0,
// //             left: 0,
// //             height: "100vh",
// //             overflowY: "auto",
// //           },
// //           overlay: {
// //             backgroundColor: "rgba(255, 255, 255, 0.2)",
// //             backdropFilter: "blur(10px)",
// //             zIndex: 50,
// //           },
// //         }}
// //       />
// //     </>
// //   );
// // };

// // const SidebarContent = ({ setSidebarOpen, onLogout }) => {
// //   const [projectDropdown, setProjectDropdown] = useState(false);
// //   const [isMailingOpen, setMailingOpen] = useState(false);
// //   const location = useLocation();

// //   const isActive = (path) => {
// //     return location.pathname === path;
// //   };

// //   const toggleMailingDropdown = () => {
// //     setMailingOpen(!isMailingOpen);
// //   };

// //   return (
// //     <div
// //       className="flex flex-col h-full"
// //       style={{
// //         overflowY: "auto",
// //         scrollbarWidth: "none",
// //         msOverflowStyle: "none",
// //       }}
// //     >
// //       <div className="sticky top-0 flex justify-between items-center mb-6 border-b pb-4 bg-[#f8fafc]">
// //         <h2 className="text-xl font-semibold text-indigo-800">Dashboard</h2>
// //         <CloseIcon
// //           className="cursor-pointer text-indigo-800"
// //           onClick={() => setSidebarOpen(false)}
// //         />
// //       </div>
// //       <ul className="space-y-4">
// //         <li
// //           className={`${
// //             isActive("/dashboard-developer")
// //               ? "bg-indigo-100 text-indigo-600"
// //               : "text-gray-700 hover:text-indigo-600"
// //           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
// //         >
// //           <Link
// //             to="/dashboard-developer"
// //             onClick={() => setSidebarOpen(false)}
// //             className="flex items-center"
// //           >
// //             <WidgetsOutlinedIcon className="mr-1" /> Home
// //           </Link>
// //         </li>
// //         <li
// //           className={`${
// //             isActive("/dashboard-developer/one-time")
// //               ? "bg-indigo-100 text-indigo-600"
// //               : "text-gray-700 hover:text-indigo-600"
// //           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
// //         >
// //           <Link
// //             to="/dashboard-developer/one-time"
// //             onClick={() => setSidebarOpen(false)}
// //             className="flex items-center"
// //           >
// //             <AccountTreeOutlinedIcon className="mr-1" /> Projects
// //           </Link>
// //         </li>
// //         {/* <li
// //           className={`${
// //             isActive("/dashboard-developer/subscription")
// //               ? "bg-indigo-100 text-indigo-600"
// //               : "text-gray-700 hover:text-indigo-600"
// //           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
// //         >
// //           <Link
// //             to="/dashboard-developer/subscription"
// //             onClick={() => setSidebarOpen(false)}
// //             className="flex items-center"
// //           >
// //             <AccountTreeOutlinedIcon className="mr-1" /> Subscription Based
// //           </Link>
// //         </li> */}
// //         {/* <li
// //           className={`${
// //             isActive("/dashboard-developer/website-based")
// //               ? "bg-indigo-100 text-indigo-600"
// //               : "text-gray-700 hover:text-indigo-600"
// //           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
// //         >
// //           <Link
// //             to="/dashboard-developer/website-based"
// //             onClick={() => setSidebarOpen(false)}
// //             className="flex items-center"
// //           >
// //             <AccountTreeOutlinedIcon className="mr-1" /> Website Based
// //           </Link>
// //         </li> */}
// // {/* 
// //         <li
// //           className={`${
// //             isActive("/dashboard-developer/compose")
// //               ? "bg-indigo-100 text-indigo-600"
// //               : "text-gray-700 hover:text-indigo-600"
// //           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
// //         >
// //           <Link
// //             to="/dashboard-developer/compose"
// //             onClick={() => setSidebarOpen(false)}
// //             className="flex items-center"
// //           >
// //             <MailOutlineIcon className="mr-1" /> Compose Mail
// //           </Link>
// //         </li> */}
// //         <li
// //           className={`${
// //             isActive("/dashboard-developer/calendar")
// //               ? "bg-indigo-100 text-indigo-600"
// //               : "text-gray-700 hover:text-indigo-600"
// //           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
// //         >
// //           <Link
// //             to="/dashboard-developer/calender"
// //             onClick={() => setSidebarOpen(false)}
// //             className="flex items-center"
// //           >
// //             <CalendarMonthOutlinedIcon className="mr-1" /> Calendar
// //           </Link>
// //         </li>
// //         <li
// //           className={`${
// //             isActive("/dashboard-developer/to-do-list")
// //               ? "bg-indigo-100 text-indigo-600"
// //               : "text-gray-700 hover:text-indigo-600"
// //           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
// //         >
// //           <Link
// //             to="/dashboard-Developer/to-do-list"
// //             onClick={() => setSidebarOpen(false)}
// //             className="flex items-center"
// //           >
// //             <InventoryOutlinedIcon className="mr-1" /> To Do List
// //           </Link>
// //         </li>
// //         <li className="text-gray-700 hover:text-red-600 cursor-pointer p-2 rounded-md hover:bg-gray-200">
// //           <button
// //             onClick={onLogout}
// //             className="flex items-center w-full text-left"
// //           >
// //             <LogoutOutlinedIcon className="mr-1" /> Logout
// //           </button>
// //         </li>
// //       </ul>
// //     </div>
// //   );
// // };

// // export default NavBar;










// import React, { useState, useEffect } from "react";
// import assets from "../assets/assets";
// import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
// import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
// import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
// import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
// import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

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
//     gap: 12px;
//     flex-shrink: 0;
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

//   /* Mobile: hide nav labels, show only icons */
//   @media (max-width: 640px) {
//     .dev-navbar { padding: 0 16px; }
//     .dev-nb-link { padding: 6px 10px; gap: 0; }
//     .dev-nb-link-label { display: none; }
//     .dev-nb-username { display: none; }
//   }
// `;

// const NavBar = () => {
//   const [username, setUsername] = useState("Developer");
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
//           {/* <NavLink to="/dashboard-developer/calender" icon={CalendarMonthOutlinedIcon} label="Calendar" />
//           <NavLink to="/dashboard-Developer/to-do-list" icon={InventoryOutlinedIcon} label="To Do List" /> */}
//         </nav>

//         <div className="dev-nb-right">
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
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .dev-navbar {
    font-family: 'DM Sans', sans-serif;
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.93);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid #eef0f6;
    padding: 0 28px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .dev-nb-logo {
    height: 30px;
    width: auto;
    flex-shrink: 0;
  }

  .dev-nb-nav {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1;
    justify-content: center;
  }

  .dev-nb-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    color: #6b7280;
    text-decoration: none;
    transition: all 0.15s ease;
    white-space: nowrap;
  }
  .dev-nb-link:hover {
    background: #f5f6fb;
    color: #374151;
  }
  .dev-nb-link.active {
    background: #eef1fd;
    color: #4f56c8;
  }
  .dev-nb-link svg {
    font-size: 16px !important;
    opacity: 0.7;
  }
  .dev-nb-link.active svg {
    opacity: 1;
  }

  .dev-nb-right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
    position: relative;
  }

  .dev-nb-username {
    font-size: 13px;
    color: #9ca3af;
  }
  .dev-nb-username span {
    color: #4f56c8;
    font-weight: 500;
  }

  .dev-nb-logout {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #6b7280;
    background: transparent;
    border: 1px solid #e2e4ee;
    border-radius: 8px;
    padding: 5px 14px;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .dev-nb-logout:hover {
    color: #ef4444;
    border-color: #fca5a5;
    background: #fff5f5;
  }

  .notification-container {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .notification-bell {
    font-size: 20px !important;
    color: #6b7280;
    transition: color 0.15s ease;
  }
  .notification-bell:hover {
    color: #374151;
  }

  .notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #ef4444;
    color: white;
    font-size: 9px;
    font-weight: 700;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #fff;
  }

  .notifications-dropdown {
    position: absolute;
    top: 45px;
    right: 0;
    width: 320px;
    max-height: 400px;
    background: #ffffff;
    border: 1px solid #eef0f6;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
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
    padding: 12px 16px;
    border-bottom: 1px solid #eef0f6;
    background: #fafbfe;
    font-size: 12px;
    font-weight: 700;
    color: #374151;
    display: flex;
    justify-content: space-between;
  }

  .notif-list {
    overflow-y: auto;
    flex: 1;
  }

  .notif-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f9fafb;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: background 0.1s ease;
  }
  .notif-item:hover {
    background: #fff5f5;
  }

  .notif-title {
    font-size: 12px;
    font-weight: 600;
    color: #111827;
  }

  .notif-project {
    font-size: 11px;
    color: #6b7280;
  }

  .notif-deadline {
    font-size: 10px;
    color: #ef4444;
    font-weight: 700;
    margin-top: 3px;
  }

  .notif-empty {
    padding: 24px;
    text-align: center;
    color: #9ca3af;
    font-size: 12px;
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
                <span>{overdueTasks.length} Task{overdueTasks.length === 1 ? "" : "s"}</span>
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