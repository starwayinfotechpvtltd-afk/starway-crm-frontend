import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../Developer Pages/Home";
import DeveloperTasks from "../Developer Pages/DeveloperTasks";
import OneTime from "../Developer Pages/OneTime";
import Subscription from "../Developer Pages/Subscription";
import Website from "../Developer Pages/Website";
import ToDoList from "../Developer Pages/ToDo";
import Calendar from "../Developer Pages/Calender";
import MyLeaves from "../components/leaves/MyLeaves";
import MyPayrollPortal from "../components/payroll/MyPayrollPortal";
import MyAttendancePage from "../components/attendance/MyAttendancePage";

const DeveloperDashboard = () => {
  return (
    <DashboardLayout role="developer">
      <Routes>
        <Route index element={<Home />} />
        <Route path="tasks" element={<DeveloperTasks />} />
        <Route path="one-time" element={<OneTime />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="website-based" element={<Website />} />
        <Route path="to-do-list" element={<ToDoList />} />
        <Route path="leaves" element={<MyLeaves />} />
        <Route path="my-payroll" element={<MyPayrollPortal />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="attendance" element={<MyAttendancePage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
