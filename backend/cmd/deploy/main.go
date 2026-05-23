package main

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"

	// 🚀 Menggunakan alias contracts untuk package blockchain asli milikmu
	contracts "evoting_pemilu/internal/blockchain"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
)

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// 🚀 Fungsi pembantu penata nonce diletakkan di atas agar terbaca global oleh main()
func updateAuth(auth *bind.TransactOpts, nonce uint64) {
	auth.Nonce = big.NewInt(int64(nonce))
}

func main() {
	// Load environment variables
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
		log.Fatalf("Failed to parse private key: %v", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("Cannot assert type: publicKey is not of type *ecdsa.PublicKey")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatalf("Failed to get pending nonce: %v", err)
	}

	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatalf("Failed to suggest gas price: %v", err)
	}

	chainID, err := client.NetworkID(context.Background())
	if err != nil {
		log.Fatalf("Failed to get chain ID: %v", err)
	}

	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatalf("Failed to create authorized transactor: %v", err)
	}
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(8000000)
	auth.GasPrice = gasPrice

	fmt.Println("==================================================")
	fmt.Printf("Deploying contracts using address: %s\n", fromAddress.Hex())
	fmt.Println("==================================================")

	// 1. Deploy VoterVerifier
	voterVerifierAddr, txVoter, _, err := contracts.DeployVoterVerifier(auth, client)
	if err != nil {
		log.Fatalf("Failed to deploy VoterVerifier: %v", err)
	}
	nonce++
	fmt.Printf("✅ VoterVerifier deployed to: %s\n", voterVerifierAddr.Hex())
	bind.WaitDeployed(context.Background(), client, txVoter)

	// 2. Deploy VoteVerifier
	updateAuth(auth, nonce)
	voteVerifierAddr, txVote, _, err := contracts.DeployVoteVerifier(auth, client)
	if err != nil {
		log.Fatalf("Failed to deploy VoteVerifier: %v", err)
	}
	nonce++
	fmt.Printf("✅ VoteVerifier deployed to: %s\n", voteVerifierAddr.Hex())
	bind.WaitDeployed(context.Background(), client, txVote)

	// 3. Deploy HumanityVerifier
	updateAuth(auth, nonce)
	humanityVerifierAddr, txHumanity, _, err := contracts.DeployHumanityVerifier(auth, client)
	if err != nil {
		log.Fatalf("Failed to deploy HumanityVerifier: %v", err)
	}
	nonce++
	fmt.Printf("✅ HumanityVerifier deployed to: %s\n", humanityVerifierAddr.Hex())
	bind.WaitDeployed(context.Background(), client, txHumanity)

	// 4. Deploy AuthorityVerifier
	updateAuth(auth, nonce)
	authorityVerifierAddr, txAuthority, _, err := contracts.DeployAuthorityVerifier(auth, client)
	if err != nil {
		log.Fatalf("Failed to deploy AuthorityVerifier: %v", err)
	}
	nonce++
	fmt.Printf("✅ AuthorityVerifier deployed to: %s\n", authorityVerifierAddr.Hex())
	bind.WaitDeployed(context.Background(), client, txAuthority)

	// 5. Deploy Main EVoting Contract
	updateAuth(auth, nonce)
	fmt.Println("Deploying Main EVoting Contract...")
	
	evotingAddr, evotingTx, eVotingInstance, err := contracts.DeployEVoting(
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
	nonce++
	fmt.Printf("✅ EVoting deployed to: %s\n\n", evotingAddr.Hex())
	bind.WaitDeployed(context.Background(), client, evotingTx)

	fmt.Println("🎉 All contracts deployed successfully!")
	fmt.Println("==================================================")

	// =========================================================================
	// 🚀 PROSES SINKRONISASI INITIALIZATION REPLIKA DEPLOY.TS (FIX PARAMETER)
	// =========================================================================
	fmt.Println("Memulai inisialisasi data Pemilu dan Paslon di Avalanche Fuji...")

	// Perbarui nonce sebelum melakukan instruksi transaksi tulis
	updateAuth(auth, nonce)

	// 🚀 FIX TOTAL: Menggunakan 6 argumen pas sesuai cetakan evoting.go hasil abigen
	fmt.Println("Menjalankan transaksi: CreateElection()...")
	txElection, err := eVotingInstance.CreateElection(
		auth,
		"Pemilu Indonesia 2024",       // 1. _title (string)
		"Bilik Suara Digital",   // 2. _ipfsHash (string)
		big.NewInt(1716123456),  // 3. _startTime (uint256)
		big.NewInt(1816123456),  // 4. _endTime (uint256)
		big.NewInt(3),           // 5. _candidateCount (uint256) -> Hanya 3 paslon agar looping ringan!
		false,                   // 6. _requireHumanity (bool) -> Diubah ke FALSE agar meloloskan dompet server!
	)
	if err != nil {
		log.Fatalf("Gagal mengeksekusi CreateElection on-chain: %v", err)
	}
	
	_, err = bind.WaitMined(context.Background(), client, txElection)
	if err != nil {
		log.Fatalf("Gagal menunggu mining CreateElection: %v", err)
	}
	fmt.Println("✅ Sesi Pemilu berhasil dibuat di Avalanche Fuji.")

	// 3. Daftarkan Paslon Menggunakan Fungsi 'AddCandidate' (4 Argumen penuh sesuai evoting.go)
	paslonList := []string{
		"Paslon 1 - Prabowo Gibran",
		"Paslon 2 - Anies Imin",
		"Paslon 3 - Ganjar Mahfud",
	}

	for _, name := range paslonList {
		nonce++
		updateAuth(auth, nonce)

		fmt.Printf("Menjalankan transaksi: AddCandidate(Election: 0, Name: %s)...\n", name)
		
		txCandidate, err := eVotingInstance.AddCandidate(
			auth, 
			big.NewInt(0), // _electionId
			name,          // _name
			"",            // _ipfsHash atau deskripsi dummy (string)
		)
		if err != nil {
			log.Fatalf("Gagal mendaftarkan %s on-chain: %v", name, err)
		}

		_, err = bind.WaitMined(context.Background(), client, txCandidate)
		if err != nil {
			log.Fatalf("Gagal menunggu mining kandidat %s: %v", name, err)
		}
		fmt.Printf("✅ %s berhasil terdaftar secara permanen.\n", name)
	}

	fmt.Println("==================================================")
	fmt.Println("🚀 PROSES DEPLOY & INITIALIZATION SELESAI 100%!")
	fmt.Printf("Silakan salin alamat ini ke file .env Backend Utama Go kamu:\n")
	fmt.Printf("EVOTING_CONTRACT_ADDRESS=%s\n", evotingAddr.Hex())
	fmt.Println("==================================================")
}