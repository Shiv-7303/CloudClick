'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { HeroInput } from '@/components/ui/HeroInput';
import { Trash, Export, Clock, PlayCircle, ChartBar } from '@phosphor-icons/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (status === 'authenticated') {
      fetchData(1);
    }
  }, [status, router]);

  const fetchData = async (p: number) => {
    try {
      const [historyData, meData] = await Promise.all([
        api.getHistory(p),
        p === 1 ? api.getMe() : Promise.resolve(null)
      ]);
      
      if (p === 1) {
        setHistory(historyData.analyses);
        setUsageStats(meData?.usage);
      } else {
        setHistory(prev => [...prev, ...historyData.analyses]);
      }
      setHasMore(historyData.has_more);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;
    
    // Optimistic UI
    setHistory(prev => prev.filter(a => a.id !== id));
    
    try {
      await api.deleteAnalysis(id);
    } catch (err) {
      // Revert if failed
      fetchData(1);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-8 text-center text-text-s">Loading dashboard...</div>;
  }

  const usagePercent = usageStats ? (usageStats.used / usageStats.limit) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      {/* Usage Stats Card */}
      {usageStats && (
        <div className="mb-8 p-6 bg-bg-surface border border-border-def rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <ChartBar size={24} weight="duotone" />
            </div>
            <div>
              <h3 className="font-bold text-lg capitalize">{usageStats.tier} Plan</h3>
              <p className="text-sm text-text-s">
                {usageStats.reset_type === 'monthly' ? 'Limits reset monthly' : 'Lifetime limit'}
              </p>
            </div>
          </div>
          
          <div className="flex-1 max-w-md w-full">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-s">Usage</span>
              <span className="font-bold">
                {usageStats.used} / {usageStats.limit} Videos
              </span>
            </div>
            <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${usagePercent >= 100 ? 'bg-negative' : 'bg-accent'}`}
                style={{ width: `${Math.min(100, usagePercent)}%` }}
              />
            </div>
            {usageStats.remaining === 0 && (
              <p className="text-xs text-negative mt-2">You have reached your limit. Upgrade to continue.</p>
            )}
          </div>
          
          {usageStats.tier === 'free' && (
            <button 
              onClick={() => router.push('/pricing')}
              className="px-6 py-2 bg-accent text-bg-base font-bold rounded-full hover:scale-105 transition-transform"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      )}

      <div className="mb-16">
        <h1 className="text-3xl font-display mb-6">New Analysis</h1>
        <HeroInput />
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display">Recent Analyses</h2>
      </div>

      {history.length === 0 ? (
        <div className="text-center p-12 border border-border-def border-dashed rounded-2xl bg-bg-surface text-text-s">
          You haven't analyzed any videos yet. Paste a YouTube link above to get started!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((analysis) => (
            <div key={analysis.id} className="group relative bg-bg-surface border border-border-def rounded-xl overflow-hidden hover:border-border-str transition-colors">
              <div className="aspect-video w-full relative bg-bg-elevated overflow-hidden">
                {analysis.video_thumbnail ? (
                  <img src={analysis.video_thumbnail} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle size={48} className="text-border-str" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs text-text-p font-mono">
                  {Math.floor(analysis.video_duration_seconds / 60)}:{(analysis.video_duration_seconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-text-p truncate mb-1" title={analysis.video_title}>
                  {analysis.video_title || 'Processing Video...'}
                </h3>
                <div className="flex items-center justify-between text-xs text-text-s">
                  <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                  <span className="capitalize px-2 py-0.5 bg-bg-elevated rounded border border-border-def">
                    {analysis.status}
                  </span>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <button 
                  onClick={() => router.push(`/analysis/${analysis.id}`)}
                  className="bg-accent text-bg-base p-3 rounded-full hover:scale-110 transition-transform"
                >
                  <Export size={20} weight="fill" />
                </button>
                <button 
                  onClick={() => handleDelete(analysis.id)}
                  className="bg-negative text-white p-3 rounded-full hover:scale-110 transition-transform"
                >
                  <Trash size={20} weight="fill" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-12 text-center">
          <button 
            onClick={() => fetchHistory(page + 1)}
            className="px-6 py-2 border border-border-str rounded-full text-text-s hover:text-text-p hover:border-text-s transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
