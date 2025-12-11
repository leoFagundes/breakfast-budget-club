"use client";
import { useAlert, AlertProps } from "@/app/context/alertContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Alert() {
  const { alerts } = useAlert();

  return (
    <div className="fixed top-5 right-5 flex flex-col gap-3 z-100 ml-5">
      <AnimatePresence>
        {alerts.map((alert: AlertProps) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl px-4 py-3 shadow-lg font-medium
              ${alert.type === "success" ? "bg-hbl-green text-white" : ""}
              ${alert.type === "error" ? "bg-orange-600 text-white" : ""}
              ${alert.type === "info" ? "bg-cyan-600 text-white" : ""}
              ${alert.type === "warning" ? "bg-amber-600 text-white" : ""}
            `}
          >
            {alert.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
