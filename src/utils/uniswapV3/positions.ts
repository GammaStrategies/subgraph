/* eslint-disable prefer-const */
import { Address, ByteArray, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts'

export function positionKey(ownerAddress: Address, tickLower: i32, tickUpper: i32): Bytes {
    
    let tupleArray: Array<ethereum.Value> = [
      ethereum.Value.fromAddress(ownerAddress),
      ethereum.Value.fromI32(tickLower),
      ethereum.Value.fromI32(tickUpper)
    ]
    let tuple = changetype<ethereum.Tuple>(tupleArray)
    
    let encoded = ethereum.encode(ethereum.Value.fromTuple(tuple)) as Bytes

    let encodedHex = encoded.toHex()
    let encodedPacked = '0x' + encodedHex.substr(26, 40) + encodedHex.substr(124, 6) + encodedHex.substr(188, 6)

    let keyArray = crypto.keccak256(ByteArray.fromHexString(encodedPacked))
    let key = Bytes.fromByteArray(keyArray)

    return key as Bytes

}