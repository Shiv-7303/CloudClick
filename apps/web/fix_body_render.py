import re

filepath = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# First, remove the old bullet parsing logic
old_logic_start = "  const rawBody = slide?.body || '';"
old_logic_end = """      finalBody = parts.slice(1).join(' ');
    }
  }"""

start_idx = content.find(old_logic_start)
end_idx = content.find(old_logic_end) + len(old_logic_end)

new_logic = """  const rawBody = slide?.body || '';
  
  // Extract stat if body starts with a number/symbol
  let stat = null;
  let textToRender = rawBody;
  
  const firstLine = rawBody.split('\\n')[0].trim();
  if (firstLine && (firstLine[0].match(/[0-9]/) || firstLine.startsWith('%') || firstLine.startsWith('$') || firstLine.startsWith('₹'))) {
    const parts = firstLine.split(' ');
    if (parts[0].length < 10) {
      stat = parts[0];
      // remove the stat from the first line
      textToRender = rawBody.replace(stat, '').trim();
    }
  }

  // A helper function to render text that might contain markdown bullets and bold text
  const renderFormattedText = (text: string, color: string) => {
    const lines = text.split('\\n').map((l: string) => l.trim()).filter(Boolean);
    
    // Check if the entire block is just a list
    const allListItems = lines.length > 0 && lines.every((l: string) => /^([\\*\\-\\+]|\\d+\\.)(?:\\s*->)?\\s+/.test(l));
    
    const formatLine = (line: string) => {
      // Basic bold parsing: **text**
      const parts = line.split(/(\\*\\*.*?\\*\\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    if (allListItems) {
      return (
        <ul style={{ marginLeft: '40px', marginTop: '15px', color }}>
          {lines.map((l: string, i: number) => {
            const cleanText = l.replace(/^([\\*\\-\\+]|\\d+\\.)(?:\\s*->)?\\s+/, '');
            return <li key={i} style={{marginBottom: '15px'}}>{formatLine(cleanText)}</li>;
          })}
        </ul>
      );
    }
    
    // Mixed content or just paragraphs
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color }}>
        {lines.map((l: string, i: number) => {
          const isListItem = /^([\\*\\-\\+]|\\d+\\.)(?:\\s*->)?\\s+/.test(l);
          if (isListItem) {
            const cleanText = l.replace(/^([\\*\\-\\+]|\\d+\\.)(?:\\s*->)?\\s+/, '');
            return (
              <div key={i} style={{ display: 'flex', gap: '15px', paddingLeft: '20px' }}>
                <span style={{ color: themeColors.accent }}>•</span>
                <span>{formatLine(cleanText)}</span>
              </div>
            );
          }
          return <div key={i}>{formatLine(l)}</div>;
        })}
      </div>
    );
  };
"""

content = content[:start_idx] + new_logic + content[end_idx:]

# Now replace the body rendering in V1
v1_body_old = """          <div style={{ fontSize: '40px', fontWeight: 500, color: '#333', lineHeight: 1.45, maxWidth: '900px', marginTop: '15px' }}>
            {finalBody}
            {bullets && (
              <ul style={{ marginLeft: '40px', marginTop: '15px' }}>
                {bullets.map((b: string, i: number) => <li key={i} style={{marginBottom: '15px'}}>{b}</li>)}
              </ul>
            )}
          </div>"""
v1_body_new = """          <div style={{ fontSize: '40px', fontWeight: 500, lineHeight: 1.45, maxWidth: '900px', marginTop: '15px' }}>
            {renderFormattedText(textToRender, themeColors.bodyText)}
          </div>"""
content = content.replace(v1_body_old, v1_body_new)

# Replace the body rendering in V2
v2_body_old = """          {(!isFirstSlide) && (
            <div style={{ fontSize: '42px', fontWeight: 400, color: themeColors.bodyText, lineHeight: 1.5, textAlign: isLastSlide ? 'center' : 'left', display: 'inline-block' }}>
              {finalBody}
              {bullets && (
                  <ul style={{ marginLeft: '40px', marginTop: '15px', textAlign: 'left' }}>
                    {bullets.map((b: string, i: number) => <li key={i} style={{marginBottom: '15px'}}>{b}</li>)}
                  </ul>
              )}
            </div>
          )}"""
v2_body_new = """          {(!isFirstSlide) && (
            <div style={{ fontSize: '42px', fontWeight: 400, lineHeight: 1.5, textAlign: isLastSlide ? 'center' : 'left', display: 'inline-block', width: '100%' }}>
              {renderFormattedText(textToRender, themeColors.bodyText)}
            </div>
          )}"""
content = content.replace(v2_body_old, v2_body_new)

# Replace the body rendering in V3
v3_body_old = """          {(!isFirstSlide) && (
            <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '42px', fontWeight: 500, color: themeColors.bodyText, lineHeight: 1.45 }}>
              {finalBody}
              {bullets && (
                  <ul style={{ marginLeft: '40px', marginTop: '15px', textAlign: 'left', display: 'inline-block' }}>
                    {bullets.map((b: string, i: number) => <li key={i} style={{marginBottom: '15px'}}>{b}</li>)}
                  </ul>
              )}
            </div>
          )}"""
v3_body_new = """          {(!isFirstSlide) && (
            <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '42px', fontWeight: 500, lineHeight: 1.45, width: '100%', textAlign: isLastSlide ? 'center' : 'left' }}>
              {renderFormattedText(textToRender, themeColors.bodyText)}
            </div>
          )}"""
content = content.replace(v3_body_old, v3_body_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated rendering logic")
