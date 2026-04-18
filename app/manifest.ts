import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ImproTrack",
    short_name: "ImproTrack",
    description:
      "ImproTrack is a focused habit tracker with a calm homepage, dashboard, archive, and statistics.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6fbff",
    theme_color: "#6D28D9",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
