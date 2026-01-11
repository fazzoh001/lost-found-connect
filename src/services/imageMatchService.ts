import { supabase } from "@/integrations/supabase/client";

export interface ImageMatchAnalysis {
  similarity_score: number;
  visual_match: string;
  key_differences: string;
  confidence_factors: Array<{
    factor: string;
    score: number;
    detail: string;
  }>;
  recommendation: "likely_match" | "possible_match" | "unlikely_match";
}

export interface ImageMatchResult {
  success: boolean;
  analysis?: ImageMatchAnalysis;
  error?: string;
  model?: string;
  timestamp?: string;
}

export const analyzeImageMatch = async (
  sourceImageUrl: string,
  targetImageUrl: string,
  options?: {
    sourceDescription?: string;
    targetDescription?: string;
    sourceCategory?: string;
    targetCategory?: string;
  }
): Promise<ImageMatchResult> => {
  try {
    const { data, error } = await supabase.functions.invoke<ImageMatchResult>("image-match", {
      body: {
        sourceImageUrl,
        targetImageUrl,
        sourceDescription: options?.sourceDescription,
        targetDescription: options?.targetDescription,
        sourceCategory: options?.sourceCategory,
        targetCategory: options?.targetCategory,
      },
    });

    if (error) {
      console.error("Image match error:", error);
      return {
        success: false,
        error: error.message || "Failed to analyze images",
      };
    }

    return data || { success: false, error: "No data returned" };
  } catch (err) {
    console.error("Image match service error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

// Batch analyze multiple items against a source
export const batchAnalyzeImages = async (
  sourceItem: {
    imageUrl: string;
    description?: string;
    category?: string;
  },
  targetItems: Array<{
    id: string;
    imageUrl: string;
    description?: string;
    category?: string;
  }>
): Promise<Array<{ id: string; result: ImageMatchResult }>> => {
  const results = await Promise.all(
    targetItems.map(async (target) => {
      const result = await analyzeImageMatch(
        sourceItem.imageUrl,
        target.imageUrl,
        {
          sourceDescription: sourceItem.description,
          targetDescription: target.description,
          sourceCategory: sourceItem.category,
          targetCategory: target.category,
        }
      );
      return { id: target.id, result };
    })
  );

  // Sort by similarity score (highest first)
  return results.sort((a, b) => {
    const scoreA = a.result.analysis?.similarity_score || 0;
    const scoreB = b.result.analysis?.similarity_score || 0;
    return scoreB - scoreA;
  });
};
