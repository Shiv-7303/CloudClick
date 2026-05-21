'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Images, ArrowLeft, ArrowRight, Lock } from '@phosphor-icons/react';
import { ThemePicker } from './ThemePicker';
import { LogoUpload } from './LogoUpload';
import { carouselApi } from '@/lib/api';

interface CarouselPreviewProps {
  slides: Array<{title: string; body: string; slide_number: number}>;
  userTier: 'free' | 'creator' | 'pro';
  analysisId: string;
  videoTitle?: string;
  onExportClick: (format: 'png' | 'pdf') => void;
}

// Theme preview colors — matches backend
const THEME_PREVIEWS: Record<string, {bg: string; accent: string; text: string; bodyText: string}> = {
  dark:     { bg: '#111111', accent: '#F5A623', text: '#F5F5F0', bodyText: '#8C8C8C' },
  gradient: { bg: 'linear-gradient(135deg,#0F0C29,#302B63)', accent: '#A78BFA', text: '#FFFFFF', bodyText: 'rgba(255,255,255,0.7)' },
  minimal:  { bg: '#FFFFFF', accent: '#1A1A1A', text: '#0A0A0A', bodyText: '#555555' },
  bold:     { bg: '#FFFFFF', accent: '#FF3B30', text: '#0A0A0A', bodyText: '#333333' },
  brand:    { bg: '#FFFFFF', accent: '#888888', text: '#0A0A0A', bodyText: '#444444' },
};

