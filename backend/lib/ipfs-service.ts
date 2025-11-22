// Complete IPFS service for election data management
import { create, type IPFSHTTPClient } from "ipfs-http-client"

interface ElectionData {
  id: number
  title: string
  description: string
  candidates: {
    id: number
    name: string
    bio: string
    platform: string
  }[]
  metadata: {
    startTime: number
    endTime: number
    totalVoters: number
    requiresHumanity: boolean
  }
}

interface VoteRecord {
  electionId: number
  timestamp: number
  voteHash: string
  nullifier: string
}

class IPFSService {
  private client: IPFSHTTPClient | null = null

  constructor() {
    this.initializeClient()
  }

  private async initializeClient() {
    if (!this.client) {
      const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID
      const projectSecret = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET

      if (!projectId || !projectSecret) {
        throw new Error("IPFS credentials not configured")
      }

      const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64")

      this.client = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
          authorization: auth,
        },
      })
    }
  }

  async uploadElectionData(electionData: ElectionData): Promise<string> {
    await this.initializeClient()
    if (!this.client) throw new Error("IPFS client not initialized")

    try {
      const jsonString = JSON.stringify(electionData, null, 2)
      const buffer = Buffer.from(jsonString)

      const result = await this.client.add(buffer, {
        wrapWithDirectory: false,
      })

      console.log(`Election data uploaded to IPFS: ${result.path}`)
      return result.path
    } catch (error) {
      console.error("Failed to upload election data to IPFS:", error)
      throw error
    }
  }

  async uploadCandidateInfo(
    candidateId: number,
    candidateData: {
      name: string
      bio: string
      platform: string
      image?: string
    },
  ): Promise<string> {
    await this.initializeClient()
    if (!this.client) throw new Error("IPFS client not initialized")

    try {
      const jsonString = JSON.stringify(candidateData, null, 2)
      const buffer = Buffer.from(jsonString)

      const result = await this.client.add(buffer)
      console.log(`Candidate ${candidateId} data uploaded: ${result.path}`)
      return result.path
    } catch (error) {
      console.error("Failed to upload candidate data:", error)
      throw error
    }
  }

  async uploadVoteRecord(voteRecord: VoteRecord): Promise<string> {
    await this.initializeClient()
    if (!this.client) throw new Error("IPFS client not initialized")

    try {
      const jsonString = JSON.stringify(voteRecord, null, 2)
      const buffer = Buffer.from(jsonString)

      const result = await this.client.add(buffer)
      return result.path
    } catch (error) {
      console.error("Failed to upload vote record:", error)
      throw error
    }
  }

  async downloadElectionData(ipfsHash: string): Promise<ElectionData> {
    await this.initializeClient()
    if (!this.client) throw new Error("IPFS client not initialized")

    try {
      let data = ""

      for await (const chunk of this.client.cat(ipfsHash)) {
        data += new TextDecoder().decode(chunk)
      }

      return JSON.parse(data)
    } catch (error) {
      console.error("Failed to download election data from IPFS:", error)
      throw error
    }
  }

  async downloadData(ipfsHash: string): Promise<any> {
    await this.initializeClient()
    if (!this.client) throw new Error("IPFS client not initialized")

    try {
      let data = ""

      for await (const chunk of this.client.cat(ipfsHash)) {
        data += new TextDecoder().decode(chunk)
      }

      return JSON.parse(data)
    } catch (error) {
      console.error("Failed to download data from IPFS:", error)
      throw error
    }
  }

  async pinData(ipfsHash: string): Promise<void> {
    await this.initializeClient()
    if (!this.client) throw new Error("IPFS client not initialized")

    try {
      await this.client.pin.add(ipfsHash)
      console.log(`Pinned ${ipfsHash} to IPFS`)
    } catch (error) {
      console.error("Failed to pin data:", error)
      throw error
    }
  }

  async unpinData(ipfsHash: string): Promise<void> {
    await this.initializeClient()
    if (!this.client) throw new Error("IPFS client not initialized")

    try {
      await this.client.pin.rm(ipfsHash)
      console.log(`Unpinned ${ipfsHash} from IPFS`)
    } catch (error) {
      console.error("Failed to unpin data:", error)
      throw error
    }
  }

  getGatewayURL(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  }
}

// Singleton instance
export const ipfsService = new IPFSService()
