import { Address } from "@graphprotocol/graph-ts";
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
import { Rewarder as RewarderTemplate } from "../../../generated/templates"
import {
  getHypervisorFromPoolId,
  getOrCreateMasterChefV2,
  getOrCreateMasterChefV2Pool,
  getOrCreateMasterChefV2Rewarder,
  getOrCreateMasterChefV2RewarderAccount,
} from "../../utils/masterChefV2";

export function handleDeposit(event: Deposit): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );
  const masterChefPool = getOrCreateMasterChefV2Pool(
    event.address,
    hypervisorAddress
  );
  masterChefPool.totalStaked = masterChefPool.totalStaked.plus(
    event.params.amount
  );
  masterChefPool.save();

  for (let i = 0; i < masterChefPool.rewarderList.length; i++) {
    const rewarderAccount = getOrCreateMasterChefV2RewarderAccount(
      event.address,
      hypervisorAddress,
      Address.fromString(masterChefPool.rewarderList[i]),
      event.params.user
    );

    rewarderAccount.amount = rewarderAccount.amount.plus(event.params.amount);
    rewarderAccount.save();
  }
}

export function handleWithdraw(event: Withdraw): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );
  const masterChefPool = getOrCreateMasterChefV2Pool(
    event.address,
    hypervisorAddress
  );
  masterChefPool.totalStaked = masterChefPool.totalStaked.minus(
    event.params.amount
  );
  masterChefPool.save();

  for (let i = 0; i < masterChefPool.rewarderList.length; i++) {
    const rewarderAccount = getOrCreateMasterChefV2RewarderAccount(
      event.address,
      hypervisorAddress,
      Address.fromString(masterChefPool.rewarderList[i]),
      event.params.user
    );

    rewarderAccount.amount = rewarderAccount.amount.minus(event.params.amount);
    rewarderAccount.save();
  }
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );
  const masterChefPool = getOrCreateMasterChefV2Pool(
    event.address,
    hypervisorAddress
  );
  masterChefPool.totalStaked = masterChefPool.totalStaked.minus(
    event.params.amount
  );
  masterChefPool.save();

  for (let i = 0; i < masterChefPool.rewarderList.length; i++) {
    const rewarderAccount = getOrCreateMasterChefV2RewarderAccount(
      event.address,
      hypervisorAddress,
      Address.fromString(masterChefPool.rewarderList[i]),
      event.params.user
    );

    rewarderAccount.amount = rewarderAccount.amount.minus(event.params.amount);
    rewarderAccount.save();
  }
}

export function handleLogPoolAddition(event: LogPoolAddition): void {
  const masterChefPool = getOrCreateMasterChefV2Pool(
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
  const masterChefPool = getOrCreateMasterChefV2Pool(
    event.address,
    hypervisorAddress
  );

  masterChefPool.allocPoint = event.params.allocPoint;
  masterChefPool.save();
}

export function handleLogUpdatePool(event: LogUpdatePool): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );
  const masterChefPool = getOrCreateMasterChefV2Pool(
    event.address,
    hypervisorAddress
  );

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
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );

  const masterChefPool = getOrCreateMasterChefV2Pool(
    event.address,
    hypervisorAddress
  );
  const rewarderList = masterChefPool.rewarderList;
  rewarderList.push(event.params.rewarder.toHex());
  masterChefPool.rewarderList = rewarderList;

  masterChefPool.save();

  const rewarder = getOrCreateMasterChefV2Rewarder(
    event.params.rewarder
  );
  rewarder.masterChefPool = masterChefPool.id
  rewarder.save()

  RewarderTemplate.create(event.params.rewarder)
}
