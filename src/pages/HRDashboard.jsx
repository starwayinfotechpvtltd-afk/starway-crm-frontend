import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import HROverview from "../HR Pages/HROverview";
import EmployeesDirectory from "../HR Pages/EmployeesDirectory";
import LeaveManagement from "../HR Pages/LeaveManagement";
import CreateUser from "../Admin Pages/Createuser";
import CallerTeams from "../Admin Pages/CallerTeams";
import DeveloperReports from "../Admin Pages/DeveloperReports";
import GlobalEnterpriseCalendar from "../components/calendar/GlobalEnterpriseCalendar";
import PayrollHub from "../HR Pages/Payroll/PayrollHub";
import AttendanceHub from "../HR Pages/Attendance/AttendanceHub";

export default function HRDashboard() {
  return (
    <DashboardLayout role="hr">
      <Routes>
        <Route index element={<HROverview />} />
        <Route path="employees" element={<EmployeesDirectory />} />
        <Route path="create-user" element={<CreateUser />} />
        <Route path="teams" element={<CallerTeams />} />
        <Route path="leaves" element={<LeaveManagement />} />
        <Route path="payroll" element={<PayrollHub />} />
        <Route path="calendar" element={<GlobalEnterpriseCalendar mode="hr" />} />
        <Route path="reports" element={<DeveloperReports />} />
        <Route path="attendance" element={<AttendanceHub />} />
      </Routes>
    </DashboardLayout>
  );
}
