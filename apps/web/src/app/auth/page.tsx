'use client';
import { Suspense } from 'react';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { YoutubeLogo, GoogleLogo } from '@phosphor-icons/react';

function AuthContent() {
  const searchParams = useSearchParams();
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  useEffect(() => {
    // If we're coming back from a successful auth, NextAuth handles the redirect.
    // If we just landed here, check for a pending URL
    const url = sessionStorage.getItem('cloudclick_pending_url');
    if (url) {
      setPendingUrl(url);
    }
  }, []);

  const handleSignIn = () => {
    // Pass a callback URL that includes the autostart flag
    const callbackUrl = pendingUrl 
      ? `/?url=${encodeURIComponent(pendingUrl)}&autostart=true` 
      : '/dashboard';
      
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-bg-surface border border-border-def rounded-2xl p-8 text-center shadow-2xl">
        
        {pendingUrl ? (
          <div className="mb-8">
            <div className="w-16 h-16 bg-bg-elevated border border-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-amber">
              <YoutubeLogo size={32} weight="fill" className="text-accent" />
            </div>
            <h1 className="text-2xl font-display text-text-p mb-2">Your analysis is ready</h1>
            <p className="text-text-s">Sign in to view your generated content and insights.</p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl font-display text-text-p mb-2">Welcome to CloudClick</h1>
            <p className="text-text-s">Sign in to manage your analyses and subscriptions.</p>
          </div>
        )}

        <button 
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-text-p text-bg-base font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
        >
          {/* @ts-ignore */}
          <GoogleLogo size={24} weight="bold" />
          Continue with Google
        </button>
        
        <p className="mt-6 text-xs text-text-s">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-s">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
