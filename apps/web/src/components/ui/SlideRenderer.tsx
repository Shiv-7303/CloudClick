import React from 'react';

export const SlideRenderer = ({ 
  slide, 
  slideIndex, 
  totalSlides, 
  themeColors, 
  selectedTheme, 
  brandLogoUrl, 
  handleText,
  isExport = false
}: any) => {
  const isFirstSlide = slideIndex === 0;
  const isLastSlide = slideIndex === totalSlides - 1;

  const rawBody = slide?.body || '';
  
  // Extract stat if body starts with a number/symbol
  let stat = null;
  let textToRender = rawBody;
  
  const firstLine = rawBody.split('\n')[0].trim();
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
    const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
    
    // Check if the entire block is just a list
    const allListItems = lines.length > 0 && lines.every((l: string) => /^([\*\-\+]|\d+\.)(?:\s*->)?\s+/.test(l));
    
    const formatLine = (line: string) => {
      // Basic bold parsing: **text** or *text*
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <strong key={idx} style={{ fontWeight: 'bold' }}>{part.slice(1, -1)}</strong>;
        }
        return part;
      });
    };

    if (allListItems) {
      return (
        <ul style={{ marginLeft: '40px', marginTop: '15px', color }}>
          {lines.map((l: string, i: number) => {
            const cleanText = l.replace(/^([\*\-\+]|\d+\.)(?:\s*->)?\s+/, '');
            return <li key={i} style={{marginBottom: '15px'}}>{formatLine(cleanText)}</li>;
          })}
        </ul>
      );
    }
    
    // Mixed content or just paragraphs
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color }}>
        {lines.map((l: string, i: number) => {
          const isListItem = /^([\*\-\+]|\d+\.)(?:\s*->)?\s+/.test(l);
          if (isListItem) {
            const cleanText = l.replace(/^([\*\-\+]|\d+\.)(?:\s*->)?\s+/, '');
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


  const getStackedLines = (text: string, maxChars: number) => {
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

  // --- V1 BRUTAL LAYOUT (from @preview_template.html) ---
  const isKnownTemplate = ['v1_', 'v2_', 'v3_', 'v4_', 'v5_', 'v6_', 'v7_', 'v8_'].some(t => selectedTheme?.startsWith(t));
  if (selectedTheme?.startsWith('v1_') || !isKnownTemplate) {
    return (
      <div style={{
        width: '1080px', height: '1080px', 
        backgroundColor: themeColors.bg, 
        position: 'relative', overflow: 'hidden',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px', 
        border: `12px solid ${themeColors.border_color || '#111'}`,
        fontFamily: 'var(--font-plus-jakarta-sans), sans-serif',
        boxSizing: 'border-box'
      }}>
        <div style={{ position: 'absolute', top: '50px', left: '50px', right: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '20px', fontWeight: 600, color: themeColors.border_color || '#111', borderBottom: `3px solid ${themeColors.border_color || '#111'}`, paddingBottom: '20px' }}>
          <div style={{ backgroundColor: themeColors.border_color || '#111', color: themeColors.bg, padding: '6px 16px', borderRadius: '50px', fontSize: '18px', letterSpacing: '0.1em' }}>
            {String(slideIndex + 1).padStart(2, '0')}/{String(totalSlides).padStart(2, '0')}
          </div>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {isFirstSlide ? 'SWIPE ➔' : (brandLogoUrl ? <img src={brandLogoUrl} crossOrigin="anonymous" style={{height:'30px', objectFit:'contain'}} alt="logo" /> : `@${handleText.toUpperCase()}`)}
          </span>
        </div>
        
        <div style={{ position: 'absolute', top: '220px', left: '80px', width: '850px', display: 'flex', flexDirection: 'column', gap: '25px', zIndex: 10 }}>
          <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '0.15em', color: themeColors.accent, textTransform: 'uppercase', display: 'inline-block', border: `2px solid ${themeColors.accent}`, padding: '6px 14px', borderRadius: '6px', width: 'fit-content', marginBottom: '10px', boxShadow: `4px 4px 0px ${themeColors.accent}25` }}>
            {isFirstSlide ? 'The Brutal Truth' : (isLastSlide ? 'The Next Step' : 'The Fix')}
          </div>
          
          <div style={{ fontFamily: 'var(--font-teko), sans-serif', fontSize: isFirstSlide ? '160px' : '130px', lineHeight: 0.85, textTransform: 'uppercase', color: themeColors.border_color || '#111', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {isFirstSlide ? (
              <>
                <div style={{ backgroundColor: themeColors.accent, color: themeColors.accentText || '#fff', padding: '0 20px', marginBottom: '15px', display: 'inline-block', transform: 'skew(-5deg)' }}>
                  <span style={{ display: 'inline-block', transform: 'skew(5deg)' }}>{slide?.title.split(' ')[0]} {slide?.title.split(' ')[1]}</span>
                </div>
                <span>{slide?.title.split(' ').slice(2).join(' ')}</span>
              </>
            ) : isLastSlide ? (
              <>
                <div style={{ backgroundColor: themeColors.accent, color: themeColors.accentText || '#fff', padding: '0 20px', marginBottom: '15px', display: 'inline-block', transform: 'skew(-5deg)' }}>
                  <span style={{ display: 'inline-block', transform: 'skew(5deg)' }}>SAVE THIS</span>
                </div>
                <span>IF YOU FOUND IT</span>
                <div style={{ backgroundColor: themeColors.border_color || '#111', color: themeColors.bg, padding: '0 20px', marginBottom: '15px', display: 'inline-block', transform: 'skew(-5deg)' }}>
                  <span style={{ display: 'inline-block', transform: 'skew(5deg)' }}>HELPFUL</span>
                </div>
              </>
            ) : (
              <>
                <span>{slide?.title}</span>
              </>
            )}
          </div>
          
          <div style={{ fontSize: '40px', fontWeight: 500, lineHeight: 1.45, maxWidth: '900px', marginTop: '15px' }}>
            {renderFormattedText(textToRender, themeColors.bodyText)}
          </div>

          {isFirstSlide && (
            <div style={{ fontSize: '34px', fontWeight: 500, color: '#111', lineHeight: 1.5, backgroundColor: '#fef08a', padding: '30px 40px', borderLeft: '8px solid #ca8a04', marginTop: '20px', maxWidth: '820px', borderRadius: '0 12px 12px 0' }}>
              "The market doesn't reward hard work. It rewards absolute clarity and irresistible value."
            </div>
          )}
        </div>
        
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '90px', backgroundColor: themeColors.border_color || '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600, color: '#fff', letterSpacing: '0.1em' }}>
          @{handleText.toUpperCase()} <span style={{ color: themeColors.accent, margin: '0 15px' }}>•</span> {isLastSlide ? 'SHARE WITH A FRIEND' : 'SAVE THIS POST'}
        </div>
      </div>
    );
  }

  // --- V2 ELEGANT LAYOUT ---
  if (selectedTheme.startsWith('v2_')) {
    return (
      <div style={{ width: '1080px', height: '1080px', backgroundColor: themeColors.bg, position: 'relative', overflow: 'hidden', color: themeColors.text, fontFamily: 'var(--font-dm-sans), sans-serif', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', top: '90px', left: 0, right: 0, textAlign: 'center', fontWeight: 500, fontSize: '22px', letterSpacing: '0.25em', color: themeColors.text, textTransform: 'uppercase' }}>
          SOCIAL MEDIA 101
        </div>
        
        <div style={{ position: 'absolute', top: isFirstSlide ? '260px' : '220px', left: '120px', width: '840px', display: 'flex', flexDirection: 'column', gap: '40px', zIndex: 10, alignItems: isFirstSlide ? 'flex-start' : 'center', textAlign: isFirstSlide ? 'left' : 'center' }}>
          
          {!isFirstSlide && !isLastSlide && (
            <div style={{ fontWeight: 700, fontSize: '55px', color: themeColors.text, position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
              {String(slideIndex + 1).padStart(2, '0')}
              <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '180%', height: '160%', zIndex: 0, pointerEvents: 'none' }} viewBox="0 0 100 60" preserveAspectRatio="none">
                  <path d="M 50, 8 C 80, 8 92, 22 88, 38 C 85, 52 65, 55 50, 55 C 25, 55 10, 42 12, 28 C 15, 12 35, 10 50, 10" fill="none" stroke={themeColors.accent} strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          )}

          <div style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: isFirstSlide ? '135px' : '110px', lineHeight: 1.05, fontWeight: 400, color: themeColors.text, position: 'relative', zIndex: 10, marginBottom: isFirstSlide ? '0' : '10px' }}>
            {isFirstSlide ? (
              <>
                You Should <br/>
                <span style={{ position: 'relative', display: 'inline-block' }}>
                    Not
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', width: '140%', height: '140%', zIndex: -1 }} viewBox="0 0 100 60" preserveAspectRatio="none">
                        <path d="M 50, 5 C 75, 6 95, 20 92, 35 C 90, 50 65, 55 50, 55 C 30, 55 5, 45 8, 30 C 10, 15 35, 8 50, 8" fill="none" stroke={themeColors.accent} strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </span><br/>
                {slide?.title}
              </>
            ) : isLastSlide ? 'Save This For Later' : slide?.title}
          </div>
          
          {isFirstSlide && (
            <div style={{ fontWeight: 500, fontSize: '32px', letterSpacing: '0.05em', color: themeColors.bodyText, textTransform: 'uppercase', marginTop: '20px' }}>
              WHAT YOU SHOULD DO INSTEAD
            </div>
          )}
          
          {(!isFirstSlide) && (
            <div style={{ fontSize: '42px', fontWeight: 400, lineHeight: 1.5, textAlign: isLastSlide ? 'center' : 'left', display: 'inline-block', width: '100%' }}>
              {renderFormattedText(textToRender, themeColors.bodyText)}
            </div>
          )}
        </div>
        
        <div style={{ position: 'absolute', bottom: '80px', right: '80px', backgroundColor: themeColors.accent, border: `4px solid ${themeColors.border_color || '#111'}`, borderRadius: '60px', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{width: 24, height: 24, fill: 'none', stroke: themeColors.border_color || '#111', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round'}}>
                {isLastSlide ? <path d="M5 12h14M12 5l7 7-7 7" /> : <path d="M9 5l7 7-7 7" />}
            </svg>
        </div>
      </div>
    );
  }

  // --- V3 BOLD BOX LAYOUT ---
  if (selectedTheme.startsWith('v3_')) {
    const isAltSlide = slideIndex % 2 !== 0 && !isLastSlide && !isFirstSlide;
    const v3Bg = isAltSlide ? (themeColors.altBg || '#FFFFFF') : themeColors.bg;
    const v3Text = isAltSlide ? (themeColors.altText || '#000000') : themeColors.text;
    const v3BodyText = isAltSlide ? (themeColors.altText || '#333333') : themeColors.bodyText;

    return (
      <div style={{ width: '1080px', height: '1080px', backgroundColor: v3Bg, position: 'relative', overflow: 'hidden', color: v3Text, boxSizing: 'border-box' }}>
      
      <div style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none', opacity: 0.08, top: '200px', left: 0, width: '1080px', height: '1080px' }}>
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
      </div>
      
      <div style={{ position: 'absolute', top: '70px', left: '80px', right: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-dm-sans), sans-serif', fontWeight: 600, fontSize: '28px', letterSpacing: '0.02em', zIndex: 20, color: v3Text }}>
          <span>{brandLogoUrl ? <img src={brandLogoUrl} crossOrigin="anonymous" style={{height:'40px', objectFit:'contain'}} alt="logo" /> : `@${handleText}`}</span>
          <span>Content Creator</span>
      </div>
      
      <div style={{ position: 'absolute', top: isFirstSlide ? '240px' : '180px', left: 0, width: '1080px', padding: isFirstSlide ? '0 80px' : '0 100px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10, alignItems: isFirstSlide ? 'flex-start' : 'center', textAlign: isFirstSlide ? 'left' : 'center' }}>
          
          {(!isFirstSlide && !isLastSlide) && (
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '320px', height: '320px', marginBottom: '10px' }} viewBox="0 0 100 100" fill="none" stroke={themeColors.border_color || '#000'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="50" cy="50" r="40" fill={v3Bg} />
                <path d="M30 50 Q 50 20 70 50 Q 50 80 30 50" fill={themeColors.accent} />
                <circle cx="50" cy="50" r="10" fill={themeColors.border_color || '#000'} />
              </svg>
          )}

          {isLastSlide && (
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '320px', height: '320px', marginBottom: '10px' }} viewBox="0 0 100 100" fill="none" stroke={themeColors.border_color || '#000'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="20" y="20" width="60" height="60" rx="10" fill={v3Bg} />
                <path d="M40 50 L 45 60 L 65 35" stroke={themeColors.accent} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
          )}

          <div style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontSize: isFirstSlide ? '135px' : '110px', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', color: v3Text, display: 'flex', flexDirection: 'column', alignItems: isFirstSlide ? 'flex-start' : 'center' }}>
            {isFirstSlide ? (
              <>
                <span>Things to</span>
                <span style={{ backgroundColor: themeColors.accent, color: themeColors.accentText || '#fff', border: `5px solid ${themeColors.border_color || '#000'}`, padding: '0 25px', margin: '15px 0', display: 'inline-block', lineHeight: 1.1, boxShadow: '6px 6px 0px rgba(0,0,0,0.1)' }}>
                  {slide?.title.split(' ')[0]}
                </span>
                <span>{slide?.title.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              isLastSlide ? 'Save This For Later' : slide?.title
            )}
          </div>
          
          {(!isFirstSlide) && (
            <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '42px', fontWeight: 500, lineHeight: 1.45, width: '100%', textAlign: isLastSlide ? 'center' : 'left' }}>
              {renderFormattedText(textToRender, themeColors.bodyText)}
            </div>
          )}
      </div>
      
      <div style={{ position: 'absolute', bottom: '70px', left: '80px', right: '80px', display: 'flex', justifyContent: isLastSlide ? 'center' : 'space-between', alignItems: 'center', zIndex: 20, color: v3Text }}>
          {!isLastSlide && <div style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontSize: '38px', fontWeight: 700 }}>Swipe for more</div>}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: isLastSlide ? '100%' : 'auto', justifyContent: isLastSlide ? 'center' : 'flex-end' }}>
              
              {!isLastSlide && (
                <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '-85px', top: '25px', width: '110px', height: '110px', zIndex: 2 }} viewBox="0 0 256 256" fill="none">
                    <g stroke={themeColors.border_color || '#000'} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill={v3Bg}>
                        <path d="M104,136 V56 a20,20 0 0 1 40,0 v48 M144,96 v-12 a20,20 0 0 1 40,0 v32 M184,104 v-8 a20,20 0 0 1 40,0 v48 c0,32 -20,64 -48,64 H128 C88,208 64,176 64,144 L44,112 a20,20 0 0 1 32,-20 L104,136" />
                    </g>
                    <path d="M124,16 V32 M80,36 L92,48 M168,36 L156,48" stroke={themeColors.border_color || '#000'} strokeWidth="12" strokeLinecap="round"/>
                </svg>
              )}

              <div style={{ backgroundColor: themeColors.border_color || '#000', borderRadius: isLastSlide ? '45px' : '50%', width: isLastSlide ? '180px' : '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: v3Bg, zIndex: 1 }}>
                  {isLastSlide && <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '28px', marginRight: '10px', color: v3Bg }}>SAVE</span>}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: isLastSlide ? 34 : 45, height: isLastSlide ? 34 : 45, fill: 'none', stroke: v3Bg, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
              </div>
          </div>
      </div>
    </div>
    );
  }

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

        <div style={{ position: 'absolute', top: '150px', bottom: '120px', left: 0, right: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '50px', zIndex: 10 }}>
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
