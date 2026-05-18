// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8;

import {BurnGas} from "../src/BurnGas.sol";
import {Test} from "forge-std/Test.sol";

contract BurnGasTest is Test {
    // Upper bound on CALL + ABI dispatch overhead when no gas-burning loop runs.
    uint256 internal constant MAX_NO_OP_OVERHEAD = 10_000;
    // Slack around expected consumed gas to absorb CALL overhead and loop overshoot.
    uint256 internal constant GAS_MEASUREMENT_TOLERANCE = 10_000;

    BurnGas public burnGas;

    function setUp() public {
        burnGas = new BurnGas();
    }

    function test_burnAllGas_revertsOutOfGas() public {
        (bool ok, bytes memory data) = _callBurnAllGas(200_000);
        assertFalse(ok, "burnAllGas should revert");
        assertEq(data.length, 0, "out-of-gas returns no revert data");
    }

    function test_burnMostGas_returnsSuccessfully() public {
        (bool ok,) = _callBurnMostGas(200_000, 5_000);
        assertTrue(ok, "burnMostGas should not revert");
    }

    function test_burnMostGas_returnsImmediatelyWhenReserveExceedsGas() public {
        (bool ok, uint256 consumed) = _callBurnMostGas(50_000, 10_000_000);
        assertTrue(ok);
        // No looping should happen — only call overhead should be consumed.
        assertLt(consumed, MAX_NO_OP_OVERHEAD, "should not burn gas when reserve exceeds available");
    }

    function testFuzz_burnMostGas_burnsDownToReserve(uint256 reserve) public {
        uint256 gasGiven = 500_000;
        reserve = bound(reserve, 1000, 100_000);

        (bool ok, uint256 consumed) = _callBurnMostGas(gasGiven, reserve);

        assertTrue(ok);
        // Callee burns down to ~reserve, so total consumed from caller is
        // ~ gasGiven - reserve + small CALL/ABI overhead.
        assertApproxEqAbs(consumed, gasGiven - reserve, GAS_MEASUREMENT_TOLERANCE);
    }

    function _callBurnAllGas(uint256 gasGiven) internal returns (bool ok, bytes memory data) {
        (ok, data) = address(burnGas).call{gas: gasGiven}(abi.encodeCall(BurnGas.burnAllGas, ()));
    }

    function _callBurnMostGas(uint256 gasGiven, uint256 reserve) internal returns (bool ok, uint256 consumed) {
        uint256 gasBefore = gasleft();
        (ok,) = address(burnGas).call{gas: gasGiven}(abi.encodeCall(BurnGas.burnMostGas, (reserve)));
        consumed = gasBefore - gasleft();
    }
}
