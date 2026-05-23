import re

filepath = 'E:/CloudClick/apps/web/src/components/ui/SlideRenderer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# First, fix the V3 layout start so it's wrapped in an if block
v3_start_old = """  // --- V3 BOLD BOX LAYOUT ---
  const isAltSlide = slideIndex % 2 !== 0 && !isLastSlide && !isFirstSlide;
  const v3Bg = isAltSlide ? (themeColors.altBg || '#FFFFFF') : themeColors.bg;
  const v3Text = isAltSlide ? (themeColors.altText || '#000000') : themeColors.text;
  const v3BodyText = isAltSlide ? (themeColors.altText || '#333333') : themeColors.bodyText;

  return (
    <div style={{ width: '1080px', height: '1080px', backgroundColor: v3Bg, position: 'relative', overflow: 'hidden', color: v3Text, boxSizing: 'border-box' }}>"""

v3_start_new = """  // --- V3 BOLD BOX LAYOUT ---
  if (selectedTheme.startsWith('v3_')) {
    const isAltSlide = slideIndex % 2 !== 0 && !isLastSlide && !isFirstSlide;
    const v3Bg = isAltSlide ? (themeColors.altBg || '#FFFFFF') : themeColors.bg;
    const v3Text = isAltSlide ? (themeColors.altText || '#000000') : themeColors.text;
    const v3BodyText = isAltSlide ? (themeColors.altText || '#333333') : themeColors.bodyText;

    return (
      <div style={{ width: '1080px', height: '1080px', backgroundColor: v3Bg, position: 'relative', overflow: 'hidden', color: v3Text, boxSizing: 'border-box' }}>"""

content = content.replace(v3_start_old, v3_start_new)

# Next, find the end of V3 which currently looks like:
#               </div>
#           </div>
#       </div>
#     </div>
# 
#   // --- V4 WIREFRAME / BLUEPRINT LAYOUT ---
v3_end_old = """                  </svg>
              </div>
          </div>
      </div>
    </div>

  // --- V4 WIREFRAME"""

v3_end_new = """                  </svg>
              </div>
          </div>
      </div>
    </div>
    );
  }

  // --- V4 WIREFRAME"""

content = content.replace(v3_end_old, v3_end_new)

# Make sure the file ends with a proper fallback return
if "Unknown Template" not in content:
    content += "\n  return <div style={{width: 1080, height: 1080, background: '#f00'}}>Unknown Template</div>;\n};\n"

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax error in SlideRenderer.tsx")