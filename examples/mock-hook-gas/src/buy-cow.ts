import { OrderKind, type TradeParameters } from '@cowprotocol/cow-sdk'
import {
  buildBurnGasHook,
  buildSdk,
  confirm,
  COW,
  COW_DECIMALS,
  formatCow,
  formatUsdc,
  loadEnv,
  USDC,
  USDC_DECIMALS,
  withHook,
} from './shared.js'

async function main() {
  const env = loadEnv()
  const { sdk, owner } = buildSdk(env)
  const skipPrompt = process.argv.includes('--yes')

  const parameters: TradeParameters = {
    kind: OrderKind.SELL,
    sellToken: USDC,
    sellTokenDecimals: USDC_DECIMALS,
    buyToken: COW,
    buyTokenDecimals: COW_DECIMALS,
    amount: env.sellAmount.toString(),
  }

  const hook = buildBurnGasHook(env.hookGasLimit)
  const advanced = withHook(hook)

  console.log(`Trader:   ${owner}`)
  console.log(`Selling:  ${env.sellAmountHuman} USDC`)
  console.log(`Hook:     BurnGas.burnAllGas()  gasLimit=${env.hookGasLimit}`)
  console.log()

  const { quoteResults, postSwapOrderFromQuote } = await sdk.getQuote(parameters, advanced)
  const after = quoteResults.amountsAndCosts.afterSlippage

  console.log('Quote (after slippage):')
  console.log(`  Sell: ${formatUsdc(after.sellAmount)} USDC`)
  console.log(`  Buy:  ${formatCow(after.buyAmount)} COW`)
  console.log()

  const currentAllowance = await sdk.getCowProtocolAllowance({ tokenAddress: USDC, owner })
  if (currentAllowance < env.sellAmount) {
    console.log(`USDC allowance ${currentAllowance} < required ${env.sellAmount}. Approving…`)
    if (!skipPrompt && !(await confirm('Send approval tx? (y/N) '))) {
      console.log('Aborted.')
      return
    }
    await sdk.approveCowProtocol({ tokenAddress: USDC, amount: env.sellAmount })
    console.log('Approved.')
  } else {
    console.log(`USDC allowance OK (${currentAllowance}).`)
  }

  if (!skipPrompt && !(await confirm('Post this order? (y/N) '))) {
    console.log('Aborted.')
    return
  }

  const { orderId } = await postSwapOrderFromQuote()
  console.log()
  console.log(`Order posted: ${orderId}`)
  console.log(`Explorer:     https://explorer.cow.fi/orders/${orderId}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
