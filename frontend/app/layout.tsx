import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Import Navbar

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
        {/* Pasang Navbar di sini, di atas children */}
        <Navbar />
        
        {/* Konten halaman akan muncul di bawah Navbar */}
        {children}
      </body>
    </html>
  );
}