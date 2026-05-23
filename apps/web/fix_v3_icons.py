import re

filepath = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the Arrow right background circle fill
content = content.replace(
    "color: themeColors.bg, zIndex: 1 }}>",
    "color: v3Bg, zIndex: 1 }}>"
)

# Fix the Save button text color
content = content.replace(
    "color: themeColors.bg }}>SAVE</span>}",
    "color: v3Bg }}>SAVE</span>}"
)

# Fix the Arrow right icon stroke color
content = content.replace(
    "stroke: themeColors.bg, strokeWidth: 4",
    "stroke: v3Bg, strokeWidth: 4"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed V3 save button text colors")
