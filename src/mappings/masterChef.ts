import { Address } from "@graphprotocol/graph-ts";
import {
  AddLp,
  Deposit as DepositEvent,
  SetAllocPoint,
  Withdraw as WithdrawEvent,
  PoolUpdated,
  UpdateEmissionRate,
} from "../../generated/templates/MasterChef/MasterChef";
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

  const masterChefPoolAccount = getOrCreateMasterChefPoolAccount(
    event.address,
    hypervisorAddress,
    event.params.user
  );
  masterChefPoolAccount.amount += event.params.amount;
  masterChefPoolAccount.save();

  const masterChefPool = getOrCreateMasterChefPool(
    event.address,
    hypervisorAddress
  );
  masterChefPool.totalStaked += event.params.amount;
  masterChefPool.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );

  const masterChefPoolAccount = getOrCreateMasterChefPoolAccount(
    event.address,
    hypervisorAddress,
    event.params.user
  );
  masterChefPoolAccount.amount -= event.params.amount;
  masterChefPoolAccount.save();

  const masterChefPool = getOrCreateMasterChefPool(
    event.address,
    hypervisorAddress
  );
  masterChefPool.totalStaked -= event.params.amount;
  masterChefPool.save();
}

export function handleAddLp(event: AddLp): void {
  const masterChefPool = getOrCreateMasterChefPool(
    event.address,
    event.params.poolInfo.lpToken
  );
  masterChefPool.allocPoint = event.params.poolInfo.allocPoint;
  masterChefPool.lastRewardBlock = event.params.poolInfo.lastRewardBlock;
  masterChefPool.poolId = event.params.poolId;
  masterChefPool.save();

  const masterChef = getOrCreateMasterChef(
    Address.fromString(masterChefPool.masterChef)
  );
  masterChef.totalAllocPoint += event.params.poolInfo.allocPoint;
  masterChef.save();
}

export function handleSetAllocPoint(event: SetAllocPoint): void {
  const masterChefPool = getOrCreateMasterChefPool(
    event.address,
    event.params.poolInfo.lpToken
  );
  const oldAllocPoints = masterChefPool.allocPoint;
  masterChefPool.allocPoint = event.params.poolInfo.allocPoint;
  masterChefPool.save();

  const masterChef = getOrCreateMasterChef(
    Address.fromString(masterChefPool.masterChef)
  );
  masterChef.totalAllocPoint +=
    event.params.poolInfo.allocPoint - oldAllocPoints;
  masterChef.save();
}

export function handlePoolUpdated(event: PoolUpdated): void {
  const masterChefPool = getOrCreateMasterChefPool(
    event.address,
    event.params.poolInfo.lpToken
  );
  masterChefPool.lastRewardBlock = event.params.poolInfo.lastRewardBlock;
  masterChefPool.save();
}

export function handleUpdateEmissionRate(event: UpdateEmissionRate): void {
  const masterChef = getOrCreateMasterChef(event.address);
  masterChef.rewardPerBlock = event.params.sushiPerBlock;
  masterChef.save();
}
