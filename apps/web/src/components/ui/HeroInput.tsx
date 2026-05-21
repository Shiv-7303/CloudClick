'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { YoutubeLogo, CircleNotch } from '@phosphor-icons/react';
import { api } from '@/lib/api';

const YT_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([A-Za-z0-9_-]{11})/;

export function HeroInput() {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Basic validation on keystroke
    if (url.trim() === '') {
      setIsValid(false);
      setIsError(false);
    } else {
      const valid = YT_REGEX.test(url);
      setIsValid(valid);
      setIsError(!valid);
    }
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);

    if (!session) {
      // Not logged in: save URL and redirect to auth
      sessionStorage.setItem('cloudclick_pending_url', url);
      router.push('/auth');
      return;
    }

    try {
      const res = await api.analyze(url);
      router.push(`/analysis/${res.analysis_id}`);
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      // Global error handler handles 402s. We could show other errors here.
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full max-w-2xl mx-auto bg-bg-surface border rounded-full transition-all duration-300 p-1
        ${isError ? 'border-negative animate-[shake_0.5s_ease-in-out]' : 'border-border-str focus-within:border-accent focus-within:shadow-glow-amber'}
      `}
    >
      <div className="pl-4 pr-2 text-text-s">
        <YoutubeLogo size={24} weight="fill" className={isError ? "text-negative" : "text-accent"} />
      </div>
      
      <input
        autoFocus
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
        placeholder="Paste your YouTube link here..."
        className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-text-p placeholder:text-text-s disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className={`ml-2 px-6 py-3 rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2
          ${isValid && !isLoading 
            ? 'bg-accent text-bg-base hover:bg-accent-dim hover:shadow-glow-amber' 
            : 'bg-bg-elevated text-text-s cursor-not-allowed'}
        `}
      >
        {isLoading ? (
          <>
            <CircleNotch size={20} className="animate-spin" />
            Analyzing
          </>
        ) : (
          'Analyze →'
        )}
      </button>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>
    </form>
  );
}
