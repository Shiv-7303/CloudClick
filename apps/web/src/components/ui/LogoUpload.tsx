'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Check, Spinner, Warning } from '@phosphor-icons/react';
import { carouselApi } from '@/lib/api';

interface BrandResult {
  logo_url: string;
  brand_color_hex: string;
  brand_color_dark: string;
  brand_color_light: string;
  text_on_brand: string;
}

interface LogoUploadProps {
  currentLogoUrl?: string;
  onBrandUpdate: (data: BrandResult | null) => void;
  userTier: 'free' | 'creator' | 'pro';
}

export function LogoUpload({ currentLogoUrl, onBrandUpdate, userTier }: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const [brandColor, setBrandColor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPaid = userTier !== 'free';

  const handleFile = useCallback(async (file: File) => {
    // Validate client-side
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setError('Use PNG, JPG, WebP, or SVG');
      setUploadState('error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo must be under 5MB');
      setUploadState('error');
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);
    setError(null);

    try {
      const result = await carouselApi.uploadLogo(file);
      setBrandColor(result.brand_color_hex);
      setUploadState('success');
      onBrandUpdate(result);
      // Switch to actual URL
      setPreviewUrl(result.logo_url);
    } catch (err: any) {
      setUploadState('error');
      setError(err.message || 'Upload failed. Try again.');
      setPreviewUrl(currentLogoUrl || null);
      onBrandUpdate(null);
    } finally {
      setIsUploading(false);
    }
  }, [currentLogoUrl, onBrandUpdate]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemoveLogo = async () => {
    try {
      await carouselApi.deleteLogo();
      setPreviewUrl(null);
      setBrandColor(null);
      setUploadState('idle');
      onBrandUpdate(null);
    } catch {
      // Silent fail — UI still updates
      setPreviewUrl(null);
      onBrandUpdate(null);
    }
  };

  if (!isPaid) {
    return (
      <div className="rounded-xl border border-border-sub bg-bg-surface p-4
        flex items-center gap-3 opacity-60">
        <Upload size={18} weight="duotone" className="text-text-m shrink-0" />
        <div>
          <p className="text-xs font-body font-medium text-text-s">
            Upload Brand Logo
          </p>
          <p className="text-[11px] text-text-m font-body mt-0.5">
            Creator & Pro only — for personalized carousel branding
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-mono text-text-m mb-3">
        Brand Logo
      </p>

      {previewUrl ? (
        // Uploaded state
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border-def
          bg-bg-surface">
          {/* Logo preview */}
          <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center
            border border-border-sub overflow-hidden shrink-0">
            <img
              src={previewUrl}
              alt="Brand logo"
              className="max-w-full max-h-full object-contain p-1"
            />
          </div>

          {/* Brand color swatch */}
          {brandColor && (
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0"
                style={{ background: brandColor }}
                title={`Extracted brand color: ${brandColor}`}
              />
              <div>
                <p className="text-xs font-body font-medium text-text-p">
                  Brand color extracted
                </p>
                <p className="text-[11px] font-mono text-text-m">{brandColor}</p>
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {uploadState === 'success' && (
              <div className="flex items-center gap-1 text-positive text-xs font-body">
                <Check size={13} weight="bold" />
                Applied
              </div>
            )}
            {/* Replace button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-text-s font-body hover:text-text-p
                transition-colors px-3 py-1.5 rounded-lg border border-border-def
                hover:border-border-str"
            >
              Replace
            </button>
            {/* Remove button */}
            <button
              onClick={handleRemoveLogo}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                text-text-m hover:text-negative hover:bg-negative/10
                transition-all border border-border-sub"
              title="Remove logo"
            >
              <X size={13} weight="bold" />
            </button>
          </div>
        </div>
      ) : (
        // Upload dropzone
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-2
            p-6 rounded-xl border-2 border-dashed cursor-pointer
            transition-all duration-150
            ${isDragging
              ? 'border-accent bg-accent/8 scale-[1.01]'
              : 'border-border-def hover:border-accent/50 hover:bg-bg-elevated'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <Spinner size={24} weight="bold" className="text-accent animate-spin" />
          ) : (
            <Upload
              size={24}
              weight="duotone"
              className={isDragging ? 'text-accent' : 'text-text-m'}
            />
          )}

          <div className="text-center">
            <p className={`text-sm font-body font-medium
              ${isDragging ? 'text-accent' : 'text-text-s'}`}>
              {isUploading ? 'Uploading...' : 'Drop your logo here'}
            </p>
            <p className="text-[11px] text-text-m font-body mt-0.5">
              PNG, JPG, WebP, SVG · Max 5MB
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-negative text-xs font-body">
          <Warning size={13} weight="fill" />
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}