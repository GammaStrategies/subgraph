import { UniswapV3HypervisorFactory } from "../../../generated/schema";
import { ZERO_BD, ZERO_BI } from "../../config/constants";

export function getOrCreateFactory(
  addressString: string
): UniswapV3HypervisorFactory {
  let factory = UniswapV3HypervisorFactory.load(addressString);
  if (factory == null) {
    factory = new UniswapV3HypervisorFactory(addressString);
    factory.hypervisorCount = ZERO_BI;
    factory.grossFeesClaimedUSD = ZERO_BD;
    factory.protocolFeesCollectedUSD = ZERO_BD;
    factory.feesReinvestedUSD = ZERO_BD;
    factory.tvlUSD = ZERO_BD;
  }

  return factory as UniswapV3HypervisorFactory;
}
