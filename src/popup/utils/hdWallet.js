import { derivePathFromKey, getKeyPair } from '@aeternity/hd-wallet/src/hd-key';
import { Crypto } from '@aeternity/aepp-sdk/es';
import { generateHDWallet } from '@aeternity/hd-wallet/src';


export const generateHdWallet = (seed) => {
    
    if(typeof seed == 'string' ) {
        seed = Buffer.from(seed,'hex');
    }

    return generateHDWallet(seed);
}

export const getHdWalletAccount = (wallet, accountIdx = 0) => {
    
    if(wallet.chainCode.constructor !== Uint8Array) {
        wallet = JSON.parse(JSON.stringify(wallet));
        wallet = {
            chainCode:new Uint8Array(new Uint8Array(Object.values(wallet.chainCode))),
            privateKey:new Uint8Array(new Uint8Array(Object.values(wallet.privateKey)))
        }
    }
    
    const keyPair = getKeyPair(derivePathFromKey(`${accountIdx}h/0h/0h`, wallet).privateKey);
    
    return {
        ...keyPair,
        idx:accountIdx,
        address: Crypto.aeEncodeKey(keyPair.publicKey)
    };
}