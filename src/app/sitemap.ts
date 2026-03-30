import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.url;

    const staticRoutes = [
        '',
        '/menu',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Example of adding dynamically generated routes from an API
    // const menuItems = await fetchMenuItems();
    // const dynamicRoutes = menuItems.map((item) => ({
    //     url: `${baseUrl}/menu/${item.slug}`,
    //     lastModified: new Date(item.updatedAt).toISOString(),
    //     changeFrequency: 'weekly' as const,
    //     priority: 0.6,
    // }));

    // return [...staticRoutes, ...dynamicRoutes];

    return staticRoutes;
}
