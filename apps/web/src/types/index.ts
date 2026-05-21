export type PlaybookFormat =
  | 'Talking Head Reel'
  | 'Instagram Carousel'
  | 'Facecam Reel'
  | 'Story Reel'
  | 'Meme Reel'
  | 'Whiteboard Reel'
  | 'Talking Head'
  | 'Talking Head / Carousel'

export type PlaybookContentType =
  | 'Contrarian Post'
  | 'Educational'
  | 'Story Post'
  | 'Hot Take'
  | 'Relatable'
  | 'Authority Post'
  | 'Carousel'

export interface PlaybookDay {
  day: number
  content_type: PlaybookContentType | string
  hook: string
  angle: string
  format: PlaybookFormat | string
}

export interface TwitterTweet {
  text: string
  position: number
}

export interface CarouselSlide {
  title: string
  body: string
  slide_number: number
}

export interface ContentCalendarDay {
  day: number
  post_type: string
  caption: string
  angle: string
}

export interface ContentAngles {
  standard: string
  advanced: string
  contrarian: string
}

export interface Analysis {
  id: string
  user_id: string
  video_id: string
  video_url: string
  video_title: string | null
  video_channel: string | null
  video_thumbnail: string | null
  video_duration_seconds: number | null
  transcript_source: 'youtube' | 'deepgram' | null
  model_used: string | null
  summary: string | null
  linkedin_post_v1: string | null
  linkedin_post_v2: string | null
  linkedin_post_v3: string | null
  twitter_thread: TwitterTweet[] | null
  carousel_slides: CarouselSlide[] | null
  content_calendar: ContentCalendarDay[] | null
  engagement_ctas: string[] | null
  key_topics: string[] | null
  content_angles: ContentAngles | null
  instagram_playbook: PlaybookDay[] | null
  status: 'queued' | 'processing' | 'complete' | 'failed'
  error_message: string | null
  created_at: string
  completed_at: string | null
}
