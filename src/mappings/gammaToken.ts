/* eslint-disable prefer-const */
import { dataSource, Address } from '@graphprotocol/graph-ts'
import { Transfer as TransferEvent } from "../../generated/GammaToken/ERC20"
import { updateDistributionDayData, updateRewardHypervisorDayData } from '../utils/intervalUpdates'
import {
	ADDRESS_ZERO,
	REWARD_HYPERVISOR_ADDRESS,
	SWAPPER_ADDRESS,
	constantAddresses,
	TZ_UTC,
	TZ_EST
} from '../utils/constants'
import { getOrCreateRewardHypervisor } from '../utils/rewardHypervisor'
import { unstakeGammaFromAccount } from '../utils/gammaToken'
import { 
	getOrCreateAccount,
	getOrCreateUser,
	getOrCreateProtocolDistribution,
	getOrCreateRewardHypervisorTx
} from '../utils/entities'
import { getOrCreateToken } from '../utils/tokens'
import { getGammaRateInUSDC } from '../utils/pricing'


let REWARD_HYPERVISOR = Address.fromString(REWARD_HYPERVISOR_ADDRESS)
let SWAPPER = Address.fromString(SWAPPER_ADDRESS)

export function handleTransfer(event: TransferEvent): void {
	let addressLookup = constantAddresses.network(dataSource.network())
	let gammaAddress = addressLookup.get("GAMMA") as string
	let gammaAmount = event.params.value

	let gamma = getOrCreateToken(Address.fromString(gammaAddress))
	if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
		// Mint event
		gamma.totalSupply += gammaAmount
		gamma.save()
	}

	let xgamma = getOrCreateRewardHypervisor()
	
	let xgammaTx = getOrCreateRewardHypervisorTx(event.transaction.hash.toHex())
	xgammaTx.gammaAmount = gammaAmount
	
	if (event.params.to == REWARD_HYPERVISOR) {
		xgamma.totalGamma += gammaAmount
		// Deposit into reward hypervisor
		if (event.params.from == SWAPPER) {
			// Distribution event if from swapper
			let protocolDist = getOrCreateProtocolDistribution(gammaAddress)
			let tokenRate = getGammaRateInUSDC()

			let distributed = gammaAmount
			let distributedUSD = gammaAmount.toBigDecimal() * tokenRate

			protocolDist.distributed += distributed
			protocolDist.distributedUSD += distributedUSD
			protocolDist.save()

			// Update daily distributed data
			// UTC
			updateDistributionDayData(
				gammaAddress,
				distributed,
				distributedUSD,
				event.block.timestamp,
				TZ_UTC
			)
			// EST
			updateDistributionDayData(
				gammaAddress,
				distributed,
				distributedUSD,
				event.block.timestamp,
				TZ_EST
			)
		} else {
			// If not from swapper, this is a deposit by user
			xgammaTx.save()  // Preserve Tx
			let accountFrom = getOrCreateAccount(event.params.from.toHexString())
			if (accountFrom.type === 'non-visor') {
				getOrCreateUser(accountFrom.parent, true)
			}
			accountFrom.gammaDeposited += gammaAmount
			accountFrom.save()
		}
	} else if (event.params.from == REWARD_HYPERVISOR) {
		// User withdraw from reward hypervisor
		// update account
		xgammaTx.save()  // Save gammaAmount value before unstake
		unstakeGammaFromAccount(event.params.to.toHexString(), event.transaction.hash.toHex())
		xgamma.totalGamma -= gammaAmount
	}

	xgamma.save()

	if (event.params.to === REWARD_HYPERVISOR || event.params.from === REWARD_HYPERVISOR) {
		updateRewardHypervisorDayData(event.block.timestamp, TZ_UTC)
		updateRewardHypervisorDayData(event.block.timestamp, TZ_EST)
	}
}
