/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../../generated/GammaToken/ERC20";
import { Visor } from "../../generated/schema";
import {
  getOrCreateRewardHypervisor,
  getOrCreateRewardHypervisorShare,
} from "./rewardHypervisor";


export function recordVisrDistribution(event: TransferEvent): void {
//   let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
//   let amount = event.params.value;

//   let visrDistribution = new VisrDistribution(id);
//   visrDistribution.timestamp = event.block.timestamp;
//   visrDistribution.visor = event.params.to.toHex();
//   visrDistribution.amount = amount;
//   let visrRate = getGammaRateInUSDC();
//   visrDistribution.amountUSD = amount.toBigDecimal() * visrRate;
//   visrDistribution.save();
}

export function unstakeGammaFromVisor(
  visorAddress: string,
  amount: BigInt
): void {
  
  let xgamma = getOrCreateRewardHypervisor();
  let xgammaShares = getOrCreateRewardHypervisorShare(visorAddress);

  let visor = Visor.load(visorAddress);
  if (visor != null) {
    let gammaStaked =
      (xgammaShares.shares * xgamma.totalGamma) /
      xgamma.totalSupply;
    let gammaEarned = gammaStaked - visor.gammaDeposited;

    if (amount > gammaEarned) {
      visor.gammaDeposited -= amount - gammaEarned;
      // If unstake amount is larger than earned, then all earned visr is realized
      visor.gammaEarnedRealized += gammaEarned;
    } else {
      // If unstake amount <= earned, then only unstaked amount is realized
      visor.gammaEarnedRealized += amount;
    }
    visor.save();
  }
}
