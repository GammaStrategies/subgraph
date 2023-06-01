import { Address, BigInt } from "@graphprotocol/graph-ts";
import { MasterChef as MasterChefContract } from "../../generated/MasterChef/MasterChef";
import {
  MasterChef,
  MasterChefPool,
  MasterChefPoolAccount,
} from "../../generated/schema";
import { ZERO_BI } from "../config/constants";
import { getOrCreateAccount } from "./entities";
import { getOrCreateToken } from "./tokens";
import { getOrCreateHypervisor } from "./uniswapV3/hypervisor";

export function getOrCreateMasterChef(address: Address): MasterChef {
  const id = address.toHex();

  let masterChef = MasterChef.load(id);
  if (!masterChef) {
    let masterChefContract = MasterChefContract.bind(address);

    let rewardToken = getOrCreateToken(masterChefContract.sushi());

    masterChef = new MasterChef(id);
    masterChef.rewardToken = rewardToken.id;
    masterChef.rewardPerBlock = masterChefContract.sushiPerBlock();
    masterChef.totalAllocPoint = ZERO_BI;
    masterChef.save();
  }

  return masterChef;
}

export function getOrCreateMasterChefPool(
  masterChefAddress: Address,
  hypervisorAddress: Address
): MasterChefPool {
  const id = masterChefAddress.toHex() + "-" + hypervisorAddress.toHex();

  let masterChefPool = MasterChefPool.load(id);
  if (!masterChefPool) {
    let masterChef = getOrCreateMasterChef(masterChefAddress);
    let hypervisor = getOrCreateHypervisor(hypervisorAddress);
    let stakeToken = getOrCreateToken(hypervisorAddress);

    masterChefPool = new MasterChefPool(id);
    masterChefPool.masterChef = masterChef.id;
    masterChefPool.hypervisor = hypervisor.id;
    masterChefPool.allocPoint = ZERO_BI;
    masterChefPool.lastRewardBlock = ZERO_BI;
    masterChefPool.stakeToken = stakeToken.id;
    masterChefPool.totalStaked = ZERO_BI;
    masterChefPool.poolId = ZERO_BI;
    masterChefPool.save();
  }

  return masterChefPool;
}

export function getOrCreateMasterChefPoolAccount(
  masterChefAddress: Address,
  hypervisorAddress: Address,
  userAccount: Address
): MasterChefPoolAccount {
  const masterChefPoolId =
    masterChefAddress.toHex() + "-" + hypervisorAddress.toHex();
  const id = masterChefPoolId + "-" + userAccount.toHex();

  let masterChefPool = getOrCreateMasterChefPool(
    masterChefAddress,
    hypervisorAddress
  );
  let account = getOrCreateAccount(userAccount.toHex(), true);

  let masterChefPoolAccount = MasterChefPoolAccount.load(id);
  if (!masterChefPoolAccount) {
    masterChefPoolAccount = new MasterChefPoolAccount(id);
    masterChefPoolAccount.account = account.id;
    masterChefPoolAccount.masterChefPool = masterChefPool.id;
    masterChefPoolAccount.amount = ZERO_BI;
    masterChefPoolAccount.save();
  }

  return masterChefPoolAccount;
}

export function getHypervisorFromPoolId(
  masterChefAddress: Address,
  poolId: BigInt
): Address | null {
  let masterChefContract = MasterChefContract.bind(masterChefAddress);
  const poolInfo = masterChefContract.try_poolInfo(poolId);
  if (poolInfo.reverted) {
    return null;
  }
  return poolInfo.value.getLpToken();
}
