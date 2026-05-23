import os

filepath = 'E:/CloudClick/apps/web/src/app/page.tsx'

with open(filepath, 'a', encoding='utf-8') as f:
    f.write("""\nexport default function LandingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-s">Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}\n""")

print("Appended Suspense wrapper to page.tsx")