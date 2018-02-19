nodex-ws will be a Node.js + Websockets library for the bitshares dex allowing developers who do not want to use python to jump into writing trading applications.
Disclaimer: Nobody has taught me node or websockets. Should be some ugly fun but that is why we iterate.

# Things I want in this library

- [x] authenticate with any account (web)
- [x] list the balances of accounts
- [ ] send money to other accounts
- [x] obtain list of specified assets
- [ ] obtain a list of all assets
- [ ] obtain a list of all asset pairs
- [x] obtain a list of asset pairs based on specified assets
- [x] check the ticker price of any asset pair
- [x] check the limit orders of any asset pair
- [ ] check the buys and sells of accounts
- [ ] manage buys and sells for any asset pair

# wishlist (and maybe not belonging in this library)

- [ ] authenticate with other methods
- [ ] check the state of margins for accounts
- [ ] manage margins for accounts
- [ ] a hookable/actionable event system for all actions (eg. monitoring margins and taking action)
- [ ] use the first public working or configured (and working) dex rpc node.
- [ ] Structure and organization of code meeting an actually specified standard.
- [ ] An interface for data storage is needed to reduce repeat calls to api for basic information
- [ ] Determine the price of an asset pair with a seperate base. eg: usd price of bts:cny pair
- [ ] Changes or a sister library will be required to use this directly on websites

# Libraries used

- websockets/ws - https://github.com/websockets/ws
- dotenv - https://github.com/motdotla/dotenv
- request-json - https://github.com/cozy/request-json
- collections - https://github.com/montagejs/collections