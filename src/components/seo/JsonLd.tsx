import React from 'react';

export type PersonSchema = {
    '@type': 'Person';
    name: string;
    url?: string;
};

export type WebSiteSchema = {
    '@context': 'https://schema.org';
    '@type': 'WebSite';
    name: string;
    url: string;
    description?: string;
    publisher?: PersonSchema | { '@type': 'Organization'; name: string };
};

export type ArticleSchema = {
    '@context': 'https://schema.org';
    '@type': 'Article';
    headline: string;
    description?: string;
    image?: string[];
    datePublished?: string;
    dateModified?: string;
    author?: PersonSchema | PersonSchema[];
};

export type BreadcrumbListSchema = {
    '@context': 'https://schema.org';
    '@type': 'BreadcrumbList';
    itemListElement: {
        '@type': 'ListItem';
        position: number;
        name: string;
        item?: string;
    }[];
};

type SchemaType = WebSiteSchema | ArticleSchema | BreadcrumbListSchema | Record<string, unknown>;

export interface JsonLdProps<T extends SchemaType> {
    schema: T;
}

/**
 * Injects structured JSON-LD data into the HEAD of the document.
 * Crucial for Google Rich Snippets.
 */
export function JsonLd<T extends SchemaType>({ schema }: JsonLdProps<T>) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
