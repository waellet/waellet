/* eslint-disable */
import { dump, generateEncryptedWallet } from './keystore'
import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'
import { getHdWalletAccount } from './hdWallet';

const nacl = require('tweetnacl')

export const addressGenerator = {
  generateKeyPair,
  importPrivateKey
}

export function printUnderscored (key, val) {
  print(`${key}${R.repeat('_', WIDTH - key.length).reduce((a, b) => a += b, '')} ${typeof val !== 'object' ? val : JSON.stringify(val)}`)
} 


async function generateKeyPair (passphrase, privateKey, address) {
  const hexStr = await Crypto.hexStringToByte(privateKey.trim())
  const keys = await Crypto.generateKeyPairFromSecret(hexStr)
  // const keystore = await dump('keystore', passphrase, keys.secretKey);
  const keystore = await generateEncryptedWallet('keystore', passphrase, keys.secretKey)
  console.log(keystore)
  keystore.public_key = address;
  return {
    publicKey: keystore.public_key,
    encryptedPrivateKey: JSON.stringify(keystore)
  };
}

async function importPrivateKey (passphrase, secretKey, address) {
  const hexStr = await Crypto.hexStringToByte(secretKey.trim())
  const keys = await Crypto.generateKeyPairFromSecret(hexStr)

  // const keystore = await dump('keystore', passphrase, keys.secretKey);
  const keystore = await generateEncryptedWallet('keystore', passphrase, keys.secretKey)
  console.log(keystore)

  keystore.public_key = address;
  return {
    publicKey: keystore.public_key,
    encryptedPrivateKey: JSON.stringify(keystore),
  };
}
