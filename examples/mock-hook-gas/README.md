# mock-hook-gas

End-to-end demo of the `BurnGas` use case from the repo's README, using the CoW Protocol SDK on Ethereum mainnet.

When a CoW order declares a pre/post hook with a `gasLimit`, the quote API simulates the hook against the live chain state. If the hook only consumes a fraction of its declared budget at simulation time, the returned cost estimate under-counts what the order will actually pay on-chain. Attaching a call to `BurnGas.burnAllGas()` forces the simulator to consume the entire declared budget, so the quote reflects reality.

This example builds a USDC → COW swap with a pre-hook calling `BurnGas`, and lets you compare the quote with and without the hook side-by-side.

## Headline result

```
Comparing quotes for 10 USDC → COW (mainnet)
Hook: BurnGas.burnAllGas()  gasLimit=100000

Buy amount (COW, after slippage):
  no hook:  59.05 COW
  +BurnGas: 58.13 COW
  delta:    0.93 COW less when the hook gas cost is properly priced in

Cost breakdown (no hook):     networkFee.amountInSellCurrency = 110,226 (USDC base units)
Cost breakdown (+BurnGas):    networkFee.amountInSellCurrency = 199,148 (USDC base units)
```

The ~89k USDC-base-unit jump corresponds to the ~89k gas `burnAllGas` consumes inside the declared 100k budget being priced into the network fee.

## Setup

```shell
pnpm install
cp .env.example .env
# edit .env: RPC_URL is required; PRIVATE_KEY can stay as the dummy value
# for the quote commands (they don't sign anything).
```

## Commands

| Command | What it does | Needs funded EOA? |
| --- | --- | --- |
| `pnpm quote` | Fetch one quote with the BurnGas hook attached and print the breakdown. | No |
| `pnpm quote:compare` | Fetch two quotes — with and without the hook — and print the cost delta. | No |
| `pnpm buy-cow` | Quote with hook → allowance check + approval → confirm prompt → post order. Prints order UID + `https://explorer.cow.fi/orders/<uid>`. Use `--yes` to skip prompts. | Yes (USDC + ETH for the approval tx) |
| `pnpm typecheck` | Run `tsc --noEmit`. | No |

## Configuration

All env vars live in `.env` (see `.env.example`):

- `RPC_URL` — mainnet RPC endpoint. Required.
- `PRIVATE_KEY` — `0x`-prefixed. Required for `buy-cow`; quoting only needs a syntactically valid value.
- `SELL_AMOUNT_USDC` — whole USDC units to sell. Defaults to `10`.
- `HOOK_GAS_LIMIT` — gas budget declared for the BurnGas pre-hook. Defaults to `100000`. The whole point of the example is that this number now matches the on-chain cost.

## How the hook is constructed

`burnAllGas()` is encoded as raw call data and attached under `appData.metadata.hooks.pre` in the SDK's advanced settings:

```ts
const callData = encodeFunctionData({
  abi: [{ name: 'burnAllGas', type: 'function', stateMutability: 'view', inputs: [], outputs: [] }],
  functionName: 'burnAllGas',
})

await sdk.getQuote(parameters, {
  appData: {
    metadata: {
      hooks: { pre: [{ target: BURN_GAS, callData, gasLimit: '100000' }] },
    },
  },
})
```

`burnAllGas` runs an infinite loop until OOG. CoW's hook trampoline catches per-hook reverts via `try/catch`, so settlement proceeds normally — the simulator just charges for the gas consumed before the revert, which is the whole point.

## Versions

- `@cowprotocol/cow-sdk` 9.x — class `TradingSdk`
- `@cowprotocol/sdk-viem-adapter` 0.3.x — pairs with `viem` 2.x
- Run with `tsx` (no build step)
