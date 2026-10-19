"use client";
import { Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TableGraphic } from "@/components/table-graphic";
import { useApp, useNames } from "@/lib/store";
import { playersOf, type Round } from "@/lib/tournament";

export function PlayView() {
  const { state, actions, t } = useApp();
  const name = useNames();
  const activeCount = state.players.filter((p) => p.active).length;
  const current = state.rounds.at(-1);
  const decided = current ? current.filter((m) => m.winner !== null).length : 0;
  const allDecided = current ? decided === current.length : true;
  const canStart = activeCount >= 4 && allDecided && !state.finished;

  const sittingOut = (round: Round) => {
    const playing = playersOf(round);
    return state.players.filter((p) => !playing.includes(p.id) && (p.active || round === current)).map((p) => p.name);
  };

  return (
    <div className="flex flex-col gap-4">
      {activeCount < 4 && <p className="text-muted-foreground">{t("needPlayers")}</p>}

      {current && (
        <section className="flex flex-col gap-3" aria-labelledby="current-round">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="current-round" className="font-medium">
              {t("round", { n: state.rounds.length })}
            </h2>
            <p className="text-muted-foreground">{t("decided", { done: decided, total: current.length })}</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
            {current.map((match, index) => (
              <div key={index} className="flex flex-col gap-1">
                <p className="font-medium">{t("table", { n: index + 1 })}</p>
                <TableGraphic
                  match={match}
                  name={name}
                  label={(team) => t("winnerPick", { team })}
                  onPick={(w) => actions.setWinner(index, match.winner === w ? null : w)}
                />
              </div>
            ))}
          </div>

          <p className="text-muted-foreground">
            {t("sittingOut")}: {sittingOut(current).join(", ") || t("nobody")}
          </p>
        </section>
      )}

      {state.finished && <p className="text-muted-foreground">{t("finished")}</p>}
      <Button size="lg" className="w-full" disabled={!canStart} onClick={actions.startNextRound}>
        {current ? t("nextRound") : t("startFirstRound")}
      </Button>

      {state.rounds.length > 1 && (
        <section className="flex flex-col gap-4 border-t pt-4" aria-labelledby="earlier-rounds">
          <h2 id="earlier-rounds" className="font-medium">
            {t("earlierRounds")}
          </h2>
          {state.rounds
            .slice(0, -1)
            .map((round, i) => ({ round, number: i + 1 }))
            .reverse()
            .map(({ round, number }) => (
              <details key={number}>
                <summary className="flex cursor-pointer items-baseline justify-between gap-4 border px-3 py-2 text-sm font-medium outline-none select-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring">
                  <span>{t("round", { n: number })}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {t("resultsCount", { done: round.filter((m) => m.winner !== null).length, total: round.length })}
                  </span>
                </summary>
                <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-2">
                  {round.map((match, index) => (
                    <div key={index} className="flex flex-col border">
                      <p className="border-b px-3 py-1.5 text-muted-foreground">{t("table", { n: index + 1 })}</p>
                      {match.teams.map((team, side) => {
                        const won = match.winner === side;
                        return (
                          <p
                            key={side}
                            className={cn(
                              "flex items-start gap-2 px-3 py-2 text-sm break-words",
                              side === 1 && "border-t",
                              won ? "bg-muted font-medium" : "text-muted-foreground",
                            )}
                          >
                            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                              {won && <Star weight="fill" aria-label={t("winnerOfMatch")} className="size-4" />}
                            </span>
                            <span className="min-w-0">{team.map(name).join(" & ")}</span>
                          </p>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-muted-foreground">
                  {t("sittingOut")}: {sittingOut(round).join(", ") || t("nobody")}
                </p>
              </details>
            ))}
        </section>
      )}
    </div>
  );
}
