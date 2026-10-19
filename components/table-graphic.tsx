"use client";
import { Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/tournament";

type Props = {
  match: Match;
  name: (id: string) => string;
  label?: (team: string) => string; // accessible name of a "this team won" button
  onPick?: (winner: 0 | 1) => void; // leave out for a read-only table (the display window)
  large?: boolean;
};

function Net() {
  return (
    <div aria-hidden className="relative z-10 -mx-2.5 flex h-2 items-stretch">
      <span className="w-1.5 bg-white" />
      <span className="flex-1 border-y border-white bg-white/25" />
      <span className="w-1.5 bg-white" />
    </div>
  );
}

// A vertical table: team A plays on the top half, team B on the bottom half.
// Each half is one button ("this team won") made of two player quarters.
export function TableGraphic({ match, name, label, onPick, large }: Props) {
  const interactive = onPick !== undefined;
  const Half = interactive ? "button" : "div";

  return (
    <div
      className={cn(
        "aspect-[2/3] w-full bg-table-blue p-1.5 text-table-blue-foreground",
        !large && "max-w-64",
        large ? "text-[clamp(0.875rem,2.2vh,2rem)]" : "text-xs",
      )}
    >
      <div className="grid h-full grid-rows-[1fr_auto_1fr] border border-white/80">
        {match.teams.map((team, index) => {
          const side = index as 0 | 1;
          const decided = match.winner !== null;
          const won = match.winner === side;
          const names = team.map(name);
          const half = (
            <Half
              key={side}
              {...(interactive
                ? {
                    type: "button" as const,
                    "aria-pressed": won,
                    "aria-label": label?.(names.join(" & ")),
                    onClick: () => onPick(side),
                  }
                : {})}
              className={cn(
                "relative grid grid-cols-2 divide-x divide-white/80 outline-none transition-colors",
                interactive && "hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-inset",
                decided && !won && "bg-black/40",
              )}
            >
              {names.map((n, i) => (
                <span key={i} className="flex min-w-0 items-center justify-center px-1 text-center text-balance hyphens-auto [overflow-wrap:anywhere]">
                  {n}
                </span>
              ))}
              {won && (
                <Star
                  weight="fill"
                  aria-hidden
                  className={cn("star-pop absolute left-1/2 -translate-x-1/2 text-(--star-table)", large ? "size-[1.4em]" : "size-4", side === 0 ? "top-1" : "bottom-1")}
                />
              )}
            </Half>
          );
          // the net sits between the two halves; its posts stick out past the table edge
          return side === 0 ? [half, <Net key="net" />] : half;
        })}
      </div>
    </div>
  );
}
