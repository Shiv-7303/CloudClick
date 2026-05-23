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
  const lines = rawBody.split('\n').map((l: string) => l.trim()).filter(Boolean);
  const isBullets = lines.length >= 3 && lines.every((l: string) => l.length < 100);
  const bullets = isBullets ? lines : null;
  const bodyText = isBullets ? '' : rawBody;

  // Extract stat if body starts with a number/symbol
  let stat = null;
  let finalBody = bodyText;
  if (bodyText && (bodyText[0].match(/[0-9]/) || bodyText.startsWith('%') || bodyText.startsWith('$') || bodyText.startsWith('₹'))) {
    const parts = bodyText.split(' ');
    if (parts[0].length < 10) {
      stat = parts[0];
      finalBody = parts.slice(1).join(' ');
    }
  }

  // --- V1 BRUTAL LAYOUT (from @preview_template.html) ---
  if (!selectedTheme.startsWith('v2_') && !selectedTheme.startsWith('v3_')) {
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
                <div style={{ backgroundColor: themeColors.accent, color: '#fff', padding: '0 20px', marginBottom: '15px', display: 'inline-block', transform: 'skew(-5deg)' }}>
                  <span style={{ display: 'inline-block', transform: 'skew(5deg)' }}>{slide?.title.split(' ')[0]} {slide?.title.split(' ')[1]}</span>
                </div>
                <span>{slide?.title.split(' ').slice(2).join(' ')}</span>
              </>
            ) : isLastSlide ? (
              <>
                <div style={{ backgroundColor: themeColors.accent, color: '#fff', padding: '0 20px', marginBottom: '15px', display: 'inline-block', transform: 'skew(-5deg)' }}>
                  <span style={{ display: 'inline-block', transform: 'skew(5deg)' }}>SAVE THIS</span>
                </div>
                <span>IF YOU FOUND IT</span>
                <div style={{ backgroundColor: themeColors.border_color || '#111', color: '#fff', padding: '0 20px', marginBottom: '15px', display: 'inline-block', transform: 'skew(-5deg)' }}>
                  <span style={{ display: 'inline-block', transform: 'skew(5deg)' }}>HELPFUL</span>
                </div>
              </>
            ) : (
              <>
                <span>{slide?.title}</span>
              </>
            )}
          </div>
          
          <div style={{ fontSize: '40px', fontWeight: 500, color: '#333', lineHeight: 1.45, maxWidth: '900px', marginTop: '15px' }}>
            {finalBody}
            {bullets && (
              <ul style={{ marginLeft: '40px', marginTop: '15px' }}>
                {bullets.map((b: string, i: number) => <li key={i} style={{marginBottom: '15px'}}>{b}</li>)}
              </ul>
            )}
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
            <div style={{ fontSize: '42px', fontWeight: 400, color: themeColors.bodyText, lineHeight: 1.5, textAlign: isLastSlide ? 'center' : 'left', display: 'inline-block' }}>
              {finalBody}
              {bullets && (
                  <ul style={{ marginLeft: '40px', marginTop: '15px', textAlign: 'left' }}>
                    {bullets.map((b: string, i: number) => <li key={i} style={{marginBottom: '15px'}}>{b}</li>)}
                  </ul>
              )}
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
  return (
    <div style={{ width: '1080px', height: '1080px', backgroundColor: slideIndex % 2 !== 0 && !isLastSlide && !isFirstSlide ? (selectedTheme.includes('lime') ? '#F8F9F3' : '#FFFFFF') : themeColors.bg, position: 'relative', overflow: 'hidden', color: themeColors.text, boxSizing: 'border-box' }}>
      
      <div style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none', opacity: 0.08, top: '200px', left: 0, width: '1080px', height: '1080px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" style={{ width: '100%', height: '100%', stroke: themeColors.border_color || '#000', strokeWidth: 8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none', strokeDasharray: '20 20' }}>
              <path d="M 200,800 C 400,900 800,400 600,200 C 400,0 200,300 500,600 C 700,800 900,750 1080,800" />
              {isFirstSlide && (
                <>
                  <path d="M 300,300 L 310,320 L 330,325 L 310,330 L 300,350 L 290,330 L 270,325 L 290,320 Z" stroke="none" fill={themeColors.border_color || '#000'} opacity="0.3"/>
                  <path d="M 800,600 L 805,610 L 815,612 L 805,615 L 800,625 L 795,615 L 785,612 L 795,610 Z" stroke="none" fill={themeColors.border_color || '#000'} opacity="0.3"/>
                </>
              )}
          </svg>
      </div>
      
      <div style={{ position: 'absolute', top: '70px', left: '80px', right: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-dm-sans), sans-serif', fontWeight: 600, fontSize: '28px', letterSpacing: '0.02em', zIndex: 20, color: themeColors.text }}>
          <span>{brandLogoUrl ? <img src={brandLogoUrl} crossOrigin="anonymous" style={{height:'40px', objectFit:'contain'}} alt="logo" /> : `@${handleText}`}</span>
          <span>Content Creator</span>
      </div>
      
      <div style={{ position: 'absolute', top: isFirstSlide ? '240px' : '180px', left: 0, width: '1080px', padding: isFirstSlide ? '0 80px' : '0 100px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10, alignItems: isFirstSlide ? 'flex-start' : 'center', textAlign: isFirstSlide ? 'left' : 'center' }}>
          
          {(!isFirstSlide && !isLastSlide) && (
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '320px', height: '320px', marginBottom: '10px' }} viewBox="0 0 100 100" fill="none" stroke={themeColors.border_color || '#000'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="50" cy="50" r="40" fill={themeColors.bg} />
                <path d="M30 50 Q 50 20 70 50 Q 50 80 30 50" fill={themeColors.accent} />
                <circle cx="50" cy="50" r="10" fill={themeColors.border_color || '#000'} />
              </svg>
          )}

          {isLastSlide && (
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '320px', height: '320px', marginBottom: '10px' }} viewBox="0 0 100 100" fill="none" stroke={themeColors.border_color || '#000'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="20" y="20" width="60" height="60" rx="10" fill={themeColors.bg} />
                <path d="M40 50 L 45 60 L 65 35" stroke={themeColors.accent} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
          )}

          <div style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontSize: isFirstSlide ? '135px' : '110px', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', color: themeColors.text, display: 'flex', flexDirection: 'column', alignItems: isFirstSlide ? 'flex-start' : 'center' }}>
            {isFirstSlide ? (
              <>
                <span>Things to</span>
                <span style={{ backgroundColor: themeColors.accent, color: themeColors.text === '#111111' || themeColors.text === '#0A0A0A' || themeColors.text === '#000000' ? '#fff' : '#000', border: `5px solid ${themeColors.border_color || '#000'}`, padding: '0 25px', margin: '15px 0', display: 'inline-block', lineHeight: 1.1, boxShadow: '6px 6px 0px rgba(0,0,0,0.1)' }}>
                  {slide?.title.split(' ')[0]}
                </span>
                <span>{slide?.title.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              isLastSlide ? 'Save This For Later' : slide?.title
            )}
          </div>
          
          {(!isFirstSlide) && (
            <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '42px', fontWeight: 500, color: themeColors.bodyText, lineHeight: 1.45 }}>
              {finalBody}
              {bullets && (
                  <ul style={{ marginLeft: '40px', marginTop: '15px', textAlign: 'left', display: 'inline-block' }}>
                    {bullets.map((b: string, i: number) => <li key={i} style={{marginBottom: '15px'}}>{b}</li>)}
                  </ul>
              )}
            </div>
          )}
      </div>
      
      <div style={{ position: 'absolute', bottom: '70px', left: '80px', right: '80px', display: 'flex', justifyContent: isLastSlide ? 'center' : 'space-between', alignItems: 'center', zIndex: 20, color: themeColors.text }}>
          {!isLastSlide && <div style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontSize: '38px', fontWeight: 700 }}>Swipe for more</div>}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: isLastSlide ? '100%' : 'auto', justifyContent: isLastSlide ? 'center' : 'flex-end' }}>
              
              {!isLastSlide && (
                <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '-85px', top: '25px', width: '110px', height: '110px', zIndex: 2 }} viewBox="0 0 256 256" fill="none">
                    <g stroke={themeColors.border_color || '#000'} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill={themeColors.bg}>
                        <path d="M104,136 V56 a20,20 0 0 1 40,0 v48 M144,96 v-12 a20,20 0 0 1 40,0 v32 M184,104 v-8 a20,20 0 0 1 40,0 v48 c0,32 -20,64 -48,64 H128 C88,208 64,176 64,144 L44,112 a20,20 0 0 1 32,-20 L104,136" />
                    </g>
                    <path d="M124,16 V32 M80,36 L92,48 M168,36 L156,48" stroke={themeColors.border_color || '#000'} strokeWidth="12" strokeLinecap="round"/>
                </svg>
              )}

              <div style={{ backgroundColor: themeColors.border_color || '#000', borderRadius: isLastSlide ? '45px' : '50%', width: isLastSlide ? '180px' : '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeColors.bg, zIndex: 1 }}>
                  {isLastSlide && <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '28px', marginRight: '10px', color: themeColors.bg }}>SAVE</span>}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: isLastSlide ? 34 : 45, height: isLastSlide ? 34 : 45, fill: 'none', stroke: themeColors.bg, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
              </div>
          </div>
      </div>
    </div>
  );
};