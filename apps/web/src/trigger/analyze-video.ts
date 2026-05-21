import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";

export const analyzeVideoJob = task({
  id: "analyze-video",
  maxDuration: 300,  // 5 minutes max

  run: async (payload: {
    analysisId: string;
    videoId: string;
    videoUrl: string;
    userId: string;
    userTier: string;
  }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Note: SUPABASE_SERVICE_ROLE_KEY needs to be in web/.env.local or passed down
    );

    // Update status to processing
    await supabase.from('analyses').update({
      status: 'processing',
      processing_started_at: new Date().toISOString()
    }).eq('id', payload.analysisId);

    try {
      // Step 1: Call Flask API to get transcript + run AI
      const response = await fetch(`${process.env.API_BASE_URL}/api/internal/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_SECRET!
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Flask API error: ${response.status}`);
      }

      const result = await response.json();

      // Step 2: Save results to Supabase
      await supabase.from('analyses').update({
        status: 'complete',
        completed_at: new Date().toISOString(),
        video_title: result.video_title,
        video_channel: result.video_channel,
        video_thumbnail: result.video_thumbnail,
        video_duration_seconds: result.video_duration_seconds,
        summary: result.summary,
        linkedin_post_v1: result.linkedin_post_v1,
        linkedin_post_v2: result.linkedin_post_v2 || null,
        linkedin_post_v3: result.linkedin_post_v3 || null,
        twitter_thread: result.twitter_thread,
        carousel_slides: result.carousel_slides || result.carousel_preview,
        content_calendar: result.content_calendar || null,
        engagement_ctas: result.engagement_ctas || null,
        key_topics: result.key_topics,
        content_angles: result.content_angles || null,
        instagram_playbook: result.instagram_playbook || null,
        transcript_source: result.transcript_source,
        model_used: result._model_used,
        tokens_input: result._tokens_input,
        tokens_output: result._tokens_output,
      }).eq('id', payload.analysisId);

      return { success: true, analysisId: payload.analysisId };

    } catch (error: any) {
      // Update status to failed
      await supabase.from('analyses').update({
        status: 'failed',
        error_message: error.message || 'Unknown error'
      }).eq('id', payload.analysisId);
      throw error;
    }
  }
});
