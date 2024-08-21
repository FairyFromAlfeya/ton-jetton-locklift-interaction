import { BigNumber } from "bignumber.js";
import { Address, toNano } from "locklift";

const MINTER = new Address("0:f6b8e26e3723ce02ab73b86cf01bc4e1e6fffe75a10561266ef371dfd81ef255");

const MINTER_MINT_STRUCTURE = [
  { name: "functionId", type: "uint32" },
  { name: "callId", type: "uint64" },
  { name: "amount", type: "gram" },
  { name: "admin", type: "address" },
  { name: "remainingGasTo", type: "address" },
  { name: "callbackValue", type: "gram" },
  { name: "payload", type: "optional(cell)" },
] as const;
const MinterAbi = {
  "ABI version": 2,
  version: "2.1",
  header: [],
  functions: [
    {
      name: "mint",
      id: "0x00000015",
      inputs: [
        { name: "_callId", type: "uint64" },
        { name: "_recipient", type: "address" },
        { name: "_deployWalletValue", type: "varuint16" },
        { name: "_payload", type: "cell" },
      ],
      outputs: [],
    },
  ],
  data: [],
  events: [],
  fields: [],
};
const ABI_STRINGIFIED = JSON.stringify(MinterAbi);

const main = async () => {
  const deployer = new Address(locklift.context.network.config.giver.address);

  const masterMsg = await locklift.provider.packIntoCell({
    abiVersion: "2.1",
    structure: MINTER_MINT_STRUCTURE,
    data: {
      functionId: "0x178d4519",
      callId: 0,
      amount: new BigNumber("1000").shiftedBy(18).toString(),
      admin: deployer,
      remainingGasTo: deployer,
      callbackValue: 0,
      payload: null,
    },
  });

  await locklift.transactions.waitFinalized(
    locklift.provider.sendMessage({
      sender: deployer,
      recipient: MINTER,
      payload: {
        abi: ABI_STRINGIFIED,
        method: "mint",
        params: {
          _callId: 0,
          _deployWalletValue: 0,
          _recipient: deployer,
          _payload: masterMsg.boc,
        },
      },
      bounce: true,
      amount: toNano(0.05),
    }),
  );
};

main().then(() => console.log("Success"));
