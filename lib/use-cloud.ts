"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createTournament,
  fetchOwnTournament,
  fetchSharedState,
  saveTournament,
  signInWithPassword,
  signUpWithPassword,
  supabase,
} from "./cloud";
import { emptyState, type State } from "./repository";

// local = not signed in | saving = signed in, changes on their way | the rest are what you'd expect
export type CloudStatus = "local" | "saving" | "saved" | "offline" | "conflict" | "auth" | "error";

const RETRY_SECONDS = [5, 15, 60];

const hasContent = (s: Partial<State>) => (s.players?.length ?? 0) > 0 || (s.rounds?.length ?? 0) > 0;

function classify(e: unknown): "offline" | "auth" | "error" {
  const { message = "", status } = (e ?? {}) as { message?: string; status?: number };
  const text = message.toLowerCase();
  if (!navigator.onLine || text.includes("failed to fetch") || text.includes("network") || text.includes("load failed")) return "offline";
  if (status === 401 || text.includes("jwt")) return "auth";
  return "error";
}

// Organizer side: sign in with email + password, then keep the tournament saved online.
// Browser storage stays the working copy, so the app keeps working if the network drops.
export function useCloudSync(state: State, ready: boolean, replaceState: (s: State) => void, enabled: boolean) {
  const [email, setEmail] = useState<string | null>(null);
  const [tournament, setTournament] = useState<{ id: string; shareId: string } | null>(null);
  const [phase, setPhase] = useState<"idle" | Exclude<CloudStatus, "local" | "saving"> | "saving">("idle");
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

  // Signed in: find (or create) this organizer's tournament; if it already has data, it wins
  const loadRemote = useCallback(async () => {
    try {
      const remote = await fetchOwnTournament();
      if (remote) {
        setTournament({ id: remote.id, shareId: remote.shareId });
        if (hasContent(remote.state)) {
          const next: State = { ...emptyState, ...remote.state, lang: stateRef.current.lang };
          lastSynced.current = next;
          replaceState(next);
          succeeded(remote.updatedAt);
        } else {
          const saved = await saveTournament(remote.id, stateRef.current, remote.updatedAt);
          lastSynced.current = stateRef.current;
          if (saved.conflict) setPhase("conflict");
          else succeeded(saved.updatedAt);
        }
      } else {
        const created = await createTournament(stateRef.current);
        lastSynced.current = stateRef.current;
        setTournament({ id: created.id, shareId: created.shareId });
        succeeded(created.updatedAt);
      }
    } catch (e) {
      fail(e);
    }
  }, [fail, replaceState, succeeded]);

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

  const signIn = useCallback((address: string, password: string) => signInWithPassword(address, password), []);
  const signUp = useCallback((address: string, password: string) => signUpWithPassword(address, password), []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setTournament(null);
    knownUpdatedAt.current = null;
    lastSynced.current = null;
    setPhase("idle");
  }, []);

  // After a conflict: take what the other device saved
  const reload = useCallback(async () => {
    setPhase("saving");
    await loadRemote();
  }, [loadRemote]);

  const status: CloudStatus = !email ? "local" : phase === "idle" ? "saving" : phase;

  return {
    available: active,
    email,
    shareId: tournament?.shareId ?? null,
    status,
    lastSavedAt,
    errorText,
    signIn,
    signUp,
    signOut,
    reload,
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
