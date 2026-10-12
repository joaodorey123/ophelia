/**
 * Diary articles.
 *
 * The storefront reads `content/posts.json` newest-first and takes the first
 * three for the home page, so order is editorial, not incidental — which is
 * why the list screen lets it be changed by hand rather than sorting by date.
 * The dates are human strings ("28 agosto"), not machine dates, so they cannot
 * be sorted on anyway.
 */

export type Post = {
  slug: string;
  kicker: string;
  date: string;
  image: string;
  title: string;
  excerpt: string;
  body: string[];
};

export const POSTS_FILE = 'content/posts.json';

export function asPosts(document: unknown): Post[] {
  return Array.isArray(document) ? (document as Post[]) : [];
}

/** A URL-safe slug from a Portuguese title. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export function blankPost(): Post {
  return { slug: '', kicker: 'receitas', date: '', image: '', title: '', excerpt: '', body: [''] };
}

/**
 * Why a post cannot be saved yet.
 *
 * Checked here rather than in the form so the list screen and the editor agree,
 * and so a half-written article cannot reach the site through either.
 */
export function validatePost(post: Post, others: Post[]): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!post.title.trim()) errors.title = 'O artigo precisa de um título.';
  if (!post.excerpt.trim()) errors.excerpt = 'Escreve um resumo — é a frase grande no início.';
  if (!post.date.trim()) errors.date = 'Falta a data.';
  if (post.body.every((paragraph) => !paragraph.trim())) {
    errors.body = 'O artigo está vazio.';
  }

  const slug = post.slug.trim();
  if (!slug) {
    errors.slug = 'Falta o endereço do artigo.';
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'O endereço só pode ter letras minúsculas, números e hífenes.';
  } else if (others.some((other) => other.slug === slug)) {
    errors.slug = 'Já existe um artigo com este endereço.';
  }

  return errors;
}
