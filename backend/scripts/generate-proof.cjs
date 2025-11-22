// Generate ZK proofs for e-voting

const snarkjs = require("snarkjs")
const fs = require("fs")
const path = require("path")

class ZKProofGenerator {
  constructor(circuitName) {
    this.circuitName = circuitName
    this.buildDir = path.join(__dirname, "../build")
  }

  async generateVoterProof(voterId, secret, electionId) {
    const wasmFile = path.join(this.buildDir, `voter-eligibility.wasm`)
    const zkeyFile = path.join(this.buildDir, `voter-eligibility_pkey.json`)

    const input = {
      voter_id: voterId,
      secret: secret,
      election_id: electionId,
    }

    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmFile, zkeyFile)

      return {
        proof,
        publicSignals,
        commitment: publicSignals[0],
        nullifier: publicSignals[1],
      }
    } catch (error) {
      console.error("Proof generation failed:", error)
      throw error
    }
  }

  async generateVoteProof(commitment, nullifier, voteHash, electionId, voterId, secret, candidateId, candidateCount) {
    const wasmFile = path.join(this.buildDir, `vote-casting.wasm`)
    const zkeyFile = path.join(this.buildDir, `vote-casting_pkey.json`)

    const input = {
      commitment,
      nullifier,
      vote_hash: voteHash,
      election_id: electionId,
      voter_id: voterId,
      secret: secret,
      candidate_id: candidateId,
      candidate_count: candidateCount,
    }

    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmFile, zkeyFile)

      return {
        proof,
        publicSignals,
        voteCommitment: publicSignals[0],
      }
    } catch (error) {
      console.error("Vote proof generation failed:", error)
      throw error
    }
  }

  async generateHumanityProof(humanScore, uniquenessScore, behaviorProof, timestamp, userId) {
    const wasmFile = path.join(this.buildDir, `proof-of-human.wasm`)
    const zkeyFile = path.join(this.buildDir, `proof-of-human_pkey.json`)

    const input = {
      human_score: humanScore,
      uniqueness_score: uniquenessScore,
      behavior_proof: behaviorProof,
      timestamp: timestamp,
      user_identifier: userId,
    }

    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmFile, zkeyFile)

      return {
        proof,
        publicSignals,
        humanityProof: publicSignals[0],
      }
    } catch (error) {
      console.error("Humanity proof generation failed:", error)
      throw error
    }
  }

  async generateAuthorityProof(officialId, authSecret, electionId, actionHash) {
    const wasmFile = path.join(this.buildDir, `proof-of-authority.wasm`)
    const zkeyFile = path.join(this.buildDir, `proof-of-authority_pkey.json`)

    const input = {
      official_id: officialId,
      authority_secret: authSecret,
      election_id: electionId,
      action_hash: actionHash,
    }

    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmFile, zkeyFile)

      return {
        proof,
        publicSignals,
        authorityProof: publicSignals[0],
      }
    } catch (error) {
      console.error("Authority proof generation failed:", error)
      throw error
    }
  }

  async verifyProof(proof, publicSignals, circuitName) {
    const vkeyFile = path.join(this.buildDir, `${circuitName}_vkey.json`)
    const vkey = JSON.parse(fs.readFileSync(vkeyFile, "utf8"))

    try {
      const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof)
      return verified
    } catch (error) {
      console.error("Proof verification failed:", error)
      return false
    }
  }
}

module.exports = ZKProofGenerator
