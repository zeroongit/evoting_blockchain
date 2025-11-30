// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

// ==========================================
// ✅ INTERFACES (Disesuaikan dengan Sirkuit Baru)
// ==========================================

// 1. ProofOfHuman: 4 Public Signals 
// (OutputHash, Timestamp, UserIdentifier, +1 extra/dummy from libraries usually)
interface HumanityVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory input // UPDATE: Disesuaikan jadi 4
    ) external view returns (bool);
}

// 2. VoteCasting: 4 Public Signals
// (Nullifier, VoteHash, ElectionID, CandidateID)
interface VoteVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory input // UPDATE: Disesuaikan jadi 4
    ) external view returns (bool);
}

// 3. VoterEligibility: 2 Public Signals 
// (EligibilityHash, ElectionID)
interface VoterVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input // UPDATE: Disesuaikan jadi 2
    ) external view returns (bool);
}

// 4. ProofOfAuthority: 3 Public Signals
// (AuthProof, ElectionID, ActionHash)
interface AuthorityVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory input // UPDATE: Disesuaikan jadi 3
    ) external view returns (bool);
}

// ==========================================
// ✅ MAIN CONTRACT
// ==========================================

contract EVoting is Ownable {
    enum ElectionState { Pending, Active, Ended, Finalized }

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
        uint256 timestamp;
    }

    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => Vote[]) public votes;
    
    // Menyimpan Nullifier agar tidak bisa double vote
    mapping(uint256 => mapping(uint256 => bool)) public usedNullifiers; // ElectionID -> Nullifier -> Used
    
    mapping(address => bool) public authorities;
    mapping(address => bool) public humanVerified;
    uint256 private electionCounter;
    
    VoterVerifier public voterVerifier;
    VoteVerifier public voteVerifier;
    HumanityVerifier public humanityVerifier;
    AuthorityVerifier public authorityVerifier;

    event ElectionCreated(uint256 indexed electionId, string title);
    event ElectionStarted(uint256 indexed electionId);
    event ElectionEnded(uint256 indexed electionId);
    event ElectionReset(uint256 indexed electionId);
    event ElectionFinalized(uint256 indexed electionId);
    event VoteCasted(uint256 indexed electionId, uint256 indexed candidateId);
    event HumanityVerified(address indexed voter);
    event AuthorityAdded(address indexed authority);

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
        voterVerifier = VoterVerifier(_voterVerifier);
        voteVerifier = VoteVerifier(_voteVerifier);
        humanityVerifier = HumanityVerifier(_humanityVerifier);
        authorityVerifier = AuthorityVerifier(_authorityVerifier);
        authorities[msg.sender] = true;
    }

    function addAuthority(address _authority) external onlyOwner {
        authorities[_authority] = true;
        emit AuthorityAdded(_authority);
    }

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

    function addCandidate(uint256 _electionId, string memory _name, string memory _ipfsHash) external onlyAuthority {
        require(elections[_electionId].state == ElectionState.Pending, "Election not pending");
        uint256 candidateId = elections[_electionId].candidateCount;
        candidates[_electionId][candidateId] = Candidate(candidateId, _name, _ipfsHash, 0);
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

    function resetElection(uint256 _electionId) external onlyAuthority {
        require(elections[_electionId].state == ElectionState.Ended, "Election must be ended first");
        elections[_electionId].state = ElectionState.Pending;
        delete votes[_electionId];
        
        // Reset vote counts
        for (uint256 i = 0; i < elections[_electionId].candidateCount; i++) {
            candidates[_electionId][i].voteCount = 0;
        }
        
        emit ElectionReset(_electionId);
    }

    function finalizeElection(uint256 _electionId) external onlyAuthority {
        require(elections[_electionId].state == ElectionState.Ended, "Election must be ended first");
        elections[_electionId].state = ElectionState.Finalized;
        emit ElectionFinalized(_electionId);
    }

    // ==========================================
    // ✅ VERIFY HUMANITY (Updated)
    // ==========================================
    function verifyHumanity(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory _publicSignals // [Hash, Timestamp, UserID, behavior]
    ) external {
        require(humanityVerifier.verifyProof(a, b, c, _publicSignals), "Invalid humanity proof");
        
        // Opsional: Cek apakah UserID di proof cocok dengan msg.sender
        // require(_publicSignals[2] == uint256(uint160(msg.sender)), "User ID mismatch");

        humanVerified[msg.sender] = true;
        emit HumanityVerified(msg.sender);
    }

    // ==========================================
    // ✅ CAST VOTE (Updated)
    // ==========================================
    function castVote(
        uint256 _electionId,
        uint256 _candidateId,
        uint256 _nullifier, // Ubah jadi uint256 biar gampang dicocokkan dengan proof
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory _publicSignals // [Nullifier, VoteHash, ElectionID, CandidateID]
    ) external electionActive(_electionId) onlyIfHumanityRequired(_electionId) {
        require(_candidateId < elections[_electionId].candidateCount, "Invalid candidate");
        require(!usedNullifiers[_electionId][_nullifier], "Vote already cast");
        
        // ✅ Verify ZK Proof Logic
        // 1. Cek Election ID cocok
        require(_publicSignals[2] == _electionId, "Election ID mismatch in proof");
        
        // 2. Cek Candidate ID cocok
        require(_publicSignals[3] == _candidateId, "Candidate ID mismatch in proof");

        // 3. Cek Nullifier cocok dengan input argumen
        require(_publicSignals[0] == _nullifier, "Nullifier mismatch");

        // 4. Verifikasi Matematika Groth16
        require(voteVerifier.verifyProof(a, b, c, _publicSignals), "Invalid vote proof");

        // Record Vote
        usedNullifiers[_electionId][_nullifier] = true;
        
        votes[_electionId].push(Vote({
            nullifier: abi.encodePacked(_nullifier),
            candidateId: _candidateId,
            timestamp: block.timestamp
        }));
        candidates[_electionId][_candidateId].voteCount++;

        emit VoteCasted(_electionId, _candidateId);
    }

    function getCandidateVotes(uint256 _electionId, uint256 _candidateId) external view returns (uint256) {
        return candidates[_electionId][_candidateId].voteCount;
    }

    function getTotalVotes(uint256 _electionId) external view returns (uint256) {
        return votes[_electionId].length;
    }

    function getElection(uint256 _electionId) external view returns (Election memory) {
        return elections[_electionId];
    }
}