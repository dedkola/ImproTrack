export function getSafeImageUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith("blob:")) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol === "https:") {
      return parsedUrl.toString();
    }
  } catch {
    // Ignore malformed URLs.
  }

  return null;
}
