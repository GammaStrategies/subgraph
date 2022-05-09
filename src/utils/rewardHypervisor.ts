/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { REWARD_HYPERVISOR_ADDRESS } from "./constants";
import { RewardHypervisorShare } from "../../generated/schema";

export function decreaseRewardHypervisorShares(
  accountAddress: string,
  shares: BigInt
): void {
  let id = REWARD_HYPERVISOR_ADDRESS + "-" + accountAddress;

  let xgammaShare = RewardHypervisorShare.load(id);
  if (xgammaShare) {
    xgammaShare.shares -= shares;
    xgammaShare.save();
  }
}
