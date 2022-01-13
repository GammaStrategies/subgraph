/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Account } from "../../generated/schema";
import {
  getOrCreateRewardHypervisor,
  getOrCreateRewardHypervisorShare,
} from "./rewardHypervisor";


export function unstakeGammaFromAccount(
  accountAddress: string,
  amount: BigInt
): void {
  
  let xgamma = getOrCreateRewardHypervisor();
  let xgammaShares = getOrCreateRewardHypervisorShare(accountAddress);

  let account = Account.load(accountAddress);
  if (account != null) {
    let gammaStaked =
      (xgammaShares.shares * xgamma.totalGamma) /
      xgamma.totalSupply;
    let gammaEarned = gammaStaked - account.gammaDeposited;

    if (amount > gammaEarned) {
      account.gammaDeposited -= amount - gammaEarned;
      // If unstake amount is larger than earned, then all earned gamma is realized
      account.gammaEarnedRealized += gammaEarned;
    } else {
      // If unstake amount <= earned, then only unstaked amount is realized
      account.gammaEarnedRealized += amount;
    }
    account.save();
  }
}
