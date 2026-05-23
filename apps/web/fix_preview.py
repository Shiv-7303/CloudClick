import re

filepath = 'E:/CloudClick/apps/web/src/components/ui/CarouselPreview.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports
import_str = "import { ThemePicker } from './ThemePicker';\nimport { LogoUpload } from './LogoUpload';\nimport { CarouselExportStage, ExportStageRef } from './CarouselExportStage';\nimport { carouselApi, api } from '@/lib/api';"
new_import_str = "import { ThemePicker, PALETTES } from './ThemePicker';\nimport { LogoUpload } from './LogoUpload';\nimport { SlideRenderer } from './SlideRenderer';\nimport { CarouselExportStage, ExportStageRef } from './CarouselExportStage';\nimport { carouselApi, api } from '@/lib/api';"
content = content.replace(import_str, new_import_str)

# Replace props and THEME_PREVIEWS
props_str = """interface CarouselPreviewProps {
  slides: Array<{title: string; body: string; slide_number: number}>;
  userTier: 'free' | 'creator' | 'pro';
  analysisId: string;
  videoTitle?: string;
  onExportClick: (format: 'png' | 'pdf', handle?: string, theme?: string) => void;
  externalHandle?: string;
  onHandleChange?: (val: string) => void;
}

// Theme preview colors — matches backend
const THEME_PREVIEWS: Record<string, {bg: string; accent: string; text: string; bodyText: string; border_color?: string}> = {
  // Legacy
  dark:     { bg: '#0A0A0A', accent: '#F5A623', text: '#F5F5F0', bodyText: '#8C8C8C', border_color: '#222' },
  gradient: { bg: '#302B63', accent: '#A78BFA', text: '#FFFFFF', bodyText: 'rgba(255,255,255,0.7)', border_color: 'rgba(255,255,255,0.12)' },
  minimal:  { bg: '#F0F0EC', accent: '#1A1A1A', text: '#0A0A0A', bodyText: '#555555', border_color: '#CCC' },
  bold:     { bg: '#0A0A0A', accent: '#FF3B30', text: '#F5F5F0', bodyText: '#8C8C8C', border_color: '#222' },
  brand:    { bg: '#1A1A1A', accent: '#888888', text: '#0A0A0A', bodyText: '#444444', border_color: '#222' },
  
  // V1
  v1_light: { bg: '#FAF9F6', accent: '#2563EB', text: '#111111', bodyText: '#333333', border_color: '#111' },
  v1_dark: { bg: '#0A0A0A', accent: '#F5A623', text: '#F5F5F0', bodyText: '#8C8C8C', border_color: '#222' },
  v1_minimal: { bg: '#F0F0EC', accent: '#1A1A1A', text: '#0A0A0A', bodyText: '#555555', border_color: '#CCC' },
  v1_gradient: { bg: '#302B63', accent: '#A78BFA', text: '#FFFFFF', bodyText: 'rgba(255,255,255,0.72)', border_color: 'rgba(255,255,255,0.12)' },
  
  // V2
  v2_light: { bg: '#FCFBFA', accent: '#D2FA5C', text: '#2D3130', bodyText: '#4A4E4D', border_color: '#111' },
  v2_dark: { bg: '#1A1C1B', accent: '#D2FA5C', text: '#F8F9F8', bodyText: '#CCCCCC', border_color: '#333' },

  // V3
  v3_lime: { bg: '#D4E149', accent: '#FFFFFF', text: '#000000', bodyText: '#333333', border_color: '#000' },
  v3_light: { bg: '#F8F9F3', accent: '#D4E149', text: '#000000', bodyText: '#333333', border_color: '#000' },
  v3_dark: { bg: '#111111', accent: '#D4E149', text: '#FFFFFF', bodyText: '#CCCCCC', border_color: '#D4E149' },
};"""

