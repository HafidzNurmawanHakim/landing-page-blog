import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

/**
 * Blog content helpers (docs/13-blog.md §7).
 *
 * Content is authored as sanitized HTML (TipTap editor) or Markdown and stored
 * as-is. Public pages re-sanitize on render so stored content is never trusted.
 */

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "p",
    "br",
    "hr",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "blockquote",
    "ul",
    "ol",
    "li",
    "pre",
    "code",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "iframe",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    iframe: ["src", "title", "width", "height", "allowfullscreen", "frameborder"],
    code: ["class"],
    pre: ["class"],
    th: ["align"],
    td: ["align"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.vimeo.com"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "nofollow noopener", target: "_blank" }),
  },
};

/** Sanitize raw HTML (admin-authored content) into safe HTML for the public site. */
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/** Convert Markdown to sanitized HTML. */
export function markdownToSanitizedHtml(markdown: string): string {
  const raw = marked.parse(markdown, { async: false }) as string;
  return sanitizeBlogHtml(raw);
}

/** Strip HTML tags → plain text (for excerpt fallback / reading time). */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Rough reading-time in minutes (~200 WPM, docs/13-blog.md §5.2). */
export function estimateReadingTime(content: string, contentType?: string): number {
  if (!content) return 1;
  const text =
    contentType === "markdown" ? content.replace(/[#>*_`\-\[\]()!]/g, " ") : stripHtml(content);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Resolve the HTML a post should render on the public site. */
export function renderBlogContent(content: string, contentType?: string): string {
  if (contentType === "markdown") return markdownToSanitizedHtml(content);
  return sanitizeBlogHtml(content);
}
