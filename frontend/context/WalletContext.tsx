"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  userAddress: string;
  setUserAddress: (addr: string) => void;
  walletProvider: any;
  setWalletProvider: (provider: any) => void;
}

// Buat Context-nya
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider ini yang akan membungkus seluruh aplikasi kita
export function WalletProvider({ children }: { children: ReactNode }) {
  const [userAddress, setUserAddress] = useState("");
  const [walletProvider, setWalletProvider] = useState<any>(null);

  return (
    <WalletContext.Provider value={{ userAddress, setUserAddress, walletProvider, setWalletProvider }}>
      {children}
    </WalletContext.Provider>
  );
}

// Fungsi hook bantuan agar mudah dipanggil di komponen lain
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet harus digunakan di dalam WalletProvider");
  }
  return context;
}