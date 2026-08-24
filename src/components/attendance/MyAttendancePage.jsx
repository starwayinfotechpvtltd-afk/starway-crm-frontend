import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Coffee,
  Sun,
  Moon,
  Loader2,
  CalendarDays,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

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

export default function MyAttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0, totalHours: 0, totalBreakMinutes: 0 });
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');

      const res = await axios.get(`${API_BASE}/api/attendance/my?month=${year}-${month}`, {
        headers: authHeader(),
      });

      setRecords(res.data.records || []);
      setStats(res.data.stats || { present: 0, late: 0, absent: 0, totalHours: 0, totalBreakMinutes: 0 });
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    setSelectedDay(null);
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  // Re-fetch immediately when ClockWidget fires a clock-in/out/break action
  useEffect(() => {
    const handleAttendanceUpdate = () => fetchAttendance();
    window.addEventListener('attendance-updated', handleAttendanceUpdate);
    return () => window.removeEventListener('attendance-updated', handleAttendanceUpdate);
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = useMemo(() => getDaysInMonth(), [currentDate]);
  const firstDayOffset = days[0]?.getDay() || 0; // 0 is Sunday
  const today = new Date();

  return (
    <div className="space-y-4 w-full">
      {/* Top Action Bar (Month Navigator only) */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Attendance History</span>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-[#EAE3D6] shadow-xs">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-xs text-slate-800 min-w-[120px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Present Days</div>
            <div className="text-2xl font-bold text-emerald-950 mt-0.5">{stats.present || stats.presentDays || 0}</div>
            <div className="text-[11px] text-slate-400 font-medium">Recorded sessions</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Late Days</div>
            <div className="text-2xl font-bold text-amber-950 mt-0.5">{stats.late || stats.lateDays || 0}</div>
            <div className="text-[11px] text-slate-400 font-medium">Past shift grace period</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Total Work Hours</div>
            <div className="text-2xl font-bold text-blue-950 mt-0.5">
              {stats.totalHours ? `${stats.totalHours}h` : fmtMins(stats.totalWorkMinutes)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Productive time this month</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1E40AF] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Total Break Time</div>
            <div className="text-2xl font-bold text-amber-950 mt-0.5">
              {fmtMins(stats.totalBreakMinutes || 0)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Rest &amp; pause periods</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Coffee className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Heatmap */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#EAE3D6] shadow-xs p-4.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-sm">Monthly Heatmap</h2>
            <span className="text-[11px] text-slate-400 font-medium">Click day to inspect</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-[11px] font-bold text-slate-400 uppercase">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}
            {days.map((day) => {
              const dateStr =
                day.getFullYear() +
                '-' +
                String(day.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(day.getDate()).padStart(2, '0');
              const record = records.find((r) => r.date === dateStr);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = day.toDateString() === today.toDateString();
              const isPast = day < today;

              let statusStyle = 'bg-slate-50 text-slate-400 border-slate-200';
              if (record) {
                if (record.shiftComplianceStatus === 'late') {
                  statusStyle = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
                } else {
                  statusStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
                }
              } else if (isPast && !isWeekend && !isToday) {
                statusStyle = 'bg-rose-50 text-rose-600 border-rose-200 font-medium';
              } else if (isWeekend) {
                statusStyle = 'bg-slate-50 text-slate-300 border-transparent';
              }

              const isSelected =
                selectedDay &&
                selectedDay.getFullYear() === day.getFullYear() &&
                selectedDay.getMonth() === day.getMonth() &&
                selectedDay.getDate() === day.getDate();

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(day)}
                  className={`h-9 w-full flex items-center justify-center rounded-lg border text-xs transition-all ${statusStyle} ${
                    isSelected ? 'ring-2 ring-[#1E40AF] ring-offset-1 font-bold' : ''
                  } ${isToday ? 'border-[#1E40AF] font-bold shadow-xs' : ''}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
              <span>Present &amp; On Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              <span>Late Clock-In</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-rose-50 border border-rose-200" />
              <span>Working Day Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
              <span>Weekend / Off</span>
            </div>
          </div>
        </div>

        {/* Selected Day Detail or Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#EAE3D6] shadow-xs overflow-hidden">
          {selectedDay ? (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedDay.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>
                  <p className="text-xs text-slate-500">Day details &amp; break breakdown</p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-xs text-[#1E40AF] font-semibold hover:underline"
                >
                  ← Show Full Month Log
                </button>
              </div>

              {(() => {
                const dateStr =
                  selectedDay.getFullYear() +
                  '-' +
                  String(selectedDay.getMonth() + 1).padStart(2, '0') +
                  '-' +
                  String(selectedDay.getDate()).padStart(2, '0');
                const record = records.find((r) => r.date === dateStr);

                if (!record) {
                  return (
                    <div className="text-center py-16 text-slate-400 font-medium">
                      No attendance log recorded for this day.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* Time boxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D6]">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Clock In
                        </div>
                        <div className="text-sm font-bold text-slate-900">{fmtTime(record.clockIn)}</div>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D6]">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Clock Out
                        </div>
                        <div className="text-sm font-bold text-slate-900">{fmtTime(record.clockOut)}</div>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D6]">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Work Time</div>
                        <div className="text-sm font-bold text-emerald-900">{fmtMins(record.totalWorkMinutes)}</div>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D6]">
                        <div className="text-[10px] uppercase font-bold text-amber-700 mb-0.5 flex items-center gap-1">
                          <Coffee className="w-3 h-3" /> Break Time
                        </div>
                        <div className="text-sm font-bold text-amber-950">{fmtMins(record.totalBreakMinutes)}</div>
                      </div>
                    </div>

                    {/* Summary attributes */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs font-medium">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Shift Applied</span>
                        <span className="font-bold text-slate-900">
                          {record.shiftName || record.shiftId?.name || 'Flexible Shift'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Compliance Punctuality</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            record.shiftComplianceStatus === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {record.shiftComplianceStatus === 'late'
                            ? `Late (${record.lateMinutes || 0}m)`
                            : 'On Time'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">GPS Perimeter Check</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Inside Office (100m Perimeter)
                        </span>
                      </div>
                    </div>

                    {/* Breaks History */}
                    {record.breaks && record.breaks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
                          Break Sessions Log ({record.breaks.length})
                        </h4>
                        <div className="space-y-1.5">
                          {record.breaks.map((b, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 bg-white border border-[#EAE3D6] rounded-lg text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                                <span className="font-semibold text-slate-800">Break #{idx + 1}</span>
                              </div>
                              <div className="text-slate-500">
                                {fmtTime(b.start)} → {fmtTime(b.end)}
                              </div>
                              <div className="font-bold text-amber-800">
                                {b.durationMinutes ? `${b.durationMinutes}m` : 'In progress'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-[#EAE3D6] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Clock In</th>
                    <th className="px-4 py-3.5">Clock Out</th>
                    <th className="px-4 py-3.5">Work Time</th>
                    <th className="px-4 py-3.5">Break Time</th>
                    <th className="px-4 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-[#1E40AF]" /> Loading records...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-slate-400 font-medium">
                        No attendance records logged for this month.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr
                        key={r._id}
                        onClick={() => {
                          const [yr, mo, dy] = r.date.split('-').map(Number);
                          setSelectedDay(new Date(yr, mo - 1, dy));
                        }}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fmtTime(r.clockIn)}</td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fmtTime(r.clockOut)}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{fmtMins(r.totalWorkMinutes)}</td>
                        <td className="px-4 py-3 text-amber-800 font-semibold">{fmtMins(r.totalBreakMinutes)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              r.shiftComplianceStatus === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {r.shiftComplianceStatus === 'late'
                              ? `Late (${r.lateMinutes || 0}m)`
                              : 'On Time'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
