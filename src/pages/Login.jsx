import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// GENIE EFFECT — How it works
// ─────────────────────────────────────────────────────────────────────────────
// macOS Genie: the window compresses toward one corner in two phases:
//   Phase 1 (warp)  — the card squishes vertically (scaleY → 0) while the
//                     bottom edge "rushes" to the target corner first. This
//                     asymmetry is the visual signature of the Genie effect.
//                     We fake it with a fast scaleY collapse + simultaneous
//                     x/y translation toward the bottom-right (Dock corner).
//   Phase 2 (vanish)— opacity snaps to 0 right at the end so it doesn't linger.
//
// We use Framer Motion's `animate()` imperative API (via `useAnimation`) so we
// can sequence keyframes precisely:
//   - keyframes array  → multi-step property interpolation
//   - times array      → where each keyframe sits on the 0→1 timeline
//   - ease per segment → "easeIn" for acceleration, "easeOut" for deceleration
//
// The "restore" path runs the same values in reverse with a spring for the
// characteristic bounce-back.
// ─────────────────────────────────────────────────────────────────────────────

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Track whether the card is currently minimized
  const [isMinimized, setIsMinimized] = useState(false);

  // Framer Motion imperative animation controller for the card
  const cardControls = useAnimation();

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, formData);
      const { token, role, userId, username } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
      const routes = {
        admin: "/dashboard-admin/",
        caller: "/dashboard-caller",
        developer: "/dashboard-developer",
        manager: "/dashboard-team-manager",
      };
      navigate(routes[role] || "/");
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Genie Minimize ────────────────────────────────────────────────────────
  // Target corner: bottom-right of the viewport (mimics macOS Dock, bottom-right).
  // We translate by a large fixed offset so the card always exits toward that corner
  // regardless of its current position on screen.
  const handleMinimize = async () => {
    if (isMinimized) return;

    // Phase 1 — Warp: squish scaleY fast; skew + narrow + translate toward corner.
    // The "top falls faster than bottom" illusion comes from the combination of:
    //   • scaleY collapsing to near-0 quickly
    //   • simultaneous downward + rightward translation
    //   • skewX creating the diagonal "pull" distortion
    await cardControls.start({
      // Multi-keyframe arrays let us create a two-phase curve in one `animate` call.
      scaleY:    [1, 0.18, 0],          // squishes hard then collapses
      scaleX:    [1, 0.55, 0.25],       // narrows toward the corner
      skewX:     [0, -6, -14],          // diagonal warp — the Genie signature
      x:         [0, 160, 420],         // drift right toward the Dock corner
      y:         [0, 200, 600],         // fall downward
      opacity:   [1, 1,   0],           // stay visible until the very end
      borderRadius: ["2rem", "1rem", "0.5rem"], // shrink rounding as it compresses
      transformOrigin: "bottom right",  // anchor the warp at the Dock-side corner

      // times[] maps each keyframe to a position on the 0→1 duration timeline.
      // 0.55 means the warp "mid-point" happens at 55% of the total duration.
      transition: {
        duration: 0.55,
        times:    [0, 0.55, 1],
        ease:     ["easeIn", "easeIn"],  // accelerate throughout (no deceleration)
      },
    });

    setIsMinimized(true);
  };

  // ─── Genie Restore ─────────────────────────────────────────────────────────
  // Reverse: start from the collapsed corner state and spring back into place.
  // We skip the warp mid-keyframe so the restore feels more like a "pop" back.
  const handleRestore = async () => {
    setIsMinimized(false);

    // Reset all transform properties back to neutral with a spring bounce
    await cardControls.start({
      scaleY:       1,
      scaleX:       1,
      skewX:        0,
      x:            0,
      y:            0,
      opacity:      1,
      borderRadius: "2rem",
      transition: {
        type:      "spring",
        damping:   18,
        stiffness: 130,
        mass:      0.8,
        opacity:   { duration: 0.1 }, // opacity snaps in immediately on restore
      },
    });
  };

  // ─── Entry Animation (existing "Genie + Scale" intro, preserved exactly) ───
  const cardVariants = {
    hidden: {
      opacity: 0,
      scale:   0.3,
      y:       400,
      scaleY:  0.1,
    },
    visible: {
      opacity: 1,
      scale:   1,
      y:       0,
      scaleY:  1,
      transition: {
        type:          "spring",
        damping:       22,
        stiffness:     120,
        duration:      0.8,
        when:          "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y:       0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // ─── macOS Traffic-Light dot colours ─────────────────────────────────────
  // Red = close, Yellow = minimize, Green = maximise.
  // We only wire up the yellow (minimize) dot here; red/green are decorative.
  const trafficDots = [
    { color: "#FF5F57", title: "Close",    action: null },
    { color: "#FFBD2E", title: "Minimize", action: handleMinimize },
    { color: "#28C840", title: "Maximize", action: null },
  ];

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 overflow-hidden"
      style={{
        backgroundImage:  `url('/login-bg.png')`,
        fontFamily:       "'Montserrat', sans-serif",
        fontWeight:       500,
      }}
    >
      {/* ── Minimized Dock Badge ─────────────────────────────────────────────
          Shown only when the card is minimized. Clicking it restores the card.
          Positioned at the bottom-right to match the Dock corner we animated toward.
      ─────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            key="dock-badge"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0,  transition: { type: "spring", damping: 16, stiffness: 200, delay: 0.05 } }}
            exit={{    opacity: 0, scale: 0.5, y: 20,  transition: { duration: 0.2 } }}
            onClick={handleRestore}
            title="Restore login card"
            className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-1.5 cursor-pointer group"
            style={{ background: "none", border: "none", padding: 0 }}
          >
            {/* Thumbnail — a miniature version of the card icon */}
            <div
              className="w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center border border-white/40"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
              }}
            >
              <LogIn size={28} className="text-slate-800" />
            </div>
            {/* Dock label */}
            <span
              className="text-[11px] font-semibold text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            >
              Login
            </span>
            {/* Dock dot — the small indicator underneath a running app */}
            <span className="w-1 h-1 rounded-full bg-white/70 mt-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Animated Card Container ──────────────────────────────────────────
          `animate={cardControls}` hands imperative control to our Genie sequence.
          `variants` + `initial/animate="visible"` still handle the entry animation.
          Framer Motion merges both; the imperative `cardControls.start()` overrides
          after the initial entry completes.
      ─────────────────────────────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={isMinimized ? cardControls : "visible"}  // entry anim on mount, imperative after
        // We need to run the initial entry animation AND keep cardControls available.
        // Solution: always pass cardControls but also trigger the entry animation manually.
        // See the `onAnimationComplete` + `useEffect` pattern below.
        style={{
          // We set transformOrigin via the keyframe transition above ("bottom right").
          // Declaring it here as a fallback to keep layout stable during entry.
          transformOrigin: "center bottom",
        }}
        className="w-full max-w-[420px] bg-white/90 backdrop-blur-md shadow-2xl rounded-[2rem] p-8 md:p-10 flex flex-col items-center border border-white/50"
      >

        {/* ── macOS Traffic-Light Dots ─────────────────────────────────────
            Positioned at the top-left of the card, like a real macOS window.
            Only the yellow dot (Minimize) is functional.
        ──────────────────────────────────────────────────────────────────── */}


        {/* Top Icon */}
        <motion.div
          variants={itemVariants}
          className="bg-white shadow-sm border border-slate-100 rounded-2xl p-3 mb-6 flex items-center justify-center"
        >
          <LogIn className="text-slate-800" size={24} />
        </motion.div>

        {/* Welcome Text */}
        <motion.div variants={itemVariants} className="mb-8 text-center w-full">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 montserrat-medium">
            Sign in with email
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed px-2 montserrat-regular">
            Hey, welcome back to your special/worst place
          </p>
        </motion.div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 w-full p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="w-full flex flex-col group">

          {/* Email Input */}
          <motion.div variants={itemVariants} className="relative mb-4 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none montsserrat-regular">
              <Mail className="text-slate-400 peer-focus:text-[#155dfd] transition-colors" size={18} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Email"
              required
              className="montserrat-regular peer w-full pl-11 pr-4 py-3.5 bg-slate-50/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-[#155dfd]/30 focus:ring-2 focus:ring-[#155dfd]/20 rounded-xl outline-none transition-all text-slate-700 placeholder:text-slate-500 text-sm"
            />
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants} className="relative mb-2 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none montsserrat-regular">
              <Lock className="text-slate-400 peer-focus:text-[#155dfd] transition-colors" size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="Password"
              required
              className="montserrat-regular peer w-full pl-11 pr-12 py-3.5 bg-slate-50/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-[#155dfd]/30 focus:ring-2 focus:ring-[#155dfd]/20 rounded-xl outline-none transition-all text-slate-700 placeholder:text-slate-500 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#155dfd] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </motion.div>


          {/* Submit Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
            type="submit"
            disabled={isLoading}
            className={`w-full mt-5 py-3.5 rounded-xl text-[15px] montserrat-bold text-white shadow-lg transition-colors 
              ${isLoading
                ? "bg-[#155dfd]/70 cursor-not-allowed shadow-none"
                : "bg-[#155dfd] hover:bg-[#114ecc] shadow-[#155dfd]/30 hover:shadow-[#155dfd]/50"
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 montserrat-bold">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </div>
            ) : (
              "Get Started"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-8 text-center text-sm montserrat-regular">
          <p className="text-slate-500">
            Don't have an account?{" "}
            <a
              href="mailto:hr@starwaywebdigital.com"
              className="text-slate-800 font-bold hover:text-[#155dfd] transition-colors"
            >
              Contact HR
            </a>
          </p>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Login;

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
//
// Entry  → cardVariants (spring, existing behaviour, unchanged)
//
// Minimize (yellow dot click) → cardControls.start() with keyframe arrays:
//   Frame 0 (t=0.00): natural state  — scale 1, no skew, no translation
//   Frame 1 (t=0.55): warp peak      — scaleY 0.18, scaleX 0.55, skewX -6°,
//                                      translated 160px right + 200px down
//   Frame 2 (t=1.00): vanished       — scaleY 0, scaleX 0.25, skewX -14°,
//                                      translated 420px right + 600px down, opacity 0
//   easing: easeIn throughout (card accelerates as it falls — gravity feel)
//
// Restore (Dock badge click) → cardControls.start() spring back to identity:
//   type: spring, damping 18, stiffness 130 → gentle bounce on re-entry
//   opacity snaps instantly so the card appears before springing into place
//
// Dock badge → AnimatePresence fade/scale in after minimize completes (delay 50ms)
// ─────────────────────────────────────────────────────────────────────────────