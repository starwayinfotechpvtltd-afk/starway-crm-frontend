import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, Clock, Edit, Trash2, Coffee, Moon, Sun, ShieldAlert, CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const DAYS_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ShiftManager() {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    allowedLateMinutes: 15,
    allowedBreakMinutes: 60,
    color: '#2563EB',
  });

  const [userSelect, setUserSelect] = useState('');

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/shifts`, { headers: authHeader() });
      const data = res.data || [];
      setShifts(data);
      if (data.length > 0) {
        setSelectedShift((prev) => {
          if (!prev) return data[0];
          return data.find((s) => s._id === prev._id) || data[0];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/users`, { headers: authHeader() });
      const nonAdmin = (res.data || []).filter((u) => u.role !== 'admin');
      setUsers(nonAdmin);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchUsers();
  }, []);

  const handleSaveShift = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      let updated;
      if (isEditing && selectedShift) {
        const res = await axios.put(`${API_BASE}/api/shifts/${selectedShift._id || selectedShift.id}`, payload, {
          headers: authHeader(),
        });
        updated = res.data;
      } else {
        const res = await axios.post(`${API_BASE}/api/shifts`, payload, { headers: authHeader() });
        updated = res.data;
      }
      setIsEditing(false);
      if (updated) setSelectedShift(updated);
      fetchShifts();
    } catch (err) {
      alert('Failed to save shift.');
    }
  };

  const handleAssign = async () => {
    if (!userSelect || !selectedShift) return;
    try {
      const res = await axios.post(
        `${API_BASE}/api/shifts/${selectedShift._id || selectedShift.id}/assign`,
        { userIds: [userSelect] },
        { headers: authHeader() }
      );
      setUserSelect('');
      if (res.data) setSelectedShift(res.data);
      fetchShifts();
    } catch (err) {
      alert('Failed to assign user');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!selectedShift) return;
    try {
      const res = await axios.delete(
        `${API_BASE}/api/shifts/${selectedShift._id || selectedShift.id}/users/${userId}`,
        { headers: authHeader() }
      );
      if (res.data) setSelectedShift(res.data);
      fetchShifts();
    } catch (err) {
      alert('Failed to remove user from shift.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left Panel - Shift List */}
      <div className="md:col-span-1 bg-white rounded-lg border border-[#EAE3D6] shadow-xs flex flex-col h-[560px]">
        <div className="p-3 border-b border-[#EAE3D6] flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Company Shifts</h2>
          <button
            onClick={() => {
              setIsEditing(true);
              setFormData({
                name: '',
                startTime: '09:00',
                endTime: '18:00',
                workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                allowedLateMinutes: 15,
                allowedBreakMinutes: 60,
                color: '#2563EB',
              });
              setSelectedShift(null);
            }}
            className="px-2 py-1 bg-[#1E40AF] text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-[#1D4ED8]"
          >
            <Plus className="w-3.5 h-3.5" /> New Shift
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {shifts.map((shift) => {
            const isSel = selectedShift?._id === shift._id;
            const isNight = shift.isNightShift || shift.endTime < shift.startTime;
            return (
              <div
                key={shift._id}
                onClick={() => {
                  setSelectedShift(shift);
                  setIsEditing(false);
                }}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isSel ? 'border-[#1E40AF] bg-blue-50/50 shadow-xs' : 'border-[#EAE3D6] bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: shift.color || '#2563EB' }} />
                    <h3 className="font-bold text-xs text-slate-900 truncate">{shift.name}</h3>
                  </div>
                  {isNight ? (
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                      <Moon className="w-2.5 h-2.5" /> Night
                    </span>
                  ) : (
                    <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                      <Sun className="w-2.5 h-2.5" /> Day
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-slate-400" /> {shift.startTime} - {shift.endTime}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-amber-800 font-semibold">
                    <Coffee className="w-2.5 h-2.5" /> {shift.allowedBreakMinutes ?? 60}m Break
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" /> {shift.assignedUsers?.length || 0} members
                  </span>
                </div>
              </div>
            );
          })}

          {shifts.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-400 text-xs">No shifts configured yet.</div>
          )}
        </div>
      </div>

      {/* Right Panel - Details & Edit */}
      <div className="md:col-span-2 bg-white rounded-lg border border-[#EAE3D6] shadow-xs h-[560px] overflow-y-auto">
        {!isEditing && selectedShift ? (
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedShift.color || '#2563EB' }} />
                  {selectedShift.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {selectedShift.startTime} to {selectedShift.endTime} ({selectedShift.isNightShift ? 'Overnight Shift' : 'Standard Day Shift'})
                </p>
              </div>

              <button
                onClick={() => {
                  setFormData({
                    name: selectedShift.name || '',
                    startTime: selectedShift.startTime || '09:00',
                    endTime: selectedShift.endTime || '18:00',
                    workDays: selectedShift.workDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    allowedLateMinutes: selectedShift.allowedLateMinutes || 15,
                    allowedBreakMinutes: selectedShift.allowedBreakMinutes ?? 60,
                    saturdayRule: selectedShift.saturdayRule || 'flexible',
                    color: selectedShift.color || '#2563EB',
                  });
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 border border-[#EAE3D6] text-slate-700 rounded-md flex items-center gap-1 hover:bg-slate-50 text-xs font-bold"
              >
                <Edit className="w-3.5 h-3.5 text-[#1E40AF]" /> Edit Shift
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-[#FAF8F5] rounded border border-[#EAE3D6]">
                <div className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Grace Period</div>
                <div className="font-bold text-slate-900">{selectedShift.allowedLateMinutes || 15} mins</div>
              </div>

              <div className="p-2 bg-[#FAF8F5] rounded border border-[#EAE3D6]">
                <div className="text-[9px] uppercase font-bold text-amber-700 mb-0.5 flex items-center gap-1">
                  <Coffee className="w-2.5 h-2.5" /> Max Break
                </div>
                <div className="font-bold text-amber-950">{selectedShift.allowedBreakMinutes ?? 60} mins</div>
              </div>

              <div className="p-2 bg-[#FAF8F5] rounded border border-[#EAE3D6]">
                <div className="text-[9px] uppercase font-bold text-blue-700 mb-0.5">Work Days</div>
                <div className="font-bold text-slate-900">{selectedShift.workDays?.length || 5} days/wk</div>
              </div>

              <div className="p-2 bg-[#FAF8F5] rounded border border-indigo-100 bg-indigo-50/20">
                <div className="text-[9px] uppercase font-bold text-indigo-700 mb-0.5">Saturday Policy</div>
                <div className="font-bold text-indigo-950 truncate text-[11px]">
                  {selectedShift.saturdayRule === 'alternate_1_3_5' ? 'Alt (1,3,5)' :
                   selectedShift.saturdayRule === 'alternate_2_4' ? 'Alt (2,4)' :
                   selectedShift.saturdayRule === 'all' ? 'Every Sat' :
                   selectedShift.saturdayRule === 'none' ? 'No Sat' : 'Flexible'}
                </div>
              </div>
            </div>

            {/* Work days pills */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Scheduled Work Days</label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS_NAMES.map((d) => {
                  const active = (selectedShift.workDays || []).includes(d);
                  return (
                    <span
                      key={d}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        active ? 'bg-blue-50 text-[#1E40AF] border border-blue-200' : 'bg-slate-50 text-slate-300'
                      }`}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#EAE3D6]" />

            {/* Assigned Users Section */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Assigned Employees ({(selectedShift.assignedUsers || []).length})
              </h3>

              {/* Assign Form */}
              <div className="flex gap-2 mb-3">
                <select
                  value={userSelect}
                  onChange={(e) => setUserSelect(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select employee to assign to this shift...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.username} ({u.designation || u.role})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={!userSelect}
                  className="px-3 py-1.5 bg-[#1E40AF] text-white text-xs font-bold rounded hover:bg-[#1D4ED8] disabled:opacity-50"
                >
                  Assign to Shift
                </button>
              </div>

              {/* User List */}
              <div className="border border-[#EAE3D6] rounded divide-y divide-slate-100 max-h-[160px] overflow-y-auto">
                {(selectedShift.assignedUsers || []).length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">No employees assigned to this shift yet.</div>
                ) : (
                  selectedShift.assignedUsers.map((u) => (
                    <div key={u._id || u} className="p-2 flex justify-between items-center hover:bg-slate-50 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{u.username || u.name || 'Employee'}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({u.designation || u.role || 'Staff'})</span>
                      </div>
                      <button
                        onClick={() => handleRemoveUser(u._id || u)}
                        className="text-rose-500 hover:text-rose-700 p-1 text-[11px] font-bold"
                        title="Remove from shift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : isEditing ? (
          <div className="p-4">
            <h2 className="text-sm font-bold text-slate-900 mb-4">{selectedShift ? 'Edit Shift Settings' : 'Create New Shift'}</h2>
            <form onSubmit={handleSaveShift} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Shift Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  placeholder="e.g. Standard Morning Shift"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Start Time *</label>
                  <input
                    required
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">End Time *</label>
                  <input
                    required
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Grace Late Period (Mins)</label>
                  <input
                    type="number"
                    value={formData.allowedLateMinutes}
                    onChange={(e) => setFormData({ ...formData, allowedLateMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1 flex items-center gap-1">
                    <Coffee className="w-3 h-3" /> Max Break Allowed (Mins) *
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.allowedBreakMinutes}
                    onChange={(e) => setFormData({ ...formData, allowedBreakMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-amber-300 bg-amber-50/20 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                    placeholder="e.g. 60"
                  />
                  <span className="text-[9px] text-slate-400">Taking extra break will flag user in Orange</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Scheduled Work Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_NAMES.map((d) => {
                    const isSelected = formData.workDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          if (isSelected) setFormData({ ...formData, workDays: formData.workDays.filter((x) => x !== d) });
                          else setFormData({ ...formData, workDays: [...formData.workDays, d] });
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-[#1E40AF] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                  Saturday Schedule & Alternate Policy
                </label>
                <select
                  value={formData.saturdayRule || 'flexible'}
                  onChange={(e) => setFormData({ ...formData, saturdayRule: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-blue-200 bg-blue-50/40 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="flexible">🔄 Flexible / Optional (On-time if comes, Off if not)</option>
                  <option value="alternate_1_3_5">📅 Alternate: 1st, 3rd & 5th Sat Working (2nd & 4th OFF)</option>
                  <option value="alternate_2_4">📅 Alternate: 2nd & 4th Sat Working (1st & 3rd OFF)</option>
                  <option value="all">🏢 Every Saturday Working (Mandatory)</option>
                  <option value="none">🏖️ No Saturdays (Mon - Fri Only)</option>
                </select>
                <span className="text-[9px] text-slate-400 mt-0.5 block">
                  You can also click any individual Saturday in the Attendance Calendar to shift/declare it as a Working Day.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (!selectedShift && shifts.length > 0) setSelectedShift(shifts[0]);
                  }}
                  className="px-3 py-1.5 border border-[#EAE3D6] text-slate-600 rounded text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E40AF] text-white rounded text-xs font-bold hover:bg-[#1D4ED8]"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs font-medium">
            Select a shift from the list to view or edit details.
          </div>
        )}
      </div>
    </div>
  );
}
