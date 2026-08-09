import { and, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { getDb } from "../client";
import {
  blogCategories,
  blogPostReactions,
  blogPosts,
  type BlogCategory,
  type BlogPost,
} from "../schema";
import {
  DEFAULT_LOCALE,
  pickLocale,
  type LocalizedString,
  type Locale,
} from "@/lib/i18n/locales";

export const BLOG_REACTION_LIKE = "like";
export const BLOG_REACTION_SHARE = "share";

export const BLOG_POST_STATUSES = ["draft", "published", "archived"] as const;
export type BlogPostStatus = (typeof BLOG_POST_STATUSES)[number];

export type BlogPostListResult = {
  items: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type BlogPostFilters = {
  page?: number;
  limit?: number;
  status?: BlogPostStatus | "all";
  categorySlug?: string;
  keyword?: string;
  activeOnly?: boolean; // status = published AND published_at <= now
};

export type BlogCategoryFilters = {
  page?: number;
  limit?: number;
  keyword?: string;
};

export type BlogCategoryListResult = {
  items: BlogCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** Parse a `tags` JSON column into a plain array (Drizzle JSON mode already does this). */
export function serializeBlogPost(row: BlogPost) {
  return {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export type SerializedBlogPost = Omit<BlogPost, "tags"> & {
  tags: string[];
};

/** Join a post row with its category name/slug (for list/detail views). */
export type BlogPostWithCategory = SerializedBlogPost & {
  categoryName: LocalizedString | null;
  categorySlug: string | null;
};

/**
 * Post row with every localized field resolved to a concrete string for a
 * given locale (docs/06-i18n.md). Fallback: requested locale → default (`id`).
 */
export type LocalizedBlogPost = SerializedBlogPost & {
  title: string;
  excerpt: string | null;
  content: string;
  featuredImageAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryName: string | null;
};

export function localizeBlogPost<T extends SerializedBlogPost>(
  post: T,
  locale: Locale = DEFAULT_LOCALE
): T & LocalizedBlogPost {
  return {
    ...post,
    title: pickLocale(post.title, locale),
    excerpt: pickLocale(post.excerpt, locale) || null,
    content: pickLocale(post.content, locale),
    featuredImageAlt: pickLocale(post.featuredImageAlt, locale) || null,
    seoTitle: pickLocale(post.seoTitle, locale) || null,
    seoDescription: pickLocale(post.seoDescription, locale) || null,
    categoryName:
      "categoryName" in post && post.categoryName
        ? pickLocale(post.categoryName, locale) || null
        : null,
  } as T & LocalizedBlogPost;
}

export type LocalizedBlogCategory = BlogCategory & {
  name: string;
  description: string | null;
};

export function localizeBlogCategory<T extends BlogCategory>(
  category: T,
  locale: Locale = DEFAULT_LOCALE
): T & LocalizedBlogCategory {
  return {
    ...category,
    name: pickLocale(category.name, locale),
    description: pickLocale(category.description, locale) || null,
  } as T & LocalizedBlogCategory;
}

export async function listBlogPosts(
  filters: BlogPostFilters = {}
): Promise<BlogPostListResult> {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 12));
  const offset = (page - 1) * limit;
  const now = Math.floor(Date.now() / 1000);

  const conditions = [];

  if (filters.activeOnly) {
    conditions.push(
      eq(blogPosts.status, "published"),
      or(
        sql`${blogPosts.publishedAt} IS NULL`,
        sql`${blogPosts.publishedAt} <= ${now}`
      )
    );
  } else if (filters.status && filters.status !== "all") {
    conditions.push(eq(blogPosts.status, filters.status));
  }

  if (filters.categorySlug) {
    const category = await db
      .select({ id: blogCategories.id })
      .from(blogCategories)
      .where(eq(blogCategories.slug, filters.categorySlug))
      .limit(1);
    if (category[0]) {
      conditions.push(eq(blogPosts.categoryId, category[0].id));
    }
  }

  if (filters.keyword?.trim()) {
    const kw = `%${filters.keyword.trim()}%`;
    conditions.push(
      or(
        sql`${blogPosts.title} LIKE ${kw}`,
        sql`${blogPosts.excerpt} LIKE ${kw}`
      )
    );
  }

  const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(blogPosts)
      .where(where)
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(where),
  ]);

  const total = Number(countRows[0]?.count ?? 0);

  return {
    items: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** List published posts joined with their category, newest first. */
export async function listPublishedPostsWithCategory(
  filters: BlogPostFilters = {}
): Promise<{
  items: BlogPostWithCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { items, total, page, limit, totalPages } = await listBlogPosts({
    ...filters,
    activeOnly: true,
  });

  const categoryIds = [...new Set(items.map((p) => p.categoryId).filter(Boolean))];
  const categories =
    categoryIds.length > 0
      ? await getDb()
          .select({ id: blogCategories.id, name: blogCategories.name, slug: blogCategories.slug })
          .from(blogCategories)
          .where(sql`${blogCategories.id} IN ${categoryIds}`)
      : [];

  const catMap = new Map(categories.map((c) => [c.id, c]));

  return {
    items: items.map((p) => ({
      ...serializeBlogPost(p),
      categoryName: p.categoryId ? (catMap.get(p.categoryId)?.name ?? null) : null,
      categorySlug: p.categoryId ? (catMap.get(p.categoryId)?.slug ?? null) : null,
    })),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function incrementBlogViewCount(id: number): Promise<void> {
  const db = getDb();
  await db
    .update(blogPosts)
    .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
    .where(eq(blogPosts.id, id));
}

export type BlogPostInput = {
  title: LocalizedString;
  slug: string;
  excerpt?: LocalizedString | null;
  content: LocalizedString;
  contentType: "html" | "markdown";
  featuredImageUrl?: string | null;
  featuredImageAlt?: LocalizedString | null;
  categoryId?: number | null;
  tags: string[];
  status: BlogPostStatus;
  publishedAt?: number | null;
  seoTitle?: LocalizedString | null;
  seoDescription?: LocalizedString | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  noindex: number;
  authorId?: number | null;
  readingTime: number;
};

export async function createBlogPost(data: BlogPostInput): Promise<BlogPost> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const publishedAt =
    data.status === "published" ? (data.publishedAt ?? now) : data.publishedAt ?? null;

  const rows = await db
    .insert(blogPosts)
    .values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content,
      contentType: data.contentType,
      featuredImageUrl: data.featuredImageUrl || null,
      featuredImageAlt: data.featuredImageAlt || null,
      categoryId: data.categoryId ?? null,
      tags: data.tags,
      status: data.status,
      publishedAt,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      ogImageUrl: data.ogImageUrl || null,
      canonicalUrl: data.canonicalUrl || null,
      noindex: data.noindex,
      authorId: data.authorId ?? null,
      readingTime: data.readingTime,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return rows[0];
}

export async function updateBlogPost(
  id: number,
  data: BlogPostInput
): Promise<BlogPost | null> {
  const db = getDb();
  const existing = await getBlogPostById(id);
  if (!existing) return null;

  const now = Math.floor(Date.now() / 1000);
  const nextPublishedAt =
    data.status === "published"
      ? data.publishedAt ?? existing.publishedAt ?? now
      : data.publishedAt ?? null;

  const rows = await db
    .update(blogPosts)
    .set({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content,
      contentType: data.contentType,
      featuredImageUrl: data.featuredImageUrl || null,
      featuredImageAlt: data.featuredImageAlt || null,
      categoryId: data.categoryId ?? null,
      tags: data.tags,
      status: data.status,
      publishedAt: nextPublishedAt,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      ogImageUrl: data.ogImageUrl || null,
      canonicalUrl: data.canonicalUrl || null,
      noindex: data.noindex,
      authorId: data.authorId ?? null,
      readingTime: data.readingTime,
      updatedAt: now,
    })
    .where(eq(blogPosts.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteBlogPost(id: number): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .delete(blogPosts)
    .where(eq(blogPosts.id, id))
    .returning({ id: blogPosts.id });
  return rows.length > 0;
}

// --- Categories ---

export async function listBlogCategories(
  filters: BlogCategoryFilters = {}
): Promise<BlogCategoryListResult> {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 100));
  const offset = (page - 1) * limit;

  const where = filters.keyword?.trim()
    ? sql`${blogCategories.name} LIKE ${`%${filters.keyword.trim()}%`}`
    : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(blogCategories)
      .where(where)
      .orderBy(desc(blogCategories.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(blogCategories).where(where),
  ]);

  const total = Number(countRows[0]?.count ?? 0);

  return {
    items: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  const db = getDb();
  return db.select().from(blogCategories).orderBy(desc(blogCategories.createdAt));
}

export async function getBlogCategoryById(id: number): Promise<BlogCategory | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBlogPostCountByCategory(categoryId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)
    .where(eq(blogPosts.categoryId, categoryId));
  return Number(rows[0]?.count ?? 0);
}

export type BlogCategoryInput = {
  name: LocalizedString;
  slug: string;
  description?: LocalizedString | null;
};

export async function createBlogCategory(data: BlogCategoryInput): Promise<BlogCategory> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const rows = await db
    .insert(blogCategories)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return rows[0];
}

export async function updateBlogCategory(
  id: number,
  data: BlogCategoryInput
): Promise<BlogCategory | null> {
  const db = getDb();
  const existing = await getBlogCategoryById(id);
  if (!existing) return null;

  const rows = await db
    .update(blogCategories)
    .set({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(blogCategories.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteBlogCategory(id: number): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .delete(blogCategories)
    .where(eq(blogCategories.id, id))
    .returning({ id: blogCategories.id });
  return rows.length > 0;
}

// --- Reactions (like / share per IP) ---

export type BlogReactionState = {
  liked: boolean;
  shared: boolean;
};

export async function getBlogPostReactionStates(
  ids: number[],
  ip: string
): Promise<Map<number, BlogReactionState>> {
  const map = new Map<number, BlogReactionState>();
  for (const id of ids) map.set(id, { liked: false, shared: false });
  if (ids.length === 0) return map;

  const db = getDb();
  const rows = await db
    .select({
      postId: blogPostReactions.postId,
      type: blogPostReactions.type,
    })
    .from(blogPostReactions)
    .where(
      and(
        eq(blogPostReactions.ip, ip),
        inArray(blogPostReactions.postId, ids)
      )
    );

  for (const row of rows) {
    const state = map.get(row.postId);
    if (!state) continue;
    if (row.type === BLOG_REACTION_LIKE) state.liked = true;
    if (row.type === BLOG_REACTION_SHARE) state.shared = true;
  }
  return map;
}

export type ToggleLikeResult = { liked: boolean; likeCount: number };

export async function toggleBlogLike(
  id: number,
  ip: string
): Promise<ToggleLikeResult | null> {
  const db = getDb();
  const existing = await db
    .select({ id: blogPostReactions.id })
    .from(blogPostReactions)
    .where(
      and(
        eq(blogPostReactions.postId, id),
        eq(blogPostReactions.ip, ip),
        eq(blogPostReactions.type, BLOG_REACTION_LIKE)
      )
    )
    .limit(1);

  // Unlike: remove the reaction and decrement the counter (floor at 0).
  if (existing[0]) {
    await db
      .delete(blogPostReactions)
      .where(eq(blogPostReactions.id, existing[0].id));
    const [updated] = await db
      .update(blogPosts)
      .set({ likeCount: sql`max(${blogPosts.likeCount} - 1, 0)` })
      .where(eq(blogPosts.id, id))
      .returning({ likeCount: blogPosts.likeCount });
    return { liked: false, likeCount: Number(updated?.likeCount ?? 0) };
  }

  // Like: insert the reaction; only count when the insert won the race.
  const inserted = await db
    .insert(blogPostReactions)
    .values({ postId: id, ip, type: BLOG_REACTION_LIKE })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) {
    const [updated] = await db
      .update(blogPosts)
      .set({ likeCount: sql`${blogPosts.likeCount} + 1` })
      .where(eq(blogPosts.id, id))
      .returning({ likeCount: blogPosts.likeCount });
    return { liked: true, likeCount: Number(updated?.likeCount ?? 0) };
  }

  const [row] = await db
    .select({ likeCount: blogPosts.likeCount })
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return { liked: true, likeCount: Number(row?.likeCount ?? 0) };
}

export type ShareResult = { counted: boolean; shareCount: number };

export async function recordBlogShare(
  id: number,
  ip: string
): Promise<ShareResult | null> {
  const db = getDb();
  const inserted = await db
    .insert(blogPostReactions)
    .values({ postId: id, ip, type: BLOG_REACTION_SHARE })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) {
    const [updated] = await db
      .update(blogPosts)
      .set({ shareCount: sql`${blogPosts.shareCount} + 1` })
      .where(eq(blogPosts.id, id))
      .returning({ shareCount: blogPosts.shareCount });
    return { counted: true, shareCount: Number(updated?.shareCount ?? 0) };
  }

  const [row] = await db
    .select({ shareCount: blogPosts.shareCount })
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return { counted: false, shareCount: Number(row?.shareCount ?? 0) };
}

// --- Recommendations ---

/**
 * Recommend published posts for the given article: rank candidates by the
 * number of shared tags, then same category, then newest. Excludes the current
 * post. Used for the "Rekomendasi" block on the read page.
 */
export async function getRecommendedBlogPosts(
  currentPostId: number,
  tags: string[],
  categoryId: number | null,
  limit = 3
): Promise<BlogPostWithCategory[]> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  const candidates = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, "published"),
        ne(blogPosts.id, currentPostId),
        or(
          sql`${blogPosts.publishedAt} IS NULL`,
          sql`${blogPosts.publishedAt} <= ${now}`
        )
      )
    )
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
    .limit(30);

  if (candidates.length === 0) return [];

  const currentTags = new Set(tags.map((t) => t.toLowerCase().trim()));

  const scored = candidates
    .map((post) => {
      const postTags = Array.isArray(post.tags) ? post.tags : [];
      const overlap = postTags.filter((t) =>
        currentTags.has(t.toLowerCase().trim())
      ).length;
      return {
        post,
        score: overlap * 100 + (post.categoryId === categoryId ? 10 : 0),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);

  const categoryIds = [
    ...new Set(scored.map((p) => p.categoryId).filter(Boolean)),
  ];
  const categories =
    categoryIds.length > 0
      ? await db
          .select({ id: blogCategories.id, name: blogCategories.name, slug: blogCategories.slug })
          .from(blogCategories)
          .where(sql`${blogCategories.id} IN ${categoryIds}`)
      : [];

  const catMap = new Map(categories.map((c) => [c.id, c]));

  return scored.map((p) => ({
    ...serializeBlogPost(p),
    categoryName: p.categoryId ? (catMap.get(p.categoryId)?.name ?? null) : null,
    categorySlug: p.categoryId ? (catMap.get(p.categoryId)?.slug ?? null) : null,
  }));
}
