import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Filter, MapPin, Clock, Eye, Heart, 
  Grid, List, ChevronDown, X, Sparkles 
} from "lucide-react";

const mockItems = [
  { id: 1, name: "iPhone 15 Pro Max", type: "Lost", category: "Electronics", location: "Central Library", date: "2 hours ago", image: "📱", matchScore: 92, description: "Space Black, 256GB with clear case" },
  { id: 2, name: "Blue Nike Backpack", type: "Found", category: "Bags & Wallets", location: "Student Center", date: "5 hours ago", image: "🎒", matchScore: 88, description: "Navy blue with white logo, contains books" },
  { id: 3, name: "MacBook Air M2", type: "Lost", category: "Electronics", location: "Cafeteria", date: "1 day ago", image: "💻", matchScore: 0, description: "Silver, has stickers on the cover" },
  { id: 4, name: "Toyota Car Keys", type: "Lost", category: "Keys", location: "Parking Lot B", date: "2 days ago", image: "🔑", matchScore: 95, description: "Black key fob with gym membership tag" },
  { id: 5, name: "Ray-Ban Sunglasses", type: "Found", category: "Accessories", location: "Sports Field", date: "3 days ago", image: "🕶️", matchScore: 0, description: "Black Wayfarer style, scratched lens" },
  { id: 6, name: "Student ID Card", type: "Found", category: "Documents", location: "Admin Building", date: "4 days ago", image: "🪪", matchScore: 75, description: "University student card, name visible" },
  { id: 7, name: "AirPods Pro 2", type: "Lost", category: "Electronics", location: "Gym", date: "5 days ago", image: "🎧", matchScore: 0, description: "White case with engraving 'JD'" },
  { id: 8, name: "Black Leather Wallet", type: "Found", category: "Bags & Wallets", location: "Bus Stop", date: "1 week ago", image: "👛", matchScore: 82, description: "Contains cards, no cash" },
];

const categories = ["All", "Electronics", "Bags & Wallets", "Documents", "Keys", "Clothing", "Accessories"];

const Items = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const [filterType, setFilterType] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = mockItems.filter(item => {
    const matchesType = filterType === "all" || item.type.toLowerCase() === filterType;
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

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
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Browse <span className="gradient-text">Items</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Search through our database of lost and found items. Our AI continuously matches items to help reunite owners with their belongings.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-4 rounded-2xl mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search items by name, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>

              {/* Type Filter */}
              <div className="flex gap-2">
                {["all", "lost", "found"].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    onClick={() => setFilterType(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>

              {/* More Filters */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {/* View Toggle */}
              <div className="flex border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <p className="text-sm font-medium mb-3">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredItems.length}</span> items
            </p>
            {(searchQuery || filterType !== "all" || selectedCategory !== "All") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setSelectedCategory("All");
                }}
                className="gap-1"
              >
                <X className="w-4 h-4" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Items Grid */}
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
            : "space-y-4"
          }>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`glass-card rounded-2xl overflow-hidden group hover:neon-glow-sm transition-all duration-300 ${
                  viewMode === "list" ? "flex gap-4 p-4" : ""
                }`}
              >
                {/* Image */}
                <div className={`bg-secondary/50 flex items-center justify-center ${
                  viewMode === "grid" ? "h-48" : "w-24 h-24 rounded-xl flex-shrink-0"
                }`}>
                  <span className={viewMode === "grid" ? "text-6xl" : "text-4xl"}>{item.image}</span>
                </div>

                {/* Content */}
                <div className={viewMode === "grid" ? "p-4" : "flex-1"}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.type === "Lost" 
                          ? "bg-destructive/20 text-destructive" 
                          : "bg-success/20 text-success"
                      }`}>
                        {item.type}
                      </span>
                      {item.matchScore > 0 && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {item.matchScore}% match
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>

                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>

                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setFilterType("all");
                setSelectedCategory("All");
              }}>
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Items;
