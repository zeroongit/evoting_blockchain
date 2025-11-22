import { type HardhatUserConfig, defineConfig } from "hardhat/config"
import hardhatViem from "@nomicfoundation/hardhat-viem"
import hardhatViemAssertions from "@nomicfoundation/hardhat-viem-assertions"
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner"
import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers"
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import dotenv from "dotenv"


dotenv.config()

const config: HardhatUserConfig = defineConfig({
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  plugins: [hardhatViem, hardhatViemAssertions, hardhatNodeTestRunner, hardhatNetworkHelpers, hardhatVerify],
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/0657d24a0c8444fb807b13aa6d7cec05",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 180000,
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./artifacts",
  },
})

export default config
