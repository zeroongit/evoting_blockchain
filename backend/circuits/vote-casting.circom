pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

// Circuit to verify valid vote without revealing voter identity
// Proves: voter is eligible AND vote is for valid candidate
template VoteCasting() {
    // Public inputs
    signal input commitment;
    signal input nullifier;
    signal input vote_hash; // hash(candidate_id, encrypted_data)
    signal input election_id;
    
    // Private inputs
    signal input voter_id;
    signal input secret;
    signal input candidate_id;
    signal input candidate_count;
    
    signal output vote_commitment;
    
    // Step 1: Verify voter commitment is valid
    component verify_commitment = Poseidon(2);
    verify_commitment.inputs[0] <== voter_id;
    verify_commitment.inputs[1] <== secret;
    
    // Ensure commitment matches
    verify_commitment.out === commitment;
    
    // Step 2: Verify nullifier
    component verify_nullifier = Poseidon(3);
    verify_nullifier.inputs[0] <== voter_id;
    verify_nullifier.inputs[1] <== election_id;
    verify_nullifier.inputs[2] <== secret;
    
    verify_nullifier.out === nullifier;
    
    // Step 3: Verify candidate_id is valid (between 0 and candidate_count-1)
    signal valid_candidate <== LessThan(32)([candidate_id, candidate_count]);
    valid_candidate === 1;
    
    // Step 4: Create vote commitment (prevents modification)
    component vote_commitment_hash = Poseidon(4);
    vote_commitment_hash.inputs[0] <== voter_id;
    vote_commitment_hash.inputs[1] <== candidate_id;
    vote_commitment_hash.inputs[2] <== election_id;
    vote_commitment_hash.inputs[3] <== secret;
    
    vote_commitment <== vote_commitment_hash.out;
}

component main { public [commitment, nullifier, vote_hash, election_id] } = VoteCasting();
