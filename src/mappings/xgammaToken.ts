/* eslint-disable prefer-const */
import { Address } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO, TZ_UTC, TZ_EST } from "../utils/constants";
import { Transfer as TransferEvent } from "../../generated/GammaToken/ERC20";
import { decreaseRewardHypervisorShares } from "../utils/rewardHypervisor";
import { updateRewardHypervisorDayData } from "../utils/intervalUpdates";
import {
  getOrCreateAccount,
  getOrCreateRewardHypervisor,
  getOrCreateRewardHypervisorShare,
  getOrCreateRewardHypervisorTx,
} from "../utils/entities";

export function handleTransfer(event: TransferEvent): void {
  let xgamma = getOrCreateRewardHypervisor();
  let xgammaTx = getOrCreateRewardHypervisorTx(event.transaction.hash.toHex());
  let shares = event.params.value;

  let ADDR_ZERO = Address.fromString(ADDRESS_ZERO);
  let fromAddress = event.params.from.toHex();
  let toAddress = event.params.to.toHex();
  let mintEvent = event.params.from == ADDR_ZERO;
  let burnEvent = event.params.to == ADDR_ZERO;

  //  Track state of shares before transfer
  let toShare = getOrCreateRewardHypervisorShare(toAddress);
  let toSharesBefore = toShare.shares;

  let fromShare = getOrCreateRewardHypervisorShare(fromAddress);
  let fromSharesBefore = fromShare.shares;

  xgammaTx.block = event.block.number;
  xgammaTx.timestamp = event.block.timestamp;
  xgammaTx.xgammaAmount = shares;
  xgammaTx.xgammaSupplyBefore = xgamma.totalSupply;

  if (mintEvent) {
    // Mint shares
    xgammaTx.action = "stake";
    xgammaTx.account = toAddress;
    xgammaTx.xgammaAmountBefore = toSharesBefore;
    xgamma.totalSupply = xgamma.totalSupply.plus(shares);
    xgammaTx.xgammaSupplyAfter = xgamma.totalSupply;
  } else {
    // Decrease shares of from account
    decreaseRewardHypervisorShares(fromAddress, shares);
    xgammaTx.xgammaAmountAfter = fromSharesBefore.minus(shares);
  }

  if (burnEvent) {
    // Burn shares
    xgammaTx.action = "unstake";
    xgammaTx.account = fromAddress;
    xgammaTx.xgammaAmountBefore = fromSharesBefore;
    xgamma.totalSupply = xgamma.totalSupply.minus(shares);
    xgammaTx.xgammaSupplyAfter = xgamma.totalSupply;
  } else {
    // Increase shares of to account
    toShare.shares = toShare.shares.plus(shares);
    xgammaTx.xgammaAmountAfter = toSharesBefore.plus(shares);
    toShare.save();
  }

  xgamma.save();

  if (mintEvent || burnEvent) {
    xgammaTx.save(); // no need to save if not mint or burn
    updateRewardHypervisorDayData(event.block.timestamp, TZ_UTC);
    updateRewardHypervisorDayData(event.block.timestamp, TZ_EST);
  } else {
    // If neither mint nor burn, then this is a purely transfer event
    // xgamma transfers have no gamma transfer event, so we need to deal with gammaDeposited logic here.
    let underlyingGamma = xgamma.totalGamma
      .times(xgammaTx.xgammaAmount)
      .div(xgammaTx.xgammaSupplyBefore);
    // Decrease gammaDeposited by the appropriate amount
    let fromAccount = getOrCreateAccount(fromAddress);
    fromAccount.gammaDeposited =
      fromAccount.gammaDeposited.minus(underlyingGamma);
    // Also increase gammaDepoisted by the appropriate amount
    let toAccount = getOrCreateAccount(toAddress);
    toAccount.gammaDeposited = toAccount.gammaDeposited.plus(underlyingGamma);

    fromAccount.save();
    toAccount.save();
  }
}
