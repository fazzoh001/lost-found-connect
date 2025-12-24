import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Brain, Sparkles, ArrowRight, CheckCircle, XCircle, 
  MessageSquare, RefreshCw, ThumbsUp, ThumbsDown, Zap 
} from "lucide-react";

const mockMatches = [
  {
    id: 1,
    lostItem: {
      name: "iPhone 15 Pro Max",
      description: "Space Black, 256GB with clear case and cracked screen protector",
      location: "Central Library",
      date: "Dec 15, 2024",
      image: "📱",
    },
    foundItem: {
      name: "Black iPhone Found",
      description: "Large iPhone, black color, has a clear protective case",
      location: "Library Study Room 3",
      date: "Dec 16, 2024",
      image: "📱",
    },
    confidence: 94,
    factors: [
      { name: "Device Type", score: 100 },
      { name: "Color Match", score: 95 },
      { name: "Location Proximity", score: 90 },
      { name: "Description Similarity", score: 88 },
      { name: "Time Frame", score: 95 },
    ],
    status: "pending",
  },
  {
    id: 2,
    lostItem: {
      name: "Blue Nike Backpack",
      description: "Navy blue with white swoosh, contains textbooks and laptop",
      location: "Student Center",
      date: "Dec 14, 2024",
      image: "🎒",
    },
    foundItem: {
      name: "Navy Sports Bag",
      description: "Dark blue backpack, Nike brand, found with books inside",
      location: "Student Center Cafeteria",
      date: "Dec 14, 2024",
      image: "🎒",
    },
    confidence: 91,
    factors: [
      { name: "Item Type", score: 100 },
      { name: "Brand Match", score: 100 },
      { name: "Color Match", score: 85 },
      { name: "Location Proximity", score: 95 },
      { name: "Contents Match", score: 80 },
    ],
    status: "pending",
  },
  {
    id: 3,
    lostItem: {
      name: "Toyota Car Keys",
      description: "Black key fob with gym membership tag attached",
      location: "Parking Lot B",
      date: "Dec 13, 2024",
      image: "🔑",
    },
    foundItem: {
      name: "Car Keys with Tag",
      description: "Toyota key fob, has a blue keychain tag",
      location: "Parking Lot B - Row 5",
      date: "Dec 13, 2024",
      image: "🔑",
    },
    confidence: 97,
    factors: [
      { name: "Item Type", score: 100 },
      { name: "Brand Match", score: 100 },
      { name: "Location Match", score: 98 },
      { name: "Time Match", score: 100 },
      { name: "Accessory Match", score: 85 },
    ],
    status: "verified",
  },
];

const Matching = () => {
  const { t } = useTranslation();
  const [selectedMatch, setSelectedMatch] = useState(mockMatches[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runNewAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
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

              <div className="space-y-3">
                {mockMatches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedMatch.id === match.id
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
            </motion.div>

            {/* Match Details */}
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Matching;