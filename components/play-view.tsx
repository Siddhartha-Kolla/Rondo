"use client";
import { Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
  const canStart = activeCount >= 4 && allDecided;

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

          <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
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

      <div className="flex flex-col gap-1">
        <Button size="lg" className="w-full" disabled={!canStart} onClick={actions.startNextRound}>
          {current ? t("nextRound") : t("startFirstRound")}
        </Button>
        {activeCount >= 4 && !allDecided && <p className="text-muted-foreground">{t("markAllToContinue")}</p>}
      </div>

      {state.rounds.length > 1 && (
        <section className="flex flex-col gap-2 border-t pt-4" aria-labelledby="earlier-rounds">
          <h2 id="earlier-rounds" className="font-medium">
            {t("earlierRounds")}
          </h2>
          <ol className="flex flex-col gap-3">
            {state.rounds
              .slice(0, -1)
              .map((round, i) => ({ round, number: i + 1 }))
              .reverse()
              .map(({ round, number }) => (
                <li key={number} className="flex flex-col gap-1">
                  <p className="text-muted-foreground">{t("round", { n: number })}</p>
                  {round.map((match, index) => (
                    <p key={index} className="flex flex-wrap items-center gap-x-2">
                      <span className="text-muted-foreground">{t("table", { n: index + 1 })}</span>
                      {match.teams.map((team, side) => (
                        <span key={side} className="flex items-center gap-1">
                          {side === 1 && <span className="text-muted-foreground">{t("vs")}</span>}
                          {team.map(name).join(" & ")}
                          {match.winner === side && <Star weight="fill" aria-label={t("stars")} className="size-3.5" />}
                        </span>
                      ))}
                    </p>
                  ))}
                </li>
              ))}
          </ol>
        </section>
      )}
    </div>
  );
}
