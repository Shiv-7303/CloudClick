import re

def wrap_with_suspense(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if "import { Suspense } from 'react';" not in content:
            content = "import { Suspense } from 'react';\n" + content

        # Replace return ( <div> ... ) with return ( <Suspense fallback={<div>Loading...</div>}> <div> ... </div> </Suspense> )
        # A simpler way is to find the main export default function and wrap its return.
        
        # We will just write a wrapper for AuthPage and Home
        if 'export default function AuthPage()' in content:
            content = content.replace('export default function AuthPage() {', 'function AuthContent() {')
            content += "\nexport default function AuthPage() {\n  return (\n    <Suspense fallback={<div className=\"p-8 text-center text-text-s\">Loading...</div>}>\n      <AuthContent />\n    </Suspense>\n  );\n}\n"
            
        elif 'export default function Home()' in content:
            content = content.replace('export default function Home() {', 'function HomeContent() {')
            content += "\nexport default function Home() {\n  return (\n    <Suspense fallback={<div className=\"p-8 text-center text-text-s\">Loading...</div>}>\n      <HomeContent />\n    </Suspense>\n  );\n}\n"
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed suspense in {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

wrap_with_suspense('E:/CloudClick/apps/web/src/app/auth/page.tsx')
wrap_with_suspense('E:/CloudClick/apps/web/src/app/page.tsx')
