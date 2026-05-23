import re

filepath = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to insert getStackedLines at the top of SlideRenderer
stacked_func = """  const getStackedLines = (text: string, maxChars: number) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    words.forEach(word => {
      if ((currentLine + ' ' + word).trim().length > maxChars) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      }
    });
    if (currentLine) lines.push(currentLine.trim());
    return lines;
  };

  // --- V1 BRUTAL LAYOUT (from @preview_template.html) ---"""

content = content.replace("  // --- V1 BRUTAL LAYOUT (from @preview_template.html) ---", stacked_func)

# Replace V8 rendering block
v8_old = """        <div style={{ position: 'absolute', top: '150px', bottom: '120px', left: 0, right: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '60px', zIndex: 10 }}>
            <div style={{ width: '1200px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: isFirstSlide ? '210px' : '160px', lineHeight: 0.85, textTransform: 'uppercase', color: themeColors.text, display: 'flex', flexDirection: 'column' }}>
                    {isFirstSlide ? (
                      <>
                        <span>{slide?.title.split(' ')[0]}</span>
                        <span style={{ color: themeColors.accent }}>{slide?.title.split(' ')[1]}</span>
                        <span>{slide?.title.split(' ').slice(2).join(' ')}</span>
                      </>
                    ) : (
                      isLastSlide ? <><span style={{ color: themeColors.accent }}>SAVE</span><span>THIS</span></> : slide?.title
                    )}
                </div>
            </div>"""

v8_new = """        <div style={{ position: 'absolute', top: '150px', bottom: '120px', left: 0, right: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '50px', zIndex: 10 }}>
            <div style={{ width: '1000px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: isFirstSlide ? '170px' : '130px', lineHeight: 0.85, textTransform: 'uppercase', color: themeColors.text, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {isFirstSlide ? (
                      getStackedLines(slide?.title || '', 12).map((line, i) => (
                        <span key={i} style={{ color: i === 1 ? themeColors.accent : 'inherit', whiteSpace: 'nowrap' }}>{line}</span>
                      ))
                    ) : (
                      isLastSlide ? <><span style={{ color: themeColors.accent }}>SAVE</span><span>THIS</span></> : (
                        getStackedLines(slide?.title || '', 16).map((line, i) => (
                          <span key={i} style={{ whiteSpace: 'nowrap' }}>{line}</span>
                        ))
                      )
                    )}
                </div>
            </div>"""

content = content.replace(v8_old, v8_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed manifesto text width")