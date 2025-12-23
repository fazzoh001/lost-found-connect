import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Zap, Github, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-glass-border bg-card/30 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center neon-glow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">
                FindIt
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/items?type=lost" className="hover:text-primary transition-colors">{t("footer.lostItems")}</Link></li>
              <li><Link to="/items?type=found" className="hover:text-primary transition-colors">{t("footer.foundItems")}</Link></li>
              <li><Link to="/report" className="hover:text-primary transition-colors">{t("footer.reportItem")}</Link></li>
              <li><Link to="/matching" className="hover:text-primary transition-colors">{t("footer.aiMatching")}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">{t("footer.faq")}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t("footer.contactUs")}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">{t("footer.privacyPolicy")}</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">{t("footer.termsOfService")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.contact")}</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@findit.app</span>
              </div>
              <p>
                University of Technology<br />
                ICT Department<br />
                Final Year Project 2024
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-glass-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};