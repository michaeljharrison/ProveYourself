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
        'Create a new Proof of Identity request using a persons identification details. This will create a unique code that, along with some ID documents and a photo, can be used to prove a persons identity. The Proof of Identity request will be anchored on the blockchain to ensure no tampering can occur.',
      PROOF_SETTINGS:
        'These settings will determine how your Blockchain proof is configured.',
      IDENTITY_SETTINGS:
        'Input information for the person whos identity you wish to prove.',
    },
    UPLOADING: {
      DESCRIPTION:
        'Upload a photo of yourself holding a piece of paper with the information below printed. Ensure your face is visible and the lighting is clear. Dont worry, if the photo quality is not sufficient, you are allowed multiple tries.',
    },
    VERIFYING: {
      DESCRIPTION:
        'Below you can view the status of your Identity Verification, whether it is pending, verified or failed.',
    },
  },
}
