// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8;

/// @title BurnGas
/// @author CoW DAO Developers
/// @notice A contract that burns all or most of the gas when called
contract BurnGas {
    function burnAllGas() external view {
        while (true) {
            /* solium-disable-next-line security/no-inline-assembly */
            assembly {
                pop(gas())
            }
        }
    }

    function burnMostGas(uint256 reserveGas) external view {
        while (gasleft() > reserveGas) {
            /* solium-disable-next-line security/no-inline-assembly */
            assembly {
                pop(gas())
            }
        }
    }
}
