import { Lock } from "lucide-react";

interface LockedDayProps {
  day: number;
  dateKey: string;
  onClick: (dateKey: string) => void;
}

export function LockedDay({ day, dateKey, onClick }: LockedDayProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(dateKey)}
      aria-label={`${dateKey} — locked`}
      title="This day isn't available yet. Come back tomorrow."
      className="flex items-center justify-center rounded-lg p-0.5 transition-colors duration-150 hover:bg-bg2/40"
    >
      <span className="flex h-8 w-8 items-center justify-center gap-0.5 rounded-lg text-sm text-muted/50">
        {day}
        <Lock className="h-2.5 w-2.5 opacity-40" aria-hidden="true" />
      </span>
    </button>
  );
}