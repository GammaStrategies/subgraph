import { log } from "@graphprotocol/graph-ts";
import {
  Stake,
  Unstake,
} from "../../../generated/templates/RamsesMultiFeeDistribution/RamsesMultiFeeDistribution";
import {
  getOrCreateAccount,
  getOrCreateRamsesReceiver,
  getOrCreateRamsesReceiverAccount,
} from "../../utils/entities";

export function handleStake(event: Stake): void {
  log.warning("staking: {}", [event.transaction.hash.toHex()])
  const receiver = getOrCreateRamsesReceiver(event.address);
  receiver.totalStaked = receiver.totalStaked.plus(event.params.amount);
  receiver.save();

  getOrCreateAccount(event.params.user.toHex(), true);
  const receiverAccount = getOrCreateRamsesReceiverAccount(
    event.address,
    event.params.user
  );
  receiverAccount.stakedAmount = receiverAccount.stakedAmount.plus(
    event.params.amount
  );
  receiverAccount.save();
}

export function handleUnstake(event: Unstake): void {
    const receiver = getOrCreateRamsesReceiver(event.address);
    receiver.totalStaked = receiver.totalStaked.minus(event.params.receivedAmount);
    receiver.save();

    getOrCreateAccount(event.params.user.toHex(), true);
    const receiverAccount = getOrCreateRamsesReceiverAccount(
        event.address,
        event.params.user
    );
    receiverAccount.stakedAmount = receiverAccount.stakedAmount.minus(
        event.params.receivedAmount
    );
    receiverAccount.save();
}
