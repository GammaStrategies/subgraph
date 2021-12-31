/* eslint-disable prefer-const */
import { TypedMap } from "@graphprotocol/graph-ts"
import { ADDRESS_ZERO } from "./constants"
 

class BasePool {
    pool: string;
    usdTokenIdx: i32;
    priority: i32;
}

export class BaseTokenDefinition {

    static mainnet(): TypedMap<string, BasePool> {
        const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
        const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f"
        const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7"
        const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

        const WBTC_USDC = "0x99ac8ca7087fa4a2a1fb6357269965a2014abc35"
        const USDC_WETH = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
        const DAI_USDC = "0x6c6bc977e13df9b0de53b251522280bb72383700"
        const USDC_USDT = "0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf"

        let lookup = new TypedMap<string, BasePool>()
        lookup.set(USDC, { pool: ADDRESS_ZERO, usdTokenIdx: -1, priority: 4 });
        lookup.set(USDT, { pool: USDC_USDT, usdTokenIdx: 0, priority: 3 });
        lookup.set(DAI, { pool: DAI_USDC, usdTokenIdx: 1, priority: 2 });
        lookup.set(WETH, { pool: USDC_WETH, usdTokenIdx: 0, priority: 1 });
        lookup.set(WBTC, { pool: WBTC_USDC, usdTokenIdx: 1, priority: 0 });

        return lookup as TypedMap<string, BasePool>
    }

    static arbitrumOne(): TypedMap<string, BasePool> {
        const WBTC = "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f"
        const WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
        // const DAI = ""
        const USDT = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"
        const USDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"

        const WBTC_USDC = "0xa62ad78825e3a55a77823f00fe0050f567c1e4ee"
        const USDC_WETH = "0x17c14d2c404d167802b16c450d3c99f88f2c4f4d"
        // const DAI_USDC = ""
        const USDC_USDT = "0x13398e27a21be1218b6900cbedf677571df42a48"

        let lookup = new TypedMap<string, BasePool>()
        lookup.set(USDC, { pool: ADDRESS_ZERO, usdTokenIdx: -1, priority: 4 });
        lookup.set(USDT, { pool: USDC_USDT, usdTokenIdx: 1, priority: 3 });
        lookup.set(WETH, { pool: USDC_WETH, usdTokenIdx: 1, priority: 1 });
        lookup.set(WBTC, { pool: WBTC_USDC, usdTokenIdx: 1, priority: 0 });

        return lookup as TypedMap<string, BasePool>
    }

    static nonBase(): BasePool {
        let lookup: BasePool = {
            pool: ADDRESS_ZERO,
            usdTokenIdx: -1,
            priority: -1
        }
        return lookup as BasePool
    }

    static network(network: string): TypedMap<string, BasePool> {
        let mapping = new TypedMap<string, BasePool>()
        if (network == "mainnet") {
            mapping = this.mainnet()
        } else if (network == "arbitrum-one") {
            mapping = this.arbitrumOne()
        }

        return mapping as TypedMap<string, BasePool>
    }
}
