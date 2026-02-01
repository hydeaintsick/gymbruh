import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "gymbruh — AI Gym Companion",
    short_name: "gymbruh",
    description:
      "Ton compagnon gym IA. Décris tes séances en langage naturel. Mistral construit ton entraînement. KPIs, PRs hypothétiques, compare avec les amis — tout en vocal.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#22c55e",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
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
    categories: ["fitness", "health", "lifestyle"],
  };
}
