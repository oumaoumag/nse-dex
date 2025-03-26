import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with gradient and decorative elements */}
      <section className="relative bg-gradient-to-b from-primary-50 via-primary-100 to-white dark:from-primary-950 dark:via-primary-900 dark:to-primary-950 py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary-400 opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-24 w-80 h-80 bg-primary-400 opacity-10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary-900 dark:text-white mb-6 animate-fadeIn">
            About <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Tajiri</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-700 dark:text-primary-300 max-w-3xl mx-auto animate-slideUp">
            Democratizing wealth creation in Africa through blockchain technology and financial innovation
          </p>
        </div>
      </section>

      {/* Our Mission Section with updated colors */}
      <section className="py-20 bg-white dark:bg-primary-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                At Tajiri, our mission is to transform how Africans access and engage with the stock market, making wealth creation opportunities more accessible, transparent, and efficient.
              </p>
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                We're building a financial ecosystem that leverages blockchain technology to tokenize traditional assets, starting with stocks from the Nairobi Securities Exchange (NSE), and make them tradable by anyone, anywhere.
              </p>
              <p className="text-primary-600 dark:text-primary-400">
                Through our innovative platform, we aim to lower barriers to entry, reduce transaction costs, and create new financial opportunities for millions of underserved individuals across the continent.
              </p>
            </div>
            <div className="relative h-80 md:h-96 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-10"></div>
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="bg-white dark:bg-primary-800 rounded-xl p-8 shadow-xl max-w-md">
                  <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-300 mb-4">Our Vision</h3>
                  <p className="text-primary-700 dark:text-primary-300">
                    To create Africa's most trusted blockchain-based financial platform, where anyone can easily invest in tokenized assets and build wealth for generations to come.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Blockchain Section with updated colors and card design */}
      <section className="py-20 bg-primary-50 dark:bg-primary-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-12 text-center">
            Why Blockchain & <span className="text-secondary-600">Hedera</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-primary-800 p-8 rounded-xl shadow-lg">
              <div className="rounded-full bg-gradient-to-r from-primary-500 to-primary-600 p-3 w-12 h-12 flex items-center justify-center text-white mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-3">
                Security & Transparency
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Blockchain provides an immutable record of all transactions, ensuring transparency and trust in a region where financial systems have historically faced trust challenges.
              </p>
            </div>
            <div className="bg-white dark:bg-primary-800 p-8 rounded-xl shadow-lg">
              <div className="rounded-full bg-gradient-to-r from-secondary-500 to-secondary-600 p-3 w-12 h-12 flex items-center justify-center text-white mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-3">
                High Performance
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Hedera Hashgraph supports up to 10,000 transactions per second with finality in under 3 seconds, making it ideal for financial applications at scale.
              </p>
            </div>
            <div className="bg-white dark:bg-primary-800 p-8 rounded-xl shadow-lg">
              <div className="rounded-full bg-gradient-to-r from-accent-500 to-accent-600 p-3 w-12 h-12 flex items-center justify-center text-white mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-3">
                Cost Efficiency
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Fixed low fees ranging from $0.0001 to $0.01 per transaction on Hedera make financial services affordable for all investors, regardless of transaction size.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section with updated gradient and styling */}
      <section className="py-20 bg-white dark:bg-primary-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-12 text-center">
            Our <span className="text-secondary-600">Team</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center bg-gradient-to-b from-white to-primary-50 dark:from-primary-900 dark:to-primary-950 p-8 rounded-xl border border-primary-100 dark:border-primary-800 hover:shadow-xl transition-all">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {member.initials}
                </div>
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">{member.name}</h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-3">{member.title}</p>
                <p className="text-primary-600 dark:text-primary-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section with updated styling */}
      <section className="py-20 bg-primary-50 dark:bg-primary-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-12 text-center">
            Our <span className="text-secondary-600">Roadmap</span>
          </h2>
          <div className="max-w-3xl mx-auto">
            {roadmap.map((item, index) => (
              <div key={index} className="relative pl-10 pb-10 last:pb-0">
                {index !== roadmap.length - 1 && (
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-secondary-500"></div>
                )}
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-md">
                  {index + 1}
                </div>
                <div className="bg-white dark:bg-primary-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">{item.phase}</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-3 text-sm">{item.timeline}</p>
                  <ul className="space-y-3 text-primary-600 dark:text-primary-400">
                    {item.milestones.map((milestone, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-secondary-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with updated gradient */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Financial Revolution</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Be part of the movement to democratize wealth creation in Africa through blockchain technology.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-lg font-medium text-primary-600 shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all"
          >
            Launch App
          </Link>
        </div>
      </section>
    </div>
  );
}

// Team Members Data
const teamMembers = [
  {
    initials: 'JN',
    name: 'John Njoroge',
    title: 'CEO & Founder',
    bio: 'Former investment banker with over 10 years of experience in African financial markets. Passionate about financial inclusion.'
  },
  {
    initials: 'SW',
    name: 'Sarah Wambui',
    title: 'CTO',
    bio: 'Blockchain developer and engineer with experience building decentralized applications. Previously worked at global tech companies.'
  },
  {
    initials: 'DO',
    name: 'David Omondi',
    title: 'Head of Operations',
    bio: 'Experienced in scaling fintech operations across East Africa. Former operations lead at a major mobile money platform.'
  }
];

// Roadmap Data
const roadmap = [
  {
    phase: 'Foundation',
    timeline: 'Q4 2024',
    milestones: [
      'Launch Next.js frontend and branding',
      'Set up Hedera Testnet environment',
      'Implement account abstraction model',
      'Initial stablecoin integration'
    ]
  },
  {
    phase: 'Core Features',
    timeline: 'Q1 2025',
    milestones: [
      'Tokenize first batch of NSE stocks',
      'Launch trading marketplace',
      'Integrate wallet providers',
      'Implement KYC/AML compliance tools'
    ]
  },
  {
    phase: 'Advanced Features',
    timeline: 'Q2-Q3 2025',
    milestones: [
      'Launch lending protocol',
      'Add advanced trading tools and charts',
      'Implement educational resources',
      'Expand to additional NSE stocks'
    ]
  },
  {
    phase: 'Expansion',
    timeline: 'Q4 2025 & Beyond',
    milestones: [
      'Regional expansion to other African exchanges',
      'Add more asset classes (bonds, commodities)',
      'Mobile app launch',
      'Institutional partnerships'
    ]
  }
]; 