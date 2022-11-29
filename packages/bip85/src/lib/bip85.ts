import { base58 } from '@scure/base';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeed, entropyToMnemonic } from '@scure/bip39';
import { sha256 } from '@noble/hashes/sha256';
import { hmac } from '@noble/hashes/hmac';

// wif https://github.com/bitcoinjs/wif/blob/master/index.js
// TODO: create custom wif

export class BIP85 {}
