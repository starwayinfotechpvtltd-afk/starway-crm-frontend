import React from "react";

export default function Badge({ children, variant = "blue", className = "" }) {
  const variantClasses = {
    blue: "ent-badge-blue",
    beige: "ent-badge-beige",
    green: "ent-badge-green",
    amber: "ent-badge-amber",
    red: "ent-badge-red",
    purple: "ent-badge-purple",
    slate: "ent-badge-slate",
  };

  return (
    <span className={`ent-badge ${variantClasses[variant] || variantClasses.slate} ${className}`}>
      {children}
    </span>
  );
}
