// frontend/app/api/zk/generate-proof/route.ts
import { NextRequest, NextResponse } from "next/server";
import { groth16 } from "snarkjs";
import fs from "fs";
import path from "path";

interface ProofRequest {
  circuitType: "humanity" | "vote" | "eligibility" | "authority";
  inputs: any;
}

// ✅ DEBUG: Log working directory
const cwd = process.cwd();
console.log("📍 Current working directory:", cwd);

// Map nama ke file paths
const circuitConfig: Record<string, { wasm: string; zkey: string; displayName: string }> = {
  humanity: {
    wasm: "proof-of-human.wasm",
    zkey: "proof-of-human_0001.zkey",
    displayName: "Proof of Human",
  },
  vote: {
    wasm: "vote-casting.wasm",
    zkey: "vote-casting_0001.zkey",
    displayName: "Vote Casting",
  },
  eligibility: {
    wasm: "voter-eligibility.wasm",
    zkey: "voter-eligibility_0001.zkey",
    displayName: "Voter Eligibility",
  },
  authority: {
    wasm: "proof-of-authority.wasm",
    zkey: "proof-of-authority_0001.zkey",
    displayName: "Proof of Authority",
  },
};

// ✅ PENTING: Buat helper function untuk resolve path
function getCircuitPath(circuitType: string): { wasm: string; zkey: string } | null {
  const config = circuitConfig[circuitType];
  if (!config) return null;

  // Coba beberapa lokasi
  const possiblePaths = [
    // Lokasi 1: public folder (frontend)
    path.join(cwd, "public", "circuits", circuitType, config.wasm),
    // Lokasi 2: dengan nama folder berbeda
    path.join(cwd, "public", "circuits", circuitType.replace("-", "_"), config.wasm),
  ];

  let wasmPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      wasmPath = p;
      break;
    }
  }

  // Coba zkey paths
  const possibleZkeyPaths = [
    path.join(cwd, "public", "circuits", circuitType, config.zkey),
    path.join(cwd, "public", "circuits", circuitType.replace("-", "_"), config.zkey),
  ];

  let zkeyPath: string | null = null;
  for (const p of possibleZkeyPaths) {
    if (fs.existsSync(p)) {
      zkeyPath = p;
      break;
    }
  }

  if (!wasmPath || !zkeyPath) {
    return null;
  }

  return { wasm: wasmPath, zkey: zkeyPath };
}

export async function POST(request: NextRequest) {
  try {
    const body: ProofRequest = await request.json();
    const { circuitType, inputs } = body;

    console.log(`\n🔐 Generating ${circuitType} proof...`);
    console.log("Inputs:", inputs);

    // Validasi circuit type
    if (!circuitConfig[circuitType]) {
      return NextResponse.json(
        {
          error: "Invalid circuit type",
          validTypes: Object.keys(circuitConfig),
        },
        { status: 400 }
      );
    }

    // Get paths
    const paths = getCircuitPath(circuitType);
    if (!paths) {
      console.error(`❌ Circuit files not found for ${circuitType}`);
      console.error("Tried to find in:", [
        path.join(cwd, "public", "circuits", circuitType),
      ]);

      return NextResponse.json(
        {
          error: `Circuit files not found for ${circuitType}`,
          wasmName: circuitConfig[circuitType].wasm,
          zkeyName: circuitConfig[circuitType].zkey,
          cwdPath: cwd,
          hint: `Files should be at: ${cwd}/public/circuits/${circuitType}/`,
        },
        { status: 400 }
      );
    }

    const { wasm, zkey } = paths;

    console.log(`✅ Files found:`);
    console.log(`   WASM: ${wasm}`);
    console.log(`   ZKey: ${zkey}`);

    // Generate proof
    console.log("⏳ Generating proof...");
    const { proof, publicSignals } = await groth16.fullProve(inputs, wasm, zkey);

    console.log("✅ Proof generated successfully!");

    // Format proof
    const formattedProof = {
      pi_a: [proof.pi_a[0].toString(), proof.pi_a[1].toString()],
      pi_b: [
        [proof.pi_b[0][0].toString(), proof.pi_b[0][1].toString()],
        [proof.pi_b[1][0].toString(), proof.pi_b[1][1].toString()],
      ],
      pi_c: [proof.pi_c[0].toString(), proof.pi_c[1].toString()],
    };

    return NextResponse.json({
      success: true,
      circuitType,
      proof: formattedProof,
      publicSignals: publicSignals.map((v: any) => v.toString()),
    });
  } catch (error: any) {
    console.error("❌ Error generating proof:", error.message);
    return NextResponse.json(
      {
        error: "Failed to generate proof",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ✅ GET: List available circuits
export async function GET() {
  try {
    const circuitsDir = path.join(process.cwd(), "public", "circuits");

    console.log("\n📋 Checking circuits status...");
    console.log("Circuits dir:", circuitsDir);

    const available = Object.entries(circuitConfig).map(([name, config]) => {
      const circuitPath = path.join(circuitsDir, name);
      const wasmFile = path.join(circuitPath, config.wasm);
      const zkeyFile = path.join(circuitPath, config.zkey);

      const wasmExists = fs.existsSync(wasmFile);
      const zkeyExists = fs.existsSync(zkeyFile);

      if (!wasmExists) {
        console.log(`  ❌ ${name}: WASM not found at ${wasmFile}`);
      }
      if (!zkeyExists) {
        console.log(`  ❌ ${name}: ZKEY not found at ${zkeyFile}`);
      }
      if (wasmExists && zkeyExists) {
        console.log(`  ✅ ${name}: OK`);
      }

      return {
        circuit: name,
        wasm_exists: wasmExists,
        zkey_exists: zkeyExists,
        wasmPath: wasmFile,
        zkeyPath: zkeyFile,
      };
    });

    return NextResponse.json({
      status: "ok",
      baseDir: circuitsDir,
      circuits: available,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Health check failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}