import { expect } from "chai";
import { Address, Contract, toNano, WalletTypes } from "locklift";

import { SampleAbi } from "../build/factorySource";

import WalletCode from "../jetton-contracts/jetton-wallet.compiled.json";
import MinterCode from "../jetton-contracts/jetton-minter.compiled.json";

const WALLET_CODE = Buffer.from(WalletCode.hex, "hex").toString("base64");
const MINTER_CODE = Buffer.from(MinterCode.hex, "hex").toString("base64");

describe("Test Sample contract", () => {
  let sample: Contract<SampleAbi>;
  let owner: Address;

  before(async () => {
    await locklift.deployments.fixture();

    owner = locklift.deployments.getAccount("OwnerWallet").account.address;
    sample = locklift.deployments.getContract("Sample");
  });

  describe("minter", () => {
    it("deploy()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods.deployMinter({ _callId: 555 }).send({ from: owner, amount: toNano(1.2), bounce: true }),
      );

      return expect(traceTree)
        .to.emit("MinterDeployed")
        .count(1)
        .and.to.call("deployMinter")
        .count(1)
        .and.to.call("takeWalletAddress")
        .count(1)
        .withNamedArgs({ value0: "555" })
        .and.to.call("takeInfo")
        .count(1)
        .withNamedArgs({
          value0: "555",
          value1: "9",
          value2: "157",
          value3: "228",
          value4: "Token",
          value5: "TKN",
        });
    });

    it("mint() with gas refund", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .mint({
            _callId: 987,
            _recipient: sample.address,
            _amount: toNano(1000),
            _callbackValue: 0,
            _remainingGasTo: sample.address,
          })
          .send({ from: owner, amount: toNano(0.15), bounce: true }),
      );

      return expect(traceTree)
        .to.call("mint")
        .count(1)
        .and.to.call("excesses")
        .count(1)
        .withNamedArgs({ value0: "987" })
        .and.not.to.call("transferNotification");
    });

    it("mint() with callback", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .mint({
            _callId: 987,
            _recipient: sample.address,
            _amount: toNano(1000),
            _callbackValue: 1,
            _remainingGasTo: sample.address,
          })
          .send({ from: owner, amount: toNano(0.15), bounce: true }),
      );

      return expect(traceTree)
        .to.call("mint")
        .count(1)
        .and.to.call("transferNotification")
        .count(1)
        .withNamedArgs({ value0: "987" })
        .and.not.to.call("excesses");
    });

    it("setMeta()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .setMeta({ _callId: 0, _newMeta: "te6ccgEBAQEAAgAAAA==" })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree).to.call("setMeta").count(1);
    });

    it("setWalletCode()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .setWalletCode({ _callId: 654, _newWalletCode: WALLET_CODE })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree).to.call("setWalletCode").count(1);
    });

    it("upgradeMinter()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .upgradeMinter({ _callId: 432, _newMinterCode: MINTER_CODE })
          .send({ from: owner, amount: toNano(0.5), bounce: true }),
      );

      return expect(traceTree).to.call("upgradeMinter").count(1);
    });

    it("drain()", async () => {
      const minter = await sample.getFields().then(f => f.fields?.minter);

      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .drain({ _minterOrWallet: minter!, _callId: 493, _remainingGasTo: owner })
          .send({ from: owner, amount: toNano(0.1), bounce: true }),
      );

      return expect(traceTree).to.call("drain").count(1);
    });

    it("setAdmin()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .setAdmin({ _callId: 0, _newAdmin: owner })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree).to.call("setAdmin").count(1);
    });

    it("deployWallet()", async () => {
      const signer = await locklift.keystore.getSigner("3");

      const { account } = await locklift.factory.accounts.addNewAccount({
        type: WalletTypes.EverWallet,
        publicKey: signer!.publicKey,
        value: toNano(2),
      });

      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .deployWallet({ _callId: 192, _walletOwner: account.address })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree).to.call("deployWallet").count(1);
    });
  });

  describe("wallet", () => {
    it("transfer() with gas refund", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .transfer({
            _callId: 321,
            _recipient: sample.address,
            _amount: toNano(500),
            _callbackValue: 0,
            _remainingGasTo: sample.address,
          })
          .send({ from: owner, amount: toNano(0.1), bounce: true }),
      );

      return expect(traceTree)
        .to.call("transfer")
        .count(1)
        .and.to.call("excesses")
        .count(1)
        .withNamedArgs({ value0: "321" })
        .and.not.to.call("transferNotification");
    });

    it("transfer() with callback", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .transfer({
            _callId: 321,
            _recipient: sample.address,
            _amount: toNano(500),
            _callbackValue: 1,
            _remainingGasTo: sample.address,
          })
          .send({ from: owner, amount: toNano(0.1), bounce: true }),
      );

      return expect(traceTree)
        .to.call("transfer")
        .count(1)
        .and.to.call("transferNotification")
        .count(1)
        .withNamedArgs({ value0: "321" })
        .and.not.to.call("excesses");
    });

    it("burn() without callback", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .burn({
            _callId: 123,
            _amount: toNano(100),
            _callbackTo: sample.address,
            _payload: null,
            _remainingGasTo: null,
          })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree)
        .to.call("burn")
        .count(1)
        .and.to.call("excesses")
        .count(1)
        .withNamedArgs({ value0: "123" });
    });

    it("burn() with callback", async () => {
      const payload = await locklift.provider.packIntoCell({
        abiVersion: "2.3",
        structure: [{ name: "remainingGasTo", type: "address" }] as const,
        data: { remainingGasTo: owner },
      });

      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .burn({
            _callId: 888,
            _amount: toNano(100),
            _callbackTo: sample.address,
            _payload: payload.boc,
            _remainingGasTo: null,
          })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree)
        .to.call("burn")
        .count(1)
        .withNamedArgs({ _callId: "888" })
        .and.to.call("onAcceptTokensBurn")
        .count(1)
        .withNamedArgs({
          value0: toNano(100),
          value1: sample.address,
          value3: sample.address,
          _payload: payload.boc,
        });
    });

    it("burn() with callback and remaining gas to", async () => {
      const payload = await locklift.provider.packIntoCell({
        abiVersion: "2.3",
        structure: [{ name: "remainingGasTo", type: "address" }] as const,
        data: { remainingGasTo: owner },
      });

      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .burn({
            _callId: 47,
            _amount: toNano(100),
            _callbackTo: sample.address,
            _payload: payload.boc,
            _remainingGasTo: owner,
          })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree)
        .to.call("burn")
        .count(1)
        .withNamedArgs({ _callId: "47" })
        .and.to.call("onAcceptTokensBurn")
        .count(1)
        .withNamedArgs({
          value0: toNano(100),
          value1: sample.address,
          value3: owner,
          _payload: payload.boc,
        });
    });

    it("upgradeWallet()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .upgradeWallet({ _callId: 101, _remainingGasTo: sample.address })
          .send({ from: owner, amount: toNano(0.08), bounce: true }),
      );

      return expect(traceTree)
        .to.call("upgradeWallet")
        .count(1)
        .and.to.call("excesses")
        .count(1)
        .withNamedArgs({ value0: "101" });
    });

    it("drain()", async () => {
      const wallet = await sample.getFields().then(f => f.fields?.wallet);

      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .drain({ _minterOrWallet: wallet!, _callId: 493, _remainingGasTo: owner })
          .send({ from: owner, amount: toNano(0.1), bounce: true }),
      );

      return expect(traceTree).to.call("drain").count(1);
    });
  });
});
