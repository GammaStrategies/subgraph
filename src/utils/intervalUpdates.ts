/* eslint-disable prefer-const */
import { ethereum, BigInt } from '@graphprotocol/graph-ts'
import {
    EthDayData,
    VisrTokenDayData,
    UniswapV3HypervisorDayData,
    UniswapV3Hypervisor 
} from '../../generated/schema'
import { getOrCreateVisrToken } from './visrToken'
import { getVisrRateInUSDC } from './pricing'
import { ZERO_BI, ZERO_BD } from './constants'

let SECONDS_IN_HOUR = BigInt.fromI32(60 * 60)
let SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24)


export function getEthDayData(event: ethereum.Event, utcDiffHours: BigInt): EthDayData {
    let timestamp = event.block.timestamp
    let utcDiffSeconds = utcDiffHours * SECONDS_IN_HOUR
    let timezone = (utcDiffHours == ZERO_BI) ? 'UTC' : "UTC" + utcDiffHours.toString() 

    let dayNumber = (timestamp + utcDiffSeconds) / SECONDS_IN_DAY
    let dayStartTimestamp = dayNumber * SECONDS_IN_DAY - utcDiffSeconds
    let dayId = timezone + '-' + dayNumber.toString()

    let ethDayData = EthDayData.load(dayId)
    if (ethDayData == null) {
        ethDayData = new EthDayData(dayId)
        ethDayData.date = dayStartTimestamp
        ethDayData.timezone = timezone
        ethDayData.distributed = ZERO_BI
        ethDayData.distributedUSD = ZERO_BD
    }

    return ethDayData as EthDayData
}

export function updateVisrTokenDayData(distributed: BigInt, timestamp: BigInt, utcDiffHours: BigInt): VisrTokenDayData {
    let utcDiffSeconds = utcDiffHours * SECONDS_IN_HOUR
    let timezone = (utcDiffHours == ZERO_BI) ? 'UTC' : "UTC" + utcDiffHours.toString() 

    let dayNumber = (timestamp + utcDiffSeconds) / SECONDS_IN_DAY
    let dayStartTimestamp = dayNumber * SECONDS_IN_DAY - utcDiffSeconds
    let dayId = timezone + '-' + dayNumber.toString()

    let visrDayData = VisrTokenDayData.load(dayId)
    if (visrDayData == null) {
        visrDayData = new VisrTokenDayData(dayId)
        visrDayData.date = dayStartTimestamp
        visrDayData.timezone = timezone
        visrDayData.distributed = ZERO_BI
        visrDayData.distributedUSD = ZERO_BD
    }

    let visrRate = getVisrRateInUSDC()
    let visr = getOrCreateVisrToken()

    visrDayData.totalStaked = visr.totalStaked
    visrDayData.distributed += distributed
    visrDayData.distributedUSD += distributed.toBigDecimal() * visrRate
    visrDayData.save()

    return visrDayData as VisrTokenDayData
}


export function updateAndGetUniswapV3HypervisorDayData(hypervisorAddress: string): UniswapV3HypervisorDayData {
    let hypervisor = UniswapV3Hypervisor.load(hypervisorAddress) as UniswapV3Hypervisor
    // hypervisorDayData.adjustedFeesReinvestedUSD = hypervisor.adjustedFeesReinvestedUSD
    
    let hypervisorDayDataUTC = getOrCreateHypervisorDayData(hypervisorAddress, ZERO_BI)
    hypervisorDayDataUTC.totalSupply = hypervisor.totalSupply
    hypervisorDayDataUTC.tvl0 = hypervisor.tvl0
    hypervisorDayDataUTC.tvl1 = hypervisor.tvl1
    hypervisorDayDataUTC.tvlUSD = hypervisor.tvlUSD
    hypervisorDayDataUTC.close = hypervisor.pricePerShare

    if (hypervisor.pricePerShare > hypervisorDayDataUTC.high) {
        hypervisorDayDataUTC.high = hypervisor.pricePerShare
    } else if (hypervisor.pricePerShare < hypervisorDayDataUTC.low) {
        hypervisorDayDataUTC.low = hypervisor.pricePerShare
    }

    return hypervisorDayDataUTC as UniswapV3HypervisorDayData
}


function getOrCreateHypervisorDayData(hypervisorAddress: string, utcDiffHours: BigInt): UniswapV3HypervisorDayData {
    let hypervisor = UniswapV3Hypervisor.load(hypervisorAddress) as UniswapV3Hypervisor

    let utcDiffSeconds = utcDiffHours * SECONDS_IN_HOUR
    let timezone = (utcDiffHours == ZERO_BI) ? 'UTC' : "UTC" + utcDiffHours.toString() 

    let dayNumber = (hypervisor.lastUpdated + utcDiffSeconds) / SECONDS_IN_DAY
    let dayStartTimestamp = dayNumber * SECONDS_IN_DAY - utcDiffSeconds

    let dayHypervisorId = hypervisorAddress + '-' + timezone + '-' + dayNumber.toString()
    let hypervisorDayData = UniswapV3HypervisorDayData.load(dayHypervisorId)
    if (hypervisorDayData === null) {
        hypervisorDayData = new UniswapV3HypervisorDayData(dayHypervisorId)
        hypervisorDayData.date = dayStartTimestamp
        hypervisorDayData.hypervisor = hypervisorAddress
        hypervisorDayData.deposited0 = ZERO_BI
        hypervisorDayData.deposited1 = ZERO_BI
        hypervisorDayData.depositedUSD = ZERO_BD
        hypervisorDayData.withdrawn0 = ZERO_BI
        hypervisorDayData.withdrawn1 = ZERO_BI
        hypervisorDayData.withdrawnUSD = ZERO_BD
        hypervisorDayData.grossFeesClaimed0 = ZERO_BI
        hypervisorDayData.grossFeesClaimed1 = ZERO_BI
        hypervisorDayData.grossFeesClaimedUSD = ZERO_BD
        hypervisorDayData.protocolFeesCollected0 = ZERO_BI
        hypervisorDayData.protocolFeesCollected1 = ZERO_BI
        hypervisorDayData.protocolFeesCollectedUSD = ZERO_BD
        hypervisorDayData.feesReinvested0 = ZERO_BI
        hypervisorDayData.feesReinvested1 = ZERO_BI
        hypervisorDayData.feesReinvestedUSD = ZERO_BD
        hypervisorDayData.totalSupply = ZERO_BI
        hypervisorDayData.tvl0 = ZERO_BI
        hypervisorDayData.tvl1 = ZERO_BI
        hypervisorDayData.tvlUSD = ZERO_BD
        hypervisorDayData.open = hypervisor.pricePerShare
        hypervisorDayData.close = hypervisor.pricePerShare
        hypervisorDayData.low = hypervisor.pricePerShare
        hypervisorDayData.high = hypervisor.pricePerShare
    }

    return hypervisorDayData as UniswapV3HypervisorDayData
}
