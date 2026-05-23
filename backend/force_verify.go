package main

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"

	contracts "evoting_pemilu/internal/blockchain"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	rpcURL := os.Getenv("AVALANCHE_RPC_URL")
	if rpcURL == "" {
		rpcURL = "https://api.avax-test.network/ext/bc/C/rpc"
	}

	// SINKRONISASI: Gunakan private key server utama kamu (bukan MetaMask)
	privateKeyHex := os.Getenv("RELAYER_PRIVATE_KEY")
	contractHex := os.Getenv("CONTRACT_ADDRESS")

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("Gagal koneksi RPC: %v", err)
	}

	privateKey, err := crypto.HexToECDSA(strings.TrimPrefix(privateKeyHex, "0x"))
	if err != nil {
		log.Fatalf("Gagal parse private key: %v", err)
	}

	chainID := big.NewInt(43113) // Avalanche Fuji Testnet ID
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatalf("Gagal membuat transactor: %v", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("Gagal casting public key")
	}
	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatalf("Gagal ambil nonce: %v", err)
	}
	auth.Nonce = big.NewInt(int64(nonce))
	auth.GasLimit = uint64(1000000)

	// Inisialisasi instance kontrak pintar kamu
	eVotingInstance, err := contracts.NewEVoting(common.HexToAddress(contractHex), client)
	if err != nil {
		log.Fatalf("Gagal memuat instance EVoting: %v", err)
	}

	fmt.Println("==================================================")
	fmt.Printf("Mendaftarkan Otoritas Server Go: %s\n", fromAddress.Hex())
	fmt.Println("==================================================")

	// 🚀 LANGKAH PENYELAMATAN: Daftarkan Alamat Server sebagai "Authority" resmi
	// Di dalam EVoting.sol, akun yang masuk list Authority memiliki akses bypass/validasi khusus
	fmt.Println("Menjalankan transaksi: AddAuthority()...")
	tx, err := eVotingInstance.AddAuthority(auth, fromAddress)
	if err != nil {
		log.Fatalf("Gagal menambahkan otoritas server: %v", err)
	}

	_, err = bind.WaitMined(context.Background(), client, tx)
	if err != nil {
		log.Fatalf("Gagal menunggu konfirmasi blok: %v", err)
	}

	fmt.Println("\n🎉 SUKSES BESAR!")
	fmt.Println("Alamat Server Go kamu sekarang memegang peran AUTHORITY penuh di Avalanche Fuji.")
	fmt.Println("Sekarang server bebas me-relay transaksi tanpa hambatan MetaMask!")
	fmt.Println("==================================================")
}
