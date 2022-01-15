/* eslint-disable prefer-const */
import { Address } from '@graphprotocol/graph-ts'
import { MultisendEtherCall, Multisended } from "../../generated/FeeDistributor/FeeDistributor"
import { updateEthDistributionTotals } from "../utils/feeDistributor"
import { getOrCreateAccount } from "../utils/entities"


export function handleMultisendEther(call: MultisendEtherCall): void {
	// let visors = call.inputs._contributors
	// let amounts = call.inputs._balances

	// for (let i = 0; i < visors.length; i++) {
	// 	recordEthDistribution(call, i)
	// 	let account = getOrCreateAccount(visors[i].toHex())
	// 	account.ethEarned += amounts[i]
	// 	account.save()
	// }
}

export function handleMultisended(event: Multisended): void {
	let ethAddress = Address.fromString("0x000000000000000000000000000000000000beef") // Contract uses this to represent ETH
	if (event.params.tokenAddress == ethAddress) {
		updateEthDistributionTotals(event)
	}
}
