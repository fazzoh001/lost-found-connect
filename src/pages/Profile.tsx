import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Mail, Phone, Globe, Camera, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/PhpAuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { useToast } from "@/hooks/use-toast";
import { authApi, uploadApi, profileApi } from "@/services/api";

const Profile = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    preferred_language: "en",
    avatar_url: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await authApi.me();
        if (data.user) {
          setFormData({
            full_name: data.user.full_name || "",
            phone: data.user.phone || "",
            preferred_language: data.user.preferred_language || "en",
            avatar_url: data.user.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    
    loadProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (value: string) => {
    setFormData(prev => ({ ...prev, preferred_language: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadApi.uploadImage(file);
      if (result.url) {
        setFormData(prev => ({ ...prev, avatar_url: result.url }));
        toast({
          title: t("profile.avatarUploaded", "Avatar uploaded"),
          description: t("profile.avatarUploadedDesc", "Your avatar has been updated."),
        });
      }
    } catch (error) {
      toast({
        title: t("profile.uploadError", "Upload failed"),
        description: t("profile.uploadErrorDesc", "Failed to upload avatar. Please try again."),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileApi.update(formData);
      toast({
        title: t("profile.updated", "Profile updated"),
        description: t("profile.updatedDesc", "Your profile has been updated successfully."),
      });
    } catch (error) {
      toast({
        title: t("profile.updateError", "Update failed"),
        description: t("profile.updateErrorDesc", "Failed to update profile. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  {t("profile.title", "Profile Settings")}
                </h1>
                <p className="text-muted-foreground">
                  {t("profile.subtitle", "Manage your account information")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    {t("profile.avatar", "Profile Photo")}
                  </CardTitle>
                  <CardDescription>
                    {t("profile.avatarDesc", "Upload a photo to personalize your profile")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24 border-2 border-primary/20">
                      <AvatarImage src={formData.avatar_url} alt={formData.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white text-2xl">
                        {getInitials(formData.full_name || user?.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                          <Camera className="w-4 h-4" />
                          {uploading ? t("profile.uploading", "Uploading...") : t("profile.changePhoto", "Change Photo")}
                        </div>
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </Label>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t("profile.photoHint", "JPG, PNG or GIF. Max 2MB.")}
                      </p>
                    </div>
                    <RoleBadge isAdmin={isAdmin} size="md" />
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info Section */}
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t("profile.personalInfo", "Personal Information")}
                  </CardTitle>
                  <CardDescription>
                    {t("profile.personalInfoDesc", "Update your personal details")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t("profile.email", "Email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-secondary/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("profile.emailHint", "Email cannot be changed")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t("profile.fullName", "Full Name")}
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder={t("profile.fullNamePlaceholder", "Enter your full name")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t("profile.phone", "Phone Number")}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t("profile.phonePlaceholder", "+1 (555) 000-0000")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {t("profile.language", "Preferred Language")}
                    </Label>
                    <Select
                      value={formData.preferred_language}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.selectLanguage", "Select language")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Kiswahili</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button
                type="submit"
                variant="neon"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? t("profile.saving", "Saving...") : t("profile.saveChanges", "Save Changes")}
              </Button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
