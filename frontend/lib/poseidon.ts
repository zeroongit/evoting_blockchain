import { buildPoseidon } from "circomlibjs";

let poseidon: any = null;

export async function getPoseidonHash(inputs: bigint[]): Promise<string> {
  if (!poseidon) {
    poseidon = await buildPoseidon();
  }
  
  // Konversi inputs ke string/bigint yang diterima poseidon
  const hash = poseidon(inputs);
  
  // Konversi hasil (Uint8Array) kembali ke String Angka (Finite Field)
  return poseidon.F.toString(hash);
}