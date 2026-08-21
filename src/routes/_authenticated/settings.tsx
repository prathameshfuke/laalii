import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Section } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  signOutCompletely,
  useCreateInvite,
  useDeleteAllData,
  useDisconnect,
  useMyLinks,
  useProfile,
  useRegenerateCode,
  useUpdateLink,
  useUpdateProfile,
  type Intent,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings: Laali" },
      { name: "description", content: "Your profile, your goal, sharing controls and your data." },
      { property: "og:title", content: "Settings: Laali" },
      {
        property: "og:description",
        content: "Control what Laali tracks, what your partner sees and what stays private.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const INTENTS: Array<{ value: Intent; label: string }> = [
  { value: "tracking", label: "Just tracking" },
  { value: "conceive", label: "Trying to conceive" },
  { value: "avoid", label: "Avoiding pregnancy" },
];

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const links = useMyLinks();
  const createInvite = useCreateInvite();
  const updateLink = useUpdateLink();
  const regenerate = useRegenerateCode();
  const disconnect = useDisconnect();
  const deleteData = useDeleteAllData();
  const logs = useLogs();
  const cycles = useCycles();
  const intimacy = useIntimacyLogs();

  const [name, setName] = useState<string | null>(null);

  const link = (links.data ?? [])[0] ?? null;
  const displayName = name ?? profile.data?.display_name ?? "";
  const intent = profile.data?.intent ?? "tracking";

  async function signOut() {
    await signOutCompletely(qc);
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

      <Section title="What you are here for" hint="changes how Laali talks to you">
        <div className="paper grid gap-2 p-3">
          {INTENTS.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={intent === o.value}
              onClick={() => updateProfile.mutate({ intent: o.value })}
              className="rounded-2xl border px-4 py-3 text-left text-sm"
              style={{
                borderColor: intent === o.value ? "var(--ink)" : "var(--border)",
                background:
                  intent === o.value
                    ? "color-mix(in oklab, var(--rose) 16%, transparent)"
                    : "transparent",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
        {intent === "avoid" ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Laali is not contraception. Predicted safe days are estimates, not protection.
          </p>
        ) : null}
      </Section>

      <Section title="Couples Mode" hint="you are in control">
        {!link ? (
          <div className="paper p-5">
            <p className="text-sm text-muted-foreground">
              Create an invite code and share it with your partner. They sign in, enter the code,
              and see only what you switch on.
            </p>
            <Button
              className="mt-4 h-11 w-full rounded-full"
              disabled={createInvite.isPending}
              onClick={() =>
                createInvite.mutate(
                  { share_phase: true },
                  { onError: () => toast.error("Could not create the invite") },
                )
              }
            >
              {createInvite.isPending ? "Creating" : "Create invite code"}
            </Button>
          </div>
        ) : (
          <div className="paper space-y-4 p-5">
            {link.status === "pending" ? (
              <div className="rounded-2xl border border-dashed border-border p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Invite code</p>
                <p className="numeral mt-1 text-3xl tracking-[0.3em]">{link.invite_code}</p>
                <div className="mt-2 flex justify-center gap-4 text-xs">
                  <button
                    className="underline underline-offset-4"
                    onClick={() => {
                      navigator.clipboard?.writeText(link.invite_code);
                      toast.success("Code copied");
                    }}
                  >
                    Copy code
                  </button>
                  <button
                    className="underline underline-offset-4"
                    disabled={regenerate.isPending}
                    onClick={() =>
                      regenerate.mutate(link.id, {
                        onSuccess: () => toast.success("New code ready, the old one is dead"),
                      })
                    }
                  >
                    Generate a new one
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm">Connected. Your partner sees only the switches you leave on.</p>
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
            {intent === "conceive" ? (
              <Toggle
                label="Share the fertile window"
                hint="A simple indicator only, for trying to conceive. Off unless you turn it on."
                checked={link.share_fertile}
                onChange={(v) => updateLink.mutate({ id: link.id, patch: { share_fertile: v } })}
              />
            ) : null}

            <p className="text-xs text-muted-foreground">
              Intimacy logs and your private notes are never shared, no matter what is switched on.
            </p>

            <Confirm
              trigger={
                <button className="text-sm text-destructive underline underline-offset-4">
                  Disconnect partner
                </button>
              }
              title="Disconnect your partner?"
              body="Their view goes blank straight away and the invite code stops working. You can always create a new one."
              confirmLabel="Disconnect"
              onConfirm={() =>
                disconnect.mutate(link.id, { onSuccess: () => toast.success("Disconnected") })
              }
            />
          </div>
        )}
      </Section>

      <Section title="Your data">
        <div className="paper space-y-4 p-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Days logged", value: (logs.data ?? []).length },
              { label: "Cycles recorded", value: (cycles.data ?? []).length },
              { label: "Private entries", value: (intimacy.data ?? []).length },
            ].map((s) => (
              <div key={s.label}>
                <p className="numeral text-2xl">{s.value}</p>
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Deleting your data clears every cycle, day log and intimacy entry from this account. Your
            sign in and any partner connection stay as they are.
          </p>

          <Confirm
            trigger={
              <button className="text-sm text-destructive underline underline-offset-4">
                Delete all my tracked data
              </button>
            }
            title="Delete everything you have logged?"
            body="Cycles, day logs and intimacy entries are removed for good. This cannot be undone."
            confirmLabel="Delete it all"
            onConfirm={() =>
              deleteData.mutate(undefined, {
                onSuccess: () => toast.success("Your data has been cleared"),
                onError: (e) =>
                  toast.error("Could not delete that", {
                    description: e instanceof Error ? e.message : "Please try again.",
                  }),
              })
            }
          />
        </div>
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

function Confirm({
  trigger,
  title,
  body,
  confirmLabel,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
