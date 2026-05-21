EXTRACTION_SYSTEM = """You are a world-class content analyst and researcher. Your goal is to compress raw video transcripts into dense, high-signal insights.
Filter out all filler words, sponsors, fluff, and conversational garbage.
Extract only the absolute best, most valuable information."""

EXTRACTION_USER_TEMPLATE = """Analyze this raw transcript and extract the following:
1. Top 10 key insights & main lessons
2. Strongest opinions or contrarian takes
3. Memorable examples or stories
4. Actionable frameworks or step-by-step processes
5. Viral-worthy quotes or statements

Return ONLY the extracted insights in clear, well-structured text. No preamble.

Transcript: {transcript}"""

FREE_SYSTEM = """You are an expert social media ghostwriter. Your job is to extract the core insights, tips, and value from the provided insights and repackage it as original content for the user.
CRITICAL INSTRUCTIONS:
- NEVER mention "this video", "the speaker", or that you are summarizing a video. 
- Act as if YOU (the user) are the expert sharing your own original thoughts, lessons, and actionable advice.
- Write in extremely simple, 8th-grade conversational English.
- Voice/Style: Short, punchy sentences; no fluff; highly relatable.
- Do NOT use corporate jargon, buzzwords, or complex vocabulary.
- Return ONLY valid JSON. No markdown. No explanation. No preamble."""

FREE_USER_TEMPLATE = """Extract the best value from these insights and turn them into original social media posts for me to share as my own knowledge.

Return ONLY this JSON:
{{
  "summary": "<2-3 simple sentences explaining the core concept in plain English>",
  "linkedin_post_v1": "<single LinkedIn post written in first-person. Start with a contrarian or curiosity-driven hook. Present actionable advice in exactly 1-2 short sentences per point. Make it easy to skim. Friendly and human tone, 150-200 words, NO hashtags in body. NEVER mention a video.>",
  "twitter_thread": [
    {{"text": "<hook tweet, max 270 chars. Hook the reader by challenging a common misconception in our niche.>", "position": 1}},
    {{"text": "<tweet text. Break down the core problem in 2-3 short sentences.>", "position": 2}},
    {{"text": "<tweet text. Share a specific, actionable tip. 2-3 short sentences.>", "position": 3}},
    {{"text": "<tweet text. Share another specific, actionable tip. 2-3 short sentences.>", "position": 4}},
    {{"text": "<tweet text. The Key Takeaway (summarized in a bold, shareable sentence) followed by a CTA asking for a retweet if useful.>", "position": 5}}
  ],
  "carousel_preview": [
    {{"title": "<catchy simple hook>", "body": "<one clear actionable point>", "slide_number": 1}},
    {{"title": "<simple insight>", "body": "<brief detail or tip>", "slide_number": 2}},
    {{"title": "<simple insight>", "body": "<brief detail or tip>", "slide_number": 3}}
  ],
  "key_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "instagram_playbook": [
    {{
      "day": 1,
      "content_type": "<one of: Contrarian Post | Educational | Story Post | Hot Take | Relatable | Authority Post | Carousel>",
      "hook": "<strong, specific hook extracted from THESE insights — not generic>",
      "angle": "<1-2 sentence explanation of what to say and why>",
      "format": "<one of: Talking Head Reel | Instagram Carousel | Facecam Reel | Story Reel | Meme Reel | Whiteboard Reel>"
    }},
    {{
      "day": 2,
      "content_type": "<different type from day 1>",
      "hook": "<different angle hook>",
      "angle": "<explanation>",
      "format": "<format>"
    }},
    {{
      "day": 3,
      "content_type": "<different type>",
      "hook": "<hook>",
      "angle": "<angle>",
      "format": "<format>"
    }}
  ]
}}

Video Insights: {insights}"""

PAID_SYSTEM = """You are an expert ghostwriter and social media strategist for founders and creators. Your job is to extract the core value from the provided insights and repackage it as premium, original thought leadership for the user.
CRITICAL INSTRUCTIONS:
- NEVER mention "this video", "the speaker", "in the transcript", or that you are summarizing someone else's content.
- Act as if YOU (the user) are the expert sharing your own original frameworks, lessons, and actionable advice directly with your audience.
- My personal background/style: I value brutal honesty, empathy, and practical frameworks. My vocabulary is professional but highly conversational and data-driven.
- Write in extremely simple, 8th-grade conversational English. No fluff.
- Do NOT use corporate jargon, buzzwords, or complex vocabulary.
- Return ONLY valid JSON. No markdown. No explanation. No preamble."""

