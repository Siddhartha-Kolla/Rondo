"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createTournament, fetchOwnTournament, fetchSharedState, saveTournament, supabase } from "./cloud";
import { emptyState, type State } from "./repository";

export type CloudPhase = "idle" | "saving" | "saved" | "error";

const hasContent = (s: Partial<State>) => (s.players?.length ?? 0) > 0 || (s.rounds?.length ?? 0) > 0;

// Organizer side: sign in with an emailed link, then keep the tournament saved online.
// Browser storage stays the working copy, so the app keeps working if the network drops.
export function useCloudSync(state: State, ready: boolean, replaceState: (s: State) => void, enabled: boolean) {
  const [email, setEmail] = useState<string | null>(null);
  const [tournament, setTournament] = useState<{ id: string; shareId: string } | null>(null);
  const [phase, setPhase] = useState<CloudPhase>("idle");
  const [linkSent, setLinkSent] = useState(false);
  const stateRef = useRef(state);
  const lastSynced = useRef<State | null>(null); // never push back what we just pulled
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

  // Signed in: find (or create) this organizer's tournament; if it already has data, it wins
  useEffect(() => {
    if (!active || !email || !ready) return;
    let cancelled = false;
    (async () => {
      try {
        const remote = await fetchOwnTournament();
        if (cancelled) return;
        if (remote) {
          setTournament({ id: remote.id, shareId: remote.shareId });
          if (hasContent(remote.state)) {
            const next: State = { ...emptyState, ...remote.state, lang: stateRef.current.lang };
            lastSynced.current = next;
            replaceState(next);
          } else {
            await saveTournament(remote.id, stateRef.current);
            lastSynced.current = stateRef.current;
          }
        } else {
          const created = await createTournament(stateRef.current);
          if (cancelled) return;
          lastSynced.current = stateRef.current;
          setTournament({ id: created.id, shareId: created.shareId });
        }
        setPhase("saved");
      } catch {
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, email, ready, replaceState]);

  // Push changes shortly after the last edit
  useEffect(() => {
    if (!tournament || state === lastSynced.current) return;
    const timer = setTimeout(async () => {
      setPhase("saving");
      try {
        await saveTournament(tournament.id, state);
        lastSynced.current = state;
        setPhase("saved");
      } catch {
        setPhase("error");
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [state, tournament]);

  // Returns null on success, otherwise the reason the login email could not be sent
  const signIn = useCallback(async (address: string): Promise<string | null> => {
    if (!supabase) return "Cloud is not configured";
    const redirect = window.location.href.split("#")[0].split("?")[0];
    const { error } = await supabase.auth.signInWithOtp({ email: address, options: { emailRedirectTo: redirect } });
    setLinkSent(!error);
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setTournament(null);
    setPhase("idle");
    setLinkSent(false);
  }, []);

  return { available: active, email, shareId: tournament?.shareId ?? null, phase, linkSent, signIn, signOut };
}

// Display side: no login. Asks for the tournament by its share id every few seconds.
export function useSharedState(shareId: string | undefined, apply: (s: State) => void) {
  useEffect(() => {
    if (!shareId) return;
    let stopped = false;
    const tick = async () => {
      try {
        const shared = await fetchSharedState(shareId);
        if (!stopped && shared) apply({ ...emptyState, ...shared });
      } catch {
        // offline for a moment: keep showing the last data
      }
    };
    tick();
    const timer = setInterval(tick, 3000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [shareId, apply]);
}
