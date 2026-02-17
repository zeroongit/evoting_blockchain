import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { WalletProvider } from "@/context/WalletContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Voting Blockchain",
  description: "Sistem Pemilihan Aman dengan ZK-SNARKs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
        {/* Pasang Navbar di sini, di atas children */}
          <Navbar />
          {children}
        </WalletProvider>
        
        {/* Konten halaman akan muncul di bawah Navbar */}
      </body>
    </html>
  );
}