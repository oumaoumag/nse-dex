'use client';

import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

// Define a component to handle profile image display with fallbacks
const UserAvatar = ({ user }: { user: any }) => {
  const [imageError, setImageError] = useState(false);

  if (!user?.image || imageError) {
    // If no image or image failed to load, show initials
    return (
      <div className="h-10 w-10 rounded-full bg-decode-green/90 flex items-center justify-center text-white font-medium">
        {user?.name?.charAt(0) || 'U'}
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-full overflow-hidden border border-decode-green/20">
      {/* Use standard img tag instead of next/image to avoid domain config issues */}
      <img
        src={user.image}
        alt={user.name || 'User'}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

/**
 * Google Login Button component with Safaricom Decode styling
 */
const GoogleLoginButton: React.FC = () => {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <div>
      {session ? (
        <div className="flex flex-col items-center gap-3">
          <div className="decode-card border border-decode-green/30 p-4 rounded-lg flex items-center gap-4">
            <UserAvatar user={session.user} />
            <div>
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="font-medium text-decode-white">{session.user?.name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="decode-button-secondary text-sm"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn('google')}
          disabled={isLoading}
          className="decode-card flex items-center gap-3 py-3 px-4 border border-decode-green/30 rounded-lg hover:border-decode-green/60 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.23C21.21 18.5 22.56 15.66 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.23 20.34L15.71 17.57C14.74 18.21 13.48 18.59 12 18.59C9.09 18.59 6.63 16.65 5.73 14H2.12V16.86C3.87 20.43 7.62 23 12 23Z" fill="#34A853"/>
            <path d="M5.73 14C5.51 13.34 5.39 12.63 5.39 11.9C5.39 11.17 5.51 10.46 5.73 9.8V6.94H2.12C1.41 8.42 1 10.12 1 11.9C1 13.68 1.41 15.38 2.12 16.86L5.73 14Z" fill="#FBBC05"/>
            <path d="M12 5.21C13.62 5.21 15.07 5.78 16.21 6.86L19.33 3.74C17.45 2 14.97 1 12 1C7.62 1 3.87 3.57 2.12 7.14L5.73 10C6.63 7.35 9.09 5.21 12 5.21Z" fill="#EA4335"/>
          </svg>
          
          <span className="text-sm font-medium text-decode-white">
            {isLoading ? 'Loading...' : 'Sign in with Google'}
          </span>
        </button>
      )}
    </div>
  );
};

export default GoogleLoginButton;
