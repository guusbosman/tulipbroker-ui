import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const personaTooltip = activePersona.bio
    ? `${activePersona.userName}: ${activePersona.bio}`
    : undefined;

  const avatarFallback =
    activePersona.userName?.charAt(0)?.toUpperCase() ??
    activePersona.userId?.charAt(0)?.toUpperCase() ??
    "?";

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setIsMobile(false);
      return;
    }

    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (expanded && selectRef.current) {
      selectRef.current.focus({ preventScroll: true });
    }
  }, [expanded]);

  const containerClasses = isHeader
    ? "flex items-center gap-3 rounded-2xl border border-cream/25 bg-navy-900/70 px-3 py-2 text-cream shadow-[0_12px_35px_rgba(0,0,0,0.4)] sm:px-4"
    : "flex flex-col gap-2";
  const selectClasses = isHeader
    ? "w-full rounded-2xl border border-cream/30 bg-navy-900/80 px-3 py-2 text-[0.75rem] uppercase tracking-[0.2em] text-cream transition focus:border-cream focus:outline-none"
    : "rounded-lg border border-slate-300 px-3 py-2 text-sm";
  const labelClasses = isHeader ? "sr-only" : "text-sm font-medium text-slate-700";
  const mobilePersonaItems = useMemo(
    () =>
      personas.map((persona) => {
        const isSelected = persona.userId === activePersona.userId;
        return (
          <button
            key={persona.userId}
            type="button"
            aria-pressed={isSelected}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-cream/70 ${
              isSelected
                ? "border-cream/50 bg-cream/10 shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
                : "border-cream/10 bg-navy-900/85 hover:border-cream/30"
            }`}
            onClick={() => {
              setActivePersona(persona);
              setIsMobileMenuOpen(false);
            }}
          >
            {persona.avatarUrl ? (
              <img
                src={persona.avatarUrl}
                alt={`${persona.userName} avatar`}
                width={42}
                height={42}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 text-sm font-semibold uppercase tracking-[0.25em] text-cream/80">
                {persona.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="leading-snug">
              <p className="font-display text-sm uppercase tracking-[0.18em] text-cream">{persona.userName}</p>
              {persona.bio ? <p className="text-[0.8rem] text-cream/75">{persona.bio}</p> : null}
            </div>
            {isSelected ? (
              <span className="ml-auto rounded-full bg-cream/15 px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-cream">
                Selected
              </span>
            ) : null}
          </button>
        );
      }),
    [activePersona.userId, setActivePersona],
  );

  return (
    <div className={containerClasses}>
      <label htmlFor={selectId} className={labelClasses}>
        Active user
      </label>
      {isHeader && (
        <div
          className={`flex items-center gap-3 ${isMobile ? "hidden sm:flex" : ""}`}
          title={personaTooltip}
        >
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
            {activePersona.bio ? (
              <p className="text-[0.85rem] text-cream/75">{activePersona.bio}</p>
            ) : null}
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
        {isHeader && isMobile ? (
          <>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 bg-navy-900/70 text-left transition hover:border-cream/50 focus:border-cream focus:outline-none"
              aria-haspopup="dialog"
              aria-expanded={isMobileMenuOpen}
              aria-controls={`${selectId}-mobile-menu`}
            >
              <span className="sr-only">Choose persona</span>
              {activePersona.avatarUrl ? (
                <img
                  src={activePersona.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                  aria-hidden="true"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 text-base font-semibold uppercase tracking-[0.25em] text-cream/80">
                  {avatarFallback}
                </div>
              )}
              <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-cream/40 bg-navy-950 text-cream shadow-card">
                <svg
                  aria-hidden="true"
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            {isMobileMenuOpen && (
              <div
                id={`${selectId}-mobile-menu`}
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
              >
                <button
                  type="button"
                  className="h-full w-full flex-1"
                  aria-label="Close persona selector"
                  onClick={() => setIsMobileMenuOpen(false)}
                  tabIndex={-1}
                />
                <div className="relative z-10 rounded-t-3xl border border-cream/20 bg-navy-950 px-3 pb-5 pt-3 shadow-[0_-12px_30px_rgba(0,0,0,0.35)]">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="leading-tight">
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-cream/60">Choose persona</p>
                      <p className="text-xs text-cream/70">Quickly switch between the test users</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/40 bg-navy-900/85 text-cream transition hover:border-cream/60 focus:border-cream focus:outline-none"
                      aria-label="Close persona menu"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">{mobilePersonaItems}</div>
                </div>
              </div>
            )}
          </>
        ) : isHeader && !expanded ? (
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
