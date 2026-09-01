import { useMemo } from "react";
import { Flame } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BuildStreakData, BuildEntry } from "@/types";
import { cn } from "@/lib/utils";

const WEEKS = 18;
const DAY_MS = 86_400_000;

/** ISO date (yyyy-mm-dd) in local time — matches how entries are stored. */
function isoDay(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const LEVEL_CLASS = [
  "bg-muted",
  "bg-primary/30",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
];

interface Props {
  streak: BuildStreakData;
  onSelectDay?: (date: string, entries: BuildEntry[]) => void;
}

/**
 * GitHub-style contribution heatmap for the build streak.
 * Columns are weeks (Sunday-first), the last column being the current week.
 */
export function StreakHeatmap({ streak, onSelectDay }: Props) {
  const { weeks, byDay } = useMemo(() => {
    const map = new Map<string, BuildEntry[]>();
    for (const entry of streak.entries) {
      // Entries may carry a full timestamp; key on the date portion only.
      const key = entry.date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }

    // Walk back to the Sunday that starts the earliest displayed week.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today.getTime() - (WEEKS * 7 - 1) * DAY_MS);
    start.setDate(start.getDate() - start.getDay());

    const cols: { date: string; count: number; future: boolean }[][] = [];
    const cursor = new Date(start);

    for (let w = 0; w < WEEKS; w++) {
      const col: { date: string; count: number; future: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const key = isoDay(cursor);
        col.push({
          date: key,
          count: map.get(key)?.length ?? 0,
          future: cursor.getTime() > today.getTime(),
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      cols.push(col);
    }

    return { weeks: cols, byDay: map };
  }, [streak.entries]);

  const total = streak.entries.length;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Flame className="h-4 w-4 text-orange-400" />
          Build streak
        </h3>
        <p className="text-sm">
          <span className="font-semibold text-orange-400">
            {streak.currentStreak} day
            {streak.currentStreak === 1 ? "" : "s"}
          </span>{" "}
          <span className="text-muted-foreground">
            · longest {streak.longestStreak} · {total} log
            {total === 1 ? "" : "s"}
          </span>
        </p>
      </div>

      <TooltipProvider delayDuration={120}>
        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex gap-[3px]">
            {weeks.map((col, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {col.map((cell) => {
                  const level = Math.min(cell.count, 4);
                  const entries = byDay.get(cell.date) ?? [];
                  return (
                    <Tooltip key={cell.date}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          disabled={cell.future || entries.length === 0}
                          onClick={() => onSelectDay?.(cell.date, entries)}
                          aria-label={`${cell.date}: ${cell.count} build${
                            cell.count === 1 ? "" : "s"
                          }`}
                          className={cn(
                            "h-[13px] w-[13px] rounded-[3px] transition-transform",
                            cell.future
                              ? "bg-transparent"
                              : LEVEL_CLASS[level],
                            entries.length > 0 &&
                              "hover:scale-125 hover:ring-1 hover:ring-primary/50"
                          )}
                        />
                      </TooltipTrigger>
                      {!cell.future && (
                        <TooltipContent side="top" className="max-w-[220px]">
                          <p className="text-xs font-medium">{cell.date}</p>
                          {entries.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Nothing logged
                            </p>
                          ) : (
                            <ul className="mt-0.5 space-y-0.5">
                              {entries.map((e, i) => (
                                <li key={i} className="text-xs">
                                  {e.title}
                                </li>
                              ))}
                            </ul>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        Less
        {LEVEL_CLASS.map((c) => (
          <span key={c} className={cn("h-[11px] w-[11px] rounded-[3px]", c)} />
        ))}
        More
      </div>
    </div>
  );
}
