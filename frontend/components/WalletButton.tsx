"use clinet";

import { useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

export default function WalletButton({ onConnect}: { onConnect?: (address: string) => void }) {
    const [address, setAddress] = useState<string>("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        checkConnection();
    }, []);

    async function checkConnection() {
        if (typeof window !== "undefined" && (window as any).ethereum) {
            const Client = createWalletClient({
                chain: sepolia,
                transport: custom((window as any).ethereum),
            });

            const [accounts] = await Client.requestAddresses();
            if (accounts) {
                setAddress(accounts);
                if (onConnect) onConnect(accounts);
            }
        }
    }

    async function connectWallet() {
        setIsConnecting(true);
        setError("");
        try {
            if (typeof window === "undefined" || !(window as any).ethereum) {
                throw new Error("MetaMask is not installed. Please install it to use this app.");
            }

            const Client = createWalletClient({
                chain: sepolia,
                transport: custom((window as any).ethereum),
            });
            
            const [accounts] = await Client.requestAddresses();

            const chainId = await Client.getChainId();
            if (chainId !== sepolia.id) {
                try {
                    await (window as any).ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${sepolia.id.toString(16)}` }],
                    });
                }catch (switchError: any) {
                    if (switchError.code === 4902) {
                        setError("Please add the Sepolia network to your MetaMask.");
                        } else {
                        throw new Error("Failed to switch to the Sepolia network.");
                    }
                    
                }
            }

            setAddress(accounts);
            if (onConnect) onConnect(accounts);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsConnecting(false);
        }
    }

    return (
        <div className="flex flex-col items-cnter gap-2">
            {!address ? (
            <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"> 
                {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
            ) : (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded border border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="font-mono text-sm">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

    )
}