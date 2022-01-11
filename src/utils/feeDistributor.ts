/* eslint-disable prefer-const */
import { BigInt } from '@graphprotocol/graph-ts'
import { MultisendEtherCall, Multisended } from "../../generated/FeeDistributor/FeeDistributor"
import { getEthRateInUSDC } from "./pricing"
import { updateDistributionDayData } from "./intervalUpdates"
import { ZERO_BI } from "./constants"
import { getOrCreateProtocolDistribution } from './entities'
import { getOrCreateEthToken } from './tokens'


export function recordEthDistribution(call: MultisendEtherCall, index: i32): void {
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
}

export function updateEthDistributionTotals(event: Multisended): void {
	let total = event.params.total
	
	let ethToken = getOrCreateEthToken()
	ethToken.save()

	let ethRate = getEthRateInUSDC()
	let totalUSD = total.toBigDecimal() * ethRate

	let protocolDist = getOrCreateProtocolDistribution('ETH')
	protocolDist.distributed += total
	protocolDist.distributedUSD += totalUSD
	protocolDist.save()

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
