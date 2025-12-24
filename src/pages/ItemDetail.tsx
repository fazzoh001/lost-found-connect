import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, MapPin, Calendar, Tag, User, Mail, Phone,
  AlertCircle, CheckCircle, Loader2, ImageOff, Share2
} from "lucide-react";
import { getItemById } from "@/services/itemService";
import { Item } from "@/types/item";
import { formatDistanceToNow, format } from "date-fns";
import { ItemQRCode } from "@/components/ItemQRCode";

const ItemDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getItemById(id);
        setItem(data);
      } catch (err: any) {
        setError(err.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center min-h-[50vh] flex flex-col justify-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">{t("common.error")}</h2>
            <p className="text-muted-foreground mb-4">{error || "Item not found"}</p>
            <Button variant="outline" onClick={() => navigate("/items")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
  const dateFormatted = format(new Date(item.date), "PPP");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Header */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    item.type === "lost" 
                      ? "bg-destructive/20 text-destructive" 
                      : "bg-success/20 text-success"
                  }`}>
                    {item.type === "lost" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {item.type === "lost" ? t("items.lost") : t("items.found")}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{timeAgo}</span>
                </div>

                <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">
                  {item.itemName}
                </h1>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {t(`categories.${item.category}`) || item.category}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dateFormatted}
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="glass-card rounded-2xl overflow-hidden">
                {item.imageUrls && item.imageUrls.length > 0 ? (
                  <img 
                    src={item.imageUrls[0]} 
                    alt={item.itemName}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 md:h-96 flex items-center justify-center bg-secondary/50">
                    <ImageOff className="w-20 h-20 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="font-display text-xl font-semibold mb-4">
                  {t("report.description")}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description || "No description provided."}
                </p>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Status */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">{t("admin.status")}</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  item.status === "matched" ? "bg-success/20 text-success" :
                  item.status === "resolved" ? "bg-primary/20 text-primary" :
                  "bg-warning/20 text-warning"
                }`}>
                  {item.status === "active" ? t("admin.active") : 
                   item.status === "matched" ? t("dashboard.matched") : 
                   t("dashboard.claimed")}
                </div>
              </div>

              {/* QR Code */}
              {item.qrCode && (
                <div className="glass-card p-6 rounded-2xl">
                  <ItemQRCode itemId={item.id} itemName={item.itemName} />
                </div>
              )}

              {/* Actions */}
              <div className="glass-card p-6 rounded-2xl space-y-3">
                <h3 className="font-semibold mb-4">{t("matching.actions")}</h3>
                <Button variant="neon" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  {t("matching.contactFinder")}
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  {t("qr.shareQR")}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ItemDetail;
