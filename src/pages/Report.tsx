import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, MapPin, Calendar, Tag, FileText, Camera, 
  Sparkles, CheckCircle, AlertCircle, Loader2 
} from "lucide-react";
import { useAuth } from "@/contexts/PhpAuthContext";
import { createItem, generateItemQRCode } from "@/services/phpItemService";
import { matchesApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { ItemFormData } from "@/types/item";

const categoryKeys = [
  "electronics", "bagsWallets", "documents", "keys", "clothing", 
  "jewelry", "books", "sportsEquipment", "other"
];

const Report = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialType = searchParams.get("type") || "lost";
  const [reportType, setReportType] = useState<"lost" | "found">(initialType as "lost" | "found");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ItemFormData>({
    itemName: "",
    category: "",
    description: "",
    location: "",
    date: "",
    images: [],
    contactEmail: user?.email || "",
    contactPhone: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (formData.images.length + newFiles.length > 5) {
        toast({
          title: t("validation.tooManyImages"),
          description: t("validation.maxImagesAllowed"),
          variant: "destructive",
        });
        return;
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles]
      }));
    }
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.itemName.trim()) {
        toast({ title: t("report.itemName") + " " + t("validation.required"), variant: "destructive" });
        return false;
      }
      if (!formData.category) {
        toast({ title: t("validation.selectCategory"), variant: "destructive" });
        return false;
      }
      if (!formData.description.trim()) {
        toast({ title: t("report.description") + " " + t("validation.required"), variant: "destructive" });
        return false;
      }
    }
    if (step === 2) {
      if (!formData.location.trim()) {
        toast({ title: t("validation.locationRequired"), variant: "destructive" });
        return false;
      }
      if (!formData.date) {
        toast({ title: t("validation.dateRequired"), variant: "destructive" });
        return false;
      }
    }
    if (step === 3) {
      if (!formData.contactEmail.trim()) {
        toast({ title: t("validation.emailRequired"), variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => Math.min(3, prev + 1));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep() || !user) return;
    
    setIsSubmitting(true);
    try {
      const itemId = await createItem(
        formData, 
        reportType, 
        user.id,
        user.email || "",
        user.full_name || "Anonymous"
      );
      
      // Generate QR code for the item
      await generateItemQRCode(itemId);
      
      // Run auto-matching to find potential matches
      try {
        const matchResult = await matchesApi.autoMatch(itemId);
        if (matchResult.matches_found > 0) {
          toast({
            title: t("report.matchesFound"),
            description: t("report.matchesFoundDesc", { count: matchResult.matches_found }),
          });
        }
      } catch (matchError) {
        console.log("Auto-matching skipped:", matchError);
      }
      
      toast({
        title: t("report.reportSubmitted"),
        description: t("report.itemReported", { type: reportType }),
      });
      navigate("/items");
    } catch (error: any) {
      toast({
        title: t("report.submissionFailed"),
        description: error.message || "Could not submit your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                {reportType === "lost" ? t("report.reportLost") : t("report.reportFound")}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {reportType === "lost" ? t("report.lostSomething") : t("report.foundSomething")}
            </h1>
            <p className="text-muted-foreground">
              {reportType === "lost" ? t("report.lostDesc") : t("report.foundDesc")}
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
              {t("report.lostItem")}
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
              {t("report.foundItem")}
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
              <span>{t("report.itemDetails")}</span>
              <span>{t("report.locationTime")}</span>
              <span>{t("report.contactInfo")}</span>
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
                  {t("report.itemDetails")}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t("report.itemName")} *</label>
                    <Input
                      placeholder={t("report.itemNamePlaceholder")}
                      value={formData.itemName}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t("report.category")} *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {categoryKeys.map((catKey) => (
                        <button
                          key={catKey}
                          onClick={() => setFormData(prev => ({ ...prev, category: catKey }))}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            formData.category === catKey
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                          }`}
                        >
                          {t(`categories.${catKey}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t("report.description")} *</label>
                    <textarea
                      placeholder={t("report.descriptionPlaceholder")}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-32 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Camera className="w-4 h-4 inline mr-1" />
                      {t("report.uploadImages")}
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
                          {t("report.clickToUpload")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("report.maxImages")}
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
                  {t("report.locationTime")}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {reportType === "lost" ? t("report.whereLost") : t("report.whereFound")} *
                    </label>
                    <Input
                      placeholder={t("report.locationPlaceholder")}
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t("report.dateTime")} *
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
                        <p className="font-medium text-sm mb-1">{t("report.aiLocation")}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("report.aiLocationDesc")}
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
                  {t("report.contactInfo")}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t("report.emailAddress")} *</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t("report.phoneNumber")}</label>
                    <Input
                      type="tel"
                      placeholder="+255 123 456 789"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{t("report.privacyNote")}</span> {t("report.privacyNoteDesc")}
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
                disabled={step === 1 || isSubmitting}
              >
                {t("report.previous")}
              </Button>
              
              {step < 3 ? (
                <Button
                  variant="neon"
                  onClick={handleNext}
                >
                  {t("report.continue")}
                </Button>
              ) : (
                <Button 
                  variant="neon" 
                  className="gap-2" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isSubmitting ? t("report.submitting") : t("report.submitAndFind")}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Report;
