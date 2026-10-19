import { detectLang, type Lang } from "./i18n";
import type { Round } from "./tournament";

export type Player = { id: string; name: string; active: boolean };
export type State = { players: Player[]; tables: number; rounds: Round[]; lang: Lang };

export const emptyState: State = { players: [], tables: 2, rounds: [], lang: "en" };

// Where the tournament is kept. The app only talks to this interface, so the browser
// storage below can be swapped for a server (e.g. Supabase) without touching the screens.
export type Repository = {
  load(): State;
  save(state: State): void;
  // Called when ANOTHER window or device changed the data; returns an unsubscribe function
  subscribe(onChange: (state: State) => void): () => void;
};

const STORAGE_KEY = "sternchenturnier:v1";

function readLocal(): State {
  let saved: Partial<State> = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    saved = {};
  }
  return { ...emptyState, lang: detectLang(), ...saved };
}

export const localRepository: Repository = {
  load: readLocal,
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked: the app keeps working in memory
    }
  },
  // The browser tells other windows of the same site when this key changes
  subscribe(onChange) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) onChange(readLocal());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
};

// The one place to change when the storage moves to a server
export const repository: Repository = localRepository;
