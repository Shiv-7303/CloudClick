from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
)
import subprocess, os, tempfile
from deepgram import DeepgramClient, PrerecordedOptions
import json
from db import get_supabase

class TranscriptUnavailableError(Exception): pass
class VideoUnavailableError(Exception): pass

def get_youtube_transcript(video_id: str, duration_sec: int = 0) -> list[dict]:
    """
    Returns: [{text: str, start: float, duration: float}]
    Raises TranscriptUnavailableError or VideoUnavailableError on failure.
    """
    try:
        cookies_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cookies.txt')
        kwargs = {}
        if os.path.exists(cookies_path):
            kwargs['cookies'] = cookies_path

        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id, **kwargs)
        # Try manual English first, then auto-generated English, then Hindi, then auto-translate anything to English
        try:
            t = transcript_list.find_transcript(['en'])
        except Exception:
            try:
                t = transcript_list.find_generated_transcript(['en'])
            except Exception:
                try:
                    t = transcript_list.find_transcript(['hi'])
                except Exception:
                    try:
                        t = transcript_list.find_generated_transcript(['hi'])
                    except Exception:
                        # Grab whatever is available and translate to English
                        for transcript in transcript_list:
                            if transcript.is_translatable:
                                t = transcript.translate('en')
                                break
                        else:
                            raise TranscriptUnavailableError("No translatable transcript found")
        return t.fetch()
    except (TranscriptsDisabled, NoTranscriptFound):
        raise TranscriptUnavailableError("No transcript available for this video")
    except VideoUnavailable:
        raise VideoUnavailableError("Video is private or does not exist")
    except Exception as e:
        raise TranscriptUnavailableError(f"Unexpected error: {str(e)}")

def download_audio(video_id: str) -> str:
    """Downloads audio using yt-dlp. Returns path to .mp3 file."""
    tmpdir = tempfile.mkdtemp()
    output_path = os.path.join(tmpdir, f"{video_id}.mp3")
    
    cookies_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cookies.txt')
    
    cmd = [
        'yt-dlp',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '5',       # 128kbps — fine for Deepgram
        '--max-filesize', '100M',      # safety cap
        '--no-playlist'
    ]
    
    if os.path.exists(cookies_path):
        cmd.extend(['--cookies', cookies_path])
        
    cmd.extend([
        '--extractor-args', 'youtube:player_client=android',
        '-o', output_path,
        f'https://www.youtube.com/watch?v={video_id}'
    ])
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)

    if result.returncode != 0:
        raise Exception(f"yt-dlp failed: {result.stderr[:200]}")
    if not os.path.exists(output_path):
        raise Exception(f"yt-dlp produced no output file")
    return output_path

def transcribe_with_deepgram(audio_path: str) -> list[dict]:
    """
    Transcribes audio using Deepgram Nova-3.
    Cost: $0.0048/min = ₹4 per 10-min video.
    Called ONLY when YouTube transcript is unavailable.
    """
    client = DeepgramClient(os.environ['DEEPGRAM_API_KEY'])
    with open(audio_path, 'rb') as audio_file:
        buffer_data = audio_file.read()

    options = PrerecordedOptions(
        model="nova-3",
        smart_format=True,
        utterances=True,
        punctuate=True,
    )
    response = client.listen.prerecorded.v("1").transcribe_file(
        {'buffer': buffer_data, 'mimetype': 'audio/mp3'},
        options,
        timeout=300
    )
    words = response.results.channels[0].alternatives[0].words or []
    return [
        {
            'text': w.word,
            'start': float(w.start),
            'duration': float(w.end) - float(w.start)
        }
        for w in words
    ]

def transcribe_with_cleanup(audio_path: str) -> list[dict]:
    try:
        return transcribe_with_deepgram(audio_path)
    finally:
        try:
            os.remove(audio_path)
            os.rmdir(os.path.dirname(audio_path))
        except Exception:
            pass

def get_transcript(video_id: str, duration_sec: int = 0) -> dict:
    """
    Returns: {entries: list, source: str, full_text: str}
    Checks Supabase cache first (analyses with same video_id).
    Falls back to Deepgram if YouTube fails, subject to FUP limit.
    """
    sb = get_supabase()
    cached = sb.table('analyses') \
        .select('transcript_source') \
        .eq('video_id', video_id) \
        .eq('status', 'complete') \
        .limit(1) \
        .execute()

    source = 'youtube'
    try:
        entries = get_youtube_transcript(video_id)
    except TranscriptUnavailableError:
        # FUP Check: Fallback max 30 mins
        if duration_sec > 1800:
            raise TranscriptUnavailableError(f"No free YouTube subtitles found. Audio processing fallback is limited to 30 mins (video is {int(duration_sec/60)} mins).")
            
        source = 'deepgram'
        audio_path = download_audio(video_id)
        entries = transcribe_with_cleanup(audio_path)

    full_text = ' '.join(e['text'] for e in entries).strip()
    return {'entries': entries, 'source': source, 'full_text': full_text}
