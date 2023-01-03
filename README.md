**nabla JS**
&middot;
[![nablaJS is made with nx](https://img.shields.io/badge/Made%20with-nx-blue)](https://github.com/nrwl/nx)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/nabla-studio/nablajs/tree/main/docs)
[![Chat on Discord](https://img.shields.io/badge/chat-on%20discord-orange)](https://discord.gg/WzXYRd3AwH)
[![Follow @nabla_hq](https://img.shields.io/twitter/follow/nabla_hq.svg?label=Follow%20@nabla_hq)](https://twitter.com/intent/follow?screen_name=nabla_hq)
=====

![Enabling business to Web3](docs/assets/images/nabla_js_dark.png#gh-dark-mode-only)
![Enabling business to Web3](docs/assets/images/nabla_js_light.png#gh-light-mode-only)

A super lightweight, minimal and extra secure wallet for creating and storing
mnemonic phrases to interact with the whole
[Cosmos Ecosystem](https://cosmos.network/).

## 🛠️ What is nabla JS?

It is a set of packages to provide utilities built in javascript and compatible with react native.

They're all made up to work with the whole [Cosmos Ecosystem](https://cosmos.network/).

## 📦 Packages

nabla JS is composed of the following packages:

1. [@nabla-studio/wif](packages/wif/README.md) a safe and fast implementation of bitcoin wallet import format encoding/decoding module.

2. [@nabla-studio/utils](packages/utils/README.md) a set of utilities that can be reused in different packages.

3. [@nabla-studio/keyring](packages/keyring/README.md) it is a collection of components that store mnemonics and make them available to other services or applications (such as signer ecc.).

4. [@nabla-studio/rn-keyring](packages/rn-keyring/README.md) a safe and fast implementation of [@nabla-studio/keyring](packages/keyring/README.md) for react native, by using native API.

5. [@nabla-studio/bip85](packages/bip85/README.md) a safe and fast implementation of [BIP85](https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki).

6. [@nabla-studio/rn-bip85](packages/bip85/README.md) a safe and fast implementation of [BIP85](https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki) for react native.

## 📖 Docs

[Docs](./docs/README.md) are available through this repo. They are specified information about packages usage and implementation.

## 🚀 Dev enviroment requirements

- Node.js >= 16.19.0

## ⚙️ Usage

1. Clone the project

```bash
  git clone https://github.com/nabla-studio/nablajs.git
```

2. Go to the project directory

```bash
  cd nablajs
```

3. Install dependencies

```bash
  pnpm i
```

4. Build packages

```bash
  npx nx affected --target build --parallel 4
```

5. Test packages

```bash
  npx nx affected --target test --parallel 4
```

## 🔁 Versioning

nabla JS makes use of [SemVer](http://semver.org/) to determine when and how the version changes.

## 🆘 Support

The first point of contact should be our
[Discord](https://discord.gg/WzXYRd3AwH) server. Ask your questions about bugs
or specific use cases, and someone from the core team will answer. Or, if you
prefer, open an [issue](https://github.com/nabla-studio/nablajs/issues) on
our GitHub repo.

## 👨‍💻 Authors

- `Davide Segullo` [@DavideSegullo](https://github.com/DavideSegullo)

- `Giorgio Nocera` [@giorgionocera](https://github.com/giorgionocera)

## 📜 License

This software is provided together with a license. All rights are reserved.

Copyright © 2023 [nabla](https://github.com/nabla-studio).
