'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Available categories
const CATEGORIES = ['Platform Guide', 'Trading', 'Finance', 'Security', 'Development', 'Tokenomics', 'Updates'];

const ArticleEditor: React.FC = () => {
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [category, setCategory] = useState('');
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');
    const [previewMode, setPreviewMode] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Generate a slug from the title
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    };

    // Generate the full markdown content with frontmatter
    const generateMarkdown = () => {
        const date = new Date().toISOString().split('T')[0];
        const slug = generateSlug(title);
        const image = `/images/articles/${slug}.jpg`;

        return `---
title: "${title}"
excerpt: "${excerpt}"
date: "${date}"
author: "${author}"
category: "${category}"
image: "${image}"
---

${content}`;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !content || !category || !author || !excerpt) {
            setErrorMessage('Please fill in all required fields');
            setSaveStatus('error');
            return;
        }

        setSaveStatus('saving');

        try {
            // In a real implementation, you would call an API endpoint to save the article
            // For demo purposes, we'll just simulate saving and generate a download

            const markdown = generateMarkdown();
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${generateSlug(title)}.md`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Error saving article:', error);
            setSaveStatus('error');
            setErrorMessage('Failed to save article');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Article Editor</h1>

            <div className="bg-decode-card border border-white/10 rounded-xl p-6 mb-8">
                <div className="flex justify-between mb-6">
                    <button
                        className={`px-4 py-2 rounded ${!previewMode ? 'bg-decode-green text-black' : 'bg-white/10 text-white'}`}
                        onClick={() => setPreviewMode(false)}
                    >
                        Edit
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${previewMode ? 'bg-decode-green text-black' : 'bg-white/10 text-white'}`}
                        onClick={() => setPreviewMode(true)}
                    >
                        Preview
                    </button>
                </div>

                {!previewMode ? (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-white/70 mb-2" htmlFor="title">
                                    Title*
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded px-4 py-2 text-white"
                                    placeholder="Article title"
                                />
                            </div>

                            <div>
                                <label className="block text-white/70 mb-2" htmlFor="category">
                                    Category*
                                </label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded px-4 py-2 text-white"
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-white/70 mb-2" htmlFor="author">
                                    Author*
                                </label>
                                <input
                                    id="author"
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded px-4 py-2 text-white"
                                    placeholder="Author name"
                                />
                            </div>

                            <div>
                                <label className="block text-white/70 mb-2" htmlFor="slug">
                                    Slug (auto-generated)
                                </label>
                                <input
                                    id="slug"
                                    type="text"
                                    value={generateSlug(title)}
                                    readOnly
                                    className="w-full bg-white/5 border border-white/20 rounded px-4 py-2 text-white/50"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-white/70 mb-2" htmlFor="excerpt">
                                Excerpt*
                            </label>
                            <textarea
                                id="excerpt"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded px-4 py-2 text-white"
                                placeholder="A brief description of the article"
                                rows={2}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-white/70 mb-2" htmlFor="content">
                                Content* (Markdown)
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded px-4 py-2 text-white font-mono"
                                placeholder="# Start writing your article here..."
                                rows={20}
                            />
                        </div>

                        {saveStatus === 'error' && (
                            <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded mb-6">
                                {errorMessage || 'An error occurred while saving the article.'}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saveStatus === 'saving'}
                                className={`px-6 py-3 rounded font-medium ${saveStatus === 'saving'
                                    ? 'bg-white/20 text-white/50'
                                    : 'bg-decode-green text-black hover:bg-decode-green/90'
                                    }`}
                            >
                                {saveStatus === 'saving'
                                    ? 'Saving...'
                                    : saveStatus === 'success'
                                        ? 'Saved!'
                                        : 'Save & Download'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white/5 rounded-xl p-6">
                        <h1 className="text-2xl font-bold text-white mb-4">{title || 'Article Title'}</h1>

                        <div className="flex items-center space-x-3 mb-6">
                            <span className="bg-decode-blue bg-opacity-20 text-decode-green px-3 py-1 rounded-full text-sm">
                                {category || 'Category'}
                            </span>
                            <span className="text-white/60">
                                {new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                            <span className="text-white/60">By {author || 'Author'}</span>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content || '# Start writing your article\n\nYour content will appear here.'}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-blue-500/20 border border-blue-500 text-white px-6 py-4 rounded">
                <h3 className="font-medium mb-2">Note:</h3>
                <p>
                    In a production environment, this editor would save articles directly to your server.
                    For this demo, it generates a markdown file that you can download and manually add to
                    the <code className="bg-black/30 px-2 py-1 rounded">/public/articles</code> directory.
                </p>
            </div>
        </div>
    );
};

export default ArticleEditor; 