// frontend/lib/zkBackend.ts
// Utility untuk generate proof via backend API

interface GenerateProofParams {
  circuitType: "humanity" | "vote" | "eligibility" | "authority";
  inputs: any;
}

interface ProofResult {
  success: boolean;
  circuitType: string;
  proof: {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
  };
  publicSignals: string[];
}

// Gunakan API route Next.js (tidak perlu BACKEND_URL)
const BACKEND_URL = typeof window !== "undefined" ? window.location.origin : "";

/**
 * Generate ZK proof via backend API
 * @param circuitType - Type of circuit: 'humanity' | 'vote' | 'eligibility' | 'authority'
 * @param inputs - Circuit inputs object
 * @returns Proof and public signals
 */
export async function generateProofViaBackend({
  circuitType,
  inputs,
}: GenerateProofParams): Promise<ProofResult> {
  try {
    console.log(`🔐 Requesting ${circuitType} proof from backend...`);
    console.log("Inputs:", inputs);

    const response = await fetch(`${BACKEND_URL}/api/zk/generate-proof`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        circuitType,
        inputs,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Backend error (${response.status}): ${errorData.error || "Unknown error"}`
      );
    }

    const data: ProofResult = await response.json();

    console.log("✅ Proof received from backend!");
    console.log("Public Signals:", data.publicSignals);

    return data;
  } catch (error: any) {
    console.error("❌ Error generating proof:", error);
    throw new Error(`Failed to generate proof: ${error.message}`);
  }
}

/**
 * Check if backend is healthy and circuits are available
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/zk/health`);

    if (!response.ok) {
      throw new Error(`Backend health check failed (${response.status})`);
    }

    const data = await response.json();
    console.log("✅ Backend health:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Backend health check failed:", error);
    return null;
  }
}

/**
 * Generate Humanity Proof
 */
export async function generateHumanityProof(inputs: {
  human_score: number;
  uniqueness_score: number;
  behavior_proof: number;
  timestamp: number;
  user_identifier: string;
}) {
  return generateProofViaBackend({
    circuitType: "humanity",
    inputs,
  });
}

/**
 * Generate Vote Proof
 */
export async function generateVoteProof(inputs: {
  commitment: string;
  nullifier: string;
  vote_hash: string;
  election_id: number;
  candidate_id: number;
  voter_id: number;
  secret: number;
  candidate_count: number;
}) {
  return generateProofViaBackend({
    circuitType: "vote",
    inputs,
  });
}

/**
 * Generate Voter Eligibility Proof
 */
export async function generateEligibilityProof(inputs: {
  voter_id: number;
  secret: number;
  election_id: number;
}) {
  return generateProofViaBackend({
    circuitType: "eligibility",
    inputs,
  });
}

/**
 * Generate Authority Proof
 */
export async function generateAuthorityProof(inputs: {
  official_id: number;
  authority_secret: number;
  election_id: number;
  action_hash: string;
}) {
  return generateProofViaBackend({
    circuitType: "authority",
    inputs,
  });
}