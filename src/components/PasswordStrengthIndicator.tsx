import { Check, X } from "lucide-react";
import { PasswordStrength } from "@/lib/passwordValidation";
import { useTranslation } from "react-i18next";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  show: boolean;
}

export const PasswordStrengthIndicator = ({ strength, show }: PasswordStrengthIndicatorProps) => {
  const { t } = useTranslation();

  if (!show) return null;

  const requirements = [
    { key: "minLength", label: t("validation.passwordMinLength") },
    { key: "hasUppercase", label: t("validation.passwordUppercase") },
    { key: "hasLowercase", label: t("validation.passwordLowercase") },
    { key: "hasNumber", label: t("validation.passwordNumber") },
    { key: "hasSpecial", label: t("validation.passwordSpecial") },
  ];

  return (
    <div className="mt-2 p-3 rounded-lg bg-secondary/50 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("validation.passwordStrength")}</span>
        <span className={`font-medium ${
          strength.label === "Strong" ? "text-success" : 
          strength.label === "Medium" ? "text-warning" : "text-destructive"
        }`}>
          {t(`validation.strength${strength.label}`)}
        </span>
      </div>
      
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= strength.score ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-1 mt-2">
        {requirements.map(({ key, label }) => {
          const passed = strength.checks[key as keyof typeof strength.checks];
          return (
            <div key={key} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check className="w-3 h-3 text-success" />
              ) : (
                <X className="w-3 h-3 text-muted-foreground" />
              )}
              <span className={passed ? "text-success" : "text-muted-foreground"}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
