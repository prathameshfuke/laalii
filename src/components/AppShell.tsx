import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/logo.png.asset.json";
import { cn } from "@/lib/utils";
import {
  IconBook,
  IconCalendar,
  IconGear,
  IconHeart,
  IconPetal,
  IconSpark,
} from "@/components/Icons";

const HER_NAV = [
  { to: "/home", label: "Today", Icon: IconPetal },
  { to: "/calendar", label: "Calendar", Icon: IconCalendar },
  { to: "/insights", label: "Insights", Icon: IconSpark },
  { to: "/learn", label: "Learn", Icon: IconBook },
  { to: "/settings", label: "Settings", Icon: IconGear },
];

const HIS_NAV = [
  { to: "/partner", label: "Today", Icon: IconHeart },
  { to: "/partner/history", label: "History", Icon: IconCalendar },
  { to: "/partner/settings", label: "Account", Icon: IconGear },
];

export function AppShell({
  children,
  variant = "her",
  title,
  action,
}: {
  children: ReactNode;
  variant?: "her" | "his";
  title?: string;
  action?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = variant === "her" ? HER_NAV : HIS_NAV;

  return (
    <div className={cn("min-h-screen bg-background", variant === "his" && "partner-skin")}>
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between px-5">
          <Link to={variant === "her" ? "/home" : "/partner"} className="flex items-center gap-2">
            <img src={logo.url} alt="Laali" className="h-6 w-auto" />
            {variant === "his" ? (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.16em]">
                together
              </span>
            ) : null}
          </Link>
          {action}
        </div>
        {title ? (
          <div className="mx-auto w-full max-w-xl px-5 pb-3">
            <h1 className="text-2xl">{title}</h1>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-xl px-5 pb-32 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 backdrop-blur">
        <ul className="mx-auto flex w-full max-w-xl items-stretch justify-between px-3 py-2">
          {nav.map(({ to, label, Icon }) => {
            const active = to === "/partner" ? pathname === to : pathname.startsWith(to);
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl py-2 text-[0.65rem] transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-9 items-center justify-center rounded-full transition-colors",
                      active && "bg-primary/25",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function Section({
  title,
  children,
  hint,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-7 first:mt-0">
      {title ? (
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg">{title}</h2>
          {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
