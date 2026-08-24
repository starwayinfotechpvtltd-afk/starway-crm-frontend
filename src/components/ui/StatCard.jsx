import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  variant = "blue", // blue, emerald, amber, indigo, rose
  linkTo,
  linkText,
  subtitle,
}) {
  const borderVariants = {
    blue: "ent-stat-card-blue",
    royal: "ent-stat-card-royal",
    beige: "ent-stat-card-beige",
    emerald: "ent-stat-card-emerald",
    amber: "ent-stat-card-amber",
    indigo: "ent-stat-card-indigo",
    rose: "ent-stat-card-rose",
  };

  const iconColors = {
    blue: "text-blue-600 bg-blue-50",
    royal: "text-[#1E40AF] bg-[#EEF2FF]",
    beige: "text-[#6B5338] bg-[#F5EFE6]",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
    rose: "text-rose-600 bg-rose-50",
  };

  return (
    <div className={`ent-stat-card ${borderVariants[variant] || borderVariants.blue}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight montserrat-extrabold">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded ${iconColors[variant] || iconColors.blue}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend !== undefined && (
          <div
            className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
              trendPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {trendPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trend}</span>
          </div>
        )}

        {linkTo && linkText && (
          <Link
            to={linkTo}
            className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] ml-auto flex items-center gap-0.5 hover:underline"
          >
            {linkText} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
