/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt, dataSource } from '@graphprotocol/graph-ts'
import { isUSDC, isZero } from "./tokens"
import { ONE_BD, ZERO_BD, constantAddresses } from "./constants"
import { UniswapV3Pool, UniswapV3HypervisorConversion } from "../../generated/schema"


let USDC_DECIMAL_FACTOR = 10 ** 6
export function getExchangeRate(poolAddress: Address, baseTokenIndex: i32): BigDecimal {
    // Get ratios to convert token0 to token1 and vice versa
    let pool = UniswapV3Pool.load(poolAddress.toHex()) as UniswapV3Pool
    let sqrtPriceX96 = pool.sqrtPriceX96
    let num = sqrtPriceX96.times(sqrtPriceX96).toBigDecimal()
    //let denom = BigDecimal.fromString(Q192.toString())
    let Q192_BI = BigInt.fromI32(2).pow(192)
    let denom = new BigDecimal(Q192_BI)

    let price = ZERO_BD
    if (baseTokenIndex == 0 && num > ZERO_BD) {
        price = denom / num  // This is rate of token1 in token0
    } else if (baseTokenIndex == 1) {
        price = num / denom  // This is rate of token0 in token1
    }
    return price
}

export function getEthRateInUSDC(): BigDecimal{

    let addressLookup = constantAddresses.network(dataSource.network())
    let poolAddress = addressLookup.get("WETH-USDC") as string

    let ethInUsdcRate = getExchangeRate(Address.fromString(poolAddress), 0)
    let rate = ethInUsdcRate / BigDecimal.fromString(USDC_DECIMAL_FACTOR.toString())

    return rate as BigDecimal
}

export function getVisrRateInUSDC(): BigDecimal{

    let addressLookup = constantAddresses.network(dataSource.network())
    let poolAddressVisr = addressLookup.get("WETH-VISR") as string
    let poolAddressUsdc = addressLookup.get("WETH-USDC") as string

    let visrInEthRate = getExchangeRate(Address.fromString(poolAddressVisr), 0)
    let ethInUsdcRate = getExchangeRate(Address.fromString(poolAddressUsdc), 0)
    let rate = visrInEthRate * ethInUsdcRate / BigDecimal.fromString(USDC_DECIMAL_FACTOR.toString())

    return rate as BigDecimal    
}

export function getBaseTokenRateInUSDC(hypervisorId: string): BigDecimal {
    let rate = ZERO_BD
    let conversion = UniswapV3HypervisorConversion.load(hypervisorId)
    if (conversion != null) {
        if (isZero(Address.fromString(conversion.baseToken))) {
            rate = ZERO_BD
        } else if (isUSDC(Address.fromString(conversion.baseToken))) {
            rate = ONE_BD
        } else {
            rate = getExchangeRate(Address.fromString(conversion.usdPool), conversion.usdTokenIndex)
        }
    }
    // After conversions the rate will always be in USDC, which has 6 decimals
    return rate / BigDecimal.fromString(USDC_DECIMAL_FACTOR.toString()) as BigDecimal
}
