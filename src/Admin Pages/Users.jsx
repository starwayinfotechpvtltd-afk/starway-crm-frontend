import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Search,
  Visibility,
  Edit,
  Delete,
  Save,
  Close,
  FilterList,
} from "@mui/icons-material";

export default function UserTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    role: "",
    joiningDate: "",
  });
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveNote, setLeaveNote] = useState("");
  const [leaveType, setLeaveType] = useState("full");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = (id) => {
    setOpen(true);
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/auth/users/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== deleteId));
      setOpen(false);
      setDeleteId(null);
      setSnackbarMessage("User deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error(
        "Error deleting user:",
        error.response?.data || error.message
      );
      setSnackbarMessage("Failed to delete user.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDeleteId(null);
  };

  const handleEdit = (user) => {
    setEditMode(user._id);
    setEditData({
      username: user.username,
      email: user.email,
      role: user.role,
      joiningDate: user.joiningDate,
    });
  };

  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/auth/users/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, ...editData } : user
        )
      );

      setEditMode(null);
      setSnackbarMessage("User updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message
      );
      setSnackbarMessage("Failed to update user.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter ? user.role === roleFilter : true)
  );

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const fetchLeaveHistory = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/auth/users/${userId}/leave-history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaveHistory(response.data.leaveRecords);
      setLeaveBalance(response.data.leaveBalance);
    } catch (error) {
      console.error("Error fetching leave history:", error);
    }
  };

  const handleSaveLeaveBalance = async () => {
    if (isNaN(leaveBalance)) {
      setSnackbarMessage("Leave balance must be a valid number.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/api/auth/users/${selectedUser._id}/leave-balance`,
        { leaveBalance: parseFloat(leaveBalance) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setSnackbarMessage("Leave balance updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchUsers();
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Failed to update leave balance.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddLeaveRecord = async () => {
    if (!leaveStartDate || !leaveEndDate || !leaveNote) {
      setSnackbarMessage("All fields are required.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const payload = {
        startDate: new Date(leaveStartDate).toISOString().split("T")[0],
        endDate: new Date(leaveEndDate).toISOString().split("T")[0],
        type: leaveType,
        note: leaveNote,
      };

      await axios.post(
        `${API_BASE}/api/auth/users/${selectedUser._id}/leave-records`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setSnackbarMessage("Leave record added successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchLeaveHistory(selectedUser._id);
    } catch (error) {
      console.error(
        "Error adding leave record:",
        error.response?.data || error.message
      );
      setSnackbarMessage("Failed to add leave record.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteLeaveRecord = async (recordId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE}/api/auth/users/${selectedUser._id}/leave-records/${recordId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbarMessage("Leave record deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchLeaveHistory(selectedUser._id);
    } catch (error) {
      console.error(
        "Error deleting leave record:",
        error.response?.data || error.message
      );
      setSnackbarMessage("Failed to delete leave record.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const renderMobileCard = (user, index) => (
    <div key={user._id} className="neu-flat rounded-lg p-5 mb-5 flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-bold text-[#1F2328] mb-1">{user.username}</h3>
        <p className="text-sm font-medium text-[#656D76]">{user.email}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm font-medium text-[#1F2328]">
        <div>
          <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Role</span>
          <span className="neu-pressed-sm rounded-md px-2 py-1 inline-block capitalize">{user.role}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Joined</span>
          <span className="neu-pressed-sm rounded-md px-2 py-1 inline-block">
            {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "N/A"}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Leave Balance</span>
          <span className="neu-pressed-sm rounded-md px-3 py-1 inline-block text-[#0969DA] font-bold">
            {user.leaveBalance}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mt-2 justify-end">
        <button
          type="button"
          className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#656D76]"
          onClick={() => {
            setSelectedUser(user);
            fetchLeaveHistory(user._id);
            setLeaveModalOpen(true);
          }}
        >
          <Visibility fontSize="small" />
        </button>
        <button
          type="button"
          className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#0969DA]"
          onClick={() => handleEdit(user)}
        >
          <Edit fontSize="small" />
        </button>
        <button
          type="button"
          className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#D1242F]"
          onClick={() => handleDelete(user._id)}
        >
          <Delete fontSize="small" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen neu-base p-4 sm:p-6 md:p-8 montserrat-regular text-[#1F2328]">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        
        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-end relative z-10">
          <div className="w-full sm:flex-1">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Search Users</label>
            <div className="flex items-center neu-pressed rounded-md px-3 py-2.5 relative z-10">
              <Search sx={{ color: '#656D76', fontSize: 20 }} className="mr-2 pointer-events-none" />
              <input
                className="w-full bg-transparent outline-none text-sm font-medium text-[#1F2328] relative z-20 cursor-text"
                placeholder="Search by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full sm:w-64 relative z-10">
            <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Filter Role</label>
            <div className="flex items-center neu-pressed rounded-md px-3 py-2.5 relative z-10">
              <FilterList sx={{ color: '#656D76', fontSize: 20 }} className="mr-2 pointer-events-none" />
              <select
                className="w-full bg-transparent outline-none text-sm font-medium text-[#1F2328] cursor-pointer relative z-20"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="caller">Caller</option>
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
                <option value="manager">Team Manager</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Display */}
        {isMobile ? (
          <div>
            {filteredUsers.map((user, index) => renderMobileCard(user, index))}
          </div>
        ) : (
          <div className="neu-flat rounded-lg w-full overflow-hidden p-2 sm:p-4">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">#</th>
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Username</th>
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Email</th>
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Role</th>
                    {!isTablet && <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Joining Date</th>}
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Leave Bal.</th>
                    <th className="p-4 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id} className="border-b border-[#D1DCEB]/30 last:border-0 hover:bg-[#D1DCEB]/10 transition-colors">
                      <td className="p-4 text-sm font-medium text-[#656D76]">{index + 1}</td>
                      <td className="p-4">
                        {editMode === user._id ? (
                          <input
                            className="w-full neu-pressed rounded-md p-2 text-sm font-medium text-[#1F2328] outline-none relative z-20 cursor-text"
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          />
                        ) : (
                          <span className="text-sm font-medium text-[#1F2328]">{user.username}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editMode === user._id ? (
                          <input
                            type="email"
                            className="w-full neu-pressed rounded-md p-2 text-sm font-medium text-[#1F2328] outline-none relative z-20 cursor-text"
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          />
                        ) : (
                          <span className="text-sm font-medium text-[#1F2328]">{user.email}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editMode === user._id ? (
                          <select
                            className="w-full neu-pressed rounded-md p-2 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20"
                            value={editData.role}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                          >
                            <option value="caller">Caller</option>
                            <option value="developer">Developer</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Team Manager</option>
                          </select>
                        ) : (
                          <span className="neu-pressed-sm rounded-md px-2 py-1 text-sm font-medium text-[#1F2328] capitalize">{user.role}</span>
                        )}
                      </td>
                      {!isTablet && (
                        <td className="p-4">
                          {editMode === user._id ? (
                            <input
                              type="date"
                              className="w-full neu-pressed rounded-md p-2 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20"
                              value={editData.joiningDate ? new Date(editData.joiningDate).toISOString().split("T")[0] : ""}
                              onChange={(e) => setEditData({ ...editData, joiningDate: e.target.value })}
                            />
                          ) : user.joiningDate ? (
                            <span className="text-sm font-medium text-[#1F2328]">{new Date(user.joiningDate).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-sm font-medium text-[#656D76]">N/A</span>
                          )}
                        </td>
                      )}
                      <td className="p-4">
                        <span className="neu-pressed-sm rounded-md px-3 py-1 font-bold text-[#0969DA]">{user.leaveBalance}</span>
                      </td>
                      <td className="p-4 text-center">
                        {editMode === user._id ? (
                          <div className="flex items-center justify-center gap-2 relative z-20">
                            <button type="button" className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#1A7F37]" onClick={() => handleSave(user._id)}>
                              <Save fontSize="small" />
                            </button>
                            <button type="button" className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#BF8700]" onClick={() => setEditMode(null)}>
                              <Close fontSize="small" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 relative z-20">
                            <button
                              type="button"
                              className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#656D76]"
                              onClick={() => {
                                setSelectedUser(user);
                                fetchLeaveHistory(user._id);
                                setLeaveModalOpen(true);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </button>
                            <button type="button" className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#0969DA]" onClick={() => handleEdit(user)}>
                              <Edit fontSize="small" />
                            </button>
                            <button type="button" className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#D1242F]" onClick={() => handleDelete(user._id)}>
                              <Delete fontSize="small" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                     <tr>
                       <td colSpan={isTablet ? 6 : 7} className="p-6 text-center text-sm font-medium text-[#656D76]">
                          No users found matching your search.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F0F4F8]/80 backdrop-blur-sm p-4">
          <div className="neu-flat rounded-lg p-6 max-w-sm w-full relative z-[60]">
            <h2 className="text-xl font-bold text-[#1F2328] mb-2">Confirm Delete</h2>
            <p className="text-sm font-medium text-[#656D76] mb-8">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-5 py-2 neu-flat neu-action-btn rounded-lg text-sm font-bold text-[#656D76]"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2 neu-flat neu-action-btn rounded-lg text-sm font-bold text-[#D1242F]"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Management Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F0F4F8]/80 backdrop-blur-sm p-4 montserrat-regular">
          <div className="neu-flat rounded-lg p-5 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative z-[60]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#1F2328]">
                Leave Mgmt: <span className="text-[#0969DA]">{selectedUser?.username}</span>
              </h2>
              <button type="button" className="neu-flat-sm neu-action-btn rounded-md p-1.5 text-[#656D76]" onClick={() => setLeaveModalOpen(false)}>
                <Close fontSize="small" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Leave Balance Section */}
              <div className="neu-pressed rounded-md p-5 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                <div className="flex-1 w-full relative z-10">
                  <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Leave Balance Overview</label>
                  <input
                    type="number"
                    className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none relative z-20 cursor-text"
                    value={leaveBalance}
                    onChange={(e) => setLeaveBalance(parseFloat(e.target.value))}
                  />
                </div>
                <button
                  type="button"
                  className="neu-btn-primary px-6 py-3 rounded-md text-white font-bold text-sm w-full sm:w-auto neu-action-btn"
                  onClick={handleSaveLeaveBalance}
                >
                  Update Balance
                </button>
              </div>

              {/* Leave History Table */}
              <div className="relative z-10">
                <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-2 block">Leave History Log</label>
                <div className="neu-flat rounded-lg overflow-x-auto custom-scrollbar p-2">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr>
                        <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Start Date</th>
                        <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">End Date</th>
                        <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Type</th>
                        <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50">Note</th>
                        <th className="p-3 text-[10px] font-bold text-[#656D76] uppercase tracking-wider border-b border-[#D1DCEB]/50 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveHistory.map((record, index) => (
                        <tr key={index} className="border-b border-[#D1DCEB]/30 last:border-0 hover:bg-[#D1DCEB]/10 transition-colors">
                          <td className="p-3 text-sm font-medium text-[#1F2328]">{new Date(record.startDate).toLocaleDateString()}</td>
                          <td className="p-3 text-sm font-medium text-[#1F2328]">{new Date(record.endDate).toLocaleDateString()}</td>
                          <td className="p-3 text-sm font-medium text-[#1F2328] capitalize">
                            <span className="neu-pressed-sm rounded-md px-2 py-1 inline-block">{record.type}</span>
                          </td>
                          <td className="p-3 text-sm font-medium text-[#1F2328]">{record.note}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              className="neu-flat-sm neu-action-btn rounded-md p-2 text-[#D1242F]"
                              onClick={() => handleDeleteLeaveRecord(record._id)}
                            >
                              <Delete fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {leaveHistory.length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-sm font-medium text-[#656D76]">
                            No leave records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Leave Record Form */}
              <div className="neu-flat rounded-lg p-5 relative z-10">
                <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-4 block">Register New Leave</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Start Date</label>
                    <input
                      type="date"
                      className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20"
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">End Date</label>
                    <input
                      type="date"
                      className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20"
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Note</label>
                    <input
                      type="text"
                      className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none relative z-20 cursor-text"
                      value={leaveNote}
                      onChange={(e) => setLeaveNote(e.target.value)}
                      placeholder="Reason for taking leave..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-[#656D76] uppercase tracking-wider mb-1.5 block">Leave Type</label>
                    <select
                      className="w-full neu-pressed rounded-md p-3 text-sm font-medium text-[#1F2328] outline-none cursor-pointer relative z-20"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                    >
                      <option value="full">Full Day</option>
                      <option value="half">Half Day</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="neu-btn-primary px-6 py-3 rounded-md text-white font-bold text-sm neu-action-btn"
                    onClick={handleAddLeaveRecord}
                  >
                    Add Leave Record
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-[#D1DCEB]/50 pt-5">
              <button
                type="button"
                className="px-6 py-2 neu-flat neu-action-btn rounded-lg text-sm font-bold text-[#656D76]"
                onClick={() => setLeaveModalOpen(false)}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Snackbar */}
      {snackbarOpen && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-4 neu-flat rounded-lg p-4 montserrat-medium">
          <span className={`text-sm font-bold ${snackbarSeverity === 'error' ? 'text-[#D1242F]' : 'text-[#1A7F37]'}`}>
            {snackbarMessage}
          </span>
          <button
            type="button"
            onClick={() => setSnackbarOpen(false)}
            className="neu-flat-sm neu-action-btn rounded-md p-1.5 text-[#656D76]"
          >
            <Close fontSize="small" />
          </button>
        </div>
      )}

      {/* Neumorphic CSS Rules */}
      <style>{`
        :root {
          --neu-bg: #F0F4F8; 
          --neu-light: #FFFFFF;
          --neu-dark: #D1DCEB;
        }
        .neu-base { background-color: var(--neu-bg); }
        .neu-flat {
          background-color: var(--neu-bg);
          box-shadow: 5px 5px 10px var(--neu-dark), -5px -5px 10px var(--neu-light);
        }
        .neu-flat-sm {
          background-color: var(--neu-bg);
          box-shadow: 2px 2px 5px var(--neu-dark), -2px -2px 5px var(--neu-light);
        }
        .neu-pressed {
          background-color: var(--neu-bg);
          box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
        }
        .neu-pressed-sm {
          background-color: var(--neu-bg);
          box-shadow: inset 1.5px 1.5px 3px var(--neu-dark), inset -1.5px -1.5px 3px var(--neu-light);
        }
        
        /* Force Input Clickability and Text Selection globally over any wrapper rules */
        input, textarea, select {
          position: relative;
          z-index: 20;
          pointer-events: auto !important;
          user-select: text !important;
          -webkit-user-select: text !important;
        }
        
        select {
          cursor: pointer !important;
        }

        /* Fixed Interactive Buttons to Ensure Clickability */
        .neu-action-btn { 
          cursor: pointer; 
          transition: all 0.2s ease; 
          position: relative;
          z-index: 20;
          user-select: none;
          -webkit-user-select: none;
        }
        .neu-action-btn:active {
          box-shadow: inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light);
        }
        .neu-btn-primary {
          background-color: #0969DA;
          box-shadow: 3px 3px 8px rgba(9, 105, 218, 0.3);
          border: none;
          position: relative;
          z-index: 20;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }
        .neu-btn-primary:active {
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
        }

        /* Prevent SVG Icons from intercepting parent button clicks */
        button svg {
          pointer-events: none !important;
        }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px var(--neu-bg) inset !important;
          -webkit-text-fill-color: #1F2328 !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--neu-dark); border-radius: 10px; }
      `}</style>
    </div>
  );
}