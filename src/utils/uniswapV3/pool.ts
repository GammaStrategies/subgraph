import { Address, ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";
import { UniswapV3Pool as PoolContract } from "../../../generated/templates/Pool/UniswapV3Pool";
import { UniswapV3Pool } from "../../../generated/schema";
import { createPool } from "../entities";
import { encodeKey } from "../common/positions";


export function createUniV3Pool(poolAddress: Address): UniswapV3Pool | null {
  const poolContract = PoolContract.bind(poolAddress);
  const slot0 = poolContract.try_slot0();

  if (slot0.reverted) {
    return null
  }

  const pool = createPool(
    poolAddress,
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    slot0.value.getSqrtPriceX96()
  );

  return pool as UniswapV3Pool;
}

export function uniswapPositionKey(
  ownerAddress: Address,
  tickLower: i32,
  tickUpper: i32
): Bytes {
  const encodedHex = encodeKey(ownerAddress, tickLower, tickUpper).toHex();

  const encodedPacked =
    "0x" +
    encodedHex.substr(26, 40) +
    encodedHex.substr(124, 6) +
    encodedHex.substr(188, 6);

  const keyArray = crypto.keccak256(ByteArray.fromHexString(encodedPacked));
  const key = Bytes.fromByteArray(keyArray);

  return key as Bytes;
}