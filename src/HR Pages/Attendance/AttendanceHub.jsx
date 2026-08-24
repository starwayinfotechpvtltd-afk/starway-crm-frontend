import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Users,
  Clock,
  Settings,
  Calendar,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Edit,
  Coffee,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  RefreshCw,
  MapPin,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  CalendarDays,
  UserCheck,
} from 'lucide-react';
import ShiftManager from './ShiftManager';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

const getTodayStr = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
};

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

const fmtMins = (m) => {
  if (!m && m !== 0) return '0m';
  const h = Math.floor(m / 60);
  const mins = m % 60;
  if (h === 0) return `${mins}m`;
  if (mins === 0) return `${h}h`;
  return `${h}h ${mins}m`;
};

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active: { label: 'Working', dot: 'bg-emerald-500 animate-pulse', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    on_break: { label: 'On Break', dot: 'bg-amber-500 animate-pulse', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    clocked_out: { label: 'Clocked Out', dot: 'bg-slate-400', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    absent: { label: 'Absent', dot: 'bg-rose-400', cls: 'bg-rose-50 text-rose-600 border-rose-200' },
    off_duty: { label: 'Weekend / Off', dot: 'bg-slate-300', cls: 'bg-slate-50 text-slate-400 border-slate-200' },
  };
  const s = map[status] || { label: status, dot: 'bg-slate-400', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Compliance badge ──────────────────────────────────────────────────────────
function ComplianceBadge({ status, lateMinutes }) {
  const map = {
    on_time: { label: 'On Time', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    late: { label: lateMinutes ? `Late (${lateMinutes}m)` : 'Late', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    early_departure: { label: 'Early Exit', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    unassigned: { label: 'Flexible', cls: 'bg-slate-50 text-slate-500 border-slate-200' },
    absent: { label: 'Absent', cls: 'bg-rose-50 text-rose-600 border-rose-200' },
  };
  const s = map[status] || { label: '—', cls: 'bg-slate-100 text-slate-400 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AttendanceHub — Compact Root
// ═══════════════════════════════════════════════════════════════════════════════
export default function AttendanceHub() {
  const [activeTab, setActiveTab] = useState('live');

  const tabs = [
    { id: 'live', label: 'Live Workforce', icon: Users },
    { id: 'records', label: 'Attendance Records', icon: CalendarIcon },
    { id: 'shifts', label: 'Shifts', icon: Clock },
    { id: 'settings', label: 'Office Perimeter', icon: Settings },
  ];

  return (
    <div className="space-y-3.5 w-full">
      {/* Compact Top Navigation Tabs */}
      <div className="flex border-b border-[#EAE3D6] gap-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`pb-2 px-3.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === id
                ? 'border-[#1E40AF] text-[#1E40AF] bg-blue-50/50 rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Main Tab Views */}
      <div>
        {activeTab === 'live' && <LiveBoardTab />}
        {activeTab === 'records' && <RecordsTab />}
        {activeTab === 'shifts' && <ShiftManager />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LiveBoardTab — Compact & Fast
// ═══════════════════════════════════════════════════════════════════════════════
function LiveBoardTab() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchBoard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/attendance/today-board`, { headers: authHeader() });
      setBoard(res.data || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('LiveBoard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
    const iv = setInterval(fetchBoard, 30000);
    return () => clearInterval(iv);
  }, []);

  const departments = useMemo(() => {
    const depts = new Set(board.map((e) => e.user?.department).filter(Boolean));
    return Array.from(depts);
  }, [board]);

  const filteredBoard = useMemo(() => {
    return board.filter((emp) => {
      const name = (emp.user?.username || '').toLowerCase();
      const desig = (emp.user?.designation || '').toLowerCase();
      const dept = (emp.user?.department || '').toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = !q || name.includes(q) || desig.includes(q) || dept.includes(q);
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      const matchesDept = deptFilter === 'all' || emp.user?.department === deptFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [board, search, statusFilter, deptFilter]);

  const counts = useMemo(() => {
    return board.reduce(
      (acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      },
      { active: 0, on_break: 0, clocked_out: 0, absent: 0, off_duty: 0 }
    );
  }, [board]);

  if (loading && board.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#1E40AF]" />
        <span className="text-xs font-medium">Syncing live workforce...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top Quick Status Pill Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-[#EAE3D6] shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
            ● {counts.active || 0} Working
          </span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
            ⏸ {counts.on_break || 0} On Break
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
            ✓ {counts.clocked_out || 0} Clocked Out
          </span>
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
            — {counts.absent || 0} Absent
          </span>
          {counts.off_duty > 0 && (
            <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-md font-medium">
              ☕ {counts.off_duty} Off / Weekend
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Synced: {fmtTime(lastRefreshed)}</span>
          <button
            onClick={fetchBoard}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-[#EAE3D6] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-white border border-[#EAE3D6] rounded-md focus:outline-none font-medium"
        >
          <option value="all">All States</option>
          <option value="active">Working</option>
          <option value="on_break">On Break</option>
          <option value="clocked_out">Clocked Out</option>
          <option value="absent">Absent</option>
        </select>

        {departments.length > 0 && (
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#EAE3D6] rounded-md focus:outline-none font-medium"
          >
            <option value="all">All Depts</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Cards Grid */}
      {filteredBoard.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#EAE3D6] p-4 text-slate-400 text-xs font-medium">
          No employees match the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredBoard.map((emp) => {
            const name = emp.user?.username || 'Unknown';
            const designation = emp.user?.designation || emp.user?.department || 'Staff';
            const initial = name.charAt(0).toUpperCase();
            const shift = emp.shift;
            const isNight = shift?.isNightShift;

            return (
              <div
                key={emp.user?._id}
                className={`bg-white rounded-lg border p-3.5 flex flex-col justify-between transition-all hover:shadow-xs ${
                  emp.status === 'active'
                    ? 'border-emerald-200'
                    : emp.status === 'on_break'
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-[#EAE3D6]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.user?.avatar ? (
                          <img src={emp.user.avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{designation}</p>
                      </div>
                    </div>
                    <StatusBadge status={emp.status} />
                  </div>

                  {/* Work & Break Metric Box */}
                  <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-2 rounded border border-[#EAE3D6] mb-2 text-xs">
                    <div className={`p-1.5 rounded ${emp.isUnderWorkHours ? 'bg-rose-50 border border-rose-200' : ''}`}>
                      <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Work Time</div>
                      <div className={`font-bold text-xs ${emp.isUnderWorkHours ? 'text-rose-700 font-extrabold' : 'text-slate-900'}`}>
                        {fmtMins(emp.totalWorkMinutes)}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {emp.isUnderWorkHours ? (
                          <span className="text-rose-600 font-bold">🛑 Short -{fmtMins(emp.underWorkMinutes)}</span>
                        ) : emp.clockIn ? (
                          `In ${fmtTime(emp.clockIn)}`
                        ) : (
                          'Not in'
                        )}
                      </div>
                    </div>

                    <div className={`border-l border-[#EAE3D6] pl-2 p-1.5 rounded ${emp.isExcessBreak ? 'bg-amber-50 border border-amber-300' : ''}`}>
                      <div className="text-[9px] uppercase tracking-wider font-bold text-amber-700 flex items-center gap-1">
                        <Coffee className="w-2.5 h-2.5" /> Break
                      </div>
                      <div className={`font-bold text-xs ${emp.isExcessBreak ? 'text-amber-900 font-extrabold' : 'text-amber-950'}`}>
                        {fmtMins(emp.totalBreakMinutes)}
                      </div>
                      <div className="text-[9px]">
                        {emp.isExcessBreak ? (
                          <span className="text-amber-800 font-bold">⚠️ +{emp.excessBreakMinutes}m Over limit</span>
                        ) : (
                          <span className="text-slate-400">{emp.breakCount} break{emp.breakCount === 1 ? '' : 's'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Shift & Compliance */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    {shift ? (
                      <span className="font-semibold text-blue-700 inline-flex items-center gap-0.5">
                        {isNight ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                        {shift.name} ({shift.allowedBreakMinutes || 60}m brk)
                      </span>
                    ) : (
                      <span className="text-slate-400">No shift</span>
                    )}
                  </div>

                  <ComplianceBadge status={emp.attendance?.shiftComplianceStatus || 'unassigned'} lateMinutes={emp.attendance?.lateMinutes} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RecordsTab — Today Default + Date Period + User Filter + Calendar View
// ═══════════════════════════════════════════════════════════════════════════════
function RecordsTab() {
  const todayStr = getTodayStr();

  // Filters State — DEFAULT TO TODAY ONLY
  const [filterMode, setFilterMode] = useState('single'); // 'single' | 'range' | 'month' | 'all'
  const [filters, setFilters] = useState({
    date: todayStr, // Default: TODAY
    startDate: '',
    endDate: '',
    month: '',
    userId: '',
    status: '',
  });

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'calendar'
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar view month state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  // Override Modal
  const [overrideModal, setOverrideModal] = useState(null);
  const [overrideForm, setOverrideForm] = useState({ clockIn: '', clockOut: '', notes: '' });
  const [saving, setSaving] = useState(false);

  // Fetch Users for Dropdown
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/auth/users`, { headers: authHeader() })
      .then((res) => {
        const nonAdmin = (res.data || []).filter((u) => u.role !== 'admin');
        setUsers(nonAdmin);
      })
      .catch(console.error);
  }, []);

  // Fetch Records based on current filters
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterMode === 'single' && filters.date) {
        params.set('date', filters.date);
      } else if (filterMode === 'range') {
        if (filters.startDate) params.set('startDate', filters.startDate);
        if (filters.endDate) params.set('endDate', filters.endDate);
      } else if (filterMode === 'month' && filters.month) {
        params.set('month', filters.month);
      }

      if (filters.userId) params.set('userId', filters.userId);
      if (filters.status) params.set('status', filters.status);

      const res = await axios.get(`${API_BASE}/api/attendance/all?${params}`, { headers: authHeader() });
      setRecords(res.data.records || []);
    } catch (err) {
      console.error('Records fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filterMode, filters.date, filters.startDate, filters.endDate, filters.month, filters.userId, filters.status]);

  // Quick Date Presets
  const setQuickDate = (preset) => {
    const now = new Date();
    if (preset === 'today') {
      setFilterMode('single');
      setFilters((prev) => ({ ...prev, date: getTodayStr(), startDate: '', endDate: '', month: '' }));
    } else if (preset === 'yesterday') {
      const y = new Date(now.setDate(now.getDate() - 1));
      const yStr = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
      setFilterMode('single');
      setFilters((prev) => ({ ...prev, date: yStr, startDate: '', endDate: '', month: '' }));
    } else if (preset === 'month') {
      const mStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      setFilterMode('month');
      setFilters((prev) => ({ ...prev, date: '', startDate: '', endDate: '', month: mStr }));
    } else if (preset === 'all') {
      setFilterMode('all');
      setFilters((prev) => ({ ...prev, date: '', startDate: '', endDate: '', month: '' }));
    }
  };

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const date = new Date(year, month, 1);
    const dList = [];
    while (date.getMonth() === month) {
      dList.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return dList;
  }, [calendarMonth]);

  const firstDayOffset = calendarDays[0]?.getDay() || 0;

  // Group records by date for calendar view
  const recordsByDate = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [records]);

  const openOverride = (r) => {
    const toLocal = (d) =>
      d ? new Date(new Date(d) - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
    setOverrideForm({
      clockIn: toLocal(r.clockIn),
      clockOut: toLocal(r.clockOut),
      notes: r.overrideNotes || '',
    });
    setOverrideModal(r);
  };

  const saveOverride = async () => {
    if (!overrideModal) return;
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/api/attendance/${overrideModal._id}/override`, overrideForm, {
        headers: authHeader(),
      });
      setOverrideModal(null);
      fetchRecords();
    } catch (err) {
      alert('Failed to save override.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Filter & View Bar */}
      <div className="bg-white rounded-lg border border-[#EAE3D6] p-3 shadow-xs space-y-2.5">
        {/* Row 1: Quick Presets + View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Period:</span>
            <button
              onClick={() => setQuickDate('today')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                filterMode === 'single' && filters.date === todayStr
                  ? 'bg-[#1E40AF] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setQuickDate('yesterday')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                filterMode === 'single' && filters.date !== todayStr && filters.date
                  ? 'bg-[#1E40AF] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Specific Date
            </button>
            <button
              onClick={() => setFilterMode('range')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                filterMode === 'range' ? 'bg-[#1E40AF] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Date Range
            </button>
            <button
              onClick={() => setQuickDate('month')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                filterMode === 'month' ? 'bg-[#1E40AF] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Entire Month
            </button>
            <button
              onClick={() => setQuickDate('all')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                filterMode === 'all' ? 'bg-[#1E40AF] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Records
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => {
                setViewMode('calendar');
                if (filterMode === 'single') setQuickDate('month');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
        </div>

        {/* Row 2: Inputs for Date Range / Single Date + User Dropdown */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {filterMode === 'single' && (
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">Date:</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="px-2.5 py-1 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {filterMode === 'range' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">From:</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="px-2.5 py-1 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <label className="text-[11px] font-bold text-slate-500">To:</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="px-2.5 py-1 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {filterMode === 'month' && (
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">Month:</label>
              <input
                type="month"
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="px-2.5 py-1 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* User-Wise Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-bold text-slate-500">Employee:</label>
            <select
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="px-2.5 py-1 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px]"
            >
              <option value="">All Employees</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.username} ({u.designation || u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-bold text-slate-500">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-2.5 py-1 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Working</option>
              <option value="on_break">On Break</option>
              <option value="clocked_out">Clocked Out</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-400 font-medium ml-auto">
            {records.length} record{records.length === 1 ? '' : 's'} loaded
          </span>
        </div>
      </div>

      {/* ── Table View ──────────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-[#EAE3D6] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-[#EAE3D6] uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-3.5 py-2.5">Date</th>
                  <th className="px-3.5 py-2.5">Staff Member</th>
                  <th className="px-3.5 py-2.5">Dept</th>
                  <th className="px-3.5 py-2.5">Clock In</th>
                  <th className="px-3.5 py-2.5">Clock Out</th>
                  <th className="px-3.5 py-2.5">Work Time</th>
                  <th className="px-3.5 py-2.5">Break</th>
                  <th className="px-3.5 py-2.5">Shift</th>
                  <th className="px-3.5 py-2.5">Compliance</th>
                  <th className="px-3.5 py-2.5 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2 text-[#1E40AF]" /> Loading records...
                    </td>
                  </tr>
                )}
                {!loading && records.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-slate-400 font-medium">
                      No records found for the selected filter.
                    </td>
                  </tr>
                )}
                {!loading &&
                  records.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3.5 py-2.5 font-bold text-slate-800 whitespace-nowrap">{r.date}</td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-bold text-slate-900">{r.user?.username || '—'}</div>
                        <div className="text-[10px] text-slate-400">{r.user?.designation || ''}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-500">{r.user?.department || '—'}</td>
                      <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap font-medium">{fmtTime(r.clockIn)}</td>
                      <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap font-medium">{fmtTime(r.clockOut)}</td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col items-start gap-0.5">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1 text-xs ${
                              r.isUnderWorkHours
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 font-extrabold'
                                : r.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : r.status === 'on_break'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'text-slate-900 bg-slate-100'
                            }`}
                          >
                            {(r.status === 'active' || r.status === 'on_break') && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                            {fmtMins(r.totalWorkMinutes)}
                          </span>
                          {r.isUnderWorkHours && (
                            <span className="text-[9px] font-bold text-rose-600">
                              🛑 -{fmtMins(r.underWorkMinutes)} short
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col items-start gap-0.5">
                          <span
                            className={`font-semibold px-1.5 py-0.5 rounded text-xs inline-flex items-center gap-1 ${
                              r.isExcessBreak
                                ? 'bg-amber-100 text-amber-900 border border-amber-400 font-bold'
                                : 'text-amber-800'
                            }`}
                          >
                            {fmtMins(r.totalBreakMinutes)}
                            {r.breaks?.length > 0 && <span className="text-[10px] text-slate-400 ml-0.5">({r.breaks.length})</span>}
                          </span>
                          {r.isExcessBreak && (
                            <span className="text-[9px] font-bold text-amber-800">
                              ⚠️ +{r.excessBreakMinutes}m excess
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-500 font-medium">
                        {r.shiftName || r.shiftId?.name ? (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-semibold">
                            {r.shiftName || r.shiftId?.name}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <ComplianceBadge status={r.shiftComplianceStatus} lateMinutes={r.lateMinutes} />
                        {r.manualOverride && <span className="block text-[8px] font-bold text-purple-600">Overridden</span>}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          onClick={() => openOverride(r)}
                          className="p-1 text-[#1E40AF] hover:bg-blue-50 rounded transition-colors"
                          title="Override record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Calendar View ───────────────────────────────────────────────────── */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#EAE3D6] p-4 shadow-xs">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                  }
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-xs text-slate-800 min-w-[120px] text-center">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() =>
                    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                  }
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">Click any date to view day logs</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-[10px] font-bold text-slate-400 uppercase">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 rounded border border-transparent" />
              ))}

              {calendarDays.map((day) => {
                const dateStr =
                  day.getFullYear() +
                  '-' +
                  String(day.getMonth() + 1).padStart(2, '0') +
                  '-' +
                  String(day.getDate()).padStart(2, '0');
                const dayRecords = recordsByDate[dateStr] || [];
                const isSelected = selectedCalendarDay === dateStr;
                const isToday = dateStr === todayStr;
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedCalendarDay(dateStr)}
                    className={`h-16 p-1.5 rounded border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#1E40AF] ring-1 ring-[#1E40AF] bg-blue-50/40'
                        : isToday
                        ? 'border-blue-400 bg-white'
                        : isWeekend
                        ? 'border-slate-100 bg-slate-50/50'
                        : 'border-[#EAE3D6] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[11px] font-bold ${isToday ? 'text-[#1E40AF]' : 'text-slate-700'}`}>
                        {day.getDate()}
                      </span>
                      {dayRecords.length > 0 && (
                        <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded">
                          {dayRecords.length}
                        </span>
                      )}
                    </div>

                    <div className="text-[9px] truncate">
                      {dayRecords.length > 0 ? (
                        <span className="text-slate-600 font-semibold">
                          {fmtMins(dayRecords.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0))}
                        </span>
                      ) : isWeekend ? (
                        <span className="text-slate-300">Off</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Day Inspect Panel */}
          <div className="bg-white rounded-lg border border-[#EAE3D6] p-4 shadow-xs">
            <h4 className="font-bold text-slate-800 text-xs mb-1">
              {selectedCalendarDay ? `Logs for ${selectedCalendarDay}` : "Select a day to inspect"}
            </h4>
            <p className="text-[10px] text-slate-400 mb-3">
              {selectedCalendarDay ? `${recordsByDate[selectedCalendarDay]?.length || 0} employee logs` : "Click any cell on the calendar"}
            </p>

            {selectedCalendarDay && (recordsByDate[selectedCalendarDay] || []).length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No attendance logs found on this date.
              </div>
            )}

            {selectedCalendarDay && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {(recordsByDate[selectedCalendarDay] || []).map((r) => (
                  <div key={r._id} className="p-2.5 bg-[#FAF8F5] rounded border border-[#EAE3D6] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{r.user?.username}</span>
                      <ComplianceBadge status={r.shiftComplianceStatus} lateMinutes={r.lateMinutes} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>In: {fmtTime(r.clockIn)}</span>
                      <span>Out: {fmtTime(r.clockOut)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                      <span>Work: {fmtMins(r.totalWorkMinutes)}</span>
                      <span className="text-amber-800">Break: {fmtMins(r.totalBreakMinutes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#EAE3D6] shadow-2xl w-full max-w-md p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Manual Override</h3>
            <p className="text-xs text-slate-500 mb-3">
              Record for <span className="font-bold text-slate-800">{overrideModal.user?.username}</span> on {overrideModal.date}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Clock-In Time</label>
                <input
                  type="datetime-local"
                  value={overrideForm.clockIn}
                  onChange={(e) => setOverrideForm({ ...overrideForm, clockIn: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Clock-Out Time</label>
                <input
                  type="datetime-local"
                  value={overrideForm.clockOut}
                  onChange={(e) => setOverrideForm({ ...overrideForm, clockOut: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Override Reason</label>
                <textarea
                  rows={2}
                  placeholder="e.g. GPS error or manual clock adjustment..."
                  value={overrideForm.notes}
                  onChange={(e) => setOverrideForm({ ...overrideForm, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOverrideModal(null)}
                className="px-3 py-1.5 border border-[#EAE3D6] rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={saveOverride}
                disabled={saving}
                className="px-4 py-1.5 bg-[#1E40AF] text-white rounded text-xs font-bold hover:bg-[#1D4ED8] disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SettingsTab — Clean & Compact
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsTab() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/attendance/config`, { headers: authHeader() })
      .then((res) => setConfig(res.data))
      .catch(console.error);
  }, []);

  const office = config?.offices?.[0] || {};

  const setOfficeField = (field, value) => {
    setConfig((prev) => {
      const offices = [...(prev.offices || [])];
      offices[0] = { ...offices[0], [field]: value };
      return { ...prev, offices };
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/api/attendance/config`,
        { offices: config.offices, blockClockInOnFail: config.blockClockInOnFail },
        { headers: authHeader() }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#1E40AF]" />
        <span className="text-xs font-medium">Loading parameters...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* GPS Settings Card */}
      <div className="bg-white rounded-lg border border-[#EAE3D6] p-4 shadow-xs">
        <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mb-3">
          <MapPin className="w-4 h-4 text-[#1E40AF]" />
          Office GPS Perimeter Settings
        </div>

        <form onSubmit={save} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Facility Name</label>
            <input
              type="text"
              value={office.name || ''}
              onChange={(e) => setOfficeField('name', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Latitude</label>
              <input
                type="number"
                step="any"
                value={office.latitude || ''}
                onChange={(e) => setOfficeField('latitude', parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Longitude</label>
              <input
                type="number"
                step="any"
                value={office.longitude || ''}
                onChange={(e) => setOfficeField('longitude', parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-[#EAE3D6] rounded text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase">Geofence Radius</label>
              <span className="text-xs font-bold text-[#1E40AF] font-mono">{office.radiusMeters || 100}m</span>
            </div>
            <input
              type="range"
              min={25}
              max={500}
              step={5}
              value={office.radiusMeters || 100}
              onChange={(e) => setOfficeField('radiusMeters', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#1E40AF]"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="blockOutside"
                checked={config.blockClockInOnFail ?? true}
                onChange={(e) => setConfig({ ...config, blockClockInOnFail: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#1E40AF] focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-800">
                Block clock-in when outside {office.radiusMeters || 100}m perimeter
              </span>
            </label>
          </div>

          <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#1E40AF] text-white rounded text-xs font-bold hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              Save GPS Settings
            </button>
            {saved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Saturday Working Schedule & Shifted Saturdays Card */}
      <SaturdayOverridesManager config={config} setConfig={setConfig} />
    </div>
  );
}

function SaturdayOverridesManager({ config, setConfig }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [selectedSat, setSelectedSat] = useState(null);

  // Generate all Saturdays in selectedMonth
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr); // 1-indexed

  const saturdays = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    if (d.getDay() === 6) { // Saturday
      const satIndex = Math.ceil(day / 7);
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const override = (config?.workingSaturdayOverrides || []).find((o) => o.date === dateStr);
      saturdays.push({
        date: dateStr,
        day,
        satIndex,
        ordinal: satIndex === 1 ? '1st' : satIndex === 2 ? '2nd' : satIndex === 3 ? '3rd' : satIndex === 4 ? '4th' : '5th',
        override,
      });
    }
  }

  const handleToggle = async (dateStr, isWorking, note = '') => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/attendance/saturday-override`,
        { date: dateStr, isWorking, note },
        { headers: authHeader() }
      );
      setConfig((prev) => ({ ...prev, workingSaturdayOverrides: res.data.overrides }));
      setSelectedSat(null);
    } catch {
      alert('Failed to update Saturday override');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOverride = async (dateStr) => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${API_BASE}/api/attendance/saturday-override/${dateStr}`,
        { headers: authHeader() }
      );
      setConfig((prev) => ({ ...prev, workingSaturdayOverrides: res.data.overrides }));
      setSelectedSat(null);
    } catch {
      alert('Failed to remove Saturday override');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#EAE3D6] p-4 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
            <Calendar className="w-4 h-4 text-blue-700" />
            Saturday Schedule & Shifted Days
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2 py-1 border border-[#EAE3D6] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <p className="text-[11px] text-slate-500 mb-3">
          Handle alternate or shifted Saturdays. Declare any specific Saturday as an active working day or holiday.
        </p>

        <div className="space-y-2">
          {saturdays.map((sat) => {
            const hasOverride = !!sat.override;
            const isWorking = hasOverride ? sat.override.isWorking : (sat.satIndex === 1 || sat.satIndex === 3 || sat.satIndex === 5);

            return (
              <div
                key={sat.date}
                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all ${
                  hasOverride
                    ? isWorking
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-slate-300 bg-slate-50'
                    : 'border-[#EAE3D6] bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {sat.ordinal} Saturday ({sat.date})
                    </span>
                    {hasOverride ? (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isWorking ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isWorking ? '🟢 Shifted Working Day' : '🏖️ Declared Off'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Shift Default (Alt / Flexible)
                      </span>
                    )}
                  </div>
                  {sat.override?.note && (
                    <div className="text-[10px] text-slate-500 mt-0.5 italic font-medium">
                      Note: {sat.override.note}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggle(sat.date, true, 'Shifted Working Saturday')}
                    disabled={loading}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                      hasOverride && isWorking
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title="Mark as Working Day"
                  >
                    Working
                  </button>

                  <button
                    onClick={() => handleToggle(sat.date, false, 'Declared Saturday Holiday')}
                    disabled={loading}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                      hasOverride && !isWorking
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Mark as Off / Holiday"
                  >
                    Off
                  </button>

                  {hasOverride && (
                    <button
                      onClick={() => handleRemoveOverride(sat.date)}
                      disabled={loading}
                      className="px-1.5 py-1 text-slate-400 hover:text-rose-600 text-[10px] font-bold"
                      title="Reset to Shift Default"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>💡 Employees clocking in on any Saturday always get full productive work hour credit.</span>
      </div>
    </div>
  );
}
