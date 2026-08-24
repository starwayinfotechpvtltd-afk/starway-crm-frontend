import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  CreditCard,
  Receipt,
  Settings,
  Plus,
  Play,
  CheckCircle2,
  Lock,
  DollarSign,
  AlertTriangle,
  FileText,
  Sliders,
  TrendingUp,
  Shield,
  Layers,
  History,
  Eye,
  Edit,
  Trash2,
  Download,
  Printer,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Info,
  Calendar,
  Check,
  X,
  Clock,
  Send,
  Calculator,
  Percent,
  Sigma,
  Palette,
  CheckSquare,
  HelpCircle,
  Briefcase,
  UserCheck,
  Award,
  Users,
  FileSpreadsheet,
  Building,
  QrCode,
  Stamp,
  UserMinus,
  Filter,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const THEMES = [
  { id: "modern_blue", name: "Corporate Sapphire", primary: "#1E40AF", secondary: "#EFF6FF", border: "#BFDBFE" },
  { id: "corporate_classic", name: "Enterprise Slate", primary: "#0F172A", secondary: "#F8FAFC", border: "#E2E8F0" },
  { id: "executive_navy", name: "Executive Navy", primary: "#1E3A8A", secondary: "#F0FDF4", border: "#BBF7D0" },
  { id: "emerald_clean", name: "Emerald Forest", primary: "#065F46", secondary: "#ECFDF5", border: "#A7F3D0" },
];

