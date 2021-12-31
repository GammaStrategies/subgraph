/* eslint-disable prefer-const */
import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts'
import { ERC20 } from "../../generated/UniswapV3HypervisorFactory/ERC20"
import { ERC20SymbolBytes } from '../../generated/UniswapV3HypervisorFactory/ERC20SymbolBytes'
import { ERC20NameBytes } from '../../generated/UniswapV3HypervisorFactory/ERC20NameBytes'
import { StaticTokenDefinition } from './staticTokenDefinition'
import { BaseTokenDefinition } from './baseTokenDefinition'
import { getOrCreateHypervisor } from './uniswapV3/hypervisor'
import { 
  Token,
  StakedToken,
  RewardedToken,
  UniswapV3HypervisorConversion 
} from "../../generated/schema"
import { UniswapV3Pool as PoolTemplate } from "../../generated/templates";
import { getOrCreatePool } from "./uniswapV3/pool";
import { ZERO_BI, ZERO_BD, ADDRESS_ZERO, DEFAULT_DECIMAL, constantAddresses } from "./constants"


export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      } else {
        // try with the static definition
        let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
        if(staticTokenDefinition != null) {
          symbolValue = staticTokenDefinition.symbol
        }
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      } else {
        // try with the static definition
        let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
        if(staticTokenDefinition != null) {
          nameValue = staticTokenDefinition.name
        }
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  let contract = ERC20.bind(tokenAddress)
  // try types uint8 for decimals
  let decimalValue = DEFAULT_DECIMAL
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  } else {
    // try with the static definition
    let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
    if(staticTokenDefinition != null) {
      return staticTokenDefinition.decimals
    }
  }

  return decimalValue as i32
}

export function getOrCreateToken(tokenAddress: Address): Token {

  let token = Token.load(tokenAddress.toHex())

  if (token == null) {
    token = new Token(tokenAddress.toHex())
    token.symbol = fetchTokenSymbol(tokenAddress)
    token.name = fetchTokenName(tokenAddress)
    token.decimals = fetchTokenDecimals(tokenAddress)
  }

  return token as Token
}

export function getOrCreateStakedToken(vaultAddress: Address, tokenAddress: Address): StakedToken {

  let token = getOrCreateToken(tokenAddress)
  token.save()

  let stakedTokenId = vaultAddress.toHexString() + "-" + tokenAddress.toHexString() 
  let stakedToken = StakedToken.load(stakedTokenId)
  if (stakedToken == null) {
    stakedToken = new StakedToken(stakedTokenId)
    stakedToken.token = tokenAddress.toHexString()
    stakedToken.visor = vaultAddress.toHexString()
    stakedToken.amount = ZERO_BI
  }

  return stakedToken as StakedToken
}

export function createRewardedToken(vaultAddress: Address, tokenAddress: Address): RewardedToken {

  let token = getOrCreateToken(tokenAddress)
  token.save()

  let rewardedTokenId = vaultAddress.toHexString() + "-" + tokenAddress.toHexString() 
  let rewardedToken = new RewardedToken(rewardedTokenId)
  rewardedToken.token = tokenAddress.toHexString()
  rewardedToken.visor = vaultAddress.toHexString()
  rewardedToken.amount = ZERO_BI

  return rewardedToken as RewardedToken
}

function isToken(tokenAddress: Address, refAddress: Address): boolean {
  if (tokenAddress == refAddress){
    return true
  } else {
    return false
  }
}

export function isUSDC(tokenAddress: Address): boolean {
  let addressLookup = constantAddresses.network(dataSource.network())
  let usdcAddress = addressLookup.get('USDC') as string
  return isToken(tokenAddress, Address.fromString(usdcAddress))
}

export function isZero(tokenAddress: Address): boolean {
  return isToken(tokenAddress, Address.fromString(ADDRESS_ZERO))
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function createConversion(address: string): void {

  let hypervisor = getOrCreateHypervisor(Address.fromString(address), BigInt.fromI32(0))
  let pool = getOrCreatePool(Address.fromString(hypervisor.pool))
  let conversion = UniswapV3HypervisorConversion.load(address)
  // match with USDC and lookup pool address

  if (conversion == null) {
    conversion = new UniswapV3HypervisorConversion(address)

    let baseTokenLookup = BaseTokenDefinition.network(dataSource.network())
    let token0Lookup = baseTokenLookup.get(pool.token0)
    if (token0Lookup == null) {
      token0Lookup = BaseTokenDefinition.nonBase()
    }
    let token1Lookup = baseTokenLookup.get(pool.token1)
    if (token1Lookup == null) {
      token1Lookup = BaseTokenDefinition.nonBase()
    }

    // Reference arrays are in reverse order of priority. i.e. larger index take precedence
    if (token0Lookup.priority > token1Lookup.priority) {
      // token0 is the base token
      conversion.baseToken = pool.token0
      conversion.baseTokenIndex = 0
      conversion.usdPool = token0Lookup.pool
      conversion.usdTokenIndex = token0Lookup.usdTokenIdx
    } else if (token1Lookup.priority > token0Lookup.priority) {
      // token1 is the base token
      conversion.baseToken = pool.token1
      conversion.baseTokenIndex = 1
      conversion.usdPool = token1Lookup.pool
      conversion.usdTokenIndex = token1Lookup.usdTokenIdx
    } else {
      // This means token0 == token1 == -1, unidentified base token
      conversion.baseToken = ADDRESS_ZERO
      conversion.baseTokenIndex = -1
      conversion.usdPool = ADDRESS_ZERO
      conversion.usdTokenIndex = -1
    }
    conversion.priceTokenInBase = ZERO_BD
    conversion.priceBaseInUSD = ZERO_BD
    conversion.hypervisor = address
    conversion.save()

    if (conversion.usdPool != ADDRESS_ZERO) {
      let usdPoolAddress = Address.fromString(conversion.usdPool)
      let pool = getOrCreatePool(usdPoolAddress)
      pool.save()
      PoolTemplate.create(usdPoolAddress)
    }
    
  }
}
