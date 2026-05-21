import anthropic, os, json, re, time
from google import genai
from google.genai import types
from .prompts import (
    EXTRACTION_SYSTEM, EXTRACTION_USER_TEMPLATE,
    FREE_SYSTEM, FREE_USER_TEMPLATE, 
    PAID_SYSTEM, PAID_USER_TEMPLATE
)

def get_client():
    key = os.environ.get('ANTHROPIC_API_KEY', '').strip()
    if not key:
        return None
    return anthropic.Anthropic(api_key=key)

def select_model(tier: str) -> tuple[str, int]:
    FREE_MODEL  = os.environ.get('CLAUDE_FREE_MODEL', 'claude-3-haiku-20240307')
    PAID_MODEL  = os.environ.get('CLAUDE_PAID_MODEL', 'claude-3-5-sonnet-20241022')

    TIER_LIMITS = {
        'free':    {'model': FREE_MODEL,  'max_chars': 7000}, # Limit only applies if extraction fails
        'creator': {'model': PAID_MODEL,  'max_chars': 14000},
        'pro':     {'model': PAID_MODEL,  'max_chars': 14000},
    }
    config = TIER_LIMITS.get(tier, TIER_LIMITS['free'])
    return config['model'], config['max_chars']

def extract_insights_with_gemini(transcript_text: str) -> str:
    """Uses Gemini 2.5 Flash to compress raw transcripts into dense insights."""
    gemini_key = os.environ.get('GEMINI_API_KEY', '').strip()
    if not gemini_key:
        return transcript_text # Fallback to raw text if no key
        
    client = genai.Client(api_key=gemini_key)
    model_name = 'gemini-2.5-flash'
    
    prompt = EXTRACTION_USER_TEMPLATE.format(transcript=transcript_text)
    
    config = types.GenerateContentConfig(
        system_instruction=EXTRACTION_SYSTEM
    )
    
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config
            )
            return response.text.strip()
        except Exception as e:
            if '429' in str(e) or '503' in str(e):
                time.sleep((attempt + 1) * 2)
            else:
                print(f"Extraction failed: {str(e)}")
                break
                
    return transcript_text # Fallback if extraction fails completely

def analyze_video_with_gemini(system_text: str, user_text: str, max_chars: int) -> dict:
    """Fallback implementation using Gemini 2.5 Flash for the final generation."""
    gemini_key = os.environ.get('GEMINI_API_KEY', '').strip()
    if not gemini_key:
        raise Exception("Neither ANTHROPIC_API_KEY nor GEMINI_API_KEY is configured.")
        
    client = genai.Client(api_key=gemini_key)
    model_name = 'gemini-2.5-flash'
    
    config = types.GenerateContentConfig(
        system_instruction=system_text,
        response_mime_type="application/json"
    )
    
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=user_text,
                config=config
            )
            raw = response.text.strip()
            
            raw = re.sub(r'^```(?:json)?\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            
            result = json.loads(raw)

            # ── NEW: Validate playbook structure ─────────────────────
            if 'instagram_playbook' in result:
                from services.content_processor import validate_playbook
                result['instagram_playbook'] = validate_playbook(result['instagram_playbook'])
            # ── END NEW ──────────────────────────────────────────────

            result['_model_used'] = f"fallback:{model_name}"
            
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                result['_tokens_input'] = getattr(response.usage_metadata, 'prompt_token_count', 0)
                result['_tokens_output'] = getattr(response.usage_metadata, 'candidates_token_count', 0)
            else:
                result['_tokens_input'] = 0
                result['_tokens_output'] = 0
                
            return result
            
        except json.JSONDecodeError as e:
            if attempt == 2:
                raise Exception(f"Gemini returned invalid JSON after 3 attempts: {str(e)}")
            time.sleep(1)
        except Exception as e:
            if '429' in str(e) or '503' in str(e):
                time.sleep((attempt + 1) * 2)
            else:
                raise
    raise Exception("Gemini Analysis failed after 3 attempts")

def analyze_video(transcript_data: dict, video_metadata: dict, user_tier: str) -> dict:
    client = get_client()
    model, fallback_max_chars = select_model(user_tier)
    
    # 1. Extraction Phase (Gemini Flash)
    # Since extraction is cheap, we can process much more of the video.
    extract_limit = 50000 if user_tier == 'free' else 150000
    raw_transcript = transcript_data.get('full_text', '')[:extract_limit]
    
    print("Extracting insights via Gemini Flash...")
    insights = extract_insights_with_gemini(raw_transcript)
    
    # If extraction failed and returned the huge raw transcript, trim it for the writing model
    if len(insights) > fallback_max_chars and not insights.startswith("1. "): 
        insights = insights[:fallback_max_chars]

    # 2. Writing Phase (Claude Sonnet/Haiku or Gemini Fallback)
    is_paid = user_tier in ('creator', 'pro')
    system_text = PAID_SYSTEM if is_paid else FREE_SYSTEM
    user_text = (PAID_USER_TEMPLATE if is_paid else FREE_USER_TEMPLATE).format(
        insights=insights
    )

    if not client:
        print("ANTHROPIC_API_KEY missing. Falling back to Gemini for generation...")
        return analyze_video_with_gemini(system_text, user_text, fallback_max_chars)

    for attempt in range(3):
        try:
            if is_paid:
                response = client.messages.create(
                    model=model,
                    max_tokens=2000,
                    system=[{
                        "type": "text",
                        "text": system_text,
                        "cache_control": {"type": "ephemeral"}
                    }],
                    messages=[{"role": "user", "content": user_text}]
                )
            else:
                response = client.messages.create(
                    model=model,
                    max_tokens=1200,
                    system=system_text,
                    messages=[{"role": "user", "content": user_text}]
                )

            raw = response.content[0].text.strip()
            raw = re.sub(r'^```(?:json)?\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            
            result = json.loads(raw)

            # ── NEW: Validate playbook structure ─────────────────────
            if 'instagram_playbook' in result:
                from services.content_processor import validate_playbook
                result['instagram_playbook'] = validate_playbook(result['instagram_playbook'])
            # ── END NEW ──────────────────────────────────────────────

            result['_model_used'] = model
            result['_tokens_input'] = response.usage.input_tokens
            result['_tokens_output'] = response.usage.output_tokens
            return result

        except json.JSONDecodeError as e:
            if attempt == 2:
                raise Exception(f"AI returned invalid JSON after 3 attempts: {str(e)}")
            time.sleep(1)
        except Exception as e:
            if '529' in str(e) or '429' in str(e):
                time.sleep((attempt + 1) * 2)
            else:
                raise
    raise Exception("Analysis failed after 3 attempts")
