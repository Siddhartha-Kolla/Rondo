"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { detectLang, translate, type Key, type Lang } from "./i18n";
import { nextRound, type Round } from "./tournament";

export type Player = { id: string; name: string; active: boolean };

type State = { players: Player[]; tables: number; rounds: Round[]; lang: Lang };

const STORAGE_KEY = "sternchenturnier:v1";
const emptyState: State = { players: [], tables: 2, rounds: [], lang: "en" };

const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function readStored(): State {
  let saved: Partial<State> = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    saved = {};
  }
  return { ...emptyState, lang: detectLang(), ...saved };
}

// readOnly is for the display window: it follows the operator's window and never writes
function useAppState(readOnly: boolean) {
  const [state, setState] = useState<State>(emptyState);
  const [ready, setReady] = useState(false);

  // Load once on the client (localStorage does not exist on the server)
  useEffect(() => {
    Promise.resolve().then(() => {
      setState(readStored());
      setReady(true);
    });
  }, []);

  // The browser tells other windows of the same site when this key changes
  useEffect(() => {
    if (!readOnly) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setState(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [readOnly]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = state.lang;
    if (readOnly) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked: the app keeps working in memory
    }
  }, [state, ready, readOnly]);

  const update = useCallback((change: (s: State) => State) => setState(change), []);

  const actions = useMemo(
    () => ({
      setLang: (lang: Lang) => update((s) => ({ ...s, lang })),
      setTables: (tables: number) => update((s) => ({ ...s, tables: Math.max(1, Math.min(20, tables || 1)) })),
      addPlayers: (names: string[]) =>
        update((s) => ({
          ...s,
          players: [
            ...s.players,
            ...names.map((n) => n.trim()).filter(Boolean).map((name) => ({ id: newId(), name, active: true })),
          ],
        })),
      renamePlayer: (id: string, name: string) =>
        update((s) => ({ ...s, players: s.players.map((p) => (p.id === id ? { ...p, name } : p)) })),
      setActive: (id: string, active: boolean) =>
        update((s) => ({ ...s, players: s.players.map((p) => (p.id === id ? { ...p, active } : p)) })),
      removePlayer: (id: string) => update((s) => ({ ...s, players: s.players.filter((p) => p.id !== id) })),
      startNextRound: () =>
        update((s) => {
          const active = s.players.filter((p) => p.active).map((p) => p.id);
          return { ...s, rounds: [...s.rounds, nextRound(active, s.rounds, s.tables)] };
        }),
      // Only the latest round can be edited
      setWinner: (matchIndex: number, winner: 0 | 1 | null) =>
        update((s) => {
          const last = s.rounds.length - 1;
          if (last < 0) return s;
          const rounds = s.rounds.map((round, i) =>
            i === last ? round.map((m, j) => (j === matchIndex ? { ...m, winner } : m)) : round,
          );
          return { ...s, rounds };
        }),
      reset: () => update((s) => ({ ...s, rounds: [] })),
    }),
    [update],
  );

  return { state, ready, actions };
}

type App = ReturnType<typeof useAppState> & { t: (key: Key, values?: Record<string, string | number>) => string };
const AppContext = createContext<App | null>(null);

export function AppProvider({ children, readOnly = false }: { children: ReactNode; readOnly?: boolean }) {
  const app = useAppState(readOnly);
  const lang = app.state.lang;
  const t = useCallback((key: Key, values?: Record<string, string | number>) => translate(lang, key, values), [lang]);
  const value = useMemo(() => ({ ...app, t }), [app, t]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): App {
  const app = useContext(AppContext);
  if (!app) throw new Error("useApp must be used inside AppProvider");
  return app;
}

// id -> player name, for rendering rounds and standings
export function useNames(): (id: string) => string {
  const { state } = useApp();
  const names = useMemo(() => new Map(state.players.map((p) => [p.id, p.name])), [state.players]);
  return (id) => names.get(id) ?? "?";
}
