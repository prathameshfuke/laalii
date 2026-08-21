import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CycleRow } from "@/lib/cycle";

export type UserRole = "primary" | "partner";
export type Intent = "tracking" | "conceive" | "avoid";

export interface Profile {
  id: string;
  display_name: string | null;
  mascot_name: string;
  birth_year: number | null;
  avg_cycle_length: number;
  luteal_length: number;
  advanced_tracking: boolean;
  reduce_motion: boolean;
  onboarded: boolean;
  role: UserRole | null;
  onboarding_step: string | null;
  intent: Intent;
  care_dismissed_cycle: string | null;
}

export interface DayLog {
  id: string;
  user_id: string;
  log_date: string;
  flow: string | null;
  symptoms: string[];
  moods: string[];
  note: string | null;
  bbt: number | null;
  mucus: string | null;
  medications: string | null;
  symptom_severity: Record<string, number>;
}


export interface IntimacyLog {
  id: string;
  user_id: string;
  log_date: string;
  activity: "none" | "protected" | "unprotected" | null;
  desire: number | null;
  symptoms: string[];
}

export interface PartnerLink {
  id: string;
  owner_id: string;
  partner_id: string | null;
  invite_code: string;
  status: string;
  share_phase: boolean;
  share_mood: boolean;
  share_symptoms: boolean;
  share_milestones: boolean;
  share_fertile: boolean;
}

export interface PartnerNote {
  id: string;
  link_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * The single source of truth for "who is this person and where should they be".
 * Used both by the route gate and by the UI.
 */
export async function fetchProfile(): Promise<Profile | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as unknown as Profile;
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: uid })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return created as unknown as Profile;
}

export const profileQuery = {
  queryKey: ["profile"] as const,
  queryFn: fetchProfile,
};


export function useSessionUser() {
  return useQuery({
    queryKey: ["session-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });
}

export function useProfile() {
  return useQuery(profileQuery);
}


export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").update(patch).eq("id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useCycles(userId?: string) {
  return useQuery({
    queryKey: ["cycles", userId ?? "me"],
    queryFn: async (): Promise<CycleRow[]> => {
      const uid = userId ?? (await currentUserId());
      if (!uid) return [];
      const { data, error } = await supabase
        .from("cycles")
        .select("id, period_start, period_end")
        .eq("user_id", uid)
        .order("period_start", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CycleRow[];
    },
  });
}

export function useLogs(userId?: string) {
  return useQuery({
    queryKey: ["logs", userId ?? "me"],
    queryFn: async (): Promise<DayLog[]> => {
      const uid = userId ?? (await currentUserId());
      if (!uid) return [];
      const { data, error } = await supabase
        .from("day_logs")
        .select("*")
        .eq("user_id", uid)
        .order("log_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DayLog[];
    },
  });
}

export interface SharedLog {
  log_date: string;
  symptoms: string[];
  moods: string[];
}

/**
 * The partner's read of her day logs. Only the two categories that can ever
 * be shared are requested, so private notes never leave the database.
 */
export function usePartnerLogs(ownerId: string | undefined, allowed: boolean) {
  return useQuery({
    enabled: !!ownerId && allowed,
    queryKey: ["partner-logs", ownerId],
    queryFn: async (): Promise<SharedLog[]> => {
      const { data, error } = await supabase
        .from("day_logs")
        .select("log_date, symptoms, moods")
        .eq("user_id", ownerId!)
        .order("log_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SharedLog[];
    },
  });
}


export function useSaveLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Partial<DayLog> & { log_date: string }) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase
        .from("day_logs")
        .upsert({ ...entry, user_id: uid }, { onConflict: "user_id,log_date" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export function useStartPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (periodStart: string) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase
        .from("cycles")
        .upsert({ user_id: uid, period_start: periodStart }, { onConflict: "user_id,period_start" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cycles"] }),
  });
}

export function useEndPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, periodEnd }: { id: string; periodEnd: string }) => {
      const { error } = await supabase.from("cycles").update({ period_end: periodEnd }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cycles"] }),
  });
}

export function useDeleteCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cycles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cycles"] }),
  });
}

/* ---------------- partner ---------------- */

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

/** Links where I am the tracker (owner). */
export function useMyLinks() {
  return useQuery({
    queryKey: ["links", "owned"],
    queryFn: async (): Promise<PartnerLink[]> => {
      const uid = await currentUserId();
      if (!uid) return [];
      const { data, error } = await supabase
        .from("partner_links")
        .select("*")
        .eq("owner_id", uid)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PartnerLink[];
    },
  });
}

