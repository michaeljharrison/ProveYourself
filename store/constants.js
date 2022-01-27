export default {
  STATE: {
    CREATING: 'CREATING',
    UPLOADING: 'UPLOADING',
    VERIFYING: 'VERIFYING',
  },
  BLOCKCHAINS: {
    HEDERA: 'Hedera',
    ETHEREUM: 'Ethereum',
    BITCOIN: 'BTC',
  },
  DOCUMENTS: {
    DRIVERS_LICENSE: 'Drivers Licence',
    PASSPORT: 'Passport',
  },
  COPY: {
    HOME: {
      WHY_ONE:
        'You have probably used some form of Proof of Identity solution before, but these solutions use standard database systems that are highly vulnerable to bad actors or manipulation. Tampering, theft or deletion of identity documents could pose significant risk to organizations and individuals.',
      WHY_TWO:
        'Using Distributed Ledger Technologies (AKA: Blockchains), we are able to create a tamper-proof system of recording and storing Proof of Identity requests with their associated supporting documents. Stakeholders, customers and regulators can be certain that no foul play has taken place.',
      HOW_ONE:
        'We leverage ProvenDB, a service for easily and cheaply storing information on the Blockchain. This allows us to create snapshots of the Proof of Identity Process and anchor their digital signature.',
      HOW_TWO:
        'At each stage of the process, a digital signature is created and anchored on the public Blockchain, by comparing the state of the data with this signature, we can instantly detect any tampering.',
    },
    CREATING: {
      DESCRIPTION:
        'Create a new hole for the nfTee charity auction, after adding some information about the hole, you will upload a unique photo to create the NFT.',
      HOLE_INFO:
        'Important information about which series your hole exists in.',
      HOLE_DETAILS: 'Information about the hole itself.',
    },
    UPLOADING: {
      DESCRIPTION: 'Upload a photo of the hole, as high res as possible.',
    },
    VERIFYING: {
      DESCRIPTION:
        'Below you can view the status of your Identity Verification, whether it is pending, verified or failed.',
    },
  },
}
