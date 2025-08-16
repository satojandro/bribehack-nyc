// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {Bribehack} from "../src/Bribehack.sol";

contract DeployBribehack is Script {
    function run() external {
        // Load deployer's private key from .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Use mock address or update with LayerZero endpoint if known
        address mockLZEndpoint = address(0x123); // dummy endpoint for now
        Bribehack bribehack = new Bribehack(mockLZEndpoint);

        console.log("Bribehack deployed at:", address(bribehack));

        vm.stopBroadcast();
    }
}