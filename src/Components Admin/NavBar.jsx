// import React, { useState, useEffect } from "react";
// import assets from "../assets/assets";
// import MenuOpenIcon from "@mui/icons-material/MenuOpen";
// import CloseIcon from "@mui/icons-material/Close";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import Sidebar from "react-sidebar";
// import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
// import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
// import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
// import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
// import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
// import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
// import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
// import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
// import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
// import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
// import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
// import MailOutlineIcon from "@mui/icons-material/MailOutline";
// import axios from "axios";
// import WhatsAppIcon from "@mui/icons-material/WhatsApp";
// import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
// import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
// import ContactPageOutlinedIcon from "@mui/icons-material/ContactPageOutlined";
// import DeveloperReports from "../Admin Pages/DeveloperReports";


// const NavBar = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [username, setUsername] = useState("Admin");
//   const navigate = useNavigate();

//   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return;

//         const response = await axios.get(`${API_BASE}/api/auth/user`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setUsername(response.data.username);
//       } catch (error) {
//         console.error("Failed to fetch user details", error);
//       }
//     };

//     fetchUser();
//   }, []);

//   // Logout function
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   return (
//     <>
//       <header className="p-4 lg:px-9 sticky top-0 flex justify-between items-center bg-white z-50 shadow-md relative">
//         <div className="flex items-center space-x-2">
//           <MenuOpenIcon
//             className="text-indigo-800 cursor-pointer text-5xl"
//             onClick={() => setSidebarOpen(true)}
//           />
//           <img className="w-30 h-10" src={assets.logo} alt="Logo" />
//         </div>
//         <p className="hidden sm:block md:text-xl lg:text-2xl font-medium text-indigo-800 absolute left-1/2 -translate-x-1/2">
//           Hey! {username}, Sup ?
//         </p>
//         <div className="hidden md:block">
//           <button
//             onClick={handleLogout}
//             className="w-22 h-10 rounded-lg cursor-pointer text-white bg-[#155dfc] hover:bg-indigo-500 px-4 hover:bg-red-500 hover:text-white hover:scale-110 transition duration-300 ease-in-out"
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       <Sidebar
//         sidebar={
//           <SidebarContent
//             setSidebarOpen={setSidebarOpen}
//             onLogout={handleLogout}
//           />
//         }
//         open={sidebarOpen}
//         onSetOpen={setSidebarOpen}
//         styles={{
//           sidebar: {
//             background: "#f8fafc",
//             width: "290px",
//             padding: "20px",
//             boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
//             borderRadius: "8px 0 0 8px",
//             zIndex: 60,
//             position: "fixed",
//             top: 0,
//             left: 0,
//             height: "100vh",
//             overflowY: "auto",
//           },
//           overlay: {
//             backgroundColor: "rgba(255, 255, 255, 0.2)",
//             backdropFilter: "blur(10px)",
//             zIndex: 50,
//           },
//         }}
//       />
//     </>
//   );
// };

// const SidebarContent = ({ setSidebarOpen, onLogout }) => {
//   const [projectDropdown, setProjectDropdown] = useState(false);
//   const [isMailingOpen, setMailingOpen] = useState(false);
//   const [isUserOpen, setUserOpen] = useState(false);
//   const location = useLocation();

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const toggleMailingDropdown = () => {
//     setMailingOpen(!isMailingOpen);
//   };
//   const toggleUserDropdown = () => {
//     setUserOpen(!isUserOpen);
//   };

//   return (
//     <div
//       className="flex flex-col h-full"
//       style={{
//         overflowY: "auto",
//         scrollbarWidth: "none",
//         msOverflowStyle: "none",
//       }}
//     >
//       <div className="sticky top-0 flex justify-between items-center mb-6 border-b pb-4 bg-[#f8fafc]">
//         <h2 className="text-xl font-semibold text-indigo-800">Dashboard</h2>
//         <CloseIcon
//           className="cursor-pointer text-indigo-800"
//           onClick={() => setSidebarOpen(false)}
//         />
//       </div>
//       <ul className="space-y-4">
//         <li
//           className={`${isActive("/dashboard-admin")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <WidgetsOutlinedIcon className="sm:mr-1" /> Overview
//           </Link>
//         </li>

//         <li
//           className={`${isActive("/dashboard-admin/create-user")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/create-user"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <PersonAddAltOutlinedIcon className="sm:mr-1" /> Create User
//           </Link>
//         </li>

//         <li>
//           <div
//             className={`${isUserOpen ? "bg-indigo-100 text-indigo-600" : "text-gray-700"
//               } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//             onClick={toggleUserDropdown}
//           >
//             <div className="flex items-center justify-between">
//               <span className="flex items-center">
//                 <ManageAccountsOutlinedIcon className="sm:mr-1" /> Manage Users
//               </span>
//               {isUserOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
//             </div>
//           </div>
//           {isUserOpen && (
//             <ul className="pl-4 mt-2 space-y-2">
//               <li
//                 className={`${isActive("/dashboard-admin/users")
//                     ? "bg-indigo-100 text-indigo-600"
//                     : "text-gray-700 hover:text-indigo-600"
//                   } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//               >
//                 <Link
//                   to="/dashboard-admin/users"
//                   onClick={() => setSidebarOpen(false)}
//                   className="flex items-center"
//                 >
//                   <PersonOutlineOutlinedIcon className="sm:mr-1" /> All Users
//                 </Link>
//               </li>
//               {/* <li
//                 className={`${
//                   isActive("/dashboard-admin/employee-attendances")
//                     ? "bg-indigo-100 text-indigo-600"
//                     : "text-gray-700 hover:text-indigo-600"
//                 } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//               >
//                 <Link
//                   to="/dashboard-admin/employee-attendances"
//                   onClick={() => setSidebarOpen(false)}
//                   className="flex items-center"
//                 >
//                   <ScheduleOutlinedIcon className="mr-1" /> Attendance
//                 </Link>
//               </li>
//               <li
//                 className={`${
//                   isActive("/dashboard-admin/monthly-attendances")
//                     ? "bg-indigo-100 text-indigo-600"
//                     : "text-gray-700 hover:text-indigo-600"
//                 } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//               >
//                 <Link
//                   to="/dashboard-admin/monthly-attendances"
//                   onClick={() => setSidebarOpen(false)}
//                   className="flex items-center"
//                 >
//                   <ScheduleOutlinedIcon className="mr-1" /> Monthly Attendance
//                 </Link>
//               </li> */}
//               <li
//                 className={`${isActive("/dashboard-admin/employee-")
//                     ? "bg-indigo-100 text-indigo-600"
//                     : "text-gray-700 hover:text-indigo-600"
//                   } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//               >
//                 <Link
//                   to="/dashboard-admin/employee-docs"
//                   onClick={() => setSidebarOpen(false)}
//                   className="flex items-center"
//                 >
//                   <ContactPageOutlinedIcon className="mr-1" /> Docs
//                 </Link>
//               </li>
//               <li
//                 className={`${isActive("/dashboard-admin/caller-teams")
//                     ? "bg-indigo-100 text-indigo-600"
//                     : "text-gray-700 hover:text-indigo-600"
//                   } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//               >
//                 <Link
//                   to="/dashboard-admin/caller-teams"
//                   onClick={() => setSidebarOpen(false)}
//                   className="flex items-center"
//                 >
//                   <PersonOutlineOutlinedIcon className="mr-1" /> Caller Teams
//                 </Link>
//               </li>
//             </ul>
//           )}
//         </li>

//         {/* <li
//           className={`${
//             isActive("/dashboard-admin/users")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/users"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <PersonOutlineOutlinedIcon className="sm:mr-1" /> All Users
//           </Link>
//         </li> */}
//         <li
//           className={`${isActive("/dashboard-admin/new-leads")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/developer-reports"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <CalendarTodayOutlinedIcon className="sm:mr-1" /> Work Reports
//           </Link>
//         </li>
//         <li
//           className={`${isActive("/dashboard-admin/new-leads")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/new-leads"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <CalendarTodayOutlinedIcon className="sm:mr-1" /> All New Leads
//           </Link>
//         </li>
//         <li
//           className={`${isActive("/dashboard-admin/assigned-leads")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/assigned-leads"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <AssignmentLateOutlinedIcon className="sm:mr-1" /> Assigned Leads
//           </Link>
//         </li>
//         <li
//           className={`${isActive("/dashboard-admin/closed-leads")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/closed-leads"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <EventAvailableOutlinedIcon className="sm:mr-1" /> Closed Leads
//           </Link>
//         </li>
//         <li
//           className={`${isActive("/dashboard-admin/create-project")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/create-project"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <AddCircleOutlineOutlinedIcon className="sm:mr-1" /> Create a
//             Project
//           </Link>
//         </li>
//         <li
//           className={`${isActive("/dashboard-admin/projects")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/projects"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <AccountTreeOutlinedIcon className="sm:mr-1" /> Projects List
//           </Link>
//         </li>








//         {/* <li>
//           <div
//             className={`${
//               isMailingOpen ? "bg-indigo-100 text-indigo-600" : "text-gray-700"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//             onClick={toggleMailingDropdown}
//           >
//             <div className="flex items-center justify-between">
//               <span className="flex items-center">
//                 <MailOutlineIcon className="sm:mr-1" /> Mailing
//               </span>
//               {isMailingOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
//             </div>
//           </div>
//           {isMailingOpen && (
//             <ul className="pl-4 mt-2 space-y-2">
//               <li
//                 className={`${
//                   isActive("/dashboard-admin/compose")
//                     ? "bg-indigo-100 text-indigo-600"
//                     : "text-gray-700 hover:text-indigo-600"
//                 } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//               >
//                 <Link
//                   to="/dashboard-admin/compose"
//                   onClick={() => setSidebarOpen(false)}
//                   className="flex items-center"
//                 >
//                   Compose Mail
//                 </Link>
//               </li>
//               <li
//                 className={`${
//                   isActive("/dashboard-admin/sent")
//                     ? "bg-indigo-100 text-indigo-600"
//                     : "text-gray-700 hover:text-indigo-600"
//                 } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//               >
//                 <Link
//                   to="/dashboard-admin/sent"
//                   onClick={() => setSidebarOpen(false)}
//                   className="flex items-center"
//                 >
//                   Sent Mails
//                 </Link>
//               </li>
//               {/* <li
//                 className={`${
//                   isActive("/dashboard-admin/inbox")
//                     ? "bg-indigo-100 text-indigo-600"
//                     : "text-gray-700 hover:text-indigo-600"
//                 } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//               >
//                 <Link
//                   to="/dashboard-admin/inbox"
//                   onClick={() => setSidebarOpen(false)}
//                   className="flex items-center"
//                 >
//                   Inbox
//                 </Link>
//               </li> */}
//         {/* </ul>
//           )}
//         </li> */}












//         {/* <li
//           className={`${
//             isActive("/dashboard-admin/whatsapp")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/Whatsapp"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <WhatsAppIcon className="sm:mr-1" /> Whatsapp
//           </Link>
//         </li> */}










//         <li
//           className={`${isActive("/dashboard-admin/calendar")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/calendar"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <CalendarMonthOutlinedIcon className="sm:mr-1" /> Calendar
//           </Link>
//         </li>
//         <li
//           className={`${isActive("/dashboard-admin/to-do-list")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//             } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-admin/to-do-list"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <InventoryOutlinedIcon className="sm:mr-1" /> To Do List
//           </Link>
//         </li>
//         <li className="text-gray-700 hover:text-red-600 cursor-pointer p-2 rounded-md hover:bg-gray-200">
//           <button
//             onClick={onLogout}
//             className="flex items-center w-full text-left"
//           >
//             <LogoutOutlinedIcon className="sm:mr-1" /> Logout
//           </button>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default NavBar;










import React, { useState, useEffect } from "react";
import assets from "../assets/assets";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "react-sidebar";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import axios from "axios";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import ContactPageOutlinedIcon from "@mui/icons-material/ContactPageOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@400;500&display=swap');

  .nb-root { font-family: 'DM Sans', sans-serif; }

  .nb-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(255,255,255,0.93);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid #eef0f6;
    padding: 0 28px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .nb-left { display: flex; align-items: center; gap: 12px; }

  .nb-menu-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 9px;
    border: 1px solid #e8eaf2; background: #f7f8fc;
    cursor: pointer; transition: all 0.18s ease; color: #4f56c8;
  }
  .nb-menu-btn:hover { background: #eef0fc; border-color: #c7caf0; }

  .nb-logo { height: 32px; width: auto; }

  .nb-greeting {
    position: absolute; left: 50%; transform: translateX(-50%);
    font-size: 13.5px; color: #9ca3af; white-space: nowrap;
  }
  .nb-greeting span { color: #4f56c8; font-weight: 500; }

  .nb-logout-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: #6b7280;
    background: transparent; border: 1px solid #e2e4ee;
    border-radius: 8px; padding: 6px 16px;
    cursor: pointer; transition: all 0.18s ease;
  }
  .nb-logout-btn:hover { color: #ef4444; border-color: #fca5a5; background: #fff5f5; }

  /* Sidebar */
  .sb-wrap {
    display: flex; flex-direction: column; height: 100%;
    font-family: 'DM Sans', sans-serif;
    overflow-y: auto; scrollbar-width: none;
  }
  .sb-wrap::-webkit-scrollbar { display: none; }

  .sb-header {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 18px; margin-bottom: 4px;
    border-bottom: 1px solid #f0f1f8;
  }
  .sb-title {
    font-family: 'Syne', sans-serif;
    font-size: 14.5px; font-weight: 500;
    color: #1e1f2e; letter-spacing: 0.03em;
  }
  .sb-close {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 7px;
    cursor: pointer; color: #9ca3af; transition: all 0.15s;
  }
  .sb-close:hover { background: #f3f4f6; color: #374151; }

  .sb-link {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 10px; border-radius: 9px;
    font-size: 13.5px; color: #4b5563;
    text-decoration: none; transition: all 0.15s;
    margin-bottom: 2px;
  }
  .sb-link:hover { background: #f5f6fb; color: #374151; }
  .sb-link.active { background: #eef1fd; color: #4f56c8; }
  .sb-link svg { font-size: 17px !important; opacity: 0.7; }
  .sb-link.active svg { opacity: 1; }

  .sb-divider { height: 1px; background: #f0f1f8; margin: 8px 0; }

  .sb-group { margin-bottom: 2px; }

  .sb-group-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 10px; border-radius: 9px;
    cursor: pointer; transition: background 0.15s; user-select: none;
  }
  .sb-group-hdr:hover { background: #f5f6fb; }
  .sb-group-hdr.open { background: #f0f2fd; }

  .sb-group-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 500;
    letter-spacing: 0.09em; text-transform: uppercase; color: #b0b5cc;
  }
  .sb-group-hdr.open .sb-group-label { color: #4f56c8; }
  .sb-group-label svg { font-size: 15px !important; }

  .sb-group-arrow {
    color: #d1d5db; transition: transform 0.2s;
    font-size: 18px !important;
  }
  .sb-group-hdr.open .sb-group-arrow { transform: rotate(180deg); color: #a5aadc; }

  .sb-group-items {
    padding-left: 8px; margin-top: 2px;
    animation: sbFadeIn 0.15s ease;
  }
  @keyframes sbFadeIn {
    from { opacity: 0; transform: translateY(-3px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .sb-item {
    display: flex; align-items: center; gap: 9px;
    padding: 7px 10px; border-radius: 8px;
    font-size: 13px; color: #4b5563;
    text-decoration: none; transition: all 0.15s;
    margin-bottom: 1px; position: relative;
  }
  .sb-item:hover { background: #f5f6fb; color: #374151; }
  .sb-item.active {
    background: #eef1fd; color: #4f56c8;
  }
  .sb-item.active::before {
    content: ''; position: absolute;
    left: 0; top: 50%; transform: translateY(-50%);
    width: 2.5px; height: 55%;
    background: #4f56c8; border-radius: 2px;
  }
  .sb-item svg { font-size: 15px !important; opacity: 0.65; flex-shrink: 0; }
  .sb-item.active svg { opacity: 1; }

  .sb-bottom { margin-top: auto; padding-top: 14px; border-top: 1px solid #f0f1f8; }
  .sb-logout-btn {
    display: flex; align-items: center; gap: 9px;
    width: 100%; padding: 8px 10px; border-radius: 9px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #9ca3af; background: transparent; border: none;
    cursor: pointer; transition: all 0.15s; text-align: left;
  }
  .sb-logout-btn:hover { background: #fff5f5; color: #ef4444; }
  .sb-logout-btn svg { font-size: 15px !important; }
`;

const NavBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("Admin");
  const navigate = useNavigate();
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="nb-root">
        <header className="nb-header">
          <div className="nb-left">
            <div className="nb-menu-btn" onClick={() => setSidebarOpen(true)}>
              <MenuOpenIcon style={{ fontSize: 18 }} />
            </div>
            <img className="nb-logo" src={assets.logo} alt="Logo" />
          </div>
          <p className="nb-greeting" style={{ display: typeof window !== 'undefined' && window.innerWidth < 640 ? 'none' : undefined }}>
            Hey, <span>{username}</span> — good to see you
          </p>
          <button className="nb-logout-btn" onClick={handleLogout}>Logout</button>
        </header>
      </div>

      <Sidebar
        sidebar={<SidebarContent setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />}
        open={sidebarOpen}
        onSetOpen={setSidebarOpen}
        styles={{
          sidebar: {
            background: "#ffffff",
            width: "268px",
            padding: "22px 14px",
            boxShadow: "4px 0 28px rgba(0,0,0,0.07)",
            zIndex: 60,
            position: "fixed",
            top: 0, left: 0,
            height: "100vh",
            overflowY: "auto",
            borderRight: "1px solid #eef0f6",
          },
          overlay: {
            backgroundColor: "rgba(10,12,30,0.15)",
            backdropFilter: "blur(6px)",
            zIndex: 50,
          },
        }}
      />
    </>
  );
};

const SidebarContent = ({ setSidebarOpen, onLogout }) => {
  const [hrOpen, setHrOpen] = useState(true);
  const [salesOpen, setSalesOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const Item = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={`sb-item ${isActive(to) ? "active" : ""}`}
    >
      <Icon />
      {label}
    </Link>
  );

  const Group = ({ label, icon: Icon, open, onToggle, children }) => (
    <div className="sb-group">
      <div className={`sb-group-hdr ${open ? "open" : ""}`} onClick={onToggle}>
        <span className="sb-group-label">
          <Icon />
          {label}
        </span>
        <ArrowDropDownIcon className="sb-group-arrow" />
      </div>
      {open && <div className="sb-group-items">{children}</div>}
    </div>
  );

  return (
    <div className="sb-wrap">
      <div className="sb-header">
        <span className="sb-title ">Starway Web Digital</span>
        <div className="sb-close" onClick={() => setSidebarOpen(false)}>
          <CloseIcon style={{ fontSize: 17 }} />
        </div>
      </div>

      {/* Overview */}
      <Link
        to="/dashboard-admin"
        onClick={() => setSidebarOpen(false)}
        className={`sb-link ${isActive("/dashboard-admin") ? "active" : ""}`}
      >
        <WidgetsOutlinedIcon />
        Overview
      </Link>

      <div className="sb-divider" />

      {/* HR */}
      <Group
        label="HR"
        icon={GroupsOutlinedIcon}
        open={hrOpen}
        onToggle={() => setHrOpen(!hrOpen)}
      >
        <Item to="/dashboard-admin/create-user" icon={PersonAddAltOutlinedIcon} label="Create User" />
        <Item to="/dashboard-admin/users" icon={PersonOutlineOutlinedIcon} label="All Users" />
        <Item to="/dashboard-admin/developer-reports" icon={AssessmentOutlinedIcon} label="Work Reports" />
        <Item to="/dashboard-admin/caller-teams" icon={ManageAccountsOutlinedIcon} label="Calling Teams" />
        <Item to="/dashboard-admin/employee-docs" icon={ContactPageOutlinedIcon} label="Docs" />
      </Group>

      <div className="sb-divider" />

      {/* Sales */}
      <Group
        label="Sales"
        icon={TrendingUpOutlinedIcon}
        open={salesOpen}
        onToggle={() => setSalesOpen(!salesOpen)}
      >
        <Item to="/dashboard-admin/new-leads" icon={CalendarTodayOutlinedIcon} label="All New Leads" />
        <Item to="/dashboard-admin/assigned-leads" icon={AssignmentLateOutlinedIcon} label="Assigned Leads" />
        <Item to="/dashboard-admin/closed-leads" icon={EventAvailableOutlinedIcon} label="Closed Leads" />
        <Item to="/dashboard-admin/calendar" icon={CalendarMonthOutlinedIcon} label="Calendar" />
      </Group>

      <div className="sb-divider" />

      {/* Projects */}
      <Group
        label="Projects"
        icon={FolderOpenOutlinedIcon}
        open={projectsOpen}
        onToggle={() => setProjectsOpen(!projectsOpen)}
      >
        <Item to="/dashboard-admin/create-project" icon={AddCircleOutlineOutlinedIcon} label="Create a Project" />
        <Item to="/dashboard-admin/projects" icon={AccountTreeOutlinedIcon} label="Projects List" />
      </Group>

      <div className="sb-divider" />

      {/* To Do */}
      <Link
        to="/dashboard-admin/to-do-list"
        onClick={() => setSidebarOpen(false)}
        className={`sb-link ${isActive("/dashboard-admin/to-do-list") ? "active" : ""}`}
      >
        <InventoryOutlinedIcon />
        To Do List
      </Link>

      {/* Logout */}
      <div className="sb-bottom">
        <button className="sb-logout-btn" onClick={onLogout}>
          <LogoutOutlinedIcon />
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavBar;