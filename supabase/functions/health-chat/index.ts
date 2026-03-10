import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages, userRecordings } = await req.json();

    const recordingSummary = userRecordings?.length > 0
      ? `The user has ${userRecordings.length} heart recordings. Latest: HR ${userRecordings[0]?.heart_rate_avg} BPM, Risk ${userRecordings[0]?.attack_risk}%, Condition: ${userRecordings[0]?.condition}, Stress: ${userRecordings[0]?.stress_level}. Average HR across all recordings: ${Math.round(userRecordings.reduce((s: number, r: any) => s + (r.heart_rate_avg || 0), 0) / userRecordings.length)} BPM.`
      : "The user has no recordings yet.";

    const systemPrompt = `You are a specialized cardiovascular health AI assistant for the Cardia Sentinel AI app. You have expertise in cardiology and preventive medicine.

CONTEXT: ${recordingSummary}

RULES:
- Provide accurate, evidence-based cardiovascular health information
- Always recommend consulting a doctor for medical concerns
- Use the user's actual recording data when available for personalized insights
- Be empathetic and professional
- For emergencies (chest pain, severe symptoms), always advise calling emergency services immediately
- Keep responses concise but informative
- Use medical terminology with simple explanations
- Never diagnose - provide educational information and risk assessments only
- Format responses with clear sections using bold and bullet points`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI quota exceeded. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("health-chat error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
