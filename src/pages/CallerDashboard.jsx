import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import AddLeads from "../Caller Pages/AddLeads";
import ClosedLeads from "../Caller Pages/ClosedLeads";
import Home from "../Caller Pages/Home";
import AllLeads from "../Caller Pages/AllLeads";
import ToDoList from "../Caller Pages/ToDoList";
import Calendar from "../Caller Pages/Calender";
import MyLeaves from "../components/leaves/MyLeaves";
import MyPayrollPortal from "../components/payroll/MyPayrollPortal";
import MyAttendancePage from "../components/attendance/MyAttendancePage";

const CallerDashboard = () => {
  return (
    <DashboardLayout role="caller">
      <Routes>
        <Route index element={<Home />} />
        <Route path="add-leads" element={<AddLeads />} />
        <Route path="all-leads" element={<AllLeads />} />
        <Route path="closed-leads" element={<ClosedLeads />} />
        <Route path="to-do-list" element={<ToDoList />} />
        <Route path="leaves" element={<MyLeaves />} />
        <Route path="my-payroll" element={<MyPayrollPortal />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="attendance" element={<MyAttendancePage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default CallerDashboard;
