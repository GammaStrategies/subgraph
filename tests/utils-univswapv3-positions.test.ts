import { assert, test } from 'matchstick-as'


import { positionKey } from '../src/utils/uniswapV3/positions'

test("Can derive position key", () => {
    const key = positionKey(
        "0x33412fEf1aF035d6Dba8B2F9b33B022e4c31DBb4",
        -99300,
        -79140
    )
    assert.stringEquals(
        key.toHex(),
        "0x7332f71b37374604d9416366d417dc57ba3ce843797f81157862547a2b16e579"
    )
})
