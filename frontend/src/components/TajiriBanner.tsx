import React from 'react';

interface TajiriBannerProps {
    width?: number | string;
    height?: number | string;
    responsive?: boolean;
}

export default function TajiriBanner({
    width = 1200,
    height = 300,
    responsive = true
}: TajiriBannerProps) {
    // If responsive is false, use fixed dimensions
    const containerStyle = responsive ? {
        width: '100%',
        maxWidth: typeof width === 'number' ? `${width}px` : width,
        minHeight: '200px',
        height: 'auto',
    } : {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className="flex flex-col md:flex-row items-center justify-center bg-decode-black p-6 md:p-12 rounded-lg shadow-lg border border-decode-green/20"
            style={containerStyle}
        >
            {/* Logo */}
            <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <svg
                    width="150"
                    height="150"
                    viewBox="0 0 250 250"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Logo hexagon shape */}
                    <path
                        d="M125 25L200 67.5V152.5L125 195L50 152.5V67.5L125 25Z"
                        fill="url(#logo-gradient)"
                        stroke="#22c55e"
                        strokeWidth="4"
                    />

                    {/* Logo internal design - stylized "T" */}
                    <path
                        d="M105 75H145M125 75V155"
                        stroke="#22c55e"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    <circle
                        cx="125"
                        cy="115"
                        r="15"
                        fill="#22c55e"
                    />

                    {/* Gradients definition */}
                    <defs>
                        <linearGradient id="logo-gradient" x1="50" y1="25" x2="200" y2="195" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#22c55e" />
                            <stop offset="1" stopColor="#0d9488" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center md:items-start">
                <h1
                    className="text-5xl md:text-7xl font-bold mb-2 md:mb-4"
                    style={{
                        background: 'linear-gradient(90deg, #22c55e 0%, #0d9488 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent'
                    }}
                >
                    TAJIRI
                </h1>
                <p className="text-xl md:text-2xl text-gray-300">
                    Web3 Financial Platform
                </p>
            </div>
        </div>
    );
} 