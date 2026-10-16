// Only same-origin relative paths are allowed as post-login redirects.
export function isValidCallbackUrl(cb?: string | null): cb is string {
  if (!cb || typeof cb !== "string") return false;
  if (!cb.startsWith("/") || cb.includes("\\")) return false;
  try {
    return new URL(cb, "http://x").origin === "http://x";
  } catch {
    return false;
  }
}
