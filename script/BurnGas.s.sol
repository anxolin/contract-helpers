// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8;

import {BurnGas} from "../src/BurnGas.sol";
import {Script} from "forge-std/Script.sol";

/// @title BurnGasScript
/// @author CoW DAO Developers
/// @notice Script to deploy the BurnGas contract
contract BurnGasScript is Script {
    /// @notice The deployed BurnGas contract
    BurnGas public burnGas;

    /// @notice Run the script
    function run() public {
        vm.startBroadcast();
        burnGas = new BurnGas();
        vm.stopBroadcast();
    }
}
