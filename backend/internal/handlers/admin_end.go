package handlers

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-gonic/gin"

	"evoting_pemilu/internal/blockchain"
)

func EndElection(c *gin.Context) {
	var payload ElectionControlPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	rpcURL := getEnv("AVALANCHE_RPC_URL", "https://api.avax-test.network/ext/bc/C/rpc")
	privateKeyHex := os.Getenv("RELAYER_PRIVATE_KEY")
	contractAddressHex := os.Getenv("CONTRACT_ADDRESS")

	if privateKeyHex == "" || privateKeyHex == "your_avalanche_wallet_private_key_here" || privateKeyHex == "${RELAYER_PRIVATE_KEY}" {
		IsVotingActive = false
		c.JSON(http.StatusOK, gin.H{"message": "Mode simulasi (tanpa private key). Voting dinyatakan selesai.", "txHash": "0xsimulatedend0000"})
		return
	}

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gagal koneksi RPC: %v", err)})
		return
	}
	defer client.Close()

	privateKey, err := crypto.HexToECDSA(strings.TrimPrefix(privateKeyHex, "0x"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Private key tidak valid"})
		return
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error membaca public key"})
		return
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gagal mendapatkan nonce: %v", err)})
		return
	}

	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gagal mendapatkan gas price: %v", err)})
		return
	}

	chainID := big.NewInt(43113) // Fuji testnet
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal inisialisasi transactor"})
		return
	}
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(300000)
	auth.GasPrice = gasPrice

	if contractAddressHex == "" {
		contractAddressHex = "0x0000000000000000000000000000000000000000"
	}
	contractAddress := common.HexToAddress(contractAddressHex)

	evotingContract, err := blockchain.NewEVoting(contractAddress, client)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal inisialisasi kontrak"})
		return
	}

	electionIdObj := big.NewInt(payload.ElectionID)

	tx, err := evotingContract.EndElection(auth, electionIdObj)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Eksekusi kontrak gagal: %v", err)})
		return
	}

	// TUNGGU HINGGA TRANSAKSI SELESAI DITAMBANG (MINED) DI BLOCKCHAIN AVALANCHE
	receipt, err := bind.WaitMined(context.Background(), client, tx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gagal menunggu konfirmasi blok: %v", err)})
		return
	}

	if receipt.Status == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaksi EndElection ditolak (revert) oleh Smart Contract"})
		return
	}

	IsVotingActive = false

	c.JSON(http.StatusOK, gin.H{
		"message": "Pemilihan berhasil dihentikan",
		"txHash":  tx.Hash().Hex(),
	})
}
