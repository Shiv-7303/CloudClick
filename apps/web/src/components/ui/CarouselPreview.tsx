'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Images, ArrowLeft, ArrowRight, Lock, CircleNotch } from '@phosphor-icons/react';
import { ThemePicker, PALETTES } from './ThemePicker';
import { LogoUpload } from './LogoUpload';
import { SlideRenderer } from './SlideRenderer';
import { CarouselExportStage, ExportStageRef } from './CarouselExportStage';
import { carouselApi, api } from '@/lib/api';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface CarouselPreviewProps {
  slides: Array<{title: string; body: string; slide_number: number}>;
  userTier: 'free' | 'creator' | 'pro';
  analysisId: string;
  videoTitle?: string;
  externalHandle?: string;
}

export function CarouselPreview({
  slides,
  userTier,
  analysisId,
  videoTitle,
  externalHandle,
}: CarouselPreviewProps) {
  const isPaid      = userTier !== 'free';
  const router      = useRouter();

  const [activeSlide, setActiveSlide]   = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('v1');
  const [selectedPalette, setSelectedPalette] = useState('light');
  const [hasLogo, setHasLogo]           = useState(false);
  const [brandColor, setBrandColor]     = useState<string | null>(null);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);
  
  const exportStageRef = useRef<ExportStageRef>(null);

  useEffect(() => {
    if (!isPaid) return;
    carouselApi.getBrandSettings()
      .then((settings) => {
        if (settings.preferred_theme) {
          const parts = settings.preferred_theme.split('_');
          if (parts.length === 2) {
            setSelectedTemplate(parts[0]);
            setSelectedPalette(parts[1]);
          } else {
            setSelectedTemplate('v1');
            setSelectedPalette(settings.preferred_theme);
          }
        }
        setHasLogo(settings.has_logo || false);
        setBrandColor(settings.brand_color_hex || null);
        setBrandLogoUrl(settings.logo_url || null);
      })
      .catch(() => {});
  }, [isPaid]);

  const handleSaveTheme = async (template: string, palette: string) => {
    setIsSavingTheme(true);
    try {
      await carouselApi.setTheme(`${template}_${palette}`);
    } catch {
      // Non-fatal
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    handleSaveTheme(template, selectedPalette);
  };

  const handlePaletteChange = (palette: string) => {
    setSelectedPalette(palette);
    handleSaveTheme(selectedTemplate, palette);
  };

  const handleBrandUpdate = (data: any) => {
    if (!data) {
      setHasLogo(false);
      setBrandColor(null);
      setBrandLogoUrl(null);
      if (selectedPalette === 'brand') setSelectedPalette('light');
      return;
    }
    setHasLogo(true);
    setBrandColor(data.brand_color_hex);
    setBrandLogoUrl(data.logo_url);
    setSelectedPalette('brand');
    handleSaveTheme(selectedTemplate, 'brand');
  };

  const generateSlideImages = async () => {
    if (!exportStageRef.current) throw new Error("Render stage is missing.");
    await new Promise(r => setTimeout(r, 500));
    const elements = exportStageRef.current.getSlideElements();
    if (elements.length === 0) throw new Error("No slide elements found to render.");

    const images: string[] = [];
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      try {
        const dataUrl = await Promise.race([
          toPng(el, { 
            quality: 1.0, 
            pixelRatio: 1,
            cacheBust: true,
            skipFonts: false,
            imageTimeout: 5000,
            style: { transform: 'scale(1)', transformOrigin: 'top left' }
          }),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error(`timeout on slide ${i+1}`)), 25000))
        ]);
        images.push(dataUrl);
      } catch (err: any) {
        throw new Error(`Failed to render slide ${i+1}. Reason: ${err?.message || 'Unknown error'}`);
      }
    }
    return images;
  };

  const handleLocalExport = async (format: 'png' | 'pdf') => {
    setIsExporting(format);
    try {
      const images = await generateSlideImages();
      if (format === 'png') {
        const zip = new JSZip();
        images.forEach((dataUrl, idx) => {
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          zip.file(`slide_${idx + 1}.png`, base64Data, {base64: true});
        });
        const content = await zip.generateAsync({type: "blob"});
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cloudclick_carousel_${analysisId}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [1080, 1080] });
        images.forEach((dataUrl, idx) => {
          if (idx > 0) pdf.addPage([1080, 1080]);
          pdf.addImage(dataUrl, 'PNG', 0, 0, 1080, 1080);
        });
        pdf.save(`cloudclick_carousel_${analysisId}.pdf`);
      }
      api.createExport(analysisId, format).catch(() => {});
    } catch (err: any) {
      alert(`Export Failed!\n\nError: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsExporting(null);
    }
  };

  const selectedThemeCombo = `${selectedTemplate}_${selectedPalette}`;

  useEffect(() => {
    const handleGlobalExport = (e: CustomEvent) => {
      if (!isPaid) return;
      const format = e.detail;
      if (format === 'png' || format === 'pdf') {
        handleLocalExport(format);
      }
    };
    window.addEventListener('trigger_carousel_export', handleGlobalExport as EventListener);
    return () => window.removeEventListener('trigger_carousel_export', handleGlobalExport as EventListener);
  }, [isPaid, analysisId, selectedThemeCombo, brandLogoUrl, brandColor, activeSlide]);

  const paletteObj = PALETTES.find(p => p.id === selectedPalette) || PALETTES[0];
  const themeColors = selectedPalette === 'brand' && brandColor
    ? { bg: '#FAF9F6', accent: brandColor, text: '#111111', bodyText: '#333333', border_color: '#111', accentText: '#FFFFFF', altBg: '#F3F4F6', altText: '#111111' }
    : paletteObj.preview;

  const displaySlides = isPaid ? slides : slides.slice(0, 3);
  const currentSlide  = displaySlides[activeSlide];

  return (
    <div className="space-y-6">
      <CarouselExportStage 
        ref={exportStageRef}
        slides={displaySlides}
        userTier={userTier}
        selectedTheme={selectedThemeCombo}
        themeColors={themeColors}
        brandLogoUrl={brandLogoUrl}
        externalHandle={externalHandle}
      />
      
      <div
        className="relative w-full aspect-square max-w-[420px] mx-auto
          rounded-2xl overflow-hidden transition-all duration-300 flex items-center justify-center bg-bg-surface"
      >
        <div style={{ width: 1080, height: 1080, transform: 'scale(0.3888)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
          <SlideRenderer 
            slide={currentSlide} 
            slideIndex={activeSlide} 
            totalSlides={displaySlides.length} 
            themeColors={themeColors} 
            selectedTheme={selectedThemeCombo} 
            brandLogoUrl={brandLogoUrl} 
            handleText={externalHandle || process.env.NEXT_PUBLIC_APP_NAME || 'CLOUDCLICK'} 
          />
        </div>

        <button
          onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
          disabled={activeSlide === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
            bg-black/40 backdrop-blur-sm flex items-center justify-center
            disabled:opacity-20 hover:bg-black/60 transition-colors z-50"
        >
          <ArrowLeft size={12} weight="bold" className="text-white" />
        </button>
        <button
          onClick={() => setActiveSlide(Math.min(displaySlides.length - 1, activeSlide + 1))}
          disabled={activeSlide === displaySlides.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
            bg-black/40 backdrop-blur-sm flex items-center justify-center
            disabled:opacity-20 hover:bg-black/60 transition-colors z-50"
        >
          <ArrowRight size={12} weight="bold" className="text-white" />
        </button>
      </div>

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
              <span className="text-[8px] font-mono font-bold" style={{ color: themeColors.border_color || themeColors.accent }}>
                {i + 1}
              </span>
            </div>
          </button>
        ))}
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

      {isPaid && (
        <div className="space-y-5 p-5 rounded-xl border border-border-def bg-bg-surface">
          <ThemePicker
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
            selectedPalette={selectedPalette}
            onPaletteChange={handlePaletteChange}
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

      {!isPaid && (
        <div className="p-4 rounded-xl border border-accent/20 bg-accent/5">
          <p className="text-sm font-body font-medium text-text-p mb-1">
            Unlock full carousel
          </p>
          <p className="text-xs font-body text-text-s mb-3">
            Get 6 slides, multiple templates, logo upload, and PNG/PDF export.
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

      {isPaid && (
        <div className="flex gap-2">
          <button
            onClick={() => handleLocalExport('png')}
            disabled={!!isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3
              rounded-xl border border-border-def bg-bg-surface
              font-body font-medium text-sm text-text-s
              hover:border-accent hover:text-accent transition-all disabled:opacity-50"
          >
            {isExporting === 'png' ? <CircleNotch size={16} className="animate-spin" /> : <Images size={16} weight="duotone" />}
            {isExporting === 'png' ? 'Exporting...' : 'Export PNG'}
          </button>
          <button
            onClick={() => handleLocalExport('pdf')}
            disabled={!!isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3
              rounded-xl border border-border-def bg-bg-surface
              font-body font-medium text-sm text-text-s
              hover:border-accent hover:text-accent transition-all disabled:opacity-50"
          >
            {isExporting === 'pdf' ? <CircleNotch size={16} className="animate-spin" /> : <Download size={16} weight="duotone" />}
            {isExporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      )}
    </div>
  );
}