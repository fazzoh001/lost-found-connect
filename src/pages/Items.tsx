import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Filter, MapPin, Clock, Eye, Heart, 
  Grid, List, ChevronDown, X, Sparkles, Loader2, ImageOff
} from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { Item } from "@/types/item";
import { formatDistanceToNow } from "date-fns";

const categories = ["All", "Electronics", "Bags & Wallets", "Documents", "Keys", "Clothing", "Accessories", "Jewelry", "Books", "Sports Equipment", "Other"];

const ItemCard = ({ item, viewMode, index }: { item: Item; viewMode: "grid" | "list"; index: number }) => {
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
  
  return (
    <motion.div
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
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <img 
            src={item.imageUrls[0]} 
            alt={item.itemName}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageOff className={`text-muted-foreground ${viewMode === "grid" ? "w-16 h-16" : "w-8 h-8"}`} />
        )}
      </div>

      {/* Content */}
      <div className={viewMode === "grid" ? "p-4" : "flex-1"}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              item.type === "lost" 
                ? "bg-destructive/20 text-destructive" 
                : "bg-success/20 text-success"
            }`}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
            {item.matchScore && item.matchScore > 0 && (
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
          {item.itemName}
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
            {timeAgo}
          </span>
        </div>

        <Button variant="outline" size="sm" className="w-full gap-2">
          <Eye className="w-4 h-4" />
          View Details
        </Button>
      </div>
    </motion.div>
  );
};

const Items = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const [filterType, setFilterType] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  const { items, loading, error, refetch } = useItems();

  const filteredItems = items.filter(item => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading items...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={refetch}>
                Try Again
              </Button>
            </div>
          )}

          {/* Items Grid */}
          {!loading && !error && (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
              : "space-y-4"
            }>
              {filteredItems.map((item, index) => (
                <ItemCard key={item.id} item={item} viewMode={viewMode} index={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                {items.length === 0 
                  ? "No items have been reported yet. Be the first to report!"
                  : "Try adjusting your search or filter criteria"
                }
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
