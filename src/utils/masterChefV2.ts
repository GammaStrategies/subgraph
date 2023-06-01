import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  MasterChefV2,
  MasterChefV2Pool,
  MasterChefV2PoolAccount,
  MasterChefV2Rewarder,
  MasterChefV2RewarderPool,
  MasterChefV2RewarderPoolAccount,
} from "../../generated/schema";
import { MasterChefV2 as MasterChefContract } from "../../generated/templates/MasterChefV2/MasterChefV2";
import { MasterChefV2Rewarder as RewarderContract } from "../../generated/templates/Rewarder/MasterChefV2Rewarder";
import { ZERO_BI } from "../config/constants";
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

export function getOrCreateMCV2Pool(
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
    masterChefPool.hypervisor = hypervisor.id;
    masterChefPool.masterChef = masterChef.id;
    masterChefPool.poolId = ZERO_BI;
    masterChefPool.allocPoint = ZERO_BI;
    masterChefPool.stakeToken = stakeToken.id;
    masterChefPool.totalStaked = ZERO_BI;
    masterChefPool.accSushiPerShare = ZERO_BI;
    masterChefPool.rewarderList = [];
    masterChefPool.lastRewardTimestamp = ZERO_BI;
    masterChefPool.save();
  }

  return masterChefPool;
}

export function getOrCreateMCV2Rewarder(
  rewarderAddress: Address
): MasterChefV2Rewarder {
  let rewarder = MasterChefV2Rewarder.load(rewarderAddress.toHex());
  if (!rewarder) {
    const rewarderContract = RewarderContract.bind(rewarderAddress);

    const masterChef = getOrCreateMasterChefV2(
      rewarderContract.MASTERCHEF_V2()
    );

    rewarder = new MasterChefV2Rewarder(rewarderAddress.toHex());
    rewarder.masterChef = masterChef.id;
    rewarder.rewardPerSecond = rewarderContract.rewardPerSecond();
    rewarder.totalAllocPoint = ZERO_BI;
    rewarder.lastRewardTimestamp = ZERO_BI;

    const rewardTokenCall = rewarderContract.try_rewardToken();
    if (rewardTokenCall) {
      const rewardToken = getOrCreateToken(rewardTokenCall.value);
      rewarder.rewardToken = rewardToken.id;
    } else {
      rewarder.rewardToken = "";
    }

    rewarder.save();
  }
  return rewarder;
}

export function getOrCreateMCV2RewarderPool(
  rewarderAddress: Address,
  masterChefAddress: Address,
  hypervisorAddress: Address
): MasterChefV2RewarderPool {
  const poolId = masterChefAddress.toHex() + "-" + hypervisorAddress.toHex();
  const id = rewarderAddress.toHex() + "-" + poolId;

  let rewarderPool = MasterChefV2RewarderPool.load(id);
  if (!rewarderPool) {
    rewarderPool = new MasterChefV2RewarderPool(id);
    rewarderPool.rewarder = rewarderAddress.toHex();
    rewarderPool.pool = poolId;
    rewarderPool.allocPoint = ZERO_BI;
    rewarderPool.save();
  }
  return rewarderPool;
}

export function getOrCreateMCV2PoolAccount(
  masterChefAddress: Address,
  hypervisorAddress: Address,
  accountAddress: Address
): MasterChefV2PoolAccount {
  const mcV2PoolAccountId = masterChefAddress
    .toHex()
    .concat("-")
    .concat(hypervisorAddress.toHex())
    .concat("-")
    .concat(accountAddress.toHex());

  let poolAccount = MasterChefV2PoolAccount.load(mcV2PoolAccountId);

  if (!poolAccount) {
    poolAccount = new MasterChefV2PoolAccount(mcV2PoolAccountId);
    const pool = getOrCreateMCV2Pool(masterChefAddress, hypervisorAddress);
    const account = getOrCreateAccount(accountAddress.toHex(), true);
    poolAccount.pool = pool.id;
    poolAccount.account = account.id;
    poolAccount.amount = ZERO_BI;

    poolAccount.save();
  }
  return poolAccount;
}

