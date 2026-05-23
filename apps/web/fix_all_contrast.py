import re

# 1. Update ThemePicker.tsx
filepath_tp = 'E:/CloudClick/apps/web/src/components/ui/ThemePicker.tsx'
with open(filepath_tp, 'r', encoding='utf-8') as f:
    content_tp = f.read()

content_tp = content_tp.replace(
    "border_color: '#111', accentText: '#FFFFFF' }",
    "border_color: '#111', accentText: '#FFFFFF', altBg: '#F3F4F6', altText: '#111111' }"
).replace(
    "border_color: '#222', accentText: '#000000' }",
    "border_color: '#222', accentText: '#000000', altBg: '#1F2937', altText: '#F5F5F0' }"
).replace(
    "border_color: '#CCC', accentText: '#FFFFFF' }",
    "border_color: '#CCC', accentText: '#FFFFFF', altBg: '#E5E7EB', altText: '#0A0A0A' }"
).replace(
    "border_color: 'rgba(255,255,255,0.12)', accentText: '#000000' }",
    "border_color: 'rgba(255,255,255,0.12)', accentText: '#000000', altBg: '#1E1B4B', altText: '#FFFFFF' }"
).replace(
    "border_color: '#000', accentText: '#000000' }",
    "border_color: '#000', accentText: '#000000', altBg: '#F8F9F3', altText: '#000000' }"
).replace(
    "border_color: '#444', accentText: '#FFFFFF' }",
    "border_color: '#444', accentText: '#FFFFFF', altBg: '#2A2A2A', altText: '#FFFFFF' }"
)

with open(filepath_tp, 'w', encoding='utf-8') as f:
    f.write(content_tp)

# 2. Update CarouselPreview.tsx
filepath_cp = 'E:/CloudClick/apps/web/src/components/ui/CarouselPreview.tsx'
with open(filepath_cp, 'r', encoding='utf-8') as f:
    content_cp = f.read()

content_cp = content_cp.replace(
    "accentText?: string };",
    "accentText?: string; altBg?: string; altText?: string };"
).replace(
    "bodyText: '#333333', border_color: '#111', accentText: '#FFFFFF' }",
    "bodyText: '#333333', border_color: '#111', accentText: '#FFFFFF', altBg: '#F3F4F6', altText: '#111111' }"
)

with open(filepath_cp, 'w', encoding='utf-8') as f:
    f.write(content_cp)

# 3. Update CarouselExportStage.tsx
filepath_ce = 'E:/CloudClick/apps/web/src/components/ui/CarouselExportStage.tsx'
with open(filepath_ce, 'r', encoding='utf-8') as f:
    content_ce = f.read()

content_ce = content_ce.replace(
    "accentText?: string };",
    "accentText?: string; altBg?: string; altText?: string };"
)

with open(filepath_ce, 'w', encoding='utf-8') as f:
    f.write(content_ce)

print("Updated config successfully.")