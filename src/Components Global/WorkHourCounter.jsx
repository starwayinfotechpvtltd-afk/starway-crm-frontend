import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import FreeBreakfastOutlinedIcon from "@mui/icons-material/FreeBreakfastOutlined";
import StopOutlinedIcon from "@mui/icons-material/StopOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

const TARGET_LAT = 22.539493;
const TARGET_LNG = 88.377259;
const MAX_RADIUS_METERS = 100; // Strictly 100 meters radius

const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const WorkHourCounter = () => {
  const [attendance, setAttendance] = useState(null);
  const [status, setStatus] = useState("NOT_STARTED"); // NOT_STARTED, WORKING, ON_BREAK, FINISHED
  const [liveWorkTime, setLiveWorkTime] = useState(0);
  const [liveBreakTime, setLiveBreakTime] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, title: "", message: "" });
  const [geoErrorModal, setGeoErrorModal] = useState({ open: false, title: "", message: "", actionToRetry: null });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
  const ROUTE_PREFIX = `${API_BASE}/api/auth`;

  const getAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }), []);

  // Fetch Today's Attendance Status
  const fetchTodayStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${ROUTE_PREFIX}/attendance/today`, getAuthHeaders());
      const record = res.data.attendance;
      if (!record) {
        setStatus("NOT_STARTED");
        setAttendance(null);
        setLiveWorkTime(0);
        setLiveBreakTime(0);
      } else if (record.clockOut) {
        setStatus("FINISHED");
        setAttendance(record);
        setLiveWorkTime(record.totalWorkTime || 0);
        setLiveBreakTime(record.totalBreakTime || 0);
      } else {
        setAttendance(record);
        const isOnBreak = record.breaks && record.breaks.some((b) => !b.end);
        setStatus(isOnBreak ? "ON_BREAK" : "WORKING");
      }
    } catch (error) {
      console.error("Failed to fetch today's attendance status:", error);
    }
  }, [ROUTE_PREFIX, getAuthHeaders]);

  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  // Live Timer Ticker (updating second-by-second)
  useEffect(() => {
    let interval;
    if ((status === "WORKING" || status === "ON_BREAK") && attendance) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        let currentTotalBreak = 0;

        if (attendance.breaks && attendance.breaks.length > 0) {
          attendance.breaks.forEach((b) => {
            if (b.end) {
              currentTotalBreak += new Date(b.end).getTime() - new Date(b.start).getTime();
            } else {
              currentTotalBreak += now - new Date(b.start).getTime();
            }
          });
        }

        const clockInTime = new Date(attendance.clockIn).getTime();
        const totalElapsed = now - clockInTime;
        const currentWorkTime = Math.max(0, totalElapsed - currentTotalBreak);

        setLiveWorkTime(currentWorkTime);
        setLiveBreakTime(currentTotalBreak);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, attendance]);

  // Format MS into HH:MM:SS
  const formatTimeHHMMSS = (ms) => {
    if (!ms || ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Helper promise for getCurrentPosition with fallback options
  const fetchPosition = (options) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  // Detect if running in local development mode
  const IS_DEV = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  // Obtain & Verify Geolocation Strictly within 100 meters
  // In development (localhost), geolocation check is skipped automatically — office coords are used directly.
  // In production (deployed), strict 100m GPS verification is enforced.
  const getVerifiedCoordinates = async () => {
    // ── DEV MODE: skip real GPS check, use office coordinates directly ──
    if (IS_DEV) {
      console.info("[WorkHourCounter] DEV mode detected — geolocation check skipped. Using office coordinates for testing.");
      return { lat: TARGET_LAT, lng: TARGET_LNG };
    }

    // ── PRODUCTION MODE: strict GPS verification ──
    if (!navigator.geolocation) {
      throw {
        title: "Geolocation Unsupported",
        message: "Geolocation is not supported by your browser. Please use a modern browser with GPS/location support.",
      };
    }

    if (window.location.protocol !== "https:") {
      throw {
        title: "Insecure Protocol",
        message: "Geolocation requires HTTPS. Please access the app over a secure HTTPS connection.",
      };
    }

    let position;
    try {
      // 1st Attempt: High Accuracy
      position = await fetchPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
    } catch (err1) {
      try {
        // 2nd Attempt: Standard Accuracy Fallback
        position = await fetchPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
      } catch (err2) {
        const error = err2 || err1;
        const detail = `(Error Code ${error.code}: ${error.message})`;

        if (error.code === 1) {
          throw {
            title: "Location Permission Blocked",
            message: `Location access is denied by your browser or operating system ${detail}.\n\nTo fix this:\n1. Click the 🔒 Lock icon in the browser address bar.\n2. Set 'Location' to 'Allow'.\n3. In Windows: Settings → Privacy & security → Location → Enable 'Location services' and 'Allow desktop apps'.\n4. Refresh the page and try again.`,
          };
        } else if (error.code === 2) {
          throw {
            title: "GPS Location Unavailable",
            message: `Could not determine your GPS location ${detail}.\n\nPlease ensure system location services are active and try again.`,
          };
        } else if (error.code === 3) {
          throw {
            title: "Location Request Timed Out",
            message: `Location detection timed out ${detail}. Please click Retry.`,
          };
        } else {
          throw { title: "Location Error", message: detail };
        }
      }
    }

    const { latitude, longitude } = position.coords;
    const distance = calculateDistanceMeters(latitude, longitude, TARGET_LAT, TARGET_LNG);

    if (distance > MAX_RADIUS_METERS) {
      throw {
        title: "Outside Office Location",
        message: `You are ${Math.round(distance)}m away from the office (${TARGET_LAT}, ${TARGET_LNG}).\n\nAttendance actions require you to be within 100 meters of the office location.`,
      };
    }

    return { lat: latitude, lng: longitude };
  };

  // Open Confirmation Modal
  const requestActionConfirm = (actionType) => {
    const titles = {
      CLOCK_IN: "Confirm Login Shift",
      START_BREAK: "Confirm Start Break",
      END_BREAK: "Confirm End Break",
      CLOCK_OUT: "Confirm Shift Logout",
    };
    const messages = {
      CLOCK_IN: "Are you sure you want to login for today's work shift? This can only be clicked once per day.",
      START_BREAK: "Are you sure you want to start your break?",
      END_BREAK: "Are you sure you want to end your break and return to work?",
      CLOCK_OUT: "Are you sure you want to clock out for the day? Your work session for today will end.",
    };

    setConfirmModal({
      open: true,
      action: actionType,
      title: titles[actionType],
      message: messages[actionType],
    });
  };

  // Execute Action with strict Location Check
  const executeConfirmedAction = async (actionToRun) => {
    const action = actionToRun || confirmModal.action;
    setConfirmModal({ open: false, action: null, title: "", message: "" });
    setGeoErrorModal({ open: false, title: "", message: "", actionToRetry: null });
    setLoading(true);

    try {
      // Strict Location Verification (within 100 meters)
      const coords = await getVerifiedCoordinates();

      // Perform API Call
      if (action === "CLOCK_IN") {
        await axios.post(`${ROUTE_PREFIX}/attendance/clock-in`, { lat: coords.lat, lng: coords.lng }, getAuthHeaders());
      } else if (action === "START_BREAK") {
        await axios.post(`${ROUTE_PREFIX}/attendance/break/start`, { lat: coords.lat, lng: coords.lng }, getAuthHeaders());
      } else if (action === "END_BREAK") {
        await axios.post(`${ROUTE_PREFIX}/attendance/break/end`, { lat: coords.lat, lng: coords.lng }, getAuthHeaders());
      } else if (action === "CLOCK_OUT") {
        await axios.post(`${ROUTE_PREFIX}/attendance/clock-out`, { lat: coords.lat, lng: coords.lng }, getAuthHeaders());
      }

      await fetchTodayStatus();
    } catch (err) {
      console.error("Strict Location Check Error:", err);
      if (err.title && err.message) {
        setGeoErrorModal({
          open: true,
          title: err.title,
          message: err.message,
          actionToRetry: action,
        });
      } else {
        const errMsg = err.response?.data?.message || err.message || "Action failed.";
        setGeoErrorModal({
          open: true,
          title: "Location Check Failed",
          message: errMsg,
          actionToRetry: action,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-nowrap shrink-0 montserrat-regular text-xs">
      
      {/* Realtime Work & Break Timers Compact Badge */}
      {status !== "NOT_STARTED" && (
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 shrink-0 font-mono">
          {/* Work Timer */}
          <div className="flex items-center gap-1">
            <AccessTimeOutlinedIcon className="text-indigo-600 !text-xs shrink-0" />
            <span className="text-[10px] font-sans font-bold text-gray-500 uppercase">Work:</span>
            <span className="text-[11px] font-bold text-indigo-700 tracking-tight">{formatTimeHHMMSS(liveWorkTime)}</span>
          </div>

          <span className="text-gray-300">|</span>

          {/* Break Timer */}
          <div className="flex items-center gap-1">
            <FreeBreakfastOutlinedIcon className="text-amber-600 !text-xs shrink-0" />
            <span className="text-[10px] font-sans font-bold text-gray-500 uppercase">Break:</span>
            <span className="text-[11px] font-bold text-amber-700 tracking-tight">{formatTimeHHMMSS(liveBreakTime)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons (Compact, non-wrapping) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* 1. Login Button (Only once per day) */}
        {status === "NOT_STARTED" && (
          <button
            onClick={() => requestActionConfirm("CLOCK_IN")}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <PlayArrowOutlinedIcon className="!text-sm" />
            <span>Login Shift</span>
          </button>
        )}

        {/* 2. Working State -> Start Break & Clock Out */}
        {status === "WORKING" && (
          <>
            <button
              onClick={() => requestActionConfirm("START_BREAK")}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <FreeBreakfastOutlinedIcon className="!text-sm" />
              <span>Start Break</span>
            </button>

            <button
              onClick={() => requestActionConfirm("CLOCK_OUT")}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <StopOutlinedIcon className="!text-sm" />
              <span>Clock Out</span>
            </button>
          </>
        )}

        {/* 3. On Break State -> Stop Break */}
        {status === "ON_BREAK" && (
          <button
            onClick={() => requestActionConfirm("END_BREAK")}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm animate-pulse disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <PlayArrowOutlinedIcon className="!text-sm" />
            <span>Stop Break</span>
          </button>
        )}

        {/* 4. Finished State */}
        {status === "FINISHED" && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200 whitespace-nowrap">
            <CheckCircleOutlinedIcon className="text-emerald-500 !text-sm" />
            <span>Shift Finished</span>
          </div>
        )}
      </div>

      {/* CONFIRMATION POPUP MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100 border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-50 text-indigo-600 mb-4">
              <LocationOnOutlinedIcon className="!text-2xl" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmModal.title}
            </h3>
            
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              {confirmModal.message}
              <br />
              <span className="text-[11px] text-indigo-600 font-semibold block mt-2">
                📍 Location check (strictly within 100m of 22.539493, 88.377259).
              </span>
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, action: null, title: "", message: "" })}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={() => executeConfirmedAction()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GEOLOCATION / ERROR MODAL WITH INSTRUCTIONS & RETRY */}
      {geoErrorModal.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform transition-all scale-100 border border-red-100">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-50 text-rose-600 mb-4">
              <LocationOnOutlinedIcon className="!text-2xl" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {geoErrorModal.title || "Location Check Failed"}
            </h3>

            <p className="text-xs text-gray-600 mb-6 whitespace-pre-line leading-relaxed text-left bg-gray-50 p-3.5 rounded-xl border border-gray-100 font-sans">
              {geoErrorModal.message}
            </p>

            <div className="flex flex-col gap-2">
              {geoErrorModal.actionToRetry && (
                <button
                  onClick={() => executeConfirmedAction(geoErrorModal.actionToRetry)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshOutlinedIcon className="!text-base" />
                  <span>Retry Location Check</span>
                </button>
              )}

              <button
                onClick={() => setGeoErrorModal({ open: false, title: "", message: "", actionToRetry: null })}
                className="w-full py-2 px-4 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkHourCounter;
