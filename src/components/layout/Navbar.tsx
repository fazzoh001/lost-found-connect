import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Menu, X, Zap, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/PhpAuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RoleBadge } from "@/components/RoleBadge";

export const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, signOut, isAdmin } = useAuth();

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.lostItems"), path: "/items?type=lost" },
    { name: t("nav.foundItems"), path: "/items?type=found" },
    { name: t("nav.dashboard"), path: "/dashboard" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-glass-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center neon-glow-sm group-hover:neon-glow transition-all duration-300">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">
              FindIt
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            {user ? (
              <>
                <RoleBadge isAdmin={isAdmin} />
                <Link to="/profile">
                  <Button variant="ghost" size="icon" title={t("nav.profile", "Profile")}>
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/report">
                  <Button variant="neon">{t("nav.reportItem")}</Button>
                </Link>
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline">{t("nav.signIn")}</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-card border-t border-glass-border"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <div className="flex justify-center pb-2">
                    <RoleBadge isAdmin={isAdmin} size="md" />
                  </div>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      {t("nav.profile", "Profile Settings")}
                    </Button>
                  </Link>
                  <Link to="/report" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="neon" className="w-full">{t("nav.reportItem")}</Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-1" />
                    {t("nav.signOut")}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">{t("nav.signIn")}</Button>
                  </Link>
                  <Link to="/report" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="neon" className="w-full">{t("nav.reportItem")}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};
