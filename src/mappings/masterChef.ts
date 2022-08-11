import { Address } from "@graphprotocol/graph-ts";
import {
  AddLp,
  Deposit as DepositEvent,
  SetAllocPoint,
  Withdraw as WithdrawEvent,
  PoolUpdated,
} from "../../generated/MasterChef/MasterChef";
import {
  getOrCreateMasterChef,
  getOrCreateMasterChefPool,
  getOrCreateMasterChefPoolAccount,
  getHypervisorFromPoolId,
} from "../utils/masterChef";

export function handleDeposit(event: DepositEvent): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );

  let masterChefPoolAccount = getOrCreateMasterChefPoolAccount(
    event.address,
    hypervisorAddress,
    event.params.user
  );
  masterChefPoolAccount.amount += event.params.amount;
  masterChefPoolAccount.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );

  let masterChefPoolAccount = getOrCreateMasterChefPoolAccount(
    event.address,
    hypervisorAddress,
    event.params.user
  );
  masterChefPoolAccount.amount -= event.params.amount;
  masterChefPoolAccount.save();
}

export function handleAddLp(event: AddLp): void {
  let masterChefPool = getOrCreateMasterChefPool(
    event.address,
    event.params.poolInfo.lpToken
  );
  masterChefPool.allocPoint = event.params.poolInfo.allocPoint;
  masterChefPool.lastRewardBlock = event.params.poolInfo.lastRewardBlock;
  masterChefPool.poolId = event.params.poolId;
  masterChefPool.save();

  let masterChef = getOrCreateMasterChef(
    Address.fromString(masterChefPool.masterChef)
  );
  masterChef.totalAllocPoint += event.params.poolInfo.allocPoint;
  masterChef.save();
}

export function handleSetAllocPoint(event: SetAllocPoint): void {
  let masterChefPool = getOrCreateMasterChefPool(
    event.address,
    event.params.poolInfo.lpToken
  );
  const oldAllocPoints = masterChefPool.allocPoint;
  masterChefPool.allocPoint = event.params.poolInfo.allocPoint;
  masterChefPool.save();

  let masterChef = getOrCreateMasterChef(
    Address.fromString(masterChefPool.masterChef)
  );
  masterChef.totalAllocPoint +=
    event.params.poolInfo.allocPoint - oldAllocPoints;
  masterChef.save();
}

export function handlePoolUpdated(event: PoolUpdated): void {
  let masterChefPool = getOrCreateMasterChefPool(
    event.address,
    event.params.poolInfo.lpToken
  );
  masterChefPool.lastRewardBlock = event.params.poolInfo.lastRewardBlock;
  masterChefPool.save();
}
