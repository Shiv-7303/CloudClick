'use client';

import { useState } from 'react';
import { Check } from '@phosphor-icons/react';

interface Theme {
  id: string;
  name: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
  paidOnly?: boolean;
}

const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Premium dark with amber accents',
    preview: { bg: '#0A0A0A', card: '#111111', accent: '#F5A623', text: '#F5F5F0' },
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Deep purple gradient glassmorphism',
    preview: { bg: '#302B63', card: 'rgba(255,255,255,0.1)', accent: '#A78BFA', text: '#FFFFFF' },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean white, LinkedIn-native',
    preview: { bg: '#F0F0EC', card: '#FFFFFF', accent: '#1A1A1A', text: '#0A0A0A' },
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'High contrast, viral-ready',
    preview: { bg: '#0A0A0A', card: '#FFFFFF', accent: '#FF3B30', text: '#0A0A0A' },
  },
  {
    id: 'brand',
    name: 'Your Brand',
    description: 'Uses your uploaded logo colors',
    preview: { bg: '#1A1A1A', card: '#FFFFFF', accent: '#888888', text: '#0A0A0A' },
    paidOnly: true,
  },
];

interface ThemePickerProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  hasLogo: boolean;
  brandColor?: string;
  disabled?: boolean;
}

export function ThemePicker({
  selectedTheme,
  onThemeChange,
  hasLogo,
  brandColor,
  disabled,
}: ThemePickerProps) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-mono text-text-m mb-3">
        Carousel Theme
      </p>
      <div className="flex gap-2 flex-wrap">
        {THEMES.map((theme) => {
          const isBrandTheme = theme.id === 'brand';
          const isDisabled   = disabled || (isBrandTheme && !hasLogo);
          const isSelected   = selectedTheme === theme.id;

          // For brand theme, show actual brand color if available
          const accentColor = (isBrandTheme && brandColor) ? brandColor : theme.preview.accent;

          return (
            <button
              key={theme.id}
              onClick={() => !isDisabled && onThemeChange(theme.id)}
              disabled={isDisabled}
              title={
                isBrandTheme && !hasLogo
                  ? 'Upload a logo first to use your brand theme'
                  : theme.description
              }
              className={`
                group relative flex flex-col items-center gap-2 p-3 rounded-xl border
                transition-all duration-150 w-[84px]
                ${isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border-def bg-bg-surface hover:border-border-str'
                }
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Mini preview card */}
              <div
                className="w-14 h-14 rounded-lg overflow-hidden relative"
                style={{ background: theme.preview.bg }}
              >
                <div
                  className="absolute inset-[8px] rounded-md"
                  style={{
                    background: theme.preview.card,
                    border: `1px solid ${accentColor}22`,
                  }}
                />
                {/* Accent dot */}
                <div
                  className="absolute bottom-[12px] left-[12px] w-[10px] h-[4px] rounded-sm"
                  style={{ background: accentColor }}
                />
                {/* Text lines */}
                <div
                  className="absolute top-[14px] left-[12px] right-[12px] h-[3px] rounded-full opacity-60"
                  style={{ background: theme.preview.text }}
                />
                <div
                  className="absolute top-[20px] left-[12px] w-[60%] h-[2px] rounded-full opacity-30"
                  style={{ background: theme.preview.text }}
                />
              </div>

              {/* Label */}
              <span className={`text-[11px] font-body font-medium leading-none
                ${isSelected ? 'text-accent' : 'text-text-s'}`}>
                {theme.name}
              </span>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full
                  bg-accent flex items-center justify-center">
                  <Check size={10} weight="bold" className="text-bg-base" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}