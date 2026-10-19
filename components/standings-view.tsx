"use client";
import { Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useApp, useNames } from "@/lib/store";
import { standings } from "@/lib/tournament";

const CELLS = 10;

// Ten square cells, filled in proportion to the leader's stars
function Bar({ value, max }: { value: number; max: number }) {
  const filled = max === 0 ? 0 : Math.round((value / max) * CELLS);
  return (
    <span aria-hidden className="flex gap-px">
      {Array.from({ length: CELLS }, (_, i) => (
        <span key={i} className={cn("h-1.5 w-2", i < filled ? "bg-foreground" : "bg-muted")} />
      ))}
    </span>
  );
}

export function StandingsView() {
  const { state, t } = useApp();
  const name = useNames();
  const rows = standings(
    state.players.map((p) => p.id),
    state.rounds,
  ).filter((row) => row.games > 0 || state.players.find((p) => p.id === row.id)?.active);
  const max = rows[0]?.stars ?? 0;

  if (rows.length === 0 || state.rounds.length === 0) {
    return <p className="text-muted-foreground">{t("noGamesYet")}</p>;
  }

  return (
    <table className="w-full border-collapse text-left tabular-nums">
      <thead>
        <tr className="border-b text-muted-foreground">
          <th scope="col" className="py-2 pr-2 font-medium">{t("rank")}</th>
          <th scope="col" className="py-2 pr-2 font-medium">{t("player")}</th>
          <th scope="col" className="py-2 pr-2 text-right font-medium">{t("stars")}</th>
          <th scope="col" className="py-2 pr-2 text-right font-medium">{t("games")}</th>
          <th scope="col" className="py-2 text-right font-medium">{t("streak")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const leader = index === 0 && row.stars > 0;
          return (
            <tr key={row.id} className="border-b">
              <td className={cn("border-l py-2 pr-2 pl-2", leader ? "border-l-table-blue" : "border-l-transparent")}>
                {String(index + 1).padStart(2, "0")}
              </td>
              <td className="py-2 pr-2">
                <div className="flex flex-col gap-1">
                  <span className={cn(leader && "font-medium")}>{name(row.id)}</span>
                  <Bar value={row.stars} max={max} />
                </div>
              </td>
              <td className="py-2 pr-2 text-right">
                <span className="inline-flex items-center gap-1">
                  <Star weight="fill" aria-hidden className={cn("size-3.5", leader && "text-table-blue")} />
                  {row.stars}
                </span>
              </td>
              <td className="py-2 pr-2 text-right">{row.games}</td>
              <td className="py-2 text-right">{row.streak}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
