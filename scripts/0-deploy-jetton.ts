import { Address, toNano } from "locklift";

import MinterCode from "../jetton-contracts/jetton-minter.compiled.json";
import WalletCode from "../jetton-contracts/jetton-wallet.compiled.json";
import PlatformCode from "../jetton-contracts/jetton-platform.compiled.json";

const MINTER_CONTENT_STRUCTURE = [
  { name: "name", type: "string" },
  { name: "symbol", type: "string" },
  { name: "decimals", type: "uint8" },
  { name: "chainId", type: "uint256" },
  { name: "baseToken", type: "uint256" },
] as const;
const MINTER_STATE_STRUCTURE = [
  { name: "supply", type: "gram" },
  { name: "admin", type: "address" },
  { name: "content", type: "cell" },
  { name: "walletCode", type: "cell" },
  { name: "platformCode", type: "cell" },
  { name: "walletVersion", type: "uint32" },
] as const;

const MINTER_CODE = Buffer.from(MinterCode.hex, "hex").toString("base64");
const WALLET_CODE = Buffer.from(WalletCode.hex, "hex").toString("base64");
const PLATFORM_CODE = Buffer.from(PlatformCode.hex, "hex").toString("base64");

const main = async (): Promise<void> => {
  const deployer = new Address(locklift.context.network.config.giver.address);

  const content = await locklift.provider.packIntoCell({
    abiVersion: "2.1",
    structure: MINTER_CONTENT_STRUCTURE,
    data: {
      name: "TDD",
      symbol: "TDD",
      decimals: 18,
      chainId: 228,
      baseToken: 1337,
    },
  });
  const state = await locklift.provider.packIntoCell({
    abiVersion: "2.1",
    structure: MINTER_STATE_STRUCTURE,
    data: {
      supply: 0,
      admin: deployer,
      content: content.boc,
      walletCode: WALLET_CODE,
      platformCode: PLATFORM_CODE,
      walletVersion: 1,
    },
  });

  const { tvc, hash } = await locklift.provider.mergeTvc({ data: state.boc, code: MINTER_CODE });

  const jetton = new Address(`0:${hash}`);

  await locklift.transactions.waitFinalized(
    locklift.provider.sendMessage({
      sender: deployer,
      recipient: jetton,
      bounce: false,
      amount: toNano("0.1"),
      stateInit: tvc,
    }),
  );
};

main().then(() => console.log("Success"));
