import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Brain, Zap, Shield, Bell, MapPin, Users } from "lucide-react";

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