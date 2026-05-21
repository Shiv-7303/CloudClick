'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { HeroInput } from '@/components/ui/HeroInput';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // If we return from auth with a pending URL to autostart
    const url = searchParams.get('url');
    const autostart = searchParams.get('autostart');
    
    if (url && autostart === 'true' && status === 'authenticated') {
      // Clear it from session storage just in case
      sessionStorage.removeItem('cloudclick_pending_url');
      
      // Auto submit
      api.analyze(url)
        .then(res => {
          router.push(`/analysis/${res.analysis_id}`);
        })
        .catch(err => {
          console.error("Auto-analyze failed", err);
        });
    }
  }, [searchParams, status, router]);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-display tracking-tight text-text-p mb-6"
        >
          Analyze any YouTube video.<br/>
          <span className="italic text-accent">Instantly.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-xl text-text-s mb-12 font-medium"
        >
          LinkedIn Posts · Twitter Threads · Carousels — in 10 seconds
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <HeroInput />
          
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-text-s">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-positive"></span>
            </span>
            Over 10,000 videos analyzed this week
          </div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="w-full bg-bg-surface py-24 border-y border-border-def">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-display text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "1. Paste Link", desc: "Drop any YouTube URL. We extract the transcript automatically." },
              { title: "2. AI Processing", desc: "Our models analyze the core message, tone, and key insights." },
              { title: "3. Get Content", desc: "Instantly receive threads, posts, and carousels ready to publish." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-bg-elevated border border-border-str flex items-center justify-center text-accent text-2xl font-display mb-6">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-text-p mb-2">{step.title}</h3>
                <p className="text-text-s">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-display text-center mb-16">Simple, transparent pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard tier="Free" price="₹0" limit="1 analysis lifetime" features={["Basic summary", "1 LinkedIn Post", "Twitter Thread preview"]} />
            <PricingCard tier="Creator" price="₹499/mo" limit="20 analyses/mo" features={["Everything in Free", "3 LinkedIn angles", "Carousel Exports (PNG/PDF)", "Content Calendar"]} highlighted />
            <PricingCard tier="Pro" price="₹999/mo" limit="40 analyses/mo" features={["Everything in Creator", "No CloudClick watermarks", "JSON/Markdown exports", "Contrarian angles"]} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border-def py-8 text-center text-text-s text-sm">
        © 2026 CloudClick · Privacy · Terms
      </footer>
    </div>
  );
}

function PricingCard({ tier, price, limit, features, highlighted = false }: any) {
  return (
    <div className={`rounded-2xl p-8 border flex flex-col ${highlighted ? 'border-accent bg-bg-elevated shadow-glow-amber' : 'border-border-str bg-bg-surface'}`}>
      <h3 className="text-2xl font-display mb-2">{tier}</h3>
      <div className="text-3xl font-bold text-text-p mb-1">{price}</div>
      <div className="text-sm text-text-s mb-6">{limit}</div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-2 text-text-p text-sm">
            <span className="text-accent">✓</span> {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-xl font-bold transition-colors ${highlighted ? 'bg-accent text-bg-base hover:bg-accent-dim' : 'bg-bg-base border border-border-str text-text-p hover:border-accent'}`}>
        Get Started
      </button>
    </div>
  );
}
