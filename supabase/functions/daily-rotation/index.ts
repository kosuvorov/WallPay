// Daily Wallpaper Rotation Edge Function
// Triggers at 00:00 UTC via cron to activate today's selected wallpapers

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify cron secret for security
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Get today's selected wallpapers
    const { data: todaysSelections, error: selectError } = await supabase
      .from("daily_wallpaper_selections")
      .select("wallpaper_id, id")
      .eq("live_date", today);

    if (selectError) {
      throw new Error(`Failed to fetch selections: ${selectError.message}`);
    }

    console.log(`Found ${todaysSelections?.length || 0} wallpapers scheduled for ${today}`);

    // Log the rotation event (you could add a rotations table if needed)
    const result = {
      date: today,
      wallpapersActivated: todaysSelections?.length || 0,
      wallpaperIds: todaysSelections?.map((s) => s.wallpaper_id) || [],
      timestamp: new Date().toISOString(),
    };

    // Optional: Clean up old selections (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cleanupDate = thirtyDaysAgo.toISOString().split("T")[0];

    const { error: cleanupError } = await supabase
      .from("daily_wallpaper_selections")
      .delete()
      .lt("live_date", cleanupDate);

    if (cleanupError) {
      console.error("Cleanup warning:", cleanupError.message);
      // Don't fail the whole function for cleanup errors
    } else {
      console.log(`Cleaned up selections older than ${cleanupDate}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        result,
        message: `Daily rotation completed successfully for ${today}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Daily rotation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
