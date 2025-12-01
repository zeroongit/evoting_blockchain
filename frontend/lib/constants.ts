import EVotingArtifact from './abi/EVoting.json';
export const EVOTING_ABI = EVotingArtifact.abi;
// Contoh file: src/utils/contractAddress.ts atau constants.js

export const NEXT_PUBLIC_EVOTING_ADDRESS = {
  EVoting: "0xd015d39a472d7d9e1ec5f8d857605ff88ebaabf1",
  VoterVerifier: "0xa8b942ce0a60e9c9a890db696f53ec8fc0d1a85f",
  VoteVerifier: "0x8393511ac0d21a1ad3266825077df4cec53fd73a",
  HumanityVerifier: "0xdd30eb631ce84295820d5607d912a79d445899e3",
  AuthorityVerifier: "0xab8c31c3e6ebf9b6a14d4d007b02a79368f8d7ac"
};

// Pastikan juga meng-update ABI (Application Binary Interface)
// jika kamu ada mengubah isi file .sol sebelumnya.
// Copy file JSON dari folder: artifacts/contracts/EVoting.sol/EVoting.json