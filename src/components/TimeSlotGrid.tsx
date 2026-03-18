import { useState } from "react";

const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const hours = Array.from({ length: 24 }, (_, i) => i);

interface TimeSlotGridProps {
  value: Record<string, number[]>;
  onChange: (value: Record<string, number[]>) => void;
}

export default function TimeSlotGrid({ value, onChange }: TimeSlotGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");

  const isSelected = (day: string, hour: number) =>
    value[day]?.includes(hour) ?? false;

  const toggle = (day: string, hour: number, forceMode?: "add" | "remove") => {
    const mode = forceMode ?? (isSelected(day, hour) ? "remove" : "add");
    const current = value[day] ?? [];
    const updated =
      mode === "add"
        ? [...new Set([...current, hour])].sort((a, b) => a - b)
        : current.filter((h) => h !== hour);
    onChange({ ...value, [day]: updated });
  };

  const handleMouseDown = (day: string, hour: number) => {
    const mode = isSelected(day, hour) ? "remove" : "add";
    setDragMode(mode);
    setIsDragging(true);
    toggle(day, hour, mode);
  };

  const handleMouseEnter = (day: string, hour: number) => {
    if (isDragging) toggle(day, hour, dragMode);
  };

  const handleMouseUp = () => setIsDragging(false);

  const formatHour = (h: number) => `${String(h).padStart(2, "0")}`;

  return (
    <div
      className="select-none overflow-x-auto rounded-xl bg-background p-3 shadow-card"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="grid" style={{ gridTemplateColumns: `40px repeat(24, 1fr)` }}>
        {/* Header row */}
        <div />
        {hours.map((h) => (
          <div
            key={h}
            className="text-center text-[10px] font-medium text-muted-foreground pb-1"
          >
            {formatHour(h)}
          </div>
        ))}

        {/* Day rows */}
        {days.map((day) => (
          <>
            <div
              key={`label-${day}`}
              className="flex items-center text-xs font-semibold text-muted-foreground pr-2"
            >
              {day}
            </div>
            {hours.map((hour) => (
              <div
                key={`${day}-${hour}`}
                onMouseDown={() => handleMouseDown(day, hour)}
                onMouseEnter={() => handleMouseEnter(day, hour)}
                className={`h-6 border border-border/50 cursor-pointer transition-colors ${
                  isSelected(day, hour)
                    ? "bg-primary/80"
                    : "bg-secondary hover:bg-secondary/60"
                }`}
              />
            ))}
          </>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground text-center">
        Кликай и перетаскивай для выбора временных слотов
      </p>
    </div>
  );
}
