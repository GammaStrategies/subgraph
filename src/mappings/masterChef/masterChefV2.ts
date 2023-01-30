import {
  Deposit,
  EmergencyWithdraw,
  LogPoolAddition,
  LogRewarderAdded,
  LogSetPool,
  LogSushiPerSecond,
  LogUpdatePool,
  Withdraw,
} from "../../../generated/templates/MasterChefV2/MasterChefV2";
import { Rewarder as RewarderTemplate } from "../../../generated/templates";
import {
  getHypervisorFromPoolId,
  getOrCreateMasterChefV2,
  getOrCreateMCV2Pool,
  getOrCreateMCV2Rewarder,
  getOrCreateMCV2RewarderPool,
  incrementAccountAmount,
  isValidRewarder,
  syncRewarderPoolInfo,
} from "../../utils/masterChefV2";
import { ZERO_BI } from "../../utils/constants";
import { Address } from "@graphprotocol/graph-ts";

export function handleDeposit(event: Deposit): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );
  
  if (!hypervisorAddress) {
    return;
  }

  incrementAccountAmount(
    event.address,
    event.params.user,
    hypervisorAddress,
    event.params.amount
  );

}

export function handleWithdraw(event: Withdraw): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );
  
  if (!hypervisorAddress) {
    return;
  }

  incrementAccountAmount(
    event.address,
    event.params.user,
    hypervisorAddress,
    ZERO_BI.minus(event.params.amount)
  );
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );
  
  if (!hypervisorAddress) {
    return;
  }
  
  incrementAccountAmount(
    event.address,
    event.params.user,
    hypervisorAddress,
    ZERO_BI.minus(event.params.amount)
  );
}

export function handleLogPoolAddition(event: LogPoolAddition): void {
  const masterChefPool = getOrCreateMCV2Pool(
    event.address,
    event.params.lpToken
  );
  masterChefPool.poolId = event.params.pid;
  masterChefPool.allocPoint = event.params.allocPoint;
  masterChefPool.lastRewardTimestamp = event.block.timestamp;
  masterChefPool.save();
}

export function handleLogSetPool(event: LogSetPool): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );

  if (!hypervisorAddress) {
    return;
  }

  const masterChefPool = getOrCreateMCV2Pool(event.address, hypervisorAddress);

  masterChefPool.allocPoint = event.params.allocPoint;
  masterChefPool.save();
}

export function handleLogUpdatePool(event: LogUpdatePool): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );

  if (!hypervisorAddress) {
    return;
  }

  const masterChefPool = getOrCreateMCV2Pool(event.address, hypervisorAddress);

  masterChefPool.totalStaked = event.params.lpSupply;
  masterChefPool.accSushiPerShare = event.params.accSushiPerShare;
  masterChefPool.lastRewardTimestamp = event.params.lastRewardTime;
  masterChefPool.save();
}

export function handleLogSushiPerSecond(event: LogSushiPerSecond): void {
  const masterChef = getOrCreateMasterChefV2(event.address);
  masterChef.rewardPerSecond = event.params.sushiPerSecond;
  masterChef.save();
}

export function handleLogRewarderAdded(event: LogRewarderAdded): void {
  // This event triggers rewarders to be tracked
  // Check if rewarder is valid
  if (!isValidRewarder(event.params.rewarder)) {
    return;
  }

  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );

  if (!hypervisorAddress) {
    return;
  }

  const masterChefPool = getOrCreateMCV2Pool(event.address, hypervisorAddress);
  const rewarderList = masterChefPool.rewarderList;
  rewarderList.push(event.params.rewarder.toHex());
  masterChefPool.rewarderList = rewarderList;
  masterChefPool.save();

  // Create the rewarder entity, and sync pool info in case state was changed prior
  const rewarder = getOrCreateMCV2Rewarder(event.params.rewarder);
  getOrCreateMCV2RewarderPool(
    event.params.rewarder,
    Address.fromString(rewarder.masterChef),
    hypervisorAddress
  );
  syncRewarderPoolInfo(event.params.rewarder);

  RewarderTemplate.create(event.params.rewarder);
}
