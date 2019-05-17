/* eslint-disable */
// import { dump } from './keystore'
import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'
// import { dump } from '@aeternity/aepp-sdk/es/utils/keystore'
import { dump, getAddressFromPriv, recover } from '@aeternity/aepp-sdk/es/utils/keystore'

const nacl = require('tweetnacl')
const bs58check = require('bs58check')
const bip38 = require('./bip38');


export const addressGenerator = {
  generateKeyPair,
  importPrivateKey
}

export function printUnderscored (key, val) {
  print(`${key}${R.repeat('_', WIDTH - key.length).reduce((a, b) => a += b, '')} ${typeof val !== 'object' ? val : JSON.stringify(val)}`)
}

async function generateKeyPair (passphrase) {
  const keyPair = nacl.sign.keyPair()
  const publicBuffer = Buffer.from(keyPair.publicKey)
  const secretBuffer = Buffer.from(keyPair.secretKey)
  const hexStr = await Crypto.hexStringToByte(secretBuffer.toString('hex').trim())
  const keys = await Crypto.generateKeyPairFromSecret(hexStr)

  const keystore = await dump('keystore', passphrase, keys.secretKey);
  return {
    publicKey: keystore.public_key,
    secretKey: secretBuffer.toString('hex').trim(), // NOT SECURE
    encryptedPrivateKey: JSON.stringify(keystore),
  };
}

async function importPrivateKey (passphrase, secretKey) {
  const hexStr = await Crypto.hexStringToByte(secretKey.trim())
  const keys = await Crypto.generateKeyPairFromSecret(hexStr)

  const keystore = await dump('keystore', passphrase, keys.secretKey);
  return {
    publicKey: keystore.public_key,
    secretKey: secretKey.trim(), // NOT SECURE
    encryptedPrivateKey: JSON.stringify(keystore),
  };
}
