import { createClient } from "@supabase/supabase-js";
import type { State } from "./repository";

// Both values are public by design (see supabase/schema.sql: the database rules protect the data).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// null = cloud not configured: the app then works with browser storage only
export const supabase = url && key ? createClient(url, key) : null;

export type CloudTournament = {
  id: string;
  shareId: string;
  shareEnabled: boolean;
  name: string;
  state: Partial<State>;
  updatedAt: string;
};

// "*" so the app also works before the share_enabled column exists (see supabase/migration-*.sql)
const COLUMNS = "*";

type Row = { id: string; share_id: string; share_enabled?: boolean; name: string; state: Partial<State>; updated_at: string };
const fromRow = (r: Row): CloudTournament => ({
  id: r.id,
  shareId: r.share_id,
  shareEnabled: r.share_enabled ?? true,
  name: r.name,
  state: r.state,
  updatedAt: r.updated_at,
});

// Login with any email address: no email is sent unless the project requires confirmation
// The accepted terms version and time are stored with the account as proof of consent
export async function signUpWithPassword(
  email: string,
  password: string,
  consent: { version: string; at: string },
): Promise<{ error: string | null; confirm: boolean }> {
  if (!supabase) return { error: "Cloud is not configured", confirm: false };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { accepted_terms_version: consent.version, accepted_terms_at: consent.at } },
  });
  return { error: error?.message ?? null, confirm: !error && !data.session };
}

export async function signInWithPassword(email: string, password: string): Promise<string | null> {
  if (!supabase) return "Cloud is not configured";
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error?.message ?? null;
}

// All tournaments of the signed-in organizer, newest first (row-level security limits this to their own)
export async function listTournaments(): Promise<CloudTournament[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("tournaments").select(COLUMNS).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function fetchTournament(id: string): Promise<CloudTournament | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("tournaments").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as Row) : null;
}

export async function createTournament(state: State, name: string): Promise<CloudTournament> {
  if (!supabase) throw new Error("cloud not configured");
  const { data, error } = await supabase.from("tournaments").insert({ state, name }).select(COLUMNS).single();
  if (error) throw error;
  return fromRow(data as Row);
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

// Returns the new updated_at, which the caller must remember if it is the open tournament
export async function renameTournament(id: string, name: string): Promise<string> {
  if (!supabase) throw new Error("cloud not configured");
  const { data, error } = await supabase
    .from("tournaments")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("updated_at")
    .single();
  if (error) throw error;
  return data.updated_at;
}

export async function deleteTournament(id: string): Promise<void> {
  if (!supabase) throw new Error("cloud not configured");
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) throw error;
}

// What the display uses: no login, only an exact share id returns anything
export async function fetchSharedState(shareId: string): Promise<Partial<State> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_shared_tournament", { p_share_id: shareId });
  if (error) throw error;
  return data?.[0]?.state ?? null;
}

// A new random display link; the old one stops working. Returns the new link and updated_at.
export async function rotateShareId(id: string): Promise<{ shareId: string; updatedAt: string }> {
  if (!supabase) throw new Error("cloud not configured");
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const shareId = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const { data, error } = await supabase
    .from("tournaments")
    .update({ share_id: shareId, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("updated_at")
    .single();
  if (error) throw error;
  return { shareId, updatedAt: data.updated_at };
}

export async function setShareEnabled(id: string, enabled: boolean): Promise<string> {
  if (!supabase) throw new Error("cloud not configured");
  const { data, error } = await supabase
    .from("tournaments")
    .update({ share_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("updated_at")
    .single();
  if (error) throw error;
  return data.updated_at;
}

// Deletes the signed-in user's account and, through the database, all their tournaments
export async function deleteMyAccount(): Promise<void> {
  if (!supabase) throw new Error("cloud not configured");
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw error;
}
