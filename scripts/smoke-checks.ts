import assert from "node:assert/strict";
import nextConfig from "../next.config";
import {
  SEO_PAGES,
  SEO_PAGE_LAST_MODIFIED,
  type SeoPage,
} from "../lib/seo-pages";
import { getSafeImageUrl } from "../lib/safe-image-url";
import { normalizeSiteUrl } from "../lib/site-url";

function assertUnique<T>(items: T[], label: string) {
  assert.equal(
    new Set(items).size,
    items.length,
    `${label} should not contain duplicates`,
  );
}

function assertSeoPage(page: SeoPage) {
  assert.ok(page.path.startsWith("/"), `${page.slug} path should be absolute`);
  assert.ok(page.metaTitle.length > 0, `${page.slug} should have a meta title`);
  assert.ok(
    page.metaDescription.length > 0,
    `${page.slug} should have a meta description`,
  );
  assert.equal(
    page.lastModified,
    SEO_PAGE_LAST_MODIFIED,
    `${page.slug} lastModified should stay in sync with the shared SEO timestamp`,
  );
}

function run() {
  assert.ok(SEO_PAGES.length > 0, "SEO pages should be defined");
  assertUnique(
    SEO_PAGES.map((page) => page.slug),
    "SEO page slugs",
  );
  assertUnique(
    SEO_PAGES.map((page) => page.path),
    "SEO page paths",
  );
  SEO_PAGES.forEach(assertSeoPage);

  assert.equal(
    normalizeSiteUrl(" improtrack.app "),
    "https://improtrack.app",
    "Protocol-less site URLs should normalize to HTTPS origins",
  );
  assert.equal(
    normalizeSiteUrl("https://improtrack.app/path?q=1"),
    "https://improtrack.app",
    "Site URL normalization should strip paths and queries",
  );
  assert.equal(
    normalizeSiteUrl(""),
    "http://localhost:3000",
    "Empty site URLs should fall back to localhost",
  );
  assert.equal(
    getSafeImageUrl("https://example.com/avatar.png"),
    "https://example.com/avatar.png",
    "HTTPS avatar URLs should be allowed",
  );
  assert.equal(
    getSafeImageUrl("blob:https://improtrack.app/example"),
    "blob:https://improtrack.app/example",
    "Blob preview URLs should be allowed",
  );
  assert.equal(
    getSafeImageUrl("javascript:alert(1)"),
    null,
    "Unsafe avatar URL schemes should be rejected",
  );
  assert.equal(
    getSafeImageUrl("http://example.com/avatar.png"),
    null,
    "Non-HTTPS remote avatar URLs should be rejected",
  );

  assert.ok(
    nextConfig.allowedDevOrigins?.includes("localhost"),
    "Next allowedDevOrigins should include localhost",
  );
  assert.ok(
    nextConfig.allowedDevOrigins?.includes("127.0.0.1"),
    "Next allowedDevOrigins should include 127.0.0.1",
  );

  process.stdout.write("Smoke checks passed.\n");
}

run();
