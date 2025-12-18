import { motion } from "framer-motion";
import { Brain, Zap, Shield, Bell, MapPin, Users } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Our advanced machine learning algorithm analyzes item descriptions, images, and metadata to find the best matches with 95% accuracy.",
    gradient: "from-neon-purple to-neon-pink",
  },
  {
    icon: Zap,
    title: "Real-time Notifications",
    description: "Get instant alerts when a potential match is found. Never miss an opportunity to recover your lost belongings.",
    gradient: "from-neon-pink to-neon-blue",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and protected. We ensure safe communication between finders and owners.",
    gradient: "from-neon-blue to-neon-cyan",
  },
  {
    icon: MapPin,
    title: "Location Tracking",
    description: "GPS-enabled reports help narrow down search areas and improve matching precision based on proximity.",
    gradient: "from-neon-cyan to-success",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Set up custom alerts for specific items. We'll notify you immediately when similar items are reported.",
    gradient: "from-success to-warning",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join thousands of users helping each other recover lost items. Together, we make a difference.",
    gradient: "from-warning to-neon-purple",
  },
];

export const FeaturesSection = () => {
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
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            Why Choose <span className="gradient-text">FindIt</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the future of lost and found with our cutting-edge technology and user-friendly platform.
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
                <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
