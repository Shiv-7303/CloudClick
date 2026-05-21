'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from '@phosphor-icons/react';

export function UpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleUpgradeRequired = (e: any) => {
      setMessage(e.detail || "You've reached your plan's limit.");
      setIsOpen(true);
    };

    window.addEventListener('upgrade_required', handleUpgradeRequired);
    return () => window.removeEventListener('upgrade_required', handleUpgradeRequired);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-elevated border border-border-def rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-text-s hover:text-text-p transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="font-display text-4xl mb-4 text-text-p">Upgrade Required</h2>
        <p className="text-text-s text-lg mb-8">{message}</p>

        <button 
          onClick={() => {
            setIsOpen(false);
            router.push('/pricing');
          }}
          className="w-full bg-accent hover:bg-accent-dim text-bg-base font-bold py-4 px-6 rounded-xl transition-colors shadow-glow-amber text-lg"
        >
          Upgrade to Creator — ₹499/mo
        </button>
      </div>
    </div>
  );
}
