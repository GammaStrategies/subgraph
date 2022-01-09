/* eslint-disable prefer-const */
import { BigInt, dataSource } from "@graphprotocol/graph-ts";
import { getGammaRateInUSDC } from "./pricing";
import { Transfer as TransferEvent } from "../../generated/VisrToken/ERC20";
import { Visor, VisrToken } from "../../generated/schema";
import {
  getOrCreateRewardHypervisor,
  getOrCreateRewardHypervisorShare,
} from "./rewardHypervisor";
import { ZERO_BI, ZERO_BD, constantAddresses } from "./constants";

export function getOrCreateVisrToken(): VisrToken {
  let addressLookup = constantAddresses.network(dataSource.network());
  let visrAddress = addressLookup.get("VISR") as string;

  let visr = VisrToken.load(visrAddress);
  if (visr === null) {
    visr = new VisrToken(visrAddress);
    visr.name = "VISOR";
    visr.decimals = 18 as i32;
    visr.save();
  }
  return visr as VisrToken;
}

// export function recordVisrDistribution(event: TransferEvent): void {
//   let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
//   let amount = event.params.value;

//   let visrDistribution = new VisrDistribution(id);
//   visrDistribution.timestamp = event.block.timestamp;
//   visrDistribution.visor = event.params.to.toHex();
//   visrDistribution.amount = amount;
//   let visrRate = getGammaRateInUSDC();
//   visrDistribution.amountUSD = amount.toBigDecimal() * visrRate;
//   visrDistribution.save();
// }

export function unstakeVisrFromVisor(
  visorAddress: string,
  amount: BigInt
): void {
  
  let rHypervisor = getOrCreateRewardHypervisor();
  let rHypervisorShares = getOrCreateRewardHypervisorShare(visorAddress);

  let visor = Visor.load(visorAddress);
  if (visor != null) {
    let visrStaked =
      (rHypervisorShares.shares * rHypervisor.totalVisr) /
      rHypervisor.totalSupply;
    let visrEarned = visrStaked - visor.visrDeposited;

    if (amount > visrEarned) {
      visor.visrDeposited -= amount - visrEarned;
      // If unstake amount is larger than earned, then all earned visr is realized
      visor.visrEarnedRealized += visrEarned;
    } else {
      // If unstake amount <= earned, then only unstaked amount is realized
      visor.visrEarnedRealized += amount;
    }
    visor.save();
  }
}
