// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ILayerZeroEndpoint
/// @notice A mock interface for LayerZero Endpoint to simulate cross-chain message sending.
interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;
}

/// @title Bribehack
/// @author Nora AI
/// @notice A protocol for hackers to commit to bounties, sponsors to fund them, and for bribing hackers.
contract Bribehack {

    // =================================================================================================
    //                                          CONSTANTS
    // =================================================================================================
    uint256 public constant MAX_COMMITMENTS = 3;

    // =================================================================================================
    //                                            EVENTS
    // =================================================================================================
    event NewCommitment(address indexed hacker, string[] bountyIds, string ipfsHash);
    event BountySponsored(string indexed bountyId, address indexed sponsor, uint256 amount);
    event HackerBribed(address indexed briber, address indexed hacker, string bountyId, uint256 amount);
    event CrossChainSnapshot(address indexed hacker, string bountyId);
    event LZMessageSent(uint16 dstChainId, bytes destination, bytes payload);

    // =================================================================================================
    //                                            ERRORS
    // =================================================================================================
    error ExceedsMaxCommitments(uint256 current, uint256 attempted, uint256 max);
    error NoBountiesProvided();
    error ZeroSponsorship();
    error ZeroBribe();
    error InvalidLayerZeroEndpoint();

    // =================================================================================================
    //                                          STRUCTS
    // =================================================================================================

    /// @dev Stores details about a hacker's commitment to one or more bounties.
    struct Commitment {
        address hacker;            // The address of the hacker who made the commitment.
        string[] bountyIds;        // An array of bounty IDs the hacker is committed to.
        string ensPseudonym;       // An optional ENS pseudonym for the hacker.
        string ipfsHash;           // An IPFS hash for additional details about the commitment.
        uint256 timestamp;         // The time the commitment was made.
    }

    /// @dev Represents a bounty, including its prize pool and sponsors.
    struct Bounty {
        string bountyId;           // The unique identifier for the bounty.
        uint256 prizePool;         // The total amount of ETH in the prize pool.
        address[] sponsors;        // A list of addresses that have sponsored this bounty.
    }

    /// @dev Records a bribe made from one party to a hacker for a specific bounty.
    struct Bribe {
        address briber;            // The address of the person or entity making the bribe.
        address hacker;            // The address of the hacker receiving the bribe.
        string bountyId;           // The bounty ID the bribe is intended to influence.
        uint256 amount;            // The amount of the bribe in wei.
        uint256 timestamp;         // The time the bribe was made.
    }

    // =================================================================================================
    //                                       STATE VARIABLES
    // =================================================================================================

    /// @notice Maps a hacker's address to their active commitment.
    /// @dev A hacker can only have one active Commitment struct at a time, which can contain up to 3 bounty IDs.
    mapping(address => Commitment) public commitments;

    /// @notice Maps a bounty ID (e.g., "layerzero-bug-bounty") to its respective Bounty struct.
    mapping(string => Bounty) public bounties;

    /// @notice Maps a hacker's address to an array of bribes they have received.
    /// @dev This allows for efficient lookup of all bribes directed at a specific hacker.
    mapping(address => Bribe[]) public bribesByHacker;

    /// @notice Tracks the total number of bounties a hacker has committed to.
    /// @dev Used to enforce the maximum of 3 commitments per hacker.
    mapping(address => uint256) public hackerCommitmentCount;

    // LayerZero Endpoint Address (mocked)
    address public lzEndpoint;

    // =================================================================================================
    //                                          CONSTRUCTOR
    // =================================================================================================

    constructor(address _lzEndpoint) {
        if (_lzEndpoint == address(0)) {
            revert InvalidLayerZeroEndpoint();
        }
        lzEndpoint = _lzEndpoint;
    }
    // =================================================================================================
    //                                       PUBLIC FUNCTIONS
    // =================================================================================================

    /// @notice Allows a hacker to commit to one or more bounties.
    /// @param bountyIds An array of unique identifiers for the bounties.
    /// @param ensPseudonym An optional ENS name for the hacker.
    /// @param ipfsHash An IPFS hash for supplementary data about the commitment.
    function commitToBounties(
        string[] calldata bountyIds,
        string calldata ensPseudonym,
        string calldata ipfsHash
    ) public {
        uint256 newCommitments = bountyIds.length;
        if (newCommitments == 0) {
            revert NoBountiesProvided();
        }

        uint256 currentCommitments = hackerCommitmentCount[msg.sender];
        if (currentCommitments + newCommitments > MAX_COMMITMENTS) {
            revert ExceedsMaxCommitments(currentCommitments, newCommitments, MAX_COMMITMENTS);
        }

        // For this hackathon's scope, we'll overwrite any existing commitment.
        // A more robust implementation might allow editing (adding/removing bounties).
        commitments[msg.sender] = Commitment({
            hacker: msg.sender,
            bountyIds: bountyIds,
            ensPseudonym: ensPseudonym,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp
        });

        // We are setting the count based on the new submission, overwriting the old one.
        hackerCommitmentCount[msg.sender] = newCommitments;

        emit NewCommitment(msg.sender, bountyIds, ipfsHash);
    }

    /// @notice Allows a sponsor to add funds to a bounty's prize pool.
    /// @dev This function is payable and will create the bounty if it doesn't exist.
    /// @param bountyId The unique identifier for the bounty to sponsor.
    function sponsorBounty(string calldata bountyId) public payable {
        if (msg.value == 0) {
            revert ZeroSponsorship();
        }

        Bounty storage bounty = bounties[bountyId];

        // If this is the first time sponsoring, initialize the bountyId.
        if (bounty.prizePool == 0) {
            bounty.bountyId = bountyId;
        }

        // To keep it simple, we'll add the sponsor every time.
        // A production version might check for duplicates to save gas.
        bounty.sponsors.push(msg.sender);
        bounty.prizePool += msg.value;

        emit BountySponsored(bountyId, msg.sender, msg.value);
    }

    /// @notice Sends a bribe to a hacker for a specific bounty.
    /// @dev This function is payable and tracks the bribe details.
    /// @param hacker The address of the hacker to bribe.
    /// @param bountyId The unique identifier for the bounty the bribe is for.
    function bribeHacker(address hacker, string calldata bountyId) public payable {
        if (msg.value == 0) {
            revert ZeroBribe();
        }

        Bribe memory newBribe = Bribe({
            briber: msg.sender,
            hacker: hacker,
            bountyId: bountyId,
            amount: msg.value,
            timestamp: block.timestamp
        });

        bribesByHacker[hacker].push(newBribe);

        emit HackerBribed(msg.sender, hacker, bountyId, msg.value);
    }

    // =================================================================================================
    //                                  LAYERZERO MOCK FUNCTIONS
    // =================================================================================================

    /// @notice Mocks receiving a cross-chain message, in this case, a snapshot.
    /// @dev In a real scenario, this would be called by the LayerZero Endpoint.
    function lzReceive(
        uint16 /*_srcChainId*/,
        bytes calldata /*_srcAddress*/,
        uint64 /*_nonce*/,
        bytes calldata _payload
    ) external {
        // For the hackathon, we'll assume the payload is just the hacker address and bountyId
        (address hacker, string memory bountyId) = abi.decode(_payload, (address, string));
        emit CrossChainSnapshot(hacker, bountyId);
    }

    /// @notice Mocks sending a commitment snapshot cross-chain.
    /// @param _dstChainId The destination chain ID for the LayerZero message.
    /// @param _bountyId The bountyId to include in the snapshot.
    function sendCommitCrossChain(uint16 _dstChainId, string calldata _bountyId) external payable {
        // This is a mock implementation. In a real scenario, you'd have more robust payload encoding
        // and would handle fees for LayerZero.
        bytes memory payload = abi.encode(msg.sender, _bountyId);

        // The destination address on the other chain is this contract's address
        bytes memory destination = abi.encodePacked(address(this));

        emit LZMessageSent(_dstChainId, destination, payload);

        ILayerZeroEndpoint(lzEndpoint).send{value: msg.value}(
            _dstChainId,
            destination,
            payload,
            payable(msg.sender),
            address(0), // ZRO payment address (not used in mock)
            "" // Adapter params (not used in mock)
        );

        emit CrossChainSnapshot(msg.sender, _bountyId);
    }

    // =================================================================================================
    //                                        VIEW FUNCTIONS
    // =================================================================================================

    /// @notice Retrieves a commitment for a given hacker.
    /// @param _hacker The address of the hacker.
    /// @return A Commitment struct.
    function getCommitment(address _hacker) public view returns (Commitment memory) {
        return commitments[_hacker];
    }

    /// @notice Retrieves a bounty by its ID.
    /// @param _bountyId The unique identifier for the bounty.
    /// @return A Bounty struct.
    function getBounty(string memory _bountyId) public view returns (Bounty memory) {
        return bounties[_bountyId];
    }

    /// @notice Retrieves all bribes for a given hacker.
    /// @param _hacker The address of the hacker.
    /// @return An array of Bribe structs.
    function getBribes(address _hacker) public view returns (Bribe[] memory) {
        return bribesByHacker[_hacker];
    }
}
