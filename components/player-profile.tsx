"use client";
import { Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PlayerTile } from "@/components/player-tile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useApp, useNames } from "@/lib/store";
import { cn } from "@/lib/utils";
import { playerHistory, type FormCell, type PairRecord } from "@/lib/tournament";

const cellStyle: Record<FormCell, string> = {
  win: "bg-foreground",
  loss: "border border-foreground",
  sat: "bg-muted",
  pending: "border border-dashed border-muted-foreground",
};
const cellKey = { win: "formWin", loss: "formLoss", sat: "formSat", pending: "formPending" } as const;

function Pairs({ title, rows, never, neverTitle }: { title: string; rows: PairRecord[]; never: string[]; neverTitle: string }) {
  const { t } = useApp();
  const name = useNames();
  return (
    <section className="flex flex-col gap-2" aria-label={title}>
      <h3 className="font-medium">{title}</h3>
      {rows.length > 0 && (
        <ul className="flex flex-col border">
          {rows.map((row, i) => (
            <li key={row.id} className={cn("flex items-baseline justify-between gap-4 px-3 py-2", i > 0 && "border-t")}>
              <span className="min-w-0 [overflow-wrap:anywhere]">{name(row.id)}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {t("gamesWins", { games: row.games, wins: row.wins })}
              </span>
            </li>
          ))}
        </ul>
      )}
      {never.length > 0 && (
        <p className="text-muted-foreground [overflow-wrap:anywhere]">
          {neverTitle}: {never.map(name).join(", ")}
        </p>
      )}
    </section>
  );
}

export function PlayerProfile({ playerId, onBack }: { playerId: string; onBack: () => void }) {
  const { state, t } = useApp();
  const name = useNames();
  const others = state.players.filter((p) => p.active && p.id !== playerId).map((p) => p.id);
  const h = playerHistory(playerId, others, state.rounds);
  const rate = h.games === 0 ? "-" : `${Math.round((h.stars / h.games) * 100)}%`;
  const firstFormRound = state.rounds.length - h.form.length + 1;

  const summary: [string, string | number][] = [
    [t("stars"), h.stars],
    [t("games"), h.games],
    [t("winRate"), rate],
    [t("streak"), h.streak],
    [t("bestStreak"), h.bestStreak],
    [t("satOut"), h.sat],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onBack}>
          {t("back")}
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <PlayerTile name={name(playerId)} />
          <h2 className="min-w-0 text-sm font-medium [overflow-wrap:anywhere]">{name(playerId)}</h2>
        </div>
      </div>

      {h.games === 0 && h.log.length === 0 ? (
        <p className="text-muted-foreground">{t("noHistory")}</p>
      ) : (
        <>
          <dl className="flex flex-col border tabular-nums">
            {summary.map(([label, value], i) => (
              <div key={label} className={cn("flex items-baseline justify-between gap-4 px-3 py-2", i > 0 && "border-t")}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="flex items-center gap-1 font-medium">
                  {i === 0 && <Star weight="fill" aria-hidden className="size-3.5 text-(--star)" />}
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <section className="flex flex-col gap-2" aria-label={t("form")}>
            <h3 className="font-medium">{t("form")}</h3>
            <div className="flex gap-1">
              {h.form.map((cell, i) => {
                const tip = t(cellKey[cell], { n: firstFormRound + i });
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          role="img"
                          aria-label={tip}
                          className={cn("size-4 outline-none focus-visible:ring-1 focus-visible:ring-ring", cellStyle[cell])}
                        />
                      }
                    />
                    <TooltipContent>{tip}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </section>

          <Pairs title={t("partners")} rows={h.partners} never={h.neverPartnered} neverTitle={t("neverPartnered")} />
          <Pairs title={t("opponents")} rows={h.opponents} never={h.neverFaced} neverTitle={t("neverFaced")} />

          <section className="flex flex-col gap-2" aria-label={t("matchLog")}>
            <h3 className="font-medium">{t("matchLog")}</h3>
            <ol className="flex flex-col border">
              {h.log.map((entry, i) => (
                <li key={entry.round} className={cn("flex items-start gap-3 px-3 py-2", i > 0 && "border-t", entry.won ? "bg-muted" : "")}>
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    {entry.won && <Star weight="fill" aria-label={t("winnerOfMatch")} className="size-4 text-(--star)" />}
                  </span>
                  <div className="min-w-0 [overflow-wrap:anywhere]">
                    <p className="text-muted-foreground">
                      {t("round", { n: entry.round })}, {t("table", { n: entry.table })}
                    </p>
                    <p className={cn(entry.won === false && "text-muted-foreground")}>
                      {t("withPartner", { name: name(entry.partner) })}
                    </p>
                    <p className="text-muted-foreground">
                      {t("againstOpponents", { names: entry.opponents.map(name).join(" & ") })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
