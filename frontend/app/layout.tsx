import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { WalletProvider } from "@/context/WalletContext";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "E-Voting Pemilu",
  description: "Sistem Pemilu Terdesentralisasi Aman dengan ZK-SNARKs dan AI",
  icons: {
    icon: "/images/kpu-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="font-sans antialiased bg-background text-foreground">
        <WalletProvider>
        {/* Pasang Navbar di sini, di atas children */}
          <Navbar />
          {children}
        </WalletProvider>
        
        {/* Konten halaman akan muncul di bawah Navbar */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}