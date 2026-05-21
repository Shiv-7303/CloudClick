import os
from dotenv import load_dotenv; load_dotenv()
from db import get_supabase
from services.video_metadata import get_video_metadata

sb = get_supabase()
analyses = sb.table('analyses').select('id, video_id').is_('video_thumbnail', 'null').execute()

for row in analyses.data:
    try:
        meta = get_video_metadata(row['video_id'])
        sb.table('analyses').update({
            'video_title': meta.get('title'),
            'video_channel': meta.get('channel'),
            'video_thumbnail': meta.get('thumbnail'),
            'video_duration_seconds': meta.get('duration_seconds')
        }).eq('id', row['id']).execute()
        print(f"Updated {row['video_id']}")
    except Exception as e:
        print(f"Failed {row['video_id']}: {e}")
