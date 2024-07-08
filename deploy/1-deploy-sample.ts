import { getRandomNonce, toNano } from "locklift";

import MinterCode from "../jetton-contracts/jetton-minter.compiled.json";
import WalletCode from "../jetton-contracts/jetton-wallet.compiled.json";

export default async (): Promise<void> => {
  const owner = locklift.deployments.getAccount("OwnerWallet");
  const minterCode = Buffer.from(MinterCode.hex, "hex").toString("base64");
  const walletCode = Buffer.from(WalletCode.hex, "hex").toString("base64");

  await locklift.deployments.deploy({
    deployConfig: {
      contract: "Sample",
      publicKey: owner.signer.publicKey,
      initParams: { _nonce: getRandomNonce() },
      constructorParams: {
        _initialOwner: owner.account.address,
        _initialMinterCode: minterCode,
        _initialWalletCode: walletCode,
      },
      value: toNano("1.3"),
    },
    deploymentName: "Sample",
    enableLogs: true,
  });
};

export const dependencies = ["owner-wallet"];
export const tag = "sample";
