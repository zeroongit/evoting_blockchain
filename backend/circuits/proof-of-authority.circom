pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template ProofOfAuthority() {
    // Private inputs (Rahasia Admin)
    signal input authority_secret;
    signal input official_id;

    // Public inputs (Konteks Aksi)
    signal input election_id;
    signal input action_hash; // Hash dari aksi yang dilakukan (misal: "START_ELECTION")

    // Output
    signal output auth_proof;

    // Verifikasi Admin Hash
    component hasher = Poseidon(4);
    hasher.inputs[0] <== official_id;
    hasher.inputs[1] <== authority_secret;
    hasher.inputs[2] <== election_id;
    hasher.inputs[3] <== action_hash;

    auth_proof <== hasher.out;
}

component main { public [election_id, action_hash] } = ProofOfAuthority();