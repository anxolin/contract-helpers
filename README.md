# Contract Helpers

Miscellaneous utility contracts that may be helpful for CoW Protocol.

## Contracts

### `BurnGas`

Helpers to burn gas inside a transaction.

- `burnAllGas()` — burns all remaining gas.
- `burnMostGas(uint256 reserveGas)` — burns gas until only `reserveGas` is left.

**Use case: accurate quote gas estimates.** When requesting a quote from CoW Protocol, the quote API simulates the order and returns a gas-based cost estimate. If a [hook](https://docs.cow.fi/cow-protocol/reference/core/intents/hooks) declares a gas limit but only consumes a fraction of it at simulation time, the estimate will under-count the real cost. Attaching a call to `BurnGas` forces the simulation to consume the full gas allowance declared for the hook, so the returned cost reflects what the order will actually pay on-chain.

# Development

## Requirements

- [just](https://github.com/casey/just)
- [pnpm](https://pnpm.io)

## Usage

run `just help` to see the available commands.

```shell
# Install dependencies
just install

# Build
just build

# Test
just test

# Format
just fmt

# Lint
just lint
```

## Deployment

### Dry-run

```shell
just forge script script/BurnGas.s.sol:BurnGasScript \
    --rpc-url "$RPC_URL"
```

### Broadcast

Append a signer flag and `--broadcast`. Pick one of:

- `--ledger` (hardware wallet — `--sender` required)
- `--account <name>` (encrypted keystore from `cast wallet import`)
- `--private-key "$PRIVATE_KEY"` (plaintext — testnets only)

```shell
just forge script script/BurnGas.s.sol:BurnGasScript \
    --rpc-url "$RPC_URL" \
    --sender "$DEPLOYER" \
    --private-key "$PK" \
    --broadcast
```

The deployed address is written to `broadcast/BurnGas.s.sol/<chainId>/run-latest.json`.

### Verify on Etherscan

Etherscan's v1 endpoint is deprecated, so the v2 URL must be passed explicitly (or configured in `foundry.toml`). The same API key works across all chains supported by Etherscan v2.

```shell
just forge verify-contract \
    "$DEPLOYED_ADDRESS" \
    src/BurnGas.sol:BurnGas \
    --chain $CHAIN_ID \
    --etherscan-api-key "$ETHERSCAN_API_KEY" \
    --verifier-url "https://api.etherscan.io/v2/api?chainid=$CHAIN_ID" \
    --watch
```
