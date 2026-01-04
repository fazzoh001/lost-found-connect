import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Brain, Zap, Shield, Bell, MapPin, Users } from "lucide-react";
import featurePhone from "@/assets/feature-phone.png";
import featureSecurity from "@/assets/feature-security.png";
import featureCommunity from "@/assets/feature-community.png";

export const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      titleKey: "features.aiMatching",
      descKey: "features.aiMatchingDesc",
      gradient: "from-neon-purple to-neon-pink",
    },
    {
      icon: Zap,
      titleKey: "features.realtime",
      descKey: "features.realtimeDesc",
      gradient: "from-neon-pink to-neon-blue",
    },
    {
      icon: Shield,
      titleKey: "features.secure",
      descKey: "features.secureDesc",
      gradient: "from-neon-blue to-neon-cyan",
    },
    {
      icon: MapPin,
      titleKey: "features.locationTracking",
      descKey: "features.locationTrackingDesc",
      gradient: "from-neon-cyan to-success",
    },
    {
      icon: Bell,
      titleKey: "features.smartAlerts",
      descKey: "features.smartAlertsDesc",
      gradient: "from-success to-warning",
    },
    {
      icon: Users,
      titleKey: "features.community",
      descKey: "features.communityDesc",
      gradient: "from-warning to-neon-purple",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t("features.sectionTitle")}</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            {t("features.whyChoose")} <span className="gradient-text">FindIt</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("features.whyChooseDesc")}
          </p>
        </motion.div>

        {/* Feature Showcase with Images */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Smart Notifications Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl p-6 hover:neon-glow-sm transition-all duration-300 group"
          >
            <div className="relative h-48 mb-6 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neon-purple/10 to-neon-pink/10">
              <motion.img 
                src={featurePhone} 
                alt="Smart Notifications" 
                className="w-40 h-40 object-contain group-hover:scale-110 transition-transform duration-500"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">{t("features.realtime")}</h3>
            <p className="text-muted-foreground">{t("features.realtimeDesc")}</p>
          </motion.div>

          {/* Security Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card rounded-3xl p-6 hover:neon-glow-sm transition-all duration-300 group"
          >
            <div className="relative h-48 mb-6 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neon-blue/10 to-neon-cyan/10">
              <motion.img 
                src={featureSecurity} 
                alt="Secure Platform" 
                className="w-40 h-40 object-contain group-hover:scale-110 transition-transform duration-500"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">{t("features.secure")}</h3>
            <p className="text-muted-foreground">{t("features.secureDesc")}</p>
          </motion.div>

          {/* Community Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-3xl p-6 hover:neon-glow-sm transition-all duration-300 group"
          >
            <div className="relative h-48 mb-6 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neon-pink/10 to-neon-purple/10">
              <motion.img 
                src={featureCommunity} 
                alt="Community Network" 
                className="w-40 h-40 object-contain group-hover:scale-110 transition-transform duration-500"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">{t("features.community")}</h3>
            <p className="text-muted-foreground">{t("features.communityDesc")}</p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card p-6 rounded-2xl h-full hover:bg-card/60 transition-all duration-300 hover:neon-glow-sm">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground">{t(feature.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
