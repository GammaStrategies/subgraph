import {
  Address,
  BigInt,
  dataSource,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import {
  User,
  Account,
  Protocol,
  ProtocolDistribution,
  RewardHypervisorTx,
  RewardHypervisor,
  RewardHypervisorShare,
  UniswapV3Pool,
  UniswapV3FeeUpdate,
  _PoolQueue,
} from "../../generated/schema";
import {
  ADDRESS_ZERO,
  PROTOCOL_UNISWAP_V3,
  REWARD_HYPERVISOR_ADDRESS,
  VERSION,
  ZERO_BD,
  ZERO_BI,
} from "../config/constants";
import { getOrCreateToken } from "./tokens";
import { protocolLookup } from "../config/lookups";

export function getOrCreateProtocol(): Protocol {
  let protocol = Protocol.load("0");
  if (!protocol) {
    log.info("Initializing protocol for {} on {}", [
      dataSource.address().toHex(),
      dataSource.network(),
    ]);
    protocol = new Protocol("0");
    const network = dataSource.network();

    let name = "uniswap";
    let underlyingProtocol = PROTOCOL_UNISWAP_V3;
    const protocolInfo = protocolLookup.get(
      network.concat(":").concat(dataSource.address().toHex())
    );
    if (protocolInfo) {
      name = protocolInfo.name;
      underlyingProtocol = protocolInfo.underlyingProtocol;
    }

    let networkName = network;
    if (network == "arbitrum-one") {
      networkName = "arbitrum";
    } else if (network == "polygon-zkevm") {
      networkName = "pzke";
    } else if (network == "linea-mainnet") {
      networkName = "linea";
    } else if (name == "fusionx") {
      networkName = "mantle";
    } else if (network == "kava-evm") {
      networkName = "kava";
    } else if (network == "opbnb-mainnet") {
      networkName = "opbnb"
    } else if (network == "manta-pacific-mainnet") {
      networkName = "manta"
    } else if (network == "opbnb-mainnet") {
      networkName = "opbnb"
    }

    protocol.name = name;
    protocol.slug = "gamma"
      .concat("-")
      .concat(name)
      .concat("-")
      .concat(underlyingProtocol)
      .concat("-")
      .concat(networkName)
      .concat("-")
      .concat(VERSION);
    protocol.underlyingProtocol = underlyingProtocol;
    protocol.network = networkName;
    protocol.version = VERSION;
    protocol.save();
  }
  return protocol;
}

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

    getOrCreateUser(addressString, true);

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
    tx.block = ZERO_BI;
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

export function createPool(
  poolAddress: Address,
  token0Address: Address,
  token1Address: Address,
  fee: i32,
  sqrtPriceX96: BigInt,
  tick: i32
): UniswapV3Pool {
  const token0 = getOrCreateToken(token0Address);
  const token1 = getOrCreateToken(token1Address);

  token0.save();
  token1.save();

  const pool = new UniswapV3Pool(poolAddress.toHex());
  pool.hypervisors = [];
  pool.token0 = token0.id;
  pool.token1 = token1.id;
  pool.fee = fee;
  pool.sqrtPriceX96 = sqrtPriceX96;
  pool.tick = tick;
  pool.lastSwapTime = ZERO_BI;
  pool.lastHypervisorRefreshTime = ZERO_BI;

  return pool;
}

export function getOrCreateFeeUpdate(
  hypervisorAddress: Address,
  block: ethereum.Block
): UniswapV3FeeUpdate {
  const id = hypervisorAddress
    .toHex()
    .concat("-")
    .concat(block.number.toString());
  let feeUpdate = UniswapV3FeeUpdate.load(id);
  if (!feeUpdate) {
    feeUpdate = new UniswapV3FeeUpdate(id);
    feeUpdate.hypervisor = hypervisorAddress.toHex();
    feeUpdate.block = block.number;
    feeUpdate.timestamp = block.timestamp;
    feeUpdate.save();
  }
  return feeUpdate;
}

export function getOrCreatePoolQueue(): _PoolQueue {
  let queue = _PoolQueue.load("0");
  if (!queue) {
    queue = new _PoolQueue("0");
    queue.addresses = [];
    queue.startBlocks = [];
    queue.save();
  }
  return queue;
}
