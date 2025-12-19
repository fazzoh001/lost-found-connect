import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ItemQRCodeProps {
  itemId: string;
  itemName: string;
}

export const ItemQRCode = ({ itemId, itemName }: ItemQRCodeProps) => {
  const { t } = useTranslation();
  const qrUrl = `${window.location.origin}/items/${itemId}`;

  const handleDownload = () => {
    const svg = document.getElementById(`qr-${itemId}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${itemName}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: itemName,
        text: t("qr.scanToReport"),
        url: qrUrl,
      });
    } else {
      navigator.clipboard.writeText(qrUrl);
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-card text-center">
      <div className="bg-white p-4 rounded-xl inline-block mb-4">
        <QRCodeSVG
          id={`qr-${itemId}`}
          value={qrUrl}
          size={180}
          level="H"
          includeMargin
        />
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t("qr.scanToReport")}</p>
      <div className="flex gap-2 justify-center">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-1" />
          {t("qr.downloadQR")}
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-1" />
          {t("qr.shareQR")}
        </Button>
      </div>
    </div>
  );
};