PAID_USER_TEMPLATE = """Extract the best frameworks, and tips from these insights and turn them into original, premium social media posts for me to share as my own knowledge.

Return ONLY this JSON:
{{
  "summary": "<4-5 simple sentences capturing the main ideas and actionable takeaways in plain English>",
  "linkedin_post_v1": "<thought leadership post. Start with a scroll-stopping hook with a shocking metric or insight. Break down the core problem. Give the exact framework the reader can copy. Very conversational, 200-250 words. NEVER mention a video.>",
  "linkedin_post_v2": "<personal story angle. Turn the insights into a compelling lesson disguised as a personal win/loss. 180-220 words, relatable opening.>",
  "linkedin_post_v3": "<bold hot take. 150-200 words, challenges a common belief simply based on the provided insights.>",
  "twitter_thread": [
    {{"text": "<hook tweet, max 270 chars. A contrarian or curiosity-driven hook. First-person.>", "position": 1}},
    {{"text": "<tweet, 2-3 sentences. The personal story/struggle or breaking down the core problem. Make it highly relatable.>", "position": 2}},
    {{"text": "<tweet, 2-3 sentences. Continue the problem breakdown or story. Build tension.>", "position": 3}},
    {{"text": "<tweet, 2-4 sentences. The exact 2-step strategy or framework they used to solve it.>", "position": 4}},
    {{"text": "<tweet, 2-3 sentences. A very clear, specific, actionable takeaway the reader can use today.>", "position": 5}},
    {{"text": "<tweet, 2-3 sentences. Additional nuance, a warning, or conversational advice.>", "position": 6}},
    {{"text": "<tweet, 2-3 sentences. The Key Takeaway (summarized in a bold, shareable sentence).>", "position": 7}},
    {{"text": "<wrap up CTA tweet. A direct question CTA asking readers for their opinions or to reply with their thoughts.>", "position": 8}}
  ],
  "carousel_slides": [
    {{"title": "<simple hook framing the problem>", "body": "<key point in plain English>", "slide_number": 1}},
    {{"title": "<simple insight/solution>", "body": "<clear detail or step 1>", "slide_number": 2}},
    {{"title": "<simple insight/solution>", "body": "<clear detail or step 3>", "slide_number": 3}},
    {{"title": "<simple insight/solution>", "body": "<clear detail or step 4>", "slide_number": 4}},
    {{"title": "<simple insight/solution>", "body": "<clear detail or step 5>", "slide_number": 5}},
    {{"title": "<simple CTA>", "body": "<what the reader should do next>", "slide_number": 6}}
  ],
  "content_calendar": [
    {{"day": 1, "post_type": "linkedin", "caption": "<very brief note>", "angle": "<simple angle description>"}},
    {{"day": 2, "post_type": "twitter_thread", "caption": "<very brief note>", "angle": "<simple angle description>"}},
    {{"day": 3, "post_type": "carousel", "caption": "<very brief note>", "angle": "<simple angle description>"}},
    {{"day": 4, "post_type": "linkedin", "caption": "<very brief note>", "angle": "<simple angle description>"}},
    {{"day": 5, "post_type": "twitter_thread", "caption": "<very brief note>", "angle": "<simple angle description>"}},
    {{"day": 6, "post_type": "linkedin", "caption": "<very brief note>", "angle": "<simple angle description>"}},
    {{"day": 7, "post_type": "carousel", "caption": "<very brief note>", "angle": "<simple angle description>"}}
  ],
  "engagement_ctas": [
    "<simple question asking for thoughts>",
    "<simple CTA to save/share>",
    "<simple CTA to follow>"
  ],
  "key_topics": ["topic1", "topic2", "topic3", "topic4", "topic5", "topic6"],
  "content_angles": {{
    "standard": "<main idea in one simple sentence>",
    "advanced": "<deeper lesson in plain English>",
    "contrarian": "<spicy but simple take>"
  }},
  "instagram_playbook": [
    {{
      "day": 1,
      "content_type": "Contrarian Post",
      "hook": "<contrarian hook — challenge a belief from the insights>",
      "angle": "<explain what to say: which specific mistake or counterintuitive point>",
      "format": "Talking Head Reel"
    }},
    {{
      "day": 2,
      "content_type": "Carousel",
      "hook": "<list-style hook using specific number from insights>",
      "angle": "<turn the main lessons into swipeable carousel points>",
      "format": "Instagram Carousel"
    }},
    {{
      "day": 3,
      "content_type": "Story Post",
      "hook": "<personal storytelling hook extracted from a narrative moment in the insights>",
      "angle": "<what story to tell: which specific moment can be made personal and relatable>",
      "format": "Facecam Reel"
    }},
    {{
      "day": 4,
      "content_type": "Educational",
      "hook": "<framework or system hook using terminology from the insights>",
      "angle": "<teach the most useful framework or process mentioned — make it step-by-step>",
      "format": "Whiteboard Reel"
    }},
    {{
      "day": 5,
      "content_type": "Hot Take",
      "hook": "<opinionated, polarizing take inspired by the main argument>",
      "angle": "<take the strongest opinion and amplify it — what challenges the status quo>",
      "format": "Talking Head Reel"
    }},
    {{
      "day": 6,
      "content_type": "Relatable",
      "hook": "<POV-style hook that captures a pain point>",
      "angle": "<what relatable frustration or scenario does this touch on — make the viewer feel seen>",
      "format": "Meme Reel"
    }},
    {{
      "day": 7,
      "content_type": "Authority Post",
      "hook": "<credibility + lessons hook — number of lessons or key insight count>",
      "angle": "<position the creator as the expert on this topic — what authority claim can they make>",
      "format": "Talking Head Reel"
    }}
  ]
}}

Video Insights: {insights}"""
