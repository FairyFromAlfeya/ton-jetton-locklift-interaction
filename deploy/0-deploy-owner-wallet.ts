import { WalletTypes, toNano } from "locklift";

export default async (): Promise<void> => {
  await locklift.deployments.deployAccounts(
    [
      {
        deploymentName: "OwnerWallet",
        signerId: "0",
        accountSettings: {
          type: WalletTypes.EverWallet,
          value: toNano(3),
        },
      },
    ],
    true,
  );
};

export const tag = "owner-wallet";
