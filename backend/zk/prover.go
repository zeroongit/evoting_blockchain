package zk

import (
	"context"
	"encoding/json"
	"evoting_pemilu/internal/relayer"
	"fmt"
	"os/exec"
	"time"
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

	// OPTIMASI: Gunakan Context dengan Timeout (30 detik)
	// Mencegah server hang selamanya jika proses komputasi ZK Node.js macet.
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Pastikan mengeksekusi server dari direktori 'backend/' agar path ini terbaca
	cmd := exec.CommandContext(ctx, "node", "scripts/generate-proof.cjs", nik, fmt.Sprintf("%d", candidateId))

	output, err := cmd.CombinedOutput()
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return nil, fmt.Errorf("ZK Generation Timeout: Proses memakan waktu terlalu lama (>30 detik)")
		}
		// Kita kembalikan error yang jelas bila snarkJS gagal
		return nil, fmt.Errorf("ZK Generation Error: %v | Output: %s", err, string(output))
	}

	var proof relayer.Proof
	if err := json.Unmarshal(output, &proof); err != nil {
		return nil, fmt.Errorf("Gagal parsing output SnarkJS: %v", err)
	}

	return &proof, nil
}
