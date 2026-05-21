import pytest
from unittest.mock import patch, MagicMock
from services.transcript import (
    get_transcript, get_youtube_transcript, transcribe_with_cleanup,
    TranscriptUnavailableError, VideoUnavailableError, TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
)
import os

def test_youtube_primary_success():
    with patch('services.transcript.YouTubeTranscriptApi') as mock_api:
        mock_transcript_obj = MagicMock()
        mock_transcript_obj.fetch.return_value = [{'text': 'Hello', 'start': 0.0, 'duration': 1.0}]
        mock_api.list_transcripts.return_value.find_transcript.return_value = mock_transcript_obj
        
        res = get_youtube_transcript('test_id')
        assert len(res) == 1
        assert res[0]['text'] == 'Hello'

def test_transcripts_disabled_triggers_deepgram():
    with patch('services.transcript.YouTubeTranscriptApi') as mock_api:
        mock_api.list_transcripts.side_effect = TranscriptsDisabled('test_id')
        with pytest.raises(TranscriptUnavailableError):
            get_youtube_transcript('test_id')

def test_no_transcript_found_triggers_deepgram():
    with patch('services.transcript.YouTubeTranscriptApi') as mock_api:
        mock_api.list_transcripts.side_effect = NoTranscriptFound('test_id', 'en', [])
        with pytest.raises(TranscriptUnavailableError):
            get_youtube_transcript('test_id')

def test_private_video_raises_error():
    with patch('services.transcript.YouTubeTranscriptApi') as mock_api:
        mock_api.list_transcripts.side_effect = VideoUnavailable('test_id')
        with pytest.raises(VideoUnavailableError):
            get_youtube_transcript('test_id')

def test_full_text_joined_correctly():
    with patch('services.transcript.get_supabase') as mock_sb, \
         patch('services.transcript.get_youtube_transcript') as mock_yt:
         
        mock_sb.return_value.table().select().eq().eq().limit().execute().data = []
        mock_yt.return_value = [
            {'text': 'Hello', 'start': 0.0, 'duration': 1.0},
            {'text': 'world', 'start': 1.0, 'duration': 1.0},
            {'text': 'test', 'start': 2.0, 'duration': 1.0}
        ]
        
        res = get_transcript('test_id')
        assert res['full_text'] == 'Hello world test'
        assert res['source'] == 'youtube'

def test_deepgram_cleanup_on_success():
    test_file = 'test_cleanup.mp3'
    with open(test_file, 'w') as f: f.write('dummy')
    
    with patch('services.transcript.transcribe_with_deepgram') as mock_deepgram:
        mock_deepgram.return_value = [{'text': 'deepgram', 'start': 0.0, 'duration': 1.0}]
        
        res = transcribe_with_cleanup(test_file)
        
        assert not os.path.exists(test_file)
        assert len(res) == 1

def test_deepgram_cleanup_on_failure():
    test_file = 'test_cleanup_fail.mp3'
    with open(test_file, 'w') as f: f.write('dummy')
    
    with patch('services.transcript.transcribe_with_deepgram') as mock_deepgram:
        mock_deepgram.side_effect = Exception('Deepgram failed')
        
        with pytest.raises(Exception):
            transcribe_with_cleanup(test_file)
            
        assert not os.path.exists(test_file)
