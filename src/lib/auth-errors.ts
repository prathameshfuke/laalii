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

/** Plain words for the text message sign in, sending a code and checking it. */
export function phoneAuthMessage(error: unknown, step: "send" | "verify"): string {
  const text = (error instanceof Error ? error.message : String(error ?? "")).toLowerCase();
  if (text.includes("phone") && (text.includes("not enabled") || text.includes("unsupported") || text.includes("disabled"))) {
    return "Text message sign in is not switched on for this app yet. Use email or Google for now.";
  }
  if (text.includes("invalid phone") || text.includes("phone number")) {
    return "That number does not look right. Include the country code, for example +91 98765 43210.";
  }
  if (text.includes("expired")) {
    return "That code has expired. Ask for a new one.";
  }
  if (text.includes("token") || text.includes("otp") || text.includes("invalid")) {
    return "That code did not match. Check the six digits and try again.";
  }
  if (text.includes("rate limit") || text.includes("too many") || text.includes("over_sms_send_rate_limit")) {
    return "Too many messages just now. Wait a minute, then ask again.";
  }
  if (text.includes("failed to fetch") || text.includes("network")) {
    return "We could not reach the server. Check your connection and try again.";
  }
  return step === "send"
    ? "We could not send the code. Please try again."
    : "We could not check that code. Please try again.";
}
