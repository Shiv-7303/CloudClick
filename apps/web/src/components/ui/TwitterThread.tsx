'use client';

import { useState } from 'react';
import { Copy, Check } from '@phosphor-icons/react';

export function TwitterThread({ thread }: { thread: any[] }) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [key]: false });
    }, 2000);
  };

  const copyAll = () => {
    const fullText = thread.map((t: any) => t.text).join('\n\n');
    copyToClipboard(fullText, 'twitter_all');
  };

  if (!thread || thread.length === 0) return null;

  return (
    <div data-testid="twitter-thread">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display">Twitter Thread</h2>
        <button 
          onClick={copyAll}
          className="text-sm flex items-center gap-2 text-text-s hover:text-text-p"
          data-testid="copy-all-btn"
        >
          {copiedStates['twitter_all'] ? <Check className="text-positive" /> : <Copy />} Copy Full Thread
        </button>
      </div>
      <div className="space-y-4 border-l-2 border-border-str pl-6 ml-4">
        {thread.map((tweet: any, i: number) => {
          const isOverLimit = tweet.text.length > 280;
          return (
            <div key={i} className="p-5 border border-border-def bg-bg-surface rounded-xl relative group">
              <button 
                onClick={() => copyToClipboard(tweet.text, `tweet_${i}`)}
                className="absolute top-4 right-4 text-text-s hover:text-text-p opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedStates[`tweet_${i}`] ? <Check className="text-positive" /> : <Copy />}
              </button>
              <div className="text-sm mb-3 whitespace-pre-wrap pr-8">{tweet.text}</div>
              <div className="text-xs flex justify-between">
                <span className={isOverLimit ? "text-negative" : "text-text-s"} data-testid="char-counter">
                  {tweet.text.length}/280
                </span>
                <span className="text-text-s">{i+1}/{thread.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
