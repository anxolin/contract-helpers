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
- [pnpm](https://pnpm.io/

## Usage

run `just help` to see the available commands.

```shell
# Install dependencies
pnpm --dir dev install

# Build
just build

# Test
just test

# Format
just fmt

# Lint
just lint
```
