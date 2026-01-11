import { motion } from "framer-motion";
import { Brain, Eye, Camera, Sparkles, AlertCircle } from "lucide-react";
import { ImageMatchAnalysis as IImageMatchAnalysis } from "@/services/imageMatchService";

interface ImageMatchAnalysisProps {
  analysis: IImageMatchAnalysis | null;
  isLoading?: boolean;
  sourceImage?: string;
  targetImage?: string;
}

export const ImageMatchAnalysis = ({
  analysis,
  isLoading,
  sourceImage,
  targetImage,
}: ImageMatchAnalysisProps) => {
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold">AI Visual Analysis</h3>
            <p className="text-sm text-muted-foreground">Comparing images...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-secondary/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Camera className="w-5 h-5" />
          <p className="text-sm">No image analysis available</p>
        </div>
      </div>
    );
  }

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case "likely_match":
        return "bg-success/20 text-success border-success/30";
      case "possible_match":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-destructive/20 text-destructive border-destructive/30";
    }
  };

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case "likely_match":
        return "Likely the Same Item";
      case "possible_match":
        return "Possible Match";
      default:
        return "Unlikely Match";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              AI Visual Comparison
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-sm text-muted-foreground">Powered by Vision AI</p>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getRecommendationStyle(
            analysis.recommendation
          )}`}
        >
          {getRecommendationText(analysis.recommendation)}
        </div>
      </div>

      {/* Images Comparison */}
      {sourceImage && targetImage && (
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-destructive/30">
            <img
              src={sourceImage}
              alt="Lost item"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`text-2xl font-bold ${
                analysis.similarity_score >= 80
                  ? "text-success"
                  : analysis.similarity_score >= 60
                  ? "text-warning"
                  : "text-destructive"
              }`}
            >
              {analysis.similarity_score}%
            </div>
            <span className="text-xs text-muted-foreground">Match</span>
          </div>
          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-success/30">
            <img
              src={targetImage}
              alt="Found item"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
        </div>
      )}

      {/* Visual Match Summary */}
      <div className="p-4 rounded-xl bg-secondary/30">
        <h4 className="text-sm font-medium mb-2">Visual Similarities</h4>
        <p className="text-sm text-muted-foreground">{analysis.visual_match}</p>
      </div>

      {/* Key Differences */}
      {analysis.key_differences && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <h4 className="text-sm font-medium">Differences Noted</h4>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.key_differences}</p>
        </div>
      )}

      {/* Confidence Factors */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Analysis Factors</h4>
        {analysis.confidence_factors.map((factor, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">{factor.factor}</span>
              <span className="text-sm font-medium">{factor.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${factor.score}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`h-full rounded-full ${
                  factor.score >= 80
                    ? "bg-success"
                    : factor.score >= 60
                    ? "bg-warning"
                    : "bg-destructive"
                }`}
              />
            </div>
            {factor.detail && (
              <p className="text-xs text-muted-foreground mt-1">{factor.detail}</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
