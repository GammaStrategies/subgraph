/* eslint-disable prefer-const */
import { BigInt } from '@graphprotocol/graph-ts'
import { ZERO_BI, REWARD_HYPERVISOR_ADDRESS } from './constants'
import { RewardHypervisor, RewardHypervisorShare } from "../../generated/schema"


export function getOrCreateRewardHypervisor(): RewardHypervisor {
	
	let xgamma = RewardHypervisor.load(REWARD_HYPERVISOR_ADDRESS)
	if (!xgamma) {
		xgamma = new RewardHypervisor(REWARD_HYPERVISOR_ADDRESS)
		xgamma.totalGamma = ZERO_BI
		xgamma.totalSupply = ZERO_BI
		xgamma.save()
	}

	return xgamma as RewardHypervisor
}

export function getOrCreateRewardHypervisorShare(visorAddress: string): RewardHypervisorShare {
	
	let id = REWARD_HYPERVISOR_ADDRESS + "-" + visorAddress

	let xgammaShare = RewardHypervisorShare.load(id)
	if (!xgammaShare) {
		xgammaShare = new RewardHypervisorShare(id)
		xgammaShare.rewardHypervisor = REWARD_HYPERVISOR_ADDRESS
		xgammaShare.visor = visorAddress
		xgammaShare.shares = ZERO_BI
	}

	return xgammaShare as RewardHypervisorShare
}

export function decreaseRewardHypervisorShares(visorAddress: string, shares: BigInt): void {

	let id = REWARD_HYPERVISOR_ADDRESS + "-" + visorAddress

	let xgammaShare = RewardHypervisorShare.load(id)
	if (xgammaShare) {
		xgammaShare.shares -= shares
		xgammaShare.save()
	}
}
