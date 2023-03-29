/* eslint-disable prefer-const */
import { Account } from "../../generated/schema";
import {
  getOrCreateRewardHypervisor,
  getOrCreateRewardHypervisorTx,
} from "./entities";

export function unstakeGammaFromAccount(
  accountAddress: string,
  transactionId: string
): void {
  let xgamma = getOrCreateRewardHypervisor();
  let xgammaTx = getOrCreateRewardHypervisorTx(transactionId);

  let account = Account.load(accountAddress);
  if (account != null) {
    let amount = xgammaTx.gammaAmount;
    let gammaStaked = xgammaTx.xgammaAmountBefore
      .times(xgamma.totalGamma)
      .div(xgammaTx.xgammaSupplyBefore);
    let gammaEarned = gammaStaked.minus(account.gammaDeposited);

    if (amount > gammaEarned) {
      account.gammaDeposited -= amount - gammaEarned;
      // If unstake amount is larger than earned, then all earned gamma is realized
      account.gammaEarnedRealized =
        account.gammaEarnedRealized.plus(gammaEarned);
    } else {
      // If unstake amount <= earned, then only unstaked amount is realized
      account.gammaEarnedRealized = account.gammaEarnedRealized.plus(amount);
    }
    account.save();
  }
}
