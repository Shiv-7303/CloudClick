import re
import os

filepath = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we don't inject it twice
if "V4 WIREFRAME" in content:
    print("Templates already added.")
    exit(0)

# We find the end of the file (which should be the end of V3)
# Let's replace the final `};` with the new templates and then the final `};`
v4_to_v8 = """
  // --- V4 WIREFRAME / BLUEPRINT LAYOUT ---
  if (selectedTheme.startsWith('v4_')) {
    return (
      <div style={{
        width: '1080px', height: '1080px', 
        backgroundColor: themeColors.bg, 
        position: 'relative', overflow: 'hidden',
        backgroundImage: `linear-gradient(${themeColors.accent}1a 1px, transparent 1px), linear-gradient(90deg, ${themeColors.accent}1a 1px, transparent 1px)`,
        backgroundSize: '20px 20px', 
        border: `1px solid ${themeColors.accent}`,
        fontFamily: 'var(--font-space-mono), monospace',
        color: themeColors.text,
        boxSizing: 'border-box'
      }}>
        <div style={{position:'absolute', top:'20px', left:'20px', fontSize:'24px', color:themeColors.accent, lineHeight:1}}>+</div>
        <div style={{position:'absolute', bottom:'20px', right:'20px', fontSize:'24px', color:themeColors.accent, lineHeight:1}}>+</div>
        <div style={{position:'absolute', top:'20px', right:'20px', fontSize:'24px', color:themeColors.accent, lineHeight:1}}>+</div>
        <div style={{position:'absolute', bottom:'20px', left:'20px', fontSize:'24px', color:themeColors.accent, lineHeight:1}}>+</div>

        <div style={{ position: 'absolute', top: '60px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${themeColors.accent}`, paddingBottom: '15px', color: themeColors.accent }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', textTransform: 'uppercase' }}>
            <span>PROJECT: {brandLogoUrl ? <img src={brandLogoUrl} crossOrigin="anonymous" style={{height:'20px', objectFit:'contain', display:'inline', verticalAlign:'middle'}} alt="logo" /> : handleText.toUpperCase()}</span>
            <span>STATUS: ACTIVE</span>
          </div>
          <div style={{ fontSize: '40px', fontWeight: 700, lineHeight: 0.8 }}>
             {String(slideIndex + 1).padStart(2, '0')}
          </div>
        </div>
        
        <div style={{ position: 'absolute', top: '250px', left: '60px', width: '900px', display: 'flex', flexDirection: 'column', gap: '30px', zIndex: 10 }}>
          <div style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '2px', color: themeColors.text, border: `1px solid ${themeColors.text}`, padding: '8px 16px', display: 'inline-block', width: 'fit-content' }}>
            {isFirstSlide ? 'DIAGNOSTIC REPORT' : (isLastSlide ? 'ACTION REQUIRED' : 'ANALYSIS')}
          </div>
          
          <div style={{ fontSize: isFirstSlide ? '110px' : '90px', fontWeight: 700, lineHeight: 0.9, color: themeColors.text, textTransform: 'uppercase', letterSpacing: '-2px' }}>
            {isFirstSlide ? (
              <>
                {slide?.title.split(' ').slice(0, -1).join(' ')} <span style={{ color: themeColors.accent }}>{slide?.title.split(' ').slice(-1)}</span>
              </>
            ) : (
              isLastSlide ? 'SAVE THIS FOR LATER' : slide?.title
            )}
          </div>
          
          {(!isFirstSlide) && (
            <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '38px', fontWeight: 500, lineHeight: 1.4, color: themeColors.bodyText, maxWidth: '800px', padding: '30px', border: `1px dashed ${themeColors.accent}`, backgroundColor: themeColors.altBg || (themeColors.bg === '#0A0A0A' ? '#111' : '#fff') }}>
               {renderFormattedText(textToRender, themeColors.bodyText)}
            </div>
          )}
        </div>
        
        <div style={{ position: 'absolute', bottom: '60px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', textTransform: 'uppercase', color: themeColors.text }}>
          <span>@{handleText.toUpperCase()}</span>
          <span>[ {isLastSlide ? 'SAVE AND DEPLOY' : 'SWIPE TO ANALYZE'} ]</span>
        </div>
      </div>
    );
  }

  // --- V5 EDITORIAL SPLIT ---
  if (selectedTheme.startsWith('v5_')) {
    return (
      <div style={{ width: '1080px', height: '1080px', backgroundColor: themeColors.bg, position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-inter), sans-serif', color: themeColors.text, boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '180px', width: '1px', backgroundColor: themeColors.border_color || 'rgba(17,17,17,0.2)' }}></div>
        
        <div style={{ position: 'absolute', top: '80px', left: '40px', width: '100px', fontSize: '14px', textAlign: 'center', letterSpacing: '2px' }}>
          No. {String(slideIndex + 1).padStart(2, '0')}
        </div>
        <div style={{ position: 'absolute', top: '80px', left: '220px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 500 }}>
          {isFirstSlide ? 'Chapter One' : (isLastSlide ? 'Conclusion' : 'Continued')}
        </div>
        
        <div style={{ position: 'absolute', top: '220px', left: '160px', fontFamily: 'var(--font-playfair), serif', fontSize: '140px', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-2px', width: '850px' }}>
          {isFirstSlide ? (
            <>
              {slide?.title.split(' ')[0]} {slide?.title.split(' ')[1]}<br/>
              <i style={{ fontStyle: 'italic', color: themeColors.accent }}>{slide?.title.split(' ')[2]}</i><br/>
              {slide?.title.split(' ').slice(3).join(' ')}
            </>
          ) : (
             isLastSlide ? 'Save this for later.' : slide?.title
          )}
        </div>
        
        {(!isFirstSlide) && (
          <div style={{ position: 'absolute', bottom: '180px', left: '220px', fontSize: '36px', fontWeight: 300, lineHeight: 1.5, color: themeColors.bodyText, maxWidth: '700px' }}>
             {renderFormattedText(textToRender, themeColors.bodyText)}
          </div>
        )}
        
        <div style={{ position: 'absolute', bottom: '80px', left: '220px', right: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px', borderTop: `1px solid ${themeColors.border_color || 'rgba(17,17,17,0.2)'}`, paddingTop: '20px' }}>
          <span>{brandLogoUrl ? <img src={brandLogoUrl} crossOrigin="anonymous" style={{height:'20px', objectFit:'contain'}} alt="logo" /> : `@${handleText}`} JOURNAL</span>
          <span>{isLastSlide ? 'SHARE' : 'SWIPE TO READ'} ➔</span>
        </div>
      </div>
    );
  }

  // --- V6 NEO-BRUTAL STICKERS ---
  if (selectedTheme.startsWith('v6_')) {
    return (
      <div style={{ width: '1080px', height: '1080px', backgroundColor: themeColors.accent, position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-outfit), sans-serif', backgroundImage: `radial-gradient(${themeColors.border_color || '#000'} 15%, transparent 16%), radial-gradient(${themeColors.border_color || '#000'} 15%, transparent 16%)`, backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', top: '60px', left: '60px', right: '60px', bottom: '60px', backgroundColor: themeColors.bg, border: `8px solid ${themeColors.border_color || '#000'}`, borderRadius: '40px', boxShadow: `16px 16px 0px ${themeColors.border_color || '#000'}` }}>
            
            <div style={{ position: 'absolute', top: '-30px', right: '60px', backgroundColor: '#FFD166', border: `6px solid ${themeColors.border_color || '#000'}`, borderRadius: '50px', padding: '10px 30px', fontFamily: 'var(--font-archivo-black), sans-serif', fontSize: '32px', textTransform: 'uppercase', color: '#000', boxShadow: `8px 8px 0px ${themeColors.border_color || '#000'}`, transform: 'rotate(5deg)' }}>
                {isFirstSlide ? 'STOP SCROLLING!' : (isLastSlide ? 'SAVE THIS!' : `TIP #${slideIndex}`)}
            </div>
            
            <div style={{ position: 'absolute', top: '180px', left: '60px', right: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-archivo-black), sans-serif', fontSize: isFirstSlide ? '130px' : '100px', lineHeight: 0.9, textTransform: 'uppercase', color: themeColors.text, textShadow: `6px 6px 0px ${themeColors.accent}`, marginBottom: '40px', transform: 'rotate(-2deg)' }}>
                    {isLastSlide ? 'SAVE THIS FOR LATER.' : slide?.title}
                </div>
                
                {(!isFirstSlide) && (
                  <div style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.4, color: themeColors.bodyText, maxWidth: '750px', backgroundColor: themeColors.bg, padding: '20px 40px', border: `5px solid ${themeColors.border_color || '#000'}`, borderRadius: '20px', boxShadow: `8px 8px 0px ${themeColors.border_color || '#000'}`, textAlign: 'left' }}>
                      {renderFormattedText(textToRender, themeColors.bodyText)}
                  </div>
                )}
            </div>

            <div style={{ position: 'absolute', bottom: '50px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '28px', fontWeight: 900, color: themeColors.text }}>
                <span>{brandLogoUrl ? <img src={brandLogoUrl} crossOrigin="anonymous" style={{height:'40px', objectFit:'contain'}} alt="logo" /> : `@${handleText.toUpperCase()}`}</span>
                <span>{String(slideIndex + 1).padStart(2, '0')}/{String(totalSlides).padStart(2, '0')} ➔</span>
            </div>
        </div>
      </div>
    );
  }

  // --- V7 CONTRAST SPLIT ---
  if (selectedTheme.startsWith('v7_')) {
    return (
      <div style={{ width: '1080px', height: '1080px', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-dm-sans), sans-serif', display: 'flex', boxSizing: 'border-box' }}>
        <div style={{ width: '50%', height: '100%', backgroundColor: themeColors.bg }}></div>
        <div style={{ width: '50%', height: '100%', backgroundColor: themeColors.accent }}></div>
        
        <div style={{ position: 'absolute', top: '60px', left: '80px', right: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '22px', fontWeight: 700, zIndex: 10 }}>
            <span style={{ color: themeColors.text }}>{String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}</span>
            <span style={{ color: themeColors.accentText || '#000' }}>{brandLogoUrl ? <img src={brandLogoUrl} crossOrigin="anonymous" style={{height:'30px', objectFit:'contain'}} alt="logo" /> : `@${handleText}`}</span>
        </div>

        <div style={{ position: 'absolute', top: '150px', bottom: '120px', left: 0, right: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '60px' }}>
            <div style={{ width: '1080px', textAlign: 'center', pointerEvents: 'none', mixBlendMode: 'difference', display: 'flex', flexDirection: 'column', alignItems: 'center', color: themeColors.accent }}>
                <div style={{ fontFamily: 'var(--font-anton), sans-serif', fontSize: isFirstSlide ? '180px' : '150px', lineHeight: 0.9, textTransform: 'uppercase' }}>
                   {isLastSlide ? 'SAVE FOR LATER' : slide?.title}
                </div>
            </div>

            {(!isFirstSlide) && (
              <div style={{ width: '1080px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 500, lineHeight: 1.4, maxWidth: '800px', textAlign: 'center', backgroundColor: themeColors.bg, color: themeColors.text, padding: '30px 40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                      {renderFormattedText(textToRender, themeColors.text)}
                  </div>
              </div>
            )}
        </div>

        <div style={{ position: 'absolute', bottom: '60px', left: '80px', right: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '20px', fontWeight: 700, zIndex: 10 }}>
            <span style={{ color: themeColors.text }}>{isLastSlide ? 'DONE' : 'SWIPE LEFT'}</span>
            <span style={{ color: themeColors.accentText || '#000' }}>{isLastSlide ? 'SHARE' : 'SAVE FOR LATER'}</span>
        </div>
      </div>
    );
  }

  // --- V8 TYPE-ONLY MANIFESTO ---
  if (selectedTheme.startsWith('v8_')) {
    return (
      <div style={{ width: '1080px', height: '1080px', backgroundColor: themeColors.bg, position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-inter), sans-serif', color: themeColors.text, boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', top: '60px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: themeColors.text, opacity: 0.5, zIndex: 20 }}>
            <span>{String(slideIndex + 1).padStart(2, '0')}/{String(totalSlides).padStart(2, '0')}</span>
            <span>{brandLogoUrl ? <img src={brandLogoUrl} crossOrigin="anonymous" style={{height:'30px', objectFit:'contain'}} alt="logo" /> : `@${handleText}`}</span>
        </div>

        <div style={{ position: 'absolute', top: '150px', bottom: '120px', left: 0, right: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '60px', zIndex: 10 }}>
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
            </div>

            {(!isFirstSlide) && (
              <div style={{ width: '1080px', display: 'flex', justifyContent: 'center', zIndex: 20 }}>
                  <div style={{ fontSize: '38px', fontWeight: 500, lineHeight: 1.4, color: themeColors.text, maxWidth: '800px', textAlign: 'center' }}>
                      {renderFormattedText(textToRender, themeColors.bodyText)}
                  </div>
              </div>
            )}
        </div>

        <div style={{ position: 'absolute', bottom: '60px', left: 0, width: '1080px', textAlign: 'center', fontSize: '20px', fontWeight: 700, color: themeColors.text, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '5px' }}>
            {isLastSlide ? 'SHARE THIS WITH A FRIEND' : 'SWIPE TO LEARN HOW'}
        </div>
      </div>
    );
  }

  // Fallback if no matching template
  return <div>Unknown Template</div>;
};
"""

content = content.replace("  // Fallback if no matching template\n  return <div>Unknown Template</div>;\n};", "")
content = content.replace("  // If we reach here, we shouldn't, but just in case\n  return null;\n};", "") # if exist

content = re.sub(r'  \);\n};\s*$', '', content)
content += v4_to_v8

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added templates V4 to V8 successfully.")
