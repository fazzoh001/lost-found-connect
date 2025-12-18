import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/30 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-pink/30 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-8 md:p-16 text-center neon-glow"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Start Your Search Today</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to Find Your{" "}
            <span className="gradient-text">Lost Items</span>?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Join thousands of users who have successfully recovered their belongings using our AI-powered platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/auth">
              <Button variant="neon" size="xl" className="group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/items">
              <Button variant="glass" size="xl">
                Browse Items
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
