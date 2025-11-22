import { describe, it } from "node:test"
import assert from "node:assert"
import hre from "hardhat"
import { encodeAbiParameters, parseAbiParameters } from 'viem'

const { viem, networkHelpers } = await hre.network.connect()

// --- HELPER: Membuat Dummy Proof yang Valid secara Struktur ---
function generateDummyProof() {
  // Struktur Proof SnarkJS: a[2], b[2][2], c[2]
  const a: [bigint, bigint] = [BigInt(1), BigInt(2)];
  const b: [[bigint, bigint], [bigint, bigint]] = [[BigInt(1), BigInt(2)], [BigInt(3), BigInt(4)]];
  const c: [bigint, bigint] = [BigInt(1), BigInt(2)];

  // Encode menjadi bytes agar bisa diterima oleh abi.decode di smart contract
  return encodeAbiParameters(
    parseAbiParameters('uint256[2], uint256[2][2], uint256[2]'),
    [a, b, c]
  );
}

describe("EVoting", () => {
  async function deployEVotingFixture() {
    // --- UBAH DI SINI ---
    // Ganti "VoterVerifier" menjadi "MockVerifier"
    const voterVerifier = await viem.deployContract("MockVerifier")
    // Gunakan mock yang sama untuk semua verifier lainnya
    const voteVerifier = voterVerifier 
    const humanityVerifier = voterVerifier
    const authorityVerifier = voterVerifier

    // Deploy EVoting contract
    const evoting = await viem.deployContract("EVoting", [
      voterVerifier.address,
      voteVerifier.address,
      humanityVerifier.address,
      authorityVerifier.address,
    ])

    const [owner, authority, voter1, voter2] = await viem.getWalletClients()

    return {
      evoting,
      voterVerifier,
      owner,
      authority,
      voter1,
      voter2,
    }
  }

  it("Should create an election", async () => {
    const { evoting } = await networkHelpers.loadFixture(deployEVotingFixture)
    const txHash = await evoting.write.createElection([
      "Presidential Election 2024", "QmHash...", 
      BigInt(Math.floor(Date.now() / 1000)), 
      BigInt(Math.floor(Date.now() / 1000) + 86400), 
      BigInt(5), false
    ])
    assert.ok(txHash)
  })

  it("Should add candidates to election", async () => {
    const { evoting } = await networkHelpers.loadFixture(deployEVotingFixture)
    await evoting.write.createElection([
      "Test Election", "QmHash...", 
      BigInt(Math.floor(Date.now() / 1000)), 
      BigInt(Math.floor(Date.now() / 1000) + 86400), 
      BigInt(3), false
    ])
    const tx = await evoting.write.addCandidate([BigInt(0), "Candidate 1", "QmCandidateHash1..."])
    assert.ok(tx)
  })

  it("Should start and end election", async () => {
    const { evoting } = await networkHelpers.loadFixture(deployEVotingFixture)
    await evoting.write.createElection([
      "Test Election", "QmHash...", 
      BigInt(Math.floor(Date.now() / 1000)), 
      BigInt(Math.floor(Date.now() / 1000) + 86400), 
      BigInt(2), false
    ])
    await viem.assertions.emitWithArgs(evoting.write.startElection([BigInt(0)]), evoting, "ElectionStarted", [BigInt(0)])
    await viem.assertions.emitWithArgs(evoting.write.endElection([BigInt(0)]), evoting, "ElectionEnded", [BigInt(0)])
  })

  // --- PERBAIKAN UTAMA DI SINI ---
  it("Should verify humanity proof", async () => {
    const { evoting, voter1 } = await networkHelpers.loadFixture(deployEVotingFixture)

    // 1. Buat Proof yang sudah di-encode (Bytes)
    const proofBytes = generateDummyProof();

    // 2. Buat Public Signal (Harus Array BigInt, bukan Bytes lagi)
    // Sesuai perbaikan kontrak: verifyHumanity(bytes proof, uint[1] signals)
    const publicSignals: [bigint] = [BigInt(1)];

    const tx = await evoting.write.verifyHumanity([proofBytes, publicSignals], { account: voter1.account })
    assert.ok(tx)
  })

  // --- PERBAIKAN UTAMA DI SINI ---
  it("Should cast vote with valid proof", async () => {
    const { evoting, voter1 } = await networkHelpers.loadFixture(deployEVotingFixture)

    // Setup Election
    await evoting.write.createElection([
      "Test Election", "QmHash...", 
      BigInt(Math.floor(Date.now() / 1000) - 100), 
      BigInt(Math.floor(Date.now() / 1000) + 86400), 
      BigInt(3), false
    ])
    await evoting.write.addCandidate([BigInt(0), "Candidate 1", "QmHash..."])
    await evoting.write.startElection([BigInt(0)])

    // 1. Nullifier (Bytes32)
    const nullifier = "0x" + "a".repeat(64) as `0x${string}`;
    
    // 2. Proof (Encoded Bytes)
    const proofBytes = generateDummyProof();

    const tx = await evoting.write.castVote(
      [BigInt(0), BigInt(0), nullifier, proofBytes], 
      { account: voter1.account }
    )
    assert.ok(tx)
  })

  it("Should prevent double voting with same nullifier", async () => {
    const { evoting, voter1 } = await networkHelpers.loadFixture(deployEVotingFixture)

    await evoting.write.createElection([
      "Test Election", "QmHash...", 
      BigInt(Math.floor(Date.now() / 1000) - 100), 
      BigInt(Math.floor(Date.now() / 1000) + 86400), 
      BigInt(3), false
    ])
    await evoting.write.addCandidate([BigInt(0), "Candidate 1", "QmHash..."])
    await evoting.write.startElection([BigInt(0)])

    const nullifier = "0x" + "a".repeat(64) as `0x${string}`;
    const proofBytes = generateDummyProof();

    // Vote pertama
    await evoting.write.castVote([BigInt(0), BigInt(0), nullifier, proofBytes], { account: voter1.account })

    // Vote kedua (harus gagal)
    await viem.assertions.revertWith(
      evoting.write.castVote([BigInt(0), BigInt(1), nullifier, proofBytes], { account: voter1.account }),
      "Vote already cast",
    )
  })

  it("Should get election results", async () => {
    const { evoting } = await networkHelpers.loadFixture(deployEVotingFixture)
    await evoting.write.createElection([
      "Test Election", "QmHash...", 
      BigInt(Math.floor(Date.now() / 1000) - 100), 
      BigInt(Math.floor(Date.now() / 1000) + 86400), 
      BigInt(2), false
    ])

    const election = await evoting.read.getElection([BigInt(0)]) as { title: string; candidateCount: bigint }
    assert.equal(election.title, "Test Election")
    assert.equal(election.candidateCount, BigInt(2))
  })
})