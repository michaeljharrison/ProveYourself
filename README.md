# NFTee

## About

The Demo uses three main components:

1. **MongoDB**: Request and information persistence.

Each Hole NFT request follows the flow below, and is always in one of the following states:

1. **CREATING**: User has provided some basic info (name, email etc...) but the request has not yet asked for a photo.
2. **CREATED**: Request has been created but no image for the NFT has been uploaded.
3. **UPLOADING**: User has uploaded a verified identity document, but it has not yet been anchored on the Blockchain.
4. **COMPLETE**: The hole upload is completed.

**FAILED**: The failed state will only occur if the image upload has failed, this is equivalent to the **CREATED** stage in terms of user interaction, but with additional UI elements asking for a retry.

## Environment

### Env Variables

The following env variables are used in the demo.

```
export NFTEE_DB="mongodb://localhost:27017"
export NFTEE_DATABASE="nfTees"
```

### Node Versions

- Node v14.0.0
- Yarn v1.22.5
- NPM v6.14.4

## Build Locally

```bash
# clone repository
git clone https://github.com/michaeljharrison/NFTee

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
