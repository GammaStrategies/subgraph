import { assert, test } from 'matchstick-as'
import { BigInt } from '@graphprotocol/graph-ts'
import { getLiquidity, getAmounts } from '../src/utils/liquidityMaths'


test("Can get liquidity from amounts for base position", () => {

    const sqrtPrice = BigInt.fromString("30960165596143182095620903095503974")
    const sqrtA = BigInt.fromString("27036404087940891143217221307383397")
    const sqrtB = BigInt.fromString("34472851741749586105050512744858456")
    const amount0 = BigInt.fromString("485204165")
    const amount1 = BigInt.fromString("92152918555451417325")

    const liquidity = getLiquidity(
        sqrtPrice,
        sqrtA,
        sqrtB,
        amount0,
        amount1
    )

    assert.bigIntEquals(liquidity, BigInt.fromString("1860741634399970"))
})

test("Can get amounts from liquidity for base position", () => {

    const sqrtPrice = BigInt.fromString("30960165596143182095620903095503974")
    const sqrtA = BigInt.fromString("27036404087940891143217221307383397")
    const sqrtB = BigInt.fromString("34472851741749586105050512744858456")
    const liquidity = BigInt.fromString("1860741634399970")

    const amounts = getAmounts(
        sqrtPrice,
        sqrtA,
        sqrtB,
        liquidity
    )

    assert.bigIntEquals(amounts[0], BigInt.fromString("485204164"))
    assert.bigIntEquals(amounts[1], BigInt.fromString("92152918483418340293"))
})

test("Can get liquidity from amounts for limit position", () => {

    const sqrtPrice = BigInt.fromString("30960165596143182095620903095503974")
    const sqrtA = BigInt.fromString("27036404087940891143217221307383397")
    const sqrtB = BigInt.fromString("30758851541797496416825076750964723")
    const amount0 = BigInt.fromString("0")
    const amount1 = BigInt.fromString("385790397302926618165")

    const liquidity = getLiquidity(
        sqrtPrice,
        sqrtA,
        sqrtB,
        amount0,
        amount1
    )

    assert.bigIntEquals(liquidity, BigInt.fromString("8211120418178589"))
})

test("Can get amounts from liquidity for limit position", () => {

    const sqrtPrice = BigInt.fromString("30960165596143182095620903095503974")
    const sqrtA = BigInt.fromString("27036404087940891143217221307383397")
    const sqrtB = BigInt.fromString("30758851541797496416825076750964723")
    const liquidity = BigInt.fromString("8211120418178590")

    const amounts = getAmounts(
        sqrtPrice,
        sqrtA,
        sqrtB,
        liquidity
    )

    assert.bigIntEquals(amounts[0], BigInt.fromString("0"))
    assert.bigIntEquals(amounts[1], BigInt.fromString("385790397302926618165"))
})