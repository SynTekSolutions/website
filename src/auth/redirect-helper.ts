/**
 * Centralized redirection helper module.
 * Sanitizes URLs to prevent Open Redirect vulnerabilities and constructs login redirects.
 */

/**
 * Safely validates a redirect URL.
 * Ensures the target is strictly an internal, relative route.
 *
 * @param url The redirect URL to check.
 * @param fallback The fallback URL if the validation fails (defaults to "/admin/leads").
 */
export function sanitizeRedirectUrl(url: string | null | undefined, fallback = "/admin/leads"): string {
  if (!url) {
    return fallback;
  }

  // Decode to handle double-encoded parameters
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    // Ignore URI malformed errors
  }

  // Reject any URLs containing backslashes to prevent backslash-based open redirects
  if (decoded.includes("\\")) {
    return fallback;
  }

  // Prevent protocol-relative redirects (e.g. //attacker.com)
  if (decoded.startsWith("//")) {
    return fallback;
  }

  try {
    // Resolve relative to a dummy base URL
    const parsed = new URL(decoded, "http://localhost");
    
    // Ensure origin matches the dummy base (relative path) and the pathname starts with '/'
    if (parsed.origin === "http://localhost" && parsed.pathname.startsWith("/")) {
      return decoded;
    }
  } catch {
    // URL parsing failed, return fallback
  }

  return fallback;
}

/**
 * Safely constructs a login redirect URL passing the current path as a query parameter.
 *
 * @param currentPathAndQuery The current relative path and query parameters.
 */
export function buildSignInRedirectUrl(currentPathAndQuery: string): string {
  const sanitized = sanitizeRedirectUrl(currentPathAndQuery);
  return `/sign-in?redirect_url=${encodeURIComponent(sanitized)}`;
}
