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
      bounce: false,
      amount: toNano("0.1"),
      stateInit: tvc,
    }),
  );
};

main().then(() => console.log("Success"));
