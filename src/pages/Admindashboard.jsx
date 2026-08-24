import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../Admin Pages/Home";
import CreateUser from "../Admin Pages/Createuser";
import NewLeads from "../Admin Pages/NewLeads";
import ClosedLeads from "../Admin Pages/ClosedLeads";
import CreateProject from "../Admin Pages/CreateProject";
import Projects from "../Admin Pages/Projects";
import Calendar from "../Admin Pages/Calendar";
import ToDoList from "../Admin Pages/ToDoList";
import AssignedLeads from "../Admin Pages/AssignedLeads";
import Compose from "../Mailing System/Compose";
import Sent from "../Mailing System/Sent";
import Inbox from "../Mailing System/Inbox";
import Whatsapp from "../Components Global/Whatsapp";
import Timesheet from "../Admin Pages/Timesheet";
import Monthly from "../Admin Pages/MonthlyAttendance";
import DeveloperReports from "../Admin Pages/DeveloperReports";
import CallerTeams from "../Admin Pages/CallerTeams";
import AddLeads from "../Admin Pages/AddLeads";

// HR & Workforce Hub Components
import AttendanceHub from "../HR Pages/Attendance/AttendanceHub";
import PayrollHub from "../HR Pages/Payroll/PayrollHub";
import LeaveManagement from "../HR Pages/LeaveManagement";
import EmployeesDirectory from "../HR Pages/EmployeesDirectory";

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <Routes>
        <Route index element={<Home />} />
        
        {/* Workforce & HR Management */}
        <Route path="employees" element={<EmployeesDirectory />} />
        <Route path="users" element={<EmployeesDirectory />} />
        <Route path="create-user" element={<CreateUser />} />
        <Route path="caller-teams" element={<CallerTeams />} />
        <Route path="attendance" element={<AttendanceHub />} />
        <Route path="leaves" element={<LeaveManagement />} />
        <Route path="payroll" element={<PayrollHub />} />
        <Route path="developer-reports" element={<DeveloperReports />} />

        {/* Sales & CRM */}
        <Route path="add-leads" element={<AddLeads />} />
        <Route path="new-leads" element={<NewLeads />} />
        <Route path="assigned-leads" element={<AssignedLeads />} />
        <Route path="closed-leads" element={<ClosedLeads />} />

        {/* Projects & Operations */}
        <Route path="create-project" element={<CreateProject />} />
        <Route path="projects" element={<Projects />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="to-do-list" element={<ToDoList />} />

        {/* Communications */}
        <Route path="compose" element={<Compose />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="sent" element={<Sent />} />
        <Route path="whatsapp" element={<Whatsapp />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