export function CarouselPreview({
  slides,
  userTier,
  analysisId,
  videoTitle,
  onExportClick,
}: CarouselPreviewProps) {
  const isPaid      = userTier !== 'free';
  const isCreator   = userTier === 'creator';
  const isPro       = userTier === 'pro';
  const router      = useRouter();

  const [activeSlide, setActiveSlide]   = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [hasLogo, setHasLogo]           = useState(false);
  const [brandColor, setBrandColor]     = useState<string | null>(null);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // Load existing brand settings on mount
  useEffect(() => {
    if (!isPaid) return;
    carouselApi.getBrandSettings()
      .then((settings) => {
        setSelectedTheme(settings.preferred_theme || 'dark');
        setHasLogo(settings.has_logo || false);
        setBrandColor(settings.brand_color_hex || null);
        setBrandLogoUrl(settings.logo_url || null);
      })
      .catch(() => {});
  }, [isPaid]);

  const handleThemeChange = async (theme: string) => {
    setSelectedTheme(theme);
    setIsSavingTheme(true);
    try {
      await carouselApi.setTheme(theme);
    } catch {
      // Non-fatal
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleBrandUpdate = (data: any) => {
    if (!data) {
      setHasLogo(false);
      setBrandColor(null);
      setBrandLogoUrl(null);
      if (selectedTheme === 'brand') setSelectedTheme('dark');
      return;
    }
    setHasLogo(true);
    setBrandColor(data.brand_color_hex);
    setBrandLogoUrl(data.logo_url);
    setSelectedTheme('brand');
  };

  // Get current theme preview colors
  const themeColors = selectedTheme === 'brand' && brandColor
    ? { bg: brandColor, accent: brandColor, text: '#0A0A0A', bodyText: '#444444' }
    : THEME_PREVIEWS[selectedTheme] || THEME_PREVIEWS.dark;

  const displaySlides = isPaid ? slides : slides.slice(0, 3);
  const currentSlide  = displaySlides[activeSlide];

  const isFirstSlide = activeSlide === 0;
  const isLastSlide = activeSlide === displaySlides.length - 1;
  const isBrandTheme = selectedTheme === 'brand';

  // Helper to parse bullets
  const rawBody = currentSlide?.body || '';
  const lines = rawBody.split('\n').map(l => l.trim()).filter(Boolean);
  const isBullets = lines.length >= 3 && lines.every(l => l.length < 100);
  const bullets = isBullets ? lines : null;
  const bodyText = isBullets ? '' : rawBody;

  // Helper to parse stats
  let stat = null;
  let finalBody = bodyText;
  if (bodyText && (bodyText[0].match(/[0-9]/) || bodyText.startsWith('%') || bodyText.startsWith('$') || bodyText.startsWith('₹'))) {
    const parts = bodyText.split(' ');
    if (parts[0].length < 10) {
      stat = parts[0];
      finalBody = parts.slice(1).join(' ');
    }
  }

  return (
    <div className="space-y-6">
      {/* Slide preview window */}
      <div
        className="relative w-full aspect-square max-w-[420px] mx-auto
          rounded-2xl overflow-hidden transition-all duration-300 flex items-center justify-center"
        style={{ background: themeColors.bg }}
      >
        {/* Simulated slide card */}
        <div
          className="absolute inset-[24px] rounded-[16px] p-6 flex flex-col justify-between
            transition-all duration-300 overflow-hidden"
          style={{
            background: selectedTheme === 'gradient'
              ? 'rgba(255,255,255,0.06)'
              : selectedTheme === 'minimal' || selectedTheme === 'bold' || selectedTheme === 'brand'
                ? '#FFFFFF'
                : '#111111',
            border: selectedTheme === 'minimal' || selectedTheme === 'bold' || selectedTheme === 'brand' 
              ? selectedTheme === 'bold' ? '2px solid #0A0A0A' : 'none'
              : `1px solid ${themeColors.accent}20`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.2)`,
            backdropFilter: selectedTheme === 'gradient' ? 'blur(10px)' : 'none',
          }}
        >
          {/* Logo preview (Top Left) */}
          {brandLogoUrl && (
            <div className="absolute top-4 left-4 h-4 flex items-center justify-start opacity-90 z-10">
              <img src={brandLogoUrl} alt="logo" className="h-full w-auto object-contain" />
            </div>
          )}

          {/* Slide number (Top Right) */}
          {!isFirstSlide && (
            <div 
              className="absolute top-4 right-4 text-[9px] font-mono"
              style={{ color: themeColors.bodyText }}
            >
              {activeSlide + 1} / {displaySlides.length}
            </div>
          )}

          {/* Hook Slide Background Decor */}
          {isFirstSlide && (
            <>
              <div className="absolute -bottom-4 -right-2 text-[120px] font-display font-bold leading-none select-none opacity-5" style={{ color: themeColors.accent }}>
                1
              </div>
            </>
          )}

          {/* CTA Slide Background Decor */}
          {isLastSlide && (
             <div className="absolute -top-4 left-4 text-[100px] font-display leading-none select-none opacity-10" style={{ color: themeColors.accent }}>
               "
             </div>
          )}

          {/* Accent bar (Left) */}
          <div
            className="absolute left-0 top-[15%] bottom-[15%] w-1 rounded-r-full"
            style={{ 
              background: `linear-gradient(180deg, ${themeColors.accent} 0%, transparent 100%)` 
            }}
          />

          <div className="flex-1 flex flex-col justify-center mt-2 z-10 relative">
            {/* Label / Eyebrow */}
            {(!isLastSlide) && (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-3 h-[1.5px] rounded-full" style={{ background: themeColors.accent }} />
                <span
                  className="text-[8px] uppercase tracking-[0.15em] font-mono"
                  style={{ color: themeColors.accent }}
                >
                  {isFirstSlide ? 'Key Insight' : 'Insight'}
                </span>
              </div>
            )}

            {isLastSlide && (
              <div className="text-[9px] uppercase tracking-widest font-body font-medium mb-3" style={{ color: themeColors.accent }}>
                Key Takeaway
              </div>
            )}

            {/* Stat Box */}
            {stat && !isFirstSlide && !isLastSlide && (
              <div className="inline-block px-2 py-1 rounded text-[10px] font-bold mb-3 w-fit" style={{ background: themeColors.accent, color: isBrandTheme ? '#fff' : '#0A0A0A' }}>
                {stat}
              </div>
            )}

            {/* Title */}
            <h3
              className={`font-display italic leading-tight transition-colors duration-300
                ${isFirstSlide ? 'text-[22px] mb-4' : isLastSlide ? 'text-[28px] mb-3' : 'text-[18px] mb-3'}`}
              style={{ color: themeColors.text }}
            >
              {currentSlide?.title || 'Slide title'}
            </h3>

            {/* CTA specific divider */}
            {isLastSlide && (
              <div className="w-8 h-1 rounded-full mb-3" style={{ background: themeColors.accent }} />
            )}

            {/* Body or Bullets */}
            {bullets && !isFirstSlide && !isLastSlide ? (
              <ul className="space-y-1.5">
                {bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: themeColors.accent }} />
                    <span className="text-[10px] leading-relaxed font-body font-light" style={{ color: themeColors.bodyText }}>
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className={`leading-relaxed font-body font-light ${isFirstSlide ? 'text-[10px]' : 'text-[10px]'}`}
                style={{ color: themeColors.bodyText }}
              >
                {finalBody || 'Slide body content...'}
              </p>
            )}

            {/* CTA Button Mock */}
            {isLastSlide && (
              <div className="mt-4 px-3 py-1.5 rounded-md font-bold text-[10px] w-fit" style={{ background: themeColors.accent, color: isBrandTheme ? '#fff' : '#0A0A0A' }}>
                Save this. Share it.
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-auto pt-3 pb-2 z-10">
            {displaySlides.map((_, i) => (
              <div
                key={i}
                className="h-[3px] rounded-full transition-all duration-200"
                style={{
                  width: i === activeSlide ? '12px' : '3px',
                  background: i === activeSlide ? themeColors.accent : `${themeColors.accent}40`,
                }}
              />
            ))}
          </div>

          {/* Watermark */}
          {(userTier === 'free' || userTier === 'creator') && (
            <div
              className="absolute bottom-2 left-0 right-0 text-center font-mono"
              style={{
                fontSize: '7px',
                letterSpacing: '0.1em',
                color: themeColors.bodyText,
                opacity: userTier === 'free' ? 0.7 : 0.25,
              }}
            >
              {userTier === 'free' ? 'CREATED WITH CLOUDCLICK' : 'cloudclick.app'}
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
          disabled={activeSlide === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
            bg-black/40 backdrop-blur-sm flex items-center justify-center
            disabled:opacity-20 hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={12} weight="bold" className="text-white" />
        </button>
        <button
          onClick={() => setActiveSlide(Math.min(displaySlides.length - 1, activeSlide + 1))}
          disabled={activeSlide === displaySlides.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
            bg-black/40 backdrop-blur-sm flex items-center justify-center
            disabled:opacity-20 hover:bg-black/60 transition-colors"
        >
          <ArrowRight size={12} weight="bold" className="text-white" />
        </button>
      </div>

      {/* Slide thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {displaySlides.map((slide, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all
              ${i === activeSlide ? 'border-accent' : 'border-border-sub hover:border-border-str'}`}
            style={{ background: themeColors.bg }}
          >
            <div className="w-full h-full flex items-center justify-center p-1">
              <span className="text-[8px] font-mono" style={{ color: themeColors.accent }}>
                {i + 1}
              </span>
            </div>
          </button>
        ))}

        {/* Locked slides (free users) */}
        {!isPaid && slides.length > 3 && (
          Array.from({length: slides.length - 3}).map((_, i) => (
            <div
              key={`locked-${i}`}
              className="shrink-0 w-14 h-14 rounded-lg border-2 border-dashed
                border-border-sub bg-bg-elevated flex items-center justify-center"
            >
              <Lock size={12} className="text-text-m" weight="duotone" />
            </div>
          ))
        )}
      </div>

      {/* Theme picker (paid only) */}
      {isPaid && (
        <div className="space-y-5 p-5 rounded-xl border border-border-def bg-bg-surface">
          <ThemePicker
            selectedTheme={selectedTheme}
            onThemeChange={handleThemeChange}
            hasLogo={hasLogo}
            brandColor={brandColor || undefined}
            disabled={isSavingTheme}
          />

          <div className="w-full h-px bg-border-sub" />

          <LogoUpload
            currentLogoUrl={brandLogoUrl || undefined}
            onBrandUpdate={handleBrandUpdate}
            userTier={userTier}
          />
        </div>
      )}

      {/* Free tier — upgrade panel */}
      {!isPaid && (
        <div className="p-4 rounded-xl border border-accent/20 bg-accent/5">
          <p className="text-sm font-body font-medium text-text-p mb-1">
            Unlock full carousel
          </p>
          <p className="text-xs font-body text-text-s mb-3">
            Get 6 slides, 4 themes, logo upload, and PNG/PDF export.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 rounded-lg bg-accent text-bg-base
              font-body font-medium text-sm hover:bg-accent-dim transition-colors"
          >
            Upgrade to Creator — ₹499/mo
          </button>
        </div>
      )}

      {/* Export buttons (paid only) */}
      {isPaid && (
        <div className="flex gap-2">
          <button
            onClick={() => onExportClick('png')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3
              rounded-xl border border-border-def bg-bg-surface
              font-body font-medium text-sm text-text-s
              hover:border-accent hover:text-accent transition-all"
          >
            <Images size={16} weight="duotone" />
            Export PNG
          </button>
          <button
            onClick={() => onExportClick('pdf')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3
              rounded-xl border border-border-def bg-bg-surface
              font-body font-medium text-sm text-text-s
              hover:border-accent hover:text-accent transition-all"
          >
            <Download size={16} weight="duotone" />
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}