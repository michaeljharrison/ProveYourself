# ProveYourself

## About

The Demo uses three main components:

1. **The ProvenDB SDK**: Creation and anchoring of Merkel trees.
2. **Azure Computer Vision**: Image OCR.
3. **MongoDB**: Request and information persistence.

Each POI request follows the flow below, and is always in one of the following states:

1. **CREATING**: User has provided some basic info (name, email etc...) but the request has not yet been anchored on the Blockchain.
2. **CREATED**: Request has been anchored on the Blockchain, awaiting user upload of identity photo.
3. **UPLOADING**: User has uploaded a verified identity document, but it has not yet been anchored on the Blockchain.
4. **VERIFIED**: Verified identity has been anchored on the Blockchain.

**FAILED**: The failed state will only occur if the image verification has failed, this is equivalent to the **CREATED** stage in terms of user interaction, but with additional UI elements asking for a retry.

There are two background tasks that will check for _stale_ proofs. These are proofs that are stuck in the **CREATING** or **UPLOADING** states for longer than 30 seconds, meaning that no response from the SDK has been found.

## Environment

### Env Variables

The following env variables are used in the demo.

```
export AZURE_CV_KEY_ONE="**************"
export AZURE_CV_KEY_TWO="**************"
export AZURE_CV_REGION="australiaeast"
export AZURE_CV_ENDPOINT="https://provendb-computer-vision.cognitiveservices.azure.com/"
export PROVENDB_SDK_KEY="**************"
export PROVENDB_COMP_VAULT_KEY="**************"
export PROVE_YOURSELF_DB="localhost:27017"
export PROVE_YOURSELF_DATABASE="proveYourself"
export PROVE_YOURSELF_LOOP_INTERVAL=30000
```

### Node Versions

- Node v14.0.0
- Yarn v1.22.5
- NPM v6.14.4

## Build Locally

```bash
# clone repository
git clone https://github.com/michaeljharrison/ProveYourself

# install dependencies
yarn install

# serve with hot reload at localhost:8000
yarn dev

# build for production and launch server
yarn build
yarn start

# generate static project
$ yarn generate
```

## TO DOS

- TODO Watermark the image with lowerbound (steganography?)
- TODO Expire requests based on expiry field.
- TODO Add a new stage for facial recognition, simply confirm a face is in the image.
- TODO Compare photo with provided identity document info (number, DOB etc...)
- TODO Find API for verifying identity documents (License, Passport etc...)
