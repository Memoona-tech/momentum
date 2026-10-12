import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://momentum-habits.vercel.app";
  const routes = [
    "",
    "/habits",
    "/streaks",
    "/analytics",
    "/notes",
    "/reports",
    "/settings",
    "/widgets",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
