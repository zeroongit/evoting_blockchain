// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

// ✅ Interface untuk setiap circuit sesuai jumlah public signals

// ProofOfHuman: 5 public signals
interface HumanityVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[5] memory input
    ) external view returns (bool);
}

// VoteCasting: 5 public signals
interface VoteVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[5] memory input
    ) external view returns (bool);
}

// VoterEligibility: 1 public signal
interface VoterVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) external view returns (bool);
}

// ProofOfAuthority: 2 public signals
interface AuthorityVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) external view returns (bool);
}

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
        bytes proof;
        uint256 timestamp;
    }

    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => Vote[]) public votes;
    mapping(bytes => bool) public usedNullifiers;
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

    // ✅ VERIFY HUMANITY: 5 public signals
    // [0] = human_score, [1] = uniqueness_score, [2] = behavior_proof, [3] = timestamp, [4] = user_identifier
    function verifyHumanity(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[5] memory _publicSignals
    ) external {
        require(humanityVerifier.verifyProof(a, b, c, _publicSignals), "Invalid humanity proof");
        humanVerified[msg.sender] = true;
        emit HumanityVerified(msg.sender);
    }

    // ✅ VERIFY VOTER ELIGIBILITY: 1 public signal [election_id]
    function verifyVoterEligibility(
        uint256 _electionId,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory _publicSignals
    ) external view returns (bool) {
        require(_publicSignals[0] == _electionId, "Election ID mismatch");
        return voterVerifier.verifyProof(a, b, c, _publicSignals);
    }

    // ✅ VERIFY AUTHORITY: 2 public signals [election_id, action_hash]
    function verifyAuthority(
        uint256 _electionId,
        bytes32 _actionHash,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory _publicSignals
    ) external view returns (bool) {
        require(_publicSignals[0] == _electionId, "Election ID mismatch");
        require(uint256(_actionHash) == _publicSignals[1], "Action hash mismatch");
        require(authorities[msg.sender], "Not an authority");
        return authorityVerifier.verifyProof(a, b, c, _publicSignals);
    }

    // ✅ CAST VOTE: 5 public signals
    // [0] = commitment, [1] = nullifier, [2] = vote_hash, [3] = election_id, [4] = candidate_id
    function castVote(
        uint256 _electionId,
        uint256 _candidateId,
        bytes memory _nullifier,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[5] memory _publicSignals
    ) external electionActive(_electionId) onlyIfHumanityRequired(_electionId) {
        require(_candidateId < elections[_electionId].candidateCount, "Invalid candidate");
        require(!usedNullifiers[_nullifier], "Vote already cast");
        
        // ✅ Verify ZK proof
        require(voteVerifier.verifyProof(a, b, c, _publicSignals), "Invalid vote proof");
        
        // Verify public signals match
        require(_publicSignals[3] == _electionId, "Election ID mismatch in proof");
        require(_publicSignals[4] == _candidateId, "Candidate ID mismatch in proof");

        // Record vote
        usedNullifiers[_nullifier] = true;
        votes[_electionId].push(Vote({
            nullifier: _nullifier,
            candidateId: _candidateId,
            proof: "",
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