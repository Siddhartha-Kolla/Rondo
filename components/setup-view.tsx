"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudSection } from "@/components/cloud-section";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import { standings } from "@/lib/tournament";

export function SetupView() {
  const { state, actions, t } = useApp();
  const [draft, setDraft] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const activeCount = state.players.filter((p) => p.active).length;
  const gamesOf = new Map(
    standings(
      state.players.map((p) => p.id),
      state.rounds,
    ).map((row) => [row.id, row.games]),
  );
  // a player who sits in the current round cannot be deleted either, or the table would lose a name
  const inRounds = new Set(state.rounds.flat().flatMap((m) => m.teams.flat()));

  const add = () => {
    actions.addPlayers(draft.split(","));
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2" aria-labelledby="players-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="players-heading" className="font-medium">
            {t("players")}
          </h2>
          <p className="text-muted-foreground">{t("activeCount", { n: activeCount })}</p>
        </div>

        <form
          className="flex flex-col gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Label htmlFor="new-players">{t("addPlayers")}</Label>
          <div className="flex gap-2">
            <Input id="new-players" maxLength={200} value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="off" />
            <Button type="submit" disabled={!draft.trim()}>
              {t("add")}
            </Button>
          </div>
          <p className="text-muted-foreground">{t("addPlayersHint")}</p>
        </form>

        <ul className="flex flex-col gap-2">
          {state.players.map((player, index) => {
            const locked = inRounds.has(player.id) || (gamesOf.get(player.id) ?? 0) > 0;
            return (
              <li key={player.id} className="flex items-center gap-2">
                <Input
                  value={player.name}
                  aria-label={t("nameOf", { n: index + 1 })}
                  maxLength={40}
                  onChange={(e) => actions.renamePlayer(player.id, e.target.value)}
                />
                <Button
                  variant={player.active ? "default" : "outline"}
                  aria-pressed={player.active}
                  className="w-24"
                  onClick={() => actions.setActive(player.id, !player.active)}
                >
                  {player.active ? t("active") : t("inactive")}
                </Button>
                <Button
                  variant="ghost"
                  disabled={locked}
                  title={locked ? t("removeLocked") : undefined}
                  onClick={() => actions.removePlayer(player.id)}
                >
                  {t("remove")}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-1 border-t pt-4" aria-labelledby="tables-heading">
        <Label htmlFor="tables-count" id="tables-heading" className="font-medium">
          {t("tables")}
        </Label>
        <Input
          id="tables-count"
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          value={state.tables}
          onChange={(e) => actions.setTables(Number(e.target.value))}
          className="w-24"
        />
        <p className="text-muted-foreground">{t("tablesHint")}</p>
      </section>

      <CloudSection />

      {state.rounds.length > 0 && (
        <section className="flex flex-col gap-2 border-t pt-4">
          {confirmReset ? (
            <>
              <p>{t("resetConfirm")}</p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    actions.reset();
                    setConfirmReset(false);
                  }}
                >
                  {t("confirm")}
                </Button>
                <Button variant="outline" onClick={() => setConfirmReset(false)}>
                  {t("cancel")}
                </Button>
              </div>
            </>
          ) : (
            <Button variant="outline" className="self-start" onClick={() => setConfirmReset(true)}>
              {t("resetTournament")}
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
