# [1.0.0-next.3](https://github.com/nabla-studio/nablajs/compare/keyring-v1.0.0-next.2...keyring-v1.0.0-next.3) (2022-12-28)


### Features

* **keyring:** :boom: improve mnemonic generation performance ([565531f](https://github.com/nabla-studio/nablajs/commit/565531fb46b4bcf83f5e7937d42a87673def44fa)), closes [#9](https://github.com/nabla-studio/nablajs/issues/9)
* **keyring:** :sparkles: add support for bip85 async fromMnemonic ([93329f6](https://github.com/nabla-studio/nablajs/commit/93329f62df120832b6a07749835837faff824ad0)), closes [#9](https://github.com/nabla-studio/nablajs/issues/9)

# [1.0.0-next.2](https://github.com/nabla-studio/nablajs/compare/keyring-v1.0.0-next.1...keyring-v1.0.0-next.2) (2022-12-20)


### Features

* **keyring:** :sparkles: add basic setup for mobx and removed hash field ([c567e43](https://github.com/nabla-studio/nablajs/commit/c567e43b42437b8e33bd3e301562661e1c32101e)), closes [#4](https://github.com/nabla-studio/nablajs/issues/4)
* **keyring:** :sparkles: add computed and autorun properties ([73c0ba3](https://github.com/nabla-studio/nablajs/commit/73c0ba3850398c1aa7fe8e81619799fcf83a2d5a)), closes [#4](https://github.com/nabla-studio/nablajs/issues/4)
* **keyring:** :sparkles: add flow instead of async/await ([641f104](https://github.com/nabla-studio/nablajs/commit/641f1048bb51acc486cb3e7a12363bb9651ee5a6)), closes [#4](https://github.com/nabla-studio/nablajs/issues/4)
* **keyring:** :sparkles: add mnemonic generation from master ([ed00069](https://github.com/nabla-studio/nablajs/commit/ed000693071679ccb794263b9aff56ec00ff498a)), closes [#3](https://github.com/nabla-studio/nablajs/issues/3)
* **keyring:** :sparkles: add optional metadata for mnemonic storage ([e0dadd1](https://github.com/nabla-studio/nablajs/commit/e0dadd13248f515a257d03203ea3fb7a8fcc10b0)), closes [#2](https://github.com/nabla-studio/nablajs/issues/2)
* **keyring:** add data response for I/O operations ([db6972e](https://github.com/nabla-studio/nablajs/commit/db6972eb9f0358640b20187dff44ac5e8ed0d25d))

# 1.0.0-next.1 (2022-12-06)


### Bug Fixes

* **keyring:** :bug: fix edit mnemonic method ([cd9e962](https://github.com/nabla-studio/nablajs/commit/cd9e9627b47404f206fc3a6a6fc82ca0c684ccec))
* **keyring:** :bug: fix empty function return ([7a2f7ff](https://github.com/nabla-studio/nablajs/commit/7a2f7ff723a5b7ca8a4fca5265bc4734ef80466e))
* **keyring:** :bug: fix KeyringTesting decrypt data encoding from hex to utf8 ([b23f0dc](https://github.com/nabla-studio/nablajs/commit/b23f0dc71cdfe8c876fc7bb89edca1354f0c6589))
* **keyring:** :bug: fix TestKeyring decrypt method ([ed238a7](https://github.com/nabla-studio/nablajs/commit/ed238a76ebcab5cc5148876c2e6e9b0b2d176c5b))


### Features

* :sparkles: add basic layout for Keyring class ([7967a25](https://github.com/nabla-studio/nablajs/commit/7967a25f3e5a3ac8b12c35fbf1997555bcc704fe))
* :sparkles: add keyring package setup ([b52700f](https://github.com/nabla-studio/nablajs/commit/b52700f8c5eddabcdfa2bd6744b78a0d3dd655ad))
* :wrench: add more rules for prettier ([b2a2d58](https://github.com/nabla-studio/nablajs/commit/b2a2d582fbd69c3534583cccdd820625418c968a))
* **keyring:** :label: add keyring class generic ([ce945c1](https://github.com/nabla-studio/nablajs/commit/ce945c158e206d1481d18d382d2b1624714e7c4d))
* **keyring:** :label: add keyring storage types ([aed0220](https://github.com/nabla-studio/nablajs/commit/aed02200108503dea8d88c7055fb6bbfcc639c12))
* **keyring:** :sparkles: add changeCurrentMnemonic method ([9a0bee5](https://github.com/nabla-studio/nablajs/commit/9a0bee53da1b476972fa8acecf5d51981239e037))
* **keyring:** :sparkles: add deleteMnemonic method ([834c4bd](https://github.com/nabla-studio/nablajs/commit/834c4bd267828eddf39b73be9fc8185ac3c57799))
* **keyring:** :sparkles: add editMnemonic method ([0049c0c](https://github.com/nabla-studio/nablajs/commit/0049c0c252ebef9622cc0f9d2c17e4c955927fae))
* **keyring:** :sparkles: add empty method ([1418d0e](https://github.com/nabla-studio/nablajs/commit/1418d0ecb865304a321499cf52d68e05cbab2b73))
* **keyring:** :sparkles: add getAllMnemonics method ([8c4ad2c](https://github.com/nabla-studio/nablajs/commit/8c4ad2cb577c3d7f3e52f043dd61696c6db7543e))
* **keyring:** :sparkles: add hash related methods ([133037f](https://github.com/nabla-studio/nablajs/commit/133037f543e8536fd295f9e5d477c44d56c77e3a))
* **keyring:** :sparkles: add keyring storage schema ([cb0259d](https://github.com/nabla-studio/nablajs/commit/cb0259df175f16803626de251b31124c3f07d467))
* **keyring:** :sparkles: add lock method and index switch on delete mnemonic ([a1fa507](https://github.com/nabla-studio/nablajs/commit/a1fa50776f3be8ac772a4fcde287fc3ee11ca9b0))
* **keyring:** :sparkles: add save mnemonic method ([f32cc6a](https://github.com/nabla-studio/nablajs/commit/f32cc6a4b2787fde8a292353846a37060487f39d))
* **keyring:** :sparkles: add unlock, init methods and refactoring ([4a82097](https://github.com/nabla-studio/nablajs/commit/4a8209747b91cb45d8d8acd4d04ef6ba987078cd))
* **keyring:** :sparkles: implemented passphrase field as hash name ([245e1b2](https://github.com/nabla-studio/nablajs/commit/245e1b2d142ad1ba8438a3ba5fc79497e94bc1ba))
* **keyring:** :sparkles: improved the keyring structure with the use of generics ([180c3a3](https://github.com/nabla-studio/nablajs/commit/180c3a344042b5f6d840036bb49ff070ec45600c))
* **keyring:** :sparkles: update read, save and delete abstract methods ([0b2ecf5](https://github.com/nabla-studio/nablajs/commit/0b2ecf5efcdf5eaffd6287a2401a37b217e9cc19))