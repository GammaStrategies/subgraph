import { BigInt } from "@graphprotocol/graph-ts";
import { getOrCreateProtocol } from "./entities";
import { ONE_BI, ZERO_BI } from "../config/constants";

export class CollectedFees {
  grossFees: BigInt;
  protocolFees: BigInt;
  netFees: BigInt;
}

export function splitFees(grossFees: BigInt, feeParam: i32): CollectedFees {
  const protocol = getOrCreateProtocol();

  let feeRate: BigInt;
  if (feeParam == 0) {
    feeRate = ZERO_BI;
  } else if (protocol.name == "ramses" || protocol.name == "camelot") {
    feeRate = BigInt.fromI32(feeParam).div(BigInt.fromI32(100));
  } else {
    feeRate = ONE_BI.div(BigInt.fromI32(feeParam));
  }

  const protocolFees = grossFees.times(feeRate);
  const netFees = grossFees.minus(protocolFees);

  return {
    grossFees: grossFees,
    protocolFees: protocolFees,
    netFees: netFees,
  };
}
