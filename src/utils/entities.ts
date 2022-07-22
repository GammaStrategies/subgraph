import { Address } from "@graphprotocol/graph-ts";
import {
  User,
  Account,
  ProtocolDistribution,
  RewardHypervisorTx,
  RewardHypervisor,
  RewardHypervisorShare,
  MasterChef,
  MasterChefPool,
  MasterChefPoolAccount,
} from "../../generated/schema";
import { MasterChef as MasterChefContract } from "../../generated/MasterChef/MasterChef";
import { REWARD_HYPERVISOR_ADDRESS, ZERO_BD, ZERO_BI } from "./constants";
import { getOrCreateToken } from "./tokens";
import { getOrCreateHypervisor } from "./uniswapV3/hypervisor";

export function getOrCreateUser(
  addressString: string,
  saveOnCreate: boolean = false
): User {
  let user = User.load(addressString);
  if (user == null) {
    user = new User(addressString);
    user.activeAccount = addressString;

    if (saveOnCreate) {
      user.save();
    }
  }
  return user as User;
}

export function getOrCreateAccount(
  addressString: string,
  saveOnCreate: boolean = false
): Account {
  let account = Account.load(addressString);
  if (account == null) {
    account = new Account(addressString);
    account.type = "non-visor";
    account.parent = addressString; // Default to self, update to visor owner if created from Visor Factory
    account.gammaDeposited = ZERO_BI;
    account.gammaEarnedRealized = ZERO_BI;
    account.hypervisorCount = ZERO_BI;

    if (saveOnCreate) {
      account.save();
    }
  }

  return account as Account;
}

export function getOrCreateProtocolDistribution(
  tokenId: string
): ProtocolDistribution {
  let protocolDist = ProtocolDistribution.load(tokenId);

  if (!protocolDist) {
    protocolDist = new ProtocolDistribution(tokenId);
    protocolDist.distributed = ZERO_BI;
    protocolDist.distributedUSD = ZERO_BD;
  }

  return protocolDist as ProtocolDistribution;
}

export function getOrCreateRewardHypervisor(): RewardHypervisor {
  let xgamma = RewardHypervisor.load(REWARD_HYPERVISOR_ADDRESS);
  if (!xgamma) {
    xgamma = new RewardHypervisor(REWARD_HYPERVISOR_ADDRESS);
    xgamma.totalGamma = ZERO_BI;
    xgamma.totalSupply = ZERO_BI;
    xgamma.save();
  }

  return xgamma as RewardHypervisor;
}

export function getOrCreateRewardHypervisorShare(
  accountAddress: string
): RewardHypervisorShare {
  let id = REWARD_HYPERVISOR_ADDRESS + "-" + accountAddress;

  let xgammaShare = RewardHypervisorShare.load(id);
  if (!xgammaShare) {
    let account = getOrCreateAccount(accountAddress, true);
    if (account.type === "non-visor") {
      getOrCreateUser(account.parent, true);
    }

    xgammaShare = new RewardHypervisorShare(id);
    xgammaShare.rewardHypervisor = REWARD_HYPERVISOR_ADDRESS;
    xgammaShare.account = accountAddress;
    xgammaShare.shares = ZERO_BI;
  }

  return xgammaShare as RewardHypervisorShare;
}

export function getOrCreateRewardHypervisorTx(
  txId: string
): RewardHypervisorTx {
  let tx = RewardHypervisorTx.load(txId);

  if (!tx) {
    tx = new RewardHypervisorTx(txId);
    tx.timestamp = ZERO_BI;
    tx.action = "";
    tx.account = "";
    tx.gammaAmount = ZERO_BI;
    tx.xgammaAmount = ZERO_BI;
    tx.xgammaAmountBefore = ZERO_BI;
    tx.xgammaAmountAfter = ZERO_BI;
    tx.xgammaSupplyBefore = ZERO_BI;
    tx.xgammaSupplyAfter = ZERO_BI;
  }

  return tx as RewardHypervisorTx;
}

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

    masterChefPool = new MasterChefPool(id);
    masterChefPool.masterChef = masterChef.id;
    masterChefPool.hypervisor = hypervisor.id;
    masterChefPool.allocPoint = ZERO_BI;
    masterChefPool.save();
  }

  return masterChefPool;
}

export function getOrCreateMasterChefPoolAccount(
  masterChefAddress: Address,
  hypervisorAddress: Address,
  userAccount: Address
): MasterChefPoolAccount {
  const masterChefPoolId = masterChefAddress.toHex() + "-" + hypervisorAddress.toHex()
  const id = masterChefPoolId + "-" + userAccount.toHex()

  let masterChefPool = getOrCreateMasterChefPool(masterChefAddress, hypervisorAddress)
  let account = getOrCreateAccount(userAccount.toHex(), true)

  let masterChefPoolAccount = MasterChefPoolAccount.load(id)
  if(!masterChefPoolAccount) {
    masterChefPoolAccount = new MasterChefPoolAccount(id)
    masterChefPoolAccount.account = account.id
    masterChefPoolAccount.masterChefPool = masterChefPool.id
    masterChefPoolAccount.amount = ZERO_BI
    masterChefPoolAccount.save()
  }

  return masterChefPoolAccount
}
