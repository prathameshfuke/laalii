import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  INVITE_LENGTH,
  normalizeCode,
  isCompleteCode,
  inviteLink,
  inviteMessage,
  inviteErrorMessage,
  stashCode,
  takeStashedCode,
  clearStashedCode,
} from "../src/lib/invite";
import { destinationFor, guard } from "../src/lib/routing";
import { authMessage } from "../src/lib/auth-errors";
import {
  predict,
  predictExtended,
  cycleLengths,
  EXPERIENCE_CATEGORIES,
  LIFE_STAGE_MODES,
  BIRTH_CONTROL_METHODS,
  type CycleRow,
} from "../src/lib/cycle";
import type { Profile } from "../src/lib/data";

describe("Invite-code sharing and formatting", () => {
  it("normalizes codes to 6 uppercase alphanumeric characters", () => {
    expect(normalizeCode("abc123")).toBe("ABC123");
    expect(normalizeCode("  a-b-c 4 5 6  ")).toBe("ABC456");
    expect(normalizeCode("lowercase-code-too-long")).toBe("LOWERCASE".slice(0, INVITE_LENGTH));
    expect(normalizeCode("!@#$%^&*()")).toBe("");
  });

  it("checks code completeness based on INVITE_LENGTH", () => {
    expect(isCompleteCode("ABC123")).toBe(true);
    expect(isCompleteCode("abc123")).toBe(true); // normalizes to 6 chars
    expect(isCompleteCode("12345")).toBe(false);
    expect(isCompleteCode("")).toBe(false);
  });

  it("generates correct invite link with partner intent and code", () => {
    const link = inviteLink("ABC123", "https://laalii.app");
    expect(link).toBe("https://laalii.app/auth?role=partner&code=ABC123");
  });

  it("generates user-friendly invite message with instructions", () => {
    const msg = inviteMessage("ABC123", "https://laalii.app");
    expect(msg).toContain("Join me on Laali");
    expect(msg).toContain("https://laalii.app/auth?role=partner&code=ABC123");
    expect(msg).toContain("code ABC123 is already filled in for you");
  });

  describe("Session storage code persistence across auth round-trips", () => {
    const mockStorage: Record<string, string> = {};

    beforeEach(() => {
      for (const k in mockStorage) delete mockStorage[k];
      globalThis.sessionStorage = {
        getItem: (k: string) => mockStorage[k] ?? null,
        setItem: (k: string, v: string) => { mockStorage[k] = v; },
        removeItem: (k: string) => { delete mockStorage[k]; },
        clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
        length: 0,
        key: () => null,
      };
    });

    it("stashes, takes, and clears invite code", () => {
      stashCode("xyz789");
      expect(takeStashedCode()).toBe("XYZ789");
      clearStashedCode();
      expect(takeStashedCode()).toBe("");
    });

    it("ignores empty or invalid stashed codes", () => {
      stashCode("");
      expect(takeStashedCode()).toBe("");
      stashCode(null);
      expect(takeStashedCode()).toBe("");
    });
  });
});

describe("Invalid and expired invite codes handling", () => {
  it("provides helpful guidance when invite code does not match", () => {
    const err = new Error("Code does not match any open link");
    const msg = inviteErrorMessage(err);
    expect(msg).toContain("could not find that code");
    expect(msg).toContain("letter O and the digit 0");
  });

  it("warns user if they attempt to pair with their own code", () => {
    const err = new Error("Cannot pair with your own invite code");
    const msg = inviteErrorMessage(err);
    expect(msg).toContain("That is your own code");
  });

  it("notifies when code has already been redeemed by someone else", () => {
    const err = new Error("This invite code has already been used");
    const msg = inviteErrorMessage(err);
    expect(msg).toContain("already connected to someone else");
  });

  it("prompts re-authentication if session expired", () => {
    const err = new Error("User is not signed in");
    const msg = inviteErrorMessage(err);
    expect(msg).toContain("Your session expired");
  });

  it("handles network and server fetch errors gracefully", () => {
    const err = new Error("Failed to fetch");
    const msg = inviteErrorMessage(err);
    expect(msg).toContain("could not reach the server");
  });

  it("falls back to generic retry advice for unknown errors", () => {
    const msg = inviteErrorMessage("some unexpected error string");
    expect(msg).toContain("That code did not work");
  });
});

describe("Partner intent, role routing and guard enforcement", () => {
  it("redirects unauthenticated users to /auth", () => {
    expect(destinationFor(null)).toBe("/auth");
  });

  it("sends signed-in user with no role to /role", () => {
    const p = { role: null, onboarded: false } as unknown as Profile;
    expect(destinationFor(p)).toBe("/role");
  });

  it("directs partner role to /partner-setup when not onboarded", () => {
    const p = { role: "partner", onboarded: false } as unknown as Profile;
    expect(destinationFor(p)).toBe("/partner-setup");
  });

  it("directs partner role to /partner when onboarded", () => {
    const p = { role: "partner", onboarded: true } as unknown as Profile;
    expect(destinationFor(p)).toBe("/partner");
  });

  it("directs primary role to /onboarding when not onboarded", () => {
    const p = { role: "primary", onboarded: false } as unknown as Profile;
    expect(destinationFor(p)).toBe("/onboarding");
  });

  it("directs primary role to /home when onboarded", () => {
    const p = { role: "primary", onboarded: true } as unknown as Profile;
    expect(destinationFor(p)).toBe("/home");
  });

  describe("Route guard checks", () => {
    it("confines uncompleted setup to setup path", () => {
      const p = { role: "partner", onboarded: false } as unknown as Profile;
      // Allowed on its setup route
      expect(guard(p, "/partner-setup")).toBeNull();
      // Blocked from /partner or /home, routed back to /partner-setup
      expect(guard(p, "/partner")).toBe("/partner-setup");
      expect(guard(p, "/home")).toBe("/partner-setup");
    });

    it("blocks onboarded partner from accessing primary routes", () => {
      const p = { role: "partner", onboarded: true } as unknown as Profile;
      expect(guard(p, "/home")).toBe("/partner");
      expect(guard(p, "/calendar")).toBe("/partner");
      expect(guard(p, "/partner")).toBeNull();
    });

    it("blocks onboarded primary from accessing partner routes", () => {
      const p = { role: "primary", onboarded: true } as unknown as Profile;
      expect(guard(p, "/partner")).toBe("/home");
      expect(guard(p, "/home")).toBeNull();
    });
  });
});

