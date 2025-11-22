import { createPublicClient, createWalletClient, http } from "viem"
import { mainnet } from "viem/chains"

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.SEPOLIA_RPC_URL),
})

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(process.env.SEPOLIA_RPC_URL),
})
