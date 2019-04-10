/* eslint-disable */
const nacl = require('tweetnacl')
const argon = require('./argon2.js');
// import * as argon2 from './argon2.js'
import uuid from 'uuid'
// const bs58check = require('bs58check')
import { encodeBase58Check } from '@aeternity/aepp-sdk/es/utils/crypto'

const DERIVED_KEY_FUNCTIONS = {
  argon2id: deriveKeyUsingArgon2id,
};

const DEFAULTS = {
  crypto: {
    secret_type: 'ed25519',
    symmetric_alg: 'xsalsa20-poly1305',
    kdf: 'argon2id',
    kdf_params: {
      memlimit_kib: 65536,
      opslimit: 3,
      parallelism: 1,
    },
  },
};

async function deriveKeyUsingArgon2id(password, salt, options) {
  const { memlimit_kib: memoryCost, parallelism, opslimit: timeCost } = options.kdf_params;
  const argon2 = window.argon2;
  return argon2.hash({ pass: password, time: timeCost, mem: memoryCost, parallelism, type: argon2.ArgonType.Argon2id, salt, hashLen: 32 });
}

function encrypt(plaintext, key, nonce, algo = DEFAULTS.crypto.symmetric_alg) {
  if (!CRYPTO_FUNCTIONS[algo]) throw new Error(algo + ' is not available');
  return CRYPTO_FUNCTIONS[algo].encrypt({ plaintext, nonce, key });
}

function marshal(name, derivedKey, privateKey, nonce, salt, options = {}) {
  const opt = Object.assign({}, DEFAULTS.crypto, options);
  const test = Object.assign(
    { name, version: 1, public_key: getAddressFromPriv(privateKey), id: uuid.v4() },
    {
      crypto: Object.assign(
        {
          secret_type: opt.secret_type,
          symmetric_alg: opt.symmetric_alg,
          ciphertext: Buffer.from(encrypt(Buffer.from(privateKey), derivedKey.hash, nonce, opt.symmetric_alg)).toString('hex'),
          cipher_params: { nonce: Buffer.from(nonce).toString('hex') },
        },
        { kdf: opt.kdf, kdf_params: { ...opt.kdf_params, salt: Buffer.from(salt).toString('hex') } }
      ),
    }
  );
  return test;
}

function isHex(str) {
  return !!(str.length % 2 === 0 && str.match(/^[0-9a-f]+$/i));
}

/**
 * Check whether a string is valid base-64.
 * @param {string} str String to validate.
 * @return {boolean} True if the string is valid base-64, false otherwise.
 */
function isBase64(str) {
  let index;
  // eslint-disable-next-line no-useless-escape
  if (str.length % 4 > 0 || str.match(/[^0-9a-z+\/=]/i)) return false;
  index = str.indexOf('=');
  return !!(index === -1 || str.slice(index).match(/={1,2}/));
}

function str2buf(str, enc) {
  if (!str || str.constructor !== String) return str;
  if (!enc && isHex(str)) enc = 'hex';
  if (!enc && isBase64(str)) enc = 'base64';
  return Buffer.from(str, enc);
}

export function getAddressFromPriv(secret) {
  const keys = nacl.sign.keyPair.fromSecretKey(str2buf(secret));
  const publicBuffer = Buffer.from(keys.publicKey);
  return `ak_${encodeBase58Check(publicBuffer)}`;
}

export async function dump(name, password, privateKey, nonce = nacl.randomBytes(24), salt = nacl.randomBytes(16), options = {}) {
  const opt = Object.assign({}, DEFAULTS.crypto, options);
  return marshal(name, await deriveKey(password, salt, opt), privateKey, nonce, salt, opt);
}

async function deriveKey(
  password,
  nonce,
  options = {
    kdf_params: DEFAULTS.crypto.kdf_params,
    kdf: DEFAULTS.crypto.kdf,
  }
) {
  if (typeof password === 'undefined' || password === null || !nonce) {
          throw new Error('Must provide password and nonce to derive a key');
  }

  if (!DERIVED_KEY_FUNCTIONS.hasOwnProperty(options.kdf)) throw new Error('Unsupported kdf type');

  return DERIVED_KEY_FUNCTIONS[options.kdf](password, nonce, options);
}

// CRYPTO PART
const CRYPTO_FUNCTIONS = {
  'xsalsa20-poly1305': { encrypt: encryptXsalsa20Poly1305, decrypt: decryptXsalsa20Poly1305 },
};

function encryptXsalsa20Poly1305({ plaintext, key, nonce }) {
  return nacl.secretbox(plaintext, nonce, key);
}

function decryptXsalsa20Poly1305({ ciphertext, key, nonce }) {
  const res = nacl.secretbox.open(ciphertext, nonce, key);
  if (!res) throw new Error('Invalid password or nonce');
  return res;
}