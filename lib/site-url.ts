const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return DEFAULT_SITE_URL;
  }

  const withProtocol =
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://")
      ? normalizedValue
      : `https://${normalizedValue}`;

  return new URL(withProtocol).origin;
}

export function getSiteUrl() {
  return normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.SITE_URL ??
      process.env.VERCEL_PROJECT_PRODUCTION_URL ??
      process.env.VERCEL_URL ??
      DEFAULT_SITE_URL,
  );
}
