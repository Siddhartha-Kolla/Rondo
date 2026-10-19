"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createTournament,
  deleteTournament,
  fetchSharedState,
  fetchTournament,
  listTournaments,
  renameTournament,
  saveTournament,
  signInWithPassword,
  signUpWithPassword,
  supabase,
  type CloudTournament,
} from "./cloud";
import { emptyState, type State } from "./repository";

// local = not signed in | saving = signed in, changes on their way | the rest are what you'd expect
export type CloudStatus = "local" | "saving" | "saved" | "offline" | "conflict" | "auth" | "error";

const RETRY_SECONDS = [5, 15, 60];
const CURRENT_KEY = "sternchenturnier:current"; // which tournament this device had open

const hasContent = (s: Partial<State>) => (s.players?.length ?? 0) > 0 || (s.rounds?.length ?? 0) > 0;

function classify(e: unknown): "offline" | "auth" | "error" {
  const { message = "", status } = (e ?? {}) as { message?: string; status?: number };
  const text = message.toLowerCase();
  if (!navigator.onLine || text.includes("failed to fetch") || text.includes("network") || text.includes("load failed")) return "offline";
  if (status === 401 || text.includes("jwt")) return "auth";
  return "error";
}

const rememberCurrent = (id: string | null) => {
  try {
    if (id) localStorage.setItem(CURRENT_KEY, id);
    else localStorage.removeItem(CURRENT_KEY);
  } catch {
    // blocked storage: we simply forget which one was open
  }
};
const recallCurrent = () => {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
};

type Open = { id: string; shareId: string; name: string };

