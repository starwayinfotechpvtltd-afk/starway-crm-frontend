import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Lock, Mail } from "lucide-react"; // Using lucide-react for icons
import assets from "../assets/assets";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* LEFT SIDE: IMAGE SECTION */}
      <div className="hidden lg:flex lg:w-3/5 relative p-6">
        <div
          className="w-full h-full rounded-3xl bg-cover bg-center overflow-hidden shadow-2xl"
          style={{ backgroundImage: `url('https://i.pinimg.com/1200x/60/2c/f7/602cf78a154b03e968844ed954dd972a.jpg')` }}
        >
          {/* Optional Overlay for style */}
          {/* <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply"></div> */}
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM SECTION */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 bg-white">

        {/* Logo/Brand */}
        {/* <div className="mb-4">
          <img 
            src={assets.logo} 
            alt="Logo" 
            className="h-12 w-auto object-contain" 
          />
        </div> */}

        {/* Welcome Text */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Holla, <br />Welcome Back
          </h1>
          <p className="text-slate-500 font-medium">
            Hey, welcome back to your special/worst place
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded shadow-sm">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <div className="relative group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="stanley@gmail.com"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-400"
              />
              <Mail className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-700 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" />
              <span className="text-slate-600 group-hover:text-slate-800 transition-colors font-medium">Remember me</span>
            </label>
            {/* <a href="#" className="text-slate-400 hover:text-indigo-600 font-medium transition-colors">
              Forgot Password?
            </a> */}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] cursor-pointer
              ${isLoading
                ? "bg-blue-600 "
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-indigo-200 shadow-indigo-100"
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 cursor-pointer">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 font-medium">
            Don't have an account?{" "}
            <a
              href="mailto:hr@starwaywebdigital.com"
              className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
            >
              Contact HR
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;