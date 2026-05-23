import re

filepath = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace V3 layout start logic
v3_old = "  // --- V3 BOLD BOX LAYOUT ---\n  return (\n    <div style={{ width: '1080px', height: '1080px', backgroundColor: slideIndex % 2 !== 0 && !isLastSlide && !isFirstSlide ? (selectedTheme.includes('lime') ? '#F8F9F3' : '#FFFFFF') : themeColors.bg, position: 'relative', overflow: 'hidden', color: themeColors.text, boxSizing: 'border-box' }}>"

v3_new = """  // --- V3 BOLD BOX LAYOUT ---
  const isAltSlide = slideIndex % 2 !== 0 && !isLastSlide && !isFirstSlide;
  const v3Bg = isAltSlide ? (themeColors.altBg || '#FFFFFF') : themeColors.bg;
  const v3Text = isAltSlide ? (themeColors.altText || '#000000') : themeColors.text;
  const v3BodyText = isAltSlide ? (themeColors.altText || '#333333') : themeColors.bodyText;

  return (
    <div style={{ width: '1080px', height: '1080px', backgroundColor: v3Bg, position: 'relative', overflow: 'hidden', color: v3Text, boxSizing: 'border-box' }}>"""

content = content.replace(v3_old, v3_new)

# Now we need to update all instances of themeColors in V3 to use v3Text, v3Bg, etc.
# Specifically the top bar text: color: themeColors.text -> color: v3Text
content = content.replace(
    "color: themeColors.text }}>\n          <span>{brandLogoUrl",
    "color: v3Text }}>\n          <span>{brandLogoUrl"
)

# Eye icon fill
content = content.replace(
    "<circle cx=\"50\" cy=\"50\" r=\"40\" fill={themeColors.bg} />",
    "<circle cx=\"50\" cy=\"50\" r=\"40\" fill={v3Bg} />"
)

# Rect fill
content = content.replace(
    "<rect x=\"20\" y=\"20\" width=\"60\" height=\"60\" rx=\"10\" fill={themeColors.bg} />",
    "<rect x=\"20\" y=\"20\" width=\"60\" height=\"60\" rx=\"10\" fill={v3Bg} />"
)

# Title text color
content = content.replace(
    "color: themeColors.text, display: 'flex'",
    "color: v3Text, display: 'flex'"
)

# Body text
content = content.replace(
    "{renderFormattedText(textToRender, themeColors.bodyText)}",
    "{renderFormattedText(textToRender, selectedTheme.startsWith('v3_') ? v3BodyText : themeColors.bodyText)}"
)

# Bottom bar text color
content = content.replace(
    "zIndex: 20, color: themeColors.text }}>\n          {!isLastSlide",
    "zIndex: 20, color: v3Text }}>\n          {!isLastSlide"
)

# Arrow button background fill
content = content.replace(
    "fill={themeColors.bg}>\n                        <path d=\"M104,136",
    "fill={v3Bg}>\n                        <path d=\"M104,136"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed V3 background and text logic")
