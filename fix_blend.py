import re

filepath = 'E:/CloudClick/reference_designs/@preview_template_7_split.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

css_old = """        .content-area {
            position: absolute; top: 150px; bottom: 120px; left: 0; right: 0;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            gap: 60px; z-index: 10;
        }

        /* The massive text overlapping the boundary */
        .headline-container {
            width: 1080px;
            text-align: center; pointer-events: none; z-index: 10;
            mix-blend-mode: difference;
            display: flex; flex-direction: column; align-items: center;
        }

        .headline {
            font-family: 'Anton', sans-serif;
            font-size: 180px; /* Scaled down to prevent overlap */
            line-height: 0.9; text-transform: uppercase;
            color: #d2fa5c; /* Mix-blend will turn this black on the right half! */
        }

        .body-text-container {
            width: 1080px;
            display: flex; justify-content: center; z-index: 10;
        }

        .body-text {
            font-size: 40px; font-weight: 500; line-height: 1.4;
            max-width: 800px; text-align: center;
            background: #fff; color: #000; padding: 30px 40px;
            border-radius: 12px;
        }"""

css_new = """        .content-area {
            position: absolute; top: 150px; bottom: 120px; left: 0; right: 0;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            gap: 60px; 
            /* Remove z-index so it doesn't create a strong isolation stacking context */
        }

        /* The massive text overlapping the boundary */
        .headline-container {
            width: 1080px;
            text-align: center; pointer-events: none;
            mix-blend-mode: difference;
            display: flex; flex-direction: column; align-items: center;
            color: #d2fa5c; /* Mix-blend applies to the color */
        }

        .headline {
            font-family: 'Anton', sans-serif;
            font-size: 180px; 
            line-height: 0.9; text-transform: uppercase;
        }

        .body-text-container {
            width: 1080px;
            display: flex; justify-content: center;
            /* Bring z-index back here if needed, but not on parent */
        }

        .body-text {
            font-size: 40px; font-weight: 500; line-height: 1.4;
            max-width: 800px; text-align: center;
            background: #fff; color: #000; padding: 30px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }"""

content = content.replace(css_old, css_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed blend mode stacking context.")