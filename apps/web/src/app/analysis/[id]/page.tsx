'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { CircleNotch, DownloadSimple, LockKey, Images } from '@phosphor-icons/react';
import { LinkedInPosts } from '@/components/ui/LinkedInPosts';
import { TwitterThread } from '@/components/ui/TwitterThread';
import { PlaybookSection } from '@/components/ui/PlaybookSection';
import { CarouselPreview } from '@/components/ui/CarouselPreview';

export default function AnalysisPage() {
  const { id } = useParams() as { id: string };
  const { data: session } = useSession();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const data = await api.getAnalysis(id);
        setAnalysis(data);
        
        if (data.status === 'queued' || data.status === 'processing') {
          interval = setTimeout(fetchStatus, 3000);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analysis');
      }
    };

    fetchStatus();

    return () => clearTimeout(interval);
  }, [id]);

  const handleExport = async (format: string) => {
    if (format === 'png' || format === 'pdf') {
      // Trigger the client-side export inside the CarouselPreview component
      window.dispatchEvent(new CustomEvent('trigger_carousel_export', { detail: format }));
      // Scroll down to the carousel so they can see the spinner
      document.getElementById('carousel')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setExporting(format);
    try {
      const data = await api.createExport(id, format);
      
      if (data.download_url) {
        window.location.href = data.download_url;
      }
    } catch (err: any) {
      if (err.message.includes('plan') || err.statusCode === 402) {
        window.dispatchEvent(new CustomEvent('upgrade_required', { detail: err.message }));
      } else {
        alert(err.message);
      }
    } finally {
      setExporting(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-display text-negative mb-4">Analysis Failed</h2>
        <p className="text-text-s mb-8">{error}</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-bg-elevated rounded-full border border-border-str">
          Try Another Video
        </button>
      </div>
    );
  }

  if (!analysis || analysis.status === 'queued' || analysis.status === 'processing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <CircleNotch size={48} className="animate-spin text-accent mb-6" />
        <h2 className="text-3xl font-display mb-2">Analyzing Video</h2>
        <p className="text-text-s max-w-md">
          {analysis?.status === 'queued' ? 'Waiting in queue...' : 'Processing transcript and generating content... this usually takes 5-10 seconds.'}
        </p>
      </div>
    );
  }

  if (analysis.status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-display text-negative mb-4">Processing Failed</h2>
        <p className="text-text-s mb-8">{analysis.error_message}</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-bg-elevated rounded-full border border-border-str">
          Try Another Video
        </button>
      </div>
    );
  }

  // --- COMPLETED VIEW ---
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start">
      
      {/* Sidebar: Video Info & Export */}
      <div className="w-full lg:w-80 flex-shrink-0 sticky top-28 space-y-6">
        <div className="rounded-2xl border border-border-def bg-bg-surface overflow-hidden">
          <img src={analysis.video_thumbnail} alt="Thumbnail" className="w-full aspect-video object-cover" />
          <div className="p-4">
            <h3 className="font-bold text-sm mb-1 line-clamp-2">{analysis.video_title}</h3>
            <p className="text-xs text-text-s">{analysis.video_channel}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border-def bg-bg-surface p-4">
          <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-text-s">Exports</h4>
          <div className="space-y-2">
            {['pdf', 'png', 'markdown', 'json'].map(fmt => {
              const tier = session?.tier || 'free';
              const isAllowed = 
                (tier === 'pro') || 
                (tier === 'creator' && ['pdf', 'png'].includes(fmt));
                
              return (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  disabled={exporting === fmt}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-colors
                    ${isAllowed 
                      ? 'border-border-str bg-bg-elevated hover:border-accent text-text-p' 
                      : 'border-border-def bg-bg-base text-text-s opacity-50 hover:opacity-100'}
                  `}
                >
                  <span className="uppercase">{fmt}</span>
                  {exporting === fmt ? <CircleNotch className="animate-spin" /> : 
                   isAllowed ? <DownloadSimple /> : <LockKey />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full space-y-12">
        
        {/* Summary */}
        <section>
          <h2 className="text-2xl font-display mb-4">Summary</h2>
          <div className="p-6 border-l-4 border-accent bg-bg-surface rounded-r-xl">
            <p className="text-lg leading-relaxed font-serif text-text-p">{analysis.summary}</p>
          </div>
        </section>

        {/* Playbook */}
        <section>
          <PlaybookSection playbook={analysis.instagram_playbook} userTier={session?.tier || 'free'} analysisId={analysis.id} />
        </section>

        {/* LinkedIn */}
        <section>
          <LinkedInPosts analysis={analysis} tier={session?.tier || 'free'} />
        </section>

        {/* Twitter Thread */}
        <section>
          <TwitterThread thread={analysis.twitter_thread} />
        </section>

        {/* ── CAROUSEL SECTION ─────────────────────────────────────── */}
        <section id="carousel" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Images size={22} weight="duotone" className="text-accent" />
            <div>
              <h2 className="font-body font-medium text-text-p text-lg">
                Carousel Slides
              </h2>
              <p className="font-body text-text-m text-xs mt-0.5">
                {session?.tier === 'free'
                  ? '3-slide preview — upgrade for full 6 slides + custom branding'
                  : 'Export as PNG for Instagram or PDF for LinkedIn'}
              </p>
            </div>
          </div>

          <CarouselPreview
            slides={
              analysis.carousel_slides ||
              analysis.carousel_preview ||
              []
            }
            userTier={(session?.tier as 'free' | 'creator' | 'pro') ?? 'free'}
            analysisId={analysis.id}
            videoTitle={analysis.video_title || ''}
            onExportClick={(format) => handleExport(format)}
          />
        </section>
        {/* ── END CAROUSEL SECTION ─────────────────────────────────── */}

      </div>
    </div>
  );
}