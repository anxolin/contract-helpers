import { OrderKind, type TradeParameters } from '@cowprotocol/cow-sdk'
import {
  buildBurnGasHook,
  buildSdk,
  COW,
  COW_DECIMALS,
  formatCow,
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

  console.log(`Comparing quotes for ${env.sellAmountHuman} USDC → COW (mainnet)`)
  console.log(`Hook: BurnGas.burnAllGas()  gasLimit=${env.hookGasLimit}`)
  console.log()

  const [withoutHook, withHookQuote] = await Promise.all([
    sdk.getQuote(parameters),
    sdk.getQuote(parameters, withHook(hook)),
  ])

  const a = withoutHook.quoteResults.amountsAndCosts.afterSlippage
  const b = withHookQuote.quoteResults.amountsAndCosts.afterSlippage

  console.log('Buy amount (COW, after slippage):')
  console.log(`  no hook:  ${formatCow(a.buyAmount)}`)
  console.log(`  +BurnGas: ${formatCow(b.buyAmount)}`)

  const diff = BigInt(a.buyAmount) - BigInt(b.buyAmount)
  console.log(`  delta:    ${formatCow(diff)} COW less when the hook gas cost is properly priced in`)

  console.log()
  console.log('Cost breakdown (no hook):')
  console.log(stringifyBigInt(withoutHook.quoteResults.amountsAndCosts.costs, 2))
  console.log()
  console.log('Cost breakdown (+BurnGas):')
  console.log(stringifyBigInt(withHookQuote.quoteResults.amountsAndCosts.costs, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