content = content.replace(props_str, """interface CarouselPreviewProps {
  slides: Array<{title: string; body: string; slide_number: number}>;
  userTier: 'free' | 'creator' | 'pro';
  analysisId: string;
  videoTitle?: string;
  onExportClick: (format: 'png' | 'pdf', handle?: string, theme?: string) => void;
  externalHandle?: string;
  onHandleChange?: (val: string) => void;
}""")

# Replace state and useEffect
state_str = """  const [activeSlide, setActiveSlide]   = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('v1_light');
  const [hasLogo, setHasLogo]           = useState(false);
  const [brandColor, setBrandColor]     = useState<string | null>(null);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);
  
  const exportStageRef = useRef<ExportStageRef>(null);

  // Load existing brand settings on mount
  useEffect(() => {
    if (!isPaid) return;
    carouselApi.getBrandSettings()
      .then((settings) => {
        setSelectedTheme(settings.preferred_theme || 'v1_light');
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
      if (selectedTheme === 'brand') setSelectedTheme('v1_light');
      return;
    }
    setHasLogo(true);
    setBrandColor(data.brand_color_hex);
    setBrandLogoUrl(data.logo_url);
    setSelectedTheme('brand');
  };"""

new_state_str = """  const [activeSlide, setActiveSlide]   = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('v1');
  const [selectedPalette, setSelectedPalette] = useState('light');
  const [hasLogo, setHasLogo]           = useState(false);
  const [brandColor, setBrandColor]     = useState<string | null>(null);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);
  
  const exportStageRef = useRef<ExportStageRef>(null);

  // Load existing brand settings on mount
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
  };"""
content = content.replace(state_str, new_state_str)

# Replace themeColors and selectedTheme usages
theme_colors_str = """  // Get current theme preview colors
  const themeColors = selectedTheme === 'brand' && brandColor
    ? { bg: '#FAF9F6', accent: brandColor, text: '#111111', bodyText: '#333333', border_color: '#111111' }
    : THEME_PREVIEWS[selectedTheme] || THEME_PREVIEWS.v1_light;"""

new_theme_colors_str = """  // Resolve current theme palette colors
  const paletteObj = PALETTES.find(p => p.id === selectedPalette) || PALETTES[0];
  const themeColors = selectedPalette === 'brand' && brandColor
    ? { bg: '#FAF9F6', accent: brandColor, text: '#111111', bodyText: '#333333', border_color: '#111' }
    : paletteObj.preview;
    
  const selectedTheme = `${selectedTemplate}_${selectedPalette}`;"""
content = content.replace(theme_colors_str, new_theme_colors_str)

# Replace ThemePicker usage
theme_picker_str = """          <ThemePicker
            selectedTheme={selectedTheme}
            onThemeChange={handleThemeChange}
            hasLogo={hasLogo}
            brandColor={brandColor || undefined}
            disabled={isSavingTheme}
          />"""

new_theme_picker_str = """          <ThemePicker
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
            selectedPalette={selectedPalette}
            onPaletteChange={handlePaletteChange}
            hasLogo={hasLogo}
            brandColor={brandColor || undefined}
            disabled={isSavingTheme}
          />"""
content = content.replace(theme_picker_str, new_theme_picker_str)

# Replace the giant render block with SlideRenderer
start_marker = "{/* We use a fixed 1080x1080 container and scale it down to fit the preview box."
end_marker = "{/* Navigation arrows */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_render_block = """{/* We use a fixed 1080x1080 container and scale it down to fit the 420px preview box. 
            420 / 1080 = 0.3888 */}
        <div style={{ width: 1080, height: 1080, transform: 'scale(0.3888)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
          <SlideRenderer 
            slide={currentSlide} 
            slideIndex={activeSlide} 
            totalSlides={displaySlides.length} 
            themeColors={themeColors} 
            selectedTheme={selectedTheme} 
            brandLogoUrl={brandLogoUrl} 
            handleText={externalHandle || process.env.NEXT_PUBLIC_APP_NAME || 'CLOUDCLICK'} 
          />
        </div>

        """
    content = content[:start_idx] + new_render_block + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated CarouselPreview.tsx successfully.")
