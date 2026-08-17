import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Section } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  useCreateInvite,
  useMyLinks,
  useProfile,
  useRevokeLink,
  useUpdateLink,
  useUpdateProfile,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Laali" },
      { name: "description", content: "Profile, sharing controls and your partner connection." },
      { property: "og:title", content: "Settings — Laali" },
      { property: "og:description", content: "Control what you track and what you share." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const links = useMyLinks();
  const createInvite = useCreateInvite();
  const updateLink = useUpdateLink();
  const revoke = useRevokeLink();
  const [name, setName] = useState<string | null>(null);

  const link = (links.data ?? [])[0] ?? null;
  const displayName = name ?? profile.data?.display_name ?? "";

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <AppShell variant="her">
      <Section>
        <h1 className="text-3xl">Settings</h1>
      </Section>

      <Section title="You">
        <div className="paper space-y-4 p-5">
          <div>
            <Label htmlFor="dn">Name</Label>
            <Input
              id="dn"
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => updateProfile.mutate({ display_name: displayName || null })}
              className="mt-1.5 h-11 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="cl">Average cycle length</Label>
            <Input
              id="cl"
              type="number"
              min={20}
              max={45}
              defaultValue={profile.data?.avg_cycle_length ?? 28}
              onBlur={(e) =>
                updateProfile.mutate({ avg_cycle_length: Number(e.target.value) || 28 })
              }
              className="mt-1.5 h-11 rounded-xl"
            />
          </div>
          <Toggle
            label="Advanced tracking"
            hint="Basal temperature, cervical mucus, medications"
            checked={profile.data?.advanced_tracking ?? false}
            onChange={(v) => updateProfile.mutate({ advanced_tracking: v })}
          />
          <Toggle
            label="Calmer motion"
            hint="Reduce animation across the app"
            checked={profile.data?.reduce_motion ?? false}
            onChange={(v) => updateProfile.mutate({ reduce_motion: v })}
          />
        </div>
      </Section>

      <Section title="Partner" hint="you're in control">
        {!link ? (
          <div className="paper p-5">
            <p className="text-sm text-muted-foreground">
              Create an invite code and share it with your partner. They sign in, enter the code,
              and only see what you switch on below.
            </p>
            <Button
              className="mt-4 h-11 w-full rounded-full"
              disabled={createInvite.isPending}
              onClick={() =>
                createInvite.mutate(
                  { share_phase: true, share_mood: true, share_symptoms: false },
                  { onError: () => toast.error("Couldn't create the invite") },
                )
              }
            >
              {createInvite.isPending ? "Creating…" : "Create invite code"}
            </Button>
          </div>
        ) : (
          <div className="paper space-y-4 p-5">
            {link.status === "pending" ? (
              <div className="rounded-2xl border border-dashed border-border p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Invite code</p>
                <p className="numeral mt-1 text-3xl tracking-[0.3em]">{link.invite_code}</p>
                <button
                  className="mt-2 text-xs underline underline-offset-4"
                  onClick={() => {
                    navigator.clipboard?.writeText(link.invite_code);
                    toast.success("Code copied");
                  }}
                >
                  Copy code
                </button>
              </div>
            ) : (
              <p className="text-sm">Connected. Your partner can see the switches you leave on.</p>
            )}

            <Toggle
              label="Share my phase"
              hint="Where I am in the cycle, nothing more"
              checked={link.share_phase}
              onChange={(v) => updateLink.mutate({ id: link.id, patch: { share_phase: v } })}
            />
            <Toggle
              label="Share my mood"
              hint="Moods I log, without the notes"
              checked={link.share_mood}
              onChange={(v) => updateLink.mutate({ id: link.id, patch: { share_mood: v } })}
            />
            <Toggle
              label="Share my symptoms"
              hint="Cramps, headaches and the rest"
              checked={link.share_symptoms}
              onChange={(v) => updateLink.mutate({ id: link.id, patch: { share_symptoms: v } })}
            />

            <button
              className="text-sm text-destructive underline underline-offset-4"
              onClick={() => revoke.mutate(link.id)}
            >
              Disconnect partner
            </button>
          </div>
        )}
      </Section>

      <Section>
        <button
          onClick={signOut}
          className="paper w-full p-4 text-left text-sm text-muted-foreground"
        >
          Sign out
        </button>
      </Section>
    </AppShell>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
