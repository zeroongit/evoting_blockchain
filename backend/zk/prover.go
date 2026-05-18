package zk

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"vibevote/backend/internal/relayer"
)

// Input struct untuk sirkuit
type CircuitInput struct {
	NIK         string `json:"nik"`
	CandidateID int    `json:"candidateId"`
}

// GenerateProof menjalankan SnarkJS di backend (Node.js script wrapper)
// Ini adalah cara terbaik menjalankan ZK Proof di Go tanpa membebani device pengguna (lansia)
func GenerateProof(nik string, candidateId int) (*relayer.Proof, error) {
	/* 
		Implementasi Asli Production:
		Di Cloud Run / Server, kita memanggil `snarkjs` via exec atau FFI.
		Asumsinya ada script `generate-proof.cjs` yang memproses wasm dan zkey.
	*/
	
	// Untuk keamanan, pastikan environment Production dapat mengeksekusi Node
	cmd := exec.Command("node", "../scripts/generate-proof.cjs", nik, fmt.Sprintf("%d", candidateId))
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		// Kita kembalikan error yang jelas bila snarkJS gagal
		return nil, fmt.Errorf("ZK Generation Error: %v | Output: %s", err, string(output))
	}

	var proof relayer.Proof
	if err := json.Unmarshal(output, &proof); err != nil {
		return nil, fmt.Errorf("Gagal parsing output SnarkJS: %v", err)
	}

	return &proof, nil
}