describe("Authentication error states", () => {
  it("translates invalid login credentials", () => {
    const msg = authMessage(new Error("Invalid login credentials"), "signin");
    expect(msg).toBe(
      "That email and password do not match. Check the password, or create an account if you are new here."
    );
  });

  it("translates duplicate registration", () => {
    const msg = authMessage(new Error("User already registered"), "signup");
    expect(msg).toBe("There is already an account with this email. Try signing in instead.");
  });

  it("translates short password requirements", () => {
    const msg = authMessage(new Error("Password should be at least 6 characters"), "signup");
    expect(msg).toBe("Please use a password of at least six characters.");
  });

  it("translates invalid email formatting", () => {
    const msg = authMessage(new Error("Email address is invalid"), "signup");
    expect(msg).toBe("That email address does not look right.");
  });

  it("translates rate limit error", () => {
    const msg = authMessage(new Error("rate limit exceeded (too many requests)"), "signin");
    expect(msg).toBe("Too many attempts just now. Wait a minute and try again.");
  });

  it("translates unconfirmed email state", () => {
    const msg = authMessage(new Error("Email not confirmed"), "signin");
    expect(msg).toBe(
      "This email is not confirmed yet. Open the link we sent you, or ask for a new one below."
    );
  });

  it("translates network errors", () => {
    const msg = authMessage(new Error("Failed to fetch"), "signin");
    expect(msg).toBe("We could not reach the server. Check your connection and try again.");
  });

  it("falls back to appropriate default message per mode", () => {
    expect(authMessage(new Error("some odd error"), "signin")).toBe(
      "We could not sign you in. Please try again."
    );
    expect(authMessage(new Error("some odd error"), "signup")).toBe(
      "We could not create the account. Please try again."
    );
  });
});

describe("Clinically validated cycle predictions & extended forecasts", () => {
  const sampleCycles: CycleRow[] = [
    { id: "1", period_start: "2026-01-01", period_end: "2026-01-05" },
    { id: "2", period_start: "2026-01-29", period_end: "2026-02-02" }, // 28 days
    { id: "3", period_start: "2026-02-26", period_end: "2026-03-02" }, // 28 days
    { id: "4", period_start: "2026-03-26", period_end: "2026-03-30" }, // 28 days
  ];

  it("calculates cycle lengths between consecutive period starts", () => {
    const lengths = cycleLengths(sampleCycles);
    expect(lengths).toEqual([28, 28, 28]);
  });

  it("predicts next period, ovulation, and fertile window with high confidence", () => {
    const p = predict(sampleCycles, { avgCycleLength: 28, lutealLength: 14 });
    expect(p.cycleLength).toBe(28);
    expect(p.lutealLength).toBe(14);
    expect(p.variance).toBe(0);
    expect(p.confidence).toBe("high");
    expect(p.nextStart).not.toBeNull();
    expect(p.ovulation).not.toBeNull();
    expect(p.fertileFrom).not.toBeNull();
    expect(p.fertileTo).not.toBeNull();
  });

  it("generates extended multi-cycle predictions for up to 6 cycles ahead", () => {
    const forecasts = predictExtended(sampleCycles, 6, { avgCycleLength: 28, lutealLength: 14 });
    expect(forecasts.length).toBe(6);

    for (let i = 0; i < forecasts.length; i++) {
      const f = forecasts[i]!;
      expect(f.cycleIndex).toBe(i + 1);
      expect(f.periodStart).toBeInstanceOf(Date);
      expect(f.periodEnd).toBeInstanceOf(Date);
      expect(f.ovulationDate).toBeInstanceOf(Date);
      expect(f.fertileFrom).toBeInstanceOf(Date);
      expect(f.fertileTo).toBeInstanceOf(Date);
      expect(["high", "medium", "low"]).toContain(f.confidence);
    }
  });

  it("defines > 200 physical and emotional experience categories", () => {
    let totalItems = 0;
    for (const cat of EXPERIENCE_CATEGORIES) {
      expect(cat.id).toBeDefined();
      expect(cat.label).toBeDefined();
      expect(cat.items.length).toBeGreaterThan(0);
      totalItems += cat.items.length;
    }
    expect(totalItems).toBeGreaterThanOrEqual(200);
  });

  it("defines supported Life Stage Modes and Birth Control Methods", () => {
    expect(LIFE_STAGE_MODES.length).toBe(4);
    const modeIds = LIFE_STAGE_MODES.map((m) => m.id);
    expect(modeIds).toContain("period_tracking");
    expect(modeIds).toContain("clue_conceive");
    expect(modeIds).toContain("clue_pregnancy");
    expect(modeIds).toContain("perimenopause");

    expect(BIRTH_CONTROL_METHODS.length).toBeGreaterThan(5);
    const methodIds = BIRTH_CONTROL_METHODS.map((b) => b.id);
    expect(methodIds).toContain("combined_pill");
    expect(methodIds).toContain("hormonal_iud");
    expect(methodIds).toContain("patch");
  });
});