// Organizer side: sign in with email + password, keep the open tournament saved online,
// and switch between all of the organizer's tournaments.
// Browser storage stays the working copy, so the app keeps working if the network drops.
export function useCloudSync(state: State, ready: boolean, replaceState: (s: State) => void, enabled: boolean) {
  const [email, setEmail] = useState<string | null>(null);
  const [tournament, setTournament] = useState<Open | null>(null);
  const [list, setList] = useState<CloudTournament[]>([]);
  const [phase, setPhase] = useState<"idle" | Exclude<CloudStatus, "local">>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorText, setErrorText] = useState("");
  const [retryTick, setRetryTick] = useState(0); // bump to try saving again right away
  const stateRef = useRef(state);
  const lastSynced = useRef<State | null>(null); // never push back what we just pulled
  const knownUpdatedAt = useRef<string | null>(null);
  const attempt = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const active = enabled && supabase !== null;

  useEffect(() => {
    if (!active || !supabase) return;
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, [active]);

  const fail = useCallback((e: unknown) => {
    const kind = classify(e);
    setErrorText(((e ?? {}) as { message?: string }).message ?? "");
    setPhase(kind);
    if (kind === "offline") {
      const seconds = RETRY_SECONDS[Math.min(attempt.current, RETRY_SECONDS.length - 1)];
      attempt.current++;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      retryTimer.current = setTimeout(() => setRetryTick((n) => n + 1), seconds * 1000);
    }
  }, []);

  const succeeded = useCallback((updatedAt: string) => {
    knownUpdatedAt.current = updatedAt;
    attempt.current = 0;
    if (retryTimer.current) clearTimeout(retryTimer.current);
    setLastSavedAt(new Date());
    setPhase("saved");
  }, []);

  const refreshList = useCallback(async () => {
    try {
      setList(await listTournaments());
    } catch (e) {
      fail(e);
    }
  }, [fail]);

  // Make a tournament the open one. adoptLocalIfEmpty: right after login, an empty online
  // tournament takes over what is already on this device instead of wiping it.
  const adopt = useCallback(
    async (t: CloudTournament, adoptLocalIfEmpty: boolean) => {
      setTournament({ id: t.id, shareId: t.shareId, name: t.name });
      rememberCurrent(t.id);
      if (hasContent(t.state) || !adoptLocalIfEmpty || !hasContent(stateRef.current)) {
        const next: State = { ...emptyState, ...t.state, lang: stateRef.current.lang };
        lastSynced.current = next;
        replaceState(next);
        succeeded(t.updatedAt);
      } else {
        const saved = await saveTournament(t.id, stateRef.current, t.updatedAt);
        lastSynced.current = stateRef.current;
        if (saved.conflict) setPhase("conflict");
        else succeeded(saved.updatedAt);
      }
    },
    [replaceState, succeeded],
  );

  const defaultName = () => `Sternchenturnier ${new Date().toLocaleDateString()}`;

  // Signed in: open the tournament this device had open, else the latest, else create the first one
  const loadRemote = useCallback(async () => {
    try {
      const all = await listTournaments();
      setList(all);
      if (all.length === 0) {
        const created = await createTournament(stateRef.current, defaultName());
        await adopt(created, false);
        setList([created]);
        return;
      }
      const remembered = recallCurrent();
      await adopt(all.find((t) => t.id === remembered) ?? all[0], true);
    } catch (e) {
      fail(e);
    }
  }, [adopt, fail]);

  useEffect(() => {
    if (!active || !email || !ready) return;
    Promise.resolve().then(loadRemote);
  }, [active, email, ready, loadRemote]);

  // Push changes shortly after the last edit (also the retry after a failure)
  useEffect(() => {
    if (!tournament || !knownUpdatedAt.current || state === lastSynced.current || phase === "conflict" || phase === "auth") return;
    const timer = setTimeout(async () => {
      setPhase("saving");
      try {
        const result = await saveTournament(tournament.id, state, knownUpdatedAt.current!);
        if (result.conflict) {
          setPhase("conflict");
          return;
        }
        lastSynced.current = state;
        succeeded(result.updatedAt);
      } catch (e) {
        fail(e);
      }
    }, 800);
    return () => clearTimeout(timer);
    // phase is deliberately not a dependency: changing it must not restart the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, tournament, retryTick, fail, succeeded]);

  // Back online or tab visible again: try right away instead of waiting for the backoff
  useEffect(() => {
    if (!active) return;
    const retry = () => {
      if (document.visibilityState === "visible" && navigator.onLine) setRetryTick((n) => n + 1);
    };
    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", retry);
    return () => {
      window.removeEventListener("online", retry);
      document.removeEventListener("visibilitychange", retry);
    };
  }, [active]);

  useEffect(() => () => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
  }, []);

  // Save pending edits right now (before switching tournaments or signing out). true = nothing is lost.
  const flush = useCallback(async (): Promise<boolean> => {
    if (!tournament || !knownUpdatedAt.current || stateRef.current === lastSynced.current) return true;
    try {
      const result = await saveTournament(tournament.id, stateRef.current, knownUpdatedAt.current);
      if (result.conflict) {
        setPhase("conflict");
        return false;
      }
      lastSynced.current = stateRef.current;
      succeeded(result.updatedAt);
      return true;
    } catch (e) {
      fail(e);
      return false;
    }
  }, [tournament, succeeded, fail]);

  const open = useCallback(
    async (id: string) => {
      if (!(await flush())) return;
      try {
        const t = await fetchTournament(id);
        if (!t) return;
        await adopt(t, false);
        await refreshList();
      } catch (e) {
        fail(e);
      }
    },
    [flush, adopt, refreshList, fail],
  );

  // A new tournament keeps the player list (same club, new evening) but starts without rounds
  const createNew = useCallback(
    async (name: string) => {
      if (!(await flush())) return;
      try {
        const s = stateRef.current;
        const fresh: State = { ...emptyState, lang: s.lang, tables: s.tables, players: s.players };
        const created = await createTournament(fresh, name.trim() || defaultName());
        await adopt(created, false);
        await refreshList();
      } catch (e) {
        fail(e);
      }
    },
    [flush, adopt, refreshList, fail],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      try {
        const updatedAt = await renameTournament(id, name);
        if (tournament?.id === id) {
          knownUpdatedAt.current = updatedAt;
          setTournament({ ...tournament, name });
        }
        await refreshList();
      } catch (e) {
        fail(e);
      }
    },
    [tournament, refreshList, fail],
  );

  // Deleting the open one switches to the newest remaining (or a fresh one if none is left)
  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteTournament(id);
        const rest = (await listTournaments()).filter((t) => t.id !== id);
        setList(rest);
        if (tournament?.id === id) {
          if (rest.length > 0) await adopt(rest[0], false);
          else {
            const created = await createTournament({ ...emptyState, lang: stateRef.current.lang }, defaultName());
            await adopt(created, false);
            setList([created]);
          }
        }
      } catch (e) {
        fail(e);
      }
    },
    [tournament, adopt, fail],
  );

  const signIn = useCallback((address: string, password: string) => signInWithPassword(address, password), []);
  const signUp = useCallback((address: string, password: string) => signUpWithPassword(address, password), []);

  // Signs out and clears this device's copy, but only once everything is safely saved online
  const signOut = useCallback(async (): Promise<boolean> => {
    if (!(await flush())) return false;
    await supabase?.auth.signOut();
    setTournament(null);
    setList([]);
    knownUpdatedAt.current = null;
    lastSynced.current = null;
    rememberCurrent(null);
    replaceState({ ...emptyState, lang: stateRef.current.lang });
    setPhase("idle");
    return true;
  }, [flush, replaceState]);

  // After a conflict: take what the other device saved
  const reload = useCallback(async () => {
    if (!tournament) return;
    setPhase("saving");
    await open(tournament.id);
  }, [tournament, open]);

  const status: CloudStatus = !email ? "local" : phase === "idle" ? "saving" : phase;

  return {
    available: active,
    email,
    shareId: tournament?.shareId ?? null,
    currentId: tournament?.id ?? null,
    name: tournament?.name ?? null,
    list,
    status,
    lastSavedAt,
    errorText,
    signIn,
    signUp,
    signOut,
    reload,
    refreshList,
    open,
    createNew,
    rename,
    remove,
  };
}

// Display side: no login. Asks for the tournament by its share id every few seconds.
export function useSharedState(shareId: string | undefined, apply: (s: State) => void) {
  const [failures, setFailures] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!shareId) return;
    let stopped = false;
    const tick = async () => {
      try {
        const shared = await fetchSharedState(shareId);
        if (stopped) return;
        if (shared) apply({ ...emptyState, ...shared });
        setFailures(0);
        setUpdatedAt(new Date());
      } catch {
        if (!stopped) setFailures((n) => n + 1);
      }
    };
    tick();
    const timer = setInterval(tick, 3000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [shareId, apply]);

  return { offline: failures >= 2, updatedAt };
}
