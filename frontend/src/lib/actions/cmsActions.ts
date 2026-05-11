"use server";

import { db } from "@/src/db";
import {
    pages,
    pageTranslations,
    newsArticles,
    newsTranslations,
    successStories,
    storyTranslations,
    sectors,
    sectorTranslations,
    resources,
    resourceTranslations,
} from "@/src/db/schema";
import { eq, and, desc } from "drizzle-orm";

import type { Block } from "@/src/db/blocks";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type Locale = "es" | "en";

export interface PageData {
    id: number;
    key: string;
    title: string;
    slug: string;
    metaDescription: string | null;
    blocks: Block[];
}

export interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImageUrl: string | null;
    publishedAt: Date | null;
}

export interface NewsArticleData {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string;
    featuredImageUrl: string | null;
    publishedAt: Date | null;
}

export interface SuccessStoryItem {
    id: number;
    title: string;
    slug: string;
    body: string;
    featuredImageUrl: string | null;
    sectorName: string | null;
    sectorColor: string | null;
}

export interface ResourceItem {
    id: number;
    title: string;
    description: string | null;
    fileUrl: string;
    fileType: string;
    fileSizeBytes: number | null;
}

interface ActionSuccess<T> {
    success: true;
    data: T;
}

interface ActionError {
    success: false;
    error: string;
}

type ActionResult<T> = ActionSuccess<T> | ActionError;

// ═══════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch a page by its translated slug for a given locale.
 */
export async function getPageBySlug(
    slug: string,
    locale: Locale,
): Promise<ActionResult<PageData>> {
    try {
        const rows = await db
            .select({
                id: pages.id,
                key: pages.key,
                title: pageTranslations.title,
                slug: pageTranslations.slug,
                metaDescription: pageTranslations.metaDescription,
                blocks: pageTranslations.blocks,
            })
            .from(pages)
            .innerJoin(
                pageTranslations,
                and(
                    eq(pageTranslations.pageId, pages.id),
                    eq(pageTranslations.locale, locale),
                ),
            )
            .where(
                and(eq(pageTranslations.slug, slug), eq(pages.status, "published")),
            )
            .limit(1);

        if (rows.length === 0) {
            return {
                success: false,
                error: `Page "${slug}" not found for locale "${locale}"`,
            };
        }

        return { success: true, data: rows[0] as PageData };
    } catch (error) {
        console.error("[getPageBySlug]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// NEWS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Paginated list of published news articles.
 */
export async function getNewsList(
    locale: Locale,
    limit = 10,
    offset = 0,
): Promise<ActionResult<NewsItem[]>> {
    try {
        const rows = await db
            .select({
                id: newsArticles.id,
                title: newsTranslations.title,
                slug: newsTranslations.slug,
                excerpt: newsTranslations.excerpt,
                featuredImageUrl: newsArticles.featuredImageUrl,
                publishedAt: newsArticles.publishedAt,
            })
            .from(newsArticles)
            .innerJoin(
                newsTranslations,
                and(
                    eq(newsTranslations.articleId, newsArticles.id),
                    eq(newsTranslations.locale, locale),
                ),
            )
            .where(eq(newsArticles.status, "published"))
            .orderBy(desc(newsArticles.publishedAt))
            .limit(limit)
            .offset(offset);

        return { success: true, data: rows };
    } catch (error) {
        console.error("[getNewsList]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Single news article by slug.
 */
export async function getNewsArticle(
    slug: string,
    locale: Locale,
): Promise<ActionResult<NewsArticleData>> {
    try {
        const rows = await db
            .select({
                id: newsArticles.id,
                title: newsTranslations.title,
                slug: newsTranslations.slug,
                excerpt: newsTranslations.excerpt,
                body: newsTranslations.body,
                featuredImageUrl: newsArticles.featuredImageUrl,
                publishedAt: newsArticles.publishedAt,
            })
            .from(newsArticles)
            .innerJoin(
                newsTranslations,
                and(
                    eq(newsTranslations.articleId, newsArticles.id),
                    eq(newsTranslations.locale, locale),
                ),
            )
            .where(
                and(
                    eq(newsTranslations.slug, slug),
                    eq(newsArticles.status, "published"),
                ),
            )
            .limit(1);

        if (rows.length === 0) {
            return { success: false, error: `Article "${slug}" not found` };
        }

        return { success: true, data: rows[0] };
    } catch (error) {
        console.error("[getNewsArticle]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SUCCESS STORIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * All published success stories with sector name (translated) and color.
 * Single query: stories → story_translations → sectors → sector_translations.
 */
export async function getSuccessStories(
    locale: Locale,
): Promise<ActionResult<SuccessStoryItem[]>> {
    try {
        const rows = await db
            .select({
                id: successStories.id,
                title: storyTranslations.title,
                slug: storyTranslations.slug,
                body: storyTranslations.body,
                featuredImageUrl: successStories.featuredImageUrl,
                sectorName: sectorTranslations.name,
                sectorColor: sectors.color,
            })
            .from(successStories)
            .innerJoin(
                storyTranslations,
                and(
                    eq(storyTranslations.storyId, successStories.id),
                    eq(storyTranslations.locale, locale),
                ),
            )
            .leftJoin(sectors, eq(sectors.id, successStories.sectorId))
            .leftJoin(
                sectorTranslations,
                and(
                    eq(sectorTranslations.sectorId, sectors.id),
                    eq(sectorTranslations.locale, locale),
                ),
            )
            .where(eq(successStories.status, "published"))
            .orderBy(desc(successStories.createdAt));

        return { success: true, data: rows };
    } catch (error) {
        console.error("[getSuccessStories]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCES / LEGAL DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * All published downloadable resources.
 */
export async function getResources(
    locale: Locale,
): Promise<ActionResult<ResourceItem[]>> {
    try {
        const rows = await db
            .select({
                id: resources.id,
                title: resourceTranslations.title,
                description: resourceTranslations.description,
                fileUrl: resources.fileUrl,
                fileType: resources.fileType,
                fileSizeBytes: resources.fileSizeBytes,
            })
            .from(resources)
            .innerJoin(
                resourceTranslations,
                and(
                    eq(resourceTranslations.resourceId, resources.id),
                    eq(resourceTranslations.locale, locale),
                ),
            )
            .where(eq(resources.status, "published"))
            .orderBy(desc(resources.createdAt));

        return { success: true, data: rows };
    } catch (error) {
        console.error("[getResources]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
