import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Section } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useDisconnect,
  useLinksToMe,
  useProfile,
  useUpdateProfile,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/partner/settings")({
  head: () => ({
    meta: [
      { title: "Your account: Laali" },
      { name: "description", content: "Your name, your connection and signing out of Laali." },
      { property: "og:title", content: "Your account: Laali" },
      { property: "og:description", content: "Manage the partner side of Laali." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PartnerSettings,
});

function PartnerSettings() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const links = useLinksToMe();
  const disconnect = useDisconnect();
  const [name, setName] = useState<string | null>(null);

  const link = (links.data ?? [])[0] ?? null;
  const displayName = name ?? profile.data?.display_name ?? "";

  return (
    <AppShell variant="his">
      <Section>
        <h1 className="text-3xl">Your account</h1>
      </Section>

      <Section title="You">
        <div className="paper space-y-4 p-5">
          <div>
            <Label htmlFor="pn">Name</Label>
            <Input
              id="pn"
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => updateProfile.mutate({ display_name: displayName || null })}
              className="mt-1.5 h-11 rounded-xl"
            />
          </div>
        </div>
      </Section>

      <Section title="Connection">
        <div className="paper space-y-4 p-5 text-sm">
          {link ? (
            <>
              <p className="text-muted-foreground">
                You are connected. What you see is decided entirely on their side, and they can
                change it at any moment.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-sm text-destructive underline underline-offset-4">
                    Disconnect
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect from your partner?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will stop seeing anything they share. They will need to send you a new
                      code if you want to reconnect.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Stay connected</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        disconnect.mutate(link.id, {
                          onSuccess: () => toast.success("Disconnected"),
                        })
                      }
                    >
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <p className="text-muted-foreground">
              You are not connected to anyone yet. Ask your partner for their six character code and
              enter it on the Today screen.
            </p>
          )}
        </div>
      </Section>

      <Section>
        <button
          onClick={async () => {
            await signOutCompletely(qc);
            navigate({ to: "/", replace: true });
          }}
          className="paper w-full p-4 text-left text-sm text-muted-foreground"
        >
          Sign out
        </button>
      </Section>
    </AppShell>
  );
}
