/* eslint-disable prefer-const */
import { BigInt } from '@graphprotocol/graph-ts'
import { MultisendEtherCall, Multisended } from "../../generated/FeeDistributor/FeeDistributor"
import { EthToken } from '../../generated/schema'
import { getEthRateInUSDC } from "./pricing"
import { getEthDayData, updateDistributionDayData } from "./intervalUpdates"
import { ZERO_BI, ZERO_BD } from "./constants"
import { getOrCreateProtocolDistribution } from './entities'


// export function recordEthDistribution(call: MultisendEtherCall, index: i32): void {
// 	let visors = call.inputs._contributors
// 	let visor = visors[index].toHex()
// 	let amounts = call.inputs._balances
// 	let amount = amounts[index]
// 	let id = call.transaction.hash.toHex() + "-" + visor + "-" + index.toString()

// 	let ethDistribution = new EthDistribution(id)
// 	ethDistribution.timestamp = call.block.timestamp
// 	ethDistribution.visor = visor
// 	ethDistribution.amount = amount
// 	let ethRate = getEthRateInUSDC()
// 	ethDistribution.amountUSD = amount.toBigDecimal() * ethRate
// 	ethDistribution.tx = call.transaction.hash.toHex()
// 	ethDistribution.index = index
// 	ethDistribution.save()
// }

export function updateEthDistributionTotals(event: Multisended): void {
	let total = event.params.total
	
	// Redundant
	let eth = EthToken.load("0")
	if (eth === null) {
		eth = new EthToken("0")
		eth.decimals = 18
	}

	let ethRate = getEthRateInUSDC()
	let totalUSD = total.toBigDecimal() * ethRate

	// redundant
	eth.totalDistributed += total
	eth.totalDistributedUSD += totalUSD
	eth.save()

	let protocolDist = getOrCreateProtocolDistribution('ETH')
	protocolDist.distributed += total
	protocolDist.distributedUSD += totalUSD
	protocolDist.save()

	//need fixing
	let ethDayDataUTC = getEthDayData(event, ZERO_BI)
	ethDayDataUTC.distributed += total
	ethDayDataUTC.distributedUSD += totalUSD
	ethDayDataUTC.save()

	let ethDayDataEST = getEthDayData(event, BigInt.fromI32(-5))
	ethDayDataEST.distributed += total
	ethDayDataEST.distributedUSD += totalUSD
	ethDayDataEST.save()

	// UTC
	updateDistributionDayData(
		"ETH",
		total,
		totalUSD,
		event.block.timestamp,
		ZERO_BI
	)
	// EST
	updateDistributionDayData(
		"ETH",
		total,
		totalUSD,
		event.block.timestamp,
		BigInt.fromI32(-5)
	)
}
