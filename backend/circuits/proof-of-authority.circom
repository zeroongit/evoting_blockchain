pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template ProofOfAuthority() {
    signal input official_id;
    signal input authority_secret;
    signal input election_id;
    signal input action_hash;
    
    signal output authority_proof;
    
    // Compute authority signature menggunakan Poseidon hash
    component authority_sig = Poseidon(3);
    authority_sig.inputs[0] <== official_id;
    authority_sig.inputs[1] <== authority_secret;
    authority_sig.inputs[2] <== election_id;
    
    authority_proof <== authority_sig.out;
}


component main { public [election_id, action_hash] } = ProofOfAuthority();