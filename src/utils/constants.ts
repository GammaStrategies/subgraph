/* eslint-disable prefer-const */
import { BigInt, BigDecimal, TypedMap } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const REWARD_HYPERVISOR_ADDRESS = "0x26805021988f1a45dc708b5fb75fc75f21747d8c"
export const SWAPPER_ADDRESS = "0x0b7d3ae92b6f4a440bacc4b9826ad2b4c35a12c8"

export const GAMMA_START_BLOCK = BigInt.fromI32(13864627)

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')

export let TZ_UTC = ZERO_BI
export let TZ_EST = BigInt.fromI32(-5)

export const DEFAULT_DECIMAL = 18

export class constantAddresses {

    static mainnet(): TypedMap<string, string> {
        let lookup = new TypedMap<string, string>()
        lookup.set('USDC', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
        lookup.set('VISR', '0xf938424f7210f31df2aee3011291b658f872e91e');
        lookup.set('GAMMA', '0x6bea7cfef803d1e3d5f7c0103f7ded065644e197');
        lookup.set('WETH-USDC', '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640');
        lookup.set('WETH-VISR', '0x9a9cf34c3892acdb61fb7ff17941d8d81d279c75');
        lookup.set('GAMMA-WETH', '0x4006bed7bf103d70a1c6b7f1cef4ad059193dc25');
        lookup.set('WETH-USDC-Index', '0');

        return lookup as TypedMap<string, string>
    }

    static arbitrum_one(): TypedMap<string, string> {
        let lookup = new TypedMap<string, string>()
        lookup.set('USDC', '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8');
        lookup.set('VISR', '0x995c235521820f2637303ca1970c7c044583df44');
        lookup.set('WETH-USDC', '0x17c14d2c404d167802b16c450d3c99f88f2c4f4d');
        lookup.set('WETH-VISR', '0x4985C5b657d916bA745Afb16ace048c0a03ca2f5');
        lookup.set('WETH-USDC-Index', '0');

        return lookup as TypedMap<string, string>
    }

    static polygon(): TypedMap<string, string> {
        let lookup = new TypedMap<string, string>()
        lookup.set('USDC', '0x2791bca1f2de4661ed88a30c99a7a9449aa84174');
        lookup.set('WETH-USDC', '0x45dda9cb7c25131df268515131f647d726f50608');
        lookup.set('WETH-USDC-Index', '0');

        return lookup as TypedMap<string, string>
    }

    static optimism(): TypedMap<string, string> {
        let lookup = new TypedMap<string, string>()
        lookup.set('USDC', '0x7f5c764cbc14f9669b88837ca1490cca17c31607');
        lookup.set('WETH-USDC', '0x85149247691df622eaf1a8bd0cafd40bc45154a9');
        lookup.set('WETH-USDC-Index', '1');

        return lookup as TypedMap<string, string>
    }

    static network(network: string): TypedMap<string, string> {
        let mapping = new TypedMap<string, string>()
        if (network == "mainnet") {
            mapping = this.mainnet()
        } else if (network == "matic") {
            mapping = this.polygon()
        } else if (network == "arbitrum-one") {
            mapping = this.arbitrum_one()
        } else if (network == "optimism") {
            mapping = this.optimism()
        }

        return mapping as TypedMap<string, string>
    }
}
