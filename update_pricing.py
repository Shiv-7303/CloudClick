import os

# Update page.tsx
page_path = 'E:/CloudClick/apps/web/src/app/page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()

page_content = page_content.replace('price="₹0"', 'price="$0"')
page_content = page_content.replace('price="₹499/mo"', 'price="$11/mo"')
page_content = page_content.replace('price="₹999/mo"', 'price="$25/mo"')

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page_content)

# Update CarouselPreview.tsx
carousel_path = 'E:/CloudClick/apps/web/src/components/ui/CarouselPreview.tsx'
with open(carousel_path, 'r', encoding='utf-8') as f:
    carousel_content = f.read()

carousel_content = carousel_content.replace('Upgrade to Creator — ₹499/mo', 'Upgrade to Creator — $11/mo')

with open(carousel_path, 'w', encoding='utf-8') as f:
    f.write(carousel_content)

# Update pricing/page.tsx
pricing_path = 'E:/CloudClick/apps/web/src/app/pricing/page.tsx'
with open(pricing_path, 'r', encoding='utf-8') as f:
    pricing_content = f.read()

pricing_content = pricing_content.replace(
    'const [loading, setLoading] = useState(false);',
    'const [loading, setLoading] = useState(false);\n  const [isAnnual, setIsAnnual] = useState(true);'
)

toggle_ui = """      <h1 className="text-5xl font-display text-center mb-8">Simple, transparent pricing</h1>
      
      <div className="flex justify-center items-center gap-4 mb-16">
        <span className={`text-sm font-medium ${!isAnnual ? 'text-text-p' : 'text-text-s'}`}>Monthly</span>
        <button 
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative inline-flex h-7 w-14 items-center rounded-full bg-accent transition-colors focus:outline-none"
        >
          <span 
            className={`inline-block h-5 w-5 transform rounded-full bg-bg-base transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`}
          />
        </button>
        <span className={`text-sm font-medium ${isAnnual ? 'text-text-p' : 'text-text-s'}`}>
          Yearly <span className="text-positive ml-1 text-xs px-2 py-0.5 bg-positive/10 rounded-full">Save up to 25%</span>
        </span>
      </div>"""

pricing_content = pricing_content.replace(
    '<h1 className="text-5xl font-display text-center mb-16">Simple, transparent pricing</h1>',
    toggle_ui
)

pricing_content = pricing_content.replace('<div className="text-3xl font-bold text-text-p mb-1">₹0</div>', '<div className="text-3xl font-bold text-text-p mb-1">$0</div>')

creator_price_old = '<div className="text-3xl font-bold text-text-p mb-1">₹499<span className="text-base text-text-s font-normal">/mo</span></div>'
creator_price_new = """<div className="text-3xl font-bold text-text-p mb-1">
            {isAnnual ? '$99' : '$11'}
            <span className="text-base text-text-s font-normal">{isAnnual ? '/yr' : '/mo'}</span>
          </div>"""
pricing_content = pricing_content.replace(creator_price_old, creator_price_new)

pro_price_old = '<div className="text-3xl font-bold text-text-p mb-1">₹999<span className="text-base text-text-s font-normal">/mo</span></div>'
pro_price_new = """<div className="text-3xl font-bold text-text-p mb-1">
            {isAnnual ? '$249' : '$25'}
            <span className="text-base text-text-s font-normal">{isAnnual ? '/yr' : '/mo'}</span>
          </div>"""
pricing_content = pricing_content.replace(pro_price_old, pro_price_new)

with open(pricing_path, 'w', encoding='utf-8') as f:
    f.write(pricing_content)

print("Updated all pricing references")