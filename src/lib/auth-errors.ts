/**
 * Error handling and user-facing messages for Supabase authentication flows.
 */

export function authMessage(error: unknown, mode: "signin" | "signup"): string {
  const text = (error instanceof Error ? error.message : String(error ?? "")).toLowerCase();
  if (text.includes("invalid login credentials")) {
    return "That email and password do not match. Check the password, or create an account if you are new here.";
  }
  if (text.includes("already registered") || text.includes("already been registered")) {
    return "There is already an account with this email. Try signing in instead.";
  }
  if (text.includes("password should be")) {
    return "Please use a password of at least six characters.";
  }
  if (text.includes("email address") && text.includes("invalid")) {
    return "That email address does not look right.";
  }
  if (text.includes("rate limit") || text.includes("too many")) {
    return "Too many attempts just now. Wait a minute and try again.";
  }
  if (text.includes("failed to fetch") || text.includes("network")) {
    return "We could not reach the server. Check your connection and try again.";
  }
  if (text.includes("not confirmed")) {
    return "This email is not confirmed yet. Open the link we sent you, or ask for a new one below.";
  }
  return mode === "signin"
    ? "We could not sign you in. Please try again."
    : "We could not create the account. Please try again.";
}
