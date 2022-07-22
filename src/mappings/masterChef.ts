import { Address } from "@graphprotocol/graph-ts";
import {
  AddLp,
  Deposit as DepositEvent,
  SetAllocPoint,
  Withdraw as WithdrawEvent,
} from "../../generated/MasterChef/MasterChef";

import {
  getOrCreateMasterChef,
  getOrCreateMasterChefPool,
  getOrCreateMasterChefPoolAccount,
} from "../utils/entities";
import { getHypervisorFromPoolId } from "../utils/masterChef";

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
    event.params.lpToken
  );
  masterChefPool.allocPoint = event.params.allocPoint;
  masterChefPool.save();

  let masterChef = getOrCreateMasterChef(
    Address.fromString(masterChefPool.masterChef)
  );
  masterChef.totalAllocPoint += event.params.allocPoint;
  masterChef.save();
}

export function handleSetAllocPoint(event: SetAllocPoint): void {
  let masterChefPool = getOrCreateMasterChefPool(
    event.address,
    event.params.lpToken
  );
  const oldAllocPoints = masterChefPool.allocPoint
  masterChefPool.allocPoint = event.params.allocPoint;
  masterChefPool.save();

  let masterChef = getOrCreateMasterChef(
    Address.fromString(masterChefPool.masterChef)
  );
  masterChef.totalAllocPoint += event.params.allocPoint - oldAllocPoints;
  masterChef.save();
}
