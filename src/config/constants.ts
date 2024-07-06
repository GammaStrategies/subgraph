/* eslint-disable prefer-const */
import { Address, BigInt, BigDecimal, TypedMap } from "@graphprotocol/graph-ts";

export const VERSION = "1.5.0";

export const PROTOCOL_ALGEBRA_V1 = "algebraV1";
export const PROTOCOL_ALGEBRA_V2 = "algebraV2";
export const PROTOCOL_ALGEBRA_INTEGRAL = "algebraIntegral";
export const PROTOCOL_UNISWAP_V3 = "uniswapV3";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const REWARD_HYPERVISOR_ADDRESS =
  "0x26805021988f1a45dc708b5fb75fc75f21747d8c";
export const GAMMA_SOURCE_ADDRESSES = [
  Address.fromString("0x0b7d3ae92b6f4a440bacc4b9826ad2b4c35a12c8"), // Swapper
  Address.fromString("0xdee9e378e483ab862d93364069ae381377bb2899"), // Swapper
  Address.fromString("0x190a9a5e7db62df3ead2ceb2e47bd78e70b96834"), // Holdings
  Address.fromString("0xFEB430ED4c21b748681f7a0B41cb071c603A40E9"), // Holdings
];

export const GAMMA_START_BLOCK = BigInt.fromI32(13864627);

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");

export let TZ_UTC = ZERO_BI;
export let TZ_EST = BigInt.fromI32(-5);

export const DEFAULT_DECIMAL = 18;

export class constantAddresses {
  static mainnet(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
    lookup.set("VISR", "0xf938424f7210f31df2aee3011291b658f872e91e");
    lookup.set("GAMMA", "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197");
    lookup.set("WETH-USDC", "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640");
    lookup.set("WETH-VISR", "0x9a9cf34c3892acdb61fb7ff17941d8d81d279c75");
    lookup.set("GAMMA-WETH", "0x4006bed7bf103d70a1c6b7f1cef4ad059193dc25");
    lookup.set("WETH-USDC-Index", "0");

    return lookup as TypedMap<string, string>;
  }

  static arbitrum_one(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDCe", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8");
    lookup.set("USDC", "0xaf88d065e77c8cc2239327c5edb3a432268e5831");
    lookup.set("VISR", "0x995c235521820f2637303ca1970c7c044583df44");
    lookup.set("WETH-USDC", "0x17c14d2c404d167802b16c450d3c99f88f2c4f4d");
    lookup.set("WETH-VISR", "0x4985C5b657d916bA745Afb16ace048c0a03ca2f5");
    lookup.set("WETH-USDC-Index", "0");

