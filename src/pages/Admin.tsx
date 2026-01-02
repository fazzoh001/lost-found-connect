import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Package, TrendingUp, AlertCircle, Search, 
  MoreVertical, CheckCircle, XCircle, Eye, Loader2,
  Settings, BarChart3, Shield, Bell, Download
} from "lucide-react";
import { itemsApi, matchesApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface AdminItem {
  id: string;
  title: string;
  type: "lost" | "found";
  status: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
}

const Admin = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<AdminItem[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    matchesMade: 0,
    pendingReports: 0
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all items
      const itemsData = await itemsApi.getAll();
      const items: AdminItem[] = Array.isArray(itemsData) ? itemsData : [];
      setAllItems(items);

      // Calculate stats from items
      const uniqueUsers = new Set(items.map((i: AdminItem) => i.user_email)).size;
      const pendingItems = items.filter((i: AdminItem) => i.status === "active").length;
      
      // Fetch matches
      let matchCount = 0;
      try {
        const matchesData = await matchesApi.getAll();
        matchCount = Array.isArray(matchesData) ? matchesData.length : 0;
      } catch {
        // Matches API might fail
      }

      setStats({
        totalUsers: uniqueUsers,
        totalItems: items.length,
        matchesMade: matchCount,
        pendingReports: pendingItems
      });
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveItem = async (itemId: string) => {
    try {
      await itemsApi.update(itemId, { status: "active" });
      toast({ title: "Success", description: "Item approved" });
      fetchAdminData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve item", variant: "destructive" });
    }
  };

  const handleRejectItem = async (itemId: string) => {
    try {
      await itemsApi.delete(itemId);
      toast({ title: "Success", description: "Item rejected and removed" });
      fetchAdminData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject item", variant: "destructive" });
    }
  };

  const statCards = [
    { label: t("admin.totalUsers"), value: stats.totalUsers.toString(), change: "+12%", icon: Users, color: "from-neon-purple to-neon-pink" },
    { label: t("admin.totalItems"), value: stats.totalItems.toString(), change: "+8%", icon: Package, color: "from-neon-pink to-neon-blue" },
    { label: t("admin.matchesMade"), value: stats.matchesMade.toString(), change: "+24%", icon: TrendingUp, color: "from-neon-blue to-neon-cyan" },
    { label: t("admin.pendingReports"), value: stats.pendingReports.toString(), change: "-5%", icon: AlertCircle, color: "from-warning to-destructive" },
  ];

  const tabs = [
    { id: "dashboard", label: t("admin.dashboard"), icon: BarChart3 },
    { id: "users", label: t("admin.users"), icon: Users },
    { id: "items", label: t("admin.items"), icon: Package },
    { id: "settings", label: t("admin.settings"), icon: Settings },
  ];

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Filter items based on search
  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique users from items
  const uniqueUsers = Array.from(
    new Map(
      allItems.map(item => [item.user_email, {
        email: item.user_email || "Unknown",
        name: item.user_name || item.user_email?.split("@")[0] || "Unknown",
        itemCount: allItems.filter(i => i.user_email === item.user_email).length,
        status: "active"
      }])
    ).values()
  );

  // Get pending items (active status)
  const pendingItems = allItems.filter(item => item.status === "active").slice(0, 4);

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
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-primary">{t("admin.adminPanel")}</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {t("admin.systemOverview").split(" ")[0]} <span className="gradient-text">{t("admin.systemOverview").split(" ").slice(1).join(" ")}</span>
              </h1>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                {t("admin.exportData")}
              </Button>
              <Button variant="outline" className="gap-2">
                <Bell className="w-4 h-4" />
                {stats.pendingReports > 0 && (
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                )}
              </Button>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-2 mb-8 overflow-x-auto pb-2"
          >
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              >
                {statCards.map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card p-6 rounded-2xl group hover:neon-glow-sm transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${
                        stat.change.startsWith("+") ? "text-success" : "text-destructive"
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <div className="font-display text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold">{t("admin.recentUsers")}</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t("admin.searchUsers")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>

                  {uniqueUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("admin.user")}</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("admin.items")}</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("admin.status")}</th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t("admin.actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueUsers.slice(0, 5).map((user, idx) => (
                            <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30">
                              <td className="py-3 px-2">
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                              </td>
                              <td className="py-3 px-2">{user.itemCount}</td>
                              <td className="py-3 px-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">
                                  {t("admin.active")}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>

                {/* Pending Items */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold">{t("admin.pendingApproval")}</h2>
                    <Button variant="outline" size="sm">{t("dashboard.viewAll")}</Button>
                  </div>

                  {pendingItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No pending items</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{item.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.type === "lost" 
                                  ? "bg-destructive/20 text-destructive" 
                                  : "bg-success/20 text-success"
                              }`}>
                                {item.type === "lost" ? t("items.lost") : t("items.found")}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.user_email || "Unknown"} • {getTimeAgo(item.created_at)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-success hover:text-success"
                              onClick={() => handleApproveItem(item.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRejectItem(item.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Activity Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card p-6 rounded-2xl mt-6"
              >
                <h2 className="font-display text-xl font-semibold mb-6">{t("admin.activityOverview")}</h2>
                <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-xl">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-foreground font-medium">
                      {stats.totalItems} items • {stats.matchesMade} matches
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.totalUsers} active users
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;