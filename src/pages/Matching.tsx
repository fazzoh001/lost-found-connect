import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Brain, Sparkles, ArrowRight, CheckCircle, XCircle, 
  MessageSquare, RefreshCw, ThumbsUp, ThumbsDown, Zap, Loader2
} from "lucide-react";
import { matchesApi } from "@/services/api";
import { useAuth } from "@/contexts/PhpAuthContext";

interface MatchItem {
  id: string;
  lostItem: {
    name: string;
    description: string;
    location: string;
    date: string;
    image: string;
  };
  foundItem: {
    name: string;
    description: string;
    location: string;
    date: string;
    image: string;
  };
  confidence: number;
  factors: { name: string; score: number }[];
  status: string;
}

const getItemEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    electronics: "📱",
    "bags & wallets": "👜",
    documents: "📄",
    keys: "🔑",
    clothing: "👕",
    accessories: "⌚",
    jewelry: "💍",
    books: "📚",
    "sports equipment": "⚽",
    other: "📦"
  };
  return emojiMap[category?.toLowerCase()] || "📦";
};

const Matching = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await matchesApi.getAll();
      
      // Transform API data to match component format
      const transformedMatches: MatchItem[] = (data || []).map((match: any) => ({
        id: match.id,
        lostItem: {
          name: match.lost_item?.title || "Lost Item",
          description: match.lost_item?.description || "",
          location: match.lost_item?.location || "",
          date: match.lost_item?.date_occurred || "",
          image: getItemEmoji(match.lost_item?.category),
        },
        foundItem: {
          name: match.found_item?.title || "Found Item",
          description: match.found_item?.description || "",
          location: match.found_item?.location || "",
          date: match.found_item?.date_occurred || "",
          image: getItemEmoji(match.found_item?.category),
        },
        confidence: Math.round(match.match_score * 100) || 0,
        factors: [
          { name: "Category Match", score: match.lost_item?.category === match.found_item?.category ? 100 : 50 },
          { name: "Location Proximity", score: 85 },
          { name: "Time Frame", score: 90 },
          { name: "Description Similarity", score: Math.round(match.match_score * 100) || 0 },
        ],
        status: match.status || "pending",
      }));
      
      setMatches(transformedMatches);
      if (transformedMatches.length > 0) {
        setSelectedMatch(transformedMatches[0]);
      }
    } catch (err) {
      setError("Failed to load matches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const runNewAnalysis = () => {
    setIsAnalyzing(true);
    fetchMatches().finally(() => setIsAnalyzing(false));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t("matching.aiPowered")}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t("matching.intelligent")} <span className="gradient-text">{t("matching.matchResults")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("matching.matchDesc")}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: t("matching.totalMatches"), value: "156", icon: Sparkles },
              { label: t("matching.avgConfidence"), value: "89%", icon: Brain },
              { label: t("matching.verified"), value: "124", icon: CheckCircle },
              { label: t("matching.pendingReview"), value: "32", icon: RefreshCw },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold">{t("matching.recentMatches")}</h2>
                <Button variant="outline" size="sm" onClick={runNewAnalysis} disabled={isAnalyzing}>
                  <RefreshCw className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("matching.noMatches")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedMatch?.id === match.id
                          ? "bg-primary/20 border border-primary/50"
                          : "bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium truncate">{match.lostItem.name}</span>
                        <span className={`text-lg font-bold ${
                          match.confidence >= 90 ? "text-success" :
                          match.confidence >= 70 ? "text-warning" : "text-destructive"
                        }`}>
                          {match.confidence}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="w-3 h-3" />
                        <span className="truncate">{match.foundItem.name}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          match.status === "verified" 
                            ? "bg-success/20 text-success" 
                            : "bg-warning/20 text-warning"
                        }`}>
                          {match.status === "verified" ? t("matching.verified") : t("matching.pendingReview")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Match Details */}
            {selectedMatch ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Comparison */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  {t("matching.matchComparison")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lost Item */}
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <div className="text-xs font-semibold text-destructive mb-3">{t("matching.lostItem")}</div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-3xl">
                        {selectedMatch.lostItem.image}
                      </div>
                      <div>
                        <h4 className="font-semibold">{selectedMatch.lostItem.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedMatch.lostItem.location}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedMatch.lostItem.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{selectedMatch.lostItem.date}</p>
                  </div>

                  {/* Found Item */}
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <div className="text-xs font-semibold text-success mb-3">{t("matching.foundItem")}</div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-3xl">
                        {selectedMatch.foundItem.image}
                      </div>
                      <div>
                        <h4 className="font-semibold">{selectedMatch.foundItem.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedMatch.foundItem.location}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedMatch.foundItem.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{selectedMatch.foundItem.date}</p>
                  </div>
                </div>
              </div>

              {/* Confidence Analysis */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    {t("matching.confidenceAnalysis")}
                  </h3>
                  <div className={`text-3xl font-bold ${
                    selectedMatch.confidence >= 90 ? "text-success" :
                    selectedMatch.confidence >= 70 ? "text-warning" : "text-destructive"
                  }`}>
                    {selectedMatch.confidence}%
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedMatch.factors.map((factor, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{factor.name}</span>
                        <span className="text-sm font-medium">{factor.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.score}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`h-full rounded-full ${
                            factor.score >= 90 ? "bg-success" :
                            factor.score >= 70 ? "bg-warning" : "bg-destructive"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-display text-lg font-semibold mb-4">{t("matching.actions")}</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="neon" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t("matching.confirmMatch")}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t("matching.contactFinder")}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <XCircle className="w-4 h-4" />
                    {t("matching.notAMatch")}
                  </Button>
                </div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{t("matching.wasHelpful")}</p>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ThumbsUp className="w-4 h-4" /> {t("matching.yes")}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ThumbsDown className="w-4 h-4" /> {t("matching.no")}
                  </Button>
                </div>
              </div>
            </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 glass-card p-12 rounded-2xl flex items-center justify-center"
              >
                <div className="text-center text-muted-foreground">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{t("matching.selectMatch")}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Matching;