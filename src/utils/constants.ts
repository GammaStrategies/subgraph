/* eslint-disable prefer-const */
import { Address, BigInt, BigDecimal, TypedMap } from "@graphprotocol/graph-ts";

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
    lookup.set("USDC", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8");
    lookup.set("VISR", "0x995c235521820f2637303ca1970c7c044583df44");
    lookup.set("WETH-USDC", "0x17c14d2c404d167802b16c450d3c99f88f2c4f4d");
    lookup.set("WETH-VISR", "0x4985C5b657d916bA745Afb16ace048c0a03ca2f5");
    lookup.set("WETH-USDC-Index", "0");

    return lookup as TypedMap<string, string>;
  }

  static polygon(): TypedMap<string, string> {
    let lookup = new TypedMap<string, string>();
    lookup.set("USDC", "0x2791bca1f2de4661ed88a30c99a7a9449aa84174");
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
    }

    return mapping as TypedMap<string, string>;
  }
}

export const protocolLookup = new TypedMap<string, string>();
protocolLookup.set(
  "matic:0x5ca313118358e3f5efe0c49f239b66c964f9aef0",
  "algebra"
);
protocolLookup.set(
  "matic:0xaec731f69fa39ad84c7749e913e3bc227427adfd",
  "algebra"
);
protocolLookup.set(
  "arbitrum-one:0x37595fcaf29e4fbac0f7c1863e3df2fe6e2247e9",
  "algebra"
);
protocolLookup.set("bsc:0xd4bcfc023736db5617e5638748e127581d5929bd", "algebra");
protocolLookup.set(
  "polygon-zkevm:0xd08b593eb3460b7aa5ce76ffb0a3c5c938fd89b8",
  "algebra"
);
protocolLookup.set(
  "arbitrum-one:0xa216C2b6554A0293f69A1555dd22f4b7e60Fe907",
  "algebra"
);
protocolLookup.set(
  "avalanche:0x3fe6f25da67dc6ad2a5117a691f9951ea14d6f15",
  "algebra"
);
protocolLookup.set(
  "polygon:0xcac19d43c9558753d7535978a370055614ce832e",
  "uniswap-v3"
);
protocolLookup.set(
  "fantom:0xf874d4957861e193aec9937223062679c14f9aca",
  "algebra"
)
protocolLookup.set(
  "moonbeam:0x6002d7714e8038f2058e8162b0b86c0b19c31908",
  "algebra"
)
protocolLookup.set(
  "moonbeam:0xb7dfc304d9cd88d98a262ce5b6a39bb9d6611063",
  "uniswap-v3"
)