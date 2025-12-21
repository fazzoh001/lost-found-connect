import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Package, Search, Bell, TrendingUp, ArrowRight, Plus, 
  MapPin, Clock, AlertCircle, Eye 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const stats = [
  { label: "Items Reported", value: "24", icon: Package, color: "from-neon-purple to-neon-pink" },
  { label: "Active Matches", value: "8", icon: Search, color: "from-neon-pink to-neon-blue" },
  { label: "Notifications", value: "5", icon: Bell, color: "from-neon-blue to-neon-cyan" },
  { label: "Recovery Rate", value: "87%", icon: TrendingUp, color: "from-neon-cyan to-success" },
];

const recentItems = [
  { id: 1, name: "iPhone 15 Pro", type: "Lost", location: "Central Library", date: "2 hours ago", status: "Matching", matchScore: 92 },
  { id: 2, name: "Blue Backpack", type: "Found", location: "Student Center", date: "5 hours ago", status: "Claimed", matchScore: 88 },
  { id: 3, name: "MacBook Air M2", type: "Lost", location: "Cafeteria", date: "1 day ago", status: "Searching", matchScore: 0 },
  { id: 4, name: "Car Keys (Toyota)", type: "Lost", location: "Parking Lot B", date: "2 days ago", status: "Matched", matchScore: 95 },
];

const recentMatches = [
  { id: 1, lostItem: "iPhone 15 Pro", foundItem: "Silver iPhone", score: 92, status: "Pending Review" },
  { id: 2, lostItem: "Blue Backpack", foundItem: "Navy Bag", score: 88, status: "Contact Initiated" },
  { id: 3, lostItem: "Car Keys", foundItem: "Toyota Keys Found", score: 95, status: "Verified Match" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data?.full_name) {
        setProfileName(data.full_name);
      }
    };

    fetchProfile();
  }, [user]);

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
                Welcome back, <span className="gradient-text">{profileName || user?.email?.split('@')[0] || 'User'}</span>
              </h1>
              <p className="text-muted-foreground">Here's what's happening with your items today.</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Link to="/report?type=lost">
                <Button variant="outline">
                  <AlertCircle className="w-4 h-4" />
                  Report Lost
                </Button>
              </Link>
              <Link to="/report?type=found">
                <Button variant="neon">
                  <Plus className="w-4 h-4" />
                  Report Found
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold">Recent Items</h2>
                <Link to="/items" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${item.type === "Lost" ? "bg-destructive" : "bg-success"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{item.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.type === "Lost" 
                            ? "bg-destructive/20 text-destructive" 
                            : "bg-success/20 text-success"
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium mb-1 ${
                        item.status === "Matched" ? "text-success" : 
                        item.status === "Matching" ? "text-warning" :
                        item.status === "Claimed" ? "text-neon-blue" : "text-muted-foreground"
                      }`}>
                        {item.status}
                      </div>
                      {item.matchScore > 0 && (
                        <div className="text-xs text-muted-foreground">{item.matchScore}% match</div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Matches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold">AI Matches</h2>
                <Link to="/matching" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{match.lostItem}</span>
                      <span className="text-sm font-bold text-primary">{match.score}%</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{match.foundItem}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        match.status === "Verified Match" ? "bg-success/20 text-success" :
                        match.status === "Contact Initiated" ? "bg-neon-blue/20 text-neon-blue" :
                        "bg-warning/20 text-warning"
                      }`}>
                        {match.status}
                      </span>
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                <Search className="w-4 h-4" />
                Run New Match
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;