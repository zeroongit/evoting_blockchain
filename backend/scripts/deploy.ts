import hre from "hardhat";

async function main() {
  console.log("🚀 Starting E-Voting deployment...");

  const { viem } = await hre.network.connect();
  
  // Ambil Public Client untuk mengecek status transaksi
  const publicClient = await viem.getPublicClient();

  // 1. Deploy Verifiers
  console.log("\n📡 Deploying Verifier Contracts...");

  const authorityVerifier = await viem.deployContract("contracts/AuthorityVerifier.sol:AuthorityVerifier");
  const humanityVerifier = await viem.deployContract("contracts/HumanityVerifier.sol:HumanityVerifier");
  const voteVerifier = await viem.deployContract("contracts/VoteVerifier.sol:VoteVerifier");
  const voterVerifier = await viem.deployContract("contracts/VoterVerifier.sol:VoterVerifier");
  
  console.log("✅ Verifiers deployed.");
  console.log(`   - Authority: ${authorityVerifier.address}`);
  console.log(`   - Humanity:  ${humanityVerifier.address}`);
  console.log(`   - Vote:      ${voteVerifier.address}`);
  console.log(`   - Voter:     ${voterVerifier.address}`);

  // 2. Deploy EVoting Contract Utama
  console.log("\n🚀 Deploying EVoting Main Contract...");
  
  // Deploy contract
  const evoting = await viem.deployContract("EVoting", [
    voterVerifier.address,
    voteVerifier.address,
    humanityVerifier.address,
    authorityVerifier.address,
  ]);

  console.log("🎉 EVoting deployed at:", evoting.address);

  // --- BAGIAN BARU: SETUP DATA PEMILU PRESIDEN ---
  console.log("\n🗳️ Setting up Indonesian Presidential Election Data...");

  // A. Buat Pemilu Baru (ID: 0)
  console.log("- Creating Election: Pemilu Presiden 2024...");
  
  const createTx = await evoting.write.createElection([
    "Pemilu Presiden & Wakil Presiden Indonesia 2024",
    "QmHashInfoPemilu",
    BigInt(Math.floor(Date.now() / 1000)), 
    BigInt(Math.floor(Date.now() / 1000) + 86400 * 7), 
    BigInt(0), 
    true 
  ]);

  // 🛑 WAJIB TUNGGU KONFIRMASI BLOCK
  console.log(`  Waiting for confirmation... (Tx: ${createTx})`);
  await publicClient.waitForTransactionReceipt({ hash: createTx });
  console.log("  ✅ Election created!");

  // B. Tambahkan 3 Paslon (Tunggu satu per satu agar nonce aman)
  
  // Paslon 01
  console.log("- Adding Candidate 01: Anies - Muhaimin...");
  const cand1Tx = await evoting.write.addCandidate([
    BigInt(0), 
    "01. Anies Baswedan & Muhaimin Iskandar", 
    "QmFotoAnies"
  ]);
  await publicClient.waitForTransactionReceipt({ hash: cand1Tx });

  // Paslon 02
  console.log("- Adding Candidate 02: Prabowo - Gibran...");
  const cand2Tx = await evoting.write.addCandidate([
    BigInt(0), 
    "02. Prabowo Subianto & Gibran Rakabuming", 
    "QmFotoPrabowo"
  ]);
  await publicClient.waitForTransactionReceipt({ hash: cand2Tx });

  // Paslon 03
  console.log("- Adding Candidate 03: Ganjar - Mahfud...");
  const cand3Tx = await evoting.write.addCandidate([
    BigInt(0), 
    "03. Ganjar Pranowo & Mahfud MD", 
    "QmFotoGanjar"
  ]);
  await publicClient.waitForTransactionReceipt({ hash: cand3Tx });
  
  console.log("✅ Candidates added!");

  // C. (Opsional) Langsung Start Election agar siap dipakai
  console.log("- Starting Election...");
  const startTx = await evoting.write.startElection([BigInt(0)]);
  await publicClient.waitForTransactionReceipt({ hash: startTx });
  console.log("✅ Election STARTED! (State: Active)");

  // --- 4. Output Data untuk Frontend ---
  const deploymentData = {
    network: hre.network.connect,
    timestamp: new Date().toISOString(),
    contracts: {
      EVoting: evoting.address,
      VoterVerifier: voterVerifier.address,
      VoteVerifier: voteVerifier.address,
      HumanityVerifier: humanityVerifier.address,
      AuthorityVerifier: authorityVerifier.address,
    },
  };

  console.log("\n--------- DEPLOYMENT SUMMARY ---------");
  console.log(JSON.stringify(deploymentData, null, 2));
  console.log("--------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });