import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../Manager Pages/Home";
import ClosedLeads from "../Manager Pages/ClosedLeads";
import NewLeads from "../Manager Pages/NewLeads";
import Leads from "../Manager Pages/Leads";
import CallerTeams from "../Admin Pages/CallerTeams";
import GlobalEnterpriseCalendar from "../components/calendar/GlobalEnterpriseCalendar";
import MyLeaves from "../components/leaves/MyLeaves";
import MyPayrollPortal from "../components/payroll/MyPayrollPortal";
import MyAttendancePage from "../components/attendance/MyAttendancePage";

const ManagerDashboard = () => {
  return (
    <DashboardLayout role="manager">
      <Routes>
        <Route index element={<Home />} />
        <Route path="new-leads" element={<NewLeads />} />
        <Route path="closed-leads" element={<ClosedLeads />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leaves" element={<MyLeaves />} />
        <Route path="my-payroll" element={<MyPayrollPortal />} />
        <Route path="calendar" element={<GlobalEnterpriseCalendar mode="manager" />} />
        <Route path="teams" element={<CallerTeams />} />
        <Route path="attendance" element={<MyAttendancePage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
