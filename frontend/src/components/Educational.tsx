import React from 'react';
import Link from 'next/link';

interface Tutorial {
    id: string;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    topics: string[];
}

interface FAQ {
    question: string;
    answer: string;
}

const tutorials: Tutorial[] = [
    {
        id: 'getting-started',
        title: 'Getting Started with Tajiri',
        description: 'Learn the basics of using Tajiri for stock trading and investing.',
        difficulty: 'Beginner',
        duration: '10 min',
        topics: ['Wallet Setup', 'Basic Trading', 'Portfolio Management'],
    },
    {
        id: 'advanced-trading',
        title: 'Advanced Trading Strategies',
        description: 'Master advanced trading techniques and market analysis.',
        difficulty: 'Advanced',
        duration: '30 min',
        topics: ['Technical Analysis', 'Risk Management', 'Market Timing'],
    },
    {
        id: 'lending-protocol',
        title: 'Understanding the Lending Protocol',
        description: 'Learn how to use Tajiri\'s lending protocol for borrowing and lending.',
        difficulty: 'Intermediate',
        duration: '20 min',
        topics: ['Deposits', 'Borrowing', 'Collateral Management'],
    },
];

const faqs: FAQ[] = [
    {
        question: 'What is Tajiri?',
        answer: 'Tajiri is a blockchain-based platform that allows you to trade tokenized stocks from the Nairobi Securities Exchange (NSE) using stablecoins. It provides a secure, transparent, and efficient way to invest in African stocks.',
    },
    {
        question: 'How do I get started?',
        answer: 'To get started, you need to create an account, connect your wallet, and deposit stablecoins. You can then start trading tokenized stocks or use the lending protocol.',
    },
    {
        question: 'What are the fees?',
        answer: 'Tajiri charges minimal fees for transactions, which are paid in HBAR. The exact fees depend on the type of transaction and are clearly displayed before confirmation.',
    },
    {
        question: 'Is my investment safe?',
        answer: 'Tajiri uses smart contracts on the Hedera blockchain to ensure secure and transparent transactions. All trades are executed on-chain and can be verified at any time.',
    },
];

export default function Educational() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Learning Center</h1>

            {/* Tutorials Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Tutorials</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tutorials.map((tutorial) => (
                        <div
                            key={tutorial.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{tutorial.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{tutorial.description}</p>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {tutorial.difficulty}
                                    </span>
                                    <span className="text-sm text-gray-500">{tutorial.duration}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {tutorial.topics.map((topic) => (
                                        <span
                                            key={topic}
                                            className="px-2 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-700"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                                <Link
                                    href={`/learn/${tutorial.id}`}
                                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Start Learning
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQs Section */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                        >
                            <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Resources Section */}
            <section className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold mb-4">Documentation</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/docs/contracts"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Smart Contract Documentation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/docs/api"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    API Reference
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/docs/security"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Security Guidelines
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold mb-4">Community</h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://discord.gg/tajiri"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Discord Community
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://twitter.com/tajiri"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Twitter Updates
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/tajiri"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    GitHub Repository
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
} 