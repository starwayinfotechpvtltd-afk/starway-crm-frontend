// import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
// import axios from "axios";

// const TaskContext = createContext();
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// export const TaskProvider = ({ children }) => {
//   const [projects, setProjects] = useState([]);
//   const [pendingTasks, setPendingTasks] = useState([]);
//   const [completions, setCompletions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const currentUserId = localStorage.getItem("userId");
//   const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

//   const refreshData = useCallback(async (isSilent = false) => {
//     if (!currentUserId) return;
//     if (!isSilent) setLoading(true);

//     try {
//       const r = await axios.get(`${API_BASE}/api/newproject/projects`, { headers: authHeaders() });
      
//       // Safely extract projects whether backend sends an array or an object like { data: [...] }
//       let allProjects = [];
//       if (Array.isArray(r.data)) allProjects = r.data;
//       else if (r.data?.projects) allProjects = r.data.projects;
//       else if (r.data?.data) allProjects = r.data.data;

//       // Bulletproof check for assigned developer
//       const mine = allProjects.filter(p => {
//         const devs = p.assignedDeveloper || [];
//         return devs.some(d => {
//           if (!d) return false;
//           // Handles { id: "123" }, { _id: "123" }, { value: "123" }, or just "123"
//           const devId = typeof d === 'object' ? (d.id || d._id || d.value) : d;
//           return devId?.toString() === currentUserId.toString();
//         });
//       });


//       let tasksResult = [];
//       let completedList = [];

//       await Promise.allSettled(mine.map(async (p) => {
//         const [tRes, cRes] = await Promise.allSettled([
//           axios.get(`${API_BASE}/api/tasks/${p._id}`, { headers: authHeaders() }),
//           axios.get(`${API_BASE}/api/tasks/${p._id}/completions`, { headers: authHeaders() })
//         ]);

//         if (tRes.status === "fulfilled") {
//           const tasks = tRes.value?.data || [];
//           tasks.forEach(t => {
//             const assigneeId = typeof t.assignedTo === 'object' ? (t.assignedTo?.id || t.assignedTo?._id) : t.assignedTo;
//             if (t.status !== "Done" && assigneeId?.toString() === currentUserId.toString()) {
//               tasksResult.push({ ...t, projectId: p._id, projectName: p.projectName, _projectId: p._id, _projectName: p.projectName });
//             }
//           });
//         }

//         if (cRes.status === "fulfilled") {
//           const comps = cRes.value?.data || [];
//           comps.forEach(c => {
//             const compId = typeof c.completedBy === 'object' ? (c.completedBy?.id || c.completedBy?._id) : c.completedBy;
//             if (compId?.toString() === currentUserId.toString()) {
//               completedList.push({ ...c, projectId: p._id, projectName: p.projectName, _projectId: p._id, taskTitle: c.taskTitle || c.title });
//             }
//           });
//         }
//       }));

//       setProjects(mine);
//       setPendingTasks(tasksResult.sort((a, b) => new Date(a.deadline || '2099') - new Date(b.deadline || '2099')));
//       setCompletions(completedList.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)));
//     } catch (err) {
//       console.error("Context Sync Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentUserId]);

//   const completeTask = async (taskId, projectId) => {
//     try {
//       await axios.post(`${API_BASE}/api/tasks/${projectId}/${taskId}/complete`, {}, { headers: authHeaders() });
//       setPendingTasks(prev => prev.filter(t => t._id !== taskId)); // Optimistic UI removal
//       refreshData(true);
//       return true;
//     } catch (err) {
//       console.error("Error completing task:", err);
//       return false;
//     }
//   };

//   const addTaskToState = (newTask, projectId) => {
//     const proj = projects.find(p => p._id === projectId);
//     const normalized = { ...newTask, projectId, _projectId: projectId, projectName: proj?.projectName, _projectName: proj?.projectName };
//     setPendingTasks(prev => [...prev, normalized]);
//     refreshData(true);
//   };

//   useEffect(() => { refreshData(); }, [refreshData]);

//   return (
//     <TaskContext.Provider value={{ projects, pendingTasks, completions, loading, refreshData, completeTask, addTaskToState }}>
//       {children}
//     </TaskContext.Provider>
//   );
// };

// export const useTasks = () => useContext(TaskContext);













import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";

const TaskContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export const TaskProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = localStorage.getItem("userId");
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  const refreshData = useCallback(async (isSilent = false) => {
    if (!currentUserId) return;
    if (!isSilent) setLoading(true);

    try {
      // THE MAGIC FIX: Only ONE network request is made!
      // NOTE: Ensure this matches the route for getDeveloperDashboardData in your backend
      const res = await axios.get(`${API_BASE}/api/reports/dashboard`, { 
        headers: authHeaders() 
      });
      
      const allProjects = res.data.projects || [];
      const allTasks = res.data.tasks || [];
      const allCompletions = res.data.completions || [];

      // Safely filter pending tasks assigned ONLY to this user
      const myPendingTasks = allTasks.filter(t => {
        const assigneeId = typeof t.assignedTo === 'object' ? (t.assignedTo?.id || t.assignedTo?._id) : t.assignedTo;
        return t.status !== "Done" && assigneeId?.toString() === currentUserId.toString();
      });

      // Safely filter completions done ONLY by this user
      const myCompletions = allCompletions.filter(c => {
        const compId = typeof c.completedBy === 'object' ? (c.completedBy?.id || c.completedBy?._id) : c.completedBy;
        return compId?.toString() === currentUserId.toString();
      });

      // Normalize data so both Home.jsx and Projects.jsx can read it perfectly
      const normalizedTasks = myPendingTasks.map(t => ({
        ...t, 
        projectId: t.projectId, 
        _projectId: t.projectId, 
        _projectName: t.projectName
      }));

      const normalizedComps = myCompletions.map(c => ({
        ...c, 
        projectId: c.projectId, 
        _projectId: c.projectId, 
        taskTitle: c.taskTitle || c.title
      }));

      // Set State
      setProjects(allProjects);
      setPendingTasks(normalizedTasks.sort((a, b) => new Date(a.deadline || '2099') - new Date(b.deadline || '2099')));
      setCompletions(normalizedComps.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)));

    } catch (err) {
      console.error("Context Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const completeTask = async (taskId, projectId) => {
    try {
      // Optimistic UI Update: Instantly remove task from screen
      setPendingTasks(prev => prev.filter(t => t._id !== taskId)); 
      
      // Make backend request
      await axios.post(`${API_BASE}/api/tasks/${projectId}/${taskId}/complete`, {}, { headers: authHeaders() });
      
      // Silently refresh data to grab the new Completion History record
      refreshData(true); 
      return true;
    } catch (err) {
      console.error("Error completing task:", err);
      refreshData(true); // Revert UI if API fails
      return false;
    }
  };

  const addTaskToState = (newTask, projectId) => {
    const proj = projects.find(p => p._id === projectId);
    const normalized = { 
      ...newTask, 
      projectId, 
      _projectId: projectId, 
      projectName: proj?.projectName, 
      _projectName: proj?.projectName 
    };
    // Instantly show the new task
    setPendingTasks(prev => [...prev, normalized]);
    refreshData(true); // Silently sync with backend
  };

  useEffect(() => { 
    refreshData(); 
  }, [refreshData]);

  return (
    <TaskContext.Provider value={{ projects, pendingTasks, completions, loading, refreshData, completeTask, addTaskToState }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);