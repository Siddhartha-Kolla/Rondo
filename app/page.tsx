"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlayView } from "@/components/play-view";
import { SetupView } from "@/components/setup-view";
import { StandingsView } from "@/components/standings-view";
import { displayUrl } from "@/components/cloud-section";
import { LANGS } from "@/lib/i18n";
import { AppProvider, useApp } from "@/lib/store";

type Tab = "play" | "standings" | "setup";

function Shell() {
  const { state, ready, actions, cloud, t } = useApp();
  const [chosen, setChosen] = useState<Tab | null>(null);
  // With fewer than 4 players there is nothing to play yet, so start in Setup
  const tab = chosen ?? (state.players.filter((p) => p.active).length >= 4 ? "play" : "setup");

  const tabs: { id: Tab; label: string }[] = [
    { id: "play", label: t("tabPlay") },
    { id: "standings", label: t("tabStandings") },
    { id: "setup", label: t("tabSetup") },
  ];

  if (!ready) return null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-4 text-xs">
      <header className="flex items-center gap-2">
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
      </header>

      <div role="group" className="grid grid-cols-3">
        {tabs.map(({ id, label }) => (
          <Button
            key={id}
            size="lg"
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
      {tab === "setup" && <SetupView />}
    </main>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <TooltipProvider>
        <Shell />
      </TooltipProvider>
    </AppProvider>
  );
}