export function getOrCreateMCV2RewarderPoolAccount(
  rewarderAddress: Address,
  masterChefAddress: Address,
  hypervisorAddress: Address,
  userAccount: Address
): MasterChefV2RewarderPoolAccount {
  const id =
    rewarderAddress.toHex() +
    "-" +
    masterChefAddress.toHex() +
    "-" +
    hypervisorAddress.toHex() +
    "-" +
    userAccount.toHex();

  const rewarderPool = getOrCreateMCV2RewarderPool(
    rewarderAddress,
    masterChefAddress,
    hypervisorAddress
  );
  const account = getOrCreateAccount(userAccount.toHex(), true);

  let rewarderPoolAccount = MasterChefV2RewarderPoolAccount.load(id);
  if (!rewarderPoolAccount) {
    rewarderPoolAccount = new MasterChefV2RewarderPoolAccount(id);
    rewarderPoolAccount.account = account.id;
    rewarderPoolAccount.rewarderPool = rewarderPool.id;

    rewarderPoolAccount.amount = ZERO_BI;
    rewarderPoolAccount.save();
  }

  return rewarderPoolAccount;
}

export function getHypervisorFromPoolId(
  masterChefAddress: Address,
  poolId: BigInt
): Address | null {
  const masterChefContract = MasterChefContract.bind(masterChefAddress);
  const lpToken = masterChefContract.try_lpToken(poolId);
  if (lpToken.reverted) {
    return null;
  }
  return lpToken.value;
}

export function isValidRewarder(rewarderAddress: Address): bool {
  const rewarderContract = RewarderContract.bind(rewarderAddress);
  const rewardToken = rewarderContract.try_rewardToken();

  return !rewardToken.reverted;
}

export function updateRewarderAllocPoint(
  rewarderAddress: Address,
  hypervisorAddress: Address,
  allocPoint: BigInt
): void {
  // This is the point where a rewarder is attached to a pool, so this is where RewarderPool should be created
  const rewarder = getOrCreateMCV2Rewarder(rewarderAddress);
  const rewarderContract = RewarderContract.bind(rewarderAddress);

  const rewarderPool = getOrCreateMCV2RewarderPool(
    rewarderAddress,
    Address.fromString(rewarder.masterChef),
    hypervisorAddress
  );

  rewarderPool.allocPoint = allocPoint;
  rewarderPool.save();

  rewarder.totalAllocPoint = rewarderContract.totalAllocPoint();
  rewarder.save()
}

export function syncRewarderPoolInfo(rewarderAddress: Address): void {
  const rewarder = getOrCreateMCV2Rewarder(rewarderAddress);
  const rewarderContract = RewarderContract.bind(rewarderAddress);

  const masterChefAddress = Address.fromString(rewarder.masterChef);

  for (let i = 0; i < rewarderContract.poolLength().toI32(); i++) {
    const iBI = BigInt.fromI32(i);
    const poolInfo = rewarderContract.poolInfo(iBI);
    const allocPoint = poolInfo.getAllocPoint();

    const rewarderPool = getOrCreateMCV2RewarderPool(
      rewarderAddress,
      masterChefAddress,
      getHypervisorFromPoolId(masterChefAddress, iBI)!
    );
    rewarderPool.allocPoint = allocPoint;
    rewarderPool.save();
  }
  rewarder.totalAllocPoint = rewarderContract.totalAllocPoint()
  rewarder.save();
}

export function incrementAccountAmount(
  masterChefAddress: Address,
  accountAddress: Address,
  hypervisorAddress: Address,
  amount: BigInt
): void {
  const masterChefPool = getOrCreateMCV2Pool(
    masterChefAddress,
    hypervisorAddress
  );
  masterChefPool.totalStaked = masterChefPool.totalStaked.plus(amount);
  masterChefPool.save();

  let poolAccount = getOrCreateMCV2PoolAccount(
    masterChefAddress,
    hypervisorAddress,
    accountAddress
  );
  poolAccount.amount = poolAccount.amount.plus(amount);
  poolAccount.save();

  for (let i = 0; i < masterChefPool.rewarderList.length; i++) {
    const rewarderAccount = getOrCreateMCV2RewarderPoolAccount(
      Address.fromString(masterChefPool.rewarderList[i]),
      masterChefAddress,
      hypervisorAddress,
      accountAddress
    );

    rewarderAccount.amount = rewarderAccount.amount.plus(amount);
    rewarderAccount.save();
  }
}
