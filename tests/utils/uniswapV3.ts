/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { UniswapV3HypervisorConversion, UniswapV3Pool } from '../../generated/schema'

export function addPool(
    poolId: string,
    sqrtPriceX96: BigInt,
    token0: string,
    token1: string
): void {
    let pool = new UniswapV3Pool(poolId)
    pool.sqrtPriceX96 = sqrtPriceX96
    pool.token0 = token0
    pool.token1 = token1
    pool.save()
}

export function addHypervisorConversion(
    hypervisorId: string,
    baseTokenIndex: i32,
    baseToken: string,
    usdPool: string,
    usdTokenIndex: i32,
    priceTokenInBase: BigDecimal,
    priceBaseInUSD: BigDecimal
): void {
    let conversion = new UniswapV3HypervisorConversion(hypervisorId)
    conversion.hypervisor = hypervisorId
    conversion.baseTokenIndex = baseTokenIndex
    conversion.baseToken = baseToken
    conversion.usdPool = usdPool
    conversion.usdTokenIndex = usdTokenIndex
    conversion.priceTokenInBase = priceTokenInBase
    conversion.priceBaseInUSD = priceBaseInUSD
    conversion.save()
}