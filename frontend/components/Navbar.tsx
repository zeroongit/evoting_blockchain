"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";
import { useState }  from "react";

export default function Navbar() {
    const pathname = usePathname();

    const [navAddress, setNavAddress] = useState("");

    const navLinks = [
        { name: "Home", href: "/" },
        {name : "Bilik Suara (vote)", href: "/vote" },
        {name: "Hasil Pemilihan", href: "/results" },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-71xl mx-auto px-4 sm:px-6 lg:px8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                V
                            </div>
                            <span className="font-bold text-xl text-gray-800 hidden sm:block">
                                E-voting Pemilu
                            </span>
                        </Link>
                    </div>

                    <div className="hidden sm:flex sm:space-x-8 items-center">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors ${isActive ? "border-indigo-500 text-gray-900": "border-transparent text-gray-500 hover:border-gray-300 hover:text=gray-700"}`}>
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center">
                        <WalletButton onConnect={(addr) => setNavAddress(addr)} />
                    </div>
                </div>
            </div>

            <div className="sm:hidden flex justify-around border-t border-t border-gray-100 py-2">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`text-xs font-medium ${pathname === link.href ? "text-indigo-600" : "text-gray-500"}`}>
                        {link.name}
                    </Link>
                ))}
            </div>
        </nav>
    );
};