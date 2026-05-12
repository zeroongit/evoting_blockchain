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

// VoteVerifierMetaData contains all meta data concerning the VoteVerifier contract.
var VoteVerifierMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"_pA\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[2][2]\",\"name\":\"_pB\",\"type\":\"uint256[2][2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"_pC\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[4]\",\"name\":\"_pubSignals\",\"type\":\"uint256[4]\"}],\"name\":\"verifyProof\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
	Bin: "0x6080604052348015600e575f5ffd5b506106fa8061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610029575f3560e01c80635fe8c13b1461002d575b5f5ffd5b6100476004803603810190610042919061062b565b61005d565b60405161005491906106ab565b60405180910390f35b5f61056d565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018110610092575f5f5260205ff35b50565b5f60405183815284602082015285604082015260408160608360076107d05a03fa9150816100c5575f5f5260205ff35b825160408201526020830151606082015260408360808360066107d05a03fa9150816100f3575f5f5260205ff35b505050505050565b5f608086015f87017f04c6712cbaabc7c5db68097450d4db978eaa78c6df3abcacd8b4ec1208baea4f81527f15fc2f73f23129e4e1cff0b5dc1328c37bc74e01373579a5fda6d2e77a335a4b602082015261019b5f8801357f2a50b381fdf706b822b551e7f9a6fba9f2173e5787f8b4058e2a212dfa1929ed7f2c8363529a184cf226978c9a1099cc8f3e788c5e6100f7284bc3dfe7b88f941a84610095565b6101eb60208801357f032cd26ffe7a9c26f367102da2c98a164139c6f3f561db08e4cd52dec432e8327f18ad50993e093962ef10ad81d78f81a0d1c57941c3c99c51be7f7f1f5df972a884610095565b61023b60408801357f011d14d9ccacd352650dabb4a429e09f3c2e883d52404a2373bf3f92c16d97647f29658134dcef646c81de06c364ffbc17362441bca14ecd27a4b2de8806831e7084610095565b61028b60608801357f07a4d3c9a12cc5000b894abaaf026a0908c01e88536fbcf1a8fda14763fdc1c17f0df66ddf1a828648abd427ca8b0de1b0b20869e1fc59a49871f736838f67a25f84610095565b833582527f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4760208501357f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4703066020830152843560408301526020850135606083015260408501356080830152606085013560a08301527f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e260c08301527f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d192660e08301527f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c6101008301527f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab6101208301527f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a76101408301527f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec86101608301525f88015161018083015260205f018801516101a08301527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c26101c08301527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed6101e08301527f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b6102008301527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa610220830152853561024083015260208601356102608301527f18f9933ccdab23f4bcd55906039cb8603eaeb36df906a7aa5561f26ed87313e16102808301527f1be7f7c0746578de0dd48ebc82db0770d622a16ea42fe07f60844ddda1e801656102a08301527f229902d8c732249f7d3a38712c58f2bcccc4a8e3716d0a8838b572e10f135f9d6102c08301527f2997bc6ae18ec63dd77da35b2729eaa36943dd48a1cfc32b8e0ab412f129d7c06102e08301526020826103008460086107d05a03fa82518116935050505095945050505050565b60405161038081016040526105845f840135610063565b6105916020840135610063565b61059e6040840135610063565b6105ab6060840135610063565b6105b8818486888a6100fb565b805f5260205ff35b5f5ffd5b5f5ffd5b5f819050826020600202820111156105e3576105e26105c4565b5b92915050565b5f81905082604060020282011115610604576106036105c4565b5b92915050565b5f81905082602060040282011115610625576106246105c4565b5b92915050565b5f5f5f5f6101808587031215610644576106436105c0565b5b5f610651878288016105c8565b9450506040610662878288016105e9565b93505060c0610673878288016105c8565b9250506101006106858782880161060a565b91505092959194509250565b5f8115159050919050565b6106a581610691565b82525050565b5f6020820190506106be5f83018461069c565b9291505056fea2646970667358221220812a205de4bc2d0534e4927f7289bbd3be7be7fe7f71577aadf1dd5a2bbe132664736f6c63430008230033",
}

// VoteVerifierABI is the input ABI used to generate the binding from.
// Deprecated: Use VoteVerifierMetaData.ABI instead.
var VoteVerifierABI = VoteVerifierMetaData.ABI

// VoteVerifierBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use VoteVerifierMetaData.Bin instead.
var VoteVerifierBin = VoteVerifierMetaData.Bin

