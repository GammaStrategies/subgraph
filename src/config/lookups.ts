import { TypedMap } from "@graphprotocol/graph-ts";
import {
  PROTOCOL_ALGEBRA_V1,
  PROTOCOL_ALGEBRA_V2,
  PROTOCOL_UNISWAP_V3,
  PROTOCOL_ALGEBRA_INTEGRAL
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
protocolLookup.set("opbnb-mainnet:0xf14fb95d6e7e1ab5fcdfff7ab203a84b9361e6fc", {
  name: "thena",
  underlyingProtocol: PROTOCOL_ALGEBRA_V1,
});
protocolLookup.set("polygon-zkevm:0xd08b593eb3460b7aa5ce76ffb0a3c5c938fd89b8", {
  name: "quickswap",
  underlyingProtocol: PROTOCOL_ALGEBRA_V1,
});
protocolLookup.set("polygon-zkevm:0xf9adaa55014242c1005db307c4e41c541f26baaa", {
  name: "quickswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("arbitrum-one:0xa216c2b6554a0293f69a1555dd22f4b7e60fe907", {
  name: "camelot",
  underlyingProtocol: PROTOCOL_ALGEBRA_V1,
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
protocolLookup.set("base:0x6d5c54f535b073b9c2206baf721af2856e5cd683", {
  name: "sushi",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("arbitrum-one:0x34ffbd9db6b9bd8b095a0d156de69a2ad2944666", {
  name: "ramses",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("matic:0x7b9c2f68f16c3618bb45616fb98d83f94fd7062e", {
  name: "ascent",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("mainnet:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "fusionx",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("linea:0xc27ddd78fc49875fe6f844b72bbf31dfbb099881", {
  name: "lynex",
  underlyingProtocol: PROTOCOL_ALGEBRA_V1,
});
protocolLookup.set("base:0x1e86a593e55215957c4755f1be19a229af3286f6", {
  name: "synthswap",
  underlyingProtocol: PROTOCOL_ALGEBRA_V1,
});
protocolLookup.set("syscoin:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "pegasys",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("base:0xb24dc81f8be7284c76c7cf865b803807b3c2ef55", {
  name: "basex",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("moonbeam:0x688cb9492bd2c72016f1765d813b2d713aa1f4c7", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("kava-evm:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "pancakeswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("arbitrum-one:0x166cd995f9301590e381c488ffd4f18c3ca38a27", {
  name: "pancakeswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("manta-pacific-mainnet:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "aperture",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("metis:0xfc13ebe7feb9595d70195e9168aa7f3ace153621", {
  name: "hercules",
  underlyingProtocol: PROTOCOL_ALGEBRA_V1,
});
protocolLookup.set("manta-pacific-mainnet:0x8a9570ec97534277ade6e46d100939fbce4968f0", {
  name: "quickswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("base:0x8118c33513fec13f8cf488ccb4509190650f0e92", {
  name: "baseswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("base:0x39ce2eb762e7bfe19b6ad4d5ba384c67ce4051f0", {
  name: "swapbased",
  underlyingProtocol: PROTOCOL_ALGEBRA_V1,
});
protocolLookup.set("avalanche:0x71ea9545ed7f8662a8b461d7cb0899745e3fb3e6", {
  name: "pharaoh",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("gnosis:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "swapr",
  underlyingProtocol: PROTOCOL_ALGEBRA_V1,
});
protocolLookup.set("base:0xf1df4f17e34ba710dffc487f73f1e19476e815a6", {
  name: "thick",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("mantle:0xa5e9006c17740cb9e4898657721c4dfe103d8456", {
  name: "pharaoh",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("astar-zkevm-mainnet:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "quickswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("imtbl-zkevm:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "quickswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("avalanche:0xbf145c5239b1327909f3e37ca0cf890d014105e2", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("blast-mainnet:0x659e5a593d6b88db44c67acce7febaab2aa4b8de", {
  name: "blaster",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("base:0x829432679f69dbd8b2575f006ec0129894a39d86", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("blast-mainnet:0xfc13ebe7feb9595d70195e9168aa7f3ace153621", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("scroll:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("blast-mainnet:0xf44cecb1cf40ee12303e85eb8651263c01812ead", {
  name: "thruster",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("linea:0xa8e2fd481342976a3259591fbc08999369a43c5a", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("mantle:0x849214c123ba690d5fbc9301ef2e66491fcd6fe6", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("polygon-zkevm:0xff8fae227edb4ab23e61ec6cf0a65f3bcdcf45bd", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("linea:0x9c3e0445559e6de1fe6391e8e018dca02b480836", {
  name: "nile",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("xlayer-mainnet:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "quickswap",
  underlyingProtocol: PROTOCOL_ALGEBRA_V1,
});
protocolLookup.set("xlayer-mainnet:0xc27ddd78fc49875fe6f844b72bbf31dfbb099881", {
  name: "xtrade",
  underlyingProtocol: PROTOCOL_ALGEBRA_INTEGRAL,
});
protocolLookup.set("blast-mainnet:0x6c509511672f3cdc0440c219169e4367425870a8", {
  name: "fenix",
  underlyingProtocol: PROTOCOL_ALGEBRA_INTEGRAL,
});
protocolLookup.set("mode-mainnet:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "kim",
  underlyingProtocol: PROTOCOL_ALGEBRA_INTEGRAL,
});
protocolLookup.set("linea:0xff0d3abfd3003d4d5ad7d57c912cca02eba6036b", {
  name: "linehub",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("manta-pacific-mainnet:0x670003267ddff9c2c740ec9a1645569cccdc6bf7", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("base:0xe1cd1c2d2e4b44de211d554649bc7dc49ef07784", {
  name: "kinetix",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("rootstock:0x683292172e2175bd08e3927a5e72fc301b161300", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("rootstock:0xc27ddd78fc49875fe6f844b72bbf31dfbb099881", {
  name: "sushi",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("taiko:0xc27ddd78fc49875fe6f844b72bbf31dfbb099881", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("sei-mainnet:0x1e86a593e55215957c4755f1be19a229af3286f6", {
  name: "uniswap",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
protocolLookup.set("iota:0xf44cecb1cf40ee12303e85eb8651263c01812ead", {
  name: "wagmi",
  underlyingProtocol: PROTOCOL_UNISWAP_V3,
});
