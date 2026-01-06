import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { authApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { passwordSchema, validatePasswordStrength } from "@/lib/passwordValidation";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const passwordStrength = validatePasswordStrength(password);

  useEffect(() => {
    if (!token) {
      toast({
        title: t("auth.invalidResetLink"),
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [token, navigate, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t("validation.passwordsMustMatch"),
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      toast({
        title: t("validation.weakPassword"),
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await authApi.resetPassword(token, password);
      setIsSuccess(true);
      toast({
        title: t("auth.passwordReset"),
        description: t("auth.canNowLogin"),
      });
    } catch (error: any) {
      toast({
        title: t("auth.resetFailed"),
        description: error.message || t("validation.somethingWrong"),
        variant: "destructive",
      });
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
                {t("auth.passwordReset")}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {t("auth.canNowLogin")}
              </p>
              <Link to="/auth">
                <Button variant="neon" className="gap-2">
                  {t("auth.signIn")}
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl font-bold mb-2">
                  {t("auth.resetPassword")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t("auth.enterNewPassword")}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.newPassword")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator strength={passwordStrength} show={password.length > 0} />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12"
                  />
                </div>

                <Button variant="neon" size="lg" className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t("auth.resetPassword")
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

export default ResetPassword;
