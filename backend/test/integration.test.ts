import { describe, it } from "node:test"
import assert from "node:assert"
import hre from "hardhat"
import { ProofOfHumanService } from "../lib/proof-of-human.js"
import { ProofOfAuthorityService } from "../lib/proof-of-authority.js"
import { encodeAbiParameters, parseAbiParameters } from 'viem'

const { viem, networkHelpers } = await hre.network.connect()

// Helper Proof Generator
function generateDummyProof() {
  const a: [bigint, bigint] = [BigInt(1), BigInt(2)];
  const b: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(1), BigInt(2)],
    [BigInt(3), BigInt(4)]
  ];
  const c: [bigint, bigint] = [BigInt(1), BigInt(2)];
  return encodeAbiParameters(
    parseAbiParameters('uint256[2], uint256[2][2], uint256[2]'),
    [a, b, c]
  );
}

describe("E-Voting Integration Tests", () => {
  async function setupIntegrationTest() {
    // --- UBAH DI SINI ---
    // Jangan deploy "VoterVerifier" asli, tapi deploy "MockVerifier"
    // Pastikan nama stringnya sesuai dengan nama Class di file solidity tadi
    const mockVerifier = await viem.deployContract("MockVerifier")

    // Kita pakai address mockVerifier untuk semua jenis verifier
    const evoting = await viem.deployContract("EVoting", [
      mockVerifier.address, // voterVerifier
      mockVerifier.address, // voteVerifier
      mockVerifier.address, // humanityVerifier
      mockVerifier.address, // authorityVerifier
    ])

    const [owner, authority, voter1, voter2, voter3] = await viem.getWalletClients()

    return {
      evoting,
      owner,
      authority,
      voters: [voter1, voter2, voter3],
    }
  }

  it("Should complete full voting lifecycle", async () => {
    const { evoting, voters } = await networkHelpers.loadFixture(setupIntegrationTest)

    // Step 1: Create Election
    await evoting.write.createElection([
      "Integration Test Election", "QmTestHash",
      BigInt(Math.floor(Date.now() / 1000) - 100),
      BigInt(Math.floor(Date.now() / 1000) + 86400),
      BigInt(3), true
    ])

    // Step 2: Add Candidates
    for (let i = 0; i < 3; i++) {
      await evoting.write.addCandidate([BigInt(0), `Candidate ${i + 1}`, `QmCandidate${i}`])
    }

    // Step 3: Start Election
    await evoting.write.startElection([BigInt(0)])

    // Step 4: Voters verify humanity
    for (const voter of voters) {
      // PERBAIKAN: Gunakan encoded proof dan array signal
      const proof = generateDummyProof();
      // Kode baru (SOLUSI)
      const signal: [bigint] = [BigInt(1)]; // Single uint

      const verifyTx = await evoting.write.verifyHumanity([proof, signal], {
        account: voter.account,
      })
      assert.ok(verifyTx)
    }

    // Step 5: Voters cast votes
    for (let i = 0; i < voters.length; i++) {
      // PERBAIKAN: Nullifier bytes dan encoded proof
      const nullifier = ("0x" + i.toString().padStart(64, "0")) as `0x${string}`;
      const proof = generateDummyProof();

      const votesTx = await evoting.write.castVote([BigInt(0), BigInt(i % 3), nullifier, proof], {
        account: voters[i].account,
      })
      assert.ok(votesTx)
    }

    // Step 6: End & Verify
    await evoting.write.endElection([BigInt(0)])
    const totalVotes = await evoting.read.getTotalVotes([BigInt(0)])
    assert.equal(Number(totalVotes), voters.length)

    console.log("✓ Full voting lifecycle completed successfully")
  })

  // ... (Sisa test case lain seperti 'Should prevent unauthorized...' tidak perlu diubah karena tidak menyentuh proof) ...
  
  it("Should prevent unauthorized authority actions", async () => {
    const { evoting, voters } = await networkHelpers.loadFixture(setupIntegrationTest)
    const unauthorizedVoter = voters[0]
    await viem.assertions.revertWith(
      evoting.write.createElection(
        ["Unauthorized", "Qm", BigInt(Date.now()), BigInt(Date.now()+1000), BigInt(2), false],
        { account: unauthorizedVoter.account },
      ),
      "Not an authority",
    )
  })
  // Test logic proof of authority/human service bisa dibiarkan jika hanya test JS logic, bukan contract call.
})