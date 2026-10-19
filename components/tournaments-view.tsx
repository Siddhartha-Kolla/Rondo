"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import type { CloudTournament } from "@/lib/cloud";
import type { State } from "@/lib/repository";

function Entry({ item, state, current }: { item: CloudTournament; state: Partial<State>; current: boolean }) {
  const { cloud, actions, t } = useApp();
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const finished = state.finished === true;
  const summary = t("tournamentSummary", { players: state.players?.length ?? 0, rounds: state.rounds?.length ?? 0 });
  const date = new Date(item.updatedAt).toLocaleDateString();

  return (
    <li className={cn("flex flex-col gap-2 border p-3", current && "border-l-table-blue")}>
      {renaming ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) cloud.rename(item.id, draft.trim());
            setRenaming(false);
          }}
        >
          <Input value={draft} maxLength={80} aria-label={t("tournamentName")} autoFocus onChange={(e) => setDraft(e.target.value)} />
          <Button type="submit">{t("save")}</Button>
          <Button type="button" variant="outline" onClick={() => setRenaming(false)}>
            {t("cancel")}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="font-medium [overflow-wrap:anywhere]">{item.name}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
            {current && (
              <span className="flex items-center gap-1 text-foreground">
                <span aria-hidden className="size-2 bg-table-blue" />
                {t("currentTournament")}
              </span>
            )}
            <span>{date}</span>
            <span>{summary}</span>
          </p>
        </div>
      )}

      {confirmDelete ? (
        <div className="flex flex-col gap-2">
          <p>{t("deleteConfirm")}</p>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={() => cloud.remove(item.id)}>
              {t("deleteTournament")}
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {!current && <Button onClick={() => cloud.open(item.id)}>{t("openTournament")}</Button>}
          {current && (
            <Button variant="outline" onClick={() => actions.setFinished(!finished)}>
              {finished ? t("reopen") : t("markFinished")}
            </Button>
          )}
          <Button variant="outline" onClick={() => setRenaming(true)}>
            {t("rename")}
          </Button>
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
            {t("deleteTournament")}
          </Button>
        </div>
      )}
    </li>
  );
}

export function TournamentsView() {
  const { state, cloud, t } = useApp();
  const [name, setName] = useState("");

  // Fresh list every time this tab opens
  const { refreshList } = cloud;
  useEffect(() => {
    Promise.resolve().then(refreshList);
  }, [refreshList]);

  // The open tournament shows what is on screen right now, the others what was last saved
  const items = cloud.list.map((item) => ({
    item,
    state: item.id === cloud.currentId ? state : item.state,
    current: item.id === cloud.currentId,
  }));
  const running = items.filter((i) => i.state.finished !== true);
  const done = items.filter((i) => i.state.finished === true);

  const group = (title: string, rows: typeof items) =>
    rows.length > 0 && (
      <section className="flex flex-col gap-2" aria-label={title}>
        <h3 className="font-medium">{title}</h3>
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <Entry key={row.item.id} item={row.item} state={row.state} current={row.current} />
          ))}
        </ul>
      </section>
    );

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          cloud.createNew(name);
          setName("");
        }}
      >
        <Label htmlFor="new-tournament">{t("newTournament")}</Label>
        <div className="flex gap-2">
          <Input id="new-tournament" value={name} maxLength={80} autoComplete="off" onChange={(e) => setName(e.target.value)} />
          <Button type="submit">{t("create")}</Button>
        </div>
      </form>

      <h2 className="font-medium">{t("yourTournaments")}</h2>
      {items.length === 0 && <p className="text-muted-foreground">{t("noTournaments")}</p>}
      {group(t("inProgress"), running)}
      {group(t("finished"), done)}
    </div>
  );
}
