import 'dotenv/config'
import readline from 'node:readline/promises'
import {
  createPublicClient,
  encodeFunctionData,
  formatUnits,
  http,
  parseUnits,
  type Address,
  type Hex,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { SupportedChainId, TradingSdk } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

export const USDC: Address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
export const COW: Address = '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB'
export const BURN_GAS: Address = '0xf97c2c062e0e0a74c6d99923cf7528c68685643d'

export const USDC_DECIMALS = 6
export const COW_DECIMALS = 18

export const APP_CODE = 'contract-helpers/mock-hook-gas'

export interface Env {
  rpcUrl: string
  privateKey: Hex
  sellAmount: bigint
  sellAmountHuman: string
  hookGasLimit: number
}

export function loadEnv(): Env {
  const rpcUrl = required('RPC_URL')
  const rawKey = required('PRIVATE_KEY')
  const privateKey = (rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`) as Hex
  const sellAmountHuman = process.env.SELL_AMOUNT_USDC ?? '10'
  const sellAmount = parseUnits(sellAmountHuman, USDC_DECIMALS)
  const hookGasLimit = Number(process.env.HOOK_GAS_LIMIT ?? '100000')
  if (!Number.isFinite(hookGasLimit) || hookGasLimit <= 0) {
    throw new Error(`HOOK_GAS_LIMIT must be a positive integer, got "${process.env.HOOK_GAS_LIMIT}"`)
  }
  return { rpcUrl, privateKey, sellAmount, sellAmountHuman, hookGasLimit }
}

export function buildSdk(env: Env): { sdk: TradingSdk; owner: Address } {
  const account = privateKeyToAccount(env.privateKey)
  const provider = createPublicClient({ chain: mainnet, transport: http(env.rpcUrl) })
  const adapter = new ViemAdapter({ provider, signer: account })
  const sdk = new TradingSdk(
    { chainId: SupportedChainId.MAINNET, appCode: APP_CODE },
    {},
    adapter,
  )
  return { sdk, owner: account.address }
}

export interface BurnGasHook {
  target: string
  callData: string
  gasLimit: string
}

export function buildBurnGasHook(gasLimit: number): BurnGasHook {
  const callData = encodeFunctionData({
    abi: [
      {
        name: 'burnAllGas',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [],
      },
    ],
    functionName: 'burnAllGas',
    args: [],
  })
  return { target: BURN_GAS, callData, gasLimit: String(gasLimit) }
}

export function withHook(hook: BurnGasHook) {
  return { appData: { metadata: { hooks: { pre: [hook] } } } }
}

export function formatCow(amount: bigint | string | undefined): string {
  if (amount === undefined) return 'n/a'
  return formatUnits(BigInt(amount), COW_DECIMALS)
}

export function formatUsdc(amount: bigint | string | undefined): string {
  if (amount === undefined) return 'n/a'
  return formatUnits(BigInt(amount), USDC_DECIMALS)
}

function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}. Copy .env.example to .env and fill it in.`)
  return v
}

export function stringifyBigInt(value: unknown, indent?: number): string {
  return JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v), indent)
}

export async function confirm(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = await rl.question(prompt)
    return answer.trim().toLowerCase() === 'y'
  } finally {
    rl.close()
  }
}
