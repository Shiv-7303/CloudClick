'use client';

import { Check, PaintBrush, Layout } from '@phosphor-icons/react';

// Easily add new templates here
export const TEMPLATES = [
  { id: 'v1', name: 'Brutal', description: 'Viral agency brutalist layout' },
  { id: 'v2', name: 'Elegant', description: 'Elegant editorial marker layout' },
  { id: 'v3', name: 'Bold Box', description: 'High contrast bold box layout' },
];

// Easily add new color palettes here
export const PALETTES = [
  { id: 'light', name: 'Light', preview: { bg: '#FAF9F6', accent: '#2563EB', text: '#111111', bodyText: '#333333', border_color: '#111' } },
  { id: 'dark', name: 'Dark', preview: { bg: '#0A0A0A', accent: '#F5A623', text: '#F5F5F0', bodyText: '#8C8C8C', border_color: '#222' } },
  { id: 'minimal', name: 'Minimal', preview: { bg: '#F0F0EC', accent: '#1A1A1A', text: '#0A0A0A', bodyText: '#555555', border_color: '#CCC' } },
  { id: 'gradient', name: 'Gradient', preview: { bg: '#302B63', accent: '#A78BFA', text: '#FFFFFF', bodyText: 'rgba(255,255,255,0.72)', border_color: 'rgba(255,255,255,0.12)' } },
  { id: 'lime', name: 'Lime', preview: { bg: '#D4E149', accent: '#FFFFFF', text: '#000000', bodyText: '#333333', border_color: '#000' } },
  { id: 'brand', name: 'Your Brand', preview: { bg: '#1A1A1A', accent: '#888888', text: '#FFFFFF', bodyText: '#CCCCCC', border_color: '#444' }, paidOnly: true },
];

interface ThemePickerProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
  selectedPalette: string;
  onPaletteChange: (palette: string) => void;
  hasLogo: boolean;
  brandColor?: string;
  disabled?: boolean;
}

export function ThemePicker({
  selectedTemplate,
  onTemplateChange,
  selectedPalette,
  onPaletteChange,
  hasLogo,
  brandColor,
  disabled,
}: ThemePickerProps) {
  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layout size={14} className="text-text-m" />
          <p className="text-[10px] uppercase tracking-widest font-mono text-text-m">
            Select Template
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => !disabled && onTemplateChange(tmpl.id)}
                disabled={disabled}
                className={`
                  relative px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  ${isSelected
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border-def bg-bg-base text-text-s hover:border-border-str'
                  }
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {tmpl.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-border-def" />

      {/* Palette Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <PaintBrush size={14} className="text-text-m" />
          <p className="text-[10px] uppercase tracking-widest font-mono text-text-m">
            Select Color Theme
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PALETTES.map((palette) => {
            const isBrandPalette = palette.id === 'brand';
            const isDisabled   = disabled || (isBrandPalette && !hasLogo);
            const isSelected   = selectedPalette === palette.id;

            const accentColor = (isBrandPalette && brandColor) ? brandColor : palette.preview.accent;

            return (
              <button
                key={palette.id}
                onClick={() => !isDisabled && onPaletteChange(palette.id)}
                disabled={isDisabled}
                title={
                  isBrandPalette && !hasLogo
                    ? 'Upload a logo first to use your brand theme'
                    : palette.name
                }
                className={`
                  group relative flex flex-col items-center gap-2 p-2 rounded-xl border
                  transition-all duration-150 w-[72px]
                  ${isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-border-def bg-bg-surface hover:border-border-str'
                  }
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Mini preview card */}
                <div
                  className="w-12 h-12 rounded-lg overflow-hidden relative border border-border-def"
                  style={{ background: palette.preview.bg }}
                >
                  <div
                    className="absolute inset-[4px] rounded-md"
                    style={{
                      background: palette.id === 'gradient' ? 'rgba(255,255,255,0.1)' : palette.preview.bg,
                      border: `1px solid ${accentColor}40`,
                    }}
                  />
                  {/* Accent dot */}
                  <div
                    className="absolute bottom-[8px] left-[8px] w-[8px] h-[3px] rounded-sm"
                    style={{ background: accentColor }}
                  />
                  {/* Text lines */}
                  <div
                    className="absolute top-[10px] left-[8px] right-[8px] h-[2px] rounded-full opacity-60"
                    style={{ background: palette.preview.text }}
                  />
                  <div
                    className="absolute top-[15px] left-[8px] w-[60%] h-[2px] rounded-full opacity-30"
                    style={{ background: palette.preview.text }}
                  />
                </div>

                {/* Label */}
                <span className={`text-[10px] font-body font-medium leading-none whitespace-nowrap
                  ${isSelected ? 'text-accent' : 'text-text-s'}`}>
                  {palette.name}
                </span>

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full
                    bg-accent flex items-center justify-center">
                    <Check size={8} weight="bold" className="text-bg-base" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}