/**
 * One place turns a pairing failure into something a person can act on, so both
 * the setup step and the partner home say the same thing about the same code.
 */

export const INVITE_LENGTH = 6;

/** Codes are six characters, letters and digits only. */
export function normalizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, INVITE_LENGTH);
}

export function isCompleteCode(code: string): boolean {
  return normalizeCode(code).length === INVITE_LENGTH;
}

export function inviteErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const text = raw.toLowerCase();

  if (text.includes("does not match")) {
    return "We could not find that code. Check for typos, and remember the letter O and the digit 0 look alike.";
  }
  if (text.includes("your own")) {
    return "That is your own code. Ask your partner for the one in their Laali settings.";
  }
  if (text.includes("already been used")) {
    return "That code is already connected to someone else. Ask your partner to create a fresh one.";
  }
  if (text.includes("not signed in")) {
    return "Your session expired. Sign in again and try the code once more.";
  }
  if (text.includes("failed to fetch") || text.includes("network")) {
    return "We could not reach the server. Check your connection and try again.";
  }
  return "That code did not work. Ask your partner to read it out again, or to make a new one.";
}
