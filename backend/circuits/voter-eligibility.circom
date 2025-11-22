pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template VoterEligibility() {
    signal input voter_id;
    signal input secret;
    signal input election_id;
    
    signal output commitment;
    signal output nullifier;

    // Compute commitment
    component commitment_hash = Poseidon(2);
    commitment_hash.inputs[0] <== voter_id;
    commitment_hash.inputs[1] <== secret;
    commitment <== commitment_hash.out; // PERBAIKAN DISINI
    
    // Compute nullifier
    component nullifier_hash = Poseidon(3);
    nullifier_hash.inputs[0] <== voter_id;
    nullifier_hash.inputs[1] <== election_id;
    nullifier_hash.inputs[2] <== secret;
    nullifier <== nullifier_hash.out; // PERBAIKAN DISINI
}

component main { public [election_id] } = VoterEligibility();