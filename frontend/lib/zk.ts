import { groth16 } from 'snarkjs';

// Tipe data input
type ProofInput = Record<string, any>;

interface ZKResult {
  proof: any;
  publicSignals: string[];
}

/**
 * Fungsi Inti: Generate Proof
 */
async function generateProof(
  // Nama ini harus cocok dengan nama file di folder public/circuits (tanpa extension)
  circuitName: 'proof-of-human' | 'vote-casting' | 'voter-eligibility' | 'proof-of-authority',
  input: ProofInput
): Promise<ZKResult> {
  try {
    // Sesuai screenshot: /circuits/proof-of-human.wasm
    const wasmPath = `/circuits/${circuitName}.wasm`;
    const zkeyPath = `/circuits/${circuitName}.zkey`;

    console.log(`🔄 Generating proof using: ${wasmPath}...`);
    
    // Cek apakah file benar-benar ada sebelum diproses snarkjs
    const check = await fetch(wasmPath);
    if (!check.ok) throw new Error(`File tidak ditemukan: ${wasmPath}`);

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    console.log("✅ Proof Generated Successfully!");
    return { proof, publicSignals };

  } catch (error: any) {
    console.error(`❌ Error generating ${circuitName} proof:`, error);
    throw new Error(error.message || "Gagal generate proof");
  }
}

/**
 * Cek Ketersediaan File (PENTING!)
 * Fungsi ini yang menyebabkan error "File sirkuit belum siap" jika salah nama.
 */
export async function checkCircuitsAvailability() {
  const filename = 'proof-of-human.wasm'; 
  const path = `/circuits/${filename}`;
  
  try {
    console.log(`🕵️ Mencoba ambil file: ${window.location.origin}${path}`);
    const response = await fetch(path);
    
    console.log(`📡 Status Server: ${response.status} (${response.statusText})`);
    console.log(`📄 Tipe Konten: ${response.headers.get('Content-Type')}`);

    if (response.ok) {
        // Cek apakah kontennya beneran WASM atau malah halaman HTML Error 404
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('text/html')) {
             console.error("⚠️ ERROR KRITIS: Server mengembalikan HTML (Halaman 404), bukan file binary WASM!");
             return false;
        }
        return true;
    } else {
        return false;
    }
  } catch (e) {
    console.error("❌ Network Error:", e);
    return false;
  }
}

// --- WRAPPER FUNCTIONS ---

export async function generateHumanityProof(inputs: any) {
  // String ini harus sama dengan nama file di screenshot: proof-of-human
  return generateProof('proof-of-human', inputs);
}

export async function generateVoteProof(inputs: any) {
  // String ini harus sama dengan nama file di screenshot: vote-casting
  return generateProof('vote-casting', inputs);
}

export async function generateEligibilityProof(inputs: any) {
  return generateProof('voter-eligibility', inputs);
}

export async function generateAuthorityProof(inputs: any) {
  return generateProof('proof-of-authority', inputs);
}