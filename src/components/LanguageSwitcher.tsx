import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="gap-2">
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        <DropdownMenuItem 
          onClick={() => changeLanguage("en")}
          className={i18n.language === "en" ? "bg-primary/20" : ""}
        >
          🇺🇸 {t("language.en")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("sw")}
          className={i18n.language === "sw" ? "bg-primary/20" : ""}
        >
          🇹🇿 {t("language.sw")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
