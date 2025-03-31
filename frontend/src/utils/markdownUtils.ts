import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the type for article metadata
export interface ArticleMetadata {
    title: string;
    excerpt: string;
    date: string;
    author: string;
    category: string;
    image: string;
    slug: string;
}

// Path to the articles directory
const articlesDirectory = path.join(process.cwd(), 'public/articles');

/**
 * Get all article files
 */
export function getArticleFiles(): string[] {
    try {
        return fs.readdirSync(articlesDirectory)
            .filter(file => file.endsWith('.md'));
    } catch (error) {
        console.error('Error reading article files:', error);
        return [];
    }
}

/**
 * Get metadata for all articles
 */
export function getAllArticles(): ArticleMetadata[] {
    const articleFiles = getArticleFiles();

    const articles = articleFiles.map(filename => {
        // Remove .md extension to get the slug
        const slug = filename.replace(/\.md$/, '');

        // Get article metadata
        const { data } = getArticleBySlug(slug, ['title', 'excerpt', 'date', 'author', 'category', 'image']);

        return {
            ...data,
            slug,
        } as ArticleMetadata;
    });

    // Sort articles by date (newest first)
    return articles.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

/**
 * Get article content and metadata by slug
 */
export function getArticleBySlug(slug: string, fields: string[] = []): {
    data: Partial<ArticleMetadata>;
    content: string
} {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        const items: Partial<ArticleMetadata> = {};

        // Only include the requested fields
        fields.forEach((field) => {
            if (field === 'slug') {
                items[field] = slug;
            }
            if (field === 'content') {
                items[field] = content;
            }
            if (data[field]) {
                items[field] = data[field];
            }
        });

        return { data: items, content };
    } catch (error) {
        console.error(`Error reading article ${slug}:`, error);
        return { data: {}, content: '' };
    }
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: string): ArticleMetadata[] {
    const allArticles = getAllArticles();
    return allArticles.filter(article => article.category === category);
}

/**
 * Get unique categories from all articles
 */
export function getCategories(): string[] {
    const allArticles = getAllArticles();
    const categories = new Set(allArticles.map(article => article.category));
    return Array.from(categories);
} 