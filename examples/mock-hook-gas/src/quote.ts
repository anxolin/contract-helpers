import { OrderKind, type TradeParameters } from '@cowprotocol/cow-sdk'
import {
  buildBurnGasHook,
  buildSdk,
  COW,
  COW_DECIMALS,
  formatCow,
  formatUsdc,
  loadEnv,
  stringifyBigInt,
  USDC,
  USDC_DECIMALS,
  withHook,
} from './shared.js'

async function main() {
  const env = loadEnv()
  const { sdk } = buildSdk(env)

  const parameters: TradeParameters = {
    kind: OrderKind.SELL,
    sellToken: USDC,
    sellTokenDecimals: USDC_DECIMALS,
    buyToken: COW,
    buyTokenDecimals: COW_DECIMALS,
    amount: env.sellAmount.toString(),
  }

  const hook = buildBurnGasHook(env.hookGasLimit)

  console.log(`Selling ${env.sellAmountHuman} USDC for COW on mainnet`)
  console.log(`Pre-hook: BurnGas.burnAllGas()  gasLimit=${env.hookGasLimit}`)
  console.log(`Target:   ${hook.target}`)
  console.log()

  const { quoteResults } = await sdk.getQuote(parameters, withHook(hook))

  const after = quoteResults.amountsAndCosts.afterSlippage
  console.log('Quote (after slippage):')
  console.log(`  Sell:     ${formatUsdc(after.sellAmount)} USDC`)
  console.log(`  Buy:      ${formatCow(after.buyAmount)} COW`)

  console.log('Costs:')
  console.log(stringifyBigInt(quoteResults.amountsAndCosts.costs, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
