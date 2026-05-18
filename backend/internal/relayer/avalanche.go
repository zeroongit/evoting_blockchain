package relayer

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"math/big"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"

	"vibevote/backend/internal/blockchain"
)

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// Proof is a standard SnarkJS Groth16 proof format mapped to Go big.Int
type Proof struct {
	A [2]*big.Int
	B [2][2]*big.Int
	C [2]*big.Int
	PublicSignals []*big.Int
}

// CastVoteRelay submits the ZK Proof tx to Avalanche Fuji from the Server-Side
func CastVoteRelay(
	electionId *big.Int,
	candidateId *big.Int,
	nullifier *big.Int,
	voteProof Proof,
) (string, error) {
	rpcURL := getEnv("AVALANCHE_RPC_URL", "https://api.avax-test.network/ext/bc/C/rpc")
	privateKeyHex := os.Getenv("PRIVATE_KEY")
	contractAddressHex := os.Getenv("CONTRACT_ADDRESS")

	if privateKeyHex == "" {
		return "", fmt.Errorf("PRIVATE_KEY environment variable is not set")
	}
	if contractAddressHex == "" {
		return "", fmt.Errorf("CONTRACT_ADDRESS environment variable is not set")
	}

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return "", fmt.Errorf("failed to connect to Avalanche testnet: %v", err)
	}
	defer client.Close()

	// Parse Private Key
	privateKey, err := crypto.HexToECDSA(strings.TrimPrefix(privateKeyHex, "0x"))
	if err != nil {
		return "", fmt.Errorf("invalid private key: %v", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return "", fmt.Errorf("error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		return "", err
	}

	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		return "", err
	}

	// 43113 is Chain ID for Avalanche Fuji Testnet
	chainID := big.NewInt(43113)
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return "", err
	}
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)     // We are casting a vote, not sending AVAX value
	auth.GasLimit = uint64(500000) // Default estimated Gas Limit. Can be simulated using client.EstimateGas if needed.
	auth.GasPrice = gasPrice

	contractAddress := common.HexToAddress(contractAddressHex)
	
	// Initialize EVoting Contract Binding
	evotingContract, err := blockchain.NewEVoting(contractAddress, client)
	if err != nil {
	    return "", fmt.Errorf("failed to instantiate EVoting contract: %v", err)
	}

	// Convert slice to array for the old ABI binding temporarily
	var pubSignals [4]*big.Int
	if len(voteProof.PublicSignals) >= 4 {
		copy(pubSignals[:], voteProof.PublicSignals[:4])
	}

	// EXECUTE SMART CONTRACT CALL
	// NOTE: Pembaharuan smart contract ke `abigen` baru diperlukan untuk menerima ke-4 proofs.
	// Untuk saat ini, agar kode bisa mengkompilasi dengan binding lama Anda, kita hanya pass `voteProof`.
	tx, err := evotingContract.CastVote(
		auth, 
		electionId, 
		candidateId, 
		nullifier, 
		voteProof.A, voteProof.B, voteProof.C, pubSignals,
	)
	if err != nil {
	    return "", fmt.Errorf("failed to cast vote: %v", err)
	}

	return tx.Hash().Hex(), nil
}
