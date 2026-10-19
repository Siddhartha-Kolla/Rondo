"use client";
import { Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/tournament";

type Props = {
  match: Match;
  name: (id: string) => string;
  label: (team: string) => string; // accessible name of a "this team won" button
  onPick: (winner: 0 | 1) => void;
};

// A vertical table: team A plays on the top half, team B on the bottom half.
// Each half is one button ("this team won") made of two player quarters.
export function TableGraphic({ match, name, label, onPick }: Props) {
  return (
    <div className="aspect-[4/5] w-full bg-table-blue p-1.5 text-table-blue-foreground">
      <div className="grid h-full grid-rows-[1fr_auto_1fr] border border-white/80">
        {match.teams.map((team, index) => {
          const side = index as 0 | 1;
          const decided = match.winner !== null;
          const won = match.winner === side;
          const names = team.map(name);
          const half = (
            <button
              key={side}
              type="button"
              aria-pressed={won}
              aria-label={label(names.join(" & "))}
              onClick={() => onPick(side)}
              className={cn(
                "relative grid grid-cols-2 divide-x divide-white/80 text-xs outline-none transition-colors hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-inset",
                decided && !won && "bg-black/40",
              )}
            >
              {names.map((n, i) => (
                <span key={i} className="flex items-center justify-center px-1 text-center break-words">
                  {n}
                </span>
              ))}
              {won && (
                <Star
                  weight="fill"
                  aria-hidden
                  className={cn("absolute left-1/2 size-4 -translate-x-1/2", side === 0 ? "top-1" : "bottom-1")}
                />
              )}
            </button>
          );
          // the net sits between the two halves
          return side === 0 ? [half, <div key="net" className="h-px bg-white" />] : half;
        })}
      </div>
    </div>
  );
}
