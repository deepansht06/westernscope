import type { MetadataRoute } from "next";
import { listCourses } from "@/lib/courses";
import { codeToSlug } from "@/lib/slug";

const BASE_URL = "https://westernscope.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await listCourses();
  const now = new Date();

  return [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${BASE_URL}/courses`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...courses.map((c) => ({
      url: `${BASE_URL}/courses/${codeToSlug(c.code)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
