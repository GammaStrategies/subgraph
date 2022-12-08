import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  MasterChefV2,
  MasterChefV2Pool,
  MasterChefV2Rewarder,
  MasterChefV2RewarderAccount,
} from "../../generated/schema";
import { MasterChefV2 as MasterChefContract } from "../../generated/templates/MasterChefV2/MasterChefV2";
import { MasterChefV2Rewarder as RewarderContract } from "../../generated/templates/Rewarder/MasterChefV2Rewarder";
import { ZERO_BI } from "./constants";
import { getOrCreateAccount } from "./entities";
import { getOrCreateToken } from "./tokens";
import { getOrCreateHypervisor } from "./uniswapV3/hypervisor";

export function getOrCreateMasterChefV2(address: Address): MasterChefV2 {
  const id = address.toHex();

  let masterChefV2 = MasterChefV2.load(id);
  if (!masterChefV2) {
    const masterChefContract = MasterChefContract.bind(address);

    const rewardToken = getOrCreateToken(masterChefContract.SUSHI());

    masterChefV2 = new MasterChefV2(id);
    masterChefV2.rewardToken = rewardToken.id;
    masterChefV2.rewardPerSecond = masterChefContract.sushiPerSecond();
    masterChefV2.totalAllocPoint = ZERO_BI;
    masterChefV2.save();
  }

  return masterChefV2;
}

export function getOrCreateMasterChefV2Pool(
  masterChefAddress: Address,
  hypervisorAddress: Address
): MasterChefV2Pool {
  const id = masterChefAddress.toHex() + "-" + hypervisorAddress.toHex();

  let masterChefPool = MasterChefV2Pool.load(id);
  if (!masterChefPool) {
    const masterChef = getOrCreateMasterChefV2(masterChefAddress);
    const hypervisor = getOrCreateHypervisor(hypervisorAddress);
    const stakeToken = getOrCreateToken(hypervisorAddress);

    masterChefPool = new MasterChefV2Pool(id);
    masterChefPool.masterChef = masterChef.id;
    masterChefPool.hypervisor = hypervisor.id;
    masterChefPool.allocPoint = ZERO_BI;
    masterChefPool.stakeToken = stakeToken.id;
    masterChefPool.totalStaked = ZERO_BI;
    masterChefPool.poolId = ZERO_BI;
    masterChefPool.accSushiPerShare = ZERO_BI;
    masterChefPool.rewarderList = [];
    masterChefPool.lastRewardTimestamp = ZERO_BI;
    masterChefPool.save();
  }

  return masterChefPool;
}

export function getOrCreateMasterChefV2Rewarder(
  rewarderAddress: Address
): MasterChefV2Rewarder {
  let rewarder = MasterChefV2Rewarder.load(rewarderAddress.toHex());
  if (!rewarder) {
    const rewarderContract = RewarderContract.bind(rewarderAddress);

    rewarder = new MasterChefV2Rewarder(rewarderAddress.toHex());
    rewarder.masterChefPool = "";
    rewarder.rewardToken = rewarderContract.rewardToken().toHex();
    rewarder.rewardPerSecond = rewarderContract.rewardPerSecond();
    rewarder.lastRewardTimestamp = ZERO_BI;
    rewarder.save();
  }
  return rewarder;
}

export function getOrCreateMasterChefV2RewarderAccount(
  masterChefAddress: Address,
  hypervisorAddress: Address,
  rewarderAddress: Address,
  userAccount: Address
): MasterChefV2RewarderAccount {
  const id =
    masterChefAddress.toHex() +
    "-" +
    hypervisorAddress.toHex() +
    "-" +
    rewarderAddress.toHex() +
    "-" +
    userAccount.toHex();

  const masterChefRewarder = getOrCreateMasterChefV2Rewarder(rewarderAddress);
  const account = getOrCreateAccount(userAccount.toHex(), true);

  let rewarderAccount = MasterChefV2RewarderAccount.load(id);
  if (!rewarderAccount) {
    rewarderAccount = new MasterChefV2RewarderAccount(id);
    rewarderAccount.account = account.id;
    rewarderAccount.rewarder = masterChefRewarder.id;
    rewarderAccount.amount = ZERO_BI;
    rewarderAccount.save();
  }

  return rewarderAccount;
}

export function getHypervisorFromPoolId(
  masterChefAddress: Address,
  poolId: BigInt
): Address {
  const masterChefContract = MasterChefContract.bind(masterChefAddress);
  const lpToken = masterChefContract.lpToken(poolId);
  return lpToken;
}
