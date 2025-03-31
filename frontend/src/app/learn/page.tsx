import { getAllArticles } from '@/utils/markdownUtils';
import Link from 'next/link';
import Image from 'next/image';

export const generateMetadata = () => {
    return {
        title: 'Learn - Tajiri Finance',
        description: 'Educational resources and articles about cryptocurrency, blockchain, and DeFi',
    };
};

export default function LearnPage() {
    const articles = getAllArticles();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Educational <span className="bg-gradient-to-r from-decode-green to-decode-blue inline-block text-transparent bg-clip-text">Resources</span>
                </h1>

                <Link href="/learn/edit" className="bg-decode-green hover:bg-decode-green/90 text-black font-medium px-4 py-2 rounded-lg flex items-center transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Article
                </Link>
            </div>

            {articles.length === 0 ? (
                <div className="bg-decode-card border border-white/10 rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-semibold text-white mb-4">No Articles Yet</h2>
                    <p className="text-white/70 mb-6">Be the first to contribute educational content to the Tajiri platform.</p>
                    <Link href="/learn/edit" className="bg-decode-green text-black px-6 py-3 rounded-md font-medium inline-block">
                        Create First Article
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <Link
                            href={`/learn/${article.slug}`}
                            key={article.slug}
                            className="bg-decode-card hover:bg-white/10 transition-colors border border-white/10 rounded-xl overflow-hidden h-full flex flex-col no-underline"
                        >
                            <div className="relative h-56 w-full">
                                <Image
                                    src={article.image || '/images/placeholder.jpg'}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    priority={articles.indexOf(article) < 3}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="bg-decode-blue bg-opacity-20 text-decode-green px-3 py-1 rounded-full text-xs">
                                        {article.category}
                                    </span>
                                    <span className="text-white/60 text-sm">
                                        {new Date(article.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-3 line-clamp-2">{article.title}</h2>
                                <p className="text-white/70 mb-4 text-sm flex-grow line-clamp-3">{article.excerpt}</p>
                                <div className="flex items-center mt-auto pt-4 border-t border-white/10">
                                    <div className="bg-decode-green h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-black font-bold text-sm">{article.author.split(' ')[0][0]}{article.author.split(' ')[1]?.[0]}</span>
                                    </div>
                                    <span className="text-white/80 text-sm">{article.author}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
} 
