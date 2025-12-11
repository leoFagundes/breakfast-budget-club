"use client";
import { createContext, useContext, useState, useCallback } from "react";

type AlertType = "success" | "error" | "info" | "warning";

export interface AlertProps {
  id: number;
  message: string;
  type: AlertType;
}

interface AlertContextProps {
  alerts: AlertProps[];
  showAlert: (message: string, type?: AlertType, duration?: number) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);

  const showAlert = useCallback(
    (message: string, type: AlertType = "info", duration = 3000) => {
      const id = Date.now();
      const newAlert = { id, message, type };
      setAlerts((prev) => [...prev, newAlert]);

      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, duration);
    },
    []
  );

  return (
    <AlertContext.Provider value={{ alerts, showAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context)
    throw new Error("useAlert deve ser usado dentro de AlertProvider");
  return context;
};
