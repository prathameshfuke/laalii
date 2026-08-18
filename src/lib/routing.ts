import type { Profile } from "@/lib/data";

/**
 * One place decides where a signed-in person belongs. Both the route gate and
 * the post sign-in redirect read from here, so the two can never disagree.
 */

export const PRIMARY_STEPS = ["basics", "length", "history", "reminders", "couples"] as const;
export const PARTNER_STEPS = ["basics", "pair"] as const;

export type PrimaryStep = (typeof PRIMARY_STEPS)[number];
export type PartnerStep = (typeof PARTNER_STEPS)[number];

/** Routes that only make sense while an account is still being set up. */
export const SETUP_PATHS = ["/role", "/onboarding", "/partner-setup"];

export function destinationFor(profile: Profile | null): string {
  if (!profile) return "/auth";
  if (!profile.role) return "/role";
  if (profile.role === "partner") return profile.onboarded ? "/partner" : "/partner-setup";
  return profile.onboarded ? "/home" : "/onboarding";
}

/**
 * Given where someone is trying to go, returns the path to send them to
 * instead, or null when they are allowed to stay.
 */
export function guard(profile: Profile | null, pathname: string): string | null {
  const dest = destinationFor(profile);

  // Still setting up: the only place to be is the current setup step.
  if (SETUP_PATHS.includes(dest)) {
    return pathname === dest ? null : dest;
  }

  // Setup is done, so setup screens are off limits.
  if (SETUP_PATHS.includes(pathname)) return dest;

  const inPartnerArea = pathname === "/partner" || pathname.startsWith("/partner/");
  if (profile?.role === "partner" && !inPartnerArea) return "/partner";
  if (profile?.role === "primary" && inPartnerArea) return "/home";
  return null;
}

export function resumeStep<T extends readonly string[]>(
  steps: T,
  saved: string | null | undefined,
): number {
  const i = saved ? steps.indexOf(saved) : -1;
  return i >= 0 ? i : 0;
}
