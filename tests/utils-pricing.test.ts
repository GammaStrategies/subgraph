import { Address  } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as";
import {
    getExchangeRate,
    getEthRateInUSDC,
    getGammaRateInUSDC,
    getVisrRateInUSDC,
    getBaseTokenRateInUSDC
} from "../src/utils/pricing"
import { setupPools, setupConversions } from './utils/setup'


test("Can get exchange rate", () => {
    setupPools()

    const gammaWethRate = getExchangeRate(Address.fromString("0x4006bed7bf103d70a1c6b7f1cef4ad059193dc25"), 0)
    const usdcWethRate = getExchangeRate(Address.fromString("0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"), 0)

    assert.stringEquals(gammaWethRate.toString(), "5794.686966502260139399705799372766")
    assert.stringEquals(usdcWethRate.toString(), "0.000000003149583767227155667479642997180427")
})

test("Can get base token rate in USDC", () => {
    setupPools()
    setupConversions()

    const usdcBase = getBaseTokenRateInUSDC("0x4f7997158d66ca31d9734674fdcd12cc74e503a7")
    const usdtBase = getBaseTokenRateInUSDC("0x9a98bffabc0abf291d6811c034e239e916bbcec0")
    const daiBase = getBaseTokenRateInUSDC("0x4f7997158d66ca31d9734674fdcd12cc74e503a7")
    const wethBase = getBaseTokenRateInUSDC("0x0407c810546f1dc007f01a80e65983072d5c6dfa")

    assert.stringEquals(usdcBase.toString(), "0.000001")
    assert.stringEquals(usdtBase.toString(), "0.000001000229597749599463267442257314416")
    assert.stringEquals(daiBase.toString(), "0.000001")
    assert.stringEquals(wethBase.toString(), "0.000000000000003149583767227155667479642997180427")
})

test("Can get ETH price", () => {
    setupPools()

    const rate = getEthRateInUSDC()
    assert.stringEquals(rate.toString(), "0.000000000000003149583767227155667479642997180427")
})

test("Can get GAMMA price", () => {
    setupPools()

    const rate = getGammaRateInUSDC()
    assert.stringEquals(rate.toString(), "0.0000000000000000005435295789805675631336596569093865")
})

test("Can get VISR price", () => {
    setupPools()

    const rate = getVisrRateInUSDC()
    assert.stringEquals(rate.toString(), "0.00000000000000000001666696904057576032834364226580713")
})
