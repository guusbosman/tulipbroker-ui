import { useEffect, useId, useRef, useState } from "react";
import { personas } from "../personas";
import { usePersona } from "../PersonaContext";

type PersonaDropdownProps = {
  variant?: "default" | "header";
};

export function PersonaDropdown({ variant = "default" }: PersonaDropdownProps = {}) {
  const { activePersona, setActivePersona } = usePersona();
  const selectId = useId();
  const isHeader = variant === "header";
  const [expanded, setExpanded] = useState(!isHeader);
  const selectRef = useRef<HTMLSelectElement>(null);
  const personaTooltip = activePersona.bio
    ? `${activePersona.userName}: ${activePersona.bio}`
    : undefined;

  useEffect(() => {
    if (expanded && selectRef.current) {
      selectRef.current.focus({ preventScroll: true });
    }
  }, [expanded]);

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
        <div className="flex items-center gap-3" title={personaTooltip}>
          {activePersona.avatarUrl ? (
            <img
              src={activePersona.avatarUrl}
              alt={`${activePersona.userName} avatar`}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full border border-cream/30 object-cover shadow-card"
              title={personaTooltip}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 text-lg font-semibold uppercase tracking-[0.3em] text-cream/80">
              {avatarFallback}
            </div>
          )}
          <div className="leading-tight" title={personaTooltip}>
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-cream/60">Active user</p>
            <p className="font-display text-sm uppercase tracking-[0.25em] text-cream">
              {activePersona.userName}
            </p>
          </div>
        </div>
      )}
      <div
        className={
          isHeader
            ? expanded
              ? "ml-auto min-w-[11rem]"
              : "ml-auto flex items-center justify-center"
            : undefined
        }
      >
        {isHeader && !expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 bg-navy-900/60 text-cream transition hover:border-cream/60 focus:border-cream focus:outline-none"
            aria-haspopup="listbox"
            aria-expanded="false"
            aria-controls={`${selectId}-menu`}
          >
            <span className="sr-only">Choose persona</span>
            <svg
              aria-hidden="true"
              className="h-3 w-3 text-cream"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        ) : (
          <select
            ref={selectRef}
            id={selectId}
            aria-controls={`${selectId}-menu`}
            className={selectClasses}
            value={activePersona.userId}
            onChange={(e) => {
              const selected = personas.find((p) => p.userId === e.target.value);
              if (selected) {
                setActivePersona(selected);
              }
              if (isHeader) {
                setExpanded(false);
              }
            }}
            onBlur={() => {
              if (isHeader) {
                setExpanded(false);
              }
            }}
          >
            {personas.map((persona) => (
              <option key={persona.userId} value={persona.userId}>
                {persona.userName}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
