import EVotingArtifact from './abi/EVoting.json';
export const EVOTING_ABI = EVotingArtifact.abi;
// Contoh file: src/utils/contractAddress.ts atau constants.js

export const NEXT_PUBLIC_EVOTING_ADDRESS = {
  EVoting: "0xb7895b6d0e75468c0e82518b5d7b83c73566898d",
  VoterVerifier: "0x3ebd1f697fe9a2142b60390ae80b016c10526f5a",
  VoteVerifier: "0x4e31f3c10f21232c1af39efceae4beb6ac846b79",
  HumanityVerifier: "0x1b4486beb5819bdba1bb628d7b92245cadf6d6aa",
  AuthorityVerifier: "0x4a9b431363f23bc11cc7548c674c4e01a552c17a"

}


// Pastikan juga meng-update ABI (Application Binary Interface)
// jika kamu ada mengubah isi file .sol sebelumnya.
// Copy file JSON dari folder: artifacts/contracts/EVoting.sol/EVoting.json