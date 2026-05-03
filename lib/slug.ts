// Course codes look like "COMPSCI 1027A" or "COMPSCI 1020A/B".
// We map them to URL-safe slugs:  "compsci-1027a", "compsci-1020a_b".

export function codeToSlug(code: string): string {
  return code.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "_");
}

export function slugToCode(slug: string): string | null {
  const parts = slug.toLowerCase().split("-");
  if (parts.length < 2) return null;
  const subject = parts[0].toUpperCase();
  const number = parts.slice(1).join("-").replace(/_/g, "/").toUpperCase();
  return `${subject} ${number}`;
}
