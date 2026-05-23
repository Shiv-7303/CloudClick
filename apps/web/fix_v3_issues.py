import re
import os

filepath = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Bold text rendering
old_format_line = """    const formatLine = (line: string) => {
      // Basic bold parsing: **text**
      const parts = line.split(/(\\*\\*.*?\\*\\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };"""

new_format_line = """    const formatLine = (line: string) => {
      // Basic bold parsing: **text** or *text*
      const parts = line.split(/(\\*\\*.*?\\*\\*|\\*.*?\\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <strong key={idx} style={{ fontWeight: 'bold' }}>{part.slice(1, -1)}</strong>;
        }
        return part;
      });
    };"""

content = content.replace(old_format_line, new_format_line)


# Fix 2: Eye color in V3
old_eye = """                 {(!isFirstSlide && !isLastSlide) && (
                     <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '320px', height: '320px', marginBottom: '10px' }} viewBox="0 0 100 100" fill="none" stroke={themeColors.border_color || '#000'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="50" cy="50" r="40" fill={themeColors.bg} />
                        <path d="M30 50 Q 50 20 70 50 Q 50 80 30 50" fill={themeColors.accent} />
                        <circle cx="50" cy="50" r="10" fill={themeColors.border_color || '#000'} />
                     </svg>
                 )}"""

new_eye = """                 {(!isFirstSlide && !isLastSlide) && (
                     <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '320px', height: '320px', marginBottom: '10px' }} viewBox="0 0 100 100" fill="none" stroke={themeColors.border_color || '#000'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="50" cy="50" r="40" fill={themeColors.bg} />
                        <path d="M30 50 Q 50 20 70 50 Q 50 80 30 50" fill={themeColors.accent} />
                        <circle cx="50" cy="50" r="10" fill={themeColors.accentText || '#000'} stroke="none" />
                     </svg>
                 )}"""

content = content.replace(old_eye, new_eye)


# Fix 3: Dynamic connecting lines in V3
old_svg_bg = """      <div style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none', opacity: 0.08, top: '200px', left: 0, width: '1080px', height: '1080px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" style={{ width: '100%', height: '100%', stroke: themeColors.border_color || '#000', strokeWidth: 8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none', strokeDasharray: '20 20' }}>
              <path d="M 200,800 C 400,900 800,400 600,200 C 400,0 200,300 500,600 C 700,800 900,750 1080,800" />
              {isFirstSlide && (
                <>
                  <path d="M 300,300 L 310,320 L 330,325 L 310,330 L 300,350 L 290,330 L 270,325 L 290,320 Z" stroke="none" fill={themeColors.border_color || '#000'} opacity="0.3"/>
                  <path d="M 800,600 L 805,610 L 815,612 L 805,615 L 800,625 L 795,615 L 785,612 L 795,610 Z" stroke="none" fill={themeColors.border_color || '#000'} opacity="0.3"/>
                </>
              )}
          </svg>
      </div>"""

new_svg_bg = """      <div style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none', opacity: 0.08, top: '200px', left: 0, width: '1080px', height: '1080px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" style={{ width: '100%', height: '100%', stroke: themeColors.border_color || '#000', strokeWidth: 8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none', strokeDasharray: '20 20' }}>
              {slideIndex % 4 === 0 && <path d="M 200,800 C 400,900 800,400 600,200 C 400,0 200,300 500,600 C 700,800 900,750 1080,800" />}
              {slideIndex % 4 === 1 && <path d="M -100,300 C 200,100 500,800 700,400 C 800,100 1000,500 1180,600" />}
              {slideIndex % 4 === 2 && <path d="M 100,900 C 300,500 700,800 800,300 C 900,-100 1000,400 1200,500" />}
              {slideIndex % 4 === 3 && <path d="M 0,600 C 400,800 500,200 800,400 C 1000,500 1000,900 1080,800" />}
              
              {isFirstSlide && (
                <>
                  <path d="M 300,300 L 310,320 L 330,325 L 310,330 L 300,350 L 290,330 L 270,325 L 290,320 Z" stroke="none" fill={themeColors.border_color || '#000'} opacity="0.3"/>
                  <path d="M 800,600 L 805,610 L 815,612 L 805,615 L 800,625 L 795,615 L 785,612 L 795,610 Z" stroke="none" fill={themeColors.border_color || '#000'} opacity="0.3"/>
                </>
              )}
          </svg>
      </div>"""

content = content.replace(old_svg_bg, new_svg_bg)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed V3 Eye color, Dynamic connecting lines, and Bold text parsing.")
