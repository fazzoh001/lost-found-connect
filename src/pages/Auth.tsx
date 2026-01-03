import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Smartphone, Key, Wallet, Package, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/PhpAuthContext";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { passwordSchema, validatePasswordStrength } from "@/lib/passwordValidation";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

// Floating icons for decoration
const floatingIcons = [
  { Icon: Smartphone, delay: 0, x: "10%", y: "20%" },
  { Icon: Key, delay: 0.5, x: "85%", y: "15%" },
  { Icon: Wallet, delay: 1, x: "15%", y: "75%" },
  { Icon: Package, delay: 1.5, x: "80%", y: "70%" },
  { Icon: MapPin, delay: 2, x: "5%", y: "45%" },
  { Icon: Zap, delay: 2.5, x: "90%", y: "45%" },
];

const FloatingIcon = ({ Icon, delay, x, y }: { Icon: any; delay: number; x: string; y: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.1, 0.3, 0.1],
      scale: [0.8, 1, 0.8],
      y: [0, -20, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
  >
    <div className="w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20">
      <Icon className="w-6 h-6 text-primary/50" />
    </div>
  </motion.div>
);

const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/dashboard";
  
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);
  
  const passwordStrength = validatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: t("auth.welcomeBack"),
          description: t("auth.signInSuccess"),
        });
      } else {
        if (!name.trim()) {
          toast({
            title: t("auth.fullName"),
            description: t("validation.enterFullName"),
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Validate password strength for signup
        const passwordValidation = passwordSchema.safeParse(password);
        if (!passwordValidation.success) {
          toast({
            title: t("validation.weakPassword"),
            description: passwordValidation.error.errors[0].message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        toast({
          title: t("auth.accountCreated"),
          description: t("auth.welcomeToFindIt"),
        });
      }
    } catch (error: any) {
      let errorMessage = t("validation.somethingWrong");
      
      if (error.message?.includes("already registered")) {
        errorMessage = t("validation.emailRegistered");
      } else if (error.message?.includes("Invalid login")) {
        errorMessage = t("validation.invalidCredentials");
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t("auth.authError"),
        description: errorMessage,
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-[150px]" />
      </div>

      {/* Floating Icons */}
      {floatingIcons.map((item, index) => (
        <FloatingIcon key={index} {...item} />
      ))}

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10,
            }}
            animate={{
              y: -10,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear",
            }}
          />
        ))}
      </div>

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
          {/* Tabs */}
          <div className="flex mb-8 p-1 bg-secondary rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.signIn")}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.signUp")}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
              onSubmit={handleSubmit}
            >
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl font-bold mb-2">
                  {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isLogin ? t("auth.signInToContinue") : t("auth.joinThousands")}
                </p>
              </div>

              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("auth.fullName")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12"
                  />
                </div>
              )}

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

              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.password")}
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
                {!isLogin && (
                  <PasswordStrengthIndicator strength={passwordStrength} show={password.length > 0} />
                )}
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-border bg-secondary" />
                    <span className="text-muted-foreground">{t("auth.rememberMe")}</span>
                  </label>
                  <Link to="/forgot-password" className="text-primary hover:underline">
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              )}

              <Button variant="neon" size="lg" className="w-full group" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? t("auth.signIn") : t("auth.createAccount")}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? t("auth.dontHaveAccount") + " " : t("auth.alreadyHaveAccount") + " "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? t("auth.signUp") : t("auth.signIn")}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
