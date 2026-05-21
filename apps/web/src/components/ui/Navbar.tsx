'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 inset-x-0 h-20 bg-bg-base/80 backdrop-blur-md border-b border-border-def z-40">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="font-display text-3xl tracking-tight text-text-p flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bg-base text-xl">C</div>
          CloudClick
        </Link>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          {status === 'loading' ? null : session ? (
            <>
              <Link href="/dashboard" className="text-text-s hover:text-text-p transition-colors">Dashboard</Link>
              <Link href="/pricing" className="text-text-s hover:text-text-p transition-colors">Pricing</Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })} 
                className="text-text-s hover:text-text-p transition-colors"
              >
                Sign Out
              </button>
              <div className="h-8 w-8 rounded-full bg-bg-elevated border border-border-str flex items-center justify-center text-accent">
                {session.user?.email?.[0].toUpperCase() || 'U'}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth" className="text-text-s hover:text-text-p transition-colors">Sign In</Link>
              <Link href="/auth" className="bg-text-p text-bg-base px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