/** Links where I am the partner (viewer). */
export function useLinksToMe() {
  return useQuery({
    queryKey: ["links", "partner"],
    queryFn: async (): Promise<PartnerLink[]> => {
      const uid = await currentUserId();
      if (!uid) return [];
      const { data, error } = await supabase
        .from("partner_links")
        .select("*")
        .eq("partner_id", uid)
        .eq("status", "accepted");
      if (error) throw error;
      return (data ?? []) as PartnerLink[];
    },
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (share?: Partial<Pick<PartnerLink, "share_phase" | "share_mood" | "share_symptoms" | "share_fertile">>) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("partner_links")
        .insert({
          owner_id: uid,
          invite_code: makeCode(),
          share_phase: true,
          share_mood: false,
          share_symptoms: false,
          share_fertile: false,
          ...share,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as PartnerLink;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
}

export function useUpdateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<PartnerLink> }) => {
      const { error } = await supabase.from("partner_links").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
}

export function useRevokeLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partner_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
}

export function useAcceptInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Not signed in");
      const { data, error } = await supabase.rpc("redeem_invite", {
        _code: code.trim().toUpperCase(),
      });
      if (error) throw new Error(error.message.replace(/^.*?:\s*/, ""));
      return data as unknown as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
}


export function usePartnerNotes(linkId?: string) {
  return useQuery({
    enabled: !!linkId,
    queryKey: ["partner-notes", linkId],
    queryFn: async (): Promise<PartnerNote[]> => {
      const { data, error } = await supabase
        .from("partner_notes")
        .select("*")
        .eq("link_id", linkId!)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as PartnerNote[];
    },
  });
}

export function useSendNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ linkId, body }: { linkId: string; body: string }) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase
        .from("partner_notes")
        .insert({ link_id: linkId, sender_id: uid, body });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner-notes"] }),
  });
}

export function useOwnerProfile(ownerId?: string) {
  return useQuery({
    enabled: !!ownerId,
    queryKey: ["owner-profile", ownerId],
    queryFn: async (): Promise<Partial<Profile> | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, mascot_name, avg_cycle_length, luteal_length")
        .eq("id", ownerId!)
        .maybeSingle();
      if (error) throw error;
      return data as Partial<Profile> | null;
    },
  });
}

/* ---------------- intimacy (never shared) ---------------- */

export function useIntimacyLogs() {
  return useQuery({
    queryKey: ["intimacy"],
    queryFn: async (): Promise<IntimacyLog[]> => {
      const uid = await currentUserId();
      if (!uid) return [];
      const { data, error } = await supabase
        .from("intimacy_logs")
        .select("*")
        .eq("user_id", uid)
        .order("log_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as IntimacyLog[];
    },
  });
}

export function useSaveIntimacy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Partial<IntimacyLog> & { log_date: string }) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase
        .from("intimacy_logs")
        .upsert({ ...entry, user_id: uid }, { onConflict: "user_id,log_date" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intimacy"] }),
  });
}

/* ---------------- account actions ---------------- */

/** Regenerates the invite code on a link that has not been claimed yet. */
export function useRegenerateCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const code = makeCode();
      const { error } = await supabase
        .from("partner_links")
        .update({ invite_code: code })
        .eq("id", id);
      if (error) throw error;
      return code;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
}

/** Either side can end the connection. */
export function useDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partner_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
}

/**
 * Clears tracked data (cycles, day logs, intimacy) but keeps the account,
 * the chosen role and any partner connection intact.
 */
export function useDeleteAllData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Not signed in");
      for (const table of ["day_logs", "intimacy_logs", "cycles"] as const) {
        const { error } = await supabase.from(table).delete().eq("user_id", uid);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["logs"] });
      qc.invalidateQueries({ queryKey: ["cycles"] });
      qc.invalidateQueries({ queryKey: ["intimacy"] });
    },
  });
}

/** Signs out and drops every cached trace of the session from this device. */
export async function signOutCompletely(qc: ReturnType<typeof useQueryClient>) {
  await supabase.auth.signOut();
  qc.clear();
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("laali.")) localStorage.removeItem(key);
    }
    sessionStorage.clear();
  } catch {
    /* storage can be unavailable, that is fine */
  }
}
