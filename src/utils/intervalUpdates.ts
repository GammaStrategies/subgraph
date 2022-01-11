/* eslint-disable prefer-const */
import { BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import {
    DistributionDayData,
    UniswapV3HypervisorDayData,
    UniswapV3Hypervisor 
} from '../../generated/schema'
import { ZERO_BI } from './constants'

let SECONDS_IN_HOUR = BigInt.fromI32(60 * 60)
let SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24)


export function updateDistributionDayData(
    tokenId: string,
    distributed: BigInt,
    distributedUSD: BigDecimal,
    timestamp: BigInt,
    utcDiffHours: BigInt
): DistributionDayData {
    let utcDiffSeconds = utcDiffHours * SECONDS_IN_HOUR
    let timezone = (utcDiffHours == ZERO_BI) ? 'UTC' : "UTC" + utcDiffHours.toString() 

    let dayNumber = (timestamp + utcDiffSeconds) / SECONDS_IN_DAY
    let dayStartTimestamp = dayNumber * SECONDS_IN_DAY - utcDiffSeconds
    let dayId = tokenId + '-' + timezone + '-' + dayNumber.toString()

    let distDayData = DistributionDayData.load(dayId)
    if (distDayData == null) {
        distDayData = new DistributionDayData(dayId)
        distDayData.date = dayStartTimestamp
        distDayData.timezone = timezone
        distDayData.token = tokenId
    }

    distDayData.distributed += distributed
    distDayData.distributedUSD += distributedUSD
    distDayData.save()

    return distDayData as DistributionDayData
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
        hypervisorDayData.open = hypervisor.pricePerShare
        hypervisorDayData.close = hypervisor.pricePerShare
        hypervisorDayData.low = hypervisor.pricePerShare
        hypervisorDayData.high = hypervisor.pricePerShare
    }

    return hypervisorDayData as UniswapV3HypervisorDayData
}
