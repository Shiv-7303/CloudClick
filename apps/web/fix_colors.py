import re

# 1. Update ThemePicker.tsx
filepath_tp = 'E:/CloudClick/apps/web/src/components/ui/ThemePicker.tsx'
with open(filepath_tp, 'r', encoding='utf-8') as f:
    content_tp = f.read()

content_tp = content_tp.replace(
    "{ bg: '#FAF9F6', accent: '#2563EB', text: '#111111', bodyText: '#333333', border_color: '#111' }",
    "{ bg: '#FAF9F6', accent: '#2563EB', text: '#111111', bodyText: '#333333', border_color: '#111', accentText: '#FFFFFF' }"
).replace(
    "{ bg: '#0A0A0A', accent: '#F5A623', text: '#F5F5F0', bodyText: '#8C8C8C', border_color: '#222' }",
    "{ bg: '#0A0A0A', accent: '#F5A623', text: '#F5F5F0', bodyText: '#8C8C8C', border_color: '#222', accentText: '#000000' }"
).replace(
    "{ bg: '#F0F0EC', accent: '#1A1A1A', text: '#0A0A0A', bodyText: '#555555', border_color: '#CCC' }",
    "{ bg: '#F0F0EC', accent: '#1A1A1A', text: '#0A0A0A', bodyText: '#555555', border_color: '#CCC', accentText: '#FFFFFF' }"
).replace(
    "{ bg: '#302B63', accent: '#A78BFA', text: '#FFFFFF', bodyText: 'rgba(255,255,255,0.72)', border_color: 'rgba(255,255,255,0.12)' }",
    "{ bg: '#302B63', accent: '#A78BFA', text: '#FFFFFF', bodyText: 'rgba(255,255,255,0.72)', border_color: 'rgba(255,255,255,0.12)', accentText: '#000000' }"
).replace(
    "{ bg: '#D4E149', accent: '#FFFFFF', text: '#000000', bodyText: '#333333', border_color: '#000' }",
    "{ bg: '#D4E149', accent: '#FFFFFF', text: '#000000', bodyText: '#333333', border_color: '#000', accentText: '#000000' }"
).replace(
    "{ bg: '#1A1A1A', accent: '#888888', text: '#FFFFFF', bodyText: '#CCCCCC', border_color: '#444' }",
    "{ bg: '#1A1A1A', accent: '#888888', text: '#FFFFFF', bodyText: '#CCCCCC', border_color: '#444', accentText: '#FFFFFF' }"
)

with open(filepath_tp, 'w', encoding='utf-8') as f:
    f.write(content_tp)

# 2. Update CarouselPreview.tsx
filepath_cp = 'E:/CloudClick/apps/web/src/components/ui/CarouselPreview.tsx'
with open(filepath_cp, 'r', encoding='utf-8') as f:
    content_cp = f.read()

content_cp = content_cp.replace(
    "themeColors: { bg: string; accent: string; text: string; bodyText: string; border_color?: string };",
    "themeColors: { bg: string; accent: string; text: string; bodyText: string; border_color?: string; accentText?: string };"
).replace(
    "{ bg: '#FAF9F6', accent: brandColor, text: '#111111', bodyText: '#333333', border_color: '#111' }",
    "{ bg: '#FAF9F6', accent: brandColor, text: '#111111', bodyText: '#333333', border_color: '#111', accentText: '#FFFFFF' }"
)

with open(filepath_cp, 'w', encoding='utf-8') as f:
    f.write(content_cp)

# 3. Update CarouselExportStage.tsx
filepath_ce = 'E:/CloudClick/apps/web/src/components/ui/CarouselExportStage.tsx'
with open(filepath_ce, 'r', encoding='utf-8') as f:
    content_ce = f.read()

content_ce = content_ce.replace(
    "themeColors: { bg: string; accent: string; text: string; bodyText: string; border_color?: string };",
    "themeColors: { bg: string; accent: string; text: string; bodyText: string; border_color?: string; accentText?: string };"
)

with open(filepath_ce, 'w', encoding='utf-8') as f:
    f.write(content_ce)


# 4. Update SlideRenderer.tsx
filepath_sr = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath_sr, 'r', encoding='utf-8') as f:
    content_sr = f.read()

# Replace hardcoded '#fff' with themeColors.accentText || '#fff'
content_sr = content_sr.replace(
    "backgroundColor: themeColors.accent, color: '#fff'",
    "backgroundColor: themeColors.accent, color: themeColors.accentText || '#fff'"
)
content_sr = content_sr.replace(
    "backgroundColor: themeColors.border_color || '#111', color: '#fff'",
    "backgroundColor: themeColors.border_color || '#111', color: themeColors.bg"
)
content_sr = content_sr.replace(
    "themeColors.text === '#111111' || themeColors.text === '#0A0A0A' || themeColors.text === '#000000' ? '#fff' : '#00'",
    "themeColors.accentText || '#fff'"
)
content_sr = content_sr.replace(
    "themeColors.text === '#111111' || themeColors.text === '#0A0A0A' || themeColors.text === '#000000' ? '#fff' : '#000'",
    "themeColors.accentText || '#fff'"
)

with open(filepath_sr, 'w', encoding='utf-8') as f:
    f.write(content_sr)

print("Updated colors successfully.")