pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template VoteCasting() {
    // Private Inputs (Rahasia user)
    signal input voter_id;    // ID Pemilih
    signal input secret;      // PIN/Password rahasia pemilih

    // Public Inputs (Data Pemilu)
    signal input election_id;
    signal input candidate_id;
    
    // Output signals
    signal output nullifier;  // Penanda agar tidak bisa vote 2x
    signal output vote_hash;  // Bukti suara sah

    // 1. Generate Nullifier
    // Nullifier = Hash(voter_id, election_id, secret)
    // Ini unik per user per pemilu. Jika user vote lagi, nullifier akan sama & ditolak contract.
    component nullifierHasher = Poseidon(3);
    nullifierHasher.inputs[0] <== voter_id;
    nullifierHasher.inputs[1] <== election_id;
    nullifierHasher.inputs[2] <== secret;
    
    nullifier <== nullifierHasher.out;

    // 2. Generate Vote Hash (Commitment)
    // Vote Hash = Hash(candidate_id, nullifier)
    // Mengikat pilihan suara dengan nullifier
    component voteHasher = Poseidon(2);
    voteHasher.inputs[0] <== candidate_id;
    voteHasher.inputs[1] <== nullifier;

    vote_hash <== voteHasher.out;
}

component main { public [election_id, candidate_id] } = VoteCasting();