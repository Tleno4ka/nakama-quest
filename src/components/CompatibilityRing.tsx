import { ReactNode } from "react";

interface CompatibilityRingProps {
  value: number;
  size?: number;
  children: ReactNode;
}

export default function CompatibilityRing({ value, size = 128, children }: CompatibilityRingProps) {
  const deg = (value / 100) * 360;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) 0deg, hsl(var(--accent)) ${deg}deg, hsl(var(--border)) ${deg}deg 360deg)`,
          padding: 4,
        }}
      >
        <div className="h-full w-full rounded-full bg-card" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>

      {/* Percentage */}
      <div className="absolute -bottom-1 rounded-full bg-card px-2 py-0.5 text-xs font-bold tabular-nums text-primary shadow-card">
        {value}%
      </div>
    </div>
  );
}
