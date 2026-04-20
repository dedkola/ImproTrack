import type { MetadataRoute } from "next";

const name = "ImproTrack";
const description =
  "ImproTrack is a focused habit tracker for daily routines, streaks, archive history, and progress insights.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name,
    short_name: name,
    description,
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#6D28D9",
    categories: ["productivity", "lifestyle"],
    lang: "en-US",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Open dashboard",
        short_name: "Dashboard",
        description: "Jump into today’s habits and check-ins.",
        url: "/dashboard",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "View stats",
        short_name: "Stats",
        description: "Review streaks, completion trends, and progress signals.",
        url: "/dashboard/stats",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
    screenshots: [
      {
        src: "/brand/dashboard-shot.png",
        sizes: "3198x2126",
        type: "image/png",
        label: "Dashboard view with habits and weekly progress",
      },
      {
        src: "/brand/stats-shot.png",
        sizes: "3198x3604",
        type: "image/png",
        label: "Statistics view with streaks and trend charts",
      },
      {
        src: "/brand/archive-shot.png",
        sizes: "3198x2126",
        type: "image/png",
        label: "Archive view for paused or retired habits",
      },
    ],
    prefer_related_applications: false,
  };
}
