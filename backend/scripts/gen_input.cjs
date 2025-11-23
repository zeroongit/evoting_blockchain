const { buildPoseidon } = require("circomlibjs");

async function main() {
    const poseidon = await buildPoseidon();
    const F = poseidon.F; // Field arithmetic

    // DATA RAHASIA KITA (DUMMY)
    const voter_id = 111;
    const secret = 222;
    const election_id = 0;
    const candidate_id = 0; // Misal pilih kandidat 0
    const candidate_count = 3;

    console.log("🔄 Menghitung Hash yang Valid...");

    // 1. Hitung Commitment = Hash(voter_id, secret)
    const commitmentHash = poseidon([voter_id, secret]);
    const commitment = F.toString(commitmentHash);

    // 2. Hitung Nullifier = Hash(voter_id, election_id, secret)
    const nullifierHash = poseidon([voter_id, election_id, secret]);
    const nullifier = F.toString(nullifierHash);

    // 3. Hitung Vote Hash (Opsional, tapi sirkuit butuh input ini)
    // Hash(voter_id, candidate_id, election_id, secret)
    const voteCommitmentHash = poseidon([voter_id, candidate_id, election_id, secret]);
    const vote_commitment = F.toString(voteCommitmentHash);

    console.log("\n✅ COPY DATA INI KE FRONTEND (app/vote/page.tsx):");
    console.log("----------------------------------------------------");
    console.log(`commitment: "${commitment}",`);
    console.log(`nullifier: "${nullifier}",`);
    console.log(`vote_hash: "0", // (Atau "${vote_commitment}" jika dipakai)`);
    console.log("----------------------------------------------------");
}

main();