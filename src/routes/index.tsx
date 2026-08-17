import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import icon from "@/assets/icon.png.asset.json";
import { Mascot } from "@/components/Mascot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laali — a cycle tracker built for two" },
      {
        name: "description",
        content:
          "A calm, private cycle tracker. Track your flow, moods and symptoms, and share exactly as much as you want with your partner.",
      },
      { property: "og:title", content: "Laali — a cycle tracker built for two" },
      {
        property: "og:description",
        content:
          "A calm, private cycle tracker with an optional partner view that shows only what you choose to share.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-10">
        <header className="flex items-center gap-2">
          <img src={icon.url} alt="" className="h-8 w-8" />
          <img src={logo.url} alt="Laali" className="h-7 w-auto" />
        </header>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="rise">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              A cycle tracker built for two
            </p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.05]">
              Your cycle, kept gently — and shared only as far as you choose.
            </h1>
            <p className="mt-5 max-w-sm text-base text-muted-foreground">
              Log a day in seconds. See where you are in your cycle at a glance. Invite your partner
              into a separate view that shows only what you switch on, and nothing more.
            </p>
          </div>

          <div className="relative mt-10 flex items-end justify-center">
            <div
              className="absolute inset-x-8 bottom-3 h-40 petal-mask"
              style={{ background: "color-mix(in oklab, var(--rose) 16%, transparent)" }}
            />
            <Mascot state="celebratory" size={190} bob className="relative" />
          </div>

          <div className="mt-10 space-y-3">
            <Link
              to="/auth"
              className="flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-base font-semibold text-primary-foreground"
            >
              Start tracking
            </Link>
            <Link
              to="/auth"
              className="flex w-full items-center justify-center rounded-full border border-border bg-card py-3.5 text-base font-semibold"
            >
              I already have an account
            </Link>
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Partner invited you? Sign in and enter your code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
