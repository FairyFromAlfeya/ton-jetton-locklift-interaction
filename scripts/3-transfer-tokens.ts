import { Address, toNano } from "locklift";

const WALLET = new Address("0:8c8c45499c73e5b0c9cc81f3718f2ef3b930638672ec99b908e87a5924981538");
const RECIPIENT = new Address("0:2746d46337aa25d790c97f1aefb01a5de48cc1315b41a4f32753146a1e1aeb7d");

const WalletAbi = {
  "ABI version": 2,
  version: "2.1",
  header: [],
  functions: [
    {
      name: "transfer",
      id: "0xf8a7ea5",
      inputs: [
        { name: "_callId", type: "uint64" },
        { name: "_amount", type: "varuint16" },
        { name: "_recipient", type: "address" },
        { name: "_remainingGasTo", type: "address" },
        { name: "_customPayload", type: "optional(cell)" },
        { name: "_callbackValue", type: "varuint16" },
        { name: "_payload", type: "optional(cell)" },
      ],
      outputs: [],
    },
  ],
  data: [],
  events: [],
  fields: [],
};
const ABI_STRINGIFIED = JSON.stringify(WalletAbi);

const main = async () => {
  const deployer = new Address(locklift.context.network.config.giver.address);

  await locklift.transactions.waitFinalized(
    locklift.provider.sendMessage({
      sender: deployer,
      recipient: WALLET,
      payload: {
        abi: ABI_STRINGIFIED,
        method: "transfer",
        params: {
          _callId: 123,
          _amount: "1000",
          _recipient: RECIPIENT.toString(),
          _remainingGasTo: deployer.toString(),
          _customPayload: null,
          _callbackValue: 0,
          _payload: null
        },
      },
      bounce: true,
      amount: toNano(0.05),
    }),
  );
};

main().then(() => console.log("Success"));
