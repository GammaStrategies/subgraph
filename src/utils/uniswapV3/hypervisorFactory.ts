import { UniswapV3HypervisorFactory } from "../../../generated/schema";
import { ONE_BI } from "../../utils/constants";

export function getOrCreateFactory(
  addressString: string
): UniswapV3HypervisorFactory {
  let factory = UniswapV3HypervisorFactory.load(addressString);
  if (factory == null) {
    factory = new UniswapV3HypervisorFactory(addressString);
  }
  factory.hypervisorCount += ONE_BI;

  return factory as UniswapV3HypervisorFactory;
}
