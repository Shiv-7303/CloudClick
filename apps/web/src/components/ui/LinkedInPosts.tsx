'use client';

import { useState } from 'react';
import { Copy, Check, LockKey } from '@phosphor-icons/react';

export function LinkedInPosts({ analysis, tier }: { analysis: any, tier: string }) {
  const [activeLiTab, setActiveLiTab] = useState('v1');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [key]: false });
    }, 2000);
  };

  const isFree = tier === 'free';

  return (
    <div data-testid="linkedin-posts">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display">LinkedIn Posts</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveLiTab('v1')} 
            className={`px-3 py-1 rounded text-sm ${activeLiTab==='v1' ? 'bg-bg-elevated border border-border-str' : 'text-text-s'}`}
            data-testid="tab-v1"
          >
            Standard
          </button>
          
          {(!isFree || analysis.linkedin_post_v2) && (
            <button 
              onClick={() => setActiveLiTab('v2')} 
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${activeLiTab==='v2' ? 'bg-bg-elevated border border-border-str' : 'text-text-s'} ${isFree ? 'opacity-50 cursor-not-allowed' : ''}`}
              data-testid="tab-v2"
            >
              Story {isFree && <LockKey size={12} />}
            </button>
          )}
          
          {(!isFree || analysis.linkedin_post_v3) && (
            <button 
              onClick={() => setActiveLiTab('v3')} 
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${activeLiTab==='v3' ? 'bg-bg-elevated border border-border-str' : 'text-text-s'} ${isFree ? 'opacity-50 cursor-not-allowed' : ''}`}
              data-testid="tab-v3"
            >
              Contrarian {isFree && <LockKey size={12} />}
            </button>
          )}
        </div>
      </div>
      <div className="p-6 border border-border-def bg-bg-surface rounded-xl relative group overflow-hidden">
        {isFree && activeLiTab !== 'v1' && (
          <div className="absolute inset-0 bg-bg-surface/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center" data-testid="upgrade-overlay">
            <LockKey size={32} className="text-accent mb-2" />
            <h3 className="font-bold text-lg mb-1">Upgrade to Creator</h3>
            <p className="text-text-s text-sm">Unlock multi-angle posts to test what resonates best with your audience.</p>
          </div>
        )}
        
        <button 
          onClick={() => copyToClipboard(analysis[`linkedin_post_${activeLiTab}`], 'linkedin')}
          className="absolute top-4 right-4 p-2 bg-bg-elevated rounded border border-border-str opacity-0 group-hover:opacity-100 transition-opacity z-20"
          data-testid="copy-btn"
        >
          {copiedStates['linkedin'] ? <Check className="text-positive" /> : <Copy />}
        </button>
        <div className={`whitespace-pre-wrap text-sm text-text-p ${isFree && activeLiTab !== 'v1' ? 'blur-sm select-none' : ''}`} data-testid="post-content">
          {analysis[`linkedin_post_${activeLiTab}`] || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n\n—\n_Created with CloudClick_"}
        </div>
      </div>
    </div>
  );
}
