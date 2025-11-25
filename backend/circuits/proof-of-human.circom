pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template ProofOfHuman() {
    signal input human_score;      // 0-100
    signal input uniqueness_score; // 0-100
    signal input behavior_proof;   // 0-100
    signal input timestamp;
    signal input user_identifier;
    
    signal output humanity_proof;
    
    // 1. Verify human_score >= 70
    component check_human = GreaterEqThan(8);
    check_human.in[0] <== human_score;
    check_human.in[1] <== 70;
    check_human.out === 1;
    
    // 2. Verify uniqueness_score >= 80
    component check_unique = GreaterEqThan(8);
    check_unique.in[0] <== uniqueness_score;
    check_unique.in[1] <== 80;
    check_unique.out === 1;
    
    // 3. Verify behavior_proof >= 60
    component check_behavior = GreaterEqThan(8);
    check_behavior.in[0] <== behavior_proof;
    check_behavior.in[1] <== 60;
    check_behavior.out === 1;
    
    // Create humanity proof dengan 4 inputs
    component humanity_hash = Poseidon(4);
    humanity_hash.inputs[0] <== human_score;
    humanity_hash.inputs[1] <== uniqueness_score;
    humanity_hash.inputs[2] <== behavior_proof;
    humanity_hash.inputs[3] <== timestamp;
    
    humanity_proof <== humanity_hash.out;
}

component main { public [human_score, uniqueness_score, behavior_proof, timestamp, user_identifier] } = ProofOfHuman();