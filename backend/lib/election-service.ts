// Election management service combining smart contracts and IPFS
import { ipfsService } from "./ipfs-service.js"
import { getEvotingContract } from "./contracts.js"

export interface ElectionDTO {
  title: string
  description: string
  candidates: {
    name: string
    bio: string
    platform: string
  }[]
  startTime: Date
  endTime: Date
  requiresHumanity: boolean
}

export class ElectionService {
  async createElection(electionData: ElectionDTO, authorityAddress: string) {
    try {
      // 1. Upload election data to IPFS
      const ipfsElectionData = {
        id: Date.now(), // or use a better unique id if available
        title: electionData.title,
        description: electionData.description,
        candidates: electionData.candidates.map((candidate, idx) => ({
          id: idx,
          name: candidate.name,
          bio: candidate.bio,
          platform: candidate.platform,
        })),
        metadata: {
          startTime: Math.floor(electionData.startTime.getTime() / 1000),
          endTime: Math.floor(electionData.endTime.getTime() / 1000),
          totalVoters: 0, // set to 0 or actual value if available
          requiresHumanity: electionData.requiresHumanity,
        },
      }

      const electionIPFSHash = await ipfsService.uploadElectionData(ipfsElectionData)

      // 2. Upload candidate information individually
      const candidateIPFSHashes = await Promise.all(
        electionData.candidates.map((candidate) =>
          ipfsService.uploadCandidateInfo(electionData.candidates.indexOf(candidate), candidate),
        ),
      )

      // 3. Create election on smart contract
      const contract = getEvotingContract()
      const startTime = BigInt(Math.floor(electionData.startTime.getTime() / 1000))
      const endTime = BigInt(Math.floor(electionData.endTime.getTime() / 1000))

      const tx = await contract.write.createElection([
        electionData.title,
        electionIPFSHash,
        startTime,
        endTime,
        BigInt(electionData.candidates.length),
        electionData.requiresHumanity,
      ])

      return {
        transactionHash: tx,
        electionIPFSHash,
        candidateIPFSHashes,
      }
    } catch (error) {
      console.error("Failed to create election:", error)
      throw error
    }
  }

  async getElection(electionId: number) {
    try {
      const contract = getEvotingContract()
      const election = await contract.read.getElection([BigInt(electionId)]) as { ipfsHash: string }

      // Download election data from IPFS
      const electionData = await ipfsService.downloadElectionData(election.ipfsHash)

      return {
        onChainData: election,
        offChainData: electionData,
      }
    } catch (error) {
      console.error("Failed to get election:", error)
      throw error
    }
  }

  async castVote(electionId: number, candidateId: number, nullifier: string, proof: string) {
    try {
      const contract = getEvotingContract()
      const tx = await contract.write.castVote([
        BigInt(electionId),
        BigInt(candidateId),
        nullifier as `0x${string}`,
        proof as `0x${string}`,
      ])

      // Optional: Log vote record to IPFS (can be done asynchronously)
      const voteRecord = {
        electionId,
        candidateId,
        timestamp: Math.floor(Date.now() / 1000),
        voteHash: proof,
        nullifier,
      }

      // Store vote record (non-blocking)
      ipfsService.uploadVoteRecord(voteRecord).catch((err) => {
        console.error("Failed to log vote record to IPFS:", err)
      })

      return tx
    } catch (error) {
      console.error("Failed to cast vote:", error)
      throw error
    }
  }

  async getElectionResults(electionId: number) {
    try {
      const contract = getEvotingContract()
      const totalVotes = await contract.read.getTotalVotes([BigInt(electionId)])

      const election = await contract.read.getElection([BigInt(electionId)]) as { candidateCount: number }

      const results = []
      for (let i = 0; i < election.candidateCount; i++) {
        const voteCount = await contract.read.getCandidateVotes([BigInt(electionId), BigInt(i)])
        results.push({
          candidateId: i,
          voteCount: Number(voteCount),
        })
      }

      return {
        electionId,
        totalVotes: Number(totalVotes),
        results,
      }
    } catch (error) {
      console.error("Failed to get election results:", error)
      throw error
    }
  }

  async verifyHumanity(proof: string, publicSignals: string) {
    try {
      const contract = getEvotingContract()
      const tx = await contract.write.verifyHumanity([proof as `0x${string}`, publicSignals as `0x${string}`])
      return tx
    } catch (error) {
      console.error("Failed to verify humanity:", error)
      throw error
    }
  }
}

export const electionService = new ElectionService()
