import { Address, log } from '@graphprotocol/graph-ts'
import { MultisendEtherCall, Multisended } from "../../generated/FeeDistributor/FeeDistributor"
import { recordEthDistribution, updateEthDistributionTotals } from "../utils/feeDistributor"
import { getOrCreateVisor } from "../utils/visorFactory"


export function handleMultisendEther(call: MultisendEtherCall): void {
	// let visors = call.inputs._contributors
	// let amounts = call.inputs._balances

	// for (let i = 0; i < visors.length; i++) {
	// 	recordEthDistribution(call, i)
	// 	let visor = getOrCreateVisor(visors[i].toHex())
	// 	visor.ethEarned += amounts[i]
	// 	visor.save()
	// }
}

export function handleMultisended(event: Multisended): void {
	log.warning("{}", [event.params.tokenAddress.toHex()])
	let ethAddress = Address.fromString("0x000000000000000000000000000000000000beef")
	if (event.params.tokenAddress == ethAddress) {
		updateEthDistributionTotals(event)
	}
}
