import hre from "hardhat"

async function main() {
  console.log("🚀 Starting E-Voting deployment...")
  const {viem } = await hre.network.connect();

  // 1. Deploy Verifiers (Satu per satu)
  console.log("\n📡 Deploying Verifier Contracts...");

  const authorityVerifier = await viem.deployContract("AuthorityVerifier")
  const humanityVerifier = await viem.deployContract("HumanityVerifier")
  const voteVerifier = await viem.deployContract("VoteVerifier")
  const voterVerifier = await viem.deployContract("VoterVerifier")
  
  console.log("✅ Verifiers deployed.")

  // 2. Jeda Waktu (PENTING untuk Testnet)
  console.log("⏳ Waiting 10s for verifiers to propagate...")
  await new Promise((resolve) => setTimeout(resolve, 10000))

  // 3. Deploy EVoting Contract Utama
  console.log("\n🚀 Deploying EVoting Main Contract...")
  const evoting = await viem.deployContract("EVoting", [
    voterVerifier.address,
    voteVerifier.address,
    humanityVerifier.address,
    authorityVerifier.address,
  ])

  console.log("🎉 EVoting deployed at:", evoting.address)

  // --- BAGIAN BARU: SETUP DATA PEMILU PRESIDEN ---
  console.log("\n🗳️ Setting up Indonesian Presidential Election Data...");

  // A. Buat Pemilu Baru (ID: 0)
  console.log("- Creating Election: Pemilu Presiden 2024...");
  await evoting.write.createElection([
    "Pemilu Presiden & Wakil Presiden Indonesia 2024", // Judul
    "QmHashInfoPemilu", // IPFS Hash dummy info pemilu
    BigInt(Math.floor(Date.now() / 1000)), // Start Time (Sekarang)
    BigInt(Math.floor(Date.now() / 1000) + 86400 * 7), // End Time (7 hari lagi)
    BigInt(3), // Jumlah Kandidat (akan diisi 3)
    true // Butuh Proof of Humanity? (True)
  ]);

  // B. Tambahkan 3 Paslon
  // Paslon 01
  console.log("- Adding Candidate 01: Anies - Muhaimin...");
  await evoting.write.addCandidate([
    BigInt(0), // Election ID 0
    "01. Anies Baswedan & Muhaimin Iskandar", 
    "QmFotoAnies" // Dummy IPFS Hash untuk foto
  ]);

  // Paslon 02
  console.log("- Adding Candidate 02: Prabowo - Gibran...");
  await evoting.write.addCandidate([
    BigInt(0), 
    "02. Prabowo Subianto & Gibran Rakabuming", 
    "QmFotoPrabowo"
  ]);

  // Paslon 03
  console.log("- Adding Candidate 03: Ganjar - Mahfud...");
  await evoting.write.addCandidate([
    BigInt(0), 
    "03. Ganjar Pranowo & Mahfud MD", 
    "QmFotoGanjar"
  ]);
  
  console.log("✅ Election Data Setup Complete!");

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
  }

  console.log("\n--------- DEPLOYMENT SUMMARY ---------")
  console.log(JSON.stringify(deploymentData, null, 2))
  console.log("--------------------------------------")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })