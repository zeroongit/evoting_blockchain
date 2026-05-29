"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Bilik Suara (vote)", href: "/vote" },
        { name: "Hasil Pemilihan", href: "/results" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-lg supports-[backdrop-filter]:bg-slate-950/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* LOGO */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                <Image 
                                    src="/images/kpu-logo.png" 
                                    alt="Logo KPU" 
                                    width={24} 
                                    height={24} 
                                    className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                />
                            </div>
                            <span className="font-black text-lg sm:text-xl tracking-[0.15em] uppercase block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 ml-2">
                                E-Voting
                            </span>
                        </Link>
                    </div>

                    {/* MENU DESKTOP */}
                    <div className="hidden sm:flex sm:space-x-8 items-center">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Button
                                    key={link.href}
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        "text-xs font-mono tracking-widest uppercase transition-all duration-300 rounded-full px-6 h-9",
                                        isActive 
                                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-500/20 hover:text-cyan-300" 
                                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    <Link href={link.href}>{link.name}</Link>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* MENU MOBILE */}
            <div className="sm:hidden flex justify-around border-t border-white/10 bg-slate-950/95 backdrop-blur-md py-3 px-2 gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Button
                            key={link.href}
                            variant="ghost"
                            size="sm"
                            asChild
                            className={cn(
                                "flex-1 text-[10px] sm:text-xs px-2 font-mono tracking-widest uppercase rounded-full transition-all h-9",
                                isActive 
                                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <Link href={link.href}>{link.name}</Link>
                        </Button>
                    );
                })}
            </div>
        </nav>
    );
}