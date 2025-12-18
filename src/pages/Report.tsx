import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, MapPin, Calendar, Tag, FileText, Camera, 
  Sparkles, CheckCircle, AlertCircle 
} from "lucide-react";

const categories = [
  "Electronics", "Bags & Wallets", "Documents", "Keys", "Clothing", 
  "Jewelry", "Books", "Sports Equipment", "Other"
];

const Report = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "lost";
  const [reportType, setReportType] = useState<"lost" | "found">(initialType as "lost" | "found");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    location: "",
    date: "",
    images: [] as File[],
    contactEmail: "",
    contactPhone: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...Array.from(e.target.files!)]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
              reportType === "lost" 
                ? "bg-destructive/20 text-destructive" 
                : "bg-success/20 text-success"
            }`}>
              {reportType === "lost" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {reportType === "lost" ? "Report Lost Item" : "Report Found Item"}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {reportType === "lost" ? "Lost Something?" : "Found Something?"}
            </h1>
            <p className="text-muted-foreground">
              {reportType === "lost" 
                ? "Provide details about your lost item and our AI will help find matches."
                : "Help someone find their belongings by reporting what you found."}
            </p>
          </motion.div>

          {/* Type Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex p-1 bg-secondary rounded-xl mb-8 max-w-sm mx-auto"
          >
            <button
              onClick={() => setReportType("lost")}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                reportType === "lost" 
                  ? "bg-destructive text-white shadow-lg" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Lost Item
            </button>
            <button
              onClick={() => setReportType("found")}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                reportType === "found" 
                  ? "bg-success text-white shadow-lg" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Found Item
            </button>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-20 md:w-32 h-1 mx-2 rounded ${
                      step > s ? "bg-primary" : "bg-secondary"
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Item Details</span>
              <span>Location & Time</span>
              <span>Contact Info</span>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6 md:p-8 rounded-2xl"
          >
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Item Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Item Name *</label>
                    <Input
                      placeholder="e.g., iPhone 15 Pro, Blue Backpack..."
                      value={formData.itemName}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            formData.category === cat
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      placeholder="Describe the item in detail (color, brand, unique features, serial number if available...)"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-32 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Camera className="w-4 h-4 inline mr-1" />
                      Upload Images
                    </label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 10MB (Max 5 images)
                        </p>
                      </label>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {formData.images.map((file, idx) => (
                          <div key={idx} className="px-3 py-1 bg-secondary rounded-lg text-sm">
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location & Time
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {reportType === "lost" ? "Where did you lose it?" : "Where did you find it?"} *
                    </label>
                    <Input
                      placeholder="e.g., Central Library, Building A Room 101..."
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date & Time *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-1">AI Location Matching</p>
                        <p className="text-xs text-muted-foreground">
                          Our AI will use this location data to find items reported nearby, 
                          increasing your chances of a successful match.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Contact Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Privacy Note:</span> Your contact information 
                      will only be shared with verified matches after your approval.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < 3 ? (
                <Button
                  variant="neon"
                  onClick={() => setStep(prev => Math.min(3, prev + 1))}
                >
                  Continue
                </Button>
              ) : (
                <Button variant="neon" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Submit & Find Matches
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Report;
