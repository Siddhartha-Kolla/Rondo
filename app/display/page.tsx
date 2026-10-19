"use client"
import { useCallback, useEffect, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StandingsTable, useStandingRows } from "@/components/standings-view";
import { TableGraphic } from "@/components/table-graphic";
import { AppProvider, useApp, useNames } from "@/lib/store";
import { formatTime } from "@/components/save-status";
import { playersOf } from "@/lib/tournament";

const SLIDE_SECONDS = 15;
const ROWS_PER_PAGE = 8;

// Read-only screen for a monitor: standings pages and the current round take turns.
function Display() {
  const { state, ready, shared, t } = useApp();
  const name = useNames();
  const { rows, max } = useStandingRows();
  const current = state.rounds.at(-1);

  const pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const slideCount = pageCount + (current ? 1 : 0);
  const roundSlide = pageCount; // the slide after the last standings page

  const [index, setIndex] = useState(0);
  const [seenRounds, setSeenRounds] = useState(state.rounds.length);
  // A new round started in the main window: show it right away
  if (seenRounds !== state.rounds.length) {
    setSeenRounds(state.rounds.length);
    if (current) setIndex(roundSlide);
  }

  // The automatic rhythm never changes: every 15 seconds it moves on by itself, whatever was clicked in between
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => i + 1), SLIDE_SECONDS * 1000);
    return () => clearInterval(timer);
  }, []);

  // Go to the previous or next page right away (wraps around)
  const go = useCallback(
    (step: number) => setIndex((i) => (((i % slideCount) + step) % slideCount + slideCount) % slideCount),
    [slideCount],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!ready) return null;

  const slide = index % slideCount;
  const showRound = current !== undefined && slide === roundSlide;
  const decided = current ? current.filter((m) => m.winner !== null).length : 0;
  const playing = current ? playersOf(current) : [];
  const sitting = state.players.filter((p) => p.active && !playing.includes(p.id)).map((p) => p.name);

  return (
    <main className="flex h-screen flex-col gap-[2vh] overflow-hidden p-[2.5vh] text-[clamp(1rem,2.4vh,2rem)]">
      <header className="flex items-center gap-[1.5vw]">
        <h1 className="font-medium">{t("appName")}</h1>
        {state.rounds.length > 0 && (
          <p className="text-muted-foreground">{t("round", { n: state.rounds.length })}</p>
        )}
        <p className="ml-auto flex items-center gap-2 text-muted-foreground tabular-nums">
          <span aria-hidden className={shared.offline ? "size-[0.6em] bg-muted-foreground" : "size-[0.6em] bg-table-blue"} />
          {shared.offline ? t("displayOffline") : t("live")}
          {shared.updatedAt && <span>{t("updatedAt", { time: formatTime(shared.updatedAt, true) })}</span>}
        </p>
        {slideCount > 1 && (
          <div className="flex items-center gap-2">
            <Button size="icon-sm" variant="outline" aria-label={t("previousSlide")} title={t("previousSlide")} onClick={() => go(-1)}>
              <CaretLeft aria-hidden />
            </Button>
            <span className="font-mono text-muted-foreground tabular-nums">
              {slide + 1}/{slideCount}
            </span>
            <Button size="icon-sm" variant="outline" aria-label={t("nextSlide")} title={t("nextSlide")} onClick={() => go(1)}>
              <CaretRight aria-hidden />
            </Button>
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
          }
        >
          {t("fullscreen")}
        </Button>
      </header>

      <section className="min-h-0 flex-1" aria-live="polite">
        {showRound && current ? (
          <div className="flex h-full flex-col gap-[2vh]">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-medium">{t("round", { n: state.rounds.length })}</h2>
              <p className="text-muted-foreground">{t("decided", { done: decided, total: current.length })}</p>
            </div>
            <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fit,minmax(min(14rem,100%),1fr))] content-start gap-[2vh]">
              {current.map((match, i) => (
                <div key={i} className="flex min-w-0 flex-col gap-1">
                  <p className="font-medium">{t("table", { n: i + 1 })}</p>
                  <div className="mx-auto w-full max-w-[min(100%,30vh)]">
                    <TableGraphic match={match} name={name} large />
                  </div>
                </div>
              ))}
            </div>
            {sitting.length > 0 && (
              <p className="text-muted-foreground">
                {t("sittingOut")}: {sitting.join(", ")}
              </p>
            )}
          </div>
        ) : rows.length === 0 || state.rounds.length === 0 ? (
          <p className="text-muted-foreground">{t("noGamesYet")}</p>
        ) : (
          <div className="flex flex-col gap-[1vh]">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-medium">{t("tabStandings")}</h2>
              {pageCount > 1 && (
                <p className="text-muted-foreground tabular-nums">
                  {slide + 1} / {pageCount}
                </p>
              )}
            </div>
            <StandingsTable
              rows={rows.slice(slide * ROWS_PER_PAGE, (slide + 1) * ROWS_PER_PAGE)}
              max={max}
              startRank={slide * ROWS_PER_PAGE}
              large
            />
          </div>
        )}
      </section>
    </main>
  );
}

export default function DisplayPage() {
  // ?t=<share id> shows an online tournament; without it the display follows this browser's own data
  const [shareId, setShareId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    Promise.resolve().then(() => setShareId(new URLSearchParams(window.location.search).get("t")));
  }, []);
  if (shareId === undefined) return null;

  return (
    <AppProvider readOnly shareId={shareId ?? undefined}>
      <TooltipProvider>
        <Display />
      </TooltipProvider>
    </AppProvider>
  );
}
