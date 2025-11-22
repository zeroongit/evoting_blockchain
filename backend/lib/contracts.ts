import { getContract } from "viem"
import { publicClient, walletClient } from "./viem_client.js"

const EVOTING_ADDRESS = process.env.NEXT_PUBLIC_EVOTING_ADDRESS || "0x"

const ABI = [
  {
    name: "createElection",
    type: "function",
    inputs: [
      { name: "_title", type: "string" },
      { name: "_ipfsHash", type: "string" },
      { name: "_startTime", type: "uint256" },
      { name: "_endTime", type: "uint256" },
      { name: "_candidateCount", type: "uint256" },
      { name: "_requireHumanity", type: "bool" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "castVote",
    type: "function",
    inputs: [
      { name: "_electionId", type: "uint256" },
      { name: "_candidateId", type: "uint256" },
      { name: "_nullifier", type: "bytes" },
      { name: "_proof", type: "bytes" },
    ],
  },
  {
    name: "getElection",
    type: "function",
    inputs: [{ name: "_electionId", type: "uint256" }],
    outputs: [{ type: "tuple" }],
  },
]

export function getEvotingContract() {
  return getContract({
    address: EVOTING_ADDRESS as `0x${string}`,
    abi: ABI,
    client: { public: publicClient, wallet: walletClient },
  })
}
