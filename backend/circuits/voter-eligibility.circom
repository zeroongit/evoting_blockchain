pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template VoterEligibility() {
    // Private
    signal input voter_id;
    signal input secret;

    // Public
    signal input election_id;

    // Output
    signal output eligibility_hash;

    // Generate Hash identitas pemilih
    component hasher = Poseidon(3);
    hasher.inputs[0] <== voter_id;
    hasher.inputs[1] <== secret;
    hasher.inputs[2] <== election_id;

    eligibility_hash <== hasher.out;
}

component main { public [election_id] } = VoterEligibility();