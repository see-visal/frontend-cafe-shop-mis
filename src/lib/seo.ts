import type { Metadata } from 'next';

export const siteConfig = {
    name: 'SalSee Coffee',
    description: 'Begin your coffee journey with SalSee. Order ahead, track orders, and collect loyalty points with the Roastery Collective.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ogImage: '/og-image.jpg', // Place this file in public folder
    twitterHandle: '@salsee_coffee',
    keywords: ['coffee', 'cafe', 'roastery', 'order ahead', 'coffee shop'],
};

export type BuildMetadataProps = {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string[];
    noIndex?: boolean;
    path?: string;
};

/**
 * Helper function to generate SEO metadata for any page.
 * Merges page-specific metadata with base site configuration.
 */
export function buildMetadata({
    title,
    description,
    image,
    keywords,
    noIndex = false,
    path = '',
}: BuildMetadataProps = {}): Metadata {
    const finalTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
    const finalDescription = description || siteConfig.description;
    const finalImage = image || siteConfig.ogImage;
    const url = `${siteConfig.url}${path}`;

    return {
        title: finalTitle,
        description: finalDescription,
        keywords: keywords || siteConfig.keywords,
        metadataBase: new URL(siteConfig.url),
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: finalTitle,
            description: finalDescription,
            url,
            siteName: siteConfig.name,
            images: [
                {
                    url: finalImage,
                    width: 1200,
                    height: 630,
                    alt: finalTitle,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: finalTitle,
            description: finalDescription,
            images: [finalImage],
            creator: siteConfig.twitterHandle,
        },
        robots: {
            index: !noIndex,
            follow: !noIndex,
            googleBot: {
                index: !noIndex,
                follow: !noIndex,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}
