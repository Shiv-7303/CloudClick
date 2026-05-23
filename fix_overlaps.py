import re

# Fix Template 8 - Manifesto
filepath_8 = 'E:/CloudClick/reference_designs/@preview_template_8_manifesto.html'
with open(filepath_8, 'r', encoding='utf-8') as f:
    content_8 = f.read()

css_old_8 = """        .headline-wrapper {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 1200px; /* Intentionally wider than slide to bleed off edges */
            text-align: center;
        }

        .headline {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 280px; line-height: 0.8; text-transform: uppercase;
            color: #fff;
            display: flex; flex-direction: column;
        }

        /* Accent word highlight */
        .headline .accent {
            color: #ff3b30; /* Urgent Red */
        }

        .body-text-wrapper {
            position: absolute; bottom: 120px; left: 0; width: 1080px;
            display: flex; justify-content: center; z-index: 20;
        }"""

css_new_8 = """        .content-area {
            position: absolute;
            top: 150px; bottom: 120px; left: 0; right: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 60px;
            z-index: 10;
        }

        .headline-wrapper {
            width: 1200px; /* Intentionally wider than slide to bleed off edges */
            text-align: center;
            display: flex;
            justify-content: center;
        }

        .headline {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 210px; /* Scaled down slightly to prevent overlap */
            line-height: 0.85; text-transform: uppercase;
            color: #fff;
            display: flex; flex-direction: column;
        }

        /* Accent word highlight */
        .headline .accent {
            color: #ff3b30; /* Urgent Red */
        }

        .body-text-wrapper {
            width: 1080px;
            display: flex; justify-content: center; z-index: 20;
        }"""

html_old_8 = """        <div class="headline-wrapper">
            <div class="headline">
                <span>PEOPLE</span>
                <span class="accent">DON'T CARE</span>
                <span>ABOUT YOU</span>
            </div>
        </div>

        <div class="body-text-wrapper">
            <div class="body-text">
                They care about what you can do for them. Stop talking about yourself and start solving their problems.
            </div>
        </div>"""

html_new_8 = """        <div class="content-area">
            <div class="headline-wrapper">
                <div class="headline">
                    <span>PEOPLE</span>
                    <span class="accent">DON'T CARE</span>
                    <span>ABOUT YOU</span>
                </div>
            </div>

            <div class="body-text-wrapper">
                <div class="body-text">
                    They care about what you can do for them. Stop talking about yourself and start solving their problems.
                </div>
            </div>
        </div>"""

content_8 = content_8.replace(css_old_8, css_new_8)
content_8 = content_8.replace(html_old_8, html_new_8)

with open(filepath_8, 'w', encoding='utf-8') as f:
    f.write(content_8)

# Fix Template 7 - Split
filepath_7 = 'E:/CloudClick/reference_designs/@preview_template_7_split.html'
with open(filepath_7, 'r', encoding='utf-8') as f:
    content_7 = f.read()

css_old_7 = """        /* The massive text overlapping the boundary */
        .headline-container {
            position: absolute; top: 250px; left: 0; width: 1080px;
            text-align: center; pointer-events: none; z-index: 10;
            mix-blend-mode: difference;
        }

        .headline {
            font-family: 'Anton', sans-serif;
            font-size: 220px; line-height: 0.9; text-transform: uppercase;
            color: #d2fa5c; /* Mix-blend will turn this black on the right half! */
        }

        .body-text-container {
            position: absolute; bottom: 200px; left: 0; width: 1080px;
            display: flex; justify-content: center; z-index: 10;
        }"""

css_new_7 = """        .content-area {
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
        }"""

html_old_7 = """        <div class="headline-container">
            <div class="headline">DIVIDE</div>
            <div class="headline">AND</div>
            <div class="headline">CONQUER</div>
        </div>

        <div class="body-text-container">
            <div class="body-text">
                Your audience has a 2-second attention span. Force them to stop scrolling with impossible contrast.
            </div>
        </div>"""

html_new_7 = """        <div class="content-area">
            <div class="headline-container">
                <div class="headline">DIVIDE</div>
                <div class="headline">AND</div>
                <div class="headline">CONQUER</div>
            </div>

            <div class="body-text-container">
                <div class="body-text">
                    Your audience has a 2-second attention span. Force them to stop scrolling with impossible contrast.
                </div>
            </div>
        </div>"""

content_7 = content_7.replace(css_old_7, css_new_7)
content_7 = content_7.replace(html_old_7, html_new_7)

with open(filepath_7, 'w', encoding='utf-8') as f:
    f.write(content_7)

print("Fixed overlaps in templates 7 and 8.")