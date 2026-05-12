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

// HumanityVerifierMetaData contains all meta data concerning the HumanityVerifier contract.
var HumanityVerifierMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"_pA\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[2][2]\",\"name\":\"_pB\",\"type\":\"uint256[2][2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"_pC\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[3]\",\"name\":\"_pubSignals\",\"type\":\"uint256[3]\"}],\"name\":\"verifyProof\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
	Bin: "0x6080604052348015600e575f5ffd5b5061069c8061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610029575f3560e01c806311479fea1461002d575b5f5ffd5b610047600480360381019061004291906105cd565b61005d565b604051610054919061064d565b60405180910390f35b5f61051c565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018110610092575f5f5260205ff35b50565b5f60405183815284602082015285604082015260408160608360076107d05a03fa9150816100c5575f5f5260205ff35b825160408201526020830151606082015260408360808360066107d05a03fa9150816100f3575f5f5260205ff35b505050505050565b5f608086015f87017f30002efb643fbd806e89d2c000630530b3dce1a6faca8a8cbd86271ba38afffd81527f0de97ec9eeb80801056658fd3408b318c8da1c0d096f719a7636b2388003ca10602082015261019a5f8801357ed9a7ebda4ca864e5c6e69fb53d2eb7f55ee3f8bd1996a75acfd82ef5a542567f1ea7aa588fae8b3c118a64a28dfb9a25a80776b4875653352dbd5cfb55ae36d484610095565b6101ea60208801357f07f8e07a0579a1dacd20b4a83dc6c56a963940ca8072e0ca2d45c6da7315e75e7f22cd6567581a2da3257bba7ca1e8fbf0525158e3270507bd6b8a34b6711c8aa584610095565b61023a60408801357f28eb4a52b79c61d4038951cc5694c055c4df7597ad934d0e8641b3c7fe33538f7f10e5d4da6bcb2545e4d3628052bb014bbd9d1dca33671933a2f23deb9b07ae3684610095565b833582527f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4760208501357f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4703066020830152843560408301526020850135606083015260408501356080830152606085013560a08301527f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e260c08301527f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d192660e08301527f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c6101008301527f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab6101208301527f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a76101408301527f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec86101608301525f88015161018083015260205f018801516101a08301527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c26101c08301527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed6101e08301527f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b6102008301527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa610220830152853561024083015260208601356102608301527f24b8c36486b0c2d1d2e3d79f99a7754666df0a6bf82923872f48b53255792a9e6102808301527f03b7764f5142d446405e421f3016374befadb4eff77661f629303bc29757e8106102a08301527f01ce4ad2fb161be028f3a717e916340c4ed1cfea87a7d087c050d15ce232845c6102c08301527f2c6f010e24d9e86b4161163a0e039c4694907be3239b6b35ca129517a0a2a9c46102e08301526020826103008460086107d05a03fa82518116935050505095945050505050565b60405161038081016040526105335f840135610063565b6105406020840135610063565b61054d6040840135610063565b61055a818486888a6100fb565b805f5260205ff35b5f5ffd5b5f5ffd5b5f8190508260206002028201111561058557610584610566565b5b92915050565b5f819050826040600202820111156105a6576105a5610566565b5b92915050565b5f819050826020600302820111156105c7576105c6610566565b5b92915050565b5f5f5f5f61016085870312156105e6576105e5610562565b5b5f6105f38782880161056a565b94505060406106048782880161058b565b93505060c06106158782880161056a565b925050610100610627878288016105ac565b91505092959194509250565b5f8115159050919050565b61064781610633565b82525050565b5f6020820190506106605f83018461063e565b9291505056fea2646970667358221220bacf9f7dd3a5cb9b86272c512a5a697138e52cc478ebdc9e7f24b25e208d464164736f6c63430008230033",
}

// HumanityVerifierABI is the input ABI used to generate the binding from.
// Deprecated: Use HumanityVerifierMetaData.ABI instead.
var HumanityVerifierABI = HumanityVerifierMetaData.ABI

// HumanityVerifierBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use HumanityVerifierMetaData.Bin instead.
var HumanityVerifierBin = HumanityVerifierMetaData.Bin

// DeployHumanityVerifier deploys a new Ethereum contract, binding an instance of HumanityVerifier to it.
func DeployHumanityVerifier(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *HumanityVerifier, error) {
	parsed, err := HumanityVerifierMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(HumanityVerifierBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &HumanityVerifier{HumanityVerifierCaller: HumanityVerifierCaller{contract: contract}, HumanityVerifierTransactor: HumanityVerifierTransactor{contract: contract}, HumanityVerifierFilterer: HumanityVerifierFilterer{contract: contract}}, nil
}

// HumanityVerifier is an auto generated Go binding around an Ethereum contract.
type HumanityVerifier struct {
	HumanityVerifierCaller     // Read-only binding to the contract
	HumanityVerifierTransactor // Write-only binding to the contract
	HumanityVerifierFilterer   // Log filterer for contract events
}

// HumanityVerifierCaller is an auto generated read-only Go binding around an Ethereum contract.
type HumanityVerifierCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HumanityVerifierTransactor is an auto generated write-only Go binding around an Ethereum contract.
type HumanityVerifierTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HumanityVerifierFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type HumanityVerifierFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HumanityVerifierSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type HumanityVerifierSession struct {
	Contract     *HumanityVerifier // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// HumanityVerifierCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type HumanityVerifierCallerSession struct {
	Contract *HumanityVerifierCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts           // Call options to use throughout this session
}

// HumanityVerifierTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type HumanityVerifierTransactorSession struct {
	Contract     *HumanityVerifierTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts           // Transaction auth options to use throughout this session
}

