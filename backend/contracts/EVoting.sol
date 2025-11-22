// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input // PENTING: Pastikan angka [1] ini sesuai jumlah public signal di circuit kamu
    ) external view returns (bool);
}

contract EVoting is Ownable {
    // Using simple uint256 counter instead (OpenZeppelin v5 compatible)

    // Election states
    enum ElectionState { Pending, Active, Ended, Finalized }

    // Structures
    struct Election {
        uint256 id;
        string title;
        string ipfsHash;
        uint256 startTime;
        uint256 endTime;
        ElectionState state;
        address[] authorities;
        uint256 candidateCount;
        bool humanityCheckRequired;
    }

    struct Candidate {
        uint256 id;
        string name;
        string ipfsHash;
        uint256 voteCount;
    }

    struct Vote {
        bytes nullifier;
        uint256 candidateId;
        bytes proof;
        uint256 timestamp;
    }

    // State variables
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => Vote[]) public votes;
    mapping(bytes => bool) public usedNullifiers;
    mapping(address => bool) public authorities;
    mapping(address => bool) public humanVerified;

    uint256 private electionCounter;
    
    IVerifier public voterVerifier;
    IVerifier public voteVerifier;
    IVerifier public humanityVerifier;
    IVerifier public authorityVerifier;

    // Events
    event ElectionCreated(uint256 indexed electionId, string title);
    event ElectionStarted(uint256 indexed electionId);
    event ElectionEnded(uint256 indexed electionId);
    event VoteCasted(uint256 indexed electionId, uint256 indexed candidateId);
    event HumanityVerified(address indexed voter);
    event AuthorityAdded(address indexed authority);

    // Modifiers
    modifier onlyAuthority() {
        require(authorities[msg.sender], "Not an authority");
        _;
    }

    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].state == ElectionState.Active, "Election not active");
        _;
    }

    modifier onlyIfHumanityRequired(uint256 _electionId) {
        if (elections[_electionId].humanityCheckRequired) {
            require(humanVerified[msg.sender], "Humanity check required");
        }
        _;
    }

    constructor(
        address _voterVerifier,
        address _voteVerifier,
        address _humanityVerifier,
        address _authorityVerifier
    ) Ownable(msg.sender) {
        voterVerifier = IVerifier(_voterVerifier);
        voteVerifier = IVerifier(_voteVerifier);
        humanityVerifier = IVerifier(_humanityVerifier);
        authorityVerifier = IVerifier(_authorityVerifier);
        authorities[msg.sender] = true;
    }

    // Authority Management
    function addAuthority(address _authority) external onlyOwner {
        authorities[_authority] = true;
        emit AuthorityAdded(_authority);
    }

    function removeAuthority(address _authority) external onlyOwner {
        authorities[_authority] = false;
    }

    // Election Management
    function createElection(
        string memory _title,
        string memory _ipfsHash,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _candidateCount,
        bool _requireHumanity
    ) external onlyAuthority returns (uint256) {
        require(_startTime < _endTime, "Invalid times");

        uint256 electionId = electionCounter;
        electionCounter++;

        Election storage election = elections[electionId];
        election.id = electionId;
        election.title = _title;
        election.ipfsHash = _ipfsHash;
        election.startTime = _startTime;
        election.endTime = _endTime;
        election.state = ElectionState.Pending;
        election.candidateCount = _candidateCount;
        election.humanityCheckRequired = _requireHumanity;
        election.authorities.push(msg.sender);

        emit ElectionCreated(electionId, _title);
        return electionId;
    }

    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _ipfsHash
    ) external onlyAuthority {
        require(elections[_electionId].state == ElectionState.Pending, "Election not pending");

        uint256 candidateId = elections[_electionId].candidateCount;
        Candidate storage candidate = candidates[_electionId][candidateId];
        candidate.id = candidateId;
        candidate.name = _name;
        candidate.ipfsHash = _ipfsHash;
        candidate.voteCount = 0;

        elections[_electionId].candidateCount++;
    }

    function startElection(uint256 _electionId) external onlyAuthority {
        require(elections[_electionId].state == ElectionState.Pending, "Invalid state");
        elections[_electionId].state = ElectionState.Active;
        emit ElectionStarted(_electionId);
    }

    function endElection(uint256 _electionId) external onlyAuthority {
        require(elections[_electionId].state == ElectionState.Active, "Not active");
        elections[_electionId].state = ElectionState.Ended;
        emit ElectionEnded(_electionId);
    }

    // Human Verification
    function verifyHumanity(
            bytes memory _proof,
            uint[1] memory _publicSignals // Ubah jadi uint array agar lebih aman
        ) external {
            // Decode bytes proof menjadi format a, b, c milik SnarkJS
            (uint[2] memory a, uint[2][2] memory b, uint[2] memory c) = 
                abi.decode(_proof, (uint[2], uint[2][2], uint[2]));

            // Panggil verifyProof (bukan verify)
            require(humanityVerifier.verifyProof(a, b, c, _publicSignals), "Invalid humanity proof");
            
            humanVerified[msg.sender] = true;
            emit HumanityVerified(msg.sender);
        }

    // Voting
    function castVote(
        uint256 _electionId,
        uint256 _candidateId,
        bytes memory _nullifier, // Nullifier biasanya tetap bytes atau uint
        bytes memory _proof
    ) external electionActive(_electionId) onlyIfHumanityRequired(_electionId) {
        require(_candidateId < elections[_electionId].candidateCount, "Invalid candidate");
        require(!usedNullifiers[_nullifier], "Vote already cast");

        // Decode proof
        (uint[2] memory a, uint[2][2] memory b, uint[2] memory c) = 
            abi.decode(_proof, (uint[2], uint[2][2], uint[2]));

        // Konversi nullifier ke format public signal (biasanya uint256)
        // Asumsi: Nullifier adalah public signal satu-satunya
        uint256 nullifierInt = uint256(bytes32(_nullifier)); 
        uint[1] memory input = [nullifierInt];

        // Panggil verifyProof
        require(voteVerifier.verifyProof(a, b, c, input), "Invalid proof");

        // Record vote
        usedNullifiers[_nullifier] = true;
        votes[_electionId].push(Vote({
            nullifier: _nullifier,
            candidateId: _candidateId,
            proof: _proof,
            timestamp: block.timestamp
        }));
        candidates[_electionId][_candidateId].voteCount++;

        emit VoteCasted(_electionId, _candidateId);
    }
    // Results
    function getCandidateVotes(uint256 _electionId, uint256 _candidateId) 
        external 
        view 
        returns (uint256) 
    {
        return candidates[_electionId][_candidateId].voteCount;
    }

    function getTotalVotes(uint256 _electionId) external view returns (uint256) {
        return votes[_electionId].length;
    }

    function getElection(uint256 _electionId) 
        external 
        view 
        returns (Election memory) 
    {
        return elections[_electionId];
    }
}
