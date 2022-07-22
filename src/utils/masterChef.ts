import { Address, BigInt } from "@graphprotocol/graph-ts";
import { MasterChef as MasterChefContract } from "../../generated/MasterChef/MasterChef";

export function getHypervisorFromPoolId(
  masterChefAddress: Address,
  poolId: BigInt
): Address {
    let masterChefContract = MasterChefContract.bind(masterChefAddress)
    const poolInfo = masterChefContract.poolInfo(poolId)
    return poolInfo.value0
}
