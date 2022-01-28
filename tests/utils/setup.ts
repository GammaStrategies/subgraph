import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import { addPool, addHypervisorConversion } from "./uniswapV3"

export function setupPools(): void {
    // GAMMA-WETH Pool
    addPool(
        "0x4006bed7bf103d70a1c6b7f1cef4ad059193dc25",
        BigInt.fromString('1040793553795871629262401828'),
        "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    )
    // WETH-VISR Pool
    addPool(
        "0x9a9cf34c3892acdb61fb7ff17941d8d81d279c75",
        BigInt.fromString('34441166406125985018363452269906'),
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0xf938424f7210f31df2aee3011291b658f872e91e"
    )
    // USDC-WETH Pool
    addPool(
        "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
        BigInt.fromString('1411734415064032495003370764693507'),
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    )
    // DAI-USDC Pool
    addPool(
        "0x6c6bc977e13df9b0de53b251522280bb72383700",
        BigInt.fromString('79239272900531181491819'),
        "0x6b175474e89094c44da98b954eedeac495271d0f",
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    )
    // USDC-USDT Pool
    addPool(
        "0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf",
        BigInt.fromString('79219068776251629486544867951'),
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0xdac17f958d2ee523a2206206994597c13d831ec7"
    )
}

export function setupConversions(): void {
    // Weth base
    addHypervisorConversion(
        "0x0407c810546f1dc007f01a80e65983072d5c6dfa",
        1,
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",  // WETH
        "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
        0,
        BigDecimal.fromString("0.05458279619412223658969672755528837"),
        BigDecimal.fromString("0.000000000000003125332397301568113104051824946008")
    )
    // USDC base
    addHypervisorConversion(
        "0x4f7997158d66ca31d9734674fdcd12cc74e503a7",
        0,
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",  // USDC
        "0x0000000000000000000000000000000000000000",
        -1,
        BigDecimal.fromString("1.000229597749599463267442257314416"),
        BigDecimal.fromString("0.000001")
    )
    // DAI base
    addHypervisorConversion(
        "0x6c8116abe5c5f2c39553c6f4217840e71462539c",
        0,
        "0x6b175474e89094c44da98b954eedeac495271d0f",  // DAI
        "0x6c6bc977e13df9b0de53b251522280bb72383700",
        1,
        BigDecimal.fromString("3185.818622176822243335393509118678"),
        BigDecimal.fromString("0.000000000000000001000280485245005521373003371250111")
    )

    // USDT base
    addHypervisorConversion(
        "0x9a98bffabc0abf291d6811c034e239e916bbcec0",
        1,
        "0xdac17f958d2ee523a2206206994597c13d831ec7",  // USDT
        "0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf",
        0,
        BigDecimal.fromString("0.000000003180171011163701254257241523531204"),
        BigDecimal.fromString("0.000001000229597749599463267442257314416")
    )
}