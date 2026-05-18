// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8;

// slither-disable-start assembly
/// @title BurnGas
/// @author CoW DAO Developers
/// @notice A contract that burns all or most of the gas when called
contract BurnGas {
    /// @notice Burns every remaining unit of gas, reverting with out-of-gas.
    function burnAllGas() external view {
        while (true) {
            // solhint-disable-next-line no-inline-assembly
            assembly {
                pop(gas())
            }
        }
    }

    /// @notice Burns gas until only `reserveGas` units are left, then returns.
    /// @param reserveGas The amount of gas to keep before returning.
    function burnMostGas(uint256 reserveGas) external view {
        while (gasleft() > reserveGas) {
            // solhint-disable-next-line no-inline-assembly
            assembly {
                pop(gas())
            }
        }
    }
}
// slither-disable-end assembly
