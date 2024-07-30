import { Address, toNano } from "locklift";

import MinterCode from "../jetton-contracts/jetton-minter.compiled.json";

const INIT_DATA =
  "te6ccsECFQEAA5MAAAAAJgAzADgASABNAFIAVwCbAQ0BEgGSAdICDAKIAtkC3gLpA00DhgOMAkMIAUFMDRDbYP9owIUGXUNsv+xG7/HxJUz6G83vawwtpvB3EgEBFP8A9KQT9LzyyAsCAgFiBAMAG6D2BdqJofQB9IH0gahhAgLMDwUCAVgJBgIBIAgHAIMgCDXIe1E0PoA+kD6QNQwBNMfghAXjUUZUiC6ghB73ZfeE7oSsfLixdM/MfoAMBOgUCPIUAT6AljPFgHPFszJ7VSAA3ztRND6APpA+kDUMAfTP/oA+kD0BDBRYqFSWscF8uLBKML/8uLCBoIJMS0AoBe88uLDghB73ZfeyMsfyz9QBfoCIc8WUAPPFvQAyXGAGMjLBSTPFnD6AstqzMmAQPsAQBPIUAT6AljPFgHPFszJ7VSACASANCgL3O1E0PoA+kD6QNQwCNM/+gBRUaAF+kD6QFNbxwVUc21wVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQDccFHLHy4sMK+gBRqKGCCJiWgGa2CKGCCJiWgKAYoSeXEEkQODdfBOMNJdcLAYAwLAHzDACPCALCOIYIQ1TJ223CAEMjLBVAIzxZQBPoCFstqEssfEss/yXL7AJM1bCHiA8hQBPoCWM8WAc8WzMntVABwUnmgGKGCEHNi0JzIyx9SMMs/WPoCUAfPFlAHzxbJcYAQyMsFJM8WUAb6AhXLahTMyXH7ABAkECMB8QD0z/6APpAIfAB7UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcPoCF8trE8yAOAJ6CEBeNRRnIyx8Zyz9QB/oCIs8WUAbPFiX6AlADzxbJUAXMI5FykXHiUAioE6CCCcnDgKAUvPLixQTJgED7ABAjyFAE+gJYzxYBzxbMye1UAgHUERAAET6RDBwuvLhTYADDCDHAJJfBOAB0NMDAXGwlRNfA/AP4PpA+kAx+gAxcdch+gAx+gAwc6m0AALTH4IQD4p+pVIgupUxNFnwDOCCEBeNRRlSILqWMUREA/AN4DWCEFlfB7y6k1nwDuBfBIQP8vCACagkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAnQAAAAAAAAAAAAAAAAAAAAAAAADkFBMACFVTRFQACmpVU0RU95a2wA==";

const MINTER_CODE = Buffer.from(MinterCode.hex, "hex").toString("base64");

const main = async (): Promise<void> => {
  const { tvc } = await locklift.provider.mergeTvc({ data: INIT_DATA, code: MINTER_CODE });

  const hash = await locklift.provider.getBocHash(tvc);
  const jetton = new Address(`0:${hash}`);

  await locklift.transactions.waitFinalized(
    locklift.provider.sendMessage({
      sender: new Address(locklift.context.network.config.giver.address),
      recipient: jetton,
      payload: {
        abi: '{"ABI version":2,"version":"2.3","header":[],"functions":[{"name":"setAdmin","id":"0x00000003","inputs":[{"name":"_callId","type":"uint64"},{"name":"_newAdmin","type":"address"}],"outputs":[]}],"data":[],"events":[],"fields":[]}',
        method: "setAdmin",
        params: {
          _callId: 0,
          _newAdmin: new Address("0:d569d1d515238095c38aed37e9e96c11be4b3c6b4c5ea217dd15708b3f0e3812"),
        },
      },
      bounce: false,
      amount: toNano("0.005"),
    }),
  );
};

main().then(() => console.log("Success"));
