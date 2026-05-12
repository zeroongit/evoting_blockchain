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

// CastVoteRelay submits the ZK Proof tx to Avalanche Fuji from the Server-Side using a generic private key
func CastVoteRelay(
	electionId *big.Int,
	candidateId *big.Int,
	nullifier *big.Int,
	a [2]*big.Int,
	b [2][2]*big.Int,
	c [2]*big.Int,
	publicSignals [4]*big.Int,
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

	// Execute castVote transaction using Gasless Relayer pattern
	tx, err := evotingContract.CastVote(auth, electionId, candidateId, nullifier, a, b, c, publicSignals)
	if err != nil {
	    return "", fmt.Errorf("failed to cast vote: %v", err)
	}

	return tx.Hash().Hex(), nil
}
