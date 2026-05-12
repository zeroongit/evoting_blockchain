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

// VoterVerifierMetaData contains all meta data concerning the VoterVerifier contract.
var VoterVerifierMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"_pA\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[2][2]\",\"name\":\"_pB\",\"type\":\"uint256[2][2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"_pC\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"_pubSignals\",\"type\":\"uint256[2]\"}],\"name\":\"verifyProof\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
	Bin: "0x6080604052348015600e575f5ffd5b5061061f8061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610029575f3560e01c8063f5c9d69e1461002d575b5f5ffd5b61004760048036038101906100429190610550565b61005d565b60405161005491906105d0565b60405180910390f35b5f6104cd565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018110610092575f5f5260205ff35b50565b5f60405183815284602082015285604082015260408160608360076107d05a03fa9150816100c5575f5f5260205ff35b825160408201526020830151606082015260408360808360066107d05a03fa9150816100f3575f5f5260205ff35b505050505050565b5f608086015f87017f151361d4707fe9e7c16c758b0c7aae76010ae4b8a0c6a7803c6842bf3b61b37681527f140064172b47e0157b14fa91879e081d78dc93531131bfd70c0d1c040cdec044602082015261019b5f8801357f16ff871980d05f3dbeeb2b27860301913c5671abfccd30c5919d94f2cbacb19b7f2ec25aee9527c844ae90a867384c8a4421f5f79a7f56ac627316cfd9f9a8d36584610095565b6101eb60208801357f281d8d0fa24724c24990b2750d0c2e04b994f4e62350d2ffcc33c5cb7aae57ae7f1a89b859c96ffd4ec31735283e10110313c98f640a4570f91a657951cc842b6484610095565b833582527f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4760208501357f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4703066020830152843560408301526020850135606083015260408501356080830152606085013560a08301527f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e260c08301527f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d192660e08301527f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c6101008301527f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab6101208301527f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a76101408301527f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec86101608301525f88015161018083015260205f018801516101a08301527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c26101c08301527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed6101e08301527f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b6102008301527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa610220830152853561024083015260208601356102608301527f2b512f92ff07a1ffe8583b4bbe8f13c45c946fa9184dc5c0def9d4853ec400b56102808301527f1a5e0495483278f829348ab0f8a950f4115b7a7351869cf93caa91f24f378a096102a08301527f0e92face81b7c2c5bcfa389275e7ca95094175e3672dd0390dda3bd5e4cc1ed46102c08301527f10f52aedf8e586c87c772a5fa37b1a8b461d19718089193f62e008af6054dcda6102e08301526020826103008460086107d05a03fa82518116935050505095945050505050565b60405161038081016040526104e45f840135610063565b6104f16020840135610063565b6104fe818486888a6100fb565b805f5260205ff35b5f5ffd5b5f5ffd5b5f819050826020600202820111156105295761052861050a565b5b92915050565b5f8190508260406002028201111561054a5761054961050a565b5b92915050565b5f5f5f5f610140858703121561056957610568610506565b5b5f6105768782880161050e565b94505060406105878782880161052f565b93505060c06105988782880161050e565b9250506101006105aa8782880161050e565b91505092959194509250565b5f8115159050919050565b6105ca816105b6565b82525050565b5f6020820190506105e35f8301846105c1565b9291505056fea2646970667358221220612d5737d492d433b1f2fc0751b5f9d4208245a593071d442f4b54ddaa16bfca64736f6c63430008230033",
}

// VoterVerifierABI is the input ABI used to generate the binding from.
// Deprecated: Use VoterVerifierMetaData.ABI instead.
var VoterVerifierABI = VoterVerifierMetaData.ABI

// VoterVerifierBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use VoterVerifierMetaData.Bin instead.
var VoterVerifierBin = VoterVerifierMetaData.Bin

// DeployVoterVerifier deploys a new Ethereum contract, binding an instance of VoterVerifier to it.
func DeployVoterVerifier(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *VoterVerifier, error) {
	parsed, err := VoterVerifierMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(VoterVerifierBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &VoterVerifier{VoterVerifierCaller: VoterVerifierCaller{contract: contract}, VoterVerifierTransactor: VoterVerifierTransactor{contract: contract}, VoterVerifierFilterer: VoterVerifierFilterer{contract: contract}}, nil
}

// VoterVerifier is an auto generated Go binding around an Ethereum contract.
type VoterVerifier struct {
	VoterVerifierCaller     // Read-only binding to the contract
	VoterVerifierTransactor // Write-only binding to the contract
	VoterVerifierFilterer   // Log filterer for contract events
}

// VoterVerifierCaller is an auto generated read-only Go binding around an Ethereum contract.
type VoterVerifierCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// VoterVerifierTransactor is an auto generated write-only Go binding around an Ethereum contract.
type VoterVerifierTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// VoterVerifierFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type VoterVerifierFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// VoterVerifierSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type VoterVerifierSession struct {
	Contract     *VoterVerifier    // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// VoterVerifierCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type VoterVerifierCallerSession struct {
	Contract *VoterVerifierCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts        // Call options to use throughout this session
}

// VoterVerifierTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type VoterVerifierTransactorSession struct {
	Contract     *VoterVerifierTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts        // Transaction auth options to use throughout this session
}

// VoterVerifierRaw is an auto generated low-level Go binding around an Ethereum contract.
type VoterVerifierRaw struct {
	Contract *VoterVerifier // Generic contract binding to access the raw methods on
}

// VoterVerifierCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type VoterVerifierCallerRaw struct {
	Contract *VoterVerifierCaller // Generic read-only contract binding to access the raw methods on
}

// VoterVerifierTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type VoterVerifierTransactorRaw struct {
	Contract *VoterVerifierTransactor // Generic write-only contract binding to access the raw methods on
}

// NewVoterVerifier creates a new instance of VoterVerifier, bound to a specific deployed contract.
func NewVoterVerifier(address common.Address, backend bind.ContractBackend) (*VoterVerifier, error) {
	contract, err := bindVoterVerifier(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &VoterVerifier{VoterVerifierCaller: VoterVerifierCaller{contract: contract}, VoterVerifierTransactor: VoterVerifierTransactor{contract: contract}, VoterVerifierFilterer: VoterVerifierFilterer{contract: contract}}, nil
}

// NewVoterVerifierCaller creates a new read-only instance of VoterVerifier, bound to a specific deployed contract.
func NewVoterVerifierCaller(address common.Address, caller bind.ContractCaller) (*VoterVerifierCaller, error) {
	contract, err := bindVoterVerifier(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &VoterVerifierCaller{contract: contract}, nil
}

// NewVoterVerifierTransactor creates a new write-only instance of VoterVerifier, bound to a specific deployed contract.
func NewVoterVerifierTransactor(address common.Address, transactor bind.ContractTransactor) (*VoterVerifierTransactor, error) {
	contract, err := bindVoterVerifier(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &VoterVerifierTransactor{contract: contract}, nil
}

// NewVoterVerifierFilterer creates a new log filterer instance of VoterVerifier, bound to a specific deployed contract.
func NewVoterVerifierFilterer(address common.Address, filterer bind.ContractFilterer) (*VoterVerifierFilterer, error) {
	contract, err := bindVoterVerifier(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &VoterVerifierFilterer{contract: contract}, nil
}

// bindVoterVerifier binds a generic wrapper to an already deployed contract.
func bindVoterVerifier(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := VoterVerifierMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_VoterVerifier *VoterVerifierRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _VoterVerifier.Contract.VoterVerifierCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_VoterVerifier *VoterVerifierRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _VoterVerifier.Contract.VoterVerifierTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_VoterVerifier *VoterVerifierRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _VoterVerifier.Contract.VoterVerifierTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_VoterVerifier *VoterVerifierCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _VoterVerifier.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_VoterVerifier *VoterVerifierTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _VoterVerifier.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_VoterVerifier *VoterVerifierTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _VoterVerifier.Contract.contract.Transact(opts, method, params...)
}

// VerifyProof is a free data retrieval call binding the contract method 0xf5c9d69e.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[2] _pubSignals) view returns(bool)
func (_VoterVerifier *VoterVerifierCaller) VerifyProof(opts *bind.CallOpts, _pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [2]*big.Int) (bool, error) {
	var out []interface{}
	err := _VoterVerifier.contract.Call(opts, &out, "verifyProof", _pA, _pB, _pC, _pubSignals)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// VerifyProof is a free data retrieval call binding the contract method 0xf5c9d69e.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[2] _pubSignals) view returns(bool)
func (_VoterVerifier *VoterVerifierSession) VerifyProof(_pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [2]*big.Int) (bool, error) {
	return _VoterVerifier.Contract.VerifyProof(&_VoterVerifier.CallOpts, _pA, _pB, _pC, _pubSignals)
}

// VerifyProof is a free data retrieval call binding the contract method 0xf5c9d69e.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[2] _pubSignals) view returns(bool)
func (_VoterVerifier *VoterVerifierCallerSession) VerifyProof(_pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [2]*big.Int) (bool, error) {
	return _VoterVerifier.Contract.VerifyProof(&_VoterVerifier.CallOpts, _pA, _pB, _pC, _pubSignals)
}
