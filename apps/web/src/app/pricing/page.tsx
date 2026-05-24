'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export default function PricingPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const router = useRouter();

  const handleUpgrade = async (tier: string) => {
    if (!session) {
      router.push('/auth');
      return;
    }

    setLoading(true);
    try {
      const data = await api.createSubscription(tier);
      
      // If backend returned a mock response (local testing without Razorpay keys)
      if (data.is_mock) {
        await update({ tier: tier });
        alert(`Mock payment successful! Upgraded to ${tier} tier.`);
        // Force a session refresh by reloading or redirecting with a query param
        window.location.href = '/dashboard?upgraded=true';
        return;
      }
      
      // Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key: data.razorpay_key,
        subscription_id: data.subscription_id,
        name: 'CloudClick',
        description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
        handler: async (response: any) => {
          try {
            // Verify payment synchronously
            await api.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              tier: tier
            });
            
            // Payment successful — optimistically update session for local testing
            await update({ tier: tier });
            window.location.href = '/dashboard?upgraded=true';
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: data.email,
          name: data.name
        },
        theme: {
          color: '#F5A623'
        }
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
            <h1 className="text-5xl font-display text-center mb-8">Simple, transparent pricing</h1>
      
      <div className="flex justify-center items-center gap-4 mb-16">
        <span className={`text-sm font-medium ${!isAnnual ? 'text-text-p' : 'text-text-s'}`}>Monthly</span>
        <button 
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative inline-flex h-7 w-14 items-center rounded-full bg-accent transition-colors focus:outline-none"
        >
          <span 
            className={`inline-block h-5 w-5 transform rounded-full bg-bg-base transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`}
          />
        </button>
        <span className={`text-sm font-medium ${isAnnual ? 'text-text-p' : 'text-text-s'}`}>
          Yearly <span className="text-positive ml-1 text-xs px-2 py-0.5 bg-positive/10 rounded-full">Save up to 25%</span>
        </span>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mb-24">
        {/* Free Tier */}
        <div className="rounded-2xl p-8 border border-border-str bg-bg-surface flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-2xl font-display">Free</h3>
            {session?.tier === 'free' && <span className="bg-border-str text-text-p text-xs px-2 py-1 rounded">Current Plan</span>}
          </div>
          <p className="text-sm text-text-s mb-4">Try CloudClick risk-free.</p>
          <div className="text-3xl font-bold text-text-p mb-1">$0</div>
          <div className="text-sm text-text-s mb-6">1 analysis lifetime</div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> Standard AI Quality</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> Basic Transcript & Summary</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> 1 LinkedIn Post</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> Basic Twitter Thread</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> Carousel Preview</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> 3-Day Content Playbook</li>
            <li className="flex items-center gap-2 text-text-s text-sm opacity-50"><span className="text-text-s">✗</span> No Exports (PNG/PDF)</li>
            <li className="flex items-center gap-2 text-text-s text-sm opacity-50"><span className="text-text-s">✗</span> CloudClick Watermark</li>
          </ul>
        </div>

        {/* Creator Tier */}
        <div className="rounded-2xl p-8 border border-accent bg-bg-elevated shadow-glow-amber flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg-base text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-2xl font-display">Creator</h3>
            {session?.tier === 'creator' && <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded">Current Plan</span>}
          </div>
          <p className="text-sm text-text-s mb-4">Everything you need to turn videos into content.</p>
          <div className="text-3xl font-bold text-text-p mb-1">
            {isAnnual ? '$99' : '$11'}
            <span className="text-base text-text-s font-normal">{isAnnual ? '/yr' : '/mo'}</span>
          </div>
          <div className="text-sm text-text-s mb-6">20 analyses/mo</div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> Advanced AI Quality</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> 3 LinkedIn Versions</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> Carousel Exports (PNG/PDF)</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> 1500w Blog Content</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> 7-Day Playbook & YouTube Ideas</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> No Watermark</li>
          </ul>
          <button 
            onClick={() => handleUpgrade('creator')}
            disabled={loading || session?.tier === 'creator' || session?.tier === 'pro'}
            className="w-full py-3 rounded-xl font-bold transition-colors bg-accent text-bg-base hover:bg-accent-dim disabled:opacity-50"
          >
            Upgrade to Creator
          </button>
        </div>

        {/* Pro Tier */}
        <div className="rounded-2xl p-8 border border-border-str bg-bg-surface flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-2xl font-display">Pro</h3>
            {session?.tier === 'pro' && <span className="bg-border-str text-text-p text-xs px-2 py-1 rounded">Current Plan</span>}
          </div>
          <p className="text-sm text-text-s mb-4">For creators who treat content like a business.</p>
          <div className="text-3xl font-bold text-text-p mb-1">
            {isAnnual ? '$249' : '$25'}
            <span className="text-base text-text-s font-normal">{isAnnual ? '/yr' : '/mo'}</span>
          </div>
          <div className="text-sm text-text-s mb-6">40 analyses/mo</div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> Premium AI Quality</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> 5 LinkedIn Versions</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> Premium Carousel Templates</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> 2000w Blog Content</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> 30-Day Playbook & Lead Magnet</li>
            <li className="flex items-center gap-2 text-text-p text-sm"><span className="text-accent">✓</span> Priority Generation</li>
          </ul>
          <button 
            onClick={() => handleUpgrade('pro')}
            disabled={loading || session?.tier === 'pro'}
            className="w-full py-3 rounded-xl font-bold transition-colors bg-bg-base border border-border-str text-text-p hover:border-accent disabled:opacity-50"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-display mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-6 border border-border-def rounded-xl bg-bg-surface">
            <h4 className="font-bold mb-2">Can I cancel anytime?</h4>
            <p className="text-text-s">Yes, you can cancel your subscription from your dashboard at any time. You'll continue to have access until the end of your billing cycle.</p>
          </div>
          <div className="p-6 border border-border-def rounded-xl bg-bg-surface">
            <h4 className="font-bold mb-2">When do my limits reset?</h4>
            <p className="text-text-s">Monthly limits reset on the 1st of every calendar month.</p>
          </div>
          <div className="p-6 border border-border-def rounded-xl bg-bg-surface">
            <h4 className="font-bold mb-2">Are my card details secure?</h4>
            <p className="text-text-s">Absolutely. We use Razorpay to process all payments. We never store or even see your credit card information.</p>
          </div>
          <div className="p-6 border border-border-def rounded-xl bg-bg-surface">
            <h4 className="font-bold mb-2">What AI model do you use?</h4>
            <p className="text-text-s">Free tier uses Claude 3 Haiku for speed. Creator and Pro tiers use the much more powerful Claude 3.5 Sonnet to generate premium, nuanced content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
