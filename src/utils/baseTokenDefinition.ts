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
        const OHM = "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5"
        const OCEAN = "0x967da4048cd07ab37855c090aaf366e4ce1b9f48"

        const WBTC_USDC = "0x99ac8ca7087fa4a2a1fb6357269965a2014abc35"
        const USDC_WETH = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
        const DAI_USDC = "0x6c6bc977e13df9b0de53b251522280bb72383700"
        const USDC_USDT = "0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf"
        // const OHM_USDC = "0x893f503fac2ee1e5b78665db23f9c94017aae97d"
        const OHM_ETH = "0x584ec2562b937c4ac0452184d8d83346382b5d3a"
        const OCEAN_ETH = "0x283e2e83b7f3e297c4b7c02114ab0196b001a109"

        let lookup = new TypedMap<string, BasePool>()
        lookup.set(USDC, { pool: ADDRESS_ZERO, usdTokenIdx: -1, priority: 6 });
        lookup.set(USDT, { pool: USDC_USDT, usdTokenIdx: 0, priority: 5 });
        lookup.set(DAI, { pool: DAI_USDC, usdTokenIdx: 1, priority: 4 });
        lookup.set(WETH, { pool: USDC_WETH, usdTokenIdx: 0, priority: 3 });
        lookup.set(WBTC, { pool: WBTC_USDC, usdTokenIdx: 1, priority: 2 });
        lookup.set(OHM, { pool: OHM_ETH, usdTokenIdx: 3, priority: 1 });
        lookup.set(OCEAN, { pool: OCEAN_ETH, usdTokenIdx: 3, priority: 0 } )

        return lookup as TypedMap<string, BasePool>
    }

    static polygon(): TypedMap<string, BasePool> {
        const WBTC = "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
        const WETH = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
        const DAI = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
        const USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
        const USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
        const WMATIC = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"

        const WBTC_USDC = "0x847b64f9d3a95e977d157866447a5c0a5dfa0ee5"
        const USDC_WETH = "0x45dda9cb7c25131df268515131f647d726f50608"
        const DAI_USDC = "0x5f69c2ec01c22843f8273838d570243fd1963014"
        const USDC_USDT = "0x3f5228d0e7d75467366be7de2c31d0d098ba2c23"
        const WMATIC_USDC = "0xa374094527e1673a86de625aa59517c5de346d32"

        let lookup = new TypedMap<string, BasePool>()
        lookup.set(USDC, { pool: ADDRESS_ZERO, usdTokenIdx: -1, priority: 5 });
        lookup.set(USDT, { pool: USDC_USDT, usdTokenIdx: 0, priority: 4 });
        lookup.set(DAI, { pool: DAI_USDC, usdTokenIdx: 0, priority: 3 });
        lookup.set(WMATIC, { pool: WMATIC_USDC, usdTokenIdx: 1, priority: 2 });
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

    static optimism(): TypedMap<string, BasePool> {
        const WBTC = "0x68f180fcce6836688e9084f035309e29bf0a2095"
        const WETH = "0x4200000000000000000000000000000000000006"
        const DAI = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
        const USDT = "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58"
        const USDC = "0x7f5c764cbc14f9669b88837ca1490cca17c31607"

        const WETH_WBTC = "0x73b14a78a0d396c521f954532d43fd5ffe385216"
        const WETH_USDC = "0x85149247691df622eaf1a8bd0cafd40bc45154a9"
        const USDC_DAI = "0x100bdc1431a9b09c61c0efc5776814285f8fb248"
        const USDC_USDT = "0xf3f3433c3a97f70349c138ada81da4d3554982db"

        let lookup = new TypedMap<string, BasePool>()
        lookup.set(USDC, { pool: ADDRESS_ZERO, usdTokenIdx: -1, priority: 4 });
        lookup.set(USDT, { pool: USDC_USDT, usdTokenIdx: 0, priority: 3 });
        lookup.set(DAI, { pool: USDC_DAI, usdTokenIdx: 0, priority: 2 });
        lookup.set(WETH, { pool: WETH_USDC, usdTokenIdx: 0, priority: 1 });
        lookup.set(WBTC, { pool: WETH_WBTC, usdTokenIdx: 2, priority: 0 });

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
        } else if (network == "matic") {
            mapping = this.polygon()
        } else if (network == "arbitrum-one") {
            mapping = this.arbitrumOne()
        } else if (network == "optimism") {
            mapping = this.optimism()
        }

        return mapping as TypedMap<string, BasePool>
    }
}
