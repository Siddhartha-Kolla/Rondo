"use client";
import { Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useApp, useNames } from "@/lib/store";
import { standings, type Standing } from "@/lib/tournament";

const CELLS = 10;

// Ten square cells, filled in proportion to the leader's stars. Hover or focus explains it.
function Bar({ value, max, large }: { value: number; max: number; large?: boolean }) {
  const { t } = useApp();
  const filled = max === 0 ? 0 : Math.round((value / max) * CELLS);
  const tip = t("tipBar", { stars: value, max });
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span tabIndex={0} role="img" aria-label={tip} className="flex w-fit gap-px outline-none focus-visible:ring-1 focus-visible:ring-ring" />}
      >
        {Array.from({ length: CELLS }, (_, i) => (
          <span key={i} className={cn(large ? "h-2.5 w-4" : "h-1.5 w-2", i < filled ? "bg-foreground" : "bg-muted")} />
        ))}
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}

// Everyone who is present or has played, best first. max = the leader's stars.
export function useStandingRows(): { rows: Standing[]; max: number; hasRounds: boolean } {
  const { state } = useApp();
  const rows = standings(
    state.players.map((p) => p.id),
    state.rounds,
  ).filter((row) => row.games > 0 || state.players.find((p) => p.id === row.id)?.active);
  return { rows, max: rows[0]?.stars ?? 0, hasRounds: state.rounds.length > 0 };
}

type TableProps = { rows: Standing[]; max: number; startRank?: number; large?: boolean };

export function StandingsTable({ rows, max, startRank = 0, large }: TableProps) {
  const { t } = useApp();
  const name = useNames();
  const cell = large ? "py-[1.2vh] pr-[1.5vw]" : "py-2 pr-2";

  return (
    <table className={cn("w-full border-collapse text-left tabular-nums", large && "text-[clamp(1rem,2.6vh,2.5rem)]")}>
      <thead>
        <tr className="border-b text-muted-foreground">
          <th scope="col" className={cn(cell, "pl-2 font-medium")}>{t("rank")}</th>
          <th scope="col" className={cn(cell, "font-medium")}>{t("player")}</th>
          <th scope="col" className={cn(cell, "text-right font-medium")}>{t("stars")}</th>
          <th scope="col" className={cn(cell, "text-right font-medium")}>{t("games")}</th>
          <th scope="col" className={cn(cell, "text-right font-medium", large && "pr-0")}>{t("streak")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const rank = startRank + i;
          const leader = rank === 0 && row.stars > 0;
          return (
            <tr key={row.id} className="border-b">
              <td className={cn("border-l pl-2", cell, leader ? "border-l-table-blue" : "border-l-transparent")}>
                {String(rank + 1).padStart(2, "0")}
              </td>
              <td className={cn(cell, "min-w-0")}>
                <div className="flex flex-col gap-1">
                  <span className={cn("[overflow-wrap:anywhere]", leader && "font-medium")}>{name(row.id)}</span>
                  <Bar value={row.stars} max={max} large={large} />
                </div>
              </td>
              <td className={cn(cell, "text-right")}>
                <span className="inline-flex items-center gap-1">
                  <Star weight="fill" aria-hidden className={cn(large ? "size-[1em]" : "size-3.5", leader && "text-table-blue")} />
                  {row.stars}
                </span>
              </td>
              <td className={cn(cell, "text-right")}>{row.games}</td>
              <td className={cn(cell, "text-right", large && "pr-0")}>{row.streak}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function StandingsView() {
  const { t } = useApp();
  const { rows, max, hasRounds } = useStandingRows();

  if (rows.length === 0 || !hasRounds) {
    return <p className="text-muted-foreground">{t("noGamesYet")}</p>;
  }
  return <StandingsTable rows={rows} max={max} />;
}
