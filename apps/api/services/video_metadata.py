import requests, os, re, subprocess, json

def get_video_metadata(video_id: str) -> dict:
    """Fetches title, thumbnail, duration via YouTube Data API v3."""
    resp = requests.get(
        'https://www.googleapis.com/youtube/v3/videos',
        params={
            'part': 'snippet,contentDetails',
            'id': video_id,
            'key': os.environ.get('YOUTUBE_API_KEY', '')
        },
        timeout=10
    )
    data = resp.json()
    if not data.get('items'):
        # Fallback: extract basic info from oEmbed (no API key needed) and yt-dlp
        return get_video_metadata_oembed(video_id)

    item = data['items'][0]
    snippet = item['snippet']
    thumbnails = snippet.get('thumbnails', {})
    thumbnail = (thumbnails.get('maxres') or thumbnails.get('high') or
                 thumbnails.get('medium', {})).get('url', f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg")
    return {
        'title': snippet.get('title', 'Unknown Title'),
        'channel': snippet.get('channelTitle', 'Unknown Channel'),
        'thumbnail': thumbnail,
        'duration_seconds': parse_iso_duration(item['contentDetails']['duration']),
        'video_id': video_id,
    }

def get_video_metadata_oembed(video_id: str) -> dict:
    """Fallback when YouTube API key not set — uses oEmbed and yt-dlp."""
    meta = {
        'title': 'Unknown Title', 
        'channel': 'Unknown Channel', 
        'thumbnail': f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg", 
        'duration_seconds': 0, 
        'video_id': video_id
    }
    
    # 1. Get title and channel from oEmbed (very fast)
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        resp = requests.get(url, timeout=5)
        if resp.ok:
            data = resp.json()
            meta['title'] = data.get('title', meta['title'])
            meta['channel'] = data.get('author_name', meta['channel'])
    except Exception:
        pass
        
    # 2. Get duration using yt-dlp
    try:
        # Get metadata without downloading the video
        cookies_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cookies.txt')
        cmd = [
            'yt-dlp',
            '--dump-json',
            '--no-playlist'
        ]
        if os.path.exists(cookies_path):
            cmd.extend(['--cookies', cookies_path])
            
        cmd.extend([
            '--extractor-args', 'youtube:player_client=android',
            f'https://www.youtube.com/watch?v={video_id}'
        ])
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        if result.returncode == 0:
            yt_data = json.loads(result.stdout)
            meta['duration_seconds'] = yt_data.get('duration', 0)
            
            # If oEmbed failed, we can also rescue title/channel from yt-dlp
            if meta['title'] == 'Unknown Title':
                meta['title'] = yt_data.get('title', meta['title'])
                meta['channel'] = yt_data.get('uploader', meta['channel'])
    except Exception as e:
        print(f"Warning: Failed to fetch duration via yt-dlp for {video_id}: {e}")

    return meta

def parse_iso_duration(iso: str) -> int:
    """Converts PT10M30S to 630 seconds."""
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso)
    if not match: return 0
    h, m, s = (int(x or 0) for x in match.groups())
    return h * 3600 + m * 60 + s
