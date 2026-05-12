// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package blockchain

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// AuthorityVerifierMetaData contains all meta data concerning the AuthorityVerifier contract.
var AuthorityVerifierMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"_pA\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[2][2]\",\"name\":\"_pB\",\"type\":\"uint256[2][2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"_pC\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[3]\",\"name\":\"_pubSignals\",\"type\":\"uint256[3]\"}],\"name\":\"verifyProof\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
	Bin: "0x6080604052348015600e575f5ffd5b5061069d8061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610029575f3560e01c806311479fea1461002d575b5f5ffd5b610047600480360381019061004291906105ce565b61005d565b604051610054919061064e565b60405180910390f35b5f61051d565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018110610092575f5f5260205ff35b50565b5f60405183815284602082015285604082015260408160608360076107d05a03fa9150816100c5575f5f5260205ff35b825160408201526020830151606082015260408360808360066107d05a03fa9150816100f3575f5f5260205ff35b505050505050565b5f608086015f87017f2a7b20929a1cf669eec24d09b5cb4d71e7feb7fe56ad0d0e26b9cac5f4b0539181527f0f6eb5fe55310d0e0750bf0a34fc3b8a26256f7e11d38a7969fb48aeea3c74d8602082015261019b5f8801357f026bb126687425cfb670273764c48039d5055c3ab25941930e18881935151c137f2b4139cc50e3fcdbcf373f2df0d806f35f45670c6920c0cbc44d35ac54eccc0684610095565b6101eb60208801357f09bd1c261b89bfa2cf55e410c93db4f21c9e97a7815e0dec13a11b43ae41935a7f178fd2ac09ee14c401af5631add3972f1f4f02b8cd06b92cf31c545652952e4184610095565b61023b60408801357f014da4d51803d16d17b24a0001f1433e92bf460fe101f0d4084c075892aea0f37f1b21badc39746ea7868721a582f4e0a4f76460bb9a017a6de3432049e8cd461384610095565b833582527f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4760208501357f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4703066020830152843560408301526020850135606083015260408501356080830152606085013560a08301527f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e260c08301527f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d192660e08301527f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c6101008301527f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab6101208301527f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a76101408301527f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec86101608301525f88015161018083015260205f018801516101a08301527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c26101c08301527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed6101e08301527f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b6102008301527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa610220830152853561024083015260208601356102608301527f2b61bdbdac342e191cf322c64bd5df830ab6993e4db2721cc2ac33ec2108e2776102808301527f1faeb8bcc4ca250779250b314462d444a2731baa0780fd28984008706b70a4cc6102a08301527f10e977c8c3b35589895624cdc620ea029b2c32afdbee853ce76f2aad7c4ac8866102c08301527f2b2905d4632ba17909f194574b43f10fb547164067bc149e8d438b604df0945d6102e08301526020826103008460086107d05a03fa82518116935050505095945050505050565b60405161038081016040526105345f840135610063565b6105416020840135610063565b61054e6040840135610063565b61055b818486888a6100fb565b805f5260205ff35b5f5ffd5b5f5ffd5b5f8190508260206002028201111561058657610585610567565b5b92915050565b5f819050826040600202820111156105a7576105a6610567565b5b92915050565b5f819050826020600302820111156105c8576105c7610567565b5b92915050565b5f5f5f5f61016085870312156105e7576105e6610563565b5b5f6105f48782880161056b565b94505060406106058782880161058c565b93505060c06106168782880161056b565b925050610100610628878288016105ad565b91505092959194509250565b5f8115159050919050565b61064881610634565b82525050565b5f6020820190506106615f83018461063f565b9291505056fea2646970667358221220084f8cb49e7d500bd49cb89bf055779109d2fbf0c71f82402e15513210a18d9464736f6c63430008230033",
}

// AuthorityVerifierABI is the input ABI used to generate the binding from.
// Deprecated: Use AuthorityVerifierMetaData.ABI instead.
var AuthorityVerifierABI = AuthorityVerifierMetaData.ABI

// AuthorityVerifierBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use AuthorityVerifierMetaData.Bin instead.
var AuthorityVerifierBin = AuthorityVerifierMetaData.Bin

// DeployAuthorityVerifier deploys a new Ethereum contract, binding an instance of AuthorityVerifier to it.
func DeployAuthorityVerifier(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *AuthorityVerifier, error) {
	parsed, err := AuthorityVerifierMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(AuthorityVerifierBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &AuthorityVerifier{AuthorityVerifierCaller: AuthorityVerifierCaller{contract: contract}, AuthorityVerifierTransactor: AuthorityVerifierTransactor{contract: contract}, AuthorityVerifierFilterer: AuthorityVerifierFilterer{contract: contract}}, nil
}

// AuthorityVerifier is an auto generated Go binding around an Ethereum contract.
type AuthorityVerifier struct {
	AuthorityVerifierCaller     // Read-only binding to the contract
	AuthorityVerifierTransactor // Write-only binding to the contract
	AuthorityVerifierFilterer   // Log filterer for contract events
}

// AuthorityVerifierCaller is an auto generated read-only Go binding around an Ethereum contract.
type AuthorityVerifierCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// AuthorityVerifierTransactor is an auto generated write-only Go binding around an Ethereum contract.
type AuthorityVerifierTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// AuthorityVerifierFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type AuthorityVerifierFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// AuthorityVerifierSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type AuthorityVerifierSession struct {
	Contract     *AuthorityVerifier // Generic contract binding to set the session for
	CallOpts     bind.CallOpts      // Call options to use throughout this session
	TransactOpts bind.TransactOpts  // Transaction auth options to use throughout this session
}

// AuthorityVerifierCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type AuthorityVerifierCallerSession struct {
	Contract *AuthorityVerifierCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts            // Call options to use throughout this session
}

// AuthorityVerifierTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type AuthorityVerifierTransactorSession struct {
	Contract     *AuthorityVerifierTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts            // Transaction auth options to use throughout this session
}

// AuthorityVerifierRaw is an auto generated low-level Go binding around an Ethereum contract.
type AuthorityVerifierRaw struct {
	Contract *AuthorityVerifier // Generic contract binding to access the raw methods on
}

// AuthorityVerifierCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type AuthorityVerifierCallerRaw struct {
	Contract *AuthorityVerifierCaller // Generic read-only contract binding to access the raw methods on
}

// AuthorityVerifierTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type AuthorityVerifierTransactorRaw struct {
	Contract *AuthorityVerifierTransactor // Generic write-only contract binding to access the raw methods on
}

// NewAuthorityVerifier creates a new instance of AuthorityVerifier, bound to a specific deployed contract.
func NewAuthorityVerifier(address common.Address, backend bind.ContractBackend) (*AuthorityVerifier, error) {
	contract, err := bindAuthorityVerifier(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &AuthorityVerifier{AuthorityVerifierCaller: AuthorityVerifierCaller{contract: contract}, AuthorityVerifierTransactor: AuthorityVerifierTransactor{contract: contract}, AuthorityVerifierFilterer: AuthorityVerifierFilterer{contract: contract}}, nil
}

// NewAuthorityVerifierCaller creates a new read-only instance of AuthorityVerifier, bound to a specific deployed contract.
func NewAuthorityVerifierCaller(address common.Address, caller bind.ContractCaller) (*AuthorityVerifierCaller, error) {
	contract, err := bindAuthorityVerifier(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &AuthorityVerifierCaller{contract: contract}, nil
}

// NewAuthorityVerifierTransactor creates a new write-only instance of AuthorityVerifier, bound to a specific deployed contract.
func NewAuthorityVerifierTransactor(address common.Address, transactor bind.ContractTransactor) (*AuthorityVerifierTransactor, error) {
	contract, err := bindAuthorityVerifier(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &AuthorityVerifierTransactor{contract: contract}, nil
}

// NewAuthorityVerifierFilterer creates a new log filterer instance of AuthorityVerifier, bound to a specific deployed contract.
func NewAuthorityVerifierFilterer(address common.Address, filterer bind.ContractFilterer) (*AuthorityVerifierFilterer, error) {
	contract, err := bindAuthorityVerifier(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &AuthorityVerifierFilterer{contract: contract}, nil
}

// bindAuthorityVerifier binds a generic wrapper to an already deployed contract.
func bindAuthorityVerifier(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := AuthorityVerifierMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_AuthorityVerifier *AuthorityVerifierRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _AuthorityVerifier.Contract.AuthorityVerifierCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_AuthorityVerifier *AuthorityVerifierRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _AuthorityVerifier.Contract.AuthorityVerifierTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_AuthorityVerifier *AuthorityVerifierRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _AuthorityVerifier.Contract.AuthorityVerifierTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_AuthorityVerifier *AuthorityVerifierCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _AuthorityVerifier.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_AuthorityVerifier *AuthorityVerifierTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _AuthorityVerifier.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_AuthorityVerifier *AuthorityVerifierTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _AuthorityVerifier.Contract.contract.Transact(opts, method, params...)
}

// VerifyProof is a free data retrieval call binding the contract method 0x11479fea.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[3] _pubSignals) view returns(bool)
func (_AuthorityVerifier *AuthorityVerifierCaller) VerifyProof(opts *bind.CallOpts, _pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [3]*big.Int) (bool, error) {
	var out []interface{}
	err := _AuthorityVerifier.contract.Call(opts, &out, "verifyProof", _pA, _pB, _pC, _pubSignals)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// VerifyProof is a free data retrieval call binding the contract method 0x11479fea.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[3] _pubSignals) view returns(bool)
func (_AuthorityVerifier *AuthorityVerifierSession) VerifyProof(_pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [3]*big.Int) (bool, error) {
	return _AuthorityVerifier.Contract.VerifyProof(&_AuthorityVerifier.CallOpts, _pA, _pB, _pC, _pubSignals)
}

// VerifyProof is a free data retrieval call binding the contract method 0x11479fea.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[3] _pubSignals) view returns(bool)
func (_AuthorityVerifier *AuthorityVerifierCallerSession) VerifyProof(_pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [3]*big.Int) (bool, error) {
	return _AuthorityVerifier.Contract.VerifyProof(&_AuthorityVerifier.CallOpts, _pA, _pB, _pC, _pubSignals)
}
