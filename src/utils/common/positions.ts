import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { algebraPositionKey } from "../algebraFinance/pool";
import { getOrCreateProtocol } from "../entities";
import { uniswapPositionKey } from "../uniswapV3/pool";

export function positionKey(
  ownerAddress: Address,
  tickLower: i32,
  tickUpper: i32
): Bytes {
  const protocol = getOrCreateProtocol();

  let key = Bytes.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
  if (protocol.name == "algebra") {
    key = algebraPositionKey(ownerAddress, tickLower, tickUpper);
  } else {
    key = uniswapPositionKey(ownerAddress, tickLower, tickUpper);
  }

  return key;
}

export function encodeKey(
  ownerAddress: Address,
  tickLower: i32,
  tickUpper: i32
): Bytes {
  const tupleArray: Array<ethereum.Value> = [
    ethereum.Value.fromAddress(ownerAddress),
    ethereum.Value.fromI32(tickLower),
    ethereum.Value.fromI32(tickUpper),
  ];
  const tuple = changetype<ethereum.Tuple>(tupleArray);

  const encoded = ethereum.encode(ethereum.Value.fromTuple(tuple)) as Bytes;

  return encoded;
}
