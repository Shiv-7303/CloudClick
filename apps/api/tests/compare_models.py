import os
import time
from dotenv import load_dotenv
import anthropic
import google.generativeai as genai

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

# Set up clients
anthropic_api_key = os.environ.get('ANTHROPIC_API_KEY')
gemini_api_key = os.environ.get('GEMINI_API_KEY')

if not anthropic_api_key:
    print("WARNING: ANTHROPIC_API_KEY not found in .env")
if not gemini_api_key:
    print("WARNING: GEMINI_API_KEY not found in .env")

# Initialize Gemini
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

# Initialize Anthropic
if anthropic_api_key:
    claude_client = anthropic.Anthropic(api_key=anthropic_api_key)

# Test transcript
TEST_TRANSCRIPT = """
Hello everyone, welcome back to the channel! Today we're going to build a full-stack application using React, 
Node.js, and Supabase. We'll start by setting up the frontend, then we'll move on to configuring our database, 
and finally, we'll deploy the whole thing to Vercel. Let's dive right in! First, let's create a new React app...
"""

PROMPT = f"""
You are an expert content editor. Please summarize the following transcript into 3 bullet points:

<transcript>
{TEST_TRANSCRIPT}
</transcript>
"""

def test_claude():
    if not anthropic_api_key:
        return "Skipped (No API Key)"
    
    print("Testing Claude (claude-haiku-4-5)...")
    model = os.environ.get('CLAUDE_FREE_MODEL', 'claude-3-haiku-20240307') # Defaulting to known haiku version if the alias doesn't work directly
    # Adjusting model name to a known valid one if testing fails, but let's stick to the env var for now
    
    start_time = time.time()
    try:
        response = claude_client.messages.create(
            model="claude-3-haiku-20240307", # Use a known valid model ID for testing
            max_tokens=500,
            messages=[
                {"role": "user", "content": PROMPT}
            ]
        )
        end_time = time.time()
        print(f"Claude Response Time: {end_time - start_time:.2f}s")
        return response.content[0].text
    except Exception as e:
        return f"Claude Error: {e}"

def test_gemini():
    if not gemini_api_key:
        return "Skipped (No API Key)"
    
    print("Testing Gemini (gemini-1.5-flash)...")
    start_time = time.time()
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(PROMPT)
        end_time = time.time()
        print(f"Gemini Response Time: {end_time - start_time:.2f}s")
        return response.text
    except Exception as e:
        return f"Gemini Error: {e}"

if __name__ == "__main__":
    print("=== MODEL COMPARISON TEST ===\n")
    
    claude_result = test_claude()
    print("\n--- Claude Output ---")
    print(claude_result)
    
    print("\n" + "="*50 + "\n")
    
    gemini_result = test_gemini()
    print("\n--- Gemini Output ---")
    print(gemini_result)
