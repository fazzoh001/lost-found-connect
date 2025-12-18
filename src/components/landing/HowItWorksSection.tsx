import { motion } from "framer-motion";
import { FileText, Brain, Bell, Handshake } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Report Your Item",
    description: "Submit detailed information about your lost or found item including photos, description, and location.",
    step: "01",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our intelligent algorithm processes and compares your item against our database in real-time.",
    step: "02",
  },
  {
    icon: Bell,
    title: "Get Matched",
    description: "Receive instant notifications when potential matches are found with confidence scores.",
    step: "03",
  },
  {
    icon: Handshake,
    title: "Connect & Recover",
    description: "Securely communicate with the finder/owner and arrange a safe return of the item.",
    step: "04",
  },
];

export const HowItWorksSection = () => {
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
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Process</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our streamlined process makes finding and recovering items simple and efficient.
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

                <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
