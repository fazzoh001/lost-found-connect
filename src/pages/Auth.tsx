import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Github, Chrome } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-20">
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
          {/* Tabs */}
          <div className="flex mb-8 p-1 bg-secondary rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isLogin ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
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
            >
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl font-bold mb-2">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Sign in to continue to your dashboard" : "Join thousands finding their lost items"}
                </p>
              </div>

              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full Name"
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
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-border bg-secondary" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button variant="neon" size="lg" className="w-full group">
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="glass" className="w-full">
                  <Chrome className="w-5 h-5" />
                  Google
                </Button>
                <Button variant="glass" className="w-full">
                  <Github className="w-5 h-5" />
                  GitHub
                </Button>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
