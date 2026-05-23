'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { SlideRenderer } from './SlideRenderer';

interface CarouselExportStageProps {
  slides: Array<{title: string; body: string; slide_number: number}>;
  userTier: string;
  selectedTheme: string;
  themeColors: { bg: string; accent: string; text: string; bodyText: string; border_color?: string; accentText?: string };
  brandLogoUrl: string | null;
  externalHandle?: string;
}

export interface ExportStageRef {
  getSlideElements: () => HTMLElement[];
}

export const CarouselExportStage = forwardRef<ExportStageRef, CarouselExportStageProps>(({
  slides,
  userTier,
  selectedTheme,
  themeColors,
  brandLogoUrl,
  externalHandle
}, ref) => {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    getSlideElements: () => slideRefs.current.filter(Boolean) as HTMLElement[]
  }));

  const handleText = externalHandle || (process.env.NEXT_PUBLIC_APP_NAME || 'CLOUDCLICK');

  // Render them all in a column, absolutely positioned but invisible to avoid html-to-image skipping it
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: 0.001, zIndex: -50, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }} id="carousel-export-stage">
      {slides.map((currentSlide, activeSlide) => {
        return (
          <div
            key={activeSlide}
            ref={(el) => { slideRefs.current[activeSlide] = el; }}
            style={{ 
              width: '1080px', 
              height: '1080px', 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <SlideRenderer 
              slide={currentSlide} 
              slideIndex={activeSlide} 
              totalSlides={slides.length} 
              themeColors={themeColors} 
              selectedTheme={selectedTheme} 
              brandLogoUrl={brandLogoUrl} 
              handleText={handleText}
              isExport={true}
            />
          </div>
        );
      })}
    </div>
  );
});

CarouselExportStage.displayName = 'CarouselExportStage';
// Cache bust to update export stage and ThemePicker

// Cache bust to update export stage and ThemePicker

// Final cache bust for text contrast
