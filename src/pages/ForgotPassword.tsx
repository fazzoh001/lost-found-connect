import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { authApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: t("validation.emailRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
      toast({
        title: t("auth.resetEmailSent"),
        description: t("auth.checkYourEmail"),
      });
    } catch (error: any) {
      // Still show success to prevent email enumeration
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-20">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center neon-glow-sm">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl gradient-text">FindIt</span>
        </Link>

        {/* Card */}
        <div className="glass-card p-8 rounded-3xl neon-glow-sm">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="font-display text-xl font-bold mb-2">
                {t("auth.checkYourEmail")}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {t("auth.resetInstructions")}
              </p>
              <Link to="/auth">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t("auth.backToLogin")}
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl font-bold mb-2">
                  {t("auth.forgotPassword")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t("auth.enterEmailForReset")}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t("auth.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12"
                  />
                </div>

                <Button variant="neon" size="lg" className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t("auth.sendResetLink")
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/auth" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
