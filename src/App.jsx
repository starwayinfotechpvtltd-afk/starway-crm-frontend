// import React, { useEffect, useState } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useNavigate,
// } from "react-router-dom";
// import Login from "./pages/Login";
// import AdminDashboard from "./pages/Admindashboard";
// import CallerDashboard from "./pages/CallerDashboard";
// import DeveloperDashboard from "./pages/DeveloperDashboard";
// import ManagerDashboard from "./pages/ManagerDashboard";

// // Custom Hook: Tracks inactivity and returns modal state
// const useAutoLogout = (timeoutInMinutes = 120) => {
//   const navigate = useNavigate();
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const timeoutMs = timeoutInMinutes * 60 * 1000;

//   useEffect(() => {
//     let timer;

//     const logout = () => {
//       localStorage.clear(); // Clear session immediately for security
//       setShowLogoutModal(true); // Show our custom modal instead of alert()
//     };

//     const resetTimer = () => {
//       if (timer) clearTimeout(timer);
//       timer = setTimeout(logout, timeoutMs);
//     };

//     // Only track events if the modal isn't showing
//     if (!showLogoutModal) {
//       const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
//       events.forEach((event) => window.addEventListener(event, resetTimer));
//       resetTimer(); // Start the clock

//       return () => {
//         events.forEach((event) => window.removeEventListener(event, resetTimer));
//         if (timer) clearTimeout(timer);
//       };
//     }
//   }, [timeoutMs, showLogoutModal]);

//   // Function to handle the button click inside the modal
//   const handleCloseModal = () => {
//     setShowLogoutModal(false);
//     navigate("/");
//   };

//   return { showLogoutModal, handleCloseModal };
// };

// // ProtectedRoute: Checks authorization
// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role");

//   if (!token) return <Navigate to="/" />;
//   if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;

//   return children;
// };

// // AppContent: Wraps routes and renders the modal
// const AppContent = () => {
//   const { showLogoutModal, handleCloseModal } = useAutoLogout(120); // 1-minute test

//   return (
//     <>
//       {/* Custom Tailwind Modal Overlay */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center transform transition-all scale-100 opacity-100">
//             {/* Clock/Warning Icon */}
//             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
//               <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
            
//             <h3 className="text-2xl font-bold text-gray-900 mb-2">
//               Session Expired
//             </h3>
//             <p className="text-sm text-gray-500 mb-8 font-medium">
//               You have been inactive for a while. For your security, you have been automatically logged out.
//             </p>
            
//             <button
//               onClick={handleCloseModal}
//               className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//             >
//               Back to Login
//             </button>
//           </div>
//         </div>
//       )}

//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route
//           path="/dashboard-admin/*"
//           element={
//             <ProtectedRoute allowedRoles={["admin"]}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/dashboard-caller/*"
//           element={
//             <ProtectedRoute allowedRoles={["caller"]}>
//               <CallerDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/dashboard-developer/*"
//           element={
//             <ProtectedRoute allowedRoles={["developer"]}>
//               <DeveloperDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/dashboard-team-manager/*"
//           element={
//             <ProtectedRoute allowedRoles={["manager"]}>
//               <ManagerDashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </>
//   );
// };

// const App = () => {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// };

// export default App;


















import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/Admindashboard";
import CallerDashboard from "./pages/CallerDashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import HrDashboard from "./pages/HrDashboard";
import { TaskProvider } from "./TaskContext"; // Make sure this path matches exactly where you saved it

// Custom Hook: Tracks inactivity and returns modal state
const useAutoLogout = (timeoutInMinutes = 120) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const timeoutMs = timeoutInMinutes * 60 * 1000;

  useEffect(() => {
    let timer;

    const logout = () => {
      localStorage.clear(); // Clear session immediately for security
      setShowLogoutModal(true); // Show our custom modal instead of alert()
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(logout, timeoutMs);
    };

    // Only track events if the modal isn't showing
    if (!showLogoutModal) {
      const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
      events.forEach((event) => window.addEventListener(event, resetTimer));
      resetTimer(); // Start the clock

      return () => {
        events.forEach((event) => window.removeEventListener(event, resetTimer));
        if (timer) clearTimeout(timer);
      };
    }
  }, [timeoutMs, showLogoutModal]);

  // Function to handle the button click inside the modal
  const handleCloseModal = () => {
    setShowLogoutModal(false);
    navigate("/");
  };

  return { showLogoutModal, handleCloseModal };
};

// ProtectedRoute: Checks authorization
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;

  return children;
};

// AppContent: Wraps routes and renders the modal
const AppContent = () => {
  const { showLogoutModal, handleCloseModal } = useAutoLogout(120); // 120-minute timeout

  return (
    <>
      {/* Custom Tailwind Modal Overlay */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center transform transition-all scale-100 opacity-100">
            {/* Clock/Warning Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Session Expired
            </h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">
              You have been inactive for a while. For your security, you have been automatically logged out.
            </p>
            
            <button
              onClick={handleCloseModal}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route
          path="/dashboard-admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard-caller/*"
          element={
            <ProtectedRoute allowedRoles={["caller"]}>
              <CallerDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* THIS IS THE FIX: TaskProvider ONLY wraps the Developer Dashboard */}
        <Route
          path="/dashboard-developer/*"
          element={
            <ProtectedRoute allowedRoles={["developer"]}>
              <TaskProvider>
                <DeveloperDashboard />
              </TaskProvider>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard-team-manager/*"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard-hr/*"
          element={
            <ProtectedRoute allowedRoles={["hr"]}>
              <HrDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;