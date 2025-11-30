pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template ProofOfHuman() {
    // Private Inputs (Rahasia, tidak muncul di blockchain)
    signal input human_score;      // misal: 85
    signal input uniqueness_score; // misal: 90
    signal input behavior_proof;   // misal: 75
    
    // Public Inputs (Akan dicek oleh Smart Contract)
    signal input timestamp;
    signal input user_identifier;  // Address user yang sudah di-convert ke angka
    
    // Output Hash
    signal output humanity_hash;

    // 1. Validasi: human_score >= 70
    component check_human = GreaterEqThan(8);
    check_human.in[0] <== human_score;
    check_human.in[1] <== 70;
    check_human.out === 1; // Wajib true

    // 2. Validasi: uniqueness_score >= 80
    component check_unique = GreaterEqThan(8);
    check_unique.in[0] <== uniqueness_score;
    check_unique.in[1] <== 80;
    check_unique.out === 1;

    // 3. Validasi: behavior_proof >= 60
    component check_behavior = GreaterEqThan(8);
    check_behavior.in[0] <== behavior_proof;
    check_behavior.in[1] <== 60;
    check_behavior.out === 1;

    // 4. Membuat Hash Bukti (Commitment)
    // Hash ini mengikat semua data agar tidak bisa dipalsukan
    component hasher = Poseidon(5);
    hasher.inputs[0] <== human_score;
    hasher.inputs[1] <== uniqueness_score;
    hasher.inputs[2] <== behavior_proof;
    hasher.inputs[3] <== timestamp;
    hasher.inputs[4] <== user_identifier;

    humanity_hash <== hasher.out;
}

// Komponen Utama
// Kita set 'timestamp' dan 'user_identifier' sebagai PUBLIC input.
component main { public [timestamp, user_identifier] } = ProofOfHuman();