import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Package, TrendingUp, AlertCircle, Search, 
  MoreVertical, CheckCircle, XCircle, Eye, Trash2,
  Settings, BarChart3, Shield, Bell, Download
} from "lucide-react";

const Admin = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { label: t("admin.totalUsers"), value: "2,847", change: "+12%", icon: Users, color: "from-neon-purple to-neon-pink" },
    { label: t("admin.totalItems"), value: "1,234", change: "+8%", icon: Package, color: "from-neon-pink to-neon-blue" },
    { label: t("admin.matchesMade"), value: "856", change: "+24%", icon: TrendingUp, color: "from-neon-blue to-neon-cyan" },
    { label: t("admin.pendingReports"), value: "47", change: "-5%", icon: AlertCircle, color: "from-warning to-destructive" },
  ];

  const recentUsers = [
    { id: 1, name: "John Doe", email: "john@university.edu", items: 5, joined: "Dec 15, 2024", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@university.edu", items: 3, joined: "Dec 14, 2024", status: "active" },
    { id: 3, name: "Mike Johnson", email: "mike@university.edu", items: 8, joined: "Dec 13, 2024", status: "inactive" },
    { id: 4, name: "Sarah Williams", email: "sarah@university.edu", items: 2, joined: "Dec 12, 2024", status: "active" },
    { id: 5, name: "Tom Brown", email: "tom@university.edu", items: 6, joined: "Dec 11, 2024", status: "pending" },
  ];

  const pendingItems = [
    { id: 1, name: "iPhone 15 Pro", user: "John Doe", type: "Lost", date: "2 hours ago", status: "pending" },
    { id: 2, name: "Blue Backpack", user: "Jane Smith", type: "Found", date: "5 hours ago", status: "pending" },
    { id: 3, name: "MacBook Air", user: "Mike Johnson", type: "Lost", date: "1 day ago", status: "flagged" },
    { id: 4, name: "Wallet", user: "Sarah Williams", type: "Found", date: "1 day ago", status: "pending" },
  ];

  const tabs = [
    { id: "dashboard", label: t("admin.dashboard"), icon: BarChart3 },
    { id: "users", label: t("admin.users"), icon: Users },
    { id: "items", label: t("admin.items"), icon: Package },
    { id: "settings", label: t("admin.settings"), icon: Settings },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return t("admin.active");
      case "inactive": return t("admin.inactive");
      case "pending": return t("admin.pending");
      default: return status;
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
                <span className="w-2 h-2 rounded-full bg-destructive" />
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

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
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
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2">{user.items}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.status === "active" ? "bg-success/20 text-success" :
                            user.status === "inactive" ? "bg-muted text-muted-foreground" :
                            "bg-warning/20 text-warning"
                          }`}>
                            {getStatusLabel(user.status)}
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

              <div className="space-y-4">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.type === "Lost" 
                            ? "bg-destructive/20 text-destructive" 
                            : "bg-success/20 text-success"
                        }`}>
                          {item.type === "Lost" ? t("items.lost") : t("items.found")}
                        </span>
                        {item.status === "flagged" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">
                            {t("admin.flagged")}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.user} • {item.date}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Activity Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-6 rounded-2xl mt-6"
          >
            <h2 className="font-display text-xl font-semibold mb-6">{t("admin.activityOverview")}</h2>
            <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-xl">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t("admin.chartPlaceholder")}</p>
                <p className="text-sm text-muted-foreground">{t("admin.connectToDatabase")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;