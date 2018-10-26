
## Upload server for [@prisma-cms](https://github.com/prisma-cms)

### Usage

#### Standalone

```
git clone https://github.com/prisma-cms/upload-module
cd upload-module
yarn
endpoint={NEW_PRISMA_ENDPOINT} yarn deploy
endpoint={CREATED_PRISMA_ENDPOINT} yarn start
```
Open in brouser http://localhost:4000

List of uploaded files:

```
query filesConnection{
  filesConnection(
    first: 5
  ){
    aggregate{
      count
    }
    edges{
      node{
        id
        path
        filename
        mimetype
        encoding
        hash
      }
    }
  }
}
```

#### Use as module for [@prisma-cms/boilerplate](https://github.com/prisma-cms/boilerplate)

Just add as module in mergeModules here: https://github.com/prisma-cms/boilerplate/blob/master/src/server/modules/index.mjs

#### Use [uploader](https://github.com/prisma-cms/uploader) component

```
git clone https://github.com/prisma-cms/uploader
cd uploader
yarn
yarn start
```
Open in brouser http://localhost:3000

Note that upload-module should work on port 4000 or configure [proxySetup](https://github.com/prisma-cms/uploader/blob/master/src/setupProxy.js).
