import { expect } from "chai";
import { Address, Contract, toNano } from "locklift";

import { SampleAbi } from "../build/factorySource";

describe("Test Sample contract", () => {
  let sample: Contract<SampleAbi>;
  let owner: Address;

  before(async () => {
    await locklift.deployments.fixture();

    owner = locklift.deployments.getAccount("OwnerWallet").account.address;
    sample = locklift.deployments.getContract("Sample");
  });

  describe("functions", () => {
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
            _remainingGasTo: sample.address,
            _payload: null,
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
            _remainingGasTo: sample.address,
            _payload: payload.boc,
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

    it("setMeta()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .setMeta({ _callId: 0, _newMeta: "te6ccgEBAQEAAgAAAA==" })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree).to.call("setMeta").count(1);
    });

    it("setAdmin()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .setAdmin({ _callId: 0, _newAdmin: owner })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree).to.call("setAdmin").count(1);
    });
  });
});
