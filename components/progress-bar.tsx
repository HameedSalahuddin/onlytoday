export function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  if (total === 0) {
    return <p className="text-sm text-muted">0 tasks today</p>;
  }

  const percent = Math.round((completed / total) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-text2">
          {completed} / {total} completed
        </span>
        <span className="text-sm font-medium text-text">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Daily completion"
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg2"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}