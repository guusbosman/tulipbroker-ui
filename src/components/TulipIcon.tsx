type TulipIconProps = {
  className?: string;
  variant?: "red" | "green";
};

export function TulipIcon({ className, variant = "red" }: TulipIconProps) {
  const petalColor = variant === "red" ? "#ff6b6b" : "#5bc489";
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <g fill="none" stroke="none">
        <path
          d="M24 26c-4-5-5-12-5-18 5 1 9 4 13 9 3-5 7-8 12-9 0 6-1 12-5 18 6-2 10-1 13 2-4 9-12 15-20 18-8-3-16-9-20-18 3-3 7-4 12-2Z"
          fill={petalColor}
        />
        <path
          d="M32 44c5 0 12-5 16-12-4-2-8-1-12 1 3-5 4-12 4-18-4 1-7 4-10 9-3-5-6-8-10-9 0 6 1 13 4 18-4-2-8-3-12-1 4 7 11 12 16 12Z"
          fill="rgba(255,255,255,0.15)"
        />
        <path
          d="M32 44v14"
          stroke="#2f9c74"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M32 56c-6-4-10-9-12-16"
          stroke="#2f9c74"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M32 56c6-4 10-9 12-16"
          stroke="#2f9c74"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