// DeployVoteVerifier deploys a new Ethereum contract, binding an instance of VoteVerifier to it.
func DeployVoteVerifier(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *VoteVerifier, error) {
	parsed, err := VoteVerifierMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(VoteVerifierBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &VoteVerifier{VoteVerifierCaller: VoteVerifierCaller{contract: contract}, VoteVerifierTransactor: VoteVerifierTransactor{contract: contract}, VoteVerifierFilterer: VoteVerifierFilterer{contract: contract}}, nil
}

// VoteVerifier is an auto generated Go binding around an Ethereum contract.
type VoteVerifier struct {
	VoteVerifierCaller     // Read-only binding to the contract
	VoteVerifierTransactor // Write-only binding to the contract
	VoteVerifierFilterer   // Log filterer for contract events
}

// VoteVerifierCaller is an auto generated read-only Go binding around an Ethereum contract.
type VoteVerifierCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// VoteVerifierTransactor is an auto generated write-only Go binding around an Ethereum contract.
type VoteVerifierTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// VoteVerifierFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type VoteVerifierFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// VoteVerifierSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type VoteVerifierSession struct {
	Contract     *VoteVerifier     // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// VoteVerifierCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type VoteVerifierCallerSession struct {
	Contract *VoteVerifierCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts       // Call options to use throughout this session
}

// VoteVerifierTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type VoteVerifierTransactorSession struct {
	Contract     *VoteVerifierTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts       // Transaction auth options to use throughout this session
}

// VoteVerifierRaw is an auto generated low-level Go binding around an Ethereum contract.
type VoteVerifierRaw struct {
	Contract *VoteVerifier // Generic contract binding to access the raw methods on
}

// VoteVerifierCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type VoteVerifierCallerRaw struct {
	Contract *VoteVerifierCaller // Generic read-only contract binding to access the raw methods on
}

// VoteVerifierTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type VoteVerifierTransactorRaw struct {
	Contract *VoteVerifierTransactor // Generic write-only contract binding to access the raw methods on
}

// NewVoteVerifier creates a new instance of VoteVerifier, bound to a specific deployed contract.
func NewVoteVerifier(address common.Address, backend bind.ContractBackend) (*VoteVerifier, error) {
	contract, err := bindVoteVerifier(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &VoteVerifier{VoteVerifierCaller: VoteVerifierCaller{contract: contract}, VoteVerifierTransactor: VoteVerifierTransactor{contract: contract}, VoteVerifierFilterer: VoteVerifierFilterer{contract: contract}}, nil
}

// NewVoteVerifierCaller creates a new read-only instance of VoteVerifier, bound to a specific deployed contract.
func NewVoteVerifierCaller(address common.Address, caller bind.ContractCaller) (*VoteVerifierCaller, error) {
	contract, err := bindVoteVerifier(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &VoteVerifierCaller{contract: contract}, nil
}

// NewVoteVerifierTransactor creates a new write-only instance of VoteVerifier, bound to a specific deployed contract.
func NewVoteVerifierTransactor(address common.Address, transactor bind.ContractTransactor) (*VoteVerifierTransactor, error) {
	contract, err := bindVoteVerifier(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &VoteVerifierTransactor{contract: contract}, nil
}

// NewVoteVerifierFilterer creates a new log filterer instance of VoteVerifier, bound to a specific deployed contract.
func NewVoteVerifierFilterer(address common.Address, filterer bind.ContractFilterer) (*VoteVerifierFilterer, error) {
	contract, err := bindVoteVerifier(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &VoteVerifierFilterer{contract: contract}, nil
}

// bindVoteVerifier binds a generic wrapper to an already deployed contract.
func bindVoteVerifier(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := VoteVerifierMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_VoteVerifier *VoteVerifierRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _VoteVerifier.Contract.VoteVerifierCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_VoteVerifier *VoteVerifierRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _VoteVerifier.Contract.VoteVerifierTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_VoteVerifier *VoteVerifierRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _VoteVerifier.Contract.VoteVerifierTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_VoteVerifier *VoteVerifierCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _VoteVerifier.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_VoteVerifier *VoteVerifierTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _VoteVerifier.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_VoteVerifier *VoteVerifierTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _VoteVerifier.Contract.contract.Transact(opts, method, params...)
}

// VerifyProof is a free data retrieval call binding the contract method 0x5fe8c13b.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[4] _pubSignals) view returns(bool)
func (_VoteVerifier *VoteVerifierCaller) VerifyProof(opts *bind.CallOpts, _pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [4]*big.Int) (bool, error) {
	var out []interface{}
	err := _VoteVerifier.contract.Call(opts, &out, "verifyProof", _pA, _pB, _pC, _pubSignals)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// VerifyProof is a free data retrieval call binding the contract method 0x5fe8c13b.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[4] _pubSignals) view returns(bool)
func (_VoteVerifier *VoteVerifierSession) VerifyProof(_pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [4]*big.Int) (bool, error) {
	return _VoteVerifier.Contract.VerifyProof(&_VoteVerifier.CallOpts, _pA, _pB, _pC, _pubSignals)
}

// VerifyProof is a free data retrieval call binding the contract method 0x5fe8c13b.
//
// Solidity: function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[4] _pubSignals) view returns(bool)
func (_VoteVerifier *VoteVerifierCallerSession) VerifyProof(_pA [2]*big.Int, _pB [2][2]*big.Int, _pC [2]*big.Int, _pubSignals [4]*big.Int) (bool, error) {
	return _VoteVerifier.Contract.VerifyProof(&_VoteVerifier.CallOpts, _pA, _pB, _pC, _pubSignals)
}
