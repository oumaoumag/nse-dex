import { getArticleBySlug, getArticleFiles } from '@/utils/markdownUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

// Add custom styles for proper markdown formatting
import '@/styles/markdown.css';

// Generate static params for all articles
export async function generateStaticParams() {
    const articles = getArticleFiles();

    return articles.map((article) => ({
        slug: article.replace(/\.md$/, ''),
    }));
}

// Generate metadata for the page
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    const { data } = getArticleBySlug(params.slug, ['title', 'excerpt']);

    return {
        title: `${data.title || 'Article'} - Tajiri Learn`,
        description: data.excerpt,
    };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
    const { data, content } = getArticleBySlug(params.slug, [
        'title',
        'date',
        'author',
        'category',
        'image'
    ]);

    if (!data.title) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
                <p className="text-white/70 mb-8">The article you're looking for doesn't exist or has been moved.</p>
                <Link href="/learn" className="bg-decode-green text-black px-6 py-3 rounded-md font-medium">
                    Return to Articles
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back button */}
            <Link href="/learn" className="inline-flex items-center text-decode-green mb-8 hover:text-decode-blue transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Articles
            </Link>

            {/* Article header */}
            <header className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <span className="bg-decode-blue bg-opacity-20 text-decode-green px-3 py-1 rounded-full text-sm">
                        {data.category}
                    </span>
                    <span className="text-white/60">
                        {new Date(data.date as string).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{data.title}</h1>

                <div className="flex items-center">
                    <div className="bg-decode-green h-10 w-10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-black font-bold">
                            {data.author?.split(' ')[0][0]}
                            {data.author?.split(' ')[1]?.[0]}
                        </span>
                    </div>
                    <span className="text-white/80">{data.author}</span>
                </div>
            </header>

            {/* Featured image */}
            {data.image && (
                <div className="relative h-[400px] w-full mb-10 rounded-xl overflow-hidden">
                    <Image
                        src={data.image as string}
                        alt={data.title as string}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* Article content */}
            <article className="markdown-content prose prose-invert max-w-none 
                prose-headings:text-white 
                prose-headings:font-bold 
                prose-h1:text-3xl 
                prose-h2:text-2xl 
                prose-h2:mt-10 
                prose-h3:text-xl 
                prose-p:text-gray-300 
                prose-a:text-decode-green 
                hover:prose-a:text-decode-blue 
                prose-a:transition-colors 
                prose-a:no-underline
                prose-a:font-medium
                prose-img:rounded-xl
                prose-strong:text-white
                prose-strong:font-semibold
                prose-blockquote:border-decode-green
                prose-blockquote:bg-white/5
                prose-blockquote:py-1
                prose-blockquote:px-4
                prose-blockquote:rounded-r-md
                prose-blockquote:not-italic
                prose-blockquote:text-gray-300
                prose-li:text-gray-300
                prose-table:border-collapse
                prose-th:bg-white/10
                prose-th:text-white
                prose-th:p-2
                prose-th:border
                prose-th:border-white/20
                prose-td:p-2
                prose-td:border
                prose-td:border-white/20
                prose-td:text-gray-300
            ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </article>

            {/* Related articles - To be implemented */}
            <div className="mt-16 border-t border-white/10 pt-8">
                <h2 className="text-2xl font-bold text-white mb-6">Continue Learning</h2>
                <Link href="/learn" className="bg-decode-green text-black px-6 py-3 rounded-md font-medium inline-block">
                    Explore More Articles
                </Link>
            </div>
        </div>
    );
} 