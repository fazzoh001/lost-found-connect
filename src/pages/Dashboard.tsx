import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Package, Search, Bell, TrendingUp, ArrowRight, Plus, 
  MapPin, Clock, AlertCircle, Eye, Loader2 
} from "lucide-react";
import { useAuth } from "@/contexts/PhpAuthContext";
import { useEffect, useState } from "react";
import { itemsApi, matchesApi } from "@/services/api";
import { formatDistanceToNow } from "date-fns";

interface DashboardItem {
  id: string;
  title: string;
  type: "lost" | "found";
  location: string;
  date_occurred: string;
  status: string;
  created_at: string;
}

interface DashboardMatch {
  id: string;
  lost_item: { id: string; title: string };
  found_item: { id: string; title: string };
  match_score: number;
  status: string;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [userItems, setUserItems] = useState<DashboardItem[]>([]);
  const [matches, setMatches] = useState<DashboardMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    itemsReported: 0,
    activeMatches: 0,
    notifications: 0,
    recoveryRate: 0
  });

  useEffect(() => {
    if (user?.full_name) {
      setProfileName(user.full_name);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's items
        const itemsData = await itemsApi.getByUser();
        const items = Array.isArray(itemsData) ? itemsData : [];
        setUserItems(items.slice(0, 4)); // Get latest 4

        // Fetch matches
        try {
          const matchesData = await matchesApi.getAll();
          const matchList = Array.isArray(matchesData) ? matchesData : [];
          setMatches(matchList.slice(0, 3)); // Get latest 3
          
          // Calculate stats
          const resolvedItems = items.filter((i: DashboardItem) => i.status === "resolved").length;
          const recoveryRate = items.length > 0 ? Math.round((resolvedItems / items.length) * 100) : 0;
          
          setStats({
            itemsReported: items.length,
            activeMatches: matchList.filter((m: DashboardMatch) => m.status === "pending").length,
            notifications: matchList.filter((m: DashboardMatch) => m.status === "pending").length,
            recoveryRate
          });
        } catch {
          // Matches API might fail if no matches exist
          setMatches([]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: t("dashboard.itemsReported"), value: stats.itemsReported.toString(), icon: Package, color: "from-neon-purple to-neon-pink" },
    { label: t("dashboard.activeMatches"), value: stats.activeMatches.toString(), icon: Search, color: "from-neon-pink to-neon-blue" },
    { label: t("dashboard.notifications"), value: stats.notifications.toString(), icon: Bell, color: "from-neon-blue to-neon-cyan" },
    { label: t("dashboard.recoveryRate"), value: `${stats.recoveryRate}%`, icon: TrendingUp, color: "from-neon-cyan to-success" },
  ];

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "resolved": return "text-success";
      case "matched": return "text-success";
      case "active": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getMatchStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/20 text-success";
      case "contacted": return "bg-neon-blue/20 text-neon-blue";
      default: return "bg-warning/20 text-warning";
    }
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
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                {t("dashboard.welcomeBack")} <span className="gradient-text">{profileName || user?.email?.split('@')[0] || 'User'}</span>
              </h1>
              <p className="text-muted-foreground">{t("dashboard.whatsHappening")}</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Link to="/report?type=lost">
                <Button variant="outline">
                  <AlertCircle className="w-4 h-4" />
                  {t("dashboard.reportLost")}
                </Button>
              </Link>
              <Link to="/report?type=found">
                <Button variant="neon">
                  <Plus className="w-4 h-4" />
                  {t("dashboard.reportFound")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl group hover:neon-glow-sm transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div className="font-display text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:col-span-2 glass-card p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">{t("dashboard.recentItems")}</h2>
                  <Link to="/items" className="text-sm text-primary hover:underline flex items-center gap-1">
                    {t("dashboard.viewAll")} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {userItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t("dashboard.noItems")}</p>
                    <Link to="/report">
                      <Button variant="outline" className="mt-4">
                        <Plus className="w-4 h-4" />
                        {t("dashboard.reportFirst")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userItems.map((item) => (
                      <Link
                        key={item.id}
                        to={`/items/${item.id}`}
                        className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className={`w-3 h-3 rounded-full ${item.type === "lost" ? "bg-destructive" : "bg-success"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{item.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.type === "lost" 
                                ? "bg-destructive/20 text-destructive" 
                                : "bg-success/20 text-success"
                            }`}>
                              {item.type === "lost" ? t("items.lost") : t("items.found")}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(item.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium mb-1 capitalize ${getStatusStyle(item.status)}`}>
                            {item.status}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* AI Matches */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">{t("dashboard.aiMatches")}</h2>
                  <Link to="/matching" className="text-sm text-primary hover:underline flex items-center gap-1">
                    {t("dashboard.viewAll")} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {matches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t("matching.noMatches")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium truncate">{match.lost_item?.title || "Lost Item"}</span>
                          <span className="text-sm font-bold text-primary">{match.match_score}%</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate">{match.found_item?.title || "Found Item"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getMatchStatusStyle(match.status)}`}>
                            {match.status}
                          </span>
                          <Link to="/matching">
                            <Button variant="ghost" size="sm" className="text-xs h-7">
                              {t("dashboard.review")}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link to="/matching">
                  <Button variant="outline" className="w-full mt-4">
                    <Search className="w-4 h-4" />
                    {t("dashboard.runNewMatch")}
                  </Button>
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;