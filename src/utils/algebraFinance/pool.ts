import { Address, Bytes } from "@graphprotocol/graph-ts";
import { UniswapV3Pool } from "../../../generated/schema";
import { AlgebraV1Pool as V1PoolContract } from "../../../generated/templates/Pool/AlgebraV1Pool";
import { AlgebraV2Pool as V2PoolContract } from "../../../generated/templates/Pool/AlgebraV2Pool";
import { encodeKey } from "../common/positions";
import { createPool } from "../entities";

export function createAlgebraV1Pool(
  poolAddress: Address
): UniswapV3Pool | null {
  const poolContract = V1PoolContract.bind(poolAddress);

  const liquidityCooldown = poolContract.try_liquidityCooldown();

  if (liquidityCooldown.reverted) {
    return null;
  }

  const globalState = poolContract.globalState(); // Equivalent to slot0

  const pool = createPool(
    poolAddress,
    poolContract.token0(),
    poolContract.token1(),
    0,
    globalState.getPrice()
  );

  return pool as UniswapV3Pool;
}

export function createAlgebraV2Pool(
  poolAddress: Address
): UniswapV3Pool | null {
  const poolContract = V2PoolContract.bind(poolAddress);

  const communityFeeLastTimestamp =
    poolContract.try_communityFeeLastTimestamp();

  if (communityFeeLastTimestamp.reverted) {
    return null;
  }
  const globalState = poolContract.globalState(); // Equivalent to slot0

  const pool = createPool(
    poolAddress,
    poolContract.token0(),
    poolContract.token1(),
    0,
    globalState.getPrice()
  );

  return pool as UniswapV3Pool;
}

export function algebraPositionKey(
  ownerAddress: Address,
  tickLower: i32,
  tickUpper: i32
): Bytes {
  const encodedHex = encodeKey(ownerAddress, tickLower, tickUpper).toHex();

  const encodedPacked =
    "0x000000000000" +
    encodedHex.substr(26, 40) +
    encodedHex.substr(124, 6) +
    encodedHex.substr(188, 6);

  const key = Bytes.fromHexString(encodedPacked);

  return key as Bytes;
}
