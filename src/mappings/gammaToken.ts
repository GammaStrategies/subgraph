/* eslint-disable prefer-const */
import { dataSource, Address } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../../generated/GammaToken/ERC20";
import {
  updateDistributionDayData,
  updateRewardHypervisorDayData,
} from "../utils/intervalUpdates";
import {
  ADDRESS_ZERO,
  REWARD_HYPERVISOR_ADDRESS,
  GAMMA_SOURCE_ADDRESSES,
  constantAddresses,
  TZ_UTC,
  TZ_EST,
} from "../config/constants";
import { unstakeGammaFromAccount } from "../utils/gammaToken";
import {
  getOrCreateAccount,
  getOrCreateUser,
  getOrCreateProtocolDistribution,
  getOrCreateRewardHypervisor,
  getOrCreateRewardHypervisorTx,
} from "../utils/entities";
import { getOrCreateToken } from "../utils/tokens";
import { getGammaRateInUSDC } from "../utils/pricing";

let REWARD_HYPERVISOR = Address.fromString(REWARD_HYPERVISOR_ADDRESS);

export function handleTransfer(event: TransferEvent): void {
  let addressLookup = constantAddresses.network(dataSource.network());
  let gammaAddress = addressLookup.get("GAMMA") as string;
  let gammaAmount = event.params.value;

  let gamma = getOrCreateToken(Address.fromString(gammaAddress));
  if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
    // Mint event
    gamma.totalSupply = gamma.totalSupply.plus(gammaAmount);
    gamma.save();
  }

  let xgamma = getOrCreateRewardHypervisor();

  let xgammaTx = getOrCreateRewardHypervisorTx(event.transaction.hash.toHex());
  xgammaTx.gammaAmount = gammaAmount;

  if (event.params.to == REWARD_HYPERVISOR) {
    xgamma.totalGamma = xgamma.totalGamma.plus(gammaAmount);
    // Deposit into reward hypervisor
    if (GAMMA_SOURCE_ADDRESSES.includes(event.params.from)) {
      // Distribution event if from swapper
      let protocolDist = getOrCreateProtocolDistribution(gammaAddress);
      let tokenRate = getGammaRateInUSDC();

      let distributed = gammaAmount;
      let distributedUSD = gammaAmount.toBigDecimal().times(tokenRate);

      protocolDist.distributed = protocolDist.distributed.plus(distributed);
      protocolDist.distributedUSD =
        protocolDist.distributedUSD.plus(distributedUSD);
      protocolDist.save();

      // Update daily distributed data
      // UTC
      updateDistributionDayData(
        gammaAddress,
        distributed,
        distributedUSD,
        event.block.timestamp,
        TZ_UTC
      );
      // EST
      updateDistributionDayData(
        gammaAddress,
        distributed,
        distributedUSD,
        event.block.timestamp,
        TZ_EST
      );
    } else {
      // If not from swapper, this is a deposit by user
      xgammaTx.save(); // Preserve Tx
      let accountFrom = getOrCreateAccount(event.params.from.toHexString());
      if (accountFrom.type === "non-visor") {
        getOrCreateUser(accountFrom.parent, true);
      }
      accountFrom.gammaDeposited = accountFrom.gammaDeposited.plus(gammaAmount);
      accountFrom.save();
    }
  } else if (event.params.from == REWARD_HYPERVISOR) {
    // User withdraw from reward hypervisor
    // update account
    xgammaTx.save(); // Save gammaAmount value before unstake
    unstakeGammaFromAccount(
      event.params.to.toHexString(),
      event.transaction.hash.toHex()
    );
    xgamma.totalGamma = xgamma.totalGamma.minus(gammaAmount);
  }

  xgamma.save();

  if (
    event.params.to === REWARD_HYPERVISOR ||
    event.params.from === REWARD_HYPERVISOR
  ) {
    updateRewardHypervisorDayData(event.block.timestamp, TZ_UTC);
    updateRewardHypervisorDayData(event.block.timestamp, TZ_EST);
  }
}