export default function PayrollHub() {
  const [activeTab, setActiveTab] = useState("runs"); // "runs" | "structures" | "components" | "config" | "designer" | "claims_loans" | "audit"
  const [loading, setLoading] = useState(true);

  // 1. Payroll Run State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentRun, setCurrentRun] = useState(null);
  const [allRuns, setAllRuns] = useState([]);
  const [teams, setTeams] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [stageLoading, setStageLoading] = useState(false);

  // 2. Adjust Employee Line Items Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [adjustForm, setAdjustForm] = useState({
    baseSalary: 0,
    overtimeHours: 0,
    bonusAmount: 0,
    commissionAmount: 0,
    monthlyAdjustments: [],
    notes: "",
  });
  const [savingAdjust, setSavingAdjust] = useState(false);

  // 3. Dispatch Payslips Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchMode, setDispatchMode] = useState("all"); // "all" | "team" | "individual"
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedIndividualIds, setSelectedIndividualIds] = useState([]);
  const [excludedEmployeeIds, setExcludedEmployeeIds] = useState([]);
  const [forceResend, setForceResend] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  // 4. Structure Builder & Live Simulator State
  const [structures, setStructures] = useState([]);
  const [isCreateStructModalOpen, setIsCreateStructModalOpen] = useState(false);
  const [activeStructureEditing, setActiveStructureEditing] = useState(null);
  const [simulatorBaseRate, setSimulatorBaseRate] = useState(50000);
  const [savingStructure, setSavingStructure] = useState(false);

  // 5. Component Catalog State
  const [components, setComponents] = useState([]);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compForm, setCompForm] = useState({
    name: "",
    code: "",
    type: "earning",
    calculationType: "fixed_amount",
    calculationBase: "none",
    baseComponentCode: "BASIC",
    value: 0,
    formulaExpression: "",
    isTaxable: true,
    isRecurring: true,
  });

  // 6. Organization Rules State
  const [payrollConfig, setPayrollConfig] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);

  // 7. Visual Payslip Designer State
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // 8. Claims, Loans & Audit State
  const [reimbursements, setReimbursements] = useState([]);
  const [loans, setLoans] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Inspection Modal
  const [viewingRecord, setViewingRecord] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");
  const authHeader = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => {
    fetchAllPayrollData();
  }, []);

  const fetchAllPayrollData = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/payroll-engine/seed-defaults`, {}, authHeader);

      const [runsRes, compRes, structRes, configRes, tmplRes, claimsRes, loansRes, auditRes, teamsRes, usersRes] =
        await Promise.allSettled([
          axios.get(`${API_BASE}/api/payroll-engine/runs`, authHeader),
          axios.get(`${API_BASE}/api/payroll-engine/components`, authHeader),
          axios.get(`${API_BASE}/api/payroll-engine/structures`, authHeader),
          axios.get(`${API_BASE}/api/payroll-engine/config`, authHeader),
          axios.get(`${API_BASE}/api/payroll-engine/payslip-templates`, authHeader),
          axios.get(`${API_BASE}/api/payroll-engine/reimbursements`, authHeader),
          axios.get(`${API_BASE}/api/payroll-engine/loans`, authHeader),
          axios.get(`${API_BASE}/api/payroll-engine/audit-logs`, authHeader),
          axios.get(`${API_BASE}/api/teams`, authHeader),
          axios.get(`${API_BASE}/api/auth/users`, authHeader),
        ]);

      if (runsRes.status === "fulfilled") {
        setAllRuns(runsRes.value.data || []);
        if (runsRes.value.data?.length > 0) setCurrentRun(runsRes.value.data[0]);
      }
      if (compRes.status === "fulfilled") setComponents(compRes.value.data || []);
      if (structRes.status === "fulfilled") {
        setStructures(structRes.value.data || []);
        if (structRes.value.data?.length > 0) {
          setActiveStructureEditing(JSON.parse(JSON.stringify(structRes.value.data[0])));
        }
      }
      if (configRes.status === "fulfilled") setPayrollConfig(configRes.value.data || {});
      if (tmplRes.status === "fulfilled") {
        setTemplates(tmplRes.value.data || []);
        setActiveTemplate(tmplRes.value.data[0] || null);
      }
      if (claimsRes.status === "fulfilled") setReimbursements(claimsRes.value.data || []);
      if (loansRes.status === "fulfilled") setLoans(loansRes.value.data || []);
      if (auditRes.status === "fulfilled") setAuditLogs(auditRes.value.data || []);
      if (teamsRes.status === "fulfilled") setTeams(teamsRes.value.data || []);
      if (usersRes.status === "fulfilled") setAllEmployees(usersRes.value.data || []);
    } catch (err) {
      console.error("Failed to load payroll engine data", err);
    } finally {
      setLoading(false);
    }
  };

  // ── 1. Calculate Monthly Payroll Run ───────────────────────────────────────
  const handleCalculatePayroll = async () => {
    setCalculating(true);
    setErrorMsg("");
    try {
      const res = await axios.post(
        `${API_BASE}/api/payroll-engine/runs/calculate`,
        { month: selectedMonth, year: selectedYear },
        authHeader
      );
      setCurrentRun(res.data.payrollRun);
      setStatusMsg(`Payroll for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} calculated!`);
      setTimeout(() => setStatusMsg(""), 3500);

      const runsRes = await axios.get(`${API_BASE}/api/payroll-engine/runs`, authHeader);
      setAllRuns(runsRes.data || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to calculate payroll run.");
    } finally {
      setCalculating(false);
    }
  };

  const handleAdvanceStage = async (action) => {
    if (!currentRun?._id) return;
    setStageLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/api/payroll-engine/runs/${currentRun._id}/stage`,
        { action },
        authHeader
      );
      setCurrentRun(res.data.run);
      setStatusMsg(`Payroll transitioned to ${res.data.run.status.toUpperCase()}`);
      setTimeout(() => setStatusMsg(""), 3500);

      const runsRes = await axios.get(`${API_BASE}/api/payroll-engine/runs`, authHeader);
      setAllRuns(runsRes.data || []);
    } catch (err) {
      alert("Failed to advance stage");
    } finally {
      setStageLoading(false);
    }
  };

  // ── 2. Adjust Employee Line Items During Payroll ───────────────────────────
  const handleOpenAdjustModal = (rec) => {
    setEditingRecord(rec);
    setAdjustForm({
      baseSalary: rec.baseSalary || 0,
      overtimeHours: rec.overtimeHours || 0,
      bonusAmount: rec.bonusAmount || 0,
      commissionAmount: rec.commissionAmount || 0,
      monthlyAdjustments: JSON.parse(JSON.stringify(rec.monthlyAdjustments || [])),
      notes: rec.notes || "",
    });
  };

  const handleSaveEmployeeAdjustments = async (e) => {
    e.preventDefault();
    if (!currentRun?._id || !editingRecord?.userId) return;
    setSavingAdjust(true);
    try {
      const res = await axios.put(
        `${API_BASE}/api/payroll-engine/runs/${currentRun._id}/adjust-employee`,
        {
          userId: editingRecord.userId,
          ...adjustForm,
        },
        authHeader
      );
      setCurrentRun(res.data.run);
      setEditingRecord(null);
      setStatusMsg(res.data.message || "Employee salary adjusted successfully!");
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to adjust employee salary");
    } finally {
      setSavingAdjust(false);
    }
  };

  // ── 3. Selective Payslip Dispatching ───────────────────────────────────────
  const handleDispatchPayslips = async () => {
    if (!currentRun?._id) return;
    setDispatching(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/payroll-engine/runs/${currentRun._id}/dispatch-slips`,
        {
          mode: dispatchMode,
          targetTeamId: selectedTeamId,
          targetEmployeeIds: selectedIndividualIds,
          excludedEmployeeIds: excludedEmployeeIds,
          forceResend,
        },
        authHeader
      );
      setCurrentRun(res.data.run);
      setIsDispatchModalOpen(false);
      setStatusMsg(res.data.message || "Payslips dispatched successfully!");
      setTimeout(() => setStatusMsg(""), 4000);

      const runsRes = await axios.get(`${API_BASE}/api/payroll-engine/runs`, authHeader);
      setAllRuns(runsRes.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to dispatch payslips");
    } finally {
      setDispatching(false);
    }
  };

  // ── 4. Export Monthly Payroll to Excel (.CSV) ──────────────────────────────
  const handleExportCSV = async () => {
    if (!currentRun?._id) return;
    try {
      const res = await axios.get(`${API_BASE}/api/payroll-engine/runs/${currentRun._id}/export-csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payroll_${currentRun.payrollPeriodLabel.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export payroll CSV");
    }
  };

  // ── 5. Structure Studio & Live CTC Simulator ───────────────────────────────
  const handleSaveActiveStructure = async () => {
    if (!activeStructureEditing) return;
    setSavingStructure(true);
    try {
      if (activeStructureEditing._id) {
        const res = await axios.put(
          `${API_BASE}/api/payroll-engine/structures/${activeStructureEditing._id}`,
          activeStructureEditing,
          authHeader
        );
        setStructures((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
        setActiveStructureEditing(JSON.parse(JSON.stringify(res.data)));
      } else {
        const res = await axios.post(
          `${API_BASE}/api/payroll-engine/structures`,
          activeStructureEditing,
          authHeader
        );
        setStructures((prev) => [...prev, res.data]);
        setActiveStructureEditing(JSON.parse(JSON.stringify(res.data)));
      }
      setStatusMsg(`Structure "${activeStructureEditing.name}" saved!`);
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save structure");
    } finally {
      setSavingStructure(false);
    }
  };

  const handleCreateNewStructure = (e) => {
    e.preventDefault();
    const newStruct = {
      name: "New Designation Structure",
      code: `STR-${Math.floor(100 + Math.random() * 900)}`,
      templateType: "standard",
      description: "Custom salary structure mapped to specific job role and designation",
      components: [
        { code: "BASIC", name: "Basic Salary", type: "earning", calculationType: "fixed_amount", value: 0, isMandatory: true },
        { code: "HRA", name: "House Rent Allowance", type: "earning", calculationType: "percentage", calculationBase: "basic_salary", value: 40 },
        { code: "TDS", name: "Income Tax (TDS)", type: "deduction", calculationType: "percentage", calculationBase: "gross_salary", value: 5 },
      ],
      version: 1,
    };
    setActiveStructureEditing(newStruct);
    setIsCreateStructModalOpen(false);
  };

  const handleAddLineItem = (type) => {
    if (!activeStructureEditing) return;
    const defaultCode = `${type.toUpperCase().slice(0, 4)}_${Math.floor(100 + Math.random() * 900)}`;
    const newItem = {
      code: defaultCode,
      name: type === "earning" ? "Custom Allowance" : type === "deduction" ? "Custom Deduction" : "Employer Benefit",
      type,
      calculationType: "percentage",
      calculationBase: type === "deduction" ? "gross_salary" : "basic_salary",
      value: type === "earning" ? 10 : type === "deduction" ? 5 : 12,
      formulaExpression: "",
      isMandatory: false,
    };
    setActiveStructureEditing({
      ...activeStructureEditing,
      components: [...(activeStructureEditing.components || []), newItem],
    });
  };

  const handleUpdateLineItem = (idx, field, val) => {
    if (!activeStructureEditing) return;
    const updated = [...(activeStructureEditing.components || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setActiveStructureEditing({ ...activeStructureEditing, components: updated });
  };

  const handleDeleteLineItem = (idx) => {
    if (!activeStructureEditing) return;
    const updated = (activeStructureEditing.components || []).filter((_, i) => i !== idx);
    setActiveStructureEditing({ ...activeStructureEditing, components: updated });
  };

  // Live Structure Simulator Calculation
  const simulatedBreakdown = useMemo(() => {
    if (!activeStructureEditing || !activeStructureEditing.components) {
      return { earnings: [], deductions: [], contributions: [], gross: 0, totalDeduct: 0, net: 0, ctc: 0 };
    }

    const base = Number(simulatorBaseRate || 0);
    const earnings = [];
    let gross = 0;
    const compMap = { BASIC: base, BASE: base };

    activeStructureEditing.components.forEach((c) => {
      if (c.type === "earning") {
        let amt = 0;
        const code = c.code || "EARN";

        if (code === "BASIC") {
          amt = base;
        } else if (c.calculationType === "percentage") {
          const b = c.calculationBase === "gross_salary" ? gross : (compMap[c.baseComponentCode] || base);
          amt = Math.round(b * ((Number(c.value) || 0) / 100));
        } else if (c.calculationType === "fixed_amount") {
          amt = Number(c.value || 0);
        } else if (c.calculationType === "formula" && c.formulaExpression) {
          try {
            amt = Math.round(eval(c.formulaExpression.replace(/BASIC/g, String(base)).replace(/GROSS/g, String(gross))) || 0);
          } catch (e) {
            amt = Number(c.value || 0);
          }
        } else {
          amt = Number(c.value || 0);
        }

        earnings.push({ code, name: c.name, amount: amt });
        compMap[code] = amt;
        gross += amt;
      }
    });

    const deductions = [];
    let totalDeduct = 0;
    activeStructureEditing.components.forEach((c) => {
      if (c.type === "deduction") {
        let amt = 0;
        const code = c.code || "DEDUCT";

        if (c.calculationType === "percentage") {
          const b = c.calculationBase === "gross_salary" ? gross : (compMap[c.baseComponentCode] || base);
          amt = Math.round(b * ((Number(c.value) || 0) / 100));
        } else if (c.calculationType === "fixed_amount") {
          amt = Number(c.value || 0);
        }
        deductions.push({ code, name: c.name, amount: amt });
        totalDeduct += amt;
      }
    });

    const contributions = [];
    let totalContrib = 0;
    activeStructureEditing.components.forEach((c) => {
      if (c.type === "employer_contribution") {
        const b = c.calculationBase === "gross_salary" ? gross : base;
        const amt = c.calculationType === "percentage" ? Math.round(b * ((Number(c.value) || 0) / 100)) : Number(c.value || 0);
        contributions.push({ code: c.code, name: c.name, amount: amt });
        totalContrib += amt;
      }
    });

    const net = Math.max(0, gross - totalDeduct);
    const monthlyCtc = gross + totalContrib;

    return { earnings, deductions, contributions, gross, totalDeduct, totalContrib, net, monthlyCtc };
  }, [activeStructureEditing, simulatorBaseRate]);

  // ── 6. Save Organization Rules ─────────────────────────────────────────────
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await axios.put(`${API_BASE}/api/payroll-engine/config`, payrollConfig, authHeader);
      setPayrollConfig(res.data);
      setStatusMsg("Enterprise payroll rules and commission slabs updated!");
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      alert("Failed to save organization config");
    } finally {
      setSavingConfig(false);
    }
  };

  // ── 7. Save Payslip Template ───────────────────────────────────────────────
  const handleSaveTemplate = async () => {
    if (!activeTemplate?._id) return;
    setSavingTemplate(true);
    try {
      const res = await axios.put(
        `${API_BASE}/api/payroll-engine/payslip-templates/${activeTemplate._id}`,
        activeTemplate,
        authHeader
      );
      setActiveTemplate(res.data);
      setStatusMsg("Custom payslip template saved successfully!");
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      alert("Failed to update template");
    } finally {
      setSavingTemplate(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "draft": return <Badge variant="neutral">DRAFT</Badge>;
      case "calculated": return <Badge variant="blue">CALCULATED</Badge>;
      case "under_review": return <Badge variant="amber">UNDER REVIEW</Badge>;
      case "approved": return <Badge variant="green">APPROVED</Badge>;
      case "locked": return <Badge variant="purple">LOCKED (IMMUTABLE)</Badge>;
      case "paid": return <Badge variant="green">DISBURSED</Badge>;
      default: return <Badge variant="neutral">{status?.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* ── Top Header Actions ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-end pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={fetchAllPayrollData}
          className="ent-btn-secondary text-xs flex items-center gap-1.5"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {statusMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("runs")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 ${
            activeTab === "runs" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          1. Monthly Payroll Processing
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("structures")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
            activeTab === "structures" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          <Sliders size={13} /> 2. Designation Salary Structures ({structures.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("components")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
            activeTab === "components" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          <Calculator size={13} /> 3. Component & Formula Catalog ({components.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
            activeTab === "config" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          <Percent size={13} /> 4. Organization Rules & Tax Slabs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("designer")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1.5 ${
            activeTab === "designer" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          <Palette size={13} /> 5. Custom Payslip Designer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 ${
            activeTab === "audit" ? "bg-[#1E40AF] text-white shadow-xs" : "text-slate-600 hover:bg-[#F5EFE6]"
          }`}
        >
          6. Audit Trail
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 1: MONTHLY PAYROLL RUN & DISPATCH CONTROLS
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "runs" && (
        <div className="space-y-6">
          <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Payroll Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="ent-select text-xs font-bold"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="ent-select text-xs font-bold"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleCalculatePayroll}
                  disabled={calculating}
                  className="ent-btn-primary"
                >
                  <Play size={13} /> {calculating ? "Calculating..." : "Calculate Monthly Payroll"}
                </button>
              </div>
            </div>

            {currentRun && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="ent-btn-secondary text-xs inline-flex items-center gap-1.5"
                  title="Download Excel CSV export of this payroll run"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600" /> Export to Excel (.CSV)
                </button>

                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(true)}
                  className="px-3 py-1.5 bg-[#1E40AF] text-white rounded text-xs font-bold hover:bg-blue-800 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Send size={13} /> Send Payslips to Users
                </button>

                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  {getStatusBadge(currentRun.status)}
                  {currentRun.status === "calculated" && (
                    <button
                      type="button"
                      disabled={stageLoading}
                      onClick={() => handleAdvanceStage("approve")}
                      className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {currentRun.status === "approved" && (
                    <button
                      type="button"
                      disabled={stageLoading}
                      onClick={() => handleAdvanceStage("lock")}
                      className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700 transition-colors inline-flex items-center gap-1"
                    >
                      <Lock size={11} /> Lock
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {currentRun && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Gross Payroll</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                    ₹{(currentRun.summary?.totalGross || 0).toLocaleString()}
                  </div>
                </div>

                <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Deductions</span>
                  <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
                    -₹{(currentRun.summary?.totalDeductions || 0).toLocaleString()}
                  </div>
                </div>

                <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Net Disbursed Pay</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                    ₹{(currentRun.summary?.totalNetPay || 0).toLocaleString()}
                  </div>
                </div>

                <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Payslips Sent</span>
                  <div className="text-2xl font-black text-[#1E40AF] mt-1 font-mono">
                    {currentRun.employeeRecords?.filter((r) => r.isSent).length || 0} / {currentRun.employeeRecords?.length || 0}
                  </div>
                </div>
              </div>

              {/* Exception Box */}
              {currentRun.exceptions?.length > 0 && (
                <div className="ent-card p-4 bg-amber-50/70 border-amber-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
                    <AlertTriangle size={15} className="text-amber-600" />
                    <span>Payroll Exception Warnings ({currentRun.exceptions.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {currentRun.exceptions.map((ex, idx) => (
                      <div key={idx} className="p-2 bg-white/90 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
                        <Info size={13} className="text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <strong className="font-bold">{ex.employeeName}:</strong> {ex.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Employee Breakdown Table */}
              <div className="ent-card overflow-hidden bg-white border-[#EAE3D6] shadow-xs">
                <div className="ent-card-header flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {currentRun.payrollPeriodLabel} — Employee Statements & Adjustments
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="ent-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Designation & Structure</th>
                        <th>Gross Pay</th>
                        <th>Deductions</th>
                        <th>Net Take-Home</th>
                        <th>Adjustments</th>
                        <th>Payslip Sent Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentRun.employeeRecords || []).map((rec) => (
                        <tr key={rec._id || rec.userId} className="hover:bg-[#FAF8F5]/80">
                          <td>
                            <div className="font-bold text-slate-900 text-xs">{rec.username}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{rec.employeeIdCode}</div>
                          </td>
                          <td>
                            <div className="text-xs font-semibold text-slate-800">{rec.designation}</div>
                            <div className="text-[10px] text-slate-400">{rec.salaryStructureName}</div>
                          </td>
                          <td>
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              ₹{(rec.grossPay || 0).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <span className="font-mono font-bold text-rose-700 text-xs">
                              -₹{(rec.totalDeductions || 0).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <span className="font-mono font-black text-emerald-700 text-xs">
                              ₹{(rec.netPay || 0).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            {(rec.monthlyAdjustments?.length || 0) > 0 ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {rec.monthlyAdjustments.length} Custom
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">—</span>
                            )}
                          </td>
                          <td>
                            {rec.isSent ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Check size={11} /> Sent {rec.sentAt ? new Date(rec.sentAt).toLocaleDateString() : ""}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                Unsent
                              </span>
                            )}
                          </td>
                          <td className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenAdjustModal(rec)}
                                className="ent-btn-secondary text-xs py-1 px-2 text-[#1E40AF] inline-flex items-center gap-1"
                                title="Edit one-time earnings, deductions, or adjustments for this run"
                              >
                                <Edit size={12} /> Adjust Salary
                              </button>
                              <button
                                type="button"
                                onClick={() => setViewingRecord(rec)}
                                className="ent-btn-secondary text-xs py-1 px-2 inline-flex items-center gap-1"
                              >
                                <Eye size={12} /> View Slip
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 2: DESIGNATION SALARY STRUCTURE STUDIO
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "structures" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Selected Structure:</span>
              <select
                value={activeStructureEditing?._id || ""}
                onChange={(e) => {
                  const s = structures.find((x) => x._id === e.target.value);
                  if (s) setActiveStructureEditing(JSON.parse(JSON.stringify(s)));
                }}
                className="ent-select text-xs font-bold min-w-[220px]"
              >
                {structures.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleCreateNewStructure}
              className="ent-btn-primary"
            >
              <Plus size={14} /> Create Structure for Designation
            </button>
          </div>

          {activeStructureEditing && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Structure Canvas & Component Line Items */}
              <div className="lg:col-span-7 space-y-4">
                <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider">
                      Structure Configuration
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveActiveStructure}
                      disabled={savingStructure}
                      className="ent-btn-primary text-xs"
                    >
                      <Check size={13} /> {savingStructure ? "Saving..." : "Save Structure"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="sm:col-span-2">
                      <label className="ent-label">Designation / Role Title *</label>
                      <input
                        type="text"
                        value={activeStructureEditing.name || ""}
                        onChange={(e) => setActiveStructureEditing({ ...activeStructureEditing, name: e.target.value })}
                        className="ent-input text-xs font-bold"
                        placeholder="e.g. Senior Fullstack Developer"
                      />
                    </div>
                    <div>
                      <label className="ent-label">Structure Code *</label>
                      <input
                        type="text"
                        value={activeStructureEditing.code || ""}
                        onChange={(e) => setActiveStructureEditing({ ...activeStructureEditing, code: e.target.value.toUpperCase() })}
                        className="ent-input text-xs font-mono font-bold"
                        placeholder="STR-DEV"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="ent-label">Description / Internal Scope</label>
                    <input
                      type="text"
                      value={activeStructureEditing.description || ""}
                      onChange={(e) => setActiveStructureEditing({ ...activeStructureEditing, description: e.target.value })}
                      className="ent-input text-xs"
                      placeholder="Mapped to engineering team members..."
                    />
                  </div>
                </div>

                {/* Earnings */}
                <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-emerald-600" /> 1. Earnings & Allowances
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddLineItem("earning")}
                      className="ent-btn-secondary text-[11px] py-1 px-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                    >
                      <Plus size={12} /> Add Earning
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(activeStructureEditing.components || [])
                      .map((comp, idx) => ({ comp, idx }))
                      .filter(({ comp }) => comp.type === "earning")
                      .map(({ comp, idx }) => (
                        <div key={idx} className="p-2.5 bg-[#FAF8F5] border border-[#EAE3D6] rounded text-xs grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-slate-400 font-semibold block">Component Name</label>
                            <input
                              type="text"
                              value={comp.name}
                              disabled={comp.code === "BASIC"}
                              onChange={(e) => handleUpdateLineItem(idx, "name", e.target.value)}
                              className="ent-input text-xs font-bold bg-white"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-slate-400 font-semibold block">Calculation Mode</label>
                            <select
                              value={comp.calculationType}
                              disabled={comp.code === "BASIC"}
                              onChange={(e) => handleUpdateLineItem(idx, "calculationType", e.target.value)}
                              className="ent-select text-xs bg-white"
                            >
                              <option value="fixed_amount">Fixed Amount (₹)</option>
                              <option value="percentage">% of Basic</option>
                              <option value="formula">Visual Formula</option>
                              <option value="variable">Variable / Run</option>
                            </select>
                          </div>

                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-slate-400 font-semibold block">
                              {comp.calculationType === "percentage" ? "Rate (%)" : comp.calculationType === "formula" ? "Formula String" : "Amount (₹)"}
                            </label>
                            {comp.calculationType === "formula" ? (
                              <input
                                type="text"
                                placeholder="BASIC * 0.40"
                                value={comp.formulaExpression || ""}
                                onChange={(e) => handleUpdateLineItem(idx, "formulaExpression", e.target.value)}
                                className="ent-input text-xs font-mono bg-white"
                              />
                            ) : (
                              <input
                                type="number"
                                disabled={comp.code === "BASIC"}
                                placeholder={comp.code === "BASIC" ? "Base Salary Rate" : "0"}
                                value={comp.code === "BASIC" ? "" : comp.value}
                                onChange={(e) => handleUpdateLineItem(idx, "value", Number(e.target.value))}
                                className="ent-input text-xs font-mono font-bold bg-white"
                              />
                            )}
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            {comp.code !== "BASIC" && (
                              <button
                                type="button"
                                onClick={() => handleDeleteLineItem(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Deductions */}
                <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <span className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1.5">
                      <Shield size={14} className="text-rose-600" /> 2. Deductions & Taxes
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddLineItem("deduction")}
                      className="ent-btn-secondary text-[11px] py-1 px-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
                    >
                      <Plus size={12} /> Add Deduction
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(activeStructureEditing.components || [])
                      .map((comp, idx) => ({ comp, idx }))
                      .filter(({ comp }) => comp.type === "deduction")
                      .map(({ comp, idx }) => (
                        <div key={idx} className="p-2.5 bg-[#FAF8F5] border border-[#EAE3D6] rounded text-xs grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-slate-400 font-semibold block">Deduction Name</label>
                            <input
                              type="text"
                              value={comp.name}
                              onChange={(e) => handleUpdateLineItem(idx, "name", e.target.value)}
                              className="ent-input text-xs font-bold bg-white"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-slate-400 font-semibold block">Calculation Mode</label>
                            <select
                              value={comp.calculationType}
                              onChange={(e) => handleUpdateLineItem(idx, "calculationType", e.target.value)}
                              className="ent-select text-xs bg-white"
                            >
                              <option value="percentage">% of Gross</option>
                              <option value="fixed_amount">Fixed Amount (₹)</option>
                              <option value="formula">Formula</option>
                            </select>
                          </div>

                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-slate-400 font-semibold block">
                              {comp.calculationType === "percentage" ? "Percentage (%)" : "Amount (₹)"}
                            </label>
                            <input
                              type="number"
                              value={comp.value}
                              onChange={(e) => handleUpdateLineItem(idx, "value", Number(e.target.value))}
                              className="ent-input text-xs font-mono font-bold bg-white text-rose-700"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleDeleteLineItem(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Live Real-Time Simulator Sandbox */}
              <div className="lg:col-span-5 ent-card p-5 bg-[#FAF8F5] border-[#EAE3D6] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-[#EAE3D6]">
                  <span className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator size={15} /> Live Sandbox Calculator
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Simulate Base Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={simulatorBaseRate}
                    onChange={(e) => setSimulatorBaseRate(Number(e.target.value))}
                    className="ent-input text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded border border-[#EAE3D6] space-y-1.5">
                    <span className="font-bold text-emerald-800 text-[11px] block uppercase">Earnings Breakdown</span>
                    {simulatedBreakdown.earnings.map((e, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="text-slate-600">{e.name}</span>
                        <span className="font-mono font-bold text-slate-900">₹{e.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-slate-100 flex justify-between font-bold text-emerald-900">
                      <span>Gross Monthly Pay:</span>
                      <span className="font-mono">₹{simulatedBreakdown.gross?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border border-[#EAE3D6] space-y-1.5">
                    <span className="font-bold text-rose-800 text-[11px] block uppercase">Deductions Breakdown</span>
                    {simulatedBreakdown.deductions.map((d, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="text-slate-600">{d.name}</span>
                        <span className="font-mono font-bold text-rose-600">-₹{d.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-slate-100 flex justify-between font-bold text-rose-900">
                      <span>Total Deductions:</span>
                      <span className="font-mono">-₹{simulatedBreakdown.totalDeduct?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#1E40AF] text-white rounded shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-200">Net Take-Home Pay</span>
                      <div className="text-[11px] text-blue-100">Disbursed to Employee</div>
                    </div>
                    <div className="text-xl font-black font-mono">
                      ₹{simulatedBreakdown.net?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 3: COMPONENT & FORMULA CATALOG
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "components" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Custom Salary Component & Formula Catalog</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCompModalOpen(true)}
              className="ent-btn-primary"
            >
              <Plus size={14} /> Create Custom Component
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((c) => (
              <div key={c._id} className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs space-y-3 relative group">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                      {c.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs mt-1">{c.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={c.type === "earning" ? "green" : c.type === "deduction" ? "red" : "purple"}>
                      {c.type.toUpperCase()}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleDeleteComponent(c._id)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 bg-[#FAF8F5] p-2.5 rounded border border-[#EAE3D6]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mode:</span>
                    <strong className="font-semibold capitalize">{(c.calculationType || "").replace(/_/g, " ")}</strong>
                  </div>
                  {c.calculationType === "percentage" && (
                    <div className="text-[#1E40AF] font-bold flex justify-between">
                      <span>Rate:</span>
                      <span>{c.value}%</span>
                    </div>
                  )}
                  {c.calculationType === "fixed_amount" && (
                    <div className="text-slate-900 font-bold font-mono flex justify-between">
                      <span>Amount:</span>
                      <span>₹{Number(c.value || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {c.formulaExpression && (
                    <div className="p-1.5 bg-purple-50 text-purple-800 rounded font-mono text-[11px] border border-purple-200">
                      Formula: {c.formulaExpression}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 4: ENTERPRISE ORGANIZATION RULES & TAX SLABS
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "config" && payrollConfig && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Organization-Wide Payroll Rules & Statutory Policies</h2>
            </div>
            <button type="submit" disabled={savingConfig} className="ent-btn-primary">
              {savingConfig ? "Saving..." : "Save Policies & Slabs"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pay Frequency & Unpaid Leaves Basis */}
            <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <Calendar size={14} className="text-[#1E40AF]" /> Pay Period & Unpaid Leave Policy
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="ent-label">Pay Frequency</label>
                  <select
                    value={payrollConfig.payFrequency || "monthly"}
                    onChange={(e) => setPayrollConfig({ ...payrollConfig, payFrequency: e.target.value })}
                    className="ent-select text-xs"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="semi_monthly">Semi-Monthly</option>
                    <option value="bi_weekly">Bi-Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="ent-label">Unpaid Leave Cut-off Basis</label>
                  <select
                    value={payrollConfig.attendanceIntegration?.unpaidLeaveCalculationBasis || "calendar_days"}
                    onChange={(e) =>
                      setPayrollConfig({
                        ...payrollConfig,
                        attendanceIntegration: {
                          ...payrollConfig.attendanceIntegration,
                          unpaidLeaveCalculationBasis: e.target.value,
                        },
                      })
                    }
                    className="ent-select text-xs font-semibold"
                  >
                    <option value="calendar_days">Month Calendar Days (28-31)</option>
                    <option value="fixed_26_days">Fixed 26 Working Days</option>
                    <option value="fixed_30_days">Fixed 30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="ent-label">Unapproved Absence (Loss of Pay)</label>
                  <select
                    value={payrollConfig.attendanceIntegration?.deductUnapprovedLeaves ? "yes" : "no"}
                    onChange={(e) =>
                      setPayrollConfig({
                        ...payrollConfig,
                        attendanceIntegration: {
                          ...payrollConfig.attendanceIntegration,
                          deductUnapprovedLeaves: e.target.value === "yes",
                        },
                      })
                    }
                    className="ent-select text-xs font-semibold"
                  >
                    <option value="yes">Deduct (Loss of Pay)</option>
                    <option value="no">Do Not Deduct Automatically</option>
                  </select>
                </div>
                <div>
                  <label className="ent-label">Unapproved Penalty Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    value={payrollConfig.attendanceIntegration?.unapprovedLeavePenaltyMultiplier || 1.0}
                    onChange={(e) =>
                      setPayrollConfig({
                        ...payrollConfig,
                        attendanceIntegration: {
                          ...payrollConfig.attendanceIntegration,
                          unapprovedLeavePenaltyMultiplier: Number(e.target.value),
                        },
                      })
                    }
                    className="ent-input text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Overtime Policy */}
            <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <Clock size={14} className="text-[#1E40AF]" /> Overtime Multipliers
              </h3>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <label className="ent-label">Normal OT (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={payrollConfig.overtime?.rateMultiplier || 1.5}
                    onChange={(e) =>
                      setPayrollConfig({
                        ...payrollConfig,
                        overtime: { ...payrollConfig.overtime, rateMultiplier: Number(e.target.value) },
                      })
                    }
                    className="ent-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="ent-label">Weekend OT (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={payrollConfig.overtime?.weekendMultiplier || 2.0}
                    onChange={(e) =>
                      setPayrollConfig({
                        ...payrollConfig,
                        overtime: { ...payrollConfig.overtime, weekendMultiplier: Number(e.target.value) },
                      })
                    }
                    className="ent-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="ent-label">Holiday OT (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={payrollConfig.overtime?.holidayMultiplier || 2.5}
                    onChange={(e) =>
                      setPayrollConfig({
                        ...payrollConfig,
                        overtime: { ...payrollConfig.overtime, holidayMultiplier: Number(e.target.value) },
                      })
                    }
                    className="ent-input text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Multi-Tier Commission Slabs */}
            <div className="md:col-span-2 ent-card p-4 bg-white border-[#EAE3D6] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <Percent size={14} className="text-[#1E40AF]" /> Sales Commission Tiers & Milestone Bonuses
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const current = payrollConfig.commissionSlabs || [];
                    setPayrollConfig({
                      ...payrollConfig,
                      commissionSlabs: [...current, { tierName: "Custom Tier", minSales: 0, maxSales: 200000, percentage: 4, bonusFixed: 0 }],
                    });
                  }}
                  className="ent-btn-secondary text-xs py-1"
                >
                  <Plus size={12} /> Add Tier Slab
                </button>
              </div>

              <div className="space-y-2">
                {(payrollConfig.commissionSlabs || []).map((slab, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-[#FAF8F5] p-2.5 rounded border border-[#EAE3D6]">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Tier Name</label>
                      <input
                        type="text"
                        value={slab.tierName || "Tier"}
                        onChange={(e) => {
                          const updated = [...payrollConfig.commissionSlabs];
                          updated[idx].tierName = e.target.value;
                          setPayrollConfig({ ...payrollConfig, commissionSlabs: updated });
                        }}
                        className="ent-input text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Min Sales (₹)</label>
                      <input
                        type="number"
                        value={slab.minSales}
                        onChange={(e) => {
                          const updated = [...payrollConfig.commissionSlabs];
                          updated[idx].minSales = Number(e.target.value);
                          setPayrollConfig({ ...payrollConfig, commissionSlabs: updated });
                        }}
                        className="ent-input text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Max Sales (₹)</label>
                      <input
                        type="number"
                        value={slab.maxSales}
                        onChange={(e) => {
                          const updated = [...payrollConfig.commissionSlabs];
                          updated[idx].maxSales = Number(e.target.value);
                          setPayrollConfig({ ...payrollConfig, commissionSlabs: updated });
                        }}
                        className="ent-input text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Rate (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={slab.percentage}
                        onChange={(e) => {
                          const updated = [...payrollConfig.commissionSlabs];
                          updated[idx].percentage = Number(e.target.value);
                          setPayrollConfig({ ...payrollConfig, commissionSlabs: updated });
                        }}
                        className="ent-input text-xs font-mono font-bold text-[#1E40AF]"
                      />
                    </div>
                    <div className="flex items-center justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = payrollConfig.commissionSlabs.filter((_, i) => i !== idx);
                          setPayrollConfig({ ...payrollConfig, commissionSlabs: updated });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 5: ENTERPRISE CUSTOM PAYSLIP STUDIO
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "designer" && activeTemplate && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Custom Payslip Template Designer</h2>
            </div>
            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={savingTemplate}
              className="ent-btn-primary"
            >
              {savingTemplate ? "Saving..." : "Save Template"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase">Branding & Logo</h3>
                <div>
                  <label className="ent-label">Company Legal Name</label>
                  <input
                    type="text"
                    value={activeTemplate.header?.companyName || ""}
                    onChange={(e) =>
                      setActiveTemplate({
                        ...activeTemplate,
                        header: { ...activeTemplate.header, companyName: e.target.value },
                      })
                    }
                    className="ent-input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="ent-label">Logo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com/logo.png"
                    value={activeTemplate.header?.logoUrl || ""}
                    onChange={(e) =>
                      setActiveTemplate({
                        ...activeTemplate,
                        header: { ...activeTemplate.header, logoUrl: e.target.value },
                      })
                    }
                    className="ent-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="ent-label">Registered Office Address</label>
                  <input
                    type="text"
                    value={activeTemplate.header?.addressLine || ""}
                    onChange={(e) =>
                      setActiveTemplate({
                        ...activeTemplate,
                        header: { ...activeTemplate.header, addressLine: e.target.value },
                      })
                    }
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">Tax ID / GSTIN Registration</label>
                  <input
                    type="text"
                    value={activeTemplate.header?.taxRegistrationNumber || ""}
                    onChange={(e) =>
                      setActiveTemplate({
                        ...activeTemplate,
                        header: { ...activeTemplate.header, taxRegistrationNumber: e.target.value },
                      })
                    }
                    className="ent-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="ent-card p-4 bg-white border-[#EAE3D6] shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase">Signatory & Watermark</h3>
                <div>
                  <label className="ent-label">Authorized Signatory Name</label>
                  <input
                    type="text"
                    value={activeTemplate.signatory?.name || ""}
                    onChange={(e) =>
                      setActiveTemplate({
                        ...activeTemplate,
                        signatory: { ...activeTemplate.signatory, name: e.target.value },
                      })
                    }
                    className="ent-input text-xs"
                  />
                </div>
                <div>
                  <label className="ent-label">Signatory Designation</label>
                  <input
                    type="text"
                    value={activeTemplate.signatory?.designation || ""}
                    onChange={(e) =>
                      setActiveTemplate({
                        ...activeTemplate,
                        signatory: { ...activeTemplate.signatory, designation: e.target.value },
                      })
                    }
                    className="ent-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Right Live Canvas (8 Cols) */}
            <div className="lg:col-span-8 ent-card p-8 bg-white border-[#EAE3D6] shadow-xs space-y-6">
              <div className="flex items-start justify-between border-b pb-4 border-slate-200">
                <div className="flex items-center gap-3">
                  <img
                    src={activeTemplate.header?.logoUrl || "https://crm.starwaywebdigital.com/assets/starwaylogo-CBhcSc4Y.png"}
                    alt="Starway Logo"
                    className="h-10 object-contain"
                  />
                  <div>
                    <h2 className="text-base font-black tracking-tight text-slate-900">
                      {activeTemplate.header?.companyName || "Starway Enterprise Inc."}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">{activeTemplate.header?.addressLine}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{activeTemplate.header?.taxRegistrationNumber}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-[#EFF6FF] text-[#1E40AF] font-bold text-xs px-2.5 py-1 rounded border border-[#BFDBFE]">
                    AUGUST 2026
                  </span>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF8F5] p-3 rounded border border-[#EAE3D6]">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Employee ID</span>
                  <span className="font-bold text-slate-900 font-mono">EMP-104</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Employee Name</span>
                  <span className="font-bold text-slate-900">Alex Morgan</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Designation</span>
                  <span className="font-bold text-slate-900">Senior Architect</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Bank Account</span>
                  <span className="font-bold text-slate-900 font-mono">**** 4092</span>
                </div>
              </div>

              {/* Side-by-side Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[#EAE3D6] rounded overflow-hidden">
                  <div className="bg-[#FAF8F5] p-2 text-xs font-bold text-emerald-800 border-b border-[#EAE3D6]">
                    EARNINGS & ALLOWANCES
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-2 text-slate-700">Basic Salary</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">₹50,000</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-2 text-slate-700">House Rent Allowance</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">₹20,000</td>
                      </tr>
                      <tr className="bg-emerald-50/50 font-bold">
                        <td className="p-2 text-emerald-900">Gross Earnings</td>
                        <td className="p-2 text-right font-mono text-emerald-900 font-black">₹70,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border border-[#EAE3D6] rounded overflow-hidden">
                  <div className="bg-[#FAF8F5] p-2 text-xs font-bold text-rose-800 border-b border-[#EAE3D6]">
                    DEDUCTIONS & TAXES
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-2 text-slate-700">Income Tax (TDS)</td>
                        <td className="p-2 text-right font-mono font-bold text-rose-700">₹3,500</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-2 text-slate-700">Provident Fund</td>
                        <td className="p-2 text-right font-mono font-bold text-rose-700">₹6,000</td>
                      </tr>
                      <tr className="bg-rose-50/50 font-bold">
                        <td className="p-2 text-rose-900">Total Deductions</td>
                        <td className="p-2 text-right font-mono text-rose-900 font-black">₹9,500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Net Pay Box */}
              <div className="p-4 bg-[#1E40AF] text-white rounded flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-blue-200">Net Take-Home Pay</span>
                  <div className="text-[11px] text-blue-100">Disbursed via Direct Deposit</div>
                </div>
                <div className="text-2xl font-black font-mono">₹60,500</div>
              </div>

              {/* Signatory Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <div className="font-bold text-slate-800">{activeTemplate.signatory?.name}</div>
                  <div className="text-[10px] text-slate-400">{activeTemplate.signatory?.designation}</div>
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  {activeTemplate.header?.taxRegistrationNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Adjust Employee Line Items Modal ─────────────────────────────────── */}
      <Modal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title={`Adjust Monthly Salary Items — ${editingRecord?.username || ""}`}
        maxWidth="max-w-lg"
        footer={
          <>
            <button type="button" onClick={() => setEditingRecord(null)} className="ent-btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              form="adjust-salary-form"
              disabled={savingAdjust}
              className="ent-btn-primary"
            >
              {savingAdjust ? "Recalculating..." : "Save & Recalculate Slip"}
            </button>
          </>
        }
      >
        <form id="adjust-salary-form" onSubmit={handleSaveEmployeeAdjustments} className="space-y-4 text-xs">
          <div className="p-2.5 bg-[#FAF8F5] border border-[#EAE3D6] rounded">
            <span className="font-bold text-slate-900 text-xs block">{editingRecord?.username}</span>
            <span className="text-slate-500 font-mono text-[11px]">{editingRecord?.employeeIdCode} • {editingRecord?.designation}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ent-label">Base Monthly Salary (₹)</label>
              <input
                type="number"
                value={adjustForm.baseSalary}
                onChange={(e) => setAdjustForm({ ...adjustForm, baseSalary: Number(e.target.value) })}
                className="ent-input text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="ent-label">Overtime (Hours)</label>
              <input
                type="number"
                value={adjustForm.overtimeHours}
                onChange={(e) => setAdjustForm({ ...adjustForm, overtimeHours: Number(e.target.value) })}
                className="ent-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="ent-label">Performance Bonus (₹)</label>
              <input
                type="number"
                value={adjustForm.bonusAmount}
                onChange={(e) => setAdjustForm({ ...adjustForm, bonusAmount: Number(e.target.value) })}
                className="ent-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="ent-label">Sales Commission (₹)</label>
              <input
                type="number"
                value={adjustForm.commissionAmount}
                onChange={(e) => setAdjustForm({ ...adjustForm, commissionAmount: Number(e.target.value) })}
                className="ent-input text-xs font-mono"
              />
            </div>
          </div>

          {/* One-off Adjustments (Additions / Deductions) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase">One-off Monthly Adjustments</span>
              <button
                type="button"
                onClick={() =>
                  setAdjustForm({
                    ...adjustForm,
                    monthlyAdjustments: [
                      ...adjustForm.monthlyAdjustments,
                      { title: "Special Allowance", amount: 1500, type: "earning" },
                    ],
                  })
                }
                className="ent-btn-secondary text-[11px] py-0.5 px-2"
              >
                + Add Line
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {adjustForm.monthlyAdjustments.map((adj, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1.5 items-center bg-[#FAF8F5] p-1.5 rounded border border-[#EAE3D6]">
                  <input
                    type="text"
                    placeholder="Title"
                    value={adj.title}
                    onChange={(e) => {
                      const updated = [...adjustForm.monthlyAdjustments];
                      updated[idx].title = e.target.value;
                      setAdjustForm({ ...adjustForm, monthlyAdjustments: updated });
                    }}
                    className="col-span-5 ent-input text-[11px]"
                  />
                  <select
                    value={adj.type}
                    onChange={(e) => {
                      const updated = [...adjustForm.monthlyAdjustments];
                      updated[idx].type = e.target.value;
                      setAdjustForm({ ...adjustForm, monthlyAdjustments: updated });
                    }}
                    className="col-span-3 ent-select text-[11px]"
                  >
                    <option value="earning">+ Add (Earning)</option>
                    <option value="deduction">- Deduct</option>
                  </select>
                  <input
                    type="number"
                    value={adj.amount}
                    onChange={(e) => {
                      const updated = [...adjustForm.monthlyAdjustments];
                      updated[idx].amount = Number(e.target.value);
                      setAdjustForm({ ...adjustForm, monthlyAdjustments: updated });
                    }}
                    className="col-span-3 ent-input text-[11px] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = adjustForm.monthlyAdjustments.filter((_, i) => i !== idx);
                      setAdjustForm({ ...adjustForm, monthlyAdjustments: updated });
                    }}
                    className="col-span-1 text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Selective Payslip Dispatching Modal ─────────────────────────────── */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Dispatch Salary Slips to Employees"
        maxWidth="max-w-xl"
        footer={
          <>
            <button type="button" onClick={() => setIsDispatchModalOpen(false)} className="ent-btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              disabled={dispatching}
              onClick={handleDispatchPayslips}
              className="ent-btn-primary"
            >
              <Send size={13} /> {dispatching ? "Dispatching..." : "Confirm & Send Payslips"}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Once sent, employees will immediately receive and be able to view/download their salary statement in their personal portal.
          </p>

          <div>
            <label className="ent-label">Dispatch Target Audience</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDispatchMode("all")}
                className={`p-2.5 rounded border text-left font-bold transition-all ${
                  dispatchMode === "all" ? "bg-[#EFF6FF] text-[#1E40AF] border-[#1E40AF]" : "bg-white text-slate-700 border-[#EAE3D6]"
                }`}
              >
                Send to All
                <span className="block text-[10px] font-normal text-slate-400">All eligible staff</span>
              </button>

              <button
                type="button"
                onClick={() => setDispatchMode("team")}
                className={`p-2.5 rounded border text-left font-bold transition-all ${
                  dispatchMode === "team" ? "bg-[#EFF6FF] text-[#1E40AF] border-[#1E40AF]" : "bg-white text-slate-700 border-[#EAE3D6]"
                }`}
              >
                Specific Team
                <span className="block text-[10px] font-normal text-slate-400">By operational unit</span>
              </button>

              <button
                type="button"
                onClick={() => setDispatchMode("individual")}
                className={`p-2.5 rounded border text-left font-bold transition-all ${
                  dispatchMode === "individual" ? "bg-[#EFF6FF] text-[#1E40AF] border-[#1E40AF]" : "bg-white text-slate-700 border-[#EAE3D6]"
                }`}
              >
                Specific Persons
                <span className="block text-[10px] font-normal text-slate-400">Select individuals</span>
              </button>
            </div>
          </div>

          {dispatchMode === "team" && (
            <div>
              <label className="ent-label">Select Team</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="ent-select text-xs font-bold"
              >
                <option value="">-- Choose Team --</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Exclude specific individuals */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Exclude Individuals ({excludedEmployeeIds.length} excluded)
            </span>
            <div className="max-h-36 overflow-y-auto border border-[#EAE3D6] rounded p-2 divide-y divide-slate-100 bg-[#FAF8F5]">
              {(currentRun?.employeeRecords || []).map((rec) => {
                const isExcluded = excludedEmployeeIds.includes(String(rec.userId));
                return (
                  <label key={rec.userId} className="flex items-center justify-between p-1.5 hover:bg-white rounded cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{rec.username}</span>
                      <span className="text-[10px] text-slate-400 ml-1 font-mono">({rec.employeeIdCode})</span>
                      {rec.isSent && (
                        <span className="ml-2 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">
                          Already Sent
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isExcluded}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExcludedEmployeeIds([...excludedEmployeeIds, String(rec.userId)]);
                        } else {
                          setExcludedEmployeeIds(excludedEmployeeIds.filter((id) => id !== String(rec.userId)));
                        }
                      }}
                      className="rounded text-rose-600"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* ── View Salary Statement Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(viewingRecord)}
        onClose={() => setViewingRecord(null)}
        title={`Salary Statement — ${viewingRecord?.username || ""}`}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold text-slate-500">
              {viewingRecord?.isSent ? "✓ Payslip Sent to User" : "Pending Dispatch"}
            </span>
            <button type="button" onClick={() => setViewingRecord(null)} className="ent-btn-secondary">
              Close
            </button>
          </div>
        }
      >
        {viewingRecord && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-[#FAF8F5] p-3 rounded border border-[#EAE3D6]">
              <div>
                <span className="font-bold text-slate-900 text-sm">{viewingRecord.username}</span>
                <div className="text-slate-500 font-mono text-[11px]">
                  {viewingRecord.employeeIdCode} • {viewingRecord.designation}
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold font-mono text-[#1E40AF] text-sm">
                  Net: ₹{viewingRecord.netPay?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-[#EAE3D6] rounded p-2.5 space-y-1">
                <span className="font-bold text-emerald-800 text-[11px] block">EARNINGS</span>
                {(viewingRecord.earnings || []).map((e, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="text-slate-600">{e.name}</span>
                    <span className="font-mono font-bold">₹{e.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border border-[#EAE3D6] rounded p-2.5 space-y-1">
                <span className="font-bold text-rose-800 text-[11px] block">DEDUCTIONS</span>
                {(viewingRecord.deductions || []).map((d, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="text-slate-600">{d.name}</span>
                    <span className="font-mono font-bold text-rose-600">-₹{d.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Component Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        title="Create Salary Component"
        maxWidth="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => setIsCompModalOpen(false)} className="ent-btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!compForm.name || !compForm.code) return;
                try {
                  const res = await axios.post(`${API_BASE}/api/payroll-engine/components`, compForm, authHeader);
                  setComponents((prev) => [...prev, res.data]);
                  setIsCompModalOpen(false);
                } catch (e) {
                  alert("Failed to create component");
                }
              }}
              className="ent-btn-primary"
            >
              Create
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="ent-label">Component Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Travel Allowance"
              value={compForm.name}
              onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
              className="ent-input text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="ent-label">Code *</label>
              <input
                type="text"
                required
                placeholder="TRAVEL"
                value={compForm.code}
                onChange={(e) => setCompForm({ ...compForm, code: e.target.value.toUpperCase() })}
                className="ent-input text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="ent-label">Type</label>
              <select
                value={compForm.type}
                onChange={(e) => setCompForm({ ...compForm, type: e.target.value })}
                className="ent-select text-xs"
              >
                <option value="earning">Earning</option>
                <option value="deduction">Deduction</option>
                <option value="employer_contribution">Employer Contribution</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
