import { BigInt } from "@graphprotocol/graph-ts";

export class CollectedFees {
  grossFees: BigInt;
  protocolFees: BigInt;
  netFees: BigInt;
}

export function splitFees(grossFees: BigInt, feeRate: i32): CollectedFees {
  const protocolFees = grossFees.div(BigInt.fromI32(feeRate));
  const netFees = grossFees.minus(protocolFees);

  return {
    grossFees: grossFees,
    protocolFees: protocolFees,
    netFees: netFees,
  };
}
