import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CreditCard,
  Receipt,
  Download,
  Eye,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
  Building,
  Shield,
  HelpCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";
const STARWAY_LOGO_URL = "https://crm.starwaywebdigital.com/assets/starwaylogo-CBhcSc4Y.png";

export default function MyPayrollPortal() {
  const [userData, setUserData] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payslips"); // "payslips" | "structure"

  // Selected Payslip for View / Print
  const [viewingPayslip, setViewingPayslip] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEmployeePayrollData();
  }, []);

  const fetchEmployeePayrollData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const userRes = await axios.get(`${API_BASE}/api/auth/user`, config);
      const user = userRes.data;
      setUserData(user);

      if (user?._id) {
        const payslipRes = await axios.get(
          `${API_BASE}/api/payroll-engine/payslips/employee/${user._id}`,
          config
        );
        setPayslips(payslipRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load employee payroll data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  const baseSalary = Number(userData?.baseSalary || 0);
  const hasStructure = Boolean(userData?.salaryStructureId || baseSalary > 0);
  const latestPayslip = payslips[0]?.record;

  return (
    <div className="space-y-3.5 w-full">

      {/* ── Quick Summary KPI Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Salary</span>
            <div className="text-2xl font-black text-[#1E40AF] mt-1 font-mono">
              {baseSalary > 0 ? `₹${baseSalary.toLocaleString()}` : "Unattached"}
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center">
            <CreditCard size={20} />
          </div>
        </div>

        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Net Take-Home</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              {latestPayslip?.netPay ? `₹${Number(latestPayslip.netPay).toLocaleString()}` : "—"}
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dispatched Statements</span>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {payslips.length} Payslips
            </div>
          </div>
          <div className="w-11 h-11 rounded bg-[#F5EFE6] border border-[#EAE3D6] text-slate-700 flex items-center justify-center">
            <Receipt size={20} />
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("payslips")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
            activeTab === "payslips"
              ? "bg-[#1E40AF] text-white shadow-xs"
              : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          My Payslips ({payslips.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("structure")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
            activeTab === "structure"
              ? "bg-[#1E40AF] text-white shadow-xs"
              : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          Salary Structure Breakdown
        </button>
      </div>

      {/* ── Tab 1: Payslips List ────────────────────────────────────────────── */}
      {activeTab === "payslips" && (
        <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] shadow-xs">
          <div className="ent-card-header flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Monthly Salary Statements
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Gross Earnings</th>
                  <th>Total Deductions</th>
                  <th>Net Take-Home Pay</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">
                      Loading your payslips...
                    </td>
                  </tr>
                ) : payslips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">
                      No salary statements available yet. Once HR finalizes and dispatches your monthly payslip, it will appear here.
                    </td>
                  </tr>
                ) : (
                  payslips.map((p) => (
                    <tr key={p.runId} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td>
                        <div className="font-bold text-slate-900 text-xs">{p.periodLabel}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {p.currency} • {p.record.workingDays || 30} Days Cycle
                        </div>
                      </td>
                      <td className="font-mono font-bold text-slate-800 text-xs">
                        ₹{(p.record.grossPay || 0).toLocaleString()}
                      </td>
                      <td className="font-mono font-bold text-rose-700 text-xs">
                        -₹{(p.record.totalDeductions || 0).toLocaleString()}
                      </td>
                      <td className="font-mono font-black text-emerald-700 text-xs">
                        ₹{(p.record.netPay || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          DISBURSED
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => setViewingPayslip(p)}
                          className="ent-btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1.5"
                        >
                          <Eye size={13} /> View Statement
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 2: Salary Structure Breakdown ────────────────────────────────── */}
      {activeTab === "structure" && (
        <div className="space-y-6">
          {!hasStructure ? (
            <div className="ent-card p-8 bg-white border-[#EAE3D6] shadow-xs text-center space-y-3">
              <Building size={36} className="mx-auto text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">No Payroll Structure Attached</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your employee profile is not currently attached to any salary structure. Once HR assigns a designation salary structure to your account, your full compensation details will be viewable here.
              </p>
            </div>
          ) : (
            <div className="ent-card p-6 bg-white border-[#EAE3D6] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {userData?.username || "Employee"} — Compensation Structure
                  </h3>
                  <p className="text-xs text-slate-500">
                    Role: <strong className="capitalize">{userData?.role || "Staff"}</strong> • Base Rate: ₹{baseSalary.toLocaleString()} / mo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings Table */}
                <div className="border border-[#EAE3D6] rounded overflow-hidden">
                  <div className="bg-[#FAF8F5] p-3 text-xs font-bold text-emerald-900 border-b border-[#EAE3D6] flex items-center justify-between">
                    <span>ALLOWANCES & EARNINGS</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs p-3 space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">Basic Salary</span>
                      <span className="font-mono font-bold text-slate-900">₹{baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">House Rent Allowance (HRA 40%)</span>
                      <span className="font-mono font-bold text-slate-900">₹{(baseSalary * 0.4).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">Special Allowance</span>
                      <span className="font-mono font-bold text-slate-900">₹{(baseSalary * 0.15).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t font-bold text-emerald-900">
                      <span>Estimated Monthly Gross</span>
                      <span className="font-mono">₹{(baseSalary * 1.55).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="border border-[#EAE3D6] rounded overflow-hidden">
                  <div className="bg-[#FAF8F5] p-3 text-xs font-bold text-rose-900 border-b border-[#EAE3D6] flex items-center justify-between">
                    <span>STATUTORY & TAX DEDUCTIONS</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs p-3 space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">Provident Fund (PF 12%)</span>
                      <span className="font-mono font-bold text-rose-700">₹{(baseSalary * 0.12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">Income Tax (TDS)</span>
                      <span className="font-mono font-bold text-rose-700">₹{(baseSalary * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t font-bold text-rose-900">
                      <span>Estimated Deductions</span>
                      <span className="font-mono">-₹{(baseSalary * 0.17).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── View / Print Payslip Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(viewingPayslip)}
        onClose={() => setViewingPayslip(null)}
        title={`Salary Statement — ${viewingPayslip?.periodLabel || ""}`}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setViewingPayslip(null)}
              className="ent-btn-secondary"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintPayslip}
              className="ent-btn-primary"
            >
              <Printer size={14} /> Print / Save as PDF
            </button>
          </>
        }
      >
        {viewingPayslip && (
          <div className="space-y-6 p-4 bg-white border border-[#EAE3D6] rounded text-slate-900">
            {/* Header / Brand */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={STARWAY_LOGO_URL}
                  alt="Starway Logo"
                  className="h-11 object-contain"
                />
                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-900">STARWAY ENTERPRISE INC.</h2>
                  <p className="text-xs text-slate-500 font-medium">Corporate HQ, Innovation District, Tech Hub</p>
                  <p className="text-[11px] text-slate-400 font-mono">Tax / GSTIN: TAX-IN-88920194A</p>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-[#EFF6FF] text-[#2563EB] font-bold text-xs px-2.5 py-1 rounded border border-[#BFDBFE]">
                  {viewingPayslip.periodLabel}
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Status: DISBURSED</p>
              </div>
            </div>

            {/* Employee Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF8F5] p-3 rounded border border-[#EAE3D6]">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Employee Name</span>
                <span className="font-bold text-slate-900">{viewingPayslip.record.username}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Employee ID</span>
                <span className="font-bold text-slate-900 font-mono">{viewingPayslip.record.employeeIdCode || "EMP-001"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Designation</span>
                <span className="font-bold text-slate-900">{viewingPayslip.record.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Bank Account</span>
                <span className="font-bold text-slate-900 font-mono">
                  {viewingPayslip.record.bankDetails?.accountNumber || "**** 4092"}
                </span>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Earnings Table */}
              <div className="border border-[#EAE3D6] rounded overflow-hidden">
                <div className="bg-[#FAF8F5] p-2 text-xs font-bold text-emerald-800 border-b border-[#EAE3D6]">
                  EARNINGS & ALLOWANCES
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    {(viewingPayslip.record.earnings || []).map((e, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-2 text-slate-700">{e.name}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          ₹{Number(e.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50/50 font-bold">
                      <td className="p-2 text-emerald-900">Gross Earnings</td>
                      <td className="p-2 text-right font-mono text-emerald-900 font-black">
                        ₹{Number(viewingPayslip.record.grossPay).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deductions Table */}
              <div className="border border-[#EAE3D6] rounded overflow-hidden">
                <div className="bg-[#FAF8F5] p-2 text-xs font-bold text-rose-800 border-b border-[#EAE3D6]">
                  DEDUCTIONS & TAX
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    {(viewingPayslip.record.deductions || []).map((d, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-2 text-slate-700">{d.name}</td>
                        <td className="p-2 text-right font-mono font-bold text-rose-700">
                          ₹{Number(d.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-rose-50/50 font-bold">
                      <td className="p-2 text-rose-900">Total Deductions</td>
                      <td className="p-2 text-right font-mono text-rose-900 font-black">
                        ₹{Number(viewingPayslip.record.totalDeductions).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Pay Callout */}
            <div className="p-4 bg-[#1E40AF] text-white rounded flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs uppercase font-bold text-blue-200 tracking-wider">Net Take-Home Pay</span>
                <div className="text-xs text-blue-100 mt-0.5">Disbursed via Bank Direct Deposit</div>
              </div>
              <div className="text-2xl font-black font-mono">
                ₹{Number(viewingPayslip.record.netPay).toLocaleString()}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
              This is a computer-generated salary statement from Starway Management. Confidential document for authorized employee.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
