// lib/zk.ts
import { groth16 } from 'snarkjs';

// Tipe input untuk ZK Proof (bisa berupa angka atau string)
type ProofInput = Record<string, any>;

interface ZKResult {
  proof: any;
  publicSignals: any;
}

/**
 * Fungsi Ajaib untuk membuat Proof di Browser
 * @param circuitName - Nama file (misal: 'humanity', 'vote', 'voter', 'authority')
 * @param input - Data rahasia yang mau dibuktikan
 */
export async function generateProof(
  circuitName: 'humanity' | 'vote' | 'voter' | 'authority',
  input: ProofInput
): Promise<ZKResult> {
  try {
    // 1. Tentukan lokasi file di folder public
    const wasmPath = `/circuits/${circuitName}.wasm`;
    const zkeyPath = `/circuits/${circuitName}.zkey`;

    console.log(`🔄 Generating proof for ${circuitName}...`);
    
    // 2. Panggil snarkjs untuk melakukan perhitungan matematika berat
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    console.log("✅ Proof Generated Successfully!");
    return { proof, publicSignals };

  } catch (error) {
    console.error(`❌ Error generating ${circuitName} proof:`, error);
    throw new Error("Gagal membuat bukti ZK. Pastikan file sirkuit ada di folder public.");
  }
}

/**
 * Helper untuk mengubah Proof JSON menjadi format yang bisa dibaca Solidity (CallData)
 * Ini penting karena format JSON snarkjs beda dengan format array Solidity
 */
export async function exportCallData(proof: any, publicSignals: any) {
  // Fungsi bawaan snarkjs untuk konversi ke format Solidity
  const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
  
  // Snarkjs mengembalikan string panjang "[a,b], [[c,d]], ...", kita perlu parse jadi Array
  // Tip: Biasanya kita pakai regex atau JSON parse modifikasi, 
  // tapi untuk integrasi viem, kita butuh format struct.
  
  // Sederhananya, kita return raw proof components agar bisa di-encode manual di frontend component
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]], // Perhatikan urutan [1][0] ini tricky di Groth16!
    c: [proof.pi_c[0], proof.pi_c[1]],
    input: publicSignals
  };
}