    return lookup as TypedMap<string, string>;
  }

  static polygon(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDCe", "0x2791bca1f2de4661ed88a30c99a7a9449aa84174");
    lookup.set("USDC", "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359");
    lookup.set("WETH-USDC", "0x45dda9cb7c25131df268515131f647d726f50608");
    lookup.set("WETH-USDC-Index", "0");

    return lookup as TypedMap<string, string>;
  }

  static optimism(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x7f5c764cbc14f9669b88837ca1490cca17c31607");
    lookup.set("WETH-USDC", "0x85149247691df622eaf1a8bd0cafd40bc45154a9");
    lookup.set("WETH-USDC-Index", "1");

    return lookup as TypedMap<string, string>;
  }

  static celo(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x37f750b7cc259a2f741af45294f6a16572cf5cad");
    lookup.set("WETH-USDC", "0xd88d5f9e6c10e6febc9296a454f6c2589b1e8fae");
    lookup.set("WETH-USDC-Index", "0");

    return lookup as TypedMap<string, string>;
  }

  static bsc(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d");

    return lookup as TypedMap<string, string>;
  }

  static polygonZkEvm(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035");

    return lookup as TypedMap<string, string>;
  }

  static avalanche(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e");

    return lookup as TypedMap<string, string>;
  }

  static fantom(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x04068da6c83afcfa0e13ba15a6696662335d5b75");

    return lookup as TypedMap<string, string>;
  }

  static moonbeam(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x931715fee2d06333043d11f658c8ce934ac61d0c");

    return lookup as TypedMap<string, string>;
  }

  static mantle(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9");
    lookup.set("USDT_MANTLE", "0x201eba5cc46d216ce6dc03f6a759e8e766e956ae");

    return lookup as TypedMap<string, string>;
  }

  static linea(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x176211869ca2b568f2a7d4ee941e073a821ee1ff");

    return lookup as TypedMap<string, string>;
  }

  static base(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca");

    return lookup as TypedMap<string, string>;
  }

  static rollux(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x368433cac2a0b8d76e64681a9835502a1f2a8a30");

    return lookup as TypedMap<string, string>;
  }

  static kava(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xeb466342c4d449bc9f53a865d5cb90586f405215");

    return lookup as TypedMap<string, string>;
  }

  static metis(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xea32a96608495e54156ae48931a7c20f0dcc1a21");

    return lookup as TypedMap<string, string>;
  }

  static manta(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xb73603c5d87fa094b7314c74ace2e64d165016fb");

    return lookup as TypedMap<string, string>;
  }

  static opbnb(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x0000000000000000000000000000000000000000");
    lookup.set("USDT_OPBNB", "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3");

    return lookup as TypedMap<string, string>;
  }

  static gnosis(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83");

    return lookup as TypedMap<string, string>;
  }

  static astarZkEvm(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035");

    return lookup as TypedMap<string, string>;
  }

  static immutableZkEvm(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2");

    return lookup as TypedMap<string, string>;
  }

  static blast(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDB", "0x4300000000000000000000000000000000000003");

    return lookup as TypedMap<string, string>;
  }
  static scroll(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4");

    return lookup as TypedMap<string, string>;
  }

  static xlayer(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x74b7f16337b8972027f6196a17a631ac6de26d22");
    lookup.set("USDT_XLAYER", "0x1e4a5963abfd975d8c9021ce480b42188849d41d");

    return lookup as TypedMap<string, string>;
  }

  static mode(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0xd988097fb8612cc24eec14542bc03424c656005f");

    return lookup as TypedMap<string, string>;
  }

  static rootstock(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x0000000000000000000000000000000000000000");
    lookup.set("RUSDT", "0xef213441a85df4d7acbdae0cf78004e1e486bb96");

    return lookup as TypedMap<string, string>;
  }

  static taiko(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x07d83526730c7438048d55a4fc0b850e2aab6f0b");

    return lookup as TypedMap<string, string>;
  }

  static sei(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1");

    return lookup as TypedMap<string, string>;
  }

  static network(network: string): TypedMap<string, string> {
    let mapping = new TypedMap<string, string>();
    if (network == "mainnet") {
      mapping = this.mainnet();
    } else if (network == "matic") {
      mapping = this.polygon();
    } else if (network == "arbitrum-one") {
      mapping = this.arbitrum_one();
    } else if (network == "optimism") {
      mapping = this.optimism();
    } else if (network == "celo") {
      mapping = this.celo();
    } else if (network == "bsc") {
      mapping = this.bsc();
    } else if (network == "polygon-zkevm") {
      mapping = this.polygonZkEvm();
    } else if (network == "avalanche") {
      mapping = this.avalanche();
    } else if (network == "fantom") {
      mapping = this.fantom();
    } else if (network == "moonbeam") {
      mapping = this.moonbeam();
    } else if (network == "mantle") {
      mapping = this.mantle();
    } else if (network == "linea") {
      mapping = this.linea();
    } else if (network == "base") {
      mapping = this.base();
    } else if (network == "syscoin") {
      mapping = this.rollux();
    } else if (network == "kava-evm") {
      mapping = this.kava();
    } else if (network == "metis") {
      mapping = this.metis();
    } else if (network == "manta-pacific-mainnet") {
      mapping = this.manta();
    } else if (network == "opbnb-mainnet") {
      mapping = this.opbnb();
    } else if (network == "gnosis") {
      mapping = this.gnosis();
    } else if (network == "astar-zkevm-mainnet") {
      mapping = this.astarZkEvm();
    } else if (network == "imtbl-zkevm") {
      mapping = this.immutableZkEvm();
    } else if (network == "blast-mainnet") {
      mapping = this.blast();
    } else if (network == "scroll") {
      mapping = this.scroll();
    } else if (network == "xlayer-mainnet") {
      mapping = this.xlayer();
    } else if (network == "mode-mainnet") {
      mapping = this.xlayer();
    } else if (network == "rootstock") {
      mapping = this.rootstock();
    } else if (network == "taiko") {
      mapping = this.taiko();
    } else if (network == "sei-mainnet") {
      mapping = this.sei();
    }

    return mapping as TypedMap<string, string>;
  }
}
