// backend/api/generateProof.ts
import express, { Request, Response } from "express";
import { groth16 } from "snarkjs";
import fs from "fs";
import path from "path";

const router = express.Router();

interface ProofRequest {
  circuitType: "humanity" | "vote" | "eligibility" | "authority";
  inputs: any;
}

interface CircuitFiles {
  wasm: string;
  zkey: string;
}

// Map circuit type ke file locations
const circuitFiles: Record<string, CircuitFiles> = {
  humanity: {
    wasm: path.join(__dirname, "../../circuits/proof-of-human_js/proof_of_human.wasm"),
    zkey: path.join(__dirname, "../../circuits/proof-of-human_0001.zkey"),
  },
  vote: {
    wasm: path.join(__dirname, "../../circuits/vote-casting_js/vote_casting.wasm"),
    zkey: path.join(__dirname, "../../circuits/vote-casting_0001.zkey"),
  },
  eligibility: {
    wasm: path.join(__dirname, "../../circuits/voter-eligibility_js/voter_eligibility.wasm"),
    zkey: path.join(__dirname, "../../circuits/voter-eligibility_0001.zkey"),
  },
  authority: {
    wasm: path.join(__dirname, "../../circuits/proof-of-authority_js/proof_of_authority.wasm"),
    zkey: path.join(__dirname, "../../circuits/proof-of-authority_0001.zkey"),
  },
};

// ✅ Endpoint: POST /api/zk/generate-proof
router.post("/generate-proof", async (req: Request, res: Response) => {
  try {
    const { circuitType, inputs }: ProofRequest = req.body;

    console.log(`🔐 Generating ${circuitType} proof...`);
    console.log("Inputs:", inputs);

    // Validasi circuit type
    if (!circuitFiles[circuitType]) {
      return res.status(400).json({
        error: "Invalid circuit type",
        validTypes: Object.keys(circuitFiles),
      });
    }

    // Cek file ada atau tidak
    const { wasm, zkey } = circuitFiles[circuitType];

    if (!fs.existsSync(wasm)) {
      return res.status(400).json({
        error: `WASM file not found: ${wasm}`,
      });
    }

    if (!fs.existsSync(zkey)) {
      return res.status(400).json({
        error: `ZKey file not found: ${zkey}`,
      });
    }

    console.log(`✅ Files found:`);
    console.log(`   WASM: ${wasm}`);
    console.log(`   ZKey: ${zkey}`);

    // Generate proof
    console.log("⏳ Generating proof (this may take a moment)...");
    const { proof, publicSignals } = await groth16.fullProve(inputs, wasm, zkey);

    console.log("✅ Proof generated successfully!");
    console.log("Public Signals:", publicSignals);

    // Format proof untuk Solidity (convert ke BigInt strings)
    const formattedProof = {
      pi_a: [proof.pi_a[0].toString(), proof.pi_a[1].toString()],
      pi_b: [
        [proof.pi_b[0][0].toString(), proof.pi_b[0][1].toString()],
        [proof.pi_b[1][0].toString(), proof.pi_b[1][1].toString()],
      ],
      pi_c: [proof.pi_c[0].toString(), proof.pi_c[1].toString()],
    };

    return res.json({
      success: true,
      circuitType,
      proof: formattedProof,
      publicSignals: publicSignals.map((v: any) => v.toString()),
    });
  } catch (error: any) {
    console.error("❌ Error generating proof:", error);
    return res.status(500).json({
      error: "Failed to generate proof",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// ✅ Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  const available = Object.entries(circuitFiles).map(([name, files]) => ({
    circuit: name,
    wasm_exists: fs.existsSync(files.wasm),
    zkey_exists: fs.existsSync(files.zkey),
  }));

  res.json({
    status: "ok",
    circuits: available,
  });
});

export default router;

// ============================================
// Usage di main server file (e.g., server.ts)
// ============================================

/*
import generateProofRouter from "./api/generateProof";

const app = express();
app.use(express.json());

// Register router
app.use("/api/zk", generateProofRouter);

app.listen(3001, () => {
  console.log("Backend running on port 3001");
});
*/