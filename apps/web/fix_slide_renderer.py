import re

filepath = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace fonts 
content = content.replace("fontFamily: \"'Plus Jakarta Sans', sans-serif\"", "fontFamily: 'var(--font-plus-jakarta-sans), sans-serif'")
content = content.replace("fontFamily: \"'Teko', sans-serif\"", "fontFamily: 'var(--font-teko), sans-serif'")
content = content.replace("fontFamily: \"'DM Sans', sans-serif\"", "fontFamily: 'var(--font-dm-sans), sans-serif'")
content = content.replace("fontFamily: \"'Instrument Serif', serif\"", "fontFamily: 'var(--font-instrument-serif), serif'")
content = content.replace("fontFamily: \"'Bricolage Grotesque', sans-serif\"", "fontFamily: 'var(--font-bricolage), sans-serif'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated SlideRenderer.tsx successfully.")