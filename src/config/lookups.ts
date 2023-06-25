import { TypedMap } from "@graphprotocol/graph-ts";
import {
  PROTOCOL_ALGEBRA_V1,
  PROTOCOL_ALGEBRA_V2,
  PROTOCOL_UNISWAP_V3,
} from "./constants";

class protocolInfo {
    name: string;
    underlyingProtocol: string;
  }
  
  export const protocolLookup = new TypedMap<string, protocolInfo>();
  protocolLookup.set("matic:0x5ca313118358e3f5efe0c49f239b66c964f9aef0", {
    name: "quickswap",
    underlyingProtocol: PROTOCOL_ALGEBRA_V1,
  });
  protocolLookup.set("matic:0xaec731f69fa39ad84c7749e913e3bc227427adfd", {
    name: "quickswap",
    underlyingProtocol: PROTOCOL_ALGEBRA_V1,
  });
  protocolLookup.set("arbitrum-one:0x66cd859053c458688044d816117d5bdf42a56813", {
    name: "uniswap",
    underlyingProtocol: PROTOCOL_UNISWAP_V3,
  });
  protocolLookup.set("arbitrum-one:0x37595fcaf29e4fbac0f7c1863e3df2fe6e2247e9", {
    name: "zyberswap",
    underlyingProtocol: PROTOCOL_ALGEBRA_V1,
  });
  protocolLookup.set("bsc:0xd4bcfc023736db5617e5638748e127581d5929bd", {
    name: "thena",
    underlyingProtocol: PROTOCOL_ALGEBRA_V1,
  });
  protocolLookup.set("polygon-zkevm:0xd08b593eb3460b7aa5ce76ffb0a3c5c938fd89b8", {
    name: "quickswap",
    underlyingProtocol: PROTOCOL_ALGEBRA_V1,
  });
  protocolLookup.set("arbitrum-one:0xa216c2b6554a0293f69a1555dd22f4b7e60fe907", {
    name: "camelot",
    underlyingProtocol: PROTOCOL_ALGEBRA_V2,
  });
  protocolLookup.set("avalanche:0x3fe6f25da67dc6ad2a5117a691f9951ea14d6f15", {
    name: "glacier",
    underlyingProtocol: PROTOCOL_ALGEBRA_V1,
  });
  protocolLookup.set("polygon:0xcac19d43c9558753d7535978a370055614ce832e", {
    name: "retro",
    underlyingProtocol: PROTOCOL_UNISWAP_V3,
  });
  protocolLookup.set("fantom:0xf874d4957861e193aec9937223062679c14f9aca", {
    name: "spiritswap",
    underlyingProtocol: PROTOCOL_ALGEBRA_V2,
  });
  protocolLookup.set("moonbeam:0x6002d7714e8038f2058e8162b0b86c0b19c31908", {
    name: "stellaswap",
    underlyingProtocol: PROTOCOL_ALGEBRA_V1,
  });
  protocolLookup.set("moonbeam:0xb7dfc304d9cd88d98a262ce5b6a39bb9d6611063", {
    name: "beamswap",
    underlyingProtocol: PROTOCOL_UNISWAP_V3,
  });
  protocolLookup.set("matic:0x97686103b3e7238ca6c2c439146b30adbd84a593", {
    name: "sushi",
    underlyingProtocol: PROTOCOL_UNISWAP_V3,
  });
  protocolLookup.set("arbitrum-one:0x0f867f14b39a5892a39841a03ba573426de4b1d0", {
    name: "sushi",
    underlyingProtocol: PROTOCOL_UNISWAP_V3,
  });
  
  