// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Bribehack, ILayerZeroEndpoint} from "../src/Bribehack.sol";

// =================================================================================================
//                                     MOCK LZ ENDPOINT
// =================================================================================================
contract MockLZEndpoint is ILayerZeroEndpoint {
    event MessageSent(
        uint16 _dstChainId,
        bytes _destination,
        bytes _payload
    );

    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable /*_refundAddress*/,
        address /*_zroPaymentAddress*/,
        bytes calldata /*_adapterParams*/
    ) external payable {
        emit MessageSent(_dstChainId, _destination, _payload);
    }
}

// =================================================================================================
//                                        TEST CONTRACT
// =================================================================================================
contract BribehackTest is Test {
    Bribehack public bribehack;
    MockLZEndpoint public mockEndpoint;

    address public hacker1 = vm.addr(1);
    address public hacker2 = vm.addr(2);
    address public sponsor1 = vm.addr(3);
    address public briber1 = vm.addr(4);

    function setUp() public {
        mockEndpoint = new MockLZEndpoint();
        bribehack = new Bribehack(address(mockEndpoint));
    }

    // =================================================================================================
    //                                     commitToBounties TESTS
    // =================================================================================================
    function test_CommitToBounties_Success() public {
        string[] memory bountyIds = new string[](2);
        bountyIds[0] = "bounty-1";
        bountyIds[1] = "bounty-2";

        vm.prank(hacker1);
        bribehack.commitToBounties(bountyIds, "hacker1.eth", "ipfs_hash_1");

        Bribehack.Commitment memory commitment = bribehack.getCommitment(hacker1);
        assertEq(commitment.hacker, hacker1);
        assertEq(commitment.bountyIds.length, 2);
        assertEq(bribehack.hackerCommitmentCount(hacker1), 2);
    }

    function test_Fail_CommitToBounties_ExceedsMax() public {
        string[] memory bountyIds = new string[](4);
        bountyIds[0] = "bounty-1";
        bountyIds[1] = "bounty-2";
        bountyIds[2] = "bounty-3";
        bountyIds[3] = "bounty-4";

        vm.prank(hacker1);
        vm.expectRevert(
            abi.encodeWithSelector(
                Bribehack.ExceedsMaxCommitments.selector,
                0,
                4,
                3
            )
        );
        bribehack.commitToBounties(bountyIds, "hacker1.eth", "ipfs_hash_1");
    }

    // =================================================================================================
    //                                     sponsorBounty TESTS
    // =================================================================================================
    function test_SponsorBounty_Success() public {
        uint256 sponsorAmount = 1 ether;
        vm.prank(sponsor1);
        bribehack.sponsorBounty{value: sponsorAmount}("bounty-1");

        Bribehack.Bounty memory bounty = bribehack.getBounty("bounty-1");
        assertEq(bounty.prizePool, sponsorAmount);
        assertEq(bounty.sponsors.length, 1);
        assertEq(bounty.sponsors[0], sponsor1);
    }

    function test_Fail_SponsorBounty_ZeroValue() public {
        vm.prank(sponsor1);
        vm.expectRevert(Bribehack.ZeroSponsorship.selector);
        bribehack.sponsorBounty("bounty-1");
    }

    // =================================================================================================
    //                                      bribeHacker TESTS
    // =================================================================================================
    function test_BribeHacker_Success() public {
        uint256 bribeAmount = 0.5 ether;
        vm.prank(briber1);
        bribehack.bribeHacker{value: bribeAmount}(hacker1, "bounty-1");

        Bribehack.Bribe[] memory bribes = bribehack.getBribes(hacker1);
        assertEq(bribes.length, 1);
        assertEq(bribes[0].briber, briber1);
        assertEq(bribes[0].hacker, hacker1);
        assertEq(bribes[0].amount, bribeAmount);
    }

    // =================================================================================================
    //                                     LayerZero TESTS
    // =================================================================================================
    function test_SendCommitCrossChain_Success() public {
        uint16 dstChainId = 101;
        string memory bountyId = "bounty-1";
        bytes memory expectedPayload = abi.encode(hacker1, bountyId);
        bytes memory expectedDestination = abi.encodePacked(address(bribehack));

        vm.prank(hacker1);
        vm.expectEmit(true, true, true, true);
        emit Bribehack.LZMessageSent(dstChainId, expectedDestination, expectedPayload);
        bribehack.sendCommitCrossChain{value: 1 ether}(dstChainId, bountyId);
    }
}
