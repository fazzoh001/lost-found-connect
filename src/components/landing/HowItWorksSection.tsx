import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FileText, Brain, Bell, Handshake } from "lucide-react";

export const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: FileText,
      titleKey: "howItWorks.step1Title",
      descKey: "howItWorks.step1Desc",
      step: "01",
    },
    {
      icon: Brain,
      titleKey: "howItWorks.step2Title",
      descKey: "howItWorks.step2Desc",
      step: "02",
    },
    {
      icon: Bell,
      titleKey: "howItWorks.step3Title",
      descKey: "howItWorks.step3Desc",
      step: "03",
    },
    {
      icon: Handshake,
      titleKey: "howItWorks.step4Title",
      descKey: "howItWorks.step4Desc",
      step: "04",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t("howItWorks.sectionTitle")}</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            {t("howItWorks.title")} <span className="gradient-text">{t("howItWorks.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("howItWorks.description")}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-7xl font-display font-bold text-primary/10">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="relative z-10 w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center mb-6 neon-glow-sm">
                  <step.icon className="w-10 h-10 text-white" />
                </div>

                <h3 className="font-display text-xl font-semibold mb-3">{t(step.titleKey)}</h3>
                <p className="text-muted-foreground">{t(step.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};