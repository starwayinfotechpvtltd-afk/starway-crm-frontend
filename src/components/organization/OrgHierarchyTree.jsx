import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Users,
  Search,
  Building2,
  ChevronDown,
  ChevronRight,
  Shield,
  UserCheck,
  Mail,
  Phone,
  FolderKanban,
  GitBranch,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import Badge from "../ui/Badge";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function OrgHierarchyTree() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [usersRes, teamsRes, deptRes] = await Promise.all([
        axios.get(`${API_BASE}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUsers(usersRes.data || []);
      setTeams(teamsRes.data || []);
      const depts = deptRes.data || [];
      setDepartments(depts);

      // Auto-expand all departments
      const expandMap = { admin: true };
      depts.forEach((d) => {
        expandMap[d.name] = true;
      });
      setExpandedNodes(expandMap);
    } catch (err) {
      console.error("Failed to load org hierarchy data:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Group users into hierarchical structure based on dynamic departments
  const hierarchy = useMemo(() => {
    const admins = users.filter((u) => u.role === "admin");
    const managers = users.filter((u) => u.role === "manager" || u.role === "hr");
    const teamLeads = users.filter((u) => u.role === "team_lead");
    const individualContributors = users.filter(
      (u) => !["admin", "manager", "hr", "team_lead"].includes(u.role)
    );

    // Get all unique departments from department API + users
    const allDeptNames = Array.from(
      new Set([
        ...departments.map((d) => d.name),
        ...users.map((u) => u.department || "General"),
      ])
    ).filter(Boolean);

    const deptTree = allDeptNames.map((deptName) => {
      const deptMeta = departments.find(
        (d) => d.name.toLowerCase() === deptName.toLowerCase()
      ) || { name: deptName, color: "#2563EB" };

      const deptTLs = teamLeads.filter(
        (tl) => (tl.department || "").toLowerCase() === deptName.toLowerCase()
      );
      const deptMembers = individualContributors.filter(
        (m) => (m.department || "").toLowerCase() === deptName.toLowerCase()
      );
      const deptTeams = teams.filter(
        (t) => (t.department || t.teamType || "").toLowerCase() === deptName.toLowerCase()
      );

      return {
        department: deptName,
        meta: deptMeta,
        teamLeads: deptTLs,
        members: deptMembers,
        teams: deptTeams,
        totalCount: deptTLs.length + deptMembers.length,
      };
    });

    return {
      admins,
      managers,
      deptTree,
    };
  }, [users, teams, departments]);

  const filteredDepts = useMemo(() => {
    return hierarchy.deptTree.filter((d) => {
      const matchDept = selectedDept === "all" || d.department.toLowerCase() === selectedDept.toLowerCase();
      const matchSearch =
        search === "" ||
        d.department.toLowerCase().includes(search.toLowerCase()) ||
        d.teamLeads.some((tl) => tl.username?.toLowerCase().includes(search.toLowerCase())) ||
        d.members.some((m) => m.username?.toLowerCase().includes(search.toLowerCase()));
      return matchDept && matchSearch;
    });
  }, [hierarchy, selectedDept, search]);

  const getRoleVariant = (role) => {
    switch (role) {
      case "admin": return "purple";
      case "team_lead": return "blue";
      case "hr": return "amber";
      case "manager": return "purple";
      case "developer": return "green";
      case "caller": return "blue";
      default: return "slate";
    }
  };

  return (
    <div className="space-y-5">
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Organizational Structure & Hierarchy Tree
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Visual organizational mapping of executive leadership, departments, team leads, and direct reporting lines.
          </p>
        </div>
      </div> */}

      {/* Filter & Search Bar */}
      <div className="ent-card p-3 flex flex-col md:flex-row items-center justify-between gap-3 bg-white">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff, designation, or department in hierarchy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ent-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="ent-select text-xs min-w-[150px]"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id || d.name} value={d.name}>
                {d.name} ({d.code || d.name.slice(0, 3)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Level 1: Executive Leadership & Super Admins ────────────────────── */}
      <div className="ent-card p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Executive Leadership & System Governance
            </span>
          </div>
          <Badge variant="blue">Top Level</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {hierarchy.admins.map((adm) => (
            <div
              key={adm._id}
              className="p-3 bg-slate-800/80 border border-slate-700 rounded flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-blue-600 font-bold text-xs flex items-center justify-center text-white shrink-0">
                  {adm.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{adm.username}</div>
                  <div className="text-[10px] text-slate-400">{adm.email}</div>
                  <div className="text-[10px] text-blue-400 font-semibold mt-0.5">
                    {adm.designation || "Super Administrator"}
                  </div>
                </div>
              </div>
              <Badge variant="purple">Admin</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* ── Level 2: Department Branches ────────────────────────────────────── */}
      <div className="space-y-4">
        {loading ? (
          <div className="ent-card p-12 text-center text-slate-400 font-semibold text-xs">
            Mapping organizational hierarchy...
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="ent-card p-8 text-center text-slate-500 text-xs">
            No departments matching search criteria.
          </div>
        ) : (
          filteredDepts.map((d) => {
            const isExpanded = expandedNodes[d.department] !== false;
            return (
              <div key={d.department} className="ent-card overflow-hidden bg-white">
                {/* Department Header Bar */}
                <div
                  onClick={() => toggleNode(d.department)}
                  className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-500">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-blue-600" />
                      <span className="font-bold text-sm text-slate-900">
                        {d.department} Department
                      </span>
                    </div>
                    <Badge variant="slate">{d.totalCount} Staff Members</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{d.teamLeads.length} Team Leads</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{d.members.length} Members</span>
                  </div>
                </div>

                {/* Department Body Tree */}
                {isExpanded && (
                  <div className="p-5 space-y-5">
                    {/* Team Leads (Level 3 in Department) */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Appointed Team Leads / Functional Heads
                      </span>
                      {d.teamLeads.length === 0 ? (
                        <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded text-xs text-slate-400 italic">
                          No dedicated Team Lead assigned to this department yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {d.teamLeads.map((tl) => (
                            <div
                              key={tl._id}
                              className="p-3.5 bg-blue-50/40 border border-blue-200 rounded flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                  {tl.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{tl.username}</div>
                                  <div className="text-[10px] text-blue-700 font-semibold">
                                    {tl.designation || "Team Lead"}
                                  </div>
                                  <div className="text-[10px] text-slate-500">{tl.email}</div>
                                </div>
                              </div>
                              <Badge variant="blue">Team Lead</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Direct Team Members & Juniors (Level 4) */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Functional Team Members & Engineers
                      </span>
                      {d.members.length === 0 ? (
                        <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded text-xs text-slate-400 italic">
                          No team members registered in this unit.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {d.members.map((m) => (
                            <div
                              key={m._id}
                              className="p-3 bg-white border border-slate-200 rounded hover:border-slate-300 transition-all flex flex-col justify-between gap-2"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                                    {m.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900">{m.username}</div>
                                    <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                                      {m.designation || "Staff Specialist"}
                                    </div>
                                  </div>
                                </div>
                                <Badge variant={getRoleVariant(m.role)}>{m.role}</Badge>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                <span className="truncate max-w-[120px]">{m.email}</span>
                                {m.reportingTo?.username ? (
                                  <span className="font-semibold text-slate-700">
                                    TL: {m.reportingTo.username}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Direct</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
