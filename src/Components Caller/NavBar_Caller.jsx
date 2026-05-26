import React, { useState, useEffect, useRef } from "react";
import assets from "../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

// Icons
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CircleIcon from "@mui/icons-material/Circle";

const NavBar = () => {
  const [username, setUsername] = useState("Admin");
  
  // Dropdown States
  const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [todaysFollowUps, setTodaysFollowUps] = useState([]);
  
  const salesRef = useRef(null);
  const notifRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  const isActive = (path) => location.pathname === path;
  const isSalesActive = ["/dashboard-caller/add-leads", "/dashboard-caller/all-leads", "/dashboard-caller/leads-closed"].includes(location.pathname);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (salesRef.current && !salesRef.current.contains(event.target)) {
        setSalesDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch User Details & Today's Follow-ups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch User Info
        axios.get(`${API_BASE}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => setUsername(res.data.username)).catch(err => console.error(err));

        // Fetch Leads to check for today's follow-ups
        axios.get(`${API_BASE}/api/leads/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          const leads = Array.isArray(res.data) ? res.data : (res.data.leads || []);
          const today = dayjs();
          
          // Filter for leads scheduled for today, ignoring closed or dropped ones
          const followUpsToday = leads.filter(lead => 
            lead.followUpDate && 
            lead.status !== "dropped" && 
            lead.status !== "closed" && 
            dayjs(lead.followUpDate).isSame(today, 'day')
          );
          
          setTodaysFollowUps(followUpsToday);
        }).catch(err => console.error("Failed to fetch follow-ups", err));

      } catch (error) {
        console.error("Error in NavBar data fetching", error);
      }
    };
    fetchData();
  }, [API_BASE]);

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

        {/* Sales Dropdown */}
        <div className="relative" ref={salesRef}>
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

      {/* Right: Notifications, User & Logout */}
      <div className="flex items-center space-x-5 min-w-[150px] justify-end">
        
       
        {/* User Info */}
        <p className="text-gray-400 text-xs hidden sm:block">
          Hey, <span className="text-indigo-600 font-semibold">{username}</span>
        </p>
        
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 text-gray-500 hover:bg-gray-50 rounded-full transition-colors outline-none"
          >
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
            {todaysFollowUps.length > 0 && (
              <span className="absolute top-1 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationsOpen && (
            <div className="absolute top-full right-0 w-80 bg-white border border-gray-100 shadow-xl rounded-lg py-2 mt-2 z-50">
              <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-800">Today's Follow-ups</h3>
                <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                  {todaysFollowUps.length}
                </span>
              </div>
              
              <div className="max-h-72 overflow-y-auto">
                {todaysFollowUps.length > 0 ? (
                  todaysFollowUps.map((lead) => (
                    <div key={lead._id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{lead.leadName}</span>
                        <CircleIcon sx={{ fontSize: 8, color: '#4f46e5' }} />
                      </div>
                      <span className="text-xs text-gray-500">
                        {lead.phoneNumber} {lead.email && `• ${lead.email}`}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No follow-ups scheduled for today.
                  </div>
                )}
              </div>
              
              {todaysFollowUps.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-50 text-center">
                  <Link 
                    to="/dashboard-caller/calender" 
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    View in Calendar
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>


        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="border border-gray-200 text-gray-500 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
        >
          Logout
        </button>
      </div>

    </header>
  );
};

export default NavBar;