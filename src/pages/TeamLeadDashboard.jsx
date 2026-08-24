import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import TLOverview from "../Team Lead Pages/TLOverview";
import TeamTaskBoard from "../Team Lead Pages/TeamTaskBoard";
import EmployeesDirectory from "../HR Pages/EmployeesDirectory";
import Projects from "../Admin Pages/Projects";
import Timesheet from "../Admin Pages/Timesheet";
import ToDoList from "../Admin Pages/ToDoList";
import GlobalEnterpriseCalendar from "../components/calendar/GlobalEnterpriseCalendar";
import MyLeaves from "../components/leaves/MyLeaves";
import MyPayrollPortal from "../components/payroll/MyPayrollPortal";
import MyAttendancePage from "../components/attendance/MyAttendancePage";

export default function TeamLeadDashboard() {
  return (
    <DashboardLayout role="team_lead">
      <Routes>
        <Route index element={<TLOverview />} />
        <Route path="tasks" element={<TeamTaskBoard />} />
        <Route path="members" element={<EmployeesDirectory />} />
        <Route path="projects" element={<Projects />} />
        <Route path="leaves" element={<MyLeaves />} />
        <Route path="my-payroll" element={<MyPayrollPortal />} />
        <Route path="calendar" element={<GlobalEnterpriseCalendar mode="team_lead" />} />
        <Route path="to-do-list" element={<ToDoList />} />
        <Route path="attendance" element={<MyAttendancePage />} />
      </Routes>
    </DashboardLayout>
  );
}
