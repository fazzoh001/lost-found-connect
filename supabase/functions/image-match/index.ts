import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImageMatchRequest {
  sourceImageUrl: string;
  targetImageUrl: string;
  sourceDescription?: string;
  targetDescription?: string;
  sourceCategory?: string;
  targetCategory?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { 
      sourceImageUrl, 
      targetImageUrl, 
      sourceDescription, 
      targetDescription,
      sourceCategory,
      targetCategory 
    }: ImageMatchRequest = await req.json();

    if (!sourceImageUrl || !targetImageUrl) {
      return new Response(
        JSON.stringify({ error: "Both sourceImageUrl and targetImageUrl are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt for visual comparison
    const systemPrompt = `You are an AI assistant specialized in comparing images of lost and found items.
Your task is to analyze two images and determine if they could be the same item.

Consider the following factors:
1. Visual Similarity: Shape, size, color, brand logos, distinctive marks
2. Object Type: Is it the same type of item?
3. Condition: Could any differences be due to wear, lighting, or angle?
4. Unique Features: Serial numbers, scratches, stickers, personalization

Provide a detailed analysis with:
- similarity_score: A number from 0-100 indicating how likely these are the same item
- visual_match: Brief description of visual similarities
- key_differences: Any notable differences between the items
- confidence_factors: Array of factors that influenced your confidence
- recommendation: "likely_match", "possible_match", or "unlikely_match"`;

    const userPrompt = `Compare these two items to determine if they might be the same lost/found item:

**Item 1 (Lost/Source):**
${sourceDescription ? `- Description: ${sourceDescription}` : ''}
${sourceCategory ? `- Category: ${sourceCategory}` : ''}

**Item 2 (Found/Target):**
${targetDescription ? `- Description: ${targetDescription}` : ''}
${targetCategory ? `- Category: ${targetCategory}` : ''}

Analyze the images and provide your assessment in the following JSON format:
{
  "similarity_score": <number 0-100>,
  "visual_match": "<string describing visual similarities>",
  "key_differences": "<string noting any differences>",
  "confidence_factors": [
    {"factor": "<factor name>", "score": <0-100>, "detail": "<explanation>"}
  ],
  "recommendation": "<likely_match|possible_match|unlikely_match>"
}`;

    // Use Lovable AI with vision capabilities
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: { url: sourceImageUrl }
              },
              {
                type: "image_url",
                image_url: { url: targetImageUrl }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a fallback analysis
      analysis = {
        similarity_score: 50,
        visual_match: "Unable to perform detailed analysis",
        key_differences: "Analysis incomplete",
        confidence_factors: [
          { factor: "Category Match", score: sourceCategory === targetCategory ? 100 : 50, detail: "Based on category" }
        ],
        recommendation: "possible_match"
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        model: "google/gemini-2.5-flash",
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Image match error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
