import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CycleRow } from "@/lib/cycle";

export interface Profile {
  id: string;
  display_name: string | null;
  mascot_name: string;
  avg_cycle_length: number;
  luteal_length: number;
  advanced_tracking: boolean;
  reduce_motion: boolean;
  onboarded: boolean;
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

export function useSessionUser() {
  return useQuery({
    queryKey: ["session-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const uid = await currentUserId();
      if (!uid) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Profile;
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: uid })
        .select("*")
        .single();
      if (insertError) throw insertError;
      return created as Profile;
    },
  });
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
    mutationFn: async (share: {
      share_phase: boolean;
      share_mood: boolean;
      share_symptoms: boolean;
    }) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("partner_links")
        .insert({ owner_id: uid, invite_code: makeCode(), ...share })
        .select("*")
        .single();
      if (error) throw error;
      return data as PartnerLink;
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
      const { data: found, error: findError } = await supabase
        .from("partner_links")
        .select("id, status, partner_id")
        .eq("invite_code", code.trim().toUpperCase())
        .maybeSingle();
      if (findError) throw findError;
      if (!found) throw new Error("That invite code doesn't match anything.");
      if (found.partner_id) throw new Error("That invite has already been used.");
      const { error } = await supabase
        .from("partner_links")
        .update({ partner_id: uid, status: "accepted" })
        .eq("id", found.id);
      if (error) throw error;
      return found.id;
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
