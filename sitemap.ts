import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://playpro-academy.id";

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },

        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },

        {
            url: `${baseUrl}/class-programs`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },

        {
            url: `${baseUrl}/schedules-booking`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },

        {
            url: `${baseUrl}/membership-package`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },

        {
            url: `${baseUrl}/gallery-activities`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        }
    ];
}