// HumanityVerifierRaw is an auto generated low-level Go binding around an Ethereum contract.
type HumanityVerifierRaw struct {
	Contract *HumanityVerifier // Generic contract binding to access the raw methods on
}

// HumanityVerifierCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type HumanityVerifierCallerRaw struct {
	Contract *HumanityVerifierCaller // Generic read-only contract binding to access the raw methods on
}

// HumanityVerifierTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type HumanityVerifierTransactorRaw struct {
	Contract *HumanityVerifierTransactor // Generic write-only contract binding to access the raw methods on
}

// NewHumanityVerifier creates a new instance of HumanityVerifier, bound to a specific deployed contract.
func NewHumanityVerifier(address common.Address, backend bind.ContractBackend) (*HumanityVerifier, error) {
	contract, err := bindHumanityVerifier(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &HumanityVerifier{HumanityVerifierCaller: HumanityVerifierCaller{contract: contract}, HumanityVerifierTransactor: HumanityVerifierTransactor{contract: contract}, HumanityVerifierFilterer: HumanityVerifierFilterer{contract: contract}}, nil
}

// NewHumanityVerifierCaller creates a new read-only instance of HumanityVerifier, bound to a specific deployed contract.
func NewHumanityVerifierCaller(address common.Address, caller bind.ContractCaller) (*HumanityVerifierCaller, error) {
	contract, err := bindHumanityVerifier(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &HumanityVerifierCaller{contract: contract}, nil
}

// NewHumanityVerifierTransactor creates a new write-only instance of HumanityVerifier, bound to a specific deployed contract.
func NewHumanityVerifierTransactor(address common.Address, transactor bind.ContractTransactor) (*HumanityVerifierTransactor, error) {
	contract, err := bindHumanityVerifier(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &HumanityVerifierTransactor{contract: contract}, nil
}

// NewHumanityVerifierFilterer creates a new log filterer instance of HumanityVerifier, bound to a specific deployed contract.
func NewHumanityVerifierFilterer(address common.Address, filterer bind.ContractFilterer) (*HumanityVerifierFilterer, error) {
	contract, err := bindHumanityVerifier(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &HumanityVerifierFilterer{contract: contract}, nil
}

// bindHumanityVerifier binds a generic wrapper to an already deployed contract.
func bindHumanityVerifier(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := HumanityVerifierMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_HumanityVerifier *HumanityVerifierRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _HumanityVerifier.Contract.HumanityVerifierCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_HumanityVerifier *HumanityVerifierRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _HumanityVerifier.Contract.HumanityVerifierTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_HumanityVerifier *HumanityVerifierRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _HumanityVerifier.Contract.HumanityVerifierTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_HumanityVerifier *HumanityVerifierCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _HumanityVerifier.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_HumanityVerifier *HumanityVerifierTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _HumanityVerifier.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_HumanityVerifier *HumanityVerifierTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _HumanityVerifier.Contract.contract.Transact(opts, method, params...)
}

// VerifyProof is a free data retrieval call binding the contract method 0x11479fea.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[3] _pubSignals) view returns(bool)
func (_HumanityVerifier *HumanityVerifierCaller) VerifyProof(opts *bind.CallOpts, _pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [3]*big.Int) (bool, error) {
	var out []interface{}
	err := _HumanityVerifier.contract.Call(opts, &out, "verifyProof", _pA, _pB, _pC, _pubSignals)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// VerifyProof is a free data retrieval call binding the contract method 0x11479fea.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[3] _pubSignals) view returns(bool)
func (_HumanityVerifier *HumanityVerifierSession) VerifyProof(_pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [3]*big.Int) (bool, error) {
	return _HumanityVerifier.Contract.VerifyProof(&_HumanityVerifier.CallOpts, _pA, _pB, _pC, _pubSignals)
}

// VerifyProof is a free data retrieval call binding the contract method 0x11479fea.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[3] _pubSignals) view returns(bool)
func (_HumanityVerifier *HumanityVerifierCallerSession) VerifyProof(_pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [3]*big.Int) (bool, error) {
	return _HumanityVerifier.Contract.VerifyProof(&_HumanityVerifier.CallOpts, _pA, _pB, _pC, _pubSignals)
}
