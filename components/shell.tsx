"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayView } from "@/components/play-view";
import { SetupView } from "@/components/setup-view";
import { StandingsView } from "@/components/standings-view";
import { TournamentsView } from "@/components/tournaments-view";
import { CloudSection, displayUrl } from "@/components/cloud-section";
import { SaveStatus } from "@/components/save-status";
import { LANGS } from "@/lib/i18n";
import { useApp } from "@/lib/store";

type Tab = "play" | "standings" | "tournaments" | "setup" | "account";

export function Shell() {
  const { state, ready, actions, cloud, t } = useApp();
  const [chosen, setChosen] = useState<Tab | null>(null);
  // With fewer than 4 players there is nothing to play yet, so start in Setup
  const tab = chosen ?? (state.players.filter((p) => p.active).length >= 4 ? "play" : "setup");

  const tabs: { id: Tab; label: string }[] = [
    { id: "play", label: t("tabPlay") },
    { id: "standings", label: t("tabStandings") },
    ...(cloud.email ? [{ id: "tournaments" as Tab, label: t("tabTournaments") }] : []),
    { id: "setup", label: t("tabSetup") },
  ];

  if (!ready) return null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-4 text-xs">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="mr-auto text-sm font-medium">{t("appName")}</h1>
          <Button size="sm" variant="outline" onClick={() => window.open(cloud.shareId ? displayUrl(cloud.shareId) : new URL("display", window.location.href).toString(), "sternchenturnier-display")}>
            {t("openDisplay")}
          </Button>
          <div role="group" aria-label={t("language")} className="flex">
            {LANGS.map((lang) => (
              <Button
                key={lang}
                size="sm"
                variant={state.lang === lang ? "default" : "outline"}
                aria-pressed={state.lang === lang}
                onClick={() => actions.setLang(lang)}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Where the data lives, and the way to sign in: always in the same place */}
        {cloud.available && (
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              {cloud.name && <p className="font-medium [overflow-wrap:anywhere]">{cloud.name}</p>}
              <SaveStatus />
            </div>
            <Button
              size="sm"
              variant={tab === "account" ? "default" : "outline"}
              aria-pressed={tab === "account"}
              title={cloud.email ?? undefined}
              className="max-w-[10rem] shrink-0"
              onClick={() => setChosen("account")}
            >
              <span className="truncate">{cloud.email ?? t("signIn")}</span>
            </Button>
          </div>
        )}
      </header>

      <div role="group" className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map(({ id, label }) => (
          <Button
            key={id}
            size="lg"
            className="px-1"
            variant={tab === id ? "default" : "outline"}
            aria-pressed={tab === id}
            onClick={() => setChosen(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === "play" && <PlayView />}
      {tab === "standings" && <StandingsView />}
      {tab === "tournaments" && cloud.email && <TournamentsView />}
      {tab === "setup" && <SetupView />}
      {tab === "account" && <CloudSection />}

      <footer className="mt-auto border-t pt-4">
        <a href="legal" target="_blank" rel="noreferrer" className="text-muted-foreground underline underline-offset-4">
          {t("legalLink")}
        </a>
      </footer>
    </main>
  );
}
