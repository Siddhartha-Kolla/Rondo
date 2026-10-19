"use client"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StandingsTable, useStandingRows } from "@/components/standings-view";
import { TableGraphic } from "@/components/table-graphic";
import { AppProvider, useApp, useNames } from "@/lib/store";
import { playersOf } from "@/lib/tournament";

const SLIDE_SECONDS = 15;
const ROWS_PER_PAGE = 8;

// Read-only screen for a monitor: standings pages and the current round take turns.
function Display() {
  const { state, ready, t } = useApp();
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

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => i + 1), SLIDE_SECONDS * 1000);
    return () => clearInterval(timer);
  }, []);

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
        <p className="ml-auto flex items-center gap-2 text-muted-foreground">
          <span aria-hidden className="size-[0.6em] bg-table-blue" />
          {t("live")}
        </p>
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
            <p className="text-muted-foreground">
              {t("sittingOut")}: {sitting.join(", ") || t("nobody")}
            </p>
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
  return (
    <AppProvider readOnly>
      <TooltipProvider>
        <Display />
      </TooltipProvider>
    </AppProvider>
  );
}
