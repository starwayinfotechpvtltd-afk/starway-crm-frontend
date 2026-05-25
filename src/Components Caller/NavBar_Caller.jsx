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
//           <img
//             className="w-30 sm:ml-3 h-10 sm:hover:scale-120 transition duration-300 ease-in-out"
//             src={assets.logo}
//             alt="Logo"
//           />
//         </div>
//         <p className="hidden sm:block md:text-xl lg:text-2xl font-medium text-indigo-800 absolute left-1/2 -translate-x-1/2">
//           Hey! {username}, Sup ?
//         </p>
//         <div className="hidden md:block">
//           <button
//             onClick={handleLogout}
//             className="w-22 h-10 rounded-sm cursor-pointer text-white bg-[#155dfc] hover:bg-[#2636ee] px-4 hover:bg-red-500 hover:text-white hover:scale-110 transition duration-300 ease-in-out"
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
//   const location = useLocation();

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const toggleMailingDropdown = () => {
//     setMailingOpen(!isMailingOpen);
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
//           className={`${
//             isActive("/dashboard-caller/")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-caller/"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <WidgetsOutlinedIcon className="mr-1" /> Home
//           </Link>
//         </li>

//         <li
//           className={`${
//             isActive("/dashboard-caller/add-leads")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-caller/add-leads"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <CalendarTodayOutlinedIcon className="mr-1" /> Add Leads
//           </Link>
//         </li>
//         <li
//           className={`${
//             isActive("/dashboard-caller/all-leads")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-caller/all-leads"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <EventAvailableOutlinedIcon className="mr-1" /> All Leads
//           </Link>
//         </li>
//         <li
//           className={`${
//             isActive("/dashboard-caller/leads-closed")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-caller/leads-closed"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <EventAvailableOutlinedIcon className="mr-1" /> Closed Leads
//           </Link>
//         </li>

//         {/* <li
//           className={`${
//             isActive("/dashboard-caller/compose")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-caller/compose"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <MailOutlineIcon className="mr-1" /> Compose Mail
//           </Link>
//         </li> */}
//         <li
//           className={`${
//             isActive("/dashboard-caller/to-do-list")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-caller/to-do-list"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <InventoryOutlinedIcon className="mr-1" /> To Do List
//           </Link>
//         </li>
//         <li
//           className={`${
//             isActive("/dashboard-caller/calender")
//               ? "bg-indigo-100 text-indigo-600"
//               : "text-gray-700 hover:text-indigo-600"
//           } cursor-pointer p-2 rounded-md hover:bg-gray-200`}
//         >
//           <Link
//             to="/dashboard-caller/calender"
//             onClick={() => setSidebarOpen(false)}
//             className="flex items-center"
//           >
//             <CalendarMonthOutlinedIcon className="mr-1" /> Calendar
//           </Link>
//         </li>
//         <li className="text-gray-700 hover:text-red-600 cursor-pointer p-2 rounded-md hover:bg-gray-200">
//           <button
//             onClick={onLogout}
//             className="flex items-center w-full cursor-pointer text-left"
//           >
//             <LogoutOutlinedIcon className="mr-1" /> Logout
//           </button>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default NavBar;



















import React, { useState, useEffect, useRef } from "react";
import assets from "../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Icons
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const NavBar = () => {
  const [username, setUsername] = useState("Admin");
  const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  const isActive = (path) => location.pathname === path;
  const isSalesActive = ["/dashboard-caller/add-leads", "/dashboard-caller/all-leads", "/dashboard-caller/leads-closed"].includes(location.pathname);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSalesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="w-full bg-white border-b border-gray-200 px-10 py-5 flex items-center justify-between sticky top-0 z-50">
      
      {/* Left: Logo */}
      <div className="flex items-center min-w-[150px]">
        <img
          src={assets.logo}
          alt="Logo"
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* Center: Navigation Links (Compact) */}
      <nav className="flex items-center space-x-1">
        <Link
          to="/dashboard-caller/"
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm ${
            isActive("/dashboard-caller/") 
            ? "bg-[#eef2ff] text-[#4f46e5] font-medium" 
            : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <WidgetsOutlinedIcon sx={{ fontSize: 18 }} />
          <span>Overview</span>
        </Link>

        {/* Sales Dropdown (Click trigger) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setSalesDropdownOpen(!salesDropdownOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm outline-none ${
              isSalesActive 
              ? "bg-[#eef2ff] text-[#4f46e5] font-medium" 
              : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Sales</span>
            <KeyboardArrowDownIcon sx={{ fontSize: 16 }} className={`transition-transform ${salesDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {salesDropdownOpen && (
            <div className="absolute top-full left-0 w-44 bg-white border border-gray-100 shadow-xl rounded-lg py-1 mt-2 z-50 overflow-hidden">
              <Link 
                to="/dashboard-caller/add-leads" 
                onClick={() => setSalesDropdownOpen(false)}
                className="block px-4 py-2 text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Add Leads
              </Link>
              <Link 
                to="/dashboard-caller/all-leads" 
                onClick={() => setSalesDropdownOpen(false)}
                className="block px-4 py-2 text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                All Leads
              </Link>
              <Link 
                to="/dashboard-caller/leads-closed" 
                onClick={() => setSalesDropdownOpen(false)}
                className="block px-4 py-2 text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Closed Leads
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/dashboard-caller/calender"
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm ${
            isActive("/dashboard-caller/calender") 
            ? "bg-[#eef2ff] text-[#4f46e5] font-medium" 
            : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
          <span>Calendar</span>
        </Link>
      </nav>

      {/* Right: User & Logout */}
      <div className="flex items-center space-x-4 min-w-[150px] justify-end">
        <p className="text-gray-400 text-xs">
          Hey, <span className="text-indigo-600 font-semibold">{username}</span>
        </p>
        
        <button
          onClick={handleLogout}
          className="border border-gray-200 text-gray-500 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
        >
          Logout
        </button>
      </div>

    </header>
  );
};

export default NavBar;