/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState } from "react";
import { UUIDTypes, v4 as uuidv4 } from "uuid";
import ToastContainer from "../components/Toast/ToastContainer";
import { Toast } from "../lib/types/toast.type";

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext({
  addToast: (message = "", type = "info", duration = 3000) => {},
  removeToast: (id: UUIDTypes | number) => {},
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message = "", type = "info", duration = 3000) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type, duration }] as Toast[]);
  };

  const removeToast = (id: UUIDTypes | number) => {
    setToasts((prev) => prev.filter((toast) => toast?.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
