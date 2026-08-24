import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, MapPin, AlertCircle, CheckCircle2, Play, Square, Coffee } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

export default function ClockWidget() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'not_clocked_in' | 'active' | 'on_break' | 'clocked_out'
  const [attendance, setAttendance] = useState(null);
  const [elapsed, setElapsed] = useState(0); // minutes
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  useEffect(() => {
    let interval;
    if (status === 'active' && attendance?.clockIn) {
      const updateElapsed = () => {
        const start = new Date(attendance.clockIn).getTime();
        const now = Date.now();
        const breakMs = (attendance.totalBreakMinutes || 0) * 60 * 1000;
        const diffMs = now - start - breakMs;
        setElapsed(Math.max(0, Math.floor(diffMs / 60000)));
      };
      updateElapsed();
      interval = setInterval(updateElapsed, 30000); // tick every 30s
    }
    return () => clearInterval(interval);
  }, [status, attendance]);


  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(res.data.status);
      setAttendance(res.data.attendance);
      // Seed elapsed from server-computed value
      if (res.data.currentSessionMinutes) {
        setElapsed(res.data.currentSessionMinutes);
      }
    } catch (err) {
      console.error('Failed to fetch attendance status', err);
      setStatus('not_clocked_in');
    }
  };


  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve(pos),
        err => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleAction = async (actionType) => {
    setError(null);
    setLocating(actionType === 'clock-in' || actionType === 'clock-out');
    
    try {
      const token = localStorage.getItem('token');
      let payload = {};

      if (actionType === 'clock-in' || actionType === 'clock-out') {
        try {
          const pos = await getLocation();
          payload = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy
          };
        } catch (err) {
          throw new Error('Location access required. Please enable GPS.');
        }
      }

      let endpoint = '';
      if (actionType === 'clock-in') endpoint = '/api/attendance/clock-in';
      if (actionType === 'clock-out') endpoint = '/api/attendance/clock-out';
      if (actionType === 'start-break') endpoint = '/api/attendance/break/start';
      if (actionType === 'end-break') endpoint = '/api/attendance/break/end';

      const res = await axios.post(`${API_BASE}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Backend returns { message, attendance } — derive status from attendance.status
      const att = res.data.attendance;
      if (att) {
        setAttendance(att);
        if (actionType === 'clock-out') {
          setStatus('clocked_out');
        } else {
          setStatus(att.status || 'not_clocked_in');
        }
      }

      // Notify other open pages (MyAttendancePage, AttendanceHub) to re-fetch
      window.dispatchEvent(new CustomEvent('attendance-updated', { detail: { actionType } }));
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'You are outside the office perimeter.');
      } else {
        setError(err.message || 'Action failed.');
      }
    } finally {
      setLocating(false);
    }
  };

  const formatElapsed = (mins) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#EAE3D6] bg-white text-sm text-slate-500">
        <Clock className="w-4 h-4 animate-pulse" /> Loading...
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-[#EAE3D6] bg-white text-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {status === 'not_clocked_in' && (
            <><span className="w-2 h-2 rounded-full bg-slate-400"></span><span className="font-medium text-slate-700">Not Clocked In</span></>
          )}
          {status === 'active' && (
            <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span className="font-medium text-emerald-700">Working &mdash; {formatElapsed(elapsed)}</span></>
          )}
          {status === 'on_break' && (
            <><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="font-medium text-amber-700">On Break &mdash; {formatElapsed(elapsed)}</span></>
          )}
          {status === 'clocked_out' && (
            <><span className="w-2 h-2 rounded-full bg-slate-400"></span><span className="font-medium text-slate-700">Clocked Out</span></>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="border-l border-slate-200 pl-3">
          {status === 'not_clocked_in' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleAction('clock-in'); }}
              disabled={locating}
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {locating ? <Clock className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4" />} Clock In
            </button>
          )}
          {status === 'active' && (
            <div className="flex gap-2">
               <button 
                onClick={(e) => { e.stopPropagation(); handleAction('start-break'); }}
                className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                <Coffee className="w-4 h-4" /> Break
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleAction('clock-out'); }}
                disabled={locating}
                className="text-slate-600 hover:text-red-600 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {locating ? <Clock className="w-4 h-4 animate-spin"/> : <Square className="w-4 h-4" />} Clock Out
              </button>
            </div>
          )}
          {status === 'on_break' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleAction('end-break'); }}
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <Play className="w-4 h-4" /> End Break
            </button>
          )}
          {status === 'clocked_out' && (
             <span className="text-slate-400 text-xs">Done for today</span>
          )}
        </div>
      </div>
      
      {error && (
        <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-white border border-red-200 rounded-lg shadow-lg text-sm text-red-600 flex items-start gap-2 z-50">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
