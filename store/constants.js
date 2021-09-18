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
