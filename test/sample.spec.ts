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

    it("mint()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .mint({ _callId: 987, _recipient: sample.address, _amount: toNano(1000), _remainingGasTo: sample.address })
          .send({ from: owner, amount: toNano(0.15), bounce: true }),
      );

      return expect(traceTree)
        .to.call("mint")
        .count(1)
        .and.to.call("transferNotification")
        .count(1)
        .withNamedArgs({ value0: "987" })
        .and.to.call("excesses")
        .count(1)
        .withNamedArgs({ value0: "987" });
    });

    it("transfer()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .transfer({ _callId: 321, _recipient: sample.address, _amount: toNano(500), _remainingGasTo: sample.address })
          .send({ from: owner, amount: toNano(0.1), bounce: true }),
      );

      return expect(traceTree)
        .to.call("transfer")
        .count(1)
        .and.to.call("transferNotification")
        .count(1)
        .withNamedArgs({ value0: "321" })
        .and.to.call("excesses")
        .count(1)
        .withNamedArgs({ value0: "321" });
    });

    it("burn()", async () => {
      const { traceTree } = await locklift.tracing.trace(
        sample.methods
          .burn({ _callId: 123, _amount: toNano(100), _remainingGasTo: sample.address })
          .send({ from: owner, amount: toNano(0.05), bounce: true }),
      );

      return expect(traceTree)
        .to.call("burn")
        .count(1)
        .and.to.call("excesses")
        .count(1)
        .withNamedArgs({ value0: "123" });
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
