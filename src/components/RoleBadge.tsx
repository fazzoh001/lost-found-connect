import { Shield, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RoleBadgeProps {
  isAdmin: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export const RoleBadge = ({ isAdmin, size = "sm", showLabel = true }: RoleBadgeProps) => {
  const { t } = useTranslation();
  
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const badgeSize = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  
  if (isAdmin) {
    return (
      <span className={`inline-flex items-center gap-1 ${badgeSize} rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 text-neon-purple border border-neon-purple/30 font-medium`}>
        <Shield className={iconSize} />
        {showLabel && t("roles.admin", "Admin")}
      </span>
    );
  }
  
  return (
    <span className={`inline-flex items-center gap-1 ${badgeSize} rounded-full bg-secondary text-muted-foreground border border-border font-medium`}>
      <User className={iconSize} />
      {showLabel && t("roles.user", "User")}
    </span>
  );
};
