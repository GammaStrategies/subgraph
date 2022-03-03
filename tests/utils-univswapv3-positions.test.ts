import { Address } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as'


import { positionKey } from '../src/utils/uniswapV3/positions'

test("Can derive position key", () => {
    const key = positionKey(
        Address.fromString("0x33412fEf1aF035d6Dba8B2F9b33B022e4c31DBb4"),
        -99300,
        -79140
    )
    assert.stringEquals(
        key.toHex(),
        "0x7332f71b37374604d9416366d417dc57ba3ce843797f81157862547a2b16e579"
    )
})

test("Can derive WBTC position key", () => {
    const key = positionKey(
        Address.fromString("0x97491b65c9c8E8754B5C55ed208fF490b2Ee6190"),
        253740,
        259500
    )
    assert.stringEquals(
        key.toHex(),
        "0x9d731c2ea715e850c0efdb70aa7b9095f435a2c892dd5a7e123959a6f7978abb"
    )
})
