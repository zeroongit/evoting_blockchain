package main

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
	"vibevote/backend/internal/blockchain"
)

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func main() {

	err := godotenv.Load("../.env")
	if err != nil {
		godotenv.Load(".env")
	}
	
	rpcURL := getEnv("AVALANCHE_RPC_URL", "https://api.avax-test.network/ext/bc/C/rpc")
	privateKeyHex := os.Getenv("RELAYER_PRIVATE_KEY")

	if privateKeyHex == "" {
		log.Fatal("RELAYER_PRIVATE_KEY environment variable is not set")
	}

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("Failed to connect to Avalanche: %v", err)
	}
	defer client.Close()

	// Parse Private Key
	privateKey, err := crypto.HexToECDSA(strings.TrimPrefix(privateKeyHex, "0x"))
	if err != nil {
		log.Fatalf("Invalid private key: %v", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("Error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	chainID := big.NewInt(43113) // Avalanche Fuji

	// Ambil nonce awal sekali saja
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatalf("Failed to get nonce: %v", err)
	}

	// Ambil suggest gas price
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatalf("Failed to suggest gas price: %v", err)
	}

	// Helper untuk membuat transactor base
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatalf("Failed to create transactor: %v", err)
	}

	// Fungsi untuk memperbarui auth setiap kali deploy (increment nonce)
	updateAuth := func(a *bind.TransactOpts, currentNonce uint64) {
		a.Nonce = big.NewInt(int64(currentNonce))
		a.GasPrice = gasPrice
		a.Value = big.NewInt(0)
	}

	fmt.Println("🚀 Starting deployment to Avalanche Fuji Testnet...")
	fmt.Printf("Deployer Address: %s\n\n", fromAddress.Hex())

	// 1. Deploy VoteVerifier
	updateAuth(auth, nonce)
	fmt.Println("Deploying VoteVerifier...")
	voteVerifierAddr, _, _, err := blockchain.DeployVoteVerifier(auth, client)
	if err != nil {
		log.Fatalf("Failed to deploy VoteVerifier: %v", err)
	}
	nonce++ // Tambahkan nonce untuk transaksi berikutnya
	fmt.Printf("✅ VoteVerifier deployed to: %s\n", voteVerifierAddr.Hex())

	// 2. Deploy VoterVerifier
	updateAuth(auth, nonce)
	fmt.Println("Deploying VoterVerifier...")
	voterVerifierAddr, _, _, err := blockchain.DeployVoterVerifier(auth, client)
	if err != nil {
		log.Fatalf("Failed to deploy VoterVerifier: %v", err)
	}
	nonce++
	fmt.Printf("✅ VoterVerifier deployed to: %s\n", voterVerifierAddr.Hex())

	// 3. Deploy HumanityVerifier
	updateAuth(auth, nonce)
	fmt.Println("Deploying HumanityVerifier...")
	humanityVerifierAddr, _, _, err := blockchain.DeployHumanityVerifier(auth, client)
	if err != nil {
		log.Fatalf("Failed to deploy HumanityVerifier: %v", err)
	}
	nonce++
	fmt.Printf("✅ HumanityVerifier deployed to: %s\n", humanityVerifierAddr.Hex())

	// 4. Deploy AuthorityVerifier
	updateAuth(auth, nonce)
	fmt.Println("Deploying AuthorityVerifier...")
	authorityVerifierAddr, authorityVerifierTx, _, err := blockchain.DeployAuthorityVerifier(auth, client)
	if err != nil {
		log.Fatalf("Failed to deploy AuthorityVerifier: %v", err)
	}
	nonce++
	fmt.Printf("✅ AuthorityVerifier deployed to: %s\n", authorityVerifierAddr.Hex())

	// Tunggu verifier terakhir di-mine sebelum deploy main contract (opsional tapi aman)
	fmt.Println("\nWaiting for verifiers to be confirmed on chain...")
	bind.WaitDeployed(context.Background(), client, authorityVerifierTx)

	// 5. Deploy Main EVoting Contract
	updateAuth(auth, nonce)
	fmt.Println("Deploying Main EVoting Contract...")
	// Constructor: _voterVerifier, _voteVerifier, _humanityVerifier, _authorityVerifier
	evotingAddr, evotingTx, _, err := blockchain.DeployEVoting(
		auth,
		client,
		voterVerifierAddr,
		voteVerifierAddr,
		humanityVerifierAddr,
		authorityVerifierAddr,
	)
	if err != nil {
		log.Fatalf("Failed to deploy EVoting contract: %v", err)
	}

	fmt.Printf("✅ EVoting deployed to: %s\n\n", evotingAddr.Hex())
	fmt.Println("Waiting for confirmation...")
	bind.WaitDeployed(context.Background(), client, evotingTx)

	fmt.Println("🎉 All contracts deployed successfully!")
	fmt.Println("==================================================")
	fmt.Printf("Main EVoting Address: %s\n", evotingAddr.Hex())
	fmt.Println("==================================================")
	fmt.Println("Update alamat ini di frontend/lib/constants.ts ya!")
}