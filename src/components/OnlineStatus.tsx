import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const OnlineStatus = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <WifiOff className="w-4 h-4" />
          You're offline. Some features may be limited.
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const OnlineIndicator = () => {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex items-center gap-1.5">
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-destructive" />
      )}
      <span className={`text-xs ${isOnline ? "text-green-500" : "text-destructive"}`}>
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
};
