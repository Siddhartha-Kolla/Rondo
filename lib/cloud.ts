import { createClient } from "@supabase/supabase-js";
import type { State } from "./repository";

// Both values are public by design (see supabase/schema.sql: the database rules protect the data).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// null = cloud not configured: the app then works with browser storage only
export const supabase = url && key ? createClient(url, key) : null;

export type CloudTournament = { id: string; shareId: string; state: Partial<State>; updatedAt: string };

// Login with any email address: no email is sent unless the project requires confirmation
export async function signUpWithPassword(email: string, password: string): Promise<{ error: string | null; confirm: boolean }> {
  if (!supabase) return { error: "Cloud is not configured", confirm: false };
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null, confirm: !error && !data.session };
}

export async function signInWithPassword(email: string, password: string): Promise<string | null> {
  if (!supabase) return "Cloud is not configured";
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error?.message ?? null;
}

// The signed-in organizer's most recent tournament (row-level security limits this to their own)
export async function fetchOwnTournament(): Promise<CloudTournament | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("tournaments")
    .select("id, share_id, state, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? { id: data.id, shareId: data.share_id, state: data.state, updatedAt: data.updated_at } : null;
}

export async function createTournament(state: State): Promise<CloudTournament> {
  if (!supabase) throw new Error("cloud not configured");
  const { data, error } = await supabase.from("tournaments").insert({ state }).select("id, share_id, state, updated_at").single();
  if (error) throw error;
  return { id: data.id, shareId: data.share_id, state: data.state, updatedAt: data.updated_at };
}

// Saves only if nobody changed the row since we last saw it (knownUpdatedAt).
// "conflict" means another device saved in between, so we must not overwrite it.
export async function saveTournament(
  id: string,
  state: State,
  knownUpdatedAt: string,
): Promise<{ conflict: true } | { conflict: false; updatedAt: string }> {
  if (!supabase) throw new Error("cloud not configured");
  const { data, error } = await supabase
    .from("tournaments")
    .update({ state, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("updated_at", knownUpdatedAt)
    .select("updated_at");
  if (error) throw error;
  if (!data || data.length === 0) return { conflict: true };
  return { conflict: false, updatedAt: data[0].updated_at };
}

// What the display uses: no login, only an exact share id returns anything
export async function fetchSharedState(shareId: string): Promise<Partial<State> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_shared_tournament", { p_share_id: shareId });
  if (error) throw error;
  return data?.[0]?.state ?? null;
}
