import os
import json
from dotenv import load_dotenv
load_dotenv()
from services.ai import analyze_video

# Use a short test transcript
test_transcript = {
    'full_text': 'In this video I talk about why most founders fail not because of product but because of distribution. The biggest mistake is building in stealth for 2 years. You need to ship in public. My startup spent 18 months building and we had zero users. Then we switched to weekly public updates and got our first 100 customers in 60 days.',
    'source': 'youtube',
    'entries': []
}
test_meta = {
    'title': 'Why 90% of Startups Fail (Its Not What You Think)',
    'channel': 'Startup Founder Stories',
    'duration_seconds': 600
}

print("Running Free Tier Test...")
result = analyze_video(test_transcript, test_meta, 'free')
playbook = result.get('instagram_playbook', [])
print(f'Days generated: {len(playbook)}')
for day in playbook:
    print(f'\n--- Day {day["day"]} ({day["content_type"]}) ---')
    print(f'Hook: {day["hook"]}')
    print(f'Format: {day["format"]}')

print("\n--------------------------\n")
print("Running Paid Tier Test...")
result_paid = analyze_video(test_transcript, test_meta, 'pro')
playbook_paid = result_paid.get('instagram_playbook', [])
print(f'Days generated: {len(playbook_paid)}')
for day in playbook_paid:
    print(f'\n--- Day {day["day"]} ({day["content_type"]}) ---')
    print(f'Hook: {day["hook"]}')
    print(f'Format: {day["format"]}')
