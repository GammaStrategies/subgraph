/* eslint-disable prefer-const */
import { BigInt, BigDecimal, TypedMap } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const REWARD_HYPERVISOR_ADDRESS = "0xc9f27a50f82571c1c8423a42970613b8dbda14ef"

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')

export const DEFAULT_DECIMAL = 18

export class constantAddresses {

    static mainnet(): TypedMap<string, string> {
        let lookup = new TypedMap<string, string>()
        lookup.set('USDC', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
        lookup.set('VISR', '0xf938424f7210f31df2aee3011291b658f872e91e');
        lookup.set('WETH-USDC', '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8');
        lookup.set('WETH-VISR', '0x9a9cf34c3892acdb61fb7ff17941d8d81d279c75')

        return lookup as TypedMap<string, string>
    }

    static arbitrum_one(): TypedMap<string, string> {
        let lookup = new TypedMap<string, string>()
        lookup.set('USDC', '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8');
        lookup.set('VISR', '0x995c235521820f2637303ca1970c7c044583df44');
        lookup.set('WETH-USDC', '0x17c14d2c404d167802b16c450d3c99f88f2c4f4d');
        lookup.set('WETH-VISR', '0x4985C5b657d916bA745Afb16ace048c0a03ca2f5')

        return lookup as TypedMap<string, string>
    }

    static network(network: string): TypedMap<string, string> {
        let mapping = new TypedMap<string, string>()
        if (network == "mainnet") {
            mapping = this.mainnet()
        } else if (network == "arbitrum-one") {
            mapping = this.arbitrum_one()
        }

        return mapping as TypedMap<string, string>
    }
}
