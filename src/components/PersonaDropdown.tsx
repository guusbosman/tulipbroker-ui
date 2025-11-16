import React, { useId } from "react";
import { personas } from "../personas";
import { usePersona } from "../PersonaContext";

type PersonaDropdownProps = {
  variant?: "default" | "header";
};

export function PersonaDropdown({ variant = "default" }: PersonaDropdownProps = {}) {
  const { activePersona, setActivePersona } = usePersona();
  const selectId = useId();
  const isHeader = variant === "header";

  const containerClasses = isHeader
    ? "flex items-center gap-3 rounded-2xl border border-cream/25 bg-navy-900/70 px-4 py-2 text-cream shadow-[0_12px_35px_rgba(0,0,0,0.4)]"
    : "flex flex-col gap-2";
  const selectClasses = isHeader
    ? "w-full rounded-2xl border border-cream/30 bg-navy-900/80 px-3 py-2 text-[0.75rem] uppercase tracking-[0.2em] text-cream transition focus:border-cream focus:outline-none"
    : "rounded-lg border border-slate-300 px-3 py-2 text-sm";
  const labelClasses = isHeader ? "sr-only" : "text-sm font-medium text-slate-700";
  const avatarFallback =
    activePersona.userName?.charAt(0)?.toUpperCase() ??
    activePersona.userId?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <div className={containerClasses}>
      <label htmlFor={selectId} className={labelClasses}>
        Active user
      </label>
      {isHeader && (
        <div className="flex items-center gap-3">
          {activePersona.avatarUrl ? (
            <img
              src={activePersona.avatarUrl}
              alt={`${activePersona.userName} avatar`}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full border border-cream/30 object-cover shadow-card"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 text-lg font-semibold uppercase tracking-[0.3em] text-cream/80">
              {avatarFallback}
            </div>
          )}
          <div className="leading-tight">
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-cream/60">Active persona</p>
            <p className="font-display text-sm uppercase tracking-[0.25em] text-cream">
              {activePersona.userName}
            </p>
          </div>
        </div>
      )}
      <div className={isHeader ? "ml-auto min-w-[11rem]" : undefined}>
        <select
          id={selectId}
          className={selectClasses}
          value={activePersona.userId}
          onChange={(e) => {
            const selected = personas.find((p) => p.userId === e.target.value);
            if (selected) {
              setActivePersona(selected);
            }
          }}
        >
          {personas.map((persona) => (
            <option key={persona.userId} value={persona.userId}>
              {persona.userName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
