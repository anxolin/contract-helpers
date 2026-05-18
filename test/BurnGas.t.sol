// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8;

import {BurnGas} from "../src/BurnGas.sol";
import {Test} from "forge-std/Test.sol";

contract BurnGasTest is Test {
    BurnGas public burnGas;

    function setUp() public {
        burnGas = new BurnGas();
    }
}
