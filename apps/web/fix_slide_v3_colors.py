import re

filepath_sr = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath_sr, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix V3 specifically
content = content.replace(
    "backgroundColor: themeColors.accent, color: themeColors.text === '#111111' || themeColors.text === '#0A0A0A' || themeColors.text === '#000000' ? '#fff' : '#000'",
    "backgroundColor: themeColors.accent, color: themeColors.accentText || '#fff'"
)
content = content.replace(
    "color: (themeColors.text === '#111111' || themeColors.text === '#0A0A0A' || themeColors.text === '#000000') ? '#fff' : '#000'",
    "color: themeColors.accentText || '#fff'"
)

with open(filepath_sr, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed V3 colors